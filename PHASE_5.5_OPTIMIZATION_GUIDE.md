# Phase 5.5: iOS/Android Performance Tuning Guide

## Targets
- **30+ fps on mid-range** (iPhone SE, Pixel 4a)
- **60 fps on modern devices** (iPhone 14, Pixel 6)
- Memory: < 150MB heap on mid-range

## Implementation Checklist

### 1. AI Tick Rate Optimization ✓ IMPLEMENTED

**File:** `apps/web/src/game/characters/fang/FangAITickOptimizer.ts`

**Integration into RagingCityVerticalSliceScene.tsx:**

```typescript
// At top of file
import { globalAITickManager } from '../../game/characters/fang/FangAITickOptimizer';

// In VerticalSliceEnvironment component, at start of useFrame:
useFrame((frameState, rawDelta) => {
  // ... existing code ...
  
  // BEFORE: Process all Fang AIs every frame
  // AFTER: Only process those due for updates
  
  for (const fangState of mission.combatants) {
    const fangObject = fangRefs.current.get(fangState.id);
    if (!fangObject) continue;

    // NEW: Check if this AI should update
    if (!globalAITickManager.shouldUpdateAI(fangState)) {
      continue; // Skip AI update, but still update position/rendering
    }

    // Existing AI update code
    const aiResult = updateFangCombatantAI(
      fangState,
      { x: playerPos.x, y: playerPos.y, z: playerPos.z },
      delta,
      currentTime
    );

    // Mark AI as updated
    globalAITickManager.markAIUpdated(fangState);
    
    // ... rest of existing code ...
  }

  // Advance tick manager (call once per frame)
  globalAITickManager.advanceFrame();
});
```

**Expected Impact:** 30-40% reduction in AI simulation time for encounters with 5+ scout-type enemies.

### 2. Mobile Render Optimization ✓ IMPLEMENTED

**File:** `apps/web/src/lib/threejs/MobileRenderOptimizer.ts`

**Integration into PerformanceOptimizer.tsx:**

```typescript
import { MobileRenderOptimizer } from '../../../lib/threejs/MobileRenderOptimizer';

export function PerformanceOptimizer({ config = {}, onQualityChange }: PerformanceOptimizerProps) {
  const { gl, scene } = useThree();
  const mergedConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);
  const updateRef = useRef<number>();
  
  // NEW: Create mobile render optimizer
  const mobileOptimizerRef = useRef<MobileRenderOptimizer | null>(null);
  
  useEffect(() => {
    // Initialize optimizer
    mobileOptimizerRef.current = new MobileRenderOptimizer(gl, scene);
  }, [gl, scene]);

  useEffect(() => {
    const animationLoop = () => {
      performanceMonitor.update();
      performanceMonitor.adjustQualityDynamic(mergedConfig);

      const newQuality = performanceMonitor.getQuality();
      const fps = performanceMonitor.getFPS();
      
      // NEW: Update mobile optimizer
      if (mobileOptimizerRef.current) {
        mobileOptimizerRef.current.update(fps);
      }
      
      onQualityChange?.(newQuality);

      updateRef.current = requestAnimationFrame(animationLoop);
    };

    updateRef.current = requestAnimationFrame(animationLoop);

    return () => {
      if (updateRef.current) {
        cancelAnimationFrame(updateRef.current);
      }
    };
  }, [mergedConfig, onQualityChange]);

  // Existing shadow setup (now replaced by MobileRenderOptimizer)
  useEffect(() => {
    if (!mobileOptimizerRef.current) {
      // Fallback if optimizer not ready
      gl.shadowMap.enabled = true;
      gl.shadowMap.type = THREE.PCFShadowMap;
    }
  }, [gl, scene]);

  return null;
}
```

**Expected Impact:** Dynamic shadow resolution adjustment saves 15-25% GPU time on mobile.

### 3. Shadow Map Optimization

**Current Setup:** 1024x1024 shadows for all devices

**Optimization:**
```
Mobile (< 768px):  512x512 baseline → 256x256 under load
Tablet (768-1024): 1024x1024 baseline → 512x512 under load
Desktop (> 1024):  1024x1024 → 2048x2048 with headroom
```

**Manual Override (if needed):**
```typescript
// In Canvas gl setup or RagingCityVerticalSliceScene
<Canvas shadows shadowMap={{ type: THREE.BasicShadowMap }} >
  {/* BasicShadowMap uses less fillrate than PCF variants */}
</Canvas>
```

### 4. Asset LOD System

**File Status:** `apps/web/src/lib/threejs/ModelLODSystem.ts` (EXISTING)

**Activate for Fang Models:**

```typescript
// In FangCombatantVisual.tsx
import { getLODModelPath } from '../../../../lib/threejs/ModelLODSystem';

function FangModelContent({ state }: { state: FangCombatantState }) {
  const cameraPos = useThree().camera.position;
  const distanceToCamera = state.position.distanceTo(cameraPos);
  
  // CHANGE: Use LOD model path instead of hardcoded path
  const modelPath = getLODModelPath('kai-jax', distanceToCamera);
  const { scene } = useGLTF(modelPath);
  
  // ... rest of component
}
```

**LOD Thresholds (Mobile):**
- 0-2 units: Full detail (100%)
- 2-5 units: Optimized (50%)
- 5+ units: Low detail (25%)

**Expected Impact:** 20-30% geometry reduction for distant enemies.

### 5. Memory Leak Detection

**Testing:** Run `phase-5.5-performance-profiling.spec.ts`

```bash
npm run test:e2e -- phase-5.5-performance-profiling.spec.ts
```

**Monitoring Code (add to RagingCityVerticalSliceScene):**

```typescript
// In useFrame, periodically log memory
if (perf.hudElapsed >= 1.0) { // Every second
  perf.hudElapsed = 0;
  
  if ('memory' in performance) {
    const heapUsed = (performance as any).memory.usedJSHeapSize / 1024 / 1024;
    console.log(`[Memory] Heap: ${heapUsed.toFixed(1)}MB | Combatants: ${mission.combatants.length}`);
  }
}
```

**Expected Pattern:** Stable ±10MB variance during combat. If monotonic increase > 2MB/sec, investigate leaks.

### 6. Draw Call Analysis

**Bottleneck Identification:**

```typescript
// Add to RagingCityVerticalSliceScene debug output
const stats = (window as any).__THREECAM || { calls: 0 };
console.log(`Draw calls: ${stats.calls}, Triangles: ${stats.triangles}`);
```

**Batching Opportunities:**
1. **Fang Models:** Clone() API adds overhead. Use instancing for 8+ similar enemies.
2. **Telegraph/Stagger Effects:** Batch geometric primitives (torus, sphere) per update.
3. **Lights:** Point lights kill mobile performance. Limit to 3-4 active lights.

**Emergency Optimization (if < 20 fps):**
```typescript
// Disable non-critical visual effects
state.behavior === 'WINDUP' && false // Disable telegraph animation
state.isStaggered && false             // Disable stagger visual
```

## Testing & Validation

### Phase 5.5 Profiling Tests

```bash
npm run test:e2e -- phase-5.5-performance-profiling.spec.ts
```

**Metrics Collected:**
- FPS (avg, max, p95, p99)
- Frame time distribution
- Memory (heap, WebGL texture)
- Draw calls
- AI tick rates

### Playwright Performance Benchmarks

Run on simulated mobile devices:
```bash
npm run test:e2e -- --project "chromium" -- --device "iPhone SE"
```

### Baseline Performance Targets

| Device | Current | Target | Gap |
|--------|---------|--------|-----|
| iPhone SE | ~20 fps | 30 fps | +50% |
| Pixel 4a | ~22 fps | 30 fps | +36% |
| iPhone 14 | ~50 fps | 60 fps | +20% |

## Optimization Priority (by impact)

1. **AI Tick Optimization** (30-40% impact)
   - Easiest to implement
   - Largest performance gain
   - No visual quality loss for scouts
   - **Effort: 1 day**

2. **Dynamic Shadow Resolution** (15-25% impact)
   - Medium complexity
   - Automatic based on FPS
   - Imperceptible quality change
   - **Effort: 2 days**

3. **Asset LOD** (20-30% impact)
   - Requires asset preprocessing
   - Requires Blender optimization script
   - **Effort: 3 days (includes asset work)**

4. **Memory Optimization** (5-10% impact)
   - Profiling & debugging
   - Identify specific leaks
   - **Effort: 2-3 days**

5. **Batching/Instancing** (10-15% impact)
   - Architectural changes
   - Three.js API specific
   - **Effort: 3-4 days**

## Quick Wins (< 4 hours)

1. **Disable expensive materials on mobile:**
   ```typescript
   material.aoMap = null;
   material.normalMap = null; // Mobile devices rarely show difference
   ```

2. **Reduce point light count:**
   - Limit to 1-2 active lights in combat
   - Use cheap ambient light

3. **Disable particle effects on mobile:**
   ```typescript
   const quality = useQualityLevel();
   if (quality < 0.5) return null; // Skip effect
   ```

4. **Reduce animation skeleton update frequency:**
   - Skip model animation updates when off-screen
   - Use simplified rigs for distant Fangs

## Debugging Tools

### Enable performance monitoring in browser
```javascript
// In browser console while game running
window.__perfMonitor?.frameTimes.slice(-60) // Last 60 frames
window.__renderer?.info?.render?.calls      // Current draw calls
performance.memory                           // Heap usage
```

### Debug shadow resolution changes
```typescript
// In PerformanceOptimizer or MobileRenderOptimizer
console.log(`Shadow resolution: ${shadowManager.getResolution()}px @ ${fps.toFixed(1)} fps`);
```

### Profile render time per component
```typescript
const t0 = performance.now();
// ... render code ...
const t1 = performance.now();
console.log(`Render time: ${(t1 - t0).toFixed(2)}ms`);
```

## Phase Completion Criteria

- [ ] AI tick optimization implemented & tested
- [ ] Dynamic shadow resolution working on mobile
- [ ] LOD system activated for Fang models
- [ ] Memory stable (no leaks detected)
- [ ] Profiling tests passing (30+fps on mid-range)
- [ ] No visual artifacts from optimizations
- [ ] Documented changes in CLAUDE.md
- [ ] PR review with mobile device testing

## References

- Three.js Performance: https://threejs.org/docs/#manual/en/introduction/How-to-dispose-of-objects
- WebGL Profiling: https://www.khronos.org/webgl/wiki/Debugging
- Mobile Web Performance: https://web.dev/performance/
- React Three Fiber Optimization: https://docs.pmnd.rs/react-three-fiber/advanced/performance

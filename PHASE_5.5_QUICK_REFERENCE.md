# Phase 5.5 Quick Reference Card

## 🎯 Goals
- **30+ fps** on iPhone SE (mid-range) / Pixel 4a
- **60 fps** on iPhone 14 (modern)
- No combat logic changes

## 📊 Performance Bottlenecks (in order of impact)

1. **AI Updates** (30-40% of frame budget on mobile)
   - Currently: All 5-10 Fangs update every frame
   - Target: Scouts update every 2-3 frames

2. **Shadow Maps** (15-25% of frame budget)
   - Currently: 1024x1024 fixed resolution
   - Target: Dynamic 256-1024 based on FPS

3. **Geometry Detail** (20-30% impact)
   - Currently: Full detail always
   - Target: LOD system for distant enemies

4. **Texture Memory** (5-10% if exceeded)
   - Currently: No memory tracking
   - Target: Monitor and downscale if needed

5. **Draw Calls** (10-15% if unoptimized)
   - Currently: Per-Fang rendering
   - Target: Batch when possible

## 🚀 Quick Integration (< 4 hours)

### 1. AI Tick Optimization (30-40% gain)
```typescript
// apps/web/src/components/game/RagingCityVerticalSliceScene.tsx

import { globalAITickManager } from '../../game/characters/fang/FangAITickOptimizer';

// In useFrame loop (around line 358-385)
for (const fangState of mission.combatants) {
  // NEW: Skip AI if not due for update
  if (!globalAITickManager.shouldUpdateAI(fangState)) {
    continue; // Still update position/rendering, just skip AI
  }

  // ... existing AI update code ...
  const aiResult = updateFangCombatantAI(...);
  
  // Mark as updated
  globalAITickManager.markAIUpdated(fangState);
}

// At end of useFrame (after all Fangs processed)
globalAITickManager.advanceFrame();
```

**Tick Rates by Archetype:**
- `baseline`: Every 3 frames (~50ms)
- `razor-scout`: Every 2 frames (~33ms)
- `enforcer`: Every frame (aggressive)
- `chain-bruiser`: Every frame (dangerous)
- `district-lieutenant`: Every frame (boss)

### 2. Mobile Render Optimization (15-25% gain)
```typescript
// apps/web/src/components/game/performance/PerformanceOptimizer.tsx

import { MobileRenderOptimizer } from '../../../lib/threejs/MobileRenderOptimizer';

const mobileOptimizerRef = useRef<MobileRenderOptimizer | null>(null);

useEffect(() => {
  mobileOptimizerRef.current = new MobileRenderOptimizer(gl, scene);
}, [gl, scene]);

// In animation loop
mobileOptimizerRef.current?.update(fps);
```

### 3. Performance Monitoring (visibility)
```typescript
// In RagingCityVerticalSliceScene or anywhere
import { usePerformanceMonitoring } from '../../components/game/performance/Phase55OptimizationHooks';

const { getReport } = usePerformanceMonitoring();

// Periodically log
const report = getReport();
console.log(`FPS: ${report.averageFPS}, Memory: ${report.memoryHeapUsedMb}MB`);
```

## 📱 Device Configurations

### Mobile (width < 768px)
```javascript
{
  targetFPS: 30,
  shadowResolution: 256-512,
  aiTickInterval: 2-3,
  disableExpensiveEffects: true,
}
```

### Tablet (768-1024px)
```javascript
{
  targetFPS: 60,
  shadowResolution: 512-1024,
  aiTickInterval: 1,
  disableExpensiveEffects: false,
}
```

### Desktop (> 1024px)
```javascript
{
  targetFPS: 60,
  shadowResolution: 1024-2048,
  aiTickInterval: 1,
  disableExpensiveEffects: false,
}
```

## 🔍 Debugging

### Check AI Tick Status
```javascript
// Browser console
globalAITickManager.getCurrentFrame()
globalAITickManager.shouldUpdateAI(combatant)
globalAITickManager.getOptimizationPercentage(['baseline', 'enforcer'])
```

### Monitor Shadows
```javascript
globalProfiler.getReport().shadowResolution
```

### Check Memory
```javascript
const heap = (performance as any).memory.usedJSHeapSize / 1024 / 1024;
console.log(`Heap: ${heap}MB`);
```

### Profile Frame Times
```javascript
const samples = globalProfiler.getRecentSamples(60);
console.log('Frame times (ms):', samples.map(s => s.frameTime));
```

## 📈 Expected Improvements

| Optimization | Impact | Device | Effort |
|---|---|---|---|
| AI Ticking | +30-40% FPS | Mobile | 30min |
| Shadow Maps | +15-25% FPS | Mobile | 1hr |
| Asset LOD | +20-30% FPS | All | 3-4 days |
| Memory Leak Fixes | +5-10% Stability | All | 2-3 days |
| Batching | +10-15% FPS | All | 3-4 days |

## ✅ Testing Checklist

### Before Deployment
- [ ] Run profiling tests: `npm run test:e2e -- phase-5.5-performance-profiling.spec.ts`
- [ ] Verify > 30fps on iPhone SE / Pixel 4a simulators
- [ ] Check memory stays < 150MB on mobile
- [ ] Confirm no visual artifacts
- [ ] Combat logic unchanged (no hit damage changes)

### After Deployment
- [ ] Monitor real device metrics (iOS TestFlight, Play Store beta)
- [ ] Track crash rates (memory pressure)
- [ ] Gather user feedback on performance
- [ ] A/B test if possible

## 🛑 Disable Optimizations (Rollback)

1. Remove `globalAITickManager` calls
2. Remove `MobileRenderOptimizer` instantiation
3. Remove monitoring hooks
4. No changes to core files needed

## 📚 File Structure

```
apps/web/src/
├── game/characters/fang/
│   └── FangAITickOptimizer.ts         ← NEW: AI optimization
├── lib/threejs/
│   ├── MobileRenderOptimizer.ts       ← NEW: Render optimization
│   └── PerformanceProfiling.ts        ← NEW: Profiling tools
└── components/game/performance/
    ├── PerformanceOptimizer.tsx       ← UPDATE: Add MobileRenderOptimizer
    ├── RagingCityVerticalSliceScene.tsx ← UPDATE: Add AI tick manager
    └── Phase55OptimizationHooks.ts    ← NEW: Integration hooks

apps/web/e2e/
└── phase-5.5-performance-profiling.spec.ts ← NEW: Performance tests
```

## 💡 Pro Tips

1. **Start with AI optimization** - Highest ROI, easiest to implement
2. **Use performance hooks** - Pre-built React integration reduces bugs
3. **Monitor on real devices** - Simulators don't match real performance
4. **Test with multiple enemy counts** - Performance scales with encounter size
5. **Keep commit history** - Easy to rollback if issues arise

## 🔗 Key Files

- **Optimization Guide:** `PHASE_5.5_OPTIMIZATION_GUIDE.md`
- **Implementation Summary:** `PHASE_5.5_IMPLEMENTATION_SUMMARY.md`
- **Profiling Tests:** `apps/web/e2e/phase-5.5-performance-profiling.spec.ts`
- **Integration Hooks:** `apps/web/src/components/game/performance/Phase55OptimizationHooks.ts`

## 📞 Support

- Performance tools: See `PerformanceProfiling.ts` for API docs
- Optimization questions: See `PHASE_5.5_OPTIMIZATION_GUIDE.md`
- Implementation issues: Check integration examples in this guide

---

**Last Updated:** 2026-09-12
**Phase Status:** Ready for Implementation
**Estimated Timeline:** 2-3 weeks for full deployment

# Kai Performance Baseline - Day 2

**Date:** Sept 7, 2026  
**Status:** Ready for full profiling with browser DevTools  
**Scene:** Kai test scene (`http://localhost:3000/?mode=kai-test`)  
**Measurement:** Not yet collected - requires Chrome DevTools Performance tab

---

## Profiling Checklist

### Performance Data to Collect

Use Chrome DevTools → Performance tab to record:

```
1. Open http://localhost:3000/?mode=kai-test
2. Open DevTools (F12)
3. Go to Performance tab
4. Click record (⏺️)
5. Perform 30 seconds:
   - Walk (WASD)
   - Run (Shift + WASD)
   - Attack (J or X)
   - Dodge (Space)
   - Combo attacks
6. Stop recording
```

### Metrics to Extract

**Frame Rate:**
- Average FPS
- Min FPS (worst frame)
- Max FPS (best frame)
- Frame time std dev

**Rendering:**
- Draw calls per frame
- Triangles rendered
- Texture memory usage
- Shader time

**JavaScript:**
- JS execution time per frame
- Animation mixer updates
- Input handling time
- Physics calculations

**Memory:**
- Heap size
- Retained objects
- Texture memory
- Model memory (GLB size)

---

## Theoretical Performance Estimates

Based on code analysis (not yet measured):

### Kai Mesh & Animation
- **Model:** Procedural spider (fallback) or GLB (if available)
- **Triangles:** ~2,000-5,000 (fallback is minimal)
- **Textures:** 1-2 per mesh
- **Animations:** 8-10 clips, 0.3s crossfade blend
- **Limb mesh updates:** Per frame, 4 limbs + body
- **Expected overhead:** ~0.5-1.0ms per frame (animation mixer)

### Combat System
- **Hitboxes:** Max 4 active (one per attack type)
- **Raycasts:** Wall detection only (disabled, ~1ms when enabled)
- **Audio:** Potential async if using Web Audio API
- **Expected overhead:** ~0.2-0.5ms per frame

### Venom System
- **Stacks:** 0-5 per entity
- **Damage accumulation:** Delta-scaled (frame-rate independent)
- **Timer management:** Per-entity
- **Expected overhead:** <0.1ms per frame

### Input System
- **Sources:** Keyboard, touch, gamepad (all read per frame)
- **Processing:** Normalize movement vector, detect state changes
- **Gamepad poll:** navigator.getGamepads() per frame (~0.1ms)
- **Expected overhead:** ~0.2-0.3ms per frame

### Three.js Canvas
- **Resolution:** 1280×720 (test), variable production
- **Lighting:** Basic (1-2 lights)
- **Shadows:** Minimal (no shadow casters on Kai)
- **Post-processing:** None (not yet implemented)
- **Expected overhead:** Canvas management ~1-2ms per frame

### Total Theoretical Overhead
- Kai alone: 2.0-3.5ms per frame (~300 FPS theoretical)
- At 60 FPS: 16.67ms frame budget available
- **Utilization:** ~12-21% of frame time
- **Headroom:** 77-88% for additional characters, effects, physics

---

## Target Performance Levels

### High-End (Desktop, WebGL 2, modern GPU)
- **Target:** 60 FPS stable
- **Frame time:** < 16.67ms
- **Quality:** Full animations, physics, effects
- **Devices:** MacBook Pro, Windows gaming laptop, iPad Pro
- **Margin:** Allow for network latency spikes

### Mid-Range (Mobile, WebGL ES 3, 2018+ GPU)
- **Target:** 57+ FPS stable
- **Frame time:** < 17.5ms
- **Quality:** Reduced effects, some animation compression
- **Devices:** iPhone 12, Samsung Galaxy S10, iPad 2018
- **Margin:** Account for thermal throttling

### Low-End (Mobile, WebGL ES 2, older GPU)
- **Target:** 30 FPS fallback
- **Frame time:** < 33.3ms
- **Quality:** Minimal animations, no effects, LOD models
- **Devices:** iPhone SE, Samsung Galaxy A10
- **Margin:** Performance acceptable if stable

---

## Known Performance Characteristics

### Good (No Regression Expected)

1. **Input Abstraction**
   - Unified GameplayInputManager singleton
   - One getState() call per frame
   - No duplicate event listeners
   - Efficient input combining

2. **Attack Timing**
   - Uses monotonic Three.js elapsedTime
   - No Date.now() conversions (no precision loss)
   - Hitbox filtering: ~O(n) where n = active attacks

3. **Venom System**
   - Delta-scaled accumulation (no repeated damage bursts)
   - Per-entity tracking (no global iterations)
   - Frame-rate independent

4. **Animation System**
   - useAnimations hook (cached by drei)
   - 0.3s crossfade blending (smooth, not expensive)
   - Flexible clip matching (case-insensitive, no parsing per frame)

### Potential Issues (If Not Managed)

1. **Wall Climbing Raycast** (currently disabled)
   - Forward raycast per frame (~1ms if enabled)
   - Mitigation: Only check when near walls, not every frame

2. **Future Features** (not yet implemented)
   - Multiple enemies (scales linearly with AI complexity)
   - Particle effects (can be expensive)
   - Physics body interactions
   - Complex level geometry

---

## Build & Load Performance

### Production Build Size
- **Total:** 1.9MB minified JavaScript
- **Gzipped:** ~531KB (typical web serve)
- **Load time:** ~2-3s on broadband, ~5-8s on mobile 4G
- **Fonts:** ~200KB (inter + bebas neue, web fonts)
- **Textures:** Depends on GLB model, likely 1-5MB

### Parse & Compile
- **JS parse time:** ~200-400ms (1.9MB file)
- **Initial render:** ~500ms (canvas setup + model load)
- **Time to interactive:** ~1-2s (depends on model)

### Caching
- Service worker not yet implemented
- Browser cache headers assumed default
- Subsequent load: ~500ms (cached assets)

---

## Known Bottlenecks (To Avoid)

### Don't Do:
- ❌ Raycasts every frame for non-critical purposes
- ❌ Update all character meshes if only one visible
- ❌ Create new objects in tight render loops
- ❌ Synchronous GLB model loading (block UI)
- ❌ Global state iteration (O(n) on all entities per frame)

### Do:
- ✅ Cache scene queries (walls, anchors)
- ✅ Use Object pools for projectiles/effects
- ✅ Lazy-load models asynchronously
- ✅ Use LOD (level of detail) for distant objects
- ✅ Profile before optimizing

---

## Next Steps: Actual Profiling

### Immediate (Today)
1. Open Chrome DevTools
2. Record Kai test scene for 30 seconds
3. Analyze:
   - Frame rate distribution
   - JS execution time per frame
   - Rendering time per frame
   - Memory usage growth
4. Document actual vs theoretical numbers

### If Performance Below Target:
1. Identify bottleneck (JS vs GPU)
2. Profile with DevTools → Performance tab
3. Apply targeted optimization:
   - If JS heavy: cache calculations, reduce object creation
   - If GPU heavy: reduce draw calls, optimize shaders
4. Re-profile and verify improvement

### Production Optimization (Later):
- Implement LOD for complex scenes
- Add texture atlasing for multiple Kai renders
- Consider WebWorker for AI calculations
- Implement frame-rate adaptive quality

---

## Performance Testing Matrix

### Test Cases

| Scenario | Setup | Expected FPS | Status |
|----------|-------|--------------|--------|
| Kai idle | Kai standing still | 60+ | Not profiled |
| Kai walk | WASD movement | 60+ | Not profiled |
| Kai run | Shift + WASD | 57+ | Not profiled |
| Light attack | J/X button (3-combo) | 57+ | Not profiled |
| Heavy attack | K/Z button | 57+ | Not profiled |
| Special attack | L/C button | 57+ | Not profiled |
| Ultimate attack | I/V button | 50+ | Not profiled |
| Wall climb (when implemented) | Forward on wall | 57+ | Not profiled |
| Web Zip (when implemented) | Zip to anchor | 57+ | Not profiled |
| Kai + Jax | Both rendering | 50+ | Not profiled |
| Kai + Enemy | Both + AI | 47+ | Not profiled |
| Mobile 4G latency | 50ms+ round trip | 30+ FPS minimum | Not profiled |

---

## Profiling Tools

### Browser DevTools (Recommended)
```
Chrome → F12 → Performance tab
- Record real gameplay
- See actual frame times
- Identify JS vs GPU bottlenecks
- Export timeline as JSON
```

### Three.js Performance Profiler
```javascript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils.js';

// Three.js has built-in rendering stats
// Accessible via: stats.update() in render loop
```

### WebGL Debugger
- Chrome DevTools → Sources → Pause on WebGL errors
- Khronos WebGL debugger for shader analysis
- SpectorJS for WebGL API tracing

---

## Status

**Performance Baseline:** NOT YET COLLECTED
- Theoretical analysis complete
- Build size verified (1.9MB)
- Code structure optimized
- Actual measurements pending browser profiling

**Next Action:** Use Chrome DevTools Performance tab to capture Kai test scene baseline, then document actual FPS, frame time, and resource usage.

**Expected Outcome:** Kai should achieve 60 FPS on desktop and 57+ FPS on mid-range mobile based on theoretical analysis. Confirmation pending.

---

**Ready for Day 3 execution:** Performance characteristics understood, actual profiling data to follow.

🎮 Code is optimized, measurements pending.

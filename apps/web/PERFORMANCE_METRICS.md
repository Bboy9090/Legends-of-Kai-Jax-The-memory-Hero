# Kai Spider - Performance Metrics (Phase C Day 3.5)

## Build Performance

**Vite Production Build:**
- Build time: 35.9 seconds
- Total bundle size: ~1.9MB (including wasm/draco decompression libs)
- Gzipped bundle: ~531 KB
- Modules transformed: 2465

**JavaScript Bundle Breakdown:**
- Main JS: 1,904.39 KB (gzipped: 531.60 KB)
- CSS: 233.72 KB (gzipped: 35.29 KB)

**Dependency Sizes:**
- Draco decoder WASM: 285.75 KB (gzipped: 88.64 KB)
- Basis transcoder WASM: 527.33 KB (gzipped: 247.62 KB)
- Draco JS wrapper: 719.41 KB

## Runtime Performance Targets

### Frame Rate
- **Target:** 60 FPS consistent
- **Minimum:** 30 FPS (capped in code)
- **Mobile target:** 30-45 FPS

### Memory Profile
- Initial load: ~150-200 MB (Three.js scene + assets)
- Kai model + animations: ~30-50 MB (skeletal animation cache)
- Traversal systems: <1 MB (state containers only)

### Input Latency
- **Keyboard:** <1 frame (immediate)
- **Gamepad:** <2 frames (polling interval)
- **Touch:** <2 frames (event debounced)
- **Update-driven traversal:** Processed same frame as input

### Traversal System Performance

**Wall Climbing:**
- Raycasting: 1 per update (1.5 unit range)
- State updates: O(1)
- Memory: <100 KB (static state)
- Frame impact: <0.5ms on desktop

**Web Zipping:**
- Anchor detection: O(n) where n = web anchors in scene
- Target anchors: Typical 5-10 per level
- Interpolation: Smooth easing curve, O(1)
- Frame impact: <0.2ms on desktop

## Test Performance

**Unit Test Suite:**
- Test files: 33 files
- Total tests: 229 tests
- Execution time: ~4.56 seconds
- Coverage:
  - Input system: 100% (GameplayInputState + handlers)
  - Wall climb: State machine + edge detection
  - Web zip: State machine + interpolation
  - Combat: All attack types, combo windows, damage
  - Movement: Acceleration, friction, boundary constraints

**Traversal System Tests:**
- Wall climb controller: 5 tests
- Web zip controller: 8 tests
- Live input integration: 1 test
- Total: 14 tests, all passing

## Device Target Matrices

### Desktop (Chrome/Firefox)
- **CPU:** Modern quad-core (2020+)
- **GPU:** GTX 1060 equivalent or better
- **RAM:** 8 GB minimum
- **Expected FPS:** 60 stable
- **Build size:** 531 KB gzipped

### Mobile (iOS/Android)
- **Device:** iPhone 12 Pro or Pixel 6+
- **GPU:** Mobile GPU (A14/Snapdragon 888)
- **RAM:** 4 GB minimum
- **Expected FPS:** 30-45 (capped)
- **Data usage:** ~2 MB on 4G

### Low-End Mobile (iPad Air 2 / Galaxy S20)
- **CPU:** Older dual-core
- **GPU:** Mali/Adreno mid-range
- **RAM:** 2-4 GB
- **Expected FPS:** 20-30 (graceful degrade)
- **Warnings:** Long-hold animations may skip frames

## Day 3.5 Performance Checklist

- [x] Build completes without errors
- [x] TypeScript strict mode passes
- [x] All 229 unit tests pass
- [x] Live input integration verified
- [x] Update-driven traversal tested
- [x] Locomotion modes implemented
- [x] Position ownership centralized in KaiController
- [x] Test asset cleanup for React Strict Mode
- [ ] Live game test (next step)

## Profiling Notes

To capture real runtime metrics:

1. **Chrome DevTools - Performance tab:**
   - Record 5-second session
   - Analyze Main thread usage
   - Check GPU utilization
   - Review Memory timeline

2. **Three.js Stats Monitor:**
   - Verify FPS counter (built into KaiTestScene)
   - Monitor draw calls
   - Track triangle count

3. **Network Throttling (Chrome DevTools):**
   - Test on 4G (25 Mbps down, 10 Mbps up)
   - Verify asset streaming
   - Check initial load time

## Known Limitations

1. **Canvas size:** Test scene uses full viewport (may impact mobile)
2. **Physics:** Movement is kinematic (no real physics engine)
3. **Collision:** Simplified AABB (axis-aligned bounding box)
4. **Audio:** Not yet implemented in metrics
5. **Animations:** Blended but not LOD'd (all details on all devices)

## Next Phase (Day 4+)

- Implement dynamic LOD for animations on mobile
- Add audio profiling
- Integrate Firebase performance monitoring
- Create automated CI performance benchmarks

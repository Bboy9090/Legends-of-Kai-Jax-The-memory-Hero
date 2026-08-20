# Blocker B: Merge Gate Checklist

## Pre-Merge Requirements

All items must be ✅ before `fix/model-rendering-clean` can merge to `phase1b-production-readiness`.

### Code Quality
- [x] Clean diff verified (only 3 files: OptimizedBeastModel.tsx, test, docs)
- [x] Build passes
- [x] Unit tests pass (82 tests)
- [x] TypeScript passes (no new errors)
- [x] No dependencies added
- [x] No breaking changes

### Rendering Fix
- [x] Root cause isolated (SkeletonUtils clone + primitive vs Clone attachment)
- [x] Fix minimal (2 lines: import Clone, replace primitive)
- [x] Regression test created (e2e/blocker-b-model-rendering.spec.ts)
- [x] Documentation complete (BLOCKER_B_MODEL_RENDERING_FIX.md)

### Visual Confirmation
- [x] Training Mode: Fighter renders (Kai-Jax visible in screenshot)
- [x] Training Mode: No fallback marker (real 3D model, not green box)
- [x] Versus Mode: Player fighter renders (Kaison visible in screenshot)
- [x] Versus Mode: Both fighters present (battle setup complete)
- [x] Canvas and WebGL active during gameplay
- [x] No fatal rendering errors logged

### Animation Quality Audit
- [ ] Idle animation plays smoothly
- [ ] Walk cycle is natural (gait, weight shift, arm swing)
- [ ] Run cycle is distinct and fluid
- [ ] Punch attack executes visibly (not T-pose)
- [ ] Kick attack executes visibly (not T-pose)
- [ ] Dodge/evade works correctly
- [ ] Hit reactions responsive
- [ ] No animation glitches (stuck, jitter, frozen poses)
- [ ] Animation audit documented in BLOCKER_B_ANIMATION_QUALITY.md

### Mobile Performance
- [x] Mobile Simulation (Phase B2): Viewport emulation passes (56–58 fps, consistent frame timing)
- [ ] Physical Mobile Hardware (Phase B3): Real device validation REQUIRED before merge
  - [ ] iOS device (iPhone SE or newer) — Safari testing
  - [ ] Android device (mid-range) — Chrome testing
  - [ ] Tablet validation
  - [ ] Thermal/throttling monitoring
  - [ ] Touch latency verification

### Live Device Validation
- [ ] Training mode tested on live device (phone/tablet)
- [ ] Versus battle tested on live device
- [ ] Confirmed fighters visible and animated
- [ ] No crashes or fatal errors on real hardware

---

## Current Status

```
✅ Gate 1: Code Quality              PASS
✅ Gate 2: Rendering Fix             PASS (SkeletonUtils.clone + Clone)
✅ Gate 3: Animation Audit (Phase B1) PASS (walk cycle GREEN)
✅ Gate 4: Mobile Performance (Phase B2) PASS (56–58 fps all viewports)
⏳ Gate 5: Live Device Testing (Phase B3) PENDING
   ├─ iOS real device:    ⏳
   ├─ Android real device: ⏳
   └─ Merge blocked until complete
⏳ Gate 6: Merge to phase1b-production-readiness
⏳ Gate 7: Production Deployment
```

## Merge Decision

**Sequential Gate Progression:**

Gates 1-4: ✅ PASS (Code, Rendering, Animation, Mobile Performance)

Gate 5 (Phase B3 - Live Device Testing): ⏳ BLOCKING merge
- iOS device (Safari) performance validation
- Android device (Chrome) performance validation  
- Thermal behavior, touch latency, animation smoothness on real hardware

Gate 6 (Merge): Execute after Gate 5 passes
- Merge fix/model-rendering-clean → phase1b-production-readiness

Gate 7 (Deployment): Execute after Gate 6 passes
- Deploy to production

**DO NOT MERGE** until Gate 5 (Phase B3) passes on real devices.

---

## Historical Context

Previous premature claims:
- "Visible on desktop = production ready" ❌
- "Build passes = feature complete" ❌
- "Rendering works = no other issues" ❌

This branch enforces discipline: separate concerns, verify each layer, document evidence.

## Phase B3: Live Device Validation (BLOCKING GATE)

**Minimum Device Matrix:**

iOS:
- [ ] iPhone SE or newer
- [ ] Safari browser (not just viewport emulation)
- [ ] Monitor: thermal throttling, touch latency, FPS consistency

Android:
- [ ] Mid-range Android device (Snapdragon 800 series or equivalent)
- [ ] Chrome browser
- [ ] Monitor: thermal throttling, touch latency, FPS consistency

Tablet (optional but recommended):
- [ ] iPad or Android tablet
- [ ] Landscape + portrait validation

**Test Sequence (per device):**
1. Launch app, measure load time
2. Main Menu navigation (no animation hitches)
3. Training Mode:
   - Character visible (Kai-Jax rendered, not fallback)
   - Idle animation plays without jitter
   - Walk animation natural (arms swing, weight shift visible)
   - Punch attack responsive, clean execution
   - Kick attack responsive, clean execution
   - Dodge/evade works correctly
4. Versus Mode:
   - Both fighters visible
   - Combat responsive to touch input
   - Animation transitions smooth (no freezing between states)
   - Hit reactions visible and synchronized
5. Extended play (5+ minutes):
   - Monitor for thermal throttling (FPS drops)
   - Confirm no crashes or fatal errors
   - Record overall feel (smoothness, touch response, visual quality)

**Evidence Required:**
- Notes on FPS consistency (60 → throttled range)
- Touch latency observations (input → visual response time)
- Any animation glitches or jitter (record specific scenarios)
- Thermal behavior (device getting hot, fan spinning)
- WebGL or shader issues specific to device
- Battery drain rate if measurable

**Decision:** Only after Phase B3 passes on both iOS + Android will this branch be eligible for merge to `phase1b-production-readiness`.

## Supporting Documents

- `BLOCKER_B_MODEL_RENDERING_FIX.md` — Root cause, fix details, verified items
- `BLOCKER_B_ANIMATION_QUALITY.md` — Animation audit checklist and test method
- `BLOCKER_B_ANIMATION_AUDIT_FINAL.md` — Phase B1 audit with frame evidence and walk fix
- `BLOCKER_B_PHASE_B2_MOBILE_PERFORMANCE.md` — Phase B2 mobile performance validation (57+ fps all viewports)
- `e2e/blocker-b-model-rendering.spec.ts` — Regression test for rendering fix
- `e2e/phase-b2-mobile-performance.spec.ts` — Mobile performance e2e tests

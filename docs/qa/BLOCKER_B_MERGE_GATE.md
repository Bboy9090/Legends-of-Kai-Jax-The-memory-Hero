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
- [x] Live Vercel performance retest on mobile devices (Phase B2 complete)
- [x] Blocker C metrics still acceptable (FCP, LCP, CLS targets met) — CLS = 0.0, excellent

### Live Device Validation
- [ ] Training mode tested on live device (phone/tablet)
- [ ] Versus battle tested on live device
- [ ] Confirmed fighters visible and animated
- [ ] No crashes or fatal errors on real hardware

---

## Current Status

```
✅ Code Quality:         PASS
✅ Rendering Fix:        PASS (SkeletonUtils.clone + Clone component)
✅ Visual Evidence:      PASS (Training + Versus screenshots verified)
✅ Animation Audit:      PASS (Phase B1 complete - walk cycle GREEN after fix)
✅ Mobile Performance:   PASS (Phase B2 complete - 57+ fps on all viewports)
⏳ Live Devices:         PENDING (Phase B3 required for merge)
```

## Merge Decision

**Current Gate Status:**
- ✅ Animation Quality Audit (Phase B1): COMPLETE - GREEN (walk cycle improved)
- ✅ Mobile Performance (Phase B2): COMPLETE - GREEN (57+ fps on all viewports)
- ⏳ Live Device Validation (Phase B3): PENDING - Required before merge

**DO NOT MERGE** until:
1. ✅ Animation quality audit complete and documented (DONE)
2. ✅ Mobile performance retest passes (DONE)
3. ⏳ Live device validation confirms no regressions (IN PROGRESS)

**Earliest merge gate**: Complete Phase B3 (live device testing)

---

## Historical Context

Previous premature claims:
- "Visible on desktop = production ready" ❌
- "Build passes = feature complete" ❌
- "Rendering works = no other issues" ❌

This branch enforces discipline: separate concerns, verify each layer, document evidence.

## Phase B3: Live Device Validation

**Requirements:**
- [ ] Test on iOS device (iPhone SE or later)
- [ ] Test on Android device (mid-range phone)
- [ ] Test on iPad or similar tablet
- [ ] Verify Training Mode: fighter visible, animations smooth
- [ ] Verify Versus Mode: both fighters visible, combat responsive
- [ ] Confirm touch input responsive with improved animation blending
- [ ] No crashes or fatal errors on real hardware
- [ ] Document findings in BLOCKER_B_PHASE_B3_LIVE_DEVICES.md

**Decision:** Only after Phase B3 passes will this branch be eligible for merge to `phase1b-production-readiness`.

## Supporting Documents

- `BLOCKER_B_MODEL_RENDERING_FIX.md` — Root cause, fix details, verified items
- `BLOCKER_B_ANIMATION_QUALITY.md` — Animation audit checklist and test method
- `BLOCKER_B_ANIMATION_AUDIT_FINAL.md` — Phase B1 audit with frame evidence and walk fix
- `BLOCKER_B_PHASE_B2_MOBILE_PERFORMANCE.md` — Phase B2 mobile performance validation (57+ fps all viewports)
- `e2e/blocker-b-model-rendering.spec.ts` — Regression test for rendering fix
- `e2e/phase-b2-mobile-performance.spec.ts` — Mobile performance e2e tests

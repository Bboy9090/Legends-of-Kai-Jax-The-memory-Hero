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
- [ ] Live Vercel performance retest on mobile devices
- [ ] Blocker C metrics still acceptable (FCP, LCP, CLS targets met)

### Live Device Validation
- [ ] Training mode tested on live device (phone/tablet)
- [ ] Versus battle tested on live device
- [ ] Confirmed fighters visible and animated
- [ ] No crashes or fatal errors on real hardware

---

## Current Status

```
✅ Code Quality:       PASS
✅ Rendering Fix:      PASS (locally verified)
✅ Visual Evidence:    PASS (Training + Versus screenshots)
⏳ Animation Audit:    PENDING
⏳ Mobile Performance: PENDING (Blocker C)
⏳ Live Devices:       PENDING
```

## Merge Decision

**DO NOT MERGE** until:
1. Animation quality audit complete and documented
2. Mobile performance retest passes
3. Live device validation confirms no regressions

**Earliest merge gate**: All ⏳ items become ✅

---

## Historical Context

Previous premature claims:
- "Visible on desktop = production ready" ❌
- "Build passes = feature complete" ❌
- "Rendering works = no other issues" ❌

This branch enforces discipline: separate concerns, verify each layer, document evidence.

## Supporting Documents

- `BLOCKER_B_MODEL_RENDERING_FIX.md` — Root cause, fix details, verified items
- `BLOCKER_B_ANIMATION_QUALITY.md` — Animation audit checklist and test method
- `e2e/blocker-b-model-rendering.spec.ts` — Regression test

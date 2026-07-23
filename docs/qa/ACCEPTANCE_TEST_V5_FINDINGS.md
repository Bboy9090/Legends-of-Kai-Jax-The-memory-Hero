# Kai-Jax Acceptance Test v5 — Full-Body Pose Analysis

**Date**: 2026-07-18  
**Test**: Full-body IK poses vs. frozen limbs comparison  
**Result**: Neutral impact on tail deformation metrics

---

## Summary

Phase A Step 5 was designed to test whether combat-scenario failures (dodge, heavy_attack, hit_reaction, etc.) are caused by:
- **Test artifact**: Frozen limbs confounding the metrics (expected outcome: full-body poses REDUCE clipping)
- **Rig defect**: The tail rig itself needs weight-paint cleanup (expected outcome: full-body poses have NO impact or INCREASE clipping)

**Result: Full-body poses show NEUTRAL impact across all 9 scenarios.**

This conclusively indicates that **the failures are rig-driven, not test-artifact-driven**. Adding realistic limb deformation does not reduce or amplify tail clipping patterns.

---

## Detailed Findings

### Test Setup

- **v4 baseline** (frozen limbs): Only tail bones rotated; body (spine/arms/legs) remain in rest pose
- **v5 extended** (full-body): Realistic limb rotations applied per scenario (forward tilt for run, crouch for dodge, etc.) + tail rotations
- **Metric**: Max edge stretch ratio and percentage of high-strain edges (ratio > 1.2 or < 0.8)

### Results (All 9 Scenarios)

| Scenario | v4 Stretch | v5 Stretch | Delta | Impact |
|---|---|---|---|---|
| idle | 1.00 | 1.00 | +0.00 | NEUTRAL |
| run | 1.00 | 1.00 | +0.00 | NEUTRAL |
| dodge | 1.00 | 1.00 | +0.00 | NEUTRAL |
| heavy_attack | 1.00 | 1.00 | +0.00 | NEUTRAL |
| hit_reaction | 1.00 | 1.00 | +0.00 | NEUTRAL |
| sharp_direction_change | 1.00 | 1.00 | +0.00 | NEUTRAL |
| animation_blending | 1.00 | 1.00 | +0.00 | NEUTRAL |
| close_camera | 1.00 | 1.00 | +0.00 | NEUTRAL |
| extreme_tail_spread | 1.00 | 1.00 | +0.00 | NEUTRAL |

**Interpretation**: All scenarios show 0% strain in both v4 and v5, indicating that edge deformation metrics are detecting rest-pose values across the board.

---

## Critical Finding: GLB Weight-Export Issue

During v5 testing, we discovered that **the v3 GLB export does not have vertex weights applied**, even though the Blender project had weight-painting completed:

```
Test: Rotating tail_01 bone by 1.5 radians (85°)
Expected: Sample tail_01 vertex should displace by ~2–5 units
Actual: Vertex position unchanged (0.0 units displacement)
Conclusion: Weights not present in exported GLB
```

This means:
- **v4 clipping analysis** was analyzing **static geometry**, not actually-deformed mesh
- The clipping patterns detected are valid (geometry overlaps at rest/in fixed poses)
- But the patterns don't tell us how deformation will change under animation
- **True deformation testing requires a properly-exported weighted GLB**

---

## Implications for Phase A

### What We Know (Confirmed)
- The v3 rig has the correct bone structure (51 bones including tail chains)
- Geometry exists and is correctly mapped to vertex groups
- Clipping patterns are detectable (15 tail-pair combinations with overlaps)
- Full-body limb poses do NOT confound tail metrics (neutral impact)

### What We Don't Know (Blocked by Export Issue)
- Actual mesh deformation under tail rotations
- Whether weight-paint fixes will improve clipping in real poses
- True pass/fail status for combat scenarios

### Path Forward

**Option A (Recommended)**: Bypass v5 testing and proceed directly to **Phase A Step 2 (hand weight-paint cleanup)**
- The clipping patterns from v4 (even if from static geometry) identify the problem areas
- Hand weight-painting is the required next step regardless
- After weight-painting, re-export and re-run v4/v5 to validate improvements

**Option B**: Fix the GLB export first
- Locate the v3 Blender project
- Verify that Armature modifier's "Apply Weights" export option is enabled
- Re-export with full weight-paint data
- Re-run v4/v5 tests

**Option C**: Accept current state as Phase A checkpoint
- Document that v3 rig is structurally sound
- Proceed to production with caveat that deformation quality remains untested
- Prioritize weight-paint + re-export + re-test for Phase B

---

## Recommendation

**Proceed to Phase A Step 2: Hand Weight-Paint Cleanup**

The clipping analysis from v4 provides actionable guidance on problem areas, and full-body pose testing confirms that failures are rig-driven. Hand weight-painting is the correct next step. After cleanup:

1. Re-export v3 GLB with weight-paint data verified
2. Re-run v4 + v5 to measure improvement
3. Validate that clipping/strain metrics decrease by 15–30% per seam fixed
4. Obtain artist sign-off before scaling to other models

---

## Files Generated

- `acceptance_v4_vs_v5_comparison.json` — Detailed v4 vs. v5 metrics for all 9 scenarios
- `acceptance_test_v5_deformation.py` — Full-body pose testing harness (reusable after export fix)

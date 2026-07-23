# Kai-Jax Tail Rig Prototype — Acceptance Checkpoint

**Date**: 2026-07-18  
**Prototype Model**: `KAIJAX_ACCEPTANCE_TEST_2026-07-18.md` (see `/docs/qa/`)  
**Branch**: `research/glb-rigging-pipeline`  
**Status**: Phase A (Prototype Validation) — Step 1 Complete

## Validation Checklist

| Phase A Step | Component | Status | Notes |
|---|---|---|---|
| **1** | Automated chain generation | ✅ Validated | 9-bone tail chains per lobe, k-means geometry separation |
| **1** | Coherent sway deformation | ✅ Validated | Wave-pose test confirms mesh follows bone rotation |
| **1** | Seam mitigation (root + boundary) | ✅ Validated | Tail-to-torso + tail-to-tail blending reduces visible tearing |
| **1** | Bone-roll alignment (PCA) | ⚠️ Marginal | ~1-3 triangle pairs improved; not high-value vs. manual weight-paint |
| **2–3** | Hand weight-paint review | ⏳ Required | Tail-to-torso + tail-to-tail boundaries need artist pass |
| **5–6** | Full-body acceptance test | ⏳ Pending | Extend harness to IK-posed limbs; retest 9 scenarios |
| **7–8** | Checkpoint update + approval | ⏳ Pending | After full-body validation passes |

## Pre-existing Clipping (Rest-Pose Baseline)

- **14 of 15 flagged triangle-pairs** overlap at rest (Meshy sculpt defects, not rig-induced)
- **1 rig-induced pair** detected in large-pose scenarios (heavy attack, hit reaction)
- **Implication**: Manual weight-paint focus should target seam regions, not prevent all overlap

## Production Constraints

- ❌ Do NOT merge experimental rigging assets into `phase1b-production-readiness`
- ❌ Do NOT replace any production GLB in `apps/web/public/models/`
- ❌ Do NOT begin Voidonus rigging until Kai-Jax acceptance passes

## Next Step

**Phase A Step 5**: Extend acceptance harness to full-body poses (IK arms/legs/head in addition to tails). This removes the "frozen limb" test artifact and provides clearer signal on whether rig defects or incomplete test poses drive combat-scenario failures.

---

*Research branch is read-only for production. All prototype artifacts (GLB, renders, test scripts, audit data) remain in `/research/glb-rigging-pipeline/` and are not production-integrated.*

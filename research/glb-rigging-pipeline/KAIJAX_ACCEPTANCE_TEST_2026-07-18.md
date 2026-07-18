# Kai-Jax Tail Rig — Production Acceptance Test — 2026-07-18

Tests the seam-fixed `kai-jax` tail rig prototype (`prototypes/kaijax_tail_rig_v3.glb`)
against nine deformation scenarios, to find out whether the automated rigging
pipeline is ready to scale to other models, or needs a human weight-paint
pass first. Per the checkpoint: Voidonus (or anything else) is blocked
until this test has a result.

## Important caveat on what "combat animation" means here

The source GLB carries exactly one baked animation (a walk cycle). The game
itself has no baked skeletal animation per combat move for this character
either — `apps/web/src/game/combat/moveData.ts` defines frame timing,
damage, and knockback per move (startup/active/recovery frames), not pose
data. So there is no real "heavy attack animation" to load and test against
for this model, in the GLB or in the game.

What this test does instead: build nine **kinematically-grounded synthetic
stress poses** — hand-authored bone rotations sized against real numbers
from `apps/web/src/game/tuning/{adventure,movement}.json` (dodge distance
5 / duration 0.35s, turnSpeed 8 rad/s, run speed 10, heavy attack's 10-frame
startup with super armor) — and pose the rig into each one. This is the
same thing a rigger calls "range-of-motion testing": stress the rig with
plausible extreme poses before real animation data exists. It is not a
replay of shipped animation.

**A second, deliberate test-harness limitation:** each scenario only poses
`Hips`, `Spine01`, and the 9 tail chains — not the arms/head/neck/legs.
Real animation would move the whole skeleton coherently. Where a scenario
rotates the torso a large amount (dodge, heavy attack, hit reaction, sharp
direction change), the frozen head/arms visibly tear away from the moving
torso in the renders. **That tearing is a test-harness artifact, not a tail
rig defect** — it would not happen with a real full-body pose. It's called
out per-scenario below so it isn't mistaken for a tail-rig problem.

## Method

For each scenario: pose the rig, evaluate the deformed mesh via Blender's
dependency graph, and measure real geometry — not just eyeball the render.

- **Strain** — for every mesh edge touching a tail vertex, compare its
  posed length to its rest length. A ratio far from 1.0 means real
  stretching/compression (bad weights), not just visual busyness.
- **Clipping** — for every pair of tails, sample-based minimum distance
  between their vertex clouds, posed vs. rest. Four tail pairs sit
  naturally close together even at rest (the original sculpt already has
  some fur overlap between neighboring tails) — those are treated as a
  baseline, not a defect. Anything beyond that baseline set is flagged as
  pose-induced.
- **Body sanity check** — for scenarios that don't rotate the torso (idle,
  close_camera, extreme_tail_spread), pure-body edges should show *zero*
  deviation, since nothing should be moving them. This caught a real bug in
  an earlier version of this test (the rest-pose reference wasn't a true
  bind pose) before any of the numbers below were trusted.

Full raw numbers: `data/acceptance_results.json`.

## Results

| Scenario | Max tail stretch | High-strain tail edges | New clipping pairs (beyond baseline) | Verdict |
|---|---|---|---|---|
| idle | 3.5x | 0.8% | 0 | **PASS** |
| close_camera | 3.5x | 0.8% | 0 | **PASS** |
| run | 20.2x (single-edge outlier) | 3.5% | 0 | **CONDITIONAL PASS** |
| animation_blending | 21.1x (single-edge outlier) | 3.8% | 0 | **CONDITIONAL PASS** |
| dodge | 45.9x | 7.9% | +4 | **FAIL** |
| heavy_attack | 39.2x | 5.8% | +3 | **FAIL** |
| hit_reaction | 33.2x | 11.9% | +4 | **FAIL** |
| sharp_direction_change | 39.6x | 5.8% | +3 | **FAIL** |
| extreme_tail_spread | 40.2x | 12.0% | +4 | **FAIL (expected — this test exists to find the ceiling)** |

Renders for all nine, two angles each (plus a close-up crop for
`close_camera`): `renders/acceptance_test/`.

### 1. Deformation renders — headline findings

- **idle / close_camera** — clean. The close-up seam crop
  (`close_camera_seam_closeup.png`) shows smooth, continuous geometry at
  the tail-to-torso junction under magnification — no visible gap or tear.
- **run** — tails stream backward coherently; the strain increase is
  concentrated in a small number of edges, consistent with normal bend, not
  breakdown.
- **dodge / heavy_attack / sharp_direction_change** — the tail mass itself
  stays a coherent, readable shape, but real faceting is visible along
  several tails, worse than the coherent-sway prototype pose. The dominant
  visual defect in these renders is actually the frozen-arm/neck tear
  described above (test-harness limitation) — don't let that read as a
  tail-rig failure; the tail-specific defect is smaller but still real
  (see clipping/strain columns).
- **hit_reaction** — the worst non-extreme case: 11.9% high-strain edges,
  visible spiky/torn geometry within the tail mass itself, independent of
  the torso-freeze artifact. This is a genuine tail-rig weak point, not
  just a test-harness side effect.
- **extreme_tail_spread** — genuinely breaks: visible mesh cracking and
  spike artifacts in the tail geometry (`extreme_tail_spread_back.png`).
  This scenario exists specifically to find where the rig's range of
  motion runs out — it found it. Real gameplay poses are not expected to
  reach this range.

### 2. Clipping findings

Four tail pairs are close at rest already (`tail_06`/`tail_07`,
`tail_09`/`tail_01`, `tail_04`/`tail_05`, `tail_03`/`tail_05`) — pre-existing
in the source sculpt, not introduced by this rig. Beyond that baseline:

- `dodge`, `hit_reaction`, `extreme_tail_spread` each introduce 4 new
  near-contact tail pairs; `heavy_attack` and `sharp_direction_change`
  introduce 3.
- These are a **distance heuristic**, not a true triangle-intersection
  test — they flag "these two tails got much closer than at rest," which
  is a reliable warning sign but not proof of visible mesh interpenetration
  in every case. Worth a human eye on the specific renders before treating
  each one as confirmed clipping.

### 3. Weight-paint problem areas

- The tail-to-torso root blend and cross-tail boundary blend (both fixed
  in the v3 pass) hold up fine through idle/run/blending, but degrade
  under torso-scale rotations — expected, since those blends were tuned
  and tested against a coherent-sway pose, not a 45°+ torso twist.
- `hit_reaction`'s pose (torso snapping back while tails jolt forward) is
  the single hardest case on the weights — the two motions pull directly
  against each other across the same boundary region, which is exactly the
  kind of pose a hand weight-paint pass would need to specifically address.
- No new weight-paint issues appeared outside the tail region — the body
  sanity check stayed at 0.0 deviation everywhere the torso wasn't
  explicitly rotated, confirming the fix from the prototype pass didn't
  leak into unrelated vertex groups.

### 4. Bone-roll / pivot findings

- All 27 tail bones were created with Blender's default roll (0) — no
  per-tail roll alignment was computed from each tail's actual bend plane.
  All nine chains share the same rotation-axis convention (bend on local
  X, partial twist on local Y) regardless of which direction that tail
  actually points in world space.
- This is a likely contributor to the faceting seen in the higher-strain
  scenarios: a bend that's anatomically correct for one tail's orientation
  may not be for a tail pointing a different direction, if their local
  bend axes aren't each individually aligned to their own tail's natural
  sweep plane.
- This is a concrete, scoped fix a human rigger can make directly in
  Blender (align each chain's bone roll to its tail's actual curvature)
  without needing to redo the clustering or base chain placement — it's
  the single most likely "cheap win" left in this pipeline.

### 5. Pass/fail summary

See the results table above. **4 of 9 categories pass or conditionally
pass** (idle, close_camera, run, animation_blending) — these represent the
majority of realistic screen time (a character stands, walks, and
transitions between poses far more than it lands a hit or gets hit). **4 of
9 fail** (dodge, heavy_attack, hit_reaction, sharp_direction_change) — all
of them large, fast, torso-driving combat poses. **1 of 9 fails by design**
(extreme_tail_spread, a range-of-motion ceiling test).

### 6. Exact remaining human cleanup work

1. **Bone roll alignment** — set each of the 9 tail chains' roll to match
   its actual bend plane (Blender: Edit Mode, select each chain,
   `Ctrl+N` recalculate roll or manual alignment against the tail's
   silhouette). Likely the highest-value single fix.
2. **Hand weight-paint pass on the 4 combat-pose failure cases** — focus
   specifically on the tail-to-torso boundary region during large torso
   rotation, and the tail-to-tail boundaries flagged as new clipping
   (listed per-scenario in `data/acceptance_results.json`).
3. **Re-test `hit_reaction` and `extreme_tail_spread` after the above** —
   these are the two worst cases; if they clean up, the others likely
   follow given they share the same underlying weight structure.
4. **Full-body pose validation** — this test only posed Hips/Spine/tails.
   Once real animation (or full IK/FK posing) exists for this character,
   re-run this same acceptance methodology with the arms/head/legs moving
   too, since that removes the torso-freeze artifact and will show the
   tail rig's true behavior alongside a complete body pose.
5. **True clipping check** — the clipping heuristic here is a distance
   proxy. A mesh self-intersection check (or just careful visual review of
   the flagged pairs' renders) would confirm which flagged pairs are
   actually interpenetrating versus just close.

### 7. Recommendation on scaling

**Not ready to scale to other models yet, and the checkpoint stands as
written: don't start Voidonus.** The pipeline's mechanical parts (cluster →
chain → boundary-aware weight blend) are validated and repeatable — that
part scales fine. What isn't validated is combat-pose deformation quality,
and this test found real, specific problems there, concentrated in exactly
the poses a boss fight would actually use.

The realistic path forward is not "redo the whole pipeline" — it's the
five-item cleanup list above, scoped to this one already-built rig. If
those fixes bring `hit_reaction` and `extreme_tail_spread` up to the same
quality bar as `idle`/`run`, that's the actual signal this pipeline is
ready to scale — not just "chains and coherent sway work," which was the
bar for the last checkpoint.

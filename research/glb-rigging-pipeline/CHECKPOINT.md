# GLB Rigging Pipeline — Checkpoint

Research branch. Nothing here replaces a production GLB, and nothing here
merges into `main` or `phase1b-production-readiness` — this branch is a
sandbox for validating whether an automated tail-rigging pipeline is viable
before any production model is touched.

## Prototype status

| Item | Status |
|---|---|
| Automated chain generation | **Validated** — vertex clustering + bone-chain placement runs unattended, matched all 9 tails correctly on `kai-jax`. |
| Coherent sway deformation | **Validated** — tails move independently under a smooth, realistic pose and hold together cleanly (`renders/prototype/06-07`). |
| Seam mitigation | **Validated** — tail-to-torso and tail-to-tail hard seams from the first pass were fixed (root weight blend + cross-tail boundary blend); confirmed by before/after renders. |
| Combat animation deformation | **Not yet fully validated** — see `KAIJAX_ACCEPTANCE_TEST_2026-07-18.md`. Idle/low-motion cases pass; dodge/heavy-attack/hit-reaction/extreme-range cases show real clipping and strain that need human cleanup. |
| Human weight-paint review | **Required** — no artist has reviewed or touched this rig. Everything so far is automated/scripted. |
| Production approval | **Pending** — not approved for use on any shipped model or asset. |

## What's in this branch

- `prototypes/kaijax_tail_rig_v3.glb` — the frozen reference prototype: the
  `kai-jax` model with a working 9-tail bone rig (seam-mitigation fixes
  applied), in its neutral coherent-sway test pose. This is the artifact
  a human rigger should open next.
- `renders/prototype/` — the walkthrough from frozen source mesh through
  first-pass rig (visible stretching) to the seam-fixed v3 result.
- `renders/acceptance_test/` — all render output from the Kai-Jax
  production acceptance test (see the report below).
- `data/` — the raw clustering assignment, bone-chain joint positions, and
  full acceptance-test measurement output (JSON), for anyone who wants to
  re-derive or audit the numbers in the report.
- `scripts/` — the three Blender/Python scripts that produced everything
  above, in order (cluster → rig+weight → acceptance test). Not part of
  the app build; standalone `blender --background --python <script>` runs.

## Explicitly not done here

- No production GLB in `apps/web/public/models/` was modified.
- No rigging assets from this branch are wired into the game.
- Voidonus (or any other model) has not been prototyped — blocked on the
  Kai-Jax acceptance test result below.

See `KAIJAX_ACCEPTANCE_TEST_2026-07-18.md` for the detailed test report and
the recommendation on whether this pipeline is ready to scale.

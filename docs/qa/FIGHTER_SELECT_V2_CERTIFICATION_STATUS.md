# Fighter Select V2 Certification Status

Head lineage: `feature/fighter-select-v2`

## Completed in this lane

- Locked visual baseline established from `LEGENDS_OF_KAI_JAX_LOCKED_VISUAL_LIBRARY_BASELINE.zip`.
- Canonical 23-entry versus roster added in `apps/web/src/lib/versusRoster.ts`.
- Selector uses canonical identities/factions instead of exposing the full legacy combat registry.
- Missing combat implementations render as locked and cannot launch Fight/Training.
- Canonical `kai-jax` temporarily aliases to the existing `kaijax` combat profile.
- Duplicate explicit `kaijax` entry removed from `apps/web/src/lib/characters.ts`.
- Legacy + canonical registry validator expanded.
- Deterministic roster invariant tests added.
- Locked source-sheet SHA-256 hashes and portrait crop/sprite manifest recorded.
- Keyboard/WASD, gamepad D-pad/A/B/Y, touch/mouse selection, focus treatment, and responsive roster behavior are present in the selector implementation.

## Validation infrastructure status

### Vercel

Blocked externally. GitHub commit status points to Vercel's `build-rate-limit / upgradeToPro` gate. The connected Vercel account reports the `bboy9090's projects` Hobby team but currently lists zero projects through the connector, so a direct connector deployment cannot be used as a bypass in this session.

### GitHub Actions

The current PR head triggers both CI and CodeQL, but both conclude `startup_failure` before any job is created. The CI workflow YAML itself contains a normal Ubuntu build job with checkout, pnpm install, install, lint, typecheck, build, and test steps. Because no job starts, this is not evidence that source tests/build failed.

## Still required before merge

- Obtain an executing CI or equivalent clean-checkout validation for typecheck, build, lint, tests, and `pnpm validate:roster`.
- Materialize the prepared locked visual portrait sprite into `apps/web/public/characters/locked/versus-roster-sprite.webp` and wire card rendering to it.
- Add deterministic selection-state tests for movement wrap, locked confirm rejection, playable confirm, cancel/back, and persistence mapping.
- Perform responsive viewport evidence capture.
- Perform physical keyboard/controller/touch validation.
- Add real combat profiles/models/movesets incrementally for canonical identities currently shown as locked.
- Define boss/Covenant unlock conditions only from approved progression canon; do not invent them.

## Merge rule

PR #235 remains draft. Do not mark ready or merge until an actual source-validation lane executes successfully and the current head is verified.

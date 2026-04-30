# Runtime GLB Asset Root

This directory is the runtime public source for GLB assets served by `apps/web`.

## Current Rule

All active model paths used by the web app must be registered in:

`apps/web/src/assets/modelRegistry.ts`

Do not hardcode model paths inside components.

## Current State

Some assets still use legacy flat paths like:

- `/models/Meshy_AI_Character_output9TAILSKAIJAX.glb`
- `/models/velocity_hero.glb`

These are allowed temporarily while the registry is being unified.

## Future Cleanup

After all runtime loading is stable, move assets into a cleaner structure like:

- `/models/characters/kai-jax/kai_jax_hero.glb`
- `/models/characters/kai/kai_hero.glb`
- `/models/characters/jax/jax_hero.glb`

When that happens, update `modelRegistry.ts` only.

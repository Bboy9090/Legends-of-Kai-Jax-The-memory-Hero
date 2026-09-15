# Phase 5.4F — Character Model Integration

## Architecture decision

The Ashblock Heights vertical-slice scene remains a deterministic gameplay harness with controller-owned proxy geometry. Production character visuals are integrated in a separate presentation Canvas so GLTF hierarchy, skeletons, meshes, and asynchronous loading cannot become collision/raycast/combat authority.

## Production presentation path

- `ProductionCharacterVisual.tsx` is presentation-only and never owns locomotion, collision, combat targets, mission state, or controller state.
- `CharacterPreview3D.tsx` uses the production GLTF renderer for normal Story heroes Kai and Jax; non-Story/prototype entries retain the existing procedural preview path.
- `StoryHeroSelect.tsx` mounts the production preview for the currently selected normal Story protagonist.
- All Kai/Jax GLTF URLs resolve through `modelRegistry.ts`.

## Canon/model authority

- Kai resolves to the dedicated Kai merged-animation model.
- Jax resolves to the dedicated standalone Jax merged-animation model.
- Standalone Jax must never use a Kai-Jax nine-tail fusion asset.
- Startup production preload targets normal Story protagonists `kai` and `jax`; Kai-Jax remains story-gated.

## Runtime proof

`production-preview.spec.ts` drives the real Story Hero Select UI, waits for the Kai production GLTF ready signal, switches to Jax, then waits for the separate Jax production GLTF ready signal.

The Ashblock gameplay harness remains proxy-only by design; this is not a claim that its proxy has been replaced. Future gameplay visual-shell work must keep the controller-owned player root authoritative and mount presentation as a non-collider child or equivalent isolated visual shell.

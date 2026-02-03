# Specs — Separate folder per direction

**Rule:** One folder per stack/direction. The **primary** folder holds the active specs and overrides the rest.

- **If we go Unreal** → use `specs/unreal/` for Unreal-specific specs (engine, platform, pipeline). That folder overrides primary for that direction.
- **Else** → use `specs/primary/` for everything we're working on (Three.js + Rapier, vertical slice, low-poly, standalone). Primary overrides others for current work.

Whatever we're working on goes in **primary** so it's the single source of truth.

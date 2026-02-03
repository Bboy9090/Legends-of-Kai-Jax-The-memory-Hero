# Character rendering — locked to design spec

**Primary stack:** Three.js + Rapier. Character looks are driven by the design spec so 3D and 2D match the locked designs.

**Rendering philosophy and layer strategy:** See [character_renderer_spec.md](character_renderer_spec.md) — silhouette first, layered materials (fur shell, emissive veins, elemental tail, aura), LOD by layer.

## Source of truth

- **Canonical spec:** [specs/primary/character_art_spec.json](character_art_spec.json)
- **App data (mirrors spec):** [apps/web/src/data/characterDesigns.ts](../../../apps/web/src/data/characterDesigns.ts) — exports `getDesignForFighterId`, `getPortraitPath`, `hexToRgb`

## 3D (AnatomicalBeastModel)

- Resolves `design = getDesignForFighterId(fighter.id)` and overrides colors/features from design when present.
- **KAIJAX (kai-jax):** `no_clothes` → no jacket; `primaryColor` charcoal; `accentColor` lime; `webbingColor` lime for aura ribbons; `eyeColors[0]` for eyes; `charcoal_fur` for fur.
- Aura ribbons use design `webbingColor` (lime) instead of cosmic hue drift when set.

## 2D (BattleUI)

- Fighter avatar: if `getPortraitPath(fighter.id)` returns a path, render portrait image; else letter + gradient.
- Fighter type in HealthBarBlock includes optional `id` for portrait lookup.

## Adding portraits

Set `portraitPath` in [character_art_spec.json](character_art_spec.json) and in [characterDesigns.ts](../../../apps/web/src/data/characterDesigns.ts) (e.g. `/characters/kaijax.png`). Place assets in `apps/web/public/characters/` or reference external URLs.

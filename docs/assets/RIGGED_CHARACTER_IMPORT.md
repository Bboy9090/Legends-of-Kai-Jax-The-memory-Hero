# Rigged character masters (imported 2026-11-16)

Source: `legends-of-kai-jax_-the-memory-hero (1).zip` from the owner's Downloads folder (created 2026-11-15), `public/models/characters/*_master.glb`.

## What shipped

| Character | Source master (sha256, first 16) | Shipped file | Tris | Joints | Notes |
|---|---|---|---|---|---|
| kai | `48acf7be8d2a055c` | `models/characters/kai_master.glb` (1.7 MB) | see test | see test | 19 clips, 5 morph targets |
| jax | `41a3f4616c96db67` | `models/characters/jax_master.glb` (1.5 MB) | see test | see test | 19 clips, 5 morph targets |
| kaijax | `6b7d5c9399c6e4e3` | `models/characters/kaijax_master.glb` (2.4 MB) | see test | see test | 19 clips, 5 morph targets |
| borax | `1efd15bae76b7573` | `models/characters/borax_master.glb` (1.6 MB) | see test | see test | 19 clips, 5 morph targets |
| boryn | `58657935b21b2910` | `models/characters/boryn_master.glb` (1.4 MB) | see test | see test | 19 clips, 5 morph targets |

All five share the clips: ability_cast, attack_1-3, breathing, defeat, dodge, fall, heavy_strike, hit_reaction, idle, jump,
landing, parry, roar, run, sprint, victory, walk. Kai has 4 spider limbs (12 joints), Jax a 7-joint mane, Kai-Jax both plus
exactly three tails (ember, storm, memory). `src/assets/RiggedCharacters.test.ts` asserts all of this.

## Compression (lossless for rig and animation)

    gltf-transform resize  in.glb a.glb --width 1024 --height 1024
    gltf-transform webp    a.glb  b.glb --slots '*'
    gltf-transform meshopt b.glb  out.glb --level medium

No mesh simplification (unlike `scripts/compress-models.sh`, which simplifies by 15% and would alter these authored rigs).
Verified identical triangle counts, joint names, clip names/durations and morph targets before and after. Sizes: 6-9 MB raw -> 1.4-2.4 MB.

## Release authority

The runtime registry now loads these files, but `src/assets/coreCharacterAssetAuthority.ts` still records Kai, Jax and Kai-Jax as
`blocked-pending-approved-asset`: no owner approval receipt has been issued, and store packaging stays blocked until it is
(`scripts/import-approved-core-character-assets.mjs`).

## Removed

The superseded legacy files for Kai, Kai-Jax (9-tail), Borax and Boryn and their donor animations. Jaxon and Kaison keep their own legacy files.

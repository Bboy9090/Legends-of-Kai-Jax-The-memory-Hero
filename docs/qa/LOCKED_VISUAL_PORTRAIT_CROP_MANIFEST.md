# Locked Visual Portrait Crop Manifest

Source package: `LEGENDS_OF_KAI_JAX_LOCKED_VISUAL_LIBRARY_BASELINE.zip`

Purpose: preserve traceability from Fighter Select V2 portraits back to the creator-approved locked visual baseline. Cropping/resizing is permitted for UI presentation; character identity, costume, silhouette, faction, and visual design are not altered by this process.

## Source integrity

| Locked sheet | SHA-256 |
| --- | --- |
| `08_Main_Character_Lineup.png` | `13e463a5770edb32e1d556cbeafda0c625ea35b358a68fd790adc3793aec203f` |
| `09_Allies_and_Fracture_Circle.png` | `404acee7b74e9407c181dd76800ee3ad57f629b00c2b760aa6b35cdd6b6bb26b` |
| `06_Anti_Sabertooth_Covenant_Dossier.png` | `79f5fb582667b8743d340e9626da58919b769c919f7f491776f8e921d7075100` |
| `07_Major_Threats_Engineered_Horrors.png` | `7a34e1a681a4956dbcae24306dedd510a492522b794612d05534669637737c85` |
| `04_Fathers_Mentor_Elder_Fang.png` | `a6278552aa4882d5bf5d7fbe8111e1773a9dc504a11bf3a8bab22803af3b239e` |

## Prepared portrait map

A 6×4 UI sprite layout has been prepared from square 512×512 crops, downsampled into 256×256 cells. The final repository asset target is `apps/web/public/characters/locked/versus-roster-sprite.webp`.

| Fighter | Sheet | Sprite column | Sprite row |
| --- | --- | ---: | ---: |
| Boryn | 08 Main Character Lineup | 0 | 0 |
| Kai | 08 Main Character Lineup | 1 | 0 |
| Kai-Jax | 08 Main Character Lineup | 2 | 0 |
| Jax | 08 Main Character Lineup | 3 | 0 |
| Borax | 08 Main Character Lineup | 4 | 0 |
| Vharok | 04 Fathers Mentor Elder Fang | 5 | 0 |
| Aurelion | 09 Allies and Fracture Circle | 0 | 1 |
| Selene of the Veil | 09 Allies and Fracture Circle | 1 | 1 |
| Miri | 09 Allies and Fracture Circle | 2 | 1 |
| Old Moss | 09 Allies and Fracture Circle | 3 | 1 |
| Rikka the Ember-Tiny | 09 Allies and Fracture Circle | 4 | 1 |
| Mirek the Burrowed | 09 Allies and Fracture Circle | 5 | 1 |
| Sable Nine | 09 Allies and Fracture Circle | 0 | 2 |
| Ulgorr | 06 Anti-Sabertooth Covenant Dossier | 1 | 2 |
| Widow of the Alley | 06 Anti-Sabertooth Covenant Dossier | 2 | 2 |
| Varkesh the Grafted | 06 Anti-Sabertooth Covenant Dossier | 3 | 2 |
| Sybeth the Choir Mother | 06 Anti-Sabertooth Covenant Dossier | 4 | 2 |
| Ironvein Overseer | 06 Anti-Sabertooth Covenant Dossier | 5 | 2 |
| Korthyx Prime | 07 Major Threats Engineered Horrors | 0 | 3 |
| Pillar Twins | 07 Major Threats Engineered Horrors | 1 | 3 |
| Hollow Architect | 07 Major Threats Engineered Horrors | 2 | 3 |
| Fang Colossus | 07 Major Threats Engineered Horrors | 3 | 3 |
| Erasure Choir | 07 Major Threats Engineered Horrors | 4 | 3 |

## UI rules

1. Portrait crops are derivative presentation assets of the locked sheets, not new character designs.
2. No generative redraw, costume replacement, species substitution, recolor, or silhouette change is permitted in this lane.
3. Locked fighters may display their portrait immediately, but the Fight/Training actions remain disabled until a valid combat profile exists.
4. Boss/Covenant unlock conditions remain unspecified until a separate progression canon lock is approved.
5. The unused sprite cell at column 5, row 3 remains reserved; do not silently add a character there.

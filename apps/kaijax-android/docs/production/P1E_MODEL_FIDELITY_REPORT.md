# OPERATION KAI-JAX — P1-E MODEL FIDELITY & VISUAL DISCREPANCY REPORT

**Project:** Legends of Kai-Jax: The Memory Hero (`com.bobbyblanco.legendsofkaijax`)  
**Directive:** P1-E — Objective 2 (Character Fidelity Upgrade & Honest Discrepancy Audit)  
**Visual Authority:** 18 Official Visual Library Sheets (`/public/assets/aistudio/*.png`)  

---

## 1. Root-Cause Diagnosis of Pre-P1-E Character Discrepancies

Direct side-by-side comparison of the baseline P1 character turnarounds (`docs/production/captures/before/*.png`) against the 18 official Visual Library sheets exposed three high-severity defects in the pre-P1-E procedural GLB pipeline:

1. **glTF 2.0 Vertical UV Inversion (`v = 1.0 - uv[1]`)**:
   - In the baseline generator, `SculptMeshAccumulator` inverted `TEXCOORD_0.y` (`1.0 - acc.uvs[v][1]`), flipping the `4×4` PBR material atlas upside-down across all 10 `.glb` assets (`row 0 <-> row 3`, `row 1 <-> row 2`).
   - **Visual Symptom (Verified in `captures/before/char_lineup.png`)**: Kai's snow-white sabertooth fur mapped to dark pants tiles while his dark cargo pants mapped to snow-white fur; Boryn's golden tiger chest mapped to dark leather; Borax's royal navy-and-gold kumiko coat mapped to flat slate gray; all 5 heads appeared dark/inverted.
2. **Recessed Eye Socket Depth (`ez = 0.156 * S` vs. `0.183 * S` Cranium Surface)**:
   - The 3D almond predator eye lofts sat `~0.013 * S` behind the anterior sabertooth cranium surface, hiding the glowing irises and vertical slit pupils except at extreme grazing angles.
3. **Pelvis-to-Thigh Gap & Missing Secondary Silhouette Pieces**:
   - Thigh lofts terminated slightly below the torso hem without a continuous hip/pelvis trouser block, waist belt, or belt medallion.
   - Kai-Jax lacked sculpted knee greaves, front X-harness straps, and woven loincloth tabard; Borax lacked tiered samurai sode shoulder plates and calligraphy scroll detailing; Fang Syndicate enemies used simplified block primitives.

---

## 2. Implemented P1-E 3D & PBR Upgrades (`scripts/generate-canon-character-glbs.mjs` v2.5)

- **Corrected glTF 2.0 UV Orientation**: Restored direct `[0, 1]` `TEXCOORD_0` mapping (`uvFloat[v * 2 + 1] = acc.uvs[v][1]`) and verified every vertex UV lies strictly within `[0, 1]` in Automated Test Suite 17 (`src/game/__tests__/gameSystems.test.ts`).
- **Upgraded Embedded PBR Atlases (`1024×1024` Master / `512×512` LOD1)**:
  - Embedded BaseColor (`sRGB`), Occlusion-Roughness-Metallic (`ORM`), tangent-space Normal map (directional fur-strand relief, ripstop diamond weave, kumiko brocade embossing), and Emissive map (`emissiveFactor: [1, 1, 1]`).
  - Character-specific textile patterns: Kai violet cyber-piping & subtle white-tiger stripes; Jax & Kai-Jax branching cyan/violet storm veins; Boryn bold black-on-amber tiger stripes & runic war-tabard; Borax navy-and-gold kumiko diamond brocade & ivory brush scroll; Kai-Jax ember, storm, and cosmic-lattice tail gradients.
- **Upgraded Sabertooth Cranium, Predator Eyes & Costume Silhouettes**:
  - Bilobed feline muzzle with central philtrum cleft, dark triangular nose leather, articulated lower jaw (`roar` morph), twin curved blade-profile ivory sabertooth tusks, 3-tuft cheek ruffs, cupped feline ears, and proud convex almond predator eyes (`ez = 0.179 * S`) framed by dark feline eyeliner sockets and angled supraorbital brow ridges.
  - Continuous sculpted pelvis/hip trousers block + waist belt + gold medallion eliminating all hip-to-torso gaps.
  - Character-specific armor/garments: Kai purple shoulder yokes + 4 high-arching obsidian-gold-violet dorsal spider limbs; Jax 7 crystalline ice-cyan dorsal storm-mane crests; Kai-Jax Yin-Yang split white/obsidian fur, heterochromia eyes (Ember-Gold left / Storm-Cyan right), chest X-harness, gold knee greaves, violet loincloth, and **strictly 3 physical tails** (`tail_ember`, `tail_storm`, `tail_memory`); Boryn dark furred warrior mantle & diagonal leather baldric; Borax 20-plume silver lion-tiger mane & 2-tier gold samurai sode pauldrons.
- **Upgraded Fang Syndicate Enemy Rigs (`src/game/engine/CharacterBuilder.ts`)**:
  - Replaced blocky enemy primitives with multi-part hyena/jackal/boar beast-warrior silhouettes featuring sloped predator snouts, twin lower tusks, swept beast ears, asymmetrical spiked pauldrons, crimson Syndicate chest harnesses, digitigrade shin guards, and archetype weapons/shields matching Visual Library sheet `5c371ed9.png`.

---

## 3. Certified Per-Character Fidelity & Honest Discrepancy Matrix

> **Governance Rule Enforced**: Passing structural GLB validation does **not** equate to hand-sculpted ZBrush character art parity. Below is the honest comparison between our upgraded procedural lofted GLBs (`captures/after/`) and the hand-painted 2D Visual Library reference sheets.

| Character | Reference Sheet(s) | Master / LOD1 Tris | Joints / Tails / Clips | Before -> After Captures | Achieved Visual Identity | Remaining Procedural vs. Hand-Sculpted Gap (Requires External ZBrush/Blender Sculpt) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Kai** | `f9d37a6e.png`, `499cf6b7.png` | `8,840` / `4,515` (`2.85 MB` / `1.10 MB`) | `37` joints · `0` tails · `19` clips · `5` morphs | `before/char_kai.png` -> `after/char_kai.png` | Snow-white sabertooth fur with dark stripes, purple shoulder yokes, gold chest trim, dark ripstop cargo pants, white clawed sneakers, glowing violet-amber predator eyes, 4 dorsal spider limbs. | Asymmetric open streetwear collar drape, micro-zipper pulls, finger-level phalanx articulation, and asymmetric dynamic hair clump breakup require external organic sculpting. |
| **Jax** | `078f6bfc.png`, `499cf6b7.png` | `9,410` / `4,667` (`2.95 MB` / `1.10 MB`) | `32` joints · `0` tails · `19` clips · `5` morphs | `before/char_jax.png` -> `after/char_jax.png` | Obsidian-charcoal sabertooth fur, cyan storm-vein techwear jacket & cargo pants, electric blue sash, glowing cyan predator eyes, 7 luminous ice-cyan dorsal storm-mane crests. | Torn asymmetric scarf/collar cloth simulation, individual sculpted finger knuckles, and multi-layered translucent lightning shell cards require external sculpting/shader cards. |
| **Kai-Jax** *(Apex Fusion)* | `3e003001.png`, `499cf6b7.png` | `13,709` / `6,531` (`3.48 MB` / `1.44 MB`) | `56` joints · **STRICTLY `3` tails** · `19` clips · `5` morphs | `before/char_kaijax.png` -> `after/char_kaijax.png` | Canon Yin-Yang split white/obsidian sabertooth fur, heterochromia eyes (Ember-Gold / Storm-Cyan), gold-violet pauldrons, chest X-harness, gold knee greaves, violet tabard, 4 spider limbs, 7 storm crests, **strictly 3 distinct luminous tails** (Ember, Storm, Memory). | Hand-sculpted organic cloth folds on the split fusion longcoat tails, sculpted individual paw pads/fingers, and volumetric shader wisps along the 3 tails require external DCC sculpting. |
| **Boryn** *(Shield Mentor)* | `ffdee5d4.png` | `6,441` / `3,492` (`2.69 MB` / `0.98 MB`) | `29` joints · `1` tail · `19` clips · `5` morphs | `before/char_boryn.png` -> `after/char_boryn.png` | Heavyweight golden-amber sabertooth tiger physique with bold black stripes, oversized ivory tusks, dark furred shoulder mantle, diagonal leather baldric, inscribed tabard, 1 striped tail. | Facial battle scars, braided beard rings, asymmetric weathered pelt edge alpha cards, and embossed metallic relief buckles require ZBrush high-to-low normal baking. |
| **Borax** *(Storm Grandmaster)* | `ffdee5d4.png`, `3e978121.png` | `9,849` / `4,283` (`2.95 MB` / `1.05 MB`) | `29` joints · `1` tail · `19` clips · `5` morphs | `before/char_borax.png` -> `after/char_borax.png` | Silver-white sabertooth elder with 20-plume lion-tiger mane, royal navy-and-gold kumiko diamond-brocade haori robe, 2-tier gold samurai sode pauldrons, ivory scroll sash, 1 silver tail. | Wide kimono sleeve cloth simulation, gnarled elder muzzle wrinkles, individual alpha-card fur wisps on the mane, and knotted rope obi cordage require external DCC sculpting. |
| **Bovar** *(Adoptive Father)* | `ffdee5d4.png` (group mentor sheet only; solo turnaround absent) | **WITHHELD (`null`)** | `awaiting_visual_approval` | Governance enforced (`bovar_master.glb` absent) | Represented via comms portrait/narrative dialogue in Act I without fabricating unapproved solo 3D turnaround geometry. | Requires official solo front/side/back character turnaround sheet approval before 3D sculpting and rigging. |

---

## 4. External DCC Asset-Production Specification (For P2 ZBrush / Blender Sculpting Pass)

To elevate the 5 approved procedural-lofted `.glb` rigs to final AAA hand-sculpted parity while maintaining drop-in compatibility with `GLBCharacterController.ts`:
1. **Skeleton & Socket Contract**: Preserve exact bone names (`pelvis`, `spine_01..03`, `neck`, `head`, `jaw`, `clavicle_L/R`, `upper_arm_L/R`, `forearm_L/R`, `hand_L/R`, `thigh_L/R`, `shin_L/R`, `foot_L/R`, `toe_L/R`, `spider_UL/UR/LL/LR_01..03`, `mane_01..07`, `tail_ember_01..04`, `tail_storm_01..04`, `tail_memory_01..04`) and all 6 attachment sockets (`socket_weapon_L/R`, `socket_relic`, `socket_hitbox_L/R`, `socket_head`).
2. **Polycount & Texture Targets**:
   - Master hero `.glb`: `18,000–26,000` triangles, baked `2048×2048` tangent-space Normal + BaseColor + ORM + Emissive maps from high-poly ZBrush sculpt (`2M–4M` polys) with layered alpha-clipped fur cards along cheek ruffs, manes, and coat hems.
   - Mobile LOD1 `.glb`: `6,500–10,000` triangles, `1024×1024` KTX2/BasisU compressed textures.
3. **Morph Target Contract**: Preserve the 5 required facial blendshapes (`brow_fierce`, `roar`, `snarl`, `blink_L`, `blink_R`) plus lip-sync visemes (`aa`, `ee`, `oh`).

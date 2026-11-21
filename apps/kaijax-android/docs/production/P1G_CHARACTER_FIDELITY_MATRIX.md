# OPERATION KAI-JAX — P1-G CHARACTER FIDELITY & VISUAL LIBRARY RECONCILIATION MATRIX

**Project:** Legends of Kai-Jax: The Memory Hero (`com.bobbyblanco.legendsofkaijax`)  
**Phase:** P1-G — Character Mastering, Combat Feel & Native Android Certification  
**Generator Pipeline:** `scripts/generate-canon-character-glbs.mjs` (`v3.0 P1-G Mastered`)  
**External Sculpt Hand-Off Contract:** `docs/production/BLENDER_CHARACTER_ASSET_SPEC.md` & `scripts/blender_rig_contract.json`  
**Automated Binary Validators:** `scripts/validate-character-glbs.mjs` & `scripts/certify-character-glbs.mjs` (`10/10 PASS`)  

---

## 1. Reconciliation of All 18 Authoritative Visual Library Sheets

All **18** official Visual Library PNG sheets in `/public/assets/aistudio/` were inspected and reconciled against the character asset registry (`src/game/data/characterAssetRegistry.ts`):

| Sheet File (`/public/assets/aistudio/`) | Category | Canonical Subject & Reconciliation Status |
| :--- | :--- | :--- |
| `ChatGPT_Image_Aug_3__2026__04_50_12_PM__1__078f6bfc.png` | **Primary Hero & Father Lineup** | **Authoritative Reference** for **Boryn** (The Shield), **Kai** (Memory-Web Heir), **Kai-Jax** (Fusion Hero — Ember Memory, Storm Current, Memory Weave), **Jax** (Storm Fang), and **Borax** (The Law). |
| `ChatGPT_Image_Aug_3__2026__04_50_13_PM__3__3e003001.png` | **Fathers, Mentor & Elder Fang** | **Authoritative Reference** for **Boryn**, **Borax**, and **Vharok** (The Elder Fang — P2 NPC). Confirms Bovar is **absent** from the Fathers/Mentors visual lineup. |
| `ChatGPT_Image_Aug_3__2026__04_50_13_PM__2__499cf6b7.png` | **First Sabertooth Gods** | Lore Pantheon reference (`Kar-Voth`, `Thryxen`, `Pyraxis`, `Myrr'Kai`) — informs bloodline sigils, relic motifs, and elemental palettes. |
| `ChatGPT_Image_Aug_3__2026__04_50_13_PM__4__ffdee5d4.png` | **Allies & Fracture Circle** | P2+ Ally Dossier (`Aurelion`, `Selene of the Veil`, `Miri`, `Old Moss`, `Rikka`, `Mirek`, `Sable Nine`). |
| `ChatGPT_Image_Aug_3__2026__04_50_13_PM__5__5c371ed9.png` | **Faction Dossier — Fang Syndicate** | Enemy Faction Reference (`Fang Syndicate Enforcer`, `Razor Scout`, `Chain Bruiser`, `Tunnel Stalker`, `Fang Broker`, `District Lieutenant`). |
| `ChatGPT_Image_Aug_3__2026__04_50_14_PM__6__3e978121.png` | **Faction Dossier — Covenant** | Anti-Sabertooth Covenant enemy hierarchy & alchemical armor motifs. |
| `ChatGPT_Image_Aug_3__2026__04_50_14_PM__7__85105f23.png` | **World / Lineage Codex** | Raging City bloodline & faction emblem reference. |
| `ChatGPT_Image_Aug_3__2026__04_50_02_PM_e94e8100.png` | **Visual Library Cover / Crest** | Key emblem & title typography reference. |
| `ChatGPT_Image_Aug_3__2026__04_56_26_PM__2__d438c610.png` | **District Sheet — Ashblock Heights** | **Authoritative Act I Arena Reference** — stacked tenement blocks, `"STRENGTH THROUGH UNITY"` / `"REMEMBER WHAT THEY TRIED TO ERASE"` / `"TRUST — WE SEE YOU"` murals, elevated catwalks, rooftop perches, market awnings. |
| `ChatGPT_Image_Aug_3__2026__04_56_25_PM__1__f9d37a6e.png` | **District Sheet** | Raging City skyline & district architecture reference. |
| `ChatGPT_Image_Aug_3__2026__04_56_26_PM__3__e05fb785.png` | **District Sheet** | Sector / industrial transit reference. |
| `ChatGPT_Image_Aug_3__2026__04_56_26_PM__4__a43aff68.png` | **District Sheet** | Sanctum / rooftop temple architecture reference. |
| `ChatGPT_Image_Aug_3__2026__04_56_26_PM__5__d2fb286b.png` | **District Sheet** | Neon night market / alley reference. |
| `ChatGPT_Image_Aug_3__2026__04_56_27_PM__6__16464786.png` | **District Sheet** | Bridge / storm spire architecture reference. |
| `ChatGPT_Image_Aug_3__2026__04_56_27_PM__7__1f74b763.png` | **District Sheet — Library of Threads** | Memory archive district reference. |
| `ChatGPT_Image_Aug_3__2026__04_56_27_PM__8__0e91caa6.png` | **District Sheet — Fang Syndicate Stronghold** | Underground pit & `"NO LAW ONLY FANG"` / `"PAIN IS CURRENCY"` signage reference. |
| `ChatGPT_Image_Aug_3__2026__04_56_28_PM__9__e5b27b30.png` | **District Sheet — Fracture Pit & Undercity** | Subterranean chasm & `"THE DEEP REMEMBERS"` reference. |
| `ChatGPT_Image_Aug_3__2026__04_56_29_PM__10__fbb50f2d.png` | **District Sheet — Hollow Fang Cathedral** | Covenant gothic cathedral & containment wing reference. |

### Bovar Visual Governance Status
- **Bovar (`bovar`):** Confirmed **absent as a visual character illustration** across all 18 Visual Library sheets (referenced in narrative/comms dialogue as Adoptive Father). Per strict canon governance, `bovar` remains `visualAuthorityStatus: 'awaiting_visual_approval'` with `masterGlbPath: null` and `lod1GlbPath: null` — zero speculative 3D geometry was fabricated for Bovar.

---

## 2. Preserved P1-E Baseline vs. P1-G v3.0 Mastered GLB Checksums & Geometry Metrics

All P1-E `.glb` binaries and source files are preserved intact in `/data/checkpoints/p1g-baseline/` (`SHA256SUMS.txt`) alongside baseline renders in `/docs/production/captures/p1g-before/`.

| Binary File | P1-E Baseline SHA-256 (First 16) | P1-G v3.0 SHA-256 (Full) | Size (MB) | Verts | Tris | Joints | Tails | Dorsal / Mane | Morphs | Clips |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: | :--- | ---: | ---: |
| `kai_master.glb` | `afc0e94a4209bfd1` | `28cb07afe7a6db1be1471fc16fb49651362d3aaf23d913b13335b9079e6b8902` | 2.90 | 6,653 | 11,278 | 37 | **0** | 4 spider limbs (12 bones) | 5 | 19 |
| `kai_lod1.glb` | `1c251a9bc46a0a65` | `635a90b19caa36a83b955b34d8d10dfd744ee7d4aae1d0614750098c0006f29f` | 1.13 | 3,622 | 5,761 | 37 | **0** | 4 spider limbs (12 bones) | 5 | 19 |
| `jax_master.glb` | `fe42a1a179cea130` | `c91bec2b31925d6e2e9f68d1b2ecb90d48b567cb915ad1378fefa8cccbda8509` | 2.97 | 6,809 | 11,527 | 32 | **0** | 7 swept storm crests | 5 | 19 |
| `jax_lod1.glb` | `00c43c88897d2554` | `b07e07411e30e34bb1cbf2b69160c9dd8e5aab738ebf4d8e93311f18ee753b23` | 1.14 | 3,895 | 6,135 | 32 | **0** | 7 swept storm crests | 5 | 19 |
| `kaijax_master.glb` | `e3d44819f4750d91` | `71d3f1f0a2ceb25ccabed095d6ebb3776b6d63761d63282613ba57c4c398fd14` | 3.55 | 9,478 | 16,192 | 56 | **3** | 4 spider + 7 storm crests | 5 | 19 |
| `kaijax_lod1.glb` | `96aaf004446ef814` | `8c450cf13928723b91e56c9e13efb56ae2cafbe3e7c10a9626f5cda1d926bd40` | 1.48 | 4,815 | 7,675 | 56 | **3** | 4 spider + 7 storm crests | 5 | 19 |
| `boryn_master.glb` | `f87c8da23259ff5c` | `93730682b3de9c613f500155ba1ca0cdb5dad1d48d7e4f77222828727a22f548` | 2.66 | 4,711 | 7,955 | 29 | **1** | Tiger warrior pauldrons | 5 | 19 |
| `boryn_lod1.glb` | `2c02fc9c8e61efa1` | `f0f04001fa303ef91798692e97e7d2004e8deae2b4df989d2d8ef79c088ad159` | 1.00 | 2,902 | 4,590 | 29 | **1** | Tiger warrior pauldrons | 5 | 19 |
| `borax_master.glb` | `28f3966ba10f3b1b` | `dde639dc3db3bfce530a8735f6d5c96f80b932197efb06c70f24260784d0171f` | 2.91 | 6,609 | 11,267 | 29 | **1** | Layered white lion mane | 5 | 19 |
| `borax_lod1.glb` | `ca2baa7b99638955` | `8a336a1b4cec0531cb968860d259a7e6a1aaffe490d6c23f2a751ed44f110424` | 1.06 | 3,421 | 5,285 | 29 | **1** | Layered white lion mane | 5 | 19 |

---

## 3. Side-by-Side Visual Audit: P1-E Baseline (`p1g-before`) vs. P1-G v3.0 (`p1g-after`) vs. Approved Artwork

### 3.1 Resolved Anatomical, UV & Silhouette Defects (P1-E → P1-G v3.0)
1. **Eliminated Forehead & Dorsal UV Seam Split (`p1g-before/char_kai.png` → `p1g-after/char_kai.png`):**
   - *P1-E Defect:* Cylindrical `atan2` UV projection wrapped across the frontal/dorsal centerline, splitting Kai's grey tiger stripes down the middle of his forehead and nose bridge.
   - *P1-G Fix:* Dedicated bilateral planar/tri-planar regional UV islands for cranium, muzzle, torso jacket, pants, boots, and eyes completely removed the centerline stripe discontinuity.
2. **Sculpted Sabertooth Muzzle Wedge, Brow Ridge & Illuminated Slit-Pupil Corneas:**
   - *P1-E Defect:* Rounded seal-like snout sphere with dark unpupiled eye sockets.
   - *P1-G Fix:* Forward-projecting sabertooth maxillary muzzle wedge (`Side Profile` verified in `p1g-after/char_*.png`), articulated mandible/chin tuft, angled predator brow ridges, curved ivory upper sabertooth canines weighted `1.0` to `head`, and bright emissive feline slit-pupil corneas (violet on Kai, ice-cyan on Jax, amber-gold right + ice-cyan left heterochromia on Kai-Jax, golden amber on Boryn & Borax).
3. **Kai's Open Streetwear Tech-Hoodie, Cargo Joggers, High-Top Sneakers & 4 Gold-Jointed Spider Limbs:**
   - *P1-E Defect:* Closed white tube torso with horizontal purple bands on legs and unjointed curved tubes on back.
   - *P1-G Fix:* Open white/violet tech-jacket lapels over inner grey shirt + gold chain pendant, charcoal cargo joggers with side thigh pockets (zero horizontal leg bands), laced white/purple high-top clawed sneakers, and 4 articulated dorsal spider limbs (`spider_limb_UL/UR/LL/LR_01..03`) featuring gold ball-joint knuckles and taut web threads.
4. **Jax's 7 Backward-Swept Cobalt-Cyan Storm-Mane Crests & Open Tech-Jacket:**
   - *P1-E Defect:* Rigid white radial spikes sticking straight out like flat cones (`p1g-before/char_jax.png`).
   - *P1-G Fix:* 7 multi-segment backward-curving cobalt/ice-cyan storm-mane locks (`mane_crest_01..07`) sweeping dynamically behind the cranium and shoulders (`Side Profile` in `p1g-after/char_jax.png`), paired with an open obsidian storm-vein jacket, royal-blue trim, cargo joggers, and laced blue/black high-top clawed sneakers.
5. **Kai-Jax Convergence Rig & Strictly 3 Primary Physical Tails:**
   - Verified split white/obsidian chimera fur, heterochromatic amber/cyan eyes, gold pauldrons & greaves, 4 dorsal spider limbs, 7 swept storm crests, and **strictly 3 primary physical tails** (`tail_ember_01..04`, `tail_storm_01..04`, `tail_memory_01..04` — 3 roots, 12 tail bones total).

### 3.2 Honest Remaining Gap vs. 2D Concept Art (External ZBrush/Blender Sculpt Scope)
Per P1-G governance (**"Do not claim exact likeness without side-by-side visual approval"**):
- **Approval Classification:** **Mastered Gameplay GLBs Certified for Playable P1-G Build — Pending External Sculpt Pass & Human Side-by-Side Visual Sign-Off for Final 1:1 Concept Likeness.**
- **Specific Remaining Artistic Differences vs. `078f6bfc.png` & `3e003001.png`:**
  1. **Micro-Fur Clumping & Hair Cards:** The 2D concept art features hundreds of asymmetric hand-painted cheek/mane fur tufts and translucent wispy lightning-arc hair cards on Jax and Borax; analytical procedural lofting produces clean stylized geometric tufts rather than organic sculpted fur cards.
  2. **High-Frequency Cloth Drapery & Hardware:** Concept illustrations include sculpted fabric micro-folds at elbows/knees, calligraphy talisman scrolls on Borax's belt (`3e003001.png`), skull belt buckle & prayer beads on Boryn, and asymmetric zipper/strap hardware on Kai and Jax's jackets.
  3. **Actionable Artist Path:** `docs/production/BLENDER_CHARACTER_ASSET_SPEC.md` and `scripts/blender_rig_contract.json` provide the exact bone hierarchy (`29–56` joints), `6` attachment sockets, `5` facial shape keys, `19` NLA clip names, stride speeds, and Blender 4.x Python export script so sculpted `.glb` files drop directly into `/public/models/characters/` with zero code changes.

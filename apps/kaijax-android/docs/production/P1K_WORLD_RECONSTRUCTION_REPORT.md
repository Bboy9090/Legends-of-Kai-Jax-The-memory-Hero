# OPERATION KAI-JAX — P1-K WORLD RECONSTRUCTION REPORT
## Modular 3D Environment Architecture, 8-District Canon Specification & Ashblock Heights Certification

- **Project:** *Legends of Kai-Jax: The Memory Hero* (`com.bobbyblanco.legendsofkaijax`)
- **Certification Timestamp:** `2026-11-15T03:14:56Z`
- **District Specification Module:** `src/game/data/districtSpecifications.ts` (`DISTRICT_PRODUCTION_SPECS`)
- **Modular GLB Generator:** `scripts/blender_build_ashblock_modular_glbs.py`
- **Modular Kit Directory:** `public/models/environments/ashblock/` (`ashblock_kit_manifest.json`)
- **Machine-Readable Certification:** `docs/production/p1j-p1k-certification.json`

---

## 1. Phase 0 & 1 — 8-District Canon & Visual Library Authority Matrix

Every district in `docs/CANON_BIBLE.md` was reconciled against the 18 official Visual Library sheets in `public/assets/aistudio/` and codified in `src/game/data/districtSpecifications.ts` with explicit source-authority classification (`direct_sheet` vs. `composite_sheets_inferred` — never fabricating phantom concept sheets):

| # | District | Controlling Visual Library Sheet(s) | Authority Status | Wave / Runtime Status |
| :-: | :--- | :--- | :--- | :--- |
| 1 | **Ashblock Heights** | `d438c610.png` (District Establishing), `fc340485.png` (Bloodward Rooftop), `f1ad7da8.png` (Kai Rooftop Web), `feeb7b78.png` (Syndicate Ambush) | `direct_sheet` | **Wave 1 — Playable & Reconstructed (6 Modular PBR GLBs)** |
| 2 | **Sector-7** | `bf0f1fa7.png` (Sector-7 Detention Architecture) | `direct_sheet` | Wave 2 Specification Ready |
| 3 | **Neon Ward** | `dfba5b07.png` (Neon Rooftop Combat) + `feeb7b78.png` + Canon Bible | `composite_sheets_inferred` | Wave 2 Specification Ready *(explicitly disclosed)* |
| 4 | **Iron Market** | `7b64a6d8.png` (Beast-Kin Street Bazaar) | `direct_sheet` | Wave 2 Specification Ready |
| 5 | **Undercrown** | `1e273665.png` (Subterranean Vaults & Aqueducts) | `direct_sheet` | Wave 3 Specification Ready |
| 6 | **Zenith Spires** | `2c789304.png` (High-Altitude Syndicate Towers) | `direct_sheet` | Wave 3 Specification Ready |
| 7 | **Erasure Fields** | `bc9ef3c7.png` (Fractured Ruin Horizon) + `6bfac5d6.png` + Canon Bible | `composite_sheets_inferred` | Wave 3 Specification Ready *(explicitly disclosed)* |
| 8 | **Memory Nexus** | `6bfac5d6.png` (Convergence Monolith & Echo Sanctuary) | `direct_sheet` | Wave 3 Specification Ready |

---

## 2. Phase 2–7 — Wave 1 Ashblock Heights Modular 3D Kit & Architecture

Instead of a single monolithic uneditable district mesh, Ashblock Heights is assembled in `src/game/engine/WorldBuilder.ts` from **6 modular PBR `.glb` assets** (exported with procedural 512x512 albedo + roughness PBR textures via headless Blender 3.4.1), paired with separated simplified `BoxCollider` physics volumes and `InstancedMesh` street props.

### Modular PBR GLB Assets (`public/models/environments/ashblock/`)
| Asset ID | File | Triangles | Size | Gameplay / Architectural Role | SHA-256 |
| :--- | :--- | ---: | ---: | :--- | :--- |
| `tenement_facade` | `ashblock_tenement_facade.glb` | 924 | 131.6 KB | Weathered brick/concrete tenement blocks, fire-escape balconies, lit dusk windows | `09f466690f54897d615b764446104f12378d48aa51d2553a3c8f886bb69874fa` |
| `skybridge_truss` | `ashblock_skybridge_truss.glb` | 684 | 120.7 KB | Spanning overhead steel truss walkways with physical web-swing attachment rings | `208c41283d81f4ec712325befe97892b51afc34127858f53938a9ccd884f2da3` |
| `rooftop_watertower` | `ashblock_rooftop_watertower.glb` | 508 | 112.4 KB | Timber-slat rooftop water tanks & steel legs defining the `d438c610.png` skyline | `78f970507ea654d9b37c8459a7f03dda20282e5d0557b5fa723d5ab950354236` |
| `bloodward_dojo` | `ashblock_bloodward_dojo.glb` | 216 | 106.7 KB | Boryn's Bloodward Loft rooftop dojo timber/brick pavilion & training deck (`fc340485.png`) | `2a619d825b75032595599bb7df9d0fcd576bba92214bd5b2af2bc6f70c63e15e` |
| `syndicate_relay` | `ashblock_syndicate_relay.glb` | 484 | 113.0 KB | Interactive High-Voltage Syndicate Arc Relay environmental takedown prop (4 arena placements) | `a20bff4870be5fec2e5d652b7a9d48603c3a610d5f269887d83c379811a94e4` |
| `market_awning_stall` | `ashblock_market_awning_stall.glb` | 120 | 104.2 KB | Street-level Beast-Kin Market awning stalls & crates | `72c3867cdfa879c006e790bbcf94bd0131a007bfe6a70ab9dfab3ed2374ad39c` |

- **Total Unique Kit Budget:** `2,936` triangles across 6 `.glb` files (`688.6 KB` total disk footprint).
- **Geometry-Attached Web Traversal (7/7 Anchors):** Every `WebAnchorNode` in `WorldBuilder.ts` now carries a verified physical `supportPoint` and `attachmentType` (`'skybridge_truss_girder'` or `'tenement_crane_davit'`) physically connected to overhead steel skybridge trusses or tenement crane davits — zero floating empty-air anchors.
- **Interactive Environmental Takedowns (4 Relays):** Four `EnvironmentalHazardNode` Syndicate Shock Relays (`pullRadius: 7.5m`, `aoeRadius: 4.2m`, `cooldownDuration: 12s`) allow Kai, Jax, and Kai-Jax to web-yank or storm-slam nearby enemies into high-voltage arc discharges (`[V]` key / contextual `Arc Takedown` touch button).
- **Live Legacy vs. Reconstructed Toggle:** `environmentMode: 'reconstructed' | 'legacy'` can be switched live in **Command Hub -> Settings -> Ashblock World Architecture** without restarting or losing campaign state.

---

## 3. Phase 8 — Same-Vantage Legacy vs. Reconstructed Comparison & 12-Step World Validation

### Same-Vantage Street Comparison (`Z = +13.5m` looking North)
| Metric | `legacy` Procedural Baseline (`04a`) | `reconstructed` Modular GLB World (`04b`) |
| :--- | :---: | :---: |
| **Modular GLBs Loaded** | Retained in cache (`legacy` group active) | `6 / 6` active in `reconstructedDetailGroup` |
| **Overhead Web Attachment** | Floating rings | Spanning steel skybridge trusses & crane davits (`allAnchorsGeometryAttached: true`) |
| **Interactive Arena Props** | Static cover blocks | 4 interactive Syndicate High-Voltage Arc Relays + Market Stalls + Bloodward Dojo |
| **Draw Calls (`1280x720`)** | `277` | `322` (`+45` draw calls for full modular skyline & props) |
| **Active Triangles** | `47,424` | `65,224` (`+17,800` tris — well within mobile/desktop WebGL budget) |

### Executable 12-Step Ashblock World Route (`10/10 Combined Route Checks PASSED`)
| World Step | Validation Objective | Status | Runtime Proof |
| :--- | :--- | :---: | :--- |
| **1 & 2** | Load reconstructed district (`6/6` GLBs) & sprint street | **PASS** | `modularKitLoadedCount: 6`, sprinted `Z=11.0 -> 2.13` (`05_step01_street_sprint_traversal.png`) |
| **3** | Zip / climb to elevated Bloodward Loft rooftop overlook | **PASS** | Zipped via `anchor-3` (`skybridge_truss_girder`) -> perched at `[14, 3.3, -28]` (`06_step02_rooftop_bloodward_overlook.png`) |
| **4** | Geometry-attached steel skybridge web swing | **PASS** | `isSwinging: true`, `activeWebAttachmentType: "skybridge_truss_girder"` (`07_step03_geometry_attached_skybridge_webswing.png`) |
| **5** | 3-enemy street encounter & free-flow combo | **PASS** | `initialEnemies: 3`, `comboCount: 2`, zero collider snagging |
| **6** | Trigger Syndicate Arc Relay environmental takedown | **PASS** | `environmentalTakedownsCount: 1` (`08_step05_syndicate_relay_environmental_takedown.png`) |
| **7** | Perfect parry & counterattack in street arena | **PASS** | `parries: 1`, `counterOpen: true` |
| **8** | Predator web pull & wall pin into Jax aerial combo | **PASS** | `snaredAfterPull: true`, `airborne: true` |
| **9** | Brother switch & Jax Storm-Step rooftop air dash | **PASS** | `activeHero: "jax"`, `velMag: 16.5 m/s` |
| **10** | Synchronized Duo Finisher & camera recovery | **PASS** | `thunderweb-execution` (`accepted: true`), zero camera wall clipping (`09_step09_duo_finisher_synchronized.png`) |
| **11 & 12** | Boss courtyard fusion, save to slot, reload & restore | **PASS** | `alleyGateOpen: true`, `memorySiteReconstructed: true`, `missionCompleted: true`, `modularKitLoadedCount: 6` after full browser reload + `legacyModeRegression.passed: true` |

---

## 4. Visual Evidence (`docs/production/captures/p1j-p1k/`)
- `03_p1k_modular_kit_6assets.png` — Studio inspection grid of all 6 modular Ashblock `.glb` assets
- `04_p1k_ref_vs_legacy_vs_reconstructed.png` — 3-column side-by-side comparison: Official Visual Sheet (`d438c610.png`) | Legacy Procedural Baseline (`04a`) | P1-K Reconstructed Modular GLB World (`04b`)
- `06_step02_rooftop_bloodward_overlook.png` — Elevated rooftop perch overlooking Boryn's Bloodward Loft dojo & tenement water towers
- `07_step03_geometry_attached_skybridge_webswing.png` — Web line anchored directly to overhead steel skybridge truss girder
- `08_step05_syndicate_relay_environmental_takedown.png` — Syndicate Shock Relay environmental takedown in reconstructed Ashblock Avenue
- `10_step10_kaijax_3tail_boss_courtyard.png` — Northern Boss Courtyard & breached Alley Gate with Kai-Jax 3-tail fusion

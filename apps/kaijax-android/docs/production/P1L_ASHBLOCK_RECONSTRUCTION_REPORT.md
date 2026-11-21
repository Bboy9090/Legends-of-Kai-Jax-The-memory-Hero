# OPERATION KAI-JAX — P1-L: ASHBLOCK HEIGHTS PREMIUM WORLD RECONSTRUCTION REPORT

**Project:** *Legends of Kai-Jax: The Memory Hero* (`com.bobbyblanco.legendsofkaijax`)  
**Operation:** `P1-L — Ashblock Heights Premium World Reconstruction`  
**Baseline Checkpoint:** `/data/checkpoints/p1l-baseline/`  
**Certified Checkpoint:** `/data/checkpoints/p1l-certified/SHA256SUMS.txt` (`28` SHA-256 digests)  
**Machine-Readable Telemetry:** `/docs/production/p1l-certification.json`

---

## 1. P0 — Recovered Build Protection & Android Packaging Hygiene

- **Automated Test Suite:** `npm test` passes **`23/23` suites** (`exit 0`), covering combat targeting, parries, aerial combos, geometry-attached web swinging, Duo Finishers, Kai-Jax strictly-3-tail fusion, save/load migration, 12-asset modular kit validation, continuous rooftop/skybridge traversal, and Android packaging hygiene.
- **Ignore & Workspace Sync Protection:**
  - `.gitignore` line 12 (`android/app/src/main/assets/public/`) and `dist/` prevent `202 MB` of duplicated generated web assets from inflating workspace synchronization (`449 MB` lean non-`node_modules` workspace footprint).
  - Verified `npm run build && npx cap sync android` (`0.303s`) packages `index.html`, `manifest.webmanifest`, `69` PWA precache entries, all **10** character `.glb` files (`5` Master + `5` LOD1), and all **12** Ashblock modular `.glb` assets + `ashblock_kit_manifest.json` (`782 KB`) into `android/app/src/main/assets/public/` on demand.
- **Preserved Assets & Systems:** All 5 reconstructed Meshy character `.glb` assets (`kai`, `jax`, `kaijax` strictly 3 physical tails / 12 tail bones, `boryn`, `borax`), P1-G articulated procedural fallbacks, Bovar exclusion, campaign save slots, and live `Reconstructed <-> Legacy` environment switching remain intact.

---

## 2. P1 — 12-Piece Modular PBR + Tangent-Normal + Baked-AO GLB Inventory

Controlled directly by Visual Library sheets `d438c610.png` (Ashblock Heights District), `d2fb286b.png` (Alley Storefronts & Tailoring), `f9d37a6e.png` (Boryn's Bloodward Loft Rooftop Sanctuary), and `e5b27b30.png` (Fang Syndicate Stronghold Courtyard).

Each `.glb` in `/public/models/environments/ashblock/` embeds 4 `512x512` PNG texture maps (`BaseColor + BakedAO`, `MetallicRoughness + Occlusion`, `Tangent-Space Normal`, `Emissive`) and is deduplicated at runtime (`11` shared PBR materials) and rendered via **`THREE.InstancedMesh`** (`1` GPU draw call per modular asset across **`133`** total district placements):

| # | Asset ID | File | Unique Tris | File Size | Material Key | Architectural Role |
|---:|---|---|---:|---:|---|---|
| 1 | `ashblock_tenement_facade` | `ashblock_tenement_facade.glb` | 552 | 80 KB | `ashblock_brick_warm` | Multi-story brick tenement with recessed window bays, stone cornices, AC units & roof parapet |
| 2 | `ashblock_tenement_corner_setback` | `ashblock_tenement_corner_setback.glb` | 352 | 67 KB | `ashblock_brick_ochre` | Stepped ochre corner block with recessed upper penthouse, Juliet balconies & antenna mast |
| 3 | `ashblock_alley_shopfront_row` | `ashblock_alley_shopfront_row.glb` | 192 | 55 KB | `ashblock_shopfront` | Ground-floor steel roller shutters, corrugated awning hood & warm lit transom windows |
| 4 | `ashblock_skybridge_truss` | `ashblock_skybridge_truss.glb` | 792 | 96 KB | `ashblock_steel_truss` | Riveted overhead steel lattice bridge with diagonal cross-bracing & catwalk deck |
| 5 | `ashblock_fire_escape_tower` | `ashblock_fire_escape_tower.glb` | 204 | 56 KB | `ashblock_steel_truss` | Switchback iron fire-escape balconies & angled stair stringers |
| 6 | `ashblock_rooftop_watertower` | `ashblock_rooftop_watertower.glb` | 360 | 70 KB | `ashblock_cedar_tank` | Elevated cedar-stave rooftop water tank with iron hoops, conical cap & 4-post steel trestle |
| 7 | `ashblock_rooftop_mech_cluster` | `ashblock_rooftop_mech_cluster.glb` | 228 | 60 KB | `ashblock_hvac_galv` | Galvanized rooftop HVAC louver unit, exhaust ducting & cellular mast |
| 8 | `ashblock_bloodward_dojo` | `ashblock_bloodward_dojo.glb` | 404 | 73 KB | `ashblock_dojo_timber` | Boryn's pitched-gable timber rooftop sanctuary with warm shojiclerestory & training porch |
| 9 | `ashblock_syndicate_relay` | `ashblock_syndicate_relay.glb` | 256 | 63 KB | `ashblock_syndicate_tech` | Interactive Fang Syndicate high-voltage arc transformer pylon |
| 10 | `ashblock_market_awning_stall` | `ashblock_market_awning_stall.glb` | 108 | 49 KB | `ashblock_market_fabric` | Beast-Kin street vendor counter with striped canopy & stacked supply crates |
| 11 | `ashblock_syndicate_gatehouse` | `ashblock_syndicate_gatehouse.glb` | 168 | 54 KB | `ashblock_stronghold_concrete` | Fortified Syndicate checkpoint wall with twin guard bastions, hazard striping & overhead gantry |
| 12 | `ashblock_courtyard_stronghold_arena` | `ashblock_courtyard_stronghold_arena.glb` | 204 | 56 KB | `ashblock_stronghold_armor` | Boss Courtyard central Stronghold bunker with floodlight rig, crimson conduits & armored cage |
| **Total** | **12 Modular Assets** | `/public/models/environments/ashblock/` | **3,820** | **782 KB** | **11 Shared PBR Materials** | **133 GPU-Instanced World Placements** |

---

## 3. P2 & P3 — Premium Combat Arenas, Continuous Traversal & Web Certification

- **Continuous Street-to-Rooftop Traversal Route (`23` Walkable Elevated Zones):**
  - **West & East Stepped Fire-Escape Landings:** Climbable from street level (`y = 0m -> 1.80m -> 3.65m -> 5.35m -> 7.05m`).
  - **Walkable Central Steel Skybridge (`y = 7.05m`, `z = -27.0`):** Connects West Rooftop Watch (`x = -16.8`) directly across the avenue to **Boryn's Bloodward Loft Sanctuary** (`x = 16.8, y = 7.05m`), with companion inline skybridge follow (`#3 PASS`: Kai `[19.64, 7.05, -27.0]`, Jax `[11.83, 7.05, -25.92]`, `grounded = true`).
  - **Syndicate Gatehouse Gantry (`y = 5.40m`, `z = -48.0`) & Boss Courtyard Flanking Balconies (`y = 4.60m`, `x = ±14.8, z = -66.0`):** Continuous elevated overwatch into the Boss Courtyard.
- **Mission 1 Boss Courtyard & Fang Syndicate Arenas:**
  - Central Stronghold Bunker (`ashblock_courtyard_stronghold_arena.glb`) crowned with `"FANG SYNDICATE · STRONGHOLD COURTYARD - RESTRICTED ZONE"` neon header, flanking multi-tier tenements, elevated side balconies (`y = 4.60m`), angled armored cover barricades, and **5 interactive Syndicate High-Voltage Arc Relays** (`3` street/alley + `2` Boss Courtyard).
- **100% Geometry-Socketed Web Anchors (`10/10` Verified `<= 0.35m`):**
  - Every `WebAnchor` (`wb-south-skybridge`, `wb-west-tenement-cornice`, `wb-east-tenement-cornice`, `wb-central-skybridge`, `wb-loft-watertower`, `wb-west-watertower`, `wb-north-alley-arch`, `wb-gate-gantry`, `wb-courtyard-west-crane`, `wb-courtyard-east-crane`) is physically socketed to steel skybridge trusses, stone cornices, water-tower trestles, or Stronghold gantries (`allAnchorsGeometryAttached: true`).

---

## 4. P4 & P5 — Visual Atmosphere & Mobile Performance Optimization

- **Visual Atmosphere:** Custom vertex-colored golden-amber/violet dusk sky dome (`d438c610.png` palette), 3 colossal Beast-God horizon monolith silhouettes, distant skyline spires, elevated steel rail viaduct (`z = -96`) with animated lit transit train, warm alley string-light garlands, district signage (`ASHBLOCK ROW`, `BEAST-KIN MARKET`, `FANG & CLAW TAILORING`, `FANG SYNDICATE`, `REMEMBER WHAT THEY TRIED TO ERASE`), and drifting dusk motes.
- **GPU Batching Architecture:**
  1. `WorldBuilder.ts`: All 12 modular `.glb` kits converted to `THREE.InstancedMesh`; static catwalks, handrails, support columns, armored cover, Beast-God monoliths, skyline towers, viaduct spans, and train cars merged by material via `BufferGeometryUtils.mergeGeometries`.
  2. `CharacterBuilder.ts`: Static sub-meshes inside each articulated enemy joint group (`bodyGroup`, `leftArm`, `rightArm`, `weaponGroup`, `leftLeg`, `rightLeg`) merged per material while preserving animated pivots, hit-flash `visorMat`, and `enemy_riot_shield`.
- **Measured `844x390` Landscape Performance Profile (`docs/production/p1l-certification.json`):**

| Workload / Quality Tier | Draw Calls | Active Triangles | Geometries | Textures | CPU Sim Avg | Steady Render Submit* |
|---|---:|---:|---:|---:|---:|---:|
| **Reconstructed Exploration (`Balanced`, 4 Meshy Heroes/Mentors, 0 Enemies)** | **54** | **60,832** | **121** | **40** | `< 0.50 ms` | `< 7.0 ms` |
| **Full 5-Enemy Patrol Combat — `Low` (`LOD1`, DPR `1.0`, Secondary Detail Culled)** | **152** | **62,800** | **220** | **40** | **0.473 ms** | **7.5 ms** |
| **Full 5-Enemy Patrol Combat — `Balanced` (`LOD1`, DPR `1.35`, `1024` Shadow Map)** | **167** | **66,124** | **221** | **40** | **1.510 ms** | **10.5 ms** |
| **Full 5-Enemy Patrol Combat — `High` (`Master`/`LOD1`, DPR `1.75`, Viaduct + Motes)** | **159** | **66,060** | **221** | **40** | **1.417 ms** | **7.0 ms** |

*\*Measured in headless Chromium `844x390` (`isSoftwareGl: true`, CPU SwiftShader). Estimated GPU texture memory across all `40` active textures (`12 x 4` deduplicated `512x512` world maps + procedural decals + `5` LOD1 character atlases) is **`~44 MB` RGBA uncompressed**. Native Android Gradle APK compilation (`./gradlew assembleDebug`) and physical Adreno/Mali hardware frame-time telemetry were not executed in this Linux container because Android SDK/JDK and physical Android hardware are not attached.*

---

## 5. P6 — 12-Point Regression Certification & Visual Evidence

All **12/12** live certification checks passed (`node scripts/certify-p1l-ashblock.mjs`):

1. **[PASS] Character selection & spawning:** All 5 Meshy GLBs (`kai`, `jax`, `kaijax`, `boryn`, `borax`) + all 12 Ashblock modular GLBs (`133` instanced placements, `11` deduplicated materials) ready.
2. **[PASS] Street traversal & grounded sprinting:** Verified sprint velocity and grounded clip transitions along Ashblock Row.
3. **[PASS] Continuous rooftop & skybridge traversal:** Stepped fire-escape ascent (`1.80m -> 3.65m -> 5.35m -> 7.05m`) -> walkable central skybridge -> Bloodward Loft sanctuary with companion Jax following onto `y = 7.05m`.
4. **[PASS] Geometry-attached web swinging:** Active pendulum swing verified (`wb-south-skybridge`, `skybridge_truss_girder`) with `10/10` anchors physically socketed.
5. **[PASS] Enemy encounters, free-flow combo & parry:** Multi-hit light/heavy combo chain + `0.10s` perfect parry counter verified.
6. **[PASS] Environmental takedowns:** Contextual Syndicate High-Voltage Arc Relay takedown verified in street and Boss Courtyard encounters.
7. **[PASS] Duo Finishers:** Synchronized two-button cooperative Kai + Jax finisher verified.
8. **[PASS] Mission 1 completion & 3-tail Kai-Jax Fusion:** Boss Courtyard victory + strictly 3 physical tail chains (`12` tail bones) verified.
9. **[PASS] Save/reload continuity:** Slot-1 save persisted and restored `missionCompleted`, `fusionUnlocked`, `memorySiteReconstructed`, `alleyGateOpen`, and `12/12` modular GLBs across full browser reload.
10. **[PASS] Reconstructed / Legacy live switching:** Instant toggle verified (`27` Legacy world draw calls <-> `48` Reconstructed world draw calls).
11. **[PASS] Android asset packaging & Mobile `844x390` budget:** `0` out-of-bounds touch controls (`17` visible buttons), `54` exploration draw calls, `152` Low skirmish draw calls, `npx cap sync android` verified (`10` character GLBs + `12` Ashblock GLBs), and `.gitignore` sync protection confirmed.
12. **[PASS] Runtime integrity:** `0` HTTP 404s, `0` console errors, `0` page exceptions.

### Before / After & District Screenshot Index (`/docs/production/captures/p1l/`)
- `01_p1l_modular_kit_12assets.png` — Studio 4x3 contact sheet of all 12 modular PBR+Normal+BakedAO `.glb` assets
- `02_p1l_street_ref_before_after.png` — Triptych: Controlling Artwork (`d438c610.png`) vs. Legacy Street vs. P1-L Reconstructed Ashblock Row
- `02a_p1l_legacy_street.png` / `02b_p1l_reconstructed_street.png` — Matched-camera Before/After street plates
- `03_p1l_rooftop_skybridge_network.png` — Kai & Jax on the `y = 7.05m` walkable central skybridge overlooking Beast-Kin Market & Bloodward Loft
- `04_p1l_bloodward_dojo_sanctuary.png` — Boryn's Bloodward Loft rooftop sanctuary (`f9d37a6e.png`)
- `05_p1l_alley_market_and_gatehouse.png` — Alley storefronts, striped market awnings & fortified Fang Syndicate Gatehouse
- `06_p1l_geometry_attached_webswing.png` — Geometry-socketed web swing anchored to overhead steel skybridge girder
- `07_p1l_boss_courtyard_ref_before_after.png` — Triptych: Stronghold Artwork (`e5b27b30.png`) vs. Legacy Courtyard vs. P1-L Stronghold Boss Arena
- `07a_p1l_legacy_boss_courtyard.png` / `07b_p1l_reconstructed_boss_courtyard.png` — Matched-camera Before/After Boss Courtyard plates
- `08_p1l_boss_arena_combat_takedown.png` — 3-tail fused Kai-Jax executing a Syndicate Arc Relay environmental takedown on the Fang Enforcer boss
- `09_p1l_mobile_844x390_perf_hud.png` — Mobile `844x390` landscape HUD and 5-enemy skirmish clarity

# OPERATION KAI-JAX — P1-I: AI CHARACTER RECONSTRUCTION, PROFESSIONAL RIGGING & GAMEPLAY INTEGRATION REPORT

**Project:** *Legends of Kai-Jax: The Memory Hero* (`com.bobbyblanco.legendsofkaijax`)  
**Phase:** P1-I — AI Character Reconstruction, Headless Blender 3.4.1 Rigging, 19-Clip Animation Retargeting & Mobile LOD1 Certification  
**Overall Certification Status:** **PASS** (`10 / 10` Meshy AI + Blender 3.4.1 Rigged GLBs Certified · `19 / 19` Game Systems Acceptance Suites Passing · `0` Vite WebSocket / Runtime Console Errors)  
**Machine-Readable Evidence:**
- `docs/production/p1i-rig-validation.json` (Headless Blender 3.4.1 7-Pose Deformation Stress Report)
- `docs/production/glb-certification-report.json` (Binary glTF 2.0, Skeleton, Morph, Socket & Three.js `AnimationMixer` Report)
- `docs/production/p1i-certification.json` (Playwright + Three.js Studio, Gameplay, Version-Switch & Zero-WS Report)

---

## 1. Phase 0 — Capability Discovery & Authorized AI 3D Pipeline

| Capability | Environment Status | Role in P1-I Pipeline |
|---|---|---|
| **Meshy Multi-Image-to-3D API** (`https://api.meshy.ai/openapi/v1/multi-image-to-3d`) | **ACTIVE & AUTHORIZED** (`MESHY_API_KEY` configured in server Secrets; `meshyConfigured: true`) | Primary 3D mesh & PBR texture generator (`should_remesh: true`, `should_texture: true`, `enable_pbr: true`) via server-side `/api/character-pipeline/meshy/reconstruct`. Raw AI GLBs cached in `data/meshy-raw/*_meshy_raw.glb`. |
| **Headless Blender 3.4.1 (`bpy` + `io_scene_gltf2`)** | **INSTALLED & VERIFIED** (`/usr/bin/blender`, Python 3.11, NumPy) | Automated stature normalization, Master/Mobile LOD1 decimation, vectorized 4-bone capsule skinning + 6-pass Laplacian edge-neighbor weight smoothing, 5 Gaussian facial shape keys, 6 combat sockets, 19-clip NLA retargeting, and 7-pose deformation validation (`scripts/blender_autorig_external_glb.py`, `scripts/blender_p1i_rig_and_validate.py`). |
| **External `.glb` / `.gltf` / `.fbx` / `.obj` Auto-Rig Importer** | **ACTIVE** (`POST /api/character-pipeline/import-glb` + Command Hub UI) | Allows one-click local import and automatic Blender 3.4.1 rigging + 19-clip retargeting of custom artist sculpts without exposing any API keys in client UI. |
| **Preserved Baselines & Fallbacks** | **PRESERVED** (`data/checkpoints/p1i-baseline/SHA256SUMS.txt` & `public/models/characters/p1g/`) | All 10 P1-G v3.0 `.glb` files and runtime procedural `CharacterBuilder` rigs remain selectable in Settings (`CharacterModelVersion`). |

---

## 2. Phase 1 & Phase 2 — Multi-View Orthographic Reconstruction & Meshy AI 3D Generation

1. **Authoritative Visual Anchors:**
   - All 5 approved characters (`kai`, `jax`, `kaijax`, `boryn`, `borax`) were anchored strictly to the official *Legends of Kai-Jax Visual Library* sheets (`ChatGPT_Image_Aug_3__2026__04_50_12_PM__1__078f6bfc.png` and `ChatGPT_Image_Aug_3__2026__04_50_13_PM__3__3e003001.png`).
   - Consistent 4-view orthographic reconstruction sheets (`front.png`, `side.png`, `back.png`, `three_quarter.png`, and composite `turnaround_4view.jpg`) are stored in `public/models/reconstruction-sheets/<characterId>/` alongside `manifest.json`.
   - **Governance Enforcement:** `bovar` remains strictly gated (`visualAuthorityStatus: 'awaiting_visual_approval'`) with **zero** fabricated turnaround sheets or `.glb` binaries because the Fathers/Mentors Visual Library sheet (`3e003001.png`) depicts Boryn, Borax, and Vharok rather than Bovar.
2. **True 3D AI Mesh Reconstruction:**
   - Each approved character's multi-view orthographic plates (`front.png`, `side.png`, `back.png`) were submitted to Meshy's `multi-image-to-3d` endpoint, producing full 360-degree 3D watertight geometry with baked BaseColor, Metallic-Roughness, and tangent-space Normal PBR maps (`data/meshy-raw/<id>_meshy_raw.glb`).

---

## 3. Phase 3, Phase 4 & Phase 6 — Rigging, 19-Clip Retargeting & Mobile Optimization Budgets

All 5 Meshy 3D sculptures were compiled through `scripts/blender_autorig_external_glb.py` into both **Master (`*_master.glb`)** and **Mobile LOD1 (`*_lod1.glb`)** production assets:

| Character | Canon Stature | Skeleton Joints | Special Appendage Bones | Master Tris (Budget ≤ 28k–35k) | Master Size | Mobile LOD1 Tris (Budget 8k–12k) | Mobile LOD1 Size | Morphs / Sockets / Clips |
|---|---:|---:|---|---:|---:|---:|---:|---|
| **Kai** (`kai`) | `1.82 m` (`2.08 m` w/ spider tips) | `37` | `12` spider (`4` dorsal limbs) · `0` tails | `22,087` | `6.23 MiB` | `9,211` | `3.58 MiB` | `5` / `6` / `19` |
| **Jax** (`jax`) | `1.88 m` (`1.94 m` w/ storm crest) | `32` | `7` storm-mane crests · `0` tails | `22,087` | `5.89 MiB` | `9,211` | `3.33 MiB` | `5` / `6` / `19` |
| **Kai-Jax** (`kaijax`) | `2.04 m` (`2.28 m` w/ spider tips) | `56` | `12` spider · `7` mane · **strictly `3` tails (`12` tail bones)** | `23,967` | `8.74 MiB` | `10,526` | `5.12 MiB` | `5` / `6` / `19` |
| **Boryn** (`boryn`) | `2.12 m` | `29` | `1` tiger tail (`4` tail bones) | `20,675` | `5.87 MiB` | `8,648` | `3.26 MiB` | `5` / `6` / `19` |
| **Borax** (`borax`) | `2.20 m` | `29` | `1` lion tail (`4` tail bones) | `22,082` | `6.71 MiB` | `9,212` | `3.72 MiB` | `5` / `6` / `19` |
| **Bovar** (`bovar`) | `1.92 m` (Target) | — | Gated (`awaiting_visual_approval`) | `0` (Withheld) | — | `0` (Withheld) | — | Gated |

### Headless Blender 3.4.1 7-Pose Deformation Validation (`docs/production/p1i-rig-validation.json`)
Every Master and Mobile LOD1 `.glb` (`10 / 10`) was imported into headless Blender 3.4.1 (`scripts/blender_p1i_rig_and_validate.py`) and evaluated through Blender's live Armature Depsgraph across 7 extreme poses (`rest_a_pose`, `shoulder_raise_65deg`, `elbow_deep_flex_95deg`, `combat_high_kick_hip_knee`, `sabertooth_roar_jaw_ears`, `supernatural_appendage_sweep`, `full_combat_guard_crouch`):
- **Finite Vertices & Degenerate Triangles:** `100%` finite (`allExtremePosesFinite: true`), `0` degenerate triangles across all 70 pose evaluations.
- **99th-Percentile Structural Edge Stretch (`maxP99PoseEdgeStretch`):**
  - `kai`: `PASS` (`≤ 3.45` across all poses)
  - `jax`: `PASS` (`2.337` Master / `2.142` LOD1)
  - `kaijax`: `PASS` (`3.285` Master / `3.238` LOD1)
  - `boryn`: `PASS` (`3.298` Master / `3.281` LOD1)
  - `borax`: `PASS` (`3.506` Master / `3.745` LOD1 — expected cloth stretch across Borax's continuous ankle-length ceremonial kimono hem during the `89°` scissor `combat_high_kick_hip_knee` stress test).
- **Embedded Gameplay Contract (`validate-character-glbs.mjs` & `certify-character-glbs.mjs`):**
  - **19 Animation Clips:** `idle`, `breathing`, `walk`, `run`, `sprint`, `jump`, `fall`, `landing`, `dodge`, `attack_1`, `attack_2`, `attack_3`, `heavy_strike`, `parry`, `hit_reaction`, `roar`, `ability_cast`, `victory`, `defeat`.
  - **5 Facial Morph Targets:** `blink`, `snarl`, `roar`, `pain`, `focus` (smooth Gaussian muzzle/brow envelopes).
  - **6 Attachment Sockets:** `socket_weapon_L`, `socket_weapon_R`, `socket_hitbox_L`, `socket_hitbox_R`, `socket_relic`, `socket_head`.

---

## 4. Phase 5 — Runtime Integration, Versioned Model Selection & Android Sync

1. **Versioned Character Pipeline (`CharacterModelVersion`):**
   - `p1i_reconstructed` *(Default)*: Loads the Meshy Multi-Image-to-3D + Blender 3.4.1 rigged models (`/models/characters/<id>_{master|lod1}.glb`), automatically choosing `*_lod1.glb` on low quality or software/mobile constrained GPUs and `*_master.glb` on high/medium hardware GPUs.
   - `p1g_mastered`: Non-destructively switches live at runtime to the preserved P1-G v3.0 models (`/models/characters/p1g/<id>_{master|lod1}.glb`).
   - `meshy_custom`: Loads user-imported/re-rigged models from `/models/characters/meshy/` with automatic fallback chain (`meshy` -> `p1i` -> `p1g` -> procedural).
   - `procedural_fallback`: Switches cleanly to the procedural `CharacterBuilder` rig.
2. **Live Ashblock Heights Gameplay & Capacitor Sync:**
   - Verified in headless Chromium WebGL on port `3000`: Title Showcase, Kai Free-Flow Combat, Instant Brother Switch (`Kai <-> Jax`), **Kai-Jax 3-Tail Convergence Fusion (`isFused: true`, `activeHero: 'kaijax'`)**, and live runtime switching across `p1i_reconstructed -> p1g_mastered -> procedural_fallback -> p1i_reconstructed`.
   - Synced production bundle and all character GLBs into `android/app/src/main/assets/public` via `npx cap sync android`.

---

## 5. Vite 8.3.0 WebSocket Fix Verification

- **Root Cause:** Vite `8.3.0`'s `forwardConsole` client instrumentation injected `/@vite/client` and attempted a WebSocket connection (`Error: WebSocket closed without opened at /@vite/client:234:30`) even with `hmr: false, ws: false`.
- **Fix:** Disabled `forwardConsole: false` in both `vite.config.ts` and `server.ts`, and mounted an explicit zero-WebSocket `/@vite/client` ES module shim in `server.ts` preserving `ErrorOverlay`, `updateStyle`, `removeStyle`, `createHotContext`, and `injectQuery`.
- **Verification (`docs/production/p1i-certification.json`):** `viteWebSocketErrors: []` (`0`), `appConsoleErrors: []` (`0`), `appPageExceptions: []` (`0`).

---

## 6. Honest Visual Comparison Against Official 2D Concept Art

Visual captures stored in `docs/production/captures/p1i/`:
- **5-Hero Canon Lineup:** `p1i_lineup_5heroes.png`
- **Per-Character 4-View Studio Turnarounds:** `p1i_{kai,jax,kaijax,boryn,borax}_4view_master.png`
- **4-Column Direct Comparisons (Approved 2D Art | P1-G v3.0 Baseline | P1-I Reconstructed Master | Mobile LOD1 Combat Pose):** `p1i_{kai,jax,kaijax,boryn,borax}_compare_vs_p1g.png`
- **Live Ashblock Heights Gameplay Captures:** `p1i_title_showcase.png`, `p1i_gameplay_kai_combat.png`, `p1i_gameplay_jax_switch.png`, `p1i_gameplay_kaijax_fusion_3tails.png`

### Strengths Achieved Over P1-G v3.0
- **Anatomical Sabertooth Sculpting:** Genuine 3D sabertooth muzzles, curved ivory fangs, brow horn-crests, ear tufts, and layered mane volume replace P1-G's primitive geometric head/torso primitives.
- **Costume & Accessory Accuracy:** Kai's white/violet street-techwear hoodie, gold chains, `MF` belt buckle, cargo straps, and dorsal spider harness; Jax's lightning-veined bomber jacket, electric-blue storm mane, and cobalt sash; Kai-Jax's split white/obsidian face, 4 dorsal spider limbs, high-collared fusion coat, and **3 distinct sculpted elemental tails** (orange Ember, cyan Storm, violet Memory); Boryn's skull leather harness, striped tiger musculature, and runic tabard; Borax's layered navy/gold samurai robes and calligraphy scroll sash.

### Remaining Single-Mesh AI Tradeoffs (Documented Transparently)
- Because Meshy generates a single continuous watertight surface mesh (1 unified material per character) rather than separate sub-meshes for loose garments/straps, ankle-length robes (`borax`) and long coat tails (`kaijax`) bridge across the inner legs as continuous geometry and stretch slightly at extreme wide-stance leg splits (`p99Stretch = 3.51–3.75`). Future artist pass in Blender can split Borax's lower kimono panels onto dedicated cloth/skirt bones if wider martial-arts leg splits are desired for mentor cutscenes.

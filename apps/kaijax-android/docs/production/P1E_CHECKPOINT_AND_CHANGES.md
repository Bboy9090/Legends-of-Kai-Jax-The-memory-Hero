# OPERATION KAI-JAX — P1-E CHECKPOINT MANIFEST & MODIFIED FILE LEDGER

**Project:** Legends of Kai-Jax: The Memory Hero (`com.bobbyblanco.legendsofkaijax`)  
**Directive:** P1-E — Objective 1 & Deliverable 7 (Recoverable Baseline Checkpoint & Change Manifest)  

---

## 1. Recoverable Pre-P1-E Baseline Checkpoint (`/data/checkpoints/p1e-baseline/`)

Before any P1-E modifications were applied, all 10 baseline `.glb` binaries, key baseline source files, and 13 `BEFORE` screenshots were archived outside `public/` (preventing Vite/Capacitor bundle bloat):

- **Archived Baseline Models**: `/data/checkpoints/p1e-baseline/models/*.glb` (`10` files)
- **Archived Baseline Source Files**: `/data/checkpoints/p1e-baseline/source/*`
- **Archived Baseline Checksums**: `/data/checkpoints/p1e-baseline/SHA256SUMS.txt`
- **Archived BEFORE Visual Captures**: `/docs/production/captures/before/*.png` (`13` PNG captures)

### Rollback Procedure (If Required)
```bash
cp /app/applet/data/checkpoints/p1e-baseline/models/*.glb /app/applet/public/models/characters/
cp /app/applet/data/checkpoints/p1e-baseline/source/generate-canon-character-glbs.mjs /app/applet/scripts/
cp /app/applet/data/checkpoints/p1e-baseline/source/GameHUD.tsx /app/applet/src/components/
cp /app/applet/data/checkpoints/p1e-baseline/source/*.ts /app/applet/src/game/engine/
```

---

## 2. Pre-P1-E vs. Post-P1-E SHA-256 Checksum Ledger

| File Path | Pre-P1-E Baseline SHA-256 | Post-P1-E Upgraded SHA-256 |
| :--- | :--- | :--- |
| `public/models/characters/kai_master.glb` | `5cc5ea61cc88fdd0abc51910761ed255021e025541fe18192129e8b6010925a3` | `afc0e94a4209bfd163808b08eee06815e4f78a654f61a76ab9409c135038b589` |
| `public/models/characters/kai_lod1.glb` | `8ff7a20a2c7c063596ab35d4d7bdf9a786d7c51f18933fecfbd7aacba2f007b7` | `1c251a9bc46a0a6522c4b1f808689e429888510dcce365393551647c72bbdbac` |
| `public/models/characters/jax_master.glb` | `46b6fd262285e2ea4651633a0d83e68f15ce6aeb27e0d9f7afbbeadeaa06fd91` | `fe42a1a179cea130f5726adddd4f645b037013e639d29ae657f2e298c0562018` |
| `public/models/characters/jax_lod1.glb` | `b0eaf9773779082385eb74a2e2578f14a8d1bccff6a7c51fca0de8811e621f95` | `00c43c88897d25546576ce2b6cdeb8166f65f50e0d660853f21e2fbc12c8fed1` |
| `public/models/characters/kaijax_master.glb` | `7db8aea3cac1b6c40674b8f02d51ecd074daad7776c6c4db2bd5971b76216882` | `e3d44819f4750d913c9d8f83a188634c2c4c901f1012a5f6584109ddc31531e9` |
| `public/models/characters/kaijax_lod1.glb` | `a78056834a4c338298dc02864e22419ddcc1bf26bac0447bf9d557b66911f974` | `96aaf004446ef814ff5f39150e64c0ceaab665ea37e3eb1efa22a3b6c3cc95d8` |
| `public/models/characters/boryn_master.glb` | `3f7be4909a6cac38c79d2d9e4ba4793125697c40e3a87c9004ada5c91758e971` | `f87c8da23259ff5c827748d0ddd3159964ea13e724e7a9dd2504fd8cac2433b0` |
| `public/models/characters/boryn_lod1.glb` | `ada715ee42275bffa2e28614b0b44a696cca3b4cbb4441218506782a2426586c` | `2c02fc9c8e61efa1472bdda464302e990ac13f8fda173594068caecb616dcb4f` |
| `public/models/characters/borax_master.glb` | `2a08bb14b70b91bcd9f65c9f8e108225b48d31140263b378f918fca5c7735829` | `28f3966ba10f3b1baa8075f7fec4b104b3c72e1b8825e0b11b00bdb09063e259` |
| `public/models/characters/borax_lod1.glb` | `11eeb49e519d62cb672405aa0752aa3e03487fcaf86e26393099a43b1e5e4858` | `ca2baa7b99638955c5cdcd29f87021a0e4afd2db60f1219fdc51203b8ae4ad8c` |
| `scripts/generate-canon-character-glbs.mjs` | `5fab8f7fcf3847d300ca1a63586fd62199619636f47e3e4e9018a3634fb7d136` | `3411386857fd4d471c46d09d7970629c8e40ad862e537ba4ad6b3b00f0df014f` |
| `src/game/engine/CharacterBuilder.ts` | `f6846b6ae990c60438d86b374765129979889b686263ad083069510e7748c8c6` | `4520b4259a6f0405b20d72c63d188caf784afce7c93c24becde334b6a515e383` |
| `src/game/engine/GLBCharacterController.ts` | `b7891e732ed59f3f6ccda40665994cda5204a977d8f8f47c351f1f5c0fc22f89` | `f8f1f405dc137f7a5d2aacd5ddf2b00b3374cb2cf7fd3a10e28ef2b22d5b7dff` |
| `src/game/engine/GameEngine.ts` | `1382a03fbc6905b5b13fa4ace472628a3b8026311680a259f85e1c8edf96f2a3` | `ab4c0aa807e770f9ef3932dd44699f8ec0968bb89ec0b0d56853e57e5e9cce5e` |
| `src/game/engine/ProceduralTextures.ts` | `26a9ccad6de5a580830e79ca23ac582e3d84b67bd88faa2c29db7f1d26a7a379` | `de5d46ce0500bfea07259e0545a00462196e6569d16e426a773de46d2a26c316` |
| `src/game/engine/WorldBuilder.ts` | `7dacb206e0c204d25e20939dca9f8593a50e2adbf7685bc2476da6c32f9f3ff3` | `ad6990b8f092bc697f821b60576766f567d1a0ce02fee03bd634dce5d39fb0bc` |
| `src/components/GameHUD.tsx` | `e57e2510a781d19498aab61a1ba971a30c2c92d5569506da9c247d961dfd85d6` | `2530583d987511aa6b4aa59abe46f06d656829651792ec04434687aeeedffd33` |

---

## 3. Complete List of Modified & Created P1-E Files

### Modified Application & Pipeline Files
- `scripts/generate-canon-character-glbs.mjs` — Fixed glTF UV vertical inversion, upgraded `1024px`/`512px` PBR atlases, sculpted sabertooth heads/muzzles/tusks/eyeliner-framed glowing predator eyes, hip/belt pelvis continuity, Kai shoulder yokes & spider limbs, Jax storm crests, Kai-Jax Yin-Yang split coat/harness/greaves/strictly 3 tails, Boryn fur mantle/baldric, Borax 20-plume mane & 2-tier sode pauldrons, and refined 19 animation clips.
- `src/game/engine/CharacterBuilder.ts` — Upgraded Fang Syndicate enemy rigs to multi-part beast-warrior silhouettes.
- `src/game/engine/GLBCharacterController.ts` — Calibrated stride `timeScale` (`[0.58, 1.42]`), turn-lean banking, sprint forward pitch, and landing knee-compression squash.
- `src/game/engine/GameEngine.ts` — Weighted grounded accel/decel, pivot-brake skid dust, apex hang-time gravity curve, landing impact, calibrated hitstop frames, vulnerability-weighted contextual targeting, velocity look-ahead combat camera, 2D screen-projected target reticle coordinates, and immediate resize re-render.
- `src/game/engine/ProceduralTextures.ts` — Weathered Ashblock tenement facades, wet cobble-asphalt, flagstone sidewalks, corrugated shopfront awnings, and 3 canonical Ashblock murals.
- `src/game/engine/WorldBuilder.ts` — Batched `InstancedMesh` fire escapes, railings, shopfront awnings, curb bollards, overhead clotheslines, water towers, eared civilian silhouettes, and 3 northern horizon Beast-God monoliths.
- `src/game/types.ts` & `src/game/save/SaveManager.ts` — Added `hudVerticalOffset`, `hudCompactMode`, 2D target screen-projection fields, and `customStorage` support on settings persistence.
- `src/components/GameHUD.tsx`, `src/components/ComboMeterWidget.tsx`, `src/components/CommandHubModal.tsx`, `src/App.tsx` — Responsive mobile landscape HUD (`844×390`..`1440×900`), dialogue touch-cluster yielding, Clean Viewport (`Zen`) toggle, 2D target reticle, and HUD X/Y/density settings.
- `src/game/__tests__/gameSystems.test.ts` — Added Suite 17 verifying HUD layout settings round-trip, GLB `[0, 1]` UV bounds, Bovar withholding, and Kai-Jax strictly 3 physical tail roots.

### Created Verification Scripts, Captures & Production Reports
- `scripts/capture-p1e-visuals.mjs` — Deterministic headless WebGL turnaround & multi-viewport HUD capture harness.
- `docs/production/captures/before/*.png` (`13` baseline PNGs) & `docs/production/captures/after/*.png` (`15` post-upgrade PNGs).
- `docs/production/P1E_MODEL_FIDELITY_REPORT.md`
- `docs/production/P1E_MOVEMENT_COMBAT_REPORT.md`
- `docs/production/P1E_BUILD_AND_PERF_REPORT.md`
- `docs/production/P1E_CHECKPOINT_AND_CHANGES.md`
- `docs/production/glb-certification-report.json` & `docs/production/P1_CHARACTER_CERTIFICATION.md` (regenerated with P1-E metrics).

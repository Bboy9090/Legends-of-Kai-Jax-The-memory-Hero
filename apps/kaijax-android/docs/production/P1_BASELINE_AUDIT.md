# P1 BASELINE AUDIT — LEGENDS OF KAI-JAX: THE MEMORY HERO

**Project:** Legends of Kai-Jax: The Memory Hero (`com.bobbyblanco.legendsofkaijax`)  
**Repository Target:** `Bboy9090/Legends-of-Kai-Jax-The-memory-Hero`  
**Phase:** P1 & P1-C Baseline Reconciliation & Immutable Asset Freeze  
**Audit Date:** 2026-11-14  

---

## 1. Workspace & Repository Reconciliation

### 1.1 Runtime & Sandbox Git Status
- **Workspace Root:** `/app/applet`
- **Node.js Runtime:** `v22.23.2` (Express + Vite 8 + TypeScript + Three.js + Capacitor 8)
- **Git Metadata Availability:** **SANDBOXED / UNAVAILABLE IN CONTAINER** — `.git` directory inspection and `git` CLI operations are blocked inside the Cloud Run / AI Studio workspace sandbox (`fatal: not in a git directory`). Per the P1 Executive Directive (*"Do not fabricate builds, test results, asset inspections, Git commits, or completed gameplay"*), no Git commit SHA is fabricated. Instead, an immutable **cryptographic SHA-256 baseline manifest** has been recorded below for all 18 official Visual Library sheets and all 10 rigged P0 `.glb` character binaries.
- **CI Workflow Presence:** Checked workspace for `.github/workflows/`; none present inside the mounted applet snapshot. Local verification scripts (`npm test`, `scripts/validate-character-glbs.mjs`, `scripts/certify-character-glbs.mjs`, `npm run build`, `npx cap sync android`) serve as deterministic build and certification gates.

### 1.2 Capacitor & Android Native Baseline
- **Application ID / Namespace:** `com.bobbyblanco.legendsofkaijax` (`capacitor.config.ts`, `android/app/build.gradle`)
- **SDK Targets (`android/variables.gradle`):**
  - `minSdkVersion = 24`
  - `compileSdkVersion = 36`
  - `targetSdkVersion = 36`
- **Manifest Hardening (`android/app/src/main/AndroidManifest.xml`):**
  - `android:hardwareAccelerated="true"`
  - `android:screenOrientation="sensorLandscape"`
  - `android:launchMode="singleTask"`
  - `uses-feature android:glEsVersion="0x00020000" android:required="true"`
  - Minimal permissions: `INTERNET`, `VIBRATE`
- **Capacitor Plugins:** `@capacitor/app@8.1.2` (`backButton` & `appStateChange` pause/autosave lifecycle hooks).

---

## 2. Official Visual Library Audit (18/18 Authoritative Sheets Verified)

All **18** official Visual Library sheets are present on disk in `/public/assets/aistudio/`, mapped in `/src/data/officialVisualLibrary.ts`, and protected in `/server.ts` so `POST /api/canon-drive/clear` can never delete or overwrite `/assets/aistudio/*` files.

| # | Asset File (`/public/assets/aistudio/...`) | SHA-256 Checksum |
|---|---|---|
| 1 | `ChatGPT_Image_Aug_3__2026__04_50_02_PM_e94e8100.png` | `e94e8100d4e4e1d88bedf716a7799f455c3a01d624ab0085a8be460c9070b23a` |
| 2 | `ChatGPT_Image_Aug_3__2026__04_50_12_PM__1__078f6bfc.png` | `078f6bfc08a9fc7a4da1950d58b84eddf413c87ecb468e46d8193dc7931cc104` |
| 3 | `ChatGPT_Image_Aug_3__2026__04_50_13_PM__2__499cf6b7.png` | `499cf6b77b51c5b031ebd0850a775ad82ef14857073c053077712c34657f5ba1` |
| 4 | `ChatGPT_Image_Aug_3__2026__04_50_13_PM__3__3e003001.png` | `3e003001e76885db302878c125a4cbc3ca5d5f4e1850694908dd89e498df76a4` |
| 5 | `ChatGPT_Image_Aug_3__2026__04_50_13_PM__4__ffdee5d4.png` | `ffdee5d4f49985b3d1dbd38b68e946d34258d71a43f6bb379f2c080f139e95ea` |
| 6 | `ChatGPT_Image_Aug_3__2026__04_50_13_PM__5__5c371ed9.png` | `5c371ed9bdaecfcb76a0f1a85777f9a9c653245bdfddf762d3b9451153b01566` |
| 7 | `ChatGPT_Image_Aug_3__2026__04_50_14_PM__6__3e978121.png` | `3e97812139d095dce720edb50c399a3bba7f3a16c1801171bed179beefcb1418` |
| 8 | `ChatGPT_Image_Aug_3__2026__04_50_14_PM__7__85105f23.png` | `85105f23412a287f2acc4c91ba6f8dec71a647b1438bac6fbfe25652ba34f38a` |
| 9 | `ChatGPT_Image_Aug_3__2026__04_56_25_PM__1__f9d37a6e.png` | `f9d37a6ef6d717cd36ac2ac24d284423d882b342abdb0e6241f5e04235ea099d` |
| 10 | `ChatGPT_Image_Aug_3__2026__04_56_26_PM__2__d438c610.png` | `d438c6100d3836fa9769a03f7fc029d6ac3e2390573d21414d31a593233af323` |
| 11 | `ChatGPT_Image_Aug_3__2026__04_56_26_PM__3__e05fb785.png` | `e05fb785d9428e500a2882c6a7fabbb2ab98d01f6b0e3591c9c4a189ff20068a` |
| 12 | `ChatGPT_Image_Aug_3__2026__04_56_26_PM__4__a43aff68.png` | `a43aff684d4c58eef7ad43bf83444e8e53827de875dde164cb8e0e362dedf6db` |
| 13 | `ChatGPT_Image_Aug_3__2026__04_56_26_PM__5__d2fb286b.png` | `d2fb286b20891e7e1f6299848d64e19016c84d8a0b6a39c7539dd1f1e35bd988` |
| 14 | `ChatGPT_Image_Aug_3__2026__04_56_27_PM__6__16464786.png` | `16464786f824fff38583d6fe66d8bf815061251093c153ff7ad3e01da598b1dd` |
| 15 | `ChatGPT_Image_Aug_3__2026__04_56_27_PM__7__1f74b763.png` | `1f74b76381d762521d00a863aece93d4ac5191309465edbffb060572a97b3049` |
| 16 | `ChatGPT_Image_Aug_3__2026__04_56_27_PM__8__0e91caa6.png` | `0e91caa6ede388ce707adbfb90c7bf53525506bd042994d99aa0dcb402f1801b` |
| 17 | `ChatGPT_Image_Aug_3__2026__04_56_28_PM__9__e5b27b30.png` | `e5b27b30deedd1f8f3ee8a2f206b9a515f1b211cc622a15e361917a150b783ae` |
| 18 | `ChatGPT_Image_Aug_3__2026__04_56_29_PM__10__fbb50f2d.png` | `fbb50f2d333daf01b15e4f91ea58a61f639e120636b12567667500a7877b7e12` |

---

## 3. Approved P0 Rigged `.glb` Roster Audit (10/10 Binaries Verified)

All 5 approved characters (`kai`, `jax`, `kaijax`, `boryn`, `borax`) have intact Master and Mobile LOD1 `.glb` binaries in `/public/models/characters/` and synced to `/android/app/src/main/assets/public/models/characters/`. `bovar` remains strictly `awaiting_visual_approval` (`masterGlb: null`, `lod1Glb: null`) with zero runtime placeholder fabrication.

| Character | Variant | Path (`/public/models/characters/...`) | Size | Joints | SHA-256 Checksum |
|---|---|---|---|---|---|
| Kai | Master | `kai_master.glb` | 1.3 MB | 37 | `5cc5ea61cc88fdd0abc51910761ed255021e025541fe18192129e8b6010925a3` |
| Kai | LOD1 | `kai_lod1.glb` | 965 KB | 37 | `8ff7a20a2c7c063596ab35d4d7bdf9a786d7c51f18933fecfbd7aacba2f007b7` |
| Jax | Master | `jax_master.glb` | 1.2 MB | 32 | `46b6fd262285e2ea4651633a0d83e68f15ce6aeb27e0d9f7afbbeadeaa06fd91` |
| Jax | LOD1 | `jax_lod1.glb` | 915 KB | 32 | `b0eaf9773779082385eb74a2e2578f14a8d1bccff6a7c51fca0de8811e621f95` |
| Kai-Jax | Master | `kaijax_master.glb` | 1.7 MB | 56 | `7db8aea3cac1b6c40674b8f02d51ecd074daad7776c6c4db2bd5971b76216882` |
| Kai-Jax | LOD1 | `kaijax_lod1.glb` | 1.2 MB | 56 | `a78056834a4c338298dc02864e22419ddcc1bf26bac0447bf9d557b66911f974` |
| Boryn | Master | `boryn_master.glb` | 1.1 MB | 28 | `3f7be4909a6cac38c79d2d9e4ba4793125697c40e3a87c9004ada5c91758e971` |
| Boryn | LOD1 | `boryn_lod1.glb` | 848 KB | 28 | `ada715ee42275bffa2e28614b0b44a696cca3b4cbb4441218506782a2426586c` |
| Borax | Master | `borax_master.glb` | 1.2 MB | 30 | `2a08bb14b70b91bcd9f65c9f8e108225b48d31140263b378f918fca5c7735829` |
| Borax | LOD1 | `borax_lod1.glb` | 899 KB | 30 | `11eeb49e519d62cb672405aa0752aa3e03487fcaf86e26393099a43b1e5e4858` |

---

## 4. Baseline Gaps Identified & Resolved in P1 / P1-C

1. **Preview WebSocket Error (`[vite] Error: WebSocket closed without opened`):** Resolved by setting `hmr: false` in both `/vite.config.ts` and `/server.ts` (`createViteServer`).
2. **Automated 12-Point GLB Certification:** Added `/scripts/certify-character-glbs.mjs` and generated `/docs/production/glb-certification-report.json`.
3. **Title Screen Explicit Lead Predator Selection:** Added explicit **Kai** vs **Jax** initial deployment selection on `TitleScreen.tsx` feeding directly into `startOrContinueMission`.
4. **P1-C Apex Predator Combat System:** Added Free-Flow targeting, Momentum Tiers (`5/10/20/30+`), Agile Block + Parry Counter follow-ups + Guard Break + Unblockable telegraphs, deterministic `WebInteractionSystem` + Storm mobility, 6-Archetype `EnemyCombatDirector` (2-token attacker cap), separate `DuoSynergy` meter + 6 Cinematic Duo Finishers, and edge-triggered `GamepadInputPoller`.
5. **Save Hardening (v2 Checksum + Shadow `_bak` Recovery):** Upgraded `/src/game/save/SaveManager.ts` to atomic checksummed envelopes with automatic corruption fallback and v0/v1 migration.
6. **Zero-GC Live Frame/GPU Telemetry:** Added rolling 120-frame `Float32Array` `onePercentLowFps`, `drawCalls`, and `activeTriangles` tracking with adaptive DPR scaling.

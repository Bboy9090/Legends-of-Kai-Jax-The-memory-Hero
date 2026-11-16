# OPERATION KAI-JAX — P1-M: ASHBLOCK HEIGHTS FINAL GAMEPLAY, VISUAL & ANDROID QUALIFICATION REPORT

**Project:** *Legends of Kai-Jax: The Memory Hero* (`com.bobbyblanco.legendsofkaijax`)  
**Operation:** `P1-M — Ashblock Heights Final Gameplay, Visual & Android Qualification`  
**Prior Certified Baseline:** `/data/checkpoints/p1l-certified/SHA256SUMS.txt` (`P1-L`, preserved untouched)  
**P1-M Manifest Checkpoint:** `/data/checkpoints/p1m-certified/SHA256SUMS.txt` (`31` verified SHA-256 digests)  
**Machine-Readable Telemetry:** `/docs/production/p1m-qualification.json`  
**Qualification Status:**  
- **Web / PWA / Capacitor-Synced Vertical Slice (Headless Chromium + Unit Tests):** **VERIFIED (`24/24` suites, `0` console/HTTP/page errors)**  
- **Native Android Release Qualification:** **NOT RELEASE-QUALIFIED FOR NATIVE ANDROID** — Native APK compilation, APK signature verification, emulator/device installation, cold-launch/resume, and real hardware frame-pacing/memory profiling could not be executed in this container because Java JDK, Android SDK, `adb`, and physical/emulated Android hardware are unavailable.

---

## 1. Priority 0 — Source Integrity & Packaging Hygiene

- **Preserved Meshy Character Assets (`10/10` `.glb` binaries unchanged from P1-L):**
  - `kai_master.glb` / `kai_lod1.glb` (`37` bones, `22,087` / `9,211` tris, `19` clips)
  - `jax_master.glb` / `jax_lod1.glb` (`32` bones, `22,087` / `9,211` tris, `19` clips)
  - `kaijax_master.glb` / `kaijax_lod1.glb` (`56` bones, strictly **`3` physical tails / `12` tail bones**, `12` dorsal spider bones, `7` storm-mane bones, `23,967` / `10,526` tris, `19` clips)
  - `boryn_master.glb` / `boryn_lod1.glb` (`29` bones, `20,675` / `8,648` tris, `19` clips)
  - `borax_master.glb` / `borax_lod1.glb` (`29` bones, `22,082` / `9,212` tris, `19` clips)
  - Validation & certification scripts (`node scripts/validate-character-glbs.mjs`, `node scripts/certify-character-glbs.mjs`) passed on all 10 character GLBs; `bovar` remains withheld (`null` GLBs per canon).
- **Preserved World Assets:** All **12** Ashblock modular environment `.glb` assets + `ashblock_kit_manifest.json` (`133` GPU-instanced placements), **23** walkable elevated traversal zones, **10** geometry-attached web anchors, campaign save compatibility, and `Reconstructed <-> Legacy` switching remain intact (`sha256sum -c data/checkpoints/p1l-certified/SHA256SUMS.txt` confirmed bit-for-bit match on all 23 model/manifest files; only `WorldBuilder.ts`, `GameEngine.ts`, and `ProceduralTextures.ts` changed for P1-M gameplay & visual upgrades).
- **Workspace Sync vs. Native Android Packaging Isolation:**
  - `.gitignore` excludes `android/app/src/main/assets/public/`, `dist/`, `android/app/build/`, and `android/.gradle/`.
  - `npm run build` (`17.38s`, `69` PWA precache entries) + `npx cap sync android` (`0.611s`) verified packaging of `202 MB` `dist/` bundle (`10` character GLBs + `p1g`/`p1i` + `12` modular Ashblock GLBs + `ashblock_kit_manifest.json` + `@capacitor/app@8.1.2`) into `android/app/src/main/assets/public/`, after which temporary generated `android/app/src/main/assets/public` and `dist/` directories were cleaned so the workspace remains lean.

---

## 2. Priority 1 — Measured Gameplay Feel Results

Verified live in headless Chromium against port `3000` (`scripts/qualify-p1m-ashblock.mjs` -> `docs/production/p1m-qualification.json`):

| Gameplay System | Measured P1-M Telemetry | Engineering Verification |
|---|---|---|
| **Grounded Acceleration** | Frame 3: `7.39 m/s` -> Frame 6: `10.18 m/s` -> Frame 12: `11.63 m/s` -> Frame 20 peak: **`11.85 m/s`** | Smooth, responsive sprint ramp (`0` sluggish startup deadzone) |
| **Braking Curve** | Frame 4: `4.22 m/s` -> Frame 8: `1.50 m/s` -> Frame 16: **`0.19 m/s`** | Crisp stopping without ice-skating overshoot |
| **Sprint-to-Jump, Coyote & Jump Buffer** | `preJumpSpeed: 11.84 m/s`, `sprintJumpHoriz: 13.20 m/s`, `sprintJumpVy: 10.30 m/s`, `coyoteJumpVy: 10.30 m/s`, `bufferedSet: true`, **`bufferedAutoJumped: true`**, `jumpInputResponseMs: 0.6 ms` | Added `0.13s` coyote time, `0.13s` jump buffer, and `>= 1.25m` airborne clearance gate so low-altitude pre-landing jumps bunny-hop cleanly instead of latching overhead bridges |
| **Momentum Pendulum Web Swinging** | `attached: true`, `activeWebAnchorId: "wb-south-skybridge"` (`skybridge_truss_girder`), `ropeLen: 5.92 m`, `releaseVel: 14.77 m/s`, `lastInputResponseMs: 0.9 ms`, **`allAnchorsGeometryAttached: true` (`10/10`)** | Real gravity downswing acceleration + radial rope tension constraint + tangential upswing release |
| **Zip-to-Anchor Perch Traversal** | `started: true`, `midZipPos: [8.96, 3.89, -18.48]`, `zipCompletedCount: 1`, `landedY: 5.35 m`, **`grounded: true`** | Guided ballistic zip directly onto elevated fire-escape/loft deck with arrival hop and clean anchor cleanup (`05_p1m_zip_landing.png`) |
| **Free-Flow Combat, Dodge Cancel & Perfect Parry** | `slamLanded: true` (3-step air combo slam), **`dodgeCancelCount: 1`**, **`parried: true`**, `parryResponseMs: 0.5 ms` | Heavy recovery dodge cancellation, sub-millisecond input latency dispatch, and fixed `stepSimulationForQualification` `clock.elapsedTime` advance so chord timers expire accurately |
| **Web Throw & Environmental Wall Pinning** | **`wallPinned: true`**, `wallPinsCount: 1`, `companionSep: 3.66 m` | Snared/close-range target thrown cleanly onto solid east building wall (`WALL PINNED! CRIT 75` in `06_p1m_combat_wall_pin.png`), companion flanking laterally |
| **Two-Button Duo Finisher & Kai-Jax 3-Tail Fusion** | `duoTriggeredByChord: true`, `duoFinishersUsed: 1`, `fusedHero: "kaijax"`, **`tailBones: 12` (`physicalTailChains: 3`)**, `clipDuringSprint: "sprint"`, clean manual unfuse (`isFused: false`, `activeHeroAfterUnfuse: "kai"`, `kaiVisible: true`, `jaxVisible: true`, `kaiJaxHidden: true`) | Strictly 3 physical tail chains (`12` tail bones) deformed in sprint (`07_p1m_kaijax_3tail_deformation.png`), seamless reversion to Kai & Jax |

---

## 3. Priority 2 — Visual Fidelity Fixes vs. Approved Artwork

Matched against `d438c610.png` (Ashblock Street), `f9d37a6e.png` / `d2fb286b.png` (Bloodward Loft), and `e5b27b30.png` (Fang Syndicate Stronghold):

1. **Eliminated Twilight Asphalt Mirror-Glare & Circle Patterning (`ProceduralTextures.ts` + `WorldBuilder.ts`):**
   - Removed repeating geometric puddle circles in `asphaltRoughness` (`#ececec` aggregate base + `#cfcfcf` worn wheel ruts + organic fine speckle) and calibrated `roadMat` (`roughness: 0.94, metalness: 0.02, envMapIntensity: 0.16`), fixing purple skylight specular blowout (`01_p1m_street_before_after.png`).
2. **Bloodward Loft Sightline Unocclusion (`WorldBuilder.ts`):**
   - Replaced opaque parapet walls in `addGratedCatwalk` with open-sightline top safety rails, horizontal mid-bars, and vertical stanchions (`02_p1m_bloodward_ref_comparison.png`), keeping Boryn and Kai/Jax unobstructed from street and skybridge angles.
3. **Stronghold Boss Courtyard Framing & Objective Beacon Hygiene (`WorldBuilder.ts` + `GameEngine.ts`):**
   - Added overhead Stronghold floodlight truss + crimson armor trim accents without adding draw calls (`BufferGeometryUtils.mergeGeometries`), enhanced distant Beast-God horizon silhouettes, repositioned market/tailoring signs clear of iron ledges, and hid `objectiveBeacon` within `15m` / inside Boss Courtyard combat (`beaconHiddenCloseToBossArena: true`, `03_p1m_courtyard_before_after.png`).
4. **Mobile `844x390` Landscape HUD Collision Fix (`GameHUD.tsx`):**
   - Suppressed duplicate bottom-center `interactPrompt` whenever `canEnvironmentalTakedown` is active (`Relay [V]` right-thumb callout already handles it), docked remaining compact prompts cleanly at `top-14`, and isolated `joyPointerId` for genuine simultaneous thumbstick + combat multi-touch (`08_p1m_mobile_844x390_multitouch_hud.png`: `17` visible buttons, **`0` out-of-bounds/overlapping controls**, simultaneous `touchMove` + `Attack` verified).

---

## 4. Priority 3 — Android Toolchain Inspection, WebView Budget & Blocked Device Gates

### Container Android Toolchain Inspection (Verbatim)
- `which java javac adb sdkmanager gradle` -> **(not found)**
- `ANDROID_HOME=unset`, `JAVA_HOME=unset`
- Executing `sh android/gradlew -p android assembleDebug` returned verbatim:
  ```text
  ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH.
  Please set the JAVA_HOME variable in your environment to match the
  location of your Java installation.
  ```

### Executed vs. Blocked Android Qualification Checklist
| Android Qualification Gate | Status | Notes |
|---|---|---|
| Production Vite bundle + PWA SW (`npm run build`) | **PASS** | `2,122` modules compiled in `17.38s`; `69` precache entries (`dist/`) |
| Capacitor sync (`npx cap sync android`) | **PASS** | `0.611s`; `@capacitor/app@8.1.2`, `10` character `.glb` + `12` modular `.glb` synced to `android/app/src/main/assets/public` |
| `.gitignore` sync exclusion | **PASS** | `android/app/src/main/assets/public/`, `dist/`, `android/build/` excluded |
| 1. Native debug APK build (`./gradlew assembleDebug`) | **BLOCKED** | Missing OpenJDK 17+ & Android SDK (`platforms;android-36`) in container |
| 2. APK signature verification (`apksigner verify`) | **BLOCKED** | Blocked by missing APK output & Android build-tools |
| 3. Emulator / physical device install (`adb install`) | **BLOCKED** | No `adb` binary, Android emulator, or attached hardware |
| 4. Native WebView cold launch & background resume | **BLOCKED** | Requires Android device/emulator runtime (Capacitor listeners verified by code & browser only) |
| 5–9. Native APK runtime GLB load, physical touch, Mission 1, save/reload | **PASS IN HEADLESS CHROMIUM ONLY / BLOCKED ON ANDROID** | Verified in headless Chromium `844x390 @ 2x DPR` with synthetic multi-touch; unverified inside native Android System WebView |
| 10. Real mobile GPU (Adreno/Mali) frame pacing & RSS memory | **BLOCKED** | Headless Chromium ran CPU SwiftShader (`isSoftwareGl: true`), not physical mobile GPU |

### Headless Chromium `844x390 @ 2x DPR` Performance Telemetry (`isSoftwareGl: true`)
| Quality Tier | Draw Calls | Active Tris | Geometries | Textures | CPU Sim Avg | Render Submit (SwiftShader) |
|---|---:|---:|---:|---:|---:|---:|
| **`low`** (`LOD1`, DPR `1.0`) | `154` | `63,402` | `392` | `46` | `0.292 ms` | `112.4 ms` |
| **`balanced`** (`LOD1`, DPR `1.35`) | `163` | `66,946` | `392` | `46` | `0.725 ms` | `4.9 ms` |
| **`high`** (`Master`/`LOD1`, DPR `1.75`) | `163` | `66,946` | `392` | `46` | `0.658 ms` | `6.5 ms` |

*Zero-GC Fix Applied:* Replaced per-frame `new THREE.Vector3()` and `new THREE.Color()` allocations inside `GameEngine.ts` enemy/takedown/HUD loops with scratch `_v4` / `_colorScratch`.

---

## 5. Priority 4 — Release-Candidate Evidence & Remaining Defect List

### Visual Evidence Index (`/docs/production/captures/p1m/`)
- `01_p1m_street_before_after.png` (`01a_p1m_legacy_street.png`, `01b_p1m_street.png`) — Controlling art (`d438c610.png`) vs. Legacy Street vs. P1-M damp matte tarmac & Beast-God horizon silhouettes
- `02_p1m_bloodward_ref_comparison.png` (`02b_p1m_bloodward_dojo.png`) — `f9d37a6e.png` vs. Bloodward Loft open-sightline stanchions & Boryn mentor
- `03_p1m_courtyard_before_after.png` (`03a_p1m_legacy_courtyard.png`, `03b_p1m_stronghold_courtyard.png`) — `e5b27b30.png` vs. Legacy Courtyard vs. P1-M Stronghold floodlight truss & unoccluded Boss framing
- `04_p1m_pendulum_swing.png` — Geometry-socketed pendulum web swing (`wb-south-skybridge`)
- `05_p1m_zip_landing.png` — Guided ballistic zip-to-anchor toward Bloodward Loft & fire-escape network
- `06_p1m_combat_wall_pin.png` — Environmental Wall Pin (`WALL PINNED! CRIT 75`) + lateral Jax flank + Counter Strike / Duo Finisher UI
- `07_p1m_kaijax_3tail_deformation.png` — Kai-Jax fused sprint confirming strictly 3 physical tails (`12` tail bones)
- `08_p1m_mobile_844x390_multitouch_hud.png` — `844x390` mobile landscape HUD with `0` overlap & `0` clipped controls

### Remaining Defects & Open Release Blockers
1. **[BLOCKER — INFRASTRUCTURE] Native Android Build & Hardware Qualification Unexecuted:** Must run `./build-android-release.sh` (or `cd android && ./gradlew assembleDebug`), verify APK signature, and run the 10-step native launch/resume/touch/60fps qualification on an Android emulator and/or physical Adreno/Mali device before tagging a native mobile release candidate.
2. **[MINOR — OBSERVATION] Software GL Perf Readings (`fpsEstimate: 0`):** Because headless Chromium SwiftShader executes synchronous `stepSimulationForQualification` rather than continuous 60Hz VSync frames, live `fpsEstimate` reads `0` (`onePercentLowFps: 60`) in the offline capture harness; continuous 30/60 FPS pacing must be profiled on real Android WebView GPU hardware.
3. **[COSMETIC — PRE-EXISTING P1-J] Tight-Cuff Sleeve Weight Proximity on Extreme Roar:** Preserved Meshy single-mesh `kaijax` still shares watertight vertices near lowered cuffs and dorsal spider tips on extreme `roar` abduction (unchanged approved P1-J mesh).

---

## 6. Final Qualification Determination

- **Automated Unit & Invariant Suites:** `24/24 PASS` (`npm test`), TypeScript (`npm run lint`) clean, Vite production build (`npm run build`) clean.
- **Playable Ashblock Heights Vertical Slice (Browser / Headless Chromium):** **ALL P1-M GAMEPLAY, VISUAL & HUD CHECKS PASS** with zero HTTP, console, or page errors.
- **Native Android Release Gate:** **NOT RELEASE-QUALIFIED FOR NATIVE ANDROID** until the blocked JDK / Android SDK / `gradlew assembleDebug` / physical or emulator runtime gates in Section 4 are executed and passed.

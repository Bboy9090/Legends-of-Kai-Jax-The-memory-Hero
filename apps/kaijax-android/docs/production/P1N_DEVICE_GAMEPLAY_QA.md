# OPERATION KAI-JAX — P1-N: ANDROID DEVICE INSTALLATION & GAMEPLAY QA

**Project:** *Legends of Kai-Jax: The Memory Hero* (`com.bobbyblanco.legendsofkaijax`)  
**Status:** **PHASE 3 & PHASE 4 BLOCKED IN CONTAINER** (No `adb`, emulator, physical device, or built APK available)

---

## 1. Phase 3 — Android Installation & Lifecycle Verification Matrix

| Gate | Command / Method | Status | Evidence / Blocker |
|---|---|---|---|
| **APK Installation (`adb install -r`)** | `adb install -r android/app/build/outputs/apk/debug/app-debug.apk` | **BLOCKED** | No `adb` binary, no compiled APK, no emulator/device attached |
| **Cold Launch Timing (`am start -W -S`)** | `adb shell am start -W -S -n com.bobbyblanco.legendsofkaijax/.MainActivity` | **BLOCKED** | Requires Android runtime; native launcher & immersive flags verified at source level (`AndroidManifest.xml`, `MainActivity.java`) |
| **Orientation Lock (`sensorLandscape`)** | Visual + `dumpsys window` | **BLOCKED (Native) / PASS (Config)** | `AndroidManifest.xml` declares `android:screenOrientation="sensorLandscape"`; mobile landscape HUD verified at `844x390` in headless Chromium |
| **WebView GLB/Texture Load & Zero Fatal Exceptions** | `adb logcat` inspection | **BLOCKED (Native) / PASS (Chromium)** | Headless Chromium verified `10/10` character GLBs, `12/12` Ashblock GLBs, `0` HTTP 404s, `0` console/page errors; native Android System WebView untested |
| **Functional Save Slots Across App Restart** | Save slot -> `am force-stop` -> relaunch | **BLOCKED (Native) / PASS (Chromium)** | Native lifecycle (`@capacitor/app` + `MainActivity.setDomStorageEnabled(true)`) wired; Android WebView persistence not executed on device |
| **App Pause / Resume (`KEYCODE_HOME` -> Return)** | `input keyevent KEYCODE_HOME` -> `am start` | **BLOCKED (Native)** | Requires Android runtime (`@capacitor/app` `appStateChange` + `webglcontextlost`/`restored` handlers present in `GameEngine.ts`) |

---

## 2. Phase 4 — Ashblock Heights Device Walkthrough Checklist

*Note: All 12 items below passed in headless Chromium during P1-M (`docs/production/p1m-qualification.json` + `/docs/production/captures/p1m/`), but remain **NOT EXECUTED ON NATIVE ANDROID HARDWARE / EMULATOR** and must be checked off during interactive macOS `adb` testing:*

| # | Ashblock Heights Walkthrough Step | Headless Chromium (P1-M) | Native Android Device / Emulator (P1-N) |
|---:|---|:---:|:---:|
| 1 | Kai movement & grounded sprinting (`11.85 m/s` peak) | PASS | **NOT TESTED (Blocked)** |
| 2 | Jax movement, Storm-Step & active brother switching | PASS | **NOT TESTED (Blocked)** |
| 3 | Continuous rooftop traversal (`1.80m -> 3.65m -> 5.35m -> 7.05m` + Skybridge) | PASS | **NOT TESTED (Blocked)** |
| 4 | Geometry-attached pendulum web swinging (`wb-south-skybridge`, `10/10` socketed) | PASS | **NOT TESTED (Blocked)** |
| 5 | Guided Zip-to-Anchor perch landing (`landedY: 5.35 m`, `grounded: true`) | PASS | **NOT TESTED (Blocked)** |
| 6 | Free-flow combat, dodge cancellation (`dodgeCancelCount: 1`), & aerial slam | PASS | **NOT TESTED (Blocked)** |
| 7 | Perfect parry (`0.10s`/`0.16s` timing, `0.5 ms` dispatch) & counter strike | PASS | **NOT TESTED (Blocked)** |
| 8 | Environmental takedowns (Syndicate Arc Relays + Wall Pinning `wallPinsCount: 1`) | PASS | **NOT TESTED (Blocked)** |
| 9 | Two-button Duo Finisher (`Attack + Ability` chord & HUD button) | PASS | **NOT TESTED (Blocked)** |
| 10 | Kai-Jax fusion (`12` tail bones / strictly `3` physical tails) + clean unfuse | PASS | **NOT TESTED (Blocked)** |
| 11 | Boss Courtyard completion (Stronghold arena, beacon auto-hide) | PASS | **NOT TESTED (Blocked)** |
| 12 | Save/reload continuity & `Reconstructed <-> Legacy` switching | PASS | **NOT TESTED (Blocked)** |

---

## 3. Native Capture & Logcat Runbook (macOS)

After running `./scripts/p1n-mac-qualify.sh` with your emulator or physical phone connected via USB:
- Cold launch screenshot will be saved to `docs/production/captures/p1n/01_android_title_launch.png`.
- Filtered Chromium/Capacitor/WebGL/fatal exception logcat will be saved to `docs/production/p1n_mac_run/logcat_filtered.txt`.
- Capture additional gameplay screenshots at each milestone via:
  ```bash
  adb exec-out screencap -p > docs/production/captures/p1n/02_ashblock_gameplay.png
  ```

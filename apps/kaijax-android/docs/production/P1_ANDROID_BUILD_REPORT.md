# P1 ANDROID BUILD REPORT — LEGENDS OF KAI-JAX: THE MEMORY HERO

**Project:** Legends of Kai-Jax: The Memory Hero  
**Application ID:** `com.bobbyblanco.legendsofkaijax`  
**Platform Stack:** Capacitor 8 (`@capacitor/android@8.x`, `@capacitor/app@8.1.2`) + Vite 8 + React 19 + Three.js  
**Report Date:** 2026-11-14  

---

## 1. Build Pipeline Summary

| Build Step | Command | Result | Evidence |
|---|---|---|---|
| Automated Unit & Combat Certification Suite | `npm test` | **PASS** | `16/16` suites passed (exit code `0`) |
| Rigged `.glb` Validation & 12-Point Certification | `node scripts/validate-character-glbs.mjs && node scripts/certify-character-glbs.mjs` | **PASS** | `10/10` `.glb` files passed all 12 geometry/skeleton/clip/tail checks |
| Production Web Bundle & Offline PWA SW | `npm run build` | **PASS** | `2120` modules compiled in `2.50s`; `dist/sw.js` generated (`34` precached entries) |
| Capacitor Android Asset & Plugin Sync | `npx cap sync android` | **PASS** | Synced `dist/` + `@capacitor/app@8.1.2` into `android/app/src/main/assets/public` in `0.217s` |
| Native Debug APK Compilation | `sh android/gradlew -p android assembleDebug` | **BLOCKED** | Container environment has no JDK (`JAVA_HOME` / `java` not installed) or Android SDK |
| Physical Android Device / ADB Install | `adb install -r ...` | **NOT TESTED** | No `adb` binary or physical/emulated Android hardware attached to build container |

---

## 2. Verified Capacitor & Android Project Configuration

### 2.1 SDK & Packaging Configuration
- **`capacitor.config.ts`:**
  - `appId: 'com.bobbyblanco.legendsofkaijax'`
  - `appName: 'Legends of Kai-Jax'`
  - `webDir: 'dist'`
  - `server.androidScheme: 'https'`
  - `android.captureInput: true`, `allowMixedContent: false`
- **`android/variables.gradle`:**
  - `minSdkVersion = 24`
  - `compileSdkVersion = 36`
  - `targetSdkVersion = 36`
- **`android/app/build.gradle`:**
  - `aaptOptions.ignoreAssetsPattern` preserves `.glb`, `.webmanifest`, `.png`, and hashed JS/CSS chunks inside `assets/public`.
  - ProGuard / R8 release minification (`minifyEnabled true`, `shrinkResources true`) and environment-variable release signing (`ANDROID_KEYSTORE_PATH`) configured without committing secrets.

### 2.2 Synced Native Asset Verification (`android/app/src/main/assets/public`)
Verified on disk following `npx cap sync android`:
- All **10** approved `.glb` binaries present in `android/app/src/main/assets/public/models/characters/`:
  - `kai_master.glb` (1.3 MB), `kai_lod1.glb` (965 KB)
  - `jax_master.glb` (1.2 MB), `jax_lod1.glb` (915 KB)
  - `kaijax_master.glb` (1.7 MB), `kaijax_lod1.glb` (1.2 MB)
  - `boryn_master.glb` (1.1 MB), `boryn_lod1.glb` (848 KB)
  - `borax_master.glb` (1.2 MB), `borax_lod1.glb` (899 KB)
- All **18** official Visual Library PNG sheets synced under `android/app/src/main/assets/public/assets/aistudio/`.
- `android/gradlew` executable permission verified (`chmod +x android/gradlew`).

### 2.3 Android Lifecycle, Orientation & Touch Hardening
- **Landscape Fullscreen Lock:** `android:screenOrientation="sensorLandscape"`, `android:hardwareAccelerated="true"`, `android:launchMode="singleTask"` in `AndroidManifest.xml`, plus safe-area inset awareness (`env(safe-area-inset-*)`) in `GameHUD.tsx`.
- **Hardware Back Button & Backgrounding (`src/App.tsx` + `src/game/engine/GameEngine.ts`):**
  - `@capacitor/app` `backButton` listener toggles the Command Hub pause overlay during gameplay instead of abruptly killing the activity.
  - `@capacitor/app` `appStateChange` + `visibilitychange` + `pagehide` listeners immediately zero out movement/touch axes, pause active simulation delta spikes, and write an atomic checksummed v2 autosave to local storage.
- **WebGL Context Loss Recovery (`GameEngine.ts`):**
  - Handles `webglcontextlost` (`preventDefault()`, halts animation frame loop cleanly) and `webglcontextrestored` (reinitializes WebGL state without crashing the host WebView).
- **Multi-Touch Combat Controls (`GameHUD.tsx`):**
  - Simultaneous left thumb virtual joystick (`pointerId`-isolated) + right thumb multi-button cluster (`Attack`, `Heavy`, `Dodge`, holdable `Block/Parry`, `Jump`, `Web/Storm Tactical`, `Swap`, `Convergence`, contextual `Counter` & `Duo Finisher` prompts) with `touch-none select-none` preventing accidental browser zoom/scroll gestures.

---

## 3. Verbatim Native Gradle Execution Evidence (`BLOCKED` in Container)

Executing the Gradle wrapper inside `/app/applet` produced:

```text
$ chmod +x android/gradlew && sh android/gradlew -p android assembleDebug
ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH.
Please set the JAVA_HOME variable in your environment to match the
location of your Java installation.
```

**Root Cause:** The Cloud Run / AI Studio Node.js container provides Node `v22.23.2` and npm/Capacitor CLI, but does **not** have OpenJDK 17/21 or the Android SDK (`platforms;android-36`, `build-tools`) installed.

---

## 4. Reproducible Local Android Studio / CLI APK Build Instructions

On any workstation or CI runner with **JDK 17+** and **Android SDK (API 36)** installed:

```bash
# 1. Install dependencies & run full P1/P1-C verification gates
npm ci
npm test
node scripts/validate-character-glbs.mjs
node scripts/certify-character-glbs.mjs

# 2. Build production web assets & sync into Capacitor Android project
npm run build
npx cap sync android

# 3. Compile installable Debug APK
cd android
./gradlew assembleDebug

# Output APK location:
# android/app/build/outputs/apk/debug/app-debug.apk
```

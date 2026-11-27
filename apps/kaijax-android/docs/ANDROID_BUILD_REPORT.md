# Android Build & Capacitor Configuration Report

## 1. Capacitor Native Wrapper (`capacitor.config.ts`)
- **Application ID:** `com.bobbyblanco.legendsofkaijax`
- **App Name:** `Legends of Kai-Jax`
- **Web Bundle Directory:** `dist` (`vite build` + `vite-plugin-pwa`)
- **Plugins Installed (`package.json`):**
  - `@capacitor/core@^8.6.2`
  - `@capacitor/android@^8.6.2`
  - `@capacitor/app@^8.1.2`
  - `@capacitor/cli@^8.6.2`
- **Security & Scheme Settings:** `androidScheme: 'https'`, `allowMixedContent: false`, `webContentsDebuggingEnabled: false`.

## 2. Gradle & SDK Configuration (`android/`)
- **Android Gradle Plugin:** `8.13.0` (`android/build.gradle`)
- **Gradle Wrapper:** `8.14.3` (`android/gradle/wrapper/gradle-wrapper.properties`)
- **SDK Targets (`android/variables.gradle`):**
  - `compileSdkVersion = 36`
  - `targetSdkVersion = 36`
  - `minSdkVersion = 24`
- **Release Hardening (`android/app/build.gradle`):**
  - `versionCode 1`, `versionName "1.0.0"`
  - `release` build type enables `minifyEnabled true`, `shrinkResources true`, `proguard-android-optimize.txt`, and conditional env-var release signing (`ANDROID_KEYSTORE_PATH`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`) so secrets never reside in source control.

## 3. Manifest, Permissions & WebGL Bridge Hardening
- **`AndroidManifest.xml`:**
  - `android:hardwareAccelerated="true"` on `<application>`
  - `android:screenOrientation="sensorLandscape"` and `android:resizeableActivity="true"` on `MainActivity`
  - `<uses-feature android:glEsVersion="0x00020000" android:required="true" />`
  - Minimal permissions only: `INTERNET` and `VIBRATE` (haptic combat feedback)
- **`MainActivity.java`:**
  - Extends `BridgeActivity` with edge-to-edge `WindowCompat.setDecorFitsSystemWindows(false)` and `WindowInsetsControllerCompat` immersive sticky system bar hiding.
  - Configures WebView `View.LAYER_TYPE_HARDWARE`, `setDomStorageEnabled(true)`, and `setMediaPlaybackRequiresUserGesture(false)`.
- **JS ↔ Native Lifecycle Bridge (`src/platform/androidLifecycle.ts`):**
  - Hooks `@capacitor/app` `appStateChange` & `backButton` + DOM `visibilitychange` & `pagehide` to autosave, pause `GameEngine`, and suspend/resume Web Audio cleanly.

## 4. Container Execution Boundary (Honest Build Status)
- **Verified in Container (`Node v22.23.2`, `npm 10.9.8`):** `npx cap add android` and `npx cap sync android` completed cleanly (`dist/` assets + `capacitor.config.json` + `@capacitor/app@8.1.2` synced into `android/app/src/main/assets/public`).
- **APK Compilation Deferred to Host with Android SDK:** This container does **not** have `java` (JDK 17+), `gradle` SDK components, or `ANDROID_HOME` installed. No binary `.apk`/`.aab` was compiled in-container. To generate debug and release APKs on a workstation or CI runner with JDK 17+ and Android SDK 36 installed, run:
  ```bash
  ./build-android-release.sh
  ```

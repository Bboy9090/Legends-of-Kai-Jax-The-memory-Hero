# OPERATION KAI-JAX — P1-N: WORKSTATION & ANDROID TOOLCHAIN AUDIT

**Project:** *Legends of Kai-Jax: The Memory Hero* (`com.bobbyblanco.legendsofkaijax`)  
**Audit Timestamp:** `2026-11-15T17:35:10Z` (`2026-11-15T09:35:10-08:00`)  
**Active Checkpoint:** `/data/checkpoints/p1m-certified/SHA256SUMS.txt` (`31` SHA-256 digests)

---

## 1. Phase 0 Discovery: Execution Environment vs. Target macOS Workstation

Commands executed directly in the active build environment (`/app/applet`):

```bash
uname -a
# Linux localhost 4.19.0-gvisor #1 SMP Sun Jan 10 15:06:54 PST 2016 x86_64 GNU/Linux
cat /etc/os-release | head -n 6
# PRETTY_NAME="Debian GNU/Linux 12 (bookworm)"
ls -d /usr/lib/jvm/* /opt/android* /root/Android* 2>/dev/null || echo "NO_SDK_DIRS"
# NO_SDK_DIRS
which java javac gradle adb sdkmanager emulator apksigner zipalign 2>&1 || true
# (empty — none installed)
env | grep -E "JAVA|ANDROID|CAPACITOR" || echo "NO_ANDROID_ENV_VARS"
# NO_ANDROID_ENV_VARS
```

### Audit Findings Summary

| Requirement | Container State | Result | Details |
|---|---|---|---|
| **Operating System** | Debian GNU/Linux 12 (`x86_64`, gVisor) | **NOT macOS** | Executed inside AI Studio Linux cloud container, not a local macOS Android Studio workstation |
| **Kai-Jax Project Source & Assets** | `/app/applet` | **PRESENT** | Complete React + Vite + Three.js + Capacitor 8 Android project on disk (`npm` + Node.js runtime active) |
| **Java JDK 17+** | Missing | **BLOCKED** | No `java` or `javac` binary, no `/usr/lib/jvm/*`, `JAVA_HOME` unset |
| **Android SDK Tools** | Missing | **BLOCKED** | `ANDROID_HOME` unset; no `sdkmanager`, `build-tools`, `apksigner`, `zipalign`, or `emulator` |
| **Gradle Wrapper (`android/gradlew`)** | Present (`Gradle 8.14.3` configured) | **FIXED PERMS / BLOCKED BY JDK** | Restored missing `+x` executable bit (`chmod +x android/gradlew` -> `-rwxr-xr-x`); execution fails without JDK |
| **ADB & Target Device/Emulator** | Missing | **BLOCKED** | `adb` not installed; zero attached emulators or physical Android devices |
| **Capacitor Android Configuration** | Valid | **PASS** | Valid `capacitor.config.ts`, `android/variables.gradle`, `android/app/build.gradle`, `AndroidManifest.xml`, `MainActivity.java` |

---

## 2. Verified Capacitor & Android Native Configuration (`android/`)

Inspected directly in workspace:

- **`capacitor.config.ts`:**
  - `appId: 'com.bobbyblanco.legendsofkaijax'`
  - `appName: 'Legends of Kai-Jax'`
  - `webDir: 'dist'`
  - `server.androidScheme: 'https'`
  - `android.allowMixedContent: false`, `captureInput: true`, `webContentsDebuggingEnabled: false`
- **`android/variables.gradle`:**
  - `minSdkVersion = 24` (Android 7.0)
  - `compileSdkVersion = 36`
  - `targetSdkVersion = 36`
  - `androidxAppCompatVersion = '1.7.1'`, `androidxWebkitVersion = '1.14.0'`, `coreSplashScreenVersion = '1.2.0'`
- **`android/build.gradle` & `android/gradle/wrapper/gradle-wrapper.properties`:**
  - Android Gradle Plugin `8.13.0`
  - Gradle distribution `gradle-8.14.3-all.zip`
- **`android/app/build.gradle`:**
  - `aaptOptions.ignoreAssetsPattern` preserves `.glb`, `.json`, `.png`, `.js`, `.css`, and `.webmanifest`
  - `release` build type enables `minifyEnabled true` + `shrinkResources true` and reads `ANDROID_KEYSTORE_*` env vars cleanly
- **`android/app/src/main/AndroidManifest.xml`:**
  - `android:screenOrientation="sensorLandscape"`, `android:hardwareAccelerated="true"`, `android:launchMode="singleTask"`
  - Requires OpenGL ES 2.0+ (`android:glEsVersion="0x00020000"`) and minimal permissions (`INTERNET`, `VIBRATE`)
- **`android/app/src/main/java/com/bobbyblanco/legendsofkaijax/MainActivity.java`:**
  - Extends `BridgeActivity`, sets `View.LAYER_TYPE_HARDWARE`, enables `domStorageEnabled` and `mediaPlaybackRequiresUserGesture(false)`, and enforces transient immersive system bars.
- **Defect Resolved During Audit:**
  - `android/gradlew` lacked execute permission (`GRADLEW_EXEC=false`). Fixed via `chmod +x android/gradlew` (`-rwxr-xr-x`) so macOS Gradle runs cleanly without permission errors after export.

---

## 3. Google AI Studio -> macOS Workstation Export & Qualification Workflow

Because the AI Studio cloud container does not contain macOS Android Studio, OpenJDK 17+, or USB-connected devices, execute the following workflow on your macOS workstation:

### Step 1: Export & Unpack Project on macOS
1. Download/export the project archive from Google AI Studio (or clone/sync your repository) to a local macOS directory, e.g. `~/Projects/legends-of-kai-jax`.
2. Open Terminal in that directory:
   ```bash
   cd ~/Projects/legends-of-kai-jax
   ```

### Step 2: Ensure macOS Prerequisites (One-Time Setup)
1. **Install JDK 17 or 21** (or use Android Studio's bundled JBR):
   ```bash
   brew install openjdk@21
   export JAVA_HOME="/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home"
   ```
2. **Install Android Studio + SDK (`platforms;android-36`, `build-tools;36.0.0`, `platform-tools`):**
   ```bash
   export ANDROID_HOME="$HOME/Library/Android/sdk"
   export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
   ```
3. **Attach a physical Android device** (USB Debugging enabled in Developer Options, verify `adb devices` shows `device` — not `unauthorized`) **or launch an Android AVD emulator** (`API 34–36` with hardware GLES acceleration).

### Step 3: Run the Automated P1-N macOS Qualification Script
Run the turnkey runner created in this repo (`scripts/p1n-mac-qualify.sh`):

```bash
chmod +x scripts/p1n-mac-qualify.sh
./scripts/p1n-mac-qualify.sh
```

It automatically executes Phases 0–3 & Phase 5 telemetry collection and writes outputs to `docs/production/p1n_mac_run/` and `docs/production/captures/p1n/`.

# OPERATION KAI-JAX — P1-O: SOURCE EXPORT, MACOS HANDOFF & NATIVE BUILD READINESS

**Project:** *Legends of Kai-Jax: The Memory Hero* (`com.bobbyblanco.legendsofkaijax`)  
**Handoff Date:** `2026-11-15T18:05:33Z`  
**Native Release Status:** **NOT YET NATIVE-ANDROID RELEASE-QUALIFIED** (pending macOS Gradle build & device/emulator execution)

---

## 1. Git / GitHub Source Authority Audit

- **Repository Check (`git status` / `git remote -v`):** `/app/applet` contains **no `.git` directory** and **no configured Git remote** (`fatal: not a git repository (or any of the parent directories): .git`).
- **Branch / Commit / Push Status:** None present in container.
- **P1-O Portable Handoff Fallback Executed:** Generated a clean, reproducible portable source archive excluding `node_modules/`, `dist/`, `.aistudio/`, and generated duplicate Android web assets (`android/app/src/main/assets/public/`, `capacitor.config.json`, `capacitor.plugins.json`, `android/.gradle/`, `android/build/`, `android/app/build/`), paired with verified SHA-256 manifests.

---

## 2. Exported Portable Source Archive & Checksums

| Artifact | Path | Exact Size / Count | SHA-256 Digest |
|---|---|---|---|
| **Portable Source Archive** | `exports/legends-of-kai-jax-p1o-macos-handoff.tar.gz` | `306,355,883` bytes (`293 MiB`), `606` entries | `a6868be537fe24689500dbda7a7eaf038c5e10e6ce9bd8aa17940deabd42f8b5` |
| **Archive Checksum File** | `exports/legends-of-kai-jax-p1o-macos-handoff.tar.gz.sha256` | `118` bytes | Verified `OK` via `sha256sum -c` |
| **P1-N Source Manifest** | `data/checkpoints/p1n-certified/SHA256SUMS.txt` | `54` verified files | `54 / 54 OK` (re-verified inside clean `/tmp` extraction) |
| **P1-M Baseline Manifest** | `data/checkpoints/p1m-certified/SHA256SUMS.txt` | `31` verified files | `31 / 31 OK` (untouched historical baseline) |

### What Is Preserved Inside the Archive
- **Character GLBs:** All `10` root certified character GLBs (`kai`, `jax`, `kaijax`, `boryn`, `borax` `_master.glb` & `_lod1.glb`), plus `public/models/characters/p1g/` and `public/models/characters/p1i/`.
- **Environment GLBs:** All `12` Ashblock modular environment GLBs + `ashblock_kit_manifest.json` (`public/models/environments/ashblock/`).
- **Application Source & Config:** Complete `src/`, `public/`, `package.json`, `bun.lock` (repo lockfile), `tsconfig.json`, `vite.config.ts`, `capacitor.config.ts`, `index.html`, `server.ts`, `.env.example`, `.gitignore`.
- **Android Native Project:** Complete `android/` project (`gradlew` with `+x`, `gradlew.bat`, `gradle/wrapper/`, `build.gradle`, `variables.gradle` API `24..36`, `app/build.gradle`, `AndroidManifest.xml`, `MainActivity.java`).
- **Automation & Historical Evidence:** Hardened `scripts/p1n-mac-qualify.sh` (`+x`), `scripts/validate-character-glbs.mjs`, `build-android-release.sh`, and all P1-M / P1-N production reports (`docs/production/`).

### Excluded Regenerable Artifacts (Verified Recreated Cleanly)
- Excluded: `node_modules/`, `dist/`, `android/app/src/main/assets/public/`, `android/app/src/main/assets/capacitor.config.json`, `android/app/src/main/assets/capacitor.plugins.json`, `android/.gradle/`, `android/build/`, `android/app/build/`, `.aistudio/`.
- **Recreation Verification Executed:** Deleted generated `dist/` and `android/app/src/main/assets/*`, ran `npm run build && npx cap sync android`, and verified `vite build` (`2,122` modules, `69` PWA entries) + `npx cap sync android` (`0.315s`) cleanly rebuilt `dist/` and re-populated `android/app/src/main/assets/public/` with **`10` character GLBs** and **`12` Ashblock GLBs**.

---

## 3. Hardening Applied to `scripts/p1n-mac-qualify.sh`

Audited and updated `scripts/p1n-mac-qualify.sh` (`bash -n` clean, `-rwxr-xr-x`):
1. **macOS `sort -V` Bug Fixed:** Replaced GNU-only `sort -V` (which fails on macOS BSD `sort`) with POSIX numeric sorting (`sort -t. -k1,1n -k2,2n -k3,3n`) for `ANDROID_HOME/build-tools` discovery.
2. **macOS JDK 17+ Discovery:** Checks `JAVA_HOME`, `/usr/libexec/java_home` (`21`, `17`, `17+`), Android Studio bundled JBR, and both Apple Silicon (`/opt/homebrew`) and Intel (`/usr/local`) Homebrew OpenJDK paths, then verifies Java major version `>= 17`.
3. **Lockfile Compatibility (`bun.lock` + `npm`):** Automatically uses `npm ci` if `package-lock.json` exists, `bun install --frozen-lockfile` if `bun` is installed with `bun.lock`, or `npm install` cleanly if only Node/npm is present on macOS (avoiding `npm ci` failure on missing `package-lock.json`).
4. **Optional `adb` Device Flow:** Phases 0–2 (`npm run lint`, `npm test`, GLB validation, Vite build, `cap sync android`, `./gradlew assembleDebug`, `shasum -a 256`, `apksigner verify`, and APK GLB inspection) complete and exit `0` (`PENDING_DEVICE_ATTACHMENT`) when no `adb` device/emulator is attached. Pass `--require-device` to enforce failing exit code `5` if a device is required.
5. **Working-Directory & Non-Destructive Safety:** Always anchors to repo root from `"$(dirname "$0")/.."` and logs to `docs/production/p1n_mac_run/`; never deletes source assets, checkpoints, or user data.

---

## 4. macOS Prerequisites & Exact Setup Steps

1. **Software Prerequisites on macOS:**
   - **Node.js `20+` or `22+`** (`node -v`, `npm -v`)
   - **JDK `17` or `21`** (`brew install openjdk@21`, or Android Studio bundled JBR at `/Applications/Android Studio.app/Contents/jbr/Contents/Home`)
   - **Android Studio + SDK (`$HOME/Library/Android/sdk`):**
     - `platforms;android-36`
     - `build-tools;36.0.0` (provides `apksigner`)
     - `platform-tools` (provides `adb`)
     - *(Optional for local emulator)* Android Emulator + API 34–36 arm64/x86_64 system image
2. **Verify Archive Integrity & Unpack on macOS:**
   ```bash
   shasum -a 256 -c exports/legends-of-kai-jax-p1o-macos-handoff.tar.gz.sha256
   mkdir -p ~/Projects/legends-of-kai-jax
   tar -xzf legends-of-kai-jax-p1o-macos-handoff.tar.gz -C ~/Projects/legends-of-kai-jax
   cd ~/Projects/legends-of-kai-jax
   shasum -a 256 -c data/checkpoints/p1n-certified/SHA256SUMS.txt
   ```
3. **One-Command Build & Qualification Procedure:**
   ```bash
   # Build APK, verify SHA-256 + apksigner + embedded GLBs, and install/capture if adb device attached:
   ./scripts/p1n-mac-qualify.sh

   # Or fail with exit 5 unless an authorized physical device/emulator is attached:
   ./scripts/p1n-mac-qualify.sh --require-device
   ```

---

## 5. Expected Outputs, Known Blockers & Native Release Qualification Criteria

- **Expected Automated Outputs (under `docs/production/p1n_mac_run/` & `docs/production/captures/p1n/`):**
  - Compiled Debug APK: `android/app/build/outputs/apk/debug/app-debug.apk`
  - Checksum & signature proof: `apk_sha256.txt`, `apksigner_verify.txt`, `apk_embedded_assets.txt` (`>=10` character GLBs, `>=12` Ashblock GLBs)
  - Execution logs: `p1n_execution.log` + timestamped log
  - When `adb` device attached: `01_android_title_launch.png`, `cold_launch_timing.txt`, `resume_timing.txt`, `restart_timing.txt`, `dumpsys_meminfo.txt`, `dumpsys_gfxinfo.txt`, `dumpsys_thermal.txt`, `logcat_filtered.txt`
- **Known Blockers Remaining in Cloud Container (Expected — Deferred to macOS):**
  - No JDK 17+, Android SDK API 36, `apksigner`, or `adb`/device in AI Studio Debian Linux container (per P1-O directive, blocked `./gradlew` was not re-attempted).
- **Criteria Required to Flip `P1N_RELEASE_GATE.md` to RELEASE-QUALIFIED:**
  1. `./gradlew assembleDebug` succeeds on macOS with APK size, SHA-256, `apksigner verify` PASS, and `10` char + `12` Ashblock GLBs confirmed in APK.
  2. `adb install -r` + cold start, background/resume pause recovery, force-stop restart, and clean `logcat` verified on physical Android hardware (and/or hardware-accelerated emulator).
  3. Interactive Ashblock Heights 12-step gameplay walkthrough verified on device touch controls (dual sticks, parry, web swing/zip, relay takedown, Duo Finisher, strictly 3-tail Kai-Jax fusion, Boss Courtyard, Save/Reload).
  4. Real Android hardware `dumpsys gfxinfo` (sustained `30/60 FPS`), `dumpsys meminfo`, and thermal snapshot recorded in `docs/production/P1N_DEVICE_GAMEPLAY_QA.md` and `P1N_PERFORMANCE_REPORT.md`, plus release keystore signing (`build-android-release.sh`) when distributing APK/AAB.

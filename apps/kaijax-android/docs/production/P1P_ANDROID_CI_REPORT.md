# OPERATION KAI-JAX — P1-P: ANDROID BUILD & CI PIPELINE REPORT

**Project:** *Legends of Kai-Jax: The Memory Hero* (`com.bobbyblanco.legendsofkaijax`)  
**Pipeline Targets:** macOS Local Qualification (`scripts/p1n-mac-qualify.sh`) & GitHub Actions Debug CI (`.github/workflows/android-p1p-debug.yml`)  
**Verification Date:** `2026-11-15`

---

## 1. Local Build, Lint & Capacitor 8 Synchronization (`PASS` in Workspace)

| Check | Command | Measured Result |
|---|---|---|
| **TypeScript Typecheck** | `npm run lint` (`tsc --noEmit`) | **PASS** — `0` errors |
| **Game Systems Regression** | `npm test` | **PASS** — **`24 / 24` suites** |
| **Character GLB Check** | `node scripts/validate-character-glbs.mjs` | **PASS** — `10/10` GLBs (`19` clips, 3 tails / 12 tail bones) |
| **World & Save Check** | `npx tsx scripts/validate-p1p-world-and-saves.mjs` | **PASS** — `12/12` GLBs, `133` props, `23` zones, `10` anchors, save recovery OK |
| **Vite Production Bundle** | `npm run build` (`vite build`) | **PASS** — `2,122` modules (`8.43s`), `69` PWA entries (`73,046.01 KiB`) |
| **Capacitor Android Sync** | `npx cap sync android` | **PASS** — `0.443s`; packaged **`10`** root character GLBs + **`12`** Ashblock GLBs into `android/app/src/main/assets/public/` |

Following synchronization verification, generated `dist/` and duplicate `android/app/src/main/assets/{public,capacitor.config.json,capacitor.plugins.json}` outputs were removed cleanly so `.gitignore` keeps exported source packages lean (`npx cap sync android` recreates them deterministically).

---

## 2. Audit of `scripts/p1n-mac-qualify.sh` (Preserved & Ready)

Verified executable (`chmod +x`, `bash -n` clean) with:
1. POSIX numeric `build-tools` version sort (`sort -t. -k1,1n -k2,2n -k3,3n`) compatible with macOS BSD `sort`.
2. JDK `17+` / `21` resolution across `$JAVA_HOME`, `/usr/libexec/java_home`, Android Studio JBR, and Apple Silicon / Intel Homebrew OpenJDK, with explicit Java major version `>= 17` enforcement.
3. `$ANDROID_HOME` / `$ANDROID_SDK_ROOT` discovery (`$HOME/Library/Android/sdk`) and `apksigner` / `adb` availability checks.
4. Reproducible lockfile handling (`npm ci` / `bun install --frozen-lockfile` / `npm install`).
5. End-to-end Gradle compilation (`./gradlew assembleDebug --stacktrace`), SHA-256 recording, `apksigner verify --verbose --print-certs`, `unzip -l` embedded GLB count gate (`>=10` char, `>=12` Ashblock), and optional `adb` installation (`PENDING_DEVICE_ATTACHMENT` exits `0` cleanly unless `--require-device` is passed).

---

## 3. New Pinned GitHub Actions Workflow (`.github/workflows/android-p1p-debug.yml`)

Added `.github/workflows/android-p1p-debug.yml` alongside (never replacing) GitHub `main`'s `android-build.yml` and `android-signed-frozen.yml`:
- **Runner & Toolchain:** `ubuntu-24.04`, preinstalled Node `22.x`, runner JDK `21` (`$JAVA_HOME_21_X64`), pinned Android SDK `platforms;android-36`, `build-tools;36.0.0`, `platform-tools`, and pinned `actions/upload-artifact@b4b15b8c7c6ac21ea08fcf65892d2ee8f75cf882` (`v4.4.3`).
- **Safety & Scope Guardrails:**
  - Read-only token (`permissions: contents: read`), **zero AWS / paid cloud infrastructure**, **zero Google Play publishing**, and **zero production signing keys/credentials**.
  - Explicitly stamps `release_signed=false`, `store_approved=false`, `physical_device_qualified=false` in `QA-QUALIFICATION.txt` alongside `app-debug.apk`, `apksigner-verify.txt`, and `SHA256SUMS.txt`.

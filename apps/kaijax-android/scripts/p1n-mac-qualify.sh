#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# OPERATION KAI-JAX — P1-N / P1-O: macOS NATIVE ANDROID BUILD & QUALIFICATION
# Runs Phases 0-5 on an authorized macOS workstation with JDK 17+, Android SDK,
# Gradle, and optional adb (emulator or USB-debugging physical device attached).
# Never deletes source assets, checkpoints, or user save data.
#
# Usage:
#   ./scripts/p1n-mac-qualify.sh                  # Full build + verify; adb optional
#   ./scripts/p1n-mac-qualify.sh --require-device # Fail (exit 5) if no adb device
# ==============================================================================

REQUIRE_DEVICE=0
for arg in "$@"; do
  case "$arg" in
    --require-device)
      REQUIRE_DEVICE=1
      ;;
    -h|--help)
      sed -n '4,14p' "$0"
      exit 0
      ;;
    *)
      echo "ERROR: Unknown argument: $arg" >&2
      exit 1
      ;;
  esac
done

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

OUT_DIR="$ROOT_DIR/docs/production/p1n_mac_run"
CAP_DIR="$ROOT_DIR/docs/production/captures/p1n"
mkdir -p "$OUT_DIR" "$CAP_DIR"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
LOG_FILE="$OUT_DIR/p1n_execution.log"
ARCHIVE_LOG="$OUT_DIR/p1n_execution_${STAMP}.log"
: > "$LOG_FILE"
exec > >(tee -a "$LOG_FILE" "$ARCHIVE_LOG") 2>&1

APP_ID="com.bobbyblanco.legendsofkaijax"
MAIN_ACTIVITY="${APP_ID}/.MainActivity"
APK_PATH="$ROOT_DIR/android/app/build/outputs/apk/debug/app-debug.apk"

echo "=== [PHASE 0] macOS WORKSTATION DISCOVERY ($STAMP) ==="
echo "Workspace: $ROOT_DIR"
uname -a
if command -v sw_vers >/dev/null 2>&1; then
  sw_vers
fi

for req_cmd in node npm shasum unzip; do
  if ! command -v "$req_cmd" >/dev/null 2>&1; then
    echo "BLOCKED: Required command '$req_cmd' not found in PATH."
    exit 2
  fi
done
echo "Node: $(node -v) | npm: $(npm -v)"

# Resolve JDK 17+ on macOS (JAVA_HOME -> java_home -> Android Studio JBR -> Apple Silicon / Intel Homebrew)
resolve_java_home() {
  if [[ -n "${JAVA_HOME:-}" ]] && [[ -x "$JAVA_HOME/bin/java" ]]; then
    echo "$JAVA_HOME"
    return 0
  fi
  if command -v /usr/libexec/java_home >/dev/null 2>&1; then
    for ver in 21 17 17+; do
      if /usr/libexec/java_home -v "$ver" >/dev/null 2>&1; then
        /usr/libexec/java_home -v "$ver"
        return 0
      fi
    done
  fi
  local candidates=(
    "/Applications/Android Studio.app/Contents/jbr/Contents/Home"
    "$HOME/Applications/Android Studio.app/Contents/jbr/Contents/Home"
    "/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home"
    "/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"
    "/opt/homebrew/opt/openjdk/libexec/openjdk.jdk/Contents/Home"
    "/usr/local/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home"
    "/usr/local/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"
    "/usr/local/opt/openjdk/libexec/openjdk.jdk/Contents/Home"
  )
  for c in "${candidates[@]}"; do
    if [[ -x "$c/bin/java" ]]; then
      echo "$c"
      return 0
    fi
  done
  return 1
}

if RESOLVED_JAVA="$(resolve_java_home)"; then
  export JAVA_HOME="$RESOLVED_JAVA"
  export PATH="$JAVA_HOME/bin:$PATH"
else
  echo "BLOCKED: Java JDK 17+ not found. Install Temurin/OpenJDK 17+ or Android Studio JBR and set JAVA_HOME."
  exit 2
fi

JAVA_VER_OUT="$(java -version 2>&1)"
echo "$JAVA_VER_OUT"
JAVA_MAJOR="$(printf '%s\n' "$JAVA_VER_OUT" | sed -nE 's/.*version "([0-9]+).*/\1/p' | head -n 1)"
if [[ -z "$JAVA_MAJOR" ]] || [[ "$JAVA_MAJOR" -lt 17 ]]; then
  echo "BLOCKED: Java 17+ is required for Capacitor 8 / AGP (detected major: '${JAVA_MAJOR:-unknown}')."
  exit 2
fi

# Resolve Android SDK (ANDROID_HOME -> ANDROID_SDK_ROOT -> standard macOS path)
if [[ -z "${ANDROID_HOME:-}" ]]; then
  if [[ -n "${ANDROID_SDK_ROOT:-}" ]] && [[ -d "$ANDROID_SDK_ROOT" ]]; then
    export ANDROID_HOME="$ANDROID_SDK_ROOT"
  else
    export ANDROID_HOME="$HOME/Library/Android/sdk"
  fi
fi

if [[ ! -d "$ANDROID_HOME" ]]; then
  echo "BLOCKED: Android SDK not found at ANDROID_HOME=$ANDROID_HOME"
  exit 3
fi
export ANDROID_SDK_ROOT="${ANDROID_SDK_ROOT:-$ANDROID_HOME}"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"

# POSIX numeric version sort (macOS BSD sort lacks -V)
LATEST_BT="$(ls -1 "$ANDROID_HOME/build-tools" 2>/dev/null | sort -t. -k1,1n -k2,2n -k3,3n | tail -n 1 || true)"
if [[ -n "$LATEST_BT" ]] && [[ -d "$ANDROID_HOME/build-tools/$LATEST_BT" ]]; then
  export PATH="$ANDROID_HOME/build-tools/$LATEST_BT:$PATH"
  echo "Android Build-Tools: $LATEST_BT"
fi

if command -v adb >/dev/null 2>&1; then
  which adb
  adb version
  adb devices -l || true
else
  echo "WARN: adb not found in $ANDROID_HOME/platform-tools; optional device install will be skipped."
fi

echo "=== [PHASE 1] SOURCE & ASSET INTEGRITY ==="
if [[ -f "data/checkpoints/p1n-certified/SHA256SUMS.txt" ]]; then
  shasum -a 256 -c data/checkpoints/p1n-certified/SHA256SUMS.txt
elif [[ -f "data/checkpoints/p1m-certified/SHA256SUMS.txt" ]]; then
  shasum -a 256 -c data/checkpoints/p1m-certified/SHA256SUMS.txt
else
  echo "BLOCKED: No checkpoint SHA256SUMS.txt manifest found under data/checkpoints/."
  exit 4
fi
ls -lh public/models/characters/*.glb public/models/environments/ashblock/*

echo "=== [PHASE 2] DEPENDENCIES, TESTS, BUILD & NATIVE GRADLE ==="
if [[ ! -d node_modules ]]; then
  if [[ -f package-lock.json ]]; then
    npm ci
  elif [[ -f bun.lock ]] && command -v bun >/dev/null 2>&1; then
    bun install --frozen-lockfile
  else
    npm install
  fi
fi

npm run lint
npm test
node scripts/validate-character-glbs.mjs
npm run build
npx cap sync android

if [[ ! -f "$ROOT_DIR/android/gradlew" ]]; then
  echo "BLOCKED: Missing Gradle wrapper at $ROOT_DIR/android/gradlew"
  exit 4
fi
chmod +x "$ROOT_DIR/android/gradlew"
(cd "$ROOT_DIR/android" && ./gradlew assembleDebug --stacktrace)

if [[ ! -f "$APK_PATH" ]]; then
  echo "ERROR: Expected APK missing at $APK_PATH"
  exit 4
fi

echo "APK Path: $APK_PATH"
ls -lh "$APK_PATH"
shasum -a 256 "$APK_PATH" | tee "$OUT_DIR/apk_sha256.txt"

if command -v apksigner >/dev/null 2>&1; then
  apksigner verify --verbose --print-certs "$APK_PATH" | tee "$OUT_DIR/apksigner_verify.txt"
else
  echo "WARN: apksigner not found in build-tools PATH; install Android SDK Build-Tools to verify signature."
fi

echo "=== [PHASE 2B] APK EMBEDDED ASSET INSPECTION ==="
unzip -l "$APK_PATH" | grep -E "models/characters/.*\.glb|models/environments/ashblock/|ashblock_kit_manifest\.json|capacitor\.config\.json" | tee "$OUT_DIR/apk_embedded_assets.txt"

CHAR_GLB_COUNT="$(grep -c "assets/public/models/characters/.*\.glb$" "$OUT_DIR/apk_embedded_assets.txt" || true)"
WORLD_GLB_COUNT="$(grep -c "assets/public/models/environments/ashblock/.*\.glb$" "$OUT_DIR/apk_embedded_assets.txt" || true)"
echo "Verified inside APK: character root/version GLBs=$CHAR_GLB_COUNT, Ashblock world GLBs=$WORLD_GLB_COUNT"
if [[ "$CHAR_GLB_COUNT" -lt 10 ]] || [[ "$WORLD_GLB_COUNT" -lt 12 ]]; then
  echo "ERROR: APK is missing required GLB assets (expected >=10 character, >=12 Ashblock)."
  exit 4
fi

DEVICE_COUNT=0
if command -v adb >/dev/null 2>&1; then
  DEVICE_COUNT="$(adb devices | awk 'NR>1 && $2=="device" {c++} END {print c+0}')"
fi

if [[ "$DEVICE_COUNT" -eq 0 ]]; then
  echo "PENDING_DEVICE_ATTACHMENT" > "$OUT_DIR/device_status.txt"
  echo "=== [PHASE 3-5] OPTIONAL ADB STEP SKIPPED (NO AUTHORIZED DEVICE ATTACHED) ==="
  echo "Native Debug APK built, checksummed, and asset-verified cleanly at:"
  echo "  $APK_PATH"
  echo "To complete on-device installation & hardware qualification:"
  echo "  1. Connect a physical Android device (USB debugging enabled) or boot an AVD emulator."
  echo "  2. Verify 'adb devices' shows status 'device'."
  echo "  3. Re-run: ./scripts/p1n-mac-qualify.sh --require-device"
  if [[ "$REQUIRE_DEVICE" -eq 1 ]]; then
    exit 5
  fi
  exit 0
fi

echo "DEVICE_ATTACHED" > "$OUT_DIR/device_status.txt"
TARGET_SERIAL="$(adb devices | awk 'NR>1 && $2=="device" {print $1; exit}')"
DEVICE_MODEL="$(adb -s "$TARGET_SERIAL" shell getprop ro.product.model | tr -d '\r')"
ANDROID_VER="$(adb -s "$TARGET_SERIAL" shell getprop ro.build.version.release | tr -d '\r')"
SDK_VER="$(adb -s "$TARGET_SERIAL" shell getprop ro.build.version.sdk | tr -d '\r')"
GPU_RENDERER="$(adb -s "$TARGET_SERIAL" shell dumpsys SurfaceFlinger | grep -m1 GLES || true)"
echo "Target Device: $TARGET_SERIAL | Model: $DEVICE_MODEL | Android $ANDROID_VER (API $SDK_VER)"
echo "GPU Info: $GPU_RENDERER"

echo "=== [PHASE 3] ADB INSTALL, COLD LAUNCH, LIFECYCLE & LOGCAT ==="
adb -s "$TARGET_SERIAL" logcat -c
adb -s "$TARGET_SERIAL" install -r "$APK_PATH"
adb -s "$TARGET_SERIAL" shell am start -W -S -n "$MAIN_ACTIVITY" | tee "$OUT_DIR/cold_launch_timing.txt"
sleep 8
adb -s "$TARGET_SERIAL" exec-out screencap -p > "$CAP_DIR/01_android_title_launch.png"

echo "Verifying Pause / Background / Resume..."
adb -s "$TARGET_SERIAL" shell input keyevent KEYCODE_HOME
sleep 2
adb -s "$TARGET_SERIAL" shell am start -W -n "$MAIN_ACTIVITY" | tee "$OUT_DIR/resume_timing.txt"
sleep 3

echo "Verifying App Force-Stop + Clean Restart..."
adb -s "$TARGET_SERIAL" shell am force-stop "$APP_ID"
sleep 1
adb -s "$TARGET_SERIAL" shell am start -W -n "$MAIN_ACTIVITY" | tee "$OUT_DIR/restart_timing.txt"
sleep 6

echo "=== [PHASE 5] MEMORY, GFXINFO & THERMAL SNAPSHOT ==="
adb -s "$TARGET_SERIAL" shell dumpsys meminfo "$APP_ID" | tee "$OUT_DIR/dumpsys_meminfo.txt"
adb -s "$TARGET_SERIAL" shell dumpsys gfxinfo "$APP_ID" framestats | head -n 90 | tee "$OUT_DIR/dumpsys_gfxinfo.txt"
adb -s "$TARGET_SERIAL" shell dumpsys thermalservice 2>/dev/null | head -n 40 | tee "$OUT_DIR/dumpsys_thermal.txt" || true

adb -s "$TARGET_SERIAL" logcat -d -t 500 | grep -iE "kaijax|capacitor|chromium|webgl|egl|fatal|exception|error" | tee "$OUT_DIR/logcat_filtered.txt" || true

echo "=== P1-N / P1-O MAC SCRIPT COMPLETE ==="
echo "Next manual interactive check on attached device ($DEVICE_MODEL):"
echo "  1. Execute Ashblock Heights walkthrough (Kai/Jax sprint, rooftop, swing, zip, parry, relay takedown, Duo Finisher, 3-tail Kai-Jax fusion, Boss Courtyard, Save/Reload)."
echo "  2. Capture interactive gameplay screenshots via: adb -s $TARGET_SERIAL exec-out screencap -p > docs/production/captures/p1n/02_gameplay.png"
echo "  3. Record actual 30/60 FPS telemetry and update docs/production/P1N_DEVICE_GAMEPLAY_QA.md & P1N_RELEASE_GATE.md."

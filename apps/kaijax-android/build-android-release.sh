#!/usr/bin/env bash
set -euo pipefail

# Build web assets, sync into Capacitor Android, and compile debug & release APKs.
# Optional release signing environment variables:
#   ANDROID_KEYSTORE_PATH
#   ANDROID_KEYSTORE_PASSWORD
#   ANDROID_KEY_ALIAS
#   ANDROID_KEY_PASSWORD

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

echo "[1/4] Running TypeScript, offline unit tests, and Vite production bundle..."
npm run lint
npm test
npm run build

echo "[2/4] Syncing dist/ assets into Capacitor Android project..."
npx cap sync android

if [[ ! -d "$ROOT_DIR/android" ]]; then
  echo "ERROR: android/ directory missing. Run 'npx cap add android' first." >&2
  exit 1
fi

cd "$ROOT_DIR/android"

echo "[3/4] Compiling Android Debug APK..."
./gradlew assembleDebug

if [[ -n "${ANDROID_KEYSTORE_PATH:-}" ]]; then
  echo "[4/4] Compiling signed Android Release APK..."
  ./gradlew assembleRelease
else
  echo "[4/4] Compiling unsigned Android Release APK (set ANDROID_KEYSTORE_* to sign)..."
  ./gradlew assembleRelease
fi

echo "Done. Outputs located under android/app/build/outputs/apk/"

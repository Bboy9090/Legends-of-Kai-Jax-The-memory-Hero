#!/bin/bash
set -euo pipefail

REQUIRED_SIGNING_COMMIT="b7c8976ed8987ace0e4f3f74072a1bcff0da7590"
EXPECTED_TEAM="86NUJ8M3B8"
EXPECTED_BUNDLE="com.bobbyblanco.legendsofkaijax"
ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

echo "== Kai-Jax iOS / Xcode Cloud bootstrap =="

if ! command -v xcodebuild >/dev/null 2>&1; then
  echo "ERROR: Xcode command-line tools are unavailable."
  echo "Open Xcode once, finish any first-launch components, then rerun."
  exit 1
fi

echo "-- Xcode"
xcodebuild -version

echo "-- Git"
git fetch origin main
if ! git merge-base --is-ancestor "$REQUIRED_SIGNING_COMMIT" HEAD; then
  echo "ERROR: this checkout does not contain the required Apple-managed-signing commit:"
  echo "  $REQUIRED_SIGNING_COMMIT"
  echo "Run: git switch main && git pull --ff-only origin main"
  exit 1
fi

PBX="apps/web/ios/App/App.xcodeproj/project.pbxproj"
SCHEME="apps/web/ios/App/App.xcodeproj/xcshareddata/xcschemes/App.xcscheme"
WORKSPACE="apps/web/ios/App/App.xcworkspace"

grep -q "DEVELOPMENT_TEAM = $EXPECTED_TEAM;" "$PBX"
grep -q "PRODUCT_BUNDLE_IDENTIFIER = $EXPECTED_BUNDLE;" "$PBX"
grep -q "CODE_SIGN_STYLE = Automatic;" "$PBX"
grep -q 'buildForArchiving = "YES"' "$SCHEME"
grep -q 'buildConfiguration = "Release"' "$SCHEME"

echo "-- Signing contract OK"
echo "Team:      $EXPECTED_TEAM"
echo "Bundle ID: $EXPECTED_BUNDLE"
echo "Signing:   Automatic"
echo "Archive:   Release / enabled"

if command -v corepack >/dev/null 2>&1; then
  corepack enable
  corepack prepare pnpm@9.15.9 --activate
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "ERROR: pnpm is unavailable. Install Node/Corepack, then rerun."
  exit 1
fi

echo "-- Dependencies / web build / Capacitor sync"
pnpm install --filter ./apps/web... --frozen-lockfile
pnpm -C apps/web build
(
  cd apps/web
  npx cap sync ios
)

echo "-- Xcode project visibility"
(
  cd apps/web/ios/App
  xcodebuild -workspace App.xcworkspace -scheme App -list >/tmp/kaijax-xcode-list.txt
)
grep -q "App" /tmp/kaijax-xcode-list.txt

echo
echo "READY FOR APPLE-MANAGED SIGNING."
echo "Opening: $WORKSPACE"
echo
echo "In Xcode:"
echo "  1. Sign in to the Apple ID that owns Team $EXPECTED_TEAM."
echo "  2. Confirm App target > Signing & Capabilities > Automatically manage signing."
echo "  3. Product > Xcode Cloud > Create/Manage Workflow (or Report navigator > Cloud)."
echo "  4. Use shared scheme: App."
echo "  5. Add Archive action for iOS with deployment preparation: TestFlight and App Store."
echo "  6. Start the build from main."
echo
echo "If Apple refuses provisioning, copy the exact signing error; repo-side signing is already validated."

open "$WORKSPACE"

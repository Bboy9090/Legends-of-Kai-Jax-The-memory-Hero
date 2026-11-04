#!/bin/sh
set -eu

ROOT="${CI_WORKSPACE:-/Volumes/workspace/repository}"
cd "$ROOT"

echo "[xcodecloud] source: $(git rev-parse HEAD)"
echo "[xcodecloud] installing exact web dependency graph"
npm install -g pnpm@9.15.9

pnpm install --filter ./apps/web... --frozen-lockfile

echo "[xcodecloud] typechecking qualified web target"
pnpm -C apps/web typecheck

echo "[xcodecloud] building qualified production web target"
pnpm -C apps/web build
test -s apps/web/dist/index.html

echo "[xcodecloud] syncing production web assets into Capacitor iOS"
pnpm -C apps/web cap:sync

PBX="apps/web/ios/App/App.xcodeproj/project.pbxproj"
SCHEME="apps/web/ios/App/App.xcodeproj/xcshareddata/xcschemes/App.xcscheme"
EXPECTED_TEAM="86NUJ8M3B8"
EXPECTED_BUNDLE="com.bobbyblanco.legendsofkaijax"

grep -q "DEVELOPMENT_TEAM = $EXPECTED_TEAM;" "$PBX"
grep -q "PRODUCT_BUNDLE_IDENTIFIER = $EXPECTED_BUNDLE;" "$PBX"
grep -q "CODE_SIGN_STYLE = Automatic;" "$PBX"
grep -q 'buildForArchiving = "YES"' "$SCHEME"
grep -q 'buildConfiguration = "Release"' "$SCHEME"

SOURCE_SHA="$(git rev-parse HEAD)"
node - "$SOURCE_SHA" "$EXPECTED_TEAM" "$EXPECTED_BUNDLE" <<'NODE'
const fs = require('fs');
const [sourceCommit, teamId, bundleId] = process.argv.slice(2);
const receipt = {
  schema: 'legends-of-kai-jax.xcode-cloud-preflight.v1',
  sourceCommit,
  teamId,
  bundleId,
  signingStyle: 'Automatic',
  webBuild: 'pass',
  capacitorSync: 'pass',
  archiveScheme: 'App',
  archiveConfiguration: 'Release',
  signedArchiveProduced: false,
  appStoreUploadProven: false,
  status: 'repo-preflight-pass-awaiting-xcode-cloud-archive'
};
fs.writeFileSync('xcode-cloud-preflight.json', JSON.stringify(receipt, null, 2) + '\n');
console.log(JSON.stringify(receipt));
NODE

echo "[xcodecloud] repository preflight complete; Apple-managed archive/signing remains an Xcode Cloud step"

#!/bin/sh
set -eu

echo "[xcodecloud] post-clone: installing node deps from repo root"
cd "${CI_WORKSPACE:-/Volumes/workspace/repository}"

npm ci
# If needed for Capacitor plugin wiring:
# npx cap sync ios

echo "[xcodecloud] done"

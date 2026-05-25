#!/bin/sh
set -eu

echo "[xcodecloud] post-clone: installing pnpm and node deps from repo root"
cd "${CI_WORKSPACE:-/Volumes/workspace/repository}"

# Install the exact pnpm version specified in package.json globally
npm install -g pnpm@9.15.9

# Install monorepo dependencies with frozen lockfile
pnpm install --frozen-lockfile

# Build the 3D game client web assets
pnpm build

# Sync built assets into the Capacitor native iOS project
pnpm -C apps/web cap:sync

echo "[xcodecloud] done"

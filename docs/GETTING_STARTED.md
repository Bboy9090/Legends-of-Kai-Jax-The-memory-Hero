# Getting Started — Legends of Kai-Jax

## Prerequisites

Install these first:

- Node.js 20 LTS or higher
- pnpm 9.15.9 or compatible pnpm 9.x
- Git

Install pnpm if needed:

```bash
npm install -g pnpm@9.15.9
```

## Clone the Repository

```bash
git clone https://github.com/Bboy9090/Legends-of-Kai-Jax-The-memory-Hero.git
cd Legends-of-Kai-Jax-The-memory-Hero
```

## Install Dependencies

From the repo root:

```bash
pnpm install
```

## Main Game Client

Primary app:

```text
apps/web
```

Stack:

```text
React + Vite + TypeScript + Three.js / React Three Fiber
```

Run the game client:

```bash
pnpm -C apps/web dev
```

Then open the URL printed by Vite. The configured dev server port is currently `3000`.

Common local URL:

```text
http://localhost:3000
```

## Build Proof

Run these before claiming a milestone is complete:

```bash
pnpm -C apps/web build
pnpm -C apps/web test
pnpm -C apps/web typecheck
```

If a command fails, paste the exact output into a QA report. Do not summarize errors. The exact error is the map. Summaries are where bugs go to hide and start families.

## Root Scripts

Useful root commands:

```bash
pnpm dev
pnpm build
pnpm test
```

The main product proof still belongs to `apps/web` first.

## Optional Desktop Shell

The Electron desktop wrapper lives here:

```text
apps/desktop
```

Do not prioritize desktop packaging until `apps/web` is proven.

Basic desktop TypeScript check:

```bash
pnpm -C apps/desktop build:ts
```

## Current Phase 0 Rule

Do not rebuild clean-slate.

The current repo already contains playable-system foundations. The correct next move is to stabilize, prove the build, clean stale docs, and focus the best existing systems into one playable vertical slice.

## Project Structure

```text
apps/web        Primary 3D game client
apps/desktop    Optional Electron wrapper
packages/shared Shared types and utilities
packages/engine Engine package
packages/characters Character package
frontend         Legacy/lore hub frontend path
backend          Optional/legacy FastAPI backend path
memory           PRD and production notes
docs             Documentation and QA reports
```

## Next Step

Run the Phase 0 command proof:

```bash
pnpm install
pnpm -C apps/web build
pnpm -C apps/web test
pnpm -C apps/web typecheck
```

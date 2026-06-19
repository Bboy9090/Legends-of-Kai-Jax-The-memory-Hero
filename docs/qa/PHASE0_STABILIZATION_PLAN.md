# Legends of Kai-Jax — Phase 0 Stabilization Plan

Branch: `phase0-stabilize-web-game`

## Purpose

Stabilize the current repository before adding new story, characters, bosses, maps, multiplayer, mobile wrappers, or cinematic expansion.

The current repo has real gameplay foundations, so the correct path is **refactor current repo**, not rebuild clean-slate.

## Primary Goal

Prove the current `apps/web` game can install, build, test, and run as the main playable prototype.

No new feature work is accepted until this proof exists.

## Phase 0 Command Proof

Run from the repository root:

```bash
pnpm install
pnpm -C apps/web build
pnpm -C apps/web test
pnpm -C apps/web typecheck
```

Optional validation after the web proof:

```bash
node apps/web/scripts/validate-registry.mjs
pnpm -C apps/desktop build:ts
```

## Pass Criteria

- Dependencies install without lockfile failure.
- `apps/web` production build succeeds.
- Vitest test suite succeeds.
- Typecheck result is captured honestly.
- Any failing command has exact output pasted into a QA report.
- README claims are updated to match verified reality.

## Main Product Lane

The primary playable game lane is:

`apps/web` → React + Vite + Three.js / React Three Fiber

The current target is:

Player movement → combat → enemy AI → damage → victory/reward → save.

## Protect These Files

- `apps/web/src/components/game/adventure/AdventureArena.tsx`
- `apps/web/src/components/game/adventure/AdventurePlayerController.tsx`
- `apps/web/src/components/game/adventure/AdventureEnemyAI.tsx`
- `apps/web/src/lib/stores/useAdventure.ts`
- `apps/web/src/combat/MovePlayer.ts`
- `apps/web/src/combat/MovePlayer.test.ts`
- `apps/web/src/systems/SaveManager.ts`
- `apps/web/src/assets/modelRegistry.ts`

## Cleanup Targets

### Documentation

- Standardize title to `Legends of Kai-Jax: The Memory Warrior` unless the project owner chooses otherwise.
- Remove stale references to `Smash-Hereos`.
- Standardize local dev port instructions.
- Stop claiming production readiness unless build/test proof exists.

### Scripts

- Remove or disable root scripts that point to missing apps.
- Align pnpm versions across `package.json` and GitHub Actions.
- Keep `apps/web` as the first proof target.

### Asset / License Risk

- Confirm model source and license for every GLB in `apps/web/public/models`.
- Add an attribution/license file for models and generated assets.
- Keep Meshy/Quaternius/third-party assets separated until provenance is clear.

## First Refactor Targets

1. Fix documentation truth.
2. Align package manager and CI versions.
3. Prove `apps/web` build/test/typecheck.
4. Integrate `SaveManager` with the adventure loop.
5. Create one vertical-slice route that starts directly in a playable arena.
6. Add a QA checklist for every build.

## Definition of Done for Phase 0

Phase 0 is complete only when:

- Fresh install works.
- Build passes or failures are documented precisely.
- Tests pass or failures are documented precisely.
- Typecheck status is honest.
- README no longer overclaims.
- The main playable route is identified.
- The next exact gameplay task is ready for implementation.

## Current Decision

**Refactor current repo. Do not rebuild.**

The repo already contains real gameplay systems. The job now is to discipline the structure, prove the build, and turn the best existing systems into one clean playable vertical slice.

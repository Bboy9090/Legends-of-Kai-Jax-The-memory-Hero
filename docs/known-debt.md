# Production Known-Debt Register

Comprehensive tracker of all known items that are not currently verified,
complete, or production-grade. Each item is classified by release impact.

**Last updated:** 2026-08-01 (Phase 1B code integration PR #222)

---

## Release Blockers

### 1. Live Vercel Deployment Identity Verification

**Status:** ❌ Unverified

The code in [PR #222](https://github.com/Bboy9090/Legends-of-Kai-Jax-The-memory-Hero/pull/222) is pushed and ready to deploy, but the actual live Vercel deployment has not been verified from this repository session because the execution environment cannot reach external HTTPS hosts.

**Required verification:**
- Deploy to `https://legends-of-kai-jax-the-memory-hero.vercel.app/`
- Confirm HTTPS active, no localhost redirects
- Confirm deployed commit SHA
- Test main menu load and interactive state
- Document manual verification before release

**Dependency:** Must complete before `v0.1.0-mvp` release.

---

## High Priority

### 2. Deployed Commit SHA Not Confirmed

**Status:** ⏳ Pending

Cannot determine which commit is currently deployed to the live Vercel
instance. Needed for reproducibility and rollback safety.

**Resolution:** After manual Vercel deployment, record the commit SHA that
is actually serving production traffic.

### 3. Full 15-Mission End-to-End Completion Matrix

**Status:** ⏳ Pending

The 15 missions are defined in `apps/web/src/lib/story_missions.ts`. Individual
mission load/enemy-spawn/pause/quit flows are covered by Phase 1A proofs, but
a complete end-to-end playability matrix (mission entry → mission completion
or known blocker) has not been run.

**What's covered:** Phase 1A playtest verified representative mission flow
(load, enemy spawn, wave progression, pause, quit). Phase 1B dead-code audit
removed unreachable mission code paths.

**What's not covered:** Playing all 15 missions sequentially to completion.

**Resolution:** Run or document a full 15-mission completion test before
final release.

### 4. Full Boss Battle Matrix

**Status:** ⏳ Pending

Six boss encounters are defined (Void Stalker, Rift General, Synergy Hunter,
Well Defiler, Rift General Prime, Voidonus Imperion). Boss spawn, combat flow,
and defeat conditions are not individually verified.

**Resolution:** Test each boss encounter independently or document known
defeaters before release.

### 5. Full Roster / Model Render Matrix

**Status:** ⏳ Pending

100+ playable characters are enumerated in `apps/web/src/lib/all_playable_characters.ts`
(unified FIGHTERS, BEAST_FIGHTERS, and roster characters). Individual model
asset load, render, animation, and combat spawn have not been verified for
every character.

**What's known:**
- All 40 canonical GLB models lack 9-tail rig anchors (Blender audit, Phase 1B).
- Prototype tail rig built for `kai-jax` (weight-paint still needed).
- Player visibility fallback renders if any GLB fails to load.

**Resolution:** Enumerate expected characters and define pass/fail criteria
(asset present, renders without error, animation plays, no console error).

### 6. Live Gameplay Flow Verification

**Status:** ⏳ Pending

Campaign navigation, mission selection, briefing, and actual adventure-mode
gameplay have not been verified on the live Vercel deployment.

**Current state:** Local preview server (localhost:4174) loads main menu and
renders correctly. Live deployment not tested (network policy blocked).

**Resolution:** After deploying to Vercel, manually walk through:
- Navigate to campaign
- Select a mission
- View mission briefing
- Enter adventure mode
- Player loads
- Movement works
- Attack works
- Pause works
- Force quit works

### 7. Live Network / Asset Integrity

**Status:** ⏳ Pending

No test verifies that all assets (models, sounds, textures, sprites) are
actually reachable and loadable from the live Vercel deployment.

**Known issues:**
- LoreHub artwork was self-hosted in Phase 1B (moved from CDN). Local verification
  passed; live Vercel not tested.
- Audio files (background music, sound effects) are served from `public/sounds/`.
- GLB models served from `public/models/`.

**Resolution:** Add network asset audit to live deployment verification gate.

### 8. Performance / Frame-Time Validation

**Status:** ⏳ Pending

No recorded evidence of frame-time stability, input latency, or GPU utilization
on target platforms (desktop, mobile, Vercel's infrastructure).

**Known benchmarks:** None recorded.

**Resolution:** Run or document performance baseline before release. Do not
make "no frame drops" or "60 FPS guaranteed" claims without recorded proof.

---

## High (Non-Blocking)

### 9. Remaining TypeScript Debt Outside Phase 0 Scope

**Status:** Known, in-scope for Phase 1 post-release

`tsconfig.phase0.json` is a deliberately narrow TypeScript profile used for
production builds and CI. The full `tsc --noEmit` (all files, all rules) has
pre-existing errors in the wider codebase outside Phase 0.

**Scope:** Phase 0 profile covers `apps/web/src/` (game code); errors exist
in `packages/` and elsewhere.

**Resolution:** Not required for `v0.1.0-mvp`. Create a follow-up Phase 2
task to audit and resolve remaining errors if needed.

### 10. Canonical GLB Tail-Anchor Warnings

**Status:** Known, intentional

All 40 canonical character models lack 9-tail deformation rigging. `GLBCharacterLoader.ts`
logs expected warnings:

```
[GLBLoader] <url>: N/9 tail anchors missing (tail_01..tail_09). Tail attachment will be limited.
```

This is **not a bug**; the game gracefully degrades. Tail attachment is simply
limited rather than disabled.

**What works:** characters load, render, animate, and fight without error.

**What's limited:** the 9-tail lore mechanic (cosmetic lore element) cannot
fully deploy without rigged tails.

**Resolution:** Ship with this warning as-is. Tail rigging is a post-launch
cosmetic enhancement, not a blocker.

### 11. Kai-Jax Tail-Rig Prototype Not Production Asset

**Status:** Known, prototype

A prototype 9-tail deformation rig was built and tested on the `kai-jax` model
in Phase 1B (tested against 9 poses: idle, walk, blend, dodge, heavy attack,
hit reaction, dodge-while-attacking, stun-hit, impact-reaction).

**Status:** Idle/walk/blend poses pass validation. Large combat poses show mesh
clipping/strain (weight-painting issue, not rig topology).

**Current asset:** The `kai-jax.glb` in production is the character model with
the prototype rig attached. It renders without error but shows visual strain
in heavy poses.

**Resolution:** Not a release blocker (visual quality only). Production tail
rigging requires hand weight-paint cleanup by an artist. Marked for Phase 2
polish work.

### 12. Placeholder / Fallback Artwork

**Status:** Known, documented

Some UI backgrounds and lore-screen imagery remain as fallback placeholders
pending final artist approval/iteration:

- LoreHub background images: recently self-hosted from CDN during Phase 1B
  (still pending final art pass).
- Mission briefing backgrounds: placeholder visuals.
- Character bio artwork: some entries use placeholder portraits.

**Current state:** All fallbacks render without error. No broken asset chains.

**Resolution:** Artist sign-off on final artwork. Not a blocker for playability.

### 13. TypeScript Full-Scope Errors

**Status:** Known, out of scope for Phase 0

`pnpm -C apps/web typecheck:full` (unscoped `tsc --noEmit`) reports errors
in packages and tests outside the Phase 0 profile.

**Why this is OK:** Phase 0 scope was intentionally curated to cover live game
code (`apps/web/src/`). Full-scope errors are pre-existing and do not affect
the running game.

**Resolution:** Address in Phase 2 if code outside Phase 0 becomes active. Not
required for `v0.1.0-mvp`.

---

## Medium Priority

### 14. Divergent Model-Loading Paths (Registry vs. Filename Guessing)

**Status:** Known, dual implementation

Character models can be loaded via two paths:

1. **Registry** (`apps/web/src/lib/modelRegistry.ts`) — canonical, curated list
   of GLB files with metadata (id, name, role, stats).
2. **Filename guessing** — fallback in some components that constructs paths
   from character ID alone (e.g., `/models/${id}.glb`).

**Issue:** If registry and filename convention drift, some characters may load
from the wrong path, or the fallback may pick an outdated/wrong model.

**Current state:** Both paths work but are not unified. No known mismatches
have been reported.

**Resolution:** Unify model loading to always go through the registry, or
remove the fallback path. Medium priority cleanup for Phase 2.

### 15. Unreachable / Archived Prototype Systems in Repo

**Status:** Known, cleaned up in Phase 1B

Phase 1B dead-code audit removed six files with zero references:

- `apps/web/src/components/SagaModeLauncher.jsx`
- `apps/web/src/components/game/TouchControls.tsx` (superseded by `AdventureTouchControls.tsx`)
- `apps/web/src/components/game/world/NexusHaven.tsx`
- `apps/web/src/components/ui/SagaModeLauncher.jsx`
- `apps/web/src/components/ui/SagaModeLauncher.tsx`
- `apps/web/src/debug/RegistryDebugOverlay.ts` (installed but never called)

**Remaining orphaned code:** Other prototypes and archived systems may still
exist in top-level folders (`backend/`, `engine/`, `specs/`, etc.) outside
the live MVP. None are part of the build or affect release readiness.

**Resolution:** Already addressed for Phase 0 MVP code. Archive or remove
prototype folders in Phase 2 housekeeping if needed.

### 16. Gamepad Input Not Implemented

**Status:** Known, intentional

No `navigator.getGamepads()` integration exists anywhere. The codebase has
a `Gamepad2Icon` SVG (purely decorative menu button icon), but no actual
gamepad input handling.

**Current state:** Keyboard and touch input work. Gamepad not supported.

**Resolution:** Low priority for MVP. Gamepad support can be added post-launch
if needed.

### 17. Service-Worker Registration Disabled

**Status:** Known, intentional

PWA manifest is present (`apps/web/public/manifest.json`), but service-worker
registration is currently disabled in the app code.

**Why disabled:** Offline play is not yet guaranteed to work; disabling SW
avoids stale cache issues during active development.

**Resolution:** Enable and test offline support before marketing as PWA.
Medium priority post-launch.

---

## Low Priority

### 18. Root-Level Validation Scripts Broken

**Status:** Known

Two root-level scripts are declared but non-functional:

- `pnpm validate:canon` → references missing `validate-canon.mjs`
- `pnpm validate:memory` → references missing `validate-memory-layers.mjs`

**Current state:** Do not exist at repo root. Silently fail if called.

**Resolution:** Remove from `package.json` scripts or implement if needed.
Low-priority cleanup.

### 19. Registry Debug Overlay Not Wired Up

**Status:** Known, dormant

`apps/web/src/debug/RegistryDebugOverlay.ts` is a full debug overlay (open/close/refresh/report
methods, localStorage state). It was built in an earlier phase but `installRegistryDebugOverlay()`
is never called anywhere in the app.

**Current state:** Code exists but does not run at runtime. Not available to
users or testers.

**Resolution:** Either wire up or remove. Low priority; useful for development
but not required for release.

### 20. Verbose Logging API Missing

**Status:** Known, acceptable for MVP

No `window.verboseMode()` or dedicated verbose-logging toggle exists. Console
output is the only logging surface.

**Current state:** Acceptable for MVP. Developers rely on browser console
and `window.runnerStore` inspection.

**Resolution:** Add dedicated logging API in Phase 2 if needed for better
diagnostics.

### 21. Lore/Story Branching Not Implemented

**Status:** Known, out of scope for MVP

The 15 missions are linear story beats; no branching narrative paths or
multiple endings are implemented.

**Current state:** Single linear story progression through 3 acts.

**Resolution:** Narrative branching is a Phase 3+ feature. Not required for
`v0.1.0-mvp`.

### 22. Vite Alias Missing for `@beast-kin/ui`

**Status:** Known, no observed impact

`apps/web/vite.config.ts` aliases `@beast-kin/characters`, `@beast-kin/engine`,
and `@beast-kin/shared` to their `packages/*/src` paths, but `@beast-kin/ui`
has no alias. Build passes without error (`pnpm -C apps/web build` verified
this session), suggesting either nothing imports from `@beast-kin/ui` or pnpm's
workspace symlinking works around it.

**Resolution:** Low priority. Verify no imports exist from `@beast-kin/ui`, or
add the alias for consistency.

---

## Research / Prototype

### 23. Native iOS App Integration (LegendsOfKaiJax)

**Status:** Experimental

`apps/ios/LegendsOfKaiJax` is a separate native Swift Package (`GameEngineCore`)
distinct from the Capacitor wrapper (`apps/web/ios/App`).

**Current state:** Exists but integration status with the rest of the game is
unclear. Not built or tested in this session.

**Resolution:** Clarify or remove. Does not affect web/Capacitor release.

### 24. Alternative Build Targets (Desktop, Android Release)

**Status:** Build tooling present, unverified

- **Desktop (Electron):** `apps/desktop/` with `electron-builder` config exists.
  No packaged build has been created and tested.
- **Android Release Build:** `.github/workflows/android-build.yml` produces debug
  APKs only. No signed release build configuration exists.
- **iOS Signed Build:** `docs/ios/APP_STORE_BUILD.md` documents the pipeline
  but no signed build has been produced.

**Resolution:** Defer to Phase 2. Web release does not depend on these.

---

## Summary Table

| Category | Count | Examples |
|----------|-------|----------|
| **Release Blockers** | 1 | Live Vercel deployment verification |
| **High (Blocking)** | 7 | Deployed SHA, mission matrix, boss matrix, roster matrix, gameplay flow, asset integrity, perf validation |
| **High (Non-Blocking)** | 8 | Remaining TypeScript debt, tail-anchor warnings, placeholder artwork, etc. |
| **Medium** | 6 | Model loading paths, orphaned code, gamepad, service worker, broken scripts, Vite alias |
| **Low** | 4 | Debug overlay, logging API, lore branching |
| **Research / Prototype** | 2 | Native iOS, alternative build targets |

**Total tracked items:** 28

---

## Release Readiness Checklist

- [ ] **Live Vercel deployment verified** (manual: HTTPS, gameplay flow, asset integrity)
- [ ] **Deployed commit SHA recorded**
- [ ] **15-mission completion matrix run** (or documented coverage)
- [ ] **Boss battle matrix run** (or documented coverage)
- [ ] **Roster/model render matrix run** (or documented coverage)
- [ ] **Performance baseline captured** (frame-time, latency)
- [ ] **All verification gates passed:** install, build, test, typecheck
- [ ] **Local production preview confirmed** (build output, main menu)
- [ ] **PR #222 approved and merged**
- [ ] **v0.1.0-mvp release notes published**

**Remaining blockers before release:** Live Vercel deployment verification (manual step, not automated in this environment).

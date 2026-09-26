# Production Known-Debt Register

Comprehensive tracker of all known items that are not currently verified,
complete, or production-grade. Each item is classified by release impact.

**Last updated:** 2026-09-26 (Phase C PR #249 exact-head certification)

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

### 3. Current Story Hub / Mission Coverage

**Status:** ✅ Four established Raging City field nodes playable; deeper authored encounter content remains ongoing

The old 15-mission dataset in `apps/web/src/lib/story_missions.ts` remains a
**quarantined pre-Bloodward cinematic prototype** and is not current public
campaign authority. `CampaignMap.tsx` still routes legacy `campaign-map`
navigation into `StoryHubScreen`.

**Current public Story Hub:** Ashblock Heights, Ironvein Wards, Skyfall Spines,
and Storm Ronin Sanctum all have launchable, completion-recording runtimes.

- Ashblock retains its certified Fang combat / recovery / Memory Trace chain.
- Ironvein uses its source-safe traversal / pressure / trap / suppression /
  recovery / Memory Trace contract.
- Skyfall uses traversal / alternate-route / vertical-read / recovery /
  Memory Trace mechanics.
- Storm Ronin Sanctum uses training / archive / memory-reconstruction /
  reflection / exit mechanics.

The three newer slices intentionally share a noncombat field runtime until
publication-authorized encounter content is supplied. This prevents gameplay
completion from inventing bosses, deaths, revelations, or chapter chronology.

**Automated proof:** current-canon contract tests plus the exact-head
`Raging City field runtime completion` Playwright gate certify launch,
controller-owned traversal, interaction, completion recording, and safe exit.

**Remaining work:** deepen district-specific environments and add only
publication-authorized encounters/dialogue. Do not revive the quarantined
15-mission prototype as release evidence.

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

**Status:** ⏳ Partially verified

Automated runtime coverage now explicitly exercises sparse/slow software-WebGL
conditions and the live controllers cap movement simulation while allowing
bounded lifecycle catch-up. Input buffering, knockdown recovery, Fang AI timing,
and HUD diagnostics have all been hardened against low-FPS execution.

This is meaningful stability evidence, but it is not yet a target-device
performance certification.

**Still required:** capture real frame-time, input-latency, thermal, memory, and
GPU evidence on representative iOS and Android hardware before making 60 FPS or
"no frame drops" claims.

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

### 14. Model-Loading Authority

**Status:** ✅ Main production authorities unified; residual legacy-component audit remains

The principal live model renderers now resolve through
`apps/web/src/assets/modelRegistry.ts`:

- AdventureArena resolves canonical IDs through the registry.
- BeastModelSystem no longer owns a duplicate production path table.
- OptimizedBeastModel consumes registry-owned `battlePath` variants.
- The canonical battle fallback is registry-owned.
- Provenance inventory now includes production paths, battle variants, and the
  fallback GLB rather than only primary model paths.

This removed the previous filename-guessing authority from the main gameplay
render paths. The registry/provenance tests protect those contracts.

**Remaining work:** continue auditing dormant/legacy presentation components
that may still contain direct `/models/` references. Those references are
debt only if the component is reachable and independently chooses a character
model rather than consuming a registry-resolved asset.

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

### 16. Gamepad Input

**Status:** ✅ Implemented and runtime-certified for the Kai/Jax vertical slice

The live unified input path now includes standard browser Gamepad API support
via `navigator.getGamepads()`. Standard-mapping movement, camera, jump,
LB+A traversal, light/heavy/special/ultimate attacks, dodge, interact, pause,
and menu levels are represented in `GameplayInputState`.

Short gamepad button pulses are independently edge-polled and buffered so they
survive sparse WebGL frames. Suppression during knockdown/state locks now blocks
both level input and buffered actions, preventing latent controller commands
from firing after recovery.

**Automated proof:** vertical-slice runtime coverage verifies Jax standard
gamepad movement+dodge, Kai short LB+A traversal, sparse button-edge buffering,
and suppression behavior.

**Remaining work:** broader physical-controller coverage on target iOS/Android
hardware and non-standard controller mappings remains device-validation debt,
not an implementation gap.

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

### 18. Root-Level Validation Script Debt

**Status:** ✅ Resolved

The current root `package.json` no longer advertises the obsolete
`validate:canon` or `validate:memory` commands that referenced missing files.

**Current state:** Release-facing validation commands now point only at existing
registry, roster, combat, typecheck, lint, test, and build entry points.

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

### 22. Vite Alias for `@beast-kin/ui`

**Status:** ✅ Resolved

`apps/web/vite.config.ts` now explicitly aliases `@beast-kin/ui` to
`../../packages/ui/src`, matching the engine, characters, and shared
workspace aliases. Workspace resolution no longer depends on an accidental
pnpm-only path for this package.

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
- [x] **Current-canon Story Hub field coverage complete** (Ashblock + Ironvein + Skyfall + Storm Ronin Sanctum launch/completion certified; deeper authored encounter content remains ongoing)
- [ ] **Boss battle matrix run** (or documented coverage)
- [ ] **Roster/model render matrix run** (or documented coverage)
- [ ] **Performance baseline captured** (frame-time, latency)
- [x] **Phase C exact-head game verification gates passed:** CI, registry, Kai runtime, Jax runtime, combat certification, vertical-slice runtime, production preview, iOS native preflight, Android native preflight
- [x] **Local/CI production preview confirmed** (build output and preview smoke)
- [ ] **PR #222 approved and merged**
- [ ] **v0.1.0-mvp release notes published**

**Remaining blockers before release:** production asset provenance/licensing, live Vercel identity/network verification, target-platform performance evidence, native haptics/device feel proof, boss/roster depth coverage, and the other unchecked release-readiness items above.

**Current exact-head certification note (2026-09-26):** PR #249 head
`634fb3e54331195c3557b97b190eddb6553c4f67` passed all nine substantive
game/release workflows: CI, Registry Validation, Kai Runtime Smoke, Jax Runtime
Smoke, Combat Release Certification, Vertical Slice Runtime Smoke, Production
Preview Smoke, iOS Native Preflight, and Android Native Preflight. A separate
GitHub default CodeQL umbrella check still reports a C# analysis failure even
though the repository currently exposes no `.cs` source files and the
repository-owned CodeQL workflow is manual-only for JavaScript/TypeScript and
Python. Treat that as security-scanner configuration debt, not a gameplay
failure.

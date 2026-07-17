# Branch Salvage Audit — 2026-07-17

Branch: `phase1b-production-readiness` (this work continues PR #172)

## Canonical Branch Chain

```text
main -> phase0-stabilize-web-game -> phase1b-production-readiness
```

`main` already contains the fully polished 15-mission vertical slice, the
Android APK CI workflow, and iOS Xcode Cloud CI. `phase0-stabilize-web-game`
added playable-loop stabilization fixes on top. `phase1b-production-readiness`
is identical to `phase0-stabilize-web-game` and is the active branch for
production hardening. This is the only branch chain that should be developed
against going forward.

## Why This Audit Happened

A prior, unverified analysis (from an external workspace, not this repo)
claimed `origin/main` had been reset to a stub and that the real progress
was scattered across ~50 abandoned feature branches, naming several as
must-merge sources for animation, mobile controls, and quest/mission
systems. That analysis was checked directly against git history and found
to be false: `main` is a superset of the named "runner-up" integration
branch, and the working tree in this session was already the most advanced
branch in the repository. See PR #164 (closed, superseded by #172) for the
duplicate stabilization work this false premise would have discarded.

Three branches were named as containing unique, valuable, unmerged work.
Each was audited before deciding whether to cherry-pick anything from them.

## Branches Audited

1. `cursor/repo-games-overview-e81c` — last commit 2026-03-01, 178 commits
   not in main, not an ancestor of main.
2. `copilot/develop-core-story-mode-systems` — last commit 2026-02-26, 731
   commits not in main, not an ancestor of main.
3. `copilot/expand-input-mapping-state-logic` — last commit 2026-02-27, 729
   commits not in main, not an ancestor of main.

(Two other named branches, `cursor/project-core-evolution-9263` and
`chatgpt/handoff-registry-overlay-socket-pass`, were checked first and found
to already be fully merged into `main` — 0 unique commits, confirmed
ancestors. No audit was needed for those; their content is already present.)

## Components Compared

| Claimed feature | Branch | Compared against HEAD |
|---|---|---|
| "Sovereignty" clip-based animation controller, combo cancels, hit feedback, legendary finish | `cursor/repo-games-overview-e81c` | `packages/engine/src/combat/{ComboSystem,FrameCancelSystem,LegendaryComboSystem}.ts`, `apps/web/src/core/frameData/{FrameDataEngine,CharacterController}.ts`, `apps/web/src/components/game/animations/LegendaryAnimationSystem.tsx`, legendary-finish handling in `useBattle.tsx` |
| Quest system, iOS platform profile, mission propagation, C++ CombatSystem + EnemyAI | `copilot/develop-core-story-mode-systems` | `schemas/quest.schema.json`, `data/quests/`, `engine/cpp` equivalents under `apps/ios/LegendsOfKaiJax/GameEngineCore/src/...`, `apps/web/src/mission/` (MissionOrchestrator, MissionSchema, MissionTracker, WaveDirector), `story_missions.ts` |
| Mobile touch controls, responsive HUD, realistic limb animations, updated Jax model | `copilot/expand-input-mapping-state-logic` | `apps/web/src/components/game/TouchControls.tsx`, `MobileControls.tsx`, `apps/web/src/lib/touchUtils.ts`, `apps/web/src/lib/stores/useTouchInput.ts`, Jax model file, current HUD stack (`LegendaryHUDBar.tsx`, `AdventureHUD.tsx`, `DevFrameHud.tsx`) |

## Why No Cherry-Pick Was Needed

- **`cursor/repo-games-overview-e81c`**: its animation controller was an
  unvalidated clip-naming proposal built against a pre-monorepo layout,
  never wired to the real (Meshy-default-named) GLB files still in the
  repo. HEAD's combat/animation stack is larger, integrated, and already
  drives the same slow-motion / screen-shake / gold-flash legendary-finish
  behavior the branch only proposed.
- **`copilot/develop-core-story-mode-systems`**: its quest data, C++
  `CombatSystem`/`EnemyAI`, and mission runner files are byte-identical to
  HEAD (already merged upstream at some point). Its `story_missions.ts` is
  for a different, unrelated IP ("Beast Wars"), and the branch also carries
  a dead-end Unreal Engine 5 experiment unrelated to the current
  Vite/React/R3F + native iOS/Android/Electron architecture.
- **`copilot/expand-input-mapping-state-logic`**: `TouchControls.tsx`,
  `MobileControls.tsx`, `touchUtils.ts`, and the Jax model file are
  byte-identical to HEAD. HEAD additionally has `useTouchInput.ts`, which
  doesn't exist on the branch at all — HEAD is strictly ahead. The
  branch's only unique HUD files belong to an abandoned legacy
  Express/Vite `client/` prototype using an incompatible combat-meter
  system (a scrapped "Omega Protocol" Synergy/Resonance/Dread HUD) and are
  not a drop-in upgrade for the current HUD stack.

## Confirmation

HEAD (`phase1b-production-readiness`) contains implementations that are
equal to or more advanced than everything claimed unique on all three
audited branches, for every component checked above. No file from any of
the three branches was cherry-picked.

## Warning: Do Not Revive Abandoned Prototype Systems

All three audited branches carry dead architecture fragments alongside
whatever real work they contain: a pre-monorepo `client/`/`server/`
Express+Drizzle prototype, a partial Unreal Engine 5 project (`Source/`,
`Content/`, `Intermediate/`), and a scrapped "Omega Protocol"
Synergy/Resonance/Dread combat-meter HUD. None of these are part of the
current architecture. Do not merge, import, or take inspiration from these
subsystems — they were abandoned for a reason and pulling any of them in
would reintroduce competing, incompatible architectures into a tree that
has already converged on one.

## Disposition

- Branches are **not deleted**. They remain archived reference branches
  until `v0.1.0-mvp` ships, per explicit product decision.
- No cherry-picks were made from `cursor/repo-games-overview-e81c`,
  `copilot/develop-core-story-mode-systems`, or
  `copilot/expand-input-mapping-state-logic`.
- PR #164 ("Phase 0: stabilize web game foundation") closed as superseded
  by PR #172 ("Phase 1B: production readiness"), which is the branch this
  document lives on.

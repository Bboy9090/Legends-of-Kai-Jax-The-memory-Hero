# Legends of Kai-Jax — PRD

## Original Problem Statement
Continue implementation of Legends of Kai-Jax as a modular, data-driven combat game built on a universal combat kernel. Verify, complete, and integrate the existing P1–P4 implementations already in the repo (do NOT rebuild from scratch). Preserve current architecture, prioritize real gameplay proof, dark moody arena aesthetic.

## Architecture
- Vite + React 18 + TypeScript + Three.js (`/app/apps/web`)
- Combat runtime is shared across player vs AI, missions, bosses (one runtime, multiple orchestration layers)
- Data-driven: moves authored in JSON (`public/moves/*.json`), missions in `MissionSchema.ts`
- Shared kernel: `combat/MovePlayer.ts`, `combat/Hurtbox.ts`, `types/MoveSpec.ts`, `entities/{EnemyEntity,BossEntity}.ts`, `ai/{SimpleAI,BossAI}.ts`, `mission/{MissionOrchestrator,WaveDirector,MissionTracker,MissionSchema}.ts`
- Frontend supervisor `yarn start` in `/app/frontend` proxies to `vite` in `/app/apps/web` on port 3000
- Frontend-only architecture (FastAPI backend untouched, runs on 8001 but unused by game)

## Core Roster
- **Kai** — precision/control (cyan, 100 HP, balanced)
- **Jax** — speed/unpredictability (yellow)
- **KaiJax** — power/reach (fusion)

## What's Been Implemented (verified Jan 2026)

### P1 — Real Combat Exchange (PROVEN)
`kai_light_jab` and 5 additional moves (heavy_punch, uppercut, sweep, grab, combo_chain) loaded from JSON, frame-data driven through MovePlayer. Input → startup → active hitbox spawn → AABB collision → damage → knockback → hitstop → recovery → cleanup. Shield + grab + shield-break logic implemented.

### P2 — World-Space Hitbox Attachment (PROVEN)
`MovePlayer.spawnHitbox` reads fighter root position + facing direction; hitbox `offX` mirrors with `direction = facingRight ? 1 : -1`. `offY` corrected for mesh-center-vs-feet (FOOT_OFFSET = 0.9).

### P3 — Enemy Entity Wrapper (PROVEN)
`EnemyEntity` + `BossEntity` use the SAME `MovePlayer` + `Hurtbox` runtime (no special enemy damage system). 4 AI behaviors: grunt, rusher, defender, sniper. Boss has 3 phases via `BossAI`. Death handling, knockback application via AI takeDamage.

### P4 — First Playable Mission Slice (PROVEN)
`MissionScene` orchestrates Ironvein Ward + Null Forge missions. Wave 1 (5 grunts) → Wave 2 (6 grunts + 2 scouts) → Boss (covenant_enforcer). Win = defeat boss. Lose = player HP ≤ 0. Available as standalone playable proof at `/mission-demo.html`.

### Polish (already in place, preserved)
VFXSystem (hit sparks, knockback dust, block ring, phase flash, attack trails), AudioSystem (whoosh/hit/grab/block/shield_break/boss_roar/phase_transition/ko), CameraShake, character-specific PlayerController, multi-mission selector, character selector (Kai/Jax via URL param).

### This Session's Hardening
- Wired `/app/frontend` supervisor to launch vite from `/app/apps/web` on port 3000 (HMR enabled, allowed-hosts open)
- Changed vite `base` from `/game/` → `/` so all routes resolve at preview URL root
- Wired live mission HUD: `Status / Wave / Kills / HP` now subscribe to `MissionScene.getStatus()` + `MissionOrchestrator.getStatus()` every 200ms
- Added `data-testid` markers (`hud-status`, `hud-wave`, `hud-kills`, `hud-hp-fill`)
- Added "Mission: First Blood" + "Combat Kernel" navigation buttons on the LoreHub landing page

## How to Test
1. Land on `/` — Lore Hub. Click **Mission: First Blood** (red) or **Combat Kernel** (cyan) button.
2. `/mission-demo.html` — Press SPACE to start; WASD to move; J/K/L/I/U/O for moves; SHIFT to shield; ESC to exit.
3. `/combat-demo.html` — Press J for `kai_light_jab` against a stationary 100 HP dummy.
4. Switch character: `?character=kai` or `?character=jax`. Switch mission: `?mission=ironvein_ward_01` or `?mission=null_forge_02`.

## Hard Blocker (per problem statement)
Production `kai_jax.glb` with the canonical hierarchy `root / spine / head / tail_01 → tail_09` is NOT yet finalized. All gameplay currently uses placeholder box meshes. Numerous test/variant GLBs exist in `apps/web/public/models/` but none are the verified production rig.

## Backlog (P0 → P2)
- **P0** Real `kai_jax.glb` rig validation against tail attachment + hurtbox proportions
- **P0** Replace box player/enemy meshes with rigged GLB characters wired to anchor sockets
- **P0** Animation state machine driven by MovePlayer phase (startup/active/recovery)
- **P1** Bone-socket hitbox attachment (currently root + facing only)
- **P1** Win/Lose end-screen overlays + Retry button (mission orchestrator state already exposes `complete` / `failed`)
- **P1** Boss phase HUD indicator + dedicated boss HP bar
- **P2** DI (directional influence) on knockback, advanced reactions, juggle states
- **P2** Versus/duel orchestration layer reusing the same combat runtime
- **P2** Tag/partner system

## Next Tasks
1. Drop in the production `kai_jax.glb` and validate node hierarchy
2. Wire animation clips per MoveSpec phase
3. Add end-state overlay UI to `/mission-demo.html`

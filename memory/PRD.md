# LEGENDS OF KAI-JAX
## Combat Runtime PRD

**Status:** Sprint 1 — COMPLETE (verified Feb 16, 2026)
**Version:** Combat Kernel v1.1
**Last Updated:** February 16, 2026

---

## Original Problem Statement
Build a scalable combat runtime for Legends of Kai-Jax with multiple orchestration modes (arena duels, adventure missions, bosses). Data-driven combat kernel, frame-based move interpreter, JSON MoveSpecs, AABB hurtbox/hitbox resolution, wave orchestration, boss AI, player WASD control.

---

## Architecture

```
/app/apps/web/
├── public/moves/*.json    # Data-driven MoveSpecs (6 moves)
├── src/combat/            # MovePlayer, Hurtbox (kernel)
├── src/mission/           # MissionTracker, WaveDirector, MissionOrchestrator, MissionSchema
├── src/ai/                # SimpleAI (grunt), BossAI (multi-phase)
├── src/player/            # PlayerController (WASD)
├── src/entities/          # FighterEntity, EnemyEntity, BossEntity
├── src/scenes/            # CombatDemoScene, MissionScene
├── combat-demo.html       # Isolated combat test harness
└── mission-demo.html      # Full vertical slice (waves + boss)
```

Secondary: `/app/frontend/` (React CRA) — Legend Arena Duel web hub (separate marketing/story site, runs on port 3000).

---

## Sprint 1 — Core Gameplay ✅ COMPLETE (Feb 16, 2026)
- ✅ Player WASD movement (`PlayerController.ts`) with arena boundaries, acceleration, friction
- ✅ Expanded move library: light jab, heavy punch, uppercut, sweep, grab, 3-hit combo chain
- ✅ Shield system: hold SHIFT to block, shield HP 100, regen after 2s delay, shield break → punish
- ✅ Grab system: grabs bypass shield (`isGrab` flag in HitSpec)
- ✅ Multi-hit combo chain: `kai_combo_chain.json` with 3 sequential hits (frames 3-5, 8-10, 13-15)
- ✅ BossAI with 3 phases (phase1/2/3 at 100%/66%/33% HP), increased aggression & speed, special attacks
- ✅ BossEntity wrapper with larger mesh/hurtbox, phase-based damage tint
- ✅ MissionScene routes `covenant_enforcer` spawns → BossEntity (separate from grunts)
- ✅ Fixed critical syntax bug in `MovePlayer.applyHit()` (methods were spliced mid-function)
- ✅ Damage/knockback now driven by MoveSpec hit data (not hardcoded)

### Controls (mission-demo)
| Key | Action |
|-----|--------|
| SPACE | Start mission |
| WASD | Move |
| J / K / L | Light jab / Heavy punch / Uppercut |
| I / U / O | Sweep / Grab / 3-hit combo |
| SHIFT | Hold to shield |
| ESC | Exit |

---

## Roadmap

### P0 — Sprint 2: Content Expansion (NEXT)
- 3 enemy behaviors: Rusher, Defender, Sniper (extend SimpleAI into specialized AI classes)
- 2nd mission schema (new district, unique composition + boss)
- 2nd playable character (Jax — different moveset, faster but lower damage)

### P1 — Sprint 3: Feel & Feedback
- VFX: hit sparks, attack trails, knockback dust
- Audio: attack whoosh, impacts, grunts, boss roars

### P2 — Sprint 4: Transformation & Camera
- Transformation system (Kai ↔ Jax ↔ KaiJax) mid-combat
- Camera: shake on hit, dynamic zoom on KO

### P3 — Sprint 5: Asset Integration (BLOCKED — awaiting external `kai_jax.glb`)
- GLB character integration
- MovePlayer synced to visual animation (not just frame counter)
- Tail empties validation (`tail_01` → `tail_09`)

### P4 — Sprint 6: Polish
- Health regen / power-ups
- Score / ranking system
- In-world 3D HUD

### P5 — Sprint 7: Multiplayer
- Local 2-player foundation

---

## Verification (Feb 16, 2026)
- Playwright harness: `mission-demo.html` loads cleanly, no page errors
- All 6 moves execute (light jab, heavy punch, uppercut, sweep, grab, combo chain)
- SimpleAI responds and counterattacks
- 3D scene renders player (cyan), 5 enemies (red), HUD visible
- Console logs show correct frame-accurate hitbox spawning
- Mission status: `{frameCount: 214, playerHP: 100, enemyCount: 5, missionStarted: true}`

### Known Non-Blockers
- `src/pages/SagaModeLauncher.tsx` has pre-existing TS syntax errors (unrelated to combat runtime, not imported by demos)
- `/app/frontend` CRA hub separately running; warnings but serves 200 OK

---

## Tech Stack
- **Game Runtime:** Vite 5 + TypeScript + Three.js 0.160
- **Web Hub:** React 19 + Tailwind + Lucide (at `/app/frontend`, CRA)
- **Backend:** FastAPI + MongoDB
- **Tools:** Playwright (local headless testing)

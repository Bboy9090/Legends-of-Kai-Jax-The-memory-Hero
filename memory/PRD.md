# LEGENDS OF KAI-JAX
## Combat Runtime PRD

**Status:** Sprint 2 — COMPLETE (verified Feb 16, 2026)
**Version:** Combat Kernel v1.2
**Last Updated:** February 16, 2026

---

## Original Problem Statement
Build a scalable combat runtime for Legends of Kai-Jax with multiple orchestration modes (arena duels, adventure missions, bosses). Data-driven combat kernel, frame-based move interpreter, JSON MoveSpecs, AABB hurtbox/hitbox resolution, wave orchestration, boss AI, player WASD control.

---

## Architecture

```
/app/apps/web/ (Vite + Three.js game runtime)
├── public/moves/*.json       # 10 MoveSpecs (6 Kai + 4 Jax)
├── src/combat/               # MovePlayer, Hurtbox
├── src/mission/              # Tracker, WaveDirector, Orchestrator, Schema (2 missions)
├── src/ai/                   # SimpleAI (grunt/rusher/defender/sniper), BossAI (3-phase)
├── src/player/               # PlayerController (WASD + character-specific speed)
├── src/characters/           # CharacterSpec (Kai + Jax playable)
├── src/entities/             # FighterEntity, EnemyEntity, BossEntity
├── src/scenes/               # CombatDemoScene, MissionScene (URL-param selectable)
└── {combat,mission}-demo.html

/app/frontend/ (CRA web hub)
└── public/game/              # Vite production build (mirrored here post-build)
    └── ... (mission-demo.html, moves/*.json, assets/*)
```

**Stitch:** The Vite build is copied to `/app/frontend/public/game/`, so the CRA preview URL serves the demos at `/game/mission-demo.html`. Hero section has a "COMBAT DEMO" button (`data-testid="cta-play-combat-demo"`) that deep-links to it.

---

## Sprint 1 — Core Gameplay ✅ (Feb 16, 2026)
- Player WASD (`PlayerController.ts`) with arena bounds + friction
- 6 Kai moves: light jab / heavy punch / uppercut / sweep / grab / 3-hit combo chain
- Shield system (hold SHIFT), shield HP 100 + regen, shield-break punish
- Grab system bypasses shield (`isGrab` flag)
- BossAI with 3 phases (100/66/33% HP thresholds), scaled cooldowns, special attack chance
- BossEntity wrapper (larger mesh, phase-based color tint)
- Fixed critical `MovePlayer.applyHit()` syntax bug (methods spliced mid-function)
- Damage/knockback driven by MoveSpec data (not hardcoded)

---

## Sprint 2 — Content Expansion ✅ (Feb 16, 2026)
- **3 enemy behaviors** in `SimpleAI` via behavior table: `grunt` / `rusher` / `defender` / `sniper`
  - Rusher: 3.6 speed, 0.4s cooldown, no retreat
  - Defender: 1.4 speed, random block (45% on hit), 0.8s guard
  - Sniper: 4.5 attack range, keeps distance (preferred 4.5), retreats 55% on hit
- **2nd mission:** `NULL_FORGE_02` — Null Forge: Specialist Assault (rusher + defender + sniper waves, `fang_warlord` boss)
- **2nd playable character:** Jax (HP 85, move speed 5.2) with 4 unique moves: `jax_quick_jab`, `jax_dash_strike`, `jax_spin_kick`, `jax_flash_grab`
- **Character + Mission selection** via URL params (`?character=jax&mission=null_forge_02`)
- **In-HUD selectors** (mission-demo sidebar: KAI/JAX toggles + 2 mission links)
- **Stitch complete:** CRA hub `/game/mission-demo.html` route works; hero section has "COMBAT DEMO" CTA

### Controls (mission-demo)
| Key | Kai | Jax |
|-----|-----|-----|
| J | Light Jab (4) | Quick Jab (3, faster) |
| K | Heavy Punch (12) | Dash Strike (8) |
| L | Uppercut (10, launches) | Uppercut (10, shared) |
| I | Sweep (6, low) | Spin Kick (2×4, both sides) |
| U | Grab (8) | Flash Grab (6) |
| O | 3-hit Combo Chain | 3-hit Combo (shared) |
| WASD | Move | Move (faster) |
| SHIFT | Hold to shield |
| SPACE | Start mission |
| ESC | Exit |

---

## Verification (Feb 16, 2026)
Local Playwright against `http://localhost:3000` (CRA hub with stitched game):
- ✅ CRA hub loads; `cta-play-combat-demo` button present
- ✅ Kai + Mission 1: playerHP 100, 5 enemies, grunt behavior
- ✅ Jax + Mission 1: playerHP 85, `jax_quick_jab` fires frame 2 startup as specced
- ✅ Kai + Mission 2: `[SimpleAI:rusher]` enemies confirmed, 5 enemies spawned
- ✅ All move JSONs load from `/game/moves/*` (BASE_URL rewrite working)
- ✅ Zero page errors across 4 test runs

---

## Roadmap

### P0 — Sprint 3: Feel & Feedback (NEXT)
- VFX: hit sparks, attack trails, knockback dust particles
- Audio: attack whoosh, impacts, grunts, boss roars, UI sfx

### P1 — Sprint 4: Transformation & Camera
- Transformation system (Kai ↔ Jax ↔ KaiJax) mid-combat
- Camera shake on hit, dynamic zoom on KO, cinematic boss entrance

### P2 — Sprint 5: Asset Integration (BLOCKED — awaiting `kai_jax.glb`)
- GLB character integration, animation-synced MovePlayer, tail empties validation

### P3 — Sprint 6: Polish
- Health regen / power-up pickups
- Score + ranking system
- In-world 3D HUD (not DOM overlay)

### P4 — Sprint 7: Multiplayer
- Local 2-player foundation

---

## Tech Stack
- **Game Runtime:** Vite 5 + TypeScript + Three.js 0.160
- **Web Hub:** React 19 + Tailwind + Lucide (CRA)
- **Backend:** FastAPI + MongoDB
- **Build:** `yarn build` in `/app/apps/web` → copy `dist/` + `public/moves/` to `/app/frontend/public/game/`

### Known Non-Blockers
- Pre-existing syntax errors in `src/pages/SagaModeLauncher.tsx` (not imported by demos, not in build input)
- Vite build outputs 500+KB chunks — can be split later with `manualChunks`

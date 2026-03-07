# Legends of Kai-Jax: The Memory King

**A 3D fighting game set in the Raging City — where nine tails, memory, and myth collide.**

[![CI](https://github.com/Bboy9090/Legends-of-Kai-Jax-The-memory-Hero/actions/workflows/ci.yml/badge.svg)](https://github.com/Bboy9090/Legends-of-Kai-Jax-The-memory-Hero/actions/workflows/ci.yml)

---

## Quick Start

```bash
npm install
npm run build          # Build the web game
npm start              # Serve the built app
```

**Development (hot reload):**
```bash
cd apps/web && npm run dev
```

---

## Game Modes

| Mode | Description |
|------|-------------|
| **Adventure** | Wave-based arena combat — Free Arena, Gauntlets, Survival Trials |
| **Campaign** | Story mode with missions across the Raging City districts |
| **Versus** | 1v1 battles against AI with full combat kernel |
| **Training** | Frame data lab, 50% speed, move reference |
| **Challenge** | UEE trials and objective-based missions |

### Combat Features

- **Overdrive Meter** — Fills on dealing/receiving damage, drains when camping. Gates ultimate moves.
- **Clash Priority** — Ultimate > Special > Kick > Punch. Cinematic rebound on equal clashes.
- **Combo Cancel** — Light1→Light2→Light3 punch chain during cancel windows.
- **Phased Hitboxes** — Startup / active / recovery; damage only in active phase.
- **Legendary Finish** — Ultimate KO triggers gold slow-mo, screen flash, "LEGENDARY" overlay.
- **Assist System** — One summon per round (Q key).
- **Adaptive Music** — Intensity scales with combos and health.
- **Synergy & Fusion** — Jaxon/Kaison can transform into Kai-Jax.
- **Animation Controller** — Sovereignty clip-based system, additive upper-body layering (e.g. web_launch during run).

---

## Project Structure

```
├── apps/web/          # Main game (React + Three.js + Vite)
├── backend/           # Python FastAPI API
├── frontend/          # Marketing site
├── packages/          # Shared libraries
├── memory/            # PRD, design docs
├── specs/             # Technical specifications
└── render.yaml        # Render.com deploy config
```

---

## Deployment

- **Web Game (Static)** — Render.com ([legends-of-kai-jax-game](https://dashboard.render.com)) — Vite build from `apps/web`
- **Backend API** — Render.com ([legends-of-kai-jax-api](https://dashboard.render.com)) — `uvicorn server:app`

Configured in [render.yaml](./render.yaml).

---

## Canonical References

| File | Purpose |
|------|---------|
| [kai_jax.character.json](./kai_jax.character.json) | Character specs, stats, rendering layers |
| [design_guidelines.json](./design_guidelines.json) | Visual identity, typography, colors |
| [memory/PRD.md](./memory/PRD.md) | Master product requirements |
| [specs/primary/](./specs/primary/) | Technical specifications |
| [memory/NEXT_WAVE_UPGRADES.md](./memory/NEXT_WAVE_UPGRADES.md) | Combat, animation, rigging roadmap |
| [apps/web/docs/ANIMATION_CLIP_SPEC.md](./apps/web/docs/ANIMATION_CLIP_SPEC.md) | Fighting animation clip IDs for riggers |

---

## Validation & Lint

```bash
npm run validate     # Character schemas
npm run lint         # ESLint (apps/web)
npm run build        # Vite build (apps/web)
```

---

## Core Principles

> **"Silhouette first. If the silhouette reads, you win."**

- **Unified Core** — One source of truth, no logic divergence
- **PC-First** — Design for desktop, scale to mobile
- **Deterministic** — Same input → same output
- **Skill First** — No pay-to-win; progression is cosmetic and mastery-based

---

*Forged in the Raging City. Crowned by Memory.*

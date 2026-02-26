# Legends of Kai-Jax: The Memory King

**A 3D fighting game set in the Raging City — where nine tails, memory, and myth collide.**

[![Deploy](https://github.com/Bboy9090/Legends-of-Kai-Jax-The-memory-Hero/actions/workflows/deploy.yml/badge.svg)](https://github.com/Bboy9090/Legends-of-Kai-Jax-The-memory-Hero/actions/workflows/deploy.yml)

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
- **Assist System** — One summon per round (Q key).
- **Adaptive Music** — Intensity scales with combos and health.
- **Synergy & Fusion** — Jaxon/Kaison can transform into Kai-Jax.

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

- **Web Game** — Deploys to GitHub Pages on push to `main` ([deploy workflow](.github/workflows/deploy.yml))
- **Backend API** — Render.com (`uvicorn server:app`)
- **Static Site** — Render.com (Vite build from `apps/web`)

---

## Canonical References

| File | Purpose |
|------|---------|
| [kai_jax.character.json](./kai_jax.character.json) | Character specs, stats, rendering layers |
| [design_guidelines.json](./design_guidelines.json) | Visual identity, typography, colors |
| [memory/PRD.md](./memory/PRD.md) | Master product requirements |
| [specs/primary/](./specs/primary/) | Technical specifications |

---

## Validation

```bash
python validate_all.py
cd apps/web && npm run build
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

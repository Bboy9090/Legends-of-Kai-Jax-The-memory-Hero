# Legends of Kai-Jax: The Memory King

## Overview

This is a mythic action game called "Legends of Kai-Jax: The Memory King" featuring a hybrid sabertooth character with a 9-tail progression system. The project has two main parts:

1. **Game Hub Frontend** (`frontend/`) — A React-based informational hub with 8 sections (Home, Characters, Tails, Story, Gods, Regions, Bible, UI) that presents lore, character data, and game information.
2. **3D Game Client** (`apps/web/`) — A Three.js + React Three Fiber fighting game with battles, campaign mode, character selection, missions, a layered beast character rendering system, an open-world Adventure Mode with omnidirectional 3D locomotion and wave-based combat, and ancient stone statue fighters (marble, granite, sandstone) with synthesized stone-grinding sound effects.
3. **Backend API** (`backend/`) — A FastAPI server providing game data endpoints (tails, characters, story, gods, regions, bible) and story mode progression enforcement, backed by MongoDB.

The project enforces a "canonical spec" approach where `kai_jax.character.json` is the single source of truth for all character data, and all implementations must validate against it. The canon status is "PRODUCTION CANON LOCKED" at version 1.0.0.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend (FastAPI + MongoDB)

- **Framework**: FastAPI with Pydantic models, running from `backend/server.py`
- **Database**: MongoDB via Motor (async driver). Connection configured through `MONGO_URL` and `DB_NAME` environment variables loaded from `backend/.env`
- **API Pattern**: All endpoints live under `/api` prefix via an APIRouter
- **Key Endpoints**:
  - `/api/` — Root status
  - `/api/tails` — 9-tail system data
  - `/api/characters` — 5 core characters
  - `/api/story` — 5 story acts
  - `/api/gods` — 4 Sabertooth Gods
  - `/api/regions` — 5 world regions
  - `/api/bible` — Complete game bible
  - `/api/story-progress/{player_id}/*` — Story mode progression enforcement (StoryModeManager)
- **StoryModeManager**: Enforces sequential tail progression tied to story acts (Act 1→3 tails, Act 2→5, Act 3→6, Act 4→8, Act 5→9). Prevents skipping acts, going backwards, or exceeding tail limits.

### Game Hub Frontend (`frontend/`)

- **Framework**: React 19 with Create React App (via CRACO for config overrides)
- **Styling**: Tailwind CSS with custom theme matching `design_guidelines.json` (dark mythic theme, neon accents)
- **UI Components**: shadcn/ui (Radix primitives + Tailwind), configured in `components.json`
- **Fonts**: Unbounded (headings), Rajdhani (body), Cinzel (lore/accents)
- **State**: Simple `useState` for section navigation, axios for API calls
- **Path aliases**: `@/` maps to `src/` via CRACO webpack alias and jsconfig
- **Custom plugins**: Visual edits system (dev-only babel metadata plugin) and optional health check webpack plugin

### 3D Game Client (`apps/web/`)

- **Framework**: React 18 + TypeScript + Vite
- **3D Engine**: Three.js via React Three Fiber (`@react-three/fiber`) + Drei helpers (`@react-three/drei`)
- **State Management**: Zustand stores (`useGame`, `useRunner`, `useBattle`, `useAudio`, `useMissions`, `useBeastPreset`)
- **Character Rendering**: Layered anatomical beast model system following renderer spec — silhouette first, then fur shell, emissive veins, elemental tails, aura, particles. LOD system strips layers by camera distance.
- **Game Modes**: Campaign (node-based map), Quick Battle, Story Missions (3 acts), UEE Trials
- **Fighters**: 3 playable characters (Kai-Jax, Jaxon, Kaison) with locked design specs
- **Arenas**: Multiple battle arenas with distinct visual themes
- **Design Data**: `data/characterDesigns.ts` and `data/beastRoster.ts` mirror the canonical JSON specs

### Canonical Data & Validation

- `kai_jax.character.json` — Master character specification (colors, stats, rendering layers, features)
- `design_guidelines.json` — Visual identity (colors, typography, theme)
- `schemas/character.schema.json` — JSON Schema for character validation
- `schemas/story_mode.schema.json` — JSON Schema for story mode configuration
- Validation scripts: `validate_all.py`, `validate_characters.py`, `test_schema_validation.py`
- All character properties must be added to the JSON spec first, then consumed everywhere

### Key Design Decisions

1. **PC-First**: Desktop experience is primary; mobile/tablet scale down via responsive design and LOD
2. **Unified Core**: Same game logic across all platforms; platform-specific code only for input, rendering quality, and performance
3. **Deterministic Behavior**: Combat calculations and game rules must be platform-agnostic
4. **Spec-Driven**: No hard-coded character values that diverge from canonical JSON specs
5. **Layered Rendering**: Characters are "walking VFX stacks" — base mesh, fur shell, emissive veins, elemental tails, aura, particles — each layer can be toggled for performance

## External Dependencies

### Database
- **MongoDB** — Primary data store, accessed via Motor async driver. Required env vars: `MONGO_URL`, `DB_NAME`

### Frontend Libraries
- **React Three Fiber / Three.js / Drei** — 3D rendering engine for the game client
- **Zustand** — Lightweight state management for game state
- **Radix UI** — Accessible UI primitives (dialog, tabs, accordion, etc.) used via shadcn/ui
- **Tailwind CSS** — Utility-first styling with custom game theme
- **Axios** — HTTP client for API communication
- **Lucide React** — Icon library

### Backend Libraries
- **FastAPI** — Python web framework
- **Motor** — Async MongoDB driver
- **Pydantic** — Data validation and serialization
- **Google GenAI / OpenAI** — AI integrations present in requirements (likely for character image generation)
- **Boto3** — AWS SDK (present in requirements)

### Validation
- **jsonschema** — Python library for validating JSON data against schemas

### Build Tools
- **Vite** — Build tool for `apps/web/` (3D game client)
- **CRACO** — Create React App configuration override for `frontend/` (game hub)
- **Turborepo** — Monorepo tooling (config present in `.config/turborepo/`)
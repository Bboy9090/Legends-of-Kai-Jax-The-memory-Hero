# Legacy Files Mapping

This document maps the original Replit prototype files to their new locations in the monorepo structure.

## Preserved Replit Artifacts

Original Replit-specific files have been moved to `legacy_replit/` to preserve the development history:

| Original Location | New Location | Description |
|------------------|--------------|-------------|
| `.replit` | `legacy_replit/.replit` | Replit configuration file |
| `replit.md` | `legacy_replit/replit.md` | Replit documentation |

## Code Migration Mapping

### Client Application
The original client application has been migrated to the monorepo apps structure:

| Original Location | New Location | Notes |
|------------------|--------------|-------|
| `client/` | `apps/web/` | Vite + React + R3F web application |
| `client/src/` | `apps/web/src/` | Source code migrated with updated imports |
| `client/index.html` | `apps/web/index.html` | Entry HTML file |
| `client/public/` | `apps/web/public/` | Static assets |

### Shared Code
Original shared utilities have been migrated to typed packages:

| Original Location | New Location | Notes |
|------------------|--------------|-------|
| `shared/` | `packages/shared/` | Shared types and utilities |
| `server/` | `packages/server/` | Server-side code |

### Game Engine
Core game engine code has been organized into packages:

| Original Location | New Location | Notes |
|------------------|--------------|-------|
| `client/Physics.ts` | `packages/engine/src/physics/MomentumPhysics.ts` | Physics system |
| Client game logic | `packages/engine/src/` | Extracted and modularized |

### Documentation
All documentation has been preserved in place:

| Location | Status | Notes |
|----------|--------|-------|
| `docs/` | **Preserved as-is** | No changes to original design docs |
| `docs/ARCHITECTURE.md` | **Preserved** | Architecture documentation |
| `docs/CHARACTER_GUIDE.md` | **Preserved** | Character creation guide |
| `docs/COMBAT_SYSTEM.md` | **Preserved** | Combat system documentation |
| `docs/grand-saga-game-bible.md` | **Preserved** | Complete game design bible |

## Assets
Asset directories have been structured for the pipeline:

| Original Location | New Location | Notes |
|------------------|--------------|-------|
| `assets/` | `assets/` | Root assets directory maintained |
| N/A | `assets/sprites/` | Sprite assets directory |
| N/A | `assets/audio/` | Audio assets directory |
| N/A | `assets/models/` | 3D model assets directory |

## New Additions
These are new files/directories created as part of the monorepo migration:

- `apps/web/` - Web application (Vite + React + R3F)
- `apps/mobile/` - Mobile application (Capacitor wrapper)
- `packages/ui/` - Shared UI components
- `packages/engine/` - Core game engine
- `packages/characters/` - Character implementations
- `packages/shared/` - Shared types and utilities
- `packages/server/` - Server-side packages

## Notes

- **No destructive deletions**: Original files remain in `client/`, `server/`, `shared/` directories
- **Adapters preserved**: Legacy code can still import from new modules during transition
- **Docs unchanged**: All design documents in `docs/` are preserved exactly as created
- **Safe review**: All changes are additive, making PR review safe and reversible

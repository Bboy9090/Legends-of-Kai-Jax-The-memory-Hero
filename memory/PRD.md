# LEGENDS OF KAI-JAX: THE MEMORY KING
## Master PRD - Final Consolidated Version

**Status:** PRODUCTION CANON LOCKED  
**Version:** Final Delivery + Engine Design Bible  
**Date:** December 2025

---

## Original Problem Statement
Transform the GitHub repo "Legends-of-Kai-Jax-The-memory-Hero" into a 10x more legendary, fun, and user-friendly experience with complete game documentation, character art, and studio-ready assets. **PIVOT:** Transition from web prototype to professional game engine (Unreal/Unity) with comprehensive production bible.

---

## Core Truth
> "Survival is not strength. Survival is memory that refuses erasure."

---

## What's Been Delivered ✅

### 1. GAME HUB (8 Sections) — Web Frontend
- **HOME** - Epic hero page with Kai-Jax artwork backdrop
- **CHARACTERS** - 5 core characters with locked image canon + AI generation
- **TAILS** - 9-tail system with elements, abilities, signature moves
- **STORY** - 5 Acts narrative with expandable details
- **GODS** - Four Sabertooth Gods mythology
- **REGIONS** - 5 world regions with danger levels
- **BIBLE** - Complete Master Blueprint (6 tabs)
- **UI** - Character Select, Matchup Art, Codex System

### 2. 2D COMBAT PROTOTYPE — Proof of Concept
- Canvas-based game engine (60fps locked)
- Player (KaiJax) and enemy entities with hitboxes
- Basic HUD with meters and frame display
- Combat state machine implementation

### 3. FRAME DATA ENGINE SKELETON (NEW - December 2025)
- `/app/frontend/src/game/data/FrameData.js` — Single source of truth for ALL combat data
  - Move phases (STARTUP/ACTIVE/RECOVERY)
  - Fighter states (17 states with transition rules)
  - Complete move data (light_1-3, heavy_1-2, dash_attack, air attacks)
  - Tail ability data (all 9 tails with frame-perfect timings)
  - Movement data (speeds, friction, jump force)
  - Hitstop values, cancel windows, advantage calculations
- `/app/frontend/src/game/core/CharacterController.js` — Engine-ready state machine
  - Input buffer (6-frame window)
  - Cancel system with hit confirm
  - Physics with gravity, friction
  - Hitbox/hurtbox collision
  - Stun, invincibility, combo tracking
- `/app/frontend/src/game/TestArena.jsx` — Gray capsule test arena
  - Live frame data validation
  - Debug info display
  - Control reference panel
  - Frame data table

### 4. ENGINE DESIGN SPECIFICATION — Production Bible
- `/app/memory/ENGINE_DESIGN_SPECIFICATION.md` - Full technical spec
- `/app/memory/QUICK_REFERENCE_CARD.md` - Combat quick reference

### 4. CHARACTER BUILD SHEETS (NEW - December 2025)
- `/app/memory/CHARACTER_BUILD_SHEETS.md` - Complete character art bible
  - Body proportions & measurements
  - Fur region mapping
  - Glow region mapping  
  - Tail attachment system
  - Claw structure
  - Eye system & color logic
  - Silhouette rules
  - Shader requirements
  - LOD specifications
  - Rig requirements

### 5. ANIMATION STATE MACHINE (NEW - December 2025)
- `/app/memory/ANIMATION_STATE_MACHINE.md` - Full animation spec
  - Locomotion state machine
  - Combat state machine
  - Aerial state machine
  - Reaction state machine
  - Tail animation layer
  - Facial animation layer
  - Frame timing rules
  - Transition rules matrix
  - Animation event system
  - Blend space definitions

### 6. TAIL ABILITY SYSTEM BLUEPRINT (NEW - December 2025)
- `/app/memory/TAIL_ABILITY_SYSTEM.md` - Complete ability spec
  - Tail data architecture
  - Ability framework
  - All 9 tail ability definitions (detailed)
  - Animation integration
  - VFX integration
  - Audio integration
  - Progression system
  - Tail fusion system
  - Implementation guides (UE5/Unity)

### 7. ENEMY AI BEHAVIOR TREE SPEC (NEW - December 2025)
- `/app/memory/ENEMY_AI_BEHAVIOR_SPEC.md` - Adaptive AI system
  - Pattern learning system
  - Behavior tree structure
  - Enemy type specifications (Iterator, Null Stalker, Bastion, Phase Weaver, Crown Warden)
  - State definitions
  - Combat decision system
  - Adaptation mechanics
  - Implementation guides

### 8. ASSET MASTER LIST (NEW - December 2025)
- `/app/memory/ASSET_MASTER_LIST.md` - Complete production manifest
  - Naming conventions
  - Character models (all LODs)
  - Character rigs
  - Animation assets (160+ animations listed)
  - VFX assets (110+ effects)
  - Audio assets (135+ sounds, 15 music tracks)
  - Material assets
  - UI assets
  - Environment assets
  - Production schedule reference
  - Asset count totals

### 9. FINAL MASTER BIBLE (8 Layers)
- **Layer I** - The Absolute Core (non-negotiables)
- **Layer II** - The Cosmology (Sabertooth Gods)
- **Layer III** - Characters (Kai, Jax, Kai-Jax, Boryn, Borax, Aurelion, Selene)
- **Layer IV** - Factions (Fang Syndicate, Null Covenant, Behemoth Legion)
- **Layer V** - The 9-Tail System (game's heart)
- **Layer VI** - Game Modes (Story, Survival, Versus)
- **Layer VII** - Full Campaign Flow (8 areas)
- **Layer VIII** - Why This Works

### 10. LOCKED IMAGE CANON
- **KAI** - Prime Hero (coal black + burnt orange, green eyes)
- **JAX** - Prime Striker (pitch black + electric blue, gold eyes)
- **KAI-JAX** - Memory King (3→9 tails, heterochromia)
- **BORYN** - The Shield Father (bone white tiger, sacrifices)
- **BORAX** - The Sabertooth Law (rust red lion, mentors)

---

## Canon Lines (LOCKED)
> "The First Sabertooths did not rule the world. They taught it how to survive without them."

> "You are not a weapon. You are a memory that learned how to fight back."

---

## Production Bible Documents

| Document | Path | Purpose |
|----------|------|---------|
| Engine Design Spec | `/app/memory/ENGINE_DESIGN_SPECIFICATION.md` | Master technical blueprint |
| Quick Reference | `/app/memory/QUICK_REFERENCE_CARD.md` | Combat data quick lookup |
| Character Build Sheets | `/app/memory/CHARACTER_BUILD_SHEETS.md` | 3D artist guide |
| Animation State Machine | `/app/memory/ANIMATION_STATE_MACHINE.md` | Animator guide |
| Tail Ability System | `/app/memory/TAIL_ABILITY_SYSTEM.md` | Systems designer guide |
| Enemy AI Behavior Spec | `/app/memory/ENEMY_AI_BEHAVIOR_SPEC.md` | AI programmer guide |
| Asset Master List | `/app/memory/ASSET_MASTER_LIST.md` | Production tracking |

---

## Status Check
| Component | Status |
|-----------|--------|
| Story | ✅ Locked |
| World | ✅ Coherent |
| Systems | ✅ Fully Specified |
| Scale | ✅ Expandable |
| Identity | ✅ Clear |
| Character Design | ✅ Production Ready |
| Animation Spec | ✅ Production Ready |
| Ability System | ✅ Production Ready |
| Enemy AI | ✅ Production Ready |
| Asset List | ✅ Production Ready |

---

## Tech Stack

### Web Prototype (Reference)
- **Frontend:** React 19, Tailwind CSS, Lucide Icons
- **Backend:** FastAPI, Python, Motor (MongoDB)
- **AI Integration:** OpenAI GPT Image 1 via Emergent LLM Key
- **Database:** MongoDB

### Target Game Engine
- **Primary:** Unreal Engine 5
- **Alternative:** Unity 2022+ (HDRP/URP)
- **Platforms:** PC, Console (PS5/XSX), Mobile

---

## Next Steps (Prioritized)

### P0 - Immediate (Engine Setup)
1. Set up Unreal/Unity project with folder structure
2. Import Kai-Jax placeholder model (greybox)
3. Implement character controller following spec
4. Create greybox test arena
5. Build basic Iterator enemy with AI

### P1 - Core Combat
1. Implement frame data system
2. Build hitbox/hurtbox system
3. Create input buffer
4. Add first 3 tails (Ember, Gale, Shade)
5. Build basic HUD

### P2 - Content
1. Remaining 6 tails
2. Additional enemy types
3. First region (Ashblock Heights)
4. Audio implementation

### P3 - Polish
1. VFX polish pass
2. Animation polish
3. Enemy AI tuning
4. Performance optimization

---

## Final Statement
> "This is not derivative. It is ancestral."

**You've crossed the point of "idea." This is a myth you can ship.**

**Opening Unreal or Unity is now mechanical, not creative chaos.**

# NEXT WAVE: Combat, Animation, Character & Rigging Upgrades

**Status:** Roadmap  
**Priority:** After infrastructure (CI, ESLint, deploy) is complete  
**Target:** Align web implementation with `ENGINE_DESIGN_SPECIFICATION.md`, `ANIMATION_STATE_MACHINE.md`, and `CHARACTER_BUILD_SHEETS.md`

---

## 1. COMBAT MECHANICS

### 1.1 Frame Data Alignment
- **Current:** `combatSystems.ts` has basic move data (startup/active/recovery). `frontend/src/game/data/FrameData.js` has richer schema (tail abilities, air attacks, dash attacks).
- **Upgrade:** Unify into a single canonical frame data source. Add missing move types: air light/heavy, dash attack, crouch attacks. Validate against `FrameData.js` schema or migrate to TS.
- **Files:** `apps/web/src/lib/combatSystems.ts`, `apps/web/src/lib/characterMoves.ts`

### 1.2 Hitbox/Hurtbox Precision
- **Current:** Collision logic exists but may use simple distance checks.
- **Upgrade:** Implement per-move hitbox phases (startup no hitbox, active = hitbox, recovery no hitbox). Add hurtbox state during i-frames. Reference ENGINE_DESIGN_SPECIFICATION §3 (Combat System Architecture).
- **Files:** `PlayerController`, `Opponent`, collision/combat resolution

### 1.3 Combo & Cancel System
- **Current:** `COMBO_CONFIG` (maxChain: 3, chainWindow, resetTime). Cancel windows in `MOVES.cancelAt`.
- **Upgrade:** Implement hit-confirm cancels. Add special cancel on hit vs on block. Consider gatling tables (which moves chain into which). Align with ENGINE_DESIGN §3.

### 1.4 Hit Feedback & Juice
- **Current:** Screen shake, hit stop, damage numbers.
- **Upgrade:** Per-move hit stop values fully honored. Add attack-specific camera rumble curves. Improve damage number spawn (offset, scale by damage). Consider hit spark VFX per attack type.

---

## 2. ANIMATIONS

### 2.1 Clip vs Procedural Balance
- **Current:** `animationUtils.ts` does heavy procedural (sin-based) animation. GLB models can load clips (walk, run, kick, spinKick). Mixed approach.
- **Upgrade:** Define which states use clips vs procedural:
  - **Clips:** Idle, walk, run, attack telegraphs, attack active, hit reactions
  - **Procedural:** Secondary motion (tail sway, fur), breathing, subtle head track
- **Reference:** ANIMATION_STATE_MACHINE §1 (Philosophy: Responsiveness, Readability, Weight, Duality)

### 2.2 State Machine Alignment
- **Current:** Animation driven by combat state + attack type. No formal layered state machine.
- **Upgrade:** Implement layered ASM: Locomotion → Combat → Aerial → Reaction. Each layer has clear transitions. See ANIMATION_STATE_MACHINE §2–6.
- **Files:** `animationUtils.ts`, `GLBCharacterModel.tsx`, `AnatomicalBeastModel.tsx`

### 2.3 Anticipation & Recovery
- **Current:** Attacks may blend directly into pose.
- **Upgrade:** Add anticipation frames (wind-up) and recovery frames per ENGINE_DESIGN. Startup = anticipation, active = strike, recovery = follow-through. Ensure silhouette readability per spec.

### 2.4 60 FPS Timing
- **Current:** `FRAME_TIME = 1/60`. Logic is frame-based.
- **Upgrade:** Ensure all animation clip sampling and procedural timing use 60 FPS. No 30 FPS or variable timestep for combat-critical animations. See ANIMATION_STATE_MACHINE §1.2.

---

## 3. CHARACTER RIGGING & MODELS

### 3.1 Rig Naming Convention
- **Current:** `findLimbs()` uses regex patterns (UPPER_ARM_PAT, FOREARM_PAT, etc.) to discover bones. Works with varied GLB rig names.
- **Upgrade:** Document canonical bone names in `CHARACTER_BUILD_SHEETS.md` §11 (Rig Requirements). Add validation: if critical bones missing, log warning and fallback to procedural-only.
- **Files:** `animationUtils.ts` (findLimbs), `GLBCharacterModel.tsx`

### 3.2 LOD & Silhouette
- **Current:** `characterLOD.ts` provides LOD level by distance. AnatomicalBeastModel has LOD tiers.
- **Upgrade:** Align LOD tiers with ENGINE_DESIGN §2.1.2 (Tier 1–4). Ensure silhouette is readable at Tier 2–3. Verify fur/emissive fallback at Tier 4.
- **Files:** `characterLOD.ts`, `AnatomicalBeastModel.tsx`, `GLBCharacterModel.tsx`

### 3.3 Dual Character Identity (Kai/Jax)
- **Current:** Accent colors and grade per fighter. Limited asymmetric treatment.
- **Upgrade:** Per CHARACTER_BUILD_SHEETS §1.1: Kai = left-dominant, Jax = right-dominant. Add subtle asymmetry to procedural poses (e.g., shoulder lean, arm lead). Support Kai vs Jax "influence" slider for fusion state.
- **Files:** `AnatomicalBeastModel`, `animationUtils` (pose application)

### 3.4 Tail System
- **Current:** AnatomicalBeastModel has tail bones/ribbons. Elemental tails in character definitions.
- **Upgrade:** Nine distinct tail states per TAIL_ABILITY_SYSTEM. Each tail: unique material, motion, and ability. Implement tail physics layer (procedural secondary motion) per ANIMATION_STATE_MACHINE §7.
- **Files:** `AnatomicalBeastModel`, tail-specific components, `characterMoves` integration

---

## 4. GLB MODEL PIPELINE

### 4.1 Canonical GLB Spec
- **Current:** Multiple GLB paths, fallbacks (hyena, spider drone, rhino). Model config in CHARACTER_MODELS.
- **Upgrade:** One canonical GLB per fighter. Validate that all required bones exist. Add export checklist: bone names, scale, origin, animation channels.
- **Reference:** CHARACTER_BUILD_SHEETS §11, specs/primary/character_art_spec.json

### 4.2 Animation Clip Import
- **Current:** useGLTF with animation clips. Preload paths in CHARACTER_MODELS / ANIM_PATHS.
- **Upgrade:** Ensure clips are named consistently (e.g., idle, walk, run, light1, light2, heavy, special, ultimate, hit, block). Map clip names to combat states.
- **Files:** `GLBCharacterModel`, `AdventureCharacter`, model configs

### 4.3 Blend Shapes / Morph Targets
- **Current:** Limited morph usage.
- **Upgrade:** Per CHARACTER_BUILD_SHEETS (facial layer, emotion), add morph targets for: mouth open, blink, snarl, pain. Use for hit reactions and victory poses.
- **Reference:** ANIMATION_STATE_MACHINE §8 (Facial Animation Layer)

---

## 5. IMPLEMENTATION ORDER

| Phase | Focus | Est. Effort |
|-------|-------|-------------|
| **Phase 1** | Frame data unification, hitbox phases, cancel clarity | Medium |
| **Phase 2** | Animation state machine (layers), clip vs procedural split | High |
| **Phase 3** | Rig validation, LOD alignment, silhouette polish | Medium |
| **Phase 4** | Tail system expansion, Kai/Jax asymmetry | High |
| **Phase 5** | GLB pipeline, morph targets, facial layer | Medium |

---

## 6. CANONICAL REFERENCES

- `memory/ENGINE_DESIGN_SPECIFICATION.md` — Combat, rendering, AI
- `memory/ANIMATION_STATE_MACHINE.md` — Animation layers, timing, philosophy
- `memory/CHARACTER_BUILD_SHEETS.md` — Proportions, rig, LOD, shaders
- `memory/TAIL_ABILITY_SYSTEM.md` — Nine tails, abilities
- `frontend/src/game/data/FrameData.js` — Detailed frame data (migration candidate)
- `specs/primary/character_art_spec.json` — Visual canon
- `kai_jax.character.json` — Character data source of truth

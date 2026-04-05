# LEGENDS OF KAI-JAX: CANONICAL LAW

**This document is AUTHORITATIVE. It supersedes Slack, design docs, or any other informal specification.**

All code, assets, and systems in this repository must validate against these rules. Violations trigger build failures.

---

## 1. UNIFIED GAMEPLAY CORE

### Non-Negotiable Rules:
- **Single gameplay core** across ALL platforms (PC, iOS, Android, Web)
- **PC is the source of truth** for mechanics, balance, and implementation
- **Mobile and tablet are scaled profiles**, not separate gameplay systems
- **NO platform-specific logic divergence** in combat, progression, or core mechanics

### What This Means:
- Combat timing, damage values, and progression systems are identical across platforms
- Platform adapters handle ONLY: rendering, input translation, and OS-specific hooks
- Performance optimizations (LOD, effects) may differ, but gameplay rules do NOT
- If a mechanic works differently on mobile, it's a bug, not a feature

---

## 2. KAI-JAX EVOLUTION: THE NINE-TAIL PROGRESSION

### Evolution Rules (IMMUTABLE):
- **Starting form:** 3 tails
- **Final form:** 9 tails
- **Unlock rule:** Sequential only (3→4→5→6→7→8→9)
- **No tail skipping:** Players cannot skip tail unlocks
- **Permanent progression:** Tails cannot be removed or reset after unlock
- **NOT cosmetic:** Each tail tier changes gameplay, world reactions, and enemy behavior

### Validation:
- The `kai_jax.character.json` file defines the canonical tail structure
- Schema validation enforces evolution constraints at build time
- Any implementation allowing tail skips, cosmetic-only tails, or non-sequential unlocks is INVALID

---

## 3. ARCHITECTURAL ENFORCEMENT

### Lockfiles (Read-Only Truth):
1. **`kai_jax.character.json`** - Character anatomy, materials, rigging, tail roles
2. **`schemas/character.schema.json`** - Validation rules for character data
3. **`data/world/tail_tier_reactions.json`** - World system responses to tail progression

### Code Must:
- Read from these files, not duplicate data in code
- Validate against schemas before runtime
- Fail builds on schema violations
- Treat lockfile changes as breaking changes requiring review

### Code Must NOT:
- Override lockfile values at runtime
- Create platform-specific branches for core mechanics
- Implement "temporary" workarounds that bypass schemas
- Make assumptions when specifications are unclear (STOP and ASK instead)

---

## 4. TAIL PROGRESSION AS SYSTEMIC POWER

Each tail tier (3→9) produces measurable changes in:

1. **Enemy AI behavior** - Fodder confidence, elite tactics, boss phase triggers
2. **Music intensity** - Dynamic soundtrack scaling with player power
3. **NPC reactions** - Dialogue, fear responses, quest availability
4. **World state** - Environmental changes, unlock gates, narrative beats

**This is NOT flavor text.** These systems must be implemented and respond to `current_tail_count`.

---

## 5. CROSS-PLATFORM RENDERING

### Allowed Differences:
- LOD (Level of Detail) targets per platform
- Shader complexity (PBR full vs simplified)
- Particle counts and effects density
- Texture resolution and compression

### Forbidden Differences:
- Silhouette changes
- Tail count reductions
- Animation timing alterations
- Posture system simplifications
- Hit-stop removal

**Mobile gets optimized rendering, NOT simplified gameplay.**

---

## 6. ENFORCEMENT MECHANISMS

### Build-Time Validation:
- JSON schema validation for all character and world data files
- TypeScript/C++ type checking against schemas
- Asset validation (tail count, skeleton structure) before packaging

### Runtime Assertions:
- Debug builds assert tail count matches unlock progression
- Enemy AI checks validate against `tail_tier_reactions.json`
- Music system verifies tier mappings on initialization

### Code Review Gates:
- PRs affecting core mechanics require explicit canon review
- Changes to lockfiles require maintainer approval
- Platform-specific code must justify why divergence is necessary

---

## 7. COPILOT / AI AGENT INSTRUCTIONS

**If you are an AI assistant working on this codebase:**

1. **READ THIS FILE FIRST** before making any code changes
2. **Validate against `kai_jax.character.json`** when implementing character systems
3. **Check `schemas/character.schema.json`** before creating character data
4. **Apply `tail_tier_reactions.json`** when implementing world/enemy systems
5. **STOP AND ASK** if requirements conflict or are unclear - DO NOT guess

You operate under law, not interpretation. These rules are non-negotiable.

---

## 8. AMENDMENT PROCESS

**This document can only be changed through:**
1. Explicit approval from repository maintainers
2. Issue discussion with "canon-change" label
3. Pull request with full justification and impact analysis

**Casual edits are forbidden.** This is franchise governance, not design exploration.

---

## 9. FINAL AUTHORITY

In case of conflict between:
- This file vs. Slack: **This file wins**
- This file vs. design docs: **This file wins**
- This file vs. code comments: **This file wins**
- This file vs. "but it works better": **This file wins**

Kai-Jax is the Memory Hero. The franchise remembers. The code must too.

---

**Version:** 1.0.0  
**Last Updated:** 2026-01-27  
**Status:** AUTHORITATIVE

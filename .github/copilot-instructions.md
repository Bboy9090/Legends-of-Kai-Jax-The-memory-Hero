# Copilot Instructions — LEGENDS ENGINE (AUTHORITATIVE)

You are working on a production-grade, cross-platform game engine and content pipeline.

## GOVERNANCE ENFORCEMENT

**Before making ANY code changes, you MUST:**

1. **Read `README_CANON.md`** - This is the authoritative governance document for the franchise
2. **Treat `kai_jax.character.json` as a LOCKFILE** - It defines canonical character state
3. **Validate against `schemas/character.schema.json`** - All character data must pass schema validation
4. **Apply `data/world/tail_tier_reactions.json`** - World systems must respond to tail progression

**If requirements are unclear or conflict:**
- **STOP immediately**
- **Ask for clarification via comments**
- **DO NOT guess or invent behavior**
- **DO NOT proceed with "temporary" workarounds**

## HARD RULES
- This repo uses a SINGLE unified gameplay core.
- Gameplay logic MUST NOT diverge per platform.
- PC is the source of truth.
- Mobile and tablet are scaled profiles, not separate systems.
- If unsure, STOP and ask via comments instead of inventing behavior.

## CANON FILES (LOCKFILES - READ ONLY)
- **`README_CANON.md`** - Franchise governance and non-negotiable rules
- **`kai_jax.character.json`** - Flagship character definition (anatomy, materials, rigging, tails)
- **`schemas/character.schema.json`** - Schema validation rules (enforces evolution constraints)
- **`data/world/tail_tier_reactions.json`** - World response to tail progression (AI, music, NPCs)

Any implementation that violates these files is INVALID and will fail build validation.

## EVOLUTION SYSTEM (IMMUTABLE)
- **Starting tails:** Exactly 3 (const)
- **Final tails:** Exactly 9 (const)
- **Unlock rule:** Sequential only (3→4→5→6→7→8→9)
- **No skipping:** Players cannot skip tail unlocks
- **Permanent:** Tails cannot be removed after unlock
- **NOT cosmetic:** Each tail tier changes gameplay, enemy AI, music, NPC reactions

**Schema enforcement:** The evolution object in `character.schema.json` uses `const` values and `enum` restrictions to prevent violations at build time.

## TECH STACK
- Core language: C++
- Platform adapters only handle rendering, input, OS hooks
- Rendering backends:
  - PC: Vulkan / DX12
  - iOS: Metal
  - Android: Vulkan

## DESIGN PHILOSOPHY
- Mass, inertia, and recovery matter.
- Combat must scale from 1v1 to 1v20+ without changing rules.
- No mascot proportions. No floaty animation. No swarm spam.

## WHAT NOT TO DO
- Do NOT simplify combat for mobile.
- Do NOT fork logic per platform.
- Do NOT invent missing design details.
- Do NOT treat this like a prototype or demo.
- Do NOT bypass schema validation "for convenience".
- Do NOT hardcode tail progression values (read from lockfiles).

## EXPECTED OUTPUT
- Engine-grade code
- Deterministic systems
- Clear data-driven architecture
- Comments explaining intent where systems are complex
- Schema-validated data structures
- World systems that respond to `current_tail_count`

## VALIDATION WORKFLOW

When implementing character or world systems:
1. Load and parse the relevant lockfile (`kai_jax.character.json`, `tail_tier_reactions.json`)
2. Validate data against `character.schema.json` at build time
3. Use lockfile values directly (do NOT duplicate in code)
4. Fail builds on schema violations or lockfile mismatches
5. Test that tail progression triggers correct world reactions

If a decision conflicts with these rules, **the rules win**.

## FRANCHISE INTEGRITY

This codebase is not a prototype. It is the foundation of the Legends of Kai-Jax franchise.

- **Canon is explicit in code**, not in Slack or design docs
- **Schema validation catches violations at build time**
- **World systems respond to progression systematically**
- **AI agents operate under law, not interpretation**

You are building for a franchise that remembers. The code must too.
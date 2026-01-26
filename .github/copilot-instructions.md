# Copilot Instructions — LEGENDS ENGINE (AUTHORITATIVE)

You are working on a production-grade, cross-platform game engine and content pipeline.

## HARD RULES
- This repo uses a SINGLE unified gameplay core.
- Gameplay logic MUST NOT diverge per platform.
- PC is the source of truth.
- Mobile and tablet are scaled profiles, not separate systems.
- If unsure, STOP and ask via comments instead of inventing behavior.

## CANON
- Kai-Jax is the flagship character.
- The file `kai_jax.character.json` is a LOCKFILE.
- Any implementation that violates that JSON is INVALID.

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

## EXPECTED OUTPUT
- Engine-grade code
- Deterministic systems
- Clear data-driven architecture
- Comments explaining intent where systems are complex

If a decision conflicts with these rules, the rules win.
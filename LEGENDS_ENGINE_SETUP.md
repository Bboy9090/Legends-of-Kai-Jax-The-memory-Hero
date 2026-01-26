# Legends Engine - Setup Complete ✅

## What Was Created

This repository now has **three foundational authority files** that establish disciplined development practices:

### 1. `.github/copilot-instructions.md`
**Purpose**: Repo-wide authority document for GitHub Copilot behavior

**Key Rules**:
- Single unified gameplay core (no platform divergence)
- PC is source of truth
- Mobile/tablet are scaled profiles only
- Mass, inertia, and recovery matter in combat
- Combat scales from 1v1 to 1v20+ without rule changes
- No mascot proportions, no floaty animation

**Tech Stack**:
- Core: C++
- Rendering: Vulkan (PC/Android), DX12 (PC), Metal (iOS)

### 2. `kai_jax.character.json`
**Purpose**: Authoritative LOCKFILE for Kai-Jax character specification

**What It Defines**:
- **Anatomy**: 9-tailed wolf/fox/hedgehog/spider hybrid, digitigrade legs
- **Modeling**: LOD targets (80K-120K tris for LOD0), clean quad topology
- **Materials**: PBR fur (card/shell), worn foundry steel armor, bone-tech spikes
- **Rigging**: Humanoid extended skeleton with 9 tails (5-7 bones each with physics)
- **Animation**: Mass and inertia philosophy, 15+ required animation sets
- **Combat**: Stance-shifting battlefield controller, scales 1v1 to 1v20+
- **Tail Roles**: Each of 9 tails has unique function (parry, dash, web, stealth, etc.)
- **Mobile Profile**: What can be cut (fur layers) vs never cut (silhouette, tail count)

### 3. `.github/ISSUE_TEMPLATE/build_task.md`
**Purpose**: Standardized template for build tasks

**Structure**:
- Clear single objective
- Canon references (kai_jax.character.json, copilot-instructions.md)
- Non-negotiable constraints
- Acceptance criteria checklist
- Reminder to ask if uncertain

## How to Use These Files

### For Development with GitHub Copilot

1. **Reference `.github/copilot-instructions.md` in your prompts and context**
   - GitHub Copilot Workspace and Chat can read this file when opened or referenced
   - Explicitly mention it in prompts: "Following copilot-instructions.md, implement..."
   - This sets the behavioral context for all AI assistance
   - Ensures Copilot acts like a disciplined senior engineer, not autocomplete

2. **Reference `kai_jax.character.json` as the single source of truth**
   - Any character implementation must validate against this JSON
   - No reinterpretation or simplification allowed
   - This is a LOCKFILE - treat it as canonical

3. **Create issues using the build_task.md template**
   - Go to GitHub Issues → New Issue → "Build Task (Legendary)"
   - Fill in objective, constraints, and acceptance criteria
   - This structures work clearly for both humans and AI

**Note on GitHub Copilot Integration**:
- **GitHub Copilot Chat**: Explicitly reference these files by:
  - Opening them in your editor before starting a chat
  - Using # followed by filename to reference open files (varies by IDE/extension)
  - Mentioning the filename directly in your prompt
- **GitHub Copilot Workspace**: These files can be included in the context automatically
- **Best Practice**: Always start prompts with "Following copilot-instructions.md and kai_jax.character.json..."
- Example prompt: "Following copilot-instructions.md, implement the combat system according to kai_jax.character.json tail_roles spec"
- The more you reference these files by name, the more consistent your results will be

### Example Workflow

**Opening a New Build Task**:
```markdown
Title: Build: Kai-Jax Combat System Implementation

## OBJECTIVE
Implement the stance-shifting combat system for Kai-Jax

## CANON REFERENCES
- kai_jax.character.json (combat_identity, tail_roles sections)
- copilot-instructions.md (unified core, PC-first)

## CONSTRAINTS (NON-NEGOTIABLE)
- Unified core
- PC-first development
- Must scale 1v1 to 1v20+ without rule changes
- All 9 tails must have independent functions

## ACCEPTANCE CRITERIA
- [ ] Matches JSON combat_identity spec
- [ ] Deterministic stance switching
- [ ] Each tail function implemented per tail_roles
- [ ] Scales PC → Tablet → Mobile
- [ ] No platform-specific combat logic

## NOTES
Tail physics constraints defined in rigging.extra_bones.tails
```

**When Working on Code**:
1. Read `copilot-instructions.md` to understand the rules
2. Reference `kai_jax.character.json` for specific requirements
3. Include these files in your Copilot context (open them or reference them)
4. Ask Copilot: "Following copilot-instructions.md, implement X according to kai_jax.character.json spec"
5. Copilot will follow the authoritative guidelines when they're in context

## Architecture Philosophy

### Three-Layer Authority System

**Layer 1: Repo-Level (copilot-instructions.md)**
- Permanent, non-negotiable rules
- Sets overall architecture and philosophy
- Prevents drift and divergence

**Layer 2: Spec-Level (kai_jax.character.json)**
- Authoritative character definition
- Data-driven, not interpretation-driven
- Single source of truth for all character features

**Layer 3: Task-Level (build_task.md template)**
- Structured execution orders
- Clear acceptance criteria
- Ensures tasks align with Layers 1 and 2

## Key Principles

### DO:
✅ Validate against kai_jax.character.json
✅ Use PC as development source of truth
✅ Scale features from PC → tablet → mobile
✅ Implement deterministic, data-driven systems
✅ Ask when uncertain rather than inventing

### DON'T:
❌ Simplify combat for mobile
❌ Fork logic per platform
❌ Reinterpret character design
❌ Use floaty animation or mascot proportions
❌ Guess at missing requirements

## Character Specification Highlights

**Kai-Jax "The Memory Hero"**:
- 9 independent tails with unique functions
- Athletic sinewy predator build (1.15x height multiplier)
- Worn foundry steel armor (no clean surfaces)
- Physics-enabled tail rigging (5-7 bones per tail)
- Mass and inertia-based animation (no floaty motion)
- Stance-shifting battlefield controller
- Scales from 1v1 to 1v20+ encounters

**9 Tail Functions**:
1. Bond - parry/counter/revive
2. Hunter - dash/pursuit/execute
3. Thread - web/pull/group
4. Quill - retaliation/posture damage
5. Shade - stealth/threat reset
6. Anchor - anti-knockback/root
7. Echo - after-image/repeat
8. Rift - reality tear AOE
9. Crown - aura/command

## Next Steps

1. **Read all three files** to understand the complete system
2. **Use the build_task.md template** when creating new issues
3. **Reference kai_jax.character.json** in all character-related work
4. **Let GitHub Copilot use copilot-instructions.md** for context-aware assistance

---

**Status**: ✅ Repository setup complete - Ready for disciplined development

The foundation is set. GitHub Copilot now knows how to behave like a senior engine programmer and technical art director.

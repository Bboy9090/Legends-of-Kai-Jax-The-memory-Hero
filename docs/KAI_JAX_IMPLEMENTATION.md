# Kai-Jax Character Implementation

## Overview

This document describes the implementation of **Kai-Jax, The Memory Hero** according to the authoritative specification in `kai_jax.character.json`.

## Character Identity

**Species**: Wolf/Fox/Hedgehog/Spider Hybrid  
**Combat Role**: Stance-Shifting Battlefield Controller  
**Scaling**: 1v1 to 1v20+ without rule changes  
**Philosophy**: Mass, inertia, and recovery matter

### Design Canon

- **LOCKFILE**: `kai_jax.character.json` is the single source of truth
- Any implementation that violates the JSON is INVALID
- No mascot proportions, no floaty animation, no swarm spam
- Combat must feel dangerous even at idle

## Architecture

### Core Files

```
packages/characters/src/heroes/KaiJax/
├── KaiJaxTypes.ts       # Type definitions and specifications
├── KaiJaxCharacter.ts   # Main character implementation
├── KaiJaxMoves.ts       # Move set and combat abilities
└── index.ts             # Public exports
```

## The 9-Tail System

Each of Kai-Jax's 9 tails has a specific combat function:

| Tail | Name   | Function                  | Usage                          |
|------|--------|---------------------------|--------------------------------|
| 1    | Bond   | Parry/Counter/Revive      | Defensive counter mechanic     |
| 2    | Hunter | Dash/Pursuit/Execute      | Chase down and finish enemies  |
| 3    | Thread | Web/Pull/Group            | Crowd control, group enemies   |
| 4    | Quill  | Retaliation/Posture Damage| Passive damage when hit        |
| 5    | Shade  | Stealth/Threat Reset      | Stealth mode, reset aggro      |
| 6    | Anchor | Anti-Knockback/Root       | Prevents knockback, roots      |
| 7    | Echo   | After-Image/Repeat        | Creates echo that repeats move |
| 8    | Rift   | Reality Tear/AOE          | Large area damage over time    |
| 9    | Crown  | Aura/Command              | Buff allies, debuff enemies    |

### Tail Physics

- **Bones per tail**: 5-7 bones
- **Physics enabled**: Yes
- **Swing limits**: 60-180 degrees (varies by tail)
- **Twist limits**: 20-90 degrees (varies by tail)
- **Noodle physics**: DISABLED (enforced by spec)

## Combat Systems

### Stance System

Kai-Jax shifts between 4 stances based on combat state:

1. **Neutral**: Balanced stance (default)
2. **Aggressive**: Crowd control focus (high damage)
3. **Defensive**: Posture preservation (high posture damage taken)
4. **Dominant**: Zone control active (crowd control abilities active)

### Posture System

- **Posture Health**: 0-100
- **Posture Break**: When posture reaches 0, vulnerability window opens
- **Regeneration**: Slowly regenerates when not in combat
- **Posture Damage**: Some moves deal posture damage (e.g., Quill tail)

### Corruption System

- **Corruption Level**: 0-100
- **Overuse Weakness**: At 80+ corruption, damage output reduced
- **Decay**: Automatically decreases over time
- **Cost**: Special abilities increase corruption

### Zone Control

- **Base Zone**: 5.0 meters
- **Expanded Zone**: 8.0 meters (when crowd control active)
- **Scaling**: Effectiveness increases with enemy count (1v1 to 1v20+)

## Animation Rules

From `kai_jax.character.json`:

- **Minimum frames per action**: 12 frames
- **Cancel rules**: Hit confirm or perfect parry only
- **No floaty motion**: Mass and inertia must be felt
- **Root motion**: Only for finishers and heavy knockdowns

### Required Animation Sets

- idle_calm, idle_combat
- walk, run, sprint
- light_combo, heavy_combo
- special_attacks
- dodge_ground, dodge_air
- parry, counter, finisher
- hit_reactions, death

## Stats

```typescript
weight: 95              // Medium-heavy for crowd control
walkSpeed: 1.15
runSpeed: 1.75
airSpeed: 1.05
jumpHeight: 13.5
airJumps: 1
fallSpeed: 1.65
fastFallSpeed: 2.5
heightMultiplier: 1.15  // From JSON spec
```

## Rendering Specifications

### LOD (Level of Detail)

- **LOD0**: 80,000 - 120,000 triangles (full quality)
- **LOD1**: 50,000 - 70,000 triangles
- **LOD2**: 25,000 - 35,000 triangles

### Materials (PBR)

**Fur**:
- Type: Card or shell
- Maps: Albedo, Normal, Roughness
- No painted fur - density varies by region

**Armor**:
- Material: Worn foundry steel
- Roughness: 0.4 - 0.6
- Edge wear: Required
- Clean surfaces: DISALLOWED

**Spikes**:
- Material: Bone-tech hybrid
- Emissive: Subtle, event-only

**Weave Energy**:
- Emissive: Yes
- Always on: No
- Mobile: DISABLED

### Mobile Profile

**Allowed cuts**:
- Fur shell layers
- Secondary emissive
- Minor decals

**NEVER cut**:
- Silhouette
- Tail count (must be 9)
- Animation timing
- Posture system
- Hit stop

## Usage Example

```typescript
import { createKaiJax, KAI_JAX_CONFIG } from '@beast-kin/characters';

// Create character instance
const kaiJax = createKaiJax();

// Activate a specific tail
kaiJax.activateTail(TailRole.HUNTER);

// Enable crowd control
kaiJax.activateCrowdControl();

// Check posture
if (kaiJax.combatStats.postureHealth < 30) {
  // Switch to defensive stance
  console.log('Low posture - switching to defensive');
}

// Monitor corruption
if (kaiJax.combatStats.corruptionLevel > 80) {
  console.warn('High corruption - weakness active');
}
```

## Combat Strengths

1. **Crowd Control**: Scales from 1v1 to 1v20+ without changing rules
2. **Posture Break**: Can break enemy posture, creating vulnerability windows
3. **Zone Dominance**: Controls large areas, denying enemy positioning

## Combat Weaknesses

1. **Overextension**: Vulnerable when too far from safe position
2. **Corruption Overuse**: Using too many abilities reduces effectiveness

## Development Guidelines

### When Adding New Features

1. **Check the JSON first**: `kai_jax.character.json` is authoritative
2. **Respect the tail system**: Each tail has a specific function
3. **Maintain mass/inertia**: No floaty animations
4. **Enforce frame minimums**: Min 12 frames per action
5. **Scale properly**: Must work in 1v1 and 1v20+ scenarios

### Common Mistakes to Avoid

❌ Adding more than 9 tails  
❌ Enabling noodle physics on tails  
❌ Creating floaty animations  
❌ Removing silhouette or tail count on mobile  
❌ Adding mascot-style proportions  
❌ Skipping posture or corruption systems  

### Testing Checklist

- [ ] All 9 tails are visible and independent
- [ ] Silhouette is readable in shadow
- [ ] Idle animation feels dangerous
- [ ] Mass and inertia are preserved
- [ ] Combat scales from 1v1 to 1v20+
- [ ] Posture system functions correctly
- [ ] Corruption penalty applies at 80+
- [ ] Mobile profile respects "never cut" list
- [ ] LOD transitions are smooth
- [ ] Materials use PBR and look worn

## Integration Points

### With Engine Core

- Physics bones for tails (C++ integration)
- GPU skinning for performance
- LOD system for optimization
- Event-driven VFX

### With Gameplay Systems

- Combat system (posture, crowd control)
- State machine (stance switching)
- Animation system (mass/inertia)
- Input system (tail activation)

### With Rendering

- PBR materials
- Fur rendering (card or shell)
- LOD management
- Mobile optimization

## Future Enhancements

Potential additions that would NOT violate the JSON spec:

1. Additional combo chains between tails
2. Synergy bonuses for tail combinations
3. Advanced posture break mechanics
4. Corruption visual feedback
5. Enhanced zone control VFX

Any addition MUST respect the core design philosophy and JSON specifications.

## References

- **Authoritative Spec**: `/kai_jax.character.json`
- **Type Definitions**: `packages/characters/src/heroes/KaiJax/KaiJaxTypes.ts`
- **Implementation**: `packages/characters/src/heroes/KaiJax/KaiJaxCharacter.ts`
- **Move Set**: `packages/characters/src/heroes/KaiJax/KaiJaxMoves.ts`

---

**REMEMBER**: The JSON is the LOCKFILE. If this document conflicts with `kai_jax.character.json`, the JSON wins.

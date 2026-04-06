# Kai-Jax: Unreal Engine Implementation

## Overview
This is the Unreal Engine 5 implementation of Kai-Jax, The Memory Hero. This codebase provides a complete character controller, combat system, animation blueprint support, and world reaction systems.

## Project Structure

```
Source/KaiJax/
├── Characters/
│   ├── KaiJaxCharacter.h/cpp     # Main character class
├── Combat/
│   ├── KaiJaxCombatComponent.h/cpp  # Combat abilities & combos
├── Animation/
│   ├── KaiJaxAnimInstance.h/cpp  # Animation blueprint interface
├── Input/
│   ├── KaiJaxInputComponent.h    # Enhanced Input handling
├── World/
│   ├── KaiJaxWorldReactionManager.h/cpp  # World responds to power level
├── VFX/
│   ├── KaiJaxVFXTypes.h          # VFX configurations
├── Game/
│   ├── KaiJaxGameMode.h/cpp      # Game mode
├── KaiJax.Build.cs               # Module build rules
└── README_UNREAL.md              # This file
```

## Core Systems

### 1. 9-Tail System
Kai-Jax starts with 3 tails and can unlock up to 9 through gameplay progression.

| Tail | Name | Function | Color |
|------|------|----------|-------|
| 1 | Bond | Parry, Counter, Revive | Blue |
| 2 | Hunter | Dash, Pursuit, Execute | Red |
| 3 | Thread | Web, Pull, Group | Purple |
| 4 | Quill | Retaliation, Posture Damage | Yellow |
| 5 | Shade | Stealth, Threat Reset | Gray |
| 6 | Anchor | Anti-Knockback, Root | Brown |
| 7 | Echo | After-Image, Repeat | Cyan |
| 8 | Rift | Reality Tear, AOE | Violet |
| 9 | Crown | Aura, Command | Gold |

### 2. Combat System
- **Light Attacks**: Quick strikes, low corruption
- **Heavy Attacks**: Powerful finishers, medium corruption
- **Tail Strikes**: Special abilities, high corruption
- **Parry**: Perfect timing counters (Bond tail)
- **Dash**: Quick movement (Hunter tail)
- **Crowd Control**: Zone dominance ability

### 3. Stance System
```cpp
enum class EKaiJaxStance : uint8
{
    Neutral,    // Default balanced stance
    Aggressive, // High damage, low defense
    Defensive,  // Counter-focused, high guard
    Dominant    // Crowd control active
};
```

### 4. Corruption System
Abilities build "corruption" - at 80%+ corruption:
- Reduced damage output
- Visual corruption effects
- Risk/reward gameplay loop

### 5. World Reactions
The world responds to Kai-Jax's power level (tail count):

| Tier | Tails | Enemy Reaction | Environment |
|------|-------|----------------|-------------|
| Nascent | 3 | Confident | None |
| Awakened | 4-5 | Wary | Slight |
| Ascendant | 6-7 | Coordinated | Moderate |
| Apex | 8 | Flee (fodder) | Strong |
| Transcendent | 9 | Awe/Terror | Maximum |

## Setup Instructions

### 1. Create Unreal Project
1. Open Unreal Engine 5.3+
2. Create new C++ project
3. Copy `Source/KaiJax/` into your project's `Source/` folder

### 2. Configure Build
Ensure your `.uproject` has the KaiJax module:
```json
{
  "Modules": [
    {
      "Name": "KaiJax",
      "Type": "Runtime",
      "LoadingPhase": "Default"
    }
  ]
}
```

### 3. Required Plugins
Enable these plugins in your project:
- Enhanced Input
- Niagara
- Gameplay Abilities System (GAS)

### 4. Create Blueprint Assets
1. Create `BP_KaiJax` inheriting from `AKaiJaxCharacter`
2. Create `ABP_KaiJax` Animation Blueprint using `UKaiJaxAnimInstance`
3. Set up Input Mapping Context with actions

## Input Configuration

### Default Keyboard Mapping
| Action | Key |
|--------|-----|
| Move | WASD |
| Look | Mouse |
| Jump | Space |
| Dash | Shift |
| Light Attack | Left Mouse |
| Heavy Attack | Right Mouse |
| Parry | Q |
| Tail 1 (Bond) | 1 |
| Tail 2 (Hunter) | 2 |
| Tail 3 (Thread) | 3 |
| Ultimate | R |

### Controller Support
| Action | Button |
|--------|--------|
| Move | Left Stick |
| Look | Right Stick |
| Jump | A/X |
| Dash | LB |
| Light Attack | X/Square |
| Heavy Attack | Y/Triangle |
| Parry | RB |
| Ultimate | LT + RT |

## Animation Requirements

### Required Montages
- `AM_LightAttack_Combo` (4-hit chain)
- `AM_HeavyAttack` (2-hit finisher)
- `AM_TailStrike` (per-tail unique)
- `AM_Parry`
- `AM_Dash`
- `AM_Stagger`

### Blend Spaces
- `BS_Locomotion` (8-directional movement)
- `BS_TailIdle` (procedural tail sway)

### State Machine States
- Idle
- Locomotion
- Jump/Fall
- Attack
- TailStrike
- Parry
- Dash
- Stagger
- Death

## VFX Requirements

### Niagara Systems
Create these Niagara systems and assign in `BP_KaiJax`:
1. `NS_TailGlow` - Per-tail emissive effect
2. `NS_MemoryActivation` - Memory unlock burst
3. `NS_CrowdControlPulse` - AOE wave effect
4. `NS_DashTrail` - Movement trail
5. `NS_CorruptionAura` - High corruption visual

## Canon Compliance

This implementation follows `kai_jax.character.json` lockfile:

✅ 9 tails with sequential unlock (3→9)
✅ No skipping tails
✅ Memory layers tied to tail progression
✅ Posture-based combat
✅ Corruption weakness system
✅ World reaction tiers
✅ Animation philosophy: mass & inertia
✅ Minimum 12 frames per action
✅ Cancel rules: hit confirm or perfect parry only

## Performance Notes

- LOD0: 80,000-120,000 triangles
- LOD1: 50,000-70,000 triangles
- LOD2: 25,000-35,000 triangles
- Tails use 5-7 bones each (45-63 total tail bones)
- Niagara particle budget: ~500 particles max

## License

This character and implementation are part of BEAST-KIN SOVEREIGNTY: GENESIS™
© 2024 All rights reserved.

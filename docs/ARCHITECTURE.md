# Architecture

## Overview

Smash Heroes Ultimate is built as a TypeScript monorepo using pnpm workspaces and Turborepo. The architecture is modular, with clear separation of concerns.

## Packages

### @smash-heroes/shared

Foundation package containing:

- **Types**: TypeScript interfaces for all game systems
- **Utils**: Math, vector, and timing utilities
- **Constants**: Game configuration and tuning values

### @smash-heroes/engine

Core game engine with these subsystems:

#### Core
- **GameLoop**: Fixed 60 FPS timestep with delta accumulation
- **SceneManager**: Scene lifecycle management
- **AssetLoader**: Async asset loading with caching

#### Physics
- **MomentumPhysics**: Spider-Man style movement with momentum preservation
- **CollisionResolver**: AABB and swept collision detection
- **HitboxManager**: Hitbox/hurtbox management

#### Combat
- **CombatEngine**: Main combat controller
- **KnockbackCalculator**: Smash Bros knockback formula
- **DamageSystem**: Percentage-based damage
- **ComboSystem**: Freeflow combo tracking
- **CounterSystem**: Counter and parry windows

#### Input
- **InputManager**: Unified input abstraction
- **InputBuffer**: 6-frame input buffering
- **KeyboardController**: Keyboard input handling
- **GamepadController**: Gamepad support
- **TouchController**: Touch and gesture recognition

#### Animation
- **StateMachine**: Fighter state management
- **AnimationController**: Frame-based animation

#### Effects
- **ScreenEffects**: Hitlag, screen shake, slow motion
- **ParticleSystem**: Hit sparks and visual effects

#### Audio
- **AudioManager**: Sound and music management
- **SoundPool**: Pooled audio playback

### @smash-heroes/characters

Fighter system:

- **BaseFighter**: Abstract base class for all fighters
- **FighterStateMachine**: State machine builder
- **MoveSet**: Attack data structures
- **Striker**: Example playable character

## Game Loop

```
┌─────────────────────────────────────┐
│         requestAnimationFrame       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│     Calculate Delta Time            │
│     (Cap at MAX_DELTA_TIME)         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│     Accumulate Delta                │
│     (Fixed Timestep)                │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  While accumulated >= fixedStep:    │
│    - Update Input                   │
│    - Update Physics                 │
│    - Update Combat                  │
│    - Update Fighters                │
│    - Update Effects                 │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│     Render (with interpolation)     │
└─────────────────────────────────────┘
```

## Combat Flow

```
Input → InputBuffer → StateMachine → Attack Data
                                         │
                                         ▼
                           Hitbox Check ─────→ No Hit
                                         │
                                         ▼ Hit!
                           Check Counter/Parry
                                         │
                                         ▼
                           Calculate Damage & Knockback
                                         │
                                         ▼
                           Apply Effects (Hitlag, Shake)
                                         │
                                         ▼
                           Update Combo Counter
```

## Physics System

The momentum physics system preserves velocity and provides smooth movement:

1. **Update Phase**:
   - Apply gravity if airborne
   - Apply friction if grounded
   - Process movement input
   - Update velocity
   - Update position

2. **Collision Phase**:
   - Check platform collisions
   - Resolve penetration
   - Apply surface effects

3. **Special Systems**:
   - Coyote time (grace period after leaving platform)
   - Jump buffering (remember jump inputs)
   - Variable jump height (release early for short hop)

## State Management

Fighter states are managed through a priority-based state machine:

- Higher priority transitions can interrupt lower priority states
- Each state has enter/exit/update callbacks
- States can define valid transitions

Common state transitions:
- Ground → Jump Squat → Jumping → Falling → Landing → Ground
- Any → Hitstun → Knockback → Landing/Airborne
- Block → Parry (on perfect timing) → Counter Window

## Performance Considerations

- **Fixed Timestep**: Ensures consistent physics regardless of frame rate
- **Delta Accumulation**: Prevents spiral of death on lag spikes
- **Object Pooling**: Planned for particles and projectiles
- **Lazy Loading**: Assets loaded on demand
- **Type Safety**: Compile-time checks prevent runtime errors

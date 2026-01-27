# Input System & Animation State Machine - Implementation Summary

## Overview

Production-grade TypeScript/Three.js input system and state machine for Legends of Kai-Jax, following the architecture defined in the C++ reference implementation and respecting governance rules from `README_CANON.md` and `kai_jax.character.json`.

## Components Implemented

### 1. Configuration (`config/input-keybinds.json`)
- **PC defaults**: Keyboard (WASD, Space, Shift, Click), Mouse sensitivity
- **Gamepad defaults**: Xbox layout, button/axis mappings, deadzones, vibration
- **Mobile defaults**: Touch zones, gestures, haptics, UI behavior, performance settings
- **Input buffer**: Frame-perfect input configuration
- **Remapping**: Runtime remapping support, localStorage persistence

### 2. Mobile Input Handler (`packages/engine/src/input/MobileInputHandler.ts`)
- **Touch detection**: Multi-touch support with touch point tracking
- **Gesture recognition**:
  - Swipe (directional input)
  - Long-press (charge attacks)
  - Pinch (camera zoom, not state changes per governance)
  - Double-tap (dash)
- **Haptic feedback**: Vibration API integration with intensity control
- **Auto-hide UI**: Configurable auto-hide during input
- **Performance**: Configurable optimizations (disable emissive materials on mobile)

### 3. Updated Input Manager (`packages/engine/src/input/InputManager.ts`)
- **InputConfig interface**: Customizable keybindings and deadzone
- **Platform support**: Keyboard, gamepad, touch with graceful degradation
- **Unified InputState**: Same interface regardless of device
- **Configurable deadzone**: Runtime adjustable stick/trigger deadzones
- **Frame-perfect input**: Input buffer for competitive play
- **Mobile integration**: Integrated MobileInputHandler

### 4. Animation State Machine (`packages/engine/src/character/AnimationStateMachine.ts`)
- **AnimationStateType enum**: 30+ states matching C++ reference
- **Type-safe transitions**: Validation with clear error messages
- **Priority system**: ATTACK (50-61) > JUMP (28-30) > MOVEMENT (10-12) > IDLE (1-2)
- **Metadata per state**:
  - Duration in frames (min 12 per governance)
  - Cancel windows (frame ranges)
  - Blend duration
  - Priority level
  - Root motion flag
- **Event system**: On-enter/on-exit callbacks for VFX/sound integration
- **Governance compliance**:
  - Min 12 frames per action enforced
  - Cancel rules: hit_confirm_or_perfect_parry_only
  - Mass and inertia philosophy (no floaty motion)

### 5. Kai-Jax Controller (`packages/characters/src/heroes/KaiJax/KaiJaxController.ts`)
- **Integration**: Combines InputManager + AnimationStateMachine + KaiJaxCharacter
- **Update loop**: Input → State calculation → Animation → Character
- **Frame-perfect input**: Uses input buffer for 1-3 frame windows
- **Combo system**: Tracks attack chains with cancel windows
- **Debug logging**: Configurable state transition logging
- **Haptic feedback**: Mobile haptic triggers on attacks, parries, state changes
- **Priority-based state selection**: Defensive > Attack > Jump > Movement > Idle

### 6. Animation Player (`packages/engine/src/rendering/AnimationPlayer.ts`)
- **Three.js integration**: Binds AnimationStateType to Three.js AnimationAction
- **Animation blending**: Smooth transitions between states
- **Frame minimum enforcement**: Validates min 12 frames per action
- **LOD animation selection**:
  - LOD0: Full animations
  - LOD1: Simplified secondary animations
  - LOD2: Essential animations only (fallback system)
- **Tail physics**: Per-frame updates for 9 tails
  - Spring physics simulation
  - Constraints enforcement (swing/twist limits)
  - No noodle physics (governance rule)

## Governance Compliance

### ✅ README_CANON.md
- Single gameplay core across all platforms
- PC is source of truth
- Mobile/tablet are scaled profiles, not separate systems
- No platform-specific logic divergence in combat mechanics
- Platform adapters handle ONLY input translation

### ✅ kai_jax.character.json
- Min 12 frames per action enforced
- Cancel rules: hit_confirm_or_perfect_parry_only
- Root motion for finishers/knockdowns
- 9 tails (governance: immutable)
- Tail physics constraints (swing/twist limits, no noodle physics)
- Mobile profile: disable emissive materials, never cut tail_count/animation_timing

### ✅ character.schema.json
- Tail count validation (1-9)
- Evolution constraints enforced
- Sequential unlock rule validation

## Usage Example

```typescript
import { InputManager } from '@beast-kin/engine/input';
import { KaiJaxCharacter } from '@beast-kin/characters/heroes/KaiJax';
import { KaiJaxController } from '@beast-kin/characters/heroes/KaiJax';
import { AnimationPlayer } from '@beast-kin/engine/rendering';
import * as THREE from 'three';

// Setup
const element = document.getElementById('game-canvas');
const inputManager = new InputManager(element, {
  deadzone: 0.15,
  inputBufferSize: 6,
});

const character = new KaiJaxCharacter();
const controller = new KaiJaxController(character, inputManager, true); // debug enabled

// Three.js animation player
const characterModel = new THREE.Group(); // Load from GLB
const animationPlayer = new AnimationPlayer(characterModel);

// Game loop
function gameLoop(deltaTime: number) {
  // Update controller (handles input → state → character)
  controller.update(deltaTime);
  
  // Get current animation state
  const currentState = controller.getCurrentState();
  const metadata = controller.getAnimationStateMachine().getMetadata(currentState);
  
  if (metadata) {
    // Play animation in Three.js
    animationPlayer.playState(currentState, metadata);
  }
  
  // Update animation player (updates mixer and tail physics)
  animationPlayer.update(deltaTime);
}

// Mobile haptic feedback
const mobileHandler = inputManager.getMobileInputHandler();
if (mobileHandler) {
  // Trigger haptic on hit
  mobileHandler.triggerHaptic('hit');
}
```

## State Transition Examples

### Valid Transitions
- `IDLE_CALM` → `WALK` → `RUN` → `SPRINT`
- `IDLE_CALM` → `ATTACK_1` → `ATTACK_2` → `ATTACK_3` → `ATTACK_HEAVY`
- `IDLE_CALM` → `JUMP` → `FALL` → `LAND` → `IDLE_COMBAT`
- `ATTACK_1` → `DODGE_GROUND` (cancel in window)
- `PARRY` → `PARRY_SUCCESS` → `COUNTER` (perfect parry)

### Invalid Transitions
- `IDLE_CALM` → `VICTORY` (terminal state, not reachable from idle)
- `ATTACK_1` → `ATTACK_3` (must go through ATTACK_2)
- `ATTACK_1` → `WALK` (outside cancel window)

## Testing

### Manual Testing
1. **Keyboard input**: WASD movement, Space jump, J/K attacks
2. **Gamepad input**: Left stick movement, A button jump, X/Y attacks
3. **Touch input**: Swipe gestures, tap buttons, double-tap dash
4. **State transitions**: Verify combo chains work in cancel windows
5. **Mobile optimizations**: Check emissive materials disabled on mobile
6. **Configuration loading**: Verify config/input-keybinds.json is respected

### Validation Commands
```bash
# Validate canonical compliance
npm run validate:canon

# Expected output:
# ✅ Character data validates against canonical schema
# ✅ Evolution constraints enforced
```

## Configuration Customization

Edit `config/input-keybinds.json` to customize:
- Keyboard keybindings
- Gamepad button mappings
- Mobile touch zones and gestures
- Haptic feedback intensity
- Input buffer size
- Deadzone values

Changes are applied at runtime via `InputManager.updateConfig()`.

## Performance Notes

### Mobile Optimizations
- Emissive materials disabled (`weave_energy`)
- Particle effects reduced
- Shadow quality lowered
- **Never cut**: tail_count, animation_timing, posture_system, hit_stop

### LOD System
- **LOD0** (PC): Full animations, all details
- **LOD1** (High-end mobile): Simplified secondary animations
- **LOD2** (Low-end mobile): Essential animations, fallback system

## Integration Points

### VFX/Sound Integration
Use animation state machine callbacks:
```typescript
const stateMachine = controller.getAnimationStateMachine();

stateMachine.onEnter(AnimationStateType.ATTACK_1, (from, to, metadata) => {
  // Trigger VFX
  vfxSystem.play('slash_effect', character.position);
  
  // Play sound
  audioSystem.play('sword_swing', character.position);
});
```

### Combat System Integration
```typescript
// Force state transitions on hit
if (hitDetected) {
  controller.forceState(AnimationStateType.HIT_LIGHT);
  mobileHandler?.triggerHaptic('hit');
}

// Check for perfect parry cancel
if (stateMachine.isInCancelWindow() && parrySuccess) {
  controller.forceState(AnimationStateType.COUNTER);
}
```

## Architecture Diagram

```
Input Devices (Keyboard/Gamepad/Touch)
          ↓
    InputManager
          ↓
  KaiJaxController ←→ AnimationStateMachine
          ↓                    ↓
   KaiJaxCharacter      AnimationPlayer
          ↓                    ↓
     Gameplay              Three.js
```

## Future Enhancements

1. **Network synchronization**: Frame-perfect input replication
2. **Input recording/playback**: For replays and training mode
3. **Custom keybind editor**: In-game UI for remapping
4. **Accessibility options**: Extended input assistance
5. **Advanced combo system**: Stance-specific move sets
6. **Physics engine integration**: Replace simple tail physics with full simulation

## Credits

Implementation follows:
- C++ reference architecture
- `README_CANON.md` governance rules
- `kai_jax.character.json` character specification
- `character.schema.json` validation schema
- `tail_tier_reactions.json` world system integration

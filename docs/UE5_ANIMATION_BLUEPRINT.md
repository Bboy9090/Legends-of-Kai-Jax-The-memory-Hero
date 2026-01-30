# UE5 Animation Blueprint Setup - Kai-Jax

**Version:** 1.0.0  
**Last Updated:** 2026-01-27  
**Canonical Reference:** `kai_jax.character.json`

## Overview

This document defines the Animation Blueprint state machine structure for Kai-Jax in Unreal Engine 5. The animation system supports combat scaling (1v1 to 1v20+), memory layer posture modifiers, and tail physics integration.

**GOVERNANCE COMPLIANCE:**
- Animation philosophy: Mass and inertia (no floaty motion)
- Tail count: 9 (immutable, from lockfile)
- Memory layers influence posture and confidence
- Hit-stop on impact: 2-6 frames

---

## State Machine Structure

### High-Level State Flow

```
[Idle] ⇄ [Walking] ⇄ [Running]
  ↓         ↓           ↓
[Combat_Idle] ⇄ [Attack] ⇄ [Dodge]
  ↓         ↓           ↓
[Falling] → [Landing] → [Idle]
```

---

## State Definitions

### 1. Idle

**Purpose:** Neutral standing state when no input is active.

**Animations:**
- `Idle_Calm` - Base idle animation (breathing, weight shifts)
- `Idle_Alert` - Heightened awareness (enemy nearby but not engaged)
- `Idle_Confident` - High memory layer pose (tails arc higher, spine straighter)
- `Idle_Cautious` - Low memory layer pose (lower center of gravity, defensive)

**Blend Logic:**
- Blend between `Idle_Calm` and `Idle_Alert` based on `NearbyEnemyCount`
- Blend toward `Idle_Confident` or `Idle_Cautious` based on `ActiveMemoryLayers` (0.0 = Cautious, 1.0 = Confident)

**Transitions:**
- Movement velocity > 50 units/s → **Walking**
- `IsFalling` == true → **Falling**
- `IsInCombat` == true → **Combat_Idle**

**Tail Behavior:**
- Tails sway gently (idle oscillation)
- Sway speed: 0.5 (slow, natural breathing rhythm)
- Sway amount: 0.3 (subtle)

---

### 2. Walking

**Purpose:** Locomotion state for slow to moderate movement speeds.

**Animations:**
- `Walk_Fwd` - Forward walking
- `Walk_Back` - Backward walking
- `Walk_Strafe_L` - Left strafe
- `Walk_Strafe_R` - Right strafe

**Blend Space:**
- X-axis: Forward/Backward (-1.0 to 1.0, based on `MovementDirection.Y`)
- Y-axis: Strafe Left/Right (-1.0 to 1.0, based on `MovementDirection.X`)
- Interpolation: **Linear Blend**

**Transitions:**
- Movement velocity < 50 units/s → **Idle**
- Movement velocity > 400 units/s → **Running**
- Sprint input pressed → **Running**
- `IsFalling` == true → **Falling**
- `IsInCombat` == true and velocity > 0 → **Combat_Idle** (movement in combat uses different state)

**Tail Behavior:**
- Tails sway based on movement speed
- Sway speed: 1.0 + (velocity / 600.0) * 0.5
- Sway amount: 0.5 + (velocity / 600.0) * 0.5
- Tails lag behind movement direction (momentum effect)

**Digitigrade Leg Adjustment:**
- IK blend: 1.0 (full IK active)
- Digitigrade angle: 15° (slight bend for walking)

---

### 3. Running

**Purpose:** High-speed locomotion state.

**Animations:**
- `Run_Fwd` - Forward running
- `Run_Strafe_L` - Left strafe run
- `Run_Strafe_R` - Right strafe run
- `Run_Back` - Backward run (optional, may use fast walk instead)

**Blend Space:**
- X-axis: Forward/Backward (-1.0 to 1.0)
- Y-axis: Strafe Left/Right (-1.0 to 1.0)
- Interpolation: **Linear Blend**

**Transitions:**
- Sprint input released AND velocity < 400 units/s → **Walking**
- Movement velocity < 50 units/s → **Idle**
- `IsFalling` == true → **Falling**

**Tail Behavior:**
- Tails sway at maximum amplitude
- Sway speed: 2.0 (high frequency, aggressive motion)
- Sway amount: 1.0 (full range)
- Tails stream behind character (high momentum lag)

**Digitigrade Leg Adjustment:**
- IK blend: 1.0 (full IK active)
- Digitigrade angle: 30° (deeper bend for running)

---

### 4. Combat_Idle

**Purpose:** Combat-ready stance when enemies are engaged but no action is in progress.

**Animations:**
- `Combat_Stance` - Neutral combat stance (weight on balls of feet)
- `Combat_Alert` - Heightened alert (enemy attacking)
- `Combat_Dominant` - High memory layer combat pose (aggressive, forward-leaning)
- `Combat_Defensive` - Low memory layer combat pose (cautious, weight back)

**Blend Logic:**
- Blend between `Combat_Stance` and `Combat_Alert` based on `EnemyAttacking`
- Blend toward `Combat_Dominant` or `Combat_Defensive` based on `ActiveMemoryLayers`

**Transitions:**
- Attack input pressed → **Attack**
- Dodge input pressed → **Dodge**
- `IsInCombat` == false → **Idle**
- `IsFalling` == true → **Falling**

**Tail Behavior:**
- Tails held in aggressive arc (forward and outward)
- Minimal sway (tensed, ready to strike)
- Tails respond to enemy positions (subtle tracking)

**Digitigrade Leg Adjustment:**
- IK blend: 1.0 (full IK active)
- Digitigrade angle: 45° (maximum combat readiness)

**Memory Layer Influence:**
- High memory (7-9 tails): Spine straight, shoulders back, tails high
- Mid memory (4-6 tails): Neutral combat stance
- Low memory (3 tails): Lower center of gravity, defensive posture

---

### 5. Attack

**Purpose:** Offensive action states (punches, kicks, combos, specials).

**Animations:**
- `Punch_L` - Left punch (12 frames)
- `Punch_R` - Right punch (12 frames)
- `Kick_L` - Left kick (18 frames)
- `Kick_R` - Right kick (18 frames)
- `Combo_Chain_01` - 3-hit light combo
- `Combo_Chain_02` - 3-hit heavy combo
- `Special_Attack_01` through `Special_Attack_09` (one per tail ability)

**Attack Flow:**
- Attack animations are **not interruptible** except by:
  - Hit confirm (next combo move)
  - Perfect parry (counter state)
  - Hit reaction (player takes damage)

**Hit-Stop:**
- On successful hit: Freeze animation for **2-6 frames** (based on attack power)
- Light attacks: 2 frames
- Medium attacks: 4 frames
- Heavy attacks / Finishers: 6 frames

**Transitions:**
- Attack animation completes → **Combat_Idle**
- Combo window active + Attack input → **Next Combo Attack**
- Player hit during attack → **Hit Reaction** (Combat_Idle)

**Tail Behavior:**
- Tails move in sync with attack direction (forward for punches, upward for kicks)
- Tails snap to aggressive position on hit confirm
- Tail-specific attacks use corresponding tail (e.g., `Special_Attack_01` animates Tail_01)

**Digitigrade Leg Adjustment:**
- IK blend: 0.5 (reduced IK during attacks for animation control)
- Digitigrade angle: 35-45° (varies by attack type)

---

### 6. Dodge

**Purpose:** Evasive maneuver with invincibility frames.

**Animations:**
- `Dodge_Forward` - Forward roll/dash (24 frames)
- `Dodge_Back` - Backward dash (20 frames)
- `Dodge_Left` - Left dash (20 frames)
- `Dodge_Right` - Right dash (20 frames)

**Timing:**
- Input response time: **6 frames** (100ms at 60 FPS)
- Invincibility frames (i-frames): **10 frames** (frames 5-14 of animation)
- Total dodge duration: 20-24 frames

**Transitions:**
- Dodge animation completes → **Combat_Idle**
- `IsFalling` == true during dodge → **Falling** (dodge off ledge)

**Tail Behavior:**
- Tails whip in opposite direction of dodge (momentum conservation)
- Tails snap back to neutral position on dodge completion
- High-speed tail motion enhances visual feedback of dodge

**Digitigrade Leg Adjustment:**
- IK blend: 0.0 (no IK during dodge, full animation control)
- Digitigrade angle: Varies per dodge animation

---

### 7. Falling

**Purpose:** Airborne state when character is not grounded.

**Animations:**
- `Fall_Loop` - Looping falling animation (arms out, slight rotation)
- `Fall_Fast` - High-speed falling (terminal velocity)

**Blend Logic:**
- Blend between `Fall_Loop` and `Fall_Fast` based on `FallSpeed` (threshold: 800 units/s)

**Transitions:**
- `IsGrounded` == true → **Landing**
- Wall jump / air dash (if implemented) → **Air Combat State** (future)

**Tail Behavior:**
- Tails drag upward (air resistance simulation)
- Tails splay outward (natural spread during fall)
- Tail physics blend: 0.7 (blend physics simulation with animation)

**Digitigrade Leg Adjustment:**
- IK blend: 0.0 (no IK while airborne)
- Legs pull up toward body (natural falling pose)

---

### 8. Landing

**Purpose:** Ground impact recovery state.

**Animations:**
- `Land_Soft` - Light landing (fall speed < 600 units/s, 12 frames)
- `Land_Hard` - Heavy landing (fall speed >= 600 units/s, 24 frames)
- `Land_Roll` - Roll landing (high speed + forward input, 30 frames)

**Selection Logic:**
- If `FallSpeed` < 600 → `Land_Soft`
- If `FallSpeed` >= 600 AND no forward input → `Land_Hard`
- If `FallSpeed` >= 600 AND forward input pressed → `Land_Roll`

**Transitions:**
- Landing animation completes → **Idle**
- Landing completes + `IsInCombat` == true → **Combat_Idle**

**VFX:**
- Spawn dust particle effect at feet on impact
- Effect intensity scales with `FallSpeed`

**Tail Behavior:**
- Tails slam downward on impact (absorbing shock visually)
- Tails spring back to neutral over landing duration

**Digitigrade Leg Adjustment:**
- IK blend: 0.0 → 1.0 (fade in IK over landing animation)
- Digitigrade angle: Varies per landing type

---

## Blend Spaces

### BS_Locomotion_Direction

**Purpose:** Blend walking/running animations based on movement direction.

**Axes:**
- **X-axis:** Forward/Backward (-1.0 to 1.0)
  - -1.0: Full backward
  - 0.0: Neutral (strafe only)
  - 1.0: Full forward
- **Y-axis:** Strafe Left/Right (-1.0 to 1.0)
  - -1.0: Full left strafe
  - 0.0: No strafe
  - 1.0: Full right strafe

**Sample Points:**
- (-1.0, 0.0): `Walk_Back` / `Run_Back`
- (0.0, -1.0): `Walk_Strafe_L` / `Run_Strafe_L`
- (0.0, 1.0): `Walk_Strafe_R` / `Run_Strafe_R`
- (1.0, 0.0): `Walk_Fwd` / `Run_Fwd`

**Interpolation:** Linear

---

### BS_TailSway_Speed

**Purpose:** Modulate tail sway intensity based on movement speed.

**Axes:**
- **X-axis:** Movement Speed (0.0 to 800.0 units/s)
  - 0.0: Idle sway
  - 400.0: Walking sway
  - 800.0: Running sway (max)
- **Y-axis:** Sway Intensity (0.0 to 1.0)
  - Controlled by `TailSwayAmount` parameter

**Sample Points:**
- (0.0, 0.0): Minimal sway (idle)
- (400.0, 0.5): Moderate sway (walking)
- (800.0, 1.0): Maximum sway (running)

**Usage:**
- This blend space is layered over base animations
- Outputs a tail sway curve that is applied to tail bone rotations
- Integrates with Control Rig `UpdateTailPhysics()` function

---

## Memory Layer Posture Modifiers

**Integration with `ActiveMemoryLayers` (from lockfile):**

Memory layers (3 starting → 9 final) directly influence animation blending and posture.

**Posture Scalar Calculation:**
```cpp
float MemoryInfluence = FMath::Clamp((float)(ActiveMemoryLayers - 3) / 6.0f, 0.0f, 1.0f);
// 3 tails = 0.0 (cautious)
// 6 tails = 0.5 (neutral)
// 9 tails = 1.0 (dominant)
```

**Posture Adjustments:**

| Memory Layers | Posture Type | Spine Curve | Shoulder Height | Head Tilt | Tail Arc |
|---------------|--------------|-------------|-----------------|-----------|----------|
| 3-4 | Cautious | Slight forward lean | Lowered | Down (alert) | Low, defensive |
| 5-6 | Neutral | Straight | Normal | Level | Mid-height arc |
| 7-8 | Confident | Slight back lean | Raised | Up (scanning) | High, aggressive |
| 9 | Dominant | Full upright | Maximum | High (commanding) | Crown formation |

**Implementation:**
- Use `MemoryInfluence` scalar to blend between posture extremes
- Apply to spine IK, shoulder bones, and head rotation
- Tail arc height controlled by Control Rig `TailSwayAmount` scaled by `MemoryInfluence`

---

## Animation Blueprint Variables

**Input Variables (Set by Character Class):**
- `MovementDirection` (Vector2D): Normalized movement input (-1 to 1 on X/Y)
- `MovementVelocity` (Vector): Current velocity (magnitude = speed)
- `IsFalling` (bool): Is character airborne?
- `IsGrounded` (bool): Is character on ground?
- `IsInCombat` (bool): Is character in combat mode?
- `NearbyEnemyCount` (int): Number of enemies in detection range
- `EnemyAttacking` (bool): Is an enemy actively attacking?
- `FallSpeed` (float): Vertical fall speed (used for landing type)
- `ActiveMemoryLayers` (int): Current tail count (3-9, from progression system)

**Internal State Variables:**
- `CurrentState` (enum): Current animation state
- `DigitegradeAngle` (float): Current leg bend angle (0-45°)
- `TailSwaySpeed` (float): Tail oscillation speed
- `TailSwayAmount` (float): Tail oscillation amplitude
- `MemoryInfluence` (float): 0.0-1.0 scalar for posture blending
- `ComboWindowActive` (bool): Is combo timing window open?
- `HitStopFrames` (int): Remaining hit-stop frames

---

## State Transition Matrix

| From State | To State | Condition |
|------------|----------|-----------|
| Idle | Walking | `MovementVelocity.Length() > 50` |
| Idle | Falling | `IsFalling == true` |
| Idle | Combat_Idle | `IsInCombat == true` |
| Walking | Idle | `MovementVelocity.Length() < 50` |
| Walking | Running | `MovementVelocity.Length() > 400` OR Sprint input |
| Walking | Falling | `IsFalling == true` |
| Running | Walking | Sprint released AND `MovementVelocity.Length() < 400` |
| Running | Idle | `MovementVelocity.Length() < 50` |
| Running | Falling | `IsFalling == true` |
| Combat_Idle | Attack | Attack input pressed |
| Combat_Idle | Dodge | Dodge input pressed |
| Combat_Idle | Idle | `IsInCombat == false` |
| Combat_Idle | Falling | `IsFalling == true` |
| Attack | Combat_Idle | Attack animation complete |
| Attack | Attack (Combo) | Combo window + Attack input |
| Dodge | Combat_Idle | Dodge animation complete |
| Dodge | Falling | `IsFalling == true` (dodge off ledge) |
| Falling | Landing | `IsGrounded == true` |
| Landing | Idle | Landing animation complete AND `IsInCombat == false` |
| Landing | Combat_Idle | Landing animation complete AND `IsInCombat == true` |

---

## Control Rig Integration

The Animation Blueprint integrates with `UKaiJaxControlRig` (see `Source/KaiJax/Animation/KaiJaxControlRig.h`).

**Control Rig Updates:**
- `UpdateDigitegradeIK(DeltaTime)` - Called every frame in AnimGraph
- `UpdateTailPhysics(DeltaTime, MovementVelocity)` - Called every frame in AnimGraph
- `ApplyMemoryPostureModifier(MemoryInfluence)` - Called when `ActiveMemoryLayers` changes

**Execution Order:**
1. Animation state update
2. Blend space evaluation
3. Control Rig IK solve
4. Control Rig tail physics update
5. Control Rig posture modifier application
6. Final pose output

---

## Validation Checklist

Before finalizing the Animation Blueprint:

- ✅ All state transitions tested (no stuck states)
- ✅ Blend spaces interpolate smoothly (no popping)
- ✅ Tail sway updates in real-time (visual test)
- ✅ Digitigrade IK maintains toe ground contact
- ✅ Hit-stop applies on successful hits (2-6 frames)
- ✅ Dodge i-frames active at correct timing (frames 5-14)
- ✅ Memory layer posture changes are smooth (no snapping)
- ✅ Combo windows are consistent (not too tight/loose)
- ✅ Landing VFX spawn at correct timing
- ✅ Animation Blueprint compiles without errors

---

## Next Steps

1. **Create Animation Assets:** Import animations for each state
2. **Setup Blend Spaces:** Create `BS_Locomotion_Direction` and `BS_TailSway_Speed`
3. **Implement Control Rig:** See `Source/KaiJax/Animation/KaiJaxControlRig.cpp`
4. **Configure IK:** See `docs/UE5_IK_SETUP.md`
5. **Test in PIE:** Play-in-Editor testing for all states
6. **Performance Profile:** Ensure animation system runs at 60 FPS minimum

---

**Canonical Authority:** This document enforces the animation rules from `kai_jax.character.json` and `README_CANON.md`. The animation system must preserve mass, inertia, and hit-stop timing across all platforms.

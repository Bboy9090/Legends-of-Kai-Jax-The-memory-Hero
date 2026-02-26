# UE5 Physics Asset Configuration - Kai-Jax

**Version:** 1.0.0  
**Last Updated:** 2026-01-27  
**Canonical Reference:** `kai_jax.character.json`

## Overview

This document defines the Physics Asset configuration for Kai-Jax's skeletal mesh. The physics system supports simulated tail physics while maintaining kinematic control over the body for animation-driven gameplay.

**GOVERNANCE COMPLIANCE:**
- Tail count: 9 (immutable, from lockfile)
- Tail physics: Enabled with constraints (no noodle physics)
- Body: Kinematic (animation-controlled, not ragdoll)
- Platform consistency: Physics behavior must be identical across all platforms

---

## Physics Asset Creation

### Initial Setup

1. **Open Skeletal Mesh:** `SK_KaiJax` (or your skeletal mesh asset)
2. **Create Physics Asset:**
   - Right-click skeletal mesh → Create → Physics Asset
   - Name: `PHYS_KaiJax`
   - Use default generation settings as starting point
3. **Modify Auto-Generated Bodies:** Follow configurations below

---

## Body Physics Configuration

### 1. Core Body Bones (Kinematic)

**Purpose:** Core body bones are animation-controlled and do not simulate physics. They provide collision for gameplay but follow animation exactly.

#### Pelvis (Root)
- **Shape:** Box
- **Dimensions:** 30cm × 25cm × 40cm (adjust to fit mesh)
- **Physics Type:** Kinematic
- **Collision Enabled:** Yes (Query Only)
- **Collision Channel:** Pawn
- **Simulate Physics:** No
- **Enable Gravity:** No
- **Notes:** Root bone, parent of all body motion

#### Spine_01 and Spine_02
- **Shape:** Capsule (vertical)
- **Dimensions:**
  - Spine_01: Radius 15cm, Length 25cm
  - Spine_02: Radius 14cm, Length 22cm
- **Physics Type:** Kinematic
- **Collision Enabled:** Yes (Query Only)
- **Collision Channel:** Pawn
- **Simulate Physics:** No
- **Enable Gravity:** No
- **Notes:** Spine follows animation, allows posture control via Control Rig

---

### 2. Head and Neck (Kinematic)

#### Neck_01
- **Shape:** Capsule (vertical)
- **Dimensions:** Radius 8cm, Length 15cm
- **Physics Type:** Kinematic
- **Collision Enabled:** Yes (Query Only)
- **Collision Channel:** Pawn
- **Simulate Physics:** No

#### Head
- **Shape:** Sphere
- **Dimensions:** Radius 18cm (adjust to fit head mesh)
- **Physics Type:** Kinematic
- **Collision Enabled:** Yes (Query Only)
- **Collision Channel:** Pawn
- **Simulate Physics:** No
- **Notes:** Head follows animation for facial expressions and look-at

#### Jaw, Ears
- **Shape:** None (no physics bodies)
- **Notes:** Jaw and ears are animated only, no collision needed

---

### 3. Arms and Hands (Kinematic)

**Purpose:** Arms are animation-controlled for combat precision. Collision is enabled for melee hit detection.

#### Shoulders (Shoulder_L, Shoulder_R)
- **Shape:** Sphere
- **Dimensions:** Radius 10cm
- **Physics Type:** Kinematic
- **Collision Enabled:** Yes (Query Only)
- **Collision Channel:** Pawn

#### Arms (Arm_L, Arm_R)
- **Shape:** Capsule (horizontal)
- **Dimensions:** Radius 6cm, Length 28cm
- **Physics Type:** Kinematic
- **Collision Enabled:** Yes (Query Only)
- **Collision Channel:** Pawn

#### Forearms (Forearm_L, Forearm_R)
- **Shape:** Capsule (horizontal)
- **Dimensions:** Radius 5cm, Length 25cm
- **Physics Type:** Kinematic
- **Collision Enabled:** Yes (Query Only)
- **Collision Channel:** Pawn

#### Hands (Hand_L, Hand_R)
- **Shape:** Box
- **Dimensions:** 8cm × 5cm × 12cm
- **Physics Type:** Kinematic
- **Collision Enabled:** Yes (Query and Physics)
- **Collision Channel:** Pawn
- **Notes:** Hands have full collision for punch hit detection

#### Fingers
- **Shape:** None (no physics bodies)
- **Notes:** Finger bones are animated only, no individual collision

---

### 4. Legs (Kinematic - Digitigrade)

**Purpose:** Legs are animation-controlled with IK. No ragdoll physics to maintain precise digitigrade posture.

#### Thighs (Thigh_L, Thigh_R)
- **Shape:** Capsule (angled)
- **Dimensions:** Radius 10cm, Length 40cm
- **Physics Type:** Kinematic
- **Collision Enabled:** Yes (Query Only)
- **Collision Channel:** Pawn
- **Simulate Physics:** No
- **Notes:** Thigh angle follows digitigrade bend via IK

#### Calves (Calf_L, Calf_R)
- **Shape:** Capsule (angled)
- **Dimensions:** Radius 8cm, Length 35cm
- **Physics Type:** Kinematic
- **Collision Enabled:** Yes (Query Only)
- **Collision Channel:** Pawn
- **Simulate Physics:** No
- **Notes:** Calf follows IK solver for ground contact

#### Feet (Foot_L, Foot_R)
- **Shape:** Capsule (horizontal)
- **Dimensions:** Radius 6cm, Length 18cm
- **Physics Type:** Kinematic
- **Collision Enabled:** Yes (Query and Physics)
- **Collision Channel:** Pawn
- **Simulate Physics:** No
- **Notes:** Foot is IK effector target for ground contact

#### Toes (Toe_L, Toe_R)
- **Shape:** Box
- **Dimensions:** 8cm × 5cm × 10cm
- **Physics Type:** Kinematic
- **Collision Enabled:** Yes (Query and Physics)
- **Collision Channel:** Pawn
- **Simulate Physics:** No
- **Notes:** Toes are primary ground contact point for digitigrade stance

---

### 5. Tail Bones (Simulated Physics)

**Purpose:** All 9 tails simulate physics with constraints. This is the ONLY part of the character with dynamic physics.

**CRITICAL:** Per `kai_jax.character.json`, tail physics MUST be enabled with the following constraints:
- `"physics_enabled": true`
- `"constraints.noodle_physics": false` (maintain rigidity)

#### Tail Root (Tail_Root_01)
- **Shape:** Sphere
- **Dimensions:** Radius 8cm
- **Physics Type:** Kinematic (anchors tail chain to pelvis)
- **Collision Enabled:** No
- **Simulate Physics:** No
- **Notes:** Root attachment point, not simulated

#### Individual Tail Base Bones (Tail_01 through Tail_09)

**All 9 tail base bones share these properties:**

- **Shape:** Capsule (horizontal, toward tip)
- **Dimensions:** Radius 5cm, Length 15cm
- **Physics Type:** Simulated
- **Collision Enabled:** Yes (Query and Physics)
- **Collision Channel:** TailPhysics (custom channel, or Pawn)
- **Simulate Physics:** Yes
- **Enable Gravity:** Yes
- **Mass:** 0.5 kg (light, responsive to motion)
- **Linear Damping:** 0.5
- **Angular Damping:** 0.7

**Constraint to Parent (Tail_Root_01):**
- **Constraint Type:** Limited Cone
- **Swing 1 Limit:** 60° (left/right sway)
- **Swing 2 Limit:** 60° (up/down sway)
- **Twist Limit:** 30° (rotation around tail axis)
- **Soft Constraint:** No (maintain firm connection)
- **Linear Limits:** Locked (no position offset from parent)
- **Angular Drives:** None (pure constraint-based)

#### Tail Segment Bones (Tail_XX_Bone_01 through Tail_XX_Bone_05)

**Each tail has 5 segment bones (45 total across 9 tails). All share these properties:**

- **Shape:** Capsule (horizontal, tapering toward tip)
- **Dimensions:**
  - Bone_01 (base): Radius 4.5cm, Length 12cm
  - Bone_02: Radius 4cm, Length 12cm
  - Bone_03: Radius 3.5cm, Length 12cm
  - Bone_04: Radius 3cm, Length 12cm
  - Bone_05 (tip): Radius 2.5cm, Length 10cm
- **Physics Type:** Simulated
- **Collision Enabled:** Yes (Query and Physics)
- **Collision Channel:** TailPhysics
- **Simulate Physics:** Yes
- **Enable Gravity:** Yes
- **Mass:** 0.3 kg (decreases toward tip for natural taper)
- **Linear Damping:** 0.5
- **Angular Damping:** 0.7

**Constraint to Parent (Previous Tail Segment):**
- **Constraint Type:** Limited Hinge + Twist
- **Swing 1 Limit:** 45° (left/right bend)
- **Swing 2 Limit:** 45° (up/down bend)
- **Twist Limit:** 20° (reduced twist at segments)
- **Soft Constraint:** No
- **Linear Limits:** Locked
- **Angular Drives:** None

**Constraint Stiffness Progression:**
- Bone_01 (base): Full constraint limits (45° swing)
- Bone_02: 45° swing
- Bone_03: 50° swing (slight increase toward tip)
- Bone_04: 50° swing
- Bone_05 (tip): 55° swing (most flexible)

**Mass Progression:**
- Bone_01 (base): 0.4 kg
- Bone_02: 0.35 kg
- Bone_03: 0.3 kg
- Bone_04: 0.25 kg
- Bone_05 (tip): 0.2 kg

---

## Collision Channels

### Standard Pawn Channel
- **Body bones:** Collide with environment, enemies, and projectiles
- **Response:** Block All (standard character collision)

### TailPhysics Channel (Custom)

**Create Custom Collision Channel:**
1. Project Settings → Collision → New Object Channel
2. Name: `TailPhysics`
3. Default Response: Ignore

**Collision Response Matrix:**
- **Ignore:** WorldStatic, WorldDynamic, Pawn (self), OtherTails
- **Overlap:** Enemy (optional, for tail attack detection)
- **Block:** None (tails pass through environment to avoid snagging)

**Rationale:** Tails should not collide with the environment or self-body to prevent physics glitches. They can overlap with enemies for tail-based attack detection (e.g., Tail_03 Thread ability).

**Alternative (Simpler):**
If custom channel is not desired, use **Pawn** channel with:
- **Self Collision:** Disabled (ignore own body and other tails)
- **Environment Collision:** Disabled (pass through world)

---

## Collision Filtering

### Self-Collision Rules
- **Body ↔ Body:** No collision (kinematic bones don't collide with each other)
- **Body ↔ Tails:** No collision (tails ignore own body)
- **Tail ↔ Tail:** No collision (tails ignore each other to prevent tangling)

**Implementation:**
- Set `bNoCollision = false` for all tail bodies
- Use Collision Filtering Groups:
  - Group 1: Body (Pelvis, Spine, Limbs, Head)
  - Group 2: Tails (all tail bones)
  - Disable collision between Group 2 and Group 1/2

---

## Physics Solver Settings

### Physics Asset Settings (Global)

- **Solver Iterations:** 8 (default, sufficient for tails)
- **Solver Subdivision:** 2 (smooth constraint solving)
- **Max Angular Velocity:** 720°/s (prevent excessive spin)
- **Max Linear Velocity:** 1000 cm/s (prevent tail launching)
- **Stabilization Threshold Multiplier:** 1.0 (default)

### Per-Tail Physics Material

**Create Physics Material:** `PM_TailPhysics`

- **Friction:** 0.2 (low, tails slide easily)
- **Restitution:** 0.1 (minimal bounce)
- **Density:** 0.5 g/cm³ (light, flexible material)

**Apply to All Tail Bodies:**
1. Select all tail physics bodies
2. Assign `PM_TailPhysics` in Simple Collision Physical Material

---

## Tail Physics Behavior Validation

### Expected Behavior

**Idle:**
- Tails sway gently with breathing animation
- Slight oscillation (< 5° swing)
- Natural rest position (arced outward and upward)

**Walking:**
- Tails sway side-to-side with stride rhythm
- Amplitude increases with speed
- Tails lag behind movement direction (momentum)

**Running:**
- Tails stream behind character (high momentum lag)
- Large amplitude sway (up to 30° from neutral)
- Smooth motion, no jittering

**Combat:**
- Tails respond to quick turns and dodges (snappy motion)
- Tails whip in opposite direction of dodge (conservation of momentum)
- Tails recover to aggressive arc position (forward and upward)

**Falling:**
- Tails drag upward (air resistance)
- Tails splay outward (natural spread)
- Smooth motion, no violent snapping

---

## Performance Considerations

### Physics Cost

**Per-Frame Physics Simulation:**
- 9 tails × 5 bones = 45 simulated bodies
- 9 root constraints + 36 segment constraints = 45 constraints
- Estimated cost: ~1.5ms on mid-range hardware (UE5 physics solver)

**Optimization:**
- LOD1 (medium distance): Reduce to 3 bones per tail (27 bodies)
- LOD2 (far distance): Disable tail physics simulation (kinematic fallback)
- Tail physics LOD threshold: 15 meters from camera

### Mobile Profile

Per `kai_jax.character.json`, tail physics is allowed on mobile but may be reduced:

**Mobile Optimization (Optional):**
- Reduce bones per tail: 3 instead of 5 (27 total bodies)
- Increase damping: Linear 0.7, Angular 0.9 (smoother, less jittery)
- Reduce solver iterations: 4 instead of 8

**NEVER CUT:**
- Tail count (must remain 9)
- Tail visual presence (can be kinematic animated if physics too expensive)

---

## Testing Checklist

Before finalizing the Physics Asset:

- ✅ All 9 tail base bones have physics bodies (Tail_01 through Tail_09)
- ✅ Each tail has 5 segment bones with physics (45 total simulated bodies)
- ✅ Tail constraints prevent impossible bends (swing limits active)
- ✅ Tails do not collide with own body (self-collision disabled)
- ✅ Tails do not collide with each other (tail-to-tail collision disabled)
- ✅ Tails do not snag on environment (TailPhysics channel set to Ignore WorldStatic)
- ✅ Tail motion is smooth, not jittery (damping values correct)
- ✅ Tails respond to character movement (sway, lag, whip effects visible)
- ✅ Body bones are kinematic (Pelvis, Spine, Limbs, Head do not simulate)
- ✅ Digitigrade legs maintain animation control (no ragdoll leg physics)

---

## Integration with Control Rig

The Physics Asset works in tandem with `UKaiJaxControlRig` (see `Source/KaiJax/Animation/KaiJaxControlRig.cpp`).

**Control Rig Influence on Tail Physics:**
- Control Rig can apply **animation-driven forces** to tail base bones
- Control Rig sets `TailSwayAmount` and `TailSwaySpeed` parameters
- Physics simulation blends with animation (blend 0.0 = pure animation, 1.0 = pure physics)

**Typical Blend Values:**
- Idle: 0.9 (mostly physics, slight animation influence)
- Walking: 0.8 (physics + rhythmic animation)
- Running: 0.7 (physics + strong animation drive)
- Combat: 0.6 (more animation control for precise tail positioning)
- Special Attacks: 0.0-0.3 (high animation control for tail abilities)

---

## Troubleshooting

### Issue: Tails jitter or vibrate rapidly
**Solution:** Increase Angular Damping to 0.8-0.9, or reduce physics substeps

### Issue: Tails stretch or separate from body
**Solution:** Ensure Linear Limits on constraints are **Locked** (no position offset)

### Issue: Tails snap to extreme angles
**Solution:** Verify Swing/Twist limits are set correctly (45-60° max)

### Issue: Tails collide with own body
**Solution:** Disable self-collision in Collision Filtering (Body Group ↔ Tail Group = Ignore)

### Issue: Tails get stuck in environment
**Solution:** Set TailPhysics channel to **Ignore** WorldStatic and WorldDynamic

### Issue: Tail physics cost too high (< 60 FPS)
**Solution:** Reduce solver iterations to 4, or implement tail physics LOD

---

## Next Steps

1. **Apply Physics Asset to Skeletal Mesh:** Assign `PHYS_KaiJax` to `SK_KaiJax`
2. **Test in PIE:** Play-in-Editor and verify tail physics behavior
3. **Tune Constraint Limits:** Adjust swing/twist limits to match desired tail flexibility
4. **Implement Control Rig:** See `Source/KaiJax/Animation/KaiJaxControlRig.cpp`
5. **Profile Performance:** Measure physics cost and optimize if needed
6. **Create Tail Physics LOD:** Implement LOD system for distant characters

---

**Canonical Authority:** This Physics Asset configuration enforces the tail physics rules from `kai_jax.character.json` and `README_CANON.md`. All 9 tails must simulate physics with constraints (no noodle physics).

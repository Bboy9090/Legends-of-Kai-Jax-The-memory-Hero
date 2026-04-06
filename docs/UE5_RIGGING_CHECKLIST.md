# UE5 Rigging Validation Checklist - Kai-Jax

**Version:** 1.0.0  
**Last Updated:** 2026-01-27  
**Canonical Reference:** `kai_jax.character.json`, `README_CANON.md`

## Overview

This checklist validates that the Kai-Jax skeletal mesh, Control Rig, Animation Blueprint, and Physics Asset are correctly configured and comply with canonical requirements.

**USE THIS CHECKLIST BEFORE MERGING ANY RIGGING PR.**

---

## Section 1: Skeletal Mesh Validation

### Bone Structure

- [ ] **All 9 tail bones present** (`Tail_01` through `Tail_09`)
- [ ] **Each tail has 5 segment bones** (`Tail_XX_Bone_01` through `Tail_XX_Bone_05`)
- [ ] **Total tail bones: 45** (9 tails × 5 bones)
- [ ] **Tail Root bone present** (`Tail_Root_01`, parent of all tails)
- [ ] **Tail names match functional roles** (Tail_01 = Bond, Tail_02 = Hunter, etc.)

### Digitigrade Leg Structure

- [ ] **Legs are digitigrade** (Thigh → Calf → Foot → Toe hierarchy)
- [ ] **Thigh-Calf angle is ~135°** (backward bend at "knee")
- [ ] **Calf-Foot angle is ~90°** (forward bend at "ankle")
- [ ] **Toe bones present** (ground contact points)
- [ ] **IK target bones present** (`IK_Target_LeftFoot`, `IK_Target_RightFoot`)

### Core Skeleton

- [ ] **Spine has 2 segments** (`Spine_01`, `Spine_02`)
- [ ] **Neck and head bones present** (`Neck_01`, `Head`)
- [ ] **Jaw bone present** (for facial animation)
- [ ] **Ear bones present** (`Ear_L`, `Ear_R`)
- [ ] **Hand bones include fingers and thumbs** (4 fingers + thumb per hand)

### Bone Naming Conventions

- [ ] **Bone names follow convention** (e.g., `_L` suffix for left, `_R` for right)
- [ ] **No extra or missing bones** (hierarchy matches documentation)
- [ ] **T-pose is neutral and symmetric** (arms out, legs straight)

---

## Section 2: Physics Asset Validation

### Body Physics Bodies

- [ ] **Pelvis is kinematic** (box, no physics simulation)
- [ ] **Spine bones are kinematic** (capsules, no physics simulation)
- [ ] **Head is kinematic** (sphere, no physics simulation)
- [ ] **Arms and hands are kinematic** (capsules/boxes, no physics simulation)
- [ ] **Legs are kinematic** (capsules, no ragdoll, animation-controlled)

### Tail Physics Bodies

- [ ] **All 9 tail base bones have physics bodies** (`Tail_01` through `Tail_09`)
- [ ] **All 45 tail segment bones have physics bodies** (`Tail_XX_Bone_01` through `Tail_XX_Bone_05`)
- [ ] **Tail physics bodies are set to "Simulated"** (not kinematic)
- [ ] **Gravity enabled on all tail bones**
- [ ] **Linear damping: 0.5** (on all tail bones)
- [ ] **Angular damping: 0.7** (on all tail bones)

### Tail Physics Constraints

- [ ] **Each tail has constraint to Tail_Root** (cone constraint, swing limits)
- [ ] **Each tail segment has constraint to parent** (hinge + twist constraint)
- [ ] **Swing limits: 45-60°** (no over-bending)
- [ ] **Twist limits: 20-30°** (no excessive rotation)
- [ ] **No soft constraints** (firm connections, no springiness)
- [ ] **No noodle physics** (tails maintain rigidity per canonical rules)

### Collision Configuration

- [ ] **Body bones use Pawn collision channel**
- [ ] **Tail bones use TailPhysics channel** (or Pawn with self-collision disabled)
- [ ] **Self-collision disabled** (body ↔ tails, tail ↔ tail)
- [ ] **Tails ignore environment collision** (pass through WorldStatic)
- [ ] **Tails can overlap enemies** (optional, for tail attack detection)

---

## Section 3: Control Rig Validation

### Control Rig Class

- [ ] **`UKaiJaxControlRig` class exists** (`Source/KaiJax/Animation/KaiJaxControlRig.h`)
- [ ] **Control Rig compiles without errors**
- [ ] **Control Rig inherits from `UControlRig`**

### Digitigrade IK Implementation

- [ ] **`UpdateDigitegradeIK()` function implemented**
- [ ] **IK solver uses Two-Bone IK** (Thigh → Calf → Foot)
- [ ] **IK targets positioned at toe contact points**
- [ ] **Digitigrade angle parameter present** (`DigitegradeAngle`, 0-45°)
- [ ] **IK can be enabled/disabled** (`bEnableFootIK` parameter)

### Tail Physics Implementation

- [ ] **`UpdateTailPhysics()` function implemented**
- [ ] **Tail sway parameters present** (`TailSwayAmount`, `TailSwaySpeed`)
- [ ] **Tail sway increases with movement speed**
- [ ] **Tail physics can be enabled/disabled** (`bEnableTailPhysics` parameter)
- [ ] **Tail oscillation direction influenced by character facing**

### Memory Layer Integration

- [ ] **`ApplyMemoryPostureModifier()` function implemented**
- [ ] **`ActiveMemoryLayers` parameter present** (int, 3-9)
- [ ] **`MemoryInfluenceOnPosture` parameter present** (float, 0-1)
- [ ] **Posture changes based on memory layers** (spine, shoulders, head, tails)

---

## Section 4: Animation Blueprint Validation

### State Machine

- [ ] **All states present** (Idle, Walking, Running, Combat_Idle, Attack, Dodge, Falling, Landing)
- [ ] **State transitions work correctly** (no stuck states)
- [ ] **State transition conditions are logical** (e.g., Idle → Walking when velocity > 50)

### Blend Spaces

- [ ] **`BS_Locomotion_Direction` blend space exists**
- [ ] **Locomotion blend space has X/Y axes** (Forward/Back, Strafe L/R)
- [ ] **Locomotion blend space interpolates smoothly** (no animation popping)
- [ ] **`BS_TailSway_Speed` blend space exists** (optional, for tail animation)

### Animation Variables

- [ ] **`MovementDirection` variable present** (Vector2D)
- [ ] **`MovementVelocity` variable present** (Vector)
- [ ] **`IsFalling` variable present** (bool)
- [ ] **`IsGrounded` variable present** (bool)
- [ ] **`IsInCombat` variable present** (bool)
- [ ] **`ActiveMemoryLayers` variable present** (int, 3-9)
- [ ] **`DigitegradeAngle` variable present** (float, 0-45°)

### Control Rig Integration

- [ ] **Control Rig node in AnimGraph** (outputs final pose)
- [ ] **Control Rig class set to `UKaiJaxControlRig`**
- [ ] **Control Rig `bEnableFootIK` enabled** (true)
- [ ] **Control Rig `bEnableTailPhysics` enabled** (true)

---

## Section 5: Visual Validation (In-Engine Testing)

### Idle State

- [ ] **Tails sway gently** (slow, natural breathing rhythm)
- [ ] **Digitigrade legs maintain posture** (toes on ground, slight bend)
- [ ] **Spine posture changes with memory layers** (3 tails = cautious, 9 tails = confident)
- [ ] **Character is stable** (no jittering or shaking)

### Walking

- [ ] **Tails sway with stride rhythm** (increase with speed)
- [ ] **Digitigrade angle adjusts** (~15° bend)
- [ ] **Feet maintain ground contact** (no sliding)
- [ ] **IK adapts to slopes** (feet align with ground)

### Running

- [ ] **Tails stream behind character** (high momentum lag)
- [ ] **Digitigrade angle increases** (~30° bend)
- [ ] **Tail sway at maximum amplitude** (visual feedback of speed)
- [ ] **No foot sliding on flat terrain**

### Combat Idle

- [ ] **Tails held in aggressive arc** (forward and outward)
- [ ] **Digitigrade angle at maximum** (45° combat ready)
- [ ] **Posture changes with memory layers** (high = aggressive, low = defensive)
- [ ] **Character feels tense and ready** (not relaxed)

### Attack

- [ ] **Tails move in sync with attack** (forward for punches, upward for kicks)
- [ ] **Hit-stop on successful hit** (2-6 frames freeze)
- [ ] **IK blends out during attack** (animation control, not full IK)
- [ ] **Attack animations are not floaty** (mass and inertia preserved)

### Dodge

- [ ] **Tails whip in opposite direction** (momentum conservation)
- [ ] **Tails snap back after dodge** (spring-back effect)
- [ ] **Dodge timing feels responsive** (6 frame input response)
- [ ] **i-frames active at correct timing** (frames 5-14)

### Falling

- [ ] **Tails drag upward** (air resistance simulation)
- [ ] **Tails splay outward** (natural spread)
- [ ] **No violent tail snapping** (smooth motion)
- [ ] **Legs pull up toward body** (natural falling pose)

### Landing

- [ ] **Tails slam downward on impact** (absorb shock visually)
- [ ] **Tails spring back to neutral** (over landing duration)
- [ ] **Dust VFX spawns at feet** (impact feedback)
- [ ] **IK fades in smoothly** (no foot snapping)

---

## Section 6: Canonical Compliance

### Tail Count Enforcement

- [ ] **9 tails present in skeleton** (immutable, from lockfile)
- [ ] **9 tails rendered in-game** (all visible)
- [ ] **Tails cannot be skipped or removed** (sequential unlock 3→4→5→6→7→8→9)
- [ ] **Tail roles match lockfile** (Tail_01 = Bond, Tail_02 = Hunter, etc.)

### Evolution System

- [ ] **Starting tails: 3** (const, from lockfile)
- [ ] **Final tails: 9** (const, from lockfile)
- [ ] **Unlock rule: Sequential only** (no skipping)
- [ ] **Tails are permanent** (cannot be removed after unlock)

### Memory Layer Integration

- [ ] **Memory layers influence posture** (3 tails = cautious, 9 tails = dominant)
- [ ] **Memory layers affect tail arc height** (higher = more aggressive)
- [ ] **Memory layers change combat stance** (confidence scales with tails)
- [ ] **Memory layer changes are smooth** (no instant snapping)

### Animation Philosophy

- [ ] **No floaty motion** (mass and inertia preserved)
- [ ] **Hit-stop on impact** (2-6 frames)
- [ ] **Digitigrade legs maintained** (no plantigrade fallback)
- [ ] **Tail count never reduced** (9 tails always present, even if not unlocked yet)

### Cross-Platform Consistency

- [ ] **Tail count identical on mobile** (9 tails, no reduction)
- [ ] **Digitigrade posture identical on mobile** (no simplification)
- [ ] **Hit-stop timing identical on mobile** (2-6 frames)
- [ ] **Animation timing identical on mobile** (no speed changes)

---

## Section 7: Performance Validation

### Physics Performance

- [ ] **Tail physics cost < 2ms per frame** (60 FPS target)
- [ ] **Physics solver stable** (no jittering or explosions)
- [ ] **Tail LOD implemented** (reduce bones at distance, if needed)
- [ ] **Physics substeps appropriate** (2-4 substeps)

### IK Performance

- [ ] **IK solve cost < 0.5ms per frame**
- [ ] **Ground traces optimized** (async or reduced frequency)
- [ ] **IK LOD considered** (disable IK for distant characters)

### Animation Blueprint Performance

- [ ] **AnimGraph cost < 1ms per frame**
- [ ] **Blend space evaluation smooth** (no hitches)
- [ ] **Control Rig execution time acceptable** (< 1ms)
- [ ] **Overall animation system cost < 3ms** (budget for 60 FPS)

---

## Section 8: Build Validation

### Schema Validation

- [ ] **Character data validates against `character.schema.json`**
- [ ] **Tail count matches `kai_jax.character.json` (9)**
- [ ] **Evolution constraints enforced** (sequential_only, skip_unlocks_disallowed)

### Build Errors

- [ ] **No compilation errors in Control Rig class**
- [ ] **No blueprint errors in Animation Blueprint**
- [ ] **No asset import errors**
- [ ] **Physics Asset generates without warnings**

---

## Section 9: Acceptance Criteria (Final Gate)

**These are the canonical acceptance criteria from `kai_jax.character.json`. ALL must pass.**

- [ ] **Silhouette match:** Character silhouette matches reference (9-tail crescent arc)
- [ ] **Tail independence visible:** All 9 tails move independently (physics simulation)
- [ ] **Armor reads worn:** Armor materials have edge wear, not clean (not applicable to rigging, but note for materials)
- [ ] **Idle feels dangerous:** Idle posture conveys power and readiness
- [ ] **Combat weight preserved:** Attacks feel impactful, not floaty (mass and inertia)

---

## Checklist Completion

**Date Validated:** ___________  
**Validated By:** ___________  
**Build/Commit:** ___________

**Status:**
- [ ] All sections passed
- [ ] Ready for merge
- [ ] Canonical compliance verified

**Notes:**
_______________________________________________________________________
_______________________________________________________________________
_______________________________________________________________________

---

**Canonical Authority:** This checklist enforces the rigging requirements from `kai_jax.character.json` and `README_CANON.md`. All checks must pass before rigging PR can be merged.

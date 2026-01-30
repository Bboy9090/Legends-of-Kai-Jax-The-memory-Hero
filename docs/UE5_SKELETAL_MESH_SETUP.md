# UE5 Skeletal Mesh Setup - Kai-Jax

**Version:** 1.0.0  
**Last Updated:** 2026-01-27  
**Canonical Reference:** `kai_jax.character.json`

## Overview

This document defines the skeletal mesh bone structure for Kai-Jax in Unreal Engine 5. The rig supports digitigrade legs, 9-tail physics simulation, and memory-influenced posture systems.

**GOVERNANCE COMPLIANCE:**
- Tail count: 9 (immutable, from lockfile)
- Evolution: Sequential 3→4→5→6→7→8→9 (enforced)
- Rigging must support tail physics and constraints per `kai_jax.character.json`

---

## Bone Structure Hierarchy

```
Root (Pelvis)
├── Spine_01
│   ├── Spine_02
│   │   ├── Neck_01
│   │   │   └── Head
│   │   │       ├── Jaw
│   │   │       ├── Ear_L
│   │   │       └── Ear_R
│   │   ├── Shoulder_L
│   │   │   ├── Arm_L
│   │   │   ├── Forearm_L
│   │   │   └── Hand_L
│   │   │       ├── Finger_01_L
│   │   │       ├── Finger_02_L
│   │   │       ├── Finger_03_L
│   │   │       ├── Finger_04_L
│   │   │       └── Thumb_L
│   │   └── Shoulder_R
│   │       ├── Arm_R
│   │       ├── Forearm_R
│   │       └── Hand_R
│   │           ├── Finger_01_R
│   │           ├── Finger_02_R
│   │           ├── Finger_03_R
│   │           ├── Finger_04_R
│   │           └── Thumb_R
├── Thigh_L (Digitigrade)
│   ├── Calf_L
│   ├── Foot_L
│   └── Toe_L
├── Thigh_R (Digitigrade)
│   ├── Calf_R
│   ├── Foot_R
│   └── Toe_R
├── Tail_Root_01
│   ├── Tail_01 (Bond - Parry/Counter/Revive)
│   │   ├── Tail_01_Bone_01
│   │   ├── Tail_01_Bone_02
│   │   ├── Tail_01_Bone_03
│   │   ├── Tail_01_Bone_04
│   │   └── Tail_01_Bone_05
│   ├── Tail_02 (Hunter - Dash/Pursuit/Execute)
│   │   ├── Tail_02_Bone_01
│   │   ├── Tail_02_Bone_02
│   │   ├── Tail_02_Bone_03
│   │   ├── Tail_02_Bone_04
│   │   └── Tail_02_Bone_05
│   ├── Tail_03 (Thread - Web/Pull/Group)
│   │   ├── Tail_03_Bone_01
│   │   ├── Tail_03_Bone_02
│   │   ├── Tail_03_Bone_03
│   │   ├── Tail_03_Bone_04
│   │   └── Tail_03_Bone_05
│   ├── Tail_04 (Quill - Retaliation/Posture Damage) [UNLOCKABLE]
│   │   ├── Tail_04_Bone_01
│   │   ├── Tail_04_Bone_02
│   │   ├── Tail_04_Bone_03
│   │   ├── Tail_04_Bone_04
│   │   └── Tail_04_Bone_05
│   ├── Tail_05 (Shade - Stealth/Threat Reset) [UNLOCKABLE]
│   │   ├── Tail_05_Bone_01
│   │   ├── Tail_05_Bone_02
│   │   ├── Tail_05_Bone_03
│   │   ├── Tail_05_Bone_04
│   │   └── Tail_05_Bone_05
│   ├── Tail_06 (Anchor - Anti-Knockback/Root) [UNLOCKABLE]
│   │   ├── Tail_06_Bone_01
│   │   ├── Tail_06_Bone_02
│   │   ├── Tail_06_Bone_03
│   │   ├── Tail_06_Bone_04
│   │   └── Tail_06_Bone_05
│   ├── Tail_07 (Echo - After-image/Repeat) [UNLOCKABLE]
│   │   ├── Tail_07_Bone_01
│   │   ├── Tail_07_Bone_02
│   │   ├── Tail_07_Bone_03
│   │   ├── Tail_07_Bone_04
│   │   └── Tail_07_Bone_05
│   ├── Tail_08 (Rift - Reality Tear/AOE) [UNLOCKABLE]
│   │   ├── Tail_08_Bone_01
│   │   ├── Tail_08_Bone_02
│   │   ├── Tail_08_Bone_03
│   │   ├── Tail_08_Bone_04
│   │   └── Tail_08_Bone_05
│   └── Tail_09 (Crown - Aura/Command) [UNLOCKABLE]
│       ├── Tail_09_Bone_01
│       ├── Tail_09_Bone_02
│       ├── Tail_09_Bone_03
│       ├── Tail_09_Bone_04
│       └── Tail_09_Bone_05
└── IK_Target_LeftFoot
└── IK_Target_RightFoot
```

---

## Import Settings (Critical)

### FBX Import Configuration

**File Format:**
- Format: FBX 2020 or later
- Units: Centimeters (UE5 standard)
- Axis: Z-up, Y-forward

**Skeletal Mesh Settings:**
- ✅ Import Skeletal Mesh: **YES**
- ✅ Import Normals: **YES**
- ✅ Import Tangents: **YES**
- ✅ Recompute Normals: **NO** (preserve source)
- ✅ Recompute Tangents: **NO** (preserve source)
- ✅ Use T0 as Ref Pose: **YES**
- ✅ Preserve Smoothing Groups: **YES**

**Physics Asset:**
- ✅ Create Physics Asset: **YES**
- Physics Asset Creation: **Auto-generate** (modify after import)

**Animation:**
- ❌ Import Animations: **NO** (import separately)
- ❌ Import Custom Attribute: **NO**
- ❌ Delete Existing Morph Target Curves: **NO**

**Materials:**
- Material Import Method: **Create New Materials**
- Import Textures: **YES**
- Invert Normal Maps: **NO** (source should be correct)

**Skeletal Mesh LOD Settings:**
- Number of LODs: 3 (LOD0, LOD1, LOD2)
- LOD0: Full quality (80,000-120,000 tris per `kai_jax.character.json`)
- LOD1: Medium quality (50,000-70,000 tris)
- LOD2: Low quality (25,000-35,000 tris)

---

## Bone Naming Conventions

### Standard Bones
- **Root:** `Root` or `Pelvis`
- **Spine:** `Spine_01`, `Spine_02`
- **Limbs:** `Arm_L`, `Forearm_L`, `Hand_L` (suffix `_L` for left, `_R` for right)
- **Legs:** `Thigh_L`, `Calf_L`, `Foot_L`, `Toe_L`

### Tail Bones (CANONICAL)
- **Root:** `Tail_Root_01` (parent of all tails)
- **Individual Tails:** `Tail_01` through `Tail_09`
- **Tail Segments:** `Tail_01_Bone_01` through `Tail_01_Bone_05` (5 bones per tail)
- **Total Tail Bones:** 9 tails × 5 bones = **45 tail bones**

**IMPORTANT:** Tail naming MUST match the functional roles defined in `kai_jax.character.json`:
- Tail_01 = Bond (Parry/Counter/Revive)
- Tail_02 = Hunter (Dash/Pursuit/Execute)
- Tail_03 = Thread (Web/Pull/Group)
- Tail_04 = Quill (Retaliation/Posture Damage)
- Tail_05 = Shade (Stealth/Threat Reset)
- Tail_06 = Anchor (Anti-Knockback/Root)
- Tail_07 = Echo (After-image/Repeat)
- Tail_08 = Rift (Reality Tear/AOE)
- Tail_09 = Crown (Aura/Command)

### IK Targets
- **Left Foot:** `IK_Target_LeftFoot`
- **Right Foot:** `IK_Target_RightFoot`
- **Note:** IK targets are virtual bones, not skinned bones

---

## Digitigrade Leg Configuration

**Leg Structure:**
```
Thigh (upper leg, angled backward)
  └── Calf (lower leg, angled forward)
      └── Foot (elongated, acts as second lower leg segment)
          └── Toe (ground contact point)
```

**Key Angles:**
- Thigh-Calf angle: ~135° (backward bend)
- Calf-Foot angle: ~90° (forward bend)
- Foot-Toe angle: ~170° (slight upward angle)
- **Standing digitigrade angle:** 0° (neutral stance)
- **Crouched digitigrade angle:** 45° (combat-ready)

**IK Considerations:**
- IK solver must maintain **toe ground contact** as primary goal
- Foot should align with ground normal
- Calf bend angle adjusts based on movement speed
- Thigh rotation compensates for pelvis height changes

---

## Tail Physics Requirements

Per `kai_jax.character.json`, each tail must have:

**Physics Properties:**
- ✅ **Physics Simulation:** Enabled (gravity + constraints)
- ✅ **Bones per Tail:** 5-7 (5 recommended for performance)
- ✅ **Constraint Type:** Limited rotation, free swing
- ✅ **Swing Limit:** YES (prevent impossible bends)
- ✅ **Twist Limit:** YES (prevent over-rotation)
- ❌ **Noodle Physics:** NO (maintain rigidity)

**Damping Values:**
- Linear Damping: 0.5 (smooth motion)
- Angular Damping: 0.7 (reduce oscillation)

**Collision:**
- Tails collide with: Environment (optional), Enemies (optional)
- Tails ignore: Own body, Other tails, Allies
- Collision Channel: **Pawn** (or custom `TailPhysics` channel)

---

## Skeleton Validation Checklist

Before finalizing the skeletal mesh import:

- ✅ All 9 tail bones present (`Tail_01` through `Tail_09`)
- ✅ Each tail has 5 segment bones (`Tail_XX_Bone_01` through `Tail_XX_Bone_05`)
- ✅ Digitigrade leg structure correct (Thigh → Calf → Foot → Toe)
- ✅ IK targets positioned at foot/toe contact points
- ✅ Spine has 2 segments for posture control
- ✅ Head, jaw, and ear bones present for facial animation
- ✅ Hand bones include 4 fingers + thumb for tool use
- ✅ Bone hierarchy matches canonical structure (no extra/missing bones)
- ✅ Bone names follow naming convention exactly
- ✅ T-pose is neutral and symmetric

---

## Integration with Character Lockfile

This skeletal mesh MUST validate against `kai_jax.character.json`:

**Rigging Section:**
```json
"rigging": {
  "skeleton_type": "humanoid_extended",
  "single_skeleton_only": true,
  "extra_bones": {
    "tails": {
      "count": 9,
      "bones_per_tail": [5, 7],
      "physics_enabled": true
    }
  }
}
```

**Validation:**
- Tail count in skeleton == `rigging.extra_bones.tails.count` (9)
- Bones per tail == 5 (within range [5, 7])
- Physics enabled for all tail bones

---

## Next Steps

1. **Import FBX:** Use settings above to import skeletal mesh
2. **Verify Hierarchy:** Check Skeleton Tree in UE5 matches this document
3. **Create Physics Asset:** See `docs/UE5_PHYSICS_ASSET.md`
4. **Configure Control Rig:** See `Source/KaiJax/Animation/KaiJaxControlRig.h`
5. **Setup IK:** See `docs/UE5_IK_SETUP.md`
6. **Create Animation Blueprint:** See `docs/UE5_ANIMATION_BLUEPRINT.md`

---

**Canonical Authority:** This document is derived from `kai_jax.character.json` and enforces the rules in `README_CANON.md`. Any deviation from the 9-tail structure or digitigrade leg configuration is a build violation.

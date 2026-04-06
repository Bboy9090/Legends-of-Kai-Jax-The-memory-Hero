# KAI-JAX 3D MODEL SPECIFICATION

**Version:** 1.0.0  
**Status:** AUTHORITATIVE  
**Source of Truth:** `/kai_jax.character.json`

## OVERVIEW

This document defines the exact requirements for Kai-Jax's 3D model, rigging, materials, and animations. All specifications are derived from the canonical lockfile `kai_jax.character.json` and must be validated against `schemas/character.schema.json`.

## MODELING REQUIREMENTS

### Base Specifications
- **Units:** Meters (1 unit = 1 meter)
- **Scale:** 1.0 (canonical scale)
- **Height:** 1.15x standard humanoid (per `height_multiplier: 1.15`)
- **Topology:** Clean quads preferred
- **Forward Axis:** +Z (Unreal/Blender convention)
- **Up Axis:** +Y

### LOD (Level of Detail) Targets

```json
LOD0 (Full Quality):
  Triangle Count: 80,000 - 120,000
  Use Case: Close-up, cinematics, hero shots
  
LOD1 (Medium):
  Triangle Count: 50,000 - 70,000
  Use Case: Standard gameplay, medium distance
  
LOD2 (Low):
  Triangle Count: 25,000 - 35,000
  Use Case: Far distance, crowd scenes
```

### Required Edge Loop Regions
Must have sufficient edge loops for proper deformation:
- **Jaw:** For facial expressions and snarl
- **Eyes:** For eye movement and focus
- **Shoulders:** For arm rotation and posture
- **Hips:** For leg movement and digitigrade stance
- **Tail Bases:** Each of 9 tail attachment points needs proper edge flow

### Anatomy
- **Body Type:** Humanoid beast (wolf-fox-hedgehog-spider composite)
- **Build:** Athletic sinewy predator
- **Legs:** Digitigrade (animal leg structure with heel raised)
- **Hands:** Clawed but tool-capable
- **Head:** Wolf-fox hybrid muzzle
- **Spine:** Reinforced with ridge
- **Tail Count:** 9 tails (IMMUTABLE - per canon)

## TAIL RIGGING SPECIFICATIONS

### Critical Requirements
- **Tail Count:** EXACTLY 9 tails (per evolution.final_tail_count)
- **Bones Per Tail:** 5-7 bones minimum
- **Physics:** Enabled with constraints
- **Base Attachment:** Arranged in crescent arc formation

### Individual Tail Specifications

```
Tail 1 - Bond (Parry/Counter/Revive)
  Position: Center-left
  Color Accent: Blue-white
  Length: 100%
  Bones: 6
  
Tail 2 - Hunter (Dash/Pursuit/Execute)
  Position: Center-left-mid
  Color Accent: Red-gold
  Length: 105%
  Bones: 6
  
Tail 3 - Thread (Web/Pull/Group)
  Position: Center
  Color Accent: Silver-white
  Length: 110%
  Bones: 7
  
Tail 4 - Quill (Retaliation/Posture)
  Position: Center-right-mid
  Color Accent: Black-purple
  Length: 105%
  Bones: 6
  
Tail 5 - Shade (Stealth/Threat Reset)
  Position: Center-right
  Color Accent: Shadow-dark
  Length: 100%
  Bones: 6
  
Tail 6 - Anchor (Anti-Knockback/Root)
  Position: Left-outer
  Color Accent: Stone-gray
  Length: 115%
  Bones: 7
  
Tail 7 - Echo (After-Image/Repeat)
  Position: Right-outer
  Color Accent: Echo-blue
  Length: 115%
  Bones: 7
  
Tail 8 - Rift (Reality Tear/AOE)
  Position: Left-extreme
  Color Accent: Void-purple
  Length: 120%
  Bones: 7
  
Tail 9 - Crown (Aura/Command)
  Position: Right-extreme, raised
  Color Accent: Gold-white
  Length: 125%
  Bones: 7
```

### Tail Physics Constraints
```json
{
  "swing_limit": true,
  "twist_limit": true,
  "noodle_physics": false,
  "damping": 0.3,
  "stiffness": 0.6,
  "collision_enabled": true
}
```

**CRITICAL:** No noodle physics. Tails must have weight and inertia.

## SKELETON HIERARCHY

```
Root
├── Pelvis
│   ├── Spine_01
│   │   ├── Spine_02
│   │   │   ├── Spine_03
│   │   │   │   ├── Spine_04 (reinforced ridge)
│   │   │   │   │   ├── Neck_01
│   │   │   │   │   │   ├── Head
│   │   │   │   │   │   │   ├── Jaw
│   │   │   │   │   │   │   ├── Eye_L
│   │   │   │   │   │   │   ├── Eye_R
│   │   │   │   │   │   │   ├── Ear_L
│   │   │   │   │   │   │   └── Ear_R
│   │   │   │   │   ├── Clavicle_L
│   │   │   │   │   │   └── Shoulder_L → Arm chain...
│   │   │   │   │   └── Clavicle_R
│   │   │   │   │       └── Shoulder_R → Arm chain...
│   │   │   │   └── [9 Tail Base attachments]
│   │   │   │       ├── Tail_01_Base → Tail_01_01 → ... → Tail_01_06
│   │   │   │       ├── Tail_02_Base → Tail_02_01 → ... → Tail_02_06
│   │   │   │       ├── Tail_03_Base → Tail_03_01 → ... → Tail_03_07
│   │   │   │       ├── Tail_04_Base → Tail_04_01 → ... → Tail_04_06
│   │   │   │       ├── Tail_05_Base → Tail_05_01 → ... → Tail_05_06
│   │   │   │       ├── Tail_06_Base → Tail_06_01 → ... → Tail_06_07
│   │   │   │       ├── Tail_07_Base → Tail_07_01 → ... → Tail_07_07
│   │   │   │       ├── Tail_08_Base → Tail_08_01 → ... → Tail_08_07
│   │   │   │       └── Tail_09_Base → Tail_09_01 → ... → Tail_09_07
│   ├── Thigh_L → Digitigrade leg chain...
│   └── Thigh_R → Digitigrade leg chain...
```

**Total Bone Count:** ~100-120 bones (including all tail bones)

## MATERIALS

### Material 1: Fur (Primary Body)
```json
{
  "type": "card_or_shell",
  "pbr": true,
  "baseColor": "#1a1a1a",
  "maps": {
    "albedo": "kai_jax_fur_albedo.png",
    "normal": "kai_jax_fur_normal.png",
    "roughness": "kai_jax_fur_roughness.png"
  },
  "roughness": 0.7,
  "metallic": 0.0,
  "density_varies_by_region": true,
  "no_painted_fur": true
}
```

### Material 2: Armor (Worn Foundry Steel)
```json
{
  "type": "worn_foundry_steel",
  "pbr": true,
  "baseColor": "#3d3d3d",
  "roughness_range": [0.4, 0.6],
  "metallic": 0.9,
  "edge_wear": true,
  "clean_surfaces_disallowed": true,
  "maps": {
    "albedo": "kai_jax_armor_albedo.png",
    "normal": "kai_jax_armor_normal.png",
    "metallic": "kai_jax_armor_metallic.png",
    "roughness": "kai_jax_armor_roughness.png",
    "ao": "kai_jax_armor_ao.png"
  }
}
```

### Material 3: Spikes (Bone-Tech Hybrid)
```json
{
  "type": "bone_tech_hybrid",
  "pbr": true,
  "baseColor": "#f0f0f0",
  "roughness": 0.3,
  "metallic": 0.4,
  "emissive": {
    "enabled": true,
    "color": "#88d0ff",
    "intensity": 0.5,
    "always_on": false,
    "event_triggered_only": true
  }
}
```

### Material 4: Weave Energy (Memory Tails)
```json
{
  "type": "weave_energy",
  "pbr": true,
  "baseColor": "#88d0ff",
  "emissive": true,
  "emissive_intensity": 2.0,
  "always_on": false,
  "mobile_disabled": true,
  "opacity": 0.8,
  "double_sided": true
}
```

## ANIMATION REQUIREMENTS

### Philosophy
- **Mass and Inertia:** Every movement must feel weighted
- **No Floaty Motion:** Enforce gravity and momentum
- **Root Motion:** Only for finishers and heavy knockdowns

### Required Animation Sets

**Idle States:**
- `idle_calm` - Out of combat, relaxed but alert
- `idle_combat` - In combat stance, tails active

**Movement:**
- `walk` - Grounded, four-point gait when needed
- `run` - Athletic sprint, proper foot timing
- `sprint` - Maximum speed, tail streaming
- `jump` - Powerful launch with windup
- `fall` - Falling loop with tail stabilization
- `land` - Impact absorption, weight shift

**Combat - Light:**
- `light_combo_01` - Jab
- `light_combo_02` - Cross
- `light_combo_03` - Launcher setup

**Combat - Heavy:**
- `heavy_combo_01` - Wind-up strike
- `heavy_combo_02` - Spinning tail sweep
- `heavy_combo_03` - Ground pound

**Special Attacks:**
- `special_tail_strike` - Multi-tail coordinated attack
- `special_dash_strike` - Hunter tail dash
- `special_web_pull` - Thread tail grapple
- `special_aura_burst` - Crown tail ultimate

**Defense:**
- `dodge_ground` - Quick sidestep
- `dodge_air` - Air dash with momentum
- `parry` - Defensive stance with Bond tail
- `counter` - Immediate riposte after parry

**Reactions:**
- `hit_light` - Light stagger
- `hit_heavy` - Heavy knockback
- `knockdown` - Grounded state
- `recovery` - Stand up animation

**Finishers:**
- `finisher_ground` - Execution move
- `finisher_air` - Aerial finisher

**Death:**
- `death` - Defeat animation

### Frame Rules
- **Minimum Frames Per Action:** 12 frames
- **Cancel Windows:** Hit-confirm or perfect parry only
- **No Frame-1 Cancels:** Enforce commitment

## FACIAL BLENDSHAPES

Required expressions (no anime exaggeration):
- `snarl` - Aggressive combat expression
- `focus` - Concentrated analysis
- `pain` - Hit reaction
- `rage` - Berserker state

## VALIDATION CHECKLIST

Before exporting model, verify:
- [ ] Tail count is EXACTLY 9
- [ ] Each tail has 5-7 bones
- [ ] Skeleton follows hierarchy spec
- [ ] LOD0 triangle count in range [80k, 120k]
- [ ] All materials use PBR workflow
- [ ] Edge loops present at all required regions
- [ ] Digitigrade legs properly rigged
- [ ] Forward axis is +Z, up axis is +Y
- [ ] Scale is 1.0 in world space
- [ ] All required animations present
- [ ] No floaty physics on tails
- [ ] Armor reads as worn (not clean)
- [ ] Silhouette readable in shadow

## EXPORT SETTINGS

### For Blender → glTF 2.0
```
Format: glTF Binary (.glb)
Include: 
  ✓ Selected Objects
  ✓ Custom Properties
  ✓ Cameras
  ✓ Punctual Lights
Transform:
  ✓ +Y Up
Geometry:
  ✓ Apply Modifiers
  ✓ UVs
  ✓ Normals
  ✓ Tangents
  ✓ Vertex Colors
  Material: Export
Animation:
  ✓ Use Current Frame
  ✓ Animations
  ✓ Limit to Playback Range
  ✓ Always Sample Animations
  ✓ NLA Strips
  ✓ Export Deformation Bones Only
  Shape Keys: ✓
  Skinning: ✓
Compression: None (for source, compress at build time)
```

## REFERENCES

- **Authoritative Reference:** `/attached_assets/kaison jax_1758915252742.webp`
- **Canonical Data:** `/kai_jax.character.json`
- **Schema Validation:** `/schemas/character.schema.json`
- **World Integration:** `/data/world/tail_tier_reactions.json`
- **Governance:** `/README_CANON.md`

## NOTES

This is a production asset for a franchise. Every detail matters. Silhouette, proportions, and tail count are non-negotiable. The model must work across PC (Vulkan/DX12), iOS (Metal), and Android (Vulkan) with identical gameplay feel.

**If unclear, STOP and ASK. Do not guess.**

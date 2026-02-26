# KAI-JAX ASSET MASTER LIST
## Production Bible v1.0

**Document Type:** Production Asset Manifest  
**Target Engines:** Unreal Engine 5 / Unity  
**Last Updated:** December 2025  
**Status:** Production Ready

---

## TABLE OF CONTENTS

1. [Asset Naming Convention](#1-asset-naming-convention)
2. [Character Models](#2-character-models)
3. [Character Rigs](#3-character-rigs)
4. [Animation Assets](#4-animation-assets)
5. [VFX Assets](#5-vfx-assets)
6. [Audio Assets](#6-audio-assets)
7. [Material Assets](#7-material-assets)
8. [UI Assets](#8-ui-assets)
9. [Environment Assets](#9-environment-assets)
10. [Production Schedule Reference](#10-production-schedule-reference)

---

## 1. ASSET NAMING CONVENTION

### 1.1 Naming Format

```
PREFIX_Category_Name_Variant_LOD

Examples:
  SK_KaiJax_Body_LOD0          (Skeletal Mesh, Kai-Jax, Body, LOD 0)
  M_Tail_Ember_Base            (Material, Tail, Ember, Base variant)
  A_KaiJax_Attack_Light_01     (Animation, Kai-Jax, Attack, Light, variant 1)
  VFX_Tail_Ember_Impact        (VFX, Tail, Ember, Impact)
  SFX_Combat_Hit_Heavy         (Sound Effect, Combat, Hit, Heavy)
```

### 1.2 Prefix Reference

| Prefix | Asset Type |
|--------|------------|
| SK | Skeletal Mesh |
| SM | Static Mesh |
| M | Material |
| MI | Material Instance |
| T | Texture |
| A | Animation |
| ABP | Animation Blueprint |
| VFX | Visual Effect |
| SFX | Sound Effect |
| MX | Music Track |
| UI | User Interface |
| BT | Behavior Tree |
| BB | Blackboard |
| DA | Data Asset |

---

## 2. CHARACTER MODELS

### 2.1 Kai-Jax (Player Character)

```
╔═══════════════════════════════════════════════════════════════╗
║  KAI-JAX MODEL ASSETS                                          ║
╠═══════════════════════════════════════════════════════════════╣

SKELETAL MESHES (4 LODs):

□ SK_KaiJax_Body_LOD0
  - Triangles: 80,000
  - Purpose: Close-up, cinematics
  - Fur: Strand-based ready
  
□ SK_KaiJax_Body_LOD1
  - Triangles: 40,000
  - Purpose: Standard gameplay
  - Fur: Shell 24
  
□ SK_KaiJax_Body_LOD2
  - Triangles: 15,000
  - Purpose: Medium distance
  - Fur: Shell 16
  
□ SK_KaiJax_Body_LOD3
  - Triangles: 5,000
  - Purpose: Far distance / Mobile
  - Fur: Shell 8 / Solid
  
□ SK_KaiJax_Body_LOD4
  - Triangles: 2,000
  - Purpose: Extreme distance / Billboard
  - Fur: None

SEPARATE MESHES:

□ SK_KaiJax_Claws_L
  - Triangles: 500
  - Animated separately for extension
  
□ SK_KaiJax_Claws_R
  - Triangles: 500
  
□ SK_KaiJax_Claws_Feet
  - Triangles: 800 (all 4)

TAIL MESHES (9 total):

□ SK_KaiJax_Tail_01_Ember
□ SK_KaiJax_Tail_02_Gale
□ SK_KaiJax_Tail_03_Shade
□ SK_KaiJax_Tail_04_Volt
□ SK_KaiJax_Tail_05_Stone
□ SK_KaiJax_Tail_06_Tide
□ SK_KaiJax_Tail_07_Thorn
□ SK_KaiJax_Tail_08_Prism
□ SK_KaiJax_Tail_09_Void

  Each tail:
  - Triangles: 3,000 (LOD0)
  - Bones: 10
  - Unique material slot

╚═══════════════════════════════════════════════════════════════╝
```

### 2.2 Enemy Models

```
╔═══════════════════════════════════════════════════════════════╗
║  ENEMY MODEL ASSETS                                            ║
╠═══════════════════════════════════════════════════════════════╣

ITERATOR (Standard):
□ SK_Enemy_Iterator_LOD0      25,000 tris
□ SK_Enemy_Iterator_LOD1      10,000 tris
□ SK_Enemy_Iterator_LOD2       3,000 tris

NULL STALKER (Assassin):
□ SK_Enemy_NullStalker_LOD0   20,000 tris
□ SK_Enemy_NullStalker_LOD1    8,000 tris
□ SK_Enemy_NullStalker_LOD2    2,500 tris

BASTION (Tank):
□ SK_Enemy_Bastion_LOD0       35,000 tris
□ SK_Enemy_Bastion_LOD1       15,000 tris
□ SK_Enemy_Bastion_LOD2        5,000 tris

PHASE WEAVER (Teleporter):
□ SK_Enemy_PhaseWeaver_LOD0   18,000 tris
□ SK_Enemy_PhaseWeaver_LOD1    7,000 tris
□ SK_Enemy_PhaseWeaver_LOD2    2,000 tris

CROWN WARDEN (Mini-Boss):
□ SK_Enemy_CrownWarden_LOD0   50,000 tris
□ SK_Enemy_CrownWarden_LOD1   25,000 tris
□ SK_Enemy_CrownWarden_LOD2    8,000 tris

╚═══════════════════════════════════════════════════════════════╝
```

### 2.3 Allied Character Models

```
╔═══════════════════════════════════════════════════════════════╗
║  ALLIED CHARACTER MODELS                                       ║
╠═══════════════════════════════════════════════════════════════╣

AURELION (Time-Bound Wanderer):
□ SK_NPC_Aurelion_LOD0        30,000 tris
□ SK_NPC_Aurelion_LOD1        12,000 tris

SELENE (Oracle of the Veil):
□ SK_NPC_Selene_LOD0          28,000 tris
□ SK_NPC_Selene_LOD1          10,000 tris

THERON (Disgraced Guardian):
□ SK_NPC_Theron_LOD0          32,000 tris
□ SK_NPC_Theron_LOD1          14,000 tris

╚═══════════════════════════════════════════════════════════════╝
```

---

## 3. CHARACTER RIGS

### 3.1 Kai-Jax Skeleton

```
╔═══════════════════════════════════════════════════════════════╗
║  KAI-JAX SKELETON                                              ║
╠═══════════════════════════════════════════════════════════════╣

SKELETON FILE:
□ SKEL_KaiJax_Master

BONE COUNT BY LOD:
  LOD0: 150 bones
  LOD1: 120 bones
  LOD2:  80 bones
  LOD3:  50 bones
  LOD4:  30 bones

BONE HIERARCHY:
□ root (1)
  └── pelvis (1)
      ├── spine chain (4): spine_01 → spine_04
      │   └── chest (1)
      │       ├── neck (1)
      │       │   └── head (1)
      │       │       ├── jaw (1)
      │       │       ├── ear_L (1)
      │       │       ├── ear_R (1)
      │       │       ├── eye_L (1)
      │       │       └── eye_R (1)
      │       ├── clavicle_L (1)
      │       │   └── arm_L chain (3)
      │       │       └── hand_L (17)
      │       └── clavicle_R (1)
      │           └── arm_R chain (3)
      │               └── hand_R (17)
      ├── leg_L chain (4): thigh → foot
      ├── leg_R chain (4): thigh → foot
      └── tail_root (1)
          └── 9 tail chains × 10 bones each (90)

TOTAL: ~150 bones (LOD0)

IK TARGETS (Virtual Bones):
□ IK_Hand_L
□ IK_Hand_R
□ IK_Foot_L
□ IK_Foot_R
□ IK_LookAt

SOCKETS:
□ Socket_VFX_Center       (Chest)
□ Socket_VFX_Hand_L       (Left palm)
□ Socket_VFX_Hand_R       (Right palm)
□ Socket_VFX_Foot_L       (Left foot)
□ Socket_VFX_Foot_R       (Right foot)
□ Socket_VFX_Tail_01-09   (Tail tips)

╚═══════════════════════════════════════════════════════════════╝
```

### 3.2 Enemy Skeletons

```
╔═══════════════════════════════════════════════════════════════╗
║  ENEMY SKELETONS                                               ║
╠═══════════════════════════════════════════════════════════════╣

□ SKEL_Enemy_Iterator        50 bones
□ SKEL_Enemy_NullStalker     45 bones
□ SKEL_Enemy_Bastion         55 bones
□ SKEL_Enemy_PhaseWeaver     40 bones
□ SKEL_Enemy_CrownWarden     80 bones

ALL ENEMY SKELETONS SHARE:
  - Humanoid base structure
  - Compatible with standard humanoid anims
  - IK foot/hand targets
  - VFX sockets at key points

╚═══════════════════════════════════════════════════════════════╝
```

### 3.3 Physics Assets

```
╔═══════════════════════════════════════════════════════════════╗
║  PHYSICS ASSETS                                                ║
╠═══════════════════════════════════════════════════════════════╣

KAI-JAX PHYSICS:
□ PHYS_KaiJax_Ragdoll
  - Full body ragdoll for death
  - Collision capsules per bone
  
□ PHYS_KaiJax_TailPhysics
  - Per-tail physics asset
  - Stiffness/damping per bone
  - Collision with body

ENEMY PHYSICS:
□ PHYS_Enemy_Iterator_Ragdoll
□ PHYS_Enemy_NullStalker_Ragdoll
□ PHYS_Enemy_Bastion_Ragdoll
□ PHYS_Enemy_PhaseWeaver_Ragdoll
□ PHYS_Enemy_CrownWarden_Ragdoll

╚═══════════════════════════════════════════════════════════════╝
```

---

## 4. ANIMATION ASSETS

### 4.1 Kai-Jax Locomotion Animations

```
╔═══════════════════════════════════════════════════════════════╗
║  KAI-JAX LOCOMOTION (12 Animations)                            ║
╠═══════════════════════════════════════════════════════════════╣

IDLE:
□ A_KaiJax_Idle_Combat          120f, loop
□ A_KaiJax_Idle_Fidget_01        90f, one-shot
□ A_KaiJax_Idle_Fidget_02       120f, one-shot
□ A_KaiJax_Idle_Fidget_03       150f, one-shot

WALK:
□ A_KaiJax_Walk_Forward          60f, loop, root motion
□ A_KaiJax_Walk_Backward         70f, loop, root motion
□ A_KaiJax_Walk_Left             60f, loop, root motion
□ A_KaiJax_Walk_Right            60f, loop, root motion

RUN:
□ A_KaiJax_Run_Forward           40f, loop, root motion

DASH:
□ A_KaiJax_Dash_Forward          12f, one-shot, root motion
□ A_KaiJax_Dash_Backward         12f, one-shot, root motion
□ A_KaiJax_Dash_Side             12f, one-shot, root motion

╚═══════════════════════════════════════════════════════════════╝
```

### 4.2 Kai-Jax Combat Animations

```
╔═══════════════════════════════════════════════════════════════╗
║  KAI-JAX GROUND COMBAT (12 Animations)                         ║
╠═══════════════════════════════════════════════════════════════╣

LIGHT ATTACKS:
□ A_KaiJax_Attack_Light_01       15f (4s/3a/8r)
□ A_KaiJax_Attack_Light_02       17f (5s/3a/9r)
□ A_KaiJax_Attack_Light_03       22f (6s/4a/12r)

HEAVY ATTACKS:
□ A_KaiJax_Attack_Heavy_01       33f (10s/5a/18r)
□ A_KaiJax_Attack_Heavy_02       38f (12s/6a/20r)

DASH ATTACKS:
□ A_KaiJax_DashAttack_Light      28f (6s/8a/14r)
□ A_KaiJax_DashAttack_Heavy      36f (8s/10a/18r)

BLOCKING:
□ A_KaiJax_Block_Enter            6f
□ A_KaiJax_Block_Idle            60f, loop
□ A_KaiJax_Block_Exit             8f
□ A_KaiJax_Block_React_Light     12f
□ A_KaiJax_Block_React_Heavy     18f

╚═══════════════════════════════════════════════════════════════╝
```

### 4.3 Kai-Jax Aerial Animations

```
╔═══════════════════════════════════════════════════════════════╗
║  KAI-JAX AERIAL (6 Animations)                                 ║
╠═══════════════════════════════════════════════════════════════╣

□ A_KaiJax_Jump_Squat             3f
□ A_KaiJax_Jump_Rise             30f
□ A_KaiJax_Jump_Fall             40f, loop
□ A_KaiJax_Air_Attack_Light      20f
□ A_KaiJax_Air_Attack_Heavy      28f
□ A_KaiJax_Air_Dash              12f

LANDING:
□ A_KaiJax_Land_Light             3f
□ A_KaiJax_Land_Heavy             8f

DOUBLE JUMP (Gale):
□ A_KaiJax_DoubleJump            20f

╚═══════════════════════════════════════════════════════════════╝
```

### 4.4 Kai-Jax Reaction Animations

```
╔═══════════════════════════════════════════════════════════════╗
║  KAI-JAX REACTIONS (12 Animations)                             ║
╠═══════════════════════════════════════════════════════════════╣

HIT REACTIONS (Directional):
□ A_KaiJax_Hit_Light_Front       12f
□ A_KaiJax_Hit_Light_Back        12f
□ A_KaiJax_Hit_Medium_Front      18f
□ A_KaiJax_Hit_Medium_Back       18f
□ A_KaiJax_Hit_Heavy_Front       24f
□ A_KaiJax_Hit_Heavy_Back        24f

KNOCKDOWN:
□ A_KaiJax_Hit_Launch            15f
□ A_KaiJax_Knockdown_Fall        20f
□ A_KaiJax_Knockdown_Ground      30f
□ A_KaiJax_Wakeup_Normal         20f
□ A_KaiJax_Wakeup_Attack         25f

DEATH:
□ A_KaiJax_Death                 60f

╚═══════════════════════════════════════════════════════════════╝
```

### 4.5 Tail Ability Animations

```
╔═══════════════════════════════════════════════════════════════╗
║  TAIL ABILITY ANIMATIONS (18 Animations)                       ║
╠═══════════════════════════════════════════════════════════════╣

ACTION ABILITIES:
□ A_KaiJax_Tail_Ember_Flare      34f (8s/6a/20r)
□ A_KaiJax_Tail_Gale_Ridge       22f (2s/12a/8r)
□ A_KaiJax_Tail_Shade_Counter    41f (1s/15a/25r)
□ A_KaiJax_Tail_Volt_Bind        24f (5s/4a/15r)
□ A_KaiJax_Tail_Stone_Quake      48f (15s/8a/25r)
□ A_KaiJax_Tail_Tide_Wave        45f (10s/20a/15r)
□ A_KaiJax_Tail_Thorn_Trap       40f (20s/×/20r) *plants trap
□ A_KaiJax_Tail_Prism_Mirror     41f (3s/8a/30r)
□ A_KaiJax_Tail_Void_Denial      91f (30s/1a/60r)

ULTIMATE ABILITIES:
□ A_KaiJax_Ultimate_Ember        95f
□ A_KaiJax_Ultimate_Gale        170f
□ A_KaiJax_Ultimate_Shade        85f
□ A_KaiJax_Ultimate_Volt         80f
□ A_KaiJax_Ultimate_Stone       350f
□ A_KaiJax_Ultimate_Tide         95f
□ A_KaiJax_Ultimate_Thorn       130f
□ A_KaiJax_Ultimate_Prism        70f
□ A_KaiJax_Ultimate_Void        160f

TAIL UTILITY:
□ A_KaiJax_Tail_Switch            6f

╚═══════════════════════════════════════════════════════════════╝
```

### 4.6 Enemy Animations

```
╔═══════════════════════════════════════════════════════════════╗
║  ENEMY ANIMATION SETS (Per Enemy Type)                         ║
╠═══════════════════════════════════════════════════════════════╣

ITERATOR (15 Animations):
□ A_Iterator_Idle                 60f
□ A_Iterator_Walk                 60f
□ A_Iterator_Run                  40f
□ A_Iterator_Attack_Light         20f
□ A_Iterator_Attack_Heavy         35f
□ A_Iterator_Attack_Dash          30f
□ A_Iterator_Block                60f, loop
□ A_Iterator_Block_React          15f
□ A_Iterator_Hit_Light            15f
□ A_Iterator_Hit_Heavy            25f
□ A_Iterator_Stagger              30f
□ A_Iterator_Death                45f
□ A_Iterator_Adapt_Tell           20f (visual feedback)
□ A_Iterator_Feint                25f
□ A_Iterator_Spawn                40f

NULL STALKER (18 Animations):
□ A_NullStalker_Idle              60f
□ A_NullStalker_Walk              60f
□ A_NullStalker_Dash              15f
□ A_NullStalker_Fade_In           20f
□ A_NullStalker_Fade_Out          20f
□ A_NullStalker_Attack_Fade       25f
□ A_NullStalker_Attack_Ambush     30f
□ A_NullStalker_Attack_Retreat    25f
□ A_NullStalker_Counter           35f
□ A_NullStalker_Hit_Light         15f
□ A_NullStalker_Hit_Heavy         25f
□ A_NullStalker_Death             50f (dissolve)
□ ... (standard set)

BASTION (15 Animations):
□ A_Bastion_Idle                  80f
□ A_Bastion_Walk                  70f (slow)
□ A_Bastion_Attack_Heavy          50f (super armor)
□ A_Bastion_Attack_Bash           35f
□ A_Bastion_Attack_Slam           60f (AOE)
□ A_Bastion_Fortress_Enter        25f
□ A_Bastion_Fortress_Idle         60f, loop
□ A_Bastion_Fortress_Exit         25f
□ A_Bastion_Block                 60f
□ A_Bastion_Hit_Armor             20f (reduced reaction)
□ A_Bastion_Hit_Stagger           40f
□ A_Bastion_Death                 80f (collapse)
□ ... (standard set)

PHASE WEAVER (20 Animations):
□ A_PhaseWeaver_Idle              50f
□ A_PhaseWeaver_Walk              50f
□ A_PhaseWeaver_Teleport_Out      8f
□ A_PhaseWeaver_Teleport_In       8f
□ A_PhaseWeaver_Attack_Phase      25f
□ A_PhaseWeaver_Attack_Multi      45f (multi-teleport)
□ A_PhaseWeaver_Afterimage_Cast   15f
□ A_PhaseWeaver_Hit_Light         12f (faster recovery)
□ A_PhaseWeaver_Hit_Heavy         20f
□ A_PhaseWeaver_Death             40f (phase out)
□ ... (standard set)

CROWN WARDEN (25 Animations):
□ A_CrownWarden_Idle_Phase1       60f
□ A_CrownWarden_Idle_Phase2       60f (aggressive)
□ A_CrownWarden_Idle_Phase3       60f (armored)
□ A_CrownWarden_Idle_Phase4       60f (desperate)
□ A_CrownWarden_Walk              55f
□ A_CrownWarden_Run               40f
□ A_CrownWarden_PhaseTransition   90f (dramatic)
□ A_CrownWarden_Attack_Combo_1    60f
□ A_CrownWarden_Attack_Combo_2    75f
□ A_CrownWarden_Attack_Ultimate  120f
□ A_CrownWarden_Teleport          15f
□ A_CrownWarden_SuperArmor_Start  20f
□ ... (full combat set)

╚═══════════════════════════════════════════════════════════════╝
```

### 4.7 Animation Blueprint Assets

```
╔═══════════════════════════════════════════════════════════════╗
║  ANIMATION BLUEPRINTS                                          ║
╠═══════════════════════════════════════════════════════════════╣

□ ABP_KaiJax_Main
  - Full state machine
  - All layers (locomotion, combat, tail, face)
  - Blend spaces integrated
  
□ ABP_Enemy_Iterator
□ ABP_Enemy_NullStalker
□ ABP_Enemy_Bastion
□ ABP_Enemy_PhaseWeaver
□ ABP_Enemy_CrownWarden

SHARED COMPONENTS:
□ ABP_Humanoid_Base      (Shared locomotion logic)
□ ABP_TailPhysics_Layer  (Reusable tail sim)

╚═══════════════════════════════════════════════════════════════╝
```

---

## 5. VFX ASSETS

### 5.1 Combat VFX

```
╔═══════════════════════════════════════════════════════════════╗
║  COMBAT VFX (30 Assets)                                        ║
╠═══════════════════════════════════════════════════════════════╣

HIT SPARKS:
□ VFX_Hit_Light             8 particles, 64x64
□ VFX_Hit_Medium           16 particles, 128x128
□ VFX_Hit_Heavy            24 particles, 256x256
□ VFX_Hit_Counter          32 particles, 256x256

BLOCK EFFECTS:
□ VFX_Block_Light           6 particles
□ VFX_Block_Heavy          12 particles
□ VFX_Block_Perfect        20 particles + flash

ATTACK TRAILS:
□ VFX_Trail_Slash_Light    Ribbon trail, short
□ VFX_Trail_Slash_Heavy    Ribbon trail, long
□ VFX_Trail_Stab           Point trail

DASH EFFECTS:
□ VFX_Dash_Burst_Start     20 particles
□ VFX_Dash_Burst_End       15 particles
□ VFX_Dash_Afterimage      Screen-space blur

IMPACT EFFECTS:
□ VFX_Impact_Ground        Dust cloud
□ VFX_Impact_Wall          Debris
□ VFX_Impact_Character     Blood/sparks (toggle)

╚═══════════════════════════════════════════════════════════════╝
```

### 5.2 Tail Element VFX

```
╔═══════════════════════════════════════════════════════════════╗
║  TAIL VFX (Per Tail × 5 = 45 Assets)                           ║
╠═══════════════════════════════════════════════════════════════╣

PER TAIL SET:
  □ VFX_Tail_[Name]_Idle       Ambient particles
  □ VFX_Tail_[Name]_Active     Enhanced when active
  □ VFX_Tail_[Name]_Ability    During ability cast
  □ VFX_Tail_[Name]_Impact     On hit with ability
  □ VFX_Tail_[Name]_Switch     Transition effect

EMBER:
□ VFX_Tail_Ember_Idle         Floating embers
□ VFX_Tail_Ember_Active       Fire trail
□ VFX_Tail_Ember_Ability      Fire burst
□ VFX_Tail_Ember_Impact       Explosion
□ VFX_Tail_Ember_Switch       Flame burst

GALE:
□ VFX_Tail_Gale_Idle          Wind wisps
□ VFX_Tail_Gale_Active        Air currents
□ VFX_Tail_Gale_Ability       Wind slash
□ VFX_Tail_Gale_Impact        Air scatter
□ VFX_Tail_Gale_Switch        Wind burst

SHADE:
□ VFX_Tail_Shade_Idle         Void tendrils
□ VFX_Tail_Shade_Active       Shadow trail
□ VFX_Tail_Shade_Ability      Shadow burst
□ VFX_Tail_Shade_Impact       Ink splash
□ VFX_Tail_Shade_Switch       Void burst

VOLT:
□ VFX_Tail_Volt_Idle          Electric arcs
□ VFX_Tail_Volt_Active        Lightning trail
□ VFX_Tail_Volt_Ability       Lightning bolt
□ VFX_Tail_Volt_Impact        Spark explosion
□ VFX_Tail_Volt_Switch        Electric burst

STONE:
□ VFX_Tail_Stone_Idle         Floating pebbles
□ VFX_Tail_Stone_Active       Dust trail
□ VFX_Tail_Stone_Ability      Shockwave
□ VFX_Tail_Stone_Impact       Rock shatter
□ VFX_Tail_Stone_Switch       Stone burst

TIDE:
□ VFX_Tail_Tide_Idle          Water droplets
□ VFX_Tail_Tide_Active        Water flow
□ VFX_Tail_Tide_Ability       Wave
□ VFX_Tail_Tide_Impact        Splash
□ VFX_Tail_Tide_Switch        Water burst

THORN:
□ VFX_Tail_Thorn_Idle         Floating leaves
□ VFX_Tail_Thorn_Active       Vine trail
□ VFX_Tail_Thorn_Ability      Thorn eruption
□ VFX_Tail_Thorn_Impact       Leaf scatter
□ VFX_Tail_Thorn_Switch       Nature burst

PRISM:
□ VFX_Tail_Prism_Idle         Light motes
□ VFX_Tail_Prism_Active       Prismatic trail
□ VFX_Tail_Prism_Ability      Light flash
□ VFX_Tail_Prism_Impact       Prismatic scatter
□ VFX_Tail_Prism_Switch       Light burst

VOID:
□ VFX_Tail_Void_Idle          Space distortion
□ VFX_Tail_Void_Active        Void trail
□ VFX_Tail_Void_Ability       Reality warp
□ VFX_Tail_Void_Impact        Glitch effect
□ VFX_Tail_Void_Switch        Void burst

╚═══════════════════════════════════════════════════════════════╝
```

### 5.3 Enemy VFX

```
╔═══════════════════════════════════════════════════════════════╗
║  ENEMY VFX (20 Assets)                                         ║
╠═══════════════════════════════════════════════════════════════╣

ITERATOR:
□ VFX_Iterator_Circuits       Circuit glow (base)
□ VFX_Iterator_Circuits_Adapt Circuit glow (adapted)
□ VFX_Iterator_Attack_Trail   Red slash
□ VFX_Iterator_Death          Explosion + circuits

NULL STALKER:
□ VFX_NullStalker_Fade        Dissolve in/out
□ VFX_NullStalker_Trail       Smoke trail
□ VFX_NullStalker_Ambush      Shadow burst
□ VFX_NullStalker_Death       Void dissolve

BASTION:
□ VFX_Bastion_Armor           Armor glow
□ VFX_Bastion_Damage          Crack particles
□ VFX_Bastion_Slam            Ground shockwave
□ VFX_Bastion_Death           Collapse debris

PHASE WEAVER:
□ VFX_PhaseWeaver_Teleport_Out Phase shift out
□ VFX_PhaseWeaver_Teleport_In  Phase shift in
□ VFX_PhaseWeaver_Afterimage   Clone trail
□ VFX_PhaseWeaver_Death        Multi-phase explode

CROWN WARDEN:
□ VFX_CrownWarden_Crown        Crown glow
□ VFX_CrownWarden_PhaseShift   Phase transition
□ VFX_CrownWarden_Ultimate     Full-screen effect
□ VFX_CrownWarden_Death        Royal explosion

╚═══════════════════════════════════════════════════════════════╝
```

### 5.4 Environmental VFX

```
╔═══════════════════════════════════════════════════════════════╗
║  ENVIRONMENT VFX (15 Assets)                                   ║
╠═══════════════════════════════════════════════════════════════╣

□ VFX_Env_Dust_Ambient        Light dust particles
□ VFX_Env_Rain                Rain particles
□ VFX_Env_Smoke               Smoke columns
□ VFX_Env_Fire_Ambient        Background fire
□ VFX_Env_Sparks              Electric sparks
□ VFX_Env_Steam               Steam vents
□ VFX_Env_Fog_Ground          Ground fog
□ VFX_Env_Leaves              Falling leaves
□ VFX_Env_Embers              Floating embers
□ VFX_Env_Energy_Field        Force field
□ VFX_Env_Portal              Teleport portal
□ VFX_Env_Memory_Fragments    Collectible glow
□ VFX_Env_Checkpoint          Save point glow
□ VFX_Env_Arena_Boundary      Arena edge warning
□ VFX_Env_Transition          Area transition

╚═══════════════════════════════════════════════════════════════╝
```

---

## 6. AUDIO ASSETS

### 6.1 Combat SFX

```
╔═══════════════════════════════════════════════════════════════╗
║  COMBAT SOUND EFFECTS (40 Assets)                              ║
╠═══════════════════════════════════════════════════════════════╣

PLAYER ATTACKS:
□ SFX_Attack_Whoosh_Light     3 variants
□ SFX_Attack_Whoosh_Heavy     3 variants
□ SFX_Attack_Whoosh_Dash      2 variants

HIT IMPACTS:
□ SFX_Hit_Light               3 variants
□ SFX_Hit_Medium              3 variants
□ SFX_Hit_Heavy               3 variants
□ SFX_Hit_Counter             2 variants

BLOCK:
□ SFX_Block_Light             2 variants
□ SFX_Block_Heavy             2 variants
□ SFX_Block_Perfect           1 unique

MOVEMENT:
□ SFX_Footstep_Run            4 variants (per surface)
□ SFX_Footstep_Walk           4 variants
□ SFX_Dash                    2 variants
□ SFX_Jump                    2 variants
□ SFX_Land_Light              2 variants
□ SFX_Land_Heavy              2 variants

REACTIONS:
□ SFX_Hit_React_Light         2 variants
□ SFX_Hit_React_Heavy         2 variants
□ SFX_Knockdown               1 unique
□ SFX_Death                   1 unique

╚═══════════════════════════════════════════════════════════════╝
```

### 6.2 Tail SFX

```
╔═══════════════════════════════════════════════════════════════╗
║  TAIL SOUND EFFECTS (Per Tail × 5 = 45 Assets)                 ║
╠═══════════════════════════════════════════════════════════════╣

PER TAIL SET:
□ SFX_Tail_[Name]_Switch      On equip
□ SFX_Tail_[Name]_Ambient     Subtle loop when active
□ SFX_Tail_[Name]_Ability     During ability
□ SFX_Tail_[Name]_Impact      On ability hit
□ SFX_Tail_[Name]_Ultimate    Ultimate ability

EXAMPLES:

EMBER:
□ SFX_Tail_Ember_Switch       Fire ignite
□ SFX_Tail_Ember_Ambient      Crackling fire (loop)
□ SFX_Tail_Ember_Ability      Flame whoosh
□ SFX_Tail_Ember_Impact       Explosion
□ SFX_Tail_Ember_Ultimate     Inferno roar

GALE:
□ SFX_Tail_Gale_Switch        Wind gust
□ SFX_Tail_Gale_Ambient       Gentle breeze (loop)
□ SFX_Tail_Gale_Ability       Air slash
□ SFX_Tail_Gale_Impact        Wind scatter
□ SFX_Tail_Gale_Ultimate      Storm roar

(Repeat for all 9 tails)

╚═══════════════════════════════════════════════════════════════╝
```

### 6.3 Enemy SFX

```
╔═══════════════════════════════════════════════════════════════╗
║  ENEMY SOUND EFFECTS (35 Assets)                               ║
╠═══════════════════════════════════════════════════════════════╣

ITERATOR:
□ SFX_Iterator_Idle           Electronic hum
□ SFX_Iterator_Move           Mechanical step
□ SFX_Iterator_Attack         Blade swing
□ SFX_Iterator_Hit            Metal impact
□ SFX_Iterator_Adapt          Data processing chirp
□ SFX_Iterator_Death          System failure

NULL STALKER:
□ SFX_NullStalker_Fade_In     Void whisper
□ SFX_NullStalker_Fade_Out    Shadow whoosh
□ SFX_NullStalker_Attack      Silent strike
□ SFX_NullStalker_Ambush      Shadow burst
□ SFX_NullStalker_Death       Void collapse

BASTION:
□ SFX_Bastion_Move            Heavy footsteps
□ SFX_Bastion_Attack          Heavy swing
□ SFX_Bastion_Slam            Ground impact
□ SFX_Bastion_Block           Shield clang
□ SFX_Bastion_Death           Structure collapse

PHASE WEAVER:
□ SFX_PhaseWeaver_Teleport    Phase crack (CRITICAL)
□ SFX_PhaseWeaver_Attack_Tell Attack incoming (CRITICAL)
□ SFX_PhaseWeaver_Afterimage  Echo effect
□ SFX_PhaseWeaver_Death       Multi-phase collapse

CROWN WARDEN:
□ SFX_CrownWarden_Idle        Royal hum
□ SFX_CrownWarden_Attack      Regal strike
□ SFX_CrownWarden_Phase_Trans Dramatic power shift
□ SFX_CrownWarden_Ultimate    Crown blast
□ SFX_CrownWarden_Death       Royal defeat

╚═══════════════════════════════════════════════════════════════╝
```

### 6.4 UI SFX

```
╔═══════════════════════════════════════════════════════════════╗
║  UI SOUND EFFECTS (15 Assets)                                  ║
╠═══════════════════════════════════════════════════════════════╣

□ SFX_UI_Navigate             Menu cursor move
□ SFX_UI_Select               Menu selection
□ SFX_UI_Back                 Menu back
□ SFX_UI_Error                Invalid action
□ SFX_UI_Pause_Open           Pause menu open
□ SFX_UI_Pause_Close          Pause menu close
□ SFX_UI_Meter_Fill           Meter charging
□ SFX_UI_Meter_Full           Meter ready
□ SFX_UI_Level_Up             Progression ding
□ SFX_UI_Unlock               New content unlocked
□ SFX_UI_Save                 Game saved
□ SFX_UI_Achievement          Achievement pop
□ SFX_UI_Map_Open             Map overlay open
□ SFX_UI_Inventory_Open       Inventory open
□ SFX_UI_Dialogue_Advance     Text advance blip

╚═══════════════════════════════════════════════════════════════╝
```

### 6.5 Music Tracks

```
╔═══════════════════════════════════════════════════════════════╗
║  MUSIC TRACKS (15 Assets)                                      ║
╠═══════════════════════════════════════════════════════════════╣

EXPLORATION:
□ MX_Explore_AshblockHeights   3:30, loop
□ MX_Explore_FangforgeWastes   4:00, loop
□ MX_Explore_VeilScar          3:45, loop
□ MX_Explore_MemoryGrove       4:15, loop
□ MX_Explore_AbyssalEngine     3:00, loop (ominous)

COMBAT:
□ MX_Combat_Standard           2:30, loop, intense
□ MX_Combat_MiniBoss           3:00, loop, epic
□ MX_Combat_CrownWarden        4:00, multi-phase

BOSS:
□ MX_Boss_Ulgorr_Phase1        3:00
□ MX_Boss_Ulgorr_Phase2        3:30
□ MX_Boss_Ulgorr_Phase3        4:00

STORY:
□ MX_Story_Emotional           2:00
□ MX_Story_Revelation          1:30
□ MX_Story_Victory             1:00

MENU:
□ MX_MainMenu                  2:00, loop

╚═══════════════════════════════════════════════════════════════╝
```

---

## 7. MATERIAL ASSETS

### 7.1 Kai-Jax Materials

```
╔═══════════════════════════════════════════════════════════════╗
║  KAI-JAX MATERIALS (15 Assets)                                 ║
╠═══════════════════════════════════════════════════════════════╣

MASTER MATERIALS:
□ M_KaiJax_Body_Master        Full PBR + fur + emissive
□ M_KaiJax_Eye_Master         Dual-color eye shader
□ M_KaiJax_Claw_Master        Obsidian + vein glow

MATERIAL INSTANCES:
□ MI_KaiJax_Body_Fur          Body with fur params
□ MI_KaiJax_Body_NoFur        Mobile fallback
□ MI_KaiJax_Eye_Left          Gold (Kai)
□ MI_KaiJax_Eye_Right         Blue (Jax)
□ MI_KaiJax_Claw              Animated veins

TAIL MATERIALS (9):
□ MI_Tail_Ember               Orange/red glow
□ MI_Tail_Gale                Cyan/wind flow
□ MI_Tail_Shade               Purple/void
□ MI_Tail_Volt                Yellow/electric
□ MI_Tail_Stone               Gray/moss
□ MI_Tail_Tide                Blue/water
□ MI_Tail_Thorn               Green/growth
□ MI_Tail_Prism               White/rainbow
□ MI_Tail_Void                Black/distortion

╚═══════════════════════════════════════════════════════════════╝
```

### 7.2 Enemy Materials

```
╔═══════════════════════════════════════════════════════════════╗
║  ENEMY MATERIALS (20 Assets)                                   ║
╠═══════════════════════════════════════════════════════════════╣

ITERATOR:
□ M_Iterator_Body             Red/black PBR
□ M_Iterator_Circuits         Emissive circuits
□ M_Iterator_Circuits_Adapt   Bright circuits (adapted)

NULL STALKER:
□ M_NullStalker_Body          Purple/translucent
□ M_NullStalker_Fade          Dissolve shader
□ M_NullStalker_Trail         Smoke material

BASTION:
□ M_Bastion_Armor             Gray metal PBR
□ M_Bastion_Damaged           Cracked variant
□ M_Bastion_WeakPoint         Glowing vulnerability

PHASE WEAVER:
□ M_PhaseWeaver_Body          Cyan/ghostly
□ M_PhaseWeaver_Afterimage    Screen-space blur
□ M_PhaseWeaver_Teleport      Phase distortion

CROWN WARDEN:
□ M_CrownWarden_Body_Phase1   White/gold base
□ M_CrownWarden_Body_Phase2   Darker variant
□ M_CrownWarden_Body_Phase3   Armored variant
□ M_CrownWarden_Body_Phase4   Corrupted variant
□ M_CrownWarden_Crown         Always glowing

╚═══════════════════════════════════════════════════════════════╝
```

### 7.3 Texture Assets

```
╔═══════════════════════════════════════════════════════════════╗
║  TEXTURE ASSETS (40+ Assets)                                   ║
╠═══════════════════════════════════════════════════════════════╣

KAI-JAX TEXTURES (Per LOD):
□ T_KaiJax_Albedo_4K          4096x4096, BC7
□ T_KaiJax_Normal_4K          4096x4096, BC5
□ T_KaiJax_ORM_2K             2048x2048, BC7
□ T_KaiJax_Emissive_1K        1024x1024, BC4
□ T_KaiJax_FurDirection_1K    1024x1024, BC7
□ T_KaiJax_Albedo_2K          (LOD1)
□ T_KaiJax_Albedo_1K          (LOD2)
□ T_KaiJax_Albedo_512         (LOD3/Mobile)

TAIL TEXTURES (Per Tail):
□ T_Tail_[Name]_Albedo        512x512
□ T_Tail_[Name]_Normal        512x512
□ T_Tail_[Name]_Emissive      256x256

ENEMY TEXTURES:
□ T_Iterator_Albedo_2K        2048x2048
□ T_Iterator_Normal_2K        2048x2048
□ T_Iterator_ORM_1K           1024x1024
□ T_Iterator_Circuits_1K      1024x1024 (emissive mask)
... (repeat for all enemies)

FUR TEXTURES:
□ T_Fur_Noise_256             256x256, alpha noise
□ T_Fur_Direction_256         256x256, flow map

╚═══════════════════════════════════════════════════════════════╝
```

---

## 8. UI ASSETS

### 8.1 HUD Elements

```
╔═══════════════════════════════════════════════════════════════╗
║  HUD UI ASSETS (25 Assets)                                     ║
╠═══════════════════════════════════════════════════════════════╣

HEALTH/METERS:
□ UI_HUD_HealthBar_Frame      Frame graphic
□ UI_HUD_HealthBar_Fill       Animated fill
□ UI_HUD_HealthBar_Damage     Delayed damage indicator
□ UI_HUD_SynergyMeter_Frame   Tail meter frame
□ UI_HUD_SynergyMeter_Fill    Per-element fill color
□ UI_HUD_ResonanceMeter       Secondary meter

TAIL DISPLAY:
□ UI_HUD_TailWheel            Radial selector
□ UI_HUD_TailIcon_Ember       Tail 1 icon
□ UI_HUD_TailIcon_Gale        Tail 2 icon
□ UI_HUD_TailIcon_Shade       Tail 3 icon
□ UI_HUD_TailIcon_Volt        Tail 4 icon
□ UI_HUD_TailIcon_Stone       Tail 5 icon
□ UI_HUD_TailIcon_Tide        Tail 6 icon
□ UI_HUD_TailIcon_Thorn       Tail 7 icon
□ UI_HUD_TailIcon_Prism       Tail 8 icon
□ UI_HUD_TailIcon_Void        Tail 9 icon

ENEMY INDICATORS:
□ UI_HUD_EnemyHealth_Frame    Enemy health bar frame
□ UI_HUD_EnemyHealth_Fill     Enemy health fill
□ UI_HUD_EnemyAdapt_Icon      Adaptation indicator
□ UI_HUD_BossHealth_Frame     Boss health (larger)

COMBAT FEEDBACK:
□ UI_HUD_DamageNumber         Floating damage text
□ UI_HUD_ComboCounter         Combo hit counter
□ UI_HUD_HitMarker            Hit confirmation flash

╚═══════════════════════════════════════════════════════════════╝
```

### 8.2 Menu UI

```
╔═══════════════════════════════════════════════════════════════╗
║  MENU UI ASSETS (30 Assets)                                    ║
╠═══════════════════════════════════════════════════════════════╣

MAIN MENU:
□ UI_Menu_Background          Full-screen BG
□ UI_Menu_Logo                Game logo
□ UI_Menu_Button_Normal       Button default state
□ UI_Menu_Button_Hover        Button hover state
□ UI_Menu_Button_Selected     Button selected state

PAUSE MENU:
□ UI_Pause_Background         Blur/darken overlay
□ UI_Pause_Panel              Menu panel frame
□ UI_Pause_Divider            Section dividers

INVENTORY/UPGRADE:
□ UI_Inventory_Slot           Item slot graphic
□ UI_Inventory_Slot_Selected  Selected slot
□ UI_Upgrade_Tree_Node        Upgrade node
□ UI_Upgrade_Tree_Line        Connection line
□ UI_Upgrade_Lock             Locked indicator
□ UI_Upgrade_Fragment_Icon    Memory Fragment icon

MAP:
□ UI_Map_Background           Map texture base
□ UI_Map_PlayerMarker         Player position
□ UI_Map_ObjectiveMarker      Quest target
□ UI_Map_EnemyMarker          Enemy indicator
□ UI_Map_DiscoveredArea       Revealed area mask
□ UI_Map_FogOfWar             Unrevealed area

DIALOGUE:
□ UI_Dialogue_Box             Speech box frame
□ UI_Dialogue_NamePlate       Speaker name frame
□ UI_Dialogue_Portrait_Frame  Character portrait frame
□ UI_Dialogue_Choice_Button   Dialogue choice button

LOADING:
□ UI_Loading_Background       Loading screen BG
□ UI_Loading_Bar_Frame        Progress bar frame
□ UI_Loading_Bar_Fill         Progress bar fill
□ UI_Loading_Tip_Box          Tip display box

╚═══════════════════════════════════════════════════════════════╝
```

---

## 9. ENVIRONMENT ASSETS

### 9.1 Arena Assets (Combat Zones)

```
╔═══════════════════════════════════════════════════════════════╗
║  ARENA ENVIRONMENT ASSETS                                      ║
╠═══════════════════════════════════════════════════════════════╣

ASHBLOCK HEIGHTS (Neon City):
□ SM_Ashblock_Floor_Tile       2m × 2m modular
□ SM_Ashblock_Wall_Section     4m × 3m modular
□ SM_Ashblock_Pillar           Support pillar
□ SM_Ashblock_Barrier          Arena boundary
□ SM_Ashblock_Neon_Sign        Decorative signs
□ SM_Ashblock_Platform         Elevated platform
□ M_Ashblock_Concrete          Wet concrete material
□ M_Ashblock_Neon              Emissive neon material

FANGFORGE WASTES (Industrial Desert):
□ SM_Fangforge_Floor_Sand      Sand terrain tile
□ SM_Fangforge_Floor_Metal     Metal floor plate
□ SM_Fangforge_Smokestack      Background prop
□ SM_Fangforge_Crane           Destroyed crane
□ SM_Fangforge_Tank            Industrial tank
□ SM_Fangforge_Bones           Giant bones scatter
□ M_Fangforge_Sand             Teal-tinted sand
□ M_Fangforge_Metal            Rusted metal

VEIL SCAR (Fractured Time):
□ SM_VeilScar_Float_Platform   Floating debris
□ SM_VeilScar_Crystal          Time crystals
□ SM_VeilScar_Rift             Reality tear mesh
□ SM_VeilScar_Debris_Large     Large floating rock
□ SM_VeilScar_Debris_Small     Small fragments
□ M_VeilScar_Distortion        Screen distortion material
□ M_VeilScar_Crystal           Refractive crystal

MEMORY GROVE (Bio-luminescent Forest):
□ SM_MemoryGrove_Tree          Large tree
□ SM_MemoryGrove_Mushroom      Glowing mushroom
□ SM_MemoryGrove_Root          Ground roots
□ SM_MemoryGrove_Flower        Luminescent flower
□ SM_MemoryGrove_Pond          Water feature
□ M_MemoryGrove_Bark           Bioluminescent bark
□ M_MemoryGrove_Fog            Volumetric fog

ABYSSAL ENGINE (Living Machine):
□ SM_Abyssal_Floor_Organic     Living floor tile
□ SM_Abyssal_Wall_Flesh        Organic wall section
□ SM_Abyssal_Pillar_Bone       Bone pillar
□ SM_Abyssal_Machinery         Moving gears
□ SM_Abyssal_Eye               Watching eye (animated)
□ SM_Abyssal_Tentacle          Animated tentacle
□ M_Abyssal_Flesh              Organic pulsing material
□ M_Abyssal_Metal              Corrupted metal

╚═══════════════════════════════════════════════════════════════╝
```

### 9.2 Props & Interactables

```
╔═══════════════════════════════════════════════════════════════╗
║  INTERACTIVE PROPS (20 Assets)                                 ║
╠═══════════════════════════════════════════════════════════════╣

PICKUPS:
□ SM_Pickup_HealthOrb          Health restoration
□ SM_Pickup_MeterOrb           Synergy restoration
□ SM_Pickup_MemoryFragment     Upgrade currency
□ SM_Pickup_RareFragment       Rare fragment (glowing)

CHECKPOINTS:
□ SM_Checkpoint_Crystal        Save point crystal
□ SM_Checkpoint_Platform       Platform beneath

DESTRUCTIBLES:
□ SM_Destructible_Crate        Wooden crate
□ SM_Destructible_Barrel       Metal barrel
□ SM_Destructible_Crystal      Shatter crystal

HAZARDS:
□ SM_Hazard_Spikes             Damage spikes
□ SM_Hazard_Fire               Fire pit
□ SM_Hazard_Electricity        Electric field
□ SM_Hazard_Void_Rift          Void damage zone

INTERACTABLES:
□ SM_Door_Standard             Locked door
□ SM_Door_Boss                 Boss arena door
□ SM_Switch_Lever              Activation lever
□ SM_Platform_Moving           Moving platform
□ SM_Teleporter                Area transition

╚═══════════════════════════════════════════════════════════════╝
```

---

## 10. PRODUCTION SCHEDULE REFERENCE

### 10.1 Asset Priority Matrix

```
╔═══════════════════════════════════════════════════════════════╗
║  PRIORITY LEVELS                                               ║
╠═══════════════════════════════════════════════════════════════╣

P0 (CRITICAL - Must Have for Alpha):
  □ Kai-Jax Model (LOD0-2)
  □ Kai-Jax Full Animation Set
  □ All 9 Tail Materials & VFX
  □ Iterator Enemy (Full)
  □ 1 Arena (Greybox → Polish)
  □ Core Combat VFX
  □ Core Combat SFX
  □ Basic HUD

P1 (HIGH - Must Have for Beta):
  □ Kai-Jax LOD3-4
  □ Null Stalker Enemy
  □ Bastion Enemy
  □ Phase Weaver Enemy
  □ 3 Additional Arenas
  □ Full UI System
  □ Music Tracks
  □ Allied NPC Models (Basic)

P2 (MEDIUM - For Launch):
  □ Crown Warden Boss
  □ All Ultimate Ability VFX
  □ Full Environment Polish
  □ All Arena Variants
  □ Full Audio Polish
  □ Cutscene Assets

P3 (LOW - Post-Launch):
  □ Additional Enemy Types
  □ Additional Arenas
  □ Cosmetic Variants
  □ DLC Content

╚═══════════════════════════════════════════════════════════════╝
```

### 10.2 Asset Count Summary

```
╔═══════════════════════════════════════════════════════════════╗
║  TOTAL ASSET COUNTS                                            ║
╠═══════════════════════════════════════════════════════════════╣

MODELS:
  Kai-Jax:        5 LODs + 9 Tails + Claws = ~17 meshes
  Enemies:        5 types × 3 LODs = 15 meshes
  NPCs:           3 characters × 2 LODs = 6 meshes
  Props:          ~50 static meshes
  Environment:    ~80 static meshes per region × 5 = ~400
  TOTAL MODELS:   ~490

ANIMATIONS:
  Kai-Jax:        ~70 animations
  Per Enemy:      ~15-25 animations
  Total Enemies:  ~90 animations
  TOTAL ANIMS:    ~160

VFX:
  Combat:         ~30
  Tails:          ~45
  Enemies:        ~20
  Environment:    ~15
  TOTAL VFX:      ~110

SFX:
  Combat:         ~40
  Tails:          ~45
  Enemies:        ~35
  UI:             ~15
  TOTAL SFX:      ~135

MUSIC:
  ~15 tracks

MATERIALS:
  Characters:     ~50
  Environment:    ~40
  VFX:            ~30
  TOTAL MATS:     ~120

UI ELEMENTS:
  ~60 unique assets

TEXTURES:
  ~150+ textures across all assets

╚═══════════════════════════════════════════════════════════════╝
```

### 10.3 File Naming Quick Reference

```
╔═══════════════════════════════════════════════════════════════╗
║  NAMING EXAMPLES                                               ║
╠═══════════════════════════════════════════════════════════════╣

Models:
  SK_KaiJax_Body_LOD0
  SK_Enemy_Iterator_LOD1
  SM_Ashblock_Floor_Tile

Animations:
  A_KaiJax_Attack_Light_01
  A_Iterator_Hit_Heavy
  A_KaiJax_Tail_Ember_Flare

Materials:
  M_KaiJax_Body_Master
  MI_Tail_Ember
  M_Ashblock_Concrete

Textures:
  T_KaiJax_Albedo_4K
  T_Iterator_Normal_2K
  T_Tail_Ember_Emissive

VFX:
  VFX_Hit_Heavy
  VFX_Tail_Gale_Ability
  VFX_Iterator_Death

SFX:
  SFX_Attack_Whoosh_Light
  SFX_Tail_Ember_Impact
  SFX_Iterator_Adapt

UI:
  UI_HUD_HealthBar_Frame
  UI_Menu_Button_Normal
  UI_Map_PlayerMarker

╚═══════════════════════════════════════════════════════════════╝
```

---

## APPENDIX A: ASSET CHECKLIST TEMPLATE

```
ASSET SIGN-OFF CHECKLIST:

□ File named according to convention
□ Correct folder location
□ LODs created (if applicable)
□ Materials assigned
□ Textures at correct resolution
□ Collision set up (if applicable)
□ Optimized for target platform
□ Tested in-engine
□ Approved by lead
□ Documentation updated

DATE: ___________
ARTIST: ___________
APPROVED BY: ___________
```

---

## APPENDIX B: TECHNICAL SPECIFICATIONS

```
TARGET SPECIFICATIONS:

TEXTURES:
  Max Resolution: 4096x4096 (LOD0)
  Format: BC7/ASTC (color), BC5/ASTC (normal)
  Mip Maps: Always generate
  
MESHES:
  Max Triangles (LOD0): 80,000 (player), 50,000 (boss)
  UV Channels: 2 minimum (diffuse, lightmap)
  Vertex Colors: Required for fur direction
  
ANIMATIONS:
  Frame Rate: 60 FPS
  Compression: ACL (UE5) / Default (Unity)
  Root Motion: Where applicable
  
VFX:
  Max Particles: 200 (ultimate), 50 (standard)
  Draw Calls: 4 max per system
  Texture Size: 256x256 max
  
AUDIO:
  Format: WAV (source), OGG (runtime)
  Sample Rate: 44100 Hz
  Bit Depth: 16-bit
```

---

**Document Version:** 1.0  
**Last Updated:** December 2025  
**Author:** Production Team  
**Status:** Production Ready  

---

*"When you know exactly what you need, you build exactly what you need."*

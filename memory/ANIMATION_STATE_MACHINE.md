# KAI-JAX ANIMATION STATE MACHINE DIAGRAM
## Production Bible v1.0

**Document Type:** Animation Technical Specification  
**Target Engines:** Unreal Engine 5 / Unity  
**Last Updated:** December 2025  
**Status:** Production Ready

---

## TABLE OF CONTENTS

1. [Animation Philosophy](#1-animation-philosophy)
2. [Master State Machine Overview](#2-master-state-machine-overview)
3. [Locomotion State Machine](#3-locomotion-state-machine)
4. [Combat State Machine](#4-combat-state-machine)
5. [Aerial State Machine](#5-aerial-state-machine)
6. [Reaction State Machine](#6-reaction-state-machine)
7. [Tail Animation Layer](#7-tail-animation-layer)
8. [Facial Animation Layer](#8-facial-animation-layer)
9. [Frame Timing Rules](#9-frame-timing-rules)
10. [Transition Rules Matrix](#10-transition-rules-matrix)
11. [Animation Event System](#11-animation-event-system)
12. [Blend Space Definitions](#12-blend-space-definitions)

---

## 1. ANIMATION PHILOSOPHY

### 1.1 Core Principles

```
THE FOUR PILLARS OF KAI-JAX ANIMATION:

┌─────────────────────────────────────────────────────────────┐
│  1. RESPONSIVENESS                                           │
│     - Actions begin on the SAME FRAME as input               │
│     - No blend-in delays for combat moves                    │
│     - Player should feel "attached" to the character         │
├─────────────────────────────────────────────────────────────┤
│  2. READABILITY                                              │
│     - Every attack has a distinct silhouette                 │
│     - Anticipation frames telegraph intent                   │
│     - Recovery frames show vulnerability                     │
├─────────────────────────────────────────────────────────────┤
│  3. WEIGHT                                                   │
│     - Heavy attacks feel heavy (slower, more follow-through) │
│     - Light attacks feel quick (snappy, minimal wind-down)   │
│     - Tails provide secondary motion weight                  │
├─────────────────────────────────────────────────────────────┤
│  4. DUALITY                                                  │
│     - Kai influence = aggressive, forward-leaning            │
│     - Jax influence = calculated, balanced                   │
│     - Fusion shows in asymmetric subtle details              │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Animation Frame Rate

**ALL animations authored at 60 FPS.**

This ensures frame-perfect timing matches game logic (which runs at fixed 60 updates/second).

| Animation Type | FPS | Reason |
|----------------|-----|--------|
| Combat | 60 | Frame data precision |
| Locomotion | 60 | Smooth blending |
| Facial | 30 (played at 60) | Performance, subtle enough |
| Tail Physics | Procedural | Runtime simulation |

---

## 2. MASTER STATE MACHINE OVERVIEW

### 2.1 Layer Architecture

```
ANIMATION LAYER STACK (Top to bottom):

┌─────────────────────────────────────────────────────────────┐
│  LAYER 5: ADDITIVE LAYER (Damage flash, breath, etc.)       │
│           Weight: 0.0 - 1.0 (situational)                   │
├─────────────────────────────────────────────────────────────┤
│  LAYER 4: FACIAL LAYER (Expressions, blinks, lip sync)      │
│           Weight: 1.0 (always active)                       │
│           Mask: Head bones only                             │
├─────────────────────────────────────────────────────────────┤
│  LAYER 3: TAIL LAYER (9 tail procedural + animation)        │
│           Weight: 1.0 (always active)                       │
│           Mask: Tail bones only                             │
├─────────────────────────────────────────────────────────────┤
│  LAYER 2: UPPER BODY COMBAT (Attacks, blocks)               │
│           Weight: 0.0 - 1.0 (active during combat)          │
│           Mask: Spine up (excludes legs)                    │
├─────────────────────────────────────────────────────────────┤
│  LAYER 1: FULL BODY BASE (Locomotion, idles, reactions)     │
│           Weight: 1.0 (always active)                       │
│           Mask: Full skeleton                               │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Master State Diagram

```
                            ┌─────────────────┐
                            │                 │
              ┌─────────────│    LOCOMOTION   │─────────────┐
              │             │   STATE MACHINE │             │
              │             └────────┬────────┘             │
              │                      │                      │
              │         Attack Input │ Jump Input           │
              │                      │                      │
              ▼                      ▼                      ▼
┌─────────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                     │    │                 │    │                 │
│   COMBAT STATE      │    │  AERIAL STATE   │    │  REACTION STATE │
│   MACHINE           │◄───│  MACHINE        │───►│  MACHINE        │
│                     │    │                 │    │                 │
└──────────┬──────────┘    └────────┬────────┘    └────────┬────────┘
           │                        │                      │
           │    Recovery Complete   │   Land / Hit         │
           │                        │                      │
           └────────────────────────┴──────────────────────┘
                                    │
                                    ▼
                         ┌─────────────────┐
                         │   LOCOMOTION    │
                         │   (Return)      │
                         └─────────────────┘
```

---

## 3. LOCOMOTION STATE MACHINE

### 3.1 Locomotion States

```
                              ┌───────────┐
                              │           │
                              │   IDLE    │◄──────────────────────┐
                              │           │                       │
                              └─────┬─────┘                       │
                                    │                             │
                    ┌───────────────┼───────────────┐             │
                    │               │               │             │
            Move Input      No Input (2s)     Block Input         │
                    │               │               │             │
                    ▼               ▼               ▼             │
              ┌───────────┐  ┌───────────┐  ┌───────────┐         │
              │           │  │   IDLE    │  │           │         │
              │   WALK    │  │  FIDGET   │  │   BLOCK   │         │
              │           │  │           │  │  (STANCE) │         │
              └─────┬─────┘  └─────┬─────┘  └─────┬─────┘         │
                    │              │              │               │
              Run Input      Fidget End     Release Block         │
                    │              │              │               │
                    ▼              │              │               │
              ┌───────────┐        │              │               │
              │           │        │              │               │
              │    RUN    │        │              │               │
              │           │        │              │               │
              └─────┬─────┘        │              │               │
                    │              │              │               │
              Dash Input           │              │               │
                    │              │              │               │
                    ▼              │              │               │
              ┌───────────┐        │              │               │
              │           │        │              │               │
              │   DASH    │────────┴──────────────┴───────────────┘
              │           │              (All return to IDLE)
              └───────────┘
```

### 3.2 Locomotion State Details

| State | Animation | Duration | Loop | Entry Condition | Exit Condition |
|-------|-----------|----------|------|-----------------|----------------|
| **IDLE** | idle_combat_ready | 120f | Yes | Default | Any input |
| **IDLE_FIDGET** | idle_fidget_01-03 | 90-150f | No | No input 2s | Animation end |
| **WALK** | walk_fwd/bwd/left/right | 60f cycle | Yes | Move input | Stop, run, attack |
| **RUN** | run_fwd | 40f cycle | Yes | Move + sprint | Stop, attack, dash |
| **DASH** | dash_fwd/bwd/left/right | 12f | No | Dash input | Animation end |
| **BLOCK_STANCE** | block_idle | 60f | Yes | Block held | Block release |

### 3.3 Locomotion Blend Space

```
MOVEMENT BLEND SPACE (2D):

                    FORWARD (+Y)
                         │
            walk_fwd_L   │   walk_fwd_R
               ╲         │         ╱
                ╲        │        ╱
    LEFT (-X) ───────────┼───────────── RIGHT (+X)
                ╱        │        ╲
               ╱         │         ╲
            walk_bwd_L   │   walk_bwd_R
                         │
                    BACKWARD (-Y)

BLEND SPACE PARAMETERS:
  - X Axis: Move Direction X (-1 to 1)
  - Y Axis: Move Direction Y (-1 to 1)
  - Speed: Controls Walk vs Run selection

ANIMATION POINTS:
  - (0, 1):    walk_forward / run_forward
  - (0, -1):   walk_backward / run_backward
  - (1, 0):    walk_right / run_right
  - (-1, 0):   walk_left / run_left
  - (0, 0):    idle (blend space minimum)
```

### 3.4 Locomotion Frame Data

| Animation | Total Frames | Cycle Point | Root Motion | Notes |
|-----------|--------------|-------------|-------------|-------|
| idle_combat | 120 | Loop | None | Weight shift at 60 |
| idle_fidget_01 | 90 | No loop | None | Ear twitch |
| idle_fidget_02 | 120 | No loop | None | Tail adjust |
| idle_fidget_03 | 150 | No loop | None | Look around |
| walk_forward | 60 | 30 (mid-step) | 4.0 units/cycle | |
| walk_backward | 70 | 35 | 3.0 units/cycle | Slower back |
| walk_strafe_L | 60 | 30 | 3.5 units/cycle | |
| walk_strafe_R | 60 | 30 | 3.5 units/cycle | |
| run_forward | 40 | 20 | 10.0 units/cycle | |
| dash_forward | 12 | N/A | 3.2 units/anim | No loop |
| dash_backward | 12 | N/A | 2.5 units/anim | |
| block_enter | 6 | N/A | None | Transition |
| block_idle | 60 | 30 | None | Subtle ready |
| block_exit | 8 | N/A | None | Transition |

---

## 4. COMBAT STATE MACHINE

### 4.1 Combat State Overview

```
                                    ┌───────────────┐
                                    │    NEUTRAL    │
                                    │   (Loco SM)   │
                                    └───────┬───────┘
                                            │
                              Attack Input  │
                                            │
                                            ▼
                                    ┌───────────────┐
                                    │               │
                        ┌──────────►│    STARTUP    │◄──────────┐
                        │           │               │           │
                        │           └───────┬───────┘           │
                        │                   │                   │
                        │       Startup Complete                │
                        │                   │                   │
                Cancel  │                   ▼                   │ Cancel
               (Chain)  │           ┌───────────────┐           │ (Chain)
                        │           │               │           │
                        │           │    ACTIVE     │           │
                        │           │   (HITBOX)    │           │
                        │           │               │           │
                        │           └───────┬───────┘           │
                        │                   │                   │
                        │         Active Complete               │
                        │                   │                   │
                        │                   ▼                   │
                        │           ┌───────────────┐           │
                        │           │               │           │
                        └───────────│   RECOVERY    │───────────┘
                                    │               │
                                    └───────┬───────┘
                                            │
                                Recovery Complete
                                            │
                                            ▼
                                    ┌───────────────┐
                                    │    NEUTRAL    │
                                    └───────────────┘
```

### 4.2 Attack Chain System

```
ATTACK CHAIN GRAPH:

LIGHT ATTACK (L):
  L → L → L → END (3-hit string)
  L → L → H → END (mix-up into heavy)
  L → S → END (cancel into special)

HEAVY ATTACK (H):
  H → H → END (2-hit string)
  H → S → END (cancel into special)

SPECIAL ATTACK (S):
  S → END (no chain from special)

CHAIN NOTATION:
┌─────┐      ┌─────┐      ┌─────┐
│ L1  │─────►│ L2  │─────►│ L3  │───► END
└──┬──┘      └──┬──┘      └─────┘
   │            │
   ▼            ▼
┌─────┐      ┌─────┐
│ H1  │─────►│ H2  │───► END
└──┬──┘      └─────┘
   │
   ▼
┌─────┐
│  S  │───► END
└─────┘
```

### 4.3 Combat Animation List

| Move ID | Animation Name | Startup | Active | Recovery | Total | Damage |
|---------|----------------|---------|--------|----------|-------|--------|
| **LIGHT ATTACKS** | | | | | | |
| L1 | attack_light_01 | 4f | 3f | 8f | 15f | 8 |
| L2 | attack_light_02 | 5f | 3f | 9f | 17f | 10 |
| L3 | attack_light_03 | 6f | 4f | 12f | 22f | 14 |
| **HEAVY ATTACKS** | | | | | | |
| H1 | attack_heavy_01 | 10f | 5f | 18f | 33f | 20 |
| H2 | attack_heavy_02 | 12f | 6f | 20f | 38f | 28 |
| **SPECIAL ATTACKS** | | | | | | |
| S_EMBER | tail_ember_flare | 8f | 6f | 20f | 34f | 22 |
| S_GALE | tail_gale_ridge | 2f | 12f | 8f | 22f | 0 (utility) |
| S_SHADE | tail_shade_counter | 1f | 15f | 25f | 41f | Reflect |
| S_VOLT | tail_volt_bind | 5f | 4f | 15f | 24f | 12 |
| S_STONE | tail_stone_quake | 15f | 8f | 25f | 48f | 18 |
| S_TIDE | tail_tide_wave | 10f | 20f | 15f | 45f | 15 |
| S_THORN | tail_thorn_trap | 20f | 180f | 20f | 220f | Trap |
| S_PRISM | tail_prism_mirror | 3f | 8f | 30f | 41f | Parry |
| S_VOID | tail_void_denial | 30f | 1f | 60f | 91f | Cancel |
| **DASH ATTACKS** | | | | | | |
| DASH_L | dash_attack_light | 6f | 8f | 14f | 28f | 12 |
| DASH_H | dash_attack_heavy | 8f | 10f | 18f | 36f | 24 |

### 4.4 Combat State Frame Windows

```
ATTACK PHASE BREAKDOWN (Example: L1):

Frame:  0  1  2  3  4  5  6  7  8  9 10 11 12 13 14
        ├──────────┼────────┼────────────────────────┤
        │ STARTUP  │ ACTIVE │      RECOVERY          │
        │  4 frm   │ 3 frm  │       8 frm            │
        │          │        │                        │
        │          │  HIT   │                        │
        │          │ ACTIVE │                        │
        │          │        │                        │
        ▼          ▼        ▼                        ▼
      [INPUT]   [HITBOX] [HITBOX]              [RETURN TO
      RECEIVED   SPAWNS   DESPAWN               NEUTRAL]

CANCEL WINDOW (on hit):
Frame:  0  1  2  3  4  5  6  7  8  9 10 11 12 13 14
                       ├────────────────┤
                       │ CANCEL ALLOWED │
                       │  (if hit)      │
                       │  frames 4-10   │

BUFFER WINDOW:
Frame: -6 -5 -4 -3 -2 -1  0  1  2  3  4  5  6
       ├─────────────────┤
       │  INPUT BUFFER   │
       │  6 frames early │
       │  accepted       │
```

### 4.5 Hit Confirm States

```
ON HIT CONFIRM:

┌───────────────┐
│    ACTIVE     │
│   (Attack)    │
└───────┬───────┘
        │
  Hit Detected
        │
        ▼
┌───────────────┐     ┌───────────────┐
│   HIT_STOP    │────►│  CANCEL_OK    │
│  (Freeze)     │     │  (Continue)   │
│               │     │               │
│  4-15 frames  │     │  Buffer check │
│  based on wt  │     │  for chain    │
└───────────────┘     └───────────────┘

HIT_STOP DURATIONS:
  - Light hit:   4 frames (67ms)
  - Medium hit:  6 frames (100ms)
  - Heavy hit:  10 frames (167ms)
  - Special:    15 frames (250ms)
```

---

## 5. AERIAL STATE MACHINE

### 5.1 Aerial States

```
                              ┌───────────────┐
                              │   GROUNDED    │
                              │   (Loco SM)   │
                              └───────┬───────┘
                                      │
                               Jump Input
                                      │
                                      ▼
                              ┌───────────────┐
                              │               │
                              │  JUMP_SQUAT   │  (Anticipation)
                              │    3 frames   │
                              │               │
                              └───────┬───────┘
                                      │
                                      ▼
                              ┌───────────────┐
                              │               │
               ┌──────────────│    RISING     │──────────────┐
               │              │               │              │
               │              └───────┬───────┘              │
               │                      │                      │
         Air Attack            Apex (Vy ≤ 0)            Air Dash
               │                      │                      │
               ▼                      ▼                      ▼
        ┌───────────────┐     ┌───────────────┐     ┌───────────────┐
        │               │     │               │     │               │
        │  AIR_ATTACK   │     │   FALLING     │     │   AIR_DASH    │
        │               │     │               │     │   (12 frm)    │
        │               │     │               │     │               │
        └───────┬───────┘     └───────┬───────┘     └───────┬───────┘
                │                     │                     │
                └──────────┬──────────┘                     │
                           │                                │
                    Ground Contact                          │
                           │                                │
                           ▼                                │
                   ┌───────────────┐                        │
                   │               │                        │
                   │    LANDING    │◄───────────────────────┘
                   │   3-8 frames  │
                   │               │
                   └───────┬───────┘
                           │
                           ▼
                   ┌───────────────┐
                   │   GROUNDED    │
                   └───────────────┘
```

### 5.2 Aerial Animation List

| State | Animation | Frames | Loop | Root Motion |
|-------|-----------|--------|------|-------------|
| JUMP_SQUAT | jump_squat | 3 | No | None |
| RISING | jump_rise | 30 | No | 18.0 up |
| APEX | jump_apex | 10 | Yes (brief) | None |
| FALLING | jump_fall | 40 | Yes | Gravity |
| LANDING_LIGHT | land_light | 3 | No | None |
| LANDING_HEAVY | land_heavy | 8 | No | None |
| AIR_DASH | air_dash_fwd | 12 | No | 3.0 horiz |
| AIR_ATTACK_L | air_attack_light | 20 | No | None |
| AIR_ATTACK_H | air_attack_heavy | 28 | No | None |
| DOUBLE_JUMP | double_jump | 20 | No | 12.0 up |

### 5.3 Aerial Frame Rules

```
JUMP ANATOMY:

             ┌─────────────────────────────────────────┐
             │                  APEX                   │
             │               (10 frm)                  │
        /────┴────\                              /────┴────\
       /           \                            /           \
      /             \                          /             \
RISE /               \ FALL                   /               \
(30f)                 (∞)                    /                 \
    /                   \                   /                   \
───┴───                  ───┬───────────────┴───                ───┬───
SQUAT                      LAND                                   GROUND
(3f)                       (3-8f)

TIMING:
  - Squat: ALWAYS 3 frames (no skip, no extend)
  - Rise: Up to 30 frames (can be cut short by ceiling)
  - Apex: 10 frames of hang time (can attack here)
  - Fall: Until ground contact
  - Land: 3f (light) or 8f (from height/attack)

DOUBLE JUMP (Gale Tail):
  - Available once per air time
  - Resets velocity
  - 20 frame animation
  - Can chain into air attack
```

---

## 6. REACTION STATE MACHINE

### 6.1 Reaction States

```
                              ┌───────────────┐
                              │     ANY       │
                              │    STATE      │
                              └───────┬───────┘
                                      │
                               Hit Received
                                      │
                         ┌────────────┼────────────┐
                         │            │            │
                    Not Blocking  Blocking    Counter Hit
                         │            │            │
                         ▼            ▼            ▼
                  ┌───────────┐ ┌───────────┐ ┌───────────┐
                  │           │ │           │ │           │
                  │  HITSTUN  │ │ BLOCKSTUN │ │  COUNTER  │
                  │           │ │           │ │  HITSTUN  │
                  │  12-24f   │ │   6-12f   │ │  18-36f   │
                  │           │ │           │ │ (1.5x)    │
                  └─────┬─────┘ └─────┬─────┘ └─────┬─────┘
                        │             │             │
                        │             │      ┌──────┘
                        │             │      │
                  ┌─────▼─────┐       │      │
                  │           │       │      │
                  │ KNOCKDOWN?│───────┼──────┘
                  │  (Launch) │       │
                  │           │       │
                  └─────┬─────┘       │
                        │             │
                  Yes   │       No    │
                        │             │
                  ┌─────▼─────┐ ┌─────▼─────┐
                  │           │ │           │
                  │ KNOCKDOWN │ │  NEUTRAL  │
                  │   (30f)   │ │ (Return)  │
                  │           │ │           │
                  └─────┬─────┘ └───────────┘
                        │
                        ▼
                  ┌───────────┐
                  │           │
                  │  WAKEUP   │
                  │  (20f)    │
                  │ (I-Frame) │
                  │           │
                  └─────┬─────┘
                        │
                        ▼
                  ┌───────────┐
                  │  NEUTRAL  │
                  └───────────┘
```

### 6.2 Reaction Animation List

| State | Animation | Frames | Invincible | Notes |
|-------|-----------|--------|------------|-------|
| **HITSTUN** | | | | |
| HITSTUN_LIGHT | hit_react_light | 12 | No | Head snap back |
| HITSTUN_MEDIUM | hit_react_medium | 18 | No | Torso recoil |
| HITSTUN_HEAVY | hit_react_heavy | 24 | No | Full body stagger |
| **BLOCKSTUN** | | | | |
| BLOCKSTUN_LIGHT | block_react_light | 6 | No | Arm absorb |
| BLOCKSTUN_MEDIUM | block_react_medium | 8 | No | Body brace |
| BLOCKSTUN_HEAVY | block_react_heavy | 12 | No | Push back |
| **KNOCKDOWN** | | | | |
| LAUNCH | hit_launch | 15 | No | Sent airborne |
| KNOCKDOWN_FALL | knockdown_fall | 20 | No | In air → ground |
| KNOCKDOWN_GROUND | knockdown_ground | 30 | No | Lying down |
| WAKEUP_NORMAL | wakeup_normal | 20 | Yes (all) | Roll to feet |
| WAKEUP_ATTACK | wakeup_attack | 25 | Yes (12f) | Attack on rise |
| **SPECIAL REACTIONS** | | | | |
| CRUMPLE | hit_crumple | 45 | No | Slow fall |
| WALL_BOUNCE | hit_wall_bounce | 25 | No | Off wall |
| GROUND_BOUNCE | hit_ground_bounce | 20 | No | Bounce up |

### 6.3 Damage Animation Variants

```
HIT DIRECTION VARIANTS:

For each hitstun level, 4 directional variants:

     FROM_FRONT           FROM_BACK
         ↓                    ↓
    ┌─────────┐          ┌─────────┐
    │  BODY   │          │  BODY   │
    │ RECOILS │          │ STUMBLES│
    │  BACK   │          │ FORWARD │
    └─────────┘          └─────────┘

     FROM_LEFT           FROM_RIGHT
         ↓                    ↓
    ┌─────────┐          ┌─────────┐
    │  BODY   │          │  BODY   │
    │ TWISTS  │          │ TWISTS  │
    │  RIGHT  │          │  LEFT   │
    └─────────┘          └─────────┘

ANIMATION NAMING:
  hit_react_light_front
  hit_react_light_back
  hit_react_light_left
  hit_react_light_right
  ... (repeat for medium, heavy)
```

---

## 7. TAIL ANIMATION LAYER

### 7.1 Tail Layer Architecture

```
TAIL ANIMATION SYSTEM:

┌─────────────────────────────────────────────────────────────┐
│                    TAIL LAYER                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│    ┌──────────────────────────────────────────────┐         │
│    │           BASE TAIL POSE                      │         │
│    │  (From current animation - additive base)     │         │
│    └──────────────────┬───────────────────────────┘         │
│                       │                                      │
│                       ▼                                      │
│    ┌──────────────────────────────────────────────┐         │
│    │         ACTIVE TAIL OVERRIDE                  │         │
│    │   (Elevated position, procedural motion)      │         │
│    │   Weight: 1.0 on active tail, 0.0 others      │         │
│    └──────────────────┬───────────────────────────┘         │
│                       │                                      │
│                       ▼                                      │
│    ┌──────────────────────────────────────────────┐         │
│    │           PHYSICS SIMULATION                  │         │
│    │      (All tails, simulated each frame)        │         │
│    │   Stiffness varies: Active=0.8, Inactive=0.5  │         │
│    └──────────────────┬───────────────────────────┘         │
│                       │                                      │
│                       ▼                                      │
│    ┌──────────────────────────────────────────────┐         │
│    │           ABILITY ANIMATION                   │         │
│    │     (Plays during tail ability startup)       │         │
│    │   Overrides physics for ability's duration    │         │
│    └──────────────────────────────────────────────┘         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Tail Animation States

| State | Active Tail Behavior | Inactive Tail Behavior |
|-------|---------------------|------------------------|
| IDLE | Elevated, slow sway (0.5Hz) | Hanging, minimal sway |
| WALK | Elevated, counter-swing | Slight bounce |
| RUN | Forward-swept, tight swing | Streaming backward |
| COMBAT_READY | Raised high, tense | Spread ready |
| ATTACKING | Follows attack (element-specific) | Reactive whip |
| HITSTUN | Flail (physics dominant) | Flail |
| KNOCKDOWN | Limp (physics dominant) | Limp |
| TAIL_SWITCH | Transition animation (6f) | Brief pulse |

### 7.3 Per-Tail Ability Animations

| Tail | Ability Animation | Frames | Special Motion |
|------|-------------------|--------|----------------|
| Ember | tail_ember_flare | 34 | Whip forward, fire burst |
| Gale | tail_gale_ridge | 22 | Spin around body |
| Shade | tail_shade_counter | 41 | Coil defensively |
| Volt | tail_volt_bind | 24 | Extend straight, arc |
| Stone | tail_stone_quake | 48 | Slam into ground |
| Tide | tail_tide_wave | 45 | Sweeping arc |
| Thorn | tail_thorn_trap | 220 | Plant into ground |
| Prism | tail_prism_mirror | 41 | Shield-like spread |
| Void | tail_void_denial | 91 | Spiral inward |

### 7.4 Tail Physics Parameters

```
PHYSICS SETTINGS PER TAIL BONE:

                BASE    TIP
              ──────────────
Stiffness:     0.8     0.2    (decreases toward tip)
Damping:       0.3     0.3    (constant)
Gravity:       0.5     0.5    (constant)
Mass:          1.0     0.2    (decreases toward tip)
Max Angle:     45°     60°    (increases toward tip)

ACTIVE TAIL MODIFIER:
  Stiffness: +0.2 (more controlled)
  Damping: +0.1 (less floaty)
  Gravity: -0.2 (floats more)

PHYSICS UPDATE ORDER:
  1. Apply animation pose as target
  2. Simulate physics toward target
  3. Blend result (0.7 physics, 0.3 animation)
  4. Apply collision constraints
```

---

## 8. FACIAL ANIMATION LAYER

### 8.1 Facial State Machine

```
                           ┌───────────────┐
                           │               │
                           │   NEUTRAL     │◄─────────────────┐
                           │               │                  │
                           └───────┬───────┘                  │
                                   │                          │
               ┌───────────────────┼───────────────────┐      │
               │                   │                   │      │
         Combat State         Hit Taken           Ability     │
               │                   │                   │      │
               ▼                   ▼                   ▼      │
        ┌───────────┐       ┌───────────┐       ┌───────────┐ │
        │           │       │           │       │           │ │
        │  COMBAT   │       │   PAIN    │       │  FOCUSED  │ │
        │  (Fierce) │       │           │       │           │ │
        │           │       │           │       │           │ │
        └─────┬─────┘       └─────┬─────┘       └─────┬─────┘ │
              │                   │                   │       │
              └───────────────────┴───────────────────┴───────┘
                           (Return after duration)
```

### 8.2 Facial Expression Definitions

| Expression | Brow L | Brow R | Eyes | Ears | Mouth | Duration |
|------------|--------|--------|------|------|-------|----------|
| **NEUTRAL** | 0.0 | 0.0 | Normal | Relaxed | Closed | ∞ |
| **COMBAT** | 0.3 (lower) | 0.2 (lower) | Narrow | Back | Slight sneer | Active |
| **PAIN** | 0.5 (raise) | 0.5 (raise) | Squint | Flat | Open grimace | 0.5s |
| **FOCUSED** | 0.2 (lower) | 0.3 (lower) | Wide | Forward | Tight | Ability |
| **RAGE** | 0.7 (lower) | 0.5 (lower) | Wide | Full back | Full snarl | Low HP |
| **VICTORY** | 0.2 (raise) | 0.2 (raise) | Normal | Perk | Slight smile | End |
| **STUNNED** | 0.3 (raise) | 0.3 (raise) | Wide | Droop | Slack | Stun dur |

### 8.3 Blink System

```
BLINK TIMING:

Average Interval: 5.0 seconds
Random Range: ±2.0 seconds (3s to 7s)
Blink Duration: 0.15 seconds (9 frames)

BLINK ANIMATION CURVE:
Frame: 0  1  2  3  4  5  6  7  8
       ├──┴──┴──┴──┴──┴──┴──┴──┤
       │                        │
Eye:   1.0→0.8→0.4→0.0→0.0→0.4→0.8→1.0
       Open                    Open

BLINK SUPPRESSION:
  - No blink during attack startup
  - No blink during hitstun
  - No blink when expression = FOCUSED
  - Resume normal blink otherwise
```

### 8.4 Eye Look-At System

```
EYE TRACKING:

Priority Targets (highest to lowest):
  1. Active enemy in combat range
  2. Interactive object highlighted
  3. Movement direction
  4. Forward (default)

TRACKING PARAMETERS:
  Speed: 400°/sec (fast, snappy)
  Max Horizontal: ±45°
  Max Vertical: ±30°
  Lead Factor: 0.1 (eyes lead head slightly)

HEAD FOLLOW:
  Eyes move first, head follows
  Head speed: 200°/sec
  Head max: ±60° horizontal, ±30° vertical
  Head returns to forward in idle
```

---

## 9. FRAME TIMING RULES

### 9.1 Universal Frame Rules

```
TIMING COMMANDMENTS:

┌─────────────────────────────────────────────────────────────┐
│  1. ALL COMBAT ANIMATIONS USE 60 FPS                        │
│     - No exceptions                                          │
│     - Frame count = timing precision                         │
├─────────────────────────────────────────────────────────────┤
│  2. INPUT → ACTION = SAME FRAME                              │
│     - Input on frame N, startup begins frame N               │
│     - No "wind up" before animation plays                    │
├─────────────────────────────────────────────────────────────┤
│  3. STARTUP FRAMES = COMMITMENT                              │
│     - Once in startup, cannot cancel (except special cases)  │
│     - This is where "reading" opponents happens              │
├─────────────────────────────────────────────────────────────┤
│  4. ACTIVE FRAMES = DAMAGE WINDOW                            │
│     - Hitbox exists ONLY during active frames                │
│     - Hitbox data tied to animation via notify               │
├─────────────────────────────────────────────────────────────┤
│  5. RECOVERY = VULNERABILITY                                 │
│     - Cannot act during recovery                             │
│     - Opponent's counter-attack window                       │
├─────────────────────────────────────────────────────────────┤
│  6. CANCEL = REWARD FOR SUCCESS                              │
│     - Cancel windows ONLY open on hit (not whiff)            │
│     - Chains reward aggression, not spam                     │
└─────────────────────────────────────────────────────────────┘
```

### 9.2 Frame Advantage Table

```
FRAME ADVANTAGE EXPLAINED:

On Hit:
  Attacker Recovery: R frames
  Defender Hitstun: H frames
  Advantage = H - R

  If positive: Attacker can act first
  If negative: Defender can act first
  If zero: Neutral

EXAMPLE (Light Attack L1):
  Recovery: 8 frames
  Hitstun: 12 frames
  Advantage: 12 - 8 = +4 frames

  → Attacker is +4 on hit (can follow up)

On Block:
  Attacker Recovery: R frames  
  Defender Blockstun: B frames
  Advantage = B - R

EXAMPLE (Light Attack L1):
  Recovery: 8 frames
  Blockstun: 6 frames
  Advantage: 6 - 8 = -2 frames

  → Attacker is -2 on block (defender can punish)
```

### 9.3 Complete Frame Data Table

| Move | Startup | Active | Recovery | Total | On Hit | On Block | Cancel Window |
|------|---------|--------|----------|-------|--------|----------|---------------|
| L1 | 4 | 3 | 8 | 15 | +4 | -2 | 4-10 (on hit) |
| L2 | 5 | 3 | 9 | 17 | +3 | -3 | 5-11 (on hit) |
| L3 | 6 | 4 | 12 | 22 | +2 | -6 | END |
| H1 | 10 | 5 | 18 | 33 | +6 | -8 | 10-18 (on hit) |
| H2 | 12 | 6 | 20 | 38 | +4 | -10 | END |
| Dash | 6 | 8 | 14 | 28 | +2 | -8 | 20-28 |
| Jump | 3 | - | - | 3 | - | - | - |
| Block Enter | 6 | - | - | 6 | - | - | - |
| Wakeup | - | - | 20 | 20 | - | - | Invincible |

---

## 10. TRANSITION RULES MATRIX

### 10.1 State Transition Matrix

```
FROM \ TO    │ IDLE │ WALK │ RUN  │ DASH │ JUMP │ ATTK │ BLCK │ HIT  │
─────────────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┤
IDLE         │  -   │  ✓   │  ✓   │  ✓   │  ✓   │  ✓   │  ✓   │  ✓   │
WALK         │  ✓   │  -   │  ✓   │  ✓   │  ✓   │  ✓   │  ✓   │  ✓   │
RUN          │  ✓   │  ✓   │  -   │  ✓   │  ✓   │  ✓   │  ✓   │  ✓   │
DASH         │  ✓*  │  ✗   │  ✗   │  ✗   │  ✗   │  ✓*  │  ✗   │  ✓   │
JUMP         │  ✓** │  ✗   │  ✗   │  ✓†  │  ✓‡  │  ✓   │  ✗   │  ✓   │
ATTACK       │  ✓*  │  ✗   │  ✗   │  ✗   │  ✗   │  ✓†† │  ✗   │  ✓   │
BLOCK        │  ✓   │  ✓   │  ✓   │  ✓   │  ✓   │  ✓   │  -   │  ✓   │
HIT          │  ✓*  │  ✗   │  ✗   │  ✗   │  ✗   │  ✗   │  ✗   │  -   │

LEGEND:
✓  = Immediate transition allowed
✗  = Transition blocked
✓* = After current state completes
✓**= On landing
✓† = Air dash (once per air time)
✓‡ = Double jump (Gale tail only)
✓††= Cancel on hit only
```

### 10.2 Transition Blend Times

| Transition | Blend Time | Method |
|------------|------------|--------|
| IDLE → WALK | 6 frames | Linear blend |
| WALK → RUN | 4 frames | Linear blend |
| RUN → IDLE | 8 frames | Ease out |
| ANY → ATTACK | 0 frames | Instant cut |
| ATTACK → IDLE | 0 frames | At recovery end |
| ANY → HIT | 0 frames | Instant cut |
| HIT → IDLE | 4 frames | Linear blend |
| ANY → JUMP | 0 frames | Instant (squat) |
| JUMP → IDLE | 0 frames | On land |
| IDLE → BLOCK | 6 frames | Linear blend |
| BLOCK → IDLE | 8 frames | Linear blend |

### 10.3 Interruption Priority

```
PRIORITY HIERARCHY (Highest to lowest):

1. HIT REACTION (always interrupts everything)
2. DEATH (terminal state)
3. KNOCKDOWN (from launcher)
4. BLOCK (if held and not in committed state)
5. DASH (committed once started)
6. ATTACK (committed once started)
7. JUMP (committed during squat)
8. LOCOMOTION (always interruptible)

COMMITTED STATES:
  - DASH: Cannot be cancelled for 12 frames
  - ATTACK STARTUP: Cannot be cancelled
  - ATTACK ACTIVE: Cannot be cancelled (except on hit)
  - JUMP SQUAT: Cannot be cancelled for 3 frames
```

---

## 11. ANIMATION EVENT SYSTEM

### 11.1 Animation Notify Types

```
NOTIFY EVENTS:

┌─────────────────────────────────────────────────────────────┐
│  AN_HitboxStart                                              │
│  - Frame: First active frame                                 │
│  - Data: Hitbox ID, damage, knockback                        │
│  - Action: Spawn hitbox at socket                            │
├─────────────────────────────────────────────────────────────┤
│  AN_HitboxEnd                                                │
│  - Frame: Last active frame                                  │
│  - Data: Hitbox ID                                           │
│  - Action: Destroy hitbox                                    │
├─────────────────────────────────────────────────────────────┤
│  AN_CanCancelStart                                           │
│  - Frame: First frame of cancel window                       │
│  - Data: Allowed cancel targets (move list)                  │
│  - Action: Enable cancel flag                                │
├─────────────────────────────────────────────────────────────┤
│  AN_CanCancelEnd                                             │
│  - Frame: Last frame of cancel window                        │
│  - Data: None                                                │
│  - Action: Disable cancel flag                               │
├─────────────────────────────────────────────────────────────┤
│  AN_PlaySFX                                                  │
│  - Frame: Impact/effect moment                               │
│  - Data: SFX name, volume, pitch variance                    │
│  - Action: Play audio                                        │
├─────────────────────────────────────────────────────────────┤
│  AN_SpawnVFX                                                 │
│  - Frame: Effect trigger                                     │
│  - Data: VFX prefab, socket, scale                           │
│  - Action: Spawn particle system                             │
├─────────────────────────────────────────────────────────────┤
│  AN_FootStep                                                 │
│  - Frame: Foot contact with ground                           │
│  - Data: Foot (L/R), surface type query                      │
│  - Action: Play footstep SFX, spawn dust                     │
├─────────────────────────────────────────────────────────────┤
│  AN_InvincibleStart / AN_InvincibleEnd                       │
│  - Frame: I-frame window                                     │
│  - Data: None                                                │
│  - Action: Toggle invincibility flag                         │
└─────────────────────────────────────────────────────────────┘
```

### 11.2 Notify Placement Example

```
ATTACK L1 NOTIFY TIMELINE:

Frame:  0  1  2  3  4  5  6  7  8  9 10 11 12 13 14
        │           │        │              │     │
        │           │        │              │     │
        │           │        │              │     └─ END
        │           │        │              │
        │           │        │              └─ AN_CanCancelEnd (10)
        │           │        │
        │           │        └─ AN_HitboxEnd (6)
        │           │
        │           ├─ AN_HitboxStart (4)
        │           └─ AN_CanCancelStart (4) [conditional on hit]
        │
        └─ AN_PlaySFX "attack_whoosh" (0)

VISUAL REPRESENTATION:
        ┌────────────┬──────────┬─────────────────────┐
        │   STARTUP  │  ACTIVE  │      RECOVERY       │
        │            │  HITBOX  │                     │
        │            │  EXISTS  │   CANCEL WINDOW     │
        │            │          │   (if hit)          │
        └────────────┴──────────┴─────────────────────┘
```

### 11.3 Notify Data Structures

```
// Hitbox Notify Data
struct HitboxNotifyData {
    int hitboxID;
    string socketName;        // "hand_r", "foot_l", etc.
    float damage;
    int hitstunFrames;
    int blockstunFrames;
    Vector2 knockback;
    HitboxShape shape;        // Sphere, Capsule, Box
    float radius;
    bool canJuggle;
}

// VFX Notify Data
struct VFXNotifyData {
    string vfxName;
    string socketName;
    Vector3 offset;
    Vector3 rotation;
    float scale;
    float duration;
    Color tint;               // For tail element color
}

// SFX Notify Data
struct SFXNotifyData {
    string sfxName;
    float volume;             // 0.0 - 1.0
    float pitchVariance;      // Random range around 1.0
    bool is3D;
    float maxDistance;
}
```

---

## 12. BLEND SPACE DEFINITIONS

### 12.1 Locomotion Blend Space

```
LOCOMOTION 2D BLEND SPACE:

Horizontal Axis: Move X (-1 to 1)
Vertical Axis: Move Y (-1 to 1)

Sample Points:
┌─────────────────────────────────────────┐
│                                         │
│           walk_forward (0,1)            │
│                  ●                      │
│                 /│\                     │
│                / │ \                    │
│   walk_left  /  │  \  walk_right       │
│   (-1,0) ●──────●──────● (1,0)         │
│              \  │  /                    │
│               \ │ /                     │
│                \│/                      │
│                 ●                       │
│          walk_backward (0,-1)           │
│                                         │
│           idle (0,0) at center          │
│                                         │
└─────────────────────────────────────────┘

BLEND METHOD: Triangulation
SMOOTH TIME: 0.15 seconds
```

### 12.2 Run Blend Space

```
RUN 1D BLEND SPACE (Speed):

Parameter: Speed (0 to 1)

Sample Points:
  0.0 ────────● idle
              │
  0.3 ────────● walk_forward
              │
  0.6 ────────● jog_forward
              │
  1.0 ────────● run_forward

BLEND METHOD: Linear interpolation
```

### 12.3 Aim Offset Blend Space

```
AIM OFFSET (for look direction):

Horizontal Axis: Look Yaw (-90 to 90)
Vertical Axis: Look Pitch (-30 to 30)

Sample Points:
┌─────────────────────────────────────────┐
│                                         │
│    look_up_left    look_up   look_up_R  │
│         ●            ●            ●     │
│                                         │
│    look_left       CENTER      look_R   │
│         ●            ●            ●     │
│                                         │
│    look_dn_left   look_dn   look_dn_R   │
│         ●            ●            ●     │
│                                         │
└─────────────────────────────────────────┘

LAYER: Additive on spine + neck + head
WEIGHT: 1.0 always
```

### 12.4 Hit Direction Blend Space

```
HIT REACTION BLEND SPACE:

Parameter: Hit Direction (0 to 360 degrees)

Sample Points:
         0° (Front)
            ●
           /│\
          / │ \
  270°   /  │  \   90°
  (Left)●───●───●(Right)
         \  │  /
          \ │ /
           \│/
            ●
        180° (Back)

Selection: Nearest sample (no blend)
Each has light/medium/heavy variants
```

---

## APPENDIX A: ANIMATION ASSET LIST

```
REQUIRED ANIMATIONS (Minimum Viable):

LOCOMOTION (12):
  □ idle_combat_ready
  □ idle_fidget_01
  □ idle_fidget_02  
  □ idle_fidget_03
  □ walk_forward
  □ walk_backward
  □ walk_left
  □ walk_right
  □ run_forward
  □ dash_forward
  □ dash_backward
  □ dash_side

COMBAT - GROUND (12):
  □ attack_light_01
  □ attack_light_02
  □ attack_light_03
  □ attack_heavy_01
  □ attack_heavy_02
  □ dash_attack_light
  □ dash_attack_heavy
  □ block_enter
  □ block_idle
  □ block_exit
  □ block_react_light
  □ block_react_heavy

COMBAT - AIR (6):
  □ air_attack_light
  □ air_attack_heavy
  □ air_dash
  □ jump_squat
  □ jump_rise
  □ jump_fall

REACTIONS (12):
  □ hit_react_light_front
  □ hit_react_light_back
  □ hit_react_medium_front
  □ hit_react_medium_back
  □ hit_react_heavy_front
  □ hit_react_heavy_back
  □ hit_launch
  □ knockdown_fall
  □ knockdown_ground
  □ wakeup_normal
  □ wakeup_attack
  □ death

TAIL ABILITIES (9):
  □ tail_ember_flare
  □ tail_gale_ridge
  □ tail_shade_counter
  □ tail_volt_bind
  □ tail_stone_quake
  □ tail_tide_wave
  □ tail_thorn_trap
  □ tail_prism_mirror
  □ tail_void_denial

TAIL SYSTEM (2):
  □ tail_switch
  □ tail_idle_active (procedural base)

TOTAL MINIMUM: 53 animations
```

---

## APPENDIX B: ANIMATION CHECKLIST

```
PER-ANIMATION CHECKLIST:

□ Frame count matches spec exactly
□ Root motion values verified
□ All notifies placed correctly:
   □ HitboxStart/End on active frames
   □ CanCancel on specified windows
   □ SFX on impact/whoosh frames
   □ VFX on effect frames
   □ Footsteps on contact frames
□ Blend in/out tested with transitions
□ No foot sliding during locomotion
□ Hitbox socket alignment verified
□ Silhouette readable at all frames
□ Anticipation telegraphs intent
□ Weight feels appropriate to attack
□ Tails react naturally (physics)
□ Facial expression appropriate
□ Ears respond to movement
□ Tested at all LOD levels
□ Performance within budget
```

---

**Document Version:** 1.0  
**Last Updated:** December 2025  
**Author:** Animation Team  
**Status:** Production Ready  

---

*"Every frame is a promise to the player."*

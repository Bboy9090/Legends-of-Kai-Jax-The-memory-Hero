# KAI-JAX CHARACTER BUILD SHEETS
## Production Bible v1.0

**Document Type:** Character Art Bible  
**Target Engines:** Unreal Engine 5 / Unity HDRP/URP  
**Last Updated:** December 2025  
**Status:** Production Ready

---

## TABLE OF CONTENTS

1. [Character Identity Overview](#1-character-identity-overview)
2. [Body Proportions & Measurements](#2-body-proportions--measurements)
3. [Fur Region Mapping](#3-fur-region-mapping)
4. [Glow Region Mapping](#4-glow-region-mapping)
5. [Tail Attachment System](#5-tail-attachment-system)
6. [Claw Structure](#6-claw-structure)
7. [Eye System & Color Logic](#7-eye-system--color-logic)
8. [Silhouette Rules](#8-silhouette-rules)
9. [Shader Requirements](#9-shader-requirements)
10. [LOD Specifications](#10-lod-specifications)
11. [Rig Requirements](#11-rig-requirements)
12. [Reference Gallery Guidelines](#12-reference-gallery-guidelines)

---

## 1. CHARACTER IDENTITY OVERVIEW

### 1.1 The Fusion

Kai-Jax is **two brothers in one body**:

| Brother | Role | Visual Influence | Personality Echo |
|---------|------|------------------|------------------|
| **Kai** | The Warrior | Left side dominant, gold eye, sharper features | Aggressive, action |
| **Jax** | The Scholar | Right side dominant, blue eye, softer edges | Calculated, strategic |

The fusion is **seamless but visible** — like two rivers meeting, not stitched parts. Artists must convey duality through asymmetry without making the character look broken.

### 1.2 Species Identity

Kai-Jax is a **Sabertooth Fox hybrid** with these defining traits:

| Feature | Description | Reference Species |
|---------|-------------|-------------------|
| Base Build | Bipedal digitigrade | Anthro fox |
| Face Structure | Elongated muzzle, prominent canines | Smilodon influence |
| Body Type | Athletic, lean muscle definition | Gymnast/martial artist |
| Ears | Large, triangular, highly mobile | Fox (Vulpes) |
| Hands | 4-digit + thumb, padded palms | Feline hybrid |
| Feet | Digitigrade, 4 forward toes + dewclaw | Canid/feline hybrid |

### 1.3 Core Visual Pillars

1. **Readable at any distance** — silhouette must be unmistakable
2. **Duality is subtle** — asymmetry, not patchwork
3. **Tails are power** — active tail is always the visual focus
4. **Combat-first design** — form enables believable movement
5. **Scalable beauty** — looks premium on PC and mobile

---

## 2. BODY PROPORTIONS & MEASUREMENTS

### 2.1 Height & Scale

```
STANDARD SCALE REFERENCE:
(1 unit = 1 meter in-game)

Total Height (neutral stance): 1.85 meters
Head Height: 0.28 meters (1:6.6 head-to-body ratio)
Shoulder Width: 0.55 meters
Arm Span: 2.00 meters (slightly longer than height)
Tail Length (each): 0.90-1.10 meters
Ear Height: 0.15 meters (from skull top)
```

### 2.2 Proportion Diagram

```
                    ┌──────┐
                    │ EARS │ 0.15m
                    ├──────┤
                    │ HEAD │ 0.28m
                    ├──────┤
                   /│      │\
        ┌─────────┤│TORSO │├─────────┐
        │   ARM   ││      ││   ARM   │  0.70m (shoulder to wrist)
        └────┬────┤├──────┤├────┬────┘
             │    ││ CORE ││    │
             │    │├──────┤│    │       0.35m
             │    ││ HIPS ││    │
             │    │├──────┤│    │       0.20m
             │    ││      ││    │
             │    ││ THIGH││    │       0.45m
             │    │├──────┤│    │
             │    ││ SHIN ││    │       0.40m
             │    ││      ││    │
             │    │├──────┤│    │
             │    ││ FOOT ││    │       0.12m (heel to ball)
             └────┴┴──────┴┴────┘
                   GROUND

TOTAL: 1.85m standing, ~1.60m at rest (digitigrade compensation)
```

### 2.3 Body Zone Measurements

| Zone | Measurement | Notes |
|------|-------------|-------|
| **Head** | | |
| Muzzle length | 0.12m | Tip of nose to eye line |
| Muzzle width (base) | 0.10m | Where it meets face |
| Ear length | 0.15m | Base to tip |
| Ear width | 0.08m | At widest point |
| Eye spacing | 0.09m | Pupil to pupil |
| Saber teeth length | 0.06m | Visible below upper lip |
| **Torso** | | |
| Chest depth | 0.30m | Front to back at pec line |
| Chest width | 0.45m | Below armpits |
| Waist width | 0.32m | Natural narrowing |
| Hip width | 0.40m | At pelvis |
| **Arms** | | |
| Upper arm length | 0.32m | Shoulder to elbow |
| Forearm length | 0.28m | Elbow to wrist |
| Hand length | 0.18m | Wrist to fingertip |
| Bicep circumference | 0.28m | Flexed |
| **Legs** | | |
| Thigh length | 0.45m | Hip to knee |
| Shin length | 0.40m | Knee to ankle |
| Foot length | 0.25m | Heel to toe tip |
| Thigh circumference | 0.50m | At widest |
| **Tail** | | |
| Length (per tail) | 0.90-1.10m | Base to tip, varies by tail |
| Base diameter | 0.08m | Where it connects to body |
| Tip diameter | 0.02m | At end point |
| Tail root spacing | 0.04m | Gap between tail bases |

### 2.4 Asymmetry Rules (Kai vs Jax Influence)

The character is **not perfectly symmetrical**. Subtle differences convey the fusion:

| Feature | Kai Side (Left) | Jax Side (Right) |
|---------|-----------------|------------------|
| Eyebrow angle | 8° aggressive tilt | 5° neutral tilt |
| Ear position | 2° more forward | 2° more back |
| Shoulder height | 1cm higher | 1cm lower |
| Arm musculature | 5% more defined | 5% smoother |
| Hand size | 2% larger | 2% smaller |
| Fur pattern | Sharper edges | Softer gradients |
| Emissive intensity | 10% brighter | 10% softer |

**CRITICAL:** These differences are SUBTLE. The character must still read as one unified being, not two halves glued together.

---

## 3. FUR REGION MAPPING

### 3.1 Fur Type Zones

Kai-Jax has **5 distinct fur types** across the body:

```
FUR TYPE ZONES (Front View):

         ┌─────────────┐
         │    MANE     │ Type 4: Long (0.06m)
         │  ┌───────┐  │
         │  │ FACE  │  │ Type 1: Short (0.01m)
         │  └───────┘  │
         ├─────────────┤
        /│             │\
       / │   CHEST     │ \ Type 3: Medium (0.04m)
      /  │             │  \
     │   ├─────────────┤   │
     │   │    CORE     │   │ Type 2: Dense (0.02m)
     │   │             │   │
     │   ├─────────────┤   │
     │  /│    LEGS     │\  │ Type 2: Dense (0.02m)
     │ / └─────────────┘ \ │
     │/                   \│
     └─────────────────────┘
           Type 5: Tufts (hands/feet)
```

### 3.2 Fur Type Specifications

| Type | Name | Length | Density | Flow Direction | Shader Property |
|------|------|--------|---------|----------------|-----------------|
| **1** | Face Fur | 0.01m | High | Outward from nose | Velvet-like |
| **2** | Body Fur | 0.02m | Medium-High | Downward bias | Standard shell |
| **3** | Chest Ruff | 0.04m | Medium | Outward/down from throat | Volume shell |
| **4** | Mane Fur | 0.06m | Low-Medium | Back and down | Long strand |
| **5** | Tuft Fur | 0.03m | High | Outward from pad | Wispy shell |

### 3.3 Fur Color Regions

```
PRIMARY COLOR MAP:

Base: Amber-orange (#D4853B)
  └── Gradient to warm brown at extremities (#8B5A2B)

Kai-Side Influence (Left):
  └── Warmer tones, +5% saturation, +3% brightness

Jax-Side Influence (Right):
  └── Cooler tones, +5% blue shift, -3% brightness

SECONDARY MARKINGS:

1. Belly/Inner: Cream white (#F5E6D3)
   - Inner arms
   - Inner thighs
   - Chest center
   - Under-chin

2. Extremity Dark: Deep brown (#3D2314)
   - Ear tips
   - Tail tips (base color, before element overlay)
   - Finger/toe tips
   - Muzzle edge

3. Heritage Lines: Metallic black (#1A1A2E)
   - Myrr'Kai web patterns (see Section 4)
   - NOT painted, emerge from fur direction changes
```

### 3.4 Fur Direction Map

```
FUR FLOW DIRECTION (UV-style reference):

HEAD:
  - Forehead: Forward and down
  - Cheeks: Back toward ears
  - Muzzle: Forward, converging at nose
  - Ears: Outward from center line

BODY:
  - Spine: Backward from skull
  - Chest: Down and outward
  - Belly: Down, slight outward splay
  - Shoulders: Back and down

ARMS:
  - Upper: Down along humerus
  - Forearm: Down toward wrist
  - Hands: Outward from palm center

LEGS:
  - Thighs: Down along femur
  - Shins: Down along tibia
  - Feet: Forward from ankle

TAILS:
  - Along length, toward tip
  - Slight spiral bias (15° clockwise each tail)
```

### 3.5 Shell Fur Implementation

For cross-platform compatibility, shell-based fur is primary:

| Quality Tier | Shell Count | Shell Spacing | Alpha Threshold |
|--------------|-------------|---------------|-----------------|
| Ultra (T1) | 32 | 0.001m | 0.1 |
| High (T2) | 24 | 0.0013m | 0.15 |
| Medium (T3) | 16 | 0.002m | 0.2 |
| Low (T4) | 8 | 0.004m | 0.3 |
| Minimum (T5) | 0 | N/A (solid mesh) | N/A |

---

## 4. GLOW REGION MAPPING

### 4.1 Emissive Zones

Kai-Jax has **7 distinct glow zones** that respond to combat state:

```
EMISSIVE ZONES (Numbered):

         ┌─────────────┐
         │  ┌─1───1─┐  │   1: Eyes (always active)
         │  │ ◉   ◉ │  │
         │  └───────┘  │   2: Heritage Lines (pulse)
        /│      2      │\
       / │  ┌──────┐   │ \
      /  │  │  3   │   │  \ 3: Chest Core (meter-linked)
     │   │  └──────┘   │   │
     │   │      4      │   │ 4: Torso Veins (damage/power)
     │   │    ╱   ╲    │   │
     │   │   5     5   │   │ 5: Limb Traces (action feedback)
     │   │  ╱       ╲  │   │
     │  /│ │    6    │ │\  │ 6: Claws (attack states)
     └─/─┴─┴────────┴─┴──\─┘
              7            7: Tails (primary emissive)
```

### 4.2 Emissive Zone Specifications

| Zone | Name | Base Color | Intensity Range | Trigger |
|------|------|------------|-----------------|---------|
| **1** | Eyes | Kai: Gold (#FFD700), Jax: Blue (#4169E1) | 0.5-3.0 | Always on, combat spikes |
| **2** | Heritage Lines | Purple-black (#2E1F5E) | 0.0-1.5 | Resonance meter fill |
| **3** | Chest Core | White-cyan (#E0FFFF) | 0.0-2.5 | Synergy meter fill |
| **4** | Torso Veins | Red-orange (#FF4500) | 0.0-2.0 | Damage taken, rage state |
| **5** | Limb Traces | Active tail color | 0.0-1.0 | During attack animations |
| **6** | Claws | Active tail color | 0.0-4.0 | Attack active frames |
| **7** | Tails | Element-specific | 0.2-5.0 | Active tail brightest |

### 4.3 Heritage Line Patterns

The Myrr'Kai heritage creates web-like patterns:

```
HERITAGE LINE PATTERN (Topological):

Pattern Type: Organic circuitry
Style: Like lightning captured in glass

FACE PATTERN:
  - Two lines from outer eye corners → jaw line
  - Intersection point at cheekbone
  - Branch down neck to clavicle

CHEST PATTERN:
  - Central vertical line from throat to navel
  - Three horizontal branches (clavicle, pec line, ab line)
  - Curves follow muscle forms

ARM PATTERN (each):
  - Single line from shoulder → inner wrist
  - Branch at elbow → forearm outside
  - Terminates at knuckles

LEG PATTERN (each):
  - Line from hip → ankle (inner side)
  - Branch at knee → shin front
  - Terminates at top of foot

PATTERN ANIMATION:
  - Pulse frequency: 0.5Hz at rest
  - Pulse intensity: 0.2 → 0.8 → 0.2
  - Direction: Core → extremities
  - Sync with Resonance meter
```

### 4.4 Combat State Glow Mapping

| State | Eye Intensity | Heritage | Chest | Veins | Claws | Active Tail |
|-------|---------------|----------|-------|-------|-------|-------------|
| Idle | 0.8 | 0.2 (pulse) | 0.0 | 0.0 | 0.0 | 1.0 |
| Walking | 0.9 | 0.3 | 0.0 | 0.0 | 0.0 | 1.2 |
| Combat Ready | 1.2 | 0.5 | 0.3 | 0.0 | 0.5 | 2.0 |
| Attacking | 2.0 | 0.8 | 0.5 | 0.0 | 3.0 | 3.5 |
| Hit Taken | 1.5 | 0.3 | 0.0 | 1.5 | 0.0 | 1.0 |
| Low Health | 1.0 | 0.8 | 0.8 | 2.0 | 0.0 | 1.5 |
| Tail Switch | 3.0 | 1.0 | 1.0 | 0.0 | 0.0 | 0→5 |
| Ultimate | 3.0 | 1.5 | 2.5 | 0.5 | 4.0 | 5.0 |

---

## 5. TAIL ATTACHMENT SYSTEM

### 5.1 Tail Root Configuration

```
TAIL ROOT PLACEMENT (Rear View):

                    SPINE
                      │
                ┌─────┴─────┐
                │           │
         ┌──────┼───────────┼──────┐
        /│      │   SACRUM  │      │\
       / │   ┌──┴───────────┴──┐   │ \
      /  │  T1 T2 T3 T4 T5 T6 T7 T8 T9
     /   │   │  │  │  │  │  │  │  │  │
    │    │   ◯  ◯  ◯  ◯  ◯  ◯  ◯  ◯  ◯
    │    │   
    │    │   TAIL ROOT ARC (180° spread)
    │    │   
    └────┴───────────────────────────────

ROOT POSITIONS (from center, in meters):
  T1 (Ember):   -0.16m (far left)
  T2 (Gale):    -0.12m
  T3 (Shade):   -0.08m
  T4 (Volt):    -0.04m
  T5 (Stone):    0.00m (center)
  T6 (Tide):    +0.04m
  T7 (Thorn):   +0.08m
  T8 (Prism):   +0.12m
  T9 (Void):    +0.16m (far right)

VERTICAL OFFSET: All roots at same height (sacrum)
FORWARD OFFSET: 0.02m behind hip surface
```

### 5.2 Tail Bone Structure

Each tail uses identical bone hierarchy:

```
TAIL BONE CHAIN (per tail):

tail_root (at body)
  └── tail_01 (0.12m)
      └── tail_02 (0.12m)
          └── tail_03 (0.12m)
              └── tail_04 (0.12m)
                  └── tail_05 (0.10m)
                      └── tail_06 (0.10m)
                          └── tail_07 (0.08m)
                              └── tail_08 (0.08m)
                                  └── tail_tip (0.06-0.16m varies)

Total bones per tail: 10
Total tail bones: 90 (9 tails × 10 bones)
Total tail length range: 0.90m - 1.10m
```

### 5.3 Tail Physics Properties

| Property | Value | Notes |
|----------|-------|-------|
| Stiffness (base) | 0.8 | High near root |
| Stiffness (tip) | 0.2 | Loose at end |
| Damping | 0.3 | Prevents oscillation |
| Gravity Influence | 0.5 | Partially floats |
| Collision | Capsule per bone | Self-collision off |
| Max Rotation | 45° per joint | Prevents kinking |

### 5.4 Active Tail Behavior

Only **one tail is active at a time**. Active tail has special properties:

| Property | Active Tail | Inactive Tails |
|----------|-------------|----------------|
| Position | Elevated, forward-curving | Relaxed, hanging back |
| Animation | Procedural + physics | Physics only |
| Emission | 2.0-5.0 intensity | 0.2-0.5 intensity |
| Particle FX | Full element particles | None |
| Physics Stiffness | +0.2 modifier | Base values |

### 5.5 Tail Switch Animation

```
TAIL SWITCH SEQUENCE (6 frames / 100ms):

Frame 0: Current active dims (intensity 2.0 → 0.5)
Frame 1: All tails brief glow pulse (intensity 1.0)
Frame 2: New active tail brightens (intensity 0.5 → 3.0)
Frame 3: New active elevates (rotation starts)
Frame 4: Old active relaxes (returns to hanging)
Frame 5: New active at final position
Frame 6: Particle burst at new active base

POSITION INTERPOLATION:
  - Old active: Elevated → Relaxed (ease-out)
  - New active: Relaxed → Elevated (ease-in-out)
  - Other tails: Subtle responsive sway
```

---

## 6. CLAW STRUCTURE

### 6.1 Hand Anatomy

```
HAND STRUCTURE (Palm View):

              ┌─────────────────────┐
              │                     │
         ┌────┤    P A L M         ├────┐
         │    │    (padded)        │    │
    THUMB│    │                    │    │INDEX
         │    │   ┌──┬──┬──┐       │    │
         │    └───┤D4│D3│D2├───────┘    │
         │        └──┴──┴──┘            │
         │          │  │  │             │
         └──────────┘  │  └─────────────┘
                MIDDLE   RING

DIGIT COUNT: 4 fingers + 1 thumb = 5 total
PHALANGE COUNT: 3 per digit (proximal, middle, distal)
PAD PLACEMENT: Palm center, each fingertip, thumb
```

### 6.2 Claw Specifications

| Measurement | Value | Notes |
|-------------|-------|-------|
| Claw length (extended) | 0.04m | From fingertip |
| Claw length (retracted) | 0.015m | Still visible |
| Claw base width | 0.008m | Where it emerges |
| Claw tip width | 0.001m | Sharp point |
| Claw curvature | 30° arc | Slight hook shape |
| Claw count | 5 per hand, 4 per foot | Total: 18 |

### 6.3 Claw Material

```
CLAW SHADER PROPERTIES:

OUTER SHELL:
  Base Color: Obsidian black (#0D0D0D)
  Roughness: 0.2 (glossy)
  Metallic: 0.4 (semi-metallic)

INNER VEINS:
  Pattern: 3 parallel lines along claw length
  Base: Dark red (#3D0000)
  Emission Color: Active tail element color
  Emission Intensity: 0.0 (rest) → 4.0 (attack active)

ANIMATION:
  - Veins pulse during attack startup
  - Full glow during active frames
  - Fade during recovery
```

### 6.4 Claw States

| State | Extension | Vein Glow | Particle FX |
|-------|-----------|-----------|-------------|
| Idle | Retracted | 0.0 | None |
| Combat Ready | 50% extended | 0.5 | None |
| Attack Startup | Extending | 1.0 → 3.0 | None |
| Attack Active | Full extended | 4.0 | Element trail |
| Attack Recovery | Retracting | 3.0 → 0.5 | Trail fade |

### 6.5 Foot Claws

Foot claws follow same structure with these differences:

| Property | Hand Claws | Foot Claws |
|----------|------------|------------|
| Count | 5 | 4 (no thumb equivalent) |
| Length | 0.04m | 0.035m |
| Visibility | High (combat focus) | Medium (ground contact) |
| Retraction | Full | Partial (always somewhat visible) |
| Emission | High intensity | 50% of hand intensity |

---

## 7. EYE SYSTEM & COLOR LOGIC

### 7.1 Eye Anatomy

```
EYE STRUCTURE (Cross-section):

     ┌───────────────────────────────┐
     │         EYELID               │
     │    ┌───────────────────┐     │
     │    │      SCLERA       │     │
     │    │   ┌───────────┐   │     │
     │    │   │   IRIS    │   │     │
     │    │   │  ┌─────┐  │   │     │
     │    │   │  │PUPIL│  │   │     │
     │    │   │  └─────┘  │   │     │
     │    │   └───────────┘   │     │
     │    └───────────────────┘     │
     └───────────────────────────────┘

EYE MEASUREMENTS:
  Total eye width: 0.028m
  Total eye height: 0.022m
  Iris diameter: 0.016m
  Pupil diameter: 0.006m (neutral) / 0.002m-0.010m (reactive)
  Eye spacing: 0.09m (pupil to pupil)
```

### 7.2 Dual-Color System

Kai-Jax's eyes are **not identical** — they reflect the fusion:

| Eye | Brother | Base Color | Hex | Emissive Intensity |
|-----|---------|------------|-----|-------------------|
| Left | Kai | Molten Gold | #FFD700 | 0.8 base |
| Right | Jax | Deep Sapphire | #4169E1 | 0.8 base |

### 7.3 Iris Detail

```
IRIS PATTERN (Both eyes):

                  ┌─────────────┐
                 /│             │\
                / │   INNER    │  \
               │  │   RING     │   │
               │  │  (darker)  │   │
               │  │ ┌───────┐  │   │
               │  │ │ PUPIL │  │   │
               │  │ └───────┘  │   │
               │  │            │   │
                \ │   OUTER   │  /
                 \│   RING    │/
                  └─────────────┘
                   (lighter + 
                    radial lines)

PATTERN:
  - 24 radial lines from pupil edge to outer iris
  - Inner 40% of iris: 30% darker than base
  - Outer 60% of iris: 15% lighter than base
  - Subtle limbal ring (dark outline) at iris edge
```

### 7.4 Eye Color State Logic

Eyes respond to game state with color and intensity shifts:

| State | Left Eye (Kai) | Right Eye (Jax) | Pupil Size |
|-------|----------------|-----------------|------------|
| Idle | Gold, 0.8 | Blue, 0.8 | 0.006m |
| Alert | Gold, 1.2 | Blue, 1.2 | 0.004m |
| Combat | Gold, 1.5 | Blue, 1.5 | 0.003m |
| Rage (low HP) | Red-gold blend, 2.0 | Purple-blue blend, 2.0 | 0.002m |
| Tail Ability | Both → active tail color, 3.0 | Both → active tail color, 3.0 | 0.002m |
| Ultimate | Both white-gold, 4.0 | Both white-blue, 4.0 | 0.008m |
| Stunned | Both dim, 0.3 | Both dim, 0.3 | 0.010m |

### 7.5 Eye Animation Properties

| Property | Value | Notes |
|----------|-------|-------|
| Blink rate | 0.2Hz (every 5 sec) | Randomized ±2 sec |
| Blink duration | 0.15 sec | Quick closure |
| Look speed | 400°/sec | Fast eye tracking |
| Look range | ±45° horizontal, ±30° vertical | From forward |
| Pupil reaction speed | 0.3 sec | Dilation/contraction |

### 7.6 Glow Bleed Effect

Eyes emit light into surrounding fur:

```
EYE GLOW BLEED:

Radius: 0.03m from eye center
Falloff: Quadratic (intensity² distance)
Color: Match eye color with 50% saturation
Blend: Additive with fur base color

IMPLEMENTATION:
  - Vertex color influence in eye region
  - OR light probe near each eye
  - OR screen-space bloom with per-eye mask
```

---

## 8. SILHOUETTE RULES

### 8.1 The Silhouette Test

**RULE:** Kai-Jax must be recognizable as a solid black shape at any camera distance.

```
SILHOUETTE RECOGNITION ELEMENTS:

             /\  /\          ← EARS (key identifier)
            /  \/  \
           │  ◯  ◯  │        ← HEAD SHAPE
            \  ▼  /
             │  │             ← NECK
         ____│  │____
        /    │  │    \       ← SHOULDER WIDTH
       │  ___│  │___  │
       │ /   │  │   \ │      ← ARM SHAPES
       │/    │  │    \│
        \    │  │    /       ← TORSO TAPER
         \   │  │   /
          \  │  │  /         ← HIP WIDTH
           \ │  │ /
           │ │  │ │          ← LEGS
           │ │  │ │
          /   \/   \         ← DIGITIGRADE FEET
         /    /\    \
        └────┘  └────┘

              +

     ╲ ╲ ╲ │ │ │ ╱ ╱ ╱       ← 9 TAILS (unmistakable)
      ╲ ╲ ╲│ │ │╱ ╱ ╱
       ╲ ╲ │ │ │ ╱ ╱
        ╲ ╲│ │ │╱ ╱
         ╲ │ │ │ ╱
          ╲│ │ │╱

CRITICAL SILHOUETTE FEATURES (in priority):
1. Nine tails (unique identifier)
2. Large triangular ears
3. Digitigrade leg stance
4. Athletic torso proportions
5. Extended arms with visible claws
```

### 8.2 Distance Tier Silhouette Guidelines

| Tier | Distance | Must Be Visible | Can Be Lost |
|------|----------|-----------------|-------------|
| **1** | 0-5m | Everything | Nothing |
| **2** | 5-15m | Ears, tail count, body shape, pose | Individual fur strands, eye color |
| **3** | 15-30m | Ears, tail mass, body outline | Tail separation, finger detail |
| **4** | 30m+ | Body shape, tail glow, ears | Tail count, limb definition |

### 8.3 Pose Silhouette Requirements

Every animation pose must maintain readability:

```
POSE RULES:

1. NEVER fully overlap limbs with torso
   - Arms should extend beyond body silhouette
   - Legs should have visible negative space

2. ALWAYS keep at least 5 tail silhouettes distinct
   - Active tail fully separate
   - At least 4 others visible as mass

3. EARS should break the head outline
   - Ears should never flatten against skull in silhouette
   - At least one ear visible in profile views

4. AVOID symmetrical arm positions
   - Different arm heights create visual interest
   - Asymmetry aids pose recognition

5. FEET should show digitigrade angle
   - Heel elevation visible
   - Toe mass distinct
```

### 8.4 Rim Light Requirements

For all quality tiers, rim lighting ensures silhouette pop:

| Tier | Rim Light Type | Intensity | Width |
|------|---------------|-----------|-------|
| T1-T2 | Dynamic per-light | 0.5-1.0 | 0.02m |
| T3-T4 | Fixed direction | 0.8 | 0.03m |
| T5 | Solid outline | 1.0 | 0.04m (hard edge) |

---

## 9. SHADER REQUIREMENTS

### 9.1 Master Shader Architecture

```
KAI-JAX MASTER SHADER:

┌─────────────────────────────────────────────────────┐
│                  MASTER MATERIAL                     │
├──────────────────┬──────────────────────────────────┤
│  PBR BASE        │  CUSTOM LAYERS                    │
├──────────────────┼──────────────────────────────────┤
│  - Albedo        │  - Fur Shell Layer                │
│  - Normal        │  - Emissive Pattern Layer         │
│  - ORM           │  - Dual-Eye Glow Layer            │
│  - Emissive      │  - Tail Element Override Layer    │
│                  │  - Claw Vein Animation Layer      │
└──────────────────┴──────────────────────────────────┘
```

### 9.2 Required Shader Parameters

| Parameter | Type | Range | Default | Description |
|-----------|------|-------|---------|-------------|
| **Base** | | | | |
| BaseColorTint | Color | RGB | (1,1,1) | Overall color adjustment |
| RoughnessMultiplier | Float | 0-2 | 1.0 | Roughness adjustment |
| NormalIntensity | Float | 0-2 | 1.0 | Normal map strength |
| **Fur** | | | | |
| FurLength | Float | 0-0.1 | 0.02 | Shell extrusion distance |
| FurDensity | Float | 0-1 | 0.7 | Alpha noise threshold |
| FurDirection | Vector3 | Normalized | (0,-1,0) | Gravity/comb direction |
| FurShellCount | Int | 0-32 | 16 | Number of shells |
| **Emissive** | | | | |
| EmissiveIntensity | Float | 0-10 | 0.8 | Global emissive strength |
| HeritageGlow | Float | 0-2 | 0.2 | Web pattern intensity |
| ChestCoreGlow | Float | 0-3 | 0.0 | Center chest emissive |
| VeinGlow | Float | 0-2 | 0.0 | Damage vein intensity |
| **Eyes** | | | | |
| LeftEyeColor | Color | RGB | Gold | Kai eye color |
| RightEyeColor | Color | RGB | Blue | Jax eye color |
| EyeEmissive | Float | 0-5 | 0.8 | Eye glow intensity |
| PupilSize | Float | 0.1-2 | 1.0 | Pupil dilation multiplier |
| **Claws** | | | | |
| ClawGlowColor | Color | RGB | (1,1,1) | Claw vein color |
| ClawGlowIntensity | Float | 0-5 | 0.0 | Claw emissive |
| **State** | | | | |
| ActiveTailIndex | Int | 0-8 | 0 | Currently active tail |
| CombatState | Int | 0-10 | 0 | Current state machine state |
| DamageFlash | Float | 0-1 | 0 | Hit feedback flash |

### 9.3 Shader Feature Tiers

| Feature | T1 Ultra | T2 High | T3 Med | T4 Low | T5 Min |
|---------|----------|---------|--------|--------|--------|
| Fur Shells | 32 | 24 | 16 | 8 | 0 |
| Subsurface Scatter | Full | Simplified | None | None | None |
| Emissive Layers | All 7 | All 7 | 5 | 3 | Eyes only |
| Normal Mapping | High-res | High-res | Med-res | Low-res | None |
| Rim Lighting | Dynamic | Dynamic | Fixed | Fixed | Hard outline |
| Eye Reflections | Cube + SSR | Cube | Fake spec | Fake spec | None |
| Claw Animation | Full | Full | Simplified | Static | Static |

### 9.4 Tail Material Overrides

Each tail needs a material instance with unique properties:

| Tail | Base Color | Emissive Color | Special Effect |
|------|------------|----------------|----------------|
| Ember | #FF6B35 | #FF3B30 | Heat distortion, ember particles |
| Gale | #64D2FF | #00BFFF | UV scroll (wind), trail particles |
| Shade | #9B59B6 | #BF5AF2 | Fresnel invert, void tendrils |
| Volt | #FFD60A | #FFEA00 | Arc noise, electricity overlay |
| Stone | #8B8B8B | #A0522D | Parallax moss, crack patterns |
| Tide | #007AFF | #4169E1 | Caustics projection, bubbles |
| Thorn | #30D158 | #228B22 | Growth animation, bark texture |
| Prism | #FFFFFF | Rainbow cycle | Chromatic aberration, refraction |
| Void | #1A1A2E | #2E2EFE | Screen warp, event horizon |

---

## 10. LOD SPECIFICATIONS

### 10.1 LOD Distance Thresholds

| LOD | Distance | Poly Budget | Bone Budget | Fur Method |
|-----|----------|-------------|-------------|------------|
| LOD0 | 0-5m | 80,000 | 150 | Strand/Shell 32 |
| LOD1 | 5-15m | 40,000 | 120 | Shell 24 |
| LOD2 | 15-30m | 15,000 | 80 | Shell 16 |
| LOD3 | 30-50m | 5,000 | 50 | Shell 8 |
| LOD4 | 50m+ | 2,000 | 30 | Solid mesh |

### 10.2 LOD Transition Rules

```
LOD TRANSITION:

Blend Method: Dither fade (no popping)
Transition Duration: 0.3 seconds
Hysteresis: 2m (prevents rapid switching)

Example:
  - Moving away: LOD0 → LOD1 at 5m
  - Moving toward: LOD1 → LOD0 at 3m (5m - 2m)
```

### 10.3 LOD Geometry Guidelines

**LOD0 (Full Detail):**
- All finger/toe bones
- Facial blend shapes
- Individual claw geometry
- Full ear articulation

**LOD1 (High):**
- Merged finger bones (2 per finger)
- Simplified facial rig
- Claw as single mesh
- Full ear articulation

**LOD2 (Medium):**
- Single bone per hand
- No facial blend shapes (baked expression)
- Claws as texture/normal detail
- Ears as single bone each

**LOD3 (Low):**
- Single bone per limb
- Static face
- No individual claws
- Static ears (posed)

**LOD4 (Billboard/Mobile):**
- Impostor sprite option
- OR extremely simplified mesh
- 30 bones max (spine + major joints)

### 10.4 LOD Shader Simplification

| LOD | Texture Resolution | Shader Complexity |
|-----|-------------------|-------------------|
| LOD0 | 4096 | Full master shader |
| LOD1 | 2048 | Full master shader |
| LOD2 | 1024 | Simplified (no SSS) |
| LOD3 | 512 | Mobile shader |
| LOD4 | 256 | Unlit with rim |

---

## 11. RIG REQUIREMENTS

### 11.1 Skeleton Hierarchy

```
ROOT SKELETON:

root
└── pelvis
    ├── spine_01
    │   └── spine_02
    │       └── spine_03
    │           └── chest
    │               ├── neck
    │               │   └── head
    │               │       ├── jaw
    │               │       ├── ear_L
    │               │       ├── ear_R
    │               │       ├── eye_L
    │               │       └── eye_R
    │               ├── clavicle_L
    │               │   └── shoulder_L
    │               │       └── elbow_L
    │               │           └── wrist_L
    │               │               └── [hand bones L]
    │               └── clavicle_R
    │                   └── shoulder_R
    │                       └── elbow_R
    │                           └── wrist_R
    │                               └── [hand bones R]
    ├── thigh_L
    │   └── knee_L
    │       └── ankle_L
    │           └── foot_L
    │               └── toe_L
    ├── thigh_R
    │   └── knee_R
    │       └── ankle_R
    │           └── foot_R
    │               └── toe_R
    └── tail_root
        ├── tail_01_chain [10 bones]
        ├── tail_02_chain [10 bones]
        ├── tail_03_chain [10 bones]
        ├── tail_04_chain [10 bones]
        ├── tail_05_chain [10 bones]
        ├── tail_06_chain [10 bones]
        ├── tail_07_chain [10 bones]
        ├── tail_08_chain [10 bones]
        └── tail_09_chain [10 bones]

TOTAL BONES: ~150 (LOD0)
```

### 11.2 Hand Bone Detail

```
HAND BONES (per hand):

wrist
├── palm
├── thumb_01
│   └── thumb_02
│       └── thumb_03
├── index_01
│   └── index_02
│       └── index_03
├── middle_01
│   └── middle_02
│       └── middle_03
├── ring_01
│   └── ring_02
│       └── ring_03
└── pinky_01 (if 5 digits)
    └── pinky_02
        └── pinky_03

BONES PER HAND: 17 (4-digit) or 20 (5-digit)
```

### 11.3 Facial Rig Requirements

| Blend Shape | Purpose | Range |
|-------------|---------|-------|
| brow_raise_L | Left eyebrow up | 0-1 |
| brow_raise_R | Right eyebrow up | 0-1 |
| brow_lower_L | Left eyebrow down (anger) | 0-1 |
| brow_lower_R | Right eyebrow down | 0-1 |
| eye_blink_L | Left eye close | 0-1 |
| eye_blink_R | Right eye close | 0-1 |
| eye_wide_L | Left eye surprise | 0-1 |
| eye_wide_R | Right eye surprise | 0-1 |
| jaw_open | Mouth open | 0-1 |
| sneer_L | Left nostril/lip raise | 0-1 |
| sneer_R | Right nostril/lip raise | 0-1 |
| lip_curl | Lip pull back (snarl) | 0-1 |
| ear_back_L | Left ear flatten | 0-1 |
| ear_back_R | Right ear flatten | 0-1 |
| ear_perk_L | Left ear forward | 0-1 |
| ear_perk_R | Right ear forward | 0-1 |

### 11.4 IK Requirements

| IK Chain | Bones | Purpose |
|----------|-------|---------|
| IK_Arm_L | Shoulder → Wrist | Arm positioning |
| IK_Arm_R | Shoulder → Wrist | Arm positioning |
| IK_Leg_L | Thigh → Foot | Foot planting |
| IK_Leg_R | Thigh → Foot | Foot planting |
| IK_Spine | Pelvis → Chest | Torso lean |
| IK_Head | Neck → Head | Head look-at |

---

## 12. REFERENCE GALLERY GUIDELINES

### 12.1 Required Reference Poses

The following poses must be produced for reference:

| Pose | Description | Use |
|------|-------------|-----|
| **T-Pose** | Arms horizontal, palms down | Rigging baseline |
| **A-Pose** | Arms 45° down, relaxed | Animation baseline |
| **Idle** | Combat ready stance | Default pose |
| **Action 1** | Light attack mid-swing | Combat silhouette |
| **Action 2** | Heavy attack windup | Power silhouette |
| **Run Cycle** | Mid-stride | Motion silhouette |
| **Jump Apex** | Peak of jump | Air silhouette |
| **Tail Fan** | All tails spread | Tail visibility |
| **Expression: Neutral** | Default face | Face baseline |
| **Expression: Combat** | Aggressive, ears back | Combat face |
| **Expression: Pain** | Taking damage | Reaction face |

### 12.2 Reference View Angles

Each pose should be rendered from:

| View | Angle | Purpose |
|------|-------|---------|
| Front | 0° | Primary reference |
| 3/4 Front Left | 45° | Common gameplay view |
| Side Left | 90° | Profile proportions |
| 3/4 Back Left | 135° | Tail arrangement |
| Back | 180° | Tail full view |
| Top | -90° (down) | Silhouette check |

### 12.3 Reference Lighting Setup

| Light | Position | Color | Intensity |
|-------|----------|-------|-----------|
| Key | 45° above, 45° right | Warm white (#FFF5E0) | 1.0 |
| Fill | 30° above, 45° left | Cool white (#E0F0FF) | 0.4 |
| Rim | Behind, 10° above | White (#FFFFFF) | 0.3 |
| Ground | Below | Neutral | 0.1 (ambient) |

---

## APPENDIX A: COLOR PALETTE REFERENCE

```
PRIMARY COLORS:

  Fur Base:        #D4853B  ████████
  Fur Dark:        #8B5A2B  ████████
  Fur Light:       #F5E6D3  ████████
  Heritage Lines:  #2E1F5E  ████████
  
ELEMENT COLORS:

  Ember:           #FF3B30  ████████
  Gale:            #64D2FF  ████████
  Shade:           #BF5AF2  ████████
  Volt:            #FFD60A  ████████
  Stone:           #8B8B8B  ████████
  Tide:            #007AFF  ████████
  Thorn:           #30D158  ████████
  Prism:           #FFFFFF  ████████
  Void:            #2E2EFE  ████████

EYE COLORS:

  Kai (Left):      #FFD700  ████████
  Jax (Right):     #4169E1  ████████
```

---

## APPENDIX B: CHECKLIST FOR MODEL SIGN-OFF

```
MODEL APPROVAL CHECKLIST:

□ Proportions match spec (within 5% tolerance)
□ All 9 tail roots properly positioned
□ Fur regions clearly defined
□ Asymmetry between left/right sides visible but subtle
□ Silhouette test passed at all LOD distances
□ UV layout optimized for texture resolution
□ Bone count within budget per LOD
□ Topology supports deformation (no stretched polys)
□ Edge flow follows muscle lines
□ No n-gons in deformation areas
□ Claws separate geometry for animation
□ Eyes proper spheres with correct hierarchy
□ Ears triangular with correct proportions
□ Heritage line paths match pattern spec

MATERIAL APPROVAL CHECKLIST:

□ Base PBR values within realistic range
□ Emissive masks align with glow zones
□ Fur density noise looks natural
□ All 9 tail materials distinct
□ Eye glow bleeds properly
□ Claw veins animate correctly
□ LOD shader fallbacks functional
□ Performance within frame budget
```

---

**Document Version:** 1.0  
**Last Updated:** December 2025  
**Author:** Art Direction Team  
**Status:** Production Ready  

---

*"If the characters look exactly right, we win."*

# LEGENDS OF KAI-JAX: THE MEMORY KING
## Engine Design Specification v1.0

**Document Type:** Technical Design Document (TDD)  
**Target Engines:** Unreal Engine 5 / Unity 2022+  
**Platforms:** PC, Console (PS5/XSX), Tablet, Mobile  
**Genre:** Action RPG / Brawler  
**Combat Style:** Deterministic Frame-Based (Fighting Game Hybrid)  

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Character Rendering Requirements](#2-character-rendering-requirements)
3. [Combat System Architecture](#3-combat-system-architecture)
4. [9-Tail Progression System](#4-9-tail-progression-system)
5. [Enemy AI Design](#5-enemy-ai-design)
6. [Cross-Platform Scaling](#6-cross-platform-scaling)
7. [Unreal Engine 5 Implementation Guide](#7-unreal-engine-5-implementation-guide)
8. [Unity Implementation Guide](#8-unity-implementation-guide)
9. [Asset Pipeline Requirements](#9-asset-pipeline-requirements)
10. [Performance Budgets](#10-performance-budgets)

---

## 1. EXECUTIVE SUMMARY

### 1.1 Core Identity

Kai-Jax is a fusion character—two brothers merged into one being with nine elemental tails. The game's visual and mechanical identity rests on:

- **Character Fidelity:** Kai-Jax must be instantly recognizable at any camera distance
- **Combat Feel:** Responsive, deterministic, fighting-game-grade input handling
- **Tail Progression:** Nine distinct combat styles, visually and mechanically unique
- **Memory Theme:** "Survival without memory is extinction with better design"

### 1.2 Design Pillars

| Pillar | Description | Priority |
|--------|-------------|----------|
| **Visual Identity** | Characters look exactly like concept art at all LODs | P0 |
| **Combat Feel** | Sub-frame input precision, satisfying hit feedback | P0 |
| **Tail System** | Nine unique, switchable combat modes | P1 |
| **Adaptive AI** | Enemies learn and counter player habits | P1 |
| **Platform Parity** | Core feel preserved on mobile | P2 |

### 1.3 Reference Benchmarks

- **Combat Feel:** Devil May Cry 5, Guilty Gear Strive, Hades
- **Character Rendering:** Ratchet & Clank: Rift Apart (fur), Ori (glow/silhouette)
- **AI Adaptation:** Metal Gear Solid V (D-Dog AI), F.E.A.R. (tactical AI)
- **Mobile Scaling:** Genshin Impact (quality tiers)

---

## 2. CHARACTER RENDERING REQUIREMENTS

### 2.1 Kai-Jax Visual Identity

#### 2.1.1 Core Physical Features

| Feature | Description | Rendering Challenge |
|---------|-------------|--------------------|
| **Fur/Coat** | Dense, directional fur with color gradients | Shell/strand rendering, LOD critical |
| **Quills** | Sharp crystalline spines along spine and arms | Specular, subsurface scattering |
| **Nine Tails** | Each tail has unique material (fire, ice, shadow, etc.) | Dynamic material switching |
| **Claws** | Obsidian-like with internal glow veins | Emissive + PBR hybrid |
| **Eyes** | Dual-colored (Kai=gold, Jax=blue), fused glow | Emissive, post-process bloom |
| **Web Patterns** | Myrr'Kai heritage markings that pulse | Animated UV, emissive mask |
| **Aura States** | Combat state changes body glow intensity | Full-body shader parameter |

#### 2.1.2 Silhouette Recognition Requirements

```
SILHOUETTE DISTANCE TIERS:

┌─────────────────────────────────────────────────────────────┐
│  TIER 1: Close Combat (2-5m from camera)                    │
│  - Full detail visible                                       │
│  - Individual fur strands, quill facets                      │
│  - All 9 tails fully articulated                            │
│  - Eye glow with iris detail                                 │
├─────────────────────────────────────────────────────────────┤
│  TIER 2: Arena View (5-15m from camera)                     │
│  - Fur as shell layers (8-16 shells)                        │
│  - Tails as thick ribbons with glow                         │
│  - Silhouette MUST be unmistakable                          │
│  - Active tail highlighted with stronger emission           │
├─────────────────────────────────────────────────────────────┤
│  TIER 3: Wide Shot (15-30m from camera)                     │
│  - Fur as solid mass with rim lighting                      │
│  - Tails as glowing trails                                   │
│  - Color palette carries identity                           │
│  - No detail loss on pose readability                       │
├─────────────────────────────────────────────────────────────┤
│  TIER 4: Mobile/Distant (30m+ or mobile platform)           │
│  - Simplified mesh with baked AO                            │
│  - Emissive-only tails                                       │
│  - Strong outline/rim shader                                 │
│  - Billboard tails at extreme distance                      │
└─────────────────────────────────────────────────────────────┘
```

#### 2.1.3 Material Specifications

**BASE BODY MATERIAL (PBR + Custom)**

| Parameter | Value Range | Description |
|-----------|-------------|-------------|
| Base Color | Warm amber to cool gray gradient | Reflects Kai/Jax duality |
| Roughness | 0.3-0.7 (fur tips rougher) | Realistic fur behavior |
| Metallic | 0.0 (organic) | Non-metallic base |
| Subsurface | 0.2-0.4 on ears, nose | Skin translucency |
| Emissive Mask | UV-mapped patterns | Web markings, veins |
| Emissive Intensity | 0.0-5.0 (state-driven) | Combat state feedback |

**TAIL MATERIALS (Per-Tail Unique)**

| Tail | Base Material | Special Effect |
|------|---------------|----------------|
| Ember | Molten rock + flame particles | Heat distortion, ember particles |
| Gale | Translucent cyan with wind lines | Animated UV flow, trail particles |
| Shade | Dark purple with void tendrils | Fresnel inversion, shadow casting |
| Volt | Bright yellow with arc patterns | Electricity arcs (Niagara/VFX Graph) |
| Stone | Gray granite with moss | Parallax displacement, dust particles |
| Tide | Deep blue with caustics | Water surface shader, bubble particles |
| Thorn | Green with bark texture | Animated growth veins |
| Prism | Pure white with rainbow refraction | Chromatic dispersion |
| Void | Black hole effect with event horizon | Screen-space distortion |

#### 2.1.4 Fur/Hair Rendering Strategy

**APPROACH A: Shell-Based Fur (Recommended for Cross-Platform)**

- 8-24 shell layers depending on LOD
- Noise-based length variation
- Alpha-to-coverage for anti-aliasing
- Directional combing via vertex colors
- LOD reduces shell count, not quality impression

**APPROACH B: Strand-Based Fur (PC/Console Only)**

- Groom system (UE5 Groom / Unity HDRP Hair)
- ~50,000 guide strands, interpolated to millions
- Physics simulation on tails and mane
- Fallback to shell on lower quality tiers

**APPROACH C: 2D Sprite Workflow (Mobile/Stylized)**

- High-fidelity 2D sprites rendered from 3D
- 8-directional sprite sheets
- Frame-by-frame animation
- Emissive overlays for tails
- Silhouette perfectly preserved

### 2.2 Enemy Visual Requirements

#### 2.2.1 Synthetic Apex Enemies

These are Ulgorr's creations—biomechanical, cold, designed.

| Enemy Type | Visual Identity | Key Material |
|------------|-----------------|---------------|
| Iterator | Red/black, geometric, learning lines | Tron-like circuit glow |
| Null Stalker | Purple/void, smoke trails | Dissolve shader, particle trail |
| Bastion | Gray/brown, armored, massive | Layered armor, damage states |
| Phase Weaver | Cyan/ghost, afterimages | Screen-space blur, duplication |
| Crown Warden | White/gold, royal, terrifying | Full emissive, crown particles |

#### 2.2.2 Visual Hierarchy Rules

1. **Player Always Readable:** Kai-Jax should never be lost in visual noise
2. **Enemy Telegraphs:** Attack windups use color (red flash) and pose
3. **Damage States:** Visual degradation shows enemy health
4. **Adaptation Glow:** Enemies that have "learned" show red circuit glow

### 2.3 Environment Art Direction

**Ashblock Heights:** Neon-noir city, vertical, rain-slicked
**Fangforge Wastes:** Industrial bone desert, teal glow, smoke stacks
**Veil Scar:** Fractured time zone, floating debris, distorted light
**Memory Grove:** Bioluminescent forest, fog, peaceful but eerie
**Abyssal Engine:** Living machinery, Ulgorr's domain, terror scale

---

## 3. COMBAT SYSTEM ARCHITECTURE

### 3.1 Core Philosophy

**"Deterministic, Responsive, Readable"**

The combat must feel like a premium fighting game while remaining accessible. Every input has immediate, predictable response. Every enemy attack is telegraphed and fair.

### 3.2 Frame Data System

#### 3.2.1 Frame-Independent Implementation

The web prototype runs at locked 60fps. Engine implementation must handle variable framerates while preserving frame data integrity.

```
FRAME DATA STRUCTURE:

┌─────────────────────────────────────────────────────────────┐
│  MOVE: Light Attack                                          │
├─────────────────────────────────────────────────────────────┤
│  Startup Frames:    4 frames  (66.67ms at 60fps)            │
│  Active Frames:     3 frames  (50.00ms at 60fps)            │
│  Recovery Frames:   8 frames  (133.33ms at 60fps)           │
│  Total Duration:   15 frames  (250.00ms at 60fps)           │
├─────────────────────────────────────────────────────────────┤
│  Hit Properties:                                             │
│  - Damage: 8                                                 │
│  - Hitstun: 12 frames                                        │
│  - Blockstun: 6 frames                                       │
│  - Knockback: (3, 0) units                                   │
├─────────────────────────────────────────────────────────────┤
│  Cancel Windows:                                             │
│  - Can cancel into: Light Attack, Heavy Attack, Special     │
│  - Cancel allowed: During active frames on hit only         │
└─────────────────────────────────────────────────────────────┘
```

#### 3.2.2 Time Conversion Formula

```
FRAME_DURATION_MS = 1000 / 60 = 16.667ms

To convert frame data to time:
  startup_time = startup_frames * FRAME_DURATION_MS
  active_time = active_frames * FRAME_DURATION_MS
  recovery_time = recovery_frames * FRAME_DURATION_MS

Engine should track:
  move_elapsed_time (float, in ms)
  current_phase = floor(move_elapsed_time / FRAME_DURATION_MS)
```

### 3.3 Character Controller Architecture

#### 3.3.1 State Machine Overview

```
                           ┌─────────────┐
                           │    IDLE     │
                           └──────┬──────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
              ▼                   ▼                   ▼
       ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
       │   WALKING   │     │   JUMPING   │     │  BLOCKING   │
       └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
              │                   │                   │
              │                   │                   │
              ▼                   ▼                   ▼
       ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
       │   RUNNING   │     │   FALLING   │     │ BLOCK_STUN  │
       └──────┬──────┘     └─────────────┘     └─────────────┘
              │
              ▼
       ┌─────────────┐
       │   DASHING   │◄───────────────────────────────────────┐
       └──────┬──────┘                                        │
              │                                               │
              ▼                                               │
       ┌─────────────┐                                        │
       │  ATTACKING  │────────────────────────────────────────┤
       └──────┬──────┘                                        │
              │                                               │
    ┌─────────┴─────────┐                                     │
    │                   │                                     │
    ▼                   ▼                                     │
┌─────────┐       ┌───────────┐                               │
│ ON_HIT  │       │ ON_BLOCK  │                               │
└────┬────┘       └─────┬─────┘                               │
     │                  │                                     │
     ▼                  ▼                                     │
┌─────────────┐   ┌─────────────┐                             │
│  HITSTUN    │   │ BLOCKSTUN   │                             │
└──────┬──────┘   └──────┬──────┘                             │
       │                 │                                    │
       ▼                 │                                    │
┌─────────────┐          │                                    │
│  KNOCKDOWN  │          │                                    │
└──────┬──────┘          │                                    │
       │                 │                                    │
       ▼                 │                                    │
┌─────────────┐          │                                    │
│  RECOVERY   │──────────┴────────────────────────────────────┘
└─────────────┘
```

#### 3.3.2 State Definitions

| State | Entry Condition | Exit Condition | Interruptible By |
|-------|-----------------|----------------|------------------|
| IDLE | No input, grounded | Any input | All |
| WALKING | Move input, grounded | Release input, attack | Attack, Jump, Dash, Block |
| RUNNING | Move + Run input | Release | Attack, Jump, Dash |
| JUMPING | Jump input, grounded | Land | Air Attack, Air Dash |
| FALLING | Airborne, no jump | Land | Air Attack |
| DASHING | Dash input | Duration complete | Nothing (committed) |
| BLOCKING | Block input, grounded | Release, hit | Nothing while held |
| ATTACKING | Attack input | Move complete | Cancel window only |
| HITSTUN | Receive hit | Stun frames expire | Nothing |
| BLOCKSTUN | Block hit | Stun frames expire | Nothing |
| KNOCKDOWN | Health critical or launcher | Wakeup complete | Nothing |
| RECOVERY | After knockdown | Frames expire | Nothing (invincible) |

#### 3.3.3 Movement Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| Walk Speed | 4.0 units/sec | Standard movement |
| Run Speed | 10.0 units/sec | Hold run modifier |
| Dash Speed | 16.0 units/sec | Burst movement |
| Dash Duration | 12 frames | Fixed commitment |
| Dash Invincibility | 8 frames | I-frames at start |
| Jump Force | 18.0 units | Initial vertical velocity |
| Gravity | 0.8 units/frame² | Falling acceleration |
| Air Control | 0.5x ground speed | Horizontal air movement |
| Friction | 0.85 multiplier | Ground deceleration |

### 3.4 Hitbox/Hurtbox System

#### 3.4.1 Collision Volume Types

**HURTBOX (Receive Damage)**
- Attached to character skeleton
- Multiple volumes per character (head, torso, legs)
- State-dependent (crouching shrinks, jumping extends)
- Can be flagged invincible (dash, recovery)

**HITBOX (Deal Damage)**
- Spawned during attack active frames
- Carries damage, hitstun, knockback data
- Owner reference (prevents self-hits)
- Single-hit flag (hits once per activation)

**PUSHBOX (Collision)**
- Prevents character overlap
- Simplified capsule shape
- Always active

#### 3.4.2 Collision Detection Flow

```
EVERY FIXED UPDATE:

1. Gather all active hitboxes
2. Gather all active hurtboxes
3. For each hitbox:
   a. Skip if owner is same as hurtbox owner
   b. Skip if hitbox already hit this target this activation
   c. Check AABB overlap (broad phase)
   d. If overlap, check precise shape intersection
   e. If hit confirmed:
      - Apply damage to target
      - Apply hitstun to target
      - Apply knockback to target
      - Trigger hit effects
      - Mark hitbox as "hit this target"
      - Notify attacker (for cancel windows)
```

#### 3.4.3 Hit Confirmation Events

| Event | Triggered When | Data Payload |
|-------|----------------|---------------|
| OnHitConfirm | Hitbox connects unblocked | damage, hitstun, knockback |
| OnBlockConfirm | Hitbox connects blocked | blockstun, chip_damage |
| OnWhiff | Active frames end, no hit | none |
| OnCounterHit | Hit during startup frames | 1.5x hitstun |
| OnTrade | Simultaneous hits | both payloads |

### 3.5 Input System

#### 3.5.1 Input Mapping

| Action | Keyboard | Controller | Touch |
|--------|----------|------------|-------|
| Move Left | A / ← | Left Stick | Virtual Stick |
| Move Right | D / → | Left Stick | Virtual Stick |
| Jump | Space / W | A Button | Jump Button |
| Light Attack | J | X Button | Attack 1 |
| Heavy Attack | K | Y Button | Attack 2 |
| Tail Ability | L | B Button | Special |
| Block | S | LT (Hold) | Block Button |
| Dash | E | RB | Swipe |
| Tail Switch Left | Q | LB | Swipe Left |
| Tail Switch Right | R | D-Pad Right | Swipe Right |
| Pause | Escape | Start | Pause Icon |

#### 3.5.2 Input Buffering

```
INPUT BUFFER SYSTEM:

Buffer Size: 6 frames (100ms)
Buffer stores: (action, timestamp, consumed)

On each frame:
1. Add new inputs to buffer with current timestamp
2. Remove inputs older than buffer window
3. When checking for action:
   a. Search buffer for matching action
   b. If found and not consumed, execute and mark consumed
   c. Allows early inputs to register

Benefits:
- Forgiving timing for combos
- Responsive feel despite frame data
- Cancel windows feel natural
```

#### 3.5.3 Input Priority

When multiple inputs arrive same frame:

1. Dash (highest priority)
2. Block
3. Tail Ability
4. Heavy Attack
5. Light Attack
6. Jump
7. Movement (lowest priority)

### 3.6 Camera System

#### 3.6.1 Combat Camera Behavior

**Default Position:** Side-view, 2.5D perspective
- Camera X: Midpoint between player and nearest enemy
- Camera Y: Slightly above combatants (4 units up)
- Camera Z: Fixed distance (12 units back)
- FOV: 50 degrees

**Dynamic Adjustments:**

| Situation | Camera Response |
|-----------|-----------------|
| Enemies spread wide | Zoom out, max 18 units back |
| Close combat | Zoom in, min 8 units back |
| Player jumping | Slight tilt up |
| Heavy hit | Hit-stop + micro zoom |
| Ultimate ability | Dramatic zoom + slow-mo |
| Knockdown | Pan slightly to victor |

#### 3.6.2 Camera Shake Parameters

| Event | Intensity | Duration | Frequency |
|-------|-----------|----------|------------|
| Light hit | 2 units | 4 frames | High |
| Heavy hit | 5 units | 8 frames | Medium |
| Block | 1 unit | 3 frames | High |
| Tail ability | 8 units | 12 frames | Low |
| Counter hit | 10 units | 10 frames | Medium |

#### 3.6.3 Hit-Stop Implementation

```
HIT-STOP SYSTEM:

On hit confirm:
1. Freeze game time (not real time)
2. Duration based on attack weight:
   - Light: 4 frames (67ms)
   - Medium: 6 frames (100ms)
   - Heavy: 10 frames (167ms)
   - Special: 15 frames (250ms)
3. During freeze:
   - Character holds pose
   - VFX continue playing
   - Camera shake active
   - Audio plays impact
4. Resume game time

Implementation: Time scale or fixed update skip
```

---

## 4. 9-TAIL PROGRESSION SYSTEM

### 4.1 System Overview

Kai-Jax always possesses nine tails. The game reveals them through progression, not collection. Each tail represents a different combat philosophy and connects to Sabertooth God lore.

### 4.2 Tail Definitions

| # | Tail Name | Element | God Connection | Combat Role |
|---|-----------|---------|----------------|-------------|
| 1 | Ember | Fire | Pyraxis | Burst damage, aggression |
| 2 | Gale | Wind | Kar-Voth | Mobility, air control |
| 3 | Shade | Shadow | Myrr'Kai | Counters, evasion |
| 4 | Volt | Lightning | Kar-Voth (echo) | Speed, stun |
| 5 | Stone | Earth | Thryxen | Defense, armor |
| 6 | Tide | Water | Memory Grove | Sustain, healing |
| 7 | Thorn | Nature | Fangforge | Traps, zone control |
| 8 | Prism | Light | Alignment | Reflection, parry |
| 9 | Void | Memory | The Crown | Reality manipulation |

### 4.3 Tail Unlock Progression

```
PROGRESSION TIMELINE:

┌─────────────────────────────────────────────────────────────┐
│  ACT 1: The Awakening                                        │
│  - Tails 1-3 unlocked (Ember, Gale, Shade)                  │
│  - Tutorial for tail switching                               │
│  - Basic ability set per tail                                │
├─────────────────────────────────────────────────────────────┤
│  ACT 2: The Fangforge                                        │
│  - Tail 4 unlocked (Volt) - Boss reward                     │
│  - Tail 5 unlocked (Stone) - Story event                    │
│  - Intermediate abilities unlock                             │
├─────────────────────────────────────────────────────────────┤
│  ACT 3: The Veil Scar                                        │
│  - Tail 6 unlocked (Tide) - Selene quest                    │
│  - Tail 7 unlocked (Thorn) - Exploration reward             │
│  - Advanced abilities unlock                                 │
├─────────────────────────────────────────────────────────────┤
│  ACT 4: The Memory Grove                                     │
│  - Tail 8 unlocked (Prism) - Trial completion               │
│  - All tails gain Tier 2 upgrades                           │
├─────────────────────────────────────────────────────────────┤
│  ACT 5: The Abyssal Engine                                   │
│  - Tail 9 unlocked (Void) - Alignment achieved              │
│  - Ultimate abilities available                              │
│  - Tail Fusion combos enabled                                │
└─────────────────────────────────────────────────────────────┘
```

### 4.4 Tail Ability Framework

Each tail grants:
- **Passive Modifier:** Always-on stat change when equipped
- **Tail Action:** Special ability (L button)
- **Combo Modifier:** Changes attack properties
- **Ultimate:** High-cost, devastating ability

#### 4.4.1 Ember Tail (Fire)

| Ability | Type | Description |
|---------|------|-------------|
| Burning Presence | Passive | +15% damage, attacks apply burn DOT |
| Flare Lash | Action | 22 damage fire whip, ignites enemies |
| Inferno Chain | Combo | Light>Light>Heavy launches fire wave |
| Pyraxis Wrath | Ultimate | Screen-wide fire explosion |

**Visual:** Orange/red tail with flowing flame particles, heat distortion

#### 4.4.2 Gale Tail (Wind)

| Ability | Type | Description |
|---------|------|-------------|
| Wind Walker | Passive | +20% move speed, double jump |
| Ridge Step | Action | Invincible dash through enemies |
| Cyclone Combo | Combo | Juggle launcher, extended air time |
| Storm Lord's Gale | Ultimate | Tornado that pulls enemies |

**Visual:** Cyan tail with swirling air currents, leaves/debris particles

#### 4.4.3 Shade Tail (Shadow)

| Ability | Type | Description |
|---------|------|-------------|
| Myrr'Kai's Veil | Passive | +25% counter damage, faster dodges |
| Ghost Reversal | Action | Counter stance, reflects damage |
| Shadow Step | Combo | Teleport behind on successful hit |
| Memory Eater | Ultimate | Consumes enemy buffs, deals stored damage |

**Visual:** Purple/black tail with void tendrils, ink-like dripping

#### 4.4.4 Volt Tail (Lightning)

| Ability | Type | Description |
|---------|------|-------------|
| Static Field | Passive | Attacks stun briefly, +10% attack speed |
| Snap Bind | Action | Long-range tether, immobilizes enemy |
| Thunder Chain | Combo | Rapid multi-hit lightning strikes |
| Kar-Voth's Judgment | Ultimate | Massive lightning pillar |

**Visual:** Yellow tail with arc electricity, crackling energy

#### 4.4.5 Stone Tail (Earth)

| Ability | Type | Description |
|---------|------|-------------|
| Bedrock Stance | Passive | +30% defense, cannot be launched |
| Quake Hook | Action | Guard break pull attack |
| Mountain Crusher | Combo | Heavy>Heavy gains super armor |
| Thryxen's Fortress | Ultimate | Stone shield, reflects projectiles |

**Visual:** Gray/brown tail with floating rock debris, moss patches

#### 4.4.6 Tide Tail (Water)

| Ability | Type | Description |
|---------|------|-------------|
| Flowing Recovery | Passive | Slow health regen, cleanse DOTs |
| Undertow Loop | Action | Drag enemy through water wave |
| Current Combo | Combo | Attacks heal on hit |
| Tsunami's Embrace | Ultimate | Full heal + damage wave |

**Visual:** Blue tail with water surface shader, bubble particles

#### 4.4.7 Thorn Tail (Nature)

| Ability | Type | Description |
|---------|------|-------------|
| Overgrowth | Passive | Traps last longer, poison damage |
| Briar Net | Action | Place trap that roots enemies |
| Vine Whip | Combo | Extended range attacks |
| Fangforge Bloom | Ultimate | Arena-wide thorn eruption |

**Visual:** Green tail with bark texture, animated growth veins

#### 4.4.8 Prism Tail (Light)

| Ability | Type | Description |
|---------|------|-------------|
| Radiant Guard | Passive | Perfect blocks reflect damage |
| Mirror Cut | Action | Parry that returns projectiles |
| Prismatic Combo | Combo | Attacks blind enemies briefly |
| Corona Burst | Ultimate | Blinding explosion, invincibility |

**Visual:** White tail with rainbow refraction, lens flare particles

#### 4.4.9 Void Tail (Memory)

| Ability | Type | Description |
|---------|------|-------------|
| Crown of Memory | Passive | All meters charge faster |
| Architect's Denial | Action | Cancel one enemy action |
| Reality Edit | Combo | Attacks phase through blocks |
| The Ninth Truth | Ultimate | Time stop, guaranteed hit |

**Visual:** Black hole effect, event horizon, space-time distortion

### 4.5 Tail Switching System

#### 4.5.1 Runtime Switching

```
TAIL SWITCH LOGIC:

Input: Tail Switch Left/Right

On switch:
1. Cannot switch during attack active frames
2. Cannot switch during hitstun/blockstun
3. Can switch during idle, walking, running, blocking
4. Switch animation: 6 frames (instant feel, brief flash)
5. New tail passive immediately active
6. Cooldown on switched-from tail: 30 frames
```

#### 4.5.2 Visual Transition

1. Current active tail dims (emissive 1.0 → 0.2)
2. Brief full-body flash in new tail color (4 frames)
3. New tail brightens (emissive 0.2 → 2.0)
4. Particle burst at tail base in new element
5. HUD indicator updates

### 4.6 Tail Upgrade System

**UPGRADE TIERS:**

| Tier | Unlock Requirement | Benefits |
|------|-------------------|----------|
| Base | Story unlock | Basic ability |
| Tier 1 | 10 Memory Fragments | Enhanced ability |
| Tier 2 | 25 Memory Fragments + Trial | New combo route |
| Tier 3 | 50 Memory Fragments + Story | Ultimate unlocked |
| Mastery | 100 Fragments + Perfect Trial | Fusion combos |

**Memory Fragments:** Collectibles found in world, dropped by enemies, rewarded for challenges

---

## 5. ENEMY AI DESIGN

### 5.1 AI Philosophy

**"Design beats habit. Memory beats design."**

Enemies in Legends of Kai-Jax are not random. They are "designed" by Ulgorr—built to observe, learn, and counter player patterns. The player wins by being unpredictable, not by repeating optimal strategies.

### 5.2 AI State Machine

```
                    ┌─────────────────┐
                    │     OBSERVE     │◄──────────────────┐
                    └────────┬────────┘                   │
                             │                            │
              Player in range / Aggression timer          │
                             │                            │
                             ▼                            │
                    ┌─────────────────┐                   │
                    │    APPROACH     │                   │
                    └────────┬────────┘                   │
                             │                            │
                    In attack range                       │
                             │                            │
                             ▼                            │
                    ┌─────────────────┐                   │
               ┌────│    PRESSURE     │────┐              │
               │    └────────┬────────┘    │              │
               │             │             │              │
         Opening found  Timeout/Hit  Player attacking    │
               │             │             │              │
               ▼             ▼             ▼              │
        ┌──────────┐  ┌──────────┐  ┌──────────┐         │
        │  COMMIT  │  │  ADAPT   │  │  DEFEND  │         │
        └────┬─────┘  └────┬─────┘  └────┬─────┘         │
             │             │             │               │
             └─────────────┼─────────────┘               │
                           │                             │
                           ▼                             │
                    ┌─────────────────┐                  │
                    │     RECOVER     │──────────────────┘
                    └─────────────────┘
```

### 5.3 State Definitions

#### 5.3.1 OBSERVE State

**Purpose:** Gather player behavior data

**Actions:**
- Track player position, distance, facing
- Log player attack patterns (last 6 moves)
- Log player timing patterns (attack intervals)
- Maintain preferred distance
- Minimal movement, watchful stance

**Transitions:**
- → APPROACH: Player too far OR aggression timer expires
- → DEFEND: Player attacks
- → COMMIT: Opening detected (player recovery)

**Duration:** 60-120 frames (1-2 seconds)

#### 5.3.2 APPROACH State

**Purpose:** Close distance to player

**Actions:**
- Move toward player at walk speed
- Occasional dash-in
- Continue pattern logging
- Maintain facing toward player

**Transitions:**
- → PRESSURE: Within attack range
- → DEFEND: Player attacks during approach
- → OBSERVE: Player retreats significantly

#### 5.3.3 PRESSURE State

**Purpose:** Apply offensive pressure, look for openings

**Actions:**
- Hover at preferred distance (just outside player range)
- Feint movements (baiting player attacks)
- Mix between advancing and retreating
- High pattern analysis activity

**Transitions:**
- → COMMIT: Opening found (player whiff, recovery)
- → DEFEND: Player attacking
- → ADAPT: Sufficient data collected
- → OBSERVE: Timeout (15-30 frames)

#### 5.3.4 COMMIT State

**Purpose:** Execute attack

**Actions:**
- Choose attack based on situation:
  - Close range: Light attack
  - Medium range: Heavy attack
  - Player blocking: Guard break / throw
  - Player adapted-to: Use un-countered move
- Execute attack with full commitment
- Cannot cancel once started

**Transitions:**
- → RECOVER: Attack complete
- → OBSERVE: If attack interrupted

#### 5.3.5 DEFEND State

**Purpose:** Survive player offense

**Actions:**
- Block if player attacking
- Backdash if player approaching with attack
- Jump if player using low attacks
- Attempt to find counter-attack window

**Transitions:**
- → PRESSURE: Player attack ends
- → COMMIT: Successful block, counter opportunity
- → RECOVER: Took damage, need to reset

#### 5.3.6 ADAPT State

**Purpose:** Process learned patterns, adjust behavior

**Actions:**
- Analyze collected player data
- Identify most common player actions
- Build resistance to repeated patterns
- Adjust aggression/defensive balance
- Select counter-strategies

**Results:**
- Increase block rate for commonly used attacks
- Preemptive positioning against predicted moves
- Faster reactions to "known" patterns
- Recommend specific counter-moves

**Transitions:**
- → PRESSURE: Adaptation complete

#### 5.3.7 RECOVER State

**Purpose:** Reset after attack or being hit

**Actions:**
- Back away from player
- Rebuild spacing
- Clear any temporary states
- Cool down aggression

**Transitions:**
- → OBSERVE: Recovery complete (20-40 frames)

### 5.4 Pattern Learning System

#### 5.4.1 Data Collection

```
PLAYER PATTERN TRACKING:

Data structures:
- move_frequency: dict[move_name, count]
- timing_history: list[frame_gaps between attacks]
- position_history: list[relative_positions]
- response_patterns: dict[enemy_action, player_response]

On player action:
1. Log action type
2. Log timing since last action  
3. Log relative position
4. If responding to enemy action, log that pairing
5. Update frequency counts
```

#### 5.4.2 Pattern Analysis

```
ADAPTATION LOGIC:

Every 120 frames (2 seconds):
1. Calculate most used move:
   most_common = max(move_frequency, key=count)
   
2. Check for predictability:
   total_moves = sum(move_frequency.values())
   predictability = move_frequency[most_common] / total_moves
   
3. If predictability > 0.4 (40% one move):
   - Add resistance to that move
   - Prepare specific counter
   
4. Check timing patterns:
   avg_timing = mean(timing_history)
   if timing variance low:
     - Predict next attack timing
     - Preemptive defense/attack
     
5. Check position patterns:
   preferred_range = mode(position_history)
   - Deny that range
   - Force uncomfortable distances
```

#### 5.4.3 Resistance System

```
RESISTANCE BUILDUP:

For each move type enemy has seen:
- resistance[move] starts at 0
- Each time hit by move: resistance[move] += 0.1
- Each time block move: resistance[move] += 0.05
- Max resistance: 0.5 (50%)

Resistance effects:
- Block probability increased by resistance value
- Reaction time decreased by resistance * 4 frames
- Counter probability increased by resistance * 0.5

Resistance decay:
- If move not seen for 300 frames: resistance -= 0.1
- Prevents permanent resistance
- Rewards variety
```

### 5.5 Enemy Type Variations

#### 5.5.1 Iterator (Standard)

- Balanced stats
- Medium adaptation speed (0.1 per hit)
- Standard aggression (60%)
- Teaches: Pattern variation

#### 5.5.2 Null Stalker

- Lower health, higher damage
- Slow adaptation (0.05)
- Low aggression, ambush style
- Punishes panic dodging
- Teaches: Calm under pressure

#### 5.5.3 Bastion

- High health, high armor
- Very slow adaptation (0.03)
- Low aggression, tank style
- Super armor on attacks
- Teaches: Patience, guard breaks

#### 5.5.4 Phase Weaver

- Low health, teleportation
- Fast adaptation (0.15)
- Medium aggression, hit-and-run
- Creates visual confusion
- Teaches: Trust your timing, not visuals

#### 5.5.5 Crown Warden (Mini-Boss)

- All adaptation abilities
- All attack patterns
- Phase shifts through fight
- Ultimate alignment test
- Teaches: Everything

### 5.6 Behavior Tree Implementation (UE5)

```
ROOT (Selector)
├── Emergency (Sequence)
│   ├── Check: Health < 25%
│   └── Action: Desperate Attack / Flee
│
├── Defend (Sequence)  
│   ├── Check: Player attacking AND in range
│   └── Selector
│       ├── Sequence [Check adapted to attack] → Counter
│       ├── Sequence [Check can block] → Block
│       └── Action: Backdash
│
├── Commit (Sequence)
│   ├── Check: Opening detected
│   ├── Check: In attack range
│   └── Action: Execute best attack
│
├── Pressure (Sequence)
│   ├── Check: In engagement range
│   └── Parallel
│       ├── Action: Maintain distance
│       └── Service: Log player patterns
│
├── Approach (Sequence)
│   ├── Check: Out of engagement range
│   └── Action: Move toward player
│
└── Observe (Sequence)
    └── Parallel
        ├── Action: Idle animation
        └── Service: Analyze patterns
```

---

## 6. CROSS-PLATFORM SCALING

### 6.1 Platform Tiers

| Tier | Platforms | Target Performance |
|------|-----------|--------------------|
| **Tier 1: Ultra** | PC (High-end), PS5, Xbox Series X | 4K60 or 1080p120 |
| **Tier 2: High** | PC (Mid-range), Xbox Series S | 1440p60 |
| **Tier 3: Medium** | PC (Low-end), Tablets (High-end) | 1080p60 |
| **Tier 4: Low** | Mobile (High-end), Switch | 720p60 or 1080p30 |
| **Tier 5: Minimum** | Mobile (Mid-range) | 720p30 |

### 6.2 Scaling Strategies

#### 6.2.1 Character Rendering

| Feature | T1 Ultra | T2 High | T3 Med | T4 Low | T5 Min |
|---------|----------|---------|--------|--------|--------|
| Fur Method | Strands | Shell 24 | Shell 16 | Shell 8 | Solid |
| Tail VFX | Full | Full | Reduced | Minimal | Glow only |
| Shadow Quality | Ultra | High | Medium | Blob | None |
| Material Complexity | Full PBR | Full PBR | Simplified | Mobile | Unlit |
| Bone Count | 150+ | 150+ | 100 | 60 | 40 |

#### 6.2.2 Combat Feel Preservation

**CRITICAL: These do NOT scale:**
- Input latency target: <16ms on all platforms
- Frame data timing: Exact across all platforms
- Hitbox/hurtbox precision: Identical
- Hit-stop timing: Identical
- Combo windows: Identical

**These CAN scale:**
- VFX particle counts
- Camera shake intensity (reduce on mobile)
- Background detail
- Shadow complexity

#### 6.2.3 Environment Scaling

| Element | T1-T2 | T3-T4 | T5 |
|---------|-------|-------|----|
| Draw Distance | 500m | 200m | 100m |
| LOD Bias | 0 | 1 | 2 |
| Particle Count | 100% | 50% | 25% |
| Dynamic Lights | 8 | 4 | 2 |
| Reflections | SSR | Cube | None |
| Shadows | Cascaded | Single | Blob |

### 6.3 Mobile-Specific Considerations

#### 6.3.1 Touch Controls

```
TOUCH CONTROL LAYOUT:

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  [PAUSE]                                    [TAIL DISPLAY]  │
│                                                             │
│                    [GAME VIEW]                              │
│                                                             │
│                                                             │
│  ┌─────────┐                              ┌───┐ ┌───┐       │
│  │         │                              │ A │ │ B │       │
│  │  STICK  │                              └───┘ └───┘       │
│  │         │                              ┌───┐ ┌───┐       │
│  └─────────┘                              │ X │ │ Y │       │
│                                           └───┘ └───┘       │
│  [BLOCK]   [DASH]              [TAIL-]  [SPECIAL] [TAIL+]   │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Gestures:
- Swipe left/right: Tail switch
- Swipe up: Jump
- Double-tap attack: Heavy attack
- Hold block: Block
- Tap enemy: Auto-target
```

#### 6.3.2 Mobile Performance Budget

| Resource | Budget |
|----------|--------|
| Draw calls | <100 per frame |
| Triangles | <50,000 on screen |
| Texture memory | <512MB |
| Frame time | <33ms (30fps floor) |
| Thermal | Sustainable for 30min sessions |

### 6.4 Network Considerations

**Local Multiplayer Priority:** Game designed for local co-op/versus first.

**Online Future-Proofing:**
- Deterministic simulation enables rollback netcode
- Fixed-point math for cross-platform sync
- Input-based replay system
- Spectator state serialization

---

## 7. UNREAL ENGINE 5 IMPLEMENTATION GUIDE

### 7.1 Project Structure

```
LegendsOfKaiJax/
├── Content/
│   ├── Characters/
│   │   ├── KaiJax/
│   │   │   ├── Meshes/
│   │   │   ├── Materials/
│   │   │   ├── Animations/
│   │   │   ├── Blueprints/
│   │   │   └── Groom/
│   │   └── Enemies/
│   │       ├── Iterator/
│   │       ├── NullStalker/
│   │       └── ...
│   ├── Tails/
│   │   ├── Ember/
│   │   ├── Gale/
│   │   └── ...
│   ├── Combat/
│   │   ├── Hitboxes/
│   │   ├── FrameData/
│   │   └── Effects/
│   ├── AI/
│   │   ├── BehaviorTrees/
│   │   ├── Services/
│   │   └── Tasks/
│   ├── Environments/
│   └── UI/
└── Source/
    ├── KaiJax/
    │   ├── Combat/
    │   │   ├── CombatComponent.h
    │   │   ├── FrameDataManager.h
    │   │   ├── HitboxComponent.h
    │   │   └── InputBufferComponent.h
    │   ├── Characters/
    │   │   ├── KaiJaxCharacter.h
    │   │   └── EnemyCharacter.h
    │   ├── Tails/
    │   │   ├── TailComponent.h
    │   │   └── TailAbilityBase.h
    │   └── AI/
    │       ├── PatternTracker.h
    │       └── AdaptiveAIController.h
    └── KaiJax.Build.cs
```

### 7.2 Key Components

#### 7.2.1 Character Setup

**KaiJaxCharacter (C++)**
- Inherits: ACharacter
- Components:
  - UCombatComponent (combat state, frame data)
  - UTailManagerComponent (tail switching, abilities)
  - UInputBufferComponent (input handling)
  - UHurtboxComponent (damage reception)
  
**Movement Mode:**
- Custom CharacterMovementComponent
- Fixed-step position updates
- Frame-perfect ground/air detection

#### 7.2.2 Combat Component

```cpp
// Pseudocode structure
UCOMPONENT()
class UCombatComponent : public UActorComponent
{
    // State Machine
    ECombatState CurrentState;
    float StateElapsedTime;
    
    // Frame Data
    FFrameData* CurrentMoveData;
    int32 CurrentFrame;
    
    // Hit Registration
    TArray<UHitboxComponent*> ActiveHitboxes;
    bool bHasHitThisAttack;
    
    // Functions
    void ExecuteMove(FName MoveName);
    void AdvanceFrame(float DeltaTime);
    void CheckHitboxCollisions();
    void OnHitConfirm(FHitResult Result);
};
```

#### 7.2.3 Tail System

**UTailManagerComponent**
- Manages all 9 tail states
- Handles switching logic
- Activates/deactivates tail abilities
- Updates visual representation

**UTailAbilityBase (Abstract)**
- Defines ability interface
- Overridden per tail type
- Contains frame data, VFX references, logic

#### 7.2.4 AI Controller

**AAdaptiveAIController**
- Inherits: AAIController
- Uses Behavior Tree (see Section 5.6)
- Contains UPatternTrackerComponent
- Implements adaptation logic

### 7.3 Animation Setup

**Animation Blueprint Structure:**

```
EventGraph:
├── Update from combat component state
├── Calculate blend weights
└── Set tail visibility/material params

AnimGraph:
├── Locomotion State Machine
│   ├── Idle
│   ├── Walk
│   ├── Run
│   ├── Jump
│   └── Fall
├── Combat Layer (Additive/Override)
│   ├── Attack animations (per move)
│   ├── Hit reactions
│   └── Block poses
└── Tail Layer (Layered Blend)
    ├── Per-tail idle animations
    └── Per-tail active animations
```

**Animation Notify System:**
- AN_HitboxStart: Spawn hitbox
- AN_HitboxEnd: Destroy hitbox
- AN_CanCancel: Enable cancel window
- AN_PlaySound: Impact sounds
- AN_SpawnVFX: Visual effects

### 7.4 Rendering Setup

**Groom for Fur:**
- Use UE5 Groom system for Tier 1-2
- Fallback to shell material for Tier 3+

**Material Instances:**
- Master Material for character body
- Per-tail material instances
- Dynamic parameter: EmissiveIntensity, ElementColor

**Niagara for VFX:**
- Per-tail particle systems
- Hit effect system (3 profiles)
- Environmental particles

### 7.5 Performance Settings

**Scalability Settings:**

| Setting | T1 | T2 | T3 | T4 |
|---------|----|----|----|----|----|
| sg.ShadowQuality | 4 | 3 | 2 | 1 |
| sg.EffectsQuality | 4 | 3 | 2 | 1 |
| sg.FoliageQuality | 4 | 3 | 2 | 1 |
| r.Groom.Enable | 1 | 1 | 0 | 0 |
| r.DynamicRes.Enable | 0 | 1 | 1 | 1 |

---

## 8. UNITY IMPLEMENTATION GUIDE

### 8.1 Project Structure

```
LegendsOfKaiJax/
├── Assets/
│   ├── Characters/
│   │   ├── KaiJax/
│   │   │   ├── Models/
│   │   │   ├── Materials/
│   │   │   ├── Animations/
│   │   │   └── Prefabs/
│   │   └── Enemies/
│   ├── Tails/
│   │   ├── Ember/
│   │   └── ...
│   ├── Combat/
│   │   ├── ScriptableObjects/
│   │   │   ├── MoveData/
│   │   │   └── TailData/
│   │   └── Prefabs/
│   │       ├── Hitboxes/
│   │       └── Effects/
│   ├── AI/
│   │   └── BehaviorDesigner/ (or custom)
│   ├── Environments/
│   └── UI/
├── Scripts/
│   ├── Combat/
│   │   ├── CombatController.cs
│   │   ├── FrameDataManager.cs
│   │   ├── HitboxController.cs
│   │   └── InputBuffer.cs
│   ├── Characters/
│   │   ├── KaiJaxController.cs
│   │   └── EnemyController.cs
│   ├── Tails/
│   │   ├── TailManager.cs
│   │   ├── TailAbilityBase.cs
│   │   └── Abilities/
│   └── AI/
│       ├── PatternTracker.cs
│       └── AdaptiveAI.cs
└── Packages/
```

### 8.2 Key Components

#### 8.2.1 Combat Controller

```csharp
// Pseudocode structure
public class CombatController : MonoBehaviour
{
    // State Machine
    public CombatState CurrentState { get; private set; }
    private float stateElapsedTime;
    
    // Frame Data
    [SerializeField] private MoveDataSO currentMove;
    private int currentFrame;
    
    // Hit Registration
    private List<HitboxController> activeHitboxes;
    private bool hasHitThisAttack;
    
    // Fixed Update for determinism
    void FixedUpdate()
    {
        AdvanceFrame(Time.fixedDeltaTime);
    }
    
    public void ExecuteMove(MoveDataSO move) { }
    private void CheckHitboxCollisions() { }
    private void OnHitConfirm(HitResult result) { }
}
```

#### 8.2.2 ScriptableObject Data

**MoveDataSO:**
```csharp
[CreateAssetMenu]
public class MoveDataSO : ScriptableObject
{
    public string moveName;
    public int startupFrames;
    public int activeFrames;
    public int recoveryFrames;
    public float damage;
    public int hitstunFrames;
    public int blockstunFrames;
    public Vector2 knockback;
    public MoveDataSO[] cancelTargets;
    public GameObject hitboxPrefab;
    public AnimationClip animation;
}
```

**TailDataSO:**
```csharp
[CreateAssetMenu]
public class TailDataSO : ScriptableObject
{
    public string tailName;
    public TailElement element;
    public Color tailColor;
    public Material tailMaterial;
    public TailAbilityBase[] abilities;
    public StatModifier passiveEffect;
}
```

#### 8.2.3 Tail System

**TailManager:**
- MonoBehaviour on KaiJax
- Array of TailDataSO references
- Handles switching, cooldowns
- Updates visual mesh/materials

**TailAbilityBase (Abstract):**
- Defines Execute(), CanUse(), OnHit()
- Each tail type implements specific abilities

### 8.3 Animation Setup

**Animator Controller Structure:**

```
Parameters:
├── CombatState (int)
├── MoveID (int)
├── IsGrounded (bool)
├── MoveSpeed (float)
├── ActiveTail (int)
└── HitReaction (trigger)

Layers:
├── Base Layer (locomotion)
├── Combat Layer (override, masked)
└── Tail Layer (additive)

States:
├── Locomotion (Blend Tree)
│   ├── Idle
│   ├── Walk
│   ├── Run
│   └── Jump/Fall
├── Attacks (Sub-State Machine)
│   ├── LightAttack
│   ├── HeavyAttack
│   └── ... (per move)
└── Reactions
    ├── HitLight
    ├── HitHeavy
    └── Knockdown
```

**Animation Events:**
- HitboxStart(int hitboxID)
- HitboxEnd(int hitboxID)
- CanCancelStart()
- CanCancelEnd()
- PlaySFX(string sfxName)
- SpawnVFX(string vfxName)

### 8.4 Rendering Setup

**Render Pipeline:** URP or HDRP

**HDRP (Tier 1-2):**
- Hair shader for fur
- Subsurface scattering for skin
- Full PBR materials
- Volumetric lighting

**URP (Tier 3-5):**
- Shell fur shader (custom)
- Simplified materials
- Baked lighting
- Mobile-optimized shaders

**VFX Graph:**
- Per-tail particle systems
- Hit effects (3 profiles)
- Environmental ambiance

### 8.5 Input System

**New Input System:**
- Action Maps: Combat, UI, Menus
- Processor: Buffer processor for input buffering
- Device support: Keyboard, Gamepad, Touch

```csharp
// Input Action Asset structure
Combat:
├── Move (Vector2)
├── Jump (Button)
├── LightAttack (Button)
├── HeavyAttack (Button)
├── TailAbility (Button)
├── Block (Button, Hold)
├── Dash (Button)
├── TailSwitchLeft (Button)
├── TailSwitchRight (Button)
└── Pause (Button)
```

### 8.6 AI Implementation

**Options:**
1. **Behavior Designer** (Asset Store) - Visual behavior trees
2. **NodeCanvas** (Asset Store) - Visual state machines
3. **Custom FSM** - Lightweight, full control

**Pattern Tracker:**
```csharp
public class PatternTracker : MonoBehaviour
{
    private Dictionary<string, int> moveFrequency;
    private Queue<float> timingHistory;
    private Dictionary<string, float> resistances;
    
    public void LogPlayerAction(string action, float timing) { }
    public float GetPredictability() { }
    public string GetMostCommonMove() { }
    public float GetResistance(string move) { }
    public void DecayResistances(float deltaTime) { }
}
```

---

## 9. ASSET PIPELINE REQUIREMENTS

### 9.1 Character Assets

#### 9.1.1 Kai-Jax Model

| LOD | Triangle Count | Bone Count | Use Case |
|-----|----------------|------------|----------|
| LOD0 | 80,000 | 150 | Tier 1-2, close-up |
| LOD1 | 40,000 | 100 | Tier 2-3, medium |
| LOD2 | 15,000 | 60 | Tier 4, distant |
| LOD3 | 5,000 | 40 | Tier 5, mobile |

#### 9.1.2 Texture Maps

| Map Type | Resolution (LOD0) | Format |
|----------|-------------------|--------|
| Albedo | 4096x4096 | BC7/ASTC |
| Normal | 4096x4096 | BC5/ASTC |
| ORM (AO/Rough/Metal) | 2048x2048 | BC7/ASTC |
| Emissive Mask | 1024x1024 | BC4/ASTC |
| Fur Direction | 1024x1024 | BC7/ASTC |

#### 9.1.3 Animation Requirements

| Category | Animation Count | Frame Range |
|----------|-----------------|-------------|
| Locomotion | 8-12 | 24-60 frames |
| Combat (per move) | 1 | Match frame data |
| Tail idles | 9 | 60-120 frames (looping) |
| Hit reactions | 4-6 | 15-30 frames |
| Specials | 9 | 30-90 frames |

### 9.2 Enemy Assets

| Enemy | LOD0 Tris | LOD1 Tris | Bones |
|-------|-----------|-----------|-------|
| Iterator | 25,000 | 10,000 | 50 |
| Null Stalker | 20,000 | 8,000 | 45 |
| Bastion | 35,000 | 15,000 | 55 |
| Phase Weaver | 18,000 | 7,000 | 40 |
| Crown Warden | 50,000 | 25,000 | 80 |

### 9.3 VFX Assets

| Effect | Particle Count | Texture Size |
|--------|----------------|---------------|
| Hit Spark (Light) | 8 | 64x64 |
| Hit Spark (Medium) | 16 | 128x128 |
| Hit Spark (Heavy) | 24 | 256x256 |
| Tail Ember | 50 | 128x128 |
| Tail Gale | 30 | 128x128 |
| ... | ... | ... |

### 9.4 Audio Assets

| Category | Count | Format |
|----------|-------|--------|
| Attack SFX | 3 per move type | WAV/OGG |
| Hit SFX | 3 profiles | WAV/OGG |
| Block SFX | 2 | WAV/OGG |
| Tail SFX | 2 per tail | WAV/OGG |
| UI SFX | 10-15 | WAV/OGG |
| Music tracks | TBD | OGG/MP3 |

---

## 10. PERFORMANCE BUDGETS

### 10.1 Frame Budget (60fps target)

| Phase | Budget (ms) |
|-------|-------------|
| Input Processing | 0.5 |
| Game Logic | 3.0 |
| Animation | 2.0 |
| Physics/Collision | 2.0 |
| AI (per enemy) | 0.5 |
| Rendering (CPU) | 4.0 |
| Rendering (GPU) | 8.0 |
| **Total Budget** | **16.67** |
| **Reserve** | 3.67 |

### 10.2 Memory Budget

| Platform | Total | Characters | Environments | VFX | Audio | UI |
|----------|-------|------------|--------------|-----|-------|----|
| PC | 4GB | 800MB | 1.5GB | 500MB | 500MB | 200MB |
| Console | 3GB | 600MB | 1.2GB | 400MB | 400MB | 200MB |
| Mobile | 1GB | 200MB | 400MB | 150MB | 150MB | 100MB |

### 10.3 Draw Call Budget

| Platform | Max Draw Calls |
|----------|----------------|
| PC/Console | 2000 |
| Mobile | 200 |

### 10.4 Shader Complexity

| Shader | Instruction Count | Texture Samples |
|--------|-------------------|------------------|
| Character (Tier 1) | 200 | 6 |
| Character (Tier 4) | 80 | 3 |
| Environment | 100 | 4 |
| VFX | 50 | 2 |

---

## APPENDIX A: GLOSSARY

| Term | Definition |
|------|------------|
| **Frame Data** | Timing information for moves (startup, active, recovery) |
| **Hitstun** | Frames during which a hit character cannot act |
| **Blockstun** | Frames during which a blocking character cannot act |
| **Cancel Window** | Frames during which a move can be interrupted by another |
| **I-Frames** | Invincibility frames during which character cannot be hit |
| **ORM Map** | Texture combining Ambient Occlusion, Roughness, Metalness |
| **LOD** | Level of Detail - mesh/texture quality tiers |
| **Groom** | Hair/fur simulation system |
| **Shell Fur** | Layered transparency technique for fur rendering |

---

## APPENDIX B: REFERENCE LINKS

- Unreal Engine 5 Documentation: https://docs.unrealengine.com
- Unity Documentation: https://docs.unity3d.com
- Fighting Game Glossary: https://glossary.infil.net
- GDC Talks on Combat Design: Search "GDC combat design"

---

**Document Version:** 1.0  
**Last Updated:** February 2026  
**Author:** Game Design Team  
**Status:** Ready for Engine Implementation  

---

*"Survival without memory is extinction with better design."*

# KAI-JAX TAIL ABILITY SYSTEM BLUEPRINT
## Production Bible v1.0

**Document Type:** Systems Design Specification  
**Target Engines:** Unreal Engine 5 / Unity  
**Last Updated:** December 2025  
**Status:** Production Ready

---

## TABLE OF CONTENTS

1. [System Overview](#1-system-overview)
2. [Tail Data Architecture](#2-tail-data-architecture)
3. [Ability Framework](#3-ability-framework)
4. [Ability Definitions (All 9 Tails)](#4-ability-definitions-all-9-tails)
5. [Animation Integration](#5-animation-integration)
6. [VFX Integration](#6-vfx-integration)
7. [Audio Integration](#7-audio-integration)
8. [Progression System](#8-progression-system)
9. [Tail Fusion System](#9-tail-fusion-system)
10. [Implementation Guide](#10-implementation-guide)

---

## 1. SYSTEM OVERVIEW

### 1.1 The 9-Tail Philosophy

```
THE TAIL SYSTEM CORE RULES:

┌─────────────────────────────────────────────────────────────┐
│  1. TAILS ARE TOOLS, NOT POWER LEVELS                       │
│     - Each tail is situationally optimal                    │
│     - No "best" tail — only best for the moment             │
│     - Switching is tactical, not desperate                  │
├─────────────────────────────────────────────────────────────┤
│  2. ONE ACTIVE AT A TIME                                     │
│     - Only ONE tail is "active" at any moment               │
│     - Active tail provides passive + ability                │
│     - Switching is instant but has cooldown                 │
├─────────────────────────────────────────────────────────────┤
│  3. EACH TAIL HAS 4 COMPONENTS                               │
│     - PASSIVE: Always-on stat modifier                      │
│     - ACTION: Special ability (Tail Ability button)         │
│     - MODIFIER: Changes basic attack properties             │
│     - ULTIMATE: High-cost devastating move (late game)      │
├─────────────────────────────────────────────────────────────┤
│  4. VISUAL = MECHANICAL                                      │
│     - Tail appearance directly reflects ability             │
│     - Player can "read" opponent's equipped tail            │
│     - Color coding is consistent and meaningful             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 System Flow Diagram

```
                    ┌─────────────────────┐
                    │   PLAYER INPUT      │
                    │   (Tail Ability)    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  CHECK: Can Use?    │
                    │  - Not in hitstun   │
                    │  - Not in attack    │
                    │  - Has meter (if req)│
                    └──────────┬──────────┘
                               │
                       ┌───────┴───────┐
                       │               │
                      YES             NO
                       │               │
                       ▼               ▼
           ┌───────────────┐   ┌───────────────┐
           │ GET ACTIVE    │   │    REJECT     │
           │ TAIL DATA     │   │   (SFX only)  │
           └───────┬───────┘   └───────────────┘
                   │
                   ▼
           ┌───────────────┐
           │ EXECUTE:      │
           │ - Play Anim   │
           │ - Spawn VFX   │
           │ - Apply Effect│
           │ - Play SFX    │
           └───────┬───────┘
                   │
                   ▼
           ┌───────────────┐
           │ ENTER STATE:  │
           │ - Startup     │
           │ - Active      │
           │ - Recovery    │
           └───────────────┘
```

### 1.3 Tail Index Reference

| Index | Name | Element | Color Code | Unlock Act |
|-------|------|---------|------------|------------|
| 0 | Ember | Fire | #FF3B30 | Act 1 |
| 1 | Gale | Wind | #64D2FF | Act 1 |
| 2 | Shade | Shadow | #BF5AF2 | Act 1 |
| 3 | Volt | Lightning | #FFD60A | Act 2 |
| 4 | Stone | Earth | #8B8B8B | Act 2 |
| 5 | Tide | Water | #007AFF | Act 3 |
| 6 | Thorn | Nature | #30D158 | Act 3 |
| 7 | Prism | Light | #FFFFFF | Act 4 |
| 8 | Void | Memory | #2E2EFE | Act 5 |

---

## 2. TAIL DATA ARCHITECTURE

### 2.1 Tail Data Structure

```
// Engine-Agnostic Tail Definition
TailData {
    // Identity
    string      id;              // "ember", "gale", etc.
    string      displayName;     // "Ember Tail"
    int         index;           // 0-8
    Element     element;         // Enum: Fire, Wind, Shadow...
    
    // Visuals
    Color       primaryColor;    // Main glow color
    Color       secondaryColor;  // Accent color
    Material    tailMaterial;    // Unique material
    VFX         idleParticles;   // Ambient particles
    VFX         activeBurst;     // On-switch burst
    
    // Audio
    AudioClip   switchSound;     // Played on equip
    AudioClip   ambientLoop;     // Soft loop when active
    
    // Abilities
    PassiveData passive;         // Always-on effect
    AbilityData action;          // Main ability
    ModifierData combatMod;      // Attack modifications
    AbilityData ultimate;        // Ultimate ability
    
    // Progression
    int         unlockAct;       // When unlocked in story
    int[]       upgradeCosts;    // Fragment costs per tier
    bool        isUnlocked;      // Runtime state
    int         currentTier;     // 0-4 (Base to Mastery)
}
```

### 2.2 Passive Data Structure

```
PassiveData {
    string      name;            // "Burning Presence"
    string      description;     // UI tooltip
    
    // Stat Modifiers (multiplicative)
    float       damageMultiplier;    // 1.0 = no change
    float       speedMultiplier;
    float       defenseMultiplier;
    float       meterGainMultiplier;
    
    // Special Flags
    bool        grantsDoubleJump;
    bool        preventsLaunch;
    bool        enablesHealthRegen;
    bool        reflectOnPerfectBlock;
    
    // Status Effect Application
    StatusEffect onHitApply;     // Applied to enemies on hit
    float       onHitChance;     // 0.0-1.0
}
```

### 2.3 Ability Data Structure

```
AbilityData {
    string      name;            // "Flare Lash"
    string      description;
    
    // Frame Data
    int         startupFrames;
    int         activeFrames;
    int         recoveryFrames;
    
    // Combat Properties
    float       damage;
    int         hitstunFrames;
    int         blockstunFrames;
    Vector2     knockback;
    HitboxShape hitboxShape;
    float       hitboxSize;
    
    // Cost & Cooldown
    float       meterCost;       // 0.0-1.0 of Synergy meter
    int         cooldownFrames;  // Before can use again
    
    // Special Properties
    bool        isProjectile;
    bool        hasIFrames;
    int         iFrameStart;
    int         iFrameDuration;
    bool        isCounter;       // Counter-type ability
    bool        isGrab;          // Unblockable grab
    
    // References
    Animation   animation;
    VFX         vfxPrefab;
    AudioClip   sfx;
}
```

### 2.4 Combat Modifier Data

```
ModifierData {
    // Attack Property Changes
    Element     attackElement;   // Fire, Ice, etc.
    StatusEffect attackApplies;  // Burn, Stun, etc.
    float       attackApplyChance;
    
    // Visual Changes
    VFX         attackTrailVFX;
    Color       attackTrailColor;
    
    // Combo Route Changes
    bool        enablesAirCombo;
    bool        extendsJuggle;
    bool        addsWallBounce;
    
    // Special Attack Properties
    float       chipDamageMultiplier;  // Damage through block
    bool        guardBreaks;           // Ignores block
}
```

---

## 3. ABILITY FRAMEWORK

### 3.1 Ability Execution State Machine

```
                         ┌─────────────┐
                         │    READY    │
                         └──────┬──────┘
                                │
                          Input + CanUse
                                │
                                ▼
                         ┌─────────────┐
                         │   STARTUP   │
                         │  (Cannot    │
                         │   cancel)   │
                         └──────┬──────┘
                                │
                      Startup frames complete
                                │
                                ▼
                         ┌─────────────┐
                         │   ACTIVE    │
                         │  (Hitbox    │
                         │   exists)   │
                         └──────┬──────┘
                                │
                     Active frames complete
                                │
                    ┌───────────┴───────────┐
                    │                       │
               Hit Confirmed           No Hit
                    │                       │
                    ▼                       ▼
             ┌─────────────┐         ┌─────────────┐
             │   ON_HIT    │         │  RECOVERY   │
             │  (Effects   │         │  (Cannot    │
             │   apply)    │         │   act)      │
             └──────┬──────┘         └──────┬──────┘
                    │                       │
                    ▼                       │
             ┌─────────────┐                │
             │  RECOVERY   │                │
             └──────┬──────┘                │
                    │                       │
                    └───────────┬───────────┘
                                │
                      Recovery frames complete
                                │
                                ▼
                         ┌─────────────┐
                         │    READY    │
                         └─────────────┘
```

### 3.2 Ability Categories

```
ABILITY TYPE TAXONOMY:

┌─────────────────────────────────────────────────────────────┐
│  OFFENSIVE ABILITIES                                         │
│  - Direct damage dealers                                     │
│  - Have hitbox during active frames                          │
│  - Example: Ember's Flare Lash, Volt's Snap Bind            │
├─────────────────────────────────────────────────────────────┤
│  DEFENSIVE ABILITIES                                         │
│  - Counter/parry type                                        │
│  - Active during specific window                             │
│  - Example: Shade's Ghost Reversal, Prism's Mirror Cut      │
├─────────────────────────────────────────────────────────────┤
│  UTILITY ABILITIES                                           │
│  - Movement/positioning                                      │
│  - No direct damage                                          │
│  - Example: Gale's Ridge Step, Shade's Shadow Step          │
├─────────────────────────────────────────────────────────────┤
│  ZONE CONTROL ABILITIES                                      │
│  - Persistent area effects                                   │
│  - Longer duration                                           │
│  - Example: Thorn's Briar Net, Tide's Undertow             │
├─────────────────────────────────────────────────────────────┤
│  SUSTAIN ABILITIES                                           │
│  - Healing/buff type                                         │
│  - Self-benefit focus                                        │
│  - Example: Tide's passive regen, Stone's armor             │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Ability Input Processing

```
ABILITY INPUT FLOW:

1. RECEIVE INPUT (Tail Ability button)

2. CHECK STATE VALIDITY:
   - NOT in: Hitstun, Blockstun, Knockdown, Attack Startup
   - CAN be in: Idle, Walk, Run, Block Stance, Jump, Fall
   
3. CHECK RESOURCE:
   - Meter cost ≤ Current meter
   - Cooldown complete
   
4. CHECK SPECIAL CONDITIONS:
   - Counter abilities: Enemy must be attacking
   - Air abilities: Must be airborne
   - Ground abilities: Must be grounded
   
5. IF ALL PASS:
   - Consume meter
   - Start cooldown
   - Enter Startup state
   - Play animation from frame 0
   - Play startup SFX
   
6. IF ANY FAIL:
   - Play "cannot use" SFX
   - No state change
   - Provide feedback (UI flash)
```

---

## 4. ABILITY DEFINITIONS (ALL 9 TAILS)

### 4.1 EMBER TAIL (Fire) — Index 0

```
╔═══════════════════════════════════════════════════════════════╗
║  EMBER TAIL - THE AGGRESSOR                                    ║
║  "Burn first. Ask questions never."                            ║
╠═══════════════════════════════════════════════════════════════╣
║  ELEMENT: Fire        COLOR: #FF3B30        GOD: Pyraxis       ║
╚═══════════════════════════════════════════════════════════════╝

PASSIVE: Burning Presence
┌─────────────────────────────────────────────────────────────┐
│  +15% damage dealt                                           │
│  Attacks apply BURN (3 damage/sec for 3 sec)                │
│  Chance: 25%                                                 │
└─────────────────────────────────────────────────────────────┘

ACTION: Flare Lash
┌─────────────────────────────────────────────────────────────┐
│  Startup: 8 frames     Active: 6 frames    Recovery: 20 frm │
│  Damage: 22            Hitstun: 18 frames                    │
│  Knockback: (4, 2)     Range: Medium                         │
│  Meter Cost: 0.25      Cooldown: 30 frames                   │
│                                                              │
│  DESCRIPTION:                                                │
│  Whip the Ember tail forward in an arc. Creates a trail     │
│  of fire that lingers briefly. Guaranteed BURN on hit.      │
│                                                              │
│  VISUAL:                                                     │
│  Tail extends, leaves flame trail, erupts at tip            │
└─────────────────────────────────────────────────────────────┘

COMBAT MODIFIER:
┌─────────────────────────────────────────────────────────────┐
│  Attack Element: Fire                                        │
│  Light attacks leave ember particles                         │
│  Heavy attacks create small fire burst on impact             │
│  Air attacks have downward fire trail                        │
└─────────────────────────────────────────────────────────────┘

ULTIMATE: Pyraxis Wrath (Tier 3+)
┌─────────────────────────────────────────────────────────────┐
│  Startup: 30 frames    Active: 20 frames   Recovery: 45 frm │
│  Damage: 80            Meter Cost: 1.0 (full bar)           │
│                                                              │
│  DESCRIPTION:                                                │
│  Channel Pyraxis's rage. All nine tails ignite and slam     │
│  the ground, creating a screen-wide fire explosion.          │
│                                                              │
│  VISUAL:                                                     │
│  All tails glow orange → slam in unison → explosion outward │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 GALE TAIL (Wind) — Index 1

```
╔═══════════════════════════════════════════════════════════════╗
║  GALE TAIL - THE MOBILE                                        ║
║  "The wind doesn't stop. Neither should you."                  ║
╠═══════════════════════════════════════════════════════════════╣
║  ELEMENT: Wind        COLOR: #64D2FF        GOD: Kar-Voth      ║
╚═══════════════════════════════════════════════════════════════╝

PASSIVE: Wind Walker
┌─────────────────────────────────────────────────────────────┐
│  +20% movement speed                                         │
│  GRANTS DOUBLE JUMP (unique to Gale)                        │
│  Reduced gravity during descent (-30%)                       │
└─────────────────────────────────────────────────────────────┘

ACTION: Ridge Step
┌─────────────────────────────────────────────────────────────┐
│  Startup: 2 frames     Active: 12 frames   Recovery: 8 frm  │
│  Damage: 0 (utility)   Movement: 6 units forward            │
│  Meter Cost: 0.15      Cooldown: 45 frames                   │
│                                                              │
│  DESCRIPTION:                                                │
│  Instant dash through enemies. FULLY INVINCIBLE during       │
│  active frames. Can pass through projectiles and enemies.    │
│                                                              │
│  VISUAL:                                                     │
│  Body becomes translucent cyan, wind burst at start/end     │
└─────────────────────────────────────────────────────────────┘

COMBAT MODIFIER:
┌─────────────────────────────────────────────────────────────┐
│  Attack Element: Wind                                        │
│  Juggle duration extended +4 frames                          │
│  Air combos gain +1 hit before gravity kicks in              │
│  Attacks push enemies slightly (wind pressure)               │
└─────────────────────────────────────────────────────────────┘

ULTIMATE: Storm Lord's Gale (Tier 3+)
┌─────────────────────────────────────────────────────────────┐
│  Startup: 20 frames    Active: 120 frames  Recovery: 30 frm │
│  Damage: 5/tick        Meter Cost: 1.0 (full bar)           │
│                                                              │
│  DESCRIPTION:                                                │
│  Summon a massive tornado at target location. Pulls enemies │
│  toward center, juggling them repeatedly.                    │
│                                                              │
│  VISUAL:                                                     │
│  Cyan tornado, debris swirling, enemies caught and spinning │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 SHADE TAIL (Shadow) — Index 2

```
╔═══════════════════════════════════════════════════════════════╗
║  SHADE TAIL - THE PREDATOR                                     ║
║  "Every attack is an invitation to die."                       ║
╠═══════════════════════════════════════════════════════════════╣
║  ELEMENT: Shadow      COLOR: #BF5AF2        GOD: Myrr'Kai      ║
╚═══════════════════════════════════════════════════════════════╝

PASSIVE: Myrr'Kai's Veil
┌─────────────────────────────────────────────────────────────┐
│  +25% counter damage                                         │
│  Dodge i-frames extended +3 frames                           │
│  Successful counters restore 0.1 meter                       │
└─────────────────────────────────────────────────────────────┘

ACTION: Ghost Reversal
┌─────────────────────────────────────────────────────────────┐
│  Startup: 1 frame      Active: 15 frames   Recovery: 25 frm │
│  Damage: Reflect       Counter Window: Active frames         │
│  Meter Cost: 0.20      Cooldown: 60 frames                   │
│                                                              │
│  DESCRIPTION:                                                │
│  Enter counter stance. If hit during active frames,          │
│  REFLECT the damage back at 150% and teleport behind enemy. │
│  If not hit, suffer full recovery.                           │
│                                                              │
│  VISUAL:                                                     │
│  Purple shadow clone appears, real body phases out          │
│  On trigger: clone absorbs hit, real body appears behind    │
└─────────────────────────────────────────────────────────────┘

COMBAT MODIFIER:
┌─────────────────────────────────────────────────────────────┐
│  Attack Element: Shadow                                      │
│  On successful hit: brief afterimage left behind             │
│  Heavy attacks can phase through enemy (hit from behind)    │
│  Attacks against burning enemies deal +10% damage           │
└─────────────────────────────────────────────────────────────┘

ULTIMATE: Memory Eater (Tier 3+)
┌─────────────────────────────────────────────────────────────┐
│  Startup: 15 frames    Active: 30 frames   Recovery: 40 frm │
│  Damage: Variable      Meter Cost: 1.0 (full bar)           │
│                                                              │
│  DESCRIPTION:                                                │
│  Consume all status effects and buffs from target enemy.    │
│  Convert consumed effects into raw damage. Removes enemy    │
│  adaptation progress against you.                           │
│                                                              │
│  VISUAL:                                                     │
│  Shadow tendrils extend → wrap enemy → drain colored energy │
└─────────────────────────────────────────────────────────────┘
```

### 4.4 VOLT TAIL (Lightning) — Index 3

```
╔═══════════════════════════════════════════════════════════════╗
║  VOLT TAIL - THE SPEEDSTER                                     ║
║  "React faster than thought."                                  ║
╠═══════════════════════════════════════════════════════════════╣
║  ELEMENT: Lightning   COLOR: #FFD60A        GOD: Kar-Voth      ║
╚═══════════════════════════════════════════════════════════════╝

PASSIVE: Static Field
┌─────────────────────────────────────────────────────────────┐
│  +10% attack speed (reduced startup by 1 frame on lights)   │
│  Attacks apply STUN (brief hitstun extension)               │
│  Chance: 15%                                                 │
│  Perfect blocks create lightning spark (damage nearby)      │
└─────────────────────────────────────────────────────────────┘

ACTION: Snap Bind
┌─────────────────────────────────────────────────────────────┐
│  Startup: 5 frames     Active: 4 frames    Recovery: 15 frm │
│  Damage: 12            Stun Duration: 24 frames              │
│  Range: Long (projectile tether)  Meter Cost: 0.30           │
│  Cooldown: 90 frames                                         │
│                                                              │
│  DESCRIPTION:                                                │
│  Fire a lightning tether. On hit, BINDS enemy in place for  │
│  24 frames (can't move, can't attack, CAN block).           │
│  Guaranteed follow-up window.                                │
│                                                              │
│  VISUAL:                                                     │
│  Yellow bolt fires → connects → electricity arcs on enemy   │
└─────────────────────────────────────────────────────────────┘

COMBAT MODIFIER:
┌─────────────────────────────────────────────────────────────┐
│  Attack Element: Lightning                                   │
│  Light attack chains +1 hit (4-hit string instead of 3)     │
│  Each hit in chain has small chance to chain lightning      │
│  Attacks leave brief afterimage (speed visual)              │
└─────────────────────────────────────────────────────────────┘

ULTIMATE: Kar-Voth's Judgment (Tier 3+)
┌─────────────────────────────────────────────────────────────┐
│  Startup: 25 frames    Active: 5 frames    Recovery: 50 frm │
│  Damage: 100           Meter Cost: 1.0 (full bar)           │
│                                                              │
│  DESCRIPTION:                                                │
│  Call down a massive lightning pillar on target location.   │
│  UNBLOCKABLE. Leaves shocked ground that damages enemies    │
│  standing on it for 3 seconds.                              │
│                                                              │
│  VISUAL:                                                     │
│  Sky darkens → targeting circle → massive bolt from above   │
└─────────────────────────────────────────────────────────────┘
```

### 4.5 STONE TAIL (Earth) — Index 4

```
╔═══════════════════════════════════════════════════════════════╗
║  STONE TAIL - THE IMMOVABLE                                    ║
║  "They will break against you."                                ║
╠═══════════════════════════════════════════════════════════════╣
║  ELEMENT: Earth       COLOR: #8B8B8B        GOD: Thryxen       ║
╚═══════════════════════════════════════════════════════════════╝

PASSIVE: Bedrock Stance
┌─────────────────────────────────────────────────────────────┐
│  +30% defense (reduced damage taken)                         │
│  CANNOT BE LAUNCHED (immune to juggle starters)             │
│  Knockback reduced by 50%                                    │
│  Movement speed -15%                                         │
└─────────────────────────────────────────────────────────────┘

ACTION: Quake Hook
┌─────────────────────────────────────────────────────────────┐
│  Startup: 15 frames    Active: 8 frames    Recovery: 25 frm │
│  Damage: 18            GUARD BREAK: Yes                      │
│  Range: Short          Meter Cost: 0.35                      │
│  Cooldown: 120 frames                                        │
│                                                              │
│  DESCRIPTION:                                                │
│  Slam tail into ground, creating shockwave that BREAKS      │
│  enemy block. Unblockable, but slow startup is punishable.  │
│  Pulls nearby enemies toward you.                           │
│                                                              │
│  VISUAL:                                                     │
│  Tail slams down → earth cracks outward → rocks rise        │
└─────────────────────────────────────────────────────────────┘

COMBAT MODIFIER:
┌─────────────────────────────────────────────────────────────┐
│  Attack Element: Earth                                       │
│  Heavy attacks gain SUPER ARMOR (can't be interrupted)      │
│  Attacks cause screen shake on hit                           │
│  Blocking while Stone: no chip damage                        │
└─────────────────────────────────────────────────────────────┘

ULTIMATE: Thryxen's Fortress (Tier 3+)
┌─────────────────────────────────────────────────────────────┐
│  Startup: 20 frames    Active: 300 frames  Recovery: 30 frm │
│  Damage: 0 (defensive) Meter Cost: 1.0 (full bar)           │
│                                                              │
│  DESCRIPTION:                                                │
│  Encase self in stone armor. For 5 seconds:                 │
│  - 80% damage reduction                                      │
│  - Reflect 50% damage back to attackers                      │
│  - Cannot use abilities                                      │
│                                                              │
│  VISUAL:                                                     │
│  Stone encases Kai-Jax → glowing cracks → pulses on reflect │
└─────────────────────────────────────────────────────────────┘
```

### 4.6 TIDE TAIL (Water) — Index 5

```
╔═══════════════════════════════════════════════════════════════╗
║  TIDE TAIL - THE SUSTAINER                                     ║
║  "Outlast them. Wear them down."                               ║
╠═══════════════════════════════════════════════════════════════╣
║  ELEMENT: Water       COLOR: #007AFF        GOD: Memory Grove  ║
╚═══════════════════════════════════════════════════════════════╝

PASSIVE: Flowing Recovery
┌─────────────────────────────────────────────────────────────┐
│  Regenerate 1% HP per second (slow but constant)            │
│  Cleanse DOT effects (burn, poison) 50% faster              │
│  Meter gain +10%                                             │
└─────────────────────────────────────────────────────────────┘

ACTION: Undertow Loop
┌─────────────────────────────────────────────────────────────┐
│  Startup: 10 frames    Active: 20 frames   Recovery: 15 frm │
│  Damage: 15            Knockback: Pull (toward self)         │
│  Range: Medium-Long    Meter Cost: 0.25                      │
│  Cooldown: 60 frames                                         │
│                                                              │
│  DESCRIPTION:                                                │
│  Create a water wave that travels outward. Enemies hit are  │
│  PULLED toward you. Good for closing distance or combos.    │
│  Heals 5 HP if it hits.                                      │
│                                                              │
│  VISUAL:                                                     │
│  Blue wave ripples outward → wraps around enemy → pulls     │
└─────────────────────────────────────────────────────────────┘

COMBAT MODIFIER:
┌─────────────────────────────────────────────────────────────┐
│  Attack Element: Water                                       │
│  Attacks heal 1 HP on hit (lifesteal)                       │
│  Combos that land 5+ hits restore 0.1 meter                 │
│  Attacks leave water splash effects                          │
└─────────────────────────────────────────────────────────────┘

ULTIMATE: Tsunami's Embrace (Tier 3+)
┌─────────────────────────────────────────────────────────────┐
│  Startup: 25 frames    Active: 30 frames   Recovery: 40 frm │
│  Damage: 40            Heal: Full HP restore                 │
│  Meter Cost: 1.0 (full bar)                                  │
│                                                              │
│  DESCRIPTION:                                                │
│  Create a massive tidal wave. Damages all enemies in arena, │
│  and fully restores your HP. High risk (long startup) but   │
│  can turn a losing fight around.                            │
│                                                              │
│  VISUAL:                                                     │
│  Water rises around Kai-Jax → crashes outward → healing glow│
└─────────────────────────────────────────────────────────────┘
```

### 4.7 THORN TAIL (Nature) — Index 6

```
╔═══════════════════════════════════════════════════════════════╗
║  THORN TAIL - THE TRAPPER                                      ║
║  "Control the space. Control the fight."                       ║
╠═══════════════════════════════════════════════════════════════╣
║  ELEMENT: Nature      COLOR: #30D158        GOD: Fangforge     ║
╚═══════════════════════════════════════════════════════════════╝

PASSIVE: Overgrowth
┌─────────────────────────────────────────────────────────────┐
│  Traps last 50% longer                                       │
│  Attacks apply POISON (2 damage/sec for 4 sec)              │
│  Chance: 20%                                                 │
│  Standing still for 2s creates a small thorn patch          │
└─────────────────────────────────────────────────────────────┘

ACTION: Briar Net
┌─────────────────────────────────────────────────────────────┐
│  Startup: 20 frames    Active: 180 frames  Recovery: 20 frm │
│  Damage: 8 (on trigger) ROOT Duration: 36 frames            │
│  Range: Placed trap    Meter Cost: 0.20                      │
│  Cooldown: 90 frames   Max Active: 2 traps                   │
│                                                              │
│  DESCRIPTION:                                                │
│  Plant a thorn trap on the ground. When enemy steps on it,  │
│  vines ROOT them in place for 36 frames. They CAN attack    │
│  but CANNOT move. Trap lasts 3 seconds if not triggered.    │
│                                                              │
│  VISUAL:                                                     │
│  Small thorns sprout from ground → enemy triggers →         │
│  vines wrap legs                                             │
└─────────────────────────────────────────────────────────────┘

COMBAT MODIFIER:
┌─────────────────────────────────────────────────────────────┐
│  Attack Element: Nature                                      │
│  Attacks have extended range (+10% reach)                   │
│  Heavy attacks create brief thorn patch on ground           │
│  Rooted enemies take +15% damage                            │
└─────────────────────────────────────────────────────────────┘

ULTIMATE: Fangforge Bloom (Tier 3+)
┌─────────────────────────────────────────────────────────────┐
│  Startup: 30 frames    Active: 60 frames   Recovery: 40 frm │
│  Damage: 50 total      Area: Full arena                      │
│  Meter Cost: 1.0 (full bar)                                  │
│                                                              │
│  DESCRIPTION:                                                │
│  Thorns erupt across the entire arena floor. Enemies take   │
│  damage and are ROOTED wherever they stand. Safe zones      │
│  exist but are small and random.                            │
│                                                              │
│  VISUAL:                                                     │
│  Ground cracks → thorns burst up everywhere → enemies stuck │
└─────────────────────────────────────────────────────────────┘
```

### 4.8 PRISM TAIL (Light) — Index 7

```
╔═══════════════════════════════════════════════════════════════╗
║  PRISM TAIL - THE DEFLECTOR                                    ║
║  "Their strength is your weapon."                              ║
╠═══════════════════════════════════════════════════════════════╣
║  ELEMENT: Light       COLOR: #FFFFFF        GOD: Alignment     ║
╚═══════════════════════════════════════════════════════════════╝

PASSIVE: Radiant Guard
┌─────────────────────────────────────────────────────────────┐
│  Perfect blocks REFLECT 25% damage back                      │
│  Perfect block window extended +2 frames                     │
│  Blocking attacks generates 0.05 meter                       │
└─────────────────────────────────────────────────────────────┘

ACTION: Mirror Cut
┌─────────────────────────────────────────────────────────────┐
│  Startup: 3 frames     Active: 8 frames    Recovery: 30 frm │
│  Damage: 0 (reflect)   Reflect Multiplier: 200%              │
│  Range: Melee          Meter Cost: 0.15                      │
│  Cooldown: 45 frames                                         │
│                                                              │
│  DESCRIPTION:                                                │
│  Perfect parry. If hit during active frames, NEGATE the     │
│  damage and return it at 200%. Works on projectiles (sends  │
│  them back). High risk if timed wrong.                       │
│                                                              │
│  VISUAL:                                                     │
│  Light shield appears → enemy attack hits → flashes →       │
│  light beam fires back                                       │
└─────────────────────────────────────────────────────────────┘

COMBAT MODIFIER:
┌─────────────────────────────────────────────────────────────┐
│  Attack Element: Light                                       │
│  Attacks apply BLIND (enemy accuracy -30% for 2 sec)        │
│  Chance: 10%                                                 │
│  Critical hits guaranteed on blinded enemies                 │
│  Attacks emit bright flash on impact                         │
└─────────────────────────────────────────────────────────────┘

ULTIMATE: Corona Burst (Tier 3+)
┌─────────────────────────────────────────────────────────────┐
│  Startup: 20 frames    Active: 15 frames   Recovery: 35 frm │
│  Damage: 60            Effect: Full BLIND + Invincibility    │
│  Meter Cost: 1.0 (full bar)                                  │
│                                                              │
│  DESCRIPTION:                                                │
│  Emit a blinding light explosion. All enemies are BLINDED   │
│  for 5 seconds. You are INVINCIBLE during active frames.    │
│  Perfect for emergency escapes or punish setup.             │
│                                                              │
│  VISUAL:                                                     │
│  Kai-Jax glows white → screen goes white → enemies stagger  │
└─────────────────────────────────────────────────────────────┘
```

### 4.9 VOID TAIL (Memory) — Index 8

```
╔═══════════════════════════════════════════════════════════════╗
║  VOID TAIL - THE ARCHITECT                                     ║
║  "Reality is a suggestion."                                    ║
╠═══════════════════════════════════════════════════════════════╣
║  ELEMENT: Memory/Void COLOR: #2E2EFE        GOD: The Crown     ║
╚═══════════════════════════════════════════════════════════════╝

PASSIVE: Crown of Memory
┌─────────────────────────────────────────────────────────────┐
│  ALL meters charge 25% faster                                │
│  Synergy meter decays 50% slower                             │
│  Can see enemy "intent" (brief telegraph highlight)          │
└─────────────────────────────────────────────────────────────┘

ACTION: Architect's Denial
┌─────────────────────────────────────────────────────────────┐
│  Startup: 30 frames    Active: 1 frame     Recovery: 60 frm │
│  Damage: 0             Effect: CANCEL enemy action           │
│  Range: Visual range   Meter Cost: 0.50                      │
│  Cooldown: 300 frames (5 seconds)                            │
│                                                              │
│  DESCRIPTION:                                                │
│  The most powerful utility in the game. Completely CANCELS  │
│  any ONE enemy action mid-execution. Resets enemy to idle.  │
│  Extremely long cooldown. Use wisely.                        │
│                                                              │
│  VISUAL:                                                     │
│  Reality "glitches" → enemy freezes → rewinds briefly →     │
│  returns to idle pose                                        │
└─────────────────────────────────────────────────────────────┘

COMBAT MODIFIER:
┌─────────────────────────────────────────────────────────────┐
│  Attack Element: Void                                        │
│  Attacks PHASE through blocks (5% of block damage ignored)  │
│  Enemies hit have adaptation progress slowed                 │
│  Attacks leave reality distortion visual                     │
└─────────────────────────────────────────────────────────────┘

ULTIMATE: The Ninth Truth (Tier 3+)
┌─────────────────────────────────────────────────────────────┐
│  Startup: 40 frames    Active: 60 frames   Recovery: 60 frm │
│  Damage: 150           Effect: TIME STOP                     │
│  Meter Cost: 1.0 (full bar)                                  │
│                                                              │
│  DESCRIPTION:                                                │
│  Stop time for all enemies for 1 second. During this,       │
│  your attacks are GUARANTEED HITS. All damage applies when  │
│  time resumes. The ultimate trump card.                      │
│                                                              │
│  VISUAL:                                                     │
│  Screen desaturates → enemies freeze → Kai-Jax moves freely │
│  → time resume flash → all damage hits at once              │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. ANIMATION INTEGRATION

### 5.1 Animation Reference Table

| Tail | Action Animation | Ultimate Animation | Duration |
|------|------------------|-------------------|----------|
| Ember | tail_ember_flare | tail_ember_ultimate | 34f / 95f |
| Gale | tail_gale_ridge | tail_gale_ultimate | 22f / 170f |
| Shade | tail_shade_counter | tail_shade_ultimate | 41f / 85f |
| Volt | tail_volt_bind | tail_volt_ultimate | 24f / 80f |
| Stone | tail_stone_quake | tail_stone_ultimate | 48f / 350f |
| Tide | tail_tide_wave | tail_tide_ultimate | 45f / 95f |
| Thorn | tail_thorn_trap | tail_thorn_ultimate | 220f / 130f |
| Prism | tail_prism_mirror | tail_prism_ultimate | 41f / 70f |
| Void | tail_void_denial | tail_void_ultimate | 91f / 160f |

### 5.2 Animation Layer Integration

```
ABILITY ANIMATION FLOW:

Layer 1 (Base): Holds current locomotion pose
Layer 2 (Combat): OVERRIDES with ability animation
Layer 3 (Tail): Active tail follows ability anim
Layer 4 (Face): Expression matches ability intensity

BLEND WEIGHTS DURING ABILITY:
  Locomotion: 0.0 (completely overridden)
  Combat Layer: 1.0 (full control)
  Tail Layer: Ability-specific (0.0-1.0)
  Facial Layer: 1.0 (expression active)
```

### 5.3 Animation Notify Integration

Each tail ability animation requires these notifies:

```
STANDARD ABILITY NOTIFIES:

Frame 0: AN_AbilityStart
  - Lock player input
  - Begin meter consumption
  
Frame [startup-1]: AN_PlaySFX (whoosh/charge)
  - Anticipation sound
  
Frame [startup]: AN_HitboxStart OR AN_EffectStart
  - Spawn hitbox OR begin effect
  
Frame [startup + active]: AN_HitboxEnd OR AN_EffectEnd
  - Destroy hitbox OR end effect
  
Frame [total - 1]: AN_AbilityEnd
  - Unlock player input
  - Start cooldown
```

---

## 6. VFX INTEGRATION

### 6.1 VFX Per Tail

| Tail | Idle Particles | Action VFX | Impact VFX | Trail VFX |
|------|----------------|------------|------------|-----------|
| Ember | Floating embers | Fire burst | Explosion | Flame trail |
| Gale | Wind wisps | Air slash | Wind scatter | Cyan streak |
| Shade | Void tendrils | Shadow burst | Ink splash | Purple trail |
| Volt | Electric arcs | Lightning bolt | Spark burst | Yellow streak |
| Stone | Floating pebbles | Shockwave | Rock shatter | Dust cloud |
| Tide | Water droplets | Wave ripple | Water splash | Blue flow |
| Thorn | Floating leaves | Vine burst | Thorn spray | Green trail |
| Prism | Light motes | Mirror flash | Prismatic scatter | Rainbow trail |
| Void | Space distortion | Reality warp | Glitch effect | Void trail |

### 6.2 VFX Spawn Points

```
VFX SPAWN SOCKETS:

TAIL TIP: "tail_[index]_tip"
  - Primary spawn for ability effects
  - Element particles originate here
  
TAIL BASE: "tail_root"
  - Switch transition burst
  - Passive ambient particles
  
CHARACTER CENTER: "vfx_center"
  - Ultimate ability effects
  - Full-body effects
  
WEAPON CONTACTS: "hand_r_vfx", "foot_l_vfx"
  - Combat modifier effects
  - Attack trails
```

### 6.3 VFX Performance Budget

| VFX Category | Max Particles | Lifetime | Draw Calls |
|--------------|---------------|----------|------------|
| Idle Ambient | 20 | 2.0s | 1 |
| Action Ability | 100 | 1.5s | 2 |
| Impact | 50 | 0.5s | 1 |
| Trail | 30 | 0.3s | 1 |
| Ultimate | 200 | 3.0s | 4 |

---

## 7. AUDIO INTEGRATION

### 7.1 Audio Per Tail

| Tail | Switch SFX | Ability SFX | Impact SFX | Ambient Loop |
|------|------------|-------------|------------|--------------|
| Ember | Fire ignite | Flame whoosh | Explosion | Crackling fire |
| Gale | Wind gust | Air slash | Wind scatter | Gentle breeze |
| Shade | Void whisper | Shadow surge | Dark splash | Low hum |
| Volt | Electric zap | Thunder crack | Spark burst | Static buzz |
| Stone | Rock grind | Earth rumble | Stone impact | Low rumble |
| Tide | Water splash | Wave rush | Water burst | Flowing water |
| Thorn | Leaf rustle | Vine snap | Thorn pierce | Forest ambience |
| Prism | Crystal chime | Light ring | Glass shatter | Soft hum |
| Void | Reality tear | Time warp | Glitch noise | Deep drone |

### 7.2 Audio Layers

```
AUDIO MIXING PRIORITIES:

1. ABILITY SFX (loudest, most important)
2. IMPACT SFX (player feedback)
3. SWITCH SFX (state change)
4. AMBIENT LOOP (background, quietest)

DUCKING RULES:
  - Ability playing: Duck ambient -6dB
  - Ultimate playing: Duck all other -12dB
  - Multiple abilities: Prioritize player > enemy
```

---

## 8. PROGRESSION SYSTEM

### 8.1 Unlock Timeline

```
TAIL UNLOCK PROGRESSION:

ACT 1: THE AWAKENING
├── Ember (Start) ─── Tutorial unlock
├── Gale (Mission 2) ─ After first chase sequence
└── Shade (Mission 4) ─ After Myrr'Kai vision

ACT 2: THE FANGFORGE  
├── Volt (Boss) ───── Defeat Storm Colossus
└── Stone (Story) ─── Complete Fangforge Trials

ACT 3: THE VEIL SCAR
├── Tide (Quest) ──── Help Selene's ritual
└── Thorn (Explore) ─ Find the Hidden Grove

ACT 4: THE MEMORY GROVE
└── Prism (Trial) ─── Complete Trial of Light

ACT 5: THE ABYSSAL ENGINE
└── Void (Alignment) ─ Achieve 9-Tail Harmony
```

### 8.2 Upgrade Tiers

```
TIER PROGRESSION (per tail):

┌──────────┬────────────────┬────────────────────────────────┐
│   TIER   │   FRAGMENTS    │          UNLOCKS               │
├──────────┼────────────────┼────────────────────────────────┤
│   BASE   │      0         │  Passive + Action              │
│  TIER 1  │     10         │  Enhanced passive (+50%)       │
│  TIER 2  │     25 + Trial │  Combat modifier               │
│  TIER 3  │     50 + Story │  Ultimate ability              │
│ MASTERY  │    100 + Trial │  Fusion combo unlock           │
└──────────┴────────────────┴────────────────────────────────┘

MEMORY FRAGMENTS:
  - Dropped by enemies (1-3 per kill)
  - Found in exploration (5-10 per secret)
  - Quest rewards (20-50)
  - Boss drops (30-100)
```

### 8.3 Upgrade Effects

```
TIER 1 ENHANCED PASSIVES:

Ember:    +15% damage → +22% damage
Gale:     +20% speed  → +30% speed
Shade:    +25% counter → +40% counter
Volt:     +10% attack speed → +15% attack speed
Stone:    +30% defense → +45% defense
Tide:     1% HP regen → 2% HP regen
Thorn:    +50% trap duration → +100% trap duration
Prism:    +2f block window → +4f block window
Void:     +25% meter gain → +40% meter gain

TIER 2 COMBAT MODIFIERS:
  (See Section 4 ability definitions)

TIER 3 ULTIMATE UNLOCK:
  (See Section 4 ultimate abilities)

MASTERY FUSION UNLOCK:
  (See Section 9 fusion system)
```

---

## 9. TAIL FUSION SYSTEM

### 9.1 Fusion Overview

At **Mastery tier**, players can combine two tail elements into a **Fusion Combo** — a powerful attack that uses the strengths of both tails.

```
FUSION REQUIREMENTS:
  - Both tails at Mastery tier
  - Full Synergy meter
  - Specific input sequence
  - 300 frame global cooldown after use
```

### 9.2 Fusion Combo Matrix

```
FUSION COMBINATIONS (18 total):

          │ GALE │SHADE │VOLT  │STONE │TIDE  │THORN │PRISM │VOID  │
──────────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┤
  EMBER   │ INFR │ECLIP │PLASM │MAGMA │STEAM │PYROT │SOLAR │CHAOS │
──────────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┤
  GALE    │  -   │PHAN  │STORM │DUNES │MIST  │POLLN │AURA  │ETHER │
──────────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┤
  SHADE   │  -   │  -   │UMBRA │CAVE  │ABYSS │BLIGHT│TWILT │NIHIL │
──────────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┤
  (etc.)

SELECTED FUSION DETAILS:

INFERNO STORM (Ember + Gale):
  Fire tornado that travels across arena
  Damage: 120 over 3 seconds
  Effect: Burn + Juggle

PLASMA SURGE (Ember + Volt):
  Supercharged lightning fire
  Damage: 100 instant
  Effect: Burn + Stun + Chain

ECLIPSE BIND (Shade + Volt):
  Shadow tendrils with electric charge
  Damage: 80
  Effect: Root + Stun + Drain

NIHIL CASCADE (Shade + Void):
  Reality-breaking shadow explosion
  Damage: 150
  Effect: Removes all enemy buffs + adaptations
```

### 9.3 Fusion Input System

```
FUSION INPUT SEQUENCE:

1. Have both required tails at Mastery
2. Have full Synergy meter (1.0)
3. Input: Tail Switch (to first tail) + Tail Ability + Tail Switch (to second tail)
   Within 12 frames
4. System detects fusion pair → Execute fusion combo
5. Meter consumed, global cooldown starts

VISUAL FEEDBACK:
  - During correct input: Both tails glow
  - On success: Dual-color burst
  - Animation: Unique per fusion
```

---

## 10. IMPLEMENTATION GUIDE

### 10.1 Unreal Engine 5 Implementation

```cpp
// TailComponent.h
UCLASS()
class UTailComponent : public UActorComponent
{
    GENERATED_BODY()
    
public:
    // Active tail management
    UPROPERTY(BlueprintReadOnly)
    int32 ActiveTailIndex = 0;
    
    UPROPERTY(EditDefaultsOnly)
    TArray<UTailDataAsset*> TailData;
    
    // Switching
    UFUNCTION(BlueprintCallable)
    void SwitchTail(int32 Direction); // -1 or +1
    
    UFUNCTION(BlueprintCallable)
    void SetActiveTail(int32 Index);
    
    // Ability execution
    UFUNCTION(BlueprintCallable)
    bool TryExecuteAbility();
    
    UFUNCTION(BlueprintCallable)
    bool TryExecuteUltimate();
    
private:
    float SwitchCooldownRemaining = 0.f;
    TMap<int32, float> AbilityCooldowns;
};

// TailDataAsset.h
UCLASS()
class UTailDataAsset : public UDataAsset
{
    GENERATED_BODY()
    
public:
    UPROPERTY(EditDefaultsOnly)
    FString TailID;
    
    UPROPERTY(EditDefaultsOnly)
    FLinearColor PrimaryColor;
    
    UPROPERTY(EditDefaultsOnly)
    UMaterialInstance* TailMaterial;
    
    UPROPERTY(EditDefaultsOnly)
    FPassiveData Passive;
    
    UPROPERTY(EditDefaultsOnly)
    FAbilityData ActionAbility;
    
    UPROPERTY(EditDefaultsOnly)
    FAbilityData UltimateAbility;
};
```

### 10.2 Unity Implementation

```csharp
// TailManager.cs
public class TailManager : MonoBehaviour
{
    [SerializeField] private TailDataSO[] tailData;
    [SerializeField] private int activeTailIndex = 0;
    
    private Dictionary<int, float> abilityCooldowns;
    private float switchCooldownRemaining;
    
    public TailDataSO ActiveTail => tailData[activeTailIndex];
    
    public void SwitchTail(int direction)
    {
        if (switchCooldownRemaining > 0) return;
        
        int newIndex = (activeTailIndex + direction + 9) % 9;
        if (!tailData[newIndex].isUnlocked) return;
        
        SetActiveTail(newIndex);
    }
    
    public void SetActiveTail(int index)
    {
        activeTailIndex = index;
        switchCooldownRemaining = 0.5f; // 30 frames at 60fps
        
        OnTailSwitched?.Invoke(ActiveTail);
    }
    
    public bool TryExecuteAbility()
    {
        var ability = ActiveTail.actionAbility;
        
        if (!CanUseAbility(activeTailIndex, ability))
            return false;
            
        ExecuteAbility(ability);
        return true;
    }
    
    public event System.Action<TailDataSO> OnTailSwitched;
}

// TailDataSO.cs
[CreateAssetMenu(fileName = "NewTail", menuName = "KaiJax/Tail Data")]
public class TailDataSO : ScriptableObject
{
    public string tailID;
    public string displayName;
    public int index;
    
    public Color primaryColor;
    public Color secondaryColor;
    public Material tailMaterial;
    
    public PassiveData passive;
    public AbilityData actionAbility;
    public AbilityData ultimateAbility;
    public CombatModifierData combatModifier;
    
    public bool isUnlocked;
    public int currentTier;
}
```

### 10.3 Data-Driven Configuration

```json
// tails.json - Example data configuration
{
  "tails": [
    {
      "id": "ember",
      "displayName": "Ember Tail",
      "index": 0,
      "element": "fire",
      "colors": {
        "primary": "#FF3B30",
        "secondary": "#FF6B35"
      },
      "passive": {
        "name": "Burning Presence",
        "damageMultiplier": 1.15,
        "onHitEffect": "burn",
        "onHitChance": 0.25
      },
      "action": {
        "name": "Flare Lash",
        "startupFrames": 8,
        "activeFrames": 6,
        "recoveryFrames": 20,
        "damage": 22,
        "meterCost": 0.25,
        "cooldownFrames": 30
      },
      "ultimate": {
        "name": "Pyraxis Wrath",
        "startupFrames": 30,
        "activeFrames": 20,
        "recoveryFrames": 45,
        "damage": 80,
        "meterCost": 1.0,
        "unlockedAtTier": 3
      }
    }
    // ... 8 more tail definitions
  ]
}
```

---

## APPENDIX A: QUICK REFERENCE TABLES

### Tail Ability Summary

| Tail | Type | Startup | Damage | Special |
|------|------|---------|--------|---------|
| Ember | Offensive | 8f | 22 | Burn |
| Gale | Utility | 2f | 0 | I-Frames |
| Shade | Counter | 1f | Reflect | Teleport |
| Volt | Control | 5f | 12 | Stun |
| Stone | Guard Break | 15f | 18 | Pull |
| Tide | Offensive | 10f | 15 | Heal |
| Thorn | Trap | 20f | 8 | Root |
| Prism | Parry | 3f | Reflect | Projectile |
| Void | Utility | 30f | 0 | Cancel |

### Passive Summary

| Tail | Primary Effect | Secondary Effect |
|------|----------------|------------------|
| Ember | +15% damage | Burn on hit |
| Gale | +20% speed | Double jump |
| Shade | +25% counter | Extended i-frames |
| Volt | +10% attack speed | Stun on hit |
| Stone | +30% defense | Anti-launch |
| Tide | HP regen | DOT cleanse |
| Thorn | Trap duration | Poison on hit |
| Prism | Reflect on block | Block window |
| Void | Meter gain | Enemy intent read |

---

**Document Version:** 1.0  
**Last Updated:** December 2025  
**Author:** Systems Design Team  
**Status:** Production Ready  

---

*"Nine paths. One destiny. Choose wisely."*

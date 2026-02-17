# KAI-JAX ENEMY AI BEHAVIOR TREE SPECIFICATION
## Production Bible v1.0

**Document Type:** AI Systems Design Specification  
**Target Engines:** Unreal Engine 5 / Unity  
**Last Updated:** December 2025  
**Status:** Production Ready

---

## TABLE OF CONTENTS

1. [AI Philosophy](#1-ai-philosophy)
2. [Core AI Architecture](#2-core-ai-architecture)
3. [Pattern Learning System](#3-pattern-learning-system)
4. [Behavior Tree Structure](#4-behavior-tree-structure)
5. [Enemy Type Specifications](#5-enemy-type-specifications)
6. [State Definitions](#6-state-definitions)
7. [Combat Decision System](#7-combat-decision-system)
8. [Adaptation Mechanics](#8-adaptation-mechanics)
9. [Implementation Guide](#9-implementation-guide)
10. [Tuning Parameters](#10-tuning-parameters)

---

## 1. AI PHILOSOPHY

### 1.1 The Design Principle

```
╔═══════════════════════════════════════════════════════════════╗
║                                                                ║
║    "DESIGN BEATS HABIT. MEMORY BEATS DESIGN."                  ║
║                                                                ║
║    Ulgorr's creations are NOT random.                          ║
║    They are DESIGNED to:                                       ║
║    1. OBSERVE player patterns                                  ║
║    2. LEARN from repeated behaviors                            ║
║    3. COUNTER predictable strategies                           ║
║                                                                ║
║    The player wins by being UNPREDICTABLE,                     ║
║    not by finding the "optimal rotation."                      ║
║                                                                ║
╚═══════════════════════════════════════════════════════════════╝
```

### 1.2 AI Behavior Goals

| Goal | Description | Player Experience |
|------|-------------|-------------------|
| **Challenge** | Push player to improve | "I need to get better" |
| **Fairness** | All attacks telegraphed | "I saw that coming" |
| **Adaptation** | Punish repetition | "They're reading me" |
| **Satisfaction** | Victories feel earned | "I outplayed them" |

### 1.3 What Makes This AI Different

```
TRADITIONAL AI:
  - Cycles through attack patterns
  - Difficulty = faster/stronger/more HP
  - Player finds "cheese" strategy → repeats forever
  - Eventually becomes boring

KAI-JAX ADAPTIVE AI:
  - Observes what player does repeatedly
  - Builds resistance to repeated strategies
  - Forces player to vary approach
  - Difficulty = how adaptive, not just stats
  - "Cheese" strategies become less effective over time
```

---

## 2. CORE AI ARCHITECTURE

### 2.1 System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    AI BRAIN ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐    ┌──────────────────┐               │
│  │   PERCEPTION     │───►│  PATTERN TRACKER │               │
│  │   SYSTEM         │    │  (Learning)      │               │
│  └────────┬─────────┘    └────────┬─────────┘               │
│           │                       │                          │
│           ▼                       ▼                          │
│  ┌──────────────────────────────────────────┐               │
│  │            BLACKBOARD                      │               │
│  │  (Shared data for all systems)            │               │
│  │  - Player position, state, patterns        │               │
│  │  - Own state, health, cooldowns           │               │
│  │  - Tactical evaluations                    │               │
│  └──────────────────┬───────────────────────┘               │
│                     │                                        │
│                     ▼                                        │
│  ┌──────────────────────────────────────────┐               │
│  │          BEHAVIOR TREE                     │               │
│  │  (Decision making & action selection)      │               │
│  └──────────────────┬───────────────────────┘               │
│                     │                                        │
│                     ▼                                        │
│  ┌──────────────────────────────────────────┐               │
│  │          ACTION EXECUTOR                   │               │
│  │  (Animation, hitbox, movement)            │               │
│  └──────────────────────────────────────────┘               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Blackboard Data Structure

```
BLACKBOARD VARIABLES:

// Player Information
Vector3     PlayerPosition
Vector3     PlayerVelocity
float       PlayerDistance
float       PlayerFacing          // Angle relative to AI
PlayerState PlayerCurrentState    // Idle, Attacking, etc.
int         PlayerHealth
int         PlayerActiveTail

// Pattern Data (from Pattern Tracker)
string      PlayerMostUsedMove
float       PlayerPredictability  // 0.0-1.0
float       PlayerAverageReactionTime
Dictionary  PlayerMoveResistances // Move → Resistance value

// Self Information
Vector3     SelfPosition
AIState     SelfCurrentState
int         SelfHealth
float       SelfAggressionLevel   // 0.0-1.0
bool        HasOpeningDetected
string      SelectedAttack

// Tactical
float       PreferredDistance
bool        IsInAttackRange
bool        IsPlayerAttacking
bool        CanBlockCurrentAttack
float       TimeSinceLastAttack
int         FramesSinceAdapt
```

### 2.3 Update Loop

```
AI UPDATE LOOP (Every Frame):

1. PERCEPTION UPDATE
   - Raycast/overlap for player detection
   - Update player position, velocity, state
   - Calculate distances and angles

2. PATTERN TRACKER UPDATE
   - If player performed action, log it
   - Update move frequencies
   - Calculate predictability score
   - Update resistance values

3. BLACKBOARD UPDATE
   - Write all perception data
   - Write pattern analysis results
   - Evaluate tactical situation

4. BEHAVIOR TREE TICK
   - Traverse tree from root
   - Execute first successful branch
   - Return action to execute

5. ACTION EXECUTION
   - Play animation
   - Spawn hitboxes
   - Apply movement
   - Update state
```

---

## 3. PATTERN LEARNING SYSTEM

### 3.1 Data Collection

```
PATTERN TRACKER DATA STRUCTURES:

MoveFrequency: Dictionary<string, int>
  - Key: Move identifier ("light_1", "heavy_2", "ember_flare", etc.)
  - Value: Times used
  
TimingHistory: Queue<float> (max 20 entries)
  - Stores time gaps between player attacks
  - Used to predict attack rhythm
  
PositionHistory: Queue<Vector2> (max 30 entries)
  - Relative position when player attacks
  - Identifies preferred engagement range
  
ResponsePatterns: Dictionary<string, Dictionary<string, int>>
  - Key: AI action
  - Value: Dictionary of player responses and their counts
  - Example: {"ai_heavy_attack": {"player_dodge": 15, "player_block": 8}}

MoveResistances: Dictionary<string, float>
  - Key: Move identifier
  - Value: Resistance level (0.0-0.5)
```

### 3.2 Pattern Analysis Logic

```python
# Pseudocode: Pattern Analysis (runs every 120 frames / 2 seconds)

def analyze_patterns():
    
    # 1. Calculate most used move
    total_moves = sum(move_frequency.values())
    if total_moves < 5:
        return  # Not enough data
    
    most_used = max(move_frequency, key=move_frequency.get)
    most_used_count = move_frequency[most_used]
    
    # 2. Calculate predictability
    predictability = most_used_count / total_moves
    blackboard.set("PlayerPredictability", predictability)
    blackboard.set("PlayerMostUsedMove", most_used)
    
    # 3. If predictability > threshold, flag for adaptation
    if predictability > 0.35:  # 35% one move = predictable
        blackboard.set("ShouldAdapt", True)
        blackboard.set("AdaptTarget", most_used)
    
    # 4. Analyze timing patterns
    if len(timing_history) >= 5:
        avg_timing = mean(timing_history)
        timing_variance = variance(timing_history)
        
        if timing_variance < 0.1:  # Very consistent timing
            blackboard.set("PlayerTimingPredictable", True)
            blackboard.set("PredictedNextAttackTime", avg_timing)
    
    # 5. Analyze position preference
    if len(position_history) >= 10:
        avg_distance = mean([p.magnitude for p in position_history])
        blackboard.set("PlayerPreferredRange", avg_distance)
```

### 3.3 Resistance System

```python
# Pseudocode: Resistance Buildup

def on_hit_received(move_id):
    # Increase resistance when hit by a move
    current = move_resistances.get(move_id, 0.0)
    move_resistances[move_id] = min(current + 0.10, 0.50)  # Max 50%

def on_block_success(move_id):
    # Slight increase when successfully blocking
    current = move_resistances.get(move_id, 0.0)
    move_resistances[move_id] = min(current + 0.05, 0.50)

def decay_resistances(delta_time):
    # Resistance decays if move not seen
    for move_id in move_resistances:
        if frames_since_seen[move_id] > 300:  # 5 seconds
            move_resistances[move_id] = max(0, move_resistances[move_id] - 0.02)

# How resistance affects AI behavior:
def get_block_probability(move_id):
    base_block_prob = 0.4  # 40% base
    resistance = move_resistances.get(move_id, 0.0)
    return base_block_prob + resistance  # Up to 90% for heavily resisted moves

def get_reaction_time(move_id):
    base_reaction = 12  # frames
    resistance = move_resistances.get(move_id, 0.0)
    reduction = int(resistance * 8)  # Up to 4 frames faster
    return base_reaction - reduction
```

---

## 4. BEHAVIOR TREE STRUCTURE

### 4.1 Master Behavior Tree

```
ROOT (Selector)
│
├── [PRIORITY 1] Emergency Behaviors (Selector)
│   │
│   ├── Death Check (Sequence)
│   │   ├── Decorator: Health <= 0
│   │   └── Task: Play Death Animation
│   │
│   └── Desperation Attack (Sequence)
│       ├── Decorator: Health < 15%
│       ├── Decorator: Random(0.3)  // 30% chance
│       └── Task: Execute Desperation Attack
│
├── [PRIORITY 2] Defend Against Attacks (Sequence)
│   │
│   ├── Decorator: Player Is Attacking
│   ├── Decorator: In Attack Range
│   │
│   └── Defense Selector
│       │
│       ├── Counter Attack (Sequence)
│       │   ├── Decorator: Resistance[incoming_attack] > 0.4
│       │   ├── Decorator: Can Counter
│       │   └── Task: Execute Counter
│       │
│       ├── Block (Sequence)
│       │   ├── Decorator: Random(GetBlockProbability)
│       │   └── Task: Hold Block
│       │
│       └── Evade (Task)
│           └── Execute Backdash
│
├── [PRIORITY 3] Commit to Attack (Sequence)
│   │
│   ├── Decorator: Opening Detected
│   ├── Decorator: In Attack Range
│   │
│   └── Attack Selector
│       │
│       ├── Punish Recovery (Sequence)
│       │   ├── Decorator: Player In Recovery
│       │   └── Task: Execute Fast Attack
│       │
│       ├── Punish Whiff (Sequence)
│       │   ├── Decorator: Player Just Whiffed
│       │   └── Task: Execute Medium Attack
│       │
│       └── Standard Attack (Task)
│           └── Execute Best Available Attack
│
├── [PRIORITY 4] Apply Pressure (Sequence)
│   │
│   ├── Decorator: In Engagement Range (not attack, but close)
│   │
│   └── Pressure Parallel
│       │
│       ├── Task: Maintain Preferred Distance
│       │
│       ├── Service: Continue Pattern Logging
│       │
│       └── Pressure Actions (Selector)
│           │
│           ├── Feint (Sequence)
│           │   ├── Decorator: Random(0.2)
│           │   └── Task: Play Feint Animation
│           │
│           ├── Probe (Sequence)
│           │   ├── Decorator: Frames Since Attack > 120
│           │   └── Task: Execute Probe Attack
│           │
│           └── Wait (Task)
│               └── Hold Position (Observe)
│
├── [PRIORITY 5] Approach Player (Sequence)
│   │
│   ├── Decorator: NOT In Engagement Range
│   │
│   └── Approach Actions (Selector)
│       │
│       ├── Dash In (Sequence)
│       │   ├── Decorator: Distance > 8 units
│       │   ├── Decorator: Random(0.3)
│       │   └── Task: Dash Toward Player
│       │
│       └── Walk In (Task)
│           └── Move Toward Player
│
├── [PRIORITY 6] Adapt Behavior (Sequence)
│   │
│   ├── Decorator: Should Adapt Flag Set
│   ├── Decorator: Frames Since Adapt > 300
│   │
│   └── Adaptation Tasks
│       │
│       ├── Task: Analyze Patterns
│       ├── Task: Update Resistances
│       ├── Task: Adjust Aggression
│       └── Task: Select Counter Strategy
│
└── [PRIORITY 7] Default Observe (Sequence)
    │
    └── Observe Parallel
        │
        ├── Task: Idle Animation
        ├── Service: Log Player Patterns
        └── Service: Update Blackboard
```

### 4.2 Node Type Definitions

```
NODE TYPES:

SELECTOR (OR logic):
  - Tries children left to right
  - Returns SUCCESS on first successful child
  - Returns FAILURE if all children fail

SEQUENCE (AND logic):
  - Executes children left to right
  - Returns FAILURE on first failed child
  - Returns SUCCESS if all children succeed

PARALLEL:
  - Executes all children simultaneously
  - Can configure success/failure policy

DECORATOR:
  - Wraps a child node
  - Controls whether child can execute
  - Examples: Health check, Random chance, Cooldown

TASK (Leaf):
  - Actual action execution
  - Returns RUNNING while executing
  - Returns SUCCESS/FAILURE when complete

SERVICE:
  - Background task that runs while parent is active
  - Doesn't affect tree traversal
  - Used for continuous updates (pattern logging)
```

### 4.3 Key Decorators

```
DECORATOR IMPLEMENTATIONS:

[Health Check]
  Parameter: threshold (float)
  Logic: Return self.health / self.max_health <= threshold

[Random Chance]
  Parameter: probability (float 0-1)
  Logic: Return random() < probability

[Player Is Attacking]
  Logic: Return blackboard.PlayerCurrentState in [ATTACKING, STARTUP]

[In Attack Range]
  Parameter: range (float, default from enemy data)
  Logic: Return blackboard.PlayerDistance <= range

[In Engagement Range]
  Parameter: range (float, typically 1.5x attack range)
  Logic: Return blackboard.PlayerDistance <= range

[Opening Detected]
  Logic: Return blackboard.HasOpeningDetected

[Resistance Check]
  Parameter: threshold (float)
  Logic: 
    incoming = blackboard.PlayerCurrentAttack
    resistance = blackboard.PlayerMoveResistances[incoming]
    Return resistance >= threshold

[Cooldown]
  Parameter: frames (int)
  Logic: Return frames_since_last_use >= frames

[Frames Since]
  Parameter: event (string), frames (int)
  Logic: Return current_frame - last_event_frame[event] >= frames
```

---

## 5. ENEMY TYPE SPECIFICATIONS

### 5.1 Iterator (Standard Enemy)

```
╔═══════════════════════════════════════════════════════════════╗
║  ITERATOR - THE LEARNER                                        ║
║  "The baseline. Dangerous in numbers."                         ║
╠═══════════════════════════════════════════════════════════════╣
║  ROLE: Standard combat enemy, teaches pattern variation        ║
╚═══════════════════════════════════════════════════════════════╝

STATS:
┌────────────────────────────────────────────────┐
│  Health:           100                          │
│  Damage (Light):   8                           │
│  Damage (Heavy):   18                          │
│  Move Speed:       4.0 units/sec               │
│  Attack Range:     2.0 units                   │
│  Engagement Range: 4.0 units                   │
└────────────────────────────────────────────────┘

ADAPTATION PARAMETERS:
┌────────────────────────────────────────────────┐
│  Resistance Gain:     0.10 per hit received    │
│  Resistance Decay:    0.02 per 5 seconds       │
│  Max Resistance:      0.50 (50%)               │
│  Adaptation Interval: 120 frames (2 sec)       │
│  Aggression Range:    0.4 - 0.7                │
└────────────────────────────────────────────────┘

BEHAVIOR MODIFIERS:
┌────────────────────────────────────────────────┐
│  Base Block Probability:    40%                │
│  Counter Probability:       20%                │
│  Feint Probability:         15%                │
│  Dash-In Probability:       25%                │
└────────────────────────────────────────────────┘

ATTACK POOL:
  - Light Attack: 6f startup, 8 damage
  - Heavy Attack: 12f startup, 18 damage
  - Dash Attack: 8f startup, 12 damage
  - Probe Attack: 4f startup, 5 damage (fast, low commitment)

VISUAL IDENTITY:
  - Red/black color scheme
  - Geometric patterns on body
  - Circuit-like glowing lines (red)
  - Humanoid but clearly synthetic
```

### 5.2 Null Stalker (Assassin Enemy)

```
╔═══════════════════════════════════════════════════════════════╗
║  NULL STALKER - THE AMBUSHER                                   ║
║  "Punishes panic. Rewards patience."                           ║
╠═══════════════════════════════════════════════════════════════╣
║  ROLE: Teaches calm under pressure, punishes spam              ║
╚═══════════════════════════════════════════════════════════════╝

STATS:
┌────────────────────────────────────────────────┐
│  Health:           60                           │
│  Damage (Light):   12                          │
│  Damage (Heavy):   28                          │
│  Move Speed:       6.0 units/sec               │
│  Attack Range:     2.5 units                   │
│  Engagement Range: 6.0 units                   │
└────────────────────────────────────────────────┘

ADAPTATION PARAMETERS:
┌────────────────────────────────────────────────┐
│  Resistance Gain:     0.05 per hit             │
│  Resistance Decay:    0.01 per 5 seconds       │
│  Max Resistance:      0.40                      │
│  Adaptation Interval: 180 frames (3 sec)       │
│  Aggression Range:    0.2 - 0.4 (LOW)          │
└────────────────────────────────────────────────┘

BEHAVIOR MODIFIERS:
┌────────────────────────────────────────────────┐
│  Base Block Probability:    25%                │
│  Counter Probability:       40% (HIGH)         │
│  Evade Probability:         50%                │
│  Ambush Attack Probability: 35%                │
└────────────────────────────────────────────────┘

UNIQUE BEHAVIORS:
  - FADE: Can become semi-invisible (50% opacity)
  - AMBUSH: When faded + player attacks, guaranteed counter
  - HIT-AND-RUN: After landing hit, immediately retreats
  - PATIENT: Waits for player to overcommit

ATTACK POOL:
  - Fade Strike: 4f startup, 15 damage (from fade state)
  - Heavy Ambush: 8f startup, 28 damage (punish counter)
  - Retreat Slash: 6f startup, 10 damage + creates distance

VISUAL IDENTITY:
  - Purple/void color scheme
  - Smoke/mist trail
  - Partially translucent body
  - Glowing purple eyes
```

### 5.3 Bastion (Tank Enemy)

```
╔═══════════════════════════════════════════════════════════════╗
║  BASTION - THE WALL                                            ║
║  "You can't rush through. You must BREAK through."             ║
╠═══════════════════════════════════════════════════════════════╣
║  ROLE: Teaches patience, guard breaks, and timing              ║
╚═══════════════════════════════════════════════════════════════╝

STATS:
┌────────────────────────────────────────────────┐
│  Health:           250                          │
│  Damage (Light):   10                          │
│  Damage (Heavy):   25                          │
│  Move Speed:       2.5 units/sec (SLOW)        │
│  Attack Range:     2.5 units                   │
│  Engagement Range: 3.5 units                   │
└────────────────────────────────────────────────┘

ADAPTATION PARAMETERS:
┌────────────────────────────────────────────────┐
│  Resistance Gain:     0.03 per hit (SLOW)      │
│  Resistance Decay:    0.005 per 5 seconds      │
│  Max Resistance:      0.30 (lower max)         │
│  Adaptation Interval: 240 frames (4 sec)       │
│  Aggression Range:    0.3 - 0.5                │
└────────────────────────────────────────────────┘

BEHAVIOR MODIFIERS:
┌────────────────────────────────────────────────┐
│  Base Block Probability:    70% (HIGH)         │
│  Counter Probability:       10%                │
│  Super Armor Threshold:     20 damage          │
│  Guard Recovery:            8 frames           │
└────────────────────────────────────────────────┘

UNIQUE BEHAVIORS:
  - SUPER ARMOR: Heavy attacks can't be interrupted
  - FORTRESS STANCE: Can enter unbreakable block (no chip)
  - SEISMIC SLAM: Ground pound that has large AOE
  - SLOW TURN: 50% slower rotation, can be flanked

ATTACK POOL:
  - Heavy Swing: 15f startup, 25 damage, super armor
  - Shield Bash: 10f startup, 15 damage, guard break
  - Seismic Slam: 25f startup, 35 damage, AOE

VISUAL IDENTITY:
  - Gray/brown armor plating
  - Massive, lumbering frame
  - Visible damage states (cracked armor)
  - Small glowing weak points
```

### 5.4 Phase Weaver (Teleporter Enemy)

```
╔═══════════════════════════════════════════════════════════════╗
║  PHASE WEAVER - THE TRICKSTER                                  ║
║  "Trust your timing, not your eyes."                           ║
╠═══════════════════════════════════════════════════════════════╣
║  ROLE: Teaches audio cue reliance, pattern-based timing        ║
╚═══════════════════════════════════════════════════════════════╝

STATS:
┌────────────────────────────────────────────────┐
│  Health:           80                           │
│  Damage (Light):   10                          │
│  Damage (Heavy):   20                          │
│  Move Speed:       5.0 units/sec               │
│  Attack Range:     2.0 units                   │
│  Teleport Range:   8.0 units                   │
└────────────────────────────────────────────────┘

ADAPTATION PARAMETERS:
┌────────────────────────────────────────────────┐
│  Resistance Gain:     0.15 per hit (FAST)      │
│  Resistance Decay:    0.03 per 5 seconds       │
│  Max Resistance:      0.50                      │
│  Adaptation Interval: 90 frames (1.5 sec)      │
│  Aggression Range:    0.5 - 0.8                │
└────────────────────────────────────────────────┘

BEHAVIOR MODIFIERS:
┌────────────────────────────────────────────────┐
│  Teleport Probability:      40%                │
│  Afterimage Probability:    30%                │
│  Flank Teleport:            60%                │
│  Audio Telegraph:           ALWAYS (required)  │
└────────────────────────────────────────────────┘

UNIQUE BEHAVIORS:
  - PHASE SHIFT: Teleport to new position (8 unit max)
  - AFTERIMAGE: Leave false copy, attack from elsewhere
  - FLANK: 60% of teleports go behind player
  - AUDIO CUE: Distinct sound 8 frames before attack

ATTACK POOL:
  - Phase Strike: 6f startup (after teleport), 15 damage
  - Multi-Phase: 3 rapid teleports + attack sequence
  - Afterimage Assault: Clone attacks, real attack from blind spot

VISUAL IDENTITY:
  - Cyan/white ghostly appearance
  - Constant afterimages
  - Screen-space blur effects
  - Multiple overlapping silhouettes

AUDIO CUES (CRITICAL):
  - Pre-teleport: "Vwoooom" 12 frames before
  - Post-teleport: "Crack" when arriving
  - Attack incoming: "Shing" 8 frames before hit
```

### 5.5 Crown Warden (Mini-Boss)

```
╔═══════════════════════════════════════════════════════════════╗
║  CROWN WARDEN - THE TEST                                       ║
║  "Everything you've learned. All at once."                     ║
╠═══════════════════════════════════════════════════════════════╣
║  ROLE: Mini-boss, combines all enemy behaviors                 ║
╚═══════════════════════════════════════════════════════════════╝

STATS:
┌────────────────────────────────────────────────┐
│  Health:           500                          │
│  Damage (Light):   15                          │
│  Damage (Heavy):   35                          │
│  Move Speed:       4.5 units/sec               │
│  Attack Range:     3.0 units                   │
│  Engagement Range: 6.0 units                   │
└────────────────────────────────────────────────┘

ADAPTATION PARAMETERS:
┌────────────────────────────────────────────────┐
│  Resistance Gain:     0.08 per hit             │
│  Resistance Decay:    0.01 per 5 seconds       │
│  Max Resistance:      0.60 (HIGHEST)           │
│  Adaptation Interval: 90 frames (fast)         │
│  Aggression Range:    0.3 - 0.9 (full range)   │
└────────────────────────────────────────────────┘

PHASE SYSTEM (Health-Based):
┌────────────────────────────────────────────────┐
│  Phase 1 (100-70% HP): Standard combat         │
│  Phase 2 (70-40% HP):  Adds teleports          │
│  Phase 3 (40-15% HP):  Adds super armor        │
│  Phase 4 (15-0% HP):   Desperation mode        │
└────────────────────────────────────────────────┘

UNIQUE BEHAVIORS:
  - MODE SHIFT: Changes fighting style per phase
  - ALL ABILITIES: Has access to all enemy type abilities
  - PUNISH MASTER: Very high counter rate when adapted
  - CROWN BLAST: Ultimate attack at phase transitions

ATTACK POOL (Phase-Dependent):
  Phase 1: Iterator moveset
  Phase 2: + Phase Weaver teleports
  Phase 3: + Bastion super armor
  Phase 4: + Null Stalker ambush patterns

VISUAL IDENTITY:
  - White/gold regal appearance
  - Glowing crown constantly
  - Phase transition = visual transformation
  - Increasingly aggressive appearance each phase
```

---

## 6. STATE DEFINITIONS

### 6.1 AI State Machine

```
                         ┌─────────────────┐
                         │                 │
           ┌─────────────│    OBSERVE      │─────────────┐
           │             │                 │             │
           │             └────────┬────────┘             │
           │                      │                      │
           │         Player in range / Timer             │
           │                      │                      │
           │                      ▼                      │
           │             ┌─────────────────┐             │
           │             │                 │             │
           │  ┌──────────│    APPROACH     │──────────┐  │
           │  │          │                 │          │  │
           │  │          └────────┬────────┘          │  │
           │  │                   │                   │  │
           │  │           In attack range             │  │
           │  │                   │                   │  │
           │  │                   ▼                   │  │
           │  │          ┌─────────────────┐          │  │
           │  │          │                 │          │  │
           │  │     ┌────│    PRESSURE     │────┐     │  │
           │  │     │    │                 │    │     │  │
           │  │     │    └────────┬────────┘    │     │  │
           │  │     │             │             │     │  │
           │  │  Opening    Player Attack   Timeout   │  │
           │  │     │             │             │     │  │
           │  │     ▼             ▼             │     │  │
           │  │ ┌────────┐  ┌──────────┐        │     │  │
           │  │ │ COMMIT │  │  DEFEND  │        │     │  │
           │  │ └───┬────┘  └────┬─────┘        │     │  │
           │  │     │            │              │     │  │
           │  │     └──────┬─────┘              │     │  │
           │  │            │                    │     │  │
           │  │            ▼                    │     │  │
           │  │     ┌─────────────────┐         │     │  │
           │  │     │                 │         │     │  │
           │  └─────│    RECOVER      │─────────┘     │
           │        │                 │               │
           │        └────────┬────────┘               │
           │                 │                        │
           │     ┌───────────┴───────────┐            │
           │     │                       │            │
           │     ▼                       ▼            │
           │ ┌───────────┐         ┌───────────┐      │
           │ │   ADAPT   │         │  Back to  │      │
           │ │ (if flag) │         │  OBSERVE  │      │
           │ └─────┬─────┘         └───────────┘      │
           │       │                                  │
           └───────┴──────────────────────────────────┘
```

### 6.2 State Specifications

```
STATE: OBSERVE
┌─────────────────────────────────────────────────────────────┐
│  PURPOSE: Gather player data, wait for opportunity          │
│                                                              │
│  ACTIONS:                                                    │
│  - Play idle animation                                       │
│  - Track player position and state                           │
│  - Log player actions to pattern tracker                     │
│  - Maintain preferred distance (back away if needed)         │
│                                                              │
│  DURATION: 60-180 frames (1-3 seconds)                       │
│                                                              │
│  TRANSITIONS:                                                │
│  → APPROACH: Player too far OR aggression timer expires      │
│  → DEFEND: Player attacks                                    │
│  → COMMIT: Opening detected (player recovery)                │
└─────────────────────────────────────────────────────────────┘

STATE: APPROACH
┌─────────────────────────────────────────────────────────────┐
│  PURPOSE: Close distance to player                           │
│                                                              │
│  ACTIONS:                                                    │
│  - Walk/dash toward player                                   │
│  - Continue pattern logging                                  │
│  - Maintain facing toward player                             │
│  - Occasionally pause (feint approach)                       │
│                                                              │
│  DURATION: Until in range OR player retreats significantly   │
│                                                              │
│  TRANSITIONS:                                                │
│  → PRESSURE: Within attack range                             │
│  → DEFEND: Player attacks during approach                    │
│  → OBSERVE: Player retreats beyond engagement range          │
└─────────────────────────────────────────────────────────────┘

STATE: PRESSURE
┌─────────────────────────────────────────────────────────────┐
│  PURPOSE: Apply offensive pressure, find opening             │
│                                                              │
│  ACTIONS:                                                    │
│  - Hover at preferred distance                               │
│  - Feint movements (baiting player attacks)                  │
│  - Mix advancing and retreating                              │
│  - Execute probe attacks                                     │
│                                                              │
│  DURATION: 30-90 frames (0.5-1.5 seconds)                    │
│                                                              │
│  TRANSITIONS:                                                │
│  → COMMIT: Opening found                                     │
│  → DEFEND: Player attacking                                  │
│  → RECOVER: Timeout                                          │
└─────────────────────────────────────────────────────────────┘

STATE: COMMIT
┌─────────────────────────────────────────────────────────────┐
│  PURPOSE: Execute attack                                     │
│                                                              │
│  ACTIONS:                                                    │
│  - Select attack based on situation                          │
│  - Execute attack animation                                  │
│  - Cannot cancel once started                                │
│                                                              │
│  ATTACK SELECTION LOGIC:                                     │
│  - Player in recovery → Fast attack                          │
│  - Player whiffed → Medium attack                            │
│  - Player blocking a lot → Guard break (if available)        │
│  - Default → Best available attack                           │
│                                                              │
│  DURATION: Attack animation length                           │
│                                                              │
│  TRANSITIONS:                                                │
│  → RECOVER: Attack complete                                  │
│  → OBSERVE: Attack interrupted (shouldn't happen often)      │
└─────────────────────────────────────────────────────────────┘

STATE: DEFEND
┌─────────────────────────────────────────────────────────────┐
│  PURPOSE: Survive player offense                             │
│                                                              │
│  ACTIONS:                                                    │
│  - Block if player attacking                                 │
│  - Backdash if player approaching                            │
│  - Counter if high resistance to incoming attack             │
│  - Jump if detecting low attack                              │
│                                                              │
│  DEFENSE SELECTION LOGIC:                                    │
│  - Resistance > 0.4 → Counter attempt                        │
│  - Resistance 0.2-0.4 → 60% block, 40% evade                 │
│  - Resistance < 0.2 → 40% block, 60% evade                   │
│                                                              │
│  DURATION: Until player attack ends                          │
│                                                              │
│  TRANSITIONS:                                                │
│  → PRESSURE: Player attack ends                              │
│  → COMMIT: Successful block, counter opportunity             │
│  → RECOVER: Took damage                                      │
└─────────────────────────────────────────────────────────────┘

STATE: RECOVER
┌─────────────────────────────────────────────────────────────┐
│  PURPOSE: Reset after action                                 │
│                                                              │
│  ACTIONS:                                                    │
│  - Back away from player (create space)                      │
│  - Clear temporary flags                                     │
│  - Reduce aggression slightly                                │
│  - Check if adaptation is needed                             │
│                                                              │
│  DURATION: 20-60 frames (0.3-1 second)                       │
│                                                              │
│  TRANSITIONS:                                                │
│  → ADAPT: Should Adapt flag set                              │
│  → OBSERVE: Recovery complete                                │
└─────────────────────────────────────────────────────────────┘

STATE: ADAPT
┌─────────────────────────────────────────────────────────────┐
│  PURPOSE: Process learned patterns, adjust behavior          │
│                                                              │
│  ACTIONS:                                                    │
│  - Run pattern analysis                                      │
│  - Update resistance values                                  │
│  - Adjust aggression based on fight progress                 │
│  - Select counter-strategies for common player moves         │
│                                                              │
│  RESULTS:                                                    │
│  - Block probability increased for common attacks            │
│  - Reaction time decreased for "known" patterns              │
│  - Counter probability increased                             │
│  - May change preferred distance                             │
│                                                              │
│  DURATION: 30 frames (instant in-game, brief pause)          │
│                                                              │
│  TRANSITIONS:                                                │
│  → PRESSURE: Adaptation complete                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. COMBAT DECISION SYSTEM

### 7.1 Attack Selection Logic

```python
# Pseudocode: Select Attack

def select_attack():
    player_state = blackboard.get("PlayerCurrentState")
    player_distance = blackboard.get("PlayerDistance")
    
    # Priority 1: Punish recovery
    if player_state == RECOVERY:
        return select_fast_attack()
    
    # Priority 2: Punish whiff
    if player_state == ATTACK_WHIFF:
        return select_medium_attack()
    
    # Priority 3: Guard break if blocking
    if player_state == BLOCKING:
        if has_guard_break_attack():
            return select_guard_break()
        else:
            return select_heavy_attack()  # Chip damage
    
    # Priority 4: Range-based selection
    if player_distance < 1.5:
        return select_fast_attack()  # Close range = speed
    elif player_distance < 2.5:
        return select_medium_attack()  # Mid range = balance
    else:
        return select_gap_closer()  # Far = close distance
    
def select_fast_attack():
    attacks = get_attacks_by_speed(max_startup=8)
    return weighted_random(attacks, weight_by="damage")

def select_medium_attack():
    attacks = get_attacks_by_speed(max_startup=15)
    return weighted_random(attacks, weight_by="damage")
    
def select_heavy_attack():
    attacks = get_attacks_by_damage(min_damage=20)
    return weighted_random(attacks, weight_by="speed")
```

### 7.2 Defense Selection Logic

```python
# Pseudocode: Select Defense

def select_defense():
    incoming_attack = blackboard.get("PlayerCurrentAttack")
    resistance = get_resistance(incoming_attack)
    
    # High resistance = counter
    if resistance > 0.4 and can_counter():
        return COUNTER
    
    # Calculate block vs evade
    block_prob = 0.4 + resistance  # 40-90%
    
    if random() < block_prob:
        return BLOCK
    else:
        return select_evade()

def select_evade():
    player_pos = blackboard.get("PlayerPosition")
    
    # Evade away from player
    if has_backdash():
        return BACKDASH
    elif has_sidestep():
        return random_choice([SIDESTEP_LEFT, SIDESTEP_RIGHT])
    else:
        return JUMP  # Last resort
```

### 7.3 Opening Detection Logic

```python
# Pseudocode: Detect Opening

def detect_opening():
    player_state = blackboard.get("PlayerCurrentState")
    player_frame = blackboard.get("PlayerStateFrame")
    
    # Opening: Player in recovery (can't act)
    if player_state == RECOVERY:
        return True
    
    # Opening: Player just whiffed
    if player_state == ATTACK_WHIFF:
        return True
    
    # Opening: Player is walking toward us (not blocking)
    if player_state == WALKING:
        if blackboard.get("PlayerDistance") < 2.0:
            return random() < 0.3  # 30% chance to attack walkers
    
    # Opening: Player is standing still too long
    if player_state == IDLE:
        if blackboard.get("PlayerIdleTime") > 60:  # 1 second
            return random() < 0.2  # 20% chance
    
    return False
```

---

## 8. ADAPTATION MECHANICS

### 8.1 Adaptation Visual Feedback

```
VISUAL TELLS THAT AI HAS ADAPTED:

1. CIRCUIT GLOW INTENSIFIES
   - Baseline: Faint red circuits
   - Adapted: Bright red pulsing circuits
   - The more adapted, the brighter

2. STANCE CHANGE
   - Unadapted: Neutral, balanced stance
   - Adapted: Slightly lower, defensive lean
   
3. EYE TRACKING
   - Unadapted: Occasional glances at player
   - Adapted: Constant locked eye contact

4. AUDIO CUE
   - When adaptation threshold crossed:
     Play "data processed" sound effect
     (Electronic chirp/beep)

5. PARTICLE EFFECT
   - Brief data particles around head
   - Signals "I'm learning"
```

### 8.2 Counter-Strategy Selection

```python
# Pseudocode: Select Counter Strategy

def select_counter_strategy(most_used_move):
    
    # Map player moves to counter strategies
    counter_map = {
        # If player spams light attacks
        "light_attack": {
            "strategy": "PARRY_PUNISH",
            "block_prob_bonus": 0.3,
            "counter_attack": "heavy_attack",
            "preferred_distance": 2.5  # Stay at poke range
        },
        
        # If player spams heavy attacks
        "heavy_attack": {
            "strategy": "INTERRUPT",
            "block_prob_bonus": 0.1,
            "counter_attack": "fast_light",  # Beat their startup
            "preferred_distance": 1.5  # Get in close
        },
        
        # If player spams dash attacks
        "dash_attack": {
            "strategy": "BAIT_AND_PUNISH",
            "block_prob_bonus": 0.4,
            "counter_attack": "heavy_on_whiff",
            "preferred_distance": 3.5  # Stay back, bait whiffs
        },
        
        # If player spams tail abilities
        "tail_ability": {
            "strategy": "AGGRESSION",
            "aggression_bonus": 0.3,
            "counter_attack": "pressure_chain",
            "preferred_distance": 1.0  # Get in their face
        },
        
        # If player plays very defensive
        "block": {
            "strategy": "GUARD_BREAK",
            "use_grab": True,
            "counter_attack": "guard_break_or_grab",
            "preferred_distance": 1.5
        }
    }
    
    return counter_map.get(most_used_move, default_strategy)
```

### 8.3 Adaptation Reset Conditions

```
ADAPTATION RESETS:

1. PLAYER SWITCHES TAIL
   - Partial reset: Reduce all resistances by 50%
   - Reason: New tail = new playstyle expected

2. PLAYER DIES AND RESPAWNS
   - Full reset: All resistances to 0
   - Reason: Fresh start per life

3. LONG TIME WITHOUT MOVE
   - Gradual decay: -0.02 resistance per 5 sec
   - Reason: Reward variety

4. ARENA TRANSITION
   - Partial reset: Reduce by 30%
   - Reason: Environmental factors change combat

5. ENEMY PHASE TRANSITION (Bosses)
   - No reset, but aggression changes
   - Reason: Maintains difficulty progression
```

---

## 9. IMPLEMENTATION GUIDE

### 9.1 Unreal Engine 5 Implementation

```cpp
// AIControllerBase.h
UCLASS()
class AAdaptiveAIController : public AAIController
{
    GENERATED_BODY()
    
public:
    // Components
    UPROPERTY(VisibleAnywhere)
    UBehaviorTreeComponent* BehaviorTreeComp;
    
    UPROPERTY(VisibleAnywhere)
    UBlackboardComponent* BlackboardComp;
    
    UPROPERTY(VisibleAnywhere)
    UPatternTrackerComponent* PatternTracker;
    
    // Configuration
    UPROPERTY(EditDefaultsOnly)
    UBehaviorTree* BehaviorTreeAsset;
    
    UPROPERTY(EditDefaultsOnly)
    UBlackboardData* BlackboardAsset;
    
    // Enemy type data
    UPROPERTY(EditDefaultsOnly)
    UEnemyDataAsset* EnemyData;
    
protected:
    virtual void BeginPlay() override;
    virtual void Tick(float DeltaTime) override;
    
    void UpdatePerception();
    void UpdateBlackboard();
};

// PatternTrackerComponent.h
UCLASS()
class UPatternTrackerComponent : public UActorComponent
{
    GENERATED_BODY()
    
public:
    // Data structures
    UPROPERTY()
    TMap<FString, int32> MoveFrequency;
    
    UPROPERTY()
    TMap<FString, float> MoveResistances;
    
    // Analysis results
    UPROPERTY(BlueprintReadOnly)
    float Predictability;
    
    UPROPERTY(BlueprintReadOnly)
    FString MostUsedMove;
    
    // Functions
    UFUNCTION(BlueprintCallable)
    void LogPlayerAction(const FString& ActionID);
    
    UFUNCTION(BlueprintCallable)
    void AnalyzePatterns();
    
    UFUNCTION(BlueprintCallable)
    void OnHitReceived(const FString& MoveID);
    
    UFUNCTION(BlueprintCallable)
    float GetResistance(const FString& MoveID);
    
private:
    void DecayResistances(float DeltaTime);
};
```

### 9.2 Unity Implementation

```csharp
// AdaptiveAIController.cs
public class AdaptiveAIController : MonoBehaviour
{
    [Header("Configuration")]
    [SerializeField] private EnemyDataSO enemyData;
    [SerializeField] private BehaviorTree behaviorTree;
    
    [Header("Components")]
    private PatternTracker patternTracker;
    private Blackboard blackboard;
    private AIStateMachine stateMachine;
    
    [Header("Runtime")]
    private Transform player;
    private AIState currentState;
    
    void Awake()
    {
        patternTracker = new PatternTracker();
        blackboard = new Blackboard();
        stateMachine = new AIStateMachine(this);
    }
    
    void Update()
    {
        UpdatePerception();
        patternTracker.DecayResistances(Time.deltaTime);
        blackboard.Update();
        behaviorTree.Tick();
    }
    
    void UpdatePerception()
    {
        if (player == null) return;
        
        blackboard.Set("PlayerPosition", player.position);
        blackboard.Set("PlayerDistance", Vector3.Distance(transform.position, player.position));
        // ... more perception updates
    }
}

// PatternTracker.cs
public class PatternTracker
{
    private Dictionary<string, int> moveFrequency = new Dictionary<string, int>();
    private Dictionary<string, float> moveResistances = new Dictionary<string, float>();
    private Queue<float> timingHistory = new Queue<float>(20);
    
    public float Predictability { get; private set; }
    public string MostUsedMove { get; private set; }
    
    public void LogPlayerAction(string actionID)
    {
        if (!moveFrequency.ContainsKey(actionID))
            moveFrequency[actionID] = 0;
        moveFrequency[actionID]++;
    }
    
    public void AnalyzePatterns()
    {
        int total = moveFrequency.Values.Sum();
        if (total < 5) return;
        
        var most = moveFrequency.OrderByDescending(x => x.Value).First();
        MostUsedMove = most.Key;
        Predictability = (float)most.Value / total;
    }
    
    public void OnHitReceived(string moveID)
    {
        float current = moveResistances.GetValueOrDefault(moveID, 0f);
        moveResistances[moveID] = Mathf.Min(current + 0.10f, 0.50f);
    }
    
    public float GetResistance(string moveID)
    {
        return moveResistances.GetValueOrDefault(moveID, 0f);
    }
    
    public void DecayResistances(float deltaTime)
    {
        var keys = moveResistances.Keys.ToList();
        foreach (var key in keys)
        {
            moveResistances[key] = Mathf.Max(0, moveResistances[key] - 0.02f * deltaTime);
        }
    }
}
```

### 9.3 Behavior Tree Node Examples

```cpp
// BTTask_SelectAttack.cpp (UE5)
EBTNodeResult::Type UBTTask_SelectAttack::ExecuteTask(UBehaviorTreeComponent& OwnerComp, uint8* NodeMemory)
{
    UBlackboardComponent* BB = OwnerComp.GetBlackboardComponent();
    
    EPlayerState PlayerState = (EPlayerState)BB->GetValueAsEnum(PlayerStateKey.SelectedKeyName);
    float PlayerDistance = BB->GetValueAsFloat(PlayerDistanceKey.SelectedKeyName);
    
    FString SelectedAttack;
    
    // Priority 1: Punish recovery
    if (PlayerState == EPlayerState::Recovery)
    {
        SelectedAttack = SelectFastAttack();
    }
    // Priority 2: Range-based
    else if (PlayerDistance < 1.5f)
    {
        SelectedAttack = SelectFastAttack();
    }
    else
    {
        SelectedAttack = SelectMediumAttack();
    }
    
    BB->SetValueAsString(SelectedAttackKey.SelectedKeyName, SelectedAttack);
    return EBTNodeResult::Succeeded;
}
```

---

## 10. TUNING PARAMETERS

### 10.1 Global AI Parameters

```
GLOBAL TUNING:

// Timing
OBSERVE_MIN_DURATION = 60 frames (1 sec)
OBSERVE_MAX_DURATION = 180 frames (3 sec)
PRESSURE_TIMEOUT = 90 frames (1.5 sec)
RECOVER_DURATION = 45 frames (0.75 sec)
ADAPT_INTERVAL = 120 frames (2 sec)

// Distances
DEFAULT_ATTACK_RANGE = 2.0 units
DEFAULT_ENGAGEMENT_RANGE = 4.0 units
SAFE_DISTANCE = 5.0 units

// Probabilities
BASE_BLOCK_PROBABILITY = 0.40
BASE_COUNTER_PROBABILITY = 0.20
FEINT_PROBABILITY = 0.15
DASH_IN_PROBABILITY = 0.25

// Adaptation
RESISTANCE_GAIN_ON_HIT = 0.10
RESISTANCE_GAIN_ON_BLOCK = 0.05
RESISTANCE_DECAY_RATE = 0.02 per 5 sec
MAX_RESISTANCE = 0.50
PREDICTABILITY_THRESHOLD = 0.35
```

### 10.2 Per-Enemy Tuning Matrix

| Parameter | Iterator | Null Stalker | Bastion | Phase Weaver | Crown Warden |
|-----------|----------|--------------|---------|--------------|--------------|
| Resistance Gain | 0.10 | 0.05 | 0.03 | 0.15 | 0.08 |
| Resistance Max | 0.50 | 0.40 | 0.30 | 0.50 | 0.60 |
| Block Prob Base | 0.40 | 0.25 | 0.70 | 0.30 | 0.50 |
| Counter Prob | 0.20 | 0.40 | 0.10 | 0.25 | 0.35 |
| Aggression Min | 0.40 | 0.20 | 0.30 | 0.50 | 0.30 |
| Aggression Max | 0.70 | 0.40 | 0.50 | 0.80 | 0.90 |
| Adapt Interval | 120f | 180f | 240f | 90f | 90f |

### 10.3 Difficulty Scaling

```
DIFFICULTY MODIFIERS:

EASY MODE:
  - Resistance gain: 50% of base
  - Adaptation interval: 2x
  - Reaction time: +4 frames
  - Aggression max: -0.2
  - Telegraph duration: +8 frames

NORMAL MODE:
  - All values as specified

HARD MODE:
  - Resistance gain: 125% of base
  - Adaptation interval: 75%
  - Reaction time: -2 frames
  - Aggression max: +0.1
  - Telegraph duration: -4 frames

ULGORR MODE (Unlockable):
  - Resistance gain: 150%
  - Adaptation interval: 50%
  - Reaction time: -4 frames
  - Enemies start with 0.2 resistance to all moves
  - No telegraph duration reduction (keep fair)
```

---

## APPENDIX A: BEHAVIOR TREE VISUAL

```
                          ┌─────────────────────────────────┐
                          │              ROOT               │
                          │           (Selector)            │
                          └─────────────────┬───────────────┘
                                            │
      ┌─────────────┬──────────┬────────────┼────────────┬──────────┬─────────────┐
      │             │          │            │            │          │             │
      ▼             ▼          ▼            ▼            ▼          ▼             ▼
┌──────────┐  ┌──────────┐ ┌────────┐  ┌────────┐  ┌────────┐ ┌────────┐   ┌──────────┐
│EMERGENCY │  │  DEFEND  │ │ COMMIT │  │PRESSURE│  │APPROACH│ │ ADAPT  │   │ OBSERVE  │
│ (Death/  │  │ (Block/  │ │(Attack)│  │ (Feint/│  │ (Move  │ │(Update │   │ (Default)│
│  Desp.)  │  │ Counter) │ │        │  │ Probe) │  │ Toward)│ │ Learn) │   │          │
└──────────┘  └──────────┘ └────────┘  └────────┘  └────────┘ └────────┘   └──────────┘
      │             │          │            │            │          │             │
  HP < 15%    Player     Opening       In Range     Not in     Should      Default
              Attack     Found                      Range       Adapt        State
```

---

## APPENDIX B: TESTING CHECKLIST

```
AI BEHAVIOR TESTING:

□ OBSERVE state logs player actions correctly
□ Pattern analysis identifies most used move
□ Resistance increases when hit by same move
□ Resistance decays over time
□ ADAPT state changes behavior visibly
□ Block probability increases with resistance
□ Counter attempts increase with high resistance
□ Enemy selects appropriate attacks for range
□ Opening detection works (punishes recovery)
□ Defensive options (block/evade) are functional
□ Phase transitions work (Crown Warden)
□ Visual feedback reflects adaptation level
□ Audio cues play at correct times
□ All enemy types behave distinctly
□ Difficulty modifiers apply correctly
```

---

**Document Version:** 1.0  
**Last Updated:** December 2025  
**Author:** AI Systems Team  
**Status:** Production Ready  

---

*"Every pattern is a weakness. Every habit is a target."*

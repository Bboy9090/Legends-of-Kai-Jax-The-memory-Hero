# Combat System

## Overview

The combat system combines Super Smash Bros knockback mechanics with Batman Arkham freeflow combat.

## Damage System

### Percentage-Based Damage

Unlike traditional HP systems, fighters accumulate damage as a percentage (0% to 999%):

```typescript
currentDamage += incomingDamage;
```

Higher percentages make fighters:
- Fly further when hit (increased knockback)
- Stay in hitstun longer
- Easier to KO

## Knockback Calculation

### Smash Bros Formula

```
KB = ((((p/10 + (p*d)/20) * 200/(w+100) * 1.4) + 18) * s) + b) * r

Where:
- p = percentage before hit
- d = damage of the attack
- w = weight of the target (50-150)
- s = knockback growth/scaling
- b = base knockback
- r = rage/staleness multiplier
```

### Knockback Vector

Attacks have an angle (in degrees):
- 45° = Standard forward launch
- 90° = Straight up
- 270° = Meteor/spike (downward)
- 361° = Sakurai angle (changes based on knockback)

### Directional Influence (DI)

Players can influence knockback direction by holding a direction:
- Maximum influence: ±18°
- Helps survive or combo escape
- Applied after knockback calculation

## Hitstun & Hitlag

### Hitstun

Duration the defender cannot act after being hit:

```typescript
hitstun = BASE_FRAMES + (knockback * MULTIPLIER)
```

- Scales with knockback magnitude
- Can be reduced with mashing
- Determines combo potential

### Hitlag (Freeze Frames)

Both attacker and defender freeze briefly on hit:

```typescript
hitlag = BASE_FRAMES + (damage * MULTIPLIER)
```

- Defender experiences 1.5x hitlag
- Maximum 20 frames
- Creates satisfying impact feel
- Used for visual effects (screen shake, particles)

## Attack Properties

Each attack has:

```typescript
interface AttackData {
  damage: number;               // Base damage
  baseKnockback: number;        // Minimum knockback
  knockbackGrowth: number;      // How much it scales
  knockbackAngle: number;       // Launch angle
  startupFrames: number;        // Before hitbox active
  activeFrames: number;         // Hitbox duration
  recoveryFrames: number;       // After hitbox
  canCancel: boolean;           // Can cancel into other moves
  nextMoves: string[];          // Valid combo routes
}
```

## Combo System

### Freeflow Combos

Inspired by Batman Arkham combat:

- **Attack Chaining**: Seamlessly switch between targets
- **Combo Counter**: Tracks consecutive hits
- **Multiplier**: Damage increases with combo length (up to 2x)
- **Combo Reset**: Breaks after 1 second without hitting

```typescript
multiplier = 1.0 + (hits - 1) * 0.1; // 10% per hit
maxMultiplier = 2.0;                  // 200% cap
```

### Combo Routes

Moves can define valid follow-ups:

```typescript
jab: {
  nextMoves: ['jab2'],  // Can chain to jab2
  canCancel: false      // Must finish animation
}

jab3: {
  nextMoves: [],        // Combo ender
  canCancel: true       // Can cancel to special
}
```

## Counter & Parry System

### Counter Window

8-frame window to absorb and counter attacks:

```typescript
COUNTER_WINDOW_FRAMES = 8;
COUNTER_MULTIPLIER = 1.5x damage;
```

### Parry Window

3-frame precise timing for perfect parry:

```typescript
PARRY_WINDOW_FRAMES = 3;
PARRY_MULTIPLIER = 2.0x damage;
PERFECT_PARRY_BONUS = +2 frames counter window;
```

Perfect parry:
- Reflects attack back at attacker
- Grants extended counter window
- Triggers special visual effect

## Special Systems

### Rage

Fighters deal more knockback at high damage:

```typescript
rageMultiplier = 1.0 + (damage / 100) * 0.15;
maxRage = 1.15; // 15% bonus at 100%+
```

### Stale Move Negation

Repeated moves deal less damage (future feature):

```typescript
stalenessMultiplier = 1.0 - (recentUses * 0.05);
minMultiplier = 0.7; // 70% minimum
```

### Weight Classes

Character weight affects knockback:

- Light (70-85): Easier to launch, faster movement
- Medium (90-110): Balanced
- Heavy (115-130): Harder to launch, slower movement

## Ultimate Meter

Builds from:
- Dealing damage: +2 per hit
- Taking damage: +1 per % damage taken

Costs 100 meter to activate ultimate move.

## Screen Effects

### Intensity Based on Impact

```typescript
// Screen shake
intensity = damage * 0.1;
duration = 100ms base + (damage * 5);

// Slow motion
triggers on: knockback > 120 OR damage > 50
duration: 200ms
timeScale: 0.3 (30% speed)

// Hitlag
attacker: BASE + (damage * 0.3)
defender: BASE + (damage * 0.3) * 1.5
```

## Frame Data Examples

### Light Attack (Jab)
- Startup: 3 frames
- Active: 2 frames
- Recovery: 8 frames
- **Total**: 13 frames (0.22 seconds)

### Heavy Attack (Smash)
- Startup: 15 frames
- Active: 4 frames
- Recovery: 25 frames
- **Total**: 44 frames (0.73 seconds)

### Special Move (Projectile)
- Startup: 20 frames
- Active: 5 frames
- Recovery: 30 frames
- **Total**: 55 frames (0.92 seconds)

## Balancing Philosophy

1. **Risk vs Reward**: Slower moves deal more damage/knockback
2. **Combo Potential**: Light attacks chain, heavy attacks finish
3. **Counterplay**: All moves can be parried/dodged
4. **Read-Based**: Counter system rewards prediction
5. **Skill Expression**: Frame-perfect inputs give bonuses

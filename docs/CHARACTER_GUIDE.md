# Character Creation Guide

## Creating a New Character

This guide walks through creating a new playable character.

## Step 1: Create Character Files

Create a new directory in `packages/characters/src/heroes/`:

```
packages/characters/src/heroes/YourHero/
├── YourHero.ts
├── YourHeroMoves.ts
└── index.ts
```

## Step 2: Extend BaseFighter

```typescript
// YourHero.ts
import { FighterStats, MoveSet } from '@smash-heroes/shared';
import { BaseFighter } from '../../base/BaseFighter';
import { createYourHeroMoveSet } from './YourHeroMoves';

export class YourHero extends BaseFighter {
  constructor(id: string) {
    super(id, 'YourHero');
  }

  protected getDefaultStats(): FighterStats {
    return {
      // Movement
      weight: 100,          // 70-130 range
      walkSpeed: 1.2,       // 0.8-1.5 range
      runSpeed: 2.0,        // 1.5-2.5 range
      airSpeed: 1.0,        // 0.8-1.3 range
      
      // Jump
      jumpHeight: 12,       // 10-15 range
      airJumps: 1,          // Usually 1, some have 2+
      fallSpeed: 1.5,       // 1.2-2.0 range
      fastFallSpeed: 2.4,   // fallSpeed * 1.6
      
      // Stats
      maxDamage: 999,
      currentDamage: 0,
      lives: 3,
      ultimateMeter: 0,
      ultimateCost: 100,
    };
  }

  protected createMoveSet(): MoveSet {
    return createYourHeroMoveSet();
  }

  protected setupStateMachine(): void {
    // Define state transitions and callbacks
    this.stateMachine.onEnter(FighterState.IDLE, () => {
      // Enter idle logic
    });

    this.stateMachine.onEnter(FighterState.JAB, () => {
      this.performAttack('jab');
    });

    // Add more state handlers...
  }

  // Character-specific abilities
  performSpecialAbility(): void {
    // Custom logic
  }
}
```

## Step 3: Define Moveset

```typescript
// YourHeroMoves.ts
import { MoveSet } from '@smash-heroes/shared';
import { MoveSetBuilder } from '../../base/MoveSet';

export function createYourHeroMoveSet(): MoveSet {
  const builder = new MoveSetBuilder();

  // Ground attacks
  builder
    .addAttack('jab', {
      damage: 3,
      baseKnockback: 10,
      knockbackGrowth: 0.5,
      knockbackAngle: 361,
      startupFrames: 3,
      activeFrames: 2,
      recoveryFrames: 8,
      nextMoves: ['jab2'],
    })
    .addAttack('forward_smash', {
      damage: 18,
      baseKnockback: 80,
      knockbackGrowth: 1.8,
      knockbackAngle: 45,
      startupFrames: 15,
      activeFrames: 4,
      recoveryFrames: 25,
    });

  // Aerial attacks
  builder
    .addAerialMove('nair', {
      damage: 10,
      baseKnockback: 45,
      knockbackGrowth: 1.0,
      knockbackAngle: 45,
      startupFrames: 5,
      activeFrames: 12,
      recoveryFrames: 10,
    });

  // Special moves
  builder
    .addSpecialMove('neutral_special', {
      name: 'Your Special Move',
      damage: 15,
      baseKnockback: 65,
      knockbackGrowth: 1.4,
      knockbackAngle: 45,
      startupFrames: 20,
      activeFrames: 5,
      recoveryFrames: 30,
    })
    .addSpecialMove('up_special', {
      name: 'Recovery Move',
      damage: 10,
      baseKnockback: 70,
      knockbackGrowth: 1.2,
      knockbackAngle: 90,
      startupFrames: 5,
      activeFrames: 15,
      recoveryFrames: 25,
    });

  // Grabs and throws
  builder
    .addGrab('grab', {
      damage: 0,
      baseKnockback: 0,
      knockbackGrowth: 0,
      knockbackAngle: 0,
      startupFrames: 6,
      activeFrames: 2,
      recoveryFrames: 30,
    })
    .addGrab('forward_throw', {
      damage: 7,
      baseKnockback: 60,
      knockbackGrowth: 1.0,
      knockbackAngle: 45,
      startupFrames: 10,
      activeFrames: 1,
      recoveryFrames: 20,
    });

  return builder.build();
}
```

## Step 4: Export Character

```typescript
// index.ts
export * from './YourHero';
export * from './YourHeroMoves';
```

Update `packages/characters/src/index.ts`:

```typescript
export * from './base';
export * from './heroes/Striker';
export * from './heroes/YourHero'; // Add this
```

## Balancing Guidelines

### Weight Classes

- **Light (70-85)**: Fast, combo food, dies early
- **Medium (90-110)**: Balanced
- **Heavy (115-130)**: Slow, hard to combo, lives long

### Speed Ranges

- **Walk**: 0.8 (slow) to 1.5 (fast)
- **Run**: 1.5 (slow) to 2.5 (fast)
- **Air**: 0.8 (floaty) to 1.3 (fast faller)

### Attack Damage

- **Jab**: 2-4 damage
- **Tilt**: 6-9 damage
- **Smash**: 14-20 damage
- **Aerial**: 8-14 damage
- **Special**: 10-18 damage

### Frame Data

Quick attacks:
- Startup: 3-5 frames
- Active: 2-4 frames
- Recovery: 8-12 frames

Heavy attacks:
- Startup: 12-20 frames
- Active: 3-6 frames
- Recovery: 20-30 frames

### Knockback

Light attacks:
- Base: 10-30
- Growth: 0.5-1.0

Heavy attacks:
- Base: 60-100
- Growth: 1.5-2.0

Kill moves (finishers):
- Base: 80-120
- Growth: 1.8-2.5

## Testing Your Character

1. **Build the packages**:
```bash
pnpm build
```

2. **Test move frame data**:
- Ensure fast attacks feel responsive
- Heavy attacks should have clear wind-up
- Recovery frames prevent spam

3. **Test combo potential**:
- Light attacks should chain
- Heavy attacks should be combo enders
- Verify nextMoves work correctly

4. **Test balance**:
- Can perform ~40-60% combos
- Kill moves work at 100-130%
- Not too safe or too punishable

## Best Practices

1. **Consistent Archetype**: Design moveset around a theme
2. **Clear Strengths/Weaknesses**: Every character should have both
3. **Unique Identity**: Give special moves distinct feel
4. **Recovery Options**: Up special should aid recovery
5. **Counter Options**: Down special often defensive

## Examples

See `packages/characters/src/heroes/Striker/` for a complete example of a balanced all-rounder character.

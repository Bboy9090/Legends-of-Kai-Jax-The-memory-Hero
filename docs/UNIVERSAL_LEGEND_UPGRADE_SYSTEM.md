# 🌟 UNIVERSAL LEGEND UPGRADE SYSTEM

## Overview

A world-class, comprehensive upgrade system for Legends of Kai-Jax that provides universal access to all upgrade categories, systems, and mechanics across the entire game.

## Features

### ✨ Core Capabilities

- **Universal Access**: Single upgrade system used across all game modes
- **Multiple Categories**: 13+ upgrade categories covering all game systems
- **Prerequisites & Dependencies**: Complex prerequisite chains for progression
- **Cost Scaling**: Linear, exponential, and custom cost scaling formulas
- **Resource Management**: Multiple resource types (currency, chaos energy, memory shards, resonance, reflex, experience)
- **Stat Modifications**: Flat, percentage, and multiplier stat changes
- **Ability Unlocks**: Unlock new abilities at specific upgrade levels
- **Set Bonuses**: Gear set bonuses with 2/4/6 piece effects
- **Character-Specific**: Upgrades that apply only to specific characters
- **Team Synergy**: Team composition-based upgrades
- **Visual Effects**: Icon, particle, glow, and sound effect support

## Upgrade Categories

### Core Combat
- **Combat**: Base combat upgrades (damage, defense, dodge, parry, combos)
- **Traversal**: Movement and traversal upgrades (speed, wall run, momentum)
- **Special**: Special ability upgrades
- **Ultimate**: Ultimate ability upgrades

### Progression
- **Stats**: Core stat improvements (health, attack, defense, speed, resonance, reflex)
- **Abilities**: Ability unlocks and enhancements
- **Skills**: Skill tree upgrades

### Equipment & Gear
- **Gear**: Armor and equipment upgrades
- **Weapons**: Weapon upgrades
- **Accessories**: Accessory upgrades

### Team & Synergy
- **Team**: Team coordination upgrades
- **Synergy**: Team synergy bonuses

### Advanced Systems
- **Chaos**: Chaos Engineering upgrades
- **Tech**: Tech Fusion upgrades
- **Triforce**: Triforce Spellcraft upgrades
- **Starborn**: Starborn Awakening upgrades
- **Memory**: Memory-based upgrades (Kai-Jax specific)
- **Time**: Time manipulation upgrades (Silver specific)
- **Harmony**: Harmony upgrades (Lunara specific)

## Upgrade Rarity Tiers

1. **Common** (White) - Basic upgrades
2. **Uncommon** (Green) - Minor improvements
3. **Rare** (Blue) - Significant boosts
4. **Epic** (Purple) - Major enhancements
5. **Legendary** (Gold) - Game-changing abilities
6. **Mythic** (Red) - Ultimate transformations

## Usage Examples

### Basic Usage

```typescript
import { UpgradeManager, UPGRADE_SYSTEMS, ALL_UPGRADES } from '@legends-of-kai-jax/shared';

// Initialize upgrade manager
const upgradeManager = new UpgradeManager(
  { currency: 1000, chaosEnergy: 50 }, // Initial resources
  1,  // Player level
  0,  // Story progress
  ['KAI-JAX'] // Unlocked characters
);

// Check if upgrade can be unlocked
if (upgradeManager.canUnlock('combat_001')) {
  // Unlock upgrade
  upgradeManager.unlockUpgrade('combat_001');
}

// Level up an upgrade
upgradeManager.levelUpUpgrade('combat_001', 3); // Level up by 3

// Purchase upgrade (unlock or level up)
upgradeManager.purchaseUpgrade('combat_001');

// Get upgrade cost
const cost = upgradeManager.getUpgradeCost('combat_001', 5);

// Add resources
upgradeManager.addResources({ currency: 500, chaosEnergy: 10 });

// Get player state
const state = upgradeManager.getPlayerState();
console.log(`Unlocked: ${state.totalUpgradesUnlocked}`);
console.log(`Maxed: ${state.totalUpgradesMaxed}`);
```

### Integration with LabModeManager

```typescript
import { LabModeManager } from '@legends-of-kai-jax/engine';

// LabModeManager now uses the universal upgrade system
const labMode = new LabModeManager(
  { currency: 1000, chaosEnergy: 50 },
  1,
  0,
  ['KAI-JAX']
);

// Access the upgrade manager directly
const upgradeManager = labMode.getUpgradeManager();

// Or use LabModeManager methods (backward compatible)
labMode.purchaseUpgrade('chaos_001');
labMode.addResources({ currency: 500 });
```

### Querying Upgrades

```typescript
// Get specific upgrade
const upgrade = upgradeManager.getUpgrade('combat_001');

// Get all upgrades in a category
const combatUpgrades = upgradeManager.getAllUpgrades(UpgradeCategory.COMBAT);

// Get upgrades in a system
const systemUpgrades = upgradeManager.getSystemUpgrades('combat_system');

// Get upgrade progress
const progress = upgradeManager.getUpgradeProgress('combat_001');

// Validate prerequisites
const validation = upgradeManager.validatePrerequisites('combat_002');
if (!validation.valid) {
  console.log('Missing:', validation.missing);
}
```

## Upgrade Systems

The system includes 13 pre-configured upgrade systems:

1. **Combat Mastery System** - Core combat upgrades
2. **Traversal Mastery System** - Movement upgrades
3. **Special Abilities System** - Special ability upgrades
4. **Ultimate Power System** - Ultimate upgrades
5. **Core Stats System** - Base stat improvements
6. **Chaos Engineering** - Chaos-based upgrades
7. **Tech Fusion** - Technology enhancements
8. **Triforce Spellcraft** - Magic upgrades
9. **Starborn Awakening** - Cosmic power upgrades
10. **Memory Mastery** - Memory upgrades (Kai-Jax)
11. **Temporal Mastery** - Time upgrades (Silver)
12. **Harmony Resonance** - Harmony upgrades (Lunara)
13. **Team Synergy System** - Team coordination

## Upgrade Examples

### Combat Upgrade Example

```typescript
{
  id: 'combat_001',
  name: 'Combat Mastery',
  description: 'Increases base attack damage by 10% per level',
  category: UpgradeCategory.COMBAT,
  rarity: UpgradeRarity.COMMON,
  level: 0,
  maxLevel: 10,
  unlocked: false,
  cost: { currency: 100 },
  costScaling: {
    baseCost: 100,
    scalingType: 'exponential',
    scalingFactor: 1.5,
  },
  effects: {
    statModifications: [{
      stat: 'attack',
      type: 'percentage',
      value: 10,
      scaling: 'linear',
    }],
  },
}
```

### Upgrade with Prerequisites

```typescript
{
  id: 'combat_002',
  name: 'Perfect Dodge Mastery',
  description: 'Increases perfect dodge window by 0.05s per level',
  category: UpgradeCategory.COMBAT,
  rarity: UpgradeRarity.UNCOMMON,
  level: 0,
  maxLevel: 5,
  unlocked: false,
  cost: { currency: 200 },
  prerequisites: [
    { upgradeId: 'combat_001', minUpgradeLevel: 3 }
  ],
  effects: {
    statModifications: [{
      stat: 'dodgeChance',
      type: 'percentage',
      value: 5,
      scaling: 'linear',
    }],
  },
}
```

### Character-Specific Upgrade

```typescript
{
  id: 'memory_001',
  name: 'Memory Fragment Mastery',
  description: 'Increases memory fragment collection and effectiveness',
  category: UpgradeCategory.MEMORY,
  rarity: UpgradeRarity.RARE,
  level: 0,
  maxLevel: 5,
  unlocked: false,
  cost: { currency: 300, memoryShards: 10 },
  characterSpecific: ['KAI-JAX'],
  effects: {
    passiveEffects: ['Memory fragments provide 20% more benefits'],
  },
}
```

## Resource Types

- **currency**: Base game currency
- **chaosEnergy**: Chaos energy resource
- **memoryShards**: Memory shards (Kai-Jax specific)
- **resonance**: Resonance points (for special abilities)
- **reflex**: Reflex points (for dodge/parry)
- **experience**: Experience points

## Cost Scaling Types

1. **linear**: `baseCost + (baseCost * (level - 1) * factor)`
2. **exponential**: `baseCost * factor^(level - 1)`
3. **quadratic**: `baseCost * level^factor`
4. **custom**: Custom formula function

## Stat Modification Types

1. **flat**: Direct addition/subtraction
2. **percentage**: Percentage increase/decrease
3. **multiplier**: Multiplicative modifier

## File Structure

```
packages/shared/src/
├── types/
│   └── upgrade.types.ts          # Type definitions
├── data/
│   └── upgrade_data.ts          # Upgrade definitions
└── utils/
    └── UpgradeManager.ts         # Upgrade manager class
```

## Integration Points

- **LabModeManager**: Enhanced to use universal upgrade system
- **Shared Package**: Exported for use across all packages
- **Game Modes**: Can be used in any game mode
- **Character Systems**: Character-specific upgrades supported
- **Team Systems**: Team synergy upgrades supported

## Future Enhancements

- [ ] Save/Load upgrade state
- [ ] Upgrade presets/builds
- [ ] Upgrade comparison tools
- [ ] Upgrade recommendations
- [ ] Visual upgrade tree UI
- [ ] Upgrade search and filtering
- [ ] Upgrade analytics
- [ ] Upgrade reset with refunds
- [ ] Upgrade sharing between players

## API Reference

See TypeScript definitions in `packages/shared/src/types/upgrade.types.ts` for complete API documentation.

---

**Status**: ✅ Complete and Ready for Use

**Version**: 1.0.0

**Last Updated**: 2026-01-23

/**
 * ADVANCED UPGRADE DATA - BEYOND LEGENDARY
 * 
 * Advanced upgrade systems including:
 * - Mastery System
 * - Prestige System
 * - Fusion System
 * - Evolution System
 * - Upgrade Trees
 * - Challenges
 * - Synergy Bonuses
 */

import type {
  Upgrade,
  UpgradeSystem,
  UpgradeSynergy,
  UpgradeMastery,
  UpgradePrestige,
  UpgradeFusion,
  UpgradeEvolution,
  UpgradeTree,
  UpgradeTreeNode,
  UpgradeChallenge,
  StatModification,
  ResourceCost,
} from '../types/upgrade.types';
import {
  UpgradeCategory,
  UpgradeRarity,
} from '../types/upgrade.types';

/**
 * MASTERY SYSTEM UPGRADES
 */
export const MASTERY_UPGRADES: Upgrade[] = [
  {
    id: 'mastery_001',
    name: 'Combat Mastery Path',
    description: 'Unlock mastery bonuses for combat upgrades',
    category: UpgradeCategory.MASTERY,
    rarity: UpgradeRarity.EPIC,
    level: 0,
    maxLevel: 10,
    unlocked: false,
    cost: { currency: 1000, mastery: 10 },
    effects: {
      statModifications: [{
        stat: 'attack',
        type: 'percentage',
        value: 5,
        scaling: 'linear',
      }],
      masteryBonus: [{
        stat: 'comboMultiplier',
        type: 'multiplier',
        value: 0.1,
        scaling: 'linear',
      }],
    },
    masteryTrack: 'combat',
    tags: ['mastery', 'combat'],
  },
  {
    id: 'mastery_002',
    name: 'Traversal Mastery Path',
    description: 'Unlock mastery bonuses for traversal upgrades',
    category: UpgradeCategory.MASTERY,
    rarity: UpgradeRarity.EPIC,
    level: 0,
    maxLevel: 10,
    unlocked: false,
    cost: { currency: 1000, mastery: 10 },
    effects: {
      statModifications: [{
        stat: 'speed',
        type: 'percentage',
        value: 5,
        scaling: 'linear',
      }],
    },
    masteryTrack: 'traversal',
    tags: ['mastery', 'traversal'],
  },
];

/**
 * PRESTIGE SYSTEM UPGRADES
 */
export const PRESTIGE_UPGRADES: Upgrade[] = [
  {
    id: 'prestige_001',
    name: 'Prestige Awakening',
    description: 'Reset upgrades for permanent bonuses and resource multipliers',
    category: UpgradeCategory.PRESTIGE,
    rarity: UpgradeRarity.MYTHIC,
    level: 0,
    maxLevel: 1,
    unlocked: false,
    cost: { prestige: 1 },
    prerequisites: [
      { maxedUpgradeCount: 20 },
      { masteryLevel: 5 },
    ],
    effects: {
      prestigeBonus: [{
        stat: 'attack',
        type: 'percentage',
        value: 10,
        scaling: 'linear',
      }],
    },
    tags: ['prestige', 'reset'],
  },
];

/**
 * FUSION SYSTEM - FUSION RECIPES
 */
export const FUSION_RECIPES: UpgradeFusion[] = [
  {
    fusionId: 'fusion_001',
    name: 'Chaos-Tech Fusion',
    description: 'Fuse Chaos and Tech upgrades for enhanced power',
    ingredients: [
      { upgradeId: 'chaos_001', minLevel: 5 },
      { upgradeId: 'tech_001', minLevel: 5 },
    ],
    result: {
      upgradeId: 'fusion_chaos_tech',
      level: 1,
    },
    fusionCost: { currency: 5000, fusionMaterial: 10 },
    successRate: 0.8,
    failureResult: {
      upgradeId: 'fusion_chaos_tech_failed',
      level: 1,
    },
  },
  {
    fusionId: 'fusion_002',
    name: 'Trinity Fusion',
    description: 'Fuse Memory, Time, and Harmony for ultimate power',
    ingredients: [
      { upgradeId: 'memory_001', minLevel: 3 },
      { upgradeId: 'time_001', minLevel: 3 },
      { upgradeId: 'harmony_001', minLevel: 3 },
    ],
    result: {
      upgradeId: 'fusion_trinity',
      level: 1,
    },
    fusionCost: { currency: 10000, fusionMaterial: 25, resonance: 50 },
    successRate: 0.6,
  },
];

/**
 * EVOLUTION SYSTEM - EVOLUTION PATHS
 */
export const EVOLUTION_PATHS: UpgradeEvolution[] = [
  {
    evolutionId: 'evolution_001',
    name: 'Combat Evolution',
    description: 'Evolve Combat Mastery to Legendary tier',
    baseUpgradeId: 'combat_001',
    requiredLevel: 10,
    evolutionCost: { currency: 5000, evolutionEssence: 20 },
    evolutionResult: {
      upgradeId: 'combat_001_legendary',
      newRarity: UpgradeRarity.LEGENDARY,
      newMaxLevel: 20,
      bonusEffects: [{
        stat: 'attack',
        type: 'percentage',
        value: 25,
        scaling: 'linear',
      }],
    },
  },
  {
    evolutionId: 'evolution_002',
    name: 'Ultimate Evolution',
    description: 'Evolve Ultimate Power to Mythic tier',
    baseUpgradeId: 'ultimate_001',
    requiredLevel: 5,
    evolutionCost: { currency: 10000, evolutionEssence: 50 },
    evolutionResult: {
      upgradeId: 'ultimate_001_mythic',
      newRarity: UpgradeRarity.MYTHIC,
      newMaxLevel: 10,
      bonusEffects: [{
        stat: 'ultimateCharge',
        type: 'percentage',
        value: 50,
        scaling: 'linear',
      }],
    },
  },
];

/**
 * UPGRADE SYNERGIES
 */
export const UPGRADE_SYNERGIES: UpgradeSynergy[] = [
  {
    synergyId: 'synergy_combat_traversal',
    name: 'Combat-Traversal Synergy',
    description: 'Unlock when both Combat and Traversal upgrades are maxed',
    requiredUpgrades: ['combat_001', 'traversal_001'],
    requiredLevels: [10, 10],
    bonus: [{
      stat: 'speed',
      type: 'percentage',
      value: 15,
      scaling: 'linear',
    }, {
      stat: 'attack',
      type: 'percentage',
      value: 10,
      scaling: 'linear',
    }],
    unlockMessage: 'Combat and Traversal merge into perfect harmony!',
  },
  {
    synergyId: 'synergy_trinity',
    name: 'Trinity Synergy',
    description: 'Unlock when all Trinity character upgrades are maxed',
    requiredUpgrades: ['memory_002', 'time_002', 'harmony_002'],
    requiredLevels: [3, 3, 3],
    bonus: [{
      stat: 'health',
      type: 'percentage',
      value: 25,
      scaling: 'linear',
    }, {
      stat: 'attack',
      type: 'percentage',
      value: 25,
      scaling: 'linear',
    }, {
      stat: 'defense',
      type: 'percentage',
      value: 25,
      scaling: 'linear',
    }],
    unlockMessage: 'The Trinity awakens!',
  },
];

/**
 * UPGRADE TREES
 */
export const UPGRADE_TREES: UpgradeTree[] = [
  {
    treeId: 'combat_tree',
    name: 'Combat Mastery Tree',
    description: 'Branching paths for combat specialization',
    category: UpgradeCategory.COMBAT,
    rootNode: 'combat_001',
    nodes: [
      {
        upgradeId: 'combat_001',
        position: { x: 0, y: 0 },
        connections: ['combat_002', 'combat_003'],
        branchType: 'parallel',
      },
      {
        upgradeId: 'combat_002',
        position: { x: -1, y: 1 },
        connections: ['combat_004'],
        branchType: 'exclusive',
      },
      {
        upgradeId: 'combat_003',
        position: { x: 1, y: 1 },
        connections: ['combat_005'],
        branchType: 'exclusive',
      },
      {
        upgradeId: 'combat_004',
        position: { x: -1, y: 2 },
        connections: ['combat_006'],
      },
      {
        upgradeId: 'combat_005',
        position: { x: 1, y: 2 },
        connections: ['combat_007'],
      },
      {
        upgradeId: 'combat_006',
        position: { x: -1, y: 3 },
        connections: [],
      },
      {
        upgradeId: 'combat_007',
        position: { x: 1, y: 3 },
        connections: [],
      },
    ],
  },
];

/**
 * UPGRADE CHALLENGES
 */
export const UPGRADE_CHALLENGES: UpgradeChallenge[] = [
  {
    challengeId: 'challenge_001',
    name: 'Combat Master Challenge',
    description: 'Complete 1000 combos to unlock legendary combat upgrade',
    objectives: [
      {
        id: 'combo_1000',
        description: 'Perform 1000 combos',
        target: 1000,
        current: 0,
        type: 'combo',
      },
    ],
    rewards: {
      upgradeId: 'combat_legendary_unlock',
      resources: { currency: 5000 },
    },
    difficulty: 'hard',
  },
  {
    challengeId: 'challenge_002',
    name: 'Speed Demon Challenge',
    description: 'Complete a level in under 60 seconds',
    objectives: [
      {
        id: 'speed_run',
        description: 'Complete level in under 60 seconds',
        target: 60,
        current: 0,
        type: 'time',
      },
    ],
    rewards: {
      upgradeId: 'traversal_legendary_unlock',
      resources: { currency: 3000 },
    },
    difficulty: 'extreme',
    timeLimit: 3600, // 1 hour
  },
  {
    challengeId: 'challenge_003',
    name: 'Perfect Execution',
    description: 'Complete 10 perfect dodges in a row',
    objectives: [
      {
        id: 'perfect_dodge',
        description: '10 perfect dodges in a row',
        target: 10,
        current: 0,
        type: 'combo',
      },
    ],
    rewards: {
      upgradeId: 'combat_perfect_mastery',
      resources: { currency: 2000, resonance: 10 },
    },
    difficulty: 'legendary',
  },
];

/**
 * NEW ADVANCED UPGRADE SYSTEMS
 */

// DIMENSIONAL UPGRADES
export const DIMENSIONAL_UPGRADES: Upgrade[] = [
  {
    id: 'dimensional_001',
    name: 'Dimensional Rift Mastery',
    description: 'Increases dimensional power and rift effectiveness',
    category: UpgradeCategory.DIMENSIONAL,
    rarity: UpgradeRarity.LEGENDARY,
    level: 0,
    maxLevel: 5,
    unlocked: false,
    cost: { currency: 2000, dimensionalCore: 5 },
    prerequisites: [{ storyProgress: 50 }],
    effects: {
      statModifications: [{
        stat: 'dimensionalPower',
        type: 'percentage',
        value: 20,
        scaling: 'linear',
      }],
    },
    tags: ['dimensional', 'rift'],
  },
];

// VOID UPGRADES
export const VOID_UPGRADES: Upgrade[] = [
  {
    id: 'void_001',
    name: 'Void Resistance',
    description: 'Increases resistance to void damage',
    category: UpgradeCategory.VOID,
    rarity: UpgradeRarity.EPIC,
    level: 0,
    maxLevel: 10,
    unlocked: false,
    cost: { currency: 1500, voidEssence: 3 },
    effects: {
      statModifications: [{
        stat: 'voidResistance',
        type: 'percentage',
        value: 10,
        scaling: 'linear',
      }],
    },
    tags: ['void', 'defense'],
  },
];

// NEXUS UPGRADES
export const NEXUS_UPGRADES: Upgrade[] = [
  {
    id: 'nexus_001',
    name: 'Nexus Power',
    description: 'Increases nexus power and haven effectiveness',
    category: UpgradeCategory.NEXUS,
    rarity: UpgradeRarity.RARE,
    level: 0,
    maxLevel: 10,
    unlocked: false,
    cost: { currency: 1000, nexusFragment: 2 },
    effects: {
      statModifications: [{
        stat: 'nexusPower',
        type: 'percentage',
        value: 15,
        scaling: 'linear',
      }],
    },
    tags: ['nexus', 'haven'],
  },
];

// ECHO UPGRADES
export const ECHO_UPGRADES: Upgrade[] = [
  {
    id: 'echo_001',
    name: 'Echo Resonance',
    description: 'Increases echo power and memory effectiveness',
    category: UpgradeCategory.ECHO,
    rarity: UpgradeRarity.RARE,
    level: 0,
    maxLevel: 10,
    unlocked: false,
    cost: { currency: 1000, echoResonance: 2 },
    characterSpecific: ['KAI-JAX'],
    effects: {
      statModifications: [{
        stat: 'echoPower',
        type: 'percentage',
        value: 15,
        scaling: 'linear',
      }],
    },
    tags: ['echo', 'memory', 'kai-jax'],
  },
];

// PARADOX UPGRADES
export const PARADOX_UPGRADES: Upgrade[] = [
  {
    id: 'paradox_001',
    name: 'Paradox Resistance',
    description: 'Increases resistance to paradox effects',
    category: UpgradeCategory.PARADOX,
    rarity: UpgradeRarity.EPIC,
    level: 0,
    maxLevel: 10,
    unlocked: false,
    cost: { currency: 1500, paradoxEnergy: 3 },
    characterSpecific: ['SILVER'],
    effects: {
      statModifications: [{
        stat: 'paradoxResistance',
        type: 'percentage',
        value: 10,
        scaling: 'linear',
      }],
    },
    tags: ['paradox', 'time', 'silver'],
  },
];

// AURA UPGRADES
export const AURA_UPGRADES: Upgrade[] = [
  {
    id: 'aura_001',
    name: 'Combat Aura',
    description: 'Passive aura that enhances combat abilities',
    category: UpgradeCategory.AURA,
    rarity: UpgradeRarity.RARE,
    level: 0,
    maxLevel: 5,
    unlocked: false,
    cost: { currency: 1200 },
    effects: {
      statModifications: [{
        stat: 'auraStrength',
        type: 'percentage',
        value: 10,
        scaling: 'linear',
      }],
      passiveEffects: ['Combat aura increases damage by 5% per level'],
    },
    tags: ['aura', 'passive'],
  },
];

// ENHANCEMENT UPGRADES
export const ENHANCEMENT_UPGRADES: Upgrade[] = [
  {
    id: 'enhancement_001',
    name: 'Weapon Enhancement',
    description: 'Enhances weapon effectiveness',
    category: UpgradeCategory.ENHANCEMENT,
    rarity: UpgradeRarity.UNCOMMON,
    level: 0,
    maxLevel: 10,
    unlocked: false,
    cost: { currency: 800 },
    effects: {
      statModifications: [{
        stat: 'attack',
        type: 'percentage',
        value: 8,
        scaling: 'linear',
      }],
    },
    tags: ['enhancement', 'weapon'],
  },
];

// AWAKENING UPGRADES
export const AWAKENING_UPGRADES: Upgrade[] = [
  {
    id: 'awakening_001',
    name: 'First Awakening',
    description: 'Awaken hidden potential',
    category: UpgradeCategory.AWAKENING,
    rarity: UpgradeRarity.LEGENDARY,
    level: 0,
    maxLevel: 3,
    unlocked: false,
    cost: { currency: 5000, awakeningCrystal: 10 },
    prerequisites: [{ minLevel: 50 }],
    effects: {
      statModifications: [{
        stat: 'awakeningLevel',
        type: 'flat',
        value: 1,
        scaling: 'linear',
      }],
      abilityUnlocks: [{
        abilityId: 'awakening_form',
        abilityName: 'Awakening Form',
        description: 'Transform into awakened state',
      }],
    },
    tags: ['awakening', 'transformation'],
  },
];

// TRANSCENDENCE UPGRADES
export const TRANSCENDENCE_UPGRADES: Upgrade[] = [
  {
    id: 'transcendence_001',
    name: 'First Transcendence',
    description: 'Transcend beyond normal limits',
    category: UpgradeCategory.TRANSCENDENCE,
    rarity: UpgradeRarity.TRANSCENDENT,
    level: 0,
    maxLevel: 1,
    unlocked: false,
    cost: { currency: 10000, transcendenceShard: 20 },
    prerequisites: [
      { minLevel: 99 },
      { maxedUpgradeCount: 50 },
      { prestigeLevel: 5 },
    ],
    effects: {
      statModifications: [{
        stat: 'transcendenceLevel',
        type: 'flat',
        value: 1,
        scaling: 'linear',
      }],
      abilityUnlocks: [{
        abilityId: 'transcendent_form',
        abilityName: 'Transcendent Form',
        description: 'Achieve transcendent state',
      }],
    },
    tags: ['transcendence', 'ultimate'],
  },
];

/**
 * MASTERY DEFINITIONS
 */
export const MASTERY_DEFINITIONS: UpgradeMastery[] = [
  {
    masteryId: 'combat_mastery',
    name: 'Combat Mastery',
    description: 'Master all combat upgrades',
    category: UpgradeCategory.COMBAT,
    maxLevel: 10,
    requirements: {
      upgradesUnlocked: 7,
      upgradesMaxed: 5,
      totalLevels: 50,
    },
    bonuses: [{
      stat: 'attack',
      type: 'percentage',
      value: 5,
      scaling: 'linear',
    }],
  },
  {
    masteryId: 'traversal_mastery',
    name: 'Traversal Mastery',
    description: 'Master all traversal upgrades',
    category: UpgradeCategory.TRAVERSAL,
    maxLevel: 10,
    requirements: {
      upgradesUnlocked: 4,
      upgradesMaxed: 3,
      totalLevels: 30,
    },
    bonuses: [{
      stat: 'speed',
      type: 'percentage',
      value: 5,
      scaling: 'linear',
    }],
  },
];

/**
 * PRESTIGE DEFINITIONS
 */
export const PRESTIGE_DEFINITIONS: UpgradePrestige[] = [
  {
    prestigeId: 'prestige_001',
    name: 'First Prestige',
    description: 'Reset for permanent bonuses',
    requirements: {
      totalUpgradesMaxed: 20,
      masteryLevels: 5,
      totalResourcesSpent: { currency: 100000 },
    },
    permanentBonuses: [{
      stat: 'attack',
      type: 'percentage',
      value: 10,
      scaling: 'linear',
    }],
    prestigeMultiplier: 1.5,
  },
];

/**
 * ADVANCED UPGRADE SYSTEMS
 */
export const ADVANCED_UPGRADE_SYSTEMS: UpgradeSystem[] = [
  {
    id: 'mastery_system',
    name: 'Mastery System',
    description: 'Master upgrade categories for permanent bonuses',
    category: UpgradeCategory.MASTERY,
    upgrades: MASTERY_UPGRADES,
    mastery: MASTERY_DEFINITIONS[0],
  },
  {
    id: 'prestige_system',
    name: 'Prestige System',
    description: 'Reset and gain permanent multipliers',
    category: UpgradeCategory.PRESTIGE,
    upgrades: PRESTIGE_UPGRADES,
    prestige: PRESTIGE_DEFINITIONS[0],
  },
  {
    id: 'dimensional_system',
    name: 'Dimensional Power',
    description: 'Dimensional and rift upgrades',
    category: UpgradeCategory.DIMENSIONAL,
    upgrades: DIMENSIONAL_UPGRADES,
  },
  {
    id: 'void_system',
    name: 'Void Resistance',
    description: 'Void-based upgrades',
    category: UpgradeCategory.VOID,
    upgrades: VOID_UPGRADES,
  },
  {
    id: 'nexus_system',
    name: 'Nexus Power',
    description: 'Nexus and haven upgrades',
    category: UpgradeCategory.NEXUS,
    upgrades: NEXUS_UPGRADES,
  },
  {
    id: 'echo_system',
    name: 'Echo Resonance',
    description: 'Echo and memory upgrades',
    category: UpgradeCategory.ECHO,
    upgrades: ECHO_UPGRADES,
  },
  {
    id: 'paradox_system',
    name: 'Paradox Mastery',
    description: 'Paradox and time upgrades',
    category: UpgradeCategory.PARADOX,
    upgrades: PARADOX_UPGRADES,
  },
  {
    id: 'aura_system',
    name: 'Aura System',
    description: 'Aura and passive effect upgrades',
    category: UpgradeCategory.AURA,
    upgrades: AURA_UPGRADES,
  },
  {
    id: 'enhancement_system',
    name: 'Enhancement System',
    description: 'Weapon and gear enhancements',
    category: UpgradeCategory.ENHANCEMENT,
    upgrades: ENHANCEMENT_UPGRADES,
  },
  {
    id: 'awakening_system',
    name: 'Awakening System',
    description: 'Awakening transformations',
    category: UpgradeCategory.AWAKENING,
    upgrades: AWAKENING_UPGRADES,
  },
  {
    id: 'transcendence_system',
    name: 'Transcendence System',
    description: 'Transcend beyond all limits',
    category: UpgradeCategory.TRANSCENDENCE,
    upgrades: TRANSCENDENCE_UPGRADES,
  },
];

// Export all advanced data
export const ALL_ADVANCED_UPGRADES: Upgrade[] = [
  ...MASTERY_UPGRADES,
  ...PRESTIGE_UPGRADES,
  ...DIMENSIONAL_UPGRADES,
  ...VOID_UPGRADES,
  ...NEXUS_UPGRADES,
  ...ECHO_UPGRADES,
  ...PARADOX_UPGRADES,
  ...AURA_UPGRADES,
  ...ENHANCEMENT_UPGRADES,
  ...AWAKENING_UPGRADES,
  ...TRANSCENDENCE_UPGRADES,
];

// Re-export quantum upgrades
export * from './quantum_upgrade_data';

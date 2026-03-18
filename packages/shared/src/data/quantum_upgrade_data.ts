/**
 * QUANTUM UPGRADE DATA - BEYOND BEYOND LEGENDARY
 * 
 * Ultra-advanced upgrade systems including:
 * - Quantum Upgrades
 * - Multiverse Upgrades
 * - Temporal Paradox Upgrades
 * - AI-Driven Upgrades
 * - Reality-Bending Upgrades
 * - Infinite Scaling Upgrades
 */

import type {
  Upgrade,
  UpgradeSystem,
  StatModification,
  ResourceCost,
} from '../types/upgrade.types';
import {
  UpgradeCategory,
  UpgradeRarity,
} from '../types/upgrade.types';

/**
 * QUANTUM UPGRADES - Beyond physical limits
 */
export const QUANTUM_UPGRADES: Upgrade[] = [
  {
    id: 'quantum_001',
    name: 'Quantum Entanglement',
    description: 'Upgrades exist in superposition - all upgrades active simultaneously',
    category: UpgradeCategory.TRANSCENDENCE,
    rarity: UpgradeRarity.TRANSCENDENT,
    level: 0,
    maxLevel: 1,
    unlocked: false,
    cost: { currency: 100000, transcendenceShard: 100, quantumEssence: 50 },
    prerequisites: [
      { transcendenceLevel: 10 },
      { maxedUpgradeCount: 100 },
    ],
    effects: {
      statModifications: [{
        stat: 'attack',
        type: 'exponential',
        value: 1000,
        scaling: 'exponential',
      }],
      passiveEffects: ['All upgrades exist in quantum superposition', 'Infinite scaling potential'],
    },
    tags: ['quantum', 'transcendent', 'infinite'],
  },
];

/**
 * MULTIVERSE UPGRADES - Access parallel realities
 */
export const MULTIVERSE_UPGRADES: Upgrade[] = [
  {
    id: 'multiverse_001',
    name: 'Multiverse Convergence',
    description: 'Access upgrades from parallel universes',
    category: UpgradeCategory.DIMENSIONAL,
    rarity: UpgradeRarity.VOID,
    level: 0,
    maxLevel: 5,
    unlocked: false,
    cost: { currency: 50000, dimensionalCore: 50, multiverseFragment: 25 },
    prerequisites: [
      { storyProgress: 100 },
      { prestigeLevel: 10 },
    ],
    effects: {
      statModifications: [{
        stat: 'dimensionalPower',
        type: 'exponential',
        value: 500,
        scaling: 'exponential',
      }],
      passiveEffects: ['Access parallel universe upgrades', 'Multiverse stat stacking'],
    },
    tags: ['multiverse', 'dimensional', 'void'],
  },
];

/**
 * TEMPORAL PARADOX UPGRADES - Break time itself
 */
export const TEMPORAL_PARADOX_UPGRADES: Upgrade[] = [
  {
    id: 'temporal_paradox_001',
    name: 'Temporal Paradox Mastery',
    description: 'Upgrades exist in all timelines simultaneously',
    category: UpgradeCategory.PARADOX,
    rarity: UpgradeRarity.TRANSCENDENT,
    level: 0,
    maxLevel: 1,
    unlocked: false,
    cost: { currency: 75000, paradoxEnergy: 100, temporalCore: 50 },
    prerequisites: [
      { upgradeId: 'time_002', minUpgradeLevel: 3 },
      { prestigeLevel: 5 },
    ],
    effects: {
      statModifications: [{
        stat: 'paradoxResistance',
        type: 'exponential',
        value: 1000,
        scaling: 'exponential',
      }],
      passiveEffects: ['Upgrades active in all timelines', 'Temporal stat multiplication'],
    },
    tags: ['temporal', 'paradox', 'transcendent'],
  },
];

/**
 * AI-DRIVEN UPGRADES - Self-evolving upgrades
 */
export const AI_UPGRADES: Upgrade[] = [
  {
    id: 'ai_001',
    name: 'Neural Network Upgrade',
    description: 'Upgrades that evolve and adapt based on gameplay',
    category: UpgradeCategory.ENHANCEMENT,
    rarity: UpgradeRarity.MYTHIC,
    level: 0,
    maxLevel: 10,
    unlocked: false,
    cost: { currency: 25000, aiCore: 10 },
    prerequisites: [
      { minLevel: 75 },
      { maxedUpgradeCount: 50 },
    ],
    effects: {
      statModifications: [{
        stat: 'attack',
        type: 'exponential',
        value: 50,
        scaling: 'exponential',
      }],
      passiveEffects: ['Upgrades adapt to playstyle', 'Self-optimizing stat distribution'],
    },
    tags: ['ai', 'adaptive', 'mythic'],
  },
];

/**
 * REALITY-BENDING UPGRADES - Break game rules
 */
export const REALITY_UPGRADES: Upgrade[] = [
  {
    id: 'reality_001',
    name: 'Reality Override',
    description: 'Break fundamental game rules - infinite resources, instant cooldowns',
    category: UpgradeCategory.TRANSCENDENCE,
    rarity: UpgradeRarity.VOID,
    level: 0,
    maxLevel: 1,
    unlocked: false,
    cost: { currency: 999999, voidEssence: 999, realityShard: 1 },
    prerequisites: [
      { prestigeLevel: 50 },
      { maxedUpgradeCount: 200 },
      { masteryLevel: 100 },
    ],
    effects: {
      passiveEffects: [
        'Infinite resource generation',
        'Zero cooldown on all abilities',
        'Break damage caps',
        'Unlimited upgrade levels',
      ],
    },
    tags: ['reality', 'void', 'cheat'],
  },
];

/**
 * INFINITE SCALING UPGRADES - No limits
 */
export const INFINITE_UPGRADES: Upgrade[] = [
  {
    id: 'infinite_001',
    name: 'Infinite Potential',
    description: 'Upgrades with no maximum level - scale infinitely',
    category: UpgradeCategory.TRANSCENDENCE,
    rarity: UpgradeRarity.TRANSCENDENT,
    level: 0,
    maxLevel: Infinity,
    unlocked: false,
    cost: { currency: 1000 },
    costScaling: {
      baseCost: 1000,
      scalingType: 'exponential',
      scalingFactor: 1.1,
    },
    prerequisites: [
      { prestigeLevel: 25 },
    ],
    effects: {
      statModifications: [{
        stat: 'attack',
        type: 'exponential',
        value: 10,
        scaling: 'exponential',
      }],
      passiveEffects: ['Infinite level scaling', 'Exponential stat growth'],
    },
    tags: ['infinite', 'transcendent', 'scaling'],
  },
];

/**
 * ULTRA-ADVANCED UPGRADE SYSTEMS
 */
export const QUANTUM_UPGRADE_SYSTEMS: UpgradeSystem[] = [
  {
    id: 'quantum_system',
    name: 'Quantum Upgrade System',
    description: 'Upgrades that exist in quantum superposition',
    category: UpgradeCategory.TRANSCENDENCE,
    upgrades: QUANTUM_UPGRADES,
  },
  {
    id: 'multiverse_system',
    name: 'Multiverse Upgrade System',
    description: 'Access upgrades from parallel universes',
    category: UpgradeCategory.DIMENSIONAL,
    upgrades: MULTIVERSE_UPGRADES,
  },
  {
    id: 'temporal_paradox_system',
    name: 'Temporal Paradox System',
    description: 'Break time itself with paradox upgrades',
    category: UpgradeCategory.PARADOX,
    upgrades: TEMPORAL_PARADOX_UPGRADES,
  },
  {
    id: 'ai_system',
    name: 'AI-Driven Upgrade System',
    description: 'Self-evolving adaptive upgrades',
    category: UpgradeCategory.ENHANCEMENT,
    upgrades: AI_UPGRADES,
  },
  {
    id: 'reality_system',
    name: 'Reality-Bending System',
    description: 'Break fundamental game rules',
    category: UpgradeCategory.TRANSCENDENCE,
    upgrades: REALITY_UPGRADES,
  },
  {
    id: 'infinite_system',
    name: 'Infinite Scaling System',
    description: 'Upgrades with infinite potential',
    category: UpgradeCategory.TRANSCENDENCE,
    upgrades: INFINITE_UPGRADES,
  },
];

export const ALL_QUANTUM_UPGRADES: Upgrade[] = [
  ...QUANTUM_UPGRADES,
  ...MULTIVERSE_UPGRADES,
  ...TEMPORAL_PARADOX_UPGRADES,
  ...AI_UPGRADES,
  ...REALITY_UPGRADES,
  ...INFINITE_UPGRADES,
];

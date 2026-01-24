/**
 * UNIVERSAL LEGEND UPGRADE DATA
 * 
 * Comprehensive upgrade definitions for all game systems
 * Organized by category with proper prerequisites and scaling
 */

import type { 
  Upgrade, 
  UpgradeSystem, 
  StatModification,
  AbilityUnlock,
  ResourceCost,
  CostScaling,
  UpgradePrerequisite
} from '../types/upgrade.types';
import {
  UpgradeCategory,
  UpgradeRarity,
} from '../types/upgrade.types';

// Re-export advanced data
export * from './advanced_upgrade_data';
export * from './quantum_upgrade_data';

/**
 * COMBAT UPGRADES
 */
export const COMBAT_UPGRADES: Upgrade[] = [
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
    tags: ['damage', 'offense'],
  },
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
    prerequisites: [{ upgradeId: 'combat_001', minUpgradeLevel: 3 }],
    effects: {
      statModifications: [{
        stat: 'dodgeChance',
        type: 'percentage',
        value: 5,
        scaling: 'linear',
      }],
    },
    tags: ['defense', 'dodge', 'reflex'],
  },
  {
    id: 'combat_003',
    name: 'Perfect Parry Mastery',
    description: 'Increases perfect parry window and stun duration',
    category: UpgradeCategory.COMBAT,
    rarity: UpgradeRarity.UNCOMMON,
    level: 0,
    maxLevel: 5,
    unlocked: false,
    cost: { currency: 200 },
    prerequisites: [{ upgradeId: 'combat_001', minUpgradeLevel: 3 }],
    effects: {
      statModifications: [{
        stat: 'parryWindow',
        type: 'flat',
        value: 0.05,
        scaling: 'linear',
      }],
    },
    tags: ['defense', 'parry', 'resonance'],
  },
  {
    id: 'combat_004',
    name: 'Combo Multiplier',
    description: 'Increases combo damage multiplier by 0.1x per level',
    category: UpgradeCategory.COMBAT,
    rarity: UpgradeRarity.RARE,
    level: 0,
    maxLevel: 5,
    unlocked: false,
    cost: { currency: 300 },
    prerequisites: [{ upgradeId: 'combat_001', minUpgradeLevel: 5 }],
    effects: {
      statModifications: [{
        stat: 'comboMultiplier',
        type: 'multiplier',
        value: 0.1,
        scaling: 'linear',
      }],
    },
    tags: ['damage', 'combo', 'offense'],
  },
  {
    id: 'combat_005',
    name: 'Critical Strike',
    description: 'Increases critical hit chance and damage',
    category: UpgradeCategory.COMBAT,
    rarity: UpgradeRarity.RARE,
    level: 0,
    maxLevel: 10,
    unlocked: false,
    cost: { currency: 250 },
    prerequisites: [{ upgradeId: 'combat_001', minUpgradeLevel: 5 }],
    effects: {
      statModifications: [
        {
          stat: 'critChance',
          type: 'percentage',
          value: 2,
          scaling: 'linear',
        },
        {
          stat: 'critDamage',
          type: 'percentage',
          value: 5,
          scaling: 'linear',
        },
      ],
    },
    tags: ['damage', 'crit', 'offense'],
  },
  {
    id: 'combat_006',
    name: 'Flow State',
    description: 'Reduces special ability cooldown by 5% per level',
    category: UpgradeCategory.COMBAT,
    rarity: UpgradeRarity.EPIC,
    level: 0,
    maxLevel: 5,
    unlocked: false,
    cost: { currency: 500, chaosEnergy: 10 },
    prerequisites: [
      { upgradeId: 'combat_004', minUpgradeLevel: 3 },
      { minLevel: 15 },
    ],
    effects: {
      statModifications: [{
        stat: 'specialCooldown',
        type: 'percentage',
        value: -5, // Negative = reduction
        scaling: 'linear',
      }],
    },
    tags: ['cooldown', 'abilities', 'epic'],
  },
  {
    id: 'combat_007',
    name: 'Ultimate Charge Rate',
    description: 'Increases ultimate meter charge rate by 10% per level',
    category: UpgradeCategory.COMBAT,
    rarity: UpgradeRarity.EPIC,
    level: 0,
    maxLevel: 5,
    unlocked: false,
    cost: { currency: 500, resonance: 5 },
    prerequisites: [
      { upgradeId: 'combat_005', minUpgradeLevel: 5 },
      { minLevel: 20 },
    ],
    effects: {
      statModifications: [{
        stat: 'ultimateCharge',
        type: 'percentage',
        value: 10,
        scaling: 'linear',
      }],
    },
    tags: ['ultimate', 'meter', 'epic'],
  },
];

/**
 * TRAVERSAL UPGRADES
 */
export const TRAVERSAL_UPGRADES: Upgrade[] = [
  {
    id: 'traversal_001',
    name: 'Speed Boost',
    description: 'Increases movement speed by 5% per level',
    category: UpgradeCategory.TRAVERSAL,
    rarity: UpgradeRarity.COMMON,
    level: 0,
    maxLevel: 10,
    unlocked: false,
    cost: { currency: 100 },
    effects: {
      statModifications: [{
        stat: 'speed',
        type: 'percentage',
        value: 5,
        scaling: 'linear',
      }],
    },
    tags: ['movement', 'speed'],
  },
  {
    id: 'traversal_002',
    name: 'Air Mobility',
    description: 'Increases air speed and jump height',
    category: UpgradeCategory.TRAVERSAL,
    rarity: UpgradeRarity.UNCOMMON,
    level: 0,
    maxLevel: 5,
    unlocked: false,
    cost: { currency: 200 },
    prerequisites: [{ upgradeId: 'traversal_001', minUpgradeLevel: 3 }],
    effects: {
      statModifications: [{
        stat: 'speed',
        type: 'percentage',
        value: 8,
        scaling: 'linear',
      }],
    },
    tags: ['movement', 'air', 'jump'],
  },
  {
    id: 'traversal_003',
    name: 'Wall Run Mastery',
    description: 'Unlocks extended wall running and wall jump abilities',
    category: UpgradeCategory.TRAVERSAL,
    rarity: UpgradeRarity.RARE,
    level: 0,
    maxLevel: 3,
    unlocked: false,
    cost: { currency: 300 },
    prerequisites: [{ upgradeId: 'traversal_002', minUpgradeLevel: 2 }],
    effects: {
      abilityUnlocks: [{
        abilityId: 'wall_run_extended',
        abilityName: 'Extended Wall Run',
        description: 'Can wall run for extended periods',
      }],
    },
    tags: ['wall_run', 'traversal', 'rare'],
  },
  {
    id: 'traversal_004',
    name: 'Momentum Conservation',
    description: 'Maintains momentum through air dashes and transitions',
    category: UpgradeCategory.TRAVERSAL,
    rarity: UpgradeRarity.EPIC,
    level: 0,
    maxLevel: 3,
    unlocked: false,
    cost: { currency: 500 },
    prerequisites: [
      { upgradeId: 'traversal_003', minUpgradeLevel: 2 },
      { minLevel: 15 },
    ],
    effects: {
      passiveEffects: ['Momentum is preserved through air dashes', 'Faster traversal speed'],
    },
    tags: ['momentum', 'dash', 'epic'],
  },
];

/**
 * SPECIAL ABILITY UPGRADES
 */
export const SPECIAL_UPGRADES: Upgrade[] = [
  {
    id: 'special_001',
    name: 'Special Power Boost',
    description: 'Increases special ability damage by 15% per level',
    category: UpgradeCategory.SPECIAL,
    rarity: UpgradeRarity.UNCOMMON,
    level: 0,
    maxLevel: 5,
    unlocked: false,
    cost: { currency: 200, chaosEnergy: 5 },
    effects: {
      statModifications: [{
        stat: 'attack',
        type: 'percentage',
        value: 15,
        scaling: 'linear',
      }],
    },
    tags: ['special', 'abilities', 'damage'],
  },
  {
    id: 'special_002',
    name: 'Ability Range Extension',
    description: 'Increases range of special abilities',
    category: UpgradeCategory.SPECIAL,
    rarity: UpgradeRarity.RARE,
    level: 0,
    maxLevel: 3,
    unlocked: false,
    cost: { currency: 300, chaosEnergy: 10 },
    prerequisites: [{ upgradeId: 'special_001', minUpgradeLevel: 2 }],
    effects: {
      passiveEffects: ['Special abilities have 25% increased range'],
    },
    tags: ['special', 'range', 'rare'],
  },
  {
    id: 'special_003',
    name: 'Ability Combo Chains',
    description: 'Allows chaining special abilities together',
    category: UpgradeCategory.SPECIAL,
    rarity: UpgradeRarity.EPIC,
    level: 0,
    maxLevel: 3,
    unlocked: false,
    cost: { currency: 500, chaosEnergy: 20 },
    prerequisites: [
      { upgradeId: 'special_002', minUpgradeLevel: 2 },
      { minLevel: 20 },
    ],
    effects: {
      abilityUnlocks: [{
        abilityId: 'ability_combo_chain',
        abilityName: 'Ability Combo Chain',
        description: 'Chain special abilities for increased damage',
      }],
    },
    tags: ['special', 'combo', 'epic'],
  },
];

/**
 * ULTIMATE UPGRADES
 */
export const ULTIMATE_UPGRADES: Upgrade[] = [
  {
    id: 'ultimate_001',
    name: 'Ultimate Power',
    description: 'Increases ultimate ability damage by 20% per level',
    category: UpgradeCategory.ULTIMATE,
    rarity: UpgradeRarity.RARE,
    level: 0,
    maxLevel: 5,
    unlocked: false,
    cost: { currency: 400, resonance: 10 },
    prerequisites: [{ minLevel: 10 }],
    effects: {
      statModifications: [{
        stat: 'attack',
        type: 'percentage',
        value: 20,
        scaling: 'linear',
      }],
    },
    tags: ['ultimate', 'damage', 'rare'],
  },
  {
    id: 'ultimate_002',
    name: 'Ultimate Duration',
    description: 'Increases ultimate ability duration',
    category: UpgradeCategory.ULTIMATE,
    rarity: UpgradeRarity.EPIC,
    level: 0,
    maxLevel: 3,
    unlocked: false,
    cost: { currency: 600, resonance: 15 },
    prerequisites: [
      { upgradeId: 'ultimate_001', minUpgradeLevel: 3 },
      { minLevel: 20 },
    ],
    effects: {
      passiveEffects: ['Ultimate abilities last 25% longer'],
    },
    tags: ['ultimate', 'duration', 'epic'],
  },
  {
    id: 'ultimate_003',
    name: 'Team Ultimate Synergy',
    description: 'Unlocks enhanced team ultimate abilities',
    category: UpgradeCategory.ULTIMATE,
    rarity: UpgradeRarity.LEGENDARY,
    level: 0,
    maxLevel: 1,
    unlocked: false,
    cost: { currency: 1000, resonance: 50, chaosEnergy: 30 },
    prerequisites: [
      { upgradeId: 'ultimate_002', minUpgradeLevel: 3 },
      { minLevel: 30 },
      { storyProgress: 50 },
    ],
    effects: {
      abilityUnlocks: [{
        abilityId: 'team_ultimate_synergy',
        abilityName: 'Team Ultimate Synergy',
        description: 'Team ultimates deal 50% more damage and have additional effects',
      }],
    },
    tags: ['ultimate', 'team', 'legendary'],
  },
];

/**
 * STAT UPGRADES
 */
export const STAT_UPGRADES: Upgrade[] = [
  {
    id: 'stat_001',
    name: 'Health Boost',
    description: 'Increases maximum health by 50 per level',
    category: UpgradeCategory.STATS,
    rarity: UpgradeRarity.COMMON,
    level: 0,
    maxLevel: 20,
    unlocked: false,
    cost: { currency: 150 },
    effects: {
      statModifications: [{
        stat: 'health',
        type: 'flat',
        value: 50,
        scaling: 'linear',
      }],
    },
    tags: ['health', 'survivability'],
  },
  {
    id: 'stat_002',
    name: 'Defense Boost',
    description: 'Increases defense by 5% per level',
    category: UpgradeCategory.STATS,
    rarity: UpgradeRarity.COMMON,
    level: 0,
    maxLevel: 10,
    unlocked: false,
    cost: { currency: 150 },
    effects: {
      statModifications: [{
        stat: 'defense',
        type: 'percentage',
        value: 5,
        scaling: 'linear',
      }],
    },
    tags: ['defense', 'survivability'],
  },
  {
    id: 'stat_003',
    name: 'Resonance Mastery',
    description: 'Increases resonance generation and capacity',
    category: UpgradeCategory.STATS,
    rarity: UpgradeRarity.UNCOMMON,
    level: 0,
    maxLevel: 10,
    unlocked: false,
    cost: { currency: 200, resonance: 5 },
    prerequisites: [{ minLevel: 5 }],
    effects: {
      statModifications: [{
        stat: 'resonance',
        type: 'percentage',
        value: 10,
        scaling: 'linear',
      }],
    },
    tags: ['resonance', 'meter'],
  },
  {
    id: 'stat_004',
    name: 'Reflex Mastery',
    description: 'Increases reflex generation and dodge effectiveness',
    category: UpgradeCategory.STATS,
    rarity: UpgradeRarity.UNCOMMON,
    level: 0,
    maxLevel: 10,
    unlocked: false,
    cost: { currency: 200, reflex: 5 },
    prerequisites: [{ minLevel: 5 }],
    effects: {
      statModifications: [{
        stat: 'reflex',
        type: 'percentage',
        value: 10,
        scaling: 'linear',
      }],
    },
    tags: ['reflex', 'dodge'],
  },
];

/**
 * CHAOS ENGINEERING UPGRADES
 */
export const CHAOS_UPGRADES: Upgrade[] = [
  {
    id: 'chaos_001',
    name: 'Chaos Damage Boost',
    description: 'Adds random damage multiplier (0.8x - 1.5x)',
    category: UpgradeCategory.CHAOS,
    rarity: UpgradeRarity.RARE,
    level: 0,
    maxLevel: 5,
    unlocked: false,
    cost: { currency: 300, chaosEnergy: 10 },
    effects: {
      passiveEffects: ['Random damage multiplier between 0.8x and 1.5x'],
    },
    tags: ['chaos', 'damage', 'random'],
  },
  {
    id: 'chaos_002',
    name: 'Chaos Surge',
    description: 'Chance to trigger chaos effects on hit',
    category: UpgradeCategory.CHAOS,
    rarity: UpgradeRarity.EPIC,
    level: 0,
    maxLevel: 3,
    unlocked: false,
    cost: { currency: 500, chaosEnergy: 20 },
    prerequisites: [{ upgradeId: 'chaos_001', minUpgradeLevel: 3 }],
    effects: {
      passiveEffects: ['10% chance per level to trigger chaos effects'],
    },
    tags: ['chaos', 'effects', 'epic'],
  },
];

/**
 * TECH FUSION UPGRADES
 */
export const TECH_UPGRADES: Upgrade[] = [
  {
    id: 'tech_001',
    name: 'Speed Enhancement',
    description: 'Increases movement speed by 8% per level',
    category: UpgradeCategory.TECH,
    rarity: UpgradeRarity.UNCOMMON,
    level: 0,
    maxLevel: 10,
    unlocked: false,
    cost: { currency: 150 },
    effects: {
      statModifications: [{
        stat: 'speed',
        type: 'percentage',
        value: 8,
        scaling: 'linear',
      }],
    },
    tags: ['tech', 'speed'],
  },
  {
    id: 'tech_002',
    name: 'Tech Armor',
    description: 'Reduces incoming damage by 5% per level',
    category: UpgradeCategory.TECH,
    rarity: UpgradeRarity.RARE,
    level: 0,
    maxLevel: 5,
    unlocked: false,
    cost: { currency: 300 },
    prerequisites: [{ upgradeId: 'tech_001', minUpgradeLevel: 5 }],
    effects: {
      statModifications: [{
        stat: 'defense',
        type: 'percentage',
        value: 5,
        scaling: 'linear',
      }],
    },
    tags: ['tech', 'defense'],
  },
];

/**
 * TRIFORCE SPELLCRAFT UPGRADES
 */
export const TRIFORCE_UPGRADES: Upgrade[] = [
  {
    id: 'triforce_001',
    name: 'Magic Power',
    description: 'Increases magic damage by 12% per level',
    category: UpgradeCategory.TRIFORCE,
    rarity: UpgradeRarity.UNCOMMON,
    level: 0,
    maxLevel: 7,
    unlocked: false,
    cost: { currency: 200 },
    effects: {
      statModifications: [{
        stat: 'attack',
        type: 'percentage',
        value: 12,
        scaling: 'linear',
      }],
    },
    tags: ['triforce', 'magic', 'damage'],
  },
  {
    id: 'triforce_002',
    name: 'Spell Efficiency',
    description: 'Reduces magic ability cooldown',
    category: UpgradeCategory.TRIFORCE,
    rarity: UpgradeRarity.RARE,
    level: 0,
    maxLevel: 5,
    unlocked: false,
    cost: { currency: 300 },
    prerequisites: [{ upgradeId: 'triforce_001', minUpgradeLevel: 3 }],
    effects: {
      statModifications: [{
        stat: 'specialCooldown',
        type: 'percentage',
        value: -5,
        scaling: 'linear',
      }],
    },
    tags: ['triforce', 'cooldown'],
  },
];

/**
 * STARBORN AWAKENING UPGRADES
 */
export const STARBORN_UPGRADES: Upgrade[] = [
  {
    id: 'starborn_001',
    name: 'Cosmic Energy',
    description: 'Unlocks cosmic abilities and increases all stats',
    category: UpgradeCategory.STARBORN,
    rarity: UpgradeRarity.LEGENDARY,
    level: 0,
    maxLevel: 3,
    unlocked: false,
    cost: { currency: 300 },
    prerequisites: [{ minLevel: 25 }],
    effects: {
      statModifications: [
        { stat: 'health', type: 'percentage', value: 10, scaling: 'linear' },
        { stat: 'attack', type: 'percentage', value: 10, scaling: 'linear' },
        { stat: 'defense', type: 'percentage', value: 10, scaling: 'linear' },
        { stat: 'speed', type: 'percentage', value: 10, scaling: 'linear' },
      ],
      abilityUnlocks: [{
        abilityId: 'cosmic_abilities',
        abilityName: 'Cosmic Abilities',
        description: 'Unlocks cosmic-powered abilities',
      }],
    },
    tags: ['starborn', 'cosmic', 'legendary'],
  },
];

/**
 * MEMORY UPGRADES (Kai-Jax specific)
 */
export const MEMORY_UPGRADES: Upgrade[] = [
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
    tags: ['memory', 'kai-jax'],
  },
  {
    id: 'memory_002',
    name: 'Convergence Echo Enhancement',
    description: 'Enhances Convergence Echo ultimate ability',
    category: UpgradeCategory.MEMORY,
    rarity: UpgradeRarity.LEGENDARY,
    level: 0,
    maxLevel: 3,
    unlocked: false,
    cost: { currency: 600, memoryShards: 25, resonance: 20 },
    prerequisites: [
      { upgradeId: 'memory_001', minUpgradeLevel: 3 },
      { characterUnlock: 'KAI-JAX' },
    ],
    characterSpecific: ['KAI-JAX'],
    effects: {
      abilityUnlocks: [{
        abilityId: 'convergence_echo_enhanced',
        abilityName: 'Enhanced Convergence Echo',
        description: 'Convergence Echo can replay last 10 seconds and stack damage',
      }],
    },
    tags: ['memory', 'kai-jax', 'legendary'],
  },
];

/**
 * TIME UPGRADES (Silver specific)
 */
export const TIME_UPGRADES: Upgrade[] = [
  {
    id: 'time_001',
    name: 'Temporal Mastery',
    description: 'Increases time manipulation effectiveness',
    category: UpgradeCategory.TIME,
    rarity: UpgradeRarity.RARE,
    level: 0,
    maxLevel: 5,
    unlocked: false,
    cost: { currency: 300 },
    characterSpecific: ['SILVER'],
    effects: {
      passiveEffects: ['Time abilities last 15% longer'],
    },
    tags: ['time', 'silver'],
  },
  {
    id: 'time_002',
    name: 'Paradox Loop Mastery',
    description: 'Enhances paradox loop mechanics',
    category: UpgradeCategory.TIME,
    rarity: UpgradeRarity.LEGENDARY,
    level: 0,
    maxLevel: 3,
    unlocked: false,
    cost: { currency: 600, resonance: 20 },
    prerequisites: [
      { upgradeId: 'time_001', minUpgradeLevel: 3 },
      { characterUnlock: 'SILVER' },
    ],
    characterSpecific: ['SILVER'],
    effects: {
      abilityUnlocks: [{
        abilityId: 'paradox_loop_enhanced',
        abilityName: 'Enhanced Paradox Loop',
        description: 'Paradox loops trigger at 2 unique patterns instead of 3',
      }],
    },
    tags: ['time', 'silver', 'legendary'],
  },
];

/**
 * HARMONY UPGRADES (Lunara specific)
 */
export const HARMONY_UPGRADES: Upgrade[] = [
  {
    id: 'harmony_001',
    name: 'Harmony Resonance',
    description: 'Increases team synergy effectiveness',
    category: UpgradeCategory.HARMONY,
    rarity: UpgradeRarity.RARE,
    level: 0,
    maxLevel: 5,
    unlocked: false,
    cost: { currency: 300 },
    characterSpecific: ['LUNARA'],
    effects: {
      passiveEffects: ['Team bonuses are 20% more effective'],
    },
    tags: ['harmony', 'lunara', 'team'],
  },
  {
    id: 'harmony_002',
    name: 'Weave Protection',
    description: 'Enhances Weave protection abilities',
    category: UpgradeCategory.HARMONY,
    rarity: UpgradeRarity.LEGENDARY,
    level: 0,
    maxLevel: 3,
    unlocked: false,
    cost: { currency: 600, resonance: 20 },
    prerequisites: [
      { upgradeId: 'harmony_001', minUpgradeLevel: 3 },
      { characterUnlock: 'LUNARA' },
    ],
    characterSpecific: ['LUNARA'],
    effects: {
      abilityUnlocks: [{
        abilityId: 'weave_protection_enhanced',
        abilityName: 'Enhanced Weave Protection',
        description: 'Weave protection provides damage reduction to entire team',
      }],
    },
    tags: ['harmony', 'lunara', 'legendary'],
  },
];

/**
 * TEAM SYNERGY UPGRADES
 */
export const TEAM_UPGRADES: Upgrade[] = [
  {
    id: 'team_001',
    name: 'Team Coordination',
    description: 'Increases team stat bonuses',
    category: UpgradeCategory.TEAM,
    rarity: UpgradeRarity.UNCOMMON,
    level: 0,
    maxLevel: 5,
    unlocked: false,
    cost: { currency: 250 },
    prerequisites: [{ minLevel: 10 }],
    effects: {
      passiveEffects: ['Team stat bonuses increased by 2% per level'],
    },
    tags: ['team', 'synergy'],
  },
  {
    id: 'team_002',
    name: 'Tag Team Mastery',
    description: 'Enhances tag-in attacks and combos',
    category: UpgradeCategory.TEAM,
    rarity: UpgradeRarity.RARE,
    level: 0,
    maxLevel: 3,
    unlocked: false,
    cost: { currency: 400 },
    prerequisites: [
      { upgradeId: 'team_001', minUpgradeLevel: 3 },
      { minLevel: 15 },
    ],
    effects: {
      abilityUnlocks: [{
        abilityId: 'tag_team_mastery',
        abilityName: 'Tag Team Mastery',
        description: 'Tag-in attacks deal 50% more damage and extend combos',
      }],
    },
    tags: ['team', 'tag', 'rare'],
  },
  {
    id: 'team_003',
    name: 'Ultimate Team Synergy',
    description: 'Unlocks enhanced team ultimate abilities',
    category: UpgradeCategory.TEAM,
    rarity: UpgradeRarity.LEGENDARY,
    level: 0,
    maxLevel: 1,
    unlocked: false,
    cost: { currency: 1000, resonance: 50 },
    prerequisites: [
      { upgradeId: 'team_002', minUpgradeLevel: 3 },
      { upgradeId: 'ultimate_003' },
      { minLevel: 30 },
    ],
    effects: {
      abilityUnlocks: [{
        abilityId: 'ultimate_team_synergy',
        abilityName: 'Ultimate Team Synergy',
        description: 'Team ultimates can be chained together for massive damage',
      }],
    },
    tags: ['team', 'ultimate', 'legendary'],
  },
];

/**
 * UPGRADE SYSTEMS (organized collections)
 */
export const UPGRADE_SYSTEMS: UpgradeSystem[] = [
  {
    id: 'combat_system',
    name: 'Combat Mastery System',
    description: 'Core combat upgrades for damage, defense, and combat flow',
    category: UpgradeCategory.COMBAT,
    upgrades: COMBAT_UPGRADES,
    systemBonus: {
      statModifications: [
        { stat: 'attack', type: 'percentage', value: 10, scaling: 'linear' },
        { stat: 'defense', type: 'percentage', value: 10, scaling: 'linear' },
      ],
      passiveEffects: ['All combat upgrades completed: +10% attack and defense'],
    },
  },
  {
    id: 'traversal_system',
    name: 'Traversal Mastery System',
    description: 'Movement and traversal upgrades',
    category: UpgradeCategory.TRAVERSAL,
    upgrades: TRAVERSAL_UPGRADES,
  },
  {
    id: 'special_system',
    name: 'Special Abilities System',
    description: 'Special ability upgrades and enhancements',
    category: UpgradeCategory.SPECIAL,
    upgrades: SPECIAL_UPGRADES,
  },
  {
    id: 'ultimate_system',
    name: 'Ultimate Power System',
    description: 'Ultimate ability upgrades',
    category: UpgradeCategory.ULTIMATE,
    upgrades: ULTIMATE_UPGRADES,
  },
  {
    id: 'stats_system',
    name: 'Core Stats System',
    description: 'Base stat improvements',
    category: UpgradeCategory.STATS,
    upgrades: STAT_UPGRADES,
  },
  {
    id: 'chaos_system',
    name: 'Chaos Engineering',
    description: 'Chaos-based upgrades with unpredictable effects',
    category: UpgradeCategory.CHAOS,
    upgrades: CHAOS_UPGRADES,
  },
  {
    id: 'tech_system',
    name: 'Tech Fusion',
    description: 'Technology-based enhancements',
    category: UpgradeCategory.TECH,
    upgrades: TECH_UPGRADES,
  },
  {
    id: 'triforce_system',
    name: 'Triforce Spellcraft',
    description: 'Magic and spell-based upgrades',
    category: UpgradeCategory.TRIFORCE,
    upgrades: TRIFORCE_UPGRADES,
  },
  {
    id: 'starborn_system',
    name: 'Starborn Awakening',
    description: 'Cosmic power upgrades',
    category: UpgradeCategory.STARBORN,
    upgrades: STARBORN_UPGRADES,
  },
  {
    id: 'memory_system',
    name: 'Memory Mastery',
    description: 'Memory-based upgrades (Kai-Jax specific)',
    category: UpgradeCategory.MEMORY,
    upgrades: MEMORY_UPGRADES,
  },
  {
    id: 'time_system',
    name: 'Temporal Mastery',
    description: 'Time manipulation upgrades (Silver specific)',
    category: UpgradeCategory.TIME,
    upgrades: TIME_UPGRADES,
  },
  {
    id: 'harmony_system',
    name: 'Harmony Resonance',
    description: 'Harmony and team synergy upgrades (Lunara specific)',
    category: UpgradeCategory.HARMONY,
    upgrades: HARMONY_UPGRADES,
  },
  {
    id: 'team_system',
    name: 'Team Synergy System',
    description: 'Team coordination and synergy upgrades',
    category: UpgradeCategory.TEAM,
    upgrades: TEAM_UPGRADES,
  },
];

/**
 * ALL UPGRADES (flat list for easy access)
 */
export const ALL_UPGRADES: Upgrade[] = [
  ...COMBAT_UPGRADES,
  ...TRAVERSAL_UPGRADES,
  ...SPECIAL_UPGRADES,
  ...ULTIMATE_UPGRADES,
  ...STAT_UPGRADES,
  ...CHAOS_UPGRADES,
  ...TECH_UPGRADES,
  ...TRIFORCE_UPGRADES,
  ...STARBORN_UPGRADES,
  ...MEMORY_UPGRADES,
  ...TIME_UPGRADES,
  ...HARMONY_UPGRADES,
  ...TEAM_UPGRADES,
];

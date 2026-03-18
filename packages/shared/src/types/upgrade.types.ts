/**
 * UNIVERSAL LEGEND UPGRADE SYSTEM TYPES
 * 
 * World-class upgrade system supporting:
 * - Multiple upgrade categories
 * - Prerequisites and dependencies
 * - Cost scaling
 * - Stat modifications
 * - Ability unlocks
 * - Set bonuses
 * - Visual effects
 * - Advanced mechanics (synergy, mastery, prestige, fusion)
 */

/**
 * Upgrade Categories
 */
export enum UpgradeCategory {
  // Core Combat
  COMBAT = 'combat',
  TRAVERSAL = 'traversal',
  SPECIAL = 'special',
  ULTIMATE = 'ultimate',
  
  // Progression
  STATS = 'stats',
  ABILITIES = 'abilities',
  SKILLS = 'skills',
  
  // Equipment & Gear
  GEAR = 'gear',
  WEAPONS = 'weapons',
  ACCESSORIES = 'accessories',
  
  // Team & Synergy
  TEAM = 'team',
  SYNERGY = 'synergy',
  
  // Advanced Systems
  CHAOS = 'chaos',
  TECH = 'tech',
  TRIFORCE = 'triforce',
  STARBORN = 'starborn',
  MEMORY = 'memory',
  TIME = 'time',
  HARMONY = 'harmony',
  
  // NEW: Advanced Categories
  MASTERY = 'mastery',           // Mastery system upgrades
  PRESTIGE = 'prestige',         // Prestige/reset upgrades
  FUSION = 'fusion',             // Upgrade fusion system
  EVOLUTION = 'evolution',       // Evolution/transformation upgrades
  AURA = 'aura',                 // Aura and passive effects
  ENHANCEMENT = 'enhancement',   // Enhancement upgrades
  AWAKENING = 'awakening',       // Awakening upgrades
  TRANSCENDENCE = 'transcendence', // Transcendence upgrades
  DIMENSIONAL = 'dimensional',   // Dimensional upgrades
  VOID = 'void',                 // Void-based upgrades
  NEXUS = 'nexus',               // Nexus upgrades
  ECHO = 'echo',                 // Echo upgrades
  PARADOX = 'paradox',           // Paradox upgrades
}

/**
 * Upgrade Rarity Tiers
 */
export enum UpgradeRarity {
  COMMON = 'common',        // White - Basic upgrades
  UNCOMMON = 'uncommon',    // Green - Minor improvements
  RARE = 'rare',            // Blue - Significant boosts
  EPIC = 'epic',            // Purple - Major enhancements
  LEGENDARY = 'legendary',  // Gold - Game-changing abilities
  MYTHIC = 'mythic',        // Red - Ultimate transformations
  TRANSCENDENT = 'transcendent', // Rainbow - Beyond mythic
  VOID = 'void',            // Black - Void-tier upgrades
}

/**
 * Stat Modification Types
 */
export interface StatModification {
  stat: 'health' | 'attack' | 'defense' | 'speed' | 'resonance' | 'reflex' | 
        'critChance' | 'critDamage' | 'dodgeChance' | 'parryWindow' | 
        'comboMultiplier' | 'ultimateCharge' | 'specialCooldown' |
        'mastery' | 'prestige' | 'fusionPower' | 'evolutionLevel' |
        'auraStrength' | 'enhancementLevel' | 'awakeningLevel' |
        'transcendenceLevel' | 'dimensionalPower' | 'voidResistance' |
        'nexusPower' | 'echoPower' | 'paradoxResistance';
  type: 'flat' | 'percentage' | 'multiplier' | 'exponential' | 'logarithmic';
  value: number;
  scaling?: 'linear' | 'exponential' | 'logarithmic' | 'quadratic' | 'custom';
}

/**
 * Ability Unlock
 */
export interface AbilityUnlock {
  abilityId: string;
  abilityName: string;
  description: string;
  unlockLevel?: number; // Level at which ability unlocks (if level-gated)
}

/**
 * Visual Effect Configuration
 */
export interface UpgradeVisualEffect {
  icon?: string;
  particleEffect?: string;
  glowColor?: string;
  auraColor?: string;
  soundEffect?: string;
  animation?: string;
  vfxIntensity?: number; // 0-1
  screenEffect?: string; // Screen shake, flash, etc.
  trailEffect?: string; // Trail effects
}

/**
 * Prerequisites for unlocking an upgrade
 */
export interface UpgradePrerequisite {
  upgradeId?: string;        // Requires another upgrade
  category?: UpgradeCategory; // Requires upgrades in this category
  minLevel?: number;         // Requires minimum character level
  minUpgradeLevel?: number;  // Requires minimum level in prerequisite upgrade
  storyProgress?: number;    // Requires story progress (0-100)
  resourceCost?: ResourceCost; // Additional resource requirements
  characterUnlock?: string;  // Requires specific character unlocked
  masteryLevel?: number;     // Requires mastery level
  prestigeLevel?: number;    // Requires prestige level
  fusionCount?: number;      // Requires number of fusions
  evolutionLevel?: number;   // Requires evolution level
  awakeningLevel?: number;   // Requires awakening level
  transcendenceLevel?: number; // Requires transcendence level
  upgradeCount?: number;     // Requires total number of upgrades
  maxedUpgradeCount?: number; // Requires number of maxed upgrades
  setBonusActive?: string;   // Requires active set bonus
  synergyLevel?: number;     // Requires synergy level
}

/**
 * Resource Cost
 */
export interface ResourceCost {
  currency?: number;         // Base currency
  chaosEnergy?: number;      // Chaos energy
  memoryShards?: number;     // Memory shards
  resonance?: number;        // Resonance points
  reflex?: number;           // Reflex points
  experience?: number;       // Experience points
  mastery?: number;          // Mastery points
  prestige?: number;         // Prestige points
  fusionMaterial?: number;   // Fusion materials
  evolutionEssence?: number; // Evolution essence
  awakeningCrystal?: number; // Awakening crystals
  transcendenceShard?: number; // Transcendence shards
  dimensionalCore?: number;  // Dimensional cores
  voidEssence?: number;      // Void essence
  nexusFragment?: number;    // Nexus fragments
  echoResonance?: number;     // Echo resonance
  paradoxEnergy?: number;    // Paradox energy
  quantumEssence?: number;   // Quantum essence (QUANTUM)
  multiverseFragment?: number; // Multiverse fragments (QUANTUM)
  temporalCore?: number;     // Temporal cores (QUANTUM)
  aiCore?: number;           // AI cores (QUANTUM)
  realityShard?: number;     // Reality shards (QUANTUM)
}

/**
 * Set Bonus (for gear sets)
 */
export interface SetBonus {
  setId: string;
  setName: string;
  pieces: {
    2?: StatModification[];  // 2-piece bonus
    4?: StatModification[];  // 4-piece bonus
    6?: StatModification[];  // 6-piece bonus
    8?: StatModification[];  // 8-piece bonus (NEW)
  };
  specialAbility?: AbilityUnlock; // Special ability at full set
  masteryBonus?: StatModification[]; // Mastery set bonus
  prestigeBonus?: StatModification[]; // Prestige set bonus
}

/**
 * Cost Scaling Formula
 */
export interface CostScaling {
  baseCost: number;
  scalingType: 'linear' | 'exponential' | 'quadratic' | 'custom' | 'logarithmic' | 'step';
  scalingFactor?: number;   // Multiplier per level
  customFormula?: (level: number) => number; // Custom cost calculation
  stepThresholds?: number[]; // For step scaling
}

/**
 * Upgrade Synergy (NEW)
 * Upgrades that work together for bonus effects
 */
export interface UpgradeSynergy {
  synergyId: string;
  name: string;
  description: string;
  requiredUpgrades: string[]; // Upgrade IDs that must be unlocked
  requiredLevels?: number[]; // Required levels for each upgrade
  bonus: StatModification[]; // Bonus effects when synergy is active
  unlockMessage?: string;
}

/**
 * Upgrade Mastery (NEW)
 * Mastery system for upgrades
 */
export interface UpgradeMastery {
  masteryId: string;
  name: string;
  description: string;
  category: UpgradeCategory;
  maxLevel: number;
  requirements: {
    upgradesUnlocked: number; // Number of upgrades in category
    upgradesMaxed: number;    // Number of maxed upgrades
    totalLevels: number;      // Total levels across category
  };
  bonuses: StatModification[]; // Bonuses per mastery level
}

/**
 * Upgrade Prestige (NEW)
 * Prestige system for resetting and gaining permanent bonuses
 */
export interface UpgradePrestige {
  prestigeId: string;
  name: string;
  description: string;
  requirements: {
    totalUpgradesMaxed: number;
    masteryLevels: number;
    totalResourcesSpent: ResourceCost;
  };
  permanentBonuses: StatModification[]; // Permanent bonuses after prestige
  prestigeMultiplier: number; // Resource generation multiplier
}

/**
 * Upgrade Fusion (NEW)
 * Combining upgrades to create more powerful versions
 */
export interface UpgradeFusion {
  fusionId: string;
  name: string;
  description: string;
  ingredients: Array<{
    upgradeId: string;
    minLevel: number;
  }>;
  result: {
    upgradeId: string;
    level: number;
  };
  fusionCost: ResourceCost;
  successRate: number; // 0-1
  failureResult?: {
    upgradeId: string;
    level: number;
  };
}

/**
 * Upgrade Evolution (NEW)
 * Evolving upgrades to higher tiers
 */
export interface UpgradeEvolution {
  evolutionId: string;
  name: string;
  description: string;
  baseUpgradeId: string;
  requiredLevel: number;
  evolutionCost: ResourceCost;
  evolutionResult: {
    upgradeId: string;
    newRarity: UpgradeRarity;
    newMaxLevel: number;
    bonusEffects: StatModification[];
  };
}

/**
 * Upgrade Tree Node (NEW)
 * For branching upgrade paths
 */
export interface UpgradeTreeNode {
  upgradeId: string;
  position: { x: number; y: number };
  connections: string[]; // Connected upgrade IDs
  branchType?: 'exclusive' | 'parallel' | 'convergent'; // Exclusive = only one path, parallel = multiple paths, convergent = paths merge
}

/**
 * Upgrade Tree (NEW)
 * Branching upgrade paths
 */
export interface UpgradeTree {
  treeId: string;
  name: string;
  description: string;
  category: UpgradeCategory;
  nodes: UpgradeTreeNode[];
  rootNode: string; // Starting upgrade ID
}

/**
 * Dynamic Upgrade Condition (NEW)
 * Conditional upgrades that change based on game state
 */
export interface DynamicUpgradeCondition {
  type: 'time' | 'event' | 'achievement' | 'seasonal' | 'challenge' | 'performance';
  condition: any; // Condition-specific data
  active: boolean; // Whether condition is currently met
  expiresAt?: number; // Timestamp when condition expires
}

/**
 * Upgrade Challenge (NEW)
 * Challenges that unlock special upgrades
 */
export interface UpgradeChallenge {
  challengeId: string;
  name: string;
  description: string;
  objectives: Array<{
    id: string;
    description: string;
    target: number;
    current: number;
    type: 'kill' | 'combo' | 'time' | 'score' | 'upgrade' | 'resource';
  }>;
  rewards: {
    upgradeId: string;
    resources?: ResourceCost;
  };
  timeLimit?: number; // Time limit in seconds
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme' | 'legendary';
}

/**
 * Upgrade Effect (what the upgrade does)
 */
export interface UpgradeEffect {
  statModifications?: StatModification[];
  abilityUnlocks?: AbilityUnlock[];
  setBonus?: SetBonus;
  passiveEffects?: string[]; // Descriptions of passive effects
  activeEffects?: string[];   // Descriptions of active effects
  visualEffects?: UpgradeVisualEffect;
  synergy?: UpgradeSynergy; // Synergy this upgrade is part of
  fusionRecipe?: UpgradeFusion; // Fusion recipe this upgrade can be used in
  evolutionPath?: UpgradeEvolution; // Evolution path for this upgrade
  masteryBonus?: StatModification[]; // Bonus when mastery is active
  prestigeBonus?: StatModification[]; // Bonus when prestige is active
  conditionalEffects?: Array<{
    condition: DynamicUpgradeCondition;
    effects: StatModification[];
  }>;
}

/**
 * Core Upgrade Interface
 */
export interface Upgrade {
  id: string;
  name: string;
  description: string;
  category: UpgradeCategory;
  rarity: UpgradeRarity;
  
  // Progression
  level: number;
  maxLevel: number;
  unlocked: boolean;
  
  // Costs
  cost: ResourceCost;
  costScaling?: CostScaling;
  
  // Prerequisites
  prerequisites?: UpgradePrerequisite[];
  
  // Effects
  effects: UpgradeEffect;
  
  // Metadata
  icon?: string;
  flavorText?: string;
  unlockMessage?: string;
  
  // Character/Team specific
  characterSpecific?: string[]; // Character IDs this applies to
  teamComposition?: string[];   // Team composition requirements
  
  // Tags for filtering/searching
  tags?: string[];
  
  // NEW: Advanced features
  treeNode?: UpgradeTreeNode; // Position in upgrade tree
  dynamicCondition?: DynamicUpgradeCondition; // Dynamic availability
  challengeUnlock?: string; // Challenge ID that unlocks this
  fusionIngredient?: boolean; // Can be used in fusion
  evolutionBase?: boolean; // Can be evolved
  masteryTrack?: string; // Mastery track this contributes to
  prestigeTrack?: string; // Prestige track this contributes to
  hidden?: boolean; // Hidden until unlocked
  secret?: boolean; // Secret upgrade
  limitedTime?: boolean; // Limited time availability
  expiresAt?: number; // Expiration timestamp
}

/**
 * Upgrade System (collection of related upgrades)
 */
export interface UpgradeSystem {
  id: string;
  name: string;
  description: string;
  category: UpgradeCategory;
  icon?: string;
  upgrades: Upgrade[];
  
  // System-level unlocks
  systemPrerequisites?: UpgradePrerequisite[];
  systemBonus?: UpgradeEffect; // Bonus for completing all upgrades in system
  
  // NEW: Advanced system features
  upgradeTree?: UpgradeTree; // Upgrade tree for this system
  mastery?: UpgradeMastery; // Mastery system for this category
  prestige?: UpgradePrestige; // Prestige system for this category
  fusionRecipes?: UpgradeFusion[]; // Fusion recipes in this system
  evolutionPaths?: UpgradeEvolution[]; // Evolution paths in this system
  challenges?: UpgradeChallenge[]; // Challenges for this system
}

/**
 * Upgrade Progress Tracking
 */
export interface UpgradeProgress {
  upgradeId: string;
  level: number;
  unlocked: boolean;
  unlockedAt?: number; // Timestamp
  lastUpgradedAt?: number; // Timestamp
  totalSpent?: ResourceCost; // Total resources spent
  masteryProgress?: number; // Progress toward mastery
  prestigeProgress?: number; // Progress toward prestige
  fusionCount?: number; // Number of times used in fusion
  evolutionLevel?: number; // Evolution level
  awakeningLevel?: number; // Awakening level
  transcendenceLevel?: number; // Transcendence level
}

/**
 * Player Upgrade State
 */
export interface PlayerUpgradeState {
  upgrades: Map<string, UpgradeProgress>;
  unlockedSystems: Set<string>;
  totalUpgradesUnlocked: number;
  totalUpgradesMaxed: number;
  resources: ResourceCost;
  
  // Computed stats from all upgrades
  totalStatModifications: Map<string, number>;
  unlockedAbilities: Set<string>;
  activeSetBonuses: SetBonus[];
  
  // NEW: Advanced state
  activeSynergies: Set<string>; // Active synergy IDs
  masteryLevels: Map<string, number>; // Category -> mastery level
  prestigeLevel: number; // Current prestige level
  prestigeMultiplier: number; // Prestige resource multiplier
  fusionHistory: UpgradeFusion[]; // Fusion history
  evolutionHistory: UpgradeEvolution[]; // Evolution history
  completedChallenges: Set<string>; // Completed challenge IDs
  activeChallenges: Set<string>; // Active challenge IDs
  upgradeTrees: Map<string, UpgradeTree>; // Unlocked upgrade trees
  resourceGeneration: Map<string, number>; // Resource type -> generation rate
}

/**
 * Upgrade Manager Interface
 */
export interface IUpgradeManager {
  // Query
  getUpgrade(upgradeId: string): Upgrade | null;
  getUpgradeProgress(upgradeId: string): UpgradeProgress | null;
  getSystemUpgrades(systemId: string): Upgrade[];
  getAllUpgrades(category?: UpgradeCategory): Upgrade[];
  canAfford(upgradeId: string, level?: number): boolean;
  canUnlock(upgradeId: string): boolean;
  
  // Actions
  unlockUpgrade(upgradeId: string): boolean;
  levelUpUpgrade(upgradeId: string, levels?: number): boolean;
  purchaseUpgrade(upgradeId: string, level?: number): boolean;
  
  // Resources
  addResources(resources: Partial<ResourceCost>): void;
  spendResources(resources: ResourceCost): boolean;
  getResources(): ResourceCost;
  
  // State
  getPlayerState(): PlayerUpgradeState;
  resetUpgrade(upgradeId: string): boolean;
  resetAllUpgrades(): void;
  
  // Validation
  validatePrerequisites(upgradeId: string): { valid: boolean; missing: string[] };
  getUpgradeCost(upgradeId: string, targetLevel?: number): ResourceCost;
  
  // NEW: Advanced methods
  fuseUpgrades(ingredients: string[]): { success: boolean; result?: string; error?: string };
  evolveUpgrade(upgradeId: string): { success: boolean; result?: string; error?: string };
  activateSynergy(synergyId: string): boolean;
  getMasteryLevel(category: UpgradeCategory): number;
  prestige(): { success: boolean; newLevel?: number; error?: string };
  startChallenge(challengeId: string): boolean;
  completeChallenge(challengeId: string): boolean;
  getActiveChallenges(): UpgradeChallenge[];
  getUpgradeTree(treeId: string): UpgradeTree | null;
  generateResources(deltaTime: number): void;
  convertResources(from: ResourceCost, to: ResourceCost): boolean;
}

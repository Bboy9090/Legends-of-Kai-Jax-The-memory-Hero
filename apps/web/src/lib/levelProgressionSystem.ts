/**
 * Level Progression and Stat Growth System
 * Handles XP, leveling, stats, and ability unlocks
 */

export interface PlayerStats {
  power: number; // Damage multiplier
  speed: number; // Attack speed and movement
  defense: number; // Damage reduction
  health: number; // Max HP multiplier
  stamina: number; // Resource for special moves
}

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  level: number; // 1-20 skill tree levels
  requiredLevel: number; // Character level required
  unlocks?: string[]; // move IDs this unlock
  statBonus: Partial<PlayerStats>;
  cost: number; // XP cost to unlock
  icon: string;
  tier: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface CharacterProgression {
  characterId: string;
  currentLevel: number;
  currentXP: number;
  totalXPEarned: number;
  stats: PlayerStats;
  unlockedSkills: string[];
  skillPoints: number;
  skillTreePath?: 'offensive' | 'defensive' | 'balanced';
}

// Base stats for each character at level 1
export const CHARACTER_BASE_STATS: Record<string, PlayerStats> = {
  'kai-jax': {
    power: 100,
    speed: 85,
    defense: 90,
    health: 120,
    stamina: 100,
  },
  kaison: {
    power: 90,
    speed: 100,
    defense: 75,
    health: 100,
    stamina: 110,
  },
  jaxon: {
    power: 95,
    speed: 105,
    defense: 70,
    health: 95,
    stamina: 105,
  },
};

// XP table: XP required to reach each level
export const XP_TABLE: number[] = [
  0, // Level 1 (0 XP needed)
  100, // Level 2
  250, // Level 3
  450, // Level 4
  700, // Level 5
  1000, // Level 6
  1350, // Level 7
  1750, // Level 8
  2200, // Level 9
  2700, // Level 10
  3250, // Level 11
  3850, // Level 12
  4500, // Level 13
  5200, // Level 14
  5950, // Level 15
  6750, // Level 16
  7600, // Level 17
  8500, // Level 18
  9450, // Level 19
  10500, // Level 20
];

const MAX_LEVEL = 20;

// Skill tree nodes
export const SKILL_TREE: SkillNode[] = [
  // Offensive Path
  {
    id: 'skill_power_1',
    name: 'Power Surge I',
    description: 'Increase damage output by 10%',
    level: 1,
    requiredLevel: 1,
    unlocks: undefined,
    statBonus: { power: 10 },
    cost: 50,
    icon: 'power-surge',
    tier: 'common',
  },
  {
    id: 'skill_power_2',
    name: 'Power Surge II',
    description: 'Further increase damage by 15%',
    level: 2,
    requiredLevel: 5,
    unlocks: ['kai_special_1'],
    statBonus: { power: 15 },
    cost: 150,
    icon: 'power-surge',
    tier: 'rare',
  },
  {
    id: 'skill_power_3',
    name: 'Power Surge III',
    description: 'Master damage techniques. +20% damage',
    level: 3,
    requiredLevel: 10,
    unlocks: ['kai_combo_1'],
    statBonus: { power: 20 },
    cost: 400,
    icon: 'power-surge',
    tier: 'epic',
  },

  // Speed Path
  {
    id: 'skill_speed_1',
    name: 'Quick Reflexes',
    description: 'Increase attack and movement speed by 8%',
    level: 1,
    requiredLevel: 1,
    unlocks: undefined,
    statBonus: { speed: 8 },
    cost: 50,
    icon: 'speed',
    tier: 'common',
  },
  {
    id: 'skill_speed_2',
    name: 'Lightning Reflexes',
    description: 'Speed boost to 15%',
    level: 2,
    requiredLevel: 5,
    unlocks: ['kai_dash'],
    statBonus: { speed: 15 },
    cost: 150,
    icon: 'speed',
    tier: 'rare',
  },

  // Defense Path
  {
    id: 'skill_defense_1',
    name: 'Thick Skin',
    description: 'Reduce incoming damage by 10%',
    level: 1,
    requiredLevel: 1,
    unlocks: undefined,
    statBonus: { defense: 10 },
    cost: 50,
    icon: 'defense',
    tier: 'common',
  },
  {
    id: 'skill_defense_2',
    name: 'Iron Body',
    description: 'Damage reduction increased to 20%',
    level: 2,
    requiredLevel: 5,
    unlocks: ['kai_counter_1'],
    statBonus: { defense: 20 },
    cost: 150,
    icon: 'defense',
    tier: 'rare',
  },
  {
    id: 'skill_defense_3',
    name: 'Fortress',
    description: 'Ultimate defense - 30% damage reduction',
    level: 3,
    requiredLevel: 15,
    unlocks: undefined,
    statBonus: { defense: 30 },
    cost: 600,
    icon: 'defense',
    tier: 'legendary',
  },

  // Health Path
  {
    id: 'skill_health_1',
    name: 'Vitality',
    description: 'Increase max health by 15%',
    level: 1,
    requiredLevel: 1,
    unlocks: undefined,
    statBonus: { health: 15 },
    cost: 50,
    icon: 'health',
    tier: 'common',
  },
  {
    id: 'skill_health_2',
    name: 'Regeneration',
    description: 'Max health +25%, passive health regen',
    level: 2,
    requiredLevel: 8,
    unlocks: undefined,
    statBonus: { health: 25 },
    cost: 200,
    icon: 'health',
    tier: 'rare',
  },

  // Stamina/Resource Path
  {
    id: 'skill_stamina_1',
    name: 'Endurance',
    description: 'Increase stamina pool by 10%',
    level: 1,
    requiredLevel: 1,
    unlocks: undefined,
    statBonus: { stamina: 10 },
    cost: 50,
    icon: 'stamina',
    tier: 'common',
  },
  {
    id: 'skill_stamina_2',
    name: 'Infinite Energy',
    description: 'Stamina +20%, faster regen',
    level: 2,
    requiredLevel: 7,
    unlocks: undefined,
    statBonus: { stamina: 20 },
    cost: 175,
    icon: 'stamina',
    tier: 'rare',
  },
];

/**
 * Create initial progression for a character
 */
export function createCharacterProgression(characterId: string): CharacterProgression {
  const baseStats = CHARACTER_BASE_STATS[characterId] || CHARACTER_BASE_STATS['kai-jax'];

  return {
    characterId,
    currentLevel: 1,
    currentXP: 0,
    totalXPEarned: 0,
    stats: { ...baseStats },
    unlockedSkills: [],
    skillPoints: 0,
    skillTreePath: undefined,
  };
}

/**
 * Calculate level from total XP
 */
export function calculateLevelFromXP(totalXP: number): [number, number] {
  let level = 1;
  let xpForCurrentLevel = 0;

  for (let i = 1; i < XP_TABLE.length; i++) {
    if (totalXP >= XP_TABLE[i]) {
      level = i + 1;
      xpForCurrentLevel = XP_TABLE[i];
    } else {
      break;
    }
  }

  level = Math.min(level, MAX_LEVEL);
  return [level, xpForCurrentLevel];
}

/**
 * Gain XP and level up if threshold met
 */
export function gainXP(
  progression: CharacterProgression,
  amount: number
): CharacterProgression {
  const updated = { ...progression };
  updated.currentXP += amount;
  updated.totalXPEarned += amount;

  const [newLevel, xpForLevel] = calculateLevelFromXP(updated.totalXPEarned);

  if (newLevel > updated.currentLevel) {
    // Level up!
    updated.currentLevel = newLevel;
    updated.skillPoints += 1; // Grant 1 skill point per level

    // Apply stat growth based on level
    updated.stats = applyStatGrowth(updated.stats, progression.characterId, updated.currentLevel);
  }

  updated.currentXP = updated.totalXPEarned - xpForLevel;
  return updated;
}

/**
 * Apply stat growth for a level
 */
function applyStatGrowth(
  stats: PlayerStats,
  characterId: string,
  level: number
): PlayerStats {
  const growthRate = 0.05; // 5% per level
  const levelBonus = level - 1;

  return {
    power: stats.power * (1 + growthRate * levelBonus * 0.8),
    speed: stats.speed * (1 + growthRate * levelBonus * 0.7),
    defense: stats.defense * (1 + growthRate * levelBonus * 0.9),
    health: stats.health * (1 + growthRate * levelBonus * 1.0),
    stamina: stats.stamina * (1 + growthRate * levelBonus * 0.8),
  };
}

/**
 * Unlock a skill node
 */
export function unlockSkill(
  progression: CharacterProgression,
  skillId: string
): CharacterProgression | null {
  const skill = SKILL_TREE.find((s) => s.id === skillId);

  if (!skill) return null;
  if (progression.currentLevel < skill.requiredLevel) return null;
  if (progression.skillPoints < 1) return null;
  if (progression.unlockedSkills.includes(skillId)) return null;

  const updated = { ...progression };
  updated.unlockedSkills.push(skillId);
  updated.skillPoints -= 1;

  // Apply stat bonus
  updated.stats = {
    power: updated.stats.power + (skill.statBonus.power || 0),
    speed: updated.stats.speed + (skill.statBonus.speed || 0),
    defense: updated.stats.defense + (skill.statBonus.defense || 0),
    health: updated.stats.health + (skill.statBonus.health || 0),
    stamina: updated.stats.stamina + (skill.statBonus.stamina || 0),
  };

  return updated;
}

/**
 * Get XP needed to reach next level
 */
export function getXPToNextLevel(progression: CharacterProgression): number {
  if (progression.currentLevel >= MAX_LEVEL) return 0;

  const nextLevelXP = XP_TABLE[progression.currentLevel] || XP_TABLE[XP_TABLE.length - 1];
  const currentLevelXP = XP_TABLE[progression.currentLevel - 1] || 0;
  const xpInCurrentLevel = progression.currentXP;

  return nextLevelXP - currentLevelXP - xpInCurrentLevel;
}

/**
 * Get progress to next level (0-100)
 */
export function getLevelProgress(progression: CharacterProgression): number {
  if (progression.currentLevel >= MAX_LEVEL) return 100;

  const nextLevelXP = XP_TABLE[progression.currentLevel] || XP_TABLE[XP_TABLE.length - 1];
  const currentLevelXP = XP_TABLE[progression.currentLevel - 1] || 0;
  const xpRange = nextLevelXP - currentLevelXP;
  const xpInCurrentLevel = progression.currentXP;

  return Math.round((xpInCurrentLevel / xpRange) * 100);
}

/**
 * Get available skills for unlocking at current level
 */
export function getAvailableSkills(progression: CharacterProgression): SkillNode[] {
  return SKILL_TREE.filter(
    (skill) =>
      skill.requiredLevel <= progression.currentLevel &&
      !progression.unlockedSkills.includes(skill.id)
  );
}

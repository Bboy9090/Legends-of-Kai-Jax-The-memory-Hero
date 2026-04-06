/**
 * UPGRADE UTILITY FUNCTIONS
 * 
 * Helper functions for working with the upgrade system
 */

import type {
  Upgrade,
  UpgradeProgress,
  PlayerUpgradeState,
  StatModification,
  ResourceCost,
  UpgradeCategory,
} from '../types/upgrade.types';
import { UpgradeManager } from './UpgradeManager';

/**
 * Calculate total stat modifications from all upgrades
 */
export function calculateTotalStatModifications(
  upgradeState: PlayerUpgradeState
): Map<string, number> {
  return upgradeState.totalStatModifications;
}

/**
 * Apply stat modifications to base stats
 */
export function applyStatModifications(
  baseStats: Record<string, number>,
  modifications: Map<string, number>
): Record<string, number> {
  const result = { ...baseStats };
  
  modifications.forEach((value, stat) => {
    if (result[stat] !== undefined) {
      // Apply modification based on stat type
      // For percentage stats, multiply; for flat stats, add
      if (stat.includes('Chance') || stat.includes('Window') || stat.includes('Multiplier')) {
        // Percentage-based stats
        result[stat] = result[stat] * (1 + value / 100);
      } else {
        // Flat stats
        result[stat] = result[stat] + value;
      }
    }
  });
  
  return result;
}

/**
 * Get effective stat value after upgrades
 */
export function getEffectiveStat(
  baseValue: number,
  statName: string,
  modifications: Map<string, number>
): number {
  const modification = modifications.get(statName);
  if (!modification) return baseValue;
  
  // Apply modification based on stat type
  if (statName.includes('Chance') || statName.includes('Window') || statName.includes('Multiplier')) {
    return baseValue * (1 + modification / 100);
  } else {
    return baseValue + modification;
  }
}

/**
 * Check if all prerequisites are met for an upgrade
 */
export function checkPrerequisites(
  upgrade: Upgrade,
  upgradeState: PlayerUpgradeState,
  playerLevel: number,
  storyProgress: number,
  unlockedCharacters: string[]
): { valid: boolean; missing: string[] } {
  if (!upgrade.prerequisites || upgrade.prerequisites.length === 0) {
    return { valid: true, missing: [] };
  }
  
  const missing: string[] = [];
  
  for (const prereq of upgrade.prerequisites) {
    // Check upgrade prerequisite
    if (prereq.upgradeId) {
      const prereqProgress = upgradeState.upgrades.get(prereq.upgradeId);
      if (!prereqProgress?.unlocked) {
        missing.push(`Upgrade: ${prereq.upgradeId}`);
        continue;
      }
      if (prereq.minUpgradeLevel && prereqProgress.level < prereq.minUpgradeLevel) {
        missing.push(`Upgrade ${prereq.upgradeId} level ${prereq.minUpgradeLevel}`);
        continue;
      }
    }
    
    // Check character level
    if (prereq.minLevel && playerLevel < prereq.minLevel) {
      missing.push(`Level ${prereq.minLevel}`);
      continue;
    }
    
    // Check story progress
    if (prereq.storyProgress && storyProgress < prereq.storyProgress) {
      missing.push(`Story progress ${prereq.storyProgress}%`);
      continue;
    }
    
    // Check character unlock
    if (prereq.characterUnlock && !unlockedCharacters.includes(prereq.characterUnlock)) {
      missing.push(`Character: ${prereq.characterUnlock}`);
      continue;
    }
  }
  
  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Get upgrade recommendations based on current state
 */
export function getUpgradeRecommendations(
  upgradeState: PlayerUpgradeState,
  playerLevel: number,
  availableResources: ResourceCost,
  category?: UpgradeCategory
): Upgrade[] {
  const recommendations: Upgrade[] = [];
  
  // This would need access to all upgrades
  // For now, return empty array - implement based on your needs
  // Could prioritize:
  // - Upgrades that can be afforded
  // - Upgrades with met prerequisites
  // - Upgrades in specific categories
  // - Upgrades that provide most value
  
  return recommendations;
}

/**
 * Calculate total cost to max out an upgrade
 */
export function getTotalMaxCost(
  upgrade: Upgrade,
  upgradeManager: UpgradeManager
): ResourceCost {
  if (!upgrade.maxLevel) {
    return upgrade.cost;
  }
  
  return upgradeManager.getUpgradeCost(upgrade.id, upgrade.maxLevel);
}

/**
 * Get upgrade efficiency (value per resource)
 */
export function getUpgradeEfficiency(
  upgrade: Upgrade,
  progress: UpgradeProgress | null
): number {
  if (!progress || !upgrade.effects.statModifications) {
    return 0;
  }
  
  // Calculate total stat value increase
  let totalValue = 0;
  upgrade.effects.statModifications.forEach(mod => {
    totalValue += Math.abs(mod.value) * (progress.level || 1);
  });
  
  // Calculate cost
  const cost = upgrade.cost.currency ?? 0;
  
  if (cost === 0) return Infinity;
  
  return totalValue / cost;
}

/**
 * Format resource cost for display
 */
export function formatResourceCost(cost: ResourceCost): string {
  const parts: string[] = [];
  
  if (cost.currency) {
    parts.push(`${cost.currency.toLocaleString()} coins`);
  }
  if (cost.chaosEnergy) {
    parts.push(`${cost.chaosEnergy} chaos`);
  }
  if (cost.memoryShards) {
    parts.push(`${cost.memoryShards} shards`);
  }
  if (cost.resonance) {
    parts.push(`${cost.resonance} resonance`);
  }
  if (cost.reflex) {
    parts.push(`${cost.reflex} reflex`);
  }
  if (cost.experience) {
    parts.push(`${cost.experience} XP`);
  }
  
  return parts.join(', ') || 'Free';
}

/**
 * Check if upgrade is maxed
 */
export function isUpgradeMaxed(upgrade: Upgrade, progress: UpgradeProgress | null): boolean {
  if (!progress || !progress.unlocked) return false;
  return progress.level >= upgrade.maxLevel;
}

/**
 * Get upgrade completion percentage
 */
export function getUpgradeCompletion(upgrade: Upgrade, progress: UpgradeProgress | null): number {
  if (!progress || !progress.unlocked) return 0;
  if (upgrade.maxLevel === 0) return 100;
  return (progress.level / upgrade.maxLevel) * 100;
}

/**
 * Get next level cost for an upgrade
 */
export function getNextLevelCost(
  upgrade: Upgrade,
  progress: UpgradeProgress | null,
  upgradeManager: UpgradeManager
): ResourceCost {
  if (!progress) {
    // First unlock cost
    return upgrade.cost;
  }
  
  if (!progress.unlocked) {
    return upgrade.cost;
  }
  
  const nextLevel = progress.level + 1;
  if (nextLevel > upgrade.maxLevel) {
    return { currency: 0 }; // Already maxed
  }
  
  return upgradeManager.getUpgradeCost(upgrade.id, nextLevel);
}

/**
 * Filter upgrades by character
 */
export function filterUpgradesByCharacter(
  upgrades: Upgrade[],
  characterId: string
): Upgrade[] {
  return upgrades.filter(upgrade => {
    if (!upgrade.characterSpecific) return true;
    return upgrade.characterSpecific.includes(characterId);
  });
}

/**
 * Filter upgrades by team composition
 */
export function filterUpgradesByTeam(
  upgrades: Upgrade[],
  teamComposition: string[]
): Upgrade[] {
  return upgrades.filter(upgrade => {
    if (!upgrade.teamComposition) return true;
    // Check if team composition matches requirements
    return upgrade.teamComposition.every(req => teamComposition.includes(req));
  });
}

/**
 * Get upgrades that can be unlocked right now
 */
export function getAvailableUpgrades(
  allUpgrades: Upgrade[],
  upgradeState: PlayerUpgradeState,
  playerLevel: number,
  storyProgress: number,
  unlockedCharacters: string[],
  availableResources: ResourceCost
): Upgrade[] {
  return allUpgrades.filter(upgrade => {
    const progress = upgradeState.upgrades.get(upgrade.id);
    if (progress?.unlocked) return false; // Already unlocked
    
    // Check prerequisites
    const prereqCheck = checkPrerequisites(
      upgrade,
      upgradeState,
      playerLevel,
      storyProgress,
      unlockedCharacters
    );
    if (!prereqCheck.valid) return false;
    
    // Check if can afford
    const cost = upgrade.cost;
    if (cost.currency && (availableResources.currency ?? 0) < cost.currency) return false;
    if (cost.chaosEnergy && (availableResources.chaosEnergy ?? 0) < cost.chaosEnergy) return false;
    if (cost.memoryShards && (availableResources.memoryShards ?? 0) < cost.memoryShards) return false;
    if (cost.resonance && (availableResources.resonance ?? 0) < cost.resonance) return false;
    if (cost.reflex && (availableResources.reflex ?? 0) < cost.reflex) return false;
    if (cost.experience && (availableResources.experience ?? 0) < cost.experience) return false;
    
    return true;
  });
}

/**
 * UPGRADE ANALYTICS & OPTIMIZATION
 * 
 * Advanced analytics and optimization tools for upgrades
 */

import type {
  Upgrade,
  UpgradeProgress,
  PlayerUpgradeState,
  ResourceCost,
  UpgradeCategory,
  StatModification,
} from '../types/upgrade.types';
import { ALL_UPGRADES } from '../data/upgrade_data';

/**
 * Upgrade Build Optimizer
 */
export interface BuildOptimization {
  upgrades: string[];
  totalCost: ResourceCost;
  totalStats: Map<string, number>;
  efficiency: number;
  recommendations: string[];
}

/**
 * Optimize upgrade build for specific goals
 */
export function optimizeBuild(
  goals: {
    targetStats?: Map<string, number>;
    maxCost?: ResourceCost;
    categories?: UpgradeCategory[];
    characterId?: string;
  },
  currentState: PlayerUpgradeState
): BuildOptimization {
  const availableUpgrades = ALL_UPGRADES.filter(upgrade => {
    // Filter by character
    if (goals.characterId && upgrade.characterSpecific) {
      if (!upgrade.characterSpecific.includes(goals.characterId)) {
        return false;
      }
    }
    
    // Filter by category
    if (goals.categories && !goals.categories.includes(upgrade.category)) {
      return false;
    }
    
    // Check if already maxed
    const progress = currentState.upgrades.get(upgrade.id);
    if (progress?.unlocked && progress.level >= upgrade.maxLevel) {
      return false;
    }
    
    return true;
  });
  
  // Simple greedy algorithm (can be enhanced with more sophisticated algorithms)
  const selectedUpgrades: string[] = [];
  const totalCost: ResourceCost = { currency: 0 };
  const totalStats = new Map<string, number>();
  const recommendations: string[] = [];
  
  // Sort by efficiency
  const sortedUpgrades = availableUpgrades
    .map(upgrade => ({
      upgrade,
      efficiency: calculateUpgradeEfficiency(upgrade, currentState),
    }))
    .sort((a, b) => b.efficiency - a.efficiency);
  
  for (const { upgrade } of sortedUpgrades) {
    // Check if we can afford
    const cost = upgrade.cost;
    const canAfford = !goals.maxCost || canAffordCost(cost, goals.maxCost, totalCost);
    
    if (canAfford) {
      selectedUpgrades.push(upgrade.id);
      addCost(totalCost, cost);
      addStats(totalStats, upgrade.effects.statModifications || []);
      
      // Check if goals are met
      if (goals.targetStats) {
        let goalsMet = true;
        goals.targetStats.forEach((target, stat) => {
          const current = totalStats.get(stat) ?? 0;
          if (current < target) {
            goalsMet = false;
          }
        });
        
        if (goalsMet) {
          break;
        }
      }
    }
  }
  
  return {
    upgrades: selectedUpgrades,
    totalCost,
    totalStats,
    efficiency: calculateBuildEfficiency(selectedUpgrades, totalStats, totalCost),
    recommendations,
  };
}

/**
 * Calculate upgrade efficiency (value per resource)
 */
function calculateUpgradeEfficiency(
  upgrade: Upgrade,
  state: PlayerUpgradeState
): number {
  const progress = state.upgrades.get(upgrade.id);
  const currentLevel = progress?.level ?? 0;
  
  if (currentLevel >= upgrade.maxLevel) return 0;
  
  // Calculate stat value
  let statValue = 0;
  upgrade.effects.statModifications?.forEach(mod => {
    statValue += Math.abs(mod.value) * (upgrade.maxLevel - currentLevel);
  });
  
  // Calculate cost
  const cost = upgrade.cost.currency ?? 1;
  
  return statValue / cost;
}

/**
 * Calculate build efficiency
 */
function calculateBuildEfficiency(
  upgrades: string[],
  stats: Map<string, number>,
  cost: ResourceCost
): number {
  const totalStatValue = Array.from(stats.values()).reduce((a, b) => a + b, 0);
  const totalCost = cost.currency ?? 1;
  
  return totalStatValue / totalCost;
}

/**
 * Get upgrade recommendations based on current state
 */
export function getUpgradeRecommendations(
  state: PlayerUpgradeState,
  playerLevel: number,
  availableResources: ResourceCost,
  focus?: UpgradeCategory
): Upgrade[] {
  const recommendations: Upgrade[] = [];
  
  // Get affordable upgrades
  const affordable = ALL_UPGRADES.filter(upgrade => {
    const progress = state.upgrades.get(upgrade.id);
    if (progress?.unlocked && progress.level >= upgrade.maxLevel) {
      return false;
    }
    
    if (focus && upgrade.category !== focus) {
      return false;
    }
    
    // Check if can afford
    const cost = upgrade.cost;
    return canAffordCost(cost, availableResources, { currency: 0 });
  });
  
  // Sort by efficiency
  const sorted = affordable
    .map(upgrade => ({
      upgrade,
      efficiency: calculateUpgradeEfficiency(upgrade, state),
    }))
    .sort((a, b) => b.efficiency - a.efficiency)
    .slice(0, 10); // Top 10
  
  return sorted.map(item => item.upgrade);
}

/**
 * Analyze upgrade build
 */
export function analyzeBuild(
  upgradeIds: string[],
  state: PlayerUpgradeState
): {
  totalStats: Map<string, number>;
  totalCost: ResourceCost;
  efficiency: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
} {
  const totalStats = new Map<string, number>();
  const totalCost: ResourceCost = { currency: 0 };
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const suggestions: string[] = [];
  
  upgradeIds.forEach(upgradeId => {
    const upgrade = ALL_UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return;
    
    const progress = state.upgrades.get(upgradeId);
    if (!progress?.unlocked) return;
    
    addCost(totalCost, upgrade.cost);
    addStats(totalStats, upgrade.effects.statModifications || []);
  });
  
  // Analyze strengths
  const attack = totalStats.get('attack') ?? 0;
  const defense = totalStats.get('defense') ?? 0;
  const speed = totalStats.get('speed') ?? 0;
  
  if (attack > 50) strengths.push('High damage output');
  if (defense > 50) strengths.push('Strong defense');
  if (speed > 50) strengths.push('High mobility');
  
  // Analyze weaknesses
  if (attack < 20) weaknesses.push('Low damage output');
  if (defense < 20) weaknesses.push('Weak defense');
  if (speed < 20) weaknesses.push('Low mobility');
  
  // Generate suggestions
  if (attack < 20) {
    suggestions.push('Consider upgrading combat upgrades for more damage');
  }
  if (defense < 20) {
    suggestions.push('Consider upgrading defense upgrades for survivability');
  }
  
  return {
    totalStats,
    totalCost,
    efficiency: calculateBuildEfficiency(upgradeIds, totalStats, totalCost),
    strengths,
    weaknesses,
    suggestions,
  };
}

/**
 * Compare two upgrade builds
 */
export function compareBuilds(
  build1: string[],
  build2: string[],
  state: PlayerUpgradeState
): {
  build1Stats: Map<string, number>;
  build2Stats: Map<string, number>;
  differences: Map<string, number>;
  winner: 'build1' | 'build2' | 'tie';
} {
  const analysis1 = analyzeBuild(build1, state);
  const analysis2 = analyzeBuild(build2, state);
  
  const differences = new Map<string, number>();
  const allStats = new Set([
    ...analysis1.totalStats.keys(),
    ...analysis2.totalStats.keys(),
  ]);
  
  allStats.forEach(stat => {
    const val1 = analysis1.totalStats.get(stat) ?? 0;
    const val2 = analysis2.totalStats.get(stat) ?? 0;
    differences.set(stat, val1 - val2);
  });
  
  const total1 = Array.from(analysis1.totalStats.values()).reduce((a, b) => a + b, 0);
  const total2 = Array.from(analysis2.totalStats.values()).reduce((a, b) => a + b, 0);
  
  let winner: 'build1' | 'build2' | 'tie' = 'tie';
  if (total1 > total2) winner = 'build1';
  else if (total2 > total1) winner = 'build2';
  
  return {
    build1Stats: analysis1.totalStats,
    build2Stats: analysis2.totalStats,
    differences,
    winner,
  };
}

// Helper functions
function canAffordCost(
  cost: ResourceCost,
  available: ResourceCost,
  spent: ResourceCost
): boolean {
  for (const [key, value] of Object.entries(cost)) {
    if (value !== undefined) {
      const availableAmount = available[key as keyof ResourceCost] ?? 0;
      const spentAmount = spent[key as keyof ResourceCost] ?? 0;
      if (availableAmount - spentAmount < value) {
        return false;
      }
    }
  }
  return true;
}

function addCost(total: ResourceCost, cost: ResourceCost): void {
  for (const [key, value] of Object.entries(cost)) {
    if (value !== undefined) {
      const current = total[key as keyof ResourceCost] ?? 0;
      (total as any)[key] = current + value;
    }
  }
}

function addStats(stats: Map<string, number>, modifications: StatModification[]): void {
  modifications.forEach(mod => {
    const current = stats.get(mod.stat) ?? 0;
    stats.set(mod.stat, current + mod.value);
  });
}

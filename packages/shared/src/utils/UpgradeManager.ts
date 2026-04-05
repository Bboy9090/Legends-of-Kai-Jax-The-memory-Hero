/**
 * UNIVERSAL UPGRADE MANAGER
 * 
 * World-class upgrade system manager with:
 * - Purchase and leveling logic
 * - Prerequisite validation
 * - Cost calculation with scaling
 * - Resource management
 * - State tracking
 */

import type {
  Upgrade,
  UpgradeSystem,
  UpgradeProgress,
  PlayerUpgradeState,
  ResourceCost,
  UpgradePrerequisite,
  IUpgradeManager,
  CostScaling,
} from '../types/upgrade.types';
import { ALL_UPGRADES, UPGRADE_SYSTEMS } from '../data/upgrade_data';

export class UpgradeManager implements IUpgradeManager {
  private upgrades: Map<string, Upgrade>;
  private systems: Map<string, UpgradeSystem>;
  private progress: Map<string, UpgradeProgress>;
  private resources: ResourceCost;
  private playerLevel: number;
  private storyProgress: number;
  private unlockedCharacters: Set<string>;

  constructor(
    initialResources: Partial<ResourceCost> = {},
    playerLevel: number = 1,
    storyProgress: number = 0,
    unlockedCharacters: string[] = []
  ) {
    // Initialize upgrade maps
    this.upgrades = new Map();
    this.systems = new Map();
    
    // Load all upgrades
    ALL_UPGRADES.forEach(upgrade => {
      this.upgrades.set(upgrade.id, { ...upgrade });
    });
    
    // Load all systems
    UPGRADE_SYSTEMS.forEach(system => {
      this.systems.set(system.id, { ...system });
    });
    
    // Initialize progress tracking
    this.progress = new Map();
    ALL_UPGRADES.forEach(upgrade => {
      this.progress.set(upgrade.id, {
        upgradeId: upgrade.id,
        level: 0,
        unlocked: false,
      });
    });
    
    // Initialize resources
    this.resources = {
      currency: initialResources.currency ?? 0,
      chaosEnergy: initialResources.chaosEnergy ?? 0,
      memoryShards: initialResources.memoryShards ?? 0,
      resonance: initialResources.resonance ?? 0,
      reflex: initialResources.reflex ?? 0,
      experience: initialResources.experience ?? 0,
    };
    
    this.playerLevel = playerLevel;
    this.storyProgress = storyProgress;
    this.unlockedCharacters = new Set(unlockedCharacters);
  }

  // ==================== QUERY METHODS ====================

  getUpgrade(upgradeId: string): Upgrade | null {
    return this.upgrades.get(upgradeId) ?? null;
  }

  getUpgradeProgress(upgradeId: string): UpgradeProgress | null {
    return this.progress.get(upgradeId) ?? null;
  }

  getSystemUpgrades(systemId: string): Upgrade[] {
    const system = this.systems.get(systemId);
    if (!system) return [];
    
    return system.upgrades.map(upgrade => {
      const storedUpgrade = this.upgrades.get(upgrade.id);
      return storedUpgrade ?? upgrade;
    });
  }

  getAllUpgrades(category?: import('../types/upgrade.types').UpgradeCategory): Upgrade[] {
    const all = Array.from(this.upgrades.values());
    if (!category) return all;
    return all.filter(u => u.category === category);
  }

  canAfford(upgradeId: string, level?: number): boolean {
    const cost = this.getUpgradeCost(upgradeId, level);
    return this.hasResources(cost);
  }

  canUnlock(upgradeId: string): boolean {
    const validation = this.validatePrerequisites(upgradeId);
    if (!validation.valid) return false;
    
    const upgrade = this.getUpgrade(upgradeId);
    if (!upgrade) return false;
    
    const progress = this.getUpgradeProgress(upgradeId);
    if (!progress) return false;
    
    if (progress.unlocked) return false; // Already unlocked
    
    return this.canAfford(upgradeId);
  }

  // ==================== ACTION METHODS ====================

  unlockUpgrade(upgradeId: string): boolean {
    if (!this.canUnlock(upgradeId)) return false;
    
    const upgrade = this.getUpgrade(upgradeId);
    const progress = this.getUpgradeProgress(upgradeId);
    if (!upgrade || !progress) return false;
    
    const cost = this.getUpgradeCost(upgradeId, 1);
    if (!this.spendResources(cost)) return false;
    
    progress.unlocked = true;
    progress.level = 1;
    progress.unlockedAt = Date.now();
    progress.lastUpgradedAt = Date.now();
    progress.totalSpent = this.addResourceCosts(progress.totalSpent ?? {}, cost);
    
    // Update upgrade state
    upgrade.unlocked = true;
    upgrade.level = 1;
    
    return true;
  }

  levelUpUpgrade(upgradeId: string, levels: number = 1): boolean {
    const upgrade = this.getUpgrade(upgradeId);
    const progress = this.getUpgradeProgress(upgradeId);
    if (!upgrade || !progress || !progress.unlocked) return false;
    
    const targetLevel = progress.level + levels;
    if (targetLevel > upgrade.maxLevel) return false;
    
    const cost = this.getUpgradeCost(upgradeId, targetLevel);
    if (!this.spendResources(cost)) return false;
    
    progress.level = targetLevel;
    progress.lastUpgradedAt = Date.now();
    progress.totalSpent = this.addResourceCosts(
      progress.totalSpent ?? {},
      cost
    );
    
    // Update upgrade state
    upgrade.level = targetLevel;
    
    return true;
  }

  purchaseUpgrade(upgradeId: string, level?: number): boolean {
    const progress = this.getUpgradeProgress(upgradeId);
    if (!progress) return false;
    
    if (!progress.unlocked) {
      return this.unlockUpgrade(upgradeId);
    }
    
    const targetLevel = level ?? progress.level + 1;
    if (targetLevel <= progress.level) return false;
    
    return this.levelUpUpgrade(upgradeId, targetLevel - progress.level);
  }

  // ==================== RESOURCE METHODS ====================

  addResources(resources: Partial<ResourceCost>): void {
    if (resources.currency !== undefined) {
      this.resources.currency = (this.resources.currency ?? 0) + resources.currency;
    }
    if (resources.chaosEnergy !== undefined) {
      this.resources.chaosEnergy = (this.resources.chaosEnergy ?? 0) + resources.chaosEnergy;
    }
    if (resources.memoryShards !== undefined) {
      this.resources.memoryShards = (this.resources.memoryShards ?? 0) + resources.memoryShards;
    }
    if (resources.resonance !== undefined) {
      this.resources.resonance = (this.resources.resonance ?? 0) + resources.resonance;
    }
    if (resources.reflex !== undefined) {
      this.resources.reflex = (this.resources.reflex ?? 0) + resources.reflex;
    }
    if (resources.experience !== undefined) {
      this.resources.experience = (this.resources.experience ?? 0) + resources.experience;
    }
  }

  spendResources(resources: ResourceCost): boolean {
    if (!this.hasResources(resources)) return false;
    
    if (resources.currency !== undefined) {
      this.resources.currency = (this.resources.currency ?? 0) - resources.currency;
    }
    if (resources.chaosEnergy !== undefined) {
      this.resources.chaosEnergy = (this.resources.chaosEnergy ?? 0) - resources.chaosEnergy;
    }
    if (resources.memoryShards !== undefined) {
      this.resources.memoryShards = (this.resources.memoryShards ?? 0) - resources.memoryShards;
    }
    if (resources.resonance !== undefined) {
      this.resources.resonance = (this.resources.resonance ?? 0) - resources.resonance;
    }
    if (resources.reflex !== undefined) {
      this.resources.reflex = (this.resources.reflex ?? 0) - resources.reflex;
    }
    if (resources.experience !== undefined) {
      this.resources.experience = (this.resources.experience ?? 0) - resources.experience;
    }
    
    return true;
  }

  getResources(): ResourceCost {
    return { ...this.resources };
  }

  // ==================== STATE METHODS ====================

  getPlayerState(): PlayerUpgradeState {
    const upgrades = new Map(this.progress);
    const unlockedSystems = new Set<string>();
    let totalUnlocked = 0;
    let totalMaxed = 0;
    
    // Calculate unlocked systems
    this.systems.forEach((system, systemId) => {
      const allUpgrades = this.getSystemUpgrades(systemId);
      const allUnlocked = allUpgrades.every(u => {
        const progress = this.progress.get(u.id);
        return progress?.unlocked ?? false;
      });
      if (allUnlocked && allUpgrades.length > 0) {
        unlockedSystems.add(systemId);
      }
    });
    
    // Count upgrades
    this.progress.forEach(progress => {
      if (progress.unlocked) {
        totalUnlocked++;
        const upgrade = this.getUpgrade(progress.upgradeId);
        if (upgrade && progress.level >= upgrade.maxLevel) {
          totalMaxed++;
        }
      }
    });
    
    // Calculate total stat modifications
    const totalStatModifications = this.calculateTotalStatModifications();
    
    // Get unlocked abilities
    const unlockedAbilities = this.getUnlockedAbilities();
    
    // Get active set bonuses
    const activeSetBonuses = this.getActiveSetBonuses();
    
    return {
      upgrades,
      unlockedSystems,
      totalUpgradesUnlocked: totalUnlocked,
      totalUpgradesMaxed: totalMaxed,
      resources: this.getResources(),
      totalStatModifications,
      unlockedAbilities,
      activeSetBonuses,
    };
  }

  resetUpgrade(upgradeId: string): boolean {
    const upgrade = this.getUpgrade(upgradeId);
    const progress = this.getUpgradeProgress(upgradeId);
    if (!upgrade || !progress) return false;
    
    // Refund resources (optional - could be disabled)
    // For now, we'll just reset without refund
    
    progress.level = 0;
    progress.unlocked = false;
    progress.unlockedAt = undefined;
    progress.lastUpgradedAt = undefined;
    progress.totalSpent = undefined;
    
    upgrade.level = 0;
    upgrade.unlocked = false;
    
    return true;
  }

  resetAllUpgrades(): void {
    this.progress.forEach((_, upgradeId) => {
      this.resetUpgrade(upgradeId);
    });
  }

  // ==================== VALIDATION METHODS ====================

  validatePrerequisites(upgradeId: string): { valid: boolean; missing: string[] } {
    const upgrade = this.getUpgrade(upgradeId);
    if (!upgrade || !upgrade.prerequisites) {
      return { valid: true, missing: [] };
    }
    
    const missing: string[] = [];
    
    for (const prereq of upgrade.prerequisites) {
      // Check upgrade prerequisite
      if (prereq.upgradeId) {
        const prereqProgress = this.getUpgradeProgress(prereq.upgradeId);
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
      if (prereq.minLevel && this.playerLevel < prereq.minLevel) {
        missing.push(`Level ${prereq.minLevel}`);
        continue;
      }
      
      // Check story progress
      if (prereq.storyProgress && this.storyProgress < prereq.storyProgress) {
        missing.push(`Story progress ${prereq.storyProgress}%`);
        continue;
      }
      
      // Check character unlock
      if (prereq.characterUnlock && !this.unlockedCharacters.has(prereq.characterUnlock)) {
        missing.push(`Character: ${prereq.characterUnlock}`);
        continue;
      }
      
      // Check resource cost prerequisites
      if (prereq.resourceCost && !this.hasResources(prereq.resourceCost)) {
        missing.push('Insufficient resources');
        continue;
      }
    }
    
    return {
      valid: missing.length === 0,
      missing,
    };
  }

  getUpgradeCost(upgradeId: string, targetLevel?: number): ResourceCost {
    const upgrade = this.getUpgrade(upgradeId);
    const progress = this.getUpgradeProgress(upgradeId);
    if (!upgrade) {
      return { currency: 0 };
    }
    
    const currentLevel = progress?.level ?? 0;
    const level = targetLevel ?? (currentLevel + 1);
    
    if (level <= currentLevel) {
      return { currency: 0 };
    }
    
    // Calculate cumulative cost from current level to target level
    let totalCost: ResourceCost = { currency: 0 };
    
    for (let l = currentLevel + 1; l <= level; l++) {
      const levelCost = this.calculateLevelCost(upgrade, l);
      totalCost = this.addResourceCosts(totalCost, levelCost);
    }
    
    return totalCost;
  }

  // ==================== HELPER METHODS ====================

  private hasResources(cost: ResourceCost): boolean {
    if (cost.currency !== undefined && (this.resources.currency ?? 0) < cost.currency) {
      return false;
    }
    if (cost.chaosEnergy !== undefined && (this.resources.chaosEnergy ?? 0) < cost.chaosEnergy) {
      return false;
    }
    if (cost.memoryShards !== undefined && (this.resources.memoryShards ?? 0) < cost.memoryShards) {
      return false;
    }
    if (cost.resonance !== undefined && (this.resources.resonance ?? 0) < cost.resonance) {
      return false;
    }
    if (cost.reflex !== undefined && (this.resources.reflex ?? 0) < cost.reflex) {
      return false;
    }
    if (cost.experience !== undefined && (this.resources.experience ?? 0) < cost.experience) {
      return false;
    }
    return true;
  }

  private calculateLevelCost(upgrade: Upgrade, level: number): ResourceCost {
    const baseCost = upgrade.cost;
    const scaling = upgrade.costScaling;
    
    if (!scaling) {
      return { ...baseCost };
    }
    
    const cost: ResourceCost = {};
    
    // Apply scaling to each resource type
    if (baseCost.currency !== undefined) {
      cost.currency = this.applyScaling(
        baseCost.currency,
        level,
        scaling
      );
    }
    if (baseCost.chaosEnergy !== undefined) {
      cost.chaosEnergy = this.applyScaling(
        baseCost.chaosEnergy,
        level,
        scaling
      );
    }
    if (baseCost.memoryShards !== undefined) {
      cost.memoryShards = this.applyScaling(
        baseCost.memoryShards,
        level,
        scaling
      );
    }
    if (baseCost.resonance !== undefined) {
      cost.resonance = this.applyScaling(
        baseCost.resonance,
        level,
        scaling
      );
    }
    if (baseCost.reflex !== undefined) {
      cost.reflex = this.applyScaling(
        baseCost.reflex,
        level,
        scaling
      );
    }
    if (baseCost.experience !== undefined) {
      cost.experience = this.applyScaling(
        baseCost.experience,
        level,
        scaling
      );
    }
    
    return cost;
  }

  private applyScaling(
    baseValue: number,
    level: number,
    scaling: CostScaling
  ): number {
    if (scaling.customFormula) {
      return scaling.customFormula(level);
    }
    
    switch (scaling.scalingType) {
      case 'linear':
        return baseValue + (baseValue * (level - 1) * (scaling.scalingFactor ?? 1));
      case 'exponential':
        return baseValue * Math.pow(scaling.scalingFactor ?? 1.5, level - 1);
      case 'quadratic':
        return baseValue * Math.pow(level, scaling.scalingFactor ?? 2);
      default:
        return baseValue;
    }
  }

  private addResourceCosts(a: ResourceCost, b: ResourceCost): ResourceCost {
    return {
      currency: (a.currency ?? 0) + (b.currency ?? 0),
      chaosEnergy: (a.chaosEnergy ?? 0) + (b.chaosEnergy ?? 0),
      memoryShards: (a.memoryShards ?? 0) + (b.memoryShards ?? 0),
      resonance: (a.resonance ?? 0) + (b.resonance ?? 0),
      reflex: (a.reflex ?? 0) + (b.reflex ?? 0),
      experience: (a.experience ?? 0) + (b.experience ?? 0),
    };
  }

  private calculateTotalStatModifications(): Map<string, number> {
    const stats = new Map<string, number>();
    
    this.progress.forEach(progress => {
      if (!progress.unlocked) return;
      
      const upgrade = this.getUpgrade(progress.upgradeId);
      if (!upgrade || !upgrade.effects.statModifications) return;
      
      upgrade.effects.statModifications.forEach(mod => {
        const currentValue = stats.get(mod.stat) ?? 0;
        let modValue = mod.value;
        
        // Apply level scaling
        if (mod.scaling === 'linear') {
          modValue = mod.value * progress.level;
        } else if (mod.scaling === 'exponential') {
          modValue = mod.value * Math.pow(1.1, progress.level - 1);
        }
        
        // Apply modification type
        if (mod.type === 'flat') {
          stats.set(mod.stat, currentValue + modValue);
        } else if (mod.type === 'percentage') {
          stats.set(mod.stat, currentValue + modValue);
        } else if (mod.type === 'multiplier') {
          stats.set(mod.stat, currentValue + modValue);
        }
      });
    });
    
    return stats;
  }

  private getUnlockedAbilities(): Set<string> {
    const abilities = new Set<string>();
    
    this.progress.forEach(progress => {
      if (!progress.unlocked) return;
      
      const upgrade = this.getUpgrade(progress.upgradeId);
      if (!upgrade || !upgrade.effects.abilityUnlocks) return;
      
      upgrade.effects.abilityUnlocks.forEach(ability => {
        if (!ability.unlockLevel || progress.level >= ability.unlockLevel) {
          abilities.add(ability.abilityId);
        }
      });
    });
    
    return abilities;
  }

  private getActiveSetBonuses(): import('../types/upgrade.types').SetBonus[] {
    // This would require tracking equipped gear sets
    // For now, return empty array
    return [];
  }

  // ==================== SETTERS FOR EXTERNAL STATE ====================

  setPlayerLevel(level: number): void {
    this.playerLevel = level;
  }

  setStoryProgress(progress: number): void {
    this.storyProgress = progress;
  }

  unlockCharacter(characterId: string): void {
    this.unlockedCharacters.add(characterId);
  }
}

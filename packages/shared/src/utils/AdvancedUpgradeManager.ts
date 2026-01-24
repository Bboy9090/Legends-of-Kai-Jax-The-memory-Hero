/**
 * ADVANCED UPGRADE MANAGER
 * 
 * Extended upgrade manager with advanced features:
 * - Fusion System
 * - Evolution System
 * - Mastery System
 * - Prestige System
 * - Challenge System
 * - Synergy System
 * - Upgrade Trees
 * - Resource Generation
 * - Resource Conversion
 */

import { UpgradeManager } from './UpgradeManager';
import type {
  Upgrade,
  UpgradeFusion,
  UpgradeEvolution,
  UpgradeMastery,
  UpgradePrestige,
  UpgradeChallenge,
  UpgradeSynergy,
  UpgradeTree,
  ResourceCost,
  PlayerUpgradeState,
} from '../types/upgrade.types';
import { UpgradeCategory } from '../types/upgrade.types';
import {
  FUSION_RECIPES,
  EVOLUTION_PATHS,
  MASTERY_DEFINITIONS,
  PRESTIGE_DEFINITIONS,
  UPGRADE_CHALLENGES,
  UPGRADE_SYNERGIES,
  UPGRADE_TREES,
  ALL_ADVANCED_UPGRADES,
  ADVANCED_UPGRADE_SYSTEMS,
} from '../data/advanced_upgrade_data';

export class AdvancedUpgradeManager extends UpgradeManager {
  private fusions: Map<string, UpgradeFusion>;
  private evolutions: Map<string, UpgradeEvolution>;
  private masteries: Map<string, UpgradeMastery>;
  private prestiges: Map<string, UpgradePrestige>;
  private challenges: Map<string, UpgradeChallenge>;
  private synergies: Map<string, UpgradeSynergy>;
  private trees: Map<string, UpgradeTree>;
  private activeChallenges: Set<string>;
  private completedChallenges: Set<string>;
  private activeSynergies: Set<string>;
  private masteryLevels: Map<UpgradeCategory, number>;
  private prestigeLevel: number;
  private prestigeMultiplier: number;
  private resourceGeneration: Map<string, number>;
  private fusionHistory: UpgradeFusion[];
  private evolutionHistory: UpgradeEvolution[];

  constructor(
    initialResources: Partial<ResourceCost> = {},
    playerLevel: number = 1,
    storyProgress: number = 0,
    unlockedCharacters: string[] = []
  ) {
    super(initialResources, playerLevel, storyProgress, unlockedCharacters);
    
    // Initialize advanced systems
    this.fusions = new Map();
    this.evolutions = new Map();
    this.masteries = new Map();
    this.prestiges = new Map();
    this.challenges = new Map();
    this.synergies = new Map();
    this.trees = new Map();
    
    // Load advanced data
    FUSION_RECIPES.forEach(fusion => {
      this.fusions.set(fusion.fusionId, fusion);
    });
    
    EVOLUTION_PATHS.forEach(evolution => {
      this.evolutions.set(evolution.evolutionId, evolution);
    });
    
    MASTERY_DEFINITIONS.forEach(mastery => {
      this.masteries.set(mastery.masteryId, mastery);
    });
    
    PRESTIGE_DEFINITIONS.forEach(prestige => {
      this.prestiges.set(prestige.prestigeId, prestige);
    });
    
    UPGRADE_CHALLENGES.forEach(challenge => {
      this.challenges.set(challenge.challengeId, challenge);
    });
    
    UPGRADE_SYNERGIES.forEach(synergy => {
      this.synergies.set(synergy.synergyId, synergy);
    });
    
    UPGRADE_TREES.forEach(tree => {
      this.trees.set(tree.treeId, tree);
    });
    
    // Load advanced upgrades
    ALL_ADVANCED_UPGRADES.forEach(upgrade => {
      // Add to upgrades map (would need to extend parent class)
    });
    
    // Initialize state
    this.activeChallenges = new Set();
    this.completedChallenges = new Set();
    this.activeSynergies = new Set();
    this.masteryLevels = new Map();
    this.prestigeLevel = 0;
    this.prestigeMultiplier = 1.0;
    this.resourceGeneration = new Map();
    this.fusionHistory = [];
    this.evolutionHistory = [];
    
    // Initialize resource generation
    this.resourceGeneration.set('currency', 0.1);
    this.resourceGeneration.set('chaosEnergy', 0.01);
  }

  // ==================== FUSION SYSTEM ====================

  fuseUpgrades(ingredients: string[]): { success: boolean; result?: string; error?: string } {
    // Find matching fusion recipe
    const fusion = Array.from(this.fusions.values()).find(f =>
      f.ingredients.every(ing => ingredients.includes(ing.upgradeId))
    );
    
    if (!fusion) {
      return { success: false, error: 'No matching fusion recipe found' };
    }
    
    // Check ingredient levels
    for (const ingredient of fusion.ingredients) {
      const progress = this.getUpgradeProgress(ingredient.upgradeId);
      if (!progress || progress.level < ingredient.minLevel) {
        return { success: false, error: `Ingredient ${ingredient.upgradeId} level too low` };
      }
    }
    
    // Check fusion cost
    if (!this.canAffordFusion(fusion)) {
      return { success: false, error: 'Cannot afford fusion cost' };
    }
    
    // Spend resources
    this.spendResources(fusion.fusionCost);
    
    // Roll for success
    const success = Math.random() < fusion.successRate;
    
    if (success) {
      // Create result upgrade
      const resultUpgrade = this.getUpgrade(fusion.result.upgradeId);
      if (resultUpgrade) {
        this.unlockUpgrade(fusion.result.upgradeId);
        if (fusion.result.level > 1) {
          this.levelUpUpgrade(fusion.result.upgradeId, fusion.result.level - 1);
        }
      }
      
      this.fusionHistory.push(fusion);
      return { success: true, result: fusion.result.upgradeId };
    } else {
      // Failure result
      if (fusion.failureResult) {
        const failureUpgrade = this.getUpgrade(fusion.failureResult.upgradeId);
        if (failureUpgrade) {
          this.unlockUpgrade(fusion.failureResult.upgradeId);
        }
      }
      return { success: false, error: 'Fusion failed' };
    }
  }

  private canAffordFusion(fusion: UpgradeFusion): boolean {
    return this.hasResources(fusion.fusionCost);
  }

  // ==================== EVOLUTION SYSTEM ====================

  evolveUpgrade(upgradeId: string): { success: boolean; result?: string; error?: string } {
    const evolution = Array.from(this.evolutions.values()).find(
      e => e.baseUpgradeId === upgradeId
    );
    
    if (!evolution) {
      return { success: false, error: 'No evolution path found for this upgrade' };
    }
    
    const progress = this.getUpgradeProgress(upgradeId);
    if (!progress || progress.level < evolution.requiredLevel) {
      return { success: false, error: 'Upgrade level too low for evolution' };
    }
    
    if (!this.hasResources(evolution.evolutionCost)) {
      return { success: false, error: 'Cannot afford evolution cost' };
    }
    
    // Spend resources
    this.spendResources(evolution.evolutionCost);
    
    // Create evolved upgrade
    const evolvedUpgrade: Upgrade = {
      ...this.getUpgrade(upgradeId)!,
      id: evolution.evolutionResult.upgradeId,
      rarity: evolution.evolutionResult.newRarity,
      maxLevel: evolution.evolutionResult.newMaxLevel,
      effects: {
        ...this.getUpgrade(upgradeId)!.effects,
        statModifications: [
          ...(this.getUpgrade(upgradeId)!.effects.statModifications || []),
          ...evolution.evolutionResult.bonusEffects,
        ],
      },
    };
    
    // Add evolved upgrade
    // (Would need to extend parent class to add upgrades dynamically)
    
    this.evolutionHistory.push(evolution);
    return { success: true, result: evolution.evolutionResult.upgradeId };
  }

  // ==================== MASTERY SYSTEM ====================

  getMasteryLevel(category: UpgradeCategory): number {
    return this.masteryLevels.get(category) ?? 0;
  }

  updateMastery(category: UpgradeCategory): void {
    const mastery = Array.from(this.masteries.values()).find(
      m => m.category === category
    );
    
    if (!mastery) return;
    
    const state = this.getPlayerState();
    const categoryUpgrades = this.getAllUpgrades(category);
    const unlocked = categoryUpgrades.filter(u => {
      const progress = state.upgrades.get(u.id);
      return progress?.unlocked ?? false;
    });
    const maxed = categoryUpgrades.filter(u => {
      const progress = state.upgrades.get(u.id);
      return progress?.unlocked && progress.level >= u.maxLevel;
    });
    const totalLevels = categoryUpgrades.reduce((sum, u) => {
      const progress = state.upgrades.get(u.id);
      return sum + (progress?.level ?? 0);
    }, 0);
    
    // Check if requirements are met
    if (
      unlocked.length >= mastery.requirements.upgradesUnlocked &&
      maxed.length >= mastery.requirements.upgradesMaxed &&
      totalLevels >= mastery.requirements.totalLevels
    ) {
      const currentLevel = this.masteryLevels.get(category) ?? 0;
      if (currentLevel < mastery.maxLevel) {
        this.masteryLevels.set(category, currentLevel + 1);
      }
    }
  }

  // ==================== PRESTIGE SYSTEM ====================

  prestige(): { success: boolean; newLevel?: number; error?: string } {
    const prestigeDef = Array.from(this.prestiges.values())[this.prestigeLevel];
    
    if (!prestigeDef) {
      return { success: false, error: 'No prestige available' };
    }
    
    const state = this.getPlayerState();
    
    // Check requirements
    if (state.totalUpgradesMaxed < prestigeDef.requirements.totalUpgradesMaxed) {
      return { success: false, error: 'Not enough upgrades maxed' };
    }
    
    const totalMastery = Array.from(this.masteryLevels.values()).reduce((a, b) => a + b, 0);
    if (totalMastery < prestigeDef.requirements.masteryLevels) {
      return { success: false, error: 'Not enough mastery levels' };
    }
    
    // Reset upgrades (but keep prestige bonuses)
    this.resetAllUpgrades();
    
    // Apply permanent bonuses
    // (Would need to track permanent bonuses separately)
    
    // Increase prestige level
    this.prestigeLevel++;
    this.prestigeMultiplier = prestigeDef.prestigeMultiplier;
    
    return { success: true, newLevel: this.prestigeLevel };
  }

  // ==================== CHALLENGE SYSTEM ====================

  startChallenge(challengeId: string): boolean {
    const challenge = this.challenges.get(challengeId);
    if (!challenge) return false;
    
    if (this.completedChallenges.has(challengeId)) return false;
    if (this.activeChallenges.has(challengeId)) return false;
    
    this.activeChallenges.add(challengeId);
    return true;
  }

  completeChallenge(challengeId: string): boolean {
    const challenge = this.challenges.get(challengeId);
    if (!challenge) return false;
    
    if (!this.activeChallenges.has(challengeId)) return false;
    
    // Check if all objectives are complete
    const allComplete = challenge.objectives.every(obj => obj.current >= obj.target);
    if (!allComplete) return false;
    
    // Award rewards
    if (challenge.rewards.upgradeId) {
      this.unlockUpgrade(challenge.rewards.upgradeId);
    }
    if (challenge.rewards.resources) {
      this.addResources(challenge.rewards.resources);
    }
    
    this.activeChallenges.delete(challengeId);
    this.completedChallenges.add(challengeId);
    
    return true;
  }

  getActiveChallenges(): UpgradeChallenge[] {
    return Array.from(this.activeChallenges).map(id => this.challenges.get(id)!);
  }

  updateChallengeProgress(challengeId: string, objectiveId: string, progress: number): void {
    const challenge = this.challenges.get(challengeId);
    if (!challenge) return;
    
    const objective = challenge.objectives.find(obj => obj.id === objectiveId);
    if (objective) {
      objective.current = Math.min(objective.current + progress, objective.target);
    }
  }

  // ==================== SYNERGY SYSTEM ====================

  activateSynergy(synergyId: string): boolean {
    const synergy = this.synergies.get(synergyId);
    if (!synergy) return false;
    
    // Check if all required upgrades are unlocked and at required levels
    for (let i = 0; i < synergy.requiredUpgrades.length; i++) {
      const upgradeId = synergy.requiredUpgrades[i];
      const progress = this.getUpgradeProgress(upgradeId);
      const requiredLevel = synergy.requiredLevels?.[i] ?? 1;
      
      if (!progress || !progress.unlocked || progress.level < requiredLevel) {
        return false;
      }
    }
    
    this.activeSynergies.add(synergyId);
    return true;
  }

  checkSynergies(): void {
    // Auto-check and activate synergies
    this.synergies.forEach((synergy, synergyId) => {
      if (!this.activeSynergies.has(synergyId)) {
        this.activateSynergy(synergyId);
      }
    });
  }

  // ==================== UPGRADE TREES ====================

  getUpgradeTree(treeId: string): UpgradeTree | null {
    return this.trees.get(treeId) ?? null;
  }

  getTreePath(treeId: string, fromUpgradeId: string, toUpgradeId: string): string[] | null {
    const tree = this.trees.get(treeId);
    if (!tree) return null;
    
    // Simple pathfinding (BFS)
    const visited = new Set<string>();
    const queue: Array<{ node: string; path: string[] }> = [
      { node: fromUpgradeId, path: [fromUpgradeId] }
    ];
    
    while (queue.length > 0) {
      const { node, path } = queue.shift()!;
      
      if (node === toUpgradeId) {
        return path;
      }
      
      if (visited.has(node)) continue;
      visited.add(node);
      
      const treeNode = tree.nodes.find(n => n.upgradeId === node);
      if (treeNode) {
        treeNode.connections.forEach(connectedId => {
          if (!visited.has(connectedId)) {
            queue.push({ node: connectedId, path: [...path, connectedId] });
          }
        });
      }
    }
    
    return null;
  }

  // ==================== RESOURCE GENERATION ====================

  generateResources(deltaTime: number): void {
    this.resourceGeneration.forEach((rate, resourceType) => {
      const current = this.getResources()[resourceType as keyof ResourceCost] ?? 0;
      const generated = rate * deltaTime * this.prestigeMultiplier;
      
      this.addResources({
        [resourceType]: generated,
      } as Partial<ResourceCost>);
    });
  }

  setResourceGeneration(resourceType: string, rate: number): void {
    this.resourceGeneration.set(resourceType, rate);
  }

  // ==================== RESOURCE CONVERSION ====================

  convertResources(from: ResourceCost, to: ResourceCost): boolean {
    // Check if we have enough resources to convert
    if (!this.hasResources(from)) {
      return false;
    }
    
    // Spend source resources
    this.spendResources(from);
    
    // Add destination resources
    this.addResources(to);
    
    return true;
  }

  // ==================== ENHANCED STATE ====================

  getPlayerState(): PlayerUpgradeState {
    const baseState = super.getPlayerState();
    
    // Update synergies
    this.checkSynergies();
    
    // Update masteries
    Object.values(UpgradeCategory).forEach(category => {
      this.updateMastery(category);
    });
    
    return {
      ...baseState,
      activeSynergies: this.activeSynergies,
      masteryLevels: new Map(this.masteryLevels),
      prestigeLevel: this.prestigeLevel,
      prestigeMultiplier: this.prestigeMultiplier,
      fusionHistory: [...this.fusionHistory],
      evolutionHistory: [...this.evolutionHistory],
      completedChallenges: new Set(this.completedChallenges),
      activeChallenges: new Set(this.activeChallenges),
      upgradeTrees: new Map(this.trees),
      resourceGeneration: new Map(this.resourceGeneration),
    };
  }

  // ==================== HELPER METHODS ====================

  private hasResources(cost: ResourceCost): boolean {
    const resources = this.getResources();
    
    for (const [key, value] of Object.entries(cost)) {
      if (value !== undefined) {
        const current = resources[key as keyof ResourceCost] ?? 0;
        if (current < value) {
          return false;
        }
      }
    }
    
    return true;
  }
}

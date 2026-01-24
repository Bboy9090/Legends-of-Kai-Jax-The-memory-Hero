/**
 * UPGRADE SERIALIZATION UTILITIES
 * 
 * Functions for saving and loading upgrade state
 */

import { UpgradeManager, type PlayerUpgradeState, type ResourceCost } from '../types/upgrade.types';
import { ALL_UPGRADES } from '../data/upgrade_data';

/**
 * Serialize upgrade state for saving
 */
export interface SerializedUpgradeState {
  version: string;
  resources: ResourceCost;
  upgrades: Array<{
    upgradeId: string;
    level: number;
    unlocked: boolean;
    unlockedAt?: number;
    lastUpgradedAt?: number;
    totalSpent?: ResourceCost;
  }>;
  playerLevel: number;
  storyProgress: number;
  unlockedCharacters: string[];
}

/**
 * Serialize upgrade state to JSON
 */
export function serializeUpgradeState(
  upgradeManager: UpgradeManager,
  playerLevel: number,
  storyProgress: number,
  unlockedCharacters: string[]
): SerializedUpgradeState {
  const state = upgradeManager.getPlayerState();
  const resources = upgradeManager.getResources();
  
  const upgrades = Array.from(state.upgrades.entries()).map(([upgradeId, progress]) => ({
    upgradeId,
    level: progress.level,
    unlocked: progress.unlocked,
    unlockedAt: progress.unlockedAt,
    lastUpgradedAt: progress.lastUpgradedAt,
    totalSpent: progress.totalSpent,
  }));
  
  return {
    version: '1.0.0',
    resources,
    upgrades,
    playerLevel,
    storyProgress,
    unlockedCharacters,
  };
}

/**
 * Deserialize upgrade state from JSON
 */
export function deserializeUpgradeState(
  serialized: SerializedUpgradeState
): {
  upgradeManager: UpgradeManager;
  playerLevel: number;
  storyProgress: number;
  unlockedCharacters: string[];
} {
  const upgradeManager = new UpgradeManager(
    serialized.resources,
    serialized.playerLevel,
    serialized.storyProgress,
    serialized.unlockedCharacters
  );
  
  // Restore upgrade progress
  serialized.upgrades.forEach(({ upgradeId, level, unlocked }) => {
    if (unlocked) {
      const upgrade = ALL_UPGRADES.find(u => u.id === upgradeId);
      if (upgrade) {
        // Unlock and level up
        upgradeManager.unlockUpgrade(upgradeId);
        if (level > 1) {
          upgradeManager.levelUpUpgrade(upgradeId, level - 1);
        }
      }
    }
  });
  
  return {
    upgradeManager,
    playerLevel: serialized.playerLevel,
    storyProgress: serialized.storyProgress,
    unlockedCharacters: serialized.unlockedCharacters,
  };
}

/**
 * Export upgrade state to JSON string
 */
export function exportUpgradeState(
  upgradeManager: UpgradeManager,
  playerLevel: number,
  storyProgress: number,
  unlockedCharacters: string[]
): string {
  const serialized = serializeUpgradeState(
    upgradeManager,
    playerLevel,
    storyProgress,
    unlockedCharacters
  );
  return JSON.stringify(serialized, null, 2);
}

/**
 * Import upgrade state from JSON string
 */
export function importUpgradeState(json: string): {
  upgradeManager: UpgradeManager;
  playerLevel: number;
  storyProgress: number;
  unlockedCharacters: string[];
} {
  const serialized = JSON.parse(json) as SerializedUpgradeState;
  return deserializeUpgradeState(serialized);
}

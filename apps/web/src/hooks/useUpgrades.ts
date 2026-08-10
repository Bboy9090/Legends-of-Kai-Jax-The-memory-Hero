import { useState, useCallback } from 'react';
import { useWorldState } from '../lib/stores/useWorldState';
import { useRunner } from '../lib/stores/useRunner';

export interface UpgradeItem {
  id: string;
  name: string;
  category: 'power' | 'speed' | 'defense' | 'utility';
  description: string;
  cost: number;
}

export const ALL_UPGRADES: UpgradeItem[] = [
  { id: 'power-1', name: 'Memory Strike I', category: 'power', description: 'Increases attack power by 10%', cost: 100 },
  { id: 'speed-1', name: 'Zephyr Dash I', category: 'speed', description: 'Increases movement speed by 15%', cost: 100 },
  { id: 'defense-1', name: 'Aegis Shield I', category: 'defense', description: 'Reduces damage taken by 10%', cost: 100 },
  { id: 'utility-1', name: 'Resonance Surge I', category: 'utility', description: 'Faster energy gain', cost: 150 },
];

export function useUpgrades() {
  const worldState = useWorldState();
  const runner = useRunner();
  const [unlocked, setUnlocked] = useState<string[]>(runner.unlockedUpgrades || []);

  const canAfford = useCallback((upgradeId: string) => {
    const item = ALL_UPGRADES.find(u => u.id === upgradeId);
    return item ? runner.totalScore >= item.cost : false;
  }, [runner.totalScore]);

  const isUnlocked = useCallback((upgradeId: string) => {
    return unlocked.includes(upgradeId);
  }, [unlocked]);

  const purchaseUpgrade = useCallback((upgradeId: string) => {
    const item = ALL_UPGRADES.find(u => u.id === upgradeId);
    if (!item || !canAfford(upgradeId) || isUnlocked(upgradeId)) return false;

    setUnlocked(prev => [...prev, upgradeId]);
    return true;
  }, [canAfford, isUnlocked]);

  return {
    unlocked,
    canAfford,
    isUnlocked,
    purchaseUpgrade,
    allUpgrades: ALL_UPGRADES,
    experiencePoints: worldState.experiencePoints,
  };
}

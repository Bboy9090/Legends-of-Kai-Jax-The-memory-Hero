/**
 * React Hook for Universal Legend Upgrade System
 * 
 * Provides easy access to upgrade system functionality in React components
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  UpgradeManager, 
  type Upgrade, 
  type UpgradeCategory,
  type UpgradeProgress,
  type PlayerUpgradeState,
  type ResourceCost,
  UPGRADE_SYSTEMS,
  ALL_UPGRADES
} from '@legends-of-kai-jax/shared';
import { useWorldState } from '../lib/stores/useWorldState';

/**
 * Main hook for accessing upgrade system
 */
export function useUpgrades() {
  const worldState = useWorldState();
  const [upgradeState, setUpgradeState] = useState<PlayerUpgradeState | null>(null);

  // Initialize upgrade system on mount
  useEffect(() => {
    if (!worldState.upgradeManager) {
      worldState.initializeUpgradeSystem();
    }
    if (worldState.upgradeManager) {
      setUpgradeState(worldState.upgradeManager.getPlayerState());
    }
  }, [worldState.upgradeManager]);

  // Sync upgrade state when world state changes
  useEffect(() => {
    if (worldState.upgradeState) {
      setUpgradeState(worldState.upgradeState);
    }
  }, [worldState.upgradeState]);

  const upgradeManager = useMemo(() => {
    return worldState.getUpgradeManager();
  }, [worldState.upgradeManager]);

  const purchaseUpgrade = useCallback((upgradeId: string, level?: number) => {
    const success = worldState.purchaseUpgrade(upgradeId, level);
    if (success && upgradeManager) {
      setUpgradeState(upgradeManager.getPlayerState());
    }
    return success;
  }, [worldState, upgradeManager]);

  const canAfford = useCallback((upgradeId: string, level?: number) => {
    if (!upgradeManager) return false;
    return upgradeManager.canAfford(upgradeId, level);
  }, [upgradeManager]);

  const canUnlock = useCallback((upgradeId: string) => {
    if (!upgradeManager) return false;
    return upgradeManager.canUnlock(upgradeId);
  }, [upgradeManager]);

  const getUpgrade = useCallback((upgradeId: string) => {
    if (!upgradeManager) return null;
    return upgradeManager.getUpgrade(upgradeId);
  }, [upgradeManager]);

  const getUpgradeCost = useCallback((upgradeId: string, targetLevel?: number) => {
    if (!upgradeManager) return { currency: 0 };
    return upgradeManager.getUpgradeCost(upgradeId, targetLevel);
  }, [upgradeManager]);

  const getResources = useCallback(() => {
    if (!upgradeManager) return { currency: 0 };
    return upgradeManager.getResources();
  }, [upgradeManager]);

  const addResources = useCallback((resources: Partial<ResourceCost>) => {
    if (!upgradeManager) return;
    upgradeManager.addResources(resources);
    worldState.syncUpgradeResources();
    setUpgradeState(upgradeManager.getPlayerState());
  }, [upgradeManager, worldState]);

  return {
    upgradeManager,
    upgradeState,
    purchaseUpgrade,
    canAfford,
    canUnlock,
    getUpgrade,
    getUpgradeCost,
    getResources,
    addResources,
    systems: UPGRADE_SYSTEMS,
    allUpgrades: ALL_UPGRADES,
  };
}

/**
 * Hook for getting upgrades by category
 */
export function useUpgradesByCategory(category: UpgradeCategory) {
  const { upgradeManager, allUpgrades } = useUpgrades();
  
  const upgrades = useMemo(() => {
    return allUpgrades.filter(u => u.category === category);
  }, [allUpgrades, category]);

  const getUpgradeProgress = useCallback((upgradeId: string) => {
    if (!upgradeManager) return null;
    return upgradeManager.getUpgradeProgress(upgradeId);
  }, [upgradeManager]);

  return {
    upgrades,
    getUpgradeProgress,
  };
}

/**
 * Hook for getting upgrades in a specific system
 */
export function useUpgradeSystem(systemId: string) {
  const { upgradeManager } = useUpgrades();
  
  const system = useMemo(() => {
    return UPGRADE_SYSTEMS.find(s => s.id === systemId);
  }, [systemId]);

  const upgrades = useMemo(() => {
    if (!upgradeManager || !system) return [];
    return upgradeManager.getSystemUpgrades(systemId);
  }, [upgradeManager, systemId, system]);

  const getUpgradeProgress = useCallback((upgradeId: string) => {
    if (!upgradeManager) return null;
    return upgradeManager.getUpgradeProgress(upgradeId);
  }, [upgradeManager]);

  return {
    system,
    upgrades,
    getUpgradeProgress,
  };
}

/**
 * Hook for getting a specific upgrade with its progress
 */
export function useUpgrade(upgradeId: string) {
  const { upgradeManager, allUpgrades } = useUpgrades();
  
  const upgrade = useMemo(() => {
    return allUpgrades.find(u => u.id === upgradeId) ?? null;
  }, [allUpgrades, upgradeId]);

  const progress = useMemo(() => {
    if (!upgradeManager) return null;
    return upgradeManager.getUpgradeProgress(upgradeId);
  }, [upgradeManager, upgradeId]);

  const cost = useMemo(() => {
    if (!upgradeManager || !progress) return { currency: 0 };
    const targetLevel = progress.unlocked ? progress.level + 1 : 1;
    return upgradeManager.getUpgradeCost(upgradeId, targetLevel);
  }, [upgradeManager, upgradeId, progress]);

  const canAfford = useMemo(() => {
    if (!upgradeManager) return false;
    return upgradeManager.canAfford(upgradeId);
  }, [upgradeManager, upgradeId]);

  const canUnlock = useMemo(() => {
    if (!upgradeManager) return false;
    return upgradeManager.canUnlock(upgradeId);
  }, [upgradeManager, upgradeId]);

  const purchase = useCallback((level?: number) => {
    const { purchaseUpgrade } = useUpgrades();
    return purchaseUpgrade(upgradeId, level);
  }, [upgradeId]);

  return {
    upgrade,
    progress,
    cost,
    canAfford,
    canUnlock,
    purchase,
  };
}

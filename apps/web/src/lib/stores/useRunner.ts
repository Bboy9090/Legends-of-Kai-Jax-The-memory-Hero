import { create } from "zustand";
import { persist } from "zustand/middleware";

export type GameState =
  | "lore-hub"
  | "menu"
  | "campaign-map"
  | "story-mode-select"
  | "story-mode"
  | "mission-select"
  | "adventure-select"
  | "versus-select"
  | "character-select"
  | "customization"
  | "beast-preview"
  | "adventure"
  | "shop"
  | "training"
  | "playing";

/** Campaign node id. Order: start → districts → final boss. */
export type CampaignNodeId =
  | "start"
  | "district-1"
  | "district-2"
  | "district-3"
  | "mid-boss"
  | "district-4"
  | "district-5"
  | "final-boss";

const DEFAULT_UNLOCKED_ARENAS = ["mushroom-plains", "green-valley", "jungle-ruins"];

export const UNLOCKABLE_ARENAS: { id: string; cost: number }[] = [
  { id: "rainbow-castle", cost: 50 },
  { id: "lava-fortress", cost: 100 },
  { id: "space-station", cost: 150 },
];

export function isArenaUnlocked(unlockedArenas: string[], arenaId: string): boolean {
  return unlockedArenas.includes(arenaId) || DEFAULT_UNLOCKED_ARENAS.includes(arenaId);
}

/** Ids that unlock skins vs upgrades. Used by unlockWithXp. */
const XP_SKIN_IDS = new Set(["kai-inferno", "jax-crystal"]);

interface RunnerState {
  gameState: GameState;
  selectedCharacter: string | null;
  activeStoryMissionId: string | null;
  /** Selected adventure mission id (free-arena or mission id). */
  activeAdventureMissionId: string | null;
  setGameState: (s: GameState) => void;
  setCharacter: (id: string | null) => void;
  setActiveStoryMission: (id: string | null) => void;
  setActiveAdventureMission: (id: string | null) => void;
  addScore: (points: number) => void;
  totalScore: number;
  xp: number;
  currency: number;
  addXp: (amount: number) => void;
  addCurrency: (amount: number) => void;
  unlockedArenas: string[];
  unlockArena: (arenaId: string, cost: number) => boolean;
  unlockedSkins: string[];
  unlockedUpgrades: string[];
  unlockWithXp: (id: string, cost: number) => boolean;
  /** Fighter mastery levels (fighterId -> level). Skill-based, no pay-to-win. */
  fighterMastery: Record<string, number>;
  addMastery: (fighterId: string, amount: number) => void;
  /** Cosmetic unlock shards (earned through play). */
  cosmeticShards: number;
  addCosmeticShards: (amount: number) => void;
  /** Unlocked banner titles (cosmetic prestige). */
  unlockedBannerTitles: string[];
  unlockBannerTitle: (id: string) => void;
  /** Unlocked lore entries (Fracture Archives). */
  unlockedLoreIds: string[];
  unlockLore: (id: string) => void;
  campaignCompletedNodes: CampaignNodeId[];
  campaignCurrentNode: CampaignNodeId | null;
  setCampaignCompleted: (nodeId: CampaignNodeId) => void;
  setCampaignCurrentNode: (nodeId: CampaignNodeId | null) => void;
}

const CAMPAIGN_ORDER: CampaignNodeId[] = [
  "start",
  "district-1",
  "district-2",
  "district-3",
  "mid-boss",
  "district-4",
  "district-5",
  "final-boss",
];

export function getNextCampaignNode(id: CampaignNodeId): CampaignNodeId | null {
  const i = CAMPAIGN_ORDER.indexOf(id);
  return i >= 0 && i < CAMPAIGN_ORDER.length - 1 ? CAMPAIGN_ORDER[i + 1] : null;
}

export function isCampaignNodeUnlocked(completed: CampaignNodeId[], nodeId: CampaignNodeId): boolean {
  if (nodeId === "start") return true;
  const i = CAMPAIGN_ORDER.indexOf(nodeId);
  const prev = i > 0 ? CAMPAIGN_ORDER[i - 1] : null;
  return prev !== null && completed.includes(prev);
}

const RUNNER_STORAGE = "MK_RUNNER_PROGRESS_V1";

export const useRunner = create<RunnerState>()(
  persist(
    (set, get) => ({
  gameState: "lore-hub",
  selectedCharacter: "jaxon",
  activeStoryMissionId: null,
  activeAdventureMissionId: null,
  totalScore: 0,
  xp: 0,
  currency: 0,
  unlockedArenas: [] as string[],
  unlockedSkins: [] as string[],
  unlockedUpgrades: [] as string[],
  fighterMastery: {} as Record<string, number>,
  cosmeticShards: 0,
  unlockedBannerTitles: ["rookie"] as string[],
  unlockedLoreIds: [] as string[],
  campaignCompletedNodes: [] as CampaignNodeId[],
  campaignCurrentNode: null,
  setGameState: (gameState) => set({ gameState }),
  setCharacter: (selectedCharacter) => set({ selectedCharacter }),
  setActiveStoryMission: (activeStoryMissionId) => set({ activeStoryMissionId }),
  setActiveAdventureMission: (activeAdventureMissionId) => set({ activeAdventureMissionId }),
  addScore: (points) => set({ totalScore: get().totalScore + points }),
  addXp: (amount) => set({ xp: get().xp + amount }),
  addCurrency: (amount) => set({ currency: get().currency + amount }),
  unlockArena: (arenaId, cost) => {
    const { currency, unlockedArenas } = get();
    if (unlockedArenas.includes(arenaId) || DEFAULT_UNLOCKED_ARENAS.includes(arenaId)) return true;
    if (currency < cost) return false;
    set({ currency: currency - cost, unlockedArenas: [...unlockedArenas, arenaId] });
    return true;
  },
  unlockWithXp: (id, cost) => {
    const { xp, unlockedSkins, unlockedUpgrades } = get();
    const type = XP_SKIN_IDS.has(id) ? "skin" : "upgrade";
    const setIds = type === "skin" ? unlockedSkins : unlockedUpgrades;
    if (setIds.includes(id)) return true;
    if (xp < cost) return false;
    set({
      xp: get().xp - cost,
      ...(type === "skin"
        ? { unlockedSkins: [...unlockedSkins, id] }
        : { unlockedUpgrades: [...unlockedUpgrades, id] }),
    });
    return true;
  },
  addMastery: (fighterId, amount) => {
    const { fighterMastery } = get();
    const current = fighterMastery[fighterId] ?? 0;
    set({ fighterMastery: { ...fighterMastery, [fighterId]: current + amount } });
  },
  addCosmeticShards: (amount) => set({ cosmeticShards: get().cosmeticShards + amount }),
  unlockBannerTitle: (id) => {
    const { unlockedBannerTitles } = get();
    if (unlockedBannerTitles.includes(id)) return;
    set({ unlockedBannerTitles: [...unlockedBannerTitles, id] });
  },
  unlockLore: (id) => {
    const { unlockedLoreIds } = get();
    if (unlockedLoreIds.includes(id)) return;
    set({ unlockedLoreIds: [...unlockedLoreIds, id] });
  },
  setCampaignCompleted: (nodeId) =>
    set((s) => ({
      campaignCompletedNodes: s.campaignCompletedNodes.includes(nodeId)
        ? s.campaignCompletedNodes
        : [...s.campaignCompletedNodes, nodeId],
    })),
  setCampaignCurrentNode: (nodeId) => set({ campaignCurrentNode: nodeId }),
}),
    {
      name: RUNNER_STORAGE,
      partialize: (s) => ({
        totalScore: s.totalScore,
        xp: s.xp,
        currency: s.currency,
        unlockedArenas: s.unlockedArenas,
        unlockedSkins: s.unlockedSkins,
        unlockedUpgrades: s.unlockedUpgrades,
        fighterMastery: s.fighterMastery,
        cosmeticShards: s.cosmeticShards,
        unlockedBannerTitles: s.unlockedBannerTitles,
        unlockedLoreIds: s.unlockedLoreIds,
        campaignCompletedNodes: s.campaignCompletedNodes,
      }),
    }
  )
);

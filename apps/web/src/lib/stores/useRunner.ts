import { create } from "zustand";
import { persist } from "zustand/middleware";

export type GameState =
  | "boot-accessibility"
  | "title"
  | "lore-hub"
  | "menu"
  | "save-slots"
  | "story-hub"
  | "campaign-map"
  | "district-select"
  | "story-mode-select"
  | "story-mode"
  | "mission-select"
  | "versus-select"
  | "character-select"
  | "customization"
  | "beast-preview"
  | "adventure"
  | "vertical-slice"
  | "controller-test"
  | "jax-test"
  | "abilities"
  | "mission-complete"
  | "settings"
  | "codex"
  | "playing";

/** Legacy campaign-node IDs kept only so old battle/session code remains typed while the route is quarantined. */
export type CampaignNodeId =
  | "start"
  | "district-1"
  | "district-2"
  | "district-3"
  | "mid-boss"
  | "district-4"
  | "district-5"
  | "final-boss";

interface ProfileData {
  totalScore: number;
  campaignCompletedNodes: CampaignNodeId[];
  completedStoryMissionIds: string[];
  completedRoamDistrictIds: string[];
  unlockedUpgrades: string[];
  kaiJaxFusionUnlocked: boolean;
  lastPlayedTitle: string | null;
}

interface RunnerState {
  // Runtime State (Reset on app launch, not per-profile)
  gameState: GameState;
  selectedCharacter: string | null;
  activeStoryMissionId: string | null;
  trainingSession: boolean;
  /** Inert compatibility pointer for pre-Bloodward campaign sessions. New story routes must not set it. */
  campaignCurrentNode: CampaignNodeId | null;
  
  // Persistent Profile Management
  activeProfileIndex: number;
  profiles: [ProfileData, ProfileData, ProfileData];

  // Actions
  setGameState: (s: GameState) => void;
  setCharacter: (id: string | null) => void;
  setTrainingSession: (v: boolean) => void;
  setActiveStoryMission: (id: string | null) => void;
  setCampaignCurrentNode: (nodeId: CampaignNodeId | null) => void;
  addScore: (points: number) => void;
  unlockKaiJaxFusion: () => void;
  
  // Profile Actions
  switchProfile: (index: number) => void;
  resetProfile: (index: number) => void;
  
  // Progress (Maps to active profile)
  totalScore: number;
  campaignCompletedNodes: CampaignNodeId[];
  completedStoryMissionIds: string[];
  completedRoamDistrictIds: string[];
  unlockedUpgrades: string[];
  kaiJaxFusionUnlocked: boolean;
  setCampaignCompleted: (nodeId: CampaignNodeId) => void;
  setMissionCompleted: (missionKey: string) => void;
  setRoamDistrictCompleted: (districtKey: string) => void;
}

const DEFAULT_PROFILE: ProfileData = {
  totalScore: 0,
  campaignCompletedNodes: [],
  completedStoryMissionIds: [],
  completedRoamDistrictIds: [],
  unlockedUpgrades: [],
  kaiJaxFusionUnlocked: false,
  lastPlayedTitle: null,
};

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

const CURRENT_PUBLIC_CHARACTER_IDS = new Set(["kai", "jax", "kai-jax", "boryn", "borax"]);

function migrateSelectedCharacter(value: unknown): string | null {
  if (value === null) return null;
  if (value === "kaijax") return "kai-jax";
  if (typeof value === "string" && CURRENT_PUBLIC_CHARACTER_IDS.has(value)) return value;
  return "kai";
}

function normalizeProfile(value: unknown): ProfileData {
  const profile = (value && typeof value === "object") ? value as Partial<ProfileData> : {};
  return {
    ...DEFAULT_PROFILE,
    ...profile,
    campaignCompletedNodes: Array.isArray(profile.campaignCompletedNodes) ? profile.campaignCompletedNodes : [],
    completedStoryMissionIds: Array.isArray(profile.completedStoryMissionIds) ? profile.completedStoryMissionIds : [],
    completedRoamDistrictIds: Array.isArray(profile.completedRoamDistrictIds) ? profile.completedRoamDistrictIds : [],
    unlockedUpgrades: Array.isArray(profile.unlockedUpgrades) ? profile.unlockedUpgrades : [],
    kaiJaxFusionUnlocked: Boolean(profile.kaiJaxFusionUnlocked),
  };
}

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

export const useRunner = create<RunnerState>()(
  persist(
    (set, get) => ({
      // Runtime Initial
      gameState: "lore-hub",
      selectedCharacter: "kai",
      activeStoryMissionId: null,
      trainingSession: false,
      campaignCurrentNode: null,
      
      // Profiles Initial
      activeProfileIndex: 0,
      profiles: [
        { ...DEFAULT_PROFILE },
        { ...DEFAULT_PROFILE },
        { ...DEFAULT_PROFILE }
      ],

      // Progress Initial (Mirrors profile[0])
      totalScore: 0,
      campaignCompletedNodes: [],
      completedStoryMissionIds: [],
      completedRoamDistrictIds: [],
      unlockedUpgrades: [],
      kaiJaxFusionUnlocked: false,

      setGameState: (gameState) =>
        set({
          gameState,
          ...(gameState !== "playing" ? { trainingSession: false } : {}),
        }),
      setTrainingSession: (trainingSession) => set({ trainingSession }),
      setCharacter: (selectedCharacter) => set({ selectedCharacter }),
      setActiveStoryMission: (activeStoryMissionId) => set({ activeStoryMissionId }),
      // Compatibility only. Current Story Hub / Bloodward routes intentionally never call this.
      setCampaignCurrentNode: (campaignCurrentNode) => set({ campaignCurrentNode }),
      
      addScore: (points) => {
        const { totalScore, activeProfileIndex, profiles } = get();
        const newScore = totalScore + points;
        const newProfiles = [...profiles] as [ProfileData, ProfileData, ProfileData];
        newProfiles[activeProfileIndex] = { ...newProfiles[activeProfileIndex], totalScore: newScore };
        set({ totalScore: newScore, profiles: newProfiles });
      },

      unlockKaiJaxFusion: () => {
        const { activeProfileIndex, profiles, kaiJaxFusionUnlocked } = get();
        if (kaiJaxFusionUnlocked) return;
        const newProfiles = [...profiles] as [ProfileData, ProfileData, ProfileData];
        newProfiles[activeProfileIndex] = { ...newProfiles[activeProfileIndex], kaiJaxFusionUnlocked: true };
        set({ kaiJaxFusionUnlocked: true, profiles: newProfiles });
      },

      setCampaignCompleted: (nodeId) => {
        const { campaignCompletedNodes, activeProfileIndex, profiles } = get();
        if (campaignCompletedNodes.includes(nodeId)) return;
        
        const newNodes = [...campaignCompletedNodes, nodeId];
        const newProfiles = [...profiles] as [ProfileData, ProfileData, ProfileData];
        newProfiles[activeProfileIndex] = { ...newProfiles[activeProfileIndex], campaignCompletedNodes: newNodes };
        
        set({
          campaignCompletedNodes: newNodes,
          profiles: newProfiles,
        });
      },

      setMissionCompleted: (missionKey) => {
        const { completedStoryMissionIds, activeProfileIndex, profiles } = get();
        if (completedStoryMissionIds.includes(missionKey)) return;
        
        const newKeys = [...completedStoryMissionIds, missionKey];
        const newProfiles = [...profiles] as [ProfileData, ProfileData, ProfileData];
        newProfiles[activeProfileIndex] = { ...newProfiles[activeProfileIndex], completedStoryMissionIds: newKeys };
        
        set({
          completedStoryMissionIds: newKeys,
          profiles: newProfiles,
        });
      },

      setRoamDistrictCompleted: (districtKey) => {
        const { completedRoamDistrictIds, activeProfileIndex, profiles } = get();
        if (completedRoamDistrictIds.includes(districtKey)) return;
        
        const newKeys = [...completedRoamDistrictIds, districtKey];
        const newProfiles = [...profiles] as [ProfileData, ProfileData, ProfileData];
        newProfiles[activeProfileIndex] = { ...newProfiles[activeProfileIndex], completedRoamDistrictIds: newKeys };
        
        set({
          completedRoamDistrictIds: newKeys,
          profiles: newProfiles,
        });
      },

      switchProfile: (index) => {
        const { profiles } = get();
        const targetProfile = profiles[index];
        if (!targetProfile) return;
        set({
          activeProfileIndex: index,
          totalScore: targetProfile.totalScore,
          campaignCompletedNodes: targetProfile.campaignCompletedNodes,
          completedStoryMissionIds: targetProfile.completedStoryMissionIds || [],
          completedRoamDistrictIds: targetProfile.completedRoamDistrictIds || [],
          unlockedUpgrades: targetProfile.unlockedUpgrades,
          kaiJaxFusionUnlocked: targetProfile.kaiJaxFusionUnlocked,
          campaignCurrentNode: null,
        });
      },

      resetProfile: (index) => {
        const newProfiles = [...get().profiles] as [ProfileData, ProfileData, ProfileData];
        newProfiles[index] = { ...DEFAULT_PROFILE };
        
        if (get().activeProfileIndex === index) {
          set({
            profiles: newProfiles,
            totalScore: DEFAULT_PROFILE.totalScore,
            campaignCompletedNodes: DEFAULT_PROFILE.campaignCompletedNodes,
            completedStoryMissionIds: DEFAULT_PROFILE.completedStoryMissionIds,
            completedRoamDistrictIds: DEFAULT_PROFILE.completedRoamDistrictIds,
            unlockedUpgrades: DEFAULT_PROFILE.unlockedUpgrades,
            kaiJaxFusionUnlocked: DEFAULT_PROFILE.kaiJaxFusionUnlocked,
            campaignCurrentNode: null,
          });
        } else {
          set({ profiles: newProfiles });
        }
      }
    }),
    {
      name: "kai-jax-save",
      version: 2,
      migrate: (persistedState: unknown) => {
        const state = (persistedState && typeof persistedState === "object")
          ? persistedState as Partial<RunnerState>
          : {};
        const rawProfiles = Array.isArray(state.profiles) ? state.profiles : [];
        const profiles: [ProfileData, ProfileData, ProfileData] = [
          normalizeProfile(rawProfiles[0]),
          normalizeProfile(rawProfiles[1]),
          normalizeProfile(rawProfiles[2]),
        ];
        const activeProfileIndex = state.activeProfileIndex === 1 || state.activeProfileIndex === 2
          ? state.activeProfileIndex
          : 0;
        const activeProfile = profiles[activeProfileIndex];

        return {
          ...state,
          activeProfileIndex,
          profiles,
          selectedCharacter: migrateSelectedCharacter(state.selectedCharacter),
          totalScore: activeProfile.totalScore,
          campaignCompletedNodes: activeProfile.campaignCompletedNodes,
          completedStoryMissionIds: activeProfile.completedStoryMissionIds,
          completedRoamDistrictIds: activeProfile.completedRoamDistrictIds,
          unlockedUpgrades: activeProfile.unlockedUpgrades,
          kaiJaxFusionUnlocked: activeProfile.kaiJaxFusionUnlocked,
          // Never revive the old Cross Point/Rift campaign pointer from persisted data.
          campaignCurrentNode: null,
        } as RunnerState;
      },
    }
  )
);

// Expose for cross-store access without circular imports
if (typeof window !== 'undefined') {
  (window as any).runnerStore = useRunner;
}

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type GameState =
  | "lore-hub"
  | "menu"
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
  | "controller-test"
  | "settings"
  | "codex"
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

interface ProfileData {
  totalScore: number;
  campaignCompletedNodes: CampaignNodeId[];
<<<<<<< Updated upstream
  completedStoryMissionIds: string[];
  completedRoamDistrictIds: string[];
=======
>>>>>>> Stashed changes
  unlockedUpgrades: string[];
  lastPlayedTitle: string | null;
}

interface RunnerState {
  // Runtime State (Reset on app launch, not per-profile)
  gameState: GameState;
  selectedCharacter: string | null;
  activeStoryMissionId: string | null;
  trainingSession: boolean;
  
  // Persistent Profile Management
  activeProfileIndex: number;
  profiles: [ProfileData, ProfileData, ProfileData];

  // Actions
  setGameState: (s: GameState) => void;
  setCharacter: (id: string | null) => void;
  setTrainingSession: (v: boolean) => void;
  setActiveStoryMission: (id: string | null) => void;
  addScore: (points: number) => void;
  
  // Profile Actions
  switchProfile: (index: number) => void;
  resetProfile: (index: number) => void;
  
  // Progress (Maps to active profile)
  totalScore: number;
  campaignCompletedNodes: CampaignNodeId[];
<<<<<<< Updated upstream
  completedStoryMissionIds: string[];
  completedRoamDistrictIds: string[];
  unlockedUpgrades: string[];
  setCampaignCompleted: (nodeId: CampaignNodeId) => void;
  setMissionCompleted: (missionKey: string) => void;
  setRoamDistrictCompleted: (districtKey: string) => void;
=======
  unlockedUpgrades: string[];
  setCampaignCompleted: (nodeId: CampaignNodeId) => void;
>>>>>>> Stashed changes
}

const DEFAULT_PROFILE: ProfileData = {
  totalScore: 0,
  campaignCompletedNodes: [],
<<<<<<< Updated upstream
  completedStoryMissionIds: [],
  completedRoamDistrictIds: [],
=======
>>>>>>> Stashed changes
  unlockedUpgrades: [],
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
      selectedCharacter: "jaxon",
      activeStoryMissionId: null,
      trainingSession: false,
      
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
<<<<<<< Updated upstream
      completedStoryMissionIds: [],
      completedRoamDistrictIds: [],
=======
>>>>>>> Stashed changes
      unlockedUpgrades: [],

      setGameState: (gameState) =>
        set({
          gameState,
          ...(gameState !== "playing" ? { trainingSession: false } : {}),
        }),
      setTrainingSession: (trainingSession) => set({ trainingSession }),
      setCharacter: (selectedCharacter) => set({ selectedCharacter }),
      setActiveStoryMission: (activeStoryMissionId) => set({ activeStoryMissionId }),
      
      addScore: (points) => {
        const { totalScore, activeProfileIndex, profiles } = get();
        const newScore = totalScore + points;
        const newProfiles = [...profiles] as [ProfileData, ProfileData, ProfileData];
        newProfiles[activeProfileIndex] = { ...newProfiles[activeProfileIndex], totalScore: newScore };
        set({ totalScore: newScore, profiles: newProfiles });
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

<<<<<<< Updated upstream
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

=======
>>>>>>> Stashed changes
      switchProfile: (index) => {
        const { profiles } = get();
        const targetProfile = profiles[index];
        set({
          activeProfileIndex: index,
          totalScore: targetProfile.totalScore,
          campaignCompletedNodes: targetProfile.campaignCompletedNodes,
<<<<<<< Updated upstream
          completedStoryMissionIds: targetProfile.completedStoryMissionIds || [],
          completedRoamDistrictIds: targetProfile.completedRoamDistrictIds || [],
=======
>>>>>>> Stashed changes
          unlockedUpgrades: targetProfile.unlockedUpgrades,
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
<<<<<<< Updated upstream
            completedStoryMissionIds: DEFAULT_PROFILE.completedStoryMissionIds,
            completedRoamDistrictIds: DEFAULT_PROFILE.completedRoamDistrictIds,
=======
>>>>>>> Stashed changes
            unlockedUpgrades: DEFAULT_PROFILE.unlockedUpgrades,
          });
        } else {
          set({ profiles: newProfiles });
        }
      }
    }),
    {
      name: "kai-jax-save",
    }
  )
);
<<<<<<< Updated upstream

// Expose for cross-store access without circular imports
if (typeof window !== 'undefined') {
  (window as any).runnerStore = useRunner;
}
=======
>>>>>>> Stashed changes

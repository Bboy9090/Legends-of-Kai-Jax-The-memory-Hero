import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";

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
  | "controller-test"
  | "abilities"
  | "mission-complete"
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
  completedStoryMissionIds: string[];
  completedRoamDistrictIds: string[];
  unlockedUpgrades: string[];
  lastPlayedTitle: string | null;
}

export type StorageStatus = "persistent" | "temporary" | "unavailable";

export function detectStorageCapability(): StorageStatus {
  if (typeof window === "undefined") return "unavailable";
  try {
    const storage = window.localStorage;
    const probeKey = "__kai_jax_storage_probe__";
    storage.setItem(probeKey, "1");
    storage.getItem(probeKey);
    storage.removeItem(probeKey);
    return "persistent";
  } catch {
    return "temporary";
  }
}

let currentStorageStatus: StorageStatus = detectStorageCapability();
let publishStorageStatus: ((status: StorageStatus) => void) | null = null;

function updateStorageStatus(status: StorageStatus): void {
  if (currentStorageStatus === status) return;
  currentStorageStatus = status;
  publishStorageStatus?.(status);
}

export interface RunnerState {
  // Runtime State (Reset on app launch, not per-profile)
  gameState: GameState;
  selectedCharacter: string | null;
  activeStoryMissionId: string | null;
  trainingSession: boolean;
  storageStatus: StorageStatus;
  
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
  completedStoryMissionIds: string[];
  completedRoamDistrictIds: string[];
  unlockedUpgrades: string[];
  setCampaignCompleted: (nodeId: CampaignNodeId) => void;
  setMissionCompleted: (missionKey: string) => void;
  setLastPlayedTitle: (title: string | null) => void;
  setRoamDistrictCompleted: (districtKey: string) => void;
}

const DEFAULT_PROFILE: ProfileData = {
  totalScore: 0,
  campaignCompletedNodes: [],
  completedStoryMissionIds: [],
  completedRoamDistrictIds: [],
  unlockedUpgrades: [],
  lastPlayedTitle: null,
};

const RUNNER_SAVE_VERSION = 1;
const RUNNER_BACKUP_SUFFIX = "-backup";

const runnerStorage: StateStorage = {
  getItem: (name) => {
    if (typeof localStorage === "undefined") {
      updateStorageStatus("unavailable");
      return null;
    }
    try {
      const primary = localStorage.getItem(name);
      updateStorageStatus("persistent");
      if (primary) {
        try {
          JSON.parse(primary);
          return primary;
        } catch {
          console.warn("[Save] Primary runner profile is corrupted; trying backup");
        }
      }

      const backup = localStorage.getItem(`${name}${RUNNER_BACKUP_SUFFIX}`);
      if (!backup) return null;

      try {
        JSON.parse(backup);
        return backup;
      } catch {
        console.error("[Save] Runner profile backup is also corrupted");
        return null;
      }
    } catch (error) {
      console.error("[Save] Unable to read runner profile", error);
      updateStorageStatus("temporary");
      return null;
    }
  },

  setItem: (name, value) => {
    if (typeof localStorage === "undefined") {
      updateStorageStatus("unavailable");
      return;
    }
    try {
      const previous = localStorage.getItem(name);
      if (previous) {
        try {
          JSON.parse(previous);
          localStorage.setItem(`${name}${RUNNER_BACKUP_SUFFIX}`, previous);
        } catch {
          // Never preserve a known-bad primary over the last good backup.
        }
      }
      localStorage.setItem(name, value);
      updateStorageStatus("persistent");
    } catch (error) {
      console.error("[Save] Unable to persist runner profile", error);
      updateStorageStatus("temporary");
    }
  },

  removeItem: (name) => {
    if (typeof localStorage === "undefined") {
      updateStorageStatus("unavailable");
      return;
    }
    try {
      localStorage.removeItem(name);
      localStorage.removeItem(`${name}${RUNNER_BACKUP_SUFFIX}`);
      updateStorageStatus("persistent");
    } catch (error) {
      console.error("[Save] Unable to clear runner profile", error);
      updateStorageStatus("temporary");
    }
  },
};

function normalizeProfile(profile?: Partial<ProfileData>): ProfileData {
  return {
    totalScore: Number.isFinite(profile?.totalScore) ? Number(profile?.totalScore) : 0,
    campaignCompletedNodes: Array.isArray(profile?.campaignCompletedNodes) ? profile!.campaignCompletedNodes! : [],
    completedStoryMissionIds: Array.isArray(profile?.completedStoryMissionIds) ? profile!.completedStoryMissionIds! : [],
    completedRoamDistrictIds: Array.isArray(profile?.completedRoamDistrictIds) ? profile!.completedRoamDistrictIds! : [],
    unlockedUpgrades: Array.isArray(profile?.unlockedUpgrades) ? profile!.unlockedUpgrades! : [],
    lastPlayedTitle: typeof profile?.lastPlayedTitle === "string" ? profile.lastPlayedTitle : null,
  };
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

export const useRunner = create<RunnerState>()(
  persist(
    (set, get) => ({
      // Runtime Initial
      gameState: "lore-hub",
      selectedCharacter: "jaxon",
      activeStoryMissionId: null,
      trainingSession: false,
      storageStatus: currentStorageStatus,
      
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

      setLastPlayedTitle: (lastPlayedTitle) => {
        const { activeProfileIndex, profiles } = get();
        const newProfiles = [...profiles] as [ProfileData, ProfileData, ProfileData];
        newProfiles[activeProfileIndex] = { ...newProfiles[activeProfileIndex], lastPlayedTitle };
        set({ profiles: newProfiles });
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
        set({
          activeProfileIndex: index,
          totalScore: targetProfile.totalScore,
          campaignCompletedNodes: targetProfile.campaignCompletedNodes,
          completedStoryMissionIds: targetProfile.completedStoryMissionIds || [],
          completedRoamDistrictIds: targetProfile.completedRoamDistrictIds || [],
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
            completedStoryMissionIds: DEFAULT_PROFILE.completedStoryMissionIds,
            completedRoamDistrictIds: DEFAULT_PROFILE.completedRoamDistrictIds,
            unlockedUpgrades: DEFAULT_PROFILE.unlockedUpgrades,
          });
        } else {
          set({ profiles: newProfiles });
        }
      }
    }),
    {
      name: "kai-jax-save",
      version: RUNNER_SAVE_VERSION,
      storage: createJSONStorage(() => runnerStorage),
      migrate: (persisted) => persisted as RunnerState,
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<RunnerState>;
        const rawProfiles = Array.isArray(saved.profiles) ? saved.profiles : [];
        const profiles = [
          normalizeProfile(rawProfiles[0]),
          normalizeProfile(rawProfiles[1]),
          normalizeProfile(rawProfiles[2]),
        ] as [ProfileData, ProfileData, ProfileData];

        const activeProfileIndex =
          typeof saved.activeProfileIndex === "number" &&
          saved.activeProfileIndex >= 0 &&
          saved.activeProfileIndex < profiles.length
            ? saved.activeProfileIndex
            : 0;
        const active = profiles[activeProfileIndex];

        return {
          ...current,
          ...saved,
          profiles,
          activeProfileIndex,
          totalScore: active.totalScore,
          campaignCompletedNodes: active.campaignCompletedNodes,
          completedStoryMissionIds: active.completedStoryMissionIds,
          completedRoamDistrictIds: active.completedRoamDistrictIds,
          unlockedUpgrades: active.unlockedUpgrades,
          storageStatus: currentStorageStatus,
        };
      },
    }
  )
);

publishStorageStatus = (storageStatus) => {
  queueMicrotask(() => {
    if (useRunner.getState().storageStatus !== storageStatus) {
      useRunner.setState({ storageStatus });
    }
  });
};

// Expose for cross-store access without circular imports
if (typeof window !== 'undefined') {
  (window as any).runnerStore = useRunner;
}

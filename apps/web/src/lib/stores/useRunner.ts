import { create } from "zustand";

export type GameState =
  | "menu"
  | "campaign-map"
  | "story-mode-select"
  | "story-mode"
  | "mission-select"
  | "versus-select"
  | "character-select"
  | "customization"
  | "beast-preview"
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

interface RunnerState {
  gameState: GameState;
  selectedCharacter: string | null;
  setGameState: (s: GameState) => void;
  setCharacter: (id: string | null) => void;
  addScore: (points: number) => void;
  totalScore: number;
  // Campaign: progress through the city toward the big bad
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

export const useRunner = create<RunnerState>((set, get) => ({
  gameState: "menu",
  selectedCharacter: "jaxon",
  totalScore: 0,
  campaignCompletedNodes: [],
  campaignCurrentNode: null,
  setGameState: (gameState) => set({ gameState }),
  setCharacter: (selectedCharacter) => set({ selectedCharacter }),
  addScore: (points) => set({ totalScore: get().totalScore + points }),
  setCampaignCompleted: (nodeId) =>
    set((s) => ({
      campaignCompletedNodes: s.campaignCompletedNodes.includes(nodeId)
        ? s.campaignCompletedNodes
        : [...s.campaignCompletedNodes, nodeId],
    })),
  setCampaignCurrentNode: (nodeId) => set({ campaignCurrentNode: nodeId }),
}));

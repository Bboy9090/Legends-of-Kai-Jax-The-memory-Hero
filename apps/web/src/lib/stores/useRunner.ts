import { create } from "zustand";

export type GameState =
  | "menu"
  | "story-mode-select"
  | "mission-select"
  | "versus-select"
  | "character-select"
  | "customization"
  | "playing";

interface RunnerState {
  gameState: GameState;
  selectedCharacter: string | null;
  setGameState: (s: GameState) => void;
  setCharacter: (id: string | null) => void;
  addScore: (points: number) => void;
  totalScore: number;
}

export const useRunner = create<RunnerState>((set, get) => ({
  gameState: "menu",
  selectedCharacter: "jaxon",
  totalScore: 0,
  setGameState: (gameState) => set({ gameState }),
  setCharacter: (selectedCharacter) => set({ selectedCharacter }),
  addScore: (points) => set({ totalScore: get().totalScore + points }),
}));

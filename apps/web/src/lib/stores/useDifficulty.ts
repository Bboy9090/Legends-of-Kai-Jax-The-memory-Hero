import { create } from "zustand";

export type Difficulty = "story" | "normal" | "hard" | "legendary";

interface DifficultyState {
  difficulty: Difficulty;
  setDifficulty: (difficulty: Difficulty) => void;
}

export const useDifficulty = create<DifficultyState>((set) => ({
  difficulty: "normal",
  setDifficulty: (difficulty) => set({ difficulty }),
}));

export function getDamageTakenMultiplier(difficulty: Difficulty): number {
  switch (difficulty) {
    case "story":
      return 0.75;
    case "normal":
      return 1.0;
    case "hard":
      return 1.15;
    case "legendary":
      return 1.3;
    default:
      return 1.0;
  }
}


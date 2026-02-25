import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Difficulty = "easy" | "normal" | "hard";

const STORAGE_KEY = "MK_DIFFICULTY_V1";

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Easy",
  normal: "Normal",
  hard: "Hard",
};

interface DifficultyState {
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
}

export const useDifficulty = create<DifficultyState>()(
  persist(
    (set) => ({
      difficulty: "normal",
      setDifficulty: (difficulty) => set({ difficulty }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (s) => ({ difficulty: s.difficulty }),
    }
  )
);

/** Movement speed multiplier: Easy 0.7, Normal 1, Hard 1.2 */
export function getMoveSpeedMultiplier(d: Difficulty): number {
  switch (d) {
    case "easy": return 0.7;
    case "hard": return 1.2;
    default: return 1;
  }
}

/** Attack cooldown multiplier: Easy 1.3 (longer), Normal 1, Hard 0.7 (shorter) */
export function getAttackCooldownMultiplier(d: Difficulty): number {
  switch (d) {
    case "easy": return 1.3;
    case "hard": return 0.7;
    default: return 1;
  }
}

/** Damage taken by player multiplier: Easy 0.7, Normal 1, Hard 1.2 */
export function getDamageTakenMultiplier(d: Difficulty): number {
  switch (d) {
    case "easy": return 0.7;
    case "hard": return 1.2;
    default: return 1;
  }
}

/**
 * Character Progression store (Wave 2 integration)
 * Persists per-character level/XP/skills and bridges mission-reward XP into
 * the levelProgressionSystem. Additive: does not replace the existing profile
 * score system in useRunner — it runs alongside it.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CharacterProgression } from "../levelProgressionSystem";
import {
  createCharacterProgression,
  gainXP,
  unlockSkill as applyUnlockSkill,
} from "../levelProgressionSystem";

interface ProgressionState {
  byCharacter: Record<string, CharacterProgression>;

  getProgression: (characterId: string) => CharacterProgression;
  awardXP: (characterId: string, amount: number) => void;
  unlockSkill: (characterId: string, skillId: string) => boolean;
  reset: () => void;
}

export const useProgression = create<ProgressionState>()(
  persist(
    (set, get) => ({
      byCharacter: {},

      getProgression: (characterId) => {
        const existing = get().byCharacter[characterId];
        if (existing) return existing;
        const fresh = createCharacterProgression(characterId);
        set((s) => ({ byCharacter: { ...s.byCharacter, [characterId]: fresh } }));
        return fresh;
      },

      awardXP: (characterId, amount) => {
        if (amount <= 0) return;
        set((s) => {
          const current = s.byCharacter[characterId] ?? createCharacterProgression(characterId);
          return { byCharacter: { ...s.byCharacter, [characterId]: gainXP(current, amount) } };
        });
      },

      unlockSkill: (characterId, skillId) => {
        const current = get().byCharacter[characterId] ?? createCharacterProgression(characterId);
        const updated = applyUnlockSkill(current, skillId);
        if (!updated) return false;
        set((s) => ({ byCharacter: { ...s.byCharacter, [characterId]: updated } }));
        return true;
      },

      reset: () => set({ byCharacter: {} }),
    }),
    { name: "kai-jax-progression" }
  )
);

// Expose for cross-store access without circular imports
if (typeof window !== "undefined") {
  (window as any).progressionStore = useProgression;
}

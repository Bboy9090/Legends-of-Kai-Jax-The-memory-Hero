import { create } from "zustand";
import { initialCompanion, type CompanionState } from "../companion";

interface CompanionStore {
  /** Which brother is fighting beside the player; null when the active hero has no companion (e.g. fused). */
  hero: "kai" | "jax" | null;
  state: CompanionState;
  /** Total strikes landed this mission (also what the E2E asserts on). */
  strikes: number;
  /** Total damage the companion has dealt this mission. */
  damageDealt: number;
  reset: (player: { x: number; z: number; rotY: number }) => void;
}

export const useCompanion = create<CompanionStore>((set) => ({
  hero: null,
  state: initialCompanion({ x: 0, z: 0, rotY: 0 }),
  strikes: 0,
  damageDealt: 0,
  reset: (player) => set({ hero: null, state: initialCompanion(player), strikes: 0, damageDealt: 0 }),
}));

if (typeof window !== "undefined") (window as unknown as { companionStore: typeof useCompanion }).companionStore = useCompanion;

import { create } from "zustand";

export type GamePhase = "ready" | "playing" | "ended";

interface GameState {
  phase: GamePhase;
  start: () => void;
  end: () => void;
  reset: () => void;
}

export const useGame = create<GameState>((set) => ({
  phase: "ready",
  start: () => set({ phase: "playing" }),
  end: () => set({ phase: "ended" }),
  reset: () => set({ phase: "ready" }),
}));

import { create } from "zustand";
import { breakCombo, initialCombo, refreshCombo, registerHit, tickCombo, type ComboState } from "../comboSystem";

interface ComboStore {
  state: ComboState;
  hit: () => void;
  parry: () => void;
  /** Real damage taken. */
  breakNow: () => void;
  tick: (dt: number) => void;
  reset: () => void;
}

export const useCombo = create<ComboStore>((set, get) => ({
  state: initialCombo(),
  hit: () => set({ state: registerHit(get().state) }),
  parry: () => set({ state: refreshCombo(get().state) }),
  breakNow: () => {
    const next = breakCombo(get().state);
    if (next !== get().state) set({ state: next });
  },
  tick: (dt) => {
    const prev = get().state;
    const next = tickCombo(prev, dt);
    if (next !== prev) set({ state: next });
  },
  reset: () => set({ state: initialCombo() }),
}));

if (typeof window !== "undefined") (window as unknown as { comboStore: typeof useCombo }).comboStore = useCombo;

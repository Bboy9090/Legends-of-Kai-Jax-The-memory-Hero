import { create } from "zustand";
import type { HitKind } from "../combatFeedback";

export interface DamagePopup {
  id: number;
  x: number;
  y: number;
  z: number;
  amount: number;
  kind: HitKind;
  /** When set, shown instead of the number (e.g. PARRY!). */
  text?: string;
}

interface DamagePopupState {
  popups: DamagePopup[];
  push: (popup: Omit<DamagePopup, "id">) => void;
  clear: () => void;
}

const POPUP_LIFETIME_MS = 1100;
const MAX_POPUPS = 24;
let nextId = 0;

export const useDamagePopups = create<DamagePopupState>((set) => ({
  popups: [],
  push: (popup) => {
    const id = ++nextId;
    set((s) => ({ popups: [...s.popups.slice(-(MAX_POPUPS - 1)), { ...popup, id }] }));
    setTimeout(() => set((s) => ({ popups: s.popups.filter((p) => p.id !== id) })), POPUP_LIFETIME_MS);
  },
  clear: () => set({ popups: [] }),
}));

export function pushDamagePopup(popup: Omit<DamagePopup, "id">) {
  useDamagePopups.getState().push(popup);
}

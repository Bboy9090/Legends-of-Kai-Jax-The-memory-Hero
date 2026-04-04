import { create } from "zustand";

const KEY = "MK_A11Y_V1";

interface AccessibilityState {
  /** Reduce screen shake, post-FX punch scaling, and motion-heavy cues */
  reduceMotion: boolean;
  setReduceMotion: (v: boolean) => void;
  loadFromStorage: () => void;
}

function safeLoad(): boolean {
  try {
    if (typeof window === "undefined") return false;
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return false;
    const o = JSON.parse(raw);
    return typeof o?.reduceMotion === "boolean" ? o.reduceMotion : false;
  } catch {
    return false;
  }
}

function safeSave(v: boolean) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(KEY, JSON.stringify({ reduceMotion: v }));
  } catch {
    // ignore
  }
}

export const useAccessibility = create<AccessibilityState>((set) => ({
  reduceMotion: typeof window !== "undefined" ? safeLoad() : false,
  setReduceMotion: (v) => {
    safeSave(v);
    set({ reduceMotion: v });
  },
  loadFromStorage: () => set({ reduceMotion: safeLoad() }),
}));

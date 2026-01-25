import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type BeastPresetKind =
  | "auto"
  | "wolf"
  | "fox"
  | "cat"
  | "boar"
  | "turtle"
  | "dragon"
  | "bird"
  | "reptile"
  | "spider";

const STORAGE_KEY = "MK_BEAST_PRESET_V1";

function safeLoadPreset(): BeastPresetKind {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return "auto";
    const v = raw as BeastPresetKind;
    const allowed: Record<BeastPresetKind, true> = {
      auto: true,
      wolf: true,
      fox: true,
      cat: true,
      boar: true,
      turtle: true,
      dragon: true,
      bird: true,
      reptile: true,
      spider: true,
    };
    return allowed[v] ? v : "auto";
  } catch {
    return "auto";
  }
}

function safeSavePreset(preset: BeastPresetKind) {
  try {
    localStorage.setItem(STORAGE_KEY, preset);
  } catch {
    // ignore
  }
}

interface BeastPresetState {
  preset: BeastPresetKind;
  setPreset: (preset: BeastPresetKind) => void;
}

export const useBeastPreset = create<BeastPresetState>()(
  subscribeWithSelector((set) => ({
    preset: typeof window !== "undefined" ? safeLoadPreset() : "auto",
    setPreset: (preset) =>
      set(() => {
        safeSavePreset(preset);
        return { preset };
      }),
  }))
);


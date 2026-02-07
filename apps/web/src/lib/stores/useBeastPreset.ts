/**
 * Beast preset kind — drives AnatomicalBeastModel silhouette (wolf, fox, cat, etc.).
 * Persisted so the same layered character design is used in battle, missions, and previews.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type BeastPresetKind =
  | "wolf"
  | "fox"
  | "cat"
  | "boar"
  | "turtle"
  | "dragon"
  | "bird"
  | "reptile"
  | "spider"
  | "auto";

const STORAGE_KEY = "MK_BEAST_PRESET_V1";

interface BeastPresetState {
  preset: BeastPresetKind;
  setPreset: (preset: BeastPresetKind) => void;
}

export const useBeastPreset = create<BeastPresetState>()(
  persist(
    (set) => ({
      preset: "auto",
      setPreset: (preset) => set({ preset }),
    }),
    { name: STORAGE_KEY }
  )
);

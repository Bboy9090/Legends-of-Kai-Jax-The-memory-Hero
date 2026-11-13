import { create } from "zustand";
import { emptyStats, normalizeStats, recordDodge, recordStrike, type DefenseOutcome, type DefenseStats } from "../defenseStats";
import { useAccessibility } from "./useAccessibility";

const KEY = "kaijax_defense_stats_v1";

function load(): DefenseStats {
  try {
    if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(KEY);
      if (raw) return normalizeStats(JSON.parse(raw));
    }
  } catch {
    // corrupt or blocked storage: start fresh
  }
  return emptyStats();
}

function save(s: DefenseStats) {
  try {
    if (typeof localStorage !== "undefined") localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // quota / private mode: the session still counts
  }
}

interface DefenseStatsStore {
  stats: DefenseStats;
  /** When the player last pressed dodge (ms, performance.now), to tell "pressed too early" from "never tried". */
  lastPressAt: number | null;
  notePress: () => void;
  /** Record a strike's outcome. `delay` is seconds since the dodge press, if one is known. */
  noteStrike: (outcome: DefenseOutcome, delay?: number | null) => void;
  reset: () => void;
  exportJson: () => string;
}

const timing = () => useAccessibility.getState().parryTiming;

export const useDefenseStats = create<DefenseStatsStore>((set, get) => ({
  stats: load(),
  lastPressAt: null,
  notePress: () => {
    const stats = recordDodge(get().stats, timing());
    save(stats);
    set({ stats, lastPressAt: performance.now() });
  },
  noteStrike: (outcome, delay) => {
    // A hit has no dodge-relative delay of its own: derive it from the last press, if there was a recent one.
    const since = get().lastPressAt === null ? null : (performance.now() - get().lastPressAt!) / 1000;
    const stats = recordStrike(get().stats, { outcome, timing: timing(), delay: outcome === "hit" ? since : delay });
    save(stats);
    set({ stats });
  },
  reset: () => {
    const stats = emptyStats();
    save(stats);
    set({ stats, lastPressAt: null });
  },
  exportJson: () => JSON.stringify(get().stats, null, 2),
}));

if (typeof window !== "undefined") (window as unknown as { defenseStats: typeof useDefenseStats }).defenseStats = useDefenseStats;

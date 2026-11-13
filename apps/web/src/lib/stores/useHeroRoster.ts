import { create } from "zustand";
import { persist } from "zustand/middleware";
import { HERO_ORDER, normalizeHeroId } from "../heroVisualIdentity";

/** Heroes available from the first launch. Everyone else is earned through story missions. */
export const DEFAULT_UNLOCKED_HEROES = ["kai", "jax", "kai-jax"] as const;

const KNOWN = new Set<string>(HERO_ORDER);

interface HeroRosterState {
  unlockedHeroIds: string[];
  /** Newly unlocked heroes waiting to be celebrated by the "NEW HERO UNLOCKED" modal. */
  pendingUnlocks: string[];
  unlockHero: (id: string) => boolean;
  unlockHeroes: (ids: readonly string[] | undefined) => string[];
  acknowledgeUnlock: () => void;
  isUnlocked: (id: string) => boolean;
  resetRoster: () => void;
}

export const useHeroRoster = create<HeroRosterState>()(
  persist(
    (set, get) => ({
      unlockedHeroIds: [...DEFAULT_UNLOCKED_HEROES],
      pendingUnlocks: [],

      unlockHero: (rawId) => {
        const id = normalizeHeroId(rawId);
        if (!KNOWN.has(id) || get().unlockedHeroIds.includes(id)) return false;
        set((s) => ({
          unlockedHeroIds: [...s.unlockedHeroIds, id],
          pendingUnlocks: [...s.pendingUnlocks, id],
        }));
        return true;
      },

      unlockHeroes: (ids) => (ids ?? []).filter((id) => get().unlockHero(id)).map(normalizeHeroId),

      acknowledgeUnlock: () => set((s) => ({ pendingUnlocks: s.pendingUnlocks.slice(1) })),

      isUnlocked: (id) => get().unlockedHeroIds.includes(normalizeHeroId(id)),

      resetRoster: () => set({ unlockedHeroIds: [...DEFAULT_UNLOCKED_HEROES], pendingUnlocks: [] }),
    }),
    {
      name: "kai-jax-hero-roster",
      version: 1,
      partialize: (s) => ({ unlockedHeroIds: s.unlockedHeroIds, pendingUnlocks: s.pendingUnlocks }),
    },
  ),
);

if (typeof window !== "undefined") {
  (window as any).heroRosterStore = useHeroRoster;
}

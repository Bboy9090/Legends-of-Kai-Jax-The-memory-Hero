import { create } from "zustand";

const TUTORIAL_STORAGE_KEY = "MK_TUTORIAL_SEEN_V1";

function getHasSeenTutorial(): boolean {
  if (typeof window === "undefined") return true; // SSR: don't show
  try {
    return localStorage.getItem(TUTORIAL_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

interface TutorialState {
  hasSeenTutorial: boolean;
  markTutorialSeen: () => void;
}

export const useTutorial = create<TutorialState>((set) => ({
  hasSeenTutorial: getHasSeenTutorial(),
  markTutorialSeen: () => {
    try {
      localStorage.setItem(TUTORIAL_STORAGE_KEY, "1");
    } catch {
      /* noop */
    }
    set({ hasSeenTutorial: true });
  },
}));

import { create } from "zustand";
import {
  DEFAULT_ACCESSIBILITY,
  applyAccessibilityToDocument,
  normalizeAccessibility,
  type AccessibilitySettings,
} from "../accessibilitySettings";

const KEY_V2 = "kaijax_a11y_v2";
const KEY_V1 = "MK_A11Y_V1"; // legacy: { reduceMotion }

interface AccessibilityState extends AccessibilitySettings {
  /** Legacy alias of `reducedMotion`, kept so existing camera/battle code keeps working. */
  reduceMotion: boolean;
  setReduceMotion: (v: boolean) => void;
  update: (patch: Partial<AccessibilitySettings>) => void;
  reset: () => void;
  loadFromStorage: () => void;
}

function read(): AccessibilitySettings {
  try {
    if (typeof window === "undefined") return DEFAULT_ACCESSIBILITY;
    const v2 = window.localStorage.getItem(KEY_V2);
    if (v2) return normalizeAccessibility(JSON.parse(v2));
    const v1 = window.localStorage.getItem(KEY_V1);
    if (v1) return normalizeAccessibility(JSON.parse(v1));
  } catch {
    // corrupt storage falls through to defaults
  }
  return DEFAULT_ACCESSIBILITY;
}

function write(s: AccessibilitySettings) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(KEY_V2, JSON.stringify(s));
    window.localStorage.setItem(KEY_V1, JSON.stringify({ reduceMotion: s.reducedMotion }));
  } catch {
    // quota / private mode: settings still apply for this session
  }
}

const pick = (st: AccessibilityState): AccessibilitySettings => ({
  reducedMotion: st.reducedMotion,
  colorblindMode: st.colorblindMode,
  subtitleScale: st.subtitleScale,
  hudButtonScale: st.hudButtonScale,
  hudOpacity: st.hudOpacity,
  hudEdgeOffset: st.hudEdgeOffset,
  hapticsEnabled: st.hapticsEnabled,
});

const withAlias = (s: AccessibilitySettings) => ({ ...s, reduceMotion: s.reducedMotion });

export const useAccessibility = create<AccessibilityState>((set, get) => {
  const initial = read();
  if (typeof document !== "undefined") applyAccessibilityToDocument(initial);
  const commit = (next: AccessibilitySettings) => {
    write(next);
    applyAccessibilityToDocument(next);
    set(withAlias(next));
  };
  return {
    ...withAlias(initial),
    setReduceMotion: (v) => commit({ ...pick(get()), reducedMotion: v }),
    update: (patch) => commit(normalizeAccessibility({ ...pick(get()), ...patch })),
    reset: () => commit(DEFAULT_ACCESSIBILITY),
    loadFromStorage: () => {
      const s = read();
      applyAccessibilityToDocument(s);
      set(withAlias(s));
    },
  };
});

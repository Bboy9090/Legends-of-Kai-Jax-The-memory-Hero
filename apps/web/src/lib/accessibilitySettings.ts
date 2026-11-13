/**
 * Accessibility + HUD comfort settings (model, validation and DOM application).
 * Pure functions only, so it is unit-testable without React.
 */
export type ColorblindMode = "none" | "protanopia" | "deuteranopia" | "tritanopia";
export type SubtitleScale = "normal" | "large";

export interface AccessibilitySettings {
  reducedMotion: boolean;
  colorblindMode: ColorblindMode;
  subtitleScale: SubtitleScale;
  /** 0.8–1.4 multiplier for on-screen touch buttons. */
  hudButtonScale: number;
  /** 0.4–1 opacity of touch controls. */
  hudOpacity: number;
  /** 0–48 px extra inset from the screen edge for touch controls. */
  hudEdgeOffset: number;
  hapticsEnabled: boolean;
}

export const DEFAULT_ACCESSIBILITY: AccessibilitySettings = {
  reducedMotion: false,
  colorblindMode: "none",
  subtitleScale: "normal",
  hudButtonScale: 1,
  hudOpacity: 0.9,
  hudEdgeOffset: 0,
  hapticsEnabled: true,
};

export const COLORBLIND_MODES: readonly ColorblindMode[] = ["none", "protanopia", "deuteranopia", "tritanopia"];

const clamp = (n: unknown, min: number, max: number, fallback: number) =>
  typeof n === "number" && Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;

/** Accepts anything (old save, hand-edited JSON) and returns a fully valid settings object. */
export function normalizeAccessibility(raw: unknown): AccessibilitySettings {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const d = DEFAULT_ACCESSIBILITY;
  return {
    // `reduceMotion` is the key the first version of this store used.
    reducedMotion: typeof o.reducedMotion === "boolean" ? o.reducedMotion : typeof o.reduceMotion === "boolean" ? o.reduceMotion : d.reducedMotion,
    colorblindMode: COLORBLIND_MODES.includes(o.colorblindMode as ColorblindMode) ? (o.colorblindMode as ColorblindMode) : d.colorblindMode,
    subtitleScale: o.subtitleScale === "large" ? "large" : "normal",
    hudButtonScale: clamp(o.hudButtonScale, 0.8, 1.4, d.hudButtonScale),
    hudOpacity: clamp(o.hudOpacity, 0.4, 1, d.hudOpacity),
    hudEdgeOffset: Math.round(clamp(o.hudEdgeOffset, 0, 48, d.hudEdgeOffset)),
    hapticsEnabled: typeof o.hapticsEnabled === "boolean" ? o.hapticsEnabled : d.hapticsEnabled,
  };
}

/**
 * Publishes the settings to the document so CSS and components read one source of truth.
 * Colorblind modes re-map the red/green danger-vs-safe HUD colours to hues that stay distinguishable;
 * they do not tint the whole screen.
 */
export function applyAccessibilityToDocument(s: AccessibilitySettings, root: HTMLElement = document.documentElement): void {
  root.dataset.cb = s.colorblindMode;
  root.dataset.reducedMotion = String(s.reducedMotion);
  root.dataset.subtitles = s.subtitleScale;
  root.style.setProperty("--kj-hud-scale", String(s.hudButtonScale));
  root.style.setProperty("--kj-hud-opacity", String(s.hudOpacity));
  root.style.setProperty("--kj-hud-edge", `${s.hudEdgeOffset}px`);
}

/** Vibrate only when the player allows it and the device supports it. */
export function vibrateIfAllowed(pattern: number | number[], s: Pick<AccessibilitySettings, "hapticsEnabled">): boolean {
  if (!s.hapticsEnabled || typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return false;
  try {
    return navigator.vibrate(pattern);
  } catch {
    return false;
  }
}

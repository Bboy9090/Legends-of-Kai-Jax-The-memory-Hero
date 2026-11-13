import { describe, expect, it, vi } from "vitest";
import { DEFAULT_ACCESSIBILITY, applyAccessibilityToDocument, normalizeAccessibility, vibrateIfAllowed } from "./accessibilitySettings";

describe("accessibility settings", () => {
  it("defaults are valid and idempotent", () => expect(normalizeAccessibility(DEFAULT_ACCESSIBILITY)).toEqual(DEFAULT_ACCESSIBILITY));

  it("clamps out-of-range and rejects wrong types", () => {
    const s = normalizeAccessibility({ hudButtonScale: 9, hudOpacity: 0, hudEdgeOffset: 500.4, colorblindMode: "lava", subtitleScale: "huge", hapticsEnabled: "yes" });
    expect(s).toMatchObject({ hudButtonScale: 1.4, hudOpacity: 0.4, hudEdgeOffset: 48, colorblindMode: "none", subtitleScale: "normal", hapticsEnabled: true });
    expect(normalizeAccessibility(null)).toEqual(DEFAULT_ACCESSIBILITY);
  });

  it("migrates the legacy { reduceMotion } shape", () => {
    expect(normalizeAccessibility({ reduceMotion: true }).reducedMotion).toBe(true);
    expect(normalizeAccessibility({ reduceMotion: true, reducedMotion: false }).reducedMotion).toBe(false);
  });

  it("publishes settings to the root element", () => {
    const style = new Map<string, string>();
    const root = { dataset: {} as Record<string, string>, style: { setProperty: (k: string, v: string) => void style.set(k, v) } } as unknown as HTMLElement;
    applyAccessibilityToDocument({ ...DEFAULT_ACCESSIBILITY, colorblindMode: "deuteranopia", reducedMotion: true, hudEdgeOffset: 20, subtitleScale: "large" }, root);
    expect(root.dataset).toMatchObject({ cb: "deuteranopia", reducedMotion: "true", subtitles: "large" });
    expect(style.get("--kj-hud-edge")).toBe("20px");
  });

  it("only vibrates when allowed", () => {
    const vibrate = vi.fn(() => true);
    vi.stubGlobal("navigator", { vibrate });
    expect(vibrateIfAllowed(20, { hapticsEnabled: false })).toBe(false);
    expect(vibrate).not.toHaveBeenCalled();
    expect(vibrateIfAllowed(20, { hapticsEnabled: true })).toBe(true);
    expect(vibrate).toHaveBeenCalledWith(20);
    vi.unstubAllGlobals();
  });
});

import { describe, expect, it } from "vitest";
import { MIN_VISIBLE_WIDTH, framedFov, framingScale, visibleWidth } from "./cameraFraming";

describe("camera framing", () => {
  it("computes visible width from distance, fov and aspect", () => {
    // 90deg vertical fov: height = 2*d; width = height * aspect.
    expect(visibleWidth(5, 90, 1)).toBeCloseTo(10, 5);
    expect(visibleWidth(5, 90, 0.5)).toBeCloseTo(5, 5);
  });

  it("a phone in portrait needs the camera pulled back; landscape and desktop do not", () => {
    const portrait = 390 / 844;
    const dist = 7.3;
    const fov = framedFov(49, portrait);
    const k = framingScale(dist, fov, portrait);
    expect(k).toBeGreaterThan(1.3);
    expect(visibleWidth(dist * k, fov, portrait)).toBeCloseTo(MIN_VISIBLE_WIDTH, 5);
    expect(framingScale(dist, 49, 16 / 9)).toBe(1);
    expect(framingScale(dist, 49, 844 / 390)).toBe(1);
  });

  it("widens the fov only on tall screens, and never beyond the bonus", () => {
    expect(framedFov(49, 1)).toBe(49);
    expect(framedFov(49, 1.78)).toBe(49);
    expect(framedFov(49, 0.46)).toBeGreaterThan(55);
    expect(framedFov(49, 0.46)).toBeLessThanOrEqual(58);
    expect(framedFov(49, 0.1)).toBeLessThanOrEqual(58);
  });

  it("guards against bad input", () => {
    expect(framingScale(0, 49, 0.5)).toBe(1);
    expect(framingScale(5, 49, 0)).toBe(1);
    expect(framedFov(49, NaN)).toBe(49);
  });
});

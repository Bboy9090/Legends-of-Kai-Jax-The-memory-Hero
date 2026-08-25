import { describe, expect, it } from "vitest";
import {
  getImpactProfile,
  impactProfileForDamage,
  sampleCameraShake,
} from "./combatPresentation";

describe("combat presentation profiles", () => {
  it("scales impact intensity by authored move class", () => {
    expect(getImpactProfile("ultimate").shakeIntensity).toBeGreaterThan(
      getImpactProfile("special").shakeIntensity
    );
    expect(getImpactProfile("special").shakeIntensity).toBeGreaterThan(
      getImpactProfile("punch").shakeIntensity
    );
  });

  it("only adds damage-triggered slow motion for meaningful hits", () => {
    expect(impactProfileForDamage(6, "punch").slowMoDurationMs).toBe(0);
    expect(impactProfileForDamage(18, "kick").slowMoDurationMs).toBeGreaterThan(0);
  });

  it("produces deterministic camera samples", () => {
    const a = sampleCameraShake(0.123, 0.8);
    const b = sampleCameraShake(0.123, 0.8);
    expect(a).toEqual(b);
  });

  it("sanitizes invalid shake inputs", () => {
    expect(sampleCameraShake(Number.NaN, Number.NaN)).toEqual({ x: 0, y: 0, z: 0 });
  });
});

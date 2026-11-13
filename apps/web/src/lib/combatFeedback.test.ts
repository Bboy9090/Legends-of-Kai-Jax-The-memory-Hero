import { describe, expect, it } from "vitest";
import {
  HIT_STOP_SECONDS,
  classifyHit,
  clampCritChance,
  critMultiplier,
  damageNumberStyle,
  decayShake,
  dampedShakeOffset,
  rollCrit,
  tierForAttackType,
  tierForMoveKey,
} from "./combatFeedback";

describe("combatFeedback", () => {
  it("gives Tier 1 / basic non-crit hits no hit-stop and no shake", () => {
    const fb = classifyHit({ tier: 1, isCrit: false });
    expect(fb).toMatchObject({ kind: "normal", hitStopSeconds: 0, shakeIntensity: 0 });
  });

  it("gives Tier 2, Ultimate and crit hits exactly a 50ms hit-stop and a shake", () => {
    expect(HIT_STOP_SECONDS).toBe(0.05);
    for (const input of [
      { tier: 2 as const, isCrit: false },
      { tier: 3 as const, isCrit: false },
      { tier: 1 as const, isCrit: true },
    ]) {
      const fb = classifyHit(input);
      expect(fb.hitStopSeconds).toBe(0.05);
      expect(fb.shakeIntensity).toBeGreaterThan(0);
    }
  });

  it("classifies kinds: ultimate beats crit, crit beats elemental", () => {
    expect(classifyHit({ tier: 3, isCrit: true }).kind).toBe("ultimate");
    expect(classifyHit({ tier: 2, isCrit: true, elemental: true }).kind).toBe("critical");
    expect(classifyHit({ tier: 2, isCrit: false, elemental: true }).kind).toBe("elemental");
    expect(classifyHit({ tier: 2, isCrit: false }).kind).toBe("normal");
  });

  it("maps attack types and move keys to tiers", () => {
    expect(tierForAttackType("punch")).toBe(1);
    expect(tierForAttackType("kick")).toBe(1);
    expect(tierForAttackType("special")).toBe(2);
    expect(tierForAttackType("ultimate")).toBe(3);
    expect(["light1", "light2", "light3"].map(tierForMoveKey)).toEqual([1, 1, 1]);
    expect(tierForMoveKey("heavy")).toBe(2);
    expect(tierForMoveKey("skill")).toBe(2);
  });

  it("styles damage numbers by hit type", () => {
    expect(damageNumberStyle("normal", 10)).toMatchObject({ color: "#ffffff", scale: 1, label: null });
    const crit = damageNumberStyle("critical", 60);
    expect(crit.color).toBe("#ffd24a");
    expect(crit.label).toBe("CRIT!");
    expect(crit.scale).toBeGreaterThan(1.35);
    expect(damageNumberStyle("critical", 9999).scale).toBeLessThanOrEqual(2);
    expect(damageNumberStyle("critical", 80).scale).toBeGreaterThan(damageNumberStyle("critical", 10).scale);
    expect(damageNumberStyle("elemental", 10).color).toBe("#35e6ff");
    expect(damageNumberStyle("ultimate", 10).color).toBe("#b36bff");
  });

  it("damps shake monotonically and snaps to zero", () => {
    let v = 1;
    let prev = v;
    for (let i = 0; i < 20; i++) {
      v = decayShake(v, 1 / 60);
      expect(v).toBeLessThanOrEqual(prev);
      prev = v;
    }
    expect(decayShake(0.005, 1 / 60)).toBe(0);
    expect(decayShake(0, 1)).toBe(0);
    expect(Math.abs(dampedShakeOffset(0.5, 1))).toBeLessThan(Math.abs(dampedShakeOffset(0.02, 1)) + 0.05);
    expect(Math.abs(dampedShakeOffset(2, 1))).toBeLessThan(0.001);
  });

  it("rolls and clamps crits deterministically", () => {
    expect(rollCrit(25, () => 0.1)).toBe(true);
    expect(rollCrit(25, () => 0.9)).toBe(false);
    expect(rollCrit(0, () => 0)).toBe(false);
    expect(clampCritChance(80)).toBe(25);
    expect(clampCritChance(undefined)).toBe(10);
    expect(critMultiplier(150)).toBe(1.5);
    expect(critMultiplier(undefined)).toBe(1.5);
  });
});

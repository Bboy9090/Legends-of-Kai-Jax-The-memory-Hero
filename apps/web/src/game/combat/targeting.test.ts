import { describe, expect, it } from "vitest";
import { getAutoTarget, scoreAutoTarget, type AutoTargetEnemy } from "./targeting";

const enemy = (id: string, posX: number, posZ: number): AutoTargetEnemy => ({
  id,
  posX,
  posZ,
  isDead: false,
});

describe("auto targeting", () => {
  it("returns null when no valid enemies", () => {
    expect(getAutoTarget(0, 0, 0, [])).toBeNull();
  });

  it("prefers a closer target aligned with player facing", () => {
    const target = getAutoTarget(0, 0, 0, [
      enemy("front", 0, 3),
      enemy("side", 3, 0),
    ]);
    expect(target).toBe("front");
  });

  it("ignores dead and invalid candidates", () => {
    const dead = { ...enemy("dead", 0, 1), isDead: true };
    const invalid = enemy("invalid", Number.NaN, 1);
    expect(getAutoTarget(0, 0, 0, [dead, invalid])).toBeNull();
  });

  it("uses stable id ordering for exact score ties", () => {
    expect(getAutoTarget(0, 0, 0, [enemy("beta", 0, 3), enemy("alpha", 0, 3)])).toBe("alpha");
  });

  it("keeps current target when it remains competitively scored", () => {
    const enemies = [enemy("best", 0, 3), enemy("current", 0.25, 3.05)];
    expect(getAutoTarget(0, 0, 0, enemies, "current")).toBe("current");
  });

  it("returns rich score information for debugging and assist systems", () => {
    const scored = scoreAutoTarget(0, 0, 0, enemy("front", 0, 4));
    expect(scored?.id).toBe("front");
    expect(scored?.distance).toBeCloseTo(4);
    expect(scored?.angle).toBeCloseTo(0);
  });
});

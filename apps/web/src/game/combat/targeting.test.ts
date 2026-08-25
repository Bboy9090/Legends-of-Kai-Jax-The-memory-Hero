import { beforeEach, describe, expect, it } from "vitest";
import { getAutoTarget, resetAutoTarget } from "./targeting";

type Enemy = { id: string; posX: number; posZ: number; isDead: boolean };

const enemy = (id: string, posX: number, posZ: number, isDead = false): Enemy => ({
  id,
  posX,
  posZ,
  isDead,
});

describe("getAutoTarget", () => {
  beforeEach(() => resetAutoTarget());

  it("returns null when no valid enemies exist", () => {
    expect(getAutoTarget(0, 0, 0, [])).toBeNull();
  });

  it("ignores dead enemies and enemies outside normal acquisition range", () => {
    const enemies = [
      enemy("dead", 0, 3, true),
      enemy("far", 0, 19),
      enemy("valid", 0, 10),
    ];

    expect(getAutoTarget(0, 0, 0, enemies)).toBe("valid");
  });

  it("prefers an enemy in front over an equally distant enemy behind", () => {
    const enemies = [enemy("behind", 0, -6), enemy("front", 0, 6)];

    expect(getAutoTarget(0, 0, 0, enemies)).toBe("front");
  });

  it("keeps the current target when a challenger is only slightly closer", () => {
    const enemies = [enemy("current", 0, 8), enemy("challenger", 0, 7)];

    expect(getAutoTarget(0, 0, 0, enemies, "current")).toBe("current");
  });

  it("switches when another target is meaningfully better", () => {
    const enemies = [enemy("current", 0, 8), enemy("challenger", 0, 4)];

    expect(getAutoTarget(0, 0, 0, enemies, "current")).toBe("challenger");
  });

  it("gives the current target a small range grace without expanding normal acquisition", () => {
    const enemies = [enemy("current", 0, 19)];

    expect(getAutoTarget(0, 0, 0, enemies, "current")).toBe("current");
    resetAutoTarget();
    expect(getAutoTarget(0, 0, 0, enemies, null)).toBeNull();
  });
});

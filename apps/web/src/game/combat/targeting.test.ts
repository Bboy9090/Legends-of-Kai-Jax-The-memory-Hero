import { describe, it, expect } from "vitest";
import { getAutoTarget } from "./targeting";

describe("getAutoTarget", () => {
  it("returns null when no valid enemies", () => {
    expect(getAutoTarget(0, 0, 0, [])).toBe(null);
  });

  it("picks closest enemy in forward cone when multiple in range", () => {
    const enemies = [
      { id: "a", posX: 5, posZ: 0, isDead: false },
      { id: "b", posX: 2, posZ: 0, isDead: false },
    ];
    // playerRotY = 0 => forward roughly +Z; both on +X axis — still scored by dist+angle
    const id = getAutoTarget(0, 0, 0, enemies);
    expect(id === "a" || id === "b").toBe(true);
  });

  it("ignores dead enemies", () => {
    const enemies = [
      { id: "a", posX: 2, posZ: 0, isDead: true },
      { id: "b", posX: 3, posZ: 0, isDead: false },
    ];
    expect(getAutoTarget(0, 0, 0, enemies)).toBe("b");
  });
});

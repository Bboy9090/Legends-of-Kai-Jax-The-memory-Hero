import { describe, expect, it } from "vitest";
import { moveTowards } from "./movementMath";

describe("moveTowards", () => {
  it("accelerates toward a positive target", () => {
    expect(moveTowards(0, 6, 2)).toBe(2);
  });

  it("decelerates without crossing zero", () => {
    expect(moveTowards(0.04, 0, 2)).toBe(0);
  });

  it("does not overshoot a negative target", () => {
    expect(moveTowards(1, -1, 5)).toBe(-1);
  });
});

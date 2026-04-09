import { describe, it, expect } from "vitest";
import { getMoveFrameTime, isInActiveWindow } from "./frameTiming";
import type { MoveData } from "./moveData";

const sampleMove: MoveData = {
  startup: 6,
  active: 4,
  recovery: 10,
  cancelAt: 12,
  damage: 6,
  staminaCost: 5,
  knockback: 1.5,
  hitStopFrames: 3,
};

describe("frameTiming", () => {
  it("getMoveFrameTime matches startup+active+recovery in seconds", () => {
    const t = getMoveFrameTime(sampleMove);
    expect(t.startupTime).toBeCloseTo(6 / 60, 6);
    expect(t.activeTime).toBeCloseTo(4 / 60, 6);
    expect(t.recoveryTime).toBeCloseTo(10 / 60, 6);
    expect(t.totalTime).toBeCloseTo(t.startupTime + t.activeTime + t.recoveryTime, 6);
  });

  it("isInActiveWindow true only during active frames after startup", () => {
    const t = getMoveFrameTime(sampleMove);
    expect(isInActiveWindow(sampleMove, t.startupTime - 0.001)).toBe(false);
    expect(isInActiveWindow(sampleMove, t.startupTime + t.activeTime * 0.5)).toBe(true);
    expect(isInActiveWindow(sampleMove, t.startupTime + t.activeTime + 0.001)).toBe(false);
  });
});

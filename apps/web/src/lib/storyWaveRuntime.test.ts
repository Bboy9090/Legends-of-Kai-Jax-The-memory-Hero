import { describe, it, expect } from "vitest";
import { advanceWaveDelayMs } from "./storyWaveRuntime";

describe("Story wave timer: actual time and pause safety", () => {
  it("counts real elapsed time regardless of timer callback interval", () => {
    let remaining = 3000;
    remaining = advanceWaveDelayMs(remaining, 207, false);
    expect(remaining).toBe(2793);
    remaining = advanceWaveDelayMs(remaining, 2195, false);
    expect(remaining).toBe(598);
    remaining = advanceWaveDelayMs(remaining, 650, false);
    expect(remaining).toBe(0);
  });
  it("does not count paused time or invalid monotonic samples", () => {
    expect(advanceWaveDelayMs(3000, 9000, true)).toBe(3000);
    expect(advanceWaveDelayMs(3000, -100, false)).toBe(3000);
    expect(advanceWaveDelayMs(3000, Number.NaN, false)).toBe(3000);
    expect(advanceWaveDelayMs(100, 3000, false)).toBe(0);
  });
});

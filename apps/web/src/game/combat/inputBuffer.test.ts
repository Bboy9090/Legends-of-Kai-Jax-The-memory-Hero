import { describe, expect, it } from "vitest";
import {
  ATTACK_BUFFER_WINDOW_SEC,
  queueBufferedAttack,
  tickBufferedAttack,
} from "./inputBuffer";

describe("attack input buffer", () => {
  it("holds a newly queued attack for the configured window", () => {
    expect(queueBufferedAttack("punch")).toEqual({
      type: "punch",
      remainingSec: ATTACK_BUFFER_WINDOW_SEC,
    });
  });

  it("keeps an input alive until its window expires", () => {
    const queued = queueBufferedAttack("kick", 0.2);
    const buffered = tickBufferedAttack(queued, 0.12);
    expect(buffered?.type).toBe("kick");
    expect(buffered?.remainingSec).toBeCloseTo(0.08);
  });

  it("drops expired input instead of replaying it late", () => {
    const queued = queueBufferedAttack("special", 0.1);
    expect(tickBufferedAttack(queued, 0.1)).toBeNull();
  });
});

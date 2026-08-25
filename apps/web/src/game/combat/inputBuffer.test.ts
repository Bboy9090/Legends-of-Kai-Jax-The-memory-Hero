import { describe, expect, it } from "vitest";
import {
  ATTACK_BUFFER_WINDOW_SEC,
  isBufferedAttackActive,
  queueBufferedAttack,
  tickBufferedAttack,
} from "./inputBuffer";

describe("combat input buffer", () => {
  it("queues a fresh immutable intent with canonical timing", () => {
    const buffered = queueBufferedAttack("punch");
    expect(buffered.type).toBe("punch");
    expect(buffered.remainingSec).toBe(ATTACK_BUFFER_WINDOW_SEC);
    expect(buffered.ageSec).toBe(0);
    expect(isBufferedAttackActive(buffered)).toBe(true);
  });

  it("ages in gameplay time and expires deterministically", () => {
    const initial = queueBufferedAttack("kick", 0.1);
    const mid = tickBufferedAttack(initial, 0.04);
    expect(mid).not.toBeNull();
    expect(mid?.remainingSec).toBeCloseTo(0.06, 6);
    expect(mid?.ageSec).toBeCloseTo(0.04, 6);
    expect(tickBufferedAttack(mid, 0.061)).toBeNull();
  });

  it("sanitizes negative and non-finite delta values", () => {
    const initial = queueBufferedAttack("special", 0.1);
    expect(tickBufferedAttack(initial, -1)).toEqual(initial);
    expect(tickBufferedAttack(initial, Number.NaN)).toEqual(initial);
  });

  it("lets newest intent replace older intent explicitly", () => {
    const oldIntent = queueBufferedAttack("punch");
    const newIntent = queueBufferedAttack("ultimate");
    expect(oldIntent.type).toBe("punch");
    expect(newIntent.type).toBe("ultimate");
  });
});

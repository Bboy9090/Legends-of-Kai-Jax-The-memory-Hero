import { describe, expect, it } from "vitest";
import {
  blockstunSecondsForMove,
  getMoveForAttack,
  getMoveKeyForPlayerAttack,
  hasStaminaForAttack,
  hitstunSecondsForMove,
  launchVectorForMove,
  normalizeComboStep,
  resolveClash,
  staminaCostForAttack,
  totalMoveSeconds,
} from "./AttackResolver";
import { FRAME_TIME, MOVES } from "./moveData";

describe("AttackResolver", () => {
  it("clamps corrupt combo state into the authored light chain", () => {
    expect(normalizeComboStep(-10)).toBe(0);
    expect(normalizeComboStep(99)).toBe(2);
    expect(normalizeComboStep(Number.NaN)).toBe(0);
    expect(getMoveKeyForPlayerAttack("punch", 99)).toBe("light3");
  });

  it("resolves canonical move data for every attack type", () => {
    expect(getMoveForAttack("punch", 0)).toBe(MOVES.light1);
    expect(getMoveForAttack("kick")).toBe(MOVES.light2);
    expect(getMoveForAttack("special")).toBe(MOVES.skill);
    expect(getMoveForAttack("ultimate")).toBe(MOVES.heavy);
  });

  it("never permits stamina underflow", () => {
    const cost = staminaCostForAttack("special");
    expect(hasStaminaForAttack(cost, "special")).toBe(true);
    expect(hasStaminaForAttack(cost - 0.01, "special")).toBe(false);
    expect(hasStaminaForAttack(Number.NaN, "punch")).toBe(false);
  });

  it("converts reaction frames to seconds at the canonical frame rate", () => {
    expect(hitstunSecondsForMove(MOVES.light1)).toBeCloseTo(MOVES.light1.hitstunFrames * FRAME_TIME);
    expect(blockstunSecondsForMove(MOVES.heavy)).toBeCloseTo(MOVES.heavy.blockstunFrames * FRAME_TIME);
    expect(totalMoveSeconds(MOVES.light1)).toBeCloseTo(
      (MOVES.light1.startup + MOVES.light1.active + MOVES.light1.recovery) * FRAME_TIME
    );
  });

  it("builds mirrored launch vectors from authored angle + magnitude", () => {
    const right = launchVectorForMove(MOVES.heavy, true);
    const left = launchVectorForMove(MOVES.heavy, false);
    expect(right.x).toBeGreaterThan(0);
    expect(left.x).toBeLessThan(0);
    expect(right.y).toBeGreaterThan(0);
    expect(left.y).toBeCloseTo(right.y);
    expect(Math.abs(left.x)).toBeCloseTo(Math.abs(right.x));
  });

  it("resolves clashes deterministically even with invalid numbers", () => {
    expect(resolveClash(3, 2)).toBe("initiator_wins");
    expect(resolveClash(1, 4)).toBe("other_wins");
    expect(resolveClash(Number.NaN, Number.NaN)).toBe("tie");
  });
});

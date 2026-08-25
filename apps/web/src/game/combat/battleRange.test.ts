import { describe, expect, it } from "vitest";
import { getBattleAttackRange, isWithinBattleAttackRange } from "./battleRange";

describe("battle attack range", () => {
  it("keeps melee range deterministic across fighters", () => {
    expect(getBattleAttackRange("jaxon", "punch")).toBe(2.2);
    expect(getBattleAttackRange("kaison", "kick")).toBe(2.8);
  });

  it("uses fighter-authored special and ultimate ranges", () => {
    expect(getBattleAttackRange("kaison", "special")).toBeGreaterThan(
      getBattleAttackRange("jaxon", "special")
    );
    expect(getBattleAttackRange("kai-jax", "ultimate")).toBeGreaterThan(3);
  });

  it("applies transformation range scaling once", () => {
    const base = getBattleAttackRange("jaxon", "punch");
    expect(getBattleAttackRange("jaxon", "punch", { transformed: true })).toBeCloseTo(base * 1.5);
  });

  it("treats the authored contact boundary as a hit", () => {
    const range = getBattleAttackRange("jaxon", "punch");
    expect(isWithinBattleAttackRange({
      attackerX: 0,
      defenderX: range,
      fighterId: "jaxon",
      attackType: "punch",
    })).toBe(true);
    expect(isWithinBattleAttackRange({
      attackerX: 0,
      defenderX: range + 0.001,
      fighterId: "jaxon",
      attackType: "punch",
    })).toBe(false);
  });

  it("supports explicit non-negative contact padding", () => {
    expect(isWithinBattleAttackRange({
      attackerX: 0,
      defenderX: 2.3,
      fighterId: "jaxon",
      attackType: "punch",
      contactPadding: 0.1,
    })).toBe(true);
    expect(getBattleAttackRange("jaxon", "punch", { contactPadding: -10 })).toBe(2.2);
  });

  it("fails closed on invalid coordinates", () => {
    expect(isWithinBattleAttackRange({
      attackerX: Number.NaN,
      defenderX: 2.2,
      fighterId: "jaxon",
      attackType: "punch",
    })).toBe(false);
    expect(isWithinBattleAttackRange({
      attackerX: Number.POSITIVE_INFINITY,
      defenderX: 0,
      fighterId: "jaxon",
      attackType: "punch",
    })).toBe(false);
  });
});

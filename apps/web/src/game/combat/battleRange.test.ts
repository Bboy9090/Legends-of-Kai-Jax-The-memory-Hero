import { describe, expect, it } from "vitest";
import { getBattleAttackRange } from "./battleRange";

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
});

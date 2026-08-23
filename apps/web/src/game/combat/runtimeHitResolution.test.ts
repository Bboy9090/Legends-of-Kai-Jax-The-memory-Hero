import { describe, expect, it } from "vitest";
import { resolveRuntimeHit } from "./runtimeHitResolution";

const BASE = {
  attackerX: 0,
  defenderX: 1,
  fighterId: "jaxon",
  attackType: "punch" as const,
  rawDamage: 10,
  defenderAttacking: false,
  defenderInRecovery: false,
  defenderHitstunSec: 0,
  defenderAirborne: false,
  defenderDescending: false,
  defenderNearWall: false,
  juggleHits: 0,
  juggleBudgetSpent: 0,
  stageBreakMeter: 0,
};

describe("runtime hit resolution", () => {
  it("rejects whiffs before any damage or reaction work", () => {
    const result = resolveRuntimeHit({ ...BASE, defenderX: 20 });
    expect(result.connects).toBe(false);
    expect(result.allowed).toBe(false);
    expect(result.damage).toBe(0);
    expect(result.hitstunSec).toBe(0);
  });

  it("rewards counter hits without relabeling existing hitstun", () => {
    const counter = resolveRuntimeHit({ ...BASE, defenderAttacking: true });
    expect(counter.outcome).toBe("counter");
    expect(counter.damage).toBeGreaterThan(BASE.rawDamage);
    expect(counter.hitstunSec).toBeGreaterThan(0);

    const chained = resolveRuntimeHit({
      ...BASE,
      defenderAttacking: true,
      defenderHitstunSec: 0.1,
    });
    expect(chained.outcome).toBe("normal");
  });

  it("prioritizes recovery punish reward", () => {
    const result = resolveRuntimeHit({
      ...BASE,
      defenderAttacking: true,
      defenderInRecovery: true,
    });
    expect(result.outcome).toBe("punish");
    expect(result.damage).toBeGreaterThan(BASE.rawDamage);
  });

  it("hard-stops aerial routes that exceed juggle budget", () => {
    const result = resolveRuntimeHit({
      ...BASE,
      attackType: "ultimate",
      defenderAirborne: true,
      juggleHits: 8,
      juggleBudgetSpent: 8,
      rawDamage: 30,
    });
    expect(result.connects).toBe(true);
    expect(result.allowed).toBe(false);
    expect(result.damage).toBe(0);
    expect(result.nextJuggleBudgetSpent).toBeGreaterThan(9);
  });

  it("applies continuous aerial scaling before the hard cap", () => {
    const fresh = resolveRuntimeHit({ ...BASE, defenderAirborne: true });
    const late = resolveRuntimeHit({
      ...BASE,
      defenderAirborne: true,
      juggleHits: 4,
      juggleBudgetSpent: 4,
    });
    expect(late.allowed).toBe(true);
    expect(late.juggleDamageScale).toBeLessThan(fresh.juggleDamageScale);
    expect(late.juggleHitstunScale).toBeLessThan(fresh.juggleHitstunScale);
    expect(late.gravityScale).toBeGreaterThan(fresh.gravityScale);
  });

  it("returns authored stage consequences for heavy wall impact", () => {
    const result = resolveRuntimeHit({
      ...BASE,
      fighterId: "kai-jax",
      attackType: "ultimate",
      rawDamage: 30,
      defenderNearWall: true,
      stageBreakMeter: 0.9,
    });
    expect(result.allowed).toBe(true);
    expect(["wall_break", "wall_splat"]).toContain(result.stageImpact.kind);
    expect(result.stageImpact.stageBreakGain).toBeGreaterThanOrEqual(0);
  });

  it("sanitizes negative raw damage", () => {
    const result = resolveRuntimeHit({ ...BASE, rawDamage: -999 });
    expect(result.allowed).toBe(true);
    expect(result.damage).toBe(0);
  });
});

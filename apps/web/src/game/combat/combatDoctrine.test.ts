import { describe, expect, it } from "vitest";
import { MOVES } from "./moveData";
import {
  COMBAT_DOCTRINE_LIMITS,
  resolveCounterHit,
  resolveDefensiveEscape,
  resolveJuggleHit,
  resolveStageImpact,
} from "./combatDoctrine";

describe("combat doctrine", () => {
  it("rewards committed offense catches without relabeling existing combos", () => {
    expect(resolveCounterHit({
      defenderAttacking: true,
      defenderInRecovery: false,
      defenderHitstunSec: 0,
    }).outcome).toBe("counter");

    expect(resolveCounterHit({
      defenderAttacking: false,
      defenderInRecovery: true,
      defenderHitstunSec: 0,
    }).outcome).toBe("punish");

    expect(resolveCounterHit({
      defenderAttacking: true,
      defenderInRecovery: true,
      defenderHitstunSec: 0.2,
    }).outcome).toBe("normal");
  });

  it("scales aerial routes and eventually rejects over-budget juggles", () => {
    const early = resolveJuggleHit({ hits: 1, budgetSpent: 0, airborne: true }, MOVES.light1);
    const late = resolveJuggleHit({
      hits: 7,
      budgetSpent: COMBAT_DOCTRINE_LIMITS.juggleBudget - 1,
      airborne: true,
    }, MOVES.heavy);

    expect(early.allowed).toBe(true);
    expect(early.damageScale).toBeGreaterThan(late.damageScale);
    expect(late.allowed).toBe(false);
    expect(late.gravityScale).toBeGreaterThan(1);
  });

  it("does not spend juggle budget on grounded hits", () => {
    const result = resolveJuggleHit({ hits: 3, budgetSpent: 4, airborne: false }, MOVES.skill);
    expect(result.allowed).toBe(true);
    expect(result.nextBudgetSpent).toBe(4);
  });

  it("keeps defensive escape as an expensive hitstun-only anti-snowball valve", () => {
    expect(resolveDefensiveEscape({
      meter: 100,
      inHitstun: true,
      comboHits: 3,
      grounded: true,
      recentlyEscapedSec: 0,
    }).allowed).toBe(true);

    expect(resolveDefensiveEscape({
      meter: 100,
      inHitstun: false,
      comboHits: 3,
      grounded: true,
      recentlyEscapedSec: 0,
    }).allowed).toBe(false);

    expect(resolveDefensiveEscape({
      meter: 99,
      inHitstun: true,
      comboHits: 5,
      grounded: false,
      recentlyEscapedSec: 0,
    }).allowed).toBe(false);
  });

  it("resolves wall pressure into splats or explicit wall breaks", () => {
    const splat = resolveStageImpact({
      attackType: "kick",
      hitLevel: "heavy",
      launchSpeed: 7,
      airborne: false,
      nearWall: true,
      descending: false,
      stageBreakMeter: 0.2,
    });
    const broken = resolveStageImpact({
      attackType: "ultimate",
      hitLevel: "ultimate",
      launchSpeed: 8,
      airborne: true,
      nearWall: true,
      descending: false,
      stageBreakMeter: 0.1,
    });

    expect(splat.kind).toBe("wall_splat");
    expect(broken.kind).toBe("wall_break");
  });

  it("allows heavy descending aerials to produce floor bounces", () => {
    expect(resolveStageImpact({
      attackType: "special",
      hitLevel: "special",
      launchSpeed: 6,
      airborne: true,
      nearWall: false,
      descending: true,
      stageBreakMeter: 0,
    }).kind).toBe("floor_bounce");
  });
});

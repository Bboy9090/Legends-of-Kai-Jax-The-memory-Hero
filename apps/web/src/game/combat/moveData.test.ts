import { describe, expect, it } from "vitest";
import { ATTACK_TYPE_TO_MOVE, COMBAT_RANGES, MOVES } from "./moveData";

describe("certified combat contract", () => {
  it("keeps practical Versus contact ranges ordered and readable", () => {
    expect(COMBAT_RANGES.versus.punch).toBeGreaterThan(COMBAT_RANGES.versus.aiMeleeCommit);
    expect(COMBAT_RANGES.versus.kick).toBeGreaterThan(COMBAT_RANGES.versus.punch);
    expect(COMBAT_RANGES.versus.specialFallback).toBeGreaterThan(COMBAT_RANGES.versus.kick);
    expect(COMBAT_RANGES.versus.ultimateFallback).toBeGreaterThanOrEqual(COMBAT_RANGES.versus.specialFallback);
  });

  it("keeps Mission melee forgiving without becoming arena-scale", () => {
    expect(COMBAT_RANGES.mission.playerMelee).toBeGreaterThan(COMBAT_RANGES.versus.kick);
    expect(COMBAT_RANGES.mission.playerMelee).toBeLessThan(6);
  });

  it("keeps light attacks faster than committed heavy actions", () => {
    const light1 = MOVES.light1;
    const light2 = MOVES.light2;
    const heavy = MOVES.heavy;
    const skill = MOVES.skill;

    const total = (move: typeof light1) => move.startup + move.active + move.recovery;
    expect(total(light1)).toBeLessThan(total(heavy));
    expect(total(light2)).toBeLessThan(total(skill));
    expect(light1.cancelAt).toBeGreaterThan(0);
    expect(light2.cancelAt).toBeGreaterThan(0);
  });

  it("maps every public attack type to an existing move", () => {
    for (const moveKey of Object.values(ATTACK_TYPE_TO_MOVE)) {
      expect(MOVES[moveKey]).toBeDefined();
    }
  });
});

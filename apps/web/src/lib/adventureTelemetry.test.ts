import { describe, expect, it } from "vitest";
import type { AdventureEnemy } from "./stores/useAdventure";
import { hasChaseTargetEscaped, findCivilianAttack, CIVILIAN_ATTACK_COOLDOWN_MS } from "./adventureTelemetry";

const enemy = (overrides: Partial<AdventureEnemy> = {}): AdventureEnemy => ({
  id: "e1", fighterId: "void-stalker", tier: "boss1", health: 100, maxHealth: 100,
  isDead: false, posX: 0, posY: 0, posZ: 0, rotY: 0,
  isAggro: true, isAttacking: false, aiState: "chase", telegraphTimer: 0,
  patrolTargetX: 0, patrolTargetZ: 0, stunTimer: 0, ...overrides,
});
const civilians = [{ id: "c1", health: 100, maxHealth: 100, posX: 2, posY: 0, posZ: 0 }];
describe("spatial mission telemetry", () => {
  it("marks escape only for a living stalker outside 75 units", () => {
    const player = { posX: 0, posZ: 0 };
    expect(hasChaseTargetEscaped(player, [enemy({ posX: 74 })])).toBe(false);
    expect(hasChaseTargetEscaped(player, [enemy({ posX: 75 })])).toBe(true);
    expect(hasChaseTargetEscaped(player, [enemy({ posX: 90, isDead: true })])).toBe(false);
  });
  it("only permits living engaged enemies in range and off cooldown", () => {
    expect(findCivilianAttack([enemy({ fighterId: "rift-drone" })], civilians, 1000, new Map())).toEqual([{ enemyId: "e1", civilianId: "c1" }]);
    expect(findCivilianAttack([enemy()], civilians, 1000, new Map([["e1", 0]]))).toEqual([]);
    expect(findCivilianAttack([enemy()], civilians, CIVILIAN_ATTACK_COOLDOWN_MS, new Map([["e1", 0]]))).toHaveLength(1);
    expect(findCivilianAttack([enemy({ aiState: "idle" })], civilians, 1000, new Map())).toEqual([]);
    expect(findCivilianAttack([enemy({ posX: 30 })], civilians, 1000, new Map())).toEqual([]);
  });
});

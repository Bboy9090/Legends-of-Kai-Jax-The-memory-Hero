import { describe, it, expect } from "vitest";
import { resolveBattleCombatState } from "./CombatStateMachine";
import { BattleCombatState } from "./stateEnums";

describe("resolveBattleCombatState", () => {
  it("dodge takes priority over attack", () => {
    expect(
      resolveBattleCombatState({
        playerDodgeTimer: 0.1,
        playerAttacking: true,
        guardBreakTimer: 0,
        playerHitStunTimer: 0,
        blocking: false,
        playerBlockParryWindow: 0,
      })
    ).toBe(BattleCombatState.DODGING);
  });

  it("guard break over hitstun when both timers positive", () => {
    expect(
      resolveBattleCombatState({
        playerDodgeTimer: 0,
        playerAttacking: false,
        guardBreakTimer: 0.2,
        playerHitStunTimer: 0.2,
        blocking: false,
        playerBlockParryWindow: 0,
      })
    ).toBe(BattleCombatState.GUARD_BROKEN);
  });

  it("parry window when blocking and parry timer up", () => {
    expect(
      resolveBattleCombatState({
        playerDodgeTimer: 0,
        playerAttacking: false,
        guardBreakTimer: 0,
        playerHitStunTimer: 0,
        blocking: true,
        playerBlockParryWindow: 0.05,
      })
    ).toBe(BattleCombatState.PARRY_WINDOW);
  });
});

import { describe, it, expect } from "vitest";
import {
  canStartOffensiveAction,
  isActionLockedCombatState,
  resolveBattleCombatState,
} from "./CombatStateMachine";
import { BattleCombatState } from "./stateEnums";

const base = {
  playerDodgeTimer: 0,
  playerAttacking: false,
  guardBreakTimer: 0,
  playerHitStunTimer: 0,
  blocking: false,
  playerBlockParryWindow: 0,
};

describe("resolveBattleCombatState", () => {
  it("dodge takes priority over every other posture", () => {
    expect(
      resolveBattleCombatState({
        ...base,
        playerDodgeTimer: 0.1,
        playerAttacking: true,
        guardBreakTimer: 0.2,
        playerHitStunTimer: 0.2,
        blocking: true,
      })
    ).toBe(BattleCombatState.DODGING);
  });

  it("guard break overrides stale attack and hitstun flags", () => {
    expect(
      resolveBattleCombatState({
        ...base,
        playerAttacking: true,
        guardBreakTimer: 0.2,
        playerHitStunTimer: 0.2,
      })
    ).toBe(BattleCombatState.GUARD_BROKEN);
  });

  it("hitstun overrides stale attack state", () => {
    expect(
      resolveBattleCombatState({
        ...base,
        playerAttacking: true,
        playerHitStunTimer: 0.2,
      })
    ).toBe(BattleCombatState.HITSTUN);
  });

  it("parry window resolves only while legal blocking is active", () => {
    expect(
      resolveBattleCombatState({
        ...base,
        blocking: true,
        playerBlockParryWindow: 0.05,
      })
    ).toBe(BattleCombatState.PARRY_WINDOW);
  });

  it("ignores NaN and negative timers", () => {
    expect(
      resolveBattleCombatState({
        ...base,
        playerDodgeTimer: Number.NaN,
        guardBreakTimer: -1,
        playerHitStunTimer: Number.NaN,
      })
    ).toBe(BattleCombatState.FREE);
  });
});

describe("combat state capabilities", () => {
  it("locks forced-loss-of-control states", () => {
    expect(isActionLockedCombatState(BattleCombatState.DODGING)).toBe(true);
    expect(isActionLockedCombatState(BattleCombatState.HITSTUN)).toBe(true);
    expect(isActionLockedCombatState(BattleCombatState.GUARD_BROKEN)).toBe(true);
    expect(isActionLockedCombatState(BattleCombatState.FREE)).toBe(false);
  });

  it("only allows fresh offense from FREE", () => {
    expect(canStartOffensiveAction(BattleCombatState.FREE)).toBe(true);
    expect(canStartOffensiveAction(BattleCombatState.BLOCKING)).toBe(false);
    expect(canStartOffensiveAction(BattleCombatState.ATTACKING)).toBe(false);
  });
});

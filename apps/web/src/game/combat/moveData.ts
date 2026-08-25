/**
 * Canonical duel move tables (battle + adventure attack resolution).
 * Adventure stamina/combo/dodge tuning: `game/tuning/adventure.json`.
 */

export type AttackType = "punch" | "kick" | "special" | "ultimate";

export interface MoveData {
  startup: number;
  active: number;
  recovery: number;
  cancelAt: number;
  damage: number;
  staminaCost: number;
  knockback: number;
  hitStopFrames: number;
  superArmor?: boolean;
}

/** Adventure dodge roll (values in `game/tuning/adventure.json`). */
export interface DodgeData {
  iFrames: number;
  staminaCost: number;
  distance: number;
  duration: number;
}

export const FRAME_TIME = 1 / 60;

export const MOVES: Record<string, MoveData> = {
  // Lights should feel immediate and chainable, not sticky.
  light1: {
    startup: 5,
    active: 4,
    recovery: 8,
    cancelAt: 10,
    damage: 6,
    staminaCost: 4,
    knockback: 1.2,
    hitStopFrames: 3,
  },
  light2: {
    startup: 5,
    active: 4,
    recovery: 9,
    cancelAt: 11,
    damage: 7,
    staminaCost: 4,
    knockback: 1.6,
    hitStopFrames: 3,
  },
  light3: {
    startup: 6,
    active: 5,
    recovery: 12,
    cancelAt: 0,
    damage: 10,
    staminaCost: 7,
    knockback: 3.4,
    hitStopFrames: 5,
  },
  // Heavy attacks earn their commitment with stronger impact, but recover fast
  // enough that one whiff does not make the match feel frozen.
  heavy: {
    startup: 9,
    active: 6,
    recovery: 16,
    cancelAt: 0,
    damage: 18,
    staminaCost: 22,
    knockback: 5.5,
    hitStopFrames: 8,
    superArmor: true,
  },
  skill: {
    startup: 8,
    active: 8,
    recovery: 17,
    cancelAt: 0,
    damage: 22,
    staminaCost: 27,
    knockback: 4.6,
    hitStopFrames: 6,
  },
};

export const ATTACK_TYPE_TO_MOVE: Record<AttackType, string> = {
  punch: "light1",
  kick: "light2",
  special: "skill",
  ultimate: "heavy",
};

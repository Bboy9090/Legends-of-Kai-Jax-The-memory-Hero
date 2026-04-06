/**
 * Canonical duel move tables + frame timing (battle + adventure shared).
 * Pure data — gameplay rules stay in `lib/combatSystems.ts` helpers.
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

export interface DodgeData {
  iFrames: number;
  staminaCost: number;
  distance: number;
  duration: number;
}

export const FRAME_TIME = 1 / 60;

export const MOVES: Record<string, MoveData> = {
  light1: {
    startup: 6,
    active: 4,
    recovery: 10,
    cancelAt: 12,
    damage: 6,
    staminaCost: 5,
    knockback: 1.5,
    hitStopFrames: 3,
  },
  light2: {
    startup: 5,
    active: 4,
    recovery: 12,
    cancelAt: 14,
    damage: 7,
    staminaCost: 5,
    knockback: 2,
    hitStopFrames: 3,
  },
  light3: {
    startup: 7,
    active: 5,
    recovery: 14,
    cancelAt: 0,
    damage: 10,
    staminaCost: 8,
    knockback: 4,
    hitStopFrames: 5,
  },
  heavy: {
    startup: 10,
    active: 6,
    recovery: 18,
    cancelAt: 0,
    damage: 18,
    staminaCost: 25,
    knockback: 6,
    hitStopFrames: 8,
    superArmor: true,
  },
  skill: {
    startup: 8,
    active: 8,
    recovery: 20,
    cancelAt: 0,
    damage: 22,
    staminaCost: 30,
    knockback: 5,
    hitStopFrames: 6,
  },
};

export const DODGE: DodgeData = {
  iFrames: 16,
  staminaCost: 18,
  distance: 5,
  duration: 0.35,
};

export const STAMINA_CONFIG = {
  max: 100,
  regenRate: 14,
  exhaustedThreshold: 15,
  regenDelay: 0.5,
};

export const COMBO_CONFIG = {
  maxChain: 3,
  chainWindow: 20,
  resetTime: 1.0,
};

export const ATTACK_TYPE_TO_MOVE: Record<AttackType, string> = {
  punch: "light1",
  kick: "light2",
  special: "skill",
  ultimate: "heavy",
};

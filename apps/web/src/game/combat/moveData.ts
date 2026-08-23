/**
 * Canonical duel move tables.
 *
 * Frame values are authored at 60 Hz. This module is data-only by design so the
 * same moves can drive gameplay, AI evaluation, animation timing, tests, replays,
 * and future rollback/netcode without hidden side effects.
 */

export type AttackType = "punch" | "kick" | "special" | "ultimate";
export type HitLevel = "light" | "medium" | "heavy" | "special" | "ultimate";

export interface MoveData {
  startup: number;
  active: number;
  recovery: number;
  cancelAt: number;
  damage: number;
  staminaCost: number;
  knockback: number;
  hitStopFrames: number;
  hitstunFrames: number;
  blockstunFrames: number;
  launchAngleDeg: number;
  hitLevel: HitLevel;
  superArmor?: boolean;
}

/** Adventure dodge roll (values in `game/tuning/adventure.json`). */
export interface DodgeData {
  iFrames: number;
  staminaCost: number;
  distance: number;
  duration: number;
}

export const FRAME_RATE = 60;
export const FRAME_TIME = 1 / FRAME_RATE;

export const MOVES = Object.freeze({
  light1: Object.freeze({
    startup: 6,
    active: 4,
    recovery: 10,
    cancelAt: 12,
    damage: 6,
    staminaCost: 5,
    knockback: 1.5,
    hitStopFrames: 3,
    hitstunFrames: 11,
    blockstunFrames: 7,
    launchAngleDeg: 12,
    hitLevel: "light",
  }),
  light2: Object.freeze({
    startup: 5,
    active: 4,
    recovery: 12,
    cancelAt: 14,
    damage: 7,
    staminaCost: 5,
    knockback: 2,
    hitStopFrames: 3,
    hitstunFrames: 13,
    blockstunFrames: 8,
    launchAngleDeg: 18,
    hitLevel: "light",
  }),
  light3: Object.freeze({
    startup: 7,
    active: 5,
    recovery: 14,
    cancelAt: 0,
    damage: 10,
    staminaCost: 8,
    knockback: 4,
    hitStopFrames: 5,
    hitstunFrames: 18,
    blockstunFrames: 11,
    launchAngleDeg: 28,
    hitLevel: "medium",
  }),
  heavy: Object.freeze({
    startup: 10,
    active: 6,
    recovery: 18,
    cancelAt: 0,
    damage: 18,
    staminaCost: 25,
    knockback: 6,
    hitStopFrames: 8,
    hitstunFrames: 28,
    blockstunFrames: 17,
    launchAngleDeg: 34,
    hitLevel: "heavy",
    superArmor: true,
  }),
  skill: Object.freeze({
    startup: 8,
    active: 8,
    recovery: 20,
    cancelAt: 0,
    damage: 22,
    staminaCost: 30,
    knockback: 5,
    hitStopFrames: 6,
    hitstunFrames: 24,
    blockstunFrames: 15,
    launchAngleDeg: 42,
    hitLevel: "special",
  }),
} satisfies Readonly<Record<string, MoveData>>);

export type MoveKey = keyof typeof MOVES;

export const ATTACK_TYPE_TO_MOVE: Readonly<Record<AttackType, MoveKey>> = Object.freeze({
  punch: "light1",
  kick: "light2",
  special: "skill",
  ultimate: "heavy",
});

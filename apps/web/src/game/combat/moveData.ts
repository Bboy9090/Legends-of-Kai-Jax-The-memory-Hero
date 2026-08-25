/**
 * Canonical duel move tables (battle + adventure attack resolution).
 * Adventure stamina/combo/dodge tuning: `game/tuning/adventure.json`.
 *
 * Frame values are authored at 60 Hz. Reaction metadata is kept beside the
 * current certified damage/stamina/knockback values so every combat consumer
 * reads one schema instead of partially overlapping move tables.
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

/**
 * Certified practical contact ranges.
 * Keep these centralized so AI pressure, telegraphs and player-side checks do not
 * drift into different invisible distances over time.
 */
export const COMBAT_RANGES = {
  versus: {
    punch: 2.2,
    kick: 2.8,
    specialFallback: 4.0,
    ultimateFallback: 4.5,
    aiMeleeCommit: 1.95,
  },
  mission: {
    playerMelee: 4.0,
  },
} as const;

export const MOVES = Object.freeze({
  light1: Object.freeze({
    startup: 5,
    active: 4,
    recovery: 8,
    cancelAt: 10,
    damage: 6,
    staminaCost: 4,
    knockback: 1.2,
    hitStopFrames: 3,
    hitstunFrames: 11,
    blockstunFrames: 7,
    launchAngleDeg: 12,
    hitLevel: "light",
  }),
  light2: Object.freeze({
    startup: 5,
    active: 4,
    recovery: 9,
    cancelAt: 11,
    damage: 7,
    staminaCost: 4,
    knockback: 1.6,
    hitStopFrames: 3,
    hitstunFrames: 13,
    blockstunFrames: 8,
    launchAngleDeg: 18,
    hitLevel: "light",
  }),
  light3: Object.freeze({
    startup: 6,
    active: 5,
    recovery: 12,
    cancelAt: 0,
    damage: 10,
    staminaCost: 7,
    knockback: 3.4,
    hitStopFrames: 5,
    hitstunFrames: 18,
    blockstunFrames: 11,
    launchAngleDeg: 28,
    hitLevel: "medium",
  }),
  heavy: Object.freeze({
    startup: 9,
    active: 6,
    recovery: 16,
    cancelAt: 0,
    damage: 18,
    staminaCost: 22,
    knockback: 5.5,
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
    recovery: 17,
    cancelAt: 0,
    damage: 22,
    staminaCost: 27,
    knockback: 4.6,
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

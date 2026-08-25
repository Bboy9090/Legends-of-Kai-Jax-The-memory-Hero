import type { AttackType, HitLevel, MoveData } from "./moveData";

export type HitOutcome = "normal" | "counter" | "punish";
export type StageImpactKind = "none" | "wall_splat" | "wall_break" | "floor_bounce";

export interface CounterHitContext {
  defenderAttacking: boolean;
  defenderInRecovery: boolean;
  defenderHitstunSec: number;
}

export interface CounterHitResult {
  outcome: HitOutcome;
  damageMultiplier: number;
  hitstunMultiplier: number;
  launchMultiplier: number;
  extraHitstopFrames: number;
}

export interface JuggleState {
  hits: number;
  budgetSpent: number;
  airborne: boolean;
}

export interface JuggleResult {
  allowed: boolean;
  nextBudgetSpent: number;
  damageScale: number;
  hitstunScale: number;
  gravityScale: number;
}

export interface DefensiveEscapeInput {
  meter: number;
  inHitstun: boolean;
  comboHits: number;
  grounded: boolean;
  recentlyEscapedSec: number;
}

export interface DefensiveEscapeResult {
  allowed: boolean;
  meterCost: number;
  invulnerabilitySec: number;
  horizontalPush: number;
  verticalPush: number;
  lockoutSec: number;
}

export interface StageImpactInput {
  attackType: AttackType;
  hitLevel: HitLevel;
  launchSpeed: number;
  airborne: boolean;
  nearWall: boolean;
  descending: boolean;
  stageBreakMeter: number;
}

export interface StageImpactResult {
  kind: StageImpactKind;
  bonusHitstunSec: number;
  reboundMultiplier: number;
  stageBreakGain: number;
}

const COUNTER_REWARD: Readonly<Record<HitOutcome, CounterHitResult>> = Object.freeze({
  normal: Object.freeze({
    outcome: "normal",
    damageMultiplier: 1,
    hitstunMultiplier: 1,
    launchMultiplier: 1,
    extraHitstopFrames: 0,
  }),
  counter: Object.freeze({
    outcome: "counter",
    damageMultiplier: 1.08,
    hitstunMultiplier: 1.18,
    launchMultiplier: 1.12,
    extraHitstopFrames: 2,
  }),
  punish: Object.freeze({
    outcome: "punish",
    damageMultiplier: 1.12,
    hitstunMultiplier: 1.24,
    launchMultiplier: 1.08,
    extraHitstopFrames: 3,
  }),
});

const JUGGLE_COST_BY_LEVEL: Readonly<Record<HitLevel, number>> = Object.freeze({
  light: 1,
  medium: 2,
  heavy: 3,
  special: 3,
  ultimate: 4,
});

const JUGGLE_BUDGET = 9;
const ESCAPE_METER_COST = 100;

function finiteNonNegative(value: number, fallback = 0): number {
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}

/**
 * Counter-hit philosophy: reward catching committed offense; punish rewards
 * catching recovery. Existing hitstun always wins over these labels so chained
 * combo hits do not recursively become counter hits.
 */
export function resolveCounterHit(context: CounterHitContext): CounterHitResult {
  const existingHitstun = finiteNonNegative(context.defenderHitstunSec);
  if (existingHitstun > 0) return COUNTER_REWARD.normal;
  if (context.defenderInRecovery) return COUNTER_REWARD.punish;
  if (context.defenderAttacking) return COUNTER_REWARD.counter;
  return COUNTER_REWARD.normal;
}

/**
 * Juggle budget keeps aerial expression high without allowing infinite loops.
 * Each hit level spends authored budget; scaling ramps continuously rather than
 * abruptly invalidating damage before the hard budget cap.
 */
export function resolveJuggleHit(
  state: JuggleState,
  move: Pick<MoveData, "hitLevel">
): JuggleResult {
  const spent = Math.max(0, Math.floor(finiteNonNegative(state.budgetSpent)));
  const hits = Math.max(0, Math.floor(finiteNonNegative(state.hits)));
  const cost = JUGGLE_COST_BY_LEVEL[move.hitLevel];
  const nextBudgetSpent = spent + (state.airborne ? cost : 0);
  const allowed = !state.airborne || nextBudgetSpent <= JUGGLE_BUDGET;
  const pressure = clamp01(nextBudgetSpent / JUGGLE_BUDGET);

  return {
    allowed,
    nextBudgetSpent,
    damageScale: Math.max(0.45, 1 - hits * 0.055 - pressure * 0.2),
    hitstunScale: Math.max(0.55, 1 - pressure * 0.35),
    gravityScale: 1 + pressure * 0.35,
  };
}

/**
 * Defensive escape is deliberately expensive and only legal while trapped in
 * hitstun. It is an anti-snowball valve, not a neutral skip button.
 */
export function resolveDefensiveEscape(input: DefensiveEscapeInput): DefensiveEscapeResult {
  const meter = finiteNonNegative(input.meter);
  const lockout = finiteNonNegative(input.recentlyEscapedSec);
  const comboHits = Math.max(0, Math.floor(finiteNonNegative(input.comboHits)));
  const allowed = input.inHitstun && comboHits >= 2 && meter >= ESCAPE_METER_COST && lockout <= 0;

  return {
    allowed,
    meterCost: allowed ? ESCAPE_METER_COST : 0,
    invulnerabilitySec: allowed ? 0.42 : 0,
    horizontalPush: allowed ? 3.4 : 0,
    verticalPush: allowed && !input.grounded ? 1.2 : 0,
    lockoutSec: allowed ? 8 : Math.max(0, lockout),
  };
}

/**
 * Stage impacts are positional rewards with explicit reset pressure. Walls can
 * splat or break; descending airborne heavy/special hits can floor-bounce.
 */
export function resolveStageImpact(input: StageImpactInput): StageImpactResult {
  const speed = finiteNonNegative(input.launchSpeed);
  const breakMeter = clamp01(input.stageBreakMeter);
  const heavyClass = input.hitLevel === "heavy" || input.hitLevel === "special" || input.hitLevel === "ultimate";
  // The certified heavy move currently launches at 5.5. Ultimate maps to that
  // heavy move, so its authored wall-break rule must be reachable without a
  // counter-hit multiplier artificially increasing launch speed first.
  const reachesWallImpactThreshold = speed >= 6.5 || (input.attackType === "ultimate" && speed >= 5.5);

  if (input.nearWall && heavyClass && reachesWallImpactThreshold) {
    const breaks = breakMeter >= 0.8 || input.attackType === "ultimate" || speed >= 10;
    return breaks
      ? {
          kind: "wall_break",
          bonusHitstunSec: 0.1,
          reboundMultiplier: 0.35,
          stageBreakGain: 1 - breakMeter,
        }
      : {
          kind: "wall_splat",
          bonusHitstunSec: 0.32,
          reboundMultiplier: 0.1,
          stageBreakGain: 0.22,
        };
  }

  if (input.airborne && input.descending && heavyClass && speed >= 5) {
    return {
      kind: "floor_bounce",
      bonusHitstunSec: 0.18,
      reboundMultiplier: 0.52,
      stageBreakGain: 0.12,
    };
  }

  return {
    kind: "none",
    bonusHitstunSec: 0,
    reboundMultiplier: 0,
    stageBreakGain: 0,
  };
}

export const COMBAT_DOCTRINE_LIMITS = Object.freeze({
  juggleBudget: JUGGLE_BUDGET,
  defensiveEscapeMeterCost: ESCAPE_METER_COST,
});

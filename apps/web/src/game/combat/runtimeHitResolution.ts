import type { AttackType } from "./moveData";
import {
  getMoveForAttack,
  hitStopSecondsForMove,
  hitstunSecondsForMove,
  launchVectorForMove,
} from "./AttackResolver";
import { isWithinBattleAttackRange } from "./battleRange";
import {
  resolveCounterHit,
  resolveJuggleHit,
  resolveStageImpact,
  type HitOutcome,
  type StageImpactResult,
} from "./combatDoctrine";

export interface RuntimeHitResolutionInput {
  attackerX: number;
  defenderX: number;
  fighterId: string;
  attackType: AttackType;
  comboStep?: number;
  transformed?: boolean;
  facingRight?: boolean;
  rawDamage: number;

  defenderAttacking: boolean;
  defenderInRecovery: boolean;
  defenderHitstunSec: number;
  defenderAirborne: boolean;
  defenderDescending: boolean;
  defenderNearWall: boolean;

  juggleHits: number;
  juggleBudgetSpent: number;
  stageBreakMeter: number;
}

export interface RuntimeHitResolution {
  connects: boolean;
  allowed: boolean;
  outcome: HitOutcome;
  damage: number;
  hitstunSec: number;
  hitstopSec: number;
  launchX: number;
  launchY: number;
  nextJuggleBudgetSpent: number;
  juggleDamageScale: number;
  juggleHitstunScale: number;
  gravityScale: number;
  stageImpact: StageImpactResult;
}

const NO_STAGE_IMPACT: StageImpactResult = Object.freeze({
  kind: "none",
  bonusHitstunSec: 0,
  reboundMultiplier: 0,
  stageBreakGain: 0,
});

function finiteNonNegative(value: number): number {
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function emptyResolution(connects = false): RuntimeHitResolution {
  return {
    connects,
    allowed: false,
    outcome: "normal",
    damage: 0,
    hitstunSec: 0,
    hitstopSec: 0,
    launchX: 0,
    launchY: 0,
    nextJuggleBudgetSpent: 0,
    juggleDamageScale: 1,
    juggleHitstunScale: 1,
    gravityScale: 1,
    stageImpact: NO_STAGE_IMPACT,
  };
}

/**
 * One deterministic verdict for a duel hit.
 *
 * This function intentionally owns no side effects. Runtime stores should execute
 * this result rather than independently re-deriving range, counter-hit bonuses,
 * juggle scaling, hitstun, launch, or stage-impact rules.
 */
export function resolveRuntimeHit(input: RuntimeHitResolutionInput): RuntimeHitResolution {
  const move = getMoveForAttack(input.attackType, input.comboStep ?? 0);
  if (!move) return emptyResolution(false);

  const connects = isWithinBattleAttackRange({
    attackerX: input.attackerX,
    defenderX: input.defenderX,
    fighterId: input.fighterId,
    attackType: input.attackType,
    transformed: input.transformed,
  });
  if (!connects) return emptyResolution(false);

  const counter = resolveCounterHit({
    defenderAttacking: input.defenderAttacking,
    defenderInRecovery: input.defenderInRecovery,
    defenderHitstunSec: input.defenderHitstunSec,
  });

  const juggle = resolveJuggleHit(
    {
      hits: input.juggleHits,
      budgetSpent: input.juggleBudgetSpent,
      airborne: input.defenderAirborne,
    },
    move
  );
  if (!juggle.allowed) {
    return {
      ...emptyResolution(true),
      outcome: counter.outcome,
      nextJuggleBudgetSpent: juggle.nextBudgetSpent,
      juggleDamageScale: juggle.damageScale,
      juggleHitstunScale: juggle.hitstunScale,
      gravityScale: juggle.gravityScale,
    };
  }

  const launchBase = launchVectorForMove(move, input.facingRight ?? true);
  const launchX = launchBase.x * counter.launchMultiplier;
  const launchY = launchBase.y * counter.launchMultiplier;
  const launchSpeed = Math.hypot(launchX, launchY);

  const stageImpact = resolveStageImpact({
    attackType: input.attackType,
    hitLevel: move.hitLevel,
    launchSpeed,
    airborne: input.defenderAirborne,
    nearWall: input.defenderNearWall,
    descending: input.defenderDescending,
    stageBreakMeter: input.stageBreakMeter,
  });

  const rawDamage = finiteNonNegative(input.rawDamage);
  const damage = Math.max(
    0,
    Math.round(rawDamage * counter.damageMultiplier * juggle.damageScale)
  );
  const hitstunSec =
    hitstunSecondsForMove(move) * counter.hitstunMultiplier * juggle.hitstunScale +
    stageImpact.bonusHitstunSec;
  const hitstopSec = hitStopSecondsForMove(move) + counter.extraHitstopFrames / 60;

  return {
    connects: true,
    allowed: true,
    outcome: counter.outcome,
    damage,
    hitstunSec: Math.max(0, hitstunSec),
    hitstopSec: Math.max(0, hitstopSec),
    launchX,
    launchY,
    nextJuggleBudgetSpent: juggle.nextBudgetSpent,
    juggleDamageScale: juggle.damageScale,
    juggleHitstunScale: juggle.hitstunScale,
    gravityScale: juggle.gravityScale,
    stageImpact,
  };
}

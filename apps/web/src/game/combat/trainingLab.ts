import { getMoveFrameTime } from "./frameTiming";
import { MOVES, type AttackType, type MoveKey } from "./moveData";
import { getMoveKeyForPlayerAttack } from "./AttackResolver";

export interface TrainingInputEvent {
  id: number;
  code: string;
  pressed: boolean;
  atMs: number;
}

export interface TrainingTelemetryInput {
  playerAttackType: AttackType | null;
  playerAttackElapsed: number;
  playerComboStep: number;
  comboCount: number;
  comboDamage: number;
  playerHitStunTimer: number;
  opponentHitStunTimer: number;
  playerDodgeTimer: number;
  guardBreakTimer: number;
  playerBlockParryWindow: number;
  playerStamina: number;
  maxPlayerStamina: number;
  playerX: number;
  opponentX: number;
  playerVelocityX: number;
  playerVelocityY: number;
}

export interface TrainingMoveTelemetry {
  key: MoveKey;
  elapsedSec: number;
  totalSec: number;
  startupSec: number;
  activeSec: number;
  recoverySec: number;
  cancelSec: number;
  phase: "startup" | "active" | "recovery" | "complete";
  frame: number;
  frameAdvantageEstimate: number | null;
}

export interface TrainingTelemetry {
  move: TrainingMoveTelemetry | null;
  comboCount: number;
  comboDamage: number;
  distance: number;
  playerHitStunTimer: number;
  opponentHitStunTimer: number;
  playerDodgeTimer: number;
  guardBreakTimer: number;
  parryWindow: number;
  staminaRatio: number;
  velocityX: number;
  velocityY: number;
  frameAdvantage: number | null;
}

const FRAME_RATE = 60;

function finiteNonNegative(value: number): number {
  return Math.max(0, Number.isFinite(value) ? value : 0);
}

export function sanitizeInputHistory(
  events: readonly TrainingInputEvent[],
  maxEntries = 12
): TrainingInputEvent[] {
  const safeMax = Math.max(1, Math.min(64, Math.floor(Number.isFinite(maxEntries) ? maxEntries : 12)));
  return events
    .filter((event) => Number.isFinite(event.atMs) && typeof event.code === "string" && event.code.length > 0)
    .slice(-safeMax)
    .map((event) => ({ ...event }));
}

export function estimateFrameAdvantage(
  move: TrainingMoveTelemetry | null,
  opponentHitStunTimer: number
): number | null {
  if (!move) return null;
  const defenderLockout = finiteNonNegative(opponentHitStunTimer);
  if (defenderLockout <= 0) return null;
  const attackerRecoveryRemaining = Math.max(0, move.totalSec - move.elapsedSec);
  return Math.round((defenderLockout - attackerRecoveryRemaining) * FRAME_RATE);
}

export function resolveTrainingMove(
  attackType: AttackType | null,
  comboStep: number,
  elapsedSec: number
): TrainingMoveTelemetry | null {
  if (!attackType) return null;
  const key = getMoveKeyForPlayerAttack(attackType, comboStep);
  if (!key) return null;
  const move = MOVES[key];
  if (!move) return null;

  const timing = getMoveFrameTime(move);
  const elapsed = finiteNonNegative(elapsedSec);
  const activeEnd = timing.startupTime + timing.activeTime;
  const phase =
    elapsed < timing.startupTime
      ? "startup"
      : elapsed < activeEnd
        ? "active"
        : elapsed < timing.totalTime
          ? "recovery"
          : "complete";

  return {
    key,
    elapsedSec: elapsed,
    totalSec: timing.totalTime,
    startupSec: timing.startupTime,
    activeSec: timing.activeTime,
    recoverySec: timing.recoveryTime,
    cancelSec: timing.cancelTime,
    phase,
    frame: Math.max(0, Math.floor(elapsed * FRAME_RATE) + 1),
    frameAdvantageEstimate: null,
  };
}

export function buildTrainingTelemetry(input: TrainingTelemetryInput): TrainingTelemetry {
  const maxStamina = Math.max(1, Number.isFinite(input.maxPlayerStamina) ? input.maxPlayerStamina : 1);
  const stamina = finiteNonNegative(input.playerStamina);
  const opponentHitStunTimer = finiteNonNegative(input.opponentHitStunTimer);
  const move = resolveTrainingMove(input.playerAttackType, input.playerComboStep, input.playerAttackElapsed);
  const frameAdvantage = estimateFrameAdvantage(move, opponentHitStunTimer);
  const moveWithAdvantage = move ? { ...move, frameAdvantageEstimate: frameAdvantage } : null;

  return {
    move: moveWithAdvantage,
    comboCount: Math.max(0, Math.floor(Number.isFinite(input.comboCount) ? input.comboCount : 0)),
    comboDamage: finiteNonNegative(input.comboDamage),
    distance: Math.abs((Number.isFinite(input.opponentX) ? input.opponentX : 0) - (Number.isFinite(input.playerX) ? input.playerX : 0)),
    playerHitStunTimer: finiteNonNegative(input.playerHitStunTimer),
    opponentHitStunTimer,
    playerDodgeTimer: finiteNonNegative(input.playerDodgeTimer),
    guardBreakTimer: finiteNonNegative(input.guardBreakTimer),
    parryWindow: finiteNonNegative(input.playerBlockParryWindow),
    staminaRatio: Math.max(0, Math.min(1, stamina / maxStamina)),
    velocityX: Number.isFinite(input.playerVelocityX) ? input.playerVelocityX : 0,
    velocityY: Number.isFinite(input.playerVelocityY) ? input.playerVelocityY : 0,
    frameAdvantage,
  };
}

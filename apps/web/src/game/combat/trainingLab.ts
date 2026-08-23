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
}

const FRAME_RATE = 60;

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
  const elapsed = Math.max(0, Number.isFinite(elapsedSec) ? elapsedSec : 0);
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
  const stamina = Math.max(0, Number.isFinite(input.playerStamina) ? input.playerStamina : 0);

  return {
    move: resolveTrainingMove(input.playerAttackType, input.playerComboStep, input.playerAttackElapsed),
    comboCount: Math.max(0, Math.floor(Number.isFinite(input.comboCount) ? input.comboCount : 0)),
    comboDamage: Math.max(0, Number.isFinite(input.comboDamage) ? input.comboDamage : 0),
    distance: Math.abs((Number.isFinite(input.opponentX) ? input.opponentX : 0) - (Number.isFinite(input.playerX) ? input.playerX : 0)),
    playerHitStunTimer: Math.max(0, Number.isFinite(input.playerHitStunTimer) ? input.playerHitStunTimer : 0),
    opponentHitStunTimer: Math.max(0, Number.isFinite(input.opponentHitStunTimer) ? input.opponentHitStunTimer : 0),
    playerDodgeTimer: Math.max(0, Number.isFinite(input.playerDodgeTimer) ? input.playerDodgeTimer : 0),
    guardBreakTimer: Math.max(0, Number.isFinite(input.guardBreakTimer) ? input.guardBreakTimer : 0),
    parryWindow: Math.max(0, Number.isFinite(input.playerBlockParryWindow) ? input.playerBlockParryWindow : 0),
    staminaRatio: Math.max(0, Math.min(1, stamina / maxStamina)),
    velocityX: Number.isFinite(input.playerVelocityX) ? input.playerVelocityX : 0,
    velocityY: Number.isFinite(input.playerVelocityY) ? input.playerVelocityY : 0,
  };
}

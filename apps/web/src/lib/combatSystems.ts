export enum CombatState {
  FREE = "FREE",
  ATTACKING = "ATTACKING",
  DODGING = "DODGING",
  HITSTUN = "HITSTUN",
  BLOCKING = "BLOCKING",
}

/** Duel / arena mode: formal FSM for player combat posture (separate from round `battlePhase`). */
export enum BattleCombatState {
  FREE = "FREE",
  ATTACKING = "ATTACKING",
  DODGING = "DODGING",
  BLOCKING = "BLOCKING",
  /** Brief window after block start — perfect parry */
  PARRY_WINDOW = "PARRY_WINDOW",
  HITSTUN = "HITSTUN",
  GUARD_BROKEN = "GUARD_BROKEN",
}

/** Battle mode stamina (block / specials / parry) — canonical values in `game/tuning/combat.json`. */
export { BATTLE_STAMINA } from "../game/tuning/combatTuning";

export type { AttackType, MoveData, DodgeData } from "../game/combat/moveData";
export {
  FRAME_TIME,
  MOVES,
  DODGE,
  STAMINA_CONFIG,
  COMBO_CONFIG,
  ATTACK_TYPE_TO_MOVE,
} from "../game/combat/moveData";

import type { AttackType, MoveData } from "../game/combat/moveData";
import { FRAME_TIME } from "../game/combat/moveData";

export { attackBreaksGuard, getClashPriority } from "../game/combat/guardAndClash";

export type { EnemyTierConfig, EnemyTierId } from "../game/tuning/enemyTuning";
export { ENEMY_TIERS, ENEMY_TUNING } from "../game/tuning/enemyTuning";

export function isInActiveWindow(move: MoveData, elapsedSeconds: number): boolean {
  const timing = getMoveFrameTime(move);
  return elapsedSeconds >= timing.startupTime && elapsedSeconds <= timing.startupTime + timing.activeTime;
}

export function getAutoTarget(
  playerX: number,
  playerZ: number,
  playerRotY: number,
  enemies: Array<{ id: string; posX: number; posZ: number; isDead: boolean }>
): string | null {
  let bestId: string | null = null;
  let bestScore = Infinity;

  const forwardX = Math.sin(playerRotY);
  const forwardZ = Math.cos(playerRotY);

  for (const e of enemies) {
    if (e.isDead) continue;

    const dx = e.posX - playerX;
    const dz = e.posZ - playerZ;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist > 18) continue;

    const dirX = dx / (dist || 1);
    const dirZ = dz / (dist || 1);
    const dot = forwardX * dirX + forwardZ * dirZ;
    const angle = Math.acos(Math.max(-1, Math.min(1, dot)));

    const score = dist + angle * 5;
    if (score < bestScore) {
      bestScore = score;
      bestId = e.id;
    }
  }

  return bestId;
}

export function getMoveFrameTime(move: MoveData): {
  startupTime: number;
  activeTime: number;
  recoveryTime: number;
  totalTime: number;
  cancelTime: number;
} {
  const startupTime = move.startup * FRAME_TIME;
  const activeTime = move.active * FRAME_TIME;
  const recoveryTime = move.recovery * FRAME_TIME;
  const totalTime = startupTime + activeTime + recoveryTime;
  const cancelTime = move.cancelAt > 0 ? move.cancelAt * FRAME_TIME : totalTime;
  return { startupTime, activeTime, recoveryTime, totalTime, cancelTime };
}

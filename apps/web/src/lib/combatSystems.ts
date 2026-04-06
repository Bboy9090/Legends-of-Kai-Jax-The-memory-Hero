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

export function attackBreaksGuard(type: AttackType): number {
  switch (type) {
    case "ultimate":
      return 55;
    case "special":
      return 40;
    case "kick":
      return 22;
    case "punch":
      return 12;
    default:
      return 0;
  }
}

export function isInActiveWindow(move: MoveData, elapsedSeconds: number): boolean {
  const timing = getMoveFrameTime(move);
  return elapsedSeconds >= timing.startupTime && elapsedSeconds <= timing.startupTime + timing.activeTime;
}

export function getClashPriority(type: AttackType | null | undefined): number {
  switch (type) {
    case "ultimate":
      return 4;
    case "special":
      return 3;
    case "kick":
      return 2;
    case "punch":
      return 1;
    default:
      return 0;
  }
}

export interface EnemyTierConfig {
  tier: "minion1" | "minion2" | "boss1" | "boss2";
  health: number;
  damage: number;
  speed: number;
  aggroRange: number;
  attackRange: number;
  attackInterval: number;
  telegraphDuration: number;
  retreatThreshold: number;
}

export const ENEMY_TIERS: Record<string, EnemyTierConfig> = {
  minion1: {
    tier: "minion1",
    health: 40,
    damage: 5,
    speed: 3,
    aggroRange: 14,
    attackRange: 2.5,
    attackInterval: 2.0,
    telegraphDuration: 0.6,
    retreatThreshold: 0.2,
  },
  minion2: {
    tier: "minion2",
    health: 60,
    damage: 8,
    speed: 4,
    aggroRange: 16,
    attackRange: 3.0,
    attackInterval: 1.8,
    telegraphDuration: 0.5,
    retreatThreshold: 0.15,
  },
  boss1: {
    tier: "boss1",
    health: 200,
    damage: 15,
    speed: 2.5,
    aggroRange: 20,
    attackRange: 3.5,
    attackInterval: 2.5,
    telegraphDuration: 0.8,
    retreatThreshold: 0.1,
  },
  boss2: {
    tier: "boss2",
    health: 400,
    damage: 22,
    speed: 2,
    aggroRange: 25,
    attackRange: 4.0,
    attackInterval: 3.0,
    telegraphDuration: 1.0,
    retreatThreshold: 0.05,
  },
};

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

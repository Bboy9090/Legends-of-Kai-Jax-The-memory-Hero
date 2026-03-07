export enum CombatState {
  FREE = "FREE",
  ATTACKING = "ATTACKING",
  DODGING = "DODGING",
  HITSTUN = "HITSTUN",
  BLOCKING = "BLOCKING",
}

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
  /** Synthetic: ultimate uses characterMoves for damage/range, this for timing. */
  ultimate: {
    startup: 12,
    active: 24,
    recovery: 30,
    cancelAt: 0,
    damage: 40,
    staminaCost: 0,
    knockback: 8,
    hitStopFrames: 12,
  },
};

/** Maps battle attack type to MOVES key for frame data. */
export const ATTACK_TYPE_TO_MOVE: Record<string, keyof typeof MOVES> = {
  punch: "light1",
  kick: "heavy",
  special: "skill",
  ultimate: "ultimate",
};

/** Move phase for hitbox: startup = no hitbox, active = hitbox, recovery = vulnerable. */
export type MovePhase = "startup" | "active" | "recovery";

/** Get move phase from elapsed time. */
export function getMovePhase(move: MoveData, elapsed: number): MovePhase {
  const ft = getMoveFrameTime(move);
  if (elapsed < ft.startupTime) return "startup";
  if (elapsed < ft.startupTime + ft.activeTime) return "active";
  return "recovery";
}

/** Check if elapsed is in active window (hitbox present). */
export function isInActiveWindow(move: MoveData, elapsed: number): boolean {
  return getMovePhase(move, elapsed) === "active";
}

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

/** Clash priority: higher wins. When equal, cinematic rebound resets neutral. */
export const CLASH_PRIORITY: Record<string, number> = {
  ultimate: 4,
  special: 3,
  kick: 2,
  punch: 1,
};

export function getClashPriority(attackType: string | null): number {
  return attackType ? (CLASH_PRIORITY[attackType] ?? 0) : 0;
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

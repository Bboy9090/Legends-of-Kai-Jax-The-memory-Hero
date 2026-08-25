import { AUTO_TARGET_CONFIG } from "../tuning/adventureTuning";

export interface AutoTargetEnemy {
  id: string;
  posX: number;
  posZ: number;
  isDead: boolean;
}

export interface AutoTargetScore {
  id: string;
  score: number;
  distance: number;
  angle: number;
}

const CURRENT_TARGET_BONUS = 1.35;
const CURRENT_TARGET_GRACE_MULT = 1.15;
const EPSILON = 1e-6;
let lastAutoTargetId: string | null = null;

function isFinitePoint(x: number, z: number): boolean {
  return Number.isFinite(x) && Number.isFinite(z);
}

function scoreAutoTargetWithinRange(
  playerX: number,
  playerZ: number,
  playerRotY: number,
  enemy: AutoTargetEnemy,
  maxRange: number,
): AutoTargetScore | null {
  if (enemy.isDead) return null;
  if (!isFinitePoint(playerX, playerZ) || !isFinitePoint(enemy.posX, enemy.posZ)) return null;
  if (!Number.isFinite(playerRotY) || !Number.isFinite(maxRange) || maxRange < 0) return null;

  const dx = enemy.posX - playerX;
  const dz = enemy.posZ - playerZ;
  const distance = Math.hypot(dx, dz);
  if (!Number.isFinite(distance) || distance > maxRange) return null;

  const forwardX = Math.sin(playerRotY);
  const forwardZ = Math.cos(playerRotY);
  const invDistance = distance > EPSILON ? 1 / distance : 0;
  const dirX = distance > EPSILON ? dx * invDistance : forwardX;
  const dirZ = distance > EPSILON ? dz * invDistance : forwardZ;
  const dot = Math.max(-1, Math.min(1, forwardX * dirX + forwardZ * dirZ));
  const angle = Math.acos(dot);
  const score = distance + angle * AUTO_TARGET_CONFIG.angleWeight;

  return { id: enemy.id, score, distance, angle };
}

export function scoreAutoTarget(
  playerX: number,
  playerZ: number,
  playerRotY: number,
  enemy: AutoTargetEnemy,
): AutoTargetScore | null {
  return scoreAutoTargetWithinRange(
    playerX,
    playerZ,
    playerRotY,
    enemy,
    AUTO_TARGET_CONFIG.maxRange,
  );
}

/**
 * Deterministic nearest-in-view targeting with persistent target hysteresis.
 * The current target gets a modest score bonus and a short range grace window,
 * while exact ties still resolve by stable id ordering.
 */
export function getAutoTarget(
  playerX: number,
  playerZ: number,
  playerRotY: number,
  enemies: AutoTargetEnemy[],
  currentTargetId: string | null = lastAutoTargetId,
): string | null {
  const scored = enemies
    .map((enemy) => {
      const isCurrent = enemy.id === currentTargetId;
      const allowedRange = isCurrent
        ? AUTO_TARGET_CONFIG.maxRange * CURRENT_TARGET_GRACE_MULT
        : AUTO_TARGET_CONFIG.maxRange;
      const candidate = scoreAutoTargetWithinRange(
        playerX,
        playerZ,
        playerRotY,
        enemy,
        allowedRange,
      );
      if (!candidate) return null;
      return {
        ...candidate,
        adjustedScore: candidate.score - (isCurrent ? CURRENT_TARGET_BONUS : 0),
      };
    })
    .filter(
      (candidate): candidate is AutoTargetScore & { adjustedScore: number } =>
        candidate !== null,
    )
    .sort((a, b) => {
      if (Math.abs(a.adjustedScore - b.adjustedScore) > EPSILON) {
        return a.adjustedScore - b.adjustedScore;
      }
      if (Math.abs(a.score - b.score) > EPSILON) return a.score - b.score;
      return a.id.localeCompare(b.id);
    });

  const bestId = scored[0]?.id ?? null;
  lastAutoTargetId = bestId;
  return bestId;
}

export function resetAutoTarget(): void {
  lastAutoTargetId = null;
}

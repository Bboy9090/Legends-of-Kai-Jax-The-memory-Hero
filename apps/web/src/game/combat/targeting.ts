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

const TARGET_STICKINESS_MULT = 1.12;
const EPSILON = 1e-6;

function isFinitePoint(x: number, z: number): boolean {
  return Number.isFinite(x) && Number.isFinite(z);
}

export function scoreAutoTarget(
  playerX: number,
  playerZ: number,
  playerRotY: number,
  enemy: AutoTargetEnemy
): AutoTargetScore | null {
  if (enemy.isDead) return null;
  if (!isFinitePoint(playerX, playerZ) || !isFinitePoint(enemy.posX, enemy.posZ)) return null;
  if (!Number.isFinite(playerRotY)) return null;

  const dx = enemy.posX - playerX;
  const dz = enemy.posZ - playerZ;
  const distance = Math.hypot(dx, dz);
  if (!Number.isFinite(distance) || distance > AUTO_TARGET_CONFIG.maxRange) return null;

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

/**
 * Deterministic nearest-in-view targeting with optional hysteresis.
 * Existing callers can omit `currentTargetId`; lock-on systems can provide it to
 * avoid rapid target flicker when two enemies have nearly identical scores.
 */
export function getAutoTarget(
  playerX: number,
  playerZ: number,
  playerRotY: number,
  enemies: AutoTargetEnemy[],
  currentTargetId?: string | null
): string | null {
  const scored = enemies
    .map((enemy) => scoreAutoTarget(playerX, playerZ, playerRotY, enemy))
    .filter((candidate): candidate is AutoTargetScore => candidate !== null)
    .sort((a, b) => {
      if (Math.abs(a.score - b.score) > EPSILON) return a.score - b.score;
      return a.id.localeCompare(b.id);
    });

  const best = scored[0];
  if (!best) return null;

  if (currentTargetId) {
    const current = scored.find((candidate) => candidate.id === currentTargetId);
    if (current && current.score <= best.score * TARGET_STICKINESS_MULT) {
      return current.id;
    }
  }

  return best.id;
}

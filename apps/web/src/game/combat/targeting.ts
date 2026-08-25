import { AUTO_TARGET_CONFIG } from "../tuning/adventureTuning";

const CURRENT_TARGET_BONUS = 1.35;
const CURRENT_TARGET_GRACE_MULT = 1.15;
let lastAutoTargetId: string | null = null;

export function getAutoTarget(
  playerX: number,
  playerZ: number,
  playerRotY: number,
  enemies: Array<{ id: string; posX: number; posZ: number; isDead: boolean }>,
  currentTargetId: string | null = lastAutoTargetId,
): string | null {
  let bestId: string | null = null;
  let bestScore = Infinity;

  const forwardX = Math.sin(playerRotY);
  const forwardZ = Math.cos(playerRotY);
  const maxRange = AUTO_TARGET_CONFIG.maxRange;
  const angleW = AUTO_TARGET_CONFIG.angleWeight;

  for (const e of enemies) {
    if (e.isDead) continue;

    const dx = e.posX - playerX;
    const dz = e.posZ - playerZ;
    const dist = Math.sqrt(dx * dx + dz * dz);
    const isCurrent = e.id === currentTargetId;
    const allowedRange = isCurrent ? maxRange * CURRENT_TARGET_GRACE_MULT : maxRange;

    if (dist > allowedRange) continue;

    const dirX = dx / (dist || 1);
    const dirZ = dz / (dist || 1);
    const dot = forwardX * dirX + forwardZ * dirZ;
    const angle = Math.acos(Math.max(-1, Math.min(1, dot)));

    // Keep the existing target unless another enemy is meaningfully better.
    const stickyBonus = isCurrent ? CURRENT_TARGET_BONUS : 0;
    const score = dist + angle * angleW - stickyBonus;
    if (score < bestScore) {
      bestScore = score;
      bestId = e.id;
    }
  }

  lastAutoTargetId = bestId;
  return bestId;
}

export function resetAutoTarget(): void {
  lastAutoTargetId = null;
}

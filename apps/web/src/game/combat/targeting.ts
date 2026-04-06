import { AUTO_TARGET_CONFIG } from "../tuning/adventureTuning";

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
  const maxRange = AUTO_TARGET_CONFIG.maxRange;
  const angleW = AUTO_TARGET_CONFIG.angleWeight;

  for (const e of enemies) {
    if (e.isDead) continue;

    const dx = e.posX - playerX;
    const dz = e.posZ - playerZ;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist > maxRange) continue;

    const dirX = dx / (dist || 1);
    const dirZ = dz / (dist || 1);
    const dot = forwardX * dirX + forwardZ * dirZ;
    const angle = Math.acos(Math.max(-1, Math.min(1, dot)));

    const score = dist + angle * angleW;
    if (score < bestScore) {
      bestScore = score;
      bestId = e.id;
    }
  }

  return bestId;
}

/** Pure movement step used by the live enemy AI and frame-based regression tests. */
export function retreatMovementStep(
  enemy: { posX: number; posZ: number },
  player: { posX: number; posZ: number },
  speed: number,
  delta: number,
) {
  const dx = player.posX - enemy.posX;
  const dz = player.posZ - enemy.posZ;
  const distance = Math.hypot(dx, dz);
  // At coincident positions, choose a deterministic escape direction instead of freezing.
  const fleeX = distance > 0 ? -dx / distance : 1;
  const fleeZ = distance > 0 ? -dz / distance : 0;
  const step = Math.max(0, speed) * 1.15 * Math.max(0, delta);
  return {
    nextX: enemy.posX + fleeX * step,
    nextZ: enemy.posZ + fleeZ * step,
    fleeRotation: Math.atan2(-dx, -dz),
  };
}

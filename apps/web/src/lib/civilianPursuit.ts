import type { AdventureEnemy, DedicatedCivilian } from './stores/useAdventure';

export function civilianPursuitStep(enemy: AdventureEnemy, civilians: readonly DedicatedCivilian[], speed: number, delta: number) {
  const living = civilians.filter(c => c.health > 0);
  const target = living.sort((a, b) => Math.hypot(a.posX - enemy.posX, a.posZ - enemy.posZ) - Math.hypot(b.posX - enemy.posX, b.posZ - enemy.posZ))[0];
  if (!target || enemy.isDead) return null;
  const dx = target.posX - enemy.posX;
  const dz = target.posZ - enemy.posZ;
  const distance = Math.hypot(dx, dz);
  const ratio = distance > 0 ? Math.min(1, Math.max(0, speed * delta) / distance) : 0;
  return { targetId: target.id, nextX: enemy.posX + dx * ratio, nextZ: enemy.posZ + dz * ratio };
}

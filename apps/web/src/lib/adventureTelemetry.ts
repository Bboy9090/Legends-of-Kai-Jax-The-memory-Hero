import type { AdventureEnemy, AdventurePlayerState, DedicatedCivilian } from "./stores/useAdventure";

export const CHASE_ESCAPE_DISTANCE = 75;
export const CIVILIAN_ATTACK_DISTANCE = 4.5;
export const CIVILIAN_ATTACK_DAMAGE = 15;
export const CIVILIAN_ATTACK_COOLDOWN_MS = 2000;

export function hasChaseTargetEscaped(player: Pick<AdventurePlayerState, "posX" | "posZ">, enemies: AdventureEnemy[]): boolean {
  return enemies.some(e => e.fighterId === "void-stalker" && !e.isDead &&
    Math.hypot(e.posX - player.posX, e.posZ - player.posZ) >= CHASE_ESCAPE_DISTANCE);
}

export function findCivilianAttack(
  enemies: AdventureEnemy[],
  civilians: DedicatedCivilian[],
  nowMs: number,
  lastAttackByEnemy: ReadonlyMap<string, number>,
): { enemyId: string; civilianId: string }[] {
  const attacks: { enemyId: string; civilianId: string }[] = [];
  for (const enemy of enemies) {
    if (enemy.isDead || enemy.health <= 0 || (enemy.aiState !== "chase" && enemy.aiState !== "attack")) continue;
    const previous = lastAttackByEnemy.get(enemy.id);
    if (previous !== undefined && nowMs - previous < CIVILIAN_ATTACK_COOLDOWN_MS) continue;
    const target = civilians.find(c => c.health > 0 &&
      Math.hypot(c.posX - enemy.posX, c.posZ - enemy.posZ) <= CIVILIAN_ATTACK_DISTANCE);
    if (target) attacks.push({ enemyId: enemy.id, civilianId: target.id });
  }
  return attacks;
}

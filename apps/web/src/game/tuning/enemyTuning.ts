import enemiesJson from "./enemies.json";

export type EnemyTierId = "minion1" | "minion2" | "boss1" | "boss2";

export interface EnemyTierConfig {
  tier: EnemyTierId;
  health: number;
  damage: number;
  speed: number;
  aggroRange: number;
  attackRange: number;
  attackInterval: number;
  telegraphDuration: number;
  retreatThreshold: number;
}

export const ENEMY_TIERS = enemiesJson as Record<string, EnemyTierConfig>;

export const ENEMY_TUNING = enemiesJson;

/**
 * FANG SYNDICATE COMBATANT
 * Day 5.2 - Source-safe internal contract for vertical slice enemy
 *
 * This enemy is INTERNALLY DEFINED ONLY. No rank, weapon, biology, uniform,
 * backstory, drops, or book chronology. Those require CANON DECISION.
 *
 * Purpose: Prove vertical slice mechanics (traversal, memory trace, encounter, extraction)
 * with a deterministic combat target that can be damaged, defeated, and track state.
 */

export interface FangCombatantState {
  id: string;
  health: number;
  maxHealth: number;
  isDead: boolean;
  isStaggered: boolean;
  staggerTimer: number;
  lastHitTime: number;
  position: { x: number; y: number; z: number };
}

export const FANG_COMBATANT_CONFIG = {
  maxHealth: 100,
  staggerThreshold: 20, // damage to trigger stagger
  staggerDuration: 0.6, // seconds
  recoverDelay: 0.3, // time before counter-attack after stagger
  attackDamage: 8,
  attackCooldown: 1.5,
  aggroRange: 15,
} as const;

export function createFangCombatant(id: string): FangCombatantState {
  return {
    id,
    health: FANG_COMBATANT_CONFIG.maxHealth,
    maxHealth: FANG_COMBATANT_CONFIG.maxHealth,
    isDead: false,
    isStaggered: false,
    staggerTimer: 0,
    lastHitTime: -Infinity,
    position: { x: 0, y: 0.5, z: 2 },
  };
}

export function damageFangCombatant(
  state: FangCombatantState,
  damage: number,
  currentTime: number
): void {
  if (state.isDead) return;

  state.health = Math.max(0, state.health - damage);
  state.lastHitTime = currentTime;

  if (state.health <= 0) {
    state.isDead = true;
    state.health = 0;
  } else if (damage >= FANG_COMBATANT_CONFIG.staggerThreshold) {
    state.isStaggered = true;
    state.staggerTimer = FANG_COMBATANT_CONFIG.staggerDuration;
  }
}

export function updateFangCombatant(
  state: FangCombatantState,
  deltaTime: number
): void {
  if (state.isDead) return;

  if (state.isStaggered) {
    state.staggerTimer -= deltaTime;
    if (state.staggerTimer <= 0) {
      state.isStaggered = false;
      state.staggerTimer = 0;
    }
  }
}

export function canFangCombatantAttack(
  state: FangCombatantState,
  currentTime: number
): boolean {
  if (state.isDead || state.isStaggered) return false;
  return currentTime - state.lastHitTime >= FANG_COMBATANT_CONFIG.attackCooldown;
}

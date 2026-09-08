/**
 * FANG SYNDICATE COMBATANT
 * Day 5.2 - Source-safe internal contract for the Ashblock vertical slice.
 *
 * This enemy is INTERNALLY DEFINED ONLY. No rank, weapon, biology, uniform,
 * backstory, drops, or book chronology. Those require CANON DECISION.
 *
 * Purpose: prove a deterministic combat loop without inventing publication
 * canon. Behavior labels are implementation states, not story/rank names.
 */

export type FangCombatantBehavior =
  | 'IDLE'
  | 'CHASE'
  | 'WINDUP'
  | 'RECOVERY'
  | 'STAGGER'
  | 'DEAD';

export interface FangVector3 {
  x: number;
  y: number;
  z: number;
}

export interface FangCombatantState {
  id: string;
  health: number;
  maxHealth: number;
  isDead: boolean;
  isStaggered: boolean;
  staggerTimer: number;
  lastHitTime: number;
  lastAttackTime: number;
  attackWindupTimer: number;
  behavior: FangCombatantBehavior;
  position: FangVector3;
  velocity: FangVector3;
}

export const FANG_COMBATANT_CONFIG = {
  maxHealth: 100,
  staggerThreshold: 20,
  staggerDuration: 0.6,
  recoverDelay: 0.3,
  attackDamage: 8,
  attackCooldown: 1.5,
  attackWindup: 0.35,
  aggroRange: 15,
  attackRange: 1.8,
  stopRange: 1.35,
  moveSpeed: 2.8,
  knockbackDamping: 7,
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
    lastAttackTime: -Infinity,
    attackWindupTimer: 0,
    behavior: 'IDLE',
    position: { x: 0, y: 0.5, z: 2 },
    velocity: { x: 0, y: 0, z: 0 },
  };
}

export function damageFangCombatant(
  state: FangCombatantState,
  damage: number,
  currentTime: number
): void {
  if (state.isDead || !Number.isFinite(damage) || damage <= 0) return;

  state.health = Math.max(0, state.health - damage);
  state.lastHitTime = currentTime;

  if (state.health <= 0) {
    state.isDead = true;
    state.isStaggered = false;
    state.staggerTimer = 0;
    state.attackWindupTimer = 0;
    state.behavior = 'DEAD';
    state.velocity.x = 0;
    state.velocity.y = 0;
    state.velocity.z = 0;
  } else if (damage >= FANG_COMBATANT_CONFIG.staggerThreshold) {
    state.isStaggered = true;
    state.staggerTimer = FANG_COMBATANT_CONFIG.staggerDuration;
    state.attackWindupTimer = 0;
    state.behavior = 'STAGGER';
  }
}

export function applyFangKnockback(
  state: FangCombatantState,
  force: FangVector3
): void {
  if (state.isDead) return;
  if (![force.x, force.y, force.z].every(Number.isFinite)) return;

  state.velocity.x += force.x;
  state.velocity.y += force.y;
  state.velocity.z += force.z;
}

export function updateFangCombatant(
  state: FangCombatantState,
  deltaTime: number
): void {
  if (state.isDead) {
    state.behavior = 'DEAD';
    return;
  }

  const delta = Math.max(0, Math.min(deltaTime, 0.05));

  if (state.isStaggered) {
    state.staggerTimer = Math.max(0, state.staggerTimer - delta);
    state.behavior = 'STAGGER';
    if (state.staggerTimer === 0) {
      state.isStaggered = false;
      state.behavior = 'IDLE';
    }
  }
}

export function canFangCombatantAttack(
  state: FangCombatantState,
  currentTime: number
): boolean {
  if (state.isDead || state.isStaggered || state.attackWindupTimer > 0) return false;

  const attackCooldownReady =
    currentTime - state.lastAttackTime >= FANG_COMBATANT_CONFIG.attackCooldown;
  const postHitRecoveryReady =
    currentTime - state.lastHitTime >= FANG_COMBATANT_CONFIG.recoverDelay;

  return attackCooldownReady && postHitRecoveryReady;
}

export function markFangCombatantAttackResolved(
  state: FangCombatantState,
  currentTime: number
): void {
  state.lastAttackTime = currentTime;
  state.attackWindupTimer = 0;
  if (!state.isDead && !state.isStaggered) {
    state.behavior = 'RECOVERY';
  }
}

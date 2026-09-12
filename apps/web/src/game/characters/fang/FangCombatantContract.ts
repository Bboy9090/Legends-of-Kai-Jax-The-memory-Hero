/**
 * FANG SYNDICATE COMBATANT
 * Deterministic, source-safe combat contract for Ashblock Heights.
 *
 * Phase 5.5 promotes only already-approved Fang Syndicate gameplay roles.
 * These are combat archetypes, not new lore, ranks, weapons, drops, biology,
 * or chronology. Exact visual equipment remains presentation-owned.
 */

export type FangCombatantBehavior =
  | 'IDLE'
  | 'CHASE'
  | 'WINDUP'
  | 'RECOVERY'
  | 'STAGGER'
  | 'DEAD';

export type FangCombatantArchetype =
  | 'baseline'
  | 'razor-scout'
  | 'enforcer'
  | 'chain-bruiser'
  | 'district-lieutenant';

export interface FangVector3 {
  x: number;
  y: number;
  z: number;
}

export interface FangCombatantConfig {
  maxHealth: number;
  staggerThreshold: number;
  staggerDuration: number;
  recoverDelay: number;
  attackDamage: number;
  attackCooldown: number;
  attackWindup: number;
  aggroRange: number;
  attackRange: number;
  stopRange: number;
  moveSpeed: number;
  knockbackDamping: number;
}

export interface FangCombatantState {
  id: string;
  archetype: FangCombatantArchetype;
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

/**
 * Baseline values remain exactly the Day 5.2 authority so existing Ashblock
 * behavior does not drift merely because Phase 5.5 adds variants.
 */
export const FANG_COMBATANT_CONFIG: FangCombatantConfig = {
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
};

export const FANG_COMBATANT_ARCHETYPE_CONFIG: Record<FangCombatantArchetype, FangCombatantConfig> = {
  baseline: FANG_COMBATANT_CONFIG,
  'razor-scout': {
    maxHealth: 70,
    staggerThreshold: 16,
    staggerDuration: 0.45,
    recoverDelay: 0.22,
    attackDamage: 6,
    attackCooldown: 1.05,
    attackWindup: 0.22,
    aggroRange: 18,
    attackRange: 1.6,
    stopRange: 1.2,
    moveSpeed: 4.4,
    knockbackDamping: 8.5,
  },
  enforcer: {
    maxHealth: 140,
    staggerThreshold: 28,
    staggerDuration: 0.5,
    recoverDelay: 0.4,
    attackDamage: 12,
    attackCooldown: 1.9,
    attackWindup: 0.55,
    aggroRange: 14,
    attackRange: 2.0,
    stopRange: 1.55,
    moveSpeed: 2.15,
    knockbackDamping: 9.5,
  },
  'chain-bruiser': {
    maxHealth: 170,
    staggerThreshold: 32,
    staggerDuration: 0.55,
    recoverDelay: 0.45,
    attackDamage: 10,
    attackCooldown: 2.2,
    attackWindup: 0.7,
    aggroRange: 16,
    attackRange: 2.7,
    stopRange: 2.2,
    moveSpeed: 1.85,
    knockbackDamping: 10,
  },
  'district-lieutenant': {
    maxHealth: 260,
    staggerThreshold: 35,
    staggerDuration: 0.4,
    recoverDelay: 0.3,
    attackDamage: 14,
    attackCooldown: 1.45,
    attackWindup: 0.48,
    aggroRange: 22,
    attackRange: 2.2,
    stopRange: 1.7,
    moveSpeed: 3.1,
    knockbackDamping: 11,
  },
};

export function getFangCombatantConfig(
  stateOrArchetype: FangCombatantState | FangCombatantArchetype
): FangCombatantConfig {
  const archetype = typeof stateOrArchetype === 'string'
    ? stateOrArchetype
    : stateOrArchetype.archetype;
  return FANG_COMBATANT_ARCHETYPE_CONFIG[archetype];
}

export function createFangCombatant(
  id: string,
  archetype: FangCombatantArchetype = 'baseline'
): FangCombatantState {
  const config = getFangCombatantConfig(archetype);
  return {
    id,
    archetype,
    health: config.maxHealth,
    maxHealth: config.maxHealth,
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

  const config = getFangCombatantConfig(state);
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
  } else if (damage >= config.staggerThreshold) {
    state.isStaggered = true;
    state.staggerTimer = config.staggerDuration;
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

  const delta = Number.isFinite(deltaTime) ? Math.max(0, deltaTime) : 0;

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

  const config = getFangCombatantConfig(state);
  const attackCooldownReady = currentTime - state.lastAttackTime >= config.attackCooldown;
  const postHitRecoveryReady = currentTime - state.lastHitTime >= config.recoverDelay;

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

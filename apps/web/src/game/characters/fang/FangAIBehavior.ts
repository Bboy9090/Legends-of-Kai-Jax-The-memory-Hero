/**
 * FANG SYNDICATE COMBATANT AI
 * Day 5.2 - Behavior tree for Ashblock Heights encounter
 *
 * Fang's action selection based on:
 * - Distance to player
 * - Current health
 * - Stagger state
 * - Recent hit timing
 *
 * Internally defined. No rank/weapon/biography.
 */

import * as THREE from 'three';
import { type FangCombatantState, FANG_COMBATANT_CONFIG } from './FangCombatantContract';

export type FangAction = 'idle' | 'pursue' | 'attack' | 'staggered' | 'dead';

export interface FangAIState {
  action: FangAction;
  targetPos: THREE.Vector3 | null;
  attackStartTime: number | null;
  lastDecisionTime: number;
}

const AI_CONFIG = {
  decisionInterval: 0.3, // seconds between decision updates
  pursueDistance: FANG_COMBATANT_CONFIG.aggroRange, // 15
  attackDistance: 2.5,
  healthThresholds: {
    aggressive: 0.7, // pursue above 70% health
    balanced: 0.4,   // balanced between 40-70%
    desperate: 0.0,  // below 40%, more frequent attacks
  },
} as const;

export function createFangAIState(): FangAIState {
  return {
    action: 'idle',
    targetPos: null,
    attackStartTime: null,
    lastDecisionTime: -Infinity,
  };
}

export function updateFangAI(
  combatantState: FangCombatantState,
  aiState: FangAIState,
  playerPos: THREE.Vector3,
  currentTime: number
): FangAction {
  // Dead or staggered: no decisions
  if (combatantState.isDead || combatantState.isStaggered) {
    aiState.action = combatantState.isDead ? 'dead' : 'staggered';
    return aiState.action;
  }

  // Decision interval: only reconsider every 0.3s
  if (currentTime - aiState.lastDecisionTime < AI_CONFIG.decisionInterval) {
    return aiState.action;
  }

  aiState.lastDecisionTime = currentTime;

  const fangPos = new THREE.Vector3(
    combatantState.position.x,
    combatantState.position.y,
    combatantState.position.z
  );

  const distToPlayer = fangPos.distanceTo(playerPos);
  const healthPercent = combatantState.health / combatantState.maxHealth;

  // Out of aggro range: idle
  if (distToPlayer > AI_CONFIG.pursueDistance) {
    aiState.action = 'idle';
    aiState.targetPos = null;
    return aiState.action;
  }

  // In range: pursue or attack
  aiState.targetPos = playerPos.clone();

  // Decide action based on distance and health
  if (distToPlayer < AI_CONFIG.attackDistance) {
    // Can attack
    const canAttack = Math.random() < getAttackChance(healthPercent);
    if (canAttack) {
      aiState.action = 'attack';
      aiState.attackStartTime = currentTime;
    } else {
      aiState.action = 'pursue';
    }
  } else {
    // Too far: pursue
    aiState.action = 'pursue';
  }

  return aiState.action;
}

/**
 * Attack frequency scales with desperation.
 * Healthy: ~50% chance when in range
 * Moderate: ~65% chance
 * Low health: ~80% chance
 */
function getAttackChance(healthPercent: number): number {
  if (healthPercent >= AI_CONFIG.healthThresholds.aggressive) {
    return 0.5;
  }
  if (healthPercent >= AI_CONFIG.healthThresholds.balanced) {
    return 0.65;
  }
  return 0.8;
}

/**
 * Calculate Fang's target movement direction.
 * Moves directly toward player in pursuit.
 * Strafes slightly during attack cooldown (not moving forward).
 */
export function calculateFangMovementDirection(
  fangPos: THREE.Vector3,
  targetPos: THREE.Vector3,
  action: FangAction
): THREE.Vector3 {
  const direction = new THREE.Vector3()
    .subVectors(targetPos, fangPos)
    .normalize();

  // During attacks, slow down/strafe slightly
  if (action === 'attack') {
    direction.multiplyScalar(0.3);
  } else if (action === 'pursue') {
    direction.multiplyScalar(0.8); // Pursuit speed: 80% of normal
  } else {
    direction.multiplyScalar(0);
  }

  return direction;
}

export const FANG_AI_CONFIG = AI_CONFIG;

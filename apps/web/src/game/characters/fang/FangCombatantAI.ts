import {
  FANG_COMBATANT_CONFIG,
  canFangCombatantAttack,
  markFangCombatantAttackResolved,
  updateFangCombatant,
  type FangCombatantBehavior,
  type FangCombatantState,
  type FangVector3,
} from './FangCombatantContract';

export interface FangAIUpdateResult {
  behavior: FangCombatantBehavior;
  distanceToPlayer: number;
  attackResolved: boolean;
  attackDamage: number;
}

const MAX_SIM_STEP = 0.05;
const MAX_WALL_CLOCK_CATCHUP = 0.5;
const lastUpdateTimeByState = new WeakMap<FangCombatantState, number>();

function planarDistance(a: FangVector3, b: FangVector3): number {
  return Math.hypot(b.x - a.x, b.z - a.z);
}

function moveToward(
  state: FangCombatantState,
  target: FangVector3,
  delta: number
): void {
  const dx = target.x - state.position.x;
  const dz = target.z - state.position.z;
  const distance = Math.hypot(dx, dz);
  if (distance <= FANG_COMBATANT_CONFIG.stopRange || distance < 0.0001) return;

  const maxTravel = Math.max(
    0,
    Math.min(
      FANG_COMBATANT_CONFIG.moveSpeed * delta,
      distance - FANG_COMBATANT_CONFIG.stopRange
    )
  );

  state.position.x += (dx / distance) * maxTravel;
  state.position.z += (dz / distance) * maxTravel;
}

function applyExternalVelocity(state: FangCombatantState, delta: number): void {
  if (state.isDead) return;

  state.position.x += state.velocity.x * delta;
  state.position.y += state.velocity.y * delta;
  state.position.z += state.velocity.z * delta;

  const damping = Math.exp(-FANG_COMBATANT_CONFIG.knockbackDamping * delta);
  state.velocity.x *= damping;
  state.velocity.y *= damping;
  state.velocity.z *= damping;

  if (Math.abs(state.velocity.x) < 0.001) state.velocity.x = 0;
  if (Math.abs(state.velocity.y) < 0.001) state.velocity.y = 0;
  if (Math.abs(state.velocity.z) < 0.001) state.velocity.z = 0;
}

function stepFangCombatantAI(
  state: FangCombatantState,
  playerPosition: FangVector3,
  delta: number,
  currentTime: number
): FangAIUpdateResult {
  updateFangCombatant(state, delta);
  applyExternalVelocity(state, delta);

  if (state.isDead) {
    state.behavior = 'DEAD';
    return {
      behavior: state.behavior,
      distanceToPlayer: planarDistance(state.position, playerPosition),
      attackResolved: false,
      attackDamage: 0,
    };
  }

  if (state.isStaggered) {
    state.behavior = 'STAGGER';
    return {
      behavior: state.behavior,
      distanceToPlayer: planarDistance(state.position, playerPosition),
      attackResolved: false,
      attackDamage: 0,
    };
  }

  let distance = planarDistance(state.position, playerPosition);

  if (state.attackWindupTimer > 0) {
    state.behavior = 'WINDUP';
    state.attackWindupTimer = Math.max(0, state.attackWindupTimer - delta);

    if (state.attackWindupTimer === 0) {
      const stillInRange = distance <= FANG_COMBATANT_CONFIG.attackRange * 1.15;
      markFangCombatantAttackResolved(state, currentTime);
      return {
        behavior: state.behavior,
        distanceToPlayer: distance,
        attackResolved: stillInRange,
        attackDamage: stillInRange ? FANG_COMBATANT_CONFIG.attackDamage : 0,
      };
    }

    return {
      behavior: state.behavior,
      distanceToPlayer: distance,
      attackResolved: false,
      attackDamage: 0,
    };
  }

  if (distance > FANG_COMBATANT_CONFIG.aggroRange) {
    state.behavior = 'IDLE';
    return {
      behavior: state.behavior,
      distanceToPlayer: distance,
      attackResolved: false,
      attackDamage: 0,
    };
  }

  if (distance <= FANG_COMBATANT_CONFIG.attackRange) {
    if (canFangCombatantAttack(state, currentTime)) {
      state.attackWindupTimer = FANG_COMBATANT_CONFIG.attackWindup;
      state.behavior = 'WINDUP';
      return {
        behavior: state.behavior,
        distanceToPlayer: distance,
        attackResolved: false,
        attackDamage: 0,
      };
    }

    // Once the Fang is already in attack range, cooldown/recovery owns the
    // state. Do not keep creeping into the player while an attack is cooling down.
    state.behavior = 'RECOVERY';
    return {
      behavior: state.behavior,
      distanceToPlayer: distance,
      attackResolved: false,
      attackDamage: 0,
    };
  }

  if (distance > FANG_COMBATANT_CONFIG.stopRange) {
    state.behavior = 'CHASE';
    moveToward(state, playerPosition, delta);
    distance = planarDistance(state.position, playerPosition);
  } else {
    state.behavior = 'RECOVERY';
  }

  return {
    behavior: state.behavior,
    distanceToPlayer: distance,
    attackResolved: false,
    attackDamage: 0,
  };
}

export function updateFangCombatantAI(
  state: FangCombatantState,
  playerPosition: FangVector3,
  deltaTime: number,
  currentTime: number
): FangAIUpdateResult {
  const suppliedDelta = Number.isFinite(deltaTime) ? Math.max(0, deltaTime) : 0;
  const previousUpdateTime = lastUpdateTimeByState.get(state);
  const wallClockDelta = previousUpdateTime === undefined || !Number.isFinite(currentTime)
    ? 0
    : Math.max(0, currentTime - previousUpdateTime);

  if (Number.isFinite(currentTime)) {
    lastUpdateTimeByState.set(state, currentTime);
  }

  // The scene intentionally caps its render-frame gameplay delta for controller
  // stability. Presentation-heavy/headless WebGL can render well below realtime,
  // so use elapsed simulation time as catch-up authority while retaining bounded
  // <=50 ms AI substeps. This prevents visuals from slowing Fang pursuit/windup.
  const catchupDelta = Math.min(wallClockDelta, MAX_WALL_CLOCK_CATCHUP);
  const simulationDelta = Math.max(suppliedDelta, catchupDelta);

  if (simulationDelta <= 0) {
    return stepFangCombatantAI(state, playerPosition, 0, currentTime);
  }

  let remaining = simulationDelta;
  let simulated = 0;
  let result: FangAIUpdateResult = {
    behavior: state.behavior,
    distanceToPlayer: planarDistance(state.position, playerPosition),
    attackResolved: false,
    attackDamage: 0,
  };
  let attackResolved = false;
  let attackDamage = 0;

  while (remaining > 0.000001) {
    const step = Math.min(remaining, MAX_SIM_STEP);
    simulated += step;
    const stepTime = Number.isFinite(currentTime)
      ? currentTime - simulationDelta + simulated
      : currentTime;

    const stepResult = stepFangCombatantAI(state, playerPosition, step, stepTime);
    if (stepResult.attackResolved) {
      attackResolved = true;
      attackDamage += stepResult.attackDamage;
    }
    result = stepResult;
    remaining -= step;
  }

  return {
    ...result,
    attackResolved,
    attackDamage,
  };
}

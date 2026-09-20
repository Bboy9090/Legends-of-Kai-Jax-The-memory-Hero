import {
  canFangCombatantAttack,
  getFangCombatantConfig,
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
const MAX_WALL_CLOCK_CATCHUP = 0.25;
const lastUpdateTimeByState = new WeakMap<FangCombatantState, number>();

function planarDistance(a: FangVector3, b: FangVector3): number {
  return Math.hypot(b.x - a.x, b.z - a.z);
}

function moveToward(
  state: FangCombatantState,
  target: FangVector3,
  delta: number
): void {
  const config = getFangCombatantConfig(state);
  const dx = target.x - state.position.x;
  const dz = target.z - state.position.z;
  const distance = Math.hypot(dx, dz);
  if (distance <= config.stopRange || distance < 0.0001) return;

  const maxTravel = Math.max(
    0,
    Math.min(
      config.moveSpeed * delta,
      distance - config.stopRange
    )
  );

  state.position.x += (dx / distance) * maxTravel;
  state.position.z += (dz / distance) * maxTravel;
}

function applyExternalVelocity(state: FangCombatantState, delta: number): void {
  if (state.isDead) return;

  const config = getFangCombatantConfig(state);
  state.position.x += state.velocity.x * delta;
  state.position.y += state.velocity.y * delta;
  state.position.z += state.velocity.z * delta;

  const damping = Math.exp(-config.knockbackDamping * delta);
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
  movementDelta: number,
  lifecycleDelta: number,
  currentTime: number
): FangAIUpdateResult {
  const config = getFangCombatantConfig(state);

  // Keep physical motion on the same bounded render/simulation clock as the
  // player controllers. Combat lifecycle may catch up independently, but never
  // beyond the same 0.25s ceiling used by Kai/Jax lifecycle authority.
  updateFangCombatant(state, lifecycleDelta);
  applyExternalVelocity(state, movementDelta);

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
    state.attackWindupTimer = Math.max(0, state.attackWindupTimer - lifecycleDelta);

    if (state.attackWindupTimer === 0) {
      const stillInRange = distance <= config.attackRange * 1.15;
      markFangCombatantAttackResolved(state, currentTime);
      return {
        behavior: state.behavior,
        distanceToPlayer: distance,
        attackResolved: stillInRange,
        attackDamage: stillInRange ? config.attackDamage : 0,
      };
    }

    return {
      behavior: state.behavior,
      distanceToPlayer: distance,
      attackResolved: false,
      attackDamage: 0,
    };
  }

  if (distance > config.aggroRange) {
    state.behavior = 'IDLE';
    return {
      behavior: state.behavior,
      distanceToPlayer: distance,
      attackResolved: false,
      attackDamage: 0,
    };
  }

  if (distance <= config.attackRange) {
    if (canFangCombatantAttack(state, currentTime)) {
      state.attackWindupTimer = config.attackWindup;
      state.behavior = 'WINDUP';
      return {
        behavior: state.behavior,
        distanceToPlayer: distance,
        attackResolved: false,
        attackDamage: 0,
      };
    }

    state.behavior = 'RECOVERY';
    return {
      behavior: state.behavior,
      distanceToPlayer: distance,
      attackResolved: false,
      attackDamage: 0,
    };
  }

  if (distance > config.stopRange) {
    state.behavior = 'CHASE';
    moveToward(state, playerPosition, movementDelta);
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

  const catchupDelta = Math.min(wallClockDelta, MAX_WALL_CLOCK_CATCHUP);
  const movementDelta = Math.min(suppliedDelta, MAX_SIM_STEP);
  const lifecycleDelta = Math.max(movementDelta, catchupDelta);

  // Never apply wall-clock catch-up to chase or knockback displacement. Doing so
  // makes Fang locomotion advance by wall-clock time while Kai/Jax locomotion
  // remains bounded. Lifecycle catch-up is preserved, but capped to the same
  // 0.25s authority as the heroes so sparse frames cannot accelerate Fang combat.
  return stepFangCombatantAI(
    state,
    playerPosition,
    movementDelta,
    lifecycleDelta,
    currentTime
  );
}

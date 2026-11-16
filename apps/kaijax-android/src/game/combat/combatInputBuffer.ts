export type CombatBufferedAction =
  | 'light'
  | 'heavy'
  | 'dodge'
  | 'tactical'
  | 'duo'
  | 'ability_1'
  | 'ability_2'
  | 'ability_3';

export interface CombatInputBufferState {
  action: CombatBufferedAction | null;
  remainingSeconds: number;
  windowSeconds: number;
}

export const DEFAULT_COMBAT_BUFFER_WINDOW = 0.22;

const ACTION_PRIORITY: Record<CombatBufferedAction, number> = {
  dodge: 5,
  duo: 4,
  ability_1: 3,
  ability_2: 3,
  ability_3: 3,
  tactical: 2,
  heavy: 2,
  light: 1,
};

export function createCombatInputBuffer(
  windowSeconds = DEFAULT_COMBAT_BUFFER_WINDOW
): CombatInputBufferState {
  return {
    action: null,
    remainingSeconds: 0,
    windowSeconds,
  };
}

/**
 * Buffers a combat action pressed during active attack/dodge recovery.
 * Higher-priority defensive or finisher inputs override lower-priority queued strikes;
 * equal-priority inputs refresh the buffer with the latest player intent.
 */
export function bufferCombatAction(
  state: CombatInputBufferState,
  action: CombatBufferedAction
): CombatInputBufferState {
  if (
    state.action !== null &&
    state.remainingSeconds > 0 &&
    ACTION_PRIORITY[action] < ACTION_PRIORITY[state.action]
  ) {
    return state;
  }
  return {
    ...state,
    action,
    remainingSeconds: state.windowSeconds,
  };
}

export function tickCombatBuffer(
  state: CombatInputBufferState,
  dt: number
): CombatInputBufferState {
  if (!state.action || state.remainingSeconds <= 0) {
    return state.action === null && state.remainingSeconds === 0
      ? state
      : { ...state, action: null, remainingSeconds: 0 };
  }
  const next = Math.max(0, state.remainingSeconds - Math.max(0, dt));
  if (next <= 0) {
    return { ...state, action: null, remainingSeconds: 0 };
  }
  return { ...state, remainingSeconds: next };
}

export function consumeBufferedAction(
  state: CombatInputBufferState
): { consumed: CombatBufferedAction | null; nextState: CombatInputBufferState } {
  if (!state.action || state.remainingSeconds <= 0) {
    return { consumed: null, nextState: { ...state, action: null, remainingSeconds: 0 } };
  }
  return {
    consumed: state.action,
    nextState: { ...state, action: null, remainingSeconds: 0 },
  };
}

export function clearCombatBuffer(state: CombatInputBufferState): CombatInputBufferState {
  return { ...state, action: null, remainingSeconds: 0 };
}

/**
 * Responsive free-flow cancel rule:
 * Dodge/Parry can cancel active light/air strikes at any point after initial startup
 * and heavy strike recovery frames once the impact window has passed (attackTimer <= 0.24s).
 */
export function canCancelAttackIntoDodge(
  attackTimer: number,
  activeAttackType: 'none' | 'light' | 'heavy' | 'air' | 'ability'
): boolean {
  if (attackTimer <= 0 || activeAttackType === 'none') return true;
  if (activeAttackType === 'light' || activeAttackType === 'air') return true;
  if (activeAttackType === 'heavy') return attackTimer <= 0.28;
  return attackTimer <= 0.18;
}

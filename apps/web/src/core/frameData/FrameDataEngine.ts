export interface HitboxData {
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface CancelWindow {
  start: number;
  end: number;
}

export interface MovementProfile {
  frame: number;
  vx: number;
  vy?: number;
  vz?: number;
}

export interface InvincibleFrames {
  start: number;
  end: number;
}

export interface MoveData {
  name: string;
  type: string;
  startup: number;
  active: number;
  recovery: number;
  total: number;
  damage: number;
  hitstun: number;
  blockstun: number;
  hitstopOnHit: number;
  hitstopOnBlock: number;
  knockback: Vector2;
  onHitAdvantage: number;
  onBlockAdvantage: number;
  cancelWindow: CancelWindow | null;
  cancelOnHit: boolean;
  cancelOnWhiff: boolean;
  cancelInto: string[];
  hitbox: HitboxData;
  airOnly?: boolean;
  groundOnly?: boolean;
  counterHitLaunch?: boolean;
  movementProfile?: MovementProfile[];
}

export interface TailMoveData {
  tailId: string;
  name: string;
  startup: number;
  active: number;
  recovery: number;
  total: number;
  damage: number;
  hitstun?: number;
  blockstun?: number;
  hitstopOnHit?: number;
  hitstopOnBlock?: number;
  knockback?: Vector2;
  meterCost: number;
  cooldown: number;
  hitbox?: HitboxData;
  effect?: string;
  effectDamage?: number;
  effectDuration?: number;
  effectAmount?: number;
  movement?: Vector2;
  invincibleFrames?: InvincibleFrames;
  isCounter?: boolean;
  reflectMultiplier?: number;
  isTrap?: boolean;
  trapHitbox?: { width: number; height: number };
  isParry?: boolean;
  perfectWindow?: number;
  isUltimate?: boolean;
  guardBreak?: boolean;
}

export const FRAME_CONSTANTS = {
  FPS: 60,
  FRAME_MS: 1000 / 60,
  INPUT_BUFFER_FRAMES: 6,
  HITSTOP_LIGHT: 4,
  HITSTOP_MEDIUM: 6,
  HITSTOP_HEAVY: 10,
  HITSTOP_SPECIAL: 15,
  BLOCK_STARTUP: 6,
  PERFECT_BLOCK_WINDOW: 3,
  WAKEUP_FRAMES: 20,
  WAKEUP_INVINCIBLE: true,
} as const;

export const MOVE_PHASE = {
  IDLE: 'IDLE',
  STARTUP: 'STARTUP',
  ACTIVE: 'ACTIVE',
  RECOVERY: 'RECOVERY',
} as const;

export type MovePhaseType = typeof MOVE_PHASE[keyof typeof MOVE_PHASE];

export const FIGHTER_STATE = {
  IDLE: 'IDLE',
  WALKING: 'WALKING',
  RUNNING: 'RUNNING',
  JUMP_SQUAT: 'JUMP_SQUAT',
  RISING: 'RISING',
  FALLING: 'FALLING',
  LANDING: 'LANDING',
  ATTACKING: 'ATTACKING',
  TAIL_ACTION: 'TAIL_ACTION',
  BLOCKING: 'BLOCKING',
  BLOCK_STUNNED: 'BLOCK_STUNNED',
  HITSTUN: 'HITSTUN',
  KNOCKDOWN: 'KNOCKDOWN',
  WAKEUP: 'WAKEUP',
  DASHING: 'DASHING',
  DEAD: 'DEAD',
} as const;

export type FighterStateType = typeof FIGHTER_STATE[keyof typeof FIGHTER_STATE];

export type StateTransitionTable = {
  [K in FighterStateType]?: {
    [T in FighterStateType]?: boolean;
  };
};

export const STATE_TRANSITIONS: StateTransitionTable = {
  [FIGHTER_STATE.IDLE]: {
    [FIGHTER_STATE.WALKING]: true,
    [FIGHTER_STATE.RUNNING]: true,
    [FIGHTER_STATE.JUMP_SQUAT]: true,
    [FIGHTER_STATE.ATTACKING]: true,
    [FIGHTER_STATE.TAIL_ACTION]: true,
    [FIGHTER_STATE.BLOCKING]: true,
    [FIGHTER_STATE.DASHING]: true,
    [FIGHTER_STATE.HITSTUN]: true,
  },
  [FIGHTER_STATE.WALKING]: {
    [FIGHTER_STATE.IDLE]: true,
    [FIGHTER_STATE.RUNNING]: true,
    [FIGHTER_STATE.JUMP_SQUAT]: true,
    [FIGHTER_STATE.ATTACKING]: true,
    [FIGHTER_STATE.TAIL_ACTION]: true,
    [FIGHTER_STATE.BLOCKING]: true,
    [FIGHTER_STATE.DASHING]: true,
    [FIGHTER_STATE.HITSTUN]: true,
  },
  [FIGHTER_STATE.RUNNING]: {
    [FIGHTER_STATE.IDLE]: true,
    [FIGHTER_STATE.WALKING]: true,
    [FIGHTER_STATE.JUMP_SQUAT]: true,
    [FIGHTER_STATE.ATTACKING]: true,
    [FIGHTER_STATE.TAIL_ACTION]: true,
    [FIGHTER_STATE.BLOCKING]: true,
    [FIGHTER_STATE.DASHING]: true,
    [FIGHTER_STATE.HITSTUN]: true,
  },
  [FIGHTER_STATE.JUMP_SQUAT]: {
    [FIGHTER_STATE.RISING]: true,
    [FIGHTER_STATE.HITSTUN]: true,
  },
  [FIGHTER_STATE.RISING]: {
    [FIGHTER_STATE.FALLING]: true,
    [FIGHTER_STATE.ATTACKING]: true,
    [FIGHTER_STATE.DASHING]: true,
    [FIGHTER_STATE.HITSTUN]: true,
  },
  [FIGHTER_STATE.FALLING]: {
    [FIGHTER_STATE.LANDING]: true,
    [FIGHTER_STATE.ATTACKING]: true,
    [FIGHTER_STATE.DASHING]: true,
    [FIGHTER_STATE.HITSTUN]: true,
  },
  [FIGHTER_STATE.LANDING]: {
    [FIGHTER_STATE.IDLE]: true,
    [FIGHTER_STATE.HITSTUN]: true,
  },
  [FIGHTER_STATE.ATTACKING]: {
    [FIGHTER_STATE.IDLE]: true,
    [FIGHTER_STATE.ATTACKING]: true,
    [FIGHTER_STATE.HITSTUN]: true,
  },
  [FIGHTER_STATE.TAIL_ACTION]: {
    [FIGHTER_STATE.IDLE]: true,
    [FIGHTER_STATE.HITSTUN]: true,
  },
  [FIGHTER_STATE.BLOCKING]: {
    [FIGHTER_STATE.IDLE]: true,
    [FIGHTER_STATE.BLOCK_STUNNED]: true,
    [FIGHTER_STATE.HITSTUN]: true,
  },
  [FIGHTER_STATE.BLOCK_STUNNED]: {
    [FIGHTER_STATE.BLOCKING]: true,
    [FIGHTER_STATE.IDLE]: true,
    [FIGHTER_STATE.HITSTUN]: true,
  },
  [FIGHTER_STATE.HITSTUN]: {
    [FIGHTER_STATE.IDLE]: true,
    [FIGHTER_STATE.KNOCKDOWN]: true,
    [FIGHTER_STATE.HITSTUN]: true,
  },
  [FIGHTER_STATE.KNOCKDOWN]: {
    [FIGHTER_STATE.WAKEUP]: true,
    [FIGHTER_STATE.DEAD]: true,
  },
  [FIGHTER_STATE.WAKEUP]: {
    [FIGHTER_STATE.IDLE]: true,
    [FIGHTER_STATE.ATTACKING]: true,
  },
  [FIGHTER_STATE.DASHING]: {
    [FIGHTER_STATE.IDLE]: true,
    [FIGHTER_STATE.ATTACKING]: true,
    [FIGHTER_STATE.HITSTUN]: true,
  },
  [FIGHTER_STATE.DEAD]: {},
};

export const MOVE_DATA: Record<string, MoveData> = {
  light_1: {
    name: 'Light Attack 1',
    type: 'light',
    startup: 4,
    active: 3,
    recovery: 8,
    total: 15,
    damage: 8,
    hitstun: 12,
    blockstun: 6,
    hitstopOnHit: FRAME_CONSTANTS.HITSTOP_LIGHT,
    hitstopOnBlock: 3,
    knockback: { x: 3, y: 0 },
    onHitAdvantage: 4,
    onBlockAdvantage: -2,
    cancelWindow: { start: 4, end: 10 },
    cancelOnHit: true,
    cancelOnWhiff: false,
    cancelInto: ['light_2', 'heavy_1', 'special'],
    hitbox: { offsetX: 0, offsetY: 20, width: 60, height: 50 },
  },

  light_2: {
    name: 'Light Attack 2',
    type: 'light',
    startup: 5,
    active: 3,
    recovery: 9,
    total: 17,
    damage: 10,
    hitstun: 14,
    blockstun: 7,
    hitstopOnHit: FRAME_CONSTANTS.HITSTOP_LIGHT,
    hitstopOnBlock: 3,
    knockback: { x: 4, y: 0 },
    onHitAdvantage: 3,
    onBlockAdvantage: -3,
    cancelWindow: { start: 5, end: 11 },
    cancelOnHit: true,
    cancelOnWhiff: false,
    cancelInto: ['light_3', 'heavy_1', 'special'],
    hitbox: { offsetX: 0, offsetY: 15, width: 65, height: 55 },
  },

  light_3: {
    name: 'Light Attack 3',
    type: 'light',
    startup: 6,
    active: 4,
    recovery: 12,
    total: 22,
    damage: 14,
    hitstun: 18,
    blockstun: 8,
    hitstopOnHit: FRAME_CONSTANTS.HITSTOP_MEDIUM,
    hitstopOnBlock: 4,
    knockback: { x: 6, y: -2 },
    onHitAdvantage: 2,
    onBlockAdvantage: -6,
    cancelWindow: null,
    cancelOnHit: false,
    cancelOnWhiff: false,
    cancelInto: [],
    hitbox: { offsetX: 10, offsetY: 10, width: 70, height: 60 },
  },

  heavy_1: {
    name: 'Heavy Attack 1',
    type: 'heavy',
    startup: 10,
    active: 5,
    recovery: 18,
    total: 33,
    damage: 20,
    hitstun: 24,
    blockstun: 14,
    hitstopOnHit: FRAME_CONSTANTS.HITSTOP_HEAVY,
    hitstopOnBlock: 6,
    knockback: { x: 8, y: -3 },
    onHitAdvantage: 6,
    onBlockAdvantage: -8,
    cancelWindow: { start: 10, end: 18 },
    cancelOnHit: true,
    cancelOnWhiff: false,
    cancelInto: ['heavy_2', 'special'],
    hitbox: { offsetX: 0, offsetY: 0, width: 80, height: 80 },
  },

  heavy_2: {
    name: 'Heavy Attack 2',
    type: 'heavy',
    startup: 12,
    active: 6,
    recovery: 20,
    total: 38,
    damage: 28,
    hitstun: 28,
    blockstun: 16,
    hitstopOnHit: FRAME_CONSTANTS.HITSTOP_HEAVY,
    hitstopOnBlock: 8,
    knockback: { x: 12, y: -5 },
    onHitAdvantage: 4,
    onBlockAdvantage: -10,
    cancelWindow: null,
    cancelOnHit: false,
    cancelOnWhiff: false,
    cancelInto: [],
    hitbox: { offsetX: 10, offsetY: -10, width: 90, height: 90 },
    counterHitLaunch: true,
  },

  dash_attack: {
    name: 'Dash Attack',
    type: 'special',
    startup: 6,
    active: 8,
    recovery: 14,
    total: 28,
    damage: 12,
    hitstun: 16,
    blockstun: 8,
    hitstopOnHit: FRAME_CONSTANTS.HITSTOP_MEDIUM,
    hitstopOnBlock: 4,
    knockback: { x: 6, y: -4 },
    onHitAdvantage: 2,
    onBlockAdvantage: -8,
    cancelWindow: { start: 20, end: 28 },
    cancelOnHit: true,
    cancelOnWhiff: false,
    cancelInto: ['light_1', 'special'],
    hitbox: { offsetX: 20, offsetY: 20, width: 70, height: 60 },
    movementProfile: [
      { frame: 0, vx: 12 },
      { frame: 6, vx: 8 },
      { frame: 14, vx: 4 },
    ],
  },

  air_light: {
    name: 'Air Light Attack',
    type: 'air',
    startup: 5,
    active: 8,
    recovery: 12,
    total: 25,
    damage: 10,
    hitstun: 14,
    blockstun: 6,
    hitstopOnHit: FRAME_CONSTANTS.HITSTOP_LIGHT,
    hitstopOnBlock: 3,
    knockback: { x: 2, y: 3 },
    onHitAdvantage: 0,
    onBlockAdvantage: 0,
    cancelWindow: null,
    cancelOnHit: false,
    cancelOnWhiff: false,
    cancelInto: [],
    hitbox: { offsetX: 0, offsetY: 10, width: 60, height: 50 },
    airOnly: true,
  },

  air_heavy: {
    name: 'Air Heavy Attack',
    type: 'air',
    startup: 8,
    active: 10,
    recovery: 18,
    total: 36,
    damage: 18,
    hitstun: 20,
    blockstun: 10,
    hitstopOnHit: FRAME_CONSTANTS.HITSTOP_HEAVY,
    hitstopOnBlock: 6,
    knockback: { x: 4, y: 8 },
    onHitAdvantage: 0,
    onBlockAdvantage: 0,
    cancelWindow: null,
    cancelOnHit: false,
    cancelOnWhiff: false,
    cancelInto: [],
    hitbox: { offsetX: 0, offsetY: 20, width: 70, height: 70 },
    airOnly: true,
  },
};

export const TAIL_MOVE_DATA: Record<string, TailMoveData> = {
  ember_flare: {
    tailId: 'ember',
    name: 'Flare Lash',
    startup: 8,
    active: 6,
    recovery: 20,
    total: 34,
    damage: 22,
    hitstun: 18,
    blockstun: 10,
    hitstopOnHit: FRAME_CONSTANTS.HITSTOP_SPECIAL,
    hitstopOnBlock: 8,
    knockback: { x: 10, y: -3 },
    meterCost: 25,
    cooldown: 30,
    hitbox: { offsetX: 0, offsetY: 0, width: 100, height: 80 },
    effect: 'burn',
    effectDamage: 2,
    effectDuration: 180,
  },

  gale_ridge: {
    tailId: 'gale',
    name: 'Ridge Step',
    startup: 2,
    active: 12,
    recovery: 8,
    total: 22,
    damage: 0,
    meterCost: 15,
    cooldown: 45,
    movement: { x: 18, y: -8 },
    invincibleFrames: { start: 2, end: 14 },
  },

  shade_counter: {
    tailId: 'shade',
    name: 'Ghost Reversal',
    startup: 1,
    active: 15,
    recovery: 25,
    total: 41,
    damage: 0,
    reflectMultiplier: 1.5,
    meterCost: 20,
    cooldown: 60,
    isCounter: true,
  },

  volt_bind: {
    tailId: 'volt',
    name: 'Snap Bind',
    startup: 5,
    active: 4,
    recovery: 15,
    total: 24,
    damage: 12,
    hitstun: 24,
    blockstun: 12,
    knockback: { x: 0, y: 0 },
    meterCost: 30,
    cooldown: 90,
    hitbox: { offsetX: 0, offsetY: 20, width: 120, height: 40 },
    effect: 'stun',
  },

  stone_quake: {
    tailId: 'stone',
    name: 'Quake Hook',
    startup: 15,
    active: 8,
    recovery: 25,
    total: 48,
    damage: 18,
    hitstun: 20,
    blockstun: 0,
    knockback: { x: 5, y: -8 },
    meterCost: 35,
    cooldown: 120,
    hitbox: { offsetX: -20, offsetY: 40, width: 200, height: 40 },
    guardBreak: true,
  },

  tide_wave: {
    tailId: 'tide',
    name: 'Undertow Loop',
    startup: 10,
    active: 20,
    recovery: 15,
    total: 45,
    damage: 15,
    hitstun: 16,
    blockstun: 8,
    knockback: { x: -8, y: 0 },
    meterCost: 25,
    cooldown: 60,
    hitbox: { offsetX: 0, offsetY: 0, width: 150, height: 60 },
    effect: 'heal',
    effectAmount: 5,
  },

  thorn_trap: {
    tailId: 'thorn',
    name: 'Briar Net',
    startup: 20,
    active: 180,
    recovery: 20,
    total: 220,
    damage: 8,
    hitstun: 36,
    knockback: { x: 0, y: 0 },
    meterCost: 20,
    cooldown: 90,
    isTrap: true,
    trapHitbox: { width: 60, height: 20 },
    effect: 'root',
  },

  prism_mirror: {
    tailId: 'prism',
    name: 'Mirror Cut',
    startup: 3,
    active: 8,
    recovery: 30,
    total: 41,
    damage: 0,
    reflectMultiplier: 2.0,
    meterCost: 15,
    cooldown: 45,
    isParry: true,
    perfectWindow: 3,
  },

  void_denial: {
    tailId: 'void',
    name: "Architect's Denial",
    startup: 30,
    active: 1,
    recovery: 60,
    total: 91,
    damage: 0,
    meterCost: 50,
    cooldown: 300,
    effect: 'cancel',
    isUltimate: true,
  },
};

export const MOVEMENT_DATA = {
  walk_speed: 5,
  run_speed: 10,
  dash_speed: 16,
  dash_frames: 12,
  dash_invincible_start: 2,
  dash_invincible_end: 8,
  jump_squat: 3,
  jump_force: -18,
  double_jump_force: -14,
  air_dash_speed: 14,
  air_dash_frames: 10,
  gravity: 0.8,
  max_fall_speed: 15,
  ground_friction: 0.85,
  air_friction: 0.98,
} as const;

export function getTotalFrames(move: { startup: number; active: number; recovery: number }): number {
  return move.startup + move.active + move.recovery;
}

export function getMovePhase(
  move: { startup: number; active: number; recovery: number },
  currentFrame: number
): MovePhaseType {
  if (currentFrame < move.startup) {
    return MOVE_PHASE.STARTUP;
  } else if (currentFrame < move.startup + move.active) {
    return MOVE_PHASE.ACTIVE;
  } else if (currentFrame < getTotalFrames(move)) {
    return MOVE_PHASE.RECOVERY;
  }
  return MOVE_PHASE.IDLE;
}

export function canCancel(
  move: MoveData,
  currentFrame: number,
  hitConnected: boolean
): boolean {
  if (!move.cancelWindow) return false;
  if (move.cancelOnHit && !hitConnected) return false;
  const { start, end } = move.cancelWindow;
  return currentFrame >= start && currentFrame <= end;
}

export function calculateAdvantage(
  move: { hitstun: number; blockstun: number; recovery: number },
  blocked: boolean
): number {
  if (blocked) {
    return move.blockstun - move.recovery;
  }
  return move.hitstun - move.recovery;
}

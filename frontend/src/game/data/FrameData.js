/**
 * LEGENDS OF KAI-JAX: THE MEMORY KING
 * Frame Data System — The Heart of Combat
 * 
 * "Every frame is a promise to the player."
 * 
 * This is the authoritative source for ALL combat data.
 * No guessing. No magic numbers. Everything comes from here.
 */

import { Vector2 } from '../engine/GameEngine';

/**
 * FRAME DATA CONSTANTS
 * These are law. Do not hard-code numbers elsewhere.
 */
export const FRAME_CONSTANTS = {
  // Timing
  FPS: 60,
  FRAME_MS: 1000 / 60,  // 16.67ms per frame
  
  // Input
  INPUT_BUFFER_FRAMES: 6,
  
  // Hit-stop (freeze frames on hit)
  HITSTOP_LIGHT: 4,
  HITSTOP_MEDIUM: 6,
  HITSTOP_HEAVY: 10,
  HITSTOP_SPECIAL: 15,
  
  // Block
  BLOCK_STARTUP: 6,     // Frames to enter block
  PERFECT_BLOCK_WINDOW: 3, // Frames for perfect block
  
  // Recovery
  WAKEUP_FRAMES: 20,
  WAKEUP_INVINCIBLE: true,
};

/**
 * MOVE PHASES
 * Every attack goes through these phases IN ORDER.
 * No skipping. No exceptions.
 */
export const MOVE_PHASE = {
  IDLE: 'IDLE',           // Can act freely
  STARTUP: 'STARTUP',     // Committed, no hitbox
  ACTIVE: 'ACTIVE',       // Hitbox exists
  RECOVERY: 'RECOVERY',   // Move ending, vulnerable
};

/**
 * FIGHTER STATES
 * The state machine that drives everything.
 */
export const FIGHTER_STATE = {
  // Neutral
  IDLE: 'IDLE',
  WALKING: 'WALKING',
  RUNNING: 'RUNNING',
  
  // Aerial
  JUMP_SQUAT: 'JUMP_SQUAT',   // 3 frames before leaving ground
  RISING: 'RISING',
  FALLING: 'FALLING',
  LANDING: 'LANDING',
  
  // Combat - Offense
  ATTACKING: 'ATTACKING',
  TAIL_ACTION: 'TAIL_ACTION',
  
  // Combat - Defense  
  BLOCKING: 'BLOCKING',
  BLOCK_STUNNED: 'BLOCK_STUNNED',
  
  // Combat - Reactions
  HITSTUN: 'HITSTUN',
  KNOCKDOWN: 'KNOCKDOWN',
  WAKEUP: 'WAKEUP',
  
  // Special
  DASHING: 'DASHING',
  
  // Terminal
  DEAD: 'DEAD',
};

/**
 * STATE TRANSITION RULES
 * What states can transition to what.
 * TRUE = allowed, FALSE = blocked
 */
export const STATE_TRANSITIONS = {
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
    // Committed for 3 frames
    [FIGHTER_STATE.RISING]: true,
    [FIGHTER_STATE.HITSTUN]: true, // Can still be hit
  },
  [FIGHTER_STATE.RISING]: {
    [FIGHTER_STATE.FALLING]: true,
    [FIGHTER_STATE.ATTACKING]: true,
    [FIGHTER_STATE.DASHING]: true, // Air dash
    [FIGHTER_STATE.HITSTUN]: true,
  },
  [FIGHTER_STATE.FALLING]: {
    [FIGHTER_STATE.LANDING]: true,
    [FIGHTER_STATE.ATTACKING]: true,
    [FIGHTER_STATE.DASHING]: true,
    [FIGHTER_STATE.HITSTUN]: true,
  },
  [FIGHTER_STATE.LANDING]: {
    // Brief landing recovery
    [FIGHTER_STATE.IDLE]: true,
    [FIGHTER_STATE.HITSTUN]: true,
  },
  [FIGHTER_STATE.ATTACKING]: {
    // Can only exit on completion OR getting hit
    [FIGHTER_STATE.IDLE]: true,      // On completion
    [FIGHTER_STATE.ATTACKING]: true, // Cancel into another attack (if allowed)
    [FIGHTER_STATE.HITSTUN]: true,   // Getting hit
  },
  [FIGHTER_STATE.TAIL_ACTION]: {
    [FIGHTER_STATE.IDLE]: true,
    [FIGHTER_STATE.HITSTUN]: true,
  },
  [FIGHTER_STATE.BLOCKING]: {
    [FIGHTER_STATE.IDLE]: true,
    [FIGHTER_STATE.BLOCK_STUNNED]: true,
    [FIGHTER_STATE.HITSTUN]: true, // Guard break
  },
  [FIGHTER_STATE.BLOCK_STUNNED]: {
    [FIGHTER_STATE.BLOCKING]: true,
    [FIGHTER_STATE.IDLE]: true,
    [FIGHTER_STATE.HITSTUN]: true,
  },
  [FIGHTER_STATE.HITSTUN]: {
    [FIGHTER_STATE.IDLE]: true,
    [FIGHTER_STATE.KNOCKDOWN]: true,
    [FIGHTER_STATE.HITSTUN]: true, // Can be combo'd
  },
  [FIGHTER_STATE.KNOCKDOWN]: {
    [FIGHTER_STATE.WAKEUP]: true,
    [FIGHTER_STATE.DEAD]: true,
  },
  [FIGHTER_STATE.WAKEUP]: {
    [FIGHTER_STATE.IDLE]: true,
    [FIGHTER_STATE.ATTACKING]: true, // Wakeup attack
  },
  [FIGHTER_STATE.DASHING]: {
    // Committed during dash
    [FIGHTER_STATE.IDLE]: true,
    [FIGHTER_STATE.ATTACKING]: true, // Dash attack
    [FIGHTER_STATE.HITSTUN]: true,
  },
  [FIGHTER_STATE.DEAD]: {
    // Terminal state
  },
};

/**
 * MOVE DATA — The Single Source of Truth
 * All frame data lives here. Period.
 */
export const MOVE_DATA = {
  // ═══════════════════════════════════════════════════════════
  // LIGHT ATTACKS
  // ═══════════════════════════════════════════════════════════
  light_1: {
    name: 'Light Attack 1',
    type: 'light',
    
    // Frame Data (60fps)
    startup: 4,
    active: 3,
    recovery: 8,
    total: 15,  // startup + active + recovery
    
    // Damage & Stun
    damage: 8,
    hitstun: 12,
    blockstun: 6,
    hitstopOnHit: FRAME_CONSTANTS.HITSTOP_LIGHT,
    hitstopOnBlock: 3,
    
    // Knockback
    knockback: { x: 3, y: 0 },
    
    // Advantage
    // On Hit: Defender in hitstun 12f, Attacker in recovery 8f → +4 advantage
    // On Block: Defender in blockstun 6f, Attacker in recovery 8f → -2 advantage
    onHitAdvantage: 4,
    onBlockAdvantage: -2,
    
    // Cancel Rules
    cancelWindow: { start: 4, end: 10 }, // Frames during which cancel is allowed
    cancelOnHit: true,      // Only cancel if attack connected
    cancelOnWhiff: false,   // Cannot cancel if missed
    cancelInto: ['light_2', 'heavy_1', 'special'], // What moves can cancel into
    
    // Hitbox
    hitbox: {
      offsetX: 0,   // Relative to facing direction
      offsetY: 20,
      width: 60,
      height: 50,
    },
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
    cancelWindow: null, // Cannot cancel - end of chain
    cancelOnHit: false,
    cancelOnWhiff: false,
    cancelInto: [],
    hitbox: { offsetX: 10, offsetY: 10, width: 70, height: 60 },
  },
  
  // ═══════════════════════════════════════════════════════════
  // HEAVY ATTACKS
  // ═══════════════════════════════════════════════════════════
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
    cancelWindow: null, // End of chain
    cancelOnHit: false,
    cancelOnWhiff: false,
    cancelInto: [],
    hitbox: { offsetX: 10, offsetY: -10, width: 90, height: 90 },
    // Special property: launches on counter hit
    counterHitLaunch: true,
  },
  
  // ═══════════════════════════════════════════════════════════
  // DASH ATTACK
  // ═══════════════════════════════════════════════════════════
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
    cancelWindow: { start: 20, end: 28 }, // Late cancel
    cancelOnHit: true,
    cancelOnWhiff: false,
    cancelInto: ['light_1', 'special'],
    hitbox: { offsetX: 20, offsetY: 20, width: 70, height: 60 },
    // Movement during attack
    movementProfile: [
      { frame: 0, vx: 12 },
      { frame: 6, vx: 8 },
      { frame: 14, vx: 4 },
    ],
  },
  
  // ═══════════════════════════════════════════════════════════
  // AIR ATTACKS
  // ═══════════════════════════════════════════════════════════
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
    cancelWindow: null,
    cancelOnHit: false,
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
    knockback: { x: 4, y: 8 }, // Spike down
    cancelWindow: null,
    cancelOnHit: false,
    cancelInto: [],
    hitbox: { offsetX: 0, offsetY: 20, width: 70, height: 70 },
    airOnly: true,
  },
};

/**
 * TAIL ABILITY DATA
 * Special moves tied to the 9-tail system
 */
export const TAIL_MOVE_DATA = {
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
    cooldown: 30, // Frames
    hitbox: { offsetX: 0, offsetY: 0, width: 100, height: 80 },
    effect: 'burn', // DoT effect
    effectDamage: 2,
    effectDuration: 180, // 3 seconds
  },
  
  gale_ridge: {
    tailId: 'gale',
    name: 'Ridge Step',
    startup: 2,
    active: 12,
    recovery: 8,
    total: 22,
    damage: 0, // Movement ability
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
    damage: 0, // Damage comes from reflect
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
    hitstun: 24, // Long stun
    blockstun: 12,
    knockback: { x: 0, y: 0 }, // No knockback, holds in place
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
    blockstun: 0, // Guard break
    knockback: { x: 5, y: -8 },
    meterCost: 35,
    cooldown: 120,
    hitbox: { offsetX: -20, offsetY: 40, width: 200, height: 40 }, // Ground wave
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
    knockback: { x: -8, y: 0 }, // Pulls toward user
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
    active: 180, // Trap duration (3 sec)
    recovery: 20,
    total: 220,
    damage: 8,
    hitstun: 36, // Root
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
    damage: 0, // Reflect damage
    reflectMultiplier: 2.0,
    meterCost: 15,
    cooldown: 45,
    isParry: true,
    perfectWindow: 3, // Frames of perfect parry
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
    cooldown: 300, // 5 seconds
    effect: 'cancel', // Cancels enemy action
    isUltimate: true,
  },
};

/**
 * MOVEMENT DATA
 */
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
};

/**
 * Helper: Get total frames for a move
 */
export function getTotalFrames(move) {
  return move.startup + move.active + move.recovery;
}

/**
 * Helper: Get current phase of a move
 */
export function getMovePhase(move, currentFrame) {
  if (currentFrame < move.startup) {
    return MOVE_PHASE.STARTUP;
  } else if (currentFrame < move.startup + move.active) {
    return MOVE_PHASE.ACTIVE;
  } else if (currentFrame < getTotalFrames(move)) {
    return MOVE_PHASE.RECOVERY;
  }
  return MOVE_PHASE.IDLE;
}

/**
 * Helper: Check if in cancel window
 */
export function canCancel(move, currentFrame, hitConnected) {
  if (!move.cancelWindow) return false;
  if (move.cancelOnHit && !hitConnected) return false;
  
  const { start, end } = move.cancelWindow;
  return currentFrame >= start && currentFrame <= end;
}

/**
 * Helper: Calculate frame advantage
 */
export function calculateAdvantage(move, blocked) {
  if (blocked) {
    return move.blockstun - move.recovery;
  }
  return move.hitstun - move.recovery;
}

export default {
  FRAME_CONSTANTS,
  MOVE_PHASE,
  FIGHTER_STATE,
  STATE_TRANSITIONS,
  MOVE_DATA,
  TAIL_MOVE_DATA,
  MOVEMENT_DATA,
  getTotalFrames,
  getMovePhase,
  canCancel,
  calculateAdvantage,
};

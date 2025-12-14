import { Vector2D, RigidBody } from './physics.types';
import { Hitbox, AttackData } from './combat.types';

export enum FighterState {
  // Movement
  IDLE = 'idle',
  WALK = 'walk',
  RUN = 'run',
  DASH = 'dash',
  CROUCH = 'crouch',
  CRAWL = 'crawl',

  // Airborne
  JUMP_SQUAT = 'jump_squat',
  JUMPING = 'jumping',
  FALLING = 'falling',
  FAST_FALL = 'fast_fall',
  LANDING = 'landing',
  AIR_DODGE = 'air_dodge',

  // Attacks
  JAB = 'jab',
  JAB_2 = 'jab_2',
  JAB_3 = 'jab_3',
  TILT_FORWARD = 'tilt_forward',
  TILT_UP = 'tilt_up',
  TILT_DOWN = 'tilt_down',
  SMASH_FORWARD = 'smash_forward',
  SMASH_UP = 'smash_up',
  SMASH_DOWN = 'smash_down',
  
  // Aerial attacks
  NAIR = 'nair', // Neutral air
  FAIR = 'fair', // Forward air
  BAIR = 'bair', // Back air
  UAIR = 'uair', // Up air
  DAIR = 'dair', // Down air

  // Special moves
  NEUTRAL_SPECIAL = 'neutral_special',
  SIDE_SPECIAL = 'side_special',
  UP_SPECIAL = 'up_special', // Recovery
  DOWN_SPECIAL = 'down_special', // Counter

  // Defensive
  BLOCK = 'block',
  PARRY = 'parry',
  DODGE = 'dodge',
  ROLL_FORWARD = 'roll_forward',
  ROLL_BACKWARD = 'roll_backward',
  SPOT_DODGE = 'spot_dodge',

  // Damage states
  HITSTUN = 'hitstun',
  KNOCKBACK = 'knockback',
  TUMBLE = 'tumble',
  KNOCKDOWN = 'knockdown',
  TECH = 'tech', // Tech roll on landing

  // Ledge
  LEDGE_GRAB = 'ledge_grab',
  LEDGE_HANG = 'ledge_hang',
  LEDGE_CLIMB = 'ledge_climb',
  LEDGE_ATTACK = 'ledge_attack',
  LEDGE_JUMP = 'ledge_jump',

  // Grab
  GRAB = 'grab',
  GRAB_HOLD = 'grab_hold',
  PUMMEL = 'pummel',
  THROW_FORWARD = 'throw_forward',
  THROW_BACK = 'throw_back',
  THROW_UP = 'throw_up',
  THROW_DOWN = 'throw_down',

  // Special states
  ULTIMATE = 'ultimate',
  TAUNT = 'taunt',
  VICTORY = 'victory',
  DEFEAT = 'defeat',
  RESPAWN = 'respawn',
}

export interface FighterStats {
  // Base stats
  weight: number; // Affects knockback (50-150)
  walkSpeed: number;
  runSpeed: number;
  airSpeed: number;
  jumpHeight: number;
  airJumps: number;
  fallSpeed: number;
  fastFallSpeed: number;
  
  // Combat stats
  maxDamage: number; // Smash-style percentage (usually 999)
  currentDamage: number;
  lives: number;
  ultimateMeter: number; // 0-100
  ultimateCost: number;
}

export interface MoveSet {
  attacks: Map<string, AttackData>;
  specialMoves: Map<string, AttackData>;
  aerialMoves: Map<string, AttackData>;
  grabs: Map<string, AttackData>;
}

export interface Fighter {
  id: string;
  name: string;
  state: FighterState;
  stats: FighterStats;
  physics: RigidBody;
  position: Vector2D;
  facing: 'left' | 'right';
  moveSet: MoveSet;
  hitboxes: Hitbox[];
  currentFrame: number;
  invincible: boolean;
  intangible: boolean;
}

export interface FighterConfig {
  name: string;
  displayName: string;
  description: string;
  stats: Omit<FighterStats, 'currentDamage' | 'lives' | 'ultimateMeter'>;
  moveSet: MoveSet;
}

/**
 * Simplified fighter data for UI display
 */
export interface FighterDisplayState {
  /** Character's display name */
  name: string;
  /** Current health points (0 to maxHealth) */
  health: number;
  /** Maximum health points */
  maxHealth: number;
  /** Smash-style damage percentage (0% to 999%) */
  damage: number;
  /** Number of remaining stocks/lives (optional, for stock matches) */
  stocks?: number;
  /** Ultimate meter percentage (0-100, optional) */
  ultimateMeter?: number;
}

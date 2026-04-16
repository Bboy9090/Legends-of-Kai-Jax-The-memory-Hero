/**
 * MoveSpec Type Definitions
 * Authoritative frame data specification for combat moves
 */

export interface HitSpec {
  /** Frame when hitbox becomes active */
  startF: number;
  /** Frame when hitbox deactivates */
  endF: number;
  /** Hitbox X offset from fighter center */
  offX: number;
  /** Hitbox Y offset from fighter center */
  offY: number;
  /** Hitbox half-width */
  halfW: number;
  /** Hitbox half-height */
  halfH: number;
  /** Knockback X velocity */
  kbX: number;
  /** Knockback Y velocity */
  kbY: number;
  /** Base damage */
  dmg: number;
  /** Hit can only connect once per move execution */
  usedOnce: boolean;
  /** This hitbox is a grab command throw */
  isGrab: boolean;
}

export interface MoveSpec {
  /** Unique move identifier */
  id: string;
  /** Frames before hitbox activation */
  startup: number;
  /** Frames hitbox remains active */
  active: number;
  /** Frames after hitbox deactivation before actionable */
  recovery: number;
  /** Shield damage on block */
  shield_damage: number;
  /** Resistance to directional influence */
  di_resist: number;
  /** Hitstop frames on successful hit */
  hitstopOnHit: number;
  /** Hitstop frames on block */
  hitstopOnBlock: number;
  /** Hitbox specification array */
  hits: HitSpec[];
}

export interface ActiveHitbox {
  spec: HitSpec;
  worldX: number;
  worldY: number;
  active: boolean;
  hasConnected: boolean;
}

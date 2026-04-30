/**
 * MoveSpec Type Definitions
 * Authoritative frame data specification for combat moves
 */

export interface HitSpec {
  /** Frame when hitbox becomes active */
  startF: number;
  /** Frame when hitbox deactivates */
  endF: number;
  /** Hitbox X offset from attachment anchor (mirrored by facing) */
  offX: number;
  /** Hitbox Y offset from attachment anchor */
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
  /**
   * Optional socket name for bone-socket attachment.
   * Accepted values: 'root' | 'spine' | 'head' | 'tail_01' .. 'tail_09'.
   * When present AND the active rig exposes that anchor, the hitbox is
   * positioned relative to the socket's world transform.
   * When absent OR the rig lacks the named anchor, the hitbox falls back
   * to fighter root + facing direction (legacy behavior).
   */
  socket?: string;
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

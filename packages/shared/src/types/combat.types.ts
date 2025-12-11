import { Vector2D, AABB } from './physics.types';

export enum DamageType {
  PHYSICAL = 'physical',
  ENERGY = 'energy',
  SPECIAL = 'special',
}

export enum HitboxType {
  HITBOX = 'hitbox', // Deals damage
  HURTBOX = 'hurtbox', // Receives damage
  GRABBOX = 'grabbox', // For grabs
  PROJECTILE = 'projectile',
}

export interface Hitbox {
  id: string;
  type: HitboxType;
  bounds: AABB;
  active: boolean;
  damage: number;
  baseKnockback: number;
  knockbackGrowth: number;
  knockbackAngle: number; // Degrees
  hitstun: number; // Frames
  hitlag: number; // Frames
  priority: number;
  damageType: DamageType;
}

export interface HitResult {
  attacker: string;
  defender: string;
  damage: number;
  knockback: Vector2D;
  hitstun: number;
  hitlag: number;
  hitPosition: Vector2D;
  damageType: DamageType;
  wasCounter: boolean;
  wasParry: boolean;
}

export interface ComboState {
  hits: number;
  damage: number;
  startTime: number;
  lastHitTime: number;
  multiplier: number;
  isActive: boolean;
}

export interface AttackData {
  name: string;
  damage: number;
  baseKnockback: number;
  knockbackGrowth: number;
  knockbackAngle: number;
  hitlag: number;
  hitstun: number;
  startupFrames: number;
  activeFrames: number;
  recoveryFrames: number;
  canCancel: boolean;
  nextMoves: string[]; // Combo chains
}

export interface CounterWindow {
  active: boolean;
  startFrame: number;
  endFrame: number;
  successMultiplier: number;
}

export enum KnockbackState {
  NONE = 'none',
  LIGHT = 'light',
  MEDIUM = 'medium',
  HEAVY = 'heavy',
  TUMBLE = 'tumble',
  LAUNCH = 'launch',
}

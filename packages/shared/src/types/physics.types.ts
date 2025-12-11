export interface Vector2D {
  x: number;
  y: number;
}

export interface Vector3D extends Vector2D {
  z: number;
}

export interface Velocity extends Vector2D {
  readonly maxSpeed: number;
}

export interface AABB {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Circle {
  x: number;
  y: number;
  radius: number;
}

export interface RigidBody {
  position: Vector2D;
  velocity: Vector2D;
  acceleration: Vector2D;
  mass: number;
  friction: number;
  restitution: number; // Bounciness (0-1)
  isGrounded: boolean;
  isAirborne: boolean;
}

export interface PhysicsConfig {
  gravity: number;
  airResistance: number;
  groundFriction: number;
  maxFallSpeed: number;
  fastFallMultiplier: number;
  coyoteTime: number; // Frames
  jumpBufferTime: number; // Frames
}

export interface CollisionResult {
  collided: boolean;
  normal: Vector2D;
  penetration: number;
  contactPoint: Vector2D;
}

export enum SurfaceType {
  NORMAL = 'normal',
  ICE = 'ice',
  STICKY = 'sticky',
  BOUNCY = 'bouncy',
}

export interface Platform {
  bounds: AABB;
  surfaceType: SurfaceType;
  isPassThrough: boolean;
}

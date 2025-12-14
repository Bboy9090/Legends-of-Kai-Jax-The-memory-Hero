import { Vector2D, RigidBody, PhysicsConfig, Platform } from '@smash-heroes/shared';
import { Vec2, PHYSICS_CONSTANTS } from '@smash-heroes/shared';

export class MomentumPhysics {
  private config: PhysicsConfig;
  private coyoteTimeCounter = 0;
  private jumpBufferCounter = 0;
  private lastGroundedPosition: Vector2D = { x: 0, y: 0 };

  constructor(config?: Partial<PhysicsConfig>) {
    this.config = {
      gravity: PHYSICS_CONSTANTS.GRAVITY,
      airResistance: PHYSICS_CONSTANTS.AIR_RESISTANCE,
      groundFriction: PHYSICS_CONSTANTS.GROUND_FRICTION,
      maxFallSpeed: PHYSICS_CONSTANTS.MAX_FALL_SPEED,
      fastFallMultiplier: PHYSICS_CONSTANTS.FAST_FALL_MULTIPLIER,
      coyoteTime: PHYSICS_CONSTANTS.COYOTE_TIME_FRAMES,
      jumpBufferTime: PHYSICS_CONSTANTS.JUMP_BUFFER_FRAMES,
      ...config,
    };
  }

  update(body: RigidBody, inputs: PhysicsInputs, platforms: Platform[]): void {
    // Track grounded state
    const wasGrounded = body.isGrounded;
    
    // Apply gravity
    if (!body.isGrounded) {
      body.velocity.y += this.config.gravity;
      
      // Apply fast fall
      if (inputs.fastFall && body.velocity.y > 0) {
        body.velocity.y *= this.config.fastFallMultiplier;
      }
      
      // Cap fall speed
      body.velocity.y = Math.min(body.velocity.y, this.config.maxFallSpeed);
      
      // Apply air resistance
      body.velocity.x *= this.config.airResistance;
    } else {
      // Apply ground friction
      body.velocity.x *= body.friction || this.config.groundFriction;
      this.lastGroundedPosition = { ...body.position };
    }

    // Coyote time - grace period after leaving platform
    if (wasGrounded && !body.isGrounded) {
      this.coyoteTimeCounter = this.config.coyoteTime;
    } else if (this.coyoteTimeCounter > 0) {
      this.coyoteTimeCounter--;
    }

    // Jump buffer - remember jump input
    if (inputs.jump) {
      this.jumpBufferCounter = this.config.jumpBufferTime;
    } else if (this.jumpBufferCounter > 0) {
      this.jumpBufferCounter--;
    }

    // Apply horizontal movement
    if (inputs.moveX !== 0) {
      if (body.isGrounded) {
        // Ground movement - direct control
        body.velocity.x = inputs.moveX * inputs.moveSpeed;
      } else {
        // Air movement - acceleration based
        const targetVelocity = inputs.moveX * inputs.moveSpeed * PHYSICS_CONSTANTS.AIR_ACCELERATION;
        body.velocity.x += targetVelocity;
      }
    }

    // Update acceleration
    body.acceleration = Vec2.create(0, this.config.gravity);

    // Update position based on velocity
    body.position.x += body.velocity.x;
    body.position.y += body.velocity.y;

    body.isAirborne = !body.isGrounded;
  }

  canJump(body: RigidBody): boolean {
    return body.isGrounded || this.coyoteTimeCounter > 0;
  }

  hasJumpBuffered(): boolean {
    return this.jumpBufferCounter > 0;
  }

  consumeJumpBuffer(): void {
    this.jumpBufferCounter = 0;
  }

  applyJump(body: RigidBody, jumpForce: number, shortHop = false): void {
    const force = shortHop ? jumpForce * PHYSICS_CONSTANTS.SHORT_HOP_MULTIPLIER : jumpForce;
    body.velocity.y = -force;
    body.isGrounded = false;
    this.coyoteTimeCounter = 0;
    this.jumpBufferCounter = 0;
  }

  applyImpulse(body: RigidBody, impulse: Vector2D): void {
    body.velocity = Vec2.add(body.velocity, impulse);
  }

  applyForce(body: RigidBody, force: Vector2D): void {
    // F = ma, so a = F/m
    const acceleration = Vec2.divide(force, body.mass);
    body.acceleration = Vec2.add(body.acceleration, acceleration);
  }

  applyKnockback(body: RigidBody, knockback: Vector2D, preserveMomentum = false): void {
    if (preserveMomentum) {
      // Preserve some of the existing momentum
      body.velocity.x = body.velocity.x * PHYSICS_CONSTANTS.MOMENTUM_PRESERVATION + knockback.x;
      body.velocity.y = knockback.y;
    } else {
      body.velocity = { ...knockback };
    }
    body.isGrounded = false;
  }

  getLastGroundedPosition(): Vector2D {
    return { ...this.lastGroundedPosition };
  }

  reset(): void {
    this.coyoteTimeCounter = 0;
    this.jumpBufferCounter = 0;
  }
}

export interface PhysicsInputs {
  moveX: number; // -1 to 1
  moveY: number; // -1 to 1
  moveSpeed: number;
  jump: boolean;
  fastFall: boolean;
}

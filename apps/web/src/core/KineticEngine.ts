/**
 * THE AETERNA COVENANT - KINETIC ENGINE
 * 
 * Architect-Tier Physics. The Bronx Standard: g=18.0
 * Heavy gravity, tight controls, no floaty nonsense.
 * 
 * Features:
 * - 4-frame Coyote Time for jumps
 * - Terminal velocity cap
 * - Ground friction
 * - Collision detection
 */

import { bus } from './EventBus';
import { Events } from './EventBus';

export interface PhysicsEntity {
  x: number;
  y: number;
  velX: number;
  velY: number;
  width: number;
  height: number;
  onGround: boolean;
  coyoteTime: number;
  canJump: boolean;
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class KineticEngine {
  // THE BRONX STANDARD - No compromises
  private readonly gravity: number = 18.0;
  private readonly friction: number = 0.85;
  private readonly terminalVelocity: number = 25.0;
  private readonly coyoteTimeFrames: number = 4; // 4 frames of grace
  private readonly frameTime: number = 1 / 60; // 60 FPS assumption

  /**
   * Apply physics to an entity
   */
  applyPhysics(entity: PhysicsEntity, deltaTime: number): void {
    // Apply gravity if not grounded
    if (!entity.onGround) {
      entity.velY += this.gravity * deltaTime;
      
      // Cap terminal velocity
      if (entity.velY > this.terminalVelocity) {
        entity.velY = this.terminalVelocity;
      }
    } else {
      // Reset coyote time when grounded
      entity.coyoteTime = this.coyoteTimeFrames;
      entity.canJump = true;
    }

    // Apply friction to horizontal movement
    entity.velX *= this.friction;

    // Update position
    entity.x += entity.velX * deltaTime * 60; // Normalize to frame rate
    entity.y += entity.velY * deltaTime * 60;

    // Update coyote time (countdown when not grounded)
    if (!entity.onGround && entity.coyoteTime > 0) {
      entity.coyoteTime -= deltaTime * 60; // Convert to frames
      if (entity.coyoteTime <= 0) {
        entity.canJump = false;
      }
    }

    // Emit grounded state changes
    const wasGrounded = entity.onGround;
    if (wasGrounded !== entity.onGround && entity.onGround) {
      bus.emit(Events.PLAYER_GROUNDED, { entity });
    }
  }

  /**
   * Check collision between entity and platform
   */
  checkCollision(entity: PhysicsEntity, platform: Platform): boolean {
    const entityRight = entity.x + entity.width;
    const entityBottom = entity.y + entity.height;
    const platformRight = platform.x + platform.width;
    const platformTop = platform.y;

    // AABB collision detection
    if (
      entity.x < platformRight &&
      entityRight > platform.x &&
      entity.y < platformTop &&
      entityBottom > platform.y
    ) {
      // Top collision (landing on platform)
      if (entity.velY >= 0 && entity.y < platformTop) {
        entity.y = platformTop - entity.height;
        entity.velY = 0;
        entity.onGround = true;
        bus.emit(Events.COLLISION_DETECTED, { entity, platform, type: 'top' });
        return true;
      }
    }

    entity.onGround = false;
    return false;
  }

  /**
   * Check collision with multiple platforms
   */
  checkCollisions(entity: PhysicsEntity, platforms: Platform[]): boolean {
    let collided = false;
    for (const platform of platforms) {
      if (this.checkCollision(entity, platform)) {
        collided = true;
      }
    }
    return collided;
  }

  /**
   * Apply jump force (with coyote time support)
   */
  jump(entity: PhysicsEntity, jumpForce: number = -15.0): boolean {
    if (entity.onGround || (entity.coyoteTime > 0 && entity.canJump)) {
      entity.velY = jumpForce;
      entity.onGround = false;
      entity.coyoteTime = 0; // Consume coyote time
      entity.canJump = false;
      bus.emit(Events.PLAYER_JUMP, { entity, jumpForce });
      return true;
    }
    return false;
  }

  /**
   * Apply horizontal movement
   */
  move(entity: PhysicsEntity, direction: number, speed: number, deltaTime: number): void {
    entity.velX = direction * speed;
  }

  /**
   * Get gravity constant (read-only)
   */
  getGravity(): number {
    return this.gravity;
  }

  /**
   * Reset entity physics state
   */
  resetEntity(entity: PhysicsEntity): void {
    entity.velX = 0;
    entity.velY = 0;
    entity.onGround = false;
    entity.coyoteTime = 0;
    entity.canJump = false;
  }
}

// Singleton instance
export const kineticEngine = new KineticEngine();

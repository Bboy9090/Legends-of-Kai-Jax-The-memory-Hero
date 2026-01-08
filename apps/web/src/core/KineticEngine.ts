/**
 * THE AETERNA COVENANT - KINETIC ENGINE
 * Architect-Tier Physics
 * g=18.0 - The Bronx Standard. No floaty nonsense.
 */

import { bus } from './EventBus';

export interface PhysicsEntity {
    x: number;
    y: number;
    velX: number;
    velY: number;
    w?: number;
    h?: number;
    onGround: boolean;
    coyoteTime?: number;
    maxCoyoteFrames?: number;
}

export interface Platform {
    x: number;
    y: number;
    w: number;
    h: number;
}

export class KineticEngine {
    private gravity: number = 18.0; // BRONX STANDARD - Heavy, deliberate movement
    private friction: number = 0.85;
    private maxFallSpeed: number = 25.0;
    private coyoteTimeFrames: number = 4; // 4-frame window for late jumps

    /**
     * Apply physics to an entity
     */
    applyPhysics(entity: PhysicsEntity, dt: number) {
        // Gravity application
        if (!entity.onGround) {
            entity.velY += this.gravity * dt;
        } else {
            // Reset coyote time when on ground
            if (entity.coyoteTime !== undefined) {
                entity.coyoteTime = this.coyoteTimeFrames;
            }
        }

        // Friction on horizontal movement
        entity.velX *= this.friction;

        // Terminal velocity cap
        if (entity.velY > this.maxFallSpeed) {
            entity.velY = this.maxFallSpeed;
        }

        // Update position
        entity.x += entity.velX * dt * 60; // Normalize to 60fps
        entity.y += entity.velY * dt * 60;

        // Coyote time countdown
        if (entity.coyoteTime !== undefined && entity.coyoteTime > 0 && !entity.onGround) {
            entity.coyoteTime -= 1;
        }

        // Emit physics update event
        bus.emit('PHYSICS_UPDATE', { entity, dt });
    }

    /**
     * Check collision between entity and platform
     */
    checkCollision(ent: PhysicsEntity, plat: Platform): boolean {
        if (!ent.w || !ent.h) return false;

        // AABB collision detection
        if (
            ent.x < plat.x + plat.w &&
            ent.x + ent.w > plat.x &&
            ent.y < plat.y + plat.h &&
            ent.y + ent.h > plat.y
        ) {
            // Determine collision side
            const overlapX = Math.min(
                (ent.x + ent.w) - plat.x,
                (plat.x + plat.w) - ent.x
            );
            const overlapY = Math.min(
                (ent.y + ent.h) - plat.y,
                (plat.y + plat.h) - ent.y
            );

            if (overlapY < overlapX) {
                // Top collision (landing on platform)
                if (ent.velY > 0 && ent.y < plat.y) {
                    ent.y = plat.y - ent.h;
                    ent.velY = 0;
                    ent.onGround = true;
                    bus.emit('ENTITY_LANDED', { entity: ent, platform: plat });
                    return true;
                }
                // Bottom collision (hitting ceiling)
                else if (ent.velY < 0 && ent.y > plat.y) {
                    ent.y = plat.y + plat.h;
                    ent.velY = 0;
                    bus.emit('ENTITY_HIT_CEILING', { entity: ent, platform: plat });
                    return true;
                }
            } else {
                // Side collision
                if (ent.x < plat.x) {
                    ent.x = plat.x - ent.w;
                } else {
                    ent.x = plat.x + plat.w;
                }
                ent.velX = 0;
                bus.emit('ENTITY_HIT_WALL', { entity: ent, platform: plat });
                return true;
            }
        }

        // No collision
        if (ent.onGround && ent.y + ent.h < plat.y) {
            ent.onGround = false;
        }

        return false;
    }

    /**
     * Check if entity can jump (on ground or within coyote time)
     */
    canJump(entity: PhysicsEntity): boolean {
        if (entity.onGround) return true;
        if (entity.coyoteTime !== undefined && entity.coyoteTime > 0) {
            return true;
        }
        return false;
    }

    /**
     * Apply jump force
     */
    jump(entity: PhysicsEntity, jumpForce: number = -15.0) {
        if (this.canJump(entity)) {
            entity.velY = jumpForce;
            entity.onGround = false;
            if (entity.coyoteTime !== undefined) {
                entity.coyoteTime = 0; // Consume coyote time
            }
            bus.emit('ENTITY_JUMPED', { entity, jumpForce });
        }
    }

    /**
     * Get gravity constant
     */
    getGravity(): number {
        return this.gravity;
    }

    /**
     * Set gravity (for special zones)
     */
    setGravity(value: number) {
        this.gravity = value;
        bus.emit('GRAVITY_CHANGED', { gravity: this.gravity });
    }
}

// Singleton instance
export const kineticEngine = new KineticEngine();

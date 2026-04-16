/**
 * Collision Resolver
 * Handles hitbox vs hurtbox collision detection and resolution
 */

import type { ActiveHitbox } from '../types/MoveSpec';
import { Hurtbox } from './Hurtbox';

export interface CollisionResult {
  didHit: boolean;
  damage: number;
  knockbackX: number;
  knockbackY: number;
  hitstop: number;
  hitPosition: { x: number; y: number };
}

export class CollisionResolver {
  /**
   * Check hitbox against hurtbox and return collision result
   */
  public static checkHitboxVsHurtbox(
    hitbox: ActiveHitbox,
    hurtbox: Hurtbox,
    hitstopOnHit: number
  ): CollisionResult | null {
    if (!hitbox.active || hitbox.hasConnected) {
      return null;
    }

    const hit = hurtbox.overlapsAABB(
      hitbox.worldX,
      hitbox.worldY,
      hitbox.spec.halfW,
      hitbox.spec.halfH
    );

    if (!hit) {
      return null;
    }

    // Collision confirmed
    return {
      didHit: true,
      damage: hitbox.spec.dmg,
      knockbackX: hitbox.spec.kbX,
      knockbackY: hitbox.spec.kbY,
      hitstop: hitstopOnHit,
      hitPosition: {
        x: hitbox.worldX,
        y: hitbox.worldY,
      },
    };
  }

  /**
   * Check all active hitboxes against hurtbox
   */
  public static checkAllHitboxes(
    hitboxes: ActiveHitbox[],
    hurtbox: Hurtbox,
    hitstopOnHit: number
  ): CollisionResult | null {
    for (const hitbox of hitboxes) {
      const result = this.checkHitboxVsHurtbox(hitbox, hurtbox, hitstopOnHit);
      if (result) {
        return result;
      }
    }
    return null;
  }

  /**
   * Debug: Visualize hitbox bounds
   */
  public static getHitboxDebugBounds(hitbox: ActiveHitbox): {
    left: number;
    right: number;
    bottom: number;
    top: number;
  } {
    return {
      left: hitbox.worldX - hitbox.spec.halfW,
      right: hitbox.worldX + hitbox.spec.halfW,
      bottom: hitbox.worldY - hitbox.spec.halfH,
      top: hitbox.worldY + hitbox.spec.halfH,
    };
  }

  /**
   * Debug: Check if point is inside hitbox
   */
  public static pointInHitbox(hitbox: ActiveHitbox, x: number, y: number): boolean {
    const bounds = this.getHitboxDebugBounds(hitbox);
    return x >= bounds.left && x <= bounds.right && y >= bounds.bottom && y <= bounds.top;
  }
}

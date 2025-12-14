import { AABB, Vector2D, RigidBody, CollisionResult, Platform, SurfaceType } from '@smash-heroes/shared';
import { Vec2, PHYSICS_CONSTANTS } from '@smash-heroes/shared';

export class CollisionResolver {
  resolveAABBCollision(bodyBounds: AABB, body: RigidBody, platform: AABB): CollisionResult {
    const result: CollisionResult = {
      collided: false,
      normal: { x: 0, y: 0 },
      penetration: 0,
      contactPoint: { x: 0, y: 0 },
    };

    // Check if collision exists
    if (!this.checkAABBCollision(bodyBounds, platform)) {
      return result;
    }

    // Calculate overlap on each axis
    const overlapX = Math.min(
      bodyBounds.x + bodyBounds.width - platform.x,
      platform.x + platform.width - bodyBounds.x
    );
    const overlapY = Math.min(
      bodyBounds.y + bodyBounds.height - platform.y,
      platform.y + platform.height - bodyBounds.y
    );

    // Resolve on axis with smallest overlap
    if (overlapX < overlapY) {
      // Resolve horizontally
      if (bodyBounds.x < platform.x) {
        // Collision on left side
        result.normal = { x: -1, y: 0 };
        result.penetration = overlapX;
        body.position.x -= overlapX;
      } else {
        // Collision on right side
        result.normal = { x: 1, y: 0 };
        result.penetration = overlapX;
        body.position.x += overlapX;
      }
      body.velocity.x = 0;
    } else {
      // Resolve vertically
      if (bodyBounds.y < platform.y) {
        // Collision on top (body hits platform from above)
        result.normal = { x: 0, y: -1 };
        result.penetration = overlapY;
        body.position.y -= overlapY;
        body.velocity.y = Math.max(0, body.velocity.y);
        body.isGrounded = true;
      } else {
        // Collision on bottom (body hits platform from below)
        result.normal = { x: 0, y: 1 };
        result.penetration = overlapY;
        body.position.y += overlapY;
        body.velocity.y = Math.max(0, body.velocity.y);
      }
    }

    result.collided = true;
    result.contactPoint = {
      x: bodyBounds.x + bodyBounds.width / 2,
      y: bodyBounds.y + bodyBounds.height / 2,
    };

    return result;
  }

  resolvePlatformCollision(
    bodyBounds: AABB,
    body: RigidBody,
    platform: Platform
  ): CollisionResult {
    // Pass-through platform logic
    if (platform.isPassThrough && body.velocity.y < 0) {
      // Allow going up through platform
      return {
        collided: false,
        normal: { x: 0, y: 0 },
        penetration: 0,
        contactPoint: { x: 0, y: 0 },
      };
    }

    const result = this.resolveAABBCollision(bodyBounds, body, platform.bounds);

    if (result.collided && result.normal.y < 0) {
      // Apply surface friction
      switch (platform.surfaceType) {
        case SurfaceType.ICE:
          body.friction = PHYSICS_CONSTANTS.ICE_FRICTION;
          break;
        case SurfaceType.STICKY:
          body.friction = PHYSICS_CONSTANTS.STICKY_FRICTION;
          break;
        case SurfaceType.BOUNCY:
          body.friction = PHYSICS_CONSTANTS.GROUND_FRICTION;
          body.velocity.y = -body.velocity.y * body.restitution;
          break;
        default:
          body.friction = PHYSICS_CONSTANTS.GROUND_FRICTION;
      }
    }

    return result;
  }

  checkAABBCollision(a: AABB, b: AABB): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  checkPointInAABB(point: Vector2D, bounds: AABB): boolean {
    return (
      point.x >= bounds.x &&
      point.x <= bounds.x + bounds.width &&
      point.y >= bounds.y &&
      point.y <= bounds.y + bounds.height
    );
  }

  getClosestPointOnAABB(point: Vector2D, bounds: AABB): Vector2D {
    return {
      x: Math.max(bounds.x, Math.min(point.x, bounds.x + bounds.width)),
      y: Math.max(bounds.y, Math.min(point.y, bounds.y + bounds.height)),
    };
  }

  sweepAABB(bounds: AABB, velocity: Vector2D, platform: AABB): number {
    // Swept AABB collision detection
    // Returns time of collision (0-1), or -1 if no collision

    if (velocity.x === 0 && velocity.y === 0) return -1;

    // Calculate entry and exit times for each axis
    let entryX: number, entryY: number;
    let exitX: number, exitY: number;

    if (velocity.x > 0) {
      entryX = platform.x - (bounds.x + bounds.width);
      exitX = platform.x + platform.width - bounds.x;
    } else {
      entryX = platform.x + platform.width - bounds.x;
      exitX = platform.x - (bounds.x + bounds.width);
    }

    if (velocity.y > 0) {
      entryY = platform.y - (bounds.y + bounds.height);
      exitY = platform.y + platform.height - bounds.y;
    } else {
      entryY = platform.y + platform.height - bounds.y;
      exitY = platform.y - (bounds.y + bounds.height);
    }

    // Find entry and exit times
    const entryTimeX = velocity.x === 0 ? -Infinity : entryX / velocity.x;
    const entryTimeY = velocity.y === 0 ? -Infinity : entryY / velocity.y;
    const exitTimeX = velocity.x === 0 ? Infinity : exitX / velocity.x;
    const exitTimeY = velocity.y === 0 ? Infinity : exitY / velocity.y;

    const entryTime = Math.max(entryTimeX, entryTimeY);
    const exitTime = Math.min(exitTimeX, exitTimeY);

    // No collision
    if (entryTime > exitTime || (entryTimeX < 0 && entryTimeY < 0) || entryTime > 1) {
      return -1;
    }

    return entryTime;
  }
}

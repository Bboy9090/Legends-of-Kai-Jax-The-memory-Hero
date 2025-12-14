import { Hitbox as HitboxType, HitboxType as HitboxTypeEnum, AABB, Vector2D } from '@smash-heroes/shared';

export class HitboxManager {
  private hitboxes: Map<string, HitboxType> = new Map();

  createHitbox(hitbox: HitboxType): void {
    this.hitboxes.set(hitbox.id, hitbox);
  }

  removeHitbox(id: string): void {
    this.hitboxes.delete(id);
  }

  getHitbox(id: string): HitboxType | undefined {
    return this.hitboxes.get(id);
  }

  getAllHitboxes(): HitboxType[] {
    return Array.from(this.hitboxes.values());
  }

  getActiveHitboxes(): HitboxType[] {
    return this.getAllHitboxes().filter((h) => h.active);
  }

  getHitboxesByType(type: HitboxTypeEnum): HitboxType[] {
    return this.getAllHitboxes().filter((h) => h.type === type && h.active);
  }

  updateHitboxPosition(id: string, position: Vector2D): void {
    const hitbox = this.hitboxes.get(id);
    if (hitbox) {
      hitbox.bounds.x = position.x;
      hitbox.bounds.y = position.y;
    }
  }

  setHitboxActive(id: string, active: boolean): void {
    const hitbox = this.hitboxes.get(id);
    if (hitbox) {
      hitbox.active = active;
    }
  }

  clearAll(): void {
    this.hitboxes.clear();
  }

  deactivateAll(): void {
    this.hitboxes.forEach((hitbox) => {
      hitbox.active = false;
    });
  }
}

export class HitboxCollision {
  static checkAABB(a: AABB, b: AABB): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  static checkHitboxCollision(hitbox: HitboxType, hurtbox: HitboxType): boolean {
    if (!hitbox.active || !hurtbox.active) return false;
    if (hitbox.type !== HitboxTypeEnum.HITBOX) return false;
    if (hurtbox.type !== HitboxTypeEnum.HURTBOX) return false;
    
    return this.checkAABB(hitbox.bounds, hurtbox.bounds);
  }

  static getCollisionPoint(a: AABB, b: AABB): Vector2D {
    const centerAX = a.x + a.width / 2;
    const centerAY = a.y + a.height / 2;
    const centerBX = b.x + b.width / 2;
    const centerBY = b.y + b.height / 2;

    // Return point between centers
    return {
      x: (centerAX + centerBX) / 2,
      y: (centerAY + centerBY) / 2,
    };
  }

  static getOverlapAmount(a: AABB, b: AABB): Vector2D {
    const overlapX = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
    const overlapY = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
    
    return { x: overlapX, y: overlapY };
  }
}

/**
 * Hurtbox Component
 * Simplified collision volume for receiving damage
 */

export interface HurtboxBounds {
  x: number;
  y: number;
  halfW: number;
  halfH: number;
}

export class Hurtbox {
  public bounds: HurtboxBounds;
  public active: boolean = true;
  public invincible: boolean = false;

  constructor(x: number, y: number, halfW: number, halfH: number) {
    this.bounds = { x, y, halfW, halfH };
  }

  /**
   * Update hurtbox position
   */
  public setPosition(x: number, y: number): void {
    this.bounds.x = x;
    this.bounds.y = y;
  }

  /**
   * Set invincibility state
   */
  public setInvincible(invincible: boolean): void {
    this.invincible = invincible;
  }

  /**
   * Check if point overlaps hurtbox
   */
  public containsPoint(x: number, y: number): boolean {
    if (!this.active || this.invincible) return false;

    const left = this.bounds.x - this.bounds.halfW;
    const right = this.bounds.x + this.bounds.halfW;
    const bottom = this.bounds.y - this.bounds.halfH;
    const top = this.bounds.y + this.bounds.halfH;

    return x >= left && x <= right && y >= bottom && y <= top;
  }

  /**
   * Check if AABB overlaps hurtbox
   */
  public overlapsAABB(x: number, y: number, halfW: number, halfH: number): boolean {
    if (!this.active || this.invincible) return false;

    const thisLeft = this.bounds.x - this.bounds.halfW;
    const thisRight = this.bounds.x + this.bounds.halfW;
    const thisBottom = this.bounds.y - this.bounds.halfH;
    const thisTop = this.bounds.y + this.bounds.halfH;

    const otherLeft = x - halfW;
    const otherRight = x + halfW;
    const otherBottom = y - halfH;
    const otherTop = y + halfH;

    return !(
      thisRight < otherLeft ||
      thisLeft > otherRight ||
      thisTop < otherBottom ||
      thisBottom > otherTop
    );
  }

  /**
   * Get center position
   */
  public getCenter(): { x: number; y: number } {
    return { x: this.bounds.x, y: this.bounds.y };
  }

  /**
   * Get bounds for debug visualization
   */
  public getBounds(): HurtboxBounds {
    return { ...this.bounds };
  }
}

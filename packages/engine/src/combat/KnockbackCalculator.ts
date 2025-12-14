import { Vector2D, Hitbox, FighterStats } from '@smash-heroes/shared';
import { Vec2, MathUtils, COMBAT_CONSTANTS } from '@smash-heroes/shared';

export class KnockbackCalculator {
  /**
   * Calculate knockback using Smash Bros formula:
   * KB = ((((((p/10) + (p*d)/20) * 200/(w+100) * 1.4) + 18) * s) + b) * r
   * 
   * Where:
   * p = percentage/damage before hit
   * d = damage of the attack
   * w = weight of the target
   * s = knockback scaling/growth
   * b = base knockback
   * r = ratio (rage, staleness, etc.)
   */
  calculateKnockback(
    defenderDamage: number,
    attackDamage: number,
    defenderWeight: number,
    hitbox: Hitbox,
    rageMultiplier = 1.0
  ): number {
    const p = defenderDamage;
    const d = attackDamage;
    const w = defenderWeight;
    const s = hitbox.knockbackGrowth;
    const b = hitbox.baseKnockback;

    // Smash Bros knockback formula
    const percentTerm = p / 10 + (p * d) / 20;
    const weightTerm = 200 / (w + 100);
    const scalingTerm = percentTerm * weightTerm * 1.4 + 18;
    const finalKnockback = (scalingTerm * s + b) * rageMultiplier;

    return finalKnockback * COMBAT_CONSTANTS.KNOCKBACK_BASE_MULTIPLIER;
  }

  calculateKnockbackVector(
    magnitude: number,
    angle: number,
    attackerFacing: 'left' | 'right'
  ): Vector2D {
    // Convert angle to radians
    const angleRad = MathUtils.degToRad(angle);

    // Flip angle if attacker is facing left
    const actualAngle = attackerFacing === 'left' ? Math.PI - angleRad : angleRad;

    return {
      x: Math.cos(actualAngle) * magnitude,
      y: -Math.sin(actualAngle) * magnitude, // Negative because up is negative Y
    };
  }

  applyDI(knockback: Vector2D, diInput: Vector2D): Vector2D {
    // Directional Influence - player can influence knockback direction
    if (Vec2.magnitude(diInput) === 0) return knockback;

    const diNormalized = Vec2.normalize(diInput);
    const knockbackAngle = Vec2.angle(knockback);
    const diAngle = Vec2.angle(diNormalized);

    // Calculate angle difference
    let angleDiff = diAngle - knockbackAngle;
    
    // Normalize angle difference to -PI to PI
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

    // Apply DI influence (limited by DI_STRENGTH)
    const maxDI = MathUtils.degToRad(COMBAT_CONSTANTS.DI_STRENGTH);
    const diInfluence = Math.max(-maxDI, Math.min(maxDI, angleDiff * COMBAT_CONSTANTS.DI_MULTIPLIER));

    const newAngle = knockbackAngle + diInfluence;
    const magnitude = Vec2.magnitude(knockback);

    return {
      x: Math.cos(newAngle) * magnitude,
      y: Math.sin(newAngle) * magnitude,
    };
  }

  calculateRageMultiplier(damage: number): number {
    // Rage system: higher damage = more knockback dealt
    // Caps at RAGE_MULTIPLIER_MAX
    const ragePercent = Math.min(damage / 100, 1.0);
    return 1.0 + (COMBAT_CONSTANTS.RAGE_MULTIPLIER_MAX - 1.0) * ragePercent;
  }

  calculateHitstun(knockback: number): number {
    // Hitstun based on knockback magnitude
    const hitstun = COMBAT_CONSTANTS.HITSTUN_BASE_FRAMES + 
                    knockback * COMBAT_CONSTANTS.HITSTUN_MULTIPLIER;
    return Math.floor(hitstun);
  }

  calculateHitlag(damage: number, isDefender: boolean): number {
    // Hitlag (freeze frames) on hit
    let hitlag = COMBAT_CONSTANTS.HITLAG_BASE_FRAMES + 
                 damage * COMBAT_CONSTANTS.HITLAG_MULTIPLIER;

    // Defender experiences slightly more hitlag
    if (isDefender) {
      hitlag *= 1.5;
    }

    return Math.min(Math.floor(hitlag), COMBAT_CONSTANTS.HITLAG_MAX_FRAMES);
  }

  shouldTumble(knockback: number, damage: number): boolean {
    // Tumble state happens at high knockback/damage
    return knockback > 80 || damage > 100;
  }

  shouldLaunch(knockback: number, damage: number): boolean {
    // Launch state (star KO potential) at very high knockback
    return knockback > 120 && damage > 150;
  }
}

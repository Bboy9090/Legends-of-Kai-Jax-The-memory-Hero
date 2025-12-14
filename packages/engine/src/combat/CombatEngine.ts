import { Fighter, Hitbox, HitResult, Vector2D } from '@smash-heroes/shared';
import { KnockbackCalculator } from './KnockbackCalculator';
import { DamageSystem } from './DamageSystem';
import { ComboSystem } from './ComboSystem';
import { CounterSystem } from './CounterSystem';
import { HitboxCollision } from '../physics/Hitbox';

export class CombatEngine {
  private knockbackCalc: KnockbackCalculator;
  private damageSystem: DamageSystem;
  private comboSystem: ComboSystem;
  private counterSystem: CounterSystem;
  private currentFrame = 0;

  constructor() {
    this.knockbackCalc = new KnockbackCalculator();
    this.damageSystem = new DamageSystem();
    this.comboSystem = new ComboSystem();
    this.counterSystem = new CounterSystem();
  }

  update(deltaTime: number): void {
    this.currentFrame++;
    this.counterSystem.update(this.currentFrame);
  }

  processAttack(attacker: Fighter, defender: Fighter): HitResult | null {
    // Get active hitboxes from attacker and hurtboxes from defender
    const hitboxes = attacker.hitboxes.filter((h) => h.active && h.type === 'hitbox');
    const hurtboxes = defender.hitboxes.filter((h) => h.active && h.type === 'hurtbox');

    // Check for collisions
    for (const hitbox of hitboxes) {
      for (const hurtbox of hurtboxes) {
        if (HitboxCollision.checkHitboxCollision(hitbox, hurtbox)) {
          return this.resolveHit(attacker, defender, hitbox);
        }
      }
    }

    return null;
  }

  private resolveHit(attacker: Fighter, defender: Fighter, hitbox: Hitbox): HitResult {
    // Check for counter/parry
    const wasCounter = this.counterSystem.checkCounter(defender.id, this.currentFrame);
    const wasParry = this.counterSystem.checkParry(defender.id, this.currentFrame);

    // Calculate damage
    let damage = hitbox.damage;
    
    if (wasParry) {
      damage = this.damageSystem.calculateCounterDamage(damage, true);
      // Parry reflects attack back to attacker
      return this.createHitResult(defender, attacker, hitbox, damage, wasCounter, wasParry);
    } else if (wasCounter) {
      damage = this.damageSystem.calculateCounterDamage(damage, false);
      return this.createHitResult(defender, attacker, hitbox, damage, wasCounter, wasParry);
    }

    // Normal hit
    return this.createHitResult(attacker, defender, hitbox, damage, wasCounter, wasParry);
  }

  private createHitResult(
    attacker: Fighter,
    defender: Fighter,
    hitbox: Hitbox,
    damage: number,
    wasCounter: boolean,
    wasParry: boolean
  ): HitResult {
    // Apply damage multiplier
    const multiplier = this.damageSystem.calculateDamageMultiplier(hitbox.damageType);
    const finalDamage = damage * multiplier;

    // Calculate knockback
    const rageMultiplier = this.knockbackCalc.calculateRageMultiplier(attacker.stats.currentDamage);
    const knockbackMagnitude = this.knockbackCalc.calculateKnockback(
      defender.stats.currentDamage,
      finalDamage,
      defender.stats.weight,
      hitbox,
      rageMultiplier
    );

    // Get knockback vector
    const knockback = this.knockbackCalc.calculateKnockbackVector(
      knockbackMagnitude,
      hitbox.knockbackAngle,
      attacker.facing
    );

    // Calculate hitstun and hitlag
    const hitstun = this.knockbackCalc.calculateHitstun(knockbackMagnitude);
    const hitlag = this.knockbackCalc.calculateHitlag(finalDamage, false);

    // Record combo
    const hitResult: HitResult = {
      attacker: attacker.id,
      defender: defender.id,
      damage: finalDamage,
      knockback,
      hitstun,
      hitlag,
      hitPosition: { x: hitbox.bounds.x, y: hitbox.bounds.y },
      damageType: hitbox.damageType,
      wasCounter,
      wasParry,
    };

    this.comboSystem.recordHit(attacker.id, hitResult);

    return hitResult;
  }

  applyHitResult(fighter: Fighter, hitResult: HitResult): void {
    // Apply damage
    fighter.stats.currentDamage = this.damageSystem.applyDamage(
      fighter.id,
      fighter.stats.currentDamage,
      hitResult.damage
    );

    // Apply knockback (handled by physics system)
    // Apply hitstun (handled by state machine)
  }

  startCounter(fighterId: string): void {
    this.counterSystem.startCounterWindow(fighterId, this.currentFrame);
  }

  startParry(fighterId: string): void {
    this.counterSystem.startParryWindow(fighterId, this.currentFrame);
  }

  getCombo(fighterId: string) {
    return this.comboSystem.getCombo(fighterId);
  }

  getCurrentFrame(): number {
    return this.currentFrame;
  }

  reset(): void {
    this.currentFrame = 0;
    this.damageSystem.resetAll();
    this.comboSystem.resetAll();
    this.counterSystem.resetAll();
  }
}

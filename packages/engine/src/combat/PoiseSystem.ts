import { Hitbox, DamageType } from '@smash-heroes/shared';

/**
 * Poise and Stagger System - Small hits flinch, heavy hits launch
 * Gives weight and impact to different attack strengths
 */
export class PoiseSystem {
  private poiseStates: Map<string, PoiseState> = new Map();
  
  // Thresholds for different reactions
  private readonly FLINCH_THRESHOLD = 5;
  private readonly STAGGER_THRESHOLD = 15;
  private readonly LAUNCH_THRESHOLD = 30;
  
  /**
   * Initialize poise for a fighter
   */
  initializePoise(fighterId: string, maxPoise: number, poiseRegenRate: number = 1.0): void {
    this.poiseStates.set(fighterId, {
      fighterId,
      currentPoise: maxPoise,
      maxPoise,
      poiseRegenRate,
      isStaggered: false,
      staggerFramesRemaining: 0,
      lastHitTime: 0,
    });
  }

  /**
   * Determine reaction type based on attack damage and current poise
   */
  calculateReaction(
    fighterId: string,
    hitbox: Hitbox,
    attackerWeight: number = 100
  ): HitReaction {
    const state = this.poiseStates.get(fighterId);
    
    if (!state) {
      // Default reaction if no poise state exists
      return this.getDefaultReaction(hitbox.damage);
    }

    // Calculate effective damage considering attack properties
    const effectiveDamage = this.calculateEffectiveDamage(hitbox, attackerWeight);
    
    // Reduce poise by effective damage
    const poiseDamage = effectiveDamage;
    state.currentPoise -= poiseDamage;
    state.lastHitTime = performance.now();
    
    // Determine reaction based on poise break
    if (state.currentPoise <= 0) {
      // Poise broken - heavy reaction
      state.isStaggered = true;
      state.staggerFramesRemaining = this.calculateStaggerFrames(effectiveDamage);
      state.currentPoise = 0; // Can't go negative
      
      if (effectiveDamage >= this.LAUNCH_THRESHOLD) {
        return {
          type: ReactionType.LAUNCH,
          frames: state.staggerFramesRemaining,
          canAct: false,
          canMove: false,
          invulnerable: false,
        };
      } else if (effectiveDamage >= this.STAGGER_THRESHOLD) {
        return {
          type: ReactionType.STAGGER,
          frames: state.staggerFramesRemaining,
          canAct: false,
          canMove: false,
          invulnerable: false,
        };
      } else {
        return {
          type: ReactionType.FLINCH,
          frames: Math.floor(effectiveDamage * 0.5),
          canAct: false,
          canMove: true,
          invulnerable: false,
        };
      }
    } else {
      // Poise held - light reaction or super armor through it
      if (state.currentPoise > state.maxPoise * 0.5) {
        // High poise - can super armor through weak attacks
        if (effectiveDamage < this.FLINCH_THRESHOLD) {
          return {
            type: ReactionType.SUPER_ARMOR,
            frames: 0,
            canAct: true,
            canMove: true,
            invulnerable: false,
          };
        }
      }
      
      // Take hit but maintain some control
      return {
        type: ReactionType.FLINCH,
        frames: Math.max(1, Math.floor(effectiveDamage * 0.3)),
        canAct: false,
        canMove: true,
        invulnerable: false,
      };
    }
  }

  /**
   * Calculate effective damage considering attack properties
   */
  private calculateEffectiveDamage(hitbox: Hitbox, attackerWeight: number): number {
    let damage = hitbox.damage;
    
    // Heavy attacks (high knockback growth) are better at breaking poise
    const knockbackFactor = hitbox.knockbackGrowth / 100;
    damage *= (1 + knockbackFactor);
    
    // Heavier attackers deal more poise damage
    const weightFactor = attackerWeight / 100;
    damage *= weightFactor;
    
    // Special damage types have different poise properties
    switch (hitbox.damageType) {
      case DamageType.PHYSICAL:
        damage *= 1.2; // Physical hits break poise better
        break;
      case DamageType.ENERGY:
        damage *= 0.8; // Energy hits are less likely to stagger
        break;
      case DamageType.SPECIAL:
        damage *= 1.5; // Special attacks are very good at breaking poise
        break;
    }
    
    return damage;
  }

  /**
   * Calculate stagger duration based on damage
   */
  private calculateStaggerFrames(damage: number): number {
    const baseFrames = 20;
    const scalingFrames = Math.floor(damage * 0.5);
    return Math.min(baseFrames + scalingFrames, 60); // Cap at 1 second
  }

  /**
   * Get default reaction when no poise system is active
   */
  private getDefaultReaction(damage: number): HitReaction {
    if (damage >= this.LAUNCH_THRESHOLD) {
      return {
        type: ReactionType.LAUNCH,
        frames: 40,
        canAct: false,
        canMove: false,
        invulnerable: false,
      };
    } else if (damage >= this.STAGGER_THRESHOLD) {
      return {
        type: ReactionType.STAGGER,
        frames: 25,
        canAct: false,
        canMove: false,
        invulnerable: false,
      };
    } else {
      return {
        type: ReactionType.FLINCH,
        frames: Math.floor(damage * 0.5),
        canAct: false,
        canMove: true,
        invulnerable: false,
      };
    }
  }

  /**
   * Update poise regeneration
   */
  update(deltaTime: number): void {
    const now = performance.now();
    
    for (const [, state] of this.poiseStates) {
      // Update stagger
      if (state.isStaggered && state.staggerFramesRemaining > 0) {
        state.staggerFramesRemaining--;
        
        if (state.staggerFramesRemaining <= 0) {
          state.isStaggered = false;
        }
      }
      
      // Regenerate poise if not recently hit (1 second grace period)
      if (now - state.lastHitTime > 1000) {
        state.currentPoise = Math.min(
          state.currentPoise + state.poiseRegenRate * deltaTime * 0.06,
          state.maxPoise
        );
      }
    }
  }

  /**
   * Get current poise state for a fighter
   */
  getPoiseState(fighterId: string): PoiseState | undefined {
    return this.poiseStates.get(fighterId);
  }

  /**
   * Reset poise for a fighter
   */
  resetPoise(fighterId: string): void {
    const state = this.poiseStates.get(fighterId);
    if (state) {
      state.currentPoise = state.maxPoise;
      state.isStaggered = false;
      state.staggerFramesRemaining = 0;
    }
  }

  /**
   * Clear all poise states
   */
  clear(): void {
    this.poiseStates.clear();
  }
}

export interface PoiseState {
  fighterId: string;
  currentPoise: number;
  maxPoise: number;
  poiseRegenRate: number;
  isStaggered: boolean;
  staggerFramesRemaining: number;
  lastHitTime: number;
}

export interface HitReaction {
  type: ReactionType;
  frames: number;
  canAct: boolean;
  canMove: boolean;
  invulnerable: boolean;
}

export enum ReactionType {
  NONE = 'none',
  SUPER_ARMOR = 'super_armor',  // Tank through the hit
  FLINCH = 'flinch',             // Brief stun, can still move
  STAGGER = 'stagger',           // Medium stun, can't move
  LAUNCH = 'launch',             // Heavy launch state
}

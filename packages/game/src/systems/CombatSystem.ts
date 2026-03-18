// Combat System - Hit Detection & Damage
// Path: packages/game/src/systems/CombatSystem.ts

import * as THREE from 'three';
import { EventBus } from '@game/core/EventBus';

interface HitBox {
  characterId: string;
  position: THREE.Vector3;
  radius: number;
  damage: number;
  knockback: THREE.Vector3;
  hitStopFrames: number;
  ownerWeight: number;
  isActive: boolean;
  startFrame: number;
  endFrame: number;
}

interface HurtBox {
  characterId: string;
  position: THREE.Vector3;
  radius: number;
}

interface CombatStats {
  weight: number;
  power: number; // Multiplier for damage (0.8 - 1.2)
  defense: number; // Knockback resistance (0.8 - 1.2)
}

interface HitResult {
  hit: boolean;
  damage: number;
  knockback: THREE.Vector3;
  hitStopFrames: number;
  position: THREE.Vector3;
}

/**
 * Combat system for hit detection and damage calculation
 * Handles all attack/defense interactions between characters
 */
export class CombatSystem {
  private activeHitBoxes: Map<string, HitBox[]> = new Map();
  private hurtBoxes: Map<string, HurtBox> = new Map();
  private combatStats: Map<string, CombatStats> = new Map();
  private eventBus: EventBus;
  private frameCount = 0;
  private hitCooldown: Map<string, number> = new Map();
  private readonly HIT_COOLDOWN_FRAMES = 6; // Prevent repeated hits on same attack

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  /**
   * Register a character's combat stats
   */
  public registerCharacter(
    characterId: string,
    stats: CombatStats,
    position: THREE.Vector3
  ): void {
    this.combatStats.set(characterId, stats);
    this.hurtBoxes.set(characterId, {
      characterId,
      position: position.clone(),
      radius: 0.5, // Standard hurtbox radius
    });
    this.activeHitBoxes.set(characterId, []);
    this.hitCooldown.set(characterId, 0);
  }

  /**
   * Create and register a hitbox for an attack
   * @param attackerId - Character performing attack
   * @param damage - Base damage value
   * @param knockback - Knockback force vector
   * @param position - World position of hitbox
   * @param radius - Hitbox radius
   * @param duration - How many frames hitbox is active
   * @param hitStop - Hit-stop duration in frames
   */
  public createHitBox(
    attackerId: string,
    damage: number,
    knockback: THREE.Vector3,
    position: THREE.Vector3,
    radius: number = 0.8,
    duration: number = 10,
    hitStop: number = 5
  ): void {
    const stats = this.combatStats.get(attackerId);
    if (!stats) {
      console.warn(`[Combat] Character ${attackerId} not registered`);
      return;
    }

    const hitBox: HitBox = {
      characterId: attackerId,
      position: position.clone(),
      radius,
      damage: damage * stats.power, // Apply power multiplier
      knockback: knockback.clone(),
      hitStopFrames: hitStop,
      ownerWeight: stats.weight,
      isActive: true,
      startFrame: this.frameCount,
      endFrame: this.frameCount + duration,
    };

    const boxes = this.activeHitBoxes.get(attackerId) || [];
    boxes.push(hitBox);
    this.activeHitBoxes.set(attackerId, boxes);

    this.eventBus.emit('attack:created', {
      attackerId,
      hitBox,
    });
  }

  /**
   * Update hurtbox position for a character
   */
  public updateHurtBox(characterId: string, position: THREE.Vector3): void {
    const hurtBox = this.hurtBoxes.get(characterId);
    if (hurtBox) {
      hurtBox.position.copy(position);
    }
  }

  /**
   * Check all hit detection this frame
   */
  public update(): void {
    this.frameCount++;

    // Clean up expired hitboxes
    for (const [characterId, boxes] of this.activeHitBoxes.entries()) {
      const activatedBoxes = boxes.filter((box) => {
        if (box.endFrame <= this.frameCount) {
          this.eventBus.emit('attack:expired', {
            attackerId: characterId,
            damage: box.damage,
          });
          return false;
        }
        return true;
      });
      this.activeHitBoxes.set(characterId, activatedBoxes);
    }

    // Check collisions between all hitboxes and hurtboxes
    for (const [attackerId, hitBoxes] of this.activeHitBoxes.entries()) {
      for (const hitBox of hitBoxes) {
        for (const [defenderId, hurtBox] of this.hurtBoxes.entries()) {
          if (attackerId === defenderId) continue; // Can't hit yourself

          // Check cooldown
          const cooldown = this.hitCooldown.get(defenderId) || 0;
          if (cooldown > 0) {
            this.hitCooldown.set(defenderId, cooldown - 1);
            continue; // Still in cooldown from another hit
          }

          // Sphere collision check
          const distance = hitBox.position.distanceTo(hurtBox.position);
          if (distance < hitBox.radius + hurtBox.radius) {
            // HIT!
            this.handleHit(attackerId, defenderId, hitBox, hurtBox.position);
            this.hitCooldown.set(defenderId, this.HIT_COOLDOWN_FRAMES);
          }
        }
      }
    }
  }

  /**
   * Process a hit
   */
  private handleHit(
    attackerId: string,
    defenderId: string,
    hitBox: HitBox,
    hitPosition: THREE.Vector3
  ): void {
    const defenderStats = this.combatStats.get(defenderId);
    if (!defenderStats) return;

    // Calculate final damage (defense reduces it)
    const baseDamage = hitBox.damage;
    const defenseReduction = Math.max(0.7, 2 - defenderStats.defense); // Range: 0.7-1.2
    const finalDamage = baseDamage / defenseReduction;

    // Calculate knockback (defense reduces it slightly)
    const knockbackReduction = defenderStats.defense * 0.9; // Defense helps resist KB
    const finalKnockback = hitBox.knockback.clone().multiplyScalar(knockbackReduction);

    // Add weight consideration
    const weightFactor = hitBox.ownerWeight / defenderStats.weight;
    finalKnockback.multiplyScalar(Math.min(1.5, Math.max(0.5, weightFactor)));

    // Emit hit event
    this.eventBus.emit('character:hit', {
      attackerId,
      defenderId,
      damage: finalDamage,
      knockback: finalKnockback,
      hitPosition,
      hitStopFrames: hitBox.hitStopFrames,
      weight: defenderStats.weight,
    });

    this.eventBus.emit('attack:landed', {
      attackerId,
      defenderId,
      damage: finalDamage,
      hitPosition,
    });
  }

  /**
   * Apply hit effects (damage, knockback, VFX)
   */
  public applyHitEffects(
    attackerId: string,
    defenderId: string,
    data: any
  ): void {
    // Emit VFX event
    this.eventBus.emit('vfx:hit_effect', {
      position: data.hitPosition,
      damage: data.damage,
      type: 'impact',
    });

    // Screen shake based on damage
    const shakeIntensity = Math.min(10, data.damage / 10);
    this.eventBus.emit('camera:shake', {
      intensity: shakeIntensity,
      duration: 0.1,
    });

    // Hit sound effect
    this.eventBus.emit('audio:play_sfx', {
      name: 'hit_impact',
      volume: Math.min(1, data.damage / 50),
      pitch: 1 + Math.random() * 0.2,
    });
  }

  /**
   * Get all active hitboxes for a character (for debugging visualization)
   */
  public getActiveHitBoxes(characterId: string): HitBox[] {
    return this.activeHitBoxes.get(characterId) || [];
  }

  /**
   * Get hurtbox for a character (for debugging visualization)
   */
  public getHurtBox(characterId: string): HurtBox | undefined {
    return this.hurtBoxes.get(characterId);
  }

  /**
   * Reset all combat state (for match restart)
   */
  public reset(): void {
    this.frameCount = 0;
    this.activeHitBoxes.clear();
    this.hitCooldown.clear();
  }
}

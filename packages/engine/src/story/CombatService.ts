/**
 * @file CombatService.ts
 * @brief Combat system service for TypeScript integration
 * 
 * Provides TypeScript interface to the C++ combat system.
 * 
 * CANONICAL LAW:
 * - Unified combat core (same logic for all platforms)
 * - Mass and inertia matter
 * - Punish spamming, reward precision
 * - Tail tier affects combat systemically
 */

import {
  CombatCharacter,
  AttackDefinition,
  HitData,
  ComboState,
  DodgeType,
  CombatState,
  TailTierCombatModifier,
  MovementParameters,
  AgilityFeatures
} from './StoryModeTypes';

export type HitCallback = (hit: HitData) => void;
export type ComboCallback = (characterId: string, hitCount: number) => void;
export type ParryCallback = (characterId: string) => void;

export class CombatService {
  private characters: Map<string, CombatCharacter> = new Map();
  private attacks: Map<string, AttackDefinition> = new Map();
  private tailTierModifiers: Map<number, TailTierCombatModifier> = new Map();
  
  // Callbacks
  private hitCallback?: HitCallback;
  private comboCallback?: ComboCallback;
  private parryCallback?: ParryCallback;
  
  // Configuration
  private punishSpamming: boolean = true;
  private rewardPrecision: boolean = true;
  private massAffectsMomentum: boolean = true;

  constructor() {}

  /**
   * Load combat configuration from JSON
   */
  async loadConfiguration(configPath: string = '/data/combat/unified_combat_system.json'): Promise<void> {
    try {
      const response = await fetch(configPath);
      const config = await response.json();

      // Load philosophy
      this.punishSpamming = config.punish_spamming;
      this.rewardPrecision = config.reward_precision;

      // Load movement
      this.massAffectsMomentum = config.base_movement.mass_affects_momentum;

      // Load attacks
      for (const [attackId, attackData] of Object.entries<any>(config.attacks)) {
        this.attacks.set(attackId, attackData);
      }

      // Load tail tier modifiers
      for (const [tierStr, tierData] of Object.entries<any>(config.tail_tier_modifiers)) {
        const tier = parseInt(tierStr);
        this.tailTierModifiers.set(tier, tierData);
      }

      console.log('Combat system configuration loaded');
    } catch (error) {
      console.error('Failed to load combat configuration:', error);
      throw error;
    }
  }

  /**
   * Update combat system (called each frame)
   */
  update(deltaTime: number): void {
    this.characters.forEach(character => {
      this.updateCharacterMovement(character, deltaTime);
      this.updateCharacterAttack(character, deltaTime);
      this.updateCharacterCombo(character, deltaTime);

      // Update stun frames
      if (character.stun_frames_remaining > 0) {
        character.stun_frames_remaining--;
        if (character.stun_frames_remaining === 0) {
          character.state = CombatState.Idle;
        }
      }
    });
  }

  /**
   * Register a character for combat
   */
  registerCharacter(character: CombatCharacter): string {
    this.characters.set(character.character_id, character);
    this.applyTailTierModifiers(character);
    console.log(`Registered character: ${character.character_id}`);
    return character.character_id;
  }

  /**
   * Unregister character from combat
   */
  unregisterCharacter(characterId: string): void {
    this.characters.delete(characterId);
  }

  /**
   * Get character
   */
  getCharacter(characterId: string): CombatCharacter | undefined {
    return this.characters.get(characterId);
  }

  /**
   * Set character tail count (CANON: 3-9)
   */
  setCharacterTailCount(characterId: string, tailCount: number): boolean {
    const character = this.characters.get(characterId);
    if (!character) return false;

    // CANON ENFORCEMENT
    if (tailCount < 3 || tailCount > 9) {
      console.error(`Invalid tail count: ${tailCount} (must be 3-9)`);
      return false;
    }

    character.current_tail_count = tailCount;
    this.applyTailTierModifiers(character);
    console.log(`Character ${characterId} tail count set to ${tailCount}`);
    return true;
  }

  /**
   * Execute an attack
   */
  executeAttack(attackerId: string, attackId: string): boolean {
    const attacker = this.characters.get(attackerId);
    if (!attacker) return false;

    if (!this.canExecuteAttack(attacker, attackId)) {
      return false;
    }

    const attack = this.attacks.get(attackId);
    if (!attack) return false;

    // Start attack
    attacker.current_attack_id = attackId;
    attacker.attack_frame = 0;
    attacker.state = CombatState.Attacking;

    return true;
  }

  /**
   * Execute a dodge
   */
  executeDodge(
    characterId: string,
    dodgeType: DodgeType,
    directionX: number,
    directionZ: number
  ): boolean {
    const character = this.characters.get(characterId);
    if (!character) return false;

    if (character.state === CombatState.Stunned || 
        character.state === CombatState.KnockedDown) {
      return false;
    }

    // Execute dodge
    character.state = CombatState.Dodging;

    // Apply dodge velocity
    const dodgeSpeed = character.agility.dodge_distance * 60.0;
    const magnitude = Math.sqrt(directionX * directionX + directionZ * directionZ);
    
    if (magnitude > 0.01) {
      character.vel_x = (directionX / magnitude) * dodgeSpeed;
      character.vel_z = (directionZ / magnitude) * dodgeSpeed;
    }

    return true;
  }

  /**
   * Set movement input
   */
  setMovementInput(
    characterId: string,
    inputX: number,
    inputZ: number,
    isSprinting: boolean
  ): void {
    const character = this.characters.get(characterId);
    if (!character) return;

    // Can only move if not in an action state
    if (character.state !== CombatState.Idle && character.state !== CombatState.Moving) {
      return;
    }

    const magnitude = Math.sqrt(inputX * inputX + inputZ * inputZ);
    
    if (magnitude > 0.01) {
      character.state = CombatState.Moving;

      // Determine speed
      const targetSpeed = isSprinting
        ? character.movement.sprint_speed
        : character.movement.run_speed;

      // Apply tail tier speed modifier
      const modifiedSpeed = targetSpeed * character.tail_modifiers.speed_multiplier;

      // Set velocity
      character.vel_x = (inputX / magnitude) * modifiedSpeed;
      character.vel_z = (inputZ / magnitude) * modifiedSpeed;
    } else {
      if (character.state === CombatState.Moving) {
        character.state = CombatState.Idle;
      }
    }
  }

  /**
   * Detect hits for an attacker
   */
  detectHits(attackerId: string): HitData[] {
    const hits: HitData[] = [];
    const attacker = this.characters.get(attackerId);
    
    if (!attacker || attacker.state !== CombatState.Attacking) {
      return hits;
    }

    const attack = this.attacks.get(attacker.current_attack_id);
    if (!attack) return hits;

    // Check all other characters for hits
    this.characters.forEach((defender, defenderId) => {
      if (defenderId === attackerId) return;

      // Calculate distance
      const dx = defender.pos_x - attacker.pos_x;
      const dz = defender.pos_z - attacker.pos_z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist <= attack.range) {
        // Calculate damage
        let damage = attack.damage * attacker.tail_modifiers.damage_multiplier;

        // Add momentum bonus if applicable
        if (attack.momentum_based) {
          damage *= this.calculateMomentumBonus(attacker);
        }

        // Calculate knockback
        const knockbackDirX = dx / dist;
        const knockbackDirZ = dz / dist;

        hits.push({
          attacker_id: attackerId,
          defender_id: defenderId,
          attack_id: attacker.current_attack_id,
          damage,
          knockback_x: knockbackDirX * attack.knockback_strength,
          knockback_y: 0,
          knockback_z: knockbackDirZ * attack.knockback_strength,
          hitstun_frames: attack.hitstun_frames,
          is_counter_hit: false,
          is_parried: false
        });
      }
    });

    return hits;
  }

  /**
   * Apply a hit to a defender
   */
  applyHit(hit: HitData): void {
    const defender = this.characters.get(hit.defender_id);
    if (!defender) return;

    if (hit.is_parried) return;

    // Apply damage
    defender.health -= hit.damage;

    // Apply knockback
    defender.vel_x += hit.knockback_x;
    defender.vel_z += hit.knockback_z;

    // Apply hitstun
    defender.stun_frames_remaining = hit.hitstun_frames;
    defender.state = CombatState.Stunned;

    // Update attacker combo
    const attacker = this.characters.get(hit.attacker_id);
    if (attacker) {
      attacker.combo.hit_count++;
      attacker.combo.total_damage += hit.damage;
      attacker.combo.is_active = true;
      attacker.combo.last_hit_time = 0;

      if (this.comboCallback) {
        this.comboCallback(hit.attacker_id, attacker.combo.hit_count);
      }
    }

    // Trigger hit callback
    if (this.hitCallback) {
      this.hitCallback(hit);
    }
  }

  /**
   * Get character's current combo
   */
  getCombo(characterId: string): ComboState | undefined {
    const character = this.characters.get(characterId);
    return character?.combo;
  }

  /**
   * Reset character's combo
   */
  resetCombo(characterId: string): void {
    const character = this.characters.get(characterId);
    if (character) {
      character.combo = {
        hit_count: 0,
        total_damage: 0,
        move_sequence: [],
        last_hit_time: 0,
        combo_timeout: 2.0,
        is_active: false
      };
    }
  }

  /**
   * Set callbacks
   */
  setHitCallback(callback: HitCallback): void {
    this.hitCallback = callback;
  }

  setComboCallback(callback: ComboCallback): void {
    this.comboCallback = callback;
  }

  setParryCallback(callback: ParryCallback): void {
    this.parryCallback = callback;
  }

  // Private helper methods

  private updateCharacterMovement(character: CombatCharacter, deltaTime: number): void {
    // Apply inertia (CANON: mass affects momentum)
    if (this.massAffectsMomentum) {
      character.vel_x *= character.movement.inertia_factor;
      character.vel_z *= character.movement.inertia_factor;
    }

    // Update position
    character.pos_x += character.vel_x * deltaTime;
    character.pos_z += character.vel_z * deltaTime;
  }

  private updateCharacterAttack(character: CombatCharacter, deltaTime: number): void {
    if (character.state !== CombatState.Attacking) return;

    character.attack_frame++;

    const attack = this.attacks.get(character.current_attack_id);
    if (!attack) {
      character.state = CombatState.Idle;
      return;
    }

    // Check if attack is complete
    if (character.attack_frame >= attack.execution_frames + attack.recovery_frames) {
      character.state = CombatState.Idle;
      character.current_attack_id = '';
      character.attack_frame = 0;
    }
  }

  private updateCharacterCombo(character: CombatCharacter, deltaTime: number): void {
    if (!character.combo.is_active) return;

    character.combo.last_hit_time += deltaTime;

    // Check for combo timeout
    if (character.combo.last_hit_time >= character.combo.combo_timeout) {
      this.resetCombo(character.character_id);
    }
  }

  private applyTailTierModifiers(character: CombatCharacter): void {
    const modifiers = this.tailTierModifiers.get(character.current_tail_count);
    if (modifiers) {
      character.tail_modifiers = modifiers;
    }
  }

  private canExecuteAttack(character: CombatCharacter, attackId: string): boolean {
    // Check if character is in valid state
    if (character.state === CombatState.Stunned || 
        character.state === CombatState.KnockedDown) {
      return false;
    }

    // Get attack definition
    const attack = this.attacks.get(attackId);
    if (!attack) return false;

    // Check tail tier requirement (CANON)
    if (character.current_tail_count < attack.requires_tail_tier) {
      return false;
    }

    // Check if attack is in available attacks list
    if (!character.tail_modifiers.available_attacks.includes(attackId)) {
      return false;
    }

    return true;
  }

  private calculateMomentumBonus(character: CombatCharacter): number {
    // Calculate speed from velocity
    const speed = Math.sqrt(
      character.vel_x * character.vel_x + 
      character.vel_z * character.vel_z
    );

    // Bonus scales with speed (1.0x at walk, 1.5x at sprint)
    const speedRatio = speed / character.movement.sprint_speed;
    return 1.0 + speedRatio * 0.5;
  }
}

// Singleton instance
let combatServiceInstance: CombatService | null = null;

/**
 * Get the Combat service singleton
 */
export function getCombatService(): CombatService {
  if (!combatServiceInstance) {
    combatServiceInstance = new CombatService();
  }
  return combatServiceInstance;
}

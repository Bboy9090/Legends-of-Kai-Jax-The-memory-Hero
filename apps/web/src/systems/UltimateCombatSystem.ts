/**
 * ⚡ ULTIMATE COMBAT SYSTEM ⚡
 * God-Tier Combat Engine for Legends of Kai-Jax
 * 
 * Features:
 * - Ultimate move execution with cinematic effects
 * - Combo detection and tracking
 * - Transformation-boosted attacks
 * - Hit-stop and impact frames
 * - Screen shake and flash effects
 * - Damage scaling based on transformation tier
 */

import * as THREE from 'three';
import { EventBus } from '@game/core/EventBus';
import { TransformationTier } from './TransformationSystem';

// Move types
export enum MoveType {
  LIGHT = 'light',
  MEDIUM = 'medium',
  HEAVY = 'heavy',
  SPECIAL = 'special',
  ULTIMATE = 'ultimate',
}

// Attack data structure
export interface AttackData {
  id: string;
  characterId: string;
  moveType: MoveType;
  moveName: string;
  damage: number;
  knockback: THREE.Vector3;
  hitStopFrames: number;
  position: THREE.Vector3;
  radius: number;
  duration: number;
  transformationTier: TransformationTier;
  isUltimate: boolean;
}

// Combo data
export interface ComboData {
  characterId: string;
  hits: number;
  totalDamage: number;
  moves: string[];
  lastHitTime: number;
  isActive: boolean;
}

// Ultimate move definition
export interface UltimateMove {
  name: string;
  characterId: string;
  damage: number;
  resonanceRequired: number;
  cinematicDuration: number;
  voiceLine: string;
  effects: {
    screenFlash: boolean;
    screenShake: number;
    slowMotion: boolean;
    chromaticAberration: boolean;
  };
}

// Pre-defined ultimate moves for each character
const ULTIMATE_MOVES: Record<string, UltimateMove> = {
  'kai-jax': {
    name: 'GODS WILL TREMBLE',
    characterId: 'kai-jax',
    damage: 100,
    resonanceRequired: 100,
    cinematicDuration: 3000,
    voiceLine: 'GODS... WILL... TREMBLE!!!',
    effects: {
      screenFlash: true,
      screenShake: 0.2,
      slowMotion: true,
      chromaticAberration: true,
    },
  },
  'jaxon': {
    name: 'THUNDER GOD BARRAGE',
    characterId: 'jaxon',
    damage: 85,
    resonanceRequired: 100,
    cinematicDuration: 2500,
    voiceLine: 'THUNDER... GOD... BARRAGE!',
    effects: {
      screenFlash: true,
      screenShake: 0.15,
      slowMotion: true,
      chromaticAberration: false,
    },
  },
  'kaison': {
    name: 'CELESTIAL GUARDIAN STRIKE',
    characterId: 'kaison',
    damage: 90,
    resonanceRequired: 100,
    cinematicDuration: 2500,
    voiceLine: 'CELESTIAL... GUARDIAN... STRIKE!',
    effects: {
      screenFlash: true,
      screenShake: 0.15,
      slowMotion: true,
      chromaticAberration: false,
    },
  },
  'boryx-zenith': {
    name: 'ETERNAL GUARDIAN JUDGMENT',
    characterId: 'boryx-zenith',
    damage: 88,
    resonanceRequired: 100,
    cinematicDuration: 2500,
    voiceLine: 'ETERNAL... GUARDIAN... JUDGMENT!',
    effects: {
      screenFlash: true,
      screenShake: 0.18,
      slowMotion: true,
      chromaticAberration: false,
    },
  },
  'voidonus': {
    name: 'THE END OF ALL THINGS',
    characterId: 'voidonus',
    damage: 100,
    resonanceRequired: 100,
    cinematicDuration: 4000,
    voiceLine: 'THE... END... OF... ALL... THINGS!!!',
    effects: {
      screenFlash: true,
      screenShake: 0.25,
      slowMotion: true,
      chromaticAberration: true,
    },
  },
};

// Combo scaling - damage multiplier based on combo length
const COMBO_SCALING: Record<number, number> = {
  1: 1.0,
  2: 1.05,
  3: 1.1,
  4: 1.15,
  5: 1.2,
  6: 1.25,
  7: 1.3,
  8: 1.35,
  9: 1.4,
  10: 1.5, // 10+ hits
};

// Transformation damage multipliers
const TRANSFORMATION_DAMAGE_MULTIPLIERS: Record<TransformationTier, number> = {
  [TransformationTier.BASE]: 1.0,
  [TransformationTier.AWAKENED]: 1.25,
  [TransformationTier.SAGE]: 1.5,
  [TransformationTier.LEGENDARY]: 2.0,
  [TransformationTier.GOD]: 3.0,
};

export class UltimateCombatSystem {
  private eventBus: EventBus;
  private activeAttacks: Map<string, AttackData> = new Map();
  private combos: Map<string, ComboData> = new Map();
  private ultimateCooldowns: Map<string, number> = new Map();
  private isUltimateActive: boolean = false;
  private comboDropTime: number = 1000; // 1 second to continue combo

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.eventBus.subscribe('attack:execute', this.handleAttackExecute.bind(this));
    this.eventBus.subscribe('ultimate:trigger', this.handleUltimateTrigger.bind(this));
    this.eventBus.subscribe('character:hit', this.handleCharacterHit.bind(this));
  }

  /**
   * Handle attack execution
   */
  private handleAttackExecute(data: {
    characterId: string;
    moveType: MoveType;
    moveName: string;
    position: THREE.Vector3;
    direction: THREE.Vector3;
    transformationTier: TransformationTier;
  }): void {
    const { characterId, moveType, moveName, position, direction, transformationTier } = data;

    // Calculate base damage based on move type
    const baseDamage = this.getBaseDamage(moveType);
    
    // Apply transformation multiplier
    const transformMultiplier = TRANSFORMATION_DAMAGE_MULTIPLIERS[transformationTier];
    const finalDamage = Math.floor(baseDamage * transformMultiplier);

    // Calculate knockback based on move type and transformation
    const knockbackPower = this.getKnockbackPower(moveType, transformationTier);
    const knockback = direction.clone().multiplyScalar(knockbackPower);
    knockback.y = knockbackPower * 0.3; // Add upward component

    // Calculate hit-stop frames
    const hitStopFrames = this.getHitStopFrames(moveType);

    // Create attack data
    const attackId = `${characterId}-${Date.now()}`;
    const attackData: AttackData = {
      id: attackId,
      characterId,
      moveType,
      moveName,
      damage: finalDamage,
      knockback,
      hitStopFrames,
      position: position.clone(),
      radius: this.getAttackRadius(moveType),
      duration: this.getAttackDuration(moveType),
      transformationTier,
      isUltimate: false,
    };

    this.activeAttacks.set(attackId, attackData);

    // Emit attack created event
    this.eventBus.emit('attack:created', {
      attackId,
      ...attackData,
    });

    // Apply visual effects based on transformation tier
    if (transformationTier >= TransformationTier.LEGENDARY) {
      this.eventBus.emit('screen:shake', {
        intensity: 0.03 * transformationTier,
        duration: 0.1,
      });
    }
  }

  /**
   * Handle ultimate move trigger
   */
  private handleUltimateTrigger(data: {
    characterId: string;
    resonance: number;
    targetId: string;
    targetPosition: THREE.Vector3;
  }): void {
    const { characterId, resonance, targetId, targetPosition } = data;

    // Check if ultimate is available
    const ultimateMove = ULTIMATE_MOVES[characterId];
    if (!ultimateMove) {
      console.warn(`[Combat] No ultimate move defined for ${characterId}`);
      return;
    }

    // Check resonance requirement
    if (resonance < ultimateMove.resonanceRequired) {
      this.eventBus.emit('ultimate:failed', {
        characterId,
        reason: 'insufficient_resonance',
        required: ultimateMove.resonanceRequired,
        current: resonance,
      });
      return;
    }

    // Check cooldown
    const cooldown = this.ultimateCooldowns.get(characterId) || 0;
    if (cooldown > 0) {
      this.eventBus.emit('ultimate:failed', {
        characterId,
        reason: 'on_cooldown',
        remainingCooldown: cooldown,
      });
      return;
    }

    // Set ultimate active
    this.isUltimateActive = true;

    // Emit ultimate started event
    this.eventBus.emit('ultimate:started', {
      characterId,
      move: ultimateMove,
      targetId,
    });

    // Voice line
    this.eventBus.emit('audio:voiceLine', {
      characterId,
      line: ultimateMove.voiceLine,
    });

    // Apply screen effects
    if (ultimateMove.effects.screenFlash) {
      this.eventBus.emit('screen:flash', {
        color: 0xffffff,
        intensity: 1.0,
        duration: 0.5,
      });
    }

    if (ultimateMove.effects.slowMotion) {
      this.eventBus.emit('time:slowMotion', {
        factor: 0.2,
        duration: ultimateMove.cinematicDuration * 0.6,
      });
    }

    if (ultimateMove.effects.screenShake) {
      this.eventBus.emit('screen:shake', {
        intensity: ultimateMove.effects.screenShake,
        duration: ultimateMove.cinematicDuration / 1000,
      });
    }

    if (ultimateMove.effects.chromaticAberration) {
      this.eventBus.emit('screen:chromaticAberration', {
        intensity: 0.1,
        duration: ultimateMove.cinematicDuration / 1000,
      });
    }

    // Apply damage after cinematic delay
    setTimeout(() => {
      this.eventBus.emit('character:hit', {
        attackerId: characterId,
        defenderId: targetId,
        damage: ultimateMove.damage,
        knockback: new THREE.Vector3(
          targetPosition.x > 0 ? 15 : -15,
          8,
          0
        ),
        hitPosition: targetPosition,
        isUltimate: true,
        moveName: ultimateMove.name,
      });

      // Second flash on impact
      this.eventBus.emit('screen:flash', {
        color: 0xffd700,
        intensity: 0.8,
        duration: 0.2,
      });
    }, ultimateMove.cinematicDuration * 0.4);

    // Ultimate complete
    setTimeout(() => {
      this.isUltimateActive = false;
      
      // Consume resonance
      this.eventBus.emit('resonance:consume', {
        characterId,
        amount: ultimateMove.resonanceRequired,
      });

      // Set cooldown (30 seconds)
      this.ultimateCooldowns.set(characterId, 30000);

      this.eventBus.emit('ultimate:completed', {
        characterId,
        move: ultimateMove,
      });
    }, ultimateMove.cinematicDuration);
  }

  /**
   * Handle character hit - update combo
   */
  private handleCharacterHit(data: {
    attackerId: string;
    defenderId: string;
    damage: number;
    moveName?: string;
    isUltimate?: boolean;
  }): void {
    const { attackerId, defenderId, damage, moveName, isUltimate } = data;

    // Get or create combo data
    let combo = this.combos.get(attackerId);
    const now = Date.now();

    if (!combo || now - combo.lastHitTime > this.comboDropTime) {
      // Start new combo
      combo = {
        characterId: attackerId,
        hits: 0,
        totalDamage: 0,
        moves: [],
        lastHitTime: now,
        isActive: true,
      };
    }

    // Update combo
    combo.hits++;
    combo.totalDamage += damage;
    combo.moves.push(moveName || 'Attack');
    combo.lastHitTime = now;

    this.combos.set(attackerId, combo);

    // Emit combo update
    this.eventBus.emit('combo:updated', {
      characterId: attackerId,
      hits: combo.hits,
      totalDamage: combo.totalDamage,
      scaling: this.getComboScaling(combo.hits),
    });

    // Check for combo milestones
    if (combo.hits === 5) {
      this.eventBus.emit('combo:milestone', { type: 'great', hits: 5 });
    } else if (combo.hits === 10) {
      this.eventBus.emit('combo:milestone', { type: 'mega', hits: 10 });
    } else if (combo.hits === 20) {
      this.eventBus.emit('combo:milestone', { type: 'legendary', hits: 20 });
    }

    // Ultimate hits always break combo scaling limits
    if (isUltimate) {
      this.eventBus.emit('combo:ultimate', {
        characterId: attackerId,
        moveName: moveName || 'Ultimate',
        damage,
      });
    }
  }

  /**
   * Update combat system (call in game loop)
   */
  public update(deltaTime: number): void {
    const now = Date.now();

    // Update attack durations
    this.activeAttacks.forEach((attack, id) => {
      attack.duration -= deltaTime * 1000;
      if (attack.duration <= 0) {
        this.activeAttacks.delete(id);
        this.eventBus.emit('attack:expired', { attackId: id });
      }
    });

    // Update combo timers
    this.combos.forEach((combo, characterId) => {
      if (combo.isActive && now - combo.lastHitTime > this.comboDropTime) {
        combo.isActive = false;
        this.eventBus.emit('combo:dropped', {
          characterId,
          finalHits: combo.hits,
          totalDamage: combo.totalDamage,
        });
        this.combos.delete(characterId);
      }
    });

    // Update ultimate cooldowns
    this.ultimateCooldowns.forEach((cooldown, characterId) => {
      const newCooldown = cooldown - deltaTime * 1000;
      if (newCooldown <= 0) {
        this.ultimateCooldowns.delete(characterId);
        this.eventBus.emit('ultimate:ready', { characterId });
      } else {
        this.ultimateCooldowns.set(characterId, newCooldown);
      }
    });
  }

  /**
   * Get base damage for move type
   */
  private getBaseDamage(moveType: MoveType): number {
    switch (moveType) {
      case MoveType.LIGHT: return 8;
      case MoveType.MEDIUM: return 15;
      case MoveType.HEAVY: return 25;
      case MoveType.SPECIAL: return 35;
      case MoveType.ULTIMATE: return 100;
      default: return 10;
    }
  }

  /**
   * Get knockback power for move type
   */
  private getKnockbackPower(moveType: MoveType, tier: TransformationTier): number {
    const base = {
      [MoveType.LIGHT]: 3,
      [MoveType.MEDIUM]: 6,
      [MoveType.HEAVY]: 10,
      [MoveType.SPECIAL]: 12,
      [MoveType.ULTIMATE]: 20,
    }[moveType] || 5;

    return base * (1 + tier * 0.2);
  }

  /**
   * Get hit-stop frames for move type
   */
  private getHitStopFrames(moveType: MoveType): number {
    switch (moveType) {
      case MoveType.LIGHT: return 3;
      case MoveType.MEDIUM: return 5;
      case MoveType.HEAVY: return 8;
      case MoveType.SPECIAL: return 10;
      case MoveType.ULTIMATE: return 30;
      default: return 5;
    }
  }

  /**
   * Get attack radius for move type
   */
  private getAttackRadius(moveType: MoveType): number {
    switch (moveType) {
      case MoveType.LIGHT: return 0.6;
      case MoveType.MEDIUM: return 0.8;
      case MoveType.HEAVY: return 1.0;
      case MoveType.SPECIAL: return 1.2;
      case MoveType.ULTIMATE: return 2.0;
      default: return 0.8;
    }
  }

  /**
   * Get attack duration for move type (in ms)
   */
  private getAttackDuration(moveType: MoveType): number {
    switch (moveType) {
      case MoveType.LIGHT: return 150;
      case MoveType.MEDIUM: return 250;
      case MoveType.HEAVY: return 400;
      case MoveType.SPECIAL: return 500;
      case MoveType.ULTIMATE: return 1000;
      default: return 200;
    }
  }

  /**
   * Get combo scaling multiplier
   */
  private getComboScaling(hits: number): number {
    if (hits >= 10) return COMBO_SCALING[10];
    return COMBO_SCALING[hits] || 1.0;
  }

  /**
   * Check if ultimate is available for character
   */
  public isUltimateAvailable(characterId: string, resonance: number): boolean {
    const ultimateMove = ULTIMATE_MOVES[characterId];
    if (!ultimateMove) return false;

    const cooldown = this.ultimateCooldowns.get(characterId) || 0;
    return cooldown <= 0 && resonance >= ultimateMove.resonanceRequired;
  }

  /**
   * Get ultimate move for character
   */
  public getUltimateMove(characterId: string): UltimateMove | null {
    return ULTIMATE_MOVES[characterId] || null;
  }

  /**
   * Get current combo for character
   */
  public getCurrentCombo(characterId: string): ComboData | null {
    return this.combos.get(characterId) || null;
  }

  /**
   * Check if ultimate is currently playing
   */
  public isUltimatePlaying(): boolean {
    return this.isUltimateActive;
  }

  /**
   * Cleanup
   */
  public dispose(): void {
    this.activeAttacks.clear();
    this.combos.clear();
    this.ultimateCooldowns.clear();
    this.isUltimateActive = false;
  }
}

export default UltimateCombatSystem;

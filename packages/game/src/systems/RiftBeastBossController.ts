/**
 * 🏛️ RIFT BEAST BOSS CONTROLLER
 * 3-Phase Boss Logic (66% / 33% Thresholds)
 * Part of PROJECT OMEGA: AETERNA COVENANT v1.3
 */

import { EventBus } from '../core/EventBus';

export type BossPhase = 'P1' | 'P2' | 'P3';

export interface BossConfig {
  id: string;
  name: string;
  hpMax: number;
  p2Threshold: number; // HP percentage to trigger Phase 2 (default: 0.66)
  p3Threshold: number; // HP percentage to trigger Phase 3 (default: 0.33)
  attackPatterns: {
    P1: string[];
    P2: string[];
    P3: string[];
  };
  phaseTransitionInvincibilityFrames?: number; // Invincibility during phase transition
}

export interface BossState {
  id: string;
  name: string;
  hp: number;
  hpMax: number;
  phase: BossPhase;
  isInvincible: boolean;
  invincibilityTimer: number;
  currentAttackPattern: string[];
  attackIndex: number;
  attackTimer: number;
  isDefeated: boolean;
}

/**
 * RiftBeastBossController
 * 
 * Manages 3-phase boss fights with automatic phase transitions at HP thresholds.
 * 
 * Features:
 * - Automatic phase transitions at 66% and 33% HP
 * - Invincibility frames during phase transitions
 * - Attack pattern rotation per phase
 * - EventBus integration for UI/VFX updates
 * 
 * Usage:
 * ```ts
 * const boss = new RiftBeastBossController(config, eventBus);
 * boss.applyDamage(25); // Applies damage and checks for phase transition
 * boss.update(deltaTime); // Updates attack timers
 * ```
 */
export class RiftBeastBossController {
  private state: BossState;
  private config: BossConfig;
  private eventBus: EventBus<any>;

  constructor(config: BossConfig, eventBus: EventBus<any>) {
    this.config = {
      ...config,
      p2Threshold: config.p2Threshold ?? 0.66,
      p3Threshold: config.p3Threshold ?? 0.33,
      phaseTransitionInvincibilityFrames: config.phaseTransitionInvincibilityFrames ?? 120, // 2 seconds at 60fps
    };

    this.state = {
      id: config.id,
      name: config.name,
      hp: config.hpMax,
      hpMax: config.hpMax,
      phase: 'P1',
      isInvincible: false,
      invincibilityTimer: 0,
      currentAttackPattern: config.attackPatterns.P1,
      attackIndex: 0,
      attackTimer: 0,
      isDefeated: false,
    };

    this.eventBus = eventBus;
  }

  /**
   * Apply damage to the boss and check for phase transitions
   */
  public applyDamage(amount: number): void {
    if (this.state.isInvincible || this.state.isDefeated) {
      return;
    }

    const previousHp = this.state.hp;
    this.state.hp = Math.max(0, this.state.hp - amount);

    const hpPercentage = this.state.hp / this.state.hpMax;

    // Emit damage event
    this.eventBus.emit('boss:damage_taken', {
      bossId: this.state.id,
      damage: amount,
      currentHp: this.state.hp,
      hpPercentage,
    });

    // Check for phase transitions
    if (this.state.phase === 'P1' && hpPercentage <= this.config.p2Threshold) {
      this.transitionToPhase('P2');
    } else if (this.state.phase === 'P2' && hpPercentage <= this.config.p3Threshold) {
      this.transitionToPhase('P3');
    }

    // Check for defeat
    if (this.state.hp === 0) {
      this.onDefeat();
    }
  }

  /**
   * Transition to a new phase
   */
  private transitionToPhase(newPhase: BossPhase): void {
    const oldPhase = this.state.phase;
    this.state.phase = newPhase;

    // Enable invincibility during phase transition
    this.state.isInvincible = true;
    this.state.invincibilityTimer = this.config.phaseTransitionInvincibilityFrames!;

    // Update attack pattern for new phase
    this.state.currentAttackPattern = this.config.attackPatterns[newPhase];
    this.state.attackIndex = 0;
    this.state.attackTimer = 0;

    // Emit phase change event
    this.eventBus.emit('boss:phase_changed', {
      bossId: this.state.id,
      oldPhase,
      newPhase,
      currentHp: this.state.hp,
      hpPercentage: this.state.hp / this.state.hpMax,
    });

    console.log(`[BOSS] ${this.state.name} transitioned: ${oldPhase} → ${newPhase}`);
  }

  /**
   * Handle boss defeat
   */
  private onDefeat(): void {
    this.state.isDefeated = true;
    this.state.isInvincible = true;

    this.eventBus.emit('boss:defeated', {
      bossId: this.state.id,
      bossName: this.state.name,
      finalPhase: this.state.phase,
    });

    console.log(`[BOSS] ${this.state.name} DEFEATED!`);
  }

  /**
   * Update boss timers and attack logic
   */
  public update(deltaTime: number): void {
    if (this.state.isDefeated) {
      return;
    }

    // Decrement invincibility timer
    if (this.state.isInvincible && this.state.invincibilityTimer > 0) {
      this.state.invincibilityTimer -= deltaTime * 60; // Convert to frames (assuming 60fps)
      if (this.state.invincibilityTimer <= 0) {
        this.state.isInvincible = false;
        this.eventBus.emit('boss:invincibility_ended', { bossId: this.state.id });
      }
    }

    // Update attack timer (placeholder for attack pattern rotation)
    if (!this.state.isInvincible && this.state.attackTimer > 0) {
      this.state.attackTimer -= deltaTime;
      if (this.state.attackTimer <= 0) {
        this.executeNextAttack();
      }
    }
  }

  /**
   * Execute the next attack in the current phase's pattern
   */
  private executeNextAttack(): void {
    const attack = this.state.currentAttackPattern[this.state.attackIndex];

    this.eventBus.emit('boss:attack_executed', {
      bossId: this.state.id,
      attackName: attack,
      phase: this.state.phase,
    });

    // Rotate to next attack
    this.state.attackIndex = (this.state.attackIndex + 1) % this.state.currentAttackPattern.length;

    // Set timer for next attack (2-4 seconds based on phase)
    const baseDelay = 2.0;
    const phaseMultiplier = this.state.phase === 'P3' ? 0.5 : this.state.phase === 'P2' ? 0.75 : 1.0;
    this.state.attackTimer = baseDelay * phaseMultiplier;
  }

  /**
   * Heal the boss (for testing or special mechanics)
   */
  public heal(amount: number): void {
    if (this.state.isDefeated) {
      return;
    }

    this.state.hp = Math.min(this.state.hpMax, this.state.hp + amount);

    this.eventBus.emit('boss:healed', {
      bossId: this.state.id,
      healAmount: amount,
      currentHp: this.state.hp,
    });
  }

  /**
   * Force a specific phase (for testing)
   */
  public forcePhase(phase: BossPhase): void {
    this.transitionToPhase(phase);
  }

  /**
   * Get current boss state (read-only)
   */
  public getState(): Readonly<BossState> {
    return { ...this.state };
  }

  /**
   * Reset boss to initial state
   */
  public reset(): void {
    this.state.hp = this.state.hpMax;
    this.state.phase = 'P1';
    this.state.isInvincible = false;
    this.state.invincibilityTimer = 0;
    this.state.currentAttackPattern = this.config.attackPatterns.P1;
    this.state.attackIndex = 0;
    this.state.attackTimer = 0;
    this.state.isDefeated = false;

    this.eventBus.emit('boss:reset', { bossId: this.state.id });
  }

  /**
   * Check if boss is in a specific phase
   */
  public isInPhase(phase: BossPhase): boolean {
    return this.state.phase === phase;
  }

  /**
   * Get HP percentage (0-1)
   */
  public getHpPercentage(): number {
    return this.state.hp / this.state.hpMax;
  }

  /**
   * Start the boss fight (begins attack pattern rotation)
   */
  public startFight(): void {
    this.state.attackTimer = 2.0; // Start first attack in 2 seconds
    this.eventBus.emit('boss:fight_started', { bossId: this.state.id });
  }
}

/**
 * Factory function to create common boss configurations
 */
export const BossPresets = {
  /**
   * Chronos Sere (Will of Tomorrow) - Final Boss Book 3
   */
  chronosSere: (): BossConfig => ({
    id: 'CHRONOS_SERE',
    name: 'Chronos Sere',
    hpMax: 1000,
    p2Threshold: 0.66,
    p3Threshold: 0.33,
    attackPatterns: {
      P1: ['temporal_slash', 'time_warp', 'echo_strike'],
      P2: ['temporal_slash', 'time_warp', 'echo_strike', 'phase_shift', 'chrono_cage'],
      P3: ['temporal_barrage', 'time_collapse', 'reality_fracture', 'omnipresent_strike'],
    },
    phaseTransitionInvincibilityFrames: 180, // 3 seconds
  }),

  /**
   * Verdant Talon (Lupine Knight) - Book 1 Boss
   */
  verdantTalon: (): BossConfig => ({
    id: 'VERDANT_TALON',
    name: 'Verdant Talon',
    hpMax: 600,
    p2Threshold: 0.66,
    p3Threshold: 0.33,
    attackPatterns: {
      P1: ['shard_slash', 'forest_bind', 'leaf_storm'],
      P2: ['shard_slash', 'forest_bind', 'leaf_storm', 'nature_wrath', 'thorn_barrier'],
      P3: ['verdant_fury', 'gaia_strike', 'primal_roar', 'omega_slash'],
    },
    phaseTransitionInvincibilityFrames: 120,
  }),

  /**
   * Void-Blade Wraith (Meta Knight) - Book 2 Boss
   */
  voidBladeWraith: (): BossConfig => ({
    id: 'VOID_BLADE',
    name: 'Void-Blade Wraith',
    hpMax: 700,
    p2Threshold: 0.66,
    p3Threshold: 0.33,
    attackPatterns: {
      P1: ['dimensional_slash', 'tornado', 'drill_rush'],
      P2: ['dimensional_slash', 'tornado', 'drill_rush', 'mach_tornado', 'shuttle_loop'],
      P3: ['darkness_illusion', 'void_rend', 'galaxia_darkness', 'meta_quick'],
    },
    phaseTransitionInvincibilityFrames: 120,
  }),

  /**
   * Generic Rift Beast (Template)
   */
  riftBeast: (customName: string, hpMax: number): BossConfig => ({
    id: `RIFT_BEAST_${customName.toUpperCase().replace(/\s/g, '_')}`,
    name: customName,
    hpMax,
    p2Threshold: 0.66,
    p3Threshold: 0.33,
    attackPatterns: {
      P1: ['swipe', 'roar', 'charge'],
      P2: ['swipe', 'roar', 'charge', 'ground_slam', 'tail_whip'],
      P3: ['berserk_swipe', 'rift_roar', 'void_charge', 'reality_tear'],
    },
    phaseTransitionInvincibilityFrames: 120,
  }),
};

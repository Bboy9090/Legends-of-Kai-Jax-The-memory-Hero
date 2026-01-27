/**
 * Quill Trial Implementation
 * 
 * First Legend Node trial that unlocks Tail 4 (Quill).
 * Teaches precision, posture breaking, and defensive mastery.
 * 
 * State Machine: SETUP → ACTIVE → VICTORY/FAILURE → COMPLETE
 */

import { LegendNode } from '../progression/LegendNodeTypes';
import { LegendNodeManager } from '../progression/LegendNodeManager';

export enum TrialState {
  SETUP = 'SETUP',
  ACTIVE = 'ACTIVE',
  VICTORY = 'VICTORY',
  FAILURE = 'FAILURE',
  COMPLETE = 'COMPLETE',
}

export interface TrialStats {
  perfectDodges: number;
  postureBreaks: number;
  damageTaken: number;
  maxHealth: number;
  enemiesDefeated: number;
  startTime: number;
  elapsedTime: number;
}

export class QuillTrial {
  private state: TrialState = TrialState.SETUP;
  private stats: TrialStats;
  private node: LegendNode;
  private manager: LegendNodeManager;
  private arenaLocked: boolean = false;
  private consecutiveDodgeFrames: number = 0;
  private lastDamageTime: number = 0;
  
  // Victory condition thresholds from node data
  private readonly PERFECT_DODGE_FRAMES_REQUIRED = 15; // ~0.25 seconds at 60fps

  constructor(node: LegendNode, manager: LegendNodeManager) {
    this.node = node;
    this.manager = manager;
    
    this.stats = {
      perfectDodges: 0,
      postureBreaks: 0,
      damageTaken: 0,
      maxHealth: 100, // Default max health
      enemiesDefeated: 0,
      startTime: 0,
      elapsedTime: 0,
    };
  }

  /**
   * Initialize the trial
   */
  start(playerMaxHealth: number): void {
    if (this.state !== TrialState.SETUP) {
      throw new Error('Trial can only be started from SETUP state');
    }

    this.stats.maxHealth = playerMaxHealth;
    this.stats.startTime = Date.now();
    this.state = TrialState.ACTIVE;
  }

  /**
   * Update trial state each frame
   */
  update(deltaTime: number): void {
    if (this.state !== TrialState.ACTIVE) {
      return;
    }

    this.stats.elapsedTime += deltaTime;

    // Check victory conditions
    if (this.checkVictoryConditions()) {
      this.handleVictory();
    }

    // Check failure conditions
    if (this.checkFailureConditions()) {
      this.handleFailure();
    }
  }

  /**
   * Record a dodge action
   */
  onDodge(): void {
    if (this.state !== TrialState.ACTIVE) {
      return;
    }

    this.consecutiveDodgeFrames = 0;
    this.lastDamageTime = Date.now();
  }

  /**
   * Update dodge state each frame (no damage taken)
   */
  onDodgeFrame(): void {
    if (this.state !== TrialState.ACTIVE) {
      return;
    }

    const timeSinceLastDamage = Date.now() - this.lastDamageTime;
    
    // Only count frames after initial dodge if no damage taken
    if (timeSinceLastDamage > 100) { // Grace period after damage
      this.consecutiveDodgeFrames++;
      
      // Register perfect dodge when threshold reached
      if (this.consecutiveDodgeFrames === this.PERFECT_DODGE_FRAMES_REQUIRED) {
        this.stats.perfectDodges++;
        this.consecutiveDodgeFrames = 0;
      }
    }
  }

  /**
   * Record damage taken
   */
  onDamageTaken(amount: number): void {
    if (this.state !== TrialState.ACTIVE) {
      return;
    }

    this.stats.damageTaken += amount;
    this.consecutiveDodgeFrames = 0;
    this.lastDamageTime = Date.now();
  }

  /**
   * Record a posture break
   */
  onPostureBreak(): void {
    if (this.state !== TrialState.ACTIVE) {
      return;
    }

    this.stats.postureBreaks++;
  }

  /**
   * Record enemy defeated
   */
  onEnemyDefeated(): void {
    if (this.state !== TrialState.ACTIVE) {
      return;
    }

    this.stats.enemiesDefeated++;
  }

  /**
   * Check if victory conditions are met
   */
  private checkVictoryConditions(): boolean {
    const vc = this.node.victory_conditions;
    
    // Check perfect dodges
    if (vc.perfect_dodges_required && this.stats.perfectDodges < vc.perfect_dodges_required) {
      return false;
    }

    // Check posture breaks
    if (vc.posture_breaks_required && this.stats.postureBreaks < vc.posture_breaks_required) {
      return false;
    }

    // Check enemies defeated
    if (vc.enemies_defeated_required && this.stats.enemiesDefeated < vc.enemies_defeated_required) {
      return false;
    }

    // Check damage threshold (must be under threshold)
    if (vc.damage_taken_threshold !== undefined) {
      const damagePercent = this.stats.damageTaken / this.stats.maxHealth;
      if (damagePercent > vc.damage_taken_threshold) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if failure conditions are met
   */
  private checkFailureConditions(): boolean {
    const fc = this.node.failure_conditions;
    
    // Check health depleted
    if (fc.health_depleted) {
      const currentHealth = this.stats.maxHealth - this.stats.damageTaken;
      if (currentHealth <= 0) {
        return true;
      }
    }

    // Check excessive damage taken
    if (fc.excessive_damage_taken && this.node.victory_conditions.damage_taken_threshold !== undefined) {
      const damagePercent = this.stats.damageTaken / this.stats.maxHealth;
      if (damagePercent > this.node.victory_conditions.damage_taken_threshold) {
        return true;
      }
    }

    return false;
  }

  /**
   * Handle victory - lock arena, grant tail, mark complete
   */
  private handleVictory(): void {
    this.state = TrialState.VICTORY;
    
    // Lock the arena
    this.arenaLocked = true;
    
    // Grant Tail 4 (Quill) and combat unlocks via manager
    this.manager.completeNode(this.node.node_id);
    
    // Transition to complete
    this.state = TrialState.COMPLETE;
  }

  /**
   * Handle failure - provide diegetic feedback
   */
  private handleFailure(): void {
    this.state = TrialState.FAILURE;
    
    // Diegetic feedback (no UI)
    // - Camera tightens (handled by renderer)
    // - Sound dampens (handled by audio system)
    // - Quill shadows flicker on spine and fade (handled by character renderer)
    
    // Output message
    console.log('You flinch. The world does not.');
  }

  /**
   * Allow retry after failure
   */
  retry(): void {
    if (this.state !== TrialState.FAILURE) {
      throw new Error('Can only retry from FAILURE state');
    }

    // Reset stats
    this.stats = {
      perfectDodges: 0,
      postureBreaks: 0,
      damageTaken: 0,
      maxHealth: this.stats.maxHealth,
      enemiesDefeated: 0,
      startTime: Date.now(),
      elapsedTime: 0,
    };

    this.consecutiveDodgeFrames = 0;
    this.lastDamageTime = 0;
    this.state = TrialState.ACTIVE;
  }

  /**
   * Get current state
   */
  getState(): TrialState {
    return this.state;
  }

  /**
   * Get current stats
   */
  getStats(): Readonly<TrialStats> {
    return { ...this.stats };
  }

  /**
   * Check if arena is locked
   */
  isArenaLocked(): boolean {
    return this.arenaLocked;
  }

  /**
   * Get the node this trial is based on
   */
  getNode(): LegendNode {
    return this.node;
  }

  /**
   * Get reward information
   */
  getReward(): {
    tail: string;
    visualChange: string;
    combatUnlocks: string[];
  } {
    return {
      tail: this.node.reward.tail,
      visualChange: this.node.reward.visual_change,
      combatUnlocks: this.node.reward.combat_unlocks,
    };
  }
}

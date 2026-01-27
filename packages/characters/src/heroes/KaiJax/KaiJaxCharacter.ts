/**
 * AUTHORITATIVE: Kai-Jax Character Implementation
 * 
 * Based on kai_jax.character.json (LOCKFILE - Single Source of Truth)
 * 
 * Kai-Jax: The Memory Hero
 * - Species: Wolf/Fox/Hedgehog/Spider hybrid
 * - 9 Tails with independent roles
 * - Stance-shifting battlefield controller
 * - Scales from 1v1 to 1v20+ without rule changes
 * 
 * Design Philosophy:
 * - Mass, inertia, and recovery matter
 * - No mascot proportions
 * - No floaty animation
 * - Combat must feel dangerous even at idle
 */

import { BaseFighter } from '../../base/BaseFighter';
import { FighterStats, FighterState, MoveSet } from '@beast-kin/shared';
import {
  TailRole,
  TailSystem,
  TailData,
  KaiJaxStance,
  KaiJaxCombatStats,
} from './KaiJaxTypes';
import { createKaiJaxMoveSet } from './KaiJaxMoves';

export class KaiJaxCharacter extends BaseFighter {
  // Extended Kai-Jax specific properties
  public tailSystem: TailSystem;
  public combatStats: KaiJaxCombatStats;
  
  // Legend Node progression tracking (from kai_jax.character.json)
  public currentTailCount: number = 3; // Start with 3 tails (IMMUTABLE from canon)
  public unlockedTails: Set<string> = new Set(['bond', 'hunter', 'thread']); // Starting tails
  
  constructor() {
    super('kai_jax', 'Kai-Jax');
    
    // Initialize 9-tail system according to JSON spec
    this.tailSystem = this.initializeTailSystem();
    
    // Initialize combat stats
    this.combatStats = {
      postureHealth: 100,
      corruptionLevel: 0,
      zoneControl: 5.0, // meters
      crowdControlActive: false,
      currentStance: KaiJaxStance.NEUTRAL,
    };
  }
  
  /**
   * Initialize the 9-tail system according to kai_jax.character.json
   */
  private initializeTailSystem(): TailSystem {
    const tails: TailData[] = [
      {
        index: 1,
        role: TailRole.BOND,
        function: 'parry_counter_revive',
        bonesPerTail: 6,
        physicsEnabled: true,
        constraints: {
          swingLimit: 120,
          twistLimit: 45,
          noodlePhysics: false, // Enforced by spec
        },
      },
      {
        index: 2,
        role: TailRole.HUNTER,
        function: 'dash_pursuit_execute',
        bonesPerTail: 7,
        physicsEnabled: true,
        constraints: {
          swingLimit: 150,
          twistLimit: 60,
          noodlePhysics: false,
        },
      },
      {
        index: 3,
        role: TailRole.THREAD,
        function: 'web_pull_group',
        bonesPerTail: 7,
        physicsEnabled: true,
        constraints: {
          swingLimit: 180,
          twistLimit: 90,
          noodlePhysics: false,
        },
      },
      {
        index: 4,
        role: TailRole.QUILL,
        function: 'retaliation_posture_damage',
        bonesPerTail: 5,
        physicsEnabled: true,
        constraints: {
          swingLimit: 90,
          twistLimit: 30,
          noodlePhysics: false,
        },
      },
      {
        index: 5,
        role: TailRole.SHADE,
        function: 'stealth_threat_reset',
        bonesPerTail: 6,
        physicsEnabled: true,
        constraints: {
          swingLimit: 135,
          twistLimit: 45,
          noodlePhysics: false,
        },
      },
      {
        index: 6,
        role: TailRole.ANCHOR,
        function: 'anti_knockback_root',
        bonesPerTail: 5,
        physicsEnabled: true,
        constraints: {
          swingLimit: 60,
          twistLimit: 20,
          noodlePhysics: false,
        },
      },
      {
        index: 7,
        role: TailRole.ECHO,
        function: 'after_image_repeat',
        bonesPerTail: 7,
        physicsEnabled: true,
        constraints: {
          swingLimit: 160,
          twistLimit: 75,
          noodlePhysics: false,
        },
      },
      {
        index: 8,
        role: TailRole.RIFT,
        function: 'reality_tear_aoe',
        bonesPerTail: 6,
        physicsEnabled: true,
        constraints: {
          swingLimit: 120,
          twistLimit: 60,
          noodlePhysics: false,
        },
      },
      {
        index: 9,
        role: TailRole.CROWN,
        function: 'aura_command',
        bonesPerTail: 6,
        physicsEnabled: true,
        constraints: {
          swingLimit: 90,
          twistLimit: 30,
          noodlePhysics: false,
        },
      },
    ];
    
    return {
      tails,
      activeTail: null,
      comboState: {
        activeTails: [],
        synergy: 0,
      },
    };
  }
  
  /**
   * Get default stats according to kai_jax.character.json
   * - Height multiplier: 1.15
   * - Build: Athletic sinewy predator
   * - Weight: Medium-heavy for crowd control
   */
  protected getDefaultStats(): FighterStats {
    return {
      id: 'kai_jax',
      
      // Base stats - tuned for battlefield control
      weight: 95, // Medium-heavy (affects knockback resistance)
      walkSpeed: 1.15,
      runSpeed: 1.75,
      airSpeed: 1.05,
      jumpHeight: 13.5,
      airJumps: 1,
      fallSpeed: 1.65,
      fastFallSpeed: 2.5,
      
      // Combat stats
      maxDamage: 999, // Resonance percentage
      currentDamage: 0,
      damage: 0,
      hitstun: 0,
      lives: 3,
      ultimateMeter: 0,
      ultimateCost: 100,
      
      // Physics
      velocity: { x: 0, y: 0 },
    };
  }
  
  /**
   * Create move set with updated 9-tail system
   */
  protected createMoveSet(): MoveSet {
    const moves = createKaiJaxMoveSet();
    
    // Convert KaiJaxMove map to MoveSet structure
    const attacks = new Map<string, any>();
    const specialMoves = new Map<string, any>();
    const aerialMoves = new Map<string, any>();
    const grabs = new Map<string, any>();
    
    moves.forEach((move, key) => {
      if (move.type === 'normal' || move.type === 'tilt' || move.type === 'smash') {
        attacks.set(key, move);
      } else if (move.type === 'special') {
        specialMoves.set(key, move);
      } else if (move.type === 'aerial') {
        aerialMoves.set(key, move);
      }
    });
    
    return {
      attacks,
      specialMoves,
      aerialMoves,
      grabs,
    };
  }
  
  /**
   * Setup state machine transitions
   * Following animation philosophy: mass_and_inertia, min 12 frames per action
   */
  protected setupStateMachine(): void {
    // State transitions are handled by the base StateMachine
    // Kai-Jax specific: Enforce minimum 12 frames per action
    // Cancel rules: hit_confirm_or_perfect_parry_only
  }
  
  /**
   * Update method with Kai-Jax specific logic
   */
  update(deltaTime: number): void {
    super.update(deltaTime);
    
    // Update combat stats
    this.updateCombatStats(deltaTime);
    
    // Update tail system physics
    this.updateTailSystem(deltaTime);
    
    // Update stance based on combat state
    this.updateStance();
  }
  
  /**
   * Update Kai-Jax specific combat stats
   */
  private updateCombatStats(deltaTime: number): void {
    // Regenerate posture health slowly when not in combat
    if (this.state === FighterState.IDLE) {
      this.combatStats.postureHealth = Math.min(
        100,
        this.combatStats.postureHealth + (5 * deltaTime)
      );
    }
    
    // Reduce corruption over time
    this.combatStats.corruptionLevel = Math.max(
      0,
      this.combatStats.corruptionLevel - (2 * deltaTime)
    );
    
    // Check for overextension weakness
    if (this.combatStats.corruptionLevel > 80) {
      // Trigger weakness: reduced damage output
      // This is the "corruption_overuse" weakness from JSON
    }
  }
  
  /**
   * Update tail system physics and synergy
   */
  private updateTailSystem(deltaTime: number): void {
    // Physics for tails handled by engine
    // Update synergy based on active tail combinations
    
    if (this.tailSystem.comboState.activeTails.length > 1) {
      // Multi-tail synergy bonus
      this.tailSystem.comboState.synergy = this.tailSystem.comboState.activeTails.length * 10;
    } else {
      this.tailSystem.comboState.synergy = 0;
    }
  }
  
  /**
   * Update stance based on combat situation
   */
  private updateStance(): void {
    // Stance logic based on current state and stats
    if (this.combatStats.crowdControlActive) {
      this.combatStats.currentStance = KaiJaxStance.DOMINANT;
    } else if (this.combatStats.postureHealth < 30) {
      this.combatStats.currentStance = KaiJaxStance.DEFENSIVE;
    } else if (this.stats.currentDamage > 100) {
      this.combatStats.currentStance = KaiJaxStance.AGGRESSIVE;
    } else {
      this.combatStats.currentStance = KaiJaxStance.NEUTRAL;
    }
  }
  
  /**
   * Activate specific tail ability
   */
  public activateTail(role: TailRole): void {
    this.tailSystem.activeTail = role;
    
    // Add to combo state if not already active
    if (!this.tailSystem.comboState.activeTails.includes(role)) {
      this.tailSystem.comboState.activeTails.push(role);
    }
  }
  
  /**
   * Deactivate tail ability
   */
  public deactivateTail(role: TailRole): void {
    if (this.tailSystem.activeTail === role) {
      this.tailSystem.activeTail = null;
    }
    
    // Remove from combo state
    this.tailSystem.comboState.activeTails = 
      this.tailSystem.comboState.activeTails.filter(t => t !== role);
  }
  
  /**
   * Crowd control ability - scales from 1v1 to 1v20+
   */
  public activateCrowdControl(): void {
    this.combatStats.crowdControlActive = true;
    this.combatStats.zoneControl = 8.0; // Expanded zone
  }
  
  /**
   * Break posture (deals with posture_break strength)
   */
  public breakPosture(target: { postureHealth?: number }): boolean {
    if (target.postureHealth !== undefined && target.postureHealth <= 0) {
      return true;
    }
    return false;
  }
  
  /**
   * Take posture damage (from QUILL tail or enemy attacks)
   */
  public takePostureDamage(damage: number): void {
    this.combatStats.postureHealth = Math.max(
      0,
      this.combatStats.postureHealth - damage
    );
  }
  
  /**
   * Increase corruption (from ability overuse)
   */
  public increaseCorruption(amount: number): void {
    this.combatStats.corruptionLevel = Math.min(
      100,
      this.combatStats.corruptionLevel + amount
    );
  }
  
  /**
   * Unlock a new tail (called by Legend Node completion)
   * Enforces: tail count never exceeds 9, cannot decrease
   */
  public unlockTail(tailName: string, tailNumber: number): void {
    if (this.unlockedTails.has(tailName)) {
      throw new Error(`Tail "${tailName}" is already unlocked`);
    }

    if (tailNumber <= this.currentTailCount) {
      throw new Error(`Cannot unlock tail ${tailNumber}: must unlock sequentially`);
    }

    if (tailNumber > 9) {
      throw new Error('Tail count cannot exceed 9');
    }

    this.unlockedTails.add(tailName);
    this.currentTailCount = tailNumber;
  }

  /**
   * Get current tail count
   */
  public getCurrentTailCount(): number {
    return this.currentTailCount;
  }

  /**
   * Get unlocked tails
   */
  public getUnlockedTails(): Set<string> {
    return new Set(this.unlockedTails);
  }

  /**
   * Check if a specific tail is unlocked
   */
  public isTailUnlocked(tailName: string): boolean {
    return this.unlockedTails.has(tailName);
  }
  
  /**
   * Reset character to initial state
   */
  reset(): void {
    super.reset();
    
    this.combatStats = {
      postureHealth: 100,
      corruptionLevel: 0,
      zoneControl: 5.0,
      crowdControlActive: false,
      currentStance: KaiJaxStance.NEUTRAL,
    };
    
    this.tailSystem.activeTail = null;
    this.tailSystem.comboState = {
      activeTails: [],
      synergy: 0,
    };
    
    // Reset tail progression
    this.currentTailCount = 3;
    this.unlockedTails = new Set(['bond', 'hunter', 'thread']);
  }
}

/**
 * Factory function to create Kai-Jax character instance
 */
export function createKaiJax(): KaiJaxCharacter {
  return new KaiJaxCharacter();
}

/**
 * Character data export for registry
 */
export const KAI_JAX_CONFIG = {
  id: 'kai_jax',
  characterId: 'kai_jax',
  displayName: 'Kai-Jax',
  title: 'The Memory Hero',
  version: '1.0.0',
  
  // Anatomical spec
  anatomy: {
    speciesComposite: ['wolf', 'fox', 'hedgehog', 'spider'],
    bodyType: 'humanoid_beast',
    heightMultiplier: 1.15,
    build: 'athletic_sinewy_predator',
    legs: 'digitigrade',
    hands: 'clawed_tool_capable',
    head: 'wolf_fox_hybrid_muzzle',
    spine: 'reinforced_with_ridge',
    tailCount: 9,
  },
  
  // Combat identity
  combatIdentity: {
    role: 'stance_shifting_battlefield_controller',
    scalesFrom: '1v1',
    scalesTo: '1v20_plus',
    strengths: ['crowd_control', 'posture_break', 'zone_dominance'],
    weaknesses: ['overextension', 'corruption_overuse'],
  },
  
  // Material specs for rendering
  materials: {
    fur: {
      type: 'card_or_shell',
      pbr: true,
      maps: ['albedo', 'normal', 'roughness'],
    },
    armor: {
      material: 'worn_foundry_steel',
      roughnessRange: [0.4, 0.6],
      edgeWear: true,
    },
  },
  
  // LOD targets
  lodTargets: {
    lod0: { triangles: [80000, 120000] },
    lod1: { triangles: [50000, 70000] },
    lod2: { triangles: [25000, 35000] },
  },
  
  // Animation philosophy
  animation: {
    philosophy: 'mass_and_inertia',
    noFloatyMotion: true,
    minFramesPerAction: 12,
    cancelRules: 'hit_confirm_or_perfect_parry_only',
  },
};

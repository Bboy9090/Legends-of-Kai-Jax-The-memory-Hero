/**
 * Blackreach Descent Scenario
 * 30-minute vertical slice showcasing Tail 4→5 progression.
 * 
 * Mission Flow:
 * 1. Stealth exploration (8 min) - Navigate floodlit passages
 * 2. Hybrid combat (10 min) - 4 waves, max 10 enemies
 * 3. Elite duel (7 min) - Shade Warden boss
 * 4. Legend Node (5 min) - Shade Trial
 */

import * as fs from 'fs';
import * as path from 'path';
import { BiomeManager } from '../world/BiomeManager';
import { LegendNodeManager, PlayerProgressionState } from '../progression/LegendNodeManager';
import { WorldStateManager } from '../world/WorldState';

/**
 * Mission phase definition
 */
export interface MissionPhase {
  phase: number;
  type: 'stealth_exploration' | 'hybrid_combat' | 'elite_duel' | 'legend_node';
  objective: string;
  mechanics: string[];
  duration_minutes: number;
  enemy_waves?: number;
  max_enemies_simultaneous?: number;
  boss_name?: string;
  legend_node_id?: string;
}

/**
 * Vertical slice definition
 */
export interface VerticalSlice {
  slice_id: string;
  name: string;
  description: string;
  playtime_target_minutes: number;
  player_state: {
    starting_tails: number;
    abilities_locked: string[];
  };
  zone: {
    name: string;
    biome: string;
    verticality: string;
    streaming_chunks: boolean;
  };
  mission_flow: MissionPhase[];
  end_state: {
    tail_unlocked: number;
    world_state_updated: boolean;
    narrative_beat: string;
  };
}

/**
 * Scenario state
 */
export interface ScenarioState {
  current_phase: number;
  completed_phases: number[];
  phase_start_time: number;
  total_elapsed_minutes: number;
  stealth_detection_count: number;
  enemies_defeated: number;
  stealth_kills: number;
}

/**
 * BlackreachDescent class
 * Implements the Blackreach Descent vertical slice.
 */
export class BlackreachDescent {
  private slicePath: string;
  private sliceData: VerticalSlice;
  private biomeManager: BiomeManager;
  private legendNodeManager: LegendNodeManager;
  private worldStateManager: WorldStateManager;
  private scenarioState: ScenarioState;

  constructor(
    worldStateManager: WorldStateManager,
    slicePath: string = '../../../data/vertical_slices/blackreach_descent.slice.json'
  ) {
    this.slicePath = path.resolve(__dirname, slicePath);
    this.sliceData = this.loadSlice();
    this.biomeManager = new BiomeManager();
    this.legendNodeManager = new LegendNodeManager();
    this.worldStateManager = worldStateManager;
    this.scenarioState = {
      current_phase: 1,
      completed_phases: [],
      phase_start_time: Date.now(),
      total_elapsed_minutes: 0,
      stealth_detection_count: 0,
      enemies_defeated: 0,
      stealth_kills: 0
    };
  }

  /**
   * Load vertical slice data
   */
  private loadSlice(): VerticalSlice {
    try {
      const data = fs.readFileSync(this.slicePath, 'utf-8');
      return JSON.parse(data) as VerticalSlice;
    } catch (error) {
      throw new Error(`Failed to load vertical slice: ${error}`);
    }
  }

  /**
   * Initialize scenario
   */
  public initialize(): void {
    // Validate player has correct starting state
    const worldState = this.worldStateManager.getState();
    if (worldState.current_tail_count !== this.sliceData.player_state.starting_tails) {
      throw new Error(
        `Invalid starting state: expected ${this.sliceData.player_state.starting_tails} tails, ` +
        `have ${worldState.current_tail_count}`
      );
    }

    // Load Blackreach Underpass biome
    this.biomeManager.loadBiome('blackreach_underpass');
    
    // Validate Blackreach is configured for Shade Trial
    this.biomeManager.validateBlackreachForShadeTrial();

    console.log(`[Blackreach Descent] Initialized with ${worldState.current_tail_count} tails`);
  }

  /**
   * Get current phase
   */
  public getCurrentPhase(): MissionPhase {
    return this.sliceData.mission_flow[this.scenarioState.current_phase - 1];
  }

  /**
   * Start a phase
   */
  public startPhase(phaseNumber: number): void {
    if (phaseNumber < 1 || phaseNumber > this.sliceData.mission_flow.length) {
      throw new Error(`Invalid phase number: ${phaseNumber}`);
    }

    // Cannot skip phases
    if (phaseNumber > 1 && !this.scenarioState.completed_phases.includes(phaseNumber - 1)) {
      throw new Error(`Must complete phase ${phaseNumber - 1} before starting phase ${phaseNumber}`);
    }

    this.scenarioState.current_phase = phaseNumber;
    this.scenarioState.phase_start_time = Date.now();

    const phase = this.getCurrentPhase();
    console.log(`[Phase ${phaseNumber}] ${phase.type}: ${phase.objective}`);
  }

  /**
   * Complete current phase
   */
  public completePhase(): void {
    const phase = this.getCurrentPhase();
    const elapsed = (Date.now() - this.scenarioState.phase_start_time) / 1000 / 60;

    this.scenarioState.completed_phases.push(this.scenarioState.current_phase);
    this.scenarioState.total_elapsed_minutes += elapsed;

    console.log(`[Phase ${this.scenarioState.current_phase}] Completed in ${elapsed.toFixed(1)} minutes`);
  }

  /**
   * Phase 1: Stealth Exploration
   */
  public executeStealthExploration(): void {
    const phase = this.getCurrentPhase();
    if (phase.type !== 'stealth_exploration') {
      throw new Error('Current phase is not stealth exploration');
    }

    console.log('[Stealth Exploration] Navigate floodlit passages');
    console.log('  - Avoid floodlight detection');
    console.log('  - Use shadow positioning');
    console.log('  - Manage sound propagation');
  }

  /**
   * Phase 2: Hybrid Combat
   */
  public executeHybridCombat(): void {
    const phase = this.getCurrentPhase();
    if (phase.type !== 'hybrid_combat') {
      throw new Error('Current phase is not hybrid combat');
    }

    const settings = this.biomeManager.getEncounterSettings();
    console.log(`[Hybrid Combat] ${phase.enemy_waves} waves, max ${phase.max_enemies_simultaneous} simultaneous`);
    console.log('  - Stealth to combat transitions');
    console.log('  - Threat manipulation');
    console.log('  - Backstab executions');
  }

  /**
   * Phase 3: Elite Duel
   */
  public executeEliteDuel(): void {
    const phase = this.getCurrentPhase();
    if (phase.type !== 'elite_duel') {
      throw new Error('Current phase is not elite duel');
    }

    console.log(`[Elite Duel] ${phase.boss_name}`);
    console.log('  - Dodge timing');
    console.log('  - Posture break');
    console.log('  - Retaliation windows');
  }

  /**
   * Phase 4: Shade Trial Legend Node
   */
  public executeShadeTrial(): boolean {
    const phase = this.getCurrentPhase();
    if (phase.type !== 'legend_node') {
      throw new Error('Current phase is not legend node');
    }

    const legendNode = this.legendNodeManager.getLegendNode(phase.legend_node_id!);
    if (!legendNode) {
      throw new Error(`Legend Node not found: ${phase.legend_node_id}`);
    }

    console.log('[Shade Trial] Legend Node Challenge');
    console.log(`  - ${legendNode.victory_conditions.stealth_strikes_required} stealth strikes required`);
    console.log(`  - ${legendNode.victory_conditions.threat_resets_required} threat resets required`);
    console.log(`  - Max detected time: ${legendNode.victory_conditions.detected_time_seconds_max}s`);

    // Trial rules in effect
    if (legendNode.trial_rules.minimap_disabled) {
      console.log('  - Minimap disabled');
    }
    if (legendNode.trial_rules.lock_on_disabled) {
      console.log('  - Lock-on disabled');
    }
    if (legendNode.trial_rules.healing_disabled) {
      console.log('  - Healing disabled');
    }

    // Check if player can attempt
    const worldState = this.worldStateManager.getState();
    const playerState: PlayerProgressionState = {
      current_tail_count: worldState.current_tail_count,
      completed_legend_nodes: worldState.completed_legend_nodes,
      unlocked_abilities: worldState.unlocked_abilities
    };

    const attemptResult = this.legendNodeManager.canAttemptLegendNode(
      phase.legend_node_id!,
      playerState
    );

    if (!attemptResult.can_attempt) {
      throw new Error(`Cannot attempt Shade Trial: ${attemptResult.reason}`);
    }

    return true;
  }

  /**
   * Complete scenario and unlock Tail 5
   */
  public completeScenario(): void {
    // Verify all phases completed
    if (this.scenarioState.completed_phases.length !== this.sliceData.mission_flow.length) {
      throw new Error('All phases must be completed before finishing scenario');
    }

    // Complete Shade Trial Legend Node
    this.worldStateManager.completeLegendNode(
      'shade_trial',
      this.sliceData.end_state.tail_unlocked
    );

    // Unlock new abilities
    this.worldStateManager.unlockAbility('shade');
    this.worldStateManager.unlockAbility('threat_reset_on_stealth_hit');
    this.worldStateManager.unlockAbility('short_blink_backstab');

    // Complete narrative beat
    this.worldStateManager.completeNarrativeBeat(this.sliceData.end_state.narrative_beat);

    console.log('[Blackreach Descent] COMPLETE');
    console.log(`  - Tail 5 unlocked: Shade`);
    console.log(`  - Total time: ${this.scenarioState.total_elapsed_minutes.toFixed(1)} minutes`);
    console.log(`  - Target time: ${this.sliceData.playtime_target_minutes} minutes`);
  }

  /**
   * Get scenario statistics
   */
  public getStats(): {
    current_phase: number;
    completed_phases: number;
    total_time_minutes: number;
    target_time_minutes: number;
    stealth_detections: number;
    enemies_defeated: number;
    stealth_kills: number;
  } {
    return {
      current_phase: this.scenarioState.current_phase,
      completed_phases: this.scenarioState.completed_phases.length,
      total_time_minutes: this.scenarioState.total_elapsed_minutes,
      target_time_minutes: this.sliceData.playtime_target_minutes,
      stealth_detections: this.scenarioState.stealth_detection_count,
      enemies_defeated: this.scenarioState.enemies_defeated,
      stealth_kills: this.scenarioState.stealth_kills
    };
  }
}

/**
 * Memory Effect Handler
 * 
 * Applies memory effects to gameplay systems.
 * Runs every frame and applies cumulative effects from all active memories.
 * 
 * Effect Types:
 * - Perception Shifts: Update UI/HUD density, audio depth, visual clarity
 * - Behavior Modifications: Modify player input response, combat timing feel
 * - Enemy Reactions: Modify enemy behavior, morale, surrender conditions
 * - World Interactions: Modify environmental interactions, NPC reactions, world state
 */

import { MemoryWeaveManager } from './MemoryWeaveManager';
import { MemoryEffectContext, CumulativeMemoryEffects } from './MemoryWeaveTypes';

export class MemoryEffectHandler {
  private memoryManager: MemoryWeaveManager;

  constructor(memoryManager: MemoryWeaveManager) {
    this.memoryManager = memoryManager;
  }

  /**
   * Apply all memory effects to a context
   * This should be called every frame
   */
  applyAllEffects(context: MemoryEffectContext): void {
    const effects = this.memoryManager.getCumulativeEffects();

    this.applyPerceptionShifts(effects, context);
    this.applyBehaviorModifications(effects, context);
    this.applyEnemyReactions(effects, context);
    this.applyWorldInteractions(effects, context);
  }

  /**
   * Apply perception shifts to UI/HUD and visual systems
   * Changes how the world appears to the player
   */
  applyPerceptionShifts(
    effects: CumulativeMemoryEffects,
    context: MemoryEffectContext
  ): void {
    if (!context.playerState) {
      return;
    }

    const shifts = effects.perception_shifts;

    // Store perception shifts in player state for rendering systems
    context.playerState.activePerceptionShifts = shifts;

    // Apply visual clarity modifiers
    if (shifts.includes('parry_windows_feel_clearer')) {
      context.playerState.parryWindowClarity = 1.5;
    }
    if (shifts.includes('ally_positions_more_visible')) {
      context.playerState.allyVisibilityBonus = 1.3;
    }
    if (shifts.includes('isolated_enemies_appear_vulnerable')) {
      context.playerState.isolatedEnemyHighlight = true;
    }
    if (shifts.includes('connected_enemies_glow_subtly')) {
      context.playerState.connectionVisualization = true;
    }
    if (shifts.includes('tether_paths_visible')) {
      context.playerState.tetherVisualization = true;
    }
    if (shifts.includes('damage_taken_becomes_readable')) {
      context.playerState.damageReadability = 1.5;
    }
    if (shifts.includes('enemy_attack_patterns_clearer')) {
      context.playerState.attackPatternClarity = 1.4;
    }
    if (shifts.includes('dodge_windows_feel_wider')) {
      context.playerState.dodgeWindowPerception = 1.2;
    }
    if (shifts.includes('shadow_density_readable')) {
      context.playerState.shadowReadability = true;
    }
    if (shifts.includes('threat_meter_visible')) {
      context.playerState.threatMeterEnabled = true;
    }
    if (shifts.includes('enemy_next_action_feels_predictable')) {
      context.playerState.enemyPrediction = true;
    }
    if (shifts.includes('timing_becomes_intuitive')) {
      context.playerState.timingIntuition = 1.5;
    }
    if (shifts.includes('enemies_recognize_kai_jax')) {
      context.playerState.recognitionEffect = true;
    }
    if (shifts.includes('authority_changes_outcomes')) {
      context.playerState.authorityPresence = true;
    }
  }

  /**
   * Apply behavior modifications to player input and combat feel
   * Changes how the player acts and feels in combat
   */
  applyBehaviorModifications(
    effects: CumulativeMemoryEffects,
    context: MemoryEffectContext
  ): void {
    if (!context.playerState) {
      return;
    }

    const modifications = effects.behavior_modifications;

    // Store behavior modifications in player state
    context.playerState.activeBehaviorModifications = modifications;

    // Apply combat timing modifiers
    if (modifications.includes('revives_feel_deliberate_slower')) {
      context.playerState.reviveDeliberateness = 1.2;
    }
    if (modifications.includes('executions_feel_intentional_not_automatic')) {
      context.playerState.executionIntentionality = true;
    }
    if (modifications.includes('naturally_group_enemies_before_striking')) {
      context.playerState.groupingBehavior = true;
    }
    if (modifications.includes('baiting_attacks_feels_intuitive')) {
      context.playerState.baitingIntuition = true;
    }
    if (modifications.includes('dodging_into_danger_feels_correct')) {
      context.playerState.aggressiveDodging = true;
    }
    if (modifications.includes('combat_rhythm_slows_deliberately')) {
      context.playerState.rhythmModifier = 0.85; // Slightly slower, more deliberate
    }
    if (modifications.includes('patience_rewarded_deeply')) {
      context.playerState.patienceReward = 1.5;
    }
    if (modifications.includes('player_instinctively_claims_space')) {
      context.playerState.spaceClaimingBehavior = true;
    }
    if (modifications.includes('retreat_feels_wrong')) {
      context.playerState.retreatPenalty = 0.7; // Discourages retreat
    }
    if (modifications.includes('anticipation_before_reaction')) {
      context.playerState.anticipationMode = true;
    }
    if (modifications.includes('tempo_mastery_emerges')) {
      context.playerState.tempoMastery = true;
    }
    if (modifications.includes('player_hesitates_correctly')) {
      context.playerState.correctHesitation = true;
    }
    if (modifications.includes('restraint_feels_meaningful')) {
      context.playerState.restraintMeaning = true;
    }
    if (modifications.includes('command_presence_natural')) {
      context.playerState.commandPresence = true;
    }
  }

  /**
   * Apply enemy reactions based on active memories
   * Changes how enemies behave and respond
   */
  applyEnemyReactions(
    effects: CumulativeMemoryEffects,
    context: MemoryEffectContext
  ): void {
    if (!context.enemyState) {
      return;
    }

    const reactions = effects.enemy_reactions;

    // Store enemy reactions in enemy state
    context.enemyState.activeMemoryReactions = reactions;

    // Apply enemy behavior modifiers
    if (reactions.includes('enemies_hesitate_when_outnumbered')) {
      context.enemyState.outnumberedHesitation = 1.5;
    }
    if (reactions.includes('enemies_flee_sooner_when_isolated')) {
      context.enemyState.isolationFleeThreshold = 0.7;
    }
    if (reactions.includes('grouped_enemies_panic')) {
      context.enemyState.groupPanicEnabled = true;
    }
    if (reactions.includes('enemies_group_defensively')) {
      context.enemyState.defensiveGrouping = true;
    }
    if (reactions.includes('enemies_hesitate_after_failed_strikes')) {
      context.enemyState.failureHesitation = true;
    }
    if (reactions.includes('posture_breaks_satisfy_deeply')) {
      context.enemyState.postureBreakSatisfaction = 1.5;
    }
    if (reactions.includes('enemies_lose_track_faster')) {
      context.enemyState.trackingLossRate = 1.3;
    }
    if (reactions.includes('stealth_transitions_smoother')) {
      context.enemyState.stealthTransitionBonus = true;
    }
    if (reactions.includes('threat_resets_feel_natural')) {
      context.enemyState.threatResetSmooth = true;
    }
    if (reactions.includes('enemies_break_formation_near_anchored_kai_jax')) {
      context.enemyState.formationBreakNearAnchor = true;
    }
    if (reactions.includes('morale_tied_to_kai_jax_position')) {
      context.enemyState.positionBasedMorale = true;
    }
    if (reactions.includes('attacks_feel_telegraphed')) {
      context.enemyState.attackTelegraphing = 1.4;
    }
    if (reactions.includes('fear_of_full_power_increases')) {
      context.enemyState.powerFearMultiplier = 1.6;
    }
    if (reactions.includes('surrender_becomes_option')) {
      context.enemyState.surrenderEnabled = true;
    }
    if (reactions.includes('mercy_becomes_possible')) {
      context.enemyState.mercyEnabled = true;
    }
    if (reactions.includes('enemies_surrender_without_combat')) {
      context.enemyState.preCombatSurrender = true;
    }
    if (reactions.includes('npcs_follow_without_question')) {
      context.enemyState.automaticFollowing = true;
    }
    if (reactions.includes('world_recognizes_authority')) {
      context.enemyState.authorityRecognition = true;
    }
  }

  /**
   * Apply world interactions based on active memories
   * Changes how the world reacts and interacts
   */
  applyWorldInteractions(
    effects: CumulativeMemoryEffects,
    context: MemoryEffectContext
  ): void {
    if (!context.worldState) {
      return;
    }

    const interactions = effects.world_interactions;

    // Store world interactions in world state
    context.worldState.activeMemoryInteractions = interactions;

    // Apply world state modifiers
    if (interactions.includes('npc_trust_increases')) {
      context.worldState.npcTrustModifier = 1.3;
    }
    if (interactions.includes('environmental_connections_highlighted')) {
      context.worldState.environmentalHighlighting = true;
    }
    if (interactions.includes('story_hooks_more_apparent')) {
      context.worldState.storyHookVisibility = 1.5;
    }
    if (interactions.includes('darkness_becomes_refuge')) {
      context.worldState.darknessRefuge = true;
    }
    if (interactions.includes('sacred_ground_emerges')) {
      context.worldState.sacredGroundEnabled = true;
    }
    if (interactions.includes('world_shows_damage_from_past_uses')) {
      context.worldState.pastDamageVisible = true;
    }
    if (interactions.includes('npcs_fear_and_respect_equally')) {
      context.worldState.fearRespectBalance = true;
    }
    if (interactions.includes('collective_memory_accessible')) {
      context.worldState.collectiveMemoryEnabled = true;
    }
    if (interactions.includes('past_actions_echo_into_present')) {
      context.worldState.actionEchoSystem = true;
    }
    if (interactions.includes('sacrifice_honored_globally')) {
      context.worldState.globalSacrificeHonor = true;
    }
  }

  /**
   * Get a summary of all active effects
   */
  getActiveEffectSummary(): CumulativeMemoryEffects {
    return this.memoryManager.getCumulativeEffects();
  }
}

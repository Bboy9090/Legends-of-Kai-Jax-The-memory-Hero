/**
 * @file StoryModeTypes.ts
 * @brief TypeScript type definitions for Story Mode systems
 * 
 * These types mirror the C++ structures defined in:
 * - engine/cpp/include/story_mode/StoryModeTypes.h
 * - engine/cpp/include/combat/CombatTypes.h
 * - engine/cpp/include/ai/EnemyAITypes.h
 * 
 * CANONICAL LAW:
 * - Platform-agnostic (same types for all platforms)
 * - Tail progression 3→9 enforced
 * - Data-driven from JSON schemas
 */

// ============================================================================
// STORY MODE - Districts & Traversal
// ============================================================================

export enum ZoneType {
  Combat = "combat",
  Exploration = "exploration",
  Safe = "safe",
  BossArena = "boss_arena"
}

export interface TraversalFeatures {
  verticality_enabled: boolean;
  rooftops: boolean;
  interior_transitions: boolean;
  wall_run: boolean;
  wall_jump: boolean;
}

export interface Zone {
  zone_id: string;
  zone_name: string;
  type: ZoneType;
  description: string;
  min_tail_tier?: number;
  max_enemies?: number;
}

export interface District {
  district_id: string;
  district_name: string;
  description: string;
  zones: Zone[];
  traversal_features: TraversalFeatures;
  unlocked_by_tail_tier: number;
}

// ============================================================================
// NPC & QUESTS
// ============================================================================

export interface DialogueChoice {
  choice_text: string;
  next_node_id: string;
}

export interface DialogueNode {
  node_id: string;
  dialogue_text: string;
  speaker: string;
  choices: DialogueChoice[];
  is_end_node: boolean;
  tail_tier_required?: number;
}

export interface TailTierDialogue {
  [tailTier: number]: string;
}

export interface NPC {
  npc_id: string;
  npc_name: string;
  role: string;
  base_dialogue: DialogueNode[];
  tail_tier_reactions: TailTierDialogue;
}

export enum QuestObjectiveType {
  DefeatEnemies = "defeat_enemies",
  ReachLocation = "reach_location",
  InteractNPC = "interact_npc"
}

export interface QuestObjective {
  objective_id: string;
  type: QuestObjectiveType;
  description: string;
  target_count?: number;
  target_location?: string;
  target_npc?: string;
  target_enemy_type?: string;
}

export interface QuestReward {
  unlock_tail_tier?: number;
  unlock_district?: string;
  experience_points?: number;
}

export interface Quest {
  quest_id: string;
  quest_name: string;
  description: string;
  objectives: QuestObjective[];
  prerequisites: string[];
  rewards: QuestReward;
  starting_npc: string;
}

// ============================================================================
// COMBAT SYSTEM
// ============================================================================

export enum AttackCategory {
  Light = "light",
  Heavy = "heavy",
  Special = "special",
  Finisher = "finisher"
}

export enum DodgeType {
  GroundRoll = "ground_roll",
  AirDash = "air_dash",
  Sidestep = "sidestep",
  Backstep = "backstep"
}

export enum CombatState {
  Idle = "idle",
  Moving = "moving",
  Attacking = "attacking",
  Dodging = "dodging",
  Blocking = "blocking",
  Stunned = "stunned",
  KnockedDown = "knocked_down"
}

export interface AttackDefinition {
  id: string;
  name: string;
  category: AttackCategory;
  damage: number;
  execution_frames: number;
  recovery_frames: number;
  can_cancel_into: string[];
  requires_tail_tier: number;
  momentum_based: boolean;
  knockback_strength: number;
  hitstun_frames: number;
  range: number;
}

export interface TailTierCombatModifier {
  damage_multiplier: number;
  speed_multiplier: number;
  available_attacks: string[];
  unlocked_abilities: string[];
}

export interface MovementParameters {
  walk_speed: number;
  run_speed: number;
  sprint_speed: number;
  mass_affects_momentum: boolean;
  mass: number;
  inertia_factor: number;
}

export interface AgilityFeatures {
  instant_direction_change: boolean;
  air_control_enabled: boolean;
  available_dodges: DodgeType[];
  wall_run_enabled: boolean;
  wall_jump_enabled: boolean;
  dodge_distance: number;
  dodge_invincibility_frames: number;
}

export interface ComboState {
  hit_count: number;
  total_damage: number;
  move_sequence: string[];
  last_hit_time: number;
  combo_timeout: number;
  is_active: boolean;
}

export interface HitData {
  attacker_id: string;
  defender_id: string;
  attack_id: string;
  damage: number;
  knockback_x: number;
  knockback_y: number;
  knockback_z: number;
  hitstun_frames: number;
  is_counter_hit: boolean;
  is_parried: boolean;
}

export interface CombatCharacter {
  character_id: string;
  current_tail_count: number; // 3-9, CANON enforced
  state: CombatState;
  health: number;
  max_health: number;
  pos_x: number;
  pos_y: number;
  pos_z: number;
  vel_x: number;
  vel_y: number;
  vel_z: number;
  combo: ComboState;
  current_attack_id: string;
  attack_frame: number;
  stun_frames_remaining: number;
  tail_modifiers: TailTierCombatModifier;
  movement: MovementParameters;
  agility: AgilityFeatures;
}

// ============================================================================
// ENEMY AI
// ============================================================================

export enum EnemyTier {
  Fodder = "fodder",
  Elite = "elite",
  Boss = "boss"
}

export enum EngagementStyle {
  Aggressive = "aggressive",
  Defensive = "defensive",
  Tactical = "tactical",
  Berserker = "berserker",
  Desperate = "desperate"
}

export enum AIState {
  Idle = "idle",
  Patrol = "patrol",
  Alert = "alert",
  Engaging = "engaging",
  Attacking = "attacking",
  Retreating = "retreating",
  Fleeing = "fleeing",
  Stunned = "stunned",
  Dead = "dead"
}

export interface EnemyAttack {
  attack_id: string;
  attack_name: string;
  damage_multiplier: number;
  cooldown: number;
  range: number;
  windup_time: number;
  can_be_interrupted: boolean;
}

export interface BehaviorPattern {
  engagement_style: EngagementStyle;
  aggression_level: number;
  engagement_range: number;
  retreat_threshold: number;
  group_coordination: boolean;
}

export interface TailTierAdaptation {
  confidence_modifier: number;
  engagement_distance_modifier: number;
  flee_on_sight: boolean;
  spawn_disabled: boolean;
  tactics_override?: EngagementStyle;
  has_tactics_override: boolean;
}

export interface EnemyStats {
  health: number;
  damage: number;
  speed: number;
  defense: number;
}

export interface EnemyCombatCapabilities {
  attack_types: EnemyAttack[];
  can_block: boolean;
  can_dodge: boolean;
  can_counter: boolean;
}

export interface EnemyAIConfig {
  enemy_id: string;
  enemy_type: string;
  tier: EnemyTier;
  base_stats: EnemyStats;
  base_behavior: BehaviorPattern;
  combat_capabilities: EnemyCombatCapabilities;
  tail_tier_adaptations: { [tailTier: number]: TailTierAdaptation };
}

export interface EnemyInstance {
  instance_id: string;
  enemy_config_id: string;
  state: AIState;
  health: number;
  max_health: number;
  pos_x: number;
  pos_y: number;
  pos_z: number;
  vel_x: number;
  vel_y: number;
  vel_z: number;
  state_timer: number;
  target_character_id: string;
  last_attack_time: number;
  alert_timer: number;
  current_behavior: BehaviorPattern;
  nearby_allies: string[];
  is_group_leader: boolean;
  current_attack_id: string;
  attack_windup_timer: number;
}

// ============================================================================
// PLAYER STATE
// ============================================================================

export interface PlayerState {
  player_id: string;
  current_tail_count: number; // 3-9, CANON enforced
  current_district: string;
  current_zone: string;
  active_quests: string[];
  completed_quests: string[];
  combat_character: CombatCharacter;
}

// ============================================================================
// SYSTEM STATE
// ============================================================================

export interface StoryModeState {
  player: PlayerState;
  districts: District[];
  npcs: NPC[];
  quests: Quest[];
  active_enemies: EnemyInstance[];
}

// ============================================================================
// EVENT TYPES
// ============================================================================

export interface QuestEvent {
  type: "quest_started" | "quest_completed" | "objective_completed";
  quest_id: string;
  objective_id?: string;
}

export interface CombatEvent {
  type: "hit" | "combo" | "parry" | "dodge" | "enemy_defeated";
  data: HitData | ComboState | EnemyInstance;
}

export interface NPCEvent {
  type: "npc_interaction" | "dialogue_started" | "dialogue_ended";
  npc_id: string;
  dialogue_node?: DialogueNode;
}

export interface TailTierEvent {
  type: "tail_tier_changed";
  old_tier: number;
  new_tier: number;
}

export type StoryModeEvent = QuestEvent | CombatEvent | NPCEvent | TailTierEvent;

/**
 * OMEGA PROTOCOL: BOSS AI SYSTEM
 * 
 * Intelligent boss encounters that:
 * - React dynamically to player archetypes (speed, anchor, adaptation)
 * - Transition through phases based on HP thresholds
 * - Trigger arena destruction and environmental changes
 * - Create dramatic, readable, but challenging encounters
 * 
 * "The game can now embarrass bad ideas in real time."
 */

import { Vector2D, Vec2, Fighter } from '@beast-kin/shared';
import { TrinityMeterSystem } from '../combat/TrinityMeterSystem';

export interface BossPhase {
  id: string;
  name: string;
  hpThreshold: number; // Percentage HP to trigger this phase (e.g., 0.7 = 70%)
  patterns: BossPattern[];
  arenaEvents: ArenaEvent[];
  musicStinger?: string;
  dialogueLine?: string;
}

export interface BossPattern {
  id: string;
  name: string;
  priority: number;
  cooldown: number; // Frames
  conditions: PatternCondition[];
  actions: BossAction[];
  telegraph: TelegraphConfig;
}

export interface PatternCondition {
  type: 'distance' | 'player_state' | 'player_archetype' | 'hp' | 'cooldown_ready' | 'phase';
  value: string | number;
  operator: 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'neq';
}

export interface BossAction {
  type: 'attack' | 'move' | 'spawn' | 'arena_event' | 'telegraph' | 'wait';
  data: Record<string, unknown>;
  frames: number;
}

export interface TelegraphConfig {
  type: 'visual' | 'audio' | 'both';
  frames: number;
  visual?: {
    indicator: 'ground_zone' | 'line' | 'area' | 'projectile_path';
    color: string;
    size: number;
  };
  audio?: {
    sound: string;
    volume: number;
  };
}

export interface ArenaEvent {
  type: 'destroy_prop' | 'spawn_hazard' | 'change_floor' | 'collapse_section' | 'reality_pin';
  trigger: 'immediate' | 'delayed';
  delay?: number;
  data: Record<string, unknown>;
}

export interface BossConfig {
  id: string;
  name: string;
  displayName: string;
  phases: BossPhase[];
  baseStats: BossStats;
  archetype: BossArchetype;
  reactsTo: PlayerArchetype[];
}

export interface BossStats {
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  weight: number;
  telegraphSpeed: number; // How fast telegraphs show (faster = harder)
}

export type BossArchetype = 'guardian' | 'hunter' | 'controller' | 'berserker';
export type PlayerArchetype = 'speed' | 'anchor' | 'adaptation' | 'balanced';

export class BossAI {
  private bossId: string;
  private config: BossConfig;
  private currentPhase: BossPhase;
  private currentPhaseIndex: number = 0;
  private currentHp: number;
  private maxHp: number;
  
  // Pattern tracking
  private patternCooldowns: Map<string, number> = new Map();
  private currentPattern: BossPattern | null = null;
  private patternFrame: number = 0;
  private actionIndex: number = 0;
  
  // Player analysis
  private detectedArchetype: PlayerArchetype = 'balanced';
  private playerActionHistory: string[] = [];
  private lastPlayerDistance: number = 0;
  
  // State
  private isTransitioning: boolean = false;
  private transitionFrames: number = 0;
  private pendingArenaEvents: ArenaEvent[] = [];
  
  // Trinity integration
  private trinitySystem?: TrinityMeterSystem;
  
  constructor(config: BossConfig, trinitySystem?: TrinityMeterSystem) {
    this.bossId = config.id;
    this.config = config;
    this.currentPhase = config.phases[0];
    this.maxHp = config.baseStats.maxHp;
    this.currentHp = this.maxHp;
    this.trinitySystem = trinitySystem;
    
    // Initialize cooldowns
    for (const phase of config.phases) {
      for (const pattern of phase.patterns) {
        this.patternCooldowns.set(pattern.id, 0);
      }
    }
  }
  
  /**
   * Main update loop - call every frame
   */
  update(deltaTime: number, player: Fighter, bossPosition: Vector2D): BossDecision {
    // Update cooldowns
    this.updateCooldowns();
    
    // Check phase transitions
    this.checkPhaseTransition();
    
    // Handle transition animation
    if (this.isTransitioning) {
      return this.handleTransition();
    }
    
    // Analyze player
    this.analyzePlayer(player, bossPosition);
    
    // Execute current pattern or select new one
    if (this.currentPattern) {
      return this.executePattern(player, bossPosition);
    } else {
      this.selectPattern(player, bossPosition);
      return this.getIdleDecision();
    }
  }
  
  /**
   * Apply damage to boss
   */
  takeDamage(damage: number): { died: boolean; phaseChanged: boolean; events: ArenaEvent[] } {
    this.currentHp = Math.max(0, this.currentHp - damage);
    
    const died = this.currentHp <= 0;
    const phaseChanged = this.checkPhaseTransition();
    
    return {
      died,
      phaseChanged,
      events: phaseChanged ? this.pendingArenaEvents.splice(0) : [],
    };
  }
  
  /**
   * Check and handle phase transitions
   */
  private checkPhaseTransition(): boolean {
    const hpPercent = this.currentHp / this.maxHp;
    
    for (let i = this.config.phases.length - 1; i > this.currentPhaseIndex; i--) {
      const phase = this.config.phases[i];
      if (hpPercent <= phase.hpThreshold) {
        this.transitionToPhase(i);
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Transition to new phase with dramatic effects
   */
  private transitionToPhase(phaseIndex: number): void {
    this.isTransitioning = true;
    this.transitionFrames = 120; // 2 seconds at 60fps
    this.currentPhaseIndex = phaseIndex;
    this.currentPhase = this.config.phases[phaseIndex];
    
    // Queue arena events
    this.pendingArenaEvents.push(...this.currentPhase.arenaEvents);
    
    // Clear current pattern
    this.currentPattern = null;
    this.patternFrame = 0;
    this.actionIndex = 0;
    
    // Trigger trinity phase break event
    if (this.trinitySystem) {
      this.trinitySystem.processEvent(this.bossId, 'phase_break', 0);
    }
  }
  
  /**
   * Handle phase transition animation
   */
  private handleTransition(): BossDecision {
    this.transitionFrames--;
    
    if (this.transitionFrames <= 0) {
      this.isTransitioning = false;
    }
    
    return {
      type: 'phase_transition',
      action: 'invulnerable',
      hitStopFrames: this.transitionFrames === 119 ? 30 : 0, // Hit-stop at start
      cameraAction: {
        type: 'snap',
        targetPosition: null, // Focus on boss
        intensity: 1.0,
      },
      arenaEvents: this.transitionFrames === 119 ? this.pendingArenaEvents.splice(0) : [],
      dialogue: this.transitionFrames === 119 ? this.currentPhase.dialogueLine : undefined,
    };
  }
  
  /**
   * Analyze player to determine archetype and adapt
   */
  private analyzePlayer(player: Fighter, bossPosition: Vector2D): void {
    const distance = Vec2.distance(player.position, bossPosition);
    const distanceDelta = distance - this.lastPlayerDistance;
    this.lastPlayerDistance = distance;
    
    // Track player action
    this.playerActionHistory.push(player.state);
    if (this.playerActionHistory.length > 60) {
      this.playerActionHistory.shift();
    }
    
    // Determine archetype based on behavior
    const dashCount = this.playerActionHistory.filter(s => s === 'dash' || s === 'run').length;
    const blockCount = this.playerActionHistory.filter(s => s === 'block' || s === 'parry').length;
    const counterCount = this.playerActionHistory.filter(s => s === 'counter' || s.includes('special')).length;
    
    if (dashCount > 30) {
      this.detectedArchetype = 'speed';
    } else if (blockCount > 20) {
      this.detectedArchetype = 'anchor';
    } else if (counterCount > 15) {
      this.detectedArchetype = 'adaptation';
    } else {
      this.detectedArchetype = 'balanced';
    }
  }
  
  /**
   * Select appropriate pattern based on situation
   */
  private selectPattern(player: Fighter, bossPosition: Vector2D): void {
    const distance = Vec2.distance(player.position, bossPosition);
    const availablePatterns = this.currentPhase.patterns.filter(p => 
      this.patternCooldowns.get(p.id) === 0 &&
      this.checkPatternConditions(p, player, distance)
    );
    
    if (availablePatterns.length === 0) {
      return;
    }
    
    // Sort by priority and pick best
    availablePatterns.sort((a, b) => b.priority - a.priority);
    
    // Apply archetype-specific adjustments
    const adjusted = this.adjustPatternsForArchetype(availablePatterns);
    
    this.currentPattern = adjusted[0];
    this.patternFrame = 0;
    this.actionIndex = 0;
    this.patternCooldowns.set(this.currentPattern.id, this.currentPattern.cooldown);
  }
  
  /**
   * Adjust pattern selection based on detected player archetype
   */
  private adjustPatternsForArchetype(patterns: BossPattern[]): BossPattern[] {
    return patterns.sort((a, b) => {
      let aBonus = 0;
      let bBonus = 0;
      
      switch (this.detectedArchetype) {
        case 'speed':
          // Tighter punish windows, more tracking attacks
          if (a.id.includes('track') || a.id.includes('punish')) aBonus += 10;
          if (b.id.includes('track') || b.id.includes('punish')) bBonus += 10;
          break;
          
        case 'anchor':
          // Disrupt pin zones, more mobility attacks
          if (a.id.includes('disrupt') || a.id.includes('mobile')) aBonus += 10;
          if (b.id.includes('disrupt') || b.id.includes('mobile')) bBonus += 10;
          break;
          
        case 'adaptation':
          // Delay high-value tells, mix up timing
          if (a.id.includes('delayed') || a.id.includes('feint')) aBonus += 10;
          if (b.id.includes('delayed') || b.id.includes('feint')) bBonus += 10;
          break;
      }
      
      return (b.priority + bBonus) - (a.priority + aBonus);
    });
  }
  
  /**
   * Check if pattern conditions are met
   */
  private checkPatternConditions(pattern: BossPattern, player: Fighter, distance: number): boolean {
    for (const condition of pattern.conditions) {
      switch (condition.type) {
        case 'distance':
          if (!this.checkNumericCondition(distance, condition.value as number, condition.operator)) {
            return false;
          }
          break;
          
        case 'player_state':
          if (!this.checkStringCondition(player.state, condition.value as string, condition.operator)) {
            return false;
          }
          break;
          
        case 'player_archetype':
          if (!this.checkStringCondition(this.detectedArchetype, condition.value as string, condition.operator)) {
            return false;
          }
          break;
          
        case 'hp':
          const hpPercent = this.currentHp / this.maxHp;
          if (!this.checkNumericCondition(hpPercent, condition.value as number, condition.operator)) {
            return false;
          }
          break;
          
        case 'phase':
          if (!this.checkStringCondition(this.currentPhase.id, condition.value as string, condition.operator)) {
            return false;
          }
          break;
      }
    }
    
    return true;
  }
  
  private checkNumericCondition(actual: number, expected: number, operator: string): boolean {
    switch (operator) {
      case 'eq': return actual === expected;
      case 'gt': return actual > expected;
      case 'lt': return actual < expected;
      case 'gte': return actual >= expected;
      case 'lte': return actual <= expected;
      case 'neq': return actual !== expected;
      default: return false;
    }
  }
  
  private checkStringCondition(actual: string, expected: string, operator: string): boolean {
    switch (operator) {
      case 'eq': return actual === expected;
      case 'neq': return actual !== expected;
      default: return false;
    }
  }
  
  /**
   * Execute current pattern actions
   */
  private executePattern(player: Fighter, bossPosition: Vector2D): BossDecision {
    if (!this.currentPattern) {
      return this.getIdleDecision();
    }
    
    const action = this.currentPattern.actions[this.actionIndex];
    if (!action) {
      // Pattern complete
      this.currentPattern = null;
      return this.getIdleDecision();
    }
    
    this.patternFrame++;
    
    // Check if current action is complete
    if (this.patternFrame >= action.frames) {
      this.actionIndex++;
      this.patternFrame = 0;
      
      if (this.actionIndex >= this.currentPattern.actions.length) {
        this.currentPattern = null;
        return this.getIdleDecision();
      }
    }
    
    return this.convertActionToDecision(action, player, bossPosition);
  }
  
  /**
   * Convert boss action to decision output
   */
  private convertActionToDecision(action: BossAction, player: Fighter, bossPosition: Vector2D): BossDecision {
    switch (action.type) {
      case 'attack':
        return {
          type: 'attack',
          action: action.data.attackId as string,
          targetPosition: player.position,
          direction: Vec2.normalize(Vec2.subtract(player.position, bossPosition)),
          hitStopFrames: action.data.hitStop as number ?? 0,
        };
        
      case 'move':
        return {
          type: 'move',
          action: action.data.moveType as string,
          targetPosition: action.data.position as Vector2D ?? player.position,
          direction: Vec2.normalize(Vec2.subtract(
            action.data.position as Vector2D ?? player.position,
            bossPosition
          )),
        };
        
      case 'spawn':
        return {
          type: 'spawn',
          action: 'spawn_entity',
          spawnData: action.data,
        };
        
      case 'arena_event':
        return {
          type: 'arena_event',
          action: action.data.eventType as string,
          arenaEvents: [action.data as unknown as ArenaEvent],
        };
        
      case 'telegraph':
        return {
          type: 'telegraph',
          action: 'show_telegraph',
          telegraphConfig: this.currentPattern?.telegraph,
          targetPosition: player.position,
        };
        
      case 'wait':
      default:
        return this.getIdleDecision();
    }
  }
  
  private getIdleDecision(): BossDecision {
    return {
      type: 'idle',
      action: 'wait',
    };
  }
  
  private updateCooldowns(): void {
    for (const [patternId, cooldown] of this.patternCooldowns) {
      if (cooldown > 0) {
        this.patternCooldowns.set(patternId, cooldown - 1);
      }
    }
  }
  
  // Getters
  getHpPercent(): number {
    return this.currentHp / this.maxHp;
  }
  
  getCurrentPhase(): BossPhase {
    return this.currentPhase;
  }
  
  getDetectedArchetype(): PlayerArchetype {
    return this.detectedArchetype;
  }
  
  isInTransition(): boolean {
    return this.isTransitioning;
  }
}

export interface BossDecision {
  type: 'idle' | 'attack' | 'move' | 'spawn' | 'arena_event' | 'telegraph' | 'phase_transition';
  action: string;
  targetPosition?: Vector2D;
  direction?: Vector2D;
  hitStopFrames?: number;
  cameraAction?: {
    type: 'shake' | 'snap' | 'punch' | 'zoom';
    targetPosition: Vector2D | null;
    intensity: number;
  };
  arenaEvents?: ArenaEvent[];
  spawnData?: Record<string, unknown>;
  telegraphConfig?: TelegraphConfig;
  dialogue?: string;
}

/**
 * Factory function to create the Archivist Warden boss
 * A failed memory guardian that enforces erased truths
 */
export function createArchivistWarden(trinitySystem?: TrinityMeterSystem): BossAI {
  const config: BossConfig = {
    id: 'archivist_warden',
    name: 'Archivist Warden',
    displayName: 'The Archivist Warden',
    archetype: 'guardian',
    reactsTo: ['speed', 'anchor', 'adaptation'],
    baseStats: {
      maxHp: 1000,
      attack: 35,
      defense: 25,
      speed: 4,
      weight: 150,
      telegraphSpeed: 30,
    },
    phases: [
      // Phase 1: Methodical (100% - 70%)
      {
        id: 'phase_1',
        name: 'Methodical Guardian',
        hpThreshold: 1.0,
        dialogueLine: 'You dare challenge the Archive?',
        arenaEvents: [],
        patterns: [
          {
            id: 'sweep_attack',
            name: 'Archival Sweep',
            priority: 5,
            cooldown: 90,
            conditions: [
              { type: 'distance', value: 300, operator: 'lt' }
            ],
            telegraph: {
              type: 'both',
              frames: 45,
              visual: { indicator: 'area', color: '#FF6B6B', size: 400 },
              audio: { sound: 'boss_telegraph', volume: 0.8 },
            },
            actions: [
              { type: 'telegraph', data: {}, frames: 45 },
              { type: 'attack', data: { attackId: 'sweep', damage: 25, hitStop: 8 }, frames: 30 },
              { type: 'wait', data: {}, frames: 60 },
            ],
          },
          {
            id: 'memory_slam',
            name: 'Memory Slam',
            priority: 3,
            cooldown: 120,
            conditions: [
              { type: 'distance', value: 200, operator: 'lt' }
            ],
            telegraph: {
              type: 'visual',
              frames: 30,
              visual: { indicator: 'ground_zone', color: '#9B59B6', size: 250 },
            },
            actions: [
              { type: 'telegraph', data: {}, frames: 30 },
              { type: 'attack', data: { attackId: 'slam', damage: 40, hitStop: 15 }, frames: 45 },
              { type: 'arena_event', data: { type: 'spawn_hazard', eventType: 'spawn_hazard' }, frames: 1 },
              { type: 'wait', data: {}, frames: 90 },
            ],
          },
        ],
      },
      // Phase 2: Aggressive (70% - 40%)
      {
        id: 'phase_2',
        name: 'Corrupted Memory',
        hpThreshold: 0.7,
        dialogueLine: 'The Archive will not be denied!',
        arenaEvents: [
          { type: 'destroy_prop', trigger: 'immediate', data: { propId: 'pillar_left' } },
          { type: 'spawn_hazard', trigger: 'delayed', delay: 60, data: { hazardType: 'void_zone' } },
        ],
        patterns: [
          {
            id: 'rapid_sweep',
            name: 'Rapid Sweep',
            priority: 6,
            cooldown: 60,
            conditions: [
              { type: 'distance', value: 350, operator: 'lt' }
            ],
            telegraph: {
              type: 'visual',
              frames: 20,
              visual: { indicator: 'area', color: '#E74C3C', size: 450 },
            },
            actions: [
              { type: 'telegraph', data: {}, frames: 20 },
              { type: 'attack', data: { attackId: 'sweep', damage: 30, hitStop: 10 }, frames: 20 },
              { type: 'attack', data: { attackId: 'sweep_2', damage: 25, hitStop: 8 }, frames: 25 },
              { type: 'wait', data: {}, frames: 45 },
            ],
          },
          {
            id: 'track_punish',
            name: 'Tracking Punish',
            priority: 8,
            cooldown: 90,
            conditions: [
              { type: 'player_archetype', value: 'speed', operator: 'eq' },
              { type: 'distance', value: 400, operator: 'lt' }
            ],
            telegraph: {
              type: 'both',
              frames: 15,
              visual: { indicator: 'line', color: '#F39C12', size: 500 },
              audio: { sound: 'boss_target', volume: 1.0 },
            },
            actions: [
              { type: 'telegraph', data: {}, frames: 15 },
              { type: 'move', data: { moveType: 'dash', speed: 8 }, frames: 15 },
              { type: 'attack', data: { attackId: 'punish', damage: 45, hitStop: 12 }, frames: 30 },
              { type: 'wait', data: {}, frames: 60 },
            ],
          },
          {
            id: 'zone_disrupt',
            name: 'Reality Disruption',
            priority: 7,
            cooldown: 120,
            conditions: [
              { type: 'player_archetype', value: 'anchor', operator: 'eq' }
            ],
            telegraph: {
              type: 'visual',
              frames: 30,
              visual: { indicator: 'area', color: '#3498DB', size: 600 },
            },
            actions: [
              { type: 'telegraph', data: {}, frames: 30 },
              { type: 'arena_event', data: { type: 'reality_pin', eventType: 'disrupt_pins' }, frames: 1 },
              { type: 'attack', data: { attackId: 'disrupt', damage: 35, hitStop: 10 }, frames: 40 },
              { type: 'wait', data: {}, frames: 75 },
            ],
          },
        ],
      },
      // Phase 3: Desperate (40% - 0%)
      {
        id: 'phase_3',
        name: 'Archive Collapse',
        hpThreshold: 0.4,
        dialogueLine: 'If I fall... the truth dies with me!',
        arenaEvents: [
          { type: 'collapse_section', trigger: 'immediate', data: { section: 'center' } },
          { type: 'change_floor', trigger: 'delayed', delay: 30, data: { floorType: 'crumbling' } },
          { type: 'spawn_hazard', trigger: 'delayed', delay: 90, data: { hazardType: 'void_pillars' } },
        ],
        patterns: [
          {
            id: 'desperation_flurry',
            name: 'Desperation Flurry',
            priority: 9,
            cooldown: 45,
            conditions: [
              { type: 'distance', value: 400, operator: 'lt' }
            ],
            telegraph: {
              type: 'audio',
              frames: 10,
              audio: { sound: 'boss_rage', volume: 1.0 },
            },
            actions: [
              { type: 'telegraph', data: {}, frames: 10 },
              { type: 'attack', data: { attackId: 'flurry_1', damage: 20, hitStop: 5 }, frames: 12 },
              { type: 'attack', data: { attackId: 'flurry_2', damage: 20, hitStop: 5 }, frames: 12 },
              { type: 'attack', data: { attackId: 'flurry_3', damage: 25, hitStop: 5 }, frames: 12 },
              { type: 'attack', data: { attackId: 'finisher', damage: 40, hitStop: 20 }, frames: 40 },
              { type: 'wait', data: {}, frames: 90 },
            ],
          },
          {
            id: 'delayed_feint',
            name: 'Delayed Feint',
            priority: 8,
            cooldown: 75,
            conditions: [
              { type: 'player_archetype', value: 'adaptation', operator: 'eq' }
            ],
            telegraph: {
              type: 'both',
              frames: 45, // Long telegraph to bait counter
              visual: { indicator: 'area', color: '#9B59B6', size: 350 },
              audio: { sound: 'boss_charge', volume: 0.6 },
            },
            actions: [
              { type: 'telegraph', data: {}, frames: 45 },
              { type: 'wait', data: {}, frames: 30 }, // Bait the counter
              { type: 'attack', data: { attackId: 'true_strike', damage: 50, hitStop: 15 }, frames: 25 },
              { type: 'wait', data: {}, frames: 60 },
            ],
          },
          {
            id: 'archive_collapse_attack',
            name: 'Archive Collapse',
            priority: 10,
            cooldown: 180,
            conditions: [
              { type: 'hp', value: 0.2, operator: 'lt' }
            ],
            telegraph: {
              type: 'both',
              frames: 90,
              visual: { indicator: 'area', color: '#000000', size: 800 },
              audio: { sound: 'boss_ultimate', volume: 1.0 },
            },
            actions: [
              { type: 'telegraph', data: {}, frames: 90 },
              { type: 'arena_event', data: { type: 'collapse_section', eventType: 'full_collapse' }, frames: 1 },
              { type: 'attack', data: { attackId: 'archive_collapse', damage: 80, hitStop: 30 }, frames: 60 },
              { type: 'wait', data: {}, frames: 180 },
            ],
          },
        ],
      },
    ],
  };
  
  return new BossAI(config, trinitySystem);
}

/**
 * @file AIService.ts
 * @brief Enemy AI service for TypeScript integration
 * 
 * Provides TypeScript interface to the C++ enemy AI system.
 * 
 * CANONICAL LAW:
 * - AI adapts to player tail count systemically
 * - Platform-agnostic behavior
 * - Fodder/Elite/Boss tiers with distinct AI complexity
 */

import {
  EnemyInstance,
  EnemyAIConfig,
  AIState,
  EnemyTier,
  EngagementStyle,
  TailTierAdaptation,
  BehaviorPattern
} from './StoryModeTypes';

export interface AIAction {
  type: 'none' | 'move' | 'attack' | 'dodge' | 'block' | 'flee';
  attackId?: string;
  moveX?: number;
  moveZ?: number;
}

export type EnemySpawnedCallback = (instanceId: string) => void;
export type EnemyDefeatedCallback = (instanceId: string) => void;
export type EnemyAlertedCallback = (instanceId: string) => void;

export class AIService {
  private enemyConfigs: Map<string, EnemyAIConfig> = new Map();
  private enemies: Map<string, EnemyInstance> = new Map();
  private playerTailCount: number = 3;
  private playerX: number = 0;
  private playerY: number = 0;
  private playerZ: number = 0;
  private nextInstanceId: number = 0;

  // Callbacks
  private enemySpawnedCallback?: EnemySpawnedCallback;
  private enemyDefeatedCallback?: EnemyDefeatedCallback;
  private enemyAlertedCallback?: EnemyAlertedCallback;

  constructor() {}

  /**
   * Load enemy AI configurations
   */
  async loadConfigurations(configPath: string = '/data/enemies'): Promise<void> {
    try {
      // Load all enemy configs
      const enemyFiles = ['corrupted_shadow', 'corruption_guardian'];

      for (const enemyFile of enemyFiles) {
        const response = await fetch(`${configPath}/${enemyFile}.json`);
        const config: EnemyAIConfig = await response.json();
        this.enemyConfigs.set(config.enemy_id, config);
      }

      console.log('Enemy AI configurations loaded');
    } catch (error) {
      console.error('Failed to load AI configurations:', error);
      throw error;
    }
  }

  /**
   * Update all enemy AI (called each frame)
   */
  update(deltaTime: number): void {
    this.enemies.forEach(enemy => {
      this.updateEnemyState(enemy, deltaTime);
    });
  }

  /**
   * Spawn an enemy
   */
  spawnEnemy(enemyConfigId: string, x: number, y: number, z: number): string | null {
    const config = this.enemyConfigs.get(enemyConfigId);
    if (!config) {
      console.error(`Enemy config not found: ${enemyConfigId}`);
      return null;
    }

    // Check if can spawn at current tail tier
    if (!this.canSpawnAtCurrentTier(enemyConfigId)) {
      console.error(`Enemy cannot spawn at current tail tier: ${enemyConfigId}`);
      return null;
    }

    // Create enemy instance
    const instanceId = `enemy_${this.nextInstanceId++}`;
    const enemy: EnemyInstance = {
      instance_id: instanceId,
      enemy_config_id: enemyConfigId,
      state: AIState.Patrol,
      health: config.base_stats.health,
      max_health: config.base_stats.health,
      pos_x: x,
      pos_y: y,
      pos_z: z,
      vel_x: 0,
      vel_y: 0,
      vel_z: 0,
      state_timer: 0,
      target_character_id: '',
      last_attack_time: 0,
      alert_timer: 0,
      current_behavior: { ...config.base_behavior },
      nearby_allies: [],
      is_group_leader: false,
      current_attack_id: '',
      attack_windup_timer: 0
    };

    this.enemies.set(instanceId, enemy);
    this.applyTailTierAdaptation(enemy);

    if (this.enemySpawnedCallback) {
      this.enemySpawnedCallback(instanceId);
    }

    console.log(`Spawned enemy: ${instanceId} at (${x}, ${y}, ${z})`);
    return instanceId;
  }

  /**
   * Remove enemy
   */
  removeEnemy(instanceId: string): void {
    this.enemies.delete(instanceId);
  }

  /**
   * Get enemy instance
   */
  getEnemy(instanceId: string): EnemyInstance | undefined {
    return this.enemies.get(instanceId);
  }

  /**
   * Get all active enemies
   */
  getActiveEnemies(): EnemyInstance[] {
    return Array.from(this.enemies.values()).filter(
      enemy => enemy.state !== AIState.Dead
    );
  }

  /**
   * Set player tail count (CANON: 3-9)
   */
  setPlayerTailCount(tailCount: number): boolean {
    // CANON ENFORCEMENT
    if (tailCount < 3 || tailCount > 9) {
      console.error(`Invalid tail count: ${tailCount} (must be 3-9)`);
      return false;
    }

    this.playerTailCount = tailCount;

    // Re-apply tail tier adaptations to all active enemies
    this.enemies.forEach(enemy => {
      this.applyTailTierAdaptation(enemy);
    });

    console.log(`Player tail count updated to ${tailCount}`);
    return true;
  }

  /**
   * Get player tail count
   */
  getPlayerTailCount(): number {
    return this.playerTailCount;
  }

  /**
   * Set player position
   */
  setPlayerPosition(x: number, y: number, z: number): void {
    this.playerX = x;
    this.playerY = y;
    this.playerZ = z;
  }

  /**
   * Check if enemy can spawn at current tail tier
   */
  canSpawnAtCurrentTier(enemyConfigId: string): boolean {
    const config = this.enemyConfigs.get(enemyConfigId);
    if (!config || !config.spawn_rules) return false;

    // Check spawn tier requirement
    if (this.playerTailCount < config.spawn_rules.requires_tail_tier) {
      return false;
    }

    // Check if spawn disabled at current tier
    const adaptation = config.tail_tier_adaptations[this.playerTailCount];
    if (adaptation && adaptation.spawn_disabled) {
      return false;
    }

    return true;
  }

  /**
   * Damage an enemy
   */
  damageEnemy(instanceId: string, damage: number, attackerId: string): void {
    const enemy = this.enemies.get(instanceId);
    if (!enemy) return;

    enemy.health -= damage;

    if (enemy.health <= 0) {
      enemy.health = 0;
      enemy.state = AIState.Dead;

      if (this.enemyDefeatedCallback) {
        this.enemyDefeatedCallback(instanceId);
      }
    }
  }

  /**
   * Stun an enemy
   */
  stunEnemy(instanceId: string, duration: number): void {
    const enemy = this.enemies.get(instanceId);
    if (!enemy) return;

    enemy.state = AIState.Stunned;
    enemy.state_timer = 0; // Reset timer to 0, will count up to duration
    enemy.stun_duration = duration;
  }

  /**
   * Get enemy's intended action this frame
   */
  getEnemyAction(instanceId: string): AIAction {
    const enemy = this.enemies.get(instanceId);
    if (!enemy) return { type: 'none' };

    switch (enemy.state) {
      case AIState.Patrol:
      case AIState.Alert:
      case AIState.Engaging:
        if (this.isPlayerInRange(enemy, enemy.current_behavior.engagement_range)) {
          const dx = this.playerX - enemy.pos_x;
          const dz = this.playerZ - enemy.pos_z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          
          if (dist > 0.01) {
            return {
              type: 'move',
              moveX: dx / dist,
              moveZ: dz / dist
            };
          }
        }
        return { type: 'none' };

      case AIState.Attacking:
        return {
          type: 'attack',
          attackId: enemy.current_attack_id
        };

      case AIState.Retreating:
      case AIState.Fleeing:
        const dx = enemy.pos_x - this.playerX;
        const dz = enemy.pos_z - this.playerZ;
        const dist = Math.sqrt(dx * dx + dz * dz);
        
        if (dist > 0.01) {
          return {
            type: 'flee',
            moveX: dx / dist,
            moveZ: dz / dist
          };
        }
        return { type: 'none' };

      default:
        return { type: 'none' };
    }
  }

  /**
   * Set callbacks
   */
  setEnemySpawnedCallback(callback: EnemySpawnedCallback): void {
    this.enemySpawnedCallback = callback;
  }

  setEnemyDefeatedCallback(callback: EnemyDefeatedCallback): void {
    this.enemyDefeatedCallback = callback;
  }

  setEnemyAlertedCallback(callback: EnemyAlertedCallback): void {
    this.enemyAlertedCallback = callback;
  }

  // Private helper methods

  private updateEnemyState(enemy: EnemyInstance, deltaTime: number): void {
    enemy.state_timer += deltaTime;

    // Check for state transitions
    if (this.shouldFlee(enemy)) {
      enemy.state = AIState.Fleeing;
    }

    switch (enemy.state) {
      case AIState.Idle:
        enemy.state = AIState.Patrol;
        break;

      case AIState.Patrol:
        if (this.isPlayerInRange(enemy, enemy.current_behavior.engagement_range * 1.5)) {
          enemy.state = AIState.Alert;
          enemy.state_timer = 0;

          if (this.enemyAlertedCallback) {
            this.enemyAlertedCallback(enemy.instance_id);
          }
        }
        break;

      case AIState.Alert:
        if (enemy.state_timer >= 0.5) {
          enemy.state = AIState.Engaging;
          enemy.state_timer = 0;
        }
        break;

      case AIState.Engaging:
        if (this.shouldRetreat(enemy)) {
          enemy.state = AIState.Retreating;
          enemy.state_timer = 0;
        } else if (this.canAttack(enemy)) {
          enemy.current_attack_id = this.selectAttack(enemy);
          if (enemy.current_attack_id) {
            enemy.state = AIState.Attacking;
            enemy.state_timer = 0;
            enemy.last_attack_time = 0;
          }
        }
        break;

      case AIState.Attacking:
        const config = this.enemyConfigs.get(enemy.enemy_config_id);
        if (config) {
          const attack = config.combat_capabilities.attack_types.find(
            a => a.attack_id === enemy.current_attack_id
          );
          const windupTime = attack?.windup_time || 0.5;

          if (enemy.state_timer >= windupTime) {
            enemy.state = AIState.Engaging;
            enemy.state_timer = 0;
            enemy.current_attack_id = '';
          }
        }
        break;

      case AIState.Retreating:
        if (enemy.state_timer >= 2.0) {
          if (!this.shouldRetreat(enemy)) {
            enemy.state = AIState.Engaging;
            enemy.state_timer = 0;
          }
        }
        break;

      case AIState.Fleeing:
        if (!this.shouldFlee(enemy)) {
          enemy.state = AIState.Patrol;
          enemy.state_timer = 0;
        }
        break;

      case AIState.Stunned:
        // Use stored stun duration instead of hardcoded 1.0
        const stunDuration = enemy.stun_duration || 1.0;
        if (enemy.state_timer >= stunDuration) {
          enemy.state = AIState.Engaging;
          enemy.state_timer = 0;
          enemy.stun_duration = undefined;
        }
        break;

      case AIState.Dead:
        // Do nothing
        break;
    }
  }

  private applyTailTierAdaptation(enemy: EnemyInstance): void {
    const config = this.enemyConfigs.get(enemy.enemy_config_id);
    if (!config) return;

    // Start with base behavior
    enemy.current_behavior = { ...config.base_behavior };

    // Apply tail tier adaptation
    const adaptation = config.tail_tier_adaptations[this.playerTailCount];
    if (adaptation) {
      // Apply confidence modifier
      enemy.current_behavior.aggression_level *= adaptation.confidence_modifier;

      // Apply engagement distance modifier
      enemy.current_behavior.engagement_range += adaptation.engagement_distance_modifier;

      // Override tactics if specified
      if (adaptation.has_tactics_override && adaptation.tactics_override) {
        enemy.current_behavior.engagement_style = adaptation.tactics_override;
      }
    }
  }

  private getDistanceToPlayer(enemy: EnemyInstance): number {
    const dx = enemy.pos_x - this.playerX;
    const dz = enemy.pos_z - this.playerZ;
    return Math.sqrt(dx * dx + dz * dz);
  }

  private isPlayerInRange(enemy: EnemyInstance, range: number): boolean {
    return this.getDistanceToPlayer(enemy) <= range;
  }

  private shouldFlee(enemy: EnemyInstance): boolean {
    const config = this.enemyConfigs.get(enemy.enemy_config_id);
    if (!config) return false;

    const adaptation = config.tail_tier_adaptations[this.playerTailCount];
    return adaptation?.flee_on_sight || false;
  }

  private shouldRetreat(enemy: EnemyInstance): boolean {
    const healthRatio = enemy.health / enemy.max_health;
    return healthRatio < enemy.current_behavior.retreat_threshold;
  }

  private canAttack(enemy: EnemyInstance): boolean {
    const config = this.enemyConfigs.get(enemy.enemy_config_id);
    if (!config || config.combat_capabilities.attack_types.length === 0) {
      return false;
    }

    // Check cooldown
    const firstAttack = config.combat_capabilities.attack_types[0];
    if (!firstAttack) return false;
    
    return enemy.last_attack_time <= 0 || enemy.state_timer >= firstAttack.cooldown;
  }

  private selectAttack(enemy: EnemyInstance): string {
    const config = this.enemyConfigs.get(enemy.enemy_config_id);
    if (!config) return '';

    const attacks = config.combat_capabilities.attack_types;
    if (attacks.length === 0) return '';

    // Simple selection - pick first attack in range
    const distToPlayer = this.getDistanceToPlayer(enemy);

    for (const attack of attacks) {
      if (distToPlayer <= attack.range) {
        return attack.attack_id;
      }
    }

    return '';
  }
}

// Singleton instance
let aiServiceInstance: AIService | null = null;

/**
 * Get the AI service singleton
 */
export function getAIService(): AIService {
  if (!aiServiceInstance) {
    aiServiceInstance = new AIService();
  }
  return aiServiceInstance;
}

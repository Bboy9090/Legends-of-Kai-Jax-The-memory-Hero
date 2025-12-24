import { Vector2D, Vec2, Fighter } from '@smash-heroes/shared';

/**
 * Tactical AI System - NPCs that flank, retreat, and capitalize on mistakes
 * Not just patrolling - actual tactical intelligence
 */
export class TacticalAI {
  private aiStates: Map<string, AIState> = new Map();
  private readonly updateInterval = 100; // ms between decision updates
  private lastUpdateTime = 0;

  /**
   * Initialize AI for a fighter
   */
  initializeAI(
    fighterId: string, 
    difficulty: AIDifficulty = AIDifficulty.NORMAL,
    personality: AIPersonality = AIPersonality.BALANCED
  ): void {
    this.aiStates.set(fighterId, {
      fighterId,
      difficulty,
      personality,
      currentBehavior: AIBehavior.ASSESS,
      targetId: null,
      flankingSide: null,
      retreatPosition: null,
      aggressionLevel: this.getBaseAggression(personality),
      lastDecisionTime: 0,
      decisionCooldown: 0,
      observedPlayerPatterns: [],
    });
  }

  /**
   * Update AI decision making
   */
  update(
    deltaTime: number,
    aiFighter: Fighter,
    opponents: Fighter[],
    allies: Fighter[] = []
  ): AIAction {
    const now = performance.now();
    
    if (now - this.lastUpdateTime < this.updateInterval) {
      // Use cached decision
      return this.executeCurrentBehavior(aiFighter, opponents, allies);
    }

    this.lastUpdateTime = now;
    const state = this.aiStates.get(aiFighter.id);
    
    if (!state) {
      return { type: ActionType.IDLE, direction: { x: 0, y: 0 } };
    }

    // Update decision cooldown
    if (state.decisionCooldown > 0) {
      state.decisionCooldown -= deltaTime;
    }

    // Make new decision
    this.makeDecision(state, aiFighter, opponents, allies);

    return this.executeCurrentBehavior(aiFighter, opponents, allies);
  }

  /**
   * Make tactical decision based on situation
   */
  private makeDecision(
    state: AIState,
    aiFighter: Fighter,
    opponents: Fighter[],
    allies: Fighter[]
  ): void {
    // Check health status - retreat if low
    const healthPercent = 1 - (aiFighter.stats.currentDamage / 200); // Assuming 200% is critical
    
    if (healthPercent < 0.3 && state.personality !== AIPersonality.AGGRESSIVE) {
      state.currentBehavior = AIBehavior.RETREAT;
      state.retreatPosition = this.findSafePosition(aiFighter.position, opponents);
      return;
    }

    // Find best target
    const target = this.selectTarget(aiFighter, opponents);
    if (!target) {
      state.currentBehavior = AIBehavior.ASSESS;
      return;
    }

    state.targetId = target.id;
    const distance = Vec2.distance(aiFighter.position, target.position);

    // Assess target vulnerability
    const targetIsVulnerable = this.isTargetVulnerable(target);
    
    // Decision tree based on personality and situation
    if (targetIsVulnerable) {
      // Capitalize on mistake!
      state.currentBehavior = AIBehavior.PUNISH;
      state.aggressionLevel = Math.min(state.aggressionLevel + 0.2, 1.0);
    } else if (distance < 200) {
      // Close range
      if (state.personality === AIPersonality.DEFENSIVE) {
        state.currentBehavior = AIBehavior.COUNTER_ATTACK;
      } else {
        state.currentBehavior = AIBehavior.PRESSURE;
      }
    } else if (distance < 500) {
      // Medium range
      if (allies.length > 0 && this.canFlank(aiFighter, target, allies)) {
        state.currentBehavior = AIBehavior.FLANK;
        state.flankingSide = this.determinFlankSide(aiFighter, target);
      } else {
        state.currentBehavior = AIBehavior.APPROACH;
      }
    } else {
      // Long range
      state.currentBehavior = AIBehavior.APPROACH;
    }

    // Randomize based on difficulty
    if (Math.random() > this.getAccuracy(state.difficulty)) {
      // Make suboptimal decision
      state.currentBehavior = this.getRandomBehavior();
    }
  }

  /**
   * Execute current behavior
   */
  private executeCurrentBehavior(
    aiFighter: Fighter,
    opponents: Fighter[],
    allies: Fighter[]
  ): AIAction {
    const state = this.aiStates.get(aiFighter.id);
    if (!state) {
      return { type: ActionType.IDLE, direction: { x: 0, y: 0 } };
    }

    const target = opponents.find(f => f.id === state.targetId);

    switch (state.currentBehavior) {
      case AIBehavior.APPROACH:
        return this.approachTarget(aiFighter, target);

      case AIBehavior.RETREAT:
        return this.retreat(aiFighter, state.retreatPosition, opponents);

      case AIBehavior.FLANK:
        return this.flank(aiFighter, target, state.flankingSide);

      case AIBehavior.PRESSURE:
        return this.pressure(aiFighter, target);

      case AIBehavior.PUNISH:
        return this.punish(aiFighter, target);

      case AIBehavior.COUNTER_ATTACK:
        return this.counterAttack(aiFighter, target);

      case AIBehavior.ASSESS:
      default:
        return this.assess(aiFighter, opponents);
    }
  }

  /**
   * Approach target
   */
  private approachTarget(aiFighter: Fighter, target?: Fighter): AIAction {
    if (!target) {
      return { type: ActionType.IDLE, direction: { x: 0, y: 0 } };
    }

    const direction = Vec2.normalize(
      Vec2.subtract(target.position, aiFighter.position)
    );

    return {
      type: ActionType.MOVE,
      direction,
      modifiers: ['dash'],
    };
  }

  /**
   * Retreat to safe position
   */
  private retreat(aiFighter: Fighter, retreatPos: Vector2D | null, opponents: Fighter[]): AIAction {
    const safePos = retreatPos ?? this.findSafePosition(aiFighter.position, opponents);
    const direction = Vec2.normalize(
      Vec2.subtract(safePos, aiFighter.position)
    );

    return {
      type: ActionType.MOVE,
      direction,
      modifiers: ['dash'],
    };
  }

  /**
   * Flank target from side
   */
  private flank(aiFighter: Fighter, target: Fighter | undefined, side: 'left' | 'right' | null): AIAction {
    if (!target || !side) {
      return this.approachTarget(aiFighter, target);
    }

    const offsetX = side === 'left' ? -150 : 150;
    const flankPosition: Vector2D = {
      x: target.position.x + offsetX,
      y: target.position.y,
    };

    const direction = Vec2.normalize(
      Vec2.subtract(flankPosition, aiFighter.position)
    );

    return {
      type: ActionType.MOVE,
      direction,
      modifiers: ['dash'],
    };
  }

  /**
   * Apply pressure with attacks
   */
  private pressure(aiFighter: Fighter, target: Fighter | undefined): AIAction {
    if (!target) {
      return { type: ActionType.IDLE, direction: { x: 0, y: 0 } };
    }

    const distance = Vec2.distance(aiFighter.position, target.position);

    if (distance < 100) {
      // Close - use quick attacks
      return {
        type: ActionType.ATTACK,
        attackType: 'jab',
        direction: this.getDirectionTo(aiFighter, target),
      };
    } else {
      // Approach while ready to attack
      return this.approachTarget(aiFighter, target);
    }
  }

  /**
   * Punish vulnerable opponent
   */
  private punish(aiFighter: Fighter, target: Fighter | undefined): AIAction {
    if (!target) {
      return { type: ActionType.IDLE, direction: { x: 0, y: 0 } };
    }

    // Use strong attack to punish
    return {
      type: ActionType.ATTACK,
      attackType: 'smash',
      direction: this.getDirectionTo(aiFighter, target),
    };
  }

  /**
   * Counter-attack defensively
   */
  private counterAttack(aiFighter: Fighter, target: Fighter | undefined): AIAction {
    if (!target) {
      return { type: ActionType.IDLE, direction: { x: 0, y: 0 } };
    }

    // Wait for opening, then counter
    return {
      type: ActionType.DEFEND,
      direction: this.getDirectionTo(aiFighter, target),
      modifiers: ['counter'],
    };
  }

  /**
   * Assess situation
   */
  private assess(aiFighter: Fighter, opponents: Fighter[]): AIAction {
    // Keep distance and observe
    if (opponents.length > 0) {
      const nearest = this.findNearestOpponent(aiFighter, opponents);
      const distance = Vec2.distance(aiFighter.position, nearest.position);
      
      if (distance < 300) {
        // Back off to safe distance
        const direction = Vec2.normalize(
          Vec2.subtract(aiFighter.position, nearest.position)
        );
        return {
          type: ActionType.MOVE,
          direction,
        };
      }
    }

    return { type: ActionType.IDLE, direction: { x: 0, y: 0 } };
  }

  // Helper methods
  private selectTarget(aiFighter: Fighter, opponents: Fighter[]): Fighter | null {
    if (opponents.length === 0) return null;
    
    // Prefer low health targets
    return opponents.reduce((best, current) => {
      if (!best) return current;
      return current.stats.currentDamage > best.stats.currentDamage ? current : best;
    });
  }

  private isTargetVulnerable(target: Fighter): boolean {
    // Check if target is in lag state, charging, or otherwise vulnerable
    // This would integrate with fighter state machine
    return target.stats.currentDamage > 100; // Simplified
  }

  private canFlank(aiFighter: Fighter, target: Fighter, allies: Fighter[]): boolean {
    // Check if an ally is engaging target from different side
    return allies.some(ally => {
      const allyToTarget = Vec2.subtract(target.position, ally.position);
      const selfToTarget = Vec2.subtract(target.position, aiFighter.position);
      const angle = Math.abs(Vec2.angle(allyToTarget) - Vec2.angle(selfToTarget));
      return angle > Math.PI / 3; // 60 degrees difference
    });
  }

  private determinFlankSide(aiFighter: Fighter, target: Fighter): 'left' | 'right' {
    return aiFighter.position.x < target.position.x ? 'left' : 'right';
  }

  private findSafePosition(currentPos: Vector2D, threats: Fighter[]): Vector2D {
    // Find position away from all threats
    let safeDirection = { x: 0, y: 0 };
    
    for (const threat of threats) {
      const away = Vec2.subtract(currentPos, threat.position);
      safeDirection = Vec2.add(safeDirection, away);
    }

    if (Vec2.magnitude(safeDirection) === 0) {
      safeDirection = { x: 1, y: 0 };
    }

    const normalized = Vec2.normalize(safeDirection);
    return Vec2.add(currentPos, Vec2.multiply(normalized, 500));
  }

  private findNearestOpponent(aiFighter: Fighter, opponents: Fighter[]): Fighter {
    return opponents.reduce((nearest, current) => {
      const currentDist = Vec2.distance(aiFighter.position, current.position);
      const nearestDist = Vec2.distance(aiFighter.position, nearest.position);
      return currentDist < nearestDist ? current : nearest;
    });
  }

  private getDirectionTo(from: Fighter, to: Fighter): Vector2D {
    return Vec2.normalize(Vec2.subtract(to.position, from.position));
  }

  private getBaseAggression(personality: AIPersonality): number {
    switch (personality) {
      case AIPersonality.AGGRESSIVE: return 0.8;
      case AIPersonality.DEFENSIVE: return 0.3;
      case AIPersonality.BALANCED: return 0.5;
      case AIPersonality.TACTICAL: return 0.6;
    }
  }

  private getAccuracy(difficulty: AIDifficulty): number {
    switch (difficulty) {
      case AIDifficulty.EASY: return 0.5;
      case AIDifficulty.NORMAL: return 0.75;
      case AIDifficulty.HARD: return 0.9;
      case AIDifficulty.LEGENDARY: return 0.95;
    }
  }

  private getRandomBehavior(): AIBehavior {
    const behaviors = Object.values(AIBehavior);
    if (behaviors.length === 0) return AIBehavior.ASSESS;
    const randomIndex = Math.floor(Math.random() * behaviors.length);
    return behaviors[randomIndex] ?? AIBehavior.ASSESS;
  }

  /**
   * Check if a fighter is AI-controlled
   */
  isAIControlled(fighterId: string): boolean {
    return this.aiStates.has(fighterId);
  }

  /**
   * Get AI state for a fighter (for debugging)
   */
  getAIState(fighterId: string): AIState | undefined {
    return this.aiStates.get(fighterId);
  }
}

export interface AIState {
  fighterId: string;
  difficulty: AIDifficulty;
  personality: AIPersonality;
  currentBehavior: AIBehavior;
  targetId: string | null;
  flankingSide: 'left' | 'right' | null;
  retreatPosition: Vector2D | null;
  aggressionLevel: number;
  lastDecisionTime: number;
  decisionCooldown: number;
  observedPlayerPatterns: string[];
}

export interface AIAction {
  type: ActionType;
  direction: Vector2D;
  attackType?: string;
  modifiers?: string[];
}

export enum AIBehavior {
  ASSESS = 'assess',
  APPROACH = 'approach',
  RETREAT = 'retreat',
  FLANK = 'flank',
  PRESSURE = 'pressure',
  PUNISH = 'punish',
  COUNTER_ATTACK = 'counter_attack',
}

export enum AIDifficulty {
  EASY = 'easy',
  NORMAL = 'normal',
  HARD = 'hard',
  LEGENDARY = 'legendary',
}

export enum AIPersonality {
  AGGRESSIVE = 'aggressive',
  DEFENSIVE = 'defensive',
  BALANCED = 'balanced',
  TACTICAL = 'tactical',
}

export enum ActionType {
  IDLE = 'idle',
  MOVE = 'move',
  ATTACK = 'attack',
  DEFEND = 'defend',
  SPECIAL = 'special',
}

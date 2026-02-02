/**
 * LEGENDS OF KAI-JAX: Enemy AI System
 * Adaptive enemy that learns player patterns
 * 
 * "Design beats habit. Memory beats design."
 */

import { Fighter, MOVE_DATA } from './Fighter';
import { GAME_STATES, GAME_CONFIG, Vector2 } from '../engine/GameEngine';

// Enemy Types (Synthetic Apexes)
export const ENEMY_TYPES = {
  iterator: {
    name: 'Iterator',
    color: '#FF3B30',
    accentColor: '#8B0000',
    description: 'Tracks and counters repeated patterns',
    health: 80,
    adaptSpeed: 0.15,
    aggression: 0.6,
  },
  nullStalker: {
    name: 'Null Stalker',
    color: '#BF5AF2',
    accentColor: '#4B0082',
    description: 'Punishes panic and blind spots',
    health: 70,
    adaptSpeed: 0.08,
    aggression: 0.4,
  },
  bastion: {
    name: 'Bastion',
    color: '#8B8B8B',
    accentColor: '#4A4A4A',
    description: 'Heavy armor, teaches endurance',
    health: 150,
    adaptSpeed: 0.05,
    aggression: 0.3,
  },
  phaseWeaver: {
    name: 'Phase Weaver',
    color: '#64D2FF',
    accentColor: '#0066CC',
    description: 'Creates timing distortions',
    health: 60,
    adaptSpeed: 0.12,
    aggression: 0.5,
  },
};

// AI States
export const AI_STATES = {
  OBSERVE: 'OBSERVE',
  APPROACH: 'APPROACH',
  PRESSURE: 'PRESSURE',
  COMMIT: 'COMMIT',
  RECOVER: 'RECOVER',
  ADAPT: 'ADAPT',
};

export class Enemy extends Fighter {
  constructor(x, y, type = 'iterator') {
    const typeData = ENEMY_TYPES[type] || ENEMY_TYPES.iterator;
    
    super(x, y, {
      width: 70,
      height: 130,
      maxHealth: typeData.health,
      walkSpeed: 3,
      runSpeed: 6,
      jumpForce: -14,
      color: typeData.color,
      accentColor: typeData.accentColor,
    });

    this.type = type;
    this.typeData = typeData;
    this.name = typeData.name;

    // AI State Machine
    this.aiState = AI_STATES.OBSERVE;
    this.aiStateTimer = 0;
    this.target = null;

    // Behavior parameters
    this.aggression = typeData.aggression;
    this.adaptSpeed = typeData.adaptSpeed;
    this.preferredDistance = 150;
    this.attackRange = 100;

    // Pattern Learning (The Design Philosophy)
    this.playerPatterns = {
      moves: {}, // Count of player moves seen
      timings: [], // Recent timing patterns
      positions: [], // Where player attacks from
      recoveries: [], // When player is vulnerable
    };
    this.adaptationLevel = 0;
    this.resistances = {}; // Resistance to specific moves

    // Decision making
    this.decisionCooldown = 0;
    this.lastDecision = null;
    this.reactionDelay = 8; // Frames before reacting (makes it beatable)
    this.pendingAction = null;
    this.pendingActionTimer = 0;
  }

  // Set the player as target
  setTarget(target) {
    this.target = target;
  }

  // Learn from player actions (The Iterator's curse)
  learnPattern(moveType, context) {
    // Track move frequency
    this.playerPatterns.moves[moveType] = (this.playerPatterns.moves[moveType] || 0) + 1;

    // Track timing (frames since last action)
    this.playerPatterns.timings.push(this.aiStateTimer);
    if (this.playerPatterns.timings.length > 20) {
      this.playerPatterns.timings.shift();
    }

    // Track position
    if (this.target) {
      this.playerPatterns.positions.push({
        x: this.target.x - this.x,
        y: this.target.y - this.y,
      });
      if (this.playerPatterns.positions.length > 10) {
        this.playerPatterns.positions.shift();
      }
    }

    // Build resistance to repeated moves
    if (this.playerPatterns.moves[moveType] > 3) {
      this.resistances[moveType] = Math.min(
        0.5,
        (this.resistances[moveType] || 0) + this.adaptSpeed
      );
      this.adaptationLevel += this.adaptSpeed;
    }
  }

  // Check if player is being predictable
  isPredictable() {
    const moves = Object.entries(this.playerPatterns.moves);
    if (moves.length === 0) return false;

    const total = moves.reduce((sum, [_, count]) => sum + count, 0);
    const mostUsed = Math.max(...moves.map(([_, count]) => count));

    // If one move is used more than 40% of the time
    return mostUsed / total > 0.4;
  }

  // Predict player's next move
  predictPlayerAction() {
    const moves = Object.entries(this.playerPatterns.moves);
    if (moves.length === 0) return null;

    // Find most common move
    moves.sort((a, b) => b[1] - a[1]);
    return moves[0][0];
  }

  // Get best response to predicted action
  getCounterAction(predictedMove) {
    const counters = {
      lightAttack: 'block',
      heavyAttack: 'backdash',
      dashAttack: 'jump',
      flareLash: 'block',
      ridgeStep: 'heavyAttack',
    };

    return counters[predictedMove] || 'approach';
  }

  // AI Decision Making
  makeDecision() {
    if (this.decisionCooldown > 0) {
      this.decisionCooldown--;
      return;
    }

    if (!this.target) return;

    const distX = this.target.x - this.x;
    const distY = this.target.y - this.y;
    const distance = Math.abs(distX);

    // Face the target
    this.facing = distX > 0 ? 1 : -1;

    // Check if target is attacking
    const targetAttacking = this.target.state === GAME_STATES.ATTACKING ||
                           this.target.state === GAME_STATES.TAIL_ACTION;

    // State machine
    switch (this.aiState) {
      case AI_STATES.OBSERVE:
        this.handleObserve(distance, targetAttacking);
        break;

      case AI_STATES.APPROACH:
        this.handleApproach(distance, distX);
        break;

      case AI_STATES.PRESSURE:
        this.handlePressure(distance, targetAttacking);
        break;

      case AI_STATES.COMMIT:
        this.handleCommit(distance);
        break;

      case AI_STATES.RECOVER:
        this.handleRecover();
        break;

      case AI_STATES.ADAPT:
        this.handleAdapt();
        break;
    }

    this.decisionCooldown = 10 + Math.random() * 10; // Vary timing
  }

  handleObserve(distance, targetAttacking) {
    this.aiStateTimer++;

    // Learn if target attacks
    if (targetAttacking && this.target.currentMove) {
      this.learnPattern(this.target.currentMove.name, 'observe');
    }

    // Transition based on aggression and distance
    if (this.aiStateTimer > 60) {
      if (distance > this.preferredDistance * 1.5) {
        this.setAiState(AI_STATES.APPROACH);
      } else if (distance < this.attackRange && Math.random() < this.aggression) {
        this.setAiState(AI_STATES.COMMIT);
      } else {
        this.setAiState(AI_STATES.PRESSURE);
      }
    }

    // React to attacks
    if (targetAttacking && distance < this.attackRange * 1.5) {
      this.queueAction('block', this.reactionDelay);
    }
  }

  handleApproach(distance, distX) {
    // Move toward target
    this.vx = Math.sign(distX) * this.walkSpeed;
    this.setState(GAME_STATES.WALKING);

    // Switch to pressure when close enough
    if (distance < this.preferredDistance) {
      this.setAiState(AI_STATES.PRESSURE);
    }

    // Occasionally dash in
    if (distance > 200 && Math.random() < 0.02) {
      this.vx = Math.sign(distX) * this.runSpeed * 2;
    }
  }

  handlePressure(distance, targetAttacking) {
    // Hover at preferred distance
    const targetDist = this.preferredDistance;
    const diff = distance - targetDist;

    if (Math.abs(diff) > 30) {
      this.vx = Math.sign(diff) * this.walkSpeed * 0.5 * this.facing;
    } else {
      this.vx = 0;
    }

    // Look for openings
    const playerRecovering = this.target.state === GAME_STATES.RECOVERY ||
                            this.target.stunFrames > 0;

    if (playerRecovering) {
      this.setAiState(AI_STATES.COMMIT);
    }

    // Check if player is predictable
    if (this.isPredictable() && this.adaptationLevel > 0.3) {
      const predicted = this.predictPlayerAction();
      const counter = this.getCounterAction(predicted);
      this.queueAction(counter, this.reactionDelay * 0.5); // React faster when adapted
    }

    // Random commit chance based on aggression
    if (Math.random() < this.aggression * 0.03) {
      this.setAiState(AI_STATES.COMMIT);
    }

    // React to incoming attacks
    if (targetAttacking && distance < this.attackRange * 1.2) {
      if (Math.random() < 0.6 + this.adaptationLevel * 0.3) {
        this.queueAction('block', this.reactionDelay);
      }
    }
  }

  handleCommit(distance) {
    // Attack!
    if (distance < this.attackRange) {
      // Choose attack based on situation
      if (this.target.state === GAME_STATES.BLOCKING) {
        // Use heavy to break guard
        this.queueAction('heavyAttack', 2);
      } else if (distance < 60) {
        // Close range - light attack
        this.queueAction('lightAttack', 2);
      } else {
        // Mid range - heavy attack
        this.queueAction('heavyAttack', 2);
      }
    } else {
      // Close the gap
      this.vx = this.facing * this.runSpeed;
    }

    // Return to pressure after attacking
    if (this.state === GAME_STATES.ATTACKING) {
      this.setAiState(AI_STATES.RECOVER);
    }
  }

  handleRecover() {
    // Back off after attacking
    this.vx = -this.facing * this.walkSpeed;

    this.aiStateTimer++;
    if (this.aiStateTimer > 30) {
      this.setAiState(AI_STATES.OBSERVE);
    }
  }

  handleAdapt() {
    // Special state when highly adapted
    // More aggressive, better reactions
    this.aggression = Math.min(0.9, this.typeData.aggression + this.adaptationLevel * 0.3);
    this.reactionDelay = Math.max(4, 8 - this.adaptationLevel * 4);

    this.setAiState(AI_STATES.PRESSURE);
  }

  setAiState(newState) {
    this.aiState = newState;
    this.aiStateTimer = 0;
  }

  queueAction(action, delay) {
    this.pendingAction = action;
    this.pendingActionTimer = delay;
  }

  executePendingAction() {
    if (!this.pendingAction) return;

    switch (this.pendingAction) {
      case 'block':
        this.setState(GAME_STATES.BLOCKING);
        break;
      case 'backdash':
        this.vx = -this.facing * this.dashSpeed;
        this.invincibleFrames = 8;
        break;
      case 'jump':
        if (this.grounded) {
          this.vy = this.jumpForce;
          this.grounded = false;
        }
        break;
      case 'lightAttack':
        this.startMove('lightAttack');
        break;
      case 'heavyAttack':
        this.startMove('heavyAttack');
        break;
      case 'approach':
        this.setAiState(AI_STATES.APPROACH);
        break;
    }

    this.pendingAction = null;
  }

  // Override onHit to track vulnerability
  onHit(hitbox, blocked) {
    super.onHit(hitbox, blocked);

    if (!blocked) {
      // Record when we got hit
      this.playerPatterns.recoveries.push({
        myState: this.aiState,
        distance: this.target ? Math.abs(this.target.x - this.x) : 0,
      });

      // Become more defensive after taking hits
      this.aggression = Math.max(0.2, this.aggression - 0.1);
    }

    // Return to observe after being hit
    this.setAiState(AI_STATES.OBSERVE);
  }

  // Update
  update(deltaTime, keys, gamepad) {
    // Process pending actions
    if (this.pendingAction) {
      this.pendingActionTimer--;
      if (this.pendingActionTimer <= 0) {
        this.executePendingAction();
      }
    }

    // AI decision making
    this.makeDecision();

    // Check for high adaptation
    if (this.adaptationLevel > 0.5 && this.aiState !== AI_STATES.ADAPT) {
      // Visual indicator of adaptation
      if (Math.random() < 0.01) {
        this.setAiState(AI_STATES.ADAPT);
      }
    }

    // Parent update
    super.update(deltaTime, keys, gamepad);
  }

  // Render with adaptation indicator
  render(ctx) {
    super.render(ctx);

    // Adaptation glow
    if (this.adaptationLevel > 0.2) {
      ctx.save();
      ctx.globalAlpha = this.adaptationLevel * 0.5;
      ctx.strokeStyle = '#FF3B30';
      ctx.lineWidth = 2 + this.adaptationLevel * 3;
      ctx.shadowColor = '#FF3B30';
      ctx.shadowBlur = 20;
      ctx.strokeRect(this.x - 5, this.y - 5, this.width + 10, this.height + 10);
      ctx.restore();
    }

    // AI State indicator (debug)
    if (this.engine?.debug) {
      ctx.fillStyle = '#fff';
      ctx.font = '10px monospace';
      ctx.fillText(`AI: ${this.aiState}`, this.x, this.y - 55);
      ctx.fillText(`Adapt: ${(this.adaptationLevel * 100).toFixed(0)}%`, this.x, this.y - 65);
    }

    // Name above health bar
    ctx.fillStyle = this.color;
    ctx.font = 'bold 12px Rajdhani, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.name, this.x + this.width / 2, this.y - 20);
  }
}

export default Enemy;

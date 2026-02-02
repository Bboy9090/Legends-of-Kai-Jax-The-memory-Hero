/**
 * LEGENDS OF KAI-JAX: Fighter Base Class
 * Frame-based state machine for combat
 */

import { GAME_CONFIG, GAME_STATES, Vector2, Hitbox, Hurtbox } from '../engine/GameEngine';

export const MOVE_DATA = {
  // Light Attack
  lightAttack: {
    startup: 4,
    active: 3,
    recovery: 8,
    damage: 8,
    hitstun: 12,
    blockstun: 6,
    knockback: new Vector2(3, 0),
    cancelInto: ['lightAttack', 'heavyAttack', 'special'],
  },
  // Heavy Attack
  heavyAttack: {
    startup: 10,
    active: 5,
    recovery: 18,
    damage: 18,
    hitstun: 22,
    blockstun: 12,
    knockback: new Vector2(8, -2),
    cancelInto: ['special'],
  },
  // Dash Attack
  dashAttack: {
    startup: 6,
    active: 8,
    recovery: 14,
    damage: 12,
    hitstun: 16,
    blockstun: 8,
    knockback: new Vector2(6, -4),
    cancelInto: [],
  },
};

export class Fighter {
  constructor(x, y, config = {}) {
    // Position & Physics
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.facing = 1; // 1 = right, -1 = left
    this.grounded = true;

    // Dimensions
    this.width = config.width || 60;
    this.height = config.height || 120;

    // Stats
    this.maxHealth = config.maxHealth || 100;
    this.health = this.maxHealth;
    this.walkSpeed = config.walkSpeed || 4;
    this.runSpeed = config.runSpeed || 8;
    this.jumpForce = config.jumpForce || -16;
    this.dashSpeed = config.dashSpeed || 15;
    this.dashFrames = config.dashFrames || 12;

    // State Machine
    this.state = GAME_STATES.IDLE;
    this.stateFrame = 0;
    this.currentMove = null;
    this.moveFrame = 0;
    this.canCancel = false;
    this.comboCount = 0;

    // Hitstun/Blockstun
    this.stunFrames = 0;
    this.invincibleFrames = 0;

    // Hitboxes/Hurtboxes
    this.hitboxes = [];
    this.hurtboxes = [
      new Hurtbox(0, 0, this.width, this.height)
    ];

    // Colors
    this.color = config.color || '#FFD60A';
    this.accentColor = config.accentColor || '#FF3B30';

    // Reference to engine (set when added)
    this.engine = null;

    // Input tracking
    this.inputBuffer = [];
  }

  // State Transitions
  setState(newState, resetFrame = true) {
    if (this.state !== newState) {
      this.state = newState;
      if (resetFrame) {
        this.stateFrame = 0;
      }
    }
  }

  startMove(moveName) {
    const move = MOVE_DATA[moveName];
    if (!move) return false;

    this.currentMove = { name: moveName, ...move };
    this.moveFrame = 0;
    this.setState(GAME_STATES.ATTACKING);
    this.canCancel = false;

    // Create hitbox for this move
    this.hitboxes = [this.createMoveHitbox(move)];

    return true;
  }

  createMoveHitbox(move) {
    const hb = new Hitbox(
      this.x + (this.facing > 0 ? this.width : -60),
      this.y + 20,
      60,
      60,
      move.damage,
      move.hitstun,
      move.knockback.multiply(this.facing)
    );
    hb.active = false;
    return hb;
  }

  updateMove() {
    if (!this.currentMove) return;

    const move = this.currentMove;
    this.moveFrame++;

    // Startup phase
    if (this.moveFrame < move.startup) {
      // Hitbox not active yet
    }
    // Active phase
    else if (this.moveFrame < move.startup + move.active) {
      if (this.hitboxes.length > 0) {
        this.hitboxes[0].active = true;
        // Update hitbox position
        this.hitboxes[0].setPosition(
          this.x + (this.facing > 0 ? this.width : -60),
          this.y + 20
        );
      }
      // Can cancel on hit during active frames
      this.canCancel = true;
    }
    // Recovery phase
    else if (this.moveFrame < move.startup + move.active + move.recovery) {
      if (this.hitboxes.length > 0) {
        this.hitboxes[0].active = false;
      }
    }
    // Move complete
    else {
      this.endMove();
    }
  }

  endMove() {
    this.currentMove = null;
    this.moveFrame = 0;
    this.hitboxes = [];
    this.canCancel = false;
    this.setState(GAME_STATES.IDLE);
  }

  // Combat
  onHit(hitbox, blocked) {
    if (blocked) {
      this.stunFrames = hitbox.hitstun * 0.5; // Blockstun
      this.vx = hitbox.knockback.x * 0.3 * -this.facing;
      this.setState(GAME_STATES.BLOCKING);
    } else {
      this.health -= hitbox.damage;
      this.stunFrames = hitbox.hitstun;
      this.vx = hitbox.knockback.x;
      this.vy = hitbox.knockback.y;
      this.setState(GAME_STATES.HITSTUN);
      this.comboCount = 0;

      // Check for knockdown
      if (this.health <= 0) {
        this.setState(GAME_STATES.KNOCKDOWN);
        this.stunFrames = 60;
      }
    }
  }

  onHitConfirm(blocked) {
    if (!blocked) {
      this.comboCount++;
    }
  }

  // Physics
  applyPhysics() {
    // Gravity
    if (!this.grounded) {
      this.vy += GAME_CONFIG.GRAVITY;
    }

    // Apply velocity
    this.x += this.vx;
    this.y += this.vy;

    // Ground collision
    if (this.y + this.height > GAME_CONFIG.GROUND_Y) {
      this.y = GAME_CONFIG.GROUND_Y - this.height;
      this.vy = 0;
      this.grounded = true;
    } else {
      this.grounded = false;
    }

    // Friction
    if (this.grounded && this.state !== GAME_STATES.WALKING && this.state !== GAME_STATES.RUNNING) {
      this.vx *= GAME_CONFIG.FRICTION;
    }

    // Wall bounds
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > GAME_CONFIG.CANVAS_WIDTH) {
      this.x = GAME_CONFIG.CANVAS_WIDTH - this.width;
    }

    // Update hurtbox position
    if (this.hurtboxes.length > 0) {
      this.hurtboxes[0].setPosition(this.x, this.y);
    }
  }

  // Update (called every frame)
  update(deltaTime, keys, gamepad) {
    this.stateFrame++;

    // Invincibility
    if (this.invincibleFrames > 0) {
      this.invincibleFrames--;
      this.hurtboxes.forEach(hb => hb.invincible = true);
    } else {
      this.hurtboxes.forEach(hb => hb.invincible = false);
    }

    // Stun state
    if (this.stunFrames > 0) {
      this.stunFrames--;
      if (this.stunFrames <= 0) {
        if (this.state === GAME_STATES.KNOCKDOWN) {
          this.setState(GAME_STATES.RECOVERY);
          this.invincibleFrames = 30;
        } else {
          this.setState(GAME_STATES.IDLE);
        }
      }
      this.applyPhysics();
      return;
    }

    // Recovery
    if (this.state === GAME_STATES.RECOVERY) {
      this.stateFrame++;
      if (this.stateFrame > 20) {
        this.setState(GAME_STATES.IDLE);
      }
      this.applyPhysics();
      return;
    }

    // Attack state
    if (this.state === GAME_STATES.ATTACKING) {
      this.updateMove();
      this.applyPhysics();
      return;
    }

    // Normal state - process input
    this.processInput(keys, gamepad);
    this.applyPhysics();
  }

  processInput(keys, gamepad) {
    // Override in subclass
  }

  // Rendering
  render(ctx) {
    const { x, y, width, height, facing, color, accentColor, state, health, maxHealth } = this;

    ctx.save();

    // Flash when hit
    if (this.stunFrames > 0 && this.state === GAME_STATES.HITSTUN) {
      ctx.globalAlpha = 0.5 + Math.sin(this.stateFrame * 0.5) * 0.3;
    }

    // Flash when invincible
    if (this.invincibleFrames > 0) {
      ctx.globalAlpha = 0.3 + Math.sin(this.stateFrame * 0.3) * 0.3;
    }

    // Draw shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(x + width / 2, GAME_CONFIG.GROUND_Y, width / 2, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Main body
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = state === GAME_STATES.ATTACKING ? 20 : 10;

    // Body shape based on state
    if (state === GAME_STATES.ATTACKING) {
      // Attack pose - leaning forward
      ctx.save();
      ctx.translate(x + width / 2, y + height);
      ctx.scale(facing, 1);
      ctx.translate(-width / 2, -height);
      
      ctx.fillRect(0, 0, width + 20, height);
      
      // Attack arm
      ctx.fillStyle = accentColor;
      ctx.fillRect(width, height * 0.3, 40, 20);
      
      ctx.restore();
    } else if (state === GAME_STATES.BLOCKING) {
      // Block pose - crouching
      ctx.fillRect(x, y + height * 0.2, width, height * 0.8);
      ctx.fillStyle = '#64D2FF';
      ctx.fillRect(x - 10, y + height * 0.2, 15, height * 0.6);
    } else {
      // Normal pose
      ctx.fillRect(x, y, width, height);
    }

    // Face direction indicator
    ctx.fillStyle = '#fff';
    const eyeX = x + (facing > 0 ? width * 0.6 : width * 0.2);
    ctx.fillRect(eyeX, y + 20, 8, 8);

    ctx.shadowBlur = 0;

    // Health bar
    const hpWidth = 60;
    const hpHeight = 6;
    const hpX = x + (width - hpWidth) / 2;
    const hpY = y - 15;

    ctx.fillStyle = '#333';
    ctx.fillRect(hpX, hpY, hpWidth, hpHeight);
    
    const hpPercent = health / maxHealth;
    ctx.fillStyle = hpPercent > 0.5 ? '#30D158' : hpPercent > 0.25 ? '#FFD60A' : '#FF3B30';
    ctx.fillRect(hpX, hpY, hpWidth * hpPercent, hpHeight);

    // State text (debug)
    if (this.engine?.debug) {
      ctx.fillStyle = '#fff';
      ctx.font = '10px monospace';
      ctx.fillText(`${state} F:${this.stateFrame}`, x, y - 25);
      if (this.currentMove) {
        ctx.fillText(`${this.currentMove.name} ${this.moveFrame}`, x, y - 35);
      }
    }

    ctx.restore();
  }
}

export default Fighter;

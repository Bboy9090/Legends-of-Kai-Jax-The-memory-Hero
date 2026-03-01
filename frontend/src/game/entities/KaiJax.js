/**
 * LEGENDS OF KAI-JAX: The Memory King
 * Playable Character with 9-Tail System
 * 
 * "Two brothers who refused to forget each other."
 */

import { Fighter, MOVE_DATA } from './Fighter';
import { GAME_STATES, Vector2, Hitbox } from '../engine/GameEngine';

// 9-Tail System Data
export const TAIL_DATA = {
  ember: {
    id: 1,
    name: 'Ember Tail',
    element: 'Fire',
    color: '#FF3B30',
    description: 'Burst damage with ignite stacks',
    ability: 'flareLash',
    cooldown: 60,
    meterCost: 20,
  },
  gale: {
    id: 2,
    name: 'Gale Tail',
    element: 'Wind',
    color: '#64D2FF',
    description: 'Mobility and air control',
    ability: 'ridgeStep',
    cooldown: 30,
    meterCost: 15,
  },
  shade: {
    id: 3,
    name: 'Shade Tail',
    element: 'Shadow',
    color: '#BF5AF2',
    description: 'Stealth and counter setups',
    ability: 'ghostReversal',
    cooldown: 90,
    meterCost: 30,
  },
  volt: {
    id: 4,
    name: 'Volt Tail',
    element: 'Lightning',
    color: '#FFD60A',
    description: 'Speed and stun windows',
    ability: 'snapBind',
    cooldown: 45,
    meterCost: 25,
  },
  stone: {
    id: 5,
    name: 'Stone Tail',
    element: 'Earth',
    color: '#8B8B8B',
    description: 'Guard break and armor',
    ability: 'quakeHook',
    cooldown: 75,
    meterCost: 35,
  },
  tide: {
    id: 6,
    name: 'Tide Tail',
    element: 'Water',
    color: '#007AFF',
    description: 'Sustain and cleanse',
    ability: 'undertowLoop',
    cooldown: 60,
    meterCost: 20,
  },
  thorn: {
    id: 7,
    name: 'Thorn Tail',
    element: 'Nature',
    color: '#30D158',
    description: 'Traps and area control',
    ability: 'briarNet',
    cooldown: 90,
    meterCost: 30,
  },
  prism: {
    id: 8,
    name: 'Prism Tail',
    element: 'Light',
    color: '#FFFFFF',
    description: 'Reflect and counter tech',
    ability: 'mirrorCut',
    cooldown: 120,
    meterCost: 40,
  },
  void: {
    id: 9,
    name: 'Void Tail',
    element: 'Memory',
    color: '#2E2EFE',
    description: 'Reality edit ability - The Crown',
    ability: 'architectsDenial',
    cooldown: 300,
    meterCost: 100,
  },
};

// Tail Abilities (Special Moves)
export const TAIL_MOVES = {
  flareLash: {
    startup: 8,
    active: 6,
    recovery: 20,
    damage: 22,
    hitstun: 24,
    blockstun: 14,
    knockback: new Vector2(10, -3),
    effect: 'burn', // Deals 2 damage over 5 frames after hit
  },
  ridgeStep: {
    startup: 2,
    active: 12,
    recovery: 8,
    damage: 0,
    movement: new Vector2(18, -8), // Dash through enemies
    invincible: true,
  },
  ghostReversal: {
    startup: 1, // Counter window
    active: 15,
    recovery: 25,
    damage: 28,
    hitstun: 30,
    blockstun: 18,
    knockback: new Vector2(-12, -5), // Reverse knockback
    counter: true, // Only activates on being hit
  },
  snapBind: {
    startup: 5,
    active: 4,
    recovery: 15,
    damage: 10,
    hitstun: 40, // Long stun for follow-up
    blockstun: 20,
    knockback: new Vector2(0, 0),
    stun: true,
  },
  quakeHook: {
    startup: 15,
    active: 8,
    recovery: 25,
    damage: 30,
    hitstun: 28,
    blockstun: 0, // Guard break
    knockback: new Vector2(5, -8),
    guardBreak: true,
  },
  undertowLoop: {
    startup: 10,
    active: 20,
    recovery: 15,
    damage: 5,
    heal: 15, // Heal on hit
    knockback: new Vector2(8, 0),
  },
  briarNet: {
    startup: 20,
    active: 180, // Trap lasts 3 seconds
    recovery: 20,
    damage: 12,
    hitstun: 60, // Root effect
    trap: true,
  },
  mirrorCut: {
    startup: 3, // Fast reflect window
    active: 8,
    recovery: 30,
    damage: 0, // Returns projectile damage
    reflect: true,
  },
  architectsDenial: {
    startup: 30,
    active: 1,
    recovery: 60,
    damage: 50,
    hitstun: 120,
    knockback: new Vector2(0, -15),
    ultimate: true, // Freezes enemy, shows coronation effect
  },
};

export class KaiJax extends Fighter {
  constructor(x, y) {
    super(x, y, {
      width: 60,
      height: 120,
      maxHealth: 100,
      walkSpeed: 5,
      runSpeed: 10,
      jumpForce: -18,
      dashSpeed: 16,
      color: '#FFD60A', // Kai's ember gold
      accentColor: '#64D2FF', // Jax's ice blue
    });

    // 9-Tail System
    this.tails = {
      ember: { unlocked: true, cooldown: 0, active: false },
      gale: { unlocked: true, cooldown: 0, active: false },
      shade: { unlocked: true, cooldown: 0, active: false },
      volt: { unlocked: false, cooldown: 0, active: false },
      stone: { unlocked: false, cooldown: 0, active: false },
      tide: { unlocked: false, cooldown: 0, active: false },
      thorn: { unlocked: false, cooldown: 0, active: false },
      prism: { unlocked: false, cooldown: 0, active: false },
      void: { unlocked: false, cooldown: 0, active: false },
    };
    this.activeTail = 'ember';
    this.tailMeter = 0;
    this.maxTailMeter = 100;

    // Memory System (Synergy/Resonance/Dread)
    this.synergy = 0; // Builds from successful hits
    this.resonance = 0; // Builds from varied play
    this.dread = 0; // Builds from damage taken

    // Combo system
    this.comboCount = 0;
    this.lastMoves = []; // Track recent moves for variety bonus

    // Dash state
    this.isDashing = false;
    this.dashDirection = 0;
    this.dashTimer = 0;

    // Counter state
    this.isCountering = false;
    this.counterTimer = 0;

    // Visual tails
    this.tailVisuals = [];
    this.initTailVisuals();
  }

  initTailVisuals() {
    // Create visual representations for active tails
    const unlockedTails = Object.entries(this.tails)
      .filter(([_, data]) => data.unlocked)
      .map(([key, _]) => TAIL_DATA[key]);

    this.tailVisuals = unlockedTails.map((tail, i) => ({
      ...tail,
      angle: (Math.PI * 0.3) + (i * 0.4),
      length: 40 + i * 5,
      wave: Math.random() * Math.PI * 2,
    }));
  }

  // Switch active tail
  switchTail(direction) {
    const unlockedTails = Object.keys(this.tails).filter(k => this.tails[k].unlocked);
    const currentIndex = unlockedTails.indexOf(this.activeTail);
    let newIndex = currentIndex + direction;
    
    if (newIndex < 0) newIndex = unlockedTails.length - 1;
    if (newIndex >= unlockedTails.length) newIndex = 0;
    
    this.activeTail = unlockedTails[newIndex];
  }

  // Use tail ability
  useTailAbility() {
    const tailState = this.tails[this.activeTail];
    const tailData = TAIL_DATA[this.activeTail];
    const moveData = TAIL_MOVES[tailData.ability];

    // Check cooldown and meter
    if (tailState.cooldown > 0) return false;
    if (this.tailMeter < tailData.meterCost) return false;

    // Use meter
    this.tailMeter -= tailData.meterCost;
    tailState.cooldown = tailData.cooldown;

    // Start the move
    this.startTailMove(tailData.ability, moveData);

    return true;
  }

  startTailMove(moveName, moveData) {
    this.currentMove = { name: moveName, ...moveData };
    this.moveFrame = 0;
    this.setState(GAME_STATES.TAIL_ACTION);
    this.canCancel = false;

    // Special handling for different abilities
    if (moveData.movement) {
      // Movement ability (Ridge Step)
      this.vx = moveData.movement.x * this.facing;
      this.vy = moveData.movement.y;
      if (moveData.invincible) {
        this.invincibleFrames = moveData.active;
      }
    } else if (moveData.counter) {
      // Counter ability (Ghost Reversal)
      this.isCountering = true;
      this.counterTimer = moveData.active;
    } else if (moveData.trap) {
      // Trap ability (Briar Net)
      this.spawnTrap(moveData);
    } else {
      // Attack ability
      this.hitboxes = [this.createTailHitbox(moveData)];
    }
  }

  createTailHitbox(move) {
    const tailData = TAIL_DATA[this.activeTail];
    const hb = new Hitbox(
      this.x + (this.facing > 0 ? this.width : -80),
      this.y,
      80,
      this.height,
      move.damage,
      move.hitstun,
      move.knockback ? move.knockback.multiply(this.facing) : new Vector2()
    );
    hb.active = false;
    hb.color = tailData.color;
    hb.effect = move.effect || null;
    hb.guardBreak = move.guardBreak || false;
    return hb;
  }

  spawnTrap(moveData) {
    // Add trap entity to engine
    if (this.engine) {
      const trap = new TrapEntity(
        this.x + this.facing * 100,
        GAME_CONFIG.GROUND_Y - 20,
        moveData,
        TAIL_DATA[this.activeTail].color
      );
      trap.owner = this;
      this.engine.addEntity(trap);
    }
  }

  // Override onHit for counter mechanic
  onHit(hitbox, blocked) {
    if (this.isCountering) {
      // Counter successful!
      this.isCountering = false;
      this.counterTimer = 0;
      
      // Reverse and amplify
      const counterMove = TAIL_MOVES.ghostReversal;
      this.hitboxes = [this.createTailHitbox(counterMove)];
      this.hitboxes[0].active = true;
      this.hitboxes[0].damage = hitbox.damage * 1.5; // Reflect damage
      
      // Visual feedback
      this.engine?.triggerSlowmo(0.2, 200);
      this.engine?.triggerCameraShake(15);
      
      return; // Don't take damage
    }

    super.onHit(hitbox, blocked);

    // Build dread meter when taking damage
    if (!blocked) {
      this.dread += hitbox.damage * 0.5;
    }
  }

  onHitConfirm(blocked) {
    super.onHitConfirm(blocked);

    if (!blocked) {
      // Build meters
      this.synergy += 5;
      this.tailMeter = Math.min(this.tailMeter + 8, this.maxTailMeter);

      // Variety bonus
      if (this.currentMove) {
        if (!this.lastMoves.includes(this.currentMove.name)) {
          this.resonance += 10;
        }
        this.lastMoves.push(this.currentMove.name);
        if (this.lastMoves.length > 5) this.lastMoves.shift();
      }
    }
  }

  // Update cooldowns
  updateCooldowns() {
    for (const key of Object.keys(this.tails)) {
      if (this.tails[key].cooldown > 0) {
        this.tails[key].cooldown--;
      }
    }
  }

  // Process input
  processInput(keys, gamepad) {
    // Cooldowns
    this.updateCooldowns();

    // Counter timer
    if (this.isCountering) {
      this.counterTimer--;
      if (this.counterTimer <= 0) {
        this.isCountering = false;
        this.setState(GAME_STATES.RECOVERY);
        this.stateFrame = 0;
      }
      return;
    }

    // Dash
    if (this.isDashing) {
      this.dashTimer--;
      if (this.dashTimer <= 0) {
        this.isDashing = false;
        this.vx *= 0.5;
      }
      return;
    }

    // Movement
    let moveX = 0;
    if (keys['KeyA'] || keys['ArrowLeft']) moveX = -1;
    if (keys['KeyD'] || keys['ArrowRight']) moveX = 1;

    // Gamepad movement
    if (gamepad) {
      if (Math.abs(gamepad.leftStick.x) > 0.3) {
        moveX = gamepad.leftStick.x > 0 ? 1 : -1;
      }
    }

    if (moveX !== 0) {
      this.facing = moveX;
      const isRunning = keys['ShiftLeft'] || (gamepad && gamepad.triggers.right > 0.5);
      this.vx = moveX * (isRunning ? this.runSpeed : this.walkSpeed);
      this.setState(isRunning ? GAME_STATES.RUNNING : GAME_STATES.WALKING);
    } else if (this.grounded) {
      this.setState(GAME_STATES.IDLE);
    }

    // Jump
    if ((keys['Space'] || keys['KeyW'] || (gamepad && gamepad.buttons[0])) && this.grounded) {
      this.vy = this.jumpForce;
      this.grounded = false;
      this.setState(GAME_STATES.JUMPING);
    }

    // Dash (double tap or shoulder button)
    if (keys['KeyE'] || (gamepad && gamepad.buttons[4])) {
      if (!this.isDashing) {
        this.isDashing = true;
        this.dashTimer = this.dashFrames;
        this.dashDirection = this.facing;
        this.vx = this.dashSpeed * this.facing;
        this.invincibleFrames = 8;
      }
    }

    // Block
    if (keys['KeyS'] || (gamepad && gamepad.triggers.left > 0.5)) {
      this.setState(GAME_STATES.BLOCKING);
      this.vx *= 0.3;
    }

    // Light Attack
    if (keys['KeyJ'] || (gamepad && gamepad.buttons[2])) {
      this.startMove('lightAttack');
    }

    // Heavy Attack
    if (keys['KeyK'] || (gamepad && gamepad.buttons[3])) {
      this.startMove('heavyAttack');
    }

    // Tail Ability
    if (keys['KeyL'] || (gamepad && gamepad.buttons[1])) {
      this.useTailAbility();
    }

    // Switch Tail (Q/Tab for prev, R for next)
    if (keys['KeyQ'] || keys['Tab']) {
      this.switchTail(-1);
      keys['KeyQ'] = false;
      keys['Tab'] = false;
    }
    if (keys['KeyR']) {
      this.switchTail(1);
      keys['KeyR'] = false;
    }
  }

  // Update move (override for tail actions)
  updateMove() {
    if (!this.currentMove) return;

    const move = this.currentMove;
    this.moveFrame++;

    // Handle movement abilities
    if (move.movement) {
      if (this.moveFrame >= move.startup + move.active + move.recovery) {
        this.endMove();
      }
      return;
    }

    // Handle counter abilities
    if (move.counter) {
      if (this.moveFrame >= move.startup + move.active) {
        this.isCountering = false;
        this.endMove();
      }
      return;
    }

    // Standard attack phases
    if (this.moveFrame < move.startup) {
      // Startup
    } else if (this.moveFrame < move.startup + move.active) {
      // Active
      if (this.hitboxes.length > 0) {
        this.hitboxes[0].active = true;
        this.hitboxes[0].setPosition(
          this.x + (this.facing > 0 ? this.width : -80),
          this.y
        );
      }
      this.canCancel = true;
    } else if (this.moveFrame < move.startup + move.active + move.recovery) {
      // Recovery
      if (this.hitboxes.length > 0) {
        this.hitboxes[0].active = false;
      }
    } else {
      this.endMove();
    }
  }

  update(deltaTime, keys, gamepad) {
    // Regenerate tail meter slowly
    this.tailMeter = Math.min(this.tailMeter + 0.1, this.maxTailMeter);

    // Handle TAIL_ACTION state
    if (this.state === GAME_STATES.TAIL_ACTION) {
      this.updateMove();
      this.applyPhysics();
      return;
    }

    super.update(deltaTime, keys, gamepad);
  }

  // Render with tails
  render(ctx) {
    // Draw tails first (behind body)
    this.renderTails(ctx);

    // Draw body
    super.render(ctx);

    // Draw tail ability indicator
    this.renderTailIndicator(ctx);
  }

  renderTails(ctx) {
    const baseX = this.x + this.width / 2;
    const baseY = this.y + this.height * 0.8;

    ctx.save();

    for (let i = 0; i < this.tailVisuals.length; i++) {
      const tail = this.tailVisuals[i];
      const isActive = TAIL_DATA[this.activeTail].id === tail.id;
      
      // Animate wave
      tail.wave += 0.1;
      
      // Calculate tail curve
      const segments = 5;
      const segmentLength = tail.length / segments;
      
      ctx.beginPath();
      ctx.moveTo(baseX, baseY);

      let px = baseX;
      let py = baseY;
      
      for (let j = 0; j < segments; j++) {
        const angleOffset = Math.sin(tail.wave + j * 0.5) * 0.3;
        const angle = (tail.angle * -this.facing) + angleOffset;
        
        px += Math.cos(angle) * segmentLength * -this.facing;
        py += Math.sin(angle) * segmentLength * -1;
        
        ctx.lineTo(px, py);
      }

      ctx.strokeStyle = tail.color;
      ctx.lineWidth = isActive ? 8 : 4;
      ctx.lineCap = 'round';
      ctx.shadowColor = tail.color;
      ctx.shadowBlur = isActive ? 20 : 5;
      ctx.stroke();

      // Tail tip glow for active
      if (isActive) {
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fillStyle = tail.color;
        ctx.fill();
      }
    }

    ctx.restore();
  }

  renderTailIndicator(ctx) {
    const tailData = TAIL_DATA[this.activeTail];
    const tailState = this.tails[this.activeTail];

    // Position above character
    const x = this.x + this.width / 2;
    const y = this.y - 45;

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.roundRect(x - 50, y - 12, 100, 24, 4);
    ctx.fill();

    // Tail name
    ctx.fillStyle = tailData.color;
    ctx.font = 'bold 10px Rajdhani, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(tailData.name.toUpperCase(), x, y + 4);

    // Cooldown indicator
    if (tailState.cooldown > 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      const cdPercent = tailState.cooldown / tailData.cooldown;
      ctx.fillRect(x - 48, y + 7, 96 * cdPercent, 3);
    }
  }
}

// Trap Entity for Briar Net
class TrapEntity {
  constructor(x, y, moveData, color) {
    this.x = x;
    this.y = y;
    this.width = 60;
    this.height = 20;
    this.color = color;
    this.moveData = moveData;
    this.life = moveData.active;
    this.triggered = false;
    this.owner = null;

    this.hitboxes = [
      new Hitbox(x - 30, y - 10, 60, 20, moveData.damage, moveData.hitstun, new Vector2())
    ];
    this.hitboxes[0].active = true;
    this.hurtboxes = [];
  }

  update(deltaTime) {
    this.life--;
    if (this.life <= 0) {
      this.engine?.removeEntity(this);
    }

    // Update hitbox position
    this.hitboxes[0].setPosition(this.x - 30, this.y - 10);
  }

  render(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, this.life / 30);

    // Trap visual
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 15;

    // Thorny pattern
    for (let i = 0; i < 5; i++) {
      const spineX = this.x - 20 + i * 10;
      ctx.beginPath();
      ctx.moveTo(spineX, this.y);
      ctx.lineTo(spineX + 3, this.y - 15);
      ctx.lineTo(spineX + 6, this.y);
      ctx.fill();
    }

    ctx.restore();
  }
}

export default KaiJax;

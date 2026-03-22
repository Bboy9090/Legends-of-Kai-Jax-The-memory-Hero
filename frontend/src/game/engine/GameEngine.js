/**
 * LEGENDS OF KAI-JAX: THE MEMORY KING
 * Core Game Engine - Deterministic Frame-Based Combat
 * 
 * "Survival without memory is extinction with better design."
 */

export const GAME_CONFIG = {
  FPS: 60,
  FRAME_TIME: 1000 / 60,
  CANVAS_WIDTH: 1280,
  CANVAS_HEIGHT: 720,
  GROUND_Y: 600,
  GRAVITY: 0.8,
  FRICTION: 0.85,
};

export const GAME_STATES = {
  IDLE: 'IDLE',
  WALKING: 'WALKING',
  RUNNING: 'RUNNING',
  JUMPING: 'JUMPING',
  ATTACKING: 'ATTACKING',
  BLOCKING: 'BLOCKING',
  HITSTUN: 'HITSTUN',
  KNOCKDOWN: 'KNOCKDOWN',
  RECOVERY: 'RECOVERY',
  TAIL_ACTION: 'TAIL_ACTION',
};

export const INPUT_BUFFER_SIZE = 10;

export class InputBuffer {
  constructor() {
    this.buffer = [];
    this.maxSize = INPUT_BUFFER_SIZE;
  }

  add(input) {
    this.buffer.push({ ...input, frame: Date.now() });
    if (this.buffer.length > this.maxSize) {
      this.buffer.shift();
    }
  }

  getRecent(frameWindow = 6) {
    const now = Date.now();
    return this.buffer.filter(i => now - i.frame < frameWindow * GAME_CONFIG.FRAME_TIME);
  }

  hasInput(action, frameWindow = 6) {
    return this.getRecent(frameWindow).some(i => i.action === action);
  }

  clear() {
    this.buffer = [];
  }
}

export class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  add(v) {
    return new Vector2(this.x + v.x, this.y + v.y);
  }

  subtract(v) {
    return new Vector2(this.x - v.x, this.y - v.y);
  }

  multiply(scalar) {
    return new Vector2(this.x * scalar, this.y * scalar);
  }

  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize() {
    const mag = this.magnitude();
    if (mag === 0) return new Vector2(0, 0);
    return new Vector2(this.x / mag, this.y / mag);
  }

  static distance(a, b) {
    return a.subtract(b).magnitude();
  }
}

export class Hitbox {
  constructor(x, y, width, height, damage = 0, hitstun = 0, knockback = new Vector2()) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.damage = damage;
    this.hitstun = hitstun;
    this.knockback = knockback;
    this.active = false;
    this.owner = null;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  intersects(other) {
    return (
      this.x < other.x + other.width &&
      this.x + this.width > other.x &&
      this.y < other.y + other.height &&
      this.y + this.height > other.y
    );
  }

  getCenter() {
    return new Vector2(this.x + this.width / 2, this.y + this.height / 2);
  }
}

export class Hurtbox extends Hitbox {
  constructor(x, y, width, height) {
    super(x, y, width, height);
    this.invincible = false;
  }
}

export class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.running = false;
    this.paused = false;
    this.frameCount = 0;
    this.lastFrameTime = 0;
    this.accumulator = 0;
    this.entities = [];
    this.hitboxes = [];
    this.hurtboxes = [];
    this.effects = [];
    this.camera = { x: 0, y: 0, shake: 0 };
    this.hitstop = 0;
    this.slowmo = 1;
    this.debug = false;

    // Input state
    this.keys = {};
    this.gamepad = null;
    this.inputBuffer = new InputBuffer();

    this.setupInput();
  }

  setupInput() {
    window.addEventListener('keydown', (e) => {
      if (!this.keys[e.code]) {
        this.keys[e.code] = true;
        this.inputBuffer.add({ action: e.code, type: 'press' });
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
      this.inputBuffer.add({ action: e.code, type: 'release' });
    });

    // Gamepad support
    window.addEventListener('gamepadconnected', (e) => {
      this.gamepad = e.gamepad;
      console.log('Gamepad connected:', e.gamepad.id);
    });

    window.addEventListener('gamepaddisconnected', () => {
      this.gamepad = null;
    });
  }

  pollGamepad() {
    if (!this.gamepad) return null;
    const gp = navigator.getGamepads()[this.gamepad.index];
    if (!gp) return null;

    return {
      leftStick: new Vector2(gp.axes[0], gp.axes[1]),
      rightStick: new Vector2(gp.axes[2], gp.axes[3]),
      buttons: gp.buttons.map(b => b.pressed),
      triggers: {
        left: gp.buttons[6]?.value || 0,
        right: gp.buttons[7]?.value || 0,
      }
    };
  }

  addEntity(entity) {
    entity.engine = this;
    this.entities.push(entity);
    return entity;
  }

  removeEntity(entity) {
    const index = this.entities.indexOf(entity);
    if (index > -1) {
      this.entities.splice(index, 1);
    }
  }

  addEffect(effect) {
    this.effects.push(effect);
  }

  triggerHitstop(frames) {
    this.hitstop = Math.max(this.hitstop, frames);
  }

  triggerCameraShake(intensity) {
    this.camera.shake = Math.max(this.camera.shake, intensity);
  }

  triggerSlowmo(factor, duration) {
    this.slowmo = factor;
    setTimeout(() => { this.slowmo = 1; }, duration);
  }

  checkCollisions() {
    // Collect all active hitboxes and hurtboxes
    const activeHitboxes = [];
    const activeHurtboxes = [];

    for (const entity of this.entities) {
      if (entity.hitboxes) {
        for (const hb of entity.hitboxes) {
          if (hb.active) {
            hb.owner = entity;
            activeHitboxes.push(hb);
          }
        }
      }
      if (entity.hurtboxes) {
        for (const hb of entity.hurtboxes) {
          if (!hb.invincible) {
            hb.owner = entity;
            activeHurtboxes.push(hb);
          }
        }
      }
    }

    // Check collisions
    for (const hitbox of activeHitboxes) {
      for (const hurtbox of activeHurtboxes) {
        if (hitbox.owner === hurtbox.owner) continue; // No self-hits
        if (hitbox.intersects(hurtbox)) {
          this.onHit(hitbox, hurtbox);
        }
      }
    }
  }

  onHit(hitbox, hurtbox) {
    const attacker = hitbox.owner;
    const defender = hurtbox.owner;

    if (defender.onHit) {
      const blocked = defender.state === GAME_STATES.BLOCKING;
      defender.onHit(hitbox, blocked);

      // Visual feedback
      this.triggerHitstop(blocked ? 4 : 8);
      this.triggerCameraShake(blocked ? 3 : 8);

      // Hit effect
      const hitPos = hitbox.getCenter();
      this.addEffect(new HitEffect(hitPos.x, hitPos.y, blocked ? 'block' : 'hit'));

      // Disable hitbox after hit
      hitbox.active = false;

      // Attacker meter gain
      if (attacker.onHitConfirm) {
        attacker.onHitConfirm(blocked);
      }
    }
  }

  update(deltaTime) {
    if (this.paused) return;
    if (this.hitstop > 0) {
      this.hitstop--;
      return;
    }

    const adjustedDelta = deltaTime * this.slowmo;

    // Update entities
    for (const entity of this.entities) {
      if (entity.update) {
        entity.update(adjustedDelta, this.keys, this.pollGamepad());
      }
    }

    // Check collisions
    this.checkCollisions();

    // Update effects
    this.effects = this.effects.filter(e => {
      e.update(adjustedDelta);
      return e.alive;
    });

    // Update camera shake
    if (this.camera.shake > 0) {
      this.camera.shake *= 0.9;
      if (this.camera.shake < 0.5) this.camera.shake = 0;
    }

    this.frameCount++;
  }

  render() {
    const ctx = this.ctx;
    const { shake } = this.camera;

    // Clear with camera shake
    ctx.save();
    if (shake > 0) {
      ctx.translate(
        (Math.random() - 0.5) * shake * 2,
        (Math.random() - 0.5) * shake * 2
      );
    }

    // Background
    this.renderBackground();

    // Entities (sorted by Y for depth)
    const sortedEntities = [...this.entities].sort((a, b) => (a.y || 0) - (b.y || 0));
    for (const entity of sortedEntities) {
      if (entity.render) {
        entity.render(ctx);
      }
    }

    // Effects
    for (const effect of this.effects) {
      effect.render(ctx);
    }

    // Debug hitboxes
    if (this.debug) {
      this.renderDebug(ctx);
    }

    ctx.restore();

    // HUD (not affected by camera)
    this.renderHUD();
  }

  renderBackground() {
    const ctx = this.ctx;
    const { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y } = GAME_CONFIG;

    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    skyGrad.addColorStop(0, '#0a0a15');
    skyGrad.addColorStop(0.5, '#1a1a2e');
    skyGrad.addColorStop(1, '#16213e');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, GROUND_Y);

    // City silhouette
    ctx.fillStyle = '#0f0f1a';
    for (let i = 0; i < 20; i++) {
      const x = i * 80 - 40;
      const h = 100 + Math.sin(i * 0.7) * 80 + Math.random() * 20;
      ctx.fillRect(x, GROUND_Y - h, 60, h);
    }

    // Neon accents
    ctx.shadowColor = '#2E2EFE';
    ctx.shadowBlur = 20;
    for (let i = 0; i < 10; i++) {
      const x = 100 + i * 120;
      const y = GROUND_Y - 50 - Math.random() * 200;
      ctx.fillStyle = ['#FF3B30', '#FFD60A', '#64D2FF', '#BF5AF2'][i % 4];
      ctx.fillRect(x, y, 3, 20);
    }
    ctx.shadowBlur = 0;

    // Ground
    const groundGrad = ctx.createLinearGradient(0, GROUND_Y, 0, CANVAS_HEIGHT);
    groundGrad.addColorStop(0, '#1a1a2e');
    groundGrad.addColorStop(1, '#0a0a15');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);

    // Ground line
    ctx.strokeStyle = '#2E2EFE44';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
    ctx.stroke();
  }

  renderDebug(ctx) {
    for (const entity of this.entities) {
      // Hitboxes (red)
      if (entity.hitboxes) {
        ctx.strokeStyle = '#FF3B30';
        ctx.lineWidth = 2;
        for (const hb of entity.hitboxes) {
          if (hb.active) {
            ctx.strokeRect(hb.x, hb.y, hb.width, hb.height);
          }
        }
      }
      // Hurtboxes (green)
      if (entity.hurtboxes) {
        ctx.strokeStyle = '#30D158';
        ctx.lineWidth = 2;
        for (const hb of entity.hurtboxes) {
          if (!hb.invincible) {
            ctx.strokeRect(hb.x, hb.y, hb.width, hb.height);
          }
        }
      }
    }
  }

  renderHUD() {
    // Override in game instance
  }

  start() {
    this.running = true;
    this.lastFrameTime = performance.now();
    this.gameLoop();
  }

  stop() {
    this.running = false;
  }

  gameLoop() {
    if (!this.running) return;

    const now = performance.now();
    const deltaTime = now - this.lastFrameTime;
    this.lastFrameTime = now;

    this.accumulator += deltaTime;

    // Fixed timestep
    while (this.accumulator >= GAME_CONFIG.FRAME_TIME) {
      this.update(GAME_CONFIG.FRAME_TIME);
      this.accumulator -= GAME_CONFIG.FRAME_TIME;
    }

    this.render();

    requestAnimationFrame(() => this.gameLoop());
  }
}

// Hit Effect
export class HitEffect {
  constructor(x, y, type = 'hit') {
    this.x = x;
    this.y = y;
    this.type = type;
    this.life = 1;
    this.alive = true;
    this.particles = [];

    const color = type === 'block' ? '#64D2FF' : '#FF3B30';
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12;
      this.particles.push({
        x: 0,
        y: 0,
        vx: Math.cos(angle) * (3 + Math.random() * 3),
        vy: Math.sin(angle) * (3 + Math.random() * 3),
        size: 4 + Math.random() * 4,
        color,
      });
    }
  }

  update(dt) {
    this.life -= 0.05;
    if (this.life <= 0) {
      this.alive = false;
      return;
    }

    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.95;
      p.vy *= 0.95;
      p.size *= 0.95;
    }
  }

  render(ctx) {
    ctx.globalAlpha = this.life;
    for (const p of this.particles) {
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(this.x + p.x, this.y + p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }
}

export default GameEngine;

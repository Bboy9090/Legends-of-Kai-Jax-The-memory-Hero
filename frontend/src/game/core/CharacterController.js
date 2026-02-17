/**
 * LEGENDS OF KAI-JAX: THE MEMORY KING
 * Character Controller — Frame-Perfect State Machine
 * 
 * "Input on frame N, startup begins frame N. No exceptions."
 * 
 * This is the engine-ready character controller that can be
 * ported directly to Unreal or Unity. No canvas-specific code.
 */

import {
  FIGHTER_STATE,
  STATE_TRANSITIONS,
  MOVE_DATA,
  TAIL_MOVE_DATA,
  MOVEMENT_DATA,
  FRAME_CONSTANTS,
  getMovePhase,
  canCancel,
  getTotalFrames,
  MOVE_PHASE,
} from '../data/FrameData.js';

/**
 * INPUT BUFFER
 * Stores recent inputs for lenient timing
 */
class InputBuffer {
  constructor(size = FRAME_CONSTANTS.INPUT_BUFFER_FRAMES) {
    this.size = size;
    this.buffer = [];
  }
  
  /**
   * Add an input to the buffer
   */
  push(input) {
    this.buffer.push({
      ...input,
      age: 0,
    });
    
    // Keep buffer at max size
    while (this.buffer.length > this.size * 2) {
      this.buffer.shift();
    }
  }
  
  /**
   * Check if an input exists within the buffer window
   */
  has(action, maxAge = this.size) {
    return this.buffer.some(
      input => input.action === action && input.age <= maxAge && !input.consumed
    );
  }
  
  /**
   * Consume an input (mark as used)
   */
  consume(action) {
    const input = this.buffer.find(
      i => i.action === action && !i.consumed
    );
    if (input) {
      input.consumed = true;
      return true;
    }
    return false;
  }
  
  /**
   * Age all inputs by one frame
   */
  tick() {
    for (const input of this.buffer) {
      input.age++;
    }
    // Remove old inputs
    this.buffer = this.buffer.filter(i => i.age <= this.size * 2);
  }
  
  /**
   * Clear buffer
   */
  clear() {
    this.buffer = [];
  }
}

/**
 * HITBOX DATA
 * Simple AABB for collision detection
 */
class Hitbox {
  constructor(owner, data) {
    this.owner = owner;
    this.offsetX = data.offsetX || 0;
    this.offsetY = data.offsetY || 0;
    this.width = data.width || 60;
    this.height = data.height || 60;
    this.active = false;
    
    // Combat data
    this.damage = data.damage || 0;
    this.hitstun = data.hitstun || 0;
    this.blockstun = data.blockstun || 0;
    this.knockback = data.knockback || { x: 0, y: 0 };
    this.hitstop = data.hitstopOnHit || 0;
  }
  
  /**
   * Get world position based on owner position and facing
   */
  getWorldBounds(ownerX, ownerY, ownerWidth, facing) {
    const x = facing > 0 
      ? ownerX + ownerWidth + this.offsetX
      : ownerX - this.width - this.offsetX;
    const y = ownerY + this.offsetY;
    
    return {
      x,
      y,
      width: this.width,
      height: this.height,
    };
  }
  
  /**
   * Check intersection with another box
   */
  intersects(other) {
    return (
      this.x < other.x + other.width &&
      this.x + this.width > other.x &&
      this.y < other.y + other.height &&
      this.y + this.height > other.y
    );
  }
}

/**
 * CHARACTER CONTROLLER
 * The core state machine for any fighter
 */
export class CharacterController {
  constructor(config = {}) {
    // Identity
    this.id = config.id || 'fighter';
    this.isPlayer = config.isPlayer || false;
    
    // Position & Physics
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.vx = 0;
    this.vy = 0;
    this.facing = config.facing || 1; // 1 = right, -1 = left
    this.grounded = true;
    
    // Dimensions
    this.width = config.width || 60;
    this.height = config.height || 120;
    
    // Stats
    this.maxHealth = config.maxHealth || 100;
    this.health = this.maxHealth;
    
    // State Machine
    this.state = FIGHTER_STATE.IDLE;
    this.stateFrame = 0;
    this.previousState = null;
    
    // Current Move (if attacking)
    this.currentMove = null;
    this.currentMoveId = null;
    this.moveFrame = 0;
    this.movePhase = MOVE_PHASE.IDLE;
    this.hitConnected = false; // Did current attack hit?
    
    // Stun/Invincibility
    this.stunFrames = 0;
    this.invincibleFrames = 0;
    
    // Combat
    this.hitbox = null;
    this.comboCount = 0;
    
    // Input
    this.inputBuffer = new InputBuffer();
    this.heldInputs = {}; // Currently held buttons
    
    // Meters (for tail system)
    this.meter = 0;
    this.maxMeter = 100;
    
    // Callbacks
    this.onStateChange = config.onStateChange || null;
    this.onHit = config.onHit || null;
    this.onDamage = config.onDamage || null;
    
    // Debug
    this.debug = config.debug || false;
  }
  
  // ═══════════════════════════════════════════════════════════
  // STATE MACHINE
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Attempt to transition to a new state
   * Returns true if transition was allowed
   */
  setState(newState) {
    // Check if transition is allowed
    const allowed = STATE_TRANSITIONS[this.state]?.[newState];
    
    if (!allowed && newState !== this.state) {
      if (this.debug) {
        console.log(`[${this.id}] Blocked transition: ${this.state} → ${newState}`);
      }
      return false;
    }
    
    if (newState !== this.state) {
      this.previousState = this.state;
      this.state = newState;
      this.stateFrame = 0;
      
      // Callback
      if (this.onStateChange) {
        this.onStateChange(this.previousState, newState);
      }
      
      if (this.debug) {
        console.log(`[${this.id}] State: ${this.previousState} → ${newState}`);
      }
    }
    
    return true;
  }
  
  /**
   * Check if currently in a state that can act
   */
  canAct() {
    const actableStates = [
      FIGHTER_STATE.IDLE,
      FIGHTER_STATE.WALKING,
      FIGHTER_STATE.RUNNING,
      FIGHTER_STATE.RISING,
      FIGHTER_STATE.FALLING,
    ];
    return actableStates.includes(this.state);
  }
  
  /**
   * Check if in a committed state (cannot cancel)
   */
  isCommitted() {
    const committedStates = [
      FIGHTER_STATE.JUMP_SQUAT,
      FIGHTER_STATE.ATTACKING,
      FIGHTER_STATE.TAIL_ACTION,
      FIGHTER_STATE.DASHING,
      FIGHTER_STATE.HITSTUN,
      FIGHTER_STATE.KNOCKDOWN,
      FIGHTER_STATE.WAKEUP,
    ];
    return committedStates.includes(this.state);
  }
  
  // ═══════════════════════════════════════════════════════════
  // COMBAT - MOVES
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Start a move by ID
   */
  startMove(moveId) {
    const moveData = MOVE_DATA[moveId] || TAIL_MOVE_DATA[moveId];
    if (!moveData) {
      console.warn(`Unknown move: ${moveId}`);
      return false;
    }
    
    // Check if we can start this move
    if (!this.canStartMove(moveData)) {
      return false;
    }
    
    // Start the move
    this.currentMoveId = moveId;
    this.currentMove = moveData;
    this.moveFrame = 0;
    this.movePhase = MOVE_PHASE.STARTUP;
    this.hitConnected = false;
    
    // Create hitbox (inactive until active phase)
    if (moveData.hitbox) {
      this.hitbox = new Hitbox(this, {
        ...moveData.hitbox,
        damage: moveData.damage,
        hitstun: moveData.hitstun,
        blockstun: moveData.blockstun,
        knockback: moveData.knockback,
        hitstopOnHit: moveData.hitstopOnHit,
      });
    }
    
    // Set state
    const isTailMove = TAIL_MOVE_DATA[moveId];
    this.setState(isTailMove ? FIGHTER_STATE.TAIL_ACTION : FIGHTER_STATE.ATTACKING);
    
    // Consume meter if needed
    if (moveData.meterCost) {
      this.meter -= moveData.meterCost;
    }
    
    if (this.debug) {
      console.log(`[${this.id}] Started move: ${moveId} (${moveData.startup}s/${moveData.active}a/${moveData.recovery}r)`);
    }
    
    return true;
  }
  
  /**
   * Check if we can start a move
   */
  canStartMove(moveData) {
    // Air-only moves
    if (moveData.airOnly && this.grounded) {
      return false;
    }
    
    // Ground-only moves
    if (moveData.groundOnly && !this.grounded) {
      return false;
    }
    
    // Meter cost
    if (moveData.meterCost && this.meter < moveData.meterCost) {
      return false;
    }
    
    // Can we act?
    if (this.state === FIGHTER_STATE.ATTACKING || this.state === FIGHTER_STATE.TAIL_ACTION) {
      // Check for cancel
      return this.canCancelCurrentMove(moveData);
    }
    
    return this.canAct();
  }
  
  /**
   * Check if current move can be cancelled into a new move
   */
  canCancelCurrentMove(newMove) {
    if (!this.currentMove) return false;
    
    // Check cancel window
    if (!canCancel(this.currentMove, this.moveFrame, this.hitConnected)) {
      return false;
    }
    
    // Check if new move is in cancel list
    const newMoveId = Object.keys(MOVE_DATA).find(k => MOVE_DATA[k] === newMove) ||
                      Object.keys(TAIL_MOVE_DATA).find(k => TAIL_MOVE_DATA[k] === newMove);
    
    if (!this.currentMove.cancelInto?.includes(newMoveId) && 
        !this.currentMove.cancelInto?.includes('special')) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Update the current move
   */
  updateMove() {
    if (!this.currentMove) return;
    
    this.moveFrame++;
    const move = this.currentMove;
    
    // Determine phase
    this.movePhase = getMovePhase(move, this.moveFrame);
    
    // Handle hitbox activation
    if (this.hitbox) {
      this.hitbox.active = this.movePhase === MOVE_PHASE.ACTIVE;
    }
    
    // Handle movement during move (dash attack, etc.)
    if (move.movementProfile) {
      for (const profile of move.movementProfile) {
        if (this.moveFrame === profile.frame) {
          this.vx = profile.vx * this.facing;
          if (profile.vy !== undefined) {
            this.vy = profile.vy;
          }
        }
      }
    }
    
    // Handle invincibility frames
    if (move.invincibleFrames) {
      const { start, end } = move.invincibleFrames;
      if (this.moveFrame >= start && this.moveFrame < end) {
        this.invincibleFrames = 1; // Refresh each frame
      }
    }
    
    // Check for move completion
    if (this.moveFrame >= getTotalFrames(move)) {
      this.endMove();
    }
  }
  
  /**
   * End the current move
   */
  endMove() {
    if (this.debug && this.currentMoveId) {
      console.log(`[${this.id}] Ended move: ${this.currentMoveId}`);
    }
    
    this.currentMove = null;
    this.currentMoveId = null;
    this.moveFrame = 0;
    this.movePhase = MOVE_PHASE.IDLE;
    this.hitbox = null;
    this.hitConnected = false;
    
    // Return to idle (or falling if airborne)
    if (this.grounded) {
      this.setState(FIGHTER_STATE.IDLE);
    } else {
      this.setState(FIGHTER_STATE.FALLING);
    }
  }
  
  // ═══════════════════════════════════════════════════════════
  // COMBAT - RECEIVING HITS
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Called when this character is hit
   */
  receiveHit(hitbox, blocked = false) {
    if (this.invincibleFrames > 0) return;
    
    if (blocked) {
      // Blockstun
      this.stunFrames = hitbox.blockstun;
      this.vx = hitbox.knockback.x * 0.3 * -this.facing;
      this.setState(FIGHTER_STATE.BLOCK_STUNNED);
      
      if (this.onDamage) {
        this.onDamage(0, hitbox, true);
      }
    } else {
      // Hitstun
      this.health -= hitbox.damage;
      this.stunFrames = hitbox.hitstun;
      this.vx = hitbox.knockback.x * (hitbox.owner?.facing || 1);
      this.vy = hitbox.knockback.y;
      
      // Cancel any current move
      this.currentMove = null;
      this.currentMoveId = null;
      this.hitbox = null;
      
      // Check for knockdown
      if (this.health <= 0) {
        this.setState(FIGHTER_STATE.KNOCKDOWN);
        this.stunFrames = 60;
      } else {
        this.setState(FIGHTER_STATE.HITSTUN);
      }
      
      // Reset combo if getting hit
      this.comboCount = 0;
      
      if (this.onDamage) {
        this.onDamage(hitbox.damage, hitbox, false);
      }
    }
    
    if (this.debug) {
      console.log(`[${this.id}] ${blocked ? 'Blocked' : 'Hit'} for ${hitbox.damage} damage, ${this.stunFrames}f stun`);
    }
  }
  
  /**
   * Called when this character's attack hits
   */
  confirmHit(blocked) {
    this.hitConnected = true;
    
    if (!blocked) {
      this.comboCount++;
      this.meter = Math.min(this.maxMeter, this.meter + 8);
    } else {
      this.meter = Math.min(this.maxMeter, this.meter + 3);
    }
  }
  
  // ═══════════════════════════════════════════════════════════
  // INPUT PROCESSING
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Process input from keyboard/gamepad
   * This is the main input entry point
   */
  processInput(inputState) {
    // Update held inputs
    this.heldInputs = { ...inputState.held };
    
    // Add new presses to buffer
    for (const action of inputState.pressed) {
      this.inputBuffer.push({ action, type: 'press' });
    }
    
    // Skip if in uninterruptible state
    if (this.stunFrames > 0) return;
    if (this.state === FIGHTER_STATE.KNOCKDOWN) return;
    if (this.state === FIGHTER_STATE.WAKEUP) return;
    
    // Attack inputs (check buffer)
    if (this.inputBuffer.has('ATTACK_LIGHT')) {
      if (this.tryAttack('light_1')) {
        this.inputBuffer.consume('ATTACK_LIGHT');
        return;
      }
    }
    
    if (this.inputBuffer.has('ATTACK_HEAVY')) {
      if (this.tryAttack('heavy_1')) {
        this.inputBuffer.consume('ATTACK_HEAVY');
        return;
      }
    }
    
    if (this.inputBuffer.has('ATTACK_SPECIAL')) {
      if (this.tryTailAbility()) {
        this.inputBuffer.consume('ATTACK_SPECIAL');
        return;
      }
    }
    
    // Block (held input)
    if (this.heldInputs.BLOCK && this.canAct()) {
      this.setState(FIGHTER_STATE.BLOCKING);
      this.vx *= 0.3;
      return;
    }
    
    // Exit block when released
    if (this.state === FIGHTER_STATE.BLOCKING && !this.heldInputs.BLOCK) {
      this.setState(FIGHTER_STATE.IDLE);
    }
    
    // Jump
    if (this.inputBuffer.has('JUMP') && this.grounded && this.canAct()) {
      this.setState(FIGHTER_STATE.JUMP_SQUAT);
      this.inputBuffer.consume('JUMP');
      return;
    }
    
    // Dash
    if (this.inputBuffer.has('DASH') && this.canAct()) {
      this.startDash();
      this.inputBuffer.consume('DASH');
      return;
    }
    
    // Movement (held inputs)
    if (this.canAct() && this.grounded) {
      const moveX = (this.heldInputs.RIGHT ? 1 : 0) - (this.heldInputs.LEFT ? 1 : 0);
      
      if (moveX !== 0) {
        this.facing = moveX;
        const isRunning = this.heldInputs.RUN;
        this.vx = moveX * (isRunning ? MOVEMENT_DATA.run_speed : MOVEMENT_DATA.walk_speed);
        this.setState(isRunning ? FIGHTER_STATE.RUNNING : FIGHTER_STATE.WALKING);
      } else {
        this.setState(FIGHTER_STATE.IDLE);
      }
    }
  }
  
  /**
   * Try to start an attack
   */
  tryAttack(moveId) {
    // Check for chain attacks
    if (this.state === FIGHTER_STATE.ATTACKING && this.currentMove) {
      // Get next move in chain
      const chainMove = this.getChainMove(moveId);
      if (chainMove) {
        return this.startMove(chainMove);
      }
    }
    
    // Fresh attack
    if (this.canAct()) {
      return this.startMove(moveId);
    }
    
    return false;
  }
  
  /**
   * Get the appropriate chain move based on current state
   */
  getChainMove(baseMove) {
    if (!this.currentMove) return baseMove;
    
    // Check what we can cancel into
    const cancelList = this.currentMove.cancelInto || [];
    
    // Find the appropriate chain
    if (baseMove === 'light_1') {
      if (this.currentMoveId === 'light_1' && cancelList.includes('light_2')) {
        return 'light_2';
      }
      if (this.currentMoveId === 'light_2' && cancelList.includes('light_3')) {
        return 'light_3';
      }
    }
    
    if (baseMove === 'heavy_1') {
      if (this.currentMoveId === 'heavy_1' && cancelList.includes('heavy_2')) {
        return 'heavy_2';
      }
    }
    
    return baseMove;
  }
  
  /**
   * Try to use tail ability (stub for now)
   */
  tryTailAbility() {
    // Override in KaiJax class
    return false;
  }
  
  /**
   * Start a dash
   */
  startDash() {
    this.setState(FIGHTER_STATE.DASHING);
    this.vx = MOVEMENT_DATA.dash_speed * this.facing;
    this.stateFrame = 0;
    
    // I-frames during dash
    this.invincibleFrames = MOVEMENT_DATA.dash_invincible_end - MOVEMENT_DATA.dash_invincible_start;
  }
  
  // ═══════════════════════════════════════════════════════════
  // PHYSICS
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Apply physics for one frame
   */
  applyPhysics(groundY) {
    // Gravity
    if (!this.grounded) {
      this.vy = Math.min(this.vy + MOVEMENT_DATA.gravity, MOVEMENT_DATA.max_fall_speed);
    }
    
    // Apply velocity
    this.x += this.vx;
    this.y += this.vy;
    
    // Ground collision
    if (this.y + this.height >= groundY) {
      this.y = groundY - this.height;
      this.vy = 0;
      
      if (!this.grounded) {
        this.grounded = true;
        this.onLand();
      }
    } else {
      this.grounded = false;
    }
    
    // Friction
    if (this.grounded && this.state !== FIGHTER_STATE.WALKING && this.state !== FIGHTER_STATE.RUNNING) {
      this.vx *= MOVEMENT_DATA.ground_friction;
    }
    if (!this.grounded) {
      this.vx *= MOVEMENT_DATA.air_friction;
    }
  }
  
  /**
   * Called when landing
   */
  onLand() {
    if (this.state === FIGHTER_STATE.FALLING || this.state === FIGHTER_STATE.RISING) {
      this.setState(FIGHTER_STATE.LANDING);
      this.stateFrame = 0;
    }
  }
  
  // ═══════════════════════════════════════════════════════════
  // UPDATE
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Main update function - call once per frame
   */
  update(groundY, bounds) {
    // Age input buffer
    this.inputBuffer.tick();
    
    // Decrement invincibility
    if (this.invincibleFrames > 0) {
      this.invincibleFrames--;
    }
    
    // Handle stun states
    if (this.stunFrames > 0) {
      this.stunFrames--;
      
      if (this.stunFrames <= 0) {
        // Exit stun
        if (this.state === FIGHTER_STATE.KNOCKDOWN) {
          this.setState(FIGHTER_STATE.WAKEUP);
          this.invincibleFrames = FRAME_CONSTANTS.WAKEUP_FRAMES;
        } else if (this.state === FIGHTER_STATE.BLOCK_STUNNED) {
          this.setState(FIGHTER_STATE.BLOCKING);
        } else {
          this.setState(FIGHTER_STATE.IDLE);
        }
      }
    }
    
    // Handle state-specific updates
    switch (this.state) {
      case FIGHTER_STATE.JUMP_SQUAT:
        this.stateFrame++;
        if (this.stateFrame >= MOVEMENT_DATA.jump_squat) {
          this.vy = MOVEMENT_DATA.jump_force;
          this.grounded = false;
          this.setState(FIGHTER_STATE.RISING);
        }
        break;
        
      case FIGHTER_STATE.RISING:
        if (this.vy >= 0) {
          this.setState(FIGHTER_STATE.FALLING);
        }
        break;
        
      case FIGHTER_STATE.LANDING:
        this.stateFrame++;
        if (this.stateFrame >= 3) {
          this.setState(FIGHTER_STATE.IDLE);
        }
        break;
        
      case FIGHTER_STATE.DASHING:
        this.stateFrame++;
        if (this.stateFrame >= MOVEMENT_DATA.dash_frames) {
          this.vx *= 0.5;
          this.setState(FIGHTER_STATE.IDLE);
        }
        break;
        
      case FIGHTER_STATE.WAKEUP:
        this.stateFrame++;
        if (this.stateFrame >= FRAME_CONSTANTS.WAKEUP_FRAMES) {
          this.setState(FIGHTER_STATE.IDLE);
        }
        break;
        
      case FIGHTER_STATE.ATTACKING:
      case FIGHTER_STATE.TAIL_ACTION:
        this.updateMove();
        break;
    }
    
    // Increment state frame
    this.stateFrame++;
    
    // Physics
    this.applyPhysics(groundY);
    
    // Bounds
    if (bounds) {
      this.x = Math.max(bounds.left, Math.min(this.x, bounds.right - this.width));
    }
    
    // Regenerate meter slowly
    this.meter = Math.min(this.maxMeter, this.meter + 0.1);
  }
  
  // ═══════════════════════════════════════════════════════════
  // GETTERS
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Get hurtbox bounds
   */
  getHurtbox() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }
  
  /**
   * Get active hitbox bounds (if any)
   */
  getActiveHitbox() {
    if (!this.hitbox?.active) return null;
    return this.hitbox.getWorldBounds(this.x, this.y, this.width, this.facing);
  }
  
  /**
   * Check if invincible
   */
  isInvincible() {
    return this.invincibleFrames > 0;
  }
  
  /**
   * Get debug info
   */
  getDebugInfo() {
    return {
      state: this.state,
      stateFrame: this.stateFrame,
      move: this.currentMoveId,
      moveFrame: this.moveFrame,
      movePhase: this.movePhase,
      health: this.health,
      meter: this.meter,
      stunFrames: this.stunFrames,
      invincible: this.invincibleFrames > 0,
      grounded: this.grounded,
      velocity: { x: this.vx.toFixed(1), y: this.vy.toFixed(1) },
    };
  }
}

export default CharacterController;

/**
 * PROJECT OMEGA: COMBAT STATE MACHINE (V2.0)
 *
 * The canonical state machine for Beast-Kin combat flow.
 * Every frame follows the state graph: IDLE → STARTUP → ACTIVE → RECOVERY → IDLE
 *
 * Special states: HITSTUN, TRANSFORMATION, VOID_POISE, SHAPESHIFT
 */

export class CombatStateMachine {
  constructor(character) {
    this.character = character;

    // Current state
    this.currentState = 'IDLE';
    this.currentFrame = 0;
    this.frameTimer = 0;

    // Active move data
    this.activeMove = null;
    this.isLegacyForm = false;
    this.transformationMultiplier = 1.0;

    // State tracking
    this.hitConfirm = false;
    this.lastHitFrame = -999;
    this.comboCounter = 0;

    // Resonance & Dread
    this.resonanceLevel = 0; // 0-100
    this.dreadLevel = 0; // 0-100
  }

  /**
   * Primary state machine update
   * @param {number} deltaTime - Frame time (ms)
   * @param {Array<string>} inputs - Buffered inputs
   * @param {Object} opponent - Opponent state (for reads)
   */
  update(deltaTime, inputs, opponent) {
    this.frameTimer += deltaTime;
    const frameAdvance = this.frameTimer >= (1000 / 60); // 60 FPS

    if (frameAdvance) {
      this.currentFrame++;
      this.frameTimer = 0;
    }

    // State-specific logic
    switch (this.currentState) {
      case 'IDLE':
        this.handleIdleState(inputs);
        break;
      case 'STARTUP':
        this.handleStartupState(inputs);
        break;
      case 'ACTIVE':
        this.handleActiveState(inputs);
        break;
      case 'RECOVERY':
        this.handleRecoveryState(inputs);
        break;
      case 'HITSTUN':
        this.handleHitstunState();
        break;
      case 'TRANSFORMATION':
        this.handleTransformationState();
        break;
      case 'VOID_POISE':
        this.handleVoidPoiseState();
        break;
      case 'SHAPESHIFT':
        this.handleShapeshiftState(opponent);
        break;
    }

    // Update resonance/dread over time
    this.updateMetrics();

    return {
      state: this.currentState,
      frame: this.currentFrame,
      resonance: this.resonanceLevel,
      dread: this.dreadLevel,
      combo: this.comboCounter
    };
  }

  /**
   * IDLE: Neutral state, waiting for input
   */
  handleIdleState(inputs) {
    if (inputs.includes('ATTACK')) {
      this.currentState = 'STARTUP';
      this.activeMove = this.character.getMove('BASIC_ATTACK');
      this.currentFrame = 0;
      this.hitConfirm = false;
    }

    if (inputs.includes('SPECIAL') && this.resonanceLevel >= 50) {
      this.currentState = 'STARTUP';
      this.activeMove = this.character.getMove('SPECIAL_ATTACK');
      this.currentFrame = 0;
    }

    // Void Poise check (villain passive)
    if (this.character.hasPassive('VOID_POISE') && this.currentFrame < 5) {
      this.currentState = 'VOID_POISE';
    }
  }

  /**
   * STARTUP: Pre-attack frames (0-3)
   * No hitbox, cannot be cancelled
   */
  handleStartupState(inputs) {
    if (this.currentFrame >= this.activeMove.startupFrames) {
      this.currentState = 'ACTIVE';
      this.currentFrame = 0;
    }
  }

  /**
   * ACTIVE: Attack is live and can hit (3-8 frames typical)
   */
  handleActiveState(inputs) {
    // Check for hit
    if (this.hitConfirm && !this.lastHitFrame) {
      this.lastHitFrame = this.currentFrame;
      this.comboCounter++;
      this.resonanceLevel = Math.min(100, this.resonanceLevel + 5);
    }

    // Check for cancel point
    if (this.currentFrame >= this.activeMove.cancelFrame) {
      if (inputs.includes('JUMP')) {
        this.currentState = 'IDLE';
        this.currentFrame = 0;
        return;
      }
      if (inputs.includes('ATTACK')) {
        this.currentState = 'STARTUP';
        this.activeMove = this.character.getMove('BASIC_ATTACK');
        this.currentFrame = 0;
        return;
      }
    }

    // Move to recovery when active frames end
    if (this.currentFrame >= this.activeMove.activeFrames) {
      this.currentState = 'RECOVERY';
      this.currentFrame = 0;
    }
  }

  /**
   * RECOVERY: Ending lag (8-15 frames typical)
   * Character is vulnerable but can input next move early
   */
  handleRecoveryState(inputs) {
    // Early-cancel window (last 3 frames of recovery)
    if (this.currentFrame >= this.activeMove.recoveryFrames - 3) {
      if (inputs.includes('ATTACK')) {
        this.currentState = 'STARTUP';
        this.activeMove = this.character.getMove('BASIC_ATTACK');
        this.currentFrame = 0;
        return;
      }
    }

    // Move to idle when recovery ends
    if (this.currentFrame >= this.activeMove.recoveryFrames) {
      this.currentState = 'IDLE';
      this.currentFrame = 0;
      this.comboCounter = 0; // Reset combo
    }
  }

  /**
   * HITSTUN: Knocked back, temporary invulnerability
   * Knockback + 0.08s freeze
   */
  handleHitstunState() {
    if (this.currentFrame >= this.activeMove.hitstunFrames) {
      this.currentState = 'IDLE';
      this.currentFrame = 0;
    }
  }

  /**
   * TRANSFORMATION: Legacy Form activation
   * 1.2x speed multiplier, enhanced visual effects
   */
  handleTransformationState() {
    if (this.isLegacyForm) {
      this.transformationMultiplier = 1.2;
      this.character.speedMultiplier *= 1.2;
    }

    if (this.currentFrame >= 30) { // 0.5s duration
      this.currentState = 'IDLE';
      this.isLegacyForm = false;
      this.transformationMultiplier = 1.0;
    }
  }

  /**
   * VOID_POISE: Villain passive (frames 0-5)
   * Damage immunity for early frames
   */
  handleVoidPoiseState() {
    // No damage taken during these frames
    if (this.currentFrame >= 5) {
      this.currentState = 'IDLE';
    }
  }

  /**
   * SHAPESHIFT: Kai-Jax memory echo activation
   * At 100% resonance, copy opponent's last move
   */
  handleShapeshiftState(opponent) {
    if (this.currentFrame === 0) {
      // Instantly copy opponent's last move
      const copiedMove = opponent.lastMoveUsed;
      if (copiedMove) {
        this.activeMove = this.character.getMove(copiedMove.name);
      }
    }

    if (this.currentFrame >= 45) { // 0.75s duration
      this.currentState = 'IDLE';
      this.resonanceLevel = 0; // Drain resonance
    }
  }

  /**
   * Trigger a transformation (Legacy Shift)
   */
  triggerTransformation() {
    this.currentState = 'TRANSFORMATION';
    this.isLegacyForm = true;
    this.currentFrame = 0;
  }

  /**
   * Apply knockback and enter hitstun
   * @param {number} power - Attack power
   * @param {number} angle - Direction (degrees)
   */
  applyHit(power, angle) {
    this.currentState = 'HITSTUN';
    this.currentFrame = 0;
    this.lastHitFrame = 0;
    this.dreadLevel = Math.min(100, this.dreadLevel + 2);
  }

  /**
   * Update resonance and dread metrics
   */
  updateMetrics() {
    // Resonance decays slowly when not in combo
    if (Date.now() - this.lastHitFrame > 2000) {
      this.resonanceLevel = Math.max(0, this.resonanceLevel - 0.5);
    }

    // Dread increases when pressured
    if (this.currentState === 'HITSTUN' || this.currentState === 'RECOVERY') {
      this.dreadLevel = Math.min(100, this.dreadLevel + 0.3);
    }
  }

  /**
   * Get frame data for current active move
   * @returns {Object} Frame data
   */
  getFrameData() {
    if (!this.activeMove) {
      return { startup: 0, active: 0, recovery: 0, cancelFrame: 0, hitstun: 0 };
    }
    return {
      startup: this.activeMove.startupFrames,
      active: this.activeMove.activeFrames,
      recovery: this.activeMove.recoveryFrames,
      cancelFrame: this.activeMove.cancelFrame,
      hitstun: this.activeMove.hitstunFrames
    };
  }

  /**
   * Confirm hit detection
   * (Called by collision system when hitbox connects)
   */
  confirmHit() {
    this.hitConfirm = true;
  }

  /**
   * Reset combo counter on hit reset
   */
  resetCombo() {
    this.comboCounter = 0;
    this.lastHitFrame = -999;
  }
}

export default CombatStateMachine;

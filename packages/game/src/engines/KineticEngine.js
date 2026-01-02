/**
 * PROJECT OMEGA: GLOBAL KINETIC ENGINE (V2.0)
 *
 * The Aeterna's physics backbone. Handles all movement, gravity, momentum,
 * and impact calculations with 1000Hz polling precision.
 *
 * Mathematical Foundation: K = (P × W) + D
 */

export class KineticEngine {
  constructor(config = {}) {
    // Physics constants (Bronx Standard: g=18.0 for heavyweight feel)
    this.gravity = config.gravity || 18.0;
    this.maxFallSpeed = config.maxFallSpeed || 12;
    this.airFriction = config.airFriction || 0.95;
    this.groundFriction = config.groundFriction || 0.85;

    // Input handling
    this.coyoteTimeFrames = 4; // Forgiveness window for jump input
    this.bufferWindow = 6; // Input buffer for combos
    this.inputBuffer = [];
    this.inputHistory = [];

    // Impact & hit-stop
    this.impactLagTimer = 0;
    this.impactLagFrames = 5; // 0.08s at 60fps

    // Character state
    this.velocity = { x: 0, y: 0 };
    this.position = { x: 0, y: 0 };
    this.isGrounded = false;
    this.groundNormalY = 1; // For slope detection
  }

  /**
   * Primary physics update loop (called every frame)
   * @param {Object} character - Character state object
   * @param {number} deltaTime - Time since last frame (ms)
   * @param {Array<string>} inputs - Buffered inputs this frame
   */
  calculatePhysics(character, deltaTime, inputs) {
    // Skip physics during impact lag
    if (this.impactLagTimer > 0) {
      this.impactLagTimer -= deltaTime;
      return;
    }

    // Handle input buffering
    this.bufferInput(inputs);

    // Apply gravity
    if (!this.isGrounded) {
      this.velocity.y += this.gravity * deltaTime;
      this.velocity.y = Math.min(this.velocity.y, this.maxFallSpeed);
    }

    // Apply air/ground friction
    const frictionFactor = this.isGrounded ? this.groundFriction : this.airFriction;
    this.velocity.x *= frictionFactor;

    // Update position
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;

    // Collision detection (simplified)
    this.checkGroundCollision(character);

    return {
      position: this.position,
      velocity: this.velocity,
      isGrounded: this.isGrounded
    };
  }

  /**
   * Calculate knockback distance using the Aeterna formula
   * K = (P × W) + D
   *
   * @param {number} power - Attack power (damage units)
   * @param {number} weight - Receiver weight multiplier
   * @param {number} angleOffset - Direction modifier (degrees)
   * @returns {Object} { distance, angle }
   */
  calculateKnockback(power, weight, angleOffset = 0) {
    const weightMultiplier = 1 / (1 + weight / 100); // Heavier = less knockback
    const knockbackDistance = (power * weightMultiplier) + (angleOffset * 0.1);

    return {
      distance: knockbackDistance,
      angle: angleOffset,
      velocity: {
        x: knockbackDistance * Math.cos((angleOffset * Math.PI) / 180),
        y: knockbackDistance * Math.sin((angleOffset * Math.PI) / 180)
      }
    };
  }

  /**
   * Apply impact lag (hit-stop) for visual feedback
   * @param {number} frames - Number of frames to freeze
   */
  triggerImpact(frames) {
    this.impactLagTimer = (frames / 60) * 1000; // Convert to milliseconds
  }

  /**
   * Handle jump input with coyote time forgiveness
   * @param {Object} character - Character state
   * @returns {boolean} Jump accepted
   */
  handleJumpInput(character) {
    const coyoteWindow = this.inputHistory.slice(-this.coyoteTimeFrames);
    const canJump = this.isGrounded || coyoteWindow.some(frame => frame.wasGrounded);

    if (canJump) {
      this.velocity.y = -character.jumpForce;
      this.isGrounded = false;
      return true;
    }
    return false;
  }

  /**
   * Buffer input for combo execution
   * @param {Array<string>} inputs
   */
  bufferInput(inputs) {
    this.inputBuffer.push(...inputs);
    if (this.inputBuffer.length > this.bufferWindow) {
      this.inputBuffer.shift();
    }
    this.inputHistory.push({
      inputs,
      wasGrounded: this.isGrounded,
      timestamp: Date.now()
    });
  }

  /**
   * Check if character is grounded
   * @param {Object} character - Character state
   */
  checkGroundCollision(character) {
    // Simplified: check if position.y >= ground level
    const groundLevel = character.groundLevel || 0;
    if (this.position.y >= groundLevel) {
      this.position.y = groundLevel;
      this.velocity.y = 0;
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }
  }

  /**
   * Get current input buffer state
   * @returns {Array<string>}
   */
  getInputBuffer() {
    return [...this.inputBuffer];
  }

  /**
   * Clear input buffer (after executing combo)
   */
  clearInputBuffer() {
    this.inputBuffer = [];
  }

  /**
   * Apply momentum scaling (for combo chains)
   * @param {number} resonanceLevel - Current resonance (0-100)
   * @returns {number} Velocity multiplier
   */
  getMomentumMultiplier(resonanceLevel) {
    return 1 + (resonanceLevel / 100) * 0.3; // Up to 1.3x scaling
  }
}

export default KineticEngine;

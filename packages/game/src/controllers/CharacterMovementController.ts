// Character Movement Controller
// Path: packages/game/src/controllers/CharacterMovementController.ts

import * as THREE from 'three';
import { FeelabilityEngine } from '@game/engines/FeelabilityEngine';
import { KineticEngine } from '@game/engines/KineticEngine';
import { EventBus } from '@game/core/EventBus';

interface MovementInput {
  left: boolean;
  right: boolean;
  jump: boolean;
  attack: boolean;
}

interface CharacterPhysicsState {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  isGrounded: boolean;
  jumpCount: number;
  canDoubleJump: boolean;
  coyoteTimeRemaining: number;
}

/**
 * Controller for character movement with LULU Protocol v7 physics
 * Integrates KineticEngine, FeelabilityEngine, and input handling
 */
export class CharacterMovementController {
  private character: THREE.Group;
  private physics: CharacterPhysicsState;
  private input: MovementInput = { left: false, right: false, jump: false, attack: false };
  
  private kinetic: KineticEngine;
  private feelability: FeelabilityEngine;
  private eventBus: EventBus;
  
  private moveSpeed = 8.0; // Units per second
  private jumpForce = 15.0; // Initial jump velocity
  private groundCheckDistance = 0.1;
  private coyoteTimeMax = 4; // Frames (LULU Protocol v7)
  private lastGroundedFrame = 0;
  private frameCount = 0;

  constructor(
    character: THREE.Group,
    kinetic: KineticEngine,
    feelability: FeelabilityEngine,
    eventBus: EventBus
  ) {
    this.character = character;
    this.kinetic = kinetic;
    this.feelability = feelability;
    this.eventBus = eventBus;

    // Initialize physics state
    this.physics = {
      position: character.position.clone(),
      velocity: new THREE.Vector3(0, 0, 0),
      isGrounded: false,
      jumpCount: 0,
      canDoubleJump: true,
      coyoteTimeRemaining: 0,
    };

    // Setup input listeners
    this.setupInputListeners();

    // Subscribe to game events
    this.eventBus.subscribe('match:start', () => this.onMatchStart());
    this.eventBus.subscribe('character:damaged', (data) => this.onDamaged(data));
  }

  /**
   * Setup keyboard and gamepad input listeners
   */
  private setupInputListeners(): void {
    window.addEventListener('keydown', (e) => {
      switch (e.key.toLowerCase()) {
        case 'a':
        case 'arrowleft':
          this.input.left = true;
          break;
        case 'd':
        case 'arrowright':
          this.input.right = true;
          break;
        case 'w':
        case ' ':
        case 'arrowup':
          if (!this.input.jump) {
            this.input.jump = true;
            this.attemptJump();
          }
          break;
        case 'j':
          this.input.attack = true;
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.key.toLowerCase()) {
        case 'a':
        case 'arrowleft':
          this.input.left = false;
          break;
        case 'd':
        case 'arrowright':
          this.input.right = false;
          break;
        case 'w':
        case ' ':
        case 'arrowup':
          this.input.jump = false;
          break;
        case 'j':
          this.input.attack = false;
          break;
      }
    });

    // Gamepad support
    setInterval(() => this.updateGamepadInput(), 16); // ~60fps
  }

  /**
   * Update gamepad input
   */
  private updateGamepadInput(): void {
    const gamepads = navigator.getGamepads();
    if (!gamepads[0]) return;

    const gp = gamepads[0];
    
    // Analog stick (left) for movement
    this.input.left = gp.axes[0] < -0.5;
    this.input.right = gp.axes[0] > 0.5;
    
    // Button A/Cross for jump
    if (gp.buttons[0]?.pressed && !this.input.jump) {
      this.input.jump = true;
      this.attemptJump();
    }
    this.input.jump = gp.buttons[0]?.pressed || false;
    
    // Button X/Square for attack
    this.input.attack = gp.buttons[2]?.pressed || false;
  }

  /**
   * Attempt to jump (respects coyote time and double jump)
   */
  private attemptJump(): void {
    const canJump = this.physics.isGrounded || 
                   this.frameCount - this.lastGroundedFrame <= this.coyoteTimeMax;
    
    if (canJump && this.physics.jumpCount === 0) {
      this.physics.velocity.y = this.jumpForce;
      this.physics.jumpCount = 1;
      this.eventBus.emit('jump:performed', { characterId: this.character.name });
    } else if (this.physics.canDoubleJump && this.physics.jumpCount === 1) {
      this.physics.velocity.y = this.jumpForce * 0.85; // Slightly weaker double jump
      this.physics.jumpCount = 2;
      this.physics.canDoubleJump = false;
      this.eventBus.emit('jump:double', { characterId: this.character.name });
    }
  }

  /**
   * Update character movement and physics each frame
   * @param deltaTime - Time since last frame in seconds
   * @param ground - Ground plane for collision detection
   */
  public update(deltaTime: number, ground: THREE.Plane): void {
    this.frameCount++;

    // Apply gravity
    const gravity = this.kinetic.getGravityMultiplier() * 9.81;
    this.physics.velocity.y -= gravity * deltaTime;

    // Horizontal movement
    const moveDir = new THREE.Vector3(0, 0, 0);
    if (this.input.left) moveDir.x -= 1;
    if (this.input.right) moveDir.x += 1;
    moveDir.normalize();

    this.physics.velocity.x = moveDir.x * this.moveSpeed;

    // Update position
    this.physics.position.addScaledVector(this.physics.velocity, deltaTime);

    // Ground collision
    const groundDistance = this.physics.position.y;
    if (groundDistance <= this.groundCheckDistance) {
      this.physics.position.y = this.groundCheckDistance;
      
      if (this.physics.velocity.y < 0) {
        this.physics.velocity.y = 0;
        this.physics.isGrounded = true;
        this.lastGroundedFrame = this.frameCount;
        this.physics.jumpCount = 0;
        this.physics.canDoubleJump = true;
      }
    } else {
      this.physics.isGrounded = false;
      this.physics.coyoteTimeRemaining = Math.max(
        0,
        this.coyoteTimeMax - (this.frameCount - this.lastGroundedFrame)
      );
    }

    // Apply position to model
    this.character.position.copy(this.physics.position);

    // Visual rotation based on movement direction
    if (moveDir.x !== 0) {
      this.character.rotation.y = moveDir.x > 0 ? 0 : Math.PI;
    }

    // Emit physics update event
    this.eventBus.emit('character:physics_update', {
      characterId: this.character.name,
      position: this.physics.position,
      velocity: this.physics.velocity,
      isGrounded: this.physics.isGrounded,
    });
  }

  /**
   * Apply knockback from being hit
   * @param force - Knockback force vector
   * @param weight - Character weight for knockback calculation
   */
  public applyKnockback(force: THREE.Vector3, weight: number): void {
    const kb = force.clone().multiplyScalar(1 / weight);
    this.physics.velocity.add(kb);
    
    // Apply hit-stop effect
    this.feelability.onHitLanded({
      damage: force.length(),
      knockback: force.length(),
      weight: weight,
      hitStopFrames: 0.08 * 60, // 0.08s at 60fps
    });

    this.eventBus.emit('character:knockback_applied', {
      characterId: this.character.name,
      force: force,
    });
  }

  /**
   * Get current physics state
   */
  public getPhysics(): CharacterPhysicsState {
    return { ...this.physics };
  }

  /**
   * Check if character is in a state that allows actions
   */
  public canPerformAction(): boolean {
    return !this.physics.isGrounded || this.physics.jumpCount === 0;
  }

  private onMatchStart(): void {
    console.log(`[CharacterMovement] Match started for ${this.character.name}`);
  }

  private onDamaged(data: any): void {
    if (data.characterId === this.character.name) {
      this.applyKnockback(data.knockback, data.weight || 1.0);
    }
  }

  /**
   * Reset character state (for match restart)
   */
  public reset(): void {
    this.physics.position.set(0, 1, 0);
    this.physics.velocity.set(0, 0, 0);
    this.physics.isGrounded = false;
    this.physics.jumpCount = 0;
    this.physics.canDoubleJump = true;
    this.frameCount = 0;
    this.lastGroundedFrame = 0;
  }
}

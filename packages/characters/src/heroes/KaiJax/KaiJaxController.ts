/**
 * Kai-Jax Controller - Character Integration
 * 
 * Wires together InputManager and AnimationStateMachine to control Kai-Jax character.
 * Follows governance rules:
 * - Single gameplay core across all platforms
 * - Platform adapters handle ONLY input translation
 * - No platform-specific logic divergence in combat mechanics
 * 
 * References:
 * - kai_jax.character.json: combat_identity, animation rules
 * - README_CANON.md: Unified gameplay core section
 * - config/input-keybinds.json: Input mappings
 */

import { InputManager } from '@beast-kin/engine/input';
import { AnimationStateMachine, AnimationStateType } from '@beast-kin/engine/character';
import { KaiJaxCharacter } from './KaiJaxCharacter';
import { InputAction } from '@beast-kin/shared';

/**
 * Controller state for tracking input and animation
 */
interface ControllerState {
  // Input state
  moveInput: { x: number; y: number };
  isRunning: boolean;
  isSprinting: boolean;
  isJumping: boolean;
  isGrounded: boolean;
  attackPressed: boolean;
  heavyAttackPressed: boolean;
  dodgePressed: boolean;
  parryPressed: boolean;
  
  // Combat state
  comboCount: number;
  lastAttackTime: number;
  canCombo: boolean;
  
  // Physics state
  velocity: { x: number; y: number };
}

/**
 * Kai-Jax Character Controller
 * 
 * Production-grade controller that integrates:
 * - InputManager (all platforms)
 * - AnimationStateMachine (type-safe transitions)
 * - KaiJaxCharacter (gameplay logic)
 * 
 * Update flow:
 * 1. Poll input from InputManager
 * 2. Calculate next state from AnimationStateMachine
 * 3. Apply state changes to character
 * 4. Log state transitions for debugging
 * 5. Handle frame-perfect cancel windows
 */
export class KaiJaxController {
  private character: KaiJaxCharacter;
  private inputManager: InputManager;
  private animationStateMachine: AnimationStateMachine;
  private state: ControllerState;
  private debug: boolean = false;

  constructor(
    character: KaiJaxCharacter,
    inputManager: InputManager,
    debug: boolean = false
  ) {
    this.character = character;
    this.inputManager = inputManager;
    this.animationStateMachine = new AnimationStateMachine();
    this.debug = debug;

    this.state = {
      moveInput: { x: 0, y: 0 },
      isRunning: false,
      isSprinting: false,
      isJumping: false,
      isGrounded: true,
      attackPressed: false,
      heavyAttackPressed: false,
      dodgePressed: false,
      parryPressed: false,
      comboCount: 0,
      lastAttackTime: 0,
      canCombo: false,
      velocity: { x: 0, y: 0 },
    };

    this.setupAnimationCallbacks();
  }

  /**
   * Setup animation state callbacks for VFX/sound integration
   */
  private setupAnimationCallbacks(): void {
    // On entering attack states, trigger VFX/sound
    this.animationStateMachine.onEnter(AnimationStateType.ATTACK_1, (from, to, metadata) => {
      if (this.debug) {
        console.log(`[KaiJaxController] Attack 1 started`);
      }
      
      // Trigger haptic feedback on mobile
      const mobileHandler = this.inputManager.getMobileInputHandler();
      mobileHandler?.triggerHaptic('attack');
      
      // Could emit event for VFX/sound here
      // this.character.emit('attack_started', { state: to, metadata });
    });

    this.animationStateMachine.onEnter(AnimationStateType.PARRY_SUCCESS, (from, to, metadata) => {
      if (this.debug) {
        console.log(`[KaiJaxController] Perfect parry! Cancel window opened`);
      }
      
      // Strong haptic feedback on perfect parry
      const mobileHandler = this.inputManager.getMobileInputHandler();
      mobileHandler?.triggerHaptic('parry');
      
      this.state.canCombo = true; // Enable perfect parry cancel
    });

    // On exiting attack states, check combo continuation
    this.animationStateMachine.onExit(AnimationStateType.ATTACK_1, (from, to, metadata) => {
      if (to === AnimationStateType.ATTACK_2) {
        this.state.comboCount++;
        if (this.debug) {
          console.log(`[KaiJaxController] Combo count: ${this.state.comboCount}`);
        }
      } else {
        this.state.comboCount = 0;
      }
    });

    // State change haptic feedback
    this.animationStateMachine.onEnter(AnimationStateType.JUMP, (from, to) => {
      const mobileHandler = this.inputManager.getMobileInputHandler();
      mobileHandler?.triggerHaptic('state_change');
    });

    this.animationStateMachine.onEnter(AnimationStateType.DODGE_GROUND, (from, to) => {
      const mobileHandler = this.inputManager.getMobileInputHandler();
      mobileHandler?.triggerHaptic('state_change');
    });
  }

  /**
   * Main update loop - called every frame
   * 
   * Flow:
   * 1. Update input manager (poll gamepad)
   * 2. Read input state
   * 3. Update controller state
   * 4. Determine next animation state
   * 5. Update animation state machine
   * 6. Update character
   */
  public update(deltaTime: number): void {
    // 1. Update input manager (polls gamepad state)
    this.inputManager.update();

    // 2. Read input state
    this.readInput();

    // 3. Update controller state
    this.updateControllerState(deltaTime);

    // 4. Determine next animation state
    this.determineNextState();

    // 5. Update animation state machine
    this.animationStateMachine.update(deltaTime);

    // 6. Update character
    this.character.update(deltaTime);

    // Log state transitions if debug enabled
    if (this.debug) {
      const currentState = this.animationStateMachine.getCurrentState();
      const previousState = this.animationStateMachine.getPreviousState();
      if (currentState !== previousState) {
        console.log(
          `[KaiJaxController] State transition: ${previousState} → ${currentState}`
        );
      }
    }
  }

  /**
   * Read input from InputManager
   */
  private readInput(): void {
    // Movement
    this.state.moveInput = this.inputManager.getMovementVector();

    // Running/sprinting (hold dash while moving)
    const dashHeld = this.inputManager.isActionPressed(InputAction.DASH);
    if (this.state.moveInput.x !== 0 || this.state.moveInput.y !== 0) {
      this.state.isRunning = dashHeld;
      // Sprint if running at max speed in one direction
      const magnitude = Math.sqrt(
        this.state.moveInput.x ** 2 + this.state.moveInput.y ** 2
      );
      this.state.isSprinting = dashHeld && magnitude > 0.9;
    } else {
      this.state.isRunning = false;
      this.state.isSprinting = false;
    }

    // Jump (check frame-perfect input buffer)
    const jumpPressed = this.inputManager.isActionJustPressed(InputAction.JUMP, 3);
    this.state.isJumping = jumpPressed && this.state.isGrounded;

    // Attacks (frame-perfect input)
    this.state.attackPressed = this.inputManager.isActionJustPressed(
      InputAction.LIGHT_ATTACK,
      1
    );
    this.state.heavyAttackPressed = this.inputManager.isActionJustPressed(
      InputAction.HEAVY_ATTACK,
      1
    );

    // Defensive
    this.state.dodgePressed = this.inputManager.isActionJustPressed(InputAction.DODGE, 2);
    this.state.parryPressed = this.inputManager.isActionJustPressed(InputAction.PARRY, 1);
  }

  /**
   * Update controller state (physics, combat tracking)
   */
  private updateControllerState(deltaTime: number): void {
    // Update grounded state (would check physics in real implementation)
    // For now, simulate with velocity
    if (this.state.velocity.y === 0) {
      this.state.isGrounded = true;
    } else {
      this.state.isGrounded = false;
    }

    // Combo window check (250ms between attacks)
    const now = performance.now();
    if (now - this.state.lastAttackTime > 250) {
      this.state.canCombo = false;
    }

    // Reset combo if not attacking
    const currentState = this.animationStateMachine.getCurrentState();
    if (
      !currentState.includes('attack') &&
      currentState !== AnimationStateType.ATTACK_1 &&
      currentState !== AnimationStateType.ATTACK_2 &&
      currentState !== AnimationStateType.ATTACK_3
    ) {
      if (now - this.state.lastAttackTime > 500) {
        this.state.comboCount = 0;
      }
    }
  }

  /**
   * Determine next animation state based on input and current state
   * 
   * Priority system (from AnimationStateMachine):
   * - ATTACK > JUMP > MOVEMENT > IDLE
   * - Forced transitions (hit reactions) bypass validation
   * - Frame-perfect cancels in cancel windows only
   */
  private determineNextState(): void {
    const currentState = this.animationStateMachine.getCurrentState();
    const isInCancelWindow = this.animationStateMachine.isInCancelWindow();

    // Priority 1: Defensive actions (parry, dodge)
    if (this.state.parryPressed && this.state.isGrounded) {
      this.animationStateMachine.transitionTo(AnimationStateType.PARRY);
      return;
    }

    if (this.state.dodgePressed) {
      if (this.state.isGrounded) {
        this.animationStateMachine.transitionTo(AnimationStateType.DODGE_GROUND);
      } else {
        this.animationStateMachine.transitionTo(AnimationStateType.DODGE_AIR);
      }
      return;
    }

    // Priority 2: Attacks (with combo system)
    if (this.state.attackPressed && this.state.isGrounded) {
      // Check for combo continuation
      if (currentState === AnimationStateType.ATTACK_1 && isInCancelWindow) {
        this.animationStateMachine.transitionTo(AnimationStateType.ATTACK_2);
        this.state.lastAttackTime = performance.now();
        return;
      } else if (currentState === AnimationStateType.ATTACK_2 && isInCancelWindow) {
        this.animationStateMachine.transitionTo(AnimationStateType.ATTACK_3);
        this.state.lastAttackTime = performance.now();
        return;
      } else if (
        currentState === AnimationStateType.IDLE_CALM ||
        currentState === AnimationStateType.IDLE_COMBAT ||
        currentState === AnimationStateType.WALK ||
        currentState === AnimationStateType.RUN
      ) {
        this.animationStateMachine.transitionTo(AnimationStateType.ATTACK_1);
        this.state.lastAttackTime = performance.now();
        this.state.comboCount = 0;
        return;
      }
    }

    if (this.state.heavyAttackPressed && this.state.isGrounded) {
      // Heavy attack can be combo finisher
      if (currentState === AnimationStateType.ATTACK_3 && isInCancelWindow) {
        this.animationStateMachine.transitionTo(AnimationStateType.ATTACK_HEAVY);
        return;
      } else if (
        currentState === AnimationStateType.IDLE_CALM ||
        currentState === AnimationStateType.IDLE_COMBAT
      ) {
        this.animationStateMachine.transitionTo(AnimationStateType.ATTACK_HEAVY);
        return;
      }
    }

    // Priority 3: Jump
    if (this.state.isJumping) {
      this.animationStateMachine.transitionTo(AnimationStateType.JUMP);
      this.state.velocity.y = 15; // Jump velocity
      return;
    }

    // Priority 4: Movement
    const moveSpeed = Math.sqrt(
      this.state.moveInput.x ** 2 + this.state.moveInput.y ** 2
    );

    if (moveSpeed > 0.1) {
      if (this.state.isSprinting) {
        if (currentState !== AnimationStateType.SPRINT) {
          this.animationStateMachine.transitionTo(AnimationStateType.SPRINT);
        }
      } else if (this.state.isRunning) {
        if (currentState !== AnimationStateType.RUN) {
          this.animationStateMachine.transitionTo(AnimationStateType.RUN);
        }
      } else {
        if (currentState !== AnimationStateType.WALK) {
          this.animationStateMachine.transitionTo(AnimationStateType.WALK);
        }
      }
      return;
    }

    // Priority 5: Idle (default state)
    if (
      moveSpeed < 0.1 &&
      (currentState === AnimationStateType.WALK ||
        currentState === AnimationStateType.RUN ||
        currentState === AnimationStateType.SPRINT)
    ) {
      // Return to combat idle if was moving, calm idle otherwise
      if (this.state.comboCount > 0 || this.state.lastAttackTime > performance.now() - 2000) {
        this.animationStateMachine.transitionTo(AnimationStateType.IDLE_COMBAT);
      } else {
        this.animationStateMachine.transitionTo(AnimationStateType.IDLE_CALM);
      }
    }
  }

  /**
   * Force state transition (for external triggers like hit reactions)
   * 
   * @param state - Target animation state
   */
  public forceState(state: AnimationStateType): void {
    this.animationStateMachine.transitionTo(state, true);
    
    if (this.debug) {
      console.log(`[KaiJaxController] Forced state: ${state}`);
    }
  }

  /**
   * Get current animation state
   */
  public getCurrentState(): AnimationStateType {
    return this.animationStateMachine.getCurrentState();
  }

  /**
   * Get animation state machine (for advanced control)
   */
  public getAnimationStateMachine(): AnimationStateMachine {
    return this.animationStateMachine;
  }

  /**
   * Get input manager (for configuration)
   */
  public getInputManager(): InputManager {
    return this.inputManager;
  }

  /**
   * Enable/disable debug logging
   */
  public setDebug(enabled: boolean): void {
    this.debug = enabled;
  }

  /**
   * Reset controller state
   */
  public reset(): void {
    this.state = {
      moveInput: { x: 0, y: 0 },
      isRunning: false,
      isSprinting: false,
      isJumping: false,
      isGrounded: true,
      attackPressed: false,
      heavyAttackPressed: false,
      dodgePressed: false,
      parryPressed: false,
      comboCount: 0,
      lastAttackTime: 0,
      canCombo: false,
      velocity: { x: 0, y: 0 },
    };
    
    this.animationStateMachine.reset();
    this.character.reset();
  }
}

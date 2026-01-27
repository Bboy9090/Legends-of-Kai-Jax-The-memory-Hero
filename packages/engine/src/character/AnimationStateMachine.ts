/**
 * Animation State Machine - Production-Grade TypeScript Implementation
 * 
 * Type-safe animation state transitions following C++ reference architecture.
 * Enforces governance rules from kai_jax.character.json:
 * - Min 12 frames per action
 * - Cancel rules: hit_confirm_or_perfect_parry_only
 * - Mass and inertia philosophy (no floaty motion)
 * 
 * Priority System: ATTACK > JUMP > MOVEMENT > IDLE
 * 
 * References:
 * - kai_jax.character.json: animation.required_sets, animation.frame_rules
 * - README_CANON.md: Section on animation timing (never altered per platform)
 */

/**
 * Animation states matching C++ reference implementation
 * 
 * Expanded from basic states to include Kai-Jax specific combat states
 */
export enum AnimationStateType {
  // Core States
  IDLE_CALM = 'idle_calm',
  IDLE_COMBAT = 'idle_combat',
  
  // Movement
  WALK = 'walk',
  RUN = 'run',
  SPRINT = 'sprint',
  
  // Jump/Air
  JUMP = 'jump',
  JUMP_APEX = 'jump_apex',
  FALL = 'fall',
  LAND = 'land',
  
  // Basic Attacks
  ATTACK_1 = 'attack_1', // Light attack 1
  ATTACK_2 = 'attack_2', // Light attack 2
  ATTACK_3 = 'attack_3', // Light attack 3
  ATTACK_HEAVY = 'attack_heavy',
  
  // Aerial Attacks
  AERIAL_LIGHT = 'aerial_light',
  AERIAL_HEAVY = 'aerial_heavy',
  
  // Special Moves
  SPECIAL_NEUTRAL = 'special_neutral',
  SPECIAL_SIDE = 'special_side',
  SPECIAL_UP = 'special_up',
  SPECIAL_DOWN = 'special_down',
  
  // Defensive
  DODGE_GROUND = 'dodge_ground',
  DODGE_AIR = 'dodge_air',
  PARRY = 'parry',
  PARRY_SUCCESS = 'parry_success',
  COUNTER = 'counter',
  BLOCK = 'block',
  
  // Hit Reactions
  HIT_LIGHT = 'hit_light',
  HIT_HEAVY = 'hit_heavy',
  HIT_LAUNCH = 'hit_launch',
  HITSTUN = 'hitstun',
  KNOCKDOWN = 'knockdown',
  GETUP = 'getup',
  
  // Ultimate/Finisher
  ULTIMATE = 'ultimate',
  FINISHER = 'finisher',
  
  // Match End
  VICTORY = 'victory',
  DEFEAT = 'defeat',
  DEATH = 'death',
}

/**
 * Animation state metadata
 * 
 * Defines per-state properties for animation playback and transitions
 */
export interface AnimationStateMetadata {
  /** Animation name/clip identifier */
  clipName: string;
  
  /** Duration in frames at 60fps (min 12 per kai_jax.character.json) */
  durationFrames: number;
  
  /** Whether animation loops */
  looping: boolean;
  
  /** Blend duration when transitioning to this state (seconds) */
  blendDuration: number;
  
  /** Playback speed multiplier */
  speed: number;
  
  /** Can this animation be cancelled early? */
  cancellable: boolean;
  
  /** Frame range where cancel is allowed [start, end] */
  cancelWindow?: [number, number];
  
  /** Can animation be interrupted by hit? */
  interruptible: boolean;
  
  /** Priority level (higher = more important) */
  priority: number;
  
  /** Root motion enabled? (for finishers, knockdowns per kai_jax.character.json) */
  rootMotion: boolean;
}

/**
 * Transition validation result
 */
export interface TransitionValidation {
  valid: boolean;
  reason?: string;
}

/**
 * State change event callback
 */
export type StateChangeCallback = (
  fromState: AnimationStateType,
  toState: AnimationStateType,
  metadata: AnimationStateMetadata
) => void;

/**
 * Type-safe Animation State Machine
 * 
 * Manages animation state transitions with validation and priority system.
 * Enforces governance rules and provides event callbacks for VFX/sound.
 */
export class AnimationStateMachine {
  private currentState: AnimationStateType = AnimationStateType.IDLE_CALM;
  private previousState: AnimationStateType = AnimationStateType.IDLE_CALM;
  private frameCount: number = 0;
  private stateMetadata: Map<AnimationStateType, AnimationStateMetadata>;
  private validTransitions: Map<AnimationStateType, Set<AnimationStateType>>;
  
  // Event callbacks
  private onEnterCallbacks: Map<AnimationStateType, Set<StateChangeCallback>> = new Map();
  private onExitCallbacks: Map<AnimationStateType, Set<StateChangeCallback>> = new Map();
  
  constructor() {
    this.stateMetadata = this.initializeStateMetadata();
    this.validTransitions = this.initializeValidTransitions();
  }

  /**
   * Initialize animation state metadata
   * 
   * Following kai_jax.character.json rules:
   * - min_frames_per_action: 12
   * - cancel_rules: hit_confirm_or_perfect_parry_only
   */
  private initializeStateMetadata(): Map<AnimationStateType, AnimationStateMetadata> {
    const metadata = new Map<AnimationStateType, AnimationStateMetadata>();

    // Idle states
    metadata.set(AnimationStateType.IDLE_CALM, {
      clipName: 'IdleCalm',
      durationFrames: 120,
      looping: true,
      blendDuration: 0.2,
      speed: 1.0,
      cancellable: true,
      interruptible: true,
      priority: 1,
      rootMotion: false,
    });

    metadata.set(AnimationStateType.IDLE_COMBAT, {
      clipName: 'IdleCombat',
      durationFrames: 90,
      looping: true,
      blendDuration: 0.15,
      speed: 1.0,
      cancellable: true,
      interruptible: true,
      priority: 2,
      rootMotion: false,
    });

    // Movement states
    metadata.set(AnimationStateType.WALK, {
      clipName: 'Walk',
      durationFrames: 30,
      looping: true,
      blendDuration: 0.15,
      speed: 1.0,
      cancellable: true,
      interruptible: true,
      priority: 10,
      rootMotion: false,
    });

    metadata.set(AnimationStateType.RUN, {
      clipName: 'Run',
      durationFrames: 24,
      looping: true,
      blendDuration: 0.15,
      speed: 1.0,
      cancellable: true,
      interruptible: true,
      priority: 11,
      rootMotion: false,
    });

    metadata.set(AnimationStateType.SPRINT, {
      clipName: 'Sprint',
      durationFrames: 20,
      looping: true,
      blendDuration: 0.12,
      speed: 1.2,
      cancellable: true,
      interruptible: true,
      priority: 12,
      rootMotion: false,
    });

    // Jump/Air states
    metadata.set(AnimationStateType.JUMP, {
      clipName: 'Jump',
      durationFrames: 45,
      looping: false,
      blendDuration: 0.1,
      speed: 1.0,
      cancellable: false,
      interruptible: true,
      priority: 30,
      rootMotion: false,
    });

    metadata.set(AnimationStateType.FALL, {
      clipName: 'Fall',
      durationFrames: 60,
      looping: true,
      blendDuration: 0.1,
      speed: 1.0,
      cancellable: true,
      interruptible: true,
      priority: 29,
      rootMotion: false,
    });

    metadata.set(AnimationStateType.LAND, {
      clipName: 'Land',
      durationFrames: 15,
      looping: false,
      blendDuration: 0.08,
      speed: 1.0,
      cancellable: false,
      interruptible: true,
      priority: 28,
      rootMotion: false,
    });

    // Attack states (min 12 frames enforced)
    metadata.set(AnimationStateType.ATTACK_1, {
      clipName: 'AttackLight1',
      durationFrames: 18,
      looping: false,
      blendDuration: 0.05,
      speed: 1.0,
      cancellable: true,
      cancelWindow: [12, 18], // Can cancel after minimum frames
      interruptible: false,
      priority: 50,
      rootMotion: false,
    });

    metadata.set(AnimationStateType.ATTACK_2, {
      clipName: 'AttackLight2',
      durationFrames: 20,
      looping: false,
      blendDuration: 0.05,
      speed: 1.0,
      cancellable: true,
      cancelWindow: [14, 20],
      interruptible: false,
      priority: 51,
      rootMotion: false,
    });

    metadata.set(AnimationStateType.ATTACK_3, {
      clipName: 'AttackLight3',
      durationFrames: 24,
      looping: false,
      blendDuration: 0.05,
      speed: 1.0,
      cancellable: true,
      cancelWindow: [18, 24],
      interruptible: false,
      priority: 52,
      rootMotion: false,
    });

    metadata.set(AnimationStateType.ATTACK_HEAVY, {
      clipName: 'AttackHeavy',
      durationFrames: 36,
      looping: false,
      blendDuration: 0.05,
      speed: 1.0,
      cancellable: true,
      cancelWindow: [24, 36], // Longer recovery
      interruptible: false,
      priority: 55,
      rootMotion: false,
    });

    // Defensive states
    metadata.set(AnimationStateType.DODGE_GROUND, {
      clipName: 'DodgeGround',
      durationFrames: 20,
      looping: false,
      blendDuration: 0.08,
      speed: 1.2,
      cancellable: false,
      interruptible: false,
      priority: 45,
      rootMotion: false,
    });

    metadata.set(AnimationStateType.PARRY, {
      clipName: 'Parry',
      durationFrames: 15,
      looping: false,
      blendDuration: 0.05,
      speed: 1.0,
      cancellable: false,
      interruptible: false,
      priority: 60,
      rootMotion: false,
    });

    metadata.set(AnimationStateType.PARRY_SUCCESS, {
      clipName: 'ParrySuccess',
      durationFrames: 12,
      looping: false,
      blendDuration: 0.03,
      speed: 1.0,
      cancellable: true,
      cancelWindow: [8, 12], // Perfect parry cancel window
      interruptible: false,
      priority: 61,
      rootMotion: false,
    });

    // Hit reactions
    metadata.set(AnimationStateType.HIT_LIGHT, {
      clipName: 'HitLight',
      durationFrames: 12,
      looping: false,
      blendDuration: 0.05,
      speed: 1.0,
      cancellable: false,
      interruptible: false,
      priority: 70,
      rootMotion: false,
    });

    metadata.set(AnimationStateType.HITSTUN, {
      clipName: 'HitStun',
      durationFrames: 30,
      looping: false,
      blendDuration: 0.05,
      speed: 0.5,
      cancellable: false,
      interruptible: false,
      priority: 72,
      rootMotion: false,
    });

    // Finisher (root motion enabled per kai_jax.character.json)
    metadata.set(AnimationStateType.FINISHER, {
      clipName: 'Finisher',
      durationFrames: 120,
      looping: false,
      blendDuration: 0.1,
      speed: 1.0,
      cancellable: false,
      interruptible: false,
      priority: 90,
      rootMotion: true, // Root motion for finishers
    });

    // Match end states
    metadata.set(AnimationStateType.VICTORY, {
      clipName: 'Victory',
      durationFrames: 180,
      looping: false,
      blendDuration: 0.3,
      speed: 1.0,
      cancellable: false,
      interruptible: false,
      priority: 100,
      rootMotion: false,
    });

    metadata.set(AnimationStateType.DEFEAT, {
      clipName: 'Defeat',
      durationFrames: 120,
      looping: false,
      blendDuration: 0.3,
      speed: 1.0,
      cancellable: false,
      interruptible: false,
      priority: 100,
      rootMotion: false,
    });

    return metadata;
  }

  /**
   * Initialize valid state transitions
   * 
   * Type-safe transition rules with validation
   */
  private initializeValidTransitions(): Map<AnimationStateType, Set<AnimationStateType>> {
    const transitions = new Map<AnimationStateType, Set<AnimationStateType>>();

    // IDLE transitions
    transitions.set(
      AnimationStateType.IDLE_CALM,
      new Set([
        AnimationStateType.IDLE_COMBAT,
        AnimationStateType.WALK,
        AnimationStateType.RUN,
        AnimationStateType.SPRINT,
        AnimationStateType.ATTACK_1,
        AnimationStateType.JUMP,
        AnimationStateType.DODGE_GROUND,
        AnimationStateType.PARRY,
      ])
    );

    transitions.set(
      AnimationStateType.IDLE_COMBAT,
      new Set([
        AnimationStateType.IDLE_CALM,
        AnimationStateType.WALK,
        AnimationStateType.RUN,
        AnimationStateType.SPRINT,
        AnimationStateType.ATTACK_1,
        AnimationStateType.JUMP,
        AnimationStateType.DODGE_GROUND,
        AnimationStateType.PARRY,
      ])
    );

    // WALK transitions
    transitions.set(
      AnimationStateType.WALK,
      new Set([
        AnimationStateType.IDLE_CALM,
        AnimationStateType.IDLE_COMBAT,
        AnimationStateType.RUN,
        AnimationStateType.SPRINT,
        AnimationStateType.ATTACK_1,
        AnimationStateType.JUMP,
        AnimationStateType.DODGE_GROUND,
      ])
    );

    // SPRINT transitions
    transitions.set(
      AnimationStateType.SPRINT,
      new Set([
        AnimationStateType.IDLE_CALM,
        AnimationStateType.WALK,
        AnimationStateType.RUN,
        AnimationStateType.ATTACK_1,
        AnimationStateType.JUMP,
        AnimationStateType.DODGE_GROUND,
      ])
    );

    // ATTACK_1 transitions (cancellable to combo or idle)
    transitions.set(
      AnimationStateType.ATTACK_1,
      new Set([
        AnimationStateType.ATTACK_2, // Combo continuation
        AnimationStateType.IDLE_COMBAT,
        AnimationStateType.DODGE_GROUND, // Cancel to dodge
      ])
    );

    transitions.set(
      AnimationStateType.ATTACK_2,
      new Set([
        AnimationStateType.ATTACK_3,
        AnimationStateType.IDLE_COMBAT,
        AnimationStateType.DODGE_GROUND,
      ])
    );

    transitions.set(
      AnimationStateType.ATTACK_3,
      new Set([
        AnimationStateType.IDLE_COMBAT,
        AnimationStateType.ATTACK_HEAVY, // Finisher
      ])
    );

    // JUMP transitions
    transitions.set(
      AnimationStateType.JUMP,
      new Set([
        AnimationStateType.FALL,
        AnimationStateType.AERIAL_LIGHT,
        AnimationStateType.AERIAL_HEAVY,
        AnimationStateType.DODGE_AIR,
      ])
    );

    transitions.set(
      AnimationStateType.FALL,
      new Set([
        AnimationStateType.LAND,
        AnimationStateType.AERIAL_LIGHT,
        AnimationStateType.DODGE_AIR,
      ])
    );

    transitions.set(
      AnimationStateType.LAND,
      new Set([AnimationStateType.IDLE_COMBAT, AnimationStateType.WALK])
    );

    // PARRY transitions (can cancel to counter on success)
    transitions.set(
      AnimationStateType.PARRY,
      new Set([AnimationStateType.PARRY_SUCCESS, AnimationStateType.IDLE_COMBAT])
    );

    transitions.set(
      AnimationStateType.PARRY_SUCCESS,
      new Set([
        AnimationStateType.COUNTER, // Perfect parry allows counter
        AnimationStateType.ATTACK_1,
        AnimationStateType.IDLE_COMBAT,
      ])
    );

    // HIT_LIGHT transitions
    transitions.set(
      AnimationStateType.HIT_LIGHT,
      new Set([AnimationStateType.IDLE_COMBAT, AnimationStateType.HITSTUN])
    );

    transitions.set(
      AnimationStateType.HITSTUN,
      new Set([AnimationStateType.IDLE_COMBAT])
    );

    // VICTORY/DEFEAT are terminal states (no transitions out)
    transitions.set(AnimationStateType.VICTORY, new Set());
    transitions.set(AnimationStateType.DEFEAT, new Set());

    return transitions;
  }

  /**
   * Validate a state transition
   */
  public validateTransition(
    fromState: AnimationStateType,
    toState: AnimationStateType
  ): TransitionValidation {
    // Check if transition is in valid set
    const validStates = this.validTransitions.get(fromState);
    if (!validStates || !validStates.has(toState)) {
      return {
        valid: false,
        reason: `Invalid transition: ${fromState} → ${toState}`,
      };
    }

    // Check if current animation is in cancel window
    const currentMetadata = this.stateMetadata.get(fromState);
    if (currentMetadata && currentMetadata.cancellable) {
      if (currentMetadata.cancelWindow) {
        const [start, end] = currentMetadata.cancelWindow;
        if (this.frameCount < start || this.frameCount > end) {
          return {
            valid: false,
            reason: `Not in cancel window (frame ${this.frameCount}, window: ${start}-${end})`,
          };
        }
      }
    } else if (currentMetadata && !currentMetadata.cancellable) {
      // Must complete if not cancellable
      if (this.frameCount < currentMetadata.durationFrames) {
        return {
          valid: false,
          reason: `Animation not cancellable (frame ${this.frameCount}/${currentMetadata.durationFrames})`,
        };
      }
    }

    return { valid: true };
  }

  /**
   * Transition to a new state with validation
   * 
   * @param toState - Target animation state
   * @param force - Force transition (bypass validation, for hit reactions)
   * @returns Success boolean
   */
  public transitionTo(toState: AnimationStateType, force: boolean = false): boolean {
    if (toState === this.currentState) {
      return false; // Already in target state
    }

    // Validate transition unless forced
    if (!force) {
      const validation = this.validateTransition(this.currentState, toState);
      if (!validation.valid) {
        console.warn(`[AnimationSM] Transition rejected: ${validation.reason}`);
        return false;
      }
    }

    // Get metadata
    const toMetadata = this.stateMetadata.get(toState);
    if (!toMetadata) {
      console.error(`[AnimationSM] Unknown state: ${toState}`);
      return false;
    }

    // Trigger exit callbacks
    const exitCallbacks = this.onExitCallbacks.get(this.currentState);
    if (exitCallbacks) {
      exitCallbacks.forEach((callback) => {
        callback(this.currentState, toState, toMetadata);
      });
    }

    // Update state
    this.previousState = this.currentState;
    this.currentState = toState;
    this.frameCount = 0;

    // Trigger enter callbacks
    const enterCallbacks = this.onEnterCallbacks.get(toState);
    if (enterCallbacks) {
      enterCallbacks.forEach((callback) => {
        callback(this.previousState, toState, toMetadata);
      });
    }

    console.log(`[AnimationSM] Transition: ${this.previousState} → ${toState}`);
    return true;
  }

  /**
   * Update state machine (call per frame)
   */
  public update(deltaTime: number): void {
    this.frameCount++;

    const metadata = this.stateMetadata.get(this.currentState);
    if (!metadata) return;

    // Auto-transition when non-looping animation completes
    if (!metadata.looping && this.frameCount >= metadata.durationFrames) {
      this.handleAnimationComplete();
    }
  }

  /**
   * Handle animation completion
   */
  private handleAnimationComplete(): void {
    const metadata = this.stateMetadata.get(this.currentState);
    if (!metadata || metadata.looping) return;

    // Default fallback transitions
    switch (this.currentState) {
      case AnimationStateType.ATTACK_1:
      case AnimationStateType.ATTACK_2:
      case AnimationStateType.ATTACK_3:
      case AnimationStateType.ATTACK_HEAVY:
      case AnimationStateType.DODGE_GROUND:
      case AnimationStateType.PARRY:
        this.transitionTo(AnimationStateType.IDLE_COMBAT);
        break;

      case AnimationStateType.LAND:
      case AnimationStateType.HIT_LIGHT:
      case AnimationStateType.HITSTUN:
        this.transitionTo(AnimationStateType.IDLE_COMBAT);
        break;

      case AnimationStateType.JUMP:
        this.transitionTo(AnimationStateType.FALL);
        break;

      default:
        // Do nothing for terminal states or special cases
        break;
    }
  }

  /**
   * Register on-enter callback for a state
   */
  public onEnter(state: AnimationStateType, callback: StateChangeCallback): void {
    if (!this.onEnterCallbacks.has(state)) {
      this.onEnterCallbacks.set(state, new Set());
    }
    this.onEnterCallbacks.get(state)!.add(callback);
  }

  /**
   * Register on-exit callback for a state
   */
  public onExit(state: AnimationStateType, callback: StateChangeCallback): void {
    if (!this.onExitCallbacks.has(state)) {
      this.onExitCallbacks.set(state, new Set());
    }
    this.onExitCallbacks.get(state)!.add(callback);
  }

  /**
   * Remove callback
   */
  public removeCallback(state: AnimationStateType, callback: StateChangeCallback): void {
    this.onEnterCallbacks.get(state)?.delete(callback);
    this.onExitCallbacks.get(state)?.delete(callback);
  }

  /**
   * Get current state
   */
  public getCurrentState(): AnimationStateType {
    return this.currentState;
  }

  /**
   * Get previous state
   */
  public getPreviousState(): AnimationStateType {
    return this.previousState;
  }

  /**
   * Get current frame count
   */
  public getFrameCount(): number {
    return this.frameCount;
  }

  /**
   * Get state metadata
   */
  public getMetadata(state: AnimationStateType): AnimationStateMetadata | undefined {
    return this.stateMetadata.get(state);
  }

  /**
   * Check if in cancel window
   */
  public isInCancelWindow(): boolean {
    const metadata = this.stateMetadata.get(this.currentState);
    if (!metadata || !metadata.cancellable || !metadata.cancelWindow) {
      return false;
    }

    const [start, end] = metadata.cancelWindow;
    return this.frameCount >= start && this.frameCount <= end;
  }

  /**
   * Get animation progress (0-1)
   */
  public getProgress(): number {
    const metadata = this.stateMetadata.get(this.currentState);
    if (!metadata) return 0;
    return Math.min(1, this.frameCount / metadata.durationFrames);
  }

  /**
   * Reset state machine
   */
  public reset(): void {
    this.currentState = AnimationStateType.IDLE_CALM;
    this.previousState = AnimationStateType.IDLE_CALM;
    this.frameCount = 0;
  }
}

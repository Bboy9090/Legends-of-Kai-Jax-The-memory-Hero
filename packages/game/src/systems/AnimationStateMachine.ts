// Animation State Machine
// Path: packages/game/src/systems/AnimationStateMachine.ts

import * as THREE from 'three';
import { EventBus } from '@game/core/EventBus';

type AnimationState = 
  | 'idle'
  | 'walk'
  | 'run'
  | 'jump'
  | 'fall'
  | 'land'
  | 'attack_light'
  | 'attack_heavy'
  | 'hit_light'
  | 'hit_heavy'
  | 'hitstun'
  | 'victory'
  | 'defeat';

interface AnimationData {
  name: string;
  duration: number; // In frames at 60fps
  looping: boolean;
  blendDuration: number; // Transition time to this animation
  speed: number; // Playback speed multiplier
}

interface StateTransition {
  from: AnimationState;
  to: AnimationState;
  condition: () => boolean;
  priority: number; // Higher = checked first
}

/**
 * Character animation state machine
 * Manages animation blending, transitions, and synchronization with gameplay
 */
export class AnimationStateMachine {
  private character: THREE.Group;
  private mixer: THREE.AnimationMixer;
  private animations: Map<AnimationState, AnimationData>;
  private currentState: AnimationState = 'idle';
  private currentAction: THREE.AnimationAction | null = null;
  private nextAction: THREE.AnimationAction | null = null;
  private stateTransitions: StateTransition[] = [];
  private eventBus: EventBus;
  private frameCount = 0;
  private physicsState: any = {};

  // Animation clip mapping (would be loaded from GLB files)
  private animationClips: Map<AnimationState, THREE.AnimationClip> = new Map();

  constructor(character: THREE.Group, mixer: THREE.AnimationMixer, eventBus: EventBus) {
    this.character = character;
    this.mixer = mixer;
    this.eventBus = eventBus;

    // Default animation definitions
    this.animations = new Map([
      ['idle', { name: 'Idle', duration: 120, looping: true, blendDuration: 0.2, speed: 1 }],
      ['walk', { name: 'Walk', duration: 30, looping: true, blendDuration: 0.15, speed: 1 }],
      ['run', { name: 'Run', duration: 24, looping: true, blendDuration: 0.15, speed: 1 }],
      ['jump', { name: 'Jump', duration: 45, looping: false, blendDuration: 0.1, speed: 1 }],
      ['fall', { name: 'Fall', duration: 60, looping: true, blendDuration: 0.1, speed: 1 }],
      ['land', { name: 'Land', duration: 15, looping: false, blendDuration: 0.1, speed: 1 }],
      ['attack_light', { name: 'AttackLight', duration: 18, looping: false, blendDuration: 0.05, speed: 1 }],
      ['attack_heavy', { name: 'AttackHeavy', duration: 36, looping: false, blendDuration: 0.05, speed: 1 }],
      ['hit_light', { name: 'HitLight', duration: 12, looping: false, blendDuration: 0.05, speed: 1 }],
      ['hit_heavy', { name: 'HitHeavy', duration: 24, looping: false, blendDuration: 0.05, speed: 1 }],
      ['hitstun', { name: 'HitStun', duration: 30, looping: true, blendDuration: 0.1, speed: 0.5 }],
      ['victory', { name: 'Victory', duration: 180, looping: false, blendDuration: 0.3, speed: 1 }],
      ['defeat', { name: 'Defeat', duration: 120, looping: false, blendDuration: 0.3, speed: 1 }],
    ]);

    this.setupStateTransitions();
    this.setupEventListeners();
  }

  /**
   * Setup animation state transitions with priorities
   */
  private setupStateTransitions(): void {
    // High priority: Interruptible animations
    this.addTransition('idle', 'walk', () => this.physicsState.moveInput !== 0 && !this.physicsState.isRunning, 100);
    this.addTransition('idle', 'run', () => this.physicsState.moveInput !== 0 && this.physicsState.isRunning, 99);
    this.addTransition('idle', 'jump', () => this.physicsState.isJumping, 98);
    this.addTransition('idle', 'attack_light', () => this.physicsState.attackPressed, 97);
    
    // Walk transitions
    this.addTransition('walk', 'idle', () => this.physicsState.moveInput === 0, 100);
    this.addTransition('walk', 'run', () => this.physicsState.isRunning, 99);
    this.addTransition('walk', 'jump', () => this.physicsState.isJumping, 98);

    // Run transitions
    this.addTransition('run', 'idle', () => this.physicsState.moveInput === 0, 100);
    this.addTransition('run', 'walk', () => this.physicsState.moveInput !== 0 && !this.physicsState.isRunning, 99);
    this.addTransition('run', 'jump', () => this.physicsState.isJumping, 98);

    // Jump transitions
    this.addTransition('jump', 'fall', () => this.physicsState.velocity.y < 0 && !this.physicsState.isGrounded, 100);
    this.addTransition('jump', 'idle', () => this.physicsState.isGrounded && this.physicsState.moveInput === 0, 99);

    // Fall transitions
    this.addTransition('fall', 'land', () => this.physicsState.isGrounded, 100);
    this.addTransition('fall', 'idle', () => this.physicsState.isGrounded && this.physicsState.moveInput === 0, 99);

    // Land transition (auto-return)
    this.addTransition('land', 'idle', () => this.frameCount > (this.animations.get('land')?.duration || 15), 100);

    // Hit stun transitions
    this.addTransition('hitstun', 'idle', () => this.frameCount > (this.animations.get('hitstun')?.duration || 30), 100);

    // Attack light (can chain to another light attack)
    this.addTransition('attack_light', 'attack_light', () => this.physicsState.attackPressed, 98);
    this.addTransition('attack_light', 'idle', () => true, 1); // Default fallback

    // Attack heavy (can't be interrupted until recovery frames)
    this.addTransition('attack_heavy', 'idle', () => true, 1); // Default fallback

    // Victory/Defeat (terminal states)
    // These don't transition - match ends
  }

  /**
   * Add a state transition rule
   */
  private addTransition(
    from: AnimationState,
    to: AnimationState,
    condition: () => boolean,
    priority: number
  ): void {
    this.stateTransitions.push({
      from,
      to,
      condition,
      priority,
    });
  }

  /**
   * Setup event listeners for external triggers
   */
  private setupEventListeners(): void {
    this.eventBus.subscribe('character:hit', (data: any) => {
      if (data.defenderId === this.character.name) {
        this.transitionTo(data.damage > 25 ? 'hit_heavy' : 'hit_light');
      }
    });

    this.eventBus.subscribe('attack:triggered', (data: any) => {
      if (data.characterId === this.character.name) {
        this.transitionTo(data.heavy ? 'attack_heavy' : 'attack_light');
      }
    });

    this.eventBus.subscribe('match:victory', (data: any) => {
      if (data.winnerId === this.character.name) {
        this.transitionTo('victory');
      }
    });

    this.eventBus.subscribe('match:defeat', (data: any) => {
      if (data.loserId === this.character.name) {
        this.transitionTo('defeat');
      }
    });
  }

  /**
   * Update physics state from character controller
   */
  public updatePhysicsState(state: any): void {
    this.physicsState = state;
  }

  /**
   * Force transition to a specific animation state
   */
  public transitionTo(state: AnimationState): void {
    if (state === this.currentState) return;

    const animData = this.animations.get(state);
    if (!animData) {
      console.warn(`[AnimationSM] Unknown animation state: ${state}`);
      return;
    }

    // Get or create animation clip
    let clip = this.animationClips.get(state);
    if (!clip) {
      // Placeholder: In real implementation, load from GLB
      clip = new THREE.AnimationClip(animData.name, animData.duration / 60, []);
      this.animationClips.set(state, clip);
    }

    // Create new action
    const action = this.mixer.clipAction(clip);
    action.clampWhenFinished = !animData.looping;
    action.loop = animData.looping ? THREE.LoopRepeat : THREE.LoopOnce;
    action.timeScale = animData.speed;

    // Blend transition
    if (this.currentAction) {
      this.currentAction.fadeOut(animData.blendDuration);
    }
    action.reset();
    action.fadeIn(animData.blendDuration);
    action.play();

    // Update state
    this.currentAction = action;
    this.currentState = state;
    this.frameCount = 0;

    this.eventBus.emit('animation:state_changed', {
      characterId: this.character.name,
      state,
      duration: animData.duration,
    });
  }

  /**
   * Update the state machine (check transitions)
   */
  public update(deltaTime: number): void {
    this.frameCount++;
    this.mixer.update(deltaTime);

    // Sort transitions by priority and check conditions
    const applicableTransitions = this.stateTransitions
      .filter((t) => t.from === this.currentState && t.condition())
      .sort((a, b) => b.priority - a.priority);

    // Apply highest priority transition
    if (applicableTransitions.length > 0) {
      this.transitionTo(applicableTransitions[0].to);
    }
  }

  /**
   * Get current animation state
   */
  public getState(): AnimationState {
    return this.currentState;
  }

  /**
   * Check if current animation is finished
   */
  public isAnimationFinished(): boolean {
    if (!this.currentAction) return true;
    
    const animData = this.animations.get(this.currentState);
    return animData && !animData.looping && this.frameCount >= animData.duration;
  }

  /**
   * Get animation progress (0-1)
   */
  public getAnimationProgress(): number {
    const animData = this.animations.get(this.currentState);
    if (!animData) return 0;
    return Math.min(1, this.frameCount / animData.duration);
  }

  /**
   * Reset all animations (for match restart)
   */
  public reset(): void {
    this.mixer.stopAllAction();
    this.currentState = 'idle';
    this.currentAction = null;
    this.frameCount = 0;
    this.transitionTo('idle');
  }
}

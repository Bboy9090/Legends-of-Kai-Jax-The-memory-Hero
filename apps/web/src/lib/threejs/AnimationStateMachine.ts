/**
 * ULTIMATE ENTERTAINMENT ENTERPRISES PRESENTS
 * ANIMATION STATE MACHINE FOR THREE.JS
 * Real animation state machine for combat characters
 */

import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

export type AnimationState = 
  | 'idle'
  | 'walk'
  | 'run'
  | 'punch'
  | 'kick'
  | 'kickHeavy'
  | 'special'
  | 'jump'
  | 'jumpLand'
  | 'hit'
  | 'block'
  | 'dodge'
  | 'victory'
  | 'defeat'
  | 'taunt';

export interface AnimationTransition {
  from: AnimationState;
  to: AnimationState;
  condition: () => boolean;
  fadeTime?: number;
}

export class AnimationStateMachine {
  private mixer: THREE.AnimationMixer;
  private actions: Map<string, THREE.AnimationAction>;
  private currentState: AnimationState = 'idle';
  private previousState: AnimationState = 'idle';
  private transitions: AnimationTransition[] = [];
  private currentAction: THREE.AnimationAction | null = null;

  constructor(mixer: THREE.AnimationMixer, animations: THREE.AnimationClip[]) {
    this.mixer = mixer;
    this.actions = new Map();
    
    // Create actions for all animations
    animations.forEach((clip) => {
      const action = mixer.clipAction(clip);
      action.setLoop(THREE.LoopRepeat, 1);
      this.actions.set(clip.name, action);
    });
  }

  /**
   * Add transition rule
   */
  addTransition(transition: AnimationTransition) {
    this.transitions.push(transition);
  }

  /**
   * Set animation state - REAL IMPLEMENTATION
   */
  setState(newState: AnimationState, force: boolean = false) {
    if (newState === this.currentState && !force) return;

    const action = this.actions.get(newState);
    if (!action) {
      console.warn(`Animation state "${newState}" not found`);
      return;
    }

    // Cross-fade from previous to new
    if (this.currentAction) {
      const fadeTime = 0.2; // Default fade time
      this.currentAction.fadeOut(fadeTime);
      action.reset().fadeIn(fadeTime).play();
    } else {
      action.reset().play();
    }

    this.previousState = this.currentState;
    this.currentState = newState;
    this.currentAction = action;
  }

  /**
   * Update state machine - check transitions
   */
  update(delta: number) {
    this.mixer.update(delta);

    // Check transitions
    for (const transition of this.transitions) {
      if (transition.from === this.currentState && transition.condition()) {
        this.setState(transition.to);
        break;
      }
    }
  }

  /**
   * Play one-shot animation (like attack)
   */
  playOnce(state: AnimationState, onComplete?: () => void) {
    const action = this.actions.get(state);
    if (!action) return;

    action.setLoop(THREE.LoopOnce, 1);
    action.reset().play();

    if (onComplete) {
      const handleComplete = (e: any) => {
        if (e.action === action) {
          onComplete();
          this.mixer.removeEventListener('finished', handleComplete);
          this.setState('idle');
        }
      };
      this.mixer.addEventListener('finished', handleComplete);
    }

    this.currentAction = action;
  }

  /**
   * Get current state
   */
  getCurrentState(): AnimationState {
    return this.currentState;
  }

  /**
   * Stop all animations
   */
  stopAll() {
    this.actions.forEach((action) => {
      action.stop();
    });
    this.currentAction = null;
  }
}

/**
 * React hook for animation state machine - REAL IMPLEMENTATION
 */
export function useAnimationStateMachine(
  mixer: THREE.AnimationMixer | null,
  animations: THREE.AnimationClip[],
  initialState: AnimationState = 'idle'
) {
  const [currentState, setCurrentState] = useState<AnimationState>(initialState);
  const stateMachineRef = useRef<AnimationStateMachine | null>(null);

  useEffect(() => {
    if (!mixer || animations.length === 0) {
      stateMachineRef.current = null;
      return;
    }

    // REAL IMPLEMENTATION - Create state machine
    const sm = new AnimationStateMachine(mixer, animations);
    sm.setState(initialState);
    stateMachineRef.current = sm;

    return () => {
      sm.stopAll();
    };
  }, [mixer, animations, initialState]);

  // Update state machine every frame (via useFrame in component)
  const setState = (state: AnimationState) => {
    if (stateMachineRef.current) {
      stateMachineRef.current.setState(state);
      setCurrentState(state);
    }
  };

  const playOnce = (state: AnimationState, onComplete?: () => void) => {
    if (stateMachineRef.current) {
      stateMachineRef.current.playOnce(state, onComplete);
      setCurrentState(state);
    }
  };

  return {
    stateMachine: stateMachineRef.current,
    currentState,
    setState,
    playOnce,
  };
}

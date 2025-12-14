import { FighterState } from '@smash-heroes/shared';

export interface StateTransition {
  from: FighterState;
  to: FighterState;
  condition: () => boolean;
  priority: number;
}

export class StateMachine {
  private currentState: FighterState;
  private previousState: FighterState | null = null;
  private transitions: StateTransition[] = [];
  private stateEnterCallbacks: Map<FighterState, () => void> = new Map();
  private stateExitCallbacks: Map<FighterState, () => void> = new Map();
  private stateUpdateCallbacks: Map<FighterState, (deltaTime: number) => void> = new Map();

  constructor(initialState: FighterState) {
    this.currentState = initialState;
  }

  addTransition(transition: StateTransition): void {
    this.transitions.push(transition);
    // Sort by priority (higher first)
    this.transitions.sort((a, b) => b.priority - a.priority);
  }

  onEnter(state: FighterState, callback: () => void): void {
    this.stateEnterCallbacks.set(state, callback);
  }

  onExit(state: FighterState, callback: () => void): void {
    this.stateExitCallbacks.set(state, callback);
  }

  onUpdate(state: FighterState, callback: (deltaTime: number) => void): void {
    this.stateUpdateCallbacks.set(state, callback);
  }

  update(deltaTime: number): void {
    // Check for valid transitions
    for (const transition of this.transitions) {
      if (transition.from === this.currentState && transition.condition()) {
        this.changeState(transition.to);
        break;
      }
    }

    // Update current state
    const updateCallback = this.stateUpdateCallbacks.get(this.currentState);
    if (updateCallback) {
      updateCallback(deltaTime);
    }
  }

  changeState(newState: FighterState): void {
    if (this.currentState === newState) return;

    // Exit current state
    const exitCallback = this.stateExitCallbacks.get(this.currentState);
    if (exitCallback) {
      exitCallback();
    }

    this.previousState = this.currentState;
    this.currentState = newState;

    // Enter new state
    const enterCallback = this.stateEnterCallbacks.get(newState);
    if (enterCallback) {
      enterCallback();
    }
  }

  forceState(state: FighterState): void {
    this.changeState(state);
  }

  getCurrentState(): FighterState {
    return this.currentState;
  }

  getPreviousState(): FighterState | null {
    return this.previousState;
  }

  isInState(state: FighterState): boolean {
    return this.currentState === state;
  }

  isInStates(states: FighterState[]): boolean {
    return states.includes(this.currentState);
  }
}

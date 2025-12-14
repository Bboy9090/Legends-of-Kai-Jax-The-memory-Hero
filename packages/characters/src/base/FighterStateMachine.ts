import { FighterState } from '@smash-heroes/shared';
import { StateMachine, StateTransition } from '@smash-heroes/engine';

export class FighterStateMachineBuilder {
  private stateMachine: StateMachine;

  constructor(initialState: FighterState = FighterState.IDLE) {
    this.stateMachine = new StateMachine(initialState);
    this.setupDefaultTransitions();
  }

  private setupDefaultTransitions(): void {
    // Any state can transition to hitstun/knockback
    Object.values(FighterState).forEach((state) => {
      this.addTransition({
        from: state,
        to: FighterState.HITSTUN,
        condition: () => false, // Will be set by combat system
        priority: 100,
      });

      this.addTransition({
        from: state,
        to: FighterState.KNOCKBACK,
        condition: () => false,
        priority: 100,
      });
    });

    // Landing transitions
    [FighterState.JUMPING, FighterState.FALLING, FighterState.AIR_DODGE].forEach((state) => {
      this.addTransition({
        from: state,
        to: FighterState.LANDING,
        condition: () => false, // Set when grounded
        priority: 50,
      });
    });

    // Falling after jump
    this.addTransition({
      from: FighterState.JUMPING,
      to: FighterState.FALLING,
      condition: () => false, // Set when velocity.y > 0
      priority: 40,
    });
  }

  addTransition(transition: StateTransition): this {
    this.stateMachine.addTransition(transition);
    return this;
  }

  onEnter(state: FighterState, callback: () => void): this {
    this.stateMachine.onEnter(state, callback);
    return this;
  }

  onExit(state: FighterState, callback: () => void): this {
    this.stateMachine.onExit(state, callback);
    return this;
  }

  onUpdate(state: FighterState, callback: (deltaTime: number) => void): this {
    this.stateMachine.onUpdate(state, callback);
    return this;
  }

  build(): StateMachine {
    return this.stateMachine;
  }
}

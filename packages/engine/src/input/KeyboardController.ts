import { InputAction, KeyboardState, InputState } from '@smash-heroes/shared';

export class KeyboardController {
  private state: KeyboardState = {
    keys: new Map(),
    modifiers: {
      shift: false,
      ctrl: false,
      alt: false,
      meta: false,
    },
  };

  private keyBindings: Map<string, InputAction> = new Map();
  private listeners: Array<(input: InputState) => void> = [];

  constructor() {
    this.setupDefaultBindings();
    this.attachListeners();
  }

  private setupDefaultBindings(): void {
    // WASD movement
    this.keyBindings.set('KeyW', InputAction.MOVE_UP);
    this.keyBindings.set('KeyA', InputAction.MOVE_LEFT);
    this.keyBindings.set('KeyS', InputAction.MOVE_DOWN);
    this.keyBindings.set('KeyD', InputAction.MOVE_RIGHT);

    // Arrow keys movement
    this.keyBindings.set('ArrowUp', InputAction.MOVE_UP);
    this.keyBindings.set('ArrowLeft', InputAction.MOVE_LEFT);
    this.keyBindings.set('ArrowDown', InputAction.MOVE_DOWN);
    this.keyBindings.set('ArrowRight', InputAction.MOVE_RIGHT);

    // Actions
    this.keyBindings.set('Space', InputAction.JUMP);
    this.keyBindings.set('KeyJ', InputAction.LIGHT_ATTACK);
    this.keyBindings.set('KeyK', InputAction.HEAVY_ATTACK);
    this.keyBindings.set('KeyL', InputAction.SPECIAL);
    this.keyBindings.set('KeyU', InputAction.GRAB);
    this.keyBindings.set('ShiftLeft', InputAction.DASH);
    this.keyBindings.set('ShiftRight', InputAction.DASH);
    
    // Defensive
    this.keyBindings.set('KeyI', InputAction.BLOCK);
    this.keyBindings.set('KeyO', InputAction.DODGE);
    
    // Special
    this.keyBindings.set('KeyP', InputAction.ULTIMATE);
    this.keyBindings.set('Escape', InputAction.PAUSE);
  }

  private attachListeners(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    // Update modifiers
    this.state.modifiers.shift = event.shiftKey;
    this.state.modifiers.ctrl = event.ctrlKey;
    this.state.modifiers.alt = event.altKey;
    this.state.modifiers.meta = event.metaKey;

    // Skip if key is already pressed (repeat)
    if (this.state.keys.get(event.code)) return;

    this.state.keys.set(event.code, true);

    // Get mapped action
    const action = this.keyBindings.get(event.code);
    if (action) {
      const inputState: InputState = {
        action,
        pressed: true,
        held: false,
        released: false,
        timestamp: performance.now(),
        duration: 0,
      };

      this.notifyListeners(inputState);
    }
  };

  private handleKeyUp = (event: KeyboardEvent): void => {
    // Update modifiers
    this.state.modifiers.shift = event.shiftKey;
    this.state.modifiers.ctrl = event.ctrlKey;
    this.state.modifiers.alt = event.altKey;
    this.state.modifiers.meta = event.metaKey;

    this.state.keys.set(event.code, false);

    // Get mapped action
    const action = this.keyBindings.get(event.code);
    if (action) {
      const inputState: InputState = {
        action,
        pressed: false,
        held: false,
        released: true,
        timestamp: performance.now(),
        duration: 0,
      };

      this.notifyListeners(inputState);
    }
  };

  isKeyPressed(code: string): boolean {
    return this.state.keys.get(code) ?? false;
  }

  isActionPressed(action: InputAction): boolean {
    for (const [code, mappedAction] of this.keyBindings) {
      if (mappedAction === action && this.isKeyPressed(code)) {
        return true;
      }
    }
    return false;
  }

  setBinding(code: string, action: InputAction): void {
    this.keyBindings.set(code, action);
  }

  removeBinding(code: string): void {
    this.keyBindings.delete(code);
  }

  getBindings(): ReadonlyMap<string, InputAction> {
    return this.keyBindings;
  }

  addListener(callback: (input: InputState) => void): void {
    this.listeners.push(callback);
  }

  removeListener(callback: (input: InputState) => void): void {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  private notifyListeners(input: InputState): void {
    this.listeners.forEach((listener) => listener(input));
  }

  destroy(): void {
    if (typeof window === 'undefined') return;
    
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    this.listeners = [];
  }
}

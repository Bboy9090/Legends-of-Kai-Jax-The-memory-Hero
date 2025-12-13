import { GamepadState, InputAction, InputState } from '@smash-heroes/shared';

export class GamepadController {
  private state: GamepadState = {
    connected: false,
    buttons: new Map(),
    axes: [],
    deadzone: 0.15,
  };

  private buttonBindings: Map<number, InputAction> = new Map();
  private listeners: Array<(input: InputState) => void> = [];
  private gamepadIndex: number | null = null;

  constructor() {
    this.setupDefaultBindings();
    this.attachListeners();
  }

  private setupDefaultBindings(): void {
    // Standard gamepad mapping (Xbox/PlayStation style)
    this.buttonBindings.set(0, InputAction.LIGHT_ATTACK); // A/X
    this.buttonBindings.set(1, InputAction.SPECIAL); // B/Circle
    this.buttonBindings.set(2, InputAction.JUMP); // X/Square
    this.buttonBindings.set(3, InputAction.HEAVY_ATTACK); // Y/Triangle
    this.buttonBindings.set(4, InputAction.BLOCK); // LB/L1
    this.buttonBindings.set(5, InputAction.GRAB); // RB/R1
    this.buttonBindings.set(6, InputAction.DODGE); // LT/L2
    this.buttonBindings.set(7, InputAction.ULTIMATE); // RT/R2
    this.buttonBindings.set(9, InputAction.PAUSE); // Start
  }

  private attachListeners(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('gamepadconnected', this.handleConnect);
    window.addEventListener('gamepaddisconnected', this.handleDisconnect);
  }

  private handleConnect = (event: GamepadEvent): void => {
    this.gamepadIndex = event.gamepad.index;
    this.state.connected = true;
    console.log(`Gamepad connected: ${event.gamepad.id}`);
  };

  private handleDisconnect = (event: GamepadEvent): void => {
    if (this.gamepadIndex === event.gamepad.index) {
      this.gamepadIndex = null;
      this.state.connected = false;
      console.log('Gamepad disconnected');
    }
  };

  update(): void {
    if (!this.state.connected || this.gamepadIndex === null) return;

    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[this.gamepadIndex];

    if (!gamepad) return;

    // Update buttons
    gamepad.buttons.forEach((button, index) => {
      const wasPressed = this.state.buttons.get(index) ?? false;
      const isPressed = button.pressed;

      this.state.buttons.set(index, isPressed);

      const action = this.buttonBindings.get(index);

      // Emit events on state change
      if (action && isPressed !== wasPressed) {
        const inputState: InputState = {
          action,
          pressed: isPressed && !wasPressed,
          held: false,
          released: !isPressed && wasPressed,
          timestamp: performance.now(),
          duration: 0,
        };

        this.notifyListeners(inputState);
      }
    });

    // Update axes
    this.state.axes = Array.from(gamepad.axes);
  }

  getAxisValue(axisIndex: number): number {
    const value = this.state.axes[axisIndex] ?? 0;
    return Math.abs(value) < this.state.deadzone ? 0 : value;
  }

  getLeftStick(): { x: number; y: number } {
    return {
      x: this.getAxisValue(0),
      y: this.getAxisValue(1),
    };
  }

  getRightStick(): { x: number; y: number } {
    return {
      x: this.getAxisValue(2),
      y: this.getAxisValue(3),
    };
  }

  isButtonPressed(button: number): boolean {
    return this.state.buttons.get(button) ?? false;
  }

  addListener(callback: (input: InputState) => void): void {
    this.listeners.push(callback);
  }

  private notifyListeners(input: InputState): void {
    this.listeners.forEach((listener) => listener(input));
  }

  destroy(): void {
    if (typeof window === 'undefined') return;
    
    window.removeEventListener('gamepadconnected', this.handleConnect);
    window.removeEventListener('gamepaddisconnected', this.handleDisconnect);
    this.listeners = [];
  }
}

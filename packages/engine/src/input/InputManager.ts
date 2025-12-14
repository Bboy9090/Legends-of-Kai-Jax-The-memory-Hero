import { InputType, InputAction, InputState } from '@smash-heroes/shared';
import { KeyboardController } from './KeyboardController';
import { GamepadController } from './GamepadController';
import { TouchController } from './TouchController';
import { InputBuffer } from './InputBuffer';

export class InputManager {
  private keyboardController: KeyboardController;
  private gamepadController: GamepadController;
  private touchController: TouchController | null = null;
  private inputBuffer: InputBuffer;
  private currentInputs: Map<InputAction, boolean> = new Map();

  constructor(touchElement?: HTMLElement) {
    this.keyboardController = new KeyboardController();
    this.gamepadController = new GamepadController();
    this.inputBuffer = new InputBuffer(6);

    if (touchElement) {
      this.touchController = new TouchController(touchElement);
    }

    this.setupListeners();
  }

  private setupListeners(): void {
    this.keyboardController.addListener(this.handleInput);
    this.gamepadController.addListener(this.handleInput);
    this.touchController?.addListener(this.handleInput);
  }

  private handleInput = (input: InputState): void => {
    this.inputBuffer.addInput(input);
    this.currentInputs.set(input.action, input.pressed || input.held);
  };

  update(): void {
    // Update gamepad state (needs polling)
    this.gamepadController.update();
  }

  isActionPressed(action: InputAction): boolean {
    return (
      this.keyboardController.isActionPressed(action) ||
      this.currentInputs.get(action) ||
      false
    );
  }

  isActionJustPressed(action: InputAction, withinFrames = 1): boolean {
    return this.inputBuffer.hasInput(action, withinFrames);
  }

  getMovementVector(): { x: number; y: number } {
    let x = 0;
    let y = 0;

    // Keyboard
    if (this.isActionPressed(InputAction.MOVE_LEFT)) x -= 1;
    if (this.isActionPressed(InputAction.MOVE_RIGHT)) x += 1;
    if (this.isActionPressed(InputAction.MOVE_UP)) y -= 1;
    if (this.isActionPressed(InputAction.MOVE_DOWN)) y += 1;

    // Gamepad left stick
    const leftStick = this.gamepadController.getLeftStick();
    x += leftStick.x;
    y += leftStick.y;

    // Normalize if diagonal
    if (x !== 0 && y !== 0) {
      const length = Math.sqrt(x * x + y * y);
      x /= length;
      y /= length;
    }

    return { x, y };
  }

  getInputBuffer(): InputBuffer {
    return this.inputBuffer;
  }

  clearBuffer(): void {
    this.inputBuffer.clear();
  }

  destroy(): void {
    this.keyboardController.destroy();
    this.gamepadController.destroy();
    this.touchController?.destroy();
  }
}

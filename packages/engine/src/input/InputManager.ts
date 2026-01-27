import { InputType, InputAction, InputState, InputConfig } from '@beast-kin/shared';
import { KeyboardController } from './KeyboardController';
import { GamepadController } from './GamepadController';
import { TouchController } from './TouchController';
import { InputBuffer } from './InputBuffer';
import { MobileInputHandler } from './MobileInputHandler';

/**
 * Production-grade Input Manager
 * 
 * Unified input handling across all platforms following governance:
 * - Single gameplay core across PC, mobile, tablet
 * - Platform adapters handle ONLY input translation
 * - No platform-specific logic divergence in combat mechanics
 * 
 * Features:
 * - Keyboard (WASD, Space, Shift, Click)
 * - Gamepad (dual-stick, shoulder buttons, triggers)
 * - Touch (swipe, pinch, tap on mobile)
 * - Returns unified InputState regardless of device
 * - Multi-platform graceful handling (no crashes on unsupported devices)
 * - On-demand input checks (no polling spam)
 * - Configuration-driven keybindings (config/input-keybinds.json)
 */
export class InputManager {
  private keyboardController: KeyboardController;
  private gamepadController: GamepadController;
  private touchController: TouchController | null = null;
  private mobileInputHandler: MobileInputHandler | null = null;
  private inputBuffer: InputBuffer;
  private currentInputs: Map<InputAction, boolean> = new Map();
  private config: Partial<InputConfig>;
  private deadzone: number;

  constructor(touchElement?: HTMLElement, config?: Partial<InputConfig>) {
    this.config = config || {};
    this.deadzone = this.config.deadzone || 0.15;

    this.keyboardController = new KeyboardController();
    this.gamepadController = new GamepadController();
    this.inputBuffer = new InputBuffer(this.config.inputBufferSize || 6);

    // Setup touch input if element provided
    if (touchElement) {
      this.touchController = new TouchController(touchElement);
      
      // Also setup mobile-specific gesture handler
      this.mobileInputHandler = new MobileInputHandler(touchElement, {
        swipeThreshold: 50,
        swipeVelocityThreshold: 0.3,
        longPressDelay: 500,
        doubleTapDelay: 300,
        pinchThreshold: 10,
      });
    }

    this.setupListeners();
  }

  private setupListeners(): void {
    this.keyboardController.addListener(this.handleInput);
    this.gamepadController.addListener(this.handleInput);
    this.touchController?.addListener(this.handleInput);
    this.mobileInputHandler?.addListener(this.handleInput);
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

    // Gamepad left stick (with configurable deadzone)
    const leftStick = this.gamepadController.getLeftStick();
    if (Math.abs(leftStick.x) > this.deadzone) {
      x += leftStick.x;
    }
    if (Math.abs(leftStick.y) > this.deadzone) {
      y += leftStick.y;
    }

    // Normalize if diagonal
    const magnitude = Math.sqrt(x * x + y * y);
    if (magnitude > 1) {
      x /= magnitude;
      y /= magnitude;
    }

    return { x, y };
  }

  getInputBuffer(): InputBuffer {
    return this.inputBuffer;
  }

  clearBuffer(): void {
    this.inputBuffer.clear();
  }

  /**
   * Get mobile input handler for haptic feedback and gesture control
   */
  getMobileInputHandler(): MobileInputHandler | null {
    return this.mobileInputHandler;
  }

  /**
   * Update configuration at runtime
   */
  updateConfig(config: Partial<InputConfig>): void {
    this.config = { ...this.config, ...config };
    if (config.deadzone !== undefined) {
      this.deadzone = config.deadzone;
    }
    if (config.inputBufferSize !== undefined) {
      this.inputBuffer = new InputBuffer(config.inputBufferSize);
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): Partial<InputConfig> {
    return { ...this.config };
  }

  destroy(): void {
    this.keyboardController.destroy();
    this.gamepadController.destroy();
    this.touchController?.destroy();
    this.mobileInputHandler?.destroy();
  }
}

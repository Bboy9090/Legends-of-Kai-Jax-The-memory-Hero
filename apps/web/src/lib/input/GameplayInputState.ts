/**
 * UNIFIED GAMEPLAY INPUT STATE
 * Combines keyboard, touch, and controller inputs into a single interface
 *
 * Supports:
 * - Keyboard (WASD, arrows, space, shift, J/K/L for attacks)
 * - Touch (virtual joystick + attack buttons)
 * - Gamepad (D-pad/stick for movement, buttons for attacks)
 */

export interface GameplayInputState {
  // Movement (range: -1 to 1)
  moveX: number;
  moveY: number;
  isRunning: boolean;

  // Combat actions (true on the frame they're pressed)
  attackLight: boolean;
  attackHeavy: boolean;
  attackSpecial: boolean;
  attackUltimate: boolean;
  dodge: boolean;

  // Interaction
  interact: boolean;

  // UI
  pause: boolean;
  menu: boolean;
}

/**
 * Keyboard input handler
 */
class KeyboardInputHandler {
  private keys: Record<string, boolean> = {};

  constructor() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  }

  getState(): Partial<GameplayInputState> {
    let moveX = 0;
    let moveY = 0;

    if (this.keys['KeyW'] || this.keys['ArrowUp']) moveY -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) moveY += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveX -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) moveX += 1;

    // Normalize diagonal movement
    const moveLen = Math.hypot(moveX, moveY);
    if (moveLen > 1) {
      moveX /= moveLen;
      moveY /= moveLen;
    }

    return {
      moveX,
      moveY,
      isRunning: this.keys['ShiftLeft'] || this.keys['ShiftRight'],
      attackLight: this.keys['KeyJ'] || this.keys['KeyX'],
      attackHeavy: this.keys['KeyK'] || this.keys['KeyZ'],
      attackSpecial: this.keys['KeyL'] || this.keys['KeyC'],
      attackUltimate: this.keys['KeyI'] || this.keys['KeyV'],
      dodge: this.keys['Space'],
      interact: this.keys['KeyE'],
      pause: this.keys['Escape'],
      menu: this.keys['Tab'],
    };
  }

  // For detecting press (not held)
  private prevKeys: Record<string, boolean> = {};

  wasPressed(code: string): boolean {
    const isNowPressed = this.keys[code];
    const wasPreviouslyPressed = this.prevKeys[code];
    this.prevKeys[code] = this.keys[code];
    return isNowPressed && !wasPreviouslyPressed;
  }
}

/**
 * Touch input handler (using virtual joystick + buttons)
 */
class TouchInputHandler {
  private joystickX: number = 0;
  private joystickY: number = 0;
  private joystickActive: boolean = false;
  private touchAttackQueue: string[] = [];
  private maxQueueSize: number = 4;

  constructor() {
    // This will be integrated with the useTouchInput store
    // For now, we provide the interface
  }

  updateJoystick(x: number, y: number, active: boolean) {
    this.joystickX = Math.max(-1, Math.min(1, x));
    this.joystickY = Math.max(-1, Math.min(1, y));
    this.joystickActive = active;
  }

  queueAttack(type: 'light' | 'heavy' | 'special' | 'ultimate' | 'dodge') {
    // Prevent duplicate queuing of same attack
    if (this.touchAttackQueue[this.touchAttackQueue.length - 1] === type) return;
    this.touchAttackQueue = [...this.touchAttackQueue, type].slice(-this.maxQueueSize);
  }

  consumeNextAttack(): string | null {
    if (this.touchAttackQueue.length === 0) return null;
    const attack = this.touchAttackQueue.shift();
    return attack || null;
  }

  getState(): Partial<GameplayInputState> {
    const state: Partial<GameplayInputState> = {
      moveX: this.joystickX,
      moveY: this.joystickY,
    };

    // Consume one attack per frame if queued
    const nextAttack = this.consumeNextAttack();
    if (nextAttack) {
      state.attackLight = nextAttack === 'light';
      state.attackHeavy = nextAttack === 'heavy';
      state.attackSpecial = nextAttack === 'special';
      state.attackUltimate = nextAttack === 'ultimate';
      state.dodge = nextAttack === 'dodge';
    }

    return state;
  }
}

/**
 * Gamepad input handler
 */
class GamepadInputHandler {
  private gamepadIndex: number | null = null;

  constructor() {
    window.addEventListener('gamepadconnected', (e) => {
      console.log('Gamepad connected:', e.gamepad.id);
      this.gamepadIndex = e.gamepad.index;
    });
    window.addEventListener('gamepaddisconnected', () => {
      console.log('Gamepad disconnected');
      this.gamepadIndex = null;
    });
  }

  getState(): Partial<GameplayInputState> {
    if (this.gamepadIndex === null) return {};

    const gp = navigator.getGamepads()[this.gamepadIndex];
    if (!gp) return {};

    // Standard mapping:
    // Stick 0: left stick (movement)
    // Stick 1: right stick (camera/aim)
    // Button 0 (A): light attack
    // Button 1 (B): heavy attack
    // Button 2 (X): special attack
    // Button 3 (Y): ultimate/dodge
    // Button 4 (LB): dodge alternative
    // Button 6 (LT): interact
    // Button 9 (Start): pause

    let moveX = gp.axes[0]; // Left stick X
    let moveY = gp.axes[1]; // Left stick Y

    // Apply deadzone
    const deadzone = 0.15;
    if (Math.abs(moveX) < deadzone) moveX = 0;
    if (Math.abs(moveY) < deadzone) moveY = 0;

    return {
      moveX,
      moveY,
      isRunning: gp.buttons[4]?.pressed || false, // LB
      attackLight: gp.buttons[0]?.pressed || false, // A
      attackHeavy: gp.buttons[1]?.pressed || false, // B
      attackSpecial: gp.buttons[2]?.pressed || false, // X
      attackUltimate: gp.buttons[3]?.pressed || false, // Y
      dodge: gp.buttons[4]?.pressed || gp.buttons[0]?.pressed || false,
      interact: gp.buttons[6]?.pressed || false, // LT
      pause: gp.buttons[9]?.pressed || false, // Start
      menu: gp.buttons[8]?.pressed || false, // Select
    };
  }
}

/**
 * Unified input manager that combines all input sources
 * Priority: gamepad > keyboard > touch (highest priority first)
 */
export class GameplayInputManager {
  private keyboardHandler: KeyboardInputHandler;
  private touchHandler: TouchInputHandler;
  private gamepadHandler: GamepadInputHandler;

  constructor() {
    this.keyboardHandler = new KeyboardInputHandler();
    this.touchHandler = new TouchInputHandler();
    this.gamepadHandler = new GamepadInputHandler();
  }

  /**
   * Get the current combined input state
   * Higher priority inputs override lower priority ones
   */
  getState(): GameplayInputState {
    // Start with default state
    const state: GameplayInputState = {
      moveX: 0,
      moveY: 0,
      isRunning: false,
      attackLight: false,
      attackHeavy: false,
      attackSpecial: false,
      attackUltimate: false,
      dodge: false,
      interact: false,
      pause: false,
      menu: false,
    };

    // Apply touch input (lowest priority)
    const touchState = this.touchHandler.getState();
    Object.assign(state, touchState);

    // Apply keyboard input (medium priority - overrides touch)
    const keyboardState = this.keyboardHandler.getState();
    Object.assign(state, keyboardState);

    // Apply gamepad input (highest priority - overrides all)
    const gamepadState = this.gamepadHandler.getState();
    Object.assign(state, gamepadState);

    // Normalize movement vector
    const moveLen = Math.hypot(state.moveX, state.moveY);
    if (moveLen > 1) {
      state.moveX /= moveLen;
      state.moveY /= moveLen;
    }

    return state;
  }

  /**
   * Update touch input from UI elements
   */
  setTouchJoystick(x: number, y: number, active: boolean) {
    this.touchHandler.updateJoystick(x, y, active);
  }

  /**
   * Queue a touch attack action
   */
  queueTouchAttack(type: 'light' | 'heavy' | 'special' | 'ultimate' | 'dodge') {
    this.touchHandler.queueAttack(type);
  }
}

// Export singleton instance
export const gameplayInputManager = new GameplayInputManager();

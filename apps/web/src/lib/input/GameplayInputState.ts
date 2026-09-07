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

  // Camera (range: -1 to 1)
  cameraX: number;
  cameraY: number;

  // Combat actions (true on the frame they're pressed)
  attackLight: boolean;
  attackHeavy: boolean;
  attackSpecial: boolean;
  attackUltimate: boolean;
  dodge: boolean;

  // Traversal
  jump: boolean;
  traversal: boolean;
  traversalModifier: boolean;

  // Fusion (Kai-Jax transformation)
  fusion: boolean;

  // Interaction
  interact: boolean;

  // UI
  pause: boolean;
  menu: boolean;

  // Tracking which device provided input (for UI prompts)
  lastActiveDevice: 'keyboard' | 'gamepad' | 'touch';
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
      cameraX: 0,
      cameraY: 0,
      isRunning: this.keys['ShiftLeft'] || this.keys['ShiftRight'],
      attackLight: this.keys['KeyJ'] || this.keys['KeyX'],
      attackHeavy: this.keys['KeyK'] || this.keys['KeyZ'],
      attackSpecial: this.keys['KeyL'] || this.keys['KeyC'],
      attackUltimate: this.keys['KeyI'] || this.keys['KeyV'],
      dodge: this.keys['Space'],
      jump: this.keys['Space'],
      traversal: this.keys['KeyW'] || this.keys['ArrowUp'],
      traversalModifier: this.keys['ShiftLeft'] || this.keys['ShiftRight'],
      fusion: false,
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
      cameraX: 0,
      cameraY: 0,
      isRunning: false,
      jump: false,
      traversal: false,
      traversalModifier: false,
      fusion: false,
      interact: false,
      pause: false,
      menu: false,
      attackLight: false,
      attackHeavy: false,
      attackSpecial: false,
      attackUltimate: false,
      dodge: false,
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

    // Standard Xbox layout (works on most gamepads):
    // Left Stick: movement
    // Right Stick: camera
    // A (0): jump / traversal context
    // X (2): light attack
    // Y (3): heavy attack
    // B (1): dodge
    // RB (5): signature ability (will use for special)
    // RT (7): charged ability (will use for ultimate)
    // LB (4): run / traversal modifier
    // LT (6): interact / lock-on modifier
    // Start (9): pause
    // Select (8): menu

    let moveX = gp.axes[0]; // Left stick X
    let moveY = gp.axes[1]; // Left stick Y
    let cameraX = gp.axes[2]; // Right stick X
    let cameraY = gp.axes[3]; // Right stick Y

    // Apply deadzone (0.15 = 15% dead zone)
    const deadzone = 0.15;
    if (Math.abs(moveX) < deadzone) moveX = 0;
    if (Math.abs(moveY) < deadzone) moveY = 0;
    if (Math.abs(cameraX) < deadzone) cameraX = 0;
    if (Math.abs(cameraY) < deadzone) cameraY = 0;

    return {
      moveX,
      moveY,
      cameraX,
      cameraY,
      isRunning: gp.buttons[4]?.pressed || false, // LB
      jump: gp.buttons[0]?.pressed || false, // A
      traversal: gp.buttons[0]?.pressed || false, // A (context-sensitive with jump)
      traversalModifier: gp.buttons[4]?.pressed || false, // LB
      attackLight: gp.buttons[2]?.pressed || false, // X
      attackHeavy: gp.buttons[3]?.pressed || false, // Y
      attackSpecial: gp.buttons[5]?.pressed || false, // RB
      attackUltimate: gp.buttons[7]?.pressed || false, // RT (analog trigger, treat as digital)
      dodge: gp.buttons[1]?.pressed || false, // B (dedicated dodge button)
      interact: gp.buttons[6]?.pressed || false, // LT
      fusion: false, // Not yet implemented
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
   * Smart per-action arbitration: analog inputs choose by magnitude, digital inputs OR together
   */
  getState(): GameplayInputState {
    // Start with default state
    const state: GameplayInputState = {
      moveX: 0,
      moveY: 0,
      isRunning: false,
      cameraX: 0,
      cameraY: 0,
      attackLight: false,
      attackHeavy: false,
      attackSpecial: false,
      attackUltimate: false,
      dodge: false,
      jump: false,
      traversal: false,
      traversalModifier: false,
      fusion: false,
      interact: false,
      pause: false,
      menu: false,
      lastActiveDevice: 'keyboard',
    };

    const touchState = this.touchHandler.getState();
    const keyboardState = this.keyboardHandler.getState();
    const gamepadState = this.gamepadHandler.getState();

    // Smart merging: analog inputs by magnitude, digital inputs by OR

    // Movement: choose source with largest magnitude
    const touchMoveLen = Math.hypot(touchState.moveX || 0, touchState.moveY || 0);
    const keyboardMoveLen = Math.hypot(keyboardState.moveX || 0, keyboardState.moveY || 0);
    const gamepadMoveLen = Math.hypot(gamepadState.moveX || 0, gamepadState.moveY || 0);

    const maxMoveLen = Math.max(touchMoveLen, keyboardMoveLen, gamepadMoveLen);
    if (maxMoveLen > 0.1) {
      if (gamepadMoveLen === maxMoveLen) {
        state.moveX = gamepadState.moveX || 0;
        state.moveY = gamepadState.moveY || 0;
        state.lastActiveDevice = 'gamepad';
      } else if (keyboardMoveLen === maxMoveLen) {
        state.moveX = keyboardState.moveX || 0;
        state.moveY = keyboardState.moveY || 0;
        state.lastActiveDevice = 'keyboard';
      } else {
        state.moveX = touchState.moveX || 0;
        state.moveY = touchState.moveY || 0;
        state.lastActiveDevice = 'touch';
      }
    }

    // Camera: choose source with largest magnitude
    const touchCameraLen = Math.hypot(touchState.cameraX || 0, touchState.cameraY || 0);
    const keyboardCameraLen = Math.hypot(keyboardState.cameraX || 0, keyboardState.cameraY || 0);
    const gamepadCameraLen = Math.hypot(gamepadState.cameraX || 0, gamepadState.cameraY || 0);

    const maxCameraLen = Math.max(touchCameraLen, keyboardCameraLen, gamepadCameraLen);
    if (maxCameraLen > 0.1) {
      if (gamepadCameraLen === maxCameraLen) {
        state.cameraX = gamepadState.cameraX || 0;
        state.cameraY = gamepadState.cameraY || 0;
      } else if (keyboardCameraLen === maxCameraLen) {
        state.cameraX = keyboardState.cameraX || 0;
        state.cameraY = keyboardState.cameraY || 0;
      } else {
        state.cameraX = touchState.cameraX || 0;
        state.cameraY = touchState.cameraY || 0;
      }
    }

    // Digital inputs: OR them together (any source being true makes output true)
    state.isRunning = (touchState.isRunning || false) || (keyboardState.isRunning || false) || (gamepadState.isRunning || false);
    state.attackLight = (touchState.attackLight || false) || (keyboardState.attackLight || false) || (gamepadState.attackLight || false);
    state.attackHeavy = (touchState.attackHeavy || false) || (keyboardState.attackHeavy || false) || (gamepadState.attackHeavy || false);
    state.attackSpecial = (touchState.attackSpecial || false) || (keyboardState.attackSpecial || false) || (gamepadState.attackSpecial || false);
    state.attackUltimate = (touchState.attackUltimate || false) || (keyboardState.attackUltimate || false) || (gamepadState.attackUltimate || false);
    state.dodge = (touchState.dodge || false) || (keyboardState.dodge || false) || (gamepadState.dodge || false);
    state.jump = (touchState.jump || false) || (keyboardState.jump || false) || (gamepadState.jump || false);
    state.traversal = (touchState.traversal || false) || (keyboardState.traversal || false) || (gamepadState.traversal || false);
    state.traversalModifier = (touchState.traversalModifier || false) || (keyboardState.traversalModifier || false) || (gamepadState.traversalModifier || false);
    state.fusion = (touchState.fusion || false) || (keyboardState.fusion || false) || (gamepadState.fusion || false);
    state.interact = (touchState.interact || false) || (keyboardState.interact || false) || (gamepadState.interact || false);
    state.pause = (touchState.pause || false) || (keyboardState.pause || false) || (gamepadState.pause || false);
    state.menu = (touchState.menu || false) || (keyboardState.menu || false) || (gamepadState.menu || false);

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

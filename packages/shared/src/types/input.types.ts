export enum InputType {
  KEYBOARD = 'keyboard',
  GAMEPAD = 'gamepad',
  TOUCH = 'touch',
  MOUSE = 'mouse',
}

export enum InputAction {
  // Movement
  MOVE_LEFT = 'move_left',
  MOVE_RIGHT = 'move_right',
  MOVE_UP = 'move_up',
  MOVE_DOWN = 'move_down',
  JUMP = 'jump',
  DASH = 'dash',
  CROUCH = 'crouch',

  // Attacks
  LIGHT_ATTACK = 'light_attack',
  HEAVY_ATTACK = 'heavy_attack',
  SPECIAL = 'special',
  GRAB = 'grab',

  // Defensive
  BLOCK = 'block',
  DODGE = 'dodge',
  PARRY = 'parry',

  // Special
  ULTIMATE = 'ultimate',
  TAUNT = 'taunt',
  PAUSE = 'pause',
}

export interface InputState {
  action: InputAction;
  pressed: boolean;
  held: boolean;
  released: boolean;
  timestamp: number;
  duration: number; // How long held
}

export interface InputBuffer {
  inputs: InputState[];
  maxSize: number; // Frame buffer size (default 6)
}

export interface TouchInput {
  id: number;
  position: { x: number; y: number };
  startPosition: { x: number; y: number };
  pressed: boolean;
  held: boolean;
  released: boolean;
  timestamp: number;
}

export interface GamepadState {
  connected: boolean;
  buttons: Map<number, boolean>;
  axes: number[];
  deadzone: number;
}

export interface KeyboardState {
  keys: Map<string, boolean>;
  modifiers: {
    shift: boolean;
    ctrl: boolean;
    alt: boolean;
    meta: boolean;
  };
}

export interface GestureInput {
  type: 'swipe' | 'tap' | 'double-tap' | 'hold' | 'pinch';
  direction?: 'up' | 'down' | 'left' | 'right';
  position: { x: number; y: number };
  velocity?: { x: number; y: number };
  distance?: number;
  timestamp: number;
}

export interface InputConfig {
  keyboardBindings: Map<string, InputAction>;
  gamepadBindings: Map<number, InputAction>;
  touchBindings: Map<string, InputAction>;
  inputBufferSize: number;
  deadzone: number;
}

import * as THREE from "three";

export interface KeyState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
  sprint: boolean;
}

/**
 * Standalone input tracker for keyboard state.
 * Listens for keydown/keyup on WASD, arrows, Space, and Shift.
 * Exposes the current frame's key state and a normalized movement vector.
 *
 * Usage:
 *   const input = new InputController();
 *   // in your game loop:
 *   const dir = input.getMovementVector();
 *   const pressed = input.justPressed("KeyJ");
 *   input.update(); // call at END of frame to advance "just pressed" tracking
 *   // on teardown:
 *   input.dispose();
 */
export class InputController {
  /** High-level named key state (forward/backward/left/right/jump/sprint). */
  readonly keys: KeyState = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    sprint: false,
  };

  /** Raw per-code state for arbitrary key queries (e.g. "KeyJ", "KeyT"). */
  private readonly _raw: Record<string, boolean> = {};
  private readonly _prev: Record<string, boolean> = {};
  private readonly _vec = new THREE.Vector3();

  private readonly _onKeyDown: (e: KeyboardEvent) => void;
  private readonly _onKeyUp: (e: KeyboardEvent) => void;
  private _attached = false;

  constructor(autoAttach = true) {
    this._onKeyDown = (e: KeyboardEvent) => {
      this._raw[e.code] = true;
      this._syncKeys();
    };

    this._onKeyUp = (e: KeyboardEvent) => {
      this._raw[e.code] = false;
      this._syncKeys();
    };

    if (autoAttach) this.attach();
  }

  /** Start listening for keyboard events. */
  attach(): void {
    if (this._attached) return;
    window.addEventListener("keydown", this._onKeyDown);
    window.addEventListener("keyup", this._onKeyUp);
    this._attached = true;
  }

  /** Stop listening and reset all state. */
  dispose(): void {
    window.removeEventListener("keydown", this._onKeyDown);
    window.removeEventListener("keyup", this._onKeyUp);
    this._attached = false;
    this._reset();
  }

  /**
   * Returns true only on the first frame a key code is held.
   * Must call `update()` at the end of each frame for this to work.
   */
  justPressed(code: string): boolean {
    return !!this._raw[code] && !this._prev[code];
  }

  /** Whether a raw key code is currently held. */
  isDown(code: string): boolean {
    return !!this._raw[code];
  }

  /**
   * Returns a normalized THREE.Vector3 representing the intended
   * movement direction on the XZ plane based on current WASD/arrow input.
   *
   * +X = right, -X = left, +Z = backward, -Z = forward
   * (matches Three.js default where -Z is "into the screen").
   *
   * The vector's length is 0 when no movement keys are pressed,
   * and exactly 1 when any combination is held.
   */
  getMovementVector(): THREE.Vector3 {
    const v = this._vec;
    v.set(0, 0, 0);

    if (this.keys.left) v.x -= 1;
    if (this.keys.right) v.x += 1;
    if (this.keys.forward) v.z -= 1;
    if (this.keys.backward) v.z += 1;

    if (v.lengthSq() > 0) v.normalize();
    return v;
  }

  /**
   * Call once at the END of each frame to snapshot the current raw state
   * so that `justPressed()` can detect rising edges next frame.
   */
  update(): void {
    for (const code in this._raw) {
      this._prev[code] = this._raw[code];
    }
  }

  // ---- internals ----

  private _syncKeys(): void {
    const r = this._raw;
    this.keys.forward = !!(r["KeyW"] || r["ArrowUp"]);
    this.keys.backward = !!(r["KeyS"] || r["ArrowDown"]);
    this.keys.left = !!(r["KeyA"] || r["ArrowLeft"]);
    this.keys.right = !!(r["KeyD"] || r["ArrowRight"]);
    this.keys.jump = !!(r["Space"]);
    this.keys.sprint = !!(r["ShiftLeft"] || r["ShiftRight"]);
  }

  private _reset(): void {
    for (const code in this._raw) delete this._raw[code];
    for (const code in this._prev) delete this._prev[code];
    this.keys.forward = false;
    this.keys.backward = false;
    this.keys.left = false;
    this.keys.right = false;
    this.keys.jump = false;
    this.keys.sprint = false;
  }
}

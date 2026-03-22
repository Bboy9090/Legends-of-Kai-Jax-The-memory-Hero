import * as THREE from "three";

export default class InputController {
  keys = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    space: false,
    shift: false,
  };

  constructor() {
    this._bindEvents();
  }

  private _bindEvents(): void {
    window.addEventListener("keydown", (e) => this._onKeyDown(e));
    window.addEventListener("keyup", (e) => this._onKeyUp(e));
  }

  private _onKeyDown(event: KeyboardEvent): void {
    switch (event.code) {
      case "KeyW":
        this.keys.forward = true;
        break;
      case "KeyS":
        this.keys.backward = true;
        break;
      case "KeyA":
        this.keys.left = true;
        break;
      case "KeyD":
        this.keys.right = true;
        break;
      case "Space":
        this.keys.space = true;
        break;
      case "ShiftLeft":
      case "ShiftRight":
        this.keys.shift = true;
        break;
    }
  }

  private _onKeyUp(event: KeyboardEvent): void {
    switch (event.code) {
      case "KeyW":
        this.keys.forward = false;
        break;
      case "KeyS":
        this.keys.backward = false;
        break;
      case "KeyA":
        this.keys.left = false;
        break;
      case "KeyD":
        this.keys.right = false;
        break;
      case "Space":
        this.keys.space = false;
        break;
      case "ShiftLeft":
      case "ShiftRight":
        this.keys.shift = false;
        break;
    }
  }

  getMovementVector(): THREE.Vector3 {
    const direction = new THREE.Vector3();

    if (this.keys.forward) direction.z -= 1;
    if (this.keys.backward) direction.z += 1;
    if (this.keys.left) direction.x -= 1;
    if (this.keys.right) direction.x += 1;

    if (direction.lengthSq() > 0) {
      direction.normalize();
    }

    return direction;
  }
}

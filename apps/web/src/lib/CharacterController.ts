import * as THREE from "three";
import type InputController from "./InputController";

export type CharacterState =
  | "idle"
  | "walk"
  | "run"
  | "jump"
  | "fall"
  | "attack_light"
  | "attack_heavy"
  | "hit"
  | "block";

const WALK_SPEED = 5;
const RUN_SPEED = 10;
const GRAVITY = -20;
const JUMP_VELOCITY = 8;
const GROUND_Y = 0;

export default class CharacterController {
  input: InputController;
  state: CharacterState = "idle";

  posX = 0;
  posY = GROUND_Y;
  posZ = 0;

  velocityY = 0;
  isGrounded = true;
  isAttacking = false;
  isHit = false;
  isBlocking = false;

  private _moveDir = new THREE.Vector3();

  constructor(input: InputController) {
    this.input = input;
  }

  update(delta: number): void {
    // --- physics ---

    if (this.input.keys.space && this.isGrounded) {
      this.velocityY = JUMP_VELOCITY;
      this.isGrounded = false;
    }

    this.velocityY += GRAVITY * delta;
    this.posY += this.velocityY * delta;

    if (this.posY <= GROUND_Y) {
      this.posY = GROUND_Y;
      this.velocityY = 0;
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }

    // --- movement ---

    const move = this.input.getMovementVector();
    const speed = this.input.keys.shift ? RUN_SPEED : WALK_SPEED;

    this.posX += move.x * speed * delta;
    this.posZ += move.z * speed * delta;

    this._moveDir.copy(move);

    // --- state resolution ---

    if (this.isHit) {
      this.state = "hit";
      return;
    }

    if (this.isBlocking) {
      this.state = "block";
      return;
    }

    if (this.isAttacking) {
      this.state = "attack_light";
      return;
    }

    if (!this.isGrounded) {
      this.state = this.velocityY > 0 ? "jump" : "fall";
      return;
    }

    if (move.lengthSq() === 0) {
      this.state = "idle";
      return;
    }

    this.state = this.input.keys.shift ? "run" : "walk";
  }

  getMoveDirection(): THREE.Vector3 {
    return this._moveDir;
  }
}

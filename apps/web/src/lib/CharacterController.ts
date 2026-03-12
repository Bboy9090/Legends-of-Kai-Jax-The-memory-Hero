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

export default class CharacterController {
  input: InputController;
  state: CharacterState = "idle";
  isGrounded = true;
  isAttacking = false;
  isHit = false;
  isBlocking = false;
  velocityY = 0;

  constructor(input: InputController) {
    this.input = input;
  }

  update(): void {
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

    const move = this.input.getMovementVector();

    if (move.lengthSq() === 0) {
      this.state = "idle";
      return;
    }

    this.state = this.input.keys.shift ? "run" : "walk";
  }
}

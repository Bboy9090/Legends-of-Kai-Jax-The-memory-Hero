import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useBattle } from "../../lib/stores/useBattle";

const AI_MOVE_SPEED = 3.5;
const GRAVITY = -15;
const GROUND_Y = 0.8;
const ATTACK_RANGE = 2.2;
const PREFERRED_RANGE = 3;
const JUMP_VELOCITY = 4;

export default function OpponentAI() {
  const attackCooldown = useRef(0);
  const decisionTimer = useRef(0);
  const currentAction = useRef<"chase" | "retreat" | "idle">("chase");
  const jumpCooldown = useRef(0);

  useFrame((_, rawDelta) => {
    const state = useBattle.getState();
    if (state.battlePhase !== "fighting") return;
    if (state.hitStop > 0) return;
    if (state.opponentStaggerTimer > 0 || state.opponentHitStunTimer > 0) return;

    const delta = rawDelta * state.timeScale;

    attackCooldown.current = Math.max(0, attackCooldown.current - delta);
    jumpCooldown.current = Math.max(0, jumpCooldown.current - delta);
    decisionTimer.current -= delta;

    let velY = state.opponentVelocityY;
    let wantsJump = false;

    if (decisionTimer.current <= 0) {
      decisionTimer.current = 0.4 + Math.random() * 0.6;
      const dist = Math.abs(state.playerX - state.opponentX);
      const healthRatio = state.opponentHealth / state.maxHealth;

      if (dist > PREFERRED_RANGE + 2) {
        currentAction.current = "chase";
      } else if (dist < 1.2 && healthRatio < 0.3) {
        currentAction.current = "retreat";
      } else {
        currentAction.current = "chase";
      }

      if (jumpCooldown.current <= 0 && Math.random() < 0.06 && state.opponentGrounded) {
        wantsJump = true;
        jumpCooldown.current = 2.5;
      }
    }

    if (wantsJump && state.opponentGrounded) {
      velY = JUMP_VELOCITY;
    }

    velY += GRAVITY * delta;
    let newY = state.opponentY + velY * delta;
    let grounded = false;

    if (newY <= GROUND_Y) {
      newY = GROUND_Y;
      velY = 0;
      grounded = true;
    }

    const dist = state.playerX - state.opponentX;
    const absDist = Math.abs(dist);
    const dir = dist > 0 ? 1 : -1;
    let dx = 0;

    if (currentAction.current === "chase") {
      if (absDist > ATTACK_RANGE * 0.7) {
        dx = dir * AI_MOVE_SPEED * delta;
      }
    } else if (currentAction.current === "retreat") {
      dx = -dir * AI_MOVE_SPEED * 0.7 * delta;
    }

    const newX = Math.max(-10, Math.min(10, state.opponentX + dx));

    useBattle.setState({
      opponentX: newX,
      opponentY: newY,
      opponentVelocityY: velY,
      opponentGrounded: grounded,
      opponentFacingRight: state.playerX > newX,
    });

    if (
      absDist < ATTACK_RANGE &&
      attackCooldown.current <= 0 &&
      !state.opponentAttacking
    ) {
      const roll = Math.random();
      let attackType: "punch" | "kick" | "special";
      if (roll < 0.5) {
        attackType = "punch";
        attackCooldown.current = 0.8;
      } else if (roll < 0.8) {
        attackType = "kick";
        attackCooldown.current = 1.0;
      } else {
        attackType = "special";
        attackCooldown.current = 1.8;
      }
      state.opponentAttack(attackType);
    }
  });

  return null;
}

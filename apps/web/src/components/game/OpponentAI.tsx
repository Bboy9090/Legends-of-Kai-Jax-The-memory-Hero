import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useBattle } from "../../lib/stores/useBattle";
import { useDifficulty, getMoveSpeedMultiplier, getAttackCooldownMultiplier } from "../../lib/stores/useDifficulty";
import { getCharacterMoves } from "../../lib/characterMoves";

const AI_MOVE_SPEED = 3.8;
const GRAVITY = -16;
const GROUND_Y = 0.8;
const BASE_ATTACK_RANGE = 2.2;
const PREFERRED_RANGE = 3;
const JUMP_VELOCITY = 4.2;

export default function OpponentAI() {
  const attackCooldown = useRef(0);
  const decisionTimer = useRef(0);
  const currentAction = useRef<"chase" | "retreat" | "idle">("chase");
  const jumpCooldown = useRef(0);

  useFrame((_, rawDelta) => {
    const state = useBattle.getState();
    if (state.battlePhase !== "fighting") return;
    if (state.hitStop > 0) return;

    const delta = Math.min(rawDelta * state.timeScale, 0.05);
    const difficulty = useDifficulty.getState().difficulty;
    const moveMult = getMoveSpeedMultiplier(difficulty);
    const cooldownMult = getAttackCooldownMultiplier(difficulty);
    const personality = state.opponentPersonality;
    const isAggressive = personality === "aggressive";

    attackCooldown.current = Math.max(0, attackCooldown.current - delta);
    jumpCooldown.current = Math.max(0, jumpCooldown.current - delta);
    decisionTimer.current -= delta;

    let velY = state.opponentVelocityY;
    let wantsJump = false;

    if (decisionTimer.current <= 0) {
      decisionTimer.current = 0.4 + Math.random() * 0.6;
      const dist = Math.abs(state.playerX - state.opponentX);
      const healthRatio = state.opponentHealth / state.maxHealth;

      // Personality affects chase vs retreat: aggressive chases more, defensive retreats more
      const retreatThreshold = isAggressive ? 0.15 : 0.35;
      const retreatDist = isAggressive ? 0.8 : 1.5;
      if (dist > PREFERRED_RANGE + 2) {
        currentAction.current = "chase";
      } else if (dist < retreatDist && healthRatio < retreatThreshold) {
        currentAction.current = "retreat";
      } else {
        currentAction.current = isAggressive ? "chase" : (Math.random() < 0.4 ? "retreat" : "chase");
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
    const moves = getCharacterMoves(state.opponentFighterId);
    const specialRange = moves.specialRange;
    const attackRange = Math.max(BASE_ATTACK_RANGE, specialRange * 0.85);

    const moveSpeed = AI_MOVE_SPEED * moveMult;
    if (currentAction.current === "chase") {
      if (absDist > attackRange * 0.7) {
        dx = dir * moveSpeed * delta;
      }
    } else if (currentAction.current === "retreat") {
      dx = -dir * moveSpeed * (isAggressive ? 0.6 : 0.8) * delta;
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
      absDist < attackRange &&
      attackCooldown.current <= 0 &&
      !state.opponentAttacking
    ) {
      const roll = Math.random();
      let attackType: "punch" | "kick" | "special";
      // Personality: aggressive uses more specials, defensive uses more punches
      if (isAggressive) {
        if (roll < 0.35) {
          attackType = "punch";
          attackCooldown.current = 0.8 * cooldownMult;
        } else if (roll < 0.65) {
          attackType = "kick";
          attackCooldown.current = 1.0 * cooldownMult;
        } else {
          attackType = "special";
          attackCooldown.current = 1.8 * cooldownMult;
        }
      } else {
        if (roll < 0.65) {
          attackType = "punch";
          attackCooldown.current = 0.8 * cooldownMult;
        } else if (roll < 0.9) {
          attackType = "kick";
          attackCooldown.current = 1.0 * cooldownMult;
        } else {
          attackType = "special";
          attackCooldown.current = 1.8 * cooldownMult;
        }
      }
      state.opponentAttack(attackType);
    }
  });

  return null;
}

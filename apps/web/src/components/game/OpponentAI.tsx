import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useBattle } from "../../lib/stores/useBattle";
import { useDifficulty, type Difficulty } from "../../lib/stores/useDifficulty";
import { BEHAVIOR_PROFILES, type AIBehaviorDifficulty } from "../../lib/enemyAIv2";

const AI_MOVE_SPEED = 3.9;
const GRAVITY = -15;
const GROUND_Y = 0.8;
const MELEE_ATTACK_RANGE = 2.45;
const MELEE_HOLD_RANGE = 1.75;
const CASTER_ATTACK_RANGE = 6.0;
const CASTER_HOLD_MIN = 3.0;
const CASTER_HOLD_MAX = 5.0;
const JUMP_VELOCITY = 4;

function toAIDifficulty(d: Difficulty): AIBehaviorDifficulty {
  return d === "story" ? "easy" : d;
}

export default function OpponentAI() {
  const attackCooldown = useRef(0);
  const decisionTimer = useRef(0);
  const currentAction = useRef<"chase" | "retreat" | "idle">("chase");
  const jumpCooldown = useRef(0);
  const difficulty = useDifficulty((s) => s.difficulty);

  useFrame((_, rawDelta) => {
    const state = useBattle.getState();
    if (state.battlePhase !== "fighting") return;
    if (state.hitStop > 0) return;
    if (state.opponentStaggerTimer > 0 || state.opponentHitStunTimer > 0) return;

    const delta = Math.min(rawDelta, 0.05) * state.timeScale;
    const p = state.opponentPersonality;
    const isAtLeftWall = state.opponentX <= -9.8;
    const isAtRightWall = state.opponentX >= 9.8;

    const aiDiff = toAIDifficulty(difficulty);
    const enemyType =
      p === "stalker" ? "attacker" : p === "titan" ? "tank" : p === "caster" ? "elite" : "grunt";
    const profile = BEHAVIOR_PROFILES[enemyType][aiDiff];
    const decisionInterval = Math.max(0.08, profile.decisionUpdateRate / 1000);

    attackCooldown.current = Math.max(0, attackCooldown.current - delta);
    jumpCooldown.current = Math.max(0, jumpCooldown.current - delta);
    decisionTimer.current -= delta;

    let velY = state.opponentVelocityY;
    let wantsJump = false;

    const distanceNow = Math.abs(state.playerX - state.opponentX);
    const isLowHealth = state.opponentHealth / state.maxHealth < 0.3;

    if (decisionTimer.current <= 0) {
      decisionTimer.current = decisionInterval;

      if (p === "stalker") {
        if (distanceNow > MELEE_HOLD_RANGE) currentAction.current = "chase";
        else currentAction.current = isLowHealth ? "retreat" : "idle";
        if (jumpCooldown.current <= 0 && state.opponentGrounded && distanceNow > 2.5) {
          wantsJump = Math.random() < 0.22;
          jumpCooldown.current = 1.4;
        }
      } else if (p === "titan") {
        currentAction.current = distanceNow > 1.55 ? "chase" : "idle";
        wantsJump = false;
      } else if (p === "caster") {
        if (distanceNow < CASTER_HOLD_MIN) currentAction.current = "retreat";
        else if (distanceNow > CASTER_HOLD_MAX) currentAction.current = "chase";
        else currentAction.current = "idle";
      } else {
        currentAction.current = distanceNow > MELEE_HOLD_RANGE ? "chase" : "idle";
      }
    }

    if (
      p === "stalker" &&
      !state.opponentGrounded &&
      (isAtLeftWall || isAtRightWall) &&
      jumpCooldown.current <= 0 &&
      Math.random() < 0.18
    ) {
      wantsJump = true;
    }

    let wallKickPush = 0;
    if (wantsJump) {
      if (state.opponentGrounded) {
        velY = JUMP_VELOCITY * (p === "stalker" ? 1.25 : 1.0);
      } else if (p === "stalker" && (isAtLeftWall || isAtRightWall)) {
        velY = JUMP_VELOCITY * 1.15;
        jumpCooldown.current = 1.5;
        wallKickPush += isAtLeftWall ? 0.45 : -0.45;
      }
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

    const baseMoveSpeed =
      p === "stalker"
        ? AI_MOVE_SPEED * 1.2
        : p === "titan"
          ? AI_MOVE_SPEED * 0.78
          : p === "caster"
            ? AI_MOVE_SPEED * 0.92
            : AI_MOVE_SPEED;

    if (currentAction.current === "chase") {
      dx = dir * baseMoveSpeed * delta;
    } else if (currentAction.current === "retreat") {
      dx = -dir * baseMoveSpeed * 0.72 * delta;
    }
    dx += wallKickPush;

    const newX = Math.max(-10, Math.min(10, state.opponentX + dx));
    const faceDirection = absDist < 12 ? state.playerX > state.opponentX : state.opponentFacingRight;

    useBattle.setState({
      opponentX: newX,
      opponentY: newY,
      opponentVelocityY: velY,
      opponentGrounded: grounded,
      opponentFacingRight: faceDirection,
    });

    const attackRange = p === "caster" ? CASTER_ATTACK_RANGE : MELEE_ATTACK_RANGE;
    if (absDist <= attackRange && attackCooldown.current <= 0 && !state.opponentAttacking) {
      const roll = Math.random();
      let attackType: "punch" | "kick" | "special";

      if (p === "titan") {
        attackType = roll < 0.65 ? "kick" : "punch";
      } else if (p === "caster") {
        attackType = absDist > MELEE_ATTACK_RANGE ? "special" : roll < 0.7 ? "special" : "kick";
      } else if (p === "stalker") {
        attackType = roll < 0.5 ? "punch" : roll < 0.88 ? "kick" : "special";
      } else {
        attackType = roll < 0.48 ? "punch" : roll < 0.88 ? "kick" : "special";
      }

      state.opponentAttack(attackType);
      const baseSpacing = Math.max(0.45, profile.attackSpacing / 1000);
      const pressureMult = difficulty === "story" ? 1.15 : difficulty === "hard" ? 0.88 : difficulty === "legendary" ? 0.78 : 1;
      attackCooldown.current = baseSpacing * pressureMult + Math.random() * 0.25;
    }
  });

  return null;
}

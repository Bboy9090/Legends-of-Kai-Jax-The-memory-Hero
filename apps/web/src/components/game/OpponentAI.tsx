import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useBattle } from "../../lib/stores/useBattle";
import { useDifficulty, type Difficulty } from "../../lib/stores/useDifficulty";
import { BEHAVIOR_PROFILES, type AIBehaviorDifficulty } from "../../lib/enemyAIv2";

const AI_MOVE_SPEED = 4.1;
const GRAVITY = -15;
const GROUND_Y = 0.8;
const MELEE_ATTACK_RANGE = 1.95;
const MELEE_HOLD_RANGE = 1.6;
const DEFENSIVE_HOLD_MIN = 2.2;
const DEFENSIVE_HOLD_MAX = 3.4;
const CASTER_ATTACK_RANGE = 6.0;
const CASTER_HOLD_MIN = 3.1;
const CASTER_HOLD_MAX = 5.2;
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
      p === "stalker" || p === "aggressive"
        ? "attacker"
        : p === "titan"
          ? "tank"
          : p === "caster" || p === "defensive"
            ? "elite"
            : "grunt";
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

      if (p === "aggressive") {
        // Aggressive AI closes immediately and rarely gives ground.
        currentAction.current = distanceNow > 1.35 ? "chase" : "idle";
        if (jumpCooldown.current <= 0 && state.opponentGrounded && distanceNow > 3.4) {
          wantsJump = Math.random() < 0.12;
          jumpCooldown.current = 1.6;
        }
      } else if (p === "defensive") {
        // Defensive AI maintains a readable counter-fighting pocket instead of
        // behaving like the default pressure bot.
        if (distanceNow < DEFENSIVE_HOLD_MIN) currentAction.current = "retreat";
        else if (distanceNow > DEFENSIVE_HOLD_MAX) currentAction.current = "chase";
        else currentAction.current = "idle";
      } else if (p === "stalker") {
        if (distanceNow > MELEE_HOLD_RANGE) currentAction.current = "chase";
        else currentAction.current = isLowHealth && distanceNow < 1.2 ? "retreat" : "idle";
        if (jumpCooldown.current <= 0 && state.opponentGrounded && distanceNow > 3.0) {
          wantsJump = Math.random() < 0.18;
          jumpCooldown.current = 1.5;
        }
      } else if (p === "titan") {
        currentAction.current = distanceNow > 1.45 ? "chase" : "idle";
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
      Math.random() < 0.14
    ) {
      wantsJump = true;
    }

    let wallKickPush = 0;
    if (wantsJump) {
      if (state.opponentGrounded) {
        velY = JUMP_VELOCITY * (p === "stalker" ? 1.2 : 1.0);
      } else if (p === "stalker" && (isAtLeftWall || isAtRightWall)) {
        velY = JUMP_VELOCITY * 1.1;
        jumpCooldown.current = 1.6;
        wallKickPush += isAtLeftWall ? 0.4 : -0.4;
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
      p === "aggressive"
        ? AI_MOVE_SPEED * 1.08
        : p === "defensive"
          ? AI_MOVE_SPEED * 0.84
          : p === "stalker"
            ? AI_MOVE_SPEED * 1.18
            : p === "titan"
              ? AI_MOVE_SPEED * 0.76
              : p === "caster"
                ? AI_MOVE_SPEED * 0.9
                : AI_MOVE_SPEED;

    if (currentAction.current === "chase") {
      dx = dir * baseMoveSpeed * delta;
    } else if (currentAction.current === "retreat") {
      const retreatScale = p === "defensive" ? 0.88 : 0.68;
      dx = -dir * baseMoveSpeed * retreatScale * delta;
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
    const defensiveCanStrike = p !== "defensive" || absDist <= 1.72;
    if (
      absDist <= attackRange &&
      defensiveCanStrike &&
      attackCooldown.current <= 0 &&
      !state.opponentAttacking
    ) {
      const roll = Math.random();
      let attackType: "punch" | "kick" | "special";

      if (p === "aggressive") {
        attackType = absDist > 1.5 ? "kick" : roll < 0.64 ? "punch" : roll < 0.93 ? "kick" : "special";
      } else if (p === "defensive") {
        attackType = roll < 0.56 ? "kick" : roll < 0.88 ? "punch" : "special";
      } else if (p === "titan") {
        attackType = absDist > 1.5 ? "kick" : roll < 0.62 ? "kick" : "punch";
      } else if (p === "caster") {
        attackType = absDist > MELEE_ATTACK_RANGE ? "special" : roll < 0.72 ? "special" : "kick";
      } else if (p === "stalker") {
        attackType = absDist > 1.5 ? "kick" : roll < 0.52 ? "punch" : roll < 0.9 ? "kick" : "special";
      } else {
        attackType = absDist > 1.5 ? "kick" : roll < 0.5 ? "punch" : roll < 0.9 ? "kick" : "special";
      }

      state.opponentAttack(attackType);
      const baseSpacing = Math.max(0.45, profile.attackSpacing / 1000);
      const pressureMult =
        difficulty === "story"
          ? 1.18
          : difficulty === "hard"
            ? 0.88
            : difficulty === "legendary"
              ? 0.78
              : 1;
      const personalitySpacing = p === "aggressive" ? 0.82 : p === "defensive" ? 1.28 : 1;
      attackCooldown.current = baseSpacing * pressureMult * personalitySpacing + Math.random() * 0.2;
    }
  });

  return null;
}

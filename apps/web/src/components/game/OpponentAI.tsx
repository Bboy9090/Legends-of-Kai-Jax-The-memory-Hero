import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useBattle } from "../../lib/stores/useBattle";
import { useDifficulty, type Difficulty } from "../../lib/stores/useDifficulty";
import { BEHAVIOR_PROFILES, type AIBehaviorDifficulty } from "../../lib/enemyAIv2";

const AI_MOVE_SPEED = 3.5;
const GRAVITY = -15;
const GROUND_Y = 0.8;
const ATTACK_RANGE = 2.2;
const PREFERRED_RANGE = 3;
const JUMP_VELOCITY = 4;

// Map the game's difficulty tiers onto the Wave 2 enemy-AI behavior tiers.
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

    const delta = rawDelta * state.timeScale;

    const p = state.opponentPersonality;
    const isAtLeftWall = state.opponentX <= -9.8;
    const isAtRightWall = state.opponentX >= 9.8;

    // 🧠 WAVE 2: pull difficulty-scaled cadence from the enemy-AI behavior tiers.
    // Personality maps onto an enemy archetype; the profile drives how fast the
    // opponent re-decides and how often it attacks.
    const aiDiff = toAIDifficulty(difficulty);
    const enemyType =
      p === "stalker" ? "attacker" : p === "titan" ? "tank" : p === "caster" ? "elite" : "grunt";
    const profile = BEHAVIOR_PROFILES[enemyType][aiDiff];
    const decisionInterval = profile.decisionUpdateRate / 1000; // ms → s

    attackCooldown.current = Math.max(0, attackCooldown.current - delta);
    jumpCooldown.current = Math.max(0, jumpCooldown.current - delta);
    decisionTimer.current -= delta;

    let velY = state.opponentVelocityY;
    let wantsJump = false;

    // 🤖 ARCHETYPE DECISION MAPPING
    if (decisionTimer.current <= 0) {
      decisionTimer.current = decisionInterval;
      const dist = Math.abs(state.playerX - state.opponentX);
      const isLowHealth = state.opponentHealth / state.maxHealth < 0.3;

      if (p === "stalker") {
        // Stalkers LOVE the air and walls
        if (dist > 5) currentAction.current = "chase";
        else if (dist < 3) currentAction.current = isLowHealth ? "retreat" : "chase";
        if (jumpCooldown.current <= 0 && state.opponentGrounded) {
             wantsJump = Math.random() < 0.4;
             jumpCooldown.current = 1.2;
        }
      } else if (p === "titan") {
        // Titans are terminators. They only walk forward.
        currentAction.current = "chase";
        wantsJump = false; // Titans don't jump much pieces of heavy machinery
      } else if (p === "caster") {
        // Casters maintain the 'Goldilocks' zone
        if (dist < 5) currentAction.current = "retreat";
        else if (dist > 7) currentAction.current = "chase";
        else currentAction.current = "idle";
      } else {
        // Default hybrid logic
        currentAction.current = dist > PREFERRED_RANGE ? "chase" : "idle";
      }
    }

    // 🦁 BEAST MECHANIC: AI WALL KICK (Stalkers only)
    if (p === "stalker" && !state.opponentGrounded && (isAtLeftWall || isAtRightWall) && Math.random() < 0.5) {
        wantsJump = true; // Use jump as kick trigger
    }

    // Horizontal pop away from a wall during a stalker mid-air vault.
    // Accumulated here and applied to movement below (declaration order fix).
    let wallKickPush = 0;

    if (wantsJump) {
      if (state.opponentGrounded) {
        velY = JUMP_VELOCITY * (p === "stalker" ? 1.4 : 1.0);
      } else if (p === "stalker" && (isAtLeftWall || isAtRightWall)) {
        // 🔥 AUDIT FIX: Decoupled mid-air vaulting
        velY = JUMP_VELOCITY * 1.2;
        jumpCooldown.current = 1.5;
        wallKickPush += (isAtLeftWall ? 0.5 : -0.5);
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

    const baseMoveSpeed = p === "stalker" ? AI_MOVE_SPEED * 1.3 : p === "titan" ? AI_MOVE_SPEED * 0.7 : AI_MOVE_SPEED;

    if (currentAction.current === "chase") {
      dx = dir * baseMoveSpeed * delta;
    } else if (currentAction.current === "retreat") {
      dx = -dir * baseMoveSpeed * 0.8 * delta;
    }
    dx += wallKickPush;

    const newX = Math.max(-10, Math.min(10, state.opponentX + dx));

    // 🎯 SNAP-FACING: Always face target when within range or attacking
    const faceDirection = state.opponentAttacking || absDist < 12 ? state.playerX > state.opponentX : state.opponentFacingRight;

    useBattle.setState({
      opponentX: newX,
      opponentY: newY,
      opponentVelocityY: velY,
      opponentGrounded: grounded,
      opponentFacingRight: faceDirection,
    });

    // ⚔️ ATTACK LOGIC (Scaled by Personality)
    if (absDist < ATTACK_RANGE && attackCooldown.current <= 0 && !state.opponentAttacking) {
      const roll = Math.random();
      let attackType: "punch" | "kick" | "special";
      
      if (p === "titan") {
        attackType = roll < 0.7 ? "kick" : "punch"; // Titans favor heavy kicks
      } else if (p === "caster") {
        attackType = roll < 0.6 ? "special" : "kick"; // Casters favor range
      } else {
        attackType = roll < 0.4 ? "punch" : roll < 0.8 ? "kick" : "special";
      }
      
      state.opponentAttack(attackType);
      // Wave 2: base attack spacing comes from the difficulty-scaled profile
      // (ms → s), with a small random jitter so the cadence isn't robotic.
      const baseSpacing = profile.attackSpacing / 1000;
      attackCooldown.current = baseSpacing + Math.random() * 0.5;
    }
  });

  return null;
}

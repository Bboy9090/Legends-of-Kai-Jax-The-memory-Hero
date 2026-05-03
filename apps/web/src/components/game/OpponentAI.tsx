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

    const p = state.opponentPersonality;
    const isAtLeftWall = state.opponentX <= -9.8;
    const isAtRightWall = state.opponentX >= 9.8;

    attackCooldown.current = Math.max(0, attackCooldown.current - delta);
    jumpCooldown.current = Math.max(0, jumpCooldown.current - delta);
    decisionTimer.current -= delta;

    let velY = state.opponentVelocityY;
    let wantsJump = false;

    // 🤖 ARCHETYPE DECISION MAPPING
    if (decisionTimer.current <= 0) {
      decisionTimer.current = p === "stalker" ? 0.3 : p === "titan" ? 0.6 : 0.45;
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

    if (wantsJump) {
      if (state.opponentGrounded) {
        velY = JUMP_VELOCITY * (p === "stalker" ? 1.4 : 1.0);
      } else if (p === "stalker" && (isAtLeftWall || isAtRightWall)) {
        // 🔥 AUDIT FIX: Decoupled mid-air vaulting
        velY = JUMP_VELOCITY * 1.2;
        jumpCooldown.current = 1.5;
        // Small horizontal pop away from wall
        dx += (isAtLeftWall ? 0.5 : -0.5);
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
      attackCooldown.current = 0.5 + Math.random() * 1.0;
    }
  });

  return null;
}

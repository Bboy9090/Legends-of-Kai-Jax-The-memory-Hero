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
const EDGE_GUARD_THRESHOLD = 2;
const HABIT_BUFFER_SIZE = 6;

export default function OpponentAI() {
  const attackCooldown = useRef(0);
  const decisionTimer = useRef(0);
  const currentAction = useRef<"chase" | "retreat" | "idle" | "edgeguard">("chase");
  const jumpCooldown = useRef(0);
  const playerHabits = useRef<("punch" | "kick" | "special")[]>([]);
  const lastPlayerAttack = useRef<number>(0);

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

    // Track player habits (punch/kick/special from playerAttackType)
    if (state.playerAttacking && state.playerAttackType && state.playerAttackType !== "ultimate") {
      const t = Date.now();
      if (t - lastPlayerAttack.current > 200) {
        lastPlayerAttack.current = t;
        playerHabits.current.push(state.playerAttackType);
        if (playerHabits.current.length > HABIT_BUFFER_SIZE) playerHabits.current.shift();
      }
    }

    attackCooldown.current = Math.max(0, attackCooldown.current - delta);
    jumpCooldown.current = Math.max(0, jumpCooldown.current - delta);
    decisionTimer.current -= delta;

    let velY = state.opponentVelocityY;
    let wantsJump = false;
    const dist = Math.abs(state.playerX - state.opponentX);
    const healthRatio = state.opponentHealth / state.maxHealth;

    // Edge-guard: when player near stage edge (±10), try to keep them there
    const playerNearLeftEdge = state.playerX < -10 + EDGE_GUARD_THRESHOLD;
    const playerNearRightEdge = state.playerX > 10 - EDGE_GUARD_THRESHOLD;
    const playerNearEdge = playerNearLeftEdge || playerNearRightEdge;

    if (decisionTimer.current <= 0) {
      decisionTimer.current = 0.4 + Math.random() * 0.6;

      const retreatThreshold = isAggressive ? 0.15 : 0.35;
      const retreatDist = isAggressive ? 0.8 : 1.5;

      if (playerNearEdge && healthRatio > 0.25) {
        currentAction.current = "edgeguard";
      } else if (dist > PREFERRED_RANGE + 2) {
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
    } else if (currentAction.current === "edgeguard") {
      // Position to pressure opponent at edge — stay between them and center
      const centerDir = state.playerX > 0 ? -1 : 1;
      if (absDist > attackRange * 1.2) {
        dx = centerDir * moveSpeed * delta;
      }
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
      const habits = playerHabits.current;
      const punchCount = habits.filter((h) => h === "punch").length;
      const specialCount = habits.filter((h) => h === "special").length;
      const isPunchSpammer = punchCount >= 4 && habits.length >= 5;
      const isSpecialHappy = specialCount >= 3 && habits.length >= 5;

      let roll = Math.random();
      let attackType: "punch" | "kick" | "special";
      // Habit adaptation: counter punch spam with specials; if they use specials often, use kicks for speed
      if (isPunchSpammer) roll = roll < 0.5 ? 0.7 : roll;
      if (isSpecialHappy) roll = roll < 0.3 ? 0.5 : roll;

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

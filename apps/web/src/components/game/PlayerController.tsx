import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useBattle } from "../../lib/stores/useBattle";
import { useAudio } from "../../lib/stores/useAudio";
import { useTouchInput } from "../../lib/stores/useTouchInput";
import { MOVEMENT_TUNING } from "../../game/tuning/movementTuning";

const b = MOVEMENT_TUNING.battle;
const GRAVITY = b.gravity;
const GROUND_Y = b.groundY;
const JUMP_VELOCITY = b.jumpVelocity;

const WALK_MAX_SPEED = b.walkMaxSpeed;
const SPRINT_MAX_SPEED = b.sprintMaxSpeed;
const ACCEL = b.accel;
const DECEL = b.decel;
const AIR_CONTROL_MULT = b.airControlMult;

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

export default function PlayerController() {
  const keysRef = useRef<Record<string, boolean>>({});
  const prevKeysRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const keys = keysRef.current;
    const handleDown = (e: KeyboardEvent) => {
      keys[e.code] = true;
    };
    const handleUp = (e: KeyboardEvent) => {
      keys[e.code] = false;
    };
    window.addEventListener("keydown", handleDown);
    window.addEventListener("keyup", handleUp);
    return () => {
      window.removeEventListener("keydown", handleDown);
      window.removeEventListener("keyup", handleUp);
    };
  }, []);

  useFrame((_, rawDelta) => {
    const state = useBattle.getState();
    if (state.battlePhase !== "fighting" && state.battlePhase !== "transforming") return;
    if (state.hitStop > 0) return;

    const blockHeld = !!(keys["AltLeft"] || keys["AltRight"]);
    useBattle.getState().setPlayerBlockHeld(blockHeld);

    const delta = rawDelta * state.timeScale;
    const keys = keysRef.current;
    const prev = prevKeysRef.current;
    const justPressed = (code: string) => keys[code] && !prev[code];

    const touch = useTouchInput.getState();
    const touchAttacks = touch.consumeAttacks();

    if (state.playerDodgeTimer > 0) {
      prevKeysRef.current = { ...keys };
      return;
    }

    if (state.guardBreakTimer > 0 || state.playerHitStunTimer > 0) {
      let velY = state.playerVelocityY;
      velY += GRAVITY * delta;
      let newY = state.playerY + velY * delta;
      let grounded = false;
      if (newY <= GROUND_Y) {
        newY = GROUND_Y;
        velY = 0;
        grounded = true;
      }
      useBattle.setState({
        playerY: newY,
        playerVelocityY: velY,
        playerGrounded: grounded,
        playerVelocityX: 0,
        playerFacingRight: state.opponentX > state.playerX,
      });
      prevKeysRef.current = { ...keys };
      return;
    }

    let inputX = 0;
    if (keys["ArrowLeft"] || keys["KeyA"]) inputX -= 1;
    if (keys["ArrowRight"] || keys["KeyD"]) inputX += 1;

    if (touch.isJoystickActive) {
      inputX += touch.joystickX;
    }

    inputX = clamp01(Math.abs(inputX)) * Math.sign(inputX || 0);

    const sprintHeld = keys["ShiftLeft"] || keys["ShiftRight"];
    const maxSpeed =
      (sprintHeld ? SPRINT_MAX_SPEED : WALK_MAX_SPEED) * (state.playerGrounded ? 1 : AIR_CONTROL_MULT);

    const blockMove =
      blockHeld &&
      state.playerGrounded &&
      !state.playerAttacking;

    let targetVx = inputX * maxSpeed;
    if (Math.abs(inputX) < 0.08) targetVx = 0;
    if (blockMove) {
      targetVx *= b.blockMoveSpeedMult;
    }

    let vx = state.playerVelocityX;
    const rate = targetVx === 0 ? DECEL : ACCEL;
    vx += Math.sign(targetVx - vx) * rate * delta;
    if (targetVx === 0 && Math.abs(vx) < 0.06) vx = 0;
    if (Math.abs(vx) > maxSpeed + 0.01) {
      vx = Math.sign(vx) * maxSpeed;
    }

    const dx = vx * delta;
    const isAtLeftWall = state.playerX <= b.arenaXMin + 0.1;
    const isAtRightWall = state.playerX >= b.arenaXMax - 0.1;
    const newX = Math.max(b.arenaXMin, Math.min(b.arenaXMax, state.playerX + dx));

    let velY = state.playerVelocityY;
    const wantJump =
      justPressed("Space") ||
      justPressed("ArrowUp") ||
      justPressed("KeyW") ||
      touchAttacks.includes("jump");

    // 🦁 BEAST MECHANIC: WALL KICK
    if (wantJump && !state.playerGrounded && (isAtLeftWall || isAtRightWall)) {
      const kickDir = isAtLeftWall ? 1 : -1;
      vx = kickDir * SPRINT_MAX_SPEED * 1.5; // Explosive push-off
      velY = JUMP_VELOCITY * 0.9; // Horizontal focus
      useAudio.getState().playJump();
      useBattle.getState().addScreenShake(0.05); // Visual feedback
    } 
    // 🦁 BEAST MECHANIC: PREDATOR POUNCE
    else if (wantJump && state.playerGrounded && !blockMove) {
      const isSprinting = sprintHeld && Math.abs(vx) > WALK_MAX_SPEED;
      if (isSprinting) {
         vx *= 1.4; // Boost horizontal speed
         velY = JUMP_VELOCITY * 0.85; // Low profile pounce
      } else {
         velY = JUMP_VELOCITY;
      }
      useAudio.getState().playJump();
    }

    velY += GRAVITY * delta;
    let newY = state.playerY + velY * delta;
    let grounded = false;

    if (newY <= GROUND_Y) {
      if (!state.playerGrounded && Math.abs(velY) > 15) {
         // 🦁 BEAST MECHANIC: WEIGHTY LANDING
         useBattle.getState().addScreenShake(0.08);
      }
      newY = GROUND_Y;
      velY = 0;
      grounded = true;
    }

    // 🎯 PLAYER INSTINCT: Snap-face opponent during attack startup or close proximity
    const distToOpp = Math.abs(state.opponentX - newX);
    const shouldSnapFace = state.playerAttacking || distToOpp < 2.5;
    const faceTowardOpponent = shouldSnapFace ? state.opponentX > newX : state.playerFacingRight;

    const towardOpp = Math.sign(state.opponentX - state.playerX) || 1;
    const wantDodge =
      (justPressed("KeyQ") || justPressed("KeyE") || touchAttacks.includes("dodge")) && !blockMove;

    // 🦁 BEAST MECHANIC: AIR CONTORTION (Air Dodge)
    if (wantDodge) {
      const dir = (keys["KeyE"] ? 1 : keys["KeyQ"] ? -1 : inputX !== 0 ? (Math.sign(inputX) as 1 | -1) : ((-towardOpp) as 1 | -1)) as 1 | -1;
      
      // Allow dodge if grounded OR if we haven't dodged in the air yet this jump
      if (state.startPlayerDodge(dir)) {
        if (!state.playerGrounded) {
           velY = JUMP_VELOCITY * 0.3; // Slight upward pop to 'defy' gravity
        }
        prevKeysRef.current = { ...keys };
        return;
      }
    }

    useBattle.setState({
      playerX: newX,
      playerY: newY,
      playerVelocityX: vx,
      playerVelocityY: velY,
      playerGrounded: grounded,
      playerFacingRight: faceTowardOpponent,
    });

    if (!blockMove) {
      if (justPressed("KeyJ") || justPressed("KeyX") || touchAttacks.includes("punch") || touchAttacks.includes("attack")) state.playerAttack("punch");
      if (justPressed("KeyK") || justPressed("KeyZ") || touchAttacks.includes("kick") || touchAttacks.includes("heavy")) state.playerAttack("kick");
      if (justPressed("KeyL") || justPressed("KeyC") || touchAttacks.includes("special") || touchAttacks.includes("skill")) state.playerAttack("special");
      if (justPressed("KeyR") || touchAttacks.includes("ultimate")) state.playerAttack("ultimate");
      if (justPressed("KeyT")) state.triggerTransformation();
    }

    prevKeysRef.current = { ...keys };
  });

  return null;
}

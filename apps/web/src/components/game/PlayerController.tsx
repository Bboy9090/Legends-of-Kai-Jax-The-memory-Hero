import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useBattle } from "../../lib/stores/useBattle";
import { useAudio } from "../../lib/stores/useAudio";
import { useTouchInput } from "../../lib/stores/useTouchInput";
import { MOVEMENT_TUNING } from "../../game/tuning/movementTuning";
import { getResolvedMovementTuning } from "../../game/characters/shared/FighterCombatProfile";
import type { AttackType } from "../../game/combat/moveData";
import {
  queueBufferedAttack,
  tickBufferedAttack,
  type BufferedAttack,
} from "../../game/combat/inputBuffer";
import { moveTowards } from "../../game/movement/movementMath";

const b = MOVEMENT_TUNING.battle;
const GROUND_Y = b.groundY;

function clampUnitAxis(x: number): number {
  if (!Number.isFinite(x)) return 0;
  const magnitude = Math.min(1, Math.abs(x));
  return magnitude < b.inputDeadzone ? 0 : magnitude * Math.sign(x);
}

export default function PlayerController() {
  const keysRef = useRef<Record<string, boolean>>({});
  const prevKeysRef = useRef<Record<string, boolean>>({});
  const attackBufferRef = useRef<BufferedAttack | null>(null);
  const coyoteTimerRef = useRef(0);
  const jumpBufferTimerRef = useRef(0);

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

    const movement = getResolvedMovementTuning(state.playerFighterId);
    const gravity = movement.gravity;
    const jumpVelocity = movement.jumpVelocity;
    const walkMaxSpeed = movement.walkMaxSpeed;
    const sprintMaxSpeed = movement.sprintMaxSpeed;
    const accel = movement.accel;
    const decel = movement.decel;
    const airControlMult = movement.airControlMult;

    const delta = Math.max(0, rawDelta * state.timeScale);
    const keys = keysRef.current;
    const prev = prevKeysRef.current;
    const justPressed = (code: string) => !!keys[code] && !prev[code];
    const blockHeld = !!(keys["AltLeft"] || keys["AltRight"]);
    useBattle.getState().setPlayerBlockHeld(blockHeld);

    if (state.playerGrounded) coyoteTimerRef.current = movement.coyoteTimeSec;
    else coyoteTimerRef.current = Math.max(0, coyoteTimerRef.current - delta);
    jumpBufferTimerRef.current = Math.max(0, jumpBufferTimerRef.current - delta);

    const touch = useTouchInput.getState();
    const touchAttacks = touch.consumeAttacks();

    let queuedAttack: AttackType | null = null;
    if (
      justPressed("KeyJ") ||
      justPressed("KeyX") ||
      touchAttacks.includes("punch") ||
      touchAttacks.includes("attack")
    ) queuedAttack = "punch";
    else if (
      justPressed("KeyK") ||
      justPressed("KeyZ") ||
      touchAttacks.includes("kick") ||
      touchAttacks.includes("heavy")
    ) queuedAttack = "kick";
    else if (
      justPressed("KeyL") ||
      justPressed("KeyC") ||
      touchAttacks.includes("special") ||
      touchAttacks.includes("skill")
    ) queuedAttack = "special";
    else if (justPressed("KeyR") || touchAttacks.includes("ultimate")) queuedAttack = "ultimate";

    if (queuedAttack) attackBufferRef.current = queueBufferedAttack(queuedAttack);
    attackBufferRef.current = tickBufferedAttack(attackBufferRef.current, delta);

    const jumpPressed =
      justPressed("Space") ||
      justPressed("ArrowUp") ||
      justPressed("KeyW") ||
      touchAttacks.includes("jump");
    if (jumpPressed) jumpBufferTimerRef.current = movement.jumpBufferSec;

    if (state.playerDodgeTimer > 0) {
      prevKeysRef.current = { ...keys };
      return;
    }

    if (state.guardBreakTimer > 0 || state.playerHitStunTimer > 0) {
      let velY = state.playerVelocityY + gravity * delta;
      velY = Math.max(b.terminalVelocity, velY);
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
    if (touch.isJoystickActive) inputX += touch.joystickX;
    inputX = clampUnitAxis(inputX);

    const sprintHeld = !!(keys["ShiftLeft"] || keys["ShiftRight"]);
    const maxSpeed =
      (sprintHeld ? sprintMaxSpeed : walkMaxSpeed) *
      (state.playerGrounded ? 1 : airControlMult);

    const blockMove = blockHeld && state.playerGrounded && !state.playerAttacking;

    let targetVx = inputX * maxSpeed;
    if (state.playerAttacking) targetVx = 0;
    if (blockMove) targetVx *= b.blockMoveSpeedMult;

    let vx = state.playerVelocityX;
    const rate = state.playerAttacking ? b.attackDecel : targetVx === 0 ? decel : accel;
    vx = moveTowards(vx, targetVx, rate * delta);

    const isAtLeftWall = state.playerX <= b.arenaXMin + 0.1;
    const isAtRightWall = state.playerX >= b.arenaXMax - 0.1;
    let velY = state.playerVelocityY;

    const bufferedJump = jumpBufferTimerRef.current > 0;
    const canGroundJump = coyoteTimerRef.current > 0 && !blockMove;

    if (bufferedJump && !state.playerGrounded && (isAtLeftWall || isAtRightWall)) {
      const kickDir = isAtLeftWall ? 1 : -1;
      vx = kickDir * sprintMaxSpeed * movement.wallKickHorizontalMult;
      velY = jumpVelocity * movement.wallKickVerticalMult;
      jumpBufferTimerRef.current = 0;
      coyoteTimerRef.current = 0;
      useAudio.getState().playJump();
      useBattle.getState().triggerScreenShake(1.5);
    } else if (bufferedJump && canGroundJump) {
      const isSprinting = sprintHeld && Math.abs(vx) > walkMaxSpeed;
      if (isSprinting) {
        vx *= movement.pounceHorizontalMult;
        velY = jumpVelocity * movement.pounceVerticalMult;
      } else {
        velY = jumpVelocity;
      }
      jumpBufferTimerRef.current = 0;
      coyoteTimerRef.current = 0;
      useAudio.getState().playJump();
    }

    const fastFallHeld = !!(keys["ArrowDown"] || keys["KeyS"]);
    if (!state.playerGrounded && fastFallHeld && velY < 0) {
      velY -= movement.fastFallAccel * delta;
      velY = Math.max(b.fastFallMaxSpeed, velY);
    }

    velY += gravity * delta;
    velY = Math.max(b.terminalVelocity, velY);
    let newY = state.playerY + velY * delta;
    let grounded = false;

    if (newY <= GROUND_Y) {
      if (!state.playerGrounded && Math.abs(velY) > b.landingImpactVelocity) {
        useBattle.getState().triggerScreenShake(b.landingShakeIntensity);
      }
      newY = GROUND_Y;
      velY = 0;
      grounded = true;
      coyoteTimerRef.current = movement.coyoteTimeSec;
    }

    const dx = vx * delta;
    const newX = Math.max(b.arenaXMin, Math.min(b.arenaXMax, state.playerX + dx));

    const distToOpp = Math.abs(state.opponentX - newX);
    const shouldSnapFace = state.playerAttacking || distToOpp < b.facingSnapDistance;
    const faceTowardOpponent = shouldSnapFace ? state.opponentX > newX : state.playerFacingRight;

    const towardOpp = Math.sign(state.opponentX - state.playerX) || 1;
    const wantDodge =
      (justPressed("KeyQ") || justPressed("KeyE") || touchAttacks.includes("dodge")) &&
      !blockMove;

    if (wantDodge) {
      const dir = (
        keys["KeyE"]
          ? 1
          : keys["KeyQ"]
            ? -1
            : inputX !== 0
              ? Math.sign(inputX)
              : -towardOpp
      ) as 1 | -1;

      if (state.startPlayerDodge(dir)) {
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

    const buffered = attackBufferRef.current;
    if (!blockMove && buffered) {
      const fresh = useBattle.getState();
      let consumed = false;

      if (buffered.type === "punch" && fresh.playerAttacking) {
        consumed = fresh.attemptComboCancel();
      } else if (!fresh.playerAttacking) {
        fresh.playerAttack(buffered.type);
        const after = useBattle.getState();
        consumed = after.playerAttacking && after.playerAttackType === buffered.type;
      }

      if (consumed) attackBufferRef.current = null;
    }

    if (justPressed("KeyT")) state.triggerTransformation();

    prevKeysRef.current = { ...keys };
  });

  return null;
}

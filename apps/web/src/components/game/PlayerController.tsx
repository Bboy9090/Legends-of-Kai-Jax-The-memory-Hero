import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useBattle } from "../../lib/stores/useBattle";
import { useAudio } from "../../lib/stores/useAudio";
import { useTouchInput } from "../../lib/stores/useTouchInput";
import { MOVEMENT_TUNING } from "../../game/tuning/movementTuning";
import type { AttackType } from "../../game/combat/moveData";
import {
  queueBufferedAttack,
  tickBufferedAttack,
  type BufferedAttack,
} from "../../game/combat/inputBuffer";
import { moveTowards } from "../../game/movement/movementMath";

const b = MOVEMENT_TUNING.battle;
const GRAVITY = b.gravity;
const GROUND_Y = b.groundY;
const JUMP_VELOCITY = b.jumpVelocity;

const WALK_MAX_SPEED = b.walkMaxSpeed;
const SPRINT_MAX_SPEED = b.sprintMaxSpeed;
const ACCEL = b.accel;
const DECEL = b.decel;
const AIR_CONTROL_MULT = b.airControlMult;
const GAMEPAD_DEADZONE = 0.18;

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

function firstConnectedGamepad(): Gamepad | null {
  if (typeof navigator === "undefined" || typeof navigator.getGamepads !== "function") return null;
  const pads = navigator.getGamepads();
  for (const pad of pads) {
    if (pad?.connected) return pad;
  }
  return null;
}

export default function PlayerController() {
  const keysRef = useRef<Record<string, boolean>>({});
  const prevKeysRef = useRef<Record<string, boolean>>({});
  const prevPadButtonsRef = useRef<boolean[]>([]);
  const attackBufferRef = useRef<BufferedAttack | null>(null);

  useEffect(() => {
    const keys = keysRef.current;
    const handleDown = (e: KeyboardEvent) => {
      keys[e.code] = true;
    };
    const handleUp = (e: KeyboardEvent) => {
      keys[e.code] = false;
    };
    const clearHeldInput = () => {
      Object.keys(keys).forEach((key) => { keys[key] = false; });
      prevKeysRef.current = {};
      prevPadButtonsRef.current = [];
      attackBufferRef.current = null;
      useTouchInput.getState().releaseJoystick();
      useTouchInput.setState({ pendingAttacks: [] });
      useBattle.getState().setPlayerBlockHeld(false);
    };
    const handleVisibility = () => {
      if (document.hidden) clearHeldInput();
    };
    const handlePadChange = () => {
      // A reconnect may reuse the same browser slot with stale edge state.
      // Reset button history so the next deliberate press is recognized cleanly.
      prevPadButtonsRef.current = [];
      attackBufferRef.current = null;
    };

    window.addEventListener("keydown", handleDown);
    window.addEventListener("keyup", handleUp);
    window.addEventListener("blur", clearHeldInput);
    window.addEventListener("gamepadconnected", handlePadChange);
    window.addEventListener("gamepaddisconnected", handlePadChange);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("keydown", handleDown);
      window.removeEventListener("keyup", handleUp);
      window.removeEventListener("blur", clearHeldInput);
      window.removeEventListener("gamepadconnected", handlePadChange);
      window.removeEventListener("gamepaddisconnected", handlePadChange);
      document.removeEventListener("visibilitychange", handleVisibility);
      clearHeldInput();
    };
  }, []);

  useFrame((_, rawDelta) => {
    const state = useBattle.getState();
    if (state.battlePhase !== "fighting" && state.battlePhase !== "transforming") return;
    if (state.hitStop > 0) return;

    const keys = keysRef.current;
    const prev = prevKeysRef.current;
    const justPressed = (code: string) => keys[code] && !prev[code];

    const pad = firstConnectedGamepad();
    const padPressed = (index: number) => !!pad?.buttons[index]?.pressed;
    const padJustPressed = (index: number) => padPressed(index) && !prevPadButtonsRef.current[index];
    const padAxisXRaw = pad?.axes?.[0] ?? 0;
    const padAxisX = Math.abs(padAxisXRaw) >= GAMEPAD_DEADZONE ? padAxisXRaw : 0;
    const dpadLeft = padPressed(14);
    const dpadRight = padPressed(15);

    const blockHeld = !!(keys["AltLeft"] || keys["AltRight"] || padPressed(4));
    useBattle.getState().setPlayerBlockHeld(blockHeld);

    const delta = rawDelta * state.timeScale;

    const touch = useTouchInput.getState();
    const touchAttacks = touch.consumeAttacks();

    let queuedAttack: AttackType | null = null;
    if (justPressed("KeyJ") || justPressed("KeyX") || padJustPressed(2) || touchAttacks.includes("punch") || touchAttacks.includes("attack")) queuedAttack = "punch";
    else if (justPressed("KeyK") || justPressed("KeyZ") || padJustPressed(3) || touchAttacks.includes("kick") || touchAttacks.includes("heavy")) queuedAttack = "kick";
    else if (justPressed("KeyL") || justPressed("KeyC") || padJustPressed(1) || touchAttacks.includes("special") || touchAttacks.includes("skill")) queuedAttack = "special";
    else if (justPressed("KeyR") || padJustPressed(7) || touchAttacks.includes("ultimate")) queuedAttack = "ultimate";

    if (queuedAttack) attackBufferRef.current = queueBufferedAttack(queuedAttack);
    attackBufferRef.current = tickBufferedAttack(attackBufferRef.current, delta);

    const rememberInputs = () => {
      prevKeysRef.current = { ...keys };
      prevPadButtonsRef.current = pad ? pad.buttons.map((button) => button.pressed) : [];
    };

    if (state.playerDodgeTimer > 0) {
      rememberInputs();
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
      rememberInputs();
      return;
    }

    let inputX = 0;
    if (keys["ArrowLeft"] || keys["KeyA"] || dpadLeft) inputX -= 1;
    if (keys["ArrowRight"] || keys["KeyD"] || dpadRight) inputX += 1;
    inputX += padAxisX;

    if (touch.isJoystickActive) inputX += touch.joystickX;

    inputX = clamp01(Math.abs(inputX)) * Math.sign(inputX || 0);

    const sprintHeld = keys["ShiftLeft"] || keys["ShiftRight"] || padPressed(10);
    const maxSpeed =
      (sprintHeld ? SPRINT_MAX_SPEED : WALK_MAX_SPEED) * (state.playerGrounded ? 1 : AIR_CONTROL_MULT);

    const blockMove = blockHeld && state.playerGrounded && !state.playerAttacking;

    let targetVx = inputX * maxSpeed;
    if (Math.abs(inputX) < 0.08) targetVx = 0;
    if (state.playerAttacking) targetVx = 0;
    if (blockMove) targetVx *= b.blockMoveSpeedMult;

    let vx = state.playerVelocityX;
    const rate = state.playerAttacking ? b.attackDecel : targetVx === 0 ? DECEL : ACCEL;
    vx = moveTowards(vx, targetVx, rate * delta);

    const dx = vx * delta;
    const isAtLeftWall = state.playerX <= b.arenaXMin + 0.1;
    const isAtRightWall = state.playerX >= b.arenaXMax - 0.1;
    const newX = Math.max(b.arenaXMin, Math.min(b.arenaXMax, state.playerX + dx));

    let velY = state.playerVelocityY;
    const wantJump =
      justPressed("Space") ||
      justPressed("ArrowUp") ||
      justPressed("KeyW") ||
      padJustPressed(0) ||
      padJustPressed(12) ||
      touchAttacks.includes("jump");

    if (wantJump && !state.playerGrounded && (isAtLeftWall || isAtRightWall)) {
      const kickDir = isAtLeftWall ? 1 : -1;
      vx = kickDir * SPRINT_MAX_SPEED * 1.5;
      velY = JUMP_VELOCITY * 0.9;
      useAudio.getState().playJump();
      useBattle.getState().triggerScreenShake(1.0);
    } else if (wantJump && state.playerGrounded && !blockMove) {
      const isSprinting = sprintHeld && Math.abs(vx) > WALK_MAX_SPEED;
      if (isSprinting) {
        vx *= 1.4;
        velY = JUMP_VELOCITY * 0.85;
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
        useBattle.getState().triggerScreenShake(0.8);
      }
      newY = GROUND_Y;
      velY = 0;
      grounded = true;
    }

    const distToOpp = Math.abs(state.opponentX - newX);
    const shouldSnapFace = state.playerAttacking || distToOpp < 2.5;
    const faceTowardOpponent = shouldSnapFace ? state.opponentX > newX : state.playerFacingRight;

    const towardOpp = Math.sign(state.opponentX - state.playerX) || 1;
    const wantDodge =
      (justPressed("KeyQ") || justPressed("KeyE") || padJustPressed(5) || touchAttacks.includes("dodge")) && !blockMove;

    if (wantDodge) {
      const dir = (
        keys["KeyE"] ? 1 :
        keys["KeyQ"] ? -1 :
        inputX !== 0 ? Math.sign(inputX) :
        -towardOpp
      ) as 1 | -1;

      if (state.startPlayerDodge(dir)) {
        rememberInputs();
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

    if (justPressed("KeyT") || padJustPressed(6)) state.triggerTransformation();

    rememberInputs();
  });

  return null;
}

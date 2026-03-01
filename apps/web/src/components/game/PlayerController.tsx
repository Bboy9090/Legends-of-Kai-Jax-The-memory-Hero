import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useBattle } from "../../lib/stores/useBattle";
import { useAudio } from "../../lib/stores/useAudio";
import { useTouchInput } from "../../lib/stores/useTouchInput";
import { useKeybinds } from "../../lib/stores/useKeybinds";

const MOVE_SPEED = 6.5;
const GRAVITY = -16;
const GROUND_Y = 0.8;
const JUMP_VELOCITY = 4.2;
export default function PlayerController() {
  const keysRef = useRef<Record<string, boolean>>({});
  const prevKeysRef = useRef<Record<string, boolean>>({});
  const queuedAttackRef = useRef<"punch" | "kick" | "special" | "ultimate" | null>(null);

  useEffect(() => {
    const keys = keysRef.current;
    const handleDown = (e: KeyboardEvent) => {
      keys[e.code] = true;
      const binds = useKeybinds.getState().getBinds();
      const gameKeys = new Set([
        "Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyW", "KeyA", "KeyS", "KeyD",
        "KeyX", "KeyZ", "KeyC", "Escape", "KeyP",
        binds.punch, binds.kick, binds.special, binds.ultimate, binds.transform, binds.jump, binds.pause,
      ]);
      if (gameKeys.has(e.code) && useBattle.getState().battlePhase !== "preRound" && useBattle.getState().battlePhase !== "results") {
        e.preventDefault();
      }
    };
    const handleUp = (e: KeyboardEvent) => { keys[e.code] = false; };
    window.addEventListener("keydown", handleDown, { passive: false });
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

    const delta = Math.min(rawDelta * state.timeScale, 0.05);
    const keys = keysRef.current;
    const prev = prevKeysRef.current;
    const justPressed = (code: string) => keys[code] && !prev[code];

    const touch = useTouchInput.getState();
    const rawTouch = touch.consumeAttacks();
    const touchAttacks = rawTouch.map((t) => {
      if (t === "attack") return "punch";
      if (t === "heavy") return "kick";
      if (t === "skill") return "special";
      if (t === "dodge") return "jump";
      return t;
    });

    const kb = useKeybinds.getState();

    let dx = 0;
    if (keys["ArrowLeft"] || keys["KeyA"]) dx -= MOVE_SPEED * delta;
    if (keys["ArrowRight"] || keys["KeyD"]) dx += MOVE_SPEED * delta;

    if (touch.isJoystickActive) {
      dx += touch.joystickX * MOVE_SPEED * delta;
    }

    let velY = state.playerVelocityY;

    const wantJump = justPressed(kb.jump) || justPressed("ArrowUp") || justPressed("KeyW") || touchAttacks.includes("jump");
    if (wantJump) {
      if (state.playerGrounded) {
        velY = JUMP_VELOCITY;
        useAudio.getState().playJump();
      }
    }

    velY += GRAVITY * delta;
    let newY = state.playerY + velY * delta;
    let grounded = false;

    if (newY <= GROUND_Y) {
      newY = GROUND_Y;
      velY = 0;
      grounded = true;
    }

    const newX = Math.max(-10, Math.min(10, state.playerX + dx));

    useBattle.setState({
      playerX: newX,
      playerY: newY,
      playerVelocityY: velY,
      playerGrounded: grounded,
      playerFacingRight: state.opponentX > newX,
    });

    const priority = (t: typeof queuedAttackRef.current) =>
      t === "ultimate" ? 4 : t === "special" ? 3 : t === "kick" ? 2 : t === "punch" ? 1 : 0;
    const tryAttack = (type: "punch" | "kick" | "special" | "ultimate") => {
      if (state.playerAttacking) {
        if (type === "punch" && state.playerAttackType === "punch") {
          if (state.attemptComboCancel()) return;
        }
        if (priority(type) >= priority(queuedAttackRef.current)) queuedAttackRef.current = type;
      } else {
        state.playerAttack(type);
      }
    };
    if (queuedAttackRef.current && !state.playerAttacking) {
      state.playerAttack(queuedAttackRef.current);
      queuedAttackRef.current = null;
    }
    if (justPressed(kb.punch) || justPressed("KeyX") || touchAttacks.includes("punch")) tryAttack("punch");
    if (justPressed(kb.kick) || justPressed("KeyZ") || touchAttacks.includes("kick")) tryAttack("kick");
    if (justPressed(kb.special) || justPressed("KeyC") || touchAttacks.includes("special")) tryAttack("special");
    if (justPressed(kb.ultimate) || touchAttacks.includes("ultimate")) tryAttack("ultimate");
    if (justPressed(kb.transform)) state.triggerTransformation();
    if (justPressed("Escape") || justPressed(kb.pause)) state.togglePause?.();

    prevKeysRef.current = { ...keys };
  });

  return null;
}

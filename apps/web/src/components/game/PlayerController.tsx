import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useBattle } from "../../lib/stores/useBattle";
import { useAudio } from "../../lib/stores/useAudio";

const MOVE_SPEED = 6;
const GRAVITY = -15;
const GROUND_Y = 0.8;
const JUMP_VELOCITY = 4;

export default function PlayerController() {
  const keysRef = useRef<Record<string, boolean>>({});
  const prevKeysRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const keys = keysRef.current;
    const handleDown = (e: KeyboardEvent) => { keys[e.code] = true; };
    const handleUp = (e: KeyboardEvent) => { keys[e.code] = false; };
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

    const delta = rawDelta * state.timeScale;
    const keys = keysRef.current;
    const prev = prevKeysRef.current;
    const justPressed = (code: string) => keys[code] && !prev[code];

    let dx = 0;
    if (keys["ArrowLeft"] || keys["KeyA"]) dx -= MOVE_SPEED * delta;
    if (keys["ArrowRight"] || keys["KeyD"]) dx += MOVE_SPEED * delta;

    let velY = state.playerVelocityY;

    if (justPressed("Space") || justPressed("ArrowUp") || justPressed("KeyW")) {
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

    if (justPressed("KeyJ") || justPressed("KeyX")) state.playerAttack("punch");
    if (justPressed("KeyK") || justPressed("KeyZ")) state.playerAttack("kick");
    if (justPressed("KeyL") || justPressed("KeyC")) state.playerAttack("special");
    if (justPressed("KeyR")) state.playerAttack("ultimate");
    if (justPressed("KeyT")) state.triggerTransformation();

    prevKeysRef.current = { ...keys };
  });

  return null;
}

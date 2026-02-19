import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useAdventure } from "../../../lib/stores/useAdventure";
import * as THREE from "three";

const WALK_SPEED = 5;
const RUN_SPEED = 10;
const TURN_SPEED = 8;
const ATTACK_COOLDOWNS: Record<string, number> = {
  punch: 0.25,
  kick: 0.35,
  special: 0.5,
  ultimate: 0.8,
};

const _camDir = new THREE.Vector3();
const _camRight = new THREE.Vector3();
const _moveDir = new THREE.Vector3();

export default function AdventurePlayerController() {
  const keysRef = useRef<Record<string, boolean>>({});
  const prevKeysRef = useRef<Record<string, boolean>>({});
  const attackTimerRef = useRef(0);
  const comboTimerRef = useRef(0);

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

  useFrame((state, rawDelta) => {
    const store = useAdventure.getState();
    if (store.isPaused) return;

    const delta = Math.min(rawDelta, 0.05);
    const keys = keysRef.current;
    const prev = prevKeysRef.current;
    const justPressed = (code: string) => keys[code] && !prev[code];

    attackTimerRef.current = Math.max(0, attackTimerRef.current - delta);
    comboTimerRef.current = Math.max(0, comboTimerRef.current - delta);

    if (comboTimerRef.current <= 0 && store.player.combo > 0) {
      useAdventure.setState((s) => ({
        player: { ...s.player, combo: 0 },
      }));
    }

    const isRunning = keys["ShiftLeft"] || keys["ShiftRight"];
    const moveSpeed = isRunning ? RUN_SPEED : WALK_SPEED;

    let inputX = 0;
    let inputZ = 0;
    if (keys["KeyW"] || keys["ArrowUp"]) inputZ -= 1;
    if (keys["KeyS"] || keys["ArrowDown"]) inputZ += 1;
    if (keys["KeyA"] || keys["ArrowLeft"]) inputX -= 1;
    if (keys["KeyD"] || keys["ArrowRight"]) inputX += 1;

    const inputLen = Math.sqrt(inputX * inputX + inputZ * inputZ);
    const hasInput = inputLen > 0.01;

    if (hasInput) {
      inputX /= inputLen;
      inputZ /= inputLen;
    }

    let worldX = 0;
    let worldZ = 0;

    if (hasInput) {
      state.camera.getWorldDirection(_camDir);
      _camDir.y = 0;
      _camDir.normalize();

      _camRight.crossVectors(_camDir, new THREE.Vector3(0, 1, 0)).normalize();

      _moveDir.set(0, 0, 0);
      _moveDir.addScaledVector(_camRight, inputX);
      _moveDir.addScaledVector(_camDir, -inputZ);
      _moveDir.normalize();

      worldX = _moveDir.x;
      worldZ = _moveDir.z;
    }

    const vx = worldX * moveSpeed;
    const vz = worldZ * moveSpeed;

    store.setPlayerVelocity(vx, vz);
    store.setPlayerMoving(hasInput, hasInput && isRunning);

    if (isRunning && hasInput) {
      store.useStamina(15 * delta);
    } else {
      store.regenStamina(20 * delta);
    }

    if (hasInput) {
      const targetRot = Math.atan2(worldX, worldZ);
      const currentRot = store.player.rotY;
      let diff = targetRot - currentRot;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      const newRot = currentRot + diff * Math.min(1, TURN_SPEED * delta);
      store.setPlayerRot(newRot);
    }

    const newX = store.player.posX + vx * delta;
    const newZ = store.player.posZ + vz * delta;
    const boundary = 45;
    store.setPlayerPos(
      THREE.MathUtils.clamp(newX, -boundary, boundary),
      0,
      THREE.MathUtils.clamp(newZ, -boundary, boundary)
    );

    if (attackTimerRef.current <= 0) {
      if (justPressed("KeyJ") || justPressed("KeyX")) {
        store.playerAttack("punch");
        attackTimerRef.current = ATTACK_COOLDOWNS.punch;
        comboTimerRef.current = 1.5;
      } else if (justPressed("KeyK") || justPressed("KeyZ")) {
        store.playerAttack("kick");
        attackTimerRef.current = ATTACK_COOLDOWNS.kick;
        comboTimerRef.current = 1.5;
      } else if (justPressed("KeyL") || justPressed("KeyC")) {
        store.playerAttack("special");
        attackTimerRef.current = ATTACK_COOLDOWNS.special;
        comboTimerRef.current = 2.0;
      } else if (justPressed("KeyR")) {
        store.playerAttack("ultimate");
        attackTimerRef.current = ATTACK_COOLDOWNS.ultimate;
        comboTimerRef.current = 2.5;
      }
    }

    if (store.player.isAttacking && attackTimerRef.current <= 0) {
      store.clearAttack();
    }

    if (justPressed("Escape") || justPressed("KeyP")) {
      store.togglePause();
    }

    prevKeysRef.current = { ...keys };
  });

  return null;
}

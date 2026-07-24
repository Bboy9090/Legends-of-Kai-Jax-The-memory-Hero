import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useBattle } from "../../lib/stores/useBattle";
import { BattleCombatState } from "../../game/combat/stateEnums";
import { detRand11, type BattleCameraMode } from "../../lib/cameraModes";
import { useAccessibility } from "../../lib/stores/useAccessibility";
import { CAMERA_TUNING } from "../../game/tuning/cameraTuning";

const bt = CAMERA_TUNING.battle;
const BASE_HEIGHT = bt.baseHeight;
const BASE_DIST = bt.baseDist;
const CAM_LERP = bt.camLerp;
const SHAKE_SEED_BASE = bt.shakeSeedBase;

function resolveBattleCameraMode(s: {
  playerAttacking: boolean;
  opponentAttacking: boolean;
  playerCombatState: BattleCombatState;
}): BattleCameraMode {
  const inTightCombat =
    s.playerAttacking ||
    s.opponentAttacking ||
    s.playerCombatState === BattleCombatState.BLOCKING ||
    s.playerCombatState === BattleCombatState.PARRY_WINDOW ||
    s.playerCombatState === BattleCombatState.HITSTUN ||
    s.playerCombatState === BattleCombatState.GUARD_BROKEN;

  if (inTightCombat) return "combat";
  if (s.playerCombatState === BattleCombatState.DODGING) return "lockOn";
  return "exploration";
}

export default function BattleCamera() {
  const { camera } = useThree();
  const reduceMotion = useAccessibility((s) => s.reduceMotion);
  const targetRef = useRef(new THREE.Vector3());
  const posRef = useRef(new THREE.Vector3(0, BASE_HEIGHT, BASE_DIST));
  const frameRef = useRef(0);
  // Smoothed camera multipliers. MUST live at component scope — calling useRef
  // inside the useFrame callback is an invalid hook call that breaks the frame
  // loop (the whole battle scene renders black as a result).
  const currentParams = useRef({
    distMul: 1.12,
    heightMul: 1.05,
    targetYOffset: 1.45,
    sideBias: 0,
  });

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    frameRef.current += 1;
    const b = useBattle.getState();
    const { playerX, playerY, opponentX, opponentY, screenShake, playerAttacking, opponentAttacking, playerCombatState } = b;

    const mode = resolveBattleCameraMode({
      playerAttacking,
      opponentAttacking,
      playerCombatState,
    });

    const playerVelX = b.playerVelocityX || 0;
    const playerVelY = b.playerVelocityY || 0;
    const combinedVel = Math.sqrt(playerVelX * playerVelX + playerVelY * playerVelY);

    const midX = (playerX + opponentX) * 0.5;
    const midY = (playerY + opponentY) * 0.5;
    const separation = Math.max(3, Math.min(bt.separationMax, Math.abs(playerX - opponentX)));

    // 🎬 SMOOTH MODE TRANSITIONS
    const targetParams = {
      distMul: 1.12,
      heightMul: 1.05,
      targetYOffset: 1.45,
      sideBias: 0
    };

    if (mode === "combat") {
      targetParams.distMul = 0.90;
      targetParams.heightMul = 0.95;
      targetParams.targetYOffset = 1.15;
      targetParams.sideBias = (playerX - opponentX) * 0.15;
    } else if (mode === "lockOn") {
      targetParams.distMul = 0.85;
      targetParams.heightMul = 0.90;
      targetParams.targetYOffset = 1.0;
      targetParams.sideBias = (playerX - opponentX) * 0.22;
    }

    const lerpSpeed = mode === "exploration" ? 2.5 : 5.0;
    currentParams.current.distMul = THREE.MathUtils.lerp(currentParams.current.distMul, targetParams.distMul, lerpSpeed * delta);
    currentParams.current.heightMul = THREE.MathUtils.lerp(currentParams.current.heightMul, targetParams.heightMul, lerpSpeed * delta);
    currentParams.current.targetYOffset = THREE.MathUtils.lerp(currentParams.current.targetYOffset, targetParams.targetYOffset, lerpSpeed * delta);
    currentParams.current.sideBias = THREE.MathUtils.lerp(currentParams.current.sideBias, targetParams.sideBias, lerpSpeed * delta);

    const { distMul, heightMul, targetYOffset, sideBias } = currentParams.current;

    // 🎬 CINEMATIC LEADING
    const leadFactor = 0.8;
    const leadX = playerVelX * leadFactor * (mode === "exploration" ? 1.2 : 0.6);
    
    const dynamicDist = (BASE_DIST + separation * bt.separationDistScale) * distMul;
    const dynamicHeight = (BASE_HEIGHT + separation * bt.separationHeightScale) * heightMul;

    // 🎬 TARGETING: Lead the camera with character momentum
    targetRef.current.lerp(
      new THREE.Vector3(midX + sideBias + leadX, midY + targetYOffset, 0),
      0.15 // High-lag look-at for weight
    );

    const idealPos = new THREE.Vector3(midX + sideBias * 0.5, dynamicHeight, dynamicDist);
    const lerpRate = mode === "combat" ? CAM_LERP * 1.5 : CAM_LERP;
    posRef.current.lerp(idealPos, lerpRate * delta);

    // 🎬 DYNAMIC FOV: Zoom in during impact/combat
    const fovBase = 45;
    const hitStop = b.hitStop || 0; // Fix ReferenceError
    const fovImpact = (hitStop > 0 ? -5 : 0) + (combinedVel > 15 ? 8 : 0);
    const targetFov = fovBase + fovImpact + (separation * 0.8);
    camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, 0.1);
    camera.updateProjectionMatrix();

    let shakeScale = 1;
    if (mode === "combat") shakeScale = bt.shakeScaleCombat;
    if (mode === "lockOn") shakeScale = bt.shakeScaleLockOn;
    if (reduceMotion) shakeScale *= bt.reduceMotionShakeMult;

    let shakeX = 0;
    let shakeY = 0;
    if (screenShake > 0.01) {
      const intensity = Math.min(1, screenShake) * shakeScale;
      const t = Math.floor(state.clock.elapsedTime * 60) + frameRef.current;
      shakeX = detRand11(t + SHAKE_SEED_BASE) * intensity * 0.16;
      shakeY = detRand11(t + SHAKE_SEED_BASE + 17) * intensity * 0.11;
    }

    camera.position.set(posRef.current.x + shakeX, posRef.current.y + shakeY, posRef.current.z);
    camera.lookAt(targetRef.current);
  });

  return null;
}

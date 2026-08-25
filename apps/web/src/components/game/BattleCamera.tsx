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
  const targetRef = useRef(new THREE.Vector3(0, 1.2, 0));
  const posRef = useRef(new THREE.Vector3(0, BASE_HEIGHT, BASE_DIST));
  const frameRef = useRef(0);
  const currentParams = useRef({
    distMul: 1.12,
    heightMul: 1.05,
    targetYOffset: 1.25,
  });

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    frameRef.current += 1;
    const b = useBattle.getState();
    const {
      playerX,
      playerY,
      opponentX,
      opponentY,
      screenShake,
      playerAttacking,
      opponentAttacking,
      playerCombatState,
    } = b;

    const mode = resolveBattleCameraMode({
      playerAttacking,
      opponentAttacking,
      playerCombatState,
    });

    const dx = opponentX - playerX;
    const dy = opponentY - playerY;
    const horizontalSeparation = Math.abs(dx);
    const fullSeparation = Math.sqrt(dx * dx + dy * dy);
    const separation = THREE.MathUtils.clamp(fullSeparation, 3, bt.separationMax);

    // Readability-first rule: the midpoint between both fighters is sacred.
    // Do not lead with velocity or bias toward either fighter; those cinematic
    // offsets were causing the camera to abandon the playable action.
    const midX = (playerX + opponentX) * 0.5;
    const midY = (playerY + opponentY) * 0.5;

    const targetParams = {
      distMul: 1.16,
      heightMul: 1.04,
      targetYOffset: 1.25,
    };

    // Combat should not zoom *into* the action. Give both silhouettes breathing
    // room so attacks, dodges, and knockback remain readable.
    if (mode === "combat") {
      targetParams.distMul = 1.12;
      targetParams.heightMul = 1.02;
      targetParams.targetYOffset = 1.2;
    } else if (mode === "lockOn") {
      targetParams.distMul = 1.14;
      targetParams.heightMul = 1.02;
      targetParams.targetYOffset = 1.2;
    }

    const paramK = 1 - Math.exp(-(mode === "exploration" ? 3.5 : 5.0) * delta);
    currentParams.current.distMul = THREE.MathUtils.lerp(
      currentParams.current.distMul,
      targetParams.distMul,
      paramK,
    );
    currentParams.current.heightMul = THREE.MathUtils.lerp(
      currentParams.current.heightMul,
      targetParams.heightMul,
      paramK,
    );
    currentParams.current.targetYOffset = THREE.MathUtils.lerp(
      currentParams.current.targetYOffset,
      targetParams.targetYOffset,
      paramK,
    );

    const { distMul, heightMul, targetYOffset } = currentParams.current;

    // Horizontal spacing drives the majority of zoom-out. Vertical knockback
    // also contributes so launched fighters remain visible.
    const dynamicDist =
      (BASE_DIST + horizontalSeparation * Math.max(0.5, bt.separationDistScale) + Math.abs(dy) * 0.18) *
      distMul;
    const dynamicHeight =
      (BASE_HEIGHT + separation * Math.max(0.14, bt.separationHeightScale)) * heightMul;

    const idealTarget = new THREE.Vector3(midX, midY + targetYOffset, 0);
    const lookK = 1 - Math.exp(-8 * delta);
    targetRef.current.lerp(idealTarget, lookK);

    const idealPos = new THREE.Vector3(midX, dynamicHeight, dynamicDist);
    const posK = 1 - Math.exp(-CAM_LERP * delta);
    posRef.current.lerp(idealPos, posK);

    // Keep FOV predictable. Wide enough for separation, never so wide that
    // fighters become tiny, and never punch in during hit-stop.
    const targetFov = THREE.MathUtils.clamp(46 + separation * 0.45, 46, 56);
    if ("fov" in camera && typeof camera.fov === "number") {
      camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, 1 - Math.exp(-6 * delta));
      camera.updateProjectionMatrix();
    }

    let shakeScale = mode === "combat" ? bt.shakeScaleCombat * 0.55 : 0.45;
    if (mode === "lockOn") shakeScale = bt.shakeScaleLockOn * 0.5;
    if (reduceMotion) shakeScale *= bt.reduceMotionShakeMult;

    let shakeX = 0;
    let shakeY = 0;
    if (screenShake > 0.01) {
      const intensity = Math.min(1, screenShake) * shakeScale;
      const t = Math.floor(state.clock.elapsedTime * 60) + frameRef.current;
      shakeX = detRand11(t + SHAKE_SEED_BASE) * intensity * 0.1;
      shakeY = detRand11(t + SHAKE_SEED_BASE + 17) * intensity * 0.07;
    }

    camera.position.set(
      posRef.current.x + shakeX,
      posRef.current.y + shakeY,
      posRef.current.z,
    );
    camera.lookAt(targetRef.current);
  });

  return null;
}

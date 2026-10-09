import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useAdventure } from "../../../lib/stores/useAdventure";
import { CombatState } from "../../../game/combat/stateEnums";
import * as THREE from "three";
import { detRand11, type AdventureCameraMode } from "../../../lib/cameraModes";
import { useAccessibility } from "../../../lib/stores/useAccessibility";
import { CAMERA_TUNING } from "../../../game/tuning/cameraTuning";

const adv = CAMERA_TUNING.adventure;
const CAM_HEIGHT = adv.camHeight;
const CAM_DIST = adv.camDist;
const CAM_LERP = adv.camLerp;
const SHAKE_SEED_BASE = adv.shakeSeedBase;
const LOOK_SMOOTH = adv.lookSmooth;
const MODE_BLEND = adv.modeBlend;

function resolveAdventureCameraMode(p: {
  isCombat: boolean;
  autoTargetId: string | null;
  combatState: CombatState;
}): AdventureCameraMode {
  if (p.autoTargetId) return "lockOn";
  if (p.isCombat || p.combatState !== CombatState.FREE) return "combat";
  return "exploration";
}

export default function AdventureCamera() {
  const { camera } = useThree();
  const reduceMotion = useAccessibility((s) => s.reduceMotion);
  const targetRef = useRef(new THREE.Vector3());
  const idealLookRef = useRef(new THREE.Vector3());
  const smoothDistRef = useRef(CAM_DIST);
  const smoothHeightRef = useRef(CAM_HEIGHT);
  const headingRef = useRef(Math.PI);
  const posRef = useRef(new THREE.Vector3(0, CAM_HEIGHT, CAM_DIST));
  const frameRef = useRef(0);

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    frameRef.current += 1;
    const { player, enemies } = useAdventure.getState();

    const aliveEnemies = enemies.filter((e) => !e.isDead);
    const autoTarget = player.autoTargetId
      ? aliveEnemies.find((e) => e.id === player.autoTargetId)
      : null;

    const nearest = aliveEnemies
      .map((e) => {
        const dx = e.posX - player.posX;
        const dz = e.posZ - player.posZ;
        return { e, d2: dx * dx + dz * dz };
      })
      .sort((a, b) => a.d2 - b.d2)[0];

    const mode = resolveAdventureCameraMode({
      isCombat: player.isCombat,
      autoTargetId: player.autoTargetId,
      combatState: player.combatState,
    });

    // Over-the-shoulder framing: exploration follows the character's facing
    // direction; combat blends toward the active/nearest target. This makes the
    // street read like an action RPG instead of a fixed-axis diorama.
    let focusEnemy = null as (typeof autoTarget) | null;
    if (mode === "lockOn" && autoTarget) focusEnemy = autoTarget;
    else if (mode === "combat" && nearest && nearest.d2 < 18 * 18) focusEnemy = nearest.e;

    let desiredHeading = player.rotY;
    if (focusEnemy) {
      desiredHeading = Math.atan2(
        focusEnemy.posX - player.posX,
        focusEnemy.posZ - player.posZ,
      );
    }
    let headingDelta = desiredHeading - headingRef.current;
    while (headingDelta > Math.PI) headingDelta -= Math.PI * 2;
    while (headingDelta < -Math.PI) headingDelta += Math.PI * 2;
    const headingK = 1 - Math.exp(-(mode === "exploration" ? 7.5 : 9) * delta);
    headingRef.current += headingDelta * headingK;

    const forwardX = Math.sin(headingRef.current);
    const forwardZ = Math.cos(headingRef.current);
    const lookAhead = mode === "exploration" ? 2.4 : 1.5;
    const baseLookX = player.posX + forwardX * lookAhead;
    const baseLookZ = player.posZ + forwardZ * lookAhead;
    const enemyBlend = focusEnemy ? (mode === "lockOn" ? 0.34 : 0.24) : 0;
    const lookX = focusEnemy ? THREE.MathUtils.lerp(baseLookX, focusEnemy.posX, enemyBlend) : baseLookX;
    const lookZ = focusEnemy ? THREE.MathUtils.lerp(baseLookZ, focusEnemy.posZ, enemyBlend) : baseLookZ;
    const lookY = player.posY + (mode === "exploration" ? 1.45 : 1.25);

    idealLookRef.current.set(lookX, lookY, lookZ);
    const lookK = 1 - Math.exp(-Math.max(4, LOOK_SMOOTH) * delta);
    targetRef.current.lerp(idealLookRef.current, lookK);

    let dynamicDist = CAM_DIST;
    let dynamicHeight = CAM_HEIGHT;

    const nearbyCount = aliveEnemies.filter((e) => {
      const dx = player.posX - e.posX;
      const dz = player.posZ - e.posZ;
      return Math.sqrt(dx * dx + dz * dz) < adv.nearbyEnemyRadius;
    }).length;

    if (nearbyCount >= adv.nearbyCrowdMin) {
      dynamicDist += Math.max(adv.crowdDistBonus, 2.5);
      dynamicHeight += Math.max(adv.crowdHeightBonus, 1.0);
    }

    if (mode === "combat" || mode === "lockOn") {
      dynamicDist += Math.max(adv.combatDistBonus, 1.5);
      dynamicHeight += Math.max(adv.combatHeightBonus, 0.45);
    }

    if (focusEnemy) {
      const dx = focusEnemy.posX - player.posX;
      const dz = focusEnemy.posZ - player.posZ;
      const enemyDistance = Math.sqrt(dx * dx + dz * dz);
      dynamicDist += THREE.MathUtils.clamp(enemyDistance * 0.18, 0, 2.5);
    }

    const hpPct = player.maxHealth > 0 ? player.health / player.maxHealth : 1;
    if (hpPct < adv.lowHpThreshold) {
      dynamicDist += adv.lowHpDistBonus;
      dynamicHeight += adv.lowHpHeightBonus;
    }

    const modeK = 1 - Math.exp(-Math.max(3, MODE_BLEND) * delta);
    smoothDistRef.current = THREE.MathUtils.lerp(
      smoothDistRef.current,
      dynamicDist,
      modeK,
    );
    smoothHeightRef.current = THREE.MathUtils.lerp(
      smoothHeightRef.current,
      dynamicHeight,
      modeK,
    );

    const cameraForwardX = Math.sin(headingRef.current);
    const cameraForwardZ = Math.cos(headingRef.current);
    const cameraRightX = Math.cos(headingRef.current);
    const cameraRightZ = -Math.sin(headingRef.current);
    const shoulder = mode === "exploration" ? 0.55 : 0.8;

    const idealPos = new THREE.Vector3(
      player.posX - cameraForwardX * smoothDistRef.current + cameraRightX * shoulder,
      player.posY + smoothHeightRef.current,
      player.posZ - cameraForwardZ * smoothDistRef.current + cameraRightZ * shoulder,
    );

    const cameraK = 1 - Math.exp(-Math.max(3.5, CAM_LERP * 0.8) * delta);
    posRef.current.lerp(idealPos, cameraK);

    if ("fov" in camera && typeof camera.fov === "number") {
      const targetFov = mode === "exploration" ? 47 : mode === "lockOn" ? 50 : 49;
      camera.fov = THREE.MathUtils.lerp(
        camera.fov,
        targetFov,
        1 - Math.exp(-5 * delta),
      );
      camera.updateProjectionMatrix();
    }

    let shakeScale = mode === "exploration" ? 0.32 : 0.38;
    if (reduceMotion) shakeScale *= adv.reduceMotionShakeMult;

    let shakeX = 0;
    let shakeY = 0;
    if (player.screenShake > 0.01) {
      const intensity = Math.min(1, player.screenShake) * shakeScale;
      const t = Math.floor(state.clock.elapsedTime * 60) + frameRef.current;
      shakeX = detRand11(t + SHAKE_SEED_BASE) * intensity * 0.08;
      shakeY = detRand11(t + SHAKE_SEED_BASE + 31) * intensity * 0.055;
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

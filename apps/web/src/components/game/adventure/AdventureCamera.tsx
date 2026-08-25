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
  const smoothDistRef = useRef(CAM_DIST + 1.5);
  const smoothHeightRef = useRef(CAM_HEIGHT + 0.5);
  const posRef = useRef(new THREE.Vector3(0, CAM_HEIGHT + 0.5, CAM_DIST + 1.5));
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

    // Player-first framing. Targets influence the look point, but never enough
    // to drag the player's own character off-screen.
    let focusEnemy = null as (typeof autoTarget) | null;
    if (mode === "lockOn" && autoTarget) focusEnemy = autoTarget;
    else if (mode === "combat" && nearest && nearest.d2 < 18 * 18) focusEnemy = nearest.e;

    let enemyBlend = 0;
    if (focusEnemy) enemyBlend = mode === "lockOn" ? 0.28 : 0.2;

    const lookX = focusEnemy
      ? THREE.MathUtils.lerp(player.posX, focusEnemy.posX, enemyBlend)
      : player.posX;
    const lookZ = focusEnemy
      ? THREE.MathUtils.lerp(player.posZ, focusEnemy.posZ, enemyBlend)
      : player.posZ;
    const lookY = player.posY + (mode === "exploration" ? 1.35 : 1.2);

    idealLookRef.current.set(lookX, lookY, lookZ);
    const lookK = 1 - Math.exp(-Math.max(4, LOOK_SMOOTH) * delta);
    targetRef.current.lerp(idealLookRef.current, lookK);

    let dynamicDist = CAM_DIST + 1.5;
    let dynamicHeight = CAM_HEIGHT + 0.5;

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

    // Fixed world-axis follow keeps movement controls predictable and prevents
    // character rotation from whipping the camera sideways.
    const idealPos = new THREE.Vector3(
      player.posX,
      player.posY + smoothHeightRef.current,
      player.posZ + smoothDistRef.current,
    );

    const cameraK = 1 - Math.exp(-Math.max(3.5, CAM_LERP * 0.8) * delta);
    posRef.current.lerp(idealPos, cameraK);

    if ("fov" in camera && typeof camera.fov === "number") {
      const targetFov = mode === "exploration" ? 50 : 52;
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

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useAdventure } from "../../../lib/stores/useAdventure";
import { CombatState } from "../../../lib/combatSystems";
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

    const mode = resolveAdventureCameraMode({
      isCombat: player.isCombat,
      autoTargetId: player.autoTargetId,
      combatState: player.combatState,
    });

    let lookX = player.posX;
    let lookZ = player.posZ;
    let blend = 0.35;
    if (mode === "lockOn" && autoTarget) {
      blend = 0.55;
      lookX = player.posX * (1 - blend) + autoTarget.posX * blend;
      lookZ = player.posZ * (1 - blend) + autoTarget.posZ * blend;
    } else if (mode === "combat") {
      const nearest = aliveEnemies
        .map((e) => {
          const dx = e.posX - player.posX;
          const dz = e.posZ - player.posZ;
          return { e, d2: dx * dx + dz * dz };
        })
        .sort((a, b) => a.d2 - b.d2)[0];
      if (nearest && nearest.d2 < 20 * 20) {
        blend = 0.38;
        lookX = player.posX * (1 - blend) + nearest.e.posX * blend;
        lookZ = player.posZ * (1 - blend) + nearest.e.posZ * blend;
      }
    }

    const lookY = player.posY + (mode === "exploration" ? 1.35 : mode === "combat" ? 1.15 : 1.25);
    idealLookRef.current.set(lookX, lookY, lookZ);
    const lookK = 1 - Math.exp(-LOOK_SMOOTH * delta);
    targetRef.current.lerp(idealLookRef.current, lookK);

    let dynamicDist = CAM_DIST;
    let dynamicHeight = CAM_HEIGHT;
    const nearbyCount = aliveEnemies.filter((e) => {
      const dx = player.posX - e.posX;
      const dz = player.posZ - e.posZ;
      return Math.sqrt(dx * dx + dz * dz) < adv.nearbyEnemyRadius;
    }).length;

    if (nearbyCount >= adv.nearbyCrowdMin) {
      dynamicDist = CAM_DIST + adv.crowdDistBonus;
      dynamicHeight = CAM_HEIGHT + adv.crowdHeightBonus;
    }

    if (mode === "combat" || mode === "lockOn") {
      dynamicDist += adv.combatDistBonus;
      dynamicHeight += adv.combatHeightBonus;
    }

    const hpPct = player.health / player.maxHealth;
    if (hpPct < adv.lowHpThreshold) {
      dynamicDist += adv.lowHpDistBonus;
      dynamicHeight += adv.lowHpHeightBonus;
    }

    const modeK = 1 - Math.exp(-MODE_BLEND * delta);
    smoothDistRef.current = THREE.MathUtils.lerp(smoothDistRef.current, dynamicDist, modeK);
    smoothHeightRef.current = THREE.MathUtils.lerp(smoothHeightRef.current, dynamicHeight, modeK);

    const side = mode === "lockOn" ? 0.55 : mode === "combat" ? 0.42 : 0.4;
    const idealPos = new THREE.Vector3(
      player.posX - Math.sin(player.rotY) * smoothDistRef.current * side,
      player.posY + smoothHeightRef.current,
      player.posZ + smoothDistRef.current
    );

    const lerp = mode === "exploration" ? CAM_LERP : CAM_LERP * 1.12;
    posRef.current.lerp(idealPos, lerp * delta);

    let shakeScale = 1;
    if (mode === "combat" || mode === "lockOn") shakeScale = 0.65;
    if (reduceMotion) shakeScale *= adv.reduceMotionShakeMult;

    let shakeX = 0;
    let shakeY = 0;
    if (player.screenShake > 0.01) {
      const intensity = player.screenShake * shakeScale;
      const t = Math.floor(state.clock.elapsedTime * 60) + frameRef.current;
      shakeX = detRand11(t + SHAKE_SEED_BASE) * intensity * 0.14;
      shakeY = detRand11(t + SHAKE_SEED_BASE + 31) * intensity * 0.09;
    }

    camera.position.set(
      posRef.current.x + shakeX,
      posRef.current.y + shakeY,
      posRef.current.z
    );
    camera.lookAt(targetRef.current);
  });

  return null;
}

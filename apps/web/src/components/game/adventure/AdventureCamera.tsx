import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useAdventure } from "../../../lib/stores/useAdventure";
import { CombatState } from "../../../lib/combatSystems";
import * as THREE from "three";
import { detRand11 } from "../../../lib/cameraModes";
import { useAccessibility } from "../../../lib/stores/useAccessibility";

const CAM_HEIGHT = 4.5;
const CAM_DIST = 6;
const CAM_LERP = 5;
const SHAKE_SEED_BASE = 23011;

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
    targetRef.current.set(lookX, lookY, lookZ);

    let dynamicDist = CAM_DIST;
    let dynamicHeight = CAM_HEIGHT;
    const nearbyCount = aliveEnemies.filter((e) => {
      const dx = player.posX - e.posX;
      const dz = player.posZ - e.posZ;
      return Math.sqrt(dx * dx + dz * dz) < 12;
    }).length;

    if (nearbyCount >= 3) {
      dynamicDist = CAM_DIST + 2;
      dynamicHeight = CAM_HEIGHT + 1;
    }

    if (mode === "combat" || mode === "lockOn") {
      dynamicDist += 0.75;
      dynamicHeight += 0.35;
    }

    const hpPct = player.health / player.maxHealth;
    if (hpPct < 0.3) {
      dynamicDist += 0.5;
      dynamicHeight += 0.3;
    }

    const side = mode === "lockOn" ? 0.55 : mode === "combat" ? 0.42 : 0.4;
    const idealPos = new THREE.Vector3(
      player.posX - Math.sin(player.rotY) * dynamicDist * side,
      player.posY + dynamicHeight,
      player.posZ + dynamicDist
    );

    const lerp = mode === "exploration" ? CAM_LERP : CAM_LERP * 1.12;
    posRef.current.lerp(idealPos, lerp * delta);

    let shakeScale = 1;
    if (mode === "combat" || mode === "lockOn") shakeScale = 0.65;
    if (reduceMotion) shakeScale *= 0.2;

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

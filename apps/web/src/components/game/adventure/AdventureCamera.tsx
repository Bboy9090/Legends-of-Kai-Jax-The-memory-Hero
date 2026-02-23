import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useAdventure } from "../../../lib/stores/useAdventure";
import * as THREE from "three";

const CAM_HEIGHT = 4.5;
const CAM_DIST = 6;
const CAM_LERP = 5;

export default function AdventureCamera() {
  const { camera } = useThree();
  const targetRef = useRef(new THREE.Vector3());
  const posRef = useRef(new THREE.Vector3(0, CAM_HEIGHT, CAM_DIST));

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const { player, enemies } = useAdventure.getState();

    const aliveEnemies = enemies.filter((e) => !e.isDead);
    const autoTarget = player.autoTargetId
      ? aliveEnemies.find((e) => e.id === player.autoTargetId)
      : null;

    let lookX = player.posX;
    let lookZ = player.posZ;

    if (autoTarget) {
      lookX = player.posX * 0.65 + autoTarget.posX * 0.35;
      lookZ = player.posZ * 0.65 + autoTarget.posZ * 0.35;
    }

    targetRef.current.set(lookX, player.posY + 1.2, lookZ);

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

    const hpPct = player.health / player.maxHealth;
    if (hpPct < 0.3) {
      dynamicDist += 0.5;
      dynamicHeight += 0.3;
    }

    const idealPos = new THREE.Vector3(
      player.posX - Math.sin(player.rotY) * dynamicDist * 0.4,
      player.posY + dynamicHeight,
      player.posZ + dynamicDist
    );

    posRef.current.lerp(idealPos, CAM_LERP * delta);

    let shakeX = 0;
    let shakeY = 0;
    if (player.screenShake > 0.01) {
      const intensity = player.screenShake;
      shakeX = (Math.random() - 0.5) * intensity * 0.15;
      shakeY = (Math.random() - 0.5) * intensity * 0.1;
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

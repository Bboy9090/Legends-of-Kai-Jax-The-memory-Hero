import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useBattle } from "../../lib/stores/useBattle";

const BASE_HEIGHT = 4.2;
const BASE_DIST = 9.5;
const CAM_LERP = 6;

export default function BattleCamera() {
  const { camera } = useThree();
  const targetRef = useRef(new THREE.Vector3());
  const posRef = useRef(new THREE.Vector3(0, BASE_HEIGHT, BASE_DIST));

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const { playerX, playerY, opponentX, opponentY, screenShake } = useBattle.getState();

    // Midpoint focus so both fighters remain readable.
    const midX = (playerX + opponentX) * 0.5;
    const midY = (playerY + opponentY) * 0.5;
    const separation = Math.min(16, Math.abs(playerX - opponentX));

    const dynamicDist = BASE_DIST + separation * 0.35;
    const dynamicHeight = BASE_HEIGHT + separation * 0.12;

    targetRef.current.set(midX, midY + 1.15, 0);

    // Camera sits slightly behind the Z plane for depth/post FX.
    const idealPos = new THREE.Vector3(midX, dynamicHeight, dynamicDist);
    posRef.current.lerp(idealPos, CAM_LERP * delta);

    // Deterministic-ish shake (still uses Math.random like existing AdventureCamera).
    let shakeX = 0;
    let shakeY = 0;
    if (screenShake > 0.01) {
      const intensity = Math.min(1, screenShake);
      shakeX = (Math.random() - 0.5) * intensity * 0.18;
      shakeY = (Math.random() - 0.5) * intensity * 0.12;
    }

    camera.position.set(posRef.current.x + shakeX, posRef.current.y + shakeY, posRef.current.z);
    camera.lookAt(targetRef.current);
  });

  return null;
}


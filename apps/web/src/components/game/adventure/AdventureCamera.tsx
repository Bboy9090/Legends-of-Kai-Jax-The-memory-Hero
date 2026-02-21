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
    const { player } = useAdventure.getState();

    targetRef.current.set(player.posX, player.posY + 1.2, player.posZ);

    const idealPos = new THREE.Vector3(
      player.posX - Math.sin(player.rotY) * CAM_DIST * 0.4,
      player.posY + CAM_HEIGHT,
      player.posZ + CAM_DIST
    );

    posRef.current.lerp(idealPos, CAM_LERP * delta);
    camera.position.copy(posRef.current);
    camera.lookAt(targetRef.current);
  });

  return null;
}

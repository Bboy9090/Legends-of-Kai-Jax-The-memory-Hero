import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useBattle } from "../../lib/stores/useBattle";
import * as THREE from "three";

/** Camera height above ground (Y). Higher = more top-down, easier to see both fighters. */
const CAM_HEIGHT = 5.5;
/** Distance from action (Z). Further = wider view, both fighters stay in frame. */
const CAM_DISTANCE = 8;
/** Smooth follow speed. Higher = snappier, lower = more floaty. */
const CAM_LERP = 4;
/** Look-at height for the action (roughly character chest level). */
const LOOK_AT_Y = 2;

export default function BattleCamera() {
  const { camera } = useThree();
  const posRef = useRef(new THREE.Vector3(0, CAM_HEIGHT, CAM_DISTANCE));
  const targetRef = useRef(new THREE.Vector3(0, LOOK_AT_Y, 0));

  useFrame((_, delta) => {
    const { playerX, opponentX, screenShake } = useBattle.getState();
    const midX = (playerX + opponentX) / 2;

    // Ideal camera position: centered on action, pulled back for wide view
    const idealX = midX;
    const idealZ = CAM_DISTANCE;
    const idealY = CAM_HEIGHT;

    targetRef.current.lerp(
      new THREE.Vector3(midX, LOOK_AT_Y, 0),
      CAM_LERP * Math.min(delta, 0.05)
    );
    posRef.current.lerp(
      new THREE.Vector3(idealX, idealY, idealZ),
      CAM_LERP * Math.min(delta, 0.05)
    );

    // Apply screen shake to camera position
    let shakeX = 0;
    let shakeY = 0;
    if (screenShake > 0.01) {
      const intensity = screenShake * 0.08;
      shakeX = (Math.random() - 0.5) * intensity;
      shakeY = (Math.random() - 0.5) * intensity * 0.6;
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

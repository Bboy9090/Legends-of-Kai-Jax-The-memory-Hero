import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useBattle } from "../../lib/stores/useBattle";

export default function EffectManager() {
  const {
    playerHealth,
    opponentHealth,
    playerAttacking,
    opponentAttacking,
    playerAttackType,
    opponentAttackType,
    timeScale
  } = useBattle();

  const prevPlayerHealthRef = useRef(100);
  const prevOpponentHealthRef = useRef(100);
  const flashIntensityRef = useRef(0);
  const shakeIntensityRef = useRef(0);
  const prevPlayerAttackRef = useRef(false);
  const prevOpponentAttackRef = useRef(false);

  useFrame((state, delta) => {
    const scaledDelta = delta * timeScale;

    // SCREEN FLASH on damage!
    if (playerHealth < prevPlayerHealthRef.current) {
      const damage = prevPlayerHealthRef.current - playerHealth;
      flashIntensityRef.current = Math.min(1.0, damage / 20); // Scale flash with damage
      shakeIntensityRef.current = damage / 10; // Camera shake too!
    }
    prevPlayerHealthRef.current = playerHealth;

    if (opponentHealth < prevOpponentHealthRef.current) {
      const damage = prevOpponentHealthRef.current - opponentHealth;
      flashIntensityRef.current = Math.min(1.0, damage / 20);
      shakeIntensityRef.current = damage / 10;
    }
    prevOpponentHealthRef.current = opponentHealth;

    // FLASH on special attacks!
    if (playerAttacking && !prevPlayerAttackRef.current && playerAttackType === 'special') {
      flashIntensityRef.current = 0.4; // Bright flash for special!
      shakeIntensityRef.current = 0.3;
    }
    prevPlayerAttackRef.current = playerAttacking;

    if (opponentAttacking && !prevOpponentAttackRef.current && opponentAttackType === 'special') {
      flashIntensityRef.current = 0.4;
      shakeIntensityRef.current = 0.3;
    }
    prevOpponentAttackRef.current = opponentAttacking;

    // Fade flash over time
    if (flashIntensityRef.current > 0) {
      flashIntensityRef.current = Math.max(0, flashIntensityRef.current - scaledDelta * 8);
    }

    // Fade shake over time
    if (shakeIntensityRef.current > 0) {
      shakeIntensityRef.current = Math.max(0, shakeIntensityRef.current - scaledDelta * 6);
      
      // Apply camera shake
      if (shakeIntensityRef.current > 0) {
        state.camera.position.x += (Math.random() - 0.5) * shakeIntensityRef.current * 0.5;
        state.camera.position.y += (Math.random() - 0.5) * shakeIntensityRef.current * 0.3;
      }
    }
  });

  return (
    <>
      {/* SCREEN FLASH OVERLAY - rendered in UI space */}
      {flashIntensityRef.current > 0 && (
        <mesh position={[0, 0, 0]} renderOrder={999}>
          <planeGeometry args={[100, 100]} />
          <meshBasicMaterial
            color="#FFFFFF"
            transparent
            opacity={flashIntensityRef.current * 0.8}
            depthTest={false}
            depthWrite={false}
          />
        </mesh>
      )}
    </>
  );
}

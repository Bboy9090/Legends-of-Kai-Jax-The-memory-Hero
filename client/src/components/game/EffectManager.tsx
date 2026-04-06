import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
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
  
  // FIXED: Always-mounted flash plane with ref-controlled material
  const flashMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  
  // FIXED: Cache camera baseline position to prevent drift
  const cameraBasePositionRef = useRef<THREE.Vector3 | null>(null);

  useFrame((state, delta) => {
    const scaledDelta = delta * timeScale;
    
    // Cache camera baseline position on first frame
    if (!cameraBasePositionRef.current) {
      cameraBasePositionRef.current = state.camera.position.clone();
    }

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

    // FIXED: Update flash material opacity directly (triggers render)
    if (flashMaterialRef.current) {
      flashMaterialRef.current.opacity = flashIntensityRef.current * 0.8;
    }

    // Fade flash over time
    if (flashIntensityRef.current > 0) {
      flashIntensityRef.current = Math.max(0, flashIntensityRef.current - scaledDelta * 8);
    }

    // FIXED: Apply camera shake as temporary offset from baseline
    if (shakeIntensityRef.current > 0) {
      const basePos = cameraBasePositionRef.current;
      if (basePos) {
        // Apply shake as offset from baseline
        state.camera.position.x = basePos.x + (Math.random() - 0.5) * shakeIntensityRef.current * 0.5;
        state.camera.position.y = basePos.y + (Math.random() - 0.5) * shakeIntensityRef.current * 0.3;
        state.camera.position.z = basePos.z; // Don't shake Z (depth)
      }
      
      // Fade shake over time
      shakeIntensityRef.current = Math.max(0, shakeIntensityRef.current - scaledDelta * 6);
    } else if (cameraBasePositionRef.current) {
      // FIXED: Reset to baseline when shake ends
      state.camera.position.copy(cameraBasePositionRef.current);
    }
  });

  return (
    <>
      {/* FIXED: ALWAYS-MOUNTED screen flash - opacity controlled via ref */}
      <mesh position={[0, 0, 5]} renderOrder={999}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial
          ref={flashMaterialRef}
          color="#FFFFFF"
          transparent
          opacity={0}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

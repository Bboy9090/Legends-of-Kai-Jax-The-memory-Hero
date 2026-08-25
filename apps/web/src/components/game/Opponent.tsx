import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useBattle } from "../../lib/stores/useBattle";
import { getFighterById } from "../../lib/characters";
import AnatomicalBeastModel from "./models/AnatomicalBeastModel";
import { useBeastPreset } from "../../lib/stores/useBeastPreset";

/**
 * Opponent is presentation-only. OpponentAI is the single gameplay authority
 * for movement, spacing, jumping and attacks. Keeping those responsibilities
 * separate prevents two frame loops from fighting over the same opponent state.
 */
export default function Opponent() {
  const opponentFighterId = useBattle((s) => s.opponentFighterId);
  const opponentX = useBattle((s) => s.opponentX);
  const opponentY = useBattle((s) => s.opponentY);
  const opponentFacingRight = useBattle((s) => s.opponentFacingRight);
  const opponentAttacking = useBattle((s) => s.opponentAttacking);
  const opponentHealth = useBattle((s) => s.opponentHealth);
  const timeScale = useBattle((s) => s.timeScale);

  const meshRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const animTimeRef = useRef(0);
  const emotionIntensityRef = useRef(0);
  const beastPreset = useBeastPreset((s) => s.preset);

  const fighter = getFighterById(opponentFighterId);

  useFrame((_, delta) => {
    const scaledDelta = delta * timeScale;
    animTimeRef.current += scaledDelta;

    if (opponentAttacking) {
      emotionIntensityRef.current = 1;
    } else if (opponentHealth < 30) {
      emotionIntensityRef.current = 0.8;
    } else {
      emotionIntensityRef.current = Math.max(0, emotionIntensityRef.current - scaledDelta * 2);
    }
  });

  if (!fighter) return null;

  return (
    <group ref={meshRef} position={[opponentX, opponentY, 0]}>
      <group scale={opponentFacingRight ? [1, 1, 1] : [-1, 1, 1]}>
        <AnatomicalBeastModel
          fighter={fighter}
          bodyRef={bodyRef}
          headRef={headRef}
          leftArmRef={leftArmRef}
          rightArmRef={rightArmRef}
          leftLegRef={leftLegRef}
          rightLegRef={rightLegRef}
          emotionIntensity={emotionIntensityRef.current}
          hitAnim={0}
          animTime={animTimeRef.current}
          isAttacking={opponentAttacking}
          isInvulnerable={false}
          presetOverride={beastPreset === "auto" ? null : beastPreset}
        />

        {opponentAttacking && (
          <mesh position={[1.2, 0.5, 0]}>
            <sphereGeometry args={[0.4, 12, 10]} />
            <meshBasicMaterial color={fighter.accentColor} transparent opacity={0.6} />
          </mesh>
        )}

        {opponentHealth < 30 && (
          <mesh position={[0, 2, 0]}>
            <sphereGeometry args={[0.3, 12, 10]} />
            <meshBasicMaterial color="#FF0000" transparent opacity={0.5} />
          </mesh>
        )}
      </group>
    </group>
  );
}

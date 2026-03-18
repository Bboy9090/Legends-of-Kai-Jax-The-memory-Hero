import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Group } from "three";

interface KaisonBeastModelProps {
  bodyRef: React.RefObject<Group>;
  headRef: React.RefObject<Group>;
  leftArmRef: React.RefObject<Group>;
  rightArmRef: React.RefObject<Group>;
  leftLegRef: React.RefObject<Group>;
  rightLegRef: React.RefObject<Group>;
  emotionIntensity: number;
  hitAnim: number;
  animTime: number;
  isAttacking: boolean;
  isInvulnerable: boolean;
}

/**
 * KAISON STORM — The Swift Guardian
 * Tactical fox-wolf hybrid with Star-Force web control and two mechanical tail-blades.
 * (Beast Wars design — no legacy/IP references)
 */
export default function KaisonBeastModel({
  bodyRef,
  headRef,
  leftArmRef,
  rightArmRef,
  leftLegRef,
  rightLegRef,
  emotionIntensity,
  hitAnim,
  animTime,
  isAttacking,
  isInvulnerable,
}: KaisonBeastModelProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Beast roster palette (from shared roster): orange + cobalt
  const fur = "#FF8C00";
  const armor = "#0B1020";
  const star = "#0066FF";
  const glow = "#00F2FF";

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // breathing / readiness
    groupRef.current.position.y = Math.sin(t * 2.2) * 0.03;
    if (isAttacking) groupRef.current.rotation.y = Math.sin(t * 10) * 0.15;
    if (hitAnim > 0) groupRef.current.rotation.z = Math.sin(t * 20) * 0.08 * hitAnim;
  });

  return (
    <group ref={groupRef} scale={[2.5, 2.5, 2.5]}>
      {/* Torso (tapered, armored core) */}
      <group ref={bodyRef} position={[0, 0.35, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.22, 0.28, 0.62, 8]} />
          <meshStandardMaterial color={armor} roughness={0.75} metalness={0.15} />
        </mesh>

        {/* Tactical jacket plate */}
        <mesh position={[0, 0.05, 0.22]} castShadow>
          <boxGeometry args={[0.40, 0.42, 0.06]} />
          <meshStandardMaterial color={armor} roughness={0.55} metalness={0.25} />
        </mesh>
        <mesh position={[0, 0.05, 0.26]} castShadow>
          <circleGeometry args={[0.10, 16]} />
          <meshBasicMaterial color={star} />
        </mesh>

        {/* Head (angular fox-wolf) */}
        <group ref={headRef} position={[0, 0.62, 0.12]}>
          <mesh castShadow receiveShadow>
            <icosahedronGeometry args={[0.24, 1]} />
            <meshStandardMaterial color={fur} roughness={0.55} metalness={0.15} />
          </mesh>

          {/* Snout */}
          <mesh position={[0, -0.05, 0.22]} castShadow receiveShadow>
            <coneGeometry args={[0.12, 0.22, 10]} />
            <meshStandardMaterial color={fur} roughness={0.6} metalness={0.1} />
          </mesh>

          {/* Ears */}
          <mesh position={[-0.18, 0.16, 0.02]} rotation={[0.1, 0, 0.35]} castShadow>
            <coneGeometry args={[0.08, 0.22, 8]} />
            <meshStandardMaterial color={fur} roughness={0.6} metalness={0.1} />
          </mesh>
          <mesh position={[0.18, 0.16, 0.02]} rotation={[0.1, 0, -0.35]} castShadow>
            <coneGeometry args={[0.08, 0.22, 8]} />
            <meshStandardMaterial color={fur} roughness={0.6} metalness={0.1} />
          </mesh>

          {/* Eyes (Star-Force slits) */}
          <mesh position={[-0.08, 0.02, 0.22]} rotation={[0, 0.12, 0]}>
            <planeGeometry args={[0.12, 0.03]} />
            <meshBasicMaterial color={glow} transparent opacity={0.9} />
          </mesh>
          <mesh position={[0.08, 0.02, 0.22]} rotation={[0, -0.12, 0]}>
            <planeGeometry args={[0.12, 0.03]} />
            <meshBasicMaterial color={glow} transparent opacity={0.9} />
          </mesh>
        </group>

        {/* Arms (tapered) */}
        <group ref={leftArmRef} position={[-0.30, 0.22, 0]} rotation={[0, 0, 0.6]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.04, 0.07, 0.40, 8]} />
            <meshStandardMaterial color={fur} roughness={0.65} metalness={0.1} />
          </mesh>
          {/* Web gauntlet */}
          <mesh position={[0, -0.26, 0.05]} castShadow>
            <boxGeometry args={[0.16, 0.18, 0.16]} />
            <meshStandardMaterial
              color={armor}
              roughness={0.5}
              metalness={0.3}
              emissive={star}
              emissiveIntensity={isAttacking ? 0.6 : 0.15}
            />
          </mesh>
        </group>
        <group ref={rightArmRef} position={[0.30, 0.22, 0]} rotation={[0, 0, -0.6]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.04, 0.07, 0.40, 8]} />
            <meshStandardMaterial color={fur} roughness={0.65} metalness={0.1} />
          </mesh>
          <mesh position={[0, -0.26, 0.05]} castShadow>
            <boxGeometry args={[0.16, 0.18, 0.16]} />
            <meshStandardMaterial
              color={armor}
              roughness={0.5}
              metalness={0.3}
              emissive={star}
              emissiveIntensity={isAttacking ? 0.6 : 0.15}
            />
          </mesh>
        </group>

        {/* Legs */}
        <group ref={leftLegRef} position={[-0.12, -0.36, 0.05]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.06, 0.08, 0.46, 8]} />
            <meshStandardMaterial color={fur} roughness={0.75} metalness={0.08} />
          </mesh>
          <mesh position={[0, -0.30, 0.12]} castShadow>
            <boxGeometry args={[0.18, 0.14, 0.30]} />
            <meshStandardMaterial color={armor} roughness={0.55} metalness={0.25} />
          </mesh>
        </group>
        <group ref={rightLegRef} position={[0.12, -0.36, 0.05]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.06, 0.08, 0.46, 8]} />
            <meshStandardMaterial color={fur} roughness={0.75} metalness={0.08} />
          </mesh>
          <mesh position={[0, -0.30, 0.12]} castShadow>
            <boxGeometry args={[0.18, 0.14, 0.30]} />
            <meshStandardMaterial color={armor} roughness={0.55} metalness={0.25} />
          </mesh>
        </group>

        {/* Twin mechanical tail-blades */}
        <group position={[-0.14, -0.05, -0.22]} rotation={[0.35, 0.35, 0]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.03, 0.26, 6, 10]} />
            <meshStandardMaterial color={armor} roughness={0.55} metalness={0.35} />
          </mesh>
          <mesh position={[0, -0.18, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <boxGeometry args={[0.10, 0.04, 0.16]} />
            <meshStandardMaterial color={star} emissive={star} emissiveIntensity={0.35} />
          </mesh>
        </group>
        <group position={[0.14, -0.05, -0.22]} rotation={[0.35, -0.35, 0]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.03, 0.26, 6, 10]} />
            <meshStandardMaterial color={armor} roughness={0.55} metalness={0.35} />
          </mesh>
          <mesh position={[0, -0.18, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <boxGeometry args={[0.10, 0.04, 0.16]} />
            <meshStandardMaterial color={star} emissive={star} emissiveIntensity={0.35} />
          </mesh>
        </group>

        {/* Web strands (subtle, animated shimmer) */}
        <group position={[0, 0.05, 0.30]} rotation={[0, 0, 0]}>
          {Array.from({ length: 6 }).map((_, i) => (
            <mesh
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              position={[0, 0, 0]}
              rotation={[0, 0, (i / 6) * Math.PI]}
              scale={[1, 1, 1]}
            >
              <cylinderGeometry args={[0.004, 0.004, 0.50, 6]} />
              <meshBasicMaterial color={glow} transparent opacity={0.12 + Math.sin(animTime * 6 + i) * 0.03} />
            </mesh>
          ))}
        </group>
      </group>

      {/* Invulnerability flash */}
      {isInvulnerable && (
        <mesh position={[0, 0.6, 0]} scale={1.1}>
          <sphereGeometry args={[0.8, 18, 14]} />
          <meshBasicMaterial color={glow} transparent opacity={0.12} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}


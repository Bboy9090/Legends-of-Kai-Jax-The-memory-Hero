import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Fighter } from "../../../lib/characters";
import { COMPLETE_BEAST_ROSTER } from "@beast-kin/shared/data/complete_beast_roster";

/**
 * ProceduralBeastModel
 * A non-placeholder fallback that looks "beast-hybrid" (horns/wings/tails/spines),
 * using the shared Beast Wars roster feature tags when available.
 */
export default function ProceduralBeastModel({ fighter }: { fighter: Fighter }) {
  const groupRef = useRef<THREE.Group>(null);

  const beast = useMemo(
    () => COMPLETE_BEAST_ROSTER.find((b) => b.id === fighter.id) || null,
    [fighter.id]
  );

  const primary = beast?.visual.primaryColor || fighter.color || "#1a1a1a";
  const accent = beast?.visual.accentColor || fighter.accentColor || "#00f2ff";
  const features = beast?.visual.features || [];
  const hybrid = beast?.beastHybrid || "";

  const hasWings = features.some((f) => /wing/i.test(f)) || /bird|dragon/i.test(hybrid);
  const hasHorns = features.some((f) => /horn/i.test(f)) || /dragon|bull|ram/i.test(hybrid);
  const hasSpines = features.some((f) => /spine|quill|spike/i.test(f)) || /spider/i.test(hybrid);
  const hasTails =
    features.some((f) => /tail/i.test(f)) || /fox|kitsune|wolf|dragon/i.test(hybrid);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = Math.sin(t * 0.6) * 0.25;
    groupRef.current.position.y = Math.sin(t * 2.0) * 0.03;
  });

  return (
    <group ref={groupRef} position={[0, 0.4, 0]} scale={[2.5, 2.5, 2.5]}>
      {/* Core torso: faceted + metallic grit */}
      <mesh castShadow receiveShadow position={[0, 0.05, 0]}>
        <dodecahedronGeometry args={[0.28, 1]} />
        <meshStandardMaterial
          color={primary}
          metalness={0.35}
          roughness={0.55}
          emissive={accent}
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Head: angular, not a sphere */}
      <group position={[0, 0.42, 0.12]}>
        <mesh castShadow receiveShadow>
          <icosahedronGeometry args={[0.22, 1]} />
          <meshStandardMaterial
            color={primary}
            metalness={0.25}
            roughness={0.65}
            emissive={accent}
            emissiveIntensity={0.08}
          />
        </mesh>

        {/* Eyes: narrow glowing slits */}
        <mesh position={[-0.07, 0.02, 0.18]} rotation={[0, 0.1, 0]}>
          <planeGeometry args={[0.10, 0.03]} />
          <meshBasicMaterial color={accent} transparent opacity={0.9} />
        </mesh>
        <mesh position={[0.07, 0.02, 0.18]} rotation={[0, -0.1, 0]}>
          <planeGeometry args={[0.10, 0.03]} />
          <meshBasicMaterial color={accent} transparent opacity={0.9} />
        </mesh>

        {/* Horns */}
        {hasHorns && (
          <>
            <mesh position={[-0.14, 0.10, 0.03]} rotation={[0.2, 0.0, 0.6]} castShadow>
              <coneGeometry args={[0.05, 0.18, 6]} />
              <meshStandardMaterial
                color={accent}
                metalness={0.55}
                roughness={0.35}
                emissive={accent}
                emissiveIntensity={0.2}
              />
            </mesh>
            <mesh position={[0.14, 0.10, 0.03]} rotation={[0.2, 0.0, -0.6]} castShadow>
              <coneGeometry args={[0.05, 0.18, 6]} />
              <meshStandardMaterial
                color={accent}
                metalness={0.55}
                roughness={0.35}
                emissive={accent}
                emissiveIntensity={0.2}
              />
            </mesh>
          </>
        )}
      </group>

      {/* Limbs: tapered, not capsules */}
      <group position={[-0.26, 0.15, 0]} rotation={[0, 0, 0.9]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.03, 0.07, 0.30, 7]} />
          <meshStandardMaterial color={primary} roughness={0.8} metalness={0.15} />
        </mesh>
      </group>
      <group position={[0.26, 0.15, 0]} rotation={[0, 0, -0.9]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.03, 0.07, 0.30, 7]} />
          <meshStandardMaterial color={primary} roughness={0.8} metalness={0.15} />
        </mesh>
      </group>
      <group position={[-0.10, -0.28, 0.04]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.05, 0.07, 0.34, 7]} />
          <meshStandardMaterial color={primary} roughness={0.85} metalness={0.1} />
        </mesh>
      </group>
      <group position={[0.10, -0.28, 0.04]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.05, 0.07, 0.34, 7]} />
          <meshStandardMaterial color={primary} roughness={0.85} metalness={0.1} />
        </mesh>
      </group>

      {/* Wings */}
      {hasWings && (
        <group position={[0, 0.14, -0.10]}>
          <mesh position={[-0.22, 0.0, 0]} rotation={[0.2, 0.5, 0.2]} castShadow>
            <planeGeometry args={[0.40, 0.22]} />
            <meshStandardMaterial
              color={primary}
              emissive={accent}
              emissiveIntensity={0.08}
              roughness={0.9}
              side={THREE.DoubleSide}
              transparent
              opacity={0.9}
            />
          </mesh>
          <mesh position={[0.22, 0.0, 0]} rotation={[0.2, -0.5, -0.2]} castShadow>
            <planeGeometry args={[0.40, 0.22]} />
            <meshStandardMaterial
              color={primary}
              emissive={accent}
              emissiveIntensity={0.08}
              roughness={0.9}
              side={THREE.DoubleSide}
              transparent
              opacity={0.9}
            />
          </mesh>
        </group>
      )}

      {/* Spines / quills */}
      {hasSpines && (
        <group position={[0, 0.20, -0.18]}>
          {Array.from({ length: 6 }).map((_, i) => (
            <mesh
              key={i}
              position={[0, 0.02 + i * 0.03, -0.02 - i * 0.04]}
              rotation={[Math.PI / 2.6, 0, 0]}
              castShadow
            >
              <coneGeometry args={[0.03, 0.16 + i * 0.03, 5]} />
              <meshStandardMaterial
                color={accent}
                emissive={accent}
                emissiveIntensity={0.2}
                roughness={0.4}
                metalness={0.4}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* Tail(s): segmented, glowing tip */}
      {hasTails && (
        <group position={[0, -0.02, -0.22]}>
          <mesh position={[0, 0, -0.08]} rotation={[0.4, 0, 0]} castShadow>
            <capsuleGeometry args={[0.035, 0.22, 6, 10]} />
            <meshStandardMaterial color={primary} roughness={0.8} metalness={0.15} />
          </mesh>
          <mesh position={[0, -0.10, -0.18]} castShadow>
            <sphereGeometry args={[0.05, 14, 12]} />
            <meshStandardMaterial
              color={accent}
              emissive={accent}
              emissiveIntensity={0.8}
              roughness={0.25}
              metalness={0.55}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}


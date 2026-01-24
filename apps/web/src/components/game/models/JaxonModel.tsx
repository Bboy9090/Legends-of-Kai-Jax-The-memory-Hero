import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { COMPLETE_BEAST_ROSTER } from "@beast-kin/shared/data/complete_beast_roster";

/**
 * PROJECT OMEGA: JAXON BEAST-KIN SILHOUETTE
 * Moving away from "Blocky" into "Sculpted" architecture.
 * Features: Tapered limbs, organic quill clusters, and nebula-depth skin.
 */
export interface JaxonBeastModelProps {
  emotionIntensity?: number;
  isAttacking?: boolean;
}

export default function JaxonBeastModel({
  emotionIntensity = 0,
  isAttacking = false,
}: JaxonBeastModelProps) {
  const groupRef = useRef<THREE.Group | null>(null);
  
  const jaxon = COMPLETE_BEAST_ROSTER.find((b) => b.id === "jaxon");
  const hasCharcoalFur = !!jaxon?.visual.features?.includes("charcoal_fur");
  const skinColor = hasCharcoalFur ? "#1a1a1a" : (jaxon?.visual.primaryColor || "#1a1a1a");
  const trimColor = jaxon?.visual.primaryColor || "#0066FF"; // electric-blue trim
  const auraColor = jaxon?.visual.accentColor || "#00FF00"; // electric aura
  const eyeColor = jaxon?.visual.features?.includes("feral_amber_eyes") ? "#FFB000" : auraColor;
  const quills = jaxon?.visual.features?.includes("seven_electric_quills") ? 7 : 5;
  const capColor = "#101010"; // keep street-wear but neutral (no legacy)

  useFrame((state) => {
    if (!groupRef.current) return;
    // Subtle "Breathing" and vibration for quills
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.05;
  });

  return (
    <group ref={groupRef} scale={[2.5, 2.5, 2.5]}>
      {/* 1. THE HEAD: TAPERED & JAGGED */}
      <group position={[0, 0.6, 0]}>
        {/* Sculpted Head Base - Using an Icosahedron for more organic facets than a sphere */}
        <mesh castShadow>
          <icosahedronGeometry args={[0.4, 1]} />
          <meshStandardMaterial color={skinColor} roughness={0.4} metalness={0.7} />
        </mesh>

        {/* Street cap / head-guard */}
        <group rotation={[0.1, 0, 0.2]}>
           <mesh position={[0, 0.15, 0]} castShadow>
             <sphereGeometry args={[0.42, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
             <meshStandardMaterial color={capColor} roughness={0.9} />
           </mesh>
           <mesh position={[0, 0.1, 0.3]} rotation={[-0.2, 0, 0]} castShadow>
             <boxGeometry args={[0.5, 0.05, 0.4]} />
             <meshStandardMaterial color={capColor} roughness={0.9} />
           </mesh>
        </group>

        {/* ELECTRIC QUILLS - Not just cones, but "Clusters" */}
        {[...Array(quills)].map((_, i) => (
          <group key={i} rotation={[0, 0, (i - 2) * 0.4]}>
            <mesh position={[0, 0.4, -0.2]} rotation={[Math.PI / 3, 0, 0]} castShadow>
              <coneGeometry args={[0.08, 0.8, 4]} />
              <meshStandardMaterial 
                color={skinColor} 
                emissive={auraColor} 
                emissiveIntensity={isAttacking ? 2 : 0.2} 
              />
            </mesh>
          </group>
        ))}

        {/* SAGE EYES: Recessed and glowing */}
        <group position={[0, 0, 0.35]}>
          <mesh position={[-0.15, 0.05, 0]}>
            <planeGeometry args={[0.15, 0.08]} />
            <meshBasicMaterial color={eyeColor} transparent opacity={0.9} />
          </mesh>
          <mesh position={[0.15, 0.05, 0]}>
            <planeGeometry args={[0.15, 0.08]} />
            <meshBasicMaterial color={eyeColor} transparent opacity={0.9} />
          </mesh>
        </group>
      </group>

      {/* 2. THE TORSO: ATHLETIC TAPER */}
      <mesh position={[0, 0, 0]} castShadow>
        {/* Using a Cylinder with different top/bottom radius to create a "V-Taper" physique */}
        <cylinderGeometry args={[0.3, 0.2, 0.8, 6]} />
        <meshStandardMaterial color={skinColor} roughness={0.8} metalness={0.1} />
      </mesh>
      {/* Electric trim plate */}
      <mesh position={[0, 0.05, 0.25]} castShadow>
        <boxGeometry args={[0.45, 0.45, 0.06]} />
        <meshStandardMaterial
          color={"#0b1020"}
          roughness={0.6}
          metalness={0.35}
          emissive={trimColor}
          emissiveIntensity={0.15 + (isAttacking ? 0.25 : 0)}
        />
      </mesh>

      {/* 3. THE ARMS: TAPERED CYLINDERS (Not capsules) */}
      <group position={[-0.4, 0.2, 0]} rotation={[0, 0, 0.5]}>
         <mesh castShadow>
           <cylinderGeometry args={[0.05, 0.1, 0.6, 6]} />
           <meshStandardMaterial color={skinColor} />
         </mesh>
         {/* OVERSIZED GLOVE: The "Iconic" silhouette */}
         <mesh position={[0, -0.4, 0]} castShadow>
           <boxGeometry args={[0.25, 0.3, 0.25]} />
           <meshStandardMaterial color="#fff" roughness={1} />
         </mesh>
      </group>

      <group position={[0.4, 0.2, 0]} rotation={[0, 0, -0.5]}>
         <mesh castShadow>
           <cylinderGeometry args={[0.05, 0.1, 0.6, 6]} />
           <meshStandardMaterial color={skinColor} />
         </mesh>
         <mesh position={[0, -0.4, 0]} castShadow>
           <boxGeometry args={[0.25, 0.3, 0.25]} />
           <meshStandardMaterial color="#fff" roughness={1} />
         </mesh>
      </group>

      {/* 4. THE FEET: HEAVY MOMENTUM BOOTS */}
      <group position={[-0.2, -0.6, 0.1]}>
        <mesh castShadow>
          <boxGeometry args={[0.3, 0.4, 0.6]} />
          <meshStandardMaterial color={capColor} metalness={0.5} roughness={0.2} />
        </mesh>
      </group>
      <group position={[0.2, -0.6, 0.1]}>
        <mesh castShadow>
          <boxGeometry args={[0.3, 0.4, 0.6]} />
          <meshStandardMaterial color={capColor} metalness={0.5} roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
}
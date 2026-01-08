impimport React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * PROJECT OMEGA: JAXON BEAST-KIN SILHOUETTE
 * Moving away from "Blocky" into "Sculpted" architecture.
 * Features: Tapered limbs, organic quill clusters, and nebula-depth skin.
 */
export default function JaxonBeastModel({ emotionIntensity = 0, isAttacking = false }) {
  const groupRef = useRef();
  
  // Colors for the "Bronx Grit" aesthetic
  const skinColor = "#1a1a1a"; // Charcoal
  const auraColor = "#00f2ff"; // Electric Cyan
  const capColor = "#8B0000";  // Weathered Crimson

  useFrame((state) => {
    if (groupRef.current) {
      // Subtle "Breathing" and vibration for quills
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
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

        {/* THE RED CAP - Tilted for "Bronx Witty" personality */}
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
        {[...Array(5)].map((_, i) => (
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
            <meshBasicMaterial color={auraColor} transparent opacity={0.8} />
          </mesh>
          <mesh position={[0.15, 0.05, 0]}>
            <planeGeometry args={[0.15, 0.08]} />
            <meshBasicMaterial color={auraColor} transparent opacity={0.8} />
          </mesh>
        </group>
      </group>

      {/* 2. THE TORSO: ATHLETIC TAPER */}
      <mesh position={[0, 0, 0]} castShadow>
        {/* Using a Cylinder with different top/bottom radius to create a "V-Taper" physique */}
        <cylinderGeometry args={[0.3, 0.2, 0.8, 6]} />
        <meshStandardMaterial color="#001f3f" roughness={0.8} />
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
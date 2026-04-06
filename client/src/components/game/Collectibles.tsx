import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { type Collectible } from "../../lib/gameLogic";

interface CollectiblesProps {
  collectible: Collectible;
}

export default function Collectibles({ collectible }: CollectiblesProps) {
  const meshRef = useRef<THREE.Group>(null);
  
  // Floating and rotating animation
  useFrame((state) => {
    if (!meshRef.current || !collectible.active) return;
    
    // Continuous rotation
    meshRef.current.rotation.y += 0.02;
    
    // Floating animation
    const floatOffset = Math.sin(state.clock.elapsedTime * 4) * 0.3;
    meshRef.current.position.y = collectible.position.y + floatOffset;
  });
  
  // Don't render if not active
  if (!collectible.active) return null;
  
  const isHelpToken = collectible.type === "helpToken";
  
  return (
    <group ref={meshRef} position={collectible.position}>
      {/* Main collectible shape */}
      {isHelpToken ? (
        // Help Token - Heart shape (simplified)
        <group>
          <mesh castShadow>
            <sphereGeometry args={[0.3, 8, 6]} />
            <meshLambertMaterial color="#FF69B4" emissive="#FF1493" emissiveIntensity={0.2} />
          </mesh>
          <mesh position={[-0.2, 0.2, 0]} castShadow>
            <sphereGeometry args={[0.2, 6, 4]} />
            <meshLambertMaterial color="#FF69B4" emissive="#FF1493" emissiveIntensity={0.2} />
          </mesh>
          <mesh position={[0.2, 0.2, 0]} castShadow>
            <sphereGeometry args={[0.2, 6, 4]} />
            <meshLambertMaterial color="#FF69B4" emissive="#FF1493" emissiveIntensity={0.2} />
          </mesh>
          
          {/* Sparkle effect for help tokens */}
          {[0, 1, 2, 3].map(i => (
            <mesh key={`sparkle_${i}`} position={[
              Math.sin(i * Math.PI / 2) * 0.8,
              Math.cos(i * Math.PI / 2) * 0.8,
              0
            ]}>
              <sphereGeometry args={[0.05]} />
              <meshBasicMaterial color="#FFFFFF" />
            </mesh>
          ))}
        </group>
      ) : (
        // Coin - Simple cylinder
        <group>
          <mesh castShadow>
            <cylinderGeometry args={[0.4, 0.4, 0.1, 8]} />
            <meshLambertMaterial color="#FFD700" emissive="#FFA500" emissiveIntensity={0.1} />
          </mesh>
          
          {/* Coin symbol */}
          <mesh position={[0, 0, 0.06]}>
            <cylinderGeometry args={[0.2, 0.2, 0.02, 8]} />
            <meshLambertMaterial color="#FFA500" />
          </mesh>
          
          {/* Shine effect */}
          <mesh position={[0, 0, 0.08]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.1, 0.3, 0.01]} />
            <meshBasicMaterial color="#FFFFFF" transparent opacity={0.8} />
          </mesh>
        </group>
      )}
      
      {/* Glow effect */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.8]} />
        <meshBasicMaterial 
          color={isHelpToken ? "#FF69B4" : "#FFD700"} 
          transparent 
          opacity={0.1}
        />
      </mesh>
    </group>
  );
}

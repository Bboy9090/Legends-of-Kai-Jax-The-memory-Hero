import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useSpring, animated } from "@react-spring/three";
import * as THREE from "three";

import { useRunner } from "../../lib/stores/useRunner";

export default function Player() {
  const { player, selectedCharacter } = useRunner();
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Smooth position transitions with bobbing animation
  const { position } = useSpring({
    position: [player.x, player.y, player.z] as [number, number, number],
    config: { tension: 300, friction: 30 }
  });
  
  // Animation based on player state
  const { scale, rotation } = useSpring({
    scale: player.isSliding ? [1, 0.5, 1] : [1, 1, 1],
    rotation: player.isSliding ? [Math.PI / 6, 0, 0] : [0, 0, 0],
    config: { tension: 400, friction: 40 }
  });
  
  // Character-specific colors
  const characterColors = {
    jaxon: "#2E86FF", // Electric blue
    kaison: "#FF4757"  // Fiery red
  };
  
  // Track animation time for bobbing effect
  const animationTimeRef = useRef(0);
  
  useFrame((state, delta) => {
    if (!player.isSliding) {
      animationTimeRef.current += delta;
    }
  });
  
  return (
    <animated.group position={position as any}>
      <animated.group scale={scale as any} rotation={rotation as any}>
        {/* Main character body */}
        <mesh ref={meshRef} castShadow receiveShadow>
          <boxGeometry args={[1, 1.6, 0.8]} />
          <meshLambertMaterial color={characterColors[selectedCharacter]} />
        </mesh>
        
        {/* Character head */}
        <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.4, 8, 6]} />
          <meshLambertMaterial color={characterColors[selectedCharacter]} />
        </mesh>
        
        {/* Lightning bolt accent for Jaxon */}
        {selectedCharacter === "jaxon" && (
          <mesh position={[0, 0, 0.5]} rotation={[0, 0, Math.PI / 6]}>
            <boxGeometry args={[0.2, 1, 0.1]} />
            <meshLambertMaterial color="#FFFF00" />
          </mesh>
        )}
        
        {/* Energy pattern for Kaison */}
        {selectedCharacter === "kaison" && (
          <>
            <mesh position={[0.3, 0, 0.5]} rotation={[0, 0, Math.PI / 4]}>
              <boxGeometry args={[0.15, 0.8, 0.1]} />
              <meshLambertMaterial color="#FFFFFF" />
            </mesh>
            <mesh position={[-0.3, 0, 0.5]} rotation={[0, 0, -Math.PI / 4]}>
              <boxGeometry args={[0.15, 0.8, 0.1]} />
              <meshLambertMaterial color="#FFFFFF" />
            </mesh>
          </>
        )}
        
        {/* Simple legs */}
        <mesh position={[-0.2, -0.6, 0]} castShadow>
          <boxGeometry args={[0.3, 0.8, 0.3]} />
          <meshLambertMaterial color={characterColors[selectedCharacter]} />
        </mesh>
        <mesh position={[0.2, -0.6, 0]} castShadow>
          <boxGeometry args={[0.3, 0.8, 0.3]} />
          <meshLambertMaterial color={characterColors[selectedCharacter]} />
        </mesh>
        
        {/* Simple arms */}
        <mesh position={[-0.7, 0.5, 0]} rotation={[0, 0, -Math.PI / 4]} castShadow>
          <boxGeometry args={[0.25, 0.8, 0.25]} />
          <meshLambertMaterial color={characterColors[selectedCharacter]} />
        </mesh>
        <mesh position={[0.7, 0.5, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
          <boxGeometry args={[0.25, 0.8, 0.25]} />
          <meshLambertMaterial color={characterColors[selectedCharacter]} />
        </mesh>
      </animated.group>
    </animated.group>
  );
}

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useSpring, animated } from "@react-spring/three";
import * as THREE from "three";
import { Points, PointMaterial } from "@react-three/drei";

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
  
  // Character-specific colors and effects
  const characterConfig = {
    jaxon: {
      primaryColor: "#2E86FF", // Electric blue
      accentColor: "#00BFFF", // Light blue
      glowColor: "#87CEEB",   // Sky blue
      particleColor: "#FFFF00" // Lightning yellow
    },
    kaison: {
      primaryColor: "#FF4757", // Fiery red
      accentColor: "#FF6B35", // Orange-red
      glowColor: "#FFB347",   // Peach
      particleColor: "#FF4500" // Orange-red particles
    }
  };
  
  const config = characterConfig[selectedCharacter] || characterConfig.jaxon; // Fallback to Jaxon if undefined
  
  // Track animation time for effects
  const animationTimeRef = useRef(0);
  const particleRef = useRef<THREE.Points>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  
  // Generate particles for power effects
  const particles = useMemo(() => {
    const count = selectedCharacter === "jaxon" ? 50 : 40;
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      if (selectedCharacter === "jaxon") {
        // Lightning particles around body
        positions[i3] = (Math.random() - 0.5) * 2;
        positions[i3 + 1] = Math.random() * 2 - 0.5;
        positions[i3 + 2] = (Math.random() - 0.5) * 1.5;
      } else {
        // Fire particles around body
        positions[i3] = (Math.random() - 0.5) * 1.8;
        positions[i3 + 1] = Math.random() * 2.5;
        positions[i3 + 2] = (Math.random() - 0.5) * 1.2;
      }
    }
    
    return positions;
  }, [selectedCharacter]);
  
  useFrame((state, delta) => {
    animationTimeRef.current += delta;
    
    // Animate running motion (pause during slide)
    if (!player.isSliding) {
      const runSpeed = 8;
      const legSwing = Math.sin(animationTimeRef.current * runSpeed) * 0.3;
      const armSwing = Math.sin(animationTimeRef.current * runSpeed) * 0.5;
      
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.position.z = Math.sin(animationTimeRef.current * runSpeed) * 0.1;
        rightLegRef.current.position.z = Math.sin(animationTimeRef.current * runSpeed + Math.PI) * 0.1;
        leftLegRef.current.rotation.x = legSwing;
        rightLegRef.current.rotation.x = -legSwing;
      }
      
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = armSwing;
        rightArmRef.current.rotation.x = -armSwing;
      }
    } else {
      // Slide pose - keep limbs compact
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.position.z = 0;
        rightLegRef.current.position.z = 0;
        leftLegRef.current.rotation.x = 0;
        rightLegRef.current.rotation.x = 0;
      }
      
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = 0;
        rightArmRef.current.rotation.x = 0;
      }
    }
    
    // Animate particles
    if (particleRef.current) {
      const positions = particleRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < positions.length; i += 3) {
        if (selectedCharacter === "jaxon") {
          // Lightning effect - zigzag movement
          positions[i] += Math.sin(animationTimeRef.current * 10 + i) * 0.02;
          positions[i + 1] += Math.cos(animationTimeRef.current * 8 + i) * 0.01;
        } else {
          // Fire effect - upward floating
          positions[i + 1] += Math.sin(animationTimeRef.current * 5 + i) * 0.02;
          positions[i] += Math.cos(animationTimeRef.current * 3 + i) * 0.01;
        }
      }
      
      particleRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });
  
  return (
    <animated.group position={position as any}>
      <animated.group scale={scale as any} rotation={rotation as any}>
        {/* Main character body - enhanced with glow */}
        <mesh ref={meshRef} castShadow receiveShadow>
          <boxGeometry args={[1, 1.8, 0.9]} />
          <meshStandardMaterial 
            color={config.primaryColor} 
            emissive={config.accentColor}
            emissiveIntensity={0.2}
            metalness={0.3}
            roughness={0.4}
          />
        </mesh>
        
        {/* Character head with face details */}
        <mesh position={[0, 1.3, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.45, 16, 12]} />
          <meshStandardMaterial 
            color={config.primaryColor}
            emissive={config.accentColor}
            emissiveIntensity={0.15}
            metalness={0.2}
            roughness={0.5}
          />
        </mesh>
        
        {/* Eyes */}
        <mesh position={[-0.15, 1.4, 0.35]}>
          <sphereGeometry args={[0.08, 8, 6]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0.15, 1.4, 0.35]}>
          <sphereGeometry args={[0.08, 8, 6]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
        
        {/* Eye pupils */}
        <mesh position={[-0.15, 1.4, 0.42]}>
          <sphereGeometry args={[0.04, 8, 6]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        <mesh position={[0.15, 1.4, 0.42]}>
          <sphereGeometry args={[0.04, 8, 6]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        
        {/* Lightning bolt accent for Jaxon */}
        {selectedCharacter === "jaxon" && (
          <>
            <mesh position={[0, 0, 0.5]} rotation={[0, 0, Math.PI / 6]}>
              <boxGeometry args={[0.25, 1.2, 0.1]} />
              <meshStandardMaterial 
                color={config.particleColor}
                emissive={config.particleColor}
                emissiveIntensity={0.8}
              />
            </mesh>
            {/* Lightning energy glow */}
            <mesh position={[0, 0, 0.5]} rotation={[0, 0, Math.PI / 6]}>
              <boxGeometry args={[0.35, 1.4, 0.15]} />
              <meshStandardMaterial 
                color={config.glowColor}
                transparent
                opacity={0.3}
                emissive={config.glowColor}
                emissiveIntensity={0.4}
              />
            </mesh>
          </>
        )}
        
        {/* Fire energy pattern for Kaison */}
        {selectedCharacter === "kaison" && (
          <>
            <mesh position={[0.3, 0, 0.5]} rotation={[0, 0, Math.PI / 4]}>
              <boxGeometry args={[0.18, 1, 0.12]} />
              <meshStandardMaterial 
                color={config.particleColor}
                emissive={config.particleColor}
                emissiveIntensity={0.9}
              />
            </mesh>
            <mesh position={[-0.3, 0, 0.5]} rotation={[0, 0, -Math.PI / 4]}>
              <boxGeometry args={[0.18, 1, 0.12]} />
              <meshStandardMaterial 
                color={config.particleColor}
                emissive={config.particleColor}
                emissiveIntensity={0.9}
              />
            </mesh>
            {/* Fire energy glow */}
            <mesh position={[0, 0, 0.5]}>
              <boxGeometry args={[0.8, 1.2, 0.2]} />
              <meshStandardMaterial 
                color={config.glowColor}
                transparent
                opacity={0.2}
                emissive={config.glowColor}
                emissiveIntensity={0.5}
              />
            </mesh>
          </>
        )}
        
        {/* Enhanced legs with running animation */}
        <mesh 
          ref={leftLegRef}
          position={[-0.2, -0.7, 0]} 
          castShadow
        >
          <boxGeometry args={[0.32, 0.9, 0.32]} />
          <meshStandardMaterial 
            color={config.primaryColor}
            emissive={config.accentColor}
            emissiveIntensity={0.1}
          />
        </mesh>
        <mesh 
          ref={rightLegRef}
          position={[0.2, -0.7, 0]} 
          castShadow
        >
          <boxGeometry args={[0.32, 0.9, 0.32]} />
          <meshStandardMaterial 
            color={config.primaryColor}
            emissive={config.accentColor}
            emissiveIntensity={0.1}
          />
        </mesh>
        
        {/* Enhanced arms with running motion */}
        <mesh 
          ref={leftArmRef}
          position={[-0.75, 0.6, 0]} 
          rotation={[0, 0, -Math.PI / 6]} 
          castShadow
        >
          <boxGeometry args={[0.28, 0.85, 0.28]} />
          <meshStandardMaterial 
            color={config.primaryColor}
            emissive={config.accentColor}
            emissiveIntensity={0.1}
          />
        </mesh>
        <mesh 
          ref={rightArmRef}
          position={[0.75, 0.6, 0]} 
          rotation={[0, 0, Math.PI / 6]} 
          castShadow
        >
          <boxGeometry args={[0.28, 0.85, 0.28]} />
          <meshStandardMaterial 
            color={config.primaryColor}
            emissive={config.accentColor}
            emissiveIntensity={0.1}
          />
        </mesh>
        
        {/* Power particle effects */}
        <Points ref={particleRef} positions={particles}>
          <PointMaterial 
            size={selectedCharacter === "jaxon" ? 0.05 : 0.08}
            color={config.particleColor}
            transparent
            opacity={0.8}
            sizeAttenuation
            depthWrite={false}
          />
        </Points>
      </animated.group>
    </animated.group>
  );
}

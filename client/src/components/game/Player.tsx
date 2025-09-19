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
  
  // Sonic-style vibrant character colors
  const characterConfig = {
    jaxon: {
      primaryColor: "#0066FF", // Bright Sonic blue
      accentColor: "#004CCC", // Darker blue
      glowColor: "#66B3FF",   // Light blue glow
      particleColor: "#FFFF00", // Lightning yellow
      muzzleColor: "#FFE4B5", // Cream/peach muzzle
      eyeColor: "#FFFFFF",    // White eyes
      pupilColor: "#000000"   // Black pupils
    },
    kaison: {
      primaryColor: "#FF4444", // Bright red like Knuckles
      accentColor: "#CC2222", // Darker red
      glowColor: "#FF8888",   // Light red glow
      particleColor: "#FF6600", // Orange flames
      muzzleColor: "#FFE4B5", // Cream/peach muzzle
      eyeColor: "#FFFFFF",    // White eyes
      pupilColor: "#000000"   // Black pupils
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
        {/* Sonic-style rounded body (larger torso like Sonic) */}
        <mesh ref={meshRef} castShadow receiveShadow>
          <capsuleGeometry args={[0.7, 1.2]} />
          <meshToonMaterial 
            color={config.primaryColor} 
            emissive={config.accentColor}
            emissiveIntensity={0.3}
          />
        </mesh>
        
        {/* Large Sonic-style head (much bigger proportion) */}
        <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.8, 32, 24]} />
          <meshToonMaterial 
            color={config.primaryColor}
            emissive={config.accentColor}
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* Cartoon-style muzzle/mouth area */}
        <mesh position={[0, 1.5, 0.6]} castShadow receiveShadow>
          <sphereGeometry args={[0.35, 16, 12]} />
          <meshToonMaterial 
            color={config.muzzleColor || "#FFE4B5"}
          />
        </mesh>
        
        {/* Large Sonic-style eyes (much bigger and more expressive) */}
        <mesh position={[-0.25, 1.9, 0.5]}>
          <sphereGeometry args={[0.2, 16, 12]} />
          <meshToonMaterial color={config.eyeColor} />
        </mesh>
        <mesh position={[0.25, 1.9, 0.5]}>
          <sphereGeometry args={[0.2, 16, 12]} />
          <meshToonMaterial color={config.eyeColor} />
        </mesh>
        
        {/* Large cartoon pupils */}
        <mesh position={[-0.25, 1.9, 0.65]}>
          <sphereGeometry args={[0.12, 12, 8]} />
          <meshToonMaterial color={config.pupilColor} />
        </mesh>
        <mesh position={[0.25, 1.9, 0.65]}>
          <sphereGeometry args={[0.12, 12, 8]} />
          <meshToonMaterial color={config.pupilColor} />
        </mesh>
        
        {/* Eye shine highlights (Sonic-style) */}
        <mesh position={[-0.2, 2.0, 0.7]}>
          <sphereGeometry args={[0.04, 8, 6]} />
          <meshToonMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[0.3, 2.0, 0.7]}>
          <sphereGeometry args={[0.04, 8, 6]} />
          <meshToonMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.8} />
        </mesh>
        
        {/* Sonic-style spiky quills for Jaxon */}
        {selectedCharacter === "jaxon" && (
          <>
            {/* Back spikes like Sonic */}
            <mesh position={[0, 2.1, -0.6]} rotation={[Math.PI / 4, 0, 0]}>
              <coneGeometry args={[0.15, 0.6, 8]} />
              <meshToonMaterial 
                color={config.accentColor}
                emissive={config.particleColor}
                emissiveIntensity={0.3}
              />
            </mesh>
            <mesh position={[-0.3, 2.2, -0.4]} rotation={[Math.PI / 6, -Math.PI / 8, 0]}>
              <coneGeometry args={[0.12, 0.5, 8]} />
              <meshToonMaterial 
                color={config.accentColor}
                emissive={config.particleColor}
                emissiveIntensity={0.3}
              />
            </mesh>
            <mesh position={[0.3, 2.2, -0.4]} rotation={[Math.PI / 6, Math.PI / 8, 0]}>
              <coneGeometry args={[0.12, 0.5, 8]} />
              <meshToonMaterial 
                color={config.accentColor}
                emissive={config.particleColor}
                emissiveIntensity={0.3}
              />
            </mesh>
            {/* Lightning crown/headband */}
            <mesh position={[0, 2.4, 0]} rotation={[0, 0, 0]}>
              <torusGeometry args={[0.6, 0.1, 8, 16]} />
              <meshToonMaterial 
                color={config.particleColor}
                emissive={config.particleColor}
                emissiveIntensity={0.8}
              />
            </mesh>
          </>
        )}
        
        {/* Flame-style features for Kaison */}
        {selectedCharacter === "kaison" && (
          <>
            {/* Flame shoulder pads like Knuckles */}
            <mesh position={[-0.9, 1.2, 0]}>
              <coneGeometry args={[0.2, 0.4, 6]} />
              <meshToonMaterial 
                color={config.particleColor}
                emissive={config.particleColor}
                emissiveIntensity={0.8}
              />
            </mesh>
            <mesh position={[0.9, 1.2, 0]}>
              <coneGeometry args={[0.2, 0.4, 6]} />
              <meshToonMaterial 
                color={config.particleColor}
                emissive={config.particleColor}
                emissiveIntensity={0.8}
              />
            </mesh>
            {/* Flame crest on head */}
            <mesh position={[0, 2.5, 0]} rotation={[0, 0, 0]}>
              <coneGeometry args={[0.15, 0.5, 8]} />
              <meshToonMaterial 
                color={config.particleColor}
                emissive={config.particleColor}
                emissiveIntensity={0.9}
              />
            </mesh>
            {/* Side flame details */}
            <mesh position={[-0.2, 2.3, 0]} rotation={[0, 0, -Math.PI / 6]}>
              <coneGeometry args={[0.1, 0.3, 6]} />
              <meshToonMaterial 
                color={config.accentColor}
                emissive={config.particleColor}
                emissiveIntensity={0.7}
              />
            </mesh>
            <mesh position={[0.2, 2.3, 0]} rotation={[0, 0, Math.PI / 6]}>
              <coneGeometry args={[0.1, 0.3, 6]} />
              <meshToonMaterial 
                color={config.accentColor}
                emissive={config.particleColor}
                emissiveIntensity={0.7}
              />
            </mesh>
          </>
        )}
        
        {/* Sonic-style rounded legs with running animation */}
        <mesh 
          ref={leftLegRef}
          position={[-0.4, -0.8, 0]} 
          castShadow
        >
          <capsuleGeometry args={[0.25, 1.0]} />
          <meshToonMaterial 
            color={config.primaryColor}
            emissive={config.accentColor}
            emissiveIntensity={0.2}
          />
        </mesh>
        <mesh 
          ref={rightLegRef}
          position={[0.4, -0.8, 0]} 
          castShadow
        >
          <capsuleGeometry args={[0.25, 1.0]} />
          <meshToonMaterial 
            color={config.primaryColor}
            emissive={config.accentColor}
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* Sonic-style red shoes/boots */}
        <mesh position={[-0.4, -1.5, 0.2]} castShadow receiveShadow>
          <capsuleGeometry args={[0.2, 0.6]} />
          <meshToonMaterial color="#CC0000" />
        </mesh>
        <mesh position={[0.4, -1.5, 0.2]} castShadow receiveShadow>
          <capsuleGeometry args={[0.2, 0.6]} />
          <meshToonMaterial color="#CC0000" />
        </mesh>
        
        {/* Sonic-style rounded arms with running motion */}
        <mesh 
          ref={leftArmRef}
          position={[-0.9, 0.8, 0]} 
          rotation={[0, 0, -Math.PI / 6]} 
          castShadow
        >
          <capsuleGeometry args={[0.2, 0.8]} />
          <meshToonMaterial 
            color={config.primaryColor}
            emissive={config.accentColor}
            emissiveIntensity={0.2}
          />
        </mesh>
        <mesh 
          ref={rightArmRef}
          position={[0.9, 0.8, 0]} 
          rotation={[0, 0, Math.PI / 6]} 
          castShadow
        >
          <capsuleGeometry args={[0.2, 0.8]} />
          <meshToonMaterial 
            color={config.primaryColor}
            emissive={config.accentColor}
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* White cartoon gloves (Sonic-style) */}
        <mesh position={[-0.9, 0.2, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.25, 16, 12]} />
          <meshToonMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0.9, 0.2, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.25, 16, 12]} />
          <meshToonMaterial color="#FFFFFF" />
        </mesh>
        
        {/* Enhanced Sonic-style speed trails and particles */}
        <Points ref={particleRef} positions={particles}>
          <PointMaterial 
            size={selectedCharacter === "jaxon" ? 0.12 : 0.15}
            color={config.particleColor}
            transparent
            opacity={0.9}
            sizeAttenuation
            depthWrite={false}
          />
        </Points>
        
        {/* Speed trail effect */}
        {player.speed > 2 && (
          <>
            <mesh position={[0, 0, -1]} rotation={[0, 0, 0]}>
              <planeGeometry args={[1.5, 0.3]} />
              <meshBasicMaterial 
                color={config.glowColor}
                transparent
                opacity={0.6}
                depthWrite={false}
              />
            </mesh>
            <mesh position={[0, 0, -1.5]} rotation={[0, 0, 0]}>
              <planeGeometry args={[1.2, 0.2]} />
              <meshBasicMaterial 
                color={config.particleColor}
                transparent
                opacity={0.4}
                depthWrite={false}
              />
            </mesh>
          </>
        )}
        
        {/* Power aura when running fast */}
        {player.speed > 3 && (
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[2, 16, 12]} />
            <meshBasicMaterial 
              color={config.glowColor}
              transparent
              opacity={0.1}
              depthWrite={false}
            />
          </mesh>
        )}
      </animated.group>
    </animated.group>
  );
}

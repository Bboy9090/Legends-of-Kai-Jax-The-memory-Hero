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
  
  // Superhero character color schemes - Spider-Man meets Sonic
  const characterConfig = {
    jaxon: {
      primaryColor: "#DC143C", // Deep Crimson Red
      accentColor: "#0D0D0D", // Obsidian Black
      glowColor: "#FF6B6B",   // Crimson glow
      particleColor: "#8B008B", // Purple energy
      muzzleColor: "#FFE4B5", // Cream/peach muzzle
      eyeColor: "#FFD700",    // Gold eyes
      pupilColor: "#000000",   // Black pupils
      gloveColor: "#36454F",   // Charcoal gray gauntlets
      shoeColor: "#0D0D0D"     // Black boots
    },
    kaison: {
      primaryColor: "#00CED1", // Cyan/Turquoise
      accentColor: "#FF6F00", // Electric Orange
      glowColor: "#40E0D0",   // Turquoise glow
      particleColor: "#FF6F00", // Electric Orange particles
      muzzleColor: "#FFE4B5", // Cream/peach muzzle
      eyeColor: "#00FF00",    // Green eyes (emerald)
      pupilColor: "#000000",   // Black pupils
      gloveColor: "#C0C0C0",   // Silver gloves
      shoeColor: "#FF6F00"     // Orange boots
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
        
        {/* Jaxon's Angular Dreads - Sharp, geometric hairstyle */}
        {selectedCharacter === "jaxon" && (
          <>
            {/* Central dread - angular and sharp */}
            <mesh position={[0, 2.3, -0.5]} rotation={[Math.PI / 3, 0, 0]}>
              <boxGeometry args={[0.2, 0.7, 0.2]} />
              <meshToonMaterial 
                color={config.accentColor}
                emissive={config.particleColor}
                emissiveIntensity={0.4}
              />
            </mesh>
            {/* Left angular dread */}
            <mesh position={[-0.35, 2.2, -0.4]} rotation={[Math.PI / 4, -Math.PI / 6, 0]}>
              <boxGeometry args={[0.15, 0.6, 0.15]} />
              <meshToonMaterial 
                color={config.accentColor}
                emissive={config.particleColor}
                emissiveIntensity={0.4}
              />
            </mesh>
            {/* Right angular dread */}
            <mesh position={[0.35, 2.2, -0.4]} rotation={[Math.PI / 4, Math.PI / 6, 0]}>
              <boxGeometry args={[0.15, 0.6, 0.15]} />
              <meshToonMaterial 
                color={config.accentColor}
                emissive={config.particleColor}
                emissiveIntensity={0.4}
              />
            </mesh>
            {/* Energy headband - glowing accent */}
            <mesh position={[0, 2.3, 0.1]} rotation={[0, 0, 0]}>
              <torusGeometry args={[0.65, 0.08, 8, 16]} />
              <meshToonMaterial 
                color={config.accentColor}
                emissive={config.accentColor}
                emissiveIntensity={0.6}
              />
            </mesh>
          </>
        )}
        
        {/* Kaison's Subtle Quills - Less pronounced, sleek design */}
        {selectedCharacter === "kaison" && (
          <>
            {/* Small back quill - subtle and sleek */}
            <mesh position={[0, 2.2, -0.4]} rotation={[Math.PI / 6, 0, 0]}>
              <coneGeometry args={[0.12, 0.4, 8]} />
              <meshToonMaterial 
                color={config.accentColor}
                emissive={config.particleColor}
                emissiveIntensity={0.5}
              />
            </mesh>
            {/* Small side quills */}
            <mesh position={[-0.25, 2.15, -0.3]} rotation={[Math.PI / 8, -Math.PI / 12, 0]}>
              <coneGeometry args={[0.08, 0.3, 6]} />
              <meshToonMaterial 
                color={config.accentColor}
                emissive={config.particleColor}
                emissiveIntensity={0.5}
              />
            </mesh>
            <mesh position={[0.25, 2.15, -0.3]} rotation={[Math.PI / 8, Math.PI / 12, 0]}>
              <coneGeometry args={[0.08, 0.3, 6]} />
              <meshToonMaterial 
                color={config.accentColor}
                emissive={config.particleColor}
                emissiveIntensity={0.5}
              />
            </mesh>
            {/* Streamlined headband - electric orange */}
            <mesh position={[0, 2.25, 0.1]} rotation={[0, 0, 0]}>
              <torusGeometry args={[0.65, 0.06, 8, 16]} />
              <meshToonMaterial 
                color={config.particleColor}
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
        
        {/* Character-specific boots/shoes */}
        <mesh position={[-0.4, -1.5, 0.2]} castShadow receiveShadow>
          <capsuleGeometry args={[0.2, 0.6]} />
          <meshToonMaterial color={config.shoeColor} />
        </mesh>
        <mesh position={[0.4, -1.5, 0.2]} castShadow receiveShadow>
          <capsuleGeometry args={[0.2, 0.6]} />
          <meshToonMaterial color={config.shoeColor} />
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
        
        {/* Character-specific gloves/gauntlets */}
        <mesh position={[-0.9, 0.2, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.25, 16, 12]} />
          <meshToonMaterial 
            color={config.gloveColor}
            emissive={config.gloveColor}
            emissiveIntensity={selectedCharacter === "kaison" ? 0.3 : 0.1}
          />
        </mesh>
        <mesh position={[0.9, 0.2, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.25, 16, 12]} />
          <meshToonMaterial 
            color={config.gloveColor}
            emissive={config.gloveColor}
            emissiveIntensity={selectedCharacter === "kaison" ? 0.3 : 0.1}
          />
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
        
        {/* Super/Hyper Transformation Visual Effects */}
        {player.powerLevel > 0 && (
          <>
            {selectedCharacter === "kaison" ? (
              <>
                {/* Super Kaison - Metallic Silver-Blue Aura */}
                <mesh position={[0, 0, 0]}>
                  <sphereGeometry args={[2.2, 24, 18]} />
                  <meshBasicMaterial 
                    color="#B0C4DE" // Light Steel Blue
                    transparent
                    opacity={0.25}
                    depthWrite={false}
                  />
                </mesh>
                {/* Electric Orange upward particles */}
                <mesh position={[0, -0.5, 0]}>
                  <coneGeometry args={[1.5, 4, 8]} />
                  <meshBasicMaterial 
                    color={config.particleColor}
                    transparent
                    opacity={0.15}
                    depthWrite={false}
                  />
                </mesh>
                {/* Silver shimmer effect */}
                <mesh position={[0, 1, 0]}>
                  <torusGeometry args={[1.8, 0.15, 12, 24]} />
                  <meshToonMaterial 
                    color="#C0C0C0"
                    emissive="#C0C0C0"
                    emissiveIntensity={0.8}
                    transparent
                    opacity={0.6}
                  />
                </mesh>
              </>
            ) : (
              <>
                {/* Hyper Jaxon - Purple-to-Red Pulsating Energy */}
                <mesh position={[0, 0, 0]}>
                  <sphereGeometry args={[2.5, 24, 18]} />
                  <meshBasicMaterial 
                    color="#8B008B" // Dark Magenta
                    transparent
                    opacity={0.3}
                    depthWrite={false}
                  />
                </mesh>
                {/* Chaotic dark energy trails */}
                <mesh position={[0, 0, -1]} rotation={[Math.PI / 4, animationTimeRef.current, 0]}>
                  <torusGeometry args={[2, 0.2, 8, 16]} />
                  <meshToonMaterial 
                    color="#DC143C"
                    emissive="#8B008B"
                    emissiveIntensity={1}
                    transparent
                    opacity={0.5}
                  />
                </mesh>
                {/* Pulsating purple core */}
                <mesh position={[0, 1, 0]}>
                  <sphereGeometry args={[1.2, 16, 12]} />
                  <meshBasicMaterial 
                    color="#8B008B"
                    transparent
                    opacity={Math.sin(animationTimeRef.current * 5) * 0.3 + 0.4}
                    depthWrite={false}
                  />
                </mesh>
              </>
            )}
            
            {/* Transformation duration indicator - glowing ring */}
            <mesh position={[0, -2, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[1.5, 2, 32]} />
              <meshToonMaterial 
                color={selectedCharacter === "kaison" ? "#00CED1" : "#DC143C"}
                emissive={selectedCharacter === "kaison" ? "#00CED1" : "#DC143C"}
                emissiveIntensity={1}
                transparent
                opacity={player.transformDuration / 600} // Fades as transformation ends
                depthWrite={false}
              />
            </mesh>
          </>
        )}
        
        {/* Web-Swinging Visual - Show web line when attached */}
        {player.webAttached && player.webAnchorPoint && (
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([
                  0, 0, 0, // Player position (relative)
                  player.webAnchorPoint[0] - player.x,
                  player.webAnchorPoint[1] - player.y,
                  player.webAnchorPoint[2] - player.z
                ])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial 
              color={selectedCharacter === "kaison" ? "#00CED1" : "#DC143C"}
              linewidth={3}
              opacity={0.8}
              transparent
            />
          </line>
        )}
      </animated.group>
    </animated.group>
  );
}

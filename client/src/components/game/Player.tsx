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
      glowColor: "#DC143C",   // Crimson glow
      particleColor: "#8B008B", // Purple energy
      muzzleColor: "#FFE4B5", // Cream/peach muzzle
      eyeColor: "#FFFFFF",    // White eye background
      pupilColor: "#FFD700",   // FIERY GOLD pupils
      gloveColor: "#36454F",   // Charcoal gray gauntlets
      shoeColor: "#36454F"     // Charcoal Gray shoes (NOT black)
    },
    kaison: {
      primaryColor: "#00CED1", // Vibrant Cyan/Turquoise
      accentColor: "#FF6F00", // Electric Orange
      glowColor: "#00CED1",   // Cyan glow
      particleColor: "#FF6F00", // Electric Orange particles
      muzzleColor: "#FFE4B5", // Cream/peach muzzle
      eyeColor: "#FFFFFF",    // White eye background
      pupilColor: "#00FF00",   // BRIGHT GREEN pupils
      gloveColor: "#C0C0C0",   // Silver gloves
      shoeColor: "#C0C0C0"     // SILVER shoes (NOT orange)
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
        {/* Sonic-style rounded body (SHORTER and WIDER torso) */}
        <mesh ref={meshRef} castShadow receiveShadow>
          <capsuleGeometry args={[0.8, 1.0]} />
          <meshToonMaterial 
            color={config.primaryColor} 
            emissive={config.accentColor}
            emissiveIntensity={0.3}
          />
        </mesh>
        
        {/* Large Sonic-style head (MUCH bigger proportion) */}
        <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
          <sphereGeometry args={[1.0, 32, 24]} />
          <meshToonMaterial 
            color={config.primaryColor}
            emissive={config.accentColor}
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* Cartoon-style muzzle/mouth area - Adjusted for bigger head */}
        <mesh position={[0, 1.15, 0.75]} castShadow receiveShadow>
          <sphereGeometry args={[0.4, 16, 12]} />
          <meshToonMaterial 
            color={config.muzzleColor || "#FFE4B5"}
          />
        </mesh>
        
        {/* Large Sonic-style eyes (adjusted for bigger head) */}
        <mesh position={[-0.3, 1.5, 0.65]}>
          <sphereGeometry args={[0.25, 16, 12]} />
          <meshToonMaterial color={config.eyeColor} />
        </mesh>
        <mesh position={[0.3, 1.5, 0.65]}>
          <sphereGeometry args={[0.25, 16, 12]} />
          <meshToonMaterial color={config.eyeColor} />
        </mesh>
        
        {/* Large cartoon pupils */}
        <mesh position={[-0.3, 1.5, 0.8]}>
          <sphereGeometry args={[0.15, 12, 8]} />
          <meshToonMaterial color={config.pupilColor} />
        </mesh>
        <mesh position={[0.3, 1.5, 0.8]}>
          <sphereGeometry args={[0.15, 12, 8]} />
          <meshToonMaterial color={config.pupilColor} />
        </mesh>
        
        {/* Eye shine highlights (Sonic-style) - Adjusted for bigger head */}
        <mesh position={[-0.25, 1.6, 0.85]}>
          <sphereGeometry args={[0.05, 8, 6]} />
          <meshToonMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[0.35, 1.6, 0.85]}>
          <sphereGeometry args={[0.05, 8, 6]} />
          <meshToonMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.8} />
        </mesh>
        
        {/* Jaxon's Angular Dreads - SHORTER and MORE ANGULAR (per spec) */}
        {selectedCharacter === "jaxon" && (
          <>
            {/* Main central angular dread - SHORTER, sharp geometric */}
            <mesh position={[0, 2.0, -0.5]} rotation={[Math.PI / 4, 0, 0]}>
              <boxGeometry args={[0.3, 0.7, 0.2]} />
              <meshToonMaterial 
                color={config.primaryColor} // Deep Crimson Red
                emissive={config.primaryColor}
                emissiveIntensity={0.4}
              />
            </mesh>
            
            {/* Left angular dread - SHORTER */}
            <mesh position={[-0.5, 1.95, -0.4]} rotation={[Math.PI / 5, -Math.PI / 6, -Math.PI / 12]}>
              <boxGeometry args={[0.22, 0.6, 0.18]} />
              <meshToonMaterial 
                color={config.primaryColor}
                emissive={config.primaryColor}
                emissiveIntensity={0.4}
              />
            </mesh>
            
            {/* Right angular dread - SHORTER */}
            <mesh position={[0.5, 1.95, -0.4]} rotation={[Math.PI / 5, Math.PI / 6, Math.PI / 12]}>
              <boxGeometry args={[0.22, 0.6, 0.18]} />
              <meshToonMaterial 
                color={config.primaryColor}
                emissive={config.primaryColor}
                emissiveIntensity={0.4}
              />
            </mesh>
            
            {/* Smaller side dreads */}
            <mesh position={[-0.65, 1.85, -0.3]} rotation={[Math.PI / 8, -Math.PI / 5, 0]}>
              <boxGeometry args={[0.15, 0.5, 0.14]} />
              <meshToonMaterial 
                color={config.primaryColor}
                emissive={config.primaryColor}
                emissiveIntensity={0.3}
              />
            </mesh>
            <mesh position={[0.65, 1.85, -0.3]} rotation={[Math.PI / 8, Math.PI / 5, 0]}>
              <boxGeometry args={[0.15, 0.5, 0.14]} />
              <meshToonMaterial 
                color={config.primaryColor}
                emissive={config.primaryColor}
                emissiveIntensity={0.3}
              />
            </mesh>
          </>
        )}
        
        {/* Kaison's Short Quills - LESS PRONOUNCED, swept back (per spec) */}
        {selectedCharacter === "kaison" && (
          <>
            {/* Central quill - SMALLER and swept back */}
            <mesh position={[0, 1.8, -0.35]} rotation={[Math.PI / 6, 0, 0]}>
              <coneGeometry args={[0.12, 0.35, 8]} />
              <meshToonMaterial 
                color={config.primaryColor} // Cyan/Turquoise
                emissive={config.accentColor} // Orange accent
                emissiveIntensity={0.5}
              />
            </mesh>
            
            {/* Side quills - small and swept back */}
            <mesh position={[-0.3, 1.75, -0.3]} rotation={[Math.PI / 8, -Math.PI / 10, -Math.PI / 16]}>
              <coneGeometry args={[0.08, 0.25, 6]} />
              <meshToonMaterial 
                color={config.primaryColor}
                emissive={config.accentColor}
                emissiveIntensity={0.4}
              />
            </mesh>
            <mesh position={[0.3, 1.75, -0.3]} rotation={[Math.PI / 8, Math.PI / 10, Math.PI / 16]}>
              <coneGeometry args={[0.08, 0.25, 6]} />
              <meshToonMaterial 
                color={config.primaryColor}
                emissive={config.accentColor}
                emissiveIntensity={0.4}
              />
            </mesh>
            
            {/* Upper side quills for fuller look but still subtle */}
            <mesh position={[-0.45, 1.7, -0.25]} rotation={[Math.PI / 10, -Math.PI / 8, -Math.PI / 12]}>
              <coneGeometry args={[0.06, 0.2, 6]} />
              <meshToonMaterial 
                color={config.primaryColor}
                emissive={config.accentColor}
                emissiveIntensity={0.3}
              />
            </mesh>
            <mesh position={[0.45, 1.7, -0.25]} rotation={[Math.PI / 10, Math.PI / 8, Math.PI / 12]}>
              <coneGeometry args={[0.06, 0.2, 6]} />
              <meshToonMaterial 
                color={config.primaryColor}
                emissive={config.accentColor}
                emissiveIntensity={0.3}
              />
            </mesh>
          </>
        )}
        
        {/* Sonic-style legs - SHORTER and closer to torso */}
        <mesh 
          ref={leftLegRef}
          position={[-0.4, -0.2, 0]} 
          castShadow
        >
          <capsuleGeometry args={[0.2, 0.6]} />
          <meshToonMaterial 
            color={config.primaryColor}
            emissive={config.accentColor}
            emissiveIntensity={0.2}
          />
        </mesh>
        <mesh 
          ref={rightLegRef}
          position={[0.4, -0.2, 0]} 
          castShadow
        >
          <capsuleGeometry args={[0.2, 0.6]} />
          <meshToonMaterial 
            color={config.primaryColor}
            emissive={config.accentColor}
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* Character-specific HUGE SONIC SHOES - EXAGGERATED */}
        <mesh position={[-0.4, -0.6, 0.2]} castShadow receiveShadow>
          <boxGeometry args={[0.7, 0.5, 1.0]} />
          <meshToonMaterial 
            color={config.shoeColor}
            emissive={config.shoeColor}
            emissiveIntensity={0.3}
          />
        </mesh>
        <mesh position={[0.4, -0.6, 0.2]} castShadow receiveShadow>
          <boxGeometry args={[0.7, 0.5, 1.0]} />
          <meshToonMaterial 
            color={config.shoeColor}
            emissive={config.shoeColor}
            emissiveIntensity={0.3}
          />
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
        
        {/* Character-specific gloves/gauntlets - DISTINCTIVE designs */}
        {selectedCharacter === "jaxon" ? (
          <>
            {/* Jaxon's CHARCOAL GAUNTLETS - angular and armored - MORE AGGRESSIVE */}
            <mesh position={[-0.9, 0.2, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.4, 0.4, 0.4]} />
              <meshToonMaterial 
                color={config.gloveColor} // Charcoal gray
                emissive="#0D0D0D"
                emissiveIntensity={0.5}
              />
            </mesh>
            <mesh position={[0.9, 0.2, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.4, 0.4, 0.4]} />
              <meshToonMaterial 
                color={config.gloveColor}
                emissive="#0D0D0D"
                emissiveIntensity={0.5}
              />
            </mesh>
            {/* Gauntlet spikes for Knuckles-like look */}
            <mesh position={[-0.9, 0.3, 0.3]} rotation={[Math.PI / 4, 0, 0]}>
              <coneGeometry args={[0.1, 0.25, 4]} />
              <meshToonMaterial 
                color="#0D0D0D"
                emissive="#DC143C"
                emissiveIntensity={0.6}
              />
            </mesh>
            <mesh position={[0.9, 0.3, 0.3]} rotation={[Math.PI / 4, 0, 0]}>
              <coneGeometry args={[0.1, 0.25, 4]} />
              <meshToonMaterial 
                color="#0D0D0D"
                emissive="#DC143C"
                emissiveIntensity={0.6}
              />
            </mesh>
          </>
        ) : (
          <>
            {/* Kaison's SILVER GLOVES - sleek and smooth */}
            <mesh position={[-0.9, 0.2, 0]} castShadow receiveShadow>
              <sphereGeometry args={[0.28, 20, 16]} />
              <meshToonMaterial 
                color="#C0C0C0" // Silver
                emissive="#C0C0C0"
                emissiveIntensity={0.5}
              />
            </mesh>
            <mesh position={[0.9, 0.2, 0]} castShadow receiveShadow>
              <sphereGeometry args={[0.28, 20, 16]} />
              <meshToonMaterial 
                color="#C0C0C0"
                emissive="#C0C0C0"
                emissiveIntensity={0.5}
              />
            </mesh>
            {/* Tech rings on gloves */}
            <mesh position={[-0.9, 0.35, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.2, 0.03, 8, 16]} />
              <meshToonMaterial color="#FF6F00" emissive="#FF6F00" emissiveIntensity={0.8} />
            </mesh>
            <mesh position={[0.9, 0.35, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.2, 0.03, 8, 16]} />
              <meshToonMaterial color="#FF6F00" emissive="#FF6F00" emissiveIntensity={0.8} />
            </mesh>
          </>
        )}
        
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

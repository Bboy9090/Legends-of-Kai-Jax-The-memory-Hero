import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useSpring, animated } from "@react-spring/three";
import * as THREE from "three";
import { Points, PointMaterial } from "@react-three/drei";
import { type Enemy as EnemyType } from "../../lib/gameLogic";
import { useRunner } from "../../lib/stores/useRunner";

interface EnemyProps {
  enemy: EnemyType;
}

export default function Enemy({ enemy }: EnemyProps) {
  const meshRef = useRef<THREE.Group>(null);
  const eyeRef = useRef<THREE.Group>(null);
  const { player, takeDamage } = useRunner();
  
  const [isAggressive, setIsAggressive] = useState(false);
  const [attackCooldown, setAttackCooldown] = useState(0);
  const [lastAttackTime, setLastAttackTime] = useState(0);
  
  // Enhanced enemy AI state
  const [aiState, setAiState] = useState<'patrol' | 'aggressive' | 'attacking' | 'stunned'>('patrol');
  
  // Pre-calculate random values for visual effects
  const effectParticles = useMemo(() => {
    const count = enemy.enemyType === 'scuttle' ? 15 : enemy.enemyType === 'stomper' ? 20 : 12;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      position: [
        (Math.random() - 0.5) * 2, 
        Math.random() * 1.5, 
        (Math.random() - 0.5) * 2
      ] as [number, number, number],
      radius: 0.05 + Math.random() * 0.08,
      speed: 0.5 + Math.random() * 1.5
    }));
  }, [enemy.id, enemy.enemyType]);
  
  // Enhanced AI animation with aggressive behaviors
  useFrame((state, delta) => {
    if (!meshRef.current || !enemy.active) return;
    
    const time = state.clock.elapsedTime;
    // 2.5D Distance: Use X-axis (horizontal) distance for side-scroller
    const distanceToPlayer = Math.abs(player.x - enemy.position.x);
    const isPlayerNear = distanceToPlayer < 8; // Closer threshold for 2.5D
    
    // Update attack cooldown
    if (attackCooldown > 0) {
      setAttackCooldown(prev => Math.max(0, prev - delta));
    }
    
    // AI State Management
    if (isPlayerNear && aiState === 'patrol') {
      setAiState('aggressive');
      setIsAggressive(true);
    } else if (!isPlayerNear && aiState === 'aggressive') {
      setAiState('patrol');
      setIsAggressive(false);
    }
    
    // Enhanced animations based on enemy type and AI state
    if (enemy.enemyType === "scuttle") {
      // Scuttle bots - fast and erratic when aggressive
      const speed = isAggressive ? enemy.speed * 1.5 : enemy.speed;
      meshRef.current.position.z -= speed * delta;
      
      // Aggressive scuttling with more intense rotation
      meshRef.current.rotation.y += delta * (isAggressive ? 15 : 8);
      
      // Bouncing motion when aggressive
      if (isAggressive) {
        meshRef.current.position.y = Math.abs(Math.sin(time * 12)) * 0.3;
      }
      
    } else if (enemy.enemyType === "stomper") {
      // Stomper bots - powerful and intimidating
      const stompIntensity = isAggressive ? 6 : 4;
      const stomp = Math.sin(time * stompIntensity);
      meshRef.current.scale.y = 1 + Math.abs(stomp) * (isAggressive ? 0.4 : 0.2);
      meshRef.current.position.y = Math.abs(stomp) * (isAggressive ? 0.8 : 0.5);
      
      // Lean forward when aggressive
      if (isAggressive) {
        meshRef.current.rotation.x = Math.sin(time * 3) * 0.2;
      }
      
      // Attack detection
      if (isPlayerNear && attackCooldown <= 0 && Math.abs(player.x - enemy.position.x) < 2) {
        setAttackCooldown(2.0); // 2 second cooldown
        setLastAttackTime(time);
        takeDamage(25); // Heavy damage from stomper
        console.log('Stomper attacks with ground slam!');
      }
      
    } else if (enemy.enemyType === "goo") {
      // Goo bots - unpredictable and sticky
      const wobbleSpeed = isAggressive ? 5 : 3;
      meshRef.current.scale.x = 1 + Math.sin(time * wobbleSpeed) * 0.15;
      meshRef.current.scale.z = 1 + Math.cos(time * wobbleSpeed) * 0.15;
      
      // Pulsing glow when aggressive
      if (isAggressive) {
        meshRef.current.scale.y = 1 + Math.sin(time * 8) * 0.1;
      }
      
      // Spread goo attack
      if (isPlayerNear && attackCooldown <= 0) {
        setAttackCooldown(3.0); // 3 second cooldown
        takeDamage(15); // Moderate damage + slow effect
        console.log('Goo bot spreads sticky trap!');
      }
    }
    
    // Eye tracking - always look at player when aggressive
    if (eyeRef.current && isAggressive) {
      const direction = new THREE.Vector3(
        player.x - enemy.position.x,
        player.y - enemy.position.y,
        player.z - enemy.position.z
      ).normalize();
      
      eyeRef.current.lookAt(
        enemy.position.x + direction.x,
        enemy.position.y + direction.y,
        enemy.position.z + direction.z
      );
    }
  });
  
  // Don't render if not active
  if (!enemy.active) return null;
  
  const getEnemyConfig = () => {
    switch (enemy.enemyType) {
      case "scuttle": return {
        primaryColor: "#FF2222", // Bright red like classic Sonic badniks
        accentColor: "#CC0000",  // Dark red
        glowColor: "#FF6666",    // Light red glow  
        eyeColor: "#000000"      // Black pupils
      };
      case "stomper": return {
        primaryColor: "#4444FF", // Bright blue
        accentColor: "#2222CC",  // Dark blue
        glowColor: "#6666FF",    // Light blue glow
        eyeColor: "#000000"      // Black pupils
      };
      case "goo": return {
        primaryColor: "#44FF44", // Bright green
        accentColor: "#22CC22",  // Dark green
        glowColor: "#66FF66",    // Light green glow
        eyeColor: "#000000"      // Black pupils
      };
      default: return {
        primaryColor: "#FF44FF", // Bright magenta
        accentColor: "#CC22CC",  // Dark magenta
        glowColor: "#FF66FF",    // Light magenta glow
        eyeColor: "#000000"      // Black pupils
      };
    }
  };
  
  const config = getEnemyConfig();
  const aggressiveGlow = isAggressive ? 0.8 : 0.3;
  
  const getEnemySize = () => {
    switch (enemy.enemyType) {
      case "scuttle": return [1, 0.5, 1] as [number, number, number];
      case "stomper": return [2, 2.5, 2] as [number, number, number];
      case "goo": return [1.5, 1, 1.5] as [number, number, number];
      default: return [1, 1, 1] as [number, number, number];
    }
  };
  
  return (
    <group ref={meshRef} position={enemy.position}>
      {/* Sonic-style rounded enemy body */}
      <mesh castShadow receiveShadow>
        <capsuleGeometry args={[getEnemySize()[0] * 0.4, getEnemySize()[1] * 0.7]} />
        <meshToonMaterial 
          color={config.primaryColor}
          emissive={config.accentColor}
          emissiveIntensity={aggressiveGlow}
        />
      </mesh>
      
      {/* Cartoon-style enemy head */}
      <mesh position={[0, getEnemySize()[1] * 0.6, 0]} castShadow receiveShadow>
        <sphereGeometry args={[getEnemySize()[0] * 0.4, 16, 12]} />
        <meshToonMaterial 
          color={config.primaryColor}
          emissive={config.accentColor}
          emissiveIntensity={aggressiveGlow * 0.8}
        />
      </mesh>
      
      {/* Large cartoon eyes */}
      <mesh position={[-0.2, getEnemySize()[1] * 0.7, 0.3]} castShadow receiveShadow>
        <sphereGeometry args={[0.15, 12, 8]} />
        <meshToonMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[0.2, getEnemySize()[1] * 0.7, 0.3]} castShadow receiveShadow>
        <sphereGeometry args={[0.15, 12, 8]} />
        <meshToonMaterial color="#FFFFFF" />
      </mesh>
      
      {/* Cartoon pupils */}
      <mesh position={[-0.2, getEnemySize()[1] * 0.7, 0.4]} castShadow receiveShadow>
        <sphereGeometry args={[0.08, 8, 6]} />
        <meshToonMaterial color={config.eyeColor} />
      </mesh>
      <mesh position={[0.2, getEnemySize()[1] * 0.7, 0.4]} castShadow receiveShadow>
        <sphereGeometry args={[0.08, 8, 6]} />
        <meshToonMaterial color={config.eyeColor} />
      </mesh>
      
      {/* Aggressive glow aura when near player */}
      {isAggressive && (
        <mesh>
          <sphereGeometry args={[getEnemySize()[0] * 1.5, 16, 12]} />
          <meshBasicMaterial 
            color={config.glowColor}
            transparent
            opacity={0.2}
            depthWrite={false}
          />
        </mesh>
      )}
      
      {/* Enhanced Scuttle Bot Features */}
      {enemy.enemyType === "scuttle" && (
        <>
          {/* Razor-sharp legs with sparks */}
          {[-0.3, 0.3].map((x, i) =>
            [-0.3, 0.3].map((z, j) => (
              <group key={`leg_${i}_${j}`}>
                <mesh position={[x, -0.5, z]} castShadow>
                  <cylinderGeometry args={[0.08, 0.05, 0.5]} />
                  <meshStandardMaterial 
                    color="#2C3E50"
                    metalness={0.9}
                    roughness={0.1}
                    emissive={isAggressive ? "#FF4444" : "#000000"}
                    emissiveIntensity={isAggressive ? 0.3 : 0}
                  />
                </mesh>
                {/* Sparks when aggressive */}
                {isAggressive && (
                  <mesh position={[x, -0.7, z]}>
                    <sphereGeometry args={[0.1]} />
                    <meshStandardMaterial 
                      color="#FFFF00"
                      emissive="#FFFF00"
                      emissiveIntensity={1.0}
                    />
                  </mesh>
                )}
              </group>
            ))
          )}
          
          {/* Menacing Eyes */}
          <group ref={eyeRef}>
            <mesh position={[-0.2, 0.3, 0.5]} castShadow>
              <sphereGeometry args={[0.12]} />
              <meshStandardMaterial 
                color={config.eyeColor}
                emissive={config.eyeColor}
                emissiveIntensity={isAggressive ? 1.2 : 0.6}
              />
            </mesh>
            <mesh position={[0.2, 0.3, 0.5]} castShadow>
              <sphereGeometry args={[0.12]} />
              <meshStandardMaterial 
                color={config.eyeColor}
                emissive={config.eyeColor}
                emissiveIntensity={isAggressive ? 1.2 : 0.6}
              />
            </mesh>
          </group>
        </>
      )}
      
      {/* Enhanced Stomper Bot Features */}
      {enemy.enemyType === "stomper" && (
        <>
          {/* Massive crushing arms */}
          <mesh position={[-1.4, 0, 0]} castShadow>
            <boxGeometry args={[0.4, 2, 0.4]} />
            <meshStandardMaterial 
              color={config.primaryColor}
              metalness={0.8}
              roughness={0.2}
              emissive={isAggressive ? config.accentColor : "#000000"}
              emissiveIntensity={isAggressive ? 0.5 : 0}
            />
          </mesh>
          <mesh position={[1.4, 0, 0]} castShadow>
            <boxGeometry args={[0.4, 2, 0.4]} />
            <meshStandardMaterial 
              color={config.primaryColor}
              metalness={0.8}
              roughness={0.2}
              emissive={isAggressive ? config.accentColor : "#000000"}
              emissiveIntensity={isAggressive ? 0.5 : 0}
            />
          </mesh>
          
          {/* Intimidating spikes */}
          {[-1.4, 1.4].map((x, i) => (
            <mesh key={`spike_${i}`} position={[x, 1.2, 0]} castShadow>
              <coneGeometry args={[0.1, 0.6]} />
              <meshStandardMaterial 
                color="#E74C3C"
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
          ))}
          
          {/* Blazing red eyes */}
          <group ref={eyeRef}>
            <mesh position={[-0.4, 0.7, 1.2]} castShadow>
              <sphereGeometry args={[0.15]} />
              <meshStandardMaterial 
                color={config.eyeColor}
                emissive={config.eyeColor}
                emissiveIntensity={isAggressive ? 1.5 : 0.8}
              />
            </mesh>
            <mesh position={[0.4, 0.7, 1.2]} castShadow>
              <sphereGeometry args={[0.15]} />
              <meshStandardMaterial 
                color={config.eyeColor}
                emissive={config.eyeColor}
                emissiveIntensity={isAggressive ? 1.5 : 0.8}
              />
            </mesh>
          </group>
          
          {/* Ground slam warning effect */}
          {attackCooldown > 1.5 && (
            <mesh position={[0, -1.5, 0]} rotation={[-Math.PI/2, 0, 0]}>
              <ringGeometry args={[2, 3, 16]} />
              <meshStandardMaterial 
                color="#FF4444"
                transparent
                opacity={0.6}
                emissive="#FF4444"
                emissiveIntensity={0.8}
              />
            </mesh>
          )}
        </>
      )}
      
      {/* Enhanced Goo Bot Features */}
      {enemy.enemyType === "goo" && (
        <>
          {/* Toxic goo trail */}
          <mesh position={[0, -0.8, -1]} receiveShadow>
            <planeGeometry args={[2.5, 4]} />
            <meshStandardMaterial 
              color={config.glowColor}
              transparent 
              opacity={isAggressive ? 0.8 : 0.5}
              emissive={config.glowColor}
              emissiveIntensity={isAggressive ? 0.6 : 0.3}
            />
          </mesh>
          
          {/* Bubbling toxic particles */}
          {effectParticles.map((particle: any) => (
            <mesh key={`particle_${particle.id}`} position={particle.position} castShadow>
              <sphereGeometry args={[particle.radius]} />
              <meshStandardMaterial 
                color={config.accentColor}
                transparent 
                opacity={0.9}
                emissive={config.accentColor}
                emissiveIntensity={isAggressive ? 0.8 : 0.4}
              />
            </mesh>
          ))}
          
          {/* Glowing core */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.3]} />
            <meshStandardMaterial 
              color={config.eyeColor}
              emissive={config.eyeColor}
              emissiveIntensity={isAggressive ? 1.2 : 0.6}
              transparent
              opacity={0.8}
            />
          </mesh>
          
          {/* Spreading goo attack warning */}
          {attackCooldown > 2.0 && (
            <mesh position={[0, -0.5, 0]} rotation={[-Math.PI/2, 0, 0]}>
              <ringGeometry args={[1, 4, 16]} />
              <meshStandardMaterial 
                color={config.glowColor}
                transparent
                opacity={0.4}
                emissive={config.glowColor}
                emissiveIntensity={0.8}
              />
            </mesh>
          )}
        </>
      )}
      
      {/* Power particle effects for all enemies */}
      <Points positions={new Float32Array(effectParticles.map(p => p.position).flat())}>
        <PointMaterial 
          size={isAggressive ? 0.08 : 0.05}
          color={config.glowColor}
          transparent
          opacity={isAggressive ? 1.0 : 0.6}
          sizeAttenuation
          depthWrite={false}
        />
      </Points>
    </group>
  );
}

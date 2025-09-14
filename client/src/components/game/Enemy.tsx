import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { type Enemy as EnemyType } from "../../lib/gameLogic";

interface EnemyProps {
  enemy: EnemyType;
}

export default function Enemy({ enemy }: EnemyProps) {
  const meshRef = useRef<THREE.Group>(null);
  
  // Pre-calculate random values for goo bubbles to avoid Math.random() in render
  const gooBubbles = useMemo(() => {
    return [0, 1, 2].map(i => ({
      id: i,
      position: [
        (Math.random() - 0.5) * 1.5, 
        0.5 + Math.random() * 0.5, 
        (Math.random() - 0.5) * 1.5
      ] as [number, number, number],
      radius: 0.1 + Math.random() * 0.1
    }));
  }, [enemy.id]); // Only recalculate if enemy changes
  
  // Simple movement animation for scuttle bots
  useFrame((state, delta) => {
    if (!meshRef.current || !enemy.active) return;
    
    if (enemy.enemyType === "scuttle") {
      // Scuttle bots move forward quickly
      meshRef.current.position.z -= enemy.speed * delta;
      
      // Simple scuttling animation
      meshRef.current.rotation.y += delta * 10;
    } else if (enemy.enemyType === "stomper") {
      // Stomper bots have a stomping animation
      const stomp = Math.sin(state.clock.elapsedTime * 4);
      meshRef.current.scale.y = 1 + stomp * 0.2;
      meshRef.current.position.y = Math.abs(stomp) * 0.5;
    } else if (enemy.enemyType === "goo") {
      // Goo bots have a wobbling effect
      meshRef.current.scale.x = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      meshRef.current.scale.z = 1 + Math.cos(state.clock.elapsedTime * 3) * 0.1;
    }
  });
  
  // Don't render if not active
  if (!enemy.active) return null;
  
  const getEnemyColor = () => {
    switch (enemy.enemyType) {
      case "scuttle": return "#FF6B6B";
      case "stomper": return "#4ECDC4";
      case "goo": return "#45B7D1";
      default: return "#FF6B6B";
    }
  };
  
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
      {/* Main enemy body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={getEnemySize()} />
        <meshLambertMaterial color={getEnemyColor()} />
      </mesh>
      
      {/* Enemy-specific features */}
      {enemy.enemyType === "scuttle" && (
        <>
          {/* Scuttle bot legs */}
          {[-0.3, 0.3].map((x, i) =>
            [-0.3, 0.3].map((z, j) => (
              <mesh key={`leg_${i}_${j}`} position={[x, -0.5, z]} castShadow>
                <cylinderGeometry args={[0.05, 0.05, 0.4]} />
                <meshLambertMaterial color="#333333" />
              </mesh>
            ))
          )}
        </>
      )}
      
      {enemy.enemyType === "stomper" && (
        <>
          {/* Stomper bot arms */}
          <mesh position={[-1.2, 0, 0]} castShadow>
            <boxGeometry args={[0.3, 1.5, 0.3]} />
            <meshLambertMaterial color="#2C3E50" />
          </mesh>
          <mesh position={[1.2, 0, 0]} castShadow>
            <boxGeometry args={[0.3, 1.5, 0.3]} />
            <meshLambertMaterial color="#2C3E50" />
          </mesh>
          
          {/* Stomper eyes */}
          <mesh position={[-0.3, 0.5, 1]} castShadow>
            <sphereGeometry args={[0.1]} />
            <meshLambertMaterial color="#FF0000" />
          </mesh>
          <mesh position={[0.3, 0.5, 1]} castShadow>
            <sphereGeometry args={[0.1]} />
            <meshLambertMaterial color="#FF0000" />
          </mesh>
        </>
      )}
      
      {enemy.enemyType === "goo" && (
        <>
          {/* Goo trail effect */}
          <mesh position={[0, -0.8, -1]} receiveShadow>
            <planeGeometry args={[2, 3]} />
            <meshLambertMaterial color="#45B7D1" transparent opacity={0.6} />
          </mesh>
          
          {/* Goo bubbles */}
          {gooBubbles.map(bubble => (
            <mesh key={`bubble_${bubble.id}`} position={bubble.position} castShadow>
              <sphereGeometry args={[bubble.radius]} />
              <meshLambertMaterial color="#87CEEB" transparent opacity={0.8} />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}

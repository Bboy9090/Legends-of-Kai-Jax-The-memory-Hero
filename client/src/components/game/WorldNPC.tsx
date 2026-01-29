import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { type NPCDialogue } from '../../lib/worldDialogue';

interface WorldNPCProps {
  npc: NPCDialogue;
  position: [number, number, number];
  onInteract: (npc: NPCDialogue) => void;
  playerPosition: [number, number, number];
}

export default function WorldNPC({ npc, position, onInteract, playerPosition }: WorldNPCProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isNearby, setIsNearby] = useState(false);
  const [hovered, setHovered] = useState(false);
  
  const interactDistance = 4;
  
  useFrame(() => {
    if (meshRef.current) {
      const dx = playerPosition[0] - position[0];
      const dz = playerPosition[2] - position[2];
      const distance = Math.sqrt(dx * dx + dz * dz);
      
      const wasNearby = isNearby;
      const nowNearby = distance < interactDistance;
      
      if (wasNearby !== nowNearby) {
        setIsNearby(nowNearby);
      }
      
      meshRef.current.rotation.y += 0.005;
    }
  });
  
  const handleClick = () => {
    if (isNearby) {
      onInteract(npc);
    }
  };
  
  const getNPCColor = () => {
    if (npc.hint) return '#00ffff';
    return '#88ff88';
  };
  
  return (
    <group position={position}>
      <mesh 
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <capsuleGeometry args={[0.4, 1.2, 8, 16]} />
        <meshStandardMaterial 
          color={getNPCColor()} 
          emissive={isNearby || hovered ? getNPCColor() : '#000000'}
          emissiveIntensity={isNearby ? 0.5 : hovered ? 0.3 : 0}
        />
      </mesh>
      
      <mesh position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial 
          color="#ffcc88" 
          emissive={isNearby ? '#ffcc88' : '#000000'}
          emissiveIntensity={isNearby ? 0.3 : 0}
        />
      </mesh>
      
      {(isNearby || hovered) && (
        <>
          <Text
            position={[0, 2.2, 0]}
            fontSize={0.3}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="black"
          >
            {npc.npcName}
          </Text>
          
          {isNearby && (
            <Text
              position={[0, 1.9, 0]}
              fontSize={0.15}
              color="#aaaaaa"
              anchorX="center"
              anchorY="middle"
            >
              [Click to talk]
            </Text>
          )}
          
          {npc.hint && (
            <mesh position={[0, 2.5, 0]}>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={1} />
            </mesh>
          )}
        </>
      )}
      
      {isNearby && (
        <pointLight position={[0, 1, 0]} color={getNPCColor()} intensity={2} distance={5} />
      )}
    </group>
  );
}

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { type WorldEncounter } from '../../lib/worldDialogue';

interface TriggerZoneProps {
  encounter: WorldEncounter;
  playerPosition: [number, number, number];
  onTrigger: (encounter: WorldEncounter) => void;
  hasFlag: (flag: string) => boolean;
  isTriggered: boolean;
}

export default function TriggerZone({ 
  encounter, 
  playerPosition, 
  onTrigger, 
  hasFlag,
  isTriggered 
}: TriggerZoneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [pulsePhase, setPulsePhase] = useState(0);
  
  const canTrigger = !isTriggered && 
    (!encounter.requiredFlag || hasFlag(encounter.requiredFlag));
  
  useFrame((_, delta) => {
    if (!canTrigger) return;
    
    setPulsePhase(prev => (prev + delta * 2) % (Math.PI * 2));
    
    const dx = playerPosition[0] - encounter.location[0];
    const dy = playerPosition[1] - encounter.location[1];
    const dz = playerPosition[2] - encounter.location[2];
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    if (distance < encounter.triggerRadius) {
      onTrigger(encounter);
    }
  });
  
  if (!canTrigger) return null;
  
  const pulseScale = 1 + Math.sin(pulsePhase) * 0.1;
  const glowIntensity = 0.3 + Math.sin(pulsePhase) * 0.2;
  
  const getZoneColor = () => {
    switch (encounter.type) {
      case 'cutscene': return '#ffaa00';
      case 'battle': return '#ff4444';
      case 'dialogue': return '#00ffaa';
      default: return '#ffffff';
    }
  };
  
  return (
    <group position={encounter.location}>
      <mesh ref={meshRef} scale={[pulseScale, 1, pulseScale]}>
        <cylinderGeometry args={[encounter.triggerRadius, encounter.triggerRadius, 0.1, 32]} />
        <meshStandardMaterial 
          color={getZoneColor()} 
          transparent 
          opacity={0.2}
          emissive={getZoneColor()}
          emissiveIntensity={glowIntensity}
        />
      </mesh>
      
      <mesh position={[0, 0.5, 0]} rotation={[0, pulsePhase * 0.5, 0]}>
        <torusGeometry args={[encounter.triggerRadius * 0.8, 0.05, 8, 32]} />
        <meshStandardMaterial 
          color={getZoneColor()} 
          transparent 
          opacity={0.5}
          emissive={getZoneColor()}
          emissiveIntensity={0.5}
        />
      </mesh>
      
      <pointLight 
        position={[0, 2, 0]} 
        color={getZoneColor()} 
        intensity={3} 
        distance={encounter.triggerRadius * 2} 
      />
    </group>
  );
}

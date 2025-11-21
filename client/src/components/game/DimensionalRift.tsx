import { Canvas } from '@react-three/fiber';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Animated dimensional rift portal effect
function RiftPortal({ position, color }: { position: [number, number, number]; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = clock.getElapsedTime() * 0.5;
      meshRef.current.scale.setScalar(1 + Math.sin(clock.getElapsedTime() * 2) * 0.1);
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = -clock.getElapsedTime() * 0.3;
      ringRef.current.scale.setScalar(1.2 + Math.sin(clock.getElapsedTime() * 3) * 0.05);
    }
  });

  return (
    <group position={position}>
      {/* Core portal */}
      <mesh ref={meshRef}>
        <torusGeometry args={[1.5, 0.5, 16, 32]} />
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={2}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Energy ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[2, 0.1, 8, 32]} />
        <meshStandardMaterial 
          color="#00BFFF"
          emissive="#00BFFF"
          emissiveIntensity={3}
        />
      </mesh>

      {/* Portal center */}
      <mesh>
        <circleGeometry args={[1.2, 32]} />
        <meshBasicMaterial 
          color={color}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Particle effects */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 2.5;
        return (
          <mesh key={i} position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial 
              color="#FFFFFF"
              emissive="#FFFFFF"
              emissiveIntensity={2}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export default function DimensionalRift({ position, color = "#FF00FF" }: { position: [number, number, number]; color?: string }) {
  return (
    <RiftPortal position={position} color={color} />
  );
}

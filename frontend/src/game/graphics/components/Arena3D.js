/**
 * 3D Combat Arena
 * Cyberpunk city environment with proper lighting layers
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Ground plane with grid
const Ground = () => {
  const gridRef = useRef();
  
  useFrame((state) => {
    if (gridRef.current) {
      // Subtle pulse animation
      gridRef.current.material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });
  
  return (
    <group>
      {/* Main ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial
          color="#0a0a15"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      
      {/* Glowing grid lines */}
      <mesh ref={gridRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[50, 50, 50, 50]} />
        <meshBasicMaterial
          color="#2E2EFE"
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>
      
      {/* Center arena highlight */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[8, 10, 64]} />
        <meshBasicMaterial
          color="#2E2EFE"
          transparent
          opacity={0.2}
        />
      </mesh>
    </group>
  );
};

// City building
const Building = ({ position, height, width, depth, emissiveColor }) => {
  const windowsRef = useRef();
  
  useFrame((state) => {
    if (windowsRef.current) {
      // Flickering windows
      windowsRef.current.material.emissiveIntensity = 
        0.5 + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.3;
    }
  });
  
  return (
    <group position={position}>
      {/* Building body */}
      <mesh position={[0, height / 2, 0]} castShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color="#0f0f1a"
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>
      
      {/* Windows/lights strip */}
      <mesh ref={windowsRef} position={[0, height / 2, depth / 2 + 0.01]}>
        <planeGeometry args={[width * 0.8, height * 0.8]} />
        <meshStandardMaterial
          color="#000000"
          emissive={emissiveColor}
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
};

// Neon sign
const NeonSign = ({ position, color, text, scale = 1 }) => {
  const signRef = useRef();
  
  useFrame((state) => {
    if (signRef.current) {
      // Neon flicker
      const flicker = Math.sin(state.clock.elapsedTime * 10) > 0.95 ? 0.5 : 1;
      signRef.current.material.emissiveIntensity = 2 * flicker;
    }
  });
  
  return (
    <mesh ref={signRef} position={position} scale={scale}>
      <boxGeometry args={[3, 0.5, 0.1]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2}
      />
    </mesh>
  );
};

// Cityscape
const Cityscape = () => {
  const buildings = useMemo(() => {
    const result = [];
    const colors = ['#FF3B30', '#FFD60A', '#64D2FF', '#BF5AF2', '#30D158'];
    
    // Back row
    for (let i = -6; i <= 6; i++) {
      const height = 8 + Math.random() * 12;
      result.push({
        position: [i * 6, 0, -20 - Math.random() * 5],
        height,
        width: 3 + Math.random() * 2,
        depth: 3 + Math.random() * 2,
        emissiveColor: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    
    // Side buildings (left)
    for (let i = 0; i < 5; i++) {
      const height = 6 + Math.random() * 8;
      result.push({
        position: [-18 - Math.random() * 3, 0, -5 + i * 5],
        height,
        width: 3 + Math.random() * 2,
        depth: 3 + Math.random() * 2,
        emissiveColor: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    
    // Side buildings (right)
    for (let i = 0; i < 5; i++) {
      const height = 6 + Math.random() * 8;
      result.push({
        position: [18 + Math.random() * 3, 0, -5 + i * 5],
        height,
        width: 3 + Math.random() * 2,
        depth: 3 + Math.random() * 2,
        emissiveColor: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    
    return result;
  }, []);
  
  return (
    <group>
      {buildings.map((b, i) => (
        <Building key={i} {...b} />
      ))}
    </group>
  );
};

// Atmospheric particles
const AtmosphericParticles = ({ count = 100 }) => {
  const particlesRef = useRef();
  
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = Math.random() * 15;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
      
      // Random colors (cyan, purple, yellow)
      const colorChoice = Math.random();
      if (colorChoice < 0.33) {
        colors[i * 3] = 0.4; colors[i * 3 + 1] = 0.8; colors[i * 3 + 2] = 1.0;
      } else if (colorChoice < 0.66) {
        colors[i * 3] = 0.75; colors[i * 3 + 1] = 0.35; colors[i * 3 + 2] = 0.95;
      } else {
        colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.84; colors[i * 3 + 2] = 0.04;
      }
      
      sizes[i] = Math.random() * 0.5 + 0.1;
    }
    
    return { positions, colors, sizes };
  }, [count]);
  
  useFrame((state) => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array;
      
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 1] += 0.01; // Float up
        
        // Reset when too high
        if (positions[i * 3 + 1] > 15) {
          positions[i * 3 + 1] = 0;
        }
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
};

// Main Arena Component
const Arena3D = () => {
  return (
    <group>
      <Ground />
      <Cityscape />
      <AtmosphericParticles count={150} />
      
      {/* Neon signs */}
      <NeonSign position={[-12, 8, -15]} color="#FF3B30" scale={1.5} />
      <NeonSign position={[12, 10, -18]} color="#64D2FF" scale={1.2} />
      <NeonSign position={[0, 12, -22]} color="#BF5AF2" scale={2} />
      
      {/* Fog for depth */}
      <fog attach="fog" args={['#0a0a15', 20, 60]} />
    </group>
  );
};

export default Arena3D;
export { Ground, Building, Cityscape, AtmosphericParticles };

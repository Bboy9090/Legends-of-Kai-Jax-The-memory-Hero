/**
 * Enhanced Graphics System
 * Provides improved lighting, materials, and visual effects for characters
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Creates enhanced PBR-like materials with better visual quality
 */
export function useEnhancedMaterial(color: string, accentColor: string, emissiveIntensity: number = 0.3) {
  return useMemo(() => {
    return new THREE.MeshToonMaterial({
      color: color,
      emissive: accentColor,
      emissiveIntensity: emissiveIntensity,
      // Enable better rendering
      side: THREE.FrontSide,
      transparent: false,
      depthWrite: true,
      depthTest: true,
    });
  }, [color, accentColor, emissiveIntensity]);
}

/**
 * Rim lighting effect for better character definition
 */
export function RimLight({ intensity = 1.0, color = '#ffffff' }: { intensity?: number; color?: string }) {
  return (
    <>
      {/* Key light from front-top */}
      <directionalLight
        position={[5, 8, 5]}
        intensity={intensity * 1.2}
        color={color}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      {/* Rim light from back-top for edge definition */}
      <directionalLight
        position={[-3, 5, -5]}
        intensity={intensity * 0.8}
        color="#a0c8ff"
      />
      
      {/* Fill light from below to prevent pure black shadows */}
      <hemisphereLight
        intensity={intensity * 0.4}
        color="#ffffff"
        groundColor="#444444"
      />
      
      {/* Point light for dynamic highlights */}
      <pointLight
        position={[0, 3, 3]}
        intensity={intensity * 0.6}
        color="#ffeecc"
        distance={15}
        decay={2}
      />
    </>
  );
}

/**
 * Motion blur effect for fast movements
 */
export function MotionBlurTrail({
  position,
  color,
  intensity,
}: {
  position: [number, number, number];
  color: string;
  intensity: number;
}) {
  const trailRef = useRef<THREE.Mesh>(null);
  const positions = useRef<THREE.Vector3[]>([]);
  const maxPositions = 8;

  useFrame(() => {
    if (intensity < 0.3) return;

    // Add current position to trail
    positions.current.push(new THREE.Vector3(position[0], position[1], position[2]));
    
    // Keep only recent positions
    if (positions.current.length > maxPositions) {
      positions.current.shift();
    }
  });

  if (intensity < 0.3) return null;

  return (
    <group>
      {positions.current.map((pos, i) => {
        const alpha = (i / maxPositions) * intensity;
        const scale = 0.5 + (i / maxPositions) * 0.5;
        
        return (
          <mesh key={i} position={[pos.x, pos.y, pos.z]} scale={scale}>
            <sphereGeometry args={[0.3, 8, 8]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={alpha * 0.4}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/**
 * Impact particles for hits and attacks
 */
export function ImpactParticles({
  position,
  color,
  active,
}: {
  position: [number, number, number];
  color: string;
  active: boolean;
}) {
  const particlesRef = useRef<THREE.Points>(null);
  const timeRef = useRef(0);

  useFrame((state, delta) => {
    if (!active || !particlesRef.current) return;

    timeRef.current += delta;
    
    // Fade out and expand particles
    const scale = 1 + timeRef.current * 2;
    particlesRef.current.scale.setScalar(scale);
    
    const opacity = Math.max(0, 1 - timeRef.current * 2);
    (particlesRef.current.material as THREE.PointsMaterial).opacity = opacity;

    // Reset after animation completes
    if (timeRef.current > 0.5) {
      timeRef.current = 0;
    }
  });

  if (!active) return null;

  const particleCount = 20;
  const positions = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2;
    const radius = Math.random() * 0.5;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = Math.sin(angle) * radius;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
  }

  return (
    <points ref={particlesRef} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color={color}
        transparent
        opacity={1}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/**
 * Energy aura effect for power-ups and special states
 */
export function EnergyAura({
  scale = 1.0,
  color,
  intensity,
}: {
  scale?: number;
  color: string;
  intensity: number;
}) {
  const auraRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!auraRef.current) return;
    
    // Pulsating effect
    const pulse = Math.sin(state.clock.elapsedTime * 4) * 0.1 + 1;
    auraRef.current.scale.setScalar(scale * pulse);
    
    // Rotating effect
    auraRef.current.rotation.y += 0.01;
  });

  if (intensity < 0.1) return null;

  return (
    <mesh ref={auraRef}>
      <sphereGeometry args={[1.2, 16, 12]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={intensity * 0.3}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

/**
 * Glowing outline effect for important objects
 */
export function GlowOutline({
  scale = 1.05,
  color,
  intensity,
}: {
  scale?: number;
  color: string;
  intensity: number;
}) {
  if (intensity < 0.1) return null;

  return (
    <mesh scale={scale}>
      <sphereGeometry args={[0.5, 32, 24]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={intensity * 0.5}
        depthWrite={false}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

/**
 * Screen-space ambient occlusion approximation
 */
export function ContactShadow({
  position,
  radius = 1.0,
  opacity = 0.5,
}: {
  position: [number, number, number];
  radius?: number;
  opacity?: number;
}) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[radius, 32]} />
      <meshBasicMaterial
        color="#000000"
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </mesh>
  );
}

/**
 * Dynamic shadows that follow character
 */
export function DynamicShadow({
  characterY,
  groundY = 0,
  maxDistance = 5,
}: {
  characterY: number;
  groundY?: number;
  maxDistance?: number;
}) {
  const distance = Math.max(0, characterY - groundY);
  const opacity = Math.max(0, 1 - distance / maxDistance);
  const scale = 1 + distance * 0.2;

  return (
    <ContactShadow
      position={[0, groundY + 0.01, 0]}
      radius={scale * 0.8}
      opacity={opacity * 0.6}
    />
  );
}

/**
 * Trail effect for fast movement
 */
export function SpeedTrail({
  points,
  color,
  opacity,
}: {
  points: THREE.Vector3[];
  color: string;
  opacity: number;
}) {
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(points.length * 3);
    
    points.forEach((point, i) => {
      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z;
    });
    
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [points]);

  if (opacity < 0.1 || points.length < 2) return null;

  // Note: linewidth is not widely supported in WebGL. For better cross-browser support,
  // consider using a mesh-based line (e.g., THREE.TubeGeometry) or instanced meshes
  return (
    <line geometry={geometry}>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </line>
  );
}

/**
 * Squash and stretch effect for impact
 */
export function useSquashStretch(impactIntensity: number) {
  const scaleRef = useRef({ x: 1, y: 1, z: 1 });
  
  useFrame(() => {
    if (impactIntensity > 0) {
      // Squash on impact
      scaleRef.current.y = 1 - impactIntensity * 0.3;
      scaleRef.current.x = 1 + impactIntensity * 0.15;
      scaleRef.current.z = 1 + impactIntensity * 0.15;
    } else {
      // Spring back to normal
      scaleRef.current.x += (1 - scaleRef.current.x) * 0.1;
      scaleRef.current.y += (1 - scaleRef.current.y) * 0.1;
      scaleRef.current.z += (1 - scaleRef.current.z) * 0.1;
    }
  });

  return scaleRef.current;
}

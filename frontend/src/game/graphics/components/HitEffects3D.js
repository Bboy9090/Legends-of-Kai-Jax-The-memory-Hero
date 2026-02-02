/**
 * 3D Hit Effects System
 * Three contrast profiles for readability
 */

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useGraphicsStore, { visualPresets } from '../stores/graphicsStore';

// Single hit spark effect
const HitSpark = ({ position, type = 'medium', color, onComplete }) => {
  const groupRef = useRef();
  const particlesRef = useRef();
  const startTime = useRef(Date.now());
  const palette = useGraphicsStore(s => s.palette);
  
  const profile = visualPresets.hitSparkProfiles[type];
  
  const sparkColor = useMemo(() => {
    return color || (type === 'block' ? palette.blockSpark : palette.hitSpark);
  }, [color, type, palette]);
  
  // Generate particles
  const particles = useMemo(() => {
    const count = profile.particleCount;
    const positions = new Float32Array(count * 3);
    const velocities = [];
    const sizes = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
      
      // Random velocity direction
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI - Math.PI / 2;
      const speed = 5 + Math.random() * 10;
      
      velocities.push({
        x: Math.cos(theta) * Math.cos(phi) * speed,
        y: Math.sin(phi) * speed + 3,
        z: Math.sin(theta) * Math.cos(phi) * speed,
      });
      
      sizes[i] = 0.1 + Math.random() * 0.2;
    }
    
    return { positions, velocities, sizes, count };
  }, [profile]);
  
  useFrame((state, delta) => {
    if (!particlesRef.current) return;
    
    const elapsed = (Date.now() - startTime.current) / 1000;
    const life = 1 - elapsed / profile.lifetime;
    
    if (life <= 0) {
      onComplete?.();
      return;
    }
    
    const positions = particlesRef.current.geometry.attributes.position.array;
    
    for (let i = 0; i < particles.count; i++) {
      const vel = particles.velocities[i];
      
      positions[i * 3] += vel.x * delta;
      positions[i * 3 + 1] += vel.y * delta - 9.8 * delta * elapsed; // Gravity
      positions[i * 3 + 2] += vel.z * delta;
      
      // Slow down
      vel.x *= 0.98;
      vel.z *= 0.98;
    }
    
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
    particlesRef.current.material.opacity = life;
  });
  
  return (
    <group ref={groupRef} position={position}>
      {/* Core flash */}
      <mesh scale={profile.scale * 2}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial
          color={sparkColor}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particles.count}
            array={particles.positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color={sparkColor}
          size={0.15 * profile.scale}
          transparent
          opacity={1}
          sizeAttenuation
        />
      </points>
      
      {/* Ring burst */}
      <mesh rotation={[Math.PI / 2, 0, 0]} scale={profile.scale}>
        <ringGeometry args={[0.3, 0.5, 32]} />
        <meshBasicMaterial
          color={sparkColor}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Point light for bloom */}
      <pointLight
        color={sparkColor}
        intensity={profile.emissiveIntensity}
        distance={3 * profile.scale}
        decay={2}
      />
    </group>
  );
};

// Hit Effects Manager
const HitEffectsManager = ({ effects = [] }) => {
  const [activeEffects, setActiveEffects] = useState([]);
  
  // Add new effects
  useEffect(() => {
    if (effects.length > activeEffects.length) {
      const newEffects = effects.slice(activeEffects.length);
      setActiveEffects(prev => [...prev, ...newEffects.map((e, i) => ({
        ...e,
        id: Date.now() + i,
      }))]);
    }
  }, [effects, activeEffects.length]);
  
  const handleComplete = (id) => {
    setActiveEffects(prev => prev.filter(e => e.id !== id));
  };
  
  return (
    <group>
      {activeEffects.map(effect => (
        <HitSpark
          key={effect.id}
          position={effect.position}
          type={effect.type}
          color={effect.color}
          onComplete={() => handleComplete(effect.id)}
        />
      ))}
    </group>
  );
};

// Slash trail effect
const SlashTrail = ({ start, end, color = '#FFD60A', duration = 0.3 }) => {
  const meshRef = useRef();
  const startTime = useRef(Date.now());
  
  const geometry = useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...start),
      new THREE.Vector3(
        (start[0] + end[0]) / 2,
        Math.max(start[1], end[1]) + 1,
        (start[2] + end[2]) / 2
      ),
      new THREE.Vector3(...end)
    );
    
    return new THREE.TubeGeometry(curve, 20, 0.05, 8, false);
  }, [start, end]);
  
  useFrame(() => {
    if (!meshRef.current) return;
    
    const elapsed = (Date.now() - startTime.current) / 1000;
    const life = 1 - elapsed / duration;
    
    if (life <= 0) {
      meshRef.current.visible = false;
      return;
    }
    
    meshRef.current.material.opacity = life;
  });
  
  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshBasicMaterial
        color={color}
        transparent
        opacity={1}
      />
    </mesh>
  );
};

export { HitSpark, HitEffectsManager, SlashTrail };
export default HitEffectsManager;

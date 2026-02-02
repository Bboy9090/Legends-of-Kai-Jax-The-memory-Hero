/**
 * 3D Fighter Character Component
 * PBR materials with phase-driven emissive and rim highlights
 */

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useGraphicsStore from '../stores/graphicsStore';
import '../shaders/CharacterShader';

// Procedural character geometry (stylized humanoid)
const createCharacterGeometry = (type = 'player') => {
  const group = new THREE.Group();
  
  // Body proportions based on type
  const scale = type === 'player' ? 1.0 : 1.15;
  
  // Torso
  const torsoGeom = new THREE.BoxGeometry(0.8 * scale, 1.2 * scale, 0.5 * scale);
  const torso = new THREE.Mesh(torsoGeom);
  torso.position.y = 1.5;
  
  // Head
  const headGeom = new THREE.SphereGeometry(0.35 * scale, 16, 16);
  const head = new THREE.Mesh(headGeom);
  head.position.y = 2.5;
  
  // Arms
  const armGeom = new THREE.CapsuleGeometry(0.12 * scale, 0.8 * scale, 8, 8);
  const leftArm = new THREE.Mesh(armGeom);
  leftArm.position.set(-0.6 * scale, 1.5, 0);
  leftArm.rotation.z = Math.PI * 0.15;
  
  const rightArm = new THREE.Mesh(armGeom);
  rightArm.position.set(0.6 * scale, 1.5, 0);
  rightArm.rotation.z = -Math.PI * 0.15;
  
  // Legs
  const legGeom = new THREE.CapsuleGeometry(0.15 * scale, 0.9 * scale, 8, 8);
  const leftLeg = new THREE.Mesh(legGeom);
  leftLeg.position.set(-0.25 * scale, 0.5, 0);
  
  const rightLeg = new THREE.Mesh(legGeom);
  rightLeg.position.set(0.25 * scale, 0.5, 0);
  
  return { torso, head, leftArm, rightArm, leftLeg, rightLeg };
};

// Tail geometry for Kai-Jax
const createTailGeometry = (index, color) => {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(-0.3 - index * 0.1, 0.2, -0.3),
    new THREE.Vector3(-0.6 - index * 0.15, 0.4 + index * 0.1, -0.5),
    new THREE.Vector3(-0.8 - index * 0.2, 0.3, -0.7 - index * 0.1),
  ]);
  
  const geometry = new THREE.TubeGeometry(curve, 20, 0.06 - index * 0.005, 8, false);
  return geometry;
};

// Fighter3D Component
const Fighter3D = ({
  position = [0, 0, 0],
  type = 'player',
  color = '#FFD60A',
  emissiveColor = '#FFD60A',
  state = 'idle',
  facing = 1,
  phase = 0,
  health = 100,
  maxHealth = 100,
  damageFlash = 0,
  blockFlash = 0,
  tails = [],
  activeTail = 0,
}) => {
  const groupRef = useRef();
  const materialRef = useRef();
  const tailRefs = useRef([]);
  const palette = useGraphicsStore(s => s.palette);
  
  // Colors from palette
  const baseColor = useMemo(() => {
    return type === 'player' ? palette.playerPrimary : palette.enemyPrimary;
  }, [type, palette]);
  
  const accentColor = useMemo(() => {
    return type === 'player' ? palette.playerSecondary : palette.enemySecondary;
  }, [type, palette]);
  
  // Animation state
  const animState = useRef({
    time: 0,
    idleBob: 0,
    attackSwing: 0,
    blockCrouch: 0,
  });
  
  // Update material uniforms
  useFrame((frameState, delta) => {
    if (!materialRef.current) return;
    
    const anim = animState.current;
    anim.time += delta;
    
    // Update shader uniforms
    materialRef.current.uTime = anim.time;
    materialRef.current.uPhase = phase;
    materialRef.current.uDamageFlash = damageFlash;
    materialRef.current.uBlockFlash = blockFlash;
    
    // Idle bobbing
    if (state === 'idle' || state === 'IDLE') {
      anim.idleBob = Math.sin(anim.time * 2) * 0.05;
    }
    
    // Attack animation
    if (state === 'attacking' || state === 'ATTACKING') {
      anim.attackSwing = Math.min(anim.attackSwing + delta * 15, 1);
    } else {
      anim.attackSwing = Math.max(anim.attackSwing - delta * 10, 0);
    }
    
    // Block crouch
    if (state === 'blocking' || state === 'BLOCKING') {
      anim.blockCrouch = Math.min(anim.blockCrouch + delta * 10, 1);
    } else {
      anim.blockCrouch = Math.max(anim.blockCrouch - delta * 8, 0);
    }
    
    // Apply to group
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + anim.idleBob - anim.blockCrouch * 0.3;
      groupRef.current.scale.x = facing;
      
      // Attack lean
      groupRef.current.rotation.z = anim.attackSwing * 0.2 * facing;
    }
    
    // Animate tails
    tailRefs.current.forEach((tail, i) => {
      if (tail) {
        const wave = Math.sin(anim.time * 3 + i * 0.5) * 0.2;
        tail.rotation.z = wave;
        tail.rotation.y = Math.sin(anim.time * 2 + i * 0.3) * 0.1;
        
        // Highlight active tail
        if (tail.material) {
          const isActive = i === activeTail;
          tail.material.emissiveIntensity = isActive ? 2.0 : 0.5;
        }
      }
    });
  });
  
  // Create tail colors
  const tailColors = useMemo(() => [
    '#FF3B30', // Ember
    '#64D2FF', // Gale
    '#BF5AF2', // Shade
    '#FFD60A', // Volt
    '#8B8B8B', // Stone
    '#007AFF', // Tide
    '#30D158', // Thorn
    '#FFFFFF', // Prism
    '#2E2EFE', // Void
  ], []);
  
  return (
    <group ref={groupRef} position={position}>
      {/* Main Body */}
      <group>
        {/* Torso */}
        <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.8, 1.2, 0.5]} />
          <characterMaterial
            ref={materialRef}
            uBaseColor={new THREE.Color(baseColor)}
            uEmissiveColor={new THREE.Color(emissiveColor)}
            uEmissiveIntensity={0.5}
            uRoughness={0.4}
            uMetalness={0.1}
            uRimColor={new THREE.Color(accentColor)}
            uRimPower={3.0}
            uRimIntensity={0.5}
            uPulseSpeed={2.0}
            uPulseIntensity={0.3}
          />
        </mesh>
        
        {/* Head */}
        <mesh position={[0, 2.4, 0]} castShadow>
          <sphereGeometry args={[0.35, 16, 16]} />
          <characterMaterial
            uBaseColor={new THREE.Color(baseColor)}
            uEmissiveColor={new THREE.Color(emissiveColor)}
            uEmissiveIntensity={0.3}
            uRoughness={0.5}
            uMetalness={0.0}
            uRimColor={new THREE.Color('#FFFFFF')}
            uRimPower={2.5}
            uRimIntensity={0.3}
          />
        </mesh>
        
        {/* Eyes */}
        <mesh position={[0.12 * facing, 2.45, 0.25]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial
            color="#FFFFFF"
            emissive="#FFFFFF"
            emissiveIntensity={1}
          />
        </mesh>
        
        {/* Arms */}
        <mesh position={[-0.55, 1.5, 0]} rotation={[0, 0, 0.3]} castShadow>
          <capsuleGeometry args={[0.1, 0.7, 8, 8]} />
          <characterMaterial
            uBaseColor={new THREE.Color(baseColor)}
            uEmissiveColor={new THREE.Color(accentColor)}
            uEmissiveIntensity={0.2}
            uRoughness={0.5}
            uMetalness={0.1}
          />
        </mesh>
        
        <mesh position={[0.55, 1.5, 0]} rotation={[0, 0, -0.3]} castShadow>
          <capsuleGeometry args={[0.1, 0.7, 8, 8]} />
          <characterMaterial
            uBaseColor={new THREE.Color(baseColor)}
            uEmissiveColor={new THREE.Color(accentColor)}
            uEmissiveIntensity={0.2}
            uRoughness={0.5}
            uMetalness={0.1}
          />
        </mesh>
        
        {/* Legs */}
        <mesh position={[-0.2, 0.5, 0]} castShadow>
          <capsuleGeometry args={[0.12, 0.8, 8, 8]} />
          <characterMaterial
            uBaseColor={new THREE.Color(baseColor)}
            uRoughness={0.6}
            uMetalness={0.0}
          />
        </mesh>
        
        <mesh position={[0.2, 0.5, 0]} castShadow>
          <capsuleGeometry args={[0.12, 0.8, 8, 8]} />
          <characterMaterial
            uBaseColor={new THREE.Color(baseColor)}
            uRoughness={0.6}
            uMetalness={0.0}
          />
        </mesh>
      </group>
      
      {/* Tails (only for player) */}
      {type === 'player' && tails.map((tail, i) => (
        <mesh
          key={i}
          ref={el => tailRefs.current[i] = el}
          position={[0, 1.2, -0.3]}
          rotation={[0.3, Math.PI * 0.1 * i - Math.PI * 0.2, 0]}
        >
          <tubeGeometry
            args={[
              new THREE.CatmullRomCurve3([
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(-0.2 - i * 0.08, 0.15, -0.2),
                new THREE.Vector3(-0.4 - i * 0.1, 0.3 + i * 0.08, -0.4),
                new THREE.Vector3(-0.5 - i * 0.12, 0.2, -0.5 - i * 0.08),
              ]),
              20,
              0.05 - i * 0.003,
              8,
              false
            ]}
          />
          <meshStandardMaterial
            color={tailColors[i] || '#FFD60A'}
            emissive={tailColors[i] || '#FFD60A'}
            emissiveIntensity={i === activeTail ? 2.0 : 0.3}
            roughness={0.3}
            metalness={0.2}
          />
        </mesh>
      ))}
      
      {/* Health indicator glow */}
      <pointLight
        position={[0, 2, 0]}
        color={health / maxHealth > 0.5 ? baseColor : '#FF3B30'}
        intensity={0.5 + (1 - health / maxHealth) * 0.5}
        distance={3}
      />
    </group>
  );
};

export default Fighter3D;

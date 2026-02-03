import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../stores/gameStore';

// Low-poly Kai-Jax character model
const KaiJaxModel = ({ isAttacking, isDodging, activeTail }) => {
  const bodyRef = useRef();
  const tailsRef = useRef([]);
  
  // Tail colors based on active tail
  const tailColors = {
    4: '#64D2FF', // Law - Ice blue
    5: '#FF3B30', // Sacrifice - Fire red
    6: '#BF5AF2', // Memory - Void purple
  };

  useFrame((state) => {
    // Animate tails
    tailsRef.current.forEach((tail, i) => {
      if (tail) {
        tail.rotation.z = Math.sin(state.clock.elapsedTime * 2 + i * 0.5) * 0.3;
        tail.rotation.x = Math.cos(state.clock.elapsedTime * 1.5 + i * 0.3) * 0.2;
      }
    });

    // Attack animation
    if (bodyRef.current && isAttacking) {
      bodyRef.current.rotation.y += 0.3;
    }
  });

  return (
    <group>
      {/* Body - Low poly capsule shape */}
      <mesh ref={bodyRef} castShadow>
        <capsuleGeometry args={[0.4, 1, 4, 8]} />
        <meshStandardMaterial 
          color="#1a1a2e" 
          roughness={0.7}
          metalness={0.3}
        />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1, 0]} castShadow>
        <dodecahedronGeometry args={[0.35, 0]} />
        <meshStandardMaterial 
          color="#2d2d44"
          roughness={0.6}
          metalness={0.2}
        />
      </mesh>

      {/* Eyes - Glowing */}
      <mesh position={[0.12, 1.05, 0.25]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial 
          color="#FFD60A" 
          emissive="#FFD60A"
          emissiveIntensity={2}
        />
      </mesh>
      <mesh position={[-0.12, 1.05, 0.25]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial 
          color="#30D158" 
          emissive="#30D158"
          emissiveIntensity={2}
        />
      </mesh>

      {/* Ears */}
      <mesh position={[0.25, 1.3, 0]} rotation={[0, 0, 0.5]}>
        <coneGeometry args={[0.1, 0.25, 4]} />
        <meshStandardMaterial color="#FF6B35" roughness={0.8} />
      </mesh>
      <mesh position={[-0.25, 1.3, 0]} rotation={[0, 0, -0.5]}>
        <coneGeometry args={[0.1, 0.25, 4]} />
        <meshStandardMaterial color="#64D2FF" roughness={0.8} />
      </mesh>

      {/* Tails - 3 visible (representing tails 4-6) */}
      {[0, 1, 2].map((i) => {
        const tailId = i + 4;
        const isActive = activeTail === tailId;
        return (
          <group 
            key={i} 
            ref={(el) => (tailsRef.current[i] = el)}
            position={[0, 0.2, -0.5]}
            rotation={[0.5, (i - 1) * 0.4, 0]}
          >
            {/* Tail segments */}
            {[0, 1, 2].map((seg) => (
              <mesh 
                key={seg} 
                position={[0, 0, -seg * 0.3]} 
                castShadow
              >
                <boxGeometry args={[0.15 - seg * 0.03, 0.15 - seg * 0.03, 0.3]} />
                <meshStandardMaterial 
                  color={tailColors[tailId]}
                  emissive={isActive ? tailColors[tailId] : '#000000'}
                  emissiveIntensity={isActive ? 1.5 : 0}
                  roughness={0.5}
                  metalness={0.5}
                />
              </mesh>
            ))}
          </group>
        );
      })}

      {/* Claws/Hands */}
      <mesh position={[0.5, 0.3, 0.2]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.15, 0.3, 0.1]} />
        <meshStandardMaterial color="#FF6B35" roughness={0.7} />
      </mesh>
      <mesh position={[-0.5, 0.3, 0.2]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.15, 0.3, 0.1]} />
        <meshStandardMaterial color="#64D2FF" roughness={0.7} />
      </mesh>
    </group>
  );
};

// Player Controller Component
export const Player = () => {
  const rigidBodyRef = useRef();
  const { player, tails, updatePlayerPosition, setPlayerAttacking, setPlayerDodging, useTailAbility } = useGameStore();
  
  const moveSpeed = 8;
  const jumpForce = 10;
  const dashForce = 15;
  
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const canJump = useRef(true);
  const canDash = useRef(true);
  const lastAttackTime = useRef(0);

  // Keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      const now = Date.now();
      
      // Attack - Left Mouse or J
      if (e.key === 'j' || e.key === 'J') {
        if (now - lastAttackTime.current > 300) {
          setPlayerAttacking(true);
          lastAttackTime.current = now;
          setTimeout(() => setPlayerAttacking(false), 200);
        }
      }
      
      // Dodge - Shift or K
      if ((e.key === 'Shift' || e.key === 'k' || e.key === 'K') && canDash.current) {
        setPlayerDodging(true);
        canDash.current = false;
        
        if (rigidBodyRef.current) {
          const impulse = direction.current.clone().multiplyScalar(dashForce);
          rigidBodyRef.current.applyImpulse(impulse, true);
        }
        
        setTimeout(() => {
          setPlayerDodging(false);
          canDash.current = true;
        }, 500);
      }
      
      // Tail Abilities - 1, 2, 3
      if (e.key === '1') useTailAbility(4); // Law Tail
      if (e.key === '2') useTailAbility(5); // Sacrifice Tail
      if (e.key === '3') useTailAbility(6); // Memory Fracture Tail
    };

    const handleMouseDown = (e) => {
      if (e.button === 0) { // Left click
        const now = Date.now();
        if (now - lastAttackTime.current > 300) {
          setPlayerAttacking(true);
          lastAttackTime.current = now;
          setTimeout(() => setPlayerAttacking(false), 200);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [setPlayerAttacking, setPlayerDodging, useTailAbility]);

  useFrame((state, delta) => {
    if (!rigidBodyRef.current) return;

    const body = rigidBodyRef.current;
    const linvel = body.linvel();
    
    // Get input
    const keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      jump: false,
    };

    // Check keyboard state
    const keyState = (key) => {
      return document.querySelector(`[data-key="${key}"]`)?.dataset.pressed === 'true';
    };

    // Movement input from keyboard
    document.addEventListener('keydown', (e) => {
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') keys.forward = true;
      if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') keys.backward = true;
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') keys.left = true;
      if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') keys.right = true;
      if (e.key === ' ') keys.jump = true;
    });

    // Calculate movement direction based on camera
    const cameraDirection = new THREE.Vector3();
    state.camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();

    const cameraRight = new THREE.Vector3();
    cameraRight.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0));

    // Build movement vector
    direction.current.set(0, 0, 0);
    
    // Simple WASD check
    const isKeyPressed = (key) => {
      return window[`_key_${key}`] === true;
    };

    if (isKeyPressed('w')) direction.current.add(cameraDirection);
    if (isKeyPressed('s')) direction.current.sub(cameraDirection);
    if (isKeyPressed('a')) direction.current.sub(cameraRight);
    if (isKeyPressed('d')) direction.current.add(cameraRight);

    direction.current.normalize();

    // Apply movement
    if (direction.current.length() > 0) {
      body.setLinvel({
        x: direction.current.x * moveSpeed,
        y: linvel.y,
        z: direction.current.z * moveSpeed,
      }, true);

      // Rotate character to face movement direction
      const angle = Math.atan2(direction.current.x, direction.current.z);
      body.setRotation({ x: 0, y: angle, z: 0, w: 1 }, true);
    } else {
      // Apply friction when not moving
      body.setLinvel({
        x: linvel.x * 0.9,
        y: linvel.y,
        z: linvel.z * 0.9,
      }, true);
    }

    // Jump
    if (isKeyPressed(' ') && canJump.current) {
      body.applyImpulse({ x: 0, y: jumpForce, z: 0 }, true);
      canJump.current = false;
      setTimeout(() => (canJump.current = true), 500);
    }

    // Update store position
    const pos = body.translation();
    updatePlayerPosition([pos.x, pos.y, pos.z]);
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={player.position}
      enabledRotations={[false, true, false]}
      mass={1}
      linearDamping={0.5}
      angularDamping={0.5}
      colliders={false}
    >
      <CapsuleCollider args={[0.5, 0.4]} position={[0, 0.9, 0]} />
      <KaiJaxModel 
        isAttacking={player.isAttacking} 
        isDodging={player.isDodging}
        activeTail={tails.equipped[0]}
      />
    </RigidBody>
  );
};

export default Player;

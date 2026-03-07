import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { useGameStore } from '../stores/gameStore';

// Simple geometric player model (works without GLB)
const KaiJaxModel = ({ isAttacking, isDodging, activeTail, scale = 1 }) => {
  const groupRef = useRef();
  const tailsRef = useRef([]);
  
  const tailColors = {
    4: '#64D2FF', // Law - Ice blue
    5: '#FF3B30', // Sacrifice - Fire red  
    6: '#BF5AF2', // Memory - Void purple
  };

  useFrame((state) => {
    if (groupRef.current) {
      // Idle breathing
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.02;
      
      // Attack animation
      if (isAttacking) {
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0.4, 0.3);
      } else {
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, 0.1);
      }
      
      // Dodge animation
      if (isDodging) {
        groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0.6, 0.3);
      } else {
        groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, 0.1);
      }
    }

    // Animate tails
    tailsRef.current.forEach((tail, i) => {
      if (tail) {
        tail.rotation.z = Math.sin(state.clock.elapsedTime * 3 + i * 0.7) * 0.4;
        tail.rotation.x = Math.cos(state.clock.elapsedTime * 2 + i * 0.5) * 0.25;
      }
    });
  });

  const activeColor = tailColors[activeTail] || '#FFD60A';

  return (
    <group ref={groupRef} scale={scale}>
      {/* Body - Low poly capsule */}
      <mesh castShadow position={[0, 0.5, 0]}>
        <capsuleGeometry args={[0.35, 0.8, 4, 12]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.7} metalness={0.3} />
      </mesh>

      {/* Head */}
      <mesh castShadow position={[0, 1.3, 0]}>
        <dodecahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial color="#2d2d44" roughness={0.6} />
      </mesh>

      {/* Eyes - Glowing */}
      <mesh position={[0.1, 1.35, 0.2]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#FFD60A" emissive="#FFD60A" emissiveIntensity={3} />
      </mesh>
      <mesh position={[-0.1, 1.35, 0.2]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#30D158" emissive="#30D158" emissiveIntensity={3} />
      </mesh>

      {/* Ears */}
      <mesh castShadow position={[0.2, 1.55, 0]} rotation={[0, 0, 0.4]}>
        <coneGeometry args={[0.08, 0.2, 4]} />
        <meshStandardMaterial color="#FF6B35" roughness={0.8} />
      </mesh>
      <mesh castShadow position={[-0.2, 1.55, 0]} rotation={[0, 0, -0.4]}>
        <coneGeometry args={[0.08, 0.2, 4]} />
        <meshStandardMaterial color="#64D2FF" roughness={0.8} />
      </mesh>

      {/* Arms */}
      <mesh castShadow position={[0.45, 0.6, 0]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.12, 0.4, 0.1]} />
        <meshStandardMaterial color="#FF6B35" roughness={0.7} />
      </mesh>
      <mesh castShadow position={[-0.45, 0.6, 0]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.12, 0.4, 0.1]} />
        <meshStandardMaterial color="#64D2FF" roughness={0.7} />
      </mesh>

      {/* Three tails (representing tails 4-6) */}
      {[0, 1, 2].map((i) => {
        const tailId = i + 4;
        const isActive = activeTail === tailId;
        return (
          <group 
            key={i} 
            ref={(el) => (tailsRef.current[i] = el)}
            position={[0, 0.3, -0.4]}
            rotation={[0.6, (i - 1) * 0.5, 0]}
          >
            {[0, 1, 2, 3].map((seg) => (
              <mesh key={seg} position={[0, 0, -seg * 0.2]} castShadow>
                <boxGeometry args={[0.12 - seg * 0.02, 0.12 - seg * 0.02, 0.2]} />
                <meshStandardMaterial 
                  color={tailColors[tailId]}
                  emissive={tailColors[tailId]}
                  emissiveIntensity={isActive ? 2 : 0.3}
                  roughness={0.4}
                  metalness={0.5}
                />
              </mesh>
            ))}
          </group>
        );
      })}

      {/* Glow effect */}
      <pointLight position={[0, 0.8, 0]} color={activeColor} intensity={1} distance={3} />
    </group>
  );
};

// Input handler
const usePlayerInput = () => {
  const keys = useRef({
    forward: false, backward: false, left: false, right: false, jump: false,
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp': keys.current.forward = true; break;
        case 'KeyS': case 'ArrowDown': keys.current.backward = true; break;
        case 'KeyA': case 'ArrowLeft': keys.current.left = true; break;
        case 'KeyD': case 'ArrowRight': keys.current.right = true; break;
        case 'Space': keys.current.jump = true; break;
        default: break;
      }
    };

    const handleKeyUp = (e) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp': keys.current.forward = false; break;
        case 'KeyS': case 'ArrowDown': keys.current.backward = false; break;
        case 'KeyA': case 'ArrowLeft': keys.current.left = false; break;
        case 'KeyD': case 'ArrowRight': keys.current.right = false; break;
        case 'Space': keys.current.jump = false; break;
        default: break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return keys;
};

// Main Player Component
export const Player = () => {
  const rigidBodyRef = useRef();
  const { 
    player, tails, gameState,
    updatePlayerPosition, setPlayerAttacking, setPlayerDodging, 
    updatePlayerHealth,
  } = useGameStore();
  
  const keys = usePlayerInput();
  const direction = useRef(new THREE.Vector3());
  const canJump = useRef(true);
  const canDash = useRef(true);
  const lastAttackTime = useRef(0);

  const moveSpeed = 8;
  const jumpForce = 8;
  const dashForce = 12;

  // Handle input events
  useEffect(() => {
    const handleClick = (e) => {
      if (e.button === 0 && gameState === 'playing') {
        const now = Date.now();
        if (now - lastAttackTime.current > 350) {
          setPlayerAttacking(true);
          lastAttackTime.current = now;
          setTimeout(() => setPlayerAttacking(false), 250);
        }
      }
    };

    const handleKeyPress = (e) => {
      if (gameState !== 'playing') return;
      const store = useGameStore.getState();
      if (e.key === '1') store.useTailAbility(4);
      if (e.key === '2') store.useTailAbility(5);
      if (e.key === '3') store.useTailAbility(6);
      if (e.key === 'Escape') store.setGameState('paused');
      
      // Dodge on shift
      if ((e.code === 'ShiftLeft' || e.code === 'ShiftRight') && canDash.current) {
        if (direction.current.length() > 0) {
          setPlayerDodging(true);
          canDash.current = false;
          
          if (rigidBodyRef.current) {
            const dashDir = direction.current.clone().multiplyScalar(dashForce);
            rigidBodyRef.current.applyImpulse({ x: dashDir.x, y: 2, z: dashDir.z }, true);
          }
          
          setTimeout(() => setPlayerDodging(false), 300);
          setTimeout(() => { canDash.current = true; }, 800);
        }
      }
    };

    window.addEventListener('mousedown', handleClick);
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('mousedown', handleClick);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [gameState, setPlayerAttacking, setPlayerDodging]);

  useFrame((state, delta) => {
    if (!rigidBodyRef.current || gameState !== 'playing') return;

    const body = rigidBodyRef.current;
    const linvel = body.linvel();
    
    // Camera-relative movement
    const cameraDirection = new THREE.Vector3();
    state.camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();

    const cameraRight = new THREE.Vector3();
    cameraRight.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0));

    direction.current.set(0, 0, 0);
    if (keys.current.forward) direction.current.add(cameraDirection);
    if (keys.current.backward) direction.current.sub(cameraDirection);
    if (keys.current.left) direction.current.sub(cameraRight);
    if (keys.current.right) direction.current.add(cameraRight);
    direction.current.normalize();

    // Apply movement
    if (direction.current.length() > 0) {
      body.setLinvel({
        x: direction.current.x * moveSpeed,
        y: linvel.y,
        z: direction.current.z * moveSpeed,
      }, true);

      // Rotate to face movement
      const angle = Math.atan2(direction.current.x, direction.current.z);
      const targetQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, angle, 0));
      const currentRot = body.rotation();
      const currentQuat = new THREE.Quaternion(currentRot.x, currentRot.y, currentRot.z, currentRot.w);
      currentQuat.slerp(targetQuat, 0.15);
      body.setRotation(currentQuat, true);
    } else {
      body.setLinvel({ x: linvel.x * 0.85, y: linvel.y, z: linvel.z * 0.85 }, true);
    }

    // Jump
    if (keys.current.jump && canJump.current) {
      body.applyImpulse({ x: 0, y: jumpForce, z: 0 }, true);
      canJump.current = false;
      setTimeout(() => { canJump.current = true; }, 600);
    }

    // Update position
    const pos = body.translation();
    updatePlayerPosition([pos.x, pos.y, pos.z]);

    // Fall death
    if (pos.y < -20) {
      updatePlayerHealth(-100);
      if (player.health <= 0) {
        useGameStore.getState().setGameState('dead');
      }
    }

    // Update cooldowns
    useGameStore.getState().updateTailCooldowns(delta);
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
      <CapsuleCollider args={[0.5, 0.35]} position={[0, 0.85, 0]} />
      <KaiJaxModel 
        isAttacking={player.isAttacking} 
        isDodging={player.isDodging}
        activeTail={tails.equipped[0]}
        scale={1}
      />
    </RigidBody>
  );
};

export default Player;

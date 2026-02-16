import React, { useRef, useEffect, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { useGameStore } from '../stores/gameStore';

// GLB Model URLs
const MODEL_URLS = {
  kaijax: 'https://customer-assets.emergentagent.com/job_legends-codex/artifacts/adsyia29_Meshy_AI_Emberwolf_Knight_0216032215_texture.glb',
  kai: 'https://customer-assets.emergentagent.com/job_legends-codex/artifacts/99cw4cbu_Meshy_AI_Blazing_Fox_Vanguard_0216021436_texture.glb',
  jax: 'https://customer-assets.emergentagent.com/job_legends-codex/artifacts/n5lux24m_Meshy_AI_Crimson_Howl_in_the_R_0216021418_texture.glb',
  enemy: 'https://customer-assets.emergentagent.com/job_legends-codex/artifacts/8g7zog27_Meshy_AI_Stylized_semi_realist_0216021407_texture.glb',
};

// Preload models
Object.values(MODEL_URLS).forEach(url => useGLTF.preload(url));

// Kai-Jax 3D Model Component
const KaiJaxModel = ({ isAttacking, isDodging, activeTail, scale = 1 }) => {
  const groupRef = useRef();
  const { scene, animations } = useGLTF(MODEL_URLS.kaijax);
  const clonedScene = scene.clone();
  
  // Tail glow effect based on active tail
  const tailColors = {
    4: new THREE.Color('#64D2FF'), // Law - Ice blue
    5: new THREE.Color('#FF3B30'), // Sacrifice - Fire red
    6: new THREE.Color('#BF5AF2'), // Memory - Void purple
  };

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Idle breathing animation
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.02;
      
      // Attack animation - lean forward
      if (isAttacking) {
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0.3, 0.3);
      } else {
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, 0.1);
      }
      
      // Dodge animation - tilt
      if (isDodging) {
        groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0.5, 0.3);
      } else {
        groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, 0.1);
      }
    }
  });

  // Apply emissive glow based on active tail
  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        // Add slight emissive glow
        if (child.material) {
          child.material = child.material.clone();
          child.material.emissive = tailColors[activeTail] || new THREE.Color('#FFD60A');
          child.material.emissiveIntensity = 0.15;
        }
      }
    });
  }, [activeTail, clonedScene]);

  return (
    <group ref={groupRef} scale={[scale, scale, scale]} rotation={[0, Math.PI, 0]}>
      <primitive object={clonedScene} />
      
      {/* Tail energy particles */}
      <TailEnergyEffect color={tailColors[activeTail]?.getHexString() || '#FFD60A'} />
    </group>
  );
};

// Tail Energy Effect - Particles around character
const TailEnergyEffect = ({ color }) => {
  const particlesRef = useRef();
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.02;
      particlesRef.current.children.forEach((child, i) => {
        child.position.y = Math.sin(state.clock.elapsedTime * 2 + i) * 0.3 + 1;
        child.scale.setScalar(0.5 + Math.sin(state.clock.elapsedTime * 3 + i) * 0.2);
      });
    }
  });

  return (
    <group ref={particlesRef}>
      {[...Array(6)].map((_, i) => (
        <mesh 
          key={i} 
          position={[
            Math.cos((i / 6) * Math.PI * 2) * 0.8,
            1,
            Math.sin((i / 6) * Math.PI * 2) * 0.8
          ]}
        >
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial 
            color={`#${color}`}
            emissive={`#${color}`}
            emissiveIntensity={2}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
    </group>
  );
};

// Loading fallback
const ModelFallback = () => (
  <mesh>
    <capsuleGeometry args={[0.4, 1, 4, 8]} />
    <meshStandardMaterial color="#FFD60A" wireframe />
  </mesh>
);

// Input Handler Hook
const usePlayerInput = () => {
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    dodge: false,
    attack: false,
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = true;
          break;
        case 'Space':
          keys.current.jump = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
        case 'KeyK':
          keys.current.dodge = true;
          break;
        case 'KeyJ':
          keys.current.attack = true;
          break;
      }
    };

    const handleKeyUp = (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = false;
          break;
        case 'Space':
          keys.current.jump = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
        case 'KeyK':
          keys.current.dodge = false;
          break;
        case 'KeyJ':
          keys.current.attack = false;
          break;
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

// Main Player Component with GLB Model
export const PlayerWithModel = () => {
  const rigidBodyRef = useRef();
  const { 
    player, 
    tails, 
    gameState,
    updatePlayerPosition, 
    setPlayerAttacking, 
    setPlayerDodging, 
    useTailAbility,
    updatePlayerHealth,
  } = useGameStore();
  
  const keys = usePlayerInput();
  
  const moveSpeed = 8;
  const jumpForce = 8;
  const dashForce = 12;
  
  const direction = useRef(new THREE.Vector3());
  const canJump = useRef(true);
  const canDash = useRef(true);
  const lastAttackTime = useRef(0);

  // Handle attacks
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
      
      // Tail abilities
      if (e.key === '1') useTailAbility(4);
      if (e.key === '2') useTailAbility(5);
      if (e.key === '3') useTailAbility(6);
      
      // Pause
      if (e.key === 'Escape') {
        useGameStore.getState().setGameState('paused');
      }
    };

    window.addEventListener('mousedown', handleClick);
    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('mousedown', handleClick);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [gameState, setPlayerAttacking, useTailAbility]);

  useFrame((state, delta) => {
    if (!rigidBodyRef.current || gameState !== 'playing') return;

    const body = rigidBodyRef.current;
    const linvel = body.linvel();
    
    // Get camera direction for movement
    const cameraDirection = new THREE.Vector3();
    state.camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();

    const cameraRight = new THREE.Vector3();
    cameraRight.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0));

    // Build movement vector
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

      // Rotate character to face movement direction
      const angle = Math.atan2(direction.current.x, direction.current.z);
      const currentRotation = body.rotation();
      const targetQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, angle, 0));
      const currentQuat = new THREE.Quaternion(currentRotation.x, currentRotation.y, currentRotation.z, currentRotation.w);
      currentQuat.slerp(targetQuat, 0.15);
      body.setRotation({ x: currentQuat.x, y: currentQuat.y, z: currentQuat.z, w: currentQuat.w }, true);
    } else {
      // Friction
      body.setLinvel({
        x: linvel.x * 0.85,
        y: linvel.y,
        z: linvel.z * 0.85,
      }, true);
    }

    // Jump
    if (keys.current.jump && canJump.current) {
      body.applyImpulse({ x: 0, y: jumpForce, z: 0 }, true);
      canJump.current = false;
      setTimeout(() => (canJump.current = true), 600);
    }

    // Dodge
    if (keys.current.dodge && canDash.current && direction.current.length() > 0) {
      setPlayerDodging(true);
      canDash.current = false;
      
      const dashDir = direction.current.clone().multiplyScalar(dashForce);
      body.applyImpulse({ x: dashDir.x, y: 2, z: dashDir.z }, true);
      
      setTimeout(() => {
        setPlayerDodging(false);
      }, 300);
      
      setTimeout(() => {
        canDash.current = true;
      }, 800);
    }

    // Attack input
    if (keys.current.attack) {
      const now = Date.now();
      if (now - lastAttackTime.current > 350) {
        setPlayerAttacking(true);
        lastAttackTime.current = now;
        setTimeout(() => setPlayerAttacking(false), 250);
      }
      keys.current.attack = false;
    }

    // Update store position
    const pos = body.translation();
    updatePlayerPosition([pos.x, pos.y, pos.z]);

    // Check if fallen off map
    if (pos.y < -20) {
      updatePlayerHealth(-100);
      if (player.health <= 0) {
        useGameStore.getState().setGameState('dead');
      }
    }

    // Update tail cooldowns
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
      <CapsuleCollider args={[0.5, 0.4]} position={[0, 0.9, 0]} />
      <Suspense fallback={<ModelFallback />}>
        <KaiJaxModel 
          isAttacking={player.isAttacking} 
          isDodging={player.isDodging}
          activeTail={tails.equipped[0]}
          scale={0.8}
        />
      </Suspense>
    </RigidBody>
  );
};

export { MODEL_URLS, KaiJaxModel };
export default PlayerWithModel;

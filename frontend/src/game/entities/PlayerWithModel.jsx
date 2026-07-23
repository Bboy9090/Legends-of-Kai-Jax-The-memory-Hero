import React, { useRef, useEffect, Suspense, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { useGameStore } from '../stores/gameStore';
import { ClonedModel, MODELS } from '../utils/ModelLoader';

// Tail glow colors
const TAIL_COLORS = {
  4: '#64D2FF', // Law - Ice blue
  5: '#FF3B30', // Sacrifice - Fire red
  6: '#BF5AF2', // Memory - Void purple
};

// Kai-Jax 3D Model Component (uses Crimson Howl GLB)
const KaiJaxModel = ({ isAttacking, isDodging, activeTail, scale = 1 }) => {
  const groupRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;
    // Idle bob
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.02;
    // Attack lean
    const targetX = isAttacking ? 0.3 : 0;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetX, 0.2);
    // Dodge roll
    const targetZ = isDodging ? 0.5 : 0;
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, targetZ, 0.2);
  });

  const activeColor = TAIL_COLORS[activeTail] || '#FFD60A';

  return (
    <group ref={groupRef} scale={[scale, scale, scale]} rotation={[0, Math.PI, 0]}>
      <ClonedModel url={MODELS.crimsonHowl} />
      <TailEnergyEffect color={activeColor} />
      <pointLight position={[0, 1, 0]} color={activeColor} intensity={1.2} distance={3} />
    </group>
  );
};

// Tail Energy Effect - Orbiting particles
const TailEnergyEffect = ({ color }) => {
  const particlesRef = useRef();

  useFrame((state) => {
    if (!particlesRef.current) return;
    particlesRef.current.rotation.y += 0.02;
    particlesRef.current.children.forEach((child, i) => {
      child.position.y = Math.sin(state.clock.elapsedTime * 2 + i) * 0.3 + 1;
      const s = 0.5 + Math.sin(state.clock.elapsedTime * 3 + i) * 0.2;
      child.scale.setScalar(s);
    });
  });

  return (
    <group ref={particlesRef}>
      {[...Array(6)].map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.cos((i / 6) * Math.PI * 2) * 0.8,
            1,
            Math.sin((i / 6) * Math.PI * 2) * 0.8,
          ]}
        >
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={2}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
    </group>
  );
};

// Visible fallback while GLB loads
const ModelFallback = () => (
  <mesh>
    <capsuleGeometry args={[0.4, 1, 4, 8]} />
    <meshStandardMaterial color="#FFD60A" wireframe />
  </mesh>
);

// Input Handler Hook
const usePlayerInput = () => {
  const keys = useRef({
    forward: false, backward: false, left: false, right: false,
    jump: false, dodge: false, attack: false,
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp': keys.current.forward = true; break;
        case 'KeyS': case 'ArrowDown': keys.current.backward = true; break;
        case 'KeyA': case 'ArrowLeft': keys.current.left = true; break;
        case 'KeyD': case 'ArrowRight': keys.current.right = true; break;
        case 'Space': keys.current.jump = true; break;
        case 'ShiftLeft': case 'ShiftRight': case 'KeyK': keys.current.dodge = true; break;
        case 'KeyJ': keys.current.attack = true; break;
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
        case 'ShiftLeft': case 'ShiftRight': case 'KeyK': keys.current.dodge = false; break;
        case 'KeyJ': keys.current.attack = false; break;
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
export const PlayerWithModel = () => {
  const rigidBodyRef = useRef();
  const {
    player, tails, gameState,
    updatePlayerPosition, setPlayerAttacking, setPlayerDodging,
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
    };

    window.addEventListener('mousedown', handleClick);
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('mousedown', handleClick);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [gameState, setPlayerAttacking]);

  useFrame((state, delta) => {
    if (!rigidBodyRef.current || gameState !== 'playing') return;
    const body = rigidBodyRef.current;
    const linvel = body.linvel();

    const cameraDirection = new THREE.Vector3();
    state.camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();
    const cameraRight = new THREE.Vector3().crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0));

    direction.current.set(0, 0, 0);
    if (keys.current.forward) direction.current.add(cameraDirection);
    if (keys.current.backward) direction.current.sub(cameraDirection);
    if (keys.current.left) direction.current.sub(cameraRight);
    if (keys.current.right) direction.current.add(cameraRight);
    direction.current.normalize();

    if (direction.current.length() > 0) {
      body.setLinvel({
        x: direction.current.x * moveSpeed,
        y: linvel.y,
        z: direction.current.z * moveSpeed,
      }, true);
      const angle = Math.atan2(direction.current.x, direction.current.z);
      const targetQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, angle, 0));
      const r = body.rotation();
      const currentQuat = new THREE.Quaternion(r.x, r.y, r.z, r.w);
      currentQuat.slerp(targetQuat, 0.15);
      body.setRotation({ x: currentQuat.x, y: currentQuat.y, z: currentQuat.z, w: currentQuat.w }, true);
    } else {
      body.setLinvel({ x: linvel.x * 0.85, y: linvel.y, z: linvel.z * 0.85 }, true);
    }

    if (keys.current.jump && canJump.current) {
      body.applyImpulse({ x: 0, y: jumpForce, z: 0 }, true);
      canJump.current = false;
      setTimeout(() => (canJump.current = true), 600);
    }

    if (keys.current.dodge && canDash.current && direction.current.length() > 0) {
      setPlayerDodging(true);
      canDash.current = false;
      const dashDir = direction.current.clone().multiplyScalar(dashForce);
      body.applyImpulse({ x: dashDir.x, y: 2, z: dashDir.z }, true);
      setTimeout(() => setPlayerDodging(false), 300);
      setTimeout(() => { canDash.current = true; }, 800);
    }

    if (keys.current.attack) {
      const now = Date.now();
      if (now - lastAttackTime.current > 350) {
        setPlayerAttacking(true);
        lastAttackTime.current = now;
        setTimeout(() => setPlayerAttacking(false), 250);
      }
      keys.current.attack = false;
    }

    const pos = body.translation();
    updatePlayerPosition([pos.x, pos.y, pos.z]);

    // Out-of-bounds fall: teleport back to spawn instead of insta-kill loop
    if (pos.y < -20) {
      body.setTranslation({ x: 0, y: 8, z: 0 }, true);
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      updatePlayerHealth(-20);
      const hp = useGameStore.getState().player.health;
      if (hp <= 0) {
        useGameStore.getState().setGameState('dead');
      }
    }

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
          scale={0.9}
        />
      </Suspense>
    </RigidBody>
  );
};

export { KaiJaxModel };
export default PlayerWithModel;

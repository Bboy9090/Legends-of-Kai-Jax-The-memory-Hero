/**
 * ULTIMATE ENTERTAINMENT ENTERPRISES PRESENTS
 * OPTIMIZED BEAST MODEL - REAL GLB WITH ANIMATIONS
 * Mobile/Tablet/PC optimized Three.js character model
 */

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, Clone } from '@react-three/drei';
import * as THREE from 'three';
import { useBattle } from '../../../lib/stores/useBattle';

interface OptimizedBeastModelProps {
  beast: any;
  bodyRef?: React.RefObject<THREE.Group>;
  headRef?: React.RefObject<THREE.Group>;
  emotionIntensity?: number;
  hitAnim?: number;
  animTime?: number;
  isAttacking?: boolean;
  isInvulnerable?: boolean;
  isMoving?: boolean;
  scale?: number;
}

/**
 * Get GLB model path for beast
 */
function getBeastModelPath(beastId: string): string {
  // Check common naming patterns for the generated models
  const cleanId = beastId.toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `/models/${cleanId}.glb`;
}

/**
 * OPTIMIZED BEAST MODEL - Real GLB with animations
 */
export default function OptimizedBeastModel({
  beast,
  bodyRef,
  headRef,
  emotionIntensity = 0,
  hitAnim = 0,
  animTime = 0,
  isAttacking = false,
  isInvulnerable = false,
  isMoving = false,
  scale = 2.5,
}: OptimizedBeastModelProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const modelPath = getBeastModelPath(beast.id);
  const [loadError, setLoadError] = useState(false);
  
  // Load GLB model
  const { scene, animations } = useGLTF(modelPath, undefined, undefined, (err) => {
    console.warn(`Failed to load model: ${modelPath}`, err);
    setLoadError(true);
  });
  
  const { actions, mixer } = useAnimations(animations, groupRef);
  
  // Handle animations
  useEffect(() => {
    if (!actions || Object.keys(actions).length === 0) return;
    
    const actionName = isAttacking ? 'attack' : isMoving ? 'run' : 'idle';
    const available = Object.keys(actions);
    
    // Flexible matching: case-insensitive and partial
    const match = available.find(n => n.toLowerCase() === actionName) ||
                  available.find(n => n.toLowerCase().includes(actionName)) ||
                  available[0];
    
    if (match && actions[match]) {
      // Stop all other actions first for a clean transition
      Object.values(actions).forEach(a => a?.fadeOut(0.2));
      actions[match].reset().fadeIn(0.2).play();
    }
  }, [actions, isAttacking, isMoving]);

  // Hit animation and effects
  useFrame((state, delta) => {
    if (mixer) mixer.update(delta);
    if (!groupRef.current) return;
    
    if (hitAnim > 0) {
      const shake = Math.sin(state.clock.elapsedTime * 25) * 0.08 * hitAnim;
      groupRef.current.position.x = shake;
    }
    
    // Emotion intensity affects scale/pulse
    if (emotionIntensity > 0) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.03 * emotionIntensity;
      groupRef.current.scale.setScalar(scale * pulse);
    }
  });

  if (loadError) {
    return (
      <group ref={groupRef as any}>
        <mesh castShadow position={[0, 0.8, 0]}>
          <boxGeometry args={[0.6, 1.6, 0.6]} />
          <meshStandardMaterial color={beast.color || "#4488ff"} />
        </mesh>
      </group>
    );
  }

  return (
    <group ref={groupRef}>
      <Clone 
        object={scene} 
        scale={scale} 
        castShadow 
        receiveShadow 
        inject={<primitive object={new THREE.Group()} ref={bodyRef} />}
      />
    </group>
  );
}

// Preload common models
useGLTF.preload('/models/kaison.glb');
useGLTF.preload('/models/jaxon.glb');
useGLTF.preload('/models/kai_jax.glb');

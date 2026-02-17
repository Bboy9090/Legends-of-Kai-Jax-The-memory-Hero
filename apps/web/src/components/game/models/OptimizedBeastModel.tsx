/**
 * ULTIMATE ENTERTAINMENT ENTERPRISES PRESENTS
 * OPTIMIZED BEAST MODEL - REAL GLB WITH ANIMATIONS
 * Mobile/Tablet/PC optimized Three.js character model
 */

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
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

// Fallback model path for missing assets
const FALLBACK_MODEL_PATH = '/models/default_beast.glb';

/**
 * Get GLB model path for beast
 */
function getBeastModelPath(beastId: string): string {
  // Check common naming patterns for the generated models
  const cleanId = beastId.toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `/models/${cleanId}.glb`;
}

/**
 * Procedural fallback geometry for when model loading fails
 */
function ProceduralBeastFallback({ beast, scale = 2.5 }: { beast: any; scale?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const color = beast?.color || beast?.visual?.color || '#8844ff';
  const accentColor = beast?.accentColor || beast?.visual?.accentColor || '#00ffff';

  useFrame((state) => {
    if (groupRef.current) {
      // Idle breathing animation
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.02;
      groupRef.current.scale.setScalar(scale * pulse);
    }
  });

  return (
    <group ref={groupRef} scale={scale}>
      {/* Body */}
      <mesh castShadow receiveShadow position={[0, 0.8, 0]}>
        <capsuleGeometry args={[0.4, 0.8, 8, 16]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Head */}
      <mesh castShadow receiveShadow position={[0, 1.6, 0.1]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Eyes (accent glow) */}
      <mesh position={[0.1, 1.65, 0.3]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[-0.1, 1.65, 0.3]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

/**
 * Wrapper that safely loads GLB with fallback
 */
function SafeGLTFModel({
  modelPath,
  beast,
  groupRef,
  bodyRef,
  scale,
  hitAnim,
  emotionIntensity,
  isAttacking,
  isMoving,
}: {
  modelPath: string;
  beast: any;
  groupRef: React.RefObject<THREE.Group>;
  bodyRef?: React.RefObject<THREE.Group>;
  scale: number;
  hitAnim: number;
  emotionIntensity: number;
  isAttacking: boolean;
  isMoving: boolean;
}) {
  const [loadError, setLoadError] = useState(false);
  
  // Attempt to load the model - useGLTF will throw if it fails
  // We catch this by trying fallback path first if main fails
  let gltfResult;
  let pathToUse = modelPath;
  
  try {
    gltfResult = useGLTF(modelPath);
  } catch {
    // If primary path fails, try fallback
    try {
      gltfResult = useGLTF(FALLBACK_MODEL_PATH);
      pathToUse = FALLBACK_MODEL_PATH;
    } catch {
      // Both failed - will render procedural fallback
      setLoadError(true);
    }
  }
  
  const scene = gltfResult?.scene;
  const animations = gltfResult?.animations || [];
  const { actions, mixer } = useAnimations(animations, groupRef);
  
  // Apply visual enhancements (shading/coloring)
  const enhancedScene = useMemo(() => {
    if (!scene) return null;
    const cloned = scene.clone();
    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        if (child.material) {
          const mat = child.material as THREE.MeshStandardMaterial;
          mat.roughness = 0.15;
          mat.metalness = 0.8;
          mat.envMapIntensity = 2.0;
          
          if (beast.accentColor || beast.visual?.accentColor) {
            mat.emissive = new THREE.Color(beast.accentColor || beast.visual.accentColor);
            mat.emissiveIntensity = 0.2;
          }
        }
      }
    });
    return cloned;
  }, [scene, beast]);

  // Handle animations
  useEffect(() => {
    if (!actions) return;
    const actionName = isAttacking ? 'attack' : isMoving ? 'run' : 'idle';
    const action = actions[actionName] || actions['idle'] || Object.values(actions)[0];
    
    if (action) {
      action.reset().fadeIn(0.2).play();
      return () => { action.fadeOut(0.2); };
    }
  }, [actions, isAttacking, isMoving]);

  // Apply scale
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.scale.setScalar(scale);
    }
  }, [scale, groupRef]);

  // Hit animation and effects
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    if (hitAnim > 0) {
      const shake = Math.sin(state.clock.elapsedTime * 20) * 0.05 * hitAnim;
      groupRef.current.rotation.z = shake;
    }
    
    if (emotionIntensity > 0) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.02 * emotionIntensity;
      groupRef.current.scale.setScalar(scale * pulse);
    }

    if (mixer) {
      mixer.update(delta);
    }
  });

  // If we couldn't load any model, return null (parent will show procedural fallback)
  if (loadError || !enhancedScene) {
    return null;
  }

  return (
    <primitive 
      ref={bodyRef as any}
      object={enhancedScene} 
      position={[0, 0, 0]}
    />
  );
}

/**
 * OPTIMIZED BEAST MODEL - Real GLB with animations and fallback
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
  const groupRef = useRef<THREE.Group>(null);
  const [useFallback, setUseFallback] = useState(false);
  const modelPath = getBeastModelPath(beast.id);
  
  // Error boundary for model loading - if SafeGLTFModel fails, use procedural fallback
  useEffect(() => {
    // Reset fallback state when beast changes
    setUseFallback(false);
  }, [beast.id]);

  // If we need procedural fallback
  if (useFallback) {
    return <ProceduralBeastFallback beast={beast} scale={scale} />;
  }

  return (
    <group ref={groupRef}>
      <React.Suspense fallback={<ProceduralBeastFallback beast={beast} scale={scale} />}>
        <SafeGLTFModel
          modelPath={modelPath}
          beast={beast}
          groupRef={groupRef}
          bodyRef={bodyRef}
          scale={scale}
          hitAnim={hitAnim}
          emotionIntensity={emotionIntensity}
          isAttacking={isAttacking}
          isMoving={isMoving}
        />
      </React.Suspense>
    </group>
  );
}

// Preload common models
useGLTF.preload('/models/kaison.glb');
useGLTF.preload('/models/jaxon.glb');
useGLTF.preload('/models/kai_jax.glb');

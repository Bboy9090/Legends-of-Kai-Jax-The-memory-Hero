/**
 * ULTIMATE ENTERTAINMENT ENTERPRISES PRESENTS
 * OPTIMIZED BEAST MODEL - REAL GLB WITH ANIMATIONS
 * Mobile/Tablet/PC optimized Three.js character model
 */

import { useRef, useMemo, useEffect } from 'react';
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
  const groupRef = useRef<THREE.Group>(null);
  const modelPath = getBeastModelPath(beast.id);
  
  // Load GLB model
  const { scene, animations } = useGLTF(modelPath);
  const { actions, mixer } = useAnimations(animations, groupRef);
  
  // Apply visual enhancements (shading/coloring)
  const enhancedScene = useMemo(() => {
    const cloned = scene.clone();
    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        if (child.material) {
          const mat = child.material as THREE.MeshStandardMaterial;
          mat.roughness = 0.15; // More metallic/glossy like cinematic references
          mat.metalness = 0.8;  // High contrast metallic feel
          mat.envMapIntensity = 2.0; // Stronger reflections
          
          // Add rim lighting effect via emissive if it matches beast colors
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
  }, [scale]);

  // Hit animation and effects
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    if (hitAnim > 0) {
      const shake = Math.sin(state.clock.elapsedTime * 20) * 0.05 * hitAnim;
      groupRef.current.rotation.z = shake;
    }
    
    // Emotion intensity affects scale/pulse
    if (emotionIntensity > 0) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.02 * emotionIntensity;
      groupRef.current.scale.setScalar(scale * pulse);
    }

    if (mixer) {
      mixer.update(delta);
    }
  });

  return (
    <group ref={groupRef}>
      <primitive 
        ref={bodyRef as any}
        object={enhancedScene} 
        position={[0, 0, 0]}
      />
    </group>
  );
}

// Preload common models
useGLTF.preload('/models/kaison.glb');
useGLTF.preload('/models/jaxon.glb');
useGLTF.preload('/models/kai_jax.glb');

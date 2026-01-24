/**
 * ULTIMATE ENTERTAINMENT ENTERPRISES PRESENTS
 * OPTIMIZED GLB LOADER FOR THREE.JS
 * Real GLB loading with animations, LOD, and mobile optimization
 */
 
import { useGLTF, useAnimations } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';

export interface GLBModelConfig {
  path: string;
  scale?: number;
  position?: [number, number, number];
  castShadow?: boolean;
  receiveShadow?: boolean;
  animations?: {
    idle?: string;
    walk?: string;
    run?: string;
    punch?: string;
    kick?: string;
    kickHeavy?: string;
    special?: string;
    jump?: string;
    hit?: string;
    victory?: string;
    defeat?: string;
  };
}

export interface GLBModelProps {
  config: GLBModelConfig;
  animationState?:
    | 'idle'
    | 'walk'
    | 'run'
    | 'punch'
    | 'kick'
    | 'kickHeavy'
    | 'special'
    | 'jump'
    | 'hit'
    | 'victory'
    | 'defeat';
  isAttacking?: boolean;
  isMoving?: boolean;
  loop?: boolean;
  onAnimationComplete?: () => void;
}

/**
 * REAL GLB MODEL LOADER with animations
 * Optimized for mobile/tablet/PC
 */
export function GLBModel({
  config,
  animationState = 'idle',
  isAttacking = false,
  isMoving = false,
  loop = true,
  onAnimationComplete,
}: GLBModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(config.path);
  const { actions, mixer } = useAnimations(animations, groupRef);
  const currentActionRef = useRef<THREE.AnimationAction | null>(null);
  const previousActionRef = useRef<string>('');

  // Clone scene for instancing (performance)
  const clonedScene = useMemo(() => {
    const cloned = scene.clone();

    // Optimize materials for mobile
    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = config.castShadow ?? true;
        child.receiveShadow = config.receiveShadow ?? true;

        // Mobile optimization: reduce material complexity
        if (child.material instanceof THREE.MeshStandardMaterial) {
          child.material.needsUpdate = true;
          // Use simpler materials on mobile
          if (window.innerWidth < 768) {
            child.material.roughness = 0.8; // Less reflection = faster
            child.material.metalness = 0.2;
          }
        }
      }
    });

    return cloned;
  }, [scene, config]);

  // Animation state machine - REAL IMPLEMENTATION
  useEffect(() => {
    if (!actions || !config.animations) return;

    // Determine which animation to play
    let targetAnimation: string | undefined;

    if (isAttacking) {
      // Attack animations take priority
      if (animationState === 'punch') targetAnimation = config.animations.punch;
      else if (animationState === 'kick') targetAnimation = config.animations.kick;
      else if (animationState === 'kickHeavy') targetAnimation = config.animations.kickHeavy;
      else if (animationState === 'special') targetAnimation = config.animations.special;
      else targetAnimation = config.animations.punch; // Default to punch
    } else if (isMoving) {
      // Movement animations
      targetAnimation = config.animations.run || config.animations.walk;
    } else {
      // Default to idle or specified state
      targetAnimation =
        (config.animations as Record<string, string | undefined>)[animationState] || config.animations.idle;
    }

    // Find matching animation action
    const actionName = targetAnimation || 'idle';
    const action = actions[actionName] || actions[Object.keys(actions)[0] as keyof typeof actions];

    if (!action) return;

    // Cross-fade between animations (smooth transitions)
    if (previousActionRef.current !== actionName && currentActionRef.current) {
      currentActionRef.current.fadeOut(0.2);
      action.reset().fadeIn(0.2).play();
    } else if (!currentActionRef.current) {
      action.reset().play();
    }

    // Set loop mode
    action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, 1);

    // Handle animation completion
    if (!loop && onAnimationComplete) {
      const handleComplete = () => {
        onAnimationComplete?.();
        action.removeEventListener('finished', handleComplete);
      };
      action.addEventListener('finished', handleComplete);
    }

    currentActionRef.current = action;
    previousActionRef.current = actionName;

    return () => {
      action.fadeOut(0.2);
    };
  }, [actions, animationState, isAttacking, isMoving, loop, onAnimationComplete, config.animations]);

  // Update animation mixer every frame
  useFrame((_, delta) => {
    mixer?.update(delta);
  });

  // Apply scale and position
  useEffect(() => {
    if (!groupRef.current) return;
    if (config.scale) groupRef.current.scale.setScalar(config.scale);
    if (config.position) groupRef.current.position.set(...config.position);
  }, [config.scale, config.position]);

  return <primitive ref={groupRef} object={clonedScene} />;
}

/**
 * Preload GLB models for better performance
 */
export function preloadGLB(path: string) {
  useGLTF.preload(path);
}

/**
 * Get optimized GLB path based on device
 */
export function getOptimizedGLBPath(
  basePath: string,
  deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop'
): string {
  // For now, use same path - can add LOD variants later
  // Format: /models/characters/{id}/{id}_LOD{0|1|2}.glb
  const lod = deviceType === 'mobile' ? 1 : deviceType === 'tablet' ? 0 : 0;
  return basePath.replace('.glb', `_LOD${lod}.glb`);
}


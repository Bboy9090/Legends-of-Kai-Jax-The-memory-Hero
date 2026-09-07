/**
 * KAI CHARACTER COMPONENT
 * Memory Spider Archetype - Day 1-2 MVP Implementation
 *
 * Kai is the protagonist memory spider with core mechanics:
 * - Wall-crawling traversal
 * - Web-swing movement
 * - Venom strike attacks
 * - Web binding special ability
 * - 4 visible spider limbs
 *
 * This is the canonical Kai implementation based on Legends of Kai-Jax novel canon.
 */

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, Clone } from '@react-three/drei';
import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

interface KaiCharacterProps {
  position?: [number, number, number];
  scale?: number;
  isMoving?: boolean;
  isAttacking?: boolean;
  isWallCrawling?: boolean;
  isWebZipping?: boolean;
  bodyRef?: React.RefObject<THREE.Group>;
}

const KAI_MODEL_PATH = '/models/kai_spider.glb';
const KAI_SCALE = 2.0;
const TARGET_HEIGHT = 2.2;

export function KaiCharacter({
  position = [0, 0, 0],
  scale = 1,
  isMoving = false,
  isAttacking = false,
  isWallCrawling = false,
  isWebZipping = false,
  bodyRef,
}: KaiCharacterProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const [loadError, setLoadError] = useState(false);
  const limbsRef = useRef<THREE.Group[]>([]);

  // Load Kai model - starts with fallback if Kai model not yet available
  const { scene, animations } = useGLTF(KAI_MODEL_PATH, undefined, undefined, (err) => {
    console.warn(`Failed to load Kai model: ${KAI_MODEL_PATH}. Using fallback for now.`, err);
    setLoadError(true);
  });

  // Clone skeleton to properly bind SkinnedMesh
  const cloned = useMemo(() => SkeletonUtils.clone(scene) as THREE.Group, [scene]);
  const { actions, mixer } = useAnimations(animations, cloned);

  // Normalize Kai to target height and position at ground
  useEffect(() => {
    const node = cloned;
    if (!node) return;

    node.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.visible = true;
      mesh.frustumCulled = false;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((m) => {
        if (!m) return;
        m.visible = true;
        (m as THREE.Material).opacity = 1;
        (m as THREE.Material).transparent = false;
        m.needsUpdate = true;
      });
    });

    node.updateMatrixWorld(true);
    const bbox = new THREE.Box3().setFromObject(node);
    const height = bbox.max.y - bbox.min.y;
    if (height > 0.001 && Number.isFinite(height)) {
      const s = THREE.MathUtils.clamp(TARGET_HEIGHT / height, 0.01, 100);
      node.scale.setScalar(s);
      node.position.y = -bbox.min.y * s;
    }
  }, [scene]);

  // Extract spider limbs (4 visible limbs for Kai's spider form)
  useEffect(() => {
    if (!cloned) return;
    const limbs: THREE.Group[] = [];

    cloned.traverse((child) => {
      if (child instanceof THREE.Group && child.name.toLowerCase().includes('limb')) {
        limbs.push(child);
      }
      if (child instanceof THREE.Group && child.name.match(/leg|limb/i)) {
        limbs.push(child);
      }
    });

    limbsRef.current = limbs.slice(0, 4); // Keep only 4 limbs visible
  }, [cloned]);

  // Animation handling - Kai has walk, run, wall_crawl, attack, dodge, idle
  useEffect(() => {
    if (!actions || Object.keys(actions).length === 0) return;

    let targetAnim = 'idle';
    if (isWallCrawling) {
      targetAnim = 'wall_crawl';
    } else if (isAttacking) {
      targetAnim = 'attack';
    } else if (isMoving) {
      targetAnim = 'run';
    }

    const available = Object.keys(actions);
    const match = available.find(n => n.toLowerCase() === targetAnim) ||
                  available.find(n => n.toLowerCase().includes(targetAnim)) ||
                  (targetAnim === 'run' && available.find(n => n.toLowerCase().includes('walk'))) ||
                  available[0];

    if (match && actions[match]) {
      Object.values(actions).forEach(a => a?.fadeOut(0.3));
      actions[match].reset().fadeIn(0.3).play();
    }
  }, [actions, isMoving, isAttacking, isWallCrawling]);

  // Animate spider limbs with subtle idle motion
  useFrame((state, delta) => {
    if (mixer) mixer.update(delta);

    // Subtle limb breathing animation when idle
    if (!isMoving && !isAttacking) {
      limbsRef.current.forEach((limb, idx) => {
        const offset = (idx * Math.PI) / 2;
        const scale = 1 + Math.sin(state.clock.elapsedTime * 2 + offset) * 0.05;
        limb.scale.y = scale;
      });
    }
  });

  if (loadError) {
    return (
      <group ref={groupRef} position={position} scale={scale}>
        <mesh castShadow position={[0, 1.1, 0]}>
          <boxGeometry args={[0.5, 2.2, 0.5]} />
          <meshStandardMaterial color="#4a7c59" />
        </mesh>
        {/* Placeholder spider limbs */}
        {[0, 1, 2, 3].map((idx) => (
          <mesh
            key={`limb-${idx}`}
            position={[
              Math.cos((idx * Math.PI) / 2) * 0.3,
              1.1,
              Math.sin((idx * Math.PI) / 2) * 0.3,
            ]}
            castShadow
          >
            <cylinderGeometry args={[0.08, 0.08, 0.8]} />
            <meshStandardMaterial color="#3a6c49" />
          </mesh>
        ))}
      </group>
    );
  }

  return (
    <group ref={groupRef || bodyRef} position={position} scale={scale} rotation={[0, Math.PI / 2, 0]}>
      <Clone object={cloned} />
    </group>
  );
}

// Preload Kai model
useGLTF.preload(KAI_MODEL_PATH);

import { useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface HedgehogModelProps {
  primaryColor: string;
  accentColor: string;
  glowColor: string;
}

export default function HedgehogModel({ primaryColor, accentColor, glowColor }: HedgehogModelProps) {
  const gltf = useGLTF('/models/hedgehog_hero.glb');
  
  const clonedScene = useMemo(() => {
    const scene = gltf.scene.clone(true);
    
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const material = new THREE.MeshToonMaterial({
          color: primaryColor,
          emissive: accentColor,
          emissiveIntensity: 0.3,
        });
        child.material = material;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    
    scene.scale.set(1.5, 1.5, 1.5);
    scene.position.set(0, -1, 0);
    
    return scene;
  }, [gltf, primaryColor, accentColor]);
  
  return <primitive object={clonedScene} />;
}

useGLTF.preload('/models/hedgehog_hero.glb');

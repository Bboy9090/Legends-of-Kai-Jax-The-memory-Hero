import { useRef, useEffect, Suspense, useState, useMemo, Component, ReactNode } from 'react';
import { useGLTF, Clone } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { normalizeToBrightColor } from '../materials/ToonMaterial';

interface GLBCharacterModelProps {
  modelPath: string;
  bodyRef: React.RefObject<THREE.Group>;
  headRef?: React.RefObject<THREE.Group>;
  leftArmRef?: React.RefObject<THREE.Group>;
  rightArmRef?: React.RefObject<THREE.Group>;
  leftLegRef?: React.RefObject<THREE.Group>;
  rightLegRef?: React.RefObject<THREE.Group>;
  emotionIntensity?: number;
  hitAnim?: number;
  animTime?: number;
  isAttacking?: boolean;
  isInvulnerable?: boolean;
  primaryColor?: string;
  accentColor?: string;
  scale?: number;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class GLBErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.warn('GLB Model failed to load:', error.message);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const gradientMapCache = new Map<string, THREE.DataTexture>();

function getGradientMap(): THREE.DataTexture {
  const key = 'toon4';
  if (!gradientMapCache.has(key)) {
    const gradientData = new Uint8Array([80, 140, 200, 255]);
    const gradientMap = new THREE.DataTexture(gradientData, 4, 1, THREE.RedFormat);
    gradientMap.needsUpdate = true;
    gradientMapCache.set(key, gradientMap);
  }
  return gradientMapCache.get(key)!;
}

const materialCache = new Map<string, Map<number, THREE.MeshToonMaterial>>();

function getToonMaterial(colorKey: string, color: THREE.Color, meshIndex: number): THREE.MeshToonMaterial {
  if (!materialCache.has(colorKey)) {
    materialCache.set(colorKey, new Map());
  }
  const colorMaterials = materialCache.get(colorKey)!;
  
  if (!colorMaterials.has(meshIndex)) {
    const toonMaterial = new THREE.MeshToonMaterial({
      color: color,
      gradientMap: getGradientMap(),
      emissive: color.clone().multiplyScalar(0.15),
      emissiveIntensity: 0.4,
    });
    colorMaterials.set(meshIndex, toonMaterial);
  }
  return colorMaterials.get(meshIndex)!;
}

function GLBModel({ 
  modelPath, 
  bodyRef,
  scale = 2.5,
  isInvulnerable = false,
  isAttacking = false,
  hitAnim = 0,
  animTime = 0,
  emotionIntensity = 0,
  primaryColor = '#FF4444',
  accentColor = '#FFAA00'
}: GLBCharacterModelProps) {
  const internalGroupRef = useRef<THREE.Group>(null);
  const rimLightRef = useRef<THREE.PointLight>(null);
  const materialsAppliedRef = useRef(false);
  const modelKeyRef = useRef<string>('');
  
  const { scene } = useGLTF(modelPath);
  
  const normalizedPrimary = useMemo(() => normalizeToBrightColor(primaryColor), [primaryColor]);
  const normalizedAccent = useMemo(() => normalizeToBrightColor(accentColor), [accentColor]);
  const primaryColorObj = useMemo(() => new THREE.Color(normalizedPrimary), [normalizedPrimary]);
  const accentColorObj = useMemo(() => new THREE.Color(normalizedAccent), [normalizedAccent]);
  
  const colorKey = `${normalizedPrimary}-${normalizedAccent}`;

  useEffect(() => {
    if (scene && (colorKey !== modelKeyRef.current || !materialsAppliedRef.current)) {
      modelKeyRef.current = colorKey;
      
      let meshIndex = 0;
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const useAccent = meshIndex % 3 === 0;
          const color = useAccent ? accentColorObj : primaryColorObj;
          
          child.material = getToonMaterial(colorKey, color, meshIndex);
          child.castShadow = true;
          child.receiveShadow = true;
          
          meshIndex++;
        }
      });
      
      materialsAppliedRef.current = true;
    }
  }, [scene, colorKey, primaryColorObj, accentColorObj]);

  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshToonMaterial) {
          child.material.emissiveIntensity = isInvulnerable ? 0.8 : 0.4;
        }
      });
    }
  }, [scene, isInvulnerable]);

  useEffect(() => {
    if (internalGroupRef.current && bodyRef.current === null) {
      (bodyRef as React.MutableRefObject<THREE.Group>).current = internalGroupRef.current;
    }
  }, [bodyRef]);
  
  useFrame((state, delta) => {
    const group = internalGroupRef.current;
    if (!group) return;

    if (hitAnim > 0) {
      group.rotation.z = Math.sin(animTime * 30) * 0.25 * hitAnim;
      group.position.x = Math.sin(animTime * 40) * 0.15 * hitAnim;
      group.scale.setScalar(scale * (1 - hitAnim * 0.1));
    } else if (isAttacking) {
      group.rotation.z = Math.sin(animTime * 25) * 0.2;
      group.rotation.x = Math.sin(animTime * 18) * 0.15;
      group.scale.setScalar(scale * (1 + Math.sin(animTime * 30) * 0.08));
    } else {
      group.rotation.z = Math.sin(animTime * 2) * 0.04;
      group.rotation.x = Math.sin(animTime * 1.5) * 0.02;
      group.scale.setScalar(scale);
    }
    
    const breathe = Math.sin(animTime * 3) * 0.08;
    const bob = Math.sin(animTime * 2) * 0.03;
    group.position.y = 0.2 + breathe + bob;
    
    if (emotionIntensity > 0.5) {
      group.rotation.y = Math.sin(animTime * 8) * 0.08 * emotionIntensity;
    }

    if (rimLightRef.current) {
      rimLightRef.current.intensity = isAttacking ? 2.5 : (isInvulnerable ? 2 : 1);
    }
  });
  
  return (
    <group ref={internalGroupRef} scale={[scale, scale, scale]} position={[0, 0.2, 0]}>
      <Clone object={scene} />
      
      <pointLight
        ref={rimLightRef}
        position={[0, 1, -1]}
        intensity={1}
        color={normalizedAccent}
        distance={5}
      />
      
      <pointLight
        position={[0.5, 0.5, 1]}
        intensity={0.6}
        color="#FFFFFF"
        distance={3}
      />
      
      <pointLight
        position={[-0.5, 0.8, 0.5]}
        intensity={0.4}
        color={normalizedPrimary}
        distance={4}
      />
      
      {isInvulnerable && (
        <>
          <mesh scale={1.6}>
            <sphereGeometry args={[0.45, 24, 16]} />
            <meshBasicMaterial 
              color="#88DDFF"
              transparent
              opacity={0.35 + Math.sin(animTime * 12) * 0.15}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          <mesh scale={1.8}>
            <sphereGeometry args={[0.45, 16, 12]} />
            <meshBasicMaterial 
              color="#FFFFFF"
              transparent
              opacity={0.15 + Math.sin(animTime * 8) * 0.1}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              wireframe
            />
          </mesh>
        </>
      )}
      
      {hitAnim > 0 && (
        <>
          <mesh scale={1.3 + hitAnim * 0.4}>
            <sphereGeometry args={[0.45, 16, 12]} />
            <meshBasicMaterial 
              color="#FF4444"
              transparent
              opacity={hitAnim * 0.6}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          <mesh scale={1.1}>
            <sphereGeometry args={[0.5, 8, 6]} />
            <meshBasicMaterial 
              color="#FFFF00"
              transparent
              opacity={hitAnim * 0.3}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </>
      )}
      
      {isAttacking && (
        <>
          <mesh scale={1.4 + Math.sin(animTime * 20) * 0.25}>
            <sphereGeometry args={[0.45, 16, 12]} />
            <meshBasicMaterial 
              color={normalizedAccent}
              transparent
              opacity={0.4}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          <mesh scale={1.2} rotation={[0, animTime * 5, 0]}>
            <torusGeometry args={[0.5, 0.05, 8, 16]} />
            <meshBasicMaterial 
              color="#FFFFFF"
              transparent
              opacity={0.5}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </>
      )}
    </group>
  );
}

function StylizedFallbackCharacter({ 
  primaryColor = '#FF4444', 
  accentColor = '#FFAA00' 
}: { 
  primaryColor?: string; 
  accentColor?: string; 
}) {
  const groupRef = useRef<THREE.Group>(null);
  const normalizedPrimary = normalizeToBrightColor(primaryColor);
  const normalizedAccent = normalizeToBrightColor(accentColor);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      groupRef.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });
  
  return (
    <group ref={groupRef} position={[0, 0.5, 0]}>
      <mesh position={[0, 0.4, 0]}>
        <capsuleGeometry args={[0.35, 0.6, 8, 16]} />
        <meshToonMaterial color={normalizedPrimary} />
      </mesh>
      
      <mesh position={[0, 1.0, 0]}>
        <sphereGeometry args={[0.3, 16, 12]} />
        <meshToonMaterial color={normalizedPrimary} />
      </mesh>
      
      <mesh position={[0.15, 1.05, 0.2]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[-0.15, 1.05, 0.2]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[0.15, 1.05, 0.25]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color="#222222" />
      </mesh>
      <mesh position={[-0.15, 1.05, 0.25]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color="#222222" />
      </mesh>
      
      <mesh position={[0.45, 0.5, 0]} rotation={[0, 0, -0.3]}>
        <capsuleGeometry args={[0.1, 0.4, 4, 8]} />
        <meshToonMaterial color={normalizedAccent} />
      </mesh>
      <mesh position={[-0.45, 0.5, 0]} rotation={[0, 0, 0.3]}>
        <capsuleGeometry args={[0.1, 0.4, 4, 8]} />
        <meshToonMaterial color={normalizedAccent} />
      </mesh>
      
      <mesh position={[0.15, -0.2, 0]}>
        <capsuleGeometry args={[0.12, 0.5, 4, 8]} />
        <meshToonMaterial color={normalizedPrimary} />
      </mesh>
      <mesh position={[-0.15, -0.2, 0]}>
        <capsuleGeometry args={[0.12, 0.5, 4, 8]} />
        <meshToonMaterial color={normalizedPrimary} />
      </mesh>
      
      <pointLight position={[0, 1.5, 1]} intensity={0.8} color={normalizedAccent} distance={4} />
    </group>
  );
}

function FallbackBox({ primaryColor, accentColor }: { primaryColor?: string; accentColor?: string }) {
  return <StylizedFallbackCharacter primaryColor={primaryColor} accentColor={accentColor} />;
}

export default function GLBCharacterModel(props: GLBCharacterModelProps) {
  return (
    <GLBErrorBoundary fallback={<FallbackBox primaryColor={props.primaryColor} accentColor={props.accentColor} />}>
      <Suspense fallback={<FallbackBox primaryColor={props.primaryColor} accentColor={props.accentColor} />}>
        <GLBModel {...props} />
      </Suspense>
    </GLBErrorBoundary>
  );
}

export { CHARACTER_MODEL_PATHS, hasGLBModel, getModelPath } from './characterModelPaths';

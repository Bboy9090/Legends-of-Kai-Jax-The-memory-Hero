import { useRef, useEffect, Suspense, useState, Component, ReactNode } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

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

function GLBModel({ 
  modelPath, 
  bodyRef,
  scale = 2.5,
  isInvulnerable = false,
  isAttacking = false,
  hitAnim = 0,
  animTime = 0,
  emotionIntensity = 0,
  primaryColor,
  accentColor
}: GLBCharacterModelProps) {
  const internalGroupRef = useRef<THREE.Group>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  
  let scene: THREE.Group;
  try {
    const gltf = useGLTF(modelPath);
    scene = gltf.scene;
  } catch (error) {
    console.warn(`Failed to load model: ${modelPath}`);
    return (
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.8, 1.2, 0.6]} />
        <meshToonMaterial color={primaryColor || "#888888"} />
      </mesh>
    );
  }
  
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          
          if (child.material) {
            const material = child.material as THREE.MeshStandardMaterial;
            if (material.emissive) {
              material.emissiveIntensity = isInvulnerable ? 0.8 : 0.2;
            }
          }
        }
      });
      setModelLoaded(true);
    }
  }, [scene, isInvulnerable]);

  useEffect(() => {
    if (internalGroupRef.current && bodyRef.current === null) {
      (bodyRef as React.MutableRefObject<THREE.Group>).current = internalGroupRef.current;
    }
  }, [bodyRef, modelLoaded]);
  
  useFrame((state, delta) => {
    const group = internalGroupRef.current;
    if (!group) return;

    if (hitAnim > 0) {
      group.rotation.z = Math.sin(animTime * 30) * 0.2 * hitAnim;
      group.position.x = Math.sin(animTime * 40) * 0.1 * hitAnim;
    } else if (isAttacking) {
      group.rotation.z = Math.sin(animTime * 20) * 0.15;
      group.rotation.x = Math.sin(animTime * 15) * 0.1;
      group.scale.setScalar(scale * (1 + Math.sin(animTime * 25) * 0.05));
    } else {
      group.rotation.z = Math.sin(animTime * 2) * 0.03;
      group.rotation.x = 0;
      group.scale.setScalar(scale);
    }
    
    const breathe = Math.sin(animTime * 3) * 0.05;
    group.position.y = 0.2 + breathe;
    
    if (emotionIntensity > 0.5) {
      group.rotation.y = Math.sin(animTime * 8) * 0.05 * emotionIntensity;
    }
  });
  
  return (
    <group ref={internalGroupRef} scale={[scale, scale, scale]} position={[0, 0.2, 0]}>
      <primitive object={scene.clone()} />
      
      {isInvulnerable && (
        <mesh scale={1.5}>
          <sphereGeometry args={[0.5, 16, 12]} />
          <meshBasicMaterial 
            color="#FFFFFF"
            transparent
            opacity={0.4 + Math.sin(animTime * 10) * 0.2}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
      
      {hitAnim > 0 && (
        <mesh scale={1.2 + hitAnim * 0.3}>
          <sphereGeometry args={[0.5, 12, 8]} />
          <meshBasicMaterial 
            color="#FF0000"
            transparent
            opacity={hitAnim * 0.5}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
      
      {isAttacking && (
        <mesh scale={1.3 + Math.sin(animTime * 15) * 0.2}>
          <sphereGeometry args={[0.5, 12, 8]} />
          <meshBasicMaterial 
            color={accentColor || "#FFFF00"}
            transparent
            opacity={0.3}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
    </group>
  );
}

function FallbackBox({ primaryColor }: { primaryColor?: string }) {
  return (
    <mesh position={[0, 0.5, 0]}>
      <boxGeometry args={[0.8, 1.2, 0.6]} />
      <meshToonMaterial color={primaryColor || "#888888"} />
    </mesh>
  );
}

export default function GLBCharacterModel(props: GLBCharacterModelProps) {
  return (
    <GLBErrorBoundary fallback={<FallbackBox primaryColor={props.primaryColor} />}>
      <Suspense fallback={<FallbackBox primaryColor={props.primaryColor} />}>
        <GLBModel {...props} />
      </Suspense>
    </GLBErrorBoundary>
  );
}

export const CHARACTER_MODEL_PATHS: Record<string, string> = {
  'mario': '/models/mario_hero.glb',
  'sonic': '/models/velocity_hero.glb',
  'velocity': '/models/velocity_hero.glb',
  'link': '/models/ren_hero.glb',
  'ren': '/models/ren_hero.glb',
  'kirby': '/models/puffy_hero.glb',
  'puffy': '/models/puffy_hero.glb',
  'megaman': '/models/blaze_hero.glb',
  'blaze': '/models/blaze_hero.glb',
  'samus': '/models/sentinel_hero.glb',
  'sentinel': '/models/sentinel_hero.glb',
  'donkeykong': '/models/kong_hero.glb',
  'kong': '/models/kong_hero.glb',
  'pikachu': '/models/sparky_hero.glb',
  'sparky': '/models/sparky_hero.glb',
  'bowser': '/models/bowser_hero.glb',
  'zelda': '/models/zelda_hero.glb',
  'peach': '/models/peach_hero.glb',
  'fox': '/models/fox_hero.glb',
  'captain_falcon': '/models/apex_hero.glb',
  'apex': '/models/apex_hero.glb',
  'shadow': '/models/abyss_hero.glb',
  'abyss': '/models/abyss_hero.glb',
  'yoshi': '/models/yoshi_hero.glb',
  'luigi': '/models/luigi_hero.glb',
  'tails': '/models/tails_hero.glb',
  'falco': '/models/falco_hero.glb',
  'rosalina': '/models/rosalina_hero.glb',
  'impa': '/models/impa_hero.glb',
  'palutena': '/models/palutena_hero.glb',
  'ash': '/models/ash_hero.glb',
  'greninja': '/models/greninja_hero.glb',
  'snake': '/models/snake_hero.glb',
  'bayonetta': '/models/bayonetta_hero.glb',
  'ryu': '/models/ryu_hero.glb',
  'silver': '/models/silver_hero.glb',
  'solaro': '/models/solaro_hero.glb',
  'lunara': '/models/lunara_hero.glb',
  'diddy': '/models/diddy_hero.glb',
  'terry': '/models/terry_hero.glb',
  'pit': '/models/pit_hero.glb',
  'marth': '/models/marth_hero.glb',
  'cloud': '/models/cloud_hero.glb',
  'metaknight': '/models/metaknight_hero.glb',
  'meta_knight': '/models/metaknight_hero.glb',
  'wario': '/models/wario_hero.glb',
  'ness': '/models/ness_hero.glb',
  'mewtwo': '/models/mewtwo_hero.glb',
  'ken': '/models/ken_hero.glb',
  'chunli': '/models/chunli_hero.glb',
  'chun_li': '/models/chunli_hero.glb',
  'simon': '/models/simon_hero.glb',
  'lucario': '/models/lucario_hero.glb',
  'sephiroth': '/models/sephiroth_hero.glb',
  'iceclimbers': '/models/iceclimbers_hero.glb',
  'ice_climbers': '/models/iceclimbers_hero.glb',
  'inkling': '/models/inkling_hero.glb',
  'pacman': '/models/pacman_hero.glb',
  'pac_man': '/models/pacman_hero.glb',
  'dedede': '/models/dedede_hero.glb',
  'king_dedede': '/models/dedede_hero.glb',
  'ridley': '/models/ridley_hero.glb',
  'joker': '/models/joker_hero.glb',
  'hero': '/models/hero_hero.glb',
  'banjo': '/models/banjo_hero.glb',
  'banjo_kazooie': '/models/banjo_hero.glb',
  'minmin': '/models/minmin_hero.glb',
  'min_min': '/models/minmin_hero.glb',
  'steve': '/models/steve_hero.glb',
  'kazuya': '/models/kazuya_hero.glb',
  'sora': '/models/sora_hero.glb',
  'pyra': '/models/pyra_hero.glb',
  'mythra': '/models/pyra_hero.glb',
  'waluigi': '/models/waluigi_hero.glb',
  'littlemac': '/models/littlemac_hero.glb',
  'little_mac': '/models/littlemac_hero.glb',
  'shulk': '/models/shulk_hero.glb'
};

export function hasGLBModel(characterId: string): boolean {
  return characterId in CHARACTER_MODEL_PATHS;
}

export function getModelPath(characterId: string): string | null {
  return CHARACTER_MODEL_PATHS[characterId] || null;
}

import { Component, Suspense, useEffect, useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { CANVAS_DPR, attachMeshoptDecoder } from "../../lib/threejs/GLBLoader";
import { applyRimLight } from "../../lib/threejs/rimLight";
import { getHeroIdentity, getHeroModelPath, type HeroVisualIdentity } from "../../lib/heroVisualIdentity";
import { Aura3D, GlowAttachment } from "./Aura3D";

class ModelBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

const TARGET_HEIGHT = 2.2;

function TurntableModel({ path, identity }: { path: string; identity: HeroVisualIdentity }) {
  const { scene } = useGLTF(path, true, true, attachMeshoptDecoder);
  const root = useMemo(() => scene.clone(true), [scene]);
  const spin = useRef<THREE.Group>(null);

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const scale = size.y > 0.01 ? TARGET_HEIGHT / size.y : 1;
    root.scale.setScalar(scale);
    root.position.set(-((box.min.x + box.max.x) / 2) * scale, -box.min.y * scale, -((box.min.z + box.max.z) / 2) * scale);
    return applyRimLight(root, { color: identity.rimColor, strength: 1.4, power: 2.4 });
  }, [root, identity.rimColor]);

  useFrame((_, delta) => {
    if (spin.current) spin.current.rotation.y += delta * 0.9;
  });

  return (
    <group ref={spin}>
      <primitive object={root} />
    </group>
  );
}

/** Stand-in for heroes whose 3D model has not shipped yet: their aura and signature attachment on a pedestal. */
function ProceduralEmblem({ identity }: { identity: HeroVisualIdentity }) {
  const spin = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (spin.current) spin.current.rotation.y += delta * 0.9;
  });
  return (
    <group ref={spin}>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.9, 1, 0.1, 40]} />
        <meshStandardMaterial color="#12131a" metalness={0.6} roughness={0.4} emissive={identity.rimColor} emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[0, 1.15, 0]}>
        <capsuleGeometry args={[0.38, 1.1, 8, 20]} />
        <meshStandardMaterial color="#0b0c12" metalness={0.3} roughness={0.55} emissive={identity.primaryColor} emissiveIntensity={0.18} />
      </mesh>
      <mesh position={[0, 2.0, 0]}>
        <sphereGeometry args={[0.3, 20, 20]} />
        <meshStandardMaterial color="#0b0c12" metalness={0.3} roughness={0.55} emissive={identity.accentColor} emissiveIntensity={0.18} />
      </mesh>
      <GlowAttachment kind={identity.attachment} color={identity.accentColor} position={[0.75, 1.2, 0.1]} />
    </group>
  );
}

interface HeroTurntableProps {
  heroId: string;
  className?: string;
}

/** 3D turntable preview: the real GLB with faction rim-light when one exists, otherwise an emblem. */
export default function HeroTurntable({ heroId, className }: HeroTurntableProps) {
  const identity = getHeroIdentity(heroId);
  if (!identity) return null;
  const path = getHeroModelPath(identity.id);
  const { position, target, fov } = identity.camera;
  const emblem = <ProceduralEmblem identity={identity} />;

  return (
    <div className={className} data-testid="hero-turntable" data-source={path ? "model" : "emblem"}>
      <Canvas dpr={CANVAS_DPR} camera={{ position, fov }} gl={{ antialias: true, alpha: true }} onCreated={({ camera }) => camera.lookAt(...target)}>
        <ambientLight intensity={0.55} />
        <directionalLight position={[3, 5, 4]} intensity={1.4} />
        <directionalLight position={[-4, 2, -3]} intensity={0.9} color={identity.rimColor} />
        <Aura3D color={identity.primaryColor} accent={identity.accentColor} intensity={identity.aura.intensity} radius={1.25} />
        <Suspense fallback={null}>
          {path ? (
            <ModelBoundary fallback={emblem}>
              <TurntableModel path={path} identity={identity} />
            </ModelBoundary>
          ) : (
            emblem
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}

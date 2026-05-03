import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Sparkles, Float } from '@react-three/drei';

/**
 * LEGENDS OF KAI-JAX: LEGENDARY BATTLE ARENA
 * High-fidelity, cinematic arena with dynamic lighting and grit.
 */
export default function BattleArena() {
  const floorRef = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Group>(null!);

  const gridTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.strokeStyle = 'rgba(0, 242, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, 512, 512);
    ctx.strokeStyle = 'rgba(0, 242, 255, 0.05)';
    for(let i = 0; i < 8; i++) {
      ctx.moveTo(i * 64, 0);
      ctx.lineTo(i * 64, 512);
      ctx.moveTo(0, i * 64);
      ctx.lineTo(512, i * 64);
    }
    ctx.stroke();
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(20, 20);
    return tex;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.05;
    }
  });

  return (
    <group>
      {/* Primary Battle Floor */}
      <mesh ref={floorRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          color="#050510" 
          roughness={0.8} 
          metalness={0.2}
          map={gridTexture}
        />
      </mesh>

      {/* Cinematic Fog Gradients */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <circleGeometry args={[20, 64]} />
        <meshBasicMaterial 
          color="#0a0a20" 
          transparent 
          opacity={0.8}
        />
      </mesh>

      {/* The Central "Memory Ring" */}
      <group ref={ringRef} position={[0, 0.01, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[11.8, 12, 128]} />
          <meshBasicMaterial color="#00f2ff" transparent opacity={0.3} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[11.5, 11.6, 64]} />
          <meshBasicMaterial color="#7f00ff" transparent opacity={0.2} />
        </mesh>
        
        {/* Floating Memory Nodes around the ring */}
        {[0, 1, 2, 3].map((i) => (
          <Float key={i} speed={2} rotationIntensity={1} floatIntensity={1}>
            <mesh position={[Math.cos(i * Math.PI / 2) * 12, 1, Math.sin(i * Math.PI / 2) * 12]}>
              <octahedronGeometry args={[0.3, 0]} />
              <meshBasicMaterial color={i % 2 === 0 ? "#00f2ff" : "#7f00ff"} />
            </mesh>
          </Float>
        ))}
      </group>

      {/* Environment Detail: Distant Monoliths */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const dist = 35;
        return (
          <mesh 
            key={i} 
            position={[Math.cos(angle) * dist, 10, Math.sin(angle) * dist]}
            castShadow
          >
            <boxGeometry args={[2, 40, 2]} />
            <meshStandardMaterial color="#0a0a15" metalness={0.8} roughness={0.1} />
          </mesh>
        );
      })}

      {/* Atmospheric Particles */}
      <Sparkles count={200} scale={50} size={2} speed={0.4} color="#00f2ff" opacity={0.4} />
      <Sparkles count={100} scale={30} size={4} speed={0.2} color="#7f00ff" opacity={0.2} />
      
      {/* Ground Glow */}
      <pointLight position={[0, 0.5, 0]} intensity={2} color="#00f2ff" distance={20} />
    </group>
  );
}

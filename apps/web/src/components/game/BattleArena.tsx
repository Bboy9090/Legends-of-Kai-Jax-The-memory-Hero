import { useMemo } from 'react';
import * as THREE from 'three';
import { Sparkles } from '@react-three/drei';

/**
 * Readability-first versus arena.
 * The playable battle lane is roughly x=-10..10, so the visual stage now
 * reinforces that footprint instead of surrounding a 1v1 with a 100x100 void.
 */
export default function BattleArena() {
  const gridTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#070711';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(0, 242, 255, 0.12)';
    ctx.lineWidth = 2;
    for (let x = 0; x <= canvas.width; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(127, 0, 255, 0.28)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }, []);

  return (
    <group>
      {/* Combat platform: deliberately close to the actual x=-10..10 bounds. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[24, 14]} />
        <meshStandardMaterial
          color="#080812"
          roughness={0.82}
          metalness={0.12}
          map={gridTexture}
        />
      </mesh>

      {/* Soft center combat mark; static so it never competes with motion. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <ringGeometry args={[2.8, 3.0, 64]} />
        <meshBasicMaterial color="#00f2ff" transparent opacity={0.18} />
      </mesh>

      {/* Clear edge language at the true gameplay walls. */}
      {[-10, 10].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.14, 13.5]} />
            <meshBasicMaterial color="#7f00ff" transparent opacity={0.52} />
          </mesh>
          <pointLight position={[0, 0.8, 0]} intensity={0.8} color="#7f00ff" distance={4} />
        </group>
      ))}

      {/* Low, distant silhouettes for depth without blocking fighter reads. */}
      {[-16, -12, 12, 16].map((x, index) => (
        <mesh key={x} position={[x, 4.5, -14 - (index % 2) * 3]}>
          <boxGeometry args={[1.5, 9, 1.5]} />
          <meshStandardMaterial color="#090914" metalness={0.55} roughness={0.5} />
        </mesh>
      ))}

      {/* Atmosphere stays subtle; combat silhouettes remain dominant. */}
      <Sparkles count={48} scale={[26, 10, 18]} size={1.25} speed={0.16} color="#00f2ff" opacity={0.18} />

      <pointLight position={[0, 2.5, 2]} intensity={1.2} color="#00f2ff" distance={18} />
      <pointLight position={[0, 4, -6]} intensity={0.75} color="#7f00ff" distance={18} />
    </group>
  );
}

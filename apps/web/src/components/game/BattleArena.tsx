import { useMemo } from 'react';
import * as THREE from 'three';
import { Sparkles } from '@react-three/drei';

function makeSignTexture(text: string, foreground: string, background = '#120a0b') {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const glow = ctx.createLinearGradient(0, 0, canvas.width, 0);
  glow.addColorStop(0, '#090506');
  glow.addColorStop(0.5, foreground);
  glow.addColorStop(1, '#090506');
  ctx.strokeStyle = glow;
  ctx.lineWidth = 10;
  ctx.strokeRect(14, 14, canvas.width - 28, canvas.height - 28);
  ctx.fillStyle = foreground;
  ctx.font = '700 54px Georgia';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = foreground;
  ctx.shadowBlur = 18;
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export default function BattleArena() {
  const streetTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
    g.addColorStop(0, '#11141c');
    g.addColorStop(0.55, '#090a10');
    g.addColorStop(1, '#05060a');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < canvas.height; y += 56) {
      const offset = (Math.floor(y / 56) % 2) * 36;
      for (let x = -offset; x < canvas.width; x += 72) {
        ctx.strokeStyle = 'rgba(110,90,70,.20)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, 68, 52);
      }
    }

    const center = ctx.createLinearGradient(0, 0, canvas.width, 0);
    center.addColorStop(0, 'rgba(156,78,221,0)');
    center.addColorStop(0.5, 'rgba(156,78,221,.22)');
    center.addColorStop(1, 'rgba(156,78,221,0)');
    ctx.fillStyle = center;
    ctx.fillRect(0, canvas.height * 0.46, canvas.width, 12);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1.2, 1.1);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);

  const fangSign = useMemo(() => makeSignTexture('FANG SYNDICATE', '#d54f45'), []);
  const ashblockSign = useMemo(() => makeSignTexture('ASHBLOCK HEIGHTS', '#b98b4f', '#0c1016'), []);

  const buildings = useMemo(
    () => [
      { x: -15.5, z: -12, w: 7, h: 15, d: 6 },
      { x: -10.5, z: -17, w: 6, h: 22, d: 7 },
      { x: -4.5, z: -21, w: 7, h: 27, d: 6 },
      { x: 4.5, z: -21, w: 7, h: 29, d: 6 },
      { x: 10.5, z: -17, w: 6, h: 22, d: 7 },
      { x: 15.5, z: -12, w: 7, h: 16, d: 6 },
    ],
    [],
  );

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[28, 18]} />
        <meshStandardMaterial
          color="#111319"
          roughness={0.28}
          metalness={0.34}
          map={streetTexture}
          envMapIntensity={0.75}
        />
      </mesh>

      {/* Wet neon reflections through the combat lane. */}
      {[
        { x: -6.5, color: '#d94d3f' },
        { x: 0, color: '#9d4edd' },
        { x: 6.5, color: '#55b7ff' },
      ].map((stripe) => (
        <mesh key={stripe.x} rotation={[-Math.PI / 2, 0, 0]} position={[stripe.x, 0.01, -1]}>
          <planeGeometry args={[2.6, 14]} />
          <meshBasicMaterial color={stripe.color} transparent opacity={0.045} depthWrite={false} />
        </mesh>
      ))}

      {/* Ashblock gate framing the fight like the approved combat vision. */}
      <group position={[0, 0, -12]}>
        <mesh position={[0, 6.5, 0]} castShadow>
          <boxGeometry args={[13, 1.3, 1.2]} />
          <meshStandardMaterial color="#16151a" metalness={0.72} roughness={0.42} />
        </mesh>
        {[-6.2, 6.2].map((x) => (
          <mesh key={x} position={[x, 3.1, 0]} castShadow>
            <boxGeometry args={[1.2, 6.2, 1.2]} />
            <meshStandardMaterial color="#121116" metalness={0.68} roughness={0.48} />
          </mesh>
        ))}
        <mesh position={[0, 6.5, 0.66]}>
          <planeGeometry args={[7.8, 2.1]} />
          <meshBasicMaterial map={ashblockSign} transparent />
        </mesh>
      </group>

      {buildings.map((b, index) => (
        <group key={index} position={[b.x, b.h / 2, b.z]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[b.w, b.h, b.d]} />
            <meshStandardMaterial
              color={index % 2 ? '#151720' : '#11131a'}
              metalness={0.36}
              roughness={0.72}
            />
          </mesh>
          {[1.5, 4.2, 7.2].map((y, wi) => (
            <mesh key={wi} position={[0, -b.h / 2 + y + 4, b.d / 2 + 0.03]}>
              <planeGeometry args={[b.w * 0.64, 0.45]} />
              <meshBasicMaterial
                color={index % 3 === 0 ? '#9d4edd' : index % 3 === 1 ? '#d86535' : '#55b7ff'}
                transparent
                opacity={0.24}
              />
            </mesh>
          ))}
        </group>
      ))}

      <mesh position={[-10.8, 7.2, -8.4]} rotation={[0, 0.35, 0]}>
        <planeGeometry args={[5.5, 1.8]} />
        <meshBasicMaterial map={fangSign} transparent />
      </mesh>
      <mesh position={[10.7, 6.4, -9.5]} rotation={[0, -0.4, 0]}>
        <planeGeometry args={[5.5, 1.8]} />
        <meshBasicMaterial map={fangSign} transparent />
      </mesh>

      {/* Lantern / neon pools create the orange-purple-blue rhythm from the vision. */}
      {[
        [-8.5, 3.5, -4.5, '#d86535'],
        [8.5, 3.5, -4.5, '#d86535'],
        [-5, 4.5, -10, '#9d4edd'],
        [5, 4.5, -10, '#55b7ff'],
      ].map(([x, y, z, color], index) => (
        <group key={index} position={[x as number, 0, z as number]}>
          <mesh position={[0, (y as number) / 2, 0]}>
            <cylinderGeometry args={[0.08, 0.12, y as number, 8]} />
            <meshStandardMaterial color="#17151a" metalness={0.75} roughness={0.35} />
          </mesh>
          <mesh position={[0, y as number, 0]}>
            <boxGeometry args={[0.55, 0.85, 0.55]} />
            <meshBasicMaterial color={color as string} transparent opacity={0.8} />
          </mesh>
          <pointLight position={[0, y as number, 0.2]} intensity={2.2} color={color as string} distance={9} />
        </group>
      ))}

      {/* True gameplay walls stay visible but integrated into the street. */}
      {[-10, 10].map((x) => (
        <mesh key={x} position={[x, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.12, 15.5]} />
          <meshBasicMaterial color="#c69b55" transparent opacity={0.2} />
        </mesh>
      ))}

      <Sparkles count={58} scale={[28, 12, 20]} size={1.4} speed={0.12} color="#b781ff" opacity={0.16} />
      <pointLight position={[0, 5, 3]} intensity={1.1} color="#f1c67c" distance={18} />
      <pointLight position={[0, 7, -9]} intensity={1.35} color="#9d4edd" distance={24} />
      <pointLight position={[8, 4, -2]} intensity={0.8} color="#55b7ff" distance={14} />
    </group>
  );
}

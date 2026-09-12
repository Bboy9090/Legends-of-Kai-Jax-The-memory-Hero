/**
 * ASHBLOCK HEIGHTS ENVIRONMENT
 * Phase 5.5 environmental polish with urban decay aesthetics.
 *
 * Features:
 * - Dynamic skybox with fading Fang Syndicate architecture
 * - Cracked industrial flooring with graffiti territory marks
 * - Neon-lit structural elements and broken signage
 * - Contact shadows and volumetric ambient effects
 * - Environmental props positioned for arena-like encounter staging
 * - Performance-optimized for mobile (iOS/Android)
 */

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface AshblockHeightsEnvironmentProps {
  stage: 'traversal' | 'encounter' | 'memory-trace' | 'extraction' | 'complete';
}

// Color palette: purples, bone greys, blood orange accents
const ASHBLOCK_PALETTE = {
  skyDeep: '#0a0e1a',
  skyFade: '#2d1b4e',
  skyAccent: '#5a2d5a',
  boneGrey: '#c9c5c1',
  darkGrey: '#3a3a3a',
  charcoal: '#1a1a1a',
  bloodOrange: '#c74f16',
  neonPurple: '#c77dff',
  neonViolet: '#7209b7',
  dustGrey: '#8b8680',
};

/**
 * Procedural skybox with Fang district architecture silhouettes
 * Creates urban decay aesthetic with purples and bone greys
 */
function AshblockSkybox() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const skyboxTexture = useMemo(() => {
    if (!canvasRef.current) {
      const canvas = document.createElement('canvas');
      canvasRef.current = canvas;
    }

    const canvas = canvasRef.current;
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    // Gradient sky background: deep purple fading to bone grey
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, ASHBLOCK_PALETTE.skyDeep);
    gradient.addColorStop(0.3, ASHBLOCK_PALETTE.skyFade);
    gradient.addColorStop(0.7, ASHBLOCK_PALETTE.skyAccent);
    gradient.addColorStop(1, ASHBLOCK_PALETTE.boneGrey);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw faded Fang Syndicate architecture silhouettes
    ctx.fillStyle = 'rgba(30, 15, 50, 0.4)';
    ctx.globalAlpha = 0.25;

    // Skyscraper silhouettes with irregular tops (decay aesthetic)
    const buildings = [
      { x: 100, y: 400, w: 150, h: 600 },
      { x: 300, y: 350, w: 120, h: 650 },
      { x: 500, y: 420, w: 180, h: 580 },
      { x: 750, y: 380, w: 140, h: 620 },
      { x: 900, y: 450, w: 110, h: 550 },
    ];

    buildings.forEach((building) => {
      ctx.fillRect(building.x, building.y, building.w, building.h);

      // Crumbled/broken tops
      ctx.beginPath();
      ctx.moveTo(building.x + building.w * 0.2, building.y);
      ctx.lineTo(building.x + building.w * 0.5, building.y - 30);
      ctx.lineTo(building.x + building.w * 0.8, building.y - 10);
      ctx.lineTo(building.x + building.w, building.y);
      ctx.fill();
    });

    // Window grid pattern in buildings (fading Fang territory)
    ctx.strokeStyle = 'rgba(100, 60, 120, 0.15)';
    ctx.lineWidth = 1;
    buildings.forEach((building) => {
      for (let i = 0; i < building.h; i += 30) {
        ctx.beginPath();
        ctx.moveTo(building.x, building.y + i);
        ctx.lineTo(building.x + building.w, building.y + i);
        ctx.stroke();
      }

      for (let i = 0; i < building.w; i += 25) {
        ctx.beginPath();
        ctx.moveTo(building.x + i, building.y);
        ctx.lineTo(building.x + i, building.y + building.h);
        ctx.stroke();
      }
    });

    // Distant haze/fog effect for depth
    ctx.fillStyle = 'rgba(200, 197, 193, 0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;
    return texture;
  }, []);

  if (!skyboxTexture) return null;

  return (
    <mesh scale={200}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial map={skyboxTexture} side={THREE.BackSide} />
    </mesh>
  );
}

/**
 * Cracked industrial ground with graffiti territory marks
 * Using procedural texturing for mobile performance
 */
function CrackedIndustrialGround() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const groundTexture = useMemo(() => {
    if (!canvasRef.current) {
      const canvas = document.createElement('canvas');
      canvasRef.current = canvas;
    }

    const canvas = canvasRef.current;
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    // Base industrial floor color
    ctx.fillStyle = ASHBLOCK_PALETTE.darkGrey;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Noise/grime texture
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 60;
      data[i] = 58 + noise;
      data[i + 1] = 58 + noise;
      data[i + 2] = 58 + noise;
      data[i + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);

    // Cracks pattern (procedural lines)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.lineWidth = 2;

    // Horizontal stress fractures
    for (let i = 0; i < 5; i++) {
      const y = (canvas.height / 5) * i + Math.random() * 40;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x < canvas.width; x += 50) {
        ctx.lineTo(x, y + (Math.random() - 0.5) * 15);
      }
      ctx.stroke();
    }

    // Vertical fractures
    for (let i = 0; i < 4; i++) {
      const x = (canvas.width / 4) * i + Math.random() * 30;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      for (let y = 0; y < canvas.height; y += 50) {
        ctx.lineTo(x + (Math.random() - 0.5) * 15, y);
      }
      ctx.stroke();
    }

    // Fang graffiti marks (territorial symbols in blood orange)
    ctx.strokeStyle = ASHBLOCK_PALETTE.bloodOrange;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.7;

    // Fang symbol (abstract angular mark)
    const fangMarks = [
      { x: 100, y: 100 },
      { x: 400, y: 150 },
      { x: 300, y: 350 },
      { x: 450, y: 450 },
    ];

    fangMarks.forEach((mark) => {
      // Angular Fang territorial mark
      ctx.beginPath();
      ctx.moveTo(mark.x, mark.y - 20);
      ctx.lineTo(mark.x + 15, mark.y);
      ctx.lineTo(mark.x, mark.y + 20);
      ctx.lineTo(mark.x - 15, mark.y);
      ctx.closePath();
      ctx.stroke();

      // Additional marks around it
      ctx.beginPath();
      ctx.moveTo(mark.x - 25, mark.y);
      ctx.lineTo(mark.x - 10, mark.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(mark.x + 10, mark.y);
      ctx.lineTo(mark.x + 25, mark.y);
      ctx.stroke();
    });

    ctx.globalAlpha = 1;

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 8);
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    return texture;
  }, []);

  if (!groundTexture) return null;

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.01, 20]}
      receiveShadow
      userData={{ isGround: true, isWalkable: true }}
    >
      <planeGeometry args={[44, 100]} />
      <meshStandardMaterial
        map={groundTexture}
        color={ASHBLOCK_PALETTE.darkGrey}
        roughness={0.95}
        metalness={0.05}
      />
    </mesh>
  );
}

/**
 * Neon-lit structural elements and broken signage
 * Creates atmospheric arena-like encounter staging zones
 */
function NeonEnvironmentalProps({ stage }: { stage: string }) {
  // Damaged neon signs (encounter arena markers)
  const neonStructures = [
    // Left side neon pillar (purple glow)
    { position: [-12, 3, 0], color: ASHBLOCK_PALETTE.neonPurple, intensity: 0.8 },
    // Right side neon pillar (violet glow)
    { position: [12, 3, 5], color: ASHBLOCK_PALETTE.neonViolet, intensity: 0.7 },
    // Back barrier neon (purple)
    { position: [0, 2.5, 15], color: ASHBLOCK_PALETTE.neonPurple, intensity: 0.6 },
  ];

  return (
    <group>
      {/* Crumbled concrete/metal barriers for arena staging */}
      {[
        { x: -10, z: 3, w: 8, h: 2 },
        { x: 10, z: 3, w: 8, h: 2 },
        { x: 0, z: 12, w: 20, h: 1.5 },
      ].map((barrier, idx) => (
        <mesh
          key={`ashblock-barrier-${idx}`}
          position={[barrier.x, 0.8, barrier.z]}
          castShadow
          receiveShadow
          userData={{ isCollider: true }}
        >
          <boxGeometry args={[barrier.w, barrier.h, 0.8]} />
          <meshStandardMaterial
            color={ASHBLOCK_PALETTE.charcoal}
            roughness={0.85}
            metalness={0.15}
          />
        </mesh>
      ))}

      {/* Neon structural pillars with glowing emissive material */}
      {neonStructures.map((neon, idx) => (
        <group key={`neon-structure-${idx}`} position={neon.position as [number, number, number]}>
          {/* Main pillar */}
          <mesh castShadow>
            <boxGeometry args={[0.5, 4, 0.5]} />
            <meshStandardMaterial
              color={neon.color}
              emissive={neon.color}
              emissiveIntensity={0.4}
              roughness={0.3}
              metalness={0.7}
            />
          </mesh>

          {/* Glow effect via point light */}
          <pointLight
            intensity={neon.intensity * (stage === 'encounter' ? 1.3 : 1.0)}
            color={neon.color}
            distance={15}
            decay={1.5}
          />
        </group>
      ))}

      {/* Broken signage frames (rusted steel, no text to keep it generic) */}
      {[
        { x: -8, y: 4.5, z: -10 },
        { x: 8, y: 4.5, z: 8 },
      ].map((sign, idx) => (
        <mesh
          key={`ashblock-sign-frame-${idx}`}
          position={[sign.x, sign.y, sign.z]}
          castShadow
          userData={{ isCollider: true }}
        >
          <boxGeometry args={[3, 0.3, 0.2]} />
          <meshStandardMaterial
            color={ASHBLOCK_PALETTE.dustGrey}
            roughness={0.8}
            metalness={0.4}
          />
        </mesh>
      ))}

      {/* Rusted chain hanging element (visual interest) */}
      {[0, 3, 6].map((z) => (
        <mesh key={`ashblock-chain-${z}`} position={[0, 5, -10 + z]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 2, 6]} />
          <meshStandardMaterial
            color="#663333"
            roughness={0.9}
            metalness={0.5}
          />
        </mesh>
      ))}

      {/* Contact shadow planes (visual grounding for combat staging) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 2]}>
        <planeGeometry args={[30, 8]} />
        <shadowMaterial transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

/**
 * Volumetric ambient effects and atmospheric haze
 * Creates industrial air quality ambiance
 */
function AshblockVolumetricFog({ stage }: { stage: string }) {
  const fogRef = useRef<THREE.Points>(null);
  const particleCount = 100;

  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 1] = 1 + Math.random() * 4;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (!fogRef.current) return;

    const elapsed = clock.getElapsedTime();
    const positionAttribute = fogRef.current.geometry.attributes.position;
    const pos = positionAttribute.array as Float32Array;

    // Slow drift for atmosphere
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] += Math.sin(elapsed * 0.5 + i) * 0.01;
      pos[i * 3 + 2] += Math.sin(elapsed * 0.3 + i * 2) * 0.005;
    }

    positionAttribute.needsUpdate = true;
  });

  return (
    <points ref={fogRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.8}
        color={ASHBLOCK_PALETTE.dustGrey}
        transparent
        opacity={stage === 'encounter' ? 0.15 : 0.08}
        sizeAttenuation
        fog={true}
        depthWrite={false}
      />
    </points>
  );
}

/**
 * Main Ashblock Heights Environment Component
 */
export function AshblockHeightsEnvironment({ stage }: AshblockHeightsEnvironmentProps) {
  const { scene } = useThree();

  // Configure scene for Ashblock aesthetic
  const fogColor = ASHBLOCK_PALETTE.skyAccent;
  if (!scene.fog || !(scene.fog instanceof THREE.Fog)) {
    scene.fog = new THREE.Fog(fogColor, 60, 160);
  }

  return (
    <group>
      {/* Skybox with Fang district architecture */}
      <AshblockSkybox />

      {/* Industrial ground with graffiti */}
      <CrackedIndustrialGround />

      {/* Neon lighting and structural elements */}
      <NeonEnvironmentalProps stage={stage} />

      {/* Volumetric atmospheric effects */}
      <AshblockVolumetricFog stage={stage} />
    </group>
  );
}

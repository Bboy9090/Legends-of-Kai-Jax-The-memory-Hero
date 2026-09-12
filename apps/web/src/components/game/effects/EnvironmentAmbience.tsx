import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { audioSystem } from '../../../systems/AudioSystem';

type MissionStage = 'traversal' | 'encounter' | 'memory-trace' | 'extraction' | 'complete';

interface EnvironmentAmbienceProps {
  stage: MissionStage;
  fangBehavior?: string;
  playerHealth: number;
}

// Ashblock Heights specific lighting palette (urban decay, neon-lit)
const ASHBLOCK_LIGHTING = {
  traversal: {
    ambient: '#5a4a6a',
    directional: '#7a6a8a',
    neon: { color: '#c77dff', intensity: 0.4 },
  },
  encounter: {
    ambient: '#6a4a7a',
    directional: '#8a6a9a',
    neon: { color: '#ff4466', intensity: 0.8 },
  },
  'memory-trace': {
    ambient: '#5a5a7a',
    directional: '#7a7a9a',
    neon: { color: '#a78bfa', intensity: 0.6 },
  },
  extraction: {
    ambient: '#5a6a7a',
    directional: '#7a8a9a',
    neon: { color: '#22c55e', intensity: 0.7 },
  },
  complete: {
    ambient: '#6a7a8a',
    directional: '#8a9aaa',
    neon: { color: '#fbbf24', intensity: 0.5 },
  },
};

function getAmbientColorForStage(stage: MissionStage): { ambient: THREE.ColorRepresentation; directional: THREE.ColorRepresentation } {
  const ashblock = ASHBLOCK_LIGHTING[stage];
  if (ashblock) {
    return { ambient: ashblock.ambient, directional: ashblock.directional };
  }

  // Fallback to original palette
  switch (stage) {
    case 'traversal':
      return { ambient: '#dbeafe', directional: '#f8fafc' };
    case 'encounter':
      return { ambient: '#f5d4d1', directional: '#ffe8e3' };
    case 'memory-trace':
      return { ambient: '#e9d5ff', directional: '#f3e8ff' };
    case 'extraction':
      return { ambient: '#dcfce7', directional: '#f0fdf4' };
    case 'complete':
      return { ambient: '#fef08a', directional: '#fef3c7' };
    default:
      return { ambient: '#dbeafe', directional: '#f8fafc' };
  }
}

export function EnvironmentAmbience({ stage, fangBehavior, playerHealth }: EnvironmentAmbienceProps) {
  const ambientRef = useRef<THREE.Light>(null);
  const directionalRef = useRef<THREE.Light>(null);
  const neonLeftRef = useRef<THREE.Light>(null);
  const neonRightRef = useRef<THREE.Light>(null);
  const { camera } = useThree();
  const cameraShakeRef = useRef({ intensity: 0 });
  const ambientAudioRef = useRef({ id: '', elapsed: 0 });

  const targetColors = useMemo(() => getAmbientColorForStage(stage), [stage]);
  const ashblockLighting = useMemo(() => ASHBLOCK_LIGHTING[stage], [stage]);

  useFrame(({ clock }, rawDelta) => {
    const elapsed = clock.getElapsedTime();
    const delta = Math.min(rawDelta, 0.05);

    // Update ambient audio effects
    ambientAudioRef.current.elapsed += delta;
    if (ambientAudioRef.current.elapsed > 3 && stage === 'encounter') {
      audioSystem.playAmbientIndustrial();
      ambientAudioRef.current.elapsed = 0;
    }

    if (ambientRef.current) {
      const light = ambientRef.current as THREE.Light;
      if ('intensity' in light) {
        const baseIntensity = stage === 'encounter' ? 0.55 : 0.45;
        const pulse = stage === 'encounter' ? 0.08 * Math.sin(elapsed * 1.5) : 0;
        const danger = playerHealth < 30 && stage === 'encounter' ? 0.1 * Math.sin(elapsed * 3) : 0;
        light.intensity = baseIntensity + pulse + danger;
      }
    }

    if (directionalRef.current) {
      const light = directionalRef.current as THREE.Light;
      if ('intensity' in light) {
        const baseIntensity = stage === 'encounter' ? 0.8 : 0.6;
        const fangPulse = fangBehavior === 'WINDUP' ? 0.15 * Math.sin(elapsed * 4) : 0;
        light.intensity = baseIntensity + fangPulse;
      }
    }

    // Ashblock neon light flickering effects
    if (ashblockLighting) {
      if (neonLeftRef.current && 'intensity' in neonLeftRef.current) {
        const baseNeon = ashblockLighting.neon.intensity;
        const flicker = (Math.sin(elapsed * 2.5) + Math.sin(elapsed * 3.7)) * 0.05;
        neonLeftRef.current.intensity = Math.max(0, baseNeon + flicker);
      }

      if (neonRightRef.current && 'intensity' in neonRightRef.current) {
        const baseNeon = ashblockLighting.neon.intensity;
        const flicker = (Math.sin(elapsed * 2.1) + Math.sin(elapsed * 3.3)) * 0.05;
        neonRightRef.current.intensity = Math.max(0, baseNeon + flicker);
      }
    }

    if (cameraShakeRef.current.intensity > 0) {
      const shakeX = (Math.random() - 0.5) * cameraShakeRef.current.intensity * 0.02;
      const shakeY = (Math.random() - 0.5) * cameraShakeRef.current.intensity * 0.02;
      camera.position.x += shakeX;
      camera.position.y += shakeY;
      cameraShakeRef.current.intensity *= 0.95;
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.45} color={targetColors.ambient} />
      <directionalLight
        ref={directionalRef}
        position={[12, 24, -8]}
        intensity={0.6}
        color={targetColors.directional}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={200}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      <hemisphereLight args={['#334155', '#050505', 0.35]} />

      {/* Ashblock Heights neon lighting */}
      {ashblockLighting && (
        <>
          {/* Left neon pillar glow */}
          <pointLight
            ref={neonLeftRef}
            position={[-12, 3, 0]}
            intensity={ashblockLighting.neon.intensity}
            color={ashblockLighting.neon.color}
            distance={18}
            decay={1.8}
            castShadow
          />
          {/* Right neon pillar glow */}
          <pointLight
            ref={neonRightRef}
            position={[12, 3, 5]}
            intensity={ashblockLighting.neon.intensity}
            color={ashblockLighting.neon.color}
            distance={18}
            decay={1.8}
            castShadow
          />
          {/* Back barrier accent */}
          <pointLight
            position={[0, 2.5, 15]}
            intensity={ashblockLighting.neon.intensity * 0.6}
            color={ashblockLighting.neon.color}
            distance={15}
            decay={2}
          />
        </>
      )}

      {/* Stage-specific accent lighting */}
      {stage === 'encounter' && (
        <pointLight position={[0, 2, 2]} intensity={0.4} color="#ff6b6b" castShadow distance={12} decay={2} />
      )}

      {stage === 'memory-trace' && (
        <pointLight position={[0, 2, 5]} intensity={0.5} color="#a78bfa" castShadow distance={10} decay={2} />
      )}

      {stage === 'extraction' && (
        <pointLight position={[0, 1.5, 17]} intensity={0.6} color="#22c55e" castShadow distance={15} decay={2} />
      )}
    </>
  );
}

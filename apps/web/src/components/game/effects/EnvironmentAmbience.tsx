import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

type MissionStage = 'traversal' | 'encounter' | 'memory-trace' | 'extraction' | 'complete';

interface EnvironmentAmbienceProps {
  stage: MissionStage;
  fangBehavior?: string;
  playerHealth: number;
}

function getAmbientColorForStage(stage: MissionStage): { ambient: THREE.ColorRepresentation; directional: THREE.ColorRepresentation } {
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
  const { camera } = useThree();
  const cameraShakeRef = useRef({ intensity: 0 });

  const targetColors = useMemo(() => getAmbientColorForStage(stage), [stage]);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();

    if (ambientRef.current) {
      const light = ambientRef.current as THREE.Light;
      if ('intensity' in light) {
        const baseIntensity = stage === 'encounter' ? 0.65 : 0.55;
        const pulse = stage === 'encounter' ? 0.1 * Math.sin(elapsed * 1.5) : 0;
        const danger = playerHealth < 30 && stage === 'encounter' ? 0.1 * Math.sin(elapsed * 3) : 0;
        light.intensity = baseIntensity + pulse + danger;
      }
    }

    if (directionalRef.current) {
      const light = directionalRef.current as THREE.Light;
      if ('intensity' in light) {
        const baseIntensity = stage === 'encounter' ? 1.15 : 1.0;
        const fangPulse = fangBehavior === 'WINDUP' ? 0.2 * Math.sin(elapsed * 4) : 0;
        light.intensity = baseIntensity + fangPulse;
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
      <ambientLight ref={ambientRef} intensity={0.55} color={targetColors.ambient} />
      <directionalLight
        ref={directionalRef}
        position={[12, 24, -8]}
        intensity={1.0}
        color={targetColors.directional}
        castShadow
      />
      <hemisphereLight args={['#334155', '#050505', 0.45]} />

      {stage === 'encounter' && (
        <pointLight position={[0, 2, 2]} intensity={0.3} color="#ff6b6b" castShadow distance={10} decay={2} />
      )}

      {stage === 'memory-trace' && (
        <pointLight position={[0, 2, 5]} intensity={0.4} color="#a78bfa" castShadow distance={8} decay={2} />
      )}

      {stage === 'extraction' && (
        <pointLight position={[0, 1.5, 17]} intensity={0.5} color="#22c55e" castShadow distance={12} decay={2} />
      )}
    </>
  );
}

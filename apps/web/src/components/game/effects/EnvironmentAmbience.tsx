import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type MissionStage = 'traversal' | 'encounter' | 'memory-trace' | 'extraction' | 'complete';

interface EnvironmentAmbienceProps {
  stage: MissionStage;
  fangBehavior?: string;
  playerHealth: number;
}

function getAmbientColorForStage(stage: MissionStage): {
  ambient: THREE.ColorRepresentation;
  directional: THREE.ColorRepresentation;
  hemisphere: THREE.ColorRepresentation;
} {
  switch (stage) {
    case 'traversal':
      return { ambient: '#9aa9bd', directional: '#f0b66f', hemisphere: '#35445c' };
    case 'encounter':
      return { ambient: '#9a777e', directional: '#f08a63', hemisphere: '#402f46' };
    case 'memory-trace':
      return { ambient: '#8d7ab1', directional: '#d8c8ff', hemisphere: '#342d56' };
    case 'extraction':
      return { ambient: '#779a91', directional: '#bce6d6', hemisphere: '#2f4e50' };
    case 'complete':
      return { ambient: '#9e936c', directional: '#f4d794', hemisphere: '#4a4537' };
    default:
      return { ambient: '#9aa9bd', directional: '#f0b66f', hemisphere: '#35445c' };
  }
}

export function EnvironmentAmbience({ stage, fangBehavior, playerHealth }: EnvironmentAmbienceProps) {
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const directionalRef = useRef<THREE.DirectionalLight>(null);
  const targetColors = useMemo(() => getAmbientColorForStage(stage), [stage]);

  useFrame(({ clock }) => {
    const elapsed = clock.elapsedTime;

    if (ambientRef.current) {
      const encounterPulse = stage === 'encounter' ? 0.05 * Math.sin(elapsed * 1.5) : 0;
      const dangerPulse = playerHealth < 30 && stage === 'encounter'
        ? 0.04 * Math.sin(elapsed * 3)
        : 0;
      ambientRef.current.intensity = 0.5 + encounterPulse + dangerPulse;
    }

    if (directionalRef.current) {
      const windupPulse = fangBehavior === 'WINDUP' ? 0.1 * Math.sin(elapsed * 4) : 0;
      directionalRef.current.intensity = (stage === 'encounter' ? 1.0 : 0.9) + windupPulse;
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.5} color={targetColors.ambient} />
      <directionalLight
        ref={directionalRef}
        position={[12, 24, -8]}
        intensity={0.9}
        color={targetColors.directional}
        castShadow
      />
      <hemisphereLight args={[targetColors.hemisphere, '#09090b', 0.42]} />
    </>
  );
}

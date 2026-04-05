/**
 * OMEGA PROTOCOL: ENHANCED BATTLE SCENE
 * 
 * Integrates all Omega Protocol systems:
 * - Trinity Meter System (Synergy/Resonance/Dread)
 * - Hit-Stop & Camera Shake
 * - Post-FX Pipeline
 * - Frame Timeline Debug Overlay
 * - Boss AI with phase transitions
 * - Arena destruction
 * 
 * "If it doesn't feel like a Masterpiece in the first 30 seconds of play, it is a failure."
 */

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette, ChromaticAberration, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import TrinityMeterHUD from './TrinityMeterHUD';
import FrameTimelineDebug from './FrameTimelineDebug';

// Types
interface TrinityState {
  synergy: number;
  resonance: number;
  dread: number;
}

interface HitStopState {
  active: boolean;
  remaining: number;
  intensity: number;
}

interface ShakeState {
  amplitude: number;
  offset: { x: number; y: number };
}

interface CombatPhaseData {
  phase: 'idle' | 'startup' | 'active' | 'recovery' | 'hitstun' | 'blockstun';
  framesRemaining: number;
  totalFrames: number;
  currentMove?: string;
}

interface OmegaBattleSceneProps {
  // Combat state
  playerTrinity: TrinityState;
  enemyTrinity: TrinityState;
  hitStop: HitStopState;
  shake: ShakeState;
  
  // Combat phases for debug overlay
  playerPhase: CombatPhaseData;
  enemyPhase: CombatPhaseData;
  
  // Debug mode
  debugMode?: boolean;
  
  // Callbacks
  onTrinityUpdate?: (playerId: string, event: string) => void;
  onPhaseBreak?: () => void;
}

/**
 * Camera controller with Omega Protocol shake and hit-stop
 */
function OmegaCameraController({
  hitStop,
  shake,
  playerPosition,
}: {
  hitStop: HitStopState;
  shake: ShakeState;
  playerPosition: { x: number; y: number; z: number };
}) {
  const { camera } = useThree();
  const basePosition = useRef({ x: 0, y: 12, z: 20 });
  const shakePhase = useRef(0);
  
  useFrame((state, delta) => {
    // Don't update camera position during hit-stop (but still render)
    if (hitStop.active) {
      // Apply hit-stop visual indicator (subtle zoom)
      const hitStopZoom = 1 + hitStop.intensity * 0.05;
      camera.zoom = hitStopZoom;
      (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
      return;
    }
    
    // Reset zoom
    camera.zoom = 1;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    
    // Smooth camera follow
    const targetX = playerPosition.x * 0.3;
    const targetZ = playerPosition.z * 0.2 + basePosition.current.z;
    
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.z += (targetZ - camera.position.z) * 0.05;
    
    // Apply shake
    if (shake.amplitude > 0) {
      shakePhase.current += delta * 50;
      camera.position.x += shake.offset.x;
      camera.position.y = basePosition.current.y + shake.offset.y;
    } else {
      camera.position.y = basePosition.current.y;
    }
    
    // Look at center
    camera.lookAt(playerPosition.x * 0.5, 2, playerPosition.z * 0.3);
  });
  
  return null;
}

/**
 * Trinity-driven post-processing effects
 */
function OmegaPostFX({
  trinity,
  hitStop,
}: {
  trinity: TrinityState;
  hitStop: HitStopState;
}) {
  const normalizedDread = trinity.dread / 100;
  const normalizedResonance = trinity.resonance / 100;
  const normalizedSynergy = trinity.synergy / 100;
  
  // Calculate effect intensities
  const bloomIntensity = 0.6 + (normalizedSynergy + normalizedResonance) * 0.4;
  const vignetteIntensity = 0.3 + normalizedDread * 0.3;
  const chromaticIntensity = hitStop.active 
    ? 0.01 
    : (normalizedDread * 0.003 + normalizedResonance * 0.001);
  
  // Desaturation during hit-stop (Omega Protocol: 0.08s freeze with desaturation)
  const noiseIntensity = hitStop.active ? 0.1 : 0;
  
  return (
    <EffectComposer>
      <Bloom 
        intensity={bloomIntensity} 
        luminanceThreshold={0.5} 
        luminanceSmoothing={0.7} 
        mipmapBlur 
      />
      <Vignette 
        eskil={false} 
        offset={0.1} 
        darkness={vignetteIntensity}
      />
      {chromaticIntensity > 0.0005 && (
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={new THREE.Vector2(chromaticIntensity, chromaticIntensity)}
        />
      )}
      {noiseIntensity > 0 && (
        <Noise
          opacity={noiseIntensity}
          blendFunction={BlendFunction.OVERLAY}
        />
      )}
    </EffectComposer>
  );
}

/**
 * Legendary Blow effect (shockwave)
 */
function LegendaryBlowEffect({
  position,
  active,
  intensity,
}: {
  position: [number, number, number];
  active: boolean;
  intensity: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [scale, setScale] = useState(0);
  const [opacity, setOpacity] = useState(0);
  
  useFrame((state, delta) => {
    if (active && scale < 10) {
      setScale(prev => prev + delta * 20 * intensity);
      setOpacity(Math.max(0, 0.8 - scale * 0.08));
    } else if (!active) {
      setScale(0);
      setOpacity(0);
    }
  });
  
  if (!active && scale === 0) return null;
  
  return (
    <group position={position}>
      {/* Shockwave ring */}
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[scale * 0.9, scale, 32]} />
        <meshBasicMaterial 
          color="#FFD700"
          transparent
          opacity={opacity}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Inner flash */}
      <mesh scale={[scale * 0.5, scale * 0.5, scale * 0.5]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial 
          color="#FFFFFF"
          transparent
          opacity={opacity * 0.5}
        />
      </mesh>
    </group>
  );
}

/**
 * Arena with destruction states
 */
function OmegaArena({
  destructionLevel,
  activePinZones,
}: {
  destructionLevel: number;
  activePinZones: Array<{ position: { x: number; z: number }; radius: number; strength: number }>;
}) {
  const arenaColor = useMemo(() => {
    // Darken arena as destruction increases
    const base = 0.04 + (1 - destructionLevel / 100) * 0.06;
    return new THREE.Color(base, base, base + 0.02);
  }, [destructionLevel]);
  
  return (
    <group>
      {/* Main floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial 
          color={arenaColor} 
          metalness={0.5} 
          roughness={0.4} 
        />
      </mesh>
      
      {/* Arena ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.48, 0]}>
        <ringGeometry args={[14, 15, 64]} />
        <meshStandardMaterial 
          color="#1a1a2e" 
          emissive="#4ecdc4" 
          emissiveIntensity={0.1}
          metalness={0.6} 
          roughness={0.3} 
        />
      </mesh>
      
      {/* Reality Pin Zones */}
      {activePinZones.map((zone, i) => (
        <group key={i} position={[zone.position.x, 0.01, zone.position.z]}>
          {/* Pin zone indicator */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[zone.radius, 32]} />
            <meshBasicMaterial 
              color="#F6C177" // Boryx color
              transparent
              opacity={0.15 + zone.strength * 0.2}
            />
          </mesh>
          
          {/* Pin zone border */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[zone.radius - 0.1, zone.radius, 32]} />
            <meshBasicMaterial 
              color="#F6C177"
              transparent
              opacity={0.6}
            />
          </mesh>
        </group>
      ))}
      
      {/* Destruction cracks (visual indicator) */}
      {destructionLevel > 20 && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.47, 0]}>
          <planeGeometry args={[30 * (destructionLevel / 100), 0.1]} />
          <meshBasicMaterial color="#2a2a3a" />
        </mesh>
      )}
    </group>
  );
}

/**
 * Main Omega Battle Scene component
 */
export default function OmegaBattleScene({
  playerTrinity,
  enemyTrinity,
  hitStop,
  shake,
  playerPhase,
  enemyPhase,
  debugMode = false,
  onTrinityUpdate,
  onPhaseBreak,
}: OmegaBattleSceneProps) {
  const [legendaryBlowActive, setLegendaryBlowActive] = useState(false);
  const [legendaryBlowPosition, setLegendaryBlowPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [arenaDestruction, setArenaDestruction] = useState(0);
  const [pinZones, setPinZones] = useState<Array<{ position: { x: number; z: number }; radius: number; strength: number }>>([]);
  const [narrativeLog, setNarrativeLog] = useState<string[]>([]);
  
  // Player position (would come from physics/movement system)
  const playerPosition = useRef({ x: 0, y: 0, z: 0 });
  
  // Handle legendary blow trigger
  const triggerLegendaryBlow = useCallback((position: [number, number, number], damage: number) => {
    if (damage >= 30) {
      setLegendaryBlowActive(true);
      setLegendaryBlowPosition(position);
      
      // Add narrative log for major events
      if (damage >= 50) {
        setNarrativeLog(prev => [...prev.slice(-2), 'A truth fails to persist.']);
      }
      
      setTimeout(() => setLegendaryBlowActive(false), 300);
      
      // Increase arena destruction
      setArenaDestruction(prev => Math.min(100, prev + damage * 0.2));
    }
  }, []);
  
  // Handle phase break
  useEffect(() => {
    if (playerTrinity.dread >= 80 || enemyTrinity.dread >= 80) {
      onPhaseBreak?.();
      setNarrativeLog(prev => [...prev.slice(-2), 'The Archive trembles.']);
    }
  }, [playerTrinity.dread, enemyTrinity.dread, onPhaseBreak]);
  
  // Handle parry narrative
  const handleParry = useCallback(() => {
    setNarrativeLog(prev => [...prev.slice(-2), 'A future collapses.']);
  }, []);
  
  // Prepare debug overlay data
  const debugEntities = useMemo(() => [
    {
      id: 'player',
      name: 'PLAYER',
      phase: playerPhase.phase,
      framesRemaining: playerPhase.framesRemaining,
      totalFrames: playerPhase.totalFrames,
      currentMove: playerPhase.currentMove,
      cancelFlags: [],
      iFrames: 0,
      armorFrames: 0,
      hitStopActive: hitStop.active,
      hitStopRemaining: hitStop.remaining,
      comboCount: 0,
      damagePercent: 0,
      synergy: playerTrinity.synergy,
      resonance: playerTrinity.resonance,
      dread: playerTrinity.dread,
    },
    {
      id: 'enemy',
      name: 'ENEMY',
      phase: enemyPhase.phase,
      framesRemaining: enemyPhase.framesRemaining,
      totalFrames: enemyPhase.totalFrames,
      currentMove: enemyPhase.currentMove,
      cancelFlags: [],
      iFrames: 0,
      armorFrames: 0,
      hitStopActive: hitStop.active,
      hitStopRemaining: hitStop.remaining,
      comboCount: 0,
      damagePercent: 0,
      synergy: enemyTrinity.synergy,
      resonance: enemyTrinity.resonance,
      dread: enemyTrinity.dread,
    },
  ], [playerPhase, enemyPhase, hitStop, playerTrinity, enemyTrinity]);
  
  return (
    <>
      {/* 3D Scene Elements */}
      <group>
        {/* Omega Camera */}
        <OmegaCameraController 
          hitStop={hitStop}
          shake={shake}
          playerPosition={playerPosition.current}
        />
        
        {/* Enhanced Arena */}
        <OmegaArena 
          destructionLevel={arenaDestruction}
          activePinZones={pinZones}
        />
        
        {/* Legendary Blow Effect */}
        <LegendaryBlowEffect 
          position={legendaryBlowPosition}
          active={legendaryBlowActive}
          intensity={1.0}
        />
        
        {/* Omega Post-Processing */}
        <OmegaPostFX 
          trinity={playerTrinity}
          hitStop={hitStop}
        />
      </group>
      
      {/* HTML Overlays */}
      {/* Player Trinity HUD */}
      <TrinityMeterHUD
        synergy={playerTrinity.synergy}
        resonance={playerTrinity.resonance}
        dread={playerTrinity.dread}
        playerName="PLAYER"
        side="left"
        showNarrativeLog={true}
        narrativeLog={narrativeLog}
      />
      
      {/* Enemy Trinity HUD */}
      <TrinityMeterHUD
        synergy={enemyTrinity.synergy}
        resonance={enemyTrinity.resonance}
        dread={enemyTrinity.dread}
        playerName="ENEMY"
        side="right"
        compact={true}
      />
      
      {/* Debug Overlay */}
      {debugMode && (
        <FrameTimelineDebug 
          entities={debugEntities}
          enabled={true}
          position="bottom"
        />
      )}
    </>
  );
}

export { OmegaBattleScene, OmegaCameraController, OmegaPostFX, OmegaArena, LegendaryBlowEffect };

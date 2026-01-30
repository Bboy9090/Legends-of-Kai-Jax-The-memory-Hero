import { useState, useRef, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { KeyboardControls, useKeyboardControls, Sky, Environment } from '@react-three/drei';
import * as THREE from 'three';

import WorldNPC from './WorldNPC';
import TriggerZone from './TriggerZone';
import DialogueBox from './DialogueBox';
import HintIndicator from './HintIndicator';
import CinematicPlayer from './CinematicPlayer';
import { 
  getNPCsForArea, 
  WORLD_ENCOUNTERS, 
  type NPCDialogue, 
  type WorldEncounter 
} from '../../lib/worldDialogue';
import { getSceneByMissionId, type CinematicScene } from '../../lib/cinematicStory';
import { useCampaign } from '../../lib/stores/useCampaign';

interface PlayerControllerProps {
  onPositionChange: (position: [number, number, number]) => void;
}

function PlayerController({ onPositionChange }: PlayerControllerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const velocityRef = useRef(new THREE.Vector3());
  const positionRef = useRef(new THREE.Vector3(0, 1, 0));
  
  const [, getKeys] = useKeyboardControls();
  const { camera } = useThree();
  
  const speed = 8;
  const friction = 0.85;
  
  useFrame((_, delta) => {
    const keys = getKeys();
    const velocity = velocityRef.current;
    const position = positionRef.current;
    
    const moveDir = new THREE.Vector3();
    
    if (keys.forward) moveDir.z -= 1;
    if (keys.backward) moveDir.z += 1;
    if (keys.left) moveDir.x -= 1;
    if (keys.right) moveDir.x += 1;
    
    if (moveDir.length() > 0) {
      moveDir.normalize();
      velocity.x += moveDir.x * speed * delta;
      velocity.z += moveDir.z * speed * delta;
    }
    
    velocity.x *= friction;
    velocity.z *= friction;
    
    position.x += velocity.x;
    position.z += velocity.z;
    position.y = 1;
    
    if (groupRef.current) {
      groupRef.current.position.copy(position);
      
      if (velocity.length() > 0.01) {
        const angle = Math.atan2(velocity.x, velocity.z);
        groupRef.current.rotation.y = angle;
      }
    }
    
    camera.position.set(position.x, position.y + 8, position.z + 12);
    camera.lookAt(position.x, position.y, position.z);
    
    onPositionChange([position.x, position.y, position.z]);
  });
  
  return (
    <group ref={groupRef} position={[0, 1, 0]}>
      <mesh castShadow>
        <capsuleGeometry args={[0.4, 1.0, 8, 16]} />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 1.0, 0]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color="#ffcc88" />
      </mesh>
      <pointLight position={[0, 1.5, 0]} color="#00ffff" intensity={2} distance={8} />
    </group>
  );
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[500, 500]} />
      <meshStandardMaterial color="#1a1a2e" />
    </mesh>
  );
}

interface BuildingProps {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
}

function Building({ position, size, color }: BuildingProps) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function CityEnvironment() {
  const buildings = useMemo(() => {
    const arr: BuildingProps[] = [];
    const seed = 42;
    
    for (let i = 0; i < 40; i++) {
      const pseudoRandom = (seed * (i + 1) * 9301 + 49297) % 233280;
      const rand1 = pseudoRandom / 233280;
      const rand2 = ((pseudoRandom * 7) % 233280) / 233280;
      const rand3 = ((pseudoRandom * 13) % 233280) / 233280;
      
      const x = (rand1 - 0.5) * 200;
      const z = (rand2 - 0.5) * 200;
      const height = 5 + rand3 * 25;
      const width = 4 + rand1 * 8;
      const depth = 4 + rand2 * 8;
      
      if (Math.abs(x) > 15 || Math.abs(z) > 15) {
        arr.push({
          position: [x, height / 2, z],
          size: [width, height, depth],
          color: `hsl(${220 + rand1 * 40}, 20%, ${15 + rand2 * 15}%)`
        });
      }
    }
    
    return arr;
  }, []);
  
  return (
    <>
      {buildings.map((building, i) => (
        <Building key={i} {...building} />
      ))}
    </>
  );
}

const keyMap = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right', keys: ['ArrowRight', 'KeyD'] },
  { name: 'interact', keys: ['KeyE', 'Space'] },
];

interface ExplorationWorldProps {
  currentArea: string;
  onBack: () => void;
}

export default function ExplorationWorld({ currentArea, onBack }: ExplorationWorldProps) {
  const [playerPosition, setPlayerPosition] = useState<[number, number, number]>([0, 1, 0]);
  const [activeDialogue, setActiveDialogue] = useState<NPCDialogue | null>(null);
  const [activeCinematic, setActiveCinematic] = useState<CinematicScene | null>(null);
  const [currentHint, setCurrentHint] = useState<{ direction: string; description: string } | null>(null);
  const [triggeredEncounters, setTriggeredEncounters] = useState<string[]>([]);
  
  const { gameFlags, setGameFlag, hasFlag } = useCampaign();
  
  const npcs = useMemo(() => getNPCsForArea(currentArea), [currentArea]);
  
  const npcPositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    const seed = 12345;
    
    npcs.forEach((_, i) => {
      const pseudoRandom = (seed * (i + 1) * 9301 + 49297) % 233280;
      const rand1 = pseudoRandom / 233280;
      const rand2 = ((pseudoRandom * 7) % 233280) / 233280;
      
      const angle = rand1 * Math.PI * 2;
      const distance = 8 + rand2 * 15;
      
      positions.push([
        Math.cos(angle) * distance,
        1,
        Math.sin(angle) * distance
      ]);
    });
    
    return positions;
  }, [npcs]);
  
  const handleNPCInteract = (npc: NPCDialogue) => {
    setActiveDialogue(npc);
  };
  
  const handleDialogueComplete = () => {
    setActiveDialogue(null);
  };
  
  const handleHintReceived = (hint: { direction: string; description: string }) => {
    setCurrentHint(hint);
  };
  
  const handleEncounterTrigger = (encounter: WorldEncounter) => {
    if (triggeredEncounters.includes(encounter.id)) return;
    
    setTriggeredEncounters(prev => [...prev, encounter.id]);
    
    if (encounter.setsFlag) {
      setGameFlag(encounter.setsFlag, true);
    }
    
    if (encounter.type === 'cutscene' && encounter.cutsceneId) {
      const cinematicMissionIds: Record<string, string> = {
        'prologue_awakening': 'p0_1',
        'prologue_first_fusion': 'p0_3',
        'ch1_the_hungry_edge': 'c1_1',
        'ch2_iron_order': 'c2_1',
        'ch3_broken_bridge': 'c3_1'
      };
      
      const missionId = cinematicMissionIds[encounter.cutsceneId] || encounter.cutsceneId;
      const scene = getSceneByMissionId(missionId);
      
      if (scene) {
        setActiveCinematic(scene);
      }
    }
  };
  
  const handleCinematicComplete = () => {
    setActiveCinematic(null);
    setCurrentHint(null);
  };
  
  if (activeCinematic) {
    return (
      <CinematicPlayer
        scene={activeCinematic}
        onComplete={handleCinematicComplete}
        onSkip={handleCinematicComplete}
      />
    );
  }
  
  return (
    <div className="fixed inset-0 z-0">
      <KeyboardControls map={keyMap}>
        <Canvas
          shadows
          camera={{ position: [0, 10, 15], fov: 60 }}
          gl={{ antialias: true }}
        >
          <color attach="background" args={['#0a0a1a']} />
          
          <ambientLight intensity={0.2} />
          <directionalLight
            position={[50, 100, 50]}
            intensity={0.5}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />
          
          <fog attach="fog" args={['#0a0a1a', 50, 200]} />
          
          <Suspense fallback={null}>
            <Ground />
            <CityEnvironment />
            
            <PlayerController onPositionChange={setPlayerPosition} />
            
            {npcs.map((npc, i) => (
              <WorldNPC
                key={npc.id}
                npc={npc}
                position={npcPositions[i]}
                onInteract={handleNPCInteract}
                playerPosition={playerPosition}
              />
            ))}
            
            {WORLD_ENCOUNTERS.map(encounter => (
              <TriggerZone
                key={encounter.id}
                encounter={encounter}
                playerPosition={playerPosition}
                onTrigger={handleEncounterTrigger}
                hasFlag={hasFlag}
                isTriggered={triggeredEncounters.includes(encounter.id)}
              />
            ))}
          </Suspense>
        </Canvas>
      </KeyboardControls>
      
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-black/70 hover:bg-black/90 text-white rounded-lg border border-gray-700 transition-colors"
        >
          ← Back to Menu
        </button>
      </div>
      
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-black/70 px-6 py-2 rounded-full border border-gray-700">
          <span className="text-white font-bold">
            {currentArea === 'prologue' ? 'Home Town' : 
             currentArea === 'chapter_1' ? 'The Hungry Edge' :
             currentArea === 'chapter_2' ? 'Neon Ward' :
             currentArea === 'chapter_3' ? 'Iron Market' : 'Raging City'}
          </span>
        </div>
      </div>
      
      <div className="absolute bottom-4 left-4 z-10 bg-black/70 px-4 py-2 rounded-lg border border-gray-700">
        <p className="text-gray-400 text-xs">WASD to move • Walk up to people to talk</p>
      </div>
      
      <HintIndicator 
        hint={currentHint} 
        onDismiss={() => setCurrentHint(null)} 
      />
      
      {activeDialogue && (
        <DialogueBox
          dialogue={activeDialogue}
          onComplete={handleDialogueComplete}
          onHintReceived={handleHintReceived}
        />
      )}
    </div>
  );
}

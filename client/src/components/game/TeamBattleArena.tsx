import { Canvas } from '@react-three/fiber';
import { Suspense, useState, useRef, useMemo, useEffect } from 'react';
import { OrbitControls, Environment, Text, useTexture, KeyboardControls, useKeyboardControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getAllCharacters, Character, CharacterRole, getCharacterById } from '../../lib/roster';
import { getMissionById } from '../../lib/missions';
import { getActiveTeamBonuses } from '../../lib/teamSynergy';
import { Button } from '../ui/button';
import { Heart, Zap, Shield, Sword, Users, RotateCcw } from 'lucide-react';

interface TeamBattleArenaProps {
  missionId: string | null;
  playerTeam: string[];
  onBattleComplete: (success: boolean) => void;
  onBack: () => void;
}

const ROLE_COLORS: Record<CharacterRole, string> = {
  'Vanguard': '#ef4444',
  'Blitzer': '#3b82f6',
  'Mystic': '#a855f7',
  'Support': '#22c55e',
  'Wildcard': '#f59e0b',
  'Tank': '#6b7280',
  'Sniper': '#ec4899',
  'Controller': '#06b6d4',
};

export default function TeamBattleArena({
  missionId,
  playerTeam,
  onBattleComplete,
  onBack
}: TeamBattleArenaProps) {
  const mission = missionId ? getMissionById(missionId) : null;
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [teamHealth, setTeamHealth] = useState<number[]>(playerTeam.map(() => 100));
  const [enemyHealth, setEnemyHealth] = useState(100);
  const [comboCount, setComboCount] = useState(0);
  const [specialMeter, setSpecialMeter] = useState(0);
  const [battleTime, setBattleTime] = useState(mission?.isBoss ? 180 : 99);
  const [isPaused, setIsPaused] = useState(false);
  const [battleOver, setBattleOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [lastAction, setLastAction] = useState<string>('');
  const [objectivesComplete, setObjectivesComplete] = useState<boolean[]>(
    mission?.objectives.map(() => false) || []
  );

  const playerCharacters = useMemo(() => {
    return playerTeam.map(id => getCharacterById(id)).filter(Boolean) as Character[];
  }, [playerTeam]);

  const teamBonuses = useMemo(() => {
    return getActiveTeamBonuses(playerTeam);
  }, [playerTeam]);

  const activeCharacter = playerCharacters[activePlayerIndex];

  useEffect(() => {
    if (battleOver || isPaused) return;
    
    const timer = setInterval(() => {
      setBattleTime(prev => {
        if (prev <= 0) {
          setBattleOver(true);
          setVictory(enemyHealth <= teamHealth.reduce((a, b) => a + b, 0) / teamHealth.length);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [battleOver, isPaused, enemyHealth, teamHealth]);

  const handleTagSwitch = (index: number) => {
    if (index !== activePlayerIndex && teamHealth[index] > 0) {
      setActivePlayerIndex(index);
      setComboCount(0);
    }
  };

  const handleAttack = () => {
    if (battleOver || isPaused) return;
    
    const difficultyMult = (mission?.difficulty || 5) / 5;
    const baseDamage = 5 + Math.floor(Math.random() * 10);
    const charStats = activeCharacter?.stats.attack || 50;
    const damage = (baseDamage + charStats / 20) * (1 + difficultyMult * 0.3);
    const newEnemyHealth = Math.max(0, enemyHealth - damage);
    
    setEnemyHealth(newEnemyHealth);
    setComboCount(prev => prev + 1);
    setSpecialMeter(prev => Math.min(100, prev + 5));
    setLastAction(`${activeCharacter?.name} ATTACKED! -${Math.floor(damage)} HP`);
    
    playSound('hit');

    if (newEnemyHealth <= 0) {
      setBattleOver(true);
      setVictory(true);
      if (!mission?.isBoss) {
        setObjectivesComplete(prev => {
          const updated = [...prev];
          updated[0] = true; // Defeat enemy objective
          return updated;
        });
      }
    }
  };

  const handleSpecial = () => {
    if (battleOver || isPaused || specialMeter < 100) return;
    
    const charStats = activeCharacter?.stats.special || 50;
    const damage = 25 + charStats / 5;
    const newEnemyHealth = Math.max(0, enemyHealth - damage);
    
    setEnemyHealth(newEnemyHealth);
    setSpecialMeter(0);
    setComboCount(prev => prev + 3);
    setLastAction(`${activeCharacter?.name} ULTIMATE ATTACK!`);
    
    playSound('success');

    if (newEnemyHealth <= 0) {
      setBattleOver(true);
      setVictory(true);
    }
  };

  const playSound = (type: 'hit' | 'success') => {
    try {
      const sound = new Audio(`/sounds/${type}.mp3`);
      sound.volume = 0.5;
      sound.play().catch(() => {});
    } catch (e) {}
  };

  useEffect(() => {
    if (battleOver || isPaused) return;
    
    const difficultyMult = (mission?.difficulty || 5) / 5;
    const enemyAttackInterval = setInterval(() => {
      const targetIndex = activePlayerIndex;
      const baseDamage = 3 + Math.floor(Math.random() * 8);
      const damage = baseDamage * (1 + difficultyMult * 0.25);
      
      setTeamHealth(prev => {
        const newHealth = [...prev];
        newHealth[targetIndex] = Math.max(0, newHealth[targetIndex] - damage);
        setLastAction(`${mission?.bossName || 'Enemy'} attacked for ${Math.floor(damage)} damage!`);
        
        if (newHealth[targetIndex] <= 0) {
          const aliveIndex = newHealth.findIndex(h => h > 0);
          if (aliveIndex === -1) {
            setBattleOver(true);
            setVictory(false);
          } else {
            setActivePlayerIndex(aliveIndex);
          }
        }
        
        return newHealth;
      });
    }, 2500);

    return () => clearInterval(enemyAttackInterval);
  }, [battleOver, isPaused, activePlayerIndex, mission]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (battleOver || isPaused) return;
      
      switch(e.key.toLowerCase()) {
        case '1':
        case 'j':
        case 'x':
          handleAttack();
          break;
        case '2':
        case 'l':
        case 'c':
          handleSpecial();
          break;
        case 'arrowleft':
        case 'a':
          if (activePlayerIndex > 0) handleTagSwitch(activePlayerIndex - 1);
          break;
        case 'arrowright':
        case 'd':
          if (activePlayerIndex < playerCharacters.length - 1) handleTagSwitch(activePlayerIndex + 1);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePlayerIndex, battleOver, isPaused, playerCharacters.length]);

  return (
    <div className="w-full h-screen relative bg-black">
      {/* 3D Battle Arena */}
      <Canvas
        shadows
        camera={{ position: [0, 8, 15], fov: 50 }}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <BattleArenaScene
            playerCharacters={playerCharacters}
            activePlayerIndex={activePlayerIndex}
            teamHealth={teamHealth}
            enemyHealth={enemyHealth}
            comboCount={comboCount}
          />
        </Suspense>
      </Canvas>

      {/* Battle UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Bar: Timer & Mission Info */}
        <div className="flex justify-between items-start p-4">
          {/* Player Team Health */}
          <div className="pointer-events-auto space-y-2">
            {playerCharacters.map((char, i) => (
              <div
                key={char.id}
                className={`flex items-center gap-2 bg-black/80 rounded-lg p-2 border-2 transition-all cursor-pointer ${
                  i === activePlayerIndex 
                    ? 'border-yellow-400 ring-2 ring-yellow-400' 
                    : teamHealth[i] <= 0 
                    ? 'border-red-800 opacity-50' 
                    : 'border-gray-600 hover:border-cyan-400'
                }`}
                onClick={() => handleTagSwitch(i)}
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white"
                  style={{ backgroundColor: ROLE_COLORS[char.role] }}
                >
                  {char.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-[100px]">
                  <p className="text-white text-sm font-bold">{char.name}</p>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        teamHealth[i] > 50 ? 'bg-green-500' : teamHealth[i] > 25 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${teamHealth[i]}%` }}
                    />
                  </div>
                </div>
                {i === activePlayerIndex && (
                  <span className="text-yellow-400 text-xs font-bold">ACTIVE</span>
                )}
              </div>
            ))}
          </div>

          {/* Timer & Combo */}
          <div className="flex flex-col items-center gap-2">
            <div className="bg-black/80 border-4 border-yellow-500 rounded-xl px-6 py-3">
              <p className="text-yellow-400 font-black text-4xl">{battleTime}</p>
            </div>
            {comboCount > 0 && (
              <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg px-4 py-2 animate-pulse">
                <p className="text-white font-black text-xl">{comboCount} HIT COMBO!</p>
              </div>
            )}
            {lastAction && (
              <div className="bg-cyan-900/80 border-2 border-cyan-400 rounded-lg px-4 py-2 text-center">
                <p className="text-cyan-300 font-bold text-sm">{lastAction}</p>
              </div>
            )}
          </div>

          {/* Enemy Health */}
          <div className="bg-black/80 rounded-lg p-4 border-2 border-red-500 min-w-[250px]">
            <div className="mb-2">
              <p className="text-red-400 font-bold text-sm">
                {mission?.bossName || 'ENEMY'}
              </p>
              {mission && (
                <p className="text-gray-400 text-xs">
                  {mission.name}
                </p>
              )}
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
              <div 
                className="h-full bg-red-500 rounded-full transition-all"
                style={{ width: `${enemyHealth}%` }}
              />
            </div>
            <p className="text-gray-400 text-xs">{Math.ceil(enemyHealth)}% HP</p>
          </div>
        </div>

        {/* Bottom: Controls & Special Meter */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Team Bonuses */}
          {teamBonuses.length > 0 && (
            <div className="flex justify-center gap-2 mb-4">
              {teamBonuses.slice(0, 3).map((bonus, i) => (
                <div key={i} className="bg-purple-900/80 rounded-lg px-3 py-1 border border-purple-500">
                  <p className="text-purple-300 text-xs font-bold">{bonus.name}</p>
                </div>
              ))}
            </div>
          )}

          {/* Special Meter */}
          <div className="flex justify-center mb-4">
            <div className="w-full max-w-md bg-black/80 rounded-lg p-2 border-2 border-cyan-500">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-400 text-sm font-bold">SPECIAL</span>
                <span className="text-white text-sm ml-auto">{specialMeter}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className={`h-full rounded-full transition-all ${
                    specialMeter >= 100 ? 'bg-gradient-to-r from-cyan-400 to-purple-500 animate-pulse' : 'bg-cyan-500'
                  }`}
                  style={{ width: `${specialMeter}%` }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 pointer-events-auto flex-wrap">
            <Button
              onClick={handleAttack}
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-black px-8 py-4 text-xl"
              title="Press J or 1 to attack"
            >
              <Sword className="w-6 h-6 mr-2" />
              ATTACK (J)
            </Button>
            
            <Button
              onClick={handleSpecial}
              disabled={specialMeter < 100}
              className={`font-black px-8 py-4 text-xl ${
                specialMeter >= 100 
                  ? 'bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 animate-pulse' 
                  : 'bg-gray-600 cursor-not-allowed'
              }`}
              title="Press L or 2 when charged"
            >
              <Zap className="w-6 h-6 mr-2" />
              SPECIAL (L)
            </Button>
            
            <Button
              onClick={() => setIsPaused(!isPaused)}
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-6 py-4"
              title="Press ESC to pause"
            >
              {isPaused ? 'RESUME' : 'PAUSE'}
            </Button>
          </div>
          
          {/* Keyboard Controls Help */}
          <div className="text-center text-gray-400 text-xs mt-2">
            <p>← A/Left to tag | D/Right to tag → | J or 1 = Attack | L or 2 = Special</p>
          </div>
        </div>

        {/* Mission Objectives Panel (if in story mission) */}
        {mission && (
          <div className="absolute bottom-32 left-4 bg-black/80 border-2 border-cyan-500 rounded-lg p-3 max-w-xs max-h-32 overflow-y-auto">
            <p className="text-cyan-400 font-bold text-xs mb-2 uppercase">MISSION OBJECTIVES</p>
            <ul className="space-y-1">
              {mission.objectives.map((obj, i) => (
                <li key={i} className="text-gray-300 text-xs flex items-center gap-2">
                  <span className={objectivesComplete[i] ? 'text-green-400' : 'text-gray-500'}>
                    {objectivesComplete[i] ? '✓' : '○'}
                  </span>
                  <span className={objectivesComplete[i] ? 'line-through text-gray-500' : ''}>
                    {obj}
                  </span>
                </li>
              ))}
            </ul>
            {mission.difficulty && (
              <p className="text-yellow-400 text-xs mt-2 font-bold">
                Difficulty: {mission.difficulty}/10
              </p>
            )}
          </div>
        )}

        {/* Back Button */}
        <Button
          onClick={onBack}
          className="absolute top-4 left-4 bg-red-600 hover:bg-red-700 text-white pointer-events-auto"
        >
          ← EXIT
        </Button>
      </div>

      {/* Battle Over Overlay */}
      {battleOver && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center pointer-events-auto">
          <div className="text-center space-y-6">
            <h1 className={`text-6xl md:text-8xl font-black ${victory ? 'text-yellow-400' : 'text-red-500'}`}>
              {victory ? 'VICTORY!' : 'DEFEAT'}
            </h1>
            <p className="text-white text-xl">
              {victory 
                ? `Great job! ${comboCount} total hits!` 
                : 'Your team was defeated. Try again!'}
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => onBattleComplete(victory)}
                className="bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white font-bold px-8 py-4 text-xl"
              >
                CONTINUE
              </Button>
              {!victory && (
                <Button
                  onClick={() => {
                    setTeamHealth(playerTeam.map(() => 100));
                    setEnemyHealth(100);
                    setComboCount(0);
                    setSpecialMeter(0);
                    setBattleTime(99);
                    setBattleOver(false);
                    setVictory(false);
                    setActivePlayerIndex(0);
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 text-xl"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  RETRY
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BattleArenaScene({
  playerCharacters,
  activePlayerIndex,
  teamHealth,
  enemyHealth,
  comboCount
}: {
  playerCharacters: Character[];
  activePlayerIndex: number;
  teamHealth: number[];
  enemyHealth: number;
  comboCount: number;
}) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[-10, 10, -10]} intensity={0.5} color="#ff6b6b" />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#4ecdc4" />

      {/* Arena Floor - Colorful Grid */}
      <ArenaFloor />

      {/* Player Characters */}
      {playerCharacters.map((char, i) => (
        <PlayerCharacter
          key={char.id}
          character={char}
          position={[-4 + i * 2, 0, i === activePlayerIndex ? 2 : 4]}
          isActive={i === activePlayerIndex}
          health={teamHealth[i]}
        />
      ))}

      {/* Enemy Character */}
      <EnemyCharacter
        position={[4, 0, 0]}
        health={enemyHealth}
      />

      {/* Background Elements */}
      <NeonRings />
      
      {/* Camera Controls */}
      <OrbitControls 
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.5}
      />
    </>
  );
}

function ArenaFloor() {
  const floorRef = useRef<THREE.Mesh>(null);

  return (
    <>
      {/* Main floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial 
          color="#1a1a2e"
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>

      {/* Glowing grid lines */}
      {[...Array(11)].map((_, i) => (
        <group key={i}>
          <mesh position={[-15 + i * 3, -0.49, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.1, 30]} />
            <meshBasicMaterial color="#4ecdc4" transparent opacity={0.5} />
          </mesh>
          <mesh position={[0, -0.49, -15 + i * 3]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[30, 0.1]} />
            <meshBasicMaterial color="#ff6b6b" transparent opacity={0.5} />
          </mesh>
        </group>
      ))}
    </>
  );
}

function PlayerCharacter({
  character,
  position,
  isActive,
  health
}: {
  character: Character;
  position: [number, number, number];
  isActive: boolean;
  health: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = ROLE_COLORS[character.role];

  useFrame((state) => {
    if (meshRef.current) {
      if (isActive) {
        meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
        meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 3) * 0.1 + 1;
      } else {
        meshRef.current.position.y = 1;
      }
    }
  });

  return (
    <group position={position}>
      {/* Character body - Roblox-style blocky */}
      <mesh ref={meshRef} castShadow position={[0, 1, 0]}>
        <boxGeometry args={[1, 1.5, 0.8]} />
        <meshStandardMaterial 
          color={health > 0 ? color : '#444444'}
          emissive={isActive ? color : '#000000'}
          emissiveIntensity={isActive ? 0.3 : 0}
        />
      </mesh>

      {/* Head */}
      <mesh castShadow position={[0, 2.2, 0]}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial 
          color={health > 0 ? '#ffd93d' : '#666666'}
        />
      </mesh>

      {/* Arms */}
      <mesh castShadow position={[-0.7, 1, 0]}>
        <boxGeometry args={[0.3, 1.2, 0.3]} />
        <meshStandardMaterial color={health > 0 ? color : '#444444'} />
      </mesh>
      <mesh castShadow position={[0.7, 1, 0]}>
        <boxGeometry args={[0.3, 1.2, 0.3]} />
        <meshStandardMaterial color={health > 0 ? color : '#444444'} />
      </mesh>

      {/* Legs */}
      <mesh castShadow position={[-0.25, 0, 0]}>
        <boxGeometry args={[0.4, 0.8, 0.4]} />
        <meshStandardMaterial color="#2d3436" />
      </mesh>
      <mesh castShadow position={[0.25, 0, 0]}>
        <boxGeometry args={[0.4, 0.8, 0.4]} />
        <meshStandardMaterial color="#2d3436" />
      </mesh>

      {/* Active indicator ring */}
      {isActive && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[0.8, 1.2, 32]} />
          <meshBasicMaterial color="#ffd93d" transparent opacity={0.8} />
        </mesh>
      )}

      {/* Character name label */}
      <Text
        position={[0, 3, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="black"
      >
        {character.name}
      </Text>
    </group>
  );
}

function EnemyCharacter({
  position,
  health
}: {
  position: [number, number, number];
  health: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.2;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.15 + 1.5;
    }
  });

  return (
    <group position={position}>
      {/* Enemy body - larger, menacing */}
      <mesh ref={meshRef} castShadow position={[0, 1.5, 0]}>
        <boxGeometry args={[1.5, 2, 1]} />
        <meshStandardMaterial 
          color={health > 50 ? '#e74c3c' : health > 25 ? '#f39c12' : '#9b59b6'}
          emissive="#ff0000"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Enemy head */}
      <mesh castShadow position={[0, 3, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color="#2c3e50"
        />
      </mesh>

      {/* Evil eyes */}
      <mesh position={[-0.25, 3.1, 0.51]}>
        <boxGeometry args={[0.2, 0.1, 0.02]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>
      <mesh position={[0.25, 3.1, 0.51]}>
        <boxGeometry args={[0.2, 0.1, 0.02]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>

      {/* Arms */}
      <mesh castShadow position={[-1, 1.5, 0]}>
        <boxGeometry args={[0.4, 1.5, 0.4]} />
        <meshStandardMaterial color="#c0392b" />
      </mesh>
      <mesh castShadow position={[1, 1.5, 0]}>
        <boxGeometry args={[0.4, 1.5, 0.4]} />
        <meshStandardMaterial color="#c0392b" />
      </mesh>

      {/* Legs */}
      <mesh castShadow position={[-0.4, 0, 0]}>
        <boxGeometry args={[0.5, 1, 0.5]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      <mesh castShadow position={[0.4, 0, 0]}>
        <boxGeometry args={[0.5, 1, 0.5]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {/* Danger aura */}
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[2, 16, 16]} />
        <meshBasicMaterial color="#ff0000" transparent opacity={0.1} />
      </mesh>

      <Text
        position={[0, 4.5, 0]}
        fontSize={0.4}
        color="#ff4444"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="black"
      >
        ENEMY
      </Text>
    </group>
  );
}

function NeonRings() {
  const ringsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ringsRef.current) {
      ringsRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <group ref={ringsRef}>
      {[...Array(3)].map((_, i) => (
        <mesh 
          key={i} 
          position={[0, 0.1, 0]} 
          rotation={[-Math.PI / 2, 0, i * Math.PI / 3]}
        >
          <torusGeometry args={[12 + i * 2, 0.05, 8, 64]} />
          <meshBasicMaterial 
            color={['#ff6b6b', '#4ecdc4', '#ffd93d'][i]} 
            transparent 
            opacity={0.6} 
          />
        </mesh>
      ))}
    </group>
  );
}

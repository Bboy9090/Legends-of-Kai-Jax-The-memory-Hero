import { Canvas } from '@react-three/fiber';
import { Suspense, useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { OrbitControls, Environment, Text, KeyboardControls, Sparkles, Float, Html } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getAllCharacters, Character, CharacterRole, getCharacterById } from '../../lib/roster';
import { getMissionById } from '../../lib/missions';
import { getActiveTeamBonuses } from '../../lib/teamSynergy';
import { useFluidCombat, COMBO_MOVES } from '../../lib/stores/useFluidCombat';
import FluidCombatPlayer from './FluidCombatPlayer';
import GLBCharacterModel, { getModelPath } from './models/GLBCharacterModel';
import { Button } from '../ui/button';
import { Heart, Zap, Shield, Sword, Users, RotateCcw, Target, Flame } from 'lucide-react';

interface FluidBattleArenaProps {
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

enum Controls {
  forward = 'forward',
  back = 'back',
  left = 'left',
  right = 'right',
  jump = 'jump',
  lightAttack = 'lightAttack',
  heavyAttack = 'heavyAttack',
  launcher = 'launcher',
  special = 'special',
  ultimate = 'ultimate',
  dodge = 'dodge',
  run = 'run',
  tagNext = 'tagNext',
  tagPrev = 'tagPrev',
}

const keyMap = [
  { name: Controls.forward, keys: ['ArrowUp', 'KeyW'] },
  { name: Controls.back, keys: ['ArrowDown', 'KeyS'] },
  { name: Controls.left, keys: ['ArrowLeft', 'KeyA'] },
  { name: Controls.right, keys: ['ArrowRight', 'KeyD'] },
  { name: Controls.jump, keys: ['Space'] },
  { name: Controls.lightAttack, keys: ['KeyJ', 'KeyZ'] },
  { name: Controls.heavyAttack, keys: ['KeyK', 'KeyX'] },
  { name: Controls.launcher, keys: ['KeyL', 'KeyC'] },
  { name: Controls.special, keys: ['KeyI', 'KeyV'] },
  { name: Controls.ultimate, keys: ['KeyO', 'KeyB'] },
  { name: Controls.dodge, keys: ['ShiftLeft', 'ShiftRight'] },
  { name: Controls.run, keys: ['ControlLeft', 'ControlRight'] },
  { name: Controls.tagNext, keys: ['KeyE', 'Digit2'] },
  { name: Controls.tagPrev, keys: ['KeyQ', 'Digit1'] },
];

export default function FluidBattleArena({
  missionId,
  playerTeam,
  onBattleComplete,
  onBack
}: FluidBattleArenaProps) {
  const mission = missionId ? getMissionById(missionId) : null;
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [teamHealth, setTeamHealth] = useState<number[]>(playerTeam.map(() => 100));
  const [enemyHealth, setEnemyHealth] = useState(100);
  const [battleTime, setBattleTime] = useState(mission?.isBoss ? 180 : 99);
  const [isPaused, setIsPaused] = useState(false);
  const [battleOver, setBattleOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [lastAction, setLastAction] = useState<string>('');
  const [damageNumbers, setDamageNumbers] = useState<{ id: number; value: number; position: [number, number, number]; isCombo?: boolean }[]>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const {
    comboCount,
    comboDamage,
    specialMeter,
    ultimateMeter,
    currentAttack,
    attackPhase,
    reset: resetCombat,
  } = useFluidCombat();

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };
  }, []);

  const addTimeout = useCallback((callback: () => void, delay: number) => {
    const timeout = setTimeout(() => {
      callback();
      timeoutsRef.current = timeoutsRef.current.filter(t => t !== timeout);
    }, delay);
    timeoutsRef.current.push(timeout);
    return timeout;
  }, []);

  const playerCharacters = useMemo(() => {
    return playerTeam.map(id => getCharacterById(id)).filter(Boolean) as Character[];
  }, [playerTeam]);

  const teamBonuses = useMemo(() => {
    return getActiveTeamBonuses(playerTeam);
  }, [playerTeam]);

  const activeCharacter = playerCharacters[activePlayerIndex];

  // Battle timer
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

  // Enemy AI attacks
  useEffect(() => {
    if (battleOver || isPaused) return;
    
    const difficultyMult = (mission?.difficulty || 5) / 5;
    const enemyAttackInterval = setInterval(() => {
      const targetIndex = activePlayerIndex;
      const baseDamage = 3 + Math.floor(Math.random() * 8);
      const damage = Math.floor(baseDamage * (1 + difficultyMult * 0.25));
      
      setTeamHealth(prev => {
        const newHealth = [...prev];
        newHealth[targetIndex] = Math.max(0, newHealth[targetIndex] - damage);
        setLastAction(`${mission?.bossName || 'Enemy'} attacked for ${damage} damage!`);
        
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

  // Handle damage dealt to enemy
  const handleDamageDealt = useCallback((damage: number, position: [number, number, number]) => {
    // Scale damage with combo
    const comboScale = Math.max(0.5, 1 - comboCount * 0.03);
    const scaledDamage = Math.floor(damage * comboScale * (1 + (activeCharacter?.stats.attack || 50) / 100));
    
    const newEnemyHealth = Math.max(0, enemyHealth - scaledDamage);
    setEnemyHealth(newEnemyHealth);
    
    // Add floating damage number
    setDamageNumbers(prev => [...prev, { 
      id: Date.now() + Math.random(), 
      value: scaledDamage, 
      position,
      isCombo: comboCount > 5
    }]);
    addTimeout(() => setDamageNumbers(prev => prev.slice(1)), 1200);
    
    // Play hit sound
    try {
      const sound = new Audio('/sounds/hit.mp3');
      sound.volume = 0.3;
      sound.play().catch(() => {});
    } catch (e) {}
    
    if (newEnemyHealth <= 0) {
      setBattleOver(true);
      setVictory(true);
    }
  }, [enemyHealth, comboCount, activeCharacter, addTimeout]);

  // Handle tag switching
  const handleTagSwitch = useCallback((index: number) => {
    if (index !== activePlayerIndex && teamHealth[index] > 0) {
      setActivePlayerIndex(index);
      resetCombat();
    }
  }, [activePlayerIndex, teamHealth, resetCombat]);

  // Tag switch keyboard handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (battleOver || isPaused) return;
      
      if (e.code === 'KeyE' || e.code === 'Digit2') {
        const nextIndex = (activePlayerIndex + 1) % playerCharacters.length;
        if (teamHealth[nextIndex] > 0) handleTagSwitch(nextIndex);
      } else if (e.code === 'KeyQ' || e.code === 'Digit1') {
        const prevIndex = (activePlayerIndex - 1 + playerCharacters.length) % playerCharacters.length;
        if (teamHealth[prevIndex] > 0) handleTagSwitch(prevIndex);
      } else if (e.code === 'Escape') {
        setIsPaused(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePlayerIndex, battleOver, isPaused, playerCharacters.length, teamHealth, handleTagSwitch]);

  return (
    <div className="w-full h-screen relative bg-black">
      {/* 3D Battle Arena with Keyboard Controls */}
      <KeyboardControls map={keyMap}>
        <Canvas
          shadows
          camera={{ position: [0, 12, 20], fov: 50 }}
          gl={{ antialias: true }}
        >
          <Suspense fallback={null}>
            <FluidBattleScene
              playerCharacter={activeCharacter}
              enemyHealth={enemyHealth}
              comboCount={comboCount}
              damageNumbers={damageNumbers}
              onDamageDealt={handleDamageDealt}
              battleOver={battleOver}
            />
          </Suspense>
        </Canvas>
      </KeyboardControls>

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
                    ? 'border-yellow-400 ring-2 ring-yellow-400 shadow-[0_0_20px_rgba(255,215,0,0.5)]' 
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
                  <span className="text-yellow-400 text-xs font-bold animate-pulse">ACTIVE</span>
                )}
              </div>
            ))}
          </div>

          {/* Timer & Combo */}
          <div className="flex flex-col items-center gap-2">
            <div className="bg-black/80 border-4 border-yellow-500 rounded-xl px-6 py-3">
              <p className="text-yellow-400 font-black text-4xl">{battleTime}</p>
            </div>
            {comboCount > 1 && (
              <div className={`rounded-lg px-4 py-2 ${comboCount > 10 ? 'bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 animate-pulse' : 'bg-gradient-to-r from-orange-500 to-red-500'}`}>
                <p className="text-white font-black text-xl">{comboCount} HIT COMBO!</p>
                {comboDamage > 0 && (
                  <p className="text-yellow-200 text-xs text-center">{comboDamage} total damage</p>
                )}
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
                <p className="text-gray-400 text-xs">{mission.name}</p>
              )}
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
              <div 
                className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all"
                style={{ width: `${enemyHealth}%` }}
              />
            </div>
            <p className="text-gray-400 text-xs">{Math.ceil(enemyHealth)}% HP</p>
          </div>
        </div>

        {/* Bottom: Controls & Special Meters */}
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

          {/* Special & Ultimate Meters */}
          <div className="flex justify-center gap-4 mb-4">
            <div className="w-48 bg-black/80 rounded-lg p-2 border-2 border-cyan-500">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-400 text-sm font-bold">SPECIAL</span>
                <span className="text-white text-sm ml-auto">{Math.floor(specialMeter)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className={`h-full rounded-full transition-all ${
                    specialMeter >= 50 ? 'bg-gradient-to-r from-cyan-400 to-blue-500 animate-pulse' : 'bg-cyan-500'
                  }`}
                  style={{ width: `${specialMeter}%` }}
                />
              </div>
            </div>
            <div className="w-48 bg-black/80 rounded-lg p-2 border-2 border-purple-500">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-4 h-4 text-purple-400" />
                <span className="text-purple-400 text-sm font-bold">ULTIMATE</span>
                <span className="text-white text-sm ml-auto">{Math.floor(ultimateMeter)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className={`h-full rounded-full transition-all ${
                    ultimateMeter >= 100 ? 'bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 animate-pulse' : 'bg-purple-500'
                  }`}
                  style={{ width: `${ultimateMeter}%` }}
                />
              </div>
            </div>
          </div>

          {/* Current Attack Indicator */}
          {currentAttack && (
            <div className="flex justify-center mb-2">
              <div className="bg-orange-600/90 rounded-lg px-4 py-1 border border-orange-400">
                <p className="text-white font-bold text-sm uppercase">{currentAttack.replace(/\d/g, ' $&')}</p>
              </div>
            </div>
          )}
          
          {/* Keyboard Controls Help */}
          <div className="text-center text-gray-400 text-xs space-y-1 bg-black/60 rounded-lg p-2 mx-auto max-w-2xl">
            <p className="text-cyan-400 font-bold">SPIDER-MAN STYLE CONTROLS</p>
            <p><span className="text-yellow-400">WASD</span> = Move Freely | <span className="text-yellow-400">SPACE</span> = Jump | <span className="text-yellow-400">SHIFT</span> = Dash/Dodge</p>
            <p><span className="text-red-400">J/Z</span> = Light Attack (chains!) | <span className="text-orange-400">K/X</span> = Heavy Attack | <span className="text-purple-400">L/C</span> = Launcher (air combo!)</p>
            <p><span className="text-cyan-400">I/V</span> = Special | <span className="text-pink-400">O/B</span> = Ultimate | <span className="text-green-400">Q/E</span> = Tag Switch</p>
          </div>
        </div>

        {/* Back Button */}
        <Button
          onClick={onBack}
          className="absolute top-4 left-4 bg-red-600 hover:bg-red-700 text-white pointer-events-auto"
        >
          EXIT
        </Button>

        {/* Pause Button */}
        <Button
          onClick={() => setIsPaused(!isPaused)}
          className="absolute top-4 right-4 bg-gray-700 hover:bg-gray-600 text-white pointer-events-auto"
        >
          {isPaused ? 'RESUME' : 'PAUSE (ESC)'}
        </Button>
      </div>

      {/* Pause Overlay */}
      {isPaused && !battleOver && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center pointer-events-auto z-50">
          <div className="text-center space-y-6">
            <h1 className="text-6xl font-black text-white">PAUSED</h1>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => setIsPaused(false)}
                className="bg-green-600 hover:bg-green-500 text-white font-bold px-8 py-4 text-xl"
              >
                RESUME
              </Button>
              <Button
                onClick={onBack}
                className="bg-red-600 hover:bg-red-500 text-white font-bold px-8 py-4 text-xl"
              >
                QUIT
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Battle Over Overlay */}
      {battleOver && (
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-auto overflow-hidden ${
          victory 
            ? 'bg-gradient-to-br from-yellow-900/90 via-orange-900/90 to-red-900/90' 
            : 'bg-gradient-to-br from-gray-900/95 via-red-950/90 to-black/95'
        }`}>
          <div className="text-center space-y-8 z-10">
            <h1 className={`text-7xl md:text-9xl font-black tracking-wider ${
              victory 
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500' 
                : 'text-transparent bg-clip-text bg-gradient-to-r from-gray-400 via-red-600 to-gray-400'
            }`}>
              {victory ? 'VICTORY!' : 'DEFEAT'}
            </h1>
            
            <div className={`grid grid-cols-3 gap-8 p-6 rounded-2xl ${
              victory ? 'bg-yellow-900/40 border-2 border-yellow-500/50' : 'bg-gray-900/60 border-2 border-red-500/30'
            }`}>
              <div className="text-center">
                <p className="text-gray-400 text-sm uppercase tracking-wide">Max Combo</p>
                <p className={`text-4xl font-black ${victory ? 'text-yellow-400' : 'text-red-400'}`}>{comboCount}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm uppercase tracking-wide">Total Damage</p>
                <p className={`text-4xl font-black ${victory ? 'text-orange-400' : 'text-orange-400'}`}>{comboDamage}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm uppercase tracking-wide">Time Left</p>
                <p className={`text-4xl font-black ${victory ? 'text-green-400' : 'text-gray-400'}`}>
                  {Math.floor(battleTime / 60)}:{(battleTime % 60).toString().padStart(2, '0')}
                </p>
              </div>
            </div>

            <div className="flex gap-6 justify-center">
              <Button
                onClick={() => onBattleComplete(victory)}
                className={`font-black px-10 py-5 text-2xl rounded-xl ${
                  victory 
                    ? 'bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-black' 
                    : 'bg-gradient-to-r from-green-600 to-cyan-600 text-white'
                }`}
              >
                CONTINUE
              </Button>
              {!victory && (
                <Button
                  onClick={() => {
                    setTeamHealth(playerTeam.map(() => 100));
                    setEnemyHealth(100);
                    setBattleTime(99);
                    setBattleOver(false);
                    setVictory(false);
                    setActivePlayerIndex(0);
                    setDamageNumbers([]);
                    resetCombat();
                  }}
                  className="bg-gradient-to-r from-orange-600 to-red-600 text-white font-black px-10 py-5 text-2xl rounded-xl"
                >
                  <RotateCcw className="w-6 h-6 mr-2" />
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

// 3D Battle Scene Component
function FluidBattleScene({
  playerCharacter,
  enemyHealth,
  comboCount,
  damageNumbers,
  onDamageDealt,
  battleOver
}: {
  playerCharacter: Character;
  enemyHealth: number;
  comboCount: number;
  damageNumbers: { id: number; value: number; position: [number, number, number]; isCombo?: boolean }[];
  onDamageDealt: (damage: number, position: [number, number, number]) => void;
  battleOver: boolean;
}) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} />
      <pointLight position={[-10, 10, -10]} intensity={0.8} color="#ff6b6b" />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#4ecdc4" />
      <pointLight position={[0, 15, 0]} intensity={0.6} color="#ffd93d" />
      <spotLight position={[0, 20, 15]} angle={0.4} penumbra={0.5} intensity={1.2} castShadow />

      {/* Arena Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#0a0a15" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.48, 0]}>
        <circleGeometry args={[15, 64]} />
        <meshStandardMaterial 
          color="#1a1a2e" 
          emissive="#4ecdc4" 
          emissiveIntensity={0.1 + comboCount * 0.02}
          metalness={0.6} 
          roughness={0.3} 
        />
      </mesh>

      {/* Grid Lines */}
      {[...Array(20)].map((_, i) => (
        <group key={i}>
          <mesh position={[-25 + i * 2.5, -0.47, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.05, 50]} />
            <meshBasicMaterial color="#4ecdc4" transparent opacity={0.3} />
          </mesh>
          <mesh position={[0, -0.47, -25 + i * 2.5]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[50, 0.05]} />
            <meshBasicMaterial color="#ff6b6b" transparent opacity={0.3} />
          </mesh>
        </group>
      ))}

      {/* Sparkles */}
      <Sparkles count={100} scale={[30, 20, 30]} size={3} speed={0.5} color="#4ecdc4" opacity={0.6} />
      <Sparkles count={50} scale={[25, 15, 25]} size={4} speed={0.3} color="#ff6b6b" opacity={0.4} />

      {/* Player Character */}
      {!battleOver && (
        <FluidCombatPlayer 
          character={playerCharacter} 
          onDamageDealt={onDamageDealt}
        />
      )}

      {/* Enemy - raised to sit on ground surface */}
      <EnemyFighter position={[6, 1.5, 0]} health={enemyHealth} />

      {/* Floating Damage Numbers */}
      {damageNumbers.map((dn) => (
        <FloatingDamage key={dn.id} value={dn.value} position={dn.position} isCombo={dn.isCombo} />
      ))}

      {/* Arena Barriers */}
      {[
        { pos: [0, 3, -18] as [number, number, number], width: 40, color: '#4ecdc4' },
        { pos: [0, 3, 18] as [number, number, number], width: 40, color: '#ff6b6b' },
        { pos: [-18, 3, 0] as [number, number, number], rot: Math.PI / 2, width: 40, color: '#a855f7' },
        { pos: [18, 3, 0] as [number, number, number], rot: -Math.PI / 2, width: 40, color: '#ffd93d' },
      ].map((barrier, i) => (
        <mesh key={i} position={barrier.pos} rotation={[0, barrier.rot || 0, 0]}>
          <planeGeometry args={[barrier.width, 8]} />
          <meshBasicMaterial color={barrier.color} transparent opacity={0.1} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* Post-Processing */}
      <EffectComposer>
        <Bloom intensity={0.8} luminanceThreshold={0.5} luminanceSmoothing={0.7} mipmapBlur />
        <Vignette eskil={false} offset={0.1} darkness={0.4} />
      </EffectComposer>

      {/* Camera follows action */}
      <CameraController />
    </>
  );
}

function CameraController() {
  const { playerX, playerZ } = useFluidCombat();
  
  useFrame(({ camera }) => {
    // Smooth camera follow
    const targetX = playerX * 0.3;
    const targetZ = playerZ * 0.2 + 18;
    
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.z += (targetZ - camera.position.z) * 0.05;
    camera.lookAt(playerX * 0.5, 2, playerZ * 0.3);
  });
  
  return null;
}

function EnemyFighter({ position, health }: { position: [number, number, number]; health: number }) {
  const meshRef = useRef<THREE.Group>(null);
  const { setEnemyPosition } = useFluidCombat();
  
  // Initial sync of enemy position
  useEffect(() => {
    setEnemyPosition(position[0], position[1], position[2]);
  }, [position, setEnemyPosition]);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.1;
      const bobY = Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.position.y = bobY;
      
      // Sync actual animated position to combat store every frame
      setEnemyPosition(position[0], position[1] + bobY, position[2]);
    }
  });
  
  return (
    <group position={position} ref={meshRef}>
      {/* Enemy body */}
      <mesh castShadow>
        <capsuleGeometry args={[0.8, 2, 16, 32]} />
        <meshToonMaterial color={health > 50 ? '#8b0000' : '#4a0000'} />
      </mesh>
      
      {/* Enemy head */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <sphereGeometry args={[0.6, 32, 24]} />
        <meshToonMaterial color="#8b0000" />
      </mesh>
      
      {/* Glowing eyes */}
      <mesh position={[-0.2, 1.9, 0.5]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>
      <mesh position={[0.2, 1.9, 0.5]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>
      
      {/* Arms */}
      <mesh position={[-1.2, 0.5, 0]} castShadow>
        <capsuleGeometry args={[0.3, 1.5, 12, 16]} />
        <meshToonMaterial color="#8b0000" />
      </mesh>
      <mesh position={[1.2, 0.5, 0]} castShadow>
        <capsuleGeometry args={[0.3, 1.5, 12, 16]} />
        <meshToonMaterial color="#8b0000" />
      </mesh>
      
      {/* Health indicator */}
      <Html position={[0, 3, 0]} center>
        <div className="bg-black/80 rounded px-2 py-1 border border-red-500">
          <div className="w-20 h-2 bg-gray-700 rounded">
            <div 
              className="h-full bg-red-500 rounded transition-all"
              style={{ width: `${health}%` }}
            />
          </div>
        </div>
      </Html>
    </group>
  );
}

function FloatingDamage({ value, position, isCombo }: { value: number; position: [number, number, number]; isCombo?: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const startY = useRef(position[1]);
  
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.position.y += delta * 2;
      const age = ref.current.position.y - startY.current;
      ref.current.scale.setScalar(Math.max(0, 1 - age * 0.3));
    }
  });
  
  return (
    <group ref={ref} position={position}>
      <Html center>
        <div className={`font-black text-3xl ${isCombo ? 'text-yellow-400 animate-pulse' : 'text-red-400'}`}
             style={{ textShadow: '2px 2px 4px black' }}>
          {value}
        </div>
      </Html>
    </group>
  );
}

import { Canvas } from '@react-three/fiber';
import { Suspense, useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { OrbitControls, Environment, Text, useTexture, KeyboardControls, useKeyboardControls, Sparkles, Float, Trail } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
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
  const [hitEffect, setHitEffect] = useState<{ active: boolean; type: 'attack' | 'special' | 'damage'; position: [number, number, number] }>({ active: false, type: 'attack', position: [0, 0, 0] });
  const [damageNumbers, setDamageNumbers] = useState<{ id: number; value: number; position: [number, number, number] }[]>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

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
    const damage = Math.floor((baseDamage + charStats / 20) * (1 + difficultyMult * 0.3) * (1 + comboCount * 0.05));
    const newEnemyHealth = Math.max(0, enemyHealth - damage);
    
    setEnemyHealth(newEnemyHealth);
    setComboCount(prev => prev + 1);
    setSpecialMeter(prev => Math.min(100, prev + 5));
    setLastAction(`${activeCharacter?.name} ATTACKED! -${damage} HP`);
    
    setHitEffect({ active: true, type: 'attack', position: [4, 2, 0] });
    addTimeout(() => setHitEffect({ active: false, type: 'attack', position: [0, 0, 0] }), 200);
    
    setDamageNumbers(prev => [...prev, { 
      id: Date.now(), 
      value: damage, 
      position: [4 + (Math.random() - 0.5), 3 + Math.random(), (Math.random() - 0.5)] 
    }]);
    addTimeout(() => setDamageNumbers(prev => prev.slice(1)), 1000);
    
    playSound('hit');

    if (newEnemyHealth <= 0) {
      setBattleOver(true);
      setVictory(true);
      if (!mission?.isBoss) {
        setObjectivesComplete(prev => {
          const updated = [...prev];
          updated[0] = true;
          return updated;
        });
      }
    }
  };

  const handleSpecial = () => {
    if (battleOver || isPaused || specialMeter < 100) return;
    
    const charStats = activeCharacter?.stats.special || 50;
    const damage = Math.floor(25 + charStats / 5);
    const newEnemyHealth = Math.max(0, enemyHealth - damage);
    
    setEnemyHealth(newEnemyHealth);
    setSpecialMeter(0);
    setComboCount(prev => prev + 3);
    setLastAction(`${activeCharacter?.name} ULTIMATE ATTACK!`);
    
    setHitEffect({ active: true, type: 'special', position: [4, 2, 0] });
    addTimeout(() => setHitEffect({ active: false, type: 'special', position: [0, 0, 0] }), 500);
    
    setDamageNumbers(prev => [...prev, { 
      id: Date.now(), 
      value: damage, 
      position: [4, 4, 0] 
    }]);
    addTimeout(() => setDamageNumbers(prev => prev.slice(1)), 1500);
    
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
            hitEffect={hitEffect}
            damageNumbers={damageNumbers}
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

      {/* Battle Over Overlay - LEGENDARY */}
      {battleOver && (
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-auto overflow-hidden ${
          victory 
            ? 'bg-gradient-to-br from-yellow-900/90 via-orange-900/90 to-red-900/90' 
            : 'bg-gradient-to-br from-gray-900/95 via-red-950/90 to-black/95'
        }`}>
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            {victory ? (
              <>
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute animate-pulse"
                    style={{
                      left: `${(i * 5) % 100}%`,
                      top: `${(i * 7) % 100}%`,
                      animation: `ping ${1 + (i % 3)}s infinite`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  >
                    <span className="text-4xl">⭐</span>
                  </div>
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-yellow-400/10 to-transparent animate-pulse" />
              </>
            ) : (
              <>
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute"
                    style={{
                      left: `${(i * 10) % 100}%`,
                      top: `${(i * 12) % 100}%`,
                      animation: `pulse ${2 + (i % 2)}s infinite`,
                      animationDelay: `${i * 0.2}s`
                    }}
                  >
                    <span className="text-2xl opacity-30">💀</span>
                  </div>
                ))}
              </>
            )}
          </div>

          <div className="text-center space-y-8 z-10">
            {/* Main Title */}
            <div className="relative">
              <h1 className={`text-7xl md:text-9xl font-black tracking-wider ${
                victory 
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 drop-shadow-[0_0_30px_rgba(255,215,0,0.8)]' 
                  : 'text-transparent bg-clip-text bg-gradient-to-r from-gray-400 via-red-600 to-gray-400 drop-shadow-[0_0_20px_rgba(255,0,0,0.6)]'
              }`}
              style={{ textShadow: victory ? '0 0 60px rgba(255, 215, 0, 0.5)' : '0 0 40px rgba(255, 0, 0, 0.5)' }}>
                {victory ? '🏆 VICTORY! 🏆' : '💀 DEFEAT 💀'}
              </h1>
              <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 h-1 w-64 ${
                victory ? 'bg-gradient-to-r from-transparent via-yellow-400 to-transparent' : 'bg-gradient-to-r from-transparent via-red-600 to-transparent'
              }`} />
            </div>
            
            {/* Stats Display */}
            <div className={`grid grid-cols-3 gap-8 p-6 rounded-2xl ${
              victory ? 'bg-yellow-900/40 border-2 border-yellow-500/50' : 'bg-gray-900/60 border-2 border-red-500/30'
            }`}>
              <div className="text-center">
                <p className="text-gray-400 text-sm uppercase tracking-wide">Combo Hits</p>
                <p className={`text-4xl font-black ${victory ? 'text-yellow-400' : 'text-red-400'}`}>{comboCount}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm uppercase tracking-wide">Time</p>
                <p className={`text-4xl font-black ${victory ? 'text-green-400' : 'text-orange-400'}`}>
                  {Math.floor(battleTime / 60)}:{(battleTime % 60).toString().padStart(2, '0')}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm uppercase tracking-wide">Team Status</p>
                <p className={`text-4xl font-black ${victory ? 'text-cyan-400' : 'text-gray-400'}`}>
                  {teamHealth.filter(h => h > 0).length}/{teamHealth.length}
                </p>
              </div>
            </div>

            <p className={`text-xl ${victory ? 'text-yellow-200' : 'text-gray-400'}`}>
              {victory 
                ? `Legendary performance! The enemy has been vanquished!` 
                : 'Your heroes have fallen. Rise again and fight!'}
            </p>
            
            {/* Action Buttons */}
            <div className="flex gap-6 justify-center">
              <Button
                onClick={() => onBattleComplete(victory)}
                className={`font-black px-10 py-5 text-2xl rounded-xl transform hover:scale-105 transition-all duration-200 ${
                  victory 
                    ? 'bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-400 hover:via-orange-400 hover:to-red-400 text-black shadow-[0_0_30px_rgba(255,165,0,0.5)]' 
                    : 'bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-500 hover:to-cyan-500 text-white shadow-[0_0_20px_rgba(0,255,200,0.3)]'
                }`}
              >
                {victory ? '🎮 CONTINUE' : '➡️ CONTINUE'}
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
                    setDamageNumbers([]);
                  }}
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-black px-10 py-5 text-2xl rounded-xl transform hover:scale-105 transition-all duration-200 shadow-[0_0_20px_rgba(255,100,0,0.3)]"
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

function BattleArenaScene({
  playerCharacters,
  activePlayerIndex,
  teamHealth,
  enemyHealth,
  comboCount,
  hitEffect,
  damageNumbers
}: {
  playerCharacters: Character[];
  activePlayerIndex: number;
  teamHealth: number[];
  enemyHealth: number;
  comboCount: number;
  hitEffect: { active: boolean; type: 'attack' | 'special' | 'damage'; position: [number, number, number] };
  damageNumbers: { id: number; value: number; position: [number, number, number] }[];
}) {
  return (
    <>
      {/* Enhanced Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.8}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[-10, 10, -10]} intensity={0.8} color="#ff6b6b" />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#4ecdc4" />
      <pointLight position={[0, 15, 0]} intensity={0.6} color="#ffd93d" />
      <spotLight
        position={[0, 20, 15]}
        angle={0.4}
        penumbra={0.5}
        intensity={1.2}
        color="#ffffff"
        castShadow
      />

      {/* Arena Floor - Enhanced */}
      <ArenaFloor comboCount={comboCount} />

      {/* Floating Arena Particles */}
      <Sparkles
        count={100}
        scale={[25, 15, 25]}
        size={3}
        speed={0.5}
        color="#4ecdc4"
        opacity={0.6}
      />
      <Sparkles
        count={50}
        scale={[20, 10, 20]}
        size={4}
        speed={0.3}
        color="#ff6b6b"
        opacity={0.4}
      />

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
      <FloatingPlatforms />
      <ArenaBarriers />

      {/* Hit Effects */}
      {hitEffect.active && (
        <HitEffect type={hitEffect.type} position={hitEffect.position} />
      )}

      {/* Floating Damage Numbers */}
      {damageNumbers.map((dn) => (
        <FloatingDamageNumber key={dn.id} value={dn.value} position={dn.position} />
      ))}
      
      {/* Post-Processing Effects */}
      <EffectComposer>
        <Bloom
          intensity={0.5}
          luminanceThreshold={0.7}
          luminanceSmoothing={0.9}
        />
        <Vignette eskil={false} offset={0.1} darkness={0.5} />
      </EffectComposer>
      
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

function ArenaFloor({ comboCount }: { comboCount: number }) {
  const gridIntensity = useMemo(() => Math.min(0.5 + comboCount * 0.05, 1.0), [comboCount]);
  
  return (
    <>
      {/* Main floor - metallic cyber surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial 
          color="#0a0a15"
          metalness={0.5}
          roughness={0.4}
        />
      </mesh>

      {/* Center battle platform - glowing */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.48, 0]}>
        <circleGeometry args={[10, 64]} />
        <meshStandardMaterial 
          color="#1a1a2e"
          emissive="#4ecdc4"
          emissiveIntensity={0.1 + comboCount * 0.01}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>

      {/* Glowing grid lines - enhanced with combo intensity */}
      {[...Array(15)].map((_, i) => (
        <group key={i}>
          <mesh position={[-21 + i * 3, -0.47, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.08, 40]} />
            <meshBasicMaterial color="#4ecdc4" transparent opacity={gridIntensity} />
          </mesh>
          <mesh position={[0, -0.47, -21 + i * 3]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[40, 0.08]} />
            <meshBasicMaterial color="#ff6b6b" transparent opacity={gridIntensity} />
          </mesh>
        </group>
      ))}

      {/* Corner accent lights */}
      {[
        [-12, -0.4, -12],
        [12, -0.4, -12],
        [-12, -0.4, 12],
        [12, -0.4, 12]
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.5, 16]} />
          <meshBasicMaterial 
            color={i % 2 === 0 ? '#ff6b6b' : '#4ecdc4'} 
            transparent 
            opacity={0.7} 
          />
        </mesh>
      ))}
    </>
  );
}

function FloatingPlatforms() {
  const platformPositions = useMemo(() => [
    { pos: [-10, 8, -8] as [number, number, number], scale: 2, color: '#ff6b6b' },
    { pos: [10, 6, -10] as [number, number, number], scale: 1.5, color: '#4ecdc4' },
    { pos: [12, 10, 5] as [number, number, number], scale: 1.8, color: '#a855f7' },
    { pos: [-12, 7, 8] as [number, number, number], scale: 1.3, color: '#ffd93d' },
  ], []);

  return (
    <>
      {platformPositions.map((platform, i) => (
        <Float key={i} speed={1.5 + i * 0.3} rotationIntensity={0.2} floatIntensity={0.5}>
          <mesh position={platform.pos}>
            <boxGeometry args={[platform.scale, 0.3, platform.scale]} />
            <meshStandardMaterial 
              color={platform.color}
              emissive={platform.color}
              emissiveIntensity={0.3}
              transparent
              opacity={0.8}
            />
          </mesh>
        </Float>
      ))}
    </>
  );
}

function ArenaBarriers() {
  const barrierData = useMemo(() => [
    { pos: [0, 3, -15] as [number, number, number], rot: [0, 0, 0] as [number, number, number], width: 30, color: '#4ecdc4' },
    { pos: [0, 3, 15] as [number, number, number], rot: [0, Math.PI, 0] as [number, number, number], width: 30, color: '#ff6b6b' },
    { pos: [-15, 3, 0] as [number, number, number], rot: [0, Math.PI / 2, 0] as [number, number, number], width: 30, color: '#a855f7' },
    { pos: [15, 3, 0] as [number, number, number], rot: [0, -Math.PI / 2, 0] as [number, number, number], width: 30, color: '#ffd93d' },
  ], []);

  return (
    <>
      {barrierData.map((barrier, i) => (
        <mesh key={i} position={barrier.pos} rotation={barrier.rot}>
          <planeGeometry args={[barrier.width, 6]} />
          <meshBasicMaterial 
            color={barrier.color}
            transparent
            opacity={0.15}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </>
  );
}

const ROLE_BODY_CONFIGS: Record<CharacterRole, {
  bodyWidth: number;
  bodyHeight: number;
  bodyDepth: number;
  headSize: number;
  armWidth: number;
  armHeight: number;
  legWidth: number;
  legHeight: number;
  scale: number;
}> = {
  'Tank': { bodyWidth: 1.4, bodyHeight: 1.8, bodyDepth: 1.2, headSize: 0.9, armWidth: 0.5, armHeight: 1.4, legWidth: 0.5, legHeight: 0.8, scale: 1.3 },
  'Vanguard': { bodyWidth: 1.2, bodyHeight: 1.6, bodyDepth: 0.9, headSize: 0.8, armWidth: 0.35, armHeight: 1.2, legWidth: 0.4, legHeight: 0.7, scale: 1.1 },
  'Blitzer': { bodyWidth: 0.8, bodyHeight: 1.4, bodyDepth: 0.6, headSize: 0.75, armWidth: 0.25, armHeight: 1.0, legWidth: 0.3, legHeight: 0.8, scale: 1.0 },
  'Mystic': { bodyWidth: 0.9, bodyHeight: 1.5, bodyDepth: 0.7, headSize: 0.9, armWidth: 0.25, armHeight: 1.1, legWidth: 0.3, legHeight: 0.7, scale: 1.0 },
  'Support': { bodyWidth: 1.0, bodyHeight: 1.4, bodyDepth: 0.8, headSize: 0.85, armWidth: 0.3, armHeight: 1.0, legWidth: 0.35, legHeight: 0.6, scale: 0.95 },
  'Wildcard': { bodyWidth: 1.0, bodyHeight: 1.5, bodyDepth: 0.8, headSize: 0.8, armWidth: 0.3, armHeight: 1.1, legWidth: 0.35, legHeight: 0.7, scale: 1.0 },
  'Sniper': { bodyWidth: 0.85, bodyHeight: 1.6, bodyDepth: 0.6, headSize: 0.7, armWidth: 0.25, armHeight: 1.3, legWidth: 0.3, legHeight: 0.9, scale: 1.05 },
  'Controller': { bodyWidth: 1.1, bodyHeight: 1.5, bodyDepth: 0.9, headSize: 0.85, armWidth: 0.3, armHeight: 1.1, legWidth: 0.35, legHeight: 0.7, scale: 1.0 },
};

const CHARACTER_FEATURES: Record<string, { headType: 'box' | 'sphere' | 'cone' | 'cylinder', accent?: string, special?: string }> = {
  'sonic': { headType: 'sphere', accent: '#0066ff', special: 'spikes' },
  'mario': { headType: 'box', accent: '#ff0000', special: 'hat' },
  'luigi': { headType: 'box', accent: '#00cc00', special: 'hat' },
  'link': { headType: 'box', accent: '#00ff00', special: 'hat' },
  'zelda': { headType: 'box', accent: '#ffdd00', special: 'crown' },
  'pikachu': { headType: 'sphere', accent: '#ffff00', special: 'ears' },
  'kirby': { headType: 'sphere', accent: '#ffaacc', special: 'blush' },
  'shadow': { headType: 'sphere', accent: '#ff0000', special: 'spikes' },
  'samus': { headType: 'sphere', accent: '#ff6600', special: 'visor' },
  'megaman': { headType: 'sphere', accent: '#00aaff', special: 'helmet' },
  'donkeykong': { headType: 'box', accent: '#8B4513', special: 'none' },
  'bowser': { headType: 'sphere', accent: '#228B22', special: 'spikes' },
  'fox': { headType: 'box', accent: '#ff8800', special: 'ears' },
  'captain_falcon': { headType: 'sphere', accent: '#ffdd00', special: 'visor' },
  'peach': { headType: 'box', accent: '#ffbbdd', special: 'crown' },
  'rosalina': { headType: 'box', accent: '#00ddff', special: 'crown' },
  'yoshi': { headType: 'sphere', accent: '#22cc22', special: 'nose' },
  'tails': { headType: 'sphere', accent: '#ffaa00', special: 'ears' },
  'knuckles': { headType: 'sphere', accent: '#ff0000', special: 'spikes' },
  'greninja': { headType: 'sphere', accent: '#0044ff', special: 'tongue' },
  'lucario': { headType: 'sphere', accent: '#0066cc', special: 'ears' },
  'mewtwo': { headType: 'sphere', accent: '#aa44ff', special: 'horns' },
  'ganondorf': { headType: 'box', accent: '#440000', special: 'none' },
  'marth': { headType: 'box', accent: '#0066ff', special: 'crown' },
  'ike': { headType: 'box', accent: '#0044aa', special: 'headband' },
  'palutena': { headType: 'box', accent: '#00ff88', special: 'crown' },
  'pit': { headType: 'box', accent: '#ffffff', special: 'crown' },
  'ridley': { headType: 'cone', accent: '#6600ff', special: 'horns' },
  'wario': { headType: 'box', accent: '#ffff00', special: 'hat' },
  'waluigi': { headType: 'box', accent: '#6600aa', special: 'hat' },
  'cloud': { headType: 'box', accent: '#0088ff', special: 'spikes' },
  'sephiroth': { headType: 'box', accent: '#cccccc', special: 'none' },
  'kratos': { headType: 'box', accent: '#ff0000', special: 'none' },
  'crash': { headType: 'sphere', accent: '#ff6600', special: 'ears' },
  'spyro': { headType: 'sphere', accent: '#aa00ff', special: 'horns' },
  'ryu': { headType: 'box', accent: '#ffffff', special: 'headband' },
  'ken': { headType: 'box', accent: '#ff0000', special: 'none' },
};

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
  const meshRef = useRef<THREE.Group>(null);
  const color = ROLE_COLORS[character.role];
  const bodyConfig = ROLE_BODY_CONFIGS[character.role];
  const features = CHARACTER_FEATURES[character.id] || { headType: 'box' };

  useFrame((state) => {
    if (meshRef.current) {
      if (isActive) {
        meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.15;
        meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 3) * 0.15;
        meshRef.current.scale.setScalar(bodyConfig.scale + Math.sin(state.clock.elapsedTime * 4) * 0.02);
      } else {
        meshRef.current.position.y = 0;
        meshRef.current.rotation.y = 0;
        meshRef.current.scale.setScalar(bodyConfig.scale * 0.9);
      }
    }
  });

  const headY = bodyConfig.bodyHeight + bodyConfig.headSize * 0.7;

  return (
    <group position={position}>
      <group ref={meshRef}>
        {/* Character body - Role-based shape */}
        <mesh castShadow position={[0, bodyConfig.bodyHeight / 2, 0]}>
          <boxGeometry args={[bodyConfig.bodyWidth, bodyConfig.bodyHeight, bodyConfig.bodyDepth]} />
          <meshStandardMaterial 
            color={health > 0 ? color : '#444444'}
            emissive={isActive ? color : '#000000'}
            emissiveIntensity={isActive ? 0.4 : 0}
            metalness={0.2}
            roughness={0.6}
          />
        </mesh>

        {/* Head - Based on character type */}
        <group position={[0, headY, 0]}>
          {features.headType === 'sphere' ? (
            <mesh castShadow>
              <sphereGeometry args={[bodyConfig.headSize * 0.6, 16, 16]} />
              <meshStandardMaterial 
                color={health > 0 ? (features.accent || '#ffd93d') : '#666666'}
                emissive={isActive ? (features.accent || '#ffd93d') : '#000000'}
                emissiveIntensity={isActive ? 0.2 : 0}
              />
            </mesh>
          ) : (
            <mesh castShadow>
              <boxGeometry args={[bodyConfig.headSize, bodyConfig.headSize, bodyConfig.headSize]} />
              <meshStandardMaterial 
                color={health > 0 ? '#ffd93d' : '#666666'}
                emissive={isActive ? '#ffd93d' : '#000000'}
                emissiveIntensity={isActive ? 0.2 : 0}
              />
            </mesh>
          )}
          
          {/* Special features */}
          {features.special === 'spikes' && (
            <>
              <mesh position={[0, bodyConfig.headSize * 0.4, -bodyConfig.headSize * 0.3]} rotation={[0.5, 0, 0]}>
                <coneGeometry args={[0.15, 0.5, 8]} />
                <meshStandardMaterial color={features.accent || color} />
              </mesh>
              <mesh position={[0.2, bodyConfig.headSize * 0.3, -bodyConfig.headSize * 0.25]} rotation={[0.3, 0.3, 0]}>
                <coneGeometry args={[0.12, 0.4, 8]} />
                <meshStandardMaterial color={features.accent || color} />
              </mesh>
              <mesh position={[-0.2, bodyConfig.headSize * 0.3, -bodyConfig.headSize * 0.25]} rotation={[0.3, -0.3, 0]}>
                <coneGeometry args={[0.12, 0.4, 8]} />
                <meshStandardMaterial color={features.accent || color} />
              </mesh>
            </>
          )}
          {features.special === 'hat' && (
            <mesh position={[0, bodyConfig.headSize * 0.5, 0]}>
              <cylinderGeometry args={[bodyConfig.headSize * 0.5, bodyConfig.headSize * 0.6, 0.3, 16]} />
              <meshStandardMaterial color={features.accent || '#ff0000'} />
            </mesh>
          )}
          {features.special === 'ears' && (
            <>
              <mesh position={[-0.25, bodyConfig.headSize * 0.5, 0]} rotation={[0, 0, -0.3]}>
                <coneGeometry args={[0.15, 0.5, 8]} />
                <meshStandardMaterial color="#ffff00" />
              </mesh>
              <mesh position={[0.25, bodyConfig.headSize * 0.5, 0]} rotation={[0, 0, 0.3]}>
                <coneGeometry args={[0.15, 0.5, 8]} />
                <meshStandardMaterial color="#ffff00" />
              </mesh>
            </>
          )}
          {features.special === 'visor' && (
            <mesh position={[0, 0, bodyConfig.headSize * 0.35]}>
              <boxGeometry args={[bodyConfig.headSize * 0.8, bodyConfig.headSize * 0.3, 0.1]} />
              <meshStandardMaterial color="#00ffff" transparent opacity={0.7} />
            </mesh>
          )}
          {features.special === 'crown' && (
            <>
              <mesh position={[0, bodyConfig.headSize * 0.55, 0]}>
                <cylinderGeometry args={[bodyConfig.headSize * 0.4, bodyConfig.headSize * 0.35, 0.2, 8]} />
                <meshStandardMaterial color="#ffd700" metalness={0.8} roughness={0.2} />
              </mesh>
              {[0, 1, 2, 3, 4].map((i) => (
                <mesh key={i} position={[
                  Math.sin((i / 5) * Math.PI * 2) * bodyConfig.headSize * 0.35,
                  bodyConfig.headSize * 0.7,
                  Math.cos((i / 5) * Math.PI * 2) * bodyConfig.headSize * 0.35
                ]}>
                  <coneGeometry args={[0.05, 0.15, 6]} />
                  <meshStandardMaterial color="#ffd700" metalness={0.8} />
                </mesh>
              ))}
            </>
          )}
          {features.special === 'horns' && (
            <>
              <mesh position={[-0.25, bodyConfig.headSize * 0.5, 0]} rotation={[0, 0, -0.5]}>
                <coneGeometry args={[0.08, 0.4, 8]} />
                <meshStandardMaterial color={features.accent || '#444444'} />
              </mesh>
              <mesh position={[0.25, bodyConfig.headSize * 0.5, 0]} rotation={[0, 0, 0.5]}>
                <coneGeometry args={[0.08, 0.4, 8]} />
                <meshStandardMaterial color={features.accent || '#444444'} />
              </mesh>
            </>
          )}
          {features.special === 'headband' && (
            <mesh position={[0, bodyConfig.headSize * 0.2, 0]}>
              <torusGeometry args={[bodyConfig.headSize * 0.52, 0.05, 8, 32]} />
              <meshStandardMaterial color={features.accent || '#ff0000'} />
            </mesh>
          )}
          {features.special === 'helmet' && (
            <mesh position={[0, bodyConfig.headSize * 0.1, 0]}>
              <sphereGeometry args={[bodyConfig.headSize * 0.65, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color={features.accent || '#00aaff'} metalness={0.6} roughness={0.3} />
            </mesh>
          )}
          {features.special === 'blush' && (
            <>
              <mesh position={[-0.2, -bodyConfig.headSize * 0.1, bodyConfig.headSize * 0.35]}>
                <circleGeometry args={[0.1, 16]} />
                <meshBasicMaterial color="#ff6699" />
              </mesh>
              <mesh position={[0.2, -bodyConfig.headSize * 0.1, bodyConfig.headSize * 0.35]}>
                <circleGeometry args={[0.1, 16]} />
                <meshBasicMaterial color="#ff6699" />
              </mesh>
            </>
          )}
          {features.special === 'nose' && (
            <mesh position={[0, -bodyConfig.headSize * 0.1, bodyConfig.headSize * 0.4]}>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshStandardMaterial color="#cc0000" />
            </mesh>
          )}
          {features.special === 'tongue' && (
            <mesh position={[0, -bodyConfig.headSize * 0.4, bodyConfig.headSize * 0.3]} rotation={[0.3, 0, 0]}>
              <boxGeometry args={[0.15, 0.3, 0.05]} />
              <meshStandardMaterial color="#ff4488" />
            </mesh>
          )}
        </group>

        {/* Arms - Role-sized */}
        <mesh castShadow position={[-(bodyConfig.bodyWidth / 2 + bodyConfig.armWidth / 2), bodyConfig.bodyHeight / 2, 0]}>
          <boxGeometry args={[bodyConfig.armWidth, bodyConfig.armHeight, bodyConfig.armWidth]} />
          <meshStandardMaterial color={health > 0 ? color : '#444444'} />
        </mesh>
        <mesh castShadow position={[(bodyConfig.bodyWidth / 2 + bodyConfig.armWidth / 2), bodyConfig.bodyHeight / 2, 0]}>
          <boxGeometry args={[bodyConfig.armWidth, bodyConfig.armHeight, bodyConfig.armWidth]} />
          <meshStandardMaterial color={health > 0 ? color : '#444444'} />
        </mesh>

        {/* Legs - Role-sized */}
        <mesh castShadow position={[-bodyConfig.legWidth * 0.7, -0.1, 0]}>
          <boxGeometry args={[bodyConfig.legWidth, bodyConfig.legHeight, bodyConfig.legWidth]} />
          <meshStandardMaterial color="#2d3436" />
        </mesh>
        <mesh castShadow position={[bodyConfig.legWidth * 0.7, -0.1, 0]}>
          <boxGeometry args={[bodyConfig.legWidth, bodyConfig.legHeight, bodyConfig.legWidth]} />
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
          position={[0, headY + 0.8, 0]}
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
  const bodyRef = useRef<THREE.Group>(null);
  const auraRef = useRef<THREE.Mesh>(null);
  const isEnraged = health <= 30;

  useFrame((state) => {
    if (bodyRef.current) {
      bodyRef.current.rotation.y = Math.sin(state.clock.elapsedTime * (isEnraged ? 3 : 1.5)) * 0.2;
      bodyRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.15;
    }
    if (auraRef.current) {
      auraRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 4) * 0.1);
      (auraRef.current.material as THREE.MeshBasicMaterial).opacity = 
        isEnraged ? 0.3 + Math.sin(state.clock.elapsedTime * 6) * 0.15 : 0.1;
    }
  });

  const bodyColor = health > 60 ? '#e74c3c' : health > 30 ? '#f39c12' : '#9b59b6';
  const emissiveIntensity = isEnraged ? 0.5 : 0.2;

  return (
    <group position={position}>
      <group ref={bodyRef}>
        {/* Enemy body - larger, menacing boss */}
        <mesh castShadow position={[0, 1.8, 0]}>
          <boxGeometry args={[1.8, 2.5, 1.2]} />
          <meshStandardMaterial 
            color={bodyColor}
            emissive={bodyColor}
            emissiveIntensity={emissiveIntensity}
            metalness={0.4}
            roughness={0.5}
          />
        </mesh>

        {/* Shoulder armor */}
        <mesh castShadow position={[-1.2, 2.5, 0]}>
          <boxGeometry args={[0.6, 0.5, 0.8]} />
          <meshStandardMaterial color="#8b0000" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh castShadow position={[1.2, 2.5, 0]}>
          <boxGeometry args={[0.6, 0.5, 0.8]} />
          <meshStandardMaterial color="#8b0000" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Enemy head - angular evil */}
        <mesh castShadow position={[0, 3.5, 0]}>
          <boxGeometry args={[1.2, 1.2, 1.1]} />
          <meshStandardMaterial 
            color="#1a1a2e"
            emissive={isEnraged ? '#ff0000' : '#000000'}
            emissiveIntensity={isEnraged ? 0.3 : 0}
          />
        </mesh>

        {/* Evil horns */}
        <mesh castShadow position={[-0.4, 4.2, 0]} rotation={[0, 0, -0.4]}>
          <coneGeometry args={[0.15, 0.6, 8]} />
          <meshStandardMaterial color="#2c3e50" metalness={0.5} />
        </mesh>
        <mesh castShadow position={[0.4, 4.2, 0]} rotation={[0, 0, 0.4]}>
          <coneGeometry args={[0.15, 0.6, 8]} />
          <meshStandardMaterial color="#2c3e50" metalness={0.5} />
        </mesh>

        {/* Evil glowing eyes */}
        <mesh position={[-0.3, 3.6, 0.56]}>
          <boxGeometry args={[0.25, 0.12, 0.02]} />
          <meshBasicMaterial color={isEnraged ? '#ff0000' : '#ff6600'} />
        </mesh>
        <mesh position={[0.3, 3.6, 0.56]}>
          <boxGeometry args={[0.25, 0.12, 0.02]} />
          <meshBasicMaterial color={isEnraged ? '#ff0000' : '#ff6600'} />
        </mesh>

        {/* Evil grin */}
        <mesh position={[0, 3.2, 0.56]}>
          <boxGeometry args={[0.5, 0.08, 0.02]} />
          <meshBasicMaterial color="#000000" />
        </mesh>

        {/* Massive arms */}
        <mesh castShadow position={[-1.3, 1.5, 0]}>
          <boxGeometry args={[0.6, 1.8, 0.5]} />
          <meshStandardMaterial color="#8b0000" metalness={0.3} />
        </mesh>
        <mesh castShadow position={[1.3, 1.5, 0]}>
          <boxGeometry args={[0.6, 1.8, 0.5]} />
          <meshStandardMaterial color="#8b0000" metalness={0.3} />
        </mesh>

        {/* Fists */}
        <mesh castShadow position={[-1.3, 0.4, 0]}>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>
        <mesh castShadow position={[1.3, 0.4, 0]}>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>

        {/* Legs */}
        <mesh castShadow position={[-0.5, -0.2, 0]}>
          <boxGeometry args={[0.6, 1.2, 0.6]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>
        <mesh castShadow position={[0.5, -0.2, 0]}>
          <boxGeometry args={[0.6, 1.2, 0.6]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>
      </group>

      {/* Danger aura - pulsing */}
      <mesh ref={auraRef} position={[0, 1.8, 0]}>
        <sphereGeometry args={[3, 24, 24]} />
        <meshBasicMaterial 
          color={isEnraged ? '#ff0000' : '#ff4400'} 
          transparent 
          opacity={0.1} 
        />
      </mesh>

      {/* Health-based particle effects */}
      {isEnraged && (
        <Sparkles
          count={30}
          scale={[3, 4, 3]}
          size={5}
          speed={2}
          color="#ff0000"
          position={[0, 2, 0]}
        />
      )}

      {/* Boss label */}
      <Text
        position={[0, 5, 0]}
        fontSize={0.5}
        color={isEnraged ? '#ff0000' : '#ff4444'}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="black"
      >
        {isEnraged ? '⚠ ENRAGED ⚠' : 'BOSS'}
      </Text>

      {/* Health bar above boss */}
      <group position={[0, 5.5, 0]}>
        <mesh>
          <planeGeometry args={[3, 0.3]} />
          <meshBasicMaterial color="#333333" />
        </mesh>
        <mesh position={[-(3 - health * 0.03) / 2, 0, 0.01]}>
          <planeGeometry args={[health * 0.03, 0.25]} />
          <meshBasicMaterial color={health > 50 ? '#22c55e' : health > 25 ? '#f59e0b' : '#ef4444'} />
        </mesh>
      </group>
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

function HitEffect({ type, position }: { type: 'attack' | 'special' | 'damage'; position: [number, number, number] }) {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.elapsedTime * 10;
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 20) * 0.3);
    }
  });

  const color = type === 'special' ? '#ffd93d' : type === 'attack' ? '#ff6b6b' : '#4ecdc4';
  const scale = type === 'special' ? 2.5 : 1.5;

  return (
    <group ref={meshRef} position={position}>
      {type === 'special' ? (
        <>
          <Sparkles
            count={50}
            scale={4}
            size={8}
            speed={3}
            color={color}
          />
          <mesh>
            <sphereGeometry args={[scale, 16, 16]} />
            <meshBasicMaterial color={color} transparent opacity={0.6} />
          </mesh>
          <mesh rotation={[0, 0, 0]}>
            <ringGeometry args={[scale * 0.8, scale * 1.2, 32]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
          </mesh>
        </>
      ) : (
        <>
          <Sparkles
            count={20}
            scale={2}
            size={5}
            speed={4}
            color={color}
          />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <mesh key={i} rotation={[0, 0, (i / 6) * Math.PI * 2]}>
              <planeGeometry args={[0.3, 1.5]} />
              <meshBasicMaterial color={color} transparent opacity={0.8} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}

function FloatingDamageNumber({ value, position }: { value: number; position: [number, number, number] }) {
  const meshRef = useRef<THREE.Group>(null);
  const startY = useRef(position[1]);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.position.y += delta * 2;
      const age = meshRef.current.position.y - startY.current;
      meshRef.current.scale.setScalar(Math.max(0, 1 - age * 0.3));
    }
  });

  const isCritical = value >= 30;
  const color = isCritical ? '#ffd93d' : '#ffffff';
  const fontSize = isCritical ? 0.6 : 0.4;

  return (
    <group ref={meshRef} position={position}>
      <Text
        fontSize={fontSize}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.04}
        outlineColor={isCritical ? '#ff0000' : '#000000'}
      >
        {isCritical ? `⚡${value}⚡` : `-${value}`}
      </Text>
    </group>
  );
}

/**
 * LEGENDS OF KAI-JAX: THE MEMORY KING
 * 3D Combat Arena - Studio Quality Graphics
 * 
 * WebGL with ACES tone mapping, PBR materials, and post-processing
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Renderer3D from './graphics/components/Renderer3D';
import Fighter3D from './graphics/components/Fighter3D';
import Arena3D from './graphics/components/Arena3D';
import HitEffectsManager from './graphics/components/HitEffects3D';
import HUD3D from './graphics/components/HUD3D';
import useGraphicsStore from './graphics/stores/graphicsStore';
import { GAME_CONFIG, GAME_STATES, InputBuffer } from './engine/GameEngine';
import { TAIL_DATA, TAIL_MOVES } from './entities/KaiJax';
import { ENEMY_TYPES, AI_STATES } from './entities/Enemy';

// Game State Manager Component
const GameStateManager = ({ children, onStateChange }) => {
  const [gameState, setGameState] = useState({
    player: {
      x: -4,
      y: 0,
      z: 0,
      health: 100,
      maxHealth: 100,
      state: GAME_STATES.IDLE,
      facing: 1,
      vx: 0,
      vy: 0,
      tailMeter: 50,
      activeTail: 'ember',
      tails: ['ember', 'gale', 'shade'],
      synergy: 0,
      resonance: 0,
      dread: 0,
      comboCount: 0,
      stunFrames: 0,
      attackFrame: 0,
      currentMove: null,
      damageFlash: 0,
      blockFlash: 0,
    },
    enemy: {
      x: 4,
      y: 0,
      z: 0,
      health: 80,
      maxHealth: 80,
      state: AI_STATES.OBSERVE,
      facing: -1,
      vx: 0,
      vy: 0,
      type: 'iterator',
      name: 'Iterator',
      adaptationLevel: 0,
      aiState: AI_STATES.OBSERVE,
      damageFlash: 0,
      blockFlash: 0,
    },
    hitEffects: [],
    frameCount: 0,
    paused: false,
    gameOver: null,
  });
  
  const inputBuffer = useRef(new InputBuffer());
  const keysRef = useRef({});
  const lastUpdateRef = useRef(Date.now());
  const triggerHitStop = useGraphicsStore(s => s.triggerHitStop);
  
  // Input handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!keysRef.current[e.code]) {
        keysRef.current[e.code] = true;
        inputBuffer.current.add({ action: e.code, type: 'press' });
      }
    };
    
    const handleKeyUp = (e) => {
      keysRef.current[e.code] = false;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  
  // Game loop
  useEffect(() => {
    if (gameState.paused || gameState.gameOver) return;
    
    const gameLoop = setInterval(() => {
      setGameState(prev => {
        const keys = keysRef.current;
        const newState = { ...prev };
        newState.frameCount++;
        
        // Process player
        const player = { ...prev.player };
        
        // Decay flashes
        player.damageFlash = Math.max(0, player.damageFlash - 0.1);
        player.blockFlash = Math.max(0, player.blockFlash - 0.1);
        
        // Process stun
        if (player.stunFrames > 0) {
          player.stunFrames--;
          if (player.stunFrames === 0) {
            player.state = GAME_STATES.IDLE;
          }
        } else if (player.state !== GAME_STATES.ATTACKING) {
          // Movement
          let moveX = 0;
          if (keys['KeyA'] || keys['ArrowLeft']) moveX = -1;
          if (keys['KeyD'] || keys['ArrowRight']) moveX = 1;
          
          if (moveX !== 0) {
            player.facing = moveX;
            const speed = keys['ShiftLeft'] ? 0.15 : 0.08;
            player.x += moveX * speed;
            player.x = Math.max(-12, Math.min(12, player.x));
            player.state = keys['ShiftLeft'] ? GAME_STATES.RUNNING : GAME_STATES.WALKING;
          } else {
            player.state = GAME_STATES.IDLE;
          }
          
          // Jump
          if ((keys['Space'] || keys['KeyW']) && player.y === 0) {
            player.vy = 0.4;
          }
          
          // Block
          if (keys['KeyS']) {
            player.state = GAME_STATES.BLOCKING;
          }
          
          // Light Attack
          if (keys['KeyJ'] && player.state !== GAME_STATES.ATTACKING) {
            player.state = GAME_STATES.ATTACKING;
            player.currentMove = 'lightAttack';
            player.attackFrame = 0;
            keys['KeyJ'] = false;
          }
          
          // Heavy Attack
          if (keys['KeyK'] && player.state !== GAME_STATES.ATTACKING) {
            player.state = GAME_STATES.ATTACKING;
            player.currentMove = 'heavyAttack';
            player.attackFrame = 0;
            keys['KeyK'] = false;
          }
          
          // Tail Ability
          if (keys['KeyL'] && player.tailMeter >= 20) {
            player.state = GAME_STATES.ATTACKING;
            player.currentMove = 'tailAbility';
            player.attackFrame = 0;
            player.tailMeter -= 20;
            keys['KeyL'] = false;
          }
          
          // Switch Tail
          if (keys['KeyQ']) {
            const idx = player.tails.indexOf(player.activeTail);
            player.activeTail = player.tails[(idx - 1 + player.tails.length) % player.tails.length];
            keys['KeyQ'] = false;
          }
          if (keys['KeyR']) {
            const idx = player.tails.indexOf(player.activeTail);
            player.activeTail = player.tails[(idx + 1) % player.tails.length];
            keys['KeyR'] = false;
          }
        }
        
        // Attack processing
        if (player.state === GAME_STATES.ATTACKING) {
          player.attackFrame++;
          
          const moveData = {
            lightAttack: { startup: 4, active: 3, recovery: 8, damage: 8 },
            heavyAttack: { startup: 10, active: 5, recovery: 18, damage: 18 },
            tailAbility: { startup: 8, active: 6, recovery: 20, damage: 22 },
          }[player.currentMove];
          
          if (moveData) {
            const totalFrames = moveData.startup + moveData.active + moveData.recovery;
            
            // Check for hit during active frames
            if (player.attackFrame >= moveData.startup && 
                player.attackFrame < moveData.startup + moveData.active) {
              const distance = Math.abs(player.x - prev.enemy.x);
              
              if (distance < 2.5 && prev.enemy.health > 0) {
                const enemy = { ...prev.enemy };
                const blocked = enemy.state === GAME_STATES.BLOCKING || Math.random() < 0.3;
                
                if (blocked) {
                  enemy.blockFlash = 1;
                  enemy.stunFrames = 10;
                  player.comboCount = 0;
                  triggerHitStop(0.5);
                  newState.hitEffects = [...prev.hitEffects, {
                    position: [(player.x + enemy.x) / 2, 1.5, 0],
                    type: 'light',
                    color: '#64D2FF',
                  }];
                } else {
                  enemy.health -= moveData.damage;
                  enemy.damageFlash = 1;
                  enemy.stunFrames = 20;
                  enemy.x += player.facing * 0.5;
                  player.comboCount++;
                  player.synergy += 5;
                  player.tailMeter = Math.min(100, player.tailMeter + 8);
                  triggerHitStop(1);
                  newState.hitEffects = [...prev.hitEffects, {
                    position: [(player.x + enemy.x) / 2, 1.5, 0],
                    type: player.currentMove === 'heavyAttack' ? 'heavy' : 'medium',
                  }];
                }
                
                // Only hit once per attack
                player.attackFrame = moveData.startup + moveData.active;
                newState.enemy = enemy;
              }
            }
            
            // End attack
            if (player.attackFrame >= totalFrames) {
              player.state = GAME_STATES.IDLE;
              player.currentMove = null;
              player.attackFrame = 0;
            }
          }
        }
        
        // Gravity
        if (player.y > 0 || player.vy > 0) {
          player.vy -= 0.025;
          player.y += player.vy;
          if (player.y <= 0) {
            player.y = 0;
            player.vy = 0;
          }
        }
        
        // Regenerate tail meter
        player.tailMeter = Math.min(100, player.tailMeter + 0.05);
        
        newState.player = player;
        
        // Enemy AI (simplified)
        const enemy = { ...newState.enemy };
        enemy.damageFlash = Math.max(0, enemy.damageFlash - 0.1);
        enemy.blockFlash = Math.max(0, enemy.blockFlash - 0.1);
        
        if (enemy.stunFrames > 0) {
          enemy.stunFrames--;
        } else if (enemy.health > 0) {
          const distX = player.x - enemy.x;
          enemy.facing = distX > 0 ? 1 : -1;
          
          // Simple AI movement
          const distance = Math.abs(distX);
          if (distance > 3) {
            enemy.x += enemy.facing * 0.03;
          } else if (distance < 1.5) {
            enemy.x -= enemy.facing * 0.02;
          }
          
          // Random attack
          if (distance < 2.5 && Math.random() < 0.02) {
            enemy.state = GAME_STATES.ATTACKING;
            // Check if hits player
            if (player.state !== GAME_STATES.BLOCKING && Math.random() < 0.5) {
              const newPlayer = { ...newState.player };
              newPlayer.health -= 10;
              newPlayer.damageFlash = 1;
              newPlayer.stunFrames = 15;
              newPlayer.comboCount = 0;
              newState.player = newPlayer;
              triggerHitStop(0.8);
              newState.hitEffects = [...newState.hitEffects, {
                position: [(player.x + enemy.x) / 2, 1.5, 0],
                type: 'medium',
                color: '#FF3B30',
              }];
            } else if (player.state === GAME_STATES.BLOCKING) {
              const newPlayer = { ...newState.player };
              newPlayer.blockFlash = 1;
              newState.player = newPlayer;
              triggerHitStop(0.4);
            }
          }
        }
        
        newState.enemy = enemy;
        
        // Check game over
        if (newState.player.health <= 0) {
          newState.gameOver = 'defeat';
        } else if (newState.enemy.health <= 0) {
          newState.gameOver = 'victory';
        }
        
        return newState;
      });
    }, 1000 / 60);
    
    return () => clearInterval(gameLoop);
  }, [gameState.paused, gameState.gameOver, triggerHitStop]);
  
  // Notify parent of state changes
  useEffect(() => {
    onStateChange?.(gameState);
  }, [gameState, onStateChange]);
  
  // Pause handling
  useEffect(() => {
    const handlePause = (e) => {
      if (e.code === 'Escape') {
        setGameState(prev => ({ ...prev, paused: !prev.paused }));
      }
    };
    window.addEventListener('keydown', handlePause);
    return () => window.removeEventListener('keydown', handlePause);
  }, []);
  
  return children(gameState, setGameState);
};

// Camera Controller
const CameraController = ({ playerX, enemyX }) => {
  const cameraRef = useRef();
  
  useFrame(({ camera }) => {
    // Follow midpoint between player and enemy
    const midX = (playerX + enemyX) / 2;
    const targetX = THREE.MathUtils.lerp(camera.position.x, midX * 0.3, 0.05);
    camera.position.x = targetX;
    camera.lookAt(midX * 0.5, 2, 0);
  });
  
  return null;
};

// Main 3D Combat Arena
const CombatArena3D = ({ onExit }) => {
  const [gameState, setGameState] = useState(null);
  const setPreset = useGraphicsStore(s => s.setPreset);
  const setColorBlindMode = useGraphicsStore(s => s.setColorBlindMode);
  const currentPreset = useGraphicsStore(s => s.currentPreset);
  
  // Restart game
  const restartGame = useCallback(() => {
    window.location.reload(); // Simple restart for now
  }, []);
  
  return (
    <div className="w-full h-screen bg-black relative">
      {/* Settings Panel */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        <select
          value={currentPreset}
          onChange={(e) => setPreset(e.target.value)}
          className="bg-black/80 text-white text-xs px-2 py-1 rounded border border-white/20"
        >
          <option value="ultra">Ultra</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <button
          onClick={onExit}
          className="bg-black/80 text-white text-xs px-3 py-1 rounded border border-white/20 hover:border-primary"
        >
          EXIT
        </button>
      </div>
      
      <GameStateManager onStateChange={setGameState}>
        {(state, setState) => (
          <>
            <Renderer3D cameraPosition={[0, 4, 12]}>
              {/* Arena Environment */}
              <Arena3D />
              
              {/* Player Character */}
              <Fighter3D
                position={[state.player.x, state.player.y, state.player.z]}
                type="player"
                state={state.player.state}
                facing={state.player.facing}
                health={state.player.health}
                maxHealth={state.player.maxHealth}
                damageFlash={state.player.damageFlash}
                blockFlash={state.player.blockFlash}
                tails={state.player.tails}
                activeTail={state.player.tails.indexOf(state.player.activeTail)}
                phase={state.frameCount / 60}
              />
              
              {/* Enemy Character */}
              <Fighter3D
                position={[state.enemy.x, state.enemy.y, state.enemy.z]}
                type="enemy"
                state={state.enemy.state}
                facing={state.enemy.facing}
                health={state.enemy.health}
                maxHealth={state.enemy.maxHealth}
                damageFlash={state.enemy.damageFlash}
                blockFlash={state.enemy.blockFlash}
                tails={[]}
                phase={state.frameCount / 60}
              />
              
              {/* Hit Effects */}
              <HitEffectsManager effects={state.hitEffects} />
              
              {/* Camera Follow */}
              <CameraController
                playerX={state.player.x}
                enemyX={state.enemy.x}
              />
            </Renderer3D>
            
            {/* HUD Overlay */}
            <HUD3D
              player={state.player}
              enemy={{ ...state.enemy, name: ENEMY_TYPES[state.enemy.type]?.name || 'Iterator' }}
              activeTail={state.player.activeTail}
              tailMeter={state.player.tailMeter}
              comboCount={state.player.comboCount}
              memoryMeters={{
                synergy: state.player.synergy,
                resonance: state.player.resonance,
                dread: state.player.dread,
              }}
            />
            
            {/* Pause Overlay */}
            {state.paused && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-40">
                <div className="text-center">
                  <h2 className="font-heading text-5xl text-primary mb-6">PAUSED</h2>
                  <p className="text-white/60 mb-8">Press ESC to resume</p>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => setState(prev => ({ ...prev, paused: false }))}
                      className="btn-cyber"
                    >
                      Resume
                    </button>
                    <button onClick={restartGame} className="btn-cyber border-fire/50">
                      Restart
                    </button>
                    <button onClick={onExit} className="btn-cyber border-white/30">
                      Exit
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Victory/Defeat Overlay */}
            {state.gameOver && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-40">
                <div className="text-center">
                  <h2 className={`font-heading text-6xl mb-4 ${
                    state.gameOver === 'victory' ? 'text-primary' : 'text-fire'
                  }`}>
                    {state.gameOver === 'victory' ? 'VICTORY' : 'DEFEATED'}
                  </h2>
                  <p className="font-lore text-xl text-white/60 mb-8">
                    {state.gameOver === 'victory' 
                      ? '"Memory refuses erasure."' 
                      : '"Design beats habit..."'
                    }
                  </p>
                  <div className="flex gap-4 justify-center">
                    <button onClick={restartGame} className="btn-cyber">
                      {state.gameOver === 'victory' ? 'Next Round' : 'Try Again'}
                    </button>
                    <button onClick={onExit} className="btn-cyber border-white/30">
                      Exit
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </GameStateManager>
      
      {/* Controls Help */}
      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur rounded-lg p-4 z-30">
        <h3 className="font-heading text-primary text-sm mb-2">CONTROLS</h3>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-white/70">
          <div>A/D - Move</div>
          <div>Space - Jump</div>
          <div>J/K - Attack</div>
          <div>L - Tail Ability</div>
          <div>Q/R - Switch Tail</div>
          <div>S - Block</div>
          <div>ESC - Pause</div>
          <div>F3 - Perf HUD</div>
        </div>
      </div>
    </div>
  );
};

export default CombatArena3D;

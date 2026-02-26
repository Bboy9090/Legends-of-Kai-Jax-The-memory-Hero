/**
 * LEGENDS OF KAI-JAX: THE MEMORY KING
 * Combat Arena - Playable Game Component
 * 
 * "Survival without memory is extinction with better design."
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import GameEngine, { GAME_CONFIG } from './engine/GameEngine';
import KaiJax, { TAIL_DATA } from './entities/KaiJax';
import Enemy, { ENEMY_TYPES } from './entities/Enemy';

const CombatArena = ({ onExit }) => {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const [gameState, setGameState] = useState('ready'); // ready, playing, paused, victory, defeat
  const [playerHealth, setPlayerHealth] = useState(100);
  const [enemyHealth, setEnemyHealth] = useState(80);
  const [tailMeter, setTailMeter] = useState(0);
  const [activeTail, setActiveTail] = useState('ember');
  const [comboCount, setComboCount] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [debugMode, setDebugMode] = useState(false);
  const [enemyType, setEnemyType] = useState('iterator');
  const [round, setRound] = useState(1);

  // Initialize game
  const initGame = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = GAME_CONFIG.CANVAS_WIDTH;
    canvas.height = GAME_CONFIG.CANVAS_HEIGHT;

    // Create engine
    const engine = new GameEngine(canvas);
    engine.debug = debugMode;
    engineRef.current = engine;

    // Create player
    const player = new KaiJax(200, GAME_CONFIG.GROUND_Y - 120);
    engine.addEntity(player);

    // Create enemy
    const enemy = new Enemy(900, GAME_CONFIG.GROUND_Y - 130, enemyType);
    enemy.setTarget(player);
    engine.addEntity(enemy);

    // Custom HUD render
    engine.renderHUD = () => renderHUD(engine.ctx, player, enemy);

    // Start engine
    engine.start();
    setGameState('playing');

    // Update React state periodically
    const updateInterval = setInterval(() => {
      if (player && enemy) {
        setPlayerHealth(player.health);
        setEnemyHealth(enemy.health);
        setTailMeter(player.tailMeter);
        setActiveTail(player.activeTail);
        setComboCount(player.comboCount);

        // Check win/lose conditions
        if (player.health <= 0) {
          setGameState('defeat');
          engine.paused = true;
        } else if (enemy.health <= 0) {
          setGameState('victory');
          engine.paused = true;
        }
      }
    }, 100);

    return () => {
      clearInterval(updateInterval);
      engine.stop();
    };
  }, [debugMode, enemyType]);

  // Render HUD on canvas
  const renderHUD = (ctx, player, enemy) => {
    const width = GAME_CONFIG.CANVAS_WIDTH;
    const height = GAME_CONFIG.CANVAS_HEIGHT;

    // Health bars
    renderHealthBar(ctx, 50, 30, 300, 20, player.health, player.maxHealth, '#30D158', 'KAI-JAX');
    renderHealthBar(ctx, width - 350, 30, 300, 20, enemy.health, enemy.maxHealth, '#FF3B30', enemy.name);

    // Tail meter
    renderTailMeter(ctx, 50, 60, 200, 12, player.tailMeter, player.maxTailMeter, TAIL_DATA[player.activeTail]?.color || '#FFD60A');

    // Active tail display
    renderActiveTail(ctx, 50, 85, player.activeTail);

    // Combo counter
    if (player.comboCount > 1) {
      renderCombo(ctx, width / 2, 150, player.comboCount);
    }

    // Frame counter (debug)
    if (engineRef.current?.debug) {
      ctx.fillStyle = '#fff';
      ctx.font = '12px monospace';
      ctx.fillText(`Frame: ${engineRef.current.frameCount}`, width - 100, height - 20);
    }

    // Memory meters
    renderMemoryMeters(ctx, width - 180, 70, player);
  };

  const renderHealthBar = (ctx, x, y, width, height, current, max, color, label) => {
    // Background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(x, y, width, height);

    // Health
    const percent = Math.max(0, current / max);
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.fillRect(x, y, width * percent, height);
    ctx.shadowBlur = 0;

    // Border
    ctx.strokeStyle = '#fff3';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);

    // Label
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Rajdhani, sans-serif';
    ctx.fillText(label, x, y - 5);

    // Value
    ctx.fillStyle = '#fff8';
    ctx.font = '12px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.ceil(current)}/${max}`, x + width, y - 5);
    ctx.textAlign = 'left';
  };

  const renderTailMeter = (ctx, x, y, width, height, current, max, color) => {
    // Background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(x, y, width, height);

    // Meter
    const percent = current / max;
    const gradient = ctx.createLinearGradient(x, y, x + width * percent, y);
    gradient.addColorStop(0, color + '88');
    gradient.addColorStop(1, color);
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width * percent, height);

    // Segments
    ctx.strokeStyle = '#0005';
    for (let i = 1; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(x + (width / 5) * i, y);
      ctx.lineTo(x + (width / 5) * i, y + height);
      ctx.stroke();
    }

    // Label
    ctx.fillStyle = '#fff8';
    ctx.font = '10px Rajdhani, sans-serif';
    ctx.fillText('TAIL ENERGY', x, y - 3);
  };

  const renderActiveTail = (ctx, x, y, tailKey) => {
    const tail = TAIL_DATA[tailKey];
    if (!tail) return;

    // Tail icon
    ctx.fillStyle = tail.color;
    ctx.shadowColor = tail.color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(x + 10, y + 10, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Name
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Rajdhani, sans-serif';
    ctx.fillText(tail.name.toUpperCase(), x + 25, y + 14);

    // Element
    ctx.fillStyle = '#fff6';
    ctx.font = '10px Rajdhani, sans-serif';
    ctx.fillText(tail.element, x + 25, y + 26);
  };

  const renderCombo = (ctx, x, y, count) => {
    ctx.save();
    ctx.textAlign = 'center';
    
    // Glow
    ctx.shadowColor = '#FFD60A';
    ctx.shadowBlur = 20;
    
    // Count
    ctx.fillStyle = '#FFD60A';
    ctx.font = 'bold 48px Unbounded, sans-serif';
    ctx.fillText(count, x, y);
    
    // Label
    ctx.font = '16px Rajdhani, sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText('COMBO', x, y + 25);
    
    ctx.restore();
  };

  const renderMemoryMeters = (ctx, x, y, player) => {
    const meters = [
      { name: 'SYN', value: player.synergy || 0, color: '#30D158' },
      { name: 'RES', value: player.resonance || 0, color: '#64D2FF' },
      { name: 'DRD', value: player.dread || 0, color: '#BF5AF2' },
    ];

    ctx.font = '10px Rajdhani, sans-serif';
    
    meters.forEach((meter, i) => {
      const my = y + i * 22;
      
      // Label
      ctx.fillStyle = '#fff8';
      ctx.fillText(meter.name, x, my);
      
      // Bar
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(x + 30, my - 8, 100, 10);
      
      ctx.fillStyle = meter.color;
      ctx.fillRect(x + 30, my - 8, Math.min(100, meter.value), 10);
    });
  };

  // Handle game restart
  const restartGame = () => {
    if (engineRef.current) {
      engineRef.current.stop();
    }
    setPlayerHealth(100);
    setEnemyHealth(80);
    setTailMeter(0);
    setComboCount(0);
    setGameState('ready');
    setTimeout(initGame, 100);
  };

  // Handle next round
  const nextRound = () => {
    const types = Object.keys(ENEMY_TYPES);
    const nextTypeIndex = (types.indexOf(enemyType) + 1) % types.length;
    setEnemyType(types[nextTypeIndex]);
    setRound(r => r + 1);
    restartGame();
  };

  // Toggle debug mode
  const toggleDebug = () => {
    setDebugMode(d => !d);
    if (engineRef.current) {
      engineRef.current.debug = !engineRef.current.debug;
    }
  };

  // Start game on mount
  useEffect(() => {
    const cleanup = initGame();
    return cleanup;
  }, [initGame]);

  // Handle pause
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Escape') {
        if (engineRef.current) {
          engineRef.current.paused = !engineRef.current.paused;
          setGameState(engineRef.current.paused ? 'paused' : 'playing');
        }
      }
      if (e.code === 'F1') {
        toggleDebug();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative w-full h-screen bg-black flex flex-col items-center justify-center">
      {/* Game Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="border-2 border-primary/30 rounded-lg shadow-2xl"
          style={{ 
            maxWidth: '100%', 
            maxHeight: 'calc(100vh - 200px)',
            imageRendering: 'pixelated'
          }}
        />

        {/* Overlay States */}
        {gameState === 'paused' && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <h2 className="font-heading text-4xl text-primary mb-4">PAUSED</h2>
              <p className="text-white/60 mb-6">Press ESC to resume</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    if (engineRef.current) {
                      engineRef.current.paused = false;
                      setGameState('playing');
                    }
                  }}
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

        {gameState === 'victory' && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <h2 className="font-heading text-5xl text-primary mb-2">VICTORY</h2>
              <p className="font-lore text-electric text-xl mb-6">"Memory refuses erasure."</p>
              <p className="text-white/60 mb-6">Round {round} Complete</p>
              <div className="flex gap-4 justify-center">
                <button onClick={nextRound} className="btn-cyber">
                  Next Enemy →
                </button>
                <button onClick={restartGame} className="btn-cyber border-white/30">
                  Rematch
                </button>
              </div>
            </div>
          </div>
        )}

        {gameState === 'defeat' && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <h2 className="font-heading text-5xl text-fire mb-2">DEFEATED</h2>
              <p className="font-lore text-white/60 text-xl mb-6">"Design beats habit..."</p>
              <div className="flex gap-4 justify-center">
                <button onClick={restartGame} className="btn-cyber">
                  Try Again
                </button>
                <button onClick={onExit} className="btn-cyber border-white/30">
                  Exit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls Help */}
      {showControls && gameState === 'playing' && (
        <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur rounded-lg p-4 max-w-md">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-heading text-primary">CONTROLS</h3>
            <button 
              onClick={() => setShowControls(false)}
              className="text-white/40 hover:text-white text-xs"
            >
              HIDE
            </button>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
            <div><span className="text-white/40">Move:</span> <span className="text-white">A/D or ←/→</span></div>
            <div><span className="text-white/40">Jump:</span> <span className="text-white">W or Space</span></div>
            <div><span className="text-white/40">Run:</span> <span className="text-white">Shift + Move</span></div>
            <div><span className="text-white/40">Dash:</span> <span className="text-white">E</span></div>
            <div><span className="text-white/40">Block:</span> <span className="text-white">S</span></div>
            <div><span className="text-white/40">Light Attack:</span> <span className="text-white">J</span></div>
            <div><span className="text-white/40">Heavy Attack:</span> <span className="text-white">K</span></div>
            <div><span className="text-white/40">Tail Ability:</span> <span className="text-white">L</span></div>
            <div><span className="text-white/40">Switch Tail:</span> <span className="text-white">Q / R</span></div>
            <div><span className="text-white/40">Pause:</span> <span className="text-white">ESC</span></div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/10 text-xs text-white/40">
            <p>🎮 Gamepad supported (Xbox layout)</p>
            <p>F1 to toggle debug view</p>
          </div>
        </div>
      )}

      {/* Info Panel */}
      <div className="absolute top-4 right-4 bg-black/80 backdrop-blur rounded-lg p-4">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs text-white/40">ROUND</p>
            <p className="font-heading text-2xl text-primary">{round}</p>
          </div>
          <div>
            <p className="text-xs text-white/40">ENEMY</p>
            <p className="font-heading text-lg" style={{ color: ENEMY_TYPES[enemyType]?.color }}>
              {ENEMY_TYPES[enemyType]?.name}
            </p>
          </div>
        </div>
      </div>

      {/* Debug Toggle */}
      <button
        onClick={toggleDebug}
        className={`absolute top-4 left-4 px-3 py-1 rounded text-xs ${
          debugMode ? 'bg-fire text-white' : 'bg-white/10 text-white/50'
        }`}
      >
        DEBUG {debugMode ? 'ON' : 'OFF'}
      </button>

      {/* Show controls button when hidden */}
      {!showControls && gameState === 'playing' && (
        <button
          onClick={() => setShowControls(true)}
          className="absolute bottom-4 left-4 px-3 py-1 rounded bg-white/10 text-white/50 text-xs"
        >
          Show Controls
        </button>
      )}
    </div>
  );
};

export default CombatArena;

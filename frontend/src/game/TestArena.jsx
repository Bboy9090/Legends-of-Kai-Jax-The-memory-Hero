/**
 * LEGENDS OF KAI-JAX: THE MEMORY KING
 * Test Arena — Frame Data Validation
 * 
 * Gray capsule. Ugly as sin. Perfect behavior.
 * 
 * This arena tests the CharacterController with the exact
 * frame data from our specs. No art, just behavior.
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CharacterController } from './core/CharacterController.js';
import { 
  FIGHTER_STATE, 
  MOVE_PHASE, 
  MOVE_DATA,
  MOVEMENT_DATA,
  FRAME_CONSTANTS 
} from './data/FrameData.js';

// ═══════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;
const GROUND_Y = 600;

const INPUT_MAP = {
  // Keyboard → Action
  'KeyA': 'LEFT',
  'ArrowLeft': 'LEFT',
  'KeyD': 'RIGHT',
  'ArrowRight': 'RIGHT',
  'KeyW': 'JUMP',
  'Space': 'JUMP',
  'KeyS': 'BLOCK',
  'ArrowDown': 'BLOCK',
  'ShiftLeft': 'RUN',
  'KeyE': 'DASH',
  'KeyJ': 'ATTACK_LIGHT',
  'KeyK': 'ATTACK_HEAVY',
  'KeyL': 'ATTACK_SPECIAL',
};

// ═══════════════════════════════════════════════════════════
// TEST ARENA COMPONENT
// ═══════════════════════════════════════════════════════════

export default function TestArena() {
  const canvasRef = useRef(null);
  const frameRef = useRef(0);
  const runningRef = useRef(true);
  const hitstopRef = useRef(0);
  
  // State for display
  const [debugInfo, setDebugInfo] = useState({});
  const [showDebug, setShowDebug] = useState(true);
  const [frameCount, setFrameCount] = useState(0);
  
  // Input state
  const keysRef = useRef({
    held: {},
    pressed: [],
    released: [],
  });
  
  // Characters
  const playerRef = useRef(null);
  const dummyRef = useRef(null);
  
  // ═══════════════════════════════════════════════════════════
  // INPUT HANDLING
  // ═══════════════════════════════════════════════════════════
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      const action = INPUT_MAP[e.code];
      if (action && !keysRef.current.held[action]) {
        keysRef.current.held[action] = true;
        keysRef.current.pressed.push(action);
      }
      
      // Toggle debug with backtick
      if (e.code === 'Backquote') {
        setShowDebug(prev => !prev);
      }
    };
    
    const handleKeyUp = (e) => {
      const action = INPUT_MAP[e.code];
      if (action) {
        keysRef.current.held[action] = false;
        keysRef.current.released.push(action);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  
  // ═══════════════════════════════════════════════════════════
  // COLLISION DETECTION
  // ═══════════════════════════════════════════════════════════
  
  const checkCollision = useCallback((attacker, defender) => {
    const hitbox = attacker.getActiveHitbox();
    if (!hitbox) return null;
    if (defender.isInvincible()) return null;
    
    const hurtbox = defender.getHurtbox();
    
    // AABB collision
    if (
      hitbox.x < hurtbox.x + hurtbox.width &&
      hitbox.x + hitbox.width > hurtbox.x &&
      hitbox.y < hurtbox.y + hurtbox.height &&
      hitbox.y + hitbox.height > hurtbox.y
    ) {
      return attacker.hitbox;
    }
    
    return null;
  }, []);
  
  // ═══════════════════════════════════════════════════════════
  // GAME LOOP
  // ═══════════════════════════════════════════════════════════
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Initialize characters
    playerRef.current = new CharacterController({
      id: 'player',
      isPlayer: true,
      x: 300,
      y: GROUND_Y - 120,
      width: 60,
      height: 120,
      debug: true,
    });
    
    dummyRef.current = new CharacterController({
      id: 'dummy',
      isPlayer: false,
      x: 800,
      y: GROUND_Y - 130,
      width: 70,
      height: 130,
      facing: -1,
      debug: true,
    });
    
    let lastTime = performance.now();
    let accumulator = 0;
    
    // Main loop
    const gameLoop = () => {
      if (!runningRef.current) return;
      
      const now = performance.now();
      const deltaTime = now - lastTime;
      lastTime = now;
      
      accumulator += deltaTime;
      
      // Fixed timestep update (60fps)
      while (accumulator >= FRAME_CONSTANTS.FRAME_MS) {
        // Skip update during hitstop
        if (hitstopRef.current > 0) {
          hitstopRef.current--;
        } else {
          update();
        }
        
        accumulator -= FRAME_CONSTANTS.FRAME_MS;
        frameRef.current++;
      }
      
      render(ctx);
      
      requestAnimationFrame(gameLoop);
    };
    
    // Update function
    const update = () => {
      const player = playerRef.current;
      const dummy = dummyRef.current;
      const bounds = { left: 0, right: CANVAS_WIDTH };
      
      // Process player input
      player.processInput({
        held: keysRef.current.held,
        pressed: [...keysRef.current.pressed],
        released: [...keysRef.current.released],
      });
      
      // Clear pressed/released for next frame
      keysRef.current.pressed = [];
      keysRef.current.released = [];
      
      // Update characters
      player.update(GROUND_Y, bounds);
      dummy.update(GROUND_Y, bounds);
      
      // Check collisions
      const playerHit = checkCollision(player, dummy);
      if (playerHit) {
        // Check if dummy is blocking
        const blocked = dummy.state === FIGHTER_STATE.BLOCKING;
        
        // Apply hit
        dummy.receiveHit(playerHit, blocked);
        player.confirmHit(blocked);
        
        // Hitstop
        hitstopRef.current = blocked ? playerHit.hitstop * 0.5 : playerHit.hitstop;
        
        // Deactivate hitbox
        player.hitbox.active = false;
      }
      
      // Update debug display
      setDebugInfo({
        player: player.getDebugInfo(),
        dummy: dummy.getDebugInfo(),
      });
      
      setFrameCount(frameRef.current);
    };
    
    // Render function
    const render = (ctx) => {
      const player = playerRef.current;
      const dummy = dummyRef.current;
      
      // Clear
      ctx.fillStyle = '#0a0a15';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Grid (helps visualize distances)
      ctx.strokeStyle = '#1a1a2e';
      ctx.lineWidth = 1;
      for (let x = 0; x < CANVAS_WIDTH; x += 100) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
      }
      
      // Ground
      ctx.strokeStyle = '#2E2EFE';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
      ctx.stroke();
      
      // Distance indicator between fighters
      const distance = Math.abs(dummy.x - player.x - player.width);
      ctx.fillStyle = '#666';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`Distance: ${distance.toFixed(0)}px`, CANVAS_WIDTH / 2, GROUND_Y + 30);
      
      // Render characters
      renderCharacter(ctx, player, '#FFD60A', 'PLAYER');
      renderCharacter(ctx, dummy, '#FF3B30', 'DUMMY');
      
      // Hitstop indicator
      if (hitstopRef.current > 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`HITSTOP: ${hitstopRef.current}`, CANVAS_WIDTH / 2, 50);
      }
      
      // Frame counter
      ctx.fillStyle = '#666';
      ctx.font = '14px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`Frame: ${frameRef.current}`, CANVAS_WIDTH - 20, 30);
    };
    
    // Start game loop
    gameLoop();
    
    return () => {
      runningRef.current = false;
    };
  }, [checkCollision]);
  
  // ═══════════════════════════════════════════════════════════
  // RENDER CHARACTER
  // ═══════════════════════════════════════════════════════════
  
  const renderCharacter = (ctx, char, color, label) => {
    const { x, y, width, height, facing, state, invincibleFrames, stunFrames } = char;
    
    ctx.save();
    
    // Flash when invincible
    if (invincibleFrames > 0) {
      ctx.globalAlpha = 0.3 + Math.sin(frameRef.current * 0.3) * 0.3;
    }
    
    // Flash red when in hitstun
    if (state === FIGHTER_STATE.HITSTUN || state === FIGHTER_STATE.KNOCKDOWN) {
      color = '#FF3B30';
      ctx.globalAlpha = 0.5 + Math.sin(frameRef.current * 0.5) * 0.3;
    }
    
    // Body (capsule shape)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 10);
    ctx.fill();
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(x + width / 2, GROUND_Y, width / 2, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Facing indicator (eye)
    ctx.fillStyle = '#000';
    const eyeX = x + (facing > 0 ? width * 0.7 : width * 0.2);
    ctx.beginPath();
    ctx.arc(eyeX, y + 30, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Block visual
    if (state === FIGHTER_STATE.BLOCKING || state === FIGHTER_STATE.BLOCK_STUNNED) {
      ctx.strokeStyle = '#64D2FF';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(x + width / 2, y + height / 2, width * 0.8, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Attack hitbox
    const hitboxBounds = char.getActiveHitbox();
    if (hitboxBounds) {
      ctx.strokeStyle = '#FF3B30';
      ctx.lineWidth = 2;
      ctx.strokeRect(hitboxBounds.x, hitboxBounds.y, hitboxBounds.width, hitboxBounds.height);
      ctx.fillStyle = 'rgba(255, 59, 48, 0.3)';
      ctx.fillRect(hitboxBounds.x, hitboxBounds.y, hitboxBounds.width, hitboxBounds.height);
    }
    
    // Hurtbox (debug)
    if (showDebug) {
      ctx.strokeStyle = '#30D158';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(x, y, width, height);
      ctx.setLineDash([]);
    }
    
    // Label
    ctx.fillStyle = color;
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + width / 2, y - 50);
    
    // State
    ctx.fillStyle = '#fff';
    ctx.font = '10px monospace';
    ctx.fillText(state, x + width / 2, y - 35);
    
    // Move info
    if (char.currentMoveId) {
      ctx.fillText(`${char.currentMoveId} F:${char.moveFrame}`, x + width / 2, y - 20);
      ctx.fillText(`[${char.movePhase}]`, x + width / 2, y - 8);
    }
    
    // Health bar
    const hpWidth = 60;
    const hpHeight = 6;
    const hpX = x + (width - hpWidth) / 2;
    const hpY = y - 65;
    
    ctx.fillStyle = '#333';
    ctx.fillRect(hpX, hpY, hpWidth, hpHeight);
    
    const hpPercent = char.health / char.maxHealth;
    ctx.fillStyle = hpPercent > 0.5 ? '#30D158' : hpPercent > 0.25 ? '#FFD60A' : '#FF3B30';
    ctx.fillRect(hpX, hpY, hpWidth * hpPercent, hpHeight);
    
    ctx.restore();
  };
  
  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  
  return (
    <div className="flex flex-col items-center bg-gray-900 min-h-screen p-4">
      <h1 className="text-2xl font-bold text-white mb-2">
        Frame Data Test Arena
      </h1>
      <p className="text-gray-400 text-sm mb-4">
        Gray capsule. Ugly as sin. Perfect behavior.
      </p>
      
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border border-gray-700 rounded-lg"
        style={{ imageRendering: 'pixelated' }}
      />
      
      {/* Controls */}
      <div className="mt-4 grid grid-cols-3 gap-8 text-white text-sm">
        <div>
          <h3 className="font-bold text-yellow-400 mb-2">Movement</h3>
          <div className="text-gray-300 space-y-1">
            <p>A/D or ←/→ — Move</p>
            <p>Shift — Run</p>
            <p>W/Space — Jump</p>
            <p>E — Dash</p>
            <p>S/↓ — Block</p>
          </div>
        </div>
        <div>
          <h3 className="font-bold text-red-400 mb-2">Combat</h3>
          <div className="text-gray-300 space-y-1">
            <p>J — Light Attack (4s/3a/8r)</p>
            <p>K — Heavy Attack (10s/5a/18r)</p>
            <p>L — Special (future)</p>
            <p className="text-gray-500 italic">Chain: L → L → L or L → H</p>
          </div>
        </div>
        <div>
          <h3 className="font-bold text-blue-400 mb-2">System</h3>
          <div className="text-gray-300 space-y-1">
            <p>` — Toggle debug view</p>
            <p className="text-gray-500">Frame: {frameCount}</p>
            <p className="text-gray-500">Hitstop: {hitstopRef.current}</p>
          </div>
        </div>
      </div>
      
      {/* Debug Panel */}
      {showDebug && debugInfo.player && (
        <div className="mt-4 grid grid-cols-2 gap-4 text-xs font-mono">
          <div className="bg-gray-800 p-3 rounded">
            <h4 className="text-yellow-400 font-bold mb-2">PLAYER</h4>
            <pre className="text-gray-300">
              {JSON.stringify(debugInfo.player, null, 2)}
            </pre>
          </div>
          <div className="bg-gray-800 p-3 rounded">
            <h4 className="text-red-400 font-bold mb-2">DUMMY</h4>
            <pre className="text-gray-300">
              {JSON.stringify(debugInfo.dummy, null, 2)}
            </pre>
          </div>
        </div>
      )}
      
      {/* Frame Data Reference */}
      <div className="mt-4 bg-gray-800 p-4 rounded-lg max-w-4xl">
        <h3 className="text-white font-bold mb-2">Frame Data Reference</h3>
        <table className="text-xs text-gray-300 w-full">
          <thead>
            <tr className="text-left border-b border-gray-700">
              <th className="p-1">Move</th>
              <th className="p-1">Startup</th>
              <th className="p-1">Active</th>
              <th className="p-1">Recovery</th>
              <th className="p-1">Total</th>
              <th className="p-1">Damage</th>
              <th className="p-1">On Hit</th>
              <th className="p-1">On Block</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(MOVE_DATA).map(([id, move]) => (
              <tr key={id} className="border-b border-gray-800">
                <td className="p-1 text-yellow-400">{id}</td>
                <td className="p-1">{move.startup}f</td>
                <td className="p-1 text-green-400">{move.active}f</td>
                <td className="p-1 text-red-400">{move.recovery}f</td>
                <td className="p-1">{move.total}f</td>
                <td className="p-1">{move.damage}</td>
                <td className="p-1 text-green-400">+{move.onHitAdvantage}</td>
                <td className="p-1 text-red-400">{move.onBlockAdvantage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * LEGENDS OF KAI-JAX: THE MEMORY KING
 * Test Arena — Frame Data Validation
 * 
 * Gray capsule. Ugly as sin. Perfect behavior.
 * 
 * This arena PROVES the engine works before we add anything else.
 * The debug overlay becomes the checklist for Unreal/Unity port.
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CharacterController } from './core/CharacterController.js';
import { 
  FIGHTER_STATE, 
  MOVE_PHASE, 
  MOVE_DATA,
  FRAME_CONSTANTS,
  canCancel,
} from './data/FrameData.js';

// ═══════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;
const GROUND_Y = 550;

const INPUT_MAP = {
  'KeyA': 'LEFT',
  'ArrowLeft': 'LEFT',
  'KeyD': 'RIGHT',
  'ArrowRight': 'RIGHT',
  'KeyW': 'JUMP',
  'Space': 'JUMP',
  'KeyS': 'BLOCK',
  'ArrowDown': 'BLOCK',
  'ShiftLeft': 'RUN',
  'ShiftRight': 'RUN',
  'KeyE': 'DASH',
  'KeyJ': 'ATTACK_LIGHT',
  'KeyK': 'ATTACK_HEAVY',
  'KeyL': 'ATTACK_SPECIAL',
  'KeyR': 'RESET_DUMMY',
};

// ═══════════════════════════════════════════════════════════
// TRAINING DUMMY - Does nothing, shows everything
// ═══════════════════════════════════════════════════════════

class TrainingDummy extends CharacterController {
  constructor(config) {
    super(config);
    
    // Hit tracking for display
    this.lastHitFrame = null;
    this.lastHitMove = null;
    this.lastHitDamage = 0;
    this.lastHitstun = 0;
    this.lastBlockstun = 0;
    this.wasBlocked = false;
    this.frameAdvantage = 0;
    this.hitHistory = []; // Last 5 hits
    this.totalDamage = 0;
    this.comboCounter = 0;
    this.comboDropFrame = 0;
    
    // Dummy never acts
    this.isTrainingDummy = true;
  }
  
  /**
   * Override to track hit data
   */
  receiveHit(hitbox, blocked = false) {
    // Track the hit BEFORE applying it
    const hitFrame = this.lastHitFrame !== null ? 
      (window.gameFrame - this.lastHitFrame) : null;
    
    // Calculate frame advantage
    // Advantage = defender's stun - attacker's remaining recovery
    const attackerRecovery = hitbox.owner?.currentMove?.recovery || 0;
    const attackerMoveFrame = hitbox.owner?.moveFrame || 0;
    const attackerRemainingRecovery = Math.max(0, attackerRecovery - attackerMoveFrame);
    
    const defenderStun = blocked ? hitbox.blockstun : hitbox.hitstun;
    this.frameAdvantage = defenderStun - attackerRemainingRecovery;
    
    // Store hit info
    this.lastHitFrame = window.gameFrame;
    this.lastHitMove = hitbox.owner?.currentMoveId || 'unknown';
    this.lastHitDamage = blocked ? 0 : hitbox.damage;
    this.lastHitstun = blocked ? 0 : hitbox.hitstun;
    this.lastBlockstun = blocked ? hitbox.blockstun : 0;
    this.wasBlocked = blocked;
    
    // Combo tracking
    if (!blocked) {
      if (this.state === FIGHTER_STATE.HITSTUN) {
        this.comboCounter++;
      } else {
        this.comboCounter = 1;
      }
      this.totalDamage += hitbox.damage;
    }
    
    // Add to history
    this.hitHistory.unshift({
      frame: window.gameFrame,
      move: this.lastHitMove,
      damage: this.lastHitDamage,
      stun: blocked ? this.lastBlockstun : this.lastHitstun,
      blocked,
      advantage: this.frameAdvantage,
      combo: this.comboCounter,
    });
    
    // Keep only last 5
    if (this.hitHistory.length > 5) {
      this.hitHistory.pop();
    }
    
    // Apply the hit
    super.receiveHit(hitbox, blocked);
  }
  
  /**
   * Override update to track combo drops
   */
  update(groundY, bounds) {
    super.update(groundY, bounds);
    
    // Combo dropped?
    if (this.comboCounter > 0 && this.state === FIGHTER_STATE.IDLE) {
      this.comboDropFrame = window.gameFrame;
      this.comboCounter = 0;
      this.totalDamage = 0;
    }
  }
  
  /**
   * Get hit display data
   */
  getHitData() {
    return {
      lastHitFrame: this.lastHitFrame,
      lastHitMove: this.lastHitMove,
      lastHitDamage: this.lastHitDamage,
      lastHitstun: this.lastHitstun,
      lastBlockstun: this.lastBlockstun,
      wasBlocked: this.wasBlocked,
      frameAdvantage: this.frameAdvantage,
      comboCounter: this.comboCounter,
      totalDamage: this.totalDamage,
      hitHistory: this.hitHistory,
    };
  }
  
  /**
   * Reset dummy
   */
  reset() {
    this.health = this.maxHealth;
    this.state = FIGHTER_STATE.IDLE;
    this.stunFrames = 0;
    this.comboCounter = 0;
    this.totalDamage = 0;
    this.hitHistory = [];
    this.x = 800;
    this.y = GROUND_Y - 130;
    this.vx = 0;
    this.vy = 0;
  }
}

// ═══════════════════════════════════════════════════════════
// TEST ARENA COMPONENT
// ═══════════════════════════════════════════════════════════

export default function TestArena() {
  const canvasRef = useRef(null);
  const frameRef = useRef(0);
  const runningRef = useRef(true);
  const hitstopRef = useRef(0);
  
  // State for display - use refs for frequent updates, state for React renders
  const [, forceUpdate] = useState(0);
  const playerDataRef = useRef({});
  const dummyDataRef = useRef({});
  const hitDataRef = useRef({});
  const inputBufferRef = useRef([]);
  const frameCountRef = useRef(0);
  const [showOverlay, setShowOverlay] = useState(true);
  
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
      
      // Toggle overlay with backtick
      if (e.code === 'Backquote') {
        setShowOverlay(prev => !prev);
      }
      
      // Reset dummy with R
      if (e.code === 'KeyR' && dummyRef.current) {
        dummyRef.current.reset();
      }
      
      // Toggle dummy blocking with B
      if (e.code === 'KeyB' && dummyRef.current) {
        if (dummyRef.current.state === FIGHTER_STATE.BLOCKING) {
          dummyRef.current.setState(FIGHTER_STATE.IDLE);
        } else {
          dummyRef.current.setState(FIGHTER_STATE.BLOCKING);
        }
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
      debug: false,
    });
    
    dummyRef.current = new TrainingDummy({
      id: 'dummy',
      isPlayer: false,
      x: 800,
      y: GROUND_Y - 130,
      width: 70,
      height: 130,
      facing: -1,
      debug: false,
    });
    
    // Global frame counter for hit tracking
    window.gameFrame = 0;
    
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
          window.gameFrame++;
          frameRef.current++;
        }
        
        accumulator -= FRAME_CONSTANTS.FRAME_MS;
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
        const blocked = dummy.state === FIGHTER_STATE.BLOCKING || 
                        dummy.state === FIGHTER_STATE.BLOCK_STUNNED;
        
        // Apply hit
        dummy.receiveHit(playerHit, blocked);
        player.confirmHit(blocked);
        
        // Hitstop
        hitstopRef.current = blocked ? 
          Math.floor(playerHit.hitstop * 0.5) : 
          playerHit.hitstop;
        
        // Deactivate hitbox
        player.hitbox.active = false;
      }
      
      // Update display refs (faster than setState)
      playerDataRef.current = getPlayerDebugData(player);
      dummyDataRef.current = dummy.getDebugInfo();
      hitDataRef.current = dummy.getHitData();
      inputBufferRef.current = player.inputBuffer.buffer.slice(0, 6);
      frameCountRef.current = frameRef.current;
      
      // Force React re-render every 6 frames (~10fps for UI)
      if (frameRef.current % 6 === 0) {
        forceUpdate(n => n + 1);
      }
    };
    
    // Get detailed player debug data
    const getPlayerDebugData = (player) => {
      const move = player.currentMove;
      const cancelable = move ? 
        canCancel(move, player.moveFrame, player.hitConnected) : 
        false;
      
      return {
        state: player.state,
        stateFrame: player.stateFrame,
        move: player.currentMoveId,
        moveFrame: player.moveFrame,
        movePhase: player.movePhase,
        moveData: move ? {
          startup: move.startup,
          active: move.active,
          recovery: move.recovery,
          total: move.total,
        } : null,
        cancelable,
        hitConnected: player.hitConnected,
        health: player.health,
        meter: Math.floor(player.meter),
        stunFrames: player.stunFrames,
        invincible: player.invincibleFrames > 0,
        grounded: player.grounded,
        velocity: { x: player.vx.toFixed(1), y: player.vy.toFixed(1) },
        comboCount: player.comboCount,
        facing: player.facing,
      };
    };
    
    // Render function
    const render = (ctx) => {
      const player = playerRef.current;
      const dummy = dummyRef.current;
      
      // Clear
      ctx.fillStyle = '#0a0a12';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Grid
      ctx.strokeStyle = '#151525';
      ctx.lineWidth = 1;
      for (let x = 0; x < CANVAS_WIDTH; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
        
        // Number every 100px
        if (x % 100 === 0) {
          ctx.fillStyle = '#333';
          ctx.font = '10px monospace';
          ctx.fillText(x, x + 2, GROUND_Y + 15);
        }
      }
      
      // Ground
      ctx.strokeStyle = '#2E2EFE';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
      ctx.stroke();
      
      // Render characters
      renderCharacter(ctx, player, '#FFD60A', 'PLAYER');
      renderCharacter(ctx, dummy, '#FF3B30', 'DUMMY');
      
      // Distance indicator
      const distance = Math.abs(dummy.x - player.x - player.width);
      ctx.fillStyle = '#555';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`Distance: ${distance.toFixed(0)}px`, CANVAS_WIDTH / 2, GROUND_Y + 40);
      
      // Hitstop flash
      if (hitstopRef.current > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${0.15 + Math.sin(hitstopRef.current * 0.5) * 0.1})`;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }
      
      // Frame counter on canvas
      ctx.fillStyle = '#444';
      ctx.font = '14px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`Frame: ${frameRef.current}`, CANVAS_WIDTH - 20, 25);
      
      if (hitstopRef.current > 0) {
        ctx.fillStyle = '#FF3B30';
        ctx.fillText(`HITSTOP: ${hitstopRef.current}`, CANVAS_WIDTH - 20, 45);
      }
    };
    
    // Render character
    const renderCharacter = (ctx, char, color, label) => {
      const { x, y, width, height, facing, state, invincibleFrames, stunFrames } = char;
      
      ctx.save();
      
      // Flash when invincible
      if (invincibleFrames > 0) {
        ctx.globalAlpha = 0.3 + Math.sin(frameRef.current * 0.3) * 0.3;
      }
      
      // Color based on state
      let bodyColor = color;
      if (state === FIGHTER_STATE.HITSTUN || state === FIGHTER_STATE.KNOCKDOWN) {
        bodyColor = '#FF3B30';
        ctx.globalAlpha = 0.5 + Math.sin(frameRef.current * 0.5) * 0.3;
      } else if (state === FIGHTER_STATE.BLOCKING || state === FIGHTER_STATE.BLOCK_STUNNED) {
        bodyColor = '#64D2FF';
      } else if (state === FIGHTER_STATE.ATTACKING || state === FIGHTER_STATE.TAIL_ACTION) {
        bodyColor = '#30D158';
      }
      
      // Body (capsule)
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, 10);
      ctx.fill();
      
      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(x + width / 2, GROUND_Y, width / 2, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Facing indicator
      ctx.fillStyle = '#000';
      const eyeX = x + (facing > 0 ? width * 0.7 : width * 0.3);
      ctx.beginPath();
      ctx.arc(eyeX, y + 30, 6, 0, Math.PI * 2);
      ctx.fill();
      
      // Block shield
      if (state === FIGHTER_STATE.BLOCKING || state === FIGHTER_STATE.BLOCK_STUNNED) {
        ctx.strokeStyle = '#64D2FF';
        ctx.lineWidth = 3;
        ctx.beginPath();
        const shieldX = x + (facing > 0 ? width + 5 : -15);
        ctx.roundRect(shieldX, y + 20, 10, height - 40, 3);
        ctx.stroke();
      }
      
      // Hitbox
      const hitboxBounds = char.getActiveHitbox();
      if (hitboxBounds) {
        ctx.strokeStyle = '#FF3B30';
        ctx.lineWidth = 2;
        ctx.strokeRect(hitboxBounds.x, hitboxBounds.y, hitboxBounds.width, hitboxBounds.height);
        ctx.fillStyle = 'rgba(255, 59, 48, 0.3)';
        ctx.fillRect(hitboxBounds.x, hitboxBounds.y, hitboxBounds.width, hitboxBounds.height);
      }
      
      // Hurtbox (debug)
      ctx.strokeStyle = '#30D158';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(x, y, width, height);
      ctx.setLineDash([]);
      
      // Label
      ctx.fillStyle = color;
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(label, x + width / 2, y - 40);
      
      // State
      ctx.fillStyle = '#fff';
      ctx.font = '9px monospace';
      ctx.fillText(state, x + width / 2, y - 28);
      
      // Move info
      if (char.currentMoveId) {
        const phaseColor = char.movePhase === MOVE_PHASE.STARTUP ? '#FFD60A' :
                          char.movePhase === MOVE_PHASE.ACTIVE ? '#30D158' :
                          char.movePhase === MOVE_PHASE.RECOVERY ? '#FF3B30' : '#fff';
        ctx.fillStyle = phaseColor;
        ctx.fillText(`${char.currentMoveId}`, x + width / 2, y - 16);
        ctx.fillText(`F:${char.moveFrame} [${char.movePhase}]`, x + width / 2, y - 4);
      }
      
      // Health bar
      const hpWidth = 50;
      const hpHeight = 5;
      const hpX = x + (width - hpWidth) / 2;
      const hpY = y - 55;
      
      ctx.fillStyle = '#222';
      ctx.fillRect(hpX, hpY, hpWidth, hpHeight);
      
      const hpPercent = char.health / char.maxHealth;
      ctx.fillStyle = hpPercent > 0.5 ? '#30D158' : hpPercent > 0.25 ? '#FFD60A' : '#FF3B30';
      ctx.fillRect(hpX, hpY, hpWidth * hpPercent, hpHeight);
      
      ctx.restore();
    };
    
    // Start loop
    gameLoop();
    
    return () => {
      runningRef.current = false;
    };
  }, [checkCollision]);
  
  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  
  return (
    <div className="flex bg-gray-950 min-h-screen">
      {/* Canvas Area */}
      <div className="flex-1 flex flex-col items-center p-4">
        <div className="mb-2 text-center">
          <h1 className="text-xl font-bold text-white">Frame Data Test Arena</h1>
          <p className="text-gray-500 text-xs">Gray capsule. Ugly as sin. Perfect behavior.</p>
        </div>
        
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border border-gray-800 rounded"
        />
        
        {/* Controls */}
        <div className="mt-3 flex gap-8 text-xs text-gray-400">
          <div>
            <span className="text-yellow-500 font-bold">Move:</span> A/D
            <span className="mx-2">|</span>
            <span className="text-yellow-500 font-bold">Run:</span> Shift
            <span className="mx-2">|</span>
            <span className="text-yellow-500 font-bold">Jump:</span> W/Space
            <span className="mx-2">|</span>
            <span className="text-yellow-500 font-bold">Dash:</span> E
          </div>
          <div>
            <span className="text-red-500 font-bold">Light:</span> J (4/3/8)
            <span className="mx-2">|</span>
            <span className="text-red-500 font-bold">Heavy:</span> K (10/5/18)
            <span className="mx-2">|</span>
            <span className="text-red-500 font-bold">Block:</span> S
          </div>
          <div>
            <span className="text-blue-500 font-bold">Reset:</span> R
            <span className="mx-2">|</span>
            <span className="text-blue-500 font-bold">Dummy Block:</span> B
            <span className="mx-2">|</span>
            <span className="text-blue-500 font-bold">Toggle:</span> `
          </div>
        </div>
      </div>
      
      {/* Frame Inspector Overlay */}
      {showOverlay && (
        <div className="w-80 bg-gray-900 border-l border-gray-800 p-3 overflow-y-auto text-xs font-mono">
          {/* Player State */}
          <div className="mb-4">
            <h3 className="text-yellow-500 font-bold mb-2 border-b border-gray-800 pb-1">
              PLAYER STATE
            </h3>
            <div className="space-y-1 text-gray-300">
              <Row label="State" value={playerData.state} />
              <Row label="State Frame" value={playerData.stateFrame} />
              <Row label="Grounded" value={playerData.grounded ? 'YES' : 'NO'} 
                   color={playerData.grounded ? 'text-green-400' : 'text-red-400'} />
              <Row label="Velocity" value={`(${playerData.velocity?.x}, ${playerData.velocity?.y})`} />
            </div>
          </div>
          
          {/* Current Move */}
          <div className="mb-4">
            <h3 className="text-green-500 font-bold mb-2 border-b border-gray-800 pb-1">
              CURRENT MOVE
            </h3>
            {playerData.move ? (
              <div className="space-y-1 text-gray-300">
                <Row label="Move" value={playerData.move} color="text-white" />
                <Row label="Frame" value={`${playerData.moveFrame} / ${playerData.moveData?.total}`} />
                <Row label="Phase" value={playerData.movePhase} 
                     color={
                       playerData.movePhase === 'STARTUP' ? 'text-yellow-400' :
                       playerData.movePhase === 'ACTIVE' ? 'text-green-400' :
                       playerData.movePhase === 'RECOVERY' ? 'text-red-400' : ''
                     } />
                <Row label="Startup" value={`${playerData.moveData?.startup}f`} />
                <Row label="Active" value={`${playerData.moveData?.active}f`} color="text-green-400" />
                <Row label="Recovery" value={`${playerData.moveData?.recovery}f`} color="text-red-400" />
                <Row label="Cancelable" value={playerData.cancelable ? 'YES' : 'NO'}
                     color={playerData.cancelable ? 'text-green-400' : 'text-gray-500'} />
                <Row label="Hit Confirm" value={playerData.hitConnected ? 'YES' : 'NO'}
                     color={playerData.hitConnected ? 'text-green-400' : 'text-gray-500'} />
              </div>
            ) : (
              <div className="text-gray-500">No active move</div>
            )}
          </div>
          
          {/* Input Buffer */}
          <div className="mb-4">
            <h3 className="text-blue-500 font-bold mb-2 border-b border-gray-800 pb-1">
              INPUT BUFFER ({FRAME_CONSTANTS.INPUT_BUFFER_FRAMES}f)
            </h3>
            <div className="space-y-1">
              {inputBufferDisplay.length > 0 ? (
                inputBufferDisplay.map((input, i) => (
                  <div key={i} className={`flex justify-between ${input.consumed ? 'text-gray-600 line-through' : 'text-gray-300'}`}>
                    <span>{input.action}</span>
                    <span className="text-gray-500">age: {input.age}f</span>
                  </div>
                ))
              ) : (
                <div className="text-gray-500">Empty</div>
              )}
            </div>
          </div>
          
          {/* Combat Stats */}
          <div className="mb-4">
            <h3 className="text-purple-500 font-bold mb-2 border-b border-gray-800 pb-1">
              COMBAT
            </h3>
            <div className="space-y-1 text-gray-300">
              <Row label="Health" value={`${playerData.health} / 100`} />
              <Row label="Meter" value={`${playerData.meter} / 100`} />
              <Row label="Combo" value={playerData.comboCount || 0} />
              <Row label="Stun Frames" value={playerData.stunFrames || 0} />
              <Row label="Invincible" value={playerData.invincible ? 'YES' : 'NO'}
                   color={playerData.invincible ? 'text-cyan-400' : 'text-gray-500'} />
            </div>
          </div>
          
          {/* Dummy Hit Data */}
          <div className="mb-4">
            <h3 className="text-red-500 font-bold mb-2 border-b border-gray-800 pb-1">
              DUMMY HIT DATA
            </h3>
            {hitData.lastHitFrame !== null ? (
              <div className="space-y-1 text-gray-300">
                <Row label="Last Hit" value={`Frame ${hitData.lastHitFrame}`} />
                <Row label="Move" value={hitData.lastHitMove} />
                <Row label="Damage" value={hitData.lastHitDamage} 
                     color={hitData.wasBlocked ? 'text-gray-500' : 'text-red-400'} />
                <Row label="Blocked" value={hitData.wasBlocked ? 'YES' : 'NO'}
                     color={hitData.wasBlocked ? 'text-blue-400' : 'text-gray-500'} />
                <Row label="Hitstun" value={`${hitData.lastHitstun}f`} />
                <Row label="Blockstun" value={`${hitData.lastBlockstun}f`} />
                <div className="border-t border-gray-800 pt-1 mt-1">
                  <Row label="ADVANTAGE" value={`${hitData.frameAdvantage >= 0 ? '+' : ''}${hitData.frameAdvantage}f`}
                       color={hitData.frameAdvantage >= 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'} />
                </div>
                <div className="border-t border-gray-800 pt-1 mt-1">
                  <Row label="Combo" value={hitData.comboCounter} color="text-yellow-400" />
                  <Row label="Total Dmg" value={hitData.totalDamage} color="text-red-400" />
                </div>
              </div>
            ) : (
              <div className="text-gray-500">No hits recorded</div>
            )}
          </div>
          
          {/* Hit History */}
          <div className="mb-4">
            <h3 className="text-orange-500 font-bold mb-2 border-b border-gray-800 pb-1">
              HIT HISTORY
            </h3>
            <div className="space-y-1">
              {hitData.hitHistory?.length > 0 ? (
                hitData.hitHistory.map((hit, i) => (
                  <div key={i} className={`text-gray-400 ${i === 0 ? 'text-white' : ''}`}>
                    <span className="text-gray-500">#{hit.combo}</span>
                    {' '}{hit.move}
                    {' '}<span className={hit.blocked ? 'text-blue-400' : 'text-red-400'}>
                      {hit.blocked ? 'BLK' : `${hit.damage}dmg`}
                    </span>
                    {' '}<span className={hit.advantage >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {hit.advantage >= 0 ? '+' : ''}{hit.advantage}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-gray-500">No history</div>
              )}
            </div>
          </div>
          
          {/* Frame Data Reference */}
          <div>
            <h3 className="text-gray-500 font-bold mb-2 border-b border-gray-800 pb-1">
              FRAME DATA
            </h3>
            <table className="w-full text-gray-400">
              <thead>
                <tr className="text-left text-gray-600">
                  <th>Move</th>
                  <th>S</th>
                  <th>A</th>
                  <th>R</th>
                  <th>±</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(MOVE_DATA).map(([id, move]) => (
                  <tr key={id} className={playerData.move === id ? 'text-white bg-gray-800' : ''}>
                    <td className="text-yellow-400">{id}</td>
                    <td>{move.startup}</td>
                    <td className="text-green-400">{move.active}</td>
                    <td className="text-red-400">{move.recovery}</td>
                    <td className={move.onHitAdvantage >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {move.onHitAdvantage >= 0 ? '+' : ''}{move.onHitAdvantage}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for debug rows
function Row({ label, value, color = '' }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}:</span>
      <span className={color}>{value}</span>
    </div>
  );
}

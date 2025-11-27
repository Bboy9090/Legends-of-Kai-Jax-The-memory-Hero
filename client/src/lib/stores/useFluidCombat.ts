import { create } from 'zustand';

// Spider-Man style fluid combat system
// - Auto-targeting nearest enemy
// - Effortless combo chaining
// - Attack canceling for smooth flow
// - Aerial combos and launchers

export type AttackType = 
  | 'light1' | 'light2' | 'light3' | 'light4' | 'light5'  // Light combo chain
  | 'heavy1' | 'heavy2' | 'heavy3'  // Heavy finishers
  | 'launcher' | 'aerial1' | 'aerial2' | 'aerial3' | 'slam'  // Air combos
  | 'dodge' | 'counter' | 'special' | 'ultimate';

export interface ComboMove {
  type: AttackType;
  damage: number;
  duration: number;  // How long the attack lasts
  cancelWindow: number;  // When can you cancel into next attack
  hitstun: number;  // How long enemy is stunned
  knockback: number;
  isLauncher?: boolean;
  isAerial?: boolean;
  isSlam?: boolean;
}

// Define all combo moves with their properties
export const COMBO_MOVES: Record<AttackType, ComboMove> = {
  // Light attacks - fast, chain into each other
  light1: { type: 'light1', damage: 8, duration: 0.25, cancelWindow: 0.15, hitstun: 0.3, knockback: 0.5 },
  light2: { type: 'light2', damage: 10, duration: 0.25, cancelWindow: 0.15, hitstun: 0.3, knockback: 0.5 },
  light3: { type: 'light3', damage: 12, duration: 0.3, cancelWindow: 0.2, hitstun: 0.35, knockback: 0.8 },
  light4: { type: 'light4', damage: 14, duration: 0.3, cancelWindow: 0.2, hitstun: 0.35, knockback: 1.0 },
  light5: { type: 'light5', damage: 20, duration: 0.4, cancelWindow: 0.25, hitstun: 0.5, knockback: 2.0 },
  
  // Heavy attacks - powerful finishers
  heavy1: { type: 'heavy1', damage: 25, duration: 0.4, cancelWindow: 0.25, hitstun: 0.5, knockback: 2.5 },
  heavy2: { type: 'heavy2', damage: 35, duration: 0.5, cancelWindow: 0.3, hitstun: 0.6, knockback: 3.0 },
  heavy3: { type: 'heavy3', damage: 50, duration: 0.6, cancelWindow: 0.4, hitstun: 0.8, knockback: 5.0 },
  
  // Launcher - sends enemy airborne
  launcher: { type: 'launcher', damage: 15, duration: 0.35, cancelWindow: 0.2, hitstun: 0.8, knockback: 0, isLauncher: true },
  
  // Aerial attacks
  aerial1: { type: 'aerial1', damage: 12, duration: 0.2, cancelWindow: 0.12, hitstun: 0.25, knockback: 0.3, isAerial: true },
  aerial2: { type: 'aerial2', damage: 14, duration: 0.22, cancelWindow: 0.14, hitstun: 0.28, knockback: 0.4, isAerial: true },
  aerial3: { type: 'aerial3', damage: 18, duration: 0.25, cancelWindow: 0.18, hitstun: 0.35, knockback: 0.6, isAerial: true },
  
  // Slam - brings enemy down
  slam: { type: 'slam', damage: 30, duration: 0.5, cancelWindow: 0.35, hitstun: 1.0, knockback: 0, isSlam: true },
  
  // Utility
  dodge: { type: 'dodge', damage: 0, duration: 0.3, cancelWindow: 0.15, hitstun: 0, knockback: 0 },
  counter: { type: 'counter', damage: 40, duration: 0.4, cancelWindow: 0.25, hitstun: 0.8, knockback: 3.0 },
  special: { type: 'special', damage: 60, duration: 0.8, cancelWindow: 0.5, hitstun: 1.0, knockback: 4.0 },
  ultimate: { type: 'ultimate', damage: 150, duration: 1.5, cancelWindow: 1.0, hitstun: 2.0, knockback: 8.0 },
};

// Combo routes - what attacks can chain into what
export const COMBO_CHAINS: Record<AttackType, AttackType[]> = {
  light1: ['light2', 'heavy1', 'launcher', 'dodge'],
  light2: ['light3', 'heavy1', 'heavy2', 'launcher', 'dodge'],
  light3: ['light4', 'heavy2', 'launcher', 'dodge'],
  light4: ['light5', 'heavy2', 'heavy3', 'launcher', 'dodge'],
  light5: ['heavy3', 'launcher', 'special', 'dodge'],
  
  heavy1: ['heavy2', 'launcher', 'dodge'],
  heavy2: ['heavy3', 'launcher', 'dodge'],
  heavy3: ['launcher', 'special', 'dodge'],
  
  launcher: ['aerial1', 'dodge'],
  aerial1: ['aerial2', 'slam', 'dodge'],
  aerial2: ['aerial3', 'slam', 'dodge'],
  aerial3: ['slam', 'special', 'dodge'],
  slam: ['light1', 'heavy1', 'dodge'],
  
  dodge: ['light1', 'heavy1', 'counter'],
  counter: ['light1', 'light2', 'heavy1', 'launcher'],
  special: ['light1', 'dodge'],
  ultimate: ['dodge'],
};

interface FluidCombatState {
  // Player position (free 3D movement)
  playerX: number;
  playerY: number;
  playerZ: number;
  playerVelocityX: number;
  playerVelocityY: number;
  playerVelocityZ: number;
  playerRotation: number;
  playerGrounded: boolean;
  
  // Enemy position (for targeting)
  enemyX: number;
  enemyY: number;
  enemyZ: number;
  
  // Movement input
  moveInput: { x: number; z: number };
  isRunning: boolean;
  isDashing: boolean;
  dashCooldown: number;
  
  // Combat state
  currentAttack: AttackType | null;
  attackTime: number;
  attackPhase: 'windup' | 'active' | 'recovery' | null;
  comboCount: number;
  comboTimer: number;
  inputBuffer: AttackType[];
  canCancel: boolean;
  
  // Target lock
  lockedTarget: number | null;  // Enemy index
  autoTarget: boolean;
  
  // Special meters
  specialMeter: number;
  ultimateMeter: number;
  
  // Damage dealt this combo
  comboDamage: number;
  lastHitTime: number;
  
  // Invincibility frames
  iFrames: number;
  isDodging: boolean;
  
  // Actions
  setMoveInput: (x: number, z: number) => void;
  movePlayer: (delta: number) => void;
  jump: () => void;
  dash: () => void;
  
  lightAttack: () => void;
  heavyAttack: () => void;
  launchAttack: () => void;
  specialAttack: () => void;
  ultimateAttack: () => void;
  dodgeAction: () => void;
  
  updateCombat: (delta: number) => void;
  processInputBuffer: () => void;
  dealDamage: (damage: number) => void;
  
  lockTarget: (targetIndex: number | null) => void;
  setEnemyPosition: (x: number, y: number, z: number) => void;
  setRunning: (running: boolean) => void;
  getDistanceToEnemy: () => number;
  isInAttackRange: () => boolean;
  
  reset: () => void;
}

const MOVE_SPEED = 8.0;
const RUN_SPEED = 12.0;
const DASH_SPEED = 25.0;
const JUMP_FORCE = 12.0;
const GRAVITY = -35.0;
const COMBO_TIMEOUT = 1.5;
const DASH_COOLDOWN = 0.5;

const ATTACK_RANGE = 4.0;  // Distance at which attacks connect

export const useFluidCombat = create<FluidCombatState>((set, get) => ({
  // Initial state
  playerX: -4,
  playerY: 0,
  playerZ: 0,
  playerVelocityX: 0,
  playerVelocityY: 0,
  playerVelocityZ: 0,
  playerRotation: 0,
  playerGrounded: true,
  
  // Enemy position
  enemyX: 6,
  enemyY: 0,
  enemyZ: 0,
  
  moveInput: { x: 0, z: 0 },
  isRunning: false,
  isDashing: false,
  dashCooldown: 0,
  
  currentAttack: null,
  attackTime: 0,
  attackPhase: null,
  comboCount: 0,
  comboTimer: 0,
  inputBuffer: [],
  canCancel: false,
  
  lockedTarget: null,
  autoTarget: true,
  
  specialMeter: 0,
  ultimateMeter: 0,
  comboDamage: 0,
  lastHitTime: 0,
  
  iFrames: 0,
  isDodging: false,
  
  setMoveInput: (x, z) => set({ moveInput: { x, z } }),
  
  movePlayer: (delta) => {
    const state = get();
    const { moveInput, playerGrounded, currentAttack, isDashing, dashCooldown } = state;
    
    // Can't move during heavy attacks (but can during light attacks)
    const isHeavyAttack = currentAttack?.startsWith('heavy') || currentAttack === 'special' || currentAttack === 'ultimate';
    const canMove = !isHeavyAttack || state.canCancel;
    
    let newVelX = state.playerVelocityX;
    let newVelZ = state.playerVelocityZ;
    let newVelY = state.playerVelocityY;
    
    if (canMove && !isDashing) {
      const speed = state.isRunning ? RUN_SPEED : MOVE_SPEED;
      const targetVelX = moveInput.x * speed;
      const targetVelZ = moveInput.z * speed;
      
      // Smooth acceleration
      const accel = playerGrounded ? 25.0 : 15.0;
      newVelX += (targetVelX - newVelX) * Math.min(1, accel * delta);
      newVelZ += (targetVelZ - newVelZ) * Math.min(1, accel * delta);
      
      // Update rotation to face movement direction
      if (Math.abs(moveInput.x) > 0.1 || Math.abs(moveInput.z) > 0.1) {
        const targetRotation = Math.atan2(moveInput.x, moveInput.z);
        let newRotation = state.playerRotation;
        const rotDiff = targetRotation - newRotation;
        const wrappedDiff = ((rotDiff + Math.PI) % (Math.PI * 2)) - Math.PI;
        newRotation += wrappedDiff * Math.min(1, 15 * delta);
        set({ playerRotation: newRotation });
      }
    }
    
    // Apply gravity
    if (!playerGrounded) {
      newVelY += GRAVITY * delta;
    }
    
    // Update position
    let newX = state.playerX + newVelX * delta;
    let newY = state.playerY + newVelY * delta;
    let newZ = state.playerZ + newVelZ * delta;
    
    // Ground check
    if (newY <= 0) {
      newY = 0;
      newVelY = 0;
      set({ playerGrounded: true });
    }
    
    // Arena bounds
    newX = Math.max(-10, Math.min(10, newX));
    newZ = Math.max(-8, Math.min(8, newZ));
    
    // Update dash cooldown
    let newDashCooldown = Math.max(0, dashCooldown - delta);
    
    set({
      playerX: newX,
      playerY: newY,
      playerZ: newZ,
      playerVelocityX: newVelX,
      playerVelocityY: newVelY,
      playerVelocityZ: newVelZ,
      dashCooldown: newDashCooldown,
    });
  },
  
  jump: () => {
    const state = get();
    if (state.playerGrounded) {
      set({
        playerVelocityY: JUMP_FORCE,
        playerGrounded: false,
      });
    }
  },
  
  dash: () => {
    const state = get();
    if (state.dashCooldown > 0) return;
    
    const dashDirX = state.moveInput.x || Math.sin(state.playerRotation);
    const dashDirZ = state.moveInput.z || Math.cos(state.playerRotation);
    const len = Math.sqrt(dashDirX * dashDirX + dashDirZ * dashDirZ) || 1;
    
    set({
      playerVelocityX: (dashDirX / len) * DASH_SPEED,
      playerVelocityZ: (dashDirZ / len) * DASH_SPEED,
      isDashing: true,
      dashCooldown: DASH_COOLDOWN,
      iFrames: 0.25,
      isDodging: true,
    });
    
    // End dash after short duration
    setTimeout(() => {
      set({ isDashing: false, isDodging: false });
    }, 200);
  },
  
  // Start a light attack - chains automatically
  lightAttack: () => {
    const state = get();
    const { currentAttack, canCancel, comboCount, inputBuffer } = state;
    
    // Determine which light attack in the chain
    let nextAttack: AttackType = 'light1';
    
    if (currentAttack && canCancel) {
      const chains = COMBO_CHAINS[currentAttack];
      // Find the next light attack in the chain
      const nextLight = chains?.find(a => a.startsWith('light'));
      if (nextLight) {
        nextAttack = nextLight;
      }
    } else if (!currentAttack) {
      // Starting fresh combo
      nextAttack = 'light1';
    } else {
      // Buffer the input
      set({ inputBuffer: [...inputBuffer, 'light1'] });
      return;
    }
    
    // Aerial attacks if airborne
    if (!state.playerGrounded) {
      if (!currentAttack) {
        nextAttack = 'aerial1';
      } else if (currentAttack.startsWith('aerial')) {
        const chains = COMBO_CHAINS[currentAttack];
        const nextAerial = chains?.find(a => a.startsWith('aerial'));
        if (nextAerial) nextAttack = nextAerial;
      }
    }
    
    const move = COMBO_MOVES[nextAttack];
    set({
      currentAttack: nextAttack,
      attackTime: 0,
      attackPhase: 'windup',
      canCancel: false,
      comboCount: comboCount + 1,
      comboTimer: COMBO_TIMEOUT,
    });
  },
  
  heavyAttack: () => {
    const state = get();
    const { currentAttack, canCancel, comboCount, inputBuffer } = state;
    
    let nextAttack: AttackType = 'heavy1';
    
    if (currentAttack && canCancel) {
      const chains = COMBO_CHAINS[currentAttack];
      const nextHeavy = chains?.find(a => a.startsWith('heavy'));
      if (nextHeavy) {
        nextAttack = nextHeavy;
      }
    } else if (!currentAttack) {
      nextAttack = 'heavy1';
    } else {
      set({ inputBuffer: [...inputBuffer, 'heavy1'] });
      return;
    }
    
    // Slam if airborne
    if (!state.playerGrounded && currentAttack?.startsWith('aerial')) {
      nextAttack = 'slam';
    }
    
    const move = COMBO_MOVES[nextAttack];
    set({
      currentAttack: nextAttack,
      attackTime: 0,
      attackPhase: 'windup',
      canCancel: false,
      comboCount: comboCount + 1,
      comboTimer: COMBO_TIMEOUT,
    });
  },
  
  launchAttack: () => {
    const state = get();
    const { currentAttack, canCancel, comboCount } = state;
    
    if (currentAttack && !canCancel) return;
    if (!state.playerGrounded) return;  // Can't launch from air
    
    set({
      currentAttack: 'launcher',
      attackTime: 0,
      attackPhase: 'windup',
      canCancel: false,
      comboCount: comboCount + 1,
      comboTimer: COMBO_TIMEOUT,
      // Jump with the launcher
      playerVelocityY: JUMP_FORCE * 0.8,
      playerGrounded: false,
    });
  },
  
  specialAttack: () => {
    const state = get();
    if (state.specialMeter < 50) return;
    if (state.currentAttack && !state.canCancel) return;
    
    set({
      currentAttack: 'special',
      attackTime: 0,
      attackPhase: 'windup',
      canCancel: false,
      specialMeter: state.specialMeter - 50,
      comboCount: state.comboCount + 1,
      comboTimer: COMBO_TIMEOUT,
    });
  },
  
  ultimateAttack: () => {
    const state = get();
    if (state.ultimateMeter < 100) return;
    if (state.currentAttack && !state.canCancel) return;
    
    set({
      currentAttack: 'ultimate',
      attackTime: 0,
      attackPhase: 'windup',
      canCancel: false,
      ultimateMeter: 0,
      comboCount: state.comboCount + 1,
      comboTimer: COMBO_TIMEOUT,
    });
  },
  
  dodgeAction: () => {
    const state = get();
    get().dash();
  },
  
  updateCombat: (delta) => {
    const state = get();
    let { currentAttack, attackTime, comboTimer, comboCount, iFrames, specialMeter, ultimateMeter } = state;
    
    // Update i-frames
    if (iFrames > 0) {
      iFrames = Math.max(0, iFrames - delta);
    }
    
    // Update combo timer
    if (comboTimer > 0) {
      comboTimer -= delta;
      if (comboTimer <= 0) {
        // Combo dropped
        comboCount = 0;
        set({ comboDamage: 0 });
      }
    }
    
    // Update current attack
    if (currentAttack) {
      const move = COMBO_MOVES[currentAttack];
      attackTime += delta;
      
      let attackPhase: 'windup' | 'active' | 'recovery' | null = state.attackPhase;
      let canCancel = false;
      
      const windupEnd = move.duration * 0.2;
      const activeEnd = move.duration * 0.6;
      
      if (attackTime < windupEnd) {
        attackPhase = 'windup';
      } else if (attackTime < activeEnd) {
        attackPhase = 'active';
        // Deal damage on first frame of active - ONLY if in attack range!
        if (state.attackPhase === 'windup' && get().isInAttackRange()) {
          get().dealDamage(move.damage);
        }
      } else if (attackTime < move.duration) {
        attackPhase = 'recovery';
        canCancel = attackTime >= move.cancelWindow;
      } else {
        // Attack finished
        currentAttack = null;
        attackPhase = null;
        canCancel = true;
        
        // Process input buffer
        get().processInputBuffer();
      }
      
      set({
        currentAttack,
        attackTime,
        attackPhase,
        canCancel,
      });
    }
    
    // Build meter over time
    specialMeter = Math.min(100, specialMeter + delta * 2);
    ultimateMeter = Math.min(100, ultimateMeter + delta * 0.5);
    
    set({
      comboTimer,
      comboCount,
      iFrames,
      specialMeter,
      ultimateMeter,
    });
  },
  
  processInputBuffer: () => {
    const state = get();
    const { inputBuffer } = state;
    
    if (inputBuffer.length > 0) {
      const nextInput = inputBuffer[0];
      set({ inputBuffer: inputBuffer.slice(1) });
      
      // Execute buffered input
      if (nextInput.startsWith('light')) {
        get().lightAttack();
      } else if (nextInput.startsWith('heavy')) {
        get().heavyAttack();
      }
    }
  },
  
  dealDamage: (damage) => {
    const state = get();
    const { comboCount, comboDamage } = state;
    
    // Combo scaling - more hits = slightly less damage but feels great
    const comboScale = Math.max(0.3, 1 - comboCount * 0.05);
    const finalDamage = Math.floor(damage * comboScale);
    
    // Build meter from damage
    const meterGain = finalDamage * 0.5;
    
    set({
      comboDamage: comboDamage + finalDamage,
      lastHitTime: Date.now(),
      specialMeter: Math.min(100, state.specialMeter + meterGain * 0.5),
      ultimateMeter: Math.min(100, state.ultimateMeter + meterGain * 0.2),
    });
    
    // Return damage for the arena to apply
    return finalDamage;
  },
  
  lockTarget: (targetIndex) => {
    set({ lockedTarget: targetIndex });
  },
  
  setEnemyPosition: (x, y, z) => {
    set({ enemyX: x, enemyY: y, enemyZ: z });
  },
  
  setRunning: (running) => {
    set({ isRunning: running });
  },
  
  getDistanceToEnemy: () => {
    const state = get();
    const dx = state.playerX - state.enemyX;
    const dy = state.playerY - state.enemyY;
    const dz = state.playerZ - state.enemyZ;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  },
  
  isInAttackRange: () => {
    return get().getDistanceToEnemy() <= ATTACK_RANGE;
  },
  
  reset: () => {
    set({
      playerX: -4,
      playerY: 0,
      playerZ: 0,
      playerVelocityX: 0,
      playerVelocityY: 0,
      playerVelocityZ: 0,
      playerRotation: 0,
      playerGrounded: true,
      moveInput: { x: 0, z: 0 },
      isRunning: false,
      isDashing: false,
      dashCooldown: 0,
      currentAttack: null,
      attackTime: 0,
      attackPhase: null,
      comboCount: 0,
      comboTimer: 0,
      inputBuffer: [],
      canCancel: false,
      lockedTarget: null,
      specialMeter: 0,
      ultimateMeter: 50,
      comboDamage: 0,
      lastHitTime: 0,
      iFrames: 0,
      isDodging: false,
    });
  },
}));

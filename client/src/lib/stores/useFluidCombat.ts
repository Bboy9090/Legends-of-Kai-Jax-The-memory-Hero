import { create } from 'zustand';
import { CharacterRole } from '../roster';

// Spider-Man style fluid combat system
// - Auto-targeting nearest enemy
// - Effortless combo chaining
// - Attack canceling for smooth flow
// - Aerial combos and launchers

// Movement profiles based on character archetype
export interface MovementProfile {
  walkSpeed: number;
  runSpeed: number;
  acceleration: number;
  friction: number;
  jumpHeight: number;
  dashSpeed: number;
  dashDistance: number;
  animationSpeed: number;  // How fast animations play
  armSwingIntensity: number;  // How much arms swing (0-2)
  legSwingIntensity: number;  // How much legs swing (0-2)
  bodyLean: number;  // How much body leans when running (0-0.5)
  bounceIntensity: number;  // Vertical bounce when moving (0-0.3)
}

// Role-based movement profiles
export const MOVEMENT_PROFILES: Record<CharacterRole, MovementProfile> = {
  // Vanguards - balanced, solid movement
  'Vanguard': {
    walkSpeed: 4,
    runSpeed: 8,
    acceleration: 25,
    friction: 0.88,
    jumpHeight: 12,
    dashSpeed: 20,
    dashDistance: 5,
    animationSpeed: 10,
    armSwingIntensity: 1.0,
    legSwingIntensity: 1.0,
    bodyLean: 0.15,
    bounceIntensity: 0.12
  },
  // Blitzers - FAST, extreme speed
  'Blitzer': {
    walkSpeed: 5,
    runSpeed: 14,
    acceleration: 40,
    friction: 0.92,
    jumpHeight: 14,
    dashSpeed: 30,
    dashDistance: 8,
    animationSpeed: 14,
    armSwingIntensity: 1.5,
    legSwingIntensity: 1.5,
    bodyLean: 0.25,
    bounceIntensity: 0.08
  },
  // Tanks - slow but powerful
  'Tank': {
    walkSpeed: 3,
    runSpeed: 5,
    acceleration: 15,
    friction: 0.82,
    jumpHeight: 8,
    dashSpeed: 12,
    dashDistance: 3,
    animationSpeed: 6,
    armSwingIntensity: 1.8,
    legSwingIntensity: 0.8,
    bodyLean: 0.08,
    bounceIntensity: 0.2
  },
  // Mystics - floaty, graceful movement
  'Mystic': {
    walkSpeed: 4,
    runSpeed: 7,
    acceleration: 22,
    friction: 0.9,
    jumpHeight: 15,
    dashSpeed: 18,
    dashDistance: 6,
    animationSpeed: 8,
    armSwingIntensity: 0.6,
    legSwingIntensity: 0.7,
    bodyLean: 0.1,
    bounceIntensity: 0.05
  },
  // Support - medium speed, helpful
  'Support': {
    walkSpeed: 4,
    runSpeed: 7,
    acceleration: 22,
    friction: 0.88,
    jumpHeight: 11,
    dashSpeed: 16,
    dashDistance: 5,
    animationSpeed: 9,
    armSwingIntensity: 0.9,
    legSwingIntensity: 0.9,
    bodyLean: 0.12,
    bounceIntensity: 0.1
  },
  // Wildcards - unpredictable, bouncy
  'Wildcard': {
    walkSpeed: 4.5,
    runSpeed: 9,
    acceleration: 30,
    friction: 0.85,
    jumpHeight: 16,
    dashSpeed: 22,
    dashDistance: 6,
    animationSpeed: 12,
    armSwingIntensity: 1.3,
    legSwingIntensity: 1.4,
    bodyLean: 0.18,
    bounceIntensity: 0.25
  },
  // Snipers - precise, controlled movement
  'Sniper': {
    walkSpeed: 4,
    runSpeed: 8,
    acceleration: 28,
    friction: 0.9,
    jumpHeight: 10,
    dashSpeed: 18,
    dashDistance: 5,
    animationSpeed: 9,
    armSwingIntensity: 0.7,
    legSwingIntensity: 0.8,
    bodyLean: 0.1,
    bounceIntensity: 0.06
  },
  // Controllers - tactical, measured
  'Controller': {
    walkSpeed: 3.5,
    runSpeed: 6,
    acceleration: 20,
    friction: 0.85,
    jumpHeight: 10,
    dashSpeed: 15,
    dashDistance: 4,
    animationSpeed: 8,
    armSwingIntensity: 0.8,
    legSwingIntensity: 0.7,
    bodyLean: 0.08,
    bounceIntensity: 0.08
  }
};

// Get movement profile for a character role
export function getMovementProfile(role: CharacterRole): MovementProfile {
  return MOVEMENT_PROFILES[role] || MOVEMENT_PROFILES['Vanguard'];
}

// Character-specific signature attacks
export interface SignatureKit {
  specialName: string;
  specialDescription: string;
  specialType: 'projectile' | 'melee' | 'buff' | 'aoe' | 'dash';
  specialDamage: number;
  specialCooldown: number;
  ultimateName: string;
  ultimateDescription: string;
  ultimateType: 'cinematic' | 'burst' | 'transformation' | 'summon';
  ultimateDamage: number;
  effectColor: string;
}

// Signature combat kits per character
export const CHARACTER_KITS: Record<string, SignatureKit> = {
  mario: {
    specialName: 'Blazing Orb',
    specialDescription: 'Throws a bouncing fire sphere',
    specialType: 'projectile',
    specialDamage: 65,
    specialCooldown: 3,
    ultimateName: 'Zenith Inferno',
    ultimateDescription: 'Massive fire explosion engulfs the arena',
    ultimateType: 'burst',
    ultimateDamage: 180,
    effectColor: '#FF6600'
  },
  luigi: {
    specialName: 'Phantom Vacuum',
    specialDescription: 'Drains enemy life force',
    specialType: 'melee',
    specialDamage: 55,
    specialCooldown: 4,
    ultimateName: 'Poltergust G-00 Surge',
    ultimateDescription: 'Summons spectral energy from the Dark Moon',
    ultimateType: 'summon',
    ultimateDamage: 160,
    effectColor: '#00FF66'
  },
  sonic: {
    specialName: 'Crimson Cyclone',
    specialDescription: 'High-speed spinning attack',
    specialType: 'dash',
    specialDamage: 70,
    specialCooldown: 2,
    ultimateName: 'Chaos Flow',
    ultimateDescription: 'Channel all Chaos Emerald power',
    ultimateType: 'transformation',
    ultimateDamage: 200,
    effectColor: '#FF0000'
  },
  link: {
    specialName: 'Forest Arrow',
    specialDescription: 'Precision shot with ancient power',
    specialType: 'projectile',
    specialDamage: 60,
    specialCooldown: 3,
    ultimateName: 'Triforce Slash',
    ultimateDescription: 'Unleash the power of courage',
    ultimateType: 'cinematic',
    ultimateDamage: 175,
    effectColor: '#00AA00'
  },
  kirby: {
    specialName: 'Dream Inhale',
    specialDescription: 'Absorb and copy enemy power',
    specialType: 'melee',
    specialDamage: 50,
    specialCooldown: 4,
    ultimateName: 'Star Rod Burst',
    ultimateDescription: 'Channel the power of the Fountain of Dreams',
    ultimateType: 'burst',
    ultimateDamage: 165,
    effectColor: '#FF69B4'
  },
  pikachu: {
    specialName: 'Volt Tackle',
    specialDescription: 'Electric charge through enemies',
    specialType: 'dash',
    specialDamage: 65,
    specialCooldown: 3,
    ultimateName: '10 Million Volt Thunderbolt',
    ultimateDescription: 'Massive lightning storm covers the arena',
    ultimateType: 'burst',
    ultimateDamage: 190,
    effectColor: '#FFDD00'
  },
  samus: {
    specialName: 'Charge Beam',
    specialDescription: 'Powerful energy projectile',
    specialType: 'projectile',
    specialDamage: 75,
    specialCooldown: 4,
    ultimateName: 'Zero Laser',
    ultimateDescription: 'Devastating beam of pure energy',
    ultimateType: 'cinematic',
    ultimateDamage: 200,
    effectColor: '#00CCFF'
  },
  fox: {
    specialName: 'Blaster Barrage',
    specialDescription: 'Rapid-fire laser shots',
    specialType: 'projectile',
    specialDamage: 55,
    specialCooldown: 2,
    ultimateName: 'Landmaster',
    ultimateDescription: 'Summon the legendary Arwing tank',
    ultimateType: 'summon',
    ultimateDamage: 175,
    effectColor: '#FF8800'
  },
  donkeykong: {
    specialName: 'Giant Punch',
    specialDescription: 'Devastating charged fist attack',
    specialType: 'melee',
    specialDamage: 85,
    specialCooldown: 5,
    ultimateName: 'Konga Fury',
    ultimateDescription: 'Rhythmic beating creates shockwaves',
    ultimateType: 'burst',
    ultimateDamage: 195,
    effectColor: '#8B4513'
  },
  bowser: {
    specialName: 'Fire Breath',
    specialDescription: 'Continuous stream of flames',
    specialType: 'projectile',
    specialDamage: 70,
    specialCooldown: 4,
    ultimateName: 'Giga Bowser',
    ultimateDescription: 'Transform into ultimate Koopa form',
    ultimateType: 'transformation',
    ultimateDamage: 210,
    effectColor: '#FF4400'
  },
  peach: {
    specialName: 'Royal Bloom',
    specialDescription: 'Heal allies and damage enemies',
    specialType: 'buff',
    specialDamage: 45,
    specialCooldown: 5,
    ultimateName: 'Peach Blossom',
    ultimateDescription: 'Put enemies to sleep with dream magic',
    ultimateType: 'cinematic',
    ultimateDamage: 140,
    effectColor: '#FFB6C1'
  },
  zelda: {
    specialName: "Nayru's Love",
    specialDescription: 'Protective crystal shield',
    specialType: 'buff',
    specialDamage: 50,
    specialCooldown: 4,
    ultimateName: 'Light Arrow',
    ultimateDescription: 'Sacred arrow blessed by the gods',
    ultimateType: 'cinematic',
    ultimateDamage: 185,
    effectColor: '#FFD700'
  },
  mewtwo: {
    specialName: 'Shadow Ball',
    specialDescription: 'Concentrated psychic energy',
    specialType: 'projectile',
    specialDamage: 80,
    specialCooldown: 3,
    ultimateName: 'Psystrike',
    ultimateDescription: 'Ultimate psychic assault',
    ultimateType: 'burst',
    ultimateDamage: 205,
    effectColor: '#9400D3'
  },
  snake: {
    specialName: 'RPG-7',
    specialDescription: 'Guided missile strike',
    specialType: 'projectile',
    specialDamage: 75,
    specialCooldown: 5,
    ultimateName: 'Covering Fire',
    ultimateDescription: 'Call in helicopter support',
    ultimateType: 'summon',
    ultimateDamage: 185,
    effectColor: '#556B2F'
  },
  ryu: {
    specialName: 'Hadoken',
    specialDescription: 'Surge fist energy blast',
    specialType: 'projectile',
    specialDamage: 60,
    specialCooldown: 2,
    ultimateName: 'Shin Shoryuken',
    ultimateDescription: 'True rising dragon fist',
    ultimateType: 'cinematic',
    ultimateDamage: 190,
    effectColor: '#FFFFFF'
  },
  cloud: {
    specialName: 'Blade Beam',
    specialDescription: 'Energy wave from Buster Sword',
    specialType: 'projectile',
    specialDamage: 65,
    specialCooldown: 3,
    ultimateName: 'Omnislash',
    ultimateDescription: 'Legendary Soldier technique',
    ultimateType: 'cinematic',
    ultimateDamage: 215,
    effectColor: '#4169E1'
  },
  bayonetta: {
    specialName: 'Witch Time',
    specialDescription: 'Slow time around enemies',
    specialType: 'buff',
    specialDamage: 55,
    specialCooldown: 6,
    ultimateName: 'Infernal Climax',
    ultimateDescription: 'Summon Gomorrah from Inferno',
    ultimateType: 'summon',
    ultimateDamage: 200,
    effectColor: '#AA00FF'
  },
  greninja: {
    specialName: 'Water Shuriken',
    specialDescription: 'Rapid water blade attacks',
    specialType: 'projectile',
    specialDamage: 55,
    specialCooldown: 2,
    ultimateName: 'Secret Ninja Attack',
    ultimateDescription: 'Full-moon assassination strike',
    ultimateType: 'cinematic',
    ultimateDamage: 175,
    effectColor: '#003366'
  },
  shadow: {
    specialName: 'Chaos Spear',
    specialDescription: 'Dark energy projectile',
    specialType: 'projectile',
    specialDamage: 70,
    specialCooldown: 3,
    ultimateName: 'Chaos Blast',
    ultimateDescription: 'Release all inhibitor limits',
    ultimateType: 'burst',
    ultimateDamage: 195,
    effectColor: '#333333'
  },
  palutena: {
    specialName: 'Autoreticle',
    specialDescription: 'Homing light projectiles',
    specialType: 'projectile',
    specialDamage: 60,
    specialCooldown: 3,
    ultimateName: 'Black Hole Laser',
    ultimateDescription: 'Create void and pierce through',
    ultimateType: 'burst',
    ultimateDamage: 180,
    effectColor: '#00FF88'
  },
  default: {
    specialName: 'Power Strike',
    specialDescription: 'Focused energy attack',
    specialType: 'melee',
    specialDamage: 60,
    specialCooldown: 3,
    ultimateName: 'Ultimate Fury',
    ultimateDescription: 'Channel all power into one strike',
    ultimateType: 'burst',
    ultimateDamage: 150,
    effectColor: '#FFFFFF'
  }
};

// Get signature kit for a character
export function getSignatureKit(characterId: string): SignatureKit {
  return CHARACTER_KITS[characterId] || CHARACTER_KITS['default'];
}

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
  // Character info for archetype-based profiles
  characterId: string;
  characterRole: CharacterRole;
  
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
  specialCooldown: number;  // Cooldown timer for special attacks
  
  // Damage dealt this combo
  comboDamage: number;
  lastHitTime: number;
  
  // Invincibility frames
  iFrames: number;
  isDodging: boolean;
  
  // Actions
  setCharacter: (id: string, role: CharacterRole) => void;
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
  getMovementProfile: () => MovementProfile;
  getSignatureKit: () => SignatureKit;
  
  reset: () => void;
}

// Default fallback values (profiles override these)
const DEFAULT_MOVE_SPEED = 8.0;
const DEFAULT_RUN_SPEED = 12.0;
const DEFAULT_DASH_SPEED = 25.0;
const DEFAULT_JUMP_FORCE = 12.0;
const GRAVITY = -35.0;
const COMBO_TIMEOUT = 1.5;
const DEFAULT_DASH_COOLDOWN = 0.5;

const ATTACK_RANGE = 4.0;  // Distance at which attacks connect

export const useFluidCombat = create<FluidCombatState>((set, get) => ({
  // Character info - default to Vanguard
  characterId: 'mario',
  characterRole: 'Vanguard',
  
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
  specialCooldown: 0,
  comboDamage: 0,
  lastHitTime: 0,
  
  iFrames: 0,
  isDodging: false,
  
  // Set character for archetype-based profiles
  setCharacter: (id, role) => set({ characterId: id, characterRole: role }),
  
  // Get current movement profile based on character role
  getMovementProfile: () => {
    const state = get();
    return MOVEMENT_PROFILES[state.characterRole] || MOVEMENT_PROFILES['Vanguard'];
  },
  
  // Get current signature kit based on character ID
  getSignatureKit: () => {
    const state = get();
    return CHARACTER_KITS[state.characterId] || CHARACTER_KITS['default'];
  },
  
  setMoveInput: (x, z) => set({ moveInput: { x, z } }),
  
  movePlayer: (delta) => {
    const state = get();
    const { moveInput, playerGrounded, currentAttack, isDashing, dashCooldown } = state;
    
    // Get archetype-based movement profile
    const profile = state.getMovementProfile();
    
    // Can't move during heavy attacks (but can during light attacks)
    const isHeavyAttack = currentAttack?.startsWith('heavy') || currentAttack === 'special' || currentAttack === 'ultimate';
    const canMove = !isHeavyAttack || state.canCancel;
    
    let newVelX = state.playerVelocityX;
    let newVelZ = state.playerVelocityZ;
    let newVelY = state.playerVelocityY;
    
    if (canMove && !isDashing) {
      // Use profile-based speeds instead of hardcoded values
      const speed = state.isRunning ? profile.runSpeed : profile.walkSpeed;
      const targetVelX = moveInput.x * speed;
      const targetVelZ = moveInput.z * speed;
      
      // Smooth acceleration - use profile-based acceleration
      const baseAccel = profile.acceleration;
      const accel = playerGrounded ? baseAccel : baseAccel * 0.6;
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
      // Use profile-based jump height
      const profile = state.getMovementProfile();
      set({
        playerVelocityY: profile.jumpHeight,
        playerGrounded: false,
      });
    }
  },
  
  dash: () => {
    const state = get();
    if (state.dashCooldown > 0) return;
    
    // Use profile-based dash speed
    const profile = state.getMovementProfile();
    
    const dashDirX = state.moveInput.x || Math.sin(state.playerRotation);
    const dashDirZ = state.moveInput.z || Math.cos(state.playerRotation);
    const len = Math.sqrt(dashDirX * dashDirX + dashDirZ * dashDirZ) || 1;
    
    set({
      playerVelocityX: (dashDirX / len) * profile.dashSpeed,
      playerVelocityZ: (dashDirZ / len) * profile.dashSpeed,
      isDashing: true,
      dashCooldown: DEFAULT_DASH_COOLDOWN,
      iFrames: 0.25,
      isDodging: true,
    });
    
    // End dash duration varies by role (faster roles dash faster)
    const dashDuration = 200 * (10 / profile.animationSpeed);
    setTimeout(() => {
      set({ isDashing: false, isDodging: false });
    }, dashDuration);
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
    
    // Use profile-based jump height for launcher
    const profile = state.getMovementProfile();
    
    set({
      currentAttack: 'launcher',
      attackTime: 0,
      attackPhase: 'windup',
      canCancel: false,
      comboCount: comboCount + 1,
      comboTimer: COMBO_TIMEOUT,
      // Jump with the launcher - use profile jump height
      playerVelocityY: profile.jumpHeight * 0.8,
      playerGrounded: false,
    });
  },
  
  specialAttack: () => {
    const state = get();
    const kit = state.getSignatureKit();
    
    // Check cooldown and meter
    if (state.specialCooldown > 0) return;
    if (state.specialMeter < 50) return;
    if (state.currentAttack && !state.canCancel) return;
    
    // Use character-specific special attack
    console.log(`[SPECIAL] ${kit.specialName}: ${kit.specialDescription}`);
    
    set({
      currentAttack: 'special',
      attackTime: 0,
      attackPhase: 'windup',
      canCancel: false,
      specialMeter: state.specialMeter - 50,
      specialCooldown: kit.specialCooldown,
      comboCount: state.comboCount + 1,
      comboTimer: COMBO_TIMEOUT,
    });
  },
  
  ultimateAttack: () => {
    const state = get();
    const kit = state.getSignatureKit();
    
    if (state.ultimateMeter < 100) return;
    if (state.currentAttack && !state.canCancel) return;
    
    // Use character-specific ultimate attack
    console.log(`[ULTIMATE] ${kit.ultimateName}: ${kit.ultimateDescription}`);
    
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
    let { currentAttack, attackTime, comboTimer, comboCount, iFrames, specialMeter, ultimateMeter, specialCooldown } = state;
    
    // Update i-frames
    if (iFrames > 0) {
      iFrames = Math.max(0, iFrames - delta);
    }
    
    // Update special cooldown
    if (specialCooldown > 0) {
      specialCooldown = Math.max(0, specialCooldown - delta);
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
      const kit = state.getSignatureKit();
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
          // Use signature kit damage for special/ultimate, otherwise use move damage
          let damage = move.damage;
          if (currentAttack === 'special') {
            damage = kit.specialDamage;
          } else if (currentAttack === 'ultimate') {
            damage = kit.ultimateDamage;
          }
          get().dealDamage(damage);
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
        specialCooldown,
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
      specialCooldown,
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
    // Preserve character info so archetype profiles remain active
    const state = get();
    const { characterId, characterRole } = state;
    
    set({
      // Preserve character context
      characterId,
      characterRole,
      // Reset position
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
      specialCooldown: 0,
      comboDamage: 0,
      lastHitTime: 0,
      iFrames: 0,
      isDodging: false,
    });
  },
}));

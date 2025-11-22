import { create } from "zustand";
import { getFighterById } from "../characters";
import { getArenaById } from "../arenas";
import { useAudio } from "./useAudio";

// Fighting stance types
export type StanceType = 'orthodox' | 'southpaw' | 'bladed';

// Attack phases for momentum-based combat
export type AttackPhase = 'idle' | 'windup' | 'contact' | 'followthrough' | 'recovery';

// Stance configuration
export interface Stance {
  type: StanceType;
  weightFront: number; // 0.0 to 1.0 (e.g., 0.6 = 60% front, 40% back)
  hipRotation: number; // Radians - current hip twist for power generation
}

export interface BattleState {
  // Selected fighters
  playerFighterId: string;
  opponentFighterId: string;
  selectedArenaId: string;
  
  // Battle stats
  playerHealth: number;
  opponentHealth: number;
  maxHealth: number;
  
  // Battle state
  roundTime: number;
  maxRoundTime: number;
  battlePhase: 'preRound' | 'fighting' | 'ko' | 'results';
  winner: 'player' | 'opponent' | null;
  timeScale: number; // For slow-motion effects (1.0 = normal, 0.3 = slow)
  
  // Score tracking
  playerWins: number;
  opponentWins: number;
  totalBattles: number;
  battleScore: number; // Points earned
  
  // Player 3D position/physics
  playerX: number;
  playerY: number;
  playerZ: number; // DEPTH axis for realistic movement
  playerVelocityX: number;
  playerVelocityY: number;
  playerVelocityZ: number; // Forward/backward speed
  playerRotation: number; // Facing angle in radians (0 = facing right, Math.PI = facing left)
  playerFacingRight: boolean; // Legacy support - computed from rotation
  playerGrounded: boolean;
  
  // Player stance & momentum
  playerStance: Stance;
  playerMomentum: number; // Forward momentum for dash/lunge attacks (0-1)
  playerBalance: number; // Center of gravity stability (0-1, <0.3 = stumbling)
  playerCenterOfGravity: number; // 0-1: Current CG position (0.5 = neutral, <0.3 = vulnerable)
  playerRecoveryFrames: number; // Vulnerability window after balance loss
  playerAttackPhase: AttackPhase;
  playerComboCount: number; // Consecutive hits in current combo
  playerOptimalDistance: number; // Calculated ideal fighting distance
  
  // Opponent 3D position/physics
  opponentX: number;
  opponentY: number;
  opponentZ: number;
  opponentVelocityX: number;
  opponentVelocityY: number;
  opponentVelocityZ: number;
  opponentRotation: number;
  opponentFacingRight: boolean; // Legacy support
  opponentGrounded: boolean;
  
  // Opponent stance & momentum
  opponentStance: Stance;
  opponentMomentum: number;
  opponentBalance: number;
  opponentAttackPhase: AttackPhase;
  opponentComboCount: number;
  
  // Combat state
  playerAttacking: boolean;
  playerAttackType: 'punch' | 'kick' | 'special' | null;
  opponentAttacking: boolean;
  opponentAttackType: 'punch' | 'kick' | 'special' | null;
  playerInvulnerable: boolean;
  opponentInvulnerable: boolean;
  
  // Actions
  startBattle: () => void;
  resetRound: () => void;
  updateRoundTimer: (delta: number) => void;
  
  // Player actions (legacy 2D)
  movePlayer: (x: number, y: number) => void;
  playerJump: () => void;
  playerAttack: (type: 'punch' | 'kick' | 'special') => void;
  playerTakeDamage: (damage: number) => void;
  
  // Player 3D movement actions  
  playerMove3D: (forward: number, strafe: number) => void; // Forward/back on Z, left/right on X
  playerPivot: (angle: number) => void; // Rotate to change facing
  playerDash: (direction: 'forward' | 'back' | 'left' | 'right') => void; // Quick burst movement
  playerSlip: (direction: 'left' | 'right') => void; // Small evasive sidestep
  
  // Player stance & momentum
  updatePlayerStance: (weightShift: number, hipRotation: number) => void;
  updatePlayerBalance: (delta: number) => void; // Apply physics to balance meter
  updatePlayerMomentum: (delta: number) => void; // Decay/build momentum
  updatePlayerRecoveryFrames: (delta: number) => void; // Decay recovery vulnerability
  
  // Opponent actions (legacy 2D)
  moveOpponent: (x: number, y: number) => void;
  opponentJump: () => void;
  opponentAttack: (type: 'punch' | 'kick' | 'special') => void;
  opponentTakeDamage: (damage: number) => void;
  
  // Opponent 3D movement actions
  opponentMove3D: (forward: number, strafe: number) => void;
  opponentPivot: (angle: number) => void;
  opponentDash: (direction: 'forward' | 'back' | 'left' | 'right') => void;
  
  // Opponent stance & momentum
  updateOpponentBalance: (delta: number) => void;
  updateOpponentMomentum: (delta: number) => void;
  updateOpponentRecoveryFrames: (delta: number) => void;
  
  // Battle results
  endBattle: (winner: 'player' | 'opponent') => void;
  returnToMenu: () => void;
  setTimeScale: (scale: number) => void;
  
  // Setup
  setPlayerFighter: (fighterId: string) => void;
  setOpponentFighter: (fighterId: string) => void;
  setArena: (arenaId: string) => void;
}

export const useBattle = create<BattleState>((set, get) => ({
  // Initial state
  playerFighterId: 'jaxon',
  opponentFighterId: 'speedy',
  selectedArenaId: 'mushroom-plains',
  
  playerHealth: 100,
  opponentHealth: 100,
  maxHealth: 100,
  
  roundTime: 99,
  maxRoundTime: 99,
  battlePhase: 'preRound',
  winner: null,
  timeScale: 1.0, // Normal speed
  
  playerWins: 0,
  opponentWins: 0,
  totalBattles: 0,
  battleScore: 0,
  
  // Player starts on left with 3D positioning
  playerX: -5,
  playerY: 0.8,
  playerZ: 0, // Center depth
  playerVelocityX: 0,
  playerVelocityY: 0,
  playerVelocityZ: 0,
  playerRotation: 0, // Facing right
  playerFacingRight: true,
  playerGrounded: true,
  
  // Player stance & combat state
  playerStance: {
    type: 'orthodox' as StanceType,
    weightFront: 0.6, // 60% front, 40% back
    hipRotation: 0
  },
  playerMomentum: 0,
  playerBalance: 1.0, // Perfect balance
  playerCenterOfGravity: 0.5, // Neutral position
  playerRecoveryFrames: 0, // No vulnerability
  playerAttackPhase: 'idle' as AttackPhase,
  playerComboCount: 0,
  playerOptimalDistance: 2.0,
  
  // Opponent starts on right with 3D positioning
  opponentX: 5,
  opponentY: 0.8,
  opponentZ: 0,
  opponentVelocityX: 0,
  opponentVelocityY: 0,
  opponentVelocityZ: 0,
  opponentRotation: Math.PI, // Facing left
  opponentFacingRight: false,
  opponentGrounded: true,
  
  // Opponent stance & combat state
  opponentStance: {
    type: 'orthodox' as StanceType,
    weightFront: 0.6,
    hipRotation: 0
  },
  opponentMomentum: 0,
  opponentBalance: 1.0,
  opponentCenterOfGravity: 0.5,
  opponentRecoveryFrames: 0,
  opponentAttackPhase: 'idle' as AttackPhase,
  opponentComboCount: 0,
  opponentOptimalDistance: 2.0,
  
  playerAttacking: false,
  playerAttackType: null,
  opponentAttacking: false,
  opponentAttackType: null,
  playerInvulnerable: false,
  opponentInvulnerable: false,
  
  startBattle: () => {
    console.log("[Battle] Starting battle - Dynamic combat system activated!");
    set({
      battlePhase: 'fighting',
      roundTime: get().maxRoundTime,
      playerHealth: get().maxHealth,
      opponentHealth: get().maxHealth,
      playerX: -5,
      playerY: 0.8,
      playerZ: 0,
      playerRotation: 0,
      playerMomentum: 0,
      playerBalance: 1.0,
      playerCenterOfGravity: 0.5,
      playerRecoveryFrames: 0,
      playerAttackPhase: 'idle' as AttackPhase,
      playerComboCount: 0,
      playerOptimalDistance: 2.0,
      opponentX: 5,
      opponentY: 0.8,
      opponentZ: 0,
      opponentRotation: Math.PI,
      opponentMomentum: 0,
      opponentBalance: 1.0,
      opponentCenterOfGravity: 0.5,
      opponentRecoveryFrames: 0,
      opponentAttackPhase: 'idle' as AttackPhase,
      opponentComboCount: 0,
      opponentOptimalDistance: 2.0,
      winner: null
    });
    
    // Start epic battle music!
    useAudio.getState().startBattleMusic();
  },
  
  resetRound: () => {
    console.log("[Battle] Resetting round");
    set({
      battlePhase: 'preRound',
      playerHealth: get().maxHealth,
      opponentHealth: get().maxHealth,
      roundTime: get().maxRoundTime,
      playerX: -5,
      playerY: 0.8,
      playerZ: 0,
      opponentX: 5,
      opponentY: 0.8,
      opponentZ: 0,
      playerVelocityX: 0,
      playerVelocityY: 0,
      playerVelocityZ: 0,
      opponentVelocityX: 0,
      opponentVelocityY: 0,
      opponentVelocityZ: 0,
      playerRotation: 0,
      opponentRotation: Math.PI,
      playerMomentum: 0,
      opponentMomentum: 0,
      playerBalance: 1.0,
      opponentBalance: 1.0,
      playerCenterOfGravity: 0.5,
      opponentCenterOfGravity: 0.5,
      playerRecoveryFrames: 0,
      opponentRecoveryFrames: 0,
      playerAttackPhase: 'idle' as AttackPhase,
      opponentAttackPhase: 'idle' as AttackPhase,
      playerComboCount: 0,
      opponentComboCount: 0,
      playerAttacking: false,
      opponentAttacking: false,
      winner: null
    });
    
    // Start after brief delay
    setTimeout(() => {
      get().startBattle();
    }, 2000);
  },
  
  updateRoundTimer: (delta) => {
    const { battlePhase, roundTime } = get();
    if (battlePhase !== 'fighting') return;
    
    const newTime = Math.max(0, roundTime - delta);
    set({ roundTime: newTime });
    
    // Time's up - whoever has more health wins
    if (newTime <= 0) {
      const { playerHealth, opponentHealth } = get();
      const winner = playerHealth > opponentHealth ? 'player' : 
                     opponentHealth > playerHealth ? 'opponent' : null;
      if (winner) {
        get().endBattle(winner);
      }
    }
  },
  
  movePlayer: (x, y) => {
    const currentX = get().playerX;
    const newX = Math.max(-10, Math.min(10, currentX + x)); // Arena bounds
    set({ 
      playerX: newX, 
      playerY: y,
      playerFacingRight: get().opponentX > newX // Face opponent
    });
  },
  
  playerJump: () => {
    const { playerGrounded, playerVelocityY, playerY } = get();
    if (playerGrounded && Math.abs(playerVelocityY) < 0.1) {
      console.log("[Battle] Player JUMPING!");
      // PERFECT tuning: apex = 0.8 + 0.2 + 0.8 = 1.8 units, airtime = 0.8s
      set({ 
        playerY: playerY + 0.2, // Immediate lift
        playerVelocityY: 4, // Balanced for 0.8s airtime & 1.8 unit apex
        playerGrounded: false 
      });
      
      // Play jump sound
      useAudio.getState().playJump();
    }
  },
  
  playerAttack: (type) => {
    const { playerAttacking, battlePhase, playerAttackPhase, playerBalance, playerRecoveryFrames } = get();
    if (playerAttacking || battlePhase !== 'fighting' || playerAttackPhase !== 'idle') return;
    
    // Can't attack if in recovery frames (vulnerable window after lost balance)
    if (playerRecoveryFrames > 0) {
      console.log("[Battle] Player in RECOVERY FRAMES - vulnerable!");
      return;
    }
    
    // Can't attack if balance is too low (stumbling)
    if (playerBalance < 0.3) {
      console.log("[Battle] Player off-balance - attack failed!");
      set({ playerRecoveryFrames: 0.4 }); // 400ms recovery window
      return;
    }
    
    console.log("[Battle] Player attack:", type, "- MASTER FIGHTING MECHANICS!");
    
    // PHASE 1: WIND-UP (Loading the attack with hip rotation)
    set({ 
      playerAttacking: true, 
      playerAttackType: type,
      playerAttackPhase: 'windup' as AttackPhase
    });
    
    const { playerStance, playerMomentum, playerX, playerRotation, playerCenterOfGravity } = get();
    
    // Calculate hip rotation for power generation (more rotation = more power)
    const targetHipRotation = type === 'punch' ? 0.3 : type === 'kick' ? 0.5 : 0.6;
    
    // Shift weight during windup (loading the stance)
    const windupWeightShift = type === 'punch' ? 0.1 : type === 'kick' ? 0.15 : 0.2;
    get().updatePlayerStance(windupWeightShift, targetHipRotation);
    
    // Wind-up timing based on attack type
    const windupTime = type === 'special' ? 250 : type === 'kick' ? 150 : 100;
    
    setTimeout(() => {
      // PHASE 2: CONTACT (Strike lands)
      set({ playerAttackPhase: 'contact' as AttackPhase });
      
      // Play attack sound at contact
      const audio = useAudio.getState();
      if (type === 'punch') audio.playPunch();
      else if (type === 'kick') audio.playKick();
      else if (type === 'special') audio.playSpecial();
      
      // HIT DETECTION with 3D positioning
      const { playerX, playerY, playerZ, opponentX, opponentY, opponentZ, opponentInvulnerable, playerStance, playerMomentum, playerBalance, playerCenterOfGravity } = get();
      const distanceX = Math.abs(playerX - opponentX);
      const distanceY = Math.abs(playerY - opponentY);
      const distanceZ = Math.abs(playerZ - opponentZ);
      const range = type === 'special' ? 3.5 : type === 'kick' ? 2.2 : 1.8;
      const heightRange = type === 'kick' ? 1.5 : 1.2;
      const depthRange = 1.5; // Z-axis tolerance
      
      const inRange = distanceX < range && distanceY < heightRange && distanceZ < depthRange;
      
      if (inRange && !opponentInvulnerable) {
        // === MASTER FIGHTING FORMULA ===
        // P ∝ (M_B · V_H) + (A_L · ω)
        // Where: M_B = body mass (fighter base), V_H = hip velocity, A_L = arm length, ω = angular velocity
        
        const baseDamage = type === 'special' ? 25 : type === 'kick' ? 15 : 10;
        
        // Hip rotation power (more torque = more damage)
        const hipPower = Math.abs(playerStance.hipRotation) / 0.6; // 0-1 based on max rotation
        
        // Momentum contribution (forward velocity amplifies damage)
        const momentumBonus = playerMomentum * 0.5; // 0-0.5x damage multiplier
        
        // Weight distribution (front-heavy = more power, but costs balance)
        const stanceBonus = (playerStance.weightFront - 0.5) * 0.4; // -0.2 to +0.2 based on stance
        
        // Center of gravity efficiency (neutral CG = best damage transfer)
        const cgBonus = 1.0 - Math.abs(playerCenterOfGravity - 0.5) * 0.5; // 0.75-1.0x
        
        // Attack type base multiplier (special moves are stronger but risky)
        const typeMultiplier = type === 'special' ? 1.3 : type === 'kick' ? 1.1 : 1.0;
        
        // FINAL POWER CALCULATION
        const powerMultiplier = cgBonus * typeMultiplier * (1.0 + hipPower * 0.5 + momentumBonus + stanceBonus);
        const damage = Math.floor(baseDamage * powerMultiplier);
        
        // Perfect hit bonus if very close (3D spacing reward)
        const perfectHit = distanceX < range * 0.5 && distanceY < heightRange * 0.5 && distanceZ < depthRange * 0.5;
        const finalDamage = perfectHit ? Math.floor(damage * 1.25) : damage;
        
        console.log(`[Battle] ⚡ HIT! Damage: ${finalDamage} (Hip: ${hipPower.toFixed(2)}, Momentum: ${playerMomentum.toFixed(2)}, CG: ${playerCenterOfGravity.toFixed(2)})${perfectHit ? ' 🔥PERFECT!' : ''}`);
        get().opponentTakeDamage(finalDamage);
        
        // Increment combo counter
        set({ playerComboCount: get().playerComboCount + 1 });
      } else {
        console.log(`[Battle] MISS! Distance: X:${distanceX.toFixed(2)} Y:${distanceY.toFixed(2)} Z:${distanceZ.toFixed(2)}`);
        // Missing breaks combo and costs balance
        set({ playerComboCount: 0 });
      }
      
      // PHASE 3: FOLLOW-THROUGH (Natural exit vector for next action)
      const contactTime = 80;
      setTimeout(() => {
        set({ playerAttackPhase: 'followthrough' as AttackPhase });
        
        // Weight transfer after strike (natural momentum flow)
        const followThroughDistance = 0.3 * (1 + playerMomentum * 0.5);
        const cos = Math.cos(playerRotation);
        const sin = Math.sin(playerRotation);
        
        // Update center of gravity based on follow-through
        const newCG = Math.min(0.8, Math.max(0.2, playerCenterOfGravity + (playerStance.weightFront - 0.5) * 0.2));
        
        set({
          playerX: Math.max(-10, Math.min(10, playerX + followThroughDistance * cos)),
          playerZ: Math.max(-3, Math.min(3, playerZ + followThroughDistance * sin)),
          playerStance: {
            ...playerStance,
            weightFront: Math.min(0.8, playerStance.weightFront + 0.15), // Weight shifts forward
            hipRotation: -targetHipRotation * 0.3 // Hips counter-rotate
          },
          playerCenterOfGravity: newCG,
          playerBalance: Math.max(0.35, playerBalance - 0.15), // Attack costs balance
          playerMomentum: Math.max(0, playerMomentum - 0.25) // Momentum consumed
        });
        
        // PHASE 4: RECOVERY (Vulnerable window based on attack type)
        const followThroughTime = type === 'special' ? 300 : type === 'kick' ? 200 : 150;
        setTimeout(() => {
          set({ 
            playerAttacking: false, 
            playerAttackType: null,
            playerAttackPhase: 'recovery' as AttackPhase,
            playerRecoveryFrames: type === 'special' ? 0.25 : type === 'kick' ? 0.15 : 0.1 // Vulnerability window
          });
          
          // Gradually return to idle
          const recoveryTime = type === 'special' ? 200 : type === 'kick' ? 100 : 80;
          setTimeout(() => {
            set({ 
              playerAttackPhase: 'idle' as AttackPhase,
              playerStance: {
                ...get().playerStance,
                hipRotation: 0 // Hips return to neutral
              }
            });
          }, recoveryTime);
        }, followThroughTime);
      }, contactTime);
    }, windupTime);
  },
  
  playerTakeDamage: (damage) => {
    const { playerInvulnerable, playerHealth, battlePhase } = get();
    if (playerInvulnerable || battlePhase !== 'fighting') return;
    
    console.log("[Battle] Player takes damage:", damage);
    const newHealth = Math.max(0, playerHealth - damage);
    set({ 
      playerHealth: newHealth,
      playerInvulnerable: true
    });
    
    // Play hit sound
    useAudio.getState().playHit();
    
    // Brief invulnerability
    setTimeout(() => {
      set({ playerInvulnerable: false });
    }, 500);
    
    // Check for KO
    if (newHealth <= 0) {
      get().endBattle('opponent');
    }
  },
  
  moveOpponent: (x, y) => {
    const currentX = get().opponentX;
    const newX = Math.max(-10, Math.min(10, currentX + x));
    set({ 
      opponentX: newX, 
      opponentY: y,
      opponentFacingRight: get().playerX > newX
    });
  },
  
  opponentJump: () => {
    const { opponentGrounded, opponentVelocityY, opponentY } = get();
    if (opponentGrounded && Math.abs(opponentVelocityY) < 0.1) {
      set({ 
        opponentY: opponentY + 0.2, // Match player liftoff
        opponentVelocityY: 4, // Match player velocity
        opponentGrounded: false 
      });
      
      // Play jump sound
      useAudio.getState().playJump();
    }
  },
  
  opponentAttack: (type) => {
    const { opponentAttacking, battlePhase, opponentRecoveryFrames } = get();
    if (opponentAttacking || battlePhase !== 'fighting' || opponentRecoveryFrames > 0) return;
    
    set({ 
      opponentAttacking: true, 
      opponentAttackType: type,
      opponentAttackPhase: 'windup' as AttackPhase
    });
    
    const { opponentStance } = get();
    const targetHipRotation = type === 'punch' ? 0.3 : type === 'kick' ? 0.5 : 0.6;
    
    // Opponent winds up (simpler AI version)
    const windupTime = type === 'special' ? 250 : type === 'kick' ? 150 : 100;
    
    setTimeout(() => {
      set({ opponentAttackPhase: 'contact' as AttackPhase });
      
      // Play attack sound
      const audio = useAudio.getState();
      if (type === 'punch') audio.playPunch();
      else if (type === 'kick') audio.playKick();
      else if (type === 'special') audio.playSpecial();
      
      // HIT DETECTION with 3D (opponent is AI, so simpler calculation)
      const { playerX, playerY, playerZ, opponentX, opponentY, opponentZ, playerInvulnerable, opponentMomentum, opponentBalance } = get();
      const distanceX = Math.abs(playerX - opponentX);
      const distanceY = Math.abs(playerY - opponentY);
      const distanceZ = Math.abs(playerZ - opponentZ);
      const range = type === 'special' ? 3.5 : type === 'kick' ? 2.2 : 1.8;
      const heightRange = type === 'kick' ? 1.5 : 1.2;
      const depthRange = 1.5;
      
      const inRange = distanceX < range && distanceY < heightRange && distanceZ < depthRange;
      
      if (inRange && !playerInvulnerable) {
        // Opponent damage uses simpler calculation (AI doesn't have as much nuance)
        const baseDamage = type === 'special' ? 25 : type === 'kick' ? 15 : 10;
        const aiBonus = opponentMomentum * 0.3; // Simpler momentum bonus
        const damage = Math.floor(baseDamage * (1.0 + aiBonus));
        
        console.log(`[Battle] 🎯 Opponent HIT! Distance: ${distanceX.toFixed(2)}, Damage: ${damage}`);
        get().playerTakeDamage(damage);
      }
      
      // Follow-through
      const contactTime = 80;
      setTimeout(() => {
        set({ opponentAttackPhase: 'followthrough' as AttackPhase });
        
        const followThroughTime = type === 'special' ? 300 : type === 'kick' ? 200 : 150;
        setTimeout(() => {
          set({ 
            opponentAttacking: false, 
            opponentAttackType: null,
            opponentAttackPhase: 'recovery' as AttackPhase,
            opponentRecoveryFrames: type === 'special' ? 0.2 : 0.1
          });
          
          const recoveryTime = type === 'special' ? 200 : type === 'kick' ? 100 : 80;
          setTimeout(() => {
            set({ 
              opponentAttackPhase: 'idle' as AttackPhase,
              opponentStance: {
                ...get().opponentStance,
                hipRotation: 0
              }
            });
          }, recoveryTime);
        }, followThroughTime);
      }, contactTime);
    }, windupTime);
  },
  
  opponentTakeDamage: (damage) => {
    const { opponentInvulnerable, opponentHealth, battlePhase } = get();
    if (opponentInvulnerable || battlePhase !== 'fighting') return;
    
    console.log("[Battle] Opponent takes damage:", damage);
    const newHealth = Math.max(0, opponentHealth - damage);
    set({ 
      opponentHealth: newHealth,
      opponentInvulnerable: true
    });
    
    // Play hit sound
    useAudio.getState().playHit();
    
    setTimeout(() => {
      set({ opponentInvulnerable: false });
    }, 500);
    
    if (newHealth <= 0) {
      get().endBattle('player');
    }
  },
  
  endBattle: (winner) => {
    console.log("[Battle] Battle ended. Winner:", winner);
    
    // LEGENDARY KO SEQUENCE - SLOW MOTION!
    set({ 
      battlePhase: 'ko',
      winner,
      timeScale: 0.3  // DRAMATIC SLOW-MOTION for KO!
    });
    
    // Play KO sound
    useAudio.getState().playKO();
    
    // Update wins and score
    const newBattleScore = winner === 'player' ? get().battleScore + 100 : get().battleScore;
    const newPlayerWins = winner === 'player' ? get().playerWins + 1 : get().playerWins;
    const newOpponentWins = winner === 'opponent' ? get().opponentWins + 1 : get().opponentWins;
    
    set({
      battleScore: newBattleScore,
      playerWins: newPlayerWins,
      opponentWins: newOpponentWins,
      totalBattles: get().totalBattles + 1
    });
    
    // Gradually speed back up over 1.5 seconds
    let timeElapsed = 0;
    const speedUpInterval = setInterval(() => {
      timeElapsed += 50;
      const progress = timeElapsed / 1500;
      const newTimeScale = 0.3 + (0.7 * progress); // 0.3 → 1.0
      set({ timeScale: Math.min(1.0, newTimeScale) });
      
      if (timeElapsed >= 1500) {
        clearInterval(speedUpInterval);
      }
    }, 50);
    
    // Show results after KO animation
    setTimeout(() => {
      set({ 
        battlePhase: 'results',
        timeScale: 1.0  // Reset time scale
      });
      // Play victory sound for winner
      if (winner === 'player') {
        useAudio.getState().playVictory();
      }
    }, 2500);
  },
  
  returnToMenu: () => {
    console.log("[Battle] Returning to menu");
    // Stop battle music
    useAudio.getState().stopBattleMusic();
    // Reset time scale
    set({ timeScale: 1.0 });
  },
  
  setTimeScale: (scale) => {
    set({ timeScale: scale });
  },
  
  setPlayerFighter: (fighterId) => {
    console.log("[Battle] Set player fighter:", fighterId);
    set({ playerFighterId: fighterId });
  },
  
  setOpponentFighter: (fighterId) => {
    console.log("[Battle] Set opponent fighter:", fighterId);
    set({ opponentFighterId: fighterId });
  },
  
  setArena: (arenaId) => {
    console.log("[Battle] Set arena:", arenaId);
    set({ selectedArenaId: arenaId });
  },
  
  // === NEW 3D COMBAT METHODS ===
  
  // Player 3D Movement
  playerMove3D: (forward, strafe) => {
    const { battlePhase, playerX, playerZ, playerRotation, playerStance, playerAttackPhase } = get();
    if (battlePhase !== 'fighting') return;
    
    // Reduced movement during attack phases
    const speedMod = playerAttackPhase === 'idle' || playerAttackPhase === 'recovery' ? 1.0 : 0.3;
    
    // Apply stance weight to movement speed (more front-heavy = faster forward, slower back)
    const forwardSpeed = forward * speedMod * (playerStance.weightFront + 0.5);
    const strafeSpeed = strafe * speedMod * 0.8; // Strafing slightly slower
    
    // Convert movement to world space based on rotation
    const cos = Math.cos(playerRotation);
    const sin = Math.sin(playerRotation);
    
    const newX = Math.max(-10, Math.min(10, playerX + strafeSpeed * cos - forwardSpeed * sin));
    const newZ = Math.max(-3, Math.min(3, playerZ + forwardSpeed * cos + strafeSpeed * sin));
    
    set({
      playerX: newX,
      playerZ: newZ,
      playerVelocityX: strafeSpeed * cos - forwardSpeed * sin,
      playerVelocityZ: forwardSpeed * cos + strafeSpeed * sin,
      playerMomentum: Math.abs(forward) > 0.5 ? Math.min(1.0, get().playerMomentum + 0.1) : get().playerMomentum * 0.95
    });
  },
  
  playerPivot: (angle) => {
    const { playerRotation, playerBalance } = get();
    // Pivoting affects balance slightly
    const newRotation = playerRotation + angle;
    const balanceCost = Math.abs(angle) * 0.1;
    
    set({
      playerRotation: newRotation,
      playerFacingRight: Math.cos(newRotation) > 0,
      playerBalance: Math.max(0, playerBalance - balanceCost)
    });
  },
  
  playerDash: (direction) => {
    const { playerMomentum, playerBalance, playerAttackPhase } = get();
    // Can't dash during active attack
    if (playerAttackPhase === 'windup' || playerAttackPhase === 'contact') return;
    
    const dashSpeed = 2.5;
    let forward = 0, strafe = 0;
    
    if (direction === 'forward') forward = dashSpeed;
    else if (direction === 'back') forward = -dashSpeed * 0.7; // Slower back dash
    else if (direction === 'left') strafe = -dashSpeed * 0.8;
    else if (direction === 'right') strafe = dashSpeed * 0.8;
    
    // Dash builds momentum but costs balance
    get().playerMove3D(forward, strafe);
    set({
      playerMomentum: Math.min(1.0, playerMomentum + 0.3),
      playerBalance: Math.max(0.3, playerBalance - 0.15)
    });
  },
  
  playerSlip: (direction) => {
    // Quick evasive sidestep - minimal balance cost
    const slipDistance = direction === 'left' ? -0.5 : 0.5;
    const { playerX } = get();
    
    set({
      playerX: Math.max(-10, Math.min(10, playerX + slipDistance)),
      playerBalance: Math.max(0.5, get().playerBalance - 0.05)
    });
  },
  
  updatePlayerStance: (weightShift, hipRotation) => {
    const { playerStance } = get();
    set({
      playerStance: {
        ...playerStance,
        weightFront: Math.max(0.3, Math.min(0.8, playerStance.weightFront + weightShift)),
        hipRotation: hipRotation
      }
    });
  },
  
  updatePlayerBalance: (delta) => {
    const { playerBalance, playerGrounded, playerAttackPhase } = get();
    
    // Recover balance over time when grounded and not attacking
    if (playerGrounded && playerAttackPhase === 'idle') {
      set({ playerBalance: Math.min(1.0, playerBalance + delta * 0.8) });
    }
    // Lose balance in air
    else if (!playerGrounded) {
      set({ playerBalance: Math.max(0.5, playerBalance - delta * 0.3) });
    }
  },
  
  updatePlayerRecoveryFrames: (delta) => {
    const { playerRecoveryFrames } = get();
    if (playerRecoveryFrames > 0) {
      set({ playerRecoveryFrames: Math.max(0, playerRecoveryFrames - delta) });
    }
  },
  
  updatePlayerMomentum: (delta) => {
    const { playerMomentum, playerVelocityX, playerVelocityZ } = get();
    
    // Decay momentum when not moving
    const isMoving = Math.abs(playerVelocityX) > 0.1 || Math.abs(playerVelocityZ) > 0.1;
    if (!isMoving) {
      set({ playerMomentum: Math.max(0, playerMomentum - delta * 0.5) });
    }
  },
  
  // Opponent 3D Movement (simpler AI version)
  opponentMove3D: (forward, strafe) => {
    const { battlePhase, opponentX, opponentZ, opponentRotation, opponentStance, opponentAttackPhase } = get();
    if (battlePhase !== 'fighting') return;
    
    const speedMod = opponentAttackPhase === 'idle' || opponentAttackPhase === 'recovery' ? 1.0 : 0.3;
    const forwardSpeed = forward * speedMod * (opponentStance.weightFront + 0.5);
    const strafeSpeed = strafe * speedMod * 0.8;
    
    const cos = Math.cos(opponentRotation);
    const sin = Math.sin(opponentRotation);
    
    const newX = Math.max(-10, Math.min(10, opponentX + strafeSpeed * cos - forwardSpeed * sin));
    const newZ = Math.max(-3, Math.min(3, opponentZ + forwardSpeed * cos + strafeSpeed * sin));
    
    set({
      opponentX: newX,
      opponentZ: newZ,
      opponentVelocityX: strafeSpeed * cos - forwardSpeed * sin,
      opponentVelocityZ: forwardSpeed * cos + strafeSpeed * sin,
      opponentMomentum: Math.abs(forward) > 0.5 ? Math.min(1.0, get().opponentMomentum + 0.1) : get().opponentMomentum * 0.95
    });
  },
  
  opponentPivot: (angle) => {
    const { opponentRotation, opponentBalance } = get();
    const newRotation = opponentRotation + angle;
    const balanceCost = Math.abs(angle) * 0.1;
    
    set({
      opponentRotation: newRotation,
      opponentFacingRight: Math.cos(newRotation) > 0,
      opponentBalance: Math.max(0, opponentBalance - balanceCost)
    });
  },
  
  opponentDash: (direction) => {
    const { opponentMomentum, opponentBalance, opponentAttackPhase } = get();
    if (opponentAttackPhase === 'windup' || opponentAttackPhase === 'contact') return;
    
    const dashSpeed = 2.5;
    let forward = 0, strafe = 0;
    
    if (direction === 'forward') forward = dashSpeed;
    else if (direction === 'back') forward = -dashSpeed * 0.7;
    else if (direction === 'left') strafe = -dashSpeed * 0.8;
    else if (direction === 'right') strafe = dashSpeed * 0.8;
    
    get().opponentMove3D(forward, strafe);
    set({
      opponentMomentum: Math.min(1.0, opponentMomentum + 0.3),
      opponentBalance: Math.max(0.3, opponentBalance - 0.15)
    });
  },
  
  updateOpponentBalance: (delta) => {
    const { opponentBalance, opponentGrounded, opponentAttackPhase } = get();
    
    if (opponentGrounded && opponentAttackPhase === 'idle') {
      set({ opponentBalance: Math.min(1.0, opponentBalance + delta * 0.8) });
    } else if (!opponentGrounded) {
      set({ opponentBalance: Math.max(0.5, opponentBalance - delta * 0.3) });
    }
  },
  
  updateOpponentMomentum: (delta) => {
    const { opponentMomentum, opponentVelocityX, opponentVelocityZ } = get();
    
    const isMoving = Math.abs(opponentVelocityX) > 0.1 || Math.abs(opponentVelocityZ) > 0.1;
    if (!isMoving) {
      set({ opponentMomentum: Math.max(0, opponentMomentum - delta * 0.5) });
    }
  },

  updateOpponentRecoveryFrames: (delta) => {
    const { opponentRecoveryFrames } = get();
    if (opponentRecoveryFrames > 0) {
      set({ opponentRecoveryFrames: Math.max(0, opponentRecoveryFrames - delta) });
    }
  }
}));

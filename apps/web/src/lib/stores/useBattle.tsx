import { create } from "zustand";
import { getFighterById } from "../characters";
import { getArenaById } from "../arenas";
import { useAudio } from "./useAudio";

export interface BattleState {
  // Selected fighters
  playerFighterId: string;
  opponentFighterId: string;
  selectedArenaId: string;
  
  // Battle stats
  playerHealth: number;
  opponentHealth: number;
  maxHealth: number;
  
  // ⚡ LEGENDARY SYNERGY & TRANSFORMATION SYSTEM
  playerSynergy: number;
  maxSynergy: number;
  playerTransformed: boolean;
  transformationTimeRemaining: number;
  maxTransformationTime: number;
  
  // 🔥 COMBO SYSTEM
  comboCount: number;
  comboDamage: number;
  comboTimer: number;
  maxComboTimer: number;
  maxCombo: number;
  
  // Battle state
  roundTime: number;
  maxRoundTime: number;
  battlePhase: 'preRound' | 'fighting' | 'ko' | 'results' | 'transforming';
  winner: 'player' | 'opponent' | null;
  timeScale: number;
  
  // Screen effects
  screenShake: number;
  screenFlash: string | null;
  hitStop: number;
  
  // Score tracking
  playerWins: number;
  opponentWins: number;
  totalBattles: number;
  battleScore: number;
  
  // Player position/state
  playerX: number;
  playerY: number;
  playerVelocityX: number;
  playerVelocityY: number;
  playerFacingRight: boolean;
  playerGrounded: boolean;
  
  // Opponent position/state
  opponentX: number;
  opponentY: number;
  opponentVelocityX: number;
  opponentVelocityY: number;
  opponentFacingRight: boolean;
  opponentGrounded: boolean;
  
  // Combat state
  playerAttacking: boolean;
  playerAttackType: 'punch' | 'kick' | 'special' | 'ultimate' | null;
  opponentAttacking: boolean;
  opponentAttackType: 'punch' | 'kick' | 'special' | null;
  playerInvulnerable: boolean;
  opponentInvulnerable: boolean;
  
  // Actions
  startBattle: () => void;
  resetRound: () => void;
  updateRoundTimer: (delta: number) => void;
  
  // Player actions
  movePlayer: (x: number, y: number) => void;
  playerJump: () => void;
  playerAttack: (type: 'punch' | 'kick' | 'special' | 'ultimate') => void;
  playerTakeDamage: (damage: number) => void;
  
  // Opponent actions
  moveOpponent: (x: number, y: number) => void;
  opponentJump: () => void;
  opponentAttack: (type: 'punch' | 'kick' | 'special') => void;
  opponentTakeDamage: (damage: number) => void;
  
  // ⚡ LEGENDARY SYNERGY & TRANSFORMATION
  addSynergy: (amount: number) => void;
  triggerTransformation: () => void;
  updateTransformation: (delta: number) => void;
  endTransformation: () => void;
  
  // 🔥 COMBO SYSTEM
  addToCombo: (damage: number) => void;
  updateCombo: (delta: number) => void;
  resetCombo: () => void;
  
  // Screen effects
  triggerScreenShake: (intensity: number) => void;
  triggerScreenFlash: (color: string) => void;
  triggerHitStop: (frames: number) => void;
  
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
  
  // ⚡ LEGENDARY SYNERGY & TRANSFORMATION
  playerSynergy: 0,
  maxSynergy: 100,
  playerTransformed: false,
  transformationTimeRemaining: 0,
  maxTransformationTime: 30, // 30 seconds of Kai-Jax power!
  
  // 🔥 COMBO SYSTEM
  comboCount: 0,
  comboDamage: 0,
  comboTimer: 0,
  maxComboTimer: 2, // 2 seconds to continue combo
  maxCombo: 0,
  
  roundTime: 99,
  maxRoundTime: 99,
  battlePhase: 'preRound',
  winner: null,
  timeScale: 1.0,
  
  // Screen effects
  screenShake: 0,
  screenFlash: null,
  hitStop: 0,
  
  playerWins: 0,
  opponentWins: 0,
  totalBattles: 0,
  battleScore: 0,
  
  playerX: -5,
  playerY: 0.8,
  playerVelocityX: 0,
  playerVelocityY: 0,
  playerFacingRight: true,
  playerGrounded: true,
  
  opponentX: 5,
  opponentY: 0.8,
  opponentVelocityX: 0,
  opponentVelocityY: 0,
  opponentFacingRight: false,
  opponentGrounded: true,
  
  playerAttacking: false,
  playerAttackType: null,
  opponentAttacking: false,
  opponentAttackType: null,
  playerInvulnerable: false,
  opponentInvulnerable: false,
  
  startBattle: () => {
    console.log("[Battle] ⚔️ Starting LEGENDARY battle!");
    set({
      battlePhase: 'fighting',
      roundTime: get().maxRoundTime,
      playerHealth: get().maxHealth,
      opponentHealth: get().maxHealth,
      playerX: -5,
      playerY: 0.8,
      opponentX: 5,
      opponentY: 0.8,
      winner: null,
      playerSynergy: 0,
      playerTransformed: false,
      transformationTimeRemaining: 0,
      comboCount: 0,
      comboDamage: 0,
      comboTimer: 0,
      maxCombo: 0,
      screenShake: 0,
      screenFlash: null,
      hitStop: 0,
    });
    
    useAudio.getState().startBattleMusic();
  },
  
  resetRound: () => {
    console.log("[Battle] 🔄 Resetting round");
    set({
      battlePhase: 'preRound',
      playerHealth: get().maxHealth,
      opponentHealth: get().maxHealth,
      roundTime: get().maxRoundTime,
      playerX: -5,
      playerY: 0.8,
      opponentX: 5,
      opponentY: 0.8,
      playerVelocityX: 0,
      playerVelocityY: 0,
      opponentVelocityX: 0,
      opponentVelocityY: 0,
      playerAttacking: false,
      opponentAttacking: false,
      winner: null,
      playerSynergy: 0,
      playerTransformed: false,
      transformationTimeRemaining: 0,
      comboCount: 0,
      comboDamage: 0,
      comboTimer: 0,
    });
    
    setTimeout(() => {
      get().startBattle();
    }, 2000);
  },
  
  updateRoundTimer: (delta) => {
    const { battlePhase, roundTime, hitStop } = get();
    if (battlePhase !== 'fighting') return;
    
    // Handle hit stop (freeze game briefly for impact)
    if (hitStop > 0) {
      set({ hitStop: hitStop - delta });
      return;
    }
    
    const newTime = Math.max(0, roundTime - delta);
    set({ roundTime: newTime });
    
    // Update transformation timer
    get().updateTransformation(delta);
    
    // Update combo timer
    get().updateCombo(delta);
    
    // Decay screen shake
    if (get().screenShake > 0) {
      set({ screenShake: Math.max(0, get().screenShake - delta * 10) });
    }
    
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
    const newX = Math.max(-10, Math.min(10, currentX + x));
    set({ 
      playerX: newX, 
      playerY: y,
      playerFacingRight: get().opponentX > newX
    });
  },
  
  playerJump: () => {
    const { playerGrounded, playerVelocityY, playerY } = get();
    if (playerGrounded && Math.abs(playerVelocityY) < 0.1) {
      console.log("[Battle] 🦘 Player JUMPING!");
      set({ 
        playerY: playerY + 0.2,
        playerVelocityY: 4,
        playerGrounded: false 
      });
      useAudio.getState().playJump();
    }
  },
  
  playerAttack: (type) => {
    const { playerAttacking, battlePhase, playerTransformed } = get();
    if (playerAttacking || (battlePhase !== 'fighting' && battlePhase !== 'transforming')) return;
    
    // Ultimate requires transformation
    if (type === 'ultimate' && !playerTransformed) return;
    
    console.log("[Battle] ⚔️ Player attack:", type, playerTransformed ? "(TRANSFORMED!)" : "");
    set({ 
      playerAttacking: true, 
      playerAttackType: type 
    });
    
    const audio = useAudio.getState();
    if (type === 'punch') audio.playPunch();
    else if (type === 'kick') audio.playKick();
    else if (type === 'special' || type === 'ultimate') audio.playSpecial();
    
    const { playerX, opponentX, opponentInvulnerable } = get();
    const distance = Math.abs(playerX - opponentX);
    
    // Transformed attacks have more range and damage!
    const transformBonus = playerTransformed ? 1.5 : 1;
    const range = (type === 'ultimate' ? 5 : type === 'special' ? 3 : type === 'kick' ? 2 : 1.5) * transformBonus;
    
    if (distance < range && !opponentInvulnerable) {
      const baseDamage = type === 'ultimate' ? 40 : type === 'special' ? 20 : type === 'kick' ? 15 : 10;
      const damage = Math.round(baseDamage * transformBonus);
      
      get().opponentTakeDamage(damage);
      get().addToCombo(damage);
      get().addSynergy(type === 'special' ? 15 : type === 'kick' ? 10 : 5);
      
      // Screen effects for big hits!
      if (damage >= 20) {
        get().triggerScreenShake(damage / 10);
        get().triggerHitStop(damage / 100);
      }
      if (type === 'ultimate') {
        get().triggerScreenFlash('#FFD700');
        get().triggerScreenShake(5);
        get().triggerHitStop(0.15);
      }
    }
    
    const duration = type === 'ultimate' ? 1200 : type === 'special' ? 800 : type === 'kick' ? 600 : 400;
    setTimeout(() => {
      set({ playerAttacking: false, playerAttackType: null });
    }, duration);
  },
  
  playerTakeDamage: (damage) => {
    const { playerInvulnerable, playerHealth, battlePhase } = get();
    if (playerInvulnerable || battlePhase !== 'fighting') return;
    
    console.log("[Battle] 💥 Player takes damage:", damage);
    const newHealth = Math.max(0, playerHealth - damage);
    set({ 
      playerHealth: newHealth,
      playerInvulnerable: true
    });
    
    useAudio.getState().playHit();
    get().resetCombo(); // Getting hit breaks combo
    
    setTimeout(() => {
      set({ playerInvulnerable: false });
    }, 500);
    
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
        opponentY: opponentY + 0.2,
        opponentVelocityY: 4,
        opponentGrounded: false 
      });
      useAudio.getState().playJump();
    }
  },
  
  opponentAttack: (type) => {
    const { opponentAttacking, battlePhase } = get();
    if (opponentAttacking || battlePhase !== 'fighting') return;
    
    set({ 
      opponentAttacking: true, 
      opponentAttackType: type 
    });
    
    const audio = useAudio.getState();
    if (type === 'punch') audio.playPunch();
    else if (type === 'kick') audio.playKick();
    else if (type === 'special') audio.playSpecial();
    
    const { playerX, opponentX, playerInvulnerable } = get();
    const distance = Math.abs(playerX - opponentX);
    const range = type === 'special' ? 3 : type === 'kick' ? 2 : 1.5;
    
    if (distance < range && !playerInvulnerable) {
      const damage = type === 'special' ? 20 : type === 'kick' ? 15 : 10;
      get().playerTakeDamage(damage);
    }
    
    setTimeout(() => {
      set({ opponentAttacking: false, opponentAttackType: null });
    }, type === 'special' ? 800 : type === 'kick' ? 600 : 400);
  },
  
  opponentTakeDamage: (damage) => {
    const { opponentInvulnerable, opponentHealth, battlePhase } = get();
    if (opponentInvulnerable || battlePhase !== 'fighting') return;
    
    console.log("[Battle] 💥 Opponent takes damage:", damage);
    const newHealth = Math.max(0, opponentHealth - damage);
    set({ 
      opponentHealth: newHealth,
      opponentInvulnerable: true
    });
    
    useAudio.getState().playHit();
    
    setTimeout(() => {
      set({ opponentInvulnerable: false });
    }, 500);
    
    if (newHealth <= 0) {
      get().endBattle('player');
    }
  },
  
  // ⚡ LEGENDARY SYNERGY SYSTEM
  addSynergy: (amount) => {
    const { playerSynergy, maxSynergy, playerTransformed } = get();
    if (playerTransformed) return; // Can't build synergy while transformed
    
    const newSynergy = Math.min(maxSynergy, playerSynergy + amount);
    set({ playerSynergy: newSynergy });
    
    console.log("[Battle] ⚡ Synergy:", newSynergy, "/", maxSynergy);
    
    // Flash when ready to transform!
    if (newSynergy >= maxSynergy && playerSynergy < maxSynergy) {
      get().triggerScreenFlash('#FFD700');
      console.log("[Battle] 🌟 FUSION READY! Press T to transform into KAI-JAX!");
    }
  },
  
  triggerTransformation: () => {
    const { playerSynergy, maxSynergy, playerTransformed } = get();
    if (playerTransformed || playerSynergy < maxSynergy) return;
    
    console.log("[Battle] ⚡⚡⚡ TRANSFORMING INTO KAI-JAX! ⚡⚡⚡");
    
    // Enter transformation phase
    set({ 
      battlePhase: 'transforming',
      timeScale: 0.1, // Super slow-mo for cinematic transformation
    });
    
    // Epic screen effects
    get().triggerScreenFlash('#FFFFFF');
    get().triggerScreenShake(10);
    
    // Complete transformation after 2 seconds
    setTimeout(() => {
      set({
        playerTransformed: true,
        playerSynergy: 0,
        transformationTimeRemaining: get().maxTransformationTime,
        battlePhase: 'fighting',
        timeScale: 1.0,
        // Heal a bit on transformation!
        playerHealth: Math.min(get().maxHealth, get().playerHealth + 25),
      });
      
      // Another flash
      get().triggerScreenFlash('#FFD700');
      console.log("[Battle] 🦊🦔 KAI-JAX AWAKENED! 30 seconds of ULTIMATE POWER!");
    }, 2000);
  },
  
  updateTransformation: (delta) => {
    const { playerTransformed, transformationTimeRemaining } = get();
    if (!playerTransformed) return;
    
    const newTime = transformationTimeRemaining - delta;
    set({ transformationTimeRemaining: newTime });
    
    // Warning flash at 5 seconds
    if (newTime <= 5 && transformationTimeRemaining > 5) {
      get().triggerScreenFlash('#FF6B6B');
      console.log("[Battle] ⚠️ Transformation ending soon!");
    }
    
    if (newTime <= 0) {
      get().endTransformation();
    }
  },
  
  endTransformation: () => {
    console.log("[Battle] Transformation ended - reverting to normal form");
    set({
      playerTransformed: false,
      transformationTimeRemaining: 0,
    });
    get().triggerScreenFlash('#A855F7');
  },
  
  // 🔥 COMBO SYSTEM
  addToCombo: (damage) => {
    const { comboCount, comboDamage, maxComboTimer, maxCombo } = get();
    const newCombo = comboCount + 1;
    const newMaxCombo = Math.max(maxCombo, newCombo);
    
    set({
      comboCount: newCombo,
      comboDamage: comboDamage + damage,
      comboTimer: maxComboTimer,
      maxCombo: newMaxCombo,
    });
    
    console.log("[Battle] 🔥 COMBO:", newCombo, "| Damage:", comboDamage + damage);
    
    // Big combo bonus synergy!
    if (newCombo % 5 === 0) {
      get().addSynergy(10);
    }
  },
  
  updateCombo: (delta) => {
    const { comboTimer, comboCount } = get();
    if (comboCount === 0) return;
    
    const newTimer = comboTimer - delta;
    if (newTimer <= 0) {
      get().resetCombo();
    } else {
      set({ comboTimer: newTimer });
    }
  },
  
  resetCombo: () => {
    set({
      comboCount: 0,
      comboDamage: 0,
      comboTimer: 0,
    });
  },
  
  // Screen effects
  triggerScreenShake: (intensity) => {
    set({ screenShake: intensity });
  },
  
  triggerScreenFlash: (color) => {
    set({ screenFlash: color });
    setTimeout(() => {
      set({ screenFlash: null });
    }, 200);
  },
  
  triggerHitStop: (duration) => {
    set({ hitStop: duration });
  },
  
  endBattle: (winner) => {
    console.log("[Battle] 🏆 Battle ended. Winner:", winner);
    
    // LEGENDARY KO SEQUENCE
    set({ 
      battlePhase: 'ko',
      winner,
      timeScale: 0.3,
      playerTransformed: false, // End transformation on KO
      transformationTimeRemaining: 0,
    });
    
    get().triggerScreenFlash(winner === 'player' ? '#FFD700' : '#FF0000');
    get().triggerScreenShake(8);
    
    useAudio.getState().playKO();
    
    // Calculate score with bonuses
    const { comboCount, maxCombo, playerHealth, maxHealth } = get();
    const baseScore = winner === 'player' ? 100 : 0;
    const comboBonus = maxCombo * 5;
    const healthBonus = winner === 'player' ? Math.round((playerHealth / maxHealth) * 50) : 0;
    const totalScore = baseScore + comboBonus + healthBonus;
    
    const newBattleScore = get().battleScore + totalScore;
    const newPlayerWins = winner === 'player' ? get().playerWins + 1 : get().playerWins;
    const newOpponentWins = winner === 'opponent' ? get().opponentWins + 1 : get().opponentWins;
    
    set({
      battleScore: newBattleScore,
      playerWins: newPlayerWins,
      opponentWins: newOpponentWins,
      totalBattles: get().totalBattles + 1
    });
    
    // Gradually speed back up
    let timeElapsed = 0;
    const speedUpInterval = setInterval(() => {
      timeElapsed += 50;
      const progress = timeElapsed / 1500;
      const newTimeScale = 0.3 + (0.7 * progress);
      set({ timeScale: Math.min(1.0, newTimeScale) });
      
      if (timeElapsed >= 1500) {
        clearInterval(speedUpInterval);
      }
    }, 50);
    
    setTimeout(() => {
      set({ 
        battlePhase: 'results',
        timeScale: 1.0
      });
      if (winner === 'player') {
        useAudio.getState().playVictory();
      }
    }, 2500);
  },
  
  returnToMenu: () => {
    console.log("[Battle] 🏠 Returning to menu");
    useAudio.getState().stopBattleMusic();
    set({ 
      timeScale: 1.0,
      playerTransformed: false,
      transformationTimeRemaining: 0,
      playerSynergy: 0,
    });
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
  }
}));

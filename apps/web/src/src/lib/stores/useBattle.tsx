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
  
  // Player position/state (simple 2D for arena)
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
  playerAttackType: 'punch' | 'kick' | 'special' | null;
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
  playerAttack: (type: 'punch' | 'kick' | 'special') => void;
  playerTakeDamage: (damage: number) => void;
  
  // Opponent actions
  moveOpponent: (x: number, y: number) => void;
  opponentJump: () => void;
  opponentAttack: (type: 'punch' | 'kick' | 'special') => void;
  opponentTakeDamage: (damage: number) => void;
  
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
  
  // Player starts on left
  playerX: -5,
  playerY: 0.8,
  playerVelocityX: 0,
  playerVelocityY: 0,
  playerFacingRight: true,
  playerGrounded: true,
  
  // Opponent starts on right
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
    console.log("[Battle] Starting battle");
    set({
      battlePhase: 'fighting',
      roundTime: get().maxRoundTime,
      playerHealth: get().maxHealth,
      opponentHealth: get().maxHealth,
      playerX: -5,
      playerY: 0.8,
      opponentX: 5,
      opponentY: 0.8,
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
      opponentX: 5,
      opponentY: 0.8,
      playerVelocityX: 0,
      playerVelocityY: 0,
      opponentVelocityX: 0,
      opponentVelocityY: 0,
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
    const { playerAttacking, battlePhase } = get();
    if (playerAttacking || battlePhase !== 'fighting') return;
    
    console.log("[Battle] Player attack:", type);
    set({ 
      playerAttacking: true, 
      playerAttackType: type 
    });
    
    // Play attack sound
    const audio = useAudio.getState();
    if (type === 'punch') audio.playPunch();
    else if (type === 'kick') audio.playKick();
    else if (type === 'special') audio.playSpecial();
    
    // Check if hit opponent
    const { playerX, opponentX, opponentInvulnerable } = get();
    const distance = Math.abs(playerX - opponentX);
    const range = type === 'special' ? 3 : type === 'kick' ? 2 : 1.5;
    
    if (distance < range && !opponentInvulnerable) {
      const damage = type === 'special' ? 20 : type === 'kick' ? 15 : 10;
      get().opponentTakeDamage(damage);
    }
    
    // Reset attack after animation
    setTimeout(() => {
      set({ playerAttacking: false, playerAttackType: null });
    }, type === 'special' ? 800 : type === 'kick' ? 600 : 400);
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
    const { opponentAttacking, battlePhase } = get();
    if (opponentAttacking || battlePhase !== 'fighting') return;
    
    set({ 
      opponentAttacking: true, 
      opponentAttackType: type 
    });
    
    // Play attack sound
    const audio = useAudio.getState();
    if (type === 'punch') audio.playPunch();
    else if (type === 'kick') audio.playKick();
    else if (type === 'special') audio.playSpecial();
    
    // Check if hit player
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
  }
}));

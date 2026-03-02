import { create } from "zustand";
import { useAudio } from "./useAudio";
import { useMissions } from "./useMissions";
import { useDifficulty, getDamageTakenMultiplier } from "./useDifficulty";
import { useRunner } from "./useRunner";
import { getCharacterMoves } from "../characterMoves";
import {
  getClashPriority,
  MOVES,
  ATTACK_TYPE_TO_MOVE,
  getMoveFrameTime,
  isInActiveWindow,
  FRAME_TIME,
} from "../combatSystems";

const DEFAULT_MAX_COMBO_TIMER = 2.3;
const UPGRADED_MAX_COMBO_TIMER = 2.5;

function getEffectiveMaxComboTimer(): number {
  return useRunner.getState().unlockedUpgrades.includes("comboWindow")
    ? UPGRADED_MAX_COMBO_TIMER
    : DEFAULT_MAX_COMBO_TIMER;
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
  
  // ⚡ LEGENDARY SYNERGY & TRANSFORMATION SYSTEM
  playerSynergy: number;
  maxSynergy: number;
  playerTransformed: boolean;
  transformationTimeRemaining: number;
  maxTransformationTime: number;
  playerPreFusionFighterId: string | null;

  // 🌌 OVERDRIVE METER — "Multiverse Overdrive" ultimate gate
  playerOverdrive: number;
  maxOverdrive: number;
  combatInactivityTimer: number;
  /** Super armor during ultimate activation (seconds remaining) */
  ultimateSuperArmorRemaining: number;
  
  // 🔥 COMBO SYSTEM
  comboCount: number;
  comboDamage: number;
  comboTimer: number;
  maxComboTimer: number;
  maxCombo: number;
  
  // Battle state
  roundTime: number;
  maxRoundTime: number;
  battlePhase: 'preRound' | 'fighting' | 'ko' | 'results' | 'transforming' | 'paused';
  winner: 'player' | 'opponent' | null;
  timeScale: number;
  
  // Screen effects
  screenShake: number;
  screenFlash: string | null;
  hitStop: number;

  // Floating damage numbers
  damageNumbers: { id: number; x: number; y: number; amount: number; isPlayerHit: boolean }[];
  addDamageNumber: (x: number, y: number, amount: number, isPlayerHit: boolean) => void;
  
  // Score tracking
  playerWins: number;
  opponentWins: number;
  totalBattles: number;
  battleScore: number;

  // Post-match stats (this round)
  damageDealt: number;
  roundTimeSurvived: number;
  
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
  playerAttackElapsed: number;
  playerAttackHasHit: boolean;
  playerComboStep: number;
  opponentAttacking: boolean;
  opponentAttackType: 'punch' | 'kick' | 'special' | null;
  opponentAttackElapsed: number;
  opponentAttackHasHit: boolean;
  playerInvulnerable: boolean;
  opponentInvulnerable: boolean;
  opponentPersonality: 'aggressive' | 'defensive';
  
  // Actions
  startBattle: () => void;
  resetRound: () => void;
  updateRoundTimer: (delta: number) => void;
  tickPlayerAttack: (delta: number) => void;
  tickOpponentAttack: (delta: number) => void;
  
  // Player actions
  movePlayer: (x: number, y: number) => void;
  playerJump: () => void;
  playerAttack: (type: 'punch' | 'kick' | 'special' | 'ultimate') => void;
  attemptComboCancel: () => boolean;
  playerTakeDamage: (damage: number, attackType?: 'punch' | 'kick' | 'special') => void;
  
  // Opponent actions
  moveOpponent: (x: number, y: number) => void;
  opponentJump: () => void;
  opponentAttack: (type: 'punch' | 'kick' | 'special') => void;
  opponentTakeDamage: (damage: number, attackType?: 'punch' | 'kick' | 'special' | 'ultimate') => void;
  
  // ⚡ LEGENDARY SYNERGY & TRANSFORMATION
  addSynergy: (amount: number) => void;
  triggerTransformation: () => void;
  updateTransformation: (delta: number) => void;
  endTransformation: () => void;

  // 🌌 OVERDRIVE — fills on deal/receive damage, drains when camping
  addOverdrive: (amount: number) => void;
  updateOverdrive: (delta: number) => void;

  // 🤝 ASSIST — one per stock/round (Support Summons)
  playerAssistsRemaining: number;
  summonAssist: () => void;

  // 🏛️ ENVIRONMENT — terrain breaks under heavy hits (0-1)
  stageCrackLevel: number;
  
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
  legendaryFinish: boolean;
  returnToMenu: () => void;
  setTimeScale: (scale: number) => void;
  
  // Setup
  setPlayerFighter: (fighterId: string) => void;
  setOpponentFighter: (fighterId: string) => void;
  setArena: (arenaId: string) => void;
  setOpponentPersonality: (personality: 'aggressive' | 'defensive') => void;

  togglePause: () => void;
}

let _damageNumberId = 0;

function hapticHit(): void {
  try {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate(50);
    }
  } catch {
    // ignore
  }
}

function hapticKO(): void {
  try {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate([50, 50, 100]);
    }
  } catch {
    // ignore
  }
}

export const useBattle = create<BattleState>((set, get) => ({
  // Initial state
  playerFighterId: 'jaxon',
  opponentFighterId: 'kaison',
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
  playerPreFusionFighterId: null,

  // 🌌 OVERDRIVE
  playerOverdrive: 0,
  maxOverdrive: 100,
  combatInactivityTimer: 0,
  ultimateSuperArmorRemaining: 0,
  playerAssistsRemaining: 1,
  stageCrackLevel: 0,
  
  // 🔥 COMBO SYSTEM
  comboCount: 0,
  comboDamage: 0,
  comboTimer: 0,
  maxComboTimer: DEFAULT_MAX_COMBO_TIMER, // base; upgraded to 2.5s if comboWindow unlocked
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
  damageNumbers: [] as { id: number; x: number; y: number; amount: number; isPlayerHit: boolean }[],

  playerWins: 0,
  opponentWins: 0,
  totalBattles: 0,
  battleScore: 0,

  damageDealt: 0,
  roundTimeSurvived: 0,
  
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
  playerAttackElapsed: 0,
  playerAttackHasHit: false,
  playerComboStep: 0,
  legendaryFinish: false,
  opponentAttacking: false,
  opponentAttackType: null,
  opponentAttackElapsed: 0,
  opponentAttackHasHit: false,
  playerInvulnerable: false,
  opponentInvulnerable: false,
  opponentPersonality: 'aggressive',
  
  startBattle: () => {
    const maxComboTimer = getEffectiveMaxComboTimer();
    set({
      battlePhase: 'fighting',
      maxComboTimer,
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
      playerOverdrive: 0,
      combatInactivityTimer: 0,
      ultimateSuperArmorRemaining: 0,
      comboCount: 0,
      comboDamage: 0,
      comboTimer: 0,
      maxCombo: 0,
      damageDealt: 0,
      roundTimeSurvived: 0,
      screenShake: 0,
      screenFlash: null,
      hitStop: 0,
      damageNumbers: [],
    });
    
    useAudio.getState().startBattleMusic();
  },
  
  resetRound: () => {
    const maxComboTimer = getEffectiveMaxComboTimer();
    set({
      battlePhase: 'preRound',
      maxComboTimer,
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
      playerAttackType: null,
      playerAttackElapsed: 0,
      playerAttackHasHit: false,
      playerComboStep: 0,
      legendaryFinish: false,
      opponentAttacking: false,
      opponentAttackType: null,
      opponentAttackElapsed: 0,
      opponentAttackHasHit: false,
      winner: null,
      playerSynergy: 0,
      playerTransformed: false,
      transformationTimeRemaining: 0,
      playerPreFusionFighterId: null,
      playerOverdrive: 0,
      combatInactivityTimer: 0,
      ultimateSuperArmorRemaining: 0,
      playerAssistsRemaining: 1,
      stageCrackLevel: 0,
      comboCount: 0,
      comboDamage: 0,
      comboTimer: 0,
      damageNumbers: [],
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
    
    get().tickPlayerAttack(delta);
    get().tickOpponentAttack(delta);
    get().updateTransformation(delta);
    get().updateCombo(delta);

    // Update overdrive (drain when camping, update super armor)
    get().updateOverdrive(delta);

    // Mission survival timers (only does work if a mission is active)
    useMissions.getState().tickSurvival(delta);
    
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
      set({ 
        playerY: playerY + 0.2,
        playerVelocityY: 4.2,
        playerGrounded: false 
      });
      useAudio.getState().playJump();
    }
  },
  
  playerAttack: (type) => {
    const { playerAttacking, battlePhase, playerTransformed } = get();
    if (playerAttacking || (battlePhase !== 'fighting' && battlePhase !== 'transforming')) return;

    const { playerFighterId, playerOverdrive, maxOverdrive } = get();
    const hasNativeUltimate = ['kai-jax', 'kai', 'jax', 'boryn'].includes(playerFighterId);
    const canUltimate = playerOverdrive >= maxOverdrive && (playerTransformed || hasNativeUltimate);
    if (type === 'ultimate' && !canUltimate) return;

    if (type === 'ultimate') {
      set({
        playerOverdrive: 0,
        ultimateSuperArmorRemaining: 0.5,
      });
    }

    const { playerX, opponentX, opponentInvulnerable, opponentAttacking, opponentAttackType } = get();
    const distance = Math.abs(playerX - opponentX);
    const moves = getCharacterMoves(playerFighterId);
    const transformBonus = playerTransformed ? 1.5 : 1;
    const range = (type === 'ultimate' ? moves.ultimateRange : type === 'special' ? moves.specialRange : type === 'kick' ? 2 : 1.5) * transformBonus;

    if (distance < range && !opponentInvulnerable) {
      if (opponentAttacking && opponentAttackType) {
        const myPriority = getClashPriority(type);
        const theirPriority = getClashPriority(opponentAttackType);
        if (myPriority === theirPriority) {
          get().triggerScreenFlash('#FFFFFF');
          get().triggerHitStop(0.2);
          get().triggerScreenShake(4);
          return;
        }
        if (theirPriority > myPriority) return;
      }
    }

    const comboStep = type === 'punch' ? 0 : 0;
    set({
      playerAttacking: true,
      playerAttackType: type,
      playerAttackElapsed: 0,
      playerAttackHasHit: false,
      playerComboStep: type === 'kick' || type === 'special' || type === 'ultimate' ? 0 : comboStep,
    });

    if (type === 'special' || type === 'ultimate') useMissions.getState().recordMove(type);

    const audio = useAudio.getState();
    if (type === 'punch') audio.playPunch();
    else if (type === 'kick') audio.playKick();
    else if (type === 'special' || type === 'ultimate') audio.playSpecial();
  },

  attemptComboCancel: () => {
    const { playerAttacking, playerAttackType, playerComboStep, playerAttackElapsed } = get();
    if (!playerAttacking || playerAttackType !== 'punch' || playerComboStep >= 2) return false;
    const moveKey = `light${playerComboStep + 1}` as keyof typeof MOVES;
    const move = MOVES[moveKey];
    if (!move || move.cancelAt <= 0) return false;
    const timing = getMoveFrameTime(move);
    if (playerAttackElapsed < timing.cancelTime) return false;
    set({
      playerAttackType: 'punch',
      playerAttackElapsed: 0,
      playerAttackHasHit: false,
      playerComboStep: playerComboStep + 1,
    });
    useAudio.getState().playPunch();
    return true;
  },

  tickPlayerAttack: (delta) => {
    const { playerAttacking, playerAttackType, playerAttackElapsed, playerAttackHasHit, playerComboStep } = get();
    if (!playerAttacking || !playerAttackType) return;

    const baseMoveKey = ATTACK_TYPE_TO_MOVE[playerAttackType];
    const moveKey = (playerAttackType === 'punch' ? (`light${Math.min(playerComboStep + 1, 3)}` as keyof typeof MOVES) : baseMoveKey);
    const move = moveKey ? MOVES[moveKey] : null;
    if (!move) {
      set({ playerAttacking: false, playerAttackType: null, playerAttackElapsed: 0, playerAttackHasHit: false, playerComboStep: 0 });
      return;
    }

    const timing = getMoveFrameTime(move);
    const newElapsed = playerAttackElapsed + delta;

    if (!playerAttackHasHit && isInActiveWindow(move, newElapsed)) {
      const { playerX, opponentX, opponentInvulnerable, playerFighterId, playerTransformed } = get();
      const moves = getCharacterMoves(playerFighterId);
      const transformBonus = playerTransformed ? 1.5 : 1;
      const range = (playerAttackType === 'ultimate' ? moves.ultimateRange : playerAttackType === 'special' ? moves.specialRange : playerAttackType === 'kick' ? 2 : 1.5) * transformBonus;
      const distance = Math.abs(playerX - opponentX);

      if (distance < range && !opponentInvulnerable) {
        const baseDamage = playerAttackType === 'ultimate' ? moves.ultimateDamage : playerAttackType === 'special' ? moves.specialDamage : move.damage;
        const damage = Math.round(baseDamage * transformBonus);
        get().opponentTakeDamage(damage, playerAttackType);
        get().addToCombo(damage);
        get().addSynergy(playerAttackType === 'special' ? 15 : playerAttackType === 'kick' ? 10 : 5);
        get().addOverdrive(damage * 0.4);
        useMissions.getState().recordHit(playerAttackType);
        const stopSec = (move.hitStopFrames * FRAME_TIME);
        get().triggerHitStop(stopSec);
        get().triggerScreenShake(Math.max(0.5, damage / 8));
        if (playerAttackType === 'ultimate') {
          get().triggerScreenFlash('#FFD700');
        }
        set({ playerAttackHasHit: true });
      }
    }

    if (newElapsed >= timing.totalTime) {
      set({ playerAttacking: false, playerAttackType: null, playerAttackElapsed: 0, playerAttackHasHit: false, playerComboStep: 0 });
    } else {
      set({ playerAttackElapsed: newElapsed });
    }
  },

  playerTakeDamage: (damage, attackType) => {
    const { playerInvulnerable, playerHealth, battlePhase, playerX, playerY, ultimateSuperArmorRemaining } = get();
    if (playerInvulnerable || battlePhase !== 'fighting' || ultimateSuperArmorRemaining > 0) return;

    const mult = getDamageTakenMultiplier(useDifficulty.getState().difficulty);
    const scaledDamage = Math.round(damage * mult);
    const newHealth = Math.max(0, playerHealth - scaledDamage);
    const knockbackMult = attackType === 'special' ? 0.08 : 0.06;
    const knockback = Math.min(1.2, damage * knockbackMult);
    const newX = Math.max(-10, Math.min(10, playerX - knockback));
    set({
      playerHealth: newHealth,
      playerInvulnerable: true,
      playerX: newX,
      playerAttacking: false,
      playerAttackType: null,
      playerAttackElapsed: 0,
      playerAttackHasHit: false,
      playerComboStep: 0,
    });

    get().addDamageNumber(playerX, playerY, scaledDamage, true);
    get().addOverdrive(scaledDamage * 0.35); // Meter also fills on receiving damage
    const shakeBonus = attackType === 'special' ? 1.5 : 1;
    get().triggerScreenShake(Math.max(0.6, scaledDamage / 6) * shakeBonus);
    get().triggerHitStop(Math.max(0.02, scaledDamage / 400) * (attackType === 'special' ? 1.3 : 1));
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
        opponentVelocityY: 4.2,
        opponentGrounded: false 
      });
      useAudio.getState().playJump();
    }
  },
  
  opponentAttack: (type) => {
    const { opponentAttacking, battlePhase, opponentFighterId } = get();
    if (opponentAttacking || battlePhase !== 'fighting') return;

    const { playerX, opponentX, playerInvulnerable, playerAttacking, playerAttackType } = get();
    const distance = Math.abs(playerX - opponentX);
    const moves = getCharacterMoves(opponentFighterId);
    const range = type === 'special' ? moves.specialRange : type === 'kick' ? 2 : 1.5;

    if (distance < range && !playerInvulnerable) {
      if (playerAttacking && playerAttackType) {
        const myPriority = getClashPriority(type);
        const theirPriority = getClashPriority(playerAttackType);
        if (myPriority === theirPriority) return;
        if (theirPriority > myPriority) return;
      }
    }

    set({
      opponentAttacking: true,
      opponentAttackType: type,
      opponentAttackElapsed: 0,
      opponentAttackHasHit: false,
    });

    const audio = useAudio.getState();
    if (type === 'punch') audio.playPunch();
    else if (type === 'kick') audio.playKick();
    else if (type === 'special') audio.playSpecial();
  },

  tickOpponentAttack: (delta) => {
    const { opponentAttacking, opponentAttackType, opponentAttackElapsed, opponentAttackHasHit } = get();
    if (!opponentAttacking || !opponentAttackType) return;

    const moveKey = ATTACK_TYPE_TO_MOVE[opponentAttackType];
    const move = moveKey ? MOVES[moveKey] : null;
    if (!move) {
      set({ opponentAttacking: false, opponentAttackType: null, opponentAttackElapsed: 0, opponentAttackHasHit: false });
      return;
    }

    const timing = getMoveFrameTime(move);
    const newElapsed = opponentAttackElapsed + delta;

    if (!opponentAttackHasHit && isInActiveWindow(move, newElapsed)) {
      const { playerX, opponentX, playerInvulnerable, opponentFighterId } = get();
      const moves = getCharacterMoves(opponentFighterId);
      const range = opponentAttackType === 'special' ? moves.specialRange : opponentAttackType === 'kick' ? 2 : 1.5;
      const distance = Math.abs(playerX - opponentX);

      if (distance < range && !playerInvulnerable) {
        const damage = opponentAttackType === 'special' ? moves.specialDamage : move.damage;
        get().playerTakeDamage(damage, opponentAttackType);
        set({ opponentAttackHasHit: true });
      }
    }

    if (newElapsed >= timing.totalTime) {
      set({ opponentAttacking: false, opponentAttackType: null, opponentAttackElapsed: 0, opponentAttackHasHit: false });
    } else {
      set({ opponentAttackElapsed: newElapsed });
    }
  },
  
  opponentTakeDamage: (damage, attackType) => {
    const { opponentInvulnerable, opponentHealth, battlePhase, opponentX, opponentY, damageDealt, stageCrackLevel } = get();
    if (opponentInvulnerable || battlePhase !== 'fighting') return;
<<<<<<< HEAD

    set({
      damageDealt: damageDealt + damage,
      opponentAttacking: false,
      opponentAttackType: null,
      opponentAttackElapsed: 0,
      opponentAttackHasHit: false,
    });
=======
    
    if (damage >= 15 || attackType === 'special' || attackType === 'ultimate') {
      set({ stageCrackLevel: Math.min(1, stageCrackLevel + 0.15) });
    }
    set({ damageDealt: damageDealt + damage });
>>>>>>> origin
    get().addDamageNumber(opponentX, opponentY, damage, false);
    const newHealth = Math.max(0, opponentHealth - damage);
    const knockbackMult = attackType === 'ultimate' ? 0.1 : attackType === 'special' ? 0.08 : 0.06;
    const knockback = Math.min(1.2, damage * knockbackMult);
    const newX = Math.max(-10, Math.min(10, opponentX + knockback));
    set({ 
      opponentHealth: newHealth,
      opponentInvulnerable: true,
      opponentX: newX,
    });
    
    useAudio.getState().playHit();
    hapticHit();

    setTimeout(() => {
      set({ opponentInvulnerable: false });
    }, 500);
    
    if (newHealth <= 0) {
      set({ legendaryFinish: attackType === 'ultimate' });
      get().endBattle('player');
    }
  },

  // ⚡ LEGENDARY SYNERGY SYSTEM (Resonance for Jaxon/Kaison -> Kai-Jax)
  addSynergy: (amount) => {
    const { playerSynergy, maxSynergy, playerTransformed, playerFighterId } = get();
    if (playerTransformed || playerFighterId === 'kai-jax') return; // Can't build synergy while transformed or already fused
    
    const newSynergy = Math.min(maxSynergy, playerSynergy + amount);
    set({ playerSynergy: newSynergy });
    
    // Flash when ready to transform (50% for Jaxon/Kaison fusion)!
    const fusionThreshold = 50;
    if ((playerFighterId === 'jaxon' || playerFighterId === 'kaison')) {
      if (newSynergy >= fusionThreshold && playerSynergy < fusionThreshold) {
        get().triggerScreenFlash('#FFD700');
      }
    } else if (newSynergy >= maxSynergy && playerSynergy < maxSynergy) {
      get().triggerScreenFlash('#FFD700');
    }
  },
  
  triggerTransformation: () => {
    const { playerSynergy, playerTransformed, playerFighterId } = get();
    
    // Jaxon/Kaison -> Kai-Jax fusion requires 50% Resonance
    const fusionThreshold = 50;
    if (playerTransformed || playerFighterId === 'kai-jax') return;
    if ((playerFighterId === 'jaxon' || playerFighterId === 'kaison') && playerSynergy < fusionThreshold) return;
    
    // Enter transformation phase (60-frame hit-stop for core integration)
    set({ 
      battlePhase: 'transforming',
      timeScale: 0.1, // Super slow-mo for cinematic transformation
      playerFighterId: 'kai-jax', // Switch to Kai-Jax character immediately
      playerPreFusionFighterId: playerFighterId, // Store for revert
    });
    
    // Epic screen effects
    get().triggerScreenFlash('#FFFFFF');
    get().triggerScreenShake(10);
    
    // Complete transformation after 2 seconds (60-frame hit-stop at 30fps)
    setTimeout(() => {
      set({
        playerTransformed: true,
        playerSynergy: Math.max(0, playerSynergy - fusionThreshold), // Consume 50% for fusion
        transformationTimeRemaining: get().maxTransformationTime,
        battlePhase: 'fighting',
        timeScale: 1.0,
        // Heal on fusion (Bovarr's Anchor stabilizes)
        playerHealth: Math.min(get().maxHealth, get().playerHealth + 25),
      });
      
      get().triggerScreenFlash('#FFBF00'); // Amber - Father's Strand ignites
    }, 2000);
  },
  
  updateTransformation: (delta) => {
    const { playerTransformed, transformationTimeRemaining } = get();
    if (!playerTransformed) return;
    
    const newTime = transformationTimeRemaining - delta;
    set({ transformationTimeRemaining: newTime });
    
    if (newTime <= 5 && transformationTimeRemaining > 5) {
      get().triggerScreenFlash('#FF6B6B');
    }
    
    if (newTime <= 0) {
      get().endTransformation();
    }
  },
  
  endTransformation: () => {
    const { playerFighterId, playerPreFusionFighterId } = get();
    
    // Revert to pre-fusion fighter (jaxon or kaison)
    const revertTo = playerFighterId === 'kai-jax' && playerPreFusionFighterId
      ? playerPreFusionFighterId
      : playerFighterId === 'kai-jax' ? 'jaxon' : playerFighterId;
    set({
      playerTransformed: false,
      transformationTimeRemaining: 0,
      playerFighterId: revertTo,
      playerPreFusionFighterId: null,
    });
    get().triggerScreenFlash('#A855F7');
  },

  // 🌌 OVERDRIVE — fills on deal/receive damage, drains when avoiding combat (camping prevention)
  addOverdrive: (amount) => {
    const { playerOverdrive, maxOverdrive } = get();
    const newOverdrive = Math.min(maxOverdrive, playerOverdrive + amount);
    set({
      playerOverdrive: newOverdrive,
      combatInactivityTimer: 0, // Reset — we just had combat
    });
  },

  updateOverdrive: (delta) => {
    const { combatInactivityTimer, playerOverdrive, ultimateSuperArmorRemaining } = get();
    // Tick super armor down
    if (ultimateSuperArmorRemaining > 0) {
      set({ ultimateSuperArmorRemaining: Math.max(0, ultimateSuperArmorRemaining - delta) });
    }
    // Drain when camping (no combat for 3+ seconds)
    const CAMP_THRESHOLD = 3;
    const DRAIN_RATE = 12; // per second when camping
    const newInactivity = combatInactivityTimer + delta;
    set({ combatInactivityTimer: newInactivity });
    if (newInactivity >= CAMP_THRESHOLD && playerOverdrive > 0) {
      const drain = delta * DRAIN_RATE;
      set({ playerOverdrive: Math.max(0, playerOverdrive - drain) });
    }
  },

  summonAssist: () => {
    const { playerAssistsRemaining, battlePhase, playerX, opponentX } = get();
    if (playerAssistsRemaining <= 0 || battlePhase !== 'fighting') return;
    const dist = Math.abs(playerX - opponentX);
    if (dist < 6) {
      get().opponentTakeDamage(12, 'special');
      get().addToCombo(12);
      get().triggerScreenShake(2);
      useAudio.getState().playHit();
    }
    set({ playerAssistsRemaining: playerAssistsRemaining - 1 });
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

    // Mission combo tracking (tracks peak combo reached)
    useMissions.getState().recordCombo(newCombo);
    
    if (newCombo % 5 === 0) {
      get().addSynergy(10);
    }
    if (newCombo === 10) {
      get().triggerScreenShake(3);
    }
    if (newCombo === 20) {
      get().triggerScreenShake(5);
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

  addDamageNumber: (x, y, amount, isPlayerHit) => {
    const id = ++_damageNumberId;
    const jitter = (Math.random() - 0.5) * 0.6;
    set((s) => ({
      damageNumbers: [...s.damageNumbers, { id, x: x + jitter, y, amount, isPlayerHit }],
    }));
    setTimeout(() => {
      set((s) => ({
        damageNumbers: s.damageNumbers.filter((d) => d.id !== id),
      }));
    }, 1200);
  },

  endBattle: (winner) => {
    hapticKO();
    const { legendaryFinish } = get();

    useMissions.getState().recordBattleEnd(winner);

    set({
      battlePhase: 'ko',
      winner,
      timeScale: legendaryFinish && winner === 'player' ? 0.15 : 0.3,
      playerTransformed: false, // End transformation on KO
      transformationTimeRemaining: 0,
    });
    
    get().triggerScreenFlash(winner === 'player' ? (legendaryFinish ? '#FFE066' : '#FFD700') : '#FF0000');
    get().triggerScreenShake(legendaryFinish && winner === 'player' ? 12 : 8);

    const { maxRoundTime, roundTime } = get();
    set({ roundTimeSurvived: Math.max(0, maxRoundTime - roundTime) });
    
    useAudio.getState().playKO();
    
    // Calculate score with bonuses
    const { maxCombo, playerHealth, maxHealth } = get();
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
    
    const startScale = legendaryFinish && winner === 'player' ? 0.15 : 0.3;
    let timeElapsed = 0;
    const speedUpInterval = setInterval(() => {
      timeElapsed += 50;
      const progress = timeElapsed / (legendaryFinish && winner === 'player' ? 2000 : 1500);
      const newTimeScale = startScale + (1 - startScale) * Math.min(1, progress);
      set({ timeScale: Math.min(1.0, newTimeScale) });

      if (timeElapsed >= (legendaryFinish && winner === 'player' ? 2000 : 1500)) {
        clearInterval(speedUpInterval);
      }
    }, 50);
    
    const koDuration = legendaryFinish && winner === 'player' ? 3200 : 2500;
    setTimeout(() => {
      set({
        battlePhase: 'results',
        timeScale: 1.0,
        legendaryFinish: false,
      });
      if (winner === 'player') {
        useAudio.getState().playVictory();
      }
    }, koDuration);
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
    set({ playerFighterId: fighterId });
  },
  
  setOpponentFighter: (fighterId) => {
    set({ opponentFighterId: fighterId });
  },
  
  setArena: (arenaId) => {
    set({ selectedArenaId: arenaId });
  },

  setOpponentPersonality: (personality) => {
    set({ opponentPersonality: personality });
  },

  togglePause: () => {
    const { battlePhase } = get();
    if (battlePhase === 'fighting' || battlePhase === 'transforming') {
      set({ battlePhase: 'paused' });
    } else if (battlePhase === 'paused') {
      set({ battlePhase: 'fighting' });
    }
  },
}));

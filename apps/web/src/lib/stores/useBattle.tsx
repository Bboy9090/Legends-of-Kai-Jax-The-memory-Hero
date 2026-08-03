import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

const BANTER_POOL = {
  taunt: [
    "Predictable. Try something else.",
    "Is that the best the Memory King can do?",
    "Your speed is lacking. I expected more.",
    "The Void consumes all. Even your memories.",
    "You're fighting a losing war, little hero.",
  ],
  smirk: [
    "Not today!",
    "Gotcha!",
    "Missed me by a mile.",
    "You're wide open!",
    "Feeling the pressure yet?",
  ],
  encourage: [
    "Nice one, Jaxon!",
    "Hold the line, we've got this!",
    "Stay focused, Kaison!",
    "Together, we're Kai-Jax!",
    "One more hit—don't give up!",
  ]
};

export type BattlePhase = 'intro' | 'fighting' | 'ko' | 'paused' | 'results';

import { useAudio } from "./useAudio";
import { useMissions } from "./useMissions";
import { useDifficulty, getDamageTakenMultiplier } from "./useDifficulty";
import { useRunner } from "./useRunner";
import { getCharacterMoves } from "../characterMoves";
import { BattleCombatState } from "../../game/combat/stateEnums";
import {
  MOVES,
  ATTACK_TYPE_TO_MOVE,
  getMoveFrameTime,
  isInActiveWindow,
  attackBreaksGuard,
  type AttackType,
} from "../combatSystems";
import {
  BATTLE_STAMINA,
  DEFAULT_MAX_COMBO_TIMER_SEC,
  FUSION_HEAL_ON_FUSION,
  FUSION_SYNERGY_THRESHOLD,
  FUSION_TRANSFORM_INTRO_MS,
  PLAYER_DODGE,
  ULTIMATE_SUPER_ARMOR_SEC,
  UPGRADED_MAX_COMBO_TIMER_SEC,
} from "../../game/tuning/combatTuning";
import { MOVEMENT_TUNING } from "../../game/tuning/movementTuning";
import { resolveBattleCombatState } from "../../game/combat/CombatStateMachine";
import {
  clashPriorityForAttack,
  getMoveKeyForPlayerAttack,
  hitStopSecondsForMove,
  resolveClash,
  staminaCostForAttack,
} from "../../game/combat/AttackResolver";

const ARENA_X_MIN = MOVEMENT_TUNING.battle.arenaXMin;
const ARENA_X_MAX = MOVEMENT_TUNING.battle.arenaXMax;

function getEffectiveMaxComboTimer(): number {
  return useRunner.getState().unlockedUpgrades.includes("comboWindow")
    ? UPGRADED_MAX_COMBO_TIMER_SEC
    : DEFAULT_MAX_COMBO_TIMER_SEC;
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
  /** Ground dodge (1D arena): time remaining; movement is ticked in updateRoundTimer */
  playerDodgeTimer: number;
  /** +1 = right, -1 = left */
  playerDodgeDirection: 1 | -1;
  
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
  opponentPersonality: 'aggressive' | 'defensive' | 'stalker' | 'titan' | 'caster';
  
  // Tactical Trinity Metrics
  playerDread: number; // match tension/danger
  playerResonance: number; // defensive/parry energy
  
  triggerBanter: (source: 'player' | 'opponent', type: 'taunt' | 'smirk' | 'encourage', situation?: string) => void;

  /** Formal duel combat FSM (player posture): FREE | ATTACKING | DODGING | BLOCKING | PARRY_WINDOW | HITSTUN | GUARD_BROKEN */
  playerCombatState: BattleCombatState;
  playerStamina: number;
  maxPlayerStamina: number;
  /** Delay before stamina regen after blocking or taking chip */
  battleStaminaRegenDelay: number;
  /** Seconds remaining in perfect-parry window after starting block */
  playerBlockParryWindow: number;
  /** Guard break buildup while blocking (0–100) */
  playerGuardPressure: number;
  /** Remaining guard-break stun on player */
  guardBreakTimer: number;
  /** Hitstun lockout (movement/attacks) */
  playerHitStunTimer: number;
  /** Opponent cannot act (parry stagger) */
  opponentStaggerTimer: number;
  /** Brief lockout on opponent after taking a solid hit */
  opponentHitStunTimer: number;
  /** True while holding block input (drives BLOCKING / PARRY_WINDOW) */
  playerBlockHeld: boolean;
  
  // Actions
  startBattle: () => void;
  resetRound: () => void;
  updateRoundTimer: (delta: number) => void;
  tickPlayerAttack: (delta: number) => void;
  tickOpponentAttack: (delta: number) => void;
  
  // Player actions
  movePlayer: (x: number, y: number) => void;
  playerJump: () => void;
  /** Begin a short ground dodge if allowed; direction is along arena X */
  startPlayerDodge: (direction: 1 | -1) => boolean;
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

  setPlayerBlockHeld: (held: boolean) => void;
  tickBattleCombatFsm: (delta: number) => void;
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

function hitStunDurationForAttack(attackType: AttackType | undefined): number {
  switch (attackType) {
    case "ultimate":
      return 0.65; // Extended for ultimate payoff
    case "special":
      return 0.45; // Heavier special impact
    case "kick":
      return 0.28;
    case "punch":
    default:
      return 0.18;
  }
}

export const useBattle = create<BattleState>((set, get) => ({
  // Initial state
  playerFighterId: 'jaxon',
  opponentFighterId: 'kaison',
  selectedArenaId: 'bronx_streets',
  
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
  maxComboTimer: DEFAULT_MAX_COMBO_TIMER_SEC,
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
  playerDodgeTimer: 0,
  playerDodgeDirection: 1,
  
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
  playerDread: 0,
  playerResonance: 100,

  playerCombatState: 'FREE',
  opponentCombatState: 'FREE',
  battleBanter: null,

  playerCombo: 0,
  playerComboTimer: 0,
  opponentCombo: 0,
  opponentComboTimer: 0,

  triggerBanter: (source, type, situation) => {
    const pool = BANTER_POOL[type] || BANTER_POOL.taunt;
    // Search for relevant situation keywords in the lines
    let situationLines = pool.filter(l => !situation || l.toLowerCase().includes(situation.toLowerCase()));
    if (situationLines.length === 0) situationLines = pool;
    
    const text = situationLines[Math.floor(Math.random() * situationLines.length)];
    set({ battleBanter: { source, type, text } });
    
    // Auto-clear after 2.5s
    setTimeout(() => {
      const current = get().battleBanter;
      if (current?.text === text) set({ battleBanter: null });
    }, 2500);
  },

  playerStamina: BATTLE_STAMINA.max,
  maxPlayerStamina: BATTLE_STAMINA.max,
  battleStaminaRegenDelay: 0,
  playerBlockParryWindow: 0,
  playerGuardPressure: 0,
  guardBreakTimer: 0,
  playerHitStunTimer: 0,
  opponentStaggerTimer: 0,
  opponentHitStunTimer: 0,
  playerBlockHeld: false,
  
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
      playerDodgeTimer: 0,
      playerDodgeDirection: 1,
      playerVelocityX: 0,
      playerVelocityY: 0,
      playerCombatState: BattleCombatState.FREE,
      playerStamina: BATTLE_STAMINA.max,
      maxPlayerStamina: BATTLE_STAMINA.max,
      battleStaminaRegenDelay: 0,
      playerBlockParryWindow: 0,
      playerGuardPressure: 0,
      guardBreakTimer: 0,
      playerHitStunTimer: 0,
      opponentStaggerTimer: 0,
      opponentHitStunTimer: 0,
      playerBlockHeld: false,
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
      playerDodgeTimer: 0,
      playerDodgeDirection: 1,
      playerCombatState: BattleCombatState.FREE,
      playerStamina: BATTLE_STAMINA.max,
      battleStaminaRegenDelay: 0,
      playerBlockParryWindow: 0,
      playerGuardPressure: 0,
      guardBreakTimer: 0,
      playerHitStunTimer: 0,
      opponentStaggerTimer: 0,
      opponentHitStunTimer: 0,
      playerBlockHeld: false,
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

    const dodgeT = get().playerDodgeTimer;
    if (dodgeT > 0) {
      const speed = PLAYER_DODGE.travelDistance / PLAYER_DODGE.durationSec;
      const snap = get();
      const dir = snap.playerDodgeDirection;
      const step = speed * delta * dir;
      const newX = Math.max(ARENA_X_MIN, Math.min(ARENA_X_MAX, snap.playerX + step));
      const newT = dodgeT - delta;
      const faceRight = snap.opponentX > newX;
      if (newT <= 0) {
        set({
          playerDodgeTimer: 0,
          playerX: newX,
          playerVelocityX: 0,
          playerFacingRight: faceRight,
        });
      } else {
        set({
          playerDodgeTimer: newT,
          playerX: newX,
          playerFacingRight: faceRight,
        });
      }
    }
    
    const newTime = Math.max(0, roundTime - delta);
    set({ roundTime: newTime });

    get().tickBattleCombatFsm(delta);
    
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
    const newX = Math.max(ARENA_X_MIN, Math.min(ARENA_X_MAX, currentX + x));
    set({ 
      playerX: newX, 
      playerY: y,
      playerFacingRight: get().opponentX > newX
    });
  },
  
  startPlayerDodge: (direction) => {
    const { battlePhase, playerDodgeTimer, playerGrounded, playerAttacking, playerVelocityY, playerStamina, guardBreakTimer, playerHitStunTimer } = get();
    if (battlePhase !== "fighting" && battlePhase !== "transforming") return false;
    if (playerDodgeTimer > 0) return false;
    if (guardBreakTimer > 0 || playerHitStunTimer > 0) return false;
    if (!playerGrounded || Math.abs(playerVelocityY) >= 0.1) return false;
    if (playerAttacking) return false;
    const dodgeCost = PLAYER_DODGE.staminaCost;
    if (playerStamina < dodgeCost) return false;
    set({
      playerDodgeTimer: PLAYER_DODGE.durationSec,
      playerDodgeDirection: direction,
      playerVelocityX: 0,
      playerStamina: Math.max(0, playerStamina - dodgeCost),
      battleStaminaRegenDelay: Math.max(get().battleStaminaRegenDelay, PLAYER_DODGE.regenDelaySec),
    });
    useAudio.getState().playDodge();
    return true;
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
    const { playerAttacking, battlePhase, playerTransformed, playerDodgeTimer, guardBreakTimer, playerHitStunTimer, playerStamina } = get();
    if (playerDodgeTimer > 0) return;
    if (guardBreakTimer > 0 || playerHitStunTimer > 0) return;
    if (playerAttacking || (battlePhase !== 'fighting' && battlePhase !== 'transforming')) return;

    const { playerFighterId, playerOverdrive, maxOverdrive } = get();
    const hasNativeUltimate = ['kai-jax', 'kai', 'jax', 'boryn'].includes(playerFighterId);
    const canUltimate = playerOverdrive >= maxOverdrive && (playerTransformed || hasNativeUltimate);
    if (type === 'ultimate' && !canUltimate) return;

    const staminaCost = staminaCostForAttack(type);
    if (playerStamina < staminaCost) return;

    if (type === 'ultimate') {
      set({
        playerOverdrive: 0,
        ultimateSuperArmorRemaining: ULTIMATE_SUPER_ARMOR_SEC,
      });
    }

    const { playerX, opponentX, opponentInvulnerable, opponentAttacking, opponentAttackType } = get();
    const distance = Math.abs(playerX - opponentX);
    const moves = getCharacterMoves(playerFighterId);
    const transformBonus = playerTransformed ? 1.5 : 1;
    const range = (type === 'ultimate' ? moves.ultimateRange : type === 'special' ? moves.specialRange : type === 'kick' ? 2 : 1.5) * transformBonus;

    if (distance < range && !opponentInvulnerable) {
      if (opponentAttacking && opponentAttackType) {
        const clash = resolveClash(
          clashPriorityForAttack(type),
          clashPriorityForAttack(opponentAttackType)
        );
        if (clash === "tie") {
          get().triggerScreenFlash('#FFFFFF');
          get().triggerHitStop(0.2);
          get().triggerScreenShake(4);
          return;
        }
        if (clash === "other_wins") return;
      }
    }

    const comboStep = type === 'punch' ? 0 : 0;
    set({
      playerAttacking: true,
      playerAttackType: type,
      playerAttackElapsed: 0,
      playerAttackHasHit: false,
      playerComboStep: type === 'kick' || type === 'special' || type === 'ultimate' ? 0 : comboStep,
      playerStamina: Math.max(0, get().playerStamina - staminaCost),
      battleStaminaRegenDelay: Math.max(get().battleStaminaRegenDelay, 0.12),
    });

    if (type === 'special' || type === 'ultimate') useMissions.getState().recordMove(type);

    const audio = useAudio.getState();
    if (type === 'punch') audio.playPunch();
    else if (type === 'kick') audio.playKick();
    else if (type === 'special' || type === 'ultimate') audio.playSpecial();
  },

  attemptComboCancel: () => {
    const { playerAttacking, playerAttackType, playerComboStep, playerAttackElapsed, guardBreakTimer, playerHitStunTimer } = get();
    if (guardBreakTimer > 0 || playerHitStunTimer > 0) return false;
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

    const moveKey = getMoveKeyForPlayerAttack(playerAttackType, playerComboStep);
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
      const range = (playerAttackType === 'ultimate' ? moves.ultimateRange : playerAttackType === 'special' ? moves.specialRange : playerAttackType === 'kick' ? 2.8 : 2.2) * transformBonus;
      const distance = Math.abs(playerX - opponentX);

      if (distance < range && !opponentInvulnerable) {
        const baseDamage = playerAttackType === 'ultimate' ? moves.ultimateDamage : playerAttackType === 'special' ? moves.specialDamage : move.damage;
        const damage = Math.round(baseDamage * transformBonus);
        get().opponentTakeDamage(damage, playerAttackType);
        get().addToCombo(damage);
        get().addSynergy(playerAttackType === 'special' ? 15 : playerAttackType === 'kick' ? 10 : 5);
        get().addOverdrive(damage * 0.4);
        useMissions.getState().recordHit(playerAttackType);
        const crunchMult = playerAttackType === 'ultimate' ? 1.8 : playerAttackType === 'special' ? 1.4 : 1.1;
        get().triggerHitStop(hitStopSecondsForMove(move) * crunchMult);
        get().triggerScreenShake(Math.max(0.7, damage / 6) * crunchMult);
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
    const atk: AttackType = attackType ?? "punch";
    const s = get();
    if (s.playerDodgeTimer > 0) return;
    if (s.battlePhase !== "fighting" || s.ultimateSuperArmorRemaining > 0) return;
    if (s.playerInvulnerable) return;

    const mult = getDamageTakenMultiplier(useDifficulty.getState().difficulty);
    const scaledDamage = Math.round(damage * mult);

    const blocking =
      s.playerBlockHeld &&
      s.playerGrounded &&
      s.playerDodgeTimer <= 0 &&
      !s.playerAttacking &&
      s.playerHitStunTimer <= 0 &&
      s.guardBreakTimer <= 0 &&
      s.playerStamina > 0.5;

    if (blocking) {
      if (s.playerBlockParryWindow > 0) {
        set({
          opponentStaggerTimer: Math.max(s.opponentStaggerTimer, BATTLE_STAMINA.parryOpponentStaggerSec),
          playerBlockParryWindow: 0,
          playerGuardPressure: 0,
          battleStaminaRegenDelay: Math.max(s.battleStaminaRegenDelay, BATTLE_STAMINA.regenDelayAfterBlock),
          opponentAttacking: false,
          opponentAttackType: null,
          opponentAttackElapsed: 0,
          opponentAttackHasHit: false,
        });
        get().triggerScreenFlash("#a8ffff");
        get().triggerHitStop(0.09);
        get().triggerScreenShake(2);
        useAudio.getState().playSpecial();
        
        // ⚡ TRINITY: Resonance increase and Smirk on parry
        const newRes = Math.min(100, s.playerResonance + 20);
        set({ playerResonance: newRes });
        get().triggerBanter('player', 'smirk', 'Not today!');
        
        return;
      }

      const chip = Math.max(1, Math.round(scaledDamage * BATTLE_STAMINA.chipDamageMult));
      const breakVal = attackBreaksGuard(atk);
      const nextPressure = Math.min(100, s.playerGuardPressure + breakVal);
      const newStam = Math.max(0, s.playerStamina - BATTLE_STAMINA.chipStaminaCost);

      if (nextPressure >= 100 || (newStam <= 0 && BATTLE_STAMINA.guardBreakOnEmptyHit)) {
        set({
          playerGuardPressure: 0,
          playerStamina: newStam,
          guardBreakTimer: BATTLE_STAMINA.guardBreakDurationSec,
          playerBlockHeld: false,
          playerBlockParryWindow: 0,
          battleStaminaRegenDelay: Math.max(s.battleStaminaRegenDelay, BATTLE_STAMINA.regenDelayAfterBlock),
        });
        get().triggerScreenFlash("#ff4466");
        get().triggerScreenShake(4);
        useAudio.getState().playHit();
        return;
      }

      const newHp = Math.max(0, s.playerHealth - chip);
      set({
        playerGuardPressure: nextPressure,
        playerStamina: newStam,
        battleStaminaRegenDelay: Math.max(s.battleStaminaRegenDelay, BATTLE_STAMINA.regenDelayAfterBlock),
        playerHealth: newHp,
      });
      get().addDamageNumber(s.playerX, s.playerY, chip, true);
      get().triggerHitStop(Math.max(0.02, scaledDamage / 900));
      useAudio.getState().playKick();
      if (newHp <= 0) get().endBattle("opponent");
      return;
    }

    const { playerHealth, playerX, playerY } = get();
    const newHealth = Math.max(0, playerHealth - scaledDamage);
    const knockbackMult = atk === "special" ? 0.08 : 0.06;
    const knockback = Math.min(1.2, damage * knockbackMult);
    const newX = Math.max(ARENA_X_MIN, Math.min(ARENA_X_MAX, playerX - knockback));
    set({
      playerHealth: newHealth,
      playerInvulnerable: true,
      playerX: newX,
      playerAttacking: false,
      playerAttackType: null,
      playerAttackElapsed: 0,
      playerAttackHasHit: false,
      playerComboStep: 0,
      playerDodgeTimer: 0,
      playerGuardPressure: 0,
      playerBlockParryWindow: 0,
      playerHitStunTimer: Math.max(get().playerHitStunTimer, hitStunDurationForAttack(atk)),
    });

    get().addDamageNumber(playerX, playerY, scaledDamage, true);
    get().addOverdrive(scaledDamage * 0.35);
    const shakeBonus = atk === "special" ? 2.0 : 1.5;
    get().triggerScreenShake(Math.max(0.8, scaledDamage / 5) * shakeBonus);
    get().triggerHitStop(Math.max(0.04, scaledDamage / 300) * (atk === "special" ? 1.5 : 1.2));
    useAudio.getState().playHit();
    get().resetCombo();

    // 🕸️ TRINITY: Increase Dread on damage
    const newDread = Math.min(100, s.playerDread + (scaledDamage / 2));
    set({ playerDread: newDread });

    if (newHealth < s.maxHealth * 0.3) {
      get().triggerBanter('player', 'encourage', 'health');
    } else if (Math.random() < 0.3) {
      get().triggerBanter('opponent', 'taunt');
    }

    setTimeout(() => {
      set({ playerInvulnerable: false });
    }, 500);

    if (newHealth <= 0) {
      get().endBattle("opponent");
    }
  },
  
  moveOpponent: (x, y) => {
    const currentX = get().opponentX;
    const newX = Math.max(ARENA_X_MIN, Math.min(ARENA_X_MAX, currentX + x));
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
    const { opponentAttacking, battlePhase, opponentFighterId, opponentStaggerTimer } = get();
    if (opponentStaggerTimer > 0) return;
    if (opponentAttacking || battlePhase !== 'fighting') return;

    const { playerX, opponentX, playerInvulnerable, playerAttacking, playerAttackType, playerDodgeTimer } = get();
    const distance = Math.abs(playerX - opponentX);
    const moves = getCharacterMoves(opponentFighterId);
    const range = type === 'special' ? moves.specialRange : type === 'kick' ? 2 : 1.5;

    if (distance < range && !playerInvulnerable && playerDodgeTimer <= 0) {
      if (playerAttacking && playerAttackType) {
        const clash = resolveClash(
          clashPriorityForAttack(type),
          clashPriorityForAttack(playerAttackType)
        );
        if (clash === "tie" || clash === "other_wins") return;
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
    const { opponentAttacking, opponentAttackType, opponentAttackElapsed, opponentAttackHasHit, opponentStaggerTimer, opponentHitStunTimer } = get();
    if (opponentStaggerTimer > 0 || opponentHitStunTimer > 0) return;
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
      const { playerX, opponentX, playerInvulnerable, opponentFighterId, playerDodgeTimer } = get();
      const moves = getCharacterMoves(opponentFighterId);
      const range = opponentAttackType === 'special' ? moves.specialRange : opponentAttackType === 'kick' ? 2 : 1.5;
      const distance = Math.abs(playerX - opponentX);

      if (distance < range && !playerInvulnerable && playerDodgeTimer <= 0) {
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
    if (damage >= 15 || attackType === 'special' || attackType === 'ultimate') {
      set({ stageCrackLevel: Math.min(1, stageCrackLevel + 0.15) });
    }
    // Taking damage cancels the opponent's current move to improve readability and prevent "hit-through" moments.
    set({
      damageDealt: damageDealt + damage,
      opponentAttacking: false,
      opponentAttackType: null,
      opponentAttackElapsed: 0,
      opponentAttackHasHit: false,
    });
    get().addDamageNumber(opponentX, opponentY, damage, false);
    const newHealth = Math.max(0, opponentHealth - damage);
    const knockbackMult = attackType === 'ultimate' ? 0.1 : attackType === 'special' ? 0.08 : 0.06;
    const knockback = Math.min(1.2, damage * knockbackMult);
    const newX = Math.max(ARENA_X_MIN, Math.min(ARENA_X_MAX, opponentX + knockback));
    const atk = attackType ?? "punch";
    set({ 
      opponentHealth: newHealth,
      opponentInvulnerable: true,
      opponentX: newX,
      opponentHitStunTimer: Math.max(get().opponentHitStunTimer, hitStunDurationForAttack(atk)),
    });
    
    useAudio.getState().playHit();
    hapticHit();

    // ⚔️ TRINITY: Smirk on heavy damage
    if (damage > 15 || Math.random() < 0.2) {
      get().triggerBanter('player', 'smirk');
    }

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
    const fusionThreshold = FUSION_SYNERGY_THRESHOLD;
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
    // Fusion metadata: `game/tails/TailAbilityRegistry` (FUSION_KAI_JAX_TAIL)

    // Jaxon/Kaison -> Kai-Jax fusion requires 50% Resonance
    const fusionThreshold = FUSION_SYNERGY_THRESHOLD;
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
        playerHealth: Math.min(get().maxHealth, get().playerHealth + FUSION_HEAL_ON_FUSION),
      });
      
      get().triggerScreenFlash('#FFBF00'); // Amber - Father's Strand ignites
    }, FUSION_TRANSFORM_INTRO_MS);
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
    
    if (winner === 'player') {
      get().triggerBanter('player', 'encourage', 'Victory!');
    } else {
      get().triggerBanter('opponent', 'taunt', 'Devoured.');
    }
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

  setPlayerBlockHeld: (held) => {
    const s = get();
    if (s.battlePhase !== "fighting" && s.battlePhase !== "transforming") return;
    if (held && !s.playerBlockHeld) {
      set({
        playerBlockHeld: true,
        playerBlockParryWindow: BATTLE_STAMINA.parryWindowSec,
        battleStaminaRegenDelay: Math.max(s.battleStaminaRegenDelay, BATTLE_STAMINA.regenDelayAfterBlock),
      });
      return;
    }
    set({ playerBlockHeld: held });
    if (!held) {
      set({ playerBlockParryWindow: 0 });
    }
  },

  tickBattleCombatFsm: (delta) => {
    let {
      opponentStaggerTimer,
      opponentHitStunTimer,
      guardBreakTimer,
      playerHitStunTimer,
      playerBlockHeld,
      playerGrounded,
      playerStamina,
      battleStaminaRegenDelay,
      playerBlockParryWindow,
      playerAttacking,
      playerDodgeTimer,
      playerInvulnerable,
    } = get();

    opponentStaggerTimer = Math.max(0, opponentStaggerTimer - delta);
    opponentHitStunTimer = Math.max(0, opponentHitStunTimer - delta);
    guardBreakTimer = Math.max(0, guardBreakTimer - delta);
    playerHitStunTimer = Math.max(0, playerHitStunTimer - delta);

    if (battleStaminaRegenDelay > 0) {
      battleStaminaRegenDelay = Math.max(0, battleStaminaRegenDelay - delta);
    } else if (playerStamina < BATTLE_STAMINA.max) {
      playerStamina = Math.min(BATTLE_STAMINA.max, playerStamina + BATTLE_STAMINA.regenPerSec * delta);
    }

    const canBlockBase =
      playerGrounded &&
      playerDodgeTimer <= 0 &&
      !playerAttacking &&
      playerHitStunTimer <= 0 &&
      guardBreakTimer <= 0 &&
      !playerInvulnerable;

    let blocking = playerBlockHeld && canBlockBase && playerStamina > 0.5;

    if (blocking) {
      const drain = BATTLE_STAMINA.blockDrainPerSec * delta;
      playerStamina = Math.max(0, playerStamina - drain);
      battleStaminaRegenDelay = Math.max(battleStaminaRegenDelay, BATTLE_STAMINA.regenDelayAfterBlock);
      playerBlockParryWindow = Math.max(0, playerBlockParryWindow - delta);
      if (playerStamina <= 0) {
        blocking = false;
        guardBreakTimer = BATTLE_STAMINA.guardBreakDurationSec;
        playerBlockHeld = false;
        playerBlockParryWindow = 0;
        get().triggerScreenFlash("#ff4466");
        get().triggerScreenShake(3);
      }
    } else {
      playerBlockParryWindow = 0;
    }

    let nextGuardPressure = get().playerGuardPressure;
    if (!blocking) {
      nextGuardPressure = Math.max(0, nextGuardPressure - delta * 28);
    }

    const nextState = resolveBattleCombatState({
      playerDodgeTimer,
      playerAttacking,
      guardBreakTimer,
      playerHitStunTimer,
      blocking,
      playerBlockParryWindow,
    });

    set({
      opponentStaggerTimer,
      opponentHitStunTimer,
      guardBreakTimer,
      playerHitStunTimer,
      playerStamina,
      battleStaminaRegenDelay,
      playerBlockParryWindow,
      playerGuardPressure: nextGuardPressure,
      playerCombatState: nextState,
      ...(playerStamina <= 0 && !blocking ? { playerBlockHeld: false } : {}),
    });
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

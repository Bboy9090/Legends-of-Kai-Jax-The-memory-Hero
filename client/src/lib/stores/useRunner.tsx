import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GameState = "menu" | "character-select" | "playing" | "paused" | "game-over" | "ai-assistant";
export type Character = "jaxon" | "kaison";
export type ReunionMode = "sleepy" | "hyper" | "normal";

interface PlayerState {
  x: number;
  y: number;
  z: number;
  isJumping: boolean;
  isSliding: boolean;
  lane: number; // -1, 0, 1 for left, center, right
  speed: number;
  // Character-specific states
  isRuleBreaking: boolean; // Jaxon's special ability
  isMasterPlanning: boolean; // Kaison's special ability
  // Combat system
  isAttacking: boolean;
  attackType: "punch" | "kick" | "special" | null;
  attackCombo: number; // Combo counter
  energy: number; // 0-100 for special moves
  health: number; // Player health
  invulnerable: boolean; // Temporary invincibility
  // Enhanced movement
  dashCooldown: number;
  wallRunning: boolean;
  groundPounding: boolean;
}

interface GameStats {
  score: number;
  distance: number;
  coinsCollected: number;
  helpTokens: number;
  kindnessPoints: number;
  // New bond/chaos stats
  bondMeter: number; // 0-100, fills through teamwork
  volumeLevel: number; // 0-100, tracks excitement level
  toyCaught: number; // For "I got the toy" mechanics
  pillowJumps: number; // Pillow mountain adventures
}

interface RunnerState {
  gameState: GameState;
  selectedCharacter: Character;
  activeCharacter: Character; // Who's currently being controlled
  player: PlayerState;
  stats: GameStats;
  inChoiceMode: boolean;
  currentChoice: any | null;
  
  // Bond and reunion system
  reunionMode: ReunionMode;
  isAlone: boolean; // When characters are separated
  timeApart: number; // Builds anticipation for reunion
  
  // Creative chaos settings
  apartmentMode: boolean; // Indoor creative campus mode
  pillowMountainHeight: number; // For pillow mountain building
  toyChaseActive: boolean; // "I got the toy!" mode
  dogZoomiesActive: boolean; // Chaos mode with dog
  
  // Game settings
  baseSpeed: number;
  lanes: number[];
  
  // Enhanced Actions
  setGameState: (state: GameState) => void;
  setCharacter: (character: Character) => void;
  switchCharacter: () => void; // Mid-game character switching
  movePlayer: (direction: "left" | "right") => void;
  jumpPlayer: () => void;
  slidePlayer: () => void;
  updatePlayerPosition: (delta: number) => void;
  addScore: (points: number) => void;
  collectCoin: () => void;
  collectHelpToken: () => void;
  triggerChoiceMode: (choice: any) => void;
  resolveChoice: (isKindChoice: boolean) => void;
  resetGame: () => void;
  
  // Combat System Actions
  attackEnemy: (attackType: "punch" | "kick" | "special") => void;
  finishAttack: () => void;
  dashPlayer: () => void;
  groundPound: () => void;
  takeDamage: (damage: number) => void;
  regenerateEnergy: (amount: number) => void;
  setInvulnerable: (duration: number) => void;
  
  // New bond/chaos actions
  buildBond: (amount: number) => void;
  triggerReunion: () => void;
  activateRuleBreaking: () => void; // Jaxon's special
  activateMasterPlan: () => void; // Kaison's special
  buildPillowMountain: () => void;
  startToyChase: () => void;
  triggerDogZoomies: () => void;
  adjustVolume: (level: number) => void;
}

const initialPlayerState: PlayerState = {
  x: 0,
  y: 1.6, // Raise player above floor so legs don't sink into ground
  z: 0,
  isJumping: false,
  isSliding: false,
  lane: 0,
  speed: 10,
  isRuleBreaking: false,
  isMasterPlanning: false,
  // Combat system
  isAttacking: false,
  attackType: null,
  attackCombo: 0,
  energy: 100,
  health: 100,
  invulnerable: false,
  // Enhanced movement
  dashCooldown: 0,
  wallRunning: false,
  groundPounding: false
};

const initialStats: GameStats = {
  score: 0,
  distance: 0,
  coinsCollected: 0,
  helpTokens: 0,
  kindnessPoints: 0,
  bondMeter: 0,
  volumeLevel: 0,
  toyCaught: 0,
  pillowJumps: 0
};

export const useRunner = create<RunnerState>()(
  subscribeWithSelector((set, get) => ({
    gameState: "menu",
    selectedCharacter: "jaxon",
    activeCharacter: "jaxon",
    player: { ...initialPlayerState },
    stats: { ...initialStats },
    inChoiceMode: false,
    currentChoice: null,
    
    // Bond and reunion system
    reunionMode: "normal",
    isAlone: false,
    timeApart: 0,
    
    // Creative chaos settings
    apartmentMode: true, // Start in apartment mode - that's their world!
    pillowMountainHeight: 0,
    toyChaseActive: false,
    dogZoomiesActive: false,
    
    baseSpeed: 10,
    lanes: [-4, 0, 4],
    
    setGameState: (state) => {
      console.log("setGameState called with:", state);
      set({ gameState: state });
    },
    
    setCharacter: (character) => {
      console.log("setCharacter called with:", character);
      set({ selectedCharacter: character });
    },
    
    movePlayer: (direction) => {
      const { player, lanes } = get();
      
      // Enhanced movement with dash capability
      if (player.isAttacking || player.groundPounding) return;
      
      const currentLaneIndex = lanes.indexOf(player.x);
      let newLaneIndex = currentLaneIndex;
      
      if (direction === "left" && currentLaneIndex > 0) {
        newLaneIndex = currentLaneIndex - 1;
      } else if (direction === "right" && currentLaneIndex < lanes.length - 1) {
        newLaneIndex = currentLaneIndex + 1;
      }
      
      // Enhanced lane switching with brief speed boost
      const hasLaneChanged = newLaneIndex !== currentLaneIndex;
      
      set({
        player: {
          ...player,
          x: lanes[newLaneIndex],
          lane: newLaneIndex - 1, // -1, 0, 1
          speed: hasLaneChanged ? player.speed + 2 : player.speed // Brief speed boost when changing lanes
        }
      });
      
      // Reset speed boost after lane change
      if (hasLaneChanged) {
        setTimeout(() => {
          const currentPlayer = get().player;
          set({
            player: { ...currentPlayer, speed: 10 }
          });
        }, 300);
      }
    },
    
    jumpPlayer: () => {
      const { player } = get();
      if (!player.isJumping && !player.isSliding) {
        set({
          player: { ...player, isJumping: true }
        });
        
        // Auto-land after jump duration
        setTimeout(() => {
          set((state) => ({
            player: { ...state.player, isJumping: false, y: 0 }
          }));
        }, 600);
      }
    },
    
    slidePlayer: () => {
      const { player } = get();
      if (!player.isJumping && !player.isSliding) {
        set({
          player: { ...player, isSliding: true }
        });
        
        // Auto-stop sliding
        setTimeout(() => {
          set((state) => ({
            player: { ...state.player, isSliding: false }
          }));
        }, 400);
      }
    },
    
    updatePlayerPosition: (delta) => {
      const { player, stats } = get();
      
      // Enhanced movement physics
      let newZ = player.z + player.speed * delta;
      const newDistance = stats.distance + player.speed * delta * 0.1;
      
      // Handle jumping physics with better arc
      let newY = player.y;
      if (player.isJumping && !player.groundPounding) {
        const jumpTime = 0.6;
        const jumpHeight = 3.5;
        const timeInJump = (Date.now() % (jumpTime * 1000)) / 1000;
        newY = Math.sin(timeInJump * Math.PI / jumpTime) * jumpHeight + 1.6;
      } else if (!player.isJumping) {
        newY = 1.6; // Default height
      }
      
      // Update cooldowns
      const newDashCooldown = Math.max(0, player.dashCooldown - delta * 1000);
      
      // Passive energy regeneration
      const energyRegen = player.isAttacking ? 0 : 15 * delta; // 15 energy per second
      const newEnergy = Math.min(100, player.energy + energyRegen);
      
      set({
        player: { 
          ...player, 
          z: newZ, 
          y: newY,
          dashCooldown: newDashCooldown,
          energy: newEnergy
        },
        stats: { ...stats, distance: newDistance }
      });
    },
    
    addScore: (points) => {
      const { stats } = get();
      set({
        stats: { ...stats, score: stats.score + points }
      });
    },
    
    collectCoin: () => {
      const { stats } = get();
      set({
        stats: { 
          ...stats, 
          coinsCollected: stats.coinsCollected + 1,
          score: stats.score + 10
        }
      });
    },
    
    collectHelpToken: () => {
      const { stats } = get();
      const newHelpTokens = stats.helpTokens + 1;
      
      set({
        stats: { ...stats, helpTokens: newHelpTokens }
      });
      
      // Trigger choice mode after collecting 3 tokens
      if (newHelpTokens >= 3) {
        get().triggerChoiceMode({
          scenario: "A citizen dropped their groceries when a Grumble-Bot knocked them over!",
          choices: [
            { text: "Help pick up the groceries", type: "heart", isKind: true },
            { text: "Chase after the Grumble-Bot", type: "star", isKind: false }
          ]
        });
      }
    },
    
    triggerChoiceMode: (choice) => {
      set({
        inChoiceMode: true,
        currentChoice: choice,
        gameState: "paused"
      });
    },
    
    resolveChoice: (isKindChoice) => {
      const { stats } = get();
      
      set({
        inChoiceMode: false,
        currentChoice: null,
        gameState: "playing",
        stats: {
          ...stats,
          helpTokens: 0, // Reset tokens
          kindnessPoints: stats.kindnessPoints + (isKindChoice ? 10 : 5),
          score: stats.score + (isKindChoice ? 50 : 25)
        }
      });
    },
    
    // New bond/chaos actions
    switchCharacter: () => {
      const { selectedCharacter, activeCharacter } = get();
      const newActive = activeCharacter === "jaxon" ? "kaison" : "jaxon";
      console.log(`Switching character from ${activeCharacter} to ${newActive}`);
      set({ activeCharacter: newActive });
    },
    
    buildBond: (amount) => {
      const { stats } = get();
      const newBondMeter = Math.min(100, stats.bondMeter + amount);
      set({
        stats: { ...stats, bondMeter: newBondMeter }
      });
      
      // Trigger reunion when bond meter fills
      if (newBondMeter >= 100) {
        get().triggerReunion();
      }
    },
    
    triggerReunion: () => {
      const { timeApart } = get();
      // Random reunion mode based on their energy levels
      const modes: ReunionMode[] = ["sleepy", "hyper", "normal"];
      const mode = timeApart > 50 ? modes[Math.floor(Math.random() * modes.length)] : "normal";
      
      console.log(`Brothers reunited! Mode: ${mode}`);
      set({
        reunionMode: mode,
        isAlone: false,
        timeApart: 0
      });
    },
    
    activateRuleBreaking: () => {
      const { player, stats } = get();
      console.log("Jaxon activates Rule Breaking mode!");
      set({
        player: { ...player, isRuleBreaking: true },
        stats: { ...stats, volumeLevel: Math.min(100, stats.volumeLevel + 20) }
      });
      
      // Auto-deactivate after a while
      setTimeout(() => {
        set((state) => ({
          player: { ...state.player, isRuleBreaking: false }
        }));
      }, 3000);
    },
    
    activateMasterPlan: () => {
      const { player } = get();
      console.log("Kaison activates Master Plan mode!");
      set({
        player: { ...player, isMasterPlanning: true }
      });
      
      // Auto-deactivate after planning phase
      setTimeout(() => {
        set((state) => ({
          player: { ...state.player, isMasterPlanning: false }
        }));
      }, 5000);
    },
    
    buildPillowMountain: () => {
      const { pillowMountainHeight, stats } = get();
      const newHeight = pillowMountainHeight + 1;
      console.log(`Building pillow mountain! Height: ${newHeight}`);
      set({
        pillowMountainHeight: newHeight,
        stats: { ...stats, pillowJumps: stats.pillowJumps + 1 }
      });
    },
    
    startToyChase: () => {
      const { stats } = get();
      console.log("I got the toy! Chase mode activated!");
      set({
        toyChaseActive: true,
        stats: { ...stats, volumeLevel: Math.min(100, stats.volumeLevel + 15) }
      });
      
      // Auto-end after chase sequence
      setTimeout(() => {
        set({ toyChaseActive: false });
      }, 8000);
    },
    
    triggerDogZoomies: () => {
      const { stats } = get();
      console.log("Dog zoomies activated! Beautiful chaos incoming!");
      set({
        dogZoomiesActive: true,
        stats: { ...stats, volumeLevel: Math.min(100, stats.volumeLevel + 30) }
      });
      
      // Zoomies last a while
      setTimeout(() => {
        set({ dogZoomiesActive: false });
      }, 12000);
    },
    
    adjustVolume: (level) => {
      const { stats } = get();
      const clampedLevel = Math.max(0, Math.min(100, level));
      
      // Dad's gentle reminder when it gets too loud
      if (clampedLevel > 80) {
        console.log("Volume getting high - don't sound like someone's dying! 😅");
      }
      
      set({
        stats: { ...stats, volumeLevel: clampedLevel }
      });
    },
    
    resetGame: () => {
      set({
        gameState: "menu",
        selectedCharacter: "jaxon",
        activeCharacter: "jaxon",
        player: { ...initialPlayerState },
        stats: { ...initialStats },
        inChoiceMode: false,
        currentChoice: null,
        reunionMode: "normal",
        isAlone: false,
        timeApart: 0,
        apartmentMode: true,
        pillowMountainHeight: 0,
        toyChaseActive: false,
        dogZoomiesActive: false
      });
    },
    
    // Combat System Implementation
    attackEnemy: (attackType) => {
      const { player, selectedCharacter } = get();
      
      if (player.isAttacking || player.energy < 20) return;
      
      console.log(`${selectedCharacter} performs ${attackType} attack!`);
      
      set({
        player: {
          ...player,
          isAttacking: true,
          attackType: attackType,
          attackCombo: player.attackCombo + 1,
          energy: Math.max(0, player.energy - (attackType === "special" ? 30 : 10))
        }
      });
      
      // Auto-finish attack after animation
      setTimeout(() => {
        get().finishAttack();
      }, attackType === "special" ? 800 : 400);
    },
    
    finishAttack: () => {
      const { player } = get();
      set({
        player: {
          ...player,
          isAttacking: false,
          attackType: null
        }
      });
      
      // Reset combo after 2 seconds of no attacks
      setTimeout(() => {
        const currentPlayer = get().player;
        if (!currentPlayer.isAttacking) {
          set({
            player: { ...currentPlayer, attackCombo: 0 }
          });
        }
      }, 2000);
    },
    
    dashPlayer: () => {
      const { player } = get();
      
      if (player.dashCooldown > 0 || player.energy < 15) return;
      
      console.log("Player dashes forward with burst speed!");
      
      set({
        player: {
          ...player,
          speed: player.speed + 8, // Temporary speed boost
          energy: player.energy - 15,
          dashCooldown: 3000, // 3 second cooldown
          invulnerable: true // Brief invincibility during dash
        }
      });
      
      // Reset speed and invincibility
      setTimeout(() => {
        const currentPlayer = get().player;
        set({
          player: {
            ...currentPlayer,
            speed: 10, // Back to normal speed
            invulnerable: false
          }
        });
      }, 500);
    },
    
    groundPound: () => {
      const { player } = get();
      
      if (!player.isJumping || player.energy < 25) return;
      
      console.log("GROUND POUND! Massive area damage!");
      
      set({
        player: {
          ...player,
          groundPounding: true,
          energy: player.energy - 25,
          y: 0 // Force to ground
        }
      });
      
      // Ground pound effect duration
      setTimeout(() => {
        const currentPlayer = get().player;
        set({
          player: {
            ...currentPlayer,
            groundPounding: false,
            isJumping: false
          }
        });
      }, 600);
    },
    
    takeDamage: (damage) => {
      const { player } = get();
      
      if (player.invulnerable) return;
      
      const newHealth = Math.max(0, player.health - damage);
      console.log(`Player takes ${damage} damage! Health: ${newHealth}`);
      
      set({
        player: {
          ...player,
          health: newHealth
        }
      });
      
      // Trigger invincibility frames
      get().setInvulnerable(1000);
      
      // Game over if health reaches 0
      if (newHealth <= 0) {
        console.log("Game Over - Health depleted!");
        set({ gameState: "game-over" });
      }
    },
    
    regenerateEnergy: (amount) => {
      const { player } = get();
      set({
        player: {
          ...player,
          energy: Math.min(100, player.energy + amount)
        }
      });
    },
    
    setInvulnerable: (duration) => {
      const { player } = get();
      set({
        player: { ...player, invulnerable: true }
      });
      
      setTimeout(() => {
        const currentPlayer = get().player;
        set({
          player: { ...currentPlayer, invulnerable: false }
        });
      }, duration);
    }
  }))
);

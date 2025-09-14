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
  isMasterPlanning: false
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
      const currentLaneIndex = lanes.indexOf(player.x);
      let newLaneIndex = currentLaneIndex;
      
      if (direction === "left" && currentLaneIndex > 0) {
        newLaneIndex = currentLaneIndex - 1;
      } else if (direction === "right" && currentLaneIndex < lanes.length - 1) {
        newLaneIndex = currentLaneIndex + 1;
      }
      
      set({
        player: {
          ...player,
          x: lanes[newLaneIndex],
          lane: newLaneIndex - 1 // -1, 0, 1
        }
      });
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
      const newZ = player.z + player.speed * delta;
      const newDistance = stats.distance + player.speed * delta * 0.1;
      
      // Handle jumping physics
      let newY = player.y;
      if (player.isJumping) {
        const jumpTime = 0.6; // seconds
        const jumpHeight = 3;
        // Simple arc calculation
        newY = Math.sin((Date.now() % (jumpTime * 1000)) / 1000 * Math.PI / jumpTime) * jumpHeight;
      }
      
      set({
        player: { ...player, z: newZ, y: newY },
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
    }
  }))
);

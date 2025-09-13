import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GameState = "menu" | "character-select" | "playing" | "paused" | "game-over";
export type Character = "jaxon" | "kaison";

interface PlayerState {
  x: number;
  y: number;
  z: number;
  isJumping: boolean;
  isSliding: boolean;
  lane: number; // -1, 0, 1 for left, center, right
  speed: number;
}

interface GameStats {
  score: number;
  distance: number;
  coinsCollected: number;
  helpTokens: number;
  kindnessPoints: number;
}

interface RunnerState {
  gameState: GameState;
  selectedCharacter: Character;
  player: PlayerState;
  stats: GameStats;
  inChoiceMode: boolean;
  currentChoice: any | null;
  
  // Game settings
  baseSpeed: number;
  lanes: number[];
  
  // Actions
  setGameState: (state: GameState) => void;
  setCharacter: (character: Character) => void;
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
}

const initialPlayerState: PlayerState = {
  x: 0,
  y: 0,
  z: 0,
  isJumping: false,
  isSliding: false,
  lane: 0,
  speed: 10
};

const initialStats: GameStats = {
  score: 0,
  distance: 0,
  coinsCollected: 0,
  helpTokens: 0,
  kindnessPoints: 0
};

export const useRunner = create<RunnerState>()(
  subscribeWithSelector((set, get) => ({
    gameState: "menu",
    selectedCharacter: "jaxon",
    player: { ...initialPlayerState },
    stats: { ...initialStats },
    inChoiceMode: false,
    currentChoice: null,
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
    
    resetGame: () => {
      set({
        gameState: "menu",
        player: { ...initialPlayerState },
        stats: { ...initialStats },
        inChoiceMode: false,
        currentChoice: null
      });
    }
  }))
);

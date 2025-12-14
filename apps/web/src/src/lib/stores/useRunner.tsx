import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { EquippedCosmetics } from "../cosmetics";

export type GameState = "menu" | "character-select" | "playing" | "paused" | "game-over" | "ai-assistant" | "customization";
export type Character = "jaxon" | "kaison";
export type ReunionMode = "sleepy" | "hyper" | "normal";

interface PlayerState {
  // 2.5D Position (X horizontal, Y vertical, Z locked at 0)
  x: number;
  y: number;
  z: number; // Always 0 for 2.5D
  velocityX: number; // Horizontal velocity
  velocityY: number; // Vertical velocity (gravity/jump)
  isJumping: boolean;
  isSliding: boolean;
  isGrounded: boolean; // Ground collision state
  lane: number; // -1, 0, 1 for left, center, right
  speed: number;
  
  // Web-Swinging Physics
  webAttached: boolean;
  webButtonPressed: boolean;
  webAngle: number; // Current swing angle in radians
  webAngularVelocity: number;
  webAnchorPoint: [number, number, number] | null;
  webLength: number;
  
  // Character-specific states
  isRuleBreaking: boolean; // Jaxon's special ability
  isMasterPlanning: boolean; // Kaison's special ability
  
  // Combat system
  isAttacking: boolean;
  attackType: "punch" | "kick" | "special" | "webKick" | "energyBlast" | null;
  attackCombo: number; // Combo counter
  kickChargeTimer: number; // For charged web kick
  kickPower: number; // Damage based on charge
  
  // Energy & Transformation
  energy: number; // 0-100 for special moves
  energyMeter: number; // 0-100 for transformation
  maxEnergy: number;
  powerLevel: 0 | 1; // 0=Normal, 1=Transformed (Super/Hyper)
  transformDuration: number; // Frames remaining in transformed state
  
  health: number; // Player health
  invulnerable: boolean; // Temporary invincibility
  
  // Enhanced movement
  dashCooldown: number;
  wallRunning: boolean;
  groundPounding: boolean;
  
  // Physics constants
  gravity: number;
  jumpStrength: number;
  groundLevel: number;
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
  
  // Cosmetics & Customization
  equippedCosmetics: {
    jaxon: EquippedCosmetics;
    kaison: EquippedCosmetics;
  };
  unlockedAccessories: string[]; // IDs of unlocked accessories
  highScore: number; // Track for unlocking accessories
  
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
  
  // Web-Swinging Actions
  attachWeb: (anchorPoint: [number, number, number]) => void;
  releaseWeb: () => void;
  setWebButtonPressed: (pressed: boolean) => void;
  updateWebSwing: (delta: number) => void;
  
  // Transformation Actions
  transformHero: () => void;
  updateTransformation: (delta: number) => void;
  addEnergyMeter: (amount: number) => void;
  
  // Enhanced Combat Actions
  chargeWebKick: (delta: number) => void;
  releaseWebKick: () => void;
  fireEnergyBlast: (direction: [number, number]) => void;
  
  // Cosmetic Actions
  equipAccessory: (character: Character, accessoryId: string, slot: keyof EquippedCosmetics) => void;
  unequipAccessory: (character: Character, slot: keyof EquippedCosmetics) => void;
  unlockAccessory: (accessoryId: string) => void;
  checkAndUnlockAccessories: () => void;
}

const initialPlayerState: PlayerState = {
  // 2.5D Position
  x: 0,
  y: 0.8, // Start ON the ground (adjusted for Sonic proportions)
  z: 0, // Always 0 for 2.5D
  velocityX: 5, // Initial horizontal speed
  velocityY: 0,
  isJumping: false,
  isSliding: false,
  isGrounded: true,
  lane: 0,
  speed: 10,
  
  // Web-Swinging Physics
  webAttached: false,
  webButtonPressed: false,
  webAngle: 0,
  webAngularVelocity: 0,
  webAnchorPoint: null,
  webLength: 15, // Web rope length
  
  // Character states
  isRuleBreaking: false,
  isMasterPlanning: false,
  
  // Combat system
  isAttacking: false,
  attackType: null,
  attackCombo: 0,
  kickChargeTimer: 0,
  kickPower: 0,
  
  // Energy & Transformation
  energy: 100,
  energyMeter: 0,
  maxEnergy: 100,
  powerLevel: 0,
  transformDuration: 0,
  
  health: 100,
  invulnerable: false,
  
  // Enhanced movement
  dashCooldown: 0,
  wallRunning: false,
  groundPounding: false,
  
  // Physics constants
  gravity: 30, // Increased gravity for tighter platformer feel
  jumpStrength: 15, // Stronger jump to compensate
  groundLevel: 0
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
    
    // Cosmetics & Customization
    equippedCosmetics: {
      jaxon: {},
      kaison: {}
    },
    unlockedAccessories: ['cap_red', 'cap_cyan', 'belt_utility'], // Start with basic items unlocked
    highScore: 0,
    
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
      const { player } = get();
      
      // 2.5D Side-Scroller: Left/Right controls are DISABLED
      // Player moves forward automatically (X increases in updatePlayerPosition)
      // Use Jump/Web-Swing for vertical movement instead
      // This prevents breaking the continuous X-axis movement
      
      console.log(`movePlayer(${direction}) called but disabled for 2.5D side-scroller`);
      
      // Optional: Could map left/right to Y-axis velocity boosts in future
      // For now, we rely on jump and web-swinging for vertical control
    },
    
    jumpPlayer: () => {
      const { player } = get();
      if (!player.isJumping && !player.isSliding && player.isGrounded) {
        console.log("Player jumps!");
        set({
          player: { 
            ...player, 
            isJumping: true,
            velocityY: player.jumpStrength, // Apply jump velocity
            isGrounded: false
          }
        });
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
      
      // Check if web-swinging - if so, use special physics
      if (player.webAttached && player.webButtonPressed) {
        get().updateWebSwing(delta);
        get().updateTransformation(delta);
        
        // Still update energy and cooldowns
        const newDashCooldown = Math.max(0, player.dashCooldown - delta * 1000);
        const energyRegen = player.isAttacking ? 0 : 15 * delta;
        const newEnergy = Math.min(100, player.energy + energyRegen);
        
        set({
          player: {
            ...player,
            dashCooldown: newDashCooldown,
            energy: newEnergy
          }
        });
        return;
      }
      
      // 2.5D Physics - Horizontal and Vertical movement
      let newX = player.x + player.velocityX * delta;
      let newY = player.y + player.velocityY * delta;
      let newVelocityY = player.velocityY;
      let newIsGrounded = false;
      
      // Apply gravity if not grounded (adjusted for Sonic body height)
      if (newY > player.groundLevel + 0.8) {
        newVelocityY -= player.gravity * delta;
      }
      
      // Ground collision (character stands at 0.8 above ground)
      if (newY <= player.groundLevel + 0.8) {
        newY = player.groundLevel + 0.8;
        newVelocityY = 0;
        newIsGrounded = true;
        
        if (player.isJumping) {
          set({
            player: { ...player, isJumping: false }
          });
        }
      }
      
      // Apply horizontal friction on ground
      let newVelocityX = player.velocityX;
      if (newIsGrounded && !player.webAttached) {
        newVelocityX *= 0.95; // Friction
        if (Math.abs(newVelocityX) < 0.1) {
          newVelocityX = 5; // Minimum forward speed
        }
      }
      
      // Sliding physics
      if (player.isSliding) {
        newY = player.groundLevel + 0.4; // Crouch position (lower for Sonic body)
      }
      
      // Update cooldowns
      const newDashCooldown = Math.max(0, player.dashCooldown - delta * 1000);
      
      // Passive energy regeneration
      const energyRegen = player.isAttacking ? 0 : 15 * delta;
      const newEnergy = Math.min(100, player.energy + energyRegen);
      
      // Update transformation timer
      get().updateTransformation(delta);
      
      // Update state
      const newDistance = stats.distance + Math.abs(newVelocityX) * delta * 0.1;
      
      set({
        player: { 
          ...player, 
          x: newX,
          y: newY,
          z: 0, // Always 0 for 2.5D
          velocityX: newVelocityX,
          velocityY: newVelocityY,
          isGrounded: newIsGrounded,
          dashCooldown: newDashCooldown,
          energy: newEnergy
        },
        stats: { ...stats, distance: newDistance }
      });
    },
    
    addScore: (points) => {
      const { stats } = get();
      const newScore = stats.score + points;
      set({
        stats: { ...stats, score: newScore }
      });
      
      // Check for accessory unlocks
      get().checkAndUnlockAccessories();
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
    },
    
    // Web-Swinging Implementation
    attachWeb: (anchorPoint) => {
      const { player } = get();
      console.log("Web attached to anchor point:", anchorPoint);
      
      const dx = player.x - anchorPoint[0];
      const dy = player.y - anchorPoint[1];
      const angle = Math.atan2(dy, dx);
      const length = Math.sqrt(dx * dx + dy * dy);
      
      set({
        player: {
          ...player,
          webAttached: true,
          webAngle: angle,
          webAnchorPoint: anchorPoint,
          webLength: length
        }
      });
    },
    
    releaseWeb: () => {
      const { player } = get();
      
      if (!player.webAttached || !player.webAnchorPoint) return;
      
      // Calculate tangential velocity for launch
      const angularSpeed = player.webAngularVelocity;
      const tangentialSpeed = Math.abs(angularSpeed * player.webLength);
      const releaseAngle = player.webAngle + Math.PI / 2 * Math.sign(player.webAngularVelocity);
      
      const launchVx = tangentialSpeed * Math.cos(releaseAngle);
      const launchVy = tangentialSpeed * Math.sin(releaseAngle);
      
      console.log("Web released! Launch velocity:", { launchVx, launchVy });
      
      set({
        player: {
          ...player,
          webAttached: false,
          webButtonPressed: false,
          webAngle: 0,
          webAngularVelocity: 0,
          webAnchorPoint: null,
          velocityX: launchVx,
          velocityY: launchVy
        }
      });
    },
    
    setWebButtonPressed: (pressed) => {
      const { player } = get();
      console.log(`🕸️ setWebButtonPressed(${pressed}) - current webAttached: ${player.webAttached}`);
      set({
        player: { ...player, webButtonPressed: pressed }
      });
      
      if (!pressed && player.webAttached) {
        console.log("Releasing web!");
        get().releaseWeb();
      }
    },
    
    updateWebSwing: (delta) => {
      const { player } = get();
      
      if (!player.webAttached || !player.webAnchorPoint) return;
      
      const dx = player.x - player.webAnchorPoint[0];
      const dy = player.y - player.webAnchorPoint[1];
      const currentAngle = Math.atan2(dy, dx);
      
      // Pendulum physics: gravity creates angular acceleration
      const gravityForce = player.gravity * Math.sin(currentAngle);
      let newAngularVelocity = player.webAngularVelocity + gravityForce * delta * 0.1;
      newAngularVelocity *= 0.98; // Air resistance
      
      let newAngle = currentAngle + newAngularVelocity;
      
      // Calculate new position
      const newX = player.webAnchorPoint[0] + player.webLength * Math.cos(newAngle);
      const newY = player.webAnchorPoint[1] + player.webLength * Math.sin(newAngle);
      
      set({
        player: {
          ...player,
          x: newX,
          y: newY,
          webAngle: newAngle,
          webAngularVelocity: newAngularVelocity
        }
      });
    },
    
    // Transformation System
    transformHero: () => {
      const { player, selectedCharacter } = get();
      
      if (player.energyMeter < 100) {
        console.log("Not enough energy to transform! Need:", 100 - player.energyMeter);
        return;
      }
      
      const transformName = selectedCharacter === "kaison" ? "Super Kaison" : "Hyper Jaxon";
      console.log(`${transformName} transformation activated!`);
      
      set({
        player: {
          ...player,
          powerLevel: 1,
          energyMeter: 0,
          transformDuration: 600 // 10 seconds at 60fps
        }
      });
    },
    
    updateTransformation: (delta) => {
      const { player } = get();
      
      if (player.transformDuration > 0) {
        const newDuration = player.transformDuration - 1;
        
        if (newDuration <= 0) {
          console.log("Transformation ended!");
          set({
            player: {
              ...player,
              powerLevel: 0,
              transformDuration: 0
            }
          });
        } else {
          set({
            player: { ...player, transformDuration: newDuration }
          });
        }
      }
    },
    
    addEnergyMeter: (amount) => {
      const { player } = get();
      const newEnergy = Math.min(player.maxEnergy, player.energyMeter + amount);
      
      set({
        player: { ...player, energyMeter: newEnergy }
      });
      
      // Auto-transform when meter is full
      if (newEnergy >= 100 && player.powerLevel === 0) {
        console.log("Energy meter full! Press transform button!");
      }
    },
    
    // Enhanced Combat
    chargeWebKick: (delta) => {
      const { player } = get();
      
      if (!player.webAttached) return;
      
      const newChargeTime = Math.min(player.kickChargeTimer + delta, 3); // Max 3 seconds
      const newPower = 10 + (newChargeTime / 3) * 40; // 10-50 damage based on charge
      
      set({
        player: {
          ...player,
          kickChargeTimer: newChargeTime,
          kickPower: newPower
        }
      });
    },
    
    releaseWebKick: () => {
      const { player } = get();
      
      console.log(`Web kick released! Power: ${player.kickPower}`);
      
      set({
        player: {
          ...player,
          isAttacking: true,
          attackType: "webKick",
          kickChargeTimer: 0
        }
      });
      
      // Finish attack
      setTimeout(() => {
        const currentPlayer = get().player;
        set({
          player: {
            ...currentPlayer,
            isAttacking: false,
            attackType: null,
            kickPower: 0
          }
        });
      }, 400);
    },
    
    fireEnergyBlast: (direction) => {
      const { player, selectedCharacter } = get();
      
      if (selectedCharacter !== "jaxon" || player.energy < 25) return;
      
      console.log("Jaxon fires energy blast in direction:", direction);
      
      set({
        player: {
          ...player,
          isAttacking: true,
          attackType: "energyBlast",
          energy: player.energy - 25,
          // Apply recoil
          velocityX: player.velocityX - direction[0] * 2,
          velocityY: player.velocityY - direction[1] * 2
        }
      });
      
      // Finish attack
      setTimeout(() => {
        const currentPlayer = get().player;
        set({
          player: {
            ...currentPlayer,
            isAttacking: false,
            attackType: null
          }
        });
      }, 300);
    },
    
    // Cosmetic System Implementation
    equipAccessory: (character, accessoryId, slot) => {
      const { equippedCosmetics } = get();
      
      console.log(`Equipping ${accessoryId} to ${character}'s ${slot} slot`);
      
      set({
        equippedCosmetics: {
          ...equippedCosmetics,
          [character]: {
            ...equippedCosmetics[character],
            [slot]: accessoryId
          }
        }
      });
    },
    
    unequipAccessory: (character, slot) => {
      const { equippedCosmetics } = get();
      
      console.log(`Unequipping ${character}'s ${slot} slot`);
      
      const updatedCosmetics = { ...equippedCosmetics[character] };
      delete updatedCosmetics[slot];
      
      set({
        equippedCosmetics: {
          ...equippedCosmetics,
          [character]: updatedCosmetics
        }
      });
    },
    
    unlockAccessory: (accessoryId) => {
      const { unlockedAccessories } = get();
      
      if (!unlockedAccessories.includes(accessoryId)) {
        console.log(`Unlocked new accessory: ${accessoryId}!`);
        set({
          unlockedAccessories: [...unlockedAccessories, accessoryId]
        });
      }
    },
    
    checkAndUnlockAccessories: () => {
      const { stats, highScore, unlockedAccessories } = get();
      const currentScore = stats.score;
      
      // Update high score
      if (currentScore > highScore) {
        set({ highScore: currentScore });
      }
      
      // Check all accessories and unlock based on score
      import('../cosmetics').then(({ ACCESSORIES }) => {
        ACCESSORIES.forEach(accessory => {
          if (
            currentScore >= accessory.unlockRequirement &&
            !unlockedAccessories.includes(accessory.id)
          ) {
            get().unlockAccessory(accessory.id);
          }
        });
      });
    }
  }))
);

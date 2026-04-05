import { create } from 'zustand';

type HeroId = 'Kaison' | 'Jaxon';

type Vec2 = [number, number];
type Vec3 = [number, number, number];

type WebAnchor = Vec3 | null;

type PowerLevel = 0 | 1;

type HorizontalInput = -1 | 0 | 1;

interface PlayerState {
  // Core Physics
  position: Vec3; // [x, y, z] - Z is locked to 0
  velocity: Vec2; // [vx, vy]
  isGrounded: boolean;
  gravity: number;
  jumpStrength: number;
  maxRunSpeed: number; // Added for movement
  horizontalAcceleration: number; // Added for smooth running
  currentHorizontalInput: HorizontalInput; // -1=Left, 1=Right, 0=None
  groundLevel: number; // The y-coordinate of the floor

  // Web-Swinging State
  webAttached: boolean;
  webButtonPressed: boolean;
  webAngle: number;
  webAngularVelocity: number;
  webAnchorPoint: WebAnchor;
  webLength: number;

  // Kick/Charge State
  kickButtonPressed: boolean;
  isKicking: boolean;
  kickChargeTimer: number;
  kickPower: number;

  // Superpower State
  activeHero: HeroId;
  powerLevel: PowerLevel; // 0=Normal, 1=Transformed
  energyMeter: number;
  maxEnergy: number;

  // Actions
  transformHero: () => void;
}

export const useGameStore = create<PlayerState>((set) => ({
  // Initial Values
  position: [0, 5, 0], // Start 5 units above ground
  velocity: [0, 0],
  isGrounded: false,
  gravity: 10, // Higher value for faster physics (adjust to your scale)
  jumpStrength: 8,
  maxRunSpeed: 8,
  horizontalAcceleration: 1.5,
  currentHorizontalInput: 0,
  groundLevel: 0,

  webAttached: false,
  webButtonPressed: false,
  webAngle: 0,
  webAngularVelocity: 0,
  webAnchorPoint: null,
  webLength: 20,

  kickButtonPressed: false,
  isKicking: false,
  kickChargeTimer: 0,
  kickPower: 0,

  activeHero: 'Jaxon', // Start as Jaxon for Energy Blast testing
  powerLevel: 0,
  energyMeter: 0,
  maxEnergy: 100,

  // Action Implementation
  transformHero: () => {
    set((state) => ({
      activeHero: state.activeHero === 'Jaxon' ? 'Kaison' : 'Jaxon',
      powerLevel: state.powerLevel === 0 ? 1 : state.powerLevel,
      energyMeter: 0,
    }));
  },
}));

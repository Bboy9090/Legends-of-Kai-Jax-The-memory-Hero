import { Fighter } from './character.types';

export enum GameState {
  LOADING = 'loading',
  MENU = 'menu',
  CHARACTER_SELECT = 'character_select',
  STAGE_SELECT = 'stage_select',
  BATTLE = 'battle',
  PAUSED = 'paused',
  RESULTS = 'results',
  GAME_OVER = 'game_over',
}

export enum BattleMode {
  STOCK = 'stock', // Lives-based
  TIME = 'time', // Time-based
  STAMINA = 'stamina', // HP-based
  TRAINING = 'training',
}

export interface GameConfig {
  targetFPS: number;
  fixedTimeStep: number; // In milliseconds
  maxDeltaTime: number;
  enablePerformanceMonitoring: boolean;
  enableDebugMode: boolean;
}

export interface BattleConfig {
  mode: BattleMode;
  timeLimit?: number; // Seconds
  stockCount?: number; // Lives per player
  staminaAmount?: number; // HP amount
  stageId: string;
  players: number;
  cpuDifficulty?: number; // 1-9
}

export interface PlayerSlot {
  id: string;
  playerNumber: number;
  characterId: string;
  isHuman: boolean;
  cpuLevel?: number;
  team?: number;
  color?: string;
}

export interface BattleState {
  fighters: Fighter[];
  timer: number; // Current time in seconds
  frameCount: number;
  isPaused: boolean;
  winner?: string;
}

export interface Stage {
  id: string;
  name: string;
  displayName: string;
  platforms: any[]; // Platform data
  blastZones: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
  spawnPoints: Array<{ x: number; y: number }>;
  music?: string;
}

export interface GameSession {
  id: string;
  state: GameState;
  config: GameConfig;
  battleConfig?: BattleConfig;
  currentStage?: Stage;
  players: PlayerSlot[];
  battleState?: BattleState;
  startTime: number;
}

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  updateTime: number;
  renderTime: number;
  memoryUsage: number;
}

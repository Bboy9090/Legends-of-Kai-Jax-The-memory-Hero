/**
 * Mission System Types
 */

export enum MissionDifficulty {
  TUTORIAL = 'tutorial',
  EASY = 'easy',
  NORMAL = 'normal',
  HARD = 'hard',
  EXPERT = 'expert',
  MASTER = 'master',
}

export enum MissionType {
  STORY = 'story',
  CHALLENGE = 'challenge',
  TRAINING = 'training',
  BOSS = 'boss',
  ARENA = 'arena',
  COLLECTION = 'collection',
}

export enum DNAType {
  FOX = 'fox',
  HEDGEHOG = 'hedgehog',
  WOLF = 'wolf',
  BIRD = 'bird',
  CAT = 'cat',
  DRAGON = 'dragon',
  PHOENIX = 'phoenix',
  ELEMENTAL = 'elemental',
}

export interface MissionReward {
  xp: number;
  currency: number;
  dna?: {
    type: DNAType;
    amount: number;
  };
  unlocks?: string[]; // Character IDs, moves, cosmetics
}

export interface MissionObjective {
  id: string;
  description: string;
  type: 'defeat' | 'survive' | 'collect' | 'combo' | 'timing';
  target?: string | number;
  optional?: boolean;
}

export interface Mission {
  id: number;
  book: number;
  chapter: number;
  title: string;
  description: string;
  type: MissionType;
  difficulty: MissionDifficulty;
  objectives: MissionObjective[];
  rewards: MissionReward;
  prerequisites?: number[]; // Mission IDs that must be completed first
  characters?: string[]; // Required or available characters
  arena?: string;
  timeLimit?: number; // seconds
  locked?: boolean;
}

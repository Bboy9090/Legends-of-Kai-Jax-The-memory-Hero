/**
 * ULTIMATE ENTERTAINMENT ENTERPRISES PRESENTS
 * ADDITIONAL GAME MODES
 * Towers • 1v1 • 2v2 • 3v3 • Gauntlet • Survivor
 */

export interface GameMode {
  id: string;
  name: string;
  description: string;
  icon: string;
  maxPlayers: number;
  minPlayers: number;
  supportsAI: boolean;
  difficulty?: 'easy' | 'medium' | 'hard' | 'extreme';
}

// ============ TOWERS TOURNAMENT (Mortal Kombat Style) ============
export interface Tower {
  id: string;
  name: string;
  description: string;
  floors: number;
  difficulty: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  rewards: { xp: number; currency: number; loot: string[] };
  unlockRequirement?: string;
}

export const TOWERS: Tower[] = [
  {
    id: 'tower_bronze',
    name: 'Bronze Tower',
    description: '10 floors of increasing difficulty. Perfect for beginners.',
    floors: 10,
    difficulty: 1,
    rewards: { xp: 500, currency: 400, loot: ['Bronze Badge'] },
  },
  {
    id: 'tower_silver',
    name: 'Silver Tower',
    description: '15 floors. Intermediate challenge. Unlock after Bronze.',
    floors: 15,
    difficulty: 3,
    rewards: { xp: 1000, currency: 800, loot: ['Silver Badge'] },
    unlockRequirement: 'tower_bronze',
  },
  {
    id: 'tower_gold',
    name: 'Gold Tower',
    description: '20 floors. Advanced challenge. Unlock after Silver.',
    floors: 20,
    difficulty: 5,
    rewards: { xp: 2000, currency: 1500, loot: ['Gold Badge'] },
    unlockRequirement: 'tower_silver',
  },
  {
    id: 'tower_platinum',
    name: 'Platinum Tower',
    description: '25 floors. Expert challenge. Unlock after Gold.',
    floors: 25,
    difficulty: 7,
    rewards: { xp: 3500, currency: 2500, loot: ['Platinum Badge'] },
    unlockRequirement: 'tower_gold',
  },
  {
    id: 'tower_diamond',
    name: 'Diamond Tower',
    description: '30 floors. Master challenge. Unlock after Platinum.',
    floors: 30,
    difficulty: 9,
    rewards: { xp: 5000, currency: 4000, loot: ['Diamond Badge', 'Tower Master Crown'] },
    unlockRequirement: 'tower_platinum',
  },
  {
    id: 'tower_legendary',
    name: 'Legendary Tower',
    description: '50 floors. Ultimate challenge. Only for the greatest warriors.',
    floors: 50,
    difficulty: 10,
    rewards: { xp: 10000, currency: 10000, loot: ['Legendary Badge', 'Ultimate Crown', 'Tower God Title'] },
    unlockRequirement: 'tower_diamond',
  },
];

// ============ GAME MODES ============
export const GAME_MODES: GameMode[] = [
  {
    id: 'story',
    name: 'Story Mode',
    description: 'Experience the epic 30-mission beast wars saga',
    icon: '📖',
    maxPlayers: 1,
    minPlayers: 1,
    supportsAI: false,
  },
  {
    id: 'towers',
    name: 'Towers Tournament',
    description: 'Climb the towers. Mortal Kombat style. 10-50 floors per tower.',
    icon: '🗼',
    maxPlayers: 1,
    minPlayers: 1,
    supportsAI: false,
  },
  {
    id: 'versus_1v1',
    name: '1v1 Versus',
    description: 'Player vs Player. One-on-one combat. Best of 3 rounds.',
    icon: '⚔️',
    maxPlayers: 2,
    minPlayers: 2,
    supportsAI: true,
  },
  {
    id: 'versus_2v2',
    name: '2v2 Team Battle',
    description: 'Team vs Team. Two fighters per side. Tag team mechanics.',
    icon: '👥',
    maxPlayers: 4,
    minPlayers: 4,
    supportsAI: true,
  },
  {
    id: 'versus_3v3',
    name: '3v3 Squad Battle',
    description: 'Squad vs Squad. Three fighters per side. Ultimate team synergy.',
    icon: '🦅',
    maxPlayers: 6,
    minPlayers: 6,
    supportsAI: true,
  },
  {
    id: 'gauntlet',
    name: 'Gauntlet Mode',
    description: 'Endless waves. Survive as long as you can. Increasing difficulty.',
    icon: '🔥',
    maxPlayers: 4,
    minPlayers: 1,
    supportsAI: true,
  },
  {
    id: 'survivor',
    name: 'Survivor Mode',
    description: 'Last beast standing. Battle royale style. One life. Last one wins.',
    icon: '💀',
    maxPlayers: 8,
    minPlayers: 4,
    supportsAI: true,
  },
];

export function getGameModeById(id: string): GameMode | undefined {
  return GAME_MODES.find((m) => m.id === id);
}

export function getTowerById(id: string): Tower | undefined {
  return TOWERS.find((t) => t.id === id);
}

export function getUnlockedTowers(completedTowers: string[]): Tower[] {
  return TOWERS.filter((t) => !t.unlockRequirement || completedTowers.includes(t.unlockRequirement));
}

// Story Missions - Main narrative progression missions
import { ActNumber } from './storyMode';

export interface StoryMission {
  id: string;
  actNumber: ActNumber;
  missionNumber: number;
  name: string;
  description: string;
  objectives: string[];
  bossName?: string;
  bossPhases?: number;
  difficulty: number;
  rewards: {
    xp: number;
    currency: number;
    loot: string[];
  };
  cinematicIntro?: string;
}

const STORY_MISSIONS: Record<string, StoryMission> = {
  'story_prologue': {
    id: 'story_prologue',
    actNumber: 1,
    missionNumber: 1,
    name: 'The Awakening',
    description: 'A new hero emerges from the Genesis',
    objectives: ['Complete the tutorial', 'Learn basic combat'],
    difficulty: 1,
    rewards: { xp: 100, currency: 50, loot: ['Starter Gear'] },
    cinematicIntro: 'prologue_cinematic'
  },
  'story_ch1_intro': {
    id: 'story_ch1_intro',
    actNumber: 1,
    missionNumber: 2,
    name: 'First Steps',
    description: 'Learn the ways of the Beast-Kin',
    objectives: ['Explore the arena', 'Defeat 3 opponents'],
    difficulty: 2,
    rewards: { xp: 200, currency: 100, loot: ['Training Badge'] },
    cinematicIntro: 'chapter1_intro'
  },
  'story_ch1_boss': {
    id: 'story_ch1_boss',
    actNumber: 1,
    missionNumber: 10,
    name: 'Guardian Trial',
    description: 'Face Boryx Zenith in combat',
    objectives: ['Defeat Boryx Zenith'],
    bossName: 'Boryx Zenith',
    bossPhases: 2,
    difficulty: 4,
    rewards: { xp: 500, currency: 250, loot: ['Guardian Crest'] },
    cinematicIntro: 'boryx_intro'
  },
  'story_ch2_intro': {
    id: 'story_ch2_intro',
    actNumber: 2,
    missionNumber: 1,
    name: 'The Covenant Calls',
    description: 'Journey to the Aeterna Covenant',
    objectives: ['Travel to the Covenant', 'Meet the Oracle'],
    difficulty: 3,
    rewards: { xp: 300, currency: 150, loot: ['Covenant Token'] },
    cinematicIntro: 'chapter2_intro'
  },
  'story_ch2_boss': {
    id: 'story_ch2_boss',
    actNumber: 2,
    missionNumber: 10,
    name: "Oracle's Vision",
    description: 'Lunara Solis reveals the prophecy',
    objectives: ['Complete the vision trial', 'Unlock Memory Layer 4'],
    bossName: 'Vision Guardian',
    bossPhases: 3,
    difficulty: 5,
    rewards: { xp: 750, currency: 400, loot: ['Oracle Blessing'] },
    cinematicIntro: 'oracle_vision'
  },
  'story_finale': {
    id: 'story_finale',
    actNumber: 9,
    missionNumber: 10,
    name: 'Voidonus Rising',
    description: 'The final battle against Voidonus Imperion',
    objectives: ['Survive Phase 1', 'Counter the Void', 'Defeat Voidonus'],
    bossName: 'Voidonus Imperion',
    bossPhases: 5,
    difficulty: 10,
    rewards: { xp: 10000, currency: 5000, loot: ['Genesis Crown', 'Void Slayer Title'] },
    cinematicIntro: 'finale_cinematic'
  }
};

export function getStoryMissionById(id: string): StoryMission | undefined {
  return STORY_MISSIONS[id];
}

export function getAllStoryMissions(): StoryMission[] {
  return Object.values(STORY_MISSIONS);
}

export function getStoryMissionsByAct(act: ActNumber): StoryMission[] {
  return Object.values(STORY_MISSIONS).filter(m => m.actNumber === act);
}

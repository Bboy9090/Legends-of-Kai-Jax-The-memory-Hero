// Story Missions - Main narrative progression missions

export interface StoryMission {
  id: string;
  chapter: number;
  name: string;
  description: string;
  cinematicIntro: boolean;
}

const STORY_MISSIONS: Record<string, StoryMission> = {
  'story_prologue': {
    id: 'story_prologue',
    chapter: 0,
    name: 'The Awakening',
    description: 'A new hero emerges from the Genesis',
    cinematicIntro: true
  },
  'story_ch1_intro': {
    id: 'story_ch1_intro',
    chapter: 1,
    name: 'First Steps',
    description: 'Learn the ways of the Beast-Kin',
    cinematicIntro: true
  },
  'story_ch1_boss': {
    id: 'story_ch1_boss',
    chapter: 1,
    name: 'Guardian Trial',
    description: 'Face Boryx Zenith in combat',
    cinematicIntro: true
  },
  'story_ch2_intro': {
    id: 'story_ch2_intro',
    chapter: 2,
    name: 'The Covenant Calls',
    description: 'Journey to the Aeterna Covenant',
    cinematicIntro: true
  },
  'story_ch2_boss': {
    id: 'story_ch2_boss',
    chapter: 2,
    name: 'Oracle\'s Vision',
    description: 'Lunara Solis reveals the prophecy',
    cinematicIntro: true
  },
  'story_finale': {
    id: 'story_finale',
    chapter: 9,
    name: 'Voidonus Rising',
    description: 'The final battle against Voidonus Imperion',
    cinematicIntro: true
  }
};

export function getStoryMissionById(id: string): StoryMission | undefined {
  return STORY_MISSIONS[id];
}

export function getAllStoryMissions(): StoryMission[] {
  return Object.values(STORY_MISSIONS);
}

export function getStoryMissionsByChapter(chapter: number): StoryMission[] {
  return Object.values(STORY_MISSIONS).filter(m => m.chapter === chapter);
}

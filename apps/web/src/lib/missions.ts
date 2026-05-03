// LEGENDS OF KAI-JAX: MISSION SYSTEM
// PRODUCTION VERSION - ALL PLACEHOLDERS REMOVED

import { ActNumber } from './storyMode';
import { getStoryMissionById } from './story_missions';

export interface Mission {
  id: string;
  actNumber: ActNumber;
  missionNumber: number;
  name: string;
  description: string;
  objectives: string[];
  bossName?: string;
  bossPhases?: number;
  difficulty: number; // 1-10
  recommendedTeam?: string[];
  rewards: {
    xp: number;
    currency: number;
    loot: string[];
    unlocksCharacter?: string;
    unlocksAbility?: string;
  };
  isBoss: boolean;
  isFireMoment: boolean;
  cinematicCutscenes: string[];
}

// ============ ACT I — THE AWAKENING (Missions 1-20) ============
export const ACT_I_MISSIONS: Mission[] = [
  {
    id: 'act1_m1',
    actNumber: 1,
    missionNumber: 1,
    name: 'Sector Protocol: Alpha',
    description: 'Jaxon Swift awakens in the ruins of the Bronx. A corrupted echo has been detected.',
    objectives: ['Defeat the first Echo remnant', 'Initialize Memory Synchronization'],
    difficulty: 1,
    rewards: { xp: 100, currency: 50, loot: [] },
    isBoss: false,
    isFireMoment: false,
    cinematicCutscenes: ['intro_jaxon']
  },
  {
    id: 'act1_m2',
    actNumber: 1,
    missionNumber: 2,
    name: 'Chronos Interference',
    description: 'Silver Chronos appears through a time rift. Test your speed against the Sage.',
    objectives: ['Survive Silver\'s time dilation', 'Land 5 strikes on the Sage'],
    difficulty: 2,
    rewards: { xp: 150, currency: 75, loot: ['Chronos Shard'] },
    isBoss: false,
    isFireMoment: false,
    cinematicCutscenes: []
  },
  {
    id: 'act1_m3',
    actNumber: 1,
    missionNumber: 3,
    name: 'The Memory Hero Rises',
    description: 'Jaxon and Kaison reach 50% synergy. The first partial fusion of Kai-Jax emerges.',
    objectives: ['Activate partial fusion', 'Defeat the Void Warden'],
    difficulty: 2,
    rewards: { xp: 150, currency: 75, loot: ['Memory Core'] },
    isBoss: false,
    isFireMoment: true,
    cinematicCutscenes: ['kai_jax_intro']
  },
  {
    id: 'act1_m4',
    actNumber: 1,
    missionNumber: 4,
    name: 'Static Overdrive',
    description: 'Volter, the Lightning Beast, has been corrupted by the Rift. Bring him back to the Weave.',
    objectives: ['Defeat Corrupted Volter', 'Absorb 1000V of energy'],
    difficulty: 3,
    rewards: { xp: 200, currency: 100, loot: ['Static Heart'] },
    isBoss: false,
    isFireMoment: true,
    cinematicCutscenes: ['volter_intro']
  },
  {
    id: 'act1_m14',
    actNumber: 1,
    missionNumber: 14,
    name: 'The Rift Breach',
    description: 'The final barrier falls. The Rift is fully open. Fight to hold the line.',
    objectives: ['Hold the central sector for 3 minutes', 'Close the Rift Gate'],
    difficulty: 6,
    bossName: 'Rift General Valos',
    bossPhases: 2,
    rewards: { xp: 500, currency: 300, loot: ['Champion Seal', 'Rift Key I'] },
    isBoss: true,
    isFireMoment: true,
    cinematicCutscenes: ['breach_cinematic']
  }
];

export const ALL_MISSIONS = {
  act1: ACT_I_MISSIONS,
};

export function getMissionsByAct(actNumber: ActNumber): Mission[] {
  const key = `act${actNumber}` as keyof typeof ALL_MISSIONS;
  return ALL_MISSIONS[key] || [];
}

export function getMissionById(id: string): Mission | undefined {
  // Check main mission list
  for (const missions of Object.values(ALL_MISSIONS)) {
    const found = missions.find(m => m.id === id);
    if (found) return found;
  }
  
  // Fallback to cinematic story missions
  const story = getStoryMissionById(id);
  if (story) {
    return {
      id: story.id,
      actNumber: story.actNumber,
      missionNumber: story.missionNumber,
      name: story.title,
      description: story.description,
      objectives: story.objectives,
      difficulty: story.difficulty,
      rewards: { xp: story.rewards.xp, currency: story.rewards.currency, loot: story.rewards.loot },
      isBoss: !!story.bossId,
      isFireMoment: true,
      cinematicCutscenes: [],
    };
  }
  return undefined;
}

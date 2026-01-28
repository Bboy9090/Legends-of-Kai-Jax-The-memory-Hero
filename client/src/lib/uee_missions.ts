// UEE (Ultimate Elemental Encounter) Missions
// These are special challenge missions with unique mechanics

export interface UEEMission {
  id: string;
  missionNumber: number;
  name: string;
  description: string;
  element: string;
  objectives: string[];
  bossName?: string;
  difficulty: number;
  rewards: {
    xp: number;
    currency: number;
    loot: string[];
  };
}

const UEE_MISSIONS: Record<string, UEEMission> = {
  'uee_fire_trial': {
    id: 'uee_fire_trial',
    missionNumber: 1,
    name: 'Trial of Flames',
    element: 'fire',
    description: 'Master the burning arena',
    objectives: ['Survive the inferno', 'Defeat the Flame Guardian'],
    bossName: 'Flame Guardian',
    difficulty: 7,
    rewards: { xp: 1000, currency: 500, loot: ['Ember Core'] }
  },
  'uee_ice_trial': {
    id: 'uee_ice_trial',
    missionNumber: 2,
    name: 'Frozen Domain',
    element: 'ice',
    description: 'Survive the eternal frost',
    objectives: ['Navigate the ice maze', 'Defeat the Frost Titan'],
    bossName: 'Frost Titan',
    difficulty: 7,
    rewards: { xp: 1000, currency: 500, loot: ['Glacial Shard'] }
  },
  'uee_lightning_trial': {
    id: 'uee_lightning_trial',
    missionNumber: 3,
    name: 'Storm Summit',
    element: 'lightning',
    description: 'Channel the tempest',
    objectives: ['Harness the storm', 'Defeat the Thunder Lord'],
    bossName: 'Thunder Lord',
    difficulty: 8,
    rewards: { xp: 1500, currency: 750, loot: ['Storm Crystal'] }
  },
  'uee_shadow_trial': {
    id: 'uee_shadow_trial',
    missionNumber: 4,
    name: 'Void Depths',
    element: 'shadow',
    description: 'Face the darkness within',
    objectives: ['Resist corruption', 'Defeat the Shadow Wraith'],
    bossName: 'Shadow Wraith',
    difficulty: 9,
    rewards: { xp: 2000, currency: 1000, loot: ['Void Essence'] }
  },
  'uee_light_trial': {
    id: 'uee_light_trial',
    missionNumber: 5,
    name: 'Radiant Ascension',
    element: 'light',
    description: 'Prove your worth to the light',
    objectives: ['Pass the judgment', 'Receive the blessing'],
    difficulty: 9,
    rewards: { xp: 2500, currency: 1250, loot: ['Divine Fragment'] }
  }
};

export function getUEEMissionById(id: string): UEEMission | undefined {
  return UEE_MISSIONS[id];
}

export function getAllUEEMissions(): UEEMission[] {
  return Object.values(UEE_MISSIONS);
}

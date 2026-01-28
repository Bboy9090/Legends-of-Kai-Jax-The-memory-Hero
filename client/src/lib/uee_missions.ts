// UEE (Ultimate Elemental Encounter) Missions
// These are special challenge missions with unique mechanics

export interface UEEMission {
  id: string;
  name: string;
  element: string;
  difficulty: number;
  description: string;
}

const UEE_MISSIONS: Record<string, UEEMission> = {
  'uee_fire_trial': {
    id: 'uee_fire_trial',
    name: 'Trial of Flames',
    element: 'fire',
    difficulty: 7,
    description: 'Master the burning arena'
  },
  'uee_ice_trial': {
    id: 'uee_ice_trial',
    name: 'Frozen Domain',
    element: 'ice',
    difficulty: 7,
    description: 'Survive the eternal frost'
  },
  'uee_lightning_trial': {
    id: 'uee_lightning_trial',
    name: 'Storm Summit',
    element: 'lightning',
    difficulty: 8,
    description: 'Channel the tempest'
  },
  'uee_shadow_trial': {
    id: 'uee_shadow_trial',
    name: 'Void Depths',
    element: 'shadow',
    difficulty: 9,
    description: 'Face the darkness within'
  },
  'uee_light_trial': {
    id: 'uee_light_trial',
    name: 'Radiant Ascension',
    element: 'light',
    difficulty: 9,
    description: 'Prove your worth to the light'
  }
};

export function getUEEMissionById(id: string): UEEMission | undefined {
  return UEE_MISSIONS[id];
}

export function getAllUEEMissions(): UEEMission[] {
  return Object.values(UEE_MISSIONS);
}

export type EncounterType = 'dialogue' | 'cutscene' | 'battle';

export interface NPCDialogue {
  id: string;
  npcName: string;
  npcDescription: string;
  location: string;
  lines: string[];
  hint?: {
    direction: string;
    description: string;
  };
  triggersEncounter?: string;
}

export interface WorldEncounter {
  id: string;
  type: EncounterType;
  location: [number, number, number];
  triggerRadius: number;
  requiredFlag?: string;
  setsFlag?: string;
  dialogue?: NPCDialogue;
  cutsceneId?: string;
  battleId?: string;
}

export interface AreaHint {
  id: string;
  areaName: string;
  npcHints: NPCDialogue[];
  encounters: WorldEncounter[];
}

export const PROLOGUE_NPCS: NPCDialogue[] = [
  {
    id: 'old_man_memorial',
    npcName: 'Old Timer',
    npcDescription: 'A weathered man sitting near the memorial steps',
    location: 'Home Town - Memorial Steps',
    lines: [
      "You two again? Still running around at this hour?",
      "Listen... I heard something strange near the old rail bridge.",
      "Sounded like electricity crackling. Saw blue light too.",
      "Probably nothing, but... be careful if you head that way."
    ],
    hint: {
      direction: 'east',
      description: 'Old rail bridge - strange lights reported'
    }
  },
  {
    id: 'street_kid',
    npcName: 'Street Kid',
    npcDescription: 'A nervous kid hiding behind a dumpster',
    location: 'Home Town - Back Alley',
    lines: [
      "Shh! Keep your voice down!",
      "The Fang guys came through here earlier.",
      "They were looking for something... kept talking about a 'fragment'.",
      "Whatever that is, I don't want any part of it."
    ]
  },
  {
    id: 'vendor_lady',
    npcName: 'Ms. Rosa',
    npcDescription: 'A kind woman running a small food cart',
    location: 'Home Town - Market Corner',
    lines: [
      "Jaxon! Kaison! You boys hungry?",
      "Here, take these. Don't tell anyone I gave you extra.",
      "Things have been rough since the last Rift surge...",
      "Stay safe out there. The streets aren't what they used to be."
    ]
  }
];

export const CHAPTER_1_NPCS: NPCDialogue[] = [
  {
    id: 'scout_ridge',
    npcName: 'Ridge Scout',
    npcDescription: 'A wary lookout perched on broken concrete',
    location: 'The Hungry Edge - Ridge Overlook',
    lines: [
      "New faces. You two look lost.",
      "This is the Hungry Edge. Everything here wants to eat you.",
      "I saw something big moving near the bone run...",
      "Eight feet tall. Eyes like fire. Moved like it owned the place."
    ],
    hint: {
      direction: 'north',
      description: 'Bone Run - something dangerous spotted'
    },
    triggersEncounter: 'hollow_king_approach'
  },
  {
    id: 'survivor_camp',
    npcName: 'Camp Elder',
    npcDescription: 'An old beast-kin tending a small fire',
    location: 'The Hungry Edge - Survivor Camp',
    lines: [
      "Sit. Rest. You look exhausted.",
      "The Hungry Edge tests everyone who passes through.",
      "Those who survive learn its lesson: hesitation kills.",
      "The old ones called it the Trial of Hunger. But that's just stories now."
    ]
  }
];

export const CHAPTER_2_NPCS: NPCDialogue[] = [
  {
    id: 'neon_merchant',
    npcName: 'Neon Merchant',
    npcDescription: 'A flashy trader with glowing accessories',
    location: 'Neon Ward - Market Strip',
    lines: [
      "Welcome to the Ward! Cleanest streets in Raging City!",
      "Thanks to the Iron Order, of course.",
      "That Boryx guy runs things tight around here.",
      "Nobody causes trouble. Nobody... gets to cause trouble."
    ],
    hint: {
      direction: 'central tower',
      description: 'Iron Order headquarters - Boryx Zenith'
    }
  },
  {
    id: 'scared_citizen',
    npcName: 'Nervous Citizen',
    npcDescription: 'A twitchy person glancing around constantly',
    location: 'Neon Ward - Side Street',
    lines: [
      "You're new here, aren't you?",
      "A word of advice: follow the rules. All of them.",
      "The Order doesn't give second chances.",
      "I saw someone argue with an enforcer once... once."
    ]
  }
];

export const CHAPTER_3_NPCS: NPCDialogue[] = [
  {
    id: 'market_dealer',
    npcName: 'Shadow Dealer',
    npcDescription: 'A hooded figure in a dark corner',
    location: 'Iron Market - Underground',
    lines: [
      "Looking for something? Information costs here.",
      "The Bridge? Yeah, I know about it.",
      "They say a tiger walks there. Orange fur, ember eyes.",
      "He's been waiting for someone. Maybe it's you two."
    ],
    hint: {
      direction: 'west bridge',
      description: 'The Broken Bridge - tiger sighting'
    },
    triggersEncounter: 'boryn_meeting'
  }
];

export const WORLD_ENCOUNTERS: WorldEncounter[] = [
  {
    id: 'prologue_lightning',
    type: 'cutscene',
    location: [30, 0, 5],
    triggerRadius: 5,
    cutsceneId: 'prologue_awakening',
    setsFlag: 'PROLOGUE_AWAKENING_SEEN'
  },
  {
    id: 'prologue_fang_attack',
    type: 'cutscene',
    location: [50, 5, -10],
    triggerRadius: 8,
    requiredFlag: 'PROLOGUE_AWAKENING_SEEN',
    cutsceneId: 'prologue_first_fusion',
    setsFlag: 'FIRST_FUSION_COMPLETE'
  },
  {
    id: 'hollow_king_approach',
    type: 'cutscene',
    location: [100, 0, 50],
    triggerRadius: 10,
    requiredFlag: 'FIRST_FUSION_COMPLETE',
    cutsceneId: 'ch1_the_hungry_edge',
    setsFlag: 'HOLLOW_KING_MET'
  },
  {
    id: 'boryx_encounter',
    type: 'cutscene',
    location: [0, 20, 100],
    triggerRadius: 8,
    requiredFlag: 'HOLLOW_KING_MET',
    cutsceneId: 'ch2_iron_order',
    setsFlag: 'BORYX_MET'
  },
  {
    id: 'boryn_meeting',
    type: 'cutscene',
    location: [-50, 0, 80],
    triggerRadius: 10,
    requiredFlag: 'BORYX_MET',
    cutsceneId: 'ch3_broken_bridge',
    setsFlag: 'BORYN_MET'
  }
];

export function getNPCsForArea(areaId: string): NPCDialogue[] {
  switch (areaId) {
    case 'prologue':
    case 'home_town':
      return PROLOGUE_NPCS;
    case 'chapter_1':
    case 'hungry_edge':
      return CHAPTER_1_NPCS;
    case 'chapter_2':
    case 'neon_ward':
      return CHAPTER_2_NPCS;
    case 'chapter_3':
    case 'iron_market':
      return CHAPTER_3_NPCS;
    default:
      return PROLOGUE_NPCS;
  }
}

export function getEncounterById(encounterId: string): WorldEncounter | undefined {
  return WORLD_ENCOUNTERS.find(e => e.id === encounterId);
}

export function getEncountersInRadius(position: [number, number, number], radius: number): WorldEncounter[] {
  return WORLD_ENCOUNTERS.filter(encounter => {
    const dx = encounter.location[0] - position[0];
    const dy = encounter.location[1] - position[1];
    const dz = encounter.location[2] - position[2];
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    return distance <= radius;
  });
}

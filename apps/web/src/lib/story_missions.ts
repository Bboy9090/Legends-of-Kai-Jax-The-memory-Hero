/**
 * LEGENDS OF KAI-JAX: THE MEMORY HERO
 * OFFICIAL STORY CAMPAIGN DATA (ACTS I, II, III)
 * Superb 15-Mission Vertical Slice - Feral Action & Memory Magic
 */

export interface StoryDialogue {
  speaker: string;
  text: string;
  emotion?: 'neutral' | 'angry' | 'sad' | 'determined' | 'happy';
  side?: 'left' | 'right';
}

export interface EnemyWave {
  type: string;
  count: number;
  delay?: number;
}

export interface StoryMission {
  id: string;
  actNumber: 1 | 2 | 3;
  missionNumber: number;
  title: string;
  description: string;
  introCutscene: StoryDialogue[];
  outroCutscene: StoryDialogue[];
  objectives: string[];
  difficulty: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  bossId?: string;
  arena: string;
  timeLimit?: number; // seconds
  requiredCharacters?: string[];
  unlockableCharacters?: string[];
  storyBeat: string;
  rewards: { xp: number; currency: number; loot: string[]; unlocks?: string[] };
  gameplayType: 'combat' | 'platforming' | 'stealth' | 'chase' | 'boss' | 'team' | 'survival';
  enemyWaves: EnemyWave[];
}

// ============ ACT I: CONVERGENCE (Missions 1-5) ============
export const ACT_I_STORY_MISSIONS: StoryMission[] = [
  {
    id: 'story_act1_m1',
    actNumber: 1,
    missionNumber: 1,
    title: 'Awakening of the Memory Hero',
    description: 'Kai-Jax awakens in the Cross Point Arena. The fragments of a thousand memories swirl around him as the Rift begins to tear.',
    introCutscene: [
      { speaker: 'System', text: 'Synchronization complete. Kai-Jax protocol active.', side: 'right' },
      { speaker: 'Kai-Jax', text: 'My head... it\'s full of voices. These aren\'t just echoes... they are survivors.', side: 'left', emotion: 'determined' },
      { speaker: 'System', text: 'WARNING: Void energy detected in the lower sectors. Engagement required.', side: 'right' }
    ],
    outroCutscene: [
      { speaker: 'Kai-Jax', text: 'I can feel the Rift pulsing. This is just the beginning.', side: 'left' }
    ],
    objectives: ['Defeat the first wave of Void remnants', 'Synchronize with the Arena core'],
    difficulty: 1,
    arena: 'bronx_streets',
    requiredCharacters: ['kai-jax'],
    storyBeat: 'Kai-Jax awakens and realizes his purpose as the Memory Hero as the Rift starts to consume the arena.',
    rewards: { xp: 200, currency: 150, loot: ['Arena Badge'], unlocks: ['kaison'] },
    gameplayType: 'combat',
    enemyWaves: [{ type: 'grunt', count: 3 }, { type: 'grunt', count: 4, delay: 2 }]
  },
  {
    id: 'story_act1_m2',
    actNumber: 1,
    missionNumber: 2,
    title: 'Kaison: Swift Guardian',
    description: 'Kaison enters the tournament. His fox-wolf hybrid form moves with precision.',
    introCutscene: [
      { speaker: 'Kaison', text: 'I don\'t like crowds. But I need the credits to fix the Memory Well.', side: 'left', emotion: 'sad' },
      { speaker: 'Announcer', text: 'Behold! The Ghost of the Bronx!', side: 'right' }
    ],
    outroCutscene: [
      { speaker: 'Kaison', text: 'I felt a ripple. The Memory Well is failing. I must move fast.', side: 'left' }
    ],
    objectives: ['Master Fox Dash', 'Use web control 3 times'],
    difficulty: 2,
    arena: 'cross_point_arena',
    requiredCharacters: ['kaison'],
    storyBeat: 'Kaison debuts. His tactical skills shine, but survivor\'s guilt weighs heavy.',
    rewards: { xp: 250, currency: 200, loot: ['Tactical Crest'] },
    gameplayType: 'combat',
    enemyWaves: [{ type: 'grunt', count: 5 }, { type: 'grunt', count: 6, delay: 3 }]
  },
  {
    id: 'story_act1_m3',
    actNumber: 1,
    missionNumber: 3,
    title: 'The Broken Bracket',
    description: 'The tournament bracket glitches. Reality tears. Void creatures pour through.',
    introCutscene: [
      { speaker: 'Announcer', text: 'What is— ERROR — REALITY FAILURE —', side: 'right', emotion: 'angry' },
      { speaker: 'Kaison', text: 'It\'s starting. The Rift is here!', side: 'left', emotion: 'determined' }
    ],
    outroCutscene: [
      { speaker: 'Kaison', text: 'The arena is lost. We need to find the others.', side: 'left' }
    ],
    objectives: ['Defeat 8 Void Grunts', 'Close the Rift'],
    difficulty: 3,
    arena: 'memory_vault',
    storyBeat: 'INCITING INCIDENT: The tournament is invaded. Reality is under attack.',
    rewards: { xp: 300, currency: 250, loot: ['Rift Fragment'], unlocks: ['jaxon'] },
    gameplayType: 'survival',
    enemyWaves: [{ type: 'void-grunt', count: 8 }, { type: 'void-grunt', count: 12, delay: 4 }]
  },
  {
    id: 'story_act1_m4',
    actNumber: 1,
    missionNumber: 4,
    title: 'The Void Stalker',
    description: 'A shadow moves through the Bronx ruins. It hunts the Memory Hero.',
    introCutscene: [
      { speaker: 'Jaxon', text: 'I see it. Something fast.', side: 'right', emotion: 'determined' },
      { speaker: 'Void Stalker', text: '...memory... mine...', side: 'left', emotion: 'angry' }
    ],
    outroCutscene: [
      { speaker: 'Jaxon', text: 'It retreated into the Rift. We need more power.', side: 'right' }
    ],
    objectives: ['Chase the Stalker', 'Survive the ambush'],
    difficulty: 4,
    arena: 'memory_vault',
    bossId: 'void-stalker',
    storyBeat: 'A recurring antagonist is introduced, testing Jaxon\'s speed.',
    rewards: { xp: 400, currency: 300, loot: ['Shadow Essence'] },
    gameplayType: 'chase',
    enemyWaves: [{ type: 'void-scout', count: 5 }, { type: 'void-stalker-minion', count: 3, delay: 2 }]
  },
  {
    id: 'story_act1_m5',
    actNumber: 1,
    missionNumber: 5,
    title: 'Breach at the Cross Point',
    description: 'The final stand at the tournament grounds. The Rift is fully open.',
    introCutscene: [
      { speaker: 'Silver', text: 'This is the end of the beginning. Hold the line!', side: 'right', emotion: 'determined' },
      { speaker: 'Kaison', text: 'For the Bronx. For everything!', side: 'left', emotion: 'determined' }
    ],
    outroCutscene: [
      { speaker: 'Narrator', text: 'The arena falls. The heroes retreat into the shadows. Act I concludes.', side: 'left' }
    ],
    objectives: ['Defeat the Rift General', 'Protect the civilians'],
    difficulty: 5,
    arena: 'memory_vault',
    bossId: 'rift-general',
    storyBeat: 'ACT I FINALE: The heroes fail to close the rift. The world changes forever.',
    rewards: { xp: 600, currency: 500, loot: ['Veteran Seal'] },
    gameplayType: 'boss',
    enemyWaves: [{ type: 'void-legion', count: 6 }, { type: 'void-elite', count: 4, delay: 5 }]
  }
];

// ============ ACT II: FRACTURED LIGHT (Missions 6-10) ============
export const ACT_II_STORY_MISSIONS: StoryMission[] = [
  {
    id: 'story_act2_m6',
    actNumber: 2,
    missionNumber: 6,
    title: 'Shadows of the Ashblock',
    description: 'The heroes fight to contain the Void spreading through the Ashblock district ruins.',
    introCutscene: [
      { speaker: 'Kai-Jax', text: 'I can feel another shard nearby. We can\'t let the Void consume it.', side: 'left' }
    ],
    outroCutscene: [
      { speaker: 'Kai-Jax', text: 'One step closer to restoring the Weave.', side: 'left' }
    ],
    objectives: ['Contain the Void outbreak', 'Rescue 3 Trapped Memories'],
    difficulty: 5,
    arena: 'rift_frontier',
    storyBeat: 'The struggle continues as the Void infects the environment and consumes memory nodes.',
    rewards: { xp: 500, currency: 350, loot: ['Ashblock Memory'] },
    gameplayType: 'combat',
    enemyWaves: [{ type: 'void-grunt', count: 6 }, { type: 'void-scout', count: 8, delay: 3 }]
  },
  {
    id: 'story_act2_m7',
    actNumber: 2,
    missionNumber: 7,
    title: 'The First Fusion: Kai-Jax Born',
    description: 'Kaison and Jaxon reach 100% synergy. The Memory Hero is born.',
    introCutscene: [
      { speaker: 'Kaison', text: 'Jaxon, I can\'t hold the Rift alone!', side: 'left', emotion: 'angry' },
      { speaker: 'Jaxon', text: 'Then don\'t! Grab my hand! Let\'s show them what speed and tactics look like together!', side: 'right', emotion: 'determined' },
      { speaker: 'Narrator', text: 'Light erupts as two legends become one...', side: 'left' }
    ],
    outroCutscene: [
      { speaker: 'Kai-Jax', text: 'I remember... everything. The Void ends here.', side: 'left', emotion: 'determined' }
    ],
    objectives: ['Master the Fusion attacks', 'Defeat the Synergy Hunter'],
    difficulty: 6,
    arena: 'rift_frontier',
    requiredCharacters: ['kaison', 'jaxon'],
    unlockableCharacters: ['kai-jax'],
    storyBeat: 'MIDPOINT: Kai-Jax is born through the first 100% synergy fusion.',
    rewards: { xp: 800, currency: 600, loot: ['Synergy Core'] },
    gameplayType: 'boss',
    bossId: 'synergy-hunter',
    enemyWaves: [{ type: 'void-elite', count: 4 }]
  },
  {
    id: 'story_act2_m8',
    actNumber: 2,
    missionNumber: 8,
    title: 'The Ghostly Echo',
    description: 'Deep in the Void Tower, a shadow of Kai-Jax\'s father appears.',
    introCutscene: [
      { speaker: 'Kai-Jax', text: 'Father? Is that you?', side: 'left', emotion: 'sad' },
      { speaker: 'Ghostly Echo', text: 'Memory is a cage, Kai. I will set you free.', side: 'right', emotion: 'angry' }
    ],
    outroCutscene: [
      { speaker: 'Kai-Jax', text: 'It was just a hollow reflection. But the pain was real.', side: 'left' }
    ],
    objectives: ['Survive the spectral onslaught', 'Don\'t use special moves'],
    difficulty: 7,
    arena: 'rift_frontier',
    storyBeat: 'Psychological warfare from the Void, testing the hero\'s resolve.',
    rewards: { xp: 500, currency: 400, loot: ['Spectral Shard'] },
    gameplayType: 'survival',
    enemyWaves: [{ type: 'void-wraith', count: 8 }, { type: 'void-wraith', count: 12, delay: 5 }]
  },
  {
    id: 'story_act2_m9',
    actNumber: 2,
    missionNumber: 9,
    title: 'The Core\'s Defense',
    description: 'The resistance pushes back against the Void occupation at the Skyforge Plateau.',
    introCutscene: [
      { speaker: 'Silver', text: 'The timeline is shifting. We must act now.', side: 'right' }
    ],
    outroCutscene: [
      { speaker: 'Silver', text: 'Well fought. The echo remains.', side: 'right' }
    ],
    objectives: ['Secure the sector', 'Destroy the Void Disruptors'],
    difficulty: 7,
    arena: 'rift_frontier',
    storyBeat: 'Systematic reclamation of stolen memory nodes.',
    rewards: { xp: 600, currency: 500, loot: ['Skyforge Metal'] },
    gameplayType: 'combat',
    enemyWaves: [{ type: 'void-elite', count: 6 }, { type: 'void-brute', count: 2, delay: 4 }]
  },
  {
    id: 'story_act2_m10',
    actNumber: 2,
    missionNumber: 10,
    title: 'Siege of the Memory Well',
    description: 'The final defense of the last memory archive. Everything is on the line.',
    introCutscene: [
      { speaker: 'Silver', text: 'The well is leaking! If we lose this, we lose our history!', side: 'right', emotion: 'angry' },
      { speaker: 'Kai-Jax', text: 'Then we won\'t lose.', side: 'left', emotion: 'determined' }
    ],
    outroCutscene: [
      { speaker: 'Narrator', text: 'The well is stabilized, but at a great cost. The path to the Rift Citadel is open.', side: 'left' }
    ],
    objectives: ['Defeat 3 waves of Elite Void', 'Repair the Core', 'Defeat the Well Defiler'],
    difficulty: 8,
    arena: 'rift_frontier',
    bossId: 'well-defiler',
    storyBeat: 'ACT II FINALE: A major tactical victory, setting the stage for the counter-attack.',
    rewards: { xp: 1000, currency: 800, loot: ['Ancient Archive'] },
    gameplayType: 'boss',
    enemyWaves: [{ type: 'void-elite', count: 10 }, { type: 'void-brute', count: 4, delay: 8 }]
  }
];

// ============ ACT III: UNITY'S DAWN (Missions 11-15) ============
export const ACT_III_STORY_MISSIONS: StoryMission[] = [
  {
    id: 'story_act3_m11',
    actNumber: 3,
    missionNumber: 11,
    title: 'The Citadel Gates',
    description: 'The final push through the outer defenses of the Rift Citadel.',
    introCutscene: [
      { speaker: 'Kai-Jax', text: 'No turning back now.', side: 'left', emotion: 'determined' }
    ],
    outroCutscene: [
      { speaker: 'Kai-Jax', text: 'Forward, into the heart of the Void.', side: 'left' }
    ],
    objectives: ['Destroy the Rift Pylons', 'Breach the Citadel Gates'],
    difficulty: 8,
    arena: 'void_heart_citadel',
    storyBeat: 'Elite-level combat against the Void\'s last stand.',
    rewards: { xp: 800, currency: 600, loot: ['Citadel Key'] },
    gameplayType: 'combat',
    enemyWaves: [{ type: 'void-legion', count: 8 }, { type: 'void-elite', count: 6, delay: 5 }]
  },
  {
    id: 'story_act3_m12',
    actNumber: 3,
    missionNumber: 12,
    title: 'The General\'s Fall',
    description: 'The final General of the Void stands between you and the Emperor.',
    introCutscene: [
      { speaker: 'Rift General Prime', text: 'You are but a glitch in the grand design.', side: 'right', emotion: 'angry' },
      { speaker: 'Kai-Jax', text: 'I am the design.', side: 'left', emotion: 'determined' }
    ],
    outroCutscene: [
      { speaker: 'Kai-Jax', text: 'The path is clear. Voidonus, I am coming.', side: 'left' }
    ],
    objectives: ['Win within 120s', 'Use 3 Specials'],
    difficulty: 9,
    arena: 'void_heart_citadel',
    bossId: 'rift-general-prime',
    timeLimit: 120,
    storyBeat: 'Defeating the final guardian of the Rift Citadel.',
    rewards: { xp: 1200, currency: 1000, loot: ['General\'s Core'] },
    gameplayType: 'boss',
    enemyWaves: [{ type: 'void-legion', count: 5 }]
  },
  {
    id: 'story_act3_m13',
    actNumber: 3,
    missionNumber: 13,
    title: 'Ascension to the Ashen Expanse',
    description: 'A perilous climb to the heart of the Void Emperor\'s domain.',
    introCutscene: [
      { speaker: 'Kaison', text: 'The air is thick with pure dark matter. Keep your guard up!', side: 'right', emotion: 'determined' }
    ],
    outroCutscene: [
      { speaker: 'Jaxon', text: 'We\'re at the peak. There he is.', side: 'right' }
    ],
    objectives: ['Survive the Ashen Ascent', 'Defeat the God-Guard'],
    difficulty: 9,
    arena: 'void_heart_citadel',
    storyBeat: 'The calm before the storm. A grueling ascent testing all mechanics.',
    rewards: { xp: 900, currency: 800, loot: ['Ashen Relic'] },
    gameplayType: 'survival',
    enemyWaves: [{ type: 'void-god-guard', count: 6 }, { type: 'void-god-guard', count: 8, delay: 6 }]
  },
  {
    id: 'story_act3_m14',
    actNumber: 3,
    missionNumber: 14,
    title: 'Voidonus Imperion: Final Duel',
    description: 'The fate of all memories rests on this battle.',
    introCutscene: [
      { speaker: 'Voidonus', text: 'I am the end of all stories. Your memory will be the first to burn.', side: 'right', emotion: 'angry' },
      { speaker: 'Kai-Jax', text: 'A hero is never forgotten. And a memory is never truly gone!', side: 'left', emotion: 'determined' }
    ],
    outroCutscene: [
      { speaker: 'Kai-Jax', text: 'It is done. The Weave is silent... and safe.', side: 'left' }
    ],
    objectives: ['Defeat Voidonus Imperion', 'Win with >50% HP'],
    difficulty: 10,
    arena: 'void_heart_citadel',
    bossId: 'voidonus-imperion',
    storyBeat: 'GRAND FINALE: The Memory King vs The Void Emperor.',
    rewards: { xp: 2500, currency: 2500, loot: ['God-Tier Soul'] },
    gameplayType: 'boss',
    enemyWaves: [{ type: 'void-god-guard', count: 3 }]
  },
  {
    id: 'story_act3_m15',
    actNumber: 3,
    missionNumber: 15,
    title: 'Epilogue: Unity\'s Dawn',
    description: 'The dawn breaks. Reality is restored.',
    introCutscene: [
      { speaker: 'Narrator', text: 'The Void recedes. Light returns to the Bronx. The memories of millions are restored.', side: 'left' },
      { speaker: 'Kai-Jax', text: 'We did it, Jaxon. We did it, Kaison.', side: 'left', emotion: 'happy' }
    ],
    outroCutscene: [
      { speaker: 'Narrator', text: 'Legends of Kai-Jax. The saga of the Memory Warrior. End of Book I.', side: 'left' }
    ],
    objectives: ['Witness the restoration'],
    difficulty: 1,
    arena: 'void_heart_citadel',
    storyBeat: 'The aftermath of the Great War. A new era begins.',
    rewards: { xp: 1000, currency: 1000, loot: ['Saga Completion Ribbon'] },
    gameplayType: 'combat',
    enemyWaves: []
  }
];

export const ALL_STORY_MISSIONS: StoryMission[] = [
  ...ACT_I_STORY_MISSIONS,
  ...ACT_II_STORY_MISSIONS,
  ...ACT_III_STORY_MISSIONS,
];

export function getStoryMissionById(id: string): StoryMission | undefined {
  return ALL_STORY_MISSIONS.find((m) => m.id === id);
}

export function getStoryMissionsByAct(act: number): StoryMission[] {
  return ALL_STORY_MISSIONS.filter((m) => m.actNumber === act);
}

export function getStoryMissions(): StoryMission[] {
  return ALL_STORY_MISSIONS;
}

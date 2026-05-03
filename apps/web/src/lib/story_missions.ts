/**
 * LEGENDS OF KAI-JAX: THE MEMORY HERO
 * OFFICIAL STORY CAMPAIGN DATA (ACTS I, II, III)
 * 54 Cinematic Missions - Feral Action & Memory Magic
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

// ============ ACT I: CONVERGENCE (Missions 1-18) ============
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
    arena: 'cross_point_arena',
    requiredCharacters: ['kai-jax'],
    storyBeat: 'Kai-Jax awakens and realizes his purpose as the Memory Hero as the Rift starts to consume the arena.',
    rewards: { xp: 200, currency: 150, loot: ['Arena Badge'], unlocks: ['kaison'] },
    gameplayType: 'combat',
    enemyWaves: [{ type: 'grunt', count: 3 }]
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
    enemyWaves: [{ type: 'grunt', count: 5 }]
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
    objectives: ['Defeat 5 Void Grunts', 'Close the Rift'],
    difficulty: 3,
    arena: 'cross_point_arena',
    bossId: 'rift-warden',
    storyBeat: 'INCITING INCIDENT: The tournament is invaded. Reality is under attack.',
    rewards: { xp: 300, currency: 250, loot: ['Rift Fragment'], unlocks: ['jaxon'] },
    gameplayType: 'survival',
    enemyWaves: [{ type: 'void-grunt', count: 10 }]
  },
  {
    id: 'story_act1_m10',
    actNumber: 1,
    missionNumber: 10,
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
    arena: 'emerald_frontier',
    bossId: 'void-stalker',
    storyBeat: 'A recurring antagonist is introduced, testing Jaxon\'s speed.',
    rewards: { xp: 400, currency: 300, loot: ['Shadow Essence'] },
    gameplayType: 'chase',
    enemyWaves: [{ type: 'void-scout', count: 5 }]
  },
  {
    id: 'story_act1_m18',
    actNumber: 1,
    missionNumber: 18,
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
    arena: 'cross_point_arena',
    bossId: 'rift-general',
    storyBeat: 'ACT I FINALE: The heroes fail to close the rift. The world changes forever.',
    rewards: { xp: 600, currency: 500, loot: ['Veteran Seal'] },
    gameplayType: 'boss',
    enemyWaves: [{ type: 'void-legion', count: 12 }]
  },
  ...Array.from({ length: 13 }).map((_, i) => {
    const mNum = [4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 17][i];
    return {
      id: `story_act1_m${mNum}`,
      actNumber: 1 as const,
      missionNumber: mNum,
      title: `Memory Shard Sector ${mNum}`,
      description: 'The heroes fight to contain the Void spreading through the Ashblock district ruins.',
      introCutscene: [{ speaker: 'Kai-Jax', text: 'I can feel another shard nearby. We can\'t let the Void consume it.', side: 'left' }],
      outroCutscene: [{ speaker: 'Kai-Jax', text: 'One step closer to restoring the Weave.', side: 'left' }],
      objectives: ['Contain the Void outbreak'],
      difficulty: Math.min(5, Math.floor(mNum / 3) + 1) as any,
      arena: 'emerald_frontier',
      storyBeat: 'The struggle continues as the Void infects the environment and consumes memory nodes.',
      rewards: { xp: 300, currency: 200, loot: [] },
      gameplayType: 'combat' as const,
      enemyWaves: [{ type: 'void-grunt', count: 6 }]
    };
  })
].sort((a, b) => a.missionNumber - b.missionNumber);

// ============ ACT II: FRACTURED LIGHT (Missions 19-36) ============
export const ACT_II_STORY_MISSIONS: StoryMission[] = [
  {
    id: 'story_act2_m5',
    actNumber: 2,
    missionNumber: 23,
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
    arena: 'memory_nexus',
    requiredCharacters: ['kaison', 'jaxon'],
    unlockableCharacters: ['kai-jax'],
    storyBeat: 'MIDPOINT: Kai-Jax is born through the first 100% synergy fusion.',
    rewards: { xp: 800, currency: 600, loot: ['Synergy Core'] },
    gameplayType: 'boss',
    enemyWaves: [{ type: 'synergy-hunter', count: 1 }]
  },
  {
    id: 'story_act2_m10',
    actNumber: 2,
    missionNumber: 28,
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
    arena: 'void_tower',
    storyBeat: 'Psychological warfare from the Void, testing the hero\'s resolve.',
    rewards: { xp: 500, currency: 400, loot: ['Spectral Shard'] },
    gameplayType: 'survival',
    enemyWaves: [{ type: 'void-wraith', count: 8 }]
  },
  {
    id: 'story_act2_m18',
    actNumber: 2,
    missionNumber: 36,
    title: 'Siege of the Memory Well',
    description: 'The final defense of the last memory archive. Everything is on the line.',
    introCutscene: [
      { speaker: 'Silver', text: 'The well is leaking! If we lose this, we lose our history!', side: 'right', emotion: 'angry' },
      { speaker: 'Kai-Jax', text: 'Then we won\'t lose.', side: 'left', emotion: 'determined' }
    ],
    outroCutscene: [
      { speaker: 'Narrator', text: 'The well is stabilized, but at a great cost. The path to the Rift Citadel is open.', side: 'left' }
    ],
    objectives: ['Defeat 3 waves of Elite Void', 'Repair the Core'],
    difficulty: 7,
    arena: 'skyforge_plateau',
    bossId: 'well-defiler',
    storyBeat: 'ACT II FINALE: A major tactical victory, setting the stage for the counter-attack.',
    rewards: { xp: 900, currency: 800, loot: ['Ancient Archive'] },
    gameplayType: 'boss',
    enemyWaves: [{ type: 'void-elite', count: 15 }]
  },
  ...Array.from({ length: 15 }).map((_, i) => {
    const mNum = [19, 20, 21, 22, 24, 25, 26, 27, 29, 30, 31, 32, 33, 34, 35][i];
    return {
      id: `story_act2_m${i + 1}`, // Keeping internal ID sequential for the loop
      actNumber: 2 as const,
      missionNumber: mNum,
      title: `Act II Mission ${mNum}`,
      description: 'The resistance pushes back against the Void occupation.',
      introCutscene: [{ speaker: 'Silver', text: 'The timeline is shifting. We must act now.', side: 'right' }],
      outroCutscene: [{ speaker: 'Silver', text: 'Well fought. The echo remains.', side: 'right' }],
      objectives: ['Secure the sector'],
      difficulty: 6,
      arena: 'void_tower',
      storyBeat: 'Systematic reclamation of stolen memory nodes.',
      rewards: { xp: 500, currency: 400, loot: [] },
      gameplayType: 'combat' as const,
      enemyWaves: [{ type: 'void-elite', count: 4 }]
    };
  })
].sort((a, b) => a.missionNumber - b.missionNumber);

// ============ ACT III: UNITY'S DAWN (Missions 37-54) ============
export const ACT_III_STORY_MISSIONS: StoryMission[] = [
  {
    id: 'story_act3_m9',
    actNumber: 3,
    missionNumber: 45,
    title: 'The General\'s Fall',
    description: 'The final General of the Void stands between you and the Emperor.',
    introCutscene: [
      { speaker: 'Rift General', text: 'You are but a glitch in the grand design.', side: 'right', emotion: 'angry' },
      { speaker: 'Kai-Jax', text: 'I am the design.', side: 'left', emotion: 'determined' }
    ],
    outroCutscene: [
      { speaker: 'Kai-Jax', text: 'The path is clear. Voidonus, I am coming.', side: 'left' }
    ],
    objectives: ['Win within 120s', 'Use 3 Specials'],
    difficulty: 9,
    arena: 'rift_citadel',
    bossId: 'rift-general-prime',
    timeLimit: 120,
    storyBeat: 'Defeating the final guardian of the Rift Citadel.',
    rewards: { xp: 1200, currency: 1000, loot: ['General\'s Core'] },
    gameplayType: 'boss',
    enemyWaves: [{ type: 'void-legion', count: 5 }]
  },
  {
    id: 'story_act3_m17',
    actNumber: 3,
    missionNumber: 53,
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
    arena: 'ashen_expanse',
    bossId: 'voidonus-imperion',
    storyBeat: 'GRAND FINALE: The Memory King vs The Void Emperor.',
    rewards: { xp: 2000, currency: 2000, loot: ['God-Tier Soul'] },
    gameplayType: 'boss',
    enemyWaves: [{ type: 'void-god-guard', count: 3 }]
  },
  {
    id: 'story_act3_m18',
    actNumber: 3,
    missionNumber: 54,
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
    arena: 'nexus_haven',
    storyBeat: 'The aftermath of the Great War. A new era begins.',
    rewards: { xp: 500, currency: 500, loot: ['Saga Completion Ribbon'] },
    gameplayType: 'combat',
    enemyWaves: []
  },
  ...Array.from({ length: 15 }).map((_, i) => {
    const mNum = [37, 38, 39, 40, 41, 42, 43, 44, 46, 47, 48, 49, 50, 51, 52][i];
    return {
      id: `story_act3_m${i + 1}`,
      actNumber: 3 as const,
      missionNumber: mNum,
      title: `Act III Mission ${mNum}`,
      description: 'The final push through the Rift Citadel.',
      introCutscene: [{ speaker: 'Kai-Jax', text: 'No turning back now.', side: 'left', emotion: 'determined' }],
      outroCutscene: [{ speaker: 'Kai-Jax', text: 'Forward, into the heart of the Void.', side: 'left' }],
      objectives: ['Destroy the Rift Pylons'],
      difficulty: 9,
      arena: 'rift_citadel',
      storyBeat: 'Elite-level combat against the Void\'s last stand.',
      rewards: { xp: 800, currency: 600, loot: [] },
      gameplayType: 'combat' as const,
      enemyWaves: [{ type: 'void-legion', count: 8 }]
    };
  })
].sort((a, b) => a.missionNumber - b.missionNumber);

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

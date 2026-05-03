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
<<<<<<< Updated upstream
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
=======
    name: 'First Kai-Jax Echo',
    description: 'A memory echo appears. Three tails. Gold, blue, white. Kai-Jax exists in the future—and the past.',
    cinematicIntro: 'The Weave shimmers. An echo forms. Three tails materialize. Gold, blue, white. The Memory King appears—briefly.',
    objectives: ['Witness the echo', 'Learn from the future', 'Prepare for fusion'],
    difficulty: 6,
    arena: 'memory_nexus',
    bossName: 'Echo Guardian',
    bossPhases: 1,
    storyBeat: 'MIDPOINT: Kai-Jax echo appears. The future is written. Heroes must make it happen.',
    rewards: { xp: 500, currency: 450, loot: ['Echo Fragment'], unlocks: ['kai-jax'] },
    gameplayType: 'boss',
  },
  {
    id: 'story_act1_m11',
    actNumber: 1,
    missionNumber: 11,
    name: 'The Void Bloom',
    description: 'A massive Rift opens in the park. Void flowers drain the color from the world. Stop the decay.',
    objectives: ['Destroy 5 Void Blooms', 'Defeat the corrupted park ranger', 'Restore the color'],
    difficulty: 4,
    arena: 'green-valley',
    storyBeat: 'The invasion turns environmental. The world literal loses its saturation as the Void feeds.',
    rewards: { xp: 400, currency: 350, loot: ['Chroma Seed'] },
    gameplayType: 'platforming',
  },
  {
    id: 'story_act1_m12',
    actNumber: 1,
    missionNumber: 12,
    name: 'Glitch Syndicate Infiltration',
    description: 'A local gang has started using Void tech. Infiltrate their hideout and find out who supplied them.',
    objectives: ['Sneak past the guards', 'Hack the mainframe', 'Defeat Syndicate Leader Vex'],
    difficulty: 5,
    arena: 'bronx_streets',
    bossName: 'Syndicate Vex',
    storyBeat: 'Human-Beast gangs are being manipulated by the Void. The conspiracy deepens.',
    rewards: { xp: 450, currency: 400, loot: ['Encrypted Data-Pad'] },
    gameplayType: 'stealth',
  },
  {
    id: 'story_act1_m13',
    actNumber: 1,
    missionNumber: 13,
    name: 'Momentum Mastery',
    description: 'The Void Runner returns. Jaxon must prove his speed on the high-altitude momentum rails.',
    objectives: ['Win the race', 'Avoid the electrified barriers', 'Perform a 20-hit combo on the move'],
    difficulty: 5,
    arena: 'emerald_frontier',
    requiredCharacters: ['jaxon'],
    storyBeat: 'Jaxon learns that speed isn\'t just about moving fast—it\'s about moving with purpose.',
    rewards: { xp: 400, currency: 400, loot: ['Kinetic Glove'] },
    gameplayType: 'chase',
  },
  {
    id: 'story_act1_m14',
    actNumber: 1,
    missionNumber: 14,
    name: 'The Whispering Shadows',
    description: 'Shadowy figures appear in the alleyways. They don\'t attack—they haunt. Kaison must solve the riddle.',
    objectives: ['Collect 3 Memory Whispers', 'survive the shadow ambush', 'Uncover the mentor\'s secret'],
    difficulty: 6,
    arena: 'bronx_streets',
    requiredCharacters: ['kaison'],
    storyBeat: 'Kaison confronts a memory of his mentor. Is the Void using his grief against him?',
    rewards: { xp: 500, currency: 450, loot: ['Mentor\'s Scarf'] },
    gameplayType: 'combat',
  },
  {
    id: 'story_act1_m15',
    actNumber: 1,
    missionNumber: 15,
    name: 'Lava Fortress Siege',
    description: 'The first major stronghold of the Void. A hot-headed challenge. Heroes must stay cool.',
    objectives: ['Cross the lava bridges', 'Disable the thermal pumps', 'Defeat Magma Crawler'],
    difficulty: 6,
    arena: 'lava-fortress',
    bossName: 'Magma Crawler',
    storyBeat: 'The heroes assault their first Void base. They find evidence of an Emperor behind the Rift.',
    rewards: { xp: 600, currency: 500, loot: ['Fireproof Hide'] },
    gameplayType: 'combat',
  },
  {
    id: 'story_act1_m16',
    actNumber: 1,
    missionNumber: 16,
    name: 'Lunara\'s Song',
    description: 'The void silence is deafening. Lunara must sing the Song of Harmony to stabilize the district.',
    objectives: ['Defend Lunara for 3 minutes', 'Maintain the Harmony Meter', 'Repel the Void Wraiths'],
    difficulty: 5,
    arena: 'memory_nexus',
    requiredCharacters: ['lunara'],
    storyBeat: 'Lunara\'s importance as the team\'s anchor is solidified. Without her, the heroes would lose themselves.',
    rewards: { xp: 550, currency: 500, loot: ['Resonance Stone'] },
    gameplayType: 'survival',
  },
  {
    id: 'story_act1_m17',
    actNumber: 1,
    missionNumber: 17,
    name: 'The Glitch Storm',
    description: 'Reality is literally breaking. Geometry is shifting. Reach the eye of the storm.',
    objectives: ['Survive the shifting terrain', 'Avoid the glitch spikes', 'Reach the stability pylon'],
    difficulty: 7,
    arena: 'space-station',
    storyBeat: 'The world is becoming unrecognizable. The heroes are running out of time.',
    rewards: { xp: 650, currency: 600, loot: ['Stability Core'] },
    gameplayType: 'platforming',
  },
  {
    id: 'story_act1_m18',
    actNumber: 1,
    missionNumber: 18,
    name: 'Duel of the Century',
    description: 'The Void Tournament Final. Radiant Jumper vs the Void Champion. The world is watching.',
    objectives: ['Win the match', 'Finish with an Ultimate', 'Save the Cross Point Arena'],
    difficulty: 8,
    arena: 'cross_point_arena',
    bossName: 'Void Champion Zerox',
    storyBeat: 'The tournament ends in chaos. Book 1 Climax. The heroes realize the tournament was a trap to harvest their synergy.',
    rewards: { xp: 1000, currency: 1000, loot: ['Grand Final Medal'] },
    gameplayType: 'boss',
  },
];

// ============ ACT II: FRACTURED LIGHT (Missions 19-36) ============
export const ACT_II_STORY_MISSIONS: StoryMission[] = [
  {
    id: 'story_act2_m1',
    actNumber: 2,
    missionNumber: 19,
    name: 'Six Months Later: Scattered',
    description: 'The heroes are scattered. Hunted. Desperate. The Void has won ground. Hope is fading.',
    cinematicIntro: 'Six months pass. The heroes are on the run. Safe zones shrink. The Void spreads. But they fight on.',
    objectives: ['Survive the ambush', 'Regroup with allies', 'Find a safe zone'],
    difficulty: 5,
    arena: 'bronx_streets',
    storyBeat: 'Time jump. Heroes are scattered. The war has escalated. Unity is harder than ever.',
    rewards: { xp: 400, currency: 350, loot: ['Survivor Badge'] },
    gameplayType: 'survival',
  },
  {
    id: 'story_act2_m2',
    actNumber: 2,
    missionNumber: 20,
    name: 'The Last Stand Defense',
    description: 'One final stronghold. Heroes make their stand. Batman-style tactical defense meets Marvel team-up.',
    cinematicIntro: 'The last safe zone. Void forces mass. Heroes prepare. This is it—win or lose everything.',
    objectives: ['Defend for 5 minutes', 'Protect the stronghold', 'Hold the line'],
    difficulty: 7,
    arena: 'nexus_haven',
    storyBeat: 'ROCK BOTTOM: Last stand. Heroes pushed to the limit. Desperation breeds innovation.',
    rewards: { xp: 600, currency: 500, loot: ['Last Stand Medal'] },
    gameplayType: 'survival',
  },
  {
    id: 'story_act2_m3',
    actNumber: 2,
    missionNumber: 21,
    name: 'Cobalt Blur: Speed Legend',
    description: 'Cobalt Blur arrives. The speed legend. He trains Kaison and Jaxon. Speed becomes art.',
    cinematicIntro: 'A blur. Cobalt Blur appears. He\'s seen it all. Now he teaches the next generation.',
    objectives: ['Learn Chaos Control', 'Master speed techniques', 'Prove your worth'],
>>>>>>> Stashed changes
    difficulty: 4,
    arena: 'emerald_frontier',
    bossId: 'void-stalker',
    storyBeat: 'A recurring antagonist is introduced, testing Jaxon\'s speed.',
    rewards: { xp: 400, currency: 300, loot: ['Shadow Essence'] },
    gameplayType: 'chase',
    enemyWaves: [{ type: 'void-scout', count: 5 }]
  },
  {
<<<<<<< Updated upstream
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
=======
    id: 'story_act2_m4',
    actNumber: 2,
    missionNumber: 22,
    name: 'The Skyforge Climb',
    description: 'Vertical challenge. Climbable towers. Storm clouds. Ninja Turtles-style platforming meets Batman traversal.',
    cinematicIntro: 'The Skyforge rises. Towers pierce storm clouds. Heroes must climb. The Void waits above.',
    objectives: ['Climb to the summit', 'Avoid storm strikes', 'Reach the peak'],
    difficulty: 6,
    arena: 'skyforge_plateau',
    storyBeat: 'Vertical challenge. Heroes prove their determination. The climb is the test.',
    rewards: { xp: 500, currency: 450, loot: ['Skyforge Crest'] },
    gameplayType: 'platforming',
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
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
=======
    name: 'The First Fusion: Kai-Jax Born',
    description: 'Kaison and Jaxon fuse. Three tails emerge. Gold, blue, white. Kai‑Jax is born. The Memory King awakens.',
    cinematicIntro: 'They stand together. Synergy meter fills. 100%. The fusion begins. Three tails emerge. Kai-Jax is born.',
    objectives: ['Achieve 100% synergy', 'Fuse into Kai-Jax', 'Master the three tails'],
    difficulty: 8,
>>>>>>> Stashed changes
    arena: 'memory_nexus',
    requiredCharacters: ['kaison', 'jaxon'],
    unlockableCharacters: ['kai-jax'],
    storyBeat: 'MIDPOINT: Kai-Jax is born through the first 100% synergy fusion.',
    rewards: { xp: 800, currency: 600, loot: ['Synergy Core'] },
    gameplayType: 'boss',
<<<<<<< Updated upstream
    enemyWaves: [{ type: 'synergy-hunter', count: 1 }]
=======
  },
  {
    id: 'story_act2_m6',
    actNumber: 2,
    missionNumber: 24,
    name: 'Kai-Jax: Memory Echo Dive',
    description: 'Kai-Jax dives into memories. Past battles replay. He learns from fallen heroes. Memory is power.',
    cinematicIntro: 'Kai-Jax closes his eyes. The Weave opens. Memories flood in. Past battles. Fallen heroes. He learns.',
    objectives: ['Dive into 3 memories', 'Learn from echoes', 'Master Memory Dive'],
    difficulty: 5,
    arena: 'memory_nexus',
    requiredCharacters: ['kai-jax'],
    storyBeat: 'Kai-Jax masters memory magic. He can relive the past. Learn from the fallen.',
    rewards: { xp: 550, currency: 500, loot: ['Memory Shard'] },
    gameplayType: 'combat',
  },
  {
    id: 'story_act2_m7',
    actNumber: 2,
    missionNumber: 25,
    name: 'Prison Break: Free the Captured',
    description: 'Void prison. Heroes captured. Stealth mission. Batman-style infiltration meets Ninja Turtles teamwork.',
    cinematicIntro: 'The Void prison looms. Heroes are inside. Time for a rescue. Stealth and teamwork required.',
    objectives: ['Infiltrate the prison', 'Free 5 captured heroes', 'Escape without detection'],
    difficulty: 6,
    arena: 'rift_citadel',
    storyBeat: 'Prison break. Heroes rescue allies. The team grows. Unity strengthens.',
    rewards: { xp: 600, currency: 550, loot: ['Liberator Badge'] },
    gameplayType: 'stealth',
  },
  {
    id: 'story_act2_m8',
    actNumber: 2,
    missionNumber: 26,
    name: 'The Rift Generals: Void Tower Warden',
    description: 'First Rift General. Shield-based fortress. Tactical battle. Marvel Ultimate Alliance boss fight.',
    cinematicIntro: 'The Void Tower rises. The Warden guards it. Shield-based defense. Heroes must break through.',
    objectives: ['Break the shield', 'Defeat the Warden', 'Claim the tower'],
    difficulty: 7,
    arena: 'void_tower',
    bossName: 'Void Tower Warden',
    bossPhases: 3,
    storyBeat: 'First Rift General falls. Progress. The Void weakens. Hope returns.',
    rewards: { xp: 700, currency: 600, loot: ['Warden\'s Shield'] },
    gameplayType: 'boss',
  },
  {
    id: 'story_act2_m9',
    actNumber: 2,
    missionNumber: 27,
    name: 'Team Unified: The Triad Forms',
    description: 'Silver, Lunara, and Kai-Jax unite. The Triad forms. Harmony, Time, and Memory combine.',
    cinematicIntro: 'Three stand together. Silver (Time). Lunara (Harmony). Kai-Jax (Memory). The Triad forms.',
    objectives: ['Form the Triad', 'Use combined powers', 'Stabilize a Rift'],
    difficulty: 6,
    arena: 'memory_nexus',
    requiredCharacters: ['silver', 'lunara', 'kai-jax'],
    storyBeat: 'The Triad forms. Three powers unite. Reality stabilizes. The team is complete.',
    rewards: { xp: 650, currency: 600, loot: ['Triad Crest'] },
    gameplayType: 'team',
>>>>>>> Stashed changes
  },
  {
    id: 'story_act2_m10',
    actNumber: 2,
    missionNumber: 28,
<<<<<<< Updated upstream
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
=======
    name: 'District Zero Reconstruction',
    description: 'Rebuild the memory nexus. The blueprint of the old world is the only way to save the new one.',
    objectives: ['Collect 5 Blueprint Shards', 'Protect the reconstruction drone', 'Defeat the Glitch Scavengers'],
    difficulty: 6,
    arena: 'memory_nexus',
    storyBeat: 'The heroes begin to rebuild. Memory is literally used to restore the broken city geometry.',
    rewards: { xp: 500, currency: 450, loot: ['City Blueprint'] },
    gameplayType: 'team',
  },
  {
    id: 'story_act2_m11',
    actNumber: 2,
    missionNumber: 29,
    name: 'The Neon Shadows',
    description: 'A chase through the neon-soaked lower districts. Speed Kin vs Void Cycle-Riders.',
    objectives: ['Don\'t drop below 200mph', 'Takedown 10 riders', 'Escape the EMP pulse'],
    difficulty: 7,
    arena: 'emerald_frontier',
    storyBeat: 'The heroes use the city\'s neon grid to hyper-charge their speed. Jaxon feels at home.',
    rewards: { xp: 550, currency: 500, loot: ['Neon Spark'] },
    gameplayType: 'chase',
  },
  {
    id: 'story_act2_m12',
    actNumber: 2,
    missionNumber: 30,
    name: 'Shadow of the Mentor',
    description: 'The Void creates a perfect clone of Kaison\'s mentor. Can Kaison fight his own hope?',
    objectives: ['Win the psychological duel', 'Break the mental loop', 'Defeat Echo-Mentor'],
    difficulty: 8,
    arena: 'memory_nexus',
    requiredCharacters: ['kaison'],
    storyBeat: 'Kaison finally lets go of the past. He realize he isn\'t just a student anymore—he is a legend.',
    rewards: { xp: 800, currency: 600, loot: ['Shattered Legacy'] },
    gameplayType: 'boss',
  },
  {
    id: 'story_act2_m13',
    actNumber: 2,
    missionNumber: 31,
    name: 'Rift Mining Colony',
    description: 'The Void is mining the planet\'s core for Memory Ore. Shut it down.',
    objectives: ['Sabotage 3 drills', 'Evacuate the miners', 'Defeat the Mining Overseer'],
    difficulty: 7,
    arena: 'lava-fortress',
    storyBeat: 'The Void\'s plan is revealed: they aren\'t just invading, they are harvesting the planet\'s history.',
    rewards: { xp: 600, currency: 550, loot: ['Memory Ore'] },
    gameplayType: 'combat',
  },
  {
    id: 'story_act2_m14',
    actNumber: 2,
    missionNumber: 32,
    name: 'Hyper-Speed Tunnel',
    description: 'The Tunnel between districts is a gauntlet. Chaos Control is the only way through.',
    objectives: ['Survive the tunnel warp', 'Use Chaos Control 5 times', 'Reach the other side'],
    difficulty: 8,
    arena: 'space-station',
    requiredCharacters: ['cobalt-blur'],
    storyBeat: 'The heroes learn to travel between dimensions using their own speed.',
    rewards: { xp: 700, currency: 650, loot: ['Warp Drive'] },
    gameplayType: 'platforming',
  },
  {
    id: 'story_act2_m15',
    actNumber: 2,
    missionNumber: 33,
    name: 'The Council of Beasts',
    description: 'The ancient beast leaders aren\'t sure about Kai-Jax. Prove your worth in the trial of the elders.',
    objectives: ['Defeat the Elder Spirits', 'Show wisdom in combat', 'Earn the Legend title'],
    difficulty: 9,
    arena: 'jungle_temple',
    storyBeat: 'Kai-Jax is officially recognized as the Memory King by the ancients.',
    rewards: { xp: 900, currency: 800, loot: ['Elder\'s Amulet'] },
    gameplayType: 'boss',
  },
  {
    id: 'story_act2_m16',
    actNumber: 2,
    missionNumber: 34,
    name: 'The Great Glitch Storm: Peak',
    description: 'The storm has reached its peak. The Citadel is visible. One final climb.',
    objectives: ['Scale the vertical rift', 'Avoid falling debris', 'Open the Citadel Gate'],
    difficulty: 8,
    arena: 'skyforge_plateau',
    storyBeat: 'The Final Goal is in sight. The march on the Emperor begins.',
    rewards: { xp: 750, currency: 700, loot: ['Storm Breaker'] },
    gameplayType: 'platforming',
  },
  {
    id: 'story_act2_m17',
    actNumber: 2,
    missionNumber: 35,
    name: 'Malakor\'s Betrayal',
    description: 'Malakor was supposed to be an ally. He wants the Memory Ore for himself.',
    objectives: ['Defeat Malakor', 'Protect the ore reserves', 'Learn Malakor\'s true motive'],
    difficulty: 9,
    arena: 'lava-fortress',
    bossName: 'Malakor the Greedy',
    storyBeat: 'Sub-Plot Climax. A trusted ally falls to greed, showing that the Void corrupts not just space, but hearts.',
    rewards: { xp: 1000, currency: 900, loot: ['Betrayer\'s Fang'] },
    gameplayType: 'boss',
  },
  {
    id: 'story_act2_m18',
    actNumber: 2,
    missionNumber: 36,
    name: 'Unity\'s Dawn: The Gathering',
    description: 'The team gather at the foot of the Rift Citadel. Every hero we saved is here.',
    objectives: ['Recruit the 5 saved factions', 'Plan the final assault', 'Prepare for the Emperor'],
    difficulty: 7,
    arena: 'nexus_haven',
    storyBeat: 'ACT II FINALE. The army is ready. The legend of Kai-Jax has inspired the world. We go to war.',
    rewards: { xp: 1200, currency: 1000, loot: ['Unity War Banner'] },
    gameplayType: 'team',
  },
];

// ============ ACT III: UNITY'S DAWN (Missions 37-54) ============
export const ACT_III_STORY_MISSIONS: StoryMission[] = [
  {
    id: 'story_act3_m1',
    actNumber: 3,
    missionNumber: 37,
    name: 'The Rift Citadel Siege',
    description: 'The mobile fortress. Multi-stage siege. Marvel Ultimate Alliance scale. Heroes assault the Citadel.',
    cinematicIntro: 'The Rift Citadel looms. Mobile fortress. Multi-stage siege. Heroes charge. The final battle begins.',
    objectives: ['Breach the outer wall', 'Fight through 3 stages', 'Reach the inner sanctum'],
    difficulty: 8,
    arena: 'rift_citadel',
    storyBeat: 'The siege begins. Heroes assault the Citadel. Stage by stage, they advance.',
    rewards: { xp: 800, currency: 750, loot: ['Siege Badge'] },
    gameplayType: 'team',
  },
  {
    id: 'story_act3_m2',
    actNumber: 3,
    missionNumber: 38,
    name: 'Rift Harvester: Archipelago Terror',
    description: 'Second Rift General. Life-draining archipelago. Zootopia-style environment. Epic boss battle.',
    cinematicIntro: 'The archipelago. The Harvester drains life. Heroes must fight on water, land, and air.',
    objectives: ['Survive the life drain', 'Defeat the Harvester', 'Restore the archipelago'],
    difficulty: 8,
    arena: 'archipelago',
    bossName: 'Rift Harvester',
    bossPhases: 4,
    storyBeat: 'Second Rift General falls. The archipelago is saved. Heroes advance.',
    rewards: { xp: 850, currency: 800, loot: ['Harvester\'s Core'] },
    gameplayType: 'boss',
  },
  {
    id: 'story_act3_m3',
    actNumber: 3,
    missionNumber: 39,
    name: 'Prophesied Devourer: Jungle Terror',
    description: 'Third Rift General. Jungle tribe terror. Shell armor. Ninja Turtles meets Zootopia aesthetic.',
    cinematicIntro: 'The jungle. The Devourer terrorizes tribes. Shell armor protects. Heroes must break through.',
    objectives: ['Break the shell armor', 'Defeat the Devourer', 'Save the tribes'],
    difficulty: 7,
    arena: 'jungle_temple',
    bossName: 'Prophesied Devourer',
    bossPhases: 3,
    storyBeat: 'Third Rift General falls. Tribes are saved. The jungle is free.',
    rewards: { xp: 800, currency: 750, loot: ['Devourer\'s Shell'] },
    gameplayType: 'boss',
  },
  {
    id: 'story_act3_m4',
    actNumber: 3,
    missionNumber: 40,
    name: 'Silence Avatar: Tournament Saboteur',
    description: 'Fourth Rift General. Tournament saboteur. Memory-corrupted. The arena becomes a trap.',
    cinematicIntro: 'The arena. The Silence Avatar corrupts memories. Heroes must fight their own echoes.',
    objectives: ['Defeat memory echoes', 'Break the corruption', 'Defeat the Avatar'],
    difficulty: 8,
    arena: 'cross_point_arena',
    bossName: 'Silence Avatar',
    bossPhases: 3,
    storyBeat: 'Fourth Rift General falls. Memory corruption ends. The arena is cleansed.',
    rewards: { xp: 850, currency: 800, loot: ['Avatar\'s Mask'] },
    gameplayType: 'boss',
  },
  {
    id: 'story_act3_m5',
    actNumber: 3,
    missionNumber: 41,
    name: 'Dark Seraphim: Corrupted Guardian',
    description: 'Fifth Rift General. Memory-corrupted guardian. Once a protector, now a destroyer. Tragic battle.',
    cinematicIntro: 'The Dark Seraphim. Once a guardian. Memory-corrupted. Heroes must free him—or defeat him.',
    objectives: ['Free the guardian', 'Break the corruption', 'Restore the Seraphim'],
    difficulty: 9,
    arena: 'divine_realm',
    bossName: 'Dark Seraphim',
    bossPhases: 4,
    storyBeat: 'Fifth Rift General falls. The guardian is freed. Tragedy becomes hope.',
    rewards: { xp: 900, currency: 850, loot: ['Seraphim\'s Wing'] },
    gameplayType: 'boss',
  },
  {
    id: 'story_act3_m6',
    actNumber: 3,
    missionNumber: 42,
    name: 'The All High: Divine Trials',
    description: 'The Cosmic Judge. Five divine trials. Speed, magic, legend, unity, sacrifice. Prove worthiness.',
    cinematicIntro: 'The All High appears. Cosmic judge. Five trials await. Speed. Magic. Legend. Unity. Sacrifice.',
    objectives: ['Complete Trial 1: Speed', 'Complete Trial 2: Magic', 'Complete Trial 3: Legend', 'Complete Trial 4: Unity', 'Complete Trial 5: Sacrifice'],
    difficulty: 9,
    arena: 'divine_realm',
    bossName: 'The All High',
    bossPhases: 5,
    storyBeat: 'Divine trials. Heroes prove worthiness. The All High acknowledges their value.',
    rewards: { xp: 1000, currency: 1000, loot: ['Divine Acknowledgment'] },
    gameplayType: 'boss',
  },
  {
    id: 'story_act3_m7',
    actNumber: 3,
    missionNumber: 43,
    name: 'Void Horizon Raid',
    description: 'Assault the edge of the universe. The Void is consuming the stars.',
    objectives: ['Destroy 10 Void Pylons', 'Win the space duel', 'Close the Mega-Rift'],
    difficulty: 9,
    arena: 'space-station',
    storyBeat: 'The war reaches the cosmos. The heroes fight to save the very stars themselves.',
    rewards: { xp: 1200, currency: 1000, loot: ['Starlight Fragment'] },
    gameplayType: 'combat',
  },
  {
    id: 'story_act3_m8',
    actNumber: 3,
    missionNumber: 44,
    name: 'The Memory King\'s Ascent',
    description: 'Kai-Jax must climb the Memory Spire to reclaim the planet\'s history.',
    objectives: ['Climb the shifting Spire', 'Defeat the Spire Guardians', 'Unlock the History Core'],
    difficulty: 8,
    arena: 'memory_nexus',
    requiredCharacters: ['kai-jax'],
    storyBeat: 'Kai-Jax finally understands his true power: he doesn\'t just remember history, he can re-write it.',
    rewards: { xp: 1100, currency: 1000, loot: ['History Key'] },
    gameplayType: 'platforming',
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
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
=======
    name: 'Echoes of the Void',
    description: 'The Emperor sends his most powerful clones. They are the heroes\' own dark reflections.',
    objectives: ['Defeat Dark Kai-Jax', 'Defeat Dark Cobalt Blur', 'Win the mirror match'],
    difficulty: 10,
    arena: 'ashen_expanse',
    storyBeat: 'The final test of ego. To defeat the Void, the heroes must first defeat the worst parts of themselves.',
    rewards: { xp: 1500, currency: 1200, loot: ['Reflective Plate'] },
    gameplayType: 'boss',
>>>>>>> Stashed changes
  },
  {
    id: 'story_act3_m17',
    actNumber: 3,
<<<<<<< Updated upstream
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
=======
    missionNumber: 46,
    name: 'The Last Stand: World Heart',
    description: 'The Void Emperor has reached the world heart. Stop him before he deletes everything.',
    objectives: ['Defend the heart for 5 minutes', 'Repel 100 enemies', 'Don\'t let health drop below 50%'],
    difficulty: 9,
    arena: 'nexus_haven',
    storyBeat: 'The final defensive battle. All factions unite for one last, desperate stand.',
    rewards: { xp: 1300, currency: 1100, loot: ['World Heart Fragment'] },
    gameplayType: 'survival',
  },
  {
    id: 'story_act3_m11',
    actNumber: 3,
    missionNumber: 47,
    name: 'Lava Fortress: Core Melt',
    description: 'The lava fortress is exploding. Escape before the planet breaks.',
    objectives: ['Escape the fortress', 'Rescue 5 trapped workers', 'Avoid the magma floods'],
    difficulty: 8,
    arena: 'lava-fortress',
    storyBeat: 'The world is literally falling apart. The stakes couldn\'t be higher.',
    rewards: { xp: 900, currency: 800, loot: ['Magma Shard'] },
    gameplayType: 'platforming',
  },
  {
    id: 'story_act3_m12',
    actNumber: 3,
    missionNumber: 48,
    name: 'The Rainbow Bridge Charge',
    description: 'Charging across the Rainbow Bridge to reach the Divine Realm.',
    objectives: ['Takedown 20 Void Knights', 'Keep the combo above 10', 'Reach the Gate'],
    difficulty: 8,
    arena: 'rainbow-castle',
    storyBeat: 'A glorious charge. The music swells as the heroes ride toward their destiny.',
    rewards: { xp: 1000, currency: 900, loot: ['Rainbow Scale'] },
    gameplayType: 'chase',
  },
  {
    id: 'story_act3_m13',
    actNumber: 3,
    missionNumber: 49,
    name: 'Divine Trial: Unity',
    description: 'One final trial from the All High. The team must act as one.',
    objectives: ['Win without anyone falling', 'Use 3 Team Ultimates', 'Defeat the Divine Mirror'],
    difficulty: 9,
    arena: 'divine_realm',
    storyBeat: 'The All High is impressed. The heroes have proven that unity is the ultimate power.',
    rewards: { xp: 1200, currency: 1100, loot: ['Mark of Unity'] },
    gameplayType: 'team',
  },
  {
    id: 'story_act3_m14',
    actNumber: 3,
    missionNumber: 50,
    name: 'The Void Spire: Infiltration',
    description: 'We are inside. The Emperor is at the top.',
    objectives: ['Sneak past the guards', 'Disable the security network', 'Reach the Throne Room'],
    difficulty: 8,
    arena: 'void_tower',
    storyBeat: 'The final stealth mission. The tension is at its peak. No turning back.',
    rewards: { xp: 1000, currency: 900, loot: ['Stealth Boots'] },
    gameplayType: 'stealth',
  },
  {
    id: 'story_act3_m15',
    actNumber: 3,
    missionNumber: 51,
    name: 'Voidonus Imperion: Phase 1',
    description: 'The battle begins. Avatars and the Silence Network.',
    objectives: ['Defeat the 4 Avatars', 'Break the Silence Network', 'Survive the throne pulse'],
    difficulty: 10,
    arena: 'ashen_expanse',
    bossName: 'Voidonus Imperion',
    storyBeat: 'The final battle begins. The Emperor\'s power is overwhelming.',
    rewards: { xp: 1500, currency: 1500, loot: ['Emperor\'s Shard'] },
    gameplayType: 'boss',
  },
  {
    id: 'story_act3_m16',
    actNumber: 3,
    missionNumber: 52,
    name: 'Voidonus Imperion: The Throne Assault',
    description: 'assaulting the throne. Reality is flickering.',
    objectives: ['Break the Emperor\'s shield', 'Survive the reality shifts', 'Reach Phase 3'],
    difficulty: 10,
    arena: 'ashen_expanse',
    bossName: 'Voidonus Imperion',
    storyBeat: 'The Emperor is desperate. He begins deleting random parts of the arena geometry.',
    rewards: { xp: 2000, currency: 2000, loot: ['Throne Fragment'] },
    gameplayType: 'boss',
  },
  {
    id: 'story_act3_m17',
    actNumber: 3,
    missionNumber: 53,
    name: 'Voidonus Imperion: Oblivion Core',
    description: 'The final core. The end of everything—or a new beginning.',
    objectives: ['Destroy the Oblivion Core', 'Win the final duel', 'Save reality'],
    difficulty: 10,
    arena: 'ashen_expanse',
    bossName: 'Voidonus Imperion',
    storyBeat: 'GRAND FINALE. The Emperor is defeated. Reality is saved. The Void collapses.',
    rewards: { xp: 5000, currency: 5000, loot: ['The Memory King\'s Crown'] },
    gameplayType: 'boss',
>>>>>>> Stashed changes
  },
  {
    id: 'story_act3_m18',
    actNumber: 3,
    missionNumber: 54,
<<<<<<< Updated upstream
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
=======
    name: 'Epilogue: Unity\'s Dawn',
    description: 'The dawn breaks. Heroes restored. Reality saved. Kai-Jax endures. The legend continues.',
    cinematicIntro: 'The dawn breaks. Heroes restored. Reality saved. Kai-Jax endures. The legend continues. New adventures await.',
    objectives: ['Witness the epilogue', 'See the restored world', 'Begin new adventures'],
    difficulty: 1,
    arena: 'nexus_haven',
    storyBeat: 'EPILOGUE: All 54 chapters complete. The saga is written. New horizons await.',
    rewards: { xp: 1000, currency: 1000, loot: ['Completion Medal', 'New Game+ Unlock'] },
>>>>>>> Stashed changes
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

/**
 * LEGENDS OF KAI-JAX: THE MEMORY HERO
 * STORY CAMPAIGN DATA — ACTS IV–IX (Missions 16–45)
 *
 * Continues from Act III's "opening chapter". Canon rules carried forward:
 * Kai, Jax and Kai-Jax stay three distinct voices in one body, and victory is
 * coordination and consent, never a throne.
 */

import type { StoryMission } from './story_missions';

// ============ ACT IV: THE HOLLOW DAWN (Missions 16-20) ============
export const ACT_IV_STORY_MISSIONS: StoryMission[] = [
  {
    id: 'story_act4_m16',
    actNumber: 4,
    missionNumber: 16,
    title: 'The Morning After',
    description: 'The Void is gone, but the restored memories do not fit the people who hold them. Hollows scavenge the gaps.',
    introCutscene: [
      { speaker: 'Narrator', text: 'Light has returned to the Bronx. A mother calls her son by the wrong name and neither of them knows why.', side: 'left' },
      { speaker: 'Kai', text: 'We gave everything back. Why does it feel like we gave it back out of order?', side: 'left', emotion: 'sad' },
      { speaker: 'Jax', text: 'Because something is feeding on the seams. Look — the street is moving.', side: 'right', emotion: 'determined' }
    ],
    outroCutscene: [
      { speaker: 'Kai-Jax', text: 'The Void left a hollow behind. Hollows need tending, not just hunting.', side: 'left', emotion: 'determined' }
    ],
    objectives: ['Drive off the Hollow scavengers', 'Protect the memory carriers'],
    difficulty: 5,
    arena: 'bronx_streets',
    storyBeat: 'Peace is not the end. The aftermath has its own enemy: memories restored wrong.',
    rewards: { xp: 700, currency: 500, loot: ['Mended Thread'] },
    gameplayType: 'combat',
    enemyWaves: [{ type: 'void-scout', count: 6 }, { type: 'void-grunt', count: 8, delay: 3 }]
  },
  {
    id: 'story_act4_m17',
    actNumber: 4,
    missionNumber: 17,
    title: 'Borrowed Memories',
    description: 'A black market in the old subway sells memory shards. Mirek knows the tunnels; Kai-Jax must not be seen.',
    introCutscene: [
      { speaker: 'Mirek', text: 'Stay low and stay behind me. Every tunnel down here has an owner, and none of them like visitors.', side: 'right', emotion: 'determined' },
      { speaker: 'Jax', text: 'Selling someone\'s memory is theft. Let me hit something.', side: 'left', emotion: 'angry' },
      { speaker: 'Kai', text: 'Quietly, Jax. If the vendors run, the shards scatter and the people they belong to never get them back.', side: 'left' }
    ],
    outroCutscene: [
      { speaker: 'Mirek', text: 'Forty shards recovered. Somebody upstairs is paying very well for more.', side: 'right' }
    ],
    objectives: ['Reach the market undetected', 'Recover the stolen shards'],
    difficulty: 5,
    arena: 'memory_nexus',
    storyBeat: 'Mirek joins. The trade in stolen memory points to a buyer who is building something.',
    rewards: { xp: 750, currency: 550, loot: ['Shard Satchel'], unlocks: ['mirek'] },
    gameplayType: 'stealth',
    enemyWaves: [{ type: 'void-scout', count: 5 }, { type: 'void-stalker-minion', count: 4, delay: 3 }]
  },
  {
    id: 'story_act4_m18',
    actNumber: 4,
    missionNumber: 18,
    title: 'Haven Under Siege',
    description: 'Nexus Haven, the shelter for the displaced, is overrun by Hollows drawn to its stored memories.',
    introCutscene: [
      { speaker: 'Rikka', text: 'I\'m small, not slow! Point me at the big one and watch the sparks fly!', side: 'right', emotion: 'happy' },
      { speaker: 'Kaison', text: 'Every wall in Haven holds someone\'s childhood. We do not let them through.', side: 'left', emotion: 'determined' }
    ],
    outroCutscene: [
      { speaker: 'Rikka', text: 'Did you see that? I set a Hollow on fire and it said thank you. I think.', side: 'right', emotion: 'happy' }
    ],
    objectives: ['Hold Nexus Haven for three waves', 'Keep the memory vault intact'],
    difficulty: 6,
    arena: 'nexus_haven',
    storyBeat: 'Rikka joins. Defending a place instead of attacking one changes how the team fights.',
    rewards: { xp: 800, currency: 600, loot: ['Ember Charm'], unlocks: ['rikka'] },
    gameplayType: 'survival',
    enemyWaves: [{ type: 'void-grunt', count: 8 }, { type: 'void-wraith', count: 6, delay: 4 }, { type: 'void-elite', count: 4, delay: 5 }]
  },
  {
    id: 'story_act4_m19',
    actNumber: 4,
    missionNumber: 19,
    title: 'The Sealed Name',
    description: 'Miri\'s name was locked inside a Void relic. It can only be opened with her consent, and only while the team holds the guards back.',
    introCutscene: [
      { speaker: 'Miri', text: 'Nobody opens that without my word. Not to save me. Not even to help me.', side: 'right', emotion: 'determined' },
      { speaker: 'Kai-Jax', text: 'Then we wait for your word. Tell us when.', side: 'left' },
      { speaker: 'Miri', text: '...You would really wait?', side: 'right', emotion: 'sad' }
    ],
    outroCutscene: [
      { speaker: 'Miri', text: 'Now. Open it. I choose this.', side: 'right', emotion: 'determined' }
    ],
    objectives: ['Hold the guards back while Miri decides', 'Protect the relic until it opens'],
    difficulty: 6,
    arena: 'memory_nexus',
    storyBeat: 'A mission about consent: the right way to give a memory back is to be asked first.',
    rewards: { xp: 850, currency: 650, loot: ['Name-Key Fragment'], unlocks: ['miri'] },
    gameplayType: 'team',
    enemyWaves: [{ type: 'void-wraith', count: 7 }, { type: 'void-elite', count: 5, delay: 4 }]
  },
  {
    id: 'story_act4_m20',
    actNumber: 4,
    missionNumber: 20,
    title: 'The Warden of the Hollow',
    description: 'The Rift Warden has risen again, fed by stolen memories somebody has been delivering to it.',
    introCutscene: [
      { speaker: 'Rift Warden', text: 'THE SHARDS ARE SWEET. SOMEONE SENDS THEM. SOMEONE WHO REMEMBERS YOUR FACE.', side: 'right', emotion: 'angry' },
      { speaker: 'Jax', text: 'Someone who remembers our face? We have never met.', side: 'left', emotion: 'angry' },
      { speaker: 'Kai', text: 'Then someone built a face from our memories. Be careful.', side: 'left', emotion: 'determined' }
    ],
    outroCutscene: [
      { speaker: 'Kai-Jax', text: 'There was a figure in the Warden\'s eyes. It moved the way I move.', side: 'left', emotion: 'sad' },
      { speaker: 'Narrator', text: 'Far from the Bronx, something wearing Kai-Jax\'s silhouette opens its eyes for the first time.', side: 'right' }
    ],
    objectives: ['Defeat the Rift Warden', 'Cut off the supply of stolen shards'],
    difficulty: 7,
    arena: 'rift_frontier',
    bossId: 'rift-warden',
    storyBeat: 'ACT IV FINALE: The rebuilt peace has a hidden enemy. An Echo is learning to walk.',
    rewards: { xp: 1400, currency: 1000, loot: ['Warden Core', 'Hollow Seal'] },
    gameplayType: 'boss',
    enemyWaves: [{ type: 'void-elite', count: 5 }, { type: 'void-brute', count: 3, delay: 5 }]
  }
];

// ============ ACT V: THE HUNDRED FLOORS (Missions 21-25) ============
export const ACT_V_STORY_MISSIONS: StoryMission[] = [
  {
    id: 'story_act5_m21',
    actNumber: 5,
    missionNumber: 21,
    title: 'A Tower Where None Stood',
    description: 'A tower of black glass has risen overnight in the Ashen Expanse. Selene has seen it in her visions for years.',
    introCutscene: [
      { speaker: 'Selene', text: 'A hundred floors. Each one asks a memory a question. I have seen it end the same way every time.', side: 'right', emotion: 'sad' },
      { speaker: 'Kai', text: 'How does it end?', side: 'left' },
      { speaker: 'Selene', text: 'With a door made of mirrors, and the one thing in all my visions I cannot read.', side: 'right' }
    ],
    outroCutscene: [
      { speaker: 'Kai-Jax', text: 'Then we climb it and read it ourselves.', side: 'left', emotion: 'determined' }
    ],
    objectives: ['Breach the tower\'s outer ring', 'Reach the first ascent platform'],
    difficulty: 6,
    arena: 'void_tower',
    storyBeat: 'Selene joins. The tower is a test built for exactly this team.',
    rewards: { xp: 900, currency: 700, loot: ['Oracle Lens'], unlocks: ['selene'] },
    gameplayType: 'combat',
    enemyWaves: [{ type: 'void-legion', count: 8 }, { type: 'void-elite', count: 5, delay: 4 }]
  },
  {
    id: 'story_act5_m22',
    actNumber: 5,
    missionNumber: 22,
    title: 'Floors 1 to 20: Echoes of Friends',
    description: 'The lower floors build copies of the people you trust and ask whether you can hurt them.',
    introCutscene: [
      { speaker: 'Kaison', text: 'That is my stance. That is my scar. That is... me.', side: 'left', emotion: 'sad' },
      { speaker: 'Silver', text: 'A copy sees what you show it, nothing more. Show it who you are, not who you were afraid to be.', side: 'right', emotion: 'determined' }
    ],
    outroCutscene: [
      { speaker: 'Kaison', text: 'It stopped when I stopped. The tower wanted a fight and got a handshake.', side: 'left' }
    ],
    objectives: ['Defeat the Echo copies', 'Spare any copy that lowers its guard'],
    difficulty: 7,
    arena: 'void_tower',
    storyBeat: 'The tower rewards restraint. Mercy is a mechanic, not an afterthought.',
    rewards: { xp: 950, currency: 750, loot: ['Echo Glass'] },
    gameplayType: 'survival',
    enemyWaves: [{ type: 'void-wraith', count: 8 }, { type: 'void-wraith', count: 10, delay: 5 }, { type: 'void-elite', count: 4, delay: 5 }]
  },
  {
    id: 'story_act5_m23',
    actNumber: 5,
    missionNumber: 23,
    title: 'The Marble Floor',
    description: 'A gladiator of white stone guards floor fifty and answers every blow with a lesson.',
    introCutscene: [
      { speaker: 'Marble Gladiator', text: 'Strike me without anger and I will let you pass. Strike me in anger and I will teach you what it costs.', side: 'right', emotion: 'neutral' },
      { speaker: 'Jax', text: 'That is the strangest fight I have ever been invited to.', side: 'left', emotion: 'neutral' }
    ],
    outroCutscene: [
      { speaker: 'Marble Gladiator', text: 'You hit hard and you hit clean. Go up. They are waiting for the three of you.', side: 'right' }
    ],
    objectives: ['Defeat the Marble Gladiator', 'Win without taking a hit in the final phase'],
    difficulty: 7,
    arena: 'void_tower',
    bossId: 'marble-gladiator',
    storyBeat: 'A mid-tower guardian that tests control over power.',
    rewards: { xp: 1100, currency: 850, loot: ['Marble Sigil'] },
    gameplayType: 'boss',
    enemyWaves: [{ type: 'void-elite', count: 4 }]
  },
  {
    id: 'story_act5_m24',
    actNumber: 5,
    missionNumber: 24,
    title: 'Old Moss Remembers',
    description: 'A garden has grown inside the tower, fed by living memory. Old Moss walks its roots.',
    introCutscene: [
      { speaker: 'Old Moss', text: 'I was old when this tower was a seed. It was a hurt memory once. Someone left it untended.', side: 'right', emotion: 'sad' },
      { speaker: 'Kai', text: 'Then the Void was never really an enemy. It was a wound.', side: 'left' }
    ],
    outroCutscene: [
      { speaker: 'Old Moss', text: 'Remember that when you reach the top. Wounds are not defeated. They are tended.', side: 'right' }
    ],
    objectives: ['Cross the overgrown floor', 'Defend the root-heart from the Hollows'],
    difficulty: 7,
    arena: 'jungle_temple',
    storyBeat: 'Old Moss joins and plants the central theme of the endgame: the Void is a grief, not a species.',
    rewards: { xp: 1000, currency: 800, loot: ['Living Root'], unlocks: ['old-moss'] },
    gameplayType: 'platforming',
    enemyWaves: [{ type: 'void-wraith', count: 6 }, { type: 'void-brute', count: 3, delay: 5 }]
  },
  {
    id: 'story_act5_m25',
    actNumber: 5,
    missionNumber: 25,
    title: 'The Hundredth Floor',
    description: 'The Granite Colossus holds the roof. Behind it stands a door made of mirrors.',
    introCutscene: [
      { speaker: 'Granite Colossus', text: 'ONE HUNDRED FLOORS. ONE DOOR. ONE QUESTION: WHO IS AFRAID OF HIS OWN REFLECTION?', side: 'right', emotion: 'angry' },
      { speaker: 'Jax', text: 'Not me. Not Kai. Maybe the third one.', side: 'left', emotion: 'angry' },
      { speaker: 'Kai-Jax', text: 'Maybe all three of us. Let\'s find out.', side: 'left', emotion: 'determined' }
    ],
    outroCutscene: [
      { speaker: 'Narrator', text: 'The Colossus crumbles. In the glass door, Kai-Jax sees himself smile before he does.', side: 'right' }
    ],
    objectives: ['Defeat the Granite Colossus', 'Reach the mirror door'],
    difficulty: 8,
    arena: 'void_tower',
    bossId: 'granite-colossus',
    storyBeat: 'ACT V FINALE: The tower is cleared. The mirror door opens on an Echo that already knows the team.',
    rewards: { xp: 1800, currency: 1300, loot: ['Zenith Shard', 'Tower Crown Fragment'] },
    gameplayType: 'boss',
    enemyWaves: [{ type: 'void-elite', count: 6 }, { type: 'void-brute', count: 4, delay: 5 }]
  }
];

// ============ ACT VI: DUAL DESTINY (Missions 26-30) ============
export const ACT_VI_STORY_MISSIONS: StoryMission[] = [
  {
    id: 'story_act6_m26',
    actNumber: 6,
    missionNumber: 26,
    title: 'Through the Mirror Door',
    description: 'Past the glass, a plateau hangs in the sky. A hooded figure takes the key and runs.',
    introCutscene: [
      { speaker: 'Sable Nine', text: 'Thank you for opening it. I was never going to get through on my own.', side: 'right', emotion: 'happy' },
      { speaker: 'Jax', text: 'That is the fastest anyone has ever betrayed me.', side: 'left', emotion: 'angry' }
    ],
    outroCutscene: [
      { speaker: 'Sable Nine', text: 'Catch me if you can, hero. Someone is waiting who wants to meet you more than I do.', side: 'right' }
    ],
    objectives: ['Chase Sable Nine across the plateau', 'Recover the mirror key'],
    difficulty: 7,
    arena: 'skyforge_plateau',
    storyBeat: 'Sable Nine, the Rival Shade, enters as ambiguous: thief, rival, and eventually something more.',
    rewards: { xp: 1100, currency: 850, loot: ['Shade Thread'] },
    gameplayType: 'chase',
    enemyWaves: [{ type: 'void-scout', count: 6 }, { type: 'void-stalker-minion', count: 4, delay: 3 }]
  },
  {
    id: 'story_act6_m27',
    actNumber: 6,
    missionNumber: 27,
    title: 'The Hero Path',
    description: 'The plateau splits into two roads. On the first, every ally you have ever met stands with you.',
    introCutscene: [
      { speaker: 'Silver', text: 'Two roads. One is your own and one is borrowed. I cannot tell you which is which. That is the point.', side: 'right' },
      { speaker: 'Kai', text: 'We take the road with everyone on it.', side: 'left', emotion: 'determined' }
    ],
    outroCutscene: [
      { speaker: 'Kai-Jax', text: 'It is slower. Louder. Messier. And I would pick it every time.', side: 'left', emotion: 'happy' }
    ],
    objectives: ['Fight alongside the full roster', 'Clear the road of Echo sentries'],
    difficulty: 8,
    arena: 'skyforge_plateau',
    storyBeat: 'The first half of the Dual Destiny: the road that includes everyone.',
    rewards: { xp: 1200, currency: 900, loot: ['Circle Banner'] },
    gameplayType: 'team',
    enemyWaves: [{ type: 'void-legion', count: 8 }, { type: 'void-elite', count: 6, delay: 5 }]
  },
  {
    id: 'story_act6_m28',
    actNumber: 6,
    missionNumber: 28,
    title: 'The Echo Path',
    description: 'On the second road the Echo\'s world is shown: perfect, silent, and agreed upon by one voice.',
    introCutscene: [
      { speaker: 'Echo', text: 'Look how quiet it is. No arguments. No doubt. No one saying no.', side: 'right', emotion: 'neutral' },
      { speaker: 'Kai', text: 'It is quiet because there is no one left in it to disagree.', side: 'left', emotion: 'sad' }
    ],
    outroCutscene: [
      { speaker: 'Jax', text: 'I hate that part of me understood it for a second.', side: 'left', emotion: 'sad' }
    ],
    objectives: ['Cross the silent city', 'Break the sentries without waking the sleepers'],
    difficulty: 8,
    arena: 'ashen_expanse',
    storyBeat: 'The second half of the Dual Destiny: the Echo\'s peace is a world with one opinion.',
    rewards: { xp: 1250, currency: 950, loot: ['Silence Shard'] },
    gameplayType: 'stealth',
    enemyWaves: [{ type: 'void-wraith', count: 7 }, { type: 'void-elite', count: 6, delay: 4 }]
  },
  {
    id: 'story_act6_m29',
    actNumber: 6,
    missionNumber: 29,
    title: 'Sable Nine\'s Choice',
    description: 'Sable Nine stands between the roads with a blade and a decision.',
    introCutscene: [
      { speaker: 'Sable Nine', text: 'The Echo promised me a world where I am never the villain. Do you know how long I have wanted that?', side: 'right', emotion: 'sad' },
      { speaker: 'Kai-Jax', text: 'I do not offer that. I offer a world where you are allowed to be both.', side: 'left', emotion: 'determined' }
    ],
    outroCutscene: [
      { speaker: 'Sable Nine', text: 'That is a worse deal. I will take it.', side: 'right', emotion: 'happy' }
    ],
    objectives: ['Defeat Sable\'s shade', 'Offer Sable the second choice'],
    difficulty: 8,
    arena: 'ashen_expanse',
    bossId: 'void-stalker',
    storyBeat: 'Sable Nine chooses the harder, messier road and becomes an ally.',
    rewards: { xp: 1300, currency: 1000, loot: ['Rival Mark'], unlocks: ['sable-nine'] },
    gameplayType: 'boss',
    enemyWaves: [{ type: 'void-stalker-minion', count: 5 }]
  },
  {
    id: 'story_act6_m30',
    actNumber: 6,
    missionNumber: 30,
    title: 'The Echo of Kai-Jax',
    description: 'The Echo stands at the end of both roads. It has one voice and absolute certainty.',
    introCutscene: [
      { speaker: 'Echo', text: 'You argue with yourself all day. I never have to. Which of us do you think is stronger?', side: 'right', emotion: 'neutral' },
      { speaker: 'Kai-Jax', text: 'Strong is not the question. I can be told no. You cannot.', side: 'left', emotion: 'determined' },
      { speaker: 'Echo', text: 'Then let us see which of us breaks.', side: 'right', emotion: 'angry' }
    ],
    outroCutscene: [
      { speaker: 'Echo', text: 'You win because you listen. I did not know it was allowed to matter.', side: 'right', emotion: 'sad' },
      { speaker: 'Narrator', text: 'The Echo fades. Across the world, every thread of the Weave shivers.', side: 'left' }
    ],
    objectives: ['Defeat the Echo of Kai-Jax', 'Win with all three voices still active'],
    difficulty: 9,
    arena: 'ashen_expanse',
    bossId: 'synergy-hunter',
    storyBeat: 'ACT VI FINALE: The Echo falls to the one thing it could not copy: three voices agreeing to disagree.',
    rewards: { xp: 2200, currency: 1600, loot: ['Echo Core', 'Destiny Fragment'] },
    gameplayType: 'boss',
    enemyWaves: [{ type: 'void-elite', count: 5 }, { type: 'void-brute', count: 3, delay: 5 }]
  }
];

// ============ ACT VII: THE WEAVE UNBOUND (Missions 31-35) ============
export const ACT_VII_STORY_MISSIONS: StoryMission[] = [
  {
    id: 'story_act7_m31',
    actNumber: 7,
    missionNumber: 31,
    title: 'Threads Snapping',
    description: 'With the Echo gone, the Weave it was stitching to has begun to unravel across every sector.',
    introCutscene: [
      { speaker: 'Selene', text: 'Every thread is pulling loose at once. If the Weave fails, every memory in the city goes with it.', side: 'right', emotion: 'determined' },
      { speaker: 'Kai', text: 'How long do we have?', side: 'left' },
      { speaker: 'Selene', text: 'Hours. Maybe fewer.', side: 'right', emotion: 'sad' }
    ],
    outroCutscene: [
      { speaker: 'Kai-Jax', text: 'Then we call everyone who ever carried a thread.', side: 'left', emotion: 'determined' }
    ],
    objectives: ['Stabilize three failing nodes', 'Survive the Void surge'],
    difficulty: 8,
    arena: 'rift_citadel',
    storyBeat: 'The war\'s last crisis is not an enemy. It is a collapse.',
    rewards: { xp: 1400, currency: 1100, loot: ['Stitch Needle'] },
    gameplayType: 'survival',
    enemyWaves: [{ type: 'void-legion', count: 10 }, { type: 'void-elite', count: 6, delay: 4 }, { type: 'void-wraith', count: 8, delay: 5 }]
  },
  {
    id: 'story_act7_m32',
    actNumber: 7,
    missionNumber: 32,
    title: 'The Elders Gather',
    description: 'The old protectors answer the call at Cross Point, where the story began.',
    introCutscene: [
      { speaker: 'Boryn', text: 'I have held many walls. I have never held one this large.', side: 'right', emotion: 'determined' },
      { speaker: 'Borax', text: 'Order is simple. Everyone does their part, and nobody does someone else\'s.', side: 'left' },
      { speaker: 'Jax', text: 'That is the most useful thing anyone has said all week.', side: 'left', emotion: 'happy' }
    ],
    outroCutscene: [
      { speaker: 'Boryn', text: 'The line holds. Now we need to know what we are holding it for.', side: 'right' }
    ],
    objectives: ['Hold Cross Point with the Elders', 'Escort the Weave anchors to safety'],
    difficulty: 8,
    arena: 'cross_point_arena',
    storyBeat: 'Boryn and Borax rejoin the fight; the first act\'s arena becomes the last stand.',
    rewards: { xp: 1500, currency: 1150, loot: ['Elder Crest'], unlocks: ['boryn', 'borax'] },
    gameplayType: 'team',
    enemyWaves: [{ type: 'void-legion', count: 10 }, { type: 'void-elite', count: 6, delay: 5 }]
  },
  {
    id: 'story_act7_m33',
    actNumber: 7,
    missionNumber: 33,
    title: 'Aurelion\'s Erased Future',
    description: 'Aurelion shows the team the future that was erased: a world where Kai-Jax rules it.',
    introCutscene: [
      { speaker: 'Aurelion', text: 'I come from a timeline where you won, and then kept winning, until there was no one left to tell you to stop.', side: 'right', emotion: 'sad' },
      { speaker: 'Kai-Jax', text: 'So that is the road I could take. A throne in a quiet world.', side: 'left', emotion: 'sad' }
    ],
    outroCutscene: [
      { speaker: 'Aurelion', text: 'You looked at it and you did not reach for it. That is the first time anyone has not.', side: 'right', emotion: 'happy' }
    ],
    objectives: ['Fight through the erased timeline', 'Refuse the throne at the end'],
    difficulty: 9,
    arena: 'rift_citadel',
    storyBeat: 'Aurelion joins. The cost of power is shown before it is offered.',
    rewards: { xp: 1600, currency: 1200, loot: ['Slipstream Core'], unlocks: ['aurelion'] },
    gameplayType: 'combat',
    enemyWaves: [{ type: 'void-god-guard', count: 4 }, { type: 'void-elite', count: 8, delay: 5 }]
  },
  {
    id: 'story_act7_m34',
    actNumber: 7,
    missionNumber: 34,
    title: 'Vharck\'s Prophecy',
    description: 'The Elder Fang speaks the last prophecy of the Weave. It asks for something no one has been willing to give.',
    introCutscene: [
      { speaker: 'Vharck', text: 'The Weave does not need a king. It needs to be shared out like bread: a little for everyone, enough for all.', side: 'right', emotion: 'determined' },
      { speaker: 'Kai', text: 'Spread it across everyone? It would be a hundred thousand tiny pieces.', side: 'left' },
      { speaker: 'Vharck', text: 'Yes. That is why it will hold.', side: 'right' }
    ],
    outroCutscene: [
      { speaker: 'Vharck', text: 'You will have to let go of the one thing a hero is never supposed to let go of: control.', side: 'right' }
    ],
    objectives: ['Reach the prophecy altar', 'Defend the altar while the Weave is read'],
    difficulty: 9,
    arena: 'skyforge_plateau',
    storyBeat: 'Vharck joins. The final solution to the war is to give the power away.',
    rewards: { xp: 1700, currency: 1300, loot: ['Prophecy Scroll'], unlocks: ['vharck'] },
    gameplayType: 'survival',
    enemyWaves: [{ type: 'void-wraith', count: 10 }, { type: 'void-elite', count: 8, delay: 4 }, { type: 'void-god-guard', count: 3, delay: 6 }]
  },
  {
    id: 'story_act7_m35',
    actNumber: 7,
    missionNumber: 35,
    title: 'The Throne of Strands',
    description: 'At the heart of the Weave a throne waits, shaped like a hand held out. Rift General Prime guards it one last time.',
    introCutscene: [
      { speaker: 'Rift General Prime', text: 'Sit. Rule. End every argument. The Weave will answer only you. Why would you refuse?', side: 'right', emotion: 'angry' },
      { speaker: 'Kai-Jax', text: 'Because a throne has one seat, and I have a lot of people to take with me.', side: 'left', emotion: 'determined' }
    ],
    outroCutscene: [
      { speaker: 'Kai-Jax', text: 'Take it. Take a thread each. Remember each other.', side: 'left', emotion: 'happy' },
      { speaker: 'Narrator', text: 'The Weave scatters into the people of the city. The war is over. The memories are theirs.', side: 'right' }
    ],
    objectives: ['Defeat Rift General Prime', 'Distribute the Weave instead of taking the throne'],
    difficulty: 10,
    arena: 'rift_citadel',
    bossId: 'rift-general-prime',
    storyBeat: 'ACT VII FINALE: The saga\'s war ends by giving the power away.',
    rewards: { xp: 3000, currency: 2200, loot: ['Weave Thread', 'Unbound Seal'] },
    gameplayType: 'boss',
    enemyWaves: [{ type: 'void-god-guard', count: 4 }, { type: 'void-elite', count: 8, delay: 5 }]
  }
];

// ============ ACT VIII: THE ALL-HIGH (Missions 36-40) ============
export const ACT_VIII_STORY_MISSIONS: StoryMission[] = [
  {
    id: 'story_act8_m36',
    actNumber: 8,
    missionNumber: 36,
    title: 'The Sky Opens',
    description: 'A year of peace ends when the sky splits and four colossal figures look down on the world.',
    introCutscene: [
      { speaker: 'Narrator', text: 'The city has spent a year learning to keep its own memories. Now the overseers who first wove the strands have returned.', side: 'left' },
      { speaker: 'All-High', text: 'WE WOVE THE WEAVE. YOU HAVE TORN IT INTO A THOUSAND PIECES AND CALLED IT FREEDOM.', side: 'right', emotion: 'angry' },
      { speaker: 'Kai-Jax', text: 'We called it a gift. You can disagree. You do not get to take it back.', side: 'left', emotion: 'determined' }
    ],
    outroCutscene: [
      { speaker: 'All-High', text: 'THEN PROVE IT. FOUR TRIALS. FOUR GUARDIANS. FAIL ONE AND THE WEAVE RETURNS TO US.', side: 'right' }
    ],
    objectives: ['Survive the overseers\' vanguard', 'Accept the Trials of the All-High'],
    difficulty: 9,
    arena: 'skyforge_plateau',
    storyBeat: 'The cosmic overseers arrive and challenge the choice made in Act VII.',
    rewards: { xp: 1800, currency: 1400, loot: ['Sky Token'] },
    gameplayType: 'combat',
    enemyWaves: [{ type: 'void-god-guard', count: 5 }, { type: 'void-elite', count: 8, delay: 5 }]
  },
  {
    id: 'story_act8_m37',
    actNumber: 8,
    missionNumber: 37,
    title: 'Trial of the Jade Serpent',
    description: 'The first Trial asks whether the bloodline strand can be given away and still be one\'s own.',
    introCutscene: [
      { speaker: 'Jade Serpent', text: 'The Bloodward strand binds those who share it. If you share it with strangers, what remains of family?', side: 'right', emotion: 'neutral' },
      { speaker: 'Kai', text: 'More of it. Family is who stays, not who is related.', side: 'left', emotion: 'determined' }
    ],
    outroCutscene: [
      { speaker: 'Jade Serpent', text: 'One answer given. Three remain.', side: 'right' }
    ],
    objectives: ['Defeat the Jade Serpent', 'Protect the shared bloodline anchors'],
    difficulty: 9,
    arena: 'emerald_frontier',
    bossId: 'jade-serpent',
    storyBeat: 'First Trial: the Bloodward strand answers for family.',
    rewards: { xp: 2000, currency: 1500, loot: ['Jade Scale'] },
    gameplayType: 'boss',
    enemyWaves: [{ type: 'void-wraith', count: 7 }, { type: 'void-elite', count: 5, delay: 4 }]
  },
  {
    id: 'story_act8_m38',
    actNumber: 8,
    missionNumber: 38,
    title: 'Trial of the Frost Wolf',
    description: 'The second Trial is a chase across a frozen plateau. The Wolf asks how long a memory can last without being tended.',
    introCutscene: [
      { speaker: 'Frost Wolf', text: 'Memories freeze. Memories fade. Without a keeper, they are only ice.', side: 'right', emotion: 'neutral' },
      { speaker: 'Old Moss', text: 'Then we are all keepers, little wolf. That is the whole answer.', side: 'left' }
    ],
    outroCutscene: [
      { speaker: 'Frost Wolf', text: 'A thousand keepers. I had not counted that. Two answers given.', side: 'right' }
    ],
    objectives: ['Chase the Frost Wolf across the plateau', 'Keep the memory beacons lit'],
    difficulty: 9,
    arena: 'skyforge_plateau',
    bossId: 'frost-wolf',
    storyBeat: 'Second Trial: memory survives because many people look after it.',
    rewards: { xp: 2100, currency: 1550, loot: ['Frostbound Tooth'] },
    gameplayType: 'chase',
    enemyWaves: [{ type: 'void-scout', count: 8 }, { type: 'void-stalker-minion', count: 6, delay: 3 }]
  },
  {
    id: 'story_act8_m39',
    actNumber: 8,
    missionNumber: 39,
    title: 'Trial of the Thunder Lion',
    description: 'The third Trial tests the Storm Current: can power be shared without being diluted?',
    introCutscene: [
      { speaker: 'Thunder Lion', text: 'A storm split into a thousand drops is only rain. Where is your lightning now?', side: 'right', emotion: 'angry' },
      { speaker: 'Jax', text: 'In everyone. Watch.', side: 'left', emotion: 'determined' }
    ],
    outroCutscene: [
      { speaker: 'Thunder Lion', text: 'The sky is full of small lightning. I did not know it could be beautiful. Three answers given.', side: 'right' }
    ],
    objectives: ['Defeat the Thunder Lion', 'Chain the storm through your allies'],
    difficulty: 10,
    arena: 'emerald_frontier',
    bossId: 'thunder-lion',
    storyBeat: 'Third Trial: shared power does not shrink, it multiplies.',
    rewards: { xp: 2200, currency: 1600, loot: ['Stormborn Mane'] },
    gameplayType: 'boss',
    enemyWaves: [{ type: 'void-elite', count: 6 }, { type: 'void-brute', count: 3, delay: 5 }]
  },
  {
    id: 'story_act8_m40',
    actNumber: 8,
    missionNumber: 40,
    title: 'Trial of the Earth Turtle',
    description: 'The last Trial asks the oldest question: what do you owe a world that did not ask to be saved?',
    introCutscene: [
      { speaker: 'Earth Turtle', text: 'You decided for everyone, once. You gave them the Weave without asking. Is that not a throne by another name?', side: 'right', emotion: 'neutral' },
      { speaker: 'Kai-Jax', text: '...Yes. A little. We should have asked.', side: 'left', emotion: 'sad' },
      { speaker: 'Earth Turtle', text: 'Then ask now.', side: 'right' }
    ],
    outroCutscene: [
      { speaker: 'All-High', text: 'WE HAVE HEARD ENOUGH. COME TO THE LAST GATE. WE WILL SHOW YOU WHAT THE WEAVE WAS FOR.', side: 'right' }
    ],
    objectives: ['Defeat the Earth Turtle', 'Ask the city for consent before the final blow'],
    difficulty: 10,
    arena: 'jungle_temple',
    bossId: 'earth-turtle',
    storyBeat: 'ACT VIII FINALE: The hero admits the mistake, and the overseers decide to show the truth.',
    rewards: { xp: 3200, currency: 2400, loot: ['Earthen Shell', 'All-High Sigil'] },
    gameplayType: 'boss',
    enemyWaves: [{ type: 'void-god-guard', count: 4 }, { type: 'void-elite', count: 8, delay: 5 }]
  }
];

// ============ ACT IX: THE LAST MEMORY (Missions 41-45) ============
export const ACT_IX_STORY_MISSIONS: StoryMission[] = [
  {
    id: 'story_act9_m41',
    actNumber: 9,
    missionNumber: 41,
    title: 'Gathering the Circle',
    description: 'Every ally Kai-Jax has ever made answers the call at Nexus Haven before the march to the Last Gate.',
    introCutscene: [
      { speaker: 'Silver', text: 'Fifteen of us. A time sage, a pair of brothers, a few elders, a handful of strays. It is not an army.', side: 'right' },
      { speaker: 'Rikka', text: 'It is a better one! Armies do what they are told. We argue!', side: 'right', emotion: 'happy' },
      { speaker: 'Kai-Jax', text: 'Then we go argue with the end of the world.', side: 'left', emotion: 'determined' }
    ],
    outroCutscene: [
      { speaker: 'Kai-Jax', text: 'No one goes alone. That is the rule from now to the end.', side: 'left' }
    ],
    objectives: ['Rally the full roster at Haven', 'Hold the Haven gate against the All-High\'s herald'],
    difficulty: 9,
    arena: 'nexus_haven',
    storyBeat: 'The whole cast assembles. Every earlier choice pays off as an ally.',
    rewards: { xp: 2200, currency: 1700, loot: ['Circle Standard'] },
    gameplayType: 'team',
    enemyWaves: [{ type: 'void-legion', count: 10 }, { type: 'void-god-guard', count: 4, delay: 5 }]
  },
  {
    id: 'story_act9_m42',
    actNumber: 9,
    missionNumber: 42,
    title: 'March on the Last Gate',
    description: 'The route to the Last Gate crosses the ruins of every earlier battlefield, each guarded by its own memory.',
    introCutscene: [
      { speaker: 'Narrator', text: 'They pass the broken arena, the Memory Vault, the tower. Each place remembers them.', side: 'left' },
      { speaker: 'Mirek', text: 'I know a shortcut. It is not a good shortcut. It is the only one.', side: 'right', emotion: 'determined' }
    ],
    outroCutscene: [
      { speaker: 'Miri', text: 'The Gate is open. It is waiting for us to ask permission to come in.', side: 'right' }
    ],
    objectives: ['Cross the old battlefields', 'Reach the Last Gate'],
    difficulty: 10,
    arena: 'rift_citadel',
    storyBeat: 'A long march through the campaign\'s past, with the biggest waves since Act III.',
    rewards: { xp: 2400, currency: 1800, loot: ['Waymarker Stone'] },
    gameplayType: 'survival',
    enemyWaves: [{ type: 'void-legion', count: 12 }, { type: 'void-elite', count: 8, delay: 4 }, { type: 'void-god-guard', count: 5, delay: 6 }]
  },
  {
    id: 'story_act9_m43',
    actNumber: 9,
    missionNumber: 43,
    title: 'Where the Void Was Born',
    description: 'Behind the Gate lies the first wound: the place a forgotten memory turned to grief and became the Void.',
    introCutscene: [
      { speaker: 'Old Moss', text: 'It was never a monster. It was a memory nobody wanted to carry, left alone until it learned to hate.', side: 'right', emotion: 'sad' },
      { speaker: 'Well-Defiler', text: 'I... am... what is left... when no one remembers...', side: 'left', emotion: 'sad' }
    ],
    outroCutscene: [
      { speaker: 'Kai', text: 'We cannot beat grief. We can only stop leaving it alone.', side: 'left', emotion: 'determined' }
    ],
    objectives: ['Defeat the Well-Defiler', 'Reach the first wound'],
    difficulty: 10,
    arena: 'ashen_expanse',
    bossId: 'well-defiler',
    storyBeat: 'The origin of the Void is revealed: a forgotten memory, not a conqueror.',
    rewards: { xp: 2600, currency: 1900, loot: ['Wound Shard'] },
    gameplayType: 'boss',
    enemyWaves: [{ type: 'void-wraith', count: 10 }, { type: 'void-god-guard', count: 4, delay: 5 }]
  },
  {
    id: 'story_act9_m44',
    actNumber: 9,
    missionNumber: 44,
    title: 'The Last Memory',
    description: 'Voidonus Imperion returns as the whole forgotten memory. It does not want to win. It wants not to be alone.',
    introCutscene: [
      { speaker: 'Voidonus Imperion', text: 'I REMEMBER BEING LOVED. THEN I REMEMBER NOTHING. NOTHING IS WHAT YOU ARE ASKING ME TO FORGIVE.', side: 'right', emotion: 'angry' },
      { speaker: 'Kai-Jax', text: 'I am not asking you to forgive. I am asking to remember you. All of it. Together.', side: 'left', emotion: 'determined' },
      { speaker: 'Jax', text: 'And if you swing at us anyway, we hit back. Kindly.', side: 'left', emotion: 'determined' }
    ],
    outroCutscene: [
      { speaker: 'Voidonus Imperion', text: '...Somebody is holding my hand.', side: 'right', emotion: 'sad' },
      { speaker: 'Kai-Jax', text: 'We all are.', side: 'left', emotion: 'happy' }
    ],
    objectives: ['Defeat Voidonus Imperion', 'Finish the fight with every ally still standing'],
    difficulty: 10,
    arena: 'void_tower',
    bossId: 'voidonus-imperion',
    storyBeat: 'THE FINAL BOSS: the strongest enemy in the game ends by being remembered, not destroyed.',
    rewards: { xp: 5000, currency: 4000, loot: ['Last Memory', 'Harmonarch Crown'] },
    gameplayType: 'boss',
    enemyWaves: [{ type: 'void-god-guard', count: 5 }, { type: 'void-elite', count: 6, delay: 5 }]
  },
  {
    id: 'story_act9_m45',
    actNumber: 9,
    missionNumber: 45,
    title: 'Epilogue: Every Memory Kept',
    description: 'A new season begins in the Bronx. Every memory has an owner, and none of them are alone.',
    introCutscene: [
      { speaker: 'Narrator', text: 'The sky is quiet. The Void is a name in a history book, and a garden at the edge of the Ashen Expanse.', side: 'left' },
      { speaker: 'Kai-Jax', text: 'Kai, Jax, and me. Three voices. Still disagreeing. Still here.', side: 'left', emotion: 'happy' }
    ],
    outroCutscene: [
      { speaker: 'Narrator', text: 'Legends of Kai-Jax: The Memory Hero. The saga is complete. The next generation begins.', side: 'left' }
    ],
    objectives: ['Walk the restored Bronx', 'Say goodbye to the Circle'],
    difficulty: 1,
    arena: 'nexus_haven',
    storyBeat: 'The Memory Hero saga closes. The Legacy Trials open for the generation that follows.',
    rewards: { xp: 2000, currency: 2000, loot: ['Saga Completion Crest'] },
    gameplayType: 'combat',
    enemyWaves: []
  }
];

export const LATE_ACT_STORY_MISSIONS: StoryMission[] = [
  ...ACT_IV_STORY_MISSIONS,
  ...ACT_V_STORY_MISSIONS,
  ...ACT_VI_STORY_MISSIONS,
  ...ACT_VII_STORY_MISSIONS,
  ...ACT_VIII_STORY_MISSIONS,
  ...ACT_IX_STORY_MISSIONS,
];

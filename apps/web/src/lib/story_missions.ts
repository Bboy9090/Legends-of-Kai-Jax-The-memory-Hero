export interface StoryMissionRewards {
  xp: number;
  currency: number;
  loot: string[];
}

export interface StoryDialogue {
  speaker: string;
  text: string;
}

export interface StoryEnemyWave {
  enemies: { fighterId: string; label?: string }[];
  spawnDelay?: number;
}

export interface StoryMission {
  id: string;
  missionNumber: number;
  name: string;
  title: string;
  description: string;
  act: number;
  difficulty: number;
  gameplayType: "adventure";
  storyBeat: string;
  arena: string;
  arenaId?: string;
  /** Locked character for this mission. Kai/Jax early, Boryn mid, Kai-Jax late. */
  requiredCharacter?: string;
  requiredCharacters?: string[];
  objectives: string[];
  rewards: StoryMissionRewards;
  introCutscene: StoryDialogue[];
  outroCutscene: StoryDialogue[];
  enemyWaves: StoryEnemyWave[];
  bossId?: string;
}

const STORY_MISSIONS: StoryMission[] = [
  {
    id: "act1-1",
    missionNumber: 1,
    requiredCharacter: "kai",
    name: "Awakening",
    title: "The Awakening",
    description: "Kai-Jax awakens in the Mushroom Plains with fragmented memories. Defeat the shadow beasts to prove you still have the fight in you.",
    act: 1,
    difficulty: 1,
    gameplayType: "adventure",
    storyBeat: "Kai-Jax wakes up with no memory of how they got here. Strange creatures lurk in the mist.",
    arena: "mushroom-plains",
    arenaId: "mushroom-plains",
    objectives: ["Defeat all shadow beasts", "Survive the encounter"],
    rewards: { xp: 40, currency: 20, loot: [] },
    introCutscene: [
      { speaker: "Kai-Jax", text: "Where am I...? My head is pounding. These memories... they're all scattered." },
      { speaker: "???", text: "So, the Memory King finally stirs. But can you still fight?" },
      { speaker: "Kai-Jax", text: "I don't know who you are, but if those beasts are yours... I'll tear through every last one." },
    ],
    outroCutscene: [
      { speaker: "Kai-Jax", text: "Still got it. But that voice... who was that?" },
      { speaker: "???", text: "Impressive. But this was merely a taste. The real trials await deeper in." },
    ],
    enemyWaves: [
      { enemies: [{ fighterId: "sparky", label: "Shadow Beast" }, { fighterId: "blaze", label: "Shadow Beast" }] },
    ],
  },
  {
    id: "act1-2",
    missionNumber: 2,
    requiredCharacter: "jax",
    name: "The Rival Appears",
    title: "Old Rivals",
    description: "A familiar face blocks your path. Jaxon has been waiting — and he's not letting you pass without a fight.",
    act: 1,
    difficulty: 1,
    gameplayType: "adventure",
    storyBeat: "Jaxon confronts Kai-Jax at the valley crossing. Old grudges resurface.",
    arena: "green-valley",
    arenaId: "green-valley",
    objectives: ["Defeat Jaxon", "Use a special attack"],
    rewards: { xp: 60, currency: 30, loot: [] },
    introCutscene: [
      { speaker: "Jaxon", text: "Well, well. The great Kai-Jax, stumbling through the valley like a lost cub." },
      { speaker: "Kai-Jax", text: "Jaxon. I should've known you'd be out here causing trouble." },
      { speaker: "Jaxon", text: "Trouble? I'm the only one who remembers what you forgot. Let me beat it back into you." },
    ],
    outroCutscene: [
      { speaker: "Jaxon", text: "Tch... you haven't lost your edge. Fine. But don't think this is over." },
      { speaker: "Kai-Jax", text: "Wait — what did you mean about remembering? What do you know?" },
      { speaker: "Jaxon", text: "Find the Gods' temple. They have the answers you're looking for." },
    ],
    enemyWaves: [
      { enemies: [{ fighterId: "jaxon", label: "Jaxon" }] },
    ],
    bossId: "jaxon",
  },
  {
    id: "act1-3",
    missionNumber: 3,
    requiredCharacter: "kai",
    name: "Ambush at the Frontier",
    title: "Hold the Line",
    description: "Enemy forces ambush you at the Emerald Frontier. Survive wave after wave and prove your endurance.",
    act: 1,
    difficulty: 2,
    gameplayType: "adventure",
    storyBeat: "Dark forces have been tracking Kai-Jax. A trap is sprung at the frontier.",
    arena: "emerald_frontier",
    arenaId: "green-valley",
    objectives: ["Survive all enemy waves", "Defeat 5 enemies"],
    rewards: { xp: 80, currency: 40, loot: [] },
    introCutscene: [
      { speaker: "Kai-Jax", text: "Something's wrong. The air feels heavy... like I'm being watched." },
      { speaker: "???", text: "You ARE being watched, Memory King. And now... you're surrounded." },
      { speaker: "Kai-Jax", text: "Bring it. I've fought worse in my nightmares." },
    ],
    outroCutscene: [
      { speaker: "Kai-Jax", text: "That was no random attack. Someone sent them specifically for me." },
      { speaker: "Kai-Jax", text: "The temple Jaxon mentioned... I need to find it before they find me first." },
    ],
    enemyWaves: [
      { enemies: [{ fighterId: "sparky", label: "Scout" }, { fighterId: "velocity", label: "Scout" }] },
      { enemies: [{ fighterId: "blaze", label: "Enforcer" }, { fighterId: "sentinel", label: "Enforcer" }, { fighterId: "lunara", label: "Tracker" }], spawnDelay: 3 },
    ],
  },
  {
    id: "act1-4",
    missionNumber: 4,
    requiredCharacter: "jax",
    name: "Temple of the First God",
    title: "The First God",
    description: "You reach the ancient temple. But the God's guardian — Voltage Fang — demands you prove your worth through combat.",
    act: 1,
    difficulty: 2,
    gameplayType: "adventure",
    storyBeat: "The First Sabertooth God's temple stands before you. Its guardian blocks entry.",
    arena: "jungle-ruins",
    arenaId: "jungle-ruins",
    objectives: ["Defeat Voltage Fang's sentries", "Challenge Voltage Fang"],
    rewards: { xp: 100, currency: 50, loot: [] },
    introCutscene: [
      { speaker: "Kai-Jax", text: "This must be it. The First God's temple..." },
      { speaker: "Voltage Fang", text: "You dare approach sacred ground? Only the worthy may enter." },
      { speaker: "Kai-Jax", text: "I didn't come this far to turn back. Test me." },
      { speaker: "Voltage Fang", text: "So be it. My sentries will gauge your strength first." },
    ],
    outroCutscene: [
      { speaker: "Voltage Fang", text: "You fight with forgotten instinct. The memories are still in you, buried deep." },
      { speaker: "Kai-Jax", text: "What memories? What am I supposed to remember?" },
      { speaker: "Voltage Fang", text: "You were the Memory King — keeper of every battle ever fought. Someone stole your legacy. Find the other Gods to restore it." },
    ],
    enemyWaves: [
      { enemies: [{ fighterId: "apex", label: "Temple Sentry" }, { fighterId: "silver", label: "Temple Sentry" }] },
      { enemies: [{ fighterId: "voltage-fang", label: "Voltage Fang" }], spawnDelay: 2 },
    ],
    bossId: "voltage-fang",
  },
  {
    id: "act1-5",
    missionNumber: 5,
    requiredCharacter: "kai",
    name: "The Memory Fragments",
    title: "Shattered Past",
    description: "With the First God's blessing, fragments of memory begin to return — but so do memory-corrupted versions of old foes.",
    act: 1,
    difficulty: 2,
    gameplayType: "adventure",
    storyBeat: "Memory corruption spawns twisted versions of fighters Kai-Jax once knew.",
    arena: "space-station",
    arenaId: "space-station",
    objectives: ["Defeat all corrupted memories", "Survive the onslaught"],
    rewards: { xp: 120, currency: 60, loot: [] },
    introCutscene: [
      { speaker: "Kai-Jax", text: "These flashes... I'm starting to remember faces. But they're wrong. Twisted." },
      { speaker: "???", text: "Your memories are mine now. And I've turned them against you!" },
      { speaker: "Kai-Jax", text: "Then I'll fight them all. Every single distorted echo." },
    ],
    outroCutscene: [
      { speaker: "Kai-Jax", text: "Each one I defeat... a piece of memory comes back. I remember training. I remember... friends." },
      { speaker: "Kai-Jax", text: "Whoever took my memories — they're going to regret it." },
    ],
    enemyWaves: [
      { enemies: [{ fighterId: "kaison", label: "Corrupted Echo" }, { fighterId: "kaxon", label: "Corrupted Echo" }] },
      { enemies: [{ fighterId: "steelwolf", label: "Corrupted Memory" }, { fighterId: "ashen-tiger", label: "Corrupted Memory" }, { fighterId: "blazing-fox", label: "Corrupted Memory" }], spawnDelay: 3 },
    ],
  },
  {
    id: "act1-6",
    missionNumber: 6,
    requiredCharacter: "jax",
    name: "Kai's Warning",
    title: "The Other Half",
    description: "Kai appears with a dire warning: the Memory Thief is building an army. You must combine forces.",
    act: 1,
    difficulty: 2,
    gameplayType: "adventure",
    storyBeat: "Kai seeks out their other half with urgent news about the threat ahead.",
    arena: "rainbow-castle",
    arenaId: "rainbow-castle",
    objectives: ["Fight alongside Kai", "Defeat the advance force"],
    rewards: { xp: 140, currency: 70, loot: [] },
    introCutscene: [
      { speaker: "Kai", text: "Kai-Jax! Thank the Gods I found you. The Memory Thief — they're building an army." },
      { speaker: "Kai-Jax", text: "Kai... I remember you now. We were... one." },
      { speaker: "Kai", text: "We still are. And right now, we need to be. They're coming for the second temple." },
      { speaker: "Kai-Jax", text: "Then we fight together. Just like old times." },
    ],
    outroCutscene: [
      { speaker: "Kai", text: "We held them off, but this was just the advance guard." },
      { speaker: "Kai-Jax", text: "The second temple... if the Memory Thief reaches it before us..." },
      { speaker: "Kai", text: "Then all memory dies. We move. Now." },
    ],
    enemyWaves: [
      { enemies: [{ fighterId: "solaro", label: "Advance Scout" }, { fighterId: "abyss", label: "Advance Scout" }, { fighterId: "lunara", label: "Advance Scout" }] },
      { enemies: [{ fighterId: "marble-gladiator", label: "Stone Warrior" }], spawnDelay: 4 },
    ],
  },
  {
    id: "act1-7",
    missionNumber: 7,
    requiredCharacter: "boryn",
    name: "The Stone Guardians",
    title: "Ancient Defenders",
    description: "Ancient stone statue fighters guard the path to the second temple. They answer to no one — only strength.",
    act: 1,
    difficulty: 3,
    gameplayType: "adventure",
    storyBeat: "The stone guardians have stood for millennia. They must be overcome.",
    arena: "lava-fortress",
    arenaId: "lava-fortress",
    objectives: ["Defeat all Stone Guardians"],
    rewards: { xp: 160, currency: 80, loot: [] },
    introCutscene: [
      { speaker: "Kai-Jax", text: "These statues... they're moving. And they don't look friendly." },
      { speaker: "Kai", text: "The Stone Guardians. They protect the path to the Second God. No one has beaten them in a thousand years." },
      { speaker: "Kai-Jax", text: "Then I'll be the first in a thousand and one." },
    ],
    outroCutscene: [
      { speaker: "Kai-Jax", text: "Ancient stone, shattered. The path is open." },
      { speaker: "Kai", text: "The Second God will reveal more of your stolen memories. But be warned — the closer we get, the stronger the Thief's forces become." },
    ],
    enemyWaves: [
      { enemies: [{ fighterId: "sandstone-sentinel", label: "Sandstone Sentinel" }] },
      { enemies: [{ fighterId: "granite-colossus", label: "Granite Colossus" }, { fighterId: "marble-gladiator", label: "Marble Gladiator" }], spawnDelay: 3 },
    ],
  },
  {
    id: "act1-8",
    missionNumber: 8,
    requiredCharacter: "kai-jax",
    name: "Steelwolf Interceptor",
    title: "The Iron Blockade",
    description: "Steelwolf has been hired by the Memory Thief to stop you. His mechanical exosuit makes him a terrifying foe.",
    act: 1,
    difficulty: 3,
    gameplayType: "adventure",
    storyBeat: "The Memory Thief deploys their strongest mercenary to block your advance.",
    arena: "space-station",
    arenaId: "space-station",
    objectives: ["Defeat Steelwolf", "Survive the assault"],
    rewards: { xp: 180, currency: 90, loot: [] },
    introCutscene: [
      { speaker: "Steelwolf", text: "Memory King. My employer sends their regards... and their death sentence." },
      { speaker: "Kai-Jax", text: "The Memory Thief hired a mercenary? They must be getting desperate." },
      { speaker: "Steelwolf", text: "Desperate? No. Thorough. My exosuit was built to counter every move you've ever made." },
      { speaker: "Kai-Jax", text: "Good thing I've forgotten all my old moves. Time to improvise." },
    ],
    outroCutscene: [
      { speaker: "Steelwolf", text: "Ghhk... impossible. My data said..." },
      { speaker: "Kai-Jax", text: "Your data was about the old me. I'm something new now." },
      { speaker: "Steelwolf", text: "The Thief... they're at the Memory Throne. In the place where it all began." },
    ],
    enemyWaves: [
      { enemies: [{ fighterId: "sentinel", label: "Exo-Drone" }, { fighterId: "apex", label: "Exo-Drone" }] },
      { enemies: [{ fighterId: "steelwolf", label: "Steelwolf" }], spawnDelay: 2 },
    ],
    bossId: "steelwolf",
  },
  {
    id: "act1-9",
    missionNumber: 9,
    requiredCharacter: "kai-jax",
    name: "Gates of Memory",
    title: "The Final Gate",
    description: "The Memory Throne lies ahead. Fight through the Thief's last defenses to reach the truth.",
    act: 1,
    difficulty: 3,
    gameplayType: "adventure",
    storyBeat: "One final gauntlet stands between Kai-Jax and the stolen memories.",
    arena: "lava-fortress",
    arenaId: "lava-fortress",
    objectives: ["Break through all defenses", "Reach the throne room"],
    rewards: { xp: 200, currency: 100, loot: [] },
    introCutscene: [
      { speaker: "Kai", text: "This is it. The Memory Throne. I can feel your memories pulling from inside." },
      { speaker: "Kai-Jax", text: "Then let's go get them back. Whatever's in there... I'm ready." },
      { speaker: "???", text: "Ready? You don't even know what you've forgotten. Let me show you... EVERYTHING you've lost!" },
    ],
    outroCutscene: [
      { speaker: "Kai-Jax", text: "The defenses are down. The throne room is open." },
      { speaker: "Kai", text: "Be careful in there. The Memory Thief has been feeding on your power this whole time." },
    ],
    enemyWaves: [
      { enemies: [{ fighterId: "blaze", label: "Memory Wraith" }, { fighterId: "solaro", label: "Memory Wraith" }, { fighterId: "abyss", label: "Memory Wraith" }] },
      { enemies: [{ fighterId: "granite-colossus", label: "Throne Guard" }, { fighterId: "sandstone-sentinel", label: "Throne Guard" }], spawnDelay: 3 },
      { enemies: [{ fighterId: "ashen-tiger", label: "Elite Wraith" }, { fighterId: "blazing-fox", label: "Elite Wraith" }], spawnDelay: 4 },
    ],
  },
  {
    id: "act1-10",
    missionNumber: 10,
    requiredCharacter: "kai-jax",
    name: "The Memory Throne",
    title: "Act I Finale — The Memory Throne",
    description: "Face the Ashen Tiger, the first agent of the Memory Thief, at the Throne. Reclaim your stolen legacy.",
    act: 1,
    difficulty: 3,
    gameplayType: "adventure",
    storyBeat: "The Act I boss awaits at the Memory Throne. All your training leads to this moment.",
    arena: "rainbow-castle",
    arenaId: "rainbow-castle",
    objectives: ["Defeat the Ashen Tiger", "Reclaim your memories"],
    rewards: { xp: 250, currency: 125, loot: [] },
    introCutscene: [
      { speaker: "Ashen Tiger", text: "So the broken king arrives. I've been wearing your memories like a crown." },
      { speaker: "Kai-Jax", text: "Those memories don't belong to you. They're MINE." },
      { speaker: "Ashen Tiger", text: "Then take them. If you can." },
      { speaker: "Kai-Jax", text: "I didn't come this far to lose. This ends NOW." },
    ],
    outroCutscene: [
      { speaker: "Kai-Jax", text: "It's flooding back... the battles, the training, the people I protected..." },
      { speaker: "Kai", text: "Your first three tails are restored. The Memory King's power is returning." },
      { speaker: "Kai-Jax", text: "But the real Memory Thief is still out there. This was just their agent." },
      { speaker: "Kai", text: "Act I ends here. But the war for your memories has just begun." },
      { speaker: "Kai-Jax", text: "Then I'll keep fighting. Until every last memory is mine again." },
    ],
    enemyWaves: [
      { enemies: [{ fighterId: "kaxon", label: "Shadow Guard" }, { fighterId: "kaison", label: "Shadow Guard" }] },
      { enemies: [{ fighterId: "ashen-tiger", label: "Ashen Tiger — Memory Agent" }], spawnDelay: 3 },
    ],
    bossId: "ashen-tiger",
  },

  // ===== ACT 2 (placeholder missions) =====
  {
    id: "act2-1",
    missionNumber: 11,
    requiredCharacter: "kai-jax",
    name: "Raging City Gates",
    title: "Raging City Gates",
    description: "Storm the city gates as chaos erupts. Fight through waves of corrupted forces.",
    act: 2,
    difficulty: 2,
    gameplayType: "adventure",
    storyBeat: "The city burns. Kai-Jax must breach the gates before the Memory Thief consolidates power.",
    arena: "space-station",
    arenaId: "space-station",
    objectives: ["Defeat all enemies at the gates", "Survive the assault"],
    rewards: { xp: 220, currency: 110, loot: [] },
    introCutscene: [
      { speaker: "Kai-Jax", text: "The gates are overrun. Whatever's inside... we end this." },
      { speaker: "???", text: "Come then, Memory King. Your reckoning awaits." },
    ],
    outroCutscene: [
      { speaker: "Kai-Jax", text: "The gates are down. The city lies ahead. So does Steelwolf." },
    ],
    enemyWaves: [
      { enemies: [{ fighterId: "sparky", label: "Gate Guard" }, { fighterId: "blaze", label: "Gate Guard" }] },
      { enemies: [{ fighterId: "velocity", label: "Enforcer" }, { fighterId: "sentinel", label: "Enforcer" }], spawnDelay: 2 },
    ],
  },
  {
    id: "act2-2",
    missionNumber: 12,
    requiredCharacter: "kai-jax",
    name: "Mid-Boss: Steelwolf",
    title: "Mid-Boss: Steelwolf",
    description: "Face Steelwolf at the district crossing. His exosuit has been upgraded.",
    act: 2,
    difficulty: 3,
    gameplayType: "adventure",
    storyBeat: "Steelwolf blocks the path to the undercity. A rematch—with new stakes.",
    arena: "space-station",
    arenaId: "space-station",
    objectives: ["Defeat Steelwolf"],
    rewards: { xp: 280, currency: 140, loot: [] },
    introCutscene: [
      { speaker: "Steelwolf", text: "You again. This time, I've adapted. Every move you showed me—countered." },
      { speaker: "Kai-Jax", text: "Then I'll show you moves you've never seen." },
    ],
    outroCutscene: [
      { speaker: "Kai-Jax", text: "He's down. But the Thief's reach goes deeper. The undercity awaits." },
    ],
    enemyWaves: [
      { enemies: [{ fighterId: "sentinel", label: "Drone" }, { fighterId: "apex", label: "Drone" }] },
      { enemies: [{ fighterId: "steelwolf", label: "Steelwolf" }], spawnDelay: 2 },
    ],
    bossId: "steelwolf",
  },
  {
    id: "act2-3",
    missionNumber: 13,
    requiredCharacter: "kai-jax",
    name: "District Breach",
    title: "District Breach",
    description: "Break through the Memory Thief's district defenses. Waves of corrupted fighters stand in your way.",
    act: 2,
    difficulty: 2,
    gameplayType: "adventure",
    storyBeat: "The district falls. One last push before the undercity descent.",
    arena: "jungle-ruins",
    arenaId: "jungle-ruins",
    objectives: ["Defeat all waves", "Clear the district"],
    rewards: { xp: 240, currency: 120, loot: [] },
    introCutscene: [
      { speaker: "Kai-Jax", text: "They're falling back. But the Thief won't give up the undercity easily." },
      { speaker: "???", text: "Descend, then. Malakor waits below." },
    ],
    outroCutscene: [
      { speaker: "Kai-Jax", text: "The undercity entrance. Down there—the final battle." },
    ],
    enemyWaves: [
      { enemies: [{ fighterId: "lunara", label: "Tracker" }, { fighterId: "solaro", label: "Tracker" }] },
      { enemies: [{ fighterId: "kaison", label: "Corrupted" }, { fighterId: "kaxon", label: "Corrupted" }], spawnDelay: 3 },
      { enemies: [{ fighterId: "blazing-fox", label: "Elite" }], spawnDelay: 2 },
    ],
  },

  // ===== ACT 3 (placeholder missions) =====
  {
    id: "act3-1",
    missionNumber: 14,
    requiredCharacter: "kai-jax",
    name: "Undercity Entrance",
    title: "Undercity Entrance",
    description: "Enter the undercity. Shadows and echoes lurk in every corridor.",
    act: 3,
    difficulty: 2,
    gameplayType: "adventure",
    storyBeat: "Below the streets, the Memory Thief's stronghold begins. Kai-Jax descends.",
    arena: "jungle-ruins",
    arenaId: "jungle-ruins",
    objectives: ["Fight through the entrance", "Reach the depths"],
    rewards: { xp: 260, currency: 130, loot: [] },
    introCutscene: [
      { speaker: "Kai-Jax", text: "So this is where it ends. Where my memories were stolen." },
      { speaker: "???", text: "Welcome home, Memory King. Too bad you won't remember any of it." },
    ],
    outroCutscene: [
      { speaker: "Kai-Jax", text: "The entrance is clear. Deeper. I need to go deeper." },
    ],
    enemyWaves: [
      { enemies: [{ fighterId: "sparky", label: "Shadow" }, { fighterId: "blaze", label: "Shadow" }, { fighterId: "velocity", label: "Shadow" }] },
      { enemies: [{ fighterId: "ashen-tiger", label: "Memory Agent" }], spawnDelay: 3 },
    ],
  },
  {
    id: "act3-2",
    missionNumber: 15,
    requiredCharacter: "kai-jax",
    name: "The Depths",
    title: "The Depths",
    description: "Descend into the depths where the Memory Thief harvests stolen memories.",
    act: 3,
    difficulty: 3,
    gameplayType: "adventure",
    storyBeat: "The heart of the undercity. Malakor's lair is near.",
    arena: "lava-fortress",
    arenaId: "lava-fortress",
    objectives: ["Survive the depths", "Reach Malakor's chamber"],
    rewards: { xp: 300, currency: 150, loot: [] },
    introCutscene: [
      { speaker: "Kai-Jax", text: "These echoes... they're fragments of people I knew. The Thief did this." },
      { speaker: "???", text: "And soon, you'll be just another echo. Malakor will see to that." },
    ],
    outroCutscene: [
      { speaker: "Kai-Jax", text: "There. The final chamber. Malakor." },
    ],
    enemyWaves: [
      { enemies: [{ fighterId: "kaison", label: "Echo" }, { fighterId: "kaxon", label: "Echo" }] },
      { enemies: [{ fighterId: "steelwolf", label: "Phantom Steelwolf" }], spawnDelay: 2 },
      { enemies: [{ fighterId: "granite-colossus", label: "Guardian" }, { fighterId: "sandstone-sentinel", label: "Guardian" }], spawnDelay: 3 },
    ],
  },
  {
    id: "act3-3",
    missionNumber: 16,
    requiredCharacter: "kai-jax",
    name: "Final Boss: Malakor",
    title: "Final Boss: Malakor",
    description: "Face Malakor, the Memory Thief's champion. Reclaim what was stolen—or lose everything.",
    act: 3,
    difficulty: 3,
    gameplayType: "adventure",
    storyBeat: "The final confrontation. Malakor holds the stolen memories. Kai-Jax will take them back.",
    arena: "rainbow-castle",
    arenaId: "rainbow-castle",
    objectives: ["Defeat Malakor", "Reclaim the memories"],
    rewards: { xp: 400, currency: 200, loot: [] },
    introCutscene: [
      { speaker: "Malakor", text: "So the Memory King arrives. I've tasted your power. It's delicious." },
      { speaker: "Kai-Jax", text: "Those memories aren't yours. Give them back." },
      { speaker: "Malakor", text: "Come and take them. If you can." },
    ],
    outroCutscene: [
      { speaker: "Kai-Jax", text: "It's over. The memories... they're returning." },
      { speaker: "Kai-Jax", text: "The Memory Thief is defeated. But the scars remain. The fight goes on." },
    ],
    enemyWaves: [
      { enemies: [{ fighterId: "kaxon", label: "Shade" }, { fighterId: "kaison", label: "Shade" }] },
      { enemies: [{ fighterId: "malakor", label: "Malakor — Memory Thief Champion" }], spawnDelay: 3 },
    ],
    bossId: "malakor",
  },
];

export function getStoryMissionById(id: string): StoryMission | null {
  return STORY_MISSIONS.find((m) => m.id === id) ?? null;
}

export function getStoryMissionsByAct(act: number): StoryMission[] {
  return STORY_MISSIONS.filter((m) => m.act === act);
}

/** Short lore blurbs shown in mission briefing before "Play". Bronx/post-apocalyptic tone. */
export const LORE_BRIEFINGS: Record<string, string> = {
  "act1-1": "The Bronx streets are quiet. Too quiet.",
  "act1-2": "Old rivals. Old grudges. Same block.",
  "act1-3": "They've been watching. Now they strike.",
  "act1-4": "Sacred ground. Prove your worth.",
  "act1-5": "Memory fragments. Twisted faces.",
  "act1-6": "Two halves. One threat. No time.",
  "act1-7": "Boryn answers the call. Father's Sacrifice awaits.",
  "act1-8": "Steelwolf blocks the path. Iron meets fury.",
  "act1-9": "One gauntlet. One throne. Everything.",
  "act1-10": "The Memory Throne. Reclaim what was stolen.",
  "act2-1": "Raging City burns. Breach the gates.",
  "act2-2": "Steelwolf returns. Upgraded. Hungry.",
  "act2-3": "District by district. One push to the depths.",
  "act3-1": "Below the streets. Shadows and echoes.",
  "act3-2": "Echoes of the fallen. Malakor awaits.",
  "act3-3": "The final reckoning. Memory or dust.",
};

export function getLoreBriefing(missionId: string): string | null {
  return LORE_BRIEFINGS[missionId] ?? null;
}

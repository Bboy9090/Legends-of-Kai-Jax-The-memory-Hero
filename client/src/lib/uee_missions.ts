/**
 * ULTIMATE ENTERTAINMENT ENTERPRISES PRESENTS
 * 10 Missions — The Upgrades God Has Blessed Us With
 * Flawless combat • Beast Wars • Bronx grit
 */

export interface UEEMission {
  id: string;
  missionNumber: number;
  name: string;
  description: string;
  objectives: string[];
  difficulty: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  bossName?: string;
  arena: string;
  rewards: { xp: number; currency: number; loot: string[] };
}

export const UEE_MISSIONS: UEEMission[] = [
  {
    id: 'uee_m1',
    missionNumber: 1,
    name: 'First Light: Beast Arena',
    description: 'Enter the arena. Master flawless punches, kicks, and movement. Taunt your foe—they might smirk back.',
    objectives: ['Land 10 clean punches', 'Land 5 kicks', 'Move flawlessly (no missed inputs)', 'Taunt or encourage once'],
    difficulty: 1,
    arena: 'bronx_streets',
    rewards: { xp: 150, currency: 100, loot: ['Beast Badge'] },
  },
  {
    id: 'uee_m2',
    missionNumber: 2,
    name: 'Smirks & Strikes',
    description: 'Fight with style. Smirk when you connect. Let your rival taunt—then answer with a combo.',
    objectives: ['Perform a 5-hit combo', 'Trigger smirk after a heavy hit', 'Dodge 3 attacks in a row', 'Encourage your ally or taunt the enemy'],
    difficulty: 2,
    arena: 'memory_nexus',
    rewards: { xp: 200, currency: 150, loot: ['Style Crest'] },
  },
  {
    id: 'uee_m3',
    missionNumber: 3,
    name: 'Feet and Fists Flawless',
    description: 'Every punch lands when it should. Every kick reaches its target. Movement locks during attacks—no drift.',
    objectives: ['Never whiff an attack (100% accuracy)', 'Complete 3 perfect dodges', 'Land a launcher into aerial combo', 'Exchange banter during battle'],
    difficulty: 3,
    arena: 'beast_colosseum',
    rewards: { xp: 250, currency: 200, loot: ['Precision Gem'] },
  },
  {
    id: 'uee_m4',
    missionNumber: 4,
    name: 'Taunt & Encourage',
    description: 'Taunt your opponent. Encourage your teammate. The fight isn’t just fists—it’s presence.',
    objectives: ['Taunt 2 times', 'Encourage 2 times', 'Win the round', 'Take less than 30% damage'],
    difficulty: 3,
    bossName: 'Rift Champion',
    arena: 'rift_arena',
    rewards: { xp: 300, currency: 250, loot: ['Soul Link'] },
  },
  {
    id: 'uee_m5',
    missionNumber: 5,
    name: 'Flawless Mechanics Showdown',
    description: 'God has blessed us with crisp combat. Prove it: arms, feet, movement—all flawless.',
    objectives: ['Zero missed inputs for 20 seconds', 'Hit every attack in a 10-hit sequence', 'Perfect block or dodge 5 attacks', 'Smirk or taunt on winning'],
    difficulty: 4,
    arena: 'rooftop_battlefield',
    rewards: { xp: 350, currency: 300, loot: ['Blessing Shard'] },
  },
  {
    id: 'uee_m6',
    missionNumber: 6,
    name: 'Beast Wars: Rival’s Grin',
    description: 'Your rival smirks. You taunt. The crowd feels it. Fighting at its finest.',
    objectives: ['Win 2 rounds', 'Taunt after each round win', 'Encourage when health drops below 50%', 'Land a comeback combo'],
    difficulty: 5,
    bossName: 'Scale Fang',
    arena: 'beast_colosseum',
    rewards: { xp: 400, currency: 350, loot: ['Rival’s Crest'] },
  },
  {
    id: 'uee_m7',
    missionNumber: 7,
    name: 'Moving When It’s Supposed To',
    description: 'No stuck dash. No floaty jumps. Movement responds exactly when it should.',
    objectives: ['Chain 3 dodges into counter', 'Land running attack 3 times', 'Never get hit during attack recovery', 'Encourage teammate once'],
    difficulty: 6,
    arena: 'memory_nexus',
    rewards: { xp: 450, currency: 400, loot: ['Flow Stone'] },
  },
  {
    id: 'uee_m8',
    missionNumber: 8,
    name: 'Arms, Feet, Flawless',
    description: 'Punches and kicks, timed perfectly. Every attack flows into the next.',
    objectives: ['Perform 15-hit combo', 'Use all attack types (light, heavy, launcher, special)', 'Taunt and smirk in same round', 'Win without blocking'],
    difficulty: 7,
    bossName: 'Weave Stalker',
    arena: 'bronx_streets',
    rewards: { xp: 500, currency: 450, loot: ['Flawless Seal'] },
  },
  {
    id: 'uee_m9',
    missionNumber: 9,
    name: 'Encourage One Another',
    description: 'Teammates call out. You answer. Fights feel alive with banter and support.',
    objectives: ['Trigger 3 encouragement lines', 'Trigger 2 taunt lines', 'Win as a team', 'Finish with a sync combo'],
    difficulty: 8,
    arena: 'beast_colosseum',
    rewards: { xp: 550, currency: 500, loot: ['Unity Gem'] },
  },
  {
    id: 'uee_m10',
    missionNumber: 10,
    name: 'UEE Finale: Blessed Combat',
    description: 'Ultimate Entertainment Enterprises presents the culmination. Flawless mechanics. Smirks. Taunts. Encouragement. This is the upgrade God blessed us with.',
    objectives: ['Complete all flawless mechanics', 'Taunt, smirk, and encourage', 'Win without losing a round', 'Land the final blow with a heavy attack'],
    difficulty: 9,
    bossName: 'Kai-Jax Echo',
    arena: 'memory_nexus',
    rewards: { xp: 1000, currency: 1000, loot: ['UEE Champion Crown', 'Blessed Upgrade Token'] },
  },
];

export function getUEEMissionById(id: string): UEEMission | undefined {
  return UEE_MISSIONS.find((m) => m.id === id);
}

export function getUEEMissions(): UEEMission[] {
  return UEE_MISSIONS;
}

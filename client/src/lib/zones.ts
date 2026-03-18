// SUPER SMASH GRAND SAGA - OPEN WORLD ZONES

export interface ZoneChallenge {
  id: string;
  name: string;
  description: string;
  type: 'combat' | 'puzzle' | 'race' | 'collection' | 'boss';
  reward: {
    xp: number;
    currency: number;
    loot: string[];
  };
}

export interface Zone {
  id: string;
  name: string;
  description: string;
  universe: string;
  regions: string[];
  challenges: ZoneChallenge[];
  secrets: string[];
  bosses: string[];
  features: string[];
}

// ============ FIVE OPEN WORLD ZONES ============
export const ZONES: Zone[] = [
  {
    id: 'green_hill',
    name: 'Green Hill Frontier',
    description: 'The iconic rolling green hills of Sonic\'s world. Speed-based puzzles and ring highways.',
    universe: 'Sonic',
    regions: ['Hill Zone', 'Spring Yard', 'Labyrinth Zone', 'Star Light Zone'],
    challenges: [
      {
        id: 'gh_speed_run',
        name: 'Speed Run Challenge',
        description: 'Race through the zone in under 2 minutes',
        type: 'race',
        reward: { xp: 200, currency: 100, loot: ['Speed Badge', 'Golden Ring'] }
      },
      {
        id: 'gh_ring_hunt',
        name: 'Ring Collection',
        description: 'Collect 100 rings scattered across the zone',
        type: 'collection',
        reward: { xp: 150, currency: 150, loot: ['Ring Master Badge'] }
      },
      {
        id: 'gh_eggman_battle',
        name: 'Defeat Eggman Machines',
        description: 'Battle wave of Eggman\'s robotic creations',
        type: 'combat',
        reward: { xp: 250, currency: 200, loot: ['Eggman Core', 'Tech Gear'] }
      }
    ],
    secrets: ['Hidden Spring Yard', 'Labyrinth shortcut', 'Sonic statue location'],
    bosses: ['Eggman Mk. I'],
    features: ['Loop-de-loops for high-speed traversal', 'Ring refill stations', 'Spring pads']
  },
  {
    id: 'hyrule',
    name: 'Hyrule Plateau',
    description: 'The vast lands of Hyrule. Puzzle-solving and climbing challenges.',
    universe: 'Zelda',
    regions: ['Central Plateau', 'Lanayru Wetlands', 'Akkala Highlands', 'Necluda'],
    challenges: [
      {
        id: 'hy_tower_climb',
        name: 'Tower Climbing Challenge',
        description: 'Climb all 5 towers in Hyrule',
        type: 'puzzle',
        reward: { xp: 300, currency: 200, loot: ['Tower Map', 'Climbing Gear'] }
      },
      {
        id: 'hy_shrine_quest',
        name: 'Shrine Quests',
        description: 'Complete 10 hidden shrine challenges',
        type: 'puzzle',
        reward: { xp: 400, currency: 300, loot: ['Spirit Orb x10', 'Ancient Tech'] }
      },
      {
        id: 'hy_guardian_battle',
        name: 'Guardian Ambush',
        description: 'Defeat ancient guardians guarding treasure',
        type: 'combat',
        reward: { xp: 300, currency: 250, loot: ['Ancient Core', 'Guardian Gears'] }
      }
    ],
    secrets: ['Master Sword location', 'Hidden shrine map', 'Lost civilization'],
    bosses: ['Ancient Guardian Mk. III'],
    features: ['Climbable towers', 'Environmental puzzles', 'Shrine fast travel points']
  },
  {
    id: 'mushroom_kingdom',
    name: 'Mushroom Kingdom Plains',
    description: 'Mario\'s homeland. Power-ups and platforming challenges.',
    universe: 'Mario',
    regions: ['Peach\'s Castle', 'Toad Town', 'Koopa Badlands', 'Pipe Network'],
    challenges: [
      {
        id: 'mk_power_shrine',
        name: 'Power-Up Collection',
        description: 'Collect all power-ups hidden throughout the kingdom',
        type: 'collection',
        reward: { xp: 250, currency: 150, loot: ['Power-Up Manual', 'Super Mushroom'] }
      },
      {
        id: 'mk_koopaling',
        name: 'Koopaling Gauntlet',
        description: 'Defeat all 7 Koopalings',
        type: 'combat',
        reward: { xp: 500, currency: 400, loot: ['Koopa Crown', 'Royal Seal'] }
      },
      {
        id: 'mk_pipe_race',
        name: 'Pipe Network Race',
        description: 'Navigate the underground pipe network',
        type: 'race',
        reward: { xp: 200, currency: 100, loot: ['Underground Badge'] }
      }
    ],
    secrets: ['Secret castle room', 'Warp zone location', 'Coin collector area'],
    bosses: ['Bowser Echo Clone'],
    features: ['Power-up shrines', 'Warp pipes for fast travel', 'Cloud platforms']
  },
  {
    id: 'dreamland',
    name: 'Dreamland Skies',
    description: 'Kirby\'s ethereal home in the clouds. Floating island challenges.',
    universe: 'Kirby',
    regions: ['Dream Fountain', 'Whispy Woods', 'Floating Islands', 'Pop Star'],
    challenges: [
      {
        id: 'dl_gourmet',
        name: 'Gourmet Grand Prix',
        description: 'Complete the food-themed racing challenge',
        type: 'race',
        reward: { xp: 300, currency: 150, loot: ['Gourmet Badge', 'Food Supplies'] }
      },
      {
        id: 'dl_star_hunt',
        name: 'Star Hunting',
        description: 'Collect 50 stars scattered in the clouds',
        type: 'collection',
        reward: { xp: 250, currency: 200, loot: ['Star Crown', 'Dream Essence'] }
      },
      {
        id: 'dl_whispy_battle',
        name: 'Whispy Woods Battle',
        description: 'Defeat the ancient tree guardian',
        type: 'boss',
        reward: { xp: 400, currency: 300, loot: ['Whispy Core', 'Ancient Wood'] }
      }
    ],
    secrets: ['Meta Knight\'s hideout', 'King Dedede\'s castle', 'Dream Mirror location'],
    bosses: ['Whispy Woods Echo'],
    features: ['Star currents for movement', 'Floating islands', 'Dream warp points']
  },
  {
    id: 'corneria',
    name: 'Corneria Outlands',
    description: 'Fox\'s airborne domain. Arwing flight and tech salvage.',
    universe: 'Star Fox',
    regions: ['Corneria City', 'Lylat Ruins', 'Orbital Station', 'Tech Junkyard'],
    challenges: [
      {
        id: 'co_arwing_dogfight',
        name: 'Arwing Dogfight Tournament',
        description: 'Win aerial combat battles',
        type: 'combat',
        reward: { xp: 350, currency: 200, loot: ['Fighter Badge', 'Arwing Upgrade'] }
      },
      {
        id: 'co_tech_salvage',
        name: 'Tech Salvage Hunt',
        description: 'Collect rare tech components',
        type: 'collection',
        reward: { xp: 300, currency: 250, loot: ['Tech Parts', 'Upgrade Materials'] }
      },
      {
        id: 'co_andross_echo',
        name: 'Andross Echo Battle',
        description: 'Defeat the Andross simulation',
        type: 'boss',
        reward: { xp: 500, currency: 400, loot: ['Andross Core', 'Star Fox Key'] }
      }
    ],
    secrets: ['Fox\'s original team hideout', 'Secret Arwing location', 'Old base'],
    bosses: ['Andross Echo'],
    features: ['Air-based movement', 'Tech stations', 'Aerial ring challenges']
  }
];

export function getZoneById(id: string): Zone | undefined {
  return ZONES.find(z => z.id === id);
}

export function getChallengeById(zoneId: string, challengeId: string): ZoneChallenge | undefined {
  const zone = getZoneById(zoneId);
  return zone?.challenges.find(c => c.id === challengeId);
}

export function getAllChallenges(): ZoneChallenge[] {
  return ZONES.flatMap(z => z.challenges);
}

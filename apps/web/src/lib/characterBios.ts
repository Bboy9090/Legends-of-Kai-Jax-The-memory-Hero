// Extended character bios for World Collision RPG
// Cinematic descriptions, transformation data, battle quotes, and matchup info

export interface TransformationTier {
  level: number;
  name: string;
  description: string;
  requirements: string;
  powerMultiplier: number;
  transformationSequence?: string; // Visual description of transformation animation
}

export interface VillainMatchup {
  villainName: string;
  matchupType: 'advantage' | 'neutral' | 'disadvantage';
  reason: string;
}

export interface CharacterBio {
  heroId: string;
  title: string; // "Chaos Incarnate", "Adaptive Arsenal", etc.
  shortBio: string; // For character select
  extendedBio: string; // Cinematic RPG codex entry
  originStory: string; // Full mythology/origin narrative
  specialty: string;
  transformations: TransformationTier[];
  ultimateAttack: string;
  synergyPartners: string[]; // Hero IDs they work well with
  battleQuotes: string[]; // Signature quotes before battle
  villainMatchups: VillainMatchup[]; // Counter matchup data
}

export const CHARACTER_BIOS: CharacterBio[] = [
  {
    heroId: 'jaxon',
    title: 'The Storm Fang - Living Lightning',
    shortBio: 'Fastest of the Storm Ronin. Turns speed into pressure and pressure into openings.',
    extendedBio: 'Jaxon is speed with a conscience. Trained in the Storm Ronin Order, he reads a fight a half-second early and uses that margin to protect whoever is slowest on his team. His Storm Current strand answers to his mood: calm, it hums; angry, it breaks the sky.',
    originStory: 'Jaxon grew up in the Bronx sectors, running errands for the neighbors who raised him. When the first Rift breach opened, his Storm Current awakened in the middle of a street full of strangers, and he ran through the Void-touched crowd pulling people out. That night he learned the lesson the Storm Ronin Order would later put into words: speed is only worth having if it arrives in time for someone else.',
    specialty: 'Speed assaults, mobility, multi-target pressure',
    transformations: [
      {
        level: 0,
        name: 'Storm Fang',
        description: 'Crimson speedster crackling with Storm Current',
        requirements: 'Default',
        powerMultiplier: 1.0,
        transformationSequence: 'Lightning traces his outline, the air snaps, and afterimages peel off his stride'
      },
      {
        level: 1,
        name: 'Storm Surge',
        description: 'Gold-white current, faster strikes, chained arcs',
        requirements: 'Fill the Storm meter',
        powerMultiplier: 2.2,
        transformationSequence: 'His current floods outward in a ring, the ground cracks into branching light, and every step leaves a bolt behind'
      },
      {
        level: 2,
        name: 'Thunder Ascendant',
        description: 'Full-body storm, screen-wide chain lightning',
        requirements: 'Fill the Storm meter + Twin Bond',
        powerMultiplier: 4.0,
        transformationSequence: 'The storm folds around him into a single vertical column, time stutters, and he moves between one heartbeat and the next'
      },
    ],
    ultimateAttack: 'Stormfall Barrage - A cascade of lightning strikes that follows every enemy on screen',
    synergyPartners: ['kaison', 'kai-jax'],
    battleQuotes: [
      'Time to speed things up!',
      'You can\'t catch what you can\'t see!',
      'The storm answers me!',
      'Behind me. Now.',
      'Fast enough to get there first.'
    ],
    villainMatchups: [
      { villainName: 'Voidonus Imperion', matchupType: 'disadvantage', reason: 'His crushing presence slows everything in reach, blunting speed' },
      { villainName: 'Echo of Kai-Jax', matchupType: 'neutral', reason: 'A perfect copy of the fight: skill decides the winner' },
      { villainName: 'Rift General Prime', matchupType: 'advantage', reason: 'Speed lets him strike before the General\'s heavy swings land' }
    ]
  },
  {
    heroId: 'kaison',
    title: 'The Swift Guardian - Weaver of the Web',
    shortBio: 'Tactician with spider-like agility. Controls space with web lines and perfect timing.',
    extendedBio: 'Kaison fights like he plays chess: three moves ahead and always protecting the piece that cannot protect itself. His Memory-Weave strand lets him string webs between moments as well as places, and a trap he sets can catch an enemy a few seconds later.',
    originStory: 'Kaison carried the survivor\'s guilt of a sector he could not save, and learned from Silver that guilt can be turned into care: every web he spins is a promise that this time, someone will not fall. He fights to make sure the next person lands safely. Kaison does not trust crowds, but he never leaves anyone behind.',
    specialty: 'Zone control, traps, tactical utility',
    transformations: [
      {
        level: 0,
        name: 'Swift Guardian',
        description: 'Fox-wolf agility with a web-line toolkit',
        requirements: 'Default',
        powerMultiplier: 1.0,
        transformationSequence: 'Silver threads spiral out from his wrists, anchor to the nearest walls, and snap taut into a net of light'
      },
      {
        level: 1,
        name: 'Weaveguard',
        description: 'Reinforced web armor, wider trap radius',
        requirements: 'Fill the Weave meter',
        powerMultiplier: 2.0,
        transformationSequence: 'The web thickens into a woven mantle over his shoulders, every strand humming with stored memory'
      },
      {
        level: 2,
        name: 'Loom of Memory',
        description: 'The whole arena becomes his web',
        requirements: 'Fill the Weave meter + Twin Bond',
        powerMultiplier: 3.8,
        transformationSequence: 'The floor, walls, and sky stitch themselves into one luminous lattice, and he stands at its center, still and certain'
      },
    ],
    ultimateAttack: 'Grand Weave - A web that rewinds an enemy\'s last three seconds and pins them there',
    synergyPartners: ['jaxon', 'silver'],
    battleQuotes: [
      'Three moves ahead.',
      'I was taught to protect. I choose to fight.',
      'My web remembers every step you take.',
      'Everyone behind the line. I have this.',
      'Patience is a weapon too.'
    ],
    villainMatchups: [
      { villainName: 'Voidonus Imperion', matchupType: 'neutral', reason: 'Webs hold the Void\'s corruption briefly but cannot bind it' },
      { villainName: 'Echo of Kai-Jax', matchupType: 'disadvantage', reason: 'The Echo anticipates traps because it was built from the same memories' },
      { villainName: 'Rift General Prime', matchupType: 'advantage', reason: 'The General\'s fixed attack patterns are easy to snare' }
    ]
  }
];

// VILLAIN MATCHUP CHART - Shows advantage/disadvantage against major threats
export const VILLAIN_MATCHUP_CHART = {
  'Voidonus Imperion': {
    strongAgainst: ['jaxon'],
    weakAgainst: ['kaison'],
    description: 'The Void Emperor - his presence slows time and corrodes memory'
  },
  'Echo of Kai-Jax': {
    strongAgainst: ['kaison'],
    weakAgainst: ['jaxon'],
    description: 'A copy built from stolen memories - one voice, no doubt'
  },
  'Rift General Prime': {
    strongAgainst: ['jaxon'],
    weakAgainst: ['kaison'],
    description: 'The last guardian of the Rift Citadel - heavy, patterned, relentless'
  }
};

export function getBioForHero(heroId: string): CharacterBio | undefined {
  return CHARACTER_BIOS.find(bio => bio.heroId === heroId);
}

export function getTransformationForHero(heroId: string, level: number): TransformationTier | undefined {
  const bio = getBioForHero(heroId);
  return bio?.transformations.find(t => t.level === level);
}

export function getRandomBattleQuote(heroId: string): string | undefined {
  const bio = getBioForHero(heroId);
  if (!bio || !bio.battleQuotes.length) return undefined;
  return bio.battleQuotes[Math.floor(Math.random() * bio.battleQuotes.length)];
}

export function getVillainMatchupData(villainName: string) {
  return VILLAIN_MATCHUP_CHART[villainName as keyof typeof VILLAIN_MATCHUP_CHART];
}

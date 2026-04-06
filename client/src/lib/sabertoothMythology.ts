export interface SabertoothGod {
  id: string;
  name: string;
  title: string;
  aspect: string[];
  symbol: string;
  domain: string;
  description: string;
  quote: string;
  legacyExpression: string[];
  mortalEcho?: string;
  color: string;
}

export const FIRST_SABERTOOTH_GODS: SabertoothGod[] = [
  {
    id: 'kar_voth',
    name: 'Kar-Voth',
    title: 'The First Fang',
    aspect: ['Hunger', 'Initiation', 'Becoming'],
    symbol: 'Twin elongated fangs crossing',
    domain: 'The moment weakness becomes resolve',
    description: 'Kar-Voth was the first to bite reality and refuse to let go. He represents hunger that does not apologize, the will to survive before morality exists, the spark that turns prey into challenger.',
    quote: 'If you hesitate, you are already dead.',
    legacyExpression: [
      'All Sabertooth beings carry Kar-Voth\'s Hunger',
      'This is why even the smallest hybrid refuses to kneel',
      'Without Kar-Voth, no Sabertooth awakens',
      'Without Kar-Voth, no cub survives the first trial'
    ],
    color: '#8B0000'
  },
  {
    id: 'thryxen',
    name: 'Thryxen',
    title: 'The Storm Sovereign',
    aspect: ['Law', 'Pressure', 'Authority'],
    symbol: 'Crown of wind and lightning',
    domain: 'Space obeying presence',
    description: 'Thryxen did not chase enemies. Enemies adjusted themselves around him. He represents dominance without motion, authority that bends the environment, judgment without rage.',
    quote: 'Power that must shout has already lost control.',
    legacyExpression: [
      'This is the Sabertooth Lion Aspect',
      'Stormmane',
      'Air pressure',
      'Sovereignty'
    ],
    mortalEcho: 'boryx_zenith',
    color: '#4169E1'
  },
  {
    id: 'pyraxis',
    name: 'Pyraxis',
    title: 'The Bloodward Titan',
    aspect: ['Sacrifice', 'Endurance', 'Shield'],
    symbol: 'A fang split down the center, glowing ember-orange',
    domain: 'Standing when others fall',
    description: 'Pyraxis was the god who stepped in front. Not because he would win — but because someone else must live. He represents love expressed as pain, protection without expectation of reward, the stand that history remembers.',
    quote: 'I will break so you do not have to.',
    legacyExpression: [
      'This is the Sabertooth Tiger Aspect',
      'Raw heat',
      'Overwhelming endurance',
      'Final stands'
    ],
    mortalEcho: 'boryn',
    color: '#FF4500'
  },
  {
    id: 'myrr_kai',
    name: 'Myrr\'Kai',
    title: 'The Memory Eater',
    aspect: ['Continuity', 'Adaptation', 'Fusion'],
    symbol: 'Three interwoven tails marked with ink',
    domain: 'Survival across erasure',
    description: 'Myrr\'Kai was never the strongest. Myrr\'Kai outlasted gods. He represents memory that cannot be deleted, adaptation beyond form, synthesis under extinction pressure.',
    quote: 'What survives is not what is strongest — it is what remembers how to become again.',
    legacyExpression: [
      'This is the Fusion God',
      'Hybrids',
      'Chimera',
      'Kai-Jax'
    ],
    mortalEcho: 'kaijax',
    color: '#9400D3'
  }
];

export interface MortalEcho {
  id: string;
  name: string;
  title: string;
  godEcho: string;
  lineage: 'tiger' | 'lion' | 'fusion';
  role: 'mentor' | 'hero';
  description: string;
  personality: 'warm' | 'cold' | 'balanced';
  fate?: string;
}

export const MORTAL_ECHOES: MortalEcho[] = [
  {
    id: 'boryn',
    name: 'Boryn',
    title: 'The Shield\'s Warmth',
    godEcho: 'pyraxis',
    lineage: 'tiger',
    role: 'mentor',
    description: 'Boryn is Pyraxis remembered correctly. A Sabertooth Tiger warrior who embodies sacrifice and protection. He finds Jaxon and Kaison and becomes their warm, loving father figure.',
    personality: 'warm',
    fate: 'Sacrifices himself facing the Three Void Generals to save his adopted children, channeling Pyraxis\'s ultimate fire.'
  },
  {
    id: 'boryx_zenith',
    name: 'Boryx Zenith',
    title: 'The Storm\'s Discipline',
    godEcho: 'thryxen',
    lineage: 'lion',
    role: 'mentor',
    description: 'Boryx Zenith is Thryxen\'s closest living echo. A Sabertooth Lion warrior who embodies law and authority. After Boryn falls, he takes the orphans under his cold but necessary tutelage.',
    personality: 'cold'
  },
  {
    id: 'jaxon',
    name: 'Jaxon',
    title: 'The Electric Quill',
    godEcho: 'kar_voth',
    lineage: 'tiger',
    role: 'hero',
    description: 'A Hedgehog-Lupine hybrid orphan with electric quills. Carries Kar-Voth\'s hunger - the spark that turns prey into challenger.',
    personality: 'balanced'
  },
  {
    id: 'kaison',
    name: 'Kaison',
    title: 'The Spider-Sense',
    godEcho: 'kar_voth',
    lineage: 'tiger',
    role: 'hero',
    description: 'An Arachnid-Kitsune-Wolf hybrid orphan with spider-sense. Carries Kar-Voth\'s hunger - the will to survive.',
    personality: 'balanced'
  },
  {
    id: 'kaijax',
    name: 'Kai-Jax',
    title: 'The Memory King',
    godEcho: 'myrr_kai',
    lineage: 'fusion',
    role: 'hero',
    description: 'The fusion of Jaxon and Kaison. A Star-Slime Chimera with three Memory Strand Tails. Myrr\'Kai\'s ultimate expression - memory that learned how to fight back.',
    personality: 'balanced'
  }
];

export const SABERTOOTH_LAW = {
  rule: 'Each descendant carries one dominant echo and one suppressed echo.',
  fusionRequirement: [
    'Hunger (Kar-Voth)',
    'Law (Thryxen)',
    'Sacrifice (Pyraxis)',
    'Memory (Myrr\'Kai)'
  ],
  fusionResult: 'Kai-Jax - when all four aspects align without conflict',
  canonLine: 'The First Sabertooths did not rule the world. They taught it how to survive without them.'
};

export const KAIJAX_TAILS = [
  {
    id: 'electric_velocity',
    name: 'Electric Velocity Strand',
    symbol: '⚡',
    color: '#FFD700',
    origin: 'Jaxon\'s electric heritage'
  },
  {
    id: 'web_ink_anchor',
    name: 'Web-Ink Anchor Strand',
    symbol: '🕷️',
    color: '#800080',
    origin: 'Kaison\'s spider-sense heritage'
  },
  {
    id: 'ember_memory',
    name: 'Ember-Memory Strand',
    symbol: '🔥',
    color: '#FF4500',
    origin: 'Pyraxis\'s sacrifice, channeled through Boryn'
  }
];

export const FUSION_SYMBOLS = [
  { symbol: 'Twin Fangs', aspect: 'Hunger', god: 'Kar-Voth' },
  { symbol: 'Crown of Storm', aspect: 'Law', god: 'Thryxen' },
  { symbol: 'Ember Fang', aspect: 'Sacrifice', god: 'Pyraxis' },
  { symbol: 'Three Inked Tails', aspect: 'Memory', god: 'Myrr\'Kai' }
];

export function getGodById(id: string): SabertoothGod | undefined {
  return FIRST_SABERTOOTH_GODS.find(g => g.id === id);
}

export function getMortalEchoById(id: string): MortalEcho | undefined {
  return MORTAL_ECHOES.find(e => e.id === id);
}

export function getGodByMortalEcho(mortalId: string): SabertoothGod | undefined {
  const echo = getMortalEchoById(mortalId);
  if (!echo) return undefined;
  return getGodById(echo.godEcho);
}

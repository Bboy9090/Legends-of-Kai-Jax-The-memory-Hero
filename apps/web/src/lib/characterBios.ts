// Gold Slice character bios.
// Release content is intentionally restricted to the three production-validated
// Legends of Kai-Jax identities. Historical crossover-era bios stay out of the
// shipping source graph.

export interface TransformationTier {
  level: number;
  name: string;
  description: string;
  requirements: string;
  powerMultiplier: number;
  transformationSequence?: string;
}

export interface VillainMatchup {
  villainName: string;
  matchupType: 'advantage' | 'neutral' | 'disadvantage';
  reason: string;
}

export interface CharacterBio {
  heroId: string;
  title: string;
  shortBio: string;
  extendedBio: string;
  originStory: string;
  specialty: string;
  transformations: TransformationTier[];
  ultimateAttack: string;
  synergyPartners: string[];
  battleQuotes: string[];
  villainMatchups: VillainMatchup[];
}

export const CHARACTER_BIOS: CharacterBio[] = [
  {
    heroId: 'kai-jax',
    title: 'The Memory Hero',
    shortBio: 'The independent third person within the shared body, carrying Memory Weave as his own voice and responsibility.',
    extendedBio: 'Kai-Jax is neither a costume nor a temporary fusion state. He is a distinct person who shares one physical body with Kai and Jax. In combat, Memory Weave lets him reconcile competing instincts without erasing either brother, turning recognition, timing, and shared responsibility into pressure.',
    originStory: 'Kai-Jax emerges as the third identity domain within one shared body. His story is about personhood under pressure: being recognized without becoming property, carrying inherited memory without surrendering choice, and learning to act beside Kai and Jax without collapsing them into one another.',
    specialty: 'Memory control, adaptive pressure, shared-body coordination',
    transformations: [
      {
        level: 0,
        name: 'Memory Hero',
        description: 'Kai-Jax in his canonical combat state.',
        requirements: 'Default',
        powerMultiplier: 1.0,
        transformationSequence: 'Memory Weave settles around the shared body as three distinct voices align without merging identities.',
      },
      {
        level: 1,
        name: 'Memory Weave Focus',
        description: 'A temporary combat focus that sharpens recognition, timing, and counter-pressure.',
        requirements: 'Fill the Memory meter',
        powerMultiplier: 1.45,
        transformationSequence: 'Prismatic memory lines tighten around the silhouette while posture and timing become deliberate and precise.',
      },
      {
        level: 2,
        name: 'Three-Voice Accord',
        description: 'A high-pressure accord state built on cooperation without identity erasure.',
        requirements: 'Perfect shared-body coordination',
        powerMultiplier: 1.9,
        transformationSequence: 'Bloodward, Storm Current, and Memory Weave remain visually distinct as the three voices choose one coordinated action.',
      },
    ],
    ultimateAttack: 'Memory Weave Break — a coordinated strike that fractures enemy control without surrendering Kai-Jax’s independent will.',
    synergyPartners: ['jaxon', 'kaison'],
    battleQuotes: [
      'Recognition is not permission.',
      'Three voices. One choice.',
      'I remember. I decide.',
      'You do not get to name me.',
      'Person before legend.',
    ],
    villainMatchups: [
      { villainName: 'Void Stalker Prime', matchupType: 'neutral', reason: 'The Stalker attacks memory and spacing; Kai-Jax answers with recognition and controlled pressure.' },
      { villainName: 'Corruption Brute', matchupType: 'advantage', reason: 'Memory Weave can punish the Brute after armor breaks.' },
    ],
  },
  {
    heroId: 'jaxon',
    title: 'Storm Current Blitzer',
    shortBio: 'A high-speed pressure fighter who turns Storm Current into displacement, tempo, and decisive entries.',
    extendedBio: 'Jaxon fights by changing the geometry of a battle before opponents can settle. Storm Current drives his acceleration, feints, rapid direction changes, and pressure strings. His strength is not simply speed; it is choosing when movement becomes commitment.',
    originStory: 'Jaxon learned to survive systems that expected him to run in predictable lines. He made movement into language instead: pressure when allies need space, displacement when enemies overcommit, and restraint when speed would endanger the people beside him.',
    specialty: 'Mobility, pressure strings, displacement',
    transformations: [
      {
        level: 0,
        name: 'Storm Ready',
        description: 'Jaxon’s standard combat posture.',
        requirements: 'Default',
        powerMultiplier: 1.0,
        transformationSequence: 'Storm Current gathers in short arcs along his limbs as he settles into a forward-ready stance.',
      },
      {
        level: 1,
        name: 'Storm Surge',
        description: 'A temporary acceleration state for rapid pressure and evasive repositioning.',
        requirements: 'Fill the Storm meter',
        powerMultiplier: 1.4,
        transformationSequence: 'Compressed stormlight trails behind each step while his silhouette stays readable and grounded.',
      },
      {
        level: 2,
        name: 'Thunderclap State',
        description: 'A brief peak-pressure state built around impact timing instead of raw travel speed.',
        requirements: 'Complete a clean pressure sequence',
        powerMultiplier: 1.85,
        transformationSequence: 'Storm Current collapses inward, then releases in controlled pulses around strikes and directional changes.',
      },
    ],
    ultimateAttack: 'Storm Break — a displacement rush that closes space, redirects the target, and ends in a grounded impact.',
    synergyPartners: ['kaison', 'kai-jax'],
    battleQuotes: [
      'Keep up with the decision, not the speed.',
      'Wrong lane.',
      'Pressure is a choice.',
      'Move with me.',
      'Now.',
    ],
    villainMatchups: [
      { villainName: 'Rift Drone', matchupType: 'advantage', reason: 'Storm mobility closes the Drone’s preferred range quickly.' },
      { villainName: 'Void Stalker Prime', matchupType: 'neutral', reason: 'Teleport reads can punish reckless acceleration.' },
    ],
  },
  {
    heroId: 'kaison',
    title: 'Tactical Blade Specialist',
    shortBio: 'A deliberate close-range tactician who converts positioning, reads, and blade discipline into control.',
    extendedBio: 'Kaison fights with economy. He studies approach lanes, protects openings, and commits only when the exchange is favorable. His tactical blade work is built around readable arcs, planted footwork, and decisions that create space for the team instead of spectacle for its own sake.',
    originStory: 'Kaison became dangerous by refusing shortcuts. Every technique is earned through observation, repetition, and accountability. Where others chase overwhelming power, he builds reliable answers and protects the people who trust his judgment.',
    specialty: 'Blade control, spacing, defensive reads',
    transformations: [
      {
        level: 0,
        name: 'Tactical Ready',
        description: 'Kaison’s standard blade discipline.',
        requirements: 'Default',
        powerMultiplier: 1.0,
        transformationSequence: 'He checks footing, blade line, and distance before settling into a compact guard.',
      },
      {
        level: 1,
        name: 'Overwatch Focus',
        description: 'A temporary read-state that improves defensive timing and counter windows.',
        requirements: 'Fill the Tactical meter',
        powerMultiplier: 1.35,
        transformationSequence: 'Subtle targeting marks trace likely attack lanes while his stance remains restrained and physical.',
      },
      {
        level: 2,
        name: 'Blade Matrix',
        description: 'A short peak state that links spacing, counters, and controlled finishers.',
        requirements: 'Complete a clean defensive sequence',
        powerMultiplier: 1.8,
        transformationSequence: 'Multiple predicted attack lanes resolve into one chosen blade path, emphasizing precision over excess.',
      },
    ],
    ultimateAttack: 'Blade Matrix Finish — a read-and-counter sequence ending in one committed tactical strike.',
    synergyPartners: ['jaxon', 'kai-jax'],
    battleQuotes: [
      'Read first. Commit second.',
      'Your opening is already there.',
      'Hold the line.',
      'One clean answer.',
      'I have the angle.',
    ],
    villainMatchups: [
      { villainName: 'Corruption Brute', matchupType: 'neutral', reason: 'Armor forces Kaison to wait for a real opening before committing.' },
      { villainName: 'Memory Wisp', matchupType: 'advantage', reason: 'Disciplined spacing limits the Wisp’s ability to create confusion.' },
    ],
  },
];

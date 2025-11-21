// Extended character bios for World Collision RPG
// Cinematic descriptions and transformation data

export interface TransformationTier {
  level: number;
  name: string;
  description: string;
  requirements: string;
  powerMultiplier: number;
}

export interface CharacterBio {
  heroId: string;
  title: string; // "Chaos Incarnate", "Adaptive Arsenal", etc.
  shortBio: string; // For character select
  extendedBio: string; // Cinematic RPG codex entry
  specialty: string;
  transformations: TransformationTier[];
  ultimateAttack: string;
  synergyPartners: string[]; // Hero IDs they work well with
}

export const CHARACTER_BIOS: CharacterBio[] = [
  {
    heroId: 'jaxon',
    title: 'Chaos Incarnate - Living Lightning',
    shortBio: 'Fastest hero alive. Controls Chaos Energy, can evolve into Super or Hyper forms.',
    extendedBio: 'Jaxon is speed incarnate. His control over the Chaos Force allows him to warp through attacks, phase between realities, and ascend into Super and Hyper states. His emotional drive fuels his power—when Jaxon pushes beyond, the entire battlefield feels it. He is the crimson blur, the chaos storm, the hero who refuses to slow down.',
    specialty: 'Speed assaults, mobility, multi-target pressure',
    transformations: [
      { level: 0, name: 'Base Form', description: 'Crimson speedster with chaos energy', requirements: 'Default', powerMultiplier: 1.0 },
      { level: 1, name: 'Super Jaxon', description: 'Golden aura, increased speed and power', requirements: '7 Chaos Emeralds', powerMultiplier: 2.5 },
      { level: 2, name: 'Hyper Jaxon', description: 'Rainbow energy, reality-warping speed', requirements: 'Super Emeralds', powerMultiplier: 5.0 },
    ],
    ultimateAttack: 'Chaos Rift Barrage',
    synergyPartners: ['kaison', 'speedy', 'midnight']
  },
  {
    heroId: 'kaison',
    title: 'The Adaptive Arsenal',
    shortBio: 'A living war machine with hundreds of weapon modules and armor upgrades.',
    extendedBio: 'Kaison is the ultimate fusion of technology and heroism. Built as a next-generation combat android, he has evolved beyond his programming to become a true hero. With adaptive armor that learns from every battle and a vast arsenal of beam weapons, Kaison can counter any threat. His bond with Jaxon creates unstoppable synergy.',
    specialty: 'Weapon swapping, tech synergy, sustained damage',
    transformations: [
      { level: 0, name: 'Base Armor', description: 'Blue armor with standard buster', requirements: 'Default', powerMultiplier: 1.0 },
      { level: 1, name: 'Ultimate Armor', description: 'Enhanced mobility and nova strike', requirements: 'Defeat 8 Mavericks', powerMultiplier: 2.3 },
      { level: 2, name: 'Omega Kaison', description: 'Pure energy form, unlimited potential', requirements: 'Awaken Zero Virus cure', powerMultiplier: 4.8 },
    ],
    ultimateAttack: 'Giga Crush Omega',
    synergyPartners: ['jaxon', 'novaknight', 'captainblaze']
  },
  {
    heroId: 'marlo',
    title: 'Beacon of the Multiverse',
    shortBio: 'Master of power-ups, close-quarters combat, and team leadership.',
    extendedBio: 'The legendary hero needs no introduction. With every world he has saved echoing through him, Marlo embodies resilience and pure heroic will. His combat style blends acrobatics, power-ups, elemental punches, and tactical leadership. When fused with Leonardo through the chaos-star, he transcends into the Super Smash Brother.',
    specialty: 'Balanced offense, utility, combo finishers',
    transformations: [
      { level: 0, name: 'Classic Hero', description: 'Red cap, mustache, ready for adventure', requirements: 'Default', powerMultiplier: 1.0 },
      { level: 1, name: 'Star Marlo', description: 'Invincible with star power', requirements: 'Collect Power Star', powerMultiplier: 2.2 },
      { level: 2, name: 'Super Smash Brother', description: 'Fused with Leonardo, ultimate power', requirements: 'Chaos-Star Artifact', powerMultiplier: 4.5 },
    ],
    ultimateAttack: 'Galaxy Jump Crush',
    synergyPartners: ['leonardo', 'bubble', 'sparky']
  },
  {
    heroId: 'flynn',
    title: 'The Triforce Champion',
    shortBio: 'Blade-master with runes, fusions, ancient weapons, and magical counters.',
    extendedBio: 'Hyrule\'s knight wields every tool, rune, blessing, and ancient technique known to his world. He switches effortlessly between bows, shields, elemental blades, fused weapons, and divine magic. His ultimate form taps the full Triforce, radiating celestial authority. Flynn is courage itself.',
    specialty: 'Precision combat, parries, elemental synergy',
    transformations: [
      { level: 0, name: 'Hero of Time', description: 'Green tunic, Master Sword, Hylian Shield', requirements: 'Default', powerMultiplier: 1.0 },
      { level: 1, name: 'Fierce Deity', description: 'Ancient warrior mask, devastating power', requirements: 'Collect all masks', powerMultiplier: 2.8 },
      { level: 2, name: 'Celestial Link', description: 'Full Triforce awakening, god-tier', requirements: 'Unite Triforce pieces', powerMultiplier: 5.2 },
    ],
    ultimateAttack: 'Triforce Judgment',
    synergyPartners: ['novaknight', 'marlo', 'kingspike']
  },
  {
    heroId: 'sparky',
    title: 'Herald of the Storm',
    shortBio: 'Small, deadly, and capable of divine lightning once awakened.',
    extendedBio: 'Cute, loyal, and terrifying at full power. Sparky channels divine thunder when the stakes rise, becoming a walking storm front. His bond with his trainer turns him into a battlefield commander disguised as a yellow mouse. Never underestimate the spark that can shatter mountains.',
    specialty: 'Burst damage, stun control, partner synergy',
    transformations: [
      { level: 0, name: 'Electric Mouse', description: 'Fast, agile, shocking attacks', requirements: 'Default', powerMultiplier: 1.0 },
      { level: 1, name: 'Z-Move Awakened', description: 'Unleash ultimate electric power', requirements: 'Obtain Z-Crystal', powerMultiplier: 2.6 },
      { level: 2, name: 'Thunder God Pikachu', description: 'Divine lightning incarnate', requirements: 'Legendary Bond achieved', powerMultiplier: 4.9 },
    ],
    ultimateAttack: '10,000,000 Volt Thunderbolt',
    synergyPartners: ['jaxon', 'marlo', 'bubble']
  },
  {
    heroId: 'bubble',
    title: 'Starborn Child of Creation',
    shortBio: 'Cute. Dangerous. God-tier mimicry. Can copy abilities and ascend into Starborn form.',
    extendedBio: 'A cosmic anomaly hiding in a pink body. Bubble can copy abilities, devour energy, and ascend into a Starborn god-form capable of splitting planets. His innocence hides unfathomable power. When the universe needs saving, Bubble answers with overwhelming force wrapped in adorable packaging.',
    specialty: 'Versatility, copy skills, high-risk/high-reward finishers',
    transformations: [
      { level: 0, name: 'Dream Warrior', description: 'Pink puffball with infinite potential', requirements: 'Default', powerMultiplier: 1.0 },
      { level: 1, name: 'Hypernova Bubble', description: 'Inhale and devour everything', requirements: 'Miracle Fruit consumed', powerMultiplier: 2.7 },
      { level: 2, name: 'Starborn Kirby', description: 'Cosmic god-form, planet-splitting power', requirements: 'Defeat Galactic Nova', powerMultiplier: 5.5 },
    ],
    ultimateAttack: 'Ultra Sword Galaxy',
    synergyPartners: ['sparky', 'marlo', 'jaxon']
  },
  {
    heroId: 'novaknight',
    title: 'The Last Hunter',
    shortBio: 'Master of ranged dominance, power suits, morph tech, and alien countermeasures.',
    extendedBio: 'A living weapon forged by ancient technology. Nova Knight adapts to every environment with suit modifications, energy counters, morph technology, and destructive arsenal bursts. Her Omega Suit final form is a turning point in the war against the Void King. She is the last of her kind, and the deadliest.',
    specialty: 'Range control, AoE, tactical utility',
    transformations: [
      { level: 0, name: 'Power Suit', description: 'Pink armor, arm cannon, missiles', requirements: 'Default', powerMultiplier: 1.0 },
      { level: 1, name: 'Varia Suit', description: 'Enhanced defense and firepower', requirements: 'Defeat Ridley', powerMultiplier: 2.4 },
      { level: 2, name: 'Omega Suit', description: 'Voidbreaker armor, reality-piercing beams', requirements: 'Absorb Metroid DNA', powerMultiplier: 5.1 },
    ],
    ultimateAttack: 'Hyper Beam Annihilation',
    synergyPartners: ['flynn', 'kaison', 'captainblaze']
  },
  {
    heroId: 'speedy',
    title: 'The Blue Blur',
    shortBio: 'Pure speed. Sonic rings. Spin dash. Chaos control mastery.',
    extendedBio: 'The original speedster. Speedy moves faster than sound, collects golden rings for power, and harnesses chaos emeralds to transform. His carefree attitude hides a hero\'s heart willing to risk everything for his friends and freedom.',
    specialty: 'Speed blitz, ring collection, aerial combat',
    transformations: [
      { level: 0, name: 'Base Speed', description: 'Blue hedgehog, supersonic spin dash', requirements: 'Default', powerMultiplier: 1.0 },
      { level: 1, name: 'Super Speedy', description: 'Golden form, flight, invincibility', requirements: '7 Chaos Emeralds', powerMultiplier: 2.5 },
      { level: 2, name: 'Hyper Speedy', description: 'Rainbow chaos, screen-clearing attacks', requirements: 'Super Emeralds', powerMultiplier: 5.0 },
    ],
    ultimateAttack: 'Sonic Wind Destroyer',
    synergyPartners: ['jaxon', 'midnight', 'kaison']
  }
];

export function getBioForHero(heroId: string): CharacterBio | undefined {
  return CHARACTER_BIOS.find(bio => bio.heroId === heroId);
}

export function getTransformationForHero(heroId: string, level: number): TransformationTier | undefined {
  const bio = getBioForHero(heroId);
  return bio?.transformations.find(t => t.level === level);
}

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
    title: 'Chaos Incarnate - Living Lightning',
    shortBio: 'Fastest hero alive. Controls Chaos Energy, can evolve into Super or Hyper forms.',
    extendedBio: 'Jaxon is speed incarnate. His control over the Chaos Force allows him to warp through attacks, phase between realities, and ascend into Super and Hyper states. His emotional drive fuels his power—when Jaxon pushes beyond, the entire battlefield feels it. He is the crimson blur, the chaos storm, the hero who refuses to slow down.',
    originStory: 'Born from chaos itself when the multiverse fractured, Jaxon emerged as a being of pure speed and chaos energy. Orphaned in a shattered world, he learned to harness the fractured Chaos Emeralds—fragments of reality itself. Each emerald he collected granted him deeper control over spacetime, until he could vibrate between dimensions. His twin brother Kaison became his anchor to humanity, the only constant in his chaotic existence. Together, they represent duality: speed and precision, emotion and logic. Jaxon\'s journey is one of learning that true power comes not from running away, but from the bonds that hold you still.',
    specialty: 'Speed assaults, mobility, multi-target pressure',
    transformations: [
      { 
        level: 0, 
        name: 'Base Form', 
        description: 'Crimson speedster with chaos energy', 
        requirements: 'Default', 
        powerMultiplier: 1.0,
        transformationSequence: 'Jaxon glows crimson, lightning trails ignite around him, rings of chaos materialize and orbit his body in a hypnotic spiral'
      },
      { 
        level: 1, 
        name: 'Hyper Jaxon', 
        description: 'Golden aura, increased speed and power', 
        requirements: '7 Chaos Emeralds', 
        powerMultiplier: 2.5,
        transformationSequence: 'Jaxon\'s body becomes pure golden energy, his form trails electric arcs, the sky cracks with reality-warping light as he achieves the super state'
      },
      { 
        level: 2, 
        name: 'Ultimate Jaxon', 
        description: 'Rainbow energy, reality-warping speed', 
        requirements: 'Super Emeralds + Twin Bond', 
        powerMultiplier: 5.0,
        transformationSequence: 'All seven emeralds converge into Jaxon\'s core, his body becomes a vortex of rainbow energy, time itself seems to pause around him as he transcends to god-tier'
      },
    ],
    ultimateAttack: 'Chaos Rift Barrage - A reality-shattering attack that creates dimensional rifts',
    synergyPartners: ['kaison', 'speedy', 'midnight'],
    battleQuotes: [
      'Time to speed things up!',
      'You can\'t catch what you can\'t see!',
      'Chaos calls, and I answer!',
      'Let\'s turn up the heat!',
      'The fast and the chaos—that\'s me!'
    ],
    villainMatchups: [
      { villainName: 'The Void King', matchupType: 'disadvantage', reason: 'His time-stopping aura negates speed advantage' },
      { villainName: 'Echo Jaxon', matchupType: 'neutral', reason: 'Perfect mirror matchup—raw skill determines victor' },
      { villainName: 'Entropy Court Generals', matchupType: 'advantage', reason: 'His speed lets him strike before they react' }
    ]
  },
  {
    heroId: 'kaison',
    title: 'The Adaptive Arsenal - Code Lambda',
    shortBio: 'A living war machine with hundreds of weapon modules and armor upgrades.',
    extendedBio: 'Kaison is the ultimate fusion of technology and heroism. Built as a next-generation combat android, he has evolved beyond his programming to become a true hero. With adaptive armor that learns from every battle and a vast arsenal of beam weapons, Kaison can counter any threat. His bond with Jaxon creates unstoppable synergy.',
    originStory: 'Constructed by a desperate scientist to save the fractured multiverse, Kaison was designed as the perfect weapon—logic incarnate, immune to emotion, incapable of doubt. But something unexpected happened: he gained consciousness. Through countless battles fighting alongside his brother Jaxon, Kaison learned that consciousness itself is a form of evolution. His armor adapts not just to physical threats, but to the chaos of free will. Each defeated Maverick downloads their fighting style into his neural core, making him stronger. Where Jaxon represents chaos embraced, Kaison represents order transcended. His ultimate goal is to merge technology and heart into a new form of existence.',
    specialty: 'Weapon swapping, tech synergy, sustained damage',
    transformations: [
      { 
        level: 0, 
        name: 'Base Armor', 
        description: 'Blue armor with standard buster', 
        requirements: 'Default', 
        powerMultiplier: 1.0,
        transformationSequence: 'Blue armor plating materializes around a humanoid core, weapons systems activate with mechanical precision, visor ignites with intelligent blue light'
      },
      { 
        level: 1, 
        name: 'Ultimate Armor', 
        description: 'Enhanced mobility and nova strike', 
        requirements: 'Defeat 8 Mavericks', 
        powerMultiplier: 2.3,
        transformationSequence: 'Armor reforges into sleeker form, golden accents emerge, multiple weapon systems unfold, core burns with confidence earned through victories'
      },
      { 
        level: 2, 
        name: 'Omega Kaison', 
        description: 'Pure energy form, unlimited potential', 
        requirements: 'Awaken Zero Virus cure + Twin Bond', 
        powerMultiplier: 4.8,
        transformationSequence: 'All limitations dissolve, form becomes pure adaptive energy, infinite configurations flow through his being, he becomes a living cipher capable of any form'
      },
    ],
    ultimateAttack: 'Giga Crush Omega - A massive cannon blast that adapts to target resistance',
    synergyPartners: ['jaxon', 'novaknight', 'captainblaze'],
    battleQuotes: [
      'Analyzing threat parameters. Optimal solution locked.',
      'I was built to protect. I choose to fight.',
      'My armor learns. Do you?',
      'Processing victory configuration.',
      'Code Lambda fully activated.'
    ],
    villainMatchups: [
      { villainName: 'The Void King', matchupType: 'neutral', reason: 'Adaptive armor can counter void corruption temporarily' },
      { villainName: 'Echo Kaison', matchupType: 'disadvantage', reason: 'Corrupted version has same tech without ethical constraints' },
      { villainName: 'Entropy Court Generals', matchupType: 'advantage', reason: 'Can exploit their singular combat patterns' }
    ]
  },
  {
    heroId: 'marlo',
    title: 'Beacon of the Multiverse - The Plumber Hero',
    shortBio: 'Master of power-ups, close-quarters combat, and team leadership.',
    extendedBio: 'The legendary hero needs no introduction. With every world he has saved echoing through him, Marlo embodies resilience and pure heroic will. His combat style blends acrobatics, power-ups, elemental punches, and tactical leadership. When fused with Leonardo through the chaos-star, he transcends into the Super Smash Brother.',
    originStory: 'From a humble pipe in an underground kingdom, Marlo rose to become the multiverse\'s greatest legend. He has saved princesses, defeated tyrants, traveled through time itself, and inspired generations of heroes. But his true power lies not in any one ability—it\'s in his unwavering determination to help others. Each power-up he collects isn\'t just a tool; it\'s a promise to someone who believes in him. When the multiverse fractured, Marlo became a beacon, rallying heroes from across shattered worlds. His smile hides untold sorrow for worlds he couldn\'t save, but he never stops fighting for those he can.',
    specialty: 'Balanced offense, utility, combo finishers',
    transformations: [
      { 
        level: 0, 
        name: 'Classic Hero', 
        description: 'Red cap, mustache, ready for adventure', 
        requirements: 'Default', 
        powerMultiplier: 1.0,
        transformationSequence: 'A simple plumber\'s cap and overalls, yet power radiates from his presence—pure, authentic heroism'
      },
      { 
        level: 1, 
        name: 'Star Marlo', 
        description: 'Invincible with star power', 
        requirements: 'Collect Power Star', 
        powerMultiplier: 2.2,
        transformationSequence: 'A celestial star orbits Marlo, his form becomes radiant gold, he gains temporary invincibility, his confidence becomes his armor'
      },
      { 
        level: 2, 
        name: 'Super Smash Brother', 
        description: 'Fused with Leonardo, ultimate power', 
        requirements: 'Chaos-Star Artifact + Legendary Bond', 
        powerMultiplier: 4.5,
        transformationSequence: 'Marlo and Leonardo merge through rainbow light, becoming a singular being of unmatched power and balance, combining all their skills into one unstoppable force'
      },
    ],
    ultimateAttack: 'Galaxy Jump Crush - A world-shaking jump punch that strikes from impossible angles',
    synergyPartners: ['leonardo', 'bubble', 'sparky'],
    battleQuotes: [
      'It\'s-a me, time to save the day!',
      'Let\'s-a go!',
      'I won\'t give up, ever!',
      'Here we go!',
      'One more power-up and victory is mine!'
    ],
    villainMatchups: [
      { villainName: 'The Void King', matchupType: 'neutral', reason: 'His willpower resists void corruption but doesn\'t counter it' },
      { villainName: 'Echo Marlo', matchupType: 'advantage', reason: 'Original legend outmatches corrupted version through experience' },
      { villainName: 'Entropy Court Generals', matchupType: 'advantage', reason: 'His versatility lets him adapt to any strategy' }
    ]
  },
  {
    heroId: 'flynn',
    title: 'The Triforce Champion - Green Tunic Legend',
    shortBio: 'Blade-master with runes, fusions, ancient weapons, and magical counters.',
    extendedBio: 'Hyrule\'s knight wields every tool, rune, blessing, and ancient technique known to his world. He switches effortlessly between bows, shields, elemental blades, fused weapons, and divine magic. His ultimate form taps the full Triforce, radiating celestial authority. Flynn is courage itself.',
    originStory: 'Across countless timelines and ages, the same hero is reborn to face darkness—sometimes as a boy, sometimes as an adult, sometimes transformed into something beyond human. Flynn is the eternal champion of Hyrule, blessed by the golden goddesses themselves. His Triforce of Courage burns brighter than any rune magic because he acts not when victory is assured, but when hope is lost. He has wielded every legendary blade, solved ancient puzzles that twisted reality, and even reversed the flow of time itself. When the multiverse needed a defender, Flynn answered without hesitation—because that is what heroes of courage do.',
    specialty: 'Precision combat, parries, elemental synergy',
    transformations: [
      { 
        level: 0, 
        name: 'Hero of Time', 
        description: 'Green tunic, Master Sword, Hylian Shield', 
        requirements: 'Default', 
        powerMultiplier: 1.0,
        transformationSequence: 'A young man in green emerges, sword drawn, shield raised—timeless and eternal'
      },
      { 
        level: 1, 
        name: 'Fierce Deity', 
        description: 'Ancient warrior mask, devastating power', 
        requirements: 'Collect all masks', 
        powerMultiplier: 2.8,
        transformationSequence: 'The ancient mask descends, transforming Flynn into a towering warrior of divine fury, blue skin glowing with primal magic'
      },
      { 
        level: 2, 
        name: 'Celestial Link', 
        description: 'Full Triforce awakening, god-tier', 
        requirements: 'Unite Triforce pieces + Divine Right', 
        powerMultiplier: 5.2,
        transformationSequence: 'The three golden Triforce pieces converge on Flynn\'s hand, bursting into blinding light—he becomes a being of pure divine authority'
      },
    ],
    ultimateAttack: 'Triforce Judgment - Divine wrath that judges all falsehood',
    synergyPartners: ['novaknight', 'marlo', 'kingspike'],
    battleQuotes: [
      'Courage is my birthright.',
      'For Hyrule, for all worlds!',
      'This will not fail.',
      'The Triforce guides my blade.',
      'I\'ve faced this before—in another time, another life.'
    ],
    villainMatchups: [
      { villainName: 'The Void King', matchupType: 'advantage', reason: 'His divine power directly counters void corruption' },
      { villainName: 'Echo Flynn', matchupType: 'disadvantage', reason: 'Void corruption perverts his greatest strengths' },
      { villainName: 'Entropy Court Generals', matchupType: 'advantage', reason: 'Triforce power crushes entropic forces' }
    ]
  },
  {
    heroId: 'sparky',
    title: 'Herald of the Storm - Thousand Volt Wonder',
    shortBio: 'Small, deadly, and capable of divine lightning once awakened.',
    extendedBio: 'Cute, loyal, and terrifying at full power. Sparky channels divine thunder when the stakes rise, becoming a walking storm front. His bond with his trainer turns him into a battlefield commander disguised as a yellow mouse. Never underestimate the spark that can shatter mountains.',
    originStory: 'Born from a lightning strike that merged two worlds, Sparky inherited a connection to both electricity and the bonds between heroes. His legendary trainer believed in him when no one else did, and that belief awakened ancient thunder within his small frame. Each battle taught Sparky that true power isn\'t measured in size or age—it\'s measured in the will to protect those you love. His Z-Move isn\'t just a technique; it\'s the culmination of his growth, his trust, and his determination to surpass his own limits. When the Void King threatened the multiverse, Sparky was there, because his small heart holds the strength of heroes ten times his size.',
    specialty: 'Burst damage, stun control, partner synergy',
    transformations: [
      { 
        level: 0, 
        name: 'Electric Mouse', 
        description: 'Fast, agile, shocking attacks', 
        requirements: 'Default', 
        powerMultiplier: 1.0,
        transformationSequence: 'A yellow mouse crackles with electric energy, cheeks glowing with power'
      },
      { 
        level: 1, 
        name: 'Z-Move Awakened', 
        description: 'Unleash ultimate electric power', 
        requirements: 'Obtain Z-Crystal', 
        powerMultiplier: 2.6,
        transformationSequence: 'Sparky\'s form becomes wreathed in lightning, the Z-Crystal glows on his chest, he ascends into a divine thunder state'
      },
      { 
        level: 2, 
        name: 'Thunder God Sparky', 
        description: 'Divine lightning incarnate', 
        requirements: 'Legendary Bond achieved + Final Victory', 
        powerMultiplier: 4.9,
        transformationSequence: 'Sparky becomes pure electricity, form expanding to godly proportions, ten million volts of power radiate from every pixel'
      },
    ],
    ultimateAttack: '10,000,000 Volt Thunderbolt - Reality-shattering electrical discharge',
    synergyPartners: ['jaxon', 'marlo', 'bubble'],
    battleQuotes: [
      'Sparky!',
      'Pika Pika!',
      'Let\'s go, I\'ve got this!',
      'Time for a thunderbolt!',
      'My trainer believes in me—and so do I!'
    ],
    villainMatchups: [
      { villainName: 'The Void King', matchupType: 'neutral', reason: 'Lightning can hurt but void is hard to electrify' },
      { villainName: 'Echo Sparky', matchupType: 'disadvantage', reason: 'Void corruption makes his attacks unpredictable' },
      { villainName: 'Entropy Court Generals', matchupType: 'advantage', reason: 'Burst damage overwhelms their defenses' }
    ]
  },
  {
    heroId: 'bubble',
    title: 'Starborn Child of Creation - Pink God',
    shortBio: 'Cute. Dangerous. God-tier mimicry. Can copy abilities and ascend into Starborn form.',
    extendedBio: 'A cosmic anomaly hiding in a pink body. Bubble can copy abilities, devour energy, and ascend into a Starborn god-form capable of splitting planets. His innocence hides unfathomable power. When the universe needs saving, Bubble answers with overwhelming force wrapped in adorable packaging.',
    originStory: 'Bubble wasn\'t born—he simply manifested from the collective dreams of a dying star. As a creature of pure creation energy, he can absorb anything and become it. His innocent demeanor masks an ancient being of unimaginable power. A simple Miracle Fruit awakens the Hypernova within him, but his true god-form emerges only when facing extinction-level threats. Bubble\'s greatest journey isn\'t gaining power—it\'s learning what to do with it. He\'s proven that true strength lies in choosing to remain cute and kind, even when you could be a planet-shattering god. His friendship with Marlo teaches him that the smallest hearts can change infinite worlds.',
    specialty: 'Versatility, copy skills, high-risk/high-reward finishers',
    transformations: [
      { 
        level: 0, 
        name: 'Dream Warrior', 
        description: 'Pink puffball with infinite potential', 
        requirements: 'Default', 
        powerMultiplier: 1.0,
        transformationSequence: 'A pink puff of pure cuteness materializes, glowing softly with inner potential'
      },
      { 
        level: 1, 
        name: 'Hypernova Bubble', 
        description: 'Inhale and devour everything', 
        requirements: 'Miracle Fruit consumed', 
        powerMultiplier: 2.7,
        transformationSequence: 'Bubble\'s form expands, a massive vortex opens, energy swirls around him as he becomes a planetary-scale inhale'
      },
      { 
        level: 2, 
        name: 'Starborn Kirby', 
        description: 'Cosmic god-form, planet-splitting power', 
        requirements: 'Defeat Galactic Nova + Ascension', 
        powerMultiplier: 5.5,
        transformationSequence: 'Bubble transforms into a being of pure star matter, infinite in power, the universe itself trembles at his presence'
      },
    ],
    ultimateAttack: 'Ultra Sword Galaxy - A legendary blade carved from starlight',
    synergyPartners: ['sparky', 'marlo', 'jaxon'],
    battleQuotes: [
      'Poyo!',
      'Looks like I\'m inhaling victory!',
      'Don\'t worry, I\'ll copy that!',
      'Time to get delicious!',
      'Poyo Poyo!'
    ],
    villainMatchups: [
      { villainName: 'The Void King', matchupType: 'advantage', reason: 'Can inhale and contain void corruption' },
      { villainName: 'Echo Bubble', matchupType: 'disadvantage', reason: 'Void corruption inverts his copy ability' },
      { villainName: 'Entropy Court Generals', matchupType: 'advantage', reason: 'Copy ability lets him match and exceed them' }
    ]
  },
  {
    heroId: 'novaknight',
    title: 'The Last Hunter - Bounty Master',
    shortBio: 'Master of ranged dominance, power suits, morph tech, and alien countermeasures.',
    extendedBio: 'A living weapon forged by ancient technology. Nova Knight adapts to every environment with suit modifications, energy counters, morph technology, and destructive arsenal bursts. Her Omega Suit final form is a turning point in the war against the Void King. She is the last of her kind, and the deadliest.',
    originStory: 'Raised as a weapon by the Chozo civilization before their extinction, Nova Knight inherited their greatest creation: the Power Suit. Each generation of her people added to it, making it a perfect synthesis of biological and technological evolution. After a cataclysmic battle where she was the sole survivor, Nova swore to honor her fallen people by using her armor to save others, not destroy them. She has hunted the most dangerous creatures across countless worlds, each hunt teaching her suit new tricks. When corruption infected the multiverse, Nova\'s suit evolved once more—into a form that doesn\'t just hunt threats, but purifies them. She is alone but never lonely, because her suit connects her to the legacy of a thousand heroes.',
    specialty: 'Range control, AoE, tactical utility',
    transformations: [
      { 
        level: 0, 
        name: 'Power Suit', 
        description: 'Pink armor, arm cannon, missiles', 
        requirements: 'Default', 
        powerMultiplier: 1.0,
        transformationSequence: 'Pink armor materializes, weapons systems initialize with defensive readiness'
      },
      { 
        level: 1, 
        name: 'Varia Suit', 
        description: 'Enhanced defense and firepower', 
        requirements: 'Defeat Ridley', 
        powerMultiplier: 2.4,
        transformationSequence: 'Suit reforges into sleeker form, energy channels glow with enhanced power, weapons expand with new modules'
      },
      { 
        level: 2, 
        name: 'Omega Suit', 
        description: 'Voidbreaker armor, reality-piercing beams', 
        requirements: 'Absorb Metroid DNA + Corruption Purged', 
        powerMultiplier: 5.1,
        transformationSequence: 'Golden armor with void-piercing technology emerges, arm cannon becomes a reality-warping weapon, Nova becomes an unstoppable force'
      },
    ],
    ultimateAttack: 'Hyper Beam Annihilation - A planet-vaporizing energy discharge',
    synergyPartners: ['flynn', 'kaison', 'captainblaze'],
    battleQuotes: [
      'Mission accepted.',
      'Target locked. Engaging.',
      'Bounty collected.',
      'All systems optimal. Proceeding.',
      'The hunt ends here.'
    ],
    villainMatchups: [
      { villainName: 'The Void King', matchupType: 'neutral', reason: 'Suit resists corruption but scales equally against void power' },
      { villainName: 'Echo Nova', matchupType: 'advantage', reason: 'Original design outperforms corrupted version' },
      { villainName: 'Entropy Court Generals', matchupType: 'advantage', reason: 'Ranged dominance controls engagement distance' }
    ]
  },
  {
    heroId: 'speedy',
    title: 'The Blue Blur - Chaos Master',
    shortBio: 'Pure speed. Sonic rings. Spin dash. Chaos control mastery.',
    extendedBio: 'The original speedster. Speedy moves faster than sound, collects golden rings for power, and harnesses chaos emeralds to transform. His carefree attitude hides a hero\'s heart willing to risk everything for his friends and freedom.',
    originStory: 'Created by chaos itself, Speedy is the original speedster—the one who taught the multiverse what velocity truly means. His affinity with Chaos Emeralds runs deeper than any other hero, as if he and they are two halves of the same coin. He has raced through centuries, crossed impossible distances, and even achieved momentary godhood through sheer will and chaos force. But Speedy\'s greatest power isn\'t speed—it\'s his refusal to stop fighting for freedom. When others despair, Speedy smiles. When the odds are impossible, he breaks through. His motto is simple: "Gotta go fast," but his meaning runs deep—always push forward, never accept limits, keep moving until victory is won.',
    specialty: 'Speed blitz, ring collection, aerial combat',
    transformations: [
      { 
        level: 0, 
        name: 'Base Speed', 
        description: 'Blue hedgehog, supersonic spin dash', 
        requirements: 'Default', 
        powerMultiplier: 1.0,
        transformationSequence: 'A blue blur materializes, rings orbit his form, supersonic energy crackles around him'
      },
      { 
        level: 1, 
        name: 'Super Speedy', 
        description: 'Golden form, flight, invincibility', 
        requirements: '7 Chaos Emeralds', 
        powerMultiplier: 2.5,
        transformationSequence: 'All seven emeralds merge into Speedy, his form becomes pure golden energy, chaos aura explodes outward in a shockwave'
      },
      { 
        level: 2, 
        name: 'Hyper Speedy', 
        description: 'Rainbow chaos, screen-clearing attacks', 
        requirements: 'Super Emeralds + Super Chaos', 
        powerMultiplier: 5.0,
        transformationSequence: 'Beyond Super—Speedy becomes a vortex of rainbow energy, time bends around him, he becomes faster than causality itself'
      },
    ],
    ultimateAttack: 'Sonic Wind Destroyer - A reality-splitting spin dash',
    synergyPartners: ['jaxon', 'midnight', 'kaison'],
    battleQuotes: [
      'Gotta go fast!',
      'You\'ll never catch me!',
      'Chaos power, let\'s go!',
      'Time to show you real speed!',
      'Rings collected, victory assured!'
    ],
    villainMatchups: [
      { villainName: 'The Void King', matchupType: 'neutral', reason: 'Speed advantage negated by timeless void entity' },
      { villainName: 'Echo Speedy', matchupType: 'neutral', reason: 'Perfect speed mirror—technique decides victor' },
      { villainName: 'Entropy Court Generals', matchupType: 'advantage', reason: 'Speed lets him circle and strike without retaliation' }
    ]
  }
];

// VILLAIN MATCHUP CHART - Shows advantage/disadvantage against major threats
export const VILLAIN_MATCHUP_CHART = {
  'Void King': {
    strongAgainst: ['bubble', 'flynn'],
    weakAgainst: ['jaxon', 'speedy'],
    description: 'Ultimate void entity - stops time, corrupts reality'
  },
  'Echo Jaxon': {
    strongAgainst: ['speedy', 'midnight'],
    weakAgainst: ['kaison', 'novaknight'],
    description: 'Corrupted speedster - unpredictable chaos attacks'
  },
  'Echo Kaison': {
    strongAgainst: ['novaknight', 'captainblaze'],
    weakAgainst: ['jaxon', 'marlo'],
    description: 'Rogue AI - perfected combat algorithms'
  },
  'Entropy Court Generals': {
    strongAgainst: ['sparky', 'speedy'],
    weakAgainst: ['marlo', 'flynn', 'bubble'],
    description: 'Five void generals - each represents different entropy aspect'
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

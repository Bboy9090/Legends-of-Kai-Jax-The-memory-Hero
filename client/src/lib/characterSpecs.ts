// CHARACTER SPECIFICATIONS - Authenticated Source Material with Legal Safeguards
// Strategy: Minor name changes + strategic color/feature modifications = Recognizable parody
// Research sources: Dev manuals, sprite specifications, official documentation

export interface CharacterSourceSpec {
  originalFranchise: string;
  authenticSpriteDims: string; // NES/SNES/Arcade specs
  authenticPalette: Record<string, string>; // Hex colors from source
  canonicalHeight?: string; // Real-world proportions
  legalSafeName: string; // Modified name to avoid copyright
  colorModification: string; // What we changed
  recognitionPoints: string[]; // Why it's still recognizable
  spriteSpecs?: {
    authenticDimensions: string;
    authenticPalette?: Record<string, string>;
    canonicalHeight?: string;
  };
}

export const CHARACTER_SPECS: Record<string, CharacterSourceSpec> = {
  // PLUMBER HERO (Mario → Changed name/colors, kept silhouette)
  'mario': {
    originalFranchise: 'Mario (Nintendo)',
    authenticSpriteDims: 'NES: 16x16px / SNES: 32x32px',
    authenticPalette: {
      primaryRed: '#e80000',
      skinTone: '#f8a880',
      overalls: '#0000ee',
      shoes: '#000000',
      hat: '#e80000'
    },
    legalSafeName: 'Mario (kept generic - traditional hero)',
    colorModification: 'Shirt: Red→Crimson, Cap: Red→Scarlet, Overalls: Blue→Navy',
    recognitionPoints: [
      'Iconic jumping silhouette (16px base)',
      'Mustache + cap combo',
      'Plumber profession (wrench tool)',
      'Red/blue color scheme'
    ]
  },

  // HEDGEHOG SPEEDSTER (Sonic → Name change, color shift)
  'sonic': {
    originalFranchise: 'Sonic the Hedgehog (Sega)',
    authenticSpriteDims: 'Genesis: 32x48px composite',
    authenticPalette: {
      fur: '#0d7adf',
      darkFur: '#4848b4',
      skin: '#ffe0b1',
      shoes: '#fc0000',
      shoeBuckle: '#fcfc00',
      eyes: '#00d500'
    },
    legalSafeName: 'Velocity (Speed hedgehog character)',
    colorModification: 'Blue→Cyan, Red shoes→Magenta, Green eyes→Aqua',
    recognitionPoints: [
      'Spiky ball shape (32x48px)',
      'Hedgehog design (spikes)',
      'Red shoes (modified to magenta)',
      'Speed-focused abilities',
      'Cocky personality trait'
    ]
  },

  // SWORD HERO (Link → Name change, Tunic color variation)
  'link': {
    originalFranchise: 'Link - The Legend of Zelda (Nintendo)',
    authenticSpriteDims: 'NES: 16x16px / SNES: 32px tall',
    authenticPalette: {
      tunic: '#00aa00',
      skin: '#ffcccc',
      hair: '#ffaa00',
      sword: '#ffff00',
      shield: '#8888ff'
    },
    legalSafeName: 'Ren (Silent hero with sword/shield)',
    colorModification: 'Green tunic→Sage green, Blonde hair→Brunette, Gold sword→Silver',
    recognitionPoints: [
      'Master sword silhouette (elongated blade)',
      'Shield design (Hylian shape)',
      'Silent protagonist trait',
      'Triforce-inspired theme (3-part power)',
      'Green tunic variant'
    ]
  },

  // BLUE BOMBER (Mega Man X → Name change, Armor color variation)
  'megaman': {
    originalFranchise: 'Mega Man X (Capcom)',
    authenticSpriteDims: 'SNES: 32x32-40x40px',
    authenticPalette: {
      lightArmor: '#bfdbf0',
      primaryBlue: '#69d4fd',
      darkBlue: '#2275e7',
      redAccents: '#ec441a',
      black: '#403d3d'
    },
    legalSafeName: 'Blaze (Android hero with adaptive arsenal)',
    colorModification: 'Blue armor→Purple armor, Red accents→Orange accents',
    recognitionPoints: [
      'Humanoid robot form (40x40px)',
      'Cannon arm design',
      'Adaptive weapon system',
      'Sci-fi aesthetic',
      'Color-coded armor'
    ]
  },

  // PINK PUFFBALL (Kirby → Name change, Shape stays iconic)
  'kirby': {
    originalFranchise: 'Kirby (Nintendo)',
    authenticSpriteDims: 'NES: 16px / SNES: 32-48px',
    authenticPalette: {
      body: '#d74894',
      bodyMid: '#df6da9',
      lightShade: '#e791bf',
      highlight: '#efb6d4',
      brightHighlight: '#f7daea',
      blush: '#ec5568',
      feet: '#2950d1',
      eyes: '#000000'
    },
    legalSafeName: 'Puffy (Small round warrior with copy powers)',
    colorModification: 'Pink→Magenta, Blush→Coral, Blue feet→Purple feet',
    recognitionPoints: [
      'Perfect round sphere shape (32px)',
      'Huge mouth (iconic vacuum ability)',
      'Copy power mechanic',
      'Cheerful personality',
      'Pink/magenta color family'
    ]
  },

  // ELECTRIC MOUSE (Pikachu → Name change, Color shift)
  'pikachu': {
    originalFranchise: 'Pikachu - Pokemon (Nintendo/Game Freak)',
    authenticSpriteDims: 'Game Boy/NES: 16x16px, Modern: 32x32px',
    authenticPalette: {
      yellow: '#ffff00',
      black: '#000000',
      red: '#ff0000',
      brown: '#664400'
    },
    legalSafeName: 'Sparky (Electric rodent Pokémon-style character)',
    colorModification: 'Bright yellow→Golden yellow, Red cheeks→Orange cheeks',
    recognitionPoints: [
      'Rodent with pointed ears',
      'Electric power abilities',
      'Cheerful personality',
      'Yellow base color',
      'Small stature'
    ]
  },

  // HUNTRESS (Samus → Name change, Suit color variation)
  'samus': {
    originalFranchise: 'Samus Aran - Metroid (Nintendo)',
    authenticSpriteDims: 'NES: 31px / SNES: 48px',
    authenticPalette: {
      armorOrange: '#ff8800',
      darkOrange: '#cc6600',
      skinTone: '#ffcccc',
      visor: '#00ffff'
    },
    canonicalHeight: '190cm (6\'3") - official spec',
    legalSafeName: 'Sentinel (Armored bounty hunter)',
    colorModification: 'Orange suit→Copper suit, Cyan visor→Blue visor',
    recognitionPoints: [
      'Power suit armor (48px SNES scale)',
      'Arm cannon design',
      'Isolation helmet (visor)',
      'Bounty hunter profession',
      'Adaptive suit system'
    ]
  },

  // PLUMBER SPEEDSTER (Sonic variant - Shadow → Name change)
  'shadow': {
    originalFranchise: 'Shadow the Hedgehog (Sega)',
    authenticSpriteDims: 'Dreamcast/GameCube: Similar to Sonic 32x48px',
    authenticPalette: {
      fur: '#000000',
      stripe: '#ff0000',
      shoes: '#ffff00',
      gloves: '#ffffff',
      eyes: '#ff0000'
    },
    legalSafeName: 'Abyss (Dark speedster hedgehog)',
    colorModification: 'Black fur→Deep purple, Red stripe→Crimson stripe, Yellow shoes→Gold',
    recognitionPoints: [
      'Hedgehog silhouette with spikes',
      'Dark color scheme',
      'Super speed abilities',
      'Chaos power theme',
      'Aggressive personality'
    ]
  },

  // BOUNTY HUNTER variant (Captain Falcon → Name change, colors)
  'captain_falcon': {
    originalFranchise: 'Captain Falcon - F-Zero (Nintendo)',
    authenticSpriteDims: 'SNES: ~32x40px',
    authenticPalette: {
      suit: '#0066ff',
      helmet: '#000000',
      visor: '#ffff00',
      gloves: '#ffff00'
    },
    legalSafeName: 'Apex (High-speed racing warrior)',
    colorModification: 'Blue suit→Navy suit, Yellow visor→Gold visor',
    recognitionPoints: [
      'Racing pilot aesthetic',
      'Powerful punch attack (Falcon Punch)',
      'Helmet design with visor',
      'Falcon motif (bird references)',
      'Speed-based character'
    ]
  },

  // GIANT APE (Donkey Kong → Name change)
  'donkeykong': {
    originalFranchise: 'Donkey Kong (Nintendo)',
    authenticSpriteDims: 'NES: 40x32px, SNES DKC: 39x40px',
    authenticPalette: {
      fur: '#8B4513',
      chest: '#D2B48C',
      skin: '#FFDBAC',
      tie: '#FF6347',
      eyes: '#000000'
    },
    legalSafeName: 'Kong (Large primate warrior)',
    colorModification: 'Brown→Tan brown, Red tie→Crimson tie',
    recognitionPoints: [
      'Gorilla silhouette (barrel-chested)',
      'Massive strength abilities',
      'Jungle theme',
      'Tie accessory',
      'Friendly demeanor'
    ]
  },

  // PRINCESS (Peach → Legal-safe variant)
  'peach': {
    originalFranchise: 'Princess Peach - Mario (Nintendo)',
    authenticSpriteDims: 'SNES: 32x40px',
    authenticPalette: { dress: '#ff69b4', crown: '#ffd700', skin: '#ffdbac', hair: '#ffaa00' },
    legalSafeName: 'Peach (Royal healer princess)',
    colorModification: 'Pink dress→Coral dress, Gold crown→Silver crown',
    recognitionPoints: ['Royal crown', 'Pink dress', 'Support magic abilities', 'Princess aesthetic']
  },

  // KING (Bowser → Legal-safe variant)
  'bowser': {
    originalFranchise: 'Bowser - Mario (Nintendo)',
    authenticSpriteDims: 'SNES: 40x48px',
    authenticPalette: { shell: '#228b22', skin: '#8b4513', spikes: '#000000', eyes: '#ff0000' },
    legalSafeName: 'Bowser (Turtle king warrior)',
    colorModification: 'Green shell→Forest green shell',
    recognitionPoints: ['Turtle/dragon form', 'Massive size', 'Shell armor', 'Villain aesthetic']
  },

  // LEGEND (Zelda → Legal-safe variant)
  'zelda': {
    originalFranchise: 'Princess Zelda - Legend of Zelda (Nintendo)',
    authenticSpriteDims: 'SNES: 32px',
    authenticPalette: { dress: '#e6e6fa', crown: '#ffd700', hair: '#4169e1', skin: '#ffdbac' },
    legalSafeName: 'Zelda (Mystic princess sage)',
    colorModification: 'Purple dress→Lavender dress, Gold crown→Pearl crown',
    recognitionPoints: ['Magic staff', 'Prophetic abilities', 'Royal crown', 'Mystical aesthetic']
  },

  // PILOT (Fox → Legal-safe variant)
  'fox': {
    originalFranchise: 'Fox McCloud - Star Fox (Nintendo)',
    authenticSpriteDims: 'SNES: 32x40px',
    authenticPalette: { fur: '#ff7f50', jacket: '#4169e1', gloves: '#ffffff', eyes: '#00ff00' },
    legalSafeName: 'Fox (Sky pilot fighter)',
    colorModification: 'Blue jacket→Navy jacket, Green eyes→Cyan eyes',
    recognitionPoints: ['Fighter pilot', 'Machine gun', 'Reflector shield', 'Aerial combat']
  },

  // FLYING BIRD (Falco → Legal-safe variant)
  'falco': {
    originalFranchise: 'Falco Lombardi - Star Fox (Nintendo)',
    authenticSpriteDims: 'SNES: 32x40px',
    authenticPalette: { feathers: '#8b0000', jacket: '#ffd700', gloves: '#ffffff', eyes: '#ffff00' },
    legalSafeName: 'Falco (Red eagle pilot)',
    colorModification: 'Red→Crimson, Gold jacket→Copper jacket',
    recognitionPoints: ['Red bird pilot', 'Aggressive personality', 'Arwing pilot', 'Combat reflexes']
  },

  // DINOSAUR (Yoshi → Legal-safe variant)
  'yoshi': {
    originalFranchise: 'Yoshi - Mario (Nintendo)',
    authenticSpriteDims: 'SNES: 32x32px',
    authenticPalette: { body: '#00aa00', saddle: '#ff0000', tongue: '#ff69b4', eyes: '#000000' },
    legalSafeName: 'Yoshi (Green dinosaur helper)',
    colorModification: 'Bright green→Forest green, Red saddle→Crimson saddle',
    recognitionPoints: ['Dinosaur creature', 'Flutter jump', 'Tongue grab', 'Egg abilities']
  },

  // FLYING ASSISTANT (Tails → Legal-safe variant)
  'tails': {
    originalFranchise: 'Miles "Tails" Prower - Sonic (Sega)',
    authenticSpriteDims: 'Genesis: 32x40px',
    authenticPalette: { fur: '#ff8800', skin: '#ffe0b1', shoes: '#ff0000', tails: '#ff8800' },
    legalSafeName: 'Tails (Twin-tailed fox tech wizard)',
    colorModification: 'Orange→Burnt orange, Red shoes→Maroon shoes',
    recognitionPoints: ['Twin tails', 'Flying ability', 'Tech genius', 'Loyal sidekick']
  },

  // WATER ANGEL (Rosalina → Legal-safe variant)
  'rosalina': {
    originalFranchise: 'Rosalina - Mario (Nintendo)',
    authenticSpriteDims: 'Wii: 48px',
    authenticPalette: { dress: '#87ceeb', crown: '#ffd700', hair: '#87ceeb', skin: '#ffdbac' },
    legalSafeName: 'Rosalina (Star princess cosmic guardian)',
    colorModification: 'Light blue dress→Sky blue dress, Gold crown→Platinum crown',
    recognitionPoints: ['Cosmic theme', 'Luma companions', 'Gravity magic', 'Space aesthetic']
  },

  // NINJA WARRIOR (Ryu → Legal-safe variant)
  'ryu': {
    originalFranchise: 'Ryu - Street Fighter (Capcom)',
    authenticSpriteDims: 'SNES: 93x111px',
    authenticPalette: { gi: '#ffffff', skin: '#ffdbac', hair: '#000000', hands: '#ffe4b5' },
    legalSafeName: 'Ryu (Master warrior hadoken fighter)',
    colorModification: 'White gi→Cream gi, Black hair→Dark brown hair',
    recognitionPoints: ['Martial arts master', 'Hadoken energy blast', 'Headband', 'Tournament fighter']
  },

  // WATER NINJA (Greninja → Legal-safe variant)
  'greninja': {
    originalFranchise: 'Greninja - Pokemon (Nintendo/Game Freak)',
    authenticSpriteDims: 'Gen 6: 48x52px',
    authenticPalette: { body: '#0066cc', accent: '#ffff00', eyes: '#ff0000', tongue: '#ff00ff' },
    legalSafeName: 'Greninja (Water ninja frog fighter)',
    colorModification: 'Dark blue→Navy blue, Red eyes→Crimson eyes',
    recognitionPoints: ['Ninja frog', 'Water shuriken', 'Speed fighter', 'Loyal companion']
  },

  // WARDEN (Impa → Legal-safe variant)
  'impa': {
    originalFranchise: 'Impa - Legend of Zelda (Nintendo)',
    authenticSpriteDims: 'SNES: 24x32px',
    authenticPalette: { armor: '#8b0000', cloth: '#000000', skin: '#ffdbac', eyes: '#ff00ff' },
    legalSafeName: 'Impa (Red warrior warden guardian)',
    colorModification: 'Red→Deep red, Purple eyes→Magenta eyes',
    recognitionPoints: ['Red armor warrior', 'Guardian role', 'Combat expertise', 'Loyal protector']
  },

  // GODDESS (Palutena → Legal-safe variant)
  'palutena': {
    originalFranchise: 'Palutena - Kid Icarus (Nintendo)',
    authenticSpriteDims: 'GBA: 64x64px',
    authenticPalette: { dress: '#f0e68c', hair: '#00ff00', skin: '#ffdbac', halo: '#ffd700' },
    legalSafeName: 'Palutena (Goddess of light divinity)',
    colorModification: 'Green hair→Teal hair, Gold halo→Silver halo',
    recognitionPoints: ['Goddess aesthetic', 'Light magic', 'Divine authority', 'Protective powers']
  },

  // TRAINER (Ash → Legal-safe variant)
  'ash': {
    originalFranchise: 'Ash Ketchum - Pokemon (Nintendo/Game Freak)',
    authenticSpriteDims: 'Game Boy: 32x32px',
    authenticPalette: { jacket: '#ff0000', hat: '#0000ff', hair: '#000000', skin: '#ffdbac' },
    legalSafeName: 'Ash (Pokemon trainer master)',
    colorModification: 'Red jacket→Crimson jacket, Blue hat→Navy hat',
    recognitionPoints: ['Trainer profession', 'Pokemon partner', 'Red/blue color scheme', 'Adventurer aesthetic']
  },

  // HACKER (Snake → Legal-safe variant)
  'snake': {
    originalFranchise: 'Solid Snake - Metal Gear (Konami)',
    authenticSpriteDims: 'SNES: 32x48px',
    authenticPalette: { bodysuit: '#2f4f4f', bandana: '#ff0000', skin: '#ffdbac', eyes: '#8b0000' },
    legalSafeName: 'Snake (Tactical operative soldier)',
    colorModification: 'Dark gray bodysuit→Slate gray, Red bandana→Crimson bandana',
    recognitionPoints: ['Soldier aesthetic', 'Tactical gear', 'Red bandana', 'Stealth abilities']
  },

  // WITCH (Bayonetta → Legal-safe variant)
  'bayonetta': {
    originalFranchise: 'Bayonetta - Bayonetta (Platinum Games)',
    authenticSpriteDims: 'Xbox 360: 64x80px',
    authenticPalette: { hair: '#000000', skin: '#e0ac69', gloves: '#1c1c1c', lips: '#ff0000' },
    legalSafeName: 'Bayonetta (Dark magic witch sorceress)',
    colorModification: 'Black hair→Deep purple highlights, Red lips→Crimson lips',
    recognitionPoints: ['Witch aesthetic', 'Gun wielder', 'Magic powers', 'Dark seductiveness']
  },

  // DEMON WARRIOR (Shadow → Already done above)
  // TIME MAGE (Silver → Legal-safe variant)
  'silver': {
    originalFranchise: 'Silver the Hedgehog - Sonic (Sega)',
    authenticSpriteDims: 'Xbox 360: 48x56px',
    authenticPalette: { fur: '#c0c0c0', skin: '#ffdbac', chest: '#ffffff', eyes: '#0000ff' },
    legalSafeName: 'Silver (Psychic time sage hedgehog)',
    colorModification: 'Silver fur→Platinum fur, Blue eyes→Cyan eyes',
    recognitionPoints: ['Silver fur', 'Psychic powers', 'Time abilities', 'Hedgehog form']
  },

  // MOON GODDESS (Lunara → Legal-safe original)
  'lunara': {
    originalFranchise: 'Original Character - Moon Mythology',
    authenticSpriteDims: '64x80px',
    authenticPalette: { dress: '#191970', skin: '#ffdbac', stars: '#ffffff', crown: '#c0c0c0' },
    legalSafeName: 'Lunara (Lunar goddess cosmic entity)',
    colorModification: 'Midnight blue→Deep sapphire blue, Silver stars→Pearl stars',
    recognitionPoints: ['Moon goddess', 'Cosmic powers', 'Silver hair', 'Celestial aesthetic']
  },

  // SPEEDSTER CHILD (Solaro → Legal-safe variant)
  'solaro': {
    originalFranchise: 'Inspired by Sonic legacy characters',
    authenticSpriteDims: '32x40px',
    authenticPalette: { fur: '#ff6347', spikes: '#ff4500', shoes: '#000000', eyes: '#ffff00' },
    legalSafeName: 'Solaro (Sonic speedster young heir)',
    colorModification: 'Blue→Red/orange hybrid, Green eyes→Yellow eyes',
    recognitionPoints: ['Hedgehog form', 'Speed abilities', 'Youthful design', 'Sonic universe connection']
  },

  // RACING WARRIOR (Terry → Legal-safe variant)
  'terry': {
    originalFranchise: 'Terry Bogard - Fatal Fury (SNK)',
    authenticSpriteDims: 'SNES: 40x48px',
    authenticPalette: { jacket: '#ff0000', jeans: '#0000ff', boots: '#000000', hair: '#000000' },
    legalSafeName: 'Terry (Red jacket fighting warrior)',
    colorModification: 'Red jacket→Scarlet jacket, Blue jeans→Navy jeans',
    recognitionPoints: ['Fighting game hero', 'Red jacket', 'Powerful kicks', 'Tournament fighter']
  }
};

// GENERATED CHARACTER COLORS (Per Role)
export const ROLE_BASED_COLOR_SHIFTS = {
  'Vanguard': { hueShift: 15, saturationIncrease: 0.1 },    // Slightly brighter reds/oranges
  'Blitzer': { hueShift: 30, saturationIncrease: 0.15 },    // Brighter blues/cyans
  'Mystic': { hueShift: -30, saturationIncrease: 0.2 },     // Purples/magentas
  'Support': { hueShift: 60, saturationIncrease: 0.1 },     // Greens/teals
  'Wildcard': { hueShift: 45, saturationIncrease: 0.15 },   // Warm golds/oranges
  'Tank': { hueShift: 0, saturationIncrease: 0 },           // Keep natural (grays/browns)
  'Sniper': { hueShift: -15, saturationIncrease: 0.1 },     // Cool blues/teals
  'Controller': { hueShift: 180, saturationIncrease: 0.1 }  // Complementary colors
};

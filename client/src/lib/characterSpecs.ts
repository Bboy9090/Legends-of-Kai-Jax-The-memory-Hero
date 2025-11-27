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

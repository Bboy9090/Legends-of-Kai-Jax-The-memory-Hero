/**
 * LOCATIONS & ENVIRONMENTS DATA
 * Documents all districts, arenas, and locations in the Raging City and surrounding world
 */

export interface Location {
  id: string;
  name: string;
  displayName: string;
  region: string;
  description: string;
  lore: string;
  color: string;
  accentColor: string;
  faction?: string;
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  environmentType: 'urban' | 'ruins' | 'underground' | 'shrine' | 'arena' | 'fortress' | 'natural';
  visualThemes: string[];
  enemies?: string[];
  bosses?: string[];
  rewards?: string[];
  coordinates: { x: number; y: number };
}

// ============ THE RAGING CITY DISTRICTS ============

export const ASHBLOCK_HEIGHTS: Location = {
  id: 'ashblock-heights',
  name: 'Ashblock Heights',
  displayName: 'ASHBLOCK HEIGHTS',
  region: 'The Raging City',
  description: 'Rooftop territory ruled by Syndicate Enforcers and heavy war machines',
  lore: 'Once a thriving metropolis, Ashblock Heights has been transformed into a militarized zone by the Fang Syndicate. The rooftops are scorched from aerial combat and hover-tank battles.',
  color: '#f6b94b',
  accentColor: '#ff8c00',
  faction: 'FANG SYNDICATE',
  threatLevel: 'HIGH',
  environmentType: 'urban',
  visualThemes: ['burnt orange', 'industrial metal', 'combat scars', 'syndicate banners'],
  enemies: ['syndicate-enforcer', 'hover-tank', 'aerial-scout'],
  bosses: ['ashen-enforcer'],
  rewards: ['Memory Fragment', 'Syndicate Crest', 'Metal Scrap'],
  coordinates: { x: 26, y: 35 },
};

export const IRONVEIN_WARDS: Location = {
  id: 'ironvein-wards',
  name: 'Ironvein Wards',
  displayName: 'IRONVEIN WARDS',
  region: 'The Raging City',
  description: 'Foundry wards where memory essence is cut, catalogued, and weaponized',
  lore: 'The heart of industrial memory processing. This massive foundry complex is where raw memory essence is extracted from the Rift and converted into weapons and technology. The Anti-Sabertooth Covenant maintains strict control over the forges.',
  color: '#73b7ff',
  accentColor: '#4169e1',
  faction: 'ANTI-SABERTOOTH COVENANT',
  threatLevel: 'HIGH',
  environmentType: 'fortress',
  visualThemes: ['molten blue', 'glowing forge', 'memory crystals', 'mechanical parts'],
  enemies: ['forge-guardian', 'memory-construct', 'covenant-mage'],
  bosses: ['master-smith'],
  rewards: ['Covenant Intel', 'Memory Crystal', 'Forged Weapon'],
  coordinates: { x: 52, y: 42 },
};

export const SKYFALL_SPINES: Location = {
  id: 'skyfall-spines',
  name: 'Skyfall Spines',
  displayName: 'SKYFALL SPINES',
  region: 'The Raging City',
  description: 'Vertical shrine district wrapped around the city\'s living lightning spine',
  lore: 'A mystical district where electricity flows like water. The Memory Cult has built towering spines that pierce the clouds, using the natural lightning as a source of power and communion with the Erasure.',
  color: '#d46cff',
  accentColor: '#ba55d3',
  faction: 'MEMORY CULT',
  threatLevel: 'EXTREME',
  environmentType: 'shrine',
  visualThemes: ['electric purple', 'lightning channels', 'crystalline structures', 'void energy'],
  enemies: ['cult-devotee', 'lightning-sentinel', 'void-echo'],
  bosses: ['cult-prophet', 'lightning-oracle'],
  rewards: ['Royal Memory', 'Erasure Fragment', 'Cult Relic'],
  coordinates: { x: 75, y: 48 },
};

export const SECTOR_7: Location = {
  id: 'sector-7',
  name: 'Sector-7',
  displayName: 'SECTOR-7',
  region: 'The Raging City',
  description: 'Refugee lanes, old tech, and hidden routes beneath the syndicate grid',
  lore: 'The underbelly of the city. Sector-7 is where refugees and rebels hide from syndicate control. Old technology from the pre-Rift era can be found here, alongside makeshift settlements and underground networks.',
  color: '#55e6c1',
  accentColor: '#20b2aa',
  faction: 'INDEPENDENTS',
  threatLevel: 'MEDIUM',
  environmentType: 'underground',
  visualThemes: ['cyan circuits', 'old tech', 'makeshift settlements', 'refugee camps'],
  enemies: ['rogue-survivor', 'scavenger', 'tech-hacker'],
  bosses: ['sector-warlord'],
  rewards: ['Safehouse Key', 'Old Tech', 'Refugee Aid'],
  coordinates: { x: 67, y: 72 },
};

export const STORM_RONIN_SANCTUM: Location = {
  id: 'storm-ronin-sanctum',
  name: 'Storm Ronin Sanctum',
  displayName: 'STORM RONIN SANCTUM',
  region: 'The Raging City',
  description: 'A memory shrine hidden below the old city, guarded by ancestral trials',
  lore: 'Deep beneath the city lies the ancient sanctuary of the Storm Ronin Order. This underground temple is protected by trials that test the worthiness of those who seek its power. The sanctuary preserves memories of the world before the Rift.',
  color: '#d8d8d8',
  accentColor: '#a9a9a9',
  faction: 'RONIN ORDER',
  threatLevel: 'HIGH',
  environmentType: 'underground',
  visualThemes: ['silver stone', 'ancient architecture', 'ancestral shrines', 'memory echoes'],
  enemies: ['ronin-guardian', 'ancestral-spirit', 'trial-sentinel'],
  bosses: ['ronin-master'],
  rewards: ['Storm Seal', 'Ancestral Memory', 'Ronin Wisdom'],
  coordinates: { x: 39, y: 71 },
};

// ============ ADDITIONAL LOCATIONS FROM REFERENCE ART ============

export const HOLLOW_FANG_CATHEDRAL: Location = {
  id: 'hollow-fang-cathedral',
  name: 'Hollow Fang Cathedral',
  displayName: 'HOLLOW FANG CATHEDRAL',
  region: 'Beyond the City',
  description: 'A massive basilica corrupted by Erasure energy, shaped like a great fang',
  lore: 'Once a place of worship, the Hollow Fang has been twisted by Erasure corruption into a monument of chaos. The walls themselves are alive with dark energy.',
  color: '#8b0000',
  accentColor: '#dc143c',
  faction: 'ERASURE INFECTED',
  threatLevel: 'EXTREME',
  environmentType: 'shrine',
  visualThemes: ['void purple', 'corrupted stone', 'dark architecture', 'reality tears'],
  enemies: ['void-cultist', 'corrupted-priest', 'dark-echo'],
  bosses: ['void-cardinal'],
  rewards: ['Erasure Essence', 'Corrupted Relic', 'Dark Knowledge'],
  coordinates: { x: 15, y: 60 },
};

export const FRACTURE_PIT: Location = {
  id: 'fracture-pit',
  name: 'Fracture Pit & Undercity',
  displayName: 'FRACTURE PIT & UNDERCITY',
  region: 'Beneath the City',
  description: 'A massive pit leading to the remains of the old civilization',
  lore: 'A chasm that opens into the depths of the undercity. Here lie the ruins of what came before, buried under layers of time and Erasure corruption. Explorers speak of technology and knowledge lost to the ages.',
  color: '#2f4f4f',
  accentColor: '#696969',
  faction: 'NONE',
  threatLevel: 'HIGH',
  environmentType: 'ruins',
  visualThemes: ['dark stone', 'ancient ruins', 'erosion', 'historical artifacts'],
  enemies: ['ancient-construct', 'undercity-beast', 'rust-guardian'],
  bosses: ['excavator-lord'],
  rewards: ['Ancient Tech', 'Ruins Treasure', 'Lost Artifact'],
  coordinates: { x: 45, y: 85 },
};

export const FANG_SYNDICATE_STRONGHOLD: Location = {
  id: 'fang-syndicate-stronghold',
  name: 'Fang Syndicate Stronghold',
  displayName: 'FANG SYNDICATE STRONGHOLD',
  region: 'The Raging City',
  description: 'Fortress headquarters of the Fang Syndicate military',
  lore: 'A fortress of steel and command authority. This is where the Fang Syndicate coordinates their operations across the city. Heavily fortified with guards and automated defenses.',
  color: '#ff6347',
  accentColor: '#ff4500',
  faction: 'FANG SYNDICATE',
  threatLevel: 'EXTREME',
  environmentType: 'fortress',
  visualThemes: ['military gray', 'red banners', 'fortified walls', 'syndicate symbols'],
  enemies: ['syndicate-captain', 'elite-guard', 'war-machine'],
  bosses: ['syndicate-commander'],
  rewards: ['Commander Insignia', 'Military Intel', 'Syndicate Secrets'],
  coordinates: { x: 10, y: 40 },
};

export const LIBRARY_OF_THREADS: Location = {
  id: 'library-of-threads',
  name: 'Library of Threads',
  displayName: 'LIBRARY OF THREADS',
  region: 'The Raging City',
  description: 'Archive of accumulated knowledge and memory fragments',
  lore: 'A vast repository where all recorded memories are preserved. Scholars and mages study the nature of reality and time here. The Library is neutral ground, though many factions would like to control it.',
  color: '#8b7355',
  accentColor: '#a0826d',
  faction: 'SCHOLARS\' COLLECTIVE',
  threatLevel: 'MEDIUM',
  environmentType: 'fortress',
  visualThemes: ['aged parchment', 'glowing texts', 'shelves of knowledge', 'memory crystals'],
  enemies: ['corrupted-scholar', 'knowledge-thief', 'cipher-guardian'],
  bosses: ['head-archivist'],
  rewards: ['Rare Tome', 'Memory Scroll', 'Scholar\'s Blessing'],
  coordinates: { x: 60, y: 50 },
};

export const CROSS_POINT_ARENA: Location = {
  id: 'cross-point-arena',
  name: 'Cross Point Arena',
  displayName: 'CROSS POINT ARENA',
  region: 'The Raging City',
  description: 'The legendary tournament grounds where fighters test their mettle',
  lore: 'An ancient amphitheater where fighters from across the world once gathered to compete. Now it serves as a battleground for the war against the Erasure. The arena holds echoes of countless battles.',
  color: '#ffd700',
  accentColor: '#ffed4e',
  faction: 'NEUTRAL',
  threatLevel: 'HIGH',
  environmentType: 'arena',
  visualThemes: ['golden sand', 'ancient stone', 'spectator stands', 'magical barriers'],
  enemies: ['arena-champion', 'void-beast', 'corrupted-fighter'],
  bosses: ['arena-tyrant'],
  rewards: ['Champion\'s Belt', 'Arena Token', 'Victory Laurels'],
  coordinates: { x: 50, y: 50 },
};

// ============ LOCATION REGISTRY ============

export const ALL_LOCATIONS: Location[] = [
  ASHBLOCK_HEIGHTS,
  IRONVEIN_WARDS,
  SKYFALL_SPINES,
  SECTOR_7,
  STORM_RONIN_SANCTUM,
  HOLLOW_FANG_CATHEDRAL,
  FRACTURE_PIT,
  FANG_SYNDICATE_STRONGHOLD,
  LIBRARY_OF_THREADS,
  CROSS_POINT_ARENA,
];

export const LOCATION_MAP: Record<string, Location> = {
  'ashblock-heights': ASHBLOCK_HEIGHTS,
  'ironvein-wards': IRONVEIN_WARDS,
  'skyfall-spines': SKYFALL_SPINES,
  'sector-7': SECTOR_7,
  'storm-ronin-sanctum': STORM_RONIN_SANCTUM,
  'hollow-fang-cathedral': HOLLOW_FANG_CATHEDRAL,
  'fracture-pit': FRACTURE_PIT,
  'fang-syndicate-stronghold': FANG_SYNDICATE_STRONGHOLD,
  'library-of-threads': LIBRARY_OF_THREADS,
  'cross-point-arena': CROSS_POINT_ARENA,
};

export function getLocation(locationId: string): Location | undefined {
  return LOCATION_MAP[locationId];
}

export function getLocationsByRegion(region: string): Location[] {
  return ALL_LOCATIONS.filter(loc => loc.region === region);
}

export function getLocationsByFaction(faction: string): Location[] {
  return ALL_LOCATIONS.filter(loc => loc.faction === faction);
}

export function getLocationsByThreatLevel(level: string): Location[] {
  return ALL_LOCATIONS.filter(loc => loc.threatLevel === level);
}

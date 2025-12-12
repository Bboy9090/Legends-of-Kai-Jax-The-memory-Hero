export type AccessoryType = 'hat' | 'glasses' | 'cape' | 'belt' | 'backpack' | 'mask' | 'gloves' | 'boots';

export interface Accessory {
  id: string;
  name: string;
  type: AccessoryType;
  description: string;
  unlockRequirement: number; // Score needed to unlock
  characterCompatible: ('jaxon' | 'kaison' | 'both')[]; // Which characters can wear it
  color?: string;
  emissiveColor?: string;
  emissiveIntensity?: number;
}

export const ACCESSORIES: Accessory[] = [
  // Hats
  {
    id: 'cap_red',
    name: 'Hero Cap',
    type: 'hat',
    description: 'Classic superhero baseball cap',
    unlockRequirement: 0, // Default unlocked
    characterCompatible: ['both'],
    color: '#DC143C',
    emissiveColor: '#FF6B6B',
    emissiveIntensity: 0.3
  },
  {
    id: 'cap_cyan',
    name: 'Speed Cap',
    type: 'hat',
    description: 'Aerodynamic speed cap',
    unlockRequirement: 0,
    characterCompatible: ['both'],
    color: '#00CED1',
    emissiveColor: '#40E0D0',
    emissiveIntensity: 0.3
  },
  {
    id: 'crown_gold',
    name: 'Victory Crown',
    type: 'hat',
    description: 'Crown of champions',
    unlockRequirement: 5000,
    characterCompatible: ['both'],
    color: '#FFD700',
    emissiveColor: '#FFA500',
    emissiveIntensity: 0.6
  },
  
  // Glasses
  {
    id: 'glasses_aviator',
    name: 'Aviator Shades',
    type: 'glasses',
    description: 'Cool pilot sunglasses',
    unlockRequirement: 1000,
    characterCompatible: ['both'],
    color: '#2F4F4F',
    emissiveColor: '#00CED1',
    emissiveIntensity: 0.2
  },
  {
    id: 'glasses_cyber',
    name: 'Cyber Visor',
    type: 'glasses',
    description: 'High-tech scanning visor',
    unlockRequirement: 3000,
    characterCompatible: ['both'],
    color: '#FF6F00',
    emissiveColor: '#00FF00',
    emissiveIntensity: 0.8
  },
  
  // Capes
  {
    id: 'cape_hero',
    name: 'Hero Cape',
    type: 'cape',
    description: 'Classic superhero cape',
    unlockRequirement: 2000,
    characterCompatible: ['both'],
    color: '#DC143C',
    emissiveColor: '#8B008B',
    emissiveIntensity: 0.4
  },
  {
    id: 'cape_speed',
    name: 'Speed Trail Cape',
    type: 'cape',
    description: 'Flowing speed cape',
    unlockRequirement: 2000,
    characterCompatible: ['both'],
    color: '#00CED1',
    emissiveColor: '#FF6F00',
    emissiveIntensity: 0.5
  },
  {
    id: 'cape_wings',
    name: 'Wing Cape',
    type: 'cape',
    description: 'Cape with wing pattern',
    unlockRequirement: 7000,
    characterCompatible: ['both'],
    color: '#FFFFFF',
    emissiveColor: '#FFD700',
    emissiveIntensity: 0.6
  },
  
  // Belts
  {
    id: 'belt_utility',
    name: 'Utility Belt',
    type: 'belt',
    description: 'Belt with gadget pouches',
    unlockRequirement: 500,
    characterCompatible: ['both'],
    color: '#36454F',
    emissiveColor: '#FFD700',
    emissiveIntensity: 0.3
  },
  {
    id: 'belt_energy',
    name: 'Energy Belt',
    type: 'belt',
    description: 'Glowing power belt',
    unlockRequirement: 4000,
    characterCompatible: ['both'],
    color: '#0D0D0D',
    emissiveColor: '#00FF00',
    emissiveIntensity: 0.7
  },
  
  // Backpacks
  {
    id: 'backpack_jetpack',
    name: 'Mini Jetpack',
    type: 'backpack',
    description: 'Compact rocket backpack',
    unlockRequirement: 6000,
    characterCompatible: ['both'],
    color: '#C0C0C0',
    emissiveColor: '#FF6F00',
    emissiveIntensity: 0.8
  },
  
  // Masks
  {
    id: 'mask_hero',
    name: 'Hero Mask',
    type: 'mask',
    description: 'Classic eye mask',
    unlockRequirement: 1500,
    characterCompatible: ['both'],
    color: '#0D0D0D',
    emissiveColor: '#DC143C',
    emissiveIntensity: 0.4
  },
  
  // Special Gloves
  {
    id: 'gloves_power',
    name: 'Power Gauntlets',
    type: 'gloves',
    description: 'Enhanced strength gloves',
    unlockRequirement: 3500,
    characterCompatible: ['jaxon'],
    color: '#0D0D0D',
    emissiveColor: '#DC143C',
    emissiveIntensity: 0.6
  },
  {
    id: 'gloves_speed',
    name: 'Speed Gloves',
    type: 'gloves',
    description: 'Aerodynamic gloves',
    unlockRequirement: 3500,
    characterCompatible: ['kaison'],
    color: '#C0C0C0',
    emissiveColor: '#00CED1',
    emissiveIntensity: 0.6
  },
  
  // Special Boots
  {
    id: 'boots_rocket',
    name: 'Rocket Boots',
    type: 'boots',
    description: 'Boots with boost jets',
    unlockRequirement: 5500,
    characterCompatible: ['both'],
    color: '#DC143C',
    emissiveColor: '#FF6F00',
    emissiveIntensity: 0.7
  },
  {
    id: 'boots_hover',
    name: 'Hover Boots',
    type: 'boots',
    description: 'Anti-gravity boots',
    unlockRequirement: 8000,
    characterCompatible: ['both'],
    color: '#00CED1',
    emissiveColor: '#FFFFFF',
    emissiveIntensity: 0.8
  }
];

export interface EquippedCosmetics {
  hat?: string;
  glasses?: string;
  cape?: string;
  belt?: string;
  backpack?: string;
  mask?: string;
  gloves?: string;
  boots?: string;
}

export const getAccessoryById = (id: string): Accessory | undefined => {
  return ACCESSORIES.find(acc => acc.id === id);
};

export const getAccessoriesByType = (type: AccessoryType): Accessory[] => {
  return ACCESSORIES.filter(acc => acc.type === type);
};

export const getUnlockedAccessories = (highScore: number): Accessory[] => {
  return ACCESSORIES.filter(acc => acc.unlockRequirement <= highScore);
};

export const canEquipAccessory = (accessory: Accessory, character: 'jaxon' | 'kaison'): boolean => {
  return accessory.characterCompatible.includes('both') || 
         accessory.characterCompatible.includes(character);
};

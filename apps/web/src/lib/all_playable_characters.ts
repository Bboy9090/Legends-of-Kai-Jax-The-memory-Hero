/**
 * 🦅 ALL PLAYABLE CHARACTERS - UNIFIED ROSTER
 * 
 * Combines all character systems to make every character playable:
 * - All FIGHTERS from characters.ts
 * - All BEAST_FIGHTERS from beast_characters.ts
 * - All Characters from roster.ts
 * 
 * EVERY CHARACTER IS PLAYABLE!
 */

import { FIGHTERS, Fighter } from './characters';
import { BEAST_FIGHTERS, BeastFighter } from './beast_characters';
import { getAllCharacters, Character } from './roster';

/**
 * Unified playable character interface
 */
export interface PlayableCharacter {
  id: string;
  name: string;
  displayName: string;
  color: string;
  accentColor: string;
  description: string;
  category: string;
  role: string;
  unlocked: boolean;
  source: 'fighter' | 'beast' | 'roster';
}

/**
 * Convert Fighter to PlayableCharacter
 */
function fighterToPlayable(fighter: any): PlayableCharacter {
  return {
    id: fighter.id,
    name: fighter.name,
    displayName: fighter.displayName || fighter.name,
    color: fighter.color || '#1a1a1a',
    accentColor: fighter.accentColor || '#7fff00',
    description: fighter.description || '',
    category: fighter.category || 'hero',
    role: fighter.role || 'hero',
    unlocked: true, // 🦅 ALL PLAYABLE!
    source: 'fighter',
  };
}

/**
 * Convert BeastFighter to PlayableCharacter
 */
function beastFighterToPlayable(beast: BeastFighter): PlayableCharacter {
  return {
    id: beast.id,
    name: beast.name,
    displayName: beast.displayName,
    color: beast.color,
    accentColor: beast.accentColor,
    description: beast.description,
    category: beast.category,
    role: beast.role,
    unlocked: true, // 🦅 ALL PLAYABLE!
    source: 'beast',
  };
}

/**
 * Convert Character to PlayableCharacter
 */
function rosterCharacterToPlayable(char: any): PlayableCharacter {
  return {
    id: char.id,
    name: char.name,
    displayName: char.title ? `${char.name}, ${char.title}` : char.name,
    color: char.primaryColor || '#88d0ff',
    accentColor: char.accentColor || '#ffd700',
    description: char.description || `${char.role || 'Warrior'}`,
    category: (char.role || 'hero').toLowerCase(),
    role: char.role || 'hero',
    unlocked: true, // 🦅 ALL PLAYABLE!
    source: 'roster',
  };
}

/**
 * ALL PLAYABLE CHARACTERS - Complete unified roster
 * Includes all fighters, all beast fighters, and all roster characters
 */
export const ALL_PLAYABLE_CHARACTERS: PlayableCharacter[] = [
  // All FIGHTERS
  ...FIGHTERS.map(fighterToPlayable),
  // All BEAST_FIGHTERS (63 beast-hybrid characters)
  ...BEAST_FIGHTERS.map(beastFighterToPlayable),
  // All roster characters
  ...getAllCharacters().map(rosterCharacterToPlayable),
];

/**
 * Remove duplicates (same ID) - prefer beast fighters over others
 */
const uniqueCharacters = new Map<string, PlayableCharacter>();
ALL_PLAYABLE_CHARACTERS.forEach(char => {
  if (!uniqueCharacters.has(char.id)) {
    uniqueCharacters.set(char.id, char);
  } else {
    // Prefer beast fighters
    if (char.source === 'beast') {
      uniqueCharacters.set(char.id, char);
    }
  }
});

export const UNIQUE_PLAYABLE_CHARACTERS: PlayableCharacter[] = Array.from(uniqueCharacters.values());

/**
 * Get all playable characters
 */
export function getAllPlayableCharacters(): PlayableCharacter[] {
  return UNIQUE_PLAYABLE_CHARACTERS;
}

/**
 * Get playable character by ID
 */
export function getPlayableCharacterById(id: string): PlayableCharacter | undefined {
  return UNIQUE_PLAYABLE_CHARACTERS.find(c => c.id === id);
}

/**
 * Get playable characters by category
 */
export function getPlayableCharactersByCategory(category: string): PlayableCharacter[] {
  return UNIQUE_PLAYABLE_CHARACTERS.filter(c => c.category === category);
}

/**
 * Get playable characters by role
 */
export function getPlayableCharactersByRole(role: string): PlayableCharacter[] {
  return UNIQUE_PLAYABLE_CHARACTERS.filter(c => c.role === role);
}

export const GOLD_SLICE_PLAYABLE_IDS = ["kai-jax", "jaxon", "kaison"] as const;
export type FighterAvailabilityStatus = 'PLAYABLE' | 'PREVIEW' | 'COMING_SOON' | 'LOCKED' | 'HIDDEN' | 'INVALID';

export function getFighterAvailabilityStatus(id: string): FighterAvailabilityStatus {
  if (!id) return 'INVALID';
  const norm = id.toLowerCase().trim().replace(/_/g, "-");
  if (norm === "kai-jax" || norm === "kaijax" || norm === "kai_jax") return 'PLAYABLE';
  if (norm === "jaxon" || norm === "jax") return 'PLAYABLE';
  if (norm === "kaison" || norm === "kai") return 'PLAYABLE';
  return 'PREVIEW';
}

export function isCharacterPlayable(characterId: string): boolean {
  return getFighterAvailabilityStatus(characterId) === 'PLAYABLE';
}

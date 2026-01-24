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
function fighterToPlayable(fighter: Fighter): PlayableCharacter {
  return {
    id: fighter.id,
    name: fighter.name,
    displayName: fighter.displayName,
    color: fighter.color,
    accentColor: fighter.accentColor,
    description: fighter.description,
    category: fighter.category,
    role: fighter.role,
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
function rosterCharacterToPlayable(char: Character): PlayableCharacter {
  return {
    id: char.id,
    name: char.name,
    displayName: `${char.name}, ${char.title}`,
    color: char.primaryColor || '#88d0ff',
    accentColor: char.accentColor || '#ffd700',
    description: `${char.role} from ${char.universe}`,
    category: char.role.toLowerCase(),
    role: char.role,
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

/**
 * Check if character is playable - ALL ARE PLAYABLE!
 */
export function isCharacterPlayable(characterId: string): boolean {
  return true; // 🦅 ALL CHARACTERS PLAYABLE!
}

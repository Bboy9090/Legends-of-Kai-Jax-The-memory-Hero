/**
 * ULTIMATE ENTERTAINMENT ENTERPRISES PRESENTS
 * GLB ANIMATION CONFIGURATION
 * Real animation mappings for all characters
 */

import * as THREE from 'three';

export interface CharacterAnimationConfig {
  idle: string;
  walk: string;
  run: string;
  punch: string;
  kick: string;
  kickHeavy?: string;
  special: string;
  jump: string;
  jumpLand?: string;
  hit: string;
  block?: string;
  dodge?: string;
  victory: string;
  defeat: string;
  taunt?: string;
}

/**
 * Animation name mappings for GLB files
 * Maps standard animation names to actual GLB clip names
 */
export const CHARACTER_ANIMATION_CONFIGS: Record<string, CharacterAnimationConfig> = {
  'kaison': {
    idle: 'Idle',
    walk: 'Walk',
    run: 'Run',
    punch: 'Punch',
    kick: 'Kick',
    kickHeavy: 'KickHeavy',
    special: 'Special',
    jump: 'Jump',
    jumpLand: 'JumpLand',
    hit: 'Hit',
    block: 'Block',
    dodge: 'Dodge',
    victory: 'Victory',
    defeat: 'Defeat',
    taunt: 'Taunt',
  },
  'jaxon': {
    idle: 'Idle',
    walk: 'Walk',
    run: 'Run',
    punch: 'Punch',
    kick: 'Kick',
    kickHeavy: 'KickHeavy',
    special: 'Special',
    jump: 'Jump',
    jumpLand: 'JumpLand',
    hit: 'Hit',
    block: 'Block',
    dodge: 'Dodge',
    victory: 'Victory',
    defeat: 'Defeat',
    taunt: 'Taunt',
  },
  'kai-jax': {
    idle: 'Idle',
    walk: 'Walk',
    run: 'Run',
    punch: 'Punch',
    kick: 'Kick',
    kickHeavy: 'KickHeavy',
    special: 'MemoryEcho',
    jump: 'Jump',
    jumpLand: 'JumpLand',
    hit: 'Hit',
    block: 'Block',
    dodge: 'Dodge',
    victory: 'Victory',
    defeat: 'Defeat',
    taunt: 'Taunt',
  },
  // Add more characters as needed
};

/**
 * Get animation config for character
 */
export function getAnimationConfig(characterId: string): CharacterAnimationConfig {
  return CHARACTER_ANIMATION_CONFIGS[characterId] || CHARACTER_ANIMATION_CONFIGS['kaison'];
}

/**
 * Find matching animation clip by name pattern
 */
export function findAnimationClip(
  clips: THREE.AnimationClip[],
  name: string
): THREE.AnimationClip | undefined {
  // Exact match first
  let clip = clips.find((c) => c.name === name);
  if (clip) return clip;
  
  // Case-insensitive match
  clip = clips.find((c) => c.name.toLowerCase() === name.toLowerCase());
  if (clip) return clip;
  
  // Partial match
  clip = clips.find((c) => c.name.toLowerCase().includes(name.toLowerCase()));
  if (clip) return clip;
  
  // Return first clip as fallback
  return clips[0];
}

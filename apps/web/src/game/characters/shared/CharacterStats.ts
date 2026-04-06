/**
 * Canonical fighter stat / identity types (roster-neutral).
 * Roster arrays live in `lib/characters.ts` until fully migrated.
 */

export type FighterRole = "hero" | "rival" | "boss" | "enemy";

export interface FighterStats {
  power: number;
  speed: number;
  defense: number;
  gravity: number;
}

export interface Fighter {
  id: string;
  name: string;
  displayName: string;
  color: string;
  accentColor: string;
  baseStats?: FighterStats;
  role?: FighterRole;
}

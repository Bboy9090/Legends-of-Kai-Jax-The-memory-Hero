/**
 * Beast roster — hybrid + visual features for AnatomicalBeastModel.
 * Aligned with FIGHTERS (lib/characters.ts) as single source for ids and colors.
 * Design overrides: data/characterDesigns when present.
 */

import { getFighterById } from "../lib/characters";

export interface BeastVisual {
  primaryColor?: string;
  accentColor?: string;
  features?: string[];
}

export interface BeastRosterEntry {
  id: string;
  visual: BeastVisual;
  beastHybrid: string;
}

/** Build roster entry from Fighter + optional overrides. */
function rosterEntry(
  id: string,
  beastHybrid: string,
  features: string[] = []
): BeastRosterEntry {
  const f = getFighterById(id);
  return {
    id,
    visual: {
      primaryColor: f?.color ?? "#1a1a1a",
      accentColor: f?.accentColor ?? "#00f2ff",
      features: features.length ? features : undefined,
    },
    beastHybrid,
  };
}

/**
 * Complete beast roster — all playable heroes, rivals, bosses, and enemies
 * that have 3D representation. Colors derived from FIGHTERS; hybrid/features
 * from design canon.
 */
export const COMPLETE_BEAST_ROSTER: BeastRosterEntry[] = [
  rosterEntry("kai-jax", "sabertooth lion wolf panther", ["three_memory_tails", "charcoal_fur", "internal_nebulae"]),
  rosterEntry("jax", "sabertooth wolf", ["tactical_jacket"]),
  rosterEntry("kai", "sabertooth panther", ["tactical_jacket"]),
  rosterEntry("jaxon", "sabertooth wolf", ["tactical_jacket"]),
  rosterEntry("kaison", "sabertooth panther", ["tactical_jacket"]),
  rosterEntry("kaxon", "sabertooth lion", []),
  rosterEntry("voltage-fang", "sabertooth tiger", ["electric_quills"]),
  rosterEntry("steelwolf", "wolf exosuit", ["armored"]),
  rosterEntry("ashen-tiger", "sabertooth tiger", ["charcoal_fur"]),
  rosterEntry("blazing-fox", "fox vanguard", ["flame_tips"]),
  rosterEntry("velocity", "speed beast", []),
  rosterEntry("sparky", "electric canine", []),
  rosterEntry("sentinel", "armored guardian", []),
  rosterEntry("lunara", "lunar beast", []),
  rosterEntry("solaro", "solar beast", []),
  rosterEntry("blaze", "flame beast", []),
  rosterEntry("abyss", "void beast", []),
  rosterEntry("apex", "apex predator", []),
  rosterEntry("silver", "silver beast", []),
  rosterEntry("marble-gladiator", "stone golem", ["marble"]),
  rosterEntry("granite-colossus", "stone titan", ["granite"]),
  rosterEntry("sandstone-sentinel", "sandstone guardian", ["sandstone"]),
  rosterEntry("hyena-scout", "hyena scout", []),
  rosterEntry("rift-drone", "rift drone", []),
  rosterEntry("malakor", "infernal boss", []),
  rosterEntry("behemoth", "behemoth titan", []),
];

/** Get beast roster entry by fighter id. */
export function getBeastRosterEntry(id: string): BeastRosterEntry | undefined {
  return COMPLETE_BEAST_ROSTER.find((b) => b.id === id);
}

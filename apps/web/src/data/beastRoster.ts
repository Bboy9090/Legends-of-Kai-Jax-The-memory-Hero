/**
 * Beast roster — hybrid + visual features for AnatomicalBeastModel.
 * Canonical design: specs/primary, data/characterDesigns (design overrides when present).
 */

import type { CanonicalLineageId } from "../game/characters/shared/LineageRoster";

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

/** Fusion-line entries (subset of full roster); ids align with `CanonicalLineageId`. */
export const COMPLETE_BEAST_ROSTER: BeastRosterEntry[] = [
  {
    id: "kai-jax" satisfies CanonicalLineageId,
    visual: {
      primaryColor: "#1a1a1a",
      accentColor: "#7fff00",
      features: ["three_memory_tails", "charcoal_fur", "internal_nebulae"],
    },
    beastHybrid: "sabertooth lion wolf panther",
  },
  {
    id: "jaxon" satisfies CanonicalLineageId,
    visual: {
      primaryColor: "#0b1020",
      accentColor: "#5dd9ff",
      features: ["tactical_jacket"],
    },
    beastHybrid: "sabertooth wolf",
  },
  {
    id: "kaison" satisfies CanonicalLineageId,
    visual: {
      primaryColor: "#1a0a0a",
      accentColor: "#ffc233",
      features: ["tactical_jacket"],
    },
    beastHybrid: "sabertooth panther",
  },
];

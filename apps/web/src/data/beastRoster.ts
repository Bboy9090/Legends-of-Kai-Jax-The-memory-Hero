/**
 * Beast roster — hybrid + visual features for AnatomicalBeastModel.
 * Canonical design: specs/primary, data/characterDesigns (design overrides when present).
 */

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

export const COMPLETE_BEAST_ROSTER: BeastRosterEntry[] = [
  {
    id: "kai-jax",
    visual: {
      primaryColor: "#1a1a1a",
      accentColor: "#7fff00",
      features: ["three_memory_tails", "charcoal_fur", "internal_nebulae"],
    },
    beastHybrid: "sabertooth lion wolf panther",
  },
  {
    id: "jaxon",
    visual: {
      primaryColor: "#0b1020",
      accentColor: "#5dd9ff",
      features: ["tactical_jacket"],
    },
    beastHybrid: "sabertooth wolf",
  },
  {
    id: "kaison",
    visual: {
      primaryColor: "#1a0a0a",
      accentColor: "#ffc233",
      features: ["tactical_jacket"],
    },
    beastHybrid: "sabertooth panther",
  },
];

/**
 * ⚡ LEGENDARY CHARACTER ROSTER ⚡
 * Ultimate God-Tier Fighter Database for Legends of Kai-Jax
 * 
 * Each fighter now includes:
 * - Transformation tiers (Base → God Form)
 * - Ultimate abilities
 * - Stat multipliers per tier
 * - Signature moves
 */

import { COMPLETE_BEAST_ROSTER } from "@beast-kin/shared/data/complete_beast_roster";

export interface Fighter {
  id: string;
  name: string;
  displayName: string;
  color: string;
  accentColor: string;
  description: string;
  category: 'heroes' | 'speedsters' | 'warriors' | 'legends';
  unlocked: boolean;
  unlockRequirement?: number;
  // NEW: Legendary Stats
  baseStats: {
    power: number;
    speed: number;
    defense: number;
    gravity: number;
  };
  // NEW: Signature Abilities
  abilities: {
    basic: string[];
    awakened?: string[];
    sage?: string[];
    legendary?: string[];
    god?: string[];
  };
  // NEW: Ultimate Move
  ultimateMove: {
    name: string;
    description: string;
    damage: number;
    resonanceRequired: number;
  };
  // NEW: Voice Lines
  voiceLines?: {
    intro?: string;
    victory?: string;
    defeat?: string;
    transformation?: string[];
    ultimate?: string;
  };
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function roleToCategory(role: string): Fighter["category"] {
  const r = role.toLowerCase();
  if (r.includes("blitzer") || r.includes("speed") || r.includes("assassin")) return "speedsters";
  if (r.includes("tank") || r.includes("bruiser") || r.includes("guardian")) return "warriors";
  if (r.includes("support") || r.includes("controller") || r.includes("oracle")) return "heroes";
  return "legends";
}

function sizeToGravity(size?: string): number {
  switch ((size || "").toLowerCase()) {
    case "small":
      return 8.5;
    case "large":
      return 12.0;
    case "titan":
      return 16.0;
    default:
      return 9.8;
  }
}

function statsFromRole(role: string, size?: string) {
  const r = role.toLowerCase();
  const isFast = r.includes("blitzer") || r.includes("speed") || r.includes("assassin");
  const isTank = r.includes("tank") || r.includes("guardian");
  const isControl = r.includes("controller") || r.includes("oracle") || r.includes("support");

  const base = {
    power: 82,
    speed: 82,
    defense: 82,
    gravity: sizeToGravity(size),
  };

  if (isFast) {
    base.speed = 96;
    base.power = 84;
    base.defense = 72;
  } else if (isTank) {
    base.speed = 68;
    base.power = 92;
    base.defense = 98;
  } else if (isControl) {
    base.speed = 84;
    base.power = 78;
    base.defense = 90;
  }

  // Heavier bodies move a bit slower, hit a bit harder
  const s = (size || "").toLowerCase();
  if (s === "large" || s === "titan") {
    base.speed = clamp(base.speed - 8, 55, 100);
    base.power = clamp(base.power + 6, 60, 100);
    base.defense = clamp(base.defense + 6, 60, 100);
  }

  return base;
}

function beastToFighter(beast: (typeof COMPLETE_BEAST_ROSTER)[number]): Fighter {
  const stats = statsFromRole(beast.role, beast.visual?.size);
  const displayName = `${beast.name}, ${beast.title}`;

  return {
    id: beast.id,
    name: beast.name,
    displayName,
    color: beast.visual?.primaryColor || "#1a1a1a",
    accentColor: beast.visual?.accentColor || "#00f2ff",
    description: beast.description,
    category: roleToCategory(beast.role),
    unlocked: true,
    baseStats: stats,
    abilities: {
      basic: [beast.powers.primary, beast.powers.secondary].filter(Boolean),
      legendary: [beast.powers.ultimate].filter(Boolean),
    },
    ultimateMove: {
      name: beast.powers.ultimate,
      description: `${beast.powers.ultimate} — signature Beast Wars finisher.`,
      damage: clamp(Math.round(stats.power * 0.9), 70, 100),
      resonanceRequired: 100,
    },
    voiceLines: {
      intro: "Forged in the Bronx. Reforged in the wild.",
      victory: "Beast Wars won.",
    },
  };
}

// FULL BEAST WARS ROSTER (all characters free + playable)
const BEAST_WARS_FIGHTERS: Fighter[] = COMPLETE_BEAST_ROSTER.map(beastToFighter);

// Add a few extra legends that live outside the beast roster data file
const EXTRA_LEGENDS: Fighter[] = [
  {
    id: "chronos-sere",
    name: "Chronos Sere",
    displayName: "Chronos Sere, The Extinction Sovereign",
    color: "#4B0082",
    accentColor: "#9370DB",
    description: "Time-wielding warlord from the Collapse. Seeks to end all timelines.",
    category: "legends",
    unlocked: true,
    baseStats: { power: 98, speed: 88, defense: 92, gravity: 14.0 },
    abilities: { basic: ["Extinction-Wave", "Timeline-Rend"], god: ["TOTAL-EXTINCTION"] },
    ultimateMove: { name: "TOTAL EXTINCTION", description: "Erases existence from the timeline.", damage: 98, resonanceRequired: 100 },
  },
  {
    id: "silver",
    name: "Silver",
    displayName: "Silver, The Time Warden",
    color: "#C0C0C0",
    accentColor: "#00E5FF",
    description: "Psychokinetic time-warden who protects the flow of time.",
    category: "legends",
    unlocked: true,
    baseStats: { power: 90, speed: 90, defense: 88, gravity: 9.0 },
    abilities: { basic: ["Psycho-Lift", "Time-Shield"], legendary: ["TEMPORAL-WARDEN"] },
    ultimateMove: { name: "TEMPORAL WARDEN JUDGMENT", description: "Judgment across timelines.", damage: 91, resonanceRequired: 100 },
  },
  {
    id: "voidonus",
    name: "Voidonus Imperion",
    displayName: "Voidonus Imperion, The Void King",
    color: "#0A0A0A",
    accentColor: "#8B00FF",
    description: "The End of All Things. The final boss of the Covenant.",
    category: "legends",
    unlocked: true,
    baseStats: { power: 100, speed: 95, defense: 100, gravity: 20.0 },
    abilities: { basic: ["Void-Slash", "Null-Field"], god: ["THE-END"] },
    ultimateMove: { name: "THE END OF ALL THINGS", description: "Reality erasure.", damage: 100, resonanceRequired: 100 },
  },
];

// Ensure Trinity core shows first in UI
const TRINITY_ORDER = ["kaison", "jaxon", "kai-jax"];

export const FIGHTERS: Fighter[] = [
  ...TRINITY_ORDER.map((id) => BEAST_WARS_FIGHTERS.find((f) => f.id === id)).filter(Boolean) as Fighter[],
  ...BEAST_WARS_FIGHTERS.filter((f) => !TRINITY_ORDER.includes(f.id)),
  ...EXTRA_LEGENDS,
];

export function getFighterById(id: string): Fighter | undefined {
  return FIGHTERS.find(f => f.id === id);
}

export function getUnlockedFighters(): Fighter[] {
  return FIGHTERS.filter(f => f.unlocked);
}

export function getFightersByCategory(category: Fighter['category']): Fighter[] {
  return FIGHTERS.filter(f => f.category === category);
}

export function canUnlockFighter(fighter: Fighter, score: number): boolean {
  if (fighter.unlocked) return false;
  if (!fighter.unlockRequirement) return true;
  return score >= fighter.unlockRequirement;
}

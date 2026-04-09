<<<<<<< Updated upstream
import type { Fighter } from "../game/characters/shared/CharacterStats";
=======
<<<<<<< Current (Your changes)
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
>>>>>>> Stashed changes

export type { Fighter };

<<<<<<< Updated upstream
export const FIGHTERS: Fighter[] = [
=======
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
=======
import type { Fighter } from "../game/characters/shared/CharacterStats";

export type { Fighter };
>>>>>>> Incoming (Background Agent changes)

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
>>>>>>> Stashed changes
  {
    id: "kai-jax",
    name: "KaiJax",
    displayName: "KAI-JAX",
    color: "#1a1a1a",
    accentColor: "#7fff00",
    baseStats: { power: 88, speed: 85, defense: 82, gravity: 9.8 },
    role: "hero",
  },
  {
    id: "jax",
    name: "Jax",
    displayName: "JAX",
    color: "#0a1428",
    accentColor: "#00d4ff",
    baseStats: { power: 80, speed: 90, defense: 75, gravity: 9.8 },
    role: "hero",
  },
  {
    id: "kai",
    name: "Kai",
    displayName: "KAI",
    color: "#1a0808",
    accentColor: "#ff6b00",
    baseStats: { power: 86, speed: 84, defense: 80, gravity: 9.8 },
    role: "hero",
  },
  {
    id: "jaxon",
    name: "Jaxon",
    displayName: "JAXON",
    color: "#0b1020",
    accentColor: "#5dd9ff",
    baseStats: { power: 82, speed: 88, defense: 78, gravity: 9.8 },
    role: "rival",
  },
  {
    id: "kaison",
    name: "Kaison",
    displayName: "KAISON",
    color: "#1a0a0a",
    accentColor: "#ffc233",
    baseStats: { power: 85, speed: 82, defense: 85, gravity: 9.8 },
    role: "rival",
  },
  {
    id: "kaxon",
    name: "Kaxon",
    displayName: "KAXON",
    color: "#0d0d1a",
    accentColor: "#c084fc",
    baseStats: { power: 84, speed: 86, defense: 80, gravity: 9.8 },
    role: "rival",
  },
  {
    id: "voltage-fang",
    name: "VoltageFang",
    displayName: "VOLTAGE FANG",
    color: "#1a1a00",
    accentColor: "#facc15",
    baseStats: { power: 90, speed: 78, defense: 82, gravity: 9.8 },
    role: "boss",
  },
  {
    id: "steelwolf",
    name: "Steelwolf",
    displayName: "STEELWOLF",
    color: "#111118",
    accentColor: "#94a3b8",
    baseStats: { power: 86, speed: 80, defense: 90, gravity: 9.8 },
    role: "boss",
  },
  {
    id: "ashen-tiger",
    name: "AshenTiger",
    displayName: "ASHEN TIGER",
    color: "#1a1008",
    accentColor: "#f97316",
    baseStats: { power: 88, speed: 83, defense: 79, gravity: 9.8 },
    role: "boss",
  },
  {
    id: "blazing-fox",
    name: "BlazingFox",
    displayName: "BLAZING FOX",
    color: "#1a0a00",
    accentColor: "#ef4444",
    baseStats: { power: 83, speed: 87, defense: 76, gravity: 9.8 },
    role: "enemy",
  },
  {
    id: "velocity",
    name: "Velocity",
    displayName: "VELOCITY",
    color: "#0a141e",
    accentColor: "#06b6d4",
    baseStats: { power: 78, speed: 92, defense: 72, gravity: 9.8 },
    role: "enemy",
  },
  {
    id: "sparky",
    name: "Sparky",
    displayName: "SPARKY",
    color: "#1a1800",
    accentColor: "#eab308",
    baseStats: { power: 80, speed: 85, defense: 77, gravity: 9.8 },
    role: "enemy",
  },
  {
    id: "sentinel",
    name: "Sentinel",
    displayName: "SENTINEL",
    color: "#0d1117",
    accentColor: "#6366f1",
    baseStats: { power: 84, speed: 76, defense: 92, gravity: 9.8 },
    role: "enemy",
  },
  {
    id: "lunara",
    name: "Lunara",
    displayName: "LUNARA",
    color: "#0d0a1a",
    accentColor: "#a78bfa",
    baseStats: { power: 82, speed: 84, defense: 80, gravity: 9.8 },
    role: "enemy",
  },
  {
    id: "solaro",
    name: "Solaro",
    displayName: "SOLARO",
    color: "#1a1200",
    accentColor: "#fb923c",
    baseStats: { power: 86, speed: 80, defense: 84, gravity: 9.8 },
    role: "enemy",
  },
  {
    id: "blaze",
    name: "Blaze",
    displayName: "BLAZE",
    color: "#1a0600",
    accentColor: "#dc2626",
    baseStats: { power: 89, speed: 81, defense: 78, gravity: 9.8 },
    role: "enemy",
  },
  {
    id: "abyss",
    name: "Abyss",
    displayName: "ABYSS",
    color: "#050510",
    accentColor: "#7c3aed",
    baseStats: { power: 87, speed: 79, defense: 86, gravity: 9.8 },
    role: "enemy",
  },
  {
    id: "apex",
    name: "Apex",
    displayName: "APEX",
    color: "#0a0a0a",
    accentColor: "#22d3ee",
    baseStats: { power: 91, speed: 82, defense: 81, gravity: 9.8 },
    role: "boss",
  },
  {
    id: "silver",
    name: "Silver",
    displayName: "SILVER",
    color: "#121218",
    accentColor: "#e2e8f0",
    baseStats: { power: 83, speed: 86, defense: 83, gravity: 9.8 },
    role: "enemy",
  },
  {
    id: "marble-gladiator",
    name: "MarbleGladiator",
    displayName: "MARBLE GLADIATOR",
    color: "#e8e0d4",
    accentColor: "#d4c9b8",
    baseStats: { power: 94, speed: 65, defense: 96, gravity: 12.0 },
    role: "boss",
  },
  {
    id: "granite-colossus",
    name: "GraniteColossus",
    displayName: "GRANITE COLOSSUS",
    color: "#3a3a3a",
    accentColor: "#5a7a5a",
    baseStats: { power: 96, speed: 60, defense: 98, gravity: 13.0 },
    role: "boss",
  },
  {
    id: "sandstone-sentinel",
    name: "SandstoneSentinel",
    displayName: "SANDSTONE SENTINEL",
    color: "#8b7355",
    accentColor: "#c4a265",
    baseStats: { power: 90, speed: 72, defense: 92, gravity: 11.5 },
    role: "boss",
  },
  {
    id: "hyena-scout",
    name: "HyenaScout",
    displayName: "HYENA SCOUT",
    color: "#2a1a0a",
    accentColor: "#c4873a",
    baseStats: { power: 65, speed: 88, defense: 55, gravity: 9.8 },
    role: "enemy",
  },
  {
    id: "rift-drone",
    name: "RiftDrone",
    displayName: "RIFT DRONE",
    color: "#0a0a1a",
    accentColor: "#ff4466",
    baseStats: { power: 72, speed: 82, defense: 60, gravity: 9.8 },
    role: "enemy",
  },
  {
    id: "malakor",
    name: "Malakor",
    displayName: "MALAKOR",
    color: "#1a0000",
    accentColor: "#ff2222",
    baseStats: { power: 94, speed: 75, defense: 88, gravity: 10.5 },
    role: "boss",
  },
  {
    id: "behemoth",
    name: "Behemoth",
    displayName: "THE BEHEMOTH",
    color: "#0a0008",
    accentColor: "#9900ff",
    baseStats: { power: 98, speed: 60, defense: 96, gravity: 13.0 },
    role: "boss",
  },
];

export const HERO_FIGHTERS = FIGHTERS.filter((f) => f.role === "hero");
export const ENEMY_FIGHTERS = FIGHTERS.filter((f) => f.role !== "hero");
export const ALL_FIGHTER_IDS = FIGHTERS.map((f) => f.id);

export function getFighterById(id: string): Fighter | null {
  return FIGHTERS.find((f) => f.id === id) ?? null;
}

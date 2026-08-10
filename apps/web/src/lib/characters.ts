import type { Fighter } from "../game/characters/shared/CharacterStats";
const COMPLETE_BEAST_ROSTER: any[] = [];

/**
 * ⚡ LEGENDARY CHARACTER ROSTER ⚡
 * Ultimate God-Tier Fighter Database for Legends of Kai-Jax
 */
export type { Fighter };

// Helper to convert beast to fighter
const beastToFighter = (beast: any): Fighter => ({
  id: beast.id,
  name: beast.name,
  displayName: beast.name.toUpperCase(),
  color: beast.visual?.primaryColor || "#1a1a1a",
  accentColor: beast.visual?.accentColor || "#7fff00",
  baseStats: { 
    power: beast.stats?.power || 80, 
    speed: beast.stats?.speed || 80, 
    defense: beast.stats?.defense || 80, 
    gravity: 9.8 
  },
  role: beast.role || "hero",
});

// FULL BEAST WARS ROSTER
const BEAST_WARS_FIGHTERS: Fighter[] = (COMPLETE_BEAST_ROSTER || []).map(beastToFighter);

// Add extra legends
const EXTRA_LEGENDS: Fighter[] = [
  {
    id: "kaijax",
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
  {
    id: "kaijax",
    name: "KaiJax",
    displayName: "KAI-JAX",
    color: "#1a1a1a",
    accentColor: "#7fff00",
    baseStats: { power: 92, speed: 90, defense: 88, gravity: 9.8 },
    role: "hero",
  },
  {
    id: "borax",
    name: "Borax",
    displayName: "BORAX",
    color: "#d4af37",
    accentColor: "#ffffff",
    baseStats: { power: 94, speed: 82, defense: 95, gravity: 10.5 },
    role: "hero",
  },
  {
    id: "boryn",
    name: "Boryn",
    displayName: "BORYN",
    color: "#1e3a8a",
    accentColor: "#38bdf8",
    baseStats: { power: 88, speed: 94, defense: 80, gravity: 9.8 },
    role: "hero",
  },
  {
    id: "voidonus",
    name: "Voidonus",
    displayName: "VOIDONUS",
    color: "#4c1d95",
    accentColor: "#000000",
    baseStats: { power: 96, speed: 85, defense: 92, gravity: 9.8 },
    role: "boss",
  },
];

const rawFighters = [...EXTRA_LEGENDS, ...BEAST_WARS_FIGHTERS];
const seenFighterIds = new Set<string>();
export const FIGHTERS: Fighter[] = rawFighters.filter((f) => {
  if (!f || !f.id || seenFighterIds.has(f.id)) return false;
  seenFighterIds.add(f.id);
  return true;
});

export const GOLD_SLICE_PLAYABLE_IDS = ["kai-jax", "jaxon", "kaison"] as const;

export const PLAYABLE_FIGHTERS = FIGHTERS.filter((f) => {
  const norm = f.id.toLowerCase().trim().replace(/_/g, "-");
  return norm === "kai-jax" || norm === "kaijax" || norm === "jaxon" || norm === "jax" || norm === "kaison" || norm === "kai";
});

export const HERO_FIGHTERS = PLAYABLE_FIGHTERS;
export const ENEMY_FIGHTERS = FIGHTERS.filter((f) => !GOLD_SLICE_PLAYABLE_IDS.includes(f.id as any));
export const ALL_FIGHTER_IDS = FIGHTERS.map((f) => f.id);

export function getFighterById(id: string): Fighter | null {
  if (!id) return null;
  const norm = id.toLowerCase().trim().replace(/_/g, "-");
  return FIGHTERS.find((f) => f.id === id || f.id.toLowerCase().trim().replace(/_/g, "-") === norm) ?? null;
}

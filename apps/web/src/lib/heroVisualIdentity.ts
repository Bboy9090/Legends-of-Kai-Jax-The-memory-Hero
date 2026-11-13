import { CHARACTER_DATA_MAP } from "./characterStats";
import { MODEL_REGISTRY } from "../assets/modelRegistry";

export type HeroBuild = "slim" | "medium" | "broad" | "small" | "towering";
export type HeroHeadgear =
  | "spikeMane"
  | "stormMane"
  | "fusionMane"
  | "foxEars"
  | "hood"
  | "wildCat"
  | "tigerMane"
  | "lionMane"
  | "crown"
  | "veil"
  | "leaves"
  | "tuft"
  | "visor"
  | "halo";
export type HeroAttachment =
  | "spiderLimbs"
  | "stormTails"
  | "fusionTails"
  | "webBlades"
  | "hourglass"
  | "voltClaws"
  | "tower"
  | "scales"
  | "prophecyScroll"
  | "timeRing"
  | "moonThreads"
  | "sealRing"
  | "vines"
  | "emberSpark"
  | "burrowClaws"
  | "shadeBlade";
export type HeroAuraKind = "venom" | "storm" | "fusion" | "wind" | "time" | "static" | "stone" | "law" | "void" | "veil" | "ward" | "roots" | "ember" | "dust" | "shade";
export type HeroMood = "neutral" | "determined" | "hit" | "triumphant";

export interface HeroVisualIdentity {
  id: string;
  displayName: string;
  faction: string;
  /** Faction rim-light colour (edge glow on silhouette and 3D shader). */
  rimColor: string;
  /** Hero-specific signature colour (aura, weapon glow). */
  primaryColor: string;
  accentColor: string;
  build: HeroBuild;
  headgear: HeroHeadgear;
  attachment: HeroAttachment;
  aura: { kind: HeroAuraKind; intensity: number };
  /** Character Select camera framing so small and towering heroes read equally at phone scale. */
  camera: { position: [number, number, number]; target: [number, number, number]; fov: number };
  subtitle: string;
  traits: [string, string, string];
}

/** One rim colour per faction so factions read at a glance. */
export const FACTION_RIM: Record<string, string> = {
  "UNIFIED RESISTANCE": "#c084fc",
  "STORM RONIN ORDER": "#4f9dff",
  "CHRONOS ORDER": "#e8e1c8",
  "FERAL COLLECTIVE": "#facc15",
  "BLOODLINE PROTECTORS": "#ff8c42",
  "FRACTURE CIRCLE": "#34d399",
};

const FRAMING: Record<HeroBuild, HeroVisualIdentity["camera"]> = {
  slim: { position: [0, 1.4, 4.4], target: [0, 1.2, 0], fov: 32 },
  medium: { position: [0, 1.3, 4.6], target: [0, 1.15, 0], fov: 32 },
  broad: { position: [0, 1.3, 5.2], target: [0, 1.2, 0], fov: 34 },
  small: { position: [0, 0.9, 3.2], target: [0, 0.8, 0], fov: 30 },
  towering: { position: [0, 1.7, 6.0], target: [0, 1.6, 0], fov: 36 },
};

type Spec = Omit<HeroVisualIdentity, "id" | "displayName" | "faction" | "rimColor" | "camera"> & {
  rimOverride?: string;
};

/** Per-hero silhouette design. Kai, Jax and Kai-Jax palettes follow the approved key art. */
const SPECS: Record<string, Spec> = {
  kai: {
    primaryColor: "#8b5cf6", accentColor: "#ff7a1a", build: "slim", headgear: "spikeMane", attachment: "spiderLimbs",
    aura: { kind: "venom", intensity: 0.9 }, subtitle: "MEMORY-WEB HEIR", traits: ["Memory-Web", "Venom Strike", "Rescue Utility"], rimOverride: "#a78bfa",
  },
  jax: {
    primaryColor: "#2f6bff", accentColor: "#9ad1ff", build: "medium", headgear: "stormMane", attachment: "stormTails",
    aura: { kind: "storm", intensity: 1 }, subtitle: "STORM FANG", traits: ["Storm Pressure", "Speed", "Disrupt"], rimOverride: "#4f9dff",
  },
  "kai-jax": {
    primaryColor: "#a855f7", accentColor: "#ff7a1a", build: "broad", headgear: "fusionMane", attachment: "fusionTails",
    aura: { kind: "fusion", intensity: 1.2 }, subtitle: "MEMORY HERO", traits: ["Memory Form", "3 Tails", "Memory Resistance"], rimOverride: "#c084fc",
  },
  kaison: {
    primaryColor: "#22d3ee", accentColor: "#ff6347", build: "slim", headgear: "foxEars", attachment: "webBlades",
    aura: { kind: "wind", intensity: 0.8 }, subtitle: "SWIFT GUARDIAN", traits: ["Fox Dash", "Web Control", "Tactical Gale"],
  },
  silver: {
    primaryColor: "#c0c0c0", accentColor: "#ffd700", build: "medium", headgear: "hood", attachment: "hourglass",
    aura: { kind: "time", intensity: 0.9 }, subtitle: "THE TIME SAGE", traits: ["Time Rewind", "Chrono Haste", "Temporal Anchor"],
  },
  volter: {
    primaryColor: "#facc15", accentColor: "#ff6347", build: "broad", headgear: "wildCat", attachment: "voltClaws",
    aura: { kind: "static", intensity: 1.1 }, subtitle: "THE LIGHTNING BEAST", traits: ["Thunderstrike", "Static Field", "Feral Rampage"],
  },
  boryn: {
    primaryColor: "#ff8c42", accentColor: "#ffd700", build: "towering", headgear: "tigerMane", attachment: "tower",
    aura: { kind: "stone", intensity: 0.8 }, subtitle: "THE SHIELD", traits: ["Protection", "Blood Memory", "Legacy"],
  },
  borax: {
    primaryColor: "#4a90e2", accentColor: "#7cb9ff", build: "broad", headgear: "lionMane", attachment: "scales",
    aura: { kind: "law", intensity: 0.8 }, subtitle: "THE LAW", traits: ["Discipline", "Mentorship", "Authority"],
  },
  vharck: {
    primaryColor: "#9d4edd", accentColor: "#e0aaff", build: "towering", headgear: "crown", attachment: "prophecyScroll",
    aura: { kind: "void", intensity: 0.9 }, subtitle: "THE ELDER FANG", traits: ["Prophecy Strike", "Eldritch Wisdom", "Temporal Teaching"],
  },
  aurelion: {
    primaryColor: "#00d9ff", accentColor: "#ffd60a", build: "slim", headgear: "halo", attachment: "timeRing",
    aura: { kind: "time", intensity: 1 }, subtitle: "THE TIME-BOUND", traits: ["Temporal Slip", "Chrono Beam", "Future Echo"],
  },
  selene: {
    primaryColor: "#7c3aed", accentColor: "#d8b4fe", build: "slim", headgear: "veil", attachment: "moonThreads",
    aura: { kind: "veil", intensity: 0.9 }, subtitle: "THE ORACLE", traits: ["Oracle Vision", "Mystic Veil", "Destiny Touch"],
  },
  miri: {
    primaryColor: "#06b6d4", accentColor: "#a7f3d0", build: "medium", headgear: "visor", attachment: "sealRing",
    aura: { kind: "ward", intensity: 0.8 }, subtitle: "THE SEALED NAME", traits: ["Protective Seal", "Identity Guard", "Consent Boundary"],
  },
  "old-moss": {
    primaryColor: "#10b981", accentColor: "#a7f3d0", build: "towering", headgear: "leaves", attachment: "vines",
    aura: { kind: "roots", intensity: 0.8 }, subtitle: "THE WILDLAND ELDER", traits: ["Root Strike", "Wildland Blessing", "Moss Swarm"],
  },
  rikka: {
    primaryColor: "#f97316", accentColor: "#fbbf24", build: "small", headgear: "tuft", attachment: "emberSpark",
    aura: { kind: "ember", intensity: 1.1 }, subtitle: "THE LITTLE SPARK", traits: ["Spark Sprint", "Inferno Burst", "Flame Tornado"],
  },
  mirek: {
    primaryColor: "#92400e", accentColor: "#d97706", build: "small", headgear: "hood", attachment: "burrowClaws",
    aura: { kind: "dust", intensity: 0.7 }, subtitle: "THE UNDERGUIDE", traits: ["Underground Strike", "Scout's Path", "Tunnel Escape"],
  },
  "sable-nine": {
    primaryColor: "#5b21b6", accentColor: "#c084fc", build: "slim", headgear: "wildCat", attachment: "shadeBlade",
    aura: { kind: "shade", intensity: 1 }, subtitle: "THE RIVAL SHADE", traits: ["Shadow Strike", "Prophecy Sight", "Rival's Edge"],
  },
};

const ALIASES: Record<string, string> = { jaxon: "jax", kaijax: "kai-jax", kai_jax: "kai-jax", "old_moss": "old-moss", sable_nine: "sable-nine" };

export function normalizeHeroId(id: string): string {
  const lower = id.toLowerCase();
  return ALIASES[lower] ?? lower;
}

function build(id: string): HeroVisualIdentity {
  const spec = SPECS[id];
  const data = CHARACTER_DATA_MAP[id];
  const faction = data?.faction ?? (id === "kai" ? "UNIFIED RESISTANCE" : "FRACTURE CIRCLE");
  const { rimOverride, ...rest } = spec;
  return {
    id,
    displayName: data?.displayName ?? id.toUpperCase(),
    faction,
    rimColor: rimOverride ?? FACTION_RIM[faction] ?? "#ffffff",
    camera: FRAMING[spec.build],
    ...rest,
  };
}

/** Roster order: the three story leads first, then mentors, then the rest. */
export const HERO_ORDER = [
  "boryn", "kai", "jax", "kai-jax", "borax",
  "kaison", "silver", "volter", "vharck", "aurelion", "selene", "miri", "old-moss", "rikka", "mirek", "sable-nine",
] as const;

export const HERO_IDENTITIES: Record<string, HeroVisualIdentity> = Object.fromEntries(
  HERO_ORDER.map((id) => [id, build(id)]),
);

export function getHeroIdentity(id: string): HeroVisualIdentity | undefined {
  return HERO_IDENTITIES[normalizeHeroId(id)];
}

/** Heroes with a registered 3D model can be taken into battle; the rest are data-only until models ship. */
export function hasBattleModel(id: string): boolean {
  return Boolean((MODEL_REGISTRY as Record<string, unknown>)[normalizeHeroId(id)]);
}

export function getHeroModelPath(id: string): string | null {
  const entry = (MODEL_REGISTRY as Record<string, { path?: string }>)[normalizeHeroId(id)];
  return entry?.path ?? null;
}

/** Portrait mood for a dialogue line; maps the authored emotion to the four portrait states. */
export function moodFromEmotion(emotion?: string): HeroMood {
  switch (emotion) {
    case "angry":
    case "determined":
      return "determined";
    case "sad":
    case "hit":
      return "hit";
    case "happy":
    case "triumphant":
      return "triumphant";
    default:
      return "neutral";
  }
}

/** Resolve a speaker label ("Kai-Jax", "Jaxon", "Silver"...) to a hero identity, if it is one. */
export function identityForSpeaker(speaker: string): HeroVisualIdentity | undefined {
  const key = speaker.toLowerCase().replace(/\s+zenith$/, "").replace(/\s+/g, "-");
  return getHeroIdentity(key);
}

/**
 * Reusable open-world encounter definitions (district-based, deterministic spawns).
 * Canon-first: data-only; no gameplay side effects here.
 */

import type { AdventureEnemy } from "./stores/useAdventure";
import type { CampaignNodeId } from "./stores/useRunner";
import { ENEMY_TIERS } from "./combatSystems";

export interface EncounterSpec {
  id: string;
  label: string;
  /** Number of minion slots (boss appended when includeBoss) */
  minionCount: number;
  includeBoss: boolean;
  /** Tier scaling added per encounter index within district */
  tierScale: number;
}

export interface DistrictRoamMeta {
  id: CampaignNodeId;
  name: string;
  theme: string;
  /** Scripted encounters in order (replaces pure wave-loop for this district) */
  encounters: EncounterSpec[];
  /** One-time patrol clear reward (granted via missions store; score = xp + currency) */
  rewards: { xp: number; currency: number };
}

const MINION_POOL = ["hyena-scout", "rift-drone", "blazing-fox", "sparky", "velocity"] as const;

/** Deterministic "random" unit in [0,1) from integers (platform-agnostic). */
export function det01(a: number, b: number): number {
  const x = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function pickMinionId(encounterIdx: number, i: number): string {
  const idx = Math.floor(det01(encounterIdx, i) * MINION_POOL.length) % MINION_POOL.length;
  return MINION_POOL[idx];
}

export const DISTRICTS: Record<Exclude<CampaignNodeId, "start" | "mid-boss" | "final-boss">, DistrictRoamMeta> = {
  "district-1": {
    id: "district-1",
    name: "Ashblock Heights",
    theme: "Industrial outskirts — scout packs and rooftop strays.",
    rewards: { xp: 120, currency: 35 },
    encounters: [
      { id: "d1-e1", label: "Street sweep", minionCount: 2, includeBoss: false, tierScale: 0 },
      { id: "d1-e2", label: "Alley ambush", minionCount: 3, includeBoss: false, tierScale: 1 },
      { id: "d1-e3", label: "Block captain", minionCount: 2, includeBoss: true, tierScale: 2 },
    ],
  },
  "district-2": {
    id: "district-2",
    name: "Fangforge Wastes",
    theme: "Ash storms and beast trails — heavier packs.",
    rewards: { xp: 160, currency: 50 },
    encounters: [
      { id: "d2-e1", label: "Dust patrol", minionCount: 3, includeBoss: false, tierScale: 1 },
      { id: "d2-e2", label: "Hunter pair", minionCount: 4, includeBoss: false, tierScale: 2 },
      { id: "d2-e3", label: "Forge warden", minionCount: 3, includeBoss: true, tierScale: 3 },
    ],
  },
  "district-3": {
    id: "district-3",
    name: "Memory Wells",
    theme: "Unstable ground — echo creatures cluster tight.",
    rewards: { xp: 200, currency: 65 },
    encounters: [
      { id: "d3-e1", label: "Echo skirmish", minionCount: 3, includeBoss: false, tierScale: 2 },
      { id: "d3-e2", label: "Well breach", minionCount: 4, includeBoss: false, tierScale: 3 },
      { id: "d3-e3", label: "Keeper duel", minionCount: 2, includeBoss: true, tierScale: 4 },
    ],
  },
  "district-4": {
    id: "district-4",
    name: "Rift Undercroft",
    theme: "Tight tunnels — fewer but tougher foes.",
    rewards: { xp: 240, currency: 80 },
    encounters: [
      { id: "d4-e1", label: "Under patrol", minionCount: 3, includeBoss: false, tierScale: 3 },
      { id: "d4-e2", label: "Collapsed arena", minionCount: 4, includeBoss: false, tierScale: 4 },
      { id: "d4-e3", label: "Sub-boss", minionCount: 2, includeBoss: true, tierScale: 5 },
    ],
  },
  "district-5": {
    id: "district-5",
    name: "Crown Spire Approach",
    theme: "Elite lines before the final ascent.",
    rewards: { xp: 300, currency: 100 },
    encounters: [
      { id: "d5-e1", label: "Elite line", minionCount: 4, includeBoss: false, tierScale: 4 },
      { id: "d5-e2", label: "Spire guard", minionCount: 4, includeBoss: false, tierScale: 5 },
      { id: "d5-e3", label: "Approach champion", minionCount: 3, includeBoss: true, tierScale: 6 },
    ],
  },
};

export function getDistrictMeta(id: CampaignNodeId): DistrictRoamMeta | null {
  if (id === "start" || id === "mid-boss" || id === "final-boss") return null;
  return DISTRICTS[id] ?? null;
}

export interface BuildEncounterOptions {
  districtId: CampaignNodeId;
  encounterIndex: number;
  spec: EncounterSpec;
}

/**
 * Build enemy list for one encounter. Positions are deterministic from indices.
 */
export function buildEncounterEnemies(opts: BuildEncounterOptions): AdventureEnemy[] {
  const { districtId, encounterIndex, spec } = opts;
  const waveScale = spec.tierScale + encounterIndex;
  const out: AdventureEnemy[] = [];
  const baseRadius = 14 + encounterIndex * 2;

  for (let i = 0; i < spec.minionCount; i++) {
    const t = i / Math.max(1, spec.minionCount);
    const angle = t * Math.PI * 2 + det01(encounterIndex, i * 3) * 0.4;
    const dist = baseRadius + det01(districtId.length, i) * 8;
    const tier = (waveScale >= 4 ? "minion2" : "minion1") as AdventureEnemy["tier"];
    const cfg = ENEMY_TIERS[tier];
    const hp = cfg.health + waveScale * 10;
    const fighterId = pickMinionId(encounterIndex, i);
    out.push({
      id: `${districtId}-${spec.id}-m${i}`,
      fighterId,
      tier,
      posX: Math.cos(angle) * dist,
      posY: 0,
      posZ: Math.sin(angle) * dist,
      rotY: 0,
      health: hp,
      maxHealth: hp,
      isAggro: false,
      isAttacking: false,
      isDead: false,
      aiState: "idle",
      telegraphTimer: 0,
      patrolTargetX: Math.cos(angle) * dist * 0.9,
      patrolTargetZ: Math.sin(angle) * dist * 0.9,
      stunTimer: 0,
    });
  }

  if (spec.includeBoss) {
    const bossTier = (waveScale >= 6 ? "boss2" : "boss1") as AdventureEnemy["tier"];
    const bossCfg = ENEMY_TIERS[bossTier];
    const bossIds = ["malakor", "behemoth"];
    const bossFighter = bossIds[encounterIndex % bossIds.length];
    const ba = det01(encounterIndex + 9, 1) * Math.PI * 2;
    const bd = 20 + det01(encounterIndex, 7) * 4;
    const bhp = bossCfg.health + waveScale * 18;
    out.push({
      id: `${districtId}-${spec.id}-boss`,
      fighterId: bossFighter,
      tier: bossTier,
      posX: Math.cos(ba) * bd,
      posY: 0,
      posZ: Math.sin(ba) * bd,
      rotY: 0,
      health: bhp,
      maxHealth: bhp,
      isAggro: false,
      isAttacking: false,
      isDead: false,
      aiState: "idle",
      telegraphTimer: 0,
      patrolTargetX: Math.cos(ba) * bd * 0.85,
      patrolTargetZ: Math.sin(ba) * bd * 0.85,
      stunTimer: 0,
    });
  }

  return out;
}

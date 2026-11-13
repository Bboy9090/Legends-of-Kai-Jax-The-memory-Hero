/**
 * Data-driven boss tuning and the two-phase encounter state machine.
 *
 * Boss configs are keyed by mission id because several boss models are reused across acts
 * (void-stalker, synergy-hunter, rift-general-prime, well-defiler, voidonus-imperion); each
 * mission gets its own HP, scale, tint and VFX so repeats look and fight differently.
 */

export type BossAuraKind = "embers" | "static" | "frost" | "void" | "roots" | "sunfire" | "memory" | "stone" | "shade" | "fusion";
export type BossWeaponKind = "blade" | "mace" | "orb" | "claws" | "none";

export interface BossConfig {
  missionId: string;
  displayName: string;
  fighterId: string;
  maxHealth: number;
  tier: "boss1" | "boss2";
  /** Visual scale multiplier applied on top of the normalised model height. */
  scale: number;
  /** Emissive rim-light tint applied to the boss materials. */
  tint: string;
  aura: { kind: BossAuraKind; color: string; intensity: number };
  weapon: { kind: BossWeaponKind; color: string };
  heavy: {
    damage: number;
    radius: number;
    /** Visual warning shown before the heavy attack lands. */
    telegraphSec: number;
    firstDelaySec: number;
    cooldownSec: number;
    counterOnHitSec: number;
    counterOnWhiffSec: number;
  };
}

const HEAVY_TELEGRAPH_SEC = 1.2;
export const PHASE_TRANSITION_HP_PCT = 0.5;
export const PHASE_ROAR_SEC = 1.1;
/** Extra damage taken while the counter window is open. */
export const COUNTER_DAMAGE_MULTIPLIER = 1.5;

interface Row {
  id: string; name: string; fighter: string; hp: number; scale: number; tint: string;
  aura: BossAuraKind; auraColor: string; weapon: BossWeaponKind; weaponColor: string; heavy: number; radius: number;
}

// HP climbs monotonically across the campaign: 600 (Act I) to 4,500 (Act IX finale).
const ROWS: Row[] = [
  { id: "story_act1_m4", name: "Void Stalker", fighter: "void-stalker", hp: 600, scale: 1.0, tint: "#7c3aed", aura: "void", auraColor: "#a78bfa", weapon: "claws", weaponColor: "#c4b5fd", heavy: 18, radius: 3.6 },
  { id: "story_act1_m5", name: "Rift General Valos", fighter: "rift-general", hp: 1200, scale: 1.15, tint: "#ef4444", aura: "embers", auraColor: "#fb923c", weapon: "blade", weaponColor: "#f87171", heavy: 20, radius: 4.0 },
  { id: "story_act2_m7", name: "The Third Voice", fighter: "synergy-hunter", hp: 1500, scale: 1.05, tint: "#22d3ee", aura: "static", auraColor: "#67e8f9", weapon: "orb", weaponColor: "#22d3ee", heavy: 22, radius: 4.0 },
  { id: "story_act2_m10", name: "Well-Defiler", fighter: "well-defiler", hp: 1900, scale: 1.2, tint: "#10b981", aura: "memory", auraColor: "#6ee7b7", weapon: "orb", weaponColor: "#34d399", heavy: 24, radius: 4.2 },
  { id: "story_act3_m12", name: "Rift General Prime", fighter: "rift-general-prime", hp: 2300, scale: 1.3, tint: "#f59e0b", aura: "sunfire", auraColor: "#fbbf24", weapon: "blade", weaponColor: "#fcd34d", heavy: 26, radius: 4.4 },
  { id: "story_act3_m14", name: "Hollow Architect", fighter: "voidonus-imperion", hp: 2800, scale: 1.45, tint: "#a855f7", aura: "void", auraColor: "#d8b4fe", weapon: "blade", weaponColor: "#e879f9", heavy: 28, radius: 4.8 },
  { id: "story_act4_m20", name: "Rift Warden", fighter: "rift-warden", hp: 2900, scale: 1.25, tint: "#38bdf8", aura: "frost", auraColor: "#7dd3fc", weapon: "mace", weaponColor: "#bae6fd", heavy: 28, radius: 4.4 },
  { id: "story_act5_m23", name: "Marble Gladiator", fighter: "marble-gladiator", hp: 3000, scale: 1.2, tint: "#e5e7eb", aura: "stone", auraColor: "#f3f4f6", weapon: "blade", weaponColor: "#e5e7eb", heavy: 30, radius: 4.2 },
  { id: "story_act5_m25", name: "Granite Colossus", fighter: "granite-colossus", hp: 3300, scale: 1.5, tint: "#9ca3af", aura: "stone", auraColor: "#d1d5db", weapon: "mace", weaponColor: "#9ca3af", heavy: 32, radius: 5.0 },
  { id: "story_act6_m29", name: "Sable's Shade", fighter: "void-stalker", hp: 3400, scale: 0.95, tint: "#5b21b6", aura: "shade", auraColor: "#8b5cf6", weapon: "claws", weaponColor: "#7c3aed", heavy: 30, radius: 3.8 },
  { id: "story_act6_m30", name: "Echo of Kai-Jax", fighter: "synergy-hunter", hp: 3600, scale: 1.15, tint: "#c084fc", aura: "fusion", auraColor: "#ff7a1a", weapon: "orb", weaponColor: "#a855f7", heavy: 32, radius: 4.4 },
  { id: "story_act7_m35", name: "Throne Warden", fighter: "rift-general-prime", hp: 3900, scale: 1.4, tint: "#fbbf24", aura: "sunfire", auraColor: "#fde68a", weapon: "mace", weaponColor: "#fbbf24", heavy: 34, radius: 4.8 },
  { id: "story_act8_m37", name: "Jade Serpent", fighter: "jade-serpent", hp: 4000, scale: 1.3, tint: "#34d399", aura: "roots", auraColor: "#6ee7b7", weapon: "claws", weaponColor: "#34d399", heavy: 34, radius: 4.6 },
  { id: "story_act8_m38", name: "Frost Wolf", fighter: "frost-wolf", hp: 4100, scale: 1.25, tint: "#7dd3fc", aura: "frost", auraColor: "#bae6fd", weapon: "claws", weaponColor: "#e0f2fe", heavy: 35, radius: 4.4 },
  { id: "story_act8_m39", name: "Thunder Lion", fighter: "thunder-lion", hp: 4250, scale: 1.35, tint: "#facc15", aura: "static", auraColor: "#fde047", weapon: "claws", weaponColor: "#facc15", heavy: 36, radius: 4.6 },
  { id: "story_act8_m40", name: "Earth Turtle", fighter: "earth-turtle", hp: 4350, scale: 1.45, tint: "#a16207", aura: "stone", auraColor: "#ca8a04", weapon: "mace", weaponColor: "#a16207", heavy: 38, radius: 5.2 },
  { id: "story_act9_m43", name: "The First Wound", fighter: "well-defiler", hp: 4400, scale: 1.35, tint: "#f43f5e", aura: "memory", auraColor: "#fb7185", weapon: "orb", weaponColor: "#f43f5e", heavy: 38, radius: 4.8 },
  { id: "story_act9_m44", name: "The Last Memory", fighter: "voidonus-imperion", hp: 4500, scale: 1.6, tint: "#e879f9", aura: "fusion", auraColor: "#f0abfc", weapon: "blade", weaponColor: "#f0abfc", heavy: 40, radius: 5.4 },
];

export const BOSS_CONFIG_MAP: Record<string, BossConfig> = Object.fromEntries(
  ROWS.map((r) => [
    r.id,
    {
      missionId: r.id,
      displayName: r.name,
      fighterId: r.fighter,
      maxHealth: r.hp,
      // boss2 hits harder and slower; reserved for the heavyweight fights.
      tier: r.hp >= 2500 || r.id === "story_act1_m5" ? "boss2" : "boss1",
      scale: r.scale,
      tint: r.tint,
      aura: { kind: r.aura, color: r.auraColor, intensity: 0.7 + Math.min(0.8, r.hp / 6000) },
      weapon: { kind: r.weapon, color: r.weaponColor },
      heavy: {
        damage: r.heavy,
        radius: r.radius,
        telegraphSec: HEAVY_TELEGRAPH_SEC,
        firstDelaySec: 2.0,
        cooldownSec: 6.5,
        counterOnHitSec: 1.2,
        counterOnWhiffSec: 2.0,
      },
    } satisfies BossConfig,
  ]),
);

/** Fallback for any boss mission that has no explicit entry, scaled from mission difficulty. */
export function getBossConfig(missionId: string, bossFighterId?: string, difficulty = 5): BossConfig | undefined {
  const explicit = BOSS_CONFIG_MAP[missionId];
  if (explicit) return explicit;
  if (!bossFighterId) return undefined;
  const hp = 500 + difficulty * 100;
  return {
    missionId,
    displayName: bossFighterId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    fighterId: bossFighterId,
    maxHealth: hp,
    tier: "boss1",
    scale: 1.1,
    tint: "#ef4444",
    aura: { kind: "embers", color: "#fb923c", intensity: 0.8 },
    weapon: { kind: "none", color: "#ffffff" },
    heavy: { damage: 20, radius: 4, telegraphSec: HEAVY_TELEGRAPH_SEC, firstDelaySec: 2.0, cooldownSec: 6.5, counterOnHitSec: 1.2, counterOnWhiffSec: 2.0 },
  };
}

// ---------------------------------------------------------------------------
// Encounter state machine (pure: no store, no timers, no rendering).
// ---------------------------------------------------------------------------

export type HeavyStage = "locked" | "cooldown" | "telegraph" | "counter";

export interface BossEncounterState {
  phase: 1 | 2;
  /** Seconds left in the phase-transition roar; the boss is frozen while this is above zero. */
  roarRemaining: number;
  heavy: HeavyStage;
  /** Seconds remaining in the current heavy sub-stage. */
  timer: number;
}

export type BossEvent = "roar" | "telegraphStart" | "heavyImpact" | "heavyHit" | "heavyWhiff" | "counterOpen" | "counterClose";

export interface BossStepInput {
  dt: number;
  /** Current boss HP as a 0..1 fraction. */
  hpPct: number;
  /** Planar distance from the player to the boss. */
  playerDistance: number;
  /** True while the player has i-frames (dodge / post-hit invulnerability). */
  playerInvulnerable: boolean;
  bossAggro: boolean;
}

export function createBossEncounterState(): BossEncounterState {
  return { phase: 1, roarRemaining: 0, heavy: "locked", timer: 0 };
}

export function stepBossEncounter(
  state: BossEncounterState,
  config: BossConfig,
  input: BossStepInput,
): { state: BossEncounterState; events: BossEvent[] } {
  const events: BossEvent[] = [];
  let next: BossEncounterState = { ...state };
  const dt = Math.max(0, input.dt);

  if (next.phase === 1 && input.hpPct <= PHASE_TRANSITION_HP_PCT && input.hpPct > 0) {
    next = { phase: 2, roarRemaining: PHASE_ROAR_SEC, heavy: "cooldown", timer: PHASE_ROAR_SEC + config.heavy.firstDelaySec };
    events.push("roar");
    return { state: next, events };
  }

  if (next.phase === 1) return { state: next, events };

  if (next.roarRemaining > 0) {
    next.roarRemaining = Math.max(0, next.roarRemaining - dt);
    next.timer = Math.max(0, next.timer - dt);
    return { state: next, events };
  }

  next.timer = Math.max(0, next.timer - dt);

  switch (next.heavy) {
    case "cooldown":
      if (next.timer <= 0 && input.bossAggro) {
        next.heavy = "telegraph";
        next.timer = config.heavy.telegraphSec;
        events.push("telegraphStart");
      }
      break;
    case "telegraph":
      if (next.timer <= 0) {
        const hit = input.playerDistance <= config.heavy.radius && !input.playerInvulnerable;
        events.push("heavyImpact", hit ? "heavyHit" : "heavyWhiff");
        next.heavy = "counter";
        next.timer = hit ? config.heavy.counterOnHitSec : config.heavy.counterOnWhiffSec;
        events.push("counterOpen");
      }
      break;
    case "counter":
      if (next.timer <= 0) {
        next.heavy = "cooldown";
        next.timer = config.heavy.cooldownSec;
        events.push("counterClose");
      }
      break;
    default:
      break;
  }

  return { state: next, events };
}

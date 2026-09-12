export type VersusFaction =
  | "core"
  | "first-sabertooths"
  | "bloodward-antagonist"
  | "ancient-antagonist"
  | "engineered-horror";

export type VersusRole = "hero" | "ally" | "villain" | "boss";

export interface VersusRosterEntry {
  /** Stable public ID used by Fighter Select, saves, unlocks, and match records. */
  id: string;
  displayName: string;
  faction: VersusFaction;
  role: VersusRole;
  defaultUnlocked: boolean;
  bossClass?: boolean;
  /**
   * Optional legacy gameplay implementation ID. This is an explicit migration
   * bridge only; the canonical save/unlock identity remains `id`.
   */
  combatProfileId?: string;
  sourceSheet: string;
  portraitSource: string;
}

const BLOODWARD_SOURCE = "LEGENDS_OF_KAI_JAX_BLOODWARD_PUBLICATION_MASTER_v14_FINAL_LOCK.docx";
const PENDING_CURRENT_LOCK = "PENDING_CURRENT_CHARACTER_LOCK";

/**
 * Fighter Select V2 publication-safe allowlist.
 *
 * This list intentionally excludes identities that are present only in older
 * visual baselines or legacy combat registries but are not yet verified against
 * the current Bloodward publication authority. Useful legacy profiles remain in
 * characters.ts as implementation material; they do not become public canon by
 * appearing there.
 *
 * Arena framing is chronology-safe: historical/dead characters may be playable
 * through Legends Archive / Memory Simulation without rewriting story events.
 */
export const VERSUS_ROSTER: readonly VersusRosterEntry[] = [
  {
    id: "kai",
    displayName: "Kai",
    faction: "core",
    role: "hero",
    defaultUnlocked: true,
    sourceSheet: "08_Main_Character_Lineup.png",
    portraitSource: "08_Main_Character_Lineup.png",
  },
  {
    id: "jax",
    displayName: "Jax",
    faction: "core",
    role: "hero",
    defaultUnlocked: true,
    sourceSheet: "08_Main_Character_Lineup.png",
    portraitSource: "08_Main_Character_Lineup.png",
  },
  {
    id: "boryn",
    displayName: "Boryn",
    faction: "core",
    role: "ally",
    defaultUnlocked: true,
    sourceSheet: "04_Fathers_Mentor_Elder_Fang.png",
    portraitSource: "04_Fathers_Mentor_Elder_Fang.png",
  },
  {
    id: "borax",
    displayName: "Borax",
    faction: "core",
    role: "ally",
    defaultUnlocked: true,
    sourceSheet: "04_Fathers_Mentor_Elder_Fang.png",
    portraitSource: "04_Fathers_Mentor_Elder_Fang.png",
  },
  {
    id: "kai-jax",
    combatProfileId: "kaijax",
    displayName: "Kai-Jax",
    faction: "core",
    role: "hero",
    defaultUnlocked: false,
    sourceSheet: "08_Main_Character_Lineup.png",
    portraitSource: "08_Main_Character_Lineup.png",
  },
  {
    id: "vharok",
    displayName: "Vharok",
    faction: "bloodward-antagonist",
    role: "villain",
    defaultUnlocked: false,
    sourceSheet: "04_Fathers_Mentor_Elder_Fang.png",
    portraitSource: "04_Fathers_Mentor_Elder_Fang.png",
  },

  // First Sabertooths are confirmed identities but remain locked until their
  // dedicated gameplay profiles and current character-lock portraits exist.
  {
    id: "kar-voth",
    displayName: "Kar-Voth",
    faction: "first-sabertooths",
    role: "ally",
    defaultUnlocked: false,
    sourceSheet: BLOODWARD_SOURCE,
    portraitSource: PENDING_CURRENT_LOCK,
  },
  {
    id: "thryxen",
    displayName: "Thryxen",
    faction: "first-sabertooths",
    role: "ally",
    defaultUnlocked: false,
    sourceSheet: BLOODWARD_SOURCE,
    portraitSource: PENDING_CURRENT_LOCK,
  },
  {
    id: "pyraxis",
    displayName: "Pyraxis",
    faction: "first-sabertooths",
    role: "ally",
    defaultUnlocked: false,
    sourceSheet: BLOODWARD_SOURCE,
    portraitSource: PENDING_CURRENT_LOCK,
  },
  {
    id: "myrr-kai",
    displayName: "Myrr'Kai",
    faction: "first-sabertooths",
    role: "ally",
    defaultUnlocked: false,
    sourceSheet: BLOODWARD_SOURCE,
    portraitSource: PENDING_CURRENT_LOCK,
  },

  // Publication-confirmed antagonist candidates. Their portraits and dedicated
  // combat implementations remain gated; neither is default playable.
  {
    id: "ulgorr",
    displayName: "Ulgorr",
    faction: "ancient-antagonist",
    role: "boss",
    defaultUnlocked: false,
    bossClass: true,
    sourceSheet: BLOODWARD_SOURCE,
    portraitSource: PENDING_CURRENT_LOCK,
  },
  {
    id: "behemoth",
    displayName: "Behemoth",
    faction: "engineered-horror",
    role: "boss",
    defaultUnlocked: false,
    bossClass: true,
    sourceSheet: BLOODWARD_SOURCE,
    portraitSource: PENDING_CURRENT_LOCK,
  },
] as const;

export const VERSUS_ROSTER_IDS = VERSUS_ROSTER.map((fighter) => fighter.id);

export function getVersusRosterEntry(id: string): VersusRosterEntry | null {
  return VERSUS_ROSTER.find((fighter) => fighter.id === id) ?? null;
}

export function getCombatProfileId(entry: VersusRosterEntry): string {
  return entry.combatProfileId ?? entry.id;
}

export function isDefaultUnlockedVersusFighter(id: string): boolean {
  return getVersusRosterEntry(id)?.defaultUnlocked ?? false;
}

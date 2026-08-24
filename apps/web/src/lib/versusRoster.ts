export type VersusFaction =
  | "core"
  | "first-sabertooths"
  | "fracture-circle"
  | "bloodward-antagonist"
  | "covenant"
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
   * Optional legacy gameplay implementation ID. Keep this separate from the
   * stable public ID while older models/movesets are migrated.
   */
  combatProfileId?: string;
  sourceSheet: string;
  portraitSource: string;
}

const BLOODWARD_SOURCE = "LEGENDS_OF_KAI_JAX_BLOODWARD_PUBLICATION_MASTER_v14_FINAL_LOCK.docx";
const PENDING_CURRENT_LOCK = "PENDING_CURRENT_CHARACTER_LOCK";

/**
 * Fighter Select V2 allowlist.
 *
 * Visual source-sheet references come from the locked visual-library baseline,
 * while narrative role/faction classification follows the newer Bloodward canon.
 * A visual sheet is provenance for appearance, not authority for current story alignment.
 *
 * IMPORTANT: `id` is canonical and persistent. `combatProfileId` exists only as
 * a temporary bridge to older combat/model registries and must never become a
 * second save/unlock identity.
 */
export const VERSUS_ROSTER: readonly VersusRosterEntry[] = [
  { id: "kai", displayName: "Kai", faction: "core", role: "hero", defaultUnlocked: true, sourceSheet: "08_Main_Character_Lineup.png", portraitSource: "08_Main_Character_Lineup.png" },
  { id: "jax", displayName: "Jax", faction: "core", role: "hero", defaultUnlocked: true, sourceSheet: "08_Main_Character_Lineup.png", portraitSource: "08_Main_Character_Lineup.png" },
  { id: "kai-jax", combatProfileId: "kaijax", displayName: "Kai-Jax", faction: "core", role: "hero", defaultUnlocked: true, sourceSheet: "08_Main_Character_Lineup.png", portraitSource: "08_Main_Character_Lineup.png" },
  { id: "boryn", displayName: "Boryn", faction: "core", role: "ally", defaultUnlocked: true, sourceSheet: "04_Fathers_Mentor_Elder_Fang.png", portraitSource: "04_Fathers_Mentor_Elder_Fang.png" },
  { id: "borax", displayName: "Borax", faction: "core", role: "ally", defaultUnlocked: true, sourceSheet: "04_Fathers_Mentor_Elder_Fang.png", portraitSource: "04_Fathers_Mentor_Elder_Fang.png" },
  { id: "vharok", displayName: "Vharok", faction: "bloodward-antagonist", role: "villain", defaultUnlocked: false, sourceSheet: "04_Fathers_Mentor_Elder_Fang.png", portraitSource: "04_Fathers_Mentor_Elder_Fang.png" },

  // Bloodward's First Sabertooths. Canonically confirmed combatants; locked until
  // dedicated gameplay profiles and current visual-lock portraits are integrated.
  { id: "kar-voth", displayName: "Kar-Voth", faction: "first-sabertooths", role: "ally", defaultUnlocked: false, sourceSheet: BLOODWARD_SOURCE, portraitSource: PENDING_CURRENT_LOCK },
  { id: "thryxen", displayName: "Thryxen", faction: "first-sabertooths", role: "ally", defaultUnlocked: false, sourceSheet: BLOODWARD_SOURCE, portraitSource: PENDING_CURRENT_LOCK },
  { id: "pyraxis", displayName: "Pyraxis", faction: "first-sabertooths", role: "ally", defaultUnlocked: false, sourceSheet: BLOODWARD_SOURCE, portraitSource: PENDING_CURRENT_LOCK },
  { id: "myrr-kai", displayName: "Myrr'Kai", faction: "first-sabertooths", role: "ally", defaultUnlocked: false, sourceSheet: BLOODWARD_SOURCE, portraitSource: PENDING_CURRENT_LOCK },

  { id: "aurelion", displayName: "Aurelion", faction: "fracture-circle", role: "ally", defaultUnlocked: true, sourceSheet: "09_Allies_and_Fracture_Circle.png", portraitSource: "09_Allies_and_Fracture_Circle.png" },
  { id: "selene", displayName: "Selene", faction: "fracture-circle", role: "ally", defaultUnlocked: true, sourceSheet: "09_Allies_and_Fracture_Circle.png", portraitSource: "09_Allies_and_Fracture_Circle.png" },
  { id: "miri", displayName: "Miri", faction: "fracture-circle", role: "ally", defaultUnlocked: true, sourceSheet: "09_Allies_and_Fracture_Circle.png", portraitSource: "09_Allies_and_Fracture_Circle.png" },
  { id: "old-moss", displayName: "Old Moss", faction: "fracture-circle", role: "ally", defaultUnlocked: true, sourceSheet: "09_Allies_and_Fracture_Circle.png", portraitSource: "09_Allies_and_Fracture_Circle.png" },
  { id: "rikka", displayName: "Rikka the Ember-Tiny", faction: "fracture-circle", role: "ally", defaultUnlocked: true, sourceSheet: "09_Allies_and_Fracture_Circle.png", portraitSource: "09_Allies_and_Fracture_Circle.png" },
  { id: "mirek", displayName: "Mirek the Burrowed", faction: "fracture-circle", role: "ally", defaultUnlocked: true, sourceSheet: "09_Allies_and_Fracture_Circle.png", portraitSource: "09_Allies_and_Fracture_Circle.png" },
  { id: "sable-nine", displayName: "Sable Nine", faction: "fracture-circle", role: "ally", defaultUnlocked: true, sourceSheet: "09_Allies_and_Fracture_Circle.png", portraitSource: "09_Allies_and_Fracture_Circle.png" },

  { id: "ulgorr", displayName: "Ulgorr", faction: "covenant", role: "villain", defaultUnlocked: false, sourceSheet: "06_Anti_Sabertooth_Covenant_Dossier.png", portraitSource: "06_Anti_Sabertooth_Covenant_Dossier.png" },
  { id: "widow-of-the-alley", displayName: "Widow of the Alley", faction: "covenant", role: "villain", defaultUnlocked: false, sourceSheet: "06_Anti_Sabertooth_Covenant_Dossier.png", portraitSource: "06_Anti_Sabertooth_Covenant_Dossier.png" },
  { id: "varkesh-the-grafted", displayName: "Varkesh the Grafted", faction: "covenant", role: "villain", defaultUnlocked: false, sourceSheet: "06_Anti_Sabertooth_Covenant_Dossier.png", portraitSource: "06_Anti_Sabertooth_Covenant_Dossier.png" },
  { id: "sybeth-the-choir-mother", displayName: "Sybeth the Choir Mother", faction: "covenant", role: "villain", defaultUnlocked: false, sourceSheet: "06_Anti_Sabertooth_Covenant_Dossier.png", portraitSource: "06_Anti_Sabertooth_Covenant_Dossier.png" },
  { id: "ironvein-overseer", displayName: "Ironvein Overseer", faction: "covenant", role: "villain", defaultUnlocked: false, sourceSheet: "06_Anti_Sabertooth_Covenant_Dossier.png", portraitSource: "06_Anti_Sabertooth_Covenant_Dossier.png" },

  { id: "korthyx-prime", displayName: "Korthyx Prime", faction: "engineered-horror", role: "boss", defaultUnlocked: false, bossClass: true, sourceSheet: "07_Major_Threats_Engineered_Horrors.png", portraitSource: "07_Major_Threats_Engineered_Horrors.png" },
  { id: "pillar-twins", displayName: "Pillar Twins", faction: "engineered-horror", role: "boss", defaultUnlocked: false, bossClass: true, sourceSheet: "07_Major_Threats_Engineered_Horrors.png", portraitSource: "07_Major_Threats_Engineered_Horrors.png" },
  { id: "hollow-architect", displayName: "Hollow Architect", faction: "engineered-horror", role: "boss", defaultUnlocked: false, bossClass: true, sourceSheet: "07_Major_Threats_Engineered_Horrors.png", portraitSource: "07_Major_Threats_Engineered_Horrors.png" },
  { id: "fang-colossus", displayName: "Fang Colossus", faction: "engineered-horror", role: "boss", defaultUnlocked: false, bossClass: true, sourceSheet: "07_Major_Threats_Engineered_Horrors.png", portraitSource: "07_Major_Threats_Engineered_Horrors.png" },
  { id: "erasure-choir", displayName: "Erasure Choir", faction: "engineered-horror", role: "boss", defaultUnlocked: false, bossClass: true, sourceSheet: "07_Major_Threats_Engineered_Horrors.png", portraitSource: "07_Major_Threats_Engineered_Horrors.png" },
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

export type VersusFaction =
  | "core"
  | "fracture-circle"
  | "bloodward-antagonist"
  | "covenant"
  | "engineered-horror";

export type VersusRole = "hero" | "ally" | "villain" | "boss";

export interface VersusRosterEntry {
  id: string;
  displayName: string;
  faction: VersusFaction;
  role: VersusRole;
  defaultUnlocked: boolean;
  bossClass?: boolean;
  sourceSheet: string;
  portraitSource: string;
}

/**
 * Fighter Select V2 allowlist.
 *
 * Visual source-sheet references come from the locked visual-library baseline,
 * while narrative role/faction classification follows the newer Bloodward canon.
 * A visual sheet is provenance for appearance, not authority for current story alignment.
 */
export const VERSUS_ROSTER: readonly VersusRosterEntry[] = [
  { id: "kai", displayName: "Kai", faction: "core", role: "hero", defaultUnlocked: true, sourceSheet: "08_Main_Character_Lineup.png", portraitSource: "08_Main_Character_Lineup.png" },
  { id: "jax", displayName: "Jax", faction: "core", role: "hero", defaultUnlocked: true, sourceSheet: "08_Main_Character_Lineup.png", portraitSource: "08_Main_Character_Lineup.png" },
  { id: "kai-jax", displayName: "Kai-Jax", faction: "core", role: "hero", defaultUnlocked: true, sourceSheet: "08_Main_Character_Lineup.png", portraitSource: "08_Main_Character_Lineup.png" },
  { id: "boryn", displayName: "Boryn", faction: "core", role: "ally", defaultUnlocked: true, sourceSheet: "04_Fathers_Mentor_Elder_Fang.png", portraitSource: "04_Fathers_Mentor_Elder_Fang.png" },
  { id: "borax", displayName: "Borax", faction: "core", role: "ally", defaultUnlocked: true, sourceSheet: "04_Fathers_Mentor_Elder_Fang.png", portraitSource: "04_Fathers_Mentor_Elder_Fang.png" },
  { id: "vharok", displayName: "Vharok", faction: "bloodward-antagonist", role: "villain", defaultUnlocked: false, sourceSheet: "04_Fathers_Mentor_Elder_Fang.png", portraitSource: "04_Fathers_Mentor_Elder_Fang.png" },

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

export function isDefaultUnlockedVersusFighter(id: string): boolean {
  return getVersusRosterEntry(id)?.defaultUnlocked ?? false;
}

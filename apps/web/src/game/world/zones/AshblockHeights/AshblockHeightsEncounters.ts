/**
 * Vertical slice: Ashblock Heights (district-1) — encounter script + rewards.
 * Types: `game/encounters/districtTypes` — wired into `lib/encounters.ts` DISTRICTS.
 */
import type { DistrictRoamMeta, EncounterSpec } from "../../../encounters/districtTypes";

export const ASHBLOCK_DISTRICT_NODE_ID = "district-1" as const;

export const ASHBLOCK_ENCOUNTERS: EncounterSpec[] = [
  { id: "d1-e1", label: "Street sweep", minionCount: 2, includeBoss: false, tierScale: 0 },
  { id: "d1-e2", label: "Alley ambush", minionCount: 3, includeBoss: false, tierScale: 1 },
  { id: "d1-e3", label: "Block captain", minionCount: 2, includeBoss: true, tierScale: 2 },
];

export const ASHBLOCK_DISTRICT_META: DistrictRoamMeta = {
  id: "district-1",
  name: "Ashblock Heights",
  theme: "Industrial outskirts — scout packs and rooftop strays.",
  rewards: { xp: 120, currency: 35 },
  encounters: ASHBLOCK_ENCOUNTERS,
};

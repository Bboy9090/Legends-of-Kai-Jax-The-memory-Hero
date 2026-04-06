/**
 * Canonical gameplay package surface (incremental migration).
 */
export * from "./camera";
export * from "./encounters/districtTypes";
export { ASHBLOCK_DISTRICT_META, ASHBLOCK_ENCOUNTERS } from "./world/zones/AshblockHeights/AshblockHeightsEncounters";
export {
  ASHBLOCK_TAGLINE,
  ASHBLOCK_OBJECTIVE_BLURBS,
} from "./world/zones/AshblockHeights/AshblockHeightsNarrative";
export * from "./tails/TailAbilityRegistry";
export { COMBAT_TUNING } from "./tuning/combatTuning";
export { MOVEMENT_TUNING } from "./tuning/movementTuning";

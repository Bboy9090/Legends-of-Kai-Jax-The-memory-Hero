import { ASHBLOCK_PHASE_55_SEQUENCE } from '../game/world/zones/AshblockHeights/AshblockPhase55Content';
import { IRONVEIN_FIELD_SEQUENCE } from '../game/world/zones/IronveinWards/IronveinFieldContent';
import { SKYFALL_FIELD_SEQUENCE } from '../game/world/zones/SkyfallSpines/SkyfallFieldContent';
import { STORM_RONIN_SANCTUM_SEQUENCE } from '../game/world/zones/StormRoninSanctum/StormRoninSanctumContent';

export type FieldMissionRuntime = 'ashblock-combat' | 'briefing-only';

export interface FieldMissionCatalogEntry {
  id: string;
  location: string;
  pressure: string;
  runtime: FieldMissionRuntime;
  objectives: readonly string[];
}

export const FIELD_MISSION_CATALOG: Record<string, FieldMissionCatalogEntry> = {
  vertical_slice_ashblock_heights: {
    id: 'vertical_slice_ashblock_heights',
    location: 'ASHBLOCK HEIGHTS',
    pressure: 'FANG SYNDICATE PRESSURE',
    runtime: 'ashblock-combat',
    objectives: ASHBLOCK_PHASE_55_SEQUENCE.map((beat) => beat.objective),
  },
  vertical_slice_ironvein_wards: {
    id: 'vertical_slice_ironvein_wards',
    location: 'IRONVEIN WARDS',
    pressure: 'ANTI-SABERTOOTH COVENANT ACTIVITY',
    runtime: 'briefing-only',
    objectives: IRONVEIN_FIELD_SEQUENCE.map((beat) => beat.objective),
  },
  vertical_slice_skyfall_spines: {
    id: 'vertical_slice_skyfall_spines',
    location: 'SKYFALL SPINES',
    pressure: 'CONTESTED TERRITORY',
    runtime: 'briefing-only',
    objectives: SKYFALL_FIELD_SEQUENCE.map((beat) => beat.objective),
  },
  vertical_slice_storm_ronin_sanctum: {
    id: 'vertical_slice_storm_ronin_sanctum',
    location: 'STORM RONIN SANCTUM',
    pressure: 'RONIN LEGACY SITE',
    runtime: 'briefing-only',
    objectives: STORM_RONIN_SANCTUM_SEQUENCE.map((beat) => beat.objective),
  },
};

export const DEFAULT_FIELD_MISSION_ID = 'vertical_slice_ashblock_heights';

export function getFieldMission(id: string | null | undefined): FieldMissionCatalogEntry {
  return (id && FIELD_MISSION_CATALOG[id])
    ? FIELD_MISSION_CATALOG[id]
    : FIELD_MISSION_CATALOG[DEFAULT_FIELD_MISSION_ID];
}

export function isPlayableFieldMission(id: string | null | undefined): boolean {
  return getFieldMission(id).runtime !== 'briefing-only';
}

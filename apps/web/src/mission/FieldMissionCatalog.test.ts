import { describe, expect, it } from 'vitest';
import {
  DEFAULT_FIELD_MISSION_ID,
  FIELD_MISSION_CATALOG,
  getFieldMission,
  isPlayableFieldMission,
} from './FieldMissionCatalog';

describe('field mission catalog', () => {
  it('owns exactly the four established Story Hub field nodes', () => {
    expect(Object.keys(FIELD_MISSION_CATALOG).sort()).toEqual([
      'vertical_slice_ashblock_heights',
      'vertical_slice_ironvein_wards',
      'vertical_slice_skyfall_spines',
      'vertical_slice_storm_ronin_sanctum',
    ]);
  });

  it('keeps only Ashblock runtime-playable until other scenes are certified', () => {
    expect(isPlayableFieldMission('vertical_slice_ashblock_heights')).toBe(true);
    expect(isPlayableFieldMission('vertical_slice_ironvein_wards')).toBe(false);
    expect(isPlayableFieldMission('vertical_slice_skyfall_spines')).toBe(false);
    expect(isPlayableFieldMission('vertical_slice_storm_ronin_sanctum')).toBe(false);
  });

  it('falls unknown ids back to the safe Ashblock briefing', () => {
    expect(getFieldMission('not-real').id).toBe(DEFAULT_FIELD_MISSION_ID);
  });

  it('provides authored objectives for every node', () => {
    for (const entry of Object.values(FIELD_MISSION_CATALOG)) {
      expect(entry.objectives.length).toBeGreaterThan(0);
      expect(entry.objectives.every((objective) => objective.trim().length > 0)).toBe(true);
    }
  });
});

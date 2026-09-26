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

  it('marks all four established field nodes runtime-playable with explicit runtime modes', () => {
    expect(isPlayableFieldMission('vertical_slice_ashblock_heights')).toBe(true);
    expect(isPlayableFieldMission('vertical_slice_ironvein_wards')).toBe(true);
    expect(isPlayableFieldMission('vertical_slice_skyfall_spines')).toBe(true);
    expect(isPlayableFieldMission('vertical_slice_storm_ronin_sanctum')).toBe(true);

    expect(FIELD_MISSION_CATALOG.vertical_slice_ashblock_heights.runtime).toBe('ashblock-combat');
    expect(FIELD_MISSION_CATALOG.vertical_slice_ironvein_wards.runtime).toBe('field-traversal');
    expect(FIELD_MISSION_CATALOG.vertical_slice_skyfall_spines.runtime).toBe('field-traversal');
    expect(FIELD_MISSION_CATALOG.vertical_slice_storm_ronin_sanctum.runtime).toBe('field-traversal');

    expect(FIELD_MISSION_CATALOG.vertical_slice_ashblock_heights.layoutProfile).toBe('ashblock-combat');
    expect(FIELD_MISSION_CATALOG.vertical_slice_ironvein_wards.layoutProfile).toBe('ironvein-pressure');
    expect(FIELD_MISSION_CATALOG.vertical_slice_skyfall_spines.layoutProfile).toBe('skyfall-vertical');
    expect(FIELD_MISSION_CATALOG.vertical_slice_storm_ronin_sanctum.layoutProfile).toBe('sanctum-archive');
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

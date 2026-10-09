import { describe, expect, it } from 'vitest';

import { getModelConfig, getModelPath, hasModel } from '../../assets/modelRegistry';
import {
  GOLD_SLICE_PLAYABLE_IDS,
  PLAYABLE_FIGHTERS,
  isGoldSlicePlayableId,
} from '../../lib/characters';
import { detectStorageCapability, useRunner } from '../../lib/stores/useRunner';
import { getLODModelPath } from '../../lib/threejs/ModelLODSystem';

describe('mainline Gold Slice stabilization contracts', () => {
  describe('model identity and fallback safety', () => {
    it.each([
      ['memory-wisp', 'shadow_panther.glb'],
      ['rift-drone', 'drone.glb'],
      ['corruption-brute', 'granite_colossus.glb'],
      ['void-stalker', 'darjshadowkaijax.glb'],
      ['void-stalker-prime', 'darjshadowkaijax.glb'],
    ])('%s resolves to its intentional runtime asset', (id, expectedFile) => {
      const config = getModelConfig(id);
      expect(config).not.toBeNull();
      expect(config?.path).toContain(expectedFile);
      expect(getModelPath(id)).toContain(expectedFile);
    });

    it('normalizes EncounterDirector underscore IDs at the registry boundary', () => {
      expect(getModelPath('MEMORY_WISP')).toContain('shadow_panther.glb');
      expect(getModelPath('CORRUPTION_BRUTE')).toContain('granite_colossus.glb');
      expect(getModelPath('RIFT_DRONE')).toContain('drone.glb');
      expect(getModelPath('VOID_STALKER_PRIME')).toContain('darjshadowkaijax.glb');
    });

    it('never resolves an unknown identity to Kai-Jax', () => {
      const unknown = 'unknown-runtime-entity';
      expect(getModelConfig(unknown)).toBeNull();
      expect(getModelPath(unknown)).toBeNull();
      expect(hasModel(unknown)).toBe(false);
      expect(getLODModelPath(unknown)).toBeNull();
    });
  });

  describe('Gold Slice roster truth', () => {
    it('keeps the release slice locked to Kai-Jax, Jaxon, and Kaison', () => {
      expect(Array.from(GOLD_SLICE_PLAYABLE_IDS)).toEqual(['kai-jax', 'jaxon', 'kaison']);
    });

    it('accepts only Gold Slice public identities as playable', () => {
      expect(isGoldSlicePlayableId('kai-jax')).toBe(true);
      expect(isGoldSlicePlayableId('kaijax')).toBe(true);
      expect(isGoldSlicePlayableId('kai_jax')).toBe(true);
      expect(isGoldSlicePlayableId('jaxon')).toBe(true);
      expect(isGoldSlicePlayableId('kaison')).toBe(true);

      expect(isGoldSlicePlayableId('kai')).toBe(false);
      expect(isGoldSlicePlayableId('jax')).toBe(false);
      expect(isGoldSlicePlayableId('borax')).toBe(false);
      expect(isGoldSlicePlayableId('boryn')).toBe(false);
      expect(isGoldSlicePlayableId('voidonus')).toBe(false);
      expect(isGoldSlicePlayableId('')).toBe(false);
    });

    it('resolves exactly three playable combat profiles', () => {
      expect(PLAYABLE_FIGHTERS).toHaveLength(3);
      const ids = PLAYABLE_FIGHTERS.map((fighter) =>
        fighter.id === 'kaijax' ? 'kai-jax' : fighter.id,
      );
      expect(ids).toEqual(['kai-jax', 'jaxon', 'kaison']);
    });
  });

  describe('save capability truth', () => {
    it('detects persistence capability without throwing', () => {
      expect(['persistent', 'temporary', 'unavailable']).toContain(detectStorageCapability());
    });

    it('publishes the current storage capability on the runner store', () => {
      expect(['persistent', 'temporary', 'unavailable']).toContain(useRunner.getState().storageStatus);
    });
  });
});

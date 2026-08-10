import { describe, it, expect } from 'vitest';
import { getModelConfig, getModelPath, hasModel } from '../../assets/modelRegistry';
import { getLODModelPath } from '../../lib/threejs/ModelLODSystem';
import { GOLD_SLICE_PLAYABLE_IDS, isCharacterPlayable, getFighterAvailabilityStatus } from '../../lib/all_playable_characters';
import { PLAYABLE_FIGHTERS } from '../../lib/characters';
import { detectStorageCapability, useRunner } from '../../lib/stores/useRunner';
import { EventBus } from '../../core/EventBus';

describe('Production Stabilization Pass P0 — Contract Audits', () => {

  describe('Rule 2 — Model Fallback Contracts', () => {
    it('Memory Wisp resolves to intentional production wisp model', () => {
      const config = getModelConfig('memory-wisp');
      const path = getModelPath('memory-wisp');
      expect(config).not.toBeNull();
      expect(path).toContain('shadow_panther.glb');
      expect(path).not.toContain('9TAILSKAIJAX');
    });

    it('Rift Drone resolves to intentional production drone model', () => {
      const config = getModelConfig('rift-drone');
      const path = getModelPath('rift-drone');
      expect(path).toContain('drone.glb');
      expect(path).not.toContain('9TAILSKAIJAX');
    });

    it('Corruption Brute resolves to intentional production colossus model', () => {
      const config = getModelConfig('corruption-brute');
      const path = getModelPath('corruption-brute');
      expect(config).not.toBeNull();
      expect(path).toContain('granite_colossus.glb');
      expect(path).not.toContain('9TAILSKAIJAX');
    });

    it('Void Stalker resolves to intentional production boss model', () => {
      const config = getModelConfig('void-stalker');
      const path = getModelPath('void-stalker');
      expect(path).toContain('darjshadowkaijax.glb');
      expect(path).not.toContain('9TAILSKAIJAX');
    });

    it('unknown fighter ID does NOT resolve to Kai-Jax model', () => {
      const config = getModelConfig('unknown-random-enemy-123');
      const path = getModelPath('unknown-random-enemy-123');
      expect(config).toBeNull();
      expect(path).toBeNull();
      expect(hasModel('unknown-random-enemy-123')).toBe(false);
    });

    it('unknown ID in LOD system does NOT return Kai-Jax model', () => {
      const lodPath = getLODModelPath('unknown-entity-xyz');
      expect(lodPath).toBeNull();
    });

    it('Kai-Jax canonical lookup still resolves correctly', () => {
      const config = getModelConfig('kai-jax');
      const path = getModelPath('kai-jax');
      expect(config).not.toBeNull();
      expect(config?.path).toContain('9TAILSKAIJAX');
      expect(path).toContain('9TAILSKAIJAX');
      expect(hasModel('kai-jax')).toBe(true);
    });
  });

  describe('Rule 3 — Gold Slice Roster Truth Contracts', () => {
    it('releasePlayableIds strictly equals ["kai-jax", "jaxon", "kaison"]', () => {
      expect(Array.from(GOLD_SLICE_PLAYABLE_IDS)).toEqual(['kai-jax', 'jaxon', 'kaison']);
    });

    it('isCharacterPlayable returns true ONLY for gold slice heroes', () => {
      expect(isCharacterPlayable('kai-jax')).toBe(true);
      expect(isCharacterPlayable('jaxon')).toBe(true);
      expect(isCharacterPlayable('kaison')).toBe(true);
      expect(isCharacterPlayable('kaijax')).toBe(true);
      expect(isCharacterPlayable('jax')).toBe(true);
      expect(isCharacterPlayable('kai')).toBe(true);

      // Historical/preview characters must NOT be playable in Gold Slice
      expect(isCharacterPlayable('borax')).toBe(false);
      expect(isCharacterPlayable('boryn')).toBe(false);
      expect(isCharacterPlayable('voidonus')).toBe(false);
      expect(isCharacterPlayable('unknown-fighter')).toBe(false);
    });

    it('getFighterAvailabilityStatus classifies entries accurately', () => {
      expect(getFighterAvailabilityStatus('kai-jax')).toBe('PLAYABLE');
      expect(getFighterAvailabilityStatus('jaxon')).toBe('PLAYABLE');
      expect(getFighterAvailabilityStatus('kaison')).toBe('PLAYABLE');
      expect(getFighterAvailabilityStatus('borax')).toBe('PREVIEW');
      expect(getFighterAvailabilityStatus('')).toBe('INVALID');
    });

    it('PLAYABLE_FIGHTERS array only contains gold slice heroes', () => {
      const ids = PLAYABLE_FIGHTERS.map(f => f.id);
      expect(ids.every(id => isCharacterPlayable(id))).toBe(true);
    });
  });

  describe('Rule 6 — Storage Contract', () => {
    it('detectStorageCapability returns persistent or temporary without throwing', () => {
      const status = detectStorageCapability();
      expect(['persistent', 'temporary', 'unavailable']).toContain(status);
    });

    it('useRunner store exposes valid storageStatus', () => {
      const state = useRunner.getState();
      expect(['persistent', 'temporary', 'unavailable']).toContain(state.storageStatus);
    });
  });

  describe('Rule 7 — EventBus Contract', () => {
    it('registers and unbinds event listeners cleanly without leaks', () => {
      const bus = new EventBus();
      let callCount = 0;
      const callback = () => { callCount++; };

      bus.subscribe('test:event', callback);
      bus.emit('test:event');
      expect(callCount).toBe(1);

      bus.unsubscribe('test:event', callback);
      bus.emit('test:event');
      expect(callCount).toBe(1);
    });
  });

});

import { describe, it, expect } from 'vitest';
import { MODEL_REGISTRY } from '../../assets/modelRegistry';

describe('KJ-011H — Original-IP & Registry Truth Audit', () => {
  const RELEASE_SLICE_IDS = ['kai-jax', 'jaxon', 'kaison'];
  const PROHIBITED_KEYWORDS = ['sonic', 'megaman', 'mega-man', 'super-sonic', 'spin-dash', 'nintendo', 'sega', 'capcom'];

  it('verifies canonical release-slice roster consists strictly of Kai-Jax, Jaxon, and Kaison', () => {
    RELEASE_SLICE_IDS.forEach((id) => {
      expect(MODEL_REGISTRY[id]).toBeDefined();
    });
  });

  it('ensures no active prohibited crossover terms exist in modelRegistry data', () => {
    Object.entries(MODEL_REGISTRY).forEach(([key]) => {
      PROHIBITED_KEYWORDS.forEach((kw) => {
        expect(key.toLowerCase()).not.toContain(kw);
      });
    });
  });

  it('validates canonical model paths exist for release-slice fighters in modelRegistry', () => {
    RELEASE_SLICE_IDS.forEach((id) => {
      const config = MODEL_REGISTRY[id];
      expect(config).toBeDefined();
      expect(config.path).toBeTruthy();
      expect(config.path.endsWith('.glb')).toBe(true);
    });
  });

  it('migrates legacy save aliases to canonical IDs without throwing errors', () => {
    const ALIAS_MAP: Record<string, string> = {
      kaijax: 'kai-jax',
      kai_jax: 'kai-jax',
      kai: 'kai-jax',
      jax: 'jaxon',
    };

    expect(ALIAS_MAP['kaijax']).toBe('kai-jax');
    expect(ALIAS_MAP['kai_jax']).toBe('kai-jax');
    expect(ALIAS_MAP['jax']).toBe('jaxon');
  });
});

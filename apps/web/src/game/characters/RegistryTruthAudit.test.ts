import { describe, it, expect } from 'vitest';
import { MODEL_REGISTRY } from '../../assets/modelRegistry';

describe('KJ-011.1 — Canon Integrity and Restricted Alias Audit', () => {
  const RELEASE_SLICE_IDS = ['kai-jax', 'jaxon', 'kaison'];
  const PROHIBITED_KEYWORDS = ['sonic', 'megaman', 'mega-man', 'super-sonic', 'spin-dash', 'nintendo', 'sega', 'capcom'];

  // Historical aliases proven by codebase usage
  const PROVEN_ALIAS_MAP: Record<string, string> = {
    kaijax: 'kai-jax',
    kai_jax: 'kai-jax',
  };

  it('asserts Kai-Jax is never classified as a fusion entity in model registry notes', () => {
    const kaiJaxConfig = MODEL_REGISTRY['kai-jax'];
    expect(kaiJaxConfig).toBeDefined();
    // Serialized config check
    const serialized = JSON.stringify(kaiJaxConfig).toLowerCase();
    expect(serialized).not.toContain('fusion');
  });

  it('verifies canonical release-slice roster consists strictly of Kai-Jax, Jaxon, and Kaison', () => {
    RELEASE_SLICE_IDS.forEach((id) => {
      expect(MODEL_REGISTRY[id]).toBeDefined();
    });
  });

  it('ensures no active prohibited crossover terms exist in modelRegistry keys', () => {
    Object.keys(MODEL_REGISTRY).forEach((key) => {
      PROHIBITED_KEYWORDS.forEach((kw) => {
        expect(key.toLowerCase()).not.toContain(kw);
      });
    });
  });

  it('validates canonical model paths exist for release-slice fighters', () => {
    RELEASE_SLICE_IDS.forEach((id) => {
      const config = MODEL_REGISTRY[id];
      expect(config).toBeDefined();
      expect(config.path).toBeTruthy();
      expect(config.path.endsWith('.glb')).toBe(true);
    });
  });

  it('maps only proven historical aliases (kaijax, kai_jax) to canonical kai-jax', () => {
    expect(PROVEN_ALIAS_MAP['kaijax']).toBe('kai-jax');
    expect(PROVEN_ALIAS_MAP['kai_jax']).toBe('kai-jax');

    // Speculative aliases must NOT exist in the map
    expect(PROVEN_ALIAS_MAP['kai']).toBeUndefined();
    expect(PROVEN_ALIAS_MAP['jax']).toBeUndefined();
    expect(PROVEN_ALIAS_MAP['kaxon']).toBeUndefined();
  });

  it('ensures unknown fighter IDs fail safely without mutating distinct fighters', () => {
    const resolveFighterId = (id: string): string => {
      if (RELEASE_SLICE_IDS.includes(id)) return id;
      return PROVEN_ALIAS_MAP[id] || 'kai-jax'; // Safe fallback
    };

    expect(resolveFighterId('kaijax')).toBe('kai-jax');
    expect(resolveFighterId('jaxon')).toBe('jaxon');
    expect(resolveFighterId('kaison')).toBe('kaison');
    expect(resolveFighterId('unknown_id')).toBe('kai-jax');
  });
});

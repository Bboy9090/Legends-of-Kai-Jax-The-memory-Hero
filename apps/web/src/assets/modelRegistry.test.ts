import { describe, expect, it } from 'vitest';
import { MODEL_FALLBACK_PATH, PRELOAD_MODEL_IDS, getBattleModelPath, getModelPath } from './modelRegistry';

describe('Phase C production story model registry', () => {
  it('keeps Kai and Jax on separate production assets', () => {
    const kaiPath = getModelPath('kai');
    const jaxPath = getModelPath('jax');

    expect(kaiPath).toContain('Merged_Animations4KAI.glb');
    expect(jaxPath).toContain('Merged_AnimationsSHADOWSONIC JAX.glb');
    expect(jaxPath).not.toMatch(/9TAILS|KAIJAX/i);
  });

  it('preloads the two normal story protagonists rather than story-gated fusion', () => {
    expect([...PRELOAD_MODEL_IDS]).toEqual(['kai', 'jax']);
    expect(PRELOAD_MODEL_IDS).not.toContain('kai-jax');
  });

  it('keeps lightweight battle variants under registry authority', () => {
    expect(getBattleModelPath('kai')).toContain('/models/kai_jax_beast.glb');
    expect(getBattleModelPath('jax')).toContain('/models/jaxon_beast.glb');
    expect(getBattleModelPath('boryn')).toContain('/models/boryx_zenith_beast.glb');
  });

  it('uses one canonical fallback for unknown battle identities', () => {
    expect(getBattleModelPath('not-a-real-fighter')).toContain(MODEL_FALLBACK_PATH);
  });
});

import { describe, expect, it } from 'vitest';
import { MODEL_REGISTRY } from '../../assets/modelRegistry';
import {
  CORE_CHARACTER_ASSET_AUTHORITY,
  hasApprovedCurrentAsset,
} from '../../assets/coreCharacterAssetAuthority';

describe('core character asset authority', () => {
  it('keeps Kai, Jax and Kai-Jax blocked until approved current assets are imported', () => {
    for (const id of ['kai', 'jax', 'kai-jax'] as const) {
      expect(CORE_CHARACTER_ASSET_AUTHORITY[id].status).toBe('blocked-pending-approved-asset');
      expect(CORE_CHARACTER_ASSET_AUTHORITY[id].approvedPath).toBeNull();
      expect(hasApprovedCurrentAsset(id)).toBe(false);
    }
  });

  it('keeps Jaxon and Kaison distinct from Kai and Jax authority', () => {
    expect(CORE_CHARACTER_ASSET_AUTHORITY.jaxon.id).not.toBe(CORE_CHARACTER_ASSET_AUTHORITY.jax.id);
    expect(CORE_CHARACTER_ASSET_AUTHORITY.kaison.id).not.toBe(CORE_CHARACTER_ASSET_AUTHORITY.kai.id);
    expect(CORE_CHARACTER_ASSET_AUTHORITY.jaxon.role).toBe('family-identity');
    expect(CORE_CHARACTER_ASSET_AUTHORITY.kaison.role).toBe('family-identity');
  });

  it('records current registry paths only as legacy runtime evidence', () => {
    expect(CORE_CHARACTER_ASSET_AUTHORITY.jax.legacyRuntimePath).toBe(MODEL_REGISTRY.jax.path);
    expect(CORE_CHARACTER_ASSET_AUTHORITY.kai.legacyRuntimePath).toBe(MODEL_REGISTRY.kai.path);
    expect(CORE_CHARACTER_ASSET_AUTHORITY['kai-jax'].legacyRuntimePath).toBe(MODEL_REGISTRY['kai-jax'].path);
  });

  it('does not accept shared legacy files as proof of approved identity art', () => {
    expect(MODEL_REGISTRY.jax.path).toBe(MODEL_REGISTRY.jaxon.path);
    expect(hasApprovedCurrentAsset('jax')).toBe(false);
    expect(hasApprovedCurrentAsset('jaxon')).toBe(false);
  });
});

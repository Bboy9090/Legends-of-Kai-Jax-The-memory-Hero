export type CoreCharacterId = 'kai' | 'jax' | 'kai-jax' | 'jaxon' | 'kaison';

export type AssetAuthorityStatus =
  | 'approved-current'
  | 'legacy-runtime-only'
  | 'blocked-pending-approved-asset';

export interface CharacterAssetAuthority {
  id: CoreCharacterId;
  role: 'core-hero' | 'family-identity';
  status: AssetAuthorityStatus;
  approvedPath: string | null;
  legacyRuntimePath: string | null;
  notes: string;
}

/**
 * Release authority for identities that have historically been conflated in the
 * runtime registry. A legacy path may remain usable for development, but it is
 * never evidence that the current approved art has been imported.
 */
export const CORE_CHARACTER_ASSET_AUTHORITY: Record<CoreCharacterId, CharacterAssetAuthority> = {
  kai: {
    id: 'kai',
    role: 'core-hero',
    status: 'blocked-pending-approved-asset',
    approvedPath: null,
    legacyRuntimePath: '/models/Meshy_AI_Character_outputSPiDERKAIJAX9TIALS.glb',
    notes: 'Kai requires the approved current Wolf / Red Fox / Smilodon-line design before release qualification.',
  },
  jax: {
    id: 'jax',
    role: 'core-hero',
    status: 'blocked-pending-approved-asset',
    approvedPath: null,
    legacyRuntimePath: '/models/Meshy_AI_Jaxon_Velocity_Animations.glb',
    notes: 'Jax requires the approved current Panthera / Homotherium-line design before release qualification.',
  },
  'kai-jax': {
    id: 'kai-jax',
    role: 'core-hero',
    status: 'blocked-pending-approved-asset',
    approvedPath: null,
    legacyRuntimePath: '/models/Meshy_AI_Animation_Walking_withSkin9TAILSKAIJAX.glb',
    notes: 'Kai-Jax requires the approved current one-body identity design before release qualification.',
  },
  jaxon: {
    id: 'jaxon',
    role: 'family-identity',
    status: 'legacy-runtime-only',
    approvedPath: null,
    legacyRuntimePath: '/models/Meshy_AI_Jaxon_Velocity_Animations.glb',
    notes: 'Jaxon is a distinct family identity and must never be treated as Jax asset authority.',
  },
  kaison: {
    id: 'kaison',
    role: 'family-identity',
    status: 'legacy-runtime-only',
    approvedPath: null,
    legacyRuntimePath: '/models/Meshy_AI_Animation_Walking_withSkinSPiDERKAIJAX9TIALS.glb',
    notes: 'Kaison is a distinct family identity and must never be treated as Kai asset authority.',
  },
};

export function hasApprovedCurrentAsset(id: CoreCharacterId): boolean {
  const record = CORE_CHARACTER_ASSET_AUTHORITY[id];
  return record.status === 'approved-current' && Boolean(record.approvedPath);
}

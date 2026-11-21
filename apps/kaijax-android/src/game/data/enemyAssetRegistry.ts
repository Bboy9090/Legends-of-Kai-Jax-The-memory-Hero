import { GraphicsQuality } from '../types';

export type EnemyModelId =
  | 'fang_enforcer'
  | 'blood_broker'
  | 'syndicate_brawler'
  | 'syndicate_stalker'
  | 'syndicate_marksman'
  | 'architect_scout'
  | 'neon_prince'
  | 'undercrown_sentinel'
  | 'borax_zenith'
  | 'erasure_choir'
  | 'hollow_architect';

export interface EnemyAssetManifestEntry {
  id: EnemyModelId;
  displayName: string;
  districtId: string;
  isBoss: boolean;
  /** Provisional until a project-owner visual approval is recorded. */
  visualAuthorityStatus: 'approved' | 'awaiting_visual_approval';
  /** Review of the SAME-NAMED reference, not a similarly named inferred sheet. */
  visualReferenceMatch: 'matched' | 'mismatch' | 'unmapped';
  masterGlbUrl: string;
  lod1GlbUrl: string;
  maxTrianglesMaster: number;
  maxTrianglesLod1: number;
  accentHex: string;
}

/**
 * Wave 8 visual QA: all eleven villain models are functional placeholders.
 * Three mismatched their same-named concept sheets; the rest lack confirmed
 * same-named reference mapping. Structural GLB validation is NOT art approval.
 * See docs/production/WAVE8_RELEASE_QUALIFICATION.md §5 and issue #395.
 */
export const ENEMY_ASSET_REGISTRY: Record<EnemyModelId, EnemyAssetManifestEntry> = {
  fang_enforcer: {
    id: 'fang_enforcer',
    visualAuthorityStatus: 'awaiting_visual_approval',
    visualReferenceMatch: 'mismatch',
    displayName: 'Fang Enforcer',
    districtId: 'ashblock-heights',
    isBoss: true,
    masterGlbUrl: '/models/enemies/fang_enforcer_master.glb',
    lod1GlbUrl: '/models/enemies/fang_enforcer_lod1.glb',
    maxTrianglesMaster: 18000,
    maxTrianglesLod1: 8000,
    accentHex: '#ef4444',
  },
  blood_broker: {
    id: 'blood_broker',
    visualAuthorityStatus: 'awaiting_visual_approval',
    visualReferenceMatch: 'unmapped',
    displayName: 'Blood Broker',
    districtId: 'iron-market',
    isBoss: true,
    masterGlbUrl: '/models/enemies/blood_broker_master.glb',
    lod1GlbUrl: '/models/enemies/blood_broker_lod1.glb',
    maxTrianglesMaster: 18000,
    maxTrianglesLod1: 8000,
    accentHex: '#e11d48',
  },
  syndicate_brawler: {
    id: 'syndicate_brawler',
    visualAuthorityStatus: 'awaiting_visual_approval',
    visualReferenceMatch: 'unmapped',
    displayName: 'Syndicate Brawler',
    districtId: 'ashblock-heights',
    isBoss: false,
    masterGlbUrl: '/models/enemies/syndicate_brawler_master.glb',
    lod1GlbUrl: '/models/enemies/syndicate_brawler_lod1.glb',
    maxTrianglesMaster: 18000,
    maxTrianglesLod1: 8000,
    accentHex: '#f97316',
  },
  syndicate_stalker: {
    id: 'syndicate_stalker',
    visualAuthorityStatus: 'awaiting_visual_approval',
    visualReferenceMatch: 'unmapped',
    displayName: 'Syndicate Stalker',
    districtId: 'ashblock-heights',
    isBoss: false,
    masterGlbUrl: '/models/enemies/syndicate_stalker_master.glb',
    lod1GlbUrl: '/models/enemies/syndicate_stalker_lod1.glb',
    maxTrianglesMaster: 18000,
    maxTrianglesLod1: 8000,
    accentHex: '#a855f7',
  },
  syndicate_marksman: {
    id: 'syndicate_marksman',
    visualAuthorityStatus: 'awaiting_visual_approval',
    visualReferenceMatch: 'unmapped',
    displayName: 'Syndicate Marksman',
    districtId: 'ashblock-heights',
    isBoss: false,
    masterGlbUrl: '/models/enemies/syndicate_marksman_master.glb',
    lod1GlbUrl: '/models/enemies/syndicate_marksman_lod1.glb',
    maxTrianglesMaster: 18000,
    maxTrianglesLod1: 8000,
    accentHex: '#38bdf8',
  },
  architect_scout: {
    id: 'architect_scout',
    visualAuthorityStatus: 'awaiting_visual_approval',
    visualReferenceMatch: 'unmapped',
    displayName: 'Architect Scout',
    districtId: 'sector-7',
    isBoss: true,
    masterGlbUrl: '/models/enemies/architect_scout_master.glb',
    lod1GlbUrl: '/models/enemies/architect_scout_lod1.glb',
    maxTrianglesMaster: 18000,
    maxTrianglesLod1: 8000,
    accentHex: '#22d3ee',
  },
  neon_prince: {
    id: 'neon_prince',
    visualAuthorityStatus: 'awaiting_visual_approval',
    visualReferenceMatch: 'unmapped',
    displayName: 'Neon Prince',
    districtId: 'neon-ward',
    isBoss: true,
    masterGlbUrl: '/models/enemies/neon_prince_master.glb',
    lod1GlbUrl: '/models/enemies/neon_prince_lod1.glb',
    maxTrianglesMaster: 18000,
    maxTrianglesLod1: 8000,
    accentHex: '#ec4899',
  },
  undercrown_sentinel: {
    id: 'undercrown_sentinel',
    visualAuthorityStatus: 'awaiting_visual_approval',
    visualReferenceMatch: 'unmapped',
    displayName: 'Undercrown Sentinel',
    districtId: 'undercrown',
    isBoss: true,
    masterGlbUrl: '/models/enemies/undercrown_sentinel_master.glb',
    lod1GlbUrl: '/models/enemies/undercrown_sentinel_lod1.glb',
    maxTrianglesMaster: 18000,
    maxTrianglesLod1: 8000,
    accentHex: '#f59e0b',
  },
  borax_zenith: {
    id: 'borax_zenith',
    visualAuthorityStatus: 'awaiting_visual_approval',
    visualReferenceMatch: 'unmapped',
    displayName: 'Borax Zenith',
    districtId: 'zenith-spires',
    isBoss: true,
    masterGlbUrl: '/models/enemies/borax_zenith_master.glb',
    lod1GlbUrl: '/models/enemies/borax_zenith_lod1.glb',
    maxTrianglesMaster: 18000,
    maxTrianglesLod1: 8000,
    accentHex: '#fbbf24',
  },
  erasure_choir: {
    id: 'erasure_choir',
    visualAuthorityStatus: 'awaiting_visual_approval',
    visualReferenceMatch: 'mismatch',
    displayName: 'Erasure Choir',
    districtId: 'erasure-fields',
    isBoss: true,
    masterGlbUrl: '/models/enemies/erasure_choir_master.glb',
    lod1GlbUrl: '/models/enemies/erasure_choir_lod1.glb',
    maxTrianglesMaster: 18000,
    maxTrianglesLod1: 8000,
    accentHex: '#c084fc',
  },
  hollow_architect: {
    id: 'hollow_architect',
    visualAuthorityStatus: 'awaiting_visual_approval',
    visualReferenceMatch: 'mismatch',
    displayName: 'Hollow Architect',
    districtId: 'memory-nexus',
    isBoss: true,
    masterGlbUrl: '/models/enemies/hollow_architect_master.glb',
    lod1GlbUrl: '/models/enemies/hollow_architect_lod1.glb',
    maxTrianglesMaster: 18000,
    maxTrianglesLod1: 8000,
    accentHex: '#eab308',
  },
};

export function resolveEnemyFallbackChain(
  id: EnemyModelId,
  quality: GraphicsQuality,
  preferLod1 = false
): string[] {
  const entry = ENEMY_ASSET_REGISTRY[id];
  if (!entry) return [];
  const useLod1 = preferLod1 || quality === 'low';
  return useLod1 ? [entry.lod1GlbUrl, entry.masterGlbUrl] : [entry.masterGlbUrl, entry.lod1GlbUrl];
}

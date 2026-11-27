import { CharacterModelVersion, GraphicsQuality, HeroId } from '../types';

export type RosterCharacterId = HeroId | 'boryn' | 'borax' | 'bovar';

export type VisualAuthorityStatus = 'approved' | 'awaiting_visual_approval';

export const REQUIRED_HERO_ANIMATION_CLIPS = [
  'idle',
  'breathing',
  'walk',
  'run',
  'sprint',
  'jump',
  'fall',
  'landing',
  'dodge',
  'attack_1',
  'attack_2',
  'attack_3',
  'heavy_strike',
  'parry',
  'hit_reaction',
  'roar',
  'ability_cast',
  'victory',
  'defeat',
] as const;

export type CharacterAnimClipName = (typeof REQUIRED_HERO_ANIMATION_CLIPS)[number];

export const REQUIRED_FACIAL_MORPHS = ['blink', 'snarl', 'roar', 'pain', 'focus'] as const;
export type FacialMorphName = (typeof REQUIRED_FACIAL_MORPHS)[number];

export const REQUIRED_ATTACHMENT_SOCKETS = [
  'socket_weapon_L',
  'socket_weapon_R',
  'socket_relic',
  'socket_hitbox_L',
  'socket_hitbox_R',
  'socket_head',
] as const;

export interface CharacterAssetManifestEntry {
  id: RosterCharacterId;
  displayName: string;
  role: 'playable-hero' | 'fused-hero' | 'mentor-npc' | 'family-anchor';
  visualAuthorityStatus: VisualAuthorityStatus;
  authorityReferences: string[];
  masterGlbUrl: string | null;
  lod1GlbUrl: string | null;
  p1iMasterGlbUrl: string | null;
  p1iLod1GlbUrl: string | null;
  p1gMasterGlbUrl: string | null;
  p1gLod1GlbUrl: string | null;
  meshyMasterGlbUrl: string | null;
  meshyLod1GlbUrl: string | null;
  multiviewSheetUrl: string | null;
  standingHeightMeters: number;
  maxTrianglesMaster: number;
  maxTrianglesLod1: number;
  spiderLimbCount: number;
  maneSpikeCount: number;
  physicalTailCount: number;
  tailIdentities?: readonly string[];
  requiredClips: readonly CharacterAnimClipName[];
  requiredMorphs: readonly FacialMorphName[];
  notes: string;
}

/**
 * Canonical Character Asset Authority Registry.
 * Governed exclusively by the Official Legends of Kai-Jax Visual Library sheets.
 * Supports non-destructive versioned model selection across:
 *   - `p1i_reconstructed` (Default: Multi-view Dual-Hemisphere Orthographic Reconstructed + Blender 3.4.1 certified)
 *   - `p1g_mastered` (Preserved P1-G v3.0 Mastered checkpoint)
 *   - `meshy_custom` (External Meshy / Blender imported + auto-rigged GLBs)
 *   - `procedural_fallback` (In-engine CharacterBuilder rig)
 * Characters without an approved character sheet (Bovar) remain strictly gated as
 * `awaiting_visual_approval` rather than inventing an unapproved design.
 */
export const CHARACTER_ASSET_REGISTRY: Record<RosterCharacterId, CharacterAssetManifestEntry> = {
  kai: {
    id: 'kai',
    displayName: 'Kai — Memory-Web Heir',
    role: 'playable-hero',
    visualAuthorityStatus: 'approved',
    authorityReferences: [
      '/assets/aistudio/ChatGPT_Image_Aug_3__2026__04_50_12_PM__1__078f6bfc.png',
    ],
    masterGlbUrl: '/models/characters/kai_master.glb',
    lod1GlbUrl: '/models/characters/kai_lod1.glb',
    p1iMasterGlbUrl: '/models/characters/p1i/kai_master.glb',
    p1iLod1GlbUrl: '/models/characters/p1i/kai_lod1.glb',
    p1gMasterGlbUrl: '/models/characters/p1g/kai_master.glb',
    p1gLod1GlbUrl: '/models/characters/p1g/kai_lod1.glb',
    meshyMasterGlbUrl: '/models/characters/meshy/kai_master.glb',
    meshyLod1GlbUrl: '/models/characters/meshy/kai_lod1.glb',
    multiviewSheetUrl: '/models/reconstruction-sheets/kai/turnaround_4view.jpg',
    standingHeightMeters: 1.82,
    maxTrianglesMaster: 30000,
    maxTrianglesLod1: 12000,
    spiderLimbCount: 4,
    maneSpikeCount: 0,
    physicalTailCount: 0,
    requiredClips: REQUIRED_HERO_ANIMATION_CLIPS,
    requiredMorphs: REQUIRED_FACIAL_MORPHS,
    notes:
      'Silver-white sabertooth beast with glowing violet eyes, brow horn-crests, open white/purple street-techwear jacket, clawed high-top sneakers, and 4 articulated dorsal spider limbs (12 spider bones).',
  },
  jax: {
    id: 'jax',
    displayName: 'Jax — Storm Fang',
    role: 'playable-hero',
    visualAuthorityStatus: 'approved',
    authorityReferences: [
      '/assets/aistudio/ChatGPT_Image_Aug_3__2026__04_50_12_PM__1__078f6bfc.png',
    ],
    masterGlbUrl: '/models/characters/jax_master.glb',
    lod1GlbUrl: '/models/characters/jax_lod1.glb',
    p1iMasterGlbUrl: '/models/characters/p1i/jax_master.glb',
    p1iLod1GlbUrl: '/models/characters/p1i/jax_lod1.glb',
    p1gMasterGlbUrl: '/models/characters/p1g/jax_master.glb',
    p1gLod1GlbUrl: '/models/characters/p1g/jax_lod1.glb',
    meshyMasterGlbUrl: '/models/characters/meshy/jax_master.glb',
    meshyLod1GlbUrl: '/models/characters/meshy/jax_lod1.glb',
    multiviewSheetUrl: '/models/reconstruction-sheets/jax/turnaround_4view.jpg',
    standingHeightMeters: 1.88,
    maxTrianglesMaster: 30000,
    maxTrianglesLod1: 12000,
    spiderLimbCount: 0,
    maneSpikeCount: 7,
    physicalTailCount: 0,
    requiredClips: REQUIRED_HERO_ANIMATION_CLIPS,
    requiredMorphs: REQUIRED_FACIAL_MORPHS,
    notes:
      'Obsidian-furred sabertooth beast with blazing electric-blue eyes, 7 roaring storm-mane crests (7 mane bones), lightning-veined black bomber jacket, cobalt sash, and clawed storm sneakers.',
  },
  kaijax: {
    id: 'kaijax',
    displayName: 'Kai-Jax — The Memory Hero',
    role: 'fused-hero',
    visualAuthorityStatus: 'approved',
    authorityReferences: [
      '/assets/aistudio/ChatGPT_Image_Aug_3__2026__04_50_12_PM__1__078f6bfc.png',
    ],
    masterGlbUrl: '/models/characters/kaijax_master.glb',
    lod1GlbUrl: '/models/characters/kaijax_lod1.glb',
    p1iMasterGlbUrl: '/models/characters/p1i/kaijax_master.glb',
    p1iLod1GlbUrl: '/models/characters/p1i/kaijax_lod1.glb',
    p1gMasterGlbUrl: '/models/characters/p1g/kaijax_master.glb',
    p1gLod1GlbUrl: '/models/characters/p1g/kaijax_lod1.glb',
    meshyMasterGlbUrl: '/models/characters/meshy/kaijax_master.glb',
    meshyLod1GlbUrl: '/models/characters/meshy/kaijax_lod1.glb',
    multiviewSheetUrl: '/models/reconstruction-sheets/kaijax/turnaround_4view.jpg',
    standingHeightMeters: 2.04,
    maxTrianglesMaster: 35000,
    maxTrianglesLod1: 14000,
    spiderLimbCount: 4,
    maneSpikeCount: 7,
    physicalTailCount: 3,
    tailIdentities: ['Ember Memory (Pyraxis)', 'Storm Current (Kar-Voth)', 'Memory Weave (Myrr\'Kai)'],
    requiredClips: REQUIRED_HERO_ANIMATION_CLIPS,
    requiredMorphs: REQUIRED_FACIAL_MORPHS,
    notes:
      'Split Yin-Yang silver-white & obsidian sabertooth fusion hero with gold/blue dual eyes, high-collared purple/white/gold fusion coat, 4 spider limbs, 7 storm-mane crests, and strictly 3 primary physical tails (12 tail bones). Nine Energy Domains remain passive progression.',
  },
  boryn: {
    id: 'boryn',
    displayName: 'Boryn — The Shield',
    role: 'mentor-npc',
    visualAuthorityStatus: 'approved',
    authorityReferences: [
      '/assets/aistudio/ChatGPT_Image_Aug_3__2026__04_50_12_PM__1__078f6bfc.png',
      '/assets/aistudio/ChatGPT_Image_Aug_3__2026__04_50_13_PM__3__3e003001.png',
    ],
    masterGlbUrl: '/models/characters/boryn_master.glb',
    lod1GlbUrl: '/models/characters/boryn_lod1.glb',
    p1iMasterGlbUrl: '/models/characters/p1i/boryn_master.glb',
    p1iLod1GlbUrl: '/models/characters/p1i/boryn_lod1.glb',
    p1gMasterGlbUrl: '/models/characters/p1g/boryn_master.glb',
    p1gLod1GlbUrl: '/models/characters/p1g/boryn_lod1.glb',
    meshyMasterGlbUrl: '/models/characters/meshy/boryn_master.glb',
    meshyLod1GlbUrl: '/models/characters/meshy/boryn_lod1.glb',
    multiviewSheetUrl: '/models/reconstruction-sheets/boryn/turnaround_4view.jpg',
    standingHeightMeters: 2.12,
    maxTrianglesMaster: 28000,
    maxTrianglesLod1: 11000,
    spiderLimbCount: 0,
    maneSpikeCount: 0,
    physicalTailCount: 1,
    requiredClips: REQUIRED_HERO_ANIMATION_CLIPS,
    requiredMorphs: REQUIRED_FACIAL_MORPHS,
    notes:
      'Broad orange-and-black striped sabertooth tiger warrior-father with tactical leather/iron harness, beast-skull belt buckle, burnt-orange runic tabard, and 1 striped tiger tail (4 tail bones).',
  },
  borax: {
    id: 'borax',
    displayName: 'Borax — The Law',
    role: 'mentor-npc',
    visualAuthorityStatus: 'approved',
    authorityReferences: [
      '/assets/aistudio/ChatGPT_Image_Aug_3__2026__04_50_12_PM__1__078f6bfc.png',
      '/assets/aistudio/ChatGPT_Image_Aug_3__2026__04_50_13_PM__3__3e003001.png',
    ],
    masterGlbUrl: '/models/characters/borax_master.glb',
    lod1GlbUrl: '/models/characters/borax_lod1.glb',
    p1iMasterGlbUrl: '/models/characters/p1i/borax_master.glb',
    p1iLod1GlbUrl: '/models/characters/p1i/borax_lod1.glb',
    p1gMasterGlbUrl: '/models/characters/p1g/borax_master.glb',
    p1gLod1GlbUrl: '/models/characters/p1g/borax_lod1.glb',
    meshyMasterGlbUrl: '/models/characters/meshy/borax_master.glb',
    meshyLod1GlbUrl: '/models/characters/meshy/borax_lod1.glb',
    multiviewSheetUrl: '/models/reconstruction-sheets/borax/turnaround_4view.jpg',
    standingHeightMeters: 2.2,
    maxTrianglesMaster: 30000,
    maxTrianglesLod1: 12000,
    spiderLimbCount: 0,
    maneSpikeCount: 0,
    physicalTailCount: 1,
    requiredClips: REQUIRED_HERO_ANIMATION_CLIPS,
    requiredMorphs: REQUIRED_FACIAL_MORPHS,
    notes:
      'Towering silver-maned sabertooth lion Storm Ronin mentor in layered navy-indigo & gold samurai robes with vertical calligraphy scroll sash, storm lightning aura, and 1 lion tail (4 tail bones).',
  },
  bovar: {
    id: 'bovar',
    displayName: 'Bovar — Adoptive Father',
    role: 'family-anchor',
    visualAuthorityStatus: 'awaiting_visual_approval',
    authorityReferences: ['Awaiting Official Bovar Character Sheet'],
    masterGlbUrl: null,
    lod1GlbUrl: null,
    p1iMasterGlbUrl: null,
    p1iLod1GlbUrl: null,
    p1gMasterGlbUrl: null,
    p1gLod1GlbUrl: null,
    meshyMasterGlbUrl: null,
    meshyLod1GlbUrl: null,
    multiviewSheetUrl: null,
    standingHeightMeters: 1.92,
    maxTrianglesMaster: 28000,
    maxTrianglesLod1: 11000,
    spiderLimbCount: 0,
    maneSpikeCount: 0,
    physicalTailCount: 0,
    requiredClips: REQUIRED_HERO_ANIMATION_CLIPS,
    requiredMorphs: REQUIRED_FACIAL_MORPHS,
    notes:
      'Gated per Visual Authority Rule: Fathers/Mentors sheet depicts Boryn, Borax, and Vharok. Bovar GLB remains withheld until official Bovar reference art is approved.',
  },
};

export function resolveCharacterGlbUrl(
  characterId: RosterCharacterId,
  quality: GraphicsQuality,
  preferLod1 = false,
  modelVersion: CharacterModelVersion = 'p1i_reconstructed'
): string | null {
  const entry = CHARACTER_ASSET_REGISTRY[characterId];
  if (!entry || entry.visualAuthorityStatus !== 'approved') {
    return null;
  }
  if (modelVersion === 'procedural_fallback') {
    return null;
  }
  const useLod1 = quality === 'low' || preferLod1;
  if (modelVersion === 'p1g_mastered') {
    return useLod1 ? (entry.p1gLod1GlbUrl ?? entry.p1gMasterGlbUrl) : entry.p1gMasterGlbUrl;
  }
  if (modelVersion === 'meshy_custom') {
    return useLod1 ? (entry.meshyLod1GlbUrl ?? entry.meshyMasterGlbUrl) : entry.meshyMasterGlbUrl;
  }
  // Default 'p1i_reconstructed' resolves canonical /models/characters/<id>_{master|lod1}.glb
  return useLod1 ? (entry.lod1GlbUrl ?? entry.masterGlbUrl) : entry.masterGlbUrl;
}

export function resolveCharacterFallbackChain(
  characterId: RosterCharacterId,
  quality: GraphicsQuality,
  preferLod1 = false,
  modelVersion: CharacterModelVersion = 'p1i_reconstructed'
): string[] {
  if (modelVersion === 'procedural_fallback') return [];
  const candidates: (string | null)[] = [];
  if (modelVersion === 'meshy_custom') {
    candidates.push(
      resolveCharacterGlbUrl(characterId, quality, preferLod1, 'meshy_custom'),
      resolveCharacterGlbUrl(characterId, quality, preferLod1, 'p1i_reconstructed'),
      resolveCharacterGlbUrl(characterId, quality, preferLod1, 'p1g_mastered')
    );
  } else if (modelVersion === 'p1g_mastered') {
    candidates.push(
      resolveCharacterGlbUrl(characterId, quality, preferLod1, 'p1g_mastered'),
      resolveCharacterGlbUrl(characterId, quality, preferLod1, 'p1i_reconstructed')
    );
  } else {
    candidates.push(
      resolveCharacterGlbUrl(characterId, quality, preferLod1, 'p1i_reconstructed'),
      resolveCharacterGlbUrl(characterId, quality, preferLod1, 'p1g_mastered')
    );
  }
  return Array.from(new Set(candidates.filter((u): u is string => Boolean(u))));
}

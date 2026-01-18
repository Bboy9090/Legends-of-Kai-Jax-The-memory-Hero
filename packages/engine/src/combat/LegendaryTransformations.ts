/**
 * OMEGA PROTOCOL: LEGENDARY TRANSFORMATION SYSTEM
 * 
 * "Transformations must be mid-combat, instant, and alter the character's
 * entire moveset, frame-data, and gravity curve in real-time."
 * 
 * Ultimate legendary god transformations for:
 * - Kai-Jax: Memory Strand Manipulation
 * - Umbra-Flux: Stellar Cascade
 * - Boryx Zenith: Guardian's Wrath
 * - Lunara Solis: Radiant Nexus
 * 
 * Each transformation:
 * - Changes visual appearance dramatically
 * - Alters all stats and frame data
 * - Has unique visual effects and auras
 * - Tied to Trinity meter thresholds
 */

import { 
  TransformationDefinition, 
  StatModifiers, 
  FrameDataModifiers, 
  VisualEffectConfig 
} from './TransformationSystem';

export interface LegendaryTransformation extends TransformationDefinition {
  tier: TransformationTier;
  trinityRequirement: {
    synergy: number;
    resonance: number;
    dread?: number; // Optional dread requirement
  };
  auraConfig: AuraConfig;
  bodyMorphs: BodyMorph[];
  vfxSequence: VFXEvent[];
  audioSequence: AudioEvent[];
  uniqueMechanics?: UniqueMechanic[];
}

export type TransformationTier = 'awakening' | 'ascension' | 'apex' | 'omega';

export interface AuraConfig {
  innerColor: { r: number; g: number; b: number };
  outerColor: { r: number; g: number; b: number };
  intensity: number;
  pulseSpeed: number;
  particleCount: number;
  particleSpeed: number;
  trailLength: number;
  trailColor: { r: number; g: number; b: number };
  lightningEnabled: boolean;
  lightningColor?: { r: number; g: number; b: number };
  distortionStrength: number;
}

export interface BodyMorph {
  target: 'hair' | 'eyes' | 'body' | 'tail' | 'quills' | 'wings' | 'aura';
  colorShift?: { r: number; g: number; b: number };
  scaleMultiplier?: number;
  emissive?: boolean;
  emissiveIntensity?: number;
  additionalGeometry?: string;
}

export interface VFXEvent {
  type: 'burst' | 'sustained' | 'trail' | 'screen_effect';
  startFrame: number;
  duration: number;
  data: Record<string, unknown>;
}

export interface AudioEvent {
  type: 'sfx' | 'voice' | 'stinger';
  startFrame: number;
  soundId: string;
  volume: number;
}

export interface UniqueMechanic {
  id: string;
  name: string;
  description: string;
  triggerCondition: string;
  effect: string;
  cost?: { synergy?: number; resonance?: number };
}

/**
 * KAI-JAX: MEMORY STRAND MANIPULATION
 * "Can rewind personal timeline 3 seconds (costs 30% Resonance)"
 */
export const KAI_JAX_TRANSFORMATIONS: LegendaryTransformation[] = [
  // Awakening: Memory Echo
  {
    id: 'kai_jax_awakening',
    name: 'Memory Echo',
    description: 'The first strand awakens, trailing liquid echoes of past movements.',
    tier: 'awakening',
    
    trinityRequirement: { synergy: 30, resonance: 40 },
    
    statModifiers: {
      weight: 1.0,
      walkSpeed: 1.15,
      runSpeed: 1.2,
      airSpeed: 1.1,
      jumpHeight: 1.1,
      fallSpeed: 1.0,
      fastFallSpeed: 1.0,
      attackPower: 1.1,
      defense: 1.05,
    },
    
    frameDataModifiers: {
      startupMultiplier: 0.95, // 5% faster startup
      activeMultiplier: 1.1,
      recoveryMultiplier: 0.9, // 10% less recovery
      animationSpeedMultiplier: 1.1,
    },
    
    auraConfig: {
      innerColor: { r: 255, g: 215, b: 0 },
      outerColor: { r: 26, g: 26, b: 46 },
      intensity: 0.6,
      pulseSpeed: 2.0,
      particleCount: 20,
      particleSpeed: 1.5,
      trailLength: 8,
      trailColor: { r: 255, g: 215, b: 0 },
      lightningEnabled: false,
      distortionStrength: 0.02,
    },
    
    bodyMorphs: [
      { target: 'eyes', colorShift: { r: 255, g: 215, b: 0 }, emissive: true, emissiveIntensity: 0.6 },
      { target: 'quills', colorShift: { r: 50, g: 50, b: 80 }, scaleMultiplier: 1.2 },
      { target: 'tail', emissive: true, emissiveIntensity: 0.3 },
    ],
    
    vfxSequence: [
      { type: 'burst', startFrame: 0, duration: 30, data: { size: 3, color: '#FFD700' } },
      { type: 'sustained', startFrame: 30, duration: -1, data: { aura: true } },
    ],
    
    audioSequence: [
      { type: 'sfx', startFrame: 0, soundId: 'transform_whoosh', volume: 0.8 },
      { type: 'voice', startFrame: 10, soundId: 'kai_jax_awaken', volume: 1.0 },
    ],
    
    visualEffects: {
      auraColor: { r: 255, g: 215, b: 0 },
      auraIntensity: 0.6,
      particleEffect: 'memory_particles',
      screenFlash: true,
      screenFlashColor: { r: 255, g: 215, b: 0 },
      glowEffect: true,
    },
    
    duration: 30000, // 30 seconds
    cooldown: 45000,
  },
  
  // Apex: Archive King
  {
    id: 'kai_jax_apex',
    name: 'Archive King',
    description: 'All three strands unite. Memory becomes weapon.',
    tier: 'apex',
    
    trinityRequirement: { synergy: 80, resonance: 80 },
    
    statModifiers: {
      weight: 1.1,
      walkSpeed: 1.4,
      runSpeed: 1.5,
      airSpeed: 1.3,
      jumpHeight: 1.25,
      fallSpeed: 0.9,
      fastFallSpeed: 1.1,
      attackPower: 1.35,
      defense: 1.2,
    },
    
    frameDataModifiers: {
      startupMultiplier: 0.8, // 20% faster startup
      activeMultiplier: 1.3,
      recoveryMultiplier: 0.75, // 25% less recovery
      animationSpeedMultiplier: 1.25,
    },
    
    auraConfig: {
      innerColor: { r: 255, g: 255, b: 255 },
      outerColor: { r: 255, g: 215, b: 0 },
      intensity: 1.0,
      pulseSpeed: 3.0,
      particleCount: 50,
      particleSpeed: 3.0,
      trailLength: 15,
      trailColor: { r: 255, g: 255, b: 255 },
      lightningEnabled: true,
      lightningColor: { r: 200, g: 220, b: 255 },
      distortionStrength: 0.08,
    },
    
    bodyMorphs: [
      { target: 'eyes', colorShift: { r: 255, g: 255, b: 255 }, emissive: true, emissiveIntensity: 1.0 },
      { target: 'body', colorShift: { r: 200, g: 200, b: 220 }, emissive: true, emissiveIntensity: 0.3 },
      { target: 'quills', colorShift: { r: 255, g: 255, b: 255 }, scaleMultiplier: 1.5, emissive: true, emissiveIntensity: 0.8 },
      { target: 'tail', scaleMultiplier: 1.3, emissive: true, emissiveIntensity: 0.6 },
      { target: 'aura', additionalGeometry: 'crown_of_stars' },
    ],
    
    vfxSequence: [
      { type: 'burst', startFrame: 0, duration: 60, data: { size: 8, color: '#FFFFFF', shockwave: true } },
      { type: 'screen_effect', startFrame: 0, duration: 30, data: { flash: true, desaturate: true } },
      { type: 'sustained', startFrame: 60, duration: -1, data: { aura: true, lightning: true } },
    ],
    
    audioSequence: [
      { type: 'stinger', startFrame: 0, soundId: 'apex_transform', volume: 1.0 },
      { type: 'voice', startFrame: 15, soundId: 'kai_jax_apex_line', volume: 1.0 },
    ],
    
    visualEffects: {
      auraColor: { r: 255, g: 255, b: 255 },
      auraIntensity: 1.0,
      particleEffect: 'archive_king_particles',
      screenFlash: true,
      screenFlashColor: { r: 255, g: 255, b: 255 },
      trailColor: { r: 255, g: 215, b: 0 },
      glowEffect: true,
    },
    
    uniqueMechanics: [
      {
        id: 'memory_rewind',
        name: 'Memory Rewind',
        description: 'Rewind personal timeline 3 seconds',
        triggerCondition: 'special_input',
        effect: 'restore_position_and_state_from_3_seconds_ago',
        cost: { resonance: 30 },
      },
      {
        id: 'legacy_convergence',
        name: 'Legacy Convergence',
        description: 'At 100% Resonance, shapeshifts body parts to mirror legends of old',
        triggerCondition: 'resonance_max',
        effect: 'temporary_moveset_override_from_random_legend',
      },
    ],
    
    duration: 20000, // 20 seconds
    cooldown: 90000,
  },
];

/**
 * UMBRA-FLUX: STELLAR CASCADE
 * "Creates 7 psychokinetic clones (costs 50% Resonance)"
 */
export const UMBRA_FLUX_TRANSFORMATIONS: LegendaryTransformation[] = [
  {
    id: 'umbra_flux_velocity_wraith',
    name: 'Velocity Wraith',
    description: 'Speed transcends physicality. After-images become attacks.',
    tier: 'apex',
    
    trinityRequirement: { synergy: 70, resonance: 60 },
    
    statModifiers: {
      weight: 0.85, // Lighter for speed
      walkSpeed: 1.8,
      runSpeed: 2.0,
      airSpeed: 1.7,
      jumpHeight: 1.4,
      fallSpeed: 1.2,
      fastFallSpeed: 1.5,
      attackPower: 1.2,
      defense: 0.9, // Glass cannon
    },
    
    frameDataModifiers: {
      startupMultiplier: 0.7, // 30% faster startup
      activeMultiplier: 1.0,
      recoveryMultiplier: 0.65, // 35% less recovery
      animationSpeedMultiplier: 1.4,
    },
    
    auraConfig: {
      innerColor: { r: 0, g: 206, b: 209 },
      outerColor: { r: 255, g: 255, b: 255 },
      intensity: 0.9,
      pulseSpeed: 5.0,
      particleCount: 40,
      particleSpeed: 5.0,
      trailLength: 20, // Long speed trail
      trailColor: { r: 0, g: 230, b: 255 },
      lightningEnabled: true,
      lightningColor: { r: 0, g: 255, b: 255 },
      distortionStrength: 0.1,
    },
    
    bodyMorphs: [
      { target: 'eyes', colorShift: { r: 0, g: 255, b: 255 }, emissive: true, emissiveIntensity: 1.0 },
      { target: 'body', colorShift: { r: 220, g: 240, b: 255 }, emissive: true, emissiveIntensity: 0.2 },
      { target: 'quills', colorShift: { r: 255, g: 255, b: 255 }, emissive: true, emissiveIntensity: 0.7 },
    ],
    
    vfxSequence: [
      { type: 'burst', startFrame: 0, duration: 20, data: { size: 5, color: '#00CED1', speed_lines: true } },
      { type: 'sustained', startFrame: 20, duration: -1, data: { after_images: true, trail: true } },
    ],
    
    audioSequence: [
      { type: 'sfx', startFrame: 0, soundId: 'velocity_burst', volume: 1.0 },
      { type: 'voice', startFrame: 5, soundId: 'umbra_flux_speed', volume: 0.9 },
    ],
    
    visualEffects: {
      auraColor: { r: 0, g: 206, b: 209 },
      auraIntensity: 0.9,
      particleEffect: 'speed_particles',
      screenFlash: true,
      screenFlashColor: { r: 200, g: 255, b: 255 },
      trailColor: { r: 0, g: 230, b: 255 },
      glowEffect: true,
    },
    
    uniqueMechanics: [
      {
        id: 'stellar_cascade',
        name: 'Stellar Cascade',
        description: 'Creates 7 psychokinetic clones that mirror attacks',
        triggerCondition: 'ultimate_input',
        effect: 'spawn_7_attack_clones',
        cost: { resonance: 50 },
      },
      {
        id: 'after_image_strike',
        name: 'After-Image Strike',
        description: 'After-images deal 20% damage on contact',
        triggerCondition: 'dash_through_enemy',
        effect: 'after_images_become_hitboxes',
      },
    ],
    
    duration: 15000,
    cooldown: 60000,
  },
];

/**
 * BORYX ZENITH: GUARDIAN'S WRATH
 * "Ground pound creates 15m shockwave (20% damage + stun)"
 */
export const BORYX_ZENITH_TRANSFORMATIONS: LegendaryTransformation[] = [
  {
    id: 'boryx_guardian_king',
    name: 'Guardian King',
    description: 'The earth answers. Reality anchors to your will.',
    tier: 'apex',
    
    trinityRequirement: { synergy: 50, resonance: 70, dread: 40 },
    
    statModifiers: {
      weight: 1.4, // Much heavier
      walkSpeed: 0.9,
      runSpeed: 0.85,
      airSpeed: 0.8,
      jumpHeight: 0.9,
      fallSpeed: 1.3,
      fastFallSpeed: 1.5,
      attackPower: 1.5, // Huge damage boost
      defense: 1.4, // Tank
    },
    
    frameDataModifiers: {
      startupMultiplier: 1.1, // Slightly slower startup
      activeMultiplier: 1.5, // Long active frames
      recoveryMultiplier: 1.0,
      animationSpeedMultiplier: 0.9,
    },
    
    auraConfig: {
      innerColor: { r: 246, g: 193, b: 119 },
      outerColor: { r: 139, g: 69, b: 19 },
      intensity: 0.8,
      pulseSpeed: 1.5,
      particleCount: 30,
      particleSpeed: 0.8,
      trailLength: 5,
      trailColor: { r: 200, g: 150, b: 80 },
      lightningEnabled: false,
      distortionStrength: 0.04,
    },
    
    bodyMorphs: [
      { target: 'body', scaleMultiplier: 1.15, colorShift: { r: 160, g: 140, b: 120 } },
      { target: 'eyes', colorShift: { r: 255, g: 180, b: 50 }, emissive: true, emissiveIntensity: 0.8 },
      { target: 'aura', additionalGeometry: 'stone_armor_overlay' },
    ],
    
    vfxSequence: [
      { type: 'burst', startFrame: 0, duration: 45, data: { size: 6, color: '#F6C177', ground_crack: true } },
      { type: 'sustained', startFrame: 45, duration: -1, data: { earth_aura: true, gravity_distortion: true } },
    ],
    
    audioSequence: [
      { type: 'sfx', startFrame: 0, soundId: 'earth_rumble', volume: 1.0 },
      { type: 'voice', startFrame: 20, soundId: 'boryx_roar', volume: 1.0 },
    ],
    
    visualEffects: {
      auraColor: { r: 246, g: 193, b: 119 },
      auraIntensity: 0.8,
      particleEffect: 'earth_particles',
      screenFlash: true,
      screenFlashColor: { r: 200, g: 150, b: 80 },
      glowEffect: true,
    },
    
    uniqueMechanics: [
      {
        id: 'guardians_wrath',
        name: "Guardian's Wrath",
        description: 'Ground pound creates 15m shockwave (20% damage + stun)',
        triggerCondition: 'down_special_grounded',
        effect: 'aoe_shockwave_with_stun',
      },
      {
        id: 'reality_pin',
        name: 'Reality Pin',
        description: 'Anchor zones reduce knockback and slow enemies',
        triggerCondition: 'special_moves_grounded',
        effect: 'create_pin_zone',
      },
    ],
    
    duration: 25000,
    cooldown: 75000,
  },
];

/**
 * LUNARA SOLIS: RADIANT NEXUS
 * "Heals allies 20% HP, damages enemies 15% HP/sec (solar pillar)"
 */
export const LUNARA_SOLIS_TRANSFORMATIONS: LegendaryTransformation[] = [
  {
    id: 'lunara_oracle_sentinel',
    name: 'Oracle Sentinel',
    description: 'Sun and moon converge. Probability bends to prophecy.',
    tier: 'apex',
    
    trinityRequirement: { synergy: 60, resonance: 80 },
    
    statModifiers: {
      weight: 1.0,
      walkSpeed: 1.1,
      runSpeed: 1.15,
      airSpeed: 1.2,
      jumpHeight: 1.3, // Floaty
      fallSpeed: 0.7, // Very floaty
      fastFallSpeed: 1.0,
      attackPower: 1.25,
      defense: 1.3,
    },
    
    frameDataModifiers: {
      startupMultiplier: 0.9,
      activeMultiplier: 1.2,
      recoveryMultiplier: 0.85,
      animationSpeedMultiplier: 1.1,
    },
    
    auraConfig: {
      innerColor: { r: 255, g: 215, b: 0 }, // Solar gold
      outerColor: { r: 192, g: 192, b: 192 }, // Lunar silver
      intensity: 1.0,
      pulseSpeed: 2.5,
      particleCount: 60,
      particleSpeed: 2.0,
      trailLength: 12,
      trailColor: { r: 255, g: 245, b: 200 },
      lightningEnabled: false,
      distortionStrength: 0.05,
    },
    
    bodyMorphs: [
      { target: 'body', colorShift: { r: 255, g: 250, b: 240 }, emissive: true, emissiveIntensity: 0.4 },
      { target: 'eyes', colorShift: { r: 255, g: 215, b: 0 }, emissive: true, emissiveIntensity: 1.0 },
      { target: 'tail', scaleMultiplier: 1.2, emissive: true, emissiveIntensity: 0.6 },
      { target: 'aura', additionalGeometry: 'star_crown' },
    ],
    
    vfxSequence: [
      { type: 'burst', startFrame: 0, duration: 50, data: { size: 7, color: '#FFD700', solar_flare: true } },
      { type: 'sustained', startFrame: 50, duration: -1, data: { celestial_aura: true, star_particles: true } },
    ],
    
    audioSequence: [
      { type: 'stinger', startFrame: 0, soundId: 'celestial_chorus', volume: 1.0 },
      { type: 'voice', startFrame: 25, soundId: 'lunara_prophecy', volume: 0.9 },
    ],
    
    visualEffects: {
      auraColor: { r: 255, g: 215, b: 0 },
      auraIntensity: 1.0,
      particleEffect: 'celestial_particles',
      screenFlash: true,
      screenFlashColor: { r: 255, g: 245, b: 200 },
      glowEffect: true,
    },
    
    uniqueMechanics: [
      {
        id: 'radiant_nexus',
        name: 'Radiant Nexus',
        description: 'Heals allies 20% HP, damages enemies 15% HP/sec (solar pillar)',
        triggerCondition: 'ultimate_input',
        effect: 'create_solar_pillar_heal_damage_zone',
      },
      {
        id: 'oracle_vision',
        name: 'Oracle Vision',
        description: 'Briefly see opponent inputs before they execute',
        triggerCondition: 'resonance_above_80',
        effect: 'input_prediction_display',
        cost: { resonance: 10 },
      },
    ],
    
    duration: 20000,
    cooldown: 80000,
  },
];

/**
 * Get all legendary transformations
 */
export function getAllLegendaryTransformations(): LegendaryTransformation[] {
  return [
    ...KAI_JAX_TRANSFORMATIONS,
    ...UMBRA_FLUX_TRANSFORMATIONS,
    ...BORYX_ZENITH_TRANSFORMATIONS,
    ...LUNARA_SOLIS_TRANSFORMATIONS,
  ];
}

/**
 * Get transformations for a specific character
 */
export function getTransformationsForCharacter(characterId: string): LegendaryTransformation[] {
  const normalizedId = characterId.toLowerCase().replace(/[^a-z]/g, '_');
  
  if (normalizedId.includes('kai') || normalizedId.includes('jax')) {
    return KAI_JAX_TRANSFORMATIONS;
  }
  if (normalizedId.includes('umbra') || normalizedId.includes('flux')) {
    return UMBRA_FLUX_TRANSFORMATIONS;
  }
  if (normalizedId.includes('boryx') || normalizedId.includes('zenith')) {
    return BORYX_ZENITH_TRANSFORMATIONS;
  }
  if (normalizedId.includes('lunara') || normalizedId.includes('solis')) {
    return LUNARA_SOLIS_TRANSFORMATIONS;
  }
  
  return [];
}

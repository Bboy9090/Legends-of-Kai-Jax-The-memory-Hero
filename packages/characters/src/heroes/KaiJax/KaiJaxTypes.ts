/**
 * AUTHORITATIVE: Kai-Jax Character Types
 * 
 * Based on kai_jax.character.json (LOCKFILE)
 * Single source of truth for The Memory Hero
 * 
 * Kai-Jax: Wolf/Fox/Hedgehog/Spider hybrid with 9 tails
 * Role: Stance-shifting battlefield controller
 * Scales: 1v1 to 1v20+
 */

/**
 * Tail role definitions - Each tail has specific combat function
 */
export enum TailRole {
  BOND = 'bond',           // Tail 1: Parry/Counter/Revive
  HUNTER = 'hunter',       // Tail 2: Dash/Pursuit/Execute
  THREAD = 'thread',       // Tail 3: Web/Pull/Group
  QUILL = 'quill',         // Tail 4: Retaliation/Posture Damage
  SHADE = 'shade',         // Tail 5: Stealth/Threat Reset
  ANCHOR = 'anchor',       // Tail 6: Anti-Knockback/Root
  ECHO = 'echo',           // Tail 7: After-Image/Repeat
  RIFT = 'rift',           // Tail 8: Reality Tear/AOE
  CROWN = 'crown',         // Tail 9: Aura/Command
}

/**
 * Tail system interface - 9 independent tails with physics
 */
export interface TailSystem {
  tails: TailData[];
  activeTail: TailRole | null;
  comboState: {
    activeTails: TailRole[];
    synergy: number;
  };
}

/**
 * Individual tail data
 */
export interface TailData {
  index: number;           // 1-9
  role: TailRole;
  function: string;        // Descriptive function
  bonesPerTail: number;    // 5-7 bones per tail
  physicsEnabled: boolean;
  constraints: {
    swingLimit: number;    // Max swing angle in degrees
    twistLimit: number;    // Max twist angle in degrees
    noodlePhysics: boolean; // Must be false per spec
  };
}

/**
 * Anatomy specification from JSON
 */
export interface KaiJaxAnatomy {
  speciesComposite: ['wolf', 'fox', 'hedgehog', 'spider'];
  bodyType: 'humanoid_beast';
  heightMultiplier: 1.15;
  build: 'athletic_sinewy_predator';
  legs: 'digitigrade';
  hands: 'clawed_tool_capable';
  head: 'wolf_fox_hybrid_muzzle';
  spine: 'reinforced_with_ridge';
  tailCount: 9;
}

/**
 * Silhouette rules - Must be maintained across all platforms
 */
export interface SilhouetteRules {
  readableInShadow: true;
  noMascotProportions: true;
  noCapeSubstitution: true;
  tailsMustArc: 'crescent';
  antiDerivativeEnforced: true;
}

/**
 * Combat identity from JSON
 */
export interface CombatIdentity {
  role: 'stance_shifting_battlefield_controller';
  scalesFrom: '1v1';
  scalesTo: '1v20_plus';
  strengths: ['crowd_control', 'posture_break', 'zone_dominance'];
  weaknesses: ['overextension', 'corruption_overuse'];
}

/**
 * Material definitions for rendering
 */
export interface MaterialSpecs {
  fur: {
    type: 'card_or_shell';
    pbr: true;
    maps: ['albedo', 'normal', 'roughness'];
    notes: 'No painted fur. Density varies by region.';
  };
  skin: {
    pbr: true;
    subsurfaceScattering: true;
  };
  armor: {
    material: 'worn_foundry_steel';
    roughnessRange: [0.4, 0.6];
    edgeWear: true;
    cleanSurfacesDisallowed: true;
  };
  spikes: {
    material: 'bone_tech_hybrid';
    emissive: 'subtle_event_only';
  };
  weaveEnergy: {
    emissive: true;
    alwaysOn: false;
    mobileDisabled: true;
  };
}

/**
 * Rigging specification
 */
export interface RiggingSpec {
  skeletonType: 'humanoid_extended';
  singleSkeletonOnly: true;
  extraBones: {
    tails: {
      count: 9;
      bonesPerTail: [5, 7];
      physicsEnabled: true;
      constraints: {
        swingLimit: true;
        twistLimit: true;
        noodlePhysics: false;
      };
    };
    spineDeformation: true;
    jaw: true;
    ears: true;
  };
  facialSystem: {
    type: 'blendshapes';
    required: ['snarl', 'focus', 'pain', 'rage'];
    animeExaggeration: false;
  };
}

/**
 * Animation philosophy
 */
export interface AnimationPhilosophy {
  philosophy: 'mass_and_inertia';
  noFloatyMotion: true;
  rootMotionOnlyFor: ['finishers', 'heavy_knockdowns'];
  requiredSets: [
    'idle_calm',
    'idle_combat',
    'walk',
    'run',
    'sprint',
    'light_combo',
    'heavy_combo',
    'special_attacks',
    'dodge_ground',
    'dodge_air',
    'parry',
    'counter',
    'finisher',
    'hit_reactions',
    'death'
  ];
  frameRules: {
    minFramesPerAction: 12;
    cancelRules: 'hit_confirm_or_perfect_parry_only';
  };
}

/**
 * LOD (Level of Detail) targets
 */
export interface LODTargets {
  lod0: { triangles: [80000, 120000] };
  lod1: { triangles: [50000, 70000] };
  lod2: { triangles: [25000, 35000] };
}

/**
 * Mobile profile constraints
 */
export interface MobileProfile {
  allowedCuts: ['fur_shell_layers', 'secondary_emissive', 'minor_decals'];
  neverCut: ['silhouette', 'tail_count', 'animation_timing', 'posture_system', 'hit_stop'];
}

/**
 * Complete Kai-Jax character specification
 */
export interface KaiJaxSpec {
  characterId: 'kai_jax';
  displayName: 'Kai-Jax';
  title: 'The Memory Hero';
  version: '1.0.0';
  anatomy: KaiJaxAnatomy;
  silhouetteRules: SilhouetteRules;
  combatIdentity: CombatIdentity;
  tailSystem: TailSystem;
  materials: MaterialSpecs;
  rigging: RiggingSpec;
  animation: AnimationPhilosophy;
  lodTargets: LODTargets;
  mobileProfile: MobileProfile;
}

/**
 * Stance system for battlefield control
 */
export enum KaiJaxStance {
  NEUTRAL = 'neutral',     // Balanced stance
  AGGRESSIVE = 'aggressive', // Crowd control focus
  DEFENSIVE = 'defensive',  // Posture break prevention
  DOMINANT = 'dominant',    // Zone control active
}

/**
 * Extended combat stats for Kai-Jax
 */
export interface KaiJaxCombatStats {
  postureHealth: number;     // 0-100, broken at 0
  corruptionLevel: number;   // 0-100, weakness trigger
  zoneControl: number;       // Area of influence
  crowdControlActive: boolean;
  currentStance: KaiJaxStance;
}

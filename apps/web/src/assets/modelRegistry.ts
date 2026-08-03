import { getAssetPath } from '../lib/assetPath';

export interface GLBModelConfig {
  path: string;
  scale: number;
  position: [number, number, number];
  rotation?: [number, number, number];
  animationIndexIdle?: number;
  animationIndexWalk?: number;
  animationIndexRun?: number;
  animationIndexAttack?: number;
}

/**
 * CANONICAL CONSTRAINTS — V0.1.0 MVP
 *
 * These story and identity locks are immutable for the MVP release:
 *
 * CHARACTER IDENTITY:
 *   • Kai remains male and is Jax's older brother
 *   • Jax remains male and is Kai's younger brother
 *   • Both brothers are sapient anthropomorphic foxes with tails
 *
 * FUSION & TRANSFORMATION:
 *   • Kai-Jax is permanently and exclusively the fusion of Kai + Jax
 *   • Kai-Jax is the only nine-tail form (the Memory King system)
 *   • Kai and Jax cannot fuse with any other character
 *   • No future expansion may override this without an explicit canon rewrite approved by Bobby
 *   • Each brother's beast-hybrid forms (if any) preserve their base identity
 *
 * CORE MECHANICS:
 *   • The nine-tail system is Kai-Jax's exclusive signature power
 *   • Memory King mechanics remain tied to Kai-Jax fusion only
 *
 * These constraints are permanent canon locks, including beyond the MVP release.
 * Changes require an explicit canon rewrite approved by Bobby.
 */

/**
 * ⚡ LEGENDS OF KAI-JAX: CANONICAL MODEL REGISTRY ⚡
 *
 * SINGLE SOURCE OF TRUTH for all GLB character and boss models.
 * All models are Meshy.ai generated originals, owned by the project.
 *
 * Scale notes:
 *   - Heroes: 3.5 (standard)
 *   - Bosses: 4.0–5.0 (imposing)
 *   - The GLBModelInner component auto-normalizes to TARGET_HEIGHT
 */
export const MODEL_REGISTRY: Record<string, GLBModelConfig> = {

  // ============================================================
  // CORE HEROES — Meshy.ai originals with animations
  // ============================================================

  "kai-jax": {
    // Primary protagonist: The Memory Hero (Animated version)
    path: "/models/Meshy_AI_Animation_Walking_withSkin9TAILSKAIJAX.glb",
    scale: 3.5,
    position: [0, 0, 0],
    rotation: [0, Math.PI, 0],
  },
  kai_jax: {
    path: "/models/Meshy_AI_Animation_Walking_withSkin9TAILSKAIJAX.glb",
    scale: 3.5,
    position: [0, 0, 0],
    rotation: [0, Math.PI, 0],
  },
  kaijax: {
    path: "/models/Meshy_AI_Animation_Walking_withSkin9TAILSKAIJAX.glb",
    scale: 3.5,
    position: [0, 0, 0],
    rotation: [0, Math.PI, 0],
  },

  // Jaxon Swift — Shadow-sonic blitzer
  jaxon: {
    path: "/models/Meshy_AI_Meshy_Merged_AnimationsSHADOWSONICJAXKAI.glb",
    scale: 3.5,
    position: [0, 0, 0],
    rotation: [0, Math.PI, 0],
  },
  jax: {
    path: "/models/Meshy_AI_Meshy_Merged_AnimationsSHADOWSONICJAXKAI.glb",
    scale: 3.5,
    position: [0, 0, 0],
    rotation: [0, Math.PI, 0],
  },

  // Kaison Ember — Spider tactical blade
  kaison: {
    path: "/models/Meshy_AI_Animation_Walking_withSkinSPiDERKAIJAX9TIALS.glb",
    scale: 3.5,
    position: [0, 0, 0],
    rotation: [0, Math.PI, 0],
  },
  kai: {
    path: "/models/Meshy_AI_Meshy_Merged_Animations4KAI.glb",
    scale: 3.5,
    position: [0, 0, 0],
    rotation: [0, Math.PI, 0],
  },

  // Silver Chronos — Ice fox time sage
  silver: {
    path: "/models/Meshy_AI_Jax_Kai_icey_fox_0219223329_texture.glb",
    scale: 3.5,
    position: [0, 0, 0],
    rotation: [0, Math.PI, 0],
  },

  // Borax / Boryn — Lion guardian lineage
  borax: {
    path: "/models/Borax.glb",
    scale: 3.8,
    position: [0, 0, 0],
    rotation: [0, Math.PI, 0],
  },
  boryn: {
    path: "/models/BORYN.glb",
    scale: 3.8,
    position: [0, 0, 0],
    rotation: [0, Math.PI, 0],
  },

  // Lunara — Celestial moon warrior
  lunara: {
    path: "/models/lunara_solis_beast.glb",
    scale: 3.5,
    position: [0, 0, 0],
    rotation: [0, Math.PI, 0],
  },

  // Korg — Stone Warden tank
  korg: {
    path: "/models/granite_colossus.glb",
    scale: 4.2,
    position: [0, 0, 0],
    rotation: [0, Math.PI, 0],
  },

  // Puff — Void Wisp wildcard
  puff: {
    path: "/models/shadow_panther.glb",
    scale: 3.2,
    position: [0, 0, 0],
    rotation: [0, Math.PI, 0],
  },

  // Borgos — Iron Tyrant
  borgos: {
    path: "/models/Meshy_AI_Steelwolf_Exosuit_0219223344_texture.glb",
    scale: 4.0,
    position: [0, 0, 0],
    rotation: [0, Math.PI, 0],
  },

  // Volter — Lightning Beast
  volter: {
    path: "/models/Meshy_AI_Voltage_Fang_0219222028_texture.glb",
    scale: 3.5,
    position: [0, 0, 0],
    rotation: [0, Math.PI, 0],
  },

  // ============================================================
  // EXTENDED ROSTER
  // ============================================================

  kaxon: {
    path: "/models/Meshy_AI_Character_outputLIONBORAX.glb",
    scale: 3.5,
    position: [0, 0, 0],
    rotation: [0, Math.PI, 0],
  },
  "voltage-fang": {
    path: "/models/Meshy_AI_Voltage_Fang_0219222028_texture.glb",
    scale: 3.5,
    position: [0, 0, 0],
    rotation: [0, Math.PI, 0],
  },
  steelwolf: {
    path: "/models/Meshy_AI_Steelwolf_Exosuit_0219223344_texture.glb",
    scale: 3.5,
    position: [0, 0, 0],
    rotation: [0, Math.PI, 0],
  },
  "ashen-tiger": {
    path: "/models/Meshy_AI_Ashen_Tiger_Warrior_0219222741_texture.glb",
    scale: 3.5,
    position: [0, 0, 0],
    rotation: [0, Math.PI, 0],
  },
  "blazing-fox": {
    path: "/models/Meshy_AI_Blazing_Fox_Warrior_0219223318_texture.glb",
    scale: 3.5,
    position: [0, 0, 0],
    rotation: [0, Math.PI, 0],
  },
  "sabertooth": {
    path: "/models/Meshy_AI_Kai_sabertooth_fox_sp_0219223337_texture.glb",
    scale: 3.5,
    position: [0, 0, 0],
    rotation: [0, Math.PI, 0],
  },
  velocity: {
    path: "/models/Meshy_AI_Animation_Running_withSkinKAIJAXVARIANTSHADOIWSonic.glb",
    scale: 3.5,
    position: [0, 0, 0],
    rotation: [0, Math.PI, 0],
  },
  sparky: {
    path: "/models/jaxon_beast.glb",
    scale: 3.5,
    position: [0, 0, 0],
    rotation: [0, Math.PI, 0],
  },
  sentinel: {
    path: "/models/Meshy_AI_Jax_Stormfang_the_Arm_0219222010_texture.glb",
    scale: 3.5,
    position: [0, 0, 0],
    rotation: [0, Math.PI, 0],
  },
  solaro: {
    path: "/models/phoenix_warrior.glb",
    scale: 3.5,
    position: [0, 0, 0],
    rotation: [0, Math.PI, 0],
  },
  blaze: {
    path: "/models/emberwolf_warlord.glb",
    scale: 3.5,
    position: [0, 0, 0],
    rotation: [0, Math.PI, 0],
  },
  abyss: {
    path: "/models/voidonus_beast.glb",
    scale: 3.5,
    position: [0, 0, 0],
    rotation: [0, Math.PI, 0],
  },
  apex: {
    path: "/models/SABERVILLAIN.glb",
    scale: 3.5,
    position: [0, 0, 0],
    rotation: [0, Math.PI, 0],
  },

  // ============================================================
  // BOSSES
  // ============================================================

  "rift-warden": {
    path: "/models/spidersnipervillain.glb",
    scale: 4.0,
    position: [0, 0, 0],
    rotation: [0, Math.PI, 0],
  },
  "void-stalker": {
    path: "/models/darjshadowkaijax.glb",
    scale: 3.8,
    position: [0, 0, 0],
    rotation: [0, Math.PI, 0],
  },
  "rift-general": {
    path: "/models/bosssss.glb",
    scale: 4.5,
    position: [0, 0, 0],
    rotation: [0, Math.PI, 0],
  },
  "rift-general-prime": {
    path: "/models/bossssss.glb",
    scale: 4.5,
    position: [0, 0, 0],
    rotation: [0, Math.PI, 0],
  },
  "well-defiler": {
    path: "/models/spidersdrone.glb",
    scale: 4.2,
    position: [0, 0, 0],
    rotation: [0, Math.PI, 0],
  },
  "synergy-hunter": {
    path: "/models/KAITEENFOX.glb",
    scale: 3.8,
    position: [0, 0, 0],
    rotation: [0, Math.PI, 0],
  },
  "voidonus-imperion": {
    path: "/models/KAINJAXYN.glb",
    scale: 5.0,
    position: [0, 0, 0],
    rotation: [0, Math.PI, 0],
  },
  voidonus: {
    path: "/models/voidonus_beast.glb",
    scale: 4.5,
    position: [0, 0, 0],
    rotation: [0, Math.PI, 0],
  },

  // Legacy boss IDs (keeping for backwards compat)
  malakor: {
    path: "/models/boss.glb",
    scale: 4.0,
    position: [0, 0, 0],
    rotation: [0, Math.PI, 0],
  },
  behemoth: {
    path: "/models/bosssss.glb",
    scale: 5.0,
    position: [0, 0, 0],
    rotation: [0, Math.PI, 0],
  },

  // ============================================================
  // ENEMIES
  // ============================================================

  "hyena-scout": {
    path: "/models/hyenaratvbill.glb",
    scale: 3.2,
    position: [0, 0, 0],
    rotation: [0, Math.PI, 0],
  },
  "rift-drone": {
    path: "/models/drone.glb",
    scale: 3.5,
    position: [0, 0, 0],
    rotation: [0, Math.PI, 0],
  },
  "marble-gladiator": {
    path: "/models/marble_gladiator.glb",
    scale: 4.2,
    position: [0, 0, 0],
    rotation: [0, Math.PI, 0],
  },
  "granite-colossus": {
    path: "/models/granite_colossus.glb",
    scale: 4.5,
    position: [0, 0, 0],
    rotation: [0, Math.PI, 0],
  },
  "sandstone-sentinel": {
    path: "/models/sandstone_sentinel.glb",
    scale: 3.9,
    position: [0, 0, 0],
    rotation: [0, Math.PI, 0],
  },
  "neon-wraith": {
    path: "/models/neon-wraiths.glb",
    scale: 3.5,
    position: [0, 0, 0],
    rotation: [0, Math.PI, 0],
  },

  // ============================================================
  // QUATERNIUS MONSTER PACK — Elemental Beasts
  // ============================================================

  "earth-turtle": {
    path: "/models/earth_turtle.glb",
    scale: 4.0,
    position: [0, 0, 0],
    rotation: [0, Math.PI, 0],
  },
  "frost-wolf": {
    path: "/models/frost_wolf.glb",
    scale: 3.5,
    position: [0, 0, 0],
    rotation: [0, Math.PI, 0],
  },
  "jade-serpent": {
    path: "/models/jade_serpent.glb",
    scale: 4.5,
    position: [0, 0, 0],
    rotation: [0, Math.PI, 0],
  },
  "thunder-lion": {
    path: "/models/thunder_lion.glb",
    scale: 4.0,
    position: [0, 0, 0],
    rotation: [0, Math.PI, 0],
  },
};

export function getModelConfig(fighterId: string): GLBModelConfig | null {
  const config = MODEL_REGISTRY[fighterId] ?? null;
  if (config) {
    return {
      ...config,
      path: getAssetPath(config.path),
    };
  }
  return null;
}

export function getModelPath(fighterId: string): string | null {
  const path = MODEL_REGISTRY[fighterId]?.path ?? null;
  return path ? getAssetPath(path) : null;
}

export function hasModel(fighterId: string): boolean {
  return fighterId in MODEL_REGISTRY;
}

/**
 * Models preloaded at app startup for zero-latency battle entry.
 * Kai-Jax loads first since it's the default hero.
 */
export const PRELOAD_MODEL_IDS = ["kai-jax", "jaxon", "kaison"] as const;

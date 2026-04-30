export interface GLBModelConfig {
  path: string;
  scale: number;
  position: [number, number, number];
  rotation?: [number, number, number];
}

/**
 * Canonical runtime registry for all GLB character assets used by apps/web.
 *
 * Important:
 * - This is the ONLY source of truth for model paths in the active web app.
 * - Keep existing on-disk paths for now to avoid breaking current assets.
 * - Later, if assets are reorganized, update this file only.
 */
export const MODEL_REGISTRY: Record<string, GLBModelConfig> = {
  "kai-jax": {
    path: "/models/Meshy_AI_Character_output9TAILSKAIJAX.glb",
    scale: 3.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },
  kai_jax: {
    path: "/models/Meshy_AI_Character_output9TAILSKAIJAX.glb",
    scale: 3.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },

  kai: {
    path: "/models/Meshy_AI_Meshy_Merged_Animations4KAI.glb",
    scale: 3.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },

  jax: {
    path: "/models/Meshy_AI_Meshy_Merged_AnimationsSHADOWSONIC JAX.glb",
    scale: 3.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },

  jaxon: {
    path: "/models/Meshy_AI_Meshy_Merged_AnimationsSHADOWSONICJAXKAI.glb",
    scale: 3.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },

  kaison: {
    path: "/models/Meshy_AI_Character_outputSPiDERKAIJAX9TIALS.glb",
    scale: 3.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },

  kaxon: {
    path: "/models/Meshy_AI_Character_outputLIONBORAX.glb",
    scale: 3.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },

  "voltage-fang": {
    path: "/models/Meshy_AI_Meshy_Merged_AnimationsMeshy_AI_bipedBORYNaptFatherTIGER.glb",
    scale: 3.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },

  steelwolf: {
    path: "/models/Meshy_AI_Steelwolf_Exosuit_0219223344_texture.glb",
    scale: 3.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },

  "ashen-tiger": {
    path: "/models/Meshy_AI_Meshy_Merged_AnimationsMeshy_AI_bipedBORYNaptFatherTIGER.glb",
    scale: 3.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },

  "blazing-fox": {
    path: "/models/blazing-fox-vanguard.glb",
    scale: 3.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },

  velocity: {
    path: "/models/velocity_hero.glb",
    scale: 3.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },

  sparky: {
    path: "/models/sparky_hero.glb",
    scale: 3.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },

  sentinel: {
    path: "/models/sentinel_hero.glb",
    scale: 3.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },

  lunara: {
    path: "/models/lunara_hero.glb",
    scale: 3.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },

  solaro: {
    path: "/models/solaro_hero.glb",
    scale: 3.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },

  blaze: {
    path: "/models/blaze_hero.glb",
    scale: 3.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },

  abyss: {
    path: "/models/abyss_hero.glb",
    scale: 3.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },

  "marble-gladiator": {
    path: "/models/marble_gladiator.glb",
    scale: 4.2,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },

  "granite-colossus": {
    path: "/models/granite_colossus.glb",
    scale: 4.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },

  "sandstone-sentinel": {
    path: "/models/sandstone_sentinel.glb",
    scale: 3.9,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },

  apex: {
    path: "/models/apex_hero.glb",
    scale: 3.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },

  silver: {
    path: "/models/silver_hero.glb",
    scale: 3.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },

  "hyena-scout": {
    path: "/models/hyenaratvbill.glb",
    scale: 3.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },

  "rift-drone": {
    path: "/models/drone.glb",
    scale: 3.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },

  malakor: {
    path: "/models/boss.glb",
    scale: 4.0,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },

  behemoth: {
    path: "/models/bosssss.glb",
    scale: 5.0,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },
};

export function getModelConfig(fighterId: string): GLBModelConfig | null {
  return MODEL_REGISTRY[fighterId] ?? null;
}

export function getModelPath(fighterId: string): string | null {
  return MODEL_REGISTRY[fighterId]?.path ?? null;
}

export function hasModel(fighterId: string): boolean {
  return fighterId in MODEL_REGISTRY;
}

export const PRELOAD_MODEL_IDS = ["kai-jax", "kai", "jax"] as const;

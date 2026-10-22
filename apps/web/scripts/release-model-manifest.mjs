/**
 * Gold Slice production model manifest.
 *
 * Source filenames may retain historical working names inside the repository.
 * The distributed artifact uses neutral canonical filenames so development
 * history is not exposed as player-facing/release metadata.
 */
export const RELEASE_MODEL_SOURCE_MAP = Object.freeze({
  "kai-jax.glb": "Meshy_AI_Animation_Walking_withSkin9TAILSKAIJAX.glb",
  "kai-jax-run.glb": "Meshy_AI_Animation_Running_withSkin9TAILSKAIJAX.glb",
  "kai-jax-spin-kick.glb": "Meshy_AI_Animation_Lunge_Spin_Kick_withSkin9TAILSKAIJAX.glb",
  "kai-jax-high-kick.glb": "Meshy_AI_Animation_Step_in_High_Kick_withSkin9TAILSKAIJAX.glb",
  "jaxon.glb": "Meshy_AI_Meshy_Merged_AnimationsSHADOWSONICJAXKAI.glb",
  "kaison.glb": "Meshy_AI_Animation_Walking_withSkinSPiDERKAIJAX9TIALS.glb",
  "shadow_panther.glb": "shadow_panther.glb",
  "drone.glb": "drone.glb",
  "granite_colossus.glb": "granite_colossus.glb",
  "darjshadowkaijax.glb": "darjshadowkaijax.glb",
});

export const RELEASE_MODEL_FILES = Object.freeze(
  Object.keys(RELEASE_MODEL_SOURCE_MAP),
);

// GLB files are already compressed containers, so keep a raw-asset budget below
// the Play base-module ceiling and leave room for JS/audio/images/native shell.
// If this trips, optimize/split assets instead of silently widening the budget.
export const RELEASE_MODEL_BUDGET_MB = 180;

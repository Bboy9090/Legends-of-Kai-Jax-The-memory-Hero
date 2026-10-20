/**
 * Gold Slice production model manifest.
 *
 * This is deliberately narrower than MODEL_REGISTRY. MODEL_REGISTRY retains
 * historical/future identities for development, while a production Gold Slice
 * package may ship only assets reachable from the validated release routes.
 */
export const RELEASE_MODEL_FILES = Object.freeze([
  // Gold Slice playable legends.
  "Meshy_AI_Animation_Walking_withSkin9TAILSKAIJAX.glb",
  "Meshy_AI_Animation_Running_withSkin9TAILSKAIJAX.glb",
  "Meshy_AI_Animation_Lunge_Spin_Kick_withSkin9TAILSKAIJAX.glb",
  "Meshy_AI_Animation_Step_in_High_Kick_withSkin9TAILSKAIJAX.glb",
  "Meshy_AI_Meshy_Merged_AnimationsSHADOWSONICJAXKAI.glb",
  "Meshy_AI_Animation_Walking_withSkinSPiDERKAIJAX9TIALS.glb",

  // Mission 1 encounter archetypes.
  "shadow_panther.glb",
  "drone.glb",
  "granite_colossus.glb",
  "darjshadowkaijax.glb",
]);

// GLB files are already compressed containers, so keep a raw-asset budget below
// the Play base-module ceiling and leave room for JS/audio/images/native shell.
// If this trips, optimize/split assets instead of silently widening the budget.
export const RELEASE_MODEL_BUDGET_MB = 180;

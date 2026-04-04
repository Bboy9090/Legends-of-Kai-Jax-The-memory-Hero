/**
 * Shared camera mode labels for Phase 4 (readability + separation of concerns).
 * Battle: duel framing modes. Adventure: exploration vs combat vs soft lock-on.
 */
export type BattleCameraMode = "exploration" | "combat" | "lockOn";

export type AdventureCameraMode = "exploration" | "combat" | "lockOn";

/** Deterministic pseudo-random in [-1, 1] from integer seed (platform-agnostic). */
export function detRand11(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

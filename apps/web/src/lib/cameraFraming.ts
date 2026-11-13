/**
 * Aspect-aware framing for the adventure camera. Vertical FOV is fixed, so on a tall phone the
 * horizontal view collapses to a few world units and anything beside the hero (the partner, flanking
 * enemies) falls off screen. These helpers keep a minimum visible width at the hero's depth.
 */
export const MIN_VISIBLE_WIDTH = 6.4; // world units across the screen at the player's distance
export const PORTRAIT_FOV_BONUS = 9; // degrees added to the vertical FOV when the screen is tall

const rad = (deg: number) => (deg * Math.PI) / 180;

/** Horizontal world units visible at `distance` for a vertical FOV and aspect ratio. */
export function visibleWidth(distance: number, vfovDeg: number, aspect: number): number {
  return 2 * distance * Math.tan(rad(vfovDeg) / 2) * aspect;
}

/** Vertical FOV to use: wider on tall screens so the hero does not need to be pushed so far away. */
export function framedFov(baseFovDeg: number, aspect: number): number {
  if (!(aspect > 0) || aspect >= 1) return baseFovDeg;
  // Full bonus at phone portrait (~0.46), fading out by square.
  const t = Math.min(1, (1 - aspect) / 0.5);
  return baseFovDeg + PORTRAIT_FOV_BONUS * t;
}

/**
 * Factor (>= 1) to multiply camera distance and height by so at least MIN_VISIBLE_WIDTH is on screen.
 * Scaling both keeps the downward viewing angle unchanged.
 */
export function framingScale(distance: number, vfovDeg: number, aspect: number, minWidth = MIN_VISIBLE_WIDTH): number {
  if (!(distance > 0) || !(aspect > 0)) return 1;
  const have = visibleWidth(distance, vfovDeg, aspect);
  return have >= minWidth ? 1 : minWidth / have;
}

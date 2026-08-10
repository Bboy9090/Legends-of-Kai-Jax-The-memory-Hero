/**
 * LOD by layer — character_renderer_spec.
 * Reduce layers by distance, not polycount.
 */

import type { Vector3 } from "three";

export type CharacterLODLevel = 0 | 1 | 2 | 3;

/** Distance thresholds: close < d1 < mid < d2 < far < d3 < very far */
const D_CLOSE = 12;
const D_MID = 28;
const D_FAR = 50;

/**
 * Returns LOD level from camera-to-character distance.
 * 0 = close (all layers), 1 = mid (aura off), 2 = far (fur shell off), 3 = very far (base + emissive only).
 */
export function getCharacterLODLevel(
  cameraPosition: Vector3 | [number, number, number],
  characterPosition: Vector3 | [number, number, number]
): CharacterLODLevel {
  const cx = Array.isArray(cameraPosition) ? cameraPosition[0] : cameraPosition.x;
  const cy = Array.isArray(cameraPosition) ? cameraPosition[1] : cameraPosition.y;
  const cz = Array.isArray(cameraPosition) ? cameraPosition[2] : cameraPosition.z;
  const px = Array.isArray(characterPosition) ? characterPosition[0] : characterPosition.x;
  const py = Array.isArray(characterPosition) ? characterPosition[1] : characterPosition.y;
  const pz = Array.isArray(characterPosition) ? characterPosition[2] : characterPosition.z;
  const dx = cx - px;
  const dy = cy - py;
  const dz = cz - pz;
  const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
  if (d < D_CLOSE) return 0;
  if (d < D_MID) return 1;
  if (d < D_FAR) return 2;
  return 3;
}

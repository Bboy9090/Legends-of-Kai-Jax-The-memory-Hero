/** Move toward a target without overshooting and oscillating around it. */
export function moveTowards(current: number, target: number, maxDelta: number): number {
  const delta = target - current;
  const step = Math.max(0, maxDelta);
  if (Math.abs(delta) <= step) return target;
  return current + Math.sign(delta) * step;
}

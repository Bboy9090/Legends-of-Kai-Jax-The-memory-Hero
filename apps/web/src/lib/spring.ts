/** Damped spring integrated with sub-steps, so it stays stable at any frame time. */
export interface SpringState {
  pos: number;
  vel: number;
}

export function springStep(s: SpringState, target: number, dt: number, stiffness = 420, damping = 20): SpringState {
  let { pos, vel } = s;
  let remaining = Math.min(dt, 0.1);
  while (remaining > 0) {
    const h = Math.min(remaining, 1 / 240);
    vel += (stiffness * (target - pos) - damping * vel) * h;
    pos += vel * h;
    remaining -= h;
  }
  return { pos, vel };
}

export const isSettled = (s: SpringState, target: number, eps = 0.001) => Math.abs(s.pos - target) < eps && Math.abs(s.vel) < eps;

/**
 * Animation Easing Functions for Smooth, Realistic Movement
 * Based on Robert Penner's easing equations
 */

export type EasingFunction = (t: number) => number;

/**
 * Linear interpolation - no easing
 */
export const linear: EasingFunction = (t: number): number => t;

/**
 * Quadratic easing in - accelerating from zero velocity
 */
export const easeInQuad: EasingFunction = (t: number): number => t * t;

/**
 * Quadratic easing out - decelerating to zero velocity
 */
export const easeOutQuad: EasingFunction = (t: number): number => t * (2 - t);

/**
 * Quadratic easing in/out - acceleration until halfway, then deceleration
 */
export const easeInOutQuad: EasingFunction = (t: number): number => {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
};

/**
 * Cubic easing in - accelerating from zero velocity
 */
export const easeInCubic: EasingFunction = (t: number): number => t * t * t;

/**
 * Cubic easing out - decelerating to zero velocity
 */
export const easeOutCubic: EasingFunction = (t: number): number => {
  const t1 = t - 1;
  return t1 * t1 * t1 + 1;
};

/**
 * Cubic easing in/out - acceleration until halfway, then deceleration
 */
export const easeInOutCubic: EasingFunction = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
};

/**
 * Elastic easing out - exponentially decaying sine wave
 * Great for bouncy, springy animations
 */
export const easeOutElastic: EasingFunction = (t: number): number => {
  const c4 = (2 * Math.PI) / 3;
  return t === 0
    ? 0
    : t === 1
    ? 1
    : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
};

/**
 * Back easing out - overshoots target and comes back
 * Great for anticipation and follow-through
 */
export const easeOutBack: EasingFunction = (t: number): number => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

/**
 * Back easing in - pulls back before starting
 * Great for wind-up animations
 */
export const easeInBack: EasingFunction = (t: number): number => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return c3 * t * t * t - c1 * t * t;
};

/**
 * Bounce easing out - bouncing effect
 * Great for landing animations
 */
export const easeOutBounce: EasingFunction = (t: number): number => {
  const n1 = 7.5625;
  const d1 = 2.75;

  if (t < 1 / d1) {
    return n1 * t * t;
  } else if (t < 2 / d1) {
    return n1 * (t -= 1.5 / d1) * t + 0.75;
  } else if (t < 2.5 / d1) {
    return n1 * (t -= 2.25 / d1) * t + 0.9375;
  } else {
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  }
};

/**
 * Smooth step interpolation - smooth acceleration and deceleration
 * Great for camera movements
 */
export const smoothStep: EasingFunction = (t: number): number => {
  return t * t * (3 - 2 * t);
};

/**
 * Smoother step interpolation - even smoother than smoothStep
 * Great for ultra-smooth transitions
 */
export const smootherStep: EasingFunction = (t: number): number => {
  return t * t * t * (t * (t * 6 - 15) + 10);
};

/**
 * Interpolate between two values using an easing function
 */
export function lerp(start: number, end: number, t: number, easing: EasingFunction = linear): number {
  const easedT = easing(Math.max(0, Math.min(1, t)));
  return start + (end - start) * easedT;
}

/**
 * Interpolate between two angles (in radians) using the shortest path
 */
export function lerpAngle(start: number, end: number, t: number, easing: EasingFunction = linear): number {
  const easedT = easing(Math.max(0, Math.min(1, t)));
  
  // Normalize angles to [-PI, PI]
  const normalizeAngle = (angle: number) => {
    while (angle > Math.PI) angle -= Math.PI * 2;
    while (angle < -Math.PI) angle += Math.PI * 2;
    return angle;
  };
  
  start = normalizeAngle(start);
  end = normalizeAngle(end);
  
  // Find shortest path
  let diff = end - start;
  if (diff > Math.PI) diff -= Math.PI * 2;
  if (diff < -Math.PI) diff += Math.PI * 2;
  
  return start + diff * easedT;
}

/**
 * Spring physics simulation for natural movement
 */
export class Spring {
  private value: number;
  private velocity: number;
  private target: number;
  
  constructor(
    initialValue: number = 0,
    private stiffness: number = 170,
    private damping: number = 26
  ) {
    this.value = initialValue;
    this.velocity = 0;
    this.target = initialValue;
  }
  
  setTarget(target: number): void {
    this.target = target;
  }
  
  setValue(value: number): void {
    this.value = value;
    this.velocity = 0;
  }
  
  update(deltaTime: number): number {
    const force = this.stiffness * (this.target - this.value);
    const dampingForce = this.damping * this.velocity;
    const acceleration = force - dampingForce;
    
    this.velocity += acceleration * deltaTime;
    this.value += this.velocity * deltaTime;
    
    return this.value;
  }
  
  getValue(): number {
    return this.value;
  }
  
  getVelocity(): number {
    return this.velocity;
  }
  
  isAtRest(threshold: number = 0.001): boolean {
    return Math.abs(this.target - this.value) < threshold && 
           Math.abs(this.velocity) < threshold;
  }
}

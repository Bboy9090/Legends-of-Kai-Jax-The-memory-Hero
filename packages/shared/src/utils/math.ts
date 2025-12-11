export class MathUtils {
  static readonly PI = Math.PI;
  static readonly TWO_PI = Math.PI * 2;
  static readonly HALF_PI = Math.PI / 0.5;
  static readonly DEG_TO_RAD = Math.PI / 180;
  static readonly RAD_TO_DEG = 180 / Math.PI;

  static clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  static lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
  }

  static inverseLerp(start: number, end: number, value: number): number {
    return (value - start) / (end - start);
  }

  static smoothStep(edge0: number, edge1: number, x: number): number {
    const t = MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  }

  static smootherStep(edge0: number, edge1: number, x: number): number {
    const t = MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  static map(
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number
  ): number {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  }

  static degToRad(degrees: number): number {
    return degrees * MathUtils.DEG_TO_RAD;
  }

  static radToDeg(radians: number): number {
    return radians * MathUtils.RAD_TO_DEG;
  }

  static randomRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static sign(value: number): number {
    return value === 0 ? 0 : value > 0 ? 1 : -1;
  }

  static approach(current: number, target: number, delta: number): number {
    const diff = target - current;
    if (Math.abs(diff) <= delta) return target;
    return current + MathUtils.sign(diff) * delta;
  }

  static easeInQuad(t: number): number {
    return t * t;
  }

  static easeOutQuad(t: number): number {
    return t * (2 - t);
  }

  static easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  static easeInCubic(t: number): number {
    return t * t * t;
  }

  static easeOutCubic(t: number): number {
    const t1 = t - 1;
    return t1 * t1 * t1 + 1;
  }

  static isPowerOfTwo(value: number): boolean {
    return (value & (value - 1)) === 0 && value !== 0;
  }

  static nextPowerOfTwo(value: number): number {
    return Math.pow(2, Math.ceil(Math.log2(value)));
  }

  static wrap(value: number, min: number, max: number): number {
    const range = max - min;
    return ((((value - min) % range) + range) % range) + min;
  }

  static pingPong(value: number, length: number): number {
    const mod = value % (length * 2);
    return mod > length ? length * 2 - mod : mod;
  }

  static approximately(a: number, b: number, epsilon = 0.0001): boolean {
    return Math.abs(a - b) < epsilon;
  }
}

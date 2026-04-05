import { Vector2D, Vector3D } from '../types/physics.types';

export class Vec2 {
  static create(x = 0, y = 0): Vector2D {
    return { x, y };
  }

  static add(a: Vector2D, b: Vector2D): Vector2D {
    return { x: a.x + b.x, y: a.y + b.y };
  }

  static subtract(a: Vector2D, b: Vector2D): Vector2D {
    return { x: a.x - b.x, y: a.y - b.y };
  }

  static multiply(v: Vector2D, scalar: number): Vector2D {
    return { x: v.x * scalar, y: v.y * scalar };
  }

  static divide(v: Vector2D, scalar: number): Vector2D {
    if (scalar === 0) return { x: 0, y: 0 };
    return { x: v.x / scalar, y: v.y / scalar };
  }

  static dot(a: Vector2D, b: Vector2D): number {
    return a.x * b.x + a.y * b.y;
  }

  static cross(a: Vector2D, b: Vector2D): number {
    return a.x * b.y - a.y * b.x;
  }

  static magnitude(v: Vector2D): number {
    return Math.sqrt(v.x * v.x + v.y * v.y);
  }

  static magnitudeSquared(v: Vector2D): number {
    return v.x * v.x + v.y * v.y;
  }

  static distance(a: Vector2D, b: Vector2D): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  static normalize(v: Vector2D): Vector2D {
    const mag = Vec2.magnitude(v);
    if (mag === 0) return { x: 0, y: 0 };
    return Vec2.divide(v, mag);
  }

  static setMagnitude(v: Vector2D, magnitude: number): Vector2D {
    const normalized = Vec2.normalize(v);
    return Vec2.multiply(normalized, magnitude);
  }

  static limit(v: Vector2D, max: number): Vector2D {
    const mag = Vec2.magnitude(v);
    if (mag > max) {
      return Vec2.setMagnitude(v, max);
    }
    return v;
  }

  static rotate(v: Vector2D, angle: number): Vector2D {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: v.x * cos - v.y * sin,
      y: v.x * sin + v.y * cos,
    };
  }

  static angle(v: Vector2D): number {
    return Math.atan2(v.y, v.x);
  }

  static angleBetween(a: Vector2D, b: Vector2D): number {
    return Math.atan2(b.y - a.y, b.x - a.x);
  }

  static lerp(a: Vector2D, b: Vector2D, t: number): Vector2D {
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
    };
  }

  static clamp(v: Vector2D, min: Vector2D, max: Vector2D): Vector2D {
    return {
      x: Math.max(min.x, Math.min(max.x, v.x)),
      y: Math.max(min.y, Math.min(max.y, v.y)),
    };
  }

  static zero(): Vector2D {
    return { x: 0, y: 0 };
  }

  static one(): Vector2D {
    return { x: 1, y: 1 };
  }

  static up(): Vector2D {
    return { x: 0, y: -1 };
  }

  static down(): Vector2D {
    return { x: 0, y: 1 };
  }

  static left(): Vector2D {
    return { x: -1, y: 0 };
  }

  static right(): Vector2D {
    return { x: 1, y: 0 };
  }
}

export class Vec3 {
  static create(x = 0, y = 0, z = 0): Vector3D {
    return { x, y, z };
  }

  static add(a: Vector3D, b: Vector3D): Vector3D {
    return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
  }

  static subtract(a: Vector3D, b: Vector3D): Vector3D {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  }

  static multiply(v: Vector3D, scalar: number): Vector3D {
    return { x: v.x * scalar, y: v.y * scalar, z: v.z * scalar };
  }

  static magnitude(v: Vector3D): number {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  }

  static normalize(v: Vector3D): Vector3D {
    const mag = Vec3.magnitude(v);
    if (mag === 0) return { x: 0, y: 0, z: 0 };
    return {
      x: v.x / mag,
      y: v.y / mag,
      z: v.z / mag,
    };
  }
}

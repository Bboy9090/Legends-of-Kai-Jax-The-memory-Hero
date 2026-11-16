import * as THREE from 'three';
import { EnemyArchetype } from '../types';

export interface WorldBoxCollider {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
  walkableTop?: boolean;
  wallRunnable?: boolean;
}

export const WEB_LIMITS = {
  maxTetherRange: 18.0,
  maxStrikeRange: 14.5,
  maxZiplineRange: 20.0,
  wallPinCheckDist: 5.2,
  wallPinDuration: 3.2,
  enemySafeRadius: 0.54,
} as const;

const _segDir = new THREE.Vector3();
const _pt = new THREE.Vector3();

/**
 * Checks whether a straight line segment between `start` and `end` is obstructed
 * by any solid world building/barrier collider.
 */
export function isLineObstructedByColliders(
  start: THREE.Vector3,
  end: THREE.Vector3,
  colliders: readonly WorldBoxCollider[],
  ignoredIndex = -1
): boolean {
  _segDir.subVectors(end, start);
  const dist = _segDir.length();
  if (dist < 0.05) return false;
  const steps = Math.max(4, Math.ceil(dist / 0.8));

  for (let s = 1; s < steps; s++) {
    const t = s / steps;
    _pt.lerpVectors(start, end, t);
    for (let i = 0; i < colliders.length; i++) {
      if (i === ignoredIndex) continue;
      const c = colliders[i];
      if (
        _pt.x > c.minX + 0.05 &&
        _pt.x < c.maxX - 0.05 &&
        _pt.y > c.minY + 0.05 &&
        _pt.y < c.maxY - 0.05 &&
        _pt.z > c.minZ + 0.05 &&
        _pt.z < c.maxZ - 0.05
      ) {
        return true;
      }
    }
  }
  return false;
}

export function validateGrappleAnchor(
  playerPos: THREE.Vector3,
  anchorPos: THREE.Vector3,
  colliders: readonly WorldBoxCollider[],
  maxRange: number = WEB_LIMITS.maxZiplineRange,
  ignoredIndex: number = -1
): { valid: boolean; reason?: string; distance: number } {
  const distance = playerPos.distanceTo(anchorPos);
  if (distance > maxRange) {
    return { valid: false, reason: 'out_of_range', distance };
  }
  if (anchorPos.y < playerPos.y + 1.2) {
    return { valid: false, reason: 'insufficient_elevation', distance };
  }
  const eyeStart = new THREE.Vector3(playerPos.x, playerPos.y + 1.35, playerPos.z);
  if (isLineObstructedByColliders(eyeStart, anchorPos, colliders, ignoredIndex)) {
    return { valid: false, reason: 'obstructed', distance };
  }
  return { valid: true, distance };
}

export function getEnemyWebResistance(kind: EnemyArchetype): {
  pullFactor: number;
  canWallPin: boolean;
  canAirLaunch: boolean;
  launchVelocityY: number;
} {
  if (kind === 'boss') {
    return {
      pullFactor: 0.0, // Immune to yank displacement; takes tension stagger chip instead
      canWallPin: false,
      canAirLaunch: false,
      launchVelocityY: 0,
    };
  }
  if (kind === 'bruiser') {
    return {
      pullFactor: 0.45,
      canWallPin: true,
      canAirLaunch: true,
      launchVelocityY: 7.2,
    };
  }
  if (kind === 'shield') {
    return {
      pullFactor: 0.65,
      canWallPin: true,
      canAirLaunch: true,
      launchVelocityY: 8.8,
    };
  }
  return {
    pullFactor: 1.0,
    canWallPin: true,
    canAirLaunch: true,
    launchVelocityY: 10.4,
  };
}

/**
 * Pulls a valid enemy safely toward `playerPos` without clipping inside colliders
 * or overlapping inside the player's capsule.
 */
export function computePredatorPullResult(
  playerPos: THREE.Vector3,
  enemyPos: THREE.Vector3,
  kind: EnemyArchetype,
  colliders: readonly WorldBoxCollider[],
  ignoredIndex = -1
): {
  displaced: boolean;
  immune: boolean;
  nextPos: THREE.Vector3;
  pullVelocity: THREE.Vector3;
} {
  const res = getEnemyWebResistance(kind);
  if (res.pullFactor <= 0) {
    return {
      displaced: false,
      immune: true,
      nextPos: enemyPos.clone(),
      pullVelocity: new THREE.Vector3(),
    };
  }

  const toPlayer = new THREE.Vector3().subVectors(playerPos, enemyPos).setY(0);
  const dist = toPlayer.length();
  if (dist <= 1.75) {
    return {
      displaced: false,
      immune: false,
      nextPos: enemyPos.clone(),
      pullVelocity: new THREE.Vector3(),
    };
  }

  toPlayer.normalize();
  const desiredLandingDist = 1.7;
  const travel = Math.max(0, (dist - desiredLandingDist) * res.pullFactor);
  const candidate = enemyPos.clone().addScaledVector(toPlayer, travel);

  // Step-check colliders so pulled enemies never clip inside walls
  const safePos = resolveSafeHorizontalSlide(enemyPos, candidate, colliders, ignoredIndex);
  const pullVel = toPlayer.clone().multiplyScalar(11.5 * res.pullFactor);

  return {
    displaced: safePos.distanceTo(enemyPos) > 0.15,
    immune: false,
    nextPos: safePos,
    pullVelocity: pullVel,
  };
}

/**
 * Throws an enemy along `throwDir` and checks if it strikes an approved solid wall/building
 * collider within `wallPinCheckDist`. If it strikes a wall, pins the enemy cleanly OUTSIDE
 * the wall face (`wallPinnedTimer = 3.2s`) with zero clipping.
 */
export function computeWebThrowAndWallPin(
  enemyPos: THREE.Vector3,
  throwDir: THREE.Vector3,
  kind: EnemyArchetype,
  colliders: readonly WorldBoxCollider[],
  ignoredIndex = -1
): {
  immune: boolean;
  wallPinned: boolean;
  pinDuration: number;
  nextPos: THREE.Vector3;
  throwVelocity: THREE.Vector3;
} {
  const res = getEnemyWebResistance(kind);
  if (!res.canWallPin) {
    return {
      immune: true,
      wallPinned: false,
      pinDuration: 0,
      nextPos: enemyPos.clone(),
      throwVelocity: new THREE.Vector3(),
    };
  }

  const dir = throwDir.clone().setY(0);
  if (dir.lengthSq() < 1e-4) dir.set(0, 0, -1);
  dir.normalize();

  const maxDist = WEB_LIMITS.wallPinCheckDist * (kind === 'bruiser' ? 0.72 : 1.0);
  const r = WEB_LIMITS.enemySafeRadius;
  const steps = 16;
  let lastSafe = enemyPos.clone();
  let hitWall = false;

  for (let s = 1; s <= steps; s++) {
    const testPos = enemyPos.clone().addScaledVector(dir, (maxDist * s) / steps);
    // Outer Ashblock street walls at X = ±21
    if (Math.abs(testPos.x) >= 20.4) {
      lastSafe.x = THREE.MathUtils.clamp(testPos.x, -20.35, 20.35);
      hitWall = true;
      break;
    }
    let collided = false;
    for (let i = 0; i < colliders.length; i++) {
      if (i === ignoredIndex) continue;
      const c = colliders[i];
      if (testPos.y + 1.4 > c.minY && testPos.y + 0.35 < c.maxY) {
        if (
          testPos.x + r > c.minX &&
          testPos.x - r < c.maxX &&
          testPos.z + r > c.minZ &&
          testPos.z - r < c.maxZ
        ) {
          collided = true;
          hitWall = c.maxY - c.minY >= 1.6;
          break;
        }
      }
    }
    if (collided) break;
    lastSafe.copy(testPos);
  }

  lastSafe.x = THREE.MathUtils.clamp(lastSafe.x, -20.4, 20.4);
  lastSafe.z = THREE.MathUtils.clamp(lastSafe.z, -88.5, 18.5);

  if (hitWall) {
    return {
      immune: false,
      wallPinned: true,
      pinDuration: WEB_LIMITS.wallPinDuration,
      nextPos: lastSafe,
      throwVelocity: new THREE.Vector3(0, 0, 0),
    };
  }

  return {
    immune: false,
    wallPinned: false,
    pinDuration: 0,
    nextPos: lastSafe,
    throwVelocity: dir.multiplyScalar(10.5).setY(3.4),
  };
}

export function resolveSafeHorizontalSlide(
  fromPos: THREE.Vector3,
  toPos: THREE.Vector3,
  colliders: readonly WorldBoxCollider[],
  ignoredIndex = -1
): THREE.Vector3 {
  const r = WEB_LIMITS.enemySafeRadius;
  const steps = 12;
  const safe = fromPos.clone();

  for (let s = 1; s <= steps; s++) {
    const t = s / steps;
    const candX = THREE.MathUtils.lerp(fromPos.x, toPos.x, t);
    const candZ = THREE.MathUtils.lerp(fromPos.z, toPos.z, t);
    let blocked = false;
    for (let i = 0; i < colliders.length; i++) {
      if (i === ignoredIndex) continue;
      const c = colliders[i];
      if (fromPos.y + 1.4 > c.minY && fromPos.y + 0.35 < c.maxY) {
        if (candX + r > c.minX && candX - r < c.maxX && candZ + r > c.minZ && candZ - r < c.maxZ) {
          blocked = true;
          break;
        }
      }
    }
    if (blocked) break;
    safe.x = THREE.MathUtils.clamp(candX, -20.5, 20.5);
    safe.z = THREE.MathUtils.clamp(candZ, -88.5, 18.5);
  }
  return safe;
}

export function shouldAutoReleaseTether(
  anchorOrTargetPos: THREE.Vector3,
  playerPos: THREE.Vector3,
  targetDead: boolean,
  colliders: readonly WorldBoxCollider[],
  maxRange: number = WEB_LIMITS.maxTetherRange
): boolean {
  if (targetDead) return true;
  if (anchorOrTargetPos.distanceTo(playerPos) > maxRange) return true;
  const pEye = new THREE.Vector3(playerPos.x, playerPos.y + 1.2, playerPos.z);
  const tCenter = new THREE.Vector3(anchorOrTargetPos.x, anchorOrTargetPos.y + 0.9, anchorOrTargetPos.z);
  return isLineObstructedByColliders(pEye, tCenter, colliders);
}

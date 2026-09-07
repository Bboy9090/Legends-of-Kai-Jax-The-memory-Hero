/**
 * KAI ATTACK SYSTEM
 * Combat mechanics for Kai's 4 spider limbs and venom strikes
 *
 * Moves:
 * - Light: Venom jab (fast, 3-hit combo)
 * - Heavy: Venomous swipe (slow, high damage)
 * - Special: Web binding (hold enemies in place)
 * - Ultimate: Memory-Web Eruption (anchor + venom detonation)
 *
 * TIMING BUG FIX: Uses monotonic elapsedTime for all attack expirations
 * CANON: No tail mechanics in Kai (7+ tails belong to Kai-Jax fusion only)
 */

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AttackHitbox {
  position: THREE.Vector3;
  radius: number;
  damage: number;
  startTimeElapsed: number; // Three.js elapsedTime when attack started
  duration: number;
  knockback: number;
}

interface KaiAttackSystemState {
  activeAttacks: AttackHitbox[];
  lastAttackTime: number;
  comboCounter: number;
  comboResetTime: number;
}

const ATTACK_TIMING = {
  light: { startup: 0.08, active: 0.12, recovery: 0.2 },
  heavy: { startup: 0.15, active: 0.2, recovery: 0.4 },
  special: { startup: 0.3, active: 0.6, recovery: 0.3 },
  ultimate: { startup: 0.5, active: 1.0, recovery: 0.5 },
};

const ATTACK_DAMAGE = {
  light: 12,
  light2: 14,
  light3: 16, // combo finisher
  heavy: 35,
  special: 50,
  ultimate: 100,
};

const ATTACK_RANGE = {
  light: 0.8,
  heavy: 1.2,
  special: 2.0,
  ultimate: 10.0,
};

export function useKaiAttackSystem(characterRef: React.RefObject<THREE.Group>) {
  const stateRef = useRef<KaiAttackSystemState>({
    activeAttacks: [],
    lastAttackTime: 0,
    comboCounter: 0,
    comboResetTime: 0,
  });

  // Cache of Three.js clock for consistent timing
  const clockRef = useRef({ elapsedTime: 0 });

  // Initialize attack system
  useEffect(() => {
    if (!characterRef.current) return;

    // Create hitbox helper geometries (debug only)
    if (process.env.NODE_ENV === 'development') {
      // Hitbox visualization would go here
    }
  }, [characterRef]);

  // Main attack tick - uses monotonic elapsedTime for all timers
  useFrame((state, delta) => {
    const attacks = stateRef.current;
    clockRef.current.elapsedTime = state.clock.elapsedTime;

    // Update combo timer
    if (attacks.comboCounter > 0) {
      attacks.comboResetTime -= delta;
      if (attacks.comboResetTime <= 0) {
        attacks.comboCounter = 0;
      }
    }

    // Update active attacks - use monotonic elapsedTime for expiration
    attacks.activeAttacks = attacks.activeAttacks.filter((hitbox) => {
      const elapsed = state.clock.elapsedTime - hitbox.startTimeElapsed;
      return elapsed < hitbox.duration;
    });
  });

  function startLightAttack(position: THREE.Vector3, comboIndex: number = 0) {
    const comboIndex3 = Math.min(comboIndex, 2);
    const damage =
      comboIndex3 === 0 ? ATTACK_DAMAGE.light :
      comboIndex3 === 1 ? ATTACK_DAMAGE.light2 :
      ATTACK_DAMAGE.light3;

    const hitbox: AttackHitbox = {
      position: position.clone(),
      radius: ATTACK_RANGE.light,
      damage,
      startTimeElapsed: clockRef.current.elapsedTime,
      duration: ATTACK_TIMING.light.startup + ATTACK_TIMING.light.active,
      knockback: 5,
    };

    stateRef.current.activeAttacks.push(hitbox);
    stateRef.current.comboCounter = comboIndex3 + 1;
    stateRef.current.comboResetTime = 0.8; // 0.8s window for next combo

    return hitbox;
  }

  function startHeavyAttack(position: THREE.Vector3) {
    const hitbox: AttackHitbox = {
      position: position.clone(),
      radius: ATTACK_RANGE.heavy,
      damage: ATTACK_DAMAGE.heavy,
      startTimeElapsed: clockRef.current.elapsedTime,
      duration: ATTACK_TIMING.heavy.startup + ATTACK_TIMING.heavy.active,
      knockback: 10,
    };

    stateRef.current.activeAttacks.push(hitbox);
    stateRef.current.comboCounter = 0; // Reset combo

    return hitbox;
  }

  function startSpecialAttack(position: THREE.Vector3, direction: THREE.Vector3) {
    // Web binding special - creates a field that holds enemies
    const hitbox: AttackHitbox = {
      position: position.clone(),
      radius: ATTACK_RANGE.special,
      damage: ATTACK_DAMAGE.special,
      startTimeElapsed: clockRef.current.elapsedTime,
      duration: ATTACK_TIMING.special.startup + ATTACK_TIMING.special.active,
      knockback: 0, // Web binds instead of knocking back
    };

    stateRef.current.activeAttacks.push(hitbox);
    stateRef.current.comboCounter = 0;

    return hitbox;
  }

  function startUltimateAttack(position: THREE.Vector3, direction: THREE.Vector3) {
    // Memory-Web Eruption - anchor + detonation (canon: no tail mechanics on Kai)
    const hitbox: AttackHitbox = {
      position: position.clone(),
      radius: ATTACK_RANGE.ultimate,
      damage: ATTACK_DAMAGE.ultimate,
      startTimeElapsed: clockRef.current.elapsedTime,
      duration: ATTACK_TIMING.ultimate.startup + ATTACK_TIMING.ultimate.active,
      knockback: 15,
    };

    stateRef.current.activeAttacks.push(hitbox);
    stateRef.current.comboCounter = 0;

    return hitbox;
  }

  function getActiveHitboxes(): AttackHitbox[] {
    return stateRef.current.activeAttacks;
  }

  function getComboCount(): number {
    return stateRef.current.comboCounter;
  }

  return {
    startLightAttack,
    startHeavyAttack,
    startSpecialAttack,
    startUltimateAttack,
    getActiveHitboxes,
    getComboCount,
    state: stateRef.current,
  };
}

/**
 * VENOM MECHANICS
 *
 * Kai's attacks inflict venom that:
 * - Stacks on each hit (max 5 stacks)
 * - Deals damage per second (2 dmg/stack/sec)
 * - Resets on next light attack
 * - Can be triggered for venom explosion at 5 stacks (special move)
 */

export interface VenomStack {
  stacks: number;
  duration: number; // 8 seconds per stack
  accumulatedDamage: number; // Frame-rate independent damage tracking
}

export function useVenomSystem(targetRef: React.RefObject<THREE.Group>) {
  const venomRef = useRef<VenomStack>({
    stacks: 0,
    duration: 0,
    accumulatedDamage: 0,
  });

  // FIX: Apply venom damage delta-scaled for frame-rate independence
  useFrame((_, delta) => {
    const venom = venomRef.current;
    if (venom.stacks > 0) {
      // Apply damage proportional to delta time (frame-rate independent)
      const damagePerSecond = venom.stacks * 2;
      venom.accumulatedDamage += damagePerSecond * delta;

      venom.duration -= delta;
      if (venom.duration <= 0) {
        venom.stacks = 0;
        venom.duration = 0;
        venom.accumulatedDamage = 0;
      }
    }
  });

  function addVenomStack() {
    venomRef.current.stacks = Math.min(5, venomRef.current.stacks + 1);
    venomRef.current.duration = 8;
  }

  // Returns accumulated venom damage since last check (frame-rate independent)
  function getAndClearVenomDamage(): number {
    const damage = venomRef.current.accumulatedDamage;
    venomRef.current.accumulatedDamage = 0;
    return damage;
  }

  function explodeVenom(): number {
    const venom = venomRef.current;
    if (venom.stacks < 5) return 0;

    const explosionDamage = 50 + venom.stacks * 10; // Base 50 + 10 per stack
    venom.stacks = 0;
    venom.duration = 0;
    venom.accumulatedDamage = 0;

    return explosionDamage;
  }

  return {
    addVenomStack,
    getAndClearVenomDamage,
    explodeVenom,
    getStacks: () => venomRef.current.stacks,
  };
}

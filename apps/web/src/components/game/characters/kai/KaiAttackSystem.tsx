/**
 * KAI ATTACK SYSTEM
 * Deterministic scene-hitbox authority for Kai's four-limb / venom combat kit.
 *
 * Moves:
 * - Light: Venom jab (fast, 3-hit combo)
 * - Heavy: Venomous swipe (slow, high damage)
 * - Special: Web binding field
 * - Ultimate: Memory-Web Eruption
 *
 * CANON: Kai has no tail mechanics. Tail progression belongs to Kai-Jax fusion.
 */

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export type KaiAttackType = 'light' | 'heavy' | 'special' | 'ultimate';
export type KaiAttackPhase = 'IDLE' | 'STARTUP' | 'ACTIVE' | 'RECOVERY';

export interface KaiAttackEvent {
  type: KaiAttackType;
  position: THREE.Vector3;
  direction: THREE.Vector3;
  radius: number;
  damage: number;
  startTimeElapsed: number;
  duration: number;
  activeStart: number;
  activeEnd: number;
  knockback: number;
  comboIndex: number;
}

type AttackHitbox = KaiAttackEvent;

interface KaiAttackSystemState {
  activeAttacks: AttackHitbox[];
  lastAttackTime: number;
  comboCounter: number;
  comboResetTime: number;
}

const ATTACK_TIMING: Record<KaiAttackType, { startup: number; active: number; recovery: number }> = {
  light: { startup: 0.08, active: 0.12, recovery: 0.2 },
  heavy: { startup: 0.15, active: 0.2, recovery: 0.4 },
  special: { startup: 0.3, active: 0.6, recovery: 0.3 },
  ultimate: { startup: 0.5, active: 1.0, recovery: 0.5 },
};

const ATTACK_DAMAGE = {
  light: 12,
  light2: 14,
  light3: 16,
  heavy: 35,
  special: 50,
  ultimate: 100,
};

const ATTACK_RANGE: Record<KaiAttackType, number> = {
  light: 0.8,
  heavy: 1.2,
  special: 2.0,
  ultimate: 10.0,
};

const ATTACK_KNOCKBACK: Record<KaiAttackType, number> = {
  light: 5,
  heavy: 10,
  special: 0,
  ultimate: 15,
};

/**
 * Pure deterministic hitbox authority. KaiController decides whether an input is
 * accepted and spends energy; this system decides when/where that accepted attack
 * may hit a real scene combat target.
 */
export class KaiAttackSystem {
  private currentAttack: KaiAttackEvent | null = null;
  private expiredAttack: KaiAttackEvent | null = null;
  private hitTargets = new Set<string>();
  private lastHitboxSampleTime: number | null = null;
  private comboCounter = 0;

  constructor(private scene: THREE.Scene) {}

  startAttack(
    type: KaiAttackType,
    position: THREE.Vector3,
    direction: THREE.Vector3,
    currentTime: number,
    comboIndex = 0
  ): KaiAttackEvent {
    const timing = ATTACK_TIMING[type];
    const safeDirection = direction.lengthSq() > 0.0001
      ? direction.clone().normalize()
      : new THREE.Vector3(0, 0, 1);

    const normalizedComboIndex = type === 'light'
      ? Math.min(Math.max(comboIndex, 0), 2)
      : 0;
    const damage = type === 'light'
      ? normalizedComboIndex === 0
        ? ATTACK_DAMAGE.light
        : normalizedComboIndex === 1
          ? ATTACK_DAMAGE.light2
          : ATTACK_DAMAGE.light3
      : ATTACK_DAMAGE[type];

    this.currentAttack = {
      type,
      position: position.clone(),
      direction: safeDirection,
      radius: ATTACK_RANGE[type],
      damage,
      startTimeElapsed: currentTime,
      duration: timing.startup + timing.active + timing.recovery,
      activeStart: timing.startup,
      activeEnd: timing.startup + timing.active,
      knockback: ATTACK_KNOCKBACK[type],
      comboIndex: normalizedComboIndex,
    };

    this.comboCounter = type === 'light' ? normalizedComboIndex + 1 : 0;
    this.expiredAttack = null;
    this.hitTargets.clear();
    this.lastHitboxSampleTime = currentTime;
    return this.currentAttack;
  }

  update(currentTime: number, position: THREE.Vector3): KaiAttackEvent | null {
    if (!this.currentAttack) return null;

    this.currentAttack.position.copy(position);
    const elapsed = currentTime - this.currentAttack.startTimeElapsed;
    if (elapsed > this.currentAttack.duration) {
      // Preserve one final sparse-frame sample. A slow renderer may jump from
      // STARTUP past ACTIVE between frames; that must not erase a legitimate hit.
      this.expiredAttack = this.currentAttack;
      this.currentAttack = null;
      return null;
    }

    return this.currentAttack;
  }

  getPhase(currentTime: number): KaiAttackPhase {
    if (!this.currentAttack) return 'IDLE';
    const elapsed = currentTime - this.currentAttack.startTimeElapsed;
    if (elapsed < 0 || elapsed > this.currentAttack.duration) return 'IDLE';
    if (elapsed < this.currentAttack.activeStart) return 'STARTUP';
    if (elapsed <= this.currentAttack.activeEnd) return 'ACTIVE';
    return 'RECOVERY';
  }

  processActiveHitboxes(
    currentTime: number,
    onHit: (target: THREE.Object3D, damage: number, attack: KaiAttackEvent) => void
  ): void {
    const attack = this.currentAttack ?? this.expiredAttack;
    if (!attack) return;

    const previousSampleTime = this.lastHitboxSampleTime ?? currentTime;
    const intervalStart = Math.min(previousSampleTime, currentTime);
    const intervalEnd = Math.max(previousSampleTime, currentTime);
    const activeWindowStart = attack.startTimeElapsed + attack.activeStart;
    const activeWindowEnd = attack.startTimeElapsed + attack.activeEnd;
    const crossedActiveWindow =
      intervalEnd >= activeWindowStart && intervalStart <= activeWindowEnd;

    this.lastHitboxSampleTime = currentTime;

    if (crossedActiveWindow) {
      for (const target of this.findCombatTargets(attack)) {
        const targetId = String(target.userData.targetId ?? target.uuid);
        if (this.hitTargets.has(targetId)) continue;

        this.hitTargets.add(targetId);
        onHit(target, attack.damage, attack);
      }
    }

    if (this.expiredAttack === attack) {
      this.expiredAttack = null;
      this.hitTargets.clear();
      this.lastHitboxSampleTime = null;
    }
  }

  private findCombatTargets(attack: KaiAttackEvent): THREE.Object3D[] {
    const targets: THREE.Object3D[] = [];

    this.scene.traverse((object) => {
      if (!object.userData.combatTarget) return;

      const targetPosition = new THREE.Vector3();
      object.getWorldPosition(targetPosition);
      const offset = targetPosition.sub(attack.position);
      offset.y = 0;
      if (offset.length() > attack.radius) return;

      targets.push(object);
    });

    return targets;
  }

  getCurrentAttack(): KaiAttackEvent | null {
    return this.currentAttack;
  }

  getActiveHitboxes(): KaiAttackEvent[] {
    const attack = this.currentAttack ?? this.expiredAttack;
    return attack ? [attack] : [];
  }

  getComboCount(): number {
    return this.comboCounter;
  }

  getConfig(type: KaiAttackType) {
    const timing = ATTACK_TIMING[type];
    return {
      duration: timing.startup + timing.active + timing.recovery,
      activeStart: timing.startup,
      activeEnd: timing.startup + timing.active,
      radius: ATTACK_RANGE[type],
      knockback: ATTACK_KNOCKBACK[type],
      damage: type === 'light' ? ATTACK_DAMAGE.light : ATTACK_DAMAGE[type],
    };
  }

  reset(): void {
    this.currentAttack = null;
    this.expiredAttack = null;
    this.hitTargets.clear();
    this.lastHitboxSampleTime = null;
    this.comboCounter = 0;
  }
}

/**
 * Compatibility hook for character scenes that use KaiAttackSystem directly.
 * KaiController uses the same class so there is only one hitbox algorithm.
 */
export function useKaiAttackSystem(characterRef: React.RefObject<THREE.Group>) {
  const { scene } = useThree();
  const system = useMemo(() => new KaiAttackSystem(scene), [scene]);
  const stateRef = useRef<KaiAttackSystemState>({
    activeAttacks: [],
    lastAttackTime: 0,
    comboCounter: 0,
    comboResetTime: 0,
  });
  const clockRef = useRef({ elapsedTime: 0 });

  useEffect(() => {
    return () => system.reset();
  }, [system]);

  useFrame((frameState, delta) => {
    const character = characterRef.current;
    if (!character) return;

    clockRef.current.elapsedTime = frameState.clock.elapsedTime;
    const position = new THREE.Vector3();
    character.getWorldPosition(position);
    system.update(frameState.clock.elapsedTime, position);
    system.processActiveHitboxes(frameState.clock.elapsedTime, (target, damage, attack) => {
      const health = typeof target.userData.health === 'number' ? target.userData.health : 100;
      target.userData.health = Math.max(0, health - damage);
      target.userData.lastHitBy = 'kai';
      target.userData.lastDamage = damage;
      target.userData.lastAttackType = attack.type;
      target.userData.hitCount = (target.userData.hitCount ?? 0) + 1;

      if (attack.knockback > 0) {
        const velocity = target.userData.velocity instanceof THREE.Vector3
          ? target.userData.velocity as THREE.Vector3
          : new THREE.Vector3();
        velocity.add(attack.direction.clone().multiplyScalar(attack.knockback));
        target.userData.velocity = velocity;
      }
    });

    const legacy = stateRef.current;
    legacy.activeAttacks = system.getActiveHitboxes();
    legacy.lastAttackTime = frameState.clock.elapsedTime;
    legacy.comboCounter = system.getComboCount();
    if (legacy.comboCounter > 0) {
      legacy.comboResetTime = Math.max(0, legacy.comboResetTime - delta);
    }
  });

  const facingDirection = () => {
    const direction = characterRef.current?.getWorldDirection(new THREE.Vector3())
      ?? new THREE.Vector3(0, 0, 1);
    direction.y = 0;
    if (direction.lengthSq() < 0.0001) direction.set(0, 0, 1);
    return direction.normalize();
  };

  const now = () => clockRef.current.elapsedTime;

  function startLightAttack(position: THREE.Vector3, comboIndex = 0) {
    stateRef.current.comboResetTime = 0.8;
    return system.startAttack('light', position, facingDirection(), now(), comboIndex);
  }

  function startHeavyAttack(position: THREE.Vector3) {
    stateRef.current.comboResetTime = 0;
    return system.startAttack('heavy', position, facingDirection(), now());
  }

  function startSpecialAttack(position: THREE.Vector3, direction: THREE.Vector3) {
    stateRef.current.comboResetTime = 0;
    return system.startAttack('special', position, direction, now());
  }

  function startUltimateAttack(position: THREE.Vector3, direction: THREE.Vector3) {
    stateRef.current.comboResetTime = 0;
    return system.startAttack('ultimate', position, direction, now());
  }

  return {
    startLightAttack,
    startHeavyAttack,
    startSpecialAttack,
    startUltimateAttack,
    getActiveHitboxes: () => system.getActiveHitboxes(),
    getComboCount: () => system.getComboCount(),
    getAttackSystem: () => system,
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
  duration: number;
  accumulatedDamage: number;
}

export function useVenomSystem(targetRef: React.RefObject<THREE.Group>) {
  const venomRef = useRef<VenomStack>({
    stacks: 0,
    duration: 0,
    accumulatedDamage: 0,
  });

  useFrame((_, delta) => {
    const venom = venomRef.current;
    if (venom.stacks > 0) {
      const damagePerSecond = venom.stacks * 2;
      venom.accumulatedDamage += damagePerSecond * delta;

      venom.duration -= delta;
      if (venom.duration <= 0) {
        venom.stacks = 0;
        venom.duration = 0;
      }
    }
  });

  function addVenomStack() {
    venomRef.current.stacks = Math.min(5, venomRef.current.stacks + 1);
    venomRef.current.duration = 8;
  }

  function getAndClearVenomDamage(): number {
    const damage = venomRef.current.accumulatedDamage;
    venomRef.current.accumulatedDamage = 0;
    return damage;
  }

  function explodeVenom(): number {
    const venom = venomRef.current;
    if (venom.stacks < 5) return 0;

    const explosionDamage = 50 + venom.stacks * 10;
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

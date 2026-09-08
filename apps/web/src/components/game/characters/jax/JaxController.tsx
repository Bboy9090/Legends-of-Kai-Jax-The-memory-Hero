/**
 * JAX CONTROLLER
 * Storm/Displacement Beast-Kin movement and combat controller.
 *
 * Jax is dominated by Kar-Voth (electricity/displacement) and Thryxen
 * (storm/pressure/sovereignty). JaxController is the sole writer of Jax's
 * position; traversal and air systems only return movement results.
 */

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAudio } from '../../../../lib/stores/useAudio';
import { gameplayInputManager, GameplayInputState } from '../../../../lib/input/GameplayInputState';
import { combatActionBuffer } from '../../../../lib/input/CombatActionBuffer';
import { DisplacementController } from './DisplacementSystem';
import { StormAirSystem } from './StormAirSystem';
import { AttackPhase, JaxAttackSystem, JaxAttackType } from './JaxAttackSystem';

export type JaxLocomotionMode =
  | 'GROUND'
  | 'AIR'
  | 'DISPLACEMENT'
  | 'AIR_DISPLACEMENT'
  | 'RECOVERY';

export interface JaxControllerState {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: THREE.Euler;
  locomotionMode: JaxLocomotionMode;
  isMoving: boolean;
  isAttacking: boolean;
  attackTimer: number;
  currentAttackType: JaxAttackType | null;
  attackPhase: AttackPhase;
  isAirborne: boolean;
  isDodging: boolean;
  dodgeTimer: number;
  invulnTimer: number;
  attackCombo: number;
  comboResetTimer: number;
  energy: number;
  maxEnergy: number;
  displacementCharges: number;
  groundDisplacementCharges: number;
  airDisplacementCharges: number;
  displacementCooldown: number;
}

const MOVEMENT_CONFIG = {
  walkSpeed: 5.0,
  runSpeed: 8.5,
  turnSpeed: 0.15,
  accel: 18,
  friction: 0.90,
  jumpVelocity: 8.0,
  boundary: 50,
};

const COMBAT_CONFIG = {
  maxEnergy: 100,
  energyRegen: 30,
  lightAttackCost: 12,
  heavyAttackCost: 25,
  specialAttackCost: 45,
  ultimateAttackCost: 75,
  comboTimeWindow: 0.6,
  lightAttackDuration: 0.35,
  heavyAttackDuration: 0.5,
  specialAttackDuration: 0.7,
  ultimateAttackDuration: 1.0,
};

const DODGING_CONFIG = {
  duration: 0.35,
  invulnDuration: 0.4,
  staminaCost: 18,
};

interface GroundQueryResult {
  grounded: boolean;
  groundY: number;
  surface: THREE.Object3D | null;
}

export function useJaxController(
  jaxRef: React.RefObject<THREE.Group>,
  scene: THREE.Scene
) {
  const prevInputRef = useRef<GameplayInputState | null>(null);
  const stateRef = useRef<JaxControllerState>({
    position: new THREE.Vector3(0, 0, 0),
    velocity: new THREE.Vector3(0, 0, 0),
    rotation: new THREE.Euler(0, 0, 0),
    locomotionMode: 'GROUND',
    isMoving: false,
    isAttacking: false,
    attackTimer: 0,
    currentAttackType: null,
    attackPhase: 'IDLE',
    isAirborne: false,
    isDodging: false,
    dodgeTimer: 0,
    invulnTimer: 0,
    attackCombo: 0,
    comboResetTimer: 0,
    energy: COMBAT_CONFIG.maxEnergy,
    maxEnergy: COMBAT_CONFIG.maxEnergy,
    displacementCharges: 1,
    groundDisplacementCharges: 1,
    airDisplacementCharges: 1,
    displacementCooldown: 0,
  });

  const displacementController = useMemo(() => new DisplacementController(scene), [scene]);
  const stormAirSystem = useMemo(() => new StormAirSystem(), []);
  const attackSystem = useMemo(() => new JaxAttackSystem(scene), [scene]);

  const wasJustPressed = (current: boolean, previous: boolean | null): boolean =>
    current && !previous;

  const queryGround = (
    position: THREE.Vector3,
    probeDistance: number
  ): GroundQueryResult => {
    const walkables: THREE.Object3D[] = [];
    scene.traverse((obj) => {
      if (obj.userData.isWalkable || obj.userData.isGround) {
        walkables.push(obj);
      }
    });

    if (walkables.length === 0) {
      return { grounded: false, groundY: position.y, surface: null };
    }

    const raycaster = new THREE.Raycaster(
      position.clone().add(new THREE.Vector3(0, 0.15, 0)),
      new THREE.Vector3(0, -1, 0),
      0,
      Math.max(0.35, probeDistance + 0.15)
    );

    const hits = raycaster.intersectObjects(walkables, false);
    if (hits.length === 0) {
      return { grounded: false, groundY: position.y, surface: null };
    }

    return {
      grounded: true,
      groundY: hits[0].point.y,
      surface: hits[0].object,
    };
  };

  useFrame((frameState, rawDelta) => {
    if (!jaxRef.current) return;

    // Movement remains tightly bounded for collision stability. Lifecycle timers
    // and energy use a separate catch-up delta so low rendering FPS cannot slow
    // combat readiness or regeneration relative to authored attack timing.
    const delta = Math.min(Math.max(rawDelta, 0), 0.033);
    const lifecycleDelta = Math.min(Math.max(rawDelta, 0), 0.25);
    const jax = stateRef.current;
    const input = gameplayInputManager.getState();
    const prevInput = prevInputRef.current;
    const currentTime = frameState.clock.elapsedTime;

    jaxRef.current.getWorldPosition(jax.position);
    jax.rotation.copy(jaxRef.current.rotation);

    jax.energy = Math.min(
      jax.energy + COMBAT_CONFIG.energyRegen * lifecycleDelta,
      jax.maxEnergy
    );

    if (jax.invulnTimer > 0) {
      jax.invulnTimer = Math.max(0, jax.invulnTimer - lifecycleDelta);
    }

    if (jax.isDodging) {
      jax.dodgeTimer = Math.max(0, jax.dodgeTimer - lifecycleDelta);
      if (jax.dodgeTimer === 0) {
        jax.isDodging = false;
      }
    }

    let currentAttack = attackSystem.update(currentTime, jax.position);
    jax.isAttacking = currentAttack !== null;
    jax.attackTimer = currentAttack
      ? Math.max(0, currentAttack.duration - (currentTime - currentAttack.startTime))
      : 0;

    if (jax.comboResetTimer > 0) {
      jax.comboResetTimer = Math.max(0, jax.comboResetTimer - lifecycleDelta);
      if (jax.comboResetTimer === 0) {
        jax.attackCombo = 0;
      }
    }

    const landingProbe = Math.max(0.35, Math.max(0, -jax.velocity.y) * delta + 0.2);
    const ground = queryGround(jax.position, landingProbe);
    const isGrounded = ground.grounded && jax.velocity.y <= 0.1;
    const wasAirborne = jax.isAirborne;
    jax.isAirborne = !isGrounded;

    if (isGrounded) {
      if (jax.velocity.y < 0) {
        jax.velocity.y = 0;
      }
      if (wasAirborne) {
        jax.position.y = ground.groundY;
        displacementController.onLanded();
      }
    }

    // Convert shared input (W = moveY -1) into camera-relative world intent.
    const cameraForward = new THREE.Vector3();
    frameState.camera.getWorldDirection(cameraForward);
    cameraForward.y = 0;
    if (cameraForward.lengthSq() < 0.0001) cameraForward.set(0, 0, -1);
    cameraForward.normalize();

    const cameraRight = new THREE.Vector3()
      .crossVectors(cameraForward, new THREE.Vector3(0, 1, 0))
      .normalize();

    const worldMoveDir = cameraRight.multiplyScalar(input.moveX)
      .add(cameraForward.multiplyScalar(-input.moveY));
    if (worldMoveDir.lengthSq() > 1) worldMoveDir.normalize();

    const facingDir = jaxRef.current.getWorldDirection(new THREE.Vector3());
    facingDir.y = 0;
    if (facingDir.lengthSq() < 0.0001) facingDir.set(0, 0, 1);
    facingDir.normalize();

    const traversalEdge = wasJustPressed(
      input.traversal,
      prevInput?.traversal ?? false
    );

    const displacementAim = worldMoveDir.lengthSq() > 0.0001
      ? worldMoveDir.clone().normalize()
      : facingDir;

    const displacementResult = displacementController.update(
      delta,
      {
        traversal: traversalEdge,
        moveX: displacementAim.x,
        moveY: displacementAim.z,
        aiming: displacementAim,
      },
      jax.position,
      jax.isAirborne
    );

    const airControlResult = stormAirSystem.updateAirControl(
      delta,
      {
        moveX: worldMoveDir.x,
        moveY: worldMoveDir.z,
        jump: input.jump,
        traversal: input.traversal,
      },
      jax.velocity,
      jax.isAirborne
    );

    let finalPos: THREE.Vector3;
    let nextMode: JaxLocomotionMode = 'GROUND';

    if (displacementResult !== null) {
      finalPos = displacementResult;
      nextMode = jax.isAirborne ? 'AIR_DISPLACEMENT' : 'DISPLACEMENT';
      jax.isMoving = false;
    } else if (jax.isAirborne) {
      nextMode = 'AIR';
      jax.velocity.copy(airControlResult);
      finalPos = jax.position.clone().addScaledVector(jax.velocity, delta);
      jax.isMoving = Math.hypot(input.moveX, input.moveY) > 0.01;
    } else {
      const inputLength = Math.hypot(input.moveX, input.moveY);
      jax.isMoving = inputLength > 0.01;
      const targetSpeed = input.isRunning
        ? MOVEMENT_CONFIG.runSpeed
        : MOVEMENT_CONFIG.walkSpeed;

      const targetVelocity = worldMoveDir.lengthSq() > 0.0001
        ? worldMoveDir.clone().normalize().multiplyScalar(targetSpeed)
        : new THREE.Vector3();

      const alpha = Math.min(1, MOVEMENT_CONFIG.accel * delta);
      jax.velocity.x = THREE.MathUtils.lerp(jax.velocity.x, targetVelocity.x, alpha);
      jax.velocity.z = THREE.MathUtils.lerp(jax.velocity.z, targetVelocity.z, alpha);

      if (!jax.isMoving) {
        const damping = Math.pow(MOVEMENT_CONFIG.friction, delta * 60);
        jax.velocity.x *= damping;
        jax.velocity.z *= damping;
      }

      finalPos = jax.position.clone().addScaledVector(jax.velocity, delta);
      nextMode = 'GROUND';

      if (jax.isMoving && jax.velocity.lengthSq() > 0.0001) {
        const targetRotation = Math.atan2(jax.velocity.x, jax.velocity.z);
        jaxRef.current.rotation.y +=
          (targetRotation - jaxRef.current.rotation.y) * MOVEMENT_CONFIG.turnSpeed;
      }
    }

    finalPos.x = THREE.MathUtils.clamp(
      finalPos.x,
      -MOVEMENT_CONFIG.boundary,
      MOVEMENT_CONFIG.boundary
    );
    finalPos.z = THREE.MathUtils.clamp(
      finalPos.z,
      -MOVEMENT_CONFIG.boundary,
      MOVEMENT_CONFIG.boundary
    );

    jax.locomotionMode = nextMode;
    jaxRef.current.position.copy(finalPos);
    jax.position.copy(finalPos);

    if (wasJustPressed(input.jump, prevInput?.jump ?? false)) {
      if (isGrounded && !jax.isDodging) {
        jax.velocity.y = MOVEMENT_CONFIG.jumpVelocity;
        jax.isAirborne = true;
      }
    }

    // Keyboard presses can be shorter than a render frame. Consume the DOM-event
    // buffer first, then fall back to the shared level-state rising edge for touch
    // and gamepad paths that are still sampled by their adapters.
    const lightPressed = combatActionBuffer.consume('attackLight') ||
      wasJustPressed(input.attackLight, prevInput?.attackLight ?? false);
    const heavyPressed = combatActionBuffer.consume('attackHeavy') ||
      wasJustPressed(input.attackHeavy, prevInput?.attackHeavy ?? false);
    const specialPressed = combatActionBuffer.consume('attackSpecial') ||
      wasJustPressed(input.attackSpecial, prevInput?.attackSpecial ?? false);
    const ultimatePressed = combatActionBuffer.consume('attackUltimate') ||
      wasJustPressed(input.attackUltimate, prevInput?.attackUltimate ?? false);
    const dodgePressed = combatActionBuffer.consume('dodge') ||
      wasJustPressed(input.dodge, prevInput?.dodge ?? false);

    if (lightPressed) {
      if (
        jax.energy >= COMBAT_CONFIG.lightAttackCost &&
        !jax.isDodging &&
        !jax.isAttacking
      ) {
        jax.attackCombo = Math.min(3, jax.attackCombo + 1);
        jax.energy -= COMBAT_CONFIG.lightAttackCost;
        jax.isAttacking = true;
        jax.attackTimer = COMBAT_CONFIG.lightAttackDuration;
        jax.comboResetTimer = COMBAT_CONFIG.comboTimeWindow;
        attackSystem.startAttack('jax_light_combo', jax.position, facingDir, currentTime);
        useAudio.getState().playAttack?.('light');
      }
    }

    if (heavyPressed) {
      if (
        jax.energy >= COMBAT_CONFIG.heavyAttackCost &&
        !jax.isDodging &&
        !jax.isAttacking
      ) {
        jax.attackCombo = 0;
        jax.energy -= COMBAT_CONFIG.heavyAttackCost;
        jax.isAttacking = true;
        jax.attackTimer = COMBAT_CONFIG.heavyAttackDuration;
        jax.comboResetTimer = COMBAT_CONFIG.comboTimeWindow;
        attackSystem.startAttack('jax_pressure_heavy', jax.position, facingDir, currentTime);
        useAudio.getState().playAttack?.('heavy');
      }
    }

    if (specialPressed) {
      if (
        jax.energy >= COMBAT_CONFIG.specialAttackCost &&
        !jax.isDodging &&
        !jax.isAttacking
      ) {
        jax.energy -= COMBAT_CONFIG.specialAttackCost;
        jax.isAttacking = true;
        jax.attackTimer = COMBAT_CONFIG.specialAttackDuration;
        jax.comboResetTimer = 0;
        attackSystem.startAttack('jax_lightning_special', jax.position, facingDir, currentTime);
        useAudio.getState().playAttack?.('special');
      }
    }

    if (ultimatePressed) {
      if (
        jax.energy >= COMBAT_CONFIG.ultimateAttackCost &&
        !jax.isDodging &&
        !jax.isAttacking
      ) {
        jax.energy -= COMBAT_CONFIG.ultimateAttackCost;
        jax.isAttacking = true;
        jax.attackTimer = COMBAT_CONFIG.ultimateAttackDuration;
        jax.comboResetTimer = 0;
        attackSystem.startAttack('jax_storm_ultimate', jax.position, facingDir, currentTime);
        useAudio.getState().playAttack?.('ultimate');
      }
    }

    if (dodgePressed) {
      if (
        jax.energy >= DODGING_CONFIG.staminaCost &&
        !jax.isDodging &&
        !jax.isAttacking
      ) {
        jax.isDodging = true;
        jax.dodgeTimer = DODGING_CONFIG.duration;
        jax.invulnTimer = DODGING_CONFIG.invulnDuration;
        jax.energy -= DODGING_CONFIG.staminaCost;
        jax.attackCombo = 0;
        useAudio.getState().playDodge?.();
      }
    }

    currentAttack = attackSystem.update(currentTime, jax.position);

    attackSystem.processActiveHitboxes(currentTime, (target, damage, attack) => {
      const health = typeof target.userData.health === 'number'
        ? target.userData.health
        : 100;
      target.userData.health = Math.max(0, health - damage);
      target.userData.lastHitBy = 'jax';
      target.userData.lastDamage = damage;
      target.userData.lastAttackType = attack.type;
      target.userData.hitCount = (target.userData.hitCount ?? 0) + 1;

      const targetPos = new THREE.Vector3();
      target.getWorldPosition(targetPos);

      let knockback: THREE.Vector3 | null = null;
      if (attack.type === 'jax_pressure_heavy') {
        const pressure = stormAirSystem.calculatePressure(
          'heavy',
          jax.position,
          attack.direction
        );
        knockback = stormAirSystem.applyPressureForce(
          targetPos,
          jax.position,
          pressure
        );
      } else if (attack.type === 'jax_lightning_special') {
        knockback = attack.direction.clone().multiplyScalar(attack.knockback);
      } else if (attack.type === 'jax_storm_ultimate') {
        const pressure = stormAirSystem.calculatePressure(
          'special',
          jax.position,
          attack.direction
        );
        knockback = stormAirSystem.applyPressureForce(
          targetPos,
          jax.position,
          pressure
        );
      }

      if (knockback) {
        const velocity = target.userData.velocity instanceof THREE.Vector3
          ? target.userData.velocity as THREE.Vector3
          : new THREE.Vector3();
        velocity.add(knockback);
        target.userData.velocity = velocity;
      }
    });

    jax.currentAttackType = currentAttack?.type ?? null;
    jax.attackPhase = attackSystem.getPhase(currentTime);

    const displacementState = displacementController.getState();
    jax.displacementCharges = displacementState.groundCharges;
    jax.groundDisplacementCharges = displacementState.groundCharges;
    jax.airDisplacementCharges = displacementState.airCharges;
    jax.displacementCooldown = displacementState.cooldown;

    prevInputRef.current = { ...input };
  });

  return {
    state: stateRef.current,
    getState: () => stateRef.current,
    getAttackSystem: () => attackSystem,
    getDisplacementSystem: () => displacementController,
    getStormAirSystem: () => stormAirSystem,
  };
}

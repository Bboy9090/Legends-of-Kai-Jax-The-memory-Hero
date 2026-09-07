/**
 * JAX CONTROLLER
 * Electricity Spider Movement & Combat System
 *
 * Core mechanics:
 * - Unified input from keyboard/gamepad/touch
 * - Locomotion modes: GROUND, AIR, DISPLACEMENT, AIR_DISPLACEMENT, RECOVERY
 * - Displacement system with charge/cooldown
 * - Superior air control via storm pressure
 * - Fast electrical combo attacks
 * - Pressure-based heavy attack knockback
 * - Lightning special ability
 *
 * Architecture: JaxController is the sole owner of jax.position per frame.
 * Traversal systems (DisplacementController, StormAirSystem) are update-driven:
 * they return movement results, not write position directly.
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAudio } from '../../../../lib/stores/useAudio';
import { gameplayInputManager, GameplayInputState } from '../../../../lib/input/GameplayInputState';
import { DisplacementController } from './DisplacementSystem';
import { StormAirSystem } from './StormAirSystem';
import { JaxAttackSystem } from './JaxAttackSystem';

type LocomotionMode = 'GROUND' | 'AIR' | 'DISPLACEMENT' | 'AIR_DISPLACEMENT' | 'RECOVERY';

interface JaxControllerState {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: THREE.Euler;
  locomotionMode: LocomotionMode;
  isMoving: boolean;
  isAttacking: boolean;
  attackTimer: number;
  isAirborne: boolean;
  isDodging: boolean;
  dodgeTimer: number;
  invulnTimer: number;
  attackCombo: number;
  comboResetTimer: number;
  energy: number;
  maxEnergy: number;
  displacementCharges: number;
}

const MOVEMENT_CONFIG = {
  walkSpeed: 5.0,
  runSpeed: 8.5,
  turnSpeed: 0.15,
  accel: 18,
  decel: 14,
  friction: 0.90,
};

const COMBAT_CONFIG = {
  maxEnergy: 100,
  energyRegen: 30,
  lightAttackCost: 12,
  heavyAttackCost: 25,
  specialAttackCost: 45,
  comboTimeWindow: 0.6,
  lightAttackDuration: 0.35,
  heavyAttackDuration: 0.5,
};

const DODGING_CONFIG = {
  distance: 3.5,
  duration: 0.35,
  invulnDuration: 0.4,
  staminalCost: 18,
};

export function useJaxController(jaxRef: React.RefObject<THREE.Group>, scene: THREE.Scene) {
  const prevInputRef = useRef<GameplayInputState | null>(null);
  const stateRef = useRef<JaxControllerState>({
    position: new THREE.Vector3(0, 0, 0),
    velocity: new THREE.Vector3(0, 0, 0),
    rotation: new THREE.Euler(0, 0, 0),
    locomotionMode: 'GROUND',
    isMoving: false,
    isAttacking: false,
    attackTimer: 0,
    isAirborne: false,
    isDodging: false,
    dodgeTimer: 0,
    invulnTimer: 0,
    attackCombo: 0,
    comboResetTimer: 0,
    energy: COMBAT_CONFIG.maxEnergy,
    maxEnergy: COMBAT_CONFIG.maxEnergy,
    displacementCharges: 1,
  });

  const wasJustPressed = (current: boolean, previous: boolean | null): boolean => {
    return current && !previous;
  };

  const displacementController = useMemo(() => new DisplacementController(scene), [scene]);
  const stormAirSystem = useMemo(() => new StormAirSystem(), []);
  const attackSystem = useMemo(() => new JaxAttackSystem(scene), [scene]);

  const checkGrounded = (pos: THREE.Vector3): { grounded: boolean; groundY: number } => {
    const raycaster = new THREE.Raycaster(
      pos.clone().add(new THREE.Vector3(0, 0.1, 0)),
      new THREE.Vector3(0, -1, 0),
      0,
      0.5
    );

    const walkables = scene.children.filter(obj =>
      obj.userData.isWalkable || obj.userData.isGround
    );

    const hits = raycaster.intersectObjects(walkables, true);
    if (hits.length > 0) {
      return { grounded: true, groundY: hits[0].point.y };
    }

    return { grounded: false, groundY: pos.y };
  };

  useFrame((frameState, rawDelta) => {
    if (!jaxRef.current) return;

    const delta = Math.min(rawDelta, 0.033);
    const jax = stateRef.current;

    // Get unified input state
    const input = gameplayInputManager.getState();
    const prevInput = prevInputRef.current;

    // Update Jax position from ref
    jaxRef.current.getWorldPosition(jax.position);
    jaxRef.current.getWorldDirection(jax.rotation as any);

    // Energy regeneration
    jax.energy = Math.min(jax.energy + COMBAT_CONFIG.energyRegen * delta, jax.maxEnergy);

    // Invulnerability timer
    if (jax.invulnTimer > 0) {
      jax.invulnTimer -= delta;
    }

    // Dodge state lifecycle
    if (jax.isDodging) {
      jax.dodgeTimer -= delta;
      if (jax.dodgeTimer <= 0) {
        jax.isDodging = false;
        jax.dodgeTimer = 0;
      }
    }

    // Attack state lifecycle
    if (jax.isAttacking) {
      jax.attackTimer -= delta;
      if (jax.attackTimer <= 0) {
        jax.isAttacking = false;
        jax.attackTimer = 0;
      }
    }

    // Combo reset timer
    if (jax.comboResetTimer > 0) {
      jax.comboResetTimer -= delta;
      if (jax.comboResetTimer <= 0) {
        jax.attackCombo = 0;
        jax.comboResetTimer = 0;
      }
    }

    // Ground detection via raycast (supports platforms at any height)
    const { grounded, groundY } = checkGrounded(jax.position);
    const isGrounded = grounded && jax.velocity.y <= 0.1;
    const wasAirborne = jax.isAirborne;
    jax.isAirborne = !isGrounded;

    // Reset vertical velocity and snap when landing
    if (isGrounded && jax.velocity.y < 0) {
      jax.velocity.y = 0;

      // Snap to ground and reset air displacement charge on real landing
      if (wasAirborne) {
        jax.position.y = groundY;
        const displacementState = displacementController.getState();
        if (displacementState.airCharges < 1) {
          // Charge was used; restore it
          displacementController.reset();
        }
      }
    }

    // LOCOMOTION MODE DECISION: Only one system owns position per frame
    // Edge-trigger: only start displacement on rising edge (false → true)
    const traversalEdge = wasJustPressed(input.traversal, prevInput?.traversal ?? false);

    // Compute camera-relative movement direction for displacement
    const moveDir = new THREE.Vector3(input.moveX, 0, input.moveY);
    const cameraDir = new THREE.Vector3();
    frameState.camera.getWorldDirection(cameraDir);
    cameraDir.y = 0;
    cameraDir.normalize();

    if (moveDir.length() > 0.1) {
      moveDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.atan2(cameraDir.x, cameraDir.z));
    } else {
      moveDir.copy(jaxRef.current.getWorldDirection(new THREE.Vector3()));
    }

    const displacementResult = displacementController.update(
      delta,
      {
        traversal: traversalEdge,
        moveX: moveDir.x,
        moveY: moveDir.z,
        aiming: moveDir,
      },
      jax.position,
      jax.isAirborne
    );

    const isDisplacing = displacementController.isDisplacing();

    // Air control (StormAirSystem is the sole vertical physics authority)
    const airControlResult = stormAirSystem.updateAirControl(
      delta,
      {
        moveX: input.moveX,
        moveY: input.moveY,
        jump: input.jump,
        traversal: input.traversal,
      },
      jax.velocity,
      jax.isAirborne
    );

    // EXCLUSIVE LOCOMOTION MODE
    let finalPos: THREE.Vector3;
    let nextMode: LocomotionMode = 'GROUND';

    // Priority: DISPLACEMENT > AIR_DISPLACEMENT > AIR > GROUND
    if (displacementResult !== null) {
      finalPos = displacementResult;
      nextMode = jax.isAirborne ? 'AIR_DISPLACEMENT' : 'DISPLACEMENT';
      jax.isMoving = false;
    } else if (jax.isAirborne) {
      // Air mode
      nextMode = 'AIR';
      jax.velocity = airControlResult;
      finalPos = jax.position.clone().add(jax.velocity.clone().multiplyScalar(delta));
      jax.isMoving = false;
    } else {
      // GROUND mode: normal walking/running
      nextMode = 'GROUND';
      const inputX = input.moveX;
      const inputZ = input.moveY;
      const inputLen = Math.hypot(inputX, inputZ);

      jax.isMoving = inputLen > 0.01;

      const isRunning = input.isRunning;
      const targetSpeed = isRunning ? MOVEMENT_CONFIG.runSpeed : MOVEMENT_CONFIG.walkSpeed;

      const moveDir = new THREE.Vector3(inputX, 0, inputZ);
      const cameraDir = new THREE.Vector3();
      frameState.camera.getWorldDirection(cameraDir);
      cameraDir.y = 0;
      cameraDir.normalize();

      const moveInWorldSpace = moveDir.length() > 0;
      if (moveInWorldSpace) {
        moveDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.atan2(cameraDir.x, cameraDir.z));
      }

      const targetVel = moveDir.multiplyScalar(targetSpeed);
      jax.velocity.x = THREE.MathUtils.lerp(jax.velocity.x, targetVel.x, MOVEMENT_CONFIG.accel * delta);
      jax.velocity.z = THREE.MathUtils.lerp(jax.velocity.z, targetVel.z, MOVEMENT_CONFIG.accel * delta);
      jax.velocity.multiplyScalar(MOVEMENT_CONFIG.friction);

      finalPos = jax.position.clone().add(jax.velocity.clone().multiplyScalar(delta));

      // Rotation toward movement direction
      if (jax.isMoving) {
        const targetRot = Math.atan2(jax.velocity.x, jax.velocity.z);
        jaxRef.current.rotation.y += (targetRot - jaxRef.current.rotation.y) * MOVEMENT_CONFIG.turnSpeed;
      }
    }

    // Boundary constraints
    const BOUNDARY = 50;
    finalPos.x = THREE.MathUtils.clamp(finalPos.x, -BOUNDARY, BOUNDARY);
    finalPos.z = THREE.MathUtils.clamp(finalPos.z, -BOUNDARY, BOUNDARY);

    jax.locomotionMode = nextMode;

    // JaxController is the SOLE position writer this frame
    jaxRef.current.position.copy(finalPos);
    jax.position.copy(finalPos);

    // JUMP
    if (wasJustPressed(input.jump, prevInput?.jump ?? false)) {
      if (isGrounded && !jax.isDodging) {
        jax.velocity.y = 8.0; // Jump velocity
      }
    }

    // Update current attack using deterministic simulation time
    const currentTime = frameState.clock.elapsedTime;
    const currentAttack = attackSystem.update(currentTime, jax.position);

    // Process active hitboxes and apply damage
    attackSystem.processActiveHitboxes(currentTime, (targetId, damage) => {
      const target = scene.getObjectByProperty('uuid', targetId) || scene.getObjectByProperty('userData.targetId', targetId);
      if (target && target.userData) {
        target.userData.health = (target.userData.health || 100) - damage;

        // Apply knockback for pressure/special/ultimate attacks
        const knockback = attackSystem.getKnockbackForce();
        if (knockback && currentAttack) {
          const isKnockbackAttack = currentAttack.type === 'jax_pressure_heavy' ||
            currentAttack.type === 'jax_lightning_special' ||
            currentAttack.type === 'jax_storm_ultimate';

          if (isKnockbackAttack && target.userData.velocity) {
            target.userData.velocity.copy(knockback);
          }
        }
      }
    });

    // ATTACK: Light
    if (wasJustPressed(input.attackLight, prevInput?.attackLight ?? false)) {
      if (jax.energy >= COMBAT_CONFIG.lightAttackCost && !jax.isDodging && !jax.isAttacking) {
        jax.attackCombo = Math.min(3, jax.attackCombo + 1);
        jax.energy -= COMBAT_CONFIG.lightAttackCost;
        jax.isAttacking = true;
        jax.attackTimer = COMBAT_CONFIG.lightAttackDuration;
        jax.comboResetTimer = COMBAT_CONFIG.comboTimeWindow;
        attackSystem.startAttack(
          'jax_light_combo',
          jax.position,
          jaxRef.current.getWorldDirection(new THREE.Vector3()),
          currentTime
        );
        useAudio.getState().playAttack?.('light');
      }
    }

    // ATTACK: Heavy (pressure knockback)
    if (wasJustPressed(input.attackHeavy, prevInput?.attackHeavy ?? false)) {
      if (jax.energy >= COMBAT_CONFIG.heavyAttackCost && !jax.isDodging && !jax.isAttacking) {
        jax.attackCombo = 0;
        jax.energy -= COMBAT_CONFIG.heavyAttackCost;
        jax.isAttacking = true;
        jax.attackTimer = COMBAT_CONFIG.heavyAttackDuration;
        jax.comboResetTimer = COMBAT_CONFIG.comboTimeWindow;
        attackSystem.startAttack(
          'jax_pressure_heavy',
          jax.position,
          jaxRef.current.getWorldDirection(new THREE.Vector3()),
          currentTime
        );
        useAudio.getState().playAttack?.('heavy');
      }
    }

    // ATTACK: Special (lightning/storm)
    if (wasJustPressed(input.attackSpecial, prevInput?.attackSpecial ?? false)) {
      if (jax.energy >= COMBAT_CONFIG.specialAttackCost && !jax.isDodging && !jax.isAttacking) {
        jax.energy -= COMBAT_CONFIG.specialAttackCost;
        jax.isAttacking = true;
        jax.attackTimer = 0.7;
        jax.comboResetTimer = 0;
        attackSystem.startAttack(
          'jax_lightning_special',
          jax.position,
          jaxRef.current.getWorldDirection(new THREE.Vector3()),
          currentTime
        );
        useAudio.getState().playAttack?.('special');
      }
    }

    // ATTACK: Ultimate (storm sovereignty placeholder)
    if (wasJustPressed(input.attackUltimate, prevInput?.attackUltimate ?? false)) {
      if (jax.energy >= 75 && !jax.isDodging && !jax.isAttacking) {
        jax.energy -= 75;
        jax.isAttacking = true;
        jax.attackTimer = 1.0;
        jax.comboResetTimer = 0;
        attackSystem.startAttack(
          'jax_storm_ultimate',
          jax.position,
          jaxRef.current.getWorldDirection(new THREE.Vector3()),
          currentTime
        );
        useAudio.getState().playAttack?.('ultimate');
      }
    }

    // DODGE
    if (wasJustPressed(input.dodge, prevInput?.dodge ?? false)) {
      if (jax.energy >= DODGING_CONFIG.staminalCost && !jax.isDodging && !jax.isAttacking) {
        jax.isDodging = true;
        jax.dodgeTimer = DODGING_CONFIG.duration;
        jax.invulnTimer = DODGING_CONFIG.invulnDuration;
        jax.energy -= DODGING_CONFIG.staminalCost;
        jax.attackCombo = 0;
        useAudio.getState().playDodge?.();
      }
    }

    Object.assign(jax, { ...jax });
    prevInputRef.current = { ...input };
  });

  return {
    state: stateRef.current,
    getState: () => stateRef.current,
  };
}

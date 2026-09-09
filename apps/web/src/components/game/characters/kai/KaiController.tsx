/**
 * KAI CONTROLLER
 * Memory Spider Movement & Combat System - Day 3.5 Refactor
 *
 * Core mechanics:
 * - Unified input from keyboard/gamepad/touch
 * - Locomotion modes: GROUND, WALL, WEB_ZIP (one owner per frame)
 * - Wall-climbing with update-driven controller
 * - Web-swing with momentum and steering
 * - Light/heavy/special/ultimate combo attacks
 * - Dodge with invulnerability frames
 * - Energy/stamina management
 *
 * Architecture: KaiController is the sole owner of kai.position per frame.
 * Traversal systems return movement results rather than mutating position.
 * KaiController owns attack acceptance/energy while KaiAttackSystem owns real
 * scene-hitbox timing, target filtering, one-hit protection, and hit resolution.
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAudio } from '../../../../lib/stores/useAudio';
import { gameplayInputManager, GameplayInputState } from '../../../../lib/input/GameplayInputState';
import { WallClimbController } from './WallClimbSystem';
import { WebZipController } from './WebZipSystem';
import { KaiAttackSystem } from './KaiAttackSystem';

type LocomotionMode = 'GROUND' | 'WALL' | 'WEB_ZIP' | 'MOMENTUM' | 'AIR';

interface KaiControllerState {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: THREE.Euler;
  locomotionMode: LocomotionMode;
  isMoving: boolean;
  isAttacking: boolean;
  attackTimer: number;
  isWallCrawling: boolean;
  isWebZipping: boolean;
  isDodging: boolean;
  dodgeTimer: number;
  invulnTimer: number;
  attackCombo: number;
  comboResetTimer: number;
  energy: number;
  maxEnergy: number;
}

const MOVEMENT_CONFIG = {
  walkSpeed: 4.5,
  runSpeed: 7.5,
  turnSpeed: 0.15,
  accel: 15,
  decel: 12,
  friction: 0.92,
};

const COMBAT_CONFIG = {
  maxEnergy: 100,
  energyRegen: 25,
  lightAttackCost: 15,
  heavyAttackCost: 30,
  specialAttackCost: 50,
  comboTimeWindow: 0.8,
  lightAttackDuration: 0.4,
  heavyAttackDuration: 0.6,
};

const DODGING_CONFIG = {
  distance: 3.0,
  duration: 0.4,
  invulnDuration: 0.5,
  staminalCost: 20,
};

export function useKaiController(kaiRef: React.RefObject<THREE.Group>, scene: THREE.Scene) {
  const prevInputRef = useRef<GameplayInputState | null>(null);
  const stateRef = useRef<KaiControllerState>({
    position: new THREE.Vector3(0, 0, 0),
    velocity: new THREE.Vector3(0, 0, 0),
    rotation: new THREE.Euler(0, 0, 0),
    locomotionMode: 'GROUND',
    isMoving: false,
    isAttacking: false,
    attackTimer: 0,
    isWallCrawling: false,
    isWebZipping: false,
    isDodging: false,
    dodgeTimer: 0,
    invulnTimer: 0,
    attackCombo: 0,
    comboResetTimer: 0,
    energy: COMBAT_CONFIG.maxEnergy,
    maxEnergy: COMBAT_CONFIG.maxEnergy,
  });

  const wasJustPressed = (current: boolean, previous: boolean | null): boolean => {
    return current && !previous;
  };

  const wallClimbController = useMemo(() => new WallClimbController(scene), [scene]);
  const webZipController = useMemo(() => new WebZipController(scene), [scene]);
  const attackSystem = useMemo(() => new KaiAttackSystem(scene), [scene]);
  const anchorsRegisteredRef = useRef(false);

  useFrame((frameState, rawDelta) => {
    if (!kaiRef.current) return;

    // Movement stays tightly capped for traversal/collision stability, while
    // combat readiness uses bounded lifecycle catch-up so software WebGL cannot
    // stretch authored attack, dodge, combo, or energy timing across wall clock.
    const delta = Math.min(Math.max(rawDelta, 0), 0.033);
    const lifecycleDelta = Math.min(Math.max(rawDelta, 0), 0.25);
    const kai = stateRef.current;
    const input = gameplayInputManager.getState();
    const prevInput = prevInputRef.current;
    const currentTime = frameState.clock.elapsedTime;

    kaiRef.current.getWorldPosition(kai.position);
    kai.rotation.copy(kaiRef.current.rotation);

    kai.energy = Math.min(
      kai.energy + COMBAT_CONFIG.energyRegen * lifecycleDelta,
      kai.maxEnergy
    );

    if (kai.invulnTimer > 0) {
      kai.invulnTimer = Math.max(0, kai.invulnTimer - lifecycleDelta);
    }

    if (kai.isDodging) {
      kai.dodgeTimer = Math.max(0, kai.dodgeTimer - lifecycleDelta);
      if (kai.dodgeTimer === 0) {
        kai.isDodging = false;
      }
    }

    if (kai.isAttacking) {
      kai.attackTimer = Math.max(0, kai.attackTimer - lifecycleDelta);
      if (kai.attackTimer === 0) {
        kai.isAttacking = false;
      }
    }

    if (kai.comboResetTimer > 0) {
      kai.comboResetTimer = Math.max(0, kai.comboResetTimer - lifecycleDelta);
      if (kai.comboResetTimer === 0) {
        kai.attackCombo = 0;
      }
    }

    if (!anchorsRegisteredRef.current) {
      webZipController.registerAnchorsFromScene();
      anchorsRegisteredRef.current = true;
    }

    const wallClimbResult = wallClimbController.update(delta, {
      moveX: input.moveX,
      moveY: input.moveY,
      jump: input.jump,
      traversalModifier: input.traversalModifier,
    }, kai.position, kaiRef.current.getWorldDirection(new THREE.Vector3()));

    const webZipResult = webZipController.update(delta, {
      traversal: input.traversal,
      moveX: input.moveX,
    }, kai.position);

    kai.isWallCrawling = wallClimbController.isClimbing();
    kai.isWebZipping = webZipController.isZipping();

    let finalPos: THREE.Vector3;
    let nextMode: LocomotionMode = 'GROUND';

    if (kai.isWallCrawling && wallClimbResult) {
      finalPos = wallClimbResult;
      kai.isMoving = false;
      nextMode = 'WALL';
    } else if (kai.isWebZipping && webZipResult) {
      finalPos = webZipResult;
      kai.isMoving = false;
      nextMode = 'WEB_ZIP';
    } else if (webZipResult && webZipResult.distanceTo(kai.position) > 0.001) {
      finalPos = webZipResult;
      kai.isMoving = false;
      nextMode = 'MOMENTUM';
    } else {
      nextMode = 'GROUND';
      const inputX = input.moveX;
      const inputY = input.moveY;
      const inputLen = Math.hypot(inputX, inputY);
      kai.isMoving = inputLen > 0.01;

      const isRunning = input.isRunning;
      const targetSpeed = isRunning ? MOVEMENT_CONFIG.runSpeed : MOVEMENT_CONFIG.walkSpeed;

      // Shared camera-relative convention: W (moveY=-1) always means camera forward.
      const cameraForward = new THREE.Vector3();
      frameState.camera.getWorldDirection(cameraForward);
      cameraForward.y = 0;
      if (cameraForward.lengthSq() < 0.0001) cameraForward.set(0, 0, -1);
      cameraForward.normalize();

      const cameraRight = new THREE.Vector3()
        .crossVectors(cameraForward, new THREE.Vector3(0, 1, 0))
        .normalize();

      const moveDir = cameraRight.multiplyScalar(inputX)
        .add(cameraForward.multiplyScalar(-inputY));
      if (moveDir.lengthSq() > 1) moveDir.normalize();

      const targetVel = moveDir.multiplyScalar(targetSpeed);
      kai.velocity.lerp(targetVel, Math.min(1, MOVEMENT_CONFIG.accel * delta));
      kai.velocity.multiplyScalar(MOVEMENT_CONFIG.friction);

      finalPos = kai.position.clone().add(kai.velocity.clone().multiplyScalar(delta));

      if (kai.isMoving && kai.velocity.lengthSq() > 0.0001) {
        const targetRot = Math.atan2(kai.velocity.x, kai.velocity.z);
        kaiRef.current.rotation.y += (targetRot - kaiRef.current.rotation.y) * MOVEMENT_CONFIG.turnSpeed;
      }
    }

    const BOUNDARY = 50;
    finalPos.x = THREE.MathUtils.clamp(finalPos.x, -BOUNDARY, BOUNDARY);
    finalPos.z = THREE.MathUtils.clamp(finalPos.z, -BOUNDARY, BOUNDARY);

    kai.locomotionMode = nextMode;
    kaiRef.current.position.copy(finalPos);
    kai.position.copy(finalPos);

    const facingDir = kaiRef.current.getWorldDirection(new THREE.Vector3());
    facingDir.y = 0;
    if (facingDir.lengthSq() < 0.0001) facingDir.set(0, 0, 1);
    facingDir.normalize();

    // Keep the hitbox origin current before processing the previous accepted attack.
    attackSystem.update(currentTime, kai.position);

    if (wasJustPressed(input.attackLight, prevInput?.attackLight ?? false)) {
      if (kai.energy >= COMBAT_CONFIG.lightAttackCost && !kai.isDodging && !kai.isAttacking) {
        kai.attackCombo = Math.min(3, kai.attackCombo + 1);
        kai.energy -= COMBAT_CONFIG.lightAttackCost;
        kai.isAttacking = true;
        kai.attackTimer = COMBAT_CONFIG.lightAttackDuration;
        kai.comboResetTimer = COMBAT_CONFIG.comboTimeWindow;
        attackSystem.startAttack('light', kai.position, facingDir, currentTime, kai.attackCombo - 1);
        useAudio.getState().playAttack?.('light');
      }
    }

    if (wasJustPressed(input.attackHeavy, prevInput?.attackHeavy ?? false)) {
      if (kai.energy >= COMBAT_CONFIG.heavyAttackCost && !kai.isDodging && !kai.isAttacking) {
        kai.attackCombo = 0;
        kai.energy -= COMBAT_CONFIG.heavyAttackCost;
        kai.isAttacking = true;
        kai.attackTimer = COMBAT_CONFIG.heavyAttackDuration;
        kai.comboResetTimer = COMBAT_CONFIG.comboTimeWindow;
        attackSystem.startAttack('heavy', kai.position, facingDir, currentTime);
        useAudio.getState().playAttack?.('heavy');
      }
    }

    if (wasJustPressed(input.attackSpecial, prevInput?.attackSpecial ?? false)) {
      if (kai.energy >= COMBAT_CONFIG.specialAttackCost && !kai.isDodging && !kai.isAttacking) {
        kai.energy -= COMBAT_CONFIG.specialAttackCost;
        kai.isAttacking = true;
        kai.attackTimer = 0.8;
        kai.comboResetTimer = 0;
        attackSystem.startAttack('special', kai.position, facingDir, currentTime);
        useAudio.getState().playAttack?.('special');
      }
    }

    if (wasJustPressed(input.attackUltimate, prevInput?.attackUltimate ?? false)) {
      if (kai.energy >= 80 && !kai.isDodging && !kai.isAttacking) {
        kai.energy -= 80;
        kai.isAttacking = true;
        kai.attackTimer = 1.2;
        kai.comboResetTimer = 0;
        attackSystem.startAttack('ultimate', kai.position, facingDir, currentTime);
        useAudio.getState().playAttack?.('ultimate');
      }
    }

    if (wasJustPressed(input.dodge, prevInput?.dodge ?? false)) {
      if (kai.energy >= DODGING_CONFIG.staminalCost && !kai.isDodging && !kai.isAttacking) {
        kai.isDodging = true;
        kai.dodgeTimer = DODGING_CONFIG.duration;
        kai.invulnTimer = DODGING_CONFIG.invulnDuration;
        kai.energy -= DODGING_CONFIG.staminalCost;
        kai.attackCombo = 0;
        useAudio.getState().playDodge?.();
      }
    }

    // Re-run update so an attack accepted this frame has the same position/time
    // authority as an already-active attack, then resolve only real scene targets.
    attackSystem.update(currentTime, kai.position);
    attackSystem.processActiveHitboxes(currentTime, (target, damage, attack) => {
      const health = typeof target.userData.health === 'number'
        ? target.userData.health
        : 100;
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

    prevInputRef.current = { ...input };
  });

  return {
    state: stateRef.current,
    getState: () => stateRef.current,
    getAttackSystem: () => attackSystem,
    refreshAnchors: () => {
      webZipController.registerAnchorsFromScene();
    },
  };
}

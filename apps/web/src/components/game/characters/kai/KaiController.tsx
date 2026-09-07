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
 * Traversal systems (WallClimbController, WebZipController) are update-driven:
 * they return movement results, not write position directly.
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAudio } from '../../../../lib/stores/useAudio';
import { gameplayInputManager, GameplayInputState } from '../../../../lib/input/GameplayInputState';
import { WallClimbController } from './WallClimbSystem';
import { WebZipController } from './WebZipSystem';

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

const WALL_CLIMB_CONFIG = {
  detectionDistance: 1.5,
  climbSpeed: 2.0,
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

  // Helper to detect if input just changed from false to true
  const wasJustPressed = (current: boolean, previous: boolean | null): boolean => {
    return current && !previous;
  };

  // Create update-driven controllers (not hooks)
  const wallClimbController = useMemo(() => new WallClimbController(scene), [scene]);
  const webZipController = useMemo(() => new WebZipController(scene), [scene]);

  // Track whether anchors have been registered (lazy-load, not every frame)
  const anchorsRegisteredRef = useRef(false);

  // Main update loop
  useFrame((frameState, rawDelta) => {
    if (!kaiRef.current) return;

    const delta = Math.min(rawDelta, 0.033); // Cap at 30fps minimum
    const kai = stateRef.current;

    // Get unified input state from all sources (keyboard, touch, gamepad)
    const input = gameplayInputManager.getState();
    const prevInput = prevInputRef.current;

    // Update Kai transform from ref without casting an Euler as a Vector3.
    kaiRef.current.getWorldPosition(kai.position);
    kai.rotation.copy(kaiRef.current.rotation);

    // Energy regeneration
    kai.energy = Math.min(kai.energy + COMBAT_CONFIG.energyRegen * delta, kai.maxEnergy);

    // FIX: Invulnerability timer
    if (kai.invulnTimer > 0) {
      kai.invulnTimer -= delta;
    }

    // FIX: Dodge state lifecycle - automatically exit when timer expires
    if (kai.isDodging) {
      kai.dodgeTimer -= delta;
      if (kai.dodgeTimer <= 0) {
        kai.isDodging = false;
        kai.dodgeTimer = 0;
      }
    }

    // FIX: Attack state lifecycle - automatically exit when timer expires
    if (kai.isAttacking) {
      kai.attackTimer -= delta;
      if (kai.attackTimer <= 0) {
        kai.isAttacking = false;
        kai.attackTimer = 0;
      }
    }

    // FIX: Combo reset timer
    if (kai.comboResetTimer > 0) {
      kai.comboResetTimer -= delta;
      if (kai.comboResetTimer <= 0) {
        kai.attackCombo = 0;
        kai.comboResetTimer = 0;
      }
    }

    // Register web anchors once on first frame (lazy-load, not every frame)
    if (!anchorsRegisteredRef.current) {
      webZipController.registerAnchorsFromScene();
      anchorsRegisteredRef.current = true;
    }

    // LOCOMOTION MODE DECISION: Only one system owns position per frame
    // Update traversal controllers with LIVE input
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

    // Update state flags
    kai.isWallCrawling = wallClimbController.isClimbing();
    kai.isWebZipping = webZipController.isZipping();

    // EXCLUSIVE LOCOMOTION MODE: only one system owns position per frame
    let finalPos: THREE.Vector3;
    let nextMode: LocomotionMode = 'GROUND';

    // Priority: WALL > WEB_ZIP > MOMENTUM > GROUND
    if (kai.isWallCrawling && wallClimbResult) {
      // WALL mode: wall climbing owns position
      finalPos = wallClimbResult;
      kai.isMoving = false;
      nextMode = 'WALL';
    } else if (kai.isWebZipping && webZipResult) {
      // WEB_ZIP mode: web zipping owns position (exclusive with WALL)
      finalPos = webZipResult;
      kai.isMoving = false;
      nextMode = 'WEB_ZIP';
    } else if (webZipResult && webZipResult.distanceTo(kai.position) > 0.001) {
      // MOMENTUM mode: residual momentum from previous zip
      finalPos = webZipResult;
      kai.isMoving = false;
      nextMode = 'MOMENTUM';
    } else {
      // GROUND mode: normal walking/running
      nextMode = 'GROUND';
      const inputX = input.moveX;
      const inputZ = input.moveY;
      const inputLen = Math.hypot(inputX, inputZ);

      kai.isMoving = inputLen > 0.01;

      const isRunning = input.isRunning;
      const targetSpeed = isRunning ? MOVEMENT_CONFIG.runSpeed : MOVEMENT_CONFIG.walkSpeed;

      // Calculate world-space movement direction
      const moveDir = new THREE.Vector3(inputX, 0, inputZ);
      const cameraDir = new THREE.Vector3();
      frameState.camera.getWorldDirection(cameraDir);
      cameraDir.y = 0;
      cameraDir.normalize();

      const moveInWorldSpace = moveDir.length() > 0;
      if (moveInWorldSpace) {
        moveDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.atan2(cameraDir.x, cameraDir.z));
      }

      // Apply velocity
      const targetVel = moveDir.multiplyScalar(targetSpeed);
      kai.velocity.lerp(targetVel, MOVEMENT_CONFIG.accel * delta);
      kai.velocity.multiplyScalar(MOVEMENT_CONFIG.friction);

      // Update position
      finalPos = kai.position.clone().add(kai.velocity.clone().multiplyScalar(delta));

      // Rotation toward movement direction
      if (kai.isMoving) {
        const targetRot = Math.atan2(kai.velocity.x, kai.velocity.z);
        kaiRef.current.rotation.y += (targetRot - kaiRef.current.rotation.y) * MOVEMENT_CONFIG.turnSpeed;
      }
    }

    // Boundary constraints (arena or level bounds)
    const BOUNDARY = 50;
    finalPos.x = THREE.MathUtils.clamp(finalPos.x, -BOUNDARY, BOUNDARY);
    finalPos.z = THREE.MathUtils.clamp(finalPos.z, -BOUNDARY, BOUNDARY);

    // Update exclusive locomotion mode
    kai.locomotionMode = nextMode;

    // KaiController is the SOLE position writer this frame
    kaiRef.current.position.copy(finalPos);
    kai.position.copy(finalPos);

    // FIX: Attack input - set timer for proper state lifecycle (unified input)
    if (wasJustPressed(input.attackLight, prevInput?.attackLight ?? false)) {
      if (kai.energy >= COMBAT_CONFIG.lightAttackCost && !kai.isDodging && !kai.isAttacking) {
        kai.attackCombo = Math.min(3, kai.attackCombo + 1);
        kai.energy -= COMBAT_CONFIG.lightAttackCost;
        kai.isAttacking = true;
        kai.attackTimer = COMBAT_CONFIG.lightAttackDuration; // Set timer to auto-exit
        kai.comboResetTimer = COMBAT_CONFIG.comboTimeWindow; // Reset combo timer
        useAudio.getState().playAttack?.('light');
      }
    }

    if (wasJustPressed(input.attackHeavy, prevInput?.attackHeavy ?? false)) {
      if (kai.energy >= COMBAT_CONFIG.heavyAttackCost && !kai.isDodging && !kai.isAttacking) {
        kai.attackCombo = 0; // Reset combo on heavy
        kai.energy -= COMBAT_CONFIG.heavyAttackCost;
        kai.isAttacking = true;
        kai.attackTimer = COMBAT_CONFIG.heavyAttackDuration; // Set timer to auto-exit
        kai.comboResetTimer = COMBAT_CONFIG.comboTimeWindow;
        useAudio.getState().playAttack?.('heavy');
      }
    }

    if (wasJustPressed(input.attackSpecial, prevInput?.attackSpecial ?? false)) {
      if (kai.energy >= COMBAT_CONFIG.specialAttackCost && !kai.isDodging && !kai.isAttacking) {
        kai.energy -= COMBAT_CONFIG.specialAttackCost;
        kai.isAttacking = true;
        kai.attackTimer = 0.8; // Special attack duration
        kai.comboResetTimer = 0;
        useAudio.getState().playAttack?.('special');
      }
    }

    if (wasJustPressed(input.attackUltimate, prevInput?.attackUltimate ?? false)) {
      if (kai.energy >= 80 && !kai.isDodging && !kai.isAttacking) {
        kai.energy -= 80;
        kai.isAttacking = true;
        kai.attackTimer = 1.2; // Ultimate attack duration
        kai.comboResetTimer = 0;
        useAudio.getState().playAttack?.('ultimate');
      }
    }

    // FIX: Dodge input - set timer and properly track invulnerability
    if (wasJustPressed(input.dodge, prevInput?.dodge ?? false)) {
      if (kai.energy >= DODGING_CONFIG.staminalCost && !kai.isDodging && !kai.isAttacking) {
        kai.isDodging = true;
        kai.dodgeTimer = DODGING_CONFIG.duration; // Track dodge duration
        kai.invulnTimer = DODGING_CONFIG.invulnDuration; // Track invulnerability window
        kai.energy -= DODGING_CONFIG.staminalCost;
        kai.attackCombo = 0;
        useAudio.getState().playDodge?.();
      }
    }

    // Copy back for external access
    Object.assign(kai, { ...kai });

    // Store current input for next frame
    prevInputRef.current = { ...input };
  });

  return {
    state: stateRef.current,
    getState: () => stateRef.current,
    // Explicit refresh for anchor changes (level loads, etc)
    refreshAnchors: () => {
      webZipController.registerAnchorsFromScene();
    },
  };
}
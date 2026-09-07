/**
 * KAI CONTROLLER
 * Memory Spider Movement & Combat System - Day 1-2 MVP
 *
 * Core mechanics:
 * - 3D movement (WASD + mouse, touch joystick, gamepad)
 * - Wall-climbing detection (when near vertical surfaces)
 * - Web-swing momentum (curved traversal)
 * - Light combo attacks (3-hit light, 2-hit heavy)
 * - Dodge with invulnerability frames
 * - Energy/stamina management
 *
 * Input: Unified GameplayInputState (keyboard/touch/gamepad)
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAudio } from '../../../../lib/stores/useAudio';
import { gameplayInputManager, GameplayInputState } from '../../../../lib/input/GameplayInputState';

interface KaiControllerState {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: THREE.Euler;
  isMoving: boolean;
  isAttacking: boolean;
  attackTimer: number; // FIX: Track attack duration separately
  isWallCrawling: boolean;
  isDodging: boolean;
  dodgeTimer: number; // FIX: Track dodge duration separately
  invulnTimer: number;
  attackCombo: number;
  comboResetTimer: number; // FIX: Track combo window
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

export function useKaiController(kaiRef: React.RefObject<THREE.Group>) {
  const prevInputRef = useRef<GameplayInputState | null>(null);
  const stateRef = useRef<KaiControllerState>({
    position: new THREE.Vector3(0, 0, 0),
    velocity: new THREE.Vector3(0, 0, 0),
    rotation: new THREE.Euler(0, 0, 0),
    isMoving: false,
    isAttacking: false,
    attackTimer: 0,
    isWallCrawling: false,
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

  // Main update loop
  useFrame((state, rawDelta) => {
    if (!kaiRef.current) return;

    const delta = Math.min(rawDelta, 0.033); // Cap at 30fps minimum
    const kai = stateRef.current;

    // Get unified input state from all sources (keyboard, touch, gamepad)
    const input = gameplayInputManager.getState();
    const prevInput = prevInputRef.current;

    // Update Kai position from ref
    kaiRef.current.getWorldPosition(kai.position);
    kaiRef.current.getWorldDirection(kai.rotation as any);

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

    // Wall detection - raycasts to find nearby walls
    const raycaster = new THREE.Raycaster(
      kai.position,
      new THREE.Vector3(0, 0, 1),
      0,
      WALL_CLIMB_CONFIG.detectionDistance
    );

    // For now, wall climbing is disabled until we have proper level geometry
    // This would detect walls and enable wall crawl mode
    kai.isWallCrawling = false;

    // Movement input from unified input manager
    const inputX = input.moveX;
    const inputZ = input.moveY; // Y axis becomes Z in 3D space
    const inputLen = Math.hypot(inputX, inputZ);

    kai.isMoving = inputLen > 0.01;

    const isRunning = input.isRunning;
    const targetSpeed = isRunning ? MOVEMENT_CONFIG.runSpeed : MOVEMENT_CONFIG.walkSpeed;

    // Calculate world-space movement direction
    const moveDir = new THREE.Vector3(inputX, 0, inputZ);
    const cameraDir = new THREE.Vector3();
    state.camera.getWorldDirection(cameraDir);
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
    const newPos = kai.position.clone().add(kai.velocity.clone().multiplyScalar(delta));

    // Boundary constraints (arena or level bounds)
    const BOUNDARY = 50;
    newPos.x = THREE.MathUtils.clamp(newPos.x, -BOUNDARY, BOUNDARY);
    newPos.z = THREE.MathUtils.clamp(newPos.z, -BOUNDARY, BOUNDARY);

    kaiRef.current.position.copy(newPos);

    // Rotation toward movement direction
    if (kai.isMoving) {
      const targetRot = Math.atan2(kai.velocity.x, kai.velocity.z);
      kaiRef.current.rotation.y += (targetRot - kaiRef.current.rotation.y) * MOVEMENT_CONFIG.turnSpeed;
    }

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
  };
}

/**
 * KAI CONTROLLER
 * Memory Spider Movement & Combat System - Day 1-2 MVP
 *
 * Core mechanics:
 * - 3D movement (WASD + mouse)
 * - Wall-climbing detection (when near vertical surfaces)
 * - Web-swing momentum (curved traversal)
 * - Light combo attacks (3-hit light, 2-hit heavy)
 * - Dodge with invulnerability frames
 * - Energy/stamina management
 */

import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAudio } from '../../../../lib/stores/useAudio';

interface KaiControllerState {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: THREE.Euler;
  isMoving: boolean;
  isAttacking: boolean;
  isWallCrawling: boolean;
  isDodging: boolean;
  invulnTimer: number;
  attackCombo: number;
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
  const keysRef = useRef<Record<string, boolean>>({});
  const prevKeysRef = useRef<Record<string, boolean>>({});
  const stateRef = useRef<KaiControllerState>({
    position: new THREE.Vector3(0, 0, 0),
    velocity: new THREE.Vector3(0, 0, 0),
    rotation: new THREE.Euler(0, 0, 0),
    isMoving: false,
    isAttacking: false,
    isWallCrawling: false,
    isDodging: false,
    invulnTimer: 0,
    attackCombo: 0,
    energy: COMBAT_CONFIG.maxEnergy,
    maxEnergy: COMBAT_CONFIG.maxEnergy,
  });

  // Keyboard input tracking
  useEffect(() => {
    const keys = keysRef.current;
    const handleDown = (e: KeyboardEvent) => {
      keys[e.code] = true;
    };
    const handleUp = (e: KeyboardEvent) => {
      keys[e.code] = false;
    };
    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    return () => {
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
    };
  }, []);

  // Main update loop
  useFrame((state, rawDelta) => {
    if (!kaiRef.current) return;

    const delta = Math.min(rawDelta, 0.033); // Cap at 30fps minimum
    const kai = stateRef.current;
    const keys = keysRef.current;
    const prev = prevKeysRef.current;
    const justPressed = (code: string) => keys[code] && !prev[code];

    // Update Kai position from ref
    kaiRef.current.getWorldPosition(kai.position);
    kaiRef.current.getWorldDirection(kai.rotation as any);

    // Energy regeneration
    kai.energy = Math.min(kai.energy + COMBAT_CONFIG.energyRegen * delta, kai.maxEnergy);

    // Invulnerability timer
    if (kai.invulnTimer > 0) {
      kai.invulnTimer -= delta;
    }

    // Dodge state
    if (kai.isDodging) {
      // Dodge implementation would go here
      // For now, just decrement timer
    }

    // Attack state
    if (kai.isAttacking) {
      // Attack logic will be implemented in separate AttackSystem
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

    // Movement input
    let inputX = 0;
    let inputZ = 0;
    if (keys['KeyW'] || keys['ArrowUp']) inputZ -= 1;
    if (keys['KeyS'] || keys['ArrowDown']) inputZ += 1;
    if (keys['KeyA'] || keys['ArrowLeft']) inputX -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) inputX += 1;

    const inputLen = Math.sqrt(inputX * inputX + inputZ * inputZ);
    if (inputLen > 0.01) {
      inputX /= inputLen;
      inputZ /= inputLen;
    }

    kai.isMoving = inputLen > 0.01;

    const isRunning = keys['ShiftLeft'] || keys['ShiftRight'];
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

    // Attack input
    if (justPressed('KeyJ') || justPressed('KeyX')) {
      if (kai.energy >= COMBAT_CONFIG.lightAttackCost && !kai.isDodging) {
        kai.attackCombo = Math.min(3, kai.attackCombo + 1);
        kai.energy -= COMBAT_CONFIG.lightAttackCost;
        kai.isAttacking = true;
        useAudio.getState().playAttack?.('light');
      }
    }

    if (justPressed('KeyK') || justPressed('KeyZ')) {
      if (kai.energy >= COMBAT_CONFIG.heavyAttackCost && !kai.isDodging) {
        kai.attackCombo = 0; // Reset combo on heavy
        kai.energy -= COMBAT_CONFIG.heavyAttackCost;
        kai.isAttacking = true;
        useAudio.getState().playAttack?.('heavy');
      }
    }

    // Dodge input
    if (justPressed('Space')) {
      if (kai.energy >= DODGING_CONFIG.staminalCost && !kai.isDodging) {
        kai.isDodging = true;
        kai.invulnTimer = DODGING_CONFIG.invulnDuration;
        kai.energy -= DODGING_CONFIG.staminalCost;
        kai.attackCombo = 0;
        useAudio.getState().playDodge?.();
      }
    }

    // Reset combo timer
    if (kai.attackCombo > 0 && !kai.isAttacking) {
      // Combo timing would be tracked separately
    }

    // Copy back for external access
    Object.assign(kai, { ...kai });

    prevKeysRef.current = { ...keys };
  });

  return {
    state: stateRef.current,
    getState: () => stateRef.current,
  };
}

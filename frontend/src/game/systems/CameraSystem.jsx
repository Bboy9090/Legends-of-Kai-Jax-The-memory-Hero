import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../stores/gameStore';

// Third Person Camera Controller
export const ThirdPersonCamera = ({ target, offset = [0, 4, 8], smoothness = 0.1 }) => {
  const { camera } = useThree();
  const { player, gameState } = useGameStore();
  
  const currentPosition = useRef(new THREE.Vector3());
  const currentLookAt = useRef(new THREE.Vector3());
  const idealOffset = useRef(new THREE.Vector3(...offset));
  const idealLookAt = useRef(new THREE.Vector3(0, 1, 0));

  useFrame((state, delta) => {
    if (gameState !== 'playing') return;

    const playerPos = new THREE.Vector3(...player.position);
    
    // Calculate ideal camera position (behind and above player)
    const targetPosition = playerPos.clone().add(idealOffset.current);
    
    // Smooth camera movement
    currentPosition.current.lerp(targetPosition, smoothness);
    camera.position.copy(currentPosition.current);
    
    // Look at player
    const lookAtPos = playerPos.clone().add(idealLookAt.current);
    currentLookAt.current.lerp(lookAtPos, smoothness * 1.5);
    camera.lookAt(currentLookAt.current);
  });

  return null;
};

// Cinematic Camera for cutscenes
export const CinematicCamera = ({ waypoints, duration = 5, onComplete }) => {
  const { camera } = useThree();
  const progress = useRef(0);
  const currentWaypoint = useRef(0);

  useFrame((state, delta) => {
    if (waypoints.length < 2) return;

    progress.current += delta / duration;
    
    const t = progress.current % 1;
    const from = waypoints[currentWaypoint.current];
    const to = waypoints[(currentWaypoint.current + 1) % waypoints.length];
    
    // Smooth interpolation
    camera.position.lerpVectors(
      new THREE.Vector3(...from.position),
      new THREE.Vector3(...to.position),
      t
    );
    
    const lookAtFrom = new THREE.Vector3(...from.lookAt);
    const lookAtTo = new THREE.Vector3(...to.lookAt);
    const currentLookAt = new THREE.Vector3().lerpVectors(lookAtFrom, lookAtTo, t);
    camera.lookAt(currentLookAt);

    if (progress.current >= 1) {
      currentWaypoint.current = (currentWaypoint.current + 1) % waypoints.length;
      progress.current = 0;
      
      if (currentWaypoint.current === 0 && onComplete) {
        onComplete();
      }
    }
  });

  return null;
};

// Free Camera for debug/spectator mode
export const FreeCamera = ({ speed = 10 }) => {
  const { camera } = useThree();
  const keys = useRef({});
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const isLocked = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e) => { keys.current[e.code] = true; };
    const handleKeyUp = (e) => { keys.current[e.code] = false; };
    
    const handleMouseMove = (e) => {
      if (!isLocked.current) return;
      
      euler.current.y -= e.movementX * 0.002;
      euler.current.x -= e.movementY * 0.002;
      euler.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.current.x));
      
      camera.quaternion.setFromEuler(euler.current);
    };

    const handleClick = () => {
      document.body.requestPointerLock?.();
      isLocked.current = true;
    };

    const handleLockChange = () => {
      isLocked.current = document.pointerLockElement === document.body;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    document.addEventListener('pointerlockchange', handleLockChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      document.removeEventListener('pointerlockchange', handleLockChange);
    };
  }, [camera]);

  useFrame((state, delta) => {
    const direction = new THREE.Vector3();
    
    if (keys.current['KeyW']) direction.z -= 1;
    if (keys.current['KeyS']) direction.z += 1;
    if (keys.current['KeyA']) direction.x -= 1;
    if (keys.current['KeyD']) direction.x += 1;
    if (keys.current['Space']) direction.y += 1;
    if (keys.current['ShiftLeft']) direction.y -= 1;
    
    direction.normalize().multiplyScalar(speed * delta);
    direction.applyQuaternion(camera.quaternion);
    camera.position.add(direction);
  });

  return null;
};

export default ThirdPersonCamera;

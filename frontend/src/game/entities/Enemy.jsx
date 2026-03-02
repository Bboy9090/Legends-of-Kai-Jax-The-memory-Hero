import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { useGameStore } from '../stores/gameStore';

// Enemy configurations
const ENEMY_CONFIGS = {
  fangGrunt: {
    name: 'Fang Grunt',
    health: 60, damage: 10, speed: 4, scale: 0.8,
    color: '#8B4513', faction: 'fangSyndicate',
    detectionRange: 12, attackRange: 2.5, attackCooldown: 1200,
  },
  fangEnforcer: {
    name: 'Fang Enforcer',
    health: 150, damage: 25, speed: 3.5, scale: 1.2,
    color: '#654321', faction: 'fangSyndicate',
    detectionRange: 15, attackRange: 3, attackCooldown: 1500,
  },
  covenantCultist: {
    name: 'Covenant Cultist',
    health: 45, damage: 15, speed: 5, scale: 0.7,
    color: '#4A0E4E', faction: 'covenant',
    detectionRange: 14, attackRange: 2, attackCooldown: 1000,
  },
  covenantChampion: {
    name: 'Covenant Champion',
    health: 200, damage: 35, speed: 4, scale: 1.3,
    color: '#2D0A2E', faction: 'covenant',
    detectionRange: 18, attackRange: 3.5, attackCooldown: 1800,
  },
};

// AI States
const AI_STATE = {
  IDLE: 'idle', PATROL: 'patrol', ALERT: 'alert',
  CHASE: 'chase', ATTACK: 'attack', RETREAT: 'retreat', DEAD: 'dead',
};

// Simple geometric enemy model
const EnemyModel = ({ config, isAttacking, health, maxHealth }) => {
  const groupRef = useRef();
  const healthPercent = health / maxHealth;
  const isFang = config.faction === 'fangSyndicate';

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.03;
      if (isAttacking) {
        groupRef.current.position.z = 0.15;
        groupRef.current.rotation.x = 0.2;
      } else {
        groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, 0, 0.1);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, 0.1);
      }
    }
  });

  return (
    <group ref={groupRef} scale={config.scale}>
      {/* Body */}
      <mesh castShadow>
        <boxGeometry args={[0.5, 0.9, 0.35]} />
        <meshStandardMaterial color={config.color} roughness={0.8} />
      </mesh>

      {/* Head */}
      <mesh castShadow position={[0, 0.65, 0]}>
        {isFang ? (
          <dodecahedronGeometry args={[0.25, 0]} />
        ) : (
          <octahedronGeometry args={[0.25, 0]} />
        )}
        <meshStandardMaterial color={config.color} roughness={0.7} />
      </mesh>

      {/* Eyes */}
      <mesh position={[0.08, 0.7, 0.2]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshStandardMaterial color="#FF0000" emissive="#FF0000" emissiveIntensity={2} />
      </mesh>
      <mesh position={[-0.08, 0.7, 0.2]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshStandardMaterial color="#FF0000" emissive="#FF0000" emissiveIntensity={2} />
      </mesh>

      {/* Faction features */}
      {isFang && (
        <>
          <mesh position={[0.25, 0.3, 0]} rotation={[0, 0, 0.5]} castShadow>
            <coneGeometry args={[0.06, 0.15, 4]} />
            <meshStandardMaterial color="#333" metalness={0.8} />
          </mesh>
          <mesh position={[-0.25, 0.3, 0]} rotation={[0, 0, -0.5]} castShadow>
            <coneGeometry args={[0.06, 0.15, 4]} />
            <meshStandardMaterial color="#333" metalness={0.8} />
          </mesh>
        </>
      )}

      {!isFang && (
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.28, 0.35, 0.5, 6]} />
          <meshStandardMaterial color="#1a0a1a" roughness={0.9} transparent opacity={0.8} />
        </mesh>
      )}

      {/* Health bar */}
      <group position={[0, 1.2, 0]}>
        <mesh>
          <boxGeometry args={[0.8, 0.08, 0.02]} />
          <meshBasicMaterial color="#222" />
        </mesh>
        <mesh position={[(healthPercent - 1) * 0.38, 0, 0.01]}>
          <boxGeometry args={[0.76 * healthPercent, 0.06, 0.02]} />
          <meshBasicMaterial color={healthPercent > 0.5 ? '#30D158' : healthPercent > 0.25 ? '#FFD60A' : '#FF3B30'} />
        </mesh>
      </group>

      {/* Aggro light */}
      <pointLight position={[0, 0.5, 0]} color={isAttacking ? '#FF0000' : '#FF6600'} intensity={isAttacking ? 2 : 0.5} distance={3} />
    </group>
  );
};

// Main Enemy Component
export const Enemy = ({ id, type = 'fangGrunt', initialPosition = [0, 1, 0], patrolPoints = [] }) => {
  const rigidBodyRef = useRef();
  const config = ENEMY_CONFIGS[type];
  
  const [health, setHealth] = useState(config.health);
  const [aiState, setAiState] = useState(patrolPoints.length > 0 ? AI_STATE.PATROL : AI_STATE.IDLE);
  const [isAttacking, setIsAttacking] = useState(false);
  
  const { player, enterCombat, exitCombat, updateFactionAwareness, removeEnemy, updatePlayerHealth } = useGameStore();
  
  const currentPatrolIndex = useRef(0);
  const lastAttackTime = useRef(0);
  const alertTimer = useRef(0);

  // Take damage
  const takeDamage = (amount) => {
    const newHealth = Math.max(0, health - amount);
    setHealth(newHealth);
    
    if (newHealth <= 0) {
      setAiState(AI_STATE.DEAD);
      setTimeout(() => removeEnemy(id), 1000);
    } else if (newHealth < config.health * 0.3 && Math.random() > 0.6) {
      setAiState(AI_STATE.RETREAT);
    } else if (aiState === AI_STATE.IDLE || aiState === AI_STATE.PATROL) {
      setAiState(AI_STATE.ALERT);
      alertTimer.current = 0;
    }
    updateFactionAwareness(config.faction, 5);
  };

  // AI Logic
  useFrame((state, delta) => {
    if (!rigidBodyRef.current || aiState === AI_STATE.DEAD) return;

    const body = rigidBodyRef.current;
    const pos = body.translation();
    const linvel = body.linvel();
    const playerPos = new THREE.Vector3(...player.position);
    const enemyPos = new THREE.Vector3(pos.x, pos.y, pos.z);
    const distanceToPlayer = enemyPos.distanceTo(playerPos);
    const directionToPlayer = playerPos.clone().sub(enemyPos).normalize();

    switch (aiState) {
      case AI_STATE.IDLE:
        body.setLinvel({ x: 0, y: linvel.y, z: 0 }, true);
        if (distanceToPlayer < config.detectionRange) {
          setAiState(AI_STATE.ALERT);
          alertTimer.current = 0;
        }
        break;

      case AI_STATE.PATROL:
        if (patrolPoints.length > 0) {
          const target = new THREE.Vector3(...patrolPoints[currentPatrolIndex.current]);
          const dir = target.clone().sub(enemyPos).normalize();
          body.setLinvel({ x: dir.x * config.speed * 0.5, y: linvel.y, z: dir.z * config.speed * 0.5 }, true);
          
          const moveAngle = Math.atan2(dir.x, dir.z);
          body.setRotation(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, moveAngle, 0)), true);

          if (enemyPos.distanceTo(target) < 1.5) {
            currentPatrolIndex.current = (currentPatrolIndex.current + 1) % patrolPoints.length;
          }
        }
        if (distanceToPlayer < config.detectionRange) {
          setAiState(AI_STATE.ALERT);
          alertTimer.current = 0;
          enterCombat();
        }
        break;

      case AI_STATE.ALERT:
        body.setLinvel({ x: 0, y: linvel.y, z: 0 }, true);
        const alertAngle = Math.atan2(directionToPlayer.x, directionToPlayer.z);
        body.setRotation(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, alertAngle, 0)), true);
        alertTimer.current += delta;
        if (alertTimer.current > 0.8) {
          setAiState(AI_STATE.CHASE);
          enterCombat();
        }
        break;

      case AI_STATE.CHASE:
        body.setLinvel({ x: directionToPlayer.x * config.speed, y: linvel.y, z: directionToPlayer.z * config.speed }, true);
        const chaseAngle = Math.atan2(directionToPlayer.x, directionToPlayer.z);
        body.setRotation(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, chaseAngle, 0)), true);
        if (distanceToPlayer < config.attackRange) setAiState(AI_STATE.ATTACK);
        if (distanceToPlayer > config.detectionRange * 2) {
          setAiState(AI_STATE.PATROL);
          exitCombat();
        }
        break;

      case AI_STATE.ATTACK:
        body.setLinvel({ x: 0, y: linvel.y, z: 0 }, true);
        const attackAngle = Math.atan2(directionToPlayer.x, directionToPlayer.z);
        body.setRotation(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, attackAngle, 0)), true);

        const now = Date.now();
        if (now - lastAttackTime.current > config.attackCooldown) {
          setIsAttacking(true);
          lastAttackTime.current = now;
          if (distanceToPlayer < config.attackRange && !player.isDodging) {
            updatePlayerHealth(-config.damage);
            if (player.health - config.damage <= 0) {
              useGameStore.getState().setGameState('dead');
            }
          }
          setTimeout(() => setIsAttacking(false), 400);
        }
        if (distanceToPlayer > config.attackRange * 1.5) setAiState(AI_STATE.CHASE);
        break;

      case AI_STATE.RETREAT:
        const retreatDir = enemyPos.clone().sub(playerPos).normalize();
        body.setLinvel({ x: retreatDir.x * config.speed * 1.5, y: linvel.y, z: retreatDir.z * config.speed * 1.5 }, true);
        if (distanceToPlayer > config.detectionRange * 1.5) {
          setAiState(AI_STATE.PATROL);
          setHealth(Math.min(health + 20, config.health));
        }
        break;

      default: break;
    }
  });

  if (aiState === AI_STATE.DEAD) return null;

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={initialPosition}
      enabledRotations={[false, true, false]}
      mass={2}
      linearDamping={0.8}
      colliders={false}
      userData={{ type: 'enemy', id, takeDamage, faction: config.faction }}
    >
      <CapsuleCollider args={[0.35 * config.scale, 0.25 * config.scale]} position={[0, 0.6 * config.scale, 0]} />
      <EnemyModel config={config} isAttacking={isAttacking} health={health} maxHealth={config.health} />
    </RigidBody>
  );
};

export { ENEMY_CONFIGS };
export default Enemy;

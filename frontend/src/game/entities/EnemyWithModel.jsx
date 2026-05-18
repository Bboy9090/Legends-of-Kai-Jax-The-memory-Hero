import React, { useRef, useState, useEffect, Suspense, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { useGameStore } from '../stores/gameStore';
import { ClonedModel, MODELS } from '../utils/ModelLoader';

// Enemy configurations
const ENEMY_CONFIGS = {
  fangGrunt: {
    name: 'Fang Grunt',
    health: 60, damage: 10, speed: 4, scale: 0.7,
    color: '#8B4513', faction: 'fangSyndicate',
    detectionRange: 12, attackRange: 2.5, attackCooldown: 1200,
    model: MODELS.blazingFox,
    tint: '#8B4513',
  },
  fangEnforcer: {
    name: 'Fang Enforcer',
    health: 150, damage: 25, speed: 3.5, scale: 1.1,
    color: '#654321', faction: 'fangSyndicate',
    detectionRange: 15, attackRange: 3, attackCooldown: 1500,
    model: MODELS.blazingFox,
    tint: '#FF6B00',
  },
  covenantCultist: {
    name: 'Covenant Cultist',
    health: 45, damage: 15, speed: 5, scale: 0.65,
    color: '#4A0E4E', faction: 'covenant',
    detectionRange: 14, attackRange: 2, attackCooldown: 1000,
    model: MODELS.stylized,
    tint: '#4A0E4E',
  },
  covenantChampion: {
    name: 'Covenant Champion',
    health: 200, damage: 35, speed: 4, scale: 1.2,
    color: '#2D0A2E', faction: 'covenant',
    detectionRange: 18, attackRange: 3.5, attackCooldown: 1800,
    model: MODELS.stylized,
    tint: '#BF5AF2',
  },
};

const AI_STATE = {
  IDLE: 'idle', PATROL: 'patrol', ALERT: 'alert',
  CHASE: 'chase', ATTACK: 'attack', FLANK: 'flank',
  RETREAT: 'retreat', DEAD: 'dead',
};

// Enemy 3D Model rendering
const EnemyModel = ({ config, isAttacking, health, maxHealth }) => {
  const groupRef = useRef();
  const healthPercent = health / maxHealth;

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.03;
    const targetZ = isAttacking ? 0.2 : 0;
    const targetX = isAttacking ? 0.2 : 0;
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.2);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetX, 0.2);
  });

  return (
    <group ref={groupRef} scale={[config.scale, config.scale, config.scale]} rotation={[0, Math.PI, 0]}>
      <ClonedModel url={config.model} />
      {/* Health bar */}
      <group position={[0, 2.4 / config.scale, 0]}>
        <mesh>
          <boxGeometry args={[1.2, 0.12, 0.05]} />
          <meshBasicMaterial color="#222222" />
        </mesh>
        <mesh position={[(healthPercent - 1) * 0.55, 0, 0.03]}>
          <boxGeometry args={[1.1 * healthPercent, 0.08, 0.05]} />
          <meshBasicMaterial
            color={healthPercent > 0.5 ? '#30D158' : healthPercent > 0.25 ? '#FFD60A' : '#FF3B30'}
          />
        </mesh>
      </group>
      {/* Faction tint light */}
      <pointLight
        position={[0, 1, 0]}
        color={isAttacking ? '#FF0000' : config.tint}
        intensity={isAttacking ? 2 : 0.6}
        distance={3}
      />
    </group>
  );
};

const EnemyFallback = ({ config }) => (
  <mesh>
    <capsuleGeometry args={[0.3 * config.scale, 0.8 * config.scale, 4, 8]} />
    <meshStandardMaterial color={config.color} wireframe />
  </mesh>
);

export const EnemyWithModel = ({
  id, type = 'fangGrunt', initialPosition = [0, 1, 0], patrolPoints = [],
}) => {
  const rigidBodyRef = useRef();
  const config = ENEMY_CONFIGS[type];

  const [health, setHealth] = useState(config.health);
  const [aiState, setAiState] = useState(patrolPoints.length > 0 ? AI_STATE.PATROL : AI_STATE.IDLE);
  const [isAttacking, setIsAttacking] = useState(false);

  const { player, enterCombat, exitCombat, updateFactionAwareness, removeEnemy, updatePlayerHealth } = useGameStore();

  const currentPatrolIndex = useRef(0);
  const lastAttackTime = useRef(0);
  const alertTimer = useRef(0);
  const flankDirection = useRef(Math.random() > 0.5 ? 1 : -1);

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

      case AI_STATE.ALERT: {
        body.setLinvel({ x: 0, y: linvel.y, z: 0 }, true);
        const alertAngle = Math.atan2(directionToPlayer.x, directionToPlayer.z);
        body.setRotation(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, alertAngle, 0)), true);
        alertTimer.current += delta;
        if (alertTimer.current > 0.8) {
          if (Math.random() > 0.7 && config.faction === 'fangSyndicate') {
            setAiState(AI_STATE.FLANK);
          } else {
            setAiState(AI_STATE.CHASE);
          }
          enterCombat();
        }
        break;
      }

      case AI_STATE.CHASE: {
        body.setLinvel({
          x: directionToPlayer.x * config.speed, y: linvel.y, z: directionToPlayer.z * config.speed,
        }, true);
        const chaseAngle = Math.atan2(directionToPlayer.x, directionToPlayer.z);
        body.setRotation(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, chaseAngle, 0)), true);
        if (distanceToPlayer < config.attackRange) setAiState(AI_STATE.ATTACK);
        if (distanceToPlayer > config.detectionRange * 2) {
          setAiState(AI_STATE.PATROL);
          exitCombat();
        }
        break;
      }

      case AI_STATE.FLANK: {
        const perpendicular = new THREE.Vector3(-directionToPlayer.z, 0, directionToPlayer.x).multiplyScalar(flankDirection.current);
        const flankTarget = playerPos.clone().add(perpendicular.multiplyScalar(5));
        const flankDir = flankTarget.clone().sub(enemyPos).normalize();
        body.setLinvel({
          x: flankDir.x * config.speed * 1.2, y: linvel.y, z: flankDir.z * config.speed * 1.2,
        }, true);
        if (distanceToPlayer < config.attackRange * 1.5) setAiState(AI_STATE.CHASE);
        break;
      }

      case AI_STATE.ATTACK: {
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
      }

      case AI_STATE.RETREAT: {
        const retreatDir = enemyPos.clone().sub(playerPos).normalize();
        body.setLinvel({
          x: retreatDir.x * config.speed * 1.5, y: linvel.y, z: retreatDir.z * config.speed * 1.5,
        }, true);
        if (distanceToPlayer > config.detectionRange * 1.5) {
          setAiState(AI_STATE.PATROL);
          setHealth(Math.min(health + 20, config.health));
        }
        break;
      }

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
      onCollisionEnter={(e) => {
        if (e.other.rigidBodyObject?.userData?.type === 'playerAttack') {
          takeDamage(30);
        }
      }}
    >
      <CapsuleCollider
        args={[0.4 * config.scale, 0.3 * config.scale]}
        position={[0, 0.8 * config.scale, 0]}
      />
      <Suspense fallback={<EnemyFallback config={config} />}>
        <EnemyModel
          config={config}
          isAttacking={isAttacking}
          health={health}
          maxHealth={config.health}
        />
      </Suspense>
    </RigidBody>
  );
};

export { ENEMY_CONFIGS };
export default EnemyWithModel;

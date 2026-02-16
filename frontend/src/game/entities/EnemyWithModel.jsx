import React, { useRef, useState, useEffect, Suspense, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';
import { useGameStore } from '../stores/gameStore';

// Enemy Model URL
const ENEMY_MODEL_URL = 'https://customer-assets.emergentagent.com/job_legends-codex/artifacts/8g7zog27_Meshy_AI_Stylized_semi_realist_0216021407_texture.glb';

// Preload
useGLTF.preload(ENEMY_MODEL_URL);

// Enemy Types Configuration
const ENEMY_CONFIGS = {
  fangGrunt: {
    name: 'Fang Grunt',
    health: 60,
    damage: 10,
    speed: 4,
    scale: 0.6,
    color: '#8B4513',
    faction: 'fangSyndicate',
    detectionRange: 12,
    attackRange: 2.5,
    attackCooldown: 1200,
  },
  fangEnforcer: {
    name: 'Fang Enforcer',
    health: 150,
    damage: 25,
    speed: 3.5,
    scale: 0.9,
    color: '#654321',
    faction: 'fangSyndicate',
    detectionRange: 15,
    attackRange: 3,
    attackCooldown: 1500,
  },
  covenantCultist: {
    name: 'Covenant Cultist',
    health: 45,
    damage: 15,
    speed: 5,
    scale: 0.55,
    color: '#4A0E4E',
    faction: 'covenant',
    detectionRange: 14,
    attackRange: 2,
    attackCooldown: 1000,
  },
  covenantChampion: {
    name: 'Covenant Champion',
    health: 200,
    damage: 35,
    speed: 4,
    scale: 1.0,
    color: '#2D0A2E',
    faction: 'covenant',
    detectionRange: 18,
    attackRange: 3.5,
    attackCooldown: 1800,
  },
};

// AI States
const AI_STATE = {
  IDLE: 'idle',
  PATROL: 'patrol',
  ALERT: 'alert',
  CHASE: 'chase',
  ATTACK: 'attack',
  RETREAT: 'retreat',
  FLANK: 'flank',
  DEAD: 'dead',
};

// Enemy 3D Model
const EnemyModel = ({ config, isAttacking, health, maxHealth }) => {
  const groupRef = useRef();
  const { scene } = useGLTF(ENEMY_MODEL_URL);
  const healthPercent = health / maxHealth;

  useFrame((state) => {
    if (groupRef.current) {
      // Idle bob
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.03;
      
      // Attack lunge
      if (isAttacking) {
        groupRef.current.position.z = 0.2;
        groupRef.current.rotation.x = 0.2;
      } else {
        groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, 0, 0.1);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, 0.1);
      }
    }
  });

  return (
    <group ref={groupRef} scale={[config.scale, config.scale, config.scale]} rotation={[0, Math.PI, 0]}>
      <Clone object={scene} castShadow receiveShadow />
      
      {/* Health bar */}
      <group position={[0, 2.5 / config.scale, 0]}>
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
      
      {/* Aggro indicator */}
      <pointLight 
        position={[0, 1, 0]} 
        color={isAttacking ? '#FF0000' : '#FF6600'} 
        intensity={isAttacking ? 2 : 0.5} 
        distance={3} 
      />
    </group>
  );
};

// Fallback while loading
const EnemyFallback = ({ config }) => (
  <mesh>
    <capsuleGeometry args={[0.3 * config.scale, 0.8 * config.scale, 4, 8]} />
    <meshStandardMaterial color={config.color} wireframe />
  </mesh>
);

// Main Enemy Component with AI
export const EnemyWithModel = ({ 
  id, 
  type = 'fangGrunt', 
  initialPosition = [0, 1, 0], 
  patrolPoints = [] 
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

  // Take damage function
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
    
    // Faction awareness increase
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

    // State machine
    switch (aiState) {
      case AI_STATE.IDLE:
        // Just stand and look around
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
          
          body.setLinvel({
            x: dir.x * config.speed * 0.5,
            y: linvel.y,
            z: dir.z * config.speed * 0.5,
          }, true);

          // Face movement direction
          const moveAngle = Math.atan2(dir.x, dir.z);
          body.setRotation(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, moveAngle, 0)), true);

          // Check if reached patrol point
          if (enemyPos.distanceTo(target) < 1.5) {
            currentPatrolIndex.current = (currentPatrolIndex.current + 1) % patrolPoints.length;
          }
        }

        // Player detection
        if (distanceToPlayer < config.detectionRange) {
          setAiState(AI_STATE.ALERT);
          alertTimer.current = 0;
          enterCombat();
        }
        break;

      case AI_STATE.ALERT:
        // Stop and look at player
        body.setLinvel({ x: 0, y: linvel.y, z: 0 }, true);
        
        const alertAngle = Math.atan2(directionToPlayer.x, directionToPlayer.z);
        body.setRotation(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, alertAngle, 0)), true);
        
        alertTimer.current += delta;
        
        if (alertTimer.current > 0.8) {
          // Faction reaction - sometimes flank instead of direct chase
          if (Math.random() > 0.7 && config.faction === 'fangSyndicate') {
            setAiState(AI_STATE.FLANK);
          } else {
            setAiState(AI_STATE.CHASE);
          }
          enterCombat();
        }
        break;

      case AI_STATE.CHASE:
        // Move towards player
        body.setLinvel({
          x: directionToPlayer.x * config.speed,
          y: linvel.y,
          z: directionToPlayer.z * config.speed,
        }, true);

        // Face player
        const chaseAngle = Math.atan2(directionToPlayer.x, directionToPlayer.z);
        body.setRotation(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, chaseAngle, 0)), true);

        // Attack if close
        if (distanceToPlayer < config.attackRange) {
          setAiState(AI_STATE.ATTACK);
        }

        // Lose interest if too far
        if (distanceToPlayer > config.detectionRange * 2) {
          setAiState(AI_STATE.PATROL);
          exitCombat();
        }
        break;

      case AI_STATE.FLANK:
        // Move to the side of player
        const perpendicular = new THREE.Vector3(-directionToPlayer.z, 0, directionToPlayer.x).multiplyScalar(flankDirection.current);
        const flankTarget = playerPos.clone().add(perpendicular.multiplyScalar(5));
        const flankDir = flankTarget.clone().sub(enemyPos).normalize();
        
        body.setLinvel({
          x: flankDir.x * config.speed * 1.2,
          y: linvel.y,
          z: flankDir.z * config.speed * 1.2,
        }, true);

        // Switch to chase after flanking
        if (distanceToPlayer < config.attackRange * 1.5) {
          setAiState(AI_STATE.CHASE);
        }
        break;

      case AI_STATE.ATTACK:
        // Stop during attack
        body.setLinvel({ x: 0, y: linvel.y, z: 0 }, true);
        
        // Face player
        const attackAngle = Math.atan2(directionToPlayer.x, directionToPlayer.z);
        body.setRotation(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, attackAngle, 0)), true);

        const now = Date.now();
        if (now - lastAttackTime.current > config.attackCooldown) {
          setIsAttacking(true);
          lastAttackTime.current = now;
          
          // Deal damage if player is close
          if (distanceToPlayer < config.attackRange) {
            // Check if player is dodging (invincibility frames)
            if (!player.isDodging) {
              updatePlayerHealth(-config.damage);
              
              // Check player death
              if (player.health - config.damage <= 0) {
                useGameStore.getState().setGameState('dead');
              }
            }
          }

          setTimeout(() => setIsAttacking(false), 400);
        }

        // Return to chase if player moves away
        if (distanceToPlayer > config.attackRange * 1.5) {
          setAiState(AI_STATE.CHASE);
        }
        break;

      case AI_STATE.RETREAT:
        // Move away from player
        const retreatDir = enemyPos.clone().sub(playerPos).normalize();
        body.setLinvel({
          x: retreatDir.x * config.speed * 1.5,
          y: linvel.y,
          z: retreatDir.z * config.speed * 1.5,
        }, true);

        // Return to patrol if far enough
        if (distanceToPlayer > config.detectionRange * 1.5) {
          setAiState(AI_STATE.PATROL);
          setHealth(Math.min(health + 20, config.health)); // Slight heal on retreat
        }
        break;

      default:
        break;
    }
  });

  if (aiState === AI_STATE.DEAD) {
    return null;
  }

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
        // Handle player attacks
        if (e.other.rigidBodyObject?.userData?.type === 'playerAttack') {
          takeDamage(30);
        }
      }}
    >
      <CapsuleCollider args={[0.4 * config.scale, 0.3 * config.scale]} position={[0, 0.8 * config.scale, 0]} />
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

import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { useGameStore } from '../stores/gameStore';

// Enemy Types for Phase 2
const ENEMY_TYPES = {
  fangGrunt: {
    name: 'Fang Grunt',
    health: 50,
    damage: 10,
    speed: 4,
    color: '#8B4513',
    size: 0.8,
    faction: 'fangSyndicate',
  },
  fangEnforcer: {
    name: 'Fang Enforcer',
    health: 100,
    damage: 20,
    speed: 3,
    color: '#654321',
    size: 1.2,
    faction: 'fangSyndicate',
  },
  covenantCultist: {
    name: 'Covenant Cultist',
    health: 40,
    damage: 15,
    speed: 5,
    color: '#4A0E4E',
    size: 0.7,
    faction: 'covenant',
  },
  covenantChampion: {
    name: 'Covenant Champion',
    health: 150,
    damage: 25,
    speed: 4,
    color: '#2D0A2E',
    size: 1.4,
    faction: 'covenant',
  },
};

// Low-poly enemy model
const EnemyModel = ({ type, isAttacking, health, maxHealth }) => {
  const meshRef = useRef();
  const config = ENEMY_TYPES[type];
  const healthPercent = health / maxHealth;

  useFrame((state) => {
    if (meshRef.current) {
      // Idle animation - slight bob
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.05;
      
      // Attack animation
      if (isAttacking) {
        meshRef.current.scale.z = 1.2;
      } else {
        meshRef.current.scale.z = 1;
      }
    }
  });

  const isFang = config.faction === 'fangSyndicate';
  
  return (
    <group ref={meshRef}>
      {/* Body */}
      <mesh castShadow>
        <boxGeometry args={[config.size * 0.6, config.size, config.size * 0.4]} />
        <meshStandardMaterial 
          color={config.color}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Head */}
      <mesh position={[0, config.size * 0.6, 0]} castShadow>
        {isFang ? (
          <dodecahedronGeometry args={[config.size * 0.3, 0]} />
        ) : (
          <octahedronGeometry args={[config.size * 0.3, 0]} />
        )}
        <meshStandardMaterial 
          color={config.color}
          roughness={0.7}
        />
      </mesh>

      {/* Eyes - Red glow */}
      <mesh position={[0.1 * config.size, config.size * 0.65, 0.2 * config.size]}>
        <sphereGeometry args={[0.04 * config.size, 6, 6]} />
        <meshStandardMaterial 
          color="#FF0000" 
          emissive="#FF0000"
          emissiveIntensity={1.5}
        />
      </mesh>
      <mesh position={[-0.1 * config.size, config.size * 0.65, 0.2 * config.size]}>
        <sphereGeometry args={[0.04 * config.size, 6, 6]} />
        <meshStandardMaterial 
          color="#FF0000" 
          emissive="#FF0000"
          emissiveIntensity={1.5}
        />
      </mesh>

      {/* Faction-specific features */}
      {isFang && (
        // Fang Syndicate - Spikes
        <>
          <mesh position={[0.3 * config.size, config.size * 0.3, 0]} rotation={[0, 0, 0.5]}>
            <coneGeometry args={[0.08 * config.size, 0.2 * config.size, 4]} />
            <meshStandardMaterial color="#333333" metalness={0.8} />
          </mesh>
          <mesh position={[-0.3 * config.size, config.size * 0.3, 0]} rotation={[0, 0, -0.5]}>
            <coneGeometry args={[0.08 * config.size, 0.2 * config.size, 4]} />
            <meshStandardMaterial color="#333333" metalness={0.8} />
          </mesh>
        </>
      )}

      {!isFang && (
        // Covenant - Robes/cloth
        <mesh position={[0, config.size * 0.2, 0]}>
          <cylinderGeometry args={[config.size * 0.35, config.size * 0.45, config.size * 0.6, 6]} />
          <meshStandardMaterial 
            color="#1a0a1a"
            roughness={0.9}
            transparent
            opacity={0.8}
          />
        </mesh>
      )}

      {/* Health bar */}
      <group position={[0, config.size + 0.3, 0]}>
        <mesh>
          <boxGeometry args={[0.8, 0.08, 0.02]} />
          <meshBasicMaterial color="#333333" />
        </mesh>
        <mesh position={[(healthPercent - 1) * 0.4, 0, 0.01]}>
          <boxGeometry args={[0.78 * healthPercent, 0.06, 0.02]} />
          <meshBasicMaterial color={healthPercent > 0.5 ? '#30D158' : healthPercent > 0.25 ? '#FFD60A' : '#FF3B30'} />
        </mesh>
      </group>
    </group>
  );
};

// Enemy AI States
const AI_STATE = {
  IDLE: 'idle',
  PATROL: 'patrol',
  CHASE: 'chase',
  ATTACK: 'attack',
  RETREAT: 'retreat',
  FLANK: 'flank',
};

// Main Enemy Component
export const Enemy = ({ id, type = 'fangGrunt', initialPosition = [0, 1, 0], patrolPoints = [] }) => {
  const rigidBodyRef = useRef();
  const config = ENEMY_TYPES[type];
  
  const [health, setHealth] = useState(config.health);
  const [aiState, setAiState] = useState(AI_STATE.PATROL);
  const [isAttacking, setIsAttacking] = useState(false);
  const [isDead, setIsDead] = useState(false);
  
  const { player, enterCombat, updateFactionAwareness, removeEnemy } = useGameStore();
  
  const targetPosition = useRef(new THREE.Vector3());
  const currentPatrolIndex = useRef(0);
  const lastAttackTime = useRef(0);
  const detectionRange = 10;
  const attackRange = 2;
  const attackCooldown = 1500;

  // AI Logic
  useFrame((state, delta) => {
    if (!rigidBodyRef.current || isDead) return;

    const body = rigidBodyRef.current;
    const pos = body.translation();
    const playerPos = new THREE.Vector3(...player.position);
    const enemyPos = new THREE.Vector3(pos.x, pos.y, pos.z);
    const distanceToPlayer = enemyPos.distanceTo(playerPos);

    // State machine
    switch (aiState) {
      case AI_STATE.IDLE:
        // Check for player detection
        if (distanceToPlayer < detectionRange) {
          setAiState(AI_STATE.CHASE);
          enterCombat();
          updateFactionAwareness(config.faction, 10);
        }
        break;

      case AI_STATE.PATROL:
        // Move between patrol points
        if (patrolPoints.length > 0) {
          const targetPoint = patrolPoints[currentPatrolIndex.current];
          targetPosition.current.set(...targetPoint);
          
          const direction = targetPosition.current.clone().sub(enemyPos).normalize();
          body.setLinvel({
            x: direction.x * config.speed * 0.5,
            y: body.linvel().y,
            z: direction.z * config.speed * 0.5,
          }, true);

          // Check if reached patrol point
          if (enemyPos.distanceTo(targetPosition.current) < 1) {
            currentPatrolIndex.current = (currentPatrolIndex.current + 1) % patrolPoints.length;
          }
        }

        // Check for player detection
        if (distanceToPlayer < detectionRange) {
          setAiState(AI_STATE.CHASE);
          enterCombat();
          updateFactionAwareness(config.faction, 10);
        }
        break;

      case AI_STATE.CHASE:
        // Move towards player
        const chaseDir = playerPos.clone().sub(enemyPos).normalize();
        body.setLinvel({
          x: chaseDir.x * config.speed,
          y: body.linvel().y,
          z: chaseDir.z * config.speed,
        }, true);

        // Face player
        const angle = Math.atan2(chaseDir.x, chaseDir.z);
        body.setRotation({ x: 0, y: Math.sin(angle / 2), z: 0, w: Math.cos(angle / 2) }, true);

        // Transition to attack if close enough
        if (distanceToPlayer < attackRange) {
          setAiState(AI_STATE.ATTACK);
        }

        // Lose interest if too far
        if (distanceToPlayer > detectionRange * 1.5) {
          setAiState(AI_STATE.PATROL);
        }
        break;

      case AI_STATE.ATTACK:
        // Stop moving during attack
        body.setLinvel({ x: 0, y: body.linvel().y, z: 0 }, true);

        const now = Date.now();
        if (now - lastAttackTime.current > attackCooldown) {
          setIsAttacking(true);
          lastAttackTime.current = now;
          
          // Deal damage to player if in range
          if (distanceToPlayer < attackRange) {
            // This would trigger player damage
            console.log(`${config.name} attacks for ${config.damage} damage!`);
          }

          setTimeout(() => setIsAttacking(false), 300);
        }

        // Return to chase if player moves away
        if (distanceToPlayer > attackRange * 1.5) {
          setAiState(AI_STATE.CHASE);
        }
        break;

      case AI_STATE.RETREAT:
        // Move away from player
        const retreatDir = enemyPos.clone().sub(playerPos).normalize();
        body.setLinvel({
          x: retreatDir.x * config.speed,
          y: body.linvel().y,
          z: retreatDir.z * config.speed,
        }, true);

        // Return to patrol after retreating
        if (distanceToPlayer > detectionRange) {
          setAiState(AI_STATE.PATROL);
        }
        break;

      default:
        break;
    }
  });

  // Handle taking damage
  const takeDamage = (amount) => {
    const newHealth = health - amount;
    setHealth(Math.max(0, newHealth));
    
    if (newHealth <= 0) {
      setIsDead(true);
      removeEnemy(id);
    } else if (newHealth < config.health * 0.25) {
      // Low health - might retreat
      if (Math.random() > 0.7) {
        setAiState(AI_STATE.RETREAT);
      }
    }
  };

  if (isDead) return null;

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={initialPosition}
      enabledRotations={[false, true, false]}
      mass={2}
      linearDamping={0.8}
      colliders={false}
      userData={{ type: 'enemy', id, takeDamage }}
    >
      <CapsuleCollider args={[config.size * 0.4, config.size * 0.3]} position={[0, config.size * 0.5, 0]} />
      <EnemyModel 
        type={type} 
        isAttacking={isAttacking}
        health={health}
        maxHealth={config.health}
      />
    </RigidBody>
  );
};

// Boss Enemy - Fang Enforcer (Phase 2 Boss)
export const BossEnemy = ({ position = [0, 1, 0] }) => {
  const [phase, setPhase] = useState(1);
  const [health, setHealth] = useState(300);
  const maxHealth = 300;

  // Boss phases based on health
  useEffect(() => {
    if (health < maxHealth * 0.66 && phase === 1) {
      setPhase(2);
      console.log('Boss enters Phase 2 - Increased aggression!');
    } else if (health < maxHealth * 0.33 && phase === 2) {
      setPhase(3);
      console.log('Boss enters Phase 3 - Desperate attacks!');
    }
  }, [health, phase]);

  return (
    <Enemy
      id="boss-fang-enforcer"
      type="fangEnforcer"
      initialPosition={position}
      patrolPoints={[]}
    />
  );
};

export default Enemy;

import React from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { KeyboardControls, useKeyboardControls, useGLTF, Html, Sparkles, useTexture } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useFluidCombat, COMBO_MOVES, COMBO_CHAINS, AttackType } from '../../lib/stores/useFluidCombat';

interface AdventureArenaProps {
  characterId: string;
  onBack: () => void;
  onMissionComplete?: () => void;
}

const ATTACK_RANGE = 4.0;
const WORLD_SIZE = 100;
const HALF_WORLD = WORLD_SIZE / 2;
const ENEMY_IDS = ['frost_wolf', 'shadow_panther', 'thunder_lion', 'jade_serpent', 'earth_turtle', 'phoenix_warrior', 'boryx_zenith_beast', 'voidonus_beast'];

const CREATURE_MODEL_MAP: Record<string, string> = {
  'kai-jax': 'kai_jax_beast',
  'kaijax': 'kai_jax_beast',
  'kai_jax': 'kai_jax_beast',
  'kaison': 'kaison_beast',
  'jaxon': 'jaxon_beast',
  'boryx': 'boryx_zenith_beast',
  'boryx-zenith': 'boryx_zenith_beast',
  'lunara': 'lunara_solis_beast',
  'lunara-solis': 'lunara_solis_beast',
  'phoenix': 'phoenix_warrior',
  'voidonus': 'voidonus_beast',
  'frost': 'frost_wolf',
  'thunder': 'thunder_lion',
  'jade': 'jade_serpent',
  'shadow': 'shadow_panther',
  'earth': 'earth_turtle',
  'boryn': 'BORYN',
  'darkshadow': 'darjshadowkaijax',
  'borax': 'Borax',
  'sabervillain': 'SABERVILLAIN',
  'kaiteenfox': 'KAITEENFOX',
  'kainjaxyn': 'KAINJAXYN',
  'kaijax1': 'KAIJAX1',
};

function resolveModelId(id: string): string {
  return CREATURE_MODEL_MAP[id] || id;
}

const CHARACTER_SCALE: Record<string, number> = {
  'KAITEENFOX': 1.8,
  'kaison_beast': 1.8,
  'jaxon_beast': 1.8,
  'KAIJAX1': 2.5,
  'KAINJAXYN': 2.5,
  'darjshadowkaijax': 2.2,
  'kai_jax_beast': 2.5,
  'boryx_zenith_beast': 3.5,
  'BORYN': 3.2,
  'Borax': 3.2,
  'lunara_solis_beast': 3.0,
  'SABERVILLAIN': 3.0,
  'phoenix_warrior': 2.8,
  'frost_wolf': 2.6,
  'thunder_lion': 3.0,
  'jade_serpent': 2.6,
  'shadow_panther': 2.5,
  'earth_turtle': 3.2,
  'voidonus_beast': 4.0,
};

function getCharacterScale(modelId: string): number {
  const resolved = resolveModelId(modelId);
  return CHARACTER_SCALE[resolved] || 2.5;
}

const RESPAWN_TIME = 10;
const CHASE_RANGE = 15;
const ENEMY_ATTACK_RANGE = 3.5;
const ENEMY_ATTACK_COOLDOWN = 2.0;

enum Controls {
  forward = 'forward',
  back = 'back',
  left = 'left',
  right = 'right',
  jump = 'jump',
  lightAttack = 'lightAttack',
  heavyAttack = 'heavyAttack',
  launcher = 'launcher',
  special = 'special',
  ultimate = 'ultimate',
  dodge = 'dodge',
  run = 'run',
}

const keyMap = [
  { name: Controls.forward, keys: ['ArrowUp', 'KeyW'] },
  { name: Controls.back, keys: ['ArrowDown', 'KeyS'] },
  { name: Controls.left, keys: ['ArrowLeft', 'KeyA'] },
  { name: Controls.right, keys: ['ArrowRight', 'KeyD'] },
  { name: Controls.jump, keys: ['Space'] },
  { name: Controls.lightAttack, keys: ['KeyJ', 'KeyZ'] },
  { name: Controls.heavyAttack, keys: ['KeyK', 'KeyX'] },
  { name: Controls.launcher, keys: ['KeyL', 'KeyC'] },
  { name: Controls.special, keys: ['KeyI', 'KeyV'] },
  { name: Controls.ultimate, keys: ['KeyO', 'KeyB'] },
  { name: Controls.dodge, keys: ['ShiftLeft', 'ShiftRight'] },
  { name: Controls.run, keys: ['ControlLeft', 'ControlRight'] },
];

interface EnemyState {
  id: string;
  modelId: string;
  hp: number;
  maxHp: number;
  position: THREE.Vector3;
  rotation: number;
  velocity: THREE.Vector3;
  state: 'patrol' | 'chase' | 'attack' | 'dead';
  patrolTarget: THREE.Vector3;
  attackCooldown: number;
  respawnTimer: number;
  spawnPosition: THREE.Vector3;
}

interface DamageNumber {
  id: number;
  value: number;
  position: THREE.Vector3;
  time: number;
  isCombo: boolean;
}

function seededRandom(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

class ModelErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

function GLBModel({ modelId, scale = 2.5 }: { modelId: string; scale?: number }) {
  const resolved = resolveModelId(modelId);
  const modelPath = `/models/${resolved}.glb`;
  const { scene } = useGLTF(modelPath);
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return clone;
  }, [scene]);
  return <primitive object={clonedScene} scale={scale} />;
}

function FallbackModel({ color = '#ff4444' }: { color?: string }) {
  return (
    <group>
      <mesh position={[0, 0.8, 0]} castShadow>
        <boxGeometry args={[0.8, 1.2, 0.6]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 1.6, 0]} castShadow>
        <sphereGeometry args={[0.3, 12, 12]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

function SafeGLBModel({ modelId, scale, fallbackColor = '#ff4444' }: { modelId: string; scale?: number; fallbackColor?: string }) {
  const finalScale = scale || getCharacterScale(modelId);
  return (
    <ModelErrorBoundary fallback={<FallbackModel color={fallbackColor} />}>
      <Suspense fallback={<FallbackModel color={fallbackColor} />}>
        <GLBModel modelId={modelId} scale={finalScale} />
      </Suspense>
    </ModelErrorBoundary>
  );
}

function FollowCamera({ target }: { target: React.RefObject<THREE.Vector3> }) {
  const { camera } = useThree();
  const offsetRef = useRef(new THREE.Vector3(0, 12, 18));
  const lookAtRef = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    if (!target.current) return;
    const desiredPos = new THREE.Vector3().copy(target.current).add(offsetRef.current);
    camera.position.lerp(desiredPos, 1 - Math.pow(0.01, delta));
    lookAtRef.current.lerp(target.current, 1 - Math.pow(0.05, delta));
    camera.lookAt(lookAtRef.current);
  });

  return null;
}

function GrassPlane() {
  const grassTexture = useTexture('/textures/grass.png');
  grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
  grassTexture.repeat.set(20, 20);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[WORLD_SIZE, WORLD_SIZE, 32, 32]} />
      <meshStandardMaterial color="#2d5a27" map={grassTexture} roughness={0.9} metalness={0.05} />
    </mesh>
  );
}

function WorldTerrain() {

  const rocks = useMemo(() => {
    const items: { pos: [number, number, number]; scale: [number, number, number]; rot: number }[] = [];
    for (let i = 0; i < 40; i++) {
      const x = seededRandom(i * 3.1) * WORLD_SIZE - HALF_WORLD;
      const z = seededRandom(i * 7.3) * WORLD_SIZE - HALF_WORLD;
      const s = 0.5 + seededRandom(i * 11.7) * 2.5;
      items.push({ pos: [x, s * 0.4, z], scale: [s, s * 0.8, s], rot: seededRandom(i * 13.3) * Math.PI * 2 });
    }
    return items;
  }, []);

  const trees = useMemo(() => {
    const items: { pos: [number, number, number]; height: number; radius: number }[] = [];
    for (let i = 0; i < 30; i++) {
      const x = seededRandom(i * 5.7 + 100) * WORLD_SIZE - HALF_WORLD;
      const z = seededRandom(i * 9.1 + 100) * WORLD_SIZE - HALF_WORLD;
      const h = 3 + seededRandom(i * 17.3 + 100) * 5;
      items.push({ pos: [x, 0, z], height: h, radius: 1 + seededRandom(i * 23.1 + 100) * 2 });
    }
    return items;
  }, []);

  const crystals = useMemo(() => {
    const items: { pos: [number, number, number]; color: string; height: number }[] = [];
    const colors: string[] = ['#00ffff', '#ff00ff', '#00ff88', '#ffaa00', '#ff4488'];
    for (let i = 0; i < 15; i++) {
      const x = seededRandom(i * 4.3 + 200) * 80 - 40;
      const z = seededRandom(i * 8.7 + 200) * 80 - 40;
      const h = 1 + seededRandom(i * 14.1 + 200) * 3;
      items.push({ pos: [x, h * 0.5, z] as [number, number, number], color: colors[i % colors.length]!, height: h });
    }
    return items;
  }, []);

  const ruins = useMemo(() => {
    const items: { pos: [number, number, number]; width: number; height: number }[] = [];
    for (let i = 0; i < 8; i++) {
      const x = seededRandom(i * 6.1 + 300) * 70 - 35;
      const z = seededRandom(i * 10.3 + 300) * 70 - 35;
      const w = 2 + seededRandom(i * 18.7 + 300) * 3;
      const h = 3 + seededRandom(i * 22.9 + 300) * 5;
      items.push({ pos: [x, h * 0.5, z], width: w, height: h });
    }
    return items;
  }, []);

  return (
    <group>
      <Suspense fallback={
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
          <planeGeometry args={[WORLD_SIZE, WORLD_SIZE]} />
          <meshStandardMaterial color="#2d5a27" roughness={0.9} />
        </mesh>
      }>
        <GrassPlane />
      </Suspense>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[WORLD_SIZE * 3, WORLD_SIZE * 3]} />
        <meshStandardMaterial color="#1a3a14" roughness={1} />
      </mesh>

      {rocks.map((rock, i) => (
        <mesh key={`rock-${i}`} position={rock.pos} scale={rock.scale} rotation={[0, rock.rot, 0]} castShadow receiveShadow>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#5a5a5a" roughness={0.85} metalness={0.1} />
        </mesh>
      ))}

      {trees.map((tree, i) => (
        <group key={`tree-${i}`} position={tree.pos}>
          <mesh position={[0, tree.height * 0.3, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.35, tree.height * 0.6, 6]} />
            <meshStandardMaterial color="#5c3a1e" roughness={0.9} />
          </mesh>
          <mesh position={[0, tree.height * 0.7, 0]} castShadow>
            <coneGeometry args={[tree.radius, tree.height * 0.5, 8]} />
            <meshStandardMaterial color="#1a6b1a" roughness={0.8} />
          </mesh>
          <mesh position={[0, tree.height * 0.55, 0]} castShadow>
            <coneGeometry args={[tree.radius * 1.2, tree.height * 0.35, 8]} />
            <meshStandardMaterial color="#237a23" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {crystals.map((crystal, i) => (
        <group key={`crystal-${i}`} position={crystal.pos}>
          <mesh castShadow>
            <octahedronGeometry args={[crystal.height * 0.3, 0]} />
            <meshStandardMaterial
              color={crystal.color}
              emissive={crystal.color}
              emissiveIntensity={0.8}
              transparent
              opacity={0.85}
              roughness={0.1}
              metalness={0.5}
            />
          </mesh>
          <pointLight color={crystal.color} intensity={2} distance={8} />
        </group>
      ))}

      {ruins.map((ruin, i) => (
        <group key={`ruin-${i}`} position={ruin.pos}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[ruin.width, ruin.height, ruin.width * 0.3]} />
            <meshStandardMaterial color="#8a7a6a" roughness={0.95} metalness={0.05} />
          </mesh>
          <mesh position={[ruin.width * 0.3, -ruin.height * 0.2, 0]} castShadow>
            <boxGeometry args={[ruin.width * 0.4, ruin.height * 0.6, ruin.width * 0.25]} />
            <meshStandardMaterial color="#7a6a5a" roughness={0.95} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Player3D({
  characterId,
  playerPosRef,
  enemiesRef,
  onHitEnemy,
}: {
  characterId: string;
  playerPosRef: React.MutableRefObject<THREE.Vector3>;
  enemiesRef: React.MutableRefObject<EnemyState[]>;
  onHitEnemy: (enemyIndex: number, damage: number, attackType: AttackType) => void;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const bodyRef = useRef<THREE.Group>(null!);
  const [, getKeys] = useKeyboardControls<Controls>();
  const animTimeRef = useRef(0);
  const lastAttackRef = useRef<AttackType | null>(null);
  const lastHitTimeRef = useRef(0);

  const velocityRef = useRef(new THREE.Vector3());
  const positionRef = useRef(new THREE.Vector3(0, 0, 0));
  const rotationRef = useRef(0);
  const groundedRef = useRef(true);
  const dashTimerRef = useRef(0);
  const dashCooldownRef = useRef(0);
  const jumpPressedRef = useRef(false);
  const attackPressedRef = useRef({ light: false, heavy: false, launch: false, special: false, ultimate: false });

  const currentAttackRef = useRef<AttackType | null>(null);
  const attackTimerRef = useRef(0);
  const attackPhaseRef = useRef<'windup' | 'active' | 'recovery' | null>(null);
  const comboCountRef = useRef(0);
  const comboTimerRef = useRef(0);
  const specialMeterRef = useRef(0);
  const ultimateMeterRef = useRef(0);
  const hitEnemiesThisSwingRef = useRef<Set<number>>(new Set());

  const MOVE_SPEED = 8;
  const RUN_SPEED = 14;
  const JUMP_FORCE = 14;
  const GRAVITY = -35;
  const DASH_SPEED = 25;
  const DASH_DURATION = 0.25;
  const DASH_COOLDOWN = 0.5;
  const ACCEL = 25;
  const FRICTION = 0.88;

  const combatStoreUpdate = useFluidCombat.getState;

  useFrame((state, delta) => {
    animTimeRef.current += delta;
    const keys = getKeys();
    const dt = Math.min(delta, 0.05);

    let moveX = 0;
    let moveZ = 0;
    if (keys.left) moveX -= 1;
    if (keys.right) moveX += 1;
    if (keys.forward) moveZ -= 1;
    if (keys.back) moveZ += 1;
    const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
    if (len > 0) { moveX /= len; moveZ /= len; }

    const isRunning = keys.run;
    const speed = isRunning ? RUN_SPEED : MOVE_SPEED;

    if (dashTimerRef.current > 0) {
      dashTimerRef.current -= dt;
    } else {
      const targetVelX = moveX * speed;
      const targetVelZ = moveZ * speed;
      velocityRef.current.x += (targetVelX - velocityRef.current.x) * Math.min(1, ACCEL * dt);
      velocityRef.current.z += (targetVelZ - velocityRef.current.z) * Math.min(1, ACCEL * dt);

      if (len < 0.1) {
        velocityRef.current.x *= FRICTION;
        velocityRef.current.z *= FRICTION;
      }
    }

    if (dashCooldownRef.current > 0) dashCooldownRef.current -= dt;

    if (keys.dodge && dashCooldownRef.current <= 0 && dashTimerRef.current <= 0) {
      dashTimerRef.current = DASH_DURATION;
      dashCooldownRef.current = DASH_COOLDOWN;
      const dashDir = len > 0.1 ? new THREE.Vector3(moveX, 0, moveZ) : new THREE.Vector3(Math.sin(rotationRef.current), 0, Math.cos(rotationRef.current));
      velocityRef.current.x = dashDir.x * DASH_SPEED;
      velocityRef.current.z = dashDir.z * DASH_SPEED;
    }

    if (keys.jump && groundedRef.current && !jumpPressedRef.current) {
      velocityRef.current.y = JUMP_FORCE;
      groundedRef.current = false;
    }
    jumpPressedRef.current = keys.jump;

    if (!groundedRef.current) {
      velocityRef.current.y += GRAVITY * dt;
    }

    positionRef.current.x += velocityRef.current.x * dt;
    positionRef.current.y += velocityRef.current.y * dt;
    positionRef.current.z += velocityRef.current.z * dt;

    if (positionRef.current.y <= 0) {
      positionRef.current.y = 0;
      velocityRef.current.y = 0;
      groundedRef.current = true;
    }

    positionRef.current.x = Math.max(-HALF_WORLD, Math.min(HALF_WORLD, positionRef.current.x));
    positionRef.current.z = Math.max(-HALF_WORLD, Math.min(HALF_WORLD, positionRef.current.z));

    if (Math.abs(moveX) > 0.1 || Math.abs(moveZ) > 0.1) {
      const targetRot = Math.atan2(moveX, moveZ);
      let diff = targetRot - rotationRef.current;
      diff = ((diff + Math.PI) % (Math.PI * 2)) - Math.PI;
      if (diff > Math.PI) diff -= Math.PI * 2;
      if (diff < -Math.PI) diff += Math.PI * 2;
      rotationRef.current += diff * Math.min(1, 12 * dt);
    }

    handleCombatInput(keys, dt);
    updateAttack(dt);

    playerPosRef.current.copy(positionRef.current);

    if (groupRef.current) {
      groupRef.current.position.copy(positionRef.current);
      groupRef.current.position.y += 1.0;
      groupRef.current.rotation.y = rotationRef.current + Math.PI;
    }

    animateBody(dt, state.clock.elapsedTime, len > 0.1, isRunning);
  });

  const handleCombatInput = (keys: any, dt: number) => {
    if (comboTimerRef.current > 0) comboTimerRef.current -= dt;
    if (comboTimerRef.current <= 0 && comboCountRef.current > 0) {
      comboCountRef.current = 0;
      useFluidCombat.setState({ comboCount: 0, comboDamage: 0 });
    }

    const canAttack = !currentAttackRef.current || (attackPhaseRef.current === 'recovery');

    if (keys.lightAttack && !attackPressedRef.current.light && canAttack) {
      const cur = currentAttackRef.current;
      let next: AttackType = 'light1';
      if (cur === 'light1') next = 'light2';
      else if (cur === 'light2') next = 'light3';
      startAttack(next);
    }
    attackPressedRef.current.light = keys.lightAttack;

    if (keys.heavyAttack && !attackPressedRef.current.heavy && canAttack) {
      startAttack('heavy1');
    }
    attackPressedRef.current.heavy = keys.heavyAttack;

    if (keys.launcher && !attackPressedRef.current.launch && canAttack) {
      startAttack('launcher');
    }
    attackPressedRef.current.launch = keys.launcher;

    if (keys.special && !attackPressedRef.current.special && canAttack && specialMeterRef.current >= 50) {
      specialMeterRef.current -= 50;
      startAttack('special');
    }
    attackPressedRef.current.special = keys.special;

    if (keys.ultimate && !attackPressedRef.current.ultimate && canAttack && ultimateMeterRef.current >= 100) {
      ultimateMeterRef.current -= 100;
      startAttack('ultimate');
    }
    attackPressedRef.current.ultimate = keys.ultimate;
  };

  const startAttack = (type: AttackType) => {
    currentAttackRef.current = type;
    attackTimerRef.current = 0;
    attackPhaseRef.current = 'windup';
    hitEnemiesThisSwingRef.current.clear();
    useFluidCombat.setState({ currentAttack: type, attackPhase: 'windup' });
  };

  const updateAttack = (dt: number) => {
    if (!currentAttackRef.current || !attackPhaseRef.current) return;
    const move = COMBO_MOVES[currentAttackRef.current];
    attackTimerRef.current += dt;

    const windupEnd = move.duration * 0.3;
    const activeEnd = move.duration * 0.7;

    if (attackPhaseRef.current === 'windup' && attackTimerRef.current >= windupEnd) {
      attackPhaseRef.current = 'active';
      useFluidCombat.setState({ attackPhase: 'active' });
    }

    if (attackPhaseRef.current === 'active') {
      checkHits();
      if (attackTimerRef.current >= activeEnd) {
        attackPhaseRef.current = 'recovery';
        useFluidCombat.setState({ attackPhase: 'recovery' });
      }
    }

    if (attackTimerRef.current >= move.duration) {
      const finishedAttack = currentAttackRef.current;
      currentAttackRef.current = null;
      attackPhaseRef.current = null;
      attackTimerRef.current = 0;
      useFluidCombat.setState({ currentAttack: null, attackPhase: null });
    }
  };

  const checkHits = () => {
    if (!currentAttackRef.current) return;
    const enemies = enemiesRef.current;
    const playerPos = positionRef.current;
    const move = COMBO_MOVES[currentAttackRef.current];

    for (let i = 0; i < enemies.length; i++) {
      const enemy = enemies[i];
      if (!enemy || enemy.state === 'dead') continue;
      if (hitEnemiesThisSwingRef.current.has(i)) continue;

      const dist = playerPos.distanceTo(enemy.position);
      if (dist <= ATTACK_RANGE) {
        hitEnemiesThisSwingRef.current.add(i);
        comboCountRef.current++;
        comboTimerRef.current = 1.5;
        specialMeterRef.current = Math.min(100, specialMeterRef.current + 5);
        ultimateMeterRef.current = Math.min(100, ultimateMeterRef.current + 3);

        const comboBonus = 1 + comboCountRef.current * 0.05;
        const totalDamage = Math.floor(move.damage * comboBonus);

        useFluidCombat.setState({
          comboCount: comboCountRef.current,
          comboDamage: (useFluidCombat.getState().comboDamage || 0) + totalDamage,
          specialMeter: specialMeterRef.current,
          ultimateMeter: ultimateMeterRef.current,
        });

        onHitEnemy(i, totalDamage, currentAttackRef.current);

        try {
          const s = new Audio('/sounds/hit.mp3');
          s.volume = 0.3;
          s.play().catch(() => {});
        } catch {}
      }
    }
  };

  const animateBody = (dt: number, time: number, isMoving: boolean, isRunning: boolean) => {
    if (!bodyRef.current) return;

    bodyRef.current.rotation.set(0, 0, 0);
    bodyRef.current.position.set(0, 0, 0);
    bodyRef.current.scale.setScalar(1);

    if (dashTimerRef.current > 0) {
      bodyRef.current.rotation.y = time * 25;
      bodyRef.current.position.y = 0.5;
      bodyRef.current.scale.setScalar(0.9);
      return;
    }

    if (currentAttackRef.current && attackPhaseRef.current) {
      const atk = currentAttackRef.current;
      if (attackPhaseRef.current === 'active') {
        if (atk.startsWith('light')) {
          const swingNum = parseInt(atk.replace('light', '')) || 1;
          const dir = swingNum % 2 === 1 ? 1 : -1;
          bodyRef.current.rotation.y = dir * 0.6;
          bodyRef.current.rotation.z = Math.sin(time * 25) * 0.15 * dir;
          bodyRef.current.position.z = 0.5;
          bodyRef.current.position.y = Math.abs(Math.sin(time * 20)) * 0.15;
        } else if (atk.startsWith('heavy')) {
          bodyRef.current.rotation.y = time * 18;
          bodyRef.current.position.z = 0.7;
          bodyRef.current.position.y = 0.2;
          bodyRef.current.scale.setScalar(1.15);
        } else if (atk === 'launcher') {
          bodyRef.current.position.y = 0.8 + Math.sin(time * 15) * 0.2;
          bodyRef.current.rotation.x = -0.4;
          bodyRef.current.rotation.z = Math.sin(time * 12) * 0.2;
        } else if (atk.startsWith('aerial')) {
          bodyRef.current.rotation.y = time * 22;
          bodyRef.current.rotation.x = 0.35;
          bodyRef.current.position.y = 0.5;
        } else if (atk === 'slam') {
          bodyRef.current.rotation.x = Math.PI / 3;
          bodyRef.current.position.y = -0.5;
          bodyRef.current.scale.setScalar(1.1);
        } else if (atk === 'special') {
          bodyRef.current.scale.setScalar(1.25);
          bodyRef.current.position.y = 0.3 + Math.sin(time * 20) * 0.3;
          bodyRef.current.rotation.y = Math.sin(time * 8) * 0.5;
        } else if (atk === 'ultimate') {
          bodyRef.current.position.y = 1.5 + Math.sin(time * 10) * 0.4;
          bodyRef.current.rotation.y = time * 30;
          bodyRef.current.scale.setScalar(1.4);
        }
      } else if (attackPhaseRef.current === 'windup') {
        bodyRef.current.rotation.y = -0.4;
        bodyRef.current.position.y = -0.15;
        bodyRef.current.rotation.x = 0.15;
      }
      return;
    }

    if (!groundedRef.current) {
      bodyRef.current.rotation.x = 0.2;
      bodyRef.current.position.y = Math.sin(time * 6) * 0.1;
      return;
    }

    if (isMoving) {
      const animSpeed = isRunning ? 16 : 11;
      const t = time * animSpeed;
      bodyRef.current.position.y = Math.abs(Math.sin(t)) * (isRunning ? 0.25 : 0.15);
      bodyRef.current.rotation.x = isRunning ? 0.25 : 0.15;
      bodyRef.current.rotation.z = Math.sin(t * 0.5) * (isRunning ? 0.15 : 0.08);
      const bob = Math.sin(t) * 0.03;
      bodyRef.current.position.x = bob;
      return;
    }

    const breathe = Math.sin(time * 2) * 0.06;
    const sway = Math.sin(time * 1.3) * 0.02;
    bodyRef.current.position.y = breathe;
    bodyRef.current.rotation.z = sway;
  };

  const attackColor = useMemo(() => {
    const store = useFluidCombat.getState();
    if (!store.currentAttack || store.attackPhase !== 'active') return null;
    const isHeavy = store.currentAttack.startsWith('heavy') || store.currentAttack === 'special' || store.currentAttack === 'ultimate';
    return isHeavy ? '#ffaa00' : '#00ccff';
  }, []);

  return (
    <group ref={groupRef}>
      <group ref={bodyRef}>
        <SafeGLBModel modelId={characterId} fallbackColor="#4488ff" />
      </group>

      {dashTimerRef.current > 0 && (
        <Sparkles count={20} size={3} color="#00ffff" speed={2} scale={3} />
      )}
    </group>
  );
}

function AttackVFX({ playerPosRef }: { playerPosRef: React.MutableRefObject<THREE.Vector3> }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const store = useFluidCombat;

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const { currentAttack, attackPhase } = store.getState();
    if (currentAttack && attackPhase === 'active') {
      meshRef.current.visible = true;
      meshRef.current.position.copy(playerPosRef.current);
      meshRef.current.position.y += 1;
      const isHeavy = currentAttack.startsWith('heavy') || currentAttack === 'special' || currentAttack === 'ultimate';
      const scale = isHeavy ? 3 : 1.5;
      meshRef.current.scale.setScalar(scale);
      meshRef.current.rotation.y += delta * 10;
      const mat = meshRef.current.material as THREE.MeshBasicMaterial;
      mat.color.set(isHeavy ? '#ffaa00' : '#00ccff');
      mat.opacity = 0.4;
    } else {
      meshRef.current.visible = false;
    }
  });

  return (
    <mesh ref={meshRef} visible={false}>
      <ringGeometry args={[0.5, 2, 16]} />
      <meshBasicMaterial color="#00ccff" transparent opacity={0.4} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Enemy3D({
  enemy,
  index,
  playerPosRef,
  onUpdate,
}: {
  enemy: EnemyState;
  index: number;
  playerPosRef: React.MutableRefObject<THREE.Vector3>;
  onUpdate: (index: number, updates: Partial<EnemyState>) => void;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const bodyRef = useRef<THREE.Group>(null!);
  const patrolTimerRef = useRef(0);

  useFrame((state, delta) => {
    if (enemy.state === 'dead') {
      if (groupRef.current) groupRef.current.visible = false;
      return;
    }
    if (groupRef.current) groupRef.current.visible = true;

    const dt = Math.min(delta, 0.05);
    const playerPos = playerPosRef.current;
    const distToPlayer = enemy.position.distanceTo(playerPos);

    let newState = enemy.state;
    const pos = enemy.position.clone();
    let rot = enemy.rotation;
    let atkCd = Math.max(0, enemy.attackCooldown - dt);

    if (distToPlayer < CHASE_RANGE) {
      newState = 'chase';
      const dir = new THREE.Vector3().subVectors(playerPos, pos).normalize();
      pos.x += dir.x * 4 * dt;
      pos.z += dir.z * 4 * dt;
      rot = Math.atan2(dir.x, dir.z);

      if (distToPlayer < ENEMY_ATTACK_RANGE && atkCd <= 0) {
        newState = 'attack';
        atkCd = ENEMY_ATTACK_COOLDOWN;
      }
    } else {
      newState = 'patrol';
      patrolTimerRef.current -= dt;
      if (patrolTimerRef.current <= 0) {
        const px = enemy.spawnPosition.x + (seededRandom(state.clock.elapsedTime * (index + 1) * 7) - 0.5) * 15;
        const pz = enemy.spawnPosition.z + (seededRandom(state.clock.elapsedTime * (index + 1) * 13) - 0.5) * 15;
        enemy.patrolTarget.set(px, 0, pz);
        patrolTimerRef.current = 3 + seededRandom(state.clock.elapsedTime * (index + 1)) * 4;
      }
      const dir = new THREE.Vector3().subVectors(enemy.patrolTarget, pos);
      if (dir.length() > 1) {
        dir.normalize();
        pos.x += dir.x * 2 * dt;
        pos.z += dir.z * 2 * dt;
        rot = Math.atan2(dir.x, dir.z);
      }
    }

    pos.x = Math.max(-HALF_WORLD, Math.min(HALF_WORLD, pos.x));
    pos.z = Math.max(-HALF_WORLD, Math.min(HALF_WORLD, pos.z));

    onUpdate(index, { position: pos, rotation: rot, state: newState, attackCooldown: atkCd });

    if (groupRef.current) {
      groupRef.current.position.set(pos.x, 1.0, pos.z);
      groupRef.current.rotation.y = rot + Math.PI;
    }

    if (bodyRef.current) {
      const t = state.clock.elapsedTime;
      bodyRef.current.rotation.set(0, 0, 0);
      bodyRef.current.position.set(0, 0, 0);
      bodyRef.current.scale.setScalar(1);

      if (newState === 'chase') {
        const chaseSpeed = 12;
        bodyRef.current.position.y = Math.abs(Math.sin(t * chaseSpeed)) * 0.2;
        bodyRef.current.rotation.x = 0.2;
        bodyRef.current.rotation.z = Math.sin(t * chaseSpeed * 0.5) * 0.1;
      } else if (newState === 'patrol') {
        const walkSpeed = 8;
        bodyRef.current.position.y = Math.abs(Math.sin(t * walkSpeed)) * 0.12;
        bodyRef.current.rotation.x = 0.1;
        bodyRef.current.rotation.z = Math.sin(t * walkSpeed * 0.5) * 0.06;
      } else if (newState === 'attack') {
        bodyRef.current.rotation.y = t * 15;
        bodyRef.current.position.z = 0.6;
        bodyRef.current.position.y = 0.2 + Math.sin(t * 12) * 0.15;
        bodyRef.current.scale.setScalar(1.1);
      } else {
        const breathe = Math.sin(t * 2) * 0.05;
        const sway = Math.sin(t * 1.5) * 0.02;
        bodyRef.current.position.y = breathe;
        bodyRef.current.rotation.z = sway;
      }
    }
  });

  const hpPercent = enemy.hp / enemy.maxHp;
  const enemyScale = getCharacterScale(enemy.modelId);
  const hpBarHeight = Math.max(2.5, enemyScale * 1.2);

  return (
    <group ref={groupRef}>
      <group ref={bodyRef}>
        <SafeGLBModel modelId={enemy.modelId} fallbackColor="#ff4444" />
      </group>

      <Html position={[0, hpBarHeight, 0]} center distanceFactor={15} sprite>
        <div style={{ width: '60px', textAlign: 'center', pointerEvents: 'none' }}>
          <div style={{
            width: '60px', height: '6px', background: '#333', borderRadius: '3px', overflow: 'hidden',
            border: '1px solid #666',
          }}>
            <div style={{
              width: `${hpPercent * 100}%`, height: '100%',
              background: hpPercent > 0.5 ? '#22cc44' : hpPercent > 0.25 ? '#ccaa00' : '#cc2222',
              transition: 'width 0.2s',
            }} />
          </div>
          <div style={{ color: '#ff6666', fontSize: '8px', fontWeight: 'bold', marginTop: '2px', textShadow: '0 0 3px black' }}>
            {enemy.modelId.toUpperCase()}
          </div>
        </div>
      </Html>
    </group>
  );
}

function FloatingDamageNumbers({ numbers }: { numbers: DamageNumber[] }) {
  return (
    <>
      {numbers.map((dmg) => (
        <Html key={dmg.id} position={[dmg.position.x, dmg.position.y + 2 + dmg.time * 2, dmg.position.z]} center sprite>
          <div style={{
            color: dmg.isCombo ? '#ffaa00' : '#ff4444',
            fontSize: dmg.isCombo ? '24px' : '18px',
            fontWeight: 'bold',
            textShadow: '0 0 6px black, 0 0 3px black',
            opacity: Math.max(0, 1 - dmg.time),
            pointerEvents: 'none',
            transform: `scale(${1 + dmg.time * 0.3})`,
          }}>
            {dmg.value}
          </div>
        </Html>
      ))}
    </>
  );
}

function ScreenShake() {
  const { camera } = useThree();
  const shakeRef = useRef(0);
  const originalPosRef = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    const { currentAttack, attackPhase } = useFluidCombat.getState();
    const isHeavy = currentAttack && (currentAttack.startsWith('heavy') || currentAttack === 'special' || currentAttack === 'ultimate');
    if (isHeavy && attackPhase === 'active') {
      shakeRef.current = 0.3;
    }
    if (shakeRef.current > 0) {
      shakeRef.current -= delta;
      const intensity = shakeRef.current * 0.5;
      camera.position.x += (Math.random() - 0.5) * intensity;
      camera.position.y += (Math.random() - 0.5) * intensity;
    }
  });

  return null;
}

function AdventureWorld({
  characterId,
  playerPosRef,
  enemiesRef,
  damageNumbersRef,
  onPlayerHpChange,
}: {
  characterId: string;
  playerPosRef: React.MutableRefObject<THREE.Vector3>;
  enemiesRef: React.MutableRefObject<EnemyState[]>;
  damageNumbersRef: React.MutableRefObject<DamageNumber[]>;
  onPlayerHpChange: (damage: number) => void;
}) {
  const [damageNumbers, setDamageNumbers] = useState<DamageNumber[]>([]);
  const dnIdRef = useRef(0);

  const handleHitEnemy = useCallback((enemyIndex: number, damage: number, attackType: AttackType) => {
    const enemies = enemiesRef.current;
    if (!enemies[enemyIndex] || enemies[enemyIndex].state === 'dead') return;

    enemies[enemyIndex].hp -= damage;
    const pos = enemies[enemyIndex].position.clone();
    const isCombo = useFluidCombat.getState().comboCount > 5;

    setDamageNumbers(prev => [...prev, {
      id: dnIdRef.current++,
      value: damage,
      position: pos,
      time: 0,
      isCombo,
    }]);

    if (enemies[enemyIndex].hp <= 0) {
      enemies[enemyIndex].state = 'dead';
      enemies[enemyIndex].respawnTimer = RESPAWN_TIME;
    }
  }, [enemiesRef]);

  const handleEnemyUpdate = useCallback((index: number, updates: Partial<EnemyState>) => {
    const enemies = enemiesRef.current;
    if (!enemies[index]) return;
    Object.assign(enemies[index], updates);

    if (updates.state === 'attack' && updates.attackCooldown === ENEMY_ATTACK_COOLDOWN) {
      const dist = enemies[index].position.distanceTo(playerPosRef.current);
      if (dist < ENEMY_ATTACK_RANGE) {
        onPlayerHpChange(5 + Math.floor(seededRandom(Date.now() * (index + 1)) * 8));
      }
    }
  }, [enemiesRef, playerPosRef, onPlayerHpChange]);

  useFrame((_, delta) => {
    setDamageNumbers(prev =>
      prev.map(d => ({ ...d, time: d.time + delta })).filter(d => d.time < 1.2)
    );

    const enemies = enemiesRef.current;
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      if (!e) continue;
      if (e.state === 'dead') {
        e.respawnTimer -= delta;
        if (e.respawnTimer <= 0) {
          e.hp = e.maxHp;
          e.state = 'patrol';
          e.position.copy(e.spawnPosition);
        }
      }
    }
  });

  return (
    <>
      <fog attach="fog" args={['#1a2a1a', 30, 80]} />

      <ambientLight intensity={0.4} color="#aaccbb" />
      <directionalLight position={[30, 40, 20]} intensity={1.2} castShadow shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-40} shadow-camera-right={40} shadow-camera-top={40} shadow-camera-bottom={-40} />
      <pointLight position={[-20, 15, -20]} intensity={0.6} color="#ff6b6b" distance={50} />
      <pointLight position={[20, 15, 20]} intensity={0.6} color="#4ecdc4" distance={50} />
      <hemisphereLight args={['#87ceeb', '#2d5a27', 0.3]} />

      <WorldTerrain />

      <Player3D
        characterId={characterId}
        playerPosRef={playerPosRef}
        enemiesRef={enemiesRef}
        onHitEnemy={handleHitEnemy}
      />

      <AttackVFX playerPosRef={playerPosRef} />

      {enemiesRef.current.map((enemy, i) => (
        <Enemy3D
          key={enemy.id}
          enemy={enemy}
          index={i}
          playerPosRef={playerPosRef}
          onUpdate={handleEnemyUpdate}
        />
      ))}

      <FloatingDamageNumbers numbers={damageNumbers} />

      <FollowCamera target={playerPosRef} />
      <ScreenShake />

      <EffectComposer>
        <Bloom luminanceThreshold={0.6} luminanceSmoothing={0.4} intensity={0.8} />
      </EffectComposer>
    </>
  );
}

function Minimap({ playerPos, enemies }: { playerPos: THREE.Vector3; enemies: EnemyState[] }) {
  const mapSize = 120;
  const scale = mapSize / WORLD_SIZE;

  return (
    <div style={{
      width: `${mapSize}px`, height: `${mapSize}px`,
      background: 'rgba(0,0,0,0.7)', border: '2px solid #4ecdc4', borderRadius: '8px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        left: `${(playerPos.x + HALF_WORLD) * scale - 4}px`,
        top: `${(playerPos.z + HALF_WORLD) * scale - 4}px`,
        width: '8px', height: '8px', background: '#4488ff', borderRadius: '50%',
        boxShadow: '0 0 6px #4488ff',
      }} />
      {enemies.map((e, i) => e.state !== 'dead' && (
        <div key={i} style={{
          position: 'absolute',
          left: `${(e.position.x + HALF_WORLD) * scale - 3}px`,
          top: `${(e.position.z + HALF_WORLD) * scale - 3}px`,
          width: '6px', height: '6px',
          background: e.state === 'chase' ? '#ff4444' : '#ff8844',
          borderRadius: '50%',
          boxShadow: e.state === 'chase' ? '0 0 4px #ff4444' : 'none',
        }} />
      ))}
    </div>
  );
}

export default function AdventureArena({ characterId, onBack, onMissionComplete }: AdventureArenaProps) {
  const playerPosRef = useRef(new THREE.Vector3(0, 0, 0));
  const [playerHp, setPlayerHp] = useState(100);
  const [maxPlayerHp] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [enemyStates, setEnemyStates] = useState<EnemyState[]>([]);

  const enemiesRef = useRef<EnemyState[]>([]);
  const damageNumbersRef = useRef<DamageNumber[]>([]);

  const initialEnemies = useMemo(() => {
    return ENEMY_IDS.map((modelId, i) => {
      const angle = (i / ENEMY_IDS.length) * Math.PI * 2;
      const radius = 15 + seededRandom(i * 31.7) * 20;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const spawnPos = new THREE.Vector3(x, 0, z);
      return {
        id: `enemy_${i}`,
        modelId,
        hp: 80 + i * 10,
        maxHp: 80 + i * 10,
        position: spawnPos.clone(),
        rotation: 0,
        velocity: new THREE.Vector3(),
        state: 'patrol' as const,
        patrolTarget: spawnPos.clone(),
        attackCooldown: 0,
        respawnTimer: 0,
        spawnPosition: spawnPos.clone(),
      };
    });
  }, []);

  useEffect(() => {
    enemiesRef.current = initialEnemies;
    setEnemyStates(initialEnemies);
  }, [initialEnemies]);

  const { comboCount, comboDamage, specialMeter, ultimateMeter, currentAttack } = useFluidCombat();

  const handlePlayerHpChange = useCallback((damage: number) => {
    setPlayerHp(prev => {
      const newHp = Math.max(0, prev - damage);
      if (newHp <= 0) setGameOver(true);
      return newHp;
    });
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape') setIsPaused(p => !p);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const hpPercent = (playerHp / maxPlayerHp) * 100;

  return (
    <div className="w-full h-screen relative bg-black select-none" style={{ cursor: 'default' }}>
      <KeyboardControls map={keyMap}>
        <Canvas
          shadows
          camera={{ position: [0, 12, 18], fov: 55 }}
          gl={{ antialias: true, alpha: false }}
          style={{ width: '100%', height: '100%' }}
        >
          <color attach="background" args={['#0a1a0a']} />
          <Suspense fallback={null}>
            <AdventureWorld
              characterId={characterId}
              playerPosRef={playerPosRef}
              enemiesRef={enemiesRef}
              damageNumbersRef={damageNumbersRef}
              onPlayerHpChange={handlePlayerHpChange}
            />
          </Suspense>
        </Canvas>
      </KeyboardControls>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-4 left-4">
          <div className="bg-black/80 rounded-lg p-3 border-2 border-cyan-500 min-w-[200px]">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-cyan-400 text-xs font-bold uppercase">{characterId}</span>
              <span className="text-white text-xs ml-auto">{playerHp}/{maxPlayerHp}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-200"
                style={{
                  width: `${hpPercent}%`,
                  background: hpPercent > 50 ? 'linear-gradient(90deg, #22cc44, #44ee66)' :
                    hpPercent > 25 ? 'linear-gradient(90deg, #ccaa00, #eecc00)' :
                      'linear-gradient(90deg, #cc2222, #ee4444)',
                }}
              />
            </div>
          </div>
        </div>

        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          {comboCount > 1 && (
            <div className={`rounded-lg px-5 py-2 ${comboCount > 10 ? 'bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 animate-pulse' : 'bg-gradient-to-r from-orange-500 to-red-500'}`}>
              <p className="text-white font-black text-2xl text-center">{comboCount} HIT COMBO!</p>
              {comboDamage > 0 && (
                <p className="text-yellow-200 text-xs text-center">{comboDamage} total damage</p>
              )}
            </div>
          )}
          {currentAttack && (
            <div className="bg-orange-600/90 rounded-lg px-4 py-1 border border-orange-400">
              <p className="text-white font-bold text-sm uppercase">{currentAttack.replace(/(\d)/g, ' $1')}</p>
            </div>
          )}
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
          <div className="w-48 bg-black/80 rounded-lg p-2 border-2 border-cyan-500">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-cyan-400 text-sm font-bold">SPECIAL</span>
              <span className="text-white text-sm ml-auto">{Math.floor(specialMeter)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${specialMeter >= 50 ? 'animate-pulse' : ''}`}
                style={{
                  width: `${specialMeter}%`,
                  background: specialMeter >= 50 ? 'linear-gradient(90deg, #00ccff, #4488ff)' : '#00aacc',
                }}
              />
            </div>
          </div>
          <div className="w-48 bg-black/80 rounded-lg p-2 border-2 border-purple-500">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-purple-400 text-sm font-bold">ULTIMATE</span>
              <span className="text-white text-sm ml-auto">{Math.floor(ultimateMeter)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${ultimateMeter >= 100 ? 'animate-pulse' : ''}`}
                style={{
                  width: `${ultimateMeter}%`,
                  background: ultimateMeter >= 100 ? 'linear-gradient(90deg, #aa44ff, #ff44aa, #ff4444)' : '#8844cc',
                }}
              />
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 right-4">
          <Minimap playerPos={playerPosRef.current} enemies={enemiesRef.current} />
        </div>

        <div className="absolute bottom-28 left-1/2 -translate-x-1/2">
          <div className="text-center text-gray-500 text-xs bg-black/50 rounded-lg px-4 py-2">
            <p><span className="text-yellow-400">WASD</span> Move | <span className="text-yellow-400">SPACE</span> Jump | <span className="text-yellow-400">SHIFT</span> Dash</p>
            <p><span className="text-red-400">J/Z</span> Light | <span className="text-orange-400">K/X</span> Heavy | <span className="text-purple-400">L/C</span> Launcher | <span className="text-cyan-400">I/V</span> Special | <span className="text-pink-400">O/B</span> Ultimate</p>
          </div>
        </div>

        <button
          onClick={onBack}
          className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold pointer-events-auto transition-colors"
        >
          EXIT
        </button>
      </div>

      {isPaused && !gameOver && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center pointer-events-auto z-50">
          <div className="text-center space-y-6">
            <h1 className="text-6xl font-black text-white">PAUSED</h1>
            <div className="flex gap-4 justify-center">
              <button onClick={() => setIsPaused(false)} className="bg-green-600 hover:bg-green-500 text-white font-bold px-8 py-4 text-xl rounded-lg">
                RESUME
              </button>
              <button onClick={onBack} className="bg-red-600 hover:bg-red-500 text-white font-bold px-8 py-4 text-xl rounded-lg">
                QUIT
              </button>
            </div>
          </div>
        </div>
      )}

      {gameOver && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 via-red-950/90 to-black/95 flex items-center justify-center pointer-events-auto z-50">
          <div className="text-center space-y-8">
            <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-400 via-red-600 to-gray-400">
              DEFEATED
            </h1>
            <div className="grid grid-cols-2 gap-8 p-6 rounded-2xl bg-gray-900/60 border-2 border-red-500/30">
              <div className="text-center">
                <p className="text-gray-400 text-sm uppercase">Max Combo</p>
                <p className="text-4xl font-black text-red-400">{comboCount}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm uppercase">Total Damage</p>
                <p className="text-4xl font-black text-orange-400">{comboDamage}</p>
              </div>
            </div>
            <div className="flex gap-6 justify-center">
              <button
                onClick={() => {
                  setPlayerHp(100);
                  setGameOver(false);
                  playerPosRef.current.set(0, 0, 0);
                  enemiesRef.current.forEach(e => {
                    e.hp = e.maxHp;
                    e.state = 'patrol';
                    e.position.copy(e.spawnPosition);
                  });
                  useFluidCombat.setState({ comboCount: 0, comboDamage: 0, specialMeter: 0, ultimateMeter: 0 });
                }}
                className="bg-gradient-to-r from-orange-600 to-red-600 text-white font-black px-10 py-5 text-2xl rounded-xl"
              >
                RETRY
              </button>
              <button onClick={onBack} className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-10 py-5 text-xl rounded-xl">
                QUIT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

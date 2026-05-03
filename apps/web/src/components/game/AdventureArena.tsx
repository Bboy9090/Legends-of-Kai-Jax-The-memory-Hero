import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { KeyboardControls, useKeyboardControls, useGLTF, Html, Sparkles, useTexture, useAnimations } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useFluidCombat, COMBO_MOVES, AttackType } from '../../lib/stores/useFluidCombat';
import { useRunner } from '../../lib/stores/useRunner';

interface AdventureArenaProps {
  characterId: string;
  onBack: () => void;
  onMissionComplete?: () => void;
}

const ATTACK_RANGE = 5.5;
const WORLD_SIZE = 100;
const HALF_WORLD = WORLD_SIZE / 2;
const ENEMY_IDS = ['voidonus_beast', 'shadow_panther', 'frost_wolf', 'thunder_lion', 'jade_serpent'];

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

const RESPAWN_TIME = 10;
const CHASE_RANGE = 8;
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

function seededRandom(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function GLBModel({ modelId, scale = 2.5, color = '#ff4444', action = 'idle' }: { modelId: string; scale?: number; color?: string; action?: string }) {
  const resolved = resolveModelId(modelId);
  const modelPath = `/models/${resolved}.glb`;
  const groupRef = useRef<THREE.Group>(null!);

  const { scene, animations } = useGLTF(modelPath);
  const { actions } = useAnimations(animations, groupRef);
  
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

  useEffect(() => {
    if (!actions || Object.keys(actions).length === 0) return;
    const animName = action.toLowerCase();
    const availableAnims = Object.keys(actions);
    const match = availableAnims.find(n => n.toLowerCase() === animName) || 
                  availableAnims.find(n => n.toLowerCase().includes(animName)) ||
                  availableAnims[0];
    
    if (match && actions[match]) {
      Object.values(actions).forEach(a => a?.fadeOut(0.2));
      actions[match].reset().fadeIn(0.2).play();
    }
  }, [actions, action]);

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} scale={scale} />
    </group>
  );
}

function FallbackModel({ color = '#ff4444' }: { color?: string }) {
  return (
    <group>
      <mesh position={[0, 0.8, 0]} castShadow>
        <boxGeometry args={[0.8, 1.2, 0.6]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

function SafeGLBModel({ modelId, scale = 2.5, fallbackColor = '#ff4444', action = 'idle' }: { modelId: string; scale?: number; fallbackColor?: string; action?: string }) {
  return (
    <Suspense fallback={<FallbackModel color={fallbackColor} />}>
      <GLBModel modelId={modelId} scale={scale} color={fallbackColor} action={action} />
    </Suspense>
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

function WorldTerrain() {
  const grassTexture = useTexture('/textures/grass.png', (t) => {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(20, 20);
  });

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[WORLD_SIZE, WORLD_SIZE]} />
        <meshStandardMaterial color="#2d5a27" map={grassTexture} roughness={0.9} />
      </mesh>
      <gridHelper args={[WORLD_SIZE, 20, 0x00ff00, 0x113311]} position={[0, 0.01, 0]} />
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
  onHitEnemy: (enemyIndex: number, damage: number) => void;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const bodyRef = useRef<THREE.Group>(null!);
  const [, getKeys] = useKeyboardControls<Controls>();
  
  const velocityRef = useRef(new THREE.Vector3());
  const positionRef = useRef(new THREE.Vector3(0, 0, 0));
  const rotationRef = useRef(0);
  const groundedRef = useRef(true);
  const currentAttackRef = useRef<AttackType | null>(null);
  const attackTimerRef = useRef(0);
  const attackPhaseRef = useRef<'windup' | 'active' | 'recovery' | null>(null);
  const hitEnemiesThisSwingRef = useRef<Set<number>>(new Set());

  const MOVE_SPEED = 10;
  const RUN_SPEED = 16;
  const JUMP_FORCE = 15;
  const GRAVITY = -35;
  const ACCEL = 35;
  const FRICTION = 0.92;

  useFrame((state, delta) => {
    const keys = getKeys();
    const dt = Math.min(delta, 0.05);

    let moveX = 0;
    let moveZ = 0;
    if (keys.left) moveX -= 1;
    if (keys.right) moveX += 1;
    if (keys.forward) moveZ -= 1;
    if (keys.back) moveZ += 1;
    
    if (moveX !== 0 || moveZ !== 0) {
      const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
      moveX /= len; moveZ /= len;
      const speed = keys.run ? RUN_SPEED : MOVE_SPEED;
      velocityRef.current.x += (moveX * speed - velocityRef.current.x) * ACCEL * dt;
      velocityRef.current.z += (moveZ * speed - velocityRef.current.z) * ACCEL * dt;
      
      const targetRot = Math.atan2(moveX, moveZ);
      rotationRef.current = THREE.MathUtils.lerp(rotationRef.current, targetRot, 10 * dt);
    } else {
      velocityRef.current.x *= FRICTION;
      velocityRef.current.z *= FRICTION;
    }

    if (keys.jump && groundedRef.current) {
      velocityRef.current.y = JUMP_FORCE;
      groundedRef.current = false;
    }

    if (!groundedRef.current) {
      velocityRef.current.y += GRAVITY * dt;
    }

    positionRef.current.addScaledVector(velocityRef.current, dt);

    if (positionRef.current.y <= 0) {
      positionRef.current.y = 0;
      velocityRef.current.y = 0;
      groundedRef.current = true;
    }

    playerPosRef.current.copy(positionRef.current);
    if (groupRef.current) {
      groupRef.current.position.copy(positionRef.current);
      groupRef.current.rotation.y = rotationRef.current + Math.PI;
    }

    // Combat logic
    const canAttack = !currentAttackRef.current || attackPhaseRef.current === 'recovery';
    if (keys.lightAttack && canAttack) startAttack('light1');
    else if (keys.heavyAttack && canAttack) startAttack('heavy1');
    
    if (currentAttackRef.current) {
      attackTimerRef.current += dt;
      const move = COMBO_MOVES[currentAttackRef.current];
      if (attackTimerRef.current > move.duration) {
        currentAttackRef.current = null;
        attackPhaseRef.current = null;
      } else if (attackTimerRef.current > move.duration * 0.3 && attackPhaseRef.current === 'windup') {
        attackPhaseRef.current = 'active';
        checkHits();
      } else if (attackTimerRef.current > move.duration * 0.7 && attackPhaseRef.current === 'active') {
        attackPhaseRef.current = 'recovery';
      }
    }
  });

  const startAttack = (type: AttackType) => {
    currentAttackRef.current = type;
    attackTimerRef.current = 0;
    attackPhaseRef.current = 'windup';
    hitEnemiesThisSwingRef.current.clear();
    useFluidCombat.setState({ currentAttack: type });
  };

  const checkHits = () => {
    const enemies = enemiesRef.current;
    enemies.forEach((enemy, i) => {
      if (enemy.state === 'dead' || hitEnemiesThisSwingRef.current.has(i)) return;
      if (positionRef.current.distanceTo(enemy.position) < ATTACK_RANGE) {
        hitEnemiesThisSwingRef.current.add(i);
        onHitEnemy(i, 25);
        useFluidCombat.setState({ hitStop: 0.05 });
      }
    });
  };

  return (
    <group ref={groupRef}>
      <group ref={bodyRef}>
        <SafeGLBModel 
          modelId={characterId} 
          action={currentAttackRef.current ? 'attack' : (velocityRef.current.length() > 1 ? 'run' : 'idle')} 
        />
      </group>
    </group>
  );
}

function Enemy3D({ enemy, index, playerPosRef, onUpdate }: { enemy: EnemyState; index: number; playerPosRef: React.MutableRefObject<THREE.Vector3>; onUpdate: (i: number, u: Partial<EnemyState>) => void }) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state, delta) => {
    if (enemy.state === 'dead') return;
    const dt = Math.min(delta, 0.05);
    const dist = enemy.position.distanceTo(playerPosRef.current);
    
    if (dist < CHASE_RANGE) {
      const dir = new THREE.Vector3().subVectors(playerPosRef.current, enemy.position).normalize();
      const pos = enemy.position.clone().addScaledVector(dir, 4 * dt);
      const rot = Math.atan2(dir.x, dir.z);
      onUpdate(index, { position: pos, rotation: rot, state: 'chase' });
    }
    
    if (groupRef.current) {
      groupRef.current.position.copy(enemy.position);
      groupRef.current.rotation.y = enemy.rotation + Math.PI;
    }
  });

  if (enemy.state === 'dead') return null;

  return (
    <group ref={groupRef}>
      <SafeGLBModel modelId={enemy.modelId} action={enemy.state === 'chase' ? 'run' : 'idle'} fallbackColor="#ff4444" />
      <Html position={[0, 2.5, 0]} center>
        <div className="w-12 h-1 bg-gray-800 rounded-full overflow-hidden border border-white/20">
          <div className="h-full bg-red-500" style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }} />
        </div>
      </Html>
    </group>
  );
}

function TrainingHUD() {
  const { currentAttack, comboCount, comboDamage } = useFluidCombat();
  const [, getKeys] = useKeyboardControls<Controls>();
  const keys = getKeys();

  return (
    <Html fullscreen pointerEvents="none">
      <div className="absolute inset-0 p-8 flex flex-col justify-between">
        <div className="bg-black/60 backdrop-blur-md border border-white/20 p-4 rounded-lg w-fit">
          <h3 className="text-legendary-cyan font-black text-sm uppercase mb-2">Training Data</h3>
          <div className="text-white font-mono text-xs space-y-1">
            <p>Attack: {currentAttack || '---'}</p>
            <p>Combo: {comboCount} Hits</p>
            <p className="text-legendary-gold">Total: {comboDamage}</p>
          </div>
        </div>
        <div className="flex gap-2 mb-4">
          {['W','A','S','D','J','K','L'].map(k => (
            <div key={k} className="w-10 h-10 flex items-center justify-center border-2 border-white/10 bg-black/40 text-white/40 font-black rounded uppercase">
              {k}
            </div>
          ))}
        </div>
      </div>
    </Html>
  );
}

export default function AdventureArena({ characterId, onBack, onMissionComplete }: AdventureArenaProps) {
  const playerPosRef = useRef(new THREE.Vector3(0, 0, 0));
  const [enemies, setEnemies] = useState<EnemyState[]>([]);
  const enemiesRef = useRef<EnemyState[]>([]);
  const isTraining = useRunner((s) => s.trainingSession);

  useEffect(() => {
    const initialEnemies = ENEMY_IDS.map((id, i) => ({
      id: `enemy-${i}`,
      modelId: id,
      hp: 100,
      maxHp: 100,
      position: new THREE.Vector3((i - 2) * 8, 0, -10),
      rotation: 0,
      velocity: new THREE.Vector3(),
      state: 'patrol' as const,
      patrolTarget: new THREE.Vector3(),
      attackCooldown: 0,
      respawnTimer: 0,
      spawnPosition: new THREE.Vector3((i - 2) * 8, 0, -10),
    }));
    setEnemies(initialEnemies);
    enemiesRef.current = initialEnemies;
  }, []);

  const handleHitEnemy = useCallback((index: number, damage: number) => {
    setEnemies(prev => {
      const next = [...prev];
      if (next[index]) {
        next[index].hp = Math.max(0, next[index].hp - damage);
        if (next[index].hp <= 0) {
          if (isTraining) next[index].hp = 100;
          else {
            next[index].state = 'dead';
            next[index].respawnTimer = RESPAWN_TIME;
          }
        }
      }
      enemiesRef.current = next;
      return next;
    });
  }, [isTraining]);

  const updateEnemy = useCallback((index: number, updates: Partial<EnemyState>) => {
    enemiesRef.current[index] = { ...enemiesRef.current[index]!, ...updates };
  }, []);

  return (
    <KeyboardControls map={keyMap}>
      <div className="w-full h-full relative bg-[#050508]">
        <Canvas shadows camera={{ position: [0, 12, 18], fov: 50 }}>
          <color attach="background" args={['#050508']} />
          <fog attach="fog" args={['#050508', 30, 80]} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />
          
          <Suspense fallback={null}>
            <WorldTerrain />
            <Player3D characterId={characterId} playerPosRef={playerPosRef} enemiesRef={enemiesRef} onHitEnemy={handleHitEnemy} />
            {enemies.map((enemy, i) => (
              <Enemy3D key={enemy.id} enemy={enemy} index={i} playerPosRef={playerPosRef} onUpdate={updateEnemy} />
            ))}
            <FollowCamera target={playerPosRef} />
            <EffectComposer>
              <Bloom intensity={1.2} luminanceThreshold={0.3} radius={0.4} />
            </EffectComposer>
          </Suspense>
          {isTraining && <TrainingHUD />}
        </Canvas>

        <div className="absolute top-6 left-6 z-50">
          <button onClick={onBack} className="bg-black/60 border border-white/20 text-white/80 hover:text-white px-6 py-2 rounded-full font-black text-xs tracking-widest transition-all">
            ← RETREAT
          </button>
        </div>
      </div>
    </KeyboardControls>
  );
}

/**
 * RAGING CITY VERTICAL SLICE SCENE
 * Day 5.2 - Ashblock Heights with real Kai/Jax controllers and Fang combat AI.
 *
 * Architecture:
 * - Exactly one real Kai/Jax controller owns player position.
 * - Mission stages: traversal -> encounter -> memory trace -> extraction.
 * - Fang behavior is source-safe implementation logic only; no invented rank,
 *   weapon, biology, backstory, drops, or chronology.
 * - Jax damages the Fang through JaxAttackSystem scene hitboxes.
 * - Kai uses a narrow slice combat adapter that only resolves after the real
 *   Kai controller accepts an attack input. Final Kai hitbox migration remains
 *   a separate hardening task; energy/dodge/attack lifecycle authority stays in
 *   KaiController.
 */

import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
  type RefObject,
} from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useRunner } from '../../lib/stores/useRunner';
import { getFighterById } from '../../lib/characters';
import { useKaiController } from './characters/kai/KaiController';
import { useJaxController } from './characters/jax/JaxController';
import { FangCombatantVisual } from './characters/fang/FangCombatantVisual';
import { MemoryTraceVisual } from './effects/MemoryTraceVisual';
import { ExtractionPortalVisual } from './effects/ExtractionPortalVisual';
import { EnvironmentAmbience } from './effects/EnvironmentAmbience';
import { AtmosphericEffects } from './effects/AtmosphericEffects';
import {
  applyFangKnockback,
  createFangCombatant,
  damageFangCombatant,
  type FangCombatantState,
} from '../../game/characters/fang/FangCombatantContract';
import { updateFangCombatantAI } from '../../game/characters/fang/FangCombatantAI';
import { gameplayInputManager } from '../../lib/input/GameplayInputState';

export type VerticalSliceHero = 'kai' | 'jax';
type MissionStage = 'traversal' | 'encounter' | 'memory-trace' | 'extraction' | 'complete';
type KaiSliceAttackType = 'light' | 'heavy' | 'special' | 'ultimate';

interface ControllerDebugState {
  locomotionMode: string;
  wallCrawling: boolean;
  webZipping: boolean;
  attacking: boolean;
  invulnTimer: number;
  energy: number;
  groundCharges: number | null;
  airCharges: number | null;
}

export interface VerticalSliceDebugSnapshot extends ControllerDebugState {
  hero: VerticalSliceHero | 'INVALID';
  stage: MissionStage;
  position: [number, number, number];
  playerHealth: number;
  playerDown: boolean;
  fangHealth: number;
  fangBehavior: string;
  fangWindup: number;
  memoryTraceActivated: boolean;
  extractionUnlocked: boolean;
  fps: number;
}

const INITIAL_CONTROLLER_DEBUG: ControllerDebugState = {
  locomotionMode: 'LOADING',
  wallCrawling: false,
  webZipping: false,
  attacking: false,
  invulnTimer: 0,
  energy: 100,
  groundCharges: null,
  airCharges: null,
};

const INITIAL_DEBUG: VerticalSliceDebugSnapshot = {
  ...INITIAL_CONTROLLER_DEBUG,
  hero: 'INVALID',
  stage: 'traversal',
  position: [0, 0, -20],
  playerHealth: 100,
  playerDown: false,
  fangHealth: 100,
  fangBehavior: 'IDLE',
  fangWindup: 0,
  memoryTraceActivated: false,
  extractionUnlocked: false,
  fps: 0,
};

interface MissionStateRef {
  stage: MissionStage;
  encounterActive: boolean;
  memoryTraceActivated: boolean;
  extractionUnlocked: boolean;
  fangCombatant: FangCombatantState;
  playerHealth: number;
  playerDown: boolean;
  completionRecorded: boolean;
}

const KAI_SLICE_ATTACK_CONFIG: Record<KaiSliceAttackType, {
  damage: number;
  radius: number;
  minimumForwardDot: number;
}> = {
  light: { damage: 12, radius: 1.0, minimumForwardDot: 0.0 },
  heavy: { damage: 35, radius: 1.5, minimumForwardDot: -0.1 },
  special: { damage: 50, radius: 2.4, minimumForwardDot: -0.2 },
  ultimate: { damage: 100, radius: 8.0, minimumForwardDot: -1.0 },
};

function resolveKaiSliceAttack(
  type: KaiSliceAttackType,
  player: THREE.Group,
  target: FangCombatantState,
  currentTime: number
): boolean {
  if (target.isDead) return false;

  const config = KAI_SLICE_ATTACK_CONFIG[type];
  const targetPosition = new THREE.Vector3(
    target.position.x,
    target.position.y,
    target.position.z
  );
  const playerPosition = new THREE.Vector3();
  player.getWorldPosition(playerPosition);

  const offset = targetPosition.clone().sub(playerPosition);
  offset.y = 0;
  const distance = offset.length();
  if (distance > config.radius) return false;

  if (distance > 0.0001 && config.minimumForwardDot > -1) {
    const facing = player.getWorldDirection(new THREE.Vector3());
    facing.y = 0;
    if (facing.lengthSq() < 0.0001) facing.set(0, 0, 1);
    facing.normalize();
    if (offset.normalize().dot(facing) < config.minimumForwardDot) return false;
  }

  damageFangCombatant(target, config.damage, currentTime);
  return true;
}

function KaiControllerBridge({
  playerRef,
  debugRef,
}: {
  playerRef: RefObject<THREE.Group>;
  debugRef: MutableRefObject<ControllerDebugState>;
}) {
  const { scene } = useThree();
  const controller = useKaiController(playerRef, scene);

  useFrame(() => {
    const state = controller.getState();
    debugRef.current = {
      locomotionMode: state.locomotionMode,
      wallCrawling: state.isWallCrawling,
      webZipping: state.isWebZipping,
      attacking: state.isAttacking,
      invulnTimer: state.invulnTimer,
      energy: state.energy,
      groundCharges: null,
      airCharges: null,
    };
  });

  return null;
}

function JaxControllerBridge({
  playerRef,
  debugRef,
}: {
  playerRef: RefObject<THREE.Group>;
  debugRef: MutableRefObject<ControllerDebugState>;
}) {
  const { scene } = useThree();
  const controller = useJaxController(playerRef, scene);

  useFrame(() => {
    const state = controller.getState();
    debugRef.current = {
      locomotionMode: state.locomotionMode,
      wallCrawling: false,
      webZipping: false,
      attacking: state.isAttacking,
      invulnTimer: state.invulnTimer,
      energy: state.energy,
      groundCharges: state.groundDisplacementCharges,
      airCharges: state.airDisplacementCharges,
    };
  });

  return null;
}

function VerticalSliceEnvironment({
  forcedCharacter,
  onDebug,
}: {
  forcedCharacter?: VerticalSliceHero;
  onDebug: (snapshot: VerticalSliceDebugSnapshot) => void;
}) {
  const { scene, camera } = useThree();
  const selectedCharacter = useRunner((state) => state.selectedCharacter);
  const activeStoryMissionId = useRunner((state) => state.activeStoryMissionId);
  const setGameState = useRunner((state) => state.setGameState);
  const setMissionCompleted = useRunner((state) => state.setMissionCompleted);

  const charId = forcedCharacter ?? selectedCharacter;
  const isKai = charId === 'kai';
  const isJax = charId === 'jax';
  const hero: VerticalSliceHero | 'INVALID' = isKai ? 'kai' : isJax ? 'jax' : 'INVALID';
  const fighter = getFighterById(charId ?? '');

  const playerRef = useRef<THREE.Group>(null);
  const fangRef = useRef<THREE.Group>(null);
  const controllerDebugRef = useRef<ControllerDebugState>({ ...INITIAL_CONTROLLER_DEBUG });
  const previousInteractRef = useRef(false);
  const previousAttackInputRef = useRef({ light: false, heavy: false, special: false, ultimate: false });
  const pendingKaiAttackRef = useRef<{ type: KaiSliceAttackType; age: number } | null>(null);
  const perfRef = useRef({ elapsed: 0, frames: 0, fps: 0, hudElapsed: 0 });
  const [renderStage, setRenderStage] = useState<MissionStage>('traversal');

  const stateRef = useRef<MissionStateRef>({
    stage: 'traversal',
    encounterActive: false,
    memoryTraceActivated: false,
    extractionUnlocked: false,
    fangCombatant: createFangCombatant('fang_01'),
    playerHealth: 100,
    playerDown: false,
    completionRecorded: false,
  });

  const transitionStage = (next: MissionStage) => {
    const mission = stateRef.current;
    if (mission.stage === next) return;
    mission.stage = next;
    setRenderStage(next);
  };

  useEffect(() => {
    if (!forcedCharacter && !isKai && !isJax) {
      setGameState('mission-select');
    }
  }, [forcedCharacter, isKai, isJax, setGameState]);

  useEffect(() => {
    const previousBackground = scene.background;
    const previousFog = scene.fog;
    const bg = new THREE.Color(0x11131c);
    scene.background = bg;
    scene.fog = new THREE.Fog(0x11131c, 55, 150);

    camera.position.set(0, 5, -30);
    camera.lookAt(0, 1.2, -14);
    camera.updateMatrixWorld(true);

    return () => {
      if (scene.background === bg) scene.background = previousBackground;
      scene.fog = previousFog;
    };
  }, [scene, camera]);

  useEffect(() => {
    const fang = fangRef.current;
    if (!fang) return;

    fang.userData.combatTarget = true;
    fang.userData.targetId = stateRef.current.fangCombatant.id;
    fang.userData.isLightningTarget = true;
    fang.userData.health = stateRef.current.fangCombatant.health;
    fang.userData.velocity = new THREE.Vector3();
  }, [renderStage]);

  useFrame((frameState, rawDelta) => {
    const player = playerRef.current;
    if (!player || hero === 'INVALID') return;

    const delta = Math.min(rawDelta, 0.05);
    const currentTime = frameState.clock.elapsedTime;
    const mission = stateRef.current;
    const playerPos = player.position;
    const fangState = mission.fangCombatant;

    if (mission.stage === 'traversal' && playerPos.z > -5) {
      mission.encounterActive = true;
      transitionStage('encounter');
    }

    const input = gameplayInputManager.getState();

    const attackInput = {
      light: input.attackLight,
      heavy: input.attackHeavy,
      special: input.attackSpecial,
      ultimate: input.attackUltimate,
    };

    if (isKai && mission.stage === 'encounter' && !mission.playerDown) {
      const previous = previousAttackInputRef.current;
      const edgeType: KaiSliceAttackType | null =
        attackInput.light && !previous.light ? 'light' :
        attackInput.heavy && !previous.heavy ? 'heavy' :
        attackInput.special && !previous.special ? 'special' :
        attackInput.ultimate && !previous.ultimate ? 'ultimate' : null;

      if (edgeType) {
        pendingKaiAttackRef.current = { type: edgeType, age: 0 };
      }

      const pending = pendingKaiAttackRef.current;
      if (pending) {
        pending.age += delta;
        if (controllerDebugRef.current.attacking) {
          resolveKaiSliceAttack(pending.type, player, fangState, currentTime);
          pendingKaiAttackRef.current = null;
        } else if (pending.age > 0.25) {
          // Controller rejected the input (energy/dodge/other lifecycle gate).
          pendingKaiAttackRef.current = null;
        }
      }
    }
    previousAttackInputRef.current = attackInput;

    const fangObject = fangRef.current;
    if (mission.stage === 'encounter' && fangObject && !mission.playerDown) {
      const externalHealth = typeof fangObject.userData.health === 'number'
        ? fangObject.userData.health
        : fangState.health;

      if (externalHealth < fangState.health) {
        damageFangCombatant(fangState, fangState.health - externalHealth, currentTime);
      }

      const externalVelocity = fangObject.userData.velocity;
      if (externalVelocity instanceof THREE.Vector3 && externalVelocity.lengthSq() > 0.0001) {
        applyFangKnockback(fangState, {
          x: externalVelocity.x,
          y: externalVelocity.y,
          z: externalVelocity.z,
        });
        externalVelocity.set(0, 0, 0);
      }

      const aiResult = updateFangCombatantAI(
        fangState,
        { x: playerPos.x, y: playerPos.y, z: playerPos.z },
        delta,
        currentTime
      );

      fangObject.position.set(
        fangState.position.x,
        Math.max(0.8, fangState.position.y + 0.3),
        fangState.position.z
      );
      fangObject.userData.health = fangState.health;
      fangObject.userData.isDead = fangState.isDead;
      fangObject.userData.behavior = fangState.behavior;

      if (aiResult.attackResolved && controllerDebugRef.current.invulnTimer <= 0) {
        mission.playerHealth = Math.max(0, mission.playerHealth - aiResult.attackDamage);
        mission.playerDown = mission.playerHealth === 0;
      }
    }

    if (mission.stage === 'encounter' && fangState.isDead) {
      mission.encounterActive = false;
      transitionStage('memory-trace');
    }

    const interactEdge = input.interact && !previousInteractRef.current;
    previousInteractRef.current = input.interact;

    const distToTrace = Math.hypot(playerPos.x, playerPos.z - 5);
    if (mission.stage === 'memory-trace' && distToTrace < 2 && interactEdge) {
      mission.memoryTraceActivated = true;
    }

    if (mission.stage === 'memory-trace' && mission.memoryTraceActivated) {
      mission.extractionUnlocked = true;
      transitionStage('extraction');
    }

    if (mission.stage === 'extraction' && playerPos.z > 15) {
      transitionStage('complete');
      if (!mission.completionRecorded && activeStoryMissionId) {
        mission.completionRecorded = true;
        setMissionCompleted(activeStoryMissionId);
      }
      if (!forcedCharacter) setGameState('mission-complete');
    }

    const cameraTarget = new THREE.Vector3(playerPos.x * 0.2, 5, playerPos.z - 10);
    camera.position.lerp(cameraTarget, Math.min(1, delta * 5));
    camera.lookAt(playerPos.x, 1.2, playerPos.z + 5);

    const perf = perfRef.current;
    perf.elapsed += delta;
    perf.hudElapsed += delta;
    perf.frames += 1;
    if (perf.elapsed >= 0.5) {
      perf.fps = perf.frames / perf.elapsed;
      perf.elapsed = 0;
      perf.frames = 0;
    }

    if (perf.hudElapsed >= 0.1) {
      perf.hudElapsed = 0;
      onDebug({
        ...controllerDebugRef.current,
        hero,
        stage: mission.stage,
        position: [playerPos.x, playerPos.y, playerPos.z],
        playerHealth: mission.playerHealth,
        playerDown: mission.playerDown,
        fangHealth: fangState.health,
        fangBehavior: fangState.behavior,
        fangWindup: fangState.attackWindupTimer,
        memoryTraceActivated: mission.memoryTraceActivated,
        extractionUnlocked: mission.extractionUnlocked,
        fps: perf.fps,
      });
    }
  });

  if (!fighter || hero === 'INVALID') return null;

  return (
    <group>
      <EnvironmentAmbience stage={renderStage} fangBehavior={mission.fangCombatant.behavior} playerHealth={mission.playerHealth} />
      <AtmosphericEffects stage={renderStage} fangBehavior={mission.fangCombatant.behavior} />

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 20]}
        receiveShadow
        userData={{ isGround: true, isWalkable: true }}
      >
        <planeGeometry args={[44, 100]} />
        <meshStandardMaterial color="#18181b" roughness={0.9} metalness={0.12} />
      </mesh>

      {[-15, 0, 15, 30, 45].map((z) => (
        <mesh key={`street-mark-${z}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, z]}>
          <planeGeometry args={[0.22, 5]} />
          <meshStandardMaterial color="#c76b22" emissive="#7c2d12" emissiveIntensity={0.15} />
        </mesh>
      ))}

      {isKai && (
        <>
          <mesh
            name="ashblock-kai-climb-wall"
            position={[0, 3, -14]}
            castShadow
            receiveShadow
            userData={{ climbable: true, isWall: true }}
          >
            <boxGeometry args={[10, 6, 1]} />
            <meshStandardMaterial color="#3f3a46" roughness={0.72} />
          </mesh>
          {[
            [0, 5.5, -9],
            [4, 6.5, -1],
            [-3, 7, 8],
          ].map(([x, y, z], index) => (
            <mesh
              key={`ashblock-web-anchor-${index}`}
              name={`ashblock-web-anchor-${index}`}
              position={[x, y, z]}
              castShadow
              userData={{ webAnchor: true }}
            >
              <sphereGeometry args={[0.28, 10, 10]} />
              <meshStandardMaterial color="#9d4edd" emissive="#6d28d9" emissiveIntensity={0.7} />
            </mesh>
          ))}
        </>
      )}

      {isJax && (
        <>
          {[
            [7, 1, -12],
            [7, 2, -1],
            [7, 3, 11],
          ].map(([x, y, z], index) => (
            <mesh
              key={`ashblock-jax-platform-${index}`}
              name={`ashblock-jax-platform-${index}`}
              position={[x, y, z]}
              castShadow
              receiveShadow
              userData={{ isWalkable: true, isCollider: true }}
            >
              <boxGeometry args={[5, 1, 6]} />
              <meshStandardMaterial color="#15395a" roughness={0.62} metalness={0.25} />
            </mesh>
          ))}
          <mesh position={[-8, 2.5, -1]} castShadow receiveShadow userData={{ isCollider: true, isWall: true }}>
            <boxGeometry args={[2, 5, 5]} />
            <meshStandardMaterial color="#292f3b" roughness={0.75} />
          </mesh>
        </>
      )}

      {renderStage === 'encounter' && (
        <group
          ref={fangRef}
          name="fang-syndicate-combatant-proxy"
          userData={{
            combatTarget: true,
            targetId: 'fang_01',
            isLightningTarget: true,
            health: 100,
          }}
        >
          <FangCombatantVisual state={mission.fangCombatant} />
        </group>
      )}

      {renderStage === 'memory-trace' && (
        <MemoryTraceVisual isActivated={mission.memoryTraceActivated} />
      )}

      <ExtractionPortalVisual isUnlocked={mission.extractionUnlocked} />

      {isKai ? (
        <KaiControllerBridge playerRef={playerRef} debugRef={controllerDebugRef} />
      ) : (
        <JaxControllerBridge playerRef={playerRef} debugRef={controllerDebugRef} />
      )}

      <group ref={playerRef} position={[0, 0, -20]}>
        <mesh castShadow position={[0, 0.85, 0]}>
          <capsuleGeometry args={[0.3, 1.1, 6, 10]} />
          <meshStandardMaterial
            color={fighter.color}
            emissive={fighter.accentColor}
            emissiveIntensity={0.32}
          />
        </mesh>
        {isKai && [0, 1, 2, 3].map((index) => {
          const side = index < 2 ? -1 : 1;
          const y = index % 2 === 0 ? 0.5 : 1.15;
          return (
            <mesh
              key={`slice-kai-limb-${index}`}
              position={[side * 0.48, y, 0]}
              rotation={[0, 0, side * 0.65]}
              castShadow
            >
              <cylinderGeometry args={[0.05, 0.05, 0.85, 8]} />
              <meshStandardMaterial color="#7c3aed" />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

function PlayerHUD({
  debug,
  forcedCharacter,
}: {
  debug: VerticalSliceDebugSnapshot;
  forcedCharacter?: VerticalSliceHero;
}) {
  const missionObjectives: Record<MissionStage, string> = {
    traversal: 'Reach the Ashblock disturbance',
    encounter: 'Defeat the Fang Syndicate combatant',
    'memory-trace': 'Investigate the Memory Trace',
    extraction: 'Reach extraction',
    complete: 'Ashblock secured',
  };

  const fangHealthPercent = (debug.fangHealth / 100) * 100;
  const playerHealthPercent = (debug.playerHealth / 100) * 100;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6 text-white font-sans">
      {/* Top-left: Hero identity + Objective */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="text-sm sm:text-base font-bold uppercase tracking-wide">
            {debug.hero === 'kai' && '⚪ Kai'}
            {debug.hero === 'jax' && '🟣 Jax'}
            {debug.hero === 'INVALID' && '? Unknown'}
          </div>
        </div>
        <div className="text-xs sm:text-sm text-slate-300 max-w-xs">
          {missionObjectives[debug.stage]}
        </div>
      </div>

      {/* Bottom-left: Player HP + Energy bars */}
      <div className="flex flex-col gap-4 max-w-xs">
        <div>
          <div className="text-xs font-semibold text-slate-300 mb-1">Health</div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                debug.playerDown
                  ? 'bg-gray-500'
                  : playerHealthPercent > 30
                    ? 'bg-gradient-to-r from-green-500 to-lime-400'
                    : 'bg-gradient-to-r from-red-600 to-orange-400'
              }`}
              style={{ width: `${Math.max(0, playerHealthPercent)}%` }}
            />
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {debug.playerHealth.toFixed(0)} / 100
            {debug.playerDown && ' (DOWN)'}
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold text-slate-300 mb-1">Energy</div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-200"
              style={{ width: `${Math.min(100, (debug.energy / 100) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Right side: Combat info (shown during encounter) */}
      {debug.stage === 'encounter' && (
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex flex-col gap-3">
          {/* Fang HP + Behavior */}
          <div className="flex flex-col gap-1 bg-black/60 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-xs font-semibold text-slate-300">Fang</div>
            <div className="text-[10px] text-slate-400 mb-1">{debug.fangBehavior}</div>
            <div className="h-3 w-40 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300"
                style={{ width: `${Math.max(0, fangHealthPercent)}%` }}
              />
            </div>
            <div className="text-xs text-slate-400 mt-1">{debug.fangHealth.toFixed(0)} / 100</div>
          </div>
        </div>
      )}

      {/* Memory Trace indicator */}
      {debug.stage === 'memory-trace' && (
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-purple-900/60 border border-purple-500/50 rounded-lg px-4 py-2 backdrop-blur-sm">
          <div className="text-sm font-semibold text-purple-300">
            {debug.memoryTraceActivated ? '✓ Memory Trace Complete' : '◆ Memory Trace Ready'}
          </div>
        </div>
      )}

      {/* Extraction indicator */}
      {debug.stage === 'extraction' && (
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-green-900/60 border border-green-500/50 rounded-lg px-4 py-2 backdrop-blur-sm">
          <div className="text-sm font-semibold text-green-300">➤ Extraction Ready</div>
        </div>
      )}
    </div>
  );
}

function DeveloperDiagnostics({
  debug,
  isCollapsed,
  setIsCollapsed,
}: {
  debug: VerticalSliceDebugSnapshot;
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
}) {
  return (
    <div
      data-testid="vertical-slice-debug-hud"
      className="absolute bottom-3 left-3 z-40 rounded-xl border border-purple-500/30 bg-black/80 px-3 py-2 font-mono text-[10px] text-slate-200 pointer-events-auto cursor-pointer"
      onClick={() => setIsCollapsed(!isCollapsed)}
    >
      <div className="font-bold text-purple-300 flex items-center justify-between gap-2">
        <span>DIAGNOSTICS</span>
        <span className="text-xs">{isCollapsed ? '▶' : '▼'}</span>
      </div>

      {!isCollapsed && (
        <div className="mt-1.5 space-y-0.5">
          <div data-testid="slice-hero">Hero: {debug.hero.toUpperCase()}</div>
          <div data-testid="slice-stage">Stage: {debug.stage}</div>
          <div data-testid="slice-position">Pos: ({debug.position.map((value) => value.toFixed(2)).join(', ')})</div>
          <div data-testid="slice-mode">Mode: {debug.locomotionMode}</div>
          <div data-testid="slice-wall">Wall: {debug.wallCrawling ? 'YES' : 'NO'}</div>
          <div data-testid="slice-webzip">Web Zip: {debug.webZipping ? 'YES' : 'NO'}</div>
          <div data-testid="slice-ground-charge">Ground Charge: {debug.groundCharges ?? 'N/A'}</div>
          <div data-testid="slice-air-charge">Air Charge: {debug.airCharges ?? 'N/A'}</div>
          <div data-testid="slice-energy">Energy: {debug.energy.toFixed(1)}</div>
          <div data-testid="slice-player-health">Player HP: {debug.playerHealth.toFixed(0)}</div>
          <div data-testid="slice-player-down">Player Down: {debug.playerDown ? 'YES' : 'NO'}</div>
          <div data-testid="slice-fang-health">Fang HP: {debug.fangHealth.toFixed(0)}</div>
          <div data-testid="slice-fang-behavior">Fang: {debug.fangBehavior}</div>
          <div data-testid="slice-fang-windup">Windup: {debug.fangWindup.toFixed(2)}</div>
          <div data-testid="slice-memory">Memory Trace: {debug.memoryTraceActivated ? 'COMPLETE' : 'PENDING'}</div>
          <div data-testid="slice-extraction">Extraction: {debug.extractionUnlocked ? 'OPEN' : 'LOCKED'}</div>
          <div data-testid="slice-fps">FPS: {debug.fps.toFixed(1)}</div>
        </div>
      )}
    </div>
  );
}

export default function RagingCityVerticalSliceScene({
  forcedCharacter,
}: {
  forcedCharacter?: VerticalSliceHero;
}) {
  const [debug, setDebug] = useState<VerticalSliceDebugSnapshot>({
    ...INITIAL_DEBUG,
    hero: forcedCharacter ?? 'INVALID',
  });
  const [diagnosticsCollapsed, setDiagnosticsCollapsed] = useState(false);
  const handleDebug = useCallback(
    (snapshot: VerticalSliceDebugSnapshot) => setDebug(snapshot),
    []
  );

  return (
    <div className="relative w-full h-screen bg-[#080a10]">
      <Canvas shadows camera={{ position: [0, 5, -30], fov: 52, near: 0.1, far: 220 }}>
        <Suspense fallback={null}>
          <VerticalSliceEnvironment forcedCharacter={forcedCharacter} onDebug={handleDebug} />
        </Suspense>
      </Canvas>

      <PlayerHUD debug={debug} forcedCharacter={forcedCharacter} />
      <DeveloperDiagnostics
        debug={debug}
        isCollapsed={diagnosticsCollapsed}
        setIsCollapsed={setDiagnosticsCollapsed}
      />
    </div>
  );
}

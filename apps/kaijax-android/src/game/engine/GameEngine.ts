import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { AudioEngine } from '../audio/AudioEngine';
import { HERO_ABILITIES } from '../data/abilitiesData';
import {
  FUSION_AWAKENING_DIALOGUE,
  MISSION_1_STEPS,
  MISSION_1_VICTORY_DIALOGUE,
} from '../data/missionsData';
import {
  ComboState,
  createInitialComboState,
  getComboCombatBenefits,
  registerComboHit,
  registerCommittedWhiff,
  resetComboOnDamage,
  tickComboDecay,
} from '../combat/comboSystem';
import {
  DEFAULT_GAMEPAD_BINDINGS,
  GamepadInputPoller,
} from '../combat/combatInputMapper';
import {
  CombatInputBufferState,
  bufferCombatAction,
  canCancelAttackIntoDodge,
  clearCombatBuffer,
  consumeBufferedAction,
  createCombatInputBuffer,
  tickCombatBuffer,
} from '../combat/combatInputBuffer';
import {
  ActiveFinisherExecution,
  DuoSynergyState,
  addDuoSynergy,
  createInitialDuoSynergyState,
  interruptDuoFinisher,
  registerChordInput,
  stepDuoFinisher,
  tryStartDuoFinisher,
} from '../combat/duoSynergySystem';
import {
  ARCHETYPE_CONFIGS,
  allocateAttackTokens,
  computeEnemySeparationVector,
  evaluateEnemyDefensiveReaction,
} from '../combat/enemyCombatDirector';
import {
  CounterWindowState,
  PARRY,
  applyGuardBreakToShield,
  consumeCounterWindow,
  createCounterWindowState,
  openCounterWindow,
  parryWindowFor,
  resolveIncomingStrike,
  tickCounterWindow,
} from '../combat/parry';
import {
  computePredatorPullResult,
  computeWebThrowAndWallPin,
  getEnemyWebResistance,
  isLineObstructedByColliders,
  shouldAutoReleaseTether,
  validateGrappleAnchor,
} from '../combat/webInteractionSystem';
import { computeHeroStats } from '../save/SaveManager';
import {
  DialogueLine,
  EnemyArchetype,
  FloatingDamage,
  GameSettings,
  HeroId,
  HudSnapshot,
  SaveSlotData,
} from '../types';
import { COSMETIC_PRESETS } from '../data/itemsData';
import { ArticulatedEnemyRig, ArticulatedHeroRig, createEnemyRig, createHeroRig } from './CharacterBuilder';
import { CharacterMotionSample, GLBCharacterInstance } from './GLBCharacterController';
import { createProceduralTextures, WorldTextureSet } from './ProceduralTextures';
import { AshblockWorld, buildAshblockHeights } from './WorldBuilder';

interface EnemyEntity {
  id: string;
  name: string;
  kind: EnemyArchetype;
  stageTag: number;
  rig: ArticulatedEnemyRig;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  hp: number;
  maxHp: number;
  armor: number;
  maxArmor: number;
  shieldHp: number;
  maxShieldHp: number;
  attackPower: number;
  speed: number;
  state: 'idle' | 'chase' | 'windup' | 'attack' | 'recover' | 'stagger' | 'dead';
  stateTimer: number;
  burnTimer: number;
  snareTimer: number;
  stunTimer: number;
  wallPinnedTimer: number;
  juggleTimer: number;
  phase: 1 | 2;
  attackPattern: number;
  attackCount: number;
  unblockableWindup: boolean;
  hitFlash: number;
  deadTimer: number;
}

interface ParticleBurst {
  mesh: THREE.Mesh;
  vel: THREE.Vector3;
  life: number;
  maxLife: number;
  active: boolean;
}

export interface EngineCallbacks {
  onHudUpdate: (snapshot: HudSnapshot) => void;
  onTriggerDialogue: (lines: DialogueLine[], onComplete?: () => void) => void;
  onSaveProgress: (patch: Partial<SaveSlotData>, silent?: boolean) => void;
  onGrantRewards: (xp: number, materials?: Record<string, number>, fragment?: number) => void;
  onTogglePause: () => void;
}

// Pre-allocated scratch math helpers (Zero GC in render loop)
const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _v3 = new THREE.Vector3();
const _v4 = new THREE.Vector3();
const _camFwd = new THREE.Vector3();
const _camRight = new THREE.Vector3();
const _rayOrigin = new THREE.Vector3();
const _rayDir = new THREE.Vector3();
const _colorScratch = new THREE.Color();

function createMotionSample(showcaseMode = false): CharacterMotionSample {
  return {
    planarSpeed: 0,
    sprinting: false,
    grounded: true,
    verticalVel: 0,
    isWallRunning: false,
    isSwinging: false,
    dodgeActive: false,
    parryActive: false,
    attackType: 'none',
    comboStep: 0,
    attackActive: false,
    hurtActive: false,
    thryxenActive: false,
    shadowInked: false,
    isVictory: false,
    isDefeat: false,
    showcaseMode,
  };
}

export class GameEngine {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private textures: WorldTextureSet;
  private world: AshblockWorld;
  private audio: AudioEngine;
  private callbacks: EngineCallbacks;
  private settings: GameSettings;
  private save: SaveSlotData;

  private isSoftwareGl: boolean;
  private frameId = 0;
  private disposed = false;
  private paused = false;
  private titleShowcaseMode = true;
  private clock = new THREE.Clock();
  private lastTickTime = 0;
  private fpsAccum = 0;
  private fpsFrames = 0;
  private fpsEstimate = 60;
  private frameTimesRing = new Float32Array(120);
  private frameRingIdx = 0;
  private frameRingCount = 0;
  private onePercentLowFps = 60;
  private lowFpsDuration = 0;
  private adaptiveScaleApplied = false;

  // Production Rigged GLB Controllers + Zero-Pop-In Fallback Rigs
  private kaiRig: ArticulatedHeroRig;
  private jaxRig: ArticulatedHeroRig;
  private kaiJaxRig: ArticulatedHeroRig;
  private kaiGlb: GLBCharacterInstance;
  private jaxGlb: GLBCharacterInstance;
  private kaiJaxGlb: GLBCharacterInstance;
  private borynGlb: GLBCharacterInstance;
  private boraxGlb: GLBCharacterInstance;
  private playerMotionSample: CharacterMotionSample = createMotionSample(false);
  private companionMotionSample: CharacterMotionSample = createMotionSample(false);
  private showcaseMotionSample: CharacterMotionSample = createMotionSample(true);
  private playerHurtFlash = 0;
  private lockReticle: THREE.Mesh;
  private webLine: THREE.Line;
  private webLineGeo: THREE.BufferGeometry;
  private objectiveBeacon: THREE.Mesh;

  // Player & Companion State
  private activeHero: HeroId = 'kai';
  private baseHero: 'kai' | 'jax' = 'kai';
  private playerPos = new THREE.Vector3(0, 0, 10);
  private playerVel = new THREE.Vector3();
  private playerYaw = Math.PI; // Facing North (-Z)
  private grounded = true;
  private jumpsUsed = 0;
  private companionPos = new THREE.Vector3(2.2, 0, 11.5);
  private companionVel = new THREE.Vector3();
  private companionYaw = Math.PI;
  private companionAttackCd = 0;

  private kaiHp = 140;
  private kaiMaxHp = 140;
  private kaiEnergy = 115;
  private kaiMaxEnergy = 115;
  private jaxHp = 175;
  private jaxMaxHp = 175;
  private jaxEnergy = 95;
  private jaxMaxEnergy = 95;

  private fusionCharge = 35;
  private isFused = false;
  private fusionTimeLeft = 0;
  private fusionCooldown = 0;
  private fusionAwakenedTriggered = false;

  // Combat, Defense, Web/Storm & Duo Synergy States
  private attackTimer = 0;
  private attackComboStep = 0;
  private comboResetTimer = 0;
  private comboState: ComboState = createInitialComboState();
  private duoSynergy: DuoSynergyState = createInitialDuoSynergyState(25);
  private activeFinisher: ActiveFinisherExecution | null = null;
  private counterWindow: CounterWindowState = createCounterWindowState();
  private blockHeld = false;
  private tacticalCooldown = 0;
  private webVisualTimer = 0;
  private webVisualEnd = new THREE.Vector3();
  private repeatLightStrikes = 0;
  private dodgeTimer = 0;
  private dodgeCooldown = 0;
  private parryWindow = 0;
  private shadowInkTimer = 0;
  private thryxenTimer = 0;
  private abilityCooldowns: [number, number, number] = [0, 0, 0];
  private activeAttackType: 'none' | 'light' | 'heavy' | 'air' | 'ability' = 'none';
  private activeMoveIsGuardBreak = false;
  private attackHitApplied = false;
  private combatBuffer: CombatInputBufferState = createCombatInputBuffer();

  // Traversal States
  private isSwinging = false;
  private swingAnchorPos = new THREE.Vector3();
  private swingSupportPos = new THREE.Vector3();
  private swingRopeLength = 6.5;
  private swingPeakSpeed = 0;
  private zipActive = false;
  private zipTargetPos = new THREE.Vector3();
  private zipTimer = 0;
  private zipCompletedCount = 0;
  private coyoteTimer = 0;
  private jumpBufferTimer = 0;
  private dodgeCancelCount = 0;
  private lastInputResponseMs = 0;
  private isWallRunning = false;
  private wallRunTimer = 0;
  private activeWebAnchorId: string | null = null;
  private activeWebAttachmentType: string | null = null;

  // Camera
  private camYaw = 0; // Looking North (-Z)
  private camPitch = 0.34;
  private camDistance = 7.4;
  private camCurrentPos = new THREE.Vector3(0, 4, 17);
  private camLookTarget = new THREE.Vector3(0, 1.5, 10);
  private camLookAhead = new THREE.Vector3();
  private switchCamOffset = new THREE.Vector3();
  private screenShake = 0;
  private lockedEnemyId: string | null = null;
  private hitstopTimer = 0;
  private lastTurnYawDelta = 0;
  private lastLandingImpact = 0;
  private strideDustTimer = 0;

  // Input
  private keys = new Set<string>();
  private touchMove = { x: 0, y: 0 };
  private touchSprint = false;
  private gamepadPoller = new GamepadInputPoller();
  private hudEmitTimer = 0;

  // Entities & Pooled VFX
  private enemies: EnemyEntity[] = [];
  private particlePool: ParticleBurst[] = [];
  private floatingDamages: FloatingDamage[] = [];
  private nextDamageId = 1;
  private isGameOver = false;
  private isVictory = false;
  private webglContextLost = false;
  private parryCount = 0;
  private evadeCount = 0;
  private hitsTaken = 0;
  private maxCombo = 0;
  private duoFinishersUsed = 0;
  private wallPinsCount = 0;
  private guardBreaksCount = 0;
  private environmentalTakedownsCount = 0;
  private styleScoreBest = 0;
  private bossIntroShown = false;

  constructor(
    container: HTMLElement,
    initialSave: SaveSlotData,
    initialSettings: GameSettings,
    audio: AudioEngine,
    callbacks: EngineCallbacks
  ) {
    this.container = container;
    this.save = initialSave;
    this.settings = initialSettings;
    this.audio = audio;
    this.callbacks = callbacks;

    this.isSoftwareGl = (() => {
      const probe = document.createElement('canvas').getContext('webgl2');
      if (!probe) return true;
      const ext = probe.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probe.RENDERER;
      const gpu = String(probe.getParameter(param));
      probe.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = Math.max(1, container.clientWidth);
    const height = Math.max(1, container.clientHeight);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1b1528);
    this.scene.fog = new THREE.FogExp2(0x281c30, 0.0088);

    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.15, 260);

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl && initialSettings.graphicsQuality !== 'low',
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(width, height);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.18;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.applyGraphicsSettings(initialSettings);

    container.appendChild(this.renderer.domElement);

    // WebGL Context Loss safety
    this.renderer.domElement.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      this.webglContextLost = true;
      this.paused = true;
      this.emitHudSnapshot();
    });
    this.renderer.domElement.addEventListener('webglcontextrestored', () => {
      this.webglContextLost = false;
      this.paused = false;
      this.emitHudSnapshot();
    });

    // Mandatory RoomEnvironment IBL
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // 3-Point Golden-Dusk / Cool-Violet Atmospheric Lighting Rig (d438c610.png & f9d37a6e.png)
    const hemi = new THREE.HemisphereLight(0x637ec2, 0x2b1b14, 0.92);
    this.scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xffd29e, 2.15);
    keyLight.position.set(22, 34, 18);
    keyLight.castShadow = !this.isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 2;
    keyLight.shadow.camera.far = 105;
    keyLight.shadow.camera.left = -38;
    keyLight.shadow.camera.right = 38;
    keyLight.shadow.camera.top = 38;
    keyLight.shadow.camera.bottom = -38;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    this.scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x8b5cf6, 1.05);
    rimLight.position.set(-18, 16, -48);
    this.scene.add(rimLight);

    // Procedural Textures + World (supports both P1-K 'reconstructed' modular GLBs and 'legacy' comparison mode)
    const maxAniso = this.renderer.capabilities.getMaxAnisotropy();
    this.textures = createProceduralTextures(maxAniso);
    this.world = buildAshblockHeights(
      this.scene,
      this.textures,
      initialSettings.environmentMode ?? 'reconstructed'
    );
    this.world.setQualityTier(initialSettings.graphicsQuality);

    // Production Rigged GLB Character Instances (with procedural rigs as instant zero-pop-in fallback)
    this.kaiRig = createHeroRig('kai', this.textures.contactShadowMap);
    this.jaxRig = createHeroRig('jax', this.textures.contactShadowMap);
    this.kaiJaxRig = createHeroRig('kaijax', this.textures.contactShadowMap);

    this.kaiGlb = new GLBCharacterInstance('kai', this.textures.contactShadowMap, this.kaiRig.root);
    this.jaxGlb = new GLBCharacterInstance('jax', this.textures.contactShadowMap, this.jaxRig.root);
    this.kaiJaxGlb = new GLBCharacterInstance('kaijax', this.textures.contactShadowMap, this.kaiJaxRig.root);
    this.borynGlb = new GLBCharacterInstance('boryn', this.textures.contactShadowMap);
    this.boraxGlb = new GLBCharacterInstance('borax', this.textures.contactShadowMap);

    this.kaiJaxGlb.root.visible = false;
    this.scene.add(this.kaiGlb.root);
    this.scene.add(this.jaxGlb.root);
    this.scene.add(this.kaiJaxGlb.root);
    this.scene.add(this.borynGlb.root);
    this.scene.add(this.boraxGlb.root);

    this.refreshCharacterGlbQuality();

    // Lock-on Reticle
    this.lockReticle = new THREE.Mesh(
      new THREE.RingGeometry(0.7, 0.92, 24),
      new THREE.MeshBasicMaterial({
        color: 0xd4af37,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
      })
    );
    this.lockReticle.rotation.x = -Math.PI / 2;
    this.lockReticle.visible = false;
    this.scene.add(this.lockReticle);

    // Web Swing Tether Line
    this.webLineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(),
      new THREE.Vector3(0, 5, 0),
    ]);
    this.webLine = new THREE.Line(
      this.webLineGeo,
      new THREE.LineBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.95 })
    );
    this.webLine.visible = false;
    this.scene.add(this.webLine);

    // Objective Waypoint Beam
    this.objectiveBeacon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.55, 12, 12, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0xd4af37,
        transparent: true,
        opacity: 0.28,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    this.scene.add(this.objectiveBeacon);

    // Pre-allocate Particle Pool (zero runtime allocation)
    const pGeo = new THREE.OctahedronGeometry(0.14, 0);
    for (let i = 0; i < 64; i++) {
      const pMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.9 });
      const mesh = new THREE.Mesh(pGeo, pMat);
      mesh.visible = false;
      this.scene.add(mesh);
      this.particlePool.push({
        mesh,
        vel: new THREE.Vector3(),
        life: 0,
        maxLife: 0.5,
        active: false,
      });
    }

    // Apply Save State & Spawn Initial Enemies
    this.loadSaveState(initialSave);

    // Pre-compile shaders on GPU
    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    this.bindInputListeners();
    this.handleResize();
    if (typeof window !== 'undefined') {
      (window as unknown as Record<string, unknown>).__KAIJAX_ENGINE__ = this;
    }
    this.startLoop();
  }

  public setTitleShowcase(active: boolean): void {
    this.titleShowcaseMode = active;
    if (active) {
      this.audio.setMood('title');
      // Canonical Character Visual Library Lineup framed in the open right-center 3D stage beside the Title Card
      this.kaiGlb.root.position.set(0.15, 0, 8.65);
      this.jaxGlb.root.position.set(1.85, 0, 8.65);
      this.kaiGlb.root.rotation.y = -0.06;
      this.jaxGlb.root.rotation.y = -0.22;
      this.kaiGlb.root.visible = true;
      this.jaxGlb.root.visible = true;
      this.kaiJaxGlb.root.visible = false;

      this.borynGlb.root.position.set(-1.35, 0, 7.35);
      this.borynGlb.root.rotation.y = 0.14;
      this.borynGlb.root.visible = true;

      this.boraxGlb.root.position.set(3.45, 0, 7.35);
      this.boraxGlb.root.rotation.y = -0.32;
      this.boraxGlb.root.visible = true;
    } else {
      this.placeMentorsInDistrict();
      this.syncHeroRigVisibility();
      this.audio.setMood('explore');
    }
  }

  private placeMentorsInDistrict(): void {
    this.borynGlb.root.position.copy(this.world.borynMentorPos);
    this.borynGlb.root.rotation.y = -0.65;
    this.borynGlb.root.visible = true;

    this.boraxGlb.root.position.copy(this.world.boraxMentorPos);
    this.boraxGlb.root.rotation.y = 0.72;
    this.boraxGlb.root.visible = true;
  }

  private refreshCharacterGlbQuality(): void {
    const maxAniso = this.renderer.capabilities.getMaxAnisotropy();
    const castShadows = !this.isSoftwareGl && this.settings.graphicsQuality !== 'low';
    const preferLod1 = this.isSoftwareGl || this.settings.graphicsQuality === 'low';
    const modelVer = this.settings.characterModelVersion ?? 'p1i_reconstructed';
    const forceFallback = modelVer === 'procedural_fallback';
    void this.kaiGlb.loadForQuality(this.settings.graphicsQuality, maxAniso, castShadows, preferLod1, forceFallback, modelVer);
    void this.jaxGlb.loadForQuality(this.settings.graphicsQuality, maxAniso, castShadows, preferLod1, forceFallback, modelVer);
    void this.kaiJaxGlb.loadForQuality(this.settings.graphicsQuality, maxAniso, castShadows, preferLod1, forceFallback, modelVer);
    void this.borynGlb.loadForQuality(this.settings.graphicsQuality, maxAniso, castShadows, preferLod1, forceFallback, modelVer);
    void this.boraxGlb.loadForQuality(this.settings.graphicsQuality, maxAniso, castShadows, preferLod1, forceFallback, modelVer);
  }

  private applyActiveCosmeticToRigs(): void {
    const preset = COSMETIC_PRESETS.find((c) => c.id === this.save.activeCosmeticId) ?? COSMETIC_PRESETS[0];
    if (!preset) return;
    this.kaiGlb.applyCosmeticTrim(preset.accentHex, preset.trimHex);
    this.jaxGlb.applyCosmeticTrim(preset.accentHex, preset.trimHex);
    this.kaiJaxGlb.applyCosmeticTrim(preset.accentHex, preset.trimHex);
  }

  public setPaused(p: boolean): void {
    this.paused = p;
  }

  public applyGraphicsSettings(settings: GameSettings): void {
    this.settings = settings;
    this.adaptiveScaleApplied = false;
    this.lowFpsDuration = 0;
    const dprCap =
      this.isSoftwareGl || settings.graphicsQuality === 'low'
        ? 1
        : settings.graphicsQuality === 'balanced'
          ? Math.min(window.devicePixelRatio, 1.5)
          : Math.min(window.devicePixelRatio, 2);
    this.renderer.setPixelRatio(dprCap);
    this.renderer.shadowMap.enabled = !this.isSoftwareGl && settings.graphicsQuality !== 'low';
    if (this.world) {
      this.world.setEnvironmentMode(settings.environmentMode ?? 'reconstructed');
      this.world.setQualityTier(settings.graphicsQuality);
    }
    if (this.kaiGlb) {
      this.refreshCharacterGlbQuality();
    }
  }

  public setEnvironmentMode(mode: 'reconstructed' | 'legacy'): void {
    this.settings = { ...this.settings, environmentMode: mode };
    this.world.setEnvironmentMode(mode);
    this.emitHudSnapshot();
  }

  public getPerformanceMetrics() {
    return {
      fpsEstimate: this.fpsEstimate,
      onePercentLowFps: this.onePercentLowFps,
      drawCalls: this.renderer.info.render.calls,
      activeTriangles: this.renderer.info.render.triangles,
      geometries: this.renderer.info.memory.geometries,
      textures: this.renderer.info.memory.textures,
      adaptiveScaleApplied: this.adaptiveScaleApplied,
      isSoftwareGl: this.isSoftwareGl,
    };
  }

  public getQualificationDiagnostics() {
    return {
      activeHero: this.activeHero,
      isFused: this.isFused,
      characterModelVersion: this.settings.characterModelVersion ?? 'p1i_reconstructed',
      environmentMode: this.world.environmentMode,
      qualityTier: this.world.qualityTier,
      modularKitLoadedCount: this.world.modularKitLoadedCount,
      modularKitExpectedCount: this.world.modularKitExpectedCount,
      instancedPropCount: this.world.instancedPropCount,
      deduplicatedMaterialCount: this.world.deduplicatedMaterialCount,
      walkableZonesCount: this.world.walkableZones.length,
      activeClips: {
        kai: this.kaiGlb.getCurrentClip(),
        jax: this.jaxGlb.getCurrentClip(),
        kaijax: this.kaiJaxGlb.getCurrentClip(),
      },
      kaiJaxSecondaryBones: this.kaiJaxGlb.getSecondaryBoneCounts(),
      webTraversal: {
        isSwinging: this.isSwinging,
        zipActive: this.zipActive,
        swingPeakSpeed: Number(this.swingPeakSpeed.toFixed(2)),
        zipCompletedCount: this.zipCompletedCount,
        dodgeCancelCount: this.dodgeCancelCount,
        lastInputResponseMs: Number(this.lastInputResponseMs.toFixed(3)),
        activeWebAnchorId: this.activeWebAnchorId,
        activeWebAttachmentType: this.activeWebAttachmentType,
        anchorsTotal: this.world.webAnchors.length,
        allAnchorsGeometryAttached: this.world.webAnchors.every(
          (a) => Boolean(a.attachedStructureId) && a.position.distanceTo(a.supportPoint) <= 0.45
        ),
      },
      environmentalTakedownsCount: this.environmentalTakedownsCount,
      loadedCharacterGlbs: {
        kai: { status: this.kaiGlb.status, url: this.kaiGlb.loadedUrl, tris: this.kaiGlb.triangleCount, bones: this.kaiGlb.boneCount },
        jax: { status: this.jaxGlb.status, url: this.jaxGlb.loadedUrl, tris: this.jaxGlb.triangleCount, bones: this.jaxGlb.boneCount },
        kaijax: { status: this.kaiJaxGlb.status, url: this.kaiJaxGlb.loadedUrl, tris: this.kaiJaxGlb.triangleCount, bones: this.kaiJaxGlb.boneCount },
        boryn: { status: this.borynGlb.status, url: this.borynGlb.loadedUrl, tris: this.borynGlb.triangleCount, bones: this.borynGlb.boneCount },
        borax: { status: this.boraxGlb.status, url: this.boraxGlb.loadedUrl, tris: this.boraxGlb.triangleCount, bones: this.boraxGlb.boneCount },
      },
      playerPos: [
        Number(this.playerPos.x.toFixed(2)),
        Number(this.playerPos.y.toFixed(2)),
        Number(this.playerPos.z.toFixed(2)),
      ],
      companionPos: [
        Number(this.companionPos.x.toFixed(2)),
        Number(this.companionPos.y.toFixed(2)),
        Number(this.companionPos.z.toFixed(2)),
      ],
      grounded: this.grounded,
      comboCount: this.comboState.count,
      duoSynergy: Math.round(this.duoSynergy.meter),
      activeFinisher: this.activeFinisher?.finisher.id ?? null,
      bufferedAction: this.combatBuffer.action,
      aliveEnemies: this.enemies
        .filter((e) => e.state !== 'dead')
        .map((e) => ({
          id: e.id,
          kind: e.kind,
          hp: Math.round(e.hp),
          shieldHp: Math.round(e.shieldHp),
          state: e.state,
          wallPinned: e.wallPinnedTimer > 0,
          juggled: e.juggleTimer > 0,
          pos: [Number(e.pos.x.toFixed(2)), Number(e.pos.y.toFixed(2)), Number(e.pos.z.toFixed(2))],
        })),
      characterGlbStatus: {
        kai: this.kaiGlb.status,
        jax: this.jaxGlb.status,
        kaijax: this.kaiJaxGlb.status,
        boryn: this.borynGlb.status,
        borax: this.boraxGlb.status,
      },
      perf: this.getPerformanceMetrics(),
    };
  }

  public teleportForQualification(x: number, y: number, z: number, synergy?: number): void {
    if (this.activeFinisher) {
      this.activeFinisher = interruptDuoFinisher(this.activeFinisher);
      this.activeFinisher = null;
    }
    this.playerPos.set(x, y, z);
    this.playerVel.set(0, 0, 0);
    if (y >= 5.0 && Math.abs(x) < 12.2) {
      this.companionPos.set(x - 1.85, y, z);
    } else {
      this.companionPos.set(x + 1.9, y, z + 1.4);
    }
    this.companionVel.set(0, 0, 0);
    this.grounded = true;
    if (typeof synergy === 'number') {
      this.duoSynergy = {
        ...this.duoSynergy,
        meter: THREE.MathUtils.clamp(synergy, 0, 100),
      };
    }
    this.syncHeroRigVisibility();
    this.emitHudSnapshot();
  }

  public stepSimulationForQualification(dtSeconds = 1 / 60, steps = 1, renderFinal = true): void {
    const clampedDt = Math.min(Math.max(dtSeconds, 0.004), 0.05);
    for (let i = 0; i < steps; i++) {
      this.clock.elapsedTime += clampedDt;
      const simElapsed = this.clock.elapsedTime;
      if (this.titleShowcaseMode) {
        this.updateTitleShowcase(clampedDt, simElapsed);
      } else if (!this.paused) {
        this.updateGameplay(clampedDt, simElapsed);
      }
      this.world.updateVisuals(simElapsed, clampedDt, this.camera.position);
    }
    if (renderFinal) {
      this.renderer.render(this.scene, this.camera);
    }
    this.emitHudSnapshot();
  }

  public loadSaveState(save: SaveSlotData): void {
    this.save = save;
    this.baseHero = save.activeHero;
    this.activeHero = save.activeHero;
    this.isFused = false;
    this.fusionTimeLeft = 0;
    this.fusionAwakenedTriggered = save.fusionUnlocked;
    this.isGameOver = false;
    this.isVictory = false;
    this.comboState = createInitialComboState();
    this.combatBuffer = clearCombatBuffer(this.combatBuffer);
    this.switchCamOffset.set(0, 0, 0);
    this.duoSynergy = createInitialDuoSynergyState(save.duoSynergySaved ?? 25);
    if (this.activeFinisher) {
      this.activeFinisher = interruptDuoFinisher(this.activeFinisher);
      this.activeFinisher = null;
    }
    this.counterWindow = createCounterWindowState();
    this.blockHeld = false;
    this.repeatLightStrikes = 0;
    this.parryCount = save.combatStats?.parryCount ?? 0;
    this.evadeCount = save.combatStats?.evadeCount ?? 0;
    this.hitsTaken = save.combatStats?.hitsTaken ?? 0;
    this.maxCombo = save.combatStats?.maxCombo ?? 0;
    this.duoFinishersUsed = save.combatStats?.duoFinishersUsed ?? 0;
    this.wallPinsCount = save.combatStats?.wallPinsCount ?? 0;
    this.guardBreaksCount = save.combatStats?.guardBreaksCount ?? 0;
    this.styleScoreBest = save.combatStats?.styleScoreBest ?? 0;

    const kStats = computeHeroStats('kai', save.heroes.kai);
    const jStats = computeHeroStats('jax', save.heroes.jax);
    this.kaiMaxHp = kStats.maxHp;
    this.kaiHp = kStats.maxHp;
    this.kaiMaxEnergy = kStats.maxEnergy;
    this.kaiEnergy = kStats.maxEnergy;
    this.jaxMaxHp = jStats.maxHp;
    this.jaxHp = jStats.maxHp;
    this.jaxMaxEnergy = jStats.maxEnergy;
    this.jaxEnergy = jStats.maxEnergy;

    this.playerPos.set(save.checkpointPos[0], save.checkpointPos[1], save.checkpointPos[2]);
    this.companionPos.set(save.checkpointPos[0] + 2.2, save.checkpointPos[1], save.checkpointPos[2] + 1.5);
    this.playerVel.set(0, 0, 0);

    // Restore world props based on mission stage
    const stage = save.missionStageIndex;
    this.world.memorySiteReconstructed = stage >= 3 || save.missionCompleted;
    this.world.alleyGateOpen = stage >= 4 || save.missionCompleted;
    this.world.alleyGateBarrier.visible = !this.world.alleyGateOpen;
    if (stage >= 2 || save.missionCompleted) {
      this.world.civilians.forEach((c) => {
        c.rescued = true;
        c.group.visible = false;
      });
    } else {
      this.world.civilians.forEach((c) => {
        c.rescued = false;
        c.group.visible = true;
      });
    }

    this.respawnStageEnemies(stage);
    this.applyActiveCosmeticToRigs();
    if (!this.titleShowcaseMode) {
      this.placeMentorsInDistrict();
      this.syncHeroRigVisibility();
    } else {
      this.setTitleShowcase(true);
    }
  }

  public syncSaveMetadata(save: SaveSlotData): void {
    this.save = save;
    const kStats = computeHeroStats('kai', save.heroes.kai);
    const jStats = computeHeroStats('jax', save.heroes.jax);
    const kDiff = kStats.maxHp - this.kaiMaxHp;
    const jDiff = jStats.maxHp - this.jaxMaxHp;
    this.kaiMaxHp = kStats.maxHp;
    this.kaiHp = Math.min(this.kaiMaxHp, this.kaiHp + Math.max(0, kDiff));
    this.kaiMaxEnergy = kStats.maxEnergy;
    this.jaxMaxHp = jStats.maxHp;
    this.jaxHp = Math.min(this.jaxMaxHp, this.jaxHp + Math.max(0, jDiff));
    this.jaxMaxEnergy = jStats.maxEnergy;
    this.applyActiveCosmeticToRigs();
  }

  private clearEnemies(): void {
    for (const e of this.enemies) {
      this.scene.remove(e.rig.root);
    }
    this.enemies = [];
    this.lockedEnemyId = null;
  }

  public spawnPatrolSkirmish(): void {
    this.clearEnemies();
    this.isVictory = false;
    this.isGameOver = false;
    this.comboState = createInitialComboState();
    this.playerPos.set(0, 0, -18);
    this.spawnEnemy('patrol-1', 'Fang Heavy Bruiser', 'bruiser', 99, new THREE.Vector3(-4.2, 0, -28));
    this.spawnEnemy('patrol-2', 'Syndicate Shield Warden', 'shield', 99, new THREE.Vector3(4.2, 0, -30));
    this.spawnEnemy('patrol-3', 'Fang Agile Dodger', 'dodger', 99, new THREE.Vector3(-2.5, 0, -34));
    this.spawnEnemy('patrol-4', 'Fang Marksman', 'marksman', 99, new THREE.Vector3(3.5, 0, -40));
    this.spawnEnemy('patrol-5', 'Covenant Elite Assassin', 'assassin', 99, new THREE.Vector3(0, 0, -56));
  }

  private respawnStageEnemies(stage: number): void {
    this.clearEnemies();
    this.bossIntroShown = false;
    if (stage <= 0) {
      this.spawnEnemy('e-row-1', 'Fang Brawler', 'brawler', 0, new THREE.Vector3(-3, 0, -8));
      this.spawnEnemy('e-row-2', 'Fang Agile Dodger', 'dodger', 0, new THREE.Vector3(3.5, 0, -12));
      this.spawnEnemy('e-row-3', 'Fang Marksman', 'marksman', 0, new THREE.Vector3(0, 0, -18));
    } else if (stage === 1) {
      this.spawnEnemy('e-alley-1', 'Alley Shield Defender', 'shield', 1, new THREE.Vector3(-12, 0, -17));
      this.spawnEnemy('e-alley-2', 'Roof Dodger', 'dodger', 1, new THREE.Vector3(14.5, 3.3, -29));
    } else if (stage === 2) {
      this.spawnEnemy('e-rift-1', 'Memory Wraith Assassin', 'assassin', 2, new THREE.Vector3(12, 0, -35));
      this.spawnEnemy('e-rift-2', 'Syndicate Marksman', 'marksman', 2, new THREE.Vector3(17, 0, -40));
    } else if (stage === 3) {
      this.spawnEnemy('e-gate-1', 'Gate Heavy Bruiser', 'bruiser', 3, new THREE.Vector3(-3.2, 0, -43));
      this.spawnEnemy('e-gate-2', 'Gate Shield Warden', 'shield', 3, new THREE.Vector3(2.8, 0, -44));
      this.spawnEnemy('e-gate-3', 'Gate Marksman', 'marksman', 3, new THREE.Vector3(0.2, 0, -47.5));
    } else if (stage === 4 && !this.save.missionCompleted) {
      this.spawnBoss();
    }
  }

  private spawnBoss(): void {
    this.spawnEnemy('boss-enforcer', 'Fang Enforcer', 'boss', 4, new THREE.Vector3(0, 0, -74));
    this.audio.setMood('boss');
  }

  private spawnEnemy(
    id: string,
    name: string,
    kind: EnemyArchetype,
    stageTag: number,
    pos: THREE.Vector3
  ): void {
    const rig = createEnemyRig(kind, this.textures.contactShadowMap);
    rig.root.position.copy(pos);
    this.scene.add(rig.root);

    const cfg = ARCHETYPE_CONFIGS[kind];

    this.enemies.push({
      id,
      name,
      kind,
      stageTag,
      rig,
      pos: pos.clone(),
      vel: new THREE.Vector3(),
      hp: cfg.maxHp,
      maxHp: cfg.maxHp,
      armor: cfg.maxArmor,
      maxArmor: cfg.maxArmor,
      shieldHp: cfg.maxShieldHp,
      maxShieldHp: cfg.maxShieldHp,
      attackPower: cfg.attackPower,
      speed: cfg.speed,
      state: 'chase',
      stateTimer: 0.55,
      burnTimer: 0,
      snareTimer: 0,
      stunTimer: 0,
      wallPinnedTimer: 0,
      juggleTimer: 0,
      phase: 1,
      attackPattern: 0,
      attackCount: 0,
      unblockableWindup: false,
      hitFlash: 0,
      deadTimer: 0,
    });
  }

  private syncHeroRigVisibility(): void {
    this.kaiGlb.root.visible = !this.isFused;
    this.jaxGlb.root.visible = !this.isFused;
    this.kaiJaxGlb.root.visible = this.isFused;
  }

  public setTouchMove(x: number, y: number): void {
    this.touchMove.x = x;
    this.touchMove.y = y;
  }

  public setTouchSprint(s: boolean): void {
    this.touchSprint = s;
  }

  public addCameraDelta(dx: number, dy: number): void {
    const sens = 0.0065 * this.settings.touchSensitivity;
    this.camYaw -= dx * sens;
    const ySign = this.settings.invertCameraY ? -1 : 1;
    this.camPitch = THREE.MathUtils.clamp(this.camPitch + dy * sens * ySign, 0.08, 1.05);
  }

  public startDefenseInput(): void {
    if (this.paused || this.titleShowcaseMode || this.isGameOver || this.activeFinisher) return;
    const t0 = performance.now();
    this.blockHeld = true;
    this.triggerDodgeOrParry();
    this.lastInputResponseMs = performance.now() - t0;
  }

  public endDefenseInput(): void {
    this.blockHeld = false;
  }

  public triggerLightAttack(): void {
    if (this.paused || this.titleShowcaseMode || this.isGameOver || this.activeFinisher) return;
    this.audio.unlock();

    // Two-button simultaneous Attack + Ability chord detector for Duo Finisher
    const chord = registerChordInput(this.duoSynergy, 'attack', this.clock.elapsedTime);
    this.duoSynergy = chord.nextState;
    if (chord.chordTriggered && this.triggerDuoFinisher()) {
      return;
    }

    // Perfect-Parry Counter Follow-Up Window (Spider-Limb Counter / Thunder Counter / Memory Fang Counter)
    if (this.counterWindow.active) {
      const consumed = consumeCounterWindow(this.counterWindow);
      this.counterWindow = consumed.nextState;
      if (consumed.consumed) {
        this.executeParryCounterStrike(consumed.targetEnemyId);
        return;
      }
    }

    if (this.attackTimer > 0.14) {
      this.combatBuffer = bufferCombatAction(this.combatBuffer, 'light');
      return;
    }
    this.blockHeld = false;
    this.attackComboStep = (this.attackComboStep % 3) + 1;
    this.repeatLightStrikes += 1;
    this.comboResetTimer = 1.25;
    this.attackTimer = this.activeHero === 'kaijax' ? 0.23 : this.activeHero === 'kai' ? 0.25 : 0.29;
    this.activeAttackType = this.grounded ? 'light' : 'air';
    this.activeMoveIsGuardBreak = !this.grounded && this.attackComboStep === 3;
    this.attackHitApplied = false;

    const benefits = getComboCombatBenefits(this.comboState.count);
    const target = this.faceContextualFreeFlowTarget(9.2 * benefits.lungeMultiplier);

    if (this.grounded) {
      const dist = target ? target.pos.distanceTo(this.playerPos) : 0;
      const lunge = target && dist > 2.2 ? Math.min(11.5, dist * 1.45) : 5.2 * benefits.lungeMultiplier;
      this.playerVel.x = Math.sin(this.playerYaw) * lunge;
      this.playerVel.z = Math.cos(this.playerYaw) * lunge;
    } else {
      // Aerial combo juggle hang-time on steps 1 & 2, slam finisher on step 3
      this.playerVel.x = Math.sin(this.playerYaw) * 3.6;
      this.playerVel.z = Math.cos(this.playerYaw) * 3.6;
      this.playerVel.y = this.attackComboStep < 3 ? Math.max(this.playerVel.y, 3.0) : -11.5;
    }

    this.audio.playSfx(this.activeHero === 'jax' ? 'attack_jax' : 'attack_kai');
  }

  public triggerHeavyAttack(): void {
    if (this.paused || this.titleShowcaseMode || this.isGameOver || this.activeFinisher) return;
    if (this.attackTimer > 0.15) {
      this.combatBuffer = bufferCombatAction(this.combatBuffer, 'heavy');
      return;
    }
    this.audio.unlock();
    this.blockHeld = false;
    this.repeatLightStrikes = 0;

    if (this.counterWindow.active) {
      const consumed = consumeCounterWindow(this.counterWindow);
      this.counterWindow = consumed.nextState;
      if (consumed.consumed) {
        this.executeParryCounterStrike(consumed.targetEnemyId);
        return;
      }
    }

    this.attackTimer = 0.44;
    this.activeAttackType = 'heavy';
    this.activeMoveIsGuardBreak = true;
    this.attackHitApplied = false;
    const benefits = getComboCombatBenefits(this.comboState.count);
    this.faceContextualFreeFlowTarget(8.5 * benefits.lungeMultiplier);
    this.playerVel.x = Math.sin(this.playerYaw) * 6.8 * benefits.lungeMultiplier;
    this.playerVel.z = Math.cos(this.playerYaw) * 6.8 * benefits.lungeMultiplier;
    if (!this.grounded) {
      this.playerVel.y = -13.0;
    }
    this.audio.playSfx('heavy');
  }

  private executeParryCounterStrike(targetId: string | null): void {
    this.repeatLightStrikes = 0;
    this.attackTimer = 0.34;
    this.activeAttackType = 'heavy';
    this.activeMoveIsGuardBreak = true;
    this.attackHitApplied = true;

    const target =
      (targetId && this.enemies.find((e) => e.id === targetId && e.state !== 'dead')) ||
      this.findNearestEnemy(9.0);
    if (target) {
      this.playerYaw = Math.atan2(target.pos.x - this.playerPos.x, target.pos.z - this.playerPos.z);
      const d = target.pos.distanceTo(this.playerPos);
      if (d > 1.8) {
        const step = Math.min(5.5, d - 1.5);
        this.playerPos.x += Math.sin(this.playerYaw) * step;
        this.playerPos.z += Math.cos(this.playerYaw) * step;
      }
    }

    const stats = computeHeroStats(this.baseHero, this.save.heroes[this.baseHero]);
    const counterName =
      this.activeHero === 'kaijax'
        ? 'MEMORY FANG COUNTER!'
        : this.activeHero === 'jax'
          ? 'THUNDER COUNTER!'
          : 'SPIDER-LIMB COUNTER!';
    const counterColor =
      this.activeHero === 'kaijax' ? '#D4AF37' : this.activeHero === 'jax' ? '#38BDF8' : '#A855F7';

    this.audio.playSfx(this.activeHero === 'jax' ? 'lightning' : 'heavy');
    this.pushFloatingLabel(this.playerPos, counterName, counterColor);
    this.duoSynergy = addDuoSynergy(
      this.duoSynergy,
      'parry_partner_followup',
      getComboCombatBenefits(this.comboState.count).duoSynergyMultiplier
    );
    this.hitstopTimer = Math.max(this.hitstopTimer, 0.048);
    this.screenShake = Math.max(this.screenShake, 0.22);
    this.damageEnemiesInRadius(
      target ? target.pos : this.playerPos,
      3.8,
      stats.attack * 2.15,
      counterColor,
      true,
      { stun: 2.0, armorBreak: 65, moveTag: 'parry_counter' }
    );
    this.spawnParticles(target ? target.pos : this.playerPos, new THREE.Color(counterColor).getHex(), 20);
  }

  public triggerTacticalAction(): void {
    if (this.paused || this.titleShowcaseMode || this.isGameOver || this.activeFinisher) return;
    this.audio.unlock();

    // Two-button simultaneous Attack + Ability chord detector for Duo Finisher
    const chord = registerChordInput(this.duoSynergy, 'ability', this.clock.elapsedTime);
    this.duoSynergy = chord.nextState;
    if (chord.chordTriggered && this.triggerDuoFinisher()) {
      return;
    }

    if (this.tacticalCooldown > 0) {
      if (this.tacticalCooldown <= 0.22) {
        this.combatBuffer = bufferCombatAction(this.combatBuffer, 'tactical');
      }
      return;
    }
    this.blockHeld = false;
    this.repeatLightStrikes = 0;

    const ignoredGateIdx = this.world.alleyGateOpen ? this.world.alleyGateColliderIndex : -1;
    const stats = computeHeroStats(this.baseHero, this.save.heroes[this.baseHero]);
    const benefits = getComboCombatBenefits(this.comboState.count);
    const target = this.faceContextualFreeFlowTarget(14.5);

    if (this.activeHero === 'kai') {
      // 1. Guided Zipline Perch Launch onto geometry-attached anchor or elevated terrace
      if (!target || (!this.grounded && target.pos.distanceTo(this.playerPos) > 6.5)) {
        const anchor = this.findNearestValidatedWebAnchor(20.0);
        if (anchor) {
          this.tacticalCooldown = 1.05;
          this.isSwinging = false;
          this.zipActive = true;
          this.zipTimer = 0.48;
          this.activeWebAnchorId = anchor.id;
          this.activeWebAttachmentType = anchor.attachmentType;
          this.swingSupportPos.copy(anchor.supportPoint);
          this.zipTargetPos.copy(anchor.perchLandingPos ?? anchor.position);
          _v1.subVectors(this.zipTargetPos, this.playerPos).normalize();
          this.playerYaw = Math.atan2(_v1.x, _v1.z);
          this.playerVel.copy(_v1).multiplyScalar(21.5);
          this.grounded = false;
          this.webVisualTimer = 0.48;
          this.webVisualEnd.copy(anchor.supportPoint);
          this.webLine.visible = true;
          this.audio.playSfx('web');
          this.pushFloatingLabel(this.playerPos, 'ZIP TO ANCHOR', '#F97316');
          this.bumpTraversalMastery();
          return;
        }
      }

      if (!target) {
        // Forward Web Evade / Zip
        this.tacticalCooldown = 1.0;
        this.playerVel.x = Math.sin(this.playerYaw) * 14.5;
        this.playerVel.z = Math.cos(this.playerYaw) * 14.5;
        this.audio.playSfx('web');
        return;
      }

      const dist = target.pos.distanceTo(this.playerPos);
      this.showWebTetherBurst(target.pos);
      this.audio.playSfx('web');

      // 2. Snared or close-quarters enemy -> Web Throw & Wall Pin!
      if (target.snareTimer > 0 || dist <= 3.1) {
        this.tacticalCooldown = 1.45;
        // Aim throw toward nearest side street wall or facing direction
        _v4.set(target.pos.x >= 0 ? 1 : -1, 0, Math.cos(this.playerYaw) * 0.35);
        const throwRes = computeWebThrowAndWallPin(
          target.pos,
          _v4,
          target.kind,
          this.world.colliders,
          ignoredGateIdx
        );
        if (!throwRes.immune) {
          target.pos.copy(throwRes.nextPos);
          target.rig.root.position.copy(target.pos);
          target.vel.copy(throwRes.throwVelocity);
          if (throwRes.wallPinned) {
            target.wallPinnedTimer = throwRes.pinDuration;
            target.snareTimer = Math.max(target.snareTimer, throwRes.pinDuration);
            target.state = 'stagger';
            target.stateTimer = throwRes.pinDuration;
            this.wallPinsCount += 1;
            this.pushFloatingLabel(target.pos, 'WALL PINNED!', '#F97316');
            this.duoSynergy = addDuoSynergy(this.duoSynergy, 'web_into_storm', benefits.duoSynergyMultiplier);
          } else {
            this.pushFloatingLabel(target.pos, 'WEB THROW!', '#F97316');
          }
        } else {
          this.pushFloatingLabel(target.pos, 'WEB TENSION STAGGER', '#F59E0B');
        }
        this.damageEnemiesInRadius(target.pos, 2.8, stats.attack * 1.35, '#F97316', true, {
          snare: 2.4,
          armorBreak: 40,
          moveTag: 'web_throw',
        });
        return;
      }

      // 3. Long-range unobstructed target -> Web Strike Gap-Closer!
      const eyeStart = _v1.set(this.playerPos.x, this.playerPos.y + 1.25, this.playerPos.z);
      const tChest = _v2.set(target.pos.x, target.pos.y + 1.0, target.pos.z);
      if (dist > 5.2 && !isLineObstructedByColliders(eyeStart, tChest, this.world.colliders, ignoredGateIdx)) {
        this.tacticalCooldown = 1.25;
        _v4.subVectors(target.pos, this.playerPos).setY(0).normalize();
        this.playerPos.copy(target.pos).addScaledVector(_v4, -1.55);
        this.playerPos.y = Math.max(target.pos.y, this.playerPos.y);
        this.playerVel.set(_v4.x * 5, 3.2, _v4.z * 5);
        this.pushFloatingLabel(target.pos, 'WEB STRIKE!', '#A855F7');
        if (target.juggleTimer > 0) {
          this.duoSynergy = addDuoSynergy(this.duoSynergy, 'storm_launch_into_web', benefits.duoSynergyMultiplier);
        }
        this.damageEnemiesInRadius(target.pos, 2.8, stats.attack * 1.45, '#A855F7', true, {
          snare: 1.8,
          moveTag: 'web_strike',
        });
        return;
      }

      // 4. Mid-range target -> Predator Pull!
      this.tacticalCooldown = 1.35;
      const pullRes = computePredatorPullResult(
        this.playerPos,
        target.pos,
        target.kind,
        this.world.colliders,
        ignoredGateIdx
      );
      if (pullRes.displaced) {
        target.pos.copy(pullRes.nextPos);
        target.rig.root.position.copy(target.pos);
        target.vel.set(0, 2.2, 0);
        this.pushFloatingLabel(target.pos, 'PREDATOR PULL!', '#F97316');
      } else if (pullRes.immune) {
        this.pushFloatingLabel(target.pos, 'HEAVY MASS — SNARED', '#F59E0B');
      }
      if (target.shieldHp > 0) {
        target.shieldHp = 0;
        this.guardBreaksCount += 1;
        this.pushFloatingLabel(target.pos, 'SHIELD YANKED!', '#38BDF8');
      }
      this.damageEnemiesInRadius(target.pos, 2.5, stats.attack * 1.15, '#F97316', true, {
        snare: 2.6,
        armorBreak: 35,
        moveTag: 'predator_pull',
      });
      return;
    }

    if (this.activeHero === 'jax') {
      this.tacticalCooldown = 1.4;
      this.audio.playSfx('lightning');
      if (!this.grounded) {
        if (target && target.pos.distanceTo(this.playerPos) <= 6.2) {
          // Aerial Thunderfall Slam onto nearby target
          this.playerVel.y = -15.5;
          this.screenShake = 0.22;
          this.pushFloatingLabel(this.playerPos, 'THUNDERFALL SLAM!', '#38BDF8');
          this.damageEnemiesInRadius(this.playerPos, 5.2, stats.attack * 1.75, '#38BDF8', true, {
            stun: 1.8,
            armorBreak: 65,
            moveTag: 'storm_slam',
          });
          this.spawnParticles(this.playerPos, 0x38bdf8, 22);
        } else {
          // Storm-Step Midair Mobility Dash across rooftop gaps!
          this.playerVel.x = Math.sin(this.playerYaw) * 16.5;
          this.playerVel.z = Math.cos(this.playerYaw) * 16.5;
          this.playerVel.y = Math.max(3.6, this.playerVel.y + 3.2);
          this.pushFloatingLabel(this.playerPos, 'STORM-STEP AIR DASH', '#38BDF8');
          this.spawnParticles(this.playerPos, 0x38bdf8, 18);
          this.bumpTraversalMastery();
        }
        return;
      }

      // Grounded Electric Uppercut Launcher -> Aerial Pursuit!
      if (target && target.pos.distanceTo(this.playerPos) <= 5.5) {
        const res = getEnemyWebResistance(target.kind);
        if (res.canAirLaunch) {
          target.vel.y = res.launchVelocityY;
          target.juggleTimer = 1.75;
          target.state = 'stagger';
          target.stateTimer = 1.4;
          this.playerVel.y = 9.2;
          this.grounded = false;
          this.jumpsUsed = 1;
        }
        if (target.snareTimer > 0 || target.wallPinnedTimer > 0) {
          this.duoSynergy = addDuoSynergy(this.duoSynergy, 'web_into_storm', benefits.duoSynergyMultiplier);
        } else {
          this.duoSynergy = addDuoSynergy(this.duoSynergy, 'storm_launch_into_web', 0.65);
        }
        this.pushFloatingLabel(target.pos, 'ELECTRIC LAUNCHER!', '#38BDF8');
        this.damageEnemiesInRadius(target.pos, 3.6, stats.attack * 1.55, '#38BDF8', true, {
          armorBreak: 55,
          moveTag: 'electric_launcher',
        });
        this.spawnParticles(target.pos, 0x38bdf8, 18);
      } else {
        // Lightning Dash Gap-Closer
        this.playerVel.x = Math.sin(this.playerYaw) * 17.5;
        this.playerVel.z = Math.cos(this.playerYaw) * 17.5;
        this.pushFloatingLabel(this.playerPos, 'LIGHTNING DASH', '#38BDF8');
        this.damageEnemiesInRadius(this.playerPos, 3.8, stats.attack * 1.25, '#38BDF8', true, {
          armorBreak: 35,
          moveTag: 'lightning_dash',
        });
        this.spawnParticles(this.playerPos, 0x38bdf8, 16);
      }
      return;
    }

    // Fused Kai-Jax: Stormweb Convergence Pull
    this.tacticalCooldown = 1.3;
    this.audio.playSfx('fusion');
    if (target) {
      this.showWebTetherBurst(target.pos);
    }
    this.pushFloatingLabel(this.playerPos, 'STORMWEB SURGE!', '#D4AF37');
    this.damageEnemiesInRadius(this.playerPos, 6.2, stats.attack * 1.95, '#D4AF37', true, {
      snare: 2.5,
      stun: 1.6,
      armorBreak: 75,
      pull: true,
      moveTag: 'stormweb_surge',
    });
    this.spawnParticles(this.playerPos, 0xf97316, 16);
    this.spawnParticles(this.playerPos, 0x38bdf8, 16);
  }

  public triggerDuoFinisher(): boolean {
    if (this.paused || this.titleShowcaseMode || this.isGameOver) return false;
    this.audio.unlock();

    const target =
      (this.lockedEnemyId &&
        this.enemies.find(
          (e) => e.id === this.lockedEnemyId && e.state !== 'dead' && e.pos.distanceTo(this.playerPos) <= 11.5
        )) ||
      this.findNearestEnemy(11.5);
    const nearbyCount = this.enemies.filter(
      (e) => e.state !== 'dead' && e.pos.distanceTo(this.playerPos) <= 8.5
    ).length;

    const attempt = tryStartDuoFinisher({
      synergyState: this.duoSynergy,
      hasValidTarget: Boolean(target),
      targetEnemyId: target?.id ?? null,
      nearbyEnemyCount: nearbyCount,
      bothBrothersAvailable: this.kaiHp > 0 && this.jaxHp > 0,
      isFused: this.isFused,
      fusionUnlocked: this.save.fusionUnlocked,
      counterWindowOpen: this.counterWindow.active,
      playerAirborne: !this.grounded || Boolean(target && target.juggleTimer > 0),
      playerStunnedOrDown: this.isGameOver,
      alreadyInFinisher: this.activeFinisher !== null,
    });

    if (!attempt.accepted || !attempt.execution || !target) {
      if (attempt.reason === 'insufficient_synergy') {
        this.pushFloatingLabel(this.playerPos, `SYNERGY ${Math.round(this.duoSynergy.meter)}/50`, '#94A3B8');
      } else if (attempt.reason === 'no_valid_target') {
        this.pushFloatingLabel(this.playerPos, 'NO TARGET IN RANGE', '#94A3B8');
      }
      return false;
    }

    this.duoSynergy = attempt.nextSynergy;
    this.activeFinisher = attempt.execution;
    this.counterWindow = createCounterWindowState();
    this.duoFinishersUsed += 1;
    this.blockHeld = false;
    this.dodgeTimer = attempt.execution.finisher.duration + 0.18; // Cinematic invulnerability window

    target.state = 'stagger';
    target.stateTimer = attempt.execution.finisher.duration + 0.6;
    this.playerYaw = Math.atan2(target.pos.x - this.playerPos.x, target.pos.z - this.playerPos.z);

    this.audio.playSfx('fusion');
    this.screenShake = 0.24;
    this.pushFloatingLabel(target.pos, attempt.execution.finisher.name.toUpperCase(), '#D4AF37');
    this.spawnParticles(target.pos, 0xf97316, 18);
    this.spawnParticles(target.pos, 0x38bdf8, 18);
    this.syncCombatTelemetry();
    this.emitHudSnapshot();
    return true;
  }

  private showWebTetherBurst(targetWorldPos: THREE.Vector3): void {
    this.webVisualTimer = 0.24;
    this.webVisualEnd.copy(targetWorldPos).setY(targetWorldPos.y + 1.05);
    this.webLine.visible = true;
  }

  public triggerJumpOrSwing(): void {
    if (this.paused || this.titleShowcaseMode || this.isGameOver || this.activeFinisher) return;
    const t0 = performance.now();
    this.audio.unlock();

    // Cancel zip burst into crisp upward launch if player jumps mid-zip
    if (this.zipActive) {
      this.zipActive = false;
      this.webLine.visible = false;
      this.playerVel.y = 8.4;
      this.jumpsUsed = 1;
      this.lastInputResponseMs = performance.now() - t0;
      return;
    }

    // If swinging, release with preserved pendulum arc tangential momentum + upward launch lift
    if (this.isSwinging) {
      this.isSwinging = false;
      this.activeWebAnchorId = null;
      this.activeWebAttachmentType = null;
      this.webLine.visible = false;
      this.playerVel.y = Math.max(8.4, this.playerVel.y + 4.8);
      this.playerVel.x = THREE.MathUtils.clamp(this.playerVel.x + Math.sin(this.playerYaw) * 5.8, -19.5, 19.5);
      this.playerVel.z = THREE.MathUtils.clamp(this.playerVel.z + Math.cos(this.playerYaw) * 5.8, -19.5, 19.5);
      this.audio.playSfx('web');
      this.lastInputResponseMs = performance.now() - t0;
      return;
    }

    // Check validated unobstructed geometry-attached Web Swing anchor only when genuinely airborne (>=1.25m above ground/deck below)
    let floorBelow = 0;
    for (let i = 0; i < this.world.colliders.length; i++) {
      const c = this.world.colliders[i];
      if (!c.walkableTop) continue;
      if (
        this.playerPos.x + 0.48 > c.minX &&
        this.playerPos.x - 0.48 < c.maxX &&
        this.playerPos.z + 0.48 > c.minZ &&
        this.playerPos.z - 0.48 < c.maxZ &&
        this.playerPos.y >= c.maxY - 0.55
      ) {
        floorBelow = Math.max(floorBelow, c.maxY);
      }
    }
    const airborneClearance = this.playerPos.y - floorBelow;
    const anchor = this.findNearestValidatedWebAnchor(15.5);
    if (
      !this.grounded &&
      airborneClearance >= 1.25 &&
      this.coyoteTimer <= 0 &&
      anchor &&
      (this.activeHero === 'kai' || this.activeHero === 'kaijax' || this.save.traversalTier !== 'Apex Street')
    ) {
      this.isSwinging = true;
      this.zipActive = false;
      this.swingAnchorPos.copy(anchor.position);
      this.swingSupportPos.copy(anchor.supportPoint);
      this.swingRopeLength = THREE.MathUtils.clamp(this.playerPos.distanceTo(this.swingAnchorPos), 3.4, 11.5);
      this.activeWebAnchorId = anchor.id;
      this.activeWebAttachmentType = anchor.attachmentType;
      this.webLine.visible = true;
      // Inject minimum forward pendulum entry tangent so low-speed catches build speed through bottom of arc
      const hSpd = Math.hypot(this.playerVel.x, this.playerVel.z);
      if (hSpd < 7.5) {
        this.playerVel.x = Math.sin(this.playerYaw) * 8.2;
        this.playerVel.z = Math.cos(this.playerYaw) * 8.2;
      }
      this.playerVel.y = Math.max(this.playerVel.y, 1.8);
      this.audio.playSfx('web');
      this.bumpTraversalMastery();
      this.lastInputResponseMs = performance.now() - t0;
      return;
    }

    const canCoyoteJump = !this.grounded && this.coyoteTimer > 0 && this.jumpsUsed === 0;
    if (this.grounded || canCoyoteJump || this.jumpsUsed < 2) {
      const sprinting = this.touchSprint || this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');
      const curSpeed = Math.hypot(this.playerVel.x, this.playerVel.z);
      const sprintVault = (this.grounded || canCoyoteJump) && sprinting && curSpeed > 6.5;
      if (sprintVault) {
        const boost = Math.min(13.2, curSpeed * 1.12);
        const dirScale = boost / Math.max(0.001, curSpeed);
        this.playerVel.x *= dirScale;
        this.playerVel.z *= dirScale;
      }
      this.playerVel.y = sprintVault ? 10.3 : this.jumpsUsed === 0 ? 9.8 : 8.7;
      this.grounded = false;
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
      this.jumpsUsed += 1;
      this.isWallRunning = false;
      this.spawnParticles(this.playerPos, this.activeHero === 'jax' ? 0x38bdf8 : 0x8b5cf6, 6);
    } else {
      // Queue short jump input buffer right before ground touchdown
      this.jumpBufferTimer = 0.13;
    }
    this.lastInputResponseMs = performance.now() - t0;
  }

  public triggerDodgeOrParry(): void {
    if (this.paused || this.titleShowcaseMode || this.isGameOver || this.activeFinisher) return;
    const t0 = performance.now();
    if (this.dodgeCooldown > 0) {
      if (this.dodgeCooldown <= 0.18) {
        this.combatBuffer = bufferCombatAction(this.combatBuffer, 'dodge');
      }
      return;
    }
    if (!canCancelAttackIntoDodge(this.attackTimer, this.activeAttackType)) {
      this.combatBuffer = bufferCombatAction(this.combatBuffer, 'dodge');
      return;
    }
    this.audio.unlock();

    // Responsive free-flow cancel: cleanly abort active light/heavy recovery into evasion/parry
    if (this.attackTimer > 0) {
      this.dodgeCancelCount += 1;
      this.attackTimer = 0;
      this.activeAttackType = 'none';
      this.activeMoveIsGuardBreak = false;
    }
    this.combatBuffer = clearCombatBuffer(this.combatBuffer);

    this.dodgeTimer = PARRY.dodgeIFrames;
    this.dodgeCooldown = 0.56;
    this.parryWindow = parryWindowFor(this.settings.parryTiming);
    this.isSwinging = false;
    this.zipActive = false;
    this.webLine.visible = false;

    // Resolve live directional evade vector directly from active stick / WASD input
    let ix = this.touchMove.x;
    let iy = this.touchMove.y;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) ix -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) ix += 1;
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) iy -= 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) iy += 1;
    const hasMoveDir = Math.hypot(ix, iy) > 0.15;

    if (hasMoveDir) {
      _camFwd.set(-Math.sin(this.camYaw), 0, -Math.cos(this.camYaw)).normalize();
      _camRight.set(Math.cos(this.camYaw), 0, -Math.sin(this.camYaw)).normalize();
      _v1.set(0, 0, 0).addScaledVector(_camRight, ix).addScaledVector(_camFwd, -iy).normalize();
      this.playerYaw = Math.atan2(_v1.x, _v1.z);
    }

    const boost = hasMoveDir ? (this.activeHero === 'kai' ? 14.8 : 13.8) : 5.8;
    this.playerVel.x = Math.sin(this.playerYaw) * boost;
    this.playerVel.z = Math.cos(this.playerYaw) * boost;
    if (!this.grounded && this.playerVel.y < 0) {
      // Aerial recovery stabilize
      this.playerVel.y = 2.6;
    }
    this.audio.playSfx('dodge');
    this.spawnParticles(this.playerPos, this.activeHero === 'jax' ? 0x38bdf8 : 0x8b5cf6, 10);
    this.lastInputResponseMs = performance.now() - t0;
  }

  public triggerAbility(slot: 1 | 2 | 3): void {
    if (this.paused || this.titleShowcaseMode || this.isGameOver || this.activeFinisher) return;
    this.audio.unlock();

    if (slot === 1) {
      const chord = registerChordInput(this.duoSynergy, 'ability', this.clock.elapsedTime);
      this.duoSynergy = chord.nextState;
      if (chord.chordTriggered && this.triggerDuoFinisher()) {
        return;
      }
    }

    const idx = slot - 1;
    if (this.abilityCooldowns[idx] > 0) return;
    if (this.attackTimer > 0.22) {
      const bufKey = slot === 1 ? 'ability_1' : slot === 2 ? 'ability_2' : 'ability_3';
      this.combatBuffer = bufferCombatAction(this.combatBuffer, bufKey);
      return;
    }

    const defs = HERO_ABILITIES[this.activeHero];
    const def = defs[idx];
    if (!def) return;

    const curEnergy = this.getActiveEnergy();
    if (curEnergy < def.energyCost) {
      this.pushFloatingLabel(this.playerPos, 'LOW ENERGY', '#94a3b8');
      return;
    }
    this.spendActiveEnergy(def.energyCost);
    this.abilityCooldowns[idx] = def.cooldown;
    this.repeatLightStrikes = 0;
    this.attackTimer = 0.42;
    this.activeAttackType = 'ability';
    this.activeMoveIsGuardBreak = true;
    this.attackHitApplied = true;
    this.faceContextualFreeFlowTarget(9.5);

    const stats = computeHeroStats(this.baseHero, this.save.heroes[this.baseHero]);
    const dmgBase = stats.attack * stats.abilityPower * (this.isFused ? 1.45 : 1.0);

    if (this.activeHero === 'kai') {
      if (slot === 1) {
        // Venom Strike
        this.audio.playSfx('attack_kai');
        this.playerVel.x = Math.sin(this.playerYaw) * 14;
        this.playerVel.z = Math.cos(this.playerYaw) * 14;
        this.damageEnemiesInRadius(this.playerPos, 4.4, dmgBase * 1.65, '#F97316', true, {
          burn: 4.0,
          moveTag: 'kai_skill_1',
        });
        this.spawnParticles(this.playerPos, 0xf97316, 16);
      } else if (slot === 2) {
        // Web of Pyraxis
        this.audio.playSfx('web');
        const targetSpot = this.playerPos.clone().add(
          new THREE.Vector3(Math.sin(this.playerYaw) * 4.2, 0, Math.cos(this.playerYaw) * 4.2)
        );
        this.damageEnemiesInRadius(targetSpot, 5.2, dmgBase * 1.35, '#EA580C', true, {
          snare: 3.5,
          burn: 3.0,
          moveTag: 'kai_skill_2',
        });
        this.spawnParticles(targetSpot, 0xf97316, 22);
      } else {
        // Memory Weave
        this.audio.playSfx('memory');
        this.shadowInkTimer = 4.5;
        this.damageEnemiesInRadius(this.playerPos, 6.2, dmgBase * 1.45, '#8B5CF6', false, {
          stun: 2.8,
          moveTag: 'kai_skill_3',
        });
        this.spawnParticles(this.playerPos, 0x8b5cf6, 26);
        this.tryReconstructMemorySite();
      }
    } else if (this.activeHero === 'jax') {
      if (slot === 1) {
        // Displacement Burst
        this.audio.playSfx('lightning');
        this.playerVel.x = Math.sin(this.playerYaw) * 18;
        this.playerVel.z = Math.cos(this.playerYaw) * 18;
        this.damageEnemiesInRadius(this.playerPos, 4.8, dmgBase * 1.6, '#38BDF8', true, {
          armorBreak: 45,
          moveTag: 'jax_skill_1',
        });
        this.spawnParticles(this.playerPos, 0x38bdf8, 18);
      } else if (slot === 2) {
        // Storm Pressure
        this.audio.playSfx('boss_slam');
        this.screenShake = 0.25;
        this.damageEnemiesInRadius(this.playerPos, 6.0, dmgBase * 1.85, '#2563EB', true, {
          armorBreak: 70,
          pull: true,
          moveTag: 'jax_skill_2',
        });
        this.spawnParticles(this.playerPos, 0x2563eb, 24);
      } else {
        // Lightning Channeling + Thryxen Senses
        this.audio.playSfx('lightning');
        this.thryxenTimer = 8.0;
        this.pushFloatingLabel(this.playerPos, 'THRYXEN SENSES', '#D4AF37');
        this.spawnParticles(this.playerPos, 0x38bdf8, 20);
      }
    } else {
      // KAI-JAX FUSED ABILITIES
      if (slot === 1) {
        this.audio.playSfx('heavy');
        this.damageEnemiesInRadius(this.playerPos, 5.5, dmgBase * 1.9, '#F97316', true, {
          burn: 4.5,
          armorBreak: 55,
          moveTag: 'kaijax_skill_1',
        });
        this.spawnParticles(this.playerPos, 0xf97316, 24);
      } else if (slot === 2) {
        this.audio.playSfx('lightning');
        this.damageEnemiesInRadius(this.playerPos, 6.8, dmgBase * 1.95, '#38BDF8', true, {
          stun: 1.8,
          moveTag: 'kaijax_skill_2',
        });
        this.spawnParticles(this.playerPos, 0x38bdf8, 28);
      } else {
        this.audio.playSfx('fusion');
        this.screenShake = 0.35;
        this.damageEnemiesInRadius(this.playerPos, 8.2, dmgBase * 2.45, '#8B5CF6', true, {
          stun: 2.8,
          armorBreak: 90,
          moveTag: 'kaijax_skill_3',
        });
        this.spawnParticles(this.playerPos, 0xa855f7, 36);
      }
    }
  }

  public triggerSwitchHero(): void {
    if (this.paused || this.titleShowcaseMode || this.isGameOver || this.isFused || this.activeFinisher) return;
    this.audio.unlock();
    this.baseHero = this.baseHero === 'kai' ? 'jax' : 'kai';
    this.activeHero = this.baseHero;
    this.repeatLightStrikes = 0;

    // Swap physical positions smoothly & record camera blend offset so view glides with zero snap!
    _v1.copy(this.playerPos);
    this.switchCamOffset.subVectors(_v1, this.companionPos);
    if (this.switchCamOffset.length() > 5.0) {
      this.switchCamOffset.setLength(5.0);
    }
    this.playerPos.copy(this.companionPos);
    this.companionPos.copy(_v1);
    this.playerVel.y = 4.2;

    if (this.comboState.count > 0) {
      this.duoSynergy = addDuoSynergy(
        this.duoSynergy,
        'switch_combo',
        getComboCombatBenefits(this.comboState.count).duoSynergyMultiplier
      );
      this.comboState = { ...this.comboState, timer: this.comboState.maxTimer };
    }

    this.audio.playSfx(this.baseHero === 'jax' ? 'lightning' : 'web');
    this.damageEnemiesInRadius(
      this.playerPos,
      4.2,
      30,
      this.baseHero === 'jax' ? '#38BDF8' : '#8B5CF6',
      true,
      { moveTag: `switch_${this.baseHero}` }
    );
    this.spawnParticles(this.playerPos, this.baseHero === 'jax' ? 0x38bdf8 : 0x8b5cf6, 16);
    this.pushFloatingLabel(this.playerPos, `SWITCH: ${this.baseHero.toUpperCase()}`, '#E2E8F0');
    this.syncHeroRigVisibility();
    this.emitHudSnapshot();
    this.callbacks.onSaveProgress({ activeHero: this.baseHero }, true);
  }

  public triggerFusion(): void {
    if (this.paused || this.titleShowcaseMode || this.isGameOver || this.activeFinisher) return;
    if (!this.save.fusionUnlocked) {
      this.pushFloatingLabel(this.playerPos, 'FUSION LOCKED (STORY)', '#94A3B8');
      return;
    }
    if (this.isFused) {
      // Allow manual early cancellation cleanly
      this.endFusion();
      return;
    }
    if (this.fusionCooldown > 0 || this.fusionCharge < 100) {
      this.pushFloatingLabel(this.playerPos, 'CHARGE FUSION 100%', '#D4AF37');
      return;
    }
    this.audio.unlock();
    this.isFused = true;
    this.activeHero = 'kaijax';
    this.fusionTimeLeft = 22.0;
    this.fusionCharge = 0;
    this.abilityCooldowns = [0, 0, 0];
    this.syncHeroRigVisibility();
    this.audio.playSfx('fusion');
    this.screenShake = 0.35;
    this.damageEnemiesInRadius(this.playerPos, 6.5, 65, '#A855F7', true, {
      stun: 2.0,
      moveTag: 'convergence_awaken',
    });
    this.spawnParticles(this.playerPos, 0xf97316, 20);
    this.spawnParticles(this.playerPos, 0x38bdf8, 20);
    this.pushFloatingLabel(this.playerPos, 'KAI-JAX: THE MEMORY HERO', '#D4AF37');
  }

  private endFusion(): void {
    if (!this.isFused) return;
    this.isFused = false;
    this.activeHero = this.baseHero;
    this.fusionCooldown = 14.0;
    this.companionPos.copy(this.playerPos).add(_v4.set(2.2, 0, 1.5));
    this.syncHeroRigVisibility();
  }

  public triggerLockOn(): void {
    if (this.lockedEnemyId) {
      this.lockedEnemyId = null;
      return;
    }
    const nearest = this.findNearestEnemy(24);
    if (nearest) {
      this.lockedEnemyId = nearest.id;
      this.audio.playSfx('ui');
    }
  }

  public triggerInteract(): void {
    if (this.paused || this.titleShowcaseMode || this.isGameOver) return;
    this.audio.unlock();

    // 1. Rescue nearby civilian
    for (const civ of this.world.civilians) {
      if (!civ.rescued && civ.position.distanceTo(this.playerPos) < 3.8) {
        const nearbyEnemies = this.enemies.some((e) => e.state !== 'dead' && e.pos.distanceTo(civ.position) < 9.5);
        if (nearbyEnemies) {
          this.pushFloatingLabel(civ.position, 'CLEAR ENEMIES FIRST', '#F59E0B');
          return;
        }
        civ.rescued = true;
        civ.group.visible = false;
        this.audio.playSfx('rescue');
        this.spawnParticles(civ.position, 0x38bdf8, 18);
        this.pushFloatingLabel(civ.position, `${civ.name} RESCUED`, '#38BDF8');

        const rescuedCount = this.world.civilians.filter((c) => c.rescued).length;
        this.callbacks.onGrantRewards(65, { 'Ash Scrap': 2 });
        this.callbacks.onSaveProgress({ rescuedCivilians: rescuedCount });

        if (this.save.missionStageIndex === 1 && rescuedCount >= this.world.civilians.length) {
          this.advanceMissionStage(2);
        }
        return;
      }
    }

    // 2. Reconstruct Disrupted Memory Site
    if (this.tryReconstructMemorySite()) return;

    // 3. Open Alley Gate
    if (!this.world.alleyGateOpen && this.playerPos.distanceTo(this.world.alleyGatePos) < 5.0) {
      if (this.save.missionStageIndex < 3) {
        this.pushFloatingLabel(this.world.alleyGatePos, 'RESTORE MEMORY SITE FIRST', '#F59E0B');
        return;
      }
      const gateGuardsAlive = this.enemies.some((e) => e.stageTag === 3 && e.state !== 'dead');
      if (gateGuardsAlive) {
        this.pushFloatingLabel(this.world.alleyGatePos, 'DEFEAT GATE GUARDS', '#EF4444');
        return;
      }
      this.world.alleyGateOpen = true;
      this.world.alleyGateBarrier.visible = false;
      this.audio.playSfx('lightning');
      this.spawnParticles(this.world.alleyGatePos, 0x38bdf8, 28);
      this.pushFloatingLabel(this.world.alleyGatePos, 'ALLEY GATE BREACHED', '#38BDF8');
      this.callbacks.onSaveProgress({
        checkpointPos: [0, 0, -52],
        traversalTier: 'Web Swing',
      });
      this.advanceMissionStage(4);
      return;
    }

    // 4. Contextual Environmental Takedown (Syndicate High-Voltage Arc Relay)
    this.triggerEnvironmentalTakedown();
  }

  private findAvailableEnvironmentalTakedown() {
    if (this.world.environmentMode !== 'reconstructed') return null;
    for (const h of this.world.environmentalHazards) {
      if (h.cooldown > 0) continue;
      if (h.position.distanceTo(this.playerPos) > 10.5) continue;
      const victim = this.enemies.find(
        (e) =>
          e.state !== 'dead' &&
          (e.pos.distanceTo(h.position) <= h.pullRadius || e.pos.distanceTo(this.playerPos) <= 8.5)
      );
      if (victim) {
        return { hazard: h, victim };
      }
    }
    return null;
  }

  public triggerEnvironmentalTakedown(): boolean {
    if (this.paused || this.titleShowcaseMode || this.isGameOver || this.activeFinisher) return false;
    const avail = this.findAvailableEnvironmentalTakedown();
    if (!avail) return false;

    const { hazard, victim } = avail;
    this.audio.unlock();
    hazard.cooldown = hazard.maxCooldown;
    hazard.triggeredCount += 1;
    this.environmentalTakedownsCount += 1;

    // Yank victim into the Syndicate High-Voltage Arc Relay coils!
    if (victim.kind !== 'boss') {
      _v1.subVectors(this.playerPos, hazard.position).setY(0);
      if (_v1.lengthSq() < 0.01) _v1.set(0, 0, 1);
      _v1.normalize();
      victim.pos.set(hazard.position.x + _v1.x * 1.25, hazard.position.y, hazard.position.z + _v1.z * 1.25);
      victim.rig.root.position.copy(victim.pos);
    }

    this.playerYaw = Math.atan2(hazard.position.x - this.playerPos.x, hazard.position.z - this.playerPos.z);
    this.attackTimer = 0.36;
    this.activeAttackType = 'heavy';
    this.attackHitApplied = true;
    this.showWebTetherBurst(hazard.position);
    this.audio.playSfx('lightning');
    this.screenShake = 0.28;

    const stats = computeHeroStats(this.baseHero, this.save.heroes[this.baseHero]);
    const benefits = getComboCombatBenefits(this.comboState.count);
    this.duoSynergy = addDuoSynergy(this.duoSynergy, 'web_into_storm', benefits.duoSynergyMultiplier);
    if (this.save.fusionUnlocked) {
      this.fusionCharge = Math.min(100, this.fusionCharge + 18);
    }

    this.pushFloatingLabel(hazard.position, 'ENVIRONMENTAL TAKEDOWN!', '#38BDF8');
    this.damageEnemiesInRadius(
      hazard.position,
      hazard.aoeRadius,
      hazard.damage * stats.abilityPower,
      '#38BDF8',
      true,
      {
        stun: 2.4,
        snare: 2.2,
        armorBreak: 70,
        moveTag: 'env_relay_takedown',
      }
    );
    this.spawnParticles(hazard.position, 0x38bdf8, 28);
    this.spawnParticles(hazard.position, 0xa855f7, 16);
    this.syncCombatTelemetry();
    this.emitHudSnapshot();
    return true;
  }

  private tryReconstructMemorySite(): boolean {
    if (
      !this.world.memorySiteReconstructed &&
      this.playerPos.distanceTo(this.world.memorySitePos) < 5.2
    ) {
      if (this.save.missionStageIndex < 2) {
        this.pushFloatingLabel(this.world.memorySitePos, 'RESCUE CIVILIANS FIRST', '#F59E0B');
        return false;
      }
      this.world.memorySiteReconstructed = true;
      this.audio.playSfx('memory');
      this.spawnParticles(this.world.memorySitePos, 0x8b5cf6, 30);
      this.pushFloatingLabel(this.world.memorySitePos, 'MEMORY RECONSTRUCTED', '#8B5CF6');
      this.callbacks.onGrantRewards(95, { 'Myrr\'Kai Thread': 2 }, 1);
      this.callbacks.onSaveProgress({
        reconstructedSites: 1,
        traversalTier: 'Memory Step',
        checkpointPos: [10, 0, -34],
      });
      if (this.save.missionStageIndex === 2) {
        this.advanceMissionStage(3);
      }
      return true;
    }
    return false;
  }

  private advanceMissionStage(nextStage: number): void {
    this.save = { ...this.save, missionStageIndex: nextStage };
    this.callbacks.onSaveProgress({ missionStageIndex: nextStage });
    this.respawnStageEnemies(nextStage);
    const step = MISSION_1_STEPS[nextStage];
    if (step?.dialogueOnStart) {
      this.paused = true;
      this.callbacks.onTriggerDialogue(step.dialogueOnStart, () => {
        this.paused = false;
      });
    }
  }

  private getActiveEnergy(): number {
    if (this.isFused) return 100;
    return this.baseHero === 'kai' ? this.kaiEnergy : this.jaxEnergy;
  }

  private spendActiveEnergy(cost: number): void {
    if (this.isFused) return;
    if (this.baseHero === 'kai') this.kaiEnergy = Math.max(0, this.kaiEnergy - cost);
    else this.jaxEnergy = Math.max(0, this.jaxEnergy - cost);
  }

  private bumpTraversalMastery(): void {
    this.callbacks.onSaveProgress({ traversalMastery: (this.save.traversalMastery || 0) + 1 }, true);
  }

  private findNearestEnemy(maxDist: number): EnemyEntity | null {
    let best: EnemyEntity | null = null;
    let bestD = maxDist;
    for (const e of this.enemies) {
      if (e.state === 'dead') continue;
      const d = e.pos.distanceTo(this.playerPos);
      if (d < bestD) {
        bestD = d;
        best = e;
      }
    }
    return best;
  }

  private findNearestValidatedWebAnchor(maxDist: number) {
    const ignoredGateIdx = this.world.alleyGateOpen ? this.world.alleyGateColliderIndex : -1;
    let best = null;
    let bestD = maxDist;
    for (const a of this.world.webAnchors) {
      const check = validateGrappleAnchor(
        this.playerPos,
        a.position,
        this.world.colliders,
        maxDist,
        ignoredGateIdx
      );
      if (check.valid && check.distance < bestD) {
        bestD = check.distance;
        best = a;
      }
    }
    return best;
  }

  /**
   * Free-Flow Contextual Targeting:
   * Evaluates locked enemy first, otherwise scores nearby enemies by distance AND directional
   * stick/keyboard input alignment so enemy-to-enemy attack chaining feels effortless.
   */
  private faceContextualFreeFlowTarget(maxDist = 8.5): EnemyEntity | null {
    if (this.lockedEnemyId) {
      const locked = this.enemies.find(
        (e) => e.id === this.lockedEnemyId && e.state !== 'dead' && e.pos.distanceTo(this.playerPos) <= maxDist + 3.0
      );
      if (locked) {
        this.playerYaw = Math.atan2(locked.pos.x - this.playerPos.x, locked.pos.z - this.playerPos.z);
        return locked;
      }
    }

    if (!this.settings.aimAssist) return null;

    let ix = this.touchMove.x;
    let iy = this.touchMove.y;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) ix -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) ix += 1;
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) iy -= 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) iy += 1;
    const hasDir = Math.hypot(ix, iy) > 0.15;

    _camFwd.set(-Math.sin(this.camYaw), 0, -Math.cos(this.camYaw)).normalize();
    _camRight.set(Math.cos(this.camYaw), 0, -Math.sin(this.camYaw)).normalize();
    if (hasDir) {
      _v4.set(0, 0, 0).addScaledVector(_camRight, ix).addScaledVector(_camFwd, -iy).normalize();
    } else {
      _v4.set(Math.sin(this.playerYaw), 0, Math.cos(this.playerYaw)).normalize();
    }

    let best: EnemyEntity | null = null;
    let bestScore = -Infinity;
    for (const e of this.enemies) {
      if (e.state === 'dead') continue;
      const dist = e.pos.distanceTo(this.playerPos);
      if (dist > maxDist) continue;
      _v3.subVectors(e.pos, this.playerPos).setY(0);
      const len = _v3.length();
      const align = len > 0.05 ? _v3.divideScalar(len).dot(_v4) : 1.0;
      const vulnBonus =
        (e.wallPinnedTimer > 0 || e.juggleTimer > 0 ? 0.45 : 0) +
        (e.state === 'windup' ? 0.35 : 0);
      const score = (1 - dist / maxDist) * 2.25 + align * (hasDir ? 1.95 : 0.8) + vulnBonus;
      if (score > bestScore) {
        bestScore = score;
        best = e;
      }
    }

    if (best) {
      this.playerYaw = Math.atan2(best.pos.x - this.playerPos.x, best.pos.z - this.playerPos.z);
    }
    return best;
  }

  private damageEnemiesInRadius(
    origin: THREE.Vector3,
    radius: number,
    amount: number,
    color: string,
    canBreakArmor: boolean,
    fx?: {
      burn?: number;
      snare?: number;
      stun?: number;
      armorBreak?: number;
      pull?: boolean;
      moveTag?: string;
      isCompanionAssist?: boolean;
    }
  ): number {
    const stats = computeHeroStats(this.baseHero, this.save.heroes[this.baseHero]);
    const benefits = getComboCombatBenefits(this.comboState.count);
    const critChance = stats.critChance + benefits.bonusCritChance + (this.thryxenTimer > 0 ? 0.3 : 0);
    let hitsLanded = 0;
    let defeatsThisStrike = 0;

    // Check destructible supply crates
    for (const crate of this.world.crates) {
      if (!crate.broken && crate.position.distanceTo(origin) <= radius + 0.8) {
        hitsLanded += 1;
        crate.hp -= amount;
        this.spawnParticles(crate.position, 0xf97316, 8);
        if (crate.hp <= 0) {
          crate.broken = true;
          crate.mesh.visible = false;
          this.audio.playSfx('hit');
          this.pushFloatingLabel(crate.position, `+1 ${crate.rewardMaterial}`, '#D4AF37');
          this.callbacks.onGrantRewards(20, { [crate.rewardMaterial]: 1 });
          this.kaiHp = Math.min(this.kaiMaxHp, this.kaiHp + 18);
          this.jaxHp = Math.min(this.jaxMaxHp, this.jaxHp + 18);
        }
      }
    }

    for (const e of this.enemies) {
      if (e.state === 'dead') continue;
      if (e.pos.distanceTo(origin) > radius) continue;

      const incapacitated = e.stunTimer > 0 || e.snareTimer > 0 || e.wallPinnedTimer > 0 || e.juggleTimer > 0;
      const isWebOrSkill = Boolean(
        fx?.moveTag &&
          (fx.moveTag.includes('web') ||
            fx.moveTag.includes('skill') ||
            fx.moveTag.includes('counter') ||
            fx.moveTag.includes('finisher') ||
            fx.moveTag.includes('launcher'))
      );

      // Smart Archetype Defensive Reactions (Shielded Defender, Agile Dodger, Elite Assassin)
      if (!fx?.isCompanionAssist) {
        const reaction = evaluateEnemyDefensiveReaction({
          kind: e.kind,
          shieldHp: e.shieldHp,
          incapacitated,
          isGuardBreakMove: canBreakArmor,
          isWebOrAbilityOrCounter: isWebOrSkill,
          repeatLightCount: this.repeatLightStrikes,
        });

        if (reaction === 'dodger_sidestep') {
          const sideSign = Math.random() < 0.5 ? 1 : -1;
          e.vel.x = Math.cos(this.playerYaw) * 9.5 * sideSign;
          e.vel.z = -Math.sin(this.playerYaw) * 9.5 * sideSign;
          this.pushFloatingLabel(e.pos, 'SIDESTEP! USE WEB OR HEAVY', '#A855F7');
          this.spawnParticles(e.pos, 0xa855f7, 8);
          hitsLanded += 1;
          continue;
        }

        if (reaction === 'assassin_counter') {
          this.repeatLightStrikes = 0;
          e.state = 'windup';
          e.stateTimer = 0.28;
          this.pushFloatingLabel(e.pos, 'ASSASSIN PARRY! MIX ATTACKS', '#D946EF');
          this.audio.playSfx('parry');
          this.spawnParticles(e.pos, 0xd946ef, 12);
          hitsLanded += 1;
          continue;
        }

        if (e.kind === 'shield' && e.shieldHp > 0) {
          const gb = applyGuardBreakToShield(e.shieldHp, amount, canBreakArmor);
          e.shieldHp = gb.nextShieldHp;
          if (gb.broken) {
            this.guardBreaksCount += 1;
            this.hitstopTimer = Math.max(this.hitstopTimer, 0.042);
            e.state = 'stagger';
            e.stateTimer = 2.0;
            const shieldMesh = e.rig.leftArm.getObjectByName('enemy_riot_shield');
            if (shieldMesh) shieldMesh.visible = false;
            this.pushFloatingLabel(e.pos, 'GUARD BROKEN!', '#38BDF8');
            this.spawnParticles(e.pos, 0x38bdf8, 18);
          } else if (!canBreakArmor) {
            this.pushFloatingLabel(e.pos, 'SHIELDED — HEAVY / WEB BREAK', '#38BDF8');
            this.spawnParticles(e.pos, 0x38bdf8, 6);
            hitsLanded += 1;
            continue;
          }
        }
      }

      hitsLanded += 1;
      const isCrit = Math.random() < critChance || e.wallPinnedTimer > 0;
      let dmg = amount * benefits.damageMultiplier * (isCrit ? 1.55 : 1.0);

      if (e.armor > 0) {
        const armorDmg = (canBreakArmor ? dmg * 0.95 : dmg * 0.35) + (fx?.armorBreak ?? 0);
        e.armor = Math.max(0, e.armor - armorDmg);
        dmg *= e.armor > 0 ? 0.55 : 1.0;
        if (e.armor === 0) {
          e.state = 'stagger';
          e.stateTimer = 1.6;
          this.guardBreaksCount += 1;
          this.pushFloatingLabel(e.pos, 'ARMOR BROKEN!', '#F59E0B');
        }
      }

      e.hp = Math.max(0, e.hp - dmg);
      e.hitFlash = 0.16;

      if (!fx?.isCompanionAssist) {
        this.comboState = registerComboHit(this.comboState, 1, fx?.moveTag ?? this.activeAttackType);
        if (this.comboState.count > this.maxCombo) {
          this.maxCombo = this.comboState.count;
        }
        if ((this.comboState.styleScore ?? 0) > this.styleScoreBest) {
          this.styleScoreBest = this.comboState.styleScore ?? 0;
        }
      } else {
        this.duoSynergy = addDuoSynergy(this.duoSynergy, 'partner_assist', benefits.duoSynergyMultiplier);
      }

      if (!this.isFused && this.save.fusionUnlocked) {
        this.fusionCharge = Math.min(100, this.fusionCharge + 7);
      }

      if (fx?.burn) e.burnTimer = Math.max(e.burnTimer, fx.burn);
      if (fx?.snare) e.snareTimer = Math.max(e.snareTimer, fx.snare);
      if (fx?.stun) {
        e.stunTimer = Math.max(e.stunTimer, fx.stun);
        e.state = 'stagger';
        e.stateTimer = fx.stun;
      }

      // Maintain aerial juggle hang-time if struck while juggled
      if (e.juggleTimer > 0 && e.kind !== 'boss') {
        e.vel.y = Math.max(e.vel.y, 4.4);
      } else if (e.wallPinnedTimer <= 0) {
        if (fx?.pull && e.kind !== 'boss') {
          _v1.subVectors(origin, e.pos).normalize().multiplyScalar(8);
          e.vel.add(_v1);
        } else {
          _v1.subVectors(e.pos, origin).setY(0).normalize().multiplyScalar(e.kind === 'boss' ? 2.0 : 5.2);
          e.vel.add(_v1);
        }
      }

      this.pushFloatingDamage(e.pos, Math.round(dmg), color, isCrit);
      this.spawnParticles(_v4.set(e.pos.x, e.pos.y + 1.1, e.pos.z), _colorScratch.set(color).getHex(), 8);
      this.audio.playSfx('hit');

      // Boss Phase 2 Canon-Gated Fusion Awakening!
      if (e.kind === 'boss' && e.phase === 1 && e.hp <= e.maxHp * 0.55) {
        e.phase = 2;
        e.attackPower = 30;
        e.speed = 4.6;
        if (!this.fusionAwakenedTriggered) {
          this.fusionAwakenedTriggered = true;
          this.fusionCharge = 100;
          this.duoSynergy = { ...this.duoSynergy, meter: 100 };
          this.save = { ...this.save, fusionUnlocked: true };
          this.callbacks.onSaveProgress({ fusionUnlocked: true });
          this.paused = true;
          this.callbacks.onTriggerDialogue(FUSION_AWAKENING_DIALOGUE, () => {
            this.paused = false;
          });
        }
      }

      if (e.hp <= 0) {
        defeatsThisStrike += 1;
        this.handleEnemyDefeated(e);
      }
    }

    if (defeatsThisStrike >= 2) {
      this.duoSynergy = addDuoSynergy(this.duoSynergy, 'multi_enemy_takedown', benefits.duoSynergyMultiplier);
    }

    if (hitsLanded > 0) {
      this.emitHudSnapshot();
    }
    return hitsLanded;
  }

  private handleEnemyDefeated(e: EnemyEntity): void {
    e.state = 'dead';
    e.deadTimer = 0.7;
    e.wallPinnedTimer = 0;
    e.juggleTimer = 0;
    if (this.lockedEnemyId === e.id) this.lockedEnemyId = null;

    const xpReward = ARCHETYPE_CONFIGS[e.kind]?.xpReward ?? 40;
    this.callbacks.onGrantRewards(xpReward, { 'Ash Scrap': 1 });

    // Check Mission Stage Transitions
    const aliveInStage = this.enemies.some((other) => other.stageTag === e.stageTag && other.state !== 'dead');
    if (!aliveInStage) {
      if (this.save.missionStageIndex === 0 && e.stageTag === 0) {
        this.callbacks.onSaveProgress({
          traversalTier: 'Web Evade',
          checkpointPos: [0, 0, -14],
        });
        this.advanceMissionStage(1);
      } else if (e.kind === 'boss') {
        this.isVictory = true;
        this.audio.setMood('victory');
        this.callbacks.onGrantRewards(300, {
          'Pyraxis Ember': 3,
          'Storm Capacitor': 3,
          'Myrr\'Kai Thread': 2,
        });
        const unlockedCosmetics = Array.from(
          new Set([...this.save.unlockedCosmeticIds, 'pyraxis-ember', 'karvoth-tempest'])
        );
        this.save = {
          ...this.save,
          missionCompleted: true,
          unlockedCosmeticIds: unlockedCosmetics,
          combatMastery: (this.save.combatMastery || 0) + 1,
        };
        this.callbacks.onSaveProgress({
          missionCompleted: true,
          unlockedCosmeticIds: unlockedCosmetics,
          combatMastery: this.save.combatMastery,
        });
        this.paused = true;
        this.callbacks.onTriggerDialogue(MISSION_1_VICTORY_DIALOGUE, () => {
          this.paused = false;
        });
      }
    }
  }

  private pushFloatingDamage(worldPos: THREE.Vector3, amount: number, color: string, isCrit = false): void {
    _v3.set(worldPos.x, worldPos.y + 1.8, worldPos.z).project(this.camera);
    if (_v3.z > 1) return;
    const x = (_v3.x * 0.5 + 0.5) * this.container.clientWidth;
    const y = (-_v3.y * 0.5 + 0.5) * this.container.clientHeight;
    this.floatingDamages.push({
      id: this.nextDamageId++,
      x: x + (Math.random() - 0.5) * 28,
      y,
      amount,
      color,
      isCrit,
      age: 0,
    });
    if (this.floatingDamages.length > 16) this.floatingDamages.shift();
  }

  private pushFloatingLabel(worldPos: THREE.Vector3, label: string, color: string): void {
    _v3.set(worldPos.x, worldPos.y + 2.2, worldPos.z).project(this.camera);
    if (_v3.z > 1) return;
    const x = (_v3.x * 0.5 + 0.5) * this.container.clientWidth;
    const y = (-_v3.y * 0.5 + 0.5) * this.container.clientHeight;
    this.floatingDamages.push({
      id: this.nextDamageId++,
      x,
      y,
      amount: 0,
      label,
      color,
      age: 0,
    });
  }

  private spawnParticles(origin: THREE.Vector3, colorHex: number, count: number): void {
    let spawned = 0;
    for (const p of this.particlePool) {
      if (p.active) continue;
      p.active = true;
      p.life = 0;
      p.maxLife = 0.35 + Math.random() * 0.35;
      p.mesh.visible = true;
      p.mesh.position.set(origin.x, origin.y + 0.8, origin.z);
      (p.mesh.material as THREE.MeshBasicMaterial).color.setHex(colorHex);
      (p.mesh.material as THREE.MeshBasicMaterial).opacity = 1;
      p.vel.set((Math.random() - 0.5) * 8, 2 + Math.random() * 6, (Math.random() - 0.5) * 8);
      spawned++;
      if (spawned >= count) break;
    }
  }

  private startLoop(): void {
    this.clock.start();
    const tick = (now = performance.now()) => {
      if (this.disposed) return;

      // Respect 30 FPS / 60 FPS hardware budget
      const minInterval = this.settings.targetFps === 30 ? 31 : 0;
      if (!this.isSoftwareGl && minInterval > 0 && now - this.lastTickTime < minInterval) {
        this.frameId = requestAnimationFrame(tick);
        return;
      }
      this.lastTickTime = now;

      const rawDt = this.clock.getDelta();
      const dt = Math.min(rawDt, 0.05);
      const elapsed = this.clock.elapsedTime;

      // Rolling 120-frame buffer for 1% Low FPS & Adaptive Resolution Scaling (Zero GC)
      if (rawDt > 0.001 && rawDt < 0.5) {
        this.frameTimesRing[this.frameRingIdx] = rawDt;
        this.frameRingIdx = (this.frameRingIdx + 1) % this.frameTimesRing.length;
        this.frameRingCount = Math.min(this.frameTimesRing.length, this.frameRingCount + 1);
      }

      this.fpsAccum += rawDt;
      this.fpsFrames += 1;
      if (this.fpsAccum >= 0.5) {
        this.fpsEstimate = Math.round(this.fpsFrames / this.fpsAccum);
        this.fpsAccum = 0;
        this.fpsFrames = 0;

        // Compute 1% worst frame time from ring buffer
        let worstDt = 0.0166;
        for (let i = 0; i < this.frameRingCount; i++) {
          if (this.frameTimesRing[i] > worstDt) worstDt = this.frameTimesRing[i];
        }
        this.onePercentLowFps = Math.max(1, Math.round(1 / worstDt));

        // Adaptive pixelRatio step-down under sustained thermal/GPU load
        if (!this.isSoftwareGl && !this.adaptiveScaleApplied && this.settings.graphicsQuality !== 'low') {
          if (this.fpsEstimate < 26) {
            this.lowFpsDuration += 0.5;
            if (this.lowFpsDuration >= 2.0) {
              this.adaptiveScaleApplied = true;
              this.renderer.setPixelRatio(1.0);
            }
          } else {
            this.lowFpsDuration = 0;
          }
        }
      }

      if (this.titleShowcaseMode) {
        this.updateTitleShowcase(dt, elapsed);
      } else if (!this.paused) {
        this.updateGameplay(dt, elapsed);
      }

      this.world.updateVisuals(elapsed, dt, this.camera.position);
      this.renderer.render(this.scene, this.camera);

      if (this.isSoftwareGl) {
        this.afterDraw(() => tick(performance.now()));
      } else {
        this.frameId = requestAnimationFrame(tick);
      }
    };

    if (this.isSoftwareGl) {
      this.frameId = requestAnimationFrame(() => tick(performance.now()));
    } else {
      this.frameId = requestAnimationFrame(tick);
    }
  }

  private afterDraw(cb: () => void): void {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    if (!gl || typeof gl.fenceSync !== 'function') {
      this.frameId = window.setTimeout(cb, 80);
      return;
    }
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (this.disposed) return;
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 80);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private updateTitleShowcase(dt: number, elapsed: number): void {
    const camX = Math.sin(elapsed * 0.25) * 1.35 + 0.35;
    this.camera.position.set(camX, 2.08, 13.55);
    this.camera.lookAt(-0.15, 1.18, 8.2);
    if (this.kaiGlb.status === 'ready') {
      this.kaiGlb.update(dt, elapsed, this.showcaseMotionSample);
    } else {
      this.animateHeroPose(this.kaiRig, 0, false, elapsed, 'kai');
    }
    if (this.jaxGlb.status === 'ready') {
      this.jaxGlb.update(dt, elapsed, this.showcaseMotionSample);
    } else {
      this.animateHeroPose(this.jaxRig, 0, false, elapsed, 'jax');
    }
    if (this.borynGlb.status === 'ready') {
      this.borynGlb.update(dt, elapsed, this.showcaseMotionSample);
    }
    if (this.boraxGlb.status === 'ready') {
      this.boraxGlb.update(dt, elapsed, this.showcaseMotionSample);
    }
    this.objectiveBeacon.visible = false;
  }

  private updateActiveDuoFinisher(dt: number): void {
    if (!this.activeFinisher) return;
    const target = this.enemies.find((e) => e.id === this.activeFinisher!.targetEnemyId);
    const center = target ? target.pos : this.playerPos;

    // Choreograph Kai & Jax flanking orbits cleanly around the target
    const progress = this.activeFinisher.elapsed / Math.max(0.1, this.activeFinisher.finisher.duration);
    const angle = progress * Math.PI * 1.65;
    if (!this.isFused) {
      this.playerPos.set(center.x + Math.sin(angle) * 1.45, center.y, center.z + Math.cos(angle) * 1.45);
      this.playerYaw = Math.atan2(center.x - this.playerPos.x, center.z - this.playerPos.z);
      this.companionPos.set(
        center.x - Math.sin(angle) * 1.45,
        center.y,
        center.z - Math.cos(angle) * 1.45
      );
      this.companionYaw = Math.atan2(center.x - this.companionPos.x, center.z - this.companionPos.z);
      this.companionAttackCd = 1.3;
    } else {
      this.playerPos.set(center.x, center.y + Math.sin(progress * Math.PI) * 1.1, center.z + 1.35);
      this.playerYaw = Math.atan2(center.x - this.playerPos.x, center.z - this.playerPos.z);
    }
    this.attackTimer = 0.25;
    this.activeAttackType = 'ability';

    const stepped = stepDuoFinisher(this.activeFinisher, dt);
    this.activeFinisher = stepped.nextExecution;

    if (stepped.triggeredImpactMultipliers.length > 0) {
      const kStats = computeHeroStats('kai', this.save.heroes.kai);
      const jStats = computeHeroStats('jax', this.save.heroes.jax);
      const combinedAtk = (kStats.attack + jStats.attack) * 0.65;
      for (const mult of stepped.triggeredImpactMultipliers) {
        this.screenShake = 0.28;
        this.hitstopTimer = Math.max(this.hitstopTimer, 0.052);
        this.damageEnemiesInRadius(
          center,
          this.activeFinisher.finisher.aoeRadius,
          combinedAtk * mult,
          '#D4AF37',
          true,
          { stun: 1.5, armorBreak: 80, moveTag: `finisher_${this.activeFinisher.finisher.id}` }
        );
        this.spawnParticles(center, 0xf97316, 14);
        this.spawnParticles(center, 0x38bdf8, 14);
      }
    }

    if (this.activeFinisher.completed) {
      this.activeFinisher = null;
      this.attackTimer = 0;
      this.activeAttackType = 'none';
    }
  }

  private updateGameplay(dt: number, elapsed: number): void {
    // Poll Gamepad API via remappable edge-triggered mapper
    this.pollGamepad();

    // Brief tactile hitstop freezes actor simulation slightly while keeping camera & UI silky-smooth
    this.hitstopTimer = Math.max(0, this.hitstopTimer - dt);
    const simDt = this.hitstopTimer > 0 ? dt * 0.08 : dt;

    // Update Cooldowns & Timers
    this.playerHurtFlash = Math.max(0, this.playerHurtFlash - dt);
    for (let i = 0; i < 3; i++) {
      this.abilityCooldowns[i] = Math.max(0, this.abilityCooldowns[i] - dt);
    }
    this.tacticalCooldown = Math.max(0, this.tacticalCooldown - dt);
    this.webVisualTimer = Math.max(0, this.webVisualTimer - dt);
    this.dodgeTimer = Math.max(0, this.dodgeTimer - dt);
    this.dodgeCooldown = Math.max(0, this.dodgeCooldown - dt);
    this.parryWindow = Math.max(0, this.parryWindow - dt);
    this.counterWindow = tickCounterWindow(this.counterWindow, dt);
    this.shadowInkTimer = Math.max(0, this.shadowInkTimer - dt);
    this.thryxenTimer = Math.max(0, this.thryxenTimer - dt);
    this.fusionCooldown = Math.max(0, this.fusionCooldown - dt);
    this.comboResetTimer = Math.max(0, this.comboResetTimer - simDt);
    if (this.comboResetTimer === 0) this.attackComboStep = 0;
    this.comboState = tickComboDecay(this.comboState, simDt);
    this.combatBuffer = tickCombatBuffer(this.combatBuffer, dt);
    this.coyoteTimer = this.grounded ? 0.13 : Math.max(0, this.coyoteTimer - simDt);
    this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - dt);
    this.screenShake = Math.max(0, this.screenShake - dt * 1.9);

    // Passive Energy Regen
    this.kaiEnergy = Math.min(this.kaiMaxEnergy, this.kaiEnergy + dt * 7.5);
    this.jaxEnergy = Math.min(this.jaxMaxEnergy, this.jaxEnergy + dt * 7.5);

    if (this.isFused) {
      this.fusionTimeLeft -= dt;
      if (this.fusionTimeLeft <= 0) this.endFusion();
    }

    if (this.activeFinisher && !this.isGameOver) {
      this.updateActiveDuoFinisher(simDt);
    } else if (!this.isGameOver) {
      this.flushBufferedCombatInput();
      this.updatePlayerMovement(simDt);
      this.updateActiveAttack(simDt);
      if (!this.isFused) {
        this.updateCompanionAI(simDt, elapsed);
      }
    }

    // Enemies AI & Combat Director
    this.updateEnemies(simDt, elapsed);

    // Particles & Floating Damage
    for (const p of this.particlePool) {
      if (!p.active) continue;
      p.life += dt;
      if (p.life >= p.maxLife) {
        p.active = false;
        p.mesh.visible = false;
        continue;
      }
      p.vel.y -= 14 * dt;
      p.mesh.position.addScaledVector(p.vel, dt);
      (p.mesh.material as THREE.MeshBasicMaterial).opacity = 1 - p.life / p.maxLife;
    }
    this.floatingDamages = this.floatingDamages
      .map((f) => ({ ...f, y: f.y - 38 * dt, age: f.age + dt }))
      .filter((f) => f.age < 0.85);

    // Sync Rigged GLB Instances (with zero-pop-in fallback pose support)
    const activeGlb =
      this.activeHero === 'kaijax' ? this.kaiJaxGlb : this.activeHero === 'kai' ? this.kaiGlb : this.jaxGlb;
    const activeFallbackRig =
      this.activeHero === 'kaijax' ? this.kaiJaxRig : this.activeHero === 'kai' ? this.kaiRig : this.jaxRig;

    activeGlb.root.position.copy(this.playerPos);
    activeGlb.root.rotation.y = this.playerYaw;
    const hSpeed = Math.hypot(this.playerVel.x, this.playerVel.z);
    const sprinting = this.touchSprint || this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');

    const pm = this.playerMotionSample;
    pm.planarSpeed = hSpeed;
    pm.sprinting = sprinting;
    pm.grounded = this.grounded;
    pm.verticalVel = this.playerVel.y;
    pm.isWallRunning = this.isWallRunning;
    pm.isSwinging = this.isSwinging;
    pm.dodgeActive = this.dodgeTimer > 0;
    pm.parryActive = this.parryWindow > 0;
    pm.attackType = this.activeAttackType;
    pm.comboStep = this.attackComboStep;
    pm.attackActive = this.attackTimer > 0;
    pm.hurtActive = this.playerHurtFlash > 0;
    pm.thryxenActive = this.thryxenTimer > 0;
    pm.shadowInked = this.shadowInkTimer > 0;
    pm.isVictory = this.isVictory;
    pm.isDefeat = this.isGameOver;
    pm.showcaseMode = false;
    pm.turnYawDelta = this.lastTurnYawDelta;
    pm.landingImpact = this.lastLandingImpact;
    this.lastLandingImpact = 0;

    if (activeGlb.status === 'ready') {
      activeGlb.update(simDt, elapsed, pm);
    } else {
      this.animateHeroPose(activeFallbackRig, hSpeed, this.attackTimer > 0, elapsed, this.activeHero);
    }

    if (!this.isFused) {
      const compHero = this.baseHero === 'kai' ? 'jax' : 'kai';
      const compGlb = compHero === 'jax' ? this.jaxGlb : this.kaiGlb;
      const compFallbackRig = compHero === 'jax' ? this.jaxRig : this.kaiRig;
      compGlb.root.position.copy(this.companionPos);
      compGlb.root.rotation.y = this.companionYaw;
      const cSpeed = Math.hypot(this.companionVel.x, this.companionVel.z);

      const cm = this.companionMotionSample;
      cm.planarSpeed = cSpeed;
      cm.sprinting = cSpeed > 7.8;
      cm.grounded = Math.abs(this.companionVel.y) < 0.35;
      cm.verticalVel = this.companionVel.y;
      cm.attackType = this.companionAttackCd > 1.1 ? 'light' : 'none';
      cm.comboStep = 1;
      cm.attackActive = this.companionAttackCd > 1.1;
      cm.isVictory = this.isVictory;
      cm.isDefeat = this.isGameOver;
      cm.turnYawDelta = 0;
      cm.landingImpact = 0;

      if (compGlb.status === 'ready') {
        compGlb.update(simDt, elapsed, cm);
      } else {
        this.animateHeroPose(compFallbackRig, cSpeed, this.companionAttackCd > 1.1, elapsed, compHero);
      }
    }

    // Update Ashblock Sanctuary Mentor GLBs (Boryn & Borax)
    if (this.borynGlb.status === 'ready') {
      this.borynGlb.update(dt, elapsed, this.showcaseMotionSample);
    }
    if (this.boraxGlb.status === 'ready') {
      this.boraxGlb.update(dt, elapsed, this.showcaseMotionSample);
    }

    // Web Swing or Tactical Web Tether Line Visual (terminates directly on physical steel supportPoint!)
    if (this.isSwinging) {
      if (shouldAutoReleaseTether(this.swingAnchorPos, this.playerPos, false, this.world.colliders, 22)) {
        this.isSwinging = false;
        this.activeWebAnchorId = null;
        this.activeWebAttachmentType = null;
        this.webLine.visible = false;
      } else {
        const posAttr = this.webLineGeo.attributes.position as THREE.BufferAttribute;
        posAttr.setXYZ(0, this.playerPos.x, this.playerPos.y + 1.3, this.playerPos.z);
        posAttr.setXYZ(1, this.swingSupportPos.x, this.swingSupportPos.y, this.swingSupportPos.z);
        posAttr.needsUpdate = true;
        this.webLine.visible = true;
      }
    } else if (this.webVisualTimer > 0) {
      const posAttr = this.webLineGeo.attributes.position as THREE.BufferAttribute;
      posAttr.setXYZ(0, this.playerPos.x, this.playerPos.y + 1.25, this.playerPos.z);
      posAttr.setXYZ(1, this.webVisualEnd.x, this.webVisualEnd.y, this.webVisualEnd.z);
      posAttr.needsUpdate = true;
      this.webLine.visible = true;
    } else {
      this.webLine.visible = false;
    }

    // Objective Beacon (fades out within 15m of active objective or inside Boss Courtyard encounter so arena framing stays spotless)
    const step = MISSION_1_STEPS[this.save.missionStageIndex];
    if (step?.targetPos && !this.save.missionCompleted) {
      const dx = this.playerPos.x - step.targetPos[0];
      const dz = this.playerPos.z - step.targetPos[2];
      const distSq = dx * dx + dz * dz;
      const showBeacon = distSq > 225 && !(this.playerPos.z < -56 && step.targetPos[2] < -60);
      this.objectiveBeacon.visible = showBeacon;
      if (showBeacon) {
        this.objectiveBeacon.position.set(step.targetPos[0], 6, step.targetPos[2]);
      }
    } else {
      this.objectiveBeacon.visible = false;
    }

    // Update Camera with Wall Obstruction Pull-In
    this.updateCamera(dt, hSpeed);

    // Emit throttled HUD snapshot (~20Hz)
    this.hudEmitTimer += dt;
    if (this.hudEmitTimer >= 0.05) {
      this.hudEmitTimer = 0;
      this.emitHudSnapshot();
    }
  }

  private flushBufferedCombatInput(): void {
    const act = this.combatBuffer.action;
    if (!act || this.combatBuffer.remainingSeconds <= 0) return;

    if (
      act === 'dodge' &&
      this.dodgeCooldown <= 0 &&
      canCancelAttackIntoDodge(this.attackTimer, this.activeAttackType)
    ) {
      this.combatBuffer = consumeBufferedAction(this.combatBuffer).nextState;
      this.triggerDodgeOrParry();
      return;
    }
    if (act === 'duo') {
      this.combatBuffer = consumeBufferedAction(this.combatBuffer).nextState;
      this.triggerDuoFinisher();
      return;
    }
    if (act === 'light' && this.attackTimer <= 0.14) {
      this.combatBuffer = consumeBufferedAction(this.combatBuffer).nextState;
      this.triggerLightAttack();
      return;
    }
    if (act === 'heavy' && this.attackTimer <= 0.15) {
      this.combatBuffer = consumeBufferedAction(this.combatBuffer).nextState;
      this.triggerHeavyAttack();
      return;
    }
    if (act === 'tactical' && this.tacticalCooldown <= 0 && this.attackTimer <= 0.16) {
      this.combatBuffer = consumeBufferedAction(this.combatBuffer).nextState;
      this.triggerTacticalAction();
      return;
    }
    if (
      (act === 'ability_1' || act === 'ability_2' || act === 'ability_3') &&
      this.attackTimer <= 0.22
    ) {
      this.combatBuffer = consumeBufferedAction(this.combatBuffer).nextState;
      const slot = act === 'ability_1' ? 1 : act === 'ability_2' ? 2 : 3;
      this.triggerAbility(slot);
    }
  }

  private updatePlayerMovement(dt: number): void {
    // Combine keyboard + virtual joystick
    let ix = this.touchMove.x;
    let iy = this.touchMove.y;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) ix -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) ix += 1;
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) iy -= 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) iy += 1;

    const inputMag = Math.min(1, Math.hypot(ix, iy));
    const sprinting = this.touchSprint || this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');
    const stats = computeHeroStats(this.baseHero, this.save.heroes[this.baseHero]);
    const moveSpeed = (sprinting ? 10.6 : 7.4) * stats.speedMult * (this.isFused ? 1.18 : 1.0);

    // Camera-relative planar axes
    _camFwd.set(-Math.sin(this.camYaw), 0, -Math.cos(this.camYaw)).normalize();
    _camRight.set(Math.cos(this.camYaw), 0, -Math.sin(this.camYaw)).normalize();

    if (this.dodgeTimer <= 0 && this.attackTimer <= 0.05) {
      if (inputMag > 0.08) {
        _v1.set(0, 0, 0).addScaledVector(_camRight, ix).addScaledVector(_camFwd, -iy).normalize();
        const targetYaw = Math.atan2(_v1.x, _v1.z);
        // Smooth weighted yaw turn + turn-bank signal
        let diff = targetYaw - this.playerYaw;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        const yawStep = diff * Math.min(1, dt * (this.grounded ? 15.5 : 9.5));
        this.playerYaw += yawStep;
        this.lastTurnYawDelta = THREE.MathUtils.clamp((yawStep / Math.max(0.008, dt)) * 0.09, -1.35, 1.35);

        const curSpeed = Math.hypot(this.playerVel.x, this.playerVel.z);
        const curDot =
          curSpeed > 0.5
            ? (this.playerVel.x * _v1.x + this.playerVel.z * _v1.z) / curSpeed
            : 1.0;

        // Crisp grounded pivot-brake & acceleration response
        let accelDamp = this.grounded ? 19.5 : 10.0;
        if (this.grounded && curSpeed > 5.0 && curDot < -0.3) {
          accelDamp = 24.0;
          if (this.strideDustTimer <= 0) {
            this.strideDustTimer = 0.2;
            this.spawnParticles(this.playerPos, 0x94a3b8, 4);
          }
        }

        const targetVx = _v1.x * moveSpeed * inputMag;
        const targetVz = _v1.z * moveSpeed * inputMag;
        this.playerVel.x = THREE.MathUtils.damp(this.playerVel.x, targetVx, accelDamp, dt);
        this.playerVel.z = THREE.MathUtils.damp(this.playerVel.z, targetVz, accelDamp, dt);

        // Subtle sprint foot-plant dust cadence
        this.strideDustTimer = Math.max(0, this.strideDustTimer - dt);
        if (this.grounded && sprinting && curSpeed > 8.2 && this.strideDustTimer <= 0) {
          this.strideDustTimer = 0.28;
          this.spawnParticles(
            _v3.set(this.playerPos.x, this.playerPos.y - 0.55, this.playerPos.z),
            this.activeHero === 'jax' ? 0x38bdf8 : 0x64748b,
            2
          );
        }
      } else {
        this.lastTurnYawDelta = THREE.MathUtils.damp(this.lastTurnYawDelta, 0, 12, dt);
        const decelDamp = this.grounded ? 15.5 : 2.5;
        this.playerVel.x = THREE.MathUtils.damp(this.playerVel.x, 0, decelDamp, dt);
        this.playerVel.z = THREE.MathUtils.damp(this.playerVel.z, 0, decelDamp, dt);
      }
    } else {
      this.lastTurnYawDelta = THREE.MathUtils.damp(this.lastTurnYawDelta, 0, 14, dt);
    }

    // Guided Zip-to-Anchor Traversal OR Momentum Pendulum Web Swinging
    if (this.zipActive) {
      this.zipTimer -= dt;
      _v2.subVectors(this.zipTargetPos, this.playerPos);
      const dist = _v2.length();
      if (dist <= 1.25 || this.zipTimer <= 0) {
        this.zipActive = false;
        this.zipCompletedCount += 1;
        this.webVisualTimer = 0;
        this.activeWebAnchorId = null;
        this.activeWebAttachmentType = null;
        this.webLine.visible = false;
        // Clean perch arrival hop so player lands squarely on elevated balcony/rooftop deck
        this.playerVel.set(this.playerVel.x * 0.28, 4.4, this.playerVel.z * 0.28);
      } else {
        _v2.normalize().multiplyScalar(21.5);
        this.playerVel.copy(_v2);
      }
    } else if (this.isSwinging) {
      // Real pendulum mechanics: gravity accelerates downswing + radial rope constraint converts drop into forward tangential speed!
      this.playerVel.y -= 19.2 * dt;
      const fwdX = Math.sin(this.playerYaw);
      const fwdZ = Math.cos(this.playerYaw);
      this.playerVel.x += fwdX * 12.2 * dt;
      this.playerVel.z += fwdZ * 12.2 * dt;
      this.swingRopeLength = Math.max(3.4, this.swingRopeLength - 1.35 * dt);

      _v2.subVectors(this.playerPos, this.swingAnchorPos);
      const dist = _v2.length();
      if (dist > this.swingRopeLength && dist > 0.001) {
        _v2.divideScalar(dist);
        this.playerPos.copy(this.swingAnchorPos).addScaledVector(_v2, this.swingRopeLength);
        this.playerPos.y = Math.max(0.45, this.playerPos.y);
        const outwardRadial = this.playerVel.dot(_v2);
        if (outwardRadial > 0) {
          this.playerVel.addScaledVector(_v2, -outwardRadial);
        }
      }
      this.swingPeakSpeed = Math.max(this.swingPeakSpeed, this.playerVel.length());
      // Auto-release cleanly near upswing crest ahead of anchor with conserved tangential momentum
      const pastAnchor =
        (this.playerPos.x - this.swingAnchorPos.x) * fwdX +
          (this.playerPos.z - this.swingAnchorPos.z) * fwdZ >
        1.5;
      if (pastAnchor && this.playerVel.y > 4.2 && this.playerPos.y > this.swingAnchorPos.y - 2.0) {
        this.isSwinging = false;
        this.webLine.visible = false;
      }
    } else {
      // Apex hang-time & weighted landing gravity curve
      const grav = this.isWallRunning
        ? 3.5
        : Math.abs(this.playerVel.y) <= 2.2
          ? 15.8
          : this.playerVel.y > 0
            ? 21.5
            : 27.5;
      this.playerVel.y = Math.max(-24.0, this.playerVel.y - grav * dt);
    }

    // Integrate & Resolve Collisions
    this.moveWithColliders(this.playerPos, this.playerVel, dt, true);
  }

  private moveWithColliders(pos: THREE.Vector3, vel: THREE.Vector3, dt: number, isPlayer: boolean): void {
    const r = 0.48;
    const h = 1.75;

    // Horizontal X
    pos.x += vel.x * dt;
    let touchedWall = false;
    for (let i = 0; i < this.world.colliders.length; i++) {
      if (i === this.world.alleyGateColliderIndex && this.world.alleyGateOpen) continue;
      const c = this.world.colliders[i];
      if (pos.y + 0.35 < c.maxY && pos.y + h > c.minY && pos.z + r > c.minZ && pos.z - r < c.maxZ) {
        if (pos.x + r > c.minX && pos.x - r < c.maxX) {
          if (vel.x > 0) pos.x = c.minX - r;
          else if (vel.x < 0) pos.x = c.maxX + r;
          vel.x = 0;
          if (c.wallRunnable) touchedWall = true;
        }
      }
    }

    // Horizontal Z
    pos.z += vel.z * dt;
    for (let i = 0; i < this.world.colliders.length; i++) {
      if (i === this.world.alleyGateColliderIndex && this.world.alleyGateOpen) continue;
      const c = this.world.colliders[i];
      if (pos.y + 0.35 < c.maxY && pos.y + h > c.minY && pos.x + r > c.minX && pos.x - r < c.maxX) {
        if (pos.z + r > c.minZ && pos.z - r < c.maxZ) {
          if (vel.z > 0) pos.z = c.minZ - r;
          else if (vel.z < 0) pos.z = c.maxZ + r;
          vel.z = 0;
          if (c.wallRunnable) touchedWall = true;
        }
      }
    }

    // Wall-run detection when airborne & moving against a wall-runnable facade
    if (isPlayer) {
      if (!this.grounded && touchedWall && Math.hypot(vel.x, vel.z) > 3.0 && this.wallRunTimer < 1.4) {
        this.isWallRunning = true;
        this.wallRunTimer += dt;
        vel.y = Math.max(vel.y, 0.8);
      } else {
        this.isWallRunning = false;
        if (this.grounded) this.wallRunTimer = 0;
      }
    }

    // Vertical Y + Walkable Rooftops / Containers
    pos.y += vel.y * dt;
    let floorY = 0;
    for (let i = 0; i < this.world.colliders.length; i++) {
      const c = this.world.colliders[i];
      if (!c.walkableTop) continue;
      if (pos.x + r > c.minX && pos.x - r < c.maxX && pos.z + r > c.minZ && pos.z - r < c.maxZ) {
        if (pos.y >= c.maxY - 0.55) {
          floorY = Math.max(floorY, c.maxY);
        }
      }
    }

    if (pos.y <= floorY) {
      const fallSpeed = -vel.y;
      pos.y = floorY;
      vel.y = 0;
      if (isPlayer) {
        if (!this.grounded && fallSpeed > 3.2) {
          this.lastLandingImpact = THREE.MathUtils.clamp(fallSpeed / 14.5, 0.16, 1.0);
          if (fallSpeed > 8.5) {
            this.spawnParticles(
              _v3.set(pos.x, pos.y - 0.5, pos.z),
              this.activeHero === 'jax' ? 0x38bdf8 : 0x94a3b8,
              5
            );
          }
        }
        this.grounded = true;
        this.jumpsUsed = 0;
        this.isSwinging = false;
        this.webLine.visible = false;
        if (this.jumpBufferTimer > 0) {
          this.jumpBufferTimer = 0;
          this.triggerJumpOrSwing();
        }
      }
    } else if (isPlayer) {
      this.grounded = false;
    }

    // Clamp playable outer district bounds
    pos.x = THREE.MathUtils.clamp(pos.x, -21, 21);
    pos.z = THREE.MathUtils.clamp(pos.z, -89, 19);
  }

  private updateActiveAttack(dt: number): void {
    if (this.attackTimer <= 0) {
      this.activeAttackType = 'none';
      this.activeMoveIsGuardBreak = false;
      return;
    }
    this.attackTimer -= dt;
    if (!this.attackHitApplied && this.attackTimer < 0.22) {
      this.attackHitApplied = true;
      const stats = computeHeroStats(this.baseHero, this.save.heroes[this.baseHero]);
      const mult =
        this.activeAttackType === 'heavy'
          ? 1.78
          : this.activeAttackType === 'air'
            ? 1.52
            : this.attackComboStep === 3
              ? 1.48
              : 1.0;
      const dmg = stats.attack * mult * (this.isFused ? 1.4 : 1.0);
      const color =
        this.activeHero === 'jax' ? '#38BDF8' : this.activeHero === 'kai' ? '#8B5CF6' : '#F97316';
      const activeGlb =
        this.activeHero === 'kaijax' ? this.kaiJaxGlb : this.activeHero === 'kai' ? this.kaiGlb : this.jaxGlb;
      const strikeCenter = activeGlb.getStrikeOriginWorld(this.playerYaw, _v2);
      const moveTag =
        this.activeAttackType === 'heavy'
          ? `${this.activeHero}_heavy`
          : this.activeAttackType === 'air'
            ? `${this.activeHero}_air_${this.attackComboStep}`
            : `${this.activeHero}_light_${this.attackComboStep}`;

      const hits = this.damageEnemiesInRadius(
        strikeCenter,
        this.activeAttackType === 'heavy' ? 3.5 : 2.9,
        dmg,
        color,
        this.activeMoveIsGuardBreak || this.activeAttackType === 'heavy',
        { moveTag }
      );
      if (hits > 0) {
        if (this.activeAttackType === 'heavy') {
          this.hitstopTimer = Math.max(this.hitstopTimer, 0.038);
          this.screenShake = Math.max(this.screenShake, 0.16);
        } else if (this.attackComboStep === 3 || this.activeAttackType === 'air') {
          this.hitstopTimer = Math.max(this.hitstopTimer, 0.022);
        }
      }
      if (this.thryxenTimer > 0 && this.activeHero === 'jax') {
        this.damageEnemiesInRadius(strikeCenter, 4.5, dmg * 0.45, '#38BDF8', false, {
          moveTag: 'thryxen_arc',
        });
      }
      // Penalize committed Heavy whiff if no target or crate was struck
      if (hits === 0 && this.activeAttackType === 'heavy') {
        this.comboState = registerCommittedWhiff(this.comboState, 1.4);
      }
    }
  }

  private updateCompanionAI(dt: number, _elapsed: number): void {
    this.companionAttackCd = Math.max(0, this.companionAttackCd - dt);
    const compHero = this.baseHero === 'kai' ? 'jax' : 'kai';
    const nearestThreat = this.findNearestEnemy(12);

    if (
      (nearestThreat && this.save.missionStageIndex === nearestThreat.stageTag) ||
      (nearestThreat && nearestThreat.stageTag === 99)
    ) {
      // Prefer a secondary live enemy in group fights or flank perpendicular around solo/boss targets (zero sibling stacking)
      const altThreat =
        this.enemies.find(
          (e) =>
            e.state !== 'dead' &&
            e.id !== nearestThreat.id &&
            (e.stageTag === this.save.missionStageIndex || e.stageTag === 99) &&
            e.pos.distanceTo(this.playerPos) <= 10.5
        ) ?? nearestThreat;

      _v2.subVectors(altThreat.pos, this.playerPos).setY(0);
      if (_v2.lengthSq() < 0.01) _v2.set(0, 0, 1);
      else _v2.normalize();

      // Flanking target point beside enemy opposite player attack vector
      const sideSign = altThreat.id === nearestThreat.id ? 1 : 0.45;
      _v4.set(
        altThreat.pos.x - _v2.z * 2.05 * sideSign,
        altThreat.pos.y,
        altThreat.pos.z + _v2.x * 2.05 * sideSign
      );

      const distToEnemy = altThreat.pos.distanceTo(this.companionPos);
      const distToFlank = _v4.distanceTo(this.companionPos);
      _v1.subVectors(altThreat.pos, this.companionPos).setY(0);
      this.companionYaw = Math.atan2(_v1.x, _v1.z);

      if (distToFlank > 1.35) {
        _v1.subVectors(_v4, this.companionPos).setY(0).normalize().multiplyScalar(6.9);
        this.companionVel.x = THREE.MathUtils.damp(this.companionVel.x, _v1.x, 8.5, dt);
        this.companionVel.z = THREE.MathUtils.damp(this.companionVel.z, _v1.z, 8.5, dt);
      } else {
        this.companionVel.x = THREE.MathUtils.damp(this.companionVel.x, 0, 12, dt);
        this.companionVel.z = THREE.MathUtils.damp(this.companionVel.z, 0, 12, dt);
        if (this.companionAttackCd <= 0 && distToEnemy <= 2.9) {
          this.companionAttackCd = 1.45;
          const compStats = computeHeroStats(compHero, this.save.heroes[compHero]);
          this.damageEnemiesInRadius(
            altThreat.pos,
            2.2,
            compStats.attack * 0.65,
            compHero === 'jax' ? '#38BDF8' : '#8B5CF6',
            compHero === 'jax', // Jax companion helps chip shields/armor!
            { isCompanionAssist: true }
          );
        }
      }
    } else {
      // Follow player at smart flank offset (or inline behind player on narrow elevated skybridges)
      const onNarrowSkybridge = this.playerPos.y >= 5.0 && Math.abs(this.playerPos.x) < 12.2;
      if (onNarrowSkybridge) {
        _v4.set(
          this.playerPos.x - Math.sin(this.playerYaw) * 1.75,
          this.playerPos.y,
          this.playerPos.z - Math.cos(this.playerYaw) * 1.75
        );
      } else {
        _v4.set(
          this.playerPos.x - Math.cos(this.playerYaw) * 2.1,
          this.playerPos.y,
          this.playerPos.z + Math.sin(this.playerYaw) * 2.1
        );
      }
      const dist = _v4.distanceTo(this.companionPos);
      const dy = this.playerPos.y - this.companionPos.y;
      if (dist > 14 || (this.grounded && dy > 4.2 && dist > 5.2)) {
        this.companionPos.copy(_v4);
        this.companionVel.set(0, 0, 0);
      } else if (dist > 1.4) {
        _v1.subVectors(_v4, this.companionPos).setY(0).normalize().multiplyScalar(7.6);
        this.companionVel.x = THREE.MathUtils.damp(this.companionVel.x, _v1.x, 8, dt);
        this.companionVel.z = THREE.MathUtils.damp(this.companionVel.z, _v1.z, 8, dt);
        this.companionYaw = Math.atan2(this.companionVel.x, this.companionVel.z);
        if (this.grounded && dy > 1.35 && Math.abs(this.companionVel.y) < 0.25) {
          this.companionVel.y = 10.8;
        }
      } else {
        this.companionVel.x = THREE.MathUtils.damp(this.companionVel.x, 0, 12, dt);
        this.companionVel.z = THREE.MathUtils.damp(this.companionVel.z, 0, 12, dt);
      }
    }

    this.companionVel.y -= 24 * dt;
    this.moveWithColliders(this.companionPos, this.companionVel, dt, false);
  }

  private updateEnemies(dt: number, elapsed: number): void {
    let anyInCombat = false;
    // Attack-Token Regulation: Max 2 non-boss attackers winding up / striking simultaneously
    const attackTokens = allocateAttackTokens(this.enemies, this.playerPos, 2);

    for (const e of this.enemies) {
      if (e.state === 'dead') {
        e.deadTimer -= dt;
        e.rig.root.scale.setScalar(Math.max(0.01, e.deadTimer / 0.7));
        if (e.deadTimer <= 0) e.rig.root.visible = false;
        continue;
      }

      // Status Effects & Automatic Release Guarantees
      if (e.burnTimer > 0) {
        e.burnTimer -= dt;
        e.hp = Math.max(1, e.hp - 10 * dt);
      }
      e.snareTimer = Math.max(0, e.snareTimer - dt);
      e.stunTimer = Math.max(0, e.stunTimer - dt);
      e.juggleTimer = Math.max(0, e.juggleTimer - dt);
      if (e.wallPinnedTimer > 0) {
        e.wallPinnedTimer = Math.max(0, e.wallPinnedTimer - dt);
        e.vel.set(0, 0, 0);
        if (e.wallPinnedTimer === 0 && e.state === 'stagger') {
          e.state = 'chase';
        }
      }
      e.hitFlash = Math.max(0, e.hitFlash - dt);
      e.rig.visorMat.emissiveIntensity = e.hitFlash > 0 ? 4.5 : 1.8;

      const distToPlayer = e.pos.distanceTo(this.playerPos);
      if (distToPlayer < 22) anyInCombat = true;

      const cfg = ARCHETYPE_CONFIGS[e.kind];
      const speedFactor = e.snareTimer > 0 ? 0.35 : 1.0;
      const telegraphMat = e.rig.telegraphRing.material as THREE.MeshBasicMaterial;
      telegraphMat.opacity = 0;

      // Shadow Ink stealth temporarily confuses distant aggro
      const targetPos = this.shadowInkTimer > 0 && !this.isFused ? this.companionPos : this.playerPos;
      const dist = e.pos.distanceTo(targetPos);

      if (e.wallPinnedTimer > 0) {
        // Immobilized cleanly on wall face; automatically releases when wallPinnedTimer reaches 0
      } else if (e.state === 'stagger') {
        e.stateTimer -= dt;
        if (e.stateTimer <= 0) e.state = 'chase';
      } else if (e.state === 'chase') {
        if (dist < 28) {
          _v1.subVectors(targetPos, e.pos).setY(0);
          const yaw = Math.atan2(_v1.x, _v1.z);
          e.rig.root.rotation.y = yaw;
          const sep = computeEnemySeparationVector(e.id, e.pos, this.enemies, 1.45);
          const hasToken = attackTokens.has(e.id);

          if (dist > cfg.preferredRange || !hasToken) {
            // Without an attack token, circle/hold spacing at 3.8m instead of dogpiling
            const holdDist = hasToken ? cfg.preferredRange : Math.max(3.8, cfg.preferredRange);
            if (dist > holdDist) {
              _v1.normalize().multiplyScalar(e.speed * speedFactor);
            } else {
              // Subtle tactical strafe while waiting for attack token
              _v1.set(Math.cos(yaw) * 1.6, 0, -Math.sin(yaw) * 1.6);
            }
            e.vel.x = THREE.MathUtils.damp(e.vel.x, _v1.x + sep.x, 8, dt);
            e.vel.z = THREE.MathUtils.damp(e.vel.z, _v1.z + sep.z, 8, dt);
          } else {
            e.vel.x = sep.x * 0.4;
            e.vel.z = sep.z * 0.4;
            e.state = 'windup';
            e.attackCount += 1;
            e.attackPattern = (e.attackPattern + 1) % 2;
            e.unblockableWindup =
              cfg.unblockableEveryN > 0 && e.attackCount % cfg.unblockableEveryN === 0;
            e.stateTimer = e.kind === 'boss' && e.phase === 2 ? cfg.windupSeconds * 0.8 : cfg.windupSeconds;
          }
        }
      } else if (e.state === 'windup') {
        e.stateTimer -= dt;
        // Distinct readable combat telegraph: Crimson-Violet for UNBLOCKABLE, Amber-Red for Parryable!
        telegraphMat.color.setHex(e.unblockableWindup ? 0xd946ef : 0xef4444);
        telegraphMat.opacity = 0.56 + Math.sin(elapsed * 22) * 0.22;
        const ringScale = e.kind === 'boss' && e.attackPattern === 1 ? 1.8 : e.unblockableWindup ? 1.18 : 0.85;
        e.rig.telegraphRing.scale.setScalar(ringScale);
        if (e.stateTimer <= 0) {
          e.state = 'attack';
          e.stateTimer = 0.25;
          this.executeEnemyStrike(e);
        }
      } else if (e.state === 'attack') {
        e.stateTimer -= dt;
        if (e.stateTimer <= 0) {
          e.state = 'recover';
          e.stateTimer = cfg.recoverSeconds;
          e.unblockableWindup = false;
        }
      } else if (e.state === 'recover') {
        e.stateTimer -= dt;
        if (e.stateTimer <= 0) e.state = 'chase';
      }

      if (e.wallPinnedTimer <= 0) {
        const grav = e.juggleTimer > 0 ? 11.5 : 24.0;
        e.vel.y -= grav * dt;
        this.moveWithColliders(e.pos, e.vel, dt, false);
      }
      e.rig.root.position.copy(e.pos);

      // Animate enemy limbs
      const moveAmt = Math.hypot(e.vel.x, e.vel.z);
      const stride = Math.sin(elapsed * 9) * Math.min(1, moveAmt / 4) * 0.45;
      e.rig.leftLeg.rotation.x = stride;
      e.rig.rightLeg.rotation.x = -stride;
      if (e.state === 'windup') {
        e.rig.rightArm.rotation.x = -1.9;
      } else if (e.state === 'attack') {
        e.rig.rightArm.rotation.x = 0.9;
      } else {
        e.rig.rightArm.rotation.x = THREE.MathUtils.damp(e.rig.rightArm.rotation.x, -stride * 0.5, 10, dt);
      }
    }

    if (!this.titleShowcaseMode && !this.isVictory) {
      const bossAlive = this.enemies.some((e) => e.kind === 'boss' && e.state !== 'dead');
      this.audio.setMood(bossAlive ? 'boss' : anyInCombat ? 'combat' : 'explore');
    }
  }

  private executeEnemyStrike(e: EnemyEntity): void {
    if (this.activeFinisher) return;
    const reach =
      e.kind === 'boss' && e.attackPattern === 1
        ? 5.8
        : e.kind === 'marksman'
          ? 11.5
          : e.kind === 'bruiser'
            ? 3.3
            : 2.95;
    if (e.kind === 'boss' && e.attackPattern === 1) {
      this.audio.playSfx('boss_slam');
      this.screenShake = 0.25;
      this.spawnParticles(e.pos, 0xef4444, 20);
    }

    const dist = e.pos.distanceTo(this.playerPos);
    if (dist > reach) return;

    const outcome = resolveIncomingStrike({
      parryTimer: this.parryWindow,
      dodgeTimer: this.dodgeTimer,
      invulnTimer: this.dodgeTimer,
      blockHeld: this.blockHeld,
      unblockable: e.unblockableWindup,
    });

    if (outcome === 'parry') {
      this.parryCount += 1;
      this.counterWindow = openCounterWindow(e.id);
      this.duoSynergy = addDuoSynergy(
        this.duoSynergy,
        'partner_intervention',
        getComboCombatBenefits(this.comboState.count).duoSynergyMultiplier
      );
      this.audio.playSfx('parry');
      this.pushFloatingLabel(this.playerPos, 'PERFECT PARRY! [COUNTER]', '#D4AF37');
      e.state = 'stagger';
      e.stateTimer = PARRY.enemyStagger;
      e.armor = Math.max(0, e.armor - 45);
      if (this.save.fusionUnlocked) this.fusionCharge = Math.min(100, this.fusionCharge + PARRY.fusionCharge);
      this.spawnParticles(this.playerPos, 0xd4af37, 16);
      this.syncCombatTelemetry();
      this.emitHudSnapshot();
      return;
    }

    if (outcome === 'evade' || outcome === 'grace') {
      this.evadeCount += 1;
      if (this.save.fusionUnlocked) this.fusionCharge = Math.min(100, this.fusionCharge + PARRY.evadeFusionCharge);
      this.pushFloatingLabel(this.playerPos, e.unblockableWindup ? 'PERFECT EVADE!' : 'EVADED', '#38BDF8');
      this.syncCombatTelemetry();
      this.emitHudSnapshot();
      return;
    }

    if (outcome === 'block') {
      const stats = computeHeroStats(this.baseHero, this.save.heroes[this.baseHero]);
      const chip = Math.max(
        2,
        Math.round((e.attackPower - stats.defense * 0.35) * PARRY.blockDamageFactor)
      );
      if (this.baseHero === 'kai') this.kaiHp = Math.max(1, this.kaiHp - chip);
      else this.jaxHp = Math.max(1, this.jaxHp - chip);
      this.audio.playSfx('parry');
      this.pushFloatingLabel(this.playerPos, `BLOCKED (-${chip})`, '#94A3B8');
      this.spawnParticles(this.playerPos, 0x94a3b8, 8);
      this.emitHudSnapshot();
      return;
    }

    if (outcome === 'guard_broken') {
      this.blockHeld = false;
      this.pushFloatingLabel(this.playerPos, 'UNBLOCKABLE! GUARD BROKEN', '#D946EF');
    }

    // Apply damage mitigated by active hero defense
    this.hitsTaken += 1;
    this.playerHurtFlash = 0.24;
    const stats = computeHeroStats(this.baseHero, this.save.heroes[this.baseHero]);
    const dmg = Math.max(4, Math.round(e.attackPower - stats.defense * 0.35));
    if (this.baseHero === 'kai') {
      this.kaiHp = Math.max(0, this.kaiHp - dmg);
      if (this.kaiHp === 0 && this.jaxHp > 0 && !this.isFused) {
        this.triggerSwitchHero();
      }
    } else {
      this.jaxHp = Math.max(0, this.jaxHp - dmg);
      if (this.jaxHp === 0 && this.kaiHp > 0 && !this.isFused) {
        this.triggerSwitchHero();
      }
    }
    // Reset active combo count and decay timer immediately upon taking damage
    if (this.comboState.count > 0 || this.comboState.timer > 0) {
      this.comboState = resetComboOnDamage(this.comboState);
      this.comboResetTimer = 0;
      this.attackComboStep = 0;
    }

    this.pushFloatingDamage(this.playerPos, dmg, '#EF4444', false);
    this.audio.playSfx('hit');
    this.syncCombatTelemetry();

    if (this.kaiHp <= 0 && this.jaxHp <= 0) {
      this.isGameOver = true;
    }
    this.emitHudSnapshot();
  }

  private syncCombatTelemetry(): void {
    this.callbacks.onSaveProgress(
      {
        duoSynergySaved: Math.round(this.duoSynergy.meter),
        combatStats: {
          parryCount: this.parryCount,
          evadeCount: this.evadeCount,
          hitsTaken: this.hitsTaken,
          maxCombo: this.maxCombo,
          duoFinishersUsed: this.duoFinishersUsed,
          wallPinsCount: this.wallPinsCount,
          guardBreaksCount: this.guardBreaksCount,
          environmentalTakedownsCount: this.environmentalTakedownsCount,
          styleScoreBest: this.styleScoreBest,
        },
      },
      true
    );
  }

  private animateHeroPose(
    rig: ArticulatedHeroRig,
    speed: number,
    attacking: boolean,
    elapsed: number,
    hero: HeroId
  ): void {
    const runRatio = Math.min(1, speed / 7.5);
    const swing = Math.sin(elapsed * 12) * runRatio * 0.65;
    rig.leftLeg.rotation.x = swing;
    rig.rightLeg.rotation.x = -swing;

    if (attacking) {
      rig.rightArm.rotation.x = -1.6 + Math.sin(elapsed * 32) * 0.8;
      rig.leftArm.rotation.x = -0.8;
    } else {
      rig.leftArm.rotation.x = -swing * 0.7;
      rig.rightArm.rotation.x = swing * 0.7;
    }

    rig.bodyGroup.position.y = 0.92 + Math.abs(Math.sin(elapsed * 12)) * 0.06 * runRatio;
    rig.headGroup.rotation.y = Math.sin(elapsed * 1.5) * 0.06;

    // Spider Limbs Dynamic Articulation (Kai & Kai-Jax)
    rig.spiderLimbs.forEach((limb, idx) => {
      const phase = elapsed * (attacking ? 16 : 5 + runRatio * 5) + idx * 1.4;
      limb.rotation.x = Math.sin(phase) * (0.14 + runRatio * 0.16);
      limb.rotation.z = Math.cos(phase) * 0.08;
    });

    // Storm Mane Pulse (Jax & Kai-Jax)
    rig.maneSpikes.forEach((spike, idx) => {
      const pulse = 1 + Math.sin(elapsed * 8 + idx) * (this.thryxenTimer > 0 ? 0.18 : 0.06);
      spike.scale.setScalar(pulse);
    });

    // Three Primary Tails Wave Physics (Strictly Kai-Jax)
    if (hero === 'kaijax') {
      rig.tails.forEach((tail, idx) => {
        tail.rotation.x = Math.sin(elapsed * 5.5 + idx * 1.2) * 0.16;
        tail.rotation.z = Math.cos(elapsed * 4.2 + idx * 0.9) * 0.12;
      });
    }
  }

  private updateCamera(dt: number, speed: number): void {
    // Dynamic FOV widening on high-speed sprint/displacement & cinematic tightening on Duo Finisher
    const targetFov = this.activeFinisher ? 56 : speed > 8.4 || this.isSwinging ? 66 : 60;
    this.camera.fov = THREE.MathUtils.damp(this.camera.fov, targetFov, 7.5, dt);
    this.camera.updateProjectionMatrix();

    // Lock-on or active free-flow combat framing
    const locked = this.lockedEnemyId ? this.enemies.find((e) => e.id === this.lockedEnemyId && e.state !== 'dead') : null;
    const nearbyCombatCount = this.enemies.filter(
      (e) => e.state !== 'dead' && e.pos.distanceTo(this.playerPos) <= 10.5
    ).length;

    if (locked) {
      this.lockReticle.visible = true;
      this.lockReticle.position.set(locked.pos.x, locked.pos.y + 0.08, locked.pos.z);
      const desiredYaw = Math.atan2(this.playerPos.x - locked.pos.x, this.playerPos.z - locked.pos.z);
      let diff = desiredYaw - this.camYaw;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.camYaw += diff * Math.min(1, dt * 6.5);
    } else {
      this.lockReticle.visible = false;
      if (this.settings.autoRecenterCamera && speed > 2) {
        const desiredYaw = this.playerYaw + Math.PI;
        let diff = desiredYaw - this.camYaw;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        this.camYaw += diff * Math.min(1, dt * 2.4);
      }
    }

    // Smooth exponential decay of brother-switch camera offset (zero camera snap on Tab/Switch)
    this.switchCamOffset.x = THREE.MathUtils.damp(this.switchCamOffset.x, 0, 9.5, dt);
    this.switchCamOffset.y = THREE.MathUtils.damp(this.switchCamOffset.y, 0, 9.5, dt);
    this.switchCamOffset.z = THREE.MathUtils.damp(this.switchCamOffset.z, 0, 9.5, dt);

    // Smooth velocity look-ahead + combat/finisher framing bias
    const finisherTarget = this.activeFinisher
      ? this.enemies.find((e) => e.id === this.activeFinisher!.targetEnemyId) ?? null
      : null;
    if (this.activeFinisher) {
      this.camYaw += dt * 0.45;
    }

    const lookAheadScale = this.activeFinisher ? 0 : Math.min(0.75, speed * 0.065);
    const targetAheadX = finisherTarget
      ? (finisherTarget.pos.x - this.playerPos.x) * 0.5
      : (speed > 0.4 ? (this.playerVel.x / Math.max(1, speed)) * lookAheadScale : 0) +
        (locked ? (locked.pos.x - this.playerPos.x) * 0.24 : 0);
    const targetAheadZ = finisherTarget
      ? (finisherTarget.pos.z - this.playerPos.z) * 0.5
      : (speed > 0.4 ? (this.playerVel.z / Math.max(1, speed)) * lookAheadScale : 0) +
        (locked ? (locked.pos.z - this.playerPos.z) * 0.24 : 0);
    this.camLookAhead.x = THREE.MathUtils.damp(this.camLookAhead.x, targetAheadX, 7.0, dt);
    this.camLookAhead.z = THREE.MathUtils.damp(this.camLookAhead.z, targetAheadZ, 7.0, dt);

    const targetCenter = _v1.set(
      this.playerPos.x + this.switchCamOffset.x + this.camLookAhead.x,
      this.playerPos.y + this.switchCamOffset.y + 1.54,
      this.playerPos.z + this.switchCamOffset.z + this.camLookAhead.z
    );
    const targetDist = this.activeFinisher
      ? 5.8
      : nearbyCombatCount >= 2
        ? 8.1
        : nearbyCombatCount === 1
          ? 7.6
          : 7.15;
    this.camDistance = THREE.MathUtils.damp(this.camDistance, targetDist, 5.5, dt);

    const dirX = Math.sin(this.camYaw) * Math.cos(this.camPitch);
    const dirY = Math.sin(this.camPitch);
    const dirZ = Math.cos(this.camYaw) * Math.cos(this.camPitch);

    // Collider-aware obstruction pull-in so walls/containers never block active combat or Duo Finishers
    const ignoredGateIdx = this.world.alleyGateOpen ? this.world.alleyGateColliderIndex : -1;
    let effectiveDist = this.camDistance;
    _rayOrigin.copy(targetCenter);
    _rayDir.set(
      targetCenter.x + dirX * effectiveDist,
      targetCenter.y + dirY * effectiveDist,
      targetCenter.z + dirZ * effectiveDist
    );
    if (isLineObstructedByColliders(_rayOrigin, _rayDir, this.world.colliders, ignoredGateIdx)) {
      for (let probe = 2.4; probe < this.camDistance; probe += 0.65) {
        _rayDir.set(
          targetCenter.x + dirX * probe,
          targetCenter.y + dirY * probe,
          targetCenter.z + dirZ * probe
        );
        if (!isLineObstructedByColliders(_rayOrigin, _rayDir, this.world.colliders, ignoredGateIdx)) {
          effectiveDist = probe;
        } else {
          break;
        }
      }
    }

    const idealCamX = targetCenter.x + dirX * effectiveDist;
    const idealCamY = targetCenter.y + dirY * effectiveDist;
    const idealCamZ = targetCenter.z + dirZ * effectiveDist;

    // Obstruction clamping against outer street buildings (widened on elevated rooftops / Bloodward Loft)
    const maxCamX = this.playerPos.y >= 4.2 ? 23.2 : 17.2;
    const clampedX = THREE.MathUtils.clamp(idealCamX, -maxCamX, maxCamX);
    const clampedZ = THREE.MathUtils.clamp(idealCamZ, -89, 20);
    const clampedY = Math.max(1.25, idealCamY);

    this.camCurrentPos.x = THREE.MathUtils.damp(this.camCurrentPos.x, clampedX, 12.0, dt);
    this.camCurrentPos.y = THREE.MathUtils.damp(this.camCurrentPos.y, clampedY, 12.0, dt);
    this.camCurrentPos.z = THREE.MathUtils.damp(this.camCurrentPos.z, clampedZ, 12.0, dt);

    const shakeMag =
      this.settings.reducedMotion || this.settings.reduceCameraShake ? 0 : this.screenShake;
    this.camera.position.set(
      this.camCurrentPos.x + (Math.random() - 0.5) * shakeMag,
      this.camCurrentPos.y + (Math.random() - 0.5) * shakeMag,
      this.camCurrentPos.z
    );

    const lookLerp = 1 - Math.exp(-15 * dt);
    this.camLookTarget.lerp(targetCenter, lookLerp);
    this.camera.lookAt(this.camLookTarget);
  }

  private emitHudSnapshot(): void {
    const locked = this.lockedEnemyId
      ? this.enemies.find((e) => e.id === this.lockedEnemyId && e.state !== 'dead')
      : null;
    const boss = this.enemies.find((e) => e.kind === 'boss' && e.state !== 'dead') ?? null;
    const step = MISSION_1_STEPS[Math.min(this.save.missionStageIndex, MISSION_1_STEPS.length - 1)];

    let interactPrompt: string | null = null;
    for (const civ of this.world.civilians) {
      if (!civ.rescued && civ.position.distanceTo(this.playerPos) < 3.8) {
        interactPrompt = `Rescue ${civ.name}`;
      }
    }
    if (!this.world.memorySiteReconstructed && this.playerPos.distanceTo(this.world.memorySitePos) < 4.5) {
      interactPrompt = 'Reconstruct Memory Site';
    }
    if (!this.world.alleyGateOpen && this.playerPos.distanceTo(this.world.alleyGatePos) < 5.0) {
      interactPrompt = 'Breach Alley Gate';
    }

    const envTakedownAvail = this.findAvailableEnvironmentalTakedown();
    if (!interactPrompt && envTakedownAvail) {
      interactPrompt = `Relay Takedown: ${envTakedownAvail.hazard.name}`;
    }

    const canWebSwing = !this.grounded && this.findNearestValidatedWebAnchor(15.0) !== null;
    const finisherTarget = this.findNearestEnemy(11.5);
    const duoFinisherReady =
      !this.activeFinisher &&
      this.duoSynergy.meter >= this.duoSynergy.finisherCost &&
      Boolean(finisherTarget) &&
      ((this.kaiHp > 0 && this.jaxHp > 0) || this.isFused);

    // Project locked or active contextual combat target onto 2D screen space for HUD reticle
    const reticleTarget =
      locked ??
      (this.comboState.count > 0 || this.counterWindow.active || duoFinisherReady ? finisherTarget : null);
    let lockedTargetScreenX: number | null = null;
    let lockedTargetScreenY: number | null = null;
    if (reticleTarget && this.container.clientWidth > 0 && this.container.clientHeight > 0) {
      _v3.set(reticleTarget.pos.x, reticleTarget.pos.y + 1.15, reticleTarget.pos.z).project(this.camera);
      if (_v3.z > -1 && _v3.z < 1) {
        lockedTargetScreenX = Math.round((_v3.x * 0.5 + 0.5) * this.container.clientWidth);
        lockedTargetScreenY = Math.round((-_v3.y * 0.5 + 0.5) * this.container.clientHeight);
      }
    }

    const tacticalActionLabel =
      this.activeHero === 'kaijax'
        ? 'Stormweb'
        : this.activeHero === 'jax'
          ? !this.grounded
            ? 'Slam'
            : 'Launch'
          : !this.grounded && !finisherTarget
            ? 'Zipline'
            : finisherTarget && finisherTarget.snareTimer > 0
              ? 'Wall Pin'
              : finisherTarget && finisherTarget.pos.distanceTo(this.playerPos) > 5.2
                ? 'Web Strike'
                : 'Web Pull';

    this.callbacks.onHudUpdate({
      activeHero: this.activeHero,
      kaiHp: Math.round(this.kaiHp),
      kaiMaxHp: this.kaiMaxHp,
      kaiEnergy: Math.round(this.kaiEnergy),
      kaiMaxEnergy: this.kaiMaxEnergy,
      jaxHp: Math.round(this.jaxHp),
      jaxMaxHp: this.jaxMaxHp,
      jaxEnergy: Math.round(this.jaxEnergy),
      jaxMaxEnergy: this.jaxMaxEnergy,
      fusionCharge: Math.round(this.fusionCharge),
      isFused: this.isFused,
      fusionTimeLeft: this.fusionTimeLeft,
      fusionCooldown: this.fusionCooldown,
      fusionUnlocked: this.save.fusionUnlocked,
      duoSynergy: Math.round(this.duoSynergy.meter),
      duoFinisherReady,
      activeFinisherName: this.activeFinisher ? this.activeFinisher.finisher.name : null,
      counterWindowActive: this.counterWindow.active,
      isBlocking: this.blockHeld,
      tacticalActionLabel,
      tacticalCooldown: this.tacticalCooldown,
      styleScore: this.comboState.styleScore ?? 0,
      comboCount: this.comboState.count,
      comboTimer: this.comboState.timer,
      comboMaxTimer: this.comboState.maxTimer,
      comboBrokenSeq: this.comboState.brokenSeq,
      lastBrokenCombo: this.comboState.lastBrokenCount,
      abilityCooldowns: [...this.abilityCooldowns] as [number, number, number],
      dodgeCooldown: this.dodgeCooldown,
      lockedTargetName: locked ? locked.name : null,
      lockedTargetHp: locked ? Math.round(locked.hp) : 0,
      lockedTargetMaxHp: locked ? locked.maxHp : 1,
      lockedTargetScreenX,
      lockedTargetScreenY,
      lockedTargetArchetype: reticleTarget ? reticleTarget.kind : null,
      lockedTargetShield: reticleTarget ? Math.round(reticleTarget.shieldHp) : 0,
      bossName: boss ? boss.name : null,
      bossHp: boss ? Math.round(boss.hp) : 0,
      bossMaxHp: boss ? boss.maxHp : 1,
      bossArmor: boss ? Math.round(boss.armor) : 0,
      bossMaxArmor: boss ? boss.maxArmor : 1,
      bossPhase: boss ? boss.phase : 1,
      bossTelegraph:
        boss && boss.state === 'windup'
          ? boss.unblockableWindup
            ? 'UNBLOCKABLE OVERDRIVE SLAM — EVADE!'
            : 'HAMMER SWEEP — PARRY OR BLOCK!'
          : null,
      interactPrompt,
      canWebSwing,
      canEnvironmentalTakedown: Boolean(envTakedownAvail),
      environmentalTakedownPrompt: envTakedownAvail ? envTakedownAvail.hazard.name : null,
      isWallRunning: this.isWallRunning,
      isShadowInked: this.shadowInkTimer > 0,
      thryxenActive: this.thryxenTimer > 0,
      lightningChanneled: this.thryxenTimer > 0,
      traversalState: this.activeFinisher
        ? 'Duo Finisher'
        : this.isSwinging
          ? 'Web Swinging'
          : this.isWallRunning
            ? 'Wall Running'
            : !this.grounded
              ? 'Airborne'
              : this.save.traversalTier,
      missionStepIndex: this.save.missionStageIndex,
      missionStepTitle: this.save.missionCompleted ? 'Ashblock Liberated (Patrol Active)' : step.title,
      missionObjective: this.save.missionCompleted
        ? 'Mission 1 Complete! Explore Ashblock Heights, craft gear, or launch Patrol Skirmishes.'
        : step.objective,
      missionCompleted: this.save.missionCompleted,
      rescuedCivilians: this.world.civilians.filter((c) => c.rescued).length,
      totalCivilians: this.world.civilians.length,
      memoryFragments: this.save.memoryFragments,
      fpsEstimate: this.fpsEstimate,
      onePercentLowFps: this.onePercentLowFps,
      drawCalls: this.renderer.info.render.calls,
      activeTriangles: this.renderer.info.render.triangles,
      isGameOver: this.isGameOver,
      isVictory: this.isVictory,
      webglContextLost: this.webglContextLost,
      parryCount: this.parryCount,
      evadeCount: this.evadeCount,
      hitsTaken: this.hitsTaken,
      floatingDamages: this.floatingDamages,
    });
  }

  private pollGamepad(): void {
    const pads = navigator.getGamepads?.();
    const gp = pads?.[0] ?? null;
    if (!gp) return;

    const actions = this.gamepadPoller.poll(gp, this.settings.gamepadBindings ?? DEFAULT_GAMEPAD_BINDINGS);
    if (actions.hasMoveInput) {
      this.touchMove.x = actions.moveX;
      this.touchMove.y = actions.moveY;
    }
    if (actions.lookX !== 0 || actions.lookY !== 0) {
      this.addCameraDelta(actions.lookX * 5, actions.lookY * 4);
    }

    if (actions.duoChordJustPressed && this.triggerDuoFinisher()) {
      return;
    }
    this.blockHeld = actions.blockHeld || this.keys.has('KeyQ');
    if (actions.jumpJustPressed) this.triggerJumpOrSwing();
    if (actions.dodgeJustPressed || actions.blockParryJustPressed) this.triggerDodgeOrParry();
    if (actions.lightAttackJustPressed) this.triggerLightAttack();
    if (actions.heavyAttackJustPressed) this.triggerHeavyAttack();
    if (actions.tacticalJustPressed) this.triggerTacticalAction();
    if (actions.switchJustPressed) this.triggerSwitchHero();
    if (actions.lockOnJustPressed) this.triggerLockOn();
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.repeat) return;
    this.keys.add(e.code);
    if (e.code === 'Escape') this.callbacks.onTogglePause();
    if (this.paused || this.titleShowcaseMode) return;
    if (e.code === 'Space') this.triggerJumpOrSwing();
    if (e.code === 'KeyJ') this.triggerLightAttack();
    if (e.code === 'KeyK') this.triggerHeavyAttack();
    if (e.code === 'KeyU') this.triggerTacticalAction();
    if (e.code === 'KeyG') this.triggerDuoFinisher();
    if (e.code === 'KeyL') this.triggerDodgeOrParry();
    if (e.code === 'KeyQ') this.startDefenseInput();
    if (e.code === 'KeyE') this.triggerInteract();
    if (e.code === 'KeyV') this.triggerEnvironmentalTakedown();
    if (e.code === 'Tab') {
      e.preventDefault();
      this.triggerSwitchHero();
    }
    if (e.code === 'KeyF') this.triggerFusion();
    if (e.code === 'KeyR') this.triggerLockOn();
    if (e.code === 'Digit1') this.triggerAbility(1);
    if (e.code === 'Digit2') this.triggerAbility(2);
    if (e.code === 'Digit3') this.triggerAbility(3);
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.code);
    if (e.code === 'KeyQ') this.endDefenseInput();
  };

  private handleResize = () => {
    if (this.disposed) return;
    const w = Math.max(1, this.container.clientWidth);
    const h = Math.max(1, this.container.clientHeight);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.renderer.render(this.scene, this.camera);
  };

  private bindInputListeners(): void {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('resize', this.handleResize);
  }

  public dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('resize', this.handleResize);
    this.kaiGlb.dispose();
    this.jaxGlb.dispose();
    this.kaiJaxGlb.dispose();
    this.borynGlb.dispose();
    this.boraxGlb.dispose();
    this.textures.dispose();
    this.renderer.dispose();
    if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).__KAIJAX_ENGINE__ === this) {
      delete (window as unknown as Record<string, unknown>).__KAIJAX_ENGINE__;
    }
    if (this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}

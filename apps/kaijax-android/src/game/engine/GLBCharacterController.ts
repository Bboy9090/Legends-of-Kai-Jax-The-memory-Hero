import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import {
  CHARACTER_ASSET_REGISTRY,
  CharacterAnimClipName,
  FacialMorphName,
  resolveCharacterFallbackChain,
  RosterCharacterId,
} from '../data/characterAssetRegistry';
import {
  ENEMY_ASSET_REGISTRY,
  EnemyModelId,
  resolveEnemyFallbackChain,
} from '../data/enemyAssetRegistry';
import { CharacterModelVersion, GraphicsQuality } from '../types';

export type GlbEntityId = RosterCharacterId | EnemyModelId;

THREE.Cache.enabled = true;

export type AssetLoadStatus = 'idle' | 'loading' | 'ready' | 'fallback' | 'awaiting_approval' | 'error';

export interface CharacterMotionSample {
  planarSpeed: number;
  sprinting: boolean;
  grounded: boolean;
  verticalVel: number;
  isWallRunning: boolean;
  isSwinging: boolean;
  dodgeActive: boolean;
  parryActive: boolean;
  attackType: 'none' | 'light' | 'heavy' | 'air' | 'ability';
  comboStep: number;
  attackActive: boolean;
  hurtActive: boolean;
  thryxenActive: boolean;
  shadowInked: boolean;
  isVictory: boolean;
  isDefeat: boolean;
  showcaseMode: boolean;
  turnYawDelta?: number;
  landingImpact?: number;
}

interface CachedGltfEntry {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
}

const sharedLoader = new GLTFLoader();
const gltfCache = new Map<string, Promise<CachedGltfEntry>>();

const _worldScratch = new THREE.Vector3();

function fetchCachedGltf(url: string): Promise<CachedGltfEntry> {
  const existing = gltfCache.get(url);
  if (existing) return existing;

  const promise = new Promise<CachedGltfEntry>((resolve, reject) => {
    sharedLoader.load(
      url,
      (gltf: GLTF) => {
        resolve({
          scene: gltf.scene,
          animations: gltf.animations ?? [],
        });
      },
      undefined,
      (err) => {
        gltfCache.delete(url);
        reject(err);
      }
    );
  });

  gltfCache.set(url, promise);
  return promise;
}

export function clearCharacterGltfCache(): void {
  gltfCache.clear();
}

export interface GlbPreloadSnapshot {
  total: number;
  loaded: number;
  ready: boolean;
  elapsedMs: number;
}

const preloadState: GlbPreloadSnapshot = {
  total: 0,
  loaded: 0,
  ready: false,
  elapsedMs: 0,
};

export function getGlbPreloadSnapshot(): GlbPreloadSnapshot {
  return { ...preloadState };
}

export async function preloadGlbAssets(
  urls: string[],
  onProgress?: (snap: GlbPreloadSnapshot) => void
): Promise<GlbPreloadSnapshot> {
  const uniqueUrls = Array.from(new Set(urls.filter(Boolean)));
  const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
  preloadState.total = uniqueUrls.length;
  preloadState.loaded = 0;
  preloadState.ready = uniqueUrls.length === 0;
  preloadState.elapsedMs = 0;
  onProgress?.({ ...preloadState });

  await Promise.all(
    uniqueUrls.map(async (url) => {
      try {
        await fetchCachedGltf(url);
      } catch {
        // Individual fallback URLs are handled per instance
      } finally {
        preloadState.loaded += 1;
        preloadState.elapsedMs = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0;
        if (preloadState.loaded >= preloadState.total) {
          preloadState.ready = true;
        }
        onProgress?.({ ...preloadState });
      }
    })
  );
  return { ...preloadState };
}

export async function preloadCoreAshblockAssets(
  quality: GraphicsQuality,
  preferLod1 = false,
  modelVersion: CharacterModelVersion = 'p1i_reconstructed',
  onProgress?: (snap: GlbPreloadSnapshot) => void
): Promise<GlbPreloadSnapshot> {
  if (modelVersion === 'procedural_fallback') {
    preloadState.total = 0;
    preloadState.loaded = 0;
    preloadState.ready = true;
    preloadState.elapsedMs = 0;
    onProgress?.({ ...preloadState });
    return { ...preloadState };
  }
  const heroIds: RosterCharacterId[] = ['kai', 'jax', 'kaijax', 'boryn', 'borax'];
  const enemyIds: EnemyModelId[] = [
    'fang_enforcer',
    'blood_broker',
    'syndicate_brawler',
    'syndicate_stalker',
    'syndicate_marksman',
  ];
  const urls: string[] = [];
  for (const h of heroIds) {
    const chain = resolveCharacterFallbackChain(h, quality, preferLod1, modelVersion);
    if (chain[0]) urls.push(chain[0]);
  }
  for (const e of enemyIds) {
    const chain = resolveEnemyFallbackChain(e, quality, preferLod1);
    if (chain[0]) urls.push(chain[0]);
  }
  return preloadGlbAssets(urls, onProgress);
}

const LOOPING_CLIPS = new Set<CharacterAnimClipName>([
  'idle',
  'breathing',
  'walk',
  'run',
  'sprint',
  'fall',
  'victory',
]);

export class GLBCharacterInstance {
  public readonly characterId: GlbEntityId;
  public readonly root: THREE.Group;
  public status: AssetLoadStatus = 'idle';
  public loadedUrl: string | null = null;
  public triangleCount = 0;
  public boneCount = 0;

  private modelRoot: THREE.Object3D | null = null;
  private fallbackNode: THREE.Object3D | null = null;
  private mixer: THREE.AnimationMixer | null = null;
  private actions = new Map<string, THREE.AnimationAction>();
  private currentClip: CharacterAnimClipName | null = null;
  private oneShotHoldTimer = 0;
  private wasGrounded = true;
  private landingTimer = 0;
  private blinkTimer = 1.8;
  private bankRoll = 0;
  private forwardPitch = 0;
  private brakePitch = 0;
  private prevPlanarSpeed = 0;
  private yawTrailVel = 0;
  private vertTrailVel = 0;
  private landingSquash = 0;

  private sockets = new Map<string, THREE.Object3D>();
  private tailBones: THREE.Bone[] = [];
  private spiderBones: THREE.Bone[] = [];
  private maneBones: THREE.Bone[] = [];
  private morphMeshes: THREE.Mesh[] = [];
  private clonedMaterials: THREE.MeshStandardMaterial[] = [];
  private clonedGeometries: THREE.BufferGeometry[] = [];
  private auraRing: THREE.Mesh;
  private shadowPlane: THREE.Mesh;

  private accentColor = new THREE.Color('#D4AF37');
  private trimColor = new THREE.Color('#1E293B');
  private disposed = false;
  private loadGeneration = 0;

  constructor(
    characterId: GlbEntityId,
    contactShadowTex: THREE.Texture,
    fallbackNode?: THREE.Object3D
  ) {
    this.characterId = characterId;
    this.root = new THREE.Group();
    this.root.name = `CharacterRoot_${characterId}`;

    // Grounded soft contact shadow plane (offset at y = 0.024 to avoid Z-fighting)
    const shadowMat = new THREE.MeshBasicMaterial({
      map: contactShadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.76,
    });
    this.shadowPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6), shadowMat);
    this.shadowPlane.rotation.x = -Math.PI / 2;
    this.shadowPlane.position.y = 0.024;
    this.root.add(this.shadowPlane);

    // Subtle canonical heritage / faction ring at feet
    const enemyEntry = ENEMY_ASSET_REGISTRY[characterId as EnemyModelId];
    const auraHex = enemyEntry
      ? new THREE.Color(enemyEntry.accentHex).getHex()
      : characterId === 'jax'
        ? 0x38bdf8
        : characterId === 'kaijax'
          ? 0xa855f7
          : characterId === 'boryn'
            ? 0xf97316
            : characterId === 'borax'
              ? 0xd4af37
              : 0x8b5cf6;
    this.auraRing = new THREE.Mesh(
      new THREE.RingGeometry(0.56, 0.69, 32),
      new THREE.MeshBasicMaterial({
        color: auraHex,
        transparent: true,
        opacity: characterId === 'kaijax' ? 0.62 : enemyEntry?.isBoss ? 0.45 : 0.28,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    this.auraRing.rotation.x = -Math.PI / 2;
    this.auraRing.position.y = 0.036;
    this.root.add(this.auraRing);

    if (fallbackNode) {
      this.fallbackNode = fallbackNode;
      // Hide procedural fallback by default so outdated blocky placeholders do not pop in while GLBs load
      this.fallbackNode.visible = false;
      this.root.add(fallbackNode);
      this.status = 'idle';
    }
  }

  public async loadForQuality(
    quality: GraphicsQuality,
    maxAnisotropy = 4,
    castShadows = true,
    preferLod1 = false,
    forceProceduralFallback = false,
    modelVersion: CharacterModelVersion = 'p1i_reconstructed'
  ): Promise<AssetLoadStatus> {
    if (this.disposed) return 'error';

    const isEnemy = this.characterId in ENEMY_ASSET_REGISTRY;
    const heroEntry = !isEnemy ? CHARACTER_ASSET_REGISTRY[this.characterId as RosterCharacterId] : null;
    if (!isEnemy && (!heroEntry || heroEntry.visualAuthorityStatus === 'awaiting_visual_approval')) {
      this.status = 'awaiting_approval';
      return this.status;
    }

    if (forceProceduralFallback || modelVersion === 'procedural_fallback') {
      this.detachLoadedModel();
      this.loadedUrl = null;
      if (this.fallbackNode) this.fallbackNode.visible = true;
      this.status = 'fallback';
      return this.status;
    }

    const urlChain = isEnemy
      ? resolveEnemyFallbackChain(this.characterId as EnemyModelId, quality, preferLod1)
      : resolveCharacterFallbackChain(this.characterId as RosterCharacterId, quality, preferLod1, modelVersion);
    if (urlChain.length === 0) {
      this.detachLoadedModel();
      this.loadedUrl = null;
      if (this.fallbackNode) this.fallbackNode.visible = true;
      this.status = 'fallback';
      return this.status;
    }

    if (this.status === 'ready' && this.loadedUrl === urlChain[0] && this.modelRoot) {
      this.applyShadowFlag(castShadows);
      return 'ready';
    }

    const gen = ++this.loadGeneration;
    this.status = 'loading';
    if (this.fallbackNode) this.fallbackNode.visible = false;

    try {
      let cached: CachedGltfEntry | null = null;
      let resolvedUrl: string | null = null;
      let lastErr: unknown = null;

      for (const candidateUrl of urlChain) {
        try {
          cached = await fetchCachedGltf(candidateUrl);
          resolvedUrl = candidateUrl;
          break;
        } catch (candidateErr) {
          lastErr = candidateErr;
        }
      }

      if (!cached || !resolvedUrl) {
        throw lastErr ?? new Error(`All GLB URLs failed for ${this.characterId}`);
      }
      if (this.disposed || gen !== this.loadGeneration) return this.status;

      const targetUrl = resolvedUrl;
      this.detachLoadedModel();

      const cloned = SkeletonUtils.clone(cached.scene) as THREE.Group;
      cloned.name = `SkinnedGLB_${this.characterId}`;

      let tris = 0;
      const seenBones = new Set<THREE.Bone>();

      cloned.traverse((obj) => {
        if (obj.name.startsWith('socket_') || obj.name.includes('hand_') || obj.name.includes('head')) {
          this.sockets.set(obj.name, obj);
        }

        if ((obj as THREE.SkinnedMesh).isSkinnedMesh) {
          const sm = obj as THREE.SkinnedMesh;
          sm.frustumCulled = false; // Prevent skinned animation bounds clipping
          if (sm.skeleton) {
            for (const b of sm.skeleton.bones) {
              if (!seenBones.has(b)) {
                seenBones.add(b);
                if (b.name.startsWith('tail')) {
                  this.tailBones.push(b);
                } else if (b.name.startsWith('spider_')) {
                  this.spiderBones.push(b);
                } else if (b.name.startsWith('mane_0')) {
                  this.maneBones.push(b);
                }
              }
              if (b.name.startsWith('socket_') || b.name.startsWith('hand_') || b.name === 'head' || b.name === 'jaw') {
                this.sockets.set(b.name, b);
              }
            }
          }
        }

        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.castShadow = castShadows;
          mesh.receiveShadow = true;

          // Clone geometry only if needed on dispose tracking; SkeletonUtils shares geometry buffers safely
          const geo = mesh.geometry;
          if (geo) {
            const index = geo.getIndex();
            const pos = geo.getAttribute('position');
            if (index) tris += Math.floor(index.count / 3);
            else if (pos) tris += Math.floor(pos.count / 3);
          }

          if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
            this.morphMeshes.push(mesh);
          }

          // Clone material per character instance so cosmetic tint/stealth opacity stay isolated
          const srcMats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          const instMats = srcMats.map((mat) => {
            const clonedMat = mat.clone() as THREE.MeshStandardMaterial;
            if (clonedMat.map) {
              clonedMat.map.colorSpace = THREE.SRGBColorSpace;
              clonedMat.map.anisotropy = maxAnisotropy;
            }
            if (clonedMat.emissiveMap) {
              clonedMat.emissiveMap.colorSpace = THREE.SRGBColorSpace;
              clonedMat.emissiveMap.anisotropy = maxAnisotropy;
            }
            if (clonedMat.normalMap) {
              clonedMat.normalMap.anisotropy = maxAnisotropy;
            }
            clonedMat.envMapIntensity = 0.95;
            this.clonedMaterials.push(clonedMat);
            return clonedMat;
          });
          mesh.material = instMats.length === 1 ? instMats[0] : instMats;
        }
      });

      this.triangleCount = tris;
      this.boneCount = seenBones.size;
      this.modelRoot = cloned;
      this.loadedUrl = targetUrl;
      this.root.add(cloned);

      if (this.fallbackNode) {
        this.fallbackNode.visible = false;
      }

      // Initialize AnimationMixer & map all embedded clips
      this.mixer = new THREE.AnimationMixer(cloned);
      this.actions.clear();
      for (const clip of cached.animations) {
        const action = this.mixer.clipAction(clip);
        const clipKey = clip.name as CharacterAnimClipName;
        if (LOOPING_CLIPS.has(clipKey)) {
          action.setLoop(THREE.LoopRepeat, Infinity);
          action.clampWhenFinished = false;
        } else {
          action.setLoop(THREE.LoopOnce, 1);
          action.clampWhenFinished = true;
        }
        this.actions.set(clip.name, action);
      }

      this.applyCosmeticTrim(this.accentColor.getStyle(), this.trimColor.getStyle());
      this.playClip('idle', 0.01, true);
      this.status = 'ready';
      return 'ready';
    } catch (err) {
      console.warn(`[GLBCharacterController] Failed loading ${urlChain.join(' -> ')}, retaining fallback:`, err);
      if (this.fallbackNode) this.fallbackNode.visible = true;
      this.status = this.fallbackNode ? 'fallback' : 'error';
      return this.status;
    }
  }

  public applyShadowFlag(castShadows: boolean): void {
    if (!this.modelRoot) return;
    this.modelRoot.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        obj.castShadow = castShadows;
      }
    });
  }

  public applyCosmeticTrim(accentHex: string, trimHex: string): void {
    this.accentColor.set(accentHex);
    this.trimColor.set(trimHex);
    for (const mat of this.clonedMaterials) {
      if (mat.name.toLowerCase().includes('trim') || mat.name.toLowerCase().includes('armor')) {
        mat.emissive.lerp(this.accentColor, 0.35);
      }
    }
  }

  public playClip(clipName: CharacterAnimClipName, fadeSeconds = 0.16, forceRestart = false): void {
    if (!this.mixer) return;
    const nextAction =
      this.actions.get(clipName) ??
      this.actions.get('idle') ??
      (this.actions.size > 0 ? Array.from(this.actions.values())[0] : null);
    if (!nextAction) return;

    if (this.currentClip === clipName && !forceRestart && nextAction.isRunning()) {
      return;
    }

    const prevClipKey = this.currentClip;
    const prevAction = prevClipKey ? this.actions.get(prevClipKey) : null;
    nextAction.enabled = true;
    nextAction.paused = false;
    nextAction.setEffectiveTimeScale(1);
    nextAction.setEffectiveWeight(1);

    if (!LOOPING_CLIPS.has(clipName) || forceRestart) {
      nextAction.reset();
    }

    if (prevAction && prevAction !== nextAction) {
      if (prevAction.isRunning()) {
        nextAction.play();
        prevAction.crossFadeTo(nextAction, fadeSeconds, false);
      } else {
        // Previous LoopOnce clip reached clampWhenFinished (paused=true): unpause weight fadeOut cleanly
        prevAction.fadeOut(fadeSeconds);
        nextAction.fadeIn(fadeSeconds).play();
      }
    } else {
      nextAction.fadeIn(fadeSeconds).play();
    }

    this.currentClip = clipName;
  }

  public setFacialMorph(morph: FacialMorphName, weight: number): void {
    const clamped = THREE.MathUtils.clamp(weight, 0, 1);
    for (const mesh of this.morphMeshes) {
      const dict = mesh.morphTargetDictionary;
      const inf = mesh.morphTargetInfluences;
      if (dict && inf && dict[morph] !== undefined) {
        inf[dict[morph]] = clamped;
      }
    }
  }

  public update(dt: number, elapsed: number, sample: CharacterMotionSample): void {
    if (!this.mixer || this.status !== 'ready') return;

    this.oneShotHoldTimer = Math.max(0, this.oneShotHoldTimer - dt);
    this.landingTimer = Math.max(0, this.landingTimer - dt);

    if (!this.wasGrounded && sample.grounded) {
      const impact = Math.max(sample.landingImpact ?? 0, sample.planarSpeed < 3.5 ? 0.36 : 0.22);
      this.landingSquash = Math.min(1.0, Math.max(this.landingSquash, impact));
      if (sample.planarSpeed < 4.2 || impact > 0.5) {
        this.landingTimer = 0.22;
      }
    }
    this.wasGrounded = sample.grounded;

    // Resolve target state-machine clip
    let desired: CharacterAnimClipName = 'idle';
    let fade = 0.14;

    if (sample.isDefeat) {
      desired = 'defeat';
      fade = 0.2;
    } else if (sample.isVictory) {
      desired = 'victory';
      fade = 0.24;
    } else if (sample.hurtActive) {
      desired = 'hit_reaction';
      fade = 0.05;
    } else if (sample.parryActive) {
      desired = 'parry';
      fade = 0.05;
    } else if (sample.dodgeActive) {
      desired = 'dodge';
      fade = 0.06;
    } else if (sample.attackActive) {
      fade = 0.055;
      if (sample.attackType === 'heavy' || sample.attackType === 'air') {
        desired = 'heavy_strike';
      } else if (sample.attackType === 'ability') {
        desired = 'ability_cast';
      } else if (sample.comboStep === 2) {
        desired = 'attack_2';
      } else if (sample.comboStep >= 3) {
        desired = 'attack_3';
      } else {
        desired = 'attack_1';
      }
    } else if (!sample.grounded) {
      desired = sample.verticalVel > 1.0 || sample.isSwinging ? 'jump' : 'fall';
      fade = 0.1;
    } else if (this.landingTimer > 0 && sample.planarSpeed < 4.2) {
      desired = 'landing';
      fade = 0.07;
    } else if (sample.showcaseMode) {
      desired = 'breathing';
      fade = 0.35;
    } else if (sample.planarSpeed > 8.4 || (sample.sprinting && sample.planarSpeed > 4.6)) {
      desired = 'sprint';
      fade = 0.12;
    } else if (sample.planarSpeed > 3.4) {
      desired = 'run';
      fade = 0.12;
    } else if (sample.planarSpeed > 0.28) {
      desired = 'walk';
      fade = 0.14;
    } else {
      desired = 'idle';
      fade = 0.2;
    }

    // Context-aware transition blend matrix for crisp combat cancels & weighted locomotion stops
    const prevClip = this.currentClip;
    if (prevClip && prevClip !== desired) {
      const isCombatStart =
        desired.startsWith('attack_') ||
        desired === 'heavy_strike' ||
        desired === 'parry' ||
        desired === 'dodge' ||
        desired === 'hit_reaction';
      const wasCombat =
        prevClip.startsWith('attack_') ||
        prevClip === 'heavy_strike' ||
        prevClip === 'parry' ||
        prevClip === 'ability_cast';
      const wasFastLoco = prevClip === 'sprint' || prevClip === 'run';

      if (isCombatStart) {
        fade = 0.045;
      } else if (wasCombat && (desired === 'walk' || desired === 'run' || desired === 'sprint')) {
        fade = 0.13;
      } else if (wasCombat && desired === 'idle') {
        fade = 0.19;
      } else if (wasFastLoco && desired === 'idle') {
        fade = 0.22;
      }
    }

    this.playClip(desired, fade, false);

    // Calibrated locomotion cadence scaling to match foot-plant stride distance and eliminate foot sliding
    const activeAction = this.actions.get(desired);
    if (activeAction && (desired === 'walk' || desired === 'run' || desired === 'sprint')) {
      const refSpeed = desired === 'walk' ? 2.62 : desired === 'run' ? 6.85 : 10.1;
      activeAction.timeScale = THREE.MathUtils.clamp(sample.planarSpeed / refSpeed, 0.62, 1.38);
    }

    this.mixer.update(dt);

    // Spring-damped secondary appendage physics (tails, dorsal spider limbs, 7 storm-mane crests)
    const speedAccel = dt > 1e-4 ? (sample.planarSpeed - this.prevPlanarSpeed) / dt : 0;
    this.prevPlanarSpeed = sample.planarSpeed;
    if (speedAccel < -12 && sample.grounded) {
      this.brakePitch = Math.max(this.brakePitch, Math.min(0.11, -speedAccel * 0.0032));
    }
    this.brakePitch = THREE.MathUtils.damp(this.brakePitch, 0, 9.5, dt);

    const targetYawLag = THREE.MathUtils.clamp(-(sample.turnYawDelta ?? 0) * 0.35, -0.32, 0.32);
    const targetVertLag = THREE.MathUtils.clamp(-sample.verticalVel * 0.028, -0.26, 0.26);
    this.yawTrailVel = THREE.MathUtils.damp(this.yawTrailVel, targetYawLag, 8.5, dt);
    this.vertTrailVel = THREE.MathUtils.damp(this.vertTrailVel, targetVertLag, 7.5, dt);

    for (let i = 0; i < this.tailBones.length; i++) {
      const tb = this.tailBones[i];
      const segFactor = 0.22 * ((i % 4) + 1);
      tb.rotation.y += this.yawTrailVel * segFactor;
      tb.rotation.x += this.vertTrailVel * segFactor;
    }
    for (let i = 0; i < this.spiderBones.length; i++) {
      const sb = this.spiderBones[i];
      const segFactor = 0.14 * ((i % 3) + 1);
      sb.rotation.y += this.yawTrailVel * segFactor * 0.65;
      sb.rotation.x += this.vertTrailVel * segFactor * 0.75;
    }
    for (let i = 0; i < this.maneBones.length; i++) {
      const mb = this.maneBones[i];
      mb.rotation.y += this.yawTrailVel * 0.28;
      mb.rotation.x += Math.max(-0.18, this.vertTrailVel * 0.55);
    }

    // Procedural turn-lean banking, athletic forward pitch, braking weight settle & landing compression
    if (this.modelRoot) {
      const targetBank =
        sample.grounded && !sample.attackActive && !sample.showcaseMode
          ? THREE.MathUtils.clamp(-(sample.turnYawDelta ?? 0) * 0.16, -0.22, 0.22)
          : 0;
      const targetPitch =
        sample.grounded && !sample.attackActive && !sample.showcaseMode
          ? (sample.sprinting && sample.planarSpeed > 5.2
              ? 0.075
              : sample.planarSpeed > 3.4
                ? 0.036
                : 0) - this.brakePitch
          : 0;
      this.bankRoll = THREE.MathUtils.damp(this.bankRoll, targetBank, 11, dt);
      this.forwardPitch = THREE.MathUtils.damp(this.forwardPitch, targetPitch, 9.5, dt);
      this.landingSquash = THREE.MathUtils.damp(this.landingSquash, 0, 12, dt);

      this.modelRoot.rotation.z = this.bankRoll;
      this.modelRoot.rotation.x = this.forwardPitch;
      const sxz = 1 + this.landingSquash * 0.055;
      const sy = 1 - this.landingSquash * 0.095;
      this.modelRoot.scale.set(sxz, sy, sxz);
    }

    // Facial expressions & automatic natural blink
    this.blinkTimer -= dt;
    let blinkWeight = 0;
    if (this.blinkTimer <= 0) {
      blinkWeight = this.blinkTimer > -0.11 ? 1.0 : 0.0;
      if (this.blinkTimer <= -0.12) {
        this.blinkTimer = 2.4 + (elapsed % 1.9);
      }
    }
    this.setFacialMorph('blink', sample.isDefeat ? 0.85 : blinkWeight);
    this.setFacialMorph('snarl', sample.attackActive ? 0.85 : sample.thryxenActive ? 0.45 : 0);
    this.setFacialMorph('roar', sample.attackType === 'ability' ? 0.9 : 0);
    this.setFacialMorph('pain', sample.hurtActive ? 0.9 : 0);
    this.setFacialMorph('focus', sample.parryActive || sample.thryxenActive ? 0.75 : 0);

    // Shadow Ink stealth & Thryxen emissive feedback on cloned materials
    const targetOpacity = sample.shadowInked ? 0.46 : 1.0;
    for (const mat of this.clonedMaterials) {
      if (sample.shadowInked) {
        mat.transparent = true;
        mat.opacity = targetOpacity;
      } else if (mat.opacity < 1.0) {
        mat.opacity = 1.0;
        mat.transparent = false;
      }
      mat.emissiveIntensity = sample.thryxenActive ? 1.65 : 1.0;
    }

    // Subtle ground aura modulation
    const auraMat = this.auraRing.material as THREE.MeshBasicMaterial;
    auraMat.opacity =
      this.characterId === 'kaijax'
        ? 0.58 + Math.sin(elapsed * 5) * 0.1
        : sample.thryxenActive
          ? 0.52
          : 0.25;
  }

  public getCurrentClip(): CharacterAnimClipName | null {
    return this.currentClip;
  }

  public getSecondaryBoneCounts(): {
    tailBones: number;
    physicalTailChains: number;
    spiderBones: number;
    maneBones: number;
  } {
    const tailChains = new Set<string>();
    for (const tb of this.tailBones) {
      const m = tb.name.match(/^(tail(?:_[a-z]+)?)_\d+$/);
      if (m) tailChains.add(m[1]);
    }
    return {
      tailBones: this.tailBones.length,
      physicalTailChains: tailChains.size,
      spiderBones: this.spiderBones.length,
      maneBones: this.maneBones.length,
    };
  }

  public getSocketWorldPosition(socketName: string, out: THREE.Vector3): THREE.Vector3 {
    const sock = this.sockets.get(socketName);
    if (sock) {
      return sock.getWorldPosition(out);
    }
    return this.root.getWorldPosition(out);
  }

  public getStrikeOriginWorld(forwardYaw: number, out: THREE.Vector3): THREE.Vector3 {
    const rHand = this.sockets.get('socket_hitbox_R') ?? this.sockets.get('hand_R');
    if (rHand && this.status === 'ready') {
      rHand.getWorldPosition(_worldScratch);
      out.set(
        _worldScratch.x + Math.sin(forwardYaw) * 0.85,
        this.root.position.y,
        _worldScratch.z + Math.cos(forwardYaw) * 0.85
      );
      return out;
    }
    out.set(
      this.root.position.x + Math.sin(forwardYaw) * 1.45,
      this.root.position.y,
      this.root.position.z + Math.cos(forwardYaw) * 1.45
    );
    return out;
  }

  private detachLoadedModel(): void {
    if (this.mixer && this.modelRoot) {
      this.mixer.stopAllAction();
      this.mixer.uncacheRoot(this.modelRoot);
    }
    this.mixer = null;
    this.actions.clear();
    this.sockets.clear();
    this.tailBones = [];
    this.spiderBones = [];
    this.maneBones = [];
    this.morphMeshes = [];
    this.currentClip = null;

    if (this.modelRoot) {
      this.root.remove(this.modelRoot);
      this.modelRoot = null;
    }
    for (const m of this.clonedMaterials) {
      m.dispose();
    }
    this.clonedMaterials = [];
    for (const g of this.clonedGeometries) {
      g.dispose();
    }
    this.clonedGeometries = [];
  }

  public setHitFlash(amount: number): void {
    const k = THREE.MathUtils.clamp(amount, 0, 1);
    for (const mat of this.clonedMaterials) {
      if (k > 0.01) {
        mat.emissiveIntensity = 1.0 + k * 2.2;
      } else {
        mat.emissiveIntensity = 1.0;
      }
    }
  }

  public dispose(): void {
    this.disposed = true;
    this.detachLoadedModel();
    this.shadowPlane.geometry.dispose();
    (this.shadowPlane.material as THREE.Material).dispose();
    this.auraRing.geometry.dispose();
    (this.auraRing.material as THREE.Material).dispose();
  }
}

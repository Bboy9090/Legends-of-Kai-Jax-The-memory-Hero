import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import {
  CHARACTER_ASSET_REGISTRY,
  CharacterAnimClipName,
  FacialMorphName,
  resolveCharacterGlbUrl,
  RosterCharacterId,
} from '../data/characterAssetRegistry';
import { GraphicsQuality } from '../types';

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
  public readonly characterId: RosterCharacterId;
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

  private sockets = new Map<string, THREE.Object3D>();
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
    characterId: RosterCharacterId,
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

    // Subtle canonical heritage ring at feet
    const auraHex =
      characterId === 'jax'
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
        opacity: characterId === 'kaijax' ? 0.62 : 0.28,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    this.auraRing.rotation.x = -Math.PI / 2;
    this.auraRing.position.y = 0.036;
    this.root.add(this.auraRing);

    if (fallbackNode) {
      this.fallbackNode = fallbackNode;
      this.root.add(fallbackNode);
      this.status = 'fallback';
    }
  }

  public async loadForQuality(
    quality: GraphicsQuality,
    maxAnisotropy = 4,
    castShadows = true,
    preferLod1 = false,
    forceProceduralFallback = false
  ): Promise<AssetLoadStatus> {
    if (this.disposed) return 'error';

    const entry = CHARACTER_ASSET_REGISTRY[this.characterId];
    if (!entry || entry.visualAuthorityStatus === 'awaiting_visual_approval') {
      this.status = 'awaiting_approval';
      return this.status;
    }

    if (forceProceduralFallback) {
      this.detachLoadedModel();
      if (this.fallbackNode) this.fallbackNode.visible = true;
      this.status = 'fallback';
      return this.status;
    }

    const targetUrl = resolveCharacterGlbUrl(this.characterId, quality, preferLod1);
    if (!targetUrl) {
      this.status = 'fallback';
      return this.status;
    }

    if (this.status === 'ready' && this.loadedUrl === targetUrl && this.modelRoot) {
      this.applyShadowFlag(castShadows);
      return 'ready';
    }

    const gen = ++this.loadGeneration;
    this.status = 'loading';

    try {
      const cached = await fetchCachedGltf(targetUrl);
      if (this.disposed || gen !== this.loadGeneration) return this.status;

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
              seenBones.add(b);
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
      console.warn(`[GLBCharacterController] Failed loading ${targetUrl}, retaining fallback:`, err);
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

    const prevAction = this.currentClip ? this.actions.get(this.currentClip) : null;
    nextAction.enabled = true;
    nextAction.setEffectiveTimeScale(1);
    nextAction.setEffectiveWeight(1);

    if (!LOOPING_CLIPS.has(clipName) || forceRestart) {
      nextAction.reset();
    }

    if (prevAction && prevAction !== nextAction) {
      nextAction.play();
      prevAction.crossFadeTo(nextAction, fadeSeconds, false);
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

    if (!this.wasGrounded && sample.grounded && sample.planarSpeed < 3.5) {
      this.landingTimer = 0.24;
    }
    this.wasGrounded = sample.grounded;

    // Resolve target state-machine clip
    let desired: CharacterAnimClipName = 'idle';
    let fade = 0.15;

    if (sample.isDefeat) {
      desired = 'defeat';
      fade = 0.2;
    } else if (sample.isVictory) {
      desired = 'victory';
      fade = 0.25;
    } else if (sample.hurtActive) {
      desired = 'hit_reaction';
      fade = 0.06;
    } else if (sample.parryActive) {
      desired = 'parry';
      fade = 0.06;
    } else if (sample.dodgeActive) {
      desired = 'dodge';
      fade = 0.07;
    } else if (sample.attackActive) {
      fade = 0.06;
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
      desired = sample.verticalVel > 1.2 || sample.isSwinging ? 'jump' : 'fall';
      fade = 0.12;
    } else if (this.landingTimer > 0) {
      desired = 'landing';
      fade = 0.08;
    } else if (sample.showcaseMode) {
      desired = 'breathing';
      fade = 0.35;
    } else if (sample.planarSpeed > 8.6 || (sample.sprinting && sample.planarSpeed > 4.5)) {
      desired = 'sprint';
      fade = 0.14;
    } else if (sample.planarSpeed > 3.6) {
      desired = 'run';
      fade = 0.14;
    } else if (sample.planarSpeed > 0.35) {
      desired = 'walk';
      fade = 0.16;
    } else {
      desired = 'idle';
      fade = 0.22;
    }

    this.playClip(desired, fade, false);

    // Dynamic locomotion cadence scaling
    const activeAction = this.actions.get(desired);
    if (activeAction && (desired === 'walk' || desired === 'run' || desired === 'sprint')) {
      const refSpeed = desired === 'walk' ? 2.4 : desired === 'run' ? 7.2 : 10.4;
      activeAction.timeScale = THREE.MathUtils.clamp(sample.planarSpeed / refSpeed, 0.72, 1.35);
    }

    this.mixer.update(dt);

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

  public dispose(): void {
    this.disposed = true;
    this.detachLoadedModel();
    this.shadowPlane.geometry.dispose();
    (this.shadowPlane.material as THREE.Material).dispose();
    this.auraRing.geometry.dispose();
    (this.auraRing.material as THREE.Material).dispose();
  }
}

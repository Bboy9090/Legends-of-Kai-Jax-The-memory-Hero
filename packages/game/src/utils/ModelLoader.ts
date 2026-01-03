// Three.js Model Loader for Beast-Kin Characters
// Path: packages/game/src/utils/ModelLoader.ts

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

// Character model configuration
interface CharacterModelConfig {
  id: string;
  lod: 0 | 1 | 2; // 0=High, 1=Medium, 2=Low
  animations?: string[]; // Animation names to load
  scale?: number; // Scale multiplier
  castShadow?: boolean;
  receiveShadow?: boolean;
}

// Model cache to avoid reloading
const modelCache = new Map<string, THREE.Group>();

// Setup Draco decoder for compressed models
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/'); // Place draco decoder files in public/draco/

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

/**
 * Load a character model from the assets folder
 * @param config - Character model configuration
 * @returns Promise<THREE.Group> - The loaded model
 */
export async function loadCharacterModel(config: CharacterModelConfig): Promise<THREE.Group> {
  const { id, lod = 1, scale = 1.0, castShadow = true, receiveShadow = true } = config;
  
  // Check cache first
  const cacheKey = `${id}_LOD${lod}`;
  if (modelCache.has(cacheKey)) {
    console.log(`[ModelLoader] Loading ${id} from cache`);
    return modelCache.get(cacheKey)!.clone();
  }

  // Build file path
  const fileName = `${id.toUpperCase()}_LOD${lod}.glb`;
  const path = `/assets/models/characters/${id}/${fileName}`;

  console.log(`[ModelLoader] Loading ${fileName}...`);

  return new Promise((resolve, reject) => {
    gltfLoader.load(
      path,
      (gltf) => {
        const model = gltf.scene;

        // Apply scale
        model.scale.set(scale, scale, scale);

        // Configure shadows and materials
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = castShadow;
            child.receiveShadow = receiveShadow;

            // Ensure proper material setup
            if (child.material) {
              const material = child.material as THREE.MeshStandardMaterial;
              material.needsUpdate = true;
              
              // Enable vertex colors if present
              if (child.geometry.attributes.color) {
                material.vertexColors = true;
              }
            }
          }
        });

        // Store animations if present
        if (gltf.animations && gltf.animations.length > 0) {
          (model as any).animations = gltf.animations;
          console.log(`[ModelLoader] Loaded ${gltf.animations.length} animations for ${id}`);
        }

        // Cache the model
        modelCache.set(cacheKey, model);
        console.log(`[ModelLoader] ✅ Successfully loaded ${fileName}`);

        resolve(model.clone());
      },
      (progress) => {
        const percentComplete = (progress.loaded / progress.total) * 100;
        console.log(`[ModelLoader] Loading ${id}: ${percentComplete.toFixed(1)}%`);
      },
      (error) => {
        console.error(`[ModelLoader] ❌ Failed to load ${path}:`, error);
        reject(error);
      }
    );
  });
}

/**
 * Load all Genesis playable characters
 * @returns Promise<Map<string, THREE.Group>>
 */
export async function loadAllGenesisCharacters(): Promise<Map<string, THREE.Group>> {
  const characterIds = [
    'kai-jax',
    'lunara-solis',
    'umbra-flux',
    'boryx-zenith',
    'sentinel-vox',
    'kiro-kong'
  ];

  const models = new Map<string, THREE.Group>();
  const loadPromises = characterIds.map(async (id) => {
    try {
      const model = await loadCharacterModel({ id, lod: 1 });
      models.set(id, model);
      return { id, success: true };
    } catch (error) {
      console.error(`Failed to load ${id}:`, error);
      return { id, success: false };
    }
  });

  const results = await Promise.all(loadPromises);
  const successCount = results.filter(r => r.success).length;
  console.log(`[ModelLoader] Loaded ${successCount}/${characterIds.length} characters`);

  return models;
}

/**
 * Setup animation mixer for a character model
 * @param model - The character model
 * @param animationName - Name of animation to play
 * @returns THREE.AnimationMixer | null
 */
export function setupAnimationMixer(
  model: THREE.Group,
  animationName?: string
): THREE.AnimationMixer | null {
  const animations = (model as any).animations;
  
  if (!animations || animations.length === 0) {
    console.warn('[ModelLoader] No animations found on model');
    return null;
  }

  const mixer = new THREE.AnimationMixer(model);

  // Play specific animation or first one
  const animToPlay = animationName 
    ? animations.find((a: THREE.AnimationClip) => a.name === animationName)
    : animations[0];

  if (animToPlay) {
    const action = mixer.clipAction(animToPlay);
    action.play();
    console.log(`[ModelLoader] Playing animation: ${animToPlay.name}`);
  }

  return mixer;
}

/**
 * Dispose of a model and free memory
 * @param model - The model to dispose
 */
export function disposeModel(model: THREE.Group): void {
  model.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose();
      
      if (Array.isArray(child.material)) {
        child.material.forEach(material => material.dispose());
      } else {
        child.material.dispose();
      }
    }
  });
}

/**
 * Clear the model cache
 */
export function clearModelCache(): void {
  modelCache.forEach((model) => disposeModel(model));
  modelCache.clear();
  console.log('[ModelLoader] Cache cleared');
}

/**
 * Preload character models for faster switching
 * @param characterIds - Array of character IDs to preload
 */
export async function preloadCharacters(characterIds: string[]): Promise<void> {
  console.log(`[ModelLoader] Preloading ${characterIds.length} characters...`);
  
  await Promise.all(
    characterIds.map(id => 
      loadCharacterModel({ id, lod: 1 }).catch(err => {
        console.error(`Failed to preload ${id}:`, err);
      })
    )
  );
  
  console.log('[ModelLoader] ✅ Preload complete');
}

// Export types
export type { CharacterModelConfig };

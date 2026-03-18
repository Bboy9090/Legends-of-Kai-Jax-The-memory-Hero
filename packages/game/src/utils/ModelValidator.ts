/**
 * Model Validator
 * Automated testing for 3D character model integration
 * OMEGA PROTOCOL - Quality Assurance
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

export interface ModelValidationResult {
  success: boolean;
  characterId: string;
  errors: string[];
  warnings: string[];
  stats: {
    polycount: number;
    textureCount: number;
    animationCount: number;
    boneCount: number;
    fileSize: number;
  };
}

export interface ValidationConfig {
  maxPolycount: number;
  maxFileSize: number; // MB
  requiredAnimations: string[];
  requiredTextures: string[];
  maxBoneCount: number;
}

const DEFAULT_CONFIG: ValidationConfig = {
  maxPolycount: 50000, // LOD0 max
  maxFileSize: 50, // MB
  requiredAnimations: ['Idle', 'Walk', 'Run', 'Jump'],
  requiredTextures: ['Albedo', 'Normal', 'MR'],
  maxBoneCount: 150,
};

export class ModelValidator {
  private loader: GLTFLoader;
  private config: ValidationConfig;

  constructor(config: Partial<ValidationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Setup GLTF loader with Draco
    this.loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    this.loader.setDRACOLoader(dracoLoader);
  }

  /**
   * Validate character model
   */
  async validateModel(
    characterId: string,
    modelPath: string
  ): Promise<ModelValidationResult> {
    const result: ModelValidationResult = {
      success: true,
      characterId,
      errors: [],
      warnings: [],
      stats: {
        polycount: 0,
        textureCount: 0,
        animationCount: 0,
        boneCount: 0,
        fileSize: 0,
      },
    };

    try {
      // Load model
      const gltf = await this.loadModel(modelPath);
      
      // Get file size
      result.stats.fileSize = await this.getFileSize(modelPath);
      
      // Validate geometry
      this.validateGeometry(gltf, result);
      
      // Validate materials
      this.validateMaterials(gltf, result);
      
      // Validate animations
      this.validateAnimations(gltf, result);
      
      // Validate rigging
      this.validateRigging(gltf, result);
      
      // Check file size
      if (result.stats.fileSize > this.config.maxFileSize) {
        result.errors.push(
          `File size (${result.stats.fileSize.toFixed(2)}MB) exceeds maximum (${this.config.maxFileSize}MB)`
        );
        result.success = false;
      }
      
      // Check polycount
      if (result.stats.polycount > this.config.maxPolycount) {
        result.warnings.push(
          `Polycount (${result.stats.polycount}) exceeds recommended maximum (${this.config.maxPolycount})`
        );
      }
      
      // Check bone count
      if (result.stats.boneCount > this.config.maxBoneCount) {
        result.warnings.push(
          `Bone count (${result.stats.boneCount}) exceeds recommended maximum (${this.config.maxBoneCount})`
        );
      }
      
    } catch (error) {
      result.success = false;
      result.errors.push(`Failed to load model: ${error}`);
    }

    return result;
  }

  /**
   * Load GLTF model
   */
  private async loadModel(path: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        path,
        (gltf) => resolve(gltf),
        undefined,
        (error) => reject(error)
      );
    });
  }

  /**
   * Get file size in MB
   */
  private async getFileSize(path: string): Promise<number> {
    try {
      const response = await fetch(path, { method: 'HEAD' });
      const contentLength = response.headers.get('content-length');
      if (contentLength) {
        return parseInt(contentLength, 10) / (1024 * 1024); // Convert to MB
      }
    } catch (error) {
      console.warn('Could not determine file size:', error);
    }
    return 0;
  }

  /**
   * Validate geometry
   */
  private validateGeometry(gltf: any, result: ModelValidationResult): void {
    let totalTris = 0;
    
    gltf.scene.traverse((object: THREE.Object3D) => {
      if (object instanceof THREE.Mesh) {
        const geometry = object.geometry;
        
        if (geometry.index) {
          // Indexed geometry
          totalTris += geometry.index.count / 3;
        } else {
          // Non-indexed
          totalTris += geometry.attributes.position.count / 3;
        }
        
        // Check for n-gons (should be quads or tris)
        if (geometry.attributes.position) {
          const vertexCount = geometry.attributes.position.count;
          if (vertexCount % 3 !== 0 && vertexCount % 4 !== 0) {
            result.warnings.push(`Mesh ${object.name} may contain n-gons`);
          }
        }
        
        // Check UVs
        if (!geometry.attributes.uv) {
          result.errors.push(`Mesh ${object.name} missing UV coordinates`);
          result.success = false;
        }
        
        // Check normals
        if (!geometry.attributes.normal) {
          result.warnings.push(`Mesh ${object.name} missing normals (will be auto-generated)`);
        }
      }
    });
    
    result.stats.polycount = totalTris;
  }

  /**
   * Validate materials
   */
  private validateMaterials(gltf: any, result: ModelValidationResult): void {
    const materials = new Set<string>();
    
    gltf.scene.traverse((object: THREE.Object3D) => {
      if (object instanceof THREE.Mesh && object.material) {
        const material = object.material as THREE.MeshStandardMaterial;
        
        if (material.name) {
          materials.add(material.name);
        }
        
        // Check for PBR materials
        if (!material.metalness && !material.roughness) {
          result.warnings.push(`Material ${material.name} may not be PBR`);
        }
      }
    });
    
    result.stats.textureCount = materials.size;
    
    // Check for required textures (if specified in config)
    // This would require checking texture files, which is more complex
  }

  /**
   * Validate animations
   */
  private validateAnimations(gltf: any, result: ModelValidationResult): void {
    result.stats.animationCount = gltf.animations?.length || 0;
    
    if (result.stats.animationCount === 0) {
      result.warnings.push('No animations found in model');
    }
    
    // Check for required animations
    const animationNames = gltf.animations?.map((anim: any) => anim.name.toLowerCase()) || [];
    
    for (const requiredAnim of this.config.requiredAnimations) {
      const found = animationNames.some((name: string) => 
        name.includes(requiredAnim.toLowerCase())
      );
      
      if (!found) {
        result.warnings.push(`Required animation "${requiredAnim}" not found`);
      }
    }
  }

  /**
   * Validate rigging
   */
  private validateRigging(gltf: any, result: ModelValidationResult): void {
    let boneCount = 0;
    
    gltf.scene.traverse((object: THREE.Object3D) => {
      if (object instanceof THREE.SkinnedMesh) {
        const skeleton = object.skeleton;
        if (skeleton) {
          boneCount = skeleton.bones.length;
        }
      }
    });
    
    result.stats.boneCount = boneCount;
    
    if (boneCount === 0) {
      result.warnings.push('No armature found (model may be static)');
    }
  }

  /**
   * Performance test - render model and check FPS
   */
  async performanceTest(
    characterId: string,
    modelPath: string,
    targetFPS: number = 60
  ): Promise<{ success: boolean; averageFPS: number; minFPS: number }> {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    
    try {
      const gltf = await this.loadModel(modelPath);
      scene.add(gltf.scene);
      
      camera.position.set(0, 0, 5);
      camera.lookAt(0, 0, 0);
      
      const fpsHistory: number[] = [];
      let lastTime = performance.now();
      let frameCount = 0;
      
      const measureFPS = () => {
        frameCount++;
        const currentTime = performance.now();
        const delta = currentTime - lastTime;
        
        if (delta >= 1000) {
          const fps = (frameCount * 1000) / delta;
          fpsHistory.push(fps);
          frameCount = 0;
          lastTime = currentTime;
        }
        
        renderer.render(scene, camera);
        
        if (fpsHistory.length < 60) {
          requestAnimationFrame(measureFPS);
        }
      };
      
      await new Promise((resolve) => {
        const checkComplete = () => {
          if (fpsHistory.length >= 60) {
            resolve(undefined);
          } else {
            requestAnimationFrame(checkComplete);
          }
        };
        measureFPS();
        checkComplete();
      });
      
      const averageFPS = fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length;
      const minFPS = Math.min(...fpsHistory);
      
      return {
        success: averageFPS >= targetFPS,
        averageFPS,
        minFPS,
      };
    } catch (error) {
      return {
        success: false,
        averageFPS: 0,
        minFPS: 0,
      };
    }
  }
}

/**
 * Quick validation function
 */
export async function validateCharacterModel(
  characterId: string,
  modelPath: string
): Promise<ModelValidationResult> {
  const validator = new ModelValidator();
  return validator.validateModel(characterId, modelPath);
}

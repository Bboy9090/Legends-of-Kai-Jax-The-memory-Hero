/**
 * ULTIMATE ENTERTAINMENT ENTERPRISES PRESENTS
 * THREE.JS PERFORMANCE OPTIMIZER
 * Mobile/Tablet/PC optimization utilities
 */

import * as THREE from 'three';

/**
 * Detect device type for optimization
 */
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

/**
 * Get optimal quality settings based on device
 */
export function getQualitySettings() {
  const deviceType = getDeviceType();
  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';

  return {
    // Render settings
    pixelRatio: isMobile ? Math.min(window.devicePixelRatio, 1.5) : window.devicePixelRatio,
    antialias: !isMobile, // Disable AA on mobile for performance
    shadowMap: {
      enabled: true,
      type: isMobile ? THREE.BasicShadowMap : THREE.PCFSoftShadowMap,
      size: isMobile ? 512 : isTablet ? 1024 : 2048,
    },
    
    // Post-processing
    postProcessing: !isMobile, // Disable on mobile
    
    // Geometry
    geometryQuality: isMobile ? 'low' : isTablet ? 'medium' : 'high',
    
    // Textures
    textureSize: isMobile ? 1024 : isTablet ? 2048 : 4096,
    useKTX2: true, // Use KTX2 compression
    useDraco: true, // Use Draco compression
    
    // Animation
    animationFPS: isMobile ? 30 : 60,
    
    // LOD
    useLOD: true,
    lodDistance: isMobile ? 5 : isTablet ? 10 : 20,
  };
}

/**
 * Optimize material for device
 */
export function optimizeMaterial(material: THREE.Material, deviceType: 'mobile' | 'tablet' | 'desktop') {
  if (material instanceof THREE.MeshStandardMaterial) {
    if (deviceType === 'mobile') {
      // Mobile: simpler materials
      material.roughness = 0.8;
      material.metalness = 0.2;
      material.envMapIntensity = 0.5;
      // Disable expensive features
      material.aoMap = null;
      material.normalMap = null;
    } else if (deviceType === 'tablet') {
      // Tablet: medium quality
      material.roughness = 0.7;
      material.metalness = 0.25;
      material.envMapIntensity = 0.75;
    } else {
      // Desktop: full quality
      material.roughness = 0.6;
      material.metalness = 0.3;
      material.envMapIntensity = 1.0;
    }
  }
}

/**
 * Create optimized renderer
 */
export function createOptimizedRenderer(canvas: HTMLCanvasElement): THREE.WebGLRenderer {
  const deviceType = getDeviceType();
  const settings = getQualitySettings();
  
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: settings.antialias,
    powerPreference: 'high-performance',
    alpha: false,
  });
  
  renderer.setPixelRatio(settings.pixelRatio);
  renderer.shadowMap.enabled = settings.shadowMap.enabled;
  renderer.shadowMap.type = settings.shadowMap.type;
  renderer.setSize(window.innerWidth, window.innerHeight);
  
  // Mobile optimizations
  if (deviceType === 'mobile') {
    renderer.outputColorSpace = THREE.SRGBColorSpace; // Simpler color space
    renderer.toneMapping = THREE.NoToneMapping; // Disable tone mapping
  } else {
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
  }
  
  return renderer;
}

/**
 * LOD system for models
 */
export function getLODLevel(distance: number, deviceType: 'mobile' | 'tablet' | 'desktop'): 0 | 1 | 2 {
  const thresholds = {
    mobile: { high: 3, medium: 8 },
    tablet: { high: 5, medium: 15 },
    desktop: { high: 10, medium: 25 },
  };
  
  const threshold = thresholds[deviceType];
  
  if (distance < threshold.high) return 0; // High detail
  if (distance < threshold.medium) return 1; // Medium detail
  return 2; // Low detail
}

/**
 * Code splitting helper - lazy load heavy models
 */
export async function loadModelLazy(path: string): Promise<THREE.Group> {
  const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
  const { DRACOLoader } = await import('three/examples/jsm/loaders/DRACOLoader.js');
  
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('/draco/');
  loader.setDRACOLoader(dracoLoader);
  
  return new Promise((resolve, reject) => {
    loader.load(
      path,
      (gltf) => resolve(gltf.scene),
      undefined,
      reject
    );
  });
}

/**
 * Texture optimization - use KTX2/BasisU
 */
export async function loadOptimizedTexture(path: string): Promise<THREE.Texture> {
  const { KTX2Loader } = await import('three/examples/jsm/loaders/KTX2Loader.js');
  
  // Try KTX2 first, then regular (Basis loader path varies across Three versions)
  try {
    const ktxLoader = new KTX2Loader();
    ktxLoader.setTranscoderPath('/basis/');
    return await new Promise((resolve, reject) => {
      ktxLoader.load(path, resolve, undefined, reject);
    });
  } catch {
    // Fallback to regular texture loader
    const loader = new THREE.TextureLoader();
    return loader.load(path);
  }
}

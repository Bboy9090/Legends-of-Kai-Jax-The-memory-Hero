import { useRef, useMemo, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface PerformanceConfig {
  targetFPS: number;
  minQuality: number;
  maxQuality: number;
}

const DEFAULT_CONFIG: PerformanceConfig = {
  targetFPS: 60,
  minQuality: 0.3,
  maxQuality: 1.0,
};

class PerformanceMonitor {
  private frameCount = 0;
  private frameTime = 0;
  private lastTime = performance.now();
  private fps = 60;
  private quality = 1.0;

  update(): void {
    const now = performance.now();
    const delta = now - this.lastTime;
    this.lastTime = now;
    this.frameTime += delta;
    this.frameCount += 1;

    if (this.frameTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.frameTime = 0;
    }
  }

  getFPS(): number {
    return this.fps;
  }

  getQuality(): number {
    return this.quality;
  }

  setQuality(q: number): void {
    this.quality = Math.max(0, Math.min(1, q));
  }

  adjustQualityDynamic(config: PerformanceConfig): void {
    const fpsRatio = this.fps / config.targetFPS;
    if (fpsRatio < 0.85) {
      this.setQuality(Math.max(config.minQuality, this.quality - 0.1));
    } else if (fpsRatio > 1.1 && this.quality < config.maxQuality) {
      this.setQuality(Math.min(config.maxQuality, this.quality + 0.05));
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();

interface PerformanceOptimizerProps {
  config?: Partial<PerformanceConfig>;
  onQualityChange?: (quality: number) => void;
}

export function PerformanceOptimizer({ config = {}, onQualityChange }: PerformanceOptimizerProps) {
  const { gl, scene } = useThree();
  const mergedConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);
  const updateRef = useRef<number>();

  useEffect(() => {
    const animationLoop = () => {
      performanceMonitor.update();
      performanceMonitor.adjustQualityDynamic(mergedConfig);

      const newQuality = performanceMonitor.getQuality();
      onQualityChange?.(newQuality);

      updateRef.current = requestAnimationFrame(animationLoop);
    };

    updateRef.current = requestAnimationFrame(animationLoop);

    return () => {
      if (updateRef.current) {
        cancelAnimationFrame(updateRef.current);
      }
    };
  }, [mergedConfig, onQualityChange]);

  useEffect(() => {
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFShadowMap;
    gl.shadowMap.autoUpdate = true;

    const shadowMapResolution = 1024;
    scene.traverse((node) => {
      if (node instanceof THREE.Light && 'shadow' in node && node.shadow) {
        node.shadow.mapSize.width = shadowMapResolution;
        node.shadow.mapSize.height = shadowMapResolution;
        node.shadow.camera.far = 100;
        node.shadow.camera.near = 0.1;

        if (node instanceof THREE.DirectionalLight) {
          node.shadow.camera.left = -50;
          node.shadow.camera.right = 50;
          node.shadow.camera.top = 50;
          node.shadow.camera.bottom = -50;
        }
      }
    });
  }, [gl, scene]);

  return null;
}

export function useQualityLevel(): number {
  return performanceMonitor.getQuality();
}

export function useFPS(): number {
  return performanceMonitor.getFPS();
}

export function getParticleCount(baseCount: number, quality: number): number {
  return Math.floor(baseCount * quality);
}

export function getShadowMapResolution(quality: number): number {
  return quality > 0.7 ? 2048 : quality > 0.4 ? 1024 : 512;
}

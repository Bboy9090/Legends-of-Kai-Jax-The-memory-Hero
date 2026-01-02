// Visual Effects Coordinator
// Path: packages/game/src/systems/VFXCoordinator.ts

import * as THREE from 'three';
import { EventBus } from '@game/core/EventBus';

interface ParticleEffect {
  position: THREE.Vector3;
  type: 'hit' | 'spark' | 'dust' | 'energy' | 'heal' | 'dread';
  lifetime: number;
  count: number;
  scale: number;
  color: THREE.Color;
}

interface ScreenShake {
  intensity: number;
  duration: number;
  elapsed: number;
}

/**
 * Visual effects coordinator
 * Manages particles, screen shake, color grading, and other visual effects
 */
export class VFXCoordinator {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private eventBus: EventBus;
  
  private particleGeometry: THREE.BufferGeometry;
  private particleMaterials: Map<string, THREE.Material> = new Map();
  private activeParticles: THREE.Points[] = [];
  private screenShakes: ScreenShake[] = [];
  private cameraBasePosition: THREE.Vector3;

  constructor(scene: THREE.Scene, camera: THREE.Camera, eventBus: EventBus) {
    this.scene = scene;
    this.camera = camera;
    this.eventBus = eventBus;
    this.cameraBasePosition = camera.position.clone();

    // Setup particle system
    this.particleGeometry = new THREE.BufferGeometry();
    this.setupParticleMaterials();
    this.setupEventListeners();
  }

  /**
   * Setup particle materials
   */
  private setupParticleMaterials(): void {
    // Hit effect (yellow/red sparks)
    const hitMaterial = new THREE.PointsMaterial({
      color: 0xffaa00,
      size: 0.1,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.8,
    });
    this.particleMaterials.set('hit', hitMaterial);

    // Dust effect (gray)
    const dustMaterial = new THREE.PointsMaterial({
      color: 0x888888,
      size: 0.15,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.6,
    });
    this.particleMaterials.set('dust', dustMaterial);

    // Energy effect (cyan/blue)
    const energyMaterial = new THREE.PointsMaterial({
      color: 0x00ffff,
      size: 0.12,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.9,
    });
    this.particleMaterials.set('energy', energyMaterial);

    // Heal effect (green)
    const healMaterial = new THREE.PointsMaterial({
      color: 0x00ff00,
      size: 0.1,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.7,
    });
    this.particleMaterials.set('heal', healMaterial);

    // Dread effect (red/dark)
    const dreadMaterial = new THREE.PointsMaterial({
      color: 0xff3333,
      size: 0.08,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.8,
    });
    this.particleMaterials.set('dread', dreadMaterial);
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    this.eventBus.subscribe('vfx:hit_effect', (data: any) => {
      this.createHitEffect(data.position, data.damage);
    });

    this.eventBus.subscribe('camera:shake', (data: any) => {
      this.addScreenShake(data.intensity, data.duration);
    });

    this.eventBus.subscribe('vfx:dread_pulse', (data: any) => {
      this.createDreadEffect(data.position, data.intensity);
    });

    this.eventBus.subscribe('attack:landed', (data: any) => {
      this.createImpactEffect(data.hitPosition, data.damage);
    });
  }

  /**
   * Create hit effect particles
   */
  public createHitEffect(position: THREE.Vector3, damage: number): void {
    const particleCount = Math.min(20, Math.floor(damage / 5));
    const particles: THREE.Vector3[] = [];

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = 5 + Math.random() * 5;
      
      const x = position.x + Math.cos(angle) * speed * 0.1;
      const y = position.y + Math.sin(angle) * speed * 0.1;
      const z = position.z + (Math.random() - 0.5) * 2;

      particles.push(new THREE.Vector3(x, y, z));
    }

    this.createParticleSystem('hit', particles, 0.5);
  }

  /**
   * Create impact effect (larger dust cloud)
   */
  private createImpactEffect(position: THREE.Vector3, damage: number): void {
    const dustCount = Math.min(30, Math.floor(damage / 3));
    const particles: THREE.Vector3[] = [];

    for (let i = 0; i < dustCount; i++) {
      const x = position.x + (Math.random() - 0.5) * 3;
      const y = position.y + (Math.random() - 0.5) * 2;
      const z = position.z + (Math.random() - 0.5) * 3;

      particles.push(new THREE.Vector3(x, y, z));
    }

    this.createParticleSystem('dust', particles, 1.0);
  }

  /**
   * Create dread effect
   */
  private createDreadEffect(position: THREE.Vector3, intensity: number): void {
    const particleCount = Math.floor(intensity * 10);
    const particles: THREE.Vector3[] = [];

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 2;
      
      const x = position.x + Math.cos(angle) * radius;
      const y = position.y + Math.random() * 3;
      const z = position.z + Math.sin(angle) * radius;

      particles.push(new THREE.Vector3(x, y, z));
    }

    this.createParticleSystem('dread', particles, 1.5);
  }

  /**
   * Create particle system
   */
  private createParticleSystem(
    type: string,
    positions: THREE.Vector3[],
    lifetime: number
  ): void {
    const material = this.particleMaterials.get(type);
    if (!material) return;

    // Create geometry
    const geometry = new THREE.BufferGeometry();
    const posArray = new Float32Array(positions.length * 3);
    
    positions.forEach((pos, i) => {
      posArray[i * 3] = pos.x;
      posArray[i * 3 + 1] = pos.y;
      posArray[i * 3 + 2] = pos.z;
    });

    geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    // Create points
    const points = new THREE.Points(geometry, material.clone());
    this.scene.add(points);
    this.activeParticles.push(points);

    // Auto-remove after lifetime
    setTimeout(() => {
      this.scene.remove(points);
      geometry.dispose();
      (points.material as THREE.Material).dispose();
      const index = this.activeParticles.indexOf(points);
      if (index > -1) {
        this.activeParticles.splice(index, 1);
      }
    }, lifetime * 1000);
  }

  /**
   * Add screen shake effect
   */
  public addScreenShake(intensity: number, duration: number): void {
    this.screenShakes.push({
      intensity,
      duration,
      elapsed: 0,
    });
  }

  /**
   * Update visual effects
   */
  public update(deltaTime: number): void {
    // Update screen shake
    for (let i = this.screenShakes.length - 1; i >= 0; i--) {
      const shake = this.screenShakes[i];
      shake.elapsed += deltaTime;

      if (shake.elapsed >= shake.duration) {
        this.screenShakes.splice(i, 1);
        continue;
      }

      // Apply shake using perlin-like noise
      const progress = shake.elapsed / shake.duration;
      const intensity = shake.intensity * (1 - progress); // Fade out
      
      const shakeX = (Math.random() - 0.5) * intensity;
      const shakeY = (Math.random() - 0.5) * intensity;

      this.camera.position.copy(this.cameraBasePosition);
      this.camera.position.x += shakeX;
      this.camera.position.y += shakeY;
    }

    // Reset camera if no shakes
    if (this.screenShakes.length === 0) {
      this.camera.position.copy(this.cameraBasePosition);
    }
  }

  /**
   * Update camera base position (for smooth transitions)
   */
  public setCameraBasePosition(position: THREE.Vector3): void {
    this.cameraBasePosition.copy(position);
  }

  /**
   * Clear all visual effects
   */
  public clear(): void {
    for (const points of this.activeParticles) {
      this.scene.remove(points);
      points.geometry.dispose();
      (points.material as THREE.Material).dispose();
    }
    this.activeParticles = [];
    this.screenShakes = [];
    this.camera.position.copy(this.cameraBasePosition);
  }
}

/**
 * ⚡ LEGENDARY TRANSFORMATION SYSTEM ⚡
 * Ultimate God-Tier Transformation Engine for Legends of Kai-Jax
 * 
 * Transformation Tiers:
 * 1. BASE FORM - Standard power level
 * 2. AWAKENED FORM - 25% Resonance unlock (Beast Awakening)
 * 3. SAGE MODE - 50% Resonance unlock (Sage Eyes activated)
 * 4. LEGENDARY FORM - 75% Resonance unlock (Memory Strand Tails active)
 * 5. GOD FORM - 100% Resonance unlock (Ultimate Cosmic Power)
 * 
 * Each transformation grants:
 * - Visual effects (aura, particles, glow)
 * - Stat multipliers (power, speed, defense)
 * - New abilities unlock
 * - Screen effects (shake, flash, distortion)
 */

import * as THREE from 'three';
import { EventBus } from '../core/EventBus';

// Transformation tier definitions
export enum TransformationTier {
  BASE = 0,
  AWAKENED = 1,
  SAGE = 2,
  LEGENDARY = 3,
  GOD = 4,
}

export interface TransformationConfig {
  tier: TransformationTier;
  name: string;
  displayName: string;
  resonanceThreshold: number;
  statMultipliers: {
    power: number;
    speed: number;
    defense: number;
    gravity: number;
  };
  visualConfig: {
    auraColor: number;
    auraIntensity: number;
    particleColor: number;
    particleCount: number;
    eyeGlow: number;
    bodyEmissive: number;
    screenShakeIntensity: number;
    chromaticAberration: number;
  };
  abilities: string[];
  voiceLine?: string;
}

// Character-specific transformation configurations
export const TRANSFORMATION_CONFIGS: Record<string, TransformationConfig[]> = {
  'kai-jax': [
    {
      tier: TransformationTier.BASE,
      name: 'base',
      displayName: 'Memory Warrior',
      resonanceThreshold: 0,
      statMultipliers: { power: 1.0, speed: 1.0, defense: 1.0, gravity: 9.8 },
      visualConfig: {
        auraColor: 0x1a1a2e,
        auraIntensity: 0,
        particleColor: 0x7c3aed,
        particleCount: 0,
        eyeGlow: 0.5,
        bodyEmissive: 0,
        screenShakeIntensity: 0,
        chromaticAberration: 0,
      },
      abilities: ['Flicker-Strike', 'Velocity-Echo'],
    },
    {
      tier: TransformationTier.AWAKENED,
      name: 'awakened',
      displayName: 'Beast Awakening',
      resonanceThreshold: 25,
      statMultipliers: { power: 1.25, speed: 1.15, defense: 1.1, gravity: 12.0 },
      visualConfig: {
        auraColor: 0x9d4edd,
        auraIntensity: 0.4,
        particleColor: 0xc084fc,
        particleCount: 50,
        eyeGlow: 1.0,
        bodyEmissive: 0.2,
        screenShakeIntensity: 0.02,
        chromaticAberration: 0.01,
      },
      abilities: ['Velocity-Echo', 'Phantom-Strike', 'Quill-Storm'],
      voiceLine: 'My power... AWAKENS!',
    },
    {
      tier: TransformationTier.SAGE,
      name: 'sage',
      displayName: 'Sage Mode',
      resonanceThreshold: 50,
      statMultipliers: { power: 1.5, speed: 1.3, defense: 1.25, gravity: 14.0 },
      visualConfig: {
        auraColor: 0xffd700,
        auraIntensity: 0.7,
        particleColor: 0xfbbf24,
        particleCount: 100,
        eyeGlow: 2.0,
        bodyEmissive: 0.4,
        screenShakeIntensity: 0.04,
        chromaticAberration: 0.02,
      },
      abilities: ['Sage-Vision', 'Memory-Flash', 'Ink-Shield', 'Tri-Tail Lash'],
      voiceLine: 'The Memory... flows through me.',
    },
    {
      tier: TransformationTier.LEGENDARY,
      name: 'legendary',
      displayName: 'Memory King',
      resonanceThreshold: 75,
      statMultipliers: { power: 2.0, speed: 1.5, defense: 1.5, gravity: 16.0 },
      visualConfig: {
        auraColor: 0x00f2ff,
        auraIntensity: 1.0,
        particleColor: 0x00d9ff,
        particleCount: 200,
        eyeGlow: 3.0,
        bodyEmissive: 0.7,
        screenShakeIntensity: 0.08,
        chromaticAberration: 0.04,
      },
      abilities: ['Archive-Recall', 'Nebula-Burst', 'Father-Anchor', 'Velocity-Overdrive'],
      voiceLine: 'I AM THE ARCHIVE KING!',
    },
    {
      tier: TransformationTier.GOD,
      name: 'god',
      displayName: 'THE ULTIMATE FORM',
      resonanceThreshold: 100,
      statMultipliers: { power: 3.0, speed: 2.0, defense: 2.0, gravity: 18.0 },
      visualConfig: {
        auraColor: 0xffffff,
        auraIntensity: 2.0,
        particleColor: 0xffffff,
        particleCount: 500,
        eyeGlow: 5.0,
        bodyEmissive: 1.0,
        screenShakeIntensity: 0.15,
        chromaticAberration: 0.08,
      },
      abilities: [
        'GODS-WILL-TREMBLE',
        'Memory-Supernova',
        'Infinite-Velocity',
        'Cosmic-Archive',
        'Ultimate-Fusion',
      ],
      voiceLine: 'GODS... WILL... TREMBLE!',
    },
  ],
  'jaxon': [
    {
      tier: TransformationTier.BASE,
      name: 'base',
      displayName: 'Velocity Fracture',
      resonanceThreshold: 0,
      statMultipliers: { power: 0.9, speed: 1.2, defense: 0.85, gravity: 9.8 },
      visualConfig: {
        auraColor: 0x333333,
        auraIntensity: 0,
        particleColor: 0x00ced1,
        particleCount: 0,
        eyeGlow: 0.3,
        bodyEmissive: 0,
        screenShakeIntensity: 0,
        chromaticAberration: 0,
      },
      abilities: ['Flicker-Strike', 'Panic-Speed'],
    },
    {
      tier: TransformationTier.AWAKENED,
      name: 'awakened',
      displayName: 'Electric Surge',
      resonanceThreshold: 25,
      statMultipliers: { power: 1.1, speed: 1.5, defense: 0.95, gravity: 11.0 },
      visualConfig: {
        auraColor: 0x00ced1,
        auraIntensity: 0.5,
        particleColor: 0x00ffff,
        particleCount: 80,
        eyeGlow: 1.5,
        bodyEmissive: 0.3,
        screenShakeIntensity: 0.03,
        chromaticAberration: 0.015,
      },
      abilities: ['Lightning-Dash', 'Quill-Barrage', 'Static-Field'],
      voiceLine: 'Can you keep up?!',
    },
    {
      tier: TransformationTier.GOD,
      name: 'god',
      displayName: 'THUNDER GOD',
      resonanceThreshold: 100,
      statMultipliers: { power: 2.5, speed: 3.0, defense: 1.5, gravity: 15.0 },
      visualConfig: {
        auraColor: 0x00ffff,
        auraIntensity: 2.0,
        particleColor: 0xffffff,
        particleCount: 400,
        eyeGlow: 5.0,
        bodyEmissive: 1.0,
        screenShakeIntensity: 0.12,
        chromaticAberration: 0.06,
      },
      abilities: ['INFINITE-VELOCITY', 'Thunder-Annihilation', 'Speed-Force'],
      voiceLine: 'WITNESS TRUE SPEED!',
    },
  ],
  'kaison': [
    {
      tier: TransformationTier.BASE,
      name: 'base',
      displayName: 'Star-Force Kitsune',
      resonanceThreshold: 0,
      statMultipliers: { power: 1.0, speed: 1.0, defense: 1.0, gravity: 9.8 },
      visualConfig: {
        auraColor: 0x444444,
        auraIntensity: 0,
        particleColor: 0xffd700,
        particleCount: 0,
        eyeGlow: 0.4,
        bodyEmissive: 0,
        screenShakeIntensity: 0,
        chromaticAberration: 0,
      },
      abilities: ['Web-Control', 'Sky-Anchor', 'Chase-Badge'],
    },
    {
      tier: TransformationTier.SAGE,
      name: 'sage',
      displayName: 'Nine-Tail Sage',
      resonanceThreshold: 50,
      statMultipliers: { power: 1.6, speed: 1.4, defense: 1.3, gravity: 13.0 },
      visualConfig: {
        auraColor: 0xffd700,
        auraIntensity: 0.8,
        particleColor: 0xffaa00,
        particleCount: 120,
        eyeGlow: 2.5,
        bodyEmissive: 0.5,
        screenShakeIntensity: 0.05,
        chromaticAberration: 0.025,
      },
      abilities: ['Star-Burst', 'Web-Matrix', 'Tail-Blade-Storm'],
      voiceLine: 'The stars guide my path!',
    },
    {
      tier: TransformationTier.GOD,
      name: 'god',
      displayName: 'CELESTIAL GUARDIAN',
      resonanceThreshold: 100,
      statMultipliers: { power: 2.8, speed: 2.2, defense: 2.0, gravity: 16.0 },
      visualConfig: {
        auraColor: 0xffffff,
        auraIntensity: 2.0,
        particleColor: 0xffd700,
        particleCount: 450,
        eyeGlow: 5.0,
        bodyEmissive: 1.0,
        screenShakeIntensity: 0.14,
        chromaticAberration: 0.07,
      },
      abilities: ['COSMIC-JUDGEMENT', 'Star-Nova', 'Divine-Protection'],
      voiceLine: 'CELESTIAL POWER UNLEASHED!',
    },
  ],
};

export class TransformationSystem {
  private eventBus: EventBus;
  private currentTransformations: Map<string, TransformationTier> = new Map();
  private transformationProgress: Map<string, number> = new Map();
  private auraParticles: Map<string, THREE.Points> = new Map();
  private auraLights: Map<string, THREE.PointLight> = new Map();

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.eventBus.subscribe('resonance:updated', this.handleResonanceUpdate.bind(this));
    this.eventBus.subscribe('transformation:trigger', this.handleTransformationTrigger.bind(this));
  }

  /**
   * Initialize transformation state for a character
   */
  public initializeCharacter(characterId: string): void {
    this.currentTransformations.set(characterId, TransformationTier.BASE);
    this.transformationProgress.set(characterId, 0);
  }

  /**
   * Handle resonance update - check if transformation threshold reached
   */
  private handleResonanceUpdate(data: { characterId: string; resonance: number }): void {
    const { characterId, resonance } = data;
    const configs = TRANSFORMATION_CONFIGS[characterId];
    if (!configs) return;

    const currentTier = this.currentTransformations.get(characterId) || TransformationTier.BASE;
    
    // Find highest tier that can be achieved
    let targetTier = TransformationTier.BASE;
    for (const config of configs) {
      if (resonance >= config.resonanceThreshold && config.tier > targetTier) {
        targetTier = config.tier;
      }
    }

    // Trigger transformation if tier changed
    if (targetTier > currentTier) {
      this.triggerTransformation(characterId, targetTier);
    }
  }

  /**
   * Handle manual transformation trigger
   */
  private handleTransformationTrigger(data: { characterId: string; tier: TransformationTier }): void {
    this.triggerTransformation(data.characterId, data.tier);
  }

  /**
   * Trigger a transformation with full visual effects
   */
  public triggerTransformation(characterId: string, tier: TransformationTier): void {
    const configs = TRANSFORMATION_CONFIGS[characterId];
    if (!configs) return;

    const config = configs.find(c => c.tier === tier);
    if (!config) return;

    const previousTier = this.currentTransformations.get(characterId) || TransformationTier.BASE;
    this.currentTransformations.set(characterId, tier);

    // Emit transformation events
    this.eventBus.emit('transformation:started', {
      characterId,
      fromTier: previousTier,
      toTier: tier,
      config,
    });

    // Screen effects
    if (config.visualConfig.screenShakeIntensity > 0) {
      this.eventBus.emit('screen:shake', {
        intensity: config.visualConfig.screenShakeIntensity,
        duration: 1.5,
      });
    }

    // Flash effect
    this.eventBus.emit('screen:flash', {
      color: config.visualConfig.auraColor,
      intensity: tier >= TransformationTier.LEGENDARY ? 1.0 : 0.5,
      duration: 0.3,
    });

    // Voice line
    if (config.voiceLine) {
      this.eventBus.emit('audio:voiceLine', {
        characterId,
        line: config.voiceLine,
      });
    }

    // Transformation complete
    setTimeout(() => {
      this.eventBus.emit('transformation:completed', {
        characterId,
        tier,
        config,
        statMultipliers: config.statMultipliers,
        abilities: config.abilities,
      });
    }, 1500);
  }

  /**
   * Get current transformation config for a character
   */
  public getCurrentTransformation(characterId: string): TransformationConfig | null {
    const tier = this.currentTransformations.get(characterId) || TransformationTier.BASE;
    const configs = TRANSFORMATION_CONFIGS[characterId];
    if (!configs) return null;
    
    return configs.find(c => c.tier === tier) || null;
  }

  /**
   * Get stat multipliers for current transformation
   */
  public getStatMultipliers(characterId: string): TransformationConfig['statMultipliers'] {
    const config = this.getCurrentTransformation(characterId);
    return config?.statMultipliers || { power: 1.0, speed: 1.0, defense: 1.0, gravity: 9.8 };
  }

  /**
   * Get available abilities for current transformation
   */
  public getAvailableAbilities(characterId: string): string[] {
    const config = this.getCurrentTransformation(characterId);
    return config?.abilities || [];
  }

  /**
   * Create transformation aura particles
   */
  public createAuraEffect(
    scene: THREE.Scene,
    characterId: string,
    characterMesh: THREE.Object3D
  ): void {
    const config = this.getCurrentTransformation(characterId);
    if (!config || config.visualConfig.particleCount === 0) return;

    // Remove existing aura
    this.removeAuraEffect(scene, characterId);

    const { particleColor, particleCount, auraIntensity, auraColor } = config.visualConfig;

    // Create particle geometry
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const color = new THREE.Color(particleColor);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // Spiral pattern around character
      const angle = (i / particleCount) * Math.PI * 8;
      const radius = 0.5 + Math.random() * 1.5;
      const height = (Math.random() - 0.5) * 4;

      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = height;
      positions[i3 + 2] = Math.sin(angle) * radius;

      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      sizes[i] = Math.random() * 0.2 + 0.05;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Create particle material
    const material = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: auraIntensity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    particles.position.copy(characterMesh.position);
    scene.add(particles);
    this.auraParticles.set(characterId, particles);

    // Create aura light
    const auraLight = new THREE.PointLight(auraColor, auraIntensity * 2, 10);
    auraLight.position.copy(characterMesh.position);
    auraLight.position.y += 1;
    scene.add(auraLight);
    this.auraLights.set(characterId, auraLight);
  }

  /**
   * Update aura particle positions (call in game loop)
   */
  public updateAuraEffects(deltaTime: number, time: number): void {
    this.auraParticles.forEach((particles, characterId) => {
      const positions = particles.geometry.attributes.position as THREE.BufferAttribute;
      const count = positions.count;

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        // Spiral upward motion
        const angle = time * 2 + (i / count) * Math.PI * 8;
        const radius = 0.5 + Math.sin(time + i) * 0.5;
        
        positions.array[i3] = Math.cos(angle) * radius;
        positions.array[i3 + 1] += deltaTime * 2;
        positions.array[i3 + 2] = Math.sin(angle) * radius;

        // Reset particles that go too high
        if (positions.array[i3 + 1] > 3) {
          positions.array[i3 + 1] = -2;
        }
      }

      positions.needsUpdate = true;

      // Pulse aura light
      const light = this.auraLights.get(characterId);
      if (light) {
        light.intensity = 1 + Math.sin(time * 4) * 0.5;
      }
    });
  }

  /**
   * Remove aura effect for a character
   */
  public removeAuraEffect(scene: THREE.Scene, characterId: string): void {
    const particles = this.auraParticles.get(characterId);
    if (particles) {
      scene.remove(particles);
      particles.geometry.dispose();
      (particles.material as THREE.Material).dispose();
      this.auraParticles.delete(characterId);
    }

    const light = this.auraLights.get(characterId);
    if (light) {
      scene.remove(light);
      this.auraLights.delete(characterId);
    }
  }

  /**
   * Check if character can transform to a specific tier
   */
  public canTransform(characterId: string, targetTier: TransformationTier, resonance: number): boolean {
    const configs = TRANSFORMATION_CONFIGS[characterId];
    if (!configs) return false;

    const targetConfig = configs.find(c => c.tier === targetTier);
    if (!targetConfig) return false;

    return resonance >= targetConfig.resonanceThreshold;
  }

  /**
   * Get transformation tier name
   */
  public static getTierName(tier: TransformationTier): string {
    switch (tier) {
      case TransformationTier.BASE: return 'BASE';
      case TransformationTier.AWAKENED: return 'AWAKENED';
      case TransformationTier.SAGE: return 'SAGE MODE';
      case TransformationTier.LEGENDARY: return 'LEGENDARY';
      case TransformationTier.GOD: return 'GOD FORM';
      default: return 'UNKNOWN';
    }
  }

  /**
   * Cleanup
   */
  public dispose(): void {
    this.auraParticles.forEach((particles, _) => {
      particles.geometry.dispose();
      (particles.material as THREE.Material).dispose();
    });
    this.auraParticles.clear();
    this.auraLights.clear();
    this.currentTransformations.clear();
    this.transformationProgress.clear();
  }
}

export default TransformationSystem;

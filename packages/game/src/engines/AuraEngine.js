/**
 * PROJECT OMEGA: VFX & AURA ENGINE (V2.0)
 *
 * Handles all visual effects, particle systems, dread-based screen distortion,
 * and character aura rendering. Integrates with Three.js for 3D layers and
 * canvas for 2D overlays.
 * 
 * AETERNA COVENANT V1.3 UPDATE:
 * - Anxious Attachment Logic: Dread increases when enemies are close
 * - EventBus Integration: Emits VFX_GLITCH_INTENSE at 80%+ Dread
 * - Proximity-based dread calculation (within 200 units = stress)
 */

export class AuraEngine {
  constructor(scene, camera, renderer, eventBus = null) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.eventBus = eventBus; // EventBus integration for AETERNA COVENANT

    // Effect pools
    this.particleSystems = [];
    this.activeAuras = [];
    this.screenEffects = [];

    // Dread-based effects (ANXIOUS ATTACHMENT LOGIC)
    this.dreadLevel = 0;
    this.dreadThreshold = 80; // Triggers intense glitch at 80%+
    this.dreadIncreaseRate = 2.5; // Per frame when enemies are close
    this.dreadDecreaseRate = 1.0; // Per frame when safe
    this.proximityThreshold = 200; // Distance in units for enemy proximity
    this.screenShakeIntensity = 0;
    this.chromaticAberration = 0;
    this.foVMultiplier = 1.0;

    // Color grading
    this.baseColorGrade = { r: 1.0, g: 1.0, b: 1.0 };
    this.currentColorGrade = { ...this.baseColorGrade };
  }

  /**
   * Update all visual effects based on game state
   * 
   * AETERNA COVENANT V1.3: Anxious Attachment Logic
   * - Dread increases when enemies are within proximityThreshold (200 units)
   * - Dread decreases when enemies are far away (safe)
   * - Emits VFX_GLITCH_INTENSE at 80%+ Dread
   * 
   * @param {number} enemyProximity - Distance to nearest enemy (null if none)
   * @param {Object} cameraTarget - Camera focus point
   * @param {number} deltaTime - Frame delta
   */
  update(enemyProximity, cameraTarget, deltaTime) {
    // ANXIOUS ATTACHMENT: Calculate dread based on enemy proximity
    if (enemyProximity !== null && enemyProximity < this.proximityThreshold) {
      // Enemies are close - increase dread
      this.dreadLevel = Math.min(100, this.dreadLevel + this.dreadIncreaseRate);
    } else {
      // Enemies are far or absent - decrease dread
      this.dreadLevel = Math.max(0, this.dreadLevel - this.dreadDecreaseRate);
    }

    // Emit EventBus event if dread exceeds threshold
    if (this.dreadLevel >= this.dreadThreshold && this.eventBus) {
      this.eventBus.emit('VFX_GLITCH_INTENSE', { 
        dreadLevel: this.dreadLevel,
        intensity: (this.dreadLevel - this.dreadThreshold) / (100 - this.dreadThreshold)
      });
    }

    // Emit dread update event
    if (this.eventBus) {
      this.eventBus.emit('dread:update', { 
        intensity: this.dreadLevel / 100,
        level: this.dreadLevel
      });
    }

    // Update screen effects based on dread
    this.updateScreenEffects();

    // Update all particle systems
    this.particleSystems = this.particleSystems.filter(system => {
      system.update(deltaTime);
      return !system.isDead();
    });

    // Update active auras
    this.activeAuras = this.activeAuras.filter(aura => {
      aura.update(deltaTime);
      return !aura.isExpired();
    });

    // Apply color grading
    this.applyColorGrading();
  }

  /**
   * Create a static decay effect (temporal glitching void)
   * Used for invincibility frames, phase-step effects
   *
   * @param {Object} entity - Entity to apply effect to
   * @param {number} intensity - Effect intensity (0-1)
   * @param {number} duration - Duration in ms
   */
  applyStaticDecay(entity, intensity, duration) {
    const material = entity.material;
    if (!material) return;

    // Store original material properties
    const originalEmissive = material.emissive.clone();
    const originalOpacity = material.opacity;

    // Create flickering effect
    const startTime = Date.now();
    const updateMaterial = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;

      if (progress >= 1) {
        material.emissive.copy(originalEmissive);
        material.opacity = originalOpacity;
        return;
      }

      // Pixelated glitching void aesthetic
      const flicker = Math.sin(elapsed * 0.02) * 0.5 + 0.5;
      material.emissive.multiplyScalar(flicker * intensity);
      material.opacity = originalOpacity * (1 - flicker * intensity);

      requestAnimationFrame(updateMaterial);
    };

    updateMaterial();
  }

  /**
   * Update screen effects based on dread level
   * - Low (0-33%): Clear, Cyan tint
   * - Medium (33-66%): Red tint, chromatic aberration begins
   * - High (66-100%): Severe vignette, extreme distortion, sound warping
   */
  updateScreenEffects() {
    const dreadPercent = this.dreadLevel / 100;

    // Screen shake intensity
    this.screenShakeIntensity = dreadPercent * 5; // Max 5 pixels

    // Chromatic aberration (red/cyan fringing)
    this.chromaticAberration = Math.max(0, dreadPercent - 0.33) * 2;

    // Field of View adjustment (creates tunnel vision at high dread)
    this.foVMultiplier = 1 - (dreadPercent * 0.2); // Min 0.8x FOV

    // Color grading shifts toward red as dread increases
    this.currentColorGrade.r = 1.0 + (dreadPercent * 0.3);
    this.currentColorGrade.g = 1.0 - (dreadPercent * 0.15);
    this.currentColorGrade.b = 1.0 - (dreadPercent * 0.15);

    // Apply radial vignette
    if (dreadPercent > 0.66) {
      this.applyVignette(dreadPercent);
    }
  }

  /**
   * Apply radial vignette effect (darkness at screen edges)
   * @param {number} intensity - Vignette intensity (0-1)
   */
  applyVignette(intensity) {
    // This would be rendered via a post-processing pass
    // Using Three.js EffectComposer + VignettePass
    const vignetteShader = {
      uniforms: {
        tDiffuse: { value: null },
        vignetteIntensity: { value: intensity },
        color: { value: { x: 0, y: 0, z: 0 } }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float vignetteIntensity;
        varying vec2 vUv;
        void main() {
          vec3 color = texture2D(tDiffuse, vUv).rgb;
          float vignette = smoothstep(0.0, 1.0, 1.0 - length(vUv - 0.5) * 2.0);
          color *= mix(1.0, vignette, vignetteIntensity);
          gl_FragColor = vec4(color, 1.0);
        }
      `
    };

    return vignetteShader;
  }

  /**
   * Create character aura (resonance visualization)
   * @param {Object} character - Character object
   * @param {number} resonanceLevel - Resonance level (0-100)
   */
  createAura(character, resonanceLevel) {
    const auraColor = resonanceLevel > 80 ? 0x00ffff : 0xff0066; // Cyan or Magenta
    const auraGeometry = new THREE.IcosahedronGeometry(character.scale + 0.5, 8);
    const auraMaterial = new THREE.MeshStandardMaterial({
      color: auraColor,
      emissive: auraColor,
      transparent: true,
      opacity: resonanceLevel / 100 * 0.5,
      wireframe: false
    });

    const auraMesh = new THREE.Mesh(auraGeometry, auraMaterial);
    auraMesh.position.copy(character.position);
    auraMesh.scale.setScalar(1.05);

    const aura = {
      mesh: auraMesh,
      character: character,
      resonance: resonanceLevel,
      age: 0,
      maxAge: 2000, // 2 second duration
      update(dt) {
        this.age += dt;
        // Pulsing effect
        const pulse = Math.sin(this.age * 0.005) * 0.3 + 0.7;
        auraMesh.scale.setScalar(1.05 * pulse);
        auraMesh.position.copy(character.position);
      },
      isExpired() {
        return this.age > this.maxAge;
      }
    };

    this.activeAuras.push(aura);
    this.scene.add(auraMesh);
    return aura;
  }

  /**
   * Create impact particle burst (hit confirmation visual)
   * @param {Object} hitPosition - { x, y, z }
   * @param {string} hitType - 'normal', 'crit', 'void'
   */
  createImpactBurst(hitPosition, hitType = 'normal') {
    const particleCount = 12;
    const particles = [];

    const colors = {
      normal: 0xffffff,
      crit: 0xffff00,
      void: 0x333333
    };

    const color = colors[hitType] || colors.normal;

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const velocity = {
        x: Math.cos(angle) * 0.1,
        y: Math.sin(angle) * 0.1,
        z: Math.random() * 0.05
      };

      const particle = {
        position: { ...hitPosition },
        velocity: velocity,
        age: 0,
        maxAge: 600,
        color: color,
        update(dt) {
          this.age += dt;
          this.position.x += this.velocity.x;
          this.position.y += this.velocity.y;
          this.position.z += this.velocity.z;
          // Gravity
          this.velocity.y -= 0.01;
        },
        isDead() {
          return this.age > this.maxAge;
        }
      };

      particles.push(particle);
    }

    const system = {
      particles: particles,
      update(dt) {
        this.particles.forEach(p => p.update(dt));
      },
      isDead() {
        return this.particles.every(p => p.isDead());
      }
    };

    this.particleSystems.push(system);
    return system;
  }

  /**
   * Apply post-processing color grading
   */
  applyColorGrading() {
    // This applies the color shift toward red at high dread
    // Implementation would use Three.js post-processing
    // For now, return the color transform matrix
    return {
      r: this.currentColorGrade.r,
      g: this.currentColorGrade.g,
      b: this.currentColorGrade.b
    };
  }

  /**
   * Screen shake effect (called on major hits)
   * @param {number} magnitude - Shake magnitude
   * @param {number} duration - Duration in ms
   */
  screenShake(magnitude, duration) {
    const startTime = Date.now();
    const originalPosition = this.camera.position.clone();

    const shake = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > duration) {
        this.camera.position.copy(originalPosition);
        return;
      }

      const progress = elapsed / duration;
      const shakeAmount = magnitude * (1 - progress);

      this.camera.position.x = originalPosition.x + (Math.random() - 0.5) * shakeAmount;
      this.camera.position.y = originalPosition.y + (Math.random() - 0.5) * shakeAmount;

      requestAnimationFrame(shake);
    };

    shake();
  }

  /**
   * Cleanup and disposal
   */
  dispose() {
    this.particleSystems = [];
    this.activeAuras.forEach(aura => {
      this.scene.remove(aura.mesh);
      aura.mesh.geometry.dispose();
      aura.mesh.material.dispose();
    });
    this.activeAuras = [];
  }
}

export default AuraEngine;

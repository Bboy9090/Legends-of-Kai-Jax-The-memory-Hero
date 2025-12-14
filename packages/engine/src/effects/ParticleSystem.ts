import { Vector2D } from '@smash-heroes/shared';
import { Vec2 } from '@smash-heroes/shared';

export interface Particle {
  position: Vector2D;
  velocity: Vector2D;
  lifetime: number;
  maxLifetime: number;
  size: number;
  color: string;
  alpha: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private maxParticles = 1000;

  emit(config: ParticleConfig): void {
    for (let i = 0; i < config.count; i++) {
      if (this.particles.length >= this.maxParticles) break;

      const angle = config.angle + (Math.random() - 0.5) * config.spread;
      const speed = config.speed + (Math.random() - 0.5) * config.speedVariation;
      
      const velocity = Vec2.rotate(
        { x: speed, y: 0 },
        angle
      );

      const particle: Particle = {
        position: { ...config.position },
        velocity,
        lifetime: 0,
        maxLifetime: config.lifetime,
        size: config.size + (Math.random() - 0.5) * config.sizeVariation,
        color: config.color,
        alpha: 1.0,
      };

      this.particles.push(particle);
    }
  }

  update(deltaTime: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      if (!particle) continue;
      
      // Update lifetime
      particle.lifetime += deltaTime;
      
      // Remove dead particles
      if (particle.lifetime >= particle.maxLifetime) {
        this.particles.splice(i, 1);
        continue;
      }

      // Update position
      particle.position = Vec2.add(particle.position, particle.velocity);
      
      // Update alpha (fade out)
      particle.alpha = 1 - (particle.lifetime / particle.maxLifetime);
    }
  }

  getParticles(): ReadonlyArray<Particle> {
    return this.particles;
  }

  clear(): void {
    this.particles = [];
  }
}

export interface ParticleConfig {
  position: Vector2D;
  count: number;
  angle: number;
  spread: number;
  speed: number;
  speedVariation: number;
  lifetime: number;
  size: number;
  sizeVariation: number;
  color: string;
}

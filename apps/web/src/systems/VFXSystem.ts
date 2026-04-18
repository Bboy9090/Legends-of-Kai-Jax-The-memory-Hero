/**
 * VFX System
 * Lightweight particle effects for combat feedback:
 *  - Hit sparks (radial burst)
 *  - Block rings (defensive flash)
 *  - Knockback dust (ground-level puff)
 *  - Attack trails (brief motion streak on active frames)
 *  - Boss phase flash (screen-wide tint)
 */

import * as THREE from 'three';

interface Particle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;        // seconds remaining
  maxLife: number;
  gravity: number;
  fadeColor: boolean;
}

export class VFXSystem {
  private scene: THREE.Scene;
  private particles: Particle[] = [];
  private sharedSparkGeo: THREE.SphereGeometry;
  private sharedDustGeo: THREE.PlaneGeometry;
  private sharedRingGeo: THREE.RingGeometry;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.sharedSparkGeo = new THREE.SphereGeometry(0.08, 6, 6);
    this.sharedDustGeo = new THREE.PlaneGeometry(0.3, 0.3);
    this.sharedRingGeo = new THREE.RingGeometry(0.3, 0.55, 16);
  }

  /**
   * Hit spark — radial burst of small spheres at collision point.
   */
  spawnHitSpark(x: number, y: number, z: number, color: number = 0xffee55, count: number = 12): void {
    for (let i = 0; i < count; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 1.0,
      });
      const mesh = new THREE.Mesh(this.sharedSparkGeo, mat);
      mesh.position.set(x, y, z);
      this.scene.add(mesh);

      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
      const speed = 3 + Math.random() * 4;
      const vy = (Math.random() - 0.3) * 4;

      this.particles.push({
        mesh,
        velocity: new THREE.Vector3(
          Math.cos(angle) * speed,
          vy,
          Math.sin(angle) * speed * 0.3
        ),
        life: 0.35 + Math.random() * 0.2,
        maxLife: 0.55,
        gravity: 6,
        fadeColor: true,
      });
    }
  }

  /**
   * Block ring — expanding cyan ring at block point.
   */
  spawnBlockRing(x: number, y: number, z: number): void {
    const mat = new THREE.MeshBasicMaterial({
      color: 0x00ddff,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(this.sharedRingGeo, mat);
    mesh.position.set(x, y, z);
    mesh.rotation.x = Math.PI / 2;
    this.scene.add(mesh);

    this.particles.push({
      mesh,
      velocity: new THREE.Vector3(0, 0, 0),
      life: 0.3,
      maxLife: 0.3,
      gravity: 0,
      fadeColor: true,
    });

    // Ring grows via scale animation on the shared mesh (handled in update)
    (mesh as unknown as { __expand: boolean }).__expand = true;
  }

  /**
   * Knockback dust — ground-level puff particles.
   */
  spawnKnockbackDust(x: number, z: number, count: number = 6): void {
    for (let i = 0; i < count; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0xaa9977,
        transparent: true,
        opacity: 0.7,
      });
      const mesh = new THREE.Mesh(this.sharedDustGeo, mat);
      mesh.position.set(x + (Math.random() - 0.5) * 0.6, 0.05, z + (Math.random() - 0.5) * 0.6);
      mesh.rotation.x = -Math.PI / 2;
      this.scene.add(mesh);

      const angle = Math.random() * Math.PI * 2;
      this.particles.push({
        mesh,
        velocity: new THREE.Vector3(
          Math.cos(angle) * 1.5,
          Math.random() * 1.2,
          Math.sin(angle) * 1.5
        ),
        life: 0.5 + Math.random() * 0.3,
        maxLife: 0.8,
        gravity: 2,
        fadeColor: true,
      });
    }
  }

  /**
   * Attack trail — brief colored bar at hitbox location (non-destructive visual).
   */
  spawnTrail(x: number, y: number, z: number, color: number = 0xff66ff): void {
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.55 });
    const geo = new THREE.BoxGeometry(0.6, 0.15, 0.15);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    this.scene.add(mesh);

    this.particles.push({
      mesh,
      velocity: new THREE.Vector3(0, 0, 0),
      life: 0.12,
      maxLife: 0.12,
      gravity: 0,
      fadeColor: true,
    });
  }

  /**
   * Phase transition flash — brief colored overlay mesh in front of camera.
   */
  spawnPhaseFlash(camera: THREE.Camera, color: number): void {
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5, depthTest: false });
    const geo = new THREE.PlaneGeometry(50, 30);
    const mesh = new THREE.Mesh(geo, mat);

    // Place just in front of the camera
    mesh.position.copy(camera.position);
    mesh.quaternion.copy(camera.quaternion);
    mesh.translateZ(-2);
    this.scene.add(mesh);

    this.particles.push({
      mesh,
      velocity: new THREE.Vector3(0, 0, 0),
      life: 0.4,
      maxLife: 0.4,
      gravity: 0,
      fadeColor: true,
    });
  }

  /**
   * Update all particles each frame.
   */
  update(deltaTime: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= deltaTime;

      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        (p.mesh.material as THREE.Material).dispose();
        this.particles.splice(i, 1);
        continue;
      }

      // Integrate velocity
      p.velocity.y -= p.gravity * deltaTime;
      p.mesh.position.x += p.velocity.x * deltaTime;
      p.mesh.position.y += p.velocity.y * deltaTime;
      p.mesh.position.z += p.velocity.z * deltaTime;

      // Fade opacity
      if (p.fadeColor) {
        const mat = p.mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.max(0, p.life / p.maxLife);
      }

      // Ring expand
      if ((p.mesh as unknown as { __expand?: boolean }).__expand) {
        const t = 1 - (p.life / p.maxLife);
        const s = 1 + t * 2.5;
        p.mesh.scale.set(s, s, s);
      }
    }
  }

  /**
   * Get live particle count (for debugging).
   */
  getCount(): number {
    return this.particles.length;
  }

  /**
   * Clear all particles.
   */
  clear(): void {
    for (const p of this.particles) {
      this.scene.remove(p.mesh);
      (p.mesh.material as THREE.Material).dispose();
    }
    this.particles = [];
  }
}

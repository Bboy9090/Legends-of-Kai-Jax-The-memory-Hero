/**
 * Hurtbox System
 * Authoritative implementation from combat kernel spec
 */

import * as THREE from 'three';

export class Hurtbox {
  mesh: THREE.Mesh;
  health: number = 100;
  maxHealth: number = 100;

  constructor(scene: THREE.Scene, width: number, height: number) {
    const geo = new THREE.BoxGeometry(width, height, 1);
    const mat = new THREE.MeshBasicMaterial({ 
      wireframe: true, 
      color: 0x00ff00,
      transparent: true,
      opacity: 0.5
    });
    this.mesh = new THREE.Mesh(geo, mat);
    scene.add(this.mesh);
  }

  setPosition(x: number, y: number, z: number = 0) {
    this.mesh.position.set(x, y, z);
  }

  takeDamage(dmg: number): void {
    this.health -= dmg;
    console.log(`[Hurtbox] Took ${dmg} damage. HP: ${this.health}/${this.maxHealth}`);
    
    // Visual feedback: flash red on damage
    const mat = this.mesh.material as THREE.MeshBasicMaterial;
    mat.color.setHex(0xff0000);
    setTimeout(() => {
      mat.color.setHex(0x00ff00);
    }, 100);
  }

  getHealth(): number {
    return this.health;
  }

  isDead(): boolean {
    return this.health <= 0;
  }

  destroy(scene: THREE.Scene): void {
    scene.remove(this.mesh);
  }
}

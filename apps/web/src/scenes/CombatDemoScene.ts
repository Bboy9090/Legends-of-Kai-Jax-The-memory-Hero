/**
 * Combat Demo Scene
 * Proves first real combat exchange: attack → hit → damage → knockback → hitstop
 */

import * as THREE from 'three';
import { Hurtbox } from '../combat/Hurtbox';
import { MovePlayer } from '../combat/MovePlayer';
import type { MoveSpec } from '../types/MoveSpec';

export class CombatDemoScene {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private movePlayer: MovePlayer;
  private hurtbox: Hurtbox;
  private fighterMesh: THREE.Mesh;
  private kaiMoves: MoveSpec[] = [];
  private animationId: number | null = null;
  private frameCount: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      75,
      canvas.width / canvas.height,
      0.1,
      1000
    );
    this.camera.position.set(0, 2, 8);
    this.camera.lookAt(0, 1, 0);

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(canvas.width, canvas.height);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    this.scene.add(directionalLight);

    // Ground plane
    const groundGeo = new THREE.PlaneGeometry(20, 20);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x2a2a4e });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    this.scene.add(ground);

    // Fighter placeholder (attacker)
    const fighterGeo = new THREE.BoxGeometry(0.8, 1.8, 0.5);
    const fighterMat = new THREE.MeshStandardMaterial({ color: 0x00d9ff });
    this.fighterMesh = new THREE.Mesh(fighterGeo, fighterMat);
    this.fighterMesh.position.set(-2, 0.9, 0);
    this.scene.add(this.fighterMesh);

    // Hurtbox (defender)
    this.hurtbox = new Hurtbox(this.scene, 0.8, 1.6);
    this.hurtbox.setPosition(2, 0.8, 0);

    // MovePlayer
    this.movePlayer = new MovePlayer(
      this.scene,
      this.hurtbox,
      this.fighterMesh.position
    );

    // Load moves
    this.loadMoves();

    // Input handling
    this.setupInput();

    console.log('=== COMBAT DEMO SCENE INITIALIZED ===');
    console.log('Controls:');
    console.log('  J - Execute kai_light_jab');
    console.log('  S - Toggle shield');
    console.log('  ESC - Stop demo');
  }

  private async loadMoves(): Promise<void> {
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}moves/kai_light_jab.json`);
      const move: MoveSpec = await response.json();
      this.kaiMoves.push(move);
      console.log(`[CombatDemo] Loaded move: ${move.id}`);
    } catch (error) {
      console.error('[CombatDemo] Failed to load moves:', error);
    }
  }

  private setupInput(): void {
    window.addEventListener('keydown', (e) => {
      switch (e.key.toLowerCase()) {
        case 'j':
          if (!this.movePlayer.isBusy()) {
            const jab = this.kaiMoves.find((m) => m.id === 'kai_light_jab');
            if (jab) {
              console.log('\n[Input] J pressed - Executing kai_light_jab');
              this.movePlayer.startMove(jab);
            }
          } else {
            console.log('[Input] J pressed - Fighter busy, cannot attack');
          }
          break;

        case 's':
          const shieldState = !this.movePlayer['shieldActive'];
          this.movePlayer.setShield(shieldState);
          console.log(`[Input] S pressed - Shield ${shieldState ? 'ON' : 'OFF'}`);
          break;

        case 'escape':
          this.stop();
          break;
      }
    });
  }

  public start(): void {
    console.log('\n=== COMBAT DEMO STARTED ===');
    this.animate();
  }

  public stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
      console.log('=== COMBAT DEMO STOPPED ===');
    }
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);

    this.frameCount++;

    // Update combat system
    this.movePlayer.update();

    // Log status every 60 frames
    if (this.frameCount % 60 === 0) {
      console.log(`\n[Frame ${this.frameCount}] Status:`);
      console.log(`  Fighter busy: ${this.movePlayer.isBusy()}`);
      console.log(`  Hurtbox HP: ${this.hurtbox.getHealth()}/100`);
      console.log(`  Hurtbox position: (${this.hurtbox.mesh.position.x.toFixed(2)}, ${this.hurtbox.mesh.position.y.toFixed(2)})`);
    }

    // Check win/lose condition
    if (this.hurtbox.isDead()) {
      console.log('\n🎉 DEFENDER DEFEATED! Combat exchange successful!');
      this.stop();
      return;
    }

    // Render
    this.renderer.render(this.scene, this.camera);
  };

  public getStats(): {
    frameCount: number;
    hurtboxHP: number;
    fighterBusy: boolean;
  } {
    return {
      frameCount: this.frameCount,
      hurtboxHP: this.hurtbox.getHealth(),
      fighterBusy: this.movePlayer.isBusy(),
    };
  }
}

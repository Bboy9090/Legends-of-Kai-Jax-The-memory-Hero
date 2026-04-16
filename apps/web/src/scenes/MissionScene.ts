/**
 * Mission Scene
 * Complete playable mission slice: waves → boss → win/lose
 */

import * as THREE from 'three';
import { Hurtbox } from '../combat/Hurtbox';
import { MovePlayer } from '../combat/MovePlayer';
import { EnemyEntity } from '../entities/EnemyEntity';
import { BossEntity } from '../entities/BossEntity';
import { MissionOrchestrator } from '../mission/MissionOrchestrator';
import { PlayerController } from '../player/PlayerController';
import { IRONVEIN_WARD_01 } from '../mission/MissionSchema';
import type { MoveSpec } from '../types/MoveSpec';
import type { AITarget } from '../ai/SimpleAI';

export class MissionScene {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private mission: MissionOrchestrator;
  
  // Player
  private playerMesh: THREE.Mesh;
  private playerHurtbox: Hurtbox;
  private playerMovePlayer: MovePlayer;
  private playerController: PlayerController;
  private playerHP: number = 100;
  private playerMoves: MoveSpec[] = [];
  
  // Enemies
  private enemies: Map<string, EnemyEntity> = new Map();
  private boss: BossEntity | null = null;
  
  // State
  private animationId: number | null = null;
  private frameCount: number = 0;
  private missionStarted: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);

    // Camera
    this.camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
    this.camera.position.set(0, 5, 12);
    this.camera.lookAt(0, 1, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(canvas.width, canvas.height);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    this.scene.add(directionalLight);

    // Arena ground
    const groundGeo = new THREE.PlaneGeometry(30, 20);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x2a2a4e });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    this.scene.add(ground);

    // Arena walls (visual only)
    this.createArenaWalls();

    // Player setup
    this.setupPlayer();

    // Mission orchestrator
    this.mission = new MissionOrchestrator(this.scene, IRONVEIN_WARD_01);

    // Input
    this.setupInput();

    // Load moves
    this.loadMoves();

    console.log('=== MISSION SCENE INITIALIZED ===');
    console.log('Mission:', IRONVEIN_WARD_01.name);
    console.log('\nControls:');
    console.log('  WASD - Move player');
    console.log('  J - Light jab (4 dmg)');
    console.log('  K - Heavy punch (12 dmg)');
    console.log('  L - Uppercut (10 dmg, launches)');
    console.log('  I - Sweep (6 dmg, low)');
    console.log('  U - Grab (8 dmg, breaks shield)');
    console.log('  O - Combo chain (3-hit: 3+4+6 dmg)');
    console.log('  SHIFT - Hold to shield');
    console.log('  SPACE - Start mission');
    console.log('  ESC - Exit');
  }

  private createArenaWalls(): void {
    const wallMat = new THREE.MeshStandardMaterial({ 
      color: 0x3a3a5e,
      transparent: true,
      opacity: 0.3
    });

    // Left/right walls
    const sideGeo = new THREE.BoxGeometry(1, 4, 20);
    const leftWall = new THREE.Mesh(sideGeo, wallMat);
    leftWall.position.set(-15, 2, 0);
    this.scene.add(leftWall);

    const rightWall = new THREE.Mesh(sideGeo, wallMat);
    rightWall.position.set(15, 2, 0);
    this.scene.add(rightWall);

    // Front/back walls
    const endGeo = new THREE.BoxGeometry(30, 4, 1);
    const frontWall = new THREE.Mesh(endGeo, wallMat);
    frontWall.position.set(0, 2, -10);
    this.scene.add(frontWall);

    const backWall = new THREE.Mesh(endGeo, wallMat);
    backWall.position.set(0, 2, 10);
    this.scene.add(backWall);
  }

  private setupPlayer(): void {
    // Visual mesh
    const playerGeo = new THREE.BoxGeometry(0.8, 1.8, 0.5);
    const playerMat = new THREE.MeshStandardMaterial({ color: 0x00d9ff });
    this.playerMesh = new THREE.Mesh(playerGeo, playerMat);
    this.playerMesh.position.set(0, 0.9, 0);
    this.scene.add(this.playerMesh);

    // Hurtbox
    this.playerHurtbox = new Hurtbox(this.scene, 0.8, 1.6);
    this.playerHurtbox.setPosition(0, 0.8, 0);
    this.playerHurtbox.health = 100;

    // MovePlayer
    this.playerMovePlayer = new MovePlayer(
      this.scene,
      this.playerHurtbox,
      this.playerMesh.position
    );

    // PlayerController for movement
    this.playerController = new PlayerController(this.playerMesh.position);
    this.playerController.setBoundaries(-14, 14, -9, 9);
  }

  private async loadMoves(): Promise<void> {
    try {
      // Load all player moves
      const moveIds = [
        'kai_light_jab', 
        'kai_heavy_punch', 
        'kai_uppercut', 
        'kai_sweep', 
        'kai_grab',
        'kai_combo_chain'
      ];
      
      for (const moveId of moveIds) {
        const response = await fetch(`/moves/${moveId}.json`);
        const move: MoveSpec = await response.json();
        this.playerMoves.push(move);
        console.log(`[Mission] Loaded player move: ${moveId}`);
      }
    } catch (error) {
      console.error('[Mission] Failed to load moves:', error);
    }
  }

  private setupInput(): void {
    window.addEventListener('keydown', (e) => {
      switch (e.key.toLowerCase()) {
        case 'j':
          // Light jab (index 0)
          if (!this.playerMovePlayer.isBusy() && this.playerMoves.length > 0) {
            this.playerMovePlayer.startMove(this.playerMoves[0]);
            console.log('[Player] Light jab!');
          }
          break;

        case 'k':
          // Heavy punch (index 1)
          if (!this.playerMovePlayer.isBusy() && this.playerMoves.length > 1) {
            this.playerMovePlayer.startMove(this.playerMoves[1]);
            console.log('[Player] Heavy punch!');
          }
          break;

        case 'l':
          // Uppercut (index 2)
          if (!this.playerMovePlayer.isBusy() && this.playerMoves.length > 2) {
            this.playerMovePlayer.startMove(this.playerMoves[2]);
            console.log('[Player] Uppercut!');
          }
          break;

        case 'i':
          // Sweep (index 3)
          if (!this.playerMovePlayer.isBusy() && this.playerMoves.length > 3) {
            this.playerMovePlayer.startMove(this.playerMoves[3]);
            console.log('[Player] Sweep!');
          }
          break;

        case 'u':
          // Grab (index 4)
          if (!this.playerMovePlayer.isBusy() && this.playerMoves.length > 4) {
            this.playerMovePlayer.startMove(this.playerMoves[4]);
            console.log('[Player] Grab attempt!');
          }
          break;

        case 'o':
          // Combo chain (index 5)
          if (!this.playerMovePlayer.isBusy() && this.playerMoves.length > 5) {
            this.playerMovePlayer.startMove(this.playerMoves[5]);
            console.log('[Player] 3-hit combo chain!');
          }
          break;

        case 'shift':
          // Hold Shift to shield
          this.playerMovePlayer.setShield(true);
          break;

        case ' ':
          if (!this.missionStarted) {
            this.startMission();
          }
          break;

        case 'escape':
          this.stop();
          break;
      }
    });

    // Release shield on keyup
    window.addEventListener('keyup', (e) => {
      if (e.key.toLowerCase() === 'shift') {
        this.playerMovePlayer.setShield(false);
      }
    });
  }

  private startMission(): void {
    if (this.missionStarted) return;

    console.log('\n=== STARTING MISSION ===');
    this.missionStarted = true;
    this.mission.start();

    // Spawn initial wave
    this.spawnWaveEnemies();
  }

  private async spawnWaveEnemies(): Promise<void> {
    const waveDirector = this.mission.getWaveDirector();
    const enemies = waveDirector.getActiveEnemies();

    for (const enemyData of enemies) {
      // Boss routing
      if (enemyData.isBoss) {
        if (this.boss) continue; // already spawned
        const boss = new BossEntity(
          this.scene,
          enemyData.id,
          enemyData.x,
          0.8,
          enemyData.hp
        );
        // Load multiple moves for the boss (light, heavy, combo as special)
        await boss.loadMove('kai_light_jab');
        await boss.loadMove('kai_heavy_punch');
        await boss.loadMove('kai_combo_chain');
        boss.setTarget({
          position: this.playerMesh.position,
          isAlive: () => this.playerHP > 0,
        });
        this.boss = boss;
        console.log(`[Mission] BossEntity spawned: ${enemyData.id}`);
        continue;
      }

      if (this.enemies.has(enemyData.id)) continue;

      const enemy = new EnemyEntity(
        this.scene,
        enemyData.id,
        enemyData.x,
        0.8,
        enemyData.hp,
        0xff5555
      );

      // Load AI move
      await enemy.loadMove('kai_light_jab'); // Reuse player move for now

      // Set player as target
      enemy.setTarget({
        position: this.playerMesh.position,
        isAlive: () => this.playerHP > 0
      });

      this.enemies.set(enemyData.id, enemy);
    }
  }

  public start(): void {
    console.log('\n=== MISSION SCENE STARTED ===');
    console.log('Press SPACE to begin mission');
    this.animate();
  }

  public stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
      this.mission.stop();
      console.log('=== MISSION SCENE STOPPED ===');
    }
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);
    this.frameCount++;

    const deltaTime = 1 / 60;

    // Update player movement
    this.playerController.update(deltaTime);

    // Sync player mesh and hurtbox with controller position
    const playerPos = this.playerController.getPosition();
    this.playerMesh.position.copy(playerPos);
    this.playerHurtbox.setPosition(playerPos.x, playerPos.y - 0.1, playerPos.z);

    // Update player facing direction based on movement
    if (this.playerController.isMoving()) {
      const moveDir = this.playerController.getMovementDirection();
      if (Math.abs(moveDir.x) > 0.1) {
        this.playerMovePlayer.setFacing(moveDir.x > 0);
      }
    }

    // Update player combat
    this.playerMovePlayer.update();

    // Update enemies
    this.enemies.forEach(enemy => enemy.update(deltaTime));

    // Update boss
    if (this.boss) {
      this.boss.update(deltaTime);
    }

    // Check player attacks vs enemies
    this.checkPlayerAttacks();

    // Check enemy attacks vs player
    this.checkEnemyAttacks();

    // Spawn new enemies if wave progressed
    if (this.missionStarted) {
      this.spawnWaveEnemies();
      this.cleanupDeadEnemies();
    }

    // Status logging
    if (this.frameCount % 120 === 0 && this.missionStarted) {
      const status = this.mission.getStatus();
      console.log(`\n[Frame ${this.frameCount}] Mission Status:`);
      console.log(`  State: ${status.state}`);
      console.log(`  Wave: ${status.wave}/${status.totalWaves}`);
      console.log(`  Kills: ${status.kills}`);
      console.log(`  Active enemies: ${status.enemiesActive}`);
      console.log(`  Player HP: ${this.playerHP}/100`);
    }

    // Check mission complete
    if (this.mission.getTracker().isComplete()) {
      console.log('\n🎉 MISSION COMPLETE!');
      this.stop();
      return;
    }

    // Render
    this.renderer.render(this.scene, this.camera);
  };

  private checkPlayerAttacks(): void {
    const playerHitboxes = this.playerMovePlayer['hitboxes'];
    if (playerHitboxes.length === 0) return;

    // Derive damage from current move's first hit (if any)
    const currentMove = this.playerMovePlayer.currentMove;
    const hitSpec = currentMove?.hits?.[0];
    const damage = hitSpec?.dmg ?? 4;
    const kb = new THREE.Vector2(hitSpec?.kbX ?? 1.5, hitSpec?.kbY ?? 0.5);

    this.enemies.forEach((enemy) => {
      if (enemy.isDefeated()) return;

      for (const hitbox of playerHitboxes) {
        const hitBB = new THREE.Box3().setFromObject(hitbox);
        const hurtBB = new THREE.Box3().setFromObject(enemy.hurtbox.mesh);

        if (hitBB.intersectsBox(hurtBB)) {
          // Apply damage using move data
          enemy.takeDamage(damage, kb);

          // Notify wave director if killed
          if (enemy.getHP() <= 0) {
            this.mission.getWaveDirector().damageEnemy(enemy.id, 9999);
          }
        }
      }
    });

    // Boss collision
    if (this.boss && !this.boss.isDefeated()) {
      for (const hitbox of playerHitboxes) {
        const hitBB = new THREE.Box3().setFromObject(hitbox);
        const hurtBB = new THREE.Box3().setFromObject(this.boss.hurtbox.mesh);
        if (hitBB.intersectsBox(hurtBB)) {
          this.boss.takeDamage(damage, kb);
          if (this.boss.getHP() <= 0) {
            this.mission.getWaveDirector().damageEnemy(this.boss.id, 9999);
          }
        }
      }
    }
  }

  private checkEnemyAttacks(): void {
    this.enemies.forEach((enemy) => {
      if (enemy.isDefeated()) return;

      if (enemy.checkAttackHit(this.playerHurtbox)) {
        this.playerHP = Math.max(0, this.playerHP - 4);
        console.log(`[Player] Took damage! HP: ${this.playerHP}/100`);

        if (this.playerHP <= 0) {
          console.log('[Player] DEFEATED');
          this.mission.getTracker().registerPlayerDead();
        }
      }
    });

    // Boss attacks (deal more damage)
    if (this.boss && !this.boss.isDefeated()) {
      if (this.boss.checkAttackHit(this.playerHurtbox)) {
        this.playerHP = Math.max(0, this.playerHP - 10);
        console.log(`[Player] Boss hit! HP: ${this.playerHP}/100 (Phase ${this.boss.getPhase()})`);
        if (this.playerHP <= 0) {
          console.log('[Player] DEFEATED by Boss');
          this.mission.getTracker().registerPlayerDead();
        }
      }
    }
  }

  private cleanupDeadEnemies(): void {
    const toRemove: string[] = [];

    this.enemies.forEach((enemy, id) => {
      if (enemy.isDefeated()) {
        toRemove.push(id);
      }
    });

    toRemove.forEach(id => this.enemies.delete(id));
  }

  public getStatus(): {
    frameCount: number;
    playerHP: number;
    enemyCount: number;
    missionStarted: boolean;
  } {
    return {
      frameCount: this.frameCount,
      playerHP: this.playerHP,
      enemyCount: this.enemies.size,
      missionStarted: this.missionStarted,
    };
  }
}

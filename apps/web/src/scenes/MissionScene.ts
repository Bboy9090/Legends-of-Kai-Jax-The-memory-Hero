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
import { IRONVEIN_WARD_01, MISSION_LIBRARY } from '../mission/MissionSchema';
import { CHARACTERS, type CharacterId } from '../characters/CharacterSpec';
import { loadCharacterRig, CHARACTER_GLB, type CharacterRig } from '../characters/GLBCharacterLoader';
import { VFXSystem } from '../systems/VFXSystem';
import { audioSystem } from '../systems/AudioSystem';
import { CameraShake } from '../systems/CameraShake';
import type { MoveSpec } from '../types/MoveSpec';
import type { AITarget, AIBehavior } from '../ai/SimpleAI';
import type { EnemyType } from '../mission/WaveDirector';
import type { MissionSchema } from '../mission/MissionSchema';

/**
 * Map enemy types → AI behavior flavor and visual color.
 */
const ENEMY_PROFILE: Record<EnemyType, { behavior: AIBehavior; color: number }> = {
  fang_grunt:       { behavior: 'grunt',    color: 0xff5555 },
  covenant_scout:   { behavior: 'rusher',   color: 0xff9944 },
  covenant_enforcer:{ behavior: 'grunt',    color: 0xff0000 }, // boss path handled separately
  fang_rusher:      { behavior: 'rusher',   color: 0xff3377 },
  null_defender:    { behavior: 'defender', color: 0x6699ff },
  covenant_sniper:  { behavior: 'sniper',   color: 0xcc44ff },
  fang_warlord:     { behavior: 'grunt',    color: 0xaa0000 }, // boss path handled separately
};

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
  private lastBossPhase: string = 'phase1';

  // Feel systems
  private vfx!: VFXSystem;
  private cameraShake: CameraShake = new CameraShake();

  // Selection
  private characterId: CharacterId = 'kai';
  private missionSchema: MissionSchema;
  
  // State
  private animationId: number | null = null;
  private frameCount: number = 0;
  private missionStarted: boolean = false;

  constructor(canvas: HTMLCanvasElement, options: { character?: CharacterId; missionId?: string } = {}) {
    this.characterId = options.character ?? this.readCharacterFromURL();
    const missionId = options.missionId ?? this.readMissionFromURL();
    this.missionSchema = MISSION_LIBRARY[missionId] ?? IRONVEIN_WARD_01;

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

    // Init feel systems (VFX + camera shake)
    this.vfx = new VFXSystem(this.scene);
    this.cameraShake.setBasePosition(this.camera.position);

    // Wire player combat feedback (VFX + audio)
    this.wirePlayerFeedback();

    // Mission orchestrator
    this.mission = new MissionOrchestrator(this.scene, this.missionSchema);

    // Input
    this.setupInput();

    // Load moves
    this.loadMoves();

    const spec = CHARACTERS[this.characterId];
    console.log('=== MISSION SCENE INITIALIZED ===');
    console.log(`Character: ${spec.name}`);
    console.log(`Mission: ${this.missionSchema.name}`);
    console.log('\nControls:');
    console.log('  WASD - Move player');
    spec.moveLabels.forEach((label, idx) => {
      const key = ['J', 'K', 'L', 'I', 'U', 'O'][idx] ?? '?';
      console.log(`  ${key} - ${label}`);
    });
    console.log('  SHIFT - Hold to shield');
    console.log('  SPACE - Start mission');
    console.log('  ESC - Exit');
  }

  private readCharacterFromURL(): CharacterId {
    if (typeof window === 'undefined') return 'kai';
    const params = new URLSearchParams(window.location.search);
    const c = params.get('character');
    return c === 'jax' ? 'jax' : 'kai';
  }

  private readMissionFromURL(): string {
    if (typeof window === 'undefined') return 'ironvein_ward_01';
    const params = new URLSearchParams(window.location.search);
    return params.get('mission') || 'ironvein_ward_01';
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
    const spec = CHARACTERS[this.characterId];
    // Visual mesh — placeholder box, will be replaced by GLB rig if available
    const playerGeo = new THREE.BoxGeometry(0.8, 1.8, 0.5);
    const playerMat = new THREE.MeshStandardMaterial({ color: spec.color });
    this.playerMesh = new THREE.Mesh(playerGeo, playerMat);
    this.playerMesh.position.set(0, 0.9, 0);
    this.scene.add(this.playerMesh);

    // Async load real GLB and swap visual on success
    this.loadPlayerGLB(spec.color);

    // Hurtbox
    this.playerHurtbox = new Hurtbox(this.scene, 0.8, 1.6);
    this.playerHurtbox.setPosition(0, 0.8, 0);
    this.playerHurtbox.health = spec.hp;
    this.playerHurtbox.maxHealth = spec.hp;
    this.playerHP = spec.hp;

    // MovePlayer
    this.playerMovePlayer = new MovePlayer(
      this.scene,
      this.playerHurtbox,
      this.playerMesh.position
    );

    // PlayerController for movement (character-specific speed)
    this.playerController = new PlayerController(this.playerMesh.position);
    this.playerController.setBoundaries(-14, 14, -9, 9);
    this.playerController.setMoveSpeed(spec.moveSpeed);
  }

  private async loadPlayerGLB(fallbackColor: number): Promise<void> {
    const base = import.meta.env.BASE_URL;
    const path = CHARACTER_GLB[this.characterId];
    if (!path) return;
    const rig = await loadCharacterRig(`${base}${path}`, {
      color: fallbackColor,
      targetHeight: 1.8,
      debug: true,
    });
    if (!rig.loaded) {
      console.warn('[MissionScene] GLB load failed, keeping box placeholder');
      return;
    }
    // Hide box, attach rig group at player position
    this.playerMesh.visible = false;
    rig.group.position.copy(this.playerMesh.position);
    rig.group.position.y = 0; // feet on ground
    this.scene.add(rig.group);
    this.playerRig = rig;
    console.log(`[MissionScene] Real GLB visual swapped in for ${this.characterId}`);
  }

  private async loadMoves(): Promise<void> {
    try {
      const spec = CHARACTERS[this.characterId];
      const base = import.meta.env.BASE_URL;
      for (const moveId of spec.moveIds) {
        const response = await fetch(`${base}moves/${moveId}.json`);
        const move: MoveSpec = await response.json();
        this.playerMoves.push(move);
        console.log(`[Mission] Loaded ${spec.id} move: ${moveId}`);
      }
    } catch (error) {
      console.error('[Mission] Failed to load moves:', error);
    }
  }

  /**
   * Register VFX + audio hooks for player's combat events.
   */
  private wirePlayerFeedback(): void {
    this.playerMovePlayer.setCallbacks({
      onMoveStart: (move) => {
        // Grab has its own sound; everything else gets a whoosh
        audioSystem.play(move.id.includes('grab') ? 'grab' : 'whoosh');
      },
      onActiveFrame: (_hit, pos) => {
        // Short trail at active hitbox position
        this.vfx.spawnTrail(pos.x, pos.y, pos.z, 0xff44aa);
      },
      onHit: (hit, pos) => {
        if (hit.isGrab) {
          this.vfx.spawnHitSpark(pos.x, pos.y, pos.z, 0xff66ff, 16);
          audioSystem.play('grab');
        } else {
          const heavy = hit.dmg >= 8;
          this.vfx.spawnHitSpark(pos.x, pos.y, pos.z, heavy ? 0xff8844 : 0xffee55, heavy ? 18 : 10);
          audioSystem.play(heavy ? 'hit_heavy' : 'hit_light');
          this.vfx.spawnKnockbackDust(pos.x, pos.z, heavy ? 8 : 4);
        }
        this.cameraShake.add(hit.dmg >= 8 ? 0.6 : 0.3);
      },
      onBlock: (_hit, pos) => {
        this.vfx.spawnBlockRing(pos.x, pos.y, pos.z);
        audioSystem.play('block');
        this.cameraShake.add(0.15);
      },
      onShieldBreak: (pos) => {
        this.vfx.spawnHitSpark(pos.x, pos.y, pos.z, 0x00ddff, 20);
        audioSystem.play('shield_break');
        this.cameraShake.add(0.5);
      },
    });
  }

  /**
   * Wire feedback for an enemy's MovePlayer (hit sparks when hitting the player).
   */
  private wireEnemyFeedback(mp: MovePlayer, enemyColor: number = 0xff5555): void {
    mp.setCallbacks({
      onMoveStart: () => audioSystem.play('whoosh'),
      onHit: (hit, pos) => {
        this.vfx.spawnHitSpark(pos.x, pos.y, pos.z, enemyColor, hit.dmg >= 8 ? 16 : 10);
        audioSystem.play(hit.dmg >= 8 ? 'hit_heavy' : 'hit_light');
        this.vfx.spawnKnockbackDust(pos.x, pos.z, 4);
        this.cameraShake.add(hit.dmg >= 8 ? 0.5 : 0.25);
      },
      onBlock: (_h, pos) => {
        this.vfx.spawnBlockRing(pos.x, pos.y, pos.z);
        audioSystem.play('block');
      },
    });
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
        this.lastBossPhase = 'phase1';
        // Boss entrance roar + phase flash
        audioSystem.play('boss_roar');
        this.vfx.spawnPhaseFlash(this.camera, 0xff0000);
        this.cameraShake.add(0.8);
        // Wire boss attack feedback
        this.wireEnemyFeedback(boss.getMovePlayer(), 0xff3333);
        console.log(`[Mission] BossEntity spawned: ${enemyData.id}`);
        continue;
      }

      if (this.enemies.has(enemyData.id)) continue;

      const profile = ENEMY_PROFILE[enemyData.type as EnemyType] ?? { behavior: 'grunt', color: 0xff5555 };
      const enemy = new EnemyEntity(
        this.scene,
        enemyData.id,
        enemyData.x,
        0.8,
        enemyData.hp,
        profile.color,
        profile.behavior
      );

      // Load AI move (sniper gets dash strike as ranged proxy)
      await enemy.loadMove(profile.behavior === 'sniper' ? 'jax_dash_strike' : 'kai_light_jab');

      // Set player as target
      enemy.setTarget({
        position: this.playerMesh.position,
        isAlive: () => this.playerHP > 0
      });

      this.enemies.set(enemyData.id, enemy);
      // Wire enemy-side feedback (hit sparks when they connect)
      this.wireEnemyFeedback(enemy.getMovePlayer(), profile.color);
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

    // Sync GLB rig (if loaded) — feet at ground, face along movement direction
    if (this.playerRig?.loaded) {
      this.playerRig.group.position.set(playerPos.x, 0, playerPos.z);
      if (this.playerController.isMoving()) {
        const md = this.playerController.getMovementDirection();
        if (Math.abs(md.x) > 0.1) {
          this.playerRig.group.rotation.y = md.x > 0 ? Math.PI / 2 : -Math.PI / 2;
        }
      }
    }

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

      // Phase transition detection — play zing + tint flash
      const currentPhase = this.boss.getPhase();
      if (currentPhase !== this.lastBossPhase) {
        const phaseColor = currentPhase === 'phase3' ? 0xffff00 : 0xff8800;
        this.vfx.spawnPhaseFlash(this.camera, phaseColor);
        audioSystem.play('phase_transition');
        this.cameraShake.add(0.6);
        console.log(`[Mission] Boss entered ${currentPhase}`);
        this.lastBossPhase = currentPhase;
      }
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

    // Update feel systems (VFX particles + camera shake)
    this.vfx.update(deltaTime);
    this.cameraShake.update(deltaTime, this.camera);

    // Status logging
    if (this.frameCount % 120 === 0 && this.missionStarted) {
      const status = this.mission.getStatus();
      console.log(`\n[Frame ${this.frameCount}] Mission Status:`);
      console.log(`  State: ${status.state}`);
      console.log(`  Wave: ${status.wave}/${status.totalWaves}`);
      console.log(`  Kills: ${status.kills}`);
      console.log(`  Active enemies: ${status.enemiesActive}`);
      console.log(`  Player HP: ${this.playerHP}/100`);
      console.log(`  VFX particles: ${this.vfx.getCount()}`);
    }

    // Check mission complete
    if (this.mission.getTracker().isComplete()) {
      console.log('\n🎉 MISSION COMPLETE!');
      audioSystem.play('ko');
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

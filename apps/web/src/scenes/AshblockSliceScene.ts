/**
 * AshblockSliceScene
 *
 * The vertical-slice combat scene for District-1 (Ashblock Heights).
 * Reuses the validated Sprint-1 combat kernel (Hurtbox / MovePlayer /
 * PlayerController / VFXSystem / CameraShake / AudioSystem) but is driven
 * by canon-locked encounter beats instead of the IRONVEIN MissionOrchestrator.
 *
 * Coordination contract with AshblockBeatOverlay (DOM):
 *   - Overlay calls scene.beginEncounter(encounterId) at the escalation beat.
 *   - Scene fires onEncounterCleared(encounterId) when all spawned enemies die.
 *   - Scene fires onPlayerDied() if HP hits 0.
 *
 * Visual dressing: warm amber-violet ambient, scorched-asphalt ground,
 * ember particle drift. NO new VFX systems — pure parameter pass.
 */
import * as THREE from "three";
import { Hurtbox } from "../combat/Hurtbox";
import { MovePlayer } from "../combat/MovePlayer";
import { EnemyEntity } from "../entities/EnemyEntity";
import { BossEntity } from "../entities/BossEntity";
import { PlayerController } from "../player/PlayerController";
import { CHARACTERS, type CharacterId } from "../characters/CharacterSpec";
import { VFXSystem } from "../systems/VFXSystem";
import { audioSystem } from "../systems/AudioSystem";
import { CameraShake } from "../systems/CameraShake";
import type { MoveSpec } from "../types/MoveSpec";
import { ASHBLOCK_ENCOUNTERS } from "../game/world/zones/AshblockHeights/AshblockHeightsEncounters";
import type { EncounterSpec } from "../game/encounters/districtTypes";

export interface AshblockSliceCallbacks {
  onReady?: () => void;
  onEncounterStarted?: (encounterId: string) => void;
  onEncounterCleared?: (encounterId: string) => void;
  onPlayerDied?: () => void;
  onStatus?: (status: AshblockSliceStatus) => void;
}

export interface AshblockSliceStatus {
  playerHP: number;
  playerMaxHP: number;
  encounterId: string | null;
  enemyCount: number;
  bossAlive: boolean;
  frameCount: number;
}

export class AshblockSliceScene {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;

  // Player kernel
  private playerMesh!: THREE.Mesh;
  private playerHurtbox!: Hurtbox;
  private playerMovePlayer!: MovePlayer;
  private playerController!: PlayerController;
  private playerHP: number = 100;
  private playerMaxHP: number = 100;
  private playerMoves: MoveSpec[] = [];

  // Enemies
  private enemies: Map<string, EnemyEntity> = new Map();
  private boss: BossEntity | null = null;
  private lastBossPhase: string = "phase1";

  // Feel
  private vfx!: VFXSystem;
  private cameraShake = new CameraShake();
  private emberTimer = 0;

  // State
  private characterId: CharacterId = "kai";
  private animationId: number | null = null;
  private frameCount = 0;
  private currentEncounterId: string | null = null;
  private encounterClearedFired = new Set<string>();
  private playerDiedFired = false;
  private callbacks: AshblockSliceCallbacks;

  constructor(canvas: HTMLCanvasElement, opts: { character?: CharacterId; callbacks?: AshblockSliceCallbacks } = {}) {
    this.characterId = opts.character ?? "kai";
    this.callbacks = opts.callbacks ?? {};

    this.scene = new THREE.Scene();
    // Ashblock skybox: warm dusk over the war-zone block.
    this.scene.background = new THREE.Color(0x1a0a14);
    this.scene.fog = new THREE.Fog(0x2a0d18, 18, 40);

    this.camera = new THREE.PerspectiveCamera(72, canvas.width / canvas.height, 0.1, 200);
    this.camera.position.set(0, 5, 12);
    this.camera.lookAt(0, 1, 0);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(canvas.width, canvas.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    this.buildAshblockEnvironment();
    this.setupPlayer();

    this.vfx = new VFXSystem(this.scene);
    this.cameraShake.setBasePosition(this.camera.position);

    this.wirePlayerFeedback();
    this.setupInput();
    this.loadMoves();

    console.log("[AshblockSlice] Initialized.");
  }

  // ────────────────────────────────────────────────────────────────────────
  // Environment
  // ────────────────────────────────────────────────────────────────────────
  private buildAshblockEnvironment(): void {
    // Warm key light from a busted streetlamp angle.
    const ambient = new THREE.AmbientLight(0x6b3422, 0.55);
    this.scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffa860, 0.85);
    keyLight.position.set(-6, 12, 8);
    this.scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x4477ff, 0.35);
    rimLight.position.set(8, 6, -10);
    this.scene.add(rimLight);

    // Cracked asphalt ground.
    const groundGeo = new THREE.PlaneGeometry(40, 28);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x2a1a22,
      roughness: 0.95,
      metalness: 0.05,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    this.scene.add(ground);

    // Asphalt cracks — thin emissive lines.
    const crackMat = new THREE.MeshBasicMaterial({ color: 0xff5522, transparent: true, opacity: 0.18 });
    for (let i = 0; i < 12; i++) {
      const len = 2 + Math.random() * 5;
      const crack = new THREE.Mesh(new THREE.PlaneGeometry(len, 0.06), crackMat);
      crack.rotation.x = -Math.PI / 2;
      crack.rotation.z = Math.random() * Math.PI;
      crack.position.set((Math.random() - 0.5) * 28, -0.49, (Math.random() - 0.5) * 18);
      this.scene.add(crack);
    }

    // Block-edge buildings — chunky boxes around the perimeter.
    const buildingMat = new THREE.MeshStandardMaterial({ color: 0x14070a, roughness: 0.9 });
    const buildingPositions: [number, number, number, number][] = [
      // [x, z, w, depth]
      [-15, -8, 4, 4], [-15, 0, 4, 5], [-15, 8, 4, 4],
      [15, -7, 4, 5], [15, 2, 4, 4], [15, 9, 4, 4],
      [-7, -12, 5, 3], [3, -12, 4, 3], [9, -12, 5, 3],
    ];
    for (const [x, z, w, d] of buildingPositions) {
      const h = 5 + Math.random() * 3.5;
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), buildingMat);
      b.position.set(x, h / 2 - 0.5, z);
      this.scene.add(b);

      // Window grid — a few tinted neon sparks per facade.
      for (let wy = 0; wy < 3; wy++) {
        for (let wx = 0; wx < 2; wx++) {
          if (Math.random() > 0.55) continue;
          const win = new THREE.Mesh(
            new THREE.PlaneGeometry(0.4, 0.4),
            new THREE.MeshBasicMaterial({
              color: Math.random() > 0.5 ? 0xff7733 : 0xffaa55,
              transparent: true,
              opacity: 0.6,
            }),
          );
          win.position.set(
            x + (wx === 0 ? -w / 2 - 0.01 : w / 2 + 0.01),
            1.5 + wy * 1.4,
            z + (Math.random() - 0.5) * (d * 0.6),
          );
          win.rotation.y = wx === 0 ? -Math.PI / 2 : Math.PI / 2;
          this.scene.add(win);
        }
      }
    }

    // Smoke columns hint at the dusk skyline.
    const smokeMat = new THREE.MeshBasicMaterial({ color: 0x4a2030, transparent: true, opacity: 0.18 });
    for (let i = 0; i < 4; i++) {
      const smoke = new THREE.Mesh(new THREE.ConeGeometry(2.5, 8, 8), smokeMat);
      smoke.position.set((Math.random() - 0.5) * 24, 4, -10 - Math.random() * 6);
      smoke.rotation.y = Math.random();
      this.scene.add(smoke);
    }
  }

  // ────────────────────────────────────────────────────────────────────────
  // Player
  // ────────────────────────────────────────────────────────────────────────
  private setupPlayer(): void {
    const spec = CHARACTERS[this.characterId];
    const playerGeo = new THREE.BoxGeometry(0.8, 1.8, 0.5);
    const playerMat = new THREE.MeshStandardMaterial({ color: spec.color });
    this.playerMesh = new THREE.Mesh(playerGeo, playerMat);
    this.playerMesh.position.set(0, 0.9, 0);
    this.scene.add(this.playerMesh);

    this.playerHurtbox = new Hurtbox(this.scene, 0.8, 1.6);
    this.playerHurtbox.setPosition(0, 0.8, 0);
    this.playerHurtbox.health = spec.hp;
    this.playerHurtbox.maxHealth = spec.hp;
    this.playerHP = spec.hp;
    this.playerMaxHP = spec.hp;

    this.playerMovePlayer = new MovePlayer(this.scene, this.playerHurtbox, this.playerMesh.position);
    this.playerController = new PlayerController(this.playerMesh.position);
    this.playerController.setBoundaries(-14, 14, -9, 9);
    this.playerController.setMoveSpeed(spec.moveSpeed);
  }

  private async loadMoves(): Promise<void> {
    try {
      const spec = CHARACTERS[this.characterId];
      const base = (import.meta as any).env?.BASE_URL ?? "/";
      for (const moveId of spec.moveIds) {
        const response = await fetch(`${base}moves/${moveId}.json`);
        const move: MoveSpec = await response.json();
        this.playerMoves.push(move);
      }
      console.log(`[AshblockSlice] Loaded ${this.playerMoves.length} moves for ${this.characterId}`);
      this.callbacks.onReady?.();
    } catch (err) {
      console.error("[AshblockSlice] move load failed:", err);
    }
  }

  // ────────────────────────────────────────────────────────────────────────
  // Feedback wiring
  // ────────────────────────────────────────────────────────────────────────
  private wirePlayerFeedback(): void {
    this.playerMovePlayer.setCallbacks({
      onMoveStart: (move) => audioSystem.play(move.id.includes("grab") ? "grab" : "whoosh"),
      onActiveFrame: (_h, pos) => this.vfx.spawnTrail(pos.x, pos.y, pos.z, 0xff7733),
      onHit: (hit, pos) => {
        if (hit.isGrab) {
          this.vfx.spawnHitSpark(pos.x, pos.y, pos.z, 0xff66ff, 16);
          audioSystem.play("grab");
        } else {
          const heavy = hit.dmg >= 8;
          this.vfx.spawnHitSpark(pos.x, pos.y, pos.z, heavy ? 0xff8844 : 0xffee55, heavy ? 18 : 10);
          audioSystem.play(heavy ? "hit_heavy" : "hit_light");
          this.vfx.spawnKnockbackDust(pos.x, pos.z, heavy ? 8 : 4);
        }
        this.cameraShake.add(hit.dmg >= 8 ? 0.6 : 0.3);
      },
      onBlock: (_hit, pos) => {
        this.vfx.spawnBlockRing(pos.x, pos.y, pos.z);
        audioSystem.play("block");
        this.cameraShake.add(0.15);
      },
      onShieldBreak: (pos) => {
        this.vfx.spawnHitSpark(pos.x, pos.y, pos.z, 0x00ddff, 20);
        audioSystem.play("shield_break");
        this.cameraShake.add(0.5);
      },
    });
  }

  private wireEnemyFeedback(mp: MovePlayer, enemyColor = 0xff5555): void {
    mp.setCallbacks({
      onMoveStart: () => audioSystem.play("whoosh"),
      onHit: (hit, pos) => {
        this.vfx.spawnHitSpark(pos.x, pos.y, pos.z, enemyColor, hit.dmg >= 8 ? 16 : 10);
        audioSystem.play(hit.dmg >= 8 ? "hit_heavy" : "hit_light");
        this.vfx.spawnKnockbackDust(pos.x, pos.z, 4);
        this.cameraShake.add(hit.dmg >= 8 ? 0.5 : 0.25);
      },
      onBlock: (_h, pos) => {
        this.vfx.spawnBlockRing(pos.x, pos.y, pos.z);
        audioSystem.play("block");
      },
    });
  }

  // ────────────────────────────────────────────────────────────────────────
  // Input
  // ────────────────────────────────────────────────────────────────────────
  private setupInput(): void {
    window.addEventListener("keydown", (e) => {
      const k = e.key.toLowerCase();
      const moveBindings = ["j", "k", "l", "i", "u", "o"];
      const idx = moveBindings.indexOf(k);
      if (idx !== -1) {
        if (!this.playerMovePlayer.isBusy() && this.playerMoves[idx]) {
          this.playerMovePlayer.startMove(this.playerMoves[idx]);
        }
        return;
      }
      if (k === "shift") this.playerMovePlayer.setShield(true);
      if (k === "escape") this.stop();
    });
    window.addEventListener("keyup", (e) => {
      if (e.key.toLowerCase() === "shift") this.playerMovePlayer.setShield(false);
    });
  }

  // ────────────────────────────────────────────────────────────────────────
  // Encounter spawning (driven by overlay's escalation beat)
  // ────────────────────────────────────────────────────────────────────────
  public async beginEncounter(encounterId: string): Promise<void> {
    const spec = ASHBLOCK_ENCOUNTERS.find((e) => e.id === encounterId);
    if (!spec) {
      console.warn(`[AshblockSlice] Unknown encounter ${encounterId}`);
      return;
    }
    if (this.currentEncounterId === encounterId && (this.enemies.size > 0 || this.boss)) {
      // Already in progress.
      return;
    }
    this.currentEncounterId = encounterId;
    this.encounterClearedFired.delete(encounterId);
    console.log(`[AshblockSlice] Begin encounter ${encounterId} — ${spec.label}`);
    this.callbacks.onEncounterStarted?.(encounterId);
    await this.spawnForEncounter(spec);
  }

  private async spawnForEncounter(spec: EncounterSpec): Promise<void> {
    // Tier scales HP & damage modestly.
    const tier = spec.tierScale;
    const minionHP = 28 + tier * 6;

    // Distribute minions in a fan formation in front of the player.
    for (let i = 0; i < spec.minionCount; i++) {
      const t = (i + 0.5) / spec.minionCount; // 0..1
      const x = (t - 0.5) * 6 + (Math.random() - 0.5) * 0.4;
      const z = -5 - Math.random() * 1.5;
      const id = `${spec.id}-m${i}`;
      const enemy = new EnemyEntity(this.scene, id, x, 0.8, minionHP, 0xa83838, "grunt");
      // Reposition to z-axis since EnemyEntity defaults z=0; we manually align.
      enemy.mesh.position.set(x, 0.8, z);
      enemy.hurtbox.setPosition(x, 0.8, z);

      await enemy.loadMove("kai_light_jab");
      enemy.setTarget({
        position: this.playerMesh.position,
        isAlive: () => this.playerHP > 0,
      });
      this.enemies.set(id, enemy);
      this.wireEnemyFeedback(enemy.getMovePlayer(), 0xa83838);
    }

    // Boss for d1-e3 only.
    if (spec.includeBoss) {
      const bossHP = 90 + tier * 15;
      const boss = new BossEntity(this.scene, `${spec.id}-boss`, 0, 0.8, bossHP);
      boss.mesh.position.set(0, 0.8, -7);
      boss.hurtbox.setPosition(0, 0.8, -7);
      await boss.loadMove("kai_light_jab");
      await boss.loadMove("kai_heavy_punch");
      await boss.loadMove("kai_combo_chain");
      boss.setTarget({
        position: this.playerMesh.position,
        isAlive: () => this.playerHP > 0,
      });
      this.boss = boss;
      this.lastBossPhase = "phase1";
      audioSystem.play("boss_roar");
      this.vfx.spawnPhaseFlash(this.camera, 0xff3322);
      this.cameraShake.add(0.8);
      this.wireEnemyFeedback(boss.getMovePlayer(), 0xff3333);
    }
  }

  // ────────────────────────────────────────────────────────────────────────
  // Loop
  // ────────────────────────────────────────────────────────────────────────
  public start(): void {
    console.log("[AshblockSlice] start()");
    this.animate();
  }

  public stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
      console.log("[AshblockSlice] stop()");
    }
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);
    this.frameCount++;
    const dt = 1 / 60;

    // Player
    this.playerController.update(dt);
    const ppos = this.playerController.getPosition();
    this.playerMesh.position.copy(ppos);
    this.playerHurtbox.setPosition(ppos.x, ppos.y - 0.1, ppos.z);
    if (this.playerController.isMoving()) {
      const md = this.playerController.getMovementDirection();
      if (Math.abs(md.x) > 0.1) this.playerMovePlayer.setFacing(md.x > 0);
    }
    this.playerMovePlayer.update();

    // Enemies + boss
    this.enemies.forEach((e) => e.update(dt));
    if (this.boss) {
      this.boss.update(dt);
      const phase = this.boss.getPhase();
      if (phase !== this.lastBossPhase) {
        const phaseColor = phase === "phase3" ? 0xffff00 : 0xff8800;
        this.vfx.spawnPhaseFlash(this.camera, phaseColor);
        audioSystem.play("phase_transition");
        this.cameraShake.add(0.6);
        this.lastBossPhase = phase;
      }
    }

    this.checkPlayerAttacks();
    this.checkEnemyAttacks();
    this.cleanupAndSettleEncounter();

    // Ember drift particles for atmosphere — every ~12 frames spawn one.
    this.emberTimer += dt;
    if (this.emberTimer > 0.2) {
      this.emberTimer = 0;
      this.vfx.spawnTrail(
        (Math.random() - 0.5) * 28,
        2 + Math.random() * 3,
        (Math.random() - 0.5) * 18,
        0xff6622,
      );
    }

    this.vfx.update(dt);
    this.cameraShake.update(dt, this.camera);

    // Status broadcast every 6 frames (10x/sec) for HUD.
    if (this.frameCount % 6 === 0) {
      this.callbacks.onStatus?.(this.getStatus());
    }

    this.renderer.render(this.scene, this.camera);
  };

  private checkPlayerAttacks(): void {
    // Access kernel's hitboxes via the same path MissionScene uses.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const playerHitboxes = (this.playerMovePlayer as any).hitboxes as THREE.Mesh[];
    if (!playerHitboxes || playerHitboxes.length === 0) return;

    const currentMove = this.playerMovePlayer.currentMove;
    const hitSpec = currentMove?.hits?.[0];
    const damage = hitSpec?.dmg ?? 4;
    const kb = new THREE.Vector2(hitSpec?.kbX ?? 1.5, hitSpec?.kbY ?? 0.5);

    this.enemies.forEach((enemy) => {
      if (enemy.isDefeated()) return;
      for (const hb of playerHitboxes) {
        const hitBB = new THREE.Box3().setFromObject(hb);
        const hurtBB = new THREE.Box3().setFromObject(enemy.hurtbox.mesh);
        if (hitBB.intersectsBox(hurtBB)) {
          enemy.takeDamage(damage, kb);
        }
      }
    });
    if (this.boss && !this.boss.isDefeated()) {
      for (const hb of playerHitboxes) {
        const hitBB = new THREE.Box3().setFromObject(hb);
        const hurtBB = new THREE.Box3().setFromObject(this.boss.hurtbox.mesh);
        if (hitBB.intersectsBox(hurtBB)) {
          this.boss.takeDamage(damage, kb);
        }
      }
    }
  }

  private checkEnemyAttacks(): void {
    this.enemies.forEach((enemy) => {
      if (enemy.isDefeated()) return;
      if (enemy.checkAttackHit(this.playerHurtbox)) {
        this.playerHP = Math.max(0, this.playerHP - 4);
        if (this.playerHP <= 0 && !this.playerDiedFired) {
          this.playerDiedFired = true;
          this.callbacks.onPlayerDied?.();
        }
      }
    });
    if (this.boss && !this.boss.isDefeated()) {
      if (this.boss.checkAttackHit(this.playerHurtbox)) {
        this.playerHP = Math.max(0, this.playerHP - 10);
        if (this.playerHP <= 0 && !this.playerDiedFired) {
          this.playerDiedFired = true;
          this.callbacks.onPlayerDied?.();
        }
      }
    }
  }

  private cleanupAndSettleEncounter(): void {
    const dead: string[] = [];
    this.enemies.forEach((e, id) => {
      if (e.isDefeated()) dead.push(id);
    });
    dead.forEach((id) => this.enemies.delete(id));
    if (this.boss && this.boss.isDefeated()) {
      this.boss = null;
    }

    if (
      this.currentEncounterId &&
      this.enemies.size === 0 &&
      this.boss === null &&
      !this.encounterClearedFired.has(this.currentEncounterId)
    ) {
      const id = this.currentEncounterId;
      this.encounterClearedFired.add(id);
      // Brief celebratory flash + pause-friendly so the overlay's payoff lands clean.
      this.vfx.spawnPhaseFlash(this.camera, 0xff8a3d);
      audioSystem.play("ko");
      console.log(`[AshblockSlice] Encounter ${id} cleared.`);
      this.callbacks.onEncounterCleared?.(id);
      this.currentEncounterId = null;
    }
  }

  // ────────────────────────────────────────────────────────────────────────
  // Public surface
  // ────────────────────────────────────────────────────────────────────────
  public getStatus(): AshblockSliceStatus {
    return {
      playerHP: this.playerHP,
      playerMaxHP: this.playerMaxHP,
      encounterId: this.currentEncounterId,
      enemyCount: this.enemies.size,
      bossAlive: this.boss !== null && !this.boss.isDefeated(),
      frameCount: this.frameCount,
    };
  }

  public resize(w: number, h: number): void {
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }
}

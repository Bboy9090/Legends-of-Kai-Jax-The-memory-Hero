# Replit Gameplay Systems Blueprint

This guide captures the core gameplay systems for the web build, focusing on Three.js integration, enemy AI, combat abilities, and UI hooks. Use it as the starting point for the Replit/WebGL prototype and to keep behavior consistent with the Codex story beats. For a concrete, copy-pasteable Book 1 Mission 1 slice, see `docs/book1-mission1-mvp.md` and the scaffold in `docs/replit-mission-skeleton.md`; for the first on-camera anomaly (Mission 3), see `docs/book1-mission3-broken-bracket.md`.

## Enemy AI Patterns

### Regular Enemies
- **Patrol → Aggro swap:** Enemies idle on a simple path until the player enters range, then chase and strike.
- **Attacks:** Light melee slashes or bites with optional block windows.
- **Example:** Rift Beast patrols on the x-axis and becomes aggressive when flagged.

```ts
const isAggressive = new WeakMap<THREE.Object3D, boolean>();

function tickRiftBeast(enemy: THREE.Object3D, player: THREE.Object3D) {
  const aggressive = isAggressive.get(enemy) ?? false;
  if (!aggressive) {
    enemy.position.x += Math.sin(Date.now() * 0.01) * 0.1;
    return;
  }

  const direction = new THREE.Vector3().subVectors(player.position, enemy.position).normalize();
  enemy.position.add(direction.multiplyScalar(0.1));

  if (Math.random() < 0.05) {
    player.userData.health = (player.userData.health ?? 100) - 10;
  }
}
```

### Boss Phases
- **Phase 1:** Basic melee and ranged attacks; learnable patterns.
- **Phase 2:** Adds minion spawns or shields that force crowd control.
- **Phase 3 (Rage):** Speed and damage spike plus arena hazards or time-warp strikes.

```ts
function tickVoidKing(boss: THREE.Object3D, player: THREE.Object3D) {
  const hp = boss.userData.health ?? 100;
  if (hp <= 25) boss.userData.phase = 3;
  else if (hp <= 50) boss.userData.phase = 2;
  else boss.userData.phase = 1;

  switch (boss.userData.phase) {
    case 1:
      boss.userData.attack?.(player);
      break;
    case 2:
      boss.userData.summonMinions?.();
      boss.userData.activateShield?.();
      break;
    case 3:
      boss.userData.attackSpeed = 1.5;
      boss.userData.damage = 2 * (boss.userData.baseDamage ?? 10);
      boss.userData.timeWarpAttack?.(player);
      break;
  }
}
```

## Character Abilities & Power-Ups
- Abilities unlock per hero (e.g., `auraPunch`, `spinDash`) and can be checked before activation.
- Power-ups mirror classic affordances while staying Codex-safe: **Mushroom** (+health), **Star** (temp invincibility), **Fireball/Iceball** (elemental boosts).

```ts
const abilities = {
  "Radiant Jumper": { auraPunch: false },
  "Cobalt Blur": { spinDash: true },
} as const;

type HeroId = keyof typeof abilities;

function useAbility(hero: HeroId, key: keyof (typeof abilities)[HeroId]) {
  if (!abilities[hero][key]) return false;
  // trigger animation/effects here
  return true;
}

function applyPowerUp(player: THREE.Object3D, kind: "Mushroom" | "Star" | "Fireball" | "Iceball") {
  switch (kind) {
    case "Mushroom":
      player.userData.health = Math.min(100, (player.userData.health ?? 100) + 20);
      break;
    case "Star":
      player.userData.invincibleUntil = performance.now() + 6000;
      break;
    case "Fireball":
      player.userData.attackBonus = (player.userData.attackBonus ?? 0) + 10;
      break;
    case "Iceball":
      player.userData.freeze = true;
      break;
  }
}
```

## Level Hooks
- **Floating Arena:** Moving platforms with hazard checks; despawn if the player falls.
- **Electric hazard proximity:** Tick damage when within radius.

```ts
function movePlatform(platform: THREE.Object3D) {
  platform.position.x += Math.sin(Date.now() * 0.01) * 0.1;
}

function applyHazardDamage(player: THREE.Object3D, hazard: THREE.Object3D, radius = 5, damage = 20) {
  if (player.position.distanceTo(hazard.position) < radius) {
    player.userData.health = (player.userData.health ?? 100) - damage;
  }
}
```

## UI / UX Signals
- HUD anchors: **health bar**, **ability meter**, and **mission tracker** updated via DOM.
- Save/load: store `health`, `missionId`, and unlocked abilities in `localStorage`.

```ts
function saveProgress(state: { health: number; missionId: string; abilities: Record<string, boolean> }) {
  localStorage.setItem("gameState", JSON.stringify(state));
}

function loadProgress() {
  const raw = localStorage.getItem("gameState");
  return raw ? JSON.parse(raw) : null;
}
```

## Implementation Notes
- Use `GLTFLoader` in Three.js to import Codex hero models; attach `userData` for health, damage, and phase flags.
- Drive animation mixers per frame inside the render loop with `mixer.update(delta)`.
- Keep difficulty scalable: expose tunables for patrol speed, aggro radius, boss shield duration, and hazard damage per mission.

## Audio Layer
- Centralize music/SFX in an `AudioManager` that can swap tracks when missions, cutscenes, or boss phases change.
- Keep short voice stingers per hero/boss for fire moments.

```ts
class AudioManager {
  music: Record<string, HTMLAudioElement> = {};
  sfx: Record<string, HTMLAudioElement> = {};
  current?: string;
  musicVolume = 0.6;
  sfxVolume = 0.9;

  loadMusic(id: string, src: string) {
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = this.musicVolume;
    this.music[id] = audio;
  }

  loadSfx(id: string, src: string) {
    const audio = new Audio(src);
    audio.loop = false;
    audio.volume = this.sfxVolume;
    this.sfx[id] = audio;
  }

  playMusic(id: string) {
    if (this.current) {
      this.music[this.current]?.pause();
      this.music[this.current]!.currentTime = 0;
    }
    this.current = id;
    this.music[id]?.play();
  }

  playSfx(id: string) {
    const clip = this.sfx[id];
    if (!clip) return;
    clip.currentTime = 0;
    clip.play();
  }
}
```

## Difficulty Settings
- Expose a small config to scale **enemy damage/health**, **player output**, and **boss pattern speed**.

```ts
const Difficulty = {
  EASY: { enemyDmg: 0.6, enemyHp: 0.75, playerDmg: 1.2, bossSpeed: 0.8 },
  MEDIUM: { enemyDmg: 1.0, enemyHp: 1.0, playerDmg: 1.0, bossSpeed: 1.0 },
  HARD: { enemyDmg: 1.4, enemyHp: 1.3, playerDmg: 0.9, bossSpeed: 1.25 },
} as const;

type DifficultyKey = keyof typeof Difficulty;
let currentDifficulty: DifficultyKey = "MEDIUM";

function tuneEnemy(enemy: THREE.Object3D) {
  const diff = Difficulty[currentDifficulty];
  enemy.userData.damage = (enemy.userData.baseDamage ?? 10) * diff.enemyDmg;
  enemy.userData.health = (enemy.userData.baseHealth ?? 100) * diff.enemyHp;
}
```

## Checkpoints & Auto-Save
- Save mid-mission and pre-boss snapshots to `localStorage`; include mission id, player stats, and boss phase.

```ts
interface Checkpoint {
  missionId: string;
  label: string;
  player: { health: number; position: THREE.Vector3; abilities: Record<string, boolean> };
  boss?: { health: number; phase: number };
}

function saveCheckpoint(cp: Checkpoint) {
  const payload = {
    ...cp,
    player: { ...cp.player, position: cp.player.position.toArray() },
  };
  localStorage.setItem("checkpoint", JSON.stringify(payload));
}

function loadCheckpoint(): Checkpoint | null {
  const raw = localStorage.getItem("checkpoint");
  if (!raw) return null;
  const parsed = JSON.parse(raw);
  return {
    ...parsed,
    player: { ...parsed.player, position: new THREE.Vector3(...parsed.player.position) },
  };
}
```

## Game State Loop
- States: `MENU → STORY_SELECT → MISSION_RUNNING → CUTSCENE → PAUSE → GAME_OVER`.
- Drive saga progression with data for each Book/Mission; swap missions by id and attach music, cutscenes, and checkpoint logic.

```ts
type GameState = "MENU" | "STORY_SELECT" | "MISSION_RUNNING" | "CUTSCENE" | "PAUSE" | "GAME_OVER";
let gameState: GameState = "MENU";

function startMission(missionId: string) {
  gameState = "MISSION_RUNNING";
  // load scene, play music, restore checkpoint if present
}

function completeMission(nextId?: string) {
  saveProgress({ missionId: nextId ?? "" });
  if (nextId) startMission(nextId);
  else gameState = "STORY_SELECT";
}
```

## Core Movement Loop
- Third-person feel: camera-relative WASD, simple gravity, and jump impulse; swap in Rapier later without changing inputs.

```ts
const input = { left: false, right: false, forward: false, back: false, jump: false };

class KinematicController {
  constructor(public model: THREE.Object3D) {}
  speed = 0.15;
  jump = 0.35;
  vy = 0;
  grounded = false;
  gravity = -0.02;

  update() {
    const dir = new THREE.Vector3(
      Number(input.right) - Number(input.left),
      0,
      Number(input.back) - Number(input.forward)
    )
      .normalize()
      .multiplyScalar(this.speed);

    this.model.position.add(dir);

    if (input.jump && this.grounded) {
      this.vy = this.jump;
      this.grounded = false;
    }

    this.vy += this.gravity;
    this.model.position.y += this.vy;
    if (this.model.position.y <= 0) {
      this.model.position.y = 0;
      this.vy = 0;
      this.grounded = true;
    }
  }
}
```

This document keeps gameplay behavior actionable for the Replit/WebGL build while aligning with the saga’s Codex naming and mid-trilogy missions.

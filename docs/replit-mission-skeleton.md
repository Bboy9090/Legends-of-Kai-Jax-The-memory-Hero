# Replit Mission Skeleton (B1_M1)

This is the minimal three-file scaffold you can paste into a Replit HTML/CSS/JS project to stand up Book 1 — Mission 1. Swap the placeholder meshes for GLTF models once the loop works. When you advance to Mission 3’s on-camera anomaly (see `docs/book1-mission3-broken-bracket.md`), bolt on the glitch helpers and Rift Beast boss without changing this base loop.

## index.html
- Loads Three.js + GLTFLoader from CDN.
- HUD overlay (health, special, mission title, enemy count, hint text).
- Menu overlays: start, mission complete, game over.

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Grand Arena – First Light</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <!-- HUD + menus here -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128/examples/js/loaders/GLTFLoader.js"></script>
  <script src="main.js"></script>
</body>
</html>
```

## style.css
- Fullscreen canvas, minimal HUD styling (health bar, special bar, mission labels, hint text).
- Menu backgrounds and buttons.

```css
body { margin: 0; background: #000; color: #fff; overflow: hidden; }
canvas { position: fixed; inset: 0; display: block; }
#hud { position: fixed; top: 0; left: 0; width: 100%; padding: 10px 20px; }
.menu-screen { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; }
```

## main.js (core loop)
### Globals
- `scene`, `camera`, `renderer`, `clock`
- `player`, `enemies` array, `waveManager`
- Input state for WASD/Space/J/K/L
- HUD references

### Scene Setup
- Perspective camera, hemisphere + directional lights.
- Arena cylinder + two box platforms; gradient/solid background color.

### Player Controller
- Move with WASD; jump with Space; gravity + ground check.
- Light/Heavy/Special attacks mapped to J/K/L with cooldowns and front-facing hit checks.

### Enemy & Wave Logic
- Grunts: chase + swipe; Champions: chase + slam at low HP.
- Wave manager: spawn grunts → checkpoint → spawn champion → mission complete on KO.

### HUD + Flow
- Health/special bars update per frame.
- Start screen → intro cutscene camera sweep → RUNNING.
- Game over on player HP <= 0; Mission Complete overlay when champion dies.

### Example Skeleton Snippets
```js
// Player attack cone
attackInFront(damage, range) {
  const forward = new THREE.Vector3(0, 0, -1).applyEuler(this.model.rotation);
  const origin = this.model.position.clone().add(new THREE.Vector3(0, 1, 0));
  enemies.forEach((enemy) => {
    if (enemy.isDead) return;
    const toEnemy = enemy.model.position.clone().sub(origin);
    if (toEnemy.length() <= range && forward.angleTo(toEnemy.normalize()) < Math.PI / 4) {
      enemy.takeDamage(damage, forward);
    }
  });
}

// Wave manager
class WaveManager {
  start() {
    this.spawnGrunt(...); this.spawnGrunt(...); this.spawnGrunt(...);
  }
  update() {
    const alive = enemies.filter((e) => !e.isDead);
    if (alive.length === 0) this.spawnChampion(...);
  }
}

// Cutscene sweep
function updateIntroCutsceneCamera(t) {
  const target = player.model.position.clone();
  const start = new THREE.Vector3(0, 30, 0);
  const mid = new THREE.Vector3(25, 20, 25);
  const end = target.clone().add(new THREE.Vector3(0, 10, 20));
  const camPos = t < 2 ? start.clone().lerp(mid, t / 2) : mid.clone().lerp(end, (t - 2) / 3);
  camera.position.copy(camPos); camera.lookAt(target);
}
```

## GLTF Drop-In Points
- Replace the placeholder player box in `startMission1()` with `radiant_jumper.glb` via `GLTFLoader`.
- Replace grunt/champion spheres in `spawnGrunt`/`spawnChampion` with `rift_grunt.glb` and `rift_champion.glb`.
- Optional: keep `AnimationMixer` hooks to play idle/attack clips when animations exist.

## Minimal Audio Hooks
- `AudioManager` with `playMusic(id)` / `playSFX(id)`; load `music_b1_arena.mp3`, `sfx_aura_punch.mp3`, `sfx_hit_enemy.mp3`.
- Fire SFX inside attacks; swap to arena music on mission start.

## Checkpoint (MVP)
- One checkpoint after Wave 1 saved to `localStorage` (player health + position). On death during champion fight, reload checkpoint and respawn champion.

Use this file alongside `book1-mission1-mvp.md` as your build checklist: get the skeleton running with placeholder meshes, then swap art/audio and iterate.

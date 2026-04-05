# Book 1 — Mission 1 (MVP) : Grand Arena – First Light

This page distills the single-playable slice you can stand up in Replit/Three.js. Build this exactly once and you have a working game loop to iterate on.

## Mission Snapshot
- **ID:** `B1_M1`
- **Title:** Grand Arena — First Light
- **Book:** Convergence (Book 1)
- **Playable Hero:** Radiant Jumper only (lock roster for MVP)
- **Target Session:** 5–10 minutes when polished

### Player Fantasy
You enter a Smash-like arena as the saga’s anchor hero, learn the controls under crowd lights, then prove yourself against a mini-boss before the sky flickers with the first hint of a larger threat.

## Runtime Flow
1. **Mission Start Screen** — show title + short description; buttons: `Start`, `Back`.
2. **Intro Cutscene (5s sweep)** — camera circles the arena, Radiant Jumper walks in; crowd SFX.
3. **Tutorial Phase (10–20s)** — HUD prompts: Move (WASD), Jump (Space), Light (J), Heavy (K), Special (L); no enemies.
4. **Wave 1: Grunts** — spawn 3–5 Rift Grunts; teach spacing/knockback.
5. **Mini-Boss: Rift Champion** — single elite with two patterns (melee + slam after HP < 50%).
6. **Victory Cutscene** — pose, crowd roar, brief sky glitch (visual hint only).
7. **Mission Complete Screen** — `Mission Clear`, time, enemies defeated; unlock Mission 2; `Continue` button.

## Arena Layout (Simple 3D)
- **Base:** cylinder platform (~20 radius) floating in void/sky.
- **Side Platforms:** two small boxes raised (~y=3) left/right for vertical play.
- **Kill Zone:** y < -10 = death/fall damage; respawn at edge for MVP.
- **Lighting:** one directional light overhead + 1–2 colored point lights for aura; skybox gradient or textured sphere backdrop.

```js
// Base
const arenaGeo = new THREE.CylinderGeometry(20, 20, 1, 32);
const arenaMat = new THREE.MeshStandardMaterial({ color: 0x303030 });
const arenaBase = new THREE.Mesh(arenaGeo, arenaMat);
arenaBase.position.set(0, 0, 0);
scene.add(arenaBase);

// Side platforms
function createPlatform(x, y, z) {
  const geo = new THREE.BoxGeometry(6, 1, 4);
  const mat = new THREE.MeshStandardMaterial({ color: 0x505050 });
  const plat = new THREE.Mesh(geo, mat);
  plat.position.set(x, y, z);
  scene.add(plat);
  return plat;
}

const platLeft = createPlatform(-8, 3, 0);
const platRight = createPlatform(8, 3, 0);
```

## Radiant Jumper (MVP Stats)
- **HP:** 100
- **Move:** medium-high speed; single jump (no double jump yet)
- **Damage:** Light 8, Heavy 18, Special (Aura Punch) 25
- **Controls:** `WASD` move, `Space` jump, `J` light, `K` heavy, `L` special
- **Animations (minimum):** idle breathe + aura flicker, run with aura trails, jump/fall poses, light punch, heavy wind-up, special aura swing.

## Enemies
### Rift Grunt (basic)
- HP 30; Damage 6
- Behavior: slow chase, swipe if close; 2–4 light hits to kill; visible knockback on hit.

### Rift Champion (mini-boss)
- HP 120; Damage 12
- Behavior: slow chase, heavy punches; adds ground slam after HP <= 60; slam leaves short recovery window (punish with Heavy or Special).

## Systems to Ship for This Mission Only
- Third-person controller (move/jump/gravity) + smooth camera follow.
- Combat: light/heavy hitboxes, one special with ~3s cooldown.
- Enemy AI: grunt chase + swipe; champion chase + slam pattern.
- Health/Death: player HP bar, enemy HP reduction, KO states; game over on player HP <= 0.
- HUD: health bar, special cooldown bar, mission name, enemies remaining, hint text.
- Checkpoint: after Wave 1; dying to Champion respawns at Wave 2 with full HP.
- Audio (minimal): arena music loop; SFX for attack hit, player hit, enemy death, special.
- Victory condition: champion dies → short pose → Mission Complete screen.

Defer for later: roster select, inventory, difficulty toggles (unless you want the easy hook below), and saga UI.

## Optional Difficulty Toggle (per-mission)
Add three buttons on start screen (`Easy/Normal/Hard`) that scale enemy HP/damage by simple multipliers.

```js
const DifficultySettings = {
  EASY: { enemyHealthMult: 0.7, enemyDamageMult: 0.6 },
  NORMAL: { enemyHealthMult: 1.0, enemyDamageMult: 1.0 },
  HARD: { enemyHealthMult: 1.3, enemyDamageMult: 1.4 },
};
```

Apply the multipliers when constructing enemies.

## Asset Layout (Replit)
```text
project-root/
  index.html
  style.css
  main.js
  /lib
    three.min.js
    GLTFLoader.js
  /assets
    /models
      radiant_jumper.glb
      rift_grunt.glb
      rift_champion.glb
      arena.glb (optional; or build via code)
    /audio
      music_b1_arena.mp3
      sfx_aura_punch.mp3
      sfx_hit_enemy.mp3
      sfx_player_hit.mp3
      sfx_enemy_die.mp3
    /textures
      arena_floor.png
      skybox_*.png
  /scripts
    playerController.js
    enemyAI.js
    audioManager.js
    hud.js
    missions.js
```

## Implementation Order (do it in this sequence)
1) Base Three.js scene + cube player + camera.
2) Player controller (move/jump/gravity) + camera follow.
3) Arena geometry (base + 2 platforms + lights/sky).
4) Combat hit detection (light/heavy rays/overlaps) logging hits.
5) Enemy spawn: 1 dummy; chase + damage if close; remove on HP <= 0.
6) HUD: player health bar; updates on damage.
7) Wave system: Wave 1 grunts → Wave 2 champion.
8) Champion behavior: slam when HP < 50%; bigger damage/HP.
9) Special ability: Aura Punch on `L` with cooldown + SFX.
10) Cutscene stubs: 5s camera sweep at start; Mission Complete overlay at end.

## Drop-In Skeleton (summary)
The working skeleton lives in `index.html`, `style.css`, and `main.js` (see `docs/replit-mission-skeleton.md`). It wires:
- HUD (health/special/mission/enemy count + hint text)
- Menus (start, mission complete, game over)
- Scene setup, arena mesh, lights
- Input (WASD/Space/J/K/L)
- Player controller
- Enemy spawns + wave manager
- Basic checkpoint (after Wave 1)
- Mission complete / game over flow

Use the skeleton as-is, then replace the placeholder meshes with your GLTFs via `GLTFLoader` and hook real audio.

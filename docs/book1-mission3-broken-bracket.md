# Book 1 — Mission 3: Broken Bracket — Rift on Live Broadcast

Mission 3 is the first time the Cross Point Tournament stops feeling like a show and reveals the Void invasion on camera. Build it after M1/M2 so you reuse the arena code and only layer in the new glitch event, geometry swap, and Rift Beast boss.

## Mission Snapshot
- **ID:** `B1_M3`
- **Title:** Broken Bracket — Rift on Live Broadcast
- **Book:** Convergence (Book 1)
- **Playable Hero (MVP):** Radiant Jumper (roster lock for now)
- **Target Session:** ~10–15 minutes once polished

### Player Fantasy
You enter expecting a normal bracket fight, but mid-match the arena tears open on the broadcast, crowd screams, and a Rift Beast charges through. You survive, push it back, and realize the tournament is over.

## Runtime Flow
1. **Mission Intro Screen** — Title + short subtext (“A ranked match turns into something else”).
2. **Opening Cutscene** — Radiant Jumper enters; two “elite” fighters spawn (use champions as stand-ins); quick crowd/camera flicker.
3. **Phase 1: Fake Normal Match** — Fight 2–3 elites (harder than M1/M2 champions).
4. **Phase 2: Hard Glitch Event** — When the last elite hits ~30–40% HP: screen tint/flicker, a rift appears above center, part of the floor vanishes (hole), one platform swaps to a “jungle/tech” tile. Announcer text: “Uh… security? This isn’t a simulation, is it?”
5. **Phase 3: Rift Beast Boss** — Aggressive Void boss with a readable pattern: straight-line charge, close-range roar AoE, leap slam if kited.
6. **Phase 4: Finish It** — Defeat the Rift Beast; it is pulled back into the tear (rift flickers but doesn’t close).
7. **End Cutscene** — Camera pulls back: damaged arena, crowd panic implied, officials rush in. Radiant Jumper stares at the lingering rift; text hint that something watched and smiled.

## New Mechanics vs M1/M2
- **Missing Floor Hazard:** A defined hole region; falling deals damage and respawns the player to the edge.
- **Arena Morph:** One platform changes material/visual (jungle/tech) to foreshadow later zones.
- **Boss Variant:** Rift Beast with more mobility than the Champion; charge → roar → leap slam loop.
- **Soft Timer:** Periodic rift pulses (small AoE damage) if the fight drags.

## Runtime Hooks (Replit/Three.js)
These hooks bolt onto the existing Mission 1 skeleton without rewriting the engine:

- **Mission progression:**
  ```js
  if (currentMissionId === "B1_M2") { currentMissionId = "B1_M3"; startMission3(); }
  ```

- **Arena morph helpers:**
  - `resetArenaGeometryForM3()` — restore normal arena visuals before the fight.
  - `triggerArenaGlitchForM3()` — enable `arenaGlitchHoleActive`, recolor one platform, darken background, update HUD hint.
  - `checkArenaHoleFall()` — if player stands in the missing-floor bounds at y <= 0, apply damage and warp to a safe edge.

- **Wave manager:** `WaveManagerB1M3` handles two phases: elite match → glitch → Rift Beast spawn; sets a checkpoint after the elites fall.

- **Boss class:** `RiftBeast` extends the Champion template with higher HP/damage, charge/roar/jump cooldowns, and an optional `doRiftPulse()` soft-enrage tick.

- **Glitch trigger:** When one elite remains and drops below ~40% HP, call `triggerGlitchEvent()` to morph the arena, kill that elite via tear animation, and set Phase 2.

## Minimal Asset Notes
- **Models:** `assets/models/radiant_jumper.glb`, `assets/models/rift_champion.glb` (reused as elites), `assets/models/rift_beast.glb` (new boss). Placeholder colors work until art arrives.
- **Audio:** Reuse arena track; add a short distortion SFX for the glitch event and a roar for the Rift Beast intro.
- **FX:** Simple screen tint or post-process flash on glitch; emissive flash on Rift Beast roar; small camera shake on leap slam landing.

## Success Criteria for the Slice
- Plays end-to-end inside Replit/Three.js with existing input/combat.
- Arena hole damages + respawns; morph platform visibly different.
- Rift Beast exhibits its three-pattern loop; soft enrage pulses if slow.
- Mission Complete triggers when Rift Beast dies; shows post-battle hint text.

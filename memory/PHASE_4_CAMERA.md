## Phase 4: Camera and readability

### What changed

- **Battle camera modes** (`BattleCamera.tsx`): Implicit **exploration** (spacing / neutral), **combat** (both attacking, block/parry, hitstun, guard break), **lock-on** (dodge — tighter follow). Distance, height, lateral bias, lerp speed, and **shake amplitude** scale by mode.
- **Deterministic screen shake** in battle (and adventure): Replaced `Math.random()` in camera shake with **seeded `detRand11`** (`cameraModes.ts`) so shake is stable across platforms.
- **Adventure camera modes** (`AdventureCamera.tsx`): **Exploration** (wider, higher look target), **combat** (blend toward nearest enemy within range), **lock-on** (`autoTargetId` — stronger blend + slightly closer orbit). Shake damped in combat/lock-on.
- **Adventure combat flag** (`AdventurePlayerController.tsx`): `setPlayerCombat(true)` when an enemy is within ~14 units, or while attacking / hitstun / non-FREE combat state — drives combat camera branch.
- **Post FX punch dampening** (`BattleScene.tsx`): `CinematicPostFX` **punch** scales down when **chaos** is high (both attacking, high combo, blocking) to reduce stacked bloom/chroma during brawls.

### Why it improves player experience

- Framing adapts to **neutral spacing vs trades** vs **evasion**, so duels stay readable.
- Open-world camera **separates roam** from **fight** without a new scene.
- Less visual overload when systems stack (block + hits + combo).

### Files changed

- `apps/web/src/lib/cameraModes.ts`
- `apps/web/src/components/game/BattleCamera.tsx`
- `apps/web/src/components/game/adventure/AdventureCamera.tsx`
- `apps/web/src/components/game/adventure/AdventurePlayerController.tsx`
- `apps/web/src/components/game/BattleScene.tsx`
- `memory/PHASE_4_CAMERA.md`

### Risks

- Mode thresholds (distances, chaos weights) need playtest tuning.
- Battle lateral **sideBias** is heuristic; adjust if a character should stay dead-center.

### Next recommended step

- **Phase 5**: District encounters, mission hooks, and reusable encounter modules (reduce pure wave-loop dependence).

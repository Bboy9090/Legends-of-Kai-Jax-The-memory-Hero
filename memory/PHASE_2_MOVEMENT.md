## Phase 2: Movement upgrade (summary)

### What changed

- **Battle (`useBattle` + `PlayerController`)**
  - Ground locomotion uses **horizontal velocity with acceleration and deceleration** instead of instant displacement.
  - **Sprint**: hold Shift for a higher max speed on the ground.
  - **Strafe**: left/right still moves along the arena X while the character **faces the opponent** (combat-facing).
  - **Air control**: reduced acceleration cap while airborne.
  - **Dodge**: short ground dash along X (`playerDodgeTimer` / `playerDodgeDirection`), ticked in `updateRoundTimer` so it stays in sync with hit-stop and round logic. Opponent hit checks respect dodge frames; attacks cannot start during dodge.
  - **Bindings**: `Q` / `E` dodge left/right; touch `dodge` queues the same (default direction away from opponent if no horizontal input). Touch `attack` / `heavy` / `skill` map to battle `punch` / `kick` / `special` for progressive enhancement.

- **Adventure (`AdventurePlayerController`)**
  - Camera-relative movement target is **smoothed** with accel/decel into `setPlayerVelocity` before integrating position; dodge start clears smoothed velocity to avoid carryover.

- **Audio**
  - Deterministic procedural **`playDodge()`** whoosh (no external asset) for battle dodge feedback.

### Why it improves player experience

- Movement feels **less twitchy and more readable**: weight from accel/decel, clearer sprint commitment, and dodge as a deliberate defensive tool.
- **Combat-facing** keeps attacks and silhouettes oriented toward the opponent while allowing lateral spacing.
- Adventure mode gains **consistent responsiveness** without snapping velocity every frame.

### Files changed

- `apps/web/src/lib/stores/useBattle.tsx`
- `apps/web/src/components/game/PlayerController.tsx`
- `apps/web/src/components/game/adventure/AdventurePlayerController.tsx`
- `apps/web/src/lib/stores/useAudio.ts`
- `memory/PHASE_2_MOVEMENT.md` (this file)

### Risks

- Dodge i-frames are implemented as **skipping `playerTakeDamage`** and opponent hit resolution while `playerDodgeTimer > 0`; tuning may need stamina cost or stricter cancel rules in Phase 3.
- Battle dodge distance/duration are **constants** in `updateRoundTimer`; keep them in one place if you add character-specific dodge data later.

### Next recommended step

- **Phase 3**: Formalize combat FSM in the battle store (shared with adventure `CombatState` where sensible), add block/parry/guard-break hooks, and align dodge with stamina or meter where canon requires it.

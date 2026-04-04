## Phase 1: Gameplay system boundaries (canon-first, deterministic)

This file documents *ownership* and *allowed dependencies* between gameplay systems. The goal is deterministic gameplay logic with clean boundaries so Phase 2+ changes (movement/combat/camera/open-world) can be made without hidden coupling.

### Top-level runtime surfaces

- **3D Game Client (primary)**: `apps/web/`
- **Game Hub frontend**: `frontend/` (lore hub; not the gameplay runtime)
- **Backend**: `backend/` (optional; not required for `apps/web`)

### `apps/web` boundaries

#### Stores (authoritative runtime state)

- **Battle (arena/duel) runtime state**: `apps/web/src/lib/stores/useBattle.tsx`
  - **Owns**: duel state, timers, meter values, deterministic combat resolution for duel mode, screen FX intent (shake/flash/hitstop), fighter kinematics in the duel plane (x/y), **ground dodge timing** (`playerDodgeTimer` / `playerDodgeDirection`), **battle combat FSM** (`playerCombatState` + `tickBattleCombatFsm`), **duel stamina** (`playerStamina`), block/parry/guard-break resolution, and opponent stagger/hitstun timers.
  - **May depend on**:
    - Pure data or pure helpers: `apps/web/src/lib/combatSystems.ts`, `apps/web/src/lib/characterMoves.ts`
    - Cross-cutting services with no gameplay authority: `apps/web/src/lib/stores/useAudio.ts`
    - Meta progression/missions stores: `apps/web/src/lib/stores/useRunner.ts`, `apps/web/src/lib/stores/useMissions.ts`
    - Difficulty tuning: `apps/web/src/lib/stores/useDifficulty.ts`
  - **Must not depend on**:
    - React components
    - Three.js scene objects
    - Anything that introduces non-determinism into game rules (randomness without a seeded RNG)

- **Adventure (open-world / exploration) runtime state**: `apps/web/src/lib/stores/useAdventure.ts`
  - **Owns**: player/world positional state in 3D space, enemy list + lightweight AI state, stamina/combat state timers, mission progression for adventure mode.
  - **May depend on**: `apps/web/src/lib/combatSystems.ts` (shared enums/tuning).
  - **Must not depend on**: Battle store (mode separation keeps state ownership unambiguous).

#### Pure gameplay data / rules (deterministic, side-effect free)

- **Combat rules + frame windows**: `apps/web/src/lib/combatSystems.ts`
  - Owns shared combat constants and pure helpers (`FRAME_TIME`, move frame timing, active windows, clash priority).
  - Must remain side-effect free.

- **Character move tuning**: `apps/web/src/lib/characterMoves.ts`
  - Owns per-fighter tuning values (ranges/damage scalars) used by battle logic.
  - Must remain side-effect free.

#### Rendering & camera (reads state, does not author it)

- **Battle scene composition**: `apps/web/src/components/game/BattleScene.tsx`
  - Owns *rendering-only* assembly: environment, post FX, and scene graph.
  - Must not mutate battle rules; can call store methods only for lifecycle glue (e.g. kick off battle start) and cross-cutting outputs (e.g. audio intensity).

- **Battle camera (read-only)**: `apps/web/src/components/game/BattleCamera.tsx`
  - Reads battle positions, combat FSM, attacks, and screen shake from `useBattle`; applies **exploration / combat / lock-on** framing (implicit modes) and **deterministic** shake offsets.
  - Must not change gameplay state.

- **Adventure camera (read-only)**: `apps/web/src/components/game/adventure/AdventureCamera.tsx`
  - Reads `useAdventure` (`isCombat`, `autoTargetId`, `combatState`) for **exploration / combat / lock-on** framing and deterministic shake.

- **Camera helpers (pure)**: `apps/web/src/lib/cameraModes.ts`
  - `detRand11` and shared mode type aliases only — no store writes.

#### Input glue (intent → store)

- **Battle input**: `apps/web/src/components/game/PlayerController.tsx`
  - Translates keyboard/touch intent into `useBattle` actions and horizontal kinematics updates.
  - Must not own authoritative duel rules; dodge start goes through `useBattle.startPlayerDodge`.

- **Adventure input**: `apps/web/src/components/game/adventure/AdventurePlayerController.tsx`
  - Translates keyboard/touch + camera-relative axes into `useAdventure` updates.

### Phase 1 foundation rules (enforced by convention)

- **Single writer per system**: only one store owns a given piece of game state (no duplicated “player position” across stores for the same mode).
- **Pure rules are importable anywhere**: keep deterministic helpers in `src/lib/` without side effects.
- **Render reads, logic writes**: components read state and render; stores mutate state.
- **No “hidden production artifacts” in git**: generated output (e.g. `dist/`) should not be edited by hand; merge-conflicted agent logs (e.g. `.emergent/summary.txt`) should not ship.


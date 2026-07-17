# Phase 1A Playtest Proof — 2026-06-19

Branch: `phase0-stabilize-web-game`

## Verdict

Phase 1A.1 playable slice hardening is verified locally.

```text
MISSION LOAD: PASS
ENEMY SPAWN: PASS
PLAYER VISIBILITY FALLBACK: PASS
ESC PAUSE: PASS
FORCE QUIT TO HUB: PASS
BUILD: PASS
TESTS: PASS
PHASE 0 TYPECHECK: PASS
WORKING TREE: CLEAN
```

## Bugs Found

### 1. Pause Quit Did Not Exit Mission

Observed behavior:

```text
ESC opened pause menu.
Resume appeared.
Quit appeared.
Quit did not exit the mission.
```

Resolution:

- Added hard adventure quit behavior in `AdventureHUD`.
- Reset adventure state.
- Reset global game phase.
- Cleared active story mission.
- Cleared training mode.
- Forced persisted `kai-jax-save` runner state back to `lore-hub`.
- Added forced root reload fallback.
- Added emergency `Q` key while paused.

Verified result:

```text
Force Quit to Hub works.
```

### 2. Player Character Was Invisible

Observed behavior:

```text
Mission loads.
Enemies are visible.
Player character is not visible.
```

Resolution:

- Added `PlayerPhase1Fallback` inside `AdventureCharacter`.
- The fallback renders a guaranteed visible player capsule, head marker, forward indicator, ground ring, and point light.
- The GLB model still attempts to render normally above the fallback path.

Verified result:

```text
Player has visible fallback presence during gameplay.
```

### 3. Story Mission Wave Crash

Observed console error:

```text
StoryAdventure.tsx:300 Uncaught TypeError: Cannot read properties of undefined (reading 'map')
```

Root cause:

- `StoryAdventure` expected `wave.enemies.map(...)`.
- Story mission data defines waves as `{ type, count, delay? }`.

Resolution:

- Added story wave normalization.
- Converted `{ type, count }` mission waves into spawnable enemy specs.
- Added wave type to fighter ID mapping.
- Switched delay handling to support the existing `delay` field.

Verified result:

```text
Mission start no longer crashes on missing wave.enemies.
```

## Current Playable Slice Status

The current vertical slice is good enough to continue hardening instead of rebuilding.

```text
The repo remains salvageable.
Do not rebuild clean-slate.
Continue stabilizing the current playable loop.
```

## Next Target

Recommended next phase: `Phase 1A.2 — Real Player Model Visibility`

Goals:

1. Determine whether the real GLB model is missing, transparent, behind the fallback, or incorrectly scaled.
2. Add model load/error diagnostics.
3. Replace the fallback with a clean in-world debug silhouette only when GLB loading fails.
4. Keep build, test, and Phase 0 typecheck green.

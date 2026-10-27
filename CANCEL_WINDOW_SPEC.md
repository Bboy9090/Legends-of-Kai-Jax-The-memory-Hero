# Combat Cancel Window Contract — Mission 6 Gate

Status: **✅ VERIFIED & LIVE**. Implementation: `evaluateCancelTransition()` in `apps/web/src/game/combat/cancelTransition.ts`. Certification: 16/16 tests passing (9 unit, 7 integration). Baseline: `d950fbc2bdd6a9e219bb60e28f8cc2cd6b36099d` (PR #305 merge). Authoring clock: 60 frames/second. Arena remains 1D; adventure remains 3D. See `apps/web/CANCEL_WINDOW_SPEC.md` for detailed specification.

## Verified current behavior

- `moveData.ts` authors startup, active, recovery, `cancelAt`, stamina cost, hitstun, blockstun, and hitstop per move. `frameTiming.ts` converts frame counts to seconds. Active contact is half-open `[startup, startup+active)`; move completion is `elapsed >= total`.
- `cancelAt=0` means **no early cancel**, not cancel on frame zero. `getMoveFrameTime` uses the move's total duration as its computed cancel time in that case.
- `light1`: startup 5, active 4, recovery 8, total 17, cancel at 10, cost 4. `light2`: startup 5, active 4, recovery 9, total 18, cancel at 11, cost 4. `light3`: 6/5/12, total 23, no early cancel, cost 7. `heavy`: 9/6/16, total 31, no early cancel, cost 22. `skill`: 8/8/17, total 33, no early cancel, cost 27.
- Arena `useBattle.attemptComboCancel` permits punch-chain progression only when attacking, combo step below 2, current move's cancel frame reached, and neither guard break nor hitstun is active. The method does **not** itself charge stamina for the next move; callers and the initial attack path must be audited before treating stamina parity as proven.
- Adventure `AdventurePlayerController` checks current `cancelAt > 0`, elapsed time, a fresh attack edge, chain limit, and `useStamina(nextMove.staminaCost)` before advancing the light chain. It is not a generic move-to-move cancel graph.
- Arena posture precedence in `CombatStateMachine.ts`: DODGING > GUARD_BROKEN > HITSTUN > ATTACKING > PARRY_WINDOW/BLOCKING > FREE. `canStartOffensiveAction` currently permits only FREE. The combo cancel is a separate explicit exception.
- Arena `inputBuffer.ts` stores newest attack intent; it expires when remaining time reaches zero. `PlayerController` deliberately does not decrement a newly queued input on its creation frame. This does not establish identical buffering in adventure mode.

## Proposed Mission 6 shared contract (not yet implemented)

1. An early cancel is eligible only if `cancelAt > 0`, elapsed authored frames are at or beyond `cancelAt`, the source move is active, and the requested transition exists in an explicit allowed-transition table. No blanket cancel into heavy, skill, dodge, guard, or ultimate.
2. Existing certified light-chain edges only: `light1 -> light2`, `light2 -> light3`. All other attack-to-attack edges denied until separately designed and tested. Recovery ends at the total frame count; a new attack after that is a fresh action, not a cancel.
3. On each accepted transition, validate stamina **before** mutating move state. Reject on insufficient stamina without advancing combo step, restarting hit windows, or consuming an attack animation. A shared cost policy must be selected after auditing arena call sites.
4. Forced interruption wins: guard break and hitstun deny cancels; dodge priority is preserved. The existing arena precedence remains authoritative. An optional future parry-counter edge requires its own explicit recovery and stamina rules.
5. Buffer expiration uses gameplay time, not wall time. Inputs arriving during hitstop should not silently gain additional duration without a documented hitstop policy. Preserve newest-intent replacement and first-frame consumption attempt.
6. Do not change spatial semantics: arena knockback remains 1D, adventure knockback remains vector-based. Shared timing and permission rules must be pure and independent of coordinates.

## Required regression gates

- `light1`: frame 9 denied, frame 10 accepted; `light2`: frame 10 denied, frame 11 accepted. Test exact boundary with `framesToSeconds` and epsilon-safe fixed-step simulation.
- `light3`, `heavy`, `skill`: early cancel denied even though computed `cancelTime` equals total duration.
- Hitstun and guard-break interruptions reject attempted cancels, even when the authored frame threshold is met.
- Insufficient stamina leaves source move, elapsed time, hit registry, and combo step unchanged; successful cancel charges the next move exactly once.
- Input buffer: newest intent wins; expiry at zero; newly created input gets one consumption attempt; no unbounded queue during pause/hitstop.
- Preserve Mission 1–5 completion, retry, civilian pause safety, and existing attack-resolution tests. Verify controller, keyboard, and touch parity independently.

## Release policy

No change to current certified move values in this spec. A future implementation PR must include the pure transition evaluator, unit tests, mode-specific adapters, and an explicit migration review. Do not claim 60 FPS mobile performance without measured hardware traces.

# Kai gameplay visual review — updated 2026-10-08

Release status: NOT fully visually qualified. PR #285 remains Draft.

## Current runtime authority

Current head: `18e56c9c76bcf865020a2febdfc243bec5c1a306`.

Runtime Smoke Diagnostic #97 passes the real versus training path and the real story path on the same head.

Live animation probes from that hosted run prove:

- Walk requested `walk` and selected authored `Walk:Armature|walking_man|baselayer`.
- Run requested `run` and selected authored `Run:Armature|running|baselayer`.
- Kick entered live `attack` state with `attackType: "kick"` and selected authored `Kick:Armature|Lunge_Spin_Kick|baselayer`.
- Kai's available authored clips also include `Kick:Armature|Step_in_High_Kick|baselayer`.
- Punch does not cross-fallback into an authored Kick clip; when no compatible authored Punch exists, the articulated procedural attack fallback remains authoritative.

The authored Kick exports and Spider Kai base/Walk/Run assets use the same 26-node skeleton naming/order, removing the prior rig-compatibility concern.

## Low-FPS / hitch repair

The visual-certification run exposed a real gameplay issue rather than a test-only failure.

A fresh attack input was previously queued and then aged by the full render-frame delta before its first consumption attempt. On slow headless WebGL frames, the 0.2 second attack buffer could expire immediately. After that was fixed, the next run proved the attack was consumed but could still start and finish between renders because battle simulation advanced by the entire multi-second hitch.

Current repairs:

- Keyboard key-down edges are buffered until a simulation frame can consume them.
- A newly queued attack gets one consumption attempt before its buffer lifetime decays.
- PlayerController clamps simulation delta to 50 ms.
- BattleScene clamps the authoritative battle tick to 50 ms.
- BattlePlayer clamps procedural attack-phase timing to 50 ms.
- OptimizedBeastModel clamps procedural combat animation updates to 50 ms.
- Training battles keep the opponent passive so move certification is deterministic while using the same BattlePlayer, PlayerController, model, and arena stack.

This aligns the previously unbounded battle consumers with the existing 50 ms hitch clamp already used by BattleCamera, OpponentAI, ParticleManager, and Adventure combat.

## Superseded blockers

The 2026-10-07 review is no longer authoritative for the following claims:

- Opponents no longer use the older anatomical placeholder renderer; `Opponent.tsx` now renders through `OptimizedBeastModel`.
- Kai is no longer limited to base/Walk/Run authored clips; compatible authored Kick clips are loaded and selected live.
- Desktop no longer displays the full mobile control overlay by default; `MobileControls` returns nothing unless touch/coarse-pointer capability is detected.
- Fixed-time attack sampling is no longer used for certification; the smoke path waits for live animation-state evidence.

## What is still NOT certified

Passing automation does not by itself approve final presentation.

Fresh rendered evidence is still required for:

- planted feet and root-motion presentation during Walk/Run,
- authored Kick pose quality and contact framing,
- procedural Punch pose quality,
- readable lighting/contrast at desktop and mobile sizes,
- player/opponent scale and camera framing,
- Enforcer encounter presentation,
- approved title/menu/Raging City path,
- final desktop and mobile visual review.

Do not promote PR #285 from Draft solely because Runtime Smoke passes. Runtime animation selection is now proven; final visual presentation still needs explicit rendered review.

# Phase 1B — Mobile Viewport & Touch-Control Smoke Test — 2026-07-17

Branch: `phase1b-production-readiness` (Phase 1B, task C)

**Status: the critical finding below (Adventure Mode has no functional
touch input) is RESOLVED.** See "Update — touch controls implemented" at
the end of this document for the fix, what was and wasn't changed, and
verification evidence. The rest of this document is left as originally
written to preserve the audit trail that led to the fix.

## Method

Built the app, served it with `vite` on localhost, and drove it with
Playwright Chromium under the `iPhone 13` device profile (390×844 viewport,
`hasTouch: true`, `isMobile: true`, real iOS Safari UA) — a real touch
context, not just a resized desktop window. Walked the actual launch
sequence: LoreHub → tap "Play Game" → main menu → tap "Training Arena" →
Adventure Mode. Checked for horizontal overflow at each stage, captured
screenshots, and traced the on-screen touch-control component tree back
through the code to confirm what's actually wired up versus what only
looks wired up.

## CRITICAL — Adventure Mode has no functional touch input at all

This is the most important finding in this audit. **Training Arena, Story
Missions, and Adventure Mode — the actual playable game — cannot be
controlled on a touchscreen device.** A mobile player can load the game,
reach gameplay, and then do nothing: no movement, no attacks, no dodge.
The only on-screen text is a keyboard-only control hint bar ("WASD move |
J attack | K heavy | L skill | Space dodge | Esc pause"), which is
meaningless with no physical keyboard.

Screenshot: `04-adventure-mobile-controls.png` (attached in this session,
not committed to the repo — see below) shows the player capsule fallback
and the keyboard-hint bar with zero touch buttons anywhere on screen.

Root cause, traced through the code: there are **three separate,
mutually-incompatible touch-input implementations** in the codebase, and
none of them are correctly connected to Adventure Mode:

1. **`MobileControls.tsx`** — rendered in the JSX tree for `adventure`,
   `story-mode`, and the battle-canvas branches in `App.tsx`. But its very
   first line of logic is `if (battlePhase !== 'fighting') return null;`,
   reading `battlePhase` from `useBattle` — the old arcade Versus-mode
   store. Adventure Mode never touches `useBattle` at all (it uses
   `useAdventure`), so `battlePhase` is never `'fighting'` there and this
   component always renders `null` in Adventure/Story mode. It would only
   ever appear during a Versus battle, and even there only once
   `battlePhase` happens to be `'fighting'`.
2. **`TouchControls.tsx`** — not imported anywhere in the app (confirmed
   via grep — self-references only). Its internal logic calls
   `useRunner().movePlayer`, `jumpPlayer`, `slidePlayer`, `attackEnemy`,
   `setWebButtonPressed`, `chargeWebKick`, `player.webAttached`,
   `player.energyMeter`, etc. — **none of these exist on the current
   `useRunner` store** (`apps/web/src/lib/stores/useRunner.ts`'s actual
   `RunnerState` only has `gameState`, `selectedCharacter`,
   `activeStoryMissionId`, `trainingSession`, profile data, and their
   setters). This component was written for an earlier, different game
   concept (an endless-runner with web-swinging and energy blasts) and
   would not compile against the current store if it were ever imported.
   Confirmed dead, incompatible code — same pattern as `NexusHaven.tsx`
   and the default export of `LoadingScreen.tsx` found in the Task A/B
   audits.
3. **`useTouchInput.ts`** — a Zustand store with `joystickX`, `joystickY`,
   `isJoystickActive`, `pendingAttacks`, and setters
   (`setJoystick`, `queueAttack`, `setIsTouchDevice`). This one **is**
   correctly read by the real, current Adventure Mode player controller
   (`AdventurePlayerController.tsx`). But grepping the entire codebase for
   calls to `setJoystick`, `queueAttack`, or `setIsTouchDevice` finds only
   their own definitions in `useTouchInput.ts` — **nothing anywhere ever
   calls them.** There is no UI component that writes into this store, so
   it permanently holds its default zero/empty state on every device,
   mobile or desktop. This is the one piece of the puzzle that's actually
   correctly positioned in the current architecture — it's just missing
   the on-screen joystick/button UI that should be driving it.

**Not fixed in this pass.** Building real touch controls means writing a
new UI component that renders an on-screen joystick and attack buttons and
calls `useTouchInput`'s existing setters, then rendering it in place of
the broken `MobileControls` in the `adventure` and `story-mode` branches
of `App.tsx`. That's real feature work touching the core input path for
two game modes, not a minimal CSS/string fix — flagging for a scoped
follow-up task rather than building it inline here. `useTouchInput.ts`
and `AdventurePlayerController.tsx` are ready and waiting for it; nothing
else needs to change on the read side.

## Fixed in this pass

**LoreHub top nav overlapped at mobile width.** At 390px, the "KAI-JAX"
logo, an always-visible "Exit to Menu" text button, and the mobile
hamburger toggle were all packed into one row with no responsive hiding,
causing visible text-over-text overlap on the very first screen (see
`01-lore-hub.png` vs `05-lore-hub-nav-fixed.png`). Fixed by hiding the
"Exit to Menu" button on mobile (`hidden md:inline-flex`, matching the
pattern already used for the desktop section-nav links) and adding an
equivalent entry to the existing mobile dropdown menu so the exit action
isn't lost, just relocated.

## Also observed, not fixed — needs a follow-up decision

- **"Play Game" CTA tap target measured 103.8×28px** (via Playwright
  `boundingBox()`), well under the ~44×44pt minimum Apple/Google
  accessibility guidance recommends for a primary call-to-action. Given
  `py-4 px-8` in the source should produce roughly double that height,
  this may point to a broader Tailwind spacing/sizing issue rather than
  something specific to this one button.
- **The hero CTA row's buttons (Play Game / Meet the Heroes / Read the
  Saga / 9 Tails / Combat) render with no visible gap between them** at
  mobile width — their borders appear to touch directly rather than
  showing the `gap-3` spacing declared in the flex container. This repo
  has prior commits specifically fixing Tailwind v4 migration issues
  ("use Tailwind v4 PostCSS plugin," "remove Tailwind v4 unknown border
  apply"), so this could be a lingering piece of the same class of
  problem. Didn't attempt a fix here — a spacing utility issue affecting
  one flex row could easily be symptomatic of something wider, and
  poking at it blindly risks a regression elsewhere. Worth a dedicated
  pass rather than a guess.

## Confirmed working

- **No horizontal overflow anywhere in the flow checked**
  (`scrollWidth === clientWidth === 390` at LoreHub, main menu, and
  Adventure Mode) — the viewport meta tag and overall page layout are
  sound at phone width.
- **Zero console/page errors** through the entire LoreHub → main menu →
  Training Arena flow on the emulated touch device.
- **Pause overlay and StoryAdventure briefing buttons** (`AdventureHUD`'s
  Resume/Force-Quit, and the "Engage Mission"/"Back to Campaign" buttons
  added in the Task A route audit) use `w-48`/`w-56` fixed widths with
  `py-3`/`py-4` padding — comfortably touch-sized by inspection; not
  independently re-screenshotted in this pass since Adventure Mode can't
  currently be driven far enough by touch to reach them interactively.

## Summary

One critical, blocking finding (Adventure Mode is unplayable by touch —
the actual core gameplay loop, not a side screen) and one real layout bug
fixed (mobile nav overlap on the landing page). Two smaller CSS findings
documented for a follow-up decision rather than guessed at. This is very
much a "smoke test found smoke" result — recommend treating the touch-input
gap as a release blocker for any mobile/Capacitor build of `v0.1.0-mvp`.

## Update — touch controls implemented

New component: `apps/web/src/components/game/adventure/AdventureTouchControls.tsx`.
It is the only UI in the codebase that writes into `useTouchInput` — the
store `AdventurePlayerController.tsx` already read every frame but nothing
ever drove. No new combat mechanics: every control maps 1:1 to an action
`AdventurePlayerController` already handles from the keyboard.

**What's on screen:** a joystick (movement), three attack buttons (ATK =
light attack/"attack", HEAVY = "heavy", SKILL = "skill" — all three exist
as real, already-wired keyboard actions: J/X, K/Z, L/C), a DODGE button
(Space), and a small pause button (Esc/P — Adventure Mode had no way at
all for a touch user to reach the pause menu before this, since it's
keyboard-only). **Jump and interact are intentionally not present** —
neither exists anywhere in `AdventurePlayerController.tsx`'s actual input
handling for Adventure Mode, so adding them would have been inventing new
actions, not exposing existing ones.

**Wiring:** replaced `<MobileControls />` with `<AdventureTouchControls />`
in exactly the two Adventure Mode branches of `App.tsx` (`gameState ===
'adventure'` and `gameState === 'story-mode'`). `MobileControls.tsx` itself
and its third usage site (the Versus-mode battle-canvas branch) are
untouched — that component is still potentially valid there, this fix did
not touch or refactor the Versus/Battle input system.

**Dead code disposition:** `TouchControls.tsx` — proven both unreachable
(zero imports anywhere) and incompatible (calls `useRunner` properties
that don't exist on the current store, confirmed by `tsc`) — was
quarantined with a prominent top-of-file comment explaining both proofs,
rather than deleted, per instruction not to remove code merely because it
looks old.

**Input safety (no stuck movement):** each control tracks its own touch
`identifier` so a drag on the joystick and a tap on an attack button don't
interfere with each other. Every control releases on `touchend` and
`touchcancel`. The whole control set additionally releases on component
unmount and on `document.visibilitychange` (a backgrounded tab may never
deliver `touchend` for an in-progress gesture). While `useAdventure`'s
`isPaused` is true, the interactive layer unmounts entirely — this both
keeps it from sitting under the pause overlay and forces every control's
own unmount cleanup to run, so resuming always starts from a clean,
neutral state.

**UI:** only renders when `isTouchDevice()` (existing utility, reused,
not reimplemented) is true — nothing renders or attaches listeners on
desktop. Positioned with `env(safe-area-inset-*)` insets; added
`viewport-fit=cover` to `index.html`'s viewport meta tag since those
insets silently resolve to 0 on iOS without it. Also hid
`AdventureHUD`'s keyboard-only control hint bar ("WASD move | J attack |
...") on touch devices, since showing keyboard instructions to a
touch-only player was actively misleading.

### Verification

Added `apps/web/src/lib/stores/useTouchInput.test.ts` — 8 focused Vitest
cases covering `setJoystick`/`releaseJoystick`/`queueAttack`/
`consumeAttacks` press-release-reset behavior (including that
`consumeAttacks` drains exactly once and never replays stale actions).
Part of the `pnpm -C apps/web test` suite; 76/76 tests passing.

Ran a scripted Playwright pass (iPhone 13 profile, real multi-touch
`TouchEvent`s with explicit identifiers dispatched directly at each
control, not just `page.tap()`) through the full Adventure Mode touch
flow. All 14 checks passed, zero console errors:

```text
[PASS] all touch controls rendered
[PASS] all controls within viewport bounds (no offscreen clipping)
[PASS] joystick drag updates knob transform — translate(30px, -20px)
[PASS] attack button triggers ATTACKING combat state while joystick still held
[PASS] joystick remains active during simultaneous attack tap (multi-touch does not block movement) — translate(30px, -20px)
[PASS] touchcancel releases joystick (no stuck movement) — translate(0px, 0px)
[PASS] tapping pause button opens PAUSED overlay
[PASS] touch controls hide while paused (do not cover pause menu)
[PASS] resume closes pause overlay
[PASS] touch controls reappear after resume
[PASS] joystick starts neutral after resume/remount (no carried-over stuck input) — translate(0px, 0px)
[PASS] force quit returns to LoreHub
[PASS] adventure mode + touch controls re-enter cleanly after force quit
[PASS] joystick starts neutral on fresh entry (no stuck state across route exit) — translate(0px, 0px)

14/14 checks passed.
```

This covers movement, simultaneous movement + attack, pause, resume,
force quit, and no stuck input after `touchcancel` or a full route exit
(force-quit out of Adventure Mode and back in) — the specific scenarios
called for. The verification script itself lives outside the repo
(`/tmp` scratch space for this session, not committed) since it's an
ad-hoc Playwright driver, not part of this project's test suite or CI —
adding Playwright as a project dependency/CI fixture was out of scope for
this pass.

### Honest remaining limitations

- **Layout is corner-anchored, not orientation-specific.** Unlike the old
  `MobileControls.tsx`, which had fully separate portrait/landscape JSX,
  this component uses one safe-area-aware layout for both orientations.
  It was visually verified in portrait (390×844) only in this pass —
  landscape hasn't been screenshotted. The positioning math (percentage/
  corner-anchored, not hardcoded pixel assumptions) should hold up, but
  "should hold up" isn't the same as verified.
- **Button placement is a first pass, not a playtested layout.** Sizes
  clear the 44×44 minimum and screenshot-verified to avoid the HP/
  stamina/wave/enemy HUD panels, but real-thumb ergonomics (reach,
  overlap with the player's own hand) haven't been playtested on a
  physical device.
- **The two smaller findings from the original audit above (small "Play
  Game" CTA tap target, missing gap in the LoreHub hero button row) are
  still open** — unrelated to Adventure Mode input, not touched in this
  pass.
- **Noticed in passing, not caused by or fixed in this change:** the
  pause overlay's "Resume" / "Force Quit to Hub" buttons render with
  plain/unstyled button chrome in this environment rather than the cyan/
  red rounded styling their Tailwind classes specify (visible in
  `touch-04-paused.png`). Functionally unaffected — both buttons worked
  correctly in every automated pass — but flagging since it's the same
  general category as the Tailwind spacing issues noted above.
- Desktop keyboard/gamepad play was not re-tested end-to-end after this
  change; `AdventurePlayerController.tsx`'s keyboard-reading code path
  was not modified at all (only additive touch state was ever read
  there), so regression risk is low, but this is a statement of what was
  and wasn't re-verified, not a guarantee.

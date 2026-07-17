# Phase 1B — Mobile Viewport & Touch-Control Smoke Test — 2026-07-17

Branch: `phase1b-production-readiness` (Phase 1B, task C)

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

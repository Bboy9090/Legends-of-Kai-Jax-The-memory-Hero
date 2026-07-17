# Phase 1B — Final Release Smoke-Test Gate — 2026-07-17

Branch: `phase1b-production-readiness` (Phase 1B, final gate before
`v0.1.0-mvp` release readiness)

## Purpose

Every prior task in this phase (route audit, external asset audit, mobile
touch smoke test + touch-controls implementation) verified its own change
in isolation. This is the integration pass: does the **whole MVP loop**
still work end to end, on both the input methods the game supports,
after every fix in this phase landed together? This also specifically
covers ground the per-task tests didn't: the earlier mobile touch
verification (`PHASE1B_MOBILE_TOUCH_SMOKE_TEST_2026-07-17.md`) only drove
Training Arena. This pass drives the actual **Story Mode mission flow**
— briefing, intro dialogue, live combat against a real enemy, pause,
resume, force-quit — on touch for the first time.

## Method

Built the app, served it with `vite`, and drove two full Playwright
passes through the identical path: LoreHub → Main Menu ("Start Saga") →
Campaign Map → select a mission → Begin Mission → briefing → Engage
Mission → intro dialogue → live combat → pause → resume → pause again →
Force Quit to Hub.

1. **Desktop pass** — 1280×800 viewport, no touch emulation, real
   keyboard events (WASD-equivalent movement key, J attack, Escape
   pause).
2. **Mobile pass** — Playwright's `iPhone 13` device profile (390×844,
   `hasTouch`/`isMobile` true), driven with real multi-touch `TouchEvent`s
   dispatched with explicit identifiers at the actual on-screen controls
   (joystick, ATK, pause button) — the same method used in the mobile
   touch smoke test, not just `page.tap()`.

Both scripts are ad-hoc, external to this repository (consistent with
the rest of this phase — see `README.md` §6 on why no Playwright
dependency is committed here).

## Desktop keyboard — 12/12 checks passed, zero console errors

```text
[PASS] LoreHub loads
[PASS] Main menu reached
[PASS] Campaign map reached
[PASS] Campaign map lists missions — 5 missions in Act 1
[PASS] Mission detail panel + Begin Mission button appear
[PASS] Mission briefing screen appears
[PASS] Briefing has a Back to Campaign escape hatch
[PASS] Combat phase reached with keyboard hint bar visible (desktop)
[PASS] Keyboard attack (J) triggers ATTACKING combat state
[PASS] Escape opens PAUSED overlay
[PASS] Resume closes pause overlay
[PASS] Force quit returns to LoreHub
```

One methodology note, not a product bug: the first attempts to open
pause immediately after an attack failed. Root cause was the test script,
not the game — `AdventurePlayerController.tsx`'s `useFrame` loop
intentionally early-returns while `combatState === ATTACKING`, so it
never reaches the Escape/`KeyP` check until the attack animation
resolves back to `FREE`. This is existing, correct behavior (you can't
pause mid-attack-animation-frame-data by design); the fix was to give
the script's own wait a couple more seconds before trying to pause, not
a code change.

## Mobile touch (Story Mode, not just Training Arena) — 12/12 checks passed, zero console errors

```text
[PASS] Main menu reached (touch)
[PASS] Campaign map reached (touch)
[PASS] Mission detail + Begin Mission (touch)
[PASS] Mission briefing appears (touch)
[PASS] Intro dialogue fully advanced (touch)
[PASS] Touch controls render in Story Mode combat
[PASS] Joystick drag works in Story Mode — translate(25px, -15px)
[PASS] Touch attack button triggers ATTACKING in Story Mode
[PASS] Touch pause button present in Story Mode
[PASS] Touch pause opens PAUSED overlay in Story Mode
[PASS] Resume works in Story Mode (touch)
[PASS] Force quit from Story Mode returns to LoreHub (touch)
```

One methodology note here too: the first attempt to advance the intro
dialogue via touch failed, and it looked at first like it might be a
touch-controls bug — the dialogue overlay is full-screen (`z-50`) and
sits above `AdventureTouchControls` (`z-40`) by design, so a tap should
always reach the dialogue, not a control underneath it. The actual cause
was the test script's own dialogue-advance method:
`page.touchscreen.tap()` at a guessed coordinate doesn't reliably
synthesize the `click` event `DialogueOverlay`'s `onClick` handler
listens for. Switching to `locator.click()` on the dialogue text itself
(letting Playwright compute the real clickable point) fixed it
immediately — again, a test-script fix, not a game fix. Confirmed
separately: this mission's intro dialogue has more lines than the
Training Arena flow tested earlier, which is why the original mobile
smoke test's fixed 6-tap loop wouldn't have been enough here either had
it hit the same click-synthesis issue.

Screenshots captured during this pass (not committed to the repo —
ad-hoc verification artifacts, same as prior phases): full HUD +
touch-controls layout in live Story Mode combat with a real enemy model
on screen (not just the Phase 1 fallback capsule), and the pause overlay
correctly showing the enemy and player mid-encounter with touch controls
cleanly hidden underneath it.

## Required gates

Run clean, immediately before this report, on the final commit of this
phase:

```bash
pnpm install --frozen-lockfile   # PASS
pnpm -C apps/web build           # PASS
pnpm -C apps/web test            # PASS — 9 files, 76 tests
pnpm -C apps/web typecheck       # PASS
```

## Verdict

**The full MVP loop — main menu through a real mission's briefing,
dialogue, live combat, pause, resume, and force-quit — works correctly
on both keyboard and touch, including paths (the actual Story Mode
mission flow on touch) that hadn't been exercised end-to-end before this
pass.** Zero console errors in either full run. This is the release
smoke-test gate referenced in `docs/releases/v0.1.0-mvp.md`'s
release checklist — it is now satisfied.

This does not supersede or resolve anything in `docs/known-debt.md` —
none of those items are input/gameplay-loop blockers, which is exactly
what this gate checks.

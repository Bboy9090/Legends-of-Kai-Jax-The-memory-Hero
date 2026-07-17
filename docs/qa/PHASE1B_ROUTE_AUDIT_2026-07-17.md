# Phase 1B — Route & Interactive Control Audit — 2026-07-17

Branch: `phase1b-production-readiness` (Phase 1B, task A: route dead-end audit)

## Scope

Every interactive control reachable from `MainMenu` (`LegendaryMainMenu.tsx`),
`LoreHub.tsx`, the mission-select hub (`CampaignMap.tsx` — the app has no
component literally named `MissionSelectHub`; this is the screen that plays
that role), `StoryAdventure.tsx`, the pause flow, the quit flow, and
back-navigation across those screens.

Method: traced the full `gameState` transition graph from
`apps/web/src/lib/stores/useRunner.ts` and `App.tsx` (every `setGameState`
call site, every conditional render branch), then read each screen's control
handlers directly. No redesigns were made — only minimal, targeted fixes to
confirmed-broken controls.

## Classification Key

`WORKS` / `BROKEN` / `DEAD END` / `PLACEHOLDER SAFE` / `HIDE FOR MVP` / `PATCH NOW`

## Findings

### PATCH NOW (fixed in this pass)

| Control | File | Problem | Fix |
|---|---|---|---|
| Profile card click, profile-select modal | `LegendaryMainMenu.tsx` | Called `switchProfile(i)` then `navigate('/campaign-map')` via `react-router-dom`. The app has no `<Routes>`/`<Route>` anywhere (`main.tsx` only wraps in a bare `<BrowserRouter>`) — the whole app is driven by `useRunner`'s `gameState`, not routes. `navigate()` silently changed the URL and did nothing visible; the modal never closed. Selecting any profile permanently stranded the player on the profile-select overlay. | Removed the dead `useNavigate` import/call. Selecting a profile now calls `setGameState('campaign-map')` and `setShowProfileSelect(false)`, matching how every other transition in the app works. |
| "Mission: First Blood" / "Combat Kernel" buttons | `LoreHub.tsx` hero section | Plain `<a href="/mission-demo.html">` and `<a href="/combat-demo.html">`. Neither file exists anywhere under `apps/web/public`. Both were guaranteed 404s, sitting in the primary CTA row of the landing page — the first thing a new player sees. | Removed both dead links. `Play Game`, `Meet the Heroes`, `Read the Saga`, `9 Tails`, and `Combat` (all working, state-driven) remain. |
| Mission briefing has no cancel path | `StoryAdventure.tsx` `MissionBriefing` | `StoryAdventure` already received a working `onBack` prop from `App.tsx` (`() => setGameState('campaign-map')`), but it was only ever called from the "mission not found" fallback. The briefing modal — the very first screen after picking a mission from the campaign map — had only an "Engage Mission" button. The only way out of a wrongly-picked mission was ESC → pause → "Force Quit to Hub," which drops the player all the way to the lore hub, not back to the mission list. | Added a "← Back to Campaign" button to `MissionBriefing`, wired to the existing `onBack` prop. No new state, no new plumbing — the callback was already there and correct. |
| Duplicate store file | `apps/web/src/lib/stores/useRunner.tsx` (deleted) | A second file with the *same base name* as the real store (`useRunner.ts`), differing only in extension, exported a completely different and incompatible `GameState` union (`"paused"`, `"game-over"`, `"nexus-haven"`, `"squad-select"`, etc. — none of which `App.tsx` renders). Every `import ... from "../stores/useRunner"` in the app currently resolves to the real `.ts` file only because `vite.config.ts` happens to list `.ts` before `.tsx` in `resolve.extensions`. Any future reordering of that list, or any import written with an explicit `.tsx` extension, would silently swap the active game-state machine for the entire app to a version App.tsx doesn't know how to render — a blank screen with no error. | Deleted the dead file. It was a pure duplicate: 0 imports referenced it anywhere in the codebase. |

### WORKS (verified, untouched)

- **Mission-select hub (`CampaignMap.tsx`)**: Back to Menu, Act 1/2/3 tabs, mission list (locked/unlocked/completed states), mission detail panel, "Begin Mission" — all correctly wired through `setGameState`/`useMissions`/`useRunner`.
- **Pause / Resume / Quit (`AdventureHUD.tsx`)**: already hardened in Phase 1A. Resume, "Force Quit to Hub" (with `onPointerDown` + `onClick` belt-and-suspenders, a persisted-state override, and a `window.location.assign("/")` fallback), and the emergency `Q` key while paused all work as designed. No changes made.
- **StoryAdventure results flow**: both success and failure paths correctly call `onComplete(success)` → `setGameState('campaign-map')`, with mission completion recorded on success.
- **LoreHub**: section nav (home/characters/tails/story/combat/shards), mobile menu, "Exit to Menu," "Play Game" — all local-state or `setGameState`-driven, all correct.
- **SettingsMenu**: "Back" button and audio mute toggle both work correctly.
- Every currently-unreachable screen's own internal "back to menu" button (see DEAD END below) is itself correctly wired — safe to leave in place if one of those screens is ever given a real entry point later.

### DEAD END (unreachable — declared/rendered but nothing ever transitions into them; no user-facing symptom today, left as-is per "no redesign")

- `gameState: "district-select"` → `DistrictSelectScreen.tsx` — rendered in `App.tsx`, has working internal Back/Enter buttons, but no menu control anywhere sets this state.
- `gameState: "beast-preview"` → `BeastPreview.tsx` — same pattern; unreachable.
- `gameState: "customization"` → `CustomizationMenu.tsx` — same pattern; unreachable.
- `gameState: "mission-select"` — declared in the `GameState` union, never set, never rendered in `App.tsx`. Fully vestigial.
- `NexusHaven.tsx` — not imported by `App.tsx` or anything reachable. Internally calls `setGameState("character-select")` (valid) and `setGameState("squad-select")` (not a valid `GameState` value at all) — a landmine only if someone wires this component up later without checking it first.
- `SagaModeLauncher` — exists in triplicate (`components/ui/SagaModeLauncher.tsx`, `components/ui/SagaModeLauncher.jsx`, `components/SagaModeLauncher.jsx`), none imported anywhere. Uses the same `react-router-dom` `useNavigate()` pattern that was broken in `LegendaryMainMenu.tsx`; would need the same fix if ever revived.

### PLACEHOLDER SAFE (functions, but doesn't do everything it visually implies — no crash risk, left as-is)

- `SettingsMenu.tsx` quality selector (Low/Medium/High): local `useState` only, visually responds to clicks, never wired to the actual renderer's `getQualitySettings()` output used in `App.tsx`. Harmless — just inert.
- `StoryAdventure.tsx` `WaveTransition`'s `onContinue` prop is passed as a no-op (`() => {}`); the actual wave-advance timing is driven correctly by a separate `setTimeout` in `StoryAdventure`'s own effect. Redundant internal wiring, not a user-facing bug.
- Privacy Policy / Terms of Service links (`LegendaryMainMenu.tsx`, `SettingsMenu.tsx`) open `https://legendsofkaijax.com/privacy` and `/terms` in a new tab. Not verified live from this environment; external links can't break the app even if the domain isn't serving those paths yet. Worth a manual check before store submission, not blocking.

### HIDE FOR MVP

None beyond the two dead links already removed above — no other control was found that works today but should be hidden for launch.

### BROKEN (none remaining)

All confirmed-broken controls found in this pass are listed under PATCH NOW above and have been fixed.

## Summary

4 real production bugs found and fixed with minimal, targeted diffs:
1. Profile selection permanently stranding the player in a modal.
2. Two guaranteed-404 links in the landing page's primary CTA row.
3. No way to back out of a wrong mission pick short of an emergency quit-to-hub.
4. A dead duplicate store file that was one Vite config change away from silently breaking every screen transition in the game.

No systems were redesigned. Everything classified DEAD END or PLACEHOLDER SAFE
is currently harmless and was left untouched, since none of it is reachable
by or visible to a player today.

# Known Debt — Legends of Kai-Jax

Consolidated tracker for issues found during the Phase 1B production-readiness
pass that are real but out of scope for the task that found them — either
because fixing them would exceed that task's minimal-change mandate, or
because they need a decision (asset sourcing, CI ownership) rather than a
code fix. Nothing here is fixed by the existence of this document; it's a
map, not a resolution.

Each item links back to the QA doc that found it, where one exists, for full
context and evidence.

---

## CI / build process

### CI's "Test" step never runs the real test suite

`.github/workflows/ci.yml` runs `pnpm test` at the repo root. Root
`package.json`'s `test` script is a placeholder:
`"echo 'Testing...' && node -e \"console.log('✅ Node.js ready')\""`. It
always passes and exercises nothing. The real suite (`pnpm -C apps/web
test`, Vitest, 76 tests as of this writing) has never been run by this CI
workflow. **This means CI has been reporting a passing "Test" step with no
actual test coverage since whenever this workflow was written.**

Fix is a one-line change to `ci.yml` (`pnpm test` → `pnpm -C apps/web
test`) but is a CI file change, out of scope for the doc/QA tasks that
found it. Flagging as the highest-priority item in this document — it's a
false-confidence signal, not a cosmetic gap.

### CI's pnpm version doesn't match the repo's pinned version

`ci.yml` installs pnpm via `pnpm/action-setup@v2` with `version: 8`. The
repo's `package.json` pins `"packageManager": "pnpm@9.15.9"`, and that's
the version this whole Phase 1B pass was verified against (see
`docs/GETTING_STARTED.md`, this repo's `README.md`). `deploy.yml`
separately and correctly uses `pnpm/action-setup@v4` with `version:
9.15.9`. The two workflows are inconsistent with each other and with the
repo's own pin.

### `apps/web/vite.config.ts` doesn't alias `@beast-kin/ui`

`apps/web/package.json` depends on `@beast-kin/characters`,
`@beast-kin/engine`, `@beast-kin/shared`, and `@beast-kin/ui` (all
`workspace:*`). `vite.config.ts`'s `resolve.alias` only maps the first
three to their `packages/*/src` paths; `@beast-kin/ui` has no alias.
This hasn't caused an observed build failure (`pnpm -C apps/web build`
passes throughout this document's history), which suggests either nothing
currently imports from `@beast-kin/ui`, or pnpm's workspace symlinking
resolves it well enough without an explicit alias. Not confirmed either
way — flagging as an inconsistency worth a deliberate look rather than an
assumption.

---

## Broken script references

Both found while writing `README.md` (verified by checking each script's
target actually exists before documenting it):

- **`pnpm validate:canon`** (root) → `node validate-canon.mjs`. That file
  does not exist at the repo root.
- **`pnpm validate:memory`** (root) → `node validate-memory-layers.mjs`.
  Also does not exist at the repo root.
- **`pnpm mobile:dev` / `pnpm mobile:build`** (root) → both point at
  `apps/mobile`, which does not exist anywhere in this repository (the
  mobile targets are Capacitor-wrapped `apps/web`, not a separate
  workspace).

None of these are called by any other script, CI workflow, or app code —
they're dead entries in root `package.json`'s `scripts` block. Low risk,
but will confuse the next person who tries to run them.

---

## Dead / quarantined code

Full detail: `docs/qa/PHASE1B_ROUTE_AUDIT_2026-07-17.md` and
`docs/qa/PHASE1B_MOBILE_TOUCH_SMOKE_TEST_2026-07-17.md`.

- **`apps/web/src/components/game/TouchControls.tsx`** — quarantined with
  a top-of-file notice (not deleted, per instruction not to remove code
  merely because it looks old). Proven unreachable (unimported) and
  proven incompatible (references `useRunner` properties that don't exist
  on the current store). Safe to delete once someone confirms nothing
  external depends on it.
- **`apps/web/src/components/game/world/NexusHaven.tsx`** — not imported
  anywhere; calls `setGameState()` with values (`"squad-select"`) that
  aren't valid on the current `useRunner` store.
- **`SagaModeLauncher`, in triplicate** —
  `apps/web/src/components/ui/SagaModeLauncher.tsx`,
  `apps/web/src/components/ui/SagaModeLauncher.jsx`, and
  `apps/web/src/components/SagaModeLauncher.jsx`. None imported anywhere.
  Uses the same broken `react-router-dom` `useNavigate()` pattern that was
  fixed in `LegendaryMainMenu.tsx` (this app has no `<Routes>`) — would
  need the same fix if ever revived, on top of not being wired to
  anything currently.
- **`LoadingScreen.tsx`'s default export** (distinct from `GameIntro`, the
  named export that's actually used) — hardcodes a background image URL
  at `https://replit.com/api/v1/projects/self/assets/...`, a
  Replit-session-relative path that would never resolve outside the
  session it was authored in. Not imported anywhere; zero runtime impact,
  but a landmine if someone wires this component up later without
  checking it first.
- **`apps/web/src/debug/RegistryDebugOverlay.ts`** — a complete, working
  debug overlay (`` ` `` key toggle, `window.registryDebug` console API)
  whose install function, `installRegistryDebugOverlay()`, is never
  called anywhere. Present in source, dormant at runtime. Either wire it
  up (cheap — one call site) or remove it; leaving it half-built is the
  only bad option.

---

## Unreachable screens & vestigial state

From `docs/qa/PHASE1B_ROUTE_AUDIT_2026-07-17.md`. No user-facing symptom
today since none of these are reachable, but worth cleaning up or wiring
in deliberately rather than leaving ambiguous:

- `gameState: "district-select"` → `DistrictSelectScreen.tsx` — rendered
  in `App.tsx`, has working internal navigation, but nothing ever
  transitions into it.
- `gameState: "beast-preview"` → `BeastPreview.tsx` — same pattern.
- `gameState: "customization"` → `CustomizationMenu.tsx` — same pattern.
- `gameState: "mission-select"` — declared in the `GameState` union type,
  never set, never rendered in `App.tsx`. Fully vestigial.

---

## Mobile / UI spacing (Tailwind)

Neither of these caused a usability failure in verification — both are
cosmetic, recorded here per instruction rather than fixed blind. Full
detail: `docs/qa/PHASE1B_MOBILE_TOUCH_SMOKE_TEST_2026-07-17.md`.

- **LoreHub's "Play Game" CTA measured a 103.8×28px tap target** via
  Playwright `boundingBox()` on a real iPhone-width viewport — below the
  ~44×44pt accessibility minimum. The source has `px-8 py-4`, which
  should produce roughly double that height, so this may be symptomatic
  of a wider spacing issue rather than specific to this one button.
- **LoreHub's hero CTA button row (Play Game / Meet the Heroes / Read the
  Saga / 9 Tails / Combat) shows no visible gap between buttons** at
  mobile width, despite `gap-3` in the flex container. This repo has
  prior commits specifically fixing Tailwind v4 migration issues ("use
  Tailwind v4 PostCSS plugin," "remove Tailwind v4 unknown border
  apply"), so this could be a lingering piece of the same class of
  problem rather than an isolated bug.

Also noticed, same category, not yet root-caused: the Adventure Mode
pause overlay's "Resume" / "Force Quit to Hub" buttons render with plain/
unstyled button chrome instead of their intended cyan/red rounded
styling (visible in the touch-controls verification screenshots). Both
buttons work correctly — this is styling-only.

**Recommendation:** these three data points (two confirmed spacing/sizing
misses plus one styling miss, all Tailwind-related) are enough to warrant
one dedicated investigation pass rather than three separate blind
guesses. Possible root cause not yet checked: whether `tailwind.config.ts`
and the PostCSS pipeline are fully consistent after the v4 migration
across every component, or whether some components are still picking up
stale/partial styles.

---

## Asset / art placeholders

Full detail: `docs/qa/PHASE1B_EXTERNAL_ASSET_AUDIT_2026-07-17.md`.

Two of LoreHub's six character/gallery images
(`F5ACDADF-FD25-4E9D-ACF2-658700CB2C84.png`, covering 4 of 5 character
cards plus the "Full Cast" gallery image, and `IMG_2623.png`, the
"Kai-Jax: The Protector" gallery image) have no local source file
anywhere in this repository. They currently render the app's branded
`/icon.svg` as a placeholder (with `onError` fallback wired for all
LoreHub images) rather than either the original fragile external URL or
invented replacement art. Needs an actual asset-sourcing decision:
locate/re-export the originals, or commission/generate replacements.

The PWA manifest (`apps/web/public/manifest.json`) also references two
screenshot files (`/screenshots/gameplay-1.png`,
`/screenshots/saga-mode.png`) that don't exist under `apps/web/public/`,
and two app shortcuts (`/saga-mode`, `/versus-mode`) that don't
correspond to real routes, since the app has no URL-based router at all.
Both are inert (don't break anything), not fixed here.

---

## TypeScript debt

`pnpm -C apps/web typecheck` (the Phase 0-scoped gate everything in this
document was verified against) only checks a small, curated file list —
see `apps/web/tsconfig.phase0.json`'s `include`. The unscoped
`pnpm -C apps/web typecheck:full` currently reports pre-existing errors,
including:

- All of the dead/quarantined files listed above under
  [Dead / quarantined code](#dead--quarantined-code) — expected, since
  they reference APIs that don't exist on current stores.
- At least one live-file issue: `apps/web/src/components/game/LoreHub.tsx`
  has a `No overload matches this call` error (TS2769) on an icon
  component's `style` prop, pre-dating this Phase 1B pass.

No count or full list is asserted here — running `typecheck:full` and
triaging real vs. dead-code-only errors would be its own task.

---

## Native packaging verification gaps

From `README.md`'s Project Overview — repeated here since it's debt, not
just a status note:

- **Android:** CI-configured (`.github/workflows/android-build.yml`)
  but only triggers on push to `main` or
  `integration/clean-upgrade-stack-2026-05-20`, not on this branch. No
  recent successful APK artifact confirmed from this session.
- **iOS (Capacitor):** build pipeline documented
  (`docs/ios/APP_STORE_BUILD.md`, `.xcodecloud/ci_post_clone.sh`), native
  project committed (`apps/web/ios/App`), but no signed build or App
  Store submission proven.
- **iOS (native engine):** `apps/ios/LegendsOfKaiJax`'s integration
  status with the rest of the game is unestablished.
- **Desktop (Electron):** build scripts are complete
  (`apps/desktop/package.json`) but not exercised in this session — no
  packaged build has been produced and run.

---

## PWA / offline

`apps/web/index.html` has its service-worker registration block commented
out ("Service Worker disabled for development... Uncomment for production
PWA deployment"). The manifest (`manifest.json`) is present and correct,
but installing the app today does not currently provide working offline
support. Re-enabling is a one-line uncomment, but should come with an
actual verification pass (install, go offline, confirm it still loads)
rather than just flipping the comment.

---

## Summary / suggested priority

1. **CI test gap** (`pnpm test` at root is a no-op) — highest priority,
   it's a false-confidence signal about a config nobody's been told
   about.
2. **CI pnpm version mismatch** (`ci.yml` uses 8, repo pins 9.15.9) —
   quick fix, prevents future drift confusion.
3. **Tailwind spacing investigation** (3 related data points) — worth one
   focused pass rather than three individual patches.
4. Everything else in this document is lower urgency: dead code cleanup,
   unreachable-screen decisions, asset sourcing, and native-packaging
   verification are all real but don't block the current web MVP from
   being correct and playable.

# Phase 1B — External Asset Dependency Audit — 2026-07-17

Branch: `phase1b-production-readiness` (Phase 1B, task B)

## Scope

Every runtime dependency on a third-party host for a resource the app needs
to render or load: images, fonts, models, sounds, and outbound links.
Method: grepped `apps/web/src`, `data/`, `apps/web/public`, and `index.html`
for `http(s)://` and protocol-relative references, then traced each hit to
confirm whether the containing component is actually reachable from the
live `gameState` graph (per the Task A route audit) before judging severity.

## Findings

### CRITICAL — live, first-screen risk

**`LoreHub.tsx`** hosts its entire visual identity — the hero character
art, all 5 character portraits, and all 6 gallery images — on
`https://customer-assets.emergentagent.com/job_348bda30-a69b-42b3-97e5-cdbb7108b93b/artifacts/...`.

This is a job-scoped artifact URL from an AI coding tool's temporary asset
store, not a production CDN. `LoreHub` is not some deep, rarely-hit screen —
`gameState: "lore-hub"` is the **default initial state** in
`useRunner.ts`, so this is the first thing every new player sees. If that
job-scoped host ever expires, rate-limits, or is cleaned up, the landing
page loses all of its character art with no fallback (broken `<img>` icons).

6 unique URLs, used in `HERO_IMAGE`, `CHARACTERS[]`, and `GALLERY_IMAGES[]`:

| File referenced | Local original in `attached_assets/`? |
|---|---|
| `9660FF22-E010-4DF5-A321-DDFE60ADB8CB.png` (hero, used 3x) | ✅ `9660FF22-E010-4DF5-A321-DDFE60ADB8CB_1769690060866.png` |
| `F5ACDADF-FD25-4E9D-ACF2-658700CB2C84.png` (4 of 5 character cards) | ❌ not found anywhere in the repo |
| `IMG_2571.png` | ✅ `IMG_2571_1769690060866.png` and `IMG_2571_1769649771736.png` |
| `IMG_2562.png` | ✅ `IMG_2562_1769690060866.png` and `IMG_2562_1769649771736.png` |
| `IMG_2623.png` | ❌ not found anywhere in the repo |
| `D3D596A4-184F-4AE1-8009-15784FB7D51F.png` | ✅ `D3D596A4-184F-4AE1-8009-15784FB7D51F_1769633009461.png` |

**Not fixed in this pass.** 4 of 6 images have a ready local original that
could be copied into `apps/web/public` and swapped in with a one-line
change each — but 2 of 6 (`F5ACDADF...` and `IMG_2623.png`, together
covering 4 of the 5 character cards) have no local copy anywhere in this
repository. Self-hosting the other 4 while leaving 2 pointed at the same
fragile external host would still leave the character roster partially
broken on host failure, and sourcing or regenerating the missing 2 is an
asset decision, not a code fix — flagging for your call rather than
guessing at replacements. Recommend: either locate/re-export the 2 missing
source images and self-host all 6 under `apps/web/public/images/lore/`, or
accept the current external dependency as a known risk for `v0.1.0-mvp`
and revisit post-launch.

### NONE — everything else checked is either self-hosted or genuinely dead code

- **Fonts**: `@fontsource/inter` and `@fontsource/bebas-neue` are npm
  packages bundled by Vite — no CDN font loading, confirmed no `<link>` to
  Google Fonts or similar in `index.html`.
- **3D models / sounds**: `apps/web/src/lib/characters.ts` and the
  `components/game/models/` model loaders reference only local `/models/*`
  and `/sounds/*` paths under `apps/web/public` — no remote fetch found.
- **`index.html`**: no external `<script>`/`<link>` tags; service worker
  registration for PWA is present but commented out ("disabled for
  development... uncomment for production") — a deployment-config item for
  the later Vercel/PWA task, not an asset-hosting risk.
- **`LoadingScreen.tsx` default export** (not `GameIntro`, the component
  actually used) hard-codes two background images at
  `https://replit.com/api/v1/projects/self/assets/attached_assets/IMG_2571_1769690060866.png`
  — a Replit *project-relative* "self" API path that would never resolve
  outside the original Replit session it was authored in. This looked like
  the worst finding in the audit until tracing the import graph: `App.tsx`
  imports only the named `GameIntro` export from this file, never the
  default `LoadingScreen` export. `GameIntro` (the actual splash screen
  shown on every launch) uses pure CSS gradients and text, zero image
  dependencies. The broken Replit URL has **zero runtime impact today** —
  it's dead code, same pattern as `NexusHaven.tsx` and the triplicated
  `SagaModeLauncher` from the Task A audit. Left untouched, documented here
  so nobody wires this component up later without noticing.
- **Outbound links** (not embedded assets, don't block rendering if
  unreachable): Privacy Policy / Terms of Service buttons in
  `LegendaryMainMenu.tsx` and `SettingsMenu.tsx` open
  `https://legendsofkaijax.com/privacy` and `/terms` in a new tab. Already
  flagged PLACEHOLDER SAFE in the Task A route audit — worth a manual check
  before store submission, not blocking, can't break the app itself.
- A `w3.org` hit in `bronx_grit.css` and a `legends-of-kai-jax.com` hit in
  `data/world/tail_tier_reactions.json` are both false positives (an SVG
  `xmlns` namespace and a JSON Schema `$id`, respectively) — not network
  dependencies.

## Summary

One real production risk found: `LoreHub.tsx`'s character art depends on a
temporary, job-scoped third-party host, and 2 of the 6 images can't be
self-hosted yet because no local original exists in the repo. No code
change made pending an asset-sourcing decision. Everything else — fonts,
models, sounds, outbound links — is either already self-hosted or is
confirmed dead code with no live effect.

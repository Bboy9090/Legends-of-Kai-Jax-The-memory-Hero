# WAVE 8 — Release Qualification & Campaign Certification

Branch `integration/p1p-unified-reconciliation` · PR #392 (**Draft**) · written 2026-11-16 · `main` untouched.
Everything below is either **verified** (evidence path given), **not verified**, or **blocked**. Nothing is inferred.

## 1. Gate summary

| Gate | Status | Evidence / blocker |
|---|---|---|
| Eight-district campaign, real combat, headless Chromium (desktop 1280×720 + 844×390) | **Verified 8/8** | `captures/wave8-chromium-desktop/`, `captures/wave8-chromium-mobile-844x390/` |
| Eight-district campaign on Android emulator WebView | **Verified 8/8** | `captures/wave8-android-emulator/` (Pixel-class `sdk_gphone64_x86_64`, Android 17, WebView 145.0.7632.218, APK sha256 `7202aa1a…51a3e5`, build `fa368e8e`) |
| Physical Android device (Adreno/Mali) | **NOT DONE — blocked on hardware** | emulator is SwiftShader; no performance claim is made |
| Boss defeat is by combat, not scripting | **Verified** | harness only calls public inputs; no HP edits; counters + timelines in `report.json` |
| Save / reload, return travel | **Verified** (Chromium + emulator page reload; emulator HOME/force-stop below) | `report.json` `saveReloadMatches`, `returnTravel` |
| Mobile lifecycle (HOME→resume, force-stop→cold relaunch) | **Verified on emulator** | `captures/wave8-android-emulator/lifecycle.txt` |
| Admin auth (positive + negative) | **Verified** | `ADMIN_ACCESS.md`, 24 tests, `captures/wave8-admin/` |
| CodeQL | **Passing at last full check** (12 → 0 alerts) | re-verify on the final head |
| Strict TypeScript (`apps/web`) | **139 → 0** (`tsc -p tsconfig.json`, `tsc -p tsconfig.phase0.json`, `tsc -b`) | §3 |
| Villain art vs reference | **3 of 3 comparable villains MISMATCH** | §5 |
| Signed release (AAB, upload key) | **BLOCKED** | no signing material in this environment; not attempted |
| Store submission | **BLOCKED** | needs signed AAB, store listing/data-safety forms, approved art, device QA |
| Physical-device performance / thermal | **NOT DONE** | hardware |

## 2. Campaign certification (Workstream A)

Harness: `scripts/wave8-campaign-playthrough.mjs` (CDP, works on Chromium or an Android WebView). It starts from the real title screen, clicks through dialogue like a player, and drives `window.__KAIJAX_ENGINE__` through movement, light/heavy attacks, abilities, parry/dodge, hero switching and interact, until each boss is dead. Ashblock Heights (Mission 1) additionally requires both civilian rescues (one on a rooftop), the memory site, the alley gate and the boss.

| District | Boss | Chromium desktop | Chromium 844×390 | Android emulator |
|---|---|---|---|---|
| Ashblock Heights | Fang Enforcer (Mission 1) | cleared | cleared | cleared |
| Sector 7 | architect scout | cleared | cleared | cleared |
| Neon Ward | neon prince | cleared | cleared | cleared |
| Iron Market | blood broker | cleared | cleared | cleared |
| Undercrown | undercrown sentinel | cleared | cleared | cleared |
| **Zenith Spires** | Borax Zenith | cleared | cleared | cleared |
| **Erasure Fields** | Erasure Choir | cleared | cleared | cleared |
| **Memory Nexus** | Hollow Architect | cleared | cleared | cleared |

Each clear includes: stage progression, boss phase change where the boss has one, XP/item rewards, `completedDistricts` update, victory dialogue (clicked through), and a screenshot set (entry / boss engaged / boss defeated).

**Limits (read these):** the player is a bot, so this proves the rules and flow work, not that they are fun or well-balanced (boss fights ended in ~8–35 s of simulated time, which suggests they may be too easy for a competent player). A scripted route is used for the Ashblock rooftop civilian. Chromium runs use SwiftShader (~5 fps), the emulator is also software GL. Android screenshots taken over CDP show the HUD but not the 3D canvas (WebView GL surfaces are not captured that way); `native-screencap-after-run.png` is a real device frame.

**Android observations:** cold launch `am start -W` TotalTime 19.9 s on the emulator; TOTAL PSS ≈ 152 MB after the full campaign; crash buffer empty; repeated non-fatal `GL_INVALID_VALUE glGenerateMipmap` in logcat (`logcat-chromium-errors.txt`) — **uninvestigated**, likely a texture-size/format issue worth a look on real GPUs.

### Defects found by the playthrough and fixed (commit `fa368e8e`)
1. `GameEngine.switchDistrict()` did not reset `isGameOver`/`isVictory`/combo: dying then travelling disabled all input in the next district; a Mission 1 win suppressed combat music later. Regression check in the harness (`travelStateRegression`).
2. The Mission 1 "Fang Enforcer" fusion-awakening cutscene fired against whichever boss was fought first on a fresh save (e.g. Borax Zenith). It now plays only in Ashblock Heights; elsewhere fusion awakens with an on-screen label. Harness asserts no Enforcer dialogue outside Ashblock.

### Still open from the playthrough
- Ashblock objective routing was non-trivial for the bot (rooftop civilian, gate guards behind the closed gate must be hit with ranged abilities). A human player may find this unclear; worth a playtest.
- District boss fights appear very short; balance not assessed.

## 3. Strict TypeScript (Workstream C)

Reproduced: `tsc --noEmit -p tsconfig.json` = **139** errors on this branch (the "113" figure came from a different tree). The gated `typecheck` script (`tsconfig.phase0.json`, a subset) was already 0. `strict` was **not** enabled, relaxed or changed; no `@ts-ignore`/`any` suppressions were added.

| Class | Errors | Root cause | Repair |
|---|---|---|---|
| Unreachable scaffolding that cannot compile (32 shadcn/ui wrappers whose radix/cmdk/vaul/recharts packages are not installed; stale models/hooks importing renamed `@legends-of-kai-jax/*`; legacy runner components; old rosters) | 100 | files nothing imports (reachability from app + tests + scripts + phase0) | removed 47 files (history keeps them); 3 FX systems kept (a brand test reads them) with a local `EventBus` contract; `STORY_ACTS` typed `Partial` |
| Live production code | 22 | **real runtime bugs** (below) | fixed |
| Test files | 14 | stale literal types in 5 tests | typed correctly; `ProgressionIntegration` now passes wave counters explicitly |

Real runtime bugs behind the typing errors (all fixed, each with a test that fails without the fix): `useRunner.setCampaignCurrentNode` and `useAudio.toggleMute` did not exist (district launch / mute buttons would throw); `FilmPass` called with legacy args made `grayscale` truthy (frame desaturated) and animated non-existent uniforms; Customization menu filtered on a non-existent `Fighter.category` (rendered empty); `AdventureArena` ignored the `characterId`/`accentColor` App passes; two `@types/three` versions (0.185.1/0.187.0) broke `Group`/`Object3D` — single-version override.

Informational: `tsc --strict` on the same project reports 21 errors; enabling strict is a separate decision.
Pre-existing, not caused by Wave 8, not fixed: `e2e/mission6-ashblock.spec.ts` fails identically on the clean pre-change head (expects the text "I can feel another shard nearby." in the Mission 6 briefing). It is not part of CI.

## 4. Combat HUD (Workstream D)

- **Boss identity audit.** Encounter definitions exist for `ashen-enforcer`, `void-stalker`, `rift-general`. Story missions name `void-stalker` (M4), `rift-general` (M5), plus `synergy-hunter`, `well-defiler`, `rift-general-prime`, `voidonus-imperion` (no encounter data). **Verified identities = mission `bossId` ∩ encounter data = `void-stalker`, `rift-general`.** My earlier `ashen-tiger → ashen-enforcer` mapping was name inference with no evidence in the game; it is removed and tested to return null.
- Phase banner (`BossPhaseBanner`) is shared by the versus HUD and the adventure HUD and is driven by live enemy health; unverified boss-tier enemies get none.
- Mobile/touch ability buttons: operable by keyboard, mouse and assistive tech (they were touch-event only); `aria-label`/`aria-disabled`/`data-ready` come from `abilityAvailability()`, which mirrors the controller's real gating (combat state, exhaustion threshold, stamina cost, training mode); unready buttons dim and show a stamina meter. There is **no per-ability cooldown state** in the engine, so none is displayed — only real readiness.
- The versus ability strip shows only genuine ultimate readiness (no invented per-ability cooldowns). **Follow-up patch pending runtime qualification:** on viewport widths below 640px, a compact on-demand `Combat Intel` toggle exposes the same reference panel while remaining collapsed during regular play. Source: `apps/web/src/components/game/EnhancedCombatHUD.tsx`; responsive Playwright regression: `apps/web/e2e/codex-and-combat-hud.spec.ts`. This feature requires CI and touch-device verification before being marked certified.
- No duplicate overlays: BattleUI remains the sole owner of health/combo/stamina/overdrive.
- Evidence: Playwright specs `codex-and-combat-hud`, `wave8-menu-fixes`; `lib/abilityAvailability.test.ts`; screenshot `adventure-hud-boss-banner-and-stamina.png` (attached to the PR).

## 5. Villain art certification (Workstream E)

Method: `scripts/render-neutral-comparison.mjs` normalises every model to the same height under one flat white light rig on one grey background and photographs front / ¾ / side / back. Sheets: `captures/wave8-villain-art/`.

| Villain model | Reference in the approved-library sheets | Result |
|---|---|---|
| Fang Enforcer | "Fang Syndicate Enforcer" (Faction Dossier) | **Mismatch** — reference is an armoured hyena-croc brute in purple/venom-blue/gunmetal; model is a crimson box-robot with cat ears; crimson is outside the dossier's palette |
| Hollow Architect | "Hollow Architect" (Major Threats) | **Mismatch** — reference is a tall robed figure with order-spires and a staff; model is a black/gold box-robot |
| Erasure Choir | "Erasure Choir" (Major Threats) | **Mismatch** — reference is a chorus of hooded figures with glowing orbs; model is one violet-visored box-robot |
| Blood Broker, Architect Scout, Neon Prince, Undercrown Sentinel, Borax Zenith, Syndicate Brawler/Marksman/Stalker | **No same-named reference found** (nearest dossier names — Fang Broker, Chain Bruiser, Razor Scout, Tunnel Stalker — are not provably the same characters) | **Cannot be certified**; owner must say which reference applies |

All 11 villain models are ≈2.0–3.0K triangles, 28 joints, one shared humanoid body re-tinted (heroes: 20–24K triangles, 29–56 joints). The Wave 5 review's descriptions overstate them (correction note added there). **No approval is recorded or implied.** All villains stay **PROVISIONAL**; `bovar` stays withheld. Heroes kai/jax/kaijax/boryn/borax are in the overview sheet as a baseline only.

## 6. Release qualification (Workstream F)

- **Clean build:** Mac working tree fast-forwarded to `fa368e8e`, `npm run build` → `cap sync` → `gradlew assembleDebug` succeeded; install with `pm clear`; app launched and ran the full campaign. (Debug APK only.)
- **Save compatibility:** `validate-p1p-world-and-saves.mjs` passes (save v2 envelope, `_bak` corruption recovery, v1 migration); campaign save survived reload and force-stop in the emulator (see `lifecycle.txt`).
- **Mobile lifecycle:** HOME → resume and force-stop → cold relaunch executed on the emulator; state after HOME→resume and after force-stop→cold relaunch (no data clear) was identical: 7 completed districts, fusion unlocked, both save slots, GL context alive, crash buffer empty; cold relaunch 7.5 s (19.9 s on first launch after install). Not covered: state while backgrounded, low-memory kill, rotation, interruptions.
- **Dependencies:** `pnpm audit --prod --audit-level high` exits 0; lockfiles consistent; CI green at last full check.
- **Admin surface:** disabled in production without a ≥24-char `KAIJAX_ADMIN_TOKEN`; hidden on native builds.

### Requirements that remain before any store release (not met)
1. Physical-device QA on supported hardware (Adreno and Mali): frame rate, thermal, memory, WebView GL (`glGenerateMipmap` errors), touch ergonomics, audio.
2. Signed release AAB with a real upload key; Play App Signing enrolment (no keystore exists in this environment).
3. Owner-approved final character and villain art (§5); asset-authority receipts.
4. Store listing, privacy/data-safety forms, age rating, content declarations.
5. Resolution of the open items in §2–§4 and a human playtest of balance and Ashblock routing.

# Merge Decision Matrix — 21 Subsystems

Classification legend: **KEEP** (preserve workspace module), **PORT** (integrate vetted logic from Source B/C), **REFACTOR** (upgrade in place for canon/AA/safety), **REPLACE** (swap stub with production implementation), **DEFER** (out-of-scope content expansion flagged for Act II+).

| # | Subsystem | Winner Source | Decision | Integration Notes & File Targets |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Character Models & Rigs | Baseline ZIP | **KEEP** | `CharacterBuilder.ts` (`createHeroRig`, `createEnemyRig`); headless Three.js verified in `gameSystems.test.ts`. |
| 2 | Character Animation | Baseline ZIP | **KEEP** | Procedural sprint lean, attack swings, dodge spin, aerial flip, and spider-limb wave in `GameEngine.ts`. |
| 3 | Movement & Collision | Baseline ZIP | **KEEP** | Grounded rooftop/alley AABB bounds, obstacle sliding, wall-run & web-swing physics in `GameEngine.ts`. |
| 4 | Touchscreen Controls | Baseline ZIP | **REFACTOR** | Preserved dual-zone floating virtual stick + 44px+ action buttons; upgraded text/border contrast in `GameHUD.tsx`. |
| 5 | Combat & Hit Feedback | Baseline + Source B | **PORT + REFACTOR** | Integrated `parry.ts` (`0.10s`/`0.16s` windows, `resolveIncomingStrike`) + telemetry counters into `GameEngine.ts`. |
| 6 | Ability Systems | Baseline ZIP | **KEEP** | Distinct Kai (`Memory Weave`, `Venom Strike`, `Shadow Ink`), Jax (`Storm Fang`, `Lightning Channeling`, `Thryxen Senses`), and Kai-Jax skills. |
| 7 | Enemy AI & Boss Phases | Baseline ZIP | **KEEP** | Brawler, Stalker, Marksman behaviors + Fang Enforcer Phase 1/Phase 2 fissure telegraphs in `GameEngine.ts`. |
| 8 | Character Switching | Baseline ZIP | **KEEP** | Instant `[Tab]` / HUD switch preserving position, momentum, and independent HP/Energy pools. |
| 9 | Kai-Jax Fusion | Baseline ZIP | **KEEP** | Story-gated unlock during Fang Enforcer Phase 2; resource charge, duration countdown, and cooldown enforced. |
| 10 | Three-Primary-Tail Canon | Baseline ZIP | **KEEP** | `kaijax.tails.length === 3` (Ember, Memory, Storm) + 9 Energy Domains progression verified by automated test. |
| 11 | 3D Environment Rendering | Baseline ZIP | **KEEP** | `WorldBuilder.ts` + `RoomEnvironment` IBL + 3-point warm/cool shadows (`PCFSoftShadowMap`), mobile DPR cap. |
| 12 | World & District Progression | Baseline ZIP | **KEEP** | Full 8-district Raging City roadmap in `canonData.ts` (`Ashblock Heights` playable; 7 acts ready). |
| 13 | Mission & Dialogue Systems | Baseline ZIP | **KEEP** | 5-stage Mission 1 (*The City Bites Back*) + `DialogueOverlay.tsx` + patrol replay loop. |
| 14 | Camera & Hitstop | Baseline ZIP | **KEEP** | Follow spring camera, lock-on framing, screen shake scaled by `reducedMotion`. |
| 15 | HUD & Menus | Baseline + Source B | **REFACTOR** | `ComboMeterWidget.tsx` scaling + damage reset kept; `TitleScreen.tsx`, `CommandHubModal.tsx`, `GameHUD.tsx` upgraded to WCAG AA; rejected redundant `EnhancedCombatHUD`. |
| 16 | Save / Load & Migration | Baseline + Source B | **PORT + REFACTOR** | Extended `SaveManager.ts` `v1` schema & `migrateSaveData()` with `combatStats` (`parryCount`, `evadeCount`, `hitsTaken`, `maxCombo`) and `parryTiming`. |
| 17 | Android Lifecycle & Recovery | Source B/C + New | **PORT + REPLACE** | Added `src/platform/androidLifecycle.ts` (`appStateChange`, `backButton`, `visibilitychange`), `AudioEngine.suspend()`/`resume()`, WebGL context-loss recovery overlay, and `MainActivity.java` hardware/immersive hooks. |
| 18 | Performance & Audio | Baseline ZIP | **REFACTOR** | Preserved low-overhead procedural Web Audio synthesis + added WebView lifecycle suspend/resume in `AudioEngine.ts`. |
| 19 | Accessibility (WCAG / Motion) | Source B (`411114ccb8`) | **PORT + REFACTOR** | Ported `src/game/accessibility/contrast.ts`, fixed all low-contrast Tailwind classes, added `:focus-visible` amber rings, ARIA roles, OS `prefers-reduced-motion` sync, and Generous `0.16s` parry preset. |
| 20 | Automated Tests | Baseline + Source B | **REFACTOR** | Expanded `src/game/__tests__/gameSystems.test.ts` from 6 to **10 suites** (WCAG, parry math, headless Three.js tri-tail rig invariants, offline legal, combo reset, migration). |
| 21 | Build, PWA & Android Config | Source C + New | **PORT + REPLACE** | Installed `@capacitor/*` `8.6.2`, generated `/android` project targeting SDK 36 (`com.bobbyblanco.legendsofkaijax`), hardened Gradle/Manifest/Release script while keeping PWA (`vite-plugin-pwa`) intact. |

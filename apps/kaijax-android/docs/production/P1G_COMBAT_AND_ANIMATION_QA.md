# OPERATION KAI-JAX — P1-G COMBAT FEEL, ANIMATION, HUD & CAMERA QA CERTIFICATION

**Project:** Legends of Kai-Jax: The Memory Hero (`com.bobbyblanco.legendsofkaijax`)  
**Phase:** P1-G — Character Mastering, Combat Feel & Native Android Certification  
**Automated Unit & Integration Gate:** `npm test` (`18/18` suites PASS)  
**Live Browser & Telemetry Harness:** `scripts/qualify-p1g-all.mjs` → `docs/production/p1g-telemetry.json`  

---

## 1. Combat Responsiveness, Input Buffering & Cancel Rules (`src/game/combat/combatInputBuffer.ts`)

| System / Mechanic | Implementation & Timing Contract | Automated & Live Verification Evidence | Status |
| :--- | :--- | :--- | :---: |
| **Priority-Aware Combat Input Buffer** | `0.22s` rolling buffer (`COMBAT_BUFFER_WINDOW_SEC = 0.22`) across `light`, `heavy`, `tactical`, `ability_1..3`, and `dodge`. Higher-priority defensive/finisher actions (`dodge = 5` > `ability = 4` > `tactical = 3` > `heavy = 2` > `light = 1`) override lower-priority queued taps cleanly; expired inputs auto-purge without stale misfires. | `Suite 18` (`gameSystems.test.ts`) + Live Telemetry `step: "1_light_and_buffer"` (`bufferedAction: "light"` verified mid-swing). | **PASS** |
| **Responsive Dodge / Parry Attack Cancels** | `canCancelAttackIntoDodge()` allows responsive dodge/parry cancellation at any point during windup and post-apex recovery, locking only the `0.06s` peak strike commitment frame so combat feels crisp without sacrificing attack weight. | `Suite 18` + `GameEngine.ts` `triggerDodgeOrParry()` cancel check. | **PASS** |
| **Free-Flow Contextual Targeting** | `selectFreeFlowTarget()` scores nearby enemies by directional stick alignment, proximity, and active combo continuity, turning and stepping smoothly into melee range. | `Suite 9` (`freeFlowCombat.ts`) + Live Telemetry `step: "1_light_and_buffer"` → `step: "2_kai_web_tactical"`. | **PASS** |
| **Parry Timing, Counter Strikes & Guard Break** | `0.10s` active perfect-parry window (`Q` / `Parry` button) triggers slow-mo counter opportunity (`Counter Strike` peripheral callout), reflects projectiles, and shatters shielded Covenant/Syndicate guards (`"ARMOR BROKEN!"` verified in `combat_03_jax_switch_launcher.png`). | `Suite 9`, `Suite 12`, & `combat_03_jax_switch_launcher.png`. | **PASS** |
| **Kai Web Pull, Web Throw & Wall Pin** | `computeWebThrowAndWallPin()` + `triggerTacticalAction()` pulls distant targets or hurls close/snared targets toward street walls for wall-pin stun bonus damage. | `Suite 11` + Live Telemetry `step: "2_kai_web_tactical"` (`e-row-1` thrown from `x = -2.74` to `x = -7.66`, `hp: 135 → 86`, `state: "stagger"`). | **PASS** |
| **Instant Brother Switch & Jax Electric Launcher** | `triggerSwitchHero()` swaps physical lead/ally positions, damps camera transition via `switchCamOffset` (`THREE.MathUtils.damp`), emits immediate 0ms HUD state (`syncHeroRigVisibility()` + `emitHudSnapshot()`), and chains directly into Jax's storm launcher (`Launch`). | `hud_jax_mobile_844x390.png` + Live Telemetry `step: "3_jax_switch_and_launcher"` (`activeHero: "jax"`, `comboCount: 1`). | **PASS** |
| **Duo Synergy, 2-Button Touch Chord & Duo Finishers** | Supports both dedicated peripheral `Duo Finisher [G]` tap and simultaneous `Attack + Tactical` two-button chord (`registerChordInput`), executing synchronized dual-brother choreography (`Thunderweb Execution` & `Predator Crossfire`) with midpoint camera framing and obstacle pull-in. | `Suite 13` + Live Telemetry `step: "4_duo_finisher"` (`accepted: true`, `activeFinisher: "predator-crossfire"`) + `combat_04_duo_finisher.png`. | **PASS** |
| **Touch / Pointer Input Dispatch Latency** | Pointer event dispatch on HUD `Attack` button (`pointerdown` → `GameEngine.triggerLightAttack()`). | Measured `2.6 ms` (`inputDispatchLatencyMs: 2.6` in `p1g-telemetry.json`, well below `< 16 ms` single-frame budget). | **PASS** |

---

## 2. Skeletal Animation Blending & Locomotion Cadence QA (`GLBCharacterController.ts`)

1. **Zero Pose Popping After `LoopOnce` Strikes (`playClip`):**
   - Previously, when a `LoopOnce` combat or landing clip (`attack_1..3`, `heavy_strike`, `dodge`, `parry`, `landing`) reached `clampWhenFinished = true`, `prevAction.isRunning()` evaluated to `false`, risking a 1-frame snap when returning to `idle` or `run`.
   - Fixed in `GLBCharacterController.playClip()`: clamped `LoopOnce` actions now execute `prevAction.fadeOut(fadeSeconds)` paired with `nextAction.fadeIn(fadeSeconds).play()`, guaranteeing smooth weight interpolation across every combat-to-idle and landing-to-sprint transition.
2. **Stride-Calibrated Locomotion & Secondary Motion:**
   - `walk` (`2.45 m/s`), `run` (`6.95 m/s`), and `sprint` (`10.20 m/s`) scale `activeAction.timeScale` dynamically (`[0.58, 1.42]`) to match actual planar speed and prevent foot sliding.
   - Procedural turn banking (`bankRoll`), sprint forward lean (`forwardPitch`), and landing compression (`landingSquash`) layer smoothly via frame-rate-independent `THREE.MathUtils.damp`.
   - Facial morph targets (`blink`, `snarl`, `roar`, `pain`, `focus`) animate automatically across idle blinks, attacks, abilities, parries, and hit reactions on all 5 rigged characters.

---

## 3. Responsive HUD Zero-Clipping & Zero-Obstruction Certification (`GameHUD.tsx` & `TitleScreen.tsx`)

Programmatically audited via `auditHudViewport()` across **7** viewport/state configurations in `p1g-telemetry.json` (`scrollWidth <= clientWidth + 2`, viewport bounds `[0..vw, 0..vh]`, touch height `>= 36px`, and central 3D combat zone `[0.34*vw..0.66*vw, 0.22*vh..0.76*vh]`):

| Audited Viewport & State | Screenshot Evidence (`captures/p1g-after/`) | Clipped Labels | Viewport Overflows | Horizontal Thumb Gap | Left Vertical Gap | Duo Prompt Center Overlap | Result |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Title Screen Mobile (`844 × 390`)** | `title_mobile_844x390.png` | **0** | **0** | N/A | N/A | `false` | **PASS** |
| **Kai Gameplay Mobile (`844 × 390`)** | `hud_mobile_844x390.png` | **0** | **0** | `239 px` | `107 px` | `false` | **PASS** |
| **Kai Android Landscape (`915 × 412`)** | `hud_android_915x412.png` | **0** | **0** | `310 px` | `129 px` | `false` | **PASS** |
| **Kai Tablet Landscape (`1180 × 820`)** | `hud_tablet_1180x820.png` | **0** | **0** | `486 px` | `478 px` | `false` | **PASS** |
| **Kai Desktop (`1440 × 900`)** | `hud_desktop_1440x900.png` | **0** | **0** | `746 px` | `558 px` | `false` | **PASS** |
| **Jax Longest Labels (`844 × 390`)** | `hud_jax_mobile_844x390.png` | **0** | **0** | `178 px` | `107 px` | `false` | **PASS** |
| **Active Duo Finisher Prompt (`844 × 390`)** | `hud_duo_prompt_844x390.png` | **0** | **0** | `239 px` | `107 px` | **`false`** (`[692, 218, 832, 262]`) | **PASS** |

- **Full Unclipped Ability Names Verified:**
  - **Kai:** `Venom Strike`, `Web of Pyraxis`, `Memory Weave`
  - **Jax:** `Displacement Burst`, `Storm Pressure`, `Lightning Channeling`
  - **Kai-Jax (Convergence):** `Ember Venom`, `Storm Web`, `Chrono Roar`
- **Peripheral Duo Finisher Placement Verified:** Active `Duo Finisher [G]` button docks cleanly above the right-thumb ability row (`x: 692..832, y: 218..262` on `844×390`), and active execution banners (`Thunderweb Execution` / `Predator Crossfire`) sit at the top-center edge, leaving the central 3D combat zone 100% unobstructed.

---

## 4. Ashblock Heights Vertical Perches & Canon Environmental Storytelling (`WorldBuilder.ts`)

- Added **3 walkable elevated scaffolding/catwalk perches** (West Scaffolding Catwalk `y = 3.65 m`, East Market Overlook `y = 3.95 m`, North Gate Sniper Ledge `y = 4.25 m`) appended strictly after `alleyGateColliderIndex` to preserve gate collider indexing (`Suite 18` verified).
- Added **2 high-perch web-zip anchors** enabling Kai to zip from street level directly onto elevated catwalks and drop-attack Fang Syndicate patrols below.
- Added crisp procedural canvas signage (`ProceduralTextures.ts`) matching Ashblock Heights lore: overhead street solidarity banner **`"WE ROAR AS ONE — ASHBLOCK HEIGHTS SOLIDARITY"`** and illuminated storefront awning **`"BEAST-KIN MARKET · FANG & CLAW TAILORING · IRONSMITH"`** (verified in `title_desktop_1440x900.png` and `hud_mobile_844x390.png`), while maintaining `216–264` draw calls and `~30.5k–32.2k` active triangles across gameplay.

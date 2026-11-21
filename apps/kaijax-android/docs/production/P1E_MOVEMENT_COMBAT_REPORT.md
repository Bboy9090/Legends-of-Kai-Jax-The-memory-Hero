# OPERATION KAI-JAX — P1-E MOVEMENT, CAMERA & COMBAT REFINEMENT REPORT

**Project:** Legends of Kai-Jax: The Memory Hero (`com.bobbyblanco.legendsofkaijax`)  
**Directive:** P1-E — Objective 3 (Movement Quality, Camera & Combat Feel Refinement)  

---

## 1. Grounded Movement, Weight & Anti-Foot-Slide Calibration

Implemented across `src/game/engine/GameEngine.ts` and `src/game/engine/GLBCharacterController.ts`:

- **Weighted Acceleration & Deceleration Curves**:
  - Grounded acceleration damped at `lambda = 16.5` for crisp stick/thumbstick response; grounded release deceleration damped at `lambda = 11.5` so stops settle with physical weight rather than floaty ice-skating or instant binary snapping.
  - Airborne momentum preservation (`decelDamp = 2.2` while `!grounded`) preserves horizontal carry across street gaps and web-swing releases.
- **High-Speed Pivot-Brake Response**:
  - Reversing movement direction by `> 110°` (`dot < -0.35`) above `5.4 m/s` boosts braking damping to `21.0` and emits grounded heel-skid dust particles at the character's planted foot position.
- **Stride-Matched Locomotion Playback (`GLBCharacterController.ts`)**:
  - Calibrated reference stride velocities (`walk: 2.45 m/s`, `run: 6.95 m/s`, `sprint: 10.2 m/s`) with `AnimationAction.timeScale` clamped cleanly to `[0.58, 1.42]` so paw/boot contact frames lock to ground travel distance without foot sliding.
  - Added sprint stride dust micro-bursts every `0.22s` when sprinting (`planarSpeed > 8.2 m/s`).
- **Procedural Turn Banking & Sprint Lean**:
  - Smoothly damps roll banking (`bankRoll`, clamped `±0.16 rad`) from `turnYawDelta` and subtle forward predator pitch (`0.065 rad` sprinting, `0.028 rad` running) on the character root.
- **Jump Takeoff, Apex Hang-Time & Landing Compression**:
  - Three-phase gravity curve in `GameEngine.ts`: rising gravity `21.5 m/s²`, apex hang-time window (`|vy| <= 2.2 m/s`) at `15.8 m/s²` for responsive aerial combos/web-strikes, and crisp falling gravity `27.5 m/s²`.
  - Touchdown from vertical speeds `< -5.5 m/s` triggers a grounded `landingImpact` impulse (`0..1`) that drives knee-compression squash (`landingSquash`) in `GLBCharacterController.ts` plus radial landing dust particles.

---

## 2. Combat Impact, Hitstop, Contextual Targeting & Camera Framing

- **Calibrated Hitstop Frames (`simDt = dt * 0.08`)**:
  - Heavy attack connect: `0.038s` hitstop + `0.16` camera impact impulse.
  - 3rd-hit combo ender / aerial slam connect: `0.022s` hitstop.
  - Guard-break shield shatter: `0.042s` hitstop.
  - Perfect Parry Counter (`SPIDER-LIMB COUNTER` / `THUNDER COUNTER` / `MEMORY CONVERGENCE`): `0.048s` hitstop.
  - Duo Finisher impact frames: `0.052s` hitstop per choreographed impact frame.
  - Camera interpolation and UI overlays continue updating on unscaled `dt` during hitstop so camera motion never stutters.
- **Vulnerability-Aware Free-Flow Contextual Targeting (`faceContextualFreeFlowTarget`)**:
  - Weights candidate enemies within `10.5m` by proximity, stick/camera alignment, and a tactical vulnerability bonus (`+1.6` for snared, wall-pinned, stunned, or active-windup attackers) so counters and follow-ups snap naturally to priority threats.
- **World-to-Screen 2D Target Diamond Reticle**:
  - `emitHudSnapshot` projects the locked or active contextual target's chest (`pos.y + 1.15`) into 2D viewport pixels (`lockedTargetScreenX`, `lockedTargetScreenY`, `lockedTargetArchetype`, `lockedTargetShield`) rendered via GPU `translate3d` in `GameHUD.tsx` with a riot-shield indicator when `shieldHp > 0`.
- **Third-Person Velocity Look-Ahead & Combat Framing Camera (`updateCamera`)**:
  - Smoothly damps planar velocity look-ahead (`camLookAhead`) during traversal, widens framing (`camDistance` `7.2 -> 8.15`, FOV `56° -> 60.5°`) when multiple enemies engage or sprinting, and biases look target `26%` toward the active combat target while clamping against Ashblock street building colliders (`X ∈ [-17.5, 17.5]`, `Z ∈ [-89, 20]`).

---

## 3. Automated Combat & Movement Regression Test Results

Command executed: `npm test` (`tsx src/game/__tests__/gameSystems.test.ts`)

| Suite # | System Verified | Result |
| :--- | :--- | :--- |
| **1–6** | Canon Governance, Save v2 Schema, Legacy Migration, Shadow Backup Recovery, XP/Skill Stats, Hero Abilities & 5-Stage Mission | **PASS** |
| **7** | Combo Momentum, Move Variation Style Multiplier (`variedGain > mashGain`), Heavy Whiff Decay Penalty & Damage Reset | **PASS** |
| **8** | Agile Block, Perfect Parry (`0.10s` standard / `0.16s` generous), Counter Window Consumption, Unblockable Evasion & Riot Shield Guard Break | **PASS** |
| **9** | Web Anchor Ray/Box Obstruction Validation, Predator Pull Mass Resistance, Street Wall Pin Clamping & Auto-Release Guarantees | **PASS** |
| **10** | Duo Synergy Meter, Two-Button Simultaneous Chord (`<= 0.18s`), All 6 Contextual Duo Finishers & Strictly Single-Application Impact Frames | **PASS** |
| **11** | Enemy Combat Director (7 Archetypes + Boss), Simultaneous Non-Boss Attack-Token Cap (`max 2`) & Anti-Stacking Separation | **PASS** |
| **12** | Gamepad Edge-Triggered Input Poller, Duo Chord Detection & Conflict-Free Button Remapping | **PASS** |
| **13–15** | WCAG 2.1 AA Contrast Utilities, Articulated Hero/Enemy Rigs (Tri-Tail Rule) & Offline Bundled Legal Docs | **PASS** |
| **16–17** | Character Asset Registry, HUD Layout Settings Persistence (`hudEdgeOffset`, `hudVerticalOffset`, `hudCompactMode`), GLB `[0, 1]` UV Bounds & Kai-Jax Strictly 3 Tail Roots | **PASS (`17/17`)** |

# Gameplay Repair & Combat Hardening Report

## 1. Configurable Deflect-Parry Tuning (`src/game/combat/parry.ts`)
Reconciled Source B's combat calibration (`b80e2d02a9` / `4d638b6be7`) cleanly inside `GameEngine.ts`:
- **Parry Windows:**
  - `standard`: **`0.10s`** (6 frames at 60 FPS) inside a `0.28s` dodge invulnerability envelope.
  - `generous`: **`0.16s`** (~10 frames at 60 FPS) accessibility preset selectable in **Command Hub → Settings** and live-reflected in HUD desktop hint (`L Dodge/Parry (0.10s|0.16s)`).
- **Deterministic Incoming Strike Resolution (`resolveIncomingStrike`):**
  - Priority order: `parry` (`parryTimer > 0`) → `evade` (`dodgeTimer > 0 && invulnTimer > 0`) → `grace` (`invulnTimer > 0`) → `hit`.
  - Successful **Parry** staggers attacker (`1.8s`), deals counter-shockwave, awards `+22` Fusion Charge, plays `'parry'` SFX, and increments `parryCount`.
  - Timed **Evade** negates damage, awards `+8` Fusion Charge, plays `'dodge'` SFX, and increments `evadeCount`.

## 2. Persistent Combat Telemetry (`SaveManager.ts` + `CommandHubModal.tsx`)
- Extended `SaveSlotData` (`version: 1`) with `combatStats`:
  - `parryCount`
  - `evadeCount`
  - `hitsTaken`
  - `maxCombo`
- `GameEngine.ts` exposes live telemetry in `HudSnapshot` and pushes throttled milestone syncs via `syncCombatTelemetry()` into `SaveManager`, displayed in **Command Hub → Heroes & Skills** (`Deflect Parries`, `Timed Evades`, `Hits Taken`, `Peak Combo`).
- `migrateSaveData()` safely upgrades prior save files without overwriting XP, unlocked skills, inventory, or mission progress.

## 3. Combo Meter Widget & Damage Reset Integrity (`ComboMeterWidget.tsx` + `comboSystem.ts`)
- Preserved real-time combo hit counter with spring pop scaling, damage multiplier (`x1.00` to `x2.50`), and compositor-only `scaleX` decay progress bar.
- verified `resetComboOnDamage()` immediately resets `count` and `timer` to `0`, increments `brokenSeq` so UI displays **"Combo Broken — Reset on damage taken"** for `650ms`, and records `maxCombo` into save telemetry.

## 4. WebGL Context Loss & Background Safety (`GameEngine.ts` + `App.tsx`)
- Fixed unsafe silent pause on GPU context loss: `webglcontextlost` now sets `webglContextLost: true` in `HudSnapshot`, triggering an accessible `#webview-recovery` alertdialog (**Graphics Context Paused / Restore 3D Renderer**) so mobile players never face an unresponsive frozen canvas after heavy backgrounding.
- Android hardware Back Button follows a deterministic stack:
  1. Close **Offline Legal Modal** if open.
  2. Close **Command Hub Modal** and resume gameplay if open.
  3. Open **Pause / Command Hub** if actively playing in Ashblock Heights.
  4. Yield to OS minimize on Title Screen (`App.minimizeApp()`).

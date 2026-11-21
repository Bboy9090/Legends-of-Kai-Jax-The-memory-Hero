# Source Audit Report — Operation Kai-Jax: Android Studio Redemption

**Audit Date:** 2026-11-13  
**Integration Branch:** `integration/ashblock-hardening`  
**Immutable Baseline Tag:** `baseline/zip-snapshot` (`9131866`)

---

## 1. Sources Evaluated & Provenance Boundary

1. **Workspace Baseline (`legends-of-kai-jax_-the-memory-hero.zip`, Commit `9131866`)**
   - **Contents:** Standalone React 19 + TypeScript 7 + Vite 8.3 + Tailwind CSS v4 + Three.js (`0.187.0`) vertical slice centered on **Ashblock Heights** (Mission 1: *The City Bites Back*).
   - **Core Strength:** Contains a cohesive `GameEngine.ts` (1,997 lines), procedural articulated `CharacterBuilder.ts` (501 lines enforcing Kai's 4 spider limbs, Jax's 7-spike storm mane, and fused Kai-Jax's strictly 3 primary physical tails), `WorldBuilder.ts` (416 lines), `ProceduralTextures.ts` (155 lines), `AudioEngine.ts`, `SaveManager.ts`, `ComboMeterWidget.tsx` (186 lines), `GameHUD.tsx`, `CommandHubModal.tsx`, `DialogueOverlay.tsx`, and `docs/CANON_BIBLE.md`.
   - **Gap:** Contained zero Capacitor packages, zero `android/` Gradle wrapper or `AndroidManifest.xml`, no WCAG contrast utilities, no configurable parry timing profiles, and no offline legal disclosures.

2. **Source B — Claude Revision Stream (`claude/fervent-dijkstra-a4gj0u`, Commit `411114ccb87a611fcc78bcd66cfaff1243dc3426` + PR #374 `b163d8e6af60618a02f91139479d4291e6c8703c`)**
   - **Web Session Link Note:** The authenticated session URL (`https://claude.ai/code/cshk_01TLsjpe2rvsiXNc3HbztuYpHhFE1Njvekz47apxaqLW9q`) returned `HTTP 403 Forbidden`; its actual engineering output was inspected directly from GitHub PR #374 and `claude/fervent-dijkstra-a4gj0u` commits (`df7bda5dce`, `b80e2d02a9`, `972cd33475`, `0db6eed316`, `dda0b5912f`).
   - **Core Strengths Ported:**
     - `contrast.ts` (`df7bda5dce` / `411114ccb8`): WCAG 2.1 luminance/ratio calculation, `readableOnDark`, `bestTextOn`, `darkenForText`.
     - `parry.ts` (`b80e2d02a9`): Configurable parry windows (`0.10s` standard / `0.16s` generous inside `0.28s` i-frames), outcome priority (`parry > evade > grace > hit`), and `parryOutcomeOdds` calibration.
     - Telemetry & Offline Legal (`972cd33475`, `0db6eed316`): Persistent combat telemetry (`parryCount`, `evadeCount`, `hitsTaken`, `maxCombo`) and zero-external-link offline Privacy Policy & Terms of Use.
   - **Off-Canon / Unmerged Divergences Rejected:**
     - Rejected PR #374's off-canon 5-character roster (`Kaison`, `Silver`, `Volter`), `Jax + Kaison` fusion claim, and redundant `EnhancedCombatHUD` (which Source B itself later dropped in `dda0b5912f`).

3. **Source C — Canonical GitHub Repository (`https://github.com/Bboy9090/Legends-of-Kai-Jax-The-memory-Hero`, `main` Commit `ceeb155bf30b904f603b28a23649b3697f3b8476`)**
   - **Core Strength:** Production Capacitor Android configuration pattern (`com.bobbyblanco.legendsofkaijax`, SDK 36 target, env-var release signing config in `android/app/build.gradle`, reproducible `build-android-release.sh`).
   - **Status of Local Source A / Source B ZIP Archives:** Neither standalone Source A nor Source B ZIP archive files exist inside `/app/applet`. Per user clarification, reconciliation was performed cleanly across the immutable workspace baseline (`9131866`), Source B's GitHub commits, and Source C `main`.

---

## 2. Three-Way Canon Governance Verification

| Canon Rule | Workspace Baseline | Source B (PR #374 / Branch) | Source C (`main`) | Reconciled Output |
| :--- | :--- | :--- | :--- | :--- |
| Playable Duo + Convergence | Kai, Jax → Kai-Jax | Included off-canon Kaison/Silver/Volter in PR #374 | Included PR #374 | **Strictly Kai, Jax, Kai-Jax** |
| Kai-Jax Tail Count | 3 primary tails (Ember, Memory, Storm) | Mixed PR #374 lore metadata | Inherited PR #374 | **Strictly 3 primary physical tails** + 9 Energy Domains |
| Antagonistic Force Name | Erasure | Contained `"Void"` drift in early commits | Mixed | **`Erasure` enforced & unit-tested** |
| Four Heritages & Family | Myrr'Kai, Pyraxis, Kar-Voth, Thryxen; Bovar, Boryn, Borax | Partial metadata | Partial metadata | **Full canon preserved** |
| Story-Gated Fusion | Unlocks at Fang Enforcer Phase 2 | Unbound roster preview | Inherited PR #374 | **Story-gated at Mission 1 Phase 2** |

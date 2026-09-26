# Kai-Jax Mobile Game — 30-Gate Greenlight Matrix

**Program:** Phase C extended release hardening  
**Branch authority:** `claude/kai-jax-consolidation-dkfv1r`  
**Baseline certified head:** `e20c312b4983b570fde6c3f6371ca3bd95dc487e`  
**Rule:** A gate is green only when the exact-head proof named here exists. Historical prototype content never substitutes for current Bloodward/Raging City canon.

| # | Gate | Lane | Current state | Green proof |
|---|---|---|---|---|
| 1 | Core CI | Build | GREEN | Typecheck + build + unit suite |
| 2 | Registry validation | Assets | GREEN | Registry Validation workflow |
| 3 | Kai runtime smoke | Gameplay | GREEN | Kai Runtime Smoke |
| 4 | Jax runtime smoke | Gameplay | GREEN | Jax Runtime Smoke |
| 5 | Combat release certification | Combat | GREEN | Combat Release Certification |
| 6 | Full Ashblock vertical-slice chain | Mission | GREEN | Vertical Slice Runtime Smoke |
| 7 | Production preview smoke | Release | GREEN | Production Preview Smoke |
| 8 | iOS native preflight | Mobile | GREEN | iOS Native Preflight |
| 9 | Android native preflight | Mobile | GREEN | Android Native Preflight |
| 10 | Unified keyboard/touch/gamepad suppression | Input | GREEN | Runtime + buffer suppression tests |
| 11 | Sparse-frame input edge preservation | Input | GREEN | Keyboard/touch/gamepad edge tests |
| 12 | Fang AI sparse-frame safety | AI | GREEN | Ashblock exact-head runtime chain |
| 13 | Knockdown/recovery state safety | Combat | GREEN | Ashblock recovery runtime proof |
| 14 | Asset inventory completeness | Assets | GREEN | Every runtime GLB has explicit provenance entry |
| 15 | Commercial asset clearance | Legal/Release | BLOCKED | Every runtime GLB has license basis + evidence + cleared status |
| 16 | Roster/registry static integrity | Roster | GREEN | Registry + versus roster + fighter validator |
| 17 | Hosted mobile cadence evidence | Performance | GREEN | iPhone SE/12/iPad built-preview cadence test |
| 18 | Target-device performance | Performance | BLOCKED-EXTERNAL | Real iOS/Android frame/thermal/memory/input evidence |
| 19 | Vercel preview deployment | Deployment | GREEN | Exact-head Vercel commit status success |
| 20 | Production Vercel identity | Deployment | BLOCKED-EXTERNAL | Production hostname + exact SHA + HTTPS verified |
| 21 | Live network asset integrity | Deployment | BLOCKED-EXTERNAL | Production model/audio/texture request audit |
| 22 | Story Hub truth boundary | Canon | GREEN | Current Raging City nodes + legacy campaign quarantine |
| 23 | Ironvein Wards playable slice | Content | GREEN | Source-safe field contract + Raging City field runtime completion |
| 24 | Skyfall Spines playable slice | Content | GREEN | Source-safe field contract + Raging City field runtime completion |
| 25 | Storm Ronin Sanctum playable slice | Content | GREEN | Source-safe field contract + Raging City field runtime completion |
| 26 | Save/checkpoint interruption recovery | Persistence | GREEN-PARTIAL | Force-quit/background/reload progress proof |
| 27 | Audio/haptics mobile feedback | Feel | GREEN-PARTIAL | Browser/touch vibration fallback + packaged audio integrity certified; native Capacitor haptics still absent |
| 28 | Model-loading authority unification | Assets | GREEN-PARTIAL | Registry-only production model resolution |
| 29 | Security scanner truth | Security | PARTIAL | Repo-owned JS/TS+Python CodeQL valid; phantom C# default scan removed/disabled externally |
| 30 | Release candidate greenlight | Release | RED | Gates 1–29 either GREEN or explicitly external/manual with signed evidence |

## Parallel workstreams

**Lane A — Runtime/Combat:** 3, 4, 5, 6, 10, 11, 12, 13  
**Lane B — Mobile/Performance:** 8, 9, 17, 18, 27  
**Lane C — Assets/Roster:** 2, 14, 15, 16, 28  
**Lane D — Deployment/Security:** 1, 7, 19, 20, 21, 29  
**Lane E — Current Canon Content:** 22, 23, 24, 25  
**Lane F — Persistence/Release:** 26, 30

## Hard blockers that cannot be faked

1. **Commercial asset clearance:** repository evidence currently marks runtime GLBs unverified. A filename or successful render is not a license.
2. **Production Vercel identity/network proof:** current connected Vercel scope exposes no project listing; preview deployment status from GitHub is green, but production hostname identity is not proven here.
3. **Target-device performance:** hosted Chromium evidence is useful but cannot substitute for real iOS/Android hardware.
4. **Native feedback + device evidence:** browser/touch feedback is certified, but native Capacitor haptics and physical-device feel/performance still require target-device implementation and proof.

## Execution policy

Every new commit re-runs exact-head certification. No gate is marked green from an older SHA after behavior-affecting changes. Current-canon release gates must not depend on `story_act*` prototype missions unless those missions are explicitly re-authorized by canon.


## 2026-09-26 advancement note

Exact head `7f6592f2d463f6958b3156134a7a6284e50a5b11` proved the Extended Release Certification workflow green, including asset inventory truth, roster/registry integrity, hosted mobile performance evidence, and persistence/reload recovery. AdventureArena now resolves active runtime models through the canonical model registry instead of fabricating GLB filenames.

Gate 26 remains GREEN-PARTIAL rather than fully complete because browser reload/profile isolation/migration are certified, while native OS background/termination restore still requires device-level proof.

Gate 28 remains GREEN-PARTIAL because AdventureArena is registry-only, but other legacy render paths such as BeastModelSystem still contain hardcoded GLB authorities and require separate cleanup before full closure.


## 2026-09-26 Raging City runtime advancement

Exact head `e20c312b4983b570fde6c3f6371ca3bd95dc487e` passed the dedicated **Raging City field runtime completion** job for Ironvein Wards, Skyfall Spines, and Storm Ronin Sanctum. Each node launches a real Kai/Jax-controller runtime, advances through its publication-safe mechanics contract, reaches a deliberate interaction gate, records completion, and returns to mission-complete state without reviving quarantined prototype chronology.

Ashblock remains the combat-heavy certified slice. The three newer field slices deliberately use a shared noncombat traversal/memory runtime until publication-authorized encounter content exists. Their GREEN state certifies playability and completion flow, not invented boss fights or chapter events.

Production Preview Smoke on that same head failed only because its Story Hub expectation still asserted that non-Ashblock nodes were disabled. That stale assertion was corrected in the next test-only commit; it does not invalidate the successful field-runtime proof.

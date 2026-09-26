# Kai-Jax Mobile Game — 30-Gate Greenlight Matrix

**Program:** Phase C extended release hardening  
**Branch authority:** `claude/kai-jax-consolidation-dkfv1r`  
**Baseline certified head:** `129699fe1e37e1f5f42621fcf58068c7466030e9`  
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
| 14 | Asset inventory completeness | Assets | STARTED | Every runtime GLB has explicit provenance entry |
| 15 | Commercial asset clearance | Legal/Release | BLOCKED | Every runtime GLB has license basis + evidence + cleared status |
| 16 | Roster/registry static integrity | Roster | STARTED | Registry + versus roster + fighter validator |
| 17 | Hosted mobile cadence evidence | Performance | STARTED | iPhone SE/12/iPad built-preview cadence test |
| 18 | Target-device performance | Performance | BLOCKED-EXTERNAL | Real iOS/Android frame/thermal/memory/input evidence |
| 19 | Vercel preview deployment | Deployment | GREEN | Exact-head Vercel commit status success |
| 20 | Production Vercel identity | Deployment | BLOCKED-EXTERNAL | Production hostname + exact SHA + HTTPS verified |
| 21 | Live network asset integrity | Deployment | BLOCKED-EXTERNAL | Production model/audio/texture request audit |
| 22 | Story Hub truth boundary | Canon | GREEN | Current Raging City nodes + legacy campaign quarantine |
| 23 | Ironvein Wards playable slice | Content | RED | Current-canon scene + encounter + runtime certification |
| 24 | Skyfall Spines playable slice | Content | RED | Current-canon scene + traversal + memory certification |
| 25 | Storm Ronin Sanctum playable slice | Content | RED | Current-canon scene + archive/training certification |
| 26 | Save/checkpoint interruption recovery | Persistence | NEXT | Force-quit/background/reload progress proof |
| 27 | Audio/haptics mobile feedback | Feel | NEXT | No-crash + state-correct feedback proof on touch/native bridge |
| 28 | Model-loading authority unification | Assets | NEXT | Registry-only production model resolution |
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
4. **Three remaining current-canon field slices:** they require actual chronology-safe content, not reactivation of the quarantined 15-mission prototype.

## Execution policy

Every new commit re-runs exact-head certification. No gate is marked green from an older SHA after behavior-affecting changes. Current-canon release gates must not depend on `story_act*` prototype missions unless those missions are explicitly re-authorized by canon.

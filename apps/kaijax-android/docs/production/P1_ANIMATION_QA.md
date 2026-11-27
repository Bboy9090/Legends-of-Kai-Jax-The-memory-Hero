# P1 ANIMATION QA & STATE MACHINE CERTIFICATION

**Project:** Legends of Kai-Jax: The Memory Hero  
**Phase:** Operation Kai-Jax — Project Beast Gods (P1 + P1-C)  
**Controller Module:** `src/game/engine/GLBCharacterController.ts`  
**Certification Status:** **PASS** (19/19 clips × 10 rigged `.glb` variants = 190/190 verified animation tracks)

---

## 1. Authoritative Clip Matrix (All 5 Approved Characters × Master & LOD1)

Verified programmatically via `scripts/certify-character-glbs.mjs` using `THREE.GLTFLoader` + `THREE.AnimationMixer` sampling across `t = 0%`, `25%`, `50%`, `75%`, `100%` of each clip duration:

| # | Clip Name | Playback Policy | CrossFade Duration | Priority Tier | QA Status |
|---|---|---|---|---|---|
| 1 | `Idle_Calm` | `LoopRepeat` | `0.20s` | Locomotion | **PASS** |
| 2 | `Idle_Combat` | `LoopRepeat` | `0.18s` | Locomotion | **PASS** |
| 3 | `Walk` | `LoopRepeat` | `0.16s` | Locomotion | **PASS** |
| 4 | `Run` | `LoopRepeat` | `0.14s` | Locomotion | **PASS** |
| 5 | `Sprint` | `LoopRepeat` | `0.14s` | Locomotion | **PASS** |
| 6 | `Jump_Start` | `LoopOnce` (`clampWhenFinished`) | `0.09s` | Traversal | **PASS** |
| 7 | `Apex_Air` | `LoopRepeat` | `0.12s` | Traversal | **PASS** |
| 8 | `Fall` | `LoopRepeat` | `0.12s` | Traversal | **PASS** |
| 9 | `Land` | `LoopOnce` (`clampWhenFinished`) | `0.09s` | Traversal | **PASS** |
| 10 | `Wall_Run` | `LoopRepeat` | `0.11s` | Traversal | **PASS** |
| 11 | `Web_Swing` | `LoopRepeat` | `0.11s` | Traversal | **PASS** |
| 12 | `Dodge_Evade` | `LoopOnce` (`clampWhenFinished`) | `0.08s` | Defense (High) | **PASS** |
| 13 | `Parry_Deflect` | `LoopOnce` (`clampWhenFinished`) | `0.06s` | Defense (Highest) | **PASS** |
| 14 | `Light_Combo_1` | `LoopOnce` (`clampWhenFinished`) | `0.08s` | Combat | **PASS** |
| 15 | `Light_Combo_2` | `LoopOnce` (`clampWhenFinished`) | `0.08s` | Combat | **PASS** |
| 16 | `Light_Combo_3` | `LoopOnce` (`clampWhenFinished`) | `0.08s` | Combat | **PASS** |
| 17 | `Heavy_Breaker` | `LoopOnce` (`clampWhenFinished`) | `0.09s` | Combat | **PASS** |
| 18 | `Air_Slam` | `LoopOnce` (`clampWhenFinished`) | `0.08s` | Combat | **PASS** |
| 19 | `Special_Cast` | `LoopOnce` (`clampWhenFinished`) | `0.10s` | Ability / Finisher | **PASS** |

*Secondary overlay states (`Hit_React`, `Victory_Pose`, `Defeat_Fall`) are resolved deterministically without deadlocking recovery into `Idle_Combat` or `Run`.*

---

## 2. Joint & Appendage Articulation Audit

| Character | Joint Count | Custom Appendage Rigging | NaN / Scale Drift Check | Status |
|---|---|---|---|---|
| **Kai** | `37` | 4 articulated dorsal spider limbs (`spider_L_upper/lower`, `spider_R_upper/lower` ×3 segments) | `0` NaN / `0` zero-scale matrices | **PASS** |
| **Jax** | `32` | 7 electric storm-mane crest bones (`mane_crest_0..6`) | `0` NaN / `0` zero-scale matrices | **PASS** |
| **Kai-Jax** | `56` | 4 dorsal spider limbs + 7 storm-mane crests + **strictly 3 physical tails** (`tail_ember_*`, `tail_storm_*`, `tail_memory_*`) | `0` NaN / `0` zero-scale matrices | **PASS** |
| **Boryn** | `29` | Mentor battle-stance sabertooth rig + `tail_01..03` | `0` NaN / `0` zero-scale matrices | **PASS** |
| **Borax** | `29` | Heavy guardian mentor rig + `tail_01..03` | `0` NaN / `0` zero-scale matrices | **PASS** |

---

## 3. Morph Target Expression Blending

All 10 `.glb` files contain non-zero vertex deltas across all 5 canonical facial morph targets (`snarl`, `focus_narrow`, `jaw_roar`, `pain_wince`, `brow_fierce`):

- **Combat / Attack (`snarl` + `brow_fierce`)**: Smoothly damped (`THREE.MathUtils.damp`) during `Light_Combo_1..3`, `Heavy_Breaker`, and `Special_Cast`.
- **Thryxen Senses / Parry (`focus_narrow`)**: Engaged during `Parry_Deflect` and Jax's `Thryxen Senses` buff.
- **Fusion Awakening / Duo Finisher (`jaw_roar`)**: Engaged during `Special_Cast` and Duo Finishers.
- **Incoming Hit (`pain_wince`)**: Engaged during `playerHurtFlash > 0` and decays cleanly back to `0.0`.
- **Mesh Integrity**: Zero vertex tearing or eye detachment observed across morph weight `[0.0 .. 1.0]`.

---

## 4. State Transition & Interruption Edge Cases

1. **Attack Cancel into Dodge/Parry**: `Parry_Deflect` and `Dodge_Evade` override active `Light_Combo_*` clips within `0.06s–0.08s` crossfade; zero T-pose flash.
2. **Mid-Combo Character Switch (`Tab` / Switch Button)**: Active and companion `GLBCharacterInstance` controllers swap coordinates and preserve combo timer without resetting `AnimationMixer` bindings.
3. **Kai-Jax Convergence & Revert**: `syncHeroRigVisibility()` toggles `kaiGlb` + `jaxGlb` off and `kaiJaxGlb` on in the same frame prior to `renderer.render(...)`, eliminating single-frame invisible or duplicate-mesh artifacts.
4. **Duo Finisher Interruption**: Calling `loadSaveState()` or checkpoint retry during an active Duo Finisher invokes `interruptDuoFinisher(...)`, immediately restoring standard locomotion clip control.

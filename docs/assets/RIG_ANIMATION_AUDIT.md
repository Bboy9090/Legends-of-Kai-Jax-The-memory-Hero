# 🕵️ LEGENDS OF KAI-JAX: RIG & ANIMATION AUDIT

## 📊 OVERVIEW
This audit evaluates the current state of hero models (Kai, Jax, Kai-Jax) regarding their ability to perform combat and locomotion animations visually.

---

## 🦸 HERO STATUS REPORT

### 1. KAI-JAX (Fusion Hero)
*   **Current Path**: `/models/Meshy_AI_Animation_Walking_withSkin9TAILSKAIJAX.glb`
*   **Rig Status**: ✅ **PASS** (18/21 bones detected).
*   **Arms Detected**: ✅ PASS (`rightUpperArm`, `rightForearm`, `rightHand`, etc.).
*   **Legs Detected**: ✅ PASS (`rightUpperLeg`, `rightLowerLeg`, `rightFoot`, etc.).
*   **Animations Found**: `Armature|walking_man|baselayer` (Used for Walk/Idle).
*   **Walk/Run**: ✅ FUNCTIONAL (Driven by clip).
*   **Combat**: ✅ FUNCTIONAL (Procedural bones found and mapped).
*   **Status**: REPAIRED.

### 2. JAX (Shadow-Sonic)
*   **Current Path**: `/models/Meshy_AI_Meshy_Merged_AnimationsSHADOWSONICJAXKAI.glb`
*   **Rig Status**: ✅ **PASS** (Standard Biped detected).
*   **Arms Detected**: ✅ PASS
*   **Legs Detected**: ✅ PASS
*   **Animations Found**: `Running`, `Walking`.
*   **Idle**: ❌ MISSING (Currently stays in Running/Walking pose).
*   **Combat**: ⚠️ PROCEDURAL ONLY (Bones found, but clips missing).
*   **Recommended Fix**: Repair. Add an explicit `Idle` clip and combat clips (Punch/Kick) if possible.

### 3. KAI (Spider Tactical)
*   **Current Path**: `/models/Meshy_AI_Animation_Walking_withSkinSPiDERKAIJAX9TIALS.glb`
*   **Rig Status**: ✅ **PASS** (Standard Biped detected).
*   **Arms Detected**: ✅ PASS
*   **Legs Detected**: ✅ PASS
*   **Animations Found**: `Armature|walking_man|baselayer`.
*   **Running**: ❌ MISSING.
*   **Idle**: ❌ MISSING.
*   **Combat**: ⚠️ PROCEDURAL ONLY.
*   **Recommended Fix**: Repair. Needs `Run` and `Idle` clips.

---

## 🛠️ TECHNICAL AUDIT

### Animation State Mapping
*   **Problem**: The system was blindly playing `animations[0]` as the default pose.
*   **Result**: Models appeared "stuck" in a running or walking pose even when idle.
*   **Solution**: Implemented a `nextClip` selector in `GLBCharacterModel.tsx` that searches for "idle", "walk", or "run" clips by name.

### Rig Detection (Limb Tracking)
*   **Problem**: Procedural combat was conflicting with locomotion clips.
*   **Result**: "Stretched arms" or "folded hands" during attacks.
*   **Solution**: Added a **Clip-to-Procedural Weight Blend**. When attacking, the locomotion clip weight is faded to 0, allowing procedural punch/kick to take full control of the limbs.

### Debug Tools
*   **Status**: ✅ **ACTIVE**.
*   **Access**: Press `[` in-game to toggle the **Animation Debug Overlay**.
*   **Verification**: Ensure "RIG: PASS" and that the "CLIP" matches the player's movement state.

---

## 🏁 FINAL VERDICT: **B. COMBAT LOGIC READY, ANIMATION PARTIAL**
The combat math and logic are functional, and the **core hero rigs have been repaired**. Skeletal inventory confirms that all necessary nodes for punching, kicking, and walking are present and correctly mapped. 

> [!NOTE]
> While technical verification (skeletal audit) is complete, the status remains "PARTIAL" until full-campaign visual telemetry is confirmed across all 54 missions.

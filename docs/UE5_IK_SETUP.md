# UE5 IK Setup - Kai-Jax Digitigrade Legs

**Version:** 1.0.0  
**Last Updated:** 2026-01-27  
**Canonical Reference:** `kai_jax.character.json`

## Overview

This document defines the Inverse Kinematics (IK) setup for Kai-Jax's digitigrade legs in Unreal Engine 5. The IK system ensures proper foot placement on uneven terrain while maintaining the characteristic backward-bending digitigrade posture.

**GOVERNANCE COMPLIANCE:**
- Leg type: Digitigrade (from lockfile: `"legs": "digitigrade"`)
- IK must maintain toe ground contact (primary effector)
- Digitigrade angle: 0° (standing) to 45° (combat ready)

---

## Digitigrade Leg Anatomy

### Bone Structure

```
Pelvis (Root)
  └── Thigh (Upper Leg) ← Backward angle
      └── Calf (Lower Leg) ← Forward angle
          └── Foot (Elongated, acts as 2nd lower leg) ← Forward angle
              └── Toe (Ground Contact Point) ← IK Effector Target
```

### Key Differences from Plantigrade Legs

| Feature | Plantigrade (Human) | Digitigrade (Kai-Jax) |
|---------|---------------------|----------------------|
| Ground Contact | Heel and ball of foot | Toes only (ball of foot) |
| Foot Role | Flat on ground | Acts as 2nd lower leg segment |
| Knee Bend | Forward | Backward (reverse knee) |
| Ankle Joint | Human ankle | Acts like knee (forward bend) |
| Standing Height | Full leg extension | Elevated on toes (spring-loaded) |

---

## Two-Bone IK Configuration

### Left Leg IK Chain

**IK Chain Definition:**
- **Root Bone:** `Thigh_L`
- **Mid Bone:** `Calf_L`
- **Effector Bone:** `Foot_L` (NOT the actual ground contact)
- **IK Target:** `IK_Target_LeftFoot` (virtual bone, positioned at toe contact)

**IK Solver Settings:**
- **Solver Type:** Two-Bone IK
- **Allow Stretching:** Yes (with limits)
- **Max Stretch Scale:** 1.1 (allow 10% stretch for slopes)
- **Start Stretch Ratio:** 0.95 (begin stretch at 95% extension)
- **Maintain Effector Rotation:** Yes (foot alignment with ground)

**Joint Target (Pole Vector):**
- **Use Joint Target:** Yes
- **Joint Target Bone:** `IK_JointTarget_LeftKnee` (virtual bone, positioned in front of calf)
- **Joint Target Position:** Forward of calf by 30cm, aligned with digitigrade bend direction
- **Purpose:** Ensures calf bends forward (not backward or sideways)

---

### Right Leg IK Chain

**IK Chain Definition:**
- **Root Bone:** `Thigh_R`
- **Mid Bone:** `Calf_R`
- **Effector Bone:** `Foot_R`
- **IK Target:** `IK_Target_RightFoot`

**IK Solver Settings:**
- (Same as Left Leg IK)

**Joint Target:**
- **Joint Target Bone:** `IK_JointTarget_RightKnee`
- (Same as Left Leg IK)

---

## IK Target Placement

### Ground Trace Setup

**Purpose:** Dynamically position IK targets based on ground surface.

**Trace Configuration:**
- **Start Point:** Foot bone world position (or toe bone position)
- **End Point:** Start point - (0, 0, 150cm) (trace downward)
- **Trace Channel:** Visibility (or custom `GroundTrace` channel)
- **Ignore:** Self (Kai-Jax's own collision)
- **Trace Type:** Line trace (single)

**Per-Frame Update (in Animation Blueprint or Control Rig):**

```cpp
// Pseudo-code for IK target update
FVector LeftFootPosition = GetBoneWorldPosition("Foot_L");
FVector TraceStart = LeftFootPosition;
FVector TraceEnd = TraceStart + FVector(0, 0, -150.0f); // 150cm down

FHitResult HitResult;
bool bHit = World->LineTraceSingleByChannel(HitResult, TraceStart, TraceEnd, ECC_Visibility);

if (bHit)
{
    // Ground found, place IK target at hit location
    IK_Target_LeftFoot_Position = HitResult.Location;
    IK_Target_LeftFoot_Rotation = HitResult.Normal.Rotation(); // Align with ground normal
}
else
{
    // No ground, use default position (current foot position)
    IK_Target_LeftFoot_Position = LeftFootPosition;
}
```

**IK Target Smoothing:**
- Use FInterp (interpolation) to smooth IK target position changes
- Interp speed: 10.0-15.0 (fast response, minimal lag)
- Prevents foot "snapping" on terrain transitions

---

### IK Target Offset Adjustment

**Toe Contact Compensation:**

Since the IK effector is the `Foot` bone (not the `Toe` bone), we need to offset the IK target to ensure the **Toe** touches the ground.

**Offset Calculation:**
```cpp
// Distance from Foot bone to Toe bone (measure in skeleton)
float FootToToeDistance = 15.0f; // cm (measure from your skeleton)

// Offset IK target forward along foot direction
FVector FootForwardVector = GetBoneWorldRotation("Foot_L").Vector();
IK_Target_LeftFoot_Position += FootForwardVector * FootToToeDistance;
```

**Result:** IK solver places `Foot` bone such that the `Toe` bone contacts the ground, not the middle of the foot.

---

## Digitigrade Angle Control

### Angle Definition

**Digitigrade Angle:** The bend angle of the leg from fully extended (0°) to maximally crouched (45°).

- **0°:** Standing upright, minimal leg bend (still on toes, not plantigrade)
- **15°:** Walking stance, slight bend
- **30°:** Running stance, moderate bend
- **45°:** Combat stance, maximum bend (spring-loaded, ready to explode)

### Angle Adjustment via Pelvis Height

**Method 1: Pelvis Offset (Recommended)**

Adjust the height of the Pelvis bone to control leg extension, which changes the digitigrade angle naturally.

```cpp
// In Control Rig or Animation Blueprint
float TargetDigitegradeAngle = 45.0f; // Combat stance
float PelvisHeightOffset = CalculatePelvisOffsetForAngle(TargetDigitegradeAngle);

// Apply offset to Pelvis bone (relative to IK targets)
Pelvis_Position.Z -= PelvisHeightOffset;
```

**Pelvis Offset Calculation:**
```cpp
float CalculatePelvisOffsetForAngle(float Angle)
{
    // Approximate: Lower pelvis to increase leg bend
    // 0° = 0cm offset, 45° = -20cm offset (tune to your skeleton)
    float MaxOffset = 20.0f; // cm
    return FMath::GetMappedRangeValueClamped(
        FVector2D(0.0f, 45.0f),   // Input range (angle)
        FVector2D(0.0f, MaxOffset), // Output range (offset)
        Angle
    );
}
```

**Method 2: Joint Target Adjustment (Alternative)**

Adjust the Joint Target (pole vector) position to influence the bend angle.

- Move Joint Target **closer to thigh** → Decreases bend angle (straightens leg)
- Move Joint Target **farther from thigh** → Increases bend angle (crouches more)

**Less intuitive than pelvis offset, but useful for fine-tuning.**

---

### Angle Blending Based on State

**Animation Blueprint Integration:**

```cpp
// In Animation Blueprint Event Graph
float DesiredDigitegradeAngle = 0.0f;

switch (CurrentAnimationState)
{
    case Idle:
        DesiredDigitegradeAngle = 0.0f; // Standing
        break;
    case Walking:
        DesiredDigitegradeAngle = 15.0f; // Slight bend
        break;
    case Running:
        DesiredDigitegradeAngle = 30.0f; // Moderate bend
        break;
    case Combat_Idle:
    case Attack:
    case Dodge:
        DesiredDigitegradeAngle = 45.0f; // Maximum bend (combat ready)
        break;
}

// Smooth interpolation to avoid sudden changes
CurrentDigitegradeAngle = FMath::FInterpTo(
    CurrentDigitegradeAngle,
    DesiredDigitegradeAngle,
    DeltaTime,
    5.0f // Interp speed
);

// Apply to Control Rig
KaiJaxControlRig->DigitegradeAngle = CurrentDigitegradeAngle;
```

---

## IK Integration in Control Rig

### Control Rig Node Setup

**In Control Rig Graph (UKaiJaxControlRig):**

1. **Get IK Target Transforms**
   - Read `IK_Target_LeftFoot` and `IK_Target_RightFoot` positions from Animation Blueprint
   - Or compute them directly in Control Rig via ground traces

2. **Two-Bone IK Node (Left Leg)**
   - Root: `Thigh_L`
   - Mid: `Calf_L`
   - Effector: `Foot_L`
   - Effector Target: `IK_Target_LeftFoot_Position`
   - Joint Target: `IK_JointTarget_LeftKnee_Position`
   - Maintain Effector Rotation: Yes
   - Alpha: 1.0 (full IK)

3. **Two-Bone IK Node (Right Leg)**
   - (Same configuration for right leg)

4. **Toe Adjustment (Optional Post-IK)**
   - After IK solve, manually adjust `Toe_L` and `Toe_R` rotations to align with ground normal
   - Ensures toes "grip" the ground naturally

---

### Example Control Rig Implementation

```cpp
void UKaiJaxControlRig::UpdateDigitegradeIK(float DeltaTime)
{
    if (!bEnableFootIK) return;

    // Get foot bone transforms
    FTransform LeftFootTransform = GetBoneTransform("Foot_L");
    FTransform RightFootTransform = GetBoneTransform("Foot_R");

    // Trace to ground (simplified, real implementation needs World reference)
    FVector LeftIKTarget = TraceToGround(LeftFootTransform.GetLocation());
    FVector RightIKTarget = TraceToGround(RightFootTransform.GetLocation());

    // Smooth IK target positions
    LeftIKTarget = FMath::VInterpTo(
        LeftFootIKTarget_Previous,
        LeftIKTarget,
        DeltaTime,
        12.0f // Interp speed
    );
    RightIKTarget = FMath::VInterpTo(
        RightFootIKTarget_Previous,
        RightIKTarget,
        DeltaTime,
        12.0f
    );

    // Apply IK (pseudo-code, actual UE5 Control Rig uses nodes)
    SolveTwoBoneIK(
        "Thigh_L", "Calf_L", "Foot_L",
        LeftIKTarget,
        JointTarget_LeftKnee,
        true // Maintain rotation
    );
    SolveTwoBoneIK(
        "Thigh_R", "Calf_R", "Foot_R",
        RightIKTarget,
        JointTarget_RightKnee,
        true
    );

    // Store for next frame
    LeftFootIKTarget_Previous = LeftIKTarget;
    RightFootIKTarget_Previous = RightIKTarget;
}
```

---

## Handling Slopes and Stairs

### Slope Adaptation

**Problem:** On slopes, one foot may be higher than the other, causing pelvis tilt.

**Solution 1: Pelvis Tilt Compensation**
- Average the Z-position of both IK targets
- Adjust pelvis Z to maintain balance
- Allow slight pelvis rotation to follow slope angle (< 10°)

```cpp
float LeftFootZ = LeftIKTarget.Z;
float RightFootZ = RightIKTarget.Z;
float AverageZ = (LeftFootZ + RightFootZ) / 2.0f;

// Adjust pelvis to maintain balance
FVector PelvisPosition = GetBoneTransform("Pelvis").GetLocation();
PelvisPosition.Z = AverageZ + PelvisHeightFromGround; // Constant height above feet
SetBoneTransform("Pelvis", PelvisPosition);
```

**Solution 2: Independent Foot Heights**
- Allow feet to IK independently (no pelvis tilt compensation)
- Results in more dynamic, realistic foot placement
- May cause slight pelvis roll on extreme slopes (< 5°, acceptable)

---

### Stairs

**Problem:** Stepping up/down stairs causes rapid foot height changes.

**Solution: Foot Locking**
- When foot is planted (weight on foot), **lock IK target** to ground position
- Only update IK target when foot is in air (swing phase)
- Prevents foot sliding on stair edges

```cpp
// Foot locking logic (simplified)
if (IsFootPlanted_Left) // Weight on left foot
{
    // Lock IK target, do not update
}
else
{
    // Foot in air, update IK target via ground trace
    LeftIKTarget = TraceToGround(LeftFootTransform.GetLocation());
}
```

**Foot Planted Detection:**
- Use animation blend weight (walk/run cycles have foot plant phases)
- Or use foot velocity threshold (< 5 cm/s = planted)

---

## IK Alpha (Blend Control)

### When to Use Full IK (Alpha = 1.0)
- Idle (standing)
- Walking
- Running
- Combat_Idle

### When to Reduce IK (Alpha = 0.0 - 0.5)
- Attack animations (partial IK to allow animation control)
- Dodge animations (no IK, full animation control)
- Falling (no IK, legs pull up naturally)
- Landing (IK fades in over landing duration)

**Blending:**
```cpp
// In Animation Blueprint
float IK_Alpha = 1.0f; // Default full IK

switch (CurrentAnimationState)
{
    case Attack:
        IK_Alpha = 0.5f; // Partial IK
        break;
    case Dodge:
    case Falling:
        IK_Alpha = 0.0f; // No IK
        break;
    case Landing:
        IK_Alpha = FMath::GetMappedRangeValueClamped(
            FVector2D(0.0f, 1.0f),      // Animation time (0 = start, 1 = end)
            FVector2D(0.0f, 1.0f),      // Alpha (0 = no IK, 1 = full IK)
            LandingAnimationTime
        );
        break;
    default:
        IK_Alpha = 1.0f; // Full IK
        break;
}

// Apply to Control Rig
KaiJaxControlRig->FootIK_Alpha = IK_Alpha;
```

---

## Troubleshooting

### Issue: Feet slide on ground
**Solution:** Implement foot locking (lock IK target when foot is planted)

### Issue: Legs bend incorrectly (wrong direction)
**Solution:** Adjust Joint Target position (pole vector) to point in correct bend direction

### Issue: Legs over-extend or collapse
**Solution:** Enable stretching with limits (Max Stretch Scale = 1.1), verify IK target positions

### Issue: Feet don't align with ground on slopes
**Solution:** Set "Maintain Effector Rotation" to Yes, ensure IK target rotation matches ground normal

### Issue: Toes don't touch ground (foot hovers)
**Solution:** Apply foot-to-toe offset to IK target position (see "IK Target Offset Adjustment")

### Issue: Digitigrade angle doesn't change with state
**Solution:** Verify pelvis height offset is being applied based on `DigitegradeAngle` parameter

---

## Testing Checklist

Before finalizing IK setup:

- ✅ Both feet maintain toe ground contact on flat terrain
- ✅ Feet adapt to slopes (no sliding or hovering)
- ✅ Legs bend correctly for digitigrade posture (backward thigh, forward calf)
- ✅ Digitigrade angle changes smoothly between states (0° to 45°)
- ✅ IK blends correctly during attacks (partial IK or disabled)
- ✅ No leg over-extension (stretching limited to 10%)
- ✅ No foot sliding during planted phases (foot locking works)
- ✅ Pelvis height adjusts correctly on uneven terrain
- ✅ Joint targets (pole vectors) prevent incorrect leg bends
- ✅ IK performance cost is acceptable (< 0.5ms per frame)

---

## Performance Considerations

### IK Solver Cost

**Per-Frame Cost:**
- Two-Bone IK solve (per leg): ~0.1-0.2ms
- Ground trace (per foot): ~0.05-0.1ms
- Total: ~0.3-0.6ms (acceptable for 60 FPS)

**Optimization:**
- Reduce ground trace frequency: Trace every 2-3 frames, interpolate between
- LOD: Disable IK for distant characters (use animation only)
- Async traces: Use async line traces if available

---

## Integration with Animation Blueprint

**Control Rig Execution:**
1. Animation Blueprint evaluates current state
2. Animation Blueprint sets `DigitegradeAngle` parameter
3. Animation Blueprint calls Control Rig node
4. Control Rig executes `UpdateDigitegradeIK(DeltaTime)`
5. Control Rig solves IK and outputs final pose
6. Final pose applied to skeletal mesh

**Blueprint Node Setup:**
- Add "Control Rig" node in AnimGraph
- Connect to output pose
- Set Control Rig Class: `UKaiJaxControlRig`
- Enable IK with `bEnableFootIK = true`

---

## Next Steps

1. **Create Virtual Bones:** Add IK target and joint target virtual bones in Skeleton asset
2. **Implement Control Rig IK:** See `Source/KaiJax/Animation/KaiJaxControlRig.cpp`
3. **Test on Terrain:** Create test level with slopes, stairs, and uneven ground
4. **Tune Parameters:** Adjust interp speeds, offsets, and angle ranges
5. **Profile Performance:** Measure IK cost and optimize if needed
6. **Integrate with Animation Blueprint:** Wire Control Rig into AnimGraph

---

**Canonical Authority:** This IK setup enforces the digitigrade leg structure from `kai_jax.character.json` and `README_CANON.md`. Digitigrade posture is a core visual identity and cannot be removed or simplified.

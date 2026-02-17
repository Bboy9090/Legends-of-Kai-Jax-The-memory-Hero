// Copyright Epic Games, Inc. All Rights Reserved.

#include "KaiJaxControlRig.h"
#include "Units/RigUnitContext.h"

UKaiJaxControlRig::UKaiJaxControlRig()
{
    bResetInitialTransforms = true;
    
    // Initialize tail phase accumulators for all 9 tails
    // Each tail gets a unique phase offset for variety
    TailPhaseAccumulators.SetNum(9);
    for (int32 i = 0; i < 9; ++i)
    {
        TailPhaseAccumulators[i] = (float)i * (PI / 9.0f); // Stagger phases
    }
    
    // Initialize cached IK targets
    LeftFootIKTarget_Previous = FVector::ZeroVector;
    RightFootIKTarget_Previous = FVector::ZeroVector;
}

void UKaiJaxControlRig::Initialize(bool bInitRigUnits)
{
    Super::Initialize(bInitRigUnits);

    // ==================== IK TARGET INITIALIZATION ====================
    
    // Initialize IK targets for digitigrade legs
    // IK targets are positioned at toe contact points for ground tracking
    // - Left foot IK target: IK_Target_LeftFoot
    // - Right foot IK target: IK_Target_RightFoot
    
    // Note: IK targets are set up in Control Rig graph, not in code
    // This function is called when the Control Rig is first loaded
    
    // ==================== TAIL CURVE INITIALIZATION ====================
    
    // Initialize tail curve controls for smooth motion
    // Tail_Sway_Curve: Animates tail oscillation
    // Each tail has its own phase accumulator for independent motion
    
    // Ensure tail phase accumulators are initialized
    if (TailPhaseAccumulators.Num() != 9)
    {
        TailPhaseAccumulators.SetNum(9);
        for (int32 i = 0; i < 9; ++i)
        {
            TailPhaseAccumulators[i] = (float)i * (PI / 9.0f);
        }
    }
}

void UKaiJaxControlRig::UpdateDigitegradeIK(float DeltaTime)
{
    // ==================== DIGITIGRADE IK UPDATE ====================
    
    if (!bEnableFootIK)
    {
        return;
    }

    // Calculate digitigrade angle based on movement speed or animation state
    // Angle is set externally by Animation Blueprint:
    // - 0°: Idle/standing
    // - 15°: Walking
    // - 30°: Running
    // - 45°: Combat
    
    // Adjust thigh, calf, foot joints to maintain digitigrade posture
    // Maintain toe contact with ground
    
    // -------------------- GET CURRENT FOOT POSITIONS --------------------
    
    // Get current foot bone transforms
    // (In actual implementation, use GetBoneTransform or similar from Control Rig)
    // FTransform LeftFootTransform = GetBoneTransform(TEXT("Foot_L"));
    // FTransform RightFootTransform = GetBoneTransform(TEXT("Foot_R"));
    
    // For now, this is a placeholder implementation
    // Actual IK solving is done via Control Rig graph nodes (Two-Bone IK nodes)
    
    // -------------------- TRACE TO GROUND --------------------
    
    // Trace downward from foot bones to find ground contact
    // FVector LeftIKTarget = TraceToGround(LeftFootTransform.GetLocation());
    // FVector RightIKTarget = TraceToGround(RightFootTransform.GetLocation());
    
    // -------------------- SMOOTH IK TARGET TRANSITIONS --------------------
    
    // Interpolate IK target positions to avoid snapping
    // LeftIKTarget = FMath::VInterpTo(LeftFootIKTarget_Previous, LeftIKTarget, DeltaTime, 12.0f);
    // RightIKTarget = FMath::VInterpTo(RightFootIKTarget_Previous, RightIKTarget, DeltaTime, 12.0f);
    
    // -------------------- APPLY TWO-BONE IK --------------------
    
    // Apply Two-Bone IK to each leg
    // - Root: Thigh
    // - Mid: Calf
    // - Effector: Foot
    // - Target: IK target position (at toe contact)
    
    // Adjust digitigrade bend angle:
    // - 0°: Standing upright (minimal bend)
    // - 45°: Combat crouch (maximum bend)
    
    // This is implemented via Control Rig graph nodes in UE5 editor
    // Code here is for documentation and parameter exposure
    
    // -------------------- CACHE TARGETS FOR NEXT FRAME --------------------
    
    // LeftFootIKTarget_Previous = LeftIKTarget;
    // RightFootIKTarget_Previous = RightIKTarget;
}

void UKaiJaxControlRig::UpdateTailPhysics(float DeltaTime, FVector MovementVelocity)
{
    // ==================== TAIL PHYSICS UPDATE ====================
    
    if (!bEnableTailPhysics)
    {
        return;
    }

    // Apply oscillating motion to tail bones
    // Sway increases with movement speed
    // Direction influenced by character facing
    
    // -------------------- CALCULATE DYNAMIC SWAY --------------------
    
    float MovementSpeed = MovementVelocity.Size();
    
    // Scale sway amount by movement speed
    // - Idle (speed ~0): Minimal sway (0.3)
    // - Walking (speed ~400): Moderate sway (0.6)
    // - Running (speed ~800): Maximum sway (1.0)
    float DynamicSwayAmount = FMath::Clamp(MovementSpeed / 600.0f, 0.3f, 1.0f) * TailSwayAmount;
    
    // -------------------- UPDATE TAIL OSCILLATION --------------------
    
    // For each of the 9 tails
    for (int32 i = 1; i <= 9; ++i)
    {
        // Get tail bone name
        FString TailBoneName = FString::Printf(TEXT("Tail_%02d"), i);
        
        // Update phase accumulator (oscillation time)
        TailPhaseAccumulators[i - 1] += DeltaTime * TailSwaySpeed;
        
        // Calculate oscillation angle (sine wave)
        float PhaseAngle = TailPhaseAccumulators[i - 1];
        float OscillationAngle = FMath::Sin(PhaseAngle) * DynamicSwayAmount * 30.0f; // ±30° max
        
        // Decrease amplitude toward tip (tails taper in motion)
        // Tail base (bone 1) has full amplitude
        // Tail tip (bone 5) has reduced amplitude
        for (int32 j = 1; j <= 5; ++j)
        {
            FString TailSegmentName = FString::Printf(TEXT("Tail_%02d_Bone_%02d"), i, j);
            
            // Amplitude decreases toward tip
            float AmplitudeScale = 1.0f - ((float)(j - 1) / 5.0f) * 0.3f; // 100% at base, 70% at tip
            float SegmentAngle = OscillationAngle * AmplitudeScale;
            
            // Apply rotation to tail segment bone
            // (In actual implementation, use SetBoneRotation or similar from Control Rig)
            // This is done via Control Rig graph nodes in practice
            
            // For physics-simulated tails, this code applies animation-driven forces
            // that blend with physics simulation (blend weight controlled externally)
        }
    }
    
    // -------------------- MOMENTUM AND DIRECTION --------------------
    
    // Tails lag behind movement direction (momentum effect)
    // When character turns, tails whip in opposite direction
    // This is handled by physics simulation automatically
    // Animation-driven forces from this function blend with physics
}

void UKaiJaxControlRig::ApplyMemoryPostureModifier(float MemoryIntensity)
{
    // ==================== MEMORY LAYER POSTURE MODIFIERS ====================
    
    // Higher memory layers = more confident posture
    // - Straighten spine at high memory (9 tails)
    // - Lower center of gravity at low memory (3 tails, cautious)
    
    // -------------------- CALCULATE MEMORY INFLUENCE --------------------
    
    MemoryInfluenceOnPosture = FMath::Clamp(MemoryIntensity, 0.0f, 1.0f);
    
    // Derive from ActiveMemoryLayers if MemoryIntensity not provided
    // 3 tails = 0.0 (cautious)
    // 6 tails = 0.5 (neutral)
    // 9 tails = 1.0 (dominant)
    if (MemoryIntensity < 0.0f)
    {
        MemoryInfluenceOnPosture = FMath::Clamp((float)(ActiveMemoryLayers - 3) / 6.0f, 0.0f, 1.0f);
    }
    
    // -------------------- ADJUST SPINE CURVE --------------------
    
    // Low memory (0.0): Spine curves forward (defensive, cautious)
    // High memory (1.0): Spine straight/back (confident, aggressive)
    
    // Spine bend angle: -10° (forward lean) to +5° (back lean)
    float SpineBendAngle = FMath::Lerp(-10.0f, 5.0f, MemoryInfluenceOnPosture);
    
    // Apply to Spine_01 and Spine_02 bones
    // (Implementation via Control Rig graph nodes)
    
    // -------------------- ADJUST SHOULDER HEIGHT --------------------
    
    // Low memory: Shoulders lowered (defensive)
    // High memory: Shoulders raised (alert, scanning)
    
    // Shoulder height offset: -2cm (lowered) to +3cm (raised)
    float ShoulderHeightOffset = FMath::Lerp(-2.0f, 3.0f, MemoryInfluenceOnPosture);
    
    // Apply to Shoulder_L and Shoulder_R bones
    
    // -------------------- ADJUST HEAD TILT --------------------
    
    // Low memory: Head tilted down (alert, cautious)
    // High memory: Head tilted up (scanning, commanding)
    
    // Head tilt angle: -15° (down) to +10° (up)
    float HeadTiltAngle = FMath::Lerp(-15.0f, 10.0f, MemoryInfluenceOnPosture);
    
    // Apply to Head bone
    
    // -------------------- ADJUST TAIL ARC --------------------
    
    // Low memory: Tails low (defensive, not threatening)
    // High memory: Tails high arc (aggressive, crown formation)
    
    // Tail base pitch: -20° (low) to +30° (high arc)
    float TailBasePitch = FMath::Lerp(-20.0f, 30.0f, MemoryInfluenceOnPosture);
    
    // Apply to all 9 Tail_XX base bones
    for (int32 i = 1; i <= 9; ++i)
    {
        FString TailBoneName = FString::Printf(TEXT("Tail_%02d"), i);
        
        // Apply pitch offset to tail base
        // (Implementation via Control Rig graph nodes)
    }
    
    // -------------------- NOTES --------------------
    
    // This function sets posture parameters that are applied via Control Rig graph
    // Actual bone transforms are modified by Control Rig nodes in the editor
    // This code provides the logic and parameter calculation
}

// ==================== HELPER FUNCTIONS ====================

float UKaiJaxControlRig::CalculatePelvisOffsetForAngle(float Angle) const
{
    // Calculate pelvis height offset based on digitigrade angle
    // Lower pelvis to increase leg bend
    // - 0° angle = 0cm offset (standing upright)
    // - 45° angle = -20cm offset (combat crouch)
    
    float MaxOffset = 20.0f; // cm
    return FMath::GetMappedRangeValueClamped(
        FVector2D(0.0f, 45.0f),      // Input range (digitigrade angle)
        FVector2D(0.0f, -MaxOffset), // Output range (pelvis offset, negative to lower)
        Angle
    );
}

FVector UKaiJaxControlRig::TraceToGround(const FVector& StartLocation) const
{
    // Trace downward from foot to find ground contact
    // Returns ground hit location, or StartLocation if no ground found
    
    // -------------------- TRACE SETUP --------------------
    
    FVector TraceStart = StartLocation;
    FVector TraceEnd = StartLocation + FVector(0.0f, 0.0f, -150.0f); // 150cm down
    
    // -------------------- PERFORM TRACE --------------------
    
    // Note: Actual trace requires World context, which Control Rig may not have
    // In practice, this is done in Animation Blueprint or Character class
    // and passed to Control Rig as IK target positions
    
    // FHitResult HitResult;
    // bool bHit = World->LineTraceSingleByChannel(
    //     HitResult, TraceStart, TraceEnd, ECC_Visibility
    // );
    
    // if (bHit)
    // {
    //     return HitResult.Location; // Ground found
    // }
    
    // No ground found, return original position
    return StartLocation;
}

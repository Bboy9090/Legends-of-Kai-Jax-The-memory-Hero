// Copyright Epic Games, Inc. All Rights Reserved.

#pragma once

#include "CoreMinimal.h"
#include "ControlRig.h"
#include "KaiJaxControlRig.generated.h"

/**
 * Control Rig for Kai-Jax character
 * 
 * Handles:
 * - Digitigrade leg IK (two-bone IK with dynamic angle control)
 * - Tail physics integration (9 tails with physics constraints)
 * - Memory layer posture modifiers (3-9 tails affect stance)
 * 
 * Canonical Reference: kai_jax.character.json
 * - Tail count: 9 (immutable)
 * - Evolution: 3 starting → 9 final (sequential only)
 * - Digitigrade legs: Thigh → Calf → Foot → Toe
 * - Memory layers influence posture and confidence
 */
UCLASS()
class KAIJAX_API UKaiJaxControlRig : public UControlRig
{
    GENERATED_BODY()

public:
    UKaiJaxControlRig();

    /**
     * Initialize the Control Rig
     * Sets up IK targets and tail curve controls
     */
    virtual void Initialize(bool bInitRigUnits = true) override;

protected:
    // ==================== DIGITIGRADE LEG CONTROL ====================

    /**
     * Digitigrade angle: 0° = standing upright, 45° = combat-ready crouch
     * Controls the bend angle of the digitigrade legs
     * - 0°: Idle/standing (minimal bend)
     * - 15°: Walking (slight bend)
     * - 30°: Running (moderate bend)
     * - 45°: Combat (maximum bend, spring-loaded)
     */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "IK")
    float DigitigradeAngle = 45.0f;

    /**
     * Enable/disable foot IK
     * When enabled, feet adapt to ground terrain
     */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "IK")
    bool bEnableFootIK = true;

    // ==================== TAIL PHYSICS ====================

    /**
     * Tail sway amount (0.0 = no sway, 1.0 = full sway)
     * Scales the amplitude of tail oscillation
     */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Tails", meta = (ClampMin = "0.0", ClampMax = "1.0"))
    float TailSwayAmount = 1.0f;

    /**
     * Tail sway speed (oscillation frequency)
     * Higher values = faster tail motion
     */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Tails", meta = (ClampMin = "0.0", ClampMax = "10.0"))
    float TailSwaySpeed = 2.0f;

    /**
     * Enable/disable tail physics simulation
     * When disabled, tails follow animation only
     */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Tails")
    bool bEnableTailPhysics = true;

    // ==================== MEMORY LAYER INFLUENCE ====================

    /**
     * Active memory layers (3-9 tails unlocked)
     * From canonical lockfile:
     * - Starting: 3 tails (cautious, low confidence)
     * - Final: 9 tails (dominant, maximum confidence)
     * - Unlock: Sequential only (3→4→5→6→7→8→9)
     */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Memory", meta = (ClampMin = "3", ClampMax = "9"))
    int32 ActiveMemoryLayers = 3;

    /**
     * Memory influence on posture (0.0 = cautious, 1.0 = dominant)
     * Calculated from ActiveMemoryLayers:
     * - 3 tails = 0.0 (cautious, defensive posture)
     * - 6 tails = 0.5 (neutral posture)
     * - 9 tails = 1.0 (dominant, aggressive posture)
     */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Memory", meta = (ClampMin = "0.0", ClampMax = "1.0"))
    float MemoryInfluenceOnPosture = 0.0f;

public:
    // ==================== UPDATE FUNCTIONS ====================

    /**
     * Update digitigrade leg IK
     * Called each frame to adjust leg positions based on ground terrain
     * 
     * @param DeltaTime Time since last frame
     */
    UFUNCTION(BlueprintCallable, Category = "IK")
    void UpdateDigitigradeIK(float DeltaTime);

    /**
     * Update tail physics
     * Called each frame to apply oscillating motion to tail bones
     * 
     * @param DeltaTime Time since last frame
     * @param MovementVelocity Current character velocity (for sway scaling)
     */
    UFUNCTION(BlueprintCallable, Category = "Tails")
    void UpdateTailPhysics(float DeltaTime, FVector MovementVelocity);

    /**
     * Apply memory layer posture modifiers
     * Adjusts spine, shoulders, head, and tail positioning based on memory intensity
     * 
     * High memory (7-9 tails):
     * - Spine straight
     * - Shoulders back
     * - Head up (scanning)
     * - Tails arc high (aggressive)
     * 
     * Low memory (3-4 tails):
     * - Spine slightly forward
     * - Shoulders lowered
     * - Head down (alert)
     * - Tails low (defensive)
     * 
     * @param MemoryIntensity Scalar 0.0-1.0 (derived from ActiveMemoryLayers)
     */
    UFUNCTION(BlueprintCallable, Category = "Memory")
    void ApplyMemoryPostureModifier(float MemoryIntensity);

protected:
    // ==================== INTERNAL HELPERS ====================

    /**
     * Cached IK target positions for foot IK smoothing
     */
    FVector LeftFootIKTarget_Previous;
    FVector RightFootIKTarget_Previous;

    /**
     * Tail oscillation phase accumulators (one per tail)
     * Used to generate smooth sine wave motion for each tail
     */
    UPROPERTY(Transient)
    TArray<float> TailPhaseAccumulators;

    /**
     * Calculate pelvis height offset based on digitigrade angle
     * Lower pelvis to increase leg bend (higher angle = lower pelvis)
     * 
     * @param Angle Digitigrade angle (0-45°)
     * @return Pelvis height offset in cm
     */
    float CalculatePelvisOffsetForAngle(float Angle) const;

    /**
     * Trace to ground to find IK target position
     * Performs line trace downward from foot bone to find ground contact
     * 
     * @param StartLocation Starting position for trace (foot bone location)
     * @return Ground contact position, or StartLocation if no ground found
     */
    FVector TraceToGround(const FVector& StartLocation) const;
};

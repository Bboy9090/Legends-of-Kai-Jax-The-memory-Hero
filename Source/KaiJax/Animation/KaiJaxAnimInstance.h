#pragma once

#include "CoreMinimal.h"
#include "Animation/AnimInstance.h"
#include "KaiJaxAnimInstance.generated.h"

UENUM(BlueprintType)
enum class EKaiJaxAnimState : uint8
{
    Idle = 0,
    Walking = 1,
    Running = 2,
    Jumping = 3,
    Falling = 4,
    Landing = 5,
    Attacking = 6,
    TailStrike = 7,
    Parrying = 8,
    Dashing = 9,
    Staggered = 10,
    Dead = 11
};

UCLASS()
class KAIJAX_API UKaiJaxAnimInstance : public UAnimInstance
{
    GENERATED_BODY()

public:
    UKaiJaxAnimInstance();

    virtual void NativeInitializeAnimation() override;
    virtual void NativeUpdateAnimation(float DeltaSeconds) override;

protected:
    // Movement variables
    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Movement")
    float Speed = 0.0f;

    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Movement")
    float Direction = 0.0f;

    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Movement")
    bool bIsInAir = false;

    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Movement")
    bool bIsFalling = false;

    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Movement")
    float VerticalVelocity = 0.0f;

    // Combat variables
    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Combat")
    EKaiJaxAnimState CurrentState = EKaiJaxAnimState::Idle;

    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Combat")
    bool bIsAttacking = false;

    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Combat")
    int32 ComboCount = 0;

    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Combat")
    float PostureHealthPercent = 1.0f;

    // Tail variables (for procedural tail animation)
    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Tails")
    int32 ActiveTailCount = 3;

    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Tails")
    TArray<bool> TailActiveStates;

    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Tails")
    float TailSwayIntensity = 1.0f;

    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Tails")
    FVector TailSwayDirection;

    // Memory/Power level (affects glow intensity)
    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Power")
    int32 MemoryLayersActive = 3;

    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Power")
    float CorruptionLevel = 0.0f;

    // Owner reference
    UPROPERTY(BlueprintReadOnly, Category = "References")
    class AKaiJaxCharacter* OwnerCharacter;

    UPROPERTY(BlueprintReadOnly, Category = "References")
    class UCharacterMovementComponent* MovementComponent;

public:
    // Tail Animation Control
    UFUNCTION(BlueprintCallable, Category = "Tails")
    void SetTailSwayParameters(float Intensity, FVector Direction);

    UFUNCTION(BlueprintCallable, Category = "Tails")
    void TriggerTailStrike(int32 TailIndex);

    UFUNCTION(BlueprintCallable, Category = "Tails")
    void SetActiveTailCount(int32 Count);

    // State Management
    UFUNCTION(BlueprintCallable, Category = "State")
    void SetAnimState(EKaiJaxAnimState NewState);

    UFUNCTION(BlueprintPure, Category = "State")
    EKaiJaxAnimState GetCurrentAnimState() const { return CurrentState; }

    // Combat Animation Triggers
    UFUNCTION(BlueprintCallable, Category = "Combat")
    void TriggerAttackAnimation(int32 AttackIndex);

    UFUNCTION(BlueprintCallable, Category = "Combat")
    void TriggerParryAnimation();

    UFUNCTION(BlueprintCallable, Category = "Combat")
    void TriggerDashAnimation(FVector DashDirection);

    UFUNCTION(BlueprintCallable, Category = "Combat")
    void TriggerStaggerAnimation();

private:
    void UpdateMovementVariables();
    void UpdateTailAnimation(float DeltaSeconds);
    void CalculateTailSway(float DeltaSeconds);
};

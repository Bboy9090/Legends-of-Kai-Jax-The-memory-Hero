#include "KaiJaxAnimInstance.h"
#include "../Characters/KaiJaxCharacter.h"
#include "GameFramework/CharacterMovementComponent.h"

UKaiJaxAnimInstance::UKaiJaxAnimInstance()
{
    // Initialize tail states for 9 tails
    TailActiveStates.Init(false, 9);
    TailActiveStates[0] = true; // Tail 1 active
    TailActiveStates[1] = true; // Tail 2 active
    TailActiveStates[2] = true; // Tail 3 active
}

void UKaiJaxAnimInstance::NativeInitializeAnimation()
{
    Super::NativeInitializeAnimation();

    // Cache owner references
    if (AActor* Owner = TryGetPawnOwner())
    {
        OwnerCharacter = Cast<AKaiJaxCharacter>(Owner);
        if (OwnerCharacter)
        {
            MovementComponent = OwnerCharacter->GetCharacterMovement();
        }
    }
}

void UKaiJaxAnimInstance::NativeUpdateAnimation(float DeltaSeconds)
{
    Super::NativeUpdateAnimation(DeltaSeconds);

    if (!OwnerCharacter || !MovementComponent) return;

    UpdateMovementVariables();
    UpdateTailAnimation(DeltaSeconds);
}

void UKaiJaxAnimInstance::UpdateMovementVariables()
{
    if (!MovementComponent) return;

    // Calculate speed and direction
    FVector Velocity = MovementComponent->Velocity;
    Speed = Velocity.Size2D();
    
    // Calculate movement direction relative to actor forward
    if (Speed > 0.0f)
    {
        FVector Forward = OwnerCharacter->GetActorForwardVector();
        FVector Right = OwnerCharacter->GetActorRightVector();
        
        float ForwardDot = FVector::DotProduct(Velocity.GetSafeNormal2D(), Forward);
        float RightDot = FVector::DotProduct(Velocity.GetSafeNormal2D(), Right);
        
        Direction = FMath::Atan2(RightDot, ForwardDot) * (180.0f / PI);
    }

    // Air state
    bIsInAir = MovementComponent->IsFalling();
    bIsFalling = Velocity.Z < -100.0f;
    VerticalVelocity = Velocity.Z;

    // Update state based on movement
    if (CurrentState != EKaiJaxAnimState::Attacking && 
        CurrentState != EKaiJaxAnimState::TailStrike &&
        CurrentState != EKaiJaxAnimState::Parrying &&
        CurrentState != EKaiJaxAnimState::Dashing &&
        CurrentState != EKaiJaxAnimState::Staggered &&
        CurrentState != EKaiJaxAnimState::Dead)
    {
        if (bIsInAir)
        {
            CurrentState = bIsFalling ? EKaiJaxAnimState::Falling : EKaiJaxAnimState::Jumping;
        }
        else if (Speed > 300.0f)
        {
            CurrentState = EKaiJaxAnimState::Running;
        }
        else if (Speed > 10.0f)
        {
            CurrentState = EKaiJaxAnimState::Walking;
        }
        else
        {
            CurrentState = EKaiJaxAnimState::Idle;
        }
    }

    // Get combat stats from owner
    if (OwnerCharacter)
    {
        ActiveTailCount = OwnerCharacter->GetActiveTailCount();
        PostureHealthPercent = OwnerCharacter->GetPostureHealthPercent();
    }
}

void UKaiJaxAnimInstance::UpdateTailAnimation(float DeltaSeconds)
{
    CalculateTailSway(DeltaSeconds);

    // Update tail active states based on ActiveTailCount
    for (int32 i = 0; i < 9; ++i)
    {
        TailActiveStates[i] = (i < ActiveTailCount);
    }
}

void UKaiJaxAnimInstance::CalculateTailSway(float DeltaSeconds)
{
    if (!MovementComponent) return;

    FVector Velocity = MovementComponent->Velocity;
    
    // Tail sway based on movement
    if (Speed > 10.0f)
    {
        // Tails sway opposite to movement direction
        TailSwayDirection = -Velocity.GetSafeNormal() * TailSwayIntensity;
        
        // Increase sway during running
        if (Speed > 300.0f)
        {
            TailSwayIntensity = FMath::Lerp(TailSwayIntensity, 1.5f, DeltaSeconds * 5.0f);
        }
        else
        {
            TailSwayIntensity = FMath::Lerp(TailSwayIntensity, 1.0f, DeltaSeconds * 5.0f);
        }
    }
    else
    {
        // Idle sway - gentle breathing motion
        TailSwayIntensity = FMath::Lerp(TailSwayIntensity, 0.3f, DeltaSeconds * 2.0f);
        
        // Subtle oscillation
        float Time = GetWorld()->GetTimeSeconds();
        TailSwayDirection = FVector(
            FMath::Sin(Time * 0.5f) * 0.1f,
            FMath::Cos(Time * 0.3f) * 0.1f,
            0.0f
        );
    }

    // Combat state affects tail behavior
    if (CurrentState == EKaiJaxAnimState::Attacking || 
        CurrentState == EKaiJaxAnimState::TailStrike)
    {
        TailSwayIntensity = 2.0f; // More aggressive motion during attacks
    }
}

void UKaiJaxAnimInstance::SetTailSwayParameters(float Intensity, FVector Direction)
{
    TailSwayIntensity = Intensity;
    TailSwayDirection = Direction;
}

void UKaiJaxAnimInstance::TriggerTailStrike(int32 TailIndex)
{
    if (TailIndex >= 0 && TailIndex < 9)
    {
        CurrentState = EKaiJaxAnimState::TailStrike;
        // Tail strike animation will reset state via AnimNotify
    }
}

void UKaiJaxAnimInstance::SetActiveTailCount(int32 Count)
{
    ActiveTailCount = FMath::Clamp(Count, 3, 9);
}

void UKaiJaxAnimInstance::SetAnimState(EKaiJaxAnimState NewState)
{
    CurrentState = NewState;
}

void UKaiJaxAnimInstance::TriggerAttackAnimation(int32 AttackIndex)
{
    CurrentState = EKaiJaxAnimState::Attacking;
    ComboCount = AttackIndex;
}

void UKaiJaxAnimInstance::TriggerParryAnimation()
{
    CurrentState = EKaiJaxAnimState::Parrying;
}

void UKaiJaxAnimInstance::TriggerDashAnimation(FVector DashDirection)
{
    CurrentState = EKaiJaxAnimState::Dashing;
    // Use dash direction for lean animation
}

void UKaiJaxAnimInstance::TriggerStaggerAnimation()
{
    CurrentState = EKaiJaxAnimState::Staggered;
}

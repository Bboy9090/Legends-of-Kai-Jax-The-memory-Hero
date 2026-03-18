#include "KaiJaxCombatComponent.h"
#include "GameFramework/Character.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "Animation/AnimInstance.h"
#include "NiagaraFunctionLibrary.h"
#include "NiagaraComponent.h"

UKaiJaxCombatComponent::UKaiJaxCombatComponent()
{
    PrimaryComponentTick.bCanEverTick = true;
}

void UKaiJaxCombatComponent::BeginPlay()
{
    Super::BeginPlay();
    
    // Initialize combo state
    ComboState.ActiveTails.Empty();
    ComboState.SynergyBonus = 0.0f;
    ComboState.ComboCounter = 0;
    ComboState.ComboTimer = 0.0f;
}

void UKaiJaxCombatComponent::TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction)
{
    Super::TickComponent(DeltaTime, TickType, ThisTickFunction);

    UpdateComboTimer(DeltaTime);
    DecayCorruption(DeltaTime);
    UpdateStanceBasedOnCombat();
}

void UKaiJaxCombatComponent::LightAttack()
{
    ACharacter* Owner = Cast<ACharacter>(GetOwner());
    if (!Owner) return;

    if (LightAttackMontage)
    {
        Owner->PlayAnimMontage(LightAttackMontage);
        IncrementCombo();
        
        // Light attacks build corruption slowly
        AddCorruption(2.0f);
    }
}

void UKaiJaxCombatComponent::HeavyAttack()
{
    ACharacter* Owner = Cast<ACharacter>(GetOwner());
    if (!Owner) return;

    if (HeavyAttackMontage)
    {
        Owner->PlayAnimMontage(HeavyAttackMontage);
        IncrementCombo();
        
        // Heavy attacks build more corruption
        AddCorruption(5.0f);
    }
}

void UKaiJaxCombatComponent::TailStrike(ETailAbility TailToUse)
{
    ACharacter* Owner = Cast<ACharacter>(GetOwner());
    if (!Owner) return;

    // Check if tail is available
    if (TailToUse == ETailAbility::None) return;

    if (TailStrikeMontage)
    {
        Owner->PlayAnimMontage(TailStrikeMontage);
        ActivateTailAbility(TailToUse);
        IncrementCombo();
        
        // Tail attacks build significant corruption
        AddCorruption(10.0f);
    }
}

void UKaiJaxCombatComponent::Parry()
{
    ACharacter* Owner = Cast<ACharacter>(GetOwner());
    if (!Owner) return;

    if (ParryMontage)
    {
        Owner->PlayAnimMontage(ParryMontage);
        
        // Successful parry activates Bond tail
        ActivateTailAbility(ETailAbility::Bond_ParryCounter);
    }
}

void UKaiJaxCombatComponent::Dash(FVector Direction)
{
    ACharacter* Owner = Cast<ACharacter>(GetOwner());
    if (!Owner) return;

    if (DashMontage)
    {
        Owner->PlayAnimMontage(DashMontage);
        
        // Apply dash movement
        if (UCharacterMovementComponent* Movement = Owner->GetCharacterMovement())
        {
            Direction.Normalize();
            Owner->LaunchCharacter(Direction * 1500.0f, true, true);
        }
        
        // Dash uses Hunter tail
        ActivateTailAbility(ETailAbility::Hunter_DashPursuit);
        AddCorruption(3.0f);
    }
}

void UKaiJaxCombatComponent::ActivateCrowdControl()
{
    bCrowdControlActive = true;
    ZoneControlRadius = 8.0f;
    SetStance(EKaiJaxStance::Dominant);
    
    // Spawn crowd control VFX
    if (CrowdControlPulseEffect)
    {
        UNiagaraFunctionLibrary::SpawnSystemAtLocation(
            GetWorld(),
            CrowdControlPulseEffect,
            GetOwner()->GetActorLocation()
        );
    }
    
    // Significant corruption cost
    AddCorruption(20.0f);
}

void UKaiJaxCombatComponent::DeactivateCrowdControl()
{
    bCrowdControlActive = false;
    ZoneControlRadius = 5.0f;
}

void UKaiJaxCombatComponent::ActivateTailAbility(ETailAbility Ability)
{
    if (Ability == ETailAbility::None) return;
    
    if (!ComboState.ActiveTails.Contains(Ability))
    {
        ComboState.ActiveTails.Add(Ability);
        
        // Calculate synergy bonus based on active tails
        ComboState.SynergyBonus = ComboState.ActiveTails.Num() * 10.0f;
        
        SpawnTailVFX(Ability);
    }
}

void UKaiJaxCombatComponent::DeactivateTailAbility(ETailAbility Ability)
{
    ComboState.ActiveTails.Remove(Ability);
    ComboState.SynergyBonus = ComboState.ActiveTails.Num() * 10.0f;
}

bool UKaiJaxCombatComponent::IsTailAbilityActive(ETailAbility Ability) const
{
    return ComboState.ActiveTails.Contains(Ability);
}

void UKaiJaxCombatComponent::IncrementCombo()
{
    ComboState.ComboCounter++;
    ComboState.ComboTimer = 3.0f; // 3 second combo window
}

void UKaiJaxCombatComponent::ResetCombo()
{
    ComboState.ComboCounter = 0;
    ComboState.ComboTimer = 0.0f;
    ComboState.ActiveTails.Empty();
    ComboState.SynergyBonus = 0.0f;
}

float UKaiJaxCombatComponent::GetComboMultiplier() const
{
    // Combo multiplier: 1.0 + (combo count * 0.1) + synergy bonus
    return 1.0f + (ComboState.ComboCounter * 0.1f) + (ComboState.SynergyBonus * 0.01f);
}

void UKaiJaxCombatComponent::SetStance(EKaiJaxStance NewStance)
{
    CurrentStance = NewStance;
}

void UKaiJaxCombatComponent::AddCorruption(float Amount)
{
    CorruptionLevel = FMath::Clamp(CorruptionLevel + Amount, 0.0f, 100.0f);
    
    // At high corruption, abilities become unstable
    if (IsCorrupted())
    {
        // Trigger visual corruption effects
        // Reduce damage output
    }
}

void UKaiJaxCombatComponent::UpdateComboTimer(float DeltaTime)
{
    if (ComboState.ComboTimer > 0.0f)
    {
        ComboState.ComboTimer -= DeltaTime;
        
        if (ComboState.ComboTimer <= 0.0f)
        {
            ResetCombo();
        }
    }
}

void UKaiJaxCombatComponent::DecayCorruption(float DeltaTime)
{
    // Corruption decays slowly over time
    if (CorruptionLevel > 0.0f)
    {
        CorruptionLevel = FMath::Max(0.0f, CorruptionLevel - (2.0f * DeltaTime));
    }
}

void UKaiJaxCombatComponent::UpdateStanceBasedOnCombat()
{
    if (bCrowdControlActive)
    {
        CurrentStance = EKaiJaxStance::Dominant;
    }
    else if (CorruptionLevel > 50.0f)
    {
        CurrentStance = EKaiJaxStance::Aggressive;
    }
    else if (ComboState.ComboCounter > 5)
    {
        CurrentStance = EKaiJaxStance::Aggressive;
    }
    else
    {
        CurrentStance = EKaiJaxStance::Neutral;
    }
}

void UKaiJaxCombatComponent::SpawnTailVFX(ETailAbility Ability)
{
    if (!TailGlowEffect) return;
    
    FVector SpawnLocation = GetOwner()->GetActorLocation();
    FRotator SpawnRotation = GetOwner()->GetActorRotation();
    
    // Adjust spawn based on tail type
    switch (Ability)
    {
        case ETailAbility::Bond_ParryCounter:
            // Blue protective glow
            break;
        case ETailAbility::Hunter_DashPursuit:
            // Red aggressive trail
            break;
        case ETailAbility::Thread_WebPull:
            // Purple web strands
            break;
        case ETailAbility::Quill_Retaliation:
            // Yellow spike burst
            break;
        case ETailAbility::Shade_Stealth:
            // Dark shadow cloak
            break;
        case ETailAbility::Anchor_Root:
            // Brown earth connection
            break;
        case ETailAbility::Echo_AfterImage:
            // Cyan after-images
            break;
        case ETailAbility::Rift_RealityTear:
            // Purple reality cracks
            break;
        case ETailAbility::Crown_Aura:
            // Golden command aura
            break;
        default:
            break;
    }
    
    UNiagaraFunctionLibrary::SpawnSystemAtLocation(
        GetWorld(),
        TailGlowEffect,
        SpawnLocation,
        SpawnRotation
    );
}

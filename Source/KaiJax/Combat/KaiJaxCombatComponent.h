#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "KaiJaxCombatComponent.generated.h"

UENUM(BlueprintType)
enum class EKaiJaxStance : uint8
{
    Neutral = 0,
    Aggressive = 1,
    Defensive = 2,
    Dominant = 3
};

UENUM(BlueprintType)
enum class ETailAbility : uint8
{
    None = 0,
    Bond_ParryCounter = 1,      // Tail 1: Parry, counter, revive
    Hunter_DashPursuit = 2,     // Tail 2: Dash, pursuit, execute
    Thread_WebPull = 3,         // Tail 3: Web, pull, group
    Quill_Retaliation = 4,      // Tail 4: Retaliation, posture damage
    Shade_Stealth = 5,          // Tail 5: Stealth, threat reset
    Anchor_Root = 6,            // Tail 6: Anti-knockback, root
    Echo_AfterImage = 7,        // Tail 7: After-image, repeat
    Rift_RealityTear = 8,       // Tail 8: Reality tear, AOE
    Crown_Aura = 9              // Tail 9: Aura, command
};

USTRUCT(BlueprintType)
struct FKaiJaxComboData
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    TArray<ETailAbility> ActiveTails;

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    float SynergyBonus = 0.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    int32 ComboCounter = 0;

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    float ComboTimer = 0.0f;
};

UCLASS(ClassGroup=(Custom), meta=(BlueprintSpawnableComponent))
class KAIJAX_API UKaiJaxCombatComponent : public UActorComponent
{
    GENERATED_BODY()

public:
    UKaiJaxCombatComponent();

protected:
    virtual void BeginPlay() override;

    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Combat")
    EKaiJaxStance CurrentStance = EKaiJaxStance::Neutral;

    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Combat")
    FKaiJaxComboData ComboState;

    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Combat")
    float ZoneControlRadius = 5.0f;

    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Combat")
    float CorruptionLevel = 0.0f;

    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Combat")
    bool bCrowdControlActive = false;

    // Animation Montages
    UPROPERTY(EditDefaultsOnly, Category = "Animation")
    class UAnimMontage* LightAttackMontage;

    UPROPERTY(EditDefaultsOnly, Category = "Animation")
    class UAnimMontage* HeavyAttackMontage;

    UPROPERTY(EditDefaultsOnly, Category = "Animation")
    class UAnimMontage* TailStrikeMontage;

    UPROPERTY(EditDefaultsOnly, Category = "Animation")
    class UAnimMontage* ParryMontage;

    UPROPERTY(EditDefaultsOnly, Category = "Animation")
    class UAnimMontage* DashMontage;

    // VFX References
    UPROPERTY(EditDefaultsOnly, Category = "VFX")
    class UNiagaraSystem* TailGlowEffect;

    UPROPERTY(EditDefaultsOnly, Category = "VFX")
    class UNiagaraSystem* MemoryActivationEffect;

    UPROPERTY(EditDefaultsOnly, Category = "VFX")
    class UNiagaraSystem* CrowdControlPulseEffect;

public:
    virtual void TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction) override;

    // Combat Actions
    UFUNCTION(BlueprintCallable, Category = "Combat")
    void LightAttack();

    UFUNCTION(BlueprintCallable, Category = "Combat")
    void HeavyAttack();

    UFUNCTION(BlueprintCallable, Category = "Combat")
    void TailStrike(ETailAbility TailToUse);

    UFUNCTION(BlueprintCallable, Category = "Combat")
    void Parry();

    UFUNCTION(BlueprintCallable, Category = "Combat")
    void Dash(FVector Direction);

    UFUNCTION(BlueprintCallable, Category = "Combat")
    void ActivateCrowdControl();

    UFUNCTION(BlueprintCallable, Category = "Combat")
    void DeactivateCrowdControl();

    // Tail Abilities
    UFUNCTION(BlueprintCallable, Category = "Tails")
    void ActivateTailAbility(ETailAbility Ability);

    UFUNCTION(BlueprintCallable, Category = "Tails")
    void DeactivateTailAbility(ETailAbility Ability);

    UFUNCTION(BlueprintPure, Category = "Tails")
    bool IsTailAbilityActive(ETailAbility Ability) const;

    // Combo System
    UFUNCTION(BlueprintCallable, Category = "Combat")
    void IncrementCombo();

    UFUNCTION(BlueprintCallable, Category = "Combat")
    void ResetCombo();

    UFUNCTION(BlueprintPure, Category = "Combat")
    float GetComboMultiplier() const;

    // Stance Management
    UFUNCTION(BlueprintCallable, Category = "Combat")
    void SetStance(EKaiJaxStance NewStance);

    UFUNCTION(BlueprintPure, Category = "Combat")
    EKaiJaxStance GetCurrentStance() const { return CurrentStance; }

    // Corruption Management
    UFUNCTION(BlueprintCallable, Category = "Combat")
    void AddCorruption(float Amount);

    UFUNCTION(BlueprintPure, Category = "Combat")
    bool IsCorrupted() const { return CorruptionLevel > 80.0f; }

    UFUNCTION(BlueprintPure, Category = "Combat")
    float GetCorruptionPercent() const { return CorruptionLevel / 100.0f; }

private:
    void UpdateComboTimer(float DeltaTime);
    void DecayCorruption(float DeltaTime);
    void UpdateStanceBasedOnCombat();
    void SpawnTailVFX(ETailAbility Ability);
};

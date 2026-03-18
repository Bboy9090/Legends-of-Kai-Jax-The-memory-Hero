#pragma once

#include "CoreMinimal.h"
#include "NiagaraSystem.h"
#include "KaiJaxVFXTypes.generated.h"

UENUM(BlueprintType)
enum class EKaiJaxVFXType : uint8
{
    None = 0,
    TailGlow = 1,
    MemoryActivation = 2,
    CrowdControlPulse = 3,
    DashTrail = 4,
    ParryFlash = 5,
    CorruptionAura = 6,
    TierTransition = 7,
    AttackImpact = 8,
    UltimateCharge = 9
};

USTRUCT(BlueprintType)
struct FKaiJaxVFXConfig
{
    GENERATED_BODY()

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly)
    EKaiJaxVFXType VFXType = EKaiJaxVFXType::None;

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly)
    UNiagaraSystem* NiagaraSystem = nullptr;

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly)
    FLinearColor BaseColor = FLinearColor::White;

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly)
    float Scale = 1.0f;

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly)
    float Duration = 1.0f;

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly)
    bool bAttachToActor = true;

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly)
    FName AttachSocketName = NAME_None;
};

USTRUCT(BlueprintType)
struct FTailVFXConfig
{
    GENERATED_BODY()

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly)
    int32 TailIndex = 0;

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly)
    FString TailName;

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly)
    FLinearColor ActiveColor = FLinearColor::Blue;

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly)
    FLinearColor PoweredColor = FLinearColor::White;

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly)
    UNiagaraSystem* ActivationEffect = nullptr;

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly)
    UNiagaraSystem* AbilityEffect = nullptr;

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly)
    float GlowIntensity = 1.0f;
};

UCLASS(BlueprintType)
class KAIJAX_API UKaiJaxVFXLibrary : public UObject
{
    GENERATED_BODY()

public:
    // Tail VFX configurations (1-9)
    UPROPERTY(EditDefaultsOnly, Category = "Tails")
    TArray<FTailVFXConfig> TailVFXConfigs;

    // General VFX configurations
    UPROPERTY(EditDefaultsOnly, Category = "General")
    TMap<EKaiJaxVFXType, FKaiJaxVFXConfig> VFXConfigs;

    // Default constructor
    UKaiJaxVFXLibrary();

    // Get VFX for specific tail
    UFUNCTION(BlueprintPure, Category = "VFX")
    FTailVFXConfig GetTailVFX(int32 TailIndex) const;

    // Get general VFX config
    UFUNCTION(BlueprintPure, Category = "VFX")
    FKaiJaxVFXConfig GetVFXConfig(EKaiJaxVFXType VFXType) const;

    // Initialize default configurations
    void InitializeDefaultConfigs();
};

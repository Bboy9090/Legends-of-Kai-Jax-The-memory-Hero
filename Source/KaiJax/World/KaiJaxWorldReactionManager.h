#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "Camera/CameraShakeBase.h"
#include "KaiJaxWorldReactionManager.generated.h"

UENUM(BlueprintType)
enum class ETailTier : uint8
{
    Nascent = 0,    // 3 tails
    Awakened = 1,   // 4-5 tails
    Ascendant = 2,  // 6-7 tails
    Apex = 3,       // 8 tails
    Transcendent = 4 // 9 tails
};

USTRUCT(BlueprintType)
struct FWorldReactionData
{
    GENERATED_BODY()

    // Enemy AI Reactions
    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    float FodderConfidence = 1.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    float EliteTactics = 0.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    bool bEnemiesFleeOnSight = false;

    // Music/Audio Reactions
    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    float CombatMusicIntensity = 0.5f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    float PercussionIntensity = 0.5f;

    // NPC Reactions
    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    float NPCFearLevel = 0.0f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    FString DefaultAttitude = TEXT("Neutral");

    // Environmental Reactions
    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    bool bEnvironmentReacts = false;

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    float EnvironmentalIntensity = 0.0f;
};

UCLASS()
class KAIJAX_API AKaiJaxWorldReactionManager : public AActor
{
    GENERATED_BODY()

public:
    AKaiJaxWorldReactionManager();

protected:
    virtual void BeginPlay() override;

    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Reactions")
    ETailTier CurrentTier = ETailTier::Nascent;

    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Reactions")
    FWorldReactionData CurrentReactions;

    // Tier-specific reaction data
    UPROPERTY(EditDefaultsOnly, Category = "Reactions|Tiers")
    TMap<ETailTier, FWorldReactionData> TierReactions;

    // Camera shake class for environmental effects
    UPROPERTY(EditDefaultsOnly, Category = "Reactions|Environment")
    TSubclassOf<UCameraShakeBase> EnvironmentalCameraShake;

public:
    virtual void Tick(float DeltaTime) override;

    UFUNCTION(BlueprintCallable, Category = "World Reactions")
    void UpdateTailTier(int32 TailCount);

    UFUNCTION(BlueprintCallable, Category = "World Reactions")
    void TriggerWorldReaction();

    UFUNCTION(BlueprintPure, Category = "World Reactions")
    ETailTier GetCurrentTier() const { return CurrentTier; }

    UFUNCTION(BlueprintPure, Category = "World Reactions")
    FWorldReactionData GetCurrentReactions() const { return CurrentReactions; }

    // Specific reaction triggers
    UFUNCTION(BlueprintCallable, Category = "World Reactions|AI")
    void NotifyEnemiesOfPresence(FVector Location, float Radius);

    UFUNCTION(BlueprintCallable, Category = "World Reactions|Music")
    void UpdateCombatMusic(float Intensity);

    UFUNCTION(BlueprintCallable, Category = "World Reactions|Environment")
    void TriggerEnvironmentalEffect(FVector Location);

    // Events for Blueprint binding
    DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnTierChanged, ETailTier, NewTier);
    
    UPROPERTY(BlueprintAssignable, Category = "Events")
    FOnTierChanged OnTierChanged;

private:
    void InitializeTierReactions();
    ETailTier CalculateTierFromTailCount(int32 TailCount);
    void ApplyTierReactions(ETailTier NewTier);
};

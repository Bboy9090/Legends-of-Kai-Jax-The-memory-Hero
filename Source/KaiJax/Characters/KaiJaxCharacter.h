#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "InputActionValue.h"
#include "KaiJaxCharacterData.h"
#include "KaiJaxCharacter.generated.h"

UENUM(BlueprintType)
enum class ETailState : uint8
{
    Inactive = 0,
    Active = 1,
    Powered = 2
};

UCLASS()
class KAIJAX_API AKaiJaxCharacter : public ACharacter
{
    GENERATED_BODY()

public:
    AKaiJaxCharacter();

protected:
    // Tail system
    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Tails")
    int32 ActiveTailCount = 3;

    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Tails")
    TArray<ETailState> TailStates;

    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Tails")
    float TailEnergy = 0.0f;

    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Tails")
    float MaxTailEnergy = 100.0f;

    // Memory system
    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Memory")
    int32 UnlockedMemoryLayers = 3;

    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Memory")
    TSet<int32> ActiveMemories;

    // Combat state
    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Combat")
    float Health = 100.0f;

    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Combat")
    float MaxHealth = 100.0f;

    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Combat")
    float Stamina = 100.0f;

    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Combat")
    float MaxStamina = 100.0f;

    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Combat")
    float PostureHealth = 50.0f;

    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Combat")
    float MaxPostureHealth = 50.0f;

    // Skeletal mesh components for tails
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Tails")
    class USkeletalMeshComponent* TailMesh;

    virtual void BeginPlay() override;
    virtual void Tick(float DeltaTime) override;

public:
    // Tail management
    // Unlocks the next tail in sequence (count progression: 3→4→5→6→7→8→9)
    // TailNumber is 0-indexed (0-8), pass ActiveTailCount as the next tail to unlock
    // E.g., with 3 active tails, call UnlockTail(3) to unlock 4th tail
    // Enforces sequential-only unlock per README_CANON.md
    // Skipping tails is DISALLOWED and will be ignored
    UFUNCTION(BlueprintCallable, Category = "Tails")
    void UnlockTail(int32 TailNumber);

    UFUNCTION(BlueprintCallable, Category = "Tails")
    void UpdateTailVisuals();
    
    UFUNCTION(BlueprintCallable, Category = "Tails")
    void ApplyTailTierReaction(int32 CurrentTailCount);

    UFUNCTION(BlueprintPure, Category = "Tails")
    int32 GetActiveTailCount() const { return ActiveTailCount; }
    
    UFUNCTION(BlueprintPure, Category = "Tails")
    FTailTierReaction GetCurrentTailTierReaction() const;

    // Memory management
    UFUNCTION(BlueprintCallable, Category = "Memory")
    void ActivateMemoryLayer(int32 LayerNumber);

    UFUNCTION(BlueprintPure, Category = "Memory")
    bool HasMemory(int32 LayerNumber) const { return ActiveMemories.Contains(LayerNumber); }

    // Combat
    // Note: This is a custom damage function, not the UE damage pipeline entry point.
    // For full UE5 damage system integration, override:
    // float AActor::TakeDamage(float DamageAmount, FDamageEvent const& DamageEvent,
    //                          AController* EventInstigator, AActor* DamageCauser)
    UFUNCTION(BlueprintCallable, Category = "Combat")
    void ApplyDamage(float DamageAmount);

    UFUNCTION(BlueprintCallable, Category = "Combat")
    void RegenerateStamina(float DeltaTime);

    UFUNCTION(BlueprintPure, Category = "Combat")
    float GetHealthPercent() const { return Health / MaxHealth; }

    UFUNCTION(BlueprintPure, Category = "Combat")
    float GetPostureHealthPercent() const { return PostureHealth / MaxPostureHealth; }
};

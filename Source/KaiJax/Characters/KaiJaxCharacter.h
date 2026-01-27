#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "InputActionValue.h"
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

    // Skeletal mesh components for tails
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Tails")
    class USkeletalMeshComponent* TailMesh;

    virtual void BeginPlay() override;
    virtual void Tick(float DeltaTime) override;

public:
    // Tail management
    UFUNCTION(BlueprintCallable, Category = "Tails")
    void UnlockTail(int32 TailNumber);

    UFUNCTION(BlueprintCallable, Category = "Tails")
    void UpdateTailVisuals();

    UFUNCTION(BlueprintPure, Category = "Tails")
    int32 GetActiveTailCount() const { return ActiveTailCount; }

    // Memory management
    UFUNCTION(BlueprintCallable, Category = "Memory")
    void ActivateMemoryLayer(int32 LayerNumber);

    UFUNCTION(BlueprintPure, Category = "Memory")
    bool HasMemory(int32 LayerNumber) const { return ActiveMemories.Contains(LayerNumber); }

    // Combat
    UFUNCTION(BlueprintCallable, Category = "Combat")
    void TakeDamage(float DamageAmount);

    UFUNCTION(BlueprintCallable, Category = "Combat")
    void RegenerateStamina(float DeltaTime);

    UFUNCTION(BlueprintPure, Category = "Combat")
    float GetHealthPercent() const { return Health / MaxHealth; }

    UFUNCTION(BlueprintPure, Category = "Combat")
    float GetPostureHealthPercent() const { return PostureHealth / 100.0f; }
};

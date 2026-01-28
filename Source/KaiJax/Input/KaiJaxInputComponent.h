#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "InputActionValue.h"
#include "KaiJaxInputComponent.generated.h"

class UInputAction;
class UInputMappingContext;

UCLASS(ClassGroup=(Custom), meta=(BlueprintSpawnableComponent))
class KAIJAX_API UKaiJaxInputComponent : public UActorComponent
{
    GENERATED_BODY()

public:
    UKaiJaxInputComponent();

protected:
    virtual void BeginPlay() override;

    // Input Mapping Context
    UPROPERTY(EditDefaultsOnly, Category = "Input")
    UInputMappingContext* DefaultMappingContext;

    // Movement Actions
    UPROPERTY(EditDefaultsOnly, Category = "Input|Movement")
    UInputAction* MoveAction;

    UPROPERTY(EditDefaultsOnly, Category = "Input|Movement")
    UInputAction* LookAction;

    UPROPERTY(EditDefaultsOnly, Category = "Input|Movement")
    UInputAction* JumpAction;

    UPROPERTY(EditDefaultsOnly, Category = "Input|Movement")
    UInputAction* DashAction;

    // Combat Actions
    UPROPERTY(EditDefaultsOnly, Category = "Input|Combat")
    UInputAction* LightAttackAction;

    UPROPERTY(EditDefaultsOnly, Category = "Input|Combat")
    UInputAction* HeavyAttackAction;

    UPROPERTY(EditDefaultsOnly, Category = "Input|Combat")
    UInputAction* ParryAction;

    UPROPERTY(EditDefaultsOnly, Category = "Input|Combat")
    UInputAction* SpecialAction;

    // Tail Actions (1-9)
    UPROPERTY(EditDefaultsOnly, Category = "Input|Tails")
    UInputAction* TailAction1;

    UPROPERTY(EditDefaultsOnly, Category = "Input|Tails")
    UInputAction* TailAction2;

    UPROPERTY(EditDefaultsOnly, Category = "Input|Tails")
    UInputAction* TailAction3;

    UPROPERTY(EditDefaultsOnly, Category = "Input|Tails")
    UInputAction* TailActionUltimate;

public:
    void SetupInputBindings(class APlayerController* PlayerController);

    // Input Handlers
    UFUNCTION()
    void OnMove(const FInputActionValue& Value);

    UFUNCTION()
    void OnLook(const FInputActionValue& Value);

    UFUNCTION()
    void OnJump(const FInputActionValue& Value);

    UFUNCTION()
    void OnDash(const FInputActionValue& Value);

    UFUNCTION()
    void OnLightAttack(const FInputActionValue& Value);

    UFUNCTION()
    void OnHeavyAttack(const FInputActionValue& Value);

    UFUNCTION()
    void OnParry(const FInputActionValue& Value);

    UFUNCTION()
    void OnSpecial(const FInputActionValue& Value);

    UFUNCTION()
    void OnTail1(const FInputActionValue& Value);

    UFUNCTION()
    void OnTail2(const FInputActionValue& Value);

    UFUNCTION()
    void OnTail3(const FInputActionValue& Value);

    UFUNCTION()
    void OnUltimate(const FInputActionValue& Value);

private:
    FVector2D CurrentMoveInput;
    FVector2D CurrentLookInput;
};

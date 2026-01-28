#include "KaiJaxInputComponent.h"
#include "EnhancedInputComponent.h"
#include "EnhancedInputSubsystems.h"
#include "../Characters/KaiJaxCharacter.h"
#include "../Combat/KaiJaxCombatComponent.h"
#include "GameFramework/Character.h"
#include "GameFramework/CharacterMovementComponent.h"

UKaiJaxInputComponent::UKaiJaxInputComponent()
{
    PrimaryComponentTick.bCanEverTick = false;
}

void UKaiJaxInputComponent::BeginPlay()
{
    Super::BeginPlay();
}

void UKaiJaxInputComponent::SetupInputBindings(APlayerController* PlayerController)
{
    if (!PlayerController) return;

    // Add mapping context
    if (UEnhancedInputLocalPlayerSubsystem* Subsystem = 
        ULocalPlayer::GetSubsystem<UEnhancedInputLocalPlayerSubsystem>(PlayerController->GetLocalPlayer()))
    {
        if (DefaultMappingContext)
        {
            Subsystem->AddMappingContext(DefaultMappingContext, 0);
        }
    }

    // Bind input actions
    if (UEnhancedInputComponent* EnhancedInput = 
        Cast<UEnhancedInputComponent>(PlayerController->InputComponent))
    {
        // Movement
        if (MoveAction)
        {
            EnhancedInput->BindAction(MoveAction, ETriggerEvent::Triggered, this, &UKaiJaxInputComponent::OnMove);
            EnhancedInput->BindAction(MoveAction, ETriggerEvent::Completed, this, &UKaiJaxInputComponent::OnMove);
        }

        if (LookAction)
        {
            EnhancedInput->BindAction(LookAction, ETriggerEvent::Triggered, this, &UKaiJaxInputComponent::OnLook);
        }

        if (JumpAction)
        {
            EnhancedInput->BindAction(JumpAction, ETriggerEvent::Triggered, this, &UKaiJaxInputComponent::OnJump);
        }

        if (DashAction)
        {
            EnhancedInput->BindAction(DashAction, ETriggerEvent::Triggered, this, &UKaiJaxInputComponent::OnDash);
        }

        // Combat
        if (LightAttackAction)
        {
            EnhancedInput->BindAction(LightAttackAction, ETriggerEvent::Triggered, this, &UKaiJaxInputComponent::OnLightAttack);
        }

        if (HeavyAttackAction)
        {
            EnhancedInput->BindAction(HeavyAttackAction, ETriggerEvent::Triggered, this, &UKaiJaxInputComponent::OnHeavyAttack);
        }

        if (ParryAction)
        {
            EnhancedInput->BindAction(ParryAction, ETriggerEvent::Triggered, this, &UKaiJaxInputComponent::OnParry);
        }

        if (SpecialAction)
        {
            EnhancedInput->BindAction(SpecialAction, ETriggerEvent::Triggered, this, &UKaiJaxInputComponent::OnSpecial);
        }

        // Tails
        if (TailAction1)
        {
            EnhancedInput->BindAction(TailAction1, ETriggerEvent::Triggered, this, &UKaiJaxInputComponent::OnTail1);
        }

        if (TailAction2)
        {
            EnhancedInput->BindAction(TailAction2, ETriggerEvent::Triggered, this, &UKaiJaxInputComponent::OnTail2);
        }

        if (TailAction3)
        {
            EnhancedInput->BindAction(TailAction3, ETriggerEvent::Triggered, this, &UKaiJaxInputComponent::OnTail3);
        }

        if (TailActionUltimate)
        {
            EnhancedInput->BindAction(TailActionUltimate, ETriggerEvent::Triggered, this, &UKaiJaxInputComponent::OnUltimate);
        }
    }
}

void UKaiJaxInputComponent::OnMove(const FInputActionValue& Value)
{
    CurrentMoveInput = Value.Get<FVector2D>();

    AKaiJaxCharacter* Character = Cast<AKaiJaxCharacter>(GetOwner());
    if (!Character) return;

    // Calculate movement direction relative to camera
    APlayerController* PC = Cast<APlayerController>(Character->GetController());
    if (!PC) return;

    FRotator ControlRotation = PC->GetControlRotation();
    FRotator YawRotation(0, ControlRotation.Yaw, 0);

    FVector ForwardDir = FRotationMatrix(YawRotation).GetUnitAxis(EAxis::X);
    FVector RightDir = FRotationMatrix(YawRotation).GetUnitAxis(EAxis::Y);

    FVector MoveDirection = ForwardDir * CurrentMoveInput.Y + RightDir * CurrentMoveInput.X;

    if (UCharacterMovementComponent* Movement = Character->GetCharacterMovement())
    {
        Character->AddMovementInput(MoveDirection, 1.0f);
    }
}

void UKaiJaxInputComponent::OnLook(const FInputActionValue& Value)
{
    CurrentLookInput = Value.Get<FVector2D>();

    AKaiJaxCharacter* Character = Cast<AKaiJaxCharacter>(GetOwner());
    if (!Character) return;

    Character->AddControllerYawInput(CurrentLookInput.X);
    Character->AddControllerPitchInput(CurrentLookInput.Y);
}

void UKaiJaxInputComponent::OnJump(const FInputActionValue& Value)
{
    AKaiJaxCharacter* Character = Cast<AKaiJaxCharacter>(GetOwner());
    if (!Character) return;

    Character->Jump();
}

void UKaiJaxInputComponent::OnDash(const FInputActionValue& Value)
{
    AKaiJaxCharacter* Character = Cast<AKaiJaxCharacter>(GetOwner());
    if (!Character) return;

    UKaiJaxCombatComponent* Combat = Character->FindComponentByClass<UKaiJaxCombatComponent>();
    if (Combat)
    {
        FVector DashDirection = Character->GetActorForwardVector();
        if (CurrentMoveInput.Length() > 0.1f)
        {
            // Dash in movement direction
            APlayerController* PC = Cast<APlayerController>(Character->GetController());
            if (PC)
            {
                FRotator ControlRotation = PC->GetControlRotation();
                FRotator YawRotation(0, ControlRotation.Yaw, 0);
                FVector ForwardDir = FRotationMatrix(YawRotation).GetUnitAxis(EAxis::X);
                FVector RightDir = FRotationMatrix(YawRotation).GetUnitAxis(EAxis::Y);
                DashDirection = ForwardDir * CurrentMoveInput.Y + RightDir * CurrentMoveInput.X;
            }
        }
        Combat->Dash(DashDirection);
    }
}

void UKaiJaxInputComponent::OnLightAttack(const FInputActionValue& Value)
{
    AKaiJaxCharacter* Character = Cast<AKaiJaxCharacter>(GetOwner());
    if (!Character) return;

    UKaiJaxCombatComponent* Combat = Character->FindComponentByClass<UKaiJaxCombatComponent>();
    if (Combat)
    {
        Combat->LightAttack();
    }
}

void UKaiJaxInputComponent::OnHeavyAttack(const FInputActionValue& Value)
{
    AKaiJaxCharacter* Character = Cast<AKaiJaxCharacter>(GetOwner());
    if (!Character) return;

    UKaiJaxCombatComponent* Combat = Character->FindComponentByClass<UKaiJaxCombatComponent>();
    if (Combat)
    {
        Combat->HeavyAttack();
    }
}

void UKaiJaxInputComponent::OnParry(const FInputActionValue& Value)
{
    AKaiJaxCharacter* Character = Cast<AKaiJaxCharacter>(GetOwner());
    if (!Character) return;

    UKaiJaxCombatComponent* Combat = Character->FindComponentByClass<UKaiJaxCombatComponent>();
    if (Combat)
    {
        Combat->Parry();
    }
}

void UKaiJaxInputComponent::OnSpecial(const FInputActionValue& Value)
{
    AKaiJaxCharacter* Character = Cast<AKaiJaxCharacter>(GetOwner());
    if (!Character) return;

    UKaiJaxCombatComponent* Combat = Character->FindComponentByClass<UKaiJaxCombatComponent>();
    if (Combat)
    {
        Combat->ActivateCrowdControl();
    }
}

void UKaiJaxInputComponent::OnTail1(const FInputActionValue& Value)
{
    AKaiJaxCharacter* Character = Cast<AKaiJaxCharacter>(GetOwner());
    if (!Character) return;

    UKaiJaxCombatComponent* Combat = Character->FindComponentByClass<UKaiJaxCombatComponent>();
    if (Combat)
    {
        Combat->TailStrike(ETailAbility::Bond_ParryCounter);
    }
}

void UKaiJaxInputComponent::OnTail2(const FInputActionValue& Value)
{
    AKaiJaxCharacter* Character = Cast<AKaiJaxCharacter>(GetOwner());
    if (!Character) return;

    UKaiJaxCombatComponent* Combat = Character->FindComponentByClass<UKaiJaxCombatComponent>();
    if (Combat)
    {
        Combat->TailStrike(ETailAbility::Hunter_DashPursuit);
    }
}

void UKaiJaxInputComponent::OnTail3(const FInputActionValue& Value)
{
    AKaiJaxCharacter* Character = Cast<AKaiJaxCharacter>(GetOwner());
    if (!Character) return;

    UKaiJaxCombatComponent* Combat = Character->FindComponentByClass<UKaiJaxCombatComponent>();
    if (Combat)
    {
        Combat->TailStrike(ETailAbility::Thread_WebPull);
    }
}

void UKaiJaxInputComponent::OnUltimate(const FInputActionValue& Value)
{
    AKaiJaxCharacter* Character = Cast<AKaiJaxCharacter>(GetOwner());
    if (!Character) return;

    UKaiJaxCombatComponent* Combat = Character->FindComponentByClass<UKaiJaxCombatComponent>();
    if (Combat)
    {
        // Ultimate activates all available tails simultaneously
        int32 TailCount = Character->GetActiveTailCount();
        for (int32 i = 1; i <= TailCount && i <= 9; ++i)
        {
            Combat->ActivateTailAbility(static_cast<ETailAbility>(i));
        }
    }
}

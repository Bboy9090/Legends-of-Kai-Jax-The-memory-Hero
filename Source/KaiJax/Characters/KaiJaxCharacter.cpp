#include "KaiJaxCharacter.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "GameFramework/SpringArmComponent.h"
#include "Camera/CameraComponent.h"

AKaiJaxCharacter::AKaiJaxCharacter()
{
    PrimaryActorTick.TickInterval = 0.0f;
    PrimaryActorTick.bCanEverTick = true;

    // Don't rotate character with camera
    bUseControllerRotationPitch = false;
    bUseControllerRotationYaw = false;
    bUseControllerRotationRoll = false;

    // Configure character movement
    GetCharacterMovement()->bOrientRotationToMovement = true;
    GetCharacterMovement()->RotationRate = FRotator(0.0f, 500.0f, 0.0f);
    GetCharacterMovement()->MaxWalkSpeed = 600.0f;
    GetCharacterMovement()->MinAnalogWalkSpeed = 20.0f;
    GetCharacterMovement()->MaxWalkSpeedCrouched = 300.0f;

    // Initialize tail states (9 total, 3 active at start)
    for (int32 i = 0; i < 9; ++i)
    {
        TailStates.Add(ETailState::Inactive);
    }
    TailStates[0] = ETailState::Active;
    TailStates[1] = ETailState::Active;
    TailStates[2] = ETailState::Active;
}

void AKaiJaxCharacter::BeginPlay()
{
    Super::BeginPlay();

    // Load memory profile from kai_jax.character.json
    // Activate initial 3 memory layers
    for (int32 i = 0; i < 3; ++i)
    {
        ActivateMemoryLayer(i + 1);
    }

    UpdateTailVisuals();
}

void AKaiJaxCharacter::Tick(float DeltaTime)
{
    Super::Tick(DeltaTime);

    // Regenerate stamina over time
    RegenerateStamina(DeltaTime);

    // Update tail physics/sway based on movement
    if (GetCharacterMovement()->Velocity.Length() > 0.0f)
    {
        // Tails sway during movement (animation-driven)
    }
}

void AKaiJaxCharacter::UnlockTail(int32 TailNumber)
{
    if (TailNumber >= 0 && TailNumber < 9)
    {
        if (TailStates[TailNumber] == ETailState::Inactive)
        {
            TailStates[TailNumber] = ETailState::Active;
            ActiveTailCount++;
            UpdateTailVisuals();
        }
    }
}

void AKaiJaxCharacter::UpdateTailVisuals()
{
    // Enable/disable tail mesh components based on ActiveTailCount
    // Drive emissive intensity via material dynamic instance
    // Called whenever tail count changes or memory layer activates
}

void AKaiJaxCharacter::ActivateMemoryLayer(int32 LayerNumber)
{
    if (LayerNumber >= 1 && LayerNumber <= 9)
    {
        ActiveMemories.Add(LayerNumber);
        // Memory effects applied in Blueprint/behavior layer
    }
}

void AKaiJaxCharacter::TakeDamage(float DamageAmount)
{
    Health = FMath::Max(0.0f, Health - DamageAmount);

    // Posture damage scales with active memory layers
    float PostureDamageScale = 1.0f + (ActiveMemories.Num() * 0.1f);
    PostureHealth = FMath::Max(0.0f, PostureHealth - (DamageAmount * PostureDamageScale * 0.5f));
}

void AKaiJaxCharacter::RegenerateStamina(float DeltaTime)
{
    if (Stamina < MaxStamina)
    {
        float RegenRate = 20.0f; // Stamina per second
        Stamina = FMath::Min(MaxStamina, Stamina + (RegenRate * DeltaTime));
    }
}

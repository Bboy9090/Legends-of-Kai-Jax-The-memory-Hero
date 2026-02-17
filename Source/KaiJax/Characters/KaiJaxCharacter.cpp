#include "KaiJaxCharacter.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "GameFramework/SpringArmComponent.h"
#include "Camera/CameraComponent.h"

AKaiJaxCharacter::AKaiJaxCharacter()
{
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

    // Create tail mesh component (attached to main mesh, will be configured in Blueprint)
    TailMesh = CreateDefaultSubobject<USkeletalMeshComponent>(TEXT("TailMesh"));
    if (TailMesh)
    {
        TailMesh->SetupAttachment(GetMesh());
    }

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

    // TODO: Load character data from ../../kai_jax.character.json (lockfile at repo root)
    // This should validate:
    // - evolution.starting_tail_count == 3
    // - evolution.final_tail_count == 9
    // - evolution.unlock_rule == "sequential_only"
    // - tail_roles array defines all 9 tail functions
    // For now, using hardcoded values that match the lockfile
    
    // Validate initial state matches canon
    check(ActiveTailCount == 3);  // Per kai_jax.character.json: evolution.starting_tail_count
    check(TailStates.Num() == 9);  // Per kai_jax.character.json: evolution.final_tail_count

    // Activate initial 3 memory layers (layers are 1-indexed: 1, 2, 3)
    // This matches the starting tail count of 3
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
    // Enforce sequential unlock: 3→4→5→6→7→8→9 tails (per README_CANON.md)
    // TailNumber parameter is 0-indexed (0-8), but ActiveTailCount represents total active tails (3-9)
    
    // Check if already at maximum tails
    if (ActiveTailCount >= 9)
    {
        // Already have all 9 tails - cannot unlock more
        return;
    }
    
    // Enforce sequential unlock: next tail index must equal current tail count
    // E.g., with 3 active tails (indices 0,1,2), next unlock must be index 3
    if (TailNumber != ActiveTailCount)
    {
        // Attempting to skip tails or unlock out of order - DISALLOWED
        return;
    }

    if (TailNumber >= 0 && TailNumber < 9)
    {
        if (TailStates[TailNumber] == ETailState::Inactive)
        {
            TailStates[TailNumber] = ETailState::Active;
            ActiveTailCount++;
            // Activate corresponding memory layer (1-indexed: tail 0 = layer 1)
            ActivateMemoryLayer(TailNumber + 1);
            UpdateTailVisuals();
        }
    }
}

void AKaiJaxCharacter::UpdateTailVisuals()
{
    // Enable/disable tail mesh components based on ActiveTailCount
    // Drive emissive intensity via material dynamic instance
    // Called whenever tail count changes or memory layer activates
    
    // TODO: Trigger world reactions based on tail tier
    // Reference: ../../data/world/tail_tier_reactions.json (lockfile at repo root)
    // - Update enemy AI behavior (fodder_confidence, elite_tactics)
    // - Adjust music intensity (combat_layer, percussion_intensity)
    // - Trigger NPC dialogue changes (default_attitude, fear_level)
    // - Modify world state (environmental_response, unlock_gates)
}

void AKaiJaxCharacter::ActivateMemoryLayer(int32 LayerNumber)
{
    if (LayerNumber >= 1 && LayerNumber <= 9)
    {
        ActiveMemories.Add(LayerNumber);
        // Memory effects applied in Blueprint/behavior layer
    }
}

void AKaiJaxCharacter::ApplyDamage(float DamageAmount)
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

#include "KaiJaxWorldReactionManager.h"
#include "Kismet/GameplayStatics.h"

AKaiJaxWorldReactionManager::AKaiJaxWorldReactionManager()
{
    PrimaryActorTick.bCanEverTick = true;
}

void AKaiJaxWorldReactionManager::BeginPlay()
{
    Super::BeginPlay();
    InitializeTierReactions();
}

void AKaiJaxWorldReactionManager::Tick(float DeltaTime)
{
    Super::Tick(DeltaTime);
}

void AKaiJaxWorldReactionManager::InitializeTierReactions()
{
    // Nascent (3 tails) - Enemies confident, world doesn't react
    FWorldReactionData NascentData;
    NascentData.FodderConfidence = 1.0f;
    NascentData.EliteTactics = 0.0f;
    NascentData.bEnemiesFleeOnSight = false;
    NascentData.CombatMusicIntensity = 0.5f;
    NascentData.PercussionIntensity = 0.3f;
    NascentData.NPCFearLevel = 0.0f;
    NascentData.DefaultAttitude = TEXT("Neutral");
    NascentData.bEnvironmentReacts = false;
    NascentData.EnvironmentalIntensity = 0.0f;
    TierReactions.Add(ETailTier::Nascent, NascentData);

    // Awakened (4-5 tails) - Enemies wary, slight world reaction
    FWorldReactionData AwakenedData;
    AwakenedData.FodderConfidence = 0.7f;
    AwakenedData.EliteTactics = 0.3f;
    AwakenedData.bEnemiesFleeOnSight = false;
    AwakenedData.CombatMusicIntensity = 0.65f;
    AwakenedData.PercussionIntensity = 0.5f;
    AwakenedData.NPCFearLevel = 0.2f;
    AwakenedData.DefaultAttitude = TEXT("Cautious");
    AwakenedData.bEnvironmentReacts = true;
    AwakenedData.EnvironmentalIntensity = 0.3f;
    TierReactions.Add(ETailTier::Awakened, AwakenedData);

    // Ascendant (6-7 tails) - Fodder flee, elites coordinate
    FWorldReactionData AscendantData;
    AscendantData.FodderConfidence = 0.3f;
    AscendantData.EliteTactics = 0.7f;
    AscendantData.bEnemiesFleeOnSight = false;
    AscendantData.CombatMusicIntensity = 0.8f;
    AscendantData.PercussionIntensity = 0.75f;
    AscendantData.NPCFearLevel = 0.5f;
    AscendantData.DefaultAttitude = TEXT("Fearful");
    AscendantData.bEnvironmentReacts = true;
    AscendantData.EnvironmentalIntensity = 0.6f;
    TierReactions.Add(ETailTier::Ascendant, AscendantData);

    // Apex (8 tails) - Most enemies flee, bosses prepare
    FWorldReactionData ApexData;
    ApexData.FodderConfidence = 0.1f;
    ApexData.EliteTactics = 0.9f;
    ApexData.bEnemiesFleeOnSight = true;
    ApexData.CombatMusicIntensity = 0.95f;
    ApexData.PercussionIntensity = 0.9f;
    ApexData.NPCFearLevel = 0.8f;
    ApexData.DefaultAttitude = TEXT("Terrified");
    ApexData.bEnvironmentReacts = true;
    ApexData.EnvironmentalIntensity = 0.85f;
    TierReactions.Add(ETailTier::Apex, ApexData);

    // Transcendent (9 tails) - Legendary presence, world trembles
    FWorldReactionData TranscendentData;
    TranscendentData.FodderConfidence = 0.0f;
    TranscendentData.EliteTactics = 1.0f;
    TranscendentData.bEnemiesFleeOnSight = true;
    TranscendentData.CombatMusicIntensity = 1.0f;
    TranscendentData.PercussionIntensity = 1.0f;
    TranscendentData.NPCFearLevel = 1.0f;
    TranscendentData.DefaultAttitude = TEXT("Awe");
    TranscendentData.bEnvironmentReacts = true;
    TranscendentData.EnvironmentalIntensity = 1.0f;
    TierReactions.Add(ETailTier::Transcendent, TranscendentData);

    // Apply initial tier
    ApplyTierReactions(CurrentTier);
}

ETailTier AKaiJaxWorldReactionManager::CalculateTierFromTailCount(int32 TailCount)
{
    if (TailCount >= 9) return ETailTier::Transcendent;
    if (TailCount >= 8) return ETailTier::Apex;
    if (TailCount >= 6) return ETailTier::Ascendant;
    if (TailCount >= 4) return ETailTier::Awakened;
    return ETailTier::Nascent;
}

void AKaiJaxWorldReactionManager::UpdateTailTier(int32 TailCount)
{
    ETailTier NewTier = CalculateTierFromTailCount(TailCount);
    
    if (NewTier != CurrentTier)
    {
        CurrentTier = NewTier;
        ApplyTierReactions(NewTier);
        OnTierChanged.Broadcast(NewTier);
    }
}

void AKaiJaxWorldReactionManager::ApplyTierReactions(ETailTier NewTier)
{
    if (FWorldReactionData* ReactionData = TierReactions.Find(NewTier))
    {
        CurrentReactions = *ReactionData;
        TriggerWorldReaction();
    }
}

void AKaiJaxWorldReactionManager::TriggerWorldReaction()
{
    // Update music intensity
    UpdateCombatMusic(CurrentReactions.CombatMusicIntensity);

    // Notify AI system
    if (APawn* Player = UGameplayStatics::GetPlayerPawn(this, 0))
    {
        NotifyEnemiesOfPresence(Player->GetActorLocation(), 5000.0f);
    }

    // Trigger environmental effects if enabled
    if (CurrentReactions.bEnvironmentReacts)
    {
        if (APawn* Player = UGameplayStatics::GetPlayerPawn(this, 0))
        {
            TriggerEnvironmentalEffect(Player->GetActorLocation());
        }
    }
}

void AKaiJaxWorldReactionManager::NotifyEnemiesOfPresence(FVector Location, float Radius)
{
    // Find all AI controllers in radius and update their behavior
    // Based on CurrentReactions.FodderConfidence and EliteTactics
    
    // Implementation depends on your AI system
    // Example: Broadcast to AI perception system
}

void AKaiJaxWorldReactionManager::UpdateCombatMusic(float Intensity)
{
    // Find audio manager and update intensity
    // Example: Set RTPC parameter for adaptive music
    
    // UGameplayStatics::SetGlobalPitchModulation(this, FMath::Lerp(1.0f, 1.1f, Intensity), 0.5f);
}

void AKaiJaxWorldReactionManager::TriggerEnvironmentalEffect(FVector Location)
{
    // Spawn environmental VFX based on intensity
    // Ground cracks, particle effects, screen shake, etc.
    
    if (CurrentReactions.EnvironmentalIntensity > 0.5f)
    {
        // Significant environmental reaction
        // Screen shake, particle burst, etc.
        APlayerController* PC = UGameplayStatics::GetPlayerController(this, 0);
        if (PC)
        {
            PC->ClientStartCameraShake(nullptr, CurrentReactions.EnvironmentalIntensity);
        }
    }
}

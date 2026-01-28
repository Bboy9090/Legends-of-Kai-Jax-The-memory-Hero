#include "KaiJaxCharacterData.h"
#include "Misc/FileHelper.h"
#include "Misc/Paths.h"
#include "Serialization/JsonReader.h"
#include "Serialization/JsonSerializer.h"
#include "Dom/JsonObject.h"

UKaiJaxCharacterData* UKaiJaxCharacterData::Instance = nullptr;

UKaiJaxCharacterData* UKaiJaxCharacterData::Get()
{
    if (!Instance)
    {
        Instance = NewObject<UKaiJaxCharacterData>();
        Instance->AddToRoot(); // Prevent garbage collection
        
        // Load data on first access
        if (!Instance->LoadCharacterData())
        {
            UE_LOG(LogTemp, Error, TEXT("[KaiJax] Failed to load character data from lockfile"));
        }
        
        if (!Instance->LoadTailTierReactions())
        {
            UE_LOG(LogTemp, Error, TEXT("[KaiJax] Failed to load tail tier reactions from lockfile"));
        }
    }
    return Instance;
}

bool UKaiJaxCharacterData::LoadCharacterData()
{
    // Path to kai_jax.character.json at repository root
    // In packaged builds, this should be in Content/Data/
    // In development, it's at the repository root
    FString FilePath = FPaths::ProjectDir() + TEXT("../../kai_jax.character.json");
    
    // Try development path first
    if (!FPaths::FileExists(FilePath))
    {
        // Try packaged content path
        FilePath = FPaths::ProjectContentDir() + TEXT("Data/kai_jax.character.json");
    }
    
    if (!FPaths::FileExists(FilePath))
    {
        UE_LOG(LogTemp, Error, TEXT("[KaiJax] Cannot find kai_jax.character.json at %s"), *FilePath);
        return false;
    }
    
    UE_LOG(LogTemp, Log, TEXT("[KaiJax] Loading character data from: %s"), *FilePath);
    
    // Read file
    FString JsonString;
    if (!FFileHelper::LoadFileToString(JsonString, *FilePath))
    {
        UE_LOG(LogTemp, Error, TEXT("[KaiJax] Failed to read file: %s"), *FilePath);
        return false;
    }
    
    // Parse JSON
    TSharedPtr<FJsonObject> JsonObject;
    TSharedRef<TJsonReader<>> Reader = TJsonReaderFactory<>::Create(JsonString);
    
    if (!FJsonSerializer::Deserialize(Reader, JsonObject) || !JsonObject.IsValid())
    {
        UE_LOG(LogTemp, Error, TEXT("[KaiJax] Failed to parse JSON from: %s"), *FilePath);
        return false;
    }
    
    // Parse sections
    if (!ParseEvolution(JsonObject))
    {
        return false;
    }
    
    if (!ParseTailRoles(JsonObject))
    {
        return false;
    }
    
    // Validate loaded data
    if (!ValidateCharacterData())
    {
        return false;
    }
    
    bDataLoaded = true;
    UE_LOG(LogTemp, Log, TEXT("[KaiJax] ✓ Character data loaded and validated"));
    
    return true;
}

bool UKaiJaxCharacterData::ParseEvolution(const TSharedPtr<FJsonObject>& JsonObject)
{
    const TSharedPtr<FJsonObject>* EvolutionObj;
    if (!JsonObject->TryGetObjectField(TEXT("evolution"), EvolutionObj))
    {
        UE_LOG(LogTemp, Error, TEXT("[KaiJax] Missing 'evolution' field in character data"));
        return false;
    }
    
    EvolutionRules.StartingTailCount = (*EvolutionObj)->GetIntegerField(TEXT("starting_tail_count"));
    EvolutionRules.FinalTailCount = (*EvolutionObj)->GetIntegerField(TEXT("final_tail_count"));
    EvolutionRules.UnlockRule = (*EvolutionObj)->GetStringField(TEXT("unlock_rule"));
    EvolutionRules.bSkipUnlocksDisallowed = (*EvolutionObj)->GetBoolField(TEXT("skip_unlocks_disallowed"));
    EvolutionRules.bTailsArePermanent = (*EvolutionObj)->GetBoolField(TEXT("tails_are_permanent"));
    
    return true;
}

bool UKaiJaxCharacterData::ParseTailRoles(const TSharedPtr<FJsonObject>& JsonObject)
{
    const TArray<TSharedPtr<FJsonValue>>* TailRolesArray;
    if (!JsonObject->TryGetArrayField(TEXT("tail_roles"), TailRolesArray))
    {
        UE_LOG(LogTemp, Error, TEXT("[KaiJax] Missing 'tail_roles' field in character data"));
        return false;
    }
    
    TailRoles.Empty();
    for (const TSharedPtr<FJsonValue>& Value : *TailRolesArray)
    {
        const TSharedPtr<FJsonObject>* RoleObj;
        if (Value->TryGetObject(RoleObj))
        {
            FTailRole Role;
            Role.Index = (*RoleObj)->GetIntegerField(TEXT("index"));
            Role.Name = (*RoleObj)->GetStringField(TEXT("name"));
            Role.Function = (*RoleObj)->GetStringField(TEXT("function"));
            TailRoles.Add(Role);
        }
    }
    
    if (TailRoles.Num() != 9)
    {
        UE_LOG(LogTemp, Error, TEXT("[KaiJax] Invalid tail_roles count: %d (expected 9)"), TailRoles.Num());
        return false;
    }
    
    return true;
}

bool UKaiJaxCharacterData::LoadTailTierReactions()
{
    // Path to data/world/tail_tier_reactions.json
    FString FilePath = FPaths::ProjectDir() + TEXT("../../data/world/tail_tier_reactions.json");
    
    if (!FPaths::FileExists(FilePath))
    {
        // Try packaged content path
        FilePath = FPaths::ProjectContentDir() + TEXT("Data/world/tail_tier_reactions.json");
    }
    
    if (!FPaths::FileExists(FilePath))
    {
        UE_LOG(LogTemp, Error, TEXT("[KaiJax] Cannot find tail_tier_reactions.json at %s"), *FilePath);
        return false;
    }
    
    UE_LOG(LogTemp, Log, TEXT("[KaiJax] Loading tail tier reactions from: %s"), *FilePath);
    
    // Read file
    FString JsonString;
    if (!FFileHelper::LoadFileToString(JsonString, *FilePath))
    {
        UE_LOG(LogTemp, Error, TEXT("[KaiJax] Failed to read file: %s"), *FilePath);
        return false;
    }
    
    // Parse JSON
    TSharedPtr<FJsonObject> JsonObject;
    TSharedRef<TJsonReader<>> Reader = TJsonReaderFactory<>::Create(JsonString);
    
    if (!FJsonSerializer::Deserialize(Reader, JsonObject) || !JsonObject.IsValid())
    {
        UE_LOG(LogTemp, Error, TEXT("[KaiJax] Failed to parse JSON from: %s"), *FilePath);
        return false;
    }
    
    if (!ParseTailTierReactions(JsonObject))
    {
        return false;
    }
    
    bReactionsLoaded = true;
    UE_LOG(LogTemp, Log, TEXT("[KaiJax] ✓ Tail tier reactions loaded"));
    
    return true;
}

bool UKaiJaxCharacterData::ParseTailTierReactions(const TSharedPtr<FJsonObject>& JsonObject)
{
    const TSharedPtr<FJsonObject>* TailTiersObj;
    if (!JsonObject->TryGetObjectField(TEXT("tail_tiers"), TailTiersObj))
    {
        UE_LOG(LogTemp, Error, TEXT("[KaiJax] Missing 'tail_tiers' field in reactions data"));
        return false;
    }
    
    TailTierReactions.Empty();
    
    // Parse tiers 3-9
    for (int32 TailCount = 3; TailCount <= 9; ++TailCount)
    {
        FString Key = FString::FromInt(TailCount);
        const TSharedPtr<FJsonObject>* TierObj;
        
        if (!(*TailTiersObj)->TryGetObjectField(Key, TierObj))
        {
            UE_LOG(LogTemp, Error, TEXT("[KaiJax] Missing tier data for tail count: %d"), TailCount);
            return false;
        }
        
        FTailTierReaction Reaction;
        Reaction.TierName = (*TierObj)->GetStringField(TEXT("tier_name"));
        Reaction.Description = (*TierObj)->GetStringField(TEXT("description"));
        
        // Parse enemy_behavior
        const TSharedPtr<FJsonObject>* EnemyBehaviorObj;
        if ((*TierObj)->TryGetObjectField(TEXT("enemy_behavior"), EnemyBehaviorObj))
        {
            Reaction.FodderConfidence = (*EnemyBehaviorObj)->GetStringField(TEXT("fodder_confidence"));
            Reaction.FodderEngagementDistance = (*EnemyBehaviorObj)->GetStringField(TEXT("fodder_engagement_distance"));
            Reaction.EliteTactics = (*EnemyBehaviorObj)->GetStringField(TEXT("elite_tactics"));
            Reaction.BossPhaseTriggers = (*EnemyBehaviorObj)->GetStringField(TEXT("boss_phase_triggers"));
        }
        
        // Parse music_intensity
        const TSharedPtr<FJsonObject>* MusicIntensityObj;
        if ((*TierObj)->TryGetObjectField(TEXT("music_intensity"), MusicIntensityObj))
        {
            Reaction.CombatLayer = (*MusicIntensityObj)->GetStringField(TEXT("combat_layer"));
            Reaction.PercussionIntensity = (*MusicIntensityObj)->GetNumberField(TEXT("percussion_intensity"));
            Reaction.BrassPresence = (*MusicIntensityObj)->GetStringField(TEXT("brass_presence"));
            Reaction.bChoirEnabled = (*MusicIntensityObj)->GetBoolField(TEXT("choir_enabled"));
        }
        
        // Parse npc_reactions
        const TSharedPtr<FJsonObject>* NPCReactionsObj;
        if ((*TierObj)->TryGetObjectField(TEXT("npc_reactions"), NPCReactionsObj))
        {
            Reaction.DefaultAttitude = (*NPCReactionsObj)->GetStringField(TEXT("default_attitude"));
            Reaction.DialogueTone = (*NPCReactionsObj)->GetStringField(TEXT("dialogue_tone"));
            Reaction.QuestAvailability = (*NPCReactionsObj)->GetStringField(TEXT("quest_availability"));
            Reaction.FearLevel = (*NPCReactionsObj)->GetStringField(TEXT("fear_level"));
            Reaction.WorshipLevel = (*NPCReactionsObj)->GetStringField(TEXT("worship_level"));
        }
        
        // Parse world_state
        const TSharedPtr<FJsonObject>* WorldStateObj;
        if ((*TierObj)->TryGetObjectField(TEXT("world_state"), WorldStateObj))
        {
            Reaction.Descriptor = (*WorldStateObj)->GetStringField(TEXT("descriptor"));
            Reaction.EnvironmentalResponse = (*WorldStateObj)->GetStringField(TEXT("environmental_response"));
            Reaction.NarrativeWeight = (*WorldStateObj)->GetStringField(TEXT("narrative_weight"));
            
            // Parse unlock_gates array
            const TArray<TSharedPtr<FJsonValue>>* UnlockGatesArray;
            if ((*WorldStateObj)->TryGetArrayField(TEXT("unlock_gates"), UnlockGatesArray))
            {
                for (const TSharedPtr<FJsonValue>& GateValue : *UnlockGatesArray)
                {
                    Reaction.UnlockGates.Add(GateValue->AsString());
                }
            }
        }
        
        TailTierReactions.Add(TailCount, Reaction);
    }
    
    return true;
}

FTailTierReaction UKaiJaxCharacterData::GetTailTierReaction(int32 TailCount) const
{
    if (TailTierReactions.Contains(TailCount))
    {
        return TailTierReactions[TailCount];
    }
    
    UE_LOG(LogTemp, Warning, TEXT("[KaiJax] No reaction data for tail count: %d"), TailCount);
    return FTailTierReaction();
}

FTailRole UKaiJaxCharacterData::GetTailRole(int32 TailIndex) const
{
    // Tail roles are indexed 1-9 in the data
    for (const FTailRole& Role : TailRoles)
    {
        if (Role.Index == TailIndex)
        {
            return Role;
        }
    }
    
    UE_LOG(LogTemp, Warning, TEXT("[KaiJax] No tail role data for index: %d"), TailIndex);
    return FTailRole();
}

bool UKaiJaxCharacterData::ValidateCharacterData() const
{
    // Validate evolution rules match canonical values
    if (EvolutionRules.StartingTailCount != 3)
    {
        UE_LOG(LogTemp, Error, TEXT("[KaiJax] VALIDATION FAILED: starting_tail_count must be 3 (found: %d)"), 
            EvolutionRules.StartingTailCount);
        return false;
    }
    
    if (EvolutionRules.FinalTailCount != 9)
    {
        UE_LOG(LogTemp, Error, TEXT("[KaiJax] VALIDATION FAILED: final_tail_count must be 9 (found: %d)"), 
            EvolutionRules.FinalTailCount);
        return false;
    }
    
    if (EvolutionRules.UnlockRule != TEXT("sequential_only"))
    {
        UE_LOG(LogTemp, Error, TEXT("[KaiJax] VALIDATION FAILED: unlock_rule must be 'sequential_only' (found: %s)"), 
            *EvolutionRules.UnlockRule);
        return false;
    }
    
    if (!EvolutionRules.bSkipUnlocksDisallowed)
    {
        UE_LOG(LogTemp, Error, TEXT("[KaiJax] VALIDATION FAILED: skip_unlocks_disallowed must be true"));
        return false;
    }
    
    if (!EvolutionRules.bTailsArePermanent)
    {
        UE_LOG(LogTemp, Error, TEXT("[KaiJax] VALIDATION FAILED: tails_are_permanent must be true"));
        return false;
    }
    
    // Validate tail roles count
    if (TailRoles.Num() != 9)
    {
        UE_LOG(LogTemp, Error, TEXT("[KaiJax] VALIDATION FAILED: Must have exactly 9 tail roles (found: %d)"), 
            TailRoles.Num());
        return false;
    }
    
    UE_LOG(LogTemp, Log, TEXT("[KaiJax] ✓ Validation passed - character data matches lockfile"));
    return true;
}

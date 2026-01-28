#pragma once

#include "CoreMinimal.h"
#include "Dom/JsonObject.h"
#include "KaiJaxCharacterData.generated.h"

/**
 * Tail Tier Reaction Data
 * Loaded from data/world/tail_tier_reactions.json
 * Defines how game systems respond to tail progression
 */
USTRUCT(BlueprintType)
struct FTailTierReaction
{
    GENERATED_BODY()

    UPROPERTY(BlueprintReadOnly, Category = "Tail Tier")
    FString TierName;

    UPROPERTY(BlueprintReadOnly, Category = "Tail Tier")
    FString Description;

    // Enemy Behavior
    UPROPERTY(BlueprintReadOnly, Category = "Enemy Behavior")
    FString FodderConfidence;

    UPROPERTY(BlueprintReadOnly, Category = "Enemy Behavior")
    FString FodderEngagementDistance;

    UPROPERTY(BlueprintReadOnly, Category = "Enemy Behavior")
    FString EliteTactics;

    UPROPERTY(BlueprintReadOnly, Category = "Enemy Behavior")
    FString BossPhaseTriggers;

    // Music Intensity
    UPROPERTY(BlueprintReadOnly, Category = "Music")
    FString CombatLayer;

    UPROPERTY(BlueprintReadOnly, Category = "Music")
    float PercussionIntensity;

    UPROPERTY(BlueprintReadOnly, Category = "Music")
    FString BrassPresence;

    UPROPERTY(BlueprintReadOnly, Category = "Music")
    bool bChoirEnabled;

    // NPC Reactions
    UPROPERTY(BlueprintReadOnly, Category = "NPC")
    FString DefaultAttitude;

    UPROPERTY(BlueprintReadOnly, Category = "NPC")
    FString DialogueTone;

    UPROPERTY(BlueprintReadOnly, Category = "NPC")
    FString QuestAvailability;

    UPROPERTY(BlueprintReadOnly, Category = "NPC")
    FString FearLevel;

    UPROPERTY(BlueprintReadOnly, Category = "NPC")
    FString WorshipLevel;

    // World State
    UPROPERTY(BlueprintReadOnly, Category = "World")
    FString Descriptor;

    UPROPERTY(BlueprintReadOnly, Category = "World")
    FString EnvironmentalResponse;

    UPROPERTY(BlueprintReadOnly, Category = "World")
    TArray<FString> UnlockGates;

    UPROPERTY(BlueprintReadOnly, Category = "World")
    FString NarrativeWeight;
};

/**
 * Character Evolution Rules
 * Loaded from kai_jax.character.json: evolution section
 */
USTRUCT(BlueprintType)
struct FCharacterEvolution
{
    GENERATED_BODY()

    UPROPERTY(BlueprintReadOnly, Category = "Evolution")
    int32 StartingTailCount = 3;

    UPROPERTY(BlueprintReadOnly, Category = "Evolution")
    int32 FinalTailCount = 9;

    UPROPERTY(BlueprintReadOnly, Category = "Evolution")
    FString UnlockRule;

    UPROPERTY(BlueprintReadOnly, Category = "Evolution")
    bool bSkipUnlocksDisallowed = true;

    UPROPERTY(BlueprintReadOnly, Category = "Evolution")
    bool bTailsArePermanent = true;
};

/**
 * Tail Role Definition
 * Loaded from kai_jax.character.json: tail_roles array
 */
USTRUCT(BlueprintType)
struct FTailRole
{
    GENERATED_BODY()

    UPROPERTY(BlueprintReadOnly, Category = "Tail")
    int32 Index = 0;

    UPROPERTY(BlueprintReadOnly, Category = "Tail")
    FString Name;

    UPROPERTY(BlueprintReadOnly, Category = "Tail")
    FString Function;
};

/**
 * Singleton class for loading and accessing Kai-Jax character data
 * Reads from canonical lockfiles at repository root
 */
UCLASS()
class KAIJAX_API UKaiJaxCharacterData : public UObject
{
    GENERATED_BODY()

public:
    /**
     * Get singleton instance
     */
    static UKaiJaxCharacterData* Get();

    /**
     * Load character data from lockfile
     * Called automatically on first access
     * @return true if loaded successfully
     */
    UFUNCTION(BlueprintCallable, Category = "Character Data")
    bool LoadCharacterData();

    /**
     * Load tail tier reactions from lockfile
     * @return true if loaded successfully
     */
    UFUNCTION(BlueprintCallable, Category = "Character Data")
    bool LoadTailTierReactions();

    /**
     * Get tail tier reaction for specific tail count (3-9)
     */
    UFUNCTION(BlueprintPure, Category = "Character Data")
    FTailTierReaction GetTailTierReaction(int32 TailCount) const;

    /**
     * Get tail role for specific tail index (1-9)
     */
    UFUNCTION(BlueprintPure, Category = "Character Data")
    FTailRole GetTailRole(int32 TailIndex) const;

    /**
     * Get evolution rules
     */
    UFUNCTION(BlueprintPure, Category = "Character Data")
    FCharacterEvolution GetEvolutionRules() const { return EvolutionRules; }

    /**
     * Validate that current implementation matches lockfile
     * Throws error if validation fails
     */
    UFUNCTION(BlueprintCallable, Category = "Character Data")
    bool ValidateCharacterData() const;

protected:
    // Evolution rules from lockfile
    UPROPERTY()
    FCharacterEvolution EvolutionRules;

    // Tail roles (9 entries, indexed 1-9)
    UPROPERTY()
    TArray<FTailRole> TailRoles;

    // Tail tier reactions (keys: 3, 4, 5, 6, 7, 8, 9)
    UPROPERTY()
    TMap<int32, FTailTierReaction> TailTierReactions;

    // Flags
    bool bDataLoaded = false;
    bool bReactionsLoaded = false;

private:
    static UKaiJaxCharacterData* Instance;

    /**
     * Parse evolution section from character JSON
     */
    bool ParseEvolution(const TSharedPtr<FJsonObject>& JsonObject);

    /**
     * Parse tail_roles array from character JSON
     */
    bool ParseTailRoles(const TSharedPtr<FJsonObject>& JsonObject);

    /**
     * Parse tail_tiers from tail_tier_reactions.json
     */
    bool ParseTailTierReactions(const TSharedPtr<FJsonObject>& JsonObject);
};

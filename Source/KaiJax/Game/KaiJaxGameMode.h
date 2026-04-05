#pragma once

#include "CoreMinimal.h"
#include "GameFramework/GameModeBase.h"
#include "KaiJaxGameMode.generated.h"

UCLASS()
class KAIJAX_API AKaiJaxGameMode : public AGameModeBase
{
    GENERATED_BODY()

public:
    AKaiJaxGameMode();

protected:
    virtual void BeginPlay() override;

public:
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Platform")
    FString ActivePlatformProfile = "PC";
};

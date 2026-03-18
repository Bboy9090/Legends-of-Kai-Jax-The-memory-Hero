#include "KaiJaxGameMode.h"
#include "Characters/KaiJaxCharacter.h"
#include "UObject/ConstructorHelpers.h"

AKaiJaxGameMode::AKaiJaxGameMode()
{
    // Set default pawn class to our custom character
    DefaultPawnClass = AKaiJaxCharacter::StaticClass();

    // Detect platform and load appropriate profile
#if PLATFORM_WINDOWS || PLATFORM_MAC || PLATFORM_LINUX
    ActivePlatformProfile = "PC";
#elif PLATFORM_IOS
    // TODO: Detect if iOS tablet (iPad) vs phone (iPhone)
    ActivePlatformProfile = "Mobile";
#elif PLATFORM_ANDROID
    // TODO: Detect if Android tablet vs phone
    ActivePlatformProfile = "Mobile";
#else
    ActivePlatformProfile = "PC";  // Default fallback
#endif
}

void AKaiJaxGameMode::BeginPlay()
{
    Super::BeginPlay();

    // Load platform profile JSON
    // Path: Content/Data/Platforms/platform_{ActivePlatformProfile.ToLower()}.json
    // This would be implemented with JSON parsing utility
    // For now, profile is set via ActivePlatformProfile property
}

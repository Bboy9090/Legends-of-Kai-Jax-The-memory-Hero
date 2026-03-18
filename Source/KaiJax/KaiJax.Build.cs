using UnrealBuildTool;

public class KaiJax : ModuleRules
{
    public KaiJax(ReadOnlyTargetRules Target) : base(Target)
    {
        PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;

        PublicDependencyModuleNames.AddRange(new string[] 
        { 
            "Core", 
            "CoreUObject", 
            "Engine", 
            "InputCore",
            "EnhancedInput",
            "GameplayTasks",
            "Niagara",
            "GameplayAbilities",
            "GameplayTags"
        });

        PrivateDependencyModuleNames.AddRange(new string[] 
        {
            "Slate",
            "SlateCore",
            "UMG",
            "AIModule",
            "NavigationSystem"
        });
    }
}

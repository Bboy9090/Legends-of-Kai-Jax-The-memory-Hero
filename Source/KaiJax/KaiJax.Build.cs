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
            "ControlRig",
            "RigVM",
            "AnimGraphRuntime"
        });

        PrivateDependencyModuleNames.AddRange(new string[] { });
    }
}

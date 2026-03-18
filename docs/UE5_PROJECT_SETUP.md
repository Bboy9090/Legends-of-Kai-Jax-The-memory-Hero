# Unreal Engine 5 Project Setup Guide

## Overview

This document describes the Unreal Engine 5 project configuration for Legends of Kai-Jax. This implementation runs **alongside** the existing TypeScript/Three.js engine, providing a production-quality AAA experience option.

## Engine Requirements

### Minimum Version
- **Unreal Engine 5.3+** (5.3.2 or later recommended)
- Visual Studio 2022 (Windows) or Xcode 14+ (macOS)
- 8GB RAM minimum, 16GB recommended
- GPU with Shader Model 6.0+ support

### Platform Support
- **PC (Primary)**: Windows 10/11 64-bit, DirectX 12 / Vulkan
- **Mobile**: iOS 15+, Android 12+ (Vulkan required)
- **Tablet**: iPadOS 15+, Android tablets with Vulkan

## Project Settings

### Initial Project Configuration

When creating the UE5 project:

1. **Template**: Third Person (C++)
2. **Target Platform**: Desktop/Console
3. **Quality Preset**: Maximum Quality
4. **Starter Content**: No (we use custom assets)
5. **Ray Tracing**: Disabled (using Nanite + Lumen instead)

### Project Structure
```
KaiJax/
├── Source/
│   └── KaiJax/
│       ├── Characters/
│       │   ├── KaiJaxCharacter.h
│       │   └── KaiJaxCharacter.cpp
│       ├── Game/
│       │   ├── KaiJaxGameMode.h
│       │   └── KaiJaxGameMode.cpp
│       └── KaiJax.Build.cs
├── Content/
│   ├── Blueprints/
│   ├── Characters/
│   │   └── KaiJax/
│   ├── Materials/
│   ├── Animations/
│   ├── VFX/
│   └── Data/
│       └── Platforms/
│           ├── platform_pc.json
│           ├── platform_tablet.json
│           └── platform_mobile.json
├── Config/
│   └── DefaultEngine.ini
└── Intermediate/
    └── Documentation/
```

## Rendering Configuration

### Lumen + Nanite (No Ray Tracing)

**Why this choice:**
- Nanite provides automatic LOD management for character models
- Lumen delivers dynamic global illumination without ray tracing overhead
- Better cross-platform compatibility (mobile doesn't support ray tracing)
- Matches performance budget requirements

**Engine Settings** (DefaultEngine.ini):
```ini
[/Script/Engine.RendererSettings]
r.DefaultFeature.AutoExposure=True
r.DefaultFeature.AutoExposure.Method=2
r.AntiAliasingMethod=2
r.Lumen.DiffuseIndirect.Allow=True
r.Lumen.Reflections.Allow=True
r.Shadow.Virtual.Enable=True
r.Nanite.ProjectEnabled=True
r.RayTracing=False

[/Script/WindowsTargetPlatform.WindowsTargetSettings]
DefaultGraphicsRHI=DefaultGraphicsRHI_DX12
-D3D12TargetedShaderFormats=PCD3D_SM6
+D3D12TargetedShaderFormats=PCD3D_SM6
```

### Mobile Configuration

**iOS/Android Settings**:
```ini
[/Script/Engine.RendererSettings]
r.Mobile.ShadingPath=1  ; Deferred shading
r.Mobile.Forward.EnableLocalLights=True
r.Mobile.AntiAliasing=2  ; TemporalAA
r.Mobile.FloatPrecisionMode=1  ; Full float precision
r.MobileHDR=True
```

## Character System Integration

### Default Character Replacement

The project **replaces** the default Third Person Character with `AKaiJaxCharacter`:

1. Delete `ThirdPersonCharacter` Blueprint/C++ class
2. Set `AKaiJaxCharacter` as default pawn in `AKaiJaxGameMode`
3. Update Input Mappings to use Enhanced Input System

### Enhanced Input System

**Required Plugin**: Enhanced Input (should be enabled by default in UE5.3+)

Input Actions:
- IA_Move (Value: Vector2D)
- IA_Look (Value: Vector2D)
- IA_Jump (Value: Boolean)
- IA_LightAttack (Value: Boolean)
- IA_HeavyAttack (Value: Boolean)
- IA_Dodge (Value: Boolean)
- IA_Parry (Value: Boolean)

## Plugin Requirements

### Default Plugins (No Custom Dependencies)

The project uses **only built-in UE5 plugins**:
- Enhanced Input (enabled)
- Geometry Scripting (for runtime procedural generation if needed)
- Gameplay Abilities (optional, for future combat system expansion)

### Extensibility

If you need additional plugins:
1. Document them in this file
2. Justify why they're necessary
3. Ensure they support all target platforms
4. Update `.uproject` file accordingly

## Platform Profiles

The project supports **platform-specific configuration profiles** defined in JSON:

- `Content/Data/Platforms/platform_pc.json` - Maximum quality, 20+ enemies
- `Content/Data/Platforms/platform_tablet.json` - Medium quality, 12 enemies
- `Content/Data/Platforms/platform_mobile.json` - Low quality, 6 enemies

**Important**: These profiles affect **performance and visual quality only**. Gameplay logic (combat, progression, tail unlocks) is **identical across all platforms** per `README_CANON.md`.

## Build Configuration

### Development Build
```bash
# Windows
BuildCookRun -project="KaiJax.uproject" -noP4 -platform=Win64 -clientconfig=Development -cook -stage

# macOS
BuildCookRun -project="KaiJax.uproject" -noP4 -platform=Mac -clientconfig=Development -cook -stage
```

### Shipping Build
```bash
# Windows
BuildCookRun -project="KaiJax.uproject" -noP4 -platform=Win64 -clientconfig=Shipping -cook -stage -pak -archive -archivedirectory="Builds/Windows"

# Android
BuildCookRun -project="KaiJax.uproject" -noP4 -platform=Android_ASTC -clientconfig=Shipping -cook -stage -pak -archive
```

## Validation Requirements

### Pre-Commit Validation

Before committing C++ or Blueprint changes:

1. **Schema Validation**: Ensure `kai_jax.character.json` compliance
   - Starting tails: exactly 3
   - Final tails: exactly 9
   - Sequential unlock only

2. **Compilation**: Project must compile without warnings on target platforms

3. **Performance**: Maintain 60 FPS on PC (RTX 2060 or equivalent) at 1080p

4. **Canon Compliance**: Review against `README_CANON.md` rules

## Known Limitations

### Current Implementation Scope

- **Character class**: Core movement and tail system implemented
- **Combat**: Basic health/stamina/posture systems only (no full combat yet)
- **Animations**: Requires Control Rig setup (separate PR)
- **Materials**: Requires PBR shader setup (separate PR)
- **World Systems**: AI reactions to tail tiers not yet implemented

### Future Enhancements

- Control Rig for tail procedural animation
- Material instance dynamic system for tail emissive effects
- Combat ability system using Gameplay Abilities plugin
- Memory Weave visual effects
- World state response system

## Troubleshooting

### "Project could not be compiled" Error

1. Ensure UE5.3+ is installed
2. Regenerate Visual Studio project files (right-click .uproject → "Generate Visual Studio project files")
3. Clean solution and rebuild

### "Module 'KaiJax' could not be loaded"

1. Check `KaiJax.Build.cs` for typos in module dependencies
2. Verify all header includes use correct paths
3. Ensure KAIJAX_API macro is defined correctly

### Performance Issues on Mobile

1. Verify platform profile is loading correctly (check `AKaiJaxGameMode::ActivePlatformProfile`)
2. Reduce `max_enemies` in mobile platform JSON
3. Switch `tail_physics` to "ribbon" mode on low-end devices

## Contact / Support

For UE5-specific questions:
- Check Unreal Engine documentation: https://docs.unrealengine.com/5.3
- Review `README_CANON.md` for franchise-specific rules
- Submit issues with `ue5` label on GitHub

---

**Document Version**: 1.0.0  
**Last Updated**: 2026-01-27  
**UE5 Version Tested**: 5.3.2

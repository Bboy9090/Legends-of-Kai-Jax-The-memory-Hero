# Default Level Setup for Kai-Jax UE5 Project

## Overview

This document describes how to set up the default game level in Unreal Engine 5 for testing and development of the Kai-Jax character system.

## Level Configuration

### World Settings

1. **Game Mode Override**: Set to `KaiJaxGameMode`
   - This ensures `AKaiJaxCharacter` is spawned as the default pawn
   - Platform profile auto-detection is handled by the game mode

2. **World Settings → Lighting**:
   - **Enable Lumen Global Illumination**: Yes
   - **Enable Lumen Reflections**: Yes
   - **Force No Precomputed Lighting**: Yes (all lighting must be dynamic)

3. **World Settings → Rendering**:
   - **Enable Nanite Support**: Yes
   - **Ray Tracing**: Disabled
   - **Default Post Process Volume**: See below

### Player Start

- Place `Player Start` actor at world origin (0, 0, 0) or appropriate spawn point
- **Rotation**: Facing forward (0°) or toward interesting level content
- **Collision**: Ensure no overlapping geometry at spawn point

### Lighting Setup

#### Sky Light
- **Type**: Sky Light (Movable)
- **Intensity**: 1.0
- **Color**: Default (slight blue tint for outdoor scenes)
- **Cast Shadows**: Yes
- **Real Time Capture**: Yes (for dynamic environment)

#### Directional Light (Sun)
- **Type**: Directional Light (Movable)
- **Intensity**: 10.0 (adjust for scene brightness)
- **Color**: Warm white (slight yellow tint)
- **Rotation**: ~45° elevation, 315° azimuth (classic 3-point lighting angle)
- **Cast Shadows**: Yes
- **Use Inset Shadows for Movable Objects**: Yes
- **Dynamic Shadow Distance**: 20000 cm (200 meters)
- **Atmosphere Sun Light**: Yes (if using Sky Atmosphere)

#### Optional: Sky Atmosphere
- Add **Sky Atmosphere** component for realistic sky/horizon
- Attach to Directional Light for sun disc rendering
- Default settings are usually appropriate

### Post Process Volume

Add a **Post Process Volume** with:
- **Infinite Extent (Unbound)**: Yes (affects entire world)
- **Settings**:
  - **Auto Exposure**: Enabled, Histogram-based
  - **Min/Max Brightness**: 0.5 / 2.0 (prevents over/under exposure)
  - **Bloom**: Enabled, Intensity 0.3 (subtle glow for emissive materials)
  - **Lens Flares**: Disabled (keep visuals clean)
  - **Motion Blur**: Enabled, Max 0.5 (subtle, preserve clarity)
  - **Ambient Occlusion**: Enabled via Lumen (no SSAO needed)
  - **Screen Space Reflections**: Disabled (Lumen handles reflections)
  - **Depth of Field**: Disabled (gameplay camera should be sharp)

### Ground Plane / Test Geometry

For initial testing:
1. Add a large **Plane** (or **Landscape**) for ground collision
   - Scale: 100 x 100 x 1 (or larger)
   - Material: Simple gray or checkerboard for visual reference
   - Collision: Block All (allows character movement)

2. Optional: Add basic test geometry (cubes, ramps) for movement testing

### Camera Configuration

**No custom camera actor needed** - `AKaiJaxCharacter` will spawn with its own camera:
- Spring Arm Component (handles camera boom)
- Camera Component (attached to Spring Arm)
- These are configured in C++ constructor (future PR)

### Performance Validation

After level setup, validate performance:
1. **PIE (Play In Editor)**: Should maintain 60+ FPS
2. **Stat FPS**: Console command to display framerate
3. **Stat Unit**: Check game thread, render thread, GPU times
4. **Stat Lumen**: Verify Lumen overhead is acceptable

Target Performance (PC, RTX 2060 equivalent, 1080p):
- **FPS**: 60+ (no drops below 55)
- **Game Thread**: < 10ms
- **Render Thread**: < 12ms
- **GPU**: < 16ms

If performance is poor:
- Reduce Lumen quality settings (r.Lumen.Reflections.ScreenSpaceReconstruction.MaxRoughnessToTrace)
- Lower shadow resolution (r.Shadow.Virtual.MaxPhysicalPages)
- Check for expensive Blueprint nodes in character

### Debugging / Testing Tools

Useful console commands for testing:
```
stat fps              // Show framerate
stat unit             // Show thread times
stat lumen            // Lumen performance stats
show collision        // Visualize collision geometry
show bounds           // Show actor bounds
show skeleton         // Show character skeleton (when implemented)
viewmode lit          // Default lit view
viewmode unlit        // See raw geometry without lighting
```

### Blueprint Configuration (Optional)

If extending `AKaiJaxCharacter` in Blueprint:
1. Create Blueprint class: `BP_KaiJaxCharacter` (derived from `AKaiJaxCharacter`)
2. Set mesh, materials, animations in Blueprint
3. Update `AKaiJaxGameMode::DefaultPawnClass` to use Blueprint version

## Validation Checklist

Before committing level changes:
- [ ] Player spawns correctly at Player Start
- [ ] Character can move and jump (basic movement working)
- [ ] Lighting looks natural (no pitch black or blown-out areas)
- [ ] Lumen global illumination is active (indirect bounce light visible)
- [ ] Performance meets 60 FPS target on PC
- [ ] No console errors or warnings on level load
- [ ] Tail system initializes correctly (3 active tails at start)

## Known Issues / Future Work

- **No character mesh yet**: Character will appear as capsule until mesh is imported
- **No animations**: Movement will use default pose until animation system is hooked up
- **No tail visuals**: Tail mesh components not yet configured (requires Control Rig PR)
- **No combat**: Level should be peaceful for initial testing

## Platform-Specific Notes

### Mobile Preview (Android/iOS)

To test mobile performance in editor:
1. **Settings → Preview Rendering Level**: Android ES3.1 / iOS
2. **Mobile Preview**: PIE with mobile preview mode
3. Performance will be lower - target is 30+ FPS on mobile devices

### Tablet Configuration

Tablets use same level setup but load `platform_tablet.json`:
- Reduced enemy count (not yet implemented)
- Spline-based tail physics instead of full cloth simulation
- Medium quality VFX

---

**Document Version**: 1.0.0  
**Last Updated**: 2026-01-27  
**Compatible With**: Unreal Engine 5.3+

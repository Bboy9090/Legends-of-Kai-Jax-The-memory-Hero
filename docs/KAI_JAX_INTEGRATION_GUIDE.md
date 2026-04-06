# KAI-JAX INTEGRATION GUIDE

This guide explains how Kai-Jax is integrated across all platforms and game systems.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                  CANONICAL LOCKFILES                         │
│  - kai_jax.character.json (character definition)            │
│  - schemas/character.schema.json (validation rules)         │
│  - data/world/tail_tier_reactions.json (world systems)     │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│              CHARACTER LOADERS                               │
│  - TypeScript: packages/shared/src/character/kaiJaxLoader.ts│
│  - C++: engine_core/character/CharacterLoader.cpp          │
│  - Unreal: Source/KaiJax/Characters/KaiJaxCharacter.cpp    │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│               GAME SYSTEMS                                   │
│  - Rendering: Mesh, Materials, LOD, Lighting               │
│  - Physics: Tail bones, constraints, collision             │
│  - Animation: State machine, blending, root motion         │
│  - AI: Tail tier reactions, enemy behavior                 │
│  - Music: Dynamic layering based on tail count             │
│  - Progression: Sequential tail unlock 3→4→5→6→7→8→9      │
└─────────────────────────────────────────────────────────────┘
```

## Platform Integration

### Web/TypeScript (apps/web)

**Model Loading:**
```typescript
import { getKaiJax } from '@shared/character/kaiJaxLoader';

const kaiJax = getKaiJax();

// Character data is validated on module load
console.log(kaiJax.name); // "Kai-Jax"
console.log(kaiJax.anatomy.tail_count); // 9
```

**Model Path:**
```typescript
// Character model paths (client/src/components/game/models/characterModelPaths.ts)
{
  'kai-jax': '/models/kai_jax_hero.glb',
  'kai_jax': '/models/kai_jax_hero.glb',
}
```

**3D Rendering (Three.js):**
```typescript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const loader = new GLTFLoader();
loader.load('/models/kai_jax_hero.glb', (gltf) => {
  const kaiJaxModel = gltf.scene;
  
  // Validate tail count in loaded model
  const skeleton = gltf.scene.children.find(c => c.isSkinnedMesh)?.skeleton;
  const tailBones = skeleton.bones.filter(b => b.name.startsWith('Tail_'));
  
  console.assert(tailBones.length >= 54, 'Missing tail bones (9 tails × 6 bones min)');
  
  scene.add(kaiJaxModel);
});
```

### C++ Engine (engine/cpp)

**Loading Character Spec:**
```cpp
#include "character/CharacterSpecification.h"

// Load from canonical lockfile
auto kaiJax = CharacterSpecification::LoadFromFile("kai_jax.character.json");

// Access validated data
std::cout << "Name: " << kaiJax.display_name << "\n";
std::cout << "Tail Count: " << kaiJax.anatomy.tail_count << "\n";

// Verify it's Kai-Jax
assert(kaiJax.IsKaiJax());
assert(kaiJax.GetExpectedTailCount() == 9);
```

**Character Instantiation:**
```cpp
#include "../include/Character.h"
#include "../include/CharacterLoader.h"

// Create Kai-Jax instance
Character kaiJaxCharacter;
kaiJaxCharacter.LoadFromSpecification(kaiJax);

// Update loop
void GameLoop(float deltaTime) {
    kaiJaxCharacter.Update(deltaTime);
    kaiJaxCharacter.Render();
}
```

### Unreal Engine (Source/KaiJax)

**Character Data Loader:**
```cpp
// Source/KaiJax/Characters/KaiJaxCharacterData.h/cpp
// Singleton loader for canonical lockfiles

// Get singleton instance (loads data on first access)
UKaiJaxCharacterData* CharData = UKaiJaxCharacterData::Get();

// Get evolution rules from lockfile
FCharacterEvolution Evolution = CharData->GetEvolutionRules();
// Evolution.StartingTailCount = 3
// Evolution.FinalTailCount = 9
// Evolution.UnlockRule = "sequential_only"

// Get tail tier reaction for current count
FTailTierReaction Reaction = CharData->GetTailTierReaction(6);
// Reaction.TierName = "myth_in_motion"
// Reaction.FodderConfidence = "very_low"
// Reaction.PercussionIntensity = 0.75

// Get tail role definition
FTailRole Role = CharData->GetTailRole(1);
// Role.Name = "bond"
// Role.Function = "parry_counter_revive"
```

**Character Class:**
```cpp
// Source/KaiJax/Characters/KaiJaxCharacter.h
class AKaiJaxCharacter : public ACharacter {
    UPROPERTY(EditAnywhere, BlueprintReadOnly)
    int32 ActiveTailCount = 3;  // Starting count from lockfile
    
    UPROPERTY(EditAnywhere, BlueprintReadOnly)
    TArray<ETailState> TailStates;  // 9 entries (3 active, 6 inactive)
    
    void UnlockTail(int32 TailNumber);  // Sequential only
    void ApplyTailTierReaction(int32 CurrentTailCount);  // Trigger world systems
};
```

**Tail Unlocking:**
```cpp
void AKaiJaxCharacter::UnlockTail(int32 TailNumber) {
    // Enforce canonical sequential unlock rule: 3→4→5→6→7→8→9
    // TailNumber is 0-indexed array index (0-8)
    // Pass ActiveTailCount as TailNumber to unlock next tail
    // E.g., with 3 active tails (indices 0,1,2), call UnlockTail(3) to unlock 4th tail
    
    if (ActiveTailCount >= 9) return;  // Max tails reached
    if (TailNumber != ActiveTailCount) return;  // Must be sequential
    
    // Unlock next tail (0-based array indexing)
    if (TailNumber >= 0 && TailNumber < 9) {
        if (TailStates[TailNumber] == ETailState::Inactive) {
            TailStates[TailNumber] = ETailState::Active;
            ActiveTailCount++;
            UpdateTailVisuals();
            
            // Trigger world reactions
            ApplyTailTierReaction(ActiveTailCount);
        }
    }
}
```

## World System Integration

### Tail Tier Reactions

All game systems must respond to `current_tail_count`:

**Enemy AI:**
```typescript
import { getTailTierReaction } from '@shared/character/kaiJaxLoader';

function getEnemyBehavior(playerTailCount: number) {
  const reaction = getTailTierReaction(playerTailCount);
  
  // At 3 tails: Enemies engage normally
  // At 6 tails: Fodder flees on sight
  // At 9 tails: Only scripted encounters remain
  
  return {
    fodderConfidence: reaction.enemy_behavior.fodder_confidence,
    engagementDistance: reaction.enemy_behavior.fodder_engagement_distance,
    eliteTactics: reaction.enemy_behavior.elite_tactics,
  };
}
```

**Music System:**
```typescript
function getMusicIntensity(playerTailCount: number) {
  const reaction = getTailTierReaction(playerTailCount);
  
  return {
    layer: reaction.music_intensity.combat_layer,
    percussion: reaction.music_intensity.percussion_intensity,
    brass: reaction.music_intensity.brass_presence,
    choir: reaction.music_intensity.choir_enabled,
  };
}
```

**NPC Reactions:**
```typescript
function getNPCDialogue(playerTailCount: number, npcId: string) {
  const reaction = getTailTierReaction(playerTailCount);
  
  // At 3 tails: "You seem capable..."
  // At 6 tails: "Y-you're the one they speak of..."
  // At 9 tails: *NPC is speechless, dialogue system intentionally breaks*
  
  return selectDialogue(npcId, reaction.npc_reactions.default_attitude);
}
```

## Animation Integration

### Required Animation Sets

From `kai_jax.character.json`:

```json
{
  "animation": {
    "required_sets": [
      "idle_calm",
      "idle_combat",
      "walk",
      "run",
      "sprint",
      "light_combo",
      "heavy_combo",
      "special_attacks",
      "dodge_ground",
      "dodge_air",
      "parry",
      "counter",
      "finisher",
      "hit_reactions",
      "death"
    ]
  }
}
```

**Animation State Machine:**
```cpp
// C++ implementation
void Character::Update(float deltaTime) {
    if (inputHandler && stateManager) {
        InputState input = inputHandler->GetCurrentInput();
        AnimationState nextState = stateManager->GetNextState(currentAnimationState, input);
        
        if (nextState != currentAnimationState) {
            SetAnimationState(nextState);
        }
    }
}
```

### Tail Physics

**Physics Constraints (Per lockfile):**
```json
{
  "swing_limit": true,
  "twist_limit": true,
  "noodle_physics": false
}
```

**Implementation:**
- Each tail has 5-7 bones
- Physics constraints prevent unrealistic movement
- No "noodle physics" - tails have weight and inertia
- Collision enabled for gameplay interactions

## Material System

### PBR Materials (From lockfile)

**1. Fur Material:**
```glsl
// Type: card_or_shell
// Maps: albedo, normal, roughness
baseColor = texture(albedoMap, uv);
normal = texture(normalMap, uv);
roughness = texture(roughnessMap, uv);
metallic = 0.0;
```

**2. Armor Material:**
```glsl
// Type: worn_foundry_steel
// Roughness: 0.4-0.6, Metallic: 0.9
// Edge wear required
baseColor = texture(albedoMap, uv);
roughness = lerp(0.4, 0.6, texture(roughnessMap, uv));
metallic = 0.9 * texture(metallicMap, uv);
```

**3. Weave Energy (Tails):**
```glsl
// Type: weave_energy
// Emissive: true, Intensity: 2.0
// Mobile: disabled
baseColor = vec3(0.53, 0.82, 1.0); // #88d0ff
emissive = baseColor * 2.0;
alpha = 0.8;
```

## LOD System

**Triangle Count Targets (From lockfile):**
```
LOD0: 80,000 - 120,000 triangles (PC high, cinematics)
LOD1: 50,000 - 70,000 triangles (PC medium, console)
LOD2: 25,000 - 35,000 triangles (Mobile, far distance)
```

**Implementation:**
```cpp
void Character::SelectLOD(float distanceToCamera) {
    if (distanceToCamera < 10.0f) {
        SetLOD(0);  // Full quality
    } else if (distanceToCamera < 30.0f) {
        SetLOD(1);  // Medium
    } else {
        SetLOD(2);  // Low
    }
}
```

## Validation Checklist

Before deploying Kai-Jax:

- [ ] Run `npm run validate:canon` - MUST pass
- [ ] Verify model has exactly 9 tails
- [ ] Check tail bone count (5-7 per tail)
- [ ] Validate LOD triangle counts
- [ ] Test all required animations
- [ ] Verify materials use PBR workflow
- [ ] Test tail physics constraints
- [ ] Verify world systems respond to tail count
- [ ] Test sequential tail unlock (3→4→5→6→7→8→9)
- [ ] Validate silhouette readable in shadow
- [ ] Test across PC/iOS/Android
- [ ] Verify no platform-specific gameplay divergence

## Common Issues

### Issue: "Tail count mismatch"
**Cause:** Model has wrong number of tails
**Fix:** Regenerate model with exactly 9 tails

### Issue: "Validation failed on load"
**Cause:** `kai_jax.character.json` doesn't match schema
**Fix:** Run `npm run validate:canon` and fix errors

### Issue: "Tail unlock not working"
**Cause:** Trying to skip tails or unlock out of order
**Fix:** Enforce sequential unlock: `targetCount === currentCount + 1`

### Issue: "Noodle physics on tails"
**Cause:** Physics constraints not applied
**Fix:** Set `swing_limit: true`, `twist_limit: true`, `noodle_physics: false`

## References

- **Canonical Data:** `/kai_jax.character.json`
- **Schema:** `/schemas/character.schema.json`
- **World Reactions:** `/data/world/tail_tier_reactions.json`
- **Governance:** `/README_CANON.md`
- **Model Spec:** `/assets/models/characters/kai-jax/KAI_JAX_MODEL_SPECIFICATION.md`
- **C++ Example:** `/engine_core/character/example_load_kai_jax.cpp`
- **TypeScript Loader:** `/packages/shared/src/character/kaiJaxLoader.ts`
- **Unreal Character:** `/Source/KaiJax/Characters/KaiJaxCharacter.cpp`
- **Unreal Character Data Loader:** `/Source/KaiJax/Characters/KaiJaxCharacterData.cpp`

## Contact

If requirements are unclear or conflict, STOP and ask for clarification. Do not guess or invent behavior.

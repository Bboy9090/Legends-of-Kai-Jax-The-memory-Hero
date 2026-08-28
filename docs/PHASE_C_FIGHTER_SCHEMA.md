# Phase C: Fighter JSON Schema & Registry

**Purpose:** Standardized fighter template for rapid asset integration and monthly post-launch additions  
**Status:** Design phase, ready for implementation in Phase C Week 4 (C4.1)

---

## Fighter JSON Schema v1.0

```json
{
  "id": "fighter-unique-id",
  "name": "Fighter Name",
  "archetype": "speed|heavy|electric|tank|technical|balanced",
  "version": "1.0",
  "enabled": true,
  
  "metadata": {
    "displayName": "Fighter Display Name",
    "description": "Short fighter description (100-200 chars)",
    "lore": "Longer fighter lore (500-1000 chars)",
    "releaseDate": "2026-09-15",
    "artist": "Artist Name",
    "animator": "Animator Name"
  },
  
  "model": {
    "gltfPath": "models/fighters/fighter-id.glb",
    "fileSizeKB": 1500,
    "scale": 1.0,
    "boundingBox": {
      "width": 0.8,
      "height": 2.1,
      "depth": 0.6
    }
  },
  
  "animations": {
    "idle": {
      "clip": "Armature|idle",
      "speed": 1.0,
      "loop": true,
      "weight": 1.0
    },
    "walk": {
      "clip": "Armature|walk",
      "speed": 0.8,
      "loop": true,
      "weight": 1.0
    },
    "run": {
      "clip": "Armature|run",
      "speed": 1.2,
      "loop": true,
      "weight": 1.0
    },
    "attack_light": {
      "clip": "Armature|attack_light",
      "speed": 1.0,
      "loop": false,
      "weight": 1.0,
      "nextState": "idle"
    },
    "attack_medium": {
      "clip": "Armature|attack_medium",
      "speed": 0.9,
      "loop": false,
      "weight": 1.0,
      "nextState": "idle"
    },
    "attack_heavy": {
      "clip": "Armature|attack_heavy",
      "speed": 0.8,
      "loop": false,
      "weight": 1.0,
      "nextState": "idle"
    },
    "special_ability": {
      "clip": "Armature|special",
      "speed": 1.0,
      "loop": false,
      "weight": 1.0,
      "nextState": "idle",
      "energyCost": 50,
      "cooldownMS": 5000
    },
    "dodge": {
      "clip": "Armature|dodge",
      "speed": 1.2,
      "loop": false,
      "weight": 1.0,
      "nextState": "idle"
    },
    "hit": {
      "clip": "Armature|hit",
      "speed": 1.0,
      "loop": false,
      "weight": 1.0,
      "nextState": "idle"
    },
    "victory": {
      "clip": "Armature|victory",
      "speed": 1.0,
      "loop": false,
      "weight": 1.0
    },
    "defeat": {
      "clip": "Armature|defeat",
      "speed": 1.0,
      "loop": false,
      "weight": 1.0
    }
  },
  
  "stats": {
    "health": 100,
    "healthMax": 100,
    "speed": 1.0,
    "strength": 1.0,
    "defense": 1.0,
    "specialEnergy": 0,
    "specialEnergyMax": 100
  },
  
  "moves": [
    {
      "id": "move_light",
      "name": "Light Attack",
      "type": "light",
      "animation": "attack_light",
      "damage": 10,
      "energyGain": 5,
      "speed": 0.4,
      "recovery": 0.3,
      "priority": 1,
      "description": "Quick jab"
    },
    {
      "id": "move_medium",
      "name": "Medium Attack",
      "type": "medium",
      "animation": "attack_medium",
      "damage": 20,
      "energyGain": 10,
      "speed": 0.6,
      "recovery": 0.5,
      "priority": 2,
      "description": "Solid punch"
    },
    {
      "id": "move_heavy",
      "name": "Heavy Attack",
      "type": "heavy",
      "animation": "attack_heavy",
      "damage": 35,
      "energyGain": 15,
      "speed": 0.8,
      "recovery": 0.8,
      "priority": 3,
      "description": "Powerful blow"
    },
    {
      "id": "move_special",
      "name": "Special Ability",
      "type": "special",
      "animation": "special_ability",
      "damage": 50,
      "energyCost": 50,
      "speed": 0.5,
      "recovery": 1.0,
      "priority": 4,
      "cooldownMS": 5000,
      "description": "Ultimate move"
    },
    {
      "id": "move_dodge",
      "name": "Dodge",
      "type": "dodge",
      "animation": "dodge",
      "damage": 0,
      "speed": 0.3,
      "recovery": 0.2,
      "invulnerableFrames": 10,
      "description": "Evade incoming attack"
    }
  ],
  
  "cosmetics": [
    {
      "id": "default",
      "name": "Default Skin",
      "type": "skin",
      "unlocked": true,
      "rarity": "common",
      "colors": {
        "primary": "#FF6B35",
        "secondary": "#004E89",
        "accent": "#F77F00"
      }
    }
  ],
  
  "audio": {
    "sfx": {
      "punch_impact": "audio/sfx/punch_impact.mp3",
      "kick_impact": "audio/sfx/kick_impact.mp3",
      "dodge_whoosh": "audio/sfx/dodge_whoosh.mp3",
      "special_charge": "audio/sfx/special_charge.mp3",
      "special_release": "audio/sfx/special_release.mp3",
      "hit_reaction": "audio/sfx/hit_reaction.mp3",
      "victory": "audio/sfx/victory.mp3",
      "defeat": "audio/sfx/defeat.mp3"
    }
  },
  
  "ai": {
    "difficulty": "normal",
    "aggressiveness": 0.6,
    "defensiveness": 0.4,
    "specialAbilityFrequency": 0.2,
    "comboLikelihood": 0.5,
    "patterns": [
      {
        "name": "aggressive",
        "weight": 0.4,
        "sequence": ["light", "medium", "heavy"]
      },
      {
        "name": "defensive",
        "weight": 0.3,
        "sequence": ["dodge", "light", "dodge"]
      },
      {
        "name": "special",
        "weight": 0.3,
        "sequence": ["medium", "medium", "special"]
      }
    ]
  },
  
  "telemetry": {
    "trackPicks": true,
    "trackWinRate": true,
    "trackMoveUsage": true,
    "trackBalanceMetrics": true
  },
  
  "featureFlags": {
    "enabled": true,
    "betaFighter": false,
    "limitedTime": false,
    "disabledMoves": []
  }
}
```

---

## Schema Validation Rules

### Required Fields
- `id` — Must be unique, lowercase, hyphenated (e.g., `velocity-fighter`)
- `name` — Display name (2-30 chars)
- `archetype` — Must be one of: `speed|heavy|electric|tank|technical|balanced`
- `model.gltfPath` — Valid path to GLTF file
- `animations` — All core animations required: `idle`, `walk`, `run`, `attack_light`, `attack_medium`, `attack_heavy`, `special_ability`, `dodge`, `hit`, `victory`, `defeat`
- `stats` — All base stats required
- `moves` — Min 4 moves (light, medium, heavy, special or dodge)

### Validation Constraints
- `model.fileSizeKB` — Must be < 2000 KB (mobile performance)
- `stats.health` — Must be 50-200 (balance range)
- `stats.speed/strength/defense` — Must be 0.5-2.0 (balance multipliers)
- `moves[].damage` — Must be 5-100 (damage range)
- `moves[].speed` — Must be 0.2-1.0 (attack speed)
- `cosmetics[]` — Min 1 (default skin)

---

## Integration with Code

### Loader Implementation (pseudocode)

```typescript
interface Fighter {
  id: string;
  name: string;
  archetype: string;
  model: ModelConfig;
  animations: Record<string, AnimationClip>;
  stats: Stats;
  moves: Move[];
  cosmetics: Cosmetic[];
  ai: AIConfig;
}

const fighterRegistry = new Map<string, Fighter>();

async function loadFighter(fighterId: string): Promise<Fighter> {
  const json = await fetch(`/data/fighters/${fighterId}.json`);
  const config = await json.json();
  
  // Validate against schema
  validateFighterSchema(config);
  
  // Load GLTF model
  config.modelData = await loadGLTF(config.model.gltfPath);
  
  // Register animations
  config.animationClips = extractAnimationClips(
    config.modelData,
    config.animations
  );
  
  return config;
}

function validateFighterSchema(config: any): void {
  // Check required fields
  if (!config.id || !config.name || !config.archetype) {
    throw new Error('Missing required fighter fields');
  }
  
  // Check animation clips exist
  const requiredClips = [
    'idle', 'walk', 'run', 'attack_light', 
    'attack_medium', 'attack_heavy', 'special_ability',
    'dodge', 'hit', 'victory', 'defeat'
  ];
  
  for (const clip of requiredClips) {
    if (!config.animations[clip]) {
      throw new Error(`Missing animation clip: ${clip}`);
    }
  }
  
  // Check stat ranges
  if (config.stats.health < 50 || config.stats.health > 200) {
    throw new Error('Invalid health stat');
  }
  
  // Check move integrity
  if (config.moves.length < 4) {
    throw new Error('Minimum 4 moves required');
  }
}
```

---

## File Organization

```
apps/web/public/data/fighters/
├── velocity-fighter.json
├── kaison-fighter.json
├── voltage-fang-fighter.json
├── steelwolf-fighter.json
├── ashen-tiger-fighter.json
├── blazing-fox-fighter.json
└── [future fighters...]

apps/web/public/models/fighters/
├── velocity-fighter.glb
├── kaison-fighter.glb
├── voltage-fang-fighter.glb
├── steelwolf-fighter.glb
├── ashen-tiger-fighter.glb
├── blazing-fox-fighter.glb
└── [future fighters...]
```

---

## Phase C1 Deliverables

By end of C1.2 (Day 7), all fighter JSON files must:
- ✅ Validate against schema
- ✅ Reference valid GLTF model files
- ✅ All animations clips present in model
- ✅ Move sets balanced (no damage > 100)
- ✅ Cosmetics configured (min 1 default skin)
- ✅ AI patterns defined

---

## Phase C4 Refactor (Days 22-24)

Fighter registry will be migrated to:
- Remote JSON delivery (Firebase or CDN)
- Hot reload support (no redeploy for new fighters)
- Feature flag integration (enable/disable per fighter)
- Telemetry hooks (automatic analytics event firing)

---

## Versioning Strategy

**Schema version:** Incremented on breaking changes
**Fighter version:** Incremented on balance/animation changes

Example:
```json
{
  "schemaVersion": "1.0",
  "fighterVersion": "1.2",
  "lastUpdated": "2026-09-15"
}
```

This allows rolling updates without forcing all fighters to update simultaneously.

---

## Success Criteria

- ✅ Schema supports all 6 fighter archetypes
- ✅ Validation catches missing/invalid data
- ✅ GLTF models load without errors
- ✅ Animations play smoothly (no clip mismatches)
- ✅ Stats remain balanced across roster
- ✅ Schema extends to Phase D (multiplayer, story, cosmetics)
- ✅ New fighters can be added monthly without code changes

# 🎮 Legendary-Tier Game Mechanics Implementation

This document describes the advanced fighting game mechanics implemented to create a "legendary-tier" experience, combining the precision of Super Smash Bros Ultimate with the cinematic power fantasy of Marvel Ultimate Alliance.

## Table of Contents

1. [Variable Gravity Curves](#variable-gravity-curves)
2. [Frame-Canceling System](#frame-canceling-system)
3. [Poise and Stagger System](#poise-and-stagger-system)
4. [Visual Juice System](#visual-juice-system)
5. [Dynamic Camera](#dynamic-camera)
6. [Tactical AI](#tactical-ai)
7. [Character Archetype System](#character-archetype-system)

---

## Variable Gravity Curves

**Location**: `packages/engine/src/physics/GravityCurve.ts`

### What It Does
Creates "snappy" jumps with floaty ascent and weighted falls - the secret to satisfying jump feel in games like Smash Bros Ultimate.

### Key Features
- **Snappy Liftoff**: Reduced gravity during ascent (75% of base)
- **Peak Hangtime**: Even lighter gravity near jump apex (50% of base)
- **Weighted Falls**: Increased gravity during descent (120% of base)
- **Variable Jump Height**: Releasing jump button early applies more gravity

### Usage Example
```typescript
import { GravityCurve } from '@smash-heroes/engine';

const gravityCurve = new GravityCurve({
  baseGravity: 0.8,
  ascentGravityMultiplier: 0.75,  // Lighter going up
  descentGravityMultiplier: 1.2,   // Heavier going down
  peakGravityMultiplier: 0.5,      // Floaty at peak
  peakThreshold: 2.0,               // Velocity threshold for "peak"
});

// In game loop
gravityCurve.applyVariableGravity(body, isJumpHeld);

// Get current jump phase
const phase = gravityCurve.getJumpPhase(body);
// Returns: GROUNDED, ASCENDING, PEAK, or DESCENDING
```

### Integration
Already integrated into `MomentumPhysics.ts` - no additional setup needed!

---

## Frame-Canceling System

**Location**: `packages/engine/src/combat/FrameCancelSystem.ts`

### What It Does
Allows skilled players to cancel attack animations early and string together creative combos - essential for high-level play.

### Cancel Types
- **Normal Cancel**: Cancel into another normal attack
- **Special Cancel**: Cancel into special moves (earlier window)
- **Jump Cancel**: Cancel into jump
- **Dash Cancel**: Cancel into dash
- **Ledge Cancel**: Cancel by grabbing ledge
- **Hit Cancel**: Bonus cancel window on successful hit
- **Whiff Cancel**: Limited cancel even on miss

### Usage Example
```typescript
import { FrameCancelSystem, CancelType } from '@smash-heroes/engine';

const cancelSystem = new FrameCancelSystem();

// Register an attack's cancel windows
cancelSystem.registerAttackCancelWindows(jabAttack, {
  normalCancelStart: 20,    // Frame 20+
  specialCancelStart: 15,   // Frame 15+ (earlier)
  jumpCancelStart: 18,
  canHitCancel: true,       // Can cancel earlier on hit
  hitCancelAdvantage: 5,    // 5 extra frames on hit
});

// Check if player can cancel
if (cancelSystem.canCancel('jab', currentFrame, CancelType.SPECIAL)) {
  // Allow transition to special move
  startSpecialMove();
}

// Check hit cancel
if (cancelSystem.canHitCancel('jab', currentFrame, didHit)) {
  // Allow early cancel because hit connected
  allowCancel();
}
```

### Design Philosophy
- Early normal attacks: 70% through animation
- Special cancels: 50% through animation
- Jump/dash cancels: 80% through animation
- Hit cancels grant 5 extra frames of advantage

---

## Poise and Stagger System

**Location**: `packages/engine/src/combat/PoiseSystem.ts`

### What It Does
Makes hits feel impactful - light hits cause flinching, heavy hits cause staggering, and massive hits launch opponents.

### Reaction Types
- **Super Armor**: Tank through weak hits (high poise)
- **Flinch**: Brief stun, can still move
- **Stagger**: Medium stun, cannot move
- **Launch**: Heavy launch state

### How It Works
1. Each fighter has a **poise pool** (like a second health bar)
2. Attacks deal **poise damage** (based on attack strength + attacker weight)
3. When poise breaks, defender enters stagger/launch state
4. Poise regenerates after 1 second of not being hit

### Usage Example
```typescript
import { PoiseSystem, ReactionType } from '@smash-heroes/engine';

const poiseSystem = new PoiseSystem();

// Initialize fighter poise
poiseSystem.initializePoise('player1', 100, 1.0); // maxPoise: 100, regenRate: 1/sec

// On hit, determine reaction
const reaction = poiseSystem.calculateReaction(
  'defender',
  attackHitbox,
  attackerWeight
);

if (reaction.type === ReactionType.LAUNCH) {
  // Massive hit - launch state
  enterLaunchState(reaction.frames);
} else if (reaction.type === ReactionType.STAGGER) {
  // Heavy hit - stagger state
  enterStaggerState(reaction.frames);
} else if (reaction.type === ReactionType.SUPER_ARMOR) {
  // Tanked it! No reaction
  playTankSound();
}

// Update poise regeneration
poiseSystem.update(deltaTime);
```

### Poise Damage Calculation
```
effectiveDamage = baseDamage * knockbackFactor * weightFactor * damageTypeMultiplier

- Physical attacks: 1.2x poise damage
- Energy attacks: 0.8x poise damage
- Special attacks: 1.5x poise damage
```

---

## Visual Juice System

**Location**: `packages/engine/src/effects/VisualJuiceSystem.ts`

### What It Does
Every action needs secondary effects - dust clouds on dashes, sparks on parries, trails on fast movement.

### Effect Types
- **Dash Dust**: Brown dust particles opposite to movement
- **Parry Sparks**: Gold circular sparks burst
- **Impact Effects**: Color-coded by damage (white → gold → orange → red)
- **Landing Dust**: Scales with impact speed
- **Jump Dust**: Small puff on takeoff
- **Charge Effects**: Color shifts (blue → gold → red)
- **Aura Effects**: Persistent particles for powered-up states
- **Movement Trails**: For high-speed movement

### Usage Example
```typescript
import { VisualJuiceSystem } from '@smash-heroes/engine';

const visualJuice = new VisualJuiceSystem(particleSystem);

// On dash
visualJuice.emitDashDust(position, direction);

// On parry success
visualJuice.emitParrySparks(position);

// On hit
visualJuice.emitImpactEffect(position, damage, knockbackAngle);

// On landing
visualJuice.emitLandingDust(position, impactSpeed);

// Update trails
visualJuice.updateTrail(entityId, position, speed);

// Render trails
const trail = visualJuice.getTrail(entityId);
renderTrailEffect(trail);
```

### Impact Color Codes
- **< 10 damage**: White (light hits)
- **10-20 damage**: Gold (medium hits)
- **20-30 damage**: Orange (heavy hits)
- **30+ damage**: Red (massive hits)

---

## Dynamic Camera

**Location**: `packages/engine/src/core/DynamicCamera.ts`

### What It Does
The camera is a character - it zooms in for tense 1v1 moments and zooms out for chaotic multi-fighter brawls.

### Key Features
- **Dynamic Framing**: Automatically frames all active fighters
- **Tension Zoom**: Zooms in close during 1v1 for drama
- **Chaos Zoom**: Zooms out during multi-fighter brawls
- **Smooth Interpolation**: No jarring camera movements
- **Stage Bounds**: Respects stage limits

### Camera Behavior
- **Single Fighter**: 1.2x base zoom (closer view)
- **1v1 Close Range**: 2.0x zoom (maximum tension)
- **1v1 Far Range**: 0.5x zoom (see the whole arena)
- **Multi-Fighter**: Dynamically adjusts based on spread

### Usage Example
```typescript
import { DynamicCamera } from '@smash-heroes/engine';

const camera = new DynamicCamera({
  smoothingFactor: 0.1,      // Position smoothing
  zoomSmoothingFactor: 0.08, // Zoom smoothing
  minZoom: 0.5,              // Maximum zoom out
  maxZoom: 2.0,              // Maximum zoom in
  baseZoom: 1.0,             // Normal zoom
  padding: 100,              // Screen edge padding
  minDistance: 200,          // Distance for max zoom in
  maxDistance: 1000,         // Distance for max zoom out
});

// Update camera each frame
const fighters = [
  { id: 'p1', position: { x: 100, y: 200 }, isActive: true },
  { id: 'p2', position: { x: 500, y: 200 }, isActive: true },
];

camera.update(fighters);

// Get camera transform for rendering
const transform = camera.getTransform();
// { position, zoom, targetPosition, targetZoom }

// Apply to renderer
renderer.setCamera(transform.position, transform.zoom);

// Focus on specific fighter (for dramatic moments)
camera.focusOn(winnerPosition, 1.8);

// Convert between world and screen space
const screenPos = camera.worldToScreen(worldPos, screenWidth, screenHeight);
const worldPos = camera.screenToWorld(screenPos, screenWidth, screenHeight);
```

---

## Tactical AI

**Location**: `packages/engine/src/ai/TacticalAI.ts`

### What It Does
NPCs don't just patrol - they flank, retreat when hurt, and capitalize on player mistakes.

### AI Behaviors
- **Assess**: Observe and maintain safe distance
- **Approach**: Move toward target with dash
- **Retreat**: Move to safe position when low health
- **Flank**: Attack from side (requires ally)
- **Pressure**: Aggressive close-range attacks
- **Punish**: Capitalize on vulnerable opponent
- **Counter Attack**: Defensive waiting for opening

### AI Difficulty Levels
- **Easy**: 50% accuracy, makes frequent mistakes
- **Normal**: 75% accuracy, decent decision-making
- **Hard**: 90% accuracy, smart decisions
- **Legendary**: 95% accuracy, nearly perfect play

### AI Personalities
- **Aggressive**: High aggression (0.8), pushes constantly
- **Defensive**: Low aggression (0.3), counter-focused
- **Balanced**: Medium aggression (0.5), versatile
- **Tactical**: Strategic aggression (0.6), uses positioning

### Usage Example
```typescript
import { TacticalAI, AIDifficulty, AIPersonality } from '@smash-heroes/engine';

const ai = new TacticalAI();

// Initialize AI for enemy
ai.initializeAI('enemy1', AIDifficulty.HARD, AIPersonality.TACTICAL);

// Update AI each frame
const action = ai.update(
  deltaTime,
  aiFighter,      // The AI-controlled fighter
  [player],       // Opponents
  [ally1, ally2]  // Allies (for flanking)
);

// Execute AI action
switch (action.type) {
  case ActionType.MOVE:
    moveInDirection(action.direction, action.modifiers);
    break;
  case ActionType.ATTACK:
    performAttack(action.attackType, action.direction);
    break;
  case ActionType.DEFEND:
    enterDefendState(action.modifiers);
    break;
}
```

### AI Decision Tree
```
1. Check health → Retreat if < 30%
2. Find target → Prefer low health opponents
3. Assess vulnerability → Punish if target is vulnerable
4. Check distance:
   - Close (< 200): Pressure or Counter
   - Medium (200-500): Flank or Approach
   - Far (> 500): Approach
5. Apply difficulty → Randomize for mistakes
```

---

## Character Archetype System

**Location**: `packages/characters/src/base/CharacterArchetype.ts`

### What It Does
Integrates narrative into combat - Life Path numbers and zodiac signs influence fighting style and stats.

### Life Path Numbers (1-9)
Each number represents a different archetype:
- **1 - Leader**: High attack power, confident
- **2 - Diplomat**: Balanced, counter-focused
- **3 - Creative**: High mobility, combo specialist
- **4 - Builder**: High defense, methodical
- **5 - Adventurer**: Fastest, unpredictable
- **6 - Nurturer**: Defensive, protective
- **7 - Seeker**: Analytical, precise
- **8 - Powerhouse**: Raw power, intimidating
- **9 - Humanitarian**: Disciplined, efficient, perfect timing

### Zodiac Signs
Each sign modifies the base archetype:
- **Fire Signs** (Aries, Leo, Sagittarius): Aggressive, high speed
- **Earth Signs** (Taurus, Virgo, Capricorn): Defensive, precise
- **Air Signs** (Gemini, Libra, Aquarius): Mobile, versatile
- **Water Signs** (Cancer, Scorpio, Pisces): Adaptive, counter-focused

### Special Example: Life Path 9 / Virgo
As specified in the requirements:
```typescript
Life Path 9: Humanitarian
+ Virgo: Analytical, Precise

= Disciplined, analytical, devastatingly efficient fighter

Combat Modifiers:
- Attack Speed: 1.0x
- Movement Speed: 1.0x
- Defense: 1.05x
- Special Power: 1.1x
- Combo Extension: +4 frames (2 + 2)
- Counter Window: +9 frames (5 + 4)
- Precision: 1.2x (devastatingly efficient)
- Aggression: 0.5 (calculated, not reckless)

Special Mechanic: "Perfect Counter"
- Grants bonus damage on precise timing
```

### Usage Example
```typescript
import { CharacterArchetype, LifePath, ZodiacSign } from '@smash-heroes/characters';

// Create archetype
const archetype = new CharacterArchetype(
  LifePath.NINE_HUMANITARIAN,
  ZodiacSign.VIRGO
);

// Apply combat modifiers to fighter stats
const modifiers = archetype.combatModifiers;
fighter.stats.attackSpeed *= modifiers.attackSpeed;
fighter.stats.movementSpeed *= modifiers.movementSpeed;
fighter.stats.defense *= modifiers.defense;
fighter.stats.specialPower *= modifiers.specialPower;

// Extend frame windows
attack.activeFrames += modifiers.comboExtension;
counterWindow.duration += modifiers.counterWindow;

// Get personality for AI
const traits = archetype.personalityTraits;
console.log(traits.fightingStyle); // "Disciplined Perfectionist - Analytical and devastatingly efficient"
console.log(traits.specialMechanic); // "Perfect Counter - Grants bonus damage on precise timing"

// Get backstory for environmental storytelling
const backstory = archetype.getBackstoryHook();
// "Fights for a greater purpose with precision"
```

### Environmental Storytelling
Use archetype data to inform:
- **Animation Style**: Precise vs. wild movements
- **Particle Effects**: Color schemes matching personality
- **Sound Design**: Disciplined sounds vs. chaotic sounds
- **Victory Poses**: Reflect character archetype
- **Combat Dialogue**: Analytical observations vs. aggressive taunts

---

## Integration Guide

### Setting Up a Complete Fighter

```typescript
import { MomentumPhysics, GravityCurve } from '@smash-heroes/engine';
import { PoiseSystem, FrameCancelSystem } from '@smash-heroes/engine';
import { VisualJuiceSystem, DynamicCamera } from '@smash-heroes/engine';
import { TacticalAI, AIDifficulty, AIPersonality } from '@smash-heroes/engine';
import { CharacterArchetype, LifePath, ZodiacSign } from '@smash-heroes/characters';

// 1. Create character archetype
const archetype = new CharacterArchetype(
  LifePath.NINE_HUMANITARIAN,
  ZodiacSign.VIRGO
);

// 2. Initialize physics with variable gravity
const physics = new MomentumPhysics();
// Variable gravity is already integrated!

// 3. Initialize poise
const poiseSystem = new PoiseSystem();
poiseSystem.initializePoise(
  fighter.id,
  100 * archetype.combatModifiers.defense, // Scale by defense
  1.0
);

// 4. Set up frame canceling
const cancelSystem = new FrameCancelSystem();
for (const attack of fighter.attacks) {
  cancelSystem.registerAttackCancelWindows(attack, {
    canHitCancel: true,
    hitCancelAdvantage: archetype.combatModifiers.comboExtension,
  });
}

// 5. Initialize visual effects
const visualJuice = new VisualJuiceSystem(particleSystem);

// 6. Set up camera
const camera = new DynamicCamera();

// 7. Initialize AI (for NPCs)
const ai = new TacticalAI();
ai.initializeAI(
  npc.id,
  AIDifficulty.LEGENDARY,
  AIPersonality.TACTICAL
);

// Game loop
function update(deltaTime: number) {
  // Update physics
  physics.update(fighter.body, inputs, platforms);
  
  // Update poise
  poiseSystem.update(deltaTime);
  
  // Check for cancels
  if (fighter.isAttacking) {
    const canCancel = cancelSystem.canCancel(
      fighter.currentAttack,
      fighter.attackFrame,
      CancelType.SPECIAL
    );
    if (canCancel && inputs.special) {
      fighter.startSpecial();
    }
  }
  
  // Update visual effects
  if (fighter.isDashing) {
    visualJuice.emitDashDust(fighter.position, fighter.facing);
  }
  visualJuice.updateTrail(fighter.id, fighter.position, fighter.speed);
  
  // Update camera
  camera.update(allFighters);
  
  // Update AI
  if (npc.isAI) {
    const action = ai.update(deltaTime, npc, [fighter], []);
    executeAction(npc, action);
  }
}
```

---

## Performance Considerations

### Variable Gravity
- **Cost**: Negligible (simple math per frame)
- **Optimization**: Already optimized in MomentumPhysics

### Frame Canceling
- **Cost**: O(1) map lookup
- **Optimization**: Use map for O(1) cancel window checks

### Poise System
- **Cost**: O(n) where n = number of fighters
- **Optimization**: Only regenerate poise after 1 second grace period

### Visual Juice
- **Cost**: Particle system (see ParticleSystem docs)
- **Optimization**: Limit max particles to 1000, auto-cleanup dead particles

### Dynamic Camera
- **Cost**: O(n) where n = number of fighters
- **Optimization**: Smooth interpolation prevents costly recalculations

### Tactical AI
- **Cost**: O(n) where n = number of opponents
- **Optimization**: Update interval of 100ms (not every frame)

---

## Testing & Debugging

### Variable Gravity
```typescript
// Test jump feel
const phase = gravityCurve.getJumpPhase(body);
console.log(`Jump phase: ${phase}`);
console.log(`Gravity: ${gravityCurve.calculateGravity(body, isJumpHeld)}`);
```

### Frame Canceling
```typescript
// Log cancel windows
const earliestFrame = cancelSystem.getEarliestCancelFrame('jab');
console.log(`Can cancel from frame: ${earliestFrame}`);
```

### Poise System
```typescript
// Monitor poise
const state = poiseSystem.getPoiseState(fighter.id);
console.log(`Poise: ${state.currentPoise}/${state.maxPoise}`);
console.log(`Staggered: ${state.isStaggered}`);
```

### AI Behavior
```typescript
// Debug AI decisions
const state = ai.getAIState(npc.id);
console.log(`Behavior: ${state.currentBehavior}`);
console.log(`Aggression: ${state.aggressionLevel}`);
```

---

## Future Enhancements

1. **Gravity Curves**: Add character-specific gravity modifiers
2. **Frame Canceling**: Add "IASA frames" (Interruptible As Soon As)
3. **Poise System**: Add poise damage types (blunt, piercing, etc.)
4. **Visual Juice**: Add custom particle shapes and physics
5. **Camera**: Add screen shake integration, cinematic moments
6. **AI**: Add learning system to adapt to player patterns
7. **Archetypes**: Add more astrological systems (Chinese zodiac, etc.)

---

## Credits

Inspired by:
- **Super Smash Bros Ultimate**: Frame-perfect precision, variable gravity
- **Marvel Ultimate Alliance**: Cinematic power fantasy
- **Devil May Cry**: Style and combo depth
- **Batman Arkham Series**: Freeflow combat
- **Celeste**: Coyote time and input buffering

Implemented with ❤️ for creating legendary-tier fighting games.

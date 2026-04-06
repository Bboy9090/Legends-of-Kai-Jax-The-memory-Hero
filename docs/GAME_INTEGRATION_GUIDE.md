# 🎮 GAME DEVELOPMENT INTEGRATION GUIDE
## Complete Implementation & Testing

**Status:** 75% Complete  
**Target:** 95%+ Production Ready  
**Last Updated:** January 2, 2026

---

## 📋 SYSTEM INTEGRATION CHECKLIST

### Core Systems (Ready to Integrate)

#### ✅ **Combat System** (CombatSystem.ts)
- [x] Hit box creation and management
- [x] Hurt box tracking for all characters
- [x] Collision detection (sphere-sphere)
- [x] Damage calculation with power multiplier
- [x] Knockback calculation with weight factor
- [x] Hit cooldown to prevent repeated hits
- [x] EventBus integration for damage/effects
- [x] VFX/SFX event emission
- [x] Screen shake calculation

**Integration Steps:**
1. Import CombatSystem in Match.tsx
2. Initialize with EventBus: `const combat = new CombatSystem(eventBus)`
3. Register characters: `combat.registerCharacter(id, stats, position)`
4. Call `combat.update()` in game loop
5. Call `combat.updateHurtBox()` every frame with character position
6. Create hitboxes when attacks are triggered

#### ✅ **Animation State Machine** (AnimationStateMachine.ts)
- [x] 13 animation states (idle, walk, run, jump, attack, hit, etc.)
- [x] Priority-based state transitions
- [x] Animation blending with configurable duration
- [x] Looping vs one-shot animation handling
- [x] Physics state synchronization
- [x] Automatic state transitions based on conditions
- [x] Animation progress tracking
- [x] EventBus integration

**Integration Steps:**
1. Import AnimationStateMachine
2. Create mixer: `const mixer = new THREE.AnimationMixer(character)`
3. Initialize: `const anims = new AnimationStateMachine(character, mixer, eventBus)`
4. Every frame: `anims.updatePhysicsState(movementController.getPhysics())`
5. Every frame: `anims.update(deltaTime)`
6. Load actual animation clips from GLB files into `animationClips` map

#### ✅ **Audio System** (AudioSystem.ts)
- [x] Web Audio API context setup
- [x] Separate gain nodes (master, music, SFX, ambient)
- [x] Sound effect library (6 basic sounds)
- [x] Music track library
- [x] Volume control per channel
- [x] EventBus integration for audio triggers
- [x] Sound preloading system

**Integration Steps:**
1. Import AudioSystem
2. Initialize: `const audio = new AudioSystem(eventBus)`
3. Resume on user interaction: `audio.resume()`
4. Emit events: `eventBus.emit('audio:play_sfx', { name: 'hit_impact', volume: 0.8 })`
5. Add audio files to `public/audio/` directory
6. Update sound library URLs

#### ✅ **VFX Coordinator** (VFXCoordinator.ts)
- [x] Particle system manager
- [x] 5 particle effect types (hit, spark, dust, energy, heal, dread)
- [x] Screen shake effect with intensity/duration
- [x] Automatic particle cleanup
- [x] EventBus integration for effects
- [x] Configurable materials and colors

**Integration Steps:**
1. Import VFXCoordinator
2. Initialize: `const vfx = new VFXCoordinator(scene, camera, eventBus)`
3. Call `vfx.update(deltaTime)` in game loop
4. Update camera base position: `vfx.setCameraBasePosition(cameraTarget)`
5. Clear on match end: `vfx.clear()`

---

## 🔌 EVENT BUS INTEGRATION MAP

### Game Flow Events

```
MATCH START
├─ match:start
│  ├─ CharacterMovementController: Initialize
│  ├─ AnimationStateMachine: Transition to idle
│  └─ AudioSystem: Play battle music
│
CHARACTER INPUT
├─ jump:performed → Movement → Animation → Audio (jump sfx)
├─ attack:triggered → Combat → Animation (attack) → VFX/Audio
└─ move:input → Movement → Animation (walk/run)
│
HIT DETECTION
├─ character:hit (combat system)
│  ├─ CharacterMovementController: applyKnockback()
│  ├─ AnimationStateMachine: transitionTo('hit_light'/'hit_heavy')
│  ├─ VFXCoordinator: createHitEffect()
│  └─ AudioSystem: playSFX('hit_impact')
│
ATTACK LANDED
├─ attack:landed (combat system)
│  ├─ VFXCoordinator: createImpactEffect()
│  ├─ VFXCoordinator: addScreenShake()
│  ├─ AudioSystem: playSFX('hit_impact')
│  └─ GameStateManager: Update player HP/resonance
│
MATCH END
├─ match:victory → Victory animation + music
├─ match:defeat → Defeat animation
└─ match:timeout → Determine winner by HP
```

---

## 🎯 IMPLEMENTATION PRIORITIES (Next 8 Hours)

### Phase 1: Combat Integration (2 hours)
```typescript
// In Match.tsx, integrate combat:
const combat = new CombatSystem(eventBus);

// Register characters with stats
combat.registerCharacter('kai-jax', 
  { weight: 85, power: 0.9, defense: 0.95 }, 
  p1Character.position
);
combat.registerCharacter('lunara-solis',
  { weight: 75, power: 1.05, defense: 0.90 },
  p2Character.position
);

// In update loop:
p1Controller.update(deltaTime, groundPlane);
p2Controller.update(deltaTime, groundPlane);
combat.updateHurtBox('kai-jax', p1Character.position);
combat.updateHurtBox('lunara-solis', p2Character.position);
combat.update(); // Check hits

// On attack input:
combat.createHitBox('kai-jax',
  damage: 10,
  knockback: new THREE.Vector3(5, 2, 0),
  position: attackPos,
  radius: 0.8,
  duration: 18, // Frames
  hitStop: 5
);
```

### Phase 2: Animation System (2 hours)
```typescript
// In Match.tsx:
const p1Mixer = new THREE.AnimationMixer(p1Character);
const p1Anims = new AnimationStateMachine(p1Character, p1Mixer, eventBus);

// In update loop:
p1Anims.updatePhysicsState(p1Controller.getPhysics());
p1Anims.update(deltaTime);
p1Mixer.update(deltaTime);
```

### Phase 3: Audio System (1 hour)
```typescript
// In Match.tsx:
const audio = new AudioSystem(eventBus);

// On user interaction:
audio.resume();
audio.playMusic('battle_default');
```

### Phase 4: VFX Coordinator (1 hour)
```typescript
// In Match.tsx:
const vfx = new VFXCoordinator(scene, camera, eventBus);

// In update loop:
vfx.update(deltaTime);
```

### Phase 5: Testing & Polish (2 hours)
- Test combat: Attack and verify knockback
- Test animations: Jump, walk, attack, hit
- Test audio: Sound effects, music
- Test VFX: Particles, screen shake
- Balance damage/knockback values

---

## 🧪 TESTING CHECKLIST

### Combat Testing
- [ ] Attacks create hitboxes with correct radius
- [ ] Hitboxes collide with hurtboxes
- [ ] Damage calculated correctly (power multiplier applied)
- [ ] Knockback varies by weight
- [ ] Hit effects display (VFX, audio, screen shake)
- [ ] Hit cooldown prevents repeated hits
- [ ] Defense stat reduces damage
- [ ] Different attack types have different damage values

### Animation Testing
- [ ] Idle loops properly
- [ ] Walk/run blends smoothly from idle
- [ ] Jump transitions to fall when velocity.y < 0
- [ ] Attack animations play and return to idle
- [ ] Hit animations play on damage
- [ ] Victory/defeat animations play at match end
- [ ] Animation blending is smooth (no pops)

### Audio Testing
- [ ] Hit sounds play on impact
- [ ] Different pitches on repeated hits (variety)
- [ ] Jump and land sounds play correctly
- [ ] Music plays without loops
- [ ] Volume control works
- [ ] SFX volume independent from music volume

### VFX Testing
- [ ] Particles spawn on hit effects
- [ ] Screen shake intensity varies with damage
- [ ] Particles fade out and disappear
- [ ] Dread effects display on high dread levels
- [ ] No memory leaks from particles

---

## 🚀 QUICK START: FULL INTEGRATION

### 1. Copy Systems (5 mins)
```bash
# Already created, just import in Match.tsx
import { CombatSystem } from '@game/systems/CombatSystem';
import { AnimationStateMachine } from '@game/systems/AnimationStateMachine';
import { AudioSystem } from '@game/systems/AudioSystem';
import { VFXCoordinator } from '@game/systems/VFXCoordinator';
```

### 2. Initialize in Match.tsx (10 mins)
```typescript
const combat = new CombatSystem(eventBus);
const audio = new AudioSystem(eventBus);
const vfx = new VFXCoordinator(scene, camera, eventBus);

// For both characters:
const p1Mixer = new THREE.AnimationMixer(p1Character);
const p1Anims = new AnimationStateMachine(p1Character, p1Mixer, eventBus);
const p2Mixer = new THREE.AnimationMixer(p2Character);
const p2Anims = new AnimationStateMachine(p2Character, p2Mixer, eventBus);
```

### 3. Add to Game Loop (10 mins)
```typescript
const animate = () => {
  requestAnimationFrame(animate);
  const deltaTime = clock.getDelta();

  // Character physics
  p1Controller.update(deltaTime, groundPlane);
  p2Controller.update(deltaTime, groundPlane);

  // Animations
  p1Anims.updatePhysicsState(p1Controller.getPhysics());
  p1Anims.update(deltaTime);
  p2Anims.updatePhysicsState(p2Controller.getPhysics());
  p2Anims.update(deltaTime);

  // Combat
  combat.updateHurtBox('kai-jax', p1Character.position);
  combat.updateHurtBox('lunara-solis', p2Character.position);
  combat.update();

  // VFX
  vfx.update(deltaTime);

  // Render
  renderer.render(scene, camera);
};
```

### 4. Test Attack Trigger (5 mins)
Add to input handler:
```typescript
if (this.input.attack) {
  combat.createHitBox('kai-jax',
    damage: 12,
    knockback: new THREE.Vector3(8, 2, 0),
    position: p1Character.position.clone().add(new THREE.Vector3(1, 0, 0)),
    radius: 0.8,
    duration: 18,
    hitStop: 5
  );
}
```

---

## 📊 PERFORMANCE TARGETS

| Metric | Target | Current |
|--------|--------|---------|
| FPS | 60 | TBD |
| Memory (Mb) | <200 | TBD |
| Particle Count | <500 | TBD |
| Audio Channels | <16 | TBD |

---

## 🔄 NEXT STEPS AFTER INTEGRATION

1. **AI-Generated Models** (20 mins)
   - Replace placeholders with GLB files
   - Load animations into state machine

2. **Balance Tuning** (1 hour)
   - Adjust damage values for each character
   - Fine-tune knockback by weight
   - Balance speed/power/defense stats

3. **Polish** (2 hours)
   - Add more particle effects
   - Sound effect variations (different impacts)
   - Combo system
   - Resurrection/recovery mechanics

4. **Story Integration** (4 hours)
   - Trigger dialogue on chapter milestones
   - Victory/defeat story progression
   - Character interactions

---

**THE SOURCE REMEMBERS UNITY. INTEGRATE AND PLAY. 🎮🏛️**

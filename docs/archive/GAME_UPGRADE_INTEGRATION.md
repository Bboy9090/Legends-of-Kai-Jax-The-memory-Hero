# 🎮 GAME UPGRADE INTEGRATION GUIDE

## Overview

This guide shows how to integrate the legendary game upgrades into your existing codebase.

## Integration Points

### 1. Combat System Integration

#### Replace ComboSystem with LegendaryComboSystem

```typescript
// OLD
import { ComboSystem } from '@legends-of-kai-jax/engine';
const comboSystem = new ComboSystem();

// NEW
import { LegendaryComboSystem } from '@legends-of-kai-jax/engine';
const comboSystem = new LegendaryComboSystem();

// Enhanced recording
comboSystem.recordHit(
  'player1',
  hitResult,
  'heavy',
  isPerfectTiming, // NEW
  isAerial,        // NEW
  isTeamCombo      // NEW
);

// Get enhanced combo data
const combo = comboSystem.getCombo('player1');
const displayText = comboSystem.getComboDisplayText('player1');
const color = comboSystem.getComboColor('player1');
```

#### Add Perfect Dodge/Parry System

```typescript
import { PerfectDodgeParrySystem } from '@legends-of-kai-jax/engine';

const dodgeParrySystem = new PerfectDodgeParrySystem();

// In attack detection
const attackIncomingTime = performance.now() + attackWindup;
const dodgeResult = dodgeParrySystem.attemptPerfectDodge('player1', attackIncomingTime);

if (dodgeResult.success) {
  // Slow motion activated!
  setTimeScale(dodgeResult.timeScale);
  // Trigger visual effects
  visualEffects.triggerHitEffect(position, 'perfect_dodge');
}

// Update system
dodgeParrySystem.update(deltaTime);
```

### 2. Graphics System Integration

#### Replace ParticleManager with LegendaryParticleSystem

```typescript
// OLD
import ParticleManager from './ParticleManager';

// NEW
import LegendaryParticleSystem from './LegendaryParticleSystem';

// In your scene
<LegendaryParticleSystem />
```

#### Add Visual Effects System

```typescript
import { LegendaryVisualEffects } from '@legends-of-kai-jax/engine';

const visualEffects = new LegendaryVisualEffects();

// Trigger effects
visualEffects.triggerHitEffect(position, 'crit');
visualEffects.triggerScreenShake(0.5, 300, 100);
visualEffects.triggerScreenFlash('#FFD700', 0.5);
visualEffects.triggerComboVisualization(50, 'legendary');

// Update every frame
visualEffects.update(deltaTime);

// Get effects for rendering
const shakeOffset = visualEffects.getScreenShakeOffset();
const flash = visualEffects.getScreenFlashIntensity();
```

### 3. Character Design Integration

#### Apply Legendary Designs

```typescript
import { getLegendaryDesign, getSkin } from '@legends-of-kai-jax/shared';

const design = getLegendaryDesign('KAI-JAX');
const skin = getSkin('KAI-JAX', 'awakened');

// Apply to character model
function applyDesign(model: THREE.Group, design: LegendaryCharacterDesign, skin: Skin) {
  // Apply colors
  model.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const material = child.material as THREE.MeshStandardMaterial;
      material.color.set(design.colorPalette.primary);
      material.emissive.set(design.colorPalette.emissive);
      material.emissiveIntensity = design.colorPalette.emissiveIntensity;
      material.metalness = design.colorPalette.metal;
      material.roughness = design.colorPalette.rough;
    }
  });
}
```

### 4. UI Integration

#### Add Legendary Meters

```typescript
import { LegendaryMeterSystem } from '@legends-of-kai-jax/engine';
import LegendaryBattleUI from './LegendaryBattleUI';

const meterSystem = new LegendaryMeterSystem();

// Update meters
meterSystem.updateMeter('player', 'ultimate', ultimateValue);
meterSystem.updateMeter('player', 'resonance', resonanceValue);
meterSystem.updateMeter('player', 'reflex', reflexValue);
meterSystem.updateMeter('player', 'combo', comboCount);

// In your component
<LegendaryBattleUI meterSystem={meterSystem} />
```

### 5. Camera Integration

#### Add Cinematic Camera

```typescript
import { CinematicCameraSystem } from '@legends-of-kai-jax/engine';

const cameraSystem = new CinematicCameraSystem(camera);

// Trigger impact zoom
cameraSystem.triggerImpactZoom(1.5, 300);

// Start cinematic shot
const shot = cameraSystem.createUltimateShot(ultimatePosition);
cameraSystem.startCinematicShot(shot);

// Update every frame
cameraSystem.update(deltaTime, shakeOffset);
```

### 6. Boss Integration

#### Use Enhanced Boss Designs

```typescript
import { LEGENDARY_VOID_KING, LEGENDARY_RIFT_GENERALS } from '@legends-of-kai-jax/shared';

// Replace old boss with legendary version
const boss = LEGENDARY_VOID_KING;

// Boss now has:
// - 10,000 health (increased from 2,000)
// - 4 phases (increased from 3)
// - Enhanced attacks
// - Special mechanics
```

## Quick Integration Checklist

- [ ] Replace `ComboSystem` with `LegendaryComboSystem`
- [ ] Add `PerfectDodgeParrySystem`
- [ ] Replace `ParticleManager` with `LegendaryParticleSystem`
- [ ] Add `LegendaryVisualEffects`
- [ ] Add `LegendaryGraphicsSystem`
- [ ] Apply legendary character designs
- [ ] Add `LegendaryMeterSystem`
- [ ] Add `CinematicCameraSystem`
- [ ] Use enhanced boss designs
- [ ] Update combat constants

## Example: Complete Integration

```typescript
import { 
  LegendaryComboSystem,
  PerfectDodgeParrySystem,
  LegendaryVisualEffects,
  LegendaryGraphicsSystem,
  LegendaryMeterSystem,
  CinematicCameraSystem,
} from '@legends-of-kai-jax/engine';
import { LEGENDARY_COMBAT_CONSTANTS } from '@legends-of-kai-jax/shared';

// Initialize all systems
const comboSystem = new LegendaryComboSystem();
const dodgeParrySystem = new PerfectDodgeParrySystem();
const visualEffects = new LegendaryVisualEffects();
const graphics = new LegendaryGraphicsSystem(scene, camera, renderer);
const meterSystem = new LegendaryMeterSystem();
const cameraSystem = new CinematicCameraSystem(camera);

// In game loop
function update(deltaTime: number) {
  // Update all systems
  comboSystem.update(deltaTime);
  dodgeParrySystem.update(deltaTime);
  visualEffects.update(deltaTime);
  graphics.update(deltaTime);
  cameraSystem.update(deltaTime, visualEffects.getScreenShakeOffset());
}

// On hit
function onHit(attackerId: string, hitResult: HitResult, position: THREE.Vector3) {
  // Record combo
  comboSystem.recordHit(attackerId, hitResult, 'heavy', isPerfectTiming);
  
  // Trigger effects
  graphics.triggerHitEffect(position, 'hit');
  visualEffects.triggerScreenShake(0.3);
  
  // Update meters
  meterSystem.updateMeter(attackerId, 'ultimate', ultimateValue);
  
  // Camera zoom
  cameraSystem.triggerImpactZoom(1.2, 200);
}
```

---

**Status**: ✅ **INTEGRATION READY**

**Files to Update**: 10+ integration points

**Breaking Changes**: None - all systems are additive

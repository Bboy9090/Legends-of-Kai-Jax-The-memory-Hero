# Enhanced Animation & Graphics System

This document describes the enhanced 3D character animation and graphics systems added to Smash Heroes.

## Overview

The enhanced system provides realistic, physics-based character animations with improved visual quality through better lighting, shadows, and effects.

## Animation System Components

### 1. Animation Easing (`AnimationEasing.ts`)

Provides smooth interpolation functions for natural movement:

**Available Easing Functions:**
- `linear` - No easing
- `easeInQuad`, `easeOutQuad`, `easeInOutQuad` - Quadratic easing
- `easeInCubic`, `easeOutCubic`, `easeInOutCubic` - Cubic easing
- `easeOutElastic` - Bouncy, springy effect
- `easeOutBack`, `easeInBack` - Anticipation and overshoot
- `easeOutBounce` - Bouncing effect
- `smoothStep`, `smootherStep` - Smooth acceleration/deceleration

**Spring Physics:**
```typescript
const spring = new Spring(initialValue, stiffness, damping);
spring.setTarget(targetValue);
const currentValue = spring.update(deltaTime);
```

### 2. Enhanced Animation Controller (`EnhancedAnimationController.ts`)

State-based animation system with smooth blending:

```typescript
const controller = new EnhancedAnimationController();

// Register animation states
controller.registerState({
  name: 'idle',
  duration: 2.0,
  loop: true,
  poses: [
    {
      time: 0,
      transforms: {
        'head': { rotation: { x: 0, y: 0, z: 0 } },
        'leftArm': { rotation: { x: 0, y: 0, z: 0.1 } }
      }
    },
    {
      time: 1.0,
      transforms: {
        'head': { rotation: { x: 0.1, y: 0, z: 0 } },
        'leftArm': { rotation: { x: 0, y: 0, z: -0.1 } }
      },
      easing: easeInOutCubic
    }
  ]
});

// Play animation with blending
controller.play('idle', 0.2); // 0.2 second blend time

// Update in game loop
controller.update(deltaTime);

// Get current transforms
const transforms = controller.getCurrentTransforms(['head', 'leftArm']);
```

### 3. Procedural Animation (`ProceduralAnimation.ts`)

Physics-based procedural animations for realistic movement:

#### Breathing Animation
```typescript
const breathing = new BreathingAnimation(15, 1.0); // 15 breaths/min, depth 1.0
const { chestExpansion, shoulderRise, headTilt } = breathing.update(deltaTime);
```

#### Head Look-At
```typescript
const headLookAt = new HeadLookAt(100, 20); // stiffness, damping
headLookAt.setTarget(yaw, pitch);
const { yaw, pitch, roll } = headLookAt.update(deltaTime);
```

#### Inverse Kinematics (IK)
```typescript
const armIK = new TwoJointIK(0.4, 0.35); // upper length, lower length
const { upper, lower } = armIK.solve(targetX, targetY, 1);
// Apply angles to shoulder and elbow
```

#### Weight Shift
```typescript
const weightShift = new WeightShift();
weightShift.setDirection(1); // -1 left, 0 center, 1 right
const { hipOffset, shoulderOffset, headOffset } = weightShift.update(deltaTime);
```

#### Attack Animation Phases
```typescript
const attackPhase = new AttackAnimationPhase(0.12, 0.18, 0.12, 0.18);
const { phase, progress, intensity } = attackPhase.update(deltaTime);
// phase: 'anticipation' | 'action' | 'follow-through' | 'recovery'
```

#### Foot Placement
```typescript
const footPlacement = new FootPlacement();
const { leftFoot, rightFoot, bodyBob } = footPlacement.update(deltaTime, speed);
```

#### Secondary Motion
```typescript
const secondary = new SecondaryMotion(3, 90, 18); // 3 chains, stiffness, damping
secondary.applyForce(velocityX * 2);
const chainValues = secondary.update(deltaTime);
```

## Graphics Enhancement Components

### 1. Rim Lighting (`EnhancedGraphics.tsx`)

Provides professional-quality lighting setup:

```tsx
<RimLight intensity={1.0} color="#ffffff" />
```

Creates:
- Key light from front-top with shadow casting
- Rim light from back-top for edge definition
- Hemisphere light for ambient fill
- Point light for dynamic highlights

### 2. Dynamic Shadows

Shadows that follow character and fade with distance:

```tsx
<DynamicShadow characterY={playerY} groundY={0} maxDistance={5} />
```

### 3. Energy Aura

Pulsating energy effect for power-ups and special states:

```tsx
<EnergyAura scale={1.2} color="#00E5FF" intensity={emotionIntensity} />
```

### 4. Glow Outline

Glowing outline effect for emphasis:

```tsx
<GlowOutline scale={1.05} color="#FFD700" intensity={0.8} />
```

### 5. Motion Blur Trail

Trail effect for fast movement:

```tsx
<MotionBlurTrail position={[x, y, z]} color="#00E5FF" intensity={speed} />
```

### 6. Impact Particles

Particle burst effect for hits:

```tsx
<ImpactParticles position={[x, y, z]} color="#FFD700" active={isHit} />
```

## Integration Guide

### Character Model Enhancement

1. **Import Enhanced Graphics:**
```tsx
import { EnergyAura, GlowOutline, DynamicShadow } from "../EnhancedGraphics";
```

2. **Add Dynamic Shadow:**
```tsx
<group ref={bodyRef} position={[0, 0.4, 0]}>
  <DynamicShadow characterY={0.4} groundY={-0.4} maxDistance={3} />
  {/* Rest of character model */}
</group>
```

3. **Add Enhanced Effects:**
```tsx
{/* At end of character model, before closing group */}
<EnergyAura scale={1.2} color={accentColor} intensity={emotionIntensity} />
{(isAttacking || emotionIntensity > 0.5) && (
  <GlowOutline 
    scale={1.1}
    color={isAttacking ? accentColor : primaryColor}
    intensity={isAttacking ? 1.0 : emotionIntensity}
  />
)}
```

4. **Add receiveShadow to All Meshes:**
```tsx
<mesh castShadow receiveShadow>
  {/* geometry and material */}
</mesh>
```

### Scene Setup

Add enhanced lighting to your scene:

```tsx
import { RimLight } from "./EnhancedGraphics";

function BattleScene() {
  return (
    <>
      <RimLight intensity={1.0} />
      {/* Rest of scene */}
    </>
  );
}
```

## Animation Principles

The enhanced system implements the 12 principles of animation:

1. **Squash and Stretch** - Impact deformation
2. **Anticipation** - Wind-up before attacks
3. **Staging** - Clear, readable poses
4. **Straight Ahead and Pose to Pose** - Keyframe interpolation
5. **Follow Through and Overlapping Action** - Secondary motion
6. **Slow In and Slow Out** - Easing functions
7. **Arc** - Natural curved motion paths
8. **Secondary Action** - Breathing, weight shifts
9. **Timing** - Variable animation speeds
10. **Exaggeration** - Emphasized key poses
11. **Solid Drawing** - Consistent 3D forms
12. **Appeal** - Visually pleasing movements

## Performance Considerations

- **Spring Physics**: O(1) per spring, very efficient
- **IK Calculations**: O(1), uses law of cosines
- **Shadow Rendering**: Dynamic shadows are optimized with distance fading
- **Particle Systems**: Limited particle count (20 per effect)
- **Mesh Optimization**: Use receiveShadow only on visible meshes

## Best Practices

1. **Use appropriate easing** - Fast attacks use `easeOutCubic`, landings use `easeOutBounce`
2. **Layer animations** - Combine procedural (breathing) with keyframed (attacks)
3. **Tune spring values** - Higher stiffness = faster response, higher damping = less oscillation
4. **Limit glow effects** - Only show when needed to maintain visual clarity
5. **Test performance** - Profile on target devices to ensure 60fps

## Future Enhancements

Planned improvements:
- [ ] 3-joint IK for spine
- [ ] Ragdoll physics for knockouts
- [ ] Facial animation system
- [ ] Cloth simulation for capes
- [ ] Particle texture atlas
- [ ] Animation compression
- [ ] Skeletal mesh support

## Examples

See implemented examples in:
- `KaisonModel.tsx` - Complete character with all enhancements
- `JaxonModel.tsx` - Alternative character style
- `BattlePlayer.tsx` - Animation integration
- `BattleScene.tsx` - Scene lighting setup

## Troubleshooting

**Problem**: Character looks too dark
- Solution: Ensure all meshes have `receiveShadow` prop
- Check that `<RimLight>` is in the scene

**Problem**: Animations are jerky
- Solution: Increase spring damping values
- Use smoother easing functions like `smootherStep`

**Problem**: Shadows look wrong
- Solution: Adjust `DynamicShadow` parameters
- Ensure ground plane is at correct Y position

**Problem**: Performance issues
- Solution: Reduce particle counts
- Disable shadows on distant/small objects
- Use lower geometry resolution for secondary parts

# Blocker B: Animation Quality Audit

## Scope

Separate from rendering (fixed by Clone component), animation quality is a distinct concern.

Previous complaint: *"walks like he just got his nails done"* — indicates skeletal animation playback or blend issues distinct from visibility.

## Animation State Checklist

| Action | File | Status | Notes |
|--------|------|--------|-------|
| Idle breathing | OptimizedBeastModel.tsx | ⏳ PENDING | Subtle scale pulse, verify no jerking |
| Walk cycle | AdventureCharacter.tsx | ⏳ PENDING | Gait naturalness, arm swing, weight shift |
| Run cycle | AdventureCharacter.tsx | ⏳ PENDING | Speed and fluidity compared to walk |
| Light attack | OptimizedBeastModel.tsx | ⏳ PENDING | Punch: shoulder rotation, elbow bend, recovery |
| Heavy attack | OptimizedBeastModel.tsx | ⏳ PENDING | Full-body commitment, follow-through |
| Kick | OptimizedBeastModel.tsx | ⏳ PENDING | Hip rotation, leg extension, balance |
| Dodge/evade | OptimizedBeastModel.tsx | ⏳ PENDING | Sidestep or roll, reactive timing |
| Hit reaction | OptimizedBeastModel.tsx | ⏳ PENDING | Impact feedback, knockback distance |

## Known Issues to Audit

1. **Arm positioning**: Check for outward arms/hands posture (esp. Kai-Jax)
2. **Walk pose**: Verify not unnaturally posed during movement
3. **Punch visibility**: Confirm punch actually executes visibly (not T-pose or static)
4. **Kick visibility**: Confirm kick motion visible and distinct from punch
5. **Blend timing**: Check animation transitions (idle→run, attack→idle) are smooth
6. **Model-specific quirks**: Each fighter may have different rig quality

## Test Method

**Training Mode** (easiest single-fighter observation):
```
1. Load training arena
2. Stand idle (observe breathing)
3. Move in all directions (observe walk/run blend)
4. Press J (punch), wait for recovery
5. Press K (kick), wait for recovery
6. Return to idle
```

**Versus Mode** (observe both fighters + compare):
```
1. Start versus battle
2. Player stands idle (observe animation playback)
3. Player attacks (punch/kick)
4. Opponent AI attacks (compare animation quality)
5. Player takes hit (observe reaction animation)
```

## Verification Evidence

Needed:
- [ ] Training: idle + walk + punch + kick sequence captured
- [ ] Versus: both fighters animated during exchange
- [ ] No fatal animation errors (T-pose, stuck, or freeze)
- [ ] Subjective quality assessment (natural vs awkward)

## Classification Outcomes

**PASS**: All animations play, no obvious joint breaks, movements recognizable  
**PARTIAL**: Some animations work, others stuck or wrong speed  
**FAIL**: Animations not playing, models appear frozen or T-posed

## Do Not Conflate

- **Rendering** = Model visible on screen (✅ FIXED by Clone component)
- **Animation** = Model moves naturally during gameplay (⏳ THIS AUDIT)

A visible model with broken animation is still production-blocking.

## Next Step

After this audit is complete, classify each action as PASS/FAIL.
Document any animation rework needed before release sign-off.

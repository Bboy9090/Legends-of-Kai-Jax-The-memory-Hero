# Kai-Jax: 9-Tail Combat System Quick Reference

## Character Overview

**Name**: Kai-Jax  
**Title**: The Memory Hero  
**Species**: Wolf/Fox/Hedgehog/Spider Hybrid  
**Role**: Stance-Shifting Battlefield Controller  

## The 9 Tails

### 1. Bond Tail 🛡️
**Function**: Parry/Counter/Revive  
**Moves**:
- Neutral Special: Bond Parry
- Jab: Memory Strike

**Use Case**: Defensive play, countering attacks  
**Synergy**: Combine with defensive stance for maximum effect

---

### 2. Hunter Tail 🏹
**Function**: Dash/Pursuit/Execute  
**Moves**:
- Up Special: Hunter Dash (Recovery)
- Down Tilt: Hunter Sweep

**Use Case**: Chase down fleeing enemies, execute low-health targets  
**Synergy**: Works well after breaking enemy posture

---

### 3. Thread Tail 🕸️
**Function**: Web/Pull/Group  
**Moves**:
- Side Special: Thread Web
- Forward Tilt: Thread Lash
- Forward Air: Thread Arc

**Use Case**: Crowd control, pulling multiple enemies together  
**Synergy**: Essential for 1v20+ scaling, zone control

---

### 4. Quill Tail 🦔
**Function**: Retaliation/Posture Damage  
**Moves**:
- Forward Smash: Quill Barrage
- Passive: Quill Retaliation (auto-activates when hit)

**Use Case**: Punish aggressive attackers, break enemy posture  
**Synergy**: Combine with defensive stance for passive damage

---

### 5. Shade Tail 👻
**Function**: Stealth/Threat Reset  
**Moves**:
- Down Special: Shade Cloak

**Use Case**: Escape pressure, reset enemy aggro  
**Warning**: Costs corruption (10 points)

---

### 6. Anchor Tail ⚓
**Function**: Anti-Knockback/Root  
**Moves**:
- Down Smash: Anchor Quake
- Back Air: Anchor Kick
- Ability: Anchor Root (prevents knockback)

**Use Case**: Hold position, resist knockback  
**Synergy**: Essential for dominant stance zone control

---

### 7. Echo Tail 👥
**Function**: After-Image/Repeat  
**Moves**:
- Jab 2: Echo Strike
- Neutral Air: Echo Spiral
- Ability: Echo After-Image (repeats last attack)

**Use Case**: Extend combos, apply pressure  
**Warning**: Costs corruption (15 points)

---

### 8. Rift Tail 🌌
**Function**: Reality Tear/AOE  
**Moves**:
- Up Smash: Rift Pillar
- Down Air: Rift Meteor
- Ability: Reality Rift (large AOE zone)

**Use Case**: Control large areas, zone denial  
**Warning**: Costs corruption (25 points)  
**Best For**: 1v20+ scenarios

---

### 9. Crown Tail 👑
**Function**: Aura/Command  
**Moves**:
- Jab 3: Archive Seal
- Up Tilt: Crown Ascent
- Up Air: Crown Ascent
- Ability: Crown Command (buff/debuff aura)

**Use Case**: Support allies, debuff enemies, posture break  
**Warning**: Costs corruption (20 points)  
**Range**: 6.0 meter aura radius

---

## Combat Stats

| Stat | Value | Description |
|------|-------|-------------|
| Weight | 95 | Medium-heavy (good knockback resistance) |
| Walk Speed | 1.15 | Moderate walk |
| Run Speed | 1.75 | Decent run |
| Air Speed | 1.05 | Average air control |
| Jump Height | 13.5 | Standard jump |
| Fall Speed | 1.65 | Moderate fall |
| Posture Health | 100 | Breaks at 0 |
| Corruption | 0-100 | Weakness at 80+ |
| Zone Control | 5.0-8.0m | Expands with abilities |

## Stance System

### 🟢 Neutral Stance
- **Trigger**: Default state, balanced posture
- **Benefits**: Balanced offense/defense
- **Zone**: 5.0m base

### 🔴 Aggressive Stance
- **Trigger**: Damage taken > 100%
- **Benefits**: Increased crowd control effectiveness
- **Zone**: 6.0m
- **Risk**: More vulnerable to overextension

### 🔵 Defensive Stance
- **Trigger**: Posture health < 30%
- **Benefits**: Increased posture regeneration
- **Zone**: 4.0m
- **Focus**: Survival and recovery

### 🟣 Dominant Stance
- **Trigger**: Crowd control active
- **Benefits**: Maximum zone control
- **Zone**: 8.0m
- **Best For**: 1v10+ scenarios

## Combo Examples

### Basic Combo (1v1)
```
Jab → Jab 2 (Echo) → Forward Tilt (Thread) → Forward Air (Thread)
```

### Crowd Control (1v5+)
```
Side Special (Thread Web) → Down Smash (Anchor Quake) → Up Smash (Rift Pillar)
```

### Posture Break
```
Forward Smash (Quill) → Wait for posture break → Jab 3 (Crown Seal)
```

### High Corruption Finisher
```
Ability: Crown Command → Ability: Reality Rift → Ability: Echo Image
(Total corruption cost: 60 points)
```

## Strengths & Weaknesses

### ✅ Strengths
- **Crowd Control**: Scales from 1v1 to 1v20+
- **Posture Break**: Creates vulnerability windows
- **Zone Dominance**: Controls large areas
- **Versatile**: 9 unique combat functions

### ❌ Weaknesses
- **Overextension**: Vulnerable when pushed too far
- **Corruption Overuse**: Ability spam reduces effectiveness
- **Stance Dependent**: Optimal play requires stance awareness

## Tips & Tricks

### For 1v1 Scenarios
1. Focus on Bond (parry) and Hunter (pursuit) tails
2. Use posture break combos
3. Save corruption for finishing moves

### For 1v10+ Scenarios
1. Lead with Thread (web) for grouping
2. Use Anchor (root) to hold position
3. Activate Crown (aura) for team buffs
4. Finish with Rift (AOE) for mass damage

### Corruption Management
- Monitor corruption level constantly
- Stay below 80% to avoid weakness
- High corruption = reduced damage output
- Shade Cloak costs only 10 corruption (cheapest)

### Posture Management
- Regenerates during idle (5 per second)
- Quill Retaliation deals automatic posture damage
- Bond Parry protects posture
- Defensive stance increases regen rate

## Mobile Considerations

### Performance Optimizations
- Fur shell layers may be reduced
- Secondary emissive effects disabled
- Weave energy effects disabled

### NEVER Reduced
- ✅ All 9 tails must be visible
- ✅ Silhouette must be preserved
- ✅ Animation timing unchanged
- ✅ Posture system fully functional
- ✅ Hit stop intact

## Frame Data Quick Reference

| Move Type | Min Startup | Min Active | Min Recovery | Total |
|-----------|-------------|------------|--------------|-------|
| Jab | 5-6 | 3 | 12 | 20+ |
| Tilt | 6-9 | 4-6 | 14-18 | 24+ |
| Smash | 12-16 | 4-6 | 28-32 | 44+ |
| Aerial | 6-14 | 3-12 | 14-22 | 23+ |
| Special | 8-20 | 1-60 | 18-40 | 27+ |

**Cancel Rules**: Hit confirm or perfect parry only  
**Minimum Total**: 12 frames per action (enforced)

## Critical Reminders

⚠️ **This character MUST feel dangerous even at idle**  
⚠️ **Mass and inertia are NOT optional**  
⚠️ **The 9 tails are the core identity - never compromise**  
⚠️ **Scales from 1v1 to 1v20+ WITHOUT changing rules**  

---

## See Also

- [Full Implementation Docs](./KAI_JAX_IMPLEMENTATION.md)
- [Character JSON Spec](../kai_jax.character.json)
- [Combat System Docs](../packages/shared/docs/combat.md)

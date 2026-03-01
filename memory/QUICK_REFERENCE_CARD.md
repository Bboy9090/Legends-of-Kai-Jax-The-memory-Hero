# LEGENDS OF KAI-JAX: QUICK REFERENCE CARD
## Combat System At-A-Glance

---

## FRAME DATA QUICK REFERENCE

### Basic Attacks

| Move | Startup | Active | Recovery | Total | On Hit | On Block |
|------|---------|--------|----------|-------|--------|----------|
| Light | 4f | 3f | 8f | 15f | +4 | -2 |
| Heavy | 10f | 5f | 18f | 33f | +8 | -6 |
| Dash Attack | 6f | 8f | 14f | 28f | +2 | -8 |

### Tail Abilities

| Tail | Move | Startup | Active | Recovery | Special |
|------|------|---------|--------|----------|----------|
| Ember | Flare Lash | 8f | 6f | 20f | Burns |
| Gale | Ridge Step | 2f | 12f | 8f | Invincible |
| Shade | Ghost Reversal | 1f | 15f | 25f | Counter |
| Volt | Snap Bind | 5f | 4f | 15f | Stuns |
| Stone | Quake Hook | 15f | 8f | 25f | Guard Break |
| Tide | Undertow | 10f | 20f | 15f | Heals |
| Thorn | Briar Net | 20f | 180f | 20f | Trap |
| Prism | Mirror Cut | 3f | 8f | 30f | Reflects |
| Void | Denial | 30f | 1f | 60f | Cancels |

---

## STATE TRANSITIONS

```
IDLE ─┬─► WALK ──► RUN ──► DASH
      ├─► JUMP ──► FALL
      ├─► BLOCK
      └─► ATTACK ─┬─► HIT CONFIRM ──► CANCEL
                  └─► WHIFF ──► RECOVERY

HIT ──► HITSTUN ──► IDLE
        │
        └─► KNOCKDOWN ──► WAKEUP ──► IDLE
```

---

## INPUT MAPPING

### Keyboard
| Action | Key |
|--------|-----|
| Move | A/D |
| Jump | Space |
| Light Attack | J |
| Heavy Attack | K |
| Tail Ability | L |
| Block | S |
| Dash | E |
| Tail Switch | Q/R |

### Controller
| Action | Button |
|--------|--------|
| Move | Left Stick |
| Jump | A |
| Light Attack | X |
| Heavy Attack | Y |
| Tail Ability | B |
| Block | LT |
| Dash | RB |
| Tail Switch | LB/D-Pad |

---

## ENEMY AI STATES

```
OBSERVE ──► APPROACH ──► PRESSURE ──► COMMIT
    ▲           │            │          │
    │           │            │          │
    └───────────┴──── RECOVER ◄────────┘
                         │
                         ▼
                      ADAPT
```

**Adaptation Rate:** 0.1 resistance per hit taken
**Max Resistance:** 50% per move type
**Decay Rate:** -0.1 per 300 frames unused

---

## PLATFORM TIERS

| Tier | Platform | Target | Fur | Shadows |
|------|----------|--------|-----|----------|
| 1 | PC High/PS5/XSX | 4K60 | Strands | Ultra |
| 2 | PC Mid/XSS | 1440p60 | Shell 24 | High |
| 3 | PC Low/Tablet | 1080p60 | Shell 16 | Medium |
| 4 | Mobile High/Switch | 720p60 | Shell 8 | Blob |
| 5 | Mobile Mid | 720p30 | Solid | None |

---

## TAIL ELEMENT COLORS

| Tail | Primary | Secondary | Hex |
|------|---------|-----------|-----|
| Ember | Orange | Red | #FF3B30 |
| Gale | Cyan | White | #64D2FF |
| Shade | Purple | Black | #BF5AF2 |
| Volt | Yellow | White | #FFD60A |
| Stone | Gray | Brown | #8B8B8B |
| Tide | Blue | Teal | #007AFF |
| Thorn | Green | Brown | #30D158 |
| Prism | White | Rainbow | #FFFFFF |
| Void | Black | Blue | #2E2EFE |

---

## PERFORMANCE TARGETS

| Metric | Budget |
|--------|--------|
| Frame Time | 16.67ms (60fps) |
| Input Latency | <16ms |
| Draw Calls (PC) | <2000 |
| Draw Calls (Mobile) | <200 |
| Triangles (PC) | <100,000 |
| Triangles (Mobile) | <50,000 |

---

## HITBOX/HURTBOX RULES

1. Hitboxes only active during Active Frames
2. Each hitbox hits each target once per activation
3. No self-collision
4. Hurtboxes invincible during Dash (8f) and Recovery
5. Counter moves reverse hitbox ownership

---

## CANCEL RULES

| From | Can Cancel Into | Window |
|------|-----------------|--------|
| Light | Light, Heavy, Special | On Hit |
| Heavy | Special | On Hit |
| Special | None | - |
| Dash | Attack (end frames) | Last 4f |

---

*For full documentation, see ENGINE_DESIGN_SPECIFICATION.md*

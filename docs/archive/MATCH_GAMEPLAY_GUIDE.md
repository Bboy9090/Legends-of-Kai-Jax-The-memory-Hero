# MATCH GAMEPLAY QUICK START

## Controls

| Key | Action |
|-----|--------|
| **A** / **←** | Move Left |
| **D** / **→** | Move Right |
| **J** | Attack |
| **D** | Toggle Debug Mode |
| **ESC** | Exit to Menu |

## Game Rules

- **Duration:** 3 minutes (180 seconds)
- **Starting HP:** 100 for both players
- **Attack Cooldown (P1):** 500ms between attacks
- **Attack Cooldown (P2 AI):** 1.5 seconds between attacks
- **Damage per Hit:** 10-12 HP
- **Win Condition:** Higher HP when time expires, or knock opponent to 0 HP
- **Match Victory:** First to 2 rounds wins (best of 3)

## Combat Mechanics

### Your Character (P1 - Player 1)
- Controlled with arrow keys or A/D
- Attack with J key (must wait for cooldown)
- Can move while attacking (no stun lock)
- Takes knockback on hit but has invincibility frames

### Opponent (P2 - AI)
- Autonomously attacks every 1.5-2 seconds
- Faces you at all times
- Knockback affects AI movement like you
- Gets invincibility frames after being hit

## On-Screen Information

**Top-Left:** P1 (You) HP and Resonance  
**Top-Right:** P2 (Opponent) HP and Resonance  
**Center-Top:** Match time remaining  
**Bottom-Left:** Control hints

## Debug Mode (Press D)

When enabled:
- **Performance Widget** appears showing:
  - Current FPS
  - Frame time per system
  - Physics, Animation, Combat, VFX timings
  - Average frame rate
- Useful for performance optimization

## How Combat Works

1. **Attack** - Press J to swing at opponent
2. **Hit Detection** - If hitbox connects, opponent takes damage
3. **Knockback** - Opponent pushed back on successful hit
4. **Audio Feedback** - Sound effect plays on impact
5. **Visual Feedback** - Screen shakes on solid hit
6. **HP Update** - HUD shows new HP values immediately

## Tips for Victory

- **Keep Moving** - Dodge incoming attacks
- **Time Your Attacks** - Attack when opponent is vulnerable
- **Watch the Timer** - Last 30 seconds are crucial
- **Build Resonance** - Higher resonance increases damage (future feature)
- **Use Knockback** - Push opponent away to create distance

## Common Issues

### No Sound?
- Click the game window (browser autoplay policy)
- Enable speakers/audio output

### Game Frozen?
- Press ESC to return to menu
- Refresh page if unresponsive

### Low FPS?
- Press D to check performance metrics
- Close other browser tabs
- Lower graphics settings (future feature)

## System Architecture

```
Input → Physics → Animation → Combat → Audio/VFX → UI
  ↓
Event Bus (Central Communication)
  ↓
Game State (HP, Time, Resonance)
```

All 7 systems are running:
- ✅ CombatSystem (hit detection)
- ✅ AnimationStateMachine (character movement)
- ✅ AudioSystem (sound effects)
- ✅ VFXCoordinator (visual effects)
- ✅ MatchStateManager (game state)
- ✅ PerformanceProfiler (metrics)
- ✅ EventBus (communication)

## File Locations

**Main Game Screen:** `apps/web/src/pages/Match.tsx`  
**Combat System:** `packages/game/src/systems/CombatSystem.ts`  
**Animation System:** `packages/game/src/systems/AnimationStateMachine.ts`  
**Audio System:** `packages/game/src/systems/AudioSystem.ts`  
**VFX System:** `packages/game/src/systems/VFXCoordinator.ts`  
**Match Manager:** `packages/game/src/managers/MatchStateManager.ts`  
**Performance Profiler:** `packages/game/src/debug/PerformanceProfiler.ts`  

## Integration Status

✅ **95% Complete** - Ready for testing!

- All 7 systems integrated
- Full combat loop working
- Physics and animations synced
- Audio and VFX connected
- UI updates on game events

**Next Phase:** Testing & Tuning
- Balance damage values
- Refine AI difficulty
- Optimize performance
- Polish combat feel

---

**GAME VERSION:** 95% Complete  
**LAST UPDATED:** January 2, 2025  
**STATUS:** Playable Combat System

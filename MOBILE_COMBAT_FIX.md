# Mobile RPG Open-World Combat Fix

## Problem
On mobile devices, when selecting a fight or mission, the game transitions into a 1v1 arcade-style fighting game mode instead of maintaining the intended RPG open-world combat adventure.

## Solution Implemented

### 1. Game State Flow Fixed
- **Story Mode** now properly shows mission selection UI before combat
- **Mission Selection** (`story-mode-select`) → **Team Selection** (`mission-team-select`) → **Open-World Combat** (`mission-gameplay`)
- **Versus/Quick Battle** still uses arcade 1v1 mode: **Character Select** → **Arcade Fighting** (`playing`)

### 2. Two Combat Modes

#### Arcade Mode (1v1) - `BattleScene.tsx`
- **When**: Versus mode, Quick Battle
- **Features**: 
  - Close-up camera (optimized for mobile)
  - Single opponent
  - Traditional fighting game style
  - Tight arena bounds

#### Open-World Mode (1vN) - `OpenWorldCombat.tsx` (NEW)
- **When**: Story missions, RPG adventure
- **Features**:
  - Wider camera view for exploration
  - Multiple enemies support
  - Lighter environment colors
  - Mission-based objectives (to be expanded)
  - RPG progression integration (to be expanded)

### 3. Mobile UI Improvements
- Mission selection is now fully responsive
- Text sizes adapt to screen width (mobile/tablet/desktop)
- Touch-friendly button sizes
- Proper spacing on small screens

### 4. Files Modified

```
apps/web/src/
├── App.tsx                                   # Routes game states to combat modes
├── lib/stores/useRunner.tsx                  # Added mission-gameplay state
├── components/game/
│   ├── CharacterSelect.tsx                   # Context-aware transitions
│   ├── UEEMissionSelect.tsx                  # Mobile responsive
│   ├── BattleScene.tsx                       # Arcade 1v1 (unchanged)
│   └── OpenWorldCombat.tsx                   # NEW: RPG open-world combat
```

## Game Flow Diagram

```
Main Menu
   ├─→ Story Mode → Mission Select → Character Select → OPEN-WORLD COMBAT
   ├─→ Versus Mode → Character Select → ARCADE 1v1
   └─→ Quick Battle → Character Select → ARCADE 1v1
```

## Platform Consistency (Per CANON.md)

✅ **Unified Gameplay Core**: Both combat modes share the same core mechanics
✅ **No Platform Divergence**: Mobile/PC use identical game logic
✅ **Rendering Only**: Platform differences are visual (camera, effects), not mechanical

## Testing Checklist

### Desktop Testing
- [ ] Story mode mission selection displays correctly
- [ ] Mission selection → open-world combat works
- [ ] Versus mode → arcade combat works
- [ ] Quick battle → arcade combat works

### Mobile Testing (Portrait)
- [ ] Mission selection UI is readable and touch-friendly
- [ ] Text sizes are appropriate
- [ ] Buttons are touch-friendly (not too small)
- [ ] Open-world combat camera shows enough of battlefield
- [ ] Controls work in open-world mode

### Mobile Testing (Landscape)
- [ ] UI elements don't overlap
- [ ] Combat camera provides good view
- [ ] Controls are accessible

## Next Steps (Not Implemented Yet)

1. **Mission Objective Tracking**: Display objectives during open-world combat
2. **Multiple Enemy AI**: Implement spawning and behavior for 1vN combat
3. **RPG Progression**: XP, leveling, and loot systems in open-world
4. **Story Integration**: Cutscenes and dialogue during missions
5. **Performance Testing**: Ensure smooth 60fps on various mobile devices

## Technical Notes

- `gameState` determines combat mode:
  - `'mission-gameplay'` → OpenWorldCombat
  - `'playing'` → BattleScene (arcade 1v1)
- Character stats and abilities are consistent across both modes
- Camera positioning is the main visual difference
- Both modes use the same UI overlays (BattleUI, MobileControls, etc.)

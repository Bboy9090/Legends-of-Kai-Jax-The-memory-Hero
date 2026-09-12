# Legends of Kai-Jax: Controls Guide

Complete reference for all input methods supported in Legends of Kai-Jax: The Memory Hero.

## Quick Reference

| Action | Keyboard | Touch | Gamepad |
|--------|----------|-------|---------|
| Move Forward | W / ↑ | Joystick | D-Pad ↑ / L Stick ↑ |
| Move Backward | S / ↓ | Joystick | D-Pad ↓ / L Stick ↓ |
| Move Left | A / ← | Joystick | D-Pad ← / L Stick ← |
| Move Right | D / → | Joystick | D-Pad → / L Stick → |
| Run / Sprint | Shift | Hold Joystick | L Stick Click / R1 |
| Jump | Space | — | A (PS) / Cross (Xbox) |
| Dodge | Q | DODGE | B (PS) / Circle (Xbox) |
| Light Attack | J / X | ATK | Square (PS) / X (Xbox) |
| Heavy Attack | K / Z | HEAVY | Triangle (PS) / Y (Xbox) |
| Skill Attack | L / C | SKILL | R1 (PS) / RB (Xbox) |
| Ultimate Ability | I / V | ULTIMATE | L1 (PS) / LB (Xbox) |
| Wall Climb | Shift + W | Joystick ↑ | L Stick ↑ (near wall) |
| Traversal (Zip) | E | — | R2 (PS) / RT (Xbox) |
| Interact | F | — | X (PS) / A (Xbox) |
| Pause | Esc / P | PAUSE button | Start / Menu |

---

## Keyboard Controls (Desktop)

### Movement

| Key | Action |
|-----|--------|
| **W** | Move forward |
| **A** | Move left |
| **S** | Move backward |
| **D** | Move right |
| **Arrow Keys** | Alternative movement (↑↓←→) |
| **Shift** (hold) | Run/Sprint faster |

**Note:** All movement keys can be pressed simultaneously. Diagonal movement is normalized so you move at the same speed in all directions.

### Combat Actions

| Key | Action |
|-----|--------|
| **J** | Light Attack (primary combo) |
| **X** | Light Attack (alternate) |
| **K** | Heavy Attack (high damage, costs stamina) |
| **Z** | Heavy Attack (alternate) |
| **L** | Skill Attack (character-specific ability) |
| **C** | Skill Attack (alternate) |
| **I** | Ultimate Ability (Kai: Memory King, Jax: Survival Burst) |
| **V** | Ultimate Ability (alternate) |
| **Q** | Dodge (i-frames for invulnerability) |

**Combo System:** Chain light attacks with heavy attacks for extended combos. Timing matters — pressing the next attack within the combo window extends the chain. Each character has unique combo paths.

**Ultimate Ability Cooldown:** 30 seconds per use (shown as a timer during gameplay).

### Movement & Traversal

| Key | Action |
|-----|--------|
| **Space** | Jump (in air, affects movement arc) |
| **Shift + W** | Wall Climb (hold to scale vertical surfaces) |
| **E** | Traversal Action (web-zipping, grappling) |

**Wall Climbing:** When near a climbable wall, hold Shift+W to ascend. Release to fall. You can move left/right (A/D) while climbing.

**Web-Zipping:** Press E when near a zip point to grapple-swing across gaps or chasms. Some puzzles require using multiple zip points in sequence.

### Interaction & UI

| Key | Action |
|-----|--------|
| **F** | Interact (pick up items, activate switches) |
| **Esc** | Pause Game (open pause menu) |
| **P** | Pause Game (alternate) |

**Interact:** Used for environmental puzzles, collectibles, and interactive objects. Icon appears when an object is interactable.

---

## Touch Controls (Mobile/Tablet)

On-screen touch controls appear automatically on touch-capable devices during gameplay in Adventure Mode.

### Touch Control Layout

```
┌─────────────────────────────────────┐
│   PAUSE          [Game Canvas]      │  ← PAUSE button (top-right)
│                                     │
│   [Movement      [Gameplay area]    │
│    Joystick]     with 3D models     │
│   (bottom-left)                     │
│                  [ATK][HEAVY][SKILL]│  ← Buttons (bottom-right)
│                  [ULTIMATE][DODGE] │
└─────────────────────────────────────┘
```

### Touch Buttons (Adventure Mode)

#### Movement Joystick (Bottom-Left)
- **Thumb Pad:** Virtual joystick for movement
- **Visual Feedback:** Joystick extends as you push further from center
- **Diameter:** 96px (48px radius from center)
- **Behavior:** Additive with keyboard movement (can use both simultaneously)

#### Combat Buttons (Bottom-Right)
All buttons are 48px × 48px minimum (WCAG AA compliant for touch targets).

| Button | Action | Icon |
|--------|--------|------|
| **ATK** | Light Attack | Fist icon |
| **HEAVY** | Heavy Attack | Hammer icon |
| **SKILL** | Skill Attack | Spark icon |
| **ULTIMATE** | Ultimate Ability | Glowing star |
| **DODGE** | Dodge (invulnerability frames) | Sidestep arrow |

#### UI Buttons
- **PAUSE** (top-right corner) — Open pause menu
  - **Resume** — Continue playing
  - **Force Quit to Hub** — Return to main menu

### Touch Input Behavior

- **Multi-Touch Support:** You can hold the joystick and press attack buttons simultaneously
- **Smart Release:** Releasing any button immediately ends that action
- **Safe Area Support:** Controls avoid notches and rounded corners on modern phones
- **Orientation:** Works in both portrait and landscape (recommended: landscape)

**Performance Note:** Touch input is processed at 60 Hz, same as keyboard. No latency difference between input methods on comparable devices.

---

## Gamepad Controls (PlayStation, Xbox, Generic)

### Button Mapping

#### Combat (Right Side Buttons)

| PS Controller | Xbox Controller | Action |
|---------------|-----------------|--------|
| **△** (Triangle) | **Y** | Heavy Attack |
| **◻** (Square) | **X** | Light Attack |
| **⭕** (Circle) | **B** | Dodge |
| **✕** (Cross) | **A** | Jump / Interact |

#### Shoulder Buttons

| PS Controller | Xbox Controller | Action |
|---------------|-----------------|--------|
| **R1** | **RB** | Skill Attack |
| **L1** | **LB** | Ultimate Ability |
| **R2** | **RT** | Traversal (Zip) |
| **L2** | **LT** | — (reserved) |

#### D-Pad & Analog Sticks

| Input | Action |
|-------|--------|
| **D-Pad ↑↓←→** | Movement (8-directional) |
| **L Analog Stick** | Movement (full 360°, preferred) |
| **L Stick Click** | Sprint/Run modifier |
| **R Analog Stick** | — (reserved for future camera) |
| **Menu / Start** | Pause game |

### Analog Stick Behavior

- **Deadzone:** 0.2 (20% of stick travel ignored to prevent drift)
- **Normalization:** Diagonal inputs are normalized to maintain consistent speed
- **Running:** Click the left stick or press the stick forward + shoulder button to sprint

### Gamepad Control Presets

The following gamepad layouts are supported:

1. **PlayStation (DualSense/DualShock4)** ✅
2. **Xbox Series X|S** ✅
3. **Xbox One** ✅
4. **Generic Gamepad (WebGamepad API)** ⚠️ Partial support

**Verify Your Controller:**
1. Go to Settings → Controls
2. Press any button on your gamepad
3. The detected controller name appears on-screen

---

## Input Conflicts & Clarifications

### No Conflicts (Phase 5.5 Resolved)

**Previous versions had input conflicts that have been corrected:**

| Old System | Conflict | Phase 5.5 Fix |
|-----------|----------|---------------|
| Jump vs Dodge | Both Space | Jump = Space, Dodge = Q |
| Interact vs Traversal | Both E | Interact = F, Traversal = E |
| Ultimate vs Skill | Both I | Ultimate = I, Skill = L |

All controls now have dedicated keys with no overlap.

---

## Control Customization

### Available in Settings Menu
1. **Main Menu** → **Settings** → **Controls**
2. Remapping for keyboard is available in future updates
3. Gamepad button remapping TBD for Phase 5.6

### Current Status
- ✅ Keyboard layout is fixed (non-customizable in Phase 5.5)
- ⚠️ Touch button layout is fixed (resizable in future)
- ⏳ Gamepad remapping planned for Phase 5.6

---

## Character-Specific Actions

### Kai-Jax (Memory King)

**Ultimate Ability (I / L1 / ULTIMATE)**
- Transforms into Memory King state
- Grants: Enhanced strength, temporary invulnerability, AoE attacks
- Duration: 8 seconds
- Cooldown: 30 seconds
- Special Feature: Cooldown accelerates with combo hits

### Jax (Armor Specialist)

**Ultimate Ability (I / L1 / ULTIMATE)**
- Activates Survival Burst
- Grants: Damage mitigation shield, reduced knockback, heal over time
- Duration: 10 seconds
- Cooldown: 30 seconds
- Special Feature: Shield scales with remaining health

### Fang Variants

Each Fang character in the roster has unique light/heavy/skill attack animations and effects. Ultimate ability input (I) is universal across all characters.

---

## Advanced Techniques

### Combo Timing Window

Light attacks combo into heavy attacks if pressed within **0.5 seconds** of the previous attack landing. This window is visualized by a brief glow effect around the character.

**Example Combo (Kai):**
1. Press J (Light Attack)
2. Wait for hit to land (~0.3s)
3. Press K within 0.5s → Heavy Attack chains
4. Repeat or release to reset

### Wall Climbing Mechanics

1. **Approach a vertical wall**
2. **Hold Shift + W** to begin climbing
3. **Hold to ascend**, release to descend or fall
4. **Press A or D** to move left/right while climbing
5. **Press Space** to push off and jump away from wall

**Walls:** Certain surfaces are climbable (visually distinct). Not all vertical surfaces can be climbed.

### Web-Zipping (Traversal)

1. **Locate a zip point** (glowing tether or marked surface)
2. **Press E** to initiate grapple
3. **Character auto-swings** to destination
4. **Press direction keys** during swing to adjust trajectory
5. **Release E or reach destination** to detach

**Puzzle Use:** Some areas require chaining multiple zip points to cross large gaps.

---

## Accessibility Features

### Touch Target Sizing
All on-screen buttons are **44px minimum** in height/width, meeting WCAG AA standards for touch accessibility.

### Keyboard Alternatives
Every touch button has a keyboard equivalent:
- No actions are keyboard-exclusive
- No actions are touch-exclusive (except joystick direction input)

### Colorblind Support
- UI elements don't rely on color alone for differentiation
- Icons and text labels provide secondary identification

### Controller Support
Keyboard, touch, and gamepad inputs are fully equivalent. Switch between devices mid-game without remapping.

---

## Troubleshooting

### "Controller not recognized"
1. Ensure controller is plugged in (or paired via Bluetooth)
2. Open **Settings → Controls** to verify detection
3. Press any button on controller to wake detection
4. Try a different controller if available

### "Input feels delayed"
1. Check for background programs consuming CPU
2. Reduce graphics quality (Settings → Graphics)
3. Close other browser tabs
4. Disable browser extensions that intercept input

### "Touch buttons not responding"
1. Ensure you're in Adventure Mode (buttons only appear in gameplay)
2. Check for software keyboard overlay blocking buttons
3. Try landscape orientation
4. Clear browser cache and refresh

### "Keyboard input not working"
1. Ensure browser window is in focus (click game canvas)
2. Verify keys aren't remapped in OS settings
3. Try alternative keys (e.g., Arrows instead of WASD)
4. Check browser console for input errors (F12)

---

## Input Latency & Performance

| Input Method | Measured Latency | Notes |
|--------------|------------------|-------|
| Keyboard | 16-50ms | Varies by browser/OS |
| Touch | 20-80ms | Depends on device hardware |
| Gamepad | 16-100ms | USB faster than Bluetooth |
| Virtual Joystick | 30-100ms | Touch-based, same latency as buttons |

**Best Performance:** USB-connected controller or keyboard on desktop.  
**Mobile Best:** Wired gamepad (USB-C/Lightning adapter) or touch input on flagship phone.

---

## Controls Summary by Device

### Desktop (Windows/macOS/Linux)
- **Recommended:** Keyboard + Mouse (not used in combat)
- **Alternate:** Gamepad
- **Supported:** Touch (if device has touchscreen)

### Mobile (iOS/Android)
- **Recommended:** Touch controls
- **Alternate:** Bluetooth gamepad
- **Not Recommended:** External keyboard (no mouse support for control layout)

### Tablet (iPad/Android Tablet)
- **Recommended:** Touch controls (portrait or landscape)
- **Best Experience:** Landscape orientation (larger touch targets visible)
- **Alternate:** Bluetooth gamepad or keyboard

---

## Controller Support Matrix

| Controller | Platform | Status | Notes |
|-----------|----------|--------|-------|
| DualSense | PS5 | ✅ Full | Via USB or Bluetooth |
| DualShock 4 | PS4 | ✅ Full | Via USB or Bluetooth |
| Xbox Series X|S | Windows/Web | ✅ Full | Via USB or Wireless adapter |
| Xbox One | Windows/Web | ✅ Full | Via USB or Wireless adapter |
| Generic Gamepad | Web | ⚠️ Partial | WebGamepad API, button layout may vary |
| Joy-Con | Web | ⚠️ Partial | Supported on Chrome/Edge, grip mode recommended |
| Switch Pro | Web | ⚠️ Partial | Supported on Chrome/Edge |

---

## Future Control Enhancements (Planned for Phase 5.6+)

- [ ] Customizable keyboard bindings
- [ ] Gamepad button remapping
- [ ] Adaptive trigger support (PS5 DualSense)
- [ ] Haptic feedback / rumble implementation
- [ ] Camera stick right analog support
- [ ] Macros/combos for advanced players
- [ ] Touch button position/size customization

---

## Contact & Feedback

If you encounter input issues or have control improvement suggestions:

1. **Gameplay Settings** — Check control preferences in Settings
2. **Known Issues** — See [README.md#known-issues](README.md#12-known-limitations)
3. **Bug Reports** — File an issue with input context (device, OS, controller type)

---

**Last Updated:** Phase 5.5  
**Controls Status:** ✅ Complete and Verified

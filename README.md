# 🦁 BEAST-KIN SOVEREIGNTY: GENESIS
## Legends of Kai-Jax - The Memory Hero

> **Original Platform Fighting RPG** - Combining epic story-driven combat with Genesis Warriors, Resonance Systems, and Celestial Transformations

[![CI](https://github.com/Bboy9090/Smash-Hereos/actions/workflows/ci.yml/badge.svg)](https://github.com/Bboy9090/Smash-Hereos/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Omega Protocol](https://img.shields.io/badge/Omega%20Protocol-Certified-gold)](docs/OMEGA_PROTOCOL_COMPLIANCE.md)

## ⚡ Omega Protocol Certified

**This codebase meets "Evolutionary Superiority" standards** as defined by the Omega Protocol game development bible. Every mechanic has been audited and enhanced to **Legendary Level**. See [Omega Protocol Compliance Report](docs/OMEGA_PROTOCOL_COMPLIANCE.md) for full certification details.

## 🌟 Vision

Build the greatest looking and feeling fighting game engine with:

- **Platform Fighting Evolved**: Resonance-based knockback, multi-plane combat, cinematic impact
- **Marvel Ultimate Alliance**: Hero abilities, ultimate powers, team synergy
- **Spider-Man PS5**: Fluid momentum-based movement, cinematic finishers
- **Batman Arkham Series**: Freeflow combat, counter system, rhythm-based combos

**Target Platforms**: Mobile/Tablet (primary), PC/Web (secondary)

## 🚀 Quick Start

### Prerequisites

- Node.js 20 LTS or higher
- pnpm 8 or higher

### Installation

```bash
# Install pnpm if you haven't
npm install -g pnpm

# Install dependencies
pnpm install

# Start development
pnpm dev

# Build for production
pnpm build
```

## 📦 Project Structure

This is a modern TypeScript monorepo using pnpm workspaces and Turborepo:

```
smash-heroes/
├── apps/
│   ├── web/              # Web game (Vite + React + R3F)
│   │   ├── src/          # Game components, pages
│   │   ├── public/       # Static assets
│   │   └── vite.config.ts
│   └── mobile/           # Mobile app (Capacitor + PWA)
│       ├── src/          # Mobile-specific code
│       └── capacitor.config.json
├── packages/
│   ├── engine/           # Core game engine
│   │   ├── core/         # GameLoop (60fps), Scene, AssetLoader
│   │   ├── physics/      # MomentumPhysics, Hitbox, Collision
│   │   ├── combat/       # CombatEngine, Damage, Knockback
│   │   ├── input/        # InputManager, InputBuffer (6-frame)
│   │   ├── animation/    # StateMachine, AnimationController
│   │   ├── effects/      # Particles, ScreenEffects
│   │   └── audio/        # AudioManager, SoundPool
│   ├── characters/       # Fighter implementations
│   │   ├── base/         # BaseFighter, MoveSet, StateMachine
│   │   └── heroes/       # Kaison (Fox), Jaxon (Hedgehog), Kaxon (Fusion), Striker
│   ├── ui/               # React UI components
│   │   └── components/   # HUD, BattleUI, VirtualJoystick
│   ├── server/           # Server-side logic
│   │   └── missions/     # Mission system (100 missions, 10 books)
│   └── shared/           # Shared types, utils, constants
│       ├── types/        # TypeScript types for all systems
│       ├── constants/    # Game configuration
│       └── utils/        # Utility functions
├── assets/
│   ├── sprites/          # 2D sprite assets
│   ├── audio/            # Sound effects and music
│   └── models/           # 3D models (.glb files)
├── docs/                 # Game design documents
├── legacy_replit/        # Original Replit prototype files
├── LEGACY_FILES.md       # File mapping from old → new structure
└── MIGRATION_LOG.md      # Detailed migration tracking
```

### 📁 Workspace Structure

- **apps/**: Deployable applications (web, mobile)
- **packages/**: Reusable packages (engine, characters, ui, etc.)
- **Monorepo tools**: pnpm (package manager), Turborepo (build orchestration)


## 🎯 Core Features

### ⚡ Physics System

- **60 FPS Fixed Timestep**: Rock-solid game loop
- **Momentum-Based Movement**: Spider-Man style fluid movement
- **Variable Gravity Curves**: Snappy liftoff, floaty peak, weighted falls ✨ NEW
- **Coyote Time**: Grace period after leaving platform (5 frames)
- **Jump Buffering**: Remember jump inputs (6 frames)
- **Variable Jump Height**: Hold for higher jumps
- **Fast Fall**: Quick descent with down input

### 💥 Combat System

#### Resonance-Based Damage & Impact System

```typescript
// Knockback formula: ((((p/10 + (p*d)/20) * 200/(w+100) * 1.4) + 18) * s) + b) * r
KB = f(damage%, attack_damage, weight, growth, base, rage)
```

- **Percentage Damage**: 0% to 999%
- **Dynamic Knockback**: Scales with damage
- **DI (Directional Influence)**: Control knockback direction (±18°)
- **Rage System**: More knockback at high damage (+15% max)
- **Poise & Stagger System**: Light hits flinch, heavy hits launch ✨ NEW

#### Arkham-Style Freeflow

- **Attack Chains**: Seamless target switching
- **Counter Windows**: 8 frames to counter attacks
- **Parry System**: 3 frame perfect parry (2x damage multiplier)
- **Combo Multiplier**: Up to 2x damage at high combo count
- **Rhythm-Based Flow**: Timing-based combo extensions
- **Frame-Canceling**: Advanced combo system for skilled players ✨ NEW

### 🎮 Input System

Unified input handling for all platforms:

- **Keyboard**: WASD + IJKL/Arrow keys
- **Gamepad**: Full Xbox/PlayStation controller support
- **Touch**: Virtual joystick + action buttons
- **Gestures**: Swipe to jump, tap to attack
- **6-Frame Buffer**: Never miss an input

### 🎨 Visual Effects

- **Hitlag/Hitstop**: Freeze frames on impact (2-20 frames)
- **Screen Shake**: Intensity scales with damage
- **Slow Motion**: Dramatic slow-mo on big hits (30% speed)
- **Particle System**: Hit sparks, explosions, trails
- **Visual Juice**: Dust clouds on dash, sparks on parry, movement trails ✨ NEW
- **Dynamic Camera**: Zoom in for 1v1 tension, zoom out for chaos ✨ NEW

## 🥊 Character System

### Striker - The All-Rounder

Balanced fighter with complete moveset:
### ⚔️ Playable Characters

#### Kaison 🦊 (Fox)
**Speed Fighter** - High mobility with quick attacks
- **Weight**: 80 (Light)
- **Speed**: 2.4 (Fast runner)
- **Special**: Fox Blaster, Fox Dash, Fox Fire, Fox Reflector
- **Playstyle**: Aggressive rushdown with momentum-based combos

#### Jaxon 🦔 (Hedgehog)
**Speed Demon** - Fastest character with spin attacks
- **Weight**: 75 (Very light)
- **Speed**: 3.2 (Fastest)
- **Special**: Homing Attack, Spin Dash (chargeable), Spring Jump
- **Playstyle**: Hit-and-run with spin-based multi-hit combos

#### Kaxon ⚡ (Fusion - 3 Tails)
**Ultimate Form** - Fusion of Kaison and Jaxon
- **Weight**: 95 (Balanced)
- **Speed**: 3.5 (Ultimate speed)
- **Fusion Timer**: 30 seconds
- **Special**: Fusion Blaster Barrage, Hyper Dash, Triple Tail Tornado
- **Ultimate**: Chaos Rift (screen-filling attack)
- **Requires**: 100% Synergy Meter to transform

#### Striker ⚡
**Balanced Fighter** - All-around balanced moveset
- **Weight**: 100 (Average)
- **Speed**: 2.0 (Balanced)
- **Playstyle**: Versatile with solid fundamentals

### Attack System

**Ground Attacks**
- Jab Combo (3-hit)
- Tilts (Forward, Up, Down)
- Impact Sequences (Forward, Up, Down)

**Aerial Attacks**
- Neutral Air, Forward Air, Back Air
- Up Air, Down Air (Spike)

**Special Moves**
- Neutral Special: Projectile/Power attack
- Side Special: Dash Strike
- Up Special: Recovery move
- Down Special: Counter/Defense

**Tag & Fusion System**
- Switch between Kaison and Jaxon
- Build Synergy Meter through combos
- Transform into Kaxon at 100% meter
- Cinematic transformation sequence

## 🛠️ Development

### Monorepo Commands

This project uses a pnpm workspace + Turborepo setup:

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Watch mode (development)
pnpm dev

# Run linting
pnpm lint

# Type checking
pnpm typecheck

# Run tests
pnpm test

# Format code
pnpm format
```

### Running Specific Apps

```bash
# Start web app
pnpm --filter @beast-kin/web dev

# Start mobile app
pnpm --filter @beast-kin/mobile dev

# Build specific package
pnpm --filter @beast-kin/engine build
```

### DevContainer

Open in GitHub Codespaces or VS Code with Remote Containers:

```bash
# The devcontainer includes:
# - Node.js 20 LTS
# - pnpm 8+
# - TypeScript, ESLint, Prettier extensions
# - Auto-format on save
```

### Adding a New Character

See [CHARACTER_GUIDE.md](docs/CHARACTER_GUIDE.md) for detailed instructions.

Quick example:

```typescript
import { BaseFighter, MoveSetBuilder } from '@beast-kin/characters';

export class MyHero extends BaseFighter {
  protected getDefaultStats() {
    return {
      weight: 100,
      walkSpeed: 1.2,
      // ... more stats
    };
  }

  protected createMoveSet() {
    return new MoveSetBuilder()
      .addAttack('jab', { damage: 3, ... })
      .build();
  }
}
```

## 📚 Documentation

- [Architecture](docs/ARCHITECTURE.md) - System design and architecture
- [Character Guide](docs/CHARACTER_GUIDE.md) - How to create new characters
- [Combat System](docs/COMBAT_SYSTEM.md) - Deep dive into combat mechanics
- [Getting Started](docs/GETTING_STARTED.md) - Detailed setup guide
- **[Omega Protocol Compliance](docs/OMEGA_PROTOCOL_COMPLIANCE.md) - Certification report ✨ NEW**
- **[Legendary Mechanics](docs/LEGENDARY_MECHANICS.md) - Advanced "legendary-tier" systems ✨ UPDATED**
- **[Integration Example](docs/INTEGRATION_EXAMPLE.ts) - Complete usage examples**

## 🌟 Legendary-Tier Features

We've implemented advanced mechanics inspired by the best fighting games, all certified under the Omega Protocol:

### The "Feelability" Protocol ✅
- **Variable Gravity Curves**: Snappy liftoff, floaty peak, weighted falls
- **Frame-Canceling**: Advanced combo system with 5 cancel types
- **Poise & Stagger**: Impact-based reactions (flinch → stagger → launch)
- **Hit-Stop**: 2-20 frames based on damage
- **Input Buffering**: 6-frame window for zero missed inputs
- **Coyote Time**: 5-frame grace period for jumps

### Omega Protocol Enhancements ✨ NEW
- **Transformation System**: Mid-combat instant transformations with real-time stat/moveset changes
- **After-Image Shadows**: Speedsters leave ghost trails at 3.0+ speed
- **Weight Class Feel**: Heavy characters "tear the earth," light characters feel swift
- **Legendary Blows**: 0.08s freeze, screen desaturation, shockwave ripples for 30+ damage hits

### Visual Superiority ✅
- **Visual Juice System**: Secondary effects on every action
  - Dust clouds on dashes
  - Sparks on parries  
  - Impact effects scaled by damage
  - Movement trails for high-speed action
- **Dynamic Camera**: The camera is a character
  - Zoom in for tense 1v1 moments (up to 2.0x)
  - Zoom out for chaotic multi-fighter brawls (down to 0.5x)
  - Smooth interpolation and auto-framing
- **Weight-Based Effects**: Ground cracks, tremors, footprints for heavy characters ✨ NEW

### Tactical AI ✅
NPCs that actually think:
- **Flanking**: Coordinate with allies to attack from multiple sides
- **Retreat**: Fall back when health is low
- **Punish**: Capitalize on player mistakes
- **Difficulty Scaling**: Easy (50%) to Legendary (95% accuracy)
- **Personalities**: Aggressive, Defensive, Balanced, Tactical

### Narrative Integration ✅
- **Character Archetypes**: Life Path (1-9) + Zodiac Sign
  - Example: Life Path 9 / Virgo = "Disciplined, analytical, devastatingly efficient"
  - Combat modifiers affect speed, defense, precision, etc.
  - Each archetype has unique strengths, weaknesses, and special mechanics
- **Environmental Storytelling**: Character backstories integrated into gameplay

See [LEGENDARY_MECHANICS.md](docs/LEGENDARY_MECHANICS.md) for complete details and usage examples.

## 🎯 Performance Targets

- **Frame Rate**: Stable 60 FPS on mobile devices
- **Input Latency**: < 3 frames (50ms)
- **Bundle Size**: < 500KB for core engine
- **Type Safety**: 100% TypeScript, strict mode

## 🗺️ Roadmap

### Phase 1: Core Engine ✅
- [x] Game loop (60 FPS fixed timestep)
- [x] Physics system (momentum, collision)
- [x] Combat system (damage, knockback, combos)
- [x] Input system (keyboard, gamepad, touch)
- [x] Animation & state machine
- [x] Visual & audio effects

### Phase 2: Characters ✅
- [x] Base fighter class
- [x] Fighter state machine
- [x] Striker character (complete moveset)
- [x] Character archetype system ✨ NEW

### Phase 2.5: Legendary-Tier Mechanics ✅ NEW
- [x] Variable gravity curves
- [x] Frame-canceling system
- [x] Poise & stagger system
- [x] Visual juice system
- [x] Dynamic camera
- [x] Tactical AI system
- [x] Character archetypes (Life Path + Zodiac)

### Phase 3: UI & Apps (In Progress)
- [ ] React UI components
- [ ] HUD (damage display, combo counter)
- [ ] Menus (character select, stage select)
- [ ] Mobile virtual controls
- [ ] Web application (Vite + React)
- [ ] Mobile app (Capacitor)

### Phase 4: Content
- [ ] More playable characters
- [ ] Multiple stages
- [ ] Game modes (Stock, Time, Training)
- [ ] Sound effects & music
- [ ] Visual polish (shaders, particles)

### Phase 5: Online
- [ ] Rollback netcode
- [ ] Matchmaking
- [ ] Replay system
- [ ] Leaderboards

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) first.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

Inspired by:
- Platform Fighting Genre Pioneers
- Marvel Ultimate Alliance
- Spider-Man (PS5)
- Batman: Arkham Series

---

**Made with ❤️ for fighting game enthusiasts**

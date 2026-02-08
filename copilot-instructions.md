# Copilot Instructions — Legends of Kai-Jax: The Memory King

**Status:** CANONICAL REFERENCE  
**Version:** 1.0.0  
**Last Updated:** 2026-02-08

---

## Core Directive

You are working on **Legends of Kai-Jax: The Memory King**, a mythic action game with a unified codebase that scales from PC to tablet to mobile. Every decision must follow these non-negotiable constraints.

---

## NON-NEGOTIABLE CONSTRAINTS

### 1. Unified Core
- **One source of truth.** All character data, game logic, and rendering behavior must derive from canonical JSON specs.
- No duplicate definitions. No hard-coded values that diverge from specs.
- If you need to add a character property, add it to `kai_jax.character.json` first, then consume it everywhere.

### 2. PC-First
- Design for desktop/PC performance and experience first.
- Scale down to tablet (responsive), then mobile (aggressive optimization).
- Never compromise the PC experience to support mobile. Instead, use progressive enhancement and LOD systems.

### 3. No Logic Divergence
- The same game logic must run identically on all platforms.
- Platform-specific code is allowed only for:
  - Input handling (mouse/keyboard vs touch)
  - Rendering quality (LOD, effects)
  - Performance optimizations (worker threads, etc.)
- Combat calculations, character stats, and game rules must be deterministic and platform-agnostic.

### 4. Must Validate Against JSON
- All character implementations must validate against `kai_jax.character.json`.
- All story/mission implementations must validate against `schemas/story_mode.schema.json`.
- Before committing, run validation scripts (see Testing section).

---

## Canonical References

These files are the **single source of truth**:

1. **`kai_jax.character.json`** — Character specs, stats, rendering layers
2. **`design_guidelines.json`** — Visual identity, typography, colors, layout
3. **`specs/primary/character_art_spec.json`** — Character appearance canon
4. **`specs/primary/character_renderer_spec.md`** — Rendering philosophy and LOD strategy
5. **`memory/PRD.md`** — Master product requirements document
6. **`schemas/story_mode.schema.json`** — Story structure validation schema

### Reading Order for New Contributors
1. Start with `memory/PRD.md` for the big picture
2. Read `kai_jax.character.json` for character system
3. Read `design_guidelines.json` for visual rules
4. Read `specs/primary/character_renderer_spec.md` for rendering approach

---

## Project Structure

```
.
├── kai_jax.character.json          # CANONICAL: Character spec
├── copilot-instructions.md         # THIS FILE
├── design_guidelines.json          # CANONICAL: Visual design rules
├── memory/PRD.md                   # Master product requirements
├── schemas/                        # JSON validation schemas
│   └── story_mode.schema.json
├── specs/                          # Technical specifications
│   ├── primary/                    # Current implementation (Three.js)
│   └── unreal/                     # Future UE5 port specs
├── apps/
│   ├── web/                        # Main React + Three.js app (PC-first)
│   └── mobile/                     # Mobile-specific optimizations
├── packages/
│   ├── characters/                 # Character system logic
│   ├── engine/                     # Game engine core
│   ├── ui/                         # Shared UI components
│   ├── shared/                     # Shared utilities
│   └── server/                     # Backend server
├── frontend/                       # Legacy frontend (being migrated)
└── backend/                        # FastAPI backend
```

---

## Design Principles

### Silhouette First
> "If the silhouette reads, you win. If it breaks when scaled down, you lose no matter how pretty it is."

- Characters must be recognizable from silhouette alone
- Identity survives at all distances (close, mid, far, very far)
- Details are additive, never required for recognition

### Layered Rendering
Characters are **stacked render layers**, not textures on geometry:

| Layer | Purpose | LOD Survival |
|-------|---------|--------------|
| Base mesh | Body shape, claws, tail mass | Always on |
| Fur shell | Volume and species identity | Off at very far |
| Vein emissive | Mythic energy identity | Off at very far |
| Elemental tail | Motion identity | Always on |
| Aura glow | Power state readability | Close only |
| Particles | Flavor | Close only |

### Deterministic Behavior
- Same input → same output, always
- No random combat calculations (use seeded random if needed)
- Reproducible bugs are fixable bugs

### No Placeholder Logic
- Features are either:
  1. **Fully implemented** — working as designed
  2. **Clearly disabled** — commented with `// TODO: [Feature] - [Reason]`
- Never ship half-working features that "mostly work"

---

## Coding Standards

### TypeScript/JavaScript
```typescript
// ✅ GOOD: Derives from canonical spec
import { FIGHTERS } from '@/lib/characters';
const fighter = FIGHTERS.find(f => f.id === 'kai-jax');

// ❌ BAD: Hard-coded values
const kaijaxColor = '#1a1a1a'; // Could diverge from spec
```

### Color Handling
```typescript
// ✅ GOOD: Uses canonical hex colors from JSON
const { primaryColor, accentColor } = getDesignForFighterId('kai-jax');

// ❌ BAD: RGB values that don't match hex spec
const color = new THREE.Color(0.1, 0.1, 0.1); // What hex is this?
```

### Responsive Design
```tsx
// ✅ GOOD: PC-first, mobile-optimized
<div className="p-8 lg:p-12 xl:p-16">
  {!isMobile && <ParticleEffect />}
  <CharacterModel lodLevel={getLODLevel()} />
</div>

// ❌ BAD: Mobile-first that limits PC
<div className="p-2 lg:p-4"> {/* Too cramped on PC */}
```

### LOD Implementation
```typescript
// ✅ GOOD: Follows canonical LOD strategy
const lodLevel = getCharacterLODLevel(cameraPos, charPos);
<AnatomicalBeastModel lodLevel={lodLevel} />

// ❌ BAD: Custom LOD logic that diverges
const showFur = distance < 20; // Magic number, not from spec
```

---

## Testing

### Validation Scripts

Run before committing:

```bash
# Run comprehensive validation (RECOMMENDED)
python validate_all.py

# Or run individual validators:
python validate_characters.py      # Character data validation
python test_schema_validation.py   # Story mode schema validation
python backend_test.py             # Backend API tests

# Build and check for errors
cd apps/web && npm run build
```

### Required Validations
- [ ] Character data matches `kai_jax.character.json`
- [ ] Colors are valid hex format
- [ ] Stats are within valid ranges
- [ ] LOD levels match canonical distances
- [ ] No hard-coded values that should be in specs
- [ ] All constraints properly enforced (unified core, PC-first, etc.)
- [ ] Design principles documented and followed

---

## Common Tasks

### Adding a New Character

1. **Add to `kai_jax.character.json`** first:
   ```json
   {
     "id": "new-character",
     "name": "NEW CHARACTER",
     "appearance": { ... },
     "combat": { ... },
     "rendering": { ... }
   }
   ```

2. **Update `apps/web/src/lib/characters.ts`**:
   ```typescript
   export const FIGHTERS: Fighter[] = [
     // ... existing fighters
     {
       id: "new-character",
       name: "NewCharacter",
       displayName: "NEW CHARACTER",
       color: "#hexcolor",
       accentColor: "#hexcolor",
     },
   ];
   ```

3. **Update `apps/web/src/data/characterDesigns.ts`**:
   ```typescript
   const DESIGN_BY_ID: Record<string, CharacterDesign> = {
     // ... existing designs
     "new-character": {
       id: "new-character",
       // ... from kai_jax.character.json
     },
   };
   ```

4. **Validate**: Run `python test_schema_validation.py`

### Changing Character Colors

1. **Update `kai_jax.character.json`** first
2. **Update `specs/primary/character_art_spec.json`** (for consistency)
3. **Update derived files** (`characters.ts`, `characterDesigns.ts`)
4. **Test in-game** to verify visual consistency

### Adding a New LOD Level

1. **Update `kai_jax.character.json`** rendering.lodLevels
2. **Update `apps/web/src/lib/characterLOD.ts`** (if it exists) or create it
3. **Update character renderer** to respect new LOD
4. **Test at all distances**

---

## Visual Design Rules

From `design_guidelines.json`:

### Typography
- **Headings**: Unbounded (bold, uppercase, tight tracking)
- **Body**: Rajdhani (tech legibility, wide tracking)
- **Ancient/Gods**: Cinzel (serif, for lore)

### Colors
- **Background**: Near-black (`#050505`, `#0A0A0A`, `#121212`)
- **Primary**: Blue (`#2E2EFE`) with glow effects
- **Accents**: Fire `#FF3B30`, Electric `#FFD60A`, Storm `#64D2FF`, Void `#BF5AF2`

### Layout
- **Grid**: Bento Grid (Tetris-style asymmetric)
- **Spacing**: Generous (p-8 to p-24, never cram)
- **Container**: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`

### Components
- **Buttons**: Cyber-Pill (rounded-full, border glow on hover)
- **Cards**: Tracing Beam (glassmorphism, border glow)
- **Navigation**: Fixed glassmorphism top bar

---

## Performance Rules

### PC Expectations
- 60+ FPS at 1080p with all effects
- 144+ FPS capable with reduced effects
- Full particle systems, post-processing, shadows

### Tablet Expectations
- 60 FPS at 1366×768
- Reduced particle density
- LOD kicks in earlier
- Post-processing simplified

### Mobile Expectations
- 30-60 FPS at 1080×1920
- Aggressive LOD (mostly base mesh + emissive)
- No aura effects, minimal particles
- Simplified shaders

---

## When to Stop and Ask

If you encounter:
- Conflicting information between specs
- A requirement that would require logic divergence
- A change that can't be validated against JSON
- Uncertainty about PC-first vs mobile-first approach

**STOP. ASK. DO NOT GUESS.**

---

## Acceptance Criteria for Any Change

Before marking a task complete:

- [ ] **Matches JSON spec** — All data derives from canonical sources
- [ ] **Deterministic behavior** — Same input → same output
- [ ] **Scales PC → Tablet → Mobile** — Works at all sizes, PC experience not compromised
- [ ] **No placeholder logic** — Feature is complete or clearly disabled
- [ ] **Passes validation** — `test_schema_validation.py` passes
- [ ] **Visual consistency** — Follows `design_guidelines.json`
- [ ] **Silhouette preserved** — Character identity readable at all LOD levels

---

## Final Note

> "This is not derivative. It is ancestral."

This project has a strong identity. Respect the canon. Follow the constraints. Build something legendary.

If uncertain, reference:
1. `kai_jax.character.json` for character data
2. `design_guidelines.json` for visual rules
3. `specs/primary/character_renderer_spec.md` for rendering philosophy
4. This file (`copilot-instructions.md`) for development workflow

**Ship quality. Ship canon. Ship legend.**

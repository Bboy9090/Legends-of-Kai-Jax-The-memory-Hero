## Phase 6 (partial): UX, accessibility, performance budgets

### What changed

- **Reduce motion** (`useAccessibility.ts`): Persists `reduceMotion` in `localStorage` (`MK_A11Y_V1`). Main menu checkbox toggles it.
- **Battle / adventure cameras + post FX**: When reduce motion is on, **camera shake** is scaled down (~80%) and **CinematicPostFX punch** in battle is scaled down.

### Why

- Gives players a **concrete accessibility control** without removing combat feedback entirely.
- Aligns with “performance budgets” by reducing expensive post-processing spikes when the user opts in.

### Files

- `apps/web/src/lib/stores/useAccessibility.ts`
- `apps/web/src/components/game/MainMenu.tsx`
- `apps/web/src/components/game/BattleScene.tsx`
- `apps/web/src/components/game/BattleCamera.tsx`
- `apps/web/src/components/game/adventure/AdventureCamera.tsx`

### Next

- Optional: training mode stub, frame-time cap warning, or further chunk splitting (Vite manual chunks).

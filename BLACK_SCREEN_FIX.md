# BLACK SCREEN FIX
## Issue Analysis

**Problem:** Black screen on localhost:5173

**Root Cause:** App.tsx uses conditional rendering that requires specific state initialization, but may not be initializing correctly.

**Current Setup:**
- `main.tsx` renders `<App />`
- `App.tsx` conditionally renders based on `phase` and `gameState`
- `App.tsx` shows nothing if conditions aren't met

---

## IMMEDIATE FIX OPTIONS

### Option 1: Use GameRouter (Recommended)
Switch `main.tsx` to use `GameRouter` instead of `App` (simpler, router-based)

### Option 2: Fix App Initialization
Ensure `App.tsx` initializes `gameState` to 'menu' on mount

### Option 3: Add Fallback Render
Add default render in `App.tsx` for when conditions aren't met

---

## RECOMMENDED FIX: Option 1 (Use GameRouter)

This is cleaner and matches the Phase 1-5 implementation.

**Change `main.tsx`:**
```typescript
import { createRoot } from "react-dom/client";
import GameRouter from "./router/gameRouter";
import "./index.css";

createRoot(document.getElementById("root")!).render(<GameRouter />);
```

**This will:**
- Use React Router (cleaner)
- Show LegendaryMainMenu at "/" route
- Match the Phase 1-5 implementation
- Avoid state initialization issues

---

**STATUS:** Ready to apply fix

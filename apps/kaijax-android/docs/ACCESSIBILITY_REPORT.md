# Accessibility & WCAG 2.1 Compliance Report

## 1. Color Contrast Engine & Audit (`src/game/accessibility/contrast.ts`)
Ported Source B's WCAG 2.1 relative-luminance contrast suite (`df7bda5dce` / `411114ccb8`) with null-safe `parseHex` guarding:
- `contrastRatio(fg, bg)` enforces WCAG 2.1 threshold calculations across all Four Heritages and Cosmetic Trims (`>= 4.5:1` AA normal text).
- `readableOnDark(color, '#0a0b10', 4.5)` automatically lifts dim heritage or trim hex accents toward white while preserving hue before rendering text on dark surfaces (`CommandHubModal.tsx`).
- **Static Tailwind Class Sweep:**
  - Verified with `grep -rnE 'text-slate-(500|600|700|800)|text-gray-(500|600|700)' src` → **0 occurrences** remaining.
  - Replaced all dim secondary copy, telemetry counters, button badges, and locked indicators in `TitleScreen.tsx`, `CommandHubModal.tsx`, `GameHUD.tsx`, `ComboMeterWidget.tsx`, and `OfflineLegalModal.tsx` with `text-slate-100` / `text-slate-200` / `text-slate-300` (`>= 9.4:1` to `> 17:1` on `#0A0B10`).

## 2. Keyboard, Screen Reader & Focus Navigation
- **Focus Ring Visibility (`src/index.css`):** Added global `:focus-visible` `2px solid #f59e0b` (`outline-offset: 2px`) so keyboard, TV/desktop, and assistive switch navigation highlights every interactive button cleanly.
- **ARIA Semantics:**
  - `CommandHubModal.tsx`: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, plus `role="tablist"` / `role="tab"` / `aria-selected` across all 6 Hub tabs (`Missions`, `Heroes & Skills`, `Gear & Looks`, `City Map`, `Canon Bible`, `Settings & Saves`).
  - `OfflineLegalModal.tsx`: `role="dialog"`, `aria-modal="true"`, `aria-labelledby="legal-modal-title"`.
  - `GameHUD.tsx`: `role="progressbar"` with `aria-valuenow` / `aria-valuemin` / `aria-valuemax` / `aria-label` on Kai HP, Kai Energy, Jax HP, Jax Energy, and Boss HP bars; interactive buttons sized `min-h-[44px]`.
  - `ComboMeterWidget.tsx`: `role="status"` and `aria-live="polite"`.
  - `App.tsx` WebGL Context Recovery: `role="alertdialog"`, `aria-modal="true"`.

## 3. Motor, Timing & Motion Accessibility
- **Configurable Parry Timing Window (`parry.ts`):** Selectable in **Settings → Gameplay & Accessibility**:
  - `Standard (0.10s)` — high-precision deflect inside `0.28s` i-frames.
  - `Generous (0.16s)` — wider accessibility parry window, persisted across restarts and live-updated in HUD controls.
- **Reduced Motion & OS Sync:**
  - `SaveManager.ts` initializes `reducedMotion` from `window.matchMedia('(prefers-reduced-motion: reduce)').matches`.
  - `App.tsx` subscribes to live OS `(prefers-reduced-motion: reduce)` `change` events and propagates updates to `ComboMeterWidget.tsx` (suppressing spring bounce translations) and `GameEngine.ts` (suppressing screen-shake camera displacement).
- **Colorblind Modes:** `Protanopia`, `Deuteranopia`, and `Tritanopia` modes adjust `ComboMeterWidget` and combat cues away from ambiguous red/green pairings.

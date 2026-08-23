# Fighter Select V2 Acceptance Gates

## Gate A — Build

- [ ] Vercel preview succeeds for the current branch head.
- [ ] Production build succeeds.
- [ ] TypeScript validation succeeds.
- [ ] Lint succeeds.

## Gate B — Input

- [ ] Arrow/WASD navigation moves through the roster correctly.
- [ ] Enter/Space starts a standard fight.
- [ ] T starts training.
- [ ] Escape/Backspace returns to menu.
- [ ] Gamepad D-pad navigates.
- [ ] Gamepad A confirms.
- [ ] Gamepad B returns.
- [ ] Gamepad Y starts training.
- [ ] Touch selection remains functional.

## Gate C — Responsive UI

- [ ] 390×844 portrait.
- [ ] 844×390 landscape.
- [ ] 1024×1366 tablet.
- [ ] 1920×1080 desktop.
- [ ] 2560×1440 desktop.
- [ ] 3440×1440 ultrawide.

## Gate D — Accessibility

- [ ] Selected fighter is announced through button state/label.
- [ ] Focus treatment is clearly visible.
- [ ] Primary controls are keyboard reachable.
- [ ] Stat values expose semantic progressbar information.
- [ ] Reduced-motion follow-up is evaluated before final V2 completion.

## Gate E — Data correctness

- [ ] Resume the persisted fighter when the fighter still exists.
- [ ] Selection updates the existing runner store.
- [ ] No second selector-specific persistence source is introduced.
- [ ] Canonical fighter IDs are audited for duplicates/aliases.
- [ ] Unlock behavior is added only after a canonical unlock contract is identified.

## Merge rule

Do not merge solely because the preview renders. Merge only after the current head is stable, required checks are green, and no new blocker appears during review.

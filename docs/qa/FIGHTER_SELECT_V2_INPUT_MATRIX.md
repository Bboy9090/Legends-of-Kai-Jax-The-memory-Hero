# Fighter Select V2 Input Matrix

## Scope

This gate covers the first Fighter Select V2 interaction pass on `feature/fighter-select-v2`.

## Required input behavior

| Input | Action |
| --- | --- |
| Arrow Left / A | Previous fighter |
| Arrow Right / D | Next fighter |
| Arrow Up / W | Move one roster row up |
| Arrow Down / S | Move one roster row down |
| Enter / Space | Start ranked/standard fight |
| T | Start training fight |
| Escape / Backspace | Return to main menu |
| Gamepad D-pad | Navigate roster |
| Gamepad A | Start standard fight |
| Gamepad B | Return to main menu |
| Gamepad Y | Start training fight |
| Touch / mouse | Select fighter and activate visible actions |

## Accessibility acceptance

- Fighter cards expose pressed/selected state.
- Fighter cards expose fighter name and role through accessible labels.
- Stat bars expose progressbar semantics and numeric values.
- Back, Fight, and Training actions have visible keyboard focus treatment.
- The selected fighter is scrolled into view when selection changes.
- The layout remains usable in stacked phone/tablet form and split desktop form.

## Persistence acceptance

- The selector initializes from the persisted `useRunner.selectedCharacter` when it still exists in the roster.
- Moving or tapping to a fighter updates the existing persisted runner selection.
- Starting a fight reuses that same selected fighter instead of maintaining a second selector-specific save source.

## Follow-up gates

This pass intentionally does not invent progression rules for locked fighters. Locked/unlocked behavior must bind to an explicit canonical unlock contract rather than hard-coded guesses.

Next gates:

1. Establish canonical fighter unlock metadata/contract.
2. Add deterministic component tests for navigation, confirm, cancel, persistence, and locked-state behavior.
3. Validate keyboard, controller, touch, and responsive behavior in the deployed preview.
4. Connect fighter metadata for abilities/affinity once the canonical data source is identified.

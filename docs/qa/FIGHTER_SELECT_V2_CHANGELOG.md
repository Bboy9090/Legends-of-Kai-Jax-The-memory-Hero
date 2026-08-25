# Fighter Select V2 Interaction Pass

Branch: `feature/fighter-select-v2`

## Implemented

- Persisted fighter selection using the existing runner store.
- Keyboard roster navigation with arrows and WASD.
- Keyboard confirm, training, and back actions.
- Standard gamepad navigation using D-pad plus A/B/Y actions.
- Selected-card scroll-into-view behavior.
- Accessible fighter labels and selected state.
- Accessible stat progress semantics.
- Visible focus treatment for primary controls.
- Responsive stacked layout for smaller screens and split layout for desktop.
- Kai-Jax grade/punch handling accepts both `kai-jax` and `kaijax` identifiers while roster normalization is handled separately.

## Not claimed complete

- Fighter lock/unlock rules are not implemented because no canonical unlock contract has been established in this pass.
- Abilities and affinity presentation remain pending canonical metadata discovery.
- Browser/device verification remains required on the preview deployment.
- Automated component tests remain required before this lane is considered complete.

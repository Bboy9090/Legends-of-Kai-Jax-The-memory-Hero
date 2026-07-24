# GLB Rigging Status — Reality Check (2026-07-24)

## TL;DR

**The playable characters are already rigged and animated.** The long-standing
"rigging blocker" is narrower than assumed: it is limited to the **nine-tail
secondary sway** on Kai-Jax's fused form. No model pivot is required, and no
Blender work is required to ship a functional v0.1.0.

## What the models actually contain

Verified with `pnpm inspect:glb` on the models the registry maps for each
playable fighter:

| Fighter | Skeleton | Animations | Body anchors | Tail bones |
|---------|----------|------------|--------------|------------|
| kai-jax | ✅ humanoid armature | walk | root/spine/head ✓ | ✗ (0/9) |
| jaxon   | ✅ humanoid armature | walk + run | root/spine/head ✓ | ✗ (0/9) |
| kaison  | ✅ humanoid armature | walk | root/spine/head ✓ | ✗ (0/9) |
| kai     | ✅ humanoid armature | walk + run | root/spine/head ✓ | ✗ (0/9) |
| jax     | ✅ humanoid armature | walk | root/spine/head ✓ | ✗ (0/9) |

The rigs are standard Mixamo/Meshy humanoid hierarchies:
`Armature → char1 → Hips → Spine/Spine01/Spine02 → arms/legs/head`.

## Why the validator previously showed `root:✗`

`validate-registry.mjs` searched for a node literally named `root`. The
production rigs name their skeleton root per the Meshy/Mixamo convention
(`Armature` / `char1` / `Hips`). `findAnchor` now recognizes these
root-equivalents, so the report reflects the real rig. Models with no readable
skeleton still correctly fail.

## What remains deferred (and why it is not a blocker)

- **Nine-tail bones (`tail_01`–`tail_09`)** — the tails are part of the body
  mesh, not separate bones, so they do not sway independently. This is a
  **cosmetic polish item** on Kai-Jax's fused form, tracked as a documented
  canonical-anchor deferral in `validate-registry.mjs`. It does not affect
  movement, combat, or any other character.

## Options for the tails (future polish, not release-gating)

1. **Ship as-is** — tails are static but on-model; characters fully functional.
   Recommended for v0.1.0.
2. **Blender weight-paint** (the pending local work) — adds real tail bones for
   physical sway. Best fidelity; requires the manual weight-paint pass.
3. **In-engine secondary motion** — a bone-based sway can only be added after
   the tails are separated into bones (option 2); a mesh-level shader wiggle is
   possible but higher-risk and lower-fidelity.

## Recommendation

Do **not** pivot to new free rigged models — that would discard working,
on-brand, custom-designed characters for no functional gain. Treat the
nine-tail sway as post-MVP polish and proceed to the remaining release gates
(15-mission verification, device testing, preview deploy).

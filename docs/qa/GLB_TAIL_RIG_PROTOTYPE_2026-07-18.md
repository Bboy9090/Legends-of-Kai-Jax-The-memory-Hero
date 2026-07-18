# GLB Tail Rig Prototype — 2026-07-18

Follow-up to `docs/qa/GLB_RIGGING_AUDIT_2026-07-17.md`. That audit found none
of the 40 live GLB models have the "9-Tail System" rigged. This does the
three things proposed as next steps: (1) prototype a real tail rig on one
model, (2) trace which static models are actually load-bearing, (3) note
the pre-Meshy source-file question.

## 1. Prototype: rigging `kai-jax`'s tails

Model: `Meshy_AI_Animation_Walking_withSkin9TAILSKAIJAX.glb` (the `kai-jax`
registry key — the default player character, already rigged with a 24-bone
humanoid skeleton, chosen because it's both load-bearing and explicitly
named for this exact mechanic).

**Step 1 — confirm the geometry exists.** Rendered the model from multiple
angles in Blender before touching anything. The mesh already has all nine
tails modeled, fanned out in a fixed, frozen pose — they were sculpted as
part of the original character but never bound to bones, so they can't move
independently of the torso today. This was the open question from the prior
audit ("does tail-shaped geometry exist at all") — confirmed yes, for this
model.

**Step 2 — isolate each tail.** The mesh is topologically fragmented (5,657
disconnected micro-islands inside one 159,265-vertex mesh — typical of
Meshy-generated output, not clean production topology), so connectivity
couldn't be used to separate the 9 tails from each other or from the torso.
Also found: 115,513 of 159,265 vertices (72%) are weighted to a single
`Hips` bone as a catch-all — meaning even the "rigged" body itself has
crude, mostly-rigid skinning outside the limbs. Used k-means clustering
(k=10) on the 3D positions of Hips-weighted vertices instead: it cleanly
separated one compact torso core from 9 elongated tail lobes, matching the
visible tail count exactly (see the segmentation render sent alongside this
report — each tail is a distinct solid color, no bleed between them).

**Step 3 — build bone chains and weights.** For each of the 9 lobes, built
a 3-bone chain (`tail_0N` → `tail_0N_mid` → `tail_0N_tip`, root parented to
`Hips`) with joint positions derived from that lobe's own point cloud
(near/mid/far percentile bins by distance from the hip). Assigned vertex
weights geometrically — each vertex's position along the 3-segment chain
determines a blended weight across the two nearest bones — and removed
those vertices' old `Hips` weight so the tails aren't fighting torso
skinning as well.

**Step 4 — prove it works.** Posed the 9 new chains to a non-rest angle and
re-rendered. Compare the two side-view renders sent with this report: the
"before" shows the original frozen tail sweep; the "after" shows the same
model with the tails independently rotated into a different shape — a
different, non-frozen silhouette. That's the actual proof: the tail bones
now drive real mesh deformation, not a plausible-looking static pose.

**First pass result: real, but rough.** The rig was genuinely functional —
9 independently posable tail chains, each backed by its own geometry. But
the first back-view "after" render showed visible stretching/faceting,
worst at the tail-to-torso seam and at boundaries between adjacent tail
clusters.

**Cleanup pass.** Two of those seams were fixable programmatically, not by
hand:

1. **Tail-to-torso seam** — the first pass fully removed each tail
   vertex's `Hips` weight, creating a hard cut at the base. Fixed by
   tapering a blend of `Hips` weight back in near the root (fading out by
   ~20% of the way along the tail), so the base deforms with the torso
   instead of tearing away from it.
2. **Tail-to-tail seams** — the first pass hard-assigned each vertex to
   exactly one tail's bone chain (from the k-means cluster boundary), so
   two mesh-adjacent vertices on either side of a cluster boundary could
   get fully different bone weights. Fixed by blending each vertex between
   its two nearest tail chains near cluster boundaries instead of a hard
   cutover.

Re-tested with a **coherent sway pose** (a smooth wave-like motion across
the 9 tails) rather than the first test's alternating-direction pose,
which — deliberately or not — was an adversarial worst case for boundary
blending (neighboring tails yanked in opposite directions strains any
shared-vertex blend, hand-painted or automated). With the fixes and a
realistic pose, the result is materially cleaner: the tail-to-torso
connection holds together smoothly, and the tearing/faceting seen in the
first pass is largely gone (compare the two before/after render sets sent
alongside this report). Fine surface-level faceting remains on close
inspection — the mesh's underlying topological fragmentation (5,657
islands) puts a real ceiling on how smooth an automated pass can get — but
the result no longer reads as broken.

**What was NOT touched:** no file in `apps/web/public/models/` was
modified at any point. Both rig passes were exported to scratch paths only
(not in the repo) for this review — nothing is wired into the game and
nothing in `apps/web/src` changed.

**Verdict on tractability:** the fixed version of this pipeline (cluster →
chain → boundary-aware weight blend) is mechanically repeatable across the
other rigged-but-tailless models — it's no longer purely "bone placement
only, weights need a human." A human pass is still worth doing before
shipping (this remains an automated approximation, not hand-crafted
weight-painting), but the gap it needs to close is now touch-up, not
rescue.

## 2. Which models are actually load-bearing

Traced every `MODEL_REGISTRY` key against real usage in `apps/web/src`
(mission data, spawn tables, character-select, wave maps — not just
"exists in the registry"). Two things stood out beyond the rig question:

- **A second, parallel model-loading path exists.** `OptimizedBeastModel.tsx`
  (used by `BattlePlayer.tsx` → `BattleScene.tsx`) loads GLBs by guessing a
  filename from the fighter id (e.g. `kai_jax.glb`) instead of going through
  `MODEL_REGISTRY`/`getModelConfig` — bypassing the registry entirely and
  not matching the registry's actual filenames. Not fixed here (out of
  scope for a rigging pass), but worth its own ticket since it's a second,
  divergent source of truth for the same data.
- **Several registry keys are dead.** `korg`, `puff`, `borgos`, `volter`,
  `sabertooth`, `rift-warden`, `earth-turtle`, `frost-wolf`, `jade-serpent`,
  `thunder-lion` have no reference anywhere outside `modelRegistry.ts` — no
  mission, no spawn table, no character-select list. Rigging these would be
  wasted effort regardless of their static/rigged status.

**Rigging priority** — static models confirmed as live 3D combatants
(selectable character, mission boss, or spawned enemy), ranked by story
significance:

1. `voidonus-imperion` (`KAINJAXYN.glb`) — the campaign's final boss.
2. `synergy-hunter` (`KAITEENFOX.glb`) — story boss.
3. `void-stalker` (`darjshadowkaijax.glb`) — story boss.
4. `blazing-fox`, `sparky` — spawned as live Adventure Mode minions.
5. `neon-wraith` — spawned live story enemy.
6. `silver`, `borax`, `boryn`, `lunara`, `abyss` — selectable in Versus
   mode / used as opponents, real 3D combat, not just menu art.
7. `marble-gladiator`, `granite-colossus`, `sandstone-sentinel` —
   Versus-mode opponents only (never mission-spawned) — lower priority
   than the above but still real combat use.

**Safe to skip** (registered but no live reference found anywhere):
`korg`, `puff`, `borgos`, `volter`, `sabertooth`, `rift-warden`,
`earth-turtle`, `frost-wolf`, `jade-serpent`, `thunder-lion`.

## 3. Pre-Meshy source files

Not something I can determine from inside the repository — there's no
trace of original Meshy project files or pre-export source assets in this
codebase, only the flattened `.glb` exports. If you have access to the
original Meshy.ai project files (or any other pre-export source), that
would let a rigger start from cleaner topology/vertex groups instead of
reverse-engineering a rig from a fragmented GLB export — worth checking
before investing more effort in the geometric-clustering approach used
here.

## Suggested next step

Given the prototype works but needs a manual cleanup pass, and the
priority list above narrows "worth rigging" from 40 files down to about a
dozen genuinely load-bearing ones: the responsible next move is deciding
whether that cleanup pass happens by hand (an artist/rigger opening the
prototype GLB and correcting the seam weights in Blender) or is accepted
as a known-limitation for launch, the same way the two placeholder LoreHub
images were flagged. I did not make that call — flagging it for a decision
rather than proceeding further on my own.

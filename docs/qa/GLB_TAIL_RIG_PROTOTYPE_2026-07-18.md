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

**Result: real, not production-ready.** The rig is genuinely functional —
9 independently posable tail chains, each backed by its own geometry. But
the back-view "after" render also shows visible stretching/faceting,
worst at the tail-to-torso seam and at boundaries between adjacent tail
clusters. That's the expected cost of geometric/automated weight
assignment on a fragmented mesh with no clean vertex-group data to build
from — a human rigger would still need a manual weight-paint pass
(smoothing the seams, hand-correcting boundary vertices between tails) to
bring this to shipping quality. This matches exactly what the prior audit
predicted: bone placement can be done programmatically from good geometry,
but weight-painting quality is where automation runs out.

**What was NOT touched:** no file in `apps/web/public/models/` was
modified. The rigged prototype was exported to a scratch path only
(`kaijax_tail_rig_prototype.glb`, not in the repo) for this review — it is
not wired into the game and nothing in `apps/web/src` changed.

**Verdict on tractability:** rigging the other rigged-but-tailless models
this same way is mechanically repeatable (the clustering + chain-building
script is generic, not kai-jax-specific) — but each one still needs this
same manual weight-paint cleanup pass afterward to be shippable, so it
doesn't collapse into a batch operation. Per-model effort is dominated by
that cleanup step, not by the scripted part.

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

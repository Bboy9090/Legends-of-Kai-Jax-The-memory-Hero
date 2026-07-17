# GLB Rigging Audit — 2026-07-17

Tooling: Blender 4.0.2, installed headless in this session
(`apt-get install blender`, plus `python3-numpy` for the bundled glTF
importer, which otherwise fails to load). Every model was imported fresh
via `bpy.ops.import_scene.gltf` and its armature/bone/mesh/animation data
extracted programmatically — this is real inspection of the actual rig
data, not a guess from file names.

## Scope

`apps/web/src/assets/modelRegistry.ts` references 40 of the 85 `.glb`
files under `apps/web/public/models/` — the other 45 are unreferenced
Meshy AI iteration/test exports (duplicate `boss*.glb` variants, files
like `vviidMeshy_AI_Character_output.glb`, nested `Meshy_AI_biped-*/`
folders). Only the 40 registered models were audited; the other 45 aren't
live in the game and weren't touched.

## Headline finding

**None of the 40 live character models have anything resembling the
game's "9-Tail System."** Not one model has a bone matching `tail_01`
through `tail_09`, or any tail-chain naming convention consistent with
the lore (`data/`, `LoreHub.tsx`'s Nine-Tail System content, and the
runtime warning already known from `GLBCharacterLoader.ts`). That
runtime warning turns out to describe every single registered model, not
an isolated case.

| | Count |
|---|---|
| No armature at all (fully static mesh, 0 bones, 0 animations) | **27 / 40** |
| Has an armature, but a generic 24- or 27-bone biped rig with zero tail bones | **13 / 40** |

### The 27 static models

`BORYN.glb`, `Borax.glb`, `KAINJAXYN.glb`, `KAITEENFOX.glb`,
`SABERVILLAIN.glb`, `darjshadowkaijax.glb`, `earth_turtle.glb`,
`emberwolf_warlord.glb`, `frost_wolf.glb`, `granite_colossus.glb`,
`jade_serpent.glb`, `jaxon_beast.glb`, `lunara_solis_beast.glb`,
`marble_gladiator.glb`, `neon-wraiths.glb`, `phoenix_warrior.glb`,
`sandstone_sentinel.glb`, `shadow_panther.glb`, `thunder_lion.glb`,
`voidonus_beast.glb`, and 7 of the `Meshy_AI_*_texture.glb` files
(Ashen Tiger, Blazing Fox, Jax Kai icey fox, Jax Stormfang, Kai
sabertooth fox, Steelwolf Exosuit, Voltage Fang).

These have **zero bones and zero animation clips** — not "missing a
tail," genuinely unrigged, unanimated meshes. If any of these are used
as active combatants rather than static props/portraits, they cannot
currently play any animation in-engine at all; the game's rendering
pipeline would have to be relying on something else (a shared rig
applied at runtime, a static-pose display context, etc.) — which file
each one actually is in the live game (portrait art vs. active
combatant) wasn't traced in this pass.

### The 13 rigged models

`Meshy_AI_Animation_Running_withSkinKAIJAXVARIANTSHADOIWSonic.glb`,
`Meshy_AI_Animation_Walking_withSkin9TAILSKAIJAX.glb`,
`Meshy_AI_Animation_Walking_withSkinSPiDERKAIJAX9TIALS.glb`,
`Meshy_AI_Character_outputLIONBORAX.glb`,
`Meshy_AI_Meshy_Merged_Animations4KAI.glb`,
`Meshy_AI_Meshy_Merged_AnimationsSHADOWSONICJAXKAI.glb`, `boss.glb`,
`bosssss.glb`, `bossssss.glb`, `hyenaratvbill.glb`,
`spidersnipervillain.glb`, plus `drone.glb` and `spidersdrone.glb`.

These carry a standard 24-bone Mixamo-convention humanoid skeleton
(`Hips`, `Spine`/`Spine01`/`Spine02`, `Head`, `neck`,
`Left/RightArm`/`ForeArm`/`Hand`, `Left/RightUpLeg`/`Leg`/`Foot`/
`ToeBase`, `Left/RightShoulder`) with 1-2 baked animation clips each
(walking/running/a generic `clip0`). All of this works — the vertex
groups on the mesh correctly match every bone name (fully skinned, not
just an armature sitting unused next to the mesh) — but there is no
tail chain on any of them. `drone.glb` and `spidersdrone.glb` are the
only two files with any bone name containing "tail" at all
(`tail`, `tail1`, `tail2`, `tail3`, `tailstart`) — but these are the
drone/spider-sniper models, not Kai-Jax-family characters, so that's
almost certainly an unrelated mechanical-tail appendage on a robotic
enemy, not the lore's Nine-Tail System, and doesn't transfer to the
other 12.

## Why this isn't a "run a script and it's fixed" problem

A mechanical fix (renaming an existing but differently-named bone to
match `tail_0N`) would be safe, fast, and something I'd just do. That's
not the situation here — there is no existing tail rigging under any
name on any of the 12 non-drone rigged models, and the 27 static models
have no skeleton to attach one to in the first place.

Building a real tail rig requires, per model:

1. Confirming the mesh actually has tail-shaped geometry to rig (not
   verified in this pass — some of these may be humanoid/beast forms
   without a modeled tail at all, in which case there's nothing to
   attach bones to regardless of rigging skill).
2. Placing a bone chain that matches that specific character's tail
   geometry and silhouette — this differs per creature/character and
   isn't a copy-paste operation.
3. Weight-painting the tail mesh vertices to the new bones so it deforms
   correctly instead of the mesh either not moving or tearing when a
   tail animation plays.
4. Verifying the result in motion, in-engine — a static screenshot of a
   "rigged" tail doesn't prove it deforms correctly; that only shows up
   once it's animated and rendered through the actual game.

Steps 2-4 are a real 3D character-animation skill, not something I can
respons­ibly claim to do "to perfection" by scripting bone positions at
plausible-looking coordinates across 12-39 models and calling it done. A
wrong or careless rig on a game's core cast — the characters this whole
game's lore is built around — would be worse than the current honest gap,
and I can't visually judge deformation quality without iterating in a
render/playtest loop the way an animator would.

## What I can responsibly do next, if you want to proceed

- **Prototype on one model first.** Pick a single rigged character (a
  Kai-Jax-family model with a clear tail-capable silhouette) and build a
  real tail chain + weight paint pass on just that one, render before/
  after previews, and use that as a concrete, reviewable proof of concept
  before deciding whether to extend the approach to the rest. This is
  the honest, verifiable way to find out whether this is even tractable
  per-model in reasonable time, rather than promising 40 fixes up front.
- **Trace which of the 27 static models are actually load-bearing** (used
  as active, animated combatants vs. portrait/preview art) before
  spending any rigging effort on ones that don't need it.
- **If you have access to the original, pre-Meshy-export source files**
  (or Meshy project files with rigging still editable), that's a much
  better starting point than reverse-engineering a rig from a flattened
  GLB export.

Not done in this pass, on purpose: no GLB file was modified. This is
audit-only, matching the pattern of every other finding in this phase —
verify first, then decide, then act with a scoped, reviewable change.

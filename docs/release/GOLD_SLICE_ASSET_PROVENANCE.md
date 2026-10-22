# Gold Slice asset provenance gate

Status: **BLOCKING UNTIL EVIDENCE IS ATTACHED**

This ledger covers the ten GLB files that `apps/web/scripts/release-model-manifest.mjs`
currently permits into the Gold Slice production bundle. A filename, model-registry
comment, prior QA assertion, or the fact that an asset is present in the repository
is not proof of ownership or commercial-use rights.

| Release asset | Runtime purpose | Provenance evidence found in repository | Commercial-use status | Release gate |
| --- | --- | --- | --- | --- |
| `Meshy_AI_Animation_Walking_withSkin9TAILSKAIJAX.glb` | Kai-Jax base locomotion | Paid Meshy Pro account period verified privately; exact generation job/reference chain not located | Partially evidenced, per-asset chain unverified | BLOCK |
| `Meshy_AI_Animation_Running_withSkin9TAILSKAIJAX.glb` | Kai-Jax run | Paid Meshy Pro account period verified privately; exact generation job/reference chain not located | Partially evidenced, per-asset chain unverified | BLOCK |
| `Meshy_AI_Animation_Lunge_Spin_Kick_withSkin9TAILSKAIJAX.glb` | Kai-Jax authored attack | Paid Meshy Pro account period verified privately; exact generation job/reference chain not located | Partially evidenced, per-asset chain unverified | BLOCK |
| `Meshy_AI_Animation_Step_in_High_Kick_withSkin9TAILSKAIJAX.glb` | Kai-Jax authored attack | Paid Meshy Pro account period verified privately; exact generation job/reference chain not located | Partially evidenced, per-asset chain unverified | BLOCK |
| `Meshy_AI_Meshy_Merged_AnimationsSHADOWSONICJAXKAI.glb` | Jaxon source binary; release alias `jaxon.glb` | Paid Meshy Pro account period verified privately; exact generation job/reference chain not located. Legacy source name also requires explicit design/reference review. | Partially evidenced, per-asset chain unverified | BLOCK |
| `Meshy_AI_Animation_Walking_withSkinSPiDERKAIJAX9TIALS.glb` | Kaison source binary; release alias `kaison.glb` | Paid Meshy Pro account period verified privately; exact generation job/reference chain not located. Legacy source name requires explicit design/reference review. | Partially evidenced, per-asset chain unverified | BLOCK |
| `shadow_panther.glb` | Memory Wisp | No source/license artifact located | Unverified | BLOCK |
| `drone.glb` | Rift Drone | No source/license artifact located | Unverified | BLOCK |
| `granite_colossus.glb` | Corruption Brute | No source/license artifact located | Unverified | BLOCK |
| `darjshadowkaijax.glb` | Void Stalker / Prime | No source/license artifact located | Unverified | BLOCK |


## Account-level evidence recovered

A private account audit found paid Meshy Pro receipts covering **February 15 through
April 15, 2026**. The receipts are retained outside the public repository and this
ledger intentionally does not copy personal billing details. Current Meshy guidance
states that assets generated on a paid plan may be used commercially, subject to the
creator having rights to any source/reference material used in generation.

This is useful account-level evidence, but it does **not** identify the generation job,
generation date, privacy/publication state, or source reference for any specific GLB in
this manifest. Therefore it does not clear an individual asset row by itself.

Current Quaternius licensing permits incorporation of its assets into commercial
products without attribution, while prohibiting redistribution as standalone asset
packs. Quaternius also states that the license version in force when an asset was
obtained governs that asset. Historical project notes discuss Quaternius packs, but no
download receipt, original pack archive, or acquisition-time license file has yet been
tied to `shadow_panther.glb` or `granite_colossus.glb`. Those rows remain blocked.

## Evidence required to clear a row

At least one durable record tied to the exact asset is required: an original project
source/export record, generator job/export receipt showing the user's right to use the
output commercially, a third-party license plus source URL/version, or a signed/owned
source record that can be retained with release evidence.

For generated assets, retain the generation/export record and the governing commercial
terms that applied at creation time. For third-party assets, retain the exact license
text and attribution requirements. For internally authored assets, retain the editable
source or a provenance record linking the binary to the project.

## Release rule

Do not change a row to PASS from memory, filename inference, or a blanket statement such
as "all models are ours." Clear each binary individually. If evidence cannot be produced,
replace the asset with one whose provenance can be proven before public release.

This gate is independent of code security scans. A green dependency/security workflow
does not establish artwork/model ownership.

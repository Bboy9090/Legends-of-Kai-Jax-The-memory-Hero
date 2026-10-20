# Gold Slice asset provenance gate

Status: **BLOCKING UNTIL EVIDENCE IS ATTACHED**

This ledger covers the ten GLB files that `apps/web/scripts/release-model-manifest.mjs`
currently permits into the Gold Slice production bundle. A filename, model-registry
comment, prior QA assertion, or the fact that an asset is present in the repository
is not proof of ownership or commercial-use rights.

| Release asset | Runtime purpose | Provenance evidence found in repository | Commercial-use status | Release gate |
| --- | --- | --- | --- | --- |
| `Meshy_AI_Animation_Walking_withSkin9TAILSKAIJAX.glb` | Kai-Jax base locomotion | No purchase/export receipt, creator record, or license artifact located in the audited release files | Unverified | BLOCK |
| `Meshy_AI_Animation_Running_withSkin9TAILSKAIJAX.glb` | Kai-Jax run | No purchase/export receipt, creator record, or license artifact located | Unverified | BLOCK |
| `Meshy_AI_Animation_Lunge_Spin_Kick_withSkin9TAILSKAIJAX.glb` | Kai-Jax authored attack | No purchase/export receipt, creator record, or license artifact located | Unverified | BLOCK |
| `Meshy_AI_Animation_Step_in_High_Kick_withSkin9TAILSKAIJAX.glb` | Kai-Jax authored attack | No purchase/export receipt, creator record, or license artifact located | Unverified | BLOCK |
| `Meshy_AI_Meshy_Merged_AnimationsSHADOWSONICJAXKAI.glb` | Jaxon | No purchase/export receipt, creator record, or license artifact located; legacy filename contains a third-party-associated term and therefore requires explicit design/provenance review | Unverified | BLOCK |
| `Meshy_AI_Animation_Walking_withSkinSPiDERKAIJAX9TIALS.glb` | Kaison | No purchase/export receipt, creator record, or license artifact located; legacy filename requires explicit original-IP review | Unverified | BLOCK |
| `shadow_panther.glb` | Memory Wisp | No source/license artifact located | Unverified | BLOCK |
| `drone.glb` | Rift Drone | No source/license artifact located | Unverified | BLOCK |
| `granite_colossus.glb` | Corruption Brute | No source/license artifact located | Unverified | BLOCK |
| `darjshadowkaijax.glb` | Void Stalker / Prime | No source/license artifact located | Unverified | BLOCK |

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

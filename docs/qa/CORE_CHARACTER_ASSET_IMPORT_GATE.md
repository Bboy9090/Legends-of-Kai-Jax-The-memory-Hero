# Core Character Asset Import Gate

Kai, Jax, and Kai-Jax remain release-blocked until the owner-approved current GLBs are imported and recorded in `apps/web/src/assets/core-character-assets.release.json`.

For each character, the manifest must contain:
- `approved: true`
- the exact runtime asset path
- SHA-256 of the committed GLB
- provenance describing where the approved source came from
- an approval-receipt reference

Then set `releaseAuthority` to `approved-current` and run:

```bash
node apps/web/scripts/validate-core-character-assets.mjs
```

The validator fails closed when an asset is absent, unapproved, missing provenance, missing an approval receipt, or has a hash mismatch.

Legacy runtime files in `modelRegistry.ts` are not approval evidence. Jaxon and Kaison assets are never substitutes for Jax and Kai.

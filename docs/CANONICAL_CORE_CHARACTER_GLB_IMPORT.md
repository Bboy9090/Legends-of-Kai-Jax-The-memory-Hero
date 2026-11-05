# Canonical core-character GLB import

Store release remains blocked until approved current models for **Kai**, **Jax**, and **Kai-Jax** exist.

Use the importer only after the project owner has approved the three final GLBs:

```bash
node apps/web/scripts/import-approved-core-character-assets.mjs \
  --kai /absolute/path/Kai.glb \
  --jax /absolute/path/Jax.glb \
  --kai-jax /absolute/path/Kai-Jax.glb \
  --provenance "final-rig-pipeline-identifier" \
  --approval-receipt "owner-approval-reference" \
  --approve-current
```

Before writing anything, the importer validates all three files as GLB v2, computes SHA-256 digests, and requires both provenance and approval receipt text. It then copies the files to `public/models/canonical/` and updates the release manifest to `approved-current`.

Use `--dry-run` to inspect the proposed manifest and hashes without copying files or changing release authority.

After import, run:

```bash
node apps/web/scripts/validate-core-character-assets.mjs
```

Do not use this workflow to promote legacy, placeholder, or unapproved models merely to make store checks pass.

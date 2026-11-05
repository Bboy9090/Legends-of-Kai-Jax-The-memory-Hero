# Legends of Kai-Jax — Wave 3 Release Audit

Date: 2026-11-04

## Release truth

Do not call the current project store-ready solely from web/build CI.

The repository already records three active blocker classes:

1. **Canonical character assets** — issue #320 requires approved current Kai, Jax, and Kai-Jax source assets with provenance/hash authority, correct identity mapping, rig/material validation, and Android rendered evidence.
2. **Complete menu/mode functionality** — issue #325 requires every advertised destination to be functional end-to-end, including Continue, Story/Missions, Training, Combat Arena, Legends Archive, persistence, Android Back, safe-area/touch reachability, and action-level E2E.
3. **Physical/store qualification** — issue #264 defines Android/iOS device spread, signed artifacts, privacy/data-safety/age-rating work, screenshots, and release evidence.

## Canon/branding caution

The current README contains older wording and historical identity language. Do not replace approved later canon with text from that README without reconciling against the current character/canon authority.

In particular:
- Kai, Jax, and Kai-Jax must resolve to the approved current designs.
- Jaxon/Kaison identity mappings must stay separate from Kai/Jax game-character IDs.
- Existing legacy nine-tail/older model files are not proof of current approved art.

## Next executable wave

1. Resolve issue #320 first: locate/import approved current GLBs and create an asset-authority manifest with path/hash/provenance.
2. Add deterministic registry tests binding canonical IDs to those approved assets.
3. Run Android portrait + landscape rendered checks from a built artifact.
4. Complete issue #325 mode-by-mode, with no dead-end menu destinations.
5. Rebuild a fresh Android candidate only after the art/menu blockers are closed.
6. Run the physical-device matrix from issue #264 against the exact new artifact hash.
7. Produce store screenshots only from the qualified build.

## No-claim rule

A debug APK, Vercel success, navigation smoke test, or filename match is not enough to claim release readiness.

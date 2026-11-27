# Wave 9 candidate — portable Drive art ZIP import

**Branch:** `hardening/p1p-wave9-safe-art-zip` (candidate, NOT a certified release baseline)
**Parent:** `8b4b0ca56791c9964aa2b9f73b080aa9a02b293f` (Draft PR #392's head at branch creation)
**Issue:** #397 — system `unzip` aborts on external symlink on macOS.

## Scope and trust boundary

This candidate replaces filesystem extraction with `server/safeArtZip.ts`, a bounded ZIP32 central-directory reader with no archive member materialization. It rejects unsafe absolute/traversal/Windows paths, duplicate case-folded member names, encryption, unexpected special members, malformed header offsets, compression bombs and CRC mismatches. Unix symlinks are skipped, preserving unrelated valid sheets. Archive identity and canon-vault naming/classification remain consistent. ZIP64 and exotic encodings are unsupported.

The added `server/__tests__/safeArtZip.test.ts` covers nested PNG/GLB, Unix symlink, traversal, duplicates, encryption, CRC, forged offsets, oversized entries and truncation. The existing `server.security.test.ts` end-to-end symlink test is unchanged. A separate candidate workflow executes the full server suite.

## Certification boundary

**DO NOT merge directly into Wave 7 certified PR #392 yet.** This branch changes historically protected `server/app.ts`; it does not modify `data/checkpoints/p1p-wave7-certified/SHA256SUMS.txt`. A new independently reviewed source checkpoint, macOS test receipt, full Android debug CI and physical device tests are required to replace authority. The original Wave 7 checksums remain preserved exactly.

**Status:** candidate implementation pending CI and macOS parity; not store-release qualified.

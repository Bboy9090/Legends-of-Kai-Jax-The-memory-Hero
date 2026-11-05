import { describe, expect, it } from 'vitest'
import { Buffer } from 'node:buffer'
import {
  buildApprovedManifest,
  sha256,
  validateGlbBuffer,
} from '../../../scripts/import-approved-core-character-assets.mjs'

function glb(payload = Buffer.alloc(0)) {
  const buffer = Buffer.alloc(12 + payload.length)
  buffer.write('glTF', 0, 4, 'ascii')
  buffer.writeUInt32LE(2, 4)
  buffer.writeUInt32LE(buffer.length, 8)
  payload.copy(buffer, 12)
  return buffer
}

describe('canonical core-character GLB import contract', () => {
  it('accepts only structurally valid GLB v2 headers', () => {
    expect(() => validateGlbBuffer(glb(), 'kai')).not.toThrow()
    expect(() => validateGlbBuffer(Buffer.from('not-a-glb'), 'kai')).toThrow()
    const wrongVersion = glb()
    wrongVersion.writeUInt32LE(1, 4)
    expect(() => validateGlbBuffer(wrongVersion, 'kai')).toThrow(/version/)
  })

  it('computes stable sha256 evidence', () => {
    expect(sha256(glb())).toMatch(/^[a-f0-9]{64}$/)
  })

  it('builds approved-current manifest only from all three asset hashes', () => {
    const manifest = buildApprovedManifest(
      { schemaVersion: 1, releaseAuthority: 'blocked-pending-approved-assets', characters: {} },
      {
        kai: { sha256: 'a'.repeat(64) },
        jax: { sha256: 'b'.repeat(64) },
        'kai-jax': { sha256: 'c'.repeat(64) },
      },
      'canonical-model-pipeline-2026-11',
      'owner-approval-receipt-001',
    )
    expect(manifest.releaseAuthority).toBe('approved-current')
    expect(manifest.characters.kai).toMatchObject({
      approved: true,
      path: '/models/canonical/kai.glb',
      sha256: 'a'.repeat(64),
    })
    expect(manifest.characters.jax.approvalReceipt).toBe('owner-approval-receipt-001')
    expect(manifest.characters['kai-jax'].provenance).toBe('canonical-model-pipeline-2026-11')
  })
})

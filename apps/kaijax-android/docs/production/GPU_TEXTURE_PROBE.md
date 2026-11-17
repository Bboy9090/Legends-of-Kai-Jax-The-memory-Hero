# Kai-Jax — WebGL texture-error diagnostic (Issue #396)

**Status: diagnostic implementation only; no physical GPU certification.**

Wave 8's Android 17 / WebView 145 / SwiftShader log reported repeated
`GL_INVALID_VALUE : glGenerateMipmap: <- error from previous GL command`.
The read-only GLB audit passed (64 GLBs, 236 embedded images, zero invalid /
oversized / unknown dimensions). This does **not** exonerate procedural textures,
PMREM render targets, browser GL state, or device drivers.

## Enable the opt-in probe

1. On an authorized development build or debug URL, append `?gpuProbe=1`
   **before** starting a new page session. For example,
   `http://127.0.0.1:3000/?gpuProbe=1`.
2. Reproduce the issue (Ashblock entry, district travel, hero/enemy GLB streaming,
   context loss/recovery). Use a debugger / DevTools console to inspect:

   ```js
   window.__KAIJAX_GPU_PROBE__?.snapshot()
   ```

3. Save the returned JSON with the **WebView version**, device/GPU/driver,
   affected district and exact reproduction sequence. Do **not** include
   credentials, local personal paths or player saves in an issue attachment.
4. Compare the **first** error with the preceding calls and recorded
   dimensions. The JSON field is deliberately named `afterOperation`, not
   `causedBy`: WebGL errors may be from an earlier command.
5. Repeat with the flag absent to compare normal rendering. The probe is
   diagnostic-only: it calls `getError()` after selected texture operations,
   which consumes error state and may change performance and third-party
   debugging behavior. **Never use probe-enabled runs for FPS benchmarks.**

## Safety and constraints

- No model binaries, image contents, URL strings or textures are modified.
- The probe only records numeric GL enums, reported image dimensions,
  source object type and a bounded recent-op buffer (12 operations, 32 errors).
- It is installed on the existing WebGL2 context after engine construction.
  **It cannot observe constructor-time initialisation** (including initial
  PMREM/renderer creation), nor does it inspect all GL operations.
- On unmount the original WebGL methods are restored. If installing the
  wrappers is refused by the host WebGL implementation, the probe cannot
  provide full coverage. This must be reported, not assumed away.
- Physical Adreno and Mali qualification remains an independent release gate.

## Repeatable automated checks

```bash
npm run test:server
node --test scripts/__tests__/audit-glb-textures.test.mjs
node scripts/audit-glb-textures.mjs --strict --json
```

The server test glob includes `webgl.textureProbe.test.ts`, which validates
metadata-only output, recovery of original WebGL methods and bounded error
attribution. GitHub CI is the authority for the current branch's results.

**Resolution requires reproducible GPU error evidence, a specific corrected
root cause, and real-device Android/WebView validation.** The debug probe alone
does not close issue #396.

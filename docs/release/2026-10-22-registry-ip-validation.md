# Registry and production artifact repair validation

Source parent: `f5d4ca2863c3dca7761994f9f15b4ef2e389f3e7`.

The source registry validator now resolves string constants and production/source ternaries with a restricted parser. It validates both branches and rejects unsupported expressions instead of silently dropping entries. Existing skeleton and tail policies are unchanged. CI executes parser regression tests before GLB validation.

The web roster imports its specific shared data module rather than the shared barrel, avoiding unused upgrade code in the production bundle. Acoustic roster labels use Resonance Blast/resonance_attacks. Stored upgrade identifiers and the artifact audit are unchanged.

Local verification on the modified source tree:
- 255 unit tests in 37 files passed.
- 18 registry parser regression tests passed.
- All 51 source registry entries parsed and passed current GLB policies.
- Production Vite build passed; model payload 148.14 MB, below 180 MB budget.
- Production lexical artifact audit passed: 17 prohibited terms absent.

Full-project TypeScript reports 25 diagnostics in unused UI dependencies and storyMode. The green hosted Full TypeScript Diagnostic workflow is non-blocking and does not prove full type correctness. Active release-graph type verification is reported separately in the PR.

This evidence does not establish canonical character approval, authored punch quality, physical mobile performance, signed store qualification, or production release readiness. Existing cosmetic tail deferral remains explicit; no full canonical rig anchor is certified by this validator result. PR 291 remains Draft.

# Bloodward Versus Roster Audit

Status: active canon review for `feature/fighter-select-v2`.

## Authority

Narrative authority for this pass is the current publication-locked **LEGENDS OF KAI-JAX — VOLUME I: BLOODWARD** material supplied during the active release-certification pass. Older Gold Slice / visual-baseline material is reference-only when it conflicts with Bloodward.

## Confirmed current-canon combat identities

| ID / Candidate | Canon role | Versus status | Notes |
|---|---|---|---|
| `kai` | Core protagonist | CONFIRMED | Four articulated spider limbs; Myrr'Kai + Pyraxis inheritances explicitly manifest in Bloodward. |
| `jax` | Core protagonist | CONFIRMED | Stormmane; Kar-Voth + Thryxen inheritances explicitly manifest in Bloodward. |
| `kai-jax` | Convergence/fusion identity | CONFIRMED IDENTITY, IMPLEMENTATION GATED | Treat as a separate identity only where current canon supports the convergence event and player-choice rules. Do not alias silently to `kaijax`. |
| `boryn` | Father/guardian; former Vharok trainee | STRONG PLAYABLE CANDIDATE | Combat-trained, repeatedly fights/protects, Pyraxis-linked ember inheritance. |
| `borax` | Boryn's brother; storm-line fighter | STRONG PLAYABLE CANDIDATE | Combat-trained; storm pressure and Thryxen-linked inheritance. |
| `vharok` | Elder Fang / coercive antagonist | VILLAIN CANDIDATE | **Not an ally.** Bloodward shows Vharok manipulating the sovereign-selection doctrine and helping design the hunt/containment architecture. |
| `ulgorr` | Primary ancient antagonist / Architect origin | BOSS CANDIDATE | Current prologue authority; opposing force to the First Sabertooths. |
| `kar-voth` | First Fang | LEGENDARY/BOSS-CLASS PLAYABLE CANDIDATE | Gold displacement, overwhelming forward-force combat. |
| `thryxen` | Storm Sovereign | LEGENDARY/BOSS-CLASS PLAYABLE CANDIDATE | Storm/pressure law manipulation. |
| `pyraxis` | Bloodward Titan | LEGENDARY/BOSS-CLASS PLAYABLE CANDIDATE | Ember/blood-fire tank/protector identity. |
| `myrr-kai` | Memory Eater / ancient godline | LEGENDARY/BOSS-CLASS PLAYABLE CANDIDATE | Memory silk, four articulated spider limbs, three marked tails. |
| `behemoth` | Harvested-memory engineered horror | BOSS CANDIDATE | Major prologue threat; species-shifting composite body. |
| `old-moss` | Ashblock ally | SUPPORT/PLAYABILITY UNCERTAIN | Rootwood cane and plant-memory craft; canon ally, but full versus suitability not yet proven. |
| `rikka` | Ashblock ally | SUPPORT/PLAYABILITY UNCERTAIN | Ember utility shown; needs more direct combat evidence before unlockable fighter status. |
| `mirek` | Ashblock ally | SUPPORT/PLAYABILITY UNCERTAIN | Burrow/maintenance specialist; strong utility, combat suitability not yet proven. |
| `miri` | Survivor/ally | STORY-ONLY UNTIL PROVEN | Current material establishes autonomy/identity arc; do not mark default-playable without combat evidence. |

## Current code conflicts

`apps/web/src/lib/versusRoster.ts` currently derives authority from `LEGENDS_OF_KAI_JAX_LOCKED_VISUAL_LIBRARY_BASELINE.zip`. That baseline is no longer sufficient as the primary narrative authority for Fighter Select V2.

Known conflict:

- `vharok` is currently classified as `faction: "core", role: "ally"` in the selector allowlist. Bloodward contradicts that classification. He must be reclassified before release certification.

Known identity risk:

- Legacy combat registry uses `kaijax` while Fighter Select V2 allowlist uses `kai-jax`. These must not coexist as accidental aliases. A deliberate migration/alias rule is required before saves/unlocks are certified.

## Do not auto-promote yet

The following selector entries remain **UNVERIFIED AGAINST BLOODWARD** in this audit and must not be assumed current merely because an older visual sheet contains them:

- Aurelion
- Selene
- Sable Nine
- Widow of the Alley
- Varkesh the Grafted
- Sybeth the Choir Mother
- Ironvein Overseer
- Korthyx Prime
- Pillar Twins
- Hollow Architect
- Fang Colossus
- Erasure Choir

Likewise, legacy `characters.ts` entries such as Malakor, Voidonus, Lunara, Solaro, Silver, Blaze, Apex, etc. require current-authority confirmation before being treated as Bloodward-era versus canon.

## Next safe implementation steps

1. Reclassify Vharok out of the ally/core bucket.
2. Add a Bloodward-era faction bucket for Elder Fang / Fang-order antagonists instead of forcing him into the Covenant if current canon does not state direct membership.
3. Define one canonical `kai-jax` gameplay ID and a deliberate legacy alias/migration path from `kaijax` if needed.
4. Continue source extraction for named Bloodward combatants and bosses.
5. Only then prune/add Fighter Select V2 entries and wire portrait locks.
6. Run roster validation before opening/merging the Fighter Select V2 PR.

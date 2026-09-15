# Bloodward Versus Roster Audit

Status: active canon gate for Phase C Fighter Select V2.

## Authority

Narrative authority for this pass is the current publication-locked **LEGENDS OF KAI-JAX — VOLUME I: BLOODWARD** material used during the active release-certification pass. Older Gold Slice, Smash-parallel, visual-baseline, and legacy combat-registry material is reference-only whenever it conflicts with Bloodward.

A visual sheet proves appearance provenance only. It does not automatically prove a current story role, faction, unlock state, or playable status.

## Publication-safe public versus allowlist

The public `VERSUS_ROSTER` is now intentionally limited to 12 identities supported by the current Bloodward authority:

| ID | Current classification | Default Arena state | Notes |
|---|---|---:|---|
| `kai` | Core protagonist | UNLOCKED | Myrr'Kai + Pyraxis; four spider limbs; memory/web/venom/ember identity. |
| `jax` | Core protagonist | UNLOCKED | Kar-Voth + Thryxen; storm/pressure/lightning/displacement identity. |
| `boryn` | Father/guardian | UNLOCKED IN ARENA | Chronology-safe through Legends Archive / Memory Simulation framing; story death remains authoritative. |
| `borax` | Storm ronin / mentor | UNLOCKED IN ARENA | Precision, counters, judgment, storm discipline. |
| `kai-jax` | Fusion identity | STORY-GATED | Base fusion begins with exactly 3 tails. Public ID is `kai-jax`; legacy combat implementation bridge is explicit as `kaijax`. |
| `vharok` | Bloodward antagonist | LOCKED | Not an ally. |
| `kar-voth` | First Sabertooth / First Fang | LOCKED | Current portrait + dedicated gameplay integration pending. |
| `thryxen` | First Sabertooth / Storm Sovereign | LOCKED | Current portrait + dedicated gameplay integration pending. |
| `pyraxis` | First Sabertooth / Bloodward Titan | LOCKED | Current portrait + dedicated gameplay integration pending. |
| `myrr-kai` | First Sabertooth / Memory Eater | LOCKED | Current portrait + dedicated gameplay integration pending. |
| `ulgorr` | Ancient antagonist / boss candidate | LOCKED | Current publication source supports the identity; final encounter chronology remains story-controlled. |
| `behemoth` | Engineered-horror boss candidate | LOCKED | Current portrait + dedicated gameplay integration pending. |

## Resolved code conflicts

- Vharok is no longer classified as a core ally.
- Kai-Jax is no longer default unlocked.
- The canonical identity remains `kai-jax`; `kaijax` exists only as an explicit legacy combat-profile migration bridge.
- Older visual-sheet identities are no longer auto-promoted into the public versus allowlist simply because artwork exists.
- First Sabertooths remain visible to the roster system but locked until current character-lock portraits and dedicated gameplay implementations are ready.
- Ulgorr is not forced into the Anti-Sabertooth Covenant faction merely to fill a bucket; he is classified as an ancient antagonist until a more specific current source requires otherwise.

## Deliberately excluded until current-authority verification

The following identities remain outside the public `VERSUS_ROSTER` until the current Bloodward authority confirms the needed role/playability details:

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

Support characters such as Old Moss, Rikka, Mirek, and Miri are not automatically versus fighters merely because they are story-valid characters. Combat suitability and unlock rules require their own evidence.

Legacy `characters.ts` entries such as Malakor, Voidonus, Lunara, Solaro, Silver, Blaze, Apex, Voltage Fang, Steelwolf, Ashen Tiger, Blazing Fox, Velocity, and similar profiles remain implementation/prototype material unless and until the current publication authority promotes them. Their existence in a legacy registry is not canon proof.

## Arena chronology rule

Combat Arena is a chronology-safe simulation surface. It may support historical, deceased, mentor, or impossible matchups through Legends Archive, Memory Simulation, training, or challenge framing. Arena availability never silently restores a canonical death or turns a simulation into a literal story event.

## Remaining gates

1. Add current character-lock portraits for Kar-Voth, Thryxen, Pyraxis, Myrr'Kai, Ulgorr, and Behemoth before public unlock.
2. Add dedicated combat implementations for locked identities rather than silently borrowing unrelated profiles.
3. Wire the actual story progression rule that unlocks `kai-jax`; score/XP must not buy fusion or tails.
4. Preserve base Kai-Jax at exactly 3 tails and keep later tail progression story/emotion gated.
5. Continue source extraction before promoting any excluded identity.
6. Run `validate-fighter-roster.ts`, unit tests, runtime smokes, and production-preview smoke on the exact final head before merge review.

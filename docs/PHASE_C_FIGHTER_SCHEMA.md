# Phase C Fighter Schema v2 — Canon-Safe Registry

**Purpose:** Define fighters without allowing prototype archetypes, legacy registry entries, or asset-store placeholders to become story canon by accident.  
**Status:** Active Phase C authority for new fighter integration.  
**Primary game:** cinematic action-adventure.  
**Secondary mode:** Combat Arena / Training / Archive simulation.

---

## 1. Non-Negotiable Rules

1. Story canon comes from the current publication/manuscript authority and approved visual locks, not from an old code registry.
2. Every fighter must carry an explicit `canonStatus` before art, rigging, balancing, or public exposure begins.
3. Prototype names such as Velocity, Kaison, Voltage Fang, Steelwolf, Ashen Tiger, and Blazing Fox remain reusable implementation templates only unless a current source explicitly promotes them.
4. Kai and Jax are the mechanical center of the game and must not collapse into generic speed/heavy archetypes.
5. Kai-Jax is story-earned. Base fusion begins with exactly **3 tails**. Later tails are narrative progression, and the ninth tail is a late-story coronation milestone rather than a purchasable upgrade.
6. Historical or deceased characters may be playable in Combat Arena only through chronology-safe framing such as Legends Archive, Memory Simulation, training, flashback, or challenge reconstruction.
7. Story Mode is the primary product. Fighter data must include traversal, exploration, environment, narrative-unlock, and chronology fields—not only arena combat data.

---

## 2. Canon Status

```ts
export type CanonStatus =
  | "story-canon"
  | "historical-canon"
  | "arena-canon"
  | "prototype-only"
  | "canon-decision-required";
```

Meaning:

- `story-canon` — confirmed in the current story authority and valid for literal story use where chronology permits.
- `historical-canon` — confirmed character, but current-story appearance requires memory/archive/flashback framing.
- `arena-canon` — allowed as an Arena/Training representation without implying literal story chronology.
- `prototype-only` — implementation or balance template; never public lore.
- `canon-decision-required` — useful work exists, but current authority is insufficient. Do not invent missing biography, faction, powers, death status, or chronology.

---

## 3. Fighter Definition

```ts
export interface FighterDefinitionV2 {
  schemaVersion: "2.0";
  id: string;
  displayName: string;
  enabled: boolean;

  canon: {
    status: CanonStatus;
    sourceAuthority: string[];
    visualAuthority: string[];
    chronologyNotes: string[];
    unresolvedDecisions: string[];
  };

  identity: {
    role: "hero" | "ally" | "villain" | "boss" | "historical" | "prototype";
    faction: string;
    species: string;
    era: "modern-raging-city" | "ancient" | "historical" | "mixed";
    lineage: string[];
    costumeAuthority: "modern-raging-city" | "ancient-war" | "storm-ronin" | "source-locked";
  };

  availability: {
    storySelectable: boolean;
    storyUnlock: string;
    arenaSelectable: boolean;
    arenaUnlock: string;
    trainingSelectable: boolean;
    chronologyFraming: string;
  };

  gameplayIdentity: {
    movementIdentity: string;
    combatPersonality: string;
    traversalAbility: string;
    defensiveIdentity: string;
    weakness: string;
    technicalDifficulty: 1 | 2 | 3 | 4 | 5;
  };

  stats: {
    health: number;
    mobility: number;
    airControl: number;
    strength: number;
    defense: number;
    guard: number;
    recovery: number;
    reach: number;
    control: number;
    burst: number;
    traversal: number;
    memoryResistance: number;
    ancestralOutput: number;
    fusionCompatibility: number;
  };

  resources: Array<{
    id: string;
    displayName: string;
    max: number;
    storyGated: boolean;
    notes: string;
  }>;

  moves: {
    normalAttackIdentity: MoveDefinition[];
    heavyAttackIdentity: MoveDefinition[];
    launcher: MoveDefinition | null;
    aerial: MoveDefinition[];
    defense: MoveDefinition[];
    dodge: MoveDefinition[];
    traversal: MoveDefinition[];
    signatures: MoveDefinition[];
    ancestralAbility: MoveDefinition[];
    teamAssist: MoveDefinition[];
    environmentInteraction: MoveDefinition[];
    fusionInteraction: MoveDefinition[];
    ultimate: MoveDefinition[];
  };

  fusion: {
    eligible: boolean;
    partnerId: string | null;
    storyUnlocked: boolean;
    baseTailCount: number | null;
    tailProgressionStoryGated: boolean;
    requirements: string[];
  };

  model: {
    sourceType: "project-original" | "meshy-base" | "asset-library" | "contractor" | "placeholder";
    gltfPath: string;
    desktopHighDetailPath?: string;
    mobileLodPath?: string;
    targetMobileSizeKB: number;
    scale: number;
    rigProfile: string;
    requiredExtraAppendages: string[];
    tailCount: number | null;
  };

  provenance: {
    provider: string;
    assetOrigin: string;
    licenseOrTerms: string;
    commercialUseVerified: boolean;
    modificationNotes: string;
    evidenceLocation: string;
  };

  animations: Record<string, AnimationDefinition>;
  audio: Record<string, string>;

  ai: {
    personality: string;
    preferredRange: "close" | "mid" | "long" | "adaptive";
    punishProfile: string;
    traversalAwareness: boolean;
    environmentAwareness: boolean;
  };

  platform: {
    desktopQualityProfile: string;
    mobileQualityProfile: string;
    touchLayoutProfile: string;
    requiredLods: number;
  };
}

export interface MoveDefinition {
  id: string;
  name: string;
  input: string;
  animation: string;
  damage: number;
  startupFrames: number;
  activeFrames: number;
  recoveryFrames: number;
  resourceCost: number;
  cooldownMS: number;
  hitProperties: string[];
  traversalUse: boolean;
  environmentUse: boolean;
  storyGate: string | null;
  notes: string;
}

export interface AnimationDefinition {
  clip: string;
  loop: boolean;
  speed: number;
  required: boolean;
}
```

---

## 4. Required Gameplay Identity Fields

The old `speed | heavy | electric | tank | technical | balanced` field is deprecated as a public design authority. It may remain in internal balancing spreadsheets only.

Every final fighter must answer all of these instead:

- Movement identity
- Normal attack identity
- Heavy attack identity
- Launcher
- Aerial identity
- Defense
- Dodge
- Traversal ability
- Signature 1
- Signature 2
- Signature 3
- Ancestral ability
- Team / assist behavior
- Environment interaction
- Fusion interaction
- Ultimate or story-gated power
- Weakness
- Resource cost model
- Combat personality

This keeps Kai, Jax, Boryn, Borax, and later canon fighters mechanically distinct rather than reskinning one five-move template.

---

## 5. Expanded Stats

Use a normalized **1-10** design scale for identity planning. Runtime values may map to different numerical ranges.

Required planning stats:

- Health
- Mobility
- Air Control
- Strength
- Defense
- Guard
- Recovery
- Reach
- Control
- Burst
- Traversal
- Memory Resistance
- Ancestral Output
- Fusion Compatibility
- Technical Difficulty

Do not use XP level to increase lineage authority, tail count, or fusion legitimacy.

---

## 6. Kai Lock

Kai is not a generic agile fighter.

Required identity:

- Fully nonhuman heroic Beast-Kin.
- Equal dominant Myrr’Kai + Pyraxis inheritance.
- Four visible and functional spider limbs.
- Memory-web tracing, binding, traversal, rescue, and environmental interaction.
- Venom-charged close combat.
- Ember / fire protection and endurance expression.
- Wall movement and aerial redirection.
- Modern Raging City streetwear under the approved visual lock.

Minimum rig requirements:

```json
{
  "rigProfile": "kai-six-limb-beastkin-v1",
  "requiredExtraAppendages": [
    "spider-limb-upper-left",
    "spider-limb-upper-right",
    "spider-limb-lower-left",
    "spider-limb-lower-right"
  ]
}
```

A base mesh or animation solution that cannot support the four spider limbs is not production-ready for Kai.

---

## 7. Jax Lock

Jax is not "Kai but faster."

Required identity:

- Fully nonhuman heroic Beast-Kin.
- Dominant Kar-Voth + Thryxen inheritance.
- Storm, lightning, pressure, displacement, sovereignty.
- Camera-relative ground and air movement.
- Displacement as traversal and combat positioning, not cosmetic VFX.
- Air control and pressure manipulation as a distinct movement language.
- Modern Raging City streetwear under the approved visual lock.

Current functional systems already establish the direction for ground/air displacement, swept displacement collision, StormAir authority, pressure knockback, and lightning targeting. New data must conform to those systems rather than replacing them with a generic electric archetype.

---

## 8. Boryn Lock

Required gameplay identity:

- Father / guardian / protector.
- Interception, guarding, ally protection, body-blocking, endurance, heavy retaliation.
- Protection and sacrifice must appear mechanically.
- Do not reduce Boryn to "slow tank."
- Story chronology must preserve his canonical sacrifice; later Arena availability uses archive/training/memory framing.

---

## 9. Borax Lock

Required gameplay identity:

- Storm Ronin mentor.
- Precision, stance discipline, counters, parries, deliberate displacement, judgment and punish play.
- Technical superiority rather than inflated raw stats.
- Ancient / ronin visual authority where the source requires it.
- Mentor/Arena use must not erase Boryn’s role as father.

---

## 10. Kai-Jax Lock

```json
{
  "id": "kai-jax",
  "fusion": {
    "eligible": true,
    "partnerId": null,
    "storyUnlocked": false,
    "baseTailCount": 3,
    "tailProgressionStoryGated": true,
    "requirements": [
      "canonical convergence event",
      "sufficient synchronization",
      "story unlock recorded in profile"
    ]
  }
}
```

Rules:

- Canonical public ID is `kai-jax`.
- Legacy `kaijax` may exist only as a documented implementation bridge.
- Base fusion has exactly **3 tails**.
- Four spider limbs remain present.
- All four ancestral godlines are represented.
- No purchase, score threshold, XP level, or generic upgrade may grant the ninth tail.
- Nine tails are a late-story culmination, not the default render.

---

## 11. Ancestral Lines as Mechanics

Do not model the First Sabertooths as simple damage-element tags.

- **Kar-Voth:** electricity, displacement, initiation, overwhelming forward force.
- **Thryxen:** storm, wind, pressure, law, air-space authority.
- **Pyraxis:** fire, protection, sacrifice, endurance.
- **Myrr’Kai:** memory, web, venom, continuity, fusion.

A fighter definition may reference one or more lines only when the current canon authority supports that inheritance.

---

## 12. Animation Requirements

Core clips remain useful, but appendage and traversal requirements are fighter-specific.

Baseline:

- idle
- walk
- run
- jump-start
- airborne
- land
- light attack chain
- heavy attack
- hit reaction
- guard / parry where applicable
- dodge
- victory / defeat

Character-specific additions may include:

- Kai spider-limb locomotion, wall movement, web zip, web bind, aerial redirection
- Jax displacement start/end, hover, pressure burst, lightning targeting
- Boryn intercept, guard stance, protection reaction, heavy retaliation
- Borax ronin stance changes, parry/counter, judgment finisher
- Kai-Jax fusion entrance/exit, multi-lineage traversal, three-tail base idle/locomotion

Missing required character-specific clips must fail production validation even if the generic eleven clips exist.

---

## 13. Asset and Provenance Gate

Meshy may be used for a base mesh or multi-view aid. It is not allowed to redesign established characters or dictate the production rig.

Before an asset reaches `story-canon` or `arena-canon` production status, record:

- provider / artist
- source URL or project file origin
- license / terms evidence
- commercial-use status
- modification history
- visual-lock comparison
- rig compatibility
- model / texture / font / audio provenance as applicable

If commercial-use evidence is missing, `commercialUseVerified` must remain `false` and the asset cannot be release-certified.

---

## 14. Platform Rules

One fighter definition serves the shared game. Platform differences belong in quality/input profiles, not separate lore or gameplay identities.

Desktop / laptop:

- flagship visual profile
- high-detail mesh where available
- full particles / fur / cloth within performance budget

Phone / tablet:

- mobile LOD
- reduced fur cards / particles / cloth as needed
- touch-safe controls
- resumable presentation

Performance target for current Phase C integration testing remains **60 fps target / 57 fps acceptable floor** until a later release gate replaces it with measured hardware-specific budgets.

---

## 15. Validation Rules

A fighter definition fails validation when any of the following is true:

1. `canon.status` is missing.
2. `storySelectable` is true for `prototype-only` or `canon-decision-required` content.
3. `sourceAuthority` is empty for story-facing canon.
4. Kai lacks four spider-limb rig requirements.
5. Kai-Jax base tail count is anything other than 3.
6. Kai-Jax is default story-unlocked.
7. Tail progression is tied to XP, score, currency, purchase, or generic fighter level.
8. A dead/historical character is used literally in present-day story without chronology framing.
9. Asset license/commercial-use evidence is missing for a release candidate.
10. The model cannot satisfy the character’s traversal/appendage requirements.
11. A prototype archetype is promoted to public canon without a current source.
12. Story-facing lore is invented to fill a missing field instead of recording `canon-decision-required`.

---

## 16. Current Phase C Public Priority

Current production priority:

1. Kai
2. Jax
3. Boryn
4. Borax
5. Kai-Jax — story-gated
6. Current-authority Book One enemy / boss representative only when the publication source confirms the exact identity and chronology

First Sabertooths and additional bosses may be added after dedicated gameplay profiles, visual locks, chronology rules, and provenance are complete.

Prototype archetype work may be retained as internal motion/balance experiments, but it must not consume final-character art budget ahead of the canon cast.

---

## 17. File Organization

Recommended structure:

```text
apps/web/public/data/fighters/
  canon/
    kai.json
    jax.json
    boryn.json
    borax.json
    kai-jax.json
  historical/
  bosses/
  prototypes/

apps/web/public/models/fighters/
  canon/
  historical/
  bosses/
  prototypes/
```

Do not infer canon status from directory location alone. The JSON `canon.status` field remains authoritative.

---

## 18. Phase C Success Gate for Fighter Data

Before calling the first roster batch complete:

- Six canon-aligned fighter definitions or explicit `CANON DECISION REQUIRED` placeholders exist.
- Kai and Jax have visibly and mechanically different traversal/combat identities.
- Kai-Jax is story-gated and base-locked to 3 tails.
- Boryn and Borax preserve father/mentor chronology.
- Story Mode unlock rules and Arena unlock/framing rules are separate.
- Character-specific rig/animation requirements are documented.
- Asset provenance is recorded.
- At least one Raging City gameplay environment supports the traversal identities being tested.
- Performance is measured rather than assumed.
- No prototype-only name, biography, faction, visual, or power is silently promoted to canon.

This schema supersedes the generic Phase C v1 speed/heavy/electric/tank/technical/balanced template for public fighter design.
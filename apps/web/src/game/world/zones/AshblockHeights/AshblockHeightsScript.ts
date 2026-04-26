/**
 * AshblockHeightsScript — Canon-locked narrative beats for Act I / District-1.
 *
 * STRUCTURE: Every encounter follows the 5-step cinematic spec:
 *   1. scene_entry  — Atmosphere / setting (narrator-led)
 *   2. objective    — Character objective (Boryn or Kaison sets the goal)
 *   3. conflict     — Conflict / tension (antagonist appears, stakes rise)
 *   4. escalation   — Combat triggers (line that bleeds into the wave spawn)
 *   5. payoff       — Resolution / aftermath (Boryn re-frames what was learned)
 *
 * CANON: Lines are hand-written and locked. No LLM. No ad-lib.
 * Voice rules are enforced by `validateAshblockScript()` which is also run
 * as a build-time test — any drift from canon fails CI.
 *
 * LORE TIES (do not break):
 *   - Boryn = Pyraxis echo (Sacrifice / Endurance / Shield) — warm father, orange.
 *     Every line carries the weight of his coming sacrifice (Book 1 ending).
 *   - Boryx Zenith = Thryxen echo (Law / Pressure / Authority) — cold mentor, cyan.
 *     ABSENT from Ashblock. Reserved for Book 2. Validator keeps his rules ready.
 *   - Kaison = Myrr'Kai echo (Memory / Adaptation / Fusion) — Arachnid-Kitsune-Wolf
 *     hybrid orphan with spider-sense. Voice is observant, fragmented, soft.
 *   - Jaxon = Electric Velocity strand. Absent from Ashblock pre-fusion.
 *   - Fang Syndicate = scout packs running Ashblock. Kar-Voth (Hunger) echo.
 *     Predatory, sense-driven, never philosophical.
 */

import { ASHBLOCK_ENCOUNTERS } from "./AshblockHeightsEncounters";

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

export type BeatStep =
  | "scene_entry"
  | "objective"
  | "conflict"
  | "escalation"
  | "payoff";

export type SpeakerId =
  | "narrator"
  | "boryn"
  | "boryx"
  | "kaison"
  | "jaxon"
  | "fang_scout"
  | "block_captain";

export type Tone =
  | "narrative"   // Narrator only
  | "warm"        // Boryn (Pyraxis / Sacrifice)
  | "cold"        // Boryx Zenith (Thryxen / Law)
  | "memory"      // Kaison (Myrr'Kai / Memory)
  | "electric"    // Jaxon (Velocity strand)
  | "hungry"      // Fang Syndicate scouts (Kar-Voth)
  | "commanding"; // Block / pack captains (Kar-Voth, structured)

export interface NarrativeLine {
  speaker: SpeakerId;
  text: string;
  tone: Tone;
}

export interface NarrativeBeat {
  step: BeatStep;
  /** One or more lines composing this beat. Beats can be silent narration only. */
  lines: NarrativeLine[];
  /**
   * Optional camera/atmosphere hint consumed by the cinematic overlay.
   * Pure data — no Three.js coupling here.
   */
  fx?: "fade_in" | "fade_out" | "ember_drift" | "neon_flicker" | "camera_shake_soft";
}

export interface EncounterScript {
  /** Matches an EncounterSpec.id from AshblockHeightsEncounters.ts */
  encounterId: string;
  /** Display title for the cinematic overlay header */
  title: string;
  /** 5 beats, in order: scene_entry → objective → conflict → escalation → payoff */
  beats: NarrativeBeat[];
}

// ────────────────────────────────────────────────────────────────────────────
// CANON LOCK — enforced by validateAshblockScript()
// ────────────────────────────────────────────────────────────────────────────

const SPEAKER_TO_TONE: Record<SpeakerId, Tone> = {
  narrator: "narrative",
  boryn: "warm",
  boryx: "cold",
  kaison: "memory",
  jaxon: "electric",
  fang_scout: "hungry",
  block_captain: "commanding",
};

/**
 * Phrases that must NEVER appear in a given speaker's lines.
 * Case-insensitive substring check.
 */
const FORBIDDEN_PHRASES: Partial<Record<SpeakerId, string[]>> = {
  // Boryn carries Pyraxis's sacrifice — never dismissive, never cold.
  boryn: [
    "weakling",
    "pathetic",
    "you bore me",
    "shut up",
    "die already",
    "useless",
    " lol",
    "lmao",
    "whatever",
  ],
  // Boryx is Thryxen's echo — never warm, never paternal.
  boryx: [
    "kid",
    "son",
    "i've got you",
    "i got you",
    "you did good",
    "stay tight",
    "love you",
    "buddy",
    "pal",
  ],
  // Kaison is observant Memory — never bravado, never command.
  kaison: [
    "i'll kill you",
    "easy",
    "weakling",
    "pathetic",
    " lol",
  ],
  // Fang scouts are predators — no philosophy, no soft register.
  fang_scout: [
    "memory",   // they don't speak in lore-terms
    "legacy",
    "i'm sorry",
    "please",
    "kid",      // they dehumanise
  ],
  // Block captains are structured authority — predatory but commanding.
  block_captain: [
    "i'm sorry",
    "please",
    "buddy",
  ],
};

/**
 * Required canon markers — at least ONE of these must appear across each
 * speaker's lines in the script (so we never lose voice mid-rewrite).
 */
const REQUIRED_VOICE_MARKERS: Partial<Record<SpeakerId, string[]>> = {
  boryn: ["kid", "stay", "block", "remember", "breathe", "tight", "back to back", "good"],
  kaison: ["something", "above", "angle", "smell", "remember", "off"],
  fang_scout: ["meat", "bleed", "fresh", "hunt", "smell", "scrap", "block"],
  block_captain: ["block", "ashblock", "bow", "owns", "syndicate", "fang"],
};

// ────────────────────────────────────────────────────────────────────────────
// SCRIPTS — 3 encounters × 5 beats each = 15 beats
// ────────────────────────────────────────────────────────────────────────────

const ENC_1_STREET_SWEEP: EncounterScript = {
  encounterId: "d1-e1",
  title: "Street Sweep",
  beats: [
    {
      step: "scene_entry",
      fx: "ember_drift",
      lines: [
        {
          speaker: "narrator",
          tone: "narrative",
          text:
            "Ashblock Heights bleeds amber at dusk. Smoke threads up the rebar of a half-collapsed walk-up. Neon stutters across cracked asphalt. The block has not been quiet in a long time.",
        },
      ],
    },
    {
      step: "objective",
      lines: [
        {
          speaker: "boryn",
          tone: "warm",
          text: "Two scouts on the corner, kid. We thin them before more come. Stay tight to me.",
        },
        {
          speaker: "kaison",
          tone: "memory",
          text: "Something's off in the wind. Smells like the ones from last week.",
        },
      ],
    },
    {
      step: "conflict",
      fx: "neon_flicker",
      lines: [
        {
          speaker: "fang_scout",
          tone: "hungry",
          text: "Fresh meat on the block. Look at the small one — barely a scrap on him.",
        },
      ],
    },
    {
      step: "escalation",
      lines: [
        {
          speaker: "boryn",
          tone: "warm",
          text: "Stay tight, kid. Show them the memory of this block. Now.",
        },
      ],
    },
    {
      step: "payoff",
      fx: "fade_out",
      lines: [
        {
          speaker: "boryn",
          tone: "warm",
          text: "That's how Ashblock breathes, kid. You did good. Breathe with it.",
        },
      ],
    },
  ],
};

const ENC_2_ALLEY_AMBUSH: EncounterScript = {
  encounterId: "d1-e2",
  title: "Alley Ambush",
  beats: [
    {
      step: "scene_entry",
      fx: "fade_in",
      lines: [
        {
          speaker: "narrator",
          tone: "narrative",
          text:
            "The street folds into a service alley. Concrete sweats. Rusted fire escapes hang above like ribs. Three exits — and Ashblock has a way of closing the wrong ones.",
        },
      ],
    },
    {
      step: "objective",
      lines: [
        {
          speaker: "kaison",
          tone: "memory",
          text: "Three of them. One above us. The angle's wrong on the second one.",
        },
        {
          speaker: "boryn",
          tone: "warm",
          text: "Good eyes. Trust them. Always trust the angle, kid.",
        },
      ],
    },
    {
      step: "conflict",
      lines: [
        {
          speaker: "fang_scout",
          tone: "hungry",
          text: "Smell that? Old meat and the small one. We bleed the big one first.",
        },
      ],
    },
    {
      step: "escalation",
      fx: "camera_shake_soft",
      lines: [
        {
          speaker: "boryn",
          tone: "warm",
          text: "Back to back. I break what they throw — you take what slips through. Now, kid.",
        },
      ],
    },
    {
      step: "payoff",
      lines: [
        {
          speaker: "boryn",
          tone: "warm",
          text:
            "Memory keeps you alive in alleys, kid. Never forget the angles. The block will test you again — it always does.",
        },
      ],
    },
  ],
};

const ENC_3_BLOCK_CAPTAIN: EncounterScript = {
  encounterId: "d1-e3",
  title: "The Block Captain",
  beats: [
    {
      step: "scene_entry",
      fx: "neon_flicker",
      lines: [
        {
          speaker: "narrator",
          tone: "narrative",
          text:
            "Past the alley, Ashblock opens onto a rooftop crown of broken floodlights. Scaffolding clatters in the wind. The Fang Syndicate's block captain holds court here — the kind of man who collects breath as rent.",
        },
      ],
    },
    {
      step: "objective",
      lines: [
        {
          speaker: "boryn",
          tone: "warm",
          text:
            "He runs Ashblock for the syndicate. We take him, and the block remembers us — not them. That's worth more than any scrap they hoard.",
        },
        {
          speaker: "kaison",
          tone: "memory",
          text: "He's bigger than the others. Something heavier under his coat.",
        },
      ],
    },
    {
      step: "conflict",
      fx: "camera_shake_soft",
      lines: [
        {
          speaker: "block_captain",
          tone: "commanding",
          text:
            "This block belongs to the Fang. You either bow on it, you bleed on it, or you bury yourself in it. Choose fast.",
        },
      ],
    },
    {
      step: "escalation",
      lines: [
        {
          speaker: "boryn",
          tone: "warm",
          text:
            "Stay behind me until I move, kid. When I move — you go. Show this block who remembers it. Now.",
        },
      ],
    },
    {
      step: "payoff",
      fx: "fade_out",
      lines: [
        {
          speaker: "boryn",
          tone: "warm",
          text:
            "You stood, kid. On a block that wanted you down. Remember the weight of that. When I'm not here to call it out for you, you'll still know how to stand. That's enough for now.",
        },
        {
          speaker: "kaison",
          tone: "memory",
          text: "I'll remember.",
        },
      ],
    },
  ],
};

export const ASHBLOCK_SCRIPTS: readonly EncounterScript[] = Object.freeze([
  ENC_1_STREET_SWEEP,
  ENC_2_ALLEY_AMBUSH,
  ENC_3_BLOCK_CAPTAIN,
]);

// ────────────────────────────────────────────────────────────────────────────
// Validator — fails fast on canon drift
// ────────────────────────────────────────────────────────────────────────────

export class CanonViolationError extends Error {
  constructor(message: string) {
    super(`[Ashblock canon] ${message}`);
    this.name = "CanonViolationError";
  }
}

const REQUIRED_BEAT_ORDER: BeatStep[] = [
  "scene_entry",
  "objective",
  "conflict",
  "escalation",
  "payoff",
];

export interface ValidationOptions {
  /** When true, every speaker that appears must hit at least one required marker. */
  strict?: boolean;
}

/**
 * Asserts the entire Ashblock script obeys canon rules.
 * Throws CanonViolationError on any violation.
 * Returns a summary on success.
 */
export function validateAshblockScript(
  scripts: readonly EncounterScript[] = ASHBLOCK_SCRIPTS,
  opts: ValidationOptions = { strict: true },
): { encounters: number; beats: number; lines: number } {
  let beatCount = 0;
  let lineCount = 0;

  // Encounter coverage: must match real EncounterSpec ids 1:1.
  const encounterIds = ASHBLOCK_ENCOUNTERS.map((e) => e.id).sort();
  const scriptIds = scripts.map((s) => s.encounterId).sort();
  if (encounterIds.length !== scriptIds.length || encounterIds.some((id, i) => id !== scriptIds[i])) {
    throw new CanonViolationError(
      `Script encounter ids ${JSON.stringify(scriptIds)} do not match encounters ${JSON.stringify(encounterIds)}.`,
    );
  }

  // Per-speaker marker tracking
  const markerHits: Partial<Record<SpeakerId, Set<string>>> = {};

  for (const script of scripts) {
    if (script.beats.length !== REQUIRED_BEAT_ORDER.length) {
      throw new CanonViolationError(
        `Encounter ${script.encounterId}: expected ${REQUIRED_BEAT_ORDER.length} beats, got ${script.beats.length}.`,
      );
    }
    script.beats.forEach((beat, i) => {
      if (beat.step !== REQUIRED_BEAT_ORDER[i]) {
        throw new CanonViolationError(
          `Encounter ${script.encounterId}: beat ${i} expected '${REQUIRED_BEAT_ORDER[i]}', got '${beat.step}'.`,
        );
      }
      if (beat.lines.length === 0) {
        throw new CanonViolationError(
          `Encounter ${script.encounterId} beat '${beat.step}': must have at least one line.`,
        );
      }
      beatCount++;

      for (const line of beat.lines) {
        lineCount++;

        // 1. Speaker → Tone alignment
        const expectedTone = SPEAKER_TO_TONE[line.speaker];
        if (!expectedTone) {
          throw new CanonViolationError(
            `Encounter ${script.encounterId} beat '${beat.step}': unknown speaker '${line.speaker}'.`,
          );
        }
        if (line.tone !== expectedTone) {
          throw new CanonViolationError(
            `Encounter ${script.encounterId} beat '${beat.step}': speaker '${line.speaker}' must use tone '${expectedTone}', got '${line.tone}'.`,
          );
        }

        // 2. Forbidden phrase check (per speaker)
        const forbidden = FORBIDDEN_PHRASES[line.speaker] ?? [];
        const lower = line.text.toLowerCase();
        for (const phrase of forbidden) {
          if (lower.includes(phrase.toLowerCase())) {
            throw new CanonViolationError(
              `Encounter ${script.encounterId} beat '${beat.step}': speaker '${line.speaker}' must NOT contain "${phrase}". Line: "${line.text}"`,
            );
          }
        }

        // 3. Track marker hits (validated after pass)
        const required = REQUIRED_VOICE_MARKERS[line.speaker];
        if (required) {
          if (!markerHits[line.speaker]) markerHits[line.speaker] = new Set<string>();
          for (const marker of required) {
            if (lower.includes(marker.toLowerCase())) {
              markerHits[line.speaker]!.add(marker);
            }
          }
        }

        // 4. Empty line check
        if (line.text.trim().length === 0) {
          throw new CanonViolationError(
            `Encounter ${script.encounterId} beat '${beat.step}': empty line for speaker '${line.speaker}'.`,
          );
        }
      }
    });
  }

  // 5. Required-marker coverage (strict mode only)
  if (opts.strict) {
    for (const [speaker, requiredList] of Object.entries(REQUIRED_VOICE_MARKERS) as [SpeakerId, string[]][]) {
      const speakerAppears = scripts.some((s) =>
        s.beats.some((b) => b.lines.some((l) => l.speaker === speaker)),
      );
      if (!speakerAppears) continue; // Speaker isn't in this slice — fine.
      const hits = markerHits[speaker]?.size ?? 0;
      if (hits === 0) {
        throw new CanonViolationError(
          `Speaker '${speaker}' has zero required-marker hits (need at least 1 of: ${requiredList.join(", ")}).`,
        );
      }
    }
  }

  return { encounters: scripts.length, beats: beatCount, lines: lineCount };
}

// Run validation eagerly at module load — if canon is broken, the whole game
// breaks loudly. This is the point: we never ship drift.
validateAshblockScript();

// ────────────────────────────────────────────────────────────────────────────
// Helpers consumed by the slice scene + cinematic overlay
// ────────────────────────────────────────────────────────────────────────────

export function getScriptForEncounter(encounterId: string): EncounterScript | undefined {
  return ASHBLOCK_SCRIPTS.find((s) => s.encounterId === encounterId);
}

/** Speaker color band for the cinematic overlay (Sabertooth UI language). */
export const SPEAKER_COLORS: Record<SpeakerId, { name: string; hex: string }> = {
  narrator:      { name: "Narrator",      hex: "#e8e8f5" },
  boryn:         { name: "Boryn",         hex: "#ff8a3d" }, // Pyraxis orange — sacrifice
  boryx:         { name: "Boryx Zenith",  hex: "#3dd6ff" }, // Thryxen cyan — law (reserved for Book 2)
  kaison:        { name: "Kaison",        hex: "#b76dff" }, // Myrr'Kai purple — memory
  jaxon:         { name: "Jaxon",         hex: "#ffd23d" }, // Electric strand
  fang_scout:    { name: "Fang Scout",    hex: "#a0a0a8" },
  block_captain: { name: "Block Captain", hex: "#d44a4a" }, // Hungry / commanding red
};

export const __TEST_INTERNALS = {
  SPEAKER_TO_TONE,
  FORBIDDEN_PHRASES,
  REQUIRED_VOICE_MARKERS,
  REQUIRED_BEAT_ORDER,
};

/**
 * Battle dialogue config - Bronx grit tone, short lines (1-2 sentences).
 * Format: { trigger, playerLines, opponentLines } - pick random for variety.
 */

export type DialogueTrigger =
  | "roundStart"
  | "firstHit"
  | "combo5"
  | "combo10"
  | "combo20"
  | "transformationReady"
  | "koWinner"
  | "koLoser";

export interface DialogueEntry {
  trigger: DialogueTrigger;
  playerLines: string[];
  opponentLines: string[];
  /** Optional: character-specific lines by id for variety */
  byCharacterId?: Record<string, { playerLines?: string[]; opponentLines?: string[] }>;
}

export const DIALOGUE_CONFIG: DialogueEntry[] = [
  {
    trigger: "roundStart",
    playerLines: [
      "Let's go.",
      "You're mine.",
      "No mercy.",
      "Bring it.",
      "Time to shine.",
      "Let's finish this.",
      "This ends here.",
      "Raging City remembers.",
      "Nine tails. One destiny.",
    ],
    opponentLines: [
      "You're done.",
      "Ready to lose?",
      "Come at me.",
      "This ends now.",
      "You won't last.",
      "Know your place.",
      "Stay down.",
      "Your block ends here.",
    ],
    byCharacterId: {
      "kai-jax": {
        playerLines: ["Bronx style. Let's ride.", "Two souls. One goal.", "Ready."],
        opponentLines: ["You're outmatched.", "Come get some.", "This is my block."],
      },
      "boryn": {
        playerLines: ["Stand tall.", "Honor demands it.", "Let's go."],
        opponentLines: ["I won't hold back.", "Prove yourself.", "On your guard."],
      },
    },
  },
  {
    trigger: "firstHit",
    playerLines: [
      "First blood.",
      "Got you.",
      "Too slow.",
      "First strike.",
      "Your turn to bleed.",
      "One down.",
    ],
    opponentLines: [
      "Lucky shot.",
      "You'll pay for that.",
      "That's one.",
      "Cheap hit.",
      "That won't happen again.",
      "Lucky.",
    ],
  },
  {
    trigger: "combo5",
    playerLines: [
      "Combo started.",
      "Keep 'em coming.",
      "Five and counting.",
      "Raging City style.",
      "Nine tails. Five hits.",
      "Just warming up.",
    ],
    opponentLines: [
      "You won't keep that up.",
      "Lucky streak.",
      "Temporary.",
      "I'll break that.",
    ],
  },
  {
    trigger: "combo10",
    playerLines: [
      "Unstoppable.",
      "Ten and rising.",
      "Can't touch this.",
      "Memory King rises.",
      "Ten. You're finished.",
      "Raging City remembers.",
    ],
    opponentLines: [
      "This ends now!",
      "Enough!",
      "Impossible!",
      "No!",
    ],
  },
  {
    trigger: "combo20",
    playerLines: [
      "Legendary.",
      "Twenty! You're finished.",
      "No one survives this.",
      "Nine tails. Twenty hits.",
      "This ends here.",
      "Raging City delivers.",
    ],
    opponentLines: [
      "...",
      "Impossible...",
      "How...",
      "No...",
    ],
  },
  {
    trigger: "transformationReady",
    playerLines: [
      "Time to fuse.",
      "Synergy maxed. Let's go.",
      "Kai-Jax incoming.",
      "Full power.",
    ],
    opponentLines: [
      "What?!",
      "Not good.",
    ],
  },
  {
    trigger: "koWinner",
    playerLines: [
      "Done.",
      "Stay down.",
      "Victory.",
      "Told you.",
      "This ends here.",
      "Raging City remembers.",
      "Nine tails. One destiny.",
    ],
    opponentLines: [],
    byCharacterId: {
      "kai-jax": {
        playerLines: ["That's how we do it.", "Bronx wins.", "Respect."],
      },
      "boryn": {
        playerLines: ["Honor upheld.", "You fought well.", "Rest."],
      },
    },
  },
  {
    trigger: "koLoser",
    playerLines: [],
    opponentLines: [
      "Too easy.",
      "Outclassed.",
      "Know your place.",
      "Next.",
      "This ends here.",
      "Raging City forgets.",
      "Nine tails. None left.",
    ],
  },
];

export function getDialogueLine(
  trigger: DialogueTrigger,
  speaker: "player" | "opponent",
  characterId?: string
): string | null {
  const entry = DIALOGUE_CONFIG.find((e) => e.trigger === trigger);
  if (!entry) return null;

  // Optional character-specific lines for variety
  if (characterId && entry.byCharacterId?.[characterId]) {
    const char = entry.byCharacterId[characterId];
    const lines = speaker === "player" ? (char.playerLines ?? entry.playerLines) : (char.opponentLines ?? entry.opponentLines);
    if (lines?.length) return lines[Math.floor(Math.random() * lines.length)];
  }

  const lines = speaker === "player" ? entry.playerLines : entry.opponentLines;
  if (!lines.length) return null;
  return lines[Math.floor(Math.random() * lines.length)];
}

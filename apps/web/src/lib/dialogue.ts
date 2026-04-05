// Character dialogue/banter for pre-fight and post-fight
// Beast Wars roster only (no legacy names)

export interface Dialogue {
  preFight: {
    taunts: string[];
    responses: string[];
  };
  victory: {
    quotes: string[];
  };
  defeat: {
    quotes: string[];
  };
}

export const fighterDialogue: Record<string, Dialogue> = {
  jaxon: {
    preFight: {
      taunts: [
        "Hear the quills crackle. Bronx thunder.",
        "You want smoke? Step in.",
        "Speed is a weapon. I'm the blade.",
        "Say less. We fight.",
        "I don't chase wins. I take them.",
      ],
      responses: ["Run it.", "Bet.", "Let’s go.", "No more talk.", "On sight."],
    },
    victory: { quotes: ["Too slow.", "Thunder stays.", "You felt that.", "Next.", "The Bronx remembers."] },
    defeat: { quotes: ["Again.", "I learn fast.", "Not finished.", "Run it back.", "I’m still standing."] },
  },

  kaison: {
    preFight: {
      taunts: [
        "Star-Force online. Webs ready.",
        "I see your angle. I counter it.",
        "Two tails. Two outcomes. You lose both.",
        "Keep moving—my net is already set.",
        "Tactics beat rage.",
      ],
      responses: ["Locked in.", "I’m ready.", "Try me.", "Watch your step.", "I already mapped this."],
    },
    victory: { quotes: ["Calculated.", "Archive secured.", "You walked into it.", "Clean.", "Next target."] },
    defeat: { quotes: ["Data collected.", "Good read.", "I’ll adapt.", "You earned that.", "Again—smarter."] },
  },

  "kai-jax": {
    preFight: {
      taunts: [
        "The Archive remembers every strike you’ve ever thrown.",
        "Three strands. One verdict.",
        "I don’t fight to win. I fight to end it.",
        "Breathe. This is your last calm.",
        "Gods will tremble.",
      ],
      responses: ["Proceed.", "Confirmed.", "Come.", "Now.", "Witness."],
    },
    victory: { quotes: ["Recorded.", "Erased.", "The Archive closes.", "Next.", "Tremble."] },
    defeat: { quotes: ["The memory persists.", "Not… yet.", "Again.", "The Archive rebuilds.", "I return."] },
  },

  "boryx-zenith": {
    preFight: {
      taunts: [
        "I protect what matters—by breaking what threatens it.",
        "Guardian stance. Dragon wrath.",
        "You’re in my ring now.",
        "Step wrong and you shatter.",
        "Chaos answers my call.",
      ],
      responses: ["Approach.", "Stand down.", "No mercy.", "Try it.", "I’m here."],
    },
    victory: { quotes: ["Protected.", "Guardian prevails.", "You weren’t ready.", "Hold the line.", "Next."] },
    defeat: { quotes: ["I failed… not them.", "Again.", "I’ll carry this.", "You’re strong.", "I’ll rise."] },
  },

  "lunara-solis": {
    preFight: {
      taunts: [
        "I’ve seen this outcome. You don’t like it.",
        "Starlight cuts deeper than steel.",
        "Nine tails, one prophecy.",
        "Your move was written already.",
        "Moon veil—then silence.",
      ],
      responses: ["Begin.", "As foretold.", "Proceed.", "I’m watching.", "Show me."],
    },
    victory: { quotes: ["Foretold.", "Starlight remains.", "Timeline holds.", "Next vision.", "Done."] },
    defeat: { quotes: ["Unexpected…", "A new branch.", "I’ll correct it.", "You surprised me.", "Again."] },
  },

  "umbra-flux": {
    preFight: {
      taunts: [
        "You can’t hit what phases.",
        "I’m already behind you.",
        "Wraith speed. Wolf teeth.",
        "Blink and you’re done.",
        "Reality is thin tonight.",
      ],
      responses: ["Try.", "Miss.", "Too late.", "I’m gone.", "Catch me."],
    },
    victory: { quotes: ["Vanished.", "Ghosted.", "You swung at air.", "Next.", "Fade."] },
    defeat: { quotes: ["I mistimed it.", "Again.", "You’re sharp.", "Respect.", "Next run."] },
  },

  "sentinel-vox": {
    preFight: {
      taunts: [
        "Systems armed. Time-lock engaged.",
        "Your future is already logged.",
        "Tactical matrix: dominant.",
        "You’ll freeze. Then fall.",
        "Chrono control is authority.",
      ],
      responses: ["Confirmed.", "Execute.", "Advance.", "Locking.", "Proceed."],
    },
    victory: { quotes: ["Confirmed.", "Tactical win.", "Time obeys.", "Next.", "Clean execution."] },
    defeat: { quotes: ["Error… adapting.", "Recalculate.", "You broke pattern.", "Again.", "Noted."] },
  },

  "chronos-sere": {
    preFight: {
      taunts: [
        "All timelines end here.",
        "Entropy is the only law.",
        "You can’t outrun collapse.",
        "I erase what you are.",
        "Kneel to extinction.",
      ],
      responses: ["Suffer.", "End.", "Silence.", "Fall.", "Disappear."],
    },
    victory: { quotes: ["Extinction.", "Erased.", "Inevitable.", "Next.", "Collapse."] },
    defeat: { quotes: ["Impossible.", "A delay…", "Not the end.", "Again.", "You’ll break."] },
  },

  silver: {
    preFight: {
      taunts: [
        "The timeline will be protected.",
        "I don’t fight for pride. I fight for balance.",
        "Your moment ends here.",
        "Time bends—so do you.",
        "Stand down.",
      ],
      responses: ["I’m ready.", "Let’s do this.", "Focus.", "Now.", "Move."],
    },
    victory: { quotes: ["Timeline secured.", "Balance restored.", "You were a threat.", "Next.", "Time holds."] },
    defeat: { quotes: ["Time… slipped.", "I’ll fix this.", "Again.", "You earned it.", "Not over."] },
  },

  voidonus: {
    preFight: {
      taunts: [
        "All will return to the void.",
        "Hope is a candle. I am the wind.",
        "Your light ends now.",
        "I eat worlds.",
        "Welcome to the end.",
      ],
      responses: ["…", "Come.", "Break.", "Fade.", "End."],
    },
    victory: { quotes: ["Consumed.", "Silence.", "Nothing remains.", "End.", "Void eternal."] },
    defeat: { quotes: ["The void… waits.", "Not finished.", "Again.", "You delay the end.", "I return."] },
  },
};

function pickRandom(items: string[]): string {
  if (!items.length) return "";
  return items[Math.floor(Math.random() * items.length)] || items[0] || "";
}

function getDialogue(id: string): Dialogue {
  return fighterDialogue[id] || fighterDialogue["jaxon"]!;
}

export function getPreFightTaunt(id: string): string {
  return pickRandom(getDialogue(id).preFight.taunts);
}

export function getPreFightResponse(id: string): string {
  return pickRandom(getDialogue(id).preFight.responses);
}

export function getVictoryQuote(id: string): string {
  return pickRandom(getDialogue(id).victory.quotes);
}

export function getDefeatQuote(id: string): string {
  return pickRandom(getDialogue(id).defeat.quotes);
}


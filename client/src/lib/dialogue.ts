// Character dialogue/banter for pre-fight and post-fight

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
        "Ready to see some superhero moves?",
        "Let's make this fun!",
        "Time to save the day!",
        "I've been training for this!",
        "You're going down, bad guy!"
      ],
      responses: [
        "Bring it on!",
        "I'm ready!",
        "Let's do this!",
        "Game on!",
        "Here we go!"
      ]
    },
    victory: {
      quotes: [
        "Superhero victory!",
        "Good guys win again!",
        "That was awesome!",
        "Justice prevails!",
        "Great battle, friend!"
      ]
    },
    defeat: {
      quotes: [
        "I'll get you next time!",
        "That was tough...",
        "You're really strong!",
        "I need more practice!",
        "Good match!"
      ]
    }
  },
  kaison: {
    preFight: {
      taunts: [
        "Let's show them our power!",
        "Together we're unstoppable!",
        "Time for teamwork!",
        "Ready for action!",
        "This will be epic!"
      ],
      responses: [
        "Let's go!",
        "I'm pumped!",
        "Bring it!",
        "Watch this!",
        "Here I come!"
      ]
    },
    victory: {
      quotes: [
        "Teamwork makes the dream work!",
        "We did it!",
        "That was incredible!",
        "Victory dance time!",
        "Great teamwork!"
      ]
    },
    defeat: {
      quotes: [
        "We'll train harder!",
        "You got us this time!",
        "Respect!",
        "That was close!",
        "Good game!"
      ]
    }
  },
  speedy: {
    preFight: {
      taunts: [
        "You can't catch the blue blur!",
        "Gotta go fast!",
        "Too slow!",
        "Speed is my superpower!",
        "Catch me if you can!"
      ],
      responses: [
        "Let's race!",
        "I'm the fastest!",
        "Zoom zoom!",
        "Here we go!",
        "Time to speed!"
      ]
    },
    victory: {
      quotes: [
        "Speed wins every time!",
        "Too fast for you!",
        "That was a blast!",
        "Sonic boom!",
        "Winner!"
      ]
    },
    defeat: {
      quotes: [
        "You're pretty fast too!",
        "Whoa, didn't see that coming!",
        "Good race!",
        "You got me!",
        "Respect!"
      ]
    }
  },
  marlo: {
    preFight: {
      taunts: [
        "Wahoo! Let's-a go!",
        "It's-a me, ready to battle!",
        "Mama mia! Here we go!",
        "Let's-a have fun!",
        "Time to jump into action!"
      ],
      responses: [
        "Let's-a go!",
        "Wahoo!",
        "Here we go!",
        "Ready!",
        "Yahoo!"
      ]
    },
    victory: {
      quotes: [
        "Wahoo! Victory!",
        "Mama mia! We won!",
        "Let's-a celebrate!",
        "Yahoo! Great battle!",
        "Winner winner!"
      ]
    },
    defeat: {
      quotes: [
        "Mama mia...",
        "You're-a pretty good!",
        "I'll-a get you next time!",
        "Good game!",
        "Wahoo... next time!"
      ]
    }
  },
  midnight: {
    preFight: {
      taunts: [
        "The shadows are my ally!",
        "Fear the darkness!",
        "You cannot escape!",
        "Prepare for defeat!",
        "Darkness falls!"
      ],
      responses: [
        "Face me!",
        "You dare challenge me?",
        "Foolish hero!",
        "This ends now!",
        "Come!"
      ]
    },
    victory: {
      quotes: [
        "The darkness prevails!",
        "As expected!",
        "You were no match!",
        "Victory is mine!",
        "Bow before me!"
      ]
    },
    defeat: {
      quotes: [
        "This isn't over!",
        "You got lucky!",
        "I'll be back!",
        "Impossible!",
        "Next time..."
      ]
    }
  },
  flynn: {
    preFight: {
      taunts: [
        "The hero's blade is ready!",
        "For glory!",
        "Time to be brave!",
        "Adventure awaits!",
        "Let's fight with honor!"
      ],
      responses: [
        "En garde!",
        "For honor!",
        "Let's go!",
        "Ready!",
        "Hiyah!"
      ]
    },
    victory: {
      quotes: [
        "The hero triumphs!",
        "Victory with honor!",
        "Well fought!",
        "Glory achieved!",
        "Great battle!"
      ]
    },
    defeat: {
      quotes: [
        "You are a worthy opponent!",
        "I'll train harder!",
        "Well fought!",
        "You have my respect!",
        "Good match!"
      ]
    }
  },
  leonardo: {
    preFight: {
      taunts: [
        "Time to invent a victory!",
        "Science and skill!",
        "Let's test my theories!",
        "Calculated moves only!",
        "Time to demonstrate genius!"
      ],
      responses: [
        "Fascinating!",
        "Let's begin!",
        "Observe!",
        "Here we go!",
        "Watch this!"
      ]
    },
    victory: {
      quotes: [
        "As calculated!",
        "Science prevails!",
        "Theory confirmed!",
        "Brilliant victory!",
        "Well executed!"
      ]
    },
    defeat: {
      quotes: [
        "Interesting data!",
        "Back to the drawing board!",
        "You're quite skilled!",
        "I learned something!",
        "Fascinating!"
      ]
    }
  }
};

// Get random dialogue from array
export function getRandomDialogue(dialogues: string[]): string {
  return dialogues[Math.floor(Math.random() * dialogues.length)];
}

// Get pre-fight taunt for a fighter
export function getPreFightTaunt(fighterId: string): string {
  const dialogue = fighterDialogue[fighterId];
  if (!dialogue) return "Let's fight!";
  return getRandomDialogue(dialogue.preFight.taunts);
}

// Get pre-fight response for a fighter
export function getPreFightResponse(fighterId: string): string {
  const dialogue = fighterDialogue[fighterId];
  if (!dialogue) return "Bring it on!";
  return getRandomDialogue(dialogue.preFight.responses);
}

// Get victory quote for a fighter
export function getVictoryQuote(fighterId: string): string {
  const dialogue = fighterDialogue[fighterId];
  if (!dialogue) return "I won!";
  return getRandomDialogue(dialogue.victory.quotes);
}

// Get defeat quote for a fighter
export function getDefeatQuote(fighterId: string): string {
  const dialogue = fighterDialogue[fighterId];
  if (!dialogue) return "Good match!";
  return getRandomDialogue(dialogue.defeat.quotes);
}

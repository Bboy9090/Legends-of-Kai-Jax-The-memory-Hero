import { create } from "zustand";

interface Choice {
  text: string;
  type: "heart" | "star";
  isKind: boolean;
}

interface Scenario {
  id: string;
  scenario: string;
  choices: Choice[];
  context?: string;
}

interface ChoicesState {
  scenarios: Scenario[];
  currentScenario: Scenario | null;
  
  // Actions
  getRandomScenario: () => Scenario;
  setCurrentScenario: (scenario: Scenario | null) => void;
}

const kindnessScenarios: Scenario[] = [
  {
    id: "groceries",
    scenario: "A citizen dropped their groceries when a Grumble-Bot knocked them over!",
    choices: [
      { text: "Help pick up the groceries", type: "heart", isKind: true },
      { text: "Chase after the Grumble-Bot", type: "star", isKind: false }
    ],
    context: "Someone needs help with their scattered items."
  },
  {
    id: "lost_pet",
    scenario: "A little girl is crying because her robot pet ran away after being scared by Grumble-Bots!",
    choices: [
      { text: "Help look for the pet", type: "heart", isKind: true },
      { text: "Tell her to be brave", type: "star", isKind: false }
    ],
    context: "A child needs comfort and assistance."
  },
  {
    id: "elderly_crossing",
    scenario: "An elderly person is afraid to cross the street because Grumble-Bots are causing traffic chaos!",
    choices: [
      { text: "Help them cross safely", type: "heart", isKind: true },
      { text: "Clear the bots first", type: "star", isKind: false }
    ],
    context: "Someone needs help feeling safe."
  },
  {
    id: "playground_mess",
    scenario: "Grumble-Bots have made a mess of the playground and kids can't play!",
    choices: [
      { text: "Clean up together with the kids", type: "heart", isKind: true },
      { text: "Fight off the remaining bots", type: "star", isKind: false }
    ],
    context: "Children want their play area back."
  },
  {
    id: "ice_cream",
    scenario: "A Grumble-Bot knocked over an ice cream cart and the vendor looks very sad!",
    choices: [
      { text: "Help clean up and comfort the vendor", type: "heart", isKind: true },
      { text: "Pursue the bot for justice", type: "star", isKind: false }
    ],
    context: "Someone's livelihood has been affected."
  }
];

export const useChoices = create<ChoicesState>((set, get) => ({
  scenarios: kindnessScenarios,
  currentScenario: null,
  
  getRandomScenario: () => {
    const { scenarios } = get();
    const randomIndex = Math.floor(Math.random() * scenarios.length);
    return scenarios[randomIndex];
  },
  
  setCurrentScenario: (scenario) => set({ currentScenario: scenario })
}));

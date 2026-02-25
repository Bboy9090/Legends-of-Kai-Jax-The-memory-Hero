/**
 * Fracture Archives — collectible lore entries.
 * Unlocks across modes. No competitive advantage.
 * Adapted from "Catalyst Event" / Continuum Engine narrative.
 */

export interface LoreEntry {
  id: string;
  title: string;
  category: "character" | "timeline" | "rivalry" | "pre-collapse" | "catalyst";
  excerpt: string;
  fullText: string;
  unlockHint: string;
}

const CATALYST_EVENT = `
A forbidden device called the Continuum Engine attempted to merge timelines peacefully —
instead it detonated existence itself, scattering realities like shattered glass.

The Raging City is not one place. It is the scar where worlds collided.

The fighters aren't just battling. They're competing to decide which fragments of reality
survive reconstruction. Every match carries existential weight.
`.trim();

export const FRACTURE_ARCHIVES: LoreEntry[] = [
  {
    id: "catalyst-event",
    title: "The Catalyst Event",
    category: "catalyst",
    excerpt: "The day existence fractured.",
    fullText: CATALYST_EVENT,
    unlockHint: "Complete the intro sequence",
  },
  {
    id: "kai-origin",
    title: "Kai — The Fire Brother",
    category: "character",
    excerpt: "Fierce, impulsive, burning with passion.",
    fullText: "Kai's fire is both his greatest weapon and his deepest flaw. He never forgets a slight. He never forgives betrayal. The Bronx streets remember. So does Kai.",
    unlockHint: "Play as Kai in Versus",
  },
  {
    id: "jax-origin",
    title: "Jax — The Ice Strategist",
    category: "character",
    excerpt: "Calm, calculating, precise.",
    fullText: "Jax is the mind where Kai is the heart. His ice reflects perfect control. In a city of chaos, he is the one who plans three moves ahead.",
    unlockHint: "Play as Jax in Versus",
  },
  {
    id: "kaijax-origin",
    title: "Kai-Jax — The Memory King",
    category: "character",
    excerpt: "Two brothers. One body. Nine tails.",
    fullText: "The legendary fusion. Kai-Jax is the sovereign who cannot be erased from existence. Forged in the Raging City. Crowned by Memory.",
    unlockHint: "Transform to Kai-Jax in battle",
  },
  {
    id: "malakor-stirs",
    title: "Malakor Stirring",
    category: "timeline",
    excerpt: "The depths call.",
    fullText: "Malakor stirs below. What remains of the old gods waits in the Undercity. The Fang Syndicate rules the rubble. The Memory Thief stole more than memories.",
    unlockHint: "Defeat Malakor in Adventure",
  },
  {
    id: "boryn-guardian",
    title: "Boryn — The Hunter General",
    category: "character",
    excerpt: "Father figure. Warrior's ferocity.",
    fullText: "Boryn holds the line at the Undercity gates. His warmth hides a warrior's ferocity. A massive protective tiger beast. The brothers' anchor.",
    unlockHint: "Complete a story mission",
  },
  {
    id: "hidden-rivalry",
    title: "Hidden Rivalries",
    category: "rivalry",
    excerpt: "Not all fighters want salvation.",
    fullText: "Some want dominion. Survivors of fractured realities organize combat trials. The stakes: who will wield the reconstructed multiverse.",
    unlockHint: "Win 3 Versus matches",
  },
];

export function getLoreEntryById(id: string): LoreEntry | undefined {
  return FRACTURE_ARCHIVES.find((e) => e.id === id);
}

export function getLoreByCategory(category: LoreEntry["category"]): LoreEntry[] {
  return FRACTURE_ARCHIVES.filter((e) => e.category === category);
}

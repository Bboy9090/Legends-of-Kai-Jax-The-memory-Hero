/**
 * Fighter roster — locked to design spec (specs/primary, data/characterDesigns).
 */

export interface Fighter {
  id: string;
  name: string;
  displayName: string;
  color: string;
  accentColor: string;
  baseStats?: { power: number; speed: number; defense: number; gravity: number };
}

export const FIGHTERS: Fighter[] = [
  {
    id: "kai-jax",
    name: "KaiJax",
    displayName: "KAI-JAX",
    color: "#1a1a1a",
    accentColor: "#7fff00",
    baseStats: { power: 88, speed: 85, defense: 82, gravity: 9.8 },
  },
  {
    id: "jaxon",
    name: "Jaxon",
    displayName: "JAXON",
    color: "#0b1020",
    accentColor: "#5dd9ff",
    baseStats: { power: 82, speed: 88, defense: 78, gravity: 9.8 },
  },
  {
    id: "kaison",
    name: "Kaison",
    displayName: "KAISON",
    color: "#1a0a0a",
    accentColor: "#ffc233",
    baseStats: { power: 85, speed: 82, defense: 85, gravity: 9.8 },
  },
];

export function getFighterById(id: string): Fighter | null {
  return FIGHTERS.find((f) => f.id === id) ?? null;
}

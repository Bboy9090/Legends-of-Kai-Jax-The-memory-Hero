/**
 * Character design spec — locked looks for 3D and 2D rendering.
 * Canonical source: specs/primary/character_art_spec.json
 */

export interface CharacterDesign {
  id: string;
  name: string;
  title?: string;
  primaryColor: string;
  accentColor: string;
  secondaryColor?: string;
  webbingColor?: string;
  eyeColors?: string[];
  features: string[];
  portraitPath?: string;
}

const DESIGN_BY_ID: Record<string, CharacterDesign> = {
  "kai-jax": {
    id: "kai-jax",
    name: "KAIJAX",
    title: "Memory Hybrid",
    primaryColor: "#1a1a1a",
    accentColor: "#00ff00",
    secondaryColor: "#cc5500",
    webbingColor: "#00ff00",
    eyeColors: ["#00ff00", "#00f2ff", "#ffb000"],
    features: ["no_clothes", "charcoal_fur", "lime_webbing", "tri_color_eyes", "tribal_scars", "tail_streaks"],
    portraitPath: "",
  },
  jaxon: {
    id: "jaxon",
    name: "JAXON",
    primaryColor: "#0b1020",
    accentColor: "#4fd2ff",
    secondaryColor: "#4fd2ff",
    features: ["tactical_jacket"],
    portraitPath: "",
  },
  kaison: {
    id: "kaison",
    name: "KAISON",
    primaryColor: "#1a0a0a",
    accentColor: "#ffb000",
    secondaryColor: "#ffb000",
    features: ["tactical_jacket"],
    portraitPath: "",
  },
};

export function getDesignForFighterId(fighterId: string): CharacterDesign | null {
  return DESIGN_BY_ID[fighterId] ?? null;
}

export function getPortraitPath(fighterId: string): string | null {
  const d = getDesignForFighterId(fighterId);
  return d?.portraitPath && d.portraitPath.length > 0 ? d.portraitPath : null;
}

/** Parse hex color to [r,g,b] in 0..1 */
export function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace(/^#/, ""), 16);
  return [(n >> 16) / 255, ((n >> 8) & 0xff) / 255, (n & 0xff) / 255];
}

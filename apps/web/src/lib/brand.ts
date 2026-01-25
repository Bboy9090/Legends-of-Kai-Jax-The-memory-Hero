export const BRAND = {
  title: "LEGENDS OF KAI-JAX",
  subtitle: "THE MEMORY KING",
  tagline: "FORGED IN THE BRONX • CROWNED BY MEMORY",
  shortTagline: "FORGED IN THE BRONX. CROWNED BY MEMORY.",
  // localStorage save slot
  saveSlotKey: "MEMORY_KING_SLOT_1",
} as const;

export function getBrandFullTitle(): string {
  return `${BRAND.title}: ${BRAND.subtitle}`;
}


/**
 * Typecheck-only shim: Vite resolves @beast-kin/shared to packages at build time.
 * Compiling ../../packages/shared pulls in unfinished code; this keeps `tsc` scoped to apps/web.
 */
export type LegendaryBeast = {
  id: string;
  name: string;
  title?: string;
  beastHybrid?: string;
  description?: string;
  visual?: { primaryColor?: string; accentColor?: string; features?: string[]; size?: string; build?: string };
};

export const COMPLETE_BEAST_ROSTER: readonly LegendaryBeast[] = [];

export function getNameWithTitle(beast: LegendaryBeast): string {
  return beast.title ? `${beast.name} — ${beast.title}` : beast.name;
}

import { FIGHTERS, getFighterById } from "../src/lib/characters";
import { VERSUS_ROSTER } from "../src/lib/versusRoster";

const errors: string[] = [];

function validateUniqueIds(
  label: string,
  entries: readonly { id: string; displayName?: string }[],
): Set<string> {
  const seen = new Map<string, number>();

  for (const [index, entry] of entries.entries()) {
    const id = entry.id?.trim();
    if (!id) {
      errors.push(`${label} entry at index ${index} has an empty id`);
      continue;
    }

    const priorIndex = seen.get(id);
    if (priorIndex !== undefined) {
      errors.push(`${label} duplicate id "${id}" at indexes ${priorIndex} and ${index}`);
    } else {
      seen.set(id, index);
    }

    if (entry.displayName !== undefined && !entry.displayName.trim()) {
      errors.push(`${label} entry "${id}" has an empty displayName`);
    }
  }

  return new Set(seen.keys());
}

const legacyIds = validateUniqueIds("legacy combat roster", FIGHTERS);
const canonicalIds = validateUniqueIds("canonical versus roster", VERSUS_ROSTER);

for (const fighter of FIGHTERS) {
  const id = fighter.id.trim();
  if (!fighter.baseStats) {
    errors.push(`legacy fighter "${id}" is missing baseStats`);
    continue;
  }

  for (const [stat, value] of Object.entries(fighter.baseStats)) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      errors.push(`legacy fighter "${id}" has invalid stat ${stat}: ${String(value)}`);
    }
  }
}

if (FIGHTERS.length === 0) errors.push("legacy combat roster is empty");
if (VERSUS_ROSTER.length !== 23) {
  errors.push(`canonical versus roster expected 23 entries but found ${VERSUS_ROSTER.length}`);
}

const coreIds = new Set(VERSUS_ROSTER.filter((entry) => entry.faction === "core").map((entry) => entry.id));
for (const required of ["boryn", "kai", "kai-jax", "jax", "borax", "vharok"]) {
  if (!coreIds.has(required)) errors.push(`canonical core roster is missing "${required}"`);
}

for (const entry of VERSUS_ROSTER) {
  if (!entry.sourceSheet.endsWith(".png")) {
    errors.push(`canonical fighter "${entry.id}" has invalid source sheet "${entry.sourceSheet}"`);
  }
  if (entry.portraitSource !== entry.sourceSheet) {
    errors.push(`canonical fighter "${entry.id}" portrait provenance drifted from its source sheet`);
  }
}

// Fighter Select V2 intentionally aliases the canonical hyphenated identity to
// the existing combat profile until the gameplay registry itself is migrated.
if (!getFighterById("kaijax")) {
  errors.push('legacy combat roster is missing the temporary "kaijax" profile required by canonical "kai-jax"');
}

if (errors.length > 0) {
  console.error("Fighter roster validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Fighter roster validation passed: ${legacyIds.size} unique combat profiles; ${canonicalIds.size} unique locked-baseline versus identities.`,
);

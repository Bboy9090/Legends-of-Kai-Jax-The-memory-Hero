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

const canonicalIds = validateUniqueIds("canonical versus roster", VERSUS_ROSTER);

if (VERSUS_ROSTER.length === 0) errors.push("canonical versus roster is empty");
if (VERSUS_ROSTER.length !== 27) {
  errors.push(`canonical versus roster expected 27 entries but found ${VERSUS_ROSTER.length}`);
}

const coreIds = new Set(
  VERSUS_ROSTER.filter((entry) => entry.faction === "core").map((entry) => entry.id),
);
for (const required of ["kai", "jax", "kai-jax", "boryn", "borax"]) {
  if (!coreIds.has(required)) errors.push(`canonical core roster is missing "${required}"`);
}

const kaiJax = VERSUS_ROSTER.find((entry) => entry.id === "kai-jax");
if (!kaiJax) {
  errors.push('canonical roster is missing "kai-jax"');
} else if (kaiJax.combatProfileId !== "kaijax") {
  errors.push('canonical "kai-jax" must bridge to legacy combat profile "kaijax"');
}

const vharok = VERSUS_ROSTER.find((entry) => entry.id === "vharok");
if (!vharok) {
  errors.push('canonical roster is missing "vharok"');
} else {
  if (vharok.faction !== "bloodward-antagonist") {
    errors.push('"vharok" must remain in faction "bloodward-antagonist"');
  }
  if (vharok.role !== "villain") {
    errors.push('"vharok" must remain classified as a villain');
  }
  if (vharok.defaultUnlocked) {
    errors.push('"vharok" must not be default unlocked');
  }
}

for (const required of ["kar-voth", "thryxen", "pyraxis", "myrr-kai"]) {
  const entry = VERSUS_ROSTER.find((fighter) => fighter.id === required);
  if (!entry) {
    errors.push(`First Sabertooths roster is missing "${required}"`);
    continue;
  }
  if (entry.faction !== "first-sabertooths") {
    errors.push(`"${required}" must remain in faction "first-sabertooths"`);
  }
  if (entry.defaultUnlocked) {
    errors.push(`"${required}" must remain locked until its combat profile and current character lock are integrated`);
  }
}

for (const entry of VERSUS_ROSTER) {
  if (!entry.sourceSheet.trim()) {
    errors.push(`canonical fighter "${entry.id}" has no source provenance`);
  }
  if (!entry.portraitSource.trim()) {
    errors.push(`canonical fighter "${entry.id}" has no portrait provenance state`);
  }

  const pendingPortrait = entry.portraitSource === "PENDING_CURRENT_CHARACTER_LOCK";
  if (pendingPortrait && entry.defaultUnlocked) {
    errors.push(`canonical fighter "${entry.id}" cannot be default unlocked while its current character-lock portrait is pending`);
  }
}

if (errors.length > 0) {
  console.error("Fighter roster validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Fighter roster validation passed: ${canonicalIds.size} unique canonical versus identities.`,
);

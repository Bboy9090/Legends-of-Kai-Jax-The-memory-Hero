import { FIGHTERS } from "../src/lib/characters";

const errors: string[] = [];
const seen = new Map<string, number>();

for (const [index, fighter] of FIGHTERS.entries()) {
  const id = fighter.id?.trim();
  if (!id) {
    errors.push(`fighter at index ${index} has an empty id`);
    continue;
  }

  const priorIndex = seen.get(id);
  if (priorIndex !== undefined) {
    errors.push(`duplicate fighter id "${id}" at indexes ${priorIndex} and ${index}`);
  } else {
    seen.set(id, index);
  }

  if (!fighter.displayName?.trim()) {
    errors.push(`fighter "${id}" has an empty displayName`);
  }

  if (!fighter.baseStats) {
    errors.push(`fighter "${id}" is missing baseStats`);
  } else {
    for (const [stat, value] of Object.entries(fighter.baseStats)) {
      if (typeof value !== "number" || !Number.isFinite(value)) {
        errors.push(`fighter "${id}" has invalid stat ${stat}: ${String(value)}`);
      }
    }
  }
}

if (FIGHTERS.length === 0) {
  errors.push("fighter roster is empty");
}

if (errors.length > 0) {
  console.error("Fighter roster validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Fighter roster validation passed: ${FIGHTERS.length} fighters, ${seen.size} unique ids.`);

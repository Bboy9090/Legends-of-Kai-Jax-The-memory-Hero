/**
 * Guard pressure and attack clash priority (pure rules).
 */
import type { AttackType } from "./moveData";

export function attackBreaksGuard(type: AttackType): number {
  switch (type) {
    case "ultimate":
      return 55;
    case "special":
      return 40;
    case "kick":
      return 22;
    case "punch":
      return 12;
    default:
      return 0;
  }
}

export function getClashPriority(type: AttackType | null | undefined): number {
  switch (type) {
    case "ultimate":
      return 4;
    case "special":
      return 3;
    case "kick":
      return 2;
    case "punch":
      return 1;
    default:
      return 0;
  }
}

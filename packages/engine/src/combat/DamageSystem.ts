import { HitResult, DamageType } from '@smash-heroes/shared';
import { COMBAT_CONSTANTS } from '@smash-heroes/shared';

export class DamageSystem {
  private damageHistory: Map<string, number[]> = new Map();

  applyDamage(fighterId: string, currentDamage: number, incomingDamage: number): number {
    // Add damage (capped at max)
    const newDamage = Math.min(currentDamage + incomingDamage, 999);
    
    // Track damage for staleness
    this.recordDamage(fighterId, incomingDamage);
    
    return newDamage;
  }

  calculateDamageMultiplier(damageType: DamageType): number {
    switch (damageType) {
      case DamageType.PHYSICAL:
        return COMBAT_CONSTANTS.PHYSICAL_DAMAGE_MULTIPLIER;
      case DamageType.ENERGY:
        return COMBAT_CONSTANTS.ENERGY_DAMAGE_MULTIPLIER;
      case DamageType.SPECIAL:
        return COMBAT_CONSTANTS.SPECIAL_DAMAGE_MULTIPLIER;
      default:
        return 1.0;
    }
  }

  calculateCounterDamage(originalDamage: number, isParry: boolean): number {
    const multiplier = isParry 
      ? COMBAT_CONSTANTS.PARRY_MULTIPLIER 
      : COMBAT_CONSTANTS.COUNTER_MULTIPLIER;
    
    return originalDamage * multiplier;
  }

  private recordDamage(fighterId: string, damage: number): void {
    if (!this.damageHistory.has(fighterId)) {
      this.damageHistory.set(fighterId, []);
    }

    const history = this.damageHistory.get(fighterId)!;
    history.push(damage);

    // Keep only recent history (last 10 hits)
    if (history.length > 10) {
      history.shift();
    }
  }

  getStalenessMultiplier(fighterId: string, moveId: string): number {
    // Stale move negation - repeated moves deal less damage
    // For now, just return 1.0, can be expanded later
    return 1.0;
  }

  reset(fighterId: string): void {
    this.damageHistory.delete(fighterId);
  }

  resetAll(): void {
    this.damageHistory.clear();
  }
}

export interface DamageResult {
  newDamage: number;
  actualDamage: number;
  multiplier: number;
  wasKO: boolean;
}

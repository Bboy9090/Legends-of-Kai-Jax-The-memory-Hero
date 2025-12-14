import { ComboState, HitResult } from '@smash-heroes/shared';
import { COMBAT_CONSTANTS } from '@smash-heroes/shared';

export class ComboSystem {
  private combos: Map<string, ComboState> = new Map();

  recordHit(attackerId: string, hitResult: HitResult): void {
    const now = performance.now();
    let combo = this.combos.get(attackerId);

    if (!combo) {
      // Start new combo
      combo = {
        hits: 0,
        damage: 0,
        startTime: now,
        lastHitTime: now,
        multiplier: 1.0,
        isActive: true,
      };
      this.combos.set(attackerId, combo);
    }

    // Check if combo should reset
    if (now - combo.lastHitTime > COMBAT_CONSTANTS.COMBO_RESET_TIME) {
      this.resetCombo(attackerId);
      combo = this.combos.get(attackerId)!;
    }

    // Update combo
    combo.hits++;
    combo.damage += hitResult.damage;
    combo.lastHitTime = now;
    combo.multiplier = this.calculateMultiplier(combo.hits);
    combo.isActive = true;
  }

  getCombo(fighterId: string): ComboState | undefined {
    const combo = this.combos.get(fighterId);
    
    if (!combo) return undefined;

    // Check if combo is still active
    const now = performance.now();
    if (now - combo.lastHitTime > COMBAT_CONSTANTS.COMBO_RESET_TIME) {
      this.resetCombo(fighterId);
      return undefined;
    }

    return combo;
  }

  calculateMultiplier(hits: number): number {
    const multiplier = 1.0 + (hits - 1) * COMBAT_CONSTANTS.COMBO_MULTIPLIER_SCALING;
    return Math.min(multiplier, COMBAT_CONSTANTS.MAX_COMBO_MULTIPLIER);
  }

  resetCombo(fighterId: string): void {
    const combo = this.combos.get(fighterId);
    if (combo) {
      combo.hits = 0;
      combo.damage = 0;
      combo.startTime = performance.now();
      combo.lastHitTime = performance.now();
      combo.multiplier = 1.0;
      combo.isActive = false;
    }
  }

  endCombo(fighterId: string): ComboState | undefined {
    const combo = this.combos.get(fighterId);
    if (combo) {
      combo.isActive = false;
      return { ...combo };
    }
    return undefined;
  }

  isComboActive(fighterId: string): boolean {
    const combo = this.getCombo(fighterId);
    return combo?.isActive ?? false;
  }

  getComboCount(fighterId: string): number {
    return this.getCombo(fighterId)?.hits ?? 0;
  }

  getComboDamage(fighterId: string): number {
    return this.getCombo(fighterId)?.damage ?? 0;
  }

  resetAll(): void {
    this.combos.clear();
  }
}

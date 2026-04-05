export interface AttackData {
  name: string;
  damage: number;
  baseKnockback: number;
  knockbackGrowth: number;
  knockbackAngle: number;
  hitlag: number;
  hitstun: number;
  startupFrames: number;
  activeFrames: number;
  recoveryFrames: number;
  canCancel: boolean;
  nextMoves: string[];
}

export interface MoveSet {
  attacks: Map<string, AttackData>;
  specialMoves: Map<string, AttackData>;
  aerialMoves: Map<string, AttackData>;
  grabs: Map<string, AttackData>;
}

export class MoveSetBuilder {
  private attacks: Map<string, AttackData> = new Map();
  private specialMoves: Map<string, AttackData> = new Map();
  private aerialMoves: Map<string, AttackData> = new Map();
  private grabs: Map<string, AttackData> = new Map();

  addAttack(name: string, data: Partial<AttackData>): this {
    this.attacks.set(name, this.createAttackData(name, data));
    return this;
  }

  addSpecialMove(name: string, data: Partial<AttackData>): this {
    this.specialMoves.set(name, this.createAttackData(name, data));
    return this;
  }

  addAerialMove(name: string, data: Partial<AttackData>): this {
    this.aerialMoves.set(name, this.createAttackData(name, data));
    return this;
  }

  addGrab(name: string, data: Partial<AttackData>): this {
    this.grabs.set(name, this.createAttackData(name, data));
    return this;
  }

  private createAttackData(name: string, partial: Partial<AttackData>): AttackData {
    return {
      name,
      damage: partial.damage ?? 5,
      baseKnockback: partial.baseKnockback ?? 20,
      knockbackGrowth: partial.knockbackGrowth ?? 1.0,
      knockbackAngle: partial.knockbackAngle ?? 45,
      hitlag: partial.hitlag ?? 3,
      hitstun: partial.hitstun ?? 10,
      startupFrames: partial.startupFrames ?? 5,
      activeFrames: partial.activeFrames ?? 3,
      recoveryFrames: partial.recoveryFrames ?? 10,
      canCancel: partial.canCancel ?? false,
      nextMoves: partial.nextMoves ?? [],
    };
  }

  build(): MoveSet {
    return {
      attacks: this.attacks,
      specialMoves: this.specialMoves,
      aerialMoves: this.aerialMoves,
      grabs: this.grabs,
    };
  }
}

export function createBasicMoveSet(): MoveSet {
  const builder = new MoveSetBuilder();
  
  builder
    .addAttack('jab', {
      damage: 3,
      baseKnockback: 10,
      knockbackGrowth: 0.5,
      knockbackAngle: 361,
      startupFrames: 3,
      activeFrames: 2,
      recoveryFrames: 8,
      canCancel: true,
      nextMoves: ['jab2'],
    })
    .addAttack('jab2', {
      damage: 3,
      baseKnockback: 10,
      knockbackGrowth: 0.5,
      knockbackAngle: 361,
      startupFrames: 3,
      activeFrames: 2,
      recoveryFrames: 8,
      canCancel: true,
      nextMoves: ['jab3'],
    })
    .addAttack('jab3', {
      damage: 5,
      baseKnockback: 30,
      knockbackGrowth: 1.0,
      knockbackAngle: 45,
      startupFrames: 4,
      activeFrames: 3,
      recoveryFrames: 15,
    })
    .addAttack('tilt_forward', {
      damage: 8,
      baseKnockback: 25,
      knockbackGrowth: 1.2,
      knockbackAngle: 40,
      startupFrames: 6,
      activeFrames: 4,
      recoveryFrames: 12,
    })
    .addAttack('tilt_up', {
      damage: 7,
      baseKnockback: 30,
      knockbackGrowth: 1.1,
      knockbackAngle: 80,
      startupFrames: 5,
      activeFrames: 4,
      recoveryFrames: 14,
    })
    .addAttack('tilt_down', {
      damage: 6,
      baseKnockback: 15,
      knockbackGrowth: 0.8,
      knockbackAngle: 30,
      startupFrames: 4,
      activeFrames: 3,
      recoveryFrames: 10,
    })
    .addAttack('smash_forward', {
      damage: 16,
      baseKnockback: 40,
      knockbackGrowth: 1.8,
      knockbackAngle: 45,
      startupFrames: 14,
      activeFrames: 4,
      recoveryFrames: 25,
    })
    .addAttack('smash_up', {
      damage: 14,
      baseKnockback: 45,
      knockbackGrowth: 1.9,
      knockbackAngle: 90,
      startupFrames: 12,
      activeFrames: 5,
      recoveryFrames: 22,
    })
    .addAttack('smash_down', {
      damage: 15,
      baseKnockback: 35,
      knockbackGrowth: 1.6,
      knockbackAngle: 30,
      startupFrames: 10,
      activeFrames: 6,
      recoveryFrames: 24,
    });

  builder
    .addAerialMove('nair', {
      damage: 8,
      baseKnockback: 20,
      knockbackGrowth: 1.0,
      knockbackAngle: 45,
      startupFrames: 5,
      activeFrames: 10,
      recoveryFrames: 12,
    })
    .addAerialMove('fair', {
      damage: 10,
      baseKnockback: 25,
      knockbackGrowth: 1.3,
      knockbackAngle: 40,
      startupFrames: 8,
      activeFrames: 4,
      recoveryFrames: 16,
    })
    .addAerialMove('bair', {
      damage: 12,
      baseKnockback: 30,
      knockbackGrowth: 1.4,
      knockbackAngle: 135,
      startupFrames: 7,
      activeFrames: 5,
      recoveryFrames: 18,
    })
    .addAerialMove('uair', {
      damage: 9,
      baseKnockback: 25,
      knockbackGrowth: 1.2,
      knockbackAngle: 80,
      startupFrames: 6,
      activeFrames: 6,
      recoveryFrames: 14,
    })
    .addAerialMove('dair', {
      damage: 11,
      baseKnockback: 35,
      knockbackGrowth: 1.5,
      knockbackAngle: 270,
      startupFrames: 10,
      activeFrames: 4,
      recoveryFrames: 20,
    });

  builder
    .addSpecialMove('neutral_special', {
      damage: 12,
      baseKnockback: 25,
      knockbackGrowth: 1.2,
      knockbackAngle: 45,
      startupFrames: 15,
      activeFrames: 5,
      recoveryFrames: 20,
    })
    .addSpecialMove('side_special', {
      damage: 10,
      baseKnockback: 30,
      knockbackGrowth: 1.3,
      knockbackAngle: 35,
      startupFrames: 12,
      activeFrames: 8,
      recoveryFrames: 18,
    })
    .addSpecialMove('up_special', {
      damage: 8,
      baseKnockback: 20,
      knockbackGrowth: 1.0,
      knockbackAngle: 80,
      startupFrames: 8,
      activeFrames: 12,
      recoveryFrames: 25,
    })
    .addSpecialMove('down_special', {
      damage: 14,
      baseKnockback: 35,
      knockbackGrowth: 1.5,
      knockbackAngle: 50,
      startupFrames: 5,
      activeFrames: 15,
      recoveryFrames: 30,
    });

  builder
    .addGrab('grab', {
      damage: 0,
      baseKnockback: 0,
      knockbackGrowth: 0,
      knockbackAngle: 0,
      startupFrames: 6,
      activeFrames: 3,
      recoveryFrames: 25,
    })
    .addGrab('pummel', {
      damage: 2,
      baseKnockback: 0,
      knockbackGrowth: 0,
      knockbackAngle: 0,
      startupFrames: 3,
      activeFrames: 2,
      recoveryFrames: 10,
    })
    .addGrab('throw_forward', {
      damage: 8,
      baseKnockback: 40,
      knockbackGrowth: 1.2,
      knockbackAngle: 45,
      startupFrames: 10,
      activeFrames: 2,
      recoveryFrames: 20,
    })
    .addGrab('throw_back', {
      damage: 10,
      baseKnockback: 45,
      knockbackGrowth: 1.4,
      knockbackAngle: 135,
      startupFrames: 12,
      activeFrames: 2,
      recoveryFrames: 22,
    })
    .addGrab('throw_up', {
      damage: 7,
      baseKnockback: 50,
      knockbackGrowth: 1.1,
      knockbackAngle: 90,
      startupFrames: 8,
      activeFrames: 2,
      recoveryFrames: 18,
    })
    .addGrab('throw_down', {
      damage: 6,
      baseKnockback: 30,
      knockbackGrowth: 1.0,
      knockbackAngle: 270,
      startupFrames: 8,
      activeFrames: 2,
      recoveryFrames: 18,
    });

  return builder.build();
}

export function getAttackDamage(moveSet: MoveSet, attackName: string): number {
  const attack = moveSet.attacks.get(attackName) 
    || moveSet.specialMoves.get(attackName)
    || moveSet.aerialMoves.get(attackName)
    || moveSet.grabs.get(attackName);
  return attack?.damage ?? 5;
}

export function getAttackFrameData(moveSet: MoveSet, attackName: string): { startup: number; active: number; recovery: number } | null {
  const attack = moveSet.attacks.get(attackName) 
    || moveSet.specialMoves.get(attackName)
    || moveSet.aerialMoves.get(attackName)
    || moveSet.grabs.get(attackName);
  
  if (!attack) return null;
  
  return {
    startup: attack.startupFrames,
    active: attack.activeFrames,
    recovery: attack.recoveryFrames,
  };
}

export function canCancelInto(moveSet: MoveSet, currentAttack: string, nextAttack: string): boolean {
  const attack = moveSet.attacks.get(currentAttack);
  if (!attack) return false;
  return attack.canCancel && attack.nextMoves.includes(nextAttack);
}

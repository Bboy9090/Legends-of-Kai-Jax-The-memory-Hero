import { MoveSet as IMoveSet, AttackData, DamageType } from '@smash-heroes/shared';

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

  build(): IMoveSet {
    return {
      attacks: this.attacks,
      specialMoves: this.specialMoves,
      aerialMoves: this.aerialMoves,
      grabs: this.grabs,
    };
  }
}

export function createBasicAttacks(): Map<string, AttackData> {
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
    });

  return builder.build().attacks;
}

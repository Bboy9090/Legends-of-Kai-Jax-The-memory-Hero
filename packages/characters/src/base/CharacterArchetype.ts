/**
 * Character Archetype System - Narrative integration through fighting style
 * Life Path numbers and zodiac signs influence combat behavior
 */
export class CharacterArchetype {
  readonly lifePath: LifePath;
  readonly zodiac: ZodiacSign;
  readonly combatModifiers: CombatModifiers;
  readonly personalityTraits: PersonalityTraits;

  constructor(lifePath: LifePath, zodiac: ZodiacSign) {
    this.lifePath = lifePath;
    this.zodiac = zodiac;
    this.combatModifiers = this.calculateCombatModifiers();
    this.personalityTraits = this.determinePersonality();
  }

  /**
   * Calculate combat modifiers based on archetype
   */
  private calculateCombatModifiers(): CombatModifiers {
    const lifePathMods = this.getLifePathModifiers(this.lifePath);
    const zodiacMods = this.getZodiacModifiers(this.zodiac);

    // Combine modifiers with defaults
    return {
      attackSpeed: (lifePathMods.attackSpeed ?? 1.0) * (zodiacMods.attackSpeed ?? 1.0),
      movementSpeed: (lifePathMods.movementSpeed ?? 1.0) * (zodiacMods.movementSpeed ?? 1.0),
      defense: (lifePathMods.defense ?? 1.0) * (zodiacMods.defense ?? 1.0),
      specialPower: (lifePathMods.specialPower ?? 1.0) * (zodiacMods.specialPower ?? 1.0),
      comboExtension: (lifePathMods.comboExtension ?? 0) + (zodiacMods.comboExtension ?? 0),
      counterWindow: (lifePathMods.counterWindow ?? 0) + (zodiacMods.counterWindow ?? 0),
      aggression: zodiacMods.aggression ?? 0.5,
      precision: lifePathMods.precision ?? 1.0,
    };
  }

  /**
   * Get Life Path specific modifiers
   */
  private getLifePathModifiers(lifePath: LifePath): Partial<CombatModifiers> {
    switch (lifePath) {
      case LifePath.ONE_LEADER:
        return {
          attackSpeed: 1.1,
          movementSpeed: 1.0,
          defense: 1.0,
          specialPower: 1.2,
          comboExtension: 0,
          counterWindow: 0,
          precision: 0.8,
        };

      case LifePath.TWO_DIPLOMAT:
        return {
          attackSpeed: 0.95,
          movementSpeed: 1.05,
          defense: 1.1,
          specialPower: 1.0,
          comboExtension: 2,
          counterWindow: 3,
          precision: 0.9,
        };

      case LifePath.THREE_CREATIVE:
        return {
          attackSpeed: 1.05,
          movementSpeed: 1.1,
          defense: 0.9,
          specialPower: 1.15,
          comboExtension: 3,
          counterWindow: 0,
          precision: 0.85,
        };

      case LifePath.FOUR_BUILDER:
        return {
          attackSpeed: 0.9,
          movementSpeed: 0.95,
          defense: 1.2,
          specialPower: 0.95,
          comboExtension: 0,
          counterWindow: 2,
          precision: 1.0,
        };

      case LifePath.FIVE_ADVENTURER:
        return {
          attackSpeed: 1.15,
          movementSpeed: 1.2,
          defense: 0.85,
          specialPower: 1.1,
          comboExtension: 2,
          counterWindow: -1,
          precision: 0.75,
        };

      case LifePath.SIX_NURTURER:
        return {
          attackSpeed: 0.95,
          movementSpeed: 1.0,
          defense: 1.15,
          specialPower: 1.0,
          comboExtension: 1,
          counterWindow: 4,
          precision: 0.9,
        };

      case LifePath.SEVEN_SEEKER:
        return {
          attackSpeed: 1.0,
          movementSpeed: 1.05,
          defense: 0.95,
          specialPower: 1.25,
          comboExtension: 1,
          counterWindow: 2,
          precision: 1.1,
        };

      case LifePath.EIGHT_POWERHOUSE:
        return {
          attackSpeed: 0.95,
          movementSpeed: 0.9,
          defense: 1.15,
          specialPower: 1.3,
          comboExtension: 0,
          counterWindow: 1,
          precision: 0.85,
        };

      case LifePath.NINE_HUMANITARIAN:
        // Life Path 9 / Virgo: Disciplined, analytical, devastatingly efficient
        return {
          attackSpeed: 1.0,
          movementSpeed: 1.0,
          defense: 1.05,
          specialPower: 1.1,
          comboExtension: 2,
          counterWindow: 5, // Excellent timing
          precision: 1.2, // Devastatingly efficient
        };

      default:
        return {
          attackSpeed: 1.0,
          movementSpeed: 1.0,
          defense: 1.0,
          specialPower: 1.0,
          comboExtension: 0,
          counterWindow: 0,
          precision: 1.0,
        };
    }
  }

  /**
   * Get Zodiac specific modifiers
   */
  private getZodiacModifiers(zodiac: ZodiacSign): Partial<CombatModifiers> {
    switch (zodiac) {
      case ZodiacSign.ARIES:
        return { attackSpeed: 1.1, movementSpeed: 1.05, defense: 0.95, specialPower: 1.05, comboExtension: 0, counterWindow: -1, aggression: 0.8 };
      case ZodiacSign.TAURUS:
        return { attackSpeed: 0.95, movementSpeed: 0.9, defense: 1.2, specialPower: 1.0, comboExtension: 0, counterWindow: 2, aggression: 0.4 };
      case ZodiacSign.GEMINI:
        return { attackSpeed: 1.15, movementSpeed: 1.15, defense: 0.9, specialPower: 1.0, comboExtension: 3, counterWindow: 0, aggression: 0.6 };
      case ZodiacSign.CANCER:
        return { attackSpeed: 0.95, movementSpeed: 1.0, defense: 1.15, specialPower: 0.95, comboExtension: 1, counterWindow: 3, aggression: 0.3 };
      case ZodiacSign.LEO:
        return { attackSpeed: 1.1, movementSpeed: 1.05, defense: 1.0, specialPower: 1.2, comboExtension: 1, counterWindow: 0, aggression: 0.7 };
      case ZodiacSign.VIRGO:
        // Virgo: Analytical, precise, efficient
        return { attackSpeed: 1.0, movementSpeed: 1.0, defense: 1.05, specialPower: 1.05, comboExtension: 2, counterWindow: 4, aggression: 0.5 };
      case ZodiacSign.LIBRA:
        return { attackSpeed: 1.05, movementSpeed: 1.05, defense: 1.0, specialPower: 1.0, comboExtension: 2, counterWindow: 2, aggression: 0.5 };
      case ZodiacSign.SCORPIO:
        return { attackSpeed: 1.05, movementSpeed: 1.0, defense: 1.0, specialPower: 1.25, comboExtension: 1, counterWindow: 3, aggression: 0.7 };
      case ZodiacSign.SAGITTARIUS:
        return { attackSpeed: 1.1, movementSpeed: 1.2, defense: 0.9, specialPower: 1.1, comboExtension: 2, counterWindow: 0, aggression: 0.7 };
      case ZodiacSign.CAPRICORN:
        return { attackSpeed: 0.95, movementSpeed: 0.95, defense: 1.15, specialPower: 1.0, comboExtension: 0, counterWindow: 3, aggression: 0.4 };
      case ZodiacSign.AQUARIUS:
        return { attackSpeed: 1.05, movementSpeed: 1.1, defense: 0.95, specialPower: 1.15, comboExtension: 2, counterWindow: 1, aggression: 0.6 };
      case ZodiacSign.PISCES:
        return { attackSpeed: 0.95, movementSpeed: 1.0, defense: 1.05, specialPower: 1.1, comboExtension: 3, counterWindow: 2, aggression: 0.4 };
      default:
        return { attackSpeed: 1.0, movementSpeed: 1.0, defense: 1.0, specialPower: 1.0, comboExtension: 0, counterWindow: 0, aggression: 0.5 };
    }
  }

  /**
   * Determine personality traits for narrative integration
   */
  private determinePersonality(): PersonalityTraits {
    const traits: PersonalityTraits = {
      fightingStyle: this.getFightingStyle(),
      strengths: this.getStrengths(),
      weaknesses: this.getWeaknesses(),
      preferredRange: this.getPreferredRange(),
      specialMechanic: this.getSpecialMechanic(),
    };

    return traits;
  }

  private getFightingStyle(): string {
    // Combine Life Path and Zodiac for unique style
    if (this.lifePath === LifePath.NINE_HUMANITARIAN && this.zodiac === ZodiacSign.VIRGO) {
      return 'Disciplined Perfectionist - Analytical and devastatingly efficient';
    }
    
    const styles = [
      'Aggressive Rushdown',
      'Defensive Fortress',
      'Balanced All-Rounder',
      'Technical Specialist',
      'Momentum Fighter',
      'Counter Puncher',
    ];
    
    const zodiacIndex = Object.values(ZodiacSign).indexOf(this.zodiac);
    const index = zodiacIndex >= 0 
      ? (this.lifePath + zodiacIndex) % styles.length
      : this.lifePath % styles.length;
    return styles[index] ?? 'Balanced All-Rounder';
  }

  private getStrengths(): string[] {
    const strengths: string[] = [];
    
    if (this.combatModifiers.attackSpeed > 1.05) strengths.push('Fast attacks');
    if (this.combatModifiers.movementSpeed > 1.05) strengths.push('High mobility');
    if (this.combatModifiers.defense > 1.05) strengths.push('Tanky');
    if (this.combatModifiers.specialPower > 1.1) strengths.push('Powerful specials');
    if (this.combatModifiers.comboExtension > 1) strengths.push('Combo master');
    if (this.combatModifiers.counterWindow > 2) strengths.push('Excellent timing');
    if (this.combatModifiers.precision > 1.0) strengths.push('Precise execution');
    
    return strengths.length > 0 ? strengths : ['Well-rounded'];
  }

  private getWeaknesses(): string[] {
    const weaknesses: string[] = [];
    
    if (this.combatModifiers.attackSpeed < 0.95) weaknesses.push('Slow attacks');
    if (this.combatModifiers.movementSpeed < 0.95) weaknesses.push('Low mobility');
    if (this.combatModifiers.defense < 0.95) weaknesses.push('Fragile');
    if (this.combatModifiers.specialPower < 0.95) weaknesses.push('Weak specials');
    if (this.combatModifiers.comboExtension < 0) weaknesses.push('Limited combos');
    if (this.combatModifiers.counterWindow < 0) weaknesses.push('Poor defense');
    
    return weaknesses.length > 0 ? weaknesses : ['None significant'];
  }

  private getPreferredRange(): 'close' | 'mid' | 'long' {
    if (this.combatModifiers.aggression > 0.6) return 'close';
    if (this.combatModifiers.defense > 1.1) return 'mid';
    return 'mid';
  }

  private getSpecialMechanic(): string {
    // Special mechanic based on archetype
    if (this.lifePath === LifePath.NINE_HUMANITARIAN) {
      return 'Perfect Counter - Grants bonus damage on precise timing';
    }
    if (this.combatModifiers.comboExtension > 2) {
      return 'Combo Mastery - Extended combo windows';
    }
    if (this.combatModifiers.specialPower > 1.2) {
      return 'Power Surge - Special moves deal extra damage';
    }
    if (this.combatModifiers.counterWindow > 3) {
      return 'Counter Specialist - Extended parry window';
    }
    
    return 'Balanced Kit - No special mechanic';
  }

  /**
   * Get description for environmental storytelling
   */
  getBackstoryHook(): string {
    const hooks: Record<LifePath, string> = {
      [LifePath.ONE_LEADER]: 'Born to lead, fights with unwavering confidence',
      [LifePath.TWO_DIPLOMAT]: 'Seeks harmony through calculated combat',
      [LifePath.THREE_CREATIVE]: 'Expresses artistry through fluid motion',
      [LifePath.FOUR_BUILDER]: 'Methodical and unshakeable foundation',
      [LifePath.FIVE_ADVENTURER]: 'Thrives on chaos and unpredictability',
      [LifePath.SIX_NURTURER]: 'Protective fighter with defensive mastery',
      [LifePath.SEVEN_SEEKER]: 'Analytical combatant seeking perfection',
      [LifePath.EIGHT_POWERHOUSE]: 'Raw power and intimidating presence',
      [LifePath.NINE_HUMANITARIAN]: 'Fights for a greater purpose with precision',
    };

    return hooks[this.lifePath] || 'A mysterious fighter';
  }
}

export enum LifePath {
  ONE_LEADER = 1,
  TWO_DIPLOMAT = 2,
  THREE_CREATIVE = 3,
  FOUR_BUILDER = 4,
  FIVE_ADVENTURER = 5,
  SIX_NURTURER = 6,
  SEVEN_SEEKER = 7,
  EIGHT_POWERHOUSE = 8,
  NINE_HUMANITARIAN = 9,
}

export enum ZodiacSign {
  ARIES = 'aries',
  TAURUS = 'taurus',
  GEMINI = 'gemini',
  CANCER = 'cancer',
  LEO = 'leo',
  VIRGO = 'virgo',
  LIBRA = 'libra',
  SCORPIO = 'scorpio',
  SAGITTARIUS = 'sagittarius',
  CAPRICORN = 'capricorn',
  AQUARIUS = 'aquarius',
  PISCES = 'pisces',
}

export interface CombatModifiers {
  attackSpeed: number;
  movementSpeed: number;
  defense: number;
  specialPower: number;
  comboExtension: number;
  counterWindow: number;
  aggression: number;
  precision: number;
}

export interface PersonalityTraits {
  fightingStyle: string;
  strengths: string[];
  weaknesses: string[];
  preferredRange: 'close' | 'mid' | 'long';
  specialMechanic: string;
}

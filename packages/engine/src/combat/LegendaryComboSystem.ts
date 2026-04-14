/**
 * LEGENDARY COMBO SYSTEM - BEYOND BEYOND LEGENDARY
 * 
 * World-class combo system with:
 * - Extended combo windows
 * - Combo route bonuses
 * - Perfect timing bonuses
 * - Aerial combo support
 * - Team combo support
 * - Visual feedback tiers
 */

import { ComboState, HitResult } from '@beast-kin/shared';
import { LEGENDARY_COMBAT_CONSTANTS } from '@beast-kin/shared';

export interface LegendaryComboState extends ComboState {
  // Extended combo data
  perfectHits: number; // Number of perfect timing hits
  routeBonus: number; // Bonus from following combo routes
  aerialHits: number; // Number of aerial hits
  teamHits: number; // Number of team combo hits
  tier: 'good' | 'great' | 'amazing' | 'legendary' | 'infinite' | null;
  lastHitType: 'light' | 'heavy' | 'special' | 'aerial' | 'slam' | null;
  comboRoute: string[]; // Sequence of attacks in combo
  maxMultiplier: number; // Maximum multiplier achieved
}

export class LegendaryComboSystem {
  private combos: Map<string, LegendaryComboState> = new Map();
  private comboRoutes: Map<string, string[]> = new Map(); // Predefined combo routes

  constructor() {
    this.initializeComboRoutes();
  }

  /**
   * Initialize predefined combo routes for bonus damage
   */
  private initializeComboRoutes(): void {
    // Light combo routes
    this.comboRoutes.set('light_chain', ['light1', 'light2', 'light3', 'light4', 'light5']);
    this.comboRoutes.set('light_heavy', ['light1', 'light2', 'heavy1', 'heavy2', 'launcher']);
    this.comboRoutes.set('heavy_chain', ['heavy1', 'heavy2', 'heavy3', 'slam']);
    
    // Aerial routes
    this.comboRoutes.set('aerial_chain', ['launcher', 'aerial1', 'aerial2', 'aerial3', 'slam']);
    this.comboRoutes.set('air_to_ground', ['aerial1', 'aerial2', 'slam', 'light1']);
    
    // Special routes
    this.comboRoutes.set('special_chain', ['light1', 'light2', 'special', 'heavy1', 'heavy2']);
    this.comboRoutes.set('ultimate_setup', ['light1', 'heavy1', 'special', 'ultimate']);
  }

  /**
   * Record a hit with enhanced combo tracking
   */
  recordHit(
    attackerId: string,
    hitResult: HitResult,
    hitType: 'light' | 'heavy' | 'special' | 'aerial' | 'slam',
    isPerfectTiming: boolean = false,
    isAerial: boolean = false,
    isTeamCombo: boolean = false
  ): void {
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
        perfectHits: 0,
        routeBonus: 0,
        aerialHits: 0,
        teamHits: 0,
        tier: null,
        lastHitType: null,
        comboRoute: [],
        maxMultiplier: 1.0,
      };
      this.combos.set(attackerId, combo);
    }

    // Check if combo should reset (extended window)
    const resetTime = isPerfectTiming 
      ? LEGENDARY_COMBAT_CONSTANTS.COMBO.EXTENDED_WINDOW 
      : LEGENDARY_COMBAT_CONSTANTS.COMBO.RESET_TIME;
    
    if (now - combo.lastHitTime > resetTime) {
      this.resetCombo(attackerId);
      combo = this.combos.get(attackerId)!;
    }

    // Update combo
    combo.hits++;
    combo.damage += hitResult.damage;
    combo.lastHitTime = now;
    combo.lastHitType = hitType;
    combo.comboRoute.push(hitType);
    
    // Track perfect hits
    if (isPerfectTiming) {
      combo.perfectHits++;
    }
    
    // Track aerial hits
    if (isAerial) {
      combo.aerialHits++;
    }
    
    // Track team hits
    if (isTeamCombo) {
      combo.teamHits++;
    }
    
    // Calculate route bonus
    combo.routeBonus = this.calculateRouteBonus(combo.comboRoute);
    
    // Calculate multiplier with all bonuses
    combo.multiplier = this.calculateAdvancedMultiplier(combo);
    combo.maxMultiplier = Math.max(combo.maxMultiplier, combo.multiplier);
    
    // Determine tier
    combo.tier = this.getComboTier(combo.hits);
    
    combo.isActive = true;
  }

  /**
   * Calculate advanced multiplier with all bonuses
   */
  private calculateAdvancedMultiplier(combo: LegendaryComboState): number {
    let multiplier = 1.0;
    
    // Base combo scaling
    multiplier += (combo.hits - 1) * LEGENDARY_COMBAT_CONSTANTS.COMBO.MULTIPLIER_SCALING;
    
    // Perfect timing bonus
    if (combo.perfectHits > 0) {
      multiplier += combo.perfectHits * LEGENDARY_COMBAT_CONSTANTS.COMBO.PERFECT_COMBO_BONUS;
    }
    
    // Route bonus
    multiplier += combo.routeBonus * LEGENDARY_COMBAT_CONSTANTS.COMBO.ROUTE_BONUS;
    
    // Aerial combo bonus
    if (combo.aerialHits > 0) {
      multiplier += combo.aerialHits * LEGENDARY_COMBAT_CONSTANTS.COMBO.AIR_COMBO_BONUS;
    }
    
    // Team combo bonus
    if (combo.teamHits > 0) {
      multiplier += combo.teamHits * LEGENDARY_COMBAT_CONSTANTS.COMBO.TEAM_COMBO_BONUS;
    }
    
    return Math.min(multiplier, LEGENDARY_COMBAT_CONSTANTS.COMBO.MAX_MULTIPLIER);
  }

  /**
   * Calculate route bonus for following combo routes
   */
  private calculateRouteBonus(route: string[]): number {
    if (route.length < 2) return 0;
    
    let bonus = 0;
    
    // Check against all predefined routes
    this.comboRoutes.forEach((predefinedRoute, routeId) => {
      // Check if current route matches start of predefined route
      const matchLength = this.getRouteMatchLength(route, predefinedRoute);
      if (matchLength >= 3) { // At least 3 matching hits
        bonus += matchLength * 0.1; // 10% per matching hit
      }
    });
    
    return Math.min(bonus, 1.0); // Cap at 100% bonus
  }

  /**
   * Get length of matching route sequence
   */
  private getRouteMatchLength(route: string[], predefinedRoute: string[]): number {
    let matchLength = 0;
    const minLength = Math.min(route.length, predefinedRoute.length);
    
    for (let i = 0; i < minLength; i++) {
      if (route[i] === predefinedRoute[i]) {
        matchLength++;
      } else {
        break;
      }
    }
    
    return matchLength;
  }

  /**
   * Get combo tier based on hit count
   */
  private getComboTier(hits: number): 'good' | 'great' | 'amazing' | 'legendary' | 'infinite' | null {
    if (hits >= LEGENDARY_COMBAT_CONSTANTS.COMBO.TIERS.INFINITE) return 'infinite';
    if (hits >= LEGENDARY_COMBAT_CONSTANTS.COMBO.TIERS.LEGENDARY) return 'legendary';
    if (hits >= LEGENDARY_COMBAT_CONSTANTS.COMBO.TIERS.AMAZING) return 'amazing';
    if (hits >= LEGENDARY_COMBAT_CONSTANTS.COMBO.TIERS.GREAT) return 'great';
    if (hits >= LEGENDARY_COMBAT_CONSTANTS.COMBO.TIERS.GOOD) return 'good';
    return null;
  }

  /**
   * Get combo state with all legendary data
   */
  getCombo(fighterId: string): LegendaryComboState | undefined {
    const combo = this.combos.get(fighterId);
    if (!combo) return undefined;

    // Check if combo is still active
    const now = performance.now();
    const resetTime = combo.perfectHits > 0
      ? LEGENDARY_COMBAT_CONSTANTS.COMBO.EXTENDED_WINDOW
      : LEGENDARY_COMBAT_CONSTANTS.COMBO.RESET_TIME;
    
    if (now - combo.lastHitTime > resetTime) {
      this.resetCombo(fighterId);
      return undefined;
    }

    return combo;
  }

  /**
   * Get combo display text
   */
  getComboDisplayText(fighterId: string): string {
    const combo = this.getCombo(fighterId);
    if (!combo || !combo.tier) return '';
    
    const tierText = {
      good: 'GOOD!',
      great: 'GREAT!',
      amazing: 'AMAZING!',
      legendary: 'LEGENDARY!',
      infinite: 'INFINITE!',
    };
    
    return `${combo.hits} HIT ${tierText[combo.tier]}`;
  }

  /**
   * Get combo color based on tier
   */
  getComboColor(fighterId: string): string {
    const combo = this.getCombo(fighterId);
    if (!combo || !combo.tier) return '#FFFFFF';
    
    const colors = {
      good: '#00FF00',      // Green
      great: '#00FFFF',     // Cyan
      amazing: '#FF00FF',   // Magenta
      legendary: '#FFD700', // Gold
      infinite: '#FF0000',  // Red
    };
    
    return colors[combo.tier];
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
      combo.perfectHits = 0;
      combo.routeBonus = 0;
      combo.aerialHits = 0;
      combo.teamHits = 0;
      combo.tier = null;
      combo.lastHitType = null;
      combo.comboRoute = [];
      combo.maxMultiplier = 1.0;
    }
  }

  resetAll(): void {
    this.combos.clear();
  }
}

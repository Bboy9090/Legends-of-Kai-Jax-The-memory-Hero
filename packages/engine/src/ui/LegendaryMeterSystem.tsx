/**
 * LEGENDARY METER SYSTEM - BEYOND BEYOND LEGENDARY
 * 
 * World-class UI meter system with:
 * - Ultimate meter
 * - Resonance meter
 * - Reflex meter
 * - Combo meter
 * - Health bars
 * - Visual feedback
 */

import * as THREE from 'three';
import { LEGENDARY_COMBAT_CONSTANTS } from '@legends-of-kai-jax/shared';

export interface MeterState {
  ultimate: number; // 0-100 (can overflow)
  resonance: number; // 0-100
  reflex: number; // 0-100
  combo: number; // Combo count
  health: number; // 0-100
  maxHealth: number;
}

export interface MeterVisualConfig {
  position: { x: number; y: number };
  size: { width: number; height: number };
  colors: {
    fill: string;
    glow: string;
    background: string;
    overflow: string;
  };
  glowIntensity: number;
  animationSpeed: number;
}

export class LegendaryMeterSystem {
  private meters: Map<string, MeterState> = new Map();
  private visualConfigs: Map<string, MeterVisualConfig> = new Map();

  constructor() {
    this.initializeDefaultConfigs();
  }

  /**
   * Initialize default visual configurations
   */
  private initializeDefaultConfigs(): void {
    // Ultimate Meter
    this.visualConfigs.set('ultimate', {
      position: { x: 0, y: -0.9 },
      size: { width: 0.6, height: 0.05 },
      colors: {
        fill: '#FFD700', // Gold
        glow: '#FFFF00', // Yellow glow
        background: '#333333',
        overflow: '#FF0000', // Red for overflow
      },
      glowIntensity: 1.5,
      animationSpeed: 2.0,
    });

    // Resonance Meter
    this.visualConfigs.set('resonance', {
      position: { x: -0.9, y: 0.8 },
      size: { width: 0.03, height: 0.3 },
      colors: {
        fill: '#FF00FF', // Magenta
        glow: '#FF88FF',
        background: '#333333',
        overflow: '#FFFFFF',
      },
      glowIntensity: 1.2,
      animationSpeed: 1.5,
    });

    // Reflex Meter
    this.visualConfigs.set('reflex', {
      position: { x: 0.9, y: 0.8 },
      size: { width: 0.03, height: 0.3 },
      colors: {
        fill: '#00FFFF', // Cyan
        glow: '#88FFFF',
        background: '#333333',
        overflow: '#FFFFFF',
      },
      glowIntensity: 1.2,
      animationSpeed: 1.5,
    });

    // Combo Meter
    this.visualConfigs.set('combo', {
      position: { x: 0, y: 0.85 },
      size: { width: 0.4, height: 0.1 },
      colors: {
        fill: '#FFFFFF',
        glow: '#00FFFF',
        background: 'transparent',
        overflow: '#FF0000',
      },
      glowIntensity: 2.0,
      animationSpeed: 3.0,
    });

    // Health Bar
    this.visualConfigs.set('health', {
      position: { x: -0.9, y: -0.9 },
      size: { width: 0.4, height: 0.05 },
      colors: {
        fill: '#00FF00', // Green
        glow: '#88FF88',
        background: '#333333',
        overflow: '#FF0000', // Red when low
      },
      glowIntensity: 1.0,
      animationSpeed: 1.0,
    });
  }

  /**
   * Update meter value
   */
  updateMeter(fighterId: string, meterType: 'ultimate' | 'resonance' | 'reflex' | 'combo' | 'health', value: number): void {
    if (!this.meters.has(fighterId)) {
      this.meters.set(fighterId, {
        ultimate: 0,
        resonance: 0,
        reflex: 0,
        combo: 0,
        health: 100,
        maxHealth: 100,
      });
    }

    const meter = this.meters.get(fighterId)!;
    
    switch (meterType) {
      case 'ultimate':
        meter.ultimate = Math.max(0, value);
        if (LEGENDARY_COMBAT_CONSTANTS.METERS.ULTIMATE.OVERFLOW) {
          // Can exceed 100%
        }
        break;
      case 'resonance':
        meter.resonance = Math.max(0, Math.min(100, value));
        break;
      case 'reflex':
        meter.reflex = Math.max(0, Math.min(100, value));
        break;
      case 'combo':
        meter.combo = Math.max(0, value);
        break;
      case 'health':
        meter.health = Math.max(0, Math.min(meter.maxHealth, value));
        break;
    }
  }

  /**
   * Get meter state
   */
  getMeterState(fighterId: string): MeterState | undefined {
    return this.meters.get(fighterId);
  }

  /**
   * Get meter visual config
   */
  getMeterConfig(meterType: string): MeterVisualConfig | undefined {
    return this.visualConfigs.get(meterType);
  }

  /**
   * Get meter color based on value
   */
  getMeterColor(meterType: string, value: number, maxValue: number = 100): string {
    const config = this.visualConfigs.get(meterType);
    if (!config) return '#FFFFFF';

    const percentage = value / maxValue;

    // Color shifts based on percentage
    if (meterType === 'health') {
      if (percentage < 0.25) return config.colors.overflow; // Red when low
      if (percentage < 0.5) return '#FFAA00'; // Orange
      return config.colors.fill; // Green
    }

    if (meterType === 'ultimate' && percentage > 1.0) {
      return config.colors.overflow; // Red for overflow
    }

    return config.colors.fill;
  }

  /**
   * Get combo display text
   */
  getComboDisplayText(fighterId: string): string {
    const meter = this.meters.get(fighterId);
    if (!meter || meter.combo === 0) return '';

    const tier = this.getComboTier(meter.combo);
    const tierText = tier ? `${tier.toUpperCase()}! ` : '';
    
    return `${tierText}${meter.combo} HIT COMBO`;
  }

  /**
   * Get combo tier
   */
  private getComboTier(hits: number): string | null {
    if (hits >= 100) return 'INFINITE';
    if (hits >= 50) return 'LEGENDARY';
    if (hits >= 20) return 'AMAZING';
    if (hits >= 10) return 'GREAT';
    if (hits >= 5) return 'GOOD';
    return null;
  }

  /**
   * Reset all meters
   */
  reset(): void {
    this.meters.clear();
  }
}

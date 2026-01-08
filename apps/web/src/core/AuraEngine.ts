/**
 * THE AETERNA COVENANT - AURA ENGINE
 * The Dread System - When the enemy approaches, the screen glitches
 * Resonance: R_p = (A_g × W_l) + M_a
 */

import { bus } from './EventBus';

export interface AuraConfig {
    maxDreadLevel?: number;
    proximityThreshold?: number;
    dreadIncreaseRate?: number;
    dreadDecreaseRate?: number;
    glitchThreshold?: number;
}

export class AuraEngine {
    private dreadLevel: number = 0;
    private resonance: number = 0;
    private config: AuraConfig = {
        maxDreadLevel: 100,
        proximityThreshold: 200, // pixels/units
        dreadIncreaseRate: 2,
        dreadDecreaseRate: 1,
        glitchThreshold: 80
    };

    constructor(config?: AuraConfig) {
        if (config) {
            this.config = { ...this.config, ...config };
        }
    }

    /**
     * Update dread level based on enemy proximity
     * Resonance: R_p = (A_g × W_l) + M_a
     * Where:
     * - A_g = Aggression level
     * - W_l = Weave level (connection to the Aeterna)
     * - M_a = Memory anchor strength
     */
    update(enemyProximity: number, aggressionLevel: number = 1.0, weaveLevel: number = 1.0, memoryAnchor: number = 0) {
        // Calculate resonance power
        const resonancePower = (aggressionLevel * weaveLevel) + memoryAnchor;
        
        // Update resonance
        this.resonance = Math.min(100, Math.max(0, resonancePower * 10));

        // Update dread based on proximity
        if (enemyProximity < this.config.proximityThreshold!) {
            // Enemy is close - increase dread
            this.dreadLevel = Math.min(
                this.config.maxDreadLevel!,
                this.dreadLevel + (this.config.dreadIncreaseRate! * (1 - enemyProximity / this.config.proximityThreshold!))
            );
        } else {
            // Enemy is far - decrease dread
            this.dreadLevel = Math.max(0, this.dreadLevel - this.config.dreadDecreaseRate!);
        }

        // Emit events based on dread level
        if (this.dreadLevel > this.config.glitchThreshold!) {
            bus.emit('VFX_GLITCH_INTENSE', { 
                intensity: (this.dreadLevel - this.config.glitchThreshold!) / (this.config.maxDreadLevel! - this.config.glitchThreshold!),
                dreadLevel: this.dreadLevel
            });
        }

        if (this.dreadLevel > 90) {
            bus.emit('VFX_GLITCH_CRITICAL', { dreadLevel: this.dreadLevel });
        }

        // Update UI
        bus.emit('UI_UPDATE_DREAD', { 
            dreadLevel: this.dreadLevel,
            resonance: this.resonance
        });

        // Emit resonance update
        bus.emit('RESONANCE_UPDATE', { 
            resonance: this.resonance,
            resonancePower: resonancePower
        });
    }

    /**
     * Get current dread level
     */
    getDreadLevel(): number {
        return this.dreadLevel;
    }

    /**
     * Get current resonance
     */
    getResonance(): number {
        return this.resonance;
    }

    /**
     * Set dread level directly (for cutscenes/special events)
     */
    setDreadLevel(level: number) {
        this.dreadLevel = Math.min(this.config.maxDreadLevel!, Math.max(0, level));
        bus.emit('UI_UPDATE_DREAD', { 
            dreadLevel: this.dreadLevel,
            resonance: this.resonance
        });
    }

    /**
     * Reset dread to zero
     */
    resetDread() {
        this.dreadLevel = 0;
        bus.emit('UI_UPDATE_DREAD', { 
            dreadLevel: this.dreadLevel,
            resonance: this.resonance
        });
    }

    /**
     * Add resonance (for power scaling)
     */
    addResonance(amount: number) {
        this.resonance = Math.min(100, Math.max(0, this.resonance + amount));
        bus.emit('RESONANCE_UPDATE', { 
            resonance: this.resonance
        });
    }
}

// Singleton instance
export const auraEngine = new AuraEngine();

/**
 * LEGENDS OF KAI-JAX: THE MEMORY KING - COMBAT STATE MACHINE
 * Frame-Data Logic - Telegraph → Commit → Active → Recovery
 * Every attack follows the sacred cycle.
 */

import { bus } from './EventBus';

export enum CombatState {
    IDLE = 'IDLE',
    TELEGRAPH = 'TELEGRAPH',  // Yellow - Warning phase
    COMMIT = 'COMMIT',        // Wind-up phase
    ACTIVE = 'ACTIVE',        // Cyan - Hitbox active
    RECOVERY = 'RECOVERY',    // Vulnerable phase
    HITSTOP = 'HITSTOP'       // Frame freeze on hit
}

export interface CombatStateConfig {
    telegraphFrames?: number;
    commitFrames?: number;
    activeFrames?: number;
    recoveryFrames?: number;
    hitstopFrames?: number;
}

export class CombatStateMachine {
    public state: CombatState = CombatState.IDLE;
    private timer: number = 0;
    private config: CombatStateConfig = {
        telegraphFrames: 8,
        commitFrames: 4,
        activeFrames: 4,
        recoveryFrames: 12,
        hitstopFrames: 6
    };
    private hitstopActive: boolean = false;

    constructor(config?: CombatStateConfig) {
        if (config) {
            this.config = { ...this.config, ...config };
        }
    }

    /**
     * Update state machine (call every frame)
     */
    update(dt: number) {
        if (this.hitstopActive) {
            // Hitstop freezes time
            return;
        }

        if (this.timer > 0) {
            this.timer -= dt * 60; // Normalize to 60fps
            if (this.timer <= 0) {
                this.transition();
            }
            return;
        }

        // Auto-transition if state is not IDLE
        if (this.state !== CombatState.IDLE) {
            this.transition();
        }
    }

    /**
     * Transition to next state in cycle
     */
    private transition() {
        const prevState = this.state;

        switch (this.state) {
            case CombatState.TELEGRAPH:
                this.state = CombatState.COMMIT;
                this.timer = this.config.commitFrames || 4;
                bus.emit('COMBAT_STATE_CHANGED', { 
                    from: prevState, 
                    to: this.state,
                    phase: 'commit'
                });
                break;

            case CombatState.COMMIT:
                this.state = CombatState.ACTIVE;
                this.timer = this.config.activeFrames || 4;
                bus.emit('COMBAT_STATE_CHANGED', { 
                    from: prevState, 
                    to: this.state,
                    phase: 'active'
                });
                bus.emit('HITBOX_ACTIVE', { state: this.state });
                break;

            case CombatState.ACTIVE:
                this.state = CombatState.RECOVERY;
                this.timer = this.config.recoveryFrames || 12;
                bus.emit('COMBAT_STATE_CHANGED', { 
                    from: prevState, 
                    to: this.state,
                    phase: 'recovery'
                });
                bus.emit('HITBOX_INACTIVE', { state: this.state });
                break;

            case CombatState.RECOVERY:
                this.state = CombatState.IDLE;
                this.timer = 0;
                bus.emit('COMBAT_STATE_CHANGED', { 
                    from: prevState, 
                    to: this.state,
                    phase: 'idle'
                });
                break;

            case CombatState.HITSTOP:
                // Return to previous state after hitstop
                this.hitstopActive = false;
                this.state = CombatState.ACTIVE;
                this.timer = this.config.activeFrames || 4;
                bus.emit('HITSTOP_END', { state: this.state });
                break;

            default:
                this.state = CombatState.IDLE;
                break;
        }
    }

    /**
     * Trigger an attack (starts telegraph phase)
     */
    trigger(telegraphFrames?: number) {
        if (this.state === CombatState.IDLE || this.state === CombatState.RECOVERY) {
            this.state = CombatState.TELEGRAPH;
            this.timer = telegraphFrames || this.config.telegraphFrames || 8;
            bus.emit('COMBAT_STATE_CHANGED', { 
                from: CombatState.IDLE, 
                to: this.state,
                phase: 'telegraph'
            });
            bus.emit('ATTACK_TELEGRAPHED', { frames: this.timer });
        }
    }

    /**
     * Trigger hitstop (frame freeze on successful hit)
     */
    triggerHitstop() {
        if (this.state === CombatState.ACTIVE) {
            this.hitstopActive = true;
            this.state = CombatState.HITSTOP;
            this.timer = this.config.hitstopFrames || 6;
            bus.emit('HITSTOP_START', { frames: this.timer });
        }
    }

    /**
     * Cancel current attack (return to idle)
     */
    cancel() {
        if (this.state !== CombatState.IDLE) {
            const prevState = this.state;
            this.state = CombatState.IDLE;
            this.timer = 0;
            this.hitstopActive = false;
            bus.emit('COMBAT_STATE_CHANGED', { 
                from: prevState, 
                to: this.state,
                phase: 'cancelled'
            });
        }
    }

    /**
     * Get current state
     */
    getState(): CombatState {
        return this.state;
    }

    /**
     * Check if in active hitbox phase
     */
    isActive(): boolean {
        return this.state === CombatState.ACTIVE;
    }

    /**
     * Check if in vulnerable phase
     */
    isVulnerable(): boolean {
        return this.state === CombatState.RECOVERY || this.state === CombatState.COMMIT;
    }

    /**
     * Get remaining frames in current state
     */
    getRemainingFrames(): number {
        return Math.ceil(this.timer);
    }
}

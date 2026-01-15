/**
 * THE AETERNA COVENANT - BOSS CONTROLLER
 * Rift-Beast AI - Malakor the Silencer
 * 3-Phase Rage Logic with Telegraph Windows
 */

import { bus } from '../core/EventBus';
import { CombatStateMachine, CombatState } from '../core/CombatStateMachine';

export interface BossPhase {
    phase: number;
    hpThreshold: number;
    attackPatterns: string[];
    telegraphTime: number;
    movementSpeed: number;
    aggression: number;
}

export interface PlayerPosition {
    x: number;
    y: number;
}

export class BossController {
    public phase: number = 1;
    public hp: number = 500;
    public maxHp: number = 500;
    public position: { x: number; y: number } = { x: 0, y: 0 };
    public rageLevel: number = 0;
    
    private combatState: CombatStateMachine;
    private attackCooldown: number = 0;
    private currentAttack: string | null = null;
    private phases: BossPhase[] = [
        {
            phase: 1,
            hpThreshold: 350,
            attackPatterns: ['erasure_beam', 'void_slam', 'silence_wave'],
            telegraphTime: 12,
            movementSpeed: 2.0,
            aggression: 0.5
        },
        {
            phase: 2,
            hpThreshold: 150,
            attackPatterns: ['erasure_beam', 'void_slam', 'silence_wave', 'memory_rip', 'void_vortex'],
            telegraphTime: 8,
            movementSpeed: 3.5,
            aggression: 0.8
        },
        {
            phase: 3,
            hpThreshold: 0,
            attackPatterns: ['erasure_beam', 'void_slam', 'silence_wave', 'memory_rip', 'void_vortex', 'absolute_silence'],
            telegraphTime: 6,
            movementSpeed: 5.0,
            aggression: 1.2
        }
    ];

    constructor() {
        this.combatState = new CombatStateMachine({
            telegraphFrames: 12,
            commitFrames: 4,
            activeFrames: 6,
            recoveryFrames: 20
        });
    }

    /**
     * Update boss AI
     */
    update(playerPos: PlayerPosition, dt: number) {
        // Update phase based on HP
        this.updatePhase();

        // Update combat state
        this.combatState.update(dt);

        // Update attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown -= dt * 60;
        }

        // Calculate distance to player
        const distance = Math.sqrt(
            Math.pow(playerPos.x - this.position.x, 2) + 
            Math.pow(playerPos.y - this.position.y, 2)
        );

        // Movement logic
        if (this.combatState.getState() === CombatState.IDLE && this.attackCooldown <= 0) {
            this.moveTowardsPlayer(playerPos, dt);
        }

        // Attack logic
        if (this.combatState.getState() === CombatState.IDLE && this.attackCooldown <= 0) {
            this.decideAttack(distance);
        }

        // Update rage level
        this.rageLevel = ((this.maxHp - this.hp) / this.maxHp) * 100;

        // Emit boss state update
        bus.emit('BOSS_UPDATE', {
            phase: this.phase,
            hp: this.hp,
            maxHp: this.maxHp,
            position: this.position,
            rageLevel: this.rageLevel,
            currentAttack: this.currentAttack,
            state: this.combatState.getState()
        });
    }

    /**
     * Update boss phase based on HP
     */
    private updatePhase() {
        const currentPhase = this.phases.find(p => this.hp > p.hpThreshold);
        if (currentPhase && currentPhase.phase !== this.phase) {
            this.phase = currentPhase.phase;
            bus.emit('BOSS_PHASE_CHANGE', { 
                phase: this.phase,
                hp: this.hp
            });
        }
    }

    /**
     * Move towards player
     */
    private moveTowardsPlayer(playerPos: PlayerPosition, dt: number) {
        const currentPhase = this.phases[this.phase - 1];
        const speed = currentPhase.movementSpeed * dt * 60;

        const dx = playerPos.x - this.position.x;
        const dy = playerPos.y - this.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            this.position.x += (dx / distance) * speed;
            this.position.y += (dy / distance) * speed;
        }
    }

    /**
     * Decide which attack to use
     */
    private decideAttack(distance: number) {
        const currentPhase = this.phases[this.phase - 1];
        const attackPatterns = currentPhase.attackPatterns;

        // Select attack based on distance and phase
        let selectedAttack: string;

        if (distance > 300) {
            // Long range
            selectedAttack = 'erasure_beam';
        } else if (distance < 100) {
            // Close range
            selectedAttack = this.phase >= 2 ? 'void_slam' : 'silence_wave';
        } else {
            // Mid range
            selectedAttack = attackPatterns[Math.floor(Math.random() * attackPatterns.length)];
        }

        this.executeAttack(selectedAttack, currentPhase);
    }

    /**
     * Execute attack
     */
    private executeAttack(attackName: string, phase: BossPhase) {
        this.currentAttack = attackName;
        this.combatState.trigger(phase.telegraphTime);
        this.attackCooldown = 30 + (phase.telegraphTime * 2);

        bus.emit('BOSS_ATTACK_TELEGRAPH', {
            attack: attackName,
            telegraphTime: phase.telegraphTime,
            phase: this.phase
        });

        // Emit attack-specific events
        switch (attackName) {
            case 'erasure_beam':
                bus.emit('BOSS_ERASURE_BEAM', { phase: this.phase });
                break;
            case 'void_slam':
                bus.emit('BOSS_VOID_SLAM', { phase: this.phase });
                break;
            case 'silence_wave':
                bus.emit('BOSS_SILENCE_WAVE', { phase: this.phase });
                break;
            case 'memory_rip':
                bus.emit('BOSS_MEMORY_RIP', { phase: this.phase });
                break;
            case 'void_vortex':
                bus.emit('BOSS_VOID_VORTEX', { phase: this.phase });
                break;
            case 'absolute_silence':
                bus.emit('BOSS_ABSOLUTE_SILENCE', { phase: this.phase });
                break;
        }
    }

    /**
     * Take damage
     */
    takeDamage(amount: number) {
        this.hp = Math.max(0, this.hp - amount);
        bus.emit('BOSS_DAMAGED', { 
            damage: amount, 
            remainingHp: this.hp,
            phase: this.phase
        });

        if (this.hp <= 0) {
            this.die();
        }
    }

    /**
     * Boss defeated
     */
    private die() {
        bus.emit('BOSS_DEFEATED', { 
            phase: this.phase,
            finalHp: this.hp
        });
    }

    /**
     * Reset boss to initial state
     */
    reset() {
        this.phase = 1;
        this.hp = this.maxHp;
        this.rageLevel = 0;
        this.attackCooldown = 0;
        this.currentAttack = null;
        this.combatState.cancel();
        this.position = { x: 0, y: 0 };
    }

    /**
     * Get current phase config
     */
    getCurrentPhase(): BossPhase {
        return this.phases[this.phase - 1];
    }
}

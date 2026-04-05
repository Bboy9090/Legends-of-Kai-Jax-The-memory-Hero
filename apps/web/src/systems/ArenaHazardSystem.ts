/**
 * LEGENDS OF KAI-JAX: THE MEMORY KING - ARENA HAZARD SYSTEM
 * Fracture Pit Logic - Crack Lanes and Rift Bubbles
 * The arena itself becomes the enemy.
 */

import { bus } from '../core/EventBus';

export interface CrackLane {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    active: boolean;
    damage: number;
    lifetime: number;
}

export interface RiftBubble {
    id: string;
    x: number;
    y: number;
    radius: number;
    active: boolean;
    damage: number;
    lifetime: number;
    expansionRate: number;
}

export class ArenaHazardSystem {
    private crackLanes: CrackLane[] = [];
    private riftBubbles: RiftBubble[] = [];
    private spawnTimer: number = 0;
    private spawnInterval: number = 5.0; // seconds

    /**
     * Update all hazards
     */
    update(dt: number) {
        // Update crack lanes
        this.crackLanes.forEach(lane => {
            lane.lifetime -= dt;
            if (lane.lifetime <= 0) {
                lane.active = false;
            }
        });

        // Update rift bubbles
        this.riftBubbles.forEach(bubble => {
            bubble.lifetime -= dt;
            bubble.radius += bubble.expansionRate * dt;
            
            if (bubble.lifetime <= 0) {
                bubble.active = false;
            }
        });

        // Remove inactive hazards
        this.crackLanes = this.crackLanes.filter(lane => lane.active);
        this.riftBubbles = this.riftBubbles.filter(bubble => bubble.active);

        // Spawn new hazards
        this.spawnTimer += dt;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnRandomHazard();
            this.spawnTimer = 0;
        }

        // Emit hazard update
        bus.emit('ARENA_HAZARDS_UPDATE', {
            crackLanes: this.crackLanes,
            riftBubbles: this.riftBubbles
        });
    }

    /**
     * Spawn a random hazard
     */
    private spawnRandomHazard() {
        const rand = Math.random();
        if (rand < 0.6) {
            this.spawnCrackLane();
        } else {
            this.spawnRiftBubble();
        }
    }

    /**
     * Spawn a crack lane
     */
    spawnCrackLane(x?: number, y?: number, width?: number, height?: number) {
        const lane: CrackLane = {
            id: `crack_${Date.now()}_${Math.random()}`,
            x: x ?? Math.random() * 800,
            y: y ?? Math.random() * 600,
            width: width ?? 100 + Math.random() * 200,
            height: height ?? 20,
            active: true,
            damage: 10,
            lifetime: 8.0
        };

        this.crackLanes.push(lane);
        bus.emit('CRACK_LANE_SPAWNED', { lane });
    }

    /**
     * Spawn a rift bubble
     */
    spawnRiftBubble(x?: number, y?: number, radius?: number) {
        const bubble: RiftBubble = {
            id: `rift_${Date.now()}_${Math.random()}`,
            x: x ?? Math.random() * 800,
            y: y ?? Math.random() * 600,
            radius: radius ?? 30,
            active: true,
            damage: 15,
            lifetime: 6.0,
            expansionRate: 10.0
        };

        this.riftBubbles.push(bubble);
        bus.emit('RIFT_BUBBLE_SPAWNED', { bubble });
    }

    /**
     * Check collision with entity
     */
    checkCollision(entityX: number, entityY: number, entityW: number, entityH: number): { 
        hit: boolean; 
        damage: number; 
        hazardType: string 
    } {
        // Check crack lanes
        for (const lane of this.crackLanes) {
            if (lane.active && this.checkCrackCollision(entityX, entityY, entityW, entityH, lane)) {
                return {
                    hit: true,
                    damage: lane.damage,
                    hazardType: 'crack'
                };
            }
        }

        // Check rift bubbles
        for (const bubble of this.riftBubbles) {
            if (bubble.active && this.checkBubbleCollision(entityX, entityY, entityW, entityH, bubble)) {
                return {
                    hit: true,
                    damage: bubble.damage,
                    hazardType: 'rift'
                };
            }
        }

        return { hit: false, damage: 0, hazardType: '' };
    }

    /**
     * Check collision with crack lane
     */
    private checkCrackCollision(ex: number, ey: number, ew: number, eh: number, lane: CrackLane): boolean {
        return (
            ex < lane.x + lane.width &&
            ex + ew > lane.x &&
            ey < lane.y + lane.height &&
            ey + eh > lane.y
        );
    }

    /**
     * Check collision with rift bubble
     */
    private checkBubbleCollision(ex: number, ey: number, ew: number, eh: number, bubble: RiftBubble): boolean {
        const centerX = ex + ew / 2;
        const centerY = ey + eh / 2;
        const distance = Math.sqrt(
            Math.pow(centerX - bubble.x, 2) + 
            Math.pow(centerY - bubble.y, 2)
        );
        return distance < bubble.radius;
    }

    /**
     * Clear all hazards
     */
    clearAll() {
        this.crackLanes = [];
        this.riftBubbles = [];
        bus.emit('ARENA_HAZARDS_CLEARED', {});
    }

    /**
     * Get all active hazards
     */
    getActiveHazards() {
        return {
            crackLanes: this.crackLanes.filter(l => l.active),
            riftBubbles: this.riftBubbles.filter(b => b.active)
        };
    }
}

// Singleton instance
export const arenaHazardSystem = new ArenaHazardSystem();

/**
 * THE AETERNA COVENANT - ARENA HAZARD SYSTEM
 * 
 * The Fracture Pit Logic. Crack Lanes and Rift Bubbles.
 * The arena itself becomes the enemy.
 */

import { bus } from '../core/EventBus';
import { Events } from '../core/EventBus';

export interface CrackLane {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean;
  damage: number;
  timer: number;
}

export interface RiftBubble {
  id: string;
  x: number;
  y: number;
  radius: number;
  active: boolean;
  damage: number;
  lifetime: number;
  velocity: { x: number; y: number };
}

export class ArenaHazardSystem {
  private crackLanes: CrackLane[] = [];
  private riftBubbles: RiftBubble[] = [];
  private spawnTimer: number = 0;
  private readonly spawnInterval: number = 300; // Frames between spawns
  private readonly maxCrackLanes: number = 5;
  private readonly maxRiftBubbles: number = 8;

  /**
   * Update hazard system (call every frame)
   */
  update(deltaTime: number, arenaBounds: { width: number; height: number }): void {
    // Update spawn timer
    this.spawnTimer += deltaTime * 60;

    // Spawn new hazards
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnHazards(arenaBounds);
    }

    // Update crack lanes
    this.crackLanes.forEach(lane => {
      lane.timer -= deltaTime * 60;
      if (lane.timer <= 0) {
        lane.active = !lane.active; // Toggle active state
        lane.timer = lane.active ? 120 : 60; // Active for 2s, inactive for 1s
      }
    });

    // Update rift bubbles
    this.riftBubbles.forEach(bubble => {
      bubble.lifetime -= deltaTime * 60;
      bubble.x += bubble.velocity.x * deltaTime * 60;
      bubble.y += bubble.velocity.y * deltaTime * 60;

      // Remove expired bubbles
      if (bubble.lifetime <= 0) {
        this.removeRiftBubble(bubble.id);
      }

      // Bounce off arena bounds
      if (bubble.x - bubble.radius < 0 || bubble.x + bubble.radius > arenaBounds.width) {
        bubble.velocity.x *= -1;
      }
      if (bubble.y - bubble.radius < 0 || bubble.y + bubble.radius > arenaBounds.height) {
        bubble.velocity.y *= -1;
      }
    });

    // Clean up expired hazards
    this.cleanup();
  }

  /**
   * Spawn new hazards
   */
  private spawnHazards(arenaBounds: { width: number; height: number }): void {
    // Spawn crack lane if under limit
    if (this.crackLanes.length < this.maxCrackLanes && Math.random() > 0.5) {
      this.spawnCrackLane(arenaBounds);
    }

    // Spawn rift bubble if under limit
    if (this.riftBubbles.length < this.maxRiftBubbles && Math.random() > 0.6) {
      this.spawnRiftBubble(arenaBounds);
    }
  }

  /**
   * Spawn a crack lane
   */
  private spawnCrackLane(arenaBounds: { width: number; height: number }): void {
    const lane: CrackLane = {
      id: `crack_${Date.now()}_${Math.random()}`,
      x: Math.random() * (arenaBounds.width - 100),
      y: Math.random() * (arenaBounds.height - 20),
      width: 80 + Math.random() * 40,
      height: 15,
      active: false,
      damage: 10,
      timer: 60 + Math.random() * 60 // Start inactive
    };

    this.crackLanes.push(lane);
    bus.emit(Events.CRACK_LANE, { lane, spawned: true });
  }

  /**
   * Spawn a rift bubble
   */
  private spawnRiftBubble(arenaBounds: { width: number; height: number }): void {
    const bubble: RiftBubble = {
      id: `rift_${Date.now()}_${Math.random()}`,
      x: Math.random() * arenaBounds.width,
      y: Math.random() * arenaBounds.height,
      radius: 20 + Math.random() * 15,
      active: true,
      damage: 15,
      lifetime: 300 + Math.random() * 180, // 5-8 seconds
      velocity: {
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2
      }
    };

    this.riftBubbles.push(bubble);
    bus.emit(Events.RIFT_BUBBLE, { bubble, spawned: true });
  }

  /**
   * Check collision with player
   */
  checkPlayerCollision(playerPos: { x: number; y: number }, playerSize: { width: number; height: number }): {
    hit: boolean;
    damage: number;
    type: 'crack' | 'rift' | null;
  } {
    // Check crack lanes
    for (const lane of this.crackLanes) {
      if (!lane.active) continue;

      if (
        playerPos.x < lane.x + lane.width &&
        playerPos.x + playerSize.width > lane.x &&
        playerPos.y < lane.y + lane.height &&
        playerPos.y + playerSize.height > lane.y
      ) {
        bus.emit(Events.HAZARD_SPAWN, { type: 'crack', damage: lane.damage });
        return { hit: true, damage: lane.damage, type: 'crack' };
      }
    }

    // Check rift bubbles
    for (const bubble of this.riftBubbles) {
      if (!bubble.active) continue;

      const dx = playerPos.x - bubble.x;
      const dy = playerPos.y - bubble.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const minDistance = bubble.radius + Math.max(playerSize.width, playerSize.height) / 2;

      if (distance < minDistance) {
        bus.emit(Events.HAZARD_SPAWN, { type: 'rift', damage: bubble.damage });
        return { hit: true, damage: bubble.damage, type: 'rift' };
      }
    }

    return { hit: false, damage: 0, type: null };
  }

  /**
   * Remove crack lane
   */
  private removeCrackLane(id: string): void {
    const index = this.crackLanes.findIndex(lane => lane.id === id);
    if (index !== -1) {
      const lane = this.crackLanes[index];
      this.crackLanes.splice(index, 1);
      bus.emit(Events.CRACK_LANE, { lane, spawned: false });
    }
  }

  /**
   * Remove rift bubble
   */
  private removeRiftBubble(id: string): void {
    const index = this.riftBubbles.findIndex(bubble => bubble.id === id);
    if (index !== -1) {
      const bubble = this.riftBubbles[index];
      this.riftBubbles.splice(index, 1);
      bus.emit(Events.RIFT_BUBBLE, { bubble, spawned: false });
    }
  }

  /**
   * Clean up expired hazards
   */
  private cleanup(): void {
    // Remove inactive crack lanes after extended period
    this.crackLanes = this.crackLanes.filter(lane => {
      if (!lane.active && lane.timer < -300) {
        bus.emit(Events.CRACK_LANE, { lane, spawned: false });
        return false;
      }
      return true;
    });
  }

  /**
   * Get all active hazards
   */
  getHazards(): { crackLanes: CrackLane[]; riftBubbles: RiftBubble[] } {
    return {
      crackLanes: this.crackLanes.filter(lane => lane.active),
      riftBubbles: this.riftBubbles.filter(bubble => bubble.active)
    };
  }

  /**
   * Clear all hazards
   */
  clearAll(): void {
    this.crackLanes.forEach(lane => {
      bus.emit(Events.CRACK_LANE, { lane, spawned: false });
    });
    this.riftBubbles.forEach(bubble => {
      bus.emit(Events.RIFT_BUBBLE, { bubble, spawned: false });
    });

    this.crackLanes = [];
    this.riftBubbles = [];
    this.spawnTimer = 0;
  }

  /**
   * Reset system
   */
  reset(): void {
    this.clearAll();
  }
}

// Singleton instance
export const arenaHazardSystem = new ArenaHazardSystem();

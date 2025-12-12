import * as THREE from "three";

export interface GameObject {
  id: string;
  position: THREE.Vector3;
  size: THREE.Vector3;
  type: "obstacle" | "enemy" | "coin" | "helpToken" | "powerup";
  active: boolean;
}

export interface Obstacle extends GameObject {
  type: "obstacle";
  obstacleType: "car" | "barrier" | "sign";
}

export interface Enemy extends GameObject {
  type: "enemy";
  enemyType: "scuttle" | "stomper" | "goo";
  health: number;
  speed: number;
}

export interface Collectible extends GameObject {
  type: "coin" | "helpToken" | "powerup";
  value: number;
}

// Collision detection using AABB
export function checkAABBCollision(
  pos1: THREE.Vector3, 
  size1: THREE.Vector3, 
  pos2: THREE.Vector3, 
  size2: THREE.Vector3
): boolean {
  return (
    pos1.x - size1.x/2 < pos2.x + size2.x/2 &&
    pos1.x + size1.x/2 > pos2.x - size2.x/2 &&
    pos1.y - size1.y/2 < pos2.y + size2.y/2 &&
    pos1.y + size1.y/2 > pos2.y - size2.y/2 &&
    pos1.z - size1.z/2 < pos2.z + size2.z/2 &&
    pos1.z + size1.z/2 > pos2.z - size2.z/2
  );
}

// Generate random obstacles for endless runner
export function generateObstacle(zPosition: number): Obstacle {
  const lanes = [-4, 0, 4];
  const randomLane = lanes[Math.floor(Math.random() * lanes.length)];
  const obstacleTypes = ["car", "barrier", "sign"] as const;
  const randomType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
  
  return {
    id: `obstacle_${Date.now()}_${Math.random()}`,
    position: new THREE.Vector3(randomLane, 0, zPosition),
    size: new THREE.Vector3(2, 2, 3),
    type: "obstacle",
    obstacleType: randomType,
    active: true
  };
}

// Generate random enemies
export function generateEnemy(zPosition: number): Enemy {
  const lanes = [-4, 0, 4];
  const randomLane = lanes[Math.floor(Math.random() * lanes.length)];
  const enemyTypes = ["scuttle", "stomper", "goo"] as const;
  const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
  
  return {
    id: `enemy_${Date.now()}_${Math.random()}`,
    position: new THREE.Vector3(randomLane, 0, zPosition),
    size: new THREE.Vector3(1.5, 1.5, 1.5),
    type: "enemy",
    enemyType: randomType,
    health: randomType === "stomper" ? 2 : 1,
    speed: randomType === "scuttle" ? 15 : 8,
    active: true
  };
}

// Generate collectibles
export function generateCollectible(zPosition: number, type: "coin" | "helpToken"): Collectible {
  const lanes = [-4, 0, 4];
  const randomLane = lanes[Math.floor(Math.random() * lanes.length)];
  
  return {
    id: `collectible_${type}_${Date.now()}_${Math.random()}`,
    position: new THREE.Vector3(randomLane, type === "coin" ? 1 : 1.5, zPosition),
    size: new THREE.Vector3(0.8, 0.8, 0.8),
    type: type,
    value: type === "coin" ? 10 : 1,
    active: true
  };
}

// Calculate distance between two points
export function getDistance(pos1: THREE.Vector3, pos2: THREE.Vector3): number {
  return pos1.distanceTo(pos2);
}

// Mobile performance optimization
export function optimizeForMobile() {
  return {
    maxObjects: 20,
    cullDistance: 50,
    reducedParticles: true,
    simplifiedShaders: true
  };
}

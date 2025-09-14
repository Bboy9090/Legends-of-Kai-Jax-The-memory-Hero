import { useFrame } from "@react-three/fiber";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";

import Player from "./Player";
import Environment from "./Environment";
import Enemy from "./Enemy";
import Collectibles from "./Collectibles";
import { useRunner } from "../../lib/stores/useRunner";
import { useGame } from "../../lib/stores/useGame";
import { useAudio } from "../../lib/stores/useAudio";
import { 
  generateObstacle, 
  generateEnemy, 
  generateCollectible, 
  checkAABBCollision,
  type GameObject,
  type Obstacle,
  type Enemy as EnemyType,
  type Collectible
} from "../../lib/gameLogic";

export default function GameScene() {
  const { player, updatePlayerPosition, addScore, collectCoin, collectHelpToken, gameState } = useRunner();
  const { phase, end } = useGame();
  const { playHit, playSuccess } = useAudio();
  
  const cameraRef = useRef<THREE.Camera>(null);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [enemies, setEnemies] = useState<EnemyType[]>([]);
  const [collectibles, setCollectibles] = useState<Collectible[]>([]);
  
  // Track game objects generation
  const lastObstacleZ = useRef(0);
  const lastEnemyZ = useRef(0);
  const lastCollectibleZ = useRef(0);
  
  // Initialize game objects
  useEffect(() => {
    if (gameState === "playing") {
      // Generate initial objects
      const initialObstacles: Obstacle[] = [];
      const initialEnemies: EnemyType[] = [];
      const initialCollectibles: Collectible[] = [];
      
      for (let i = 1; i <= 10; i++) {
        const z = i * 20;
        
        if (Math.random() < 0.3) {
          initialObstacles.push(generateObstacle(z));
        }
        
        if (Math.random() < 0.2) {
          initialEnemies.push(generateEnemy(z));
        }
        
        if (Math.random() < 0.4) {
          const type = Math.random() < 0.7 ? "coin" : "helpToken";
          initialCollectibles.push(generateCollectible(z, type));
        }
      }
      
      setObstacles(initialObstacles);
      setEnemies(initialEnemies);
      setCollectibles(initialCollectibles);
      
      lastObstacleZ.current = 200;
      lastEnemyZ.current = 200;
      lastCollectibleZ.current = 200;
    }
  }, [gameState]);
  
  useFrame((state, delta) => {
    if (gameState !== "playing") return;
    
    // Update player position
    updatePlayerPosition(delta);
    
    // Update camera to follow player
    if (cameraRef.current) {
      cameraRef.current.position.z = player.z + 12;
      cameraRef.current.position.x = player.x * 0.1; // Slight camera movement with lane changes
    }
    
    // Generate new objects ahead of player
    const playerZ = player.z;
    
    // Generate obstacles
    if (playerZ > lastObstacleZ.current - 100) {
      if (Math.random() < 0.3) {
        const newObstacle = generateObstacle(lastObstacleZ.current + 30);
        setObstacles(prev => [...prev, newObstacle]);
      }
      lastObstacleZ.current += 20;
    }
    
    // Generate enemies
    if (playerZ > lastEnemyZ.current - 100) {
      if (Math.random() < 0.25) {
        const newEnemy = generateEnemy(lastEnemyZ.current + 25);
        setEnemies(prev => [...prev, newEnemy]);
      }
      lastEnemyZ.current += 15;
    }
    
    // Generate collectibles
    if (playerZ > lastCollectibleZ.current - 80) {
      if (Math.random() < 0.5) {
        const type = Math.random() < 0.7 ? "coin" : "helpToken";
        const newCollectible = generateCollectible(lastCollectibleZ.current + 20, type);
        setCollectibles(prev => [...prev, newCollectible]);
      }
      lastCollectibleZ.current += 15;
    }
    
    // Collision detection
    const playerPos = new THREE.Vector3(player.x, player.y, player.z);
    const playerSize = new THREE.Vector3(1.2, 1.8, 1.2);
    
    // Check obstacle collisions (skip during startup grace period)
    if (player.z > 10) {
      obstacles.forEach(obstacle => {
        if (obstacle.active && checkAABBCollision(playerPos, playerSize, obstacle.position, obstacle.size)) {
          // Player hit obstacle - game over
          console.log("Hit obstacle! Player Z:", player.z, "Obstacle:", obstacle);
          playHit();
          end();
        }
      });
    }
    
    // Check enemy collisions
    setEnemies(prev => prev.map(enemy => {
      if (enemy.active && checkAABBCollision(playerPos, playerSize, enemy.position, enemy.size)) {
        // Player defeated enemy
        console.log("Defeated enemy!");
        playSuccess();
        addScore(20);
        return { ...enemy, active: false };
      }
      return enemy;
    }));
    
    // Check collectible collisions
    setCollectibles(prev => prev.map(collectible => {
      if (collectible.active && checkAABBCollision(playerPos, playerSize, collectible.position, collectible.size)) {
        console.log(`Collected ${collectible.type}!`);
        playSuccess();
        
        if (collectible.type === "coin") {
          collectCoin();
        } else if (collectible.type === "helpToken") {
          collectHelpToken();
        }
        
        return { ...collectible, active: false };
      }
      return collectible;
    }));
    
    // Remove objects behind player
    const cullDistance = 50;
    setObstacles(prev => prev.filter(obj => obj.position.z > playerZ - cullDistance));
    setEnemies(prev => prev.filter(obj => obj.position.z > playerZ - cullDistance));
    setCollectibles(prev => prev.filter(obj => obj.position.z > playerZ - cullDistance));
  });
  
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 20, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      
      {/* Camera reference - removed to fix TypeScript error */}
      
      {/* Game environment */}
      <Environment playerZ={player.z} />
      
      {/* Player character */}
      <Player />
      
      {/* Obstacles */}
      {obstacles.map(obstacle => (
        <group key={obstacle.id} position={obstacle.position}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[obstacle.size.x, obstacle.size.y, obstacle.size.z]} />
            <meshLambertMaterial color={
              obstacle.obstacleType === "car" ? "#ff4444" :
              obstacle.obstacleType === "barrier" ? "#ffaa00" : "#666666"
            } />
          </mesh>
        </group>
      ))}
      
      {/* Enemies */}
      {enemies.map(enemy => (
        <Enemy key={enemy.id} enemy={enemy} />
      ))}
      
      {/* Collectibles */}
      {collectibles.map(collectible => (
        <Collectibles key={collectible.id} collectible={collectible} />
      ))}
    </>
  );
}

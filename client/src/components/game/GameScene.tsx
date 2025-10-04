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
  
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [enemies, setEnemies] = useState<EnemyType[]>([]);
  const [collectibles, setCollectibles] = useState<Collectible[]>([]);
  const [webAnchors, setWebAnchors] = useState<Array<{ id: string; position: [number, number, number] }>>([]);
  
  // Track game objects generation - using X for 2.5D side-scrolling
  const lastObstacleX = useRef(0);
  const lastEnemyX = useRef(0);
  const lastCollectibleX = useRef(0);
  const lastWebAnchorX = useRef(0);
  
  // Initialize game objects for 2.5D side-scrolling
  useEffect(() => {
    if (gameState === "playing") {
      // Generate initial web anchors and objects
      const initialWebAnchors: Array<{ id: string; position: [number, number, number] }> = [];
      const initialObstacles: Obstacle[] = [];
      const initialEnemies: EnemyType[] = [];
      const initialCollectibles: Collectible[] = [];
      
      for (let i = 3; i <= 15; i++) {
        const x = i * 20; // Side-scrolling uses X-axis
        
        // Generate web anchor points for swinging
        if (i % 2 === 0) {
          const anchorY = 8 + Math.random() * 4; // Varying heights
          initialWebAnchors.push({
            id: `anchor-${i}`,
            position: [x, anchorY, 0]
          });
        }
        
        // Platform obstacles
        if (Math.random() < 0.15) {
          const obstacleX = x + Math.random() * 10;
          const obstacleY = Math.random() * 5; // Ground level obstacles
          initialObstacles.push({
            ...generateObstacle(obstacleX),
            position: new THREE.Vector3(obstacleX, obstacleY, 0),
            size: new THREE.Vector3(2, 2, 1)
          });
        }
        
        // Flying enemies
        if (Math.random() < 0.2) {
          const enemyX = x + Math.random() * 15;
          const enemyY = 3 + Math.random() * 8;
          initialEnemies.push({
            ...generateEnemy(enemyX),
            position: new THREE.Vector3(enemyX, enemyY, 0),
            size: new THREE.Vector3(1.5, 1.5, 1)
          });
        }
        
        // Collectibles in the air
        if (Math.random() < 0.4) {
          const type = Math.random() < 0.7 ? "coin" : "helpToken";
          const collectX = x + Math.random() * 12;
          const collectY = 2 + Math.random() * 10;
          initialCollectibles.push({
            ...generateCollectible(collectX, type),
            position: new THREE.Vector3(collectX, collectY, 0),
            size: new THREE.Vector3(0.8, 0.8, 0.8)
          });
        }
      }
      
      setWebAnchors(initialWebAnchors);
      setObstacles(initialObstacles);
      setEnemies(initialEnemies);
      setCollectibles(initialCollectibles);
      
      lastObstacleX.current = 300;
      lastEnemyX.current = 300;
      lastCollectibleX.current = 300;
      lastWebAnchorX.current = 300;
    }
  }, [gameState]);
  
  useFrame((state, delta) => {
    if (gameState !== "playing") return;
    
    // Update player position
    updatePlayerPosition(delta);
    
    // 2.5D Side-view Camera - follows player horizontally
    const cameraX = player.x + 5; // Camera slightly ahead of player
    const cameraY = 8; // Fixed height for side view
    const cameraZ = 15; // Fixed depth for 2.5D perspective
    
    state.camera.position.set(cameraX, cameraY, cameraZ);
    state.camera.lookAt(player.x, player.y, 0); // Look at player position
    
    // Generate new objects ahead of player (2.5D uses X-axis)
    const playerX = player.x;
    
    // Generate web anchor points
    if (playerX > lastWebAnchorX.current - 50) {
      const anchorX = lastWebAnchorX.current + 20;
      const anchorY = 6 + Math.random() * 6;
      setWebAnchors(prev => [...prev, {
        id: `anchor-${Date.now()}`,
        position: [anchorX, anchorY, 0]
      }]);
      lastWebAnchorX.current += 20;
    }
    
    // Generate obstacles
    if (playerX > lastObstacleX.current - 100) {
      if (Math.random() < 0.2) {
        const obstacleX = lastObstacleX.current + 30;
        const obstacleY = Math.random() * 5;
        setObstacles(prev => [...prev, {
          ...generateObstacle(obstacleX),
          position: new THREE.Vector3(obstacleX, obstacleY, 0),
          size: new THREE.Vector3(2, 2, 1)
        }]);
      }
      lastObstacleX.current += 20;
    }
    
    // Generate enemies
    if (playerX > lastEnemyX.current - 100) {
      if (Math.random() < 0.25) {
        const enemyX = lastEnemyX.current + 25;
        const enemyY = 3 + Math.random() * 8;
        setEnemies(prev => [...prev, {
          ...generateEnemy(enemyX),
          position: new THREE.Vector3(enemyX, enemyY, 0),
          size: new THREE.Vector3(1.5, 1.5, 1)
        }]);
      }
      lastEnemyX.current += 15;
    }
    
    // Generate collectibles
    if (playerX > lastCollectibleX.current - 80) {
      if (Math.random() < 0.5) {
        const type = Math.random() < 0.7 ? "coin" : "helpToken";
        const collectX = lastCollectibleX.current + 20;
        const collectY = 2 + Math.random() * 10;
        setCollectibles(prev => [...prev, {
          ...generateCollectible(collectX, type),
          position: new THREE.Vector3(collectX, collectY, 0),
          size: new THREE.Vector3(0.8, 0.8, 0.8)
        }]);
      }
      lastCollectibleX.current += 15;
    }
    
    // Collision detection
    const playerPos = new THREE.Vector3(player.x, player.y, player.z);
    const playerSize = new THREE.Vector3(1.2, 1.8, 1.2);
    
    // Check obstacle collisions (skip during startup grace period)
    if (player.x > 20) {
      obstacles.forEach(obstacle => {
        if (obstacle.active && checkAABBCollision(playerPos, playerSize, obstacle.position, obstacle.size)) {
          // Player hit obstacle - game over
          console.log("Hit obstacle! Player X:", player.x, "Obstacle:", obstacle);
          playHit();
          end();
        }
      });
    }
    
    // Check web anchor proximity for auto-attach
    if (!player.webAttached && player.webButtonPressed) {
      const nearestAnchor = webAnchors.find(anchor => {
        const distance = Math.sqrt(
          Math.pow(anchor.position[0] - player.x, 2) +
          Math.pow(anchor.position[1] - player.y, 2)
        );
        return distance < 20; // Attach range
      });
      
      if (nearestAnchor) {
        useRunner.getState().attachWeb(nearestAnchor.position);
      }
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
    
    // Remove objects behind player (2.5D uses X-axis)
    const cullDistance = 50;
    setObstacles(prev => prev.filter(obj => obj.position.x > playerX - cullDistance));
    setEnemies(prev => prev.filter(obj => obj.position.x > playerX - cullDistance));
    setCollectibles(prev => prev.filter(obj => obj.position.x > playerX - cullDistance));
    setWebAnchors(prev => prev.filter(anchor => anchor.position[0] > playerX - cullDistance));
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
      
      {/* Web Anchor Points - for Spider-Man style swinging */}
      {webAnchors.map(anchor => (
        <group key={anchor.id} position={anchor.position}>
          {/* Anchor point indicator */}
          <mesh>
            <sphereGeometry args={[0.5, 16, 12]} />
            <meshToonMaterial 
              color="#00CED1" 
              emissive="#00CED1"
              emissiveIntensity={0.5}
            />
          </mesh>
          {/* Glowing ring effect */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.6, 0.8, 16]} />
            <meshBasicMaterial 
              color="#00FFFF"
              transparent
              opacity={0.6}
            />
          </mesh>
          {/* Pulsing outer ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.9, 1.2, 16]} />
            <meshBasicMaterial 
              color="#40E0D0"
              transparent
              opacity={0.3}
            />
          </mesh>
        </group>
      ))}
    </>
  );
}
